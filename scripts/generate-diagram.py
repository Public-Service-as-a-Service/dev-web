#!/usr/bin/env python3
"""Generate the target architecture overview SVG for the site.

The drawing style (palette, box/arrow helpers, legend) follows the
architecture diagrams in the API and web catalogues, so the sites share
one visual language. Run from anywhere: output is written to
assets/diagrams/ in the repo root.
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
GREEN_DARK_FILL = "#d1ecdd"
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


def centered_row(parts, items, y, bw, bh, fill, edge, gap=14, dashed=False, title_size=13.5, sub_size=11):
    total = len(items) * bw + (len(items) - 1) * gap
    x = (W - total) / 2
    centers = []
    for title, sub in items:
        parts.append(box(x, y, bw, bh, title, sub, fill, edge, dashed=dashed, title_size=title_size, sub_size=sub_size))
        centers.append(x + bw / 2)
        x += bw + gap
    return centers


parts = []
y = 16

parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-size="22" font-weight="bold" fill="{PRIMARY_DARK}">Målarkitektur — Sundsvalls kommun</text>')
y += 44
parts.append(f'<text x="{W/2}" y="{y}" text-anchor="middle" font-size="13" fill="{INK_SOFT}">Pilar visar anrop. Digitala kanaler når verksamhetens förmågor via en gemensam API-plattform; bakom den ligger återanvändbara mikrotjänster.</text>')
y += 26

# Layer 1: users
gh_ = 96
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, gh_, "ANVÄNDARE", "#f4f5f7", GREY_EDGE))
centered_row(parts, [("Invånare", None), ("Företag", None), ("Medarbetare", None), ("Andra kommuner", "samverkan och återanvändning")],
             y + 36, 240, 48, GREY_FILL, GREY_EDGE, dashed=True)
users_bottom = y + gh_
y = users_bottom + 40

# Layer 2: channels
ch_h = 128
parts.append(arrow(W / 2, users_bottom, W / 2, y, color=GREY_EDGE, curve=False))
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, ch_h, "DIGITALA KANALER", "#eef4fb", BLUE_EDGE))
centered_row(parts, [
    ("Webbapplikationer", "React/Next.js med backend for frontend"),
    ("E-tjänster", "Open ePlatform"),
    ("AI-assistenter", "AI-plattformen Eneo"),
    ("Mina sidor och portaler", "för invånare, företag och medarbetare"),
], y + 40, 300, 64, BLUE_FILL, BLUE_EDGE)
# SAML IdP to the right
idp_w, idp_h = 200, 56
idp_x = W - MARGIN - idp_w - 10
parts.append(box(idp_x, y - 28, idp_w, idp_h, "SAML IdP", "inloggning (SSO)", GREY_FILL, GREY_EDGE, dashed=True, title_size=13.5, sub_size=11))
channels_bottom = y + ch_h
y = channels_bottom + 46

# Layer 3: API platform
gw, gh2 = 700, 58
parts.append(arrow(W / 2, channels_bottom, W / 2, y, color=BLUE_EDGE, curve=False))
parts.append(f'<text x="{W/2 + 12}" y="{channels_bottom + 28}" font-size="11" fill="{INK_SOFT}">OAuth2 (klientuppgifter) — all trafik går genom plattformen</text>')
parts.append(box((W - gw) / 2, y, gw, gh2, "API-plattform (WSO2)", "api.sundsvall.se — gemensam, säker ingång till alla verksamhets-API:er", GREY_FILL, PRIMARY, title_size=16))
gate_bottom = y + gh2
y = gate_bottom + 46

# Layer 4: microservices
ms_h = 210
parts.append(arrow(W / 2, gate_bottom, W / 2, y, color=GREEN_EDGE, curve=False))
parts.append(group_rect(MARGIN, y, W - 2 * MARGIN, ms_h, "MIKROTJÄNSTER — ETT 70-TAL API:ER MED VAR SITT AVGRÄNSAT ANSVAR", "#f4faf6", GREEN_EDGE))
row1 = [("Kommunikation", "meddelanden, brev, sms, e-post"),
        ("Ärendehantering", "ärenden, status, beslut"),
        ("Ekonomi och fakturering", "fakturaunderlag och fakturor"),
        ("Dokument och arkiv", "lagring, signering, arkivering")]
row2 = [("Samhällsservice", "störningar, felanmälan, avfall"),
        ("Utbildning", "utbildningsdata och sök"),
        ("AI-tjänster", "AI-flöden och assistenter"),
        ("Processmotor (Operaton)", "BPMN/DMN, återanvändbara processteg")]
centered_row(parts, row1, y + 40, 300, 64, GREEN_FILL, GREEN_EDGE)
centered_row(parts, row2, y + 120, 300, 64, GREEN_FILL, GREEN_EDGE)
ms_bottom = y + ms_h
y = ms_bottom + 42

# Layer 5: master data (left) and business systems / external services (right)
half_w = (W - 2 * MARGIN - 24) / 2
right_x = MARGIN + half_w + 24
band_h = 180


def row_in(parts, items, x0, w, y, bw, bh, fill, edge, gap=12, dashed=False, sub_size=10.5):
    total = len(items) * bw + (len(items) - 1) * gap
    x = x0 + (w - total) / 2
    for title, sub in items:
        parts.append(box(x, y, bw, bh, title, sub, fill, edge, dashed=dashed, title_size=13, sub_size=sub_size))
        x += bw + gap


left_cx = MARGIN + half_w / 2
right_cx = right_x + half_w / 2
parts.append(arrow(left_cx, ms_bottom, left_cx, y, curve=False))
parts.append(arrow(right_cx, ms_bottom, right_cx, y, curve=False))
parts.append(f'<text x="{right_cx + 12}" y="{ms_bottom + 26}" font-size="11" fill="{INK_SOFT}">integrations-API:er kapslar in systemen</text>')

parts.append(group_rect(MARGIN, y, half_w, band_h, "MASTER DATA — GEMENSAMMA GRUNDDATA", "#fdf8ea", YELLOW_EDGE))
row_in(parts, [("Party", "partyId i stället för personnummer"),
               ("Citizen", "folkbokförda invånare")], MARGIN, half_w, y + 40, 300, 54, YELLOW_FILL, YELLOW_EDGE)
row_in(parts, [("Employee", "medarbetare och organisation"),
               ("LegalEntity", "företag och organisationer")], MARGIN, half_w, y + 108, 300, 54, YELLOW_FILL, YELLOW_EDGE)

parts.append(group_rect(right_x, y, half_w, band_h, "VERKSAMHETSSYSTEM OCH EXTERNA TJÄNSTER", "#f4f5f7", GREY_EDGE))
row_in(parts, [("Verksamhetssystem", "ByggR, Ecos, Lifecare, Raindance …"),
               ("Nationella tjänster", "SSBTEK, Skolverket, dataportal.se")], right_x, half_w, y + 40, 300, 54, GREY_FILL, GREY_EDGE, dashed=True)
row_in(parts, [("Digitala brevlådor", "Kivra, Min myndighetspost"),
               ("Övriga leverantörer", "sms, tryck, signering …")], right_x, half_w, y + 108, 300, 54, GREY_FILL, GREY_EDGE, dashed=True)
y += band_h + 34

# Notes
notes = [
    "Öppen källkod först — koden delas på github.com/Sundsvallskommun och dokumenteras öppet i API- och webbkatalogerna.",
    "Varje mikrotjänst äger sina data och sin databas; kontraktet mot omvärlden är tjänstens OpenAPI-specifikation.",
    "Plattformen är byggd för flera kommuner: municipalityId ingår i API-vägarna och varje kommun konfigureras för sig.",
]
for note in notes:
    parts.append(f'<text x="{MARGIN}" y="{y}" font-size="12" fill="{INK_SOFT}">• {esc(note)}</text>')
    y += 20
y += 10

# Legend
legend = [
    (BLUE_FILL, BLUE_EDGE, False, "Kommunens applikationer"),
    (GREEN_FILL, GREEN_EDGE, False, "Mikrotjänster (API:er)"),
    (YELLOW_FILL, YELLOW_EDGE, False, "Master data"),
    (GREY_FILL, GREY_EDGE, True, "Externa system och tjänster"),
]
lx = MARGIN
for fill, edge, dashed, label in legend:
    dash = ' stroke-dasharray="5,4"' if dashed else ""
    parts.append(f'<rect x="{lx}" y="{y}" width="26" height="16" rx="4" fill="{fill}" stroke="{edge}" stroke-width="1.5"{dash}/>')
    parts.append(f'<text x="{lx+33}" y="{y+13}" font-size="12.5" fill="{INK}">{esc(label)}</text>')
    lx += 33 + 8 * len(label) + 60
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
