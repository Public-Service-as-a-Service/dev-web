import { Button, Card, Checkbox, Chip, FormControl, FormLabel, SearchField, Select } from '@sk-web-gui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type SearchDoc,
  type SearchField as Field,
  type SearchResult,
  type Synonyms,
  buildIndex,
  excerpt,
  fold,
  highlight,
  search,
  suggestName,
} from './engine';

// Sökning och filter för en katalogs startsida: sökfält, filter med antal
// träffar per val, valda filter som går att ta bort, sortering och en
// resultatlista med markerade träffar. Katalogen beskriver sina poster, sökfält
// och filter i en CatalogSearchConfig; resten är gemensamt.

/** Ett filter. Värdena är det som skrivs i adressen; etiketterna det som visas. */
export interface Facet<T> {
  /** Parameternamnet i adressen, t.ex. "atkomst". */
  key: string;
  /** Rubriken över filtret. */
  label: string;
  /** Kryssrutor (flera val, något av dem) eller en lista (ett val). */
  kind: 'checkbox' | 'select';
  /** Postens värden för filtret; en post kan ha flera, eller inga. */
  values: (item: T) => string[];
  /** Etiketten för ett värde; värdet självt när den saknas. */
  optionLabel?: (value: string) => string;
  /** Etiketten i raden med valda filter; optionLabel när den saknas. */
  chipLabel?: (value: string) => string;
  /** Värdenas ordning; annars i bokstavsordning. */
  order?: string[];
  /** Förvalet i en lista, t.ex. "Alla API:er". */
  allLabel?: string;
}

export interface CardContent {
  href: string;
  namn: string;
  ingress: string;
  /** Etiketter över namnet, t.ex. område och status. */
  labels: React.ReactNode;
}

export interface CatalogSearchConfig<T> {
  items: T[];
  id: (item: T) => string;
  name: (item: T) => string;
  /** Området, som listan grupperas efter. */
  category: (item: T) => string;
  categoryOrder: string[];
  /** Sökfälten, med vikt, och texten i dem för en post. */
  fields: Field[];
  texts: (item: T) => Record<string, string[]>;
  synonyms: Synonyms;
  /** Filtren utöver området. */
  facets: Facet<T>[];
  card: (item: T) => CardContent;
  /** Vad posterna kallas: "API:er", "webbapplikationer". */
  plural: string;
  /** Rubriken för vad som söks på, ovanför sökfältet. */
  searchLabel: string;
  placeholder: string;
  /** Sökningar att prova, för den som inte vet vad det de letar efter heter. */
  examples: string[];
  /** Id för sektionen med resultatlistan, dit "Visa träffar" scrollar. */
  resultsId: string;
}

type Sort = 'relevans' | 'namn' | 'omrade';

/** Områdesfiltret har alltid nyckeln "omrade". */
const AREA = 'omrade';

export interface SearchState {
  q: string;
  sort: '' | Sort;
  /** Valda värden per filter. */
  filters: Record<string, string[]>;
}

function emptyState(): SearchState {
  return { q: '', sort: '', filters: {} };
}

/** Läser sökningen ur adressen, så att en sökning går att dela som länk. */
function readUrl(keys: string[]): SearchState {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get('sort') ?? '';
  const filters: Record<string, string[]> = {};
  for (const key of keys) {
    const v = p.getAll(key).filter(Boolean);
    if (v.length) filters[key] = v;
  }
  return {
    q: p.get('q') ?? '',
    sort: (['relevans', 'namn', 'omrade'] as const).includes(sort as Sort) ? (sort as Sort) : '',
    filters,
  };
}

function writeUrl(s: SearchState, keys: string[]) {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set('q', s.q.trim());
  for (const key of keys) for (const v of s.filters[key] ?? []) p.append(key, v);
  if (s.sort) p.set('sort', s.sort);
  const query = p.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
}

