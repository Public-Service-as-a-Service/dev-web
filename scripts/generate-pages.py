#!/usr/bin/env python3
"""Generate service pages and start-page cards from scripts/apps-data.json.

The three original case-management pages (generisk-arendehantering,
myndighetsutovning-*) are hand-written and NOT touched by this script.
Everything else in tjanster/ is generated from the data file, which holds
facts derived from each source repository (see CLAUDE.md for the method).

Run from anywhere: python3 scripts/generate-pages.py
"""

import html
import json
import os
from collections import Counter
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "scripts", "apps-data.json")
# Repos that need an SBOM but have no generated service page -- the handwritten
# solution pages describe a solution rather than one application, so they have no
# apps-data.json entry, but the code behind them still deserves a bill of materials.
EXTRA = os.path.join(ROOT, "scripts", "sbom-extra.json")
OUT = os.path.join(ROOT, "tjanster")

HANDWRITTEN = {
    "generisk-arendehantering.html",
    "myndighetsutovning-mark-och-exploatering.html",
    "myndighetsutovning-parkeringstillstand.html",
}

CATEGORY_ORDER = [
    "Ärendehantering",
    "Myndighetsutövning",
    "Invånartjänster",
    "Företagstjänster",
    "Medarbetartjänster",
    "Utbildning",
    "AI-tjänster",
    "Administration",
    "Utvecklingsverktyg",
]

STATUS_LABEL = {"poc": "Prototyp", "avvecklad": "Avvecklad", "verktyg": "Verktyg"}

MASTER_DATA_APIS = {"citizen", "employee", "legalentity", "party", "activedirectory"}


def e(s):
    return html.escape(str(s), quote=False)


def header(depth):
    p = "../" * depth
    return f"""<header class="site-header">
  <div class="container header-inner">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">▦</span>
      <a class="brand-name" href="{p}index.html">Webbkatalogen</a>
    </div>
    <nav class="site-nav" aria-label="Huvudmeny">
      <a href="{p}index.html#om-katalogen">Om katalogen</a>
      <a href="{p}index.html#tjanster">Webbapplikationer</a>
      <a href="https://github.com/Sundsvallskommun" rel="external">GitHub</a>
    </nav>
  </div>
</header>"""


def footer():
    return """<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <p class="footer-title">Webbkatalogen</p>
      <p>En översikt över de webbapplikationer som Sundsvalls kommun delar som öppen källkod.</p>
    </div>
    <div>
      <p class="footer-title">Länkar</p>
      <ul class="footer-links">
        <li><a href="https://github.com/Sundsvallskommun" rel="external">Sundsvalls kommun på GitHub</a></li>
        <li><a href="https://sundsvall.se" rel="external">sundsvall.se</a></li>
      </ul>
    </div>
  </div>
</footer>"""


def status_tag(app):
    label = STATUS_LABEL.get(app.get("status"))
    if not label:
        return ""
    return f' <span class="app-tag app-tag-light app-tag-status">{e(label)}</span>'


def status_tag_card(app):
    label = STATUS_LABEL.get(app.get("status"))
    if not label:
        return ""
    return f' <span class="app-tag app-tag-status">{e(label)}</span>'


def api_rows(app):
    apis = app.get("apis") or []
    domain = [a for a in apis if a["name"].lower().replace("-", "") not in MASTER_DATA_APIS]
    master = [a for a in apis if a["name"].lower().replace("-", "") in MASTER_DATA_APIS]
    rows = []
    for a in domain + master:
        ver = e(a.get("version") or "–")
        rows.append(f"            <tr><td>{e(a['name'])}</td><td>{ver}</td><td>{e(a.get('usage') or '')}</td></tr>")
    return "\n".join(rows)


