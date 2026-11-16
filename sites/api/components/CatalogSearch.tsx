import {
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  FormLabel,
  Label,
  SearchField,
  Select,
} from '@sk-web-gui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type SearchResult,
  buildIndex,
  excerpt,
  fold,
  highlight,
  search,
  suggestName,
} from '../search';
import { type ApiData, STATUS_LABEL } from '../types';

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

/** Sökningar att prova, för den som inte vet vad API:et heter. */
const EXEMPEL = ['sms', 'faktura', 'ärende', 'personnummer', 'öppna data', 'AI'];

type Sort = 'relevans' | 'namn' | 'omrade';

export interface SearchState {
  q: string;
  omraden: string[];
  atkomst: '' | 'oppen' | 'skyddad';
  kallkod: '' | 'oppen' | 'ej';
  anropar: string;
  sort: '' | Sort;
}

const EMPTY: SearchState = { q: '', omraden: [], atkomst: '', kallkod: '', anropar: '', sort: '' };

/** Läser sökningen ur adressen, så att en sökning går att dela som länk. */
function readUrl(): SearchState {
  const p = new URLSearchParams(window.location.search);
  const pick = <T extends string>(key: string, allowed: readonly T[]): T | '' => {
    const v = p.get(key) ?? '';
    return (allowed as readonly string[]).includes(v) ? (v as T) : '';
  };
  return {
    q: p.get('q') ?? '',
    omraden: p.getAll('omrade').filter((o) => CATEGORY_ORDER.includes(o)),
    atkomst: pick('atkomst', ['oppen', 'skyddad'] as const),
    kallkod: pick('kallkod', ['oppen', 'ej'] as const),
    anropar: p.get('anropar') ?? '',
    sort: pick('sort', ['relevans', 'namn', 'omrade'] as const),
  };
}

function writeUrl(s: SearchState) {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set('q', s.q.trim());
  for (const o of s.omraden) p.append('omrade', o);
  if (s.atkomst) p.set('atkomst', s.atkomst);
  if (s.kallkod) p.set('kallkod', s.kallkod);
  if (s.anropar) p.set('anropar', s.anropar);
  if (s.sort) p.set('sort', s.sort);
  const query = p.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', url);
}

type Filter = (api: ApiData) => boolean;

function filters(s: SearchState): Record<'omrade' | 'atkomst' | 'kallkod' | 'anropar', Filter> {
  return {
    omrade: (api) => s.omraden.length === 0 || s.omraden.includes(api.kategori),
    atkomst: (api) =>
      !s.atkomst || (s.atkomst === 'oppen' ? Boolean(api.atkomst) : !api.atkomst),
    kallkod: (api) => !s.kallkod || (s.kallkod === 'oppen' ? Boolean(api.repo) : !api.repo),
    anropar: (api) => !s.anropar || (api.beroenden ?? []).some((b) => b.name === s.anropar),
  };
}

export interface CatalogSearch {
  state: SearchState;
  set: (patch: Partial<SearchState>) => void;
  reset: () => void;
  results: SearchResult[];
  total: number;
  corrections: { from: string; to: string }[];
  suggestion?: ApiData;
  sort: Sort;
  facets: {
    omrade: Map<string, number>;
    atkomst: { oppen: number; skyddad: number };
    kallkod: { oppen: number; ej: number };
    anropar: { name: string; count: number }[];
  };
  active: boolean;
}