export interface CatalogSearch<T> {
  config: CatalogSearchConfig<T>;
  state: SearchState;
  setQuery: (q: string) => void;
  setSort: (sort: Sort) => void;
  toggle: (facet: string, value: string) => void;
  setSelect: (facet: string, value: string) => void;
  clearFilters: () => void;
  reset: () => void;
  results: { item: T; result: SearchResult }[];
  corrections: { from: string; to: string }[];
  suggestion?: string;
  sort: Sort;
  /** Antal träffar per filter och värde, med sökningen och övriga filter tillämpade. */
  counts: Record<string, Map<string, number>>;
  /** Alla filter, med området först. */
  facets: Facet<T>[];
  filterCount: number;
  active: boolean;
}

export function useCatalogSearch<T>(config: CatalogSearchConfig<T>): CatalogSearch<T> {
  const facets = useMemo<Facet<T>[]>(
    () => [
      {
        key: AREA,
        label: 'Område',
        kind: 'checkbox',
        values: (item) => [config.category(item)],
        order: config.categoryOrder,
      },
      ...config.facets,
    ],
    [config],
  );
  const keys = facets.map((f) => f.key);

  const [state, setState] = useState<SearchState>(() =>
    typeof window === 'undefined' ? emptyState() : readUrl(keys),
  );

  const { index, byId } = useMemo(() => {
    const docs: SearchDoc[] = config.items.map((item) => ({
      id: config.id(item),
      name: config.name(item),
      fields: config.texts(item),
    }));
    return {
      index: buildIndex(docs, config.fields, config.synonyms),
      byId: new Map(config.items.map((item) => [config.id(item), item])),
    };
  }, [config]);

  useEffect(() => writeUrl(state, keys), [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const { results: matched, corrections } = useMemo(() => search(index, state.q), [index, state.q]);

  const passes = (item: T, except?: string) =>
    facets.every((f) => {
      if (f.key === except) return true;
      const chosen = state.filters[f.key] ?? [];
      return chosen.length === 0 || f.values(item).some((v) => chosen.includes(v));
    });

  // Antalen vid varje filterval räknas med sökningen och övriga filter
  // tillämpade, så att det syns vad ett val ger innan det görs.
  const counts: Record<string, Map<string, number>> = {};
  for (const f of facets) counts[f.key] = new Map();
  for (const r of matched) {
    const item = byId.get(r.id) as T;
    for (const f of facets) {
      if (!passes(item, f.key)) continue;
      for (const v of new Set(f.values(item))) counts[f.key].set(v, (counts[f.key].get(v) ?? 0) + 1);
    }
  }

  const hasQuery = state.q.trim().length > 0;
  const sort: Sort =
    state.sort && (state.sort !== 'relevans' || hasQuery) ? state.sort : hasQuery ? 'relevans' : 'omrade';

  const results = matched
    .map((result) => ({ item: byId.get(result.id) as T, result }))
    .filter(({ item }) => passes(item));
  if (sort === 'namn' || !hasQuery) {
    results.sort((a, b) => config.name(a.item).localeCompare(config.name(b.item), 'sv'));
  }

  const filterCount = Object.values(state.filters).reduce((n, v) => n + v.length, 0);
  const update = (fn: (s: SearchState) => SearchState) => setState(fn);

  return {
    config,
    state,
    setQuery: (q) => update((s) => ({ ...s, q })),
    setSort: (sort) => update((s) => ({ ...s, sort })),
    toggle: (key, value) =>
      update((s) => {
        const cur = s.filters[key] ?? [];
        const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
        return { ...s, filters: { ...s.filters, [key]: next } };
      }),
    setSelect: (key, value) =>
      update((s) => ({ ...s, filters: { ...s.filters, [key]: value ? [value] : [] } })),
    clearFilters: () => update((s) => ({ ...s, filters: {} })),
    reset: () => setState(emptyState()),
    results,
    corrections,
    suggestion:
      results.length === 0 && hasQuery ? suggestName(config.items.map(config.name), state.q) : undefined,
    sort,
    counts,
    facets,
    filterCount,
    active: hasQuery || filterCount > 0,
  };
}

function facetOptions<T>(facet: Facet<T>, items: T[]): string[] {
  const all = new Set(items.flatMap(facet.values));
  if (facet.order) return facet.order.filter((v) => all.has(v));
  return [...all].sort((a, b) =>
    (facet.optionLabel?.(a) ?? a).localeCompare(facet.optionLabel?.(b) ?? b, 'sv'),
  );
}

function scrollToResults(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/** Sökfält, snabbsökningar och filter. Resultaten visas av SearchResults. */
export function SearchPanel<T>({ search: s }: { search: CatalogSearch<T> }) {
  const { config, state, counts, facets } = s;
  const input = useRef<HTMLInputElement>(null);
  const [visaFilter, setVisaFilter] = useState(false);

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

  const label = (f: Facet<T>, v: string) => f.optionLabel?.(v) ?? v;
  const valda = facets.flatMap((f) =>
    (state.filters[f.key] ?? []).map((v) => ({
      key: `${f.key}=${v}`,
      label: f.chipLabel?.(v) ?? label(f, v),
      remove: () => (f.kind === 'select' ? s.setSelect(f.key, '') : s.toggle(f.key, v)),
    })),
  );
  const area = facets[0];
  const small = facets.slice(1).filter((f) => f.kind === 'checkbox');
  const lists = facets.slice(1).filter((f) => f.kind === 'select');

  const checkboxes = (f: Facet<T>, layout: string) => (
    <fieldset key={f.key} className="border-0 p-0 m-0 min-w-0">
      <legend className="font-bold mb-8">{f.label}</legend>
      <div className={layout}>
        {facetOptions(f, config.items).map((v) => {
          const n = counts[f.key].get(v) ?? 0;
          const vald = (state.filters[f.key] ?? []).includes(v);
          return (
            <Checkbox
              key={v}
              color="vattjom"
              checked={vald}
              disabled={n === 0 && !vald}
              onChange={() => s.toggle(f.key, v)}
            >
              {label(f, v)} <span className="text-dark-secondary">({n})</span>
            </Checkbox>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div className="mt-24 flex flex-col gap-24">
      <form
        role="search"
        aria-label={`Sök bland ${config.plural}`}
        onSubmit={(e) => {
          e.preventDefault();
          scrollToResults(config.resultsId);
        }}
      >
        <label htmlFor={`${config.resultsId}-sok`} className="block font-bold mb-8">
          {config.searchLabel}
        </label>
        <SearchField
          ref={input}
          id={`${config.resultsId}-sok`}
          value={state.q}
          onChange={(e) => s.setQuery(e.target.value)}
          onReset={() => s.setQuery('')}
          onSearch={() => scrollToResults(config.resultsId)}
          placeholder={config.placeholder}
          resetAriaLabel="Rensa sökningen"
          autoComplete="off"
          aria-describedby={`${config.resultsId}-sok-tips`}
        />
        <p id={`${config.resultsId}-sok-tips`} className="text-small text-dark-secondary mt-8 mb-0">
          Sökningen tål stavfel och förstår vardagliga ord. Tryck på / för att hoppa hit.
        </p>
      </form>

      <div className="flex flex-wrap items-center gap-8">
        <span className="text-small text-dark-secondary">Prova att söka på:</span>
        {config.examples.map((ex) => {
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
              onClick={() => s.setQuery(ex)}
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
          aria-controls={`${config.resultsId}-filter`}
          onClick={() => setVisaFilter((v) => !v)}
        >
          {visaFilter ? 'Dölj filter' : `Visa filter${s.filterCount ? ` (${s.filterCount})` : ''}`}
        </Button>

        <div
          id={`${config.resultsId}-filter`}
          className={`${visaFilter ? 'grid' : 'hidden'} md:grid gap-32 mt-16 md:mt-0 md:grid-cols-2 xl:grid-cols-4`}
        >
          <div className="md:col-span-2 xl:col-span-4">
            {checkboxes(area, 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}
          </div>
          {small.map((f) => checkboxes(f, 'flex flex-col gap-8'))}
          {lists.map((f) => (
            <FormControl key={f.key} id={`${config.resultsId}-${f.key}`} className="w-full">
              <FormLabel>{f.label}</FormLabel>
              <Select
                className="w-full"
                value={state.filters[f.key]?.[0] ?? ''}
                onChange={(e) => s.setSelect(f.key, e.target.value)}
              >
                <Select.Option value="">{f.allLabel ?? 'Alla'}</Select.Option>
                {facetOptions(f, config.items).map((v) => (
                  <Select.Option key={v} value={v}>
                    {label(f, v)} ({counts[f.key].get(v) ?? 0})
                  </Select.Option>
                ))}
              </Select>
            </FormControl>
          ))}
          <FormControl id={`${config.resultsId}-sortering`} className="w-full">
            <FormLabel>Sortera efter</FormLabel>
            <Select className="w-full" value={s.sort} onChange={(e) => s.setSort(e.target.value as Sort)}>
              {state.q.trim() && <Select.Option value="relevans">Bästa träff</Select.Option>}
              <Select.Option value="omrade">Område</Select.Option>
              <Select.Option value="namn">Namn A–Ö</Select.Option>
            </Select>
          </FormControl>
        </div>
      </div>

      {valda.length > 0 && (
        <div className="flex flex-wrap items-center gap-8" role="group" aria-label="Valda filter">
          <span className="text-small text-dark-secondary">Valda filter:</span>
          {valda.map((v) => (
            <Chip key={v.key} type="button" onClick={v.remove} aria-label={`Ta bort filtret ${v.label}`}>
              {v.label}
            </Chip>
          ))}
          <Button variant="tertiary" size="sm" color="vattjom" onClick={s.clearFilters}>
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

function ResultCard({ content, result }: { content: CardContent; result: SearchResult }) {
  const { hit, terms } = result;
  return (
    <Card color="mono" useHoverEffect href={content.href}>
      <Card.Body>
        <div className="flex flex-wrap gap-8 pt-8">{content.labels}</div>
        <h3 className="font-header text-h4-sm md:text-h4-md xl:text-h4-lg text-dark-primary mt-12 mb-0">
          <Marked text={content.namn} terms={terms} />
        </h3>
        <p className="mt-8 mb-0">
          <Marked text={content.ingress} terms={terms} />
        </p>
        {hit && (
          <p className="mt-8 mb-0 text-small text-dark-secondary">
            <strong>{hit.label}:</strong> <Marked text={excerpt(hit)} terms={terms} />
          </p>
        )}
        <p className="mt-12 mb-0 font-bold text-vattjom-text-primary">Läs mer om {content.namn} →</p>
      </Card.Body>
    </Card>
  );
}

/** Resultatlistan: grupperad per område, eller i en lista efter relevans eller namn. */
export function SearchResults<T>({ search: s }: { search: CatalogSearch<T> }) {
  const { config, results, corrections, suggestion, sort, active, state } = s;
  const total = config.items.length;

  const grid = (list: typeof results) => (
    <div className="mt-16 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
      {list.map(({ item, result }) => (
        <ResultCard key={result.id} content={config.card(item)} result={result} />
      ))}
    </div>
  );

  const grupper =
    sort === 'omrade'
      ? config.categoryOrder
          .map((c) => ({ kategori: c, list: results.filter(({ item }) => config.category(item) === c) }))
          .filter((g) => g.list.length > 0)
      : [];

  return (
    <>
      <p className="mt-24 mb-0 font-bold" role="status" aria-live="polite">
        {active ? `Visar ${results.length} av ${total} ${config.plural}` : `Visar alla ${total} ${config.plural}`}
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
            Inga {config.plural} matchar din sökning
            {state.q.trim() ? ` på ”${state.q.trim()}”` : ''}
            {s.filterCount > 0 ? ' med de valda filtren' : ''}.
          </p>
          {suggestion && (
            <Button variant="secondary" color="vattjom" onClick={() => s.setQuery(suggestion)}>
              {`Sök på ${suggestion}`}
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
              {g.kategori} <span className="text-dark-secondary">({g.list.length})</span>
            </h3>
            {grid(g.list)}
          </section>
        ))
      ) : (
        grid(results)
      )}
    </>
  );
}
