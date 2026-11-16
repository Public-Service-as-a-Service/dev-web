import { Label } from '@sk-web-gui/react';
import { type CatalogSearchConfig, type Synonyms, splitCamel } from '@sundsvall/chrome';
import appsData from './scripts/apps-data.json';
import { type AppData, STATUS_LABEL } from './types';

// Webbkatalogens sökning: vilka fält som söks, synonymerna och filtren. Själva
// sökmotorn och gränssnittet ligger i @sundsvall/chrome och delas med
// API-katalogen.

const apps = appsData as AppData[];

/** Områdenas ordning i listan och i filtret. */
export const CATEGORY_ORDER = [
  'Ärendehantering',
  'Myndighetsutövning',
  'Invånartjänster',
  'Mina sidor',
  'Medarbetartjänster',
  'Utbildning',
  'AI-tjänster',
  'Administration',
  'Utvecklingsverktyg',
];

/**
 * Vardagliga, svenska och engelska ord som annars inte hade träffat rätt
 * applikation. Nyckeln jämförs med sökordet i normaliserad form (gemener, utan
 * å/ä/ö). Värdena är ordstammar som söks i stället, utöver sökordet självt.
 */
export const SYNONYMER: Synonyms = {
  chatbot: ['chattbot', 'chattassistent', 'assistent'],
  chattbot: ['chattassistent', 'assistent'],
  chatt: ['chattbot', 'chattassistent', 'assistent'],
  assistent: ['chattbot', 'assistent'],
  transkribering: ['transkriber', 'textning'],
  textning: ['transkriber', 'textning'],
  undertext: ['transkriber', 'textning'],
  oversattning: ['oversatt'],
  translation: ['oversatt'],
  rost: ['rost', 'tal'],
  inloggning: ['saml', 'inloggning'],
  login: ['saml', 'inloggning'],
  sso: ['saml'],
  idp: ['saml', 'idp'],
  brev: ['brev', 'postportal'],
  sms: ['sms', 'postportal'],
  post: ['postportal', 'brev'],
  faktura: ['faktur'],
  fakturor: ['faktur'],
  avtal: ['avtal'],
  forsorjningsstod: ['ekonomiskt bistand'],
  socialbidrag: ['ekonomiskt bistand'],
  bistand: ['ekonomiskt bistand'],
  skola: ['skol', 'elev'],
  elev: ['elev', 'skol'],
  larare: ['larare', 'skol'],
  losenord: ['losenord', 'elevkonto'],
  fel: ['felanmal'],
  felanmalan: ['felanmal'],
  gatubelysning: ['felanmal'],
  luft: ['luftkvalitet'],
  kulturarv: ['minnes', 'kulturarv'],
  museum: ['minnes', 'kulturarv'],
  foton: ['minnes', 'fotografi'],
  introduktion: ['introduktion', 'checklist'],
  onboarding: ['introduktion', 'checklist'],
  nyanstalld: ['introduktion', 'checklist'],
  personakt: ['personakt'],
  personal: ['medarbetare', 'personakt'],
  anstalld: ['medarbetare'],
  chef: ['chef'],
  arende: ['arende'],
  arenden: ['arende'],
  support: ['support'],
  kundtjanst: ['kontaktcenter', 'support'],
  fardtjanst: ['fardtjanst'],
  organisation: ['organisation', 'metakatalog'],
  system: ['systemregist'],
  gdpr: ['gdpr', 'systemregist'],
  bpmn: ['bpmn', 'process'],
  process: ['process', 'bpmn'],
  mall: ['startmall', 'mall'],
  template: ['startmall'],
  utbildning: ['utbildning', 'yrkesutbildning'],
  jobb: ['yrkesutbildning'],
  synpunkter: ['pratomat', 'synpunkt'],
  dokument: ['dokument'],
  ai: ['ai'],
};

/** Inloggningen, i tre grupper. En applikation kan ha flera, t.ex. öppen med SSO för administratörer. */
function inloggning(app: AppData): string[] {
  if (!app.auth) return [];
  const auth = app.auth.toLowerCase();
  const out: string[] = [];
  if (auth.startsWith('ingen inloggning')) out.push('ingen');
  if (auth.includes('saml')) out.push('sso');
  if (out.length === 0) out.push('annan');
  return out;
}

function frontend(app: AppData): string[] {
  const f = app.teknik?.frontend?.toLowerCase();
  if (!f) return [];
  if (f.includes('next.js')) return ['nextjs'];
  if (f.includes('vite')) return ['vite'];
  return ['annan'];
}

// Samma API kan vara stavat olika i olika repon ("SimulatorServer",
// "simulatorserver"); filtret visar den vanligaste stavningen.
const apiNamn = (() => {
  const counts = new Map<string, Map<string, number>>();
  for (const app of apps) {
    for (const { name } of app.apis ?? []) {
      const key = name.toLowerCase();
      const variants = counts.get(key) ?? new Map<string, number>();
      variants.set(name, (variants.get(name) ?? 0) + 1);
      counts.set(key, variants);
    }
  }
  const canonical = new Map<string, string>();
  for (const [key, variants] of counts) {
    canonical.set(key, [...variants].sort((a, b) => b[1] - a[1])[0][0]);
  }
  return (name: string) => canonical.get(name.toLowerCase()) ?? name;
})();