def arch_prose(app):
    t = app.get("teknik") or {}
    fe, be = t.get("frontend"), t.get("backend")
    bits = []
    if fe and be:
        bits.append(f"Applikationen består av en webbaserad frontend ({e(fe)}) och en backend ({e(be)}) som utvecklas i samma kodbas.")
    elif fe:
        bits.append(f"Applikationen är en webbaserad frontend ({e(fe)}).")
    elif be:
        bits.append(f"Applikationen är en backendtjänst ({e(be)}).")
    else:
        bits.append("Applikationen är en webbapplikation; se källkoden för detaljer om uppbyggnaden.")
    if app.get("apis"):
        bits.append("Verksamhetsanrop går via kommunens gemensamma API-plattform (WSO2) – frontend pratar aldrig direkt med underliggande system.")
    auth = app.get("auth")
    if auth and "ingen" not in auth.lower():
        bits.append(f"Inloggning: {e(auth)}.")
    integ = app.get("integrationer") or []
    if integ:
        bits.append("Övriga integrationer som förekommer i koden: " + e(", ".join(integ)) + ".")
    return " ".join(bits)


def tech_list(app):
    t = app.get("teknik") or {}
    items = []
    if t.get("frontend"):
        items.append(f"<li><strong>Frontend:</strong> {e(t['frontend'])}</li>")
    if t.get("backend"):
        items.append(f"<li><strong>Backend:</strong> {e(t['backend'])}</li>")
    if t.get("tester"):
        items.append(f"<li><strong>Test:</strong> {e(t['tester'])}</li>")
    if not items:
        items.append("<li>Se källkodens paketfiler för detaljer.</li>")
    return "\n        ".join(items)


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
    # Multi-module repositories (api-service-operaton has 12 poms) list the same
    # dependency once per module -- 6895 entries for 331 distinct components. The
    # SPDX document keeps them all, since the relationships reference them, but the
    # page shows each component once.
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

