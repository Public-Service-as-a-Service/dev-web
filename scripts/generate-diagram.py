#!/usr/bin/env python3
"""Generate the target architecture overview SVG for the site.

The drawing style (palette, box/arrow helpers, legend) follows the
architecture diagrams in the API and web catalogues, so the sites share
one visual language. The content is deliberately abstract: capabilities
and layers, not technology or product choices. Run from anywhere:
output is written to assets/diagrams/ in the repo root.
"""

import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "diagrams", "malarkitektur.svg")

# Palette aligned with the site's stylesheet
INK = "#1c2b33"
INK_SOFT = "#46595f"
PRIMARY = "#005a70"
PRIMARY_DARK = "#00434f"
BLUE_FILL = "#dbeafe"
BLUE_EDGE = "#2563eb"
GREEN_FILL = "#e8f5ee"
GREEN_EDGE = "#15803d"
YELLOW_FILL = "#fdf3d7"
YELLOW_EDGE = "#b45309"
GREY_FILL = "#eef1f4"
GREY_EDGE = "#64748b"
ARROW = "#7d99a1"

W = 1400
MARGIN = 40


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


def arrow(x1, y1, x2, y2, color=ARROW, dashed=False):
    dash = ' stroke-dasharray="6,5"' if dashed else ""
    return f'<path d="M {x1} {y1} L {x2} {y2}" fill="none" stroke="{color}" stroke-width="1.6"{dash} marker-end="url(#arr)"/>'


def group_rect(x, y, w, h, label, fill, edge):
    return (f'<rect x="{x}" y="{y}" rx="12" width="{w}" height="{h}" fill="{fill}" stroke="{edge}" stroke-width="1.5" opacity="0.55"/>'
            f'<text x="{x+16}" y="{y+24}" font-size="13" font-weight="bold" letter-spacing="1" fill="{INK}">{esc(label)}</text>')


def centered_row(parts, items, y, bw, bh, fill, edge, gap=14, dashed=False, title_size=13.5, sub_size=11, per_item_style=None):
    total = len(items) * bw + (len(items) - 1) * gap
    x = (W - total) / 2
    for i, (title, sub) in enumerate(items):
        f, e, d = fill, edge, dashed
        if per_item_style:
            f, e, d = per_item_style[i]
        parts.append(box(x, y, bw, bh, title, sub, f, e, dashed=d, title_size=title_size, sub_size=sub_size))
        x += bw + gap


parts = []
y = 16

parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-size="22" font-weight="bold" fill="{PRIMARY_DARK}">Målarkitektur — Sundsvalls kommun</text>')
y += 44
parts.append(f'<text x="{W/2}" y="{y}" text-anchor="middle" font-size="13" fill="{INK_SOFT}">Pilar visar anrop. Ett ekosystem av egenutvecklade och upphandlade komponenter; funktionalitet och data exponeras via API:er.</text>')
y += 26

# Layer 1: users
gh_ = 96
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, gh_, "ANVÄNDARE", "#f4f5f7", GREY_EDGE))
centered_row(parts, [("Invånare", None), ("Företag", None), ("Medarbetare", None), ("Samverkande kommuner", "delar behov och lösningar")],
             y + 36, 250, 48, GREY_FILL, GREY_EDGE, dashed=True)
users_bottom = y + gh_
y = users_bottom + 40

# Layer 2: digital channels
ch_h = 128
parts.append(arrow(W / 2, users_bottom, W / 2, y, color=GREY_EDGE))
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, ch_h, "DIGITALA KANALER — GRÄNSSNITTEN MOT ANVÄNDARNA", "#eef4fb", BLUE_EDGE))
centered_row(parts, [
    ("Webbtjänster och appar", "digital service i vardagen"),
    ("Mina sidor", "registrera och följa ärenden, samlad bild av engagemang"),
    ("AI-assistenter", "stöd och självservice"),
], y + 40, 400, 64, BLUE_FILL, BLUE_EDGE)
channels_bottom = y + ch_h
y = channels_bottom + 46

# Layer 3: API infrastructure
gw, gh2 = 760, 58
parts.append(arrow(W / 2, channels_bottom, W / 2, y, color=BLUE_EDGE))
parts.append(f'<text x="{W/2 + 12}" y="{channels_bottom + 28}" font-size="11" fill="{INK_SOFT}">krypterade, autentiserade anrop — kanalerna skapas med API:er</text>')
parts.append(box((W - gw) / 2, y, gw, gh2, "API-infrastruktur", "gemensam, säker ingång till ekosystemets funktionalitet och data", GREY_FILL, PRIMARY, title_size=16))
gate_bottom = y + gh2
y = gate_bottom + 46

