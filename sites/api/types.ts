export interface ApiFunktion {
  titel: string;
  text: string;
}

export interface ApiBeroende {
  name: string;
  version?: string | null;
  usage?: string | null;
}

export interface ApiTeknik {
  sprak?: string | null;
  ramverk?: string | null;
  ovrigt?: string | null;
}

export interface ApiData {
  repo: string;
  /** GitHub-organisation som äger källkodsrepot; Sundsvallskommun när fältet saknas. */
  agare?: string | null;
  namn: string;
  slug: string;
  kategori: string;
  status?: string | null;
  apiVersion?: string | null;
  ingress?: string;
  beskrivning?: string[];
  malgrupp?: string;
  funktioner?: ApiFunktion[];
  beroenden?: ApiBeroende[] | null;
  integrationer?: string[] | null;
  databas?: string | null;
  teknik?: ApiTeknik | null;
  konfiguration?: string[] | null;
  anteckningar?: string[] | null;
}

/** GitHub-organisationen som kommunens api-service-repon ligger under. */
export const DEFAULT_AGARE = 'Sundsvallskommun';

/** Webbadressen till ett API:s källkodsrepo på GitHub. */
export function repoUrl(api: { repo: string; agare?: string | null }): string {
  return `https://github.com/${api.agare ?? DEFAULT_AGARE}/${api.repo}`;
}

/** Ägarens namn i löptext: kommunen för dess egna repon, annars organisationens namn. */
export function agareNamn(agare?: string | null): string {
  return !agare || agare === DEFAULT_AGARE ? 'Sundsvalls kommun' : agare;
}

export const STATUS_LABEL: Record<string, string> = {
  poc: 'Prototyp',
  avvecklad: 'Avvecklad',
  verktyg: 'Verktyg',
};

export interface SbomKomponent {
  namn: string;
  version: string;
  licens: string;
}

export interface SbomProvenans {
  namn: string;
  created: string;
  spdx: string;
  verktyg: string;
}

/** Läser sidans inbäddade data, genererad av scripts/generate-pages.py. */
export function readPageData<T>(): T {
  const el = document.getElementById('page-data');
  if (!el?.textContent) {
    throw new Error('Sidan saknar inbäddad data (#page-data).');
  }
  return JSON.parse(el.textContent) as T;
}
