import { Link } from '@sk-web-gui/react';
import {
  ButtonLink,
  DiagramFigure,
  FactBox,
  Hero,
  PageSection,
  SiteFooter,
  SiteHeader,
  TwoColumns,
  footerLinks,
  sectionLinks,
} from '@sundsvall/chrome';

const menu = [
  ...sectionLinks('../', 'arkitektur'),
  { label: 'Hela kartan', href: '#kartan' },
  { label: 'Så läser du bilden', href: '#lasa-bilden' },
  { label: 'Underlag', href: '#underlag' },
];


export function EkosystemetPage() {
  return (
    <>
      <SiteHeader menu={menu} prefix="../" />
      <main>
        <Hero
          back={{ label: 'Tillbaka till målarkitekturen', href: 'index.html' }}
          kicker="Sundsvalls kommun"
          title="Ekosystemet"
          lead="Målarkitekturens översiktsbilder är medvetet abstrakta. Den här sidan visar i stället helheten som den faktiskt ser ut: alla webbapplikationer i webbkatalogen, alla API:er i API-katalogen, vilka API:er varje webb anropar och hur API:erna integrerar med varandra. Bilden är stor och tät – det är poängen. Så här ser ett ekosystem av väl avgränsade komponenter ut i verkligheten."
          actions={
            <>
              <ButtonLink as="a" href="#kartan" variant="primary" color="vattjom">
                Visa kartan
              </ButtonLink>
              <ButtonLink as="a" href="#lasa-bilden" variant="secondary" color="vattjom">
                Läs bildförklaringen
              </ButtonLink>
            </>
          }
        />

        <PageSection id="kartan">
          <h2 className="font-header">Hela kartan</h2>
          <p className="text-lead">
            39 webbapplikationer, 75 API:er på API-plattformen, masterdata-API:erna i
            metakatalogen samt anropade API:er och tjänster utanför katalogerna – med samtliga 296
            anropsrelationer utritade. Bilden rullas i sidled; öppna den gärna i full storlek.
          </p>

          <DiagramFigure
            src="assets/diagrams/ekosystemet.svg"
            alt="Stor arkitekturritning över hela ekosystemet: överst alla webbapplikationer, därunder API-katalogens API:er skiktade efter beroenden, längst ned masterdata-API:erna i metakatalogen samt API:er och tjänster utanför katalogerna. Pilar visar varje anropsrelation – webbappar som anropar API:er och API:er som anropar varandra, till exempel Party som anropar Citizen och LegalEntity."
            scrollable
          >
            Hela ekosystemet med alla anropsrelationer. Pilar visar anrop från anropande till
            anropad komponent; alla anrop går via den gemensamma API-plattformen.{' '}
            <Link href="assets/diagrams/ekosystemet.svg" target="_blank" rel="noopener">
              Öppna bilden i full storlek
            </Link>
          </DiagramFigure>
        </PageSection>

        <PageSection id="lasa-bilden" alt>
          <h2 className="font-header">Så läser du bilden</h2>
          <TwoColumns
            aside={
              <FactBox
                title="Snabbfakta"
                items={[
                  <>
                    <strong>39</strong> webbapplikationer i webbkatalogen
                  </>,
                  <>
                    <strong>75</strong> API:er i API-katalogen
                  </>,
                  <>
                    <strong>160</strong> anrop från webbappar till API:er
                  </>,
                  <>
                    <strong>136</strong> anrop mellan API:er
                  </>,
                  <>
                    Mest anropade: <strong>Messaging</strong>, <strong>SimulatorServer</strong>,{' '}
                    <strong>Party</strong>, <strong>Employee</strong> och <strong>Citizen</strong>
                  </>,
                  <>
                    Alla anrop går via den gemensamma <strong>API-plattformen</strong>
                  </>,
                ]}
                links={[
                  {
                    label: 'API-katalogen',
                    href: 'https://api-katalog.sundsvall.dev/index.html',
                  },
                  {
                    label: 'Webbkatalogen',
                    href: 'https://web-katalog.sundsvall.dev/index.html',
                  },
                ]}
              />
            }
          >
            <p>
              Bilden är ordnad i band uppifrån och ned. Överst ligger{' '}
              <strong>webbapplikationerna</strong> (blå) – gränssnitten som invånare, företagare
              och medarbetare möter. De innehåller ingen egen verksamhetslogik utan skapas med
              API:er: varje blå pil nedåt är ett API som webben anropar via API-plattformen.
            </p>
            <p>
              Mittenbandet är <strong>API:erna i API-katalogen</strong> (gröna). De är skiktade
              efter sina beroenden: ett API ligger alltid under de webbappar och API:er som
              anropar det, så anropen pekar nedåt genom bilden. Gröna pilar är API:er som anropar
              varandra – det är så kompletta lösningar sätts samman av väl avgränsade komponenter.
              De få pilar som böjer av åt höger och pekar uppåt markerar ömsesidiga beroenden
              mellan två API:er.
            </p>
            <p>
              Näst längst ned ligger <strong>masterdata</strong> (gula) – metakatalogens API:er
              med gemensamma grunddata om personer, företag, organisation och medarbetare. Här
              syns arkitekturens masterdata-mönster tydligt: <strong>Party</strong> anropar{' '}
              <strong>Citizen</strong> och <strong>LegalEntity</strong> och översätter mellan
              partId och person- eller organisationsnummer, så att övriga API:er bara behöver
              känna till Party i stället för att själva hantera personuppgifter.
            </p>
            <p>
              Längst ned samlas <strong>anropade API:er och tjänster utanför katalogerna</strong>{' '}
              (grå, streckade): interna stöd-API:er som ännu inte publicerats i katalogen,
              verksamhetsspecifika process-API:er samt externa och delade tjänster, till exempel
              den Intric-baserade AI-plattformen Eneo.
            </p>
            <p>
              Några komponenter sticker ut som ekosystemets nav. <strong>Messaging</strong> är den
              mest anropade komponenten – all kommunikation och alla utskick går genom den.{' '}
              <strong>Party</strong> och masterdata-API:erna <strong>Employee</strong> och{' '}
              <strong>Citizen</strong> anropas från hela ekosystemet, och{' '}
              <strong>SimulatorServer</strong> anropas av de flesta webbappar som simulerings- och
              teststöd under utveckling. Det är återanvändning i praktiken: en förmåga etableras
              en gång och används av många.
            </p>
          </TwoColumns>
        </PageSection>

        <PageSection id="underlag">
          <h2 className="font-header">Underlag och avgränsningar</h2>
          <p className="text-lead">
            Bilden är genererad ur katalogernas dokumentation – varje pil är en dokumenterad
            anropsrelation, ingen är ritad på fri hand.
          </p>
          <p>
            Webbapplikationerna och deras API-anrop kommer från{' '}
            <Link
              href="https://web-katalog.sundsvall.dev/index.html"
              external
            >
              webbkatalogen
            </Link>{' '}
            och API:erna med sina inbördes beroenden från{' '}
            <Link
              href="https://api-katalog.sundsvall.dev/index.html"
              external
            >
              API-katalogen
            </Link>
            , där informationen i sin tur är härledd ur källkoden på{' '}
            <Link href="https://github.com/Sundsvallskommun" external>
              GitHub
            </Link>
            . Ögonblicksbilden är från augusti 2026 och uppdateras genom att diagrammet genereras
            om från katalogernas data.
          </p>
          <p>
            Några avgränsningar: bilden visar anropsrelationer, inte anropsvolymer eller
            flödesordning. Upphandlade verksamhetssystem syns bara indirekt, via de
            integrations-API:er som ansluter dem (till exempel ByggrIntegrator, OepIntegrator och
            LifecareIntegrator). Masterdata-API:erna och tjänsterna utanför katalogerna är med för
            att beroendena på dem ska synas, men de har ännu inga egna katalogsidor.
          </p>
          <div className="mt-32 rounded-cards border-1 border-divider bg-background-100 p-24" role="note">
            <p className="m-0">
              Detta är en fristående arbetsbild som kompletterar målarkitekturens översiktliga
              beskrivning. Den länkas inte från startsidan och kan komma att ändras i takt med att
              katalogerna växer.
            </p>
          </div>
        </PageSection>
      </main>
      <SiteFooter links={footerLinks('../')} />
    </>
  );
}
