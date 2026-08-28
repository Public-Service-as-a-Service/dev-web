import { Label, Table } from '@sk-web-gui/react';
import React from 'react';
import { DiagramFigure, FactBox, PageHero, PageSection, TwoColumns } from './blocks';
import { SubpageChrome } from './SubpageChrome';
import type { AppApi } from '../types';

export interface AppArticleProps {
  titel: string;
  kategori: string;
  status?: string;
  ingress: React.ReactNode;
  beskrivning: React.ReactNode[];
  funktionerTitel: string;
  funktioner: React.ReactNode[];
  efterord?: React.ReactNode;
  factItems: React.ReactNode[];
  factLinks: { label: string; href: string }[];
  diagramSlug: string;
  diagramAlt: string;
  diagramCaption: React.ReactNode;
  arkitektur: React.ReactNode[];
  teknik: React.ReactNode[];
  apiRows: AppApi[] | null;
  konfiguration: React.ReactNode[];
  anteckningar?: React.ReactNode[];
  sbom?: React.ReactNode;
  kallkod: React.ReactNode;
}

/** Gemensam sidlayout för applikationssidorna – genererade som handskrivna. */
export function AppArticle(props: AppArticleProps) {
  return (
    <SubpageChrome>
      <PageHero
        crumbs={[
          { label: 'Start', href: '../index.html' },
          { label: 'Webbapplikationer', href: '../index.html#tjanster' },
          { label: props.titel },
        ]}
        tags={
          <>
            <Label inverted color="vattjom">
              {props.kategori}
            </Label>
            {props.status && <Label inverted>{props.status}</Label>}
          </>
        }
        title={props.titel}
        lead={props.ingress}
      />

      <PageSection>
        <h2 className="font-header">Om applikationen</h2>
        <TwoColumns
          aside={<FactBox title="Snabbfakta" items={props.factItems} links={props.factLinks} />}
        >
          {props.beskrivning.map((stycke, i) => (
            <p key={i}>{stycke}</p>
          ))}
          <h3 className="font-header">{props.funktionerTitel}</h3>
          <ul className="flex flex-col gap-8 pl-20 list-disc">
            {props.funktioner.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          {props.efterord && <p>{props.efterord}</p>}
        </TwoColumns>
      </PageSection>

      <PageSection id="teknisk-dokumentation" alt>
        <h2 className="font-header">Teknisk dokumentation</h2>
        <p className="text-lead">
          Nedan beskrivs hur applikationen är uppbyggd, vilka API:er den använder och vad som
          krävs för att driftsätta den. Informationen är härledd ur källkoden och dess
          konfiguration på GitHub.
        </p>

        <h3 className="font-header">Arkitektur</h3>
        <DiagramFigure src={`../assets/diagrams/${props.diagramSlug}.svg`} alt={props.diagramAlt}>
          {props.diagramCaption}
        </DiagramFigure>
        {props.arkitektur.map((stycke, i) => (
          <p key={i}>{stycke}</p>
        ))}

        <h3 className="font-header">Teknikstack</h3>
        <ul className="flex flex-col gap-8 pl-20 list-disc">
          {props.teknik.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <h3 className="font-header">API-beroenden</h3>
        {props.apiRows && props.apiRows.length > 0 ? (
          <>
            <p>
              Applikationen konsumerar följande API:er via kommunens API-plattform. Versionerna
              är hämtade ur källkodens API-konfiguration.
            </p>
            <div className="overflow-x-auto">
              <Table background aria-label={`API-beroenden för ${props.titel}`}>
                <Table.Header>
                  <Table.HeaderColumn>API</Table.HeaderColumn>
                  <Table.HeaderColumn>Version</Table.HeaderColumn>
                  <Table.HeaderColumn>Användning</Table.HeaderColumn>
                </Table.Header>
                <Table.Body>
                  {props.apiRows.map((a) => (
                    <Table.Row key={a.name}>
                      <Table.Column>{a.name}</Table.Column>
                      <Table.Column>{a.version ?? '–'}</Table.Column>
                      <Table.Column>{a.usage ?? ''}</Table.Column>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </>
        ) : (
          <p>Inga prenumerationer på kommunens API-plattform hittades i källkodens konfiguration.</p>
        )}

        <h3 className="font-header">Konfiguration och driftsättning</h3>
        <ul className="flex flex-col gap-8 pl-20 list-disc">
          {props.konfiguration.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>

        {props.anteckningar && props.anteckningar.length > 0 && (
          <>
            <h3 className="font-header">Noterbart ur källkoden</h3>
            <ul className="flex flex-col gap-8 pl-20 list-disc">
              {props.anteckningar.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </>
        )}

        {props.sbom}

        <h3 className="font-header">Källkod</h3>
        <p>{props.kallkod}</p>
      </PageSection>
    </SubpageChrome>
  );
}