const LABELS: Record<string, Record<string, string>> = {
  inloggning: {
    ingen: 'Ingen inloggning för användaren',
    sso: 'Inloggning med SAML (SSO)',
    annan: 'Annan inloggning',
  },
  typ: { app: 'Webbapplikation', verktyg: 'Verktyg' },
  frontend: { nextjs: 'Next.js', vite: 'React med Vite', annan: 'Annan' },
};

export const searchConfig: CatalogSearchConfig<AppData> = {
  items: apps,
  id: (app) => app.slug,
  name: (app) => app.namn,
  category: (app) => app.kategori,
  categoryOrder: CATEGORY_ORDER,
  fields: [
    { key: 'namn', weight: 10, label: 'Namn', synonyms: true },
    { key: 'kod', weight: 6, label: 'Källkod', synonyms: true },
    { key: 'kategori', weight: 4, label: 'Område', synonyms: true },
    { key: 'ingress', weight: 3, label: 'Sammanfattning', synonyms: true },
    { key: 'funktionTitel', weight: 3, label: 'Funktion', synonyms: true, excerpt: true },
    { key: 'webbar', weight: 3, label: 'Webb', synonyms: true, excerpt: true },
    { key: 'apis', weight: 2.5, label: 'Använder API', excerpt: true },
    { key: 'integrationer', weight: 2, label: 'Integration', excerpt: true },
    { key: 'funktionText', weight: 1.5, label: 'Funktion', excerpt: true },
    { key: 'malgrupp', weight: 1.2, label: 'Målgrupp', excerpt: true },
    { key: 'auth', weight: 1.2, label: 'Inloggning', excerpt: true },
    { key: 'beskrivning', weight: 1, label: 'Beskrivning', excerpt: true },
    { key: 'teknik', weight: 0.8, label: 'Teknik', excerpt: true },
  ],
  texts: (app) => {
    const teknik = app.teknik ?? {};
    return {
      namn: [app.namn],
      kod: [app.repo, app.slug],
      kategori: [app.kategori],
      ingress: [app.ingress ?? ''],
      funktionTitel: (app.funktioner ?? []).map((f) => f.titel),
      webbar: (app.webbar ?? []).map((w) =>
        [w.namn, w.beskrivning, ...w.processer].filter(Boolean).join(' – '),
      ),
      apis: (app.apis ?? []).map((a) => `${apiNamn(a.name)} ${splitCamel(apiNamn(a.name))}`),
      integrationer: app.integrationer ?? [],
      funktionText: (app.funktioner ?? []).map((f) => f.text),
      malgrupp: [app.malgrupp ?? ''],
      auth: [app.auth ?? ''],
      beskrivning: app.beskrivning ?? [],
      teknik: [teknik.frontend, teknik.backend, teknik.tester].filter(
        (t): t is string => Boolean(t),
      ),
    };
  },
  synonyms: SYNONYMER,
  facets: [
    {
      key: 'inloggning',
      label: 'Inloggning',
      kind: 'checkbox',
      values: inloggning,
      order: ['ingen', 'sso', 'annan'],
      optionLabel: (v) => LABELS.inloggning[v] ?? v,
    },
    {
      key: 'typ',
      label: 'Typ',
      kind: 'checkbox',
      values: (app) => [app.status === 'verktyg' ? 'verktyg' : 'app'],
      order: ['app', 'verktyg'],
      optionLabel: (v) => LABELS.typ[v] ?? v,
    },
    {
      key: 'frontend',
      label: 'Frontend',
      kind: 'checkbox',
      values: frontend,
      order: ['nextjs', 'vite', 'annan'],
      optionLabel: (v) => LABELS.frontend[v] ?? v,
      chipLabel: (v) => `Frontend: ${LABELS.frontend[v] ?? v}`,
    },
    {
      key: 'api',
      label: 'Använder API:et',
      kind: 'select',
      values: (app) => (app.apis ?? []).map((a) => apiNamn(a.name)),
      allLabel: 'Alla API:er',
      chipLabel: (v) => `Använder ${v}`,
    },
  ],
  card: (app) => ({
    href: `${app.slug}.html`,
    namn: app.namn,
    ingress: app.ingress ?? '',
    labels: (
      <>
        <Label inverted color="vattjom">
          {app.kategori}
        </Label>
        {app.status && STATUS_LABEL[app.status] && <Label inverted>{STATUS_LABEL[app.status]}</Label>}
      </>
    ),
  }),
  plural: 'webbapplikationer',
  searchLabel: 'Sök på namn, funktion, område eller vad du vill göra',
  placeholder: 'Till exempel chattbot eller skola',
  examples: ['chattbot', 'ekonomiskt bistånd', 'skola', 'felanmälan', 'mina sidor', 'sms'],
  resultsId: 'tjanster',
};
