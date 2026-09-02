#!/usr/bin/env python3
"""Generate the architecture-blueprint SVG for design-principer.html.

The drawing is a Swedish rendering of the IT-architecture blueprint in
Per Persson's doctoral dissertation "Managing Socio-Technical Debt"
(University of Gothenburg, 2025, Figure 12), extended with examples from
Sundsvall's own components in every layer. The blueprint reads from the
citizens' touchpoints at the top, through API gateways and end-user
facing services, down to two parallel worlds: legacy systems kept behind
an encapsulation layer (the debt we transform away from) and generic,
scalable capabilities and data (what we transform towards).

The design principles (DPs) are attached as annotations beside the layer
they govern, exactly as in the source figure. The drawing style (palette,
box/arrow helpers, legend) follows scripts/generate-diagram.py so the
site keeps one visual language. Run from anywhere: output is written to
public/arkitektur/assets/diagrams/.

The component examples come from the API catalogue and web catalogue
snapshots used by scripts/generate-ekosystem-diagram.py. Never draw this
by hand — change the script and run it again.
"""

import os

OUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "public", "arkitektur", "assets", "diagrams"
)

# Palette aligned with the site's stylesheet (same as generate-diagram.py)
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
RED_FILL = "#fdeceb"
RED_EDGE = "#b91c1c"
ARROW = "#7d99a1"
DP_FILL = "#f4f5f7"

W = 1400
MARGIN = 40

# The blueprint stack on the left, the design-principle annotations on the right.
MAIN_X = MARGIN
MAIN_W = 950
MAIN_CX = MAIN_X + MAIN_W / 2
ANN_X = MAIN_X + MAIN_W + 30
ANN_W = W - MARGIN - ANN_X


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def box(x, y, w, h, title, sub, fill, edge, dashed=False, title_size=14, sub_size=10.5):
    dash = ' stroke-dasharray="7,5"' if dashed else ""
    s = f'<rect x="{x}" y="{y}" rx="9" width="{w}" height="{h}" fill="{fill}" stroke="{edge}" stroke-width="2"{dash}/>'
    cx = x + w / 2
    if sub:
        s += f'<text x="{cx}" y="{y + h/2 - 3}" text-anchor="middle" font-size="{title_size}" font-weight="bold" fill="{INK}">{esc(title)}</text>'
        s += f'<text x="{cx}" y="{y + h/2 + 14}" text-anchor="middle" font-size="{sub_size}" fill="{INK_SOFT}">{esc(sub)}</text>'
    else:
        s += f'<text x="{cx}" y="{y + h/2 + 5}" text-anchor="middle" font-size="{title_size}" font-weight="bold" fill="{INK}">{esc(title)}</text>'
    return s


def arrow(x1, y1, x2, y2, color=ARROW, dashed=False, both=False):
    dash = ' stroke-dasharray="6,5"' if dashed else ""
    start = ' marker-start="url(#arr)"' if both else ""
    return (f'<path d="M {x1} {y1} L {x2} {y2}" fill="none" stroke="{color}" stroke-width="1.6"{dash}'
            f'{start} marker-end="url(#arr)"/>')


def group_rect(x, y, w, h, label, fill, edge, dashed=False):
    dash = ' stroke-dasharray="7,5"' if dashed else ""
    return (f'<rect x="{x}" y="{y}" rx="12" width="{w}" height="{h}" fill="{fill}" stroke="{edge}" stroke-width="1.5" opacity="0.55"{dash}/>'
            f'<text x="{x+16}" y="{y+23}" font-size="12.5" font-weight="bold" letter-spacing="1" fill="{INK}">{esc(label)}</text>')


def row(parts, items, y, bw, bh, fill, edge, cx=None, gap=14, dashed=False,
        title_size=13, sub_size=10):
    """Lay out a centred row of boxes; returns the x centre of each box."""
    cx = MAIN_CX if cx is None else cx
    total = len(items) * bw + (len(items) - 1) * gap
    x = cx - total / 2
    centers = []
    for title, sub in items:
        parts.append(box(x, y, bw, bh, title, sub, fill, edge, dashed=dashed,
                         title_size=title_size, sub_size=sub_size))
        centers.append(x + bw / 2)
        x += bw + gap
    return centers


