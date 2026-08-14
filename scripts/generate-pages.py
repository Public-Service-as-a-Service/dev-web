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
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "scripts", "apps-data.json")
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

    return f"""<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(namn)} – Webbkatalogen</title>
  <meta name="description" content="{html.escape(app.get('ingress', ''), quote=True)}">
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%93%98%3C/text%3E%3C/svg%3E">
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
          <p class="fact-box-link">
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

      <h3>Källkod</h3>
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
    os.makedirs(OUT, exist_ok=True)
    for app in apps:
        fname = f"{app['slug']}.html"
        if fname in HANDWRITTEN:
            raise SystemExit(f"slug collides with handwritten page: {fname}")
        with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
            f.write(page(app))
    print(f"wrote {len(apps)} pages")

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
