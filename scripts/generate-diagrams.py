#!/usr/bin/env python3
"""Generate per-application architecture SVG diagrams for the web catalogue.

Data is derived from the web-app-draken-public repository:
backend/src/config/api-config.ts (API versions), backend/src/utils/validateEnv.ts,
backend/src/controllers + services (API usage), frontend/.env.*-example (feature flags).
Run from anywhere: output is written to assets/diagrams/ in the repo root.
"""

import os

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "diagrams")

# Palette aligned with the site's stylesheet
INK = "#1c2b33"
INK_SOFT = "#46595f"
PRIMARY = "#005a70"
PRIMARY_DARK = "#00434f"
BLUE_FILL = "#dbeafe"
BLUE_EDGE = "#2563eb"
GREEN_FILL = "#e8f5ee"
GREEN_EDGE = "#15803d"
GREEN_CORE_FILL = "#bbe3cd"
YELLOW_FILL = "#fdf3d7"
YELLOW_EDGE = "#b45309"
GREY_FILL = "#eef1f4"
GREY_EDGE = "#64748b"
ARROW = "#7d99a1"

W = 1400

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def box(x, y, w, h, title, sub, fill, edge, dashed=False, title_size=15, sub_size=11.5):
    dash = ' stroke-dasharray="7,5"' if dashed else ""
    s = f'<rect x="{x}" y="{y}" rx="10" width="{w}" height="{h}" fill="{fill}" stroke="{edge}" stroke-width="2"{dash}/>'
    cx = x + w / 2
    if sub:
        s += f'<text x="{cx}" y="{y + h/2 - 4}" text-anchor="middle" font-size="{title_size}" font-weight="bold" fill="{INK}">{esc(title)}</text>'
        s += f'<text x="{cx}" y="{y + h/2 + 15}" text-anchor="middle" font-size="{sub_size}" fill="{INK_SOFT}">{esc(sub)}</text>'
    else:
        s += f'<text x="{cx}" y="{y + h/2 + 5}" text-anchor="middle" font-size="{title_size}" font-weight="bold" fill="{INK}">{esc(title)}</text>'
    return s

def arrow(x1, y1, x2, y2, color=ARROW, dashed=False, curve=True):
    dash = ' stroke-dasharray="6,5"' if dashed else ""
    if curve:
        my = (y1 + y2) / 2
        d = f"M {x1} {y1} C {x1} {my}, {x2} {my}, {x2} {y2}"
    else:
        d = f"M {x1} {y1} L {x2} {y2}"
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="1.6"{dash} marker-end="url(#arr)"/>'

def group_rect(x, y, w, h, label, fill, edge):
    return (f'<rect x="{x}" y="{y}" rx="12" width="{w}" height="{h}" fill="{fill}" stroke="{edge}" stroke-width="1.5" opacity="0.55"/>'
            f'<text x="{x+16}" y="{y+24}" font-size="13" font-weight="bold" letter-spacing="1" fill="{INK}">{esc(label)}</text>')