# Layer 4: the component ecosystem
eco_h = 300
parts.append(arrow(W / 2, gate_bottom, W / 2, y, color=GREEN_EDGE))
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, eco_h, "EKOSYSTEM AV KOMPONENTER — EGENUTVECKLADE OCH UPPHANDLADE", "#f4faf6", GREEN_EDGE))
centered_row(parts, [
    ("Kommunikation", "meddelanden och utskick i alla kanaler"),
    ("Ärende- och processtöd", "ärenden, status, automatiserade flöden"),
    ("Dokumenthantering", "lagring, signering, arkivering"),
    ("Analys, data och AI", "datalager och AI-infrastruktur"),
], y + 40, 300, 64, GREEN_FILL, GREEN_EDGE)
centered_row(parts, [
    ("Masterdata", "metakatalog — gemensamma grunddata om personer, företag och organisation"),
    ("Specialiserade verksamhetssystem", "upphandlade lösningar, anslutna via API-krav"),
], y + 124, 614, 64, YELLOW_FILL, YELLOW_EDGE, per_item_style=[
    (YELLOW_FILL, YELLOW_EDGE, False),
    (GREY_FILL, GREY_EDGE, False),
])
centered_row(parts, [
    ("Paketerade lösningar", "sammansatta tjänster av flera komponenter — återanvändbara som helhet"),
], y + 208, 1242, 64, GREEN_FILL, GREEN_EDGE)
eco_bottom = y + eco_h
y = eco_bottom + 46

# Layer 5: national services and external providers
ex_h = 96
parts.append(arrow(W / 2, eco_bottom, W / 2, y, color=GREY_EDGE))
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, ex_h, "OMVÄRLD", "#f4f5f7", GREY_EDGE))
centered_row(parts, [
    ("Nationella tjänster", "myndigheters bastjänster och öppna data"),
    ("Externa leverantörstjänster", "distribution, signering med mera"),
    ("Delade lösningar", "tjänster som delas mellan kommuner"),
], y + 36, 340, 52, GREY_FILL, GREY_EDGE, dashed=True, sub_size=10.5)
y += ex_h + 34

# Notes
notes = [
    "Samma krav gäller oavsett ursprung: väl avgränsat ansvar för funktion och data, skalbarhet för hela koncernen och API:er enligt öppna standarder.",
    "Kompletta lösningar skapas genom att komponenter integreras med varandra — inte genom monolitiska helhetssystem.",
    "Det som utvecklas delas öppet och kan återanvändas av andra kommuner; upphandlade lösningar ansluts till ekosystemet via API-relaterade krav.",
]
for note in notes:
    parts.append(f'<text x="{MARGIN}" y="{y}" font-size="12" fill="{INK_SOFT}">• {esc(note)}</text>')
    y += 20
y += 10

# Legend
legend = [
    (BLUE_FILL, BLUE_EDGE, False, "Digitala kanaler"),
    (GREEN_FILL, GREEN_EDGE, False, "Gemensamma komponenter"),
    (YELLOW_FILL, YELLOW_EDGE, False, "Masterdata"),
    (GREY_FILL, GREY_EDGE, False, "Verksamhetssystem"),
    (GREY_FILL, GREY_EDGE, True, "Externa och delade tjänster"),
]
lx = MARGIN
for fill, edge, dashed, label in legend:
    dash = ' stroke-dasharray="5,4"' if dashed else ""
    parts.append(f'<rect x="{lx}" y="{y}" width="26" height="16" rx="4" fill="{fill}" stroke="{edge}" stroke-width="1.5"{dash}/>')
    parts.append(f'<text x="{lx+33}" y="{y+13}" font-size="12.5" fill="{INK}">{esc(label)}</text>')
    lx += 33 + 8 * len(label) + 50
y += 40

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {int(y)}" '
       f'font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" role="img" '
       f'aria-label="Översikt över Sundsvalls kommuns målarkitektur">'
       f'<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
       f'<path d="M 0 1 L 9 5 L 0 9 z" fill="{ARROW}"/></marker></defs>'
       f'<rect width="{W}" height="{int(y)}" fill="#ffffff"/>'
       + "".join(parts) + "</svg>")

with open(OUT, "w", encoding="utf-8") as f:
    f.write(svg)
print(f"Wrote {os.path.normpath(OUT)} ({len(svg)} bytes)")
