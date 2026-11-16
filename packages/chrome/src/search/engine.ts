// Sökmotorn för katalogernas startsidor. Allt körs i webbläsaren mot
// katalogens datafil: katalogerna är små nog (några tiotal poster) för att ett
// förberäknat index och en enkel rangordning ska ge svar på varje tangenttryck.
//
// Det som gör sökningen förlåtande:
// - versaler spelar ingen roll, och den som skriver utan å/ä/ö hittar ändå rätt
//   ("anlaggning" hittar Anläggningsregister). Skriver man å/ä/ö matchas de
//   exakt, så att "skåp" inte träffar "skapa",
// - namn delas upp i ord ("SmsSender" blir även "sms" och "sender"),
// - vardagliga och engelska ord översätts via katalogens synonymer ("sopor" hittar Garbage),
// - stavfel rättas mot katalogens ordförråd ("mesaging" hittar Messaging),
// - varje sökord måste träffa något, och träffar i namnet väger tyngst.
//
// Motorn vet inget om API:er eller webbapplikationer: varje katalog anger vilka
// fält som ska sökas, med vikt, och sina egna synonymer.

/** Ett sökbart fält i en katalogpost. */
export interface SearchField {
  key: string;
  /** Hur mycket en träff i fältet väger; namnet bör väga mest. */
  weight: number;
  /** Rubriken som visas framför utdraget när träffen förklarar resultatet. */
  label: string;
  /**
   * Om synonymer får träffa fältet. En synonym är en gissning om vad
   * användaren menar, så den bör bara träffa det som beskriver posten själv.
   */
  synonyms?: boolean;
  /** Om en träff här visas som utdrag i kortet. Namn och sammanfattning syns redan. */
  excerpt?: boolean;
}

/** En katalogpost som sökmotorn ser den. */
export interface SearchDoc {
  id: string;
  name: string;
  /** Texten per fält; ett fält kan ha flera texter, t.ex. en per funktion. */
  fields: Record<string, string[]>;
}

/** Synonymer: normaliserat sökord → ordstammar som söks i stället. */
export type Synonyms = Record<string, string[]>;

const FOLD: Record<string, string> = {
  å: 'a', ä: 'a', á: 'a', à: 'a', ö: 'o', ó: 'o', é: 'e', è: 'e', ü: 'u', í: 'i',
};

/** Gemener och å/ä/ö → a/a/o, tecken för tecken så att positionerna består. */
export function fold(s: string): string {
  let out = '';
  for (const ch of s.toLowerCase()) {
    out += FOLD[ch] ?? ch;
  }
  return out;
}

/** "SmsSender" → "Sms Sender", så att båda orden går att söka på. */
export function splitCamel(s: string): string {
  return s.replace(/([a-zåäö])([A-ZÅÄÖ])/g, '$1 $2');
}

const WORD = /[a-z0-9]+(?:-[a-z0-9]+)*/g;
const LETTER = 'a-z0-9åäöáàóéèüí';
/** Ord i en text med gemener, å/ä/ö kvar. */
const WORD_LOWER = new RegExp(`[${LETTER}]+(?:-[${LETTER}]+)*`, 'g');
const IS_LETTER = new RegExp(`[${LETTER}]`);
const HAS_DIACRITIC = /[åäöáàóéèüí]/;

interface IndexedDoc {
  doc: SearchDoc;
  /** Gemener utan å/ä/ö, för sökord skrivna utan dem. */
  folded: Record<string, string[]>;
  /** Gemener med å/ä/ö kvar, för sökord skrivna med dem. */
  lower: Record<string, string[]>;
}

export interface SearchIndex {
  docs: IndexedDoc[];
  fields: SearchField[];
  synonyms: Synonyms;
  vocabulary: string[];
}

export function buildIndex(docs: SearchDoc[], fields: SearchField[], synonyms: Synonyms): SearchIndex {
  const words = new Set<string>();
  const indexed = docs.map((doc) => {
    const folded: Record<string, string[]> = {};
    const lower: Record<string, string[]> = {};
    for (const { key } of fields) {
      lower[key] = (doc.fields[key] ?? []).map((t) => t.toLowerCase());
      folded[key] = (doc.fields[key] ?? []).map(fold);
      for (const t of folded[key]) {
        for (const w of t.match(WORD) ?? []) {
          if (w.length >= 3) words.add(w);
        }
      }
    }
    return { doc, folded, lower };
  });
  return { docs: indexed, fields, synonyms, vocabulary: [...words] };
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
  variants: { text: string; quality: number; synonym?: boolean; exact?: boolean }[];
  /** Ordet i katalogen som ett felstavat sökord rättades till. */
  correction?: string;
}

/** Tolerans för stavfel: inga för korta ord, ett fel upp till sex tecken, sedan två. */
function maxTypos(term: string): number {
  if (term.length < 4) return 0;
  return term.length <= 6 ? 1 : 2;
}

