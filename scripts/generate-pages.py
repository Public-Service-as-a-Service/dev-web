#!/usr/bin/env python3
"""Generate the page shells under tjanster/ from scripts/apps-data.json.

Everything in tjanster/ is generated from the data file, which holds facts
derived from each source repository (see CLAUDE.md for the method).

Each generated shell carries the page's title and metadata plus the page data
embedded as JSON; the content is rendered by the React entries in src/entries/
using Sundsvall's design system (@sk-web-gui/react + @sk-web-gui/core). The
start page needs no generation step: src/pages/IndexPage.tsx imports
apps-data.json directly.

Run from anywhere: python3 scripts/generate-pages.py
"""

import html
import json
import os
from collections import Counter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "scripts", "apps-data.json")
# Repos that need an SBOM but have no service page in the catalogue; currently
# empty -- every repo with an SBOM has its own service page.
EXTRA = os.path.join(ROOT, "scripts", "sbom-extra.json")
OUT = os.path.join(ROOT, "tjanster")


def sbom_path(app):
    return os.path.join(ROOT, "assets", "sbom", f"{app['slug']}.spdx.json")


def has_sbom(app):
    return os.path.exists(sbom_path(app))


def load_sbom(app):
    """Return (components, licence counts, provenance) from the SPDX document.

    Components are the packages carrying a package-manager purl; the two
    remaining packages describe the scanned repository itself.
    """
    with open(sbom_path(app), encoding="utf-8") as f:
        doc = json.load(f)
    components = []
    for pkg in doc.get("packages", []):
        if not pkg.get("externalRefs"):
            continue
        # licenseConcluded first: normalize-sbom.py records manually verified
        # licences there (see scripts/license-overrides.json), while
        # licenseDeclared honestly keeps what the package metadata itself says.
        licens = next(
            (v for v in (pkg.get("licenseConcluded"), pkg.get("licenseDeclared"))
             if v and v not in ("NOASSERTION", "NONE")),
            "Ej angiven",
        )
        components.append({
            "namn": pkg.get("name", ""),
            "version": pkg.get("versionInfo", ""),
            "licens": licens,
        })
    # Multi-module repositories list the same dependency once per module. The
    # SPDX document keeps them all, since the relationships reference them, but
    # the page shows each component once.
    unique = {(c["namn"], c["version"], c["licens"]): c for c in components}
    components = sorted(unique.values(), key=lambda c: (c["namn"].lower(), c["version"]))
    licenser = Counter(c["licens"] for c in components)
    provenans = {
        "namn": doc.get("name", ""),
        "created": doc.get("creationInfo", {}).get("created", ""),
        "spdx": doc.get("spdxVersion", ""),
        "verktyg": next(
            (c[len("Tool: "):] for c in doc.get("creationInfo", {}).get("creators", [])
             if c.startswith("Tool: ")),
            "",
        ),
    }
    return components, licenser, provenans


def shell(title, description, entry, data):
    """Render one page shell: head metadata, embedded page data, React entry."""
    # "</" must not appear verbatim inside a script element.
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return f"""<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title, quote=False)}</title>
  <meta name="description" content="{html.escape(description, quote=True)}">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
  <link rel="apple-touch-icon" href="../assets/favicon-180.png">
</head>
<body>
  <script type="application/json" id="page-data">{payload}</script>
  <div id="root"></div>
  <script type="module" src="/src/entries/{entry}.tsx"></script>
</body>
</html>
"""


def app_shell(app):
    sbom_summary = None
    if has_sbom(app):
        komponenter, licenser, _ = load_sbom(app)
        sbom_summary = {"komponenter": len(komponenter), "licenser": len(licenser)}
    return shell(
        f"{app['namn']} – Webbkatalogen",
        app.get("ingress", ""),
        "app",
        {"app": app, "hasSbom": has_sbom(app), "sbom": sbom_summary},
    )


def sbom_shell(app):
    komponenter, licenser, provenans = load_sbom(app)
    return shell(
        f"{app['namn']} – Programvaruförteckning (SBOM) – Webbkatalogen",
        f"Programvaruförteckning (SBOM) i SPDX-format för {app['namn']}: "
        "tredjepartskomponenter med version och licens.",
        "sbom",
        {
            "api": {
                "slug": app["slug"],
                "namn": app["namn"],
                "kategori": app["kategori"],
                "repo": app["repo"],
            },
            "komponenter": komponenter,
            "licenser": sorted(licenser.items(), key=lambda x: (-x[1], x[0].lower())),
            "provenans": provenans,
        },
    )


def main():
    with open(DATA, encoding="utf-8") as f:
        apps = json.load(f)
    with open(EXTRA, encoding="utf-8") as f:
        extras = json.load(f)["repon"]
    os.makedirs(OUT, exist_ok=True)
    missing_sbom = []
    for app in apps:
        with open(os.path.join(OUT, f"{app['slug']}.html"), "w", encoding="utf-8") as f:
            f.write(app_shell(app))
        if has_sbom(app):
            with open(os.path.join(OUT, f"{app['slug']}-sbom.html"), "w", encoding="utf-8") as f:
                f.write(sbom_shell(app))
        else:
            missing_sbom.append(app["slug"])
    print(f"wrote {len(apps)} page shells ({len(apps) - len(missing_sbom)} SBOM pages)")
    if missing_sbom:
        print("no SBOM (page skipped):", ", ".join(missing_sbom))

    # SBOM-only entries: a bill-of-materials page, no service page and no card.
    for extra in extras:
        if not has_sbom(extra):
            print("no SBOM (extra skipped):", extra["slug"])
            continue
        with open(os.path.join(OUT, f"{extra['slug']}-sbom.html"), "w", encoding="utf-8") as f:
            f.write(sbom_shell(extra))
        print(f"wrote SBOM page for {extra['slug']} (no service page)")


if __name__ == "__main__":
    main()