def page(app):
    slug = app["slug"]
    namn = app["namn"]
    repo_url = f"https://github.com/Sundsvallskommun/{app['repo']}"
    funktioner = "\n".join(
        f'            <li><strong>{e(f["titel"])}</strong> – {e(f["text"])}</li>'
        for f in (app.get("funktioner") or [])
    )
    beskrivning = "\n".join(f"          <p>\n            {e(p)}\n          </p>" for p in app.get("beskrivning", []))
    anteckningar = app.get("anteckningar") or []
    notes_html = ""
    if anteckningar:
        notes_html = ("\n      <h3>Noterbart ur källkoden</h3>\n      <ul>\n"
                      + "\n".join(f"        <li>{e(n)}</li>" for n in anteckningar) + "\n      </ul>")
    apis = app.get("apis") or []
    if apis:
        api_html = f"""      <h3>API-beroenden</h3>
      <p>
        Applikationen konsumerar följande API:er via kommunens API-plattform.
        Versionerna är hämtade ur källkodens API-konfiguration.
      </p>
      <div class="table-wrap">
        <table>
          <caption class="sr-only">API-beroenden för {e(namn)}</caption>
          <thead>
            <tr><th scope="col">API</th><th scope="col">Version</th><th scope="col">Användning</th></tr>
          </thead>
          <tbody>
{api_rows(app)}
          </tbody>
        </table>
      </div>"""
    else:
        api_html = """      <h3>API-beroenden</h3>
      <p>
        Inga prenumerationer på kommunens API-plattform hittades i källkodens
        konfiguration.
      </p>"""
    konf = app.get("konfiguration") or []
    konf_html = "\n".join(f"        <li>{e(k)}</li>" for k in konf) or "        <li>Se källkodens miljöfilsexempel.</li>"

    sbom_fact_link = ""
    sbom_section = ""
    if has_sbom(app):
        komponenter, licenser, _ = load_sbom(app)
        sbom_fact_link = f"""          <p class="fact-box-link">
            <a href="{app['slug']}-sbom.html">Programvaruförteckning (SBOM)</a>
          </p>
"""
        sbom_section = f"""      <h3>Programvaruförteckning</h3>
      <p>
        Applikationen bygger på {len(komponenter)} tredjepartskomponenter fördelade på
        {len(licenser)} olika licenser. Förteckningen omfattar hela beroendeträdet, alltså
        även byggkedjan och inte bara det som levereras till webbläsaren.
        Se <a href="{app['slug']}-sbom.html">programvaruförteckningen</a> för hela listan.
      </p>

"""

    return f"""<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(namn)} – Webbkatalogen</title>
  <meta name="description" content="{html.escape(app.get('ingress', ''), quote=True)}">
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
  <link rel="apple-touch-icon" href="../assets/favicon-180.png">
</head>
<body>

{header(1)}

<main>

  <section class="page-hero">
    <div class="container">
      <nav class="breadcrumb" aria-label="Brödsmulor">
        <a href="../index.html">Start</a> <span aria-hidden="true">/</span>
        <a href="../index.html#tjanster">Webbapplikationer</a> <span aria-hidden="true">/</span>
        <span aria-current="page">{e(namn)}</span>
      </nav>
      <span class="app-tag app-tag-light">{e(app['kategori'])}</span>{status_tag(app)}
      <h1>{e(namn)}</h1>
      <p class="hero-lead">
        {e(app.get('ingress', ''))}
      </p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2>Om applikationen</h2>
      <div class="columns">
        <div class="column-text">
{beskrivning}

          <h3>Det här stödjer applikationen</h3>
          <ul class="app-modules">
{funktioner}
          </ul>
        </div>
        <aside class="fact-box" aria-label="Snabbfakta">
          <h3>Snabbfakta</h3>
          <ul>
            <li>Målgrupp: <strong>{e(app.get('malgrupp', '–'))}</strong></li>
            <li>Kategori: <strong>{e(app['kategori'])}</strong></li>
            <li>Status: <strong>{e(STATUS_LABEL.get(app.get('status'), 'Aktiv'))}</strong></li>
            <li>Inloggning: <strong>{e(app.get('auth') or '–')}</strong></li>
          </ul>
{sbom_fact_link}          <p class="fact-box-link">
            <a href="{repo_url}" rel="external">Källkod på GitHub</a>
          </p>
        </aside>
      </div>
    </div>
  </section>

  <section class="section section-alt" id="teknisk-dokumentation">
    <div class="container">
      <h2>Teknisk dokumentation</h2>
      <p class="section-intro">
        Nedan beskrivs hur applikationen är uppbyggd, vilka API:er den använder och vad
        som krävs för att driftsätta den. Informationen är härledd ur källkoden och
        dess konfiguration på GitHub.
      </p>

      <h3>Arkitektur</h3>
      <figure class="diagram">
        <div class="diagram-wrap">
          <img src="../assets/diagrams/{slug}.svg" alt="Arkitekturskiss för {e(namn)}: webbappens delar och dess integrationer.">
        </div>
        <figcaption>Lösningsarkitektur, härledd ur källkodens konfiguration.</figcaption>
      </figure>
      <p>
        {arch_prose(app)}
      </p>

      <h3>Teknikstack</h3>
      <ul>
        {tech_list(app)}
      </ul>

{api_html}

      <h3>Konfiguration och driftsättning</h3>
      <ul>
{konf_html}
      </ul>{notes_html}

{sbom_section}      <h3>Källkod</h3>
      <p>
        Källkoden är öppen och finns hos
        <a href="{repo_url}" rel="external">Sundsvalls kommun på GitHub</a>.
        I källkodsförrådet finns även instruktioner för att klona, konfigurera och
        starta applikationen i egen miljö.
      </p>
    </div>
  </section>

</main>

{footer()}

</body>
</html>
"""


