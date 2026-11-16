import { Label } from '@sk-web-gui/react';
import { type CatalogSearchConfig, type Synonyms, splitCamel } from '@sundsvall/chrome';
import apisData from './scripts/apis-data.json';
import { type ApiData, STATUS_LABEL } from './types';

// API-katalogens sökning: vilka fält som söks, synonymerna och filtren. Själva
// sökmotorn och gränssnittet ligger i @sundsvall/chrome och delas med
// webbkatalogen.

/** Områdenas ordning i listan och i filtret. */
export const CATEGORY_ORDER = [
  'Kommunikation',
  'Ärendehantering',
  'Ekonomi och fakturering',
  'Dokument och arkiv',
  'Parts- och kunddata',
  'AI-tjänster',
  'Integration',
  'Samhällsservice',
  'Öppna data',
  'Utbildning',
  'Utvecklingsverktyg',
];

/**
 * Vardagliga, svenska och engelska ord som annars inte hade träffat rätt API.
 * Nyckeln jämförs med sökordet i normaliserad form (gemener, utan å/ä/ö).
 * Värdena är ordstammar som söks i stället, utöver sökordet självt.
 */
export const SYNONYMER: Synonyms = {
  sms: ['sms', 'messaging'],
  mejl: ['email', 'e-post'],
  mail: ['email', 'e-post'],
  epost: ['email', 'e-post'],
  sopor: ['garbage', 'avfall'],
  sophamtning: ['garbage', 'avfall'],
  soptunna: ['garbage', 'avfall'],
  avfall: ['garbage'],
  brev: ['letter', 'snailmail', 'post'],
  post: ['letter', 'snailmail', 'postportal'],
  faktura: ['faktur', 'invoice', 'billing'],
  fakturor: ['faktur', 'invoice', 'billing'],
  invoice: ['faktur'],
  avtal: ['agreement', 'contract'],
  kontrakt: ['contract', 'agreement'],
  person: ['citizen', 'party', 'person'],
  personnummer: ['citizen', 'party', 'personnummer'],
  invanare: ['citizen', 'invanare'],
  medborgare: ['citizen'],
  foretag: ['business', 'legalentity', 'organisation', 'foretag'],
  organisationsnummer: ['legalentity', 'business', 'organisationsnummer'],
  anstalld: ['employee', 'medarbetare'],
  medarbetare: ['employee', 'medarbetare'],
  personal: ['employee', 'medarbetare'],
  chef: ['manager', 'chef'],
  arende: ['case', 'errand', 'arende'],
  arenden: ['case', 'errand', 'arende'],
  case: ['arende'],
  dokument: ['document', 'dokument'],
  document: ['dokument'],
  arkiv: ['archive', 'arkiv'],
  signering: ['signing', 'signer'],
  underskrift: ['signing', 'signer'],
  karta: ['geojson', 'koordinat', 'anlaggning'],
  geodata: ['geojson', 'koordinat'],
  gis: ['geojson', 'koordinat'],
  friluftsliv: ['anlaggning', 'friluft'],
  skola: ['education', 'utbildning'],
  utbildning: ['education'],
  bygglov: ['byggr', 'bygglov'],
  bistand: ['financial', 'bistand'],
  forsorjningsstod: ['financial', 'bistand'],
  behorighet: ['access', 'behorighet'],
  mall: ['templat', 'mall'],
  mallar: ['templat', 'mall'],
  notis: ['notif', 'messaging'],
  avisering: ['notif', 'messaging'],
  logg: ['eventlog', 'logg'],
  storning: ['disturbance', 'storning'],
  avbrott: ['disturbance', 'avbrott'],
  fullmakt: ['representative', 'fullmakt'],
  ombud: ['representative', 'ombud'],
  oppen: ['oppna data', 'oppet'],
  oppna: ['oppna data', 'oppet'],
  chatt: ['ai', 'assistent'],
  kund: ['customer', 'kund'],
  matning: ['measurement', 'matning'],
  meddelande: ['messag', 'meddelande'],
  meddelanden: ['messag', 'meddelande'],
};


