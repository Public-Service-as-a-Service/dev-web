#!/usr/bin/env python3
"""Generate the ecosystem overview SVG for the standalone page ekosystemet.html.

One large drawing of the whole ecosystem: every web application in the
web catalogue, every API in the API catalogue, the APIs each web calls,
and how the APIs integrate with each other (e.g. Party calling Citizen
and LegalEntity). The drawing style (palette, boxes, bands, legend)
follows scripts/generate-diagram.py so the site keeps one visual
language. Run from anywhere: output is written to assets/diagrams/.

The data below is a snapshot (2026-08-27) extracted from the catalogues:

- WEBS:  web-catalogue  scripts/apps-data.json  (fields namn/kategori/apis)
         plus the three catalogue pages that are not in apps-data.json
         (generisk-arendehantering, myndighetsutovning-mark-och-exploatering,
         myndighetsutovning-parkeringstillstand — API lists from their
         "API-beroenden" tables).
- APIS:  api-catalogue  scripts/apis-data.json  (fields namn/kategori/beroenden)

Dependency names are normalised to the catalogue names (Contract ->
Contracts, Relation -> Relations, PostPortalService -> Postportalservice,
and so on). Names that do not exist in the API catalogue are drawn either
as master data APIs (the metakatalog family: Citizen, LegalEntity,
Company, Employee, ActiveDirectory, MDBuilder, MDViewer, MetaAdmin) or as
APIs/services outside the catalogues (grey, dashed). To refresh the data,
re-extract from the two catalogue repos and update the literals.

The layout is computed, not hand-drawn: webs on top, catalogue APIs in
dependency layers (callers above callees, longest-path layering with
cycle-breaking), master data and out-of-catalogue services at the bottom.
Horizontal order within each layer is refined with barycenter sweeps to
reduce edge crossings. Arrows point from caller to callee.
"""

import os
from collections import defaultdict

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "diagrams")

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

W = 2760
MARGIN = 40

# ---------------------------------------------------------------------------
# Data snapshot from the catalogues (see module docstring)
# ---------------------------------------------------------------------------

