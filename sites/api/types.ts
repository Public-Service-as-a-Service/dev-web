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
  /** Källkodsrepot på GitHub; saknas när lösningen inte publiceras som öppen källkod. */
  repo?: string | null;
  /** GitHub-organisation som äger källkodsrepot; Sundsvallskommun när fältet saknas. */
  agare?: string | null;
  namn: string;
  slug: string;
  kategori: string;
  status?: string | null;
  apiVersion?: string | null;
  /**
   * Hur konsumenter autentiserar sig mot API-plattformen, när det avviker från
   * standarden (OAuth2-klientuppgifter), t.ex. för öppna API:er.
   */
  atkomst?: string | null;
  /**
   * operationId för anrop som bara är till för kommunens interna bruk. De tas
   * bort ur den publicerade specifikationen av scripts/generate-pages.py.
   */
  interna?: string[] | null;
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

/** Webbadressen till ett API:s källkodsrepo på GitHub, eller null om källkoden inte är publicerad. */
export function repoUrl(api: { repo?: string | null; agare?: string | null }): string | null {
  return api.repo ? `https://github.com/${api.agare ?? DEFAULT_AGARE}/${api.repo}` : null;
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