export function useCatalogSearch(apis: ApiData[]): CatalogSearch {
  const [state, setState] = useState<SearchState>(() =>
    typeof window === 'undefined' ? EMPTY : readUrl(),
  );
  const { index, vocabulary } = useMemo(() => buildIndex(apis), [apis]);

  useEffect(() => writeUrl(state), [state]);

  const { results: matched, corrections } = useMemo(
    () => search(index, vocabulary, state.q),
    [index, vocabulary, state.q],
  );

  const f = filters(state);
  const passes = (api: ApiData, except?: keyof typeof f) =>
    (Object.keys(f) as (keyof typeof f)[]).every((k) => k === except || f[k](api));

  // Antalen vid varje filterval räknas med sökningen och övriga filter
  // tillämpade, så att det syns vad ett val ger innan det görs.
  const facets: CatalogSearch['facets'] = {
    omrade: new Map(),
    atkomst: { oppen: 0, skyddad: 0 },
    kallkod: { oppen: 0, ej: 0 },
    anropar: [],
  };
  const anropar = new Map<string, number>();
  for (const { api } of matched) {
    if (passes(api, 'omrade')) {
      facets.omrade.set(api.kategori, (facets.omrade.get(api.kategori) ?? 0) + 1);
    }
    if (passes(api, 'atkomst')) facets.atkomst[api.atkomst ? 'oppen' : 'skyddad'] += 1;
    if (passes(api, 'kallkod')) facets.kallkod[api.repo ? 'oppen' : 'ej'] += 1;
    if (passes(api, 'anropar')) {
      for (const name of new Set((api.beroenden ?? []).map((b) => b.name))) {
        anropar.set(name, (anropar.get(name) ?? 0) + 1);
      }
    }
  }
  facets.anropar = [...anropar]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  const hasQuery = state.q.trim().length > 0;
  const sort: Sort = state.sort && (state.sort !== 'relevans' || hasQuery)
    ? state.sort
    : hasQuery
      ? 'relevans'
      : 'omrade';

  const results = matched.filter(({ api }) => passes(api));
  if (sort === 'namn') {
    results.sort((a, b) => a.api.namn.localeCompare(b.api.namn, 'sv'));
  }

  const active =
    hasQuery || state.omraden.length > 0 || !!state.atkomst || !!state.kallkod || !!state.anropar;

  return {
    state,
    set: (patch) => setState((s) => ({ ...s, ...patch })),
    reset: () => setState(EMPTY),
    results,
    total: apis.length,
    corrections,
    suggestion: results.length === 0 && hasQuery ? suggestName(apis, state.q) : undefined,
    sort,
    facets,
    active,
  };
}