WEBS = [
    ('AI-chattbot för webbplatser', 'AI-tjänster', []),
    ('AI-sammanställningar av dokument', 'AI-tjänster', ['AiFlow', 'SimulatorServer']),
    ('Direkttextning och översättning av tal', 'AI-tjänster', []),
    ('Inbäddningsbar AI-assistentmodul', 'AI-tjänster', []),
    ('Inbäddningsbar AI-serviceassistent', 'AI-tjänster', []),
    ('Pratomaten', 'AI-tjänster', ['SimulatorServer']),
    ('Proxytjänst för AI-assistenter', 'AI-tjänster', ['Eneo-Sundsvall', 'SimulatorServer']),
    ('Proxytjänst för AI-assistenter (Intric)', 'AI-tjänster', ['SimulatorServer']),
    ('Administration av ärendemetadata', 'Administration', ['ActiveDirectory', 'SimulatorServer', 'SupportManagement']),
    ('Administrationspanel för ärendehantering', 'Administration', ['JsonSchema', 'SimulatorServer', 'SupportManagement', 'Templating']),
    ('Kontohantering för LOV-utförare', 'Administration', ['Citizen', 'Employee', 'MetaAdmin', 'SimulatorServer']),
    ('Nya metakatalogen', 'Administration', ['Employee', 'MDBuilder', 'MDViewer', 'Messaging']),
    ('Systemregistret', 'Administration', []),
    ('Mina sidor för företag hos kommunen', 'Företagstjänster', ['CaseData', 'CaseStatus', 'Citizen', 'ContactSettings', 'Employee', 'Invoices', 'JsonSchema', 'LegalEntity', 'Messaging', 'MyRepresentative', 'PartyAssets', 'SimulatorServer', 'SupportManagement', 'WebMessageCollector']),
    ('Mina sidor för företagskunder hos kommunala bolag', 'Företagstjänster', ['ActiveDirectory', 'Agreement', 'BFUS', 'Citizen', 'ContactSettings', 'Customer', 'Disturbance', 'Employee', 'Eneo-Sundsvall', 'Eventlog', 'InstalledBase', 'Invoices', 'LegalEntity', 'MeasurementData', 'MyRepresentative', 'SelfServiceAi', 'SimulatorServer']),
    ('Felanmälan', 'Invånartjänster', ['Eneo-Sundsvall', 'SupportManagement']),
    ('Luftkvalitet i Sundsvall', 'Invånartjänster', ['OpenData', 'SimulatorServer']),
    ('Sundsvallsminnen – digitalt kulturarvsarkiv', 'Invånartjänster', ['Memories']),
    ('Digital checklista för introduktion av medarbetare', 'Medarbetartjänster', ['Checklist', 'Company', 'Employee', 'SimulatorServer']),
    ('Digital checklista för introduktion av nyanställda', 'Medarbetartjänster', ['Employee', 'Onboarding']),
    ('Digitala personakter för medarbetare', 'Medarbetartjänster', ['Citizen', 'Document', 'Employee', 'FoundationObjects', 'Party', 'SimulatorServer']),
    ('Dokumentsökning', 'Medarbetartjänster', ['Document', 'Party']),
    ('Postportalen', 'Medarbetartjänster', ['Citizen', 'Company', 'Employee', 'LegalEntity', 'MessagingSettings', 'Postportalservice', 'SimulatorServer']),
    ('Myndighetsutövning – mark och exploatering', 'Myndighetsutövning', ['ActiveDirectory', 'Billing Data Collector', 'Billing Preprocessor', 'CaseData', 'CaseStatus', 'Citizen', 'Company', 'Contracts', 'Employee', 'Estateinfo', 'LegalEntity', 'Messaging', 'Party', 'Relations', 'Templating']),
    ('Myndighetsutövning – parkeringstillstånd', 'Myndighetsutövning', ['ActiveDirectory', 'CaseData', 'CaseStatus', 'Citizen', 'Employee', 'JsonSchema', 'LegalEntity', 'Messaging', 'Party', 'PartyAssets', 'Relations', 'Templating']),
    ('Registrering av färdtjänstärenden', 'Myndighetsutövning', ['CaseData', 'Citizen', 'Employee', 'JsonSchema', 'Messaging', 'PartyAssets', 'SimulatorServer']),
    ('Ärendehantering för ekonomiskt bistånd', 'Myndighetsutövning', ['Citizen', 'Messaging', 'SimulatorServer']),
    ('Elevkontohantering', 'Utbildning', ['Education', 'Employee', 'PupilAccountManager', 'SimulatorServer']),
    ('Med livet som insats – interaktiva AI-scenarier', 'Utbildning', ['Eneo-Sundsvall', 'SimulatorServer']),
    ('Resultatprognoser för skolan', 'Utbildning', ['Education', 'Employee', 'PupilForecast', 'SimulatorServer']),
    ('Skåphantering för skolor', 'Utbildning', ['Citizen', 'Education', 'Messaging', 'PupilLocker', 'SimulatorServer']),
    ('Yrkesutbildning Mitt', 'Utbildning', ['EducationFinder', 'Messaging', 'SimulatorServer']),
    ('Processmodellering för automatiserade flöden', 'Utvecklingsverktyg', ['Operaton']),
    ('Startmall för webbapplikationer', 'Utvecklingsverktyg', ['SimulatorServer']),
    ('Test-IdP för utveckling', 'Utvecklingsverktyg', []),
    ('Test-IdP med användaradministration', 'Utvecklingsverktyg', ['SimulatorServer']),
    ('Generisk ärendehantering', 'Ärendehantering', ['ActiveDirectory', 'Billing Preprocessor', 'CaseData', 'CaseStatus', 'Citizen', 'Employee', 'Estateinfo', 'LegalEntity', 'Party', 'Relations', 'SupportManagement', 'Templating']),
    ('Rapportering och hantering av supportärenden', 'Ärendehantering', ['Citizen', 'Company', 'Employee', 'JsonSchema', 'SimulatorServer', 'SupportManagement']),
    ('Ärenderapportering ekonomiskt bistånd', 'Ärendehantering', ['CareManagement', 'Citizen', 'Company', 'Employee', 'JsonSchema', 'SimulatorServer']),
]