def person(parts, cx, y, label, color=PRIMARY):
    """A small actor pictogram with a caption underneath."""
    parts.append(f'<circle cx="{cx}" cy="{y + 8}" r="8" fill="none" stroke="{color}" stroke-width="1.8"/>')
    parts.append(f'<path d="M {cx-13} {y+34} a 13 13 0 0 1 26 0" fill="none" stroke="{color}" stroke-width="1.8"/>')
    parts.append(f'<text x="{cx}" y="{y + 50}" text-anchor="middle" font-size="12" fill="{INK}">{esc(label)}</text>')


def gateway(parts, cx, y, w=340):
    """The HTTP verbs above an API-gateway bar. Returns the bar's bottom y."""
    verbs = ["POST", "GET", "PATCH", "DELETE"]
    step = w / (len(verbs) + 1)
    x0 = cx - w / 2
    for i, verb in enumerate(verbs):
        vx = x0 + step * (i + 1)
        parts.append(f'<circle cx="{vx}" cy="{y + 9}" r="7" fill="#ffffff" stroke="{PRIMARY}" stroke-width="1.8"/>')
        parts.append(f'<path d="M {vx} {y+16} L {vx} {y+24}" stroke="{PRIMARY}" stroke-width="1.8"/>')
        parts.append(f'<text x="{vx}" y="{y + 38}" text-anchor="middle" font-size="10.5" fill="{INK_SOFT}">{verb}</text>')
    bar_y = y + 44
    parts.append(box(x0, bar_y, w, 30, "API-gateway", None, GREY_FILL, PRIMARY, title_size=13))
    return bar_y + 30


def annotation(parts, y, heading, lines, note=None, cursor=0):
    """A dashed design-principle callout in the right-hand column.

    The callout is drawn beside the layer it governs, but never on top of
    the previous one: pass the returned cursor along to the next call.
    """
    y = max(y, cursor + 10)
    h = 30 + len(lines) * 16 + (20 if note else 0)
    parts.append(f'<rect x="{ANN_X}" y="{y}" rx="8" width="{ANN_W}" height="{h}" fill="{DP_FILL}" '
                 f'stroke="{INK_SOFT}" stroke-width="1.5" stroke-dasharray="6,4"/>')
    parts.append(f'<text x="{ANN_X + ANN_W/2}" y="{y + 19}" text-anchor="middle" font-size="12.5" '
                 f'font-weight="bold" fill="{INK}">{esc(heading)}</text>')
    ly = y + 36
    for line in lines:
        indent = 12
        if line.startswith("- "):
            line = line[2:]
            indent = 26
            parts.append(f'<path d="M {ANN_X+16} {ly-9} L {ANN_X+16} {ly-4} L {ANN_X+22} {ly-4}" '
                         f'fill="none" stroke="{INK_SOFT}" stroke-width="1"/>')
        parts.append(f'<text x="{ANN_X + indent}" y="{ly}" font-size="11" fill="{INK}">{esc(line)}</text>')
        ly += 16
    if note:
        parts.append(f'<text x="{ANN_X + 12}" y="{ly + 4}" font-size="10" font-style="italic" fill="{INK_SOFT}">{esc(note)}</text>')
    return y + h


def caption(parts, cx, y, text):
    parts.append(f'<text x="{cx}" y="{y}" text-anchor="middle" font-size="11" fill="{INK_SOFT}">{esc(text)}</text>')


def examples(parts, x, y, text, width_hint=None):
    parts.append(f'<text x="{x}" y="{y}" font-size="11" fill="{INK_SOFT}">{esc(text)}</text>')
    return y + 15


def legend_row(parts, legend, y):
    lx = MARGIN
    for fill, edge, dashed, label in legend:
        dash = ' stroke-dasharray="5,4"' if dashed else ""
        parts.append(f'<rect x="{lx}" y="{y}" width="26" height="16" rx="4" fill="{fill}" stroke="{edge}" stroke-width="1.5"{dash}/>')
        parts.append(f'<text x="{lx+33}" y="{y+13}" font-size="12.5" fill="{INK}">{esc(label)}</text>')
        lx += 33 + 7.6 * len(label) + 34


