import { Link } from '@sk-web-gui/react';
import React from 'react';
import { AppArticle } from '../components/AppArticle';
import { type AppApi, type AppData, STATUS_LABEL } from '../types';

export interface AppPageData {
  app: AppData;
  hasSbom: boolean;
  sbom: { komponenter: number; licenser: number } | null;
}

const MASTER_DATA_APIS = new Set(['citizen', 'employee', 'legalentity', 'party', 'activedirectory']);

function sortedApiRows(apis: AppApi[]): AppApi[] {
  const isMaster = (a: AppApi) => MASTER_DATA_APIS.has(a.name.toLowerCase().replace(/-/g, ''));
  return [...apis.filter((a) => !isMaster(a)), ...apis.filter(isMaster)];
}

function archProse(app: AppData): string {
  const t = app.teknik ?? {};
  const bits: string[] = [];
  if (t.frontend && t.backend) {
    bits.push(
      `Applikationen består av en webbaserad frontend (${t.frontend}) och en backend (${t.backend}) som utvecklas i samma kodbas.`,
    );
  } else if (t.frontend) {
    bits.push(`Applikationen är en webbaserad frontend (${t.frontend}).`);
  } else if (t.backend) {
    bits.push(`Applikationen är en backendtjänst (${t.backend}).`);
  } else {
    bits.push('Applikationen är en webbapplikation; se källkoden för detaljer om uppbyggnaden.');
  }
  if (app.apis?.length) {
    bits.push(
      'Verksamhetsanrop går via kommunens gemensamma API-plattform (WSO2) – frontend pratar aldrig direkt med underliggande system.',
    );
  }
  if (app.auth && !app.auth.toLowerCase().includes('ingen')) {
    bits.push(`Inloggning: ${app.auth}.`);
  }
  if (app.integrationer?.length) {
    bits.push(`Övriga integrationer som förekommer i koden: ${app.integrationer.join(', ')}.`);
  }
  return bits.join(' ');
}

function teknikItems(app: AppData): React.ReactNode[] {
  const t = app.teknik ?? {};
  const items: React.ReactNode[] = [];
  if (t.frontend) {
    items.push(
      <>
        <strong>Frontend:</strong> {t.frontend}
      </>,
    );
  }
  if (t.backend) {
    items.push(
      <>
        <strong>Backend:</strong> {t.backend}
      </>,
    );
  }
  if (t.tester) {
    items.push(
      <>
        <strong>Test:</strong> {t.tester}
      </>,
    );
  }
  if (items.length === 0) {
    items.push(<>Se källkodens paketfiler för detaljer.</>);
  }
  return items;
}

export function AppPage({ data }: { data: AppPageData }) {
  const { app, hasSbom, sbom } = data;
  const repoUrl = `https://github.com/Sundsvallskommun/${app.repo}`;
  const status = app.status ? STATUS_LABEL[app.status] : undefined;

  return (
    <AppArticle
      titel={app.namn}
      kategori={app.kategori}
      status={status}
      ingress={app.ingress}
      beskrivning={app.beskrivning ?? []}
      funktionerTitel="Det här stödjer applikationen"
      funktioner={(app.funktioner ?? []).map((f) => (
        <>
          <strong>{f.titel}</strong> – {f.text}
        </>
      ))}
      factItems={[
        <>
          Målgrupp: <strong>{app.malgrupp ?? '–'}</strong>
        </>,
        <>
          Kategori: <strong>{app.kategori}</strong>
        </>,
        <>
          Status: <strong>{status ?? 'Aktiv'}</strong>
        </>,
        <>
          Inloggning: <strong>{app.auth ?? '–'}</strong>
        </>,
      ]}
      factLinks={[
        ...(hasSbom
          ? [{ label: 'Programvaruförteckning (SBOM)', href: `${app.slug}-sbom.html` }]
          : []),
        { label: 'Källkod på GitHub', href: repoUrl },
      ]}
      diagramSlug={app.slug}
      diagramAlt={`Arkitekturskiss för ${app.namn}: webbappens delar och dess integrationer.`}
      diagramCaption="Lösningsarkitektur, härledd ur källkodens konfiguration."
      arkitektur={[archProse(app)]}
      teknik={teknikItems(app)}
      apiRows={app.apis ? sortedApiRows(app.apis) : null}
      konfiguration={
        app.konfiguration?.length ? app.konfiguration : ['Se källkodens miljöfilsexempel.']
      }
      anteckningar={app.anteckningar ?? undefined}
      sbom={
        hasSbom && sbom ? (
          <>
            <h3 className="font-header">Programvaruförteckning</h3>
            <p>
              Applikationen bygger på {sbom.komponenter} tredjepartskomponenter fördelade på{' '}
              {sbom.licenser} olika licenser. Förteckningen omfattar hela beroendeträdet, alltså
              även byggkedjan och inte bara det som levereras till webbläsaren. Se{' '}
              <Link href={`${app.slug}-sbom.html`}>programvaruförteckningen</Link> för hela
              listan.
            </p>
          </>
        ) : undefined
      }
      kallkod={
        <>
          Källkoden är öppen och finns hos{' '}
          <Link href={repoUrl} external>
            Sundsvalls kommun på GitHub
          </Link>
          . I källkodsförrådet finns även instruktioner för att klona, konfigurera och starta
          applikationen i egen miljö.
        </>
      }
    />
  );
}