APIS = [
    ('AccessMapper', 'Integration', ['ActiveDirectory']),
    ('Agreement', 'Parts- och kunddata', ['DataWarehouseReader']),
    ('AI Data Collector', 'AI-tjänster', []),
    ('AiFlow', 'AI-tjänster', ['Templating']),
    ('Alkt', 'Samhällsservice', ['Party']),
    ('Archive', 'Dokument och arkiv', ['FormpipeProxy']),
    ('Billing Data Collector', 'Ekonomi och fakturering', ['Billing Preprocessor', 'Contracts', 'Messaging', 'Party', 'Relations']),
    ('Billing Preprocessor', 'Ekonomi och fakturering', ['Messaging', 'Party']),
    ('BusinessInformation', 'Samhällsservice', []),
    ('BusinessRules', 'Ärendehantering', ['PartyAssets']),
    ('ByggrIntegrator', 'Integration', []),
    ('ByggR Archiver', 'Dokument och arkiv', ['Archive', 'Messaging']),
    ('CareManagement', 'Ärendehantering', ['Operaton']),
    ('CaseData', 'Ärendehantering', ['EmailReader', 'Employee', 'Eventlog', 'JsonSchema', 'MessageExchange', 'Messaging', 'MessagingSettings', 'PwLandAndExploitation', 'PwParatransit', 'PwParkingPermit', 'Relations', 'WebMessageCollector']),
    ('CaseStatus', 'Ärendehantering', ['CaseData', 'CaseManagement', 'Eventlog', 'Messaging', 'OepIntegrator', 'Party', 'SupportManagement']),
    ('CaseManagement', 'Integration', ['Alkt', 'CaseData', 'Eventlog', 'Messaging', 'OepIntegrator', 'Party']),
    ('Checklist', 'Ärendehantering', ['Company', 'Employee', 'Eventlog', 'Messaging', 'Templating']),
    ('CitizenChanges', 'Utbildning', ['Citizen', 'Messaging']),
    ('Configuration', 'Utvecklingsverktyg', []),
    ('ContactSettings', 'Parts- och kunddata', []),
    ('Contracts', 'Ärendehantering', ['Billing Data Collector']),
    ('CsvFileReader', 'Integration', []),
    ('Customer', 'Parts- och kunddata', ['DataWarehouseReader']),
    ('DataCatalog', 'Integration', []),
    ('DataWarehouseReader', 'Parts- och kunddata', ['Party']),
    ('Digital Mail Sender', 'Kommunikation', ['Messaging', 'Party']),
    ('DigitalRegisteredLetter', 'Kommunikation', ['Messaging', 'Party', 'Templating']),
    ('Disturbance', 'Samhällsservice', ['Messaging']),
    ('Document', 'Dokument och arkiv', ['Eventlog']),
    ('ESigning', 'Dokument och arkiv', ['ComfactFacade', 'Document', 'Postportalservice', 'PwEsigning']),
    ('EducationData', 'Utbildning', []),
    ('EducationFinder', 'Utbildning', []),
    ('EmailReader', 'Kommunikation', ['Messaging']),
    ('EmailSender', 'Kommunikation', []),
    ('Eventlog', 'Integration', []),
    ('Financial Aid', 'Integration', []),
    ('Garbage', 'Samhällsservice', []),
    ('Incident', 'Samhällsservice', ['Messaging']),
    ('IncidentMapper', 'Integration', ['Messaging']),
    ('Installation', 'Parts- och kunddata', ['DataWarehouseReader']),
    ('InstalledBase', 'Parts- och kunddata', ['DataWarehouseReader', 'Eventlog']),
    ('InvoiceCache', 'Ekonomi och fakturering', ['Party']),
    ('InvoiceSender', 'Ekonomi och fakturering', ['Citizen', 'Messaging', 'Party']),
    ('Invoices', 'Ekonomi och fakturering', ['DataWarehouseReader', 'InvoiceCache']),
    ('JsonSchema', 'Integration', []),
    ('LifecareIntegrator', 'Integration', ['Party']),
    ('ManagerResponsibility', 'Parts- och kunddata', ['Employee']),
    ('MeasurementData', 'Samhällsservice', ['DataWarehouseReader']),
    ('Memories', 'Dokument och arkiv', []),
    ('MessageExchange', 'Kommunikation', []),
    ('Messaging', 'Kommunikation', ['Citizen', 'ContactSettings', 'Digital Mail Sender', 'EmailSender', 'OepIntegrator', 'Party', 'SmsSender', 'SnailMailSender']),
    ('MessagingSettings', 'Kommunikation', ['Employee']),
    ('MyRepresentative', 'Parts- och kunddata', ['LegalEntity', 'Party']),
    ('Notes', 'Ärendehantering', []),
    ('Notifier', 'Kommunikation', ['SmsSender', 'TeamsSender']),
    ('OepIntegrator', 'Integration', ['Party']),
    ('Operaton', 'Integration', ['CareManagement', 'Financial Aid', 'Messaging', 'SupportManagement']),
    ('Party', 'Parts- och kunddata', ['Citizen', 'LegalEntity']),
    ('PartyAssets', 'Parts- och kunddata', ['JsonSchema', 'Messaging', 'Party', 'Relations']),
    ('PermitLoader', 'Integration', ['Party', 'PartyAssets']),
    ('Postportalservice', 'Kommunikation', ['Citizen', 'DigitalRegisteredLetter', 'ESigning', 'LegalEntity', 'Messaging', 'MessagingSettings', 'Party']),
    ('PrivatePreCheck', 'Samhällsservice', ['Citizen', 'PartyAssets']),
    ('QuotationRequest', 'Integration', []),
    ('Relations', 'Integration', []),
    ('RemindAndInform', 'Kommunikation', ['Messaging']),
    ('SeabLoader', 'Ekonomi och fakturering', ['InvoiceCache', 'Messaging']),
    ('SelfServiceAi', 'AI-tjänster', ['Agreement', 'InstalledBase', 'Invoices', 'MeasurementData']),
    ('SimulatorServer', 'Utvecklingsverktyg', []),
    ('SmLoader', 'Integration', ['Messaging', 'OepIntegrator', 'Party', 'SupportManagement']),
    ('SmsSender', 'Kommunikation', []),
    ('SnailMailSender', 'Kommunikation', []),
    ('SupportManagement', 'Ärendehantering', ['AccessMapper', 'Citizen', 'EmailReader', 'Employee', 'Eventlog', 'JsonSchema', 'MessageExchange', 'Messaging', 'MessagingSettings', 'Notes', 'Relations', 'WebMessageCollector']),
    ('SupportCenter', 'Ärendehantering', []),
    ('Templating', 'Dokument och arkiv', []),
    ('WebMessageCollector', 'Kommunikation', ['OepIntegrator']),
]