def write_svg(filename, parts, height, aria_label):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {int(height)}" '
           f'font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" role="img" '
           f'aria-label="{esc(aria_label)}">'
           f'<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
           f'<path d="M 0 1 L 9 5 L 0 9 z" fill="{ARROW}"/></marker>'
           f'<marker id="arrbig" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">'
           f'<path d="M 0 1 L 9 5 L 0 9 z" fill="{PRIMARY}"/></marker></defs>'
           f'<rect width="{W}" height="{int(height)}" fill="#ffffff"/>'
           + "".join(parts) + "</svg>")
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, filename)
    with open(out, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Wrote {os.path.normpath(out)} ({len(svg)} bytes)")


def build_blueprint():
    parts = []
    y = 16

    parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-size="22" font-weight="bold" fill="{PRIMARY_DARK}">Arkitekturens blueprint — designprinciperna i praktiken</text>')
    y += 42
    parts.append(f'<text x="{W/2}" y="{y}" text-anchor="middle" font-size="13" fill="{INK_SOFT}">Pilar visar anrop. De streckade rutorna till höger visar vilka designprinciper som styr varje lager; texten i varje lager ger exempel ur kommunens egna komponenter.</text>')
    y += 30

    # --- Users -------------------------------------------------------------
    person(parts, MAIN_CX, y, "Invånare, företagare och medarbetare")
    users_bottom = y + 54
    y = users_bottom + 22

    # --- Layer 1: end-user touchpoints -------------------------------------
    parts.append(arrow(MAIN_CX, users_bottom, MAIN_CX, y, color=BLUE_EDGE))
    touch_h = 118
    parts.append(group_rect(MAIN_X, y, MAIN_W, touch_h, "SLUTANVÄNDARENS KONTAKTYTOR", "#eef4fb", BLUE_EDGE))
    row(parts, [
        ("Webb", "webbtjänster och mina sidor"),
        ("App", "mobila tjänster och assistenter"),
    ], y + 36, 300, 52, BLUE_FILL, BLUE_EDGE, title_size=15)
    caption(parts, MAIN_CX, y + 106,
            "Exempel: Mina sidor för företag · Felanmälan · Sundsvallsminnen · Luftkvalitet i Sundsvall — 39 webbapplikationer i webbkatalogen, alla som öppen källkod.")
    ann = annotation(parts, y - 6, "Medborgarcentrering", [
        "DP1. Tillgång", "DP2. Aktualitet", "DP3. Vägledning",
        "DP4. Transparens", "DP5. Personalisering",
    ])
    touch_bottom = y + touch_h
    y = touch_bottom + 34

    # --- Layer 2: the outer API gateway ------------------------------------
    parts.append(arrow(MAIN_CX, touch_bottom, MAIN_CX, y, color=BLUE_EDGE))
    gw_bottom = gateway(parts, MAIN_CX, y, w=380)
    for i, line in enumerate([
        "Exempel: kommunens API-plattform —",
        "en krypterad och autentiserad ingång",
        "till alla 75 API:er i API-katalogen.",
    ]):
        parts.append(f'<text x="{MAIN_X + 4}" y="{y + 34 + i * 15}" font-size="10.5" fill="{INK_SOFT}">{esc(line)}</text>')
    y = gw_bottom + 34

    # One callout for the whole transferability family, sitting midway between
    # the gateway it describes and the services beneath it.
    merged = ["DP1. Överförbarhet i stort", "DP2. Interoperabilitet", "DP3. Öppen källkod"]
    merged_h = 30 + len(merged) * 16 + 20
    ann = annotation(parts, (gw_bottom + y) / 2 - merged_h / 2, "Överförbarhet", merged,
                     note="öppna API:er enligt OpenAPI, öppen källkod när det är möjligt",
                     cursor=ann)

    # --- Layer 3: end-user facing services ---------------------------------
    parts.append(arrow(MAIN_CX, gw_bottom + 4, MAIN_CX, y, color=GREEN_EDGE))
    svc_h = 108
    parts.append(group_rect(MAIN_X, y, MAIN_W, svc_h, "SLUTANVÄNDARNÄRA TJÄNSTER", "#f4faf6", GREEN_EDGE))
    row(parts, [("CaseStatus", None), ("MyRepresentative", None), ("ContactSettings", None),
                ("Invoices", None), ("PartyAssets", None)], y + 36, 168, 46,
        GREEN_FILL, GREEN_EDGE, gap=12, title_size=12)
    parts.append(f'<text x="{MAIN_CX}" y="{y + 100}" text-anchor="middle" font-size="11" fill="{INK_SOFT}">sätter samman flera komponenter till det en kanal behöver — utan egen verksamhetslogik</text>')
    svc_bottom = y + svc_h
    y = svc_bottom + 30

    # --- Layer 4: two inner gateways ---------------------------------------
    left_x, left_w = MAIN_X, 440
    right_x, right_w = MAIN_X + 510, 440
    left_cx, right_cx = left_x + left_w / 2, right_x + right_w / 2

    parts.append(arrow(MAIN_CX - 150, svc_bottom, left_cx, y, color=YELLOW_EDGE))
    parts.append(arrow(MAIN_CX + 150, svc_bottom, right_cx, y, color=GREEN_EDGE))
    gwl_bottom = gateway(parts, left_cx, y, w=320)
    gwr_bottom = gateway(parts, right_cx, y, w=320)
    ann = annotation(parts, y + 10, "Överförbarhet", ["DP2. Interoperabilitet"],
                     note="samma öppna gränssnitt i båda världarna", cursor=ann)
    y = max(gwl_bottom, gwr_bottom) + 22

    # --- Layer 5a: encapsulation over legacy systems ------------------------
    enc_h = 278
    parts.append(group_rect(left_x, y, left_w, enc_h, "INKAPSLINGSLAGER — DÄR ARVET FINNS KVAR", "#fdf8ea", YELLOW_EDGE))
    row(parts, [("RPA", None), ("Integration", None), ("Databasfasad", None)],
        y + 34, 132, 42, YELLOW_FILL, YELLOW_EDGE, cx=left_cx, gap=12, title_size=12)

    silo_y = y + 96
    parts.append(f'<rect x="{left_x + 46}" y="{silo_y}" rx="10" width="{left_w - 92}" height="128" fill="#ffffff" '
                 f'stroke="{GREY_EDGE}" stroke-width="1.5" stroke-dasharray="7,5"/>')
    parts.append(f'<text x="{left_cx}" y="{silo_y + 120}" text-anchor="middle" font-size="11" fill="{INK_SOFT}">Stuprörsdrift — och så vidare</text>')
    row(parts, [("Användargränssnitt", None)], silo_y + 14, 200, 30, GREY_FILL, GREY_EDGE, cx=left_cx + 34, title_size=11.5)
    row(parts, [("Verksamhetssystem", None)], silo_y + 50, 200, 30, GREY_FILL, GREY_EDGE, cx=left_cx + 34, title_size=11.5)
    row(parts, [("Data", None)], silo_y + 82, 200, 26, GREY_FILL, GREY_EDGE, cx=left_cx + 34, title_size=11.5)
    person(parts, left_x + 92, silo_y + 6, "Handläggare", color=GREY_EDGE)
    parts.append(arrow(left_x + 108, silo_y + 26, left_cx + 34 - 100, silo_y + 29, color=GREY_EDGE))
    parts.append(f'<text x="{left_x + 58}" y="{silo_y + 104}" font-size="13" font-weight="bold" font-style="italic" fill="{RED_EDGE}">Skuld</text>')
    caption(parts, left_cx, y + 258,
            "Invånaren möter aldrig arvet direkt — bara inkapslingens API:er.")
    enc_bottom = y + enc_h

    # --- Layer 5b: generic, scalable capabilities and data ------------------
    gen_h = 278
    parts.append(group_rect(right_x, y, right_w, gen_h, "GENERISKA, SKALBARA FÖRMÅGOR OCH DATA", "#f4faf6", GREEN_EDGE))
    row(parts, [("Messaging", None), ("SupportManagement", None)], y + 34, 200, 40,
        GREEN_FILL, GREEN_EDGE, cx=right_cx, gap=14, title_size=12)
    row(parts, [("CaseData", None), ("Document", None)], y + 84, 200, 40,
        GREEN_FILL, GREEN_EDGE, cx=right_cx, gap=14, title_size=12)
    row(parts, [("Operaton", None), ("ESigning", None)], y + 134, 200, 40,
        GREEN_FILL, GREEN_EDGE, cx=right_cx, gap=14, title_size=12)
    row(parts, [("Party", "grunddata om personer och företag"), ("Employee", "grunddata om medarbetare")],
        y + 184, 200, 46, YELLOW_FILL, YELLOW_EDGE, cx=right_cx, gap=14, title_size=12, sub_size=9)
    caption(parts, right_cx, y + 258,
            "Handläggaren arbetar i samma förmågor som invånaren möter — bara när det behövs.")
    gen_bottom = y + gen_h

    ann = annotation(parts, y + 6, "Styrning", [
        "DP1. Ägandeskap över data", "DP2. Transparens",
    ], note="egna data, egna regler, egna algoritmer", cursor=ann)
    ann = annotation(parts, y + 92, "Överförbarhet", [
        "DP1. Överförbarhet i stort", "- DP3. Öppen källkod",
    ], note="när det är möjligt", cursor=ann)
    annotation(parts, y + 178, "Medborgarcentrering", [
        "DP4. Transparens",
    ], note="spårbar handläggning, öppen status", cursor=ann)

    y = max(enc_bottom, gen_bottom) + 10
    y = examples(parts, MAIN_X + 4, y + 12,
                 "Exempel inkapsling: ByggrIntegrator · OepIntegrator · LifecareIntegrator · CaseManagement — API:er som kapslar in upphandlade system utan att bygga om dem.")
    y = examples(parts, MAIN_X + 4, y,
                 "Exempel generiska förmågor: Messaging · SupportManagement · CaseData · Document · ESigning · Operaton · metakatalogens Party, Citizen och Employee.")
    y += 22

    # --- The transformation arrow ------------------------------------------
    parts.append(f'<ellipse cx="{MAIN_X + 66}" cy="{y + 14}" rx="66" ry="17" fill="{BLUE_FILL}" stroke="{PRIMARY}" stroke-width="2"/>')
    parts.append(f'<text x="{MAIN_X + 66}" y="{y + 19}" text-anchor="middle" font-size="13" font-weight="bold" fill="{INK}">Transformera</text>')
    parts.append(f'<path d="M {MAIN_X + 140} {y + 14} L {W - MARGIN - 10} {y + 14}" fill="none" stroke="{PRIMARY}" stroke-width="3" marker-end="url(#arrbig)"/>')
    parts.append(f'<text x="{MAIN_X + 300}" y="{y + 6}" font-size="13" font-weight="bold" font-style="italic" fill="{INK}">Från inkapslat arv</text>')
    parts.append(f'<text x="{MAIN_X + 640}" y="{y + 6}" font-size="13" font-weight="bold" font-style="italic" fill="{INK}">Till generiska, öppna komponenter</text>')
    y += 44

    gov_h = 76
    parts.append(f'<rect x="{MAIN_X}" y="{y}" rx="8" width="{MAIN_W}" height="{gov_h}" fill="{DP_FILL}" '
                 f'stroke="{INK_SOFT}" stroke-width="1.5" stroke-dasharray="6,4"/>')
    parts.append(f'<text x="{MAIN_X + 16}" y="{y + 22}" font-size="12.5" font-weight="bold" fill="{INK}">Styrning — det som gör transformationen möjlig</text>')
    parts.append(f'<text x="{MAIN_X + 16}" y="{y + 42}" font-size="11" fill="{INK}">DP3. Sund upphandling  ·  DP4. Förvaltarskap för öppen källkod  ·  DP5. Bryta status quo</text>')
    parts.append(f'<text x="{MAIN_X + 16}" y="{y + 60}" font-size="10.5" font-style="italic" fill="{INK_SOFT}">Exempel: API-krav vid upphandling · publicering på GitHub · delning mellan kommuner via Kommuna</text>')
    y += gov_h + 30

    notes = [
        "Tekniken ensam räcker inte: utan styrningsprinciperna blir en ny arkitektur bara ett nytt lager ovanpå samma arbetssätt.",
        "Inkapsling och nybygge är två vägar till samma mål — skillnaden ligger i kostnad, komplexitet och tid, inte i vad invånaren möter.",
        "Kontaktytorna innehåller ingen verksamhetslogik, vilket gör att komponenterna bakom kan bytas ut utan att användarens upplevelse påverkas.",
    ]
    for note in notes:
        parts.append(f'<text x="{MARGIN}" y="{y}" font-size="12" fill="{INK_SOFT}">• {esc(note)}</text>')
        y += 20
    y += 12

    legend_row(parts, [
        (BLUE_FILL, BLUE_EDGE, False, "Kontaktytor"),
        (GREEN_FILL, GREEN_EDGE, False, "Generiska komponenter"),
        (YELLOW_FILL, YELLOW_EDGE, False, "Inkapsling och masterdata"),
        (GREY_FILL, GREY_EDGE, True, "Arv i stuprör"),
        (DP_FILL, INK_SOFT, True, "Designprinciper"),
    ], y)
    y += 42

    write_svg("design-principer.svg", parts, y,
              "Arkitekturens blueprint för Sundsvalls kommun")


build_blueprint()
