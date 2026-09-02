export interface AppFunktion {
  titel: string;
  text: string;
}

export interface AppApi {
  name: string;
  version?: string | null;
  usage?: string | null;
}

export interface AppWebb {
  namn: string;
  beskrivning?: string;
  processer: string[];
}

export interface AppTeknik {
  frontend?: string | null;
  backend?: string | null;
  tester?: string | null;
}

export interface AppData {
  repo: string;
  namn: string;
  slug: string;
  kategori: string;
  status?: string | null;
  ingress?: string;
  beskrivning?: string[];
  malgrupp?: string;
  funktioner?: AppFunktion[];
  webbar?: AppWebb[] | null;
  apis?: AppApi[] | null;
  integrationer?: string[] | null;
  auth?: string | null;
  teknik?: AppTeknik | null;
  konfiguration?: string[] | null;
  anteckningar?: string[] | null;
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