# Master data — the metakatalog family. Not published in the API catalogue
# but called throughout the ecosystem.
MASTER = [
    ("Citizen", "grunddata om personer"),
    ("LegalEntity", "grunddata om företag"),
    ("Company", "grunddata om organisation"),
    ("Employee", "grunddata om medarbetare"),
    ("ActiveDirectory", "konton och grupper"),
    ("MDBuilder", "bygger metakatalogen"),
    ("MDViewer", "läser metakatalogen"),
    ("MetaAdmin", "administrerar metakatalogen"),
]

# Called APIs and services that are neither in the API catalogue nor part of
# the metakatalog family: internal supporting APIs, wrappers and external or
# shared services.
OTHER = [
    "Eneo-Sundsvall", "OpenData", "BFUS", "Estateinfo", "Onboarding",
    "Education", "PupilAccountManager", "PupilForecast", "PupilLocker",
    "FoundationObjects", "ComfactFacade", "FormpipeProxy", "TeamsSender",
    "PwEsigning", "PwParkingPermit", "PwParatransit", "PwLandAndExploitation",
]

# ---------------------------------------------------------------------------
# Graph model
# ---------------------------------------------------------------------------

API_NAMES = [n for n, _, _ in APIS]
API_SET = set(API_NAMES)
MASTER_SET = {n for n, _ in MASTER}
OTHER_SET = set(OTHER)

WEB_IDS = ["w:" + n for n, _, _ in WEBS]

EDGES = []  # (source id, target id); web ids are prefixed "w:"
for name, _, deps in WEBS:
    for d in deps:
        EDGES.append(("w:" + name, d))
for name, _, deps in APIS:
    for d in deps:
        EDGES.append((name, d))

