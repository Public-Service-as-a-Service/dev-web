#!/usr/bin/env python3
"""Fill licence gaps in the committed SBOMs from the npm registry.

Most remaining gaps are packages that were never installed on the scanning
platform -- per-platform binaries shipped as optionalDependencies, wasm variants,
macOS-only helpers like fsevents. Trivy reads licences from
node_modules/<pkg>/package.json, so a package that is in the lockfile but not on
disk has no licence to read. That is a limitation of scanning, not a genuinely
unknown licence: the package declares one in its own metadata on the registry.

This script looks those up and records the answer in license-overrides.json.
The network call happens here, at curation time -- never during a scan. The
committed map is what the scheduled run consumes, so scanning stays offline and
byte-for-byte reproducible.

Keyed by name@version where a package's versions disagree on the licence, and by
bare name where they all agree, so a relicensing upstream cannot be flattened
into a wrong answer for older versions.

Usage:
    fill-license-overrides.py [--dry-run] [--limit N]
"""

import argparse
import glob
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OVERRIDES = os.path.join(ROOT, "scripts", "license-overrides.json")
REGISTRY = "https://registry.npmjs.org"
MISSING_LICENSES = ("", "NONE", "NOASSERTION")


def missing_from_sboms():
    """Return {name: {versions}} for components with no concluded licence."""
    gaps = defaultdict(set)
    for path in sorted(glob.glob(os.path.join(ROOT, "assets", "sbom", "*.spdx.json"))):
        with open(path, encoding="utf-8") as f:
            doc = json.load(f)
        for pkg in doc.get("packages", []):
            if not pkg.get("externalRefs"):
                continue
            licence = pkg.get("licenseConcluded")
            if licence is None or licence in MISSING_LICENSES:
                gaps[pkg.get("name", "")].add(pkg.get("versionInfo", ""))
    gaps.pop("", None)
    return gaps


def fetch(url):
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def registry_licence(name, version):
    """The licence this exact version declares, or None."""
    quoted = urllib.parse.quote(name, safe="")
    try:
        data = fetch(f"{REGISTRY}/{quoted}/{urllib.parse.quote(version, safe='')}")
    except urllib.error.HTTPError:
        return None
    except urllib.error.URLError as exc:
        raise SystemExit(f"registry unreachable: {exc}")
    licence = data.get("license")
    # Very old packages use {"type": "MIT"} or a list of such objects.
    if isinstance(licence, dict):
        licence = licence.get("type")
    elif isinstance(licence, list):
        types = [x.get("type") if isinstance(x, dict) else x for x in licence]
        types = [t for t in types if t]
        licence = " OR ".join(types) if types else None
    if isinstance(licence, str) and licence.strip():
        return licence.strip()
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    parser.add_argument("--limit", type=int, help="only process the first N packages")
    args = parser.parse_args()

    with open(OVERRIDES, encoding="utf-8") as f:
        data = json.load(f)
    known = data["komponenter"]

    gaps = missing_from_sboms()
    todo = [(n, v) for n, vs in sorted(gaps.items()) for v in sorted(vs)
            if n not in known and f"{n}@{v}" not in known]
    if args.limit:
        todo = todo[:args.limit]
    print(f"{len(gaps)} package(s) without a licence, {len(todo)} lookup(s) to make.")

    found = defaultdict(dict)
    unresolved = []
    for i, (name, version) in enumerate(todo, 1):
        licence = registry_licence(name, version)
        if licence:
            found[name][version] = licence
        else:
            unresolved.append(f"{name}@{version}")
        if i % 25 == 0:
            print(f"  {i}/{len(todo)} …")
        time.sleep(0.05)  # be a polite guest on the public registry

    added = 0
    for name, by_version in sorted(found.items()):
        licences = set(by_version.values())
        if len(licences) == 1:
            known[name] = {"licens": licences.pop(),
                           "källa": f"{REGISTRY}/{urllib.parse.quote(name, safe='')}"}
            added += 1
        else:
            # Versions disagree -- record each, so a relicensing upstream is not
            # flattened into a wrong answer for the older versions.
            for version, licence in sorted(by_version.items()):
                known[f"{name}@{version}"] = {
                    "licens": licence,
                    "källa": f"{REGISTRY}/{urllib.parse.quote(name, safe='')}/{version}"}
                added += 1

    print(f"resolved {added} override(s); {len(unresolved)} still without a licence")
    for item in unresolved[:20]:
        print(f"  unresolved: {item}")
    if len(unresolved) > 20:
        print(f"  … and {len(unresolved) - 20} more")

    if args.dry_run:
        print("dry run - license-overrides.json not written")
        return
    data["komponenter"] = dict(sorted(known.items()))
    with open(OVERRIDES, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    print(f"wrote {OVERRIDES}")


if __name__ == "__main__":
    main()
