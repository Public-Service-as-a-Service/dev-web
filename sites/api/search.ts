// Sökmotorn för API-katalogens startsida. Allt körs i webbläsaren mot
// apis-data.json: katalogen är liten nog (ett 80-tal API:er) för att ett
// förberäknat index och en enkel rangordning ska ge svar på varje tangenttryck.
//
// Det som gör sökningen förlåtande:
// - å/ä/ö, é och versaler spelar ingen roll ("anlaggning" hittar Anläggningsregister),
// - API-namn delas upp i ord ("SmsSender" blir även "sms" och "sender"),
// - vardagliga och engelska ord översätts via SYNONYMER ("sopor" hittar Garbage),
// - stavfel rättas mot katalogens ordförråd ("mesaging" hittar Messaging),
// - varje sökord måste träffa något, och träffar i namnet väger tyngst.

import type { ApiData } from './types';

/** Fält som söks igenom, med vikt och den rubrik som visas vid en träff. */
const FIELDS = [
  { key: 'namn', weight: 10, label: 'Namn' },
  { key: 'kod', weight: 6, label: 'Källkod' },
  { key: 'kategori', weight: 4, label: 'Område' },
  { key: 'ingress', weight: 3, label: 'Sammanfattning' },
  { key: 'funktionTitel', weight: 3, label: 'Funktion' },
  { key: 'beroenden', weight: 2.5, label: 'Anropar' },
  { key: 'integrationer', weight: 2, label: 'Integration' },
  { key: 'funktionText', weight: 1.5, label: 'Funktion' },
  { key: 'malgrupp', weight: 1.2, label: 'Målgrupp' },
  { key: 'beskrivning', weight: 1, label: 'Beskrivning' },
  { key: 'teknik', weight: 0.8, label: 'Teknik' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

/**
 * Fält där synonymer söks. En synonym är en gissning om vad användaren menar,
 * så den får bara träffa det som beskriver API:et självt – annars hade "sms"
 * gett alla API:er som anropar Messaging.
 */
const SYNONYM_FIELDS = new Set<FieldKey>(['namn', 'kod', 'kategori', 'ingress', 'funktionTitel']);

/**
 * Vardagliga, svenska och engelska ord som annars inte hade träffat rätt API.
 * Nyckeln jämförs med sökordet i normaliserad form (gemener, utan å/ä/ö).
 * Värdena är ordstammar som söks i stället, utöver sökordet självt.
 */
const SYNONYMER: Record<string, string[]> = {
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

/** Gemener och å/ä/ö → a/a/o, tecken för tecken så att positionerna består. */
export function fold(s: string): string {
  let out = '';
  for (const ch of s.toLowerCase()) {
    out += FOLD[ch] ?? ch;
  }
  return out;
}

const FOLD: Record<string, string> = {
  å: 'a', ä: 'a', á: 'a', à: 'a', ö: 'o', ó: 'o', é: 'e', è: 'e', ü: 'u', í: 'i',
};

/** "SmsSender" → "Sms Sender", så att båda orden går att söka på. */
function splitCamel(s: string): string {
  return s.replace(/([a-zåäö])([A-ZÅÄÖ])/g, '$1 $2');
}

const WORD = /[a-z0-9]+(?:-[a-z0-9]+)*/g;

export interface IndexedApi {
  api: ApiData;
  /** Originaltext per fält, för utdrag och markering. */
  text: Record<FieldKey, string[]>;
  /** Normaliserad text per fält, med samma längd som originalet. */
  folded: Record<FieldKey, string[]>;
}

function fieldTexts(api: ApiData): Record<FieldKey, string[]> {
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
}

export function buildIndex(apis: ApiData[]): { index: IndexedApi[]; vocabulary: string[] } {
  const words = new Set<string>();
  const index = apis.map((api) => {
    const text = fieldTexts(api);
    const folded = {} as Record<FieldKey, string[]>;
    for (const { key } of FIELDS) {
      folded[key] = text[key].map(fold);
      for (const t of folded[key]) {
        for (const w of t.match(WORD) ?? []) {
          if (w.length >= 3) words.add(w);
        }
      }
    }
    return { api, text, folded };
  });
  return { index, vocabulary: [...words] };
}

/** Damerau–Levenshtein-avstånd, avbrutet när det överstiger max. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

interface Term {
  /** Sökordet som användaren skrev, normaliserat. */
  raw: string;
  /** Alternativ att söka efter, med kvalitet 0–1. */
  variants: { text: string; quality: number; synonym?: boolean }[];
  /** Ordet i katalogen som ett felstavat sökord rättades till. */
  correction?: string;
}

/** Tolerans för stavfel: inga för korta ord, ett fel upp till sex tecken, sedan två. */
function maxTypos(term: string): number {
  if (term.length < 4) return 0;
  return term.length <= 6 ? 1 : 2;
}

function parseQuery(query: string, vocabulary: string[]): Term[] {
  const raw = fold(query).match(WORD) ?? [];
  return raw.map((t) => {
    const variants: Term['variants'] = [{ text: t, quality: 1 }];
    for (const s of SYNONYMER[t] ?? []) variants.push({ text: s, quality: 0.8, synonym: true });
    const term: Term = { raw: t, variants };
    // Rätta bara ord som inte redan förekommer i katalogen.
    const known = vocabulary.some((w) => w.includes(t)) || SYNONYMER[t];
    const max = maxTypos(t);
    if (!known && max > 0) {
      let best: { word: string; d: number } | undefined;
      for (const w of vocabulary) {
        // Jämför även med ordets början, så att halvskrivna, felstavade ord rättas.
        const d = Math.min(distance(t, w, max), distance(t, w.slice(0, t.length), max));
        if (d <= max && (!best || d < best.d || (d === best.d && w.length < best.word.length))) {
          best = { word: w, d };
        }
      }
      if (best) {
        term.correction = best.word;
        variants.push({ text: best.word, quality: 0.6 });
      }
    }
    return term;
  });
}

export interface Hit {
  field: FieldKey;
  label: string;
  /** Den träffade textens original, och var i den träffen ligger. */
  text: string;
  start: number;
  length: number;
}

export interface SearchResult {
  api: ApiData;
  score: number;
  /** Bästa träffen utanför namnet och sammanfattningen, för att visa varför API:et kom med. */
  hit?: Hit;
  /** Sökord i normaliserad form, för markering i kortet. */
  terms: string[];
}

/** Hur väl ett sökordsalternativ träffar en text: ordbörjan väger mer än mitt i ett ord. */
function matchQuality(folded: string, variant: string): { quality: number; start: number } | null {
  let pos = folded.indexOf(variant);
  if (pos < 0) return null;
  // Korta sökord som "ai" eller "sms" måste börja ett ord, annars träffar de
  // mitt i vilket ord som helst.
  const best = variant.length <= 3 ? null : { quality: 0.6, start: pos };
  while (pos >= 0) {
    const atWordStart = pos === 0 || !/[a-z0-9]/.test(folded[pos - 1]);
    if (atWordStart) {
      const end = pos + variant.length;
      const wholeWord = end === folded.length || !/[a-z0-9]/.test(folded[end]);
      return { quality: wholeWord ? 1 : 0.85, start: pos };
    }
    pos = folded.indexOf(variant, pos + 1);
  }
  return best;
}

export function search(
  index: IndexedApi[],
  vocabulary: string[],
  query: string,
): { results: SearchResult[]; corrections: { from: string; to: string }[] } {
  const terms = parseQuery(query, vocabulary);
  if (terms.length === 0) {
    return { results: index.map(({ api }) => ({ api, score: 0, terms: [] })), corrections: [] };
  }
  const q = fold(query).trim();
  const results: SearchResult[] = [];
  const usedCorrections = new Map<string, string>();

  for (const entry of index) {
    let score = 0;
    let hit: Hit | undefined;
    let hitScore = 0;
    let allMatched = true;
    const matchedTexts: string[] = [];

    for (const term of terms) {
      let termBest = 0;
      for (const variant of term.variants) {
        for (const { key, weight, label } of FIELDS) {
          if (variant.synonym && !SYNONYM_FIELDS.has(key)) continue;
          entry.folded[key].forEach((f, i) => {
            const m = matchQuality(f, variant.text);
            if (!m) return;
            const s = weight * m.quality * variant.quality;
            if (s > termBest) termBest = s;
            if (variant.quality < 1 && variant.text === term.correction && s > 0) {
              usedCorrections.set(term.raw, term.correction);
            }
            // Visa en träff som förklarar resultatet, men inte namnet eller
            // sammanfattningen – de syns redan i kortet.
            if (key !== 'namn' && key !== 'ingress' && key !== 'kod' && s > hitScore) {
              hitScore = s;
              hit = { field: key, label, text: entry.text[key][i], start: m.start, length: variant.text.length };
            }
            matchedTexts.push(variant.text);
          });
        }
      }
      if (termBest === 0) {
        allMatched = false;
        break;
      }
      score += termBest;
    }
    if (!allMatched) continue;

    const name = fold(entry.api.namn);
    if (name === q || fold(splitCamel(entry.api.namn)) === q) score += 50;
    else if (name.startsWith(q)) score += 20;

    results.push({ api: entry.api, score, hit, terms: [...new Set(matchedTexts)] });
  }

  results.sort((a, b) => b.score - a.score || a.api.namn.localeCompare(b.api.namn, 'sv'));
  return {
    results,
    corrections: [...usedCorrections].map(([from, to]) => ({ from, to })),
  };
}

/** Förslag när inget träffar: API-namnet som ligger närmast det som skrevs. */
export function suggestName(apis: ApiData[], query: string): ApiData | undefined {
  const q = fold(query).replace(/\s+/g, '');
  if (q.length < 3) return undefined;
  let best: { api: ApiData; d: number } | undefined;
  for (const api of apis) {
    const n = fold(api.namn).replace(/\s+/g, '');
    const d = Math.min(distance(q, n, 4), distance(q, n.slice(0, q.length), 4));
    if (d <= Math.max(2, Math.floor(q.length / 3)) && (!best || d < best.d)) best = { api, d };
  }
  return best?.api;
}

/** Delar en text i bitar så att träffarna på sökorden kan markeras. */
export function highlight(text: string, terms: string[]): { text: string; mark: boolean }[] {
  if (terms.length === 0 || !text) return [{ text, mark: false }];
  const folded = fold(text);
  const marks = new Array<boolean>(text.length).fill(false);
  for (const t of terms) {
    if (t.length < 2) continue;
    let pos = folded.indexOf(t);
    while (pos >= 0) {
      for (let i = pos; i < pos + t.length; i++) marks[i] = true;
      pos = folded.indexOf(t, pos + t.length);
    }
  }
  const parts: { text: string; mark: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.mark === marks[i]) last.text += text[i];
    else parts.push({ text: text[i], mark: marks[i] });
  }
  return parts;
}

/** Ett utdrag på ungefär max tecken runt träffen, med ellips där texten kortats. */
export function excerpt(hit: Hit, max = 160): string {
  const { text, start, length } = hit;
  if (text.length <= max) return text;
  let from = Math.max(0, start - Math.floor((max - length) / 2));
  let to = Math.min(text.length, from + max);
  from = Math.max(0, to - max);
  // Börja och sluta på ordgräns.
  if (from > 0) from = text.indexOf(' ', from) + 1 || from;
  if (to < text.length) to = text.lastIndexOf(' ', to) > start + length ? text.lastIndexOf(' ', to) : to;
  return `${from > 0 ? '…' : ''}${text.slice(from, to).trim()}${to < text.length ? '…' : ''}`;
}