for src, dst in EDGES:
    ok = dst in API_SET or dst in MASTER_SET or dst in OTHER_SET
    assert ok, f"unknown dependency name: {dst}"

# --- Layering of the catalogue APIs (longest path, callers above callees) ---

api_graph = {n: [d for d in deps if d in API_SET] for n, _, deps in APIS}

back_edges = set()
_state = {}

def _dfs(u):
    _state[u] = 1
    for v in api_graph[u]:
        if _state.get(v) == 1:
            back_edges.add((u, v))
        elif v not in _state:
            _dfs(v)
    _state[u] = 2

for n in API_NAMES:
    if n not in _state:
        _dfs(n)

preds = defaultdict(set)
for u, vs in api_graph.items():
    for v in vs:
        if (u, v) not in back_edges:
            preds[v].add(u)

_layer_cache = {}

def layer_of(n):
    if n not in _layer_cache:
        ps = preds[n]
        _layer_cache[n] = 1 if not ps else 1 + max(layer_of(p) for p in ps)
    return _layer_cache[n]

layers = defaultdict(list)
for n in API_NAMES:
    layers[layer_of(n)].append(n)
N_LAYERS = max(layers)

# --- Node metrics -----------------------------------------------------------

WEB_W, WEB_H = 200, 52
API_H = 30
MASTER_W, MASTER_H = 260, 46
OTHER_H = 28
GAP_X = 10

def api_w(name):
    return max(72, round(7.2 * len(name)) + 24)

def other_w(name):
    return max(70, round(6.8 * len(name)) + 20)

# Ordered groups, top to bottom. Each group is laid out in one or more
# centered rows; horizontal order is refined below.
groups = []  # (kind, [node ids])
groups.append(("web", list(WEB_IDS)))
for L in sorted(layers):
    groups.append(("api", sorted(layers[L], key=lambda n: (next(k for a, k, _ in APIS if a == n), n))))
groups.append(("master", [n for n, _ in MASTER]))
groups.append(("other", list(OTHER)))

def node_w(kind, n):
    if kind == "web":
        return WEB_W
    if kind == "api":
        return api_w(n)
    if kind == "master":
        return MASTER_W
    return other_w(n)

MAX_ROW_W = W - 2 * MARGIN - 24

def chunk_rows(kind, order):
    """Split a group into rows that fit the canvas width."""
    rows, row, wsum = [], [], 0
    for n in order:
        bw = node_w(kind, n)
        if row and wsum + GAP_X + bw > MAX_ROW_W:
            rows.append(row)
            row, wsum = [], 0
        row.append(n)
        wsum += bw + (GAP_X if len(row) > 1 else 0)
    if row:
        rows.append(row)
    return rows

def assign_x(kind, order, xpos):
    for row in chunk_rows(kind, order):
        total = sum(node_w(kind, n) for n in row) + GAP_X * (len(row) - 1)
        x = (W - total) / 2
        for n in row:
            bw = node_w(kind, n)
            xpos[n] = x + bw / 2
            x += bw + GAP_X

# --- Barycenter ordering to reduce crossings --------------------------------

neigh = defaultdict(list)
for s, t in EDGES:
    neigh[s].append(t)
    neigh[t].append(s)

xpos = {}
for kind, order in groups:
    assign_x(kind, order, xpos)

for sweep in range(10):
    seq = groups if sweep % 2 == 0 else list(reversed(groups))
    for kind, order in seq:
        order.sort(key=lambda n: (
            sum(xpos[m] for m in neigh[n]) / len(neigh[n]) if neigh[n] else xpos[n]
        ))
        assign_x(kind, order, xpos)

# --- Vertical placement -----------------------------------------------------

ROW_GAP = 12       # between rows inside a group
LAYER_GAP = 52     # between API layers (room for edges)
BAND_PAD_TOP = 36  # band label height
BAND_PAD_BOT = 16

pos = {}  # node id -> (cx, y_top, w, h)

def place_group(kind, order, y):
    h = {"web": WEB_H, "api": API_H, "master": MASTER_H, "other": OTHER_H}[kind]
    for row in chunk_rows(kind, order):
        for n in row:
            pos[n] = (xpos[n], y, node_w(kind, n), h)
        y += h + ROW_GAP
    return y - ROW_GAP


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def wrap_label(text, width=30):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        cand = (cur + " " + w_).strip()
        if len(cand) > width and cur:
            lines.append(cur)
            cur = w_
        else:
            cur = cand
    if cur:
        lines.append(cur)
    return lines[:3]