def sbom_page(app):
    slug = app["slug"]
    namn = app["namn"]
    repo_url = f"https://github.com/Sundsvallskommun/{app['repo']}"
    komponenter, licenser, prov = load_sbom(app)

    licens_rader = "\n".join(
        f"            <tr><td>{e(licens)}</td><td>{antal}</td></tr>"
        for licens, antal in sorted(licenser.items(), key=lambda x: (-x[1], x[0].lower()))
    )
    komponent_rader = "\n".join(
        f'            <tr><td>{e(k["namn"])}</td><td>{e(k["version"])}</td><td>{e(k["licens"])}</td></tr>'
        for k in komponenter
    )
    datum = prov["created"][:10]

    return f"""<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(namn)} – Programvaruförteckning (SBOM) – Webbkatalogen</title>
  <meta name="description" content="Programvaruförteckning (SBOM) i SPDX-format för {e(namn)}: tredjepartskomponenter med version och licens.">
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
  <link rel="apple-touch-icon" href="../assets/favicon-180.png">
</head>
<body>

{header(1)}

<main>

  <section class="page-hero page-hero-slim">
    <div class="container">
      <nav class="breadcrumb" aria-label="Brödsmulor">
        <a href="../index.html">Start</a> <span aria-hidden="true">/</span>
        <a href="../index.html#tjanster">Webbapplikationer</a> <span aria-hidden="true">/</span>
        <a href="{slug}.html">{e(namn)}</a> <span aria-hidden="true">/</span>
        <span aria-current="page">SBOM</span>
      </nav>
      <span class="app-tag app-tag-light">{e(app['kategori'])}</span>
      <h1>{e(namn)} – programvaruförteckning</h1>
      <p class="hero-lead">
        Samtliga tredjepartskomponenter som ingår i applikationens bygge, med version och
        licens. Förteckningen är maskinellt härledd ur källkodens beroendeträd och
        publiceras i SPDX-format.
      </p>
      <div class="hero-actions">
        <a class="button button-primary" href="../assets/sbom/{slug}.spdx.json" download>Ladda ner SPDX (JSON)</a>
        <a class="button button-secondary" href="{slug}.html">Tillbaka till {e(namn)}</a>
      </div>
    </div>
  </section>

  <section class="section section-slim" id="om-forteckningen">
    <div class="container">
      <h2>Om förteckningen</h2>
      <ul>
        <li>Antal komponenter: <strong>{len(komponenter)}</strong></li>
        <li>Antal unika licenser: <strong>{len(licenser)}</strong></li>
        <li>Källa: <strong>{e(prov['namn'])}</strong> (<a href="{repo_url}" rel="external">källkod på GitHub</a>)</li>
        <li>Avser källkod från: <strong>{e(datum)}</strong></li>
        <li>Format: <strong>{e(prov['spdx'])}</strong>, genererad med <strong>{e(prov['verktyg'])}</strong></li>
      </ul>
      <p>
        Förteckningen uppdateras automatiskt och beskriver beroendena i
        applikationens huvudgren vid angivet datum. Den omfattar hela beroendeträdet,
        alltså även byggkedjan – vilka API:er applikationen anropar framgår av
        <a href="{slug}.html#teknisk-dokumentation">den tekniska dokumentationen</a>.
      </p>
    </div>
  </section>

  <section class="section section-alt" id="licenser">
    <div class="container">
      <h2>Licenser</h2>
      <p class="section-intro">
        Fördelning av deklarerade licenser bland komponenterna.
      </p>
      <div class="table-wrap">
        <table>
          <caption class="sr-only">Licensfördelning för {e(namn)}</caption>
          <thead>
            <tr><th scope="col">Licens</th><th scope="col">Antal komponenter</th></tr>
          </thead>
          <tbody>
{licens_rader}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="section" id="komponenter">
    <div class="container">
      <h2>Komponenter</h2>
      <p class="section-intro">
        Samtliga {len(komponenter)} komponenter, inklusive transitiva beroenden.
      </p>
      <p class="sbom-filter" hidden>
        <label for="sbom-filter">Filtrera listan</label>
        <input type="search" id="sbom-filter" placeholder="Sök på komponent eller licens" autocomplete="off">
        <span id="sbom-count" aria-live="polite"></span>
      </p>
      <div class="table-wrap">
        <table id="sbom-table">
          <caption class="sr-only">Tredjepartskomponenter i {e(namn)}</caption>
          <thead>
            <tr><th scope="col">Komponent</th><th scope="col">Version</th><th scope="col">Licens</th></tr>
          </thead>
          <tbody>
{komponent_rader}
          </tbody>
        </table>
      </div>
    </div>
  </section>

</main>

{footer()}

<script>
  // Progressive enhancement: the table is fully rendered server-side and stays
  // usable without JavaScript.
  (function () {{
    var input = document.getElementById('sbom-filter');
    var count = document.getElementById('sbom-count');
    var rows = Array.prototype.slice.call(
      document.querySelectorAll('#sbom-table tbody tr')
    );
    if (!input || !rows.length) return;
    document.querySelector('.sbom-filter').hidden = false;
    input.addEventListener('input', function () {{
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {{
        var match = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        row.hidden = !match;
        if (match) shown++;
      }});
      count.textContent = q ? shown + ' av ' + rows.length : '';
    }});
  }})();
</script>

</body>
</html>
"""

