#!/usr/bin/env python3
"""Generate per-application architecture SVG diagrams for the web catalogue.

One diagram per entry in scripts/apps-data.json; the data is derived from each
source repository (API config, environment validation, controllers/services and
feature flags). Run from anywhere: output is written to assets/diagrams/ in the
repo root.
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

def diagram(filename, title, core, domain_apis, master_apis, notes,
            client_sub="frontend (React/Next.js) + backend (Node.js) — web-app-draken-public",
            auth_label="SAML IdP", auth_sub="inloggning med SSO", externals=None):
    """core: (name, sub) or None; domain_apis/master_apis: list of (name, version, sub)."""
    parts = []
    y = 16
    parts.append(f'<text x="{W/2}" y="{y+18}" text-anchor="middle" font-size="22" font-weight="bold" fill="{PRIMARY_DARK}">Lösningsarkitektur — {esc(title)}</text>')
    y += 44
    has_apis = bool(core or domain_apis or master_apis)
    subtitle = ("Pilar visar anrop. Alla verksamhetsanrop går från webbappens backend via kommunens API-plattform (WSO2)."
                if has_apis else "Pilar visar anrop och integrationer, härledda ur källkodens konfiguration.")
    parts.append(f'<text x="{W/2}" y="{y}" text-anchor="middle" font-size="13" fill="{INK_SOFT}">{subtitle}</text>')
    y += 24

    # Client box + auth box
    cw, ch = 420, 74
    cx = (W - cw) / 2
    parts.append(box(cx, y, cw, ch, "Webb-app", client_sub, BLUE_FILL, BLUE_EDGE, title_size=17))
    if auth_label:
        idp_w, idp_h = 240, 60
        idp_x = W - idp_w - 30
        parts.append(box(idp_x, y + 7, idp_w, idp_h, auth_label, auth_sub, GREY_FILL, GREY_EDGE, dashed=True))
        parts.append(arrow(cx + cw, y + ch / 2, idp_x, y + 7 + idp_h / 2, dashed=True, curve=False))
        parts.append(f'<text x="{(cx+cw+idp_x)/2}" y="{y + ch/2 - 10}" text-anchor="middle" font-size="11" fill="{GREY_EDGE}">autentisering</text>')
    client_bottom = (cx + cw / 2, y + ch)
    y += ch + 52

    bw, bh = 205, 64
    margin = 40
    inner_pad = 20
    fan_source = client_bottom

    if has_apis:
        # Gateway bar
        gw, gh = 640, 58
        gx = (W - gw) / 2
        parts.append(arrow(client_bottom[0], client_bottom[1], W / 2, y, color=BLUE_EDGE, curve=False))
        parts.append(f'<text x="{W/2 + 12}" y="{client_bottom[1] + 30}" font-size="11" fill="{INK_SOFT}">OAuth2 (CLIENT_KEY/CLIENT_SECRET)</text>')
        parts.append(box(gx, y, gw, gh, "API-plattform (WSO2)", "api.sundsvall.se — gemensam ingång till alla verksamhets-API:er", GREY_FILL, PRIMARY, title_size=16))
        gate_bottom = (W / 2, y + gh)
        fan_source = gate_bottom
        y += gh + 56

    # Domain APIs group (core first, highlighted)
    apis = ([core] if core else []) + domain_apis
    if apis:
        pos, rows_bottom = rows_layout(apis, margin + inner_pad, W - margin - inner_pad, y + 40, bw, bh)
        parts.append(group_rect(margin, y, W - 2 * margin, rows_bottom - y + inner_pad, "VERKSAMHETS-API:ER — anropas av webb-appen via API-plattformen", "#f4faf6", GREEN_EDGE))
        for (name, ver, sub), (bx, by) in zip(apis, pos):
            is_core = core is not None and name == core[0] and ver == core[1]
            fill = GREEN_CORE_FILL if is_core else GREEN_FILL
            label = f"{name} {ver}".strip()
            parts.append(box(bx, by, bw, bh, label, sub, fill, GREEN_EDGE, title_size=14))
            parts.append(arrow(fan_source[0], fan_source[1], bx + bw / 2, by))
        y = rows_bottom + inner_pad + 34

    # Master data group
    if master_apis:
        pos, rows_bottom = rows_layout(master_apis, margin + inner_pad, W - margin - inner_pad, y + 40, bw, bh)
        parts.append(group_rect(margin, y, W - 2 * margin, rows_bottom - y + inner_pad, "MASTER-DATA-API:ER — uppslag av personer, medarbetare och organisationer", "#fdf9ef", YELLOW_EDGE))
        for (name, ver, sub), (bx, by) in zip(master_apis, pos):
            parts.append(box(bx, by, bw, bh, f"{name} {ver}", sub, YELLOW_FILL, YELLOW_EDGE, title_size=14))
            parts.append(arrow(fan_source[0], fan_source[1], bx + bw / 2, by))
        y = rows_bottom + inner_pad + 28

    # External systems / integrations group
    if externals:
        ext = [(name, "", sub) for name, sub in externals]
        pos, rows_bottom = rows_layout(ext, margin + inner_pad, W - margin - inner_pad, y + 40, bw, bh)
        parts.append(group_rect(margin, y, W - 2 * margin, rows_bottom - y + inner_pad, "EXTERNA SYSTEM OCH INTEGRATIONER", "#f4f5f7", GREY_EDGE))
        for (name, _ver, sub), (bx, by) in zip(ext, pos):
            parts.append(box(bx, by, bw, bh, name, sub, GREY_FILL, GREY_EDGE, dashed=True, title_size=14))
            parts.append(arrow(client_bottom[0], client_bottom[1], bx + bw / 2, by, dashed=True))
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

# --- Data-driven diagrams for all applications (scripts/apps-data.json) ---

MASTER_NAMES = {"citizen", "employee", "legalentity", "party", "activedirectory"}


def clip(s, n):
    """Trim text so it fits inside a diagram box."""
    s = (s or "").strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"

_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "apps-data.json")
if os.path.exists(_data_path):
    import json

    with open(_data_path, encoding="utf-8") as f:
        _apps = json.load(f)
    for _app in _apps:
        _apis = _app.get("apis") or []
        _domain = [(clip(a["name"], 22), a.get("version") or "", clip(a.get("usage"), 33)) for a in _apis
                   if a["name"].lower().replace("-", "") not in MASTER_NAMES]
        _master = [(clip(a["name"], 22), a.get("version") or "", clip(a.get("usage"), 33)) for a in _apis
                   if a["name"].lower().replace("-", "") in MASTER_NAMES]
        _core = _domain[0] if _domain else None
        _rest = _domain[1:] if _domain else []
        _auth = _app.get("auth") or ""
        if "saml" in _auth.lower():
            _auth_label, _auth_sub = "SAML IdP", "inloggning med SSO"
        elif _auth and "ingen" not in _auth.lower():
            _auth_label, _auth_sub = "Inloggning", _auth
        else:
            _auth_label, _auth_sub = None, None
        _integ = _app.get("integrationer") or []
        _has_apis = bool(_domain or _master)
        _externals = [(clip(name, 24), "integration") for name in _integ
                      if "saml" not in name.lower()
                      and not (_has_apis and ("wso2" in name.lower() or "api-gateway" in name.lower()
                                              or "api.sundsvall" in name.lower()))][:10]
        _teknik = _app.get("teknik") or {}
        _parts = [p for p in [_teknik.get("frontend"), _teknik.get("backend")] if p]
        _client_sub = (" + ".join(_parts) + " — " + _app["repo"]) if _parts else _app["repo"]
        if len(_client_sub) > 95:
            _client_sub = _app["repo"]
        diagram(
            f"{_app['slug']}.svg",
            _app["namn"],
            _core,
            _rest,
            _master,
            (_app.get("anteckningar") or [])[:3],
            client_sub=_client_sub,
            auth_label=_auth_label,
            auth_sub=_auth_sub,
            externals=_externals or None,
        )