parts_bands, parts_edges, parts_nodes, parts_text = [], [], [], []

def band(x, y, w, h, label, fill, edge):
    parts_bands.append(
        f'<rect x="{x}" y="{y}" rx="12" width="{w}" height="{h}" fill="{fill}" stroke="{edge}" stroke-width="1.5" opacity="0.55"/>'
        f'<text x="{x+16}" y="{y+24}" font-size="13" font-weight="bold" letter-spacing="1" fill="{INK}">{esc(label)}</text>')

y = 16
parts_text.append(f'<text x="{W/2}" y="{y+20}" text-anchor="middle" font-size="24" font-weight="bold" fill="{PRIMARY_DARK}">Ekosystemet — alla webbapplikationer, alla API:er och deras integrationer</text>')
y += 48
n_web_edges = sum(1 for s, _ in EDGES if s.startswith("w:"))
n_api_edges = len(EDGES) - n_web_edges
parts_text.append(
    f'<text x="{W/2}" y="{y}" text-anchor="middle" font-size="13.5" fill="{INK_SOFT}">'
    f'{len(WEBS)} webbapplikationer, {len(APIS)} API:er i katalogen samt masterdata och tjänster utanför katalogerna. '
    f'Pilar visar anrop ({n_web_edges} webb till API, {n_api_edges} API till API). Alla anrop går via API-plattformen.</text>')
y += 30

# Web band
web_rows = chunk_rows("web", groups[0][1])
band_h = BAND_PAD_TOP + len(web_rows) * (WEB_H + ROW_GAP) - ROW_GAP + BAND_PAD_BOT
band(MARGIN, y, W - 2 * MARGIN, band_h, f"WEBBAPPLIKATIONER — {len(WEBS)} ST (WEBBKATALOGEN)", "#eef4fb", BLUE_EDGE)
place_group("web", groups[0][1], y + BAND_PAD_TOP)
y += band_h + 44

# API band
api_groups = [g for g in groups if g[0] == "api"]
api_band_top = y
y_inner = y + BAND_PAD_TOP + 6
for i, (_, order) in enumerate(api_groups):
    rows = chunk_rows("api", order)
    bottom = place_group("api", order, y_inner)
    y_inner = bottom + LAYER_GAP
api_band_h = (y_inner - LAYER_GAP) - api_band_top + BAND_PAD_BOT
band(MARGIN, api_band_top, W - 2 * MARGIN, api_band_h,
     f"API:ER PÅ API-PLATTFORMEN — {len(APIS)} ST (API-KATALOGEN) — ANROPANDE API:ER ÖVER ANROPADE", "#f4faf6", GREEN_EDGE)
y = api_band_top + api_band_h + 44

# Master data band
master_rows = chunk_rows("master", [n for n, _ in MASTER])
band_h = BAND_PAD_TOP + len(master_rows) * (MASTER_H + ROW_GAP) - ROW_GAP + BAND_PAD_BOT
band(MARGIN, y, W - 2 * MARGIN, band_h, "MASTERDATA — METAKATALOGEN MED GEMENSAMMA GRUNDDATA", "#fdf8ea", YELLOW_EDGE)
place_group("master", [g for k, g in groups if k == "master"][0], y + BAND_PAD_TOP)
y += band_h + 40

# Outside-the-catalogue band
other_rows = chunk_rows("other", OTHER)
band_h = BAND_PAD_TOP + len(other_rows) * (OTHER_H + ROW_GAP) - ROW_GAP + BAND_PAD_BOT
band(MARGIN, y, W - 2 * MARGIN, band_h, "ANROPADE API:ER OCH TJÄNSTER UTANFÖR KATALOGERNA — INTERNA STÖD-API:ER, EXTERNA OCH DELADE TJÄNSTER", "#f4f5f7", GREY_EDGE)
place_group("other", [g for k, g in groups if k == "other"][0], y + BAND_PAD_TOP)
y += band_h + 40

# --- Edges ------------------------------------------------------------------