/** Sökfält, snabbsökningar och filter. Resultaten visas av SearchResults. */
export function SearchPanel({ search: s }: { search: CatalogSearch }) {
  const { state, set, facets } = s;
  const input = useRef<HTMLInputElement>(null);
  const [visaFilter, setVisaFilter] = useState(false);
  const antalFilter =
    state.omraden.length + (state.atkomst ? 1 : 0) + (state.kallkod ? 1 : 0) + (state.anropar ? 1 : 0);

  // Snabbtangent: "/" flyttar fokus till sökfältet, som på många andra webbplatser.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toggleOmrade = (o: string) =>
    set({
      omraden: state.omraden.includes(o)
        ? state.omraden.filter((x) => x !== o)
        : [...state.omraden, o],
    });

  const aktiva: { label: string; remove: () => void }[] = [
    ...state.omraden.map((o) => ({ label: o, remove: () => toggleOmrade(o) })),
    ...(state.atkomst
      ? [{
          label: state.atkomst === 'oppen' ? 'Öppna API:er' : 'Kräver klientuppgifter',
          remove: () => set({ atkomst: '' }),
        }]
      : []),
    ...(state.kallkod
      ? [{
          label: state.kallkod === 'oppen' ? 'Öppen källkod' : 'Källkoden ej publicerad',
          remove: () => set({ kallkod: '' }),
        }]
      : []),
    ...(state.anropar
      ? [{ label: `Anropar ${state.anropar}`, remove: () => set({ anropar: '' }) }]
      : []),
  ];

  return (
    <div className="mt-24 flex flex-col gap-24">
      <form
        role="search"
        aria-label="Sök bland API:erna"
        onSubmit={(e) => {
          e.preventDefault();
          document.getElementById('apier')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <label htmlFor="api-sok" className="block font-bold mb-8">
          Sök på namn, funktion, område eller vad du vill göra
        </label>
        <SearchField
          ref={input}
          id="api-sok"
          value={state.q}
          onChange={(e) => set({ q: e.target.value })}
          onReset={() => set({ q: '' })}
          onSearch={() =>
            document.getElementById('apier')?.scrollIntoView({ behavior: 'smooth' })
          }
          placeholder="Till exempel sms eller faktura"
          searchLabel="Visa träffar"
          resetAriaLabel="Rensa sökningen"
          autoComplete="off"
          aria-describedby="api-sok-tips"
        />
        <p id="api-sok-tips" className="text-small text-dark-secondary mt-8 mb-0">
          Sökningen tål stavfel och förstår vardagliga ord. Tryck på / för att hoppa hit.
        </p>
      </form>

      <div className="flex flex-wrap items-center gap-8">
        <span className="text-small text-dark-secondary">Prova att söka på:</span>
        {EXEMPEL.map((ex) => {
          const vald = fold(state.q.trim()) === fold(ex);
          return (
            <Button
              key={ex}
              size="sm"
              rounded
              color="vattjom"
              variant={vald ? 'primary' : 'secondary'}
              aria-pressed={vald}
              aria-label={`Sök på ${ex}`}
              onClick={() => set({ q: ex })}
            >
              {ex}
            </Button>
          );
        })}
      </div>

      <div>
        <Button
          className="md:hidden"
          variant="secondary"
          color="vattjom"
          aria-expanded={visaFilter}
          aria-controls="api-filter"
          onClick={() => setVisaFilter((v) => !v)}
        >
          {visaFilter ? 'Dölj filter' : `Visa filter${antalFilter ? ` (${antalFilter})` : ''}`}
        </Button>

        <div
          id="api-filter"
          className={`${visaFilter ? 'grid' : 'hidden'} md:grid gap-32 mt-16 md:mt-0 md:grid-cols-2 xl:grid-cols-4`}
        >
          <fieldset className="md:col-span-2 xl:col-span-4 border-0 p-0 m-0 min-w-0">
            <legend className="font-bold mb-8">Område</legend>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CATEGORY_ORDER.map((o) => {
                const n = facets.omrade.get(o) ?? 0;
                const valt = state.omraden.includes(o);
                return (
                  <Checkbox
                    key={o}
                    color="vattjom"
                    checked={valt}
                    disabled={n === 0 && !valt}
                    onChange={() => toggleOmrade(o)}
                  >
                    {o} <span className="text-dark-secondary">({n})</span>
                  </Checkbox>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="border-0 p-0 m-0 min-w-0">
            <legend className="font-bold mb-8">Åtkomst</legend>
            <div className="flex flex-col gap-8">
              <Checkbox
                color="vattjom"
                checked={state.atkomst === 'oppen'}
                disabled={facets.atkomst.oppen === 0 && state.atkomst !== 'oppen'}
                onChange={() => set({ atkomst: state.atkomst === 'oppen' ? '' : 'oppen' })}
              >
                Öppna, ingen inloggning{' '}
                <span className="text-dark-secondary">({facets.atkomst.oppen})</span>
              </Checkbox>
              <Checkbox
                color="vattjom"
                checked={state.atkomst === 'skyddad'}
                disabled={facets.atkomst.skyddad === 0 && state.atkomst !== 'skyddad'}
                onChange={() => set({ atkomst: state.atkomst === 'skyddad' ? '' : 'skyddad' })}
              >
                Kräver klientuppgifter{' '}
                <span className="text-dark-secondary">({facets.atkomst.skyddad})</span>
              </Checkbox>
            </div>
          </fieldset>

          <fieldset className="border-0 p-0 m-0 min-w-0">
            <legend className="font-bold mb-8">Källkod</legend>
            <div className="flex flex-col gap-8">
              <Checkbox
                color="vattjom"
                checked={state.kallkod === 'oppen'}
                disabled={facets.kallkod.oppen === 0 && state.kallkod !== 'oppen'}
                onChange={() => set({ kallkod: state.kallkod === 'oppen' ? '' : 'oppen' })}
              >
                Öppen källkod{' '}
                <span className="text-dark-secondary">({facets.kallkod.oppen})</span>
              </Checkbox>
              <Checkbox
                color="vattjom"
                checked={state.kallkod === 'ej'}
                disabled={facets.kallkod.ej === 0 && state.kallkod !== 'ej'}
                onChange={() => set({ kallkod: state.kallkod === 'ej' ? '' : 'ej' })}
              >
                Ej publicerad{' '}
                <span className="text-dark-secondary">({facets.kallkod.ej})</span>
              </Checkbox>
            </div>
          </fieldset>

          <FormControl id="api-anropar" className="w-full">
            <FormLabel>Anropar API:et</FormLabel>
            <Select
              className="w-full"
              value={state.anropar}
              onChange={(e) => set({ anropar: e.target.value })}
            >
              <Select.Option value="">Alla API:er</Select.Option>
              {facets.anropar.map(({ name, count }) => (
                <Select.Option key={name} value={name}>
                  {name} ({count})
                </Select.Option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="api-sortering" className="w-full">
            <FormLabel>Sortera efter</FormLabel>
            <Select
              className="w-full"
              value={s.sort}
              onChange={(e) => set({ sort: e.target.value as Sort })}
            >
              {state.q.trim() && <Select.Option value="relevans">Bästa träff</Select.Option>}
              <Select.Option value="omrade">Område</Select.Option>
              <Select.Option value="namn">Namn A–Ö</Select.Option>
            </Select>
          </FormControl>
        </div>
      </div>

      {aktiva.length > 0 && (
        <div className="flex flex-wrap items-center gap-8" role="group" aria-label="Valda filter">
          <span className="text-small text-dark-secondary">Valda filter:</span>
          {aktiva.map((a) => (
            <Chip key={a.label} type="button" onClick={a.remove} aria-label={`Ta bort filtret ${a.label}`}>
              {a.label}
            </Chip>
          ))}
          <Button
            variant="tertiary"
            size="sm"
            color="vattjom"
            onClick={() => set({ omraden: [], atkomst: '', kallkod: '', anropar: '' })}
          >
            Rensa filtren
          </Button>
        </div>
      )}
    </div>
  );
}

function Marked({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((p, i) =>
        p.mark ? (
          <mark key={i} className="bg-vattjom-background-300 text-dark-primary rounded-utility-sm">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

function ApiCard({ result }: { result: SearchResult }) {
  const { api, hit, terms } = result;
  const status = api.status ? STATUS_LABEL[api.status] : undefined;
  return (
    <Card color="mono" useHoverEffect href={`${api.slug}.html`}>
      <Card.Body>
        <div className="flex flex-wrap gap-8 pt-8">
          <Label inverted color="vattjom">
            {api.kategori}
          </Label>
          {status && <Label inverted>{status}</Label>}
          {api.atkomst && <Label inverted color="gronsta">Öppet</Label>}
        </div>
        <h3 className="font-header text-h4-sm md:text-h4-md xl:text-h4-lg text-dark-primary mt-12 mb-0">
          <Marked text={api.namn} terms={terms} />
        </h3>
        <p className="mt-8 mb-0">
          <Marked text={api.ingress ?? ''} terms={terms} />
        </p>
        {hit && (
          <p className="mt-8 mb-0 text-small text-dark-secondary">
            <strong>{hit.label}:</strong> <Marked text={excerpt(hit)} terms={terms} />
          </p>
        )}
        <p className="mt-12 mb-0 font-bold text-vattjom-text-primary">Läs mer om {api.namn} →</p>
      </Card.Body>
    </Card>
  );
}

function Grid({ results }: { results: SearchResult[] }) {
  return (
    <div className="mt-16 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
      {results.map((r) => (
        <ApiCard key={r.api.slug} result={r} />
      ))}
    </div>
  );
}

/** Resultatlistan: grupperad per område, eller i en lista efter relevans eller namn. */
export function SearchResults({ search: s }: { search: CatalogSearch }) {
  const { results, total, corrections, suggestion, sort, active, state } = s;

  const grupper = useMemo(() => {
    if (sort !== 'omrade') return [];
    const by = new Map<string, SearchResult[]>();
    for (const r of results) {
      const list = by.get(r.api.kategori) ?? [];
      list.push(r);
      by.set(r.api.kategori, list);
    }
    return CATEGORY_ORDER.filter((c) => by.has(c)).map((c) => ({
      kategori: c,
      results: (by.get(c) ?? [])
        .slice()
        .sort((a, b) =>
          state.q.trim()
            ? b.score - a.score
            : a.api.namn.toLowerCase().localeCompare(b.api.namn.toLowerCase(), 'sv'),
        ),
    }));
  }, [results, sort, state.q]);

  return (
    <>
      <p className="mt-24 mb-0 font-bold" role="status" aria-live="polite">
        {active
          ? `Visar ${results.length} av ${total} API:er`
          : `Visar alla ${total} API:er`}
        {state.q.trim() && results.length > 0 && sort === 'relevans' && ', bästa träff först'}
      </p>
      {corrections.length > 0 && results.length > 0 && (
        <p className="mt-8 mb-0 text-dark-secondary">
          Visar även träffar för{' '}
          {corrections.map((c, i) => (
            <span key={c.from}>
              {i > 0 && ', '}”<strong>{c.to}</strong>” (du skrev ”{c.from}”)
            </span>
          ))}
          .
        </p>
      )}

      {results.length === 0 ? (
        <div className="mt-24 flex flex-col items-start gap-16">
          <p className="m-0">
            Inga API:er matchar din sökning
            {state.q.trim() ? ` på ”${state.q.trim()}”` : ''}
            {active && state.q.trim() !== '' && s.state.omraden.length + (state.atkomst ? 1 : 0) + (state.kallkod ? 1 : 0) + (state.anropar ? 1 : 0) > 0
              ? ' med de valda filtren'
              : ''}
            .
          </p>
          {suggestion && (
            <Button variant="secondary" color="vattjom" onClick={() => s.set({ q: suggestion.namn })}>
              {`Sök på ${suggestion.namn}`}
            </Button>
          )}
          <Button variant="primary" color="vattjom" onClick={s.reset}>
            Rensa sökning och filter
          </Button>
        </div>
      ) : sort === 'omrade' ? (
        grupper.map((g) => (
          <section key={g.kategori} aria-label={g.kategori}>
            <h3 className="font-header mt-40">
              {g.kategori} <span className="text-dark-secondary">({g.results.length})</span>
            </h3>
            <Grid results={g.results} />
          </section>
        ))
      ) : (
        <div className="mt-16">
          <Grid results={results} />
        </div>
      )}
    </>
  );
}