def rows_layout(items, x0, x1, y, bw, bh, gap_y=16, min_gap=14):
    """Lay out items in centered rows within [x0, x1]. Returns (positions, bottom_y)."""
    per_row = max(1, int((x1 - x0 + min_gap) // (bw + min_gap)))
    pos = []
    i = 0
    while i < len(items):
        row = items[i:i + per_row]
        total = len(row) * bw + (len(row) - 1) * min_gap
        start = x0 + ((x1 - x0) - total) / 2
        for j in range(len(row)):
            pos.append((start + j * (bw + min_gap), y))
        y += bh + gap_y
        i += per_row
    return pos, y - gap_y + 0

def diagram(filename, title, core, domain_apis, master_apis, notes):
    """core: (name, sub); domain_apis/master_apis: list of (name, version, sub)."""
    parts = []
    y = 16
    parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-size="22" font-weight="bold" fill="{PRIMARY_DARK}">Lösningsarkitektur — {esc(title)}</text>')
    y += 44
    parts.append(f'<text x="{W/2}" y="{y}" text-anchor="middle" font-size="13" fill="{INK_SOFT}">Pilar visar anrop. Alla verksamhetsanrop går från webbappens backend via kommunens API-plattform (WSO2).</text>')
    y += 24

    # Client box + SAML IdP
    cw, ch = 420, 74
    cx = (W - cw) / 2
    parts.append(box(cx, y, cw, ch, "Webb-app", "frontend (React/Next.js) + backend (Node.js) — web-app-draken-public", BLUE_FILL, BLUE_EDGE, title_size=17))
    idp_w, idp_h = 240, 60
    idp_x = W - idp_w - 30
    parts.append(box(idp_x, y + 7, idp_w, idp_h, "SAML IdP", "inloggning med SSO", GREY_FILL, GREY_EDGE, dashed=True))
    parts.append(arrow(cx + cw, y + ch / 2, idp_x, y + 7 + idp_h / 2, dashed=True, curve=False))
    parts.append(f'<text x="{(cx+cw+idp_x)/2}" y="{y + ch/2 - 10}" text-anchor="middle" font-size="11" fill="{GREY_EDGE}">autentisering</text>')
    client_bottom = (cx + cw / 2, y + ch)
    y += ch + 52

    # Gateway bar
    gw, gh = 640, 58
    gx = (W - gw) / 2
    parts.append(arrow(client_bottom[0], client_bottom[1], W / 2, y, color=BLUE_EDGE, curve=False))
    parts.append(f'<text x="{W/2 + 12}" y="{client_bottom[1] + 30}" font-size="11" fill="{INK_SOFT}">OAuth2 (CLIENT_KEY/CLIENT_SECRET)</text>')
    parts.append(box(gx, y, gw, gh, "API-plattform (WSO2)", "api.sundsvall.se — gemensam ingång till alla verksamhets-API:er", GREY_FILL, PRIMARY, title_size=16))
    gate_bottom = (W / 2, y + gh)
    y += gh + 56

    # Domain APIs group (core first, highlighted)
    bw, bh = 205, 64
    margin = 40
    inner_pad = 20
    apis = [core] + domain_apis
    pos, rows_bottom = rows_layout(apis, margin + inner_pad, W - margin - inner_pad, y + 40, bw, bh)
    parts.append(group_rect(margin, y, W - 2 * margin, rows_bottom - y + inner_pad, "VERKSAMHETS-API:ER — anropas av webb-appen via API-plattformen", "#f4faf6", GREEN_EDGE))
    for (name, ver, sub), (bx, by) in zip(apis, pos):
        is_core = (name == core[0] and ver == core[1])
        fill = GREEN_CORE_FILL if is_core else GREEN_FILL
        label = f"{name} {ver}".strip()
        parts.append(box(bx, by, bw, bh, label, sub, fill, GREEN_EDGE, title_size=14))
        parts.append(arrow(gate_bottom[0], gate_bottom[1], bx + bw / 2, by))
    y = rows_bottom + inner_pad + 34

    # Master data group
    pos, rows_bottom = rows_layout(master_apis, margin + inner_pad, W - margin - inner_pad, y + 40, bw, bh)
    parts.append(group_rect(margin, y, W - 2 * margin, rows_bottom - y + inner_pad, "MASTER-DATA-API:ER — uppslag av personer, medarbetare och organisationer", "#fdf9ef", YELLOW_EDGE))
    for (name, ver, sub), (bx, by) in zip(master_apis, pos):
        parts.append(box(bx, by, bw, bh, f"{name} {ver}", sub, YELLOW_FILL, YELLOW_EDGE, title_size=14))
        parts.append(arrow(gate_bottom[0], gate_bottom[1], bx + bw / 2, by))
    y = rows_bottom + inner_pad + 28

    # Notes + legend
    for note in notes:
        parts.append(f'<text x="{margin}" y="{y}" font-size="12" fill="{INK_SOFT}">• {esc(note)}</text>')
        y += 20
    y += 8
    lx = margin
    legend = [
        (BLUE_FILL, BLUE_EDGE, False, "Webb-app (denna applikation)"),
        (GREEN_CORE_FILL, GREEN_EDGE, False, "Kärn-API"),
        (GREEN_FILL, GREEN_EDGE, False, "Verksamhets-API"),
        (YELLOW_FILL, YELLOW_EDGE, False, "Master-data"),
        (GREY_FILL, GREY_EDGE, True, "Extern/gemensam tjänst"),
    ]
    for fill, edge, dashed, label in legend:
        dash = ' stroke-dasharray="5,4"' if dashed else ""
        parts.append(f'<rect x="{lx}" y="{y}" width="26" height="16" rx="4" fill="{fill}" stroke="{edge}" stroke-width="1.5"{dash}/>')
        parts.append(f'<text x="{lx+33}" y="{y+13}" font-size="12.5" fill="{INK}">{esc(label)}</text>')
        lx += 33 + len(label) * 6.7 + 34
    y += 40

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {int(y)}" '
           f'font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" role="img" '
           f'aria-label="Arkitekturdiagram för {esc(title)}">'
           f'<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
           f'<path d="M 0 1 L 9 5 L 0 9 z" fill="{ARROW}"/></marker></defs>'
           f'<rect width="{W}" height="{int(y)}" fill="#ffffff"/>'
           + "".join(parts) + "</svg>")
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(path, f"({int(y)}px)")

MASTER_COMMON = [
    ("Citizen", "3.0", "uppgifter om invånare"),
    ("Employee", "2.0", "uppgifter om medarbetare"),
    ("LegalEntity", "2.0", "organisationer och företag"),
    ("Party", "2.1", "id-översättning av parter"),
    ("ActiveDirectory", "2.0", "användare och behörigheter"),
]

diagram(
    "generisk-arendehantering.svg",
    "Generisk ärendehantering",
    ("SupportManagement", "14.9", "ärendehantering (kärna)"),
    [
        ("CaseData", "13.0", "eskalering till myndighetsärende"),
        ("CaseStatus", "4.3", "statusinformation"),
        ("Relations", "1.1", "kopplingar mellan ärenden"),
        ("Templating", "2.1", "mallar och PDF"),
        ("BillingPreprocessor", "4.5", "fakturering (vissa verksamheter)"),
        ("Estateinfo", "2.2", "fastighetsinformation"),
    ],
    MASTER_COMMON,
    [
        "Meddelanden till invånare och medarbetare skickas via SupportManagement-API:ets kommunikationsfunktioner.",
        "Fakturering används av verksamheter som Lön och pension samt Rekrytering och bemanning (styrs med funktionsflaggor).",
        "Vilka funktioner som är aktiva styrs per verksamhetsinstans genom konfiguration, inte genom separat kod.",
    ],
)

diagram(
    "myndighetsutovning-mark-och-exploatering.svg",
    "Myndighetsutövning mark och exploatering",
    ("CaseData", "13.0", "ärendehantering (kärna)"),
    [
        ("Contract", "9.0", "arrende- och köpeavtal"),
        ("Estateinfo", "2.2", "fastighetsinformation"),
        ("Messaging", "7.10", "meddelanden till parter"),
        ("BillingPreprocessor", "4.5", "faktureringsunderlag"),
        ("BillingDataCollector", "2.1", "insamling av faktureringsdata"),
        ("CaseStatus", "4.3", "statusinformation"),
        ("Relations", "1.1", "kopplingar mellan ärenden"),
        ("Templating", "2.1", "mallar och PDF"),
        ("Company", "1.0", "företagsuppslag"),
    ],
    MASTER_COMMON,
    [
        "Beslut och meddelanden skickas via Messaging-API:et (e-post, sms och digital brevlåda).",
        "Avtal upprättas i Contract-API:et och faktureringsunderlag skapas som en del av handläggningen.",
    ],
)

diagram(
    "myndighetsutovning-parkeringstillstand.svg",
    "Myndighetsutövning parkeringstillstånd",
    ("CaseData", "13.0", "ärendehantering (kärna)"),
    [
        ("PartyAssets", "6.5", "register över utfärdade tillstånd"),
        ("JsonSchema", "1.0", "validering av ansökningsuppgifter"),
        ("Messaging", "7.10", "meddelanden till sökande"),
        ("CaseStatus", "4.3", "statusinformation"),
        ("Relations", "1.1", "kopplingar mellan ärenden"),
        ("Templating", "2.1", "mallar och PDF"),
    ],
    MASTER_COMMON,
    [
        "Beslut skickas via Messaging-API:et som sms och digital brevlåda; e-postutskick används inte för parkeringstillstånd.",
        "Utfärdade tillstånd registreras i PartyAssets och kopplas till person via Party-API:et.",
    ],
)