def edge_style(src, dst):
    if dst in MASTER_SET:
        return YELLOW_EDGE, 0.38, "arrY"
    if dst in OTHER_SET:
        return GREY_EDGE, 0.38, "arrK"
    if src.startswith("w:"):
        return BLUE_EDGE, 0.26, "arrB"
    return GREEN_EDGE, 0.38, "arrG"

for src, dst in EDGES:
    x1, ty1, w1, h1 = pos[src]
    x2, ty2, w2, h2 = pos[dst]
    color, opacity, marker = edge_style(src, dst)
    if ty2 > ty1:  # downward: bottom of caller to top of callee
        y1, y2 = ty1 + h1, ty2
        dy = max(26, min(80, (y2 - y1) * 0.45))
        d = f'M {x1:.1f} {y1:.1f} C {x1:.1f} {y1+dy:.1f} {x2:.1f} {y2-dy:.1f} {x2:.1f} {y2:.1f}'
    else:  # upward back edge (cycles): bow out on the right side
        sx, sy = x1 + w1 / 2, ty1 + h1 / 2
        tx, tyy = x2 + w2 / 2, ty2 + h2 / 2
        bow = 70
        d = f'M {sx:.1f} {sy:.1f} C {sx+bow:.1f} {sy:.1f} {tx+bow:.1f} {tyy:.1f} {tx:.1f} {tyy:.1f}'
    parts_edges.append(
        f'<path d="{d}" fill="none" stroke="{color}" stroke-opacity="{opacity}" stroke-width="1.3" marker-end="url(#{marker})"/>')

# --- Nodes ------------------------------------------------------------------

for name, _, _ in WEBS:
    cx, ty, bw, bh = pos["w:" + name]
    x = cx - bw / 2
    parts_nodes.append(f'<rect x="{x:.1f}" y="{ty}" rx="8" width="{bw}" height="{bh}" fill="{BLUE_FILL}" stroke="{BLUE_EDGE}" stroke-width="1.6"/>')
    lines = wrap_label(name)
    lh = 12.5
    y0 = ty + bh / 2 - (len(lines) - 1) * lh / 2 + 3.5
    for i, line in enumerate(lines):
        parts_nodes.append(f'<text x="{cx:.1f}" y="{y0 + i*lh:.1f}" text-anchor="middle" font-size="10.5" font-weight="bold" fill="{INK}">{esc(line)}</text>')

for name in API_NAMES:
    cx, ty, bw, bh = pos[name]
    x = cx - bw / 2
    parts_nodes.append(f'<rect x="{x:.1f}" y="{ty}" rx="7" width="{bw}" height="{bh}" fill="{GREEN_FILL}" stroke="{GREEN_EDGE}" stroke-width="1.6"/>')
    parts_nodes.append(f'<text x="{cx:.1f}" y="{ty + bh/2 + 4:.1f}" text-anchor="middle" font-size="11.5" font-weight="bold" fill="{INK}">{esc(name)}</text>')

for name, sub in MASTER:
    cx, ty, bw, bh = pos[name]
    x = cx - bw / 2
    parts_nodes.append(f'<rect x="{x:.1f}" y="{ty}" rx="8" width="{bw}" height="{bh}" fill="{YELLOW_FILL}" stroke="{YELLOW_EDGE}" stroke-width="1.6"/>')
    parts_nodes.append(f'<text x="{cx:.1f}" y="{ty + bh/2 - 3:.1f}" text-anchor="middle" font-size="12.5" font-weight="bold" fill="{INK}">{esc(name)}</text>')
    parts_nodes.append(f'<text x="{cx:.1f}" y="{ty + bh/2 + 13:.1f}" text-anchor="middle" font-size="10" fill="{INK_SOFT}">{esc(sub)}</text>')

for name in OTHER:
    cx, ty, bw, bh = pos[name]
    x = cx - bw / 2
    parts_nodes.append(f'<rect x="{x:.1f}" y="{ty}" rx="7" width="{bw}" height="{bh}" fill="{GREY_FILL}" stroke="{GREY_EDGE}" stroke-width="1.6" stroke-dasharray="6,4"/>')
    parts_nodes.append(f'<text x="{cx:.1f}" y="{ty + bh/2 + 4:.1f}" text-anchor="middle" font-size="11" font-weight="bold" fill="{INK}">{esc(name)}</text>')

