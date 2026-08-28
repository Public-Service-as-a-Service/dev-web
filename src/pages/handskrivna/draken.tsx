import { Link } from '@sk-web-gui/react';
import React from 'react';

/** Gemensamma byggstenar för de tre handskrivna sidorna, som alla bygger på
 *  den delade ärendehanteringskodbasen (web-app-draken-public). */

export const drakenRepoUrl = 'https://github.com/Sundsvallskommun/web-app-draken-public';

export const drakenFactLinks = [
  { label: 'Programvaruförteckning (SBOM)', href: 'draken-sbom.html' },
  { label: 'Källkod på GitHub', href: drakenRepoUrl },
];

export const drakenTeknik: React.ReactNode[] = [
  <>
    <strong>Körmiljö:</strong> Node.js 20 LTS eller senare
  </>,
  <>
    <strong>Frontend:</strong> React-baserad webbapplikation
  </>,
  <>
    <strong>Pakethantering:</strong> Yarn
  </>,
  <>
    <strong>Test:</strong> Vitest (backend, med kodtäckning), Cypress och Playwright (end-to-end)
  </>,
];

export const drakenArkitekturIntro = (
  <>
    Applikationen består av en webbaserad frontend och en tillhörande backend som utvecklas i
    samma kodbas (monorepo). Backend förmedlar alla anrop till verksamhetssystemen via kommunens
    gemensamma API-plattform (WSO2) – frontend pratar aldrig direkt med underliggande system.
    Inloggning sker med organisationens identitetslösning via SAML (single sign-on).
  </>
);

export const drakenDiagramCaption =
  'Lösningsarkitektur, härledd ur källkodens konfiguration (API-prenumerationer, miljöfiler och funktionsflaggor).';

export function drakenKonfiguration(instans: 'per verksamhet' | 'en instans'): React.ReactNode[] {
  return [
    instans === 'per verksamhet' ? (
      <>
        Varje verksamhetsinstans konfigureras med egna miljövariabelfiler för frontend respektive
        backend.
      </>
    ) : (
      <>Instansen konfigureras med egna miljövariabelfiler för frontend respektive backend.</>
    ),
    <>
      Åtkomst till API-plattformen kräver klientnyckel och klienthemlighet (
      <code>CLIENT_KEY</code>/<code>CLIENT_SECRET</code>) som utfärdas i WSO2.
    </>,
    <>
      Inloggning kräver SAML-konfiguration: ingångspunkt till identitetsleverantören samt
      certifikat och nyckelpar (<code>SAML_ENTRY_SSO</code>, <code>SAML_IDP_PUBLIC_CERT</code>,{' '}
      <code>SAML_PRIVATE_KEY</code>, <code>SAML_PUBLIC_KEY</code>).
    </>,
    instans === 'per verksamhet' ? (
      <>Funktioner kan slås av och på per instans via funktionsflaggor i frontend-konfigurationen.</>
    ) : (
      <>Funktioner kan slås av och på via funktionsflaggor i frontend-konfigurationen.</>
    ),
    <>
      Applikationen kan köras i utvecklings- och produktionsläge, med produktionsbyggen per
      verksamhetsinstans.
    </>,
  ];
}

export const drakenKallkod = (
  <>
    Källkoden är öppen och utvecklas aktivt hos{' '}
    <Link href={drakenRepoUrl} external>
      Sundsvalls kommun på GitHub
    </Link>
    . I källkodsförrådet finns även instruktioner för att klona, konfigurera och starta
    applikationen i egen miljö.
  </>
);