export const searchConfig: CatalogSearchConfig<ApiData> = {
  items: apisData as ApiData[],
  id: (api) => api.slug,
  name: (api) => api.namn,
  category: (api) => api.kategori,
  categoryOrder: CATEGORY_ORDER,
  fields: [
    { key: 'namn', weight: 10, label: 'Namn', synonyms: true },
    { key: 'kod', weight: 6, label: 'Källkod', synonyms: true },
    { key: 'kategori', weight: 4, label: 'Område', synonyms: true },
    { key: 'ingress', weight: 3, label: 'Sammanfattning', synonyms: true },
    { key: 'funktionTitel', weight: 3, label: 'Funktion', synonyms: true, excerpt: true },
    { key: 'beroenden', weight: 2.5, label: 'Anropar', excerpt: true },
    { key: 'integrationer', weight: 2, label: 'Integration', excerpt: true },
    { key: 'funktionText', weight: 1.5, label: 'Funktion', excerpt: true },
    { key: 'malgrupp', weight: 1.2, label: 'Målgrupp', excerpt: true },
    { key: 'beskrivning', weight: 1, label: 'Beskrivning', excerpt: true },
    { key: 'teknik', weight: 0.8, label: 'Teknik', excerpt: true },
  ],
  texts: (api) => {
    const teknik = api.teknik ?? {};
    return {
      namn: [api.namn, splitCamel(api.namn)],
      kod: [api.repo ?? '', api.slug],
      kategori: [api.kategori],
      ingress: [api.ingress ?? ''],
      funktionTitel: (api.funktioner ?? []).map((f) => f.titel),
      funktionText: (api.funktioner ?? []).map((f) => f.text),
      beroenden: (api.beroenden ?? []).map((b) => `${b.name} ${splitCamel(b.name)}`),
      integrationer: api.integrationer ?? [],
      malgrupp: [api.malgrupp ?? ''],
      beskrivning: api.beskrivning ?? [],
      teknik: [teknik.sprak, teknik.ramverk, teknik.ovrigt, api.databas].filter(
        (t): t is string => Boolean(t),
      ),
    };
  },
  synonyms: SYNONYMER,
  facets: [
    {
      key: 'atkomst',
      label: 'Åtkomst',
      kind: 'checkbox',
      values: (api) => [api.atkomst ? 'oppen' : 'skyddad'],
      order: ['oppen', 'skyddad'],
      optionLabel: (v) => (v === 'oppen' ? 'Öppna, ingen inloggning' : 'Kräver klientuppgifter'),
      chipLabel: (v) => (v === 'oppen' ? 'Öppna API:er' : 'Kräver klientuppgifter'),
    },
    {
      key: 'kallkod',
      label: 'Källkod',
      kind: 'checkbox',
      values: (api) => [api.repo ? 'oppen' : 'ej'],
      order: ['oppen', 'ej'],
      optionLabel: (v) => (v === 'oppen' ? 'Öppen källkod' : 'Ej publicerad'),
      chipLabel: (v) => (v === 'oppen' ? 'Öppen källkod' : 'Källkoden ej publicerad'),
    },
    {
      key: 'anropar',
      label: 'Anropar API:et',
      kind: 'select',
      values: (api) => (api.beroenden ?? []).map((b) => b.name),
      allLabel: 'Alla API:er',
      chipLabel: (v) => `Anropar ${v}`,
    },
  ],
  card: (api) => ({
    href: `${api.slug}.html`,
    namn: api.namn,
    ingress: api.ingress ?? '',
    labels: (
      <>
        <Label inverted color="vattjom">
          {api.kategori}
        </Label>
        {api.status && STATUS_LABEL[api.status] && <Label inverted>{STATUS_LABEL[api.status]}</Label>}
        {api.atkomst && (
          <Label inverted color="gronsta">
            Öppet
          </Label>
        )}
      </>
    ),
  }),
  plural: 'API:er',
  searchLabel: 'Sök på namn, funktion, område eller vad du vill göra',
  placeholder: 'Till exempel sms eller faktura',
  examples: ['sms', 'faktura', 'ärende', 'personnummer', 'öppna data', 'AI'],
  resultsId: 'apier',
};