# --- Notes and legend -------------------------------------------------------

called_by = defaultdict(int)
for _, dst in EDGES:
    called_by[dst] += 1
hubs = ", ".join(f"{n} ({c} anrop)" for n, c in sorted(called_by.items(), key=lambda kv: -kv[1])[:5])

notes = [
    "Bilden visar helheten och är medvetet komplett snarare än enkel: varje pil är en verklig anropsrelation hämtad ur webb- och API-katalogernas dokumentation.",
    f"Mest anropade komponenter: {hubs}. SimulatorServer anropas av de flesta webbappar som simulerings- och teststöd under utveckling.",
    "Masterdata-mönstret: Party översätter partId till person- eller organisationsnummer genom att anropa Citizen och LegalEntity — därför behöver övriga API:er bara känna till Party.",
    "API:er i katalogen är skiktade efter beroenden: ett API ligger alltid under de webbappar och API:er som anropar det. Pilar uppåt (böjda åt höger) markerar ömsesidiga beroenden.",
]
for note in notes:
    parts_text.append(f'<text x="{MARGIN}" y="{y}" font-size="12.5" fill="{INK_SOFT}">• {esc(note)}</text>')
    y += 21
y += 12

legend_items = [
    (BLUE_FILL, BLUE_EDGE, False, "Webbapplikation"),
    (GREEN_FILL, GREEN_EDGE, False, "API i API-katalogen"),
    (YELLOW_FILL, YELLOW_EDGE, False, "Masterdata (metakatalogen)"),
    (GREY_FILL, GREY_EDGE, True, "API/tjänst utanför katalogerna"),
]
lx = MARGIN
for fill, edge, dashed, label in legend_items:
    dash = ' stroke-dasharray="5,4"' if dashed else ""
    parts_text.append(f'<rect x="{lx}" y="{y}" width="26" height="16" rx="4" fill="{fill}" stroke="{edge}" stroke-width="1.5"{dash}/>')
    parts_text.append(f'<text x="{lx+33}" y="{y+13}" font-size="12.5" fill="{INK}">{esc(label)}</text>')
    lx += 33 + 8 * len(label) + 40
for color, label in [(BLUE_EDGE, "webb anropar API"), (GREEN_EDGE, "API anropar API"),
                     (YELLOW_EDGE, "anrop till masterdata"), (GREY_EDGE, "anrop utanför katalogerna")]:
    parts_text.append(f'<line x1="{lx}" y1="{y+8}" x2="{lx+26}" y2="{y+8}" stroke="{color}" stroke-opacity="0.7" stroke-width="2"/>')
    parts_text.append(f'<text x="{lx+33}" y="{y+13}" font-size="12.5" fill="{INK}">{esc(label)}</text>')
    lx += 33 + 8 * len(label) + 40
y += 44

# --- Write ------------------------------------------------------------------

markers = "".join(
    f'<marker id="{mid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">'
    f'<path d="M 0 1 L 9 5 L 0 9 z" fill="{color}" fill-opacity="0.7"/></marker>'
    for mid, color in [("arrB", BLUE_EDGE), ("arrG", GREEN_EDGE), ("arrY", YELLOW_EDGE), ("arrK", GREY_EDGE)])

aria = ("Arkitekturritning över hela ekosystemet: alla webbapplikationer i webbkatalogen, "
        "alla API:er i API-katalogen, masterdata och tjänster utanför katalogerna, "
        "med pilar för varje anropsrelation mellan komponenterna.")

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {int(y)}" '
       f'font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" role="img" '
       f'aria-label="{esc(aria)}">'
       f'<defs>{markers}</defs>'
       f'<rect width="{W}" height="{int(y)}" fill="#ffffff"/>'
       + "".join(parts_bands) + "".join(parts_edges) + "".join(parts_nodes) + "".join(parts_text)
       + "</svg>")

out = os.path.join(OUT_DIR, "ekosystemet.svg")
with open(out, "w", encoding="utf-8") as f:
    f.write(svg)
print(f"Wrote {os.path.normpath(out)} ({len(svg)} bytes, {len(WEBS)} webs, {len(APIS)} APIs, {len(EDGES)} edges)")