def teaser_card(href, kategori, namn, text, status_html=""):
    return f"""        <a class="teaser-card" href="{href}">
          <span class="app-tag">{e(kategori)}</span>{status_html}
          <h3>{e(namn)}</h3>
          <p>
            {e(text)}
          </p>
          <span class="teaser-more">Läs mer →</span>
        </a>"""


HAND_CARDS = [
    ("Ärendehantering", None, "Generisk ärendehantering", "tjanster/generisk-arendehantering.html",
     "En konfigurerbar tjänst för att ta emot, handlägga och avsluta ärenden och förfrågningar. Används av ett flertal verksamheter – från kontaktcenter till löne- och rekryteringsfunktioner."),
    ("Myndighetsutövning", None, "Myndighetsutövning – mark och exploatering", "tjanster/myndighetsutovning-mark-och-exploatering.html",
     "Stöd för handläggning av mark- och exploateringsärenden: arrenden, markförsäljning, avtal och fakturering – med koppling till fastighetsinformation."),
    ("Myndighetsutövning", None, "Myndighetsutövning – parkeringstillstånd", "tjanster/myndighetsutovning-parkeringstillstand.html",
     "Digital handläggning av parkeringstillstånd för rörelsehindrade – från ansökan och utredning till beslut och utfärdat tillstånd."),
]


def build_cards(apps):
    by_cat = {}
    for cat, status, namn, href, text in HAND_CARDS:
        by_cat.setdefault(cat, []).append((namn, href, text, ""))
    for app in apps:
        by_cat.setdefault(app["kategori"], []).append(
            (app["namn"], f"tjanster/{app['slug']}.html", app.get("ingress", ""), status_tag_card(app))
        )
    blocks = []
    for cat in CATEGORY_ORDER:
        if cat not in by_cat:
            continue
        cards = "\n\n".join(
            teaser_card(href, cat, namn, text, status_html)
            for namn, href, text, status_html in sorted(by_cat[cat], key=lambda c: c[0].lower())
        )
        blocks.append(f'      <h3 class="card-group-title">{e(cat)}</h3>\n      <div class="card-grid">\n\n{cards}\n\n      </div>')
    return "\n\n".join(blocks)


def main():
    with open(DATA, encoding="utf-8") as f:
        apps = json.load(f)
    with open(EXTRA, encoding="utf-8") as f:
        extras = json.load(f)["repon"]
    os.makedirs(OUT, exist_ok=True)
    missing_sbom = []
    for app in apps:
        fname = f"{app['slug']}.html"
        if fname in HANDWRITTEN:
            raise SystemExit(f"slug collides with handwritten page: {fname}")
        with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
            f.write(page(app))
        if has_sbom(app):
            sbom_name = f"{app['slug']}-sbom.html"
            if sbom_name in HANDWRITTEN:
                raise SystemExit(f"sbom slug collides with handwritten page: {sbom_name}")
            with open(os.path.join(OUT, sbom_name), "w", encoding="utf-8") as f:
                f.write(sbom_page(app))
        else:
            missing_sbom.append(app["slug"])
    print(f"wrote {len(apps)} pages ({len(apps) - len(missing_sbom)} SBOM pages)")
    if missing_sbom:
        print("no SBOM (page skipped):", ", ".join(missing_sbom))

    # SBOM-only entries: a bill-of-materials page, no service page and no card.
    for extra in extras:
        if not has_sbom(extra):
            print("no SBOM (extra skipped):", extra["slug"])
            continue
        with open(os.path.join(OUT, f"{extra['slug']}-sbom.html"), "w", encoding="utf-8") as f:
            f.write(sbom_page(extra))
        print(f"wrote SBOM page for {extra['slug']} (no service page)")

    index_path = os.path.join(ROOT, "index.html")
    with open(index_path, encoding="utf-8") as f:
        idx = f.read()
    begin, end = "<!-- BEGIN:APP-CARDS -->", "<!-- END:APP-CARDS -->"
    if begin not in idx or end not in idx:
        raise SystemExit("index.html saknar APP-CARDS-markörer")
    new = idx[: idx.index(begin) + len(begin)] + "\n" + build_cards(apps) + "\n      " + idx[idx.index(end):]
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new)
    print("updated index.html cards")


if __name__ == "__main__":
    main()