function parseQuery(query: string, index: SearchIndex): Term[] {
  const words = query.toLowerCase().match(WORD_LOWER) ?? [];
  return words.map((word) => {
    const t = fold(word);
    // Med å/ä/ö matchas ordet som det skrevs; utan matchas det mot texten utan dem.
    const exact = HAS_DIACRITIC.test(word);
    const variants: Term['variants'] = [{ text: exact ? word : t, quality: 1, exact }];
    for (const s of index.synonyms[t] ?? []) variants.push({ text: s, quality: 0.8, synonym: true });
    const term: Term = { raw: t, variants };
    // Rätta bara ord som inte redan förekommer i katalogen.
    const known = index.vocabulary.some((w) => w.includes(t)) || index.synonyms[t];
    const max = maxTypos(t);
    if (!known && max > 0) {
      let best: { word: string; d: number } | undefined;
      for (const w of index.vocabulary) {
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
  label: string;
  /** Den träffade textens original, och var i den träffen ligger. */
  text: string;
  start: number;
  length: number;
}

export interface SearchResult {
  id: string;
  score: number;
  /** Bästa träffen i ett utdragsfält, för att visa varför posten kom med. */
  hit?: Hit;
  /** Det som träffade, i normaliserad form, för markering i kortet. */
  terms: string[];
}

/** Hur väl ett sökordsalternativ träffar en text: ordbörjan väger mer än mitt i ett ord. */
function matchQuality(text: string, variant: string): { quality: number; start: number } | null {
  let pos = text.indexOf(variant);
  if (pos < 0) return null;
  // Korta sökord som "ai" eller "sms" måste börja ett ord, annars träffar de
  // mitt i vilket ord som helst.
  const best = variant.length <= 3 ? null : { quality: 0.6, start: pos };
  while (pos >= 0) {
    const atWordStart = pos === 0 || !IS_LETTER.test(text[pos - 1]);
    if (atWordStart) {
      const end = pos + variant.length;
      const wholeWord = end === text.length || !IS_LETTER.test(text[end]);
      return { quality: wholeWord ? 1 : 0.85, start: pos };
    }
    pos = text.indexOf(variant, pos + 1);
  }
  return best;
}

export function search(
  index: SearchIndex,
  query: string,
): { results: SearchResult[]; corrections: { from: string; to: string }[] } {
  const terms = parseQuery(query, index);
  if (terms.length === 0) {
    return { results: index.docs.map(({ doc }) => ({ id: doc.id, score: 0, terms: [] })), corrections: [] };
  }
  const q = fold(query).trim();
  const results: SearchResult[] = [];
  const usedCorrections = new Map<string, string>();

  for (const entry of index.docs) {
    let score = 0;
    let hit: Hit | undefined;
    let hitScore = 0;
    let allMatched = true;
    const matchedTexts: string[] = [];

    for (const term of terms) {
      let termBest = 0;
      for (const variant of term.variants) {
        for (const field of index.fields) {
          if (variant.synonym && !field.synonyms) continue;
          (variant.exact ? entry.lower : entry.folded)[field.key].forEach((f, i) => {
            const m = matchQuality(f, variant.text);
            if (!m) return;
            const s = field.weight * m.quality * variant.quality;
            if (s > termBest) termBest = s;
            if (variant.text === term.correction) usedCorrections.set(term.raw, term.correction);
            if (field.excerpt && s > hitScore) {
              hitScore = s;
              hit = {
                label: field.label,
                text: entry.doc.fields[field.key][i],
                start: m.start,
                length: variant.text.length,
              };
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

    const name = fold(entry.doc.name);
    if (name === q || fold(splitCamel(entry.doc.name)) === q) score += 50;
    else if (name.startsWith(q)) score += 20;

    results.push({ id: entry.doc.id, score, hit, terms: [...new Set(matchedTexts)] });
  }

  results.sort((a, b) => b.score - a.score);
  return {
    results,
    corrections: [...usedCorrections].map(([from, to]) => ({ from, to })),
  };
}

/** Förslag när inget träffar: namnet som ligger närmast det som skrevs. */
export function suggestName(names: string[], query: string): string | undefined {
  const q = fold(query).replace(/\s+/g, '');
  if (q.length < 3) return undefined;
  let best: { name: string; d: number } | undefined;
  for (const name of names) {
    const n = fold(name).replace(/\s+/g, '');
    const d = Math.min(distance(q, n, 4), distance(q, n.slice(0, q.length), 4));
    if (d <= Math.max(2, Math.floor(q.length / 3)) && (!best || d < best.d)) best = { name, d };
  }
  return best?.name;
}

/** Delar en text i bitar så att träffarna på sökorden kan markeras. */
export function highlight(text: string, terms: string[]): { text: string; mark: boolean }[] {
  if (terms.length === 0 || !text) return [{ text, mark: false }];
  const folded = fold(text);
  const lower = text.toLowerCase();
  const marks = new Array<boolean>(text.length).fill(false);
  for (const t of terms) {
    if (t.length < 2) continue;
    // Ett sökord med å/ä/ö har matchats exakt och markeras därför exakt.
    const haystack = HAS_DIACRITIC.test(t) ? lower : folded;
    let pos = haystack.indexOf(t);
    while (pos >= 0) {
      for (let i = pos; i < pos + t.length; i++) marks[i] = true;
      pos = haystack.indexOf(t, pos + t.length);
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
