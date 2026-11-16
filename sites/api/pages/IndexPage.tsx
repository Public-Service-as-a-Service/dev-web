import {
  ButtonLink,
  FactBox,
  Hero,
  NoteBox,
  PageSection,
  SearchPanel,
  SearchResults,
  SiteFooter,
  SiteHeader,
  TwoColumns,
  footerLinks,
  sectionLinks,
  useCatalogSearch,
} from '@sundsvall/chrome';
import { searchConfig } from '../search-config';

const menu = [
  ...sectionLinks('../', 'api'),
  { label: 'Om katalogen', href: '#om-katalogen' },
  { label: 'Sök', href: '#sok' },
  { label: 'API:er', href: '#apier' },
];


export function IndexPage() {
  const sok = useCatalogSearch(searchConfig);

  return (
    <>
      <SiteHeader menu={menu} prefix="../" />
      <main>
        <Hero
          kicker="Sundsvalls kommun"
          title="En katalog över kommunens API:er"
          lead="Sundsvalls kommun bygger sina digitala tjänster på en gemensam plattform av mikrotjänster. Här hittar du en samlad översikt över de API:er som körs i produktion på kommunens API-plattform, med interaktiv API-dokumentation via Swagger UI."
          actions={
            <>
              <ButtonLink as="a" href="#sok" variant="primary" color="vattjom">
                Sök bland API:erna
              </ButtonLink>
              <ButtonLink
                as="a"
                href="https://github.com/Sundsvallskommun"
                variant="secondary"
                color="vattjom"
              >
                Besök Sundsvalls kommun på GitHub
              </ButtonLink>
            </>
          }
        />

        <PageSection id="om-katalogen">
          <h2 className="font-header">Vad innehåller katalogen?</h2>
          <TwoColumns
            aside={
              <FactBox
                title="Snabbfakta"
                items={[
                  <>
                    <strong>Ett 70-tal</strong> API:er i skarp produktion
                  </>,
                  <>
                    Mikrotjänster bakom kommunens <strong>digitala tjänster</strong>
                  </>,
                  <>
                    Interaktiv dokumentation via <strong>Swagger UI</strong>
                  </>,
                  <>
                    Nås via kommunens <strong>API-plattform</strong>
                  </>,
                  <>
                    Många delas som <strong>öppen källkod</strong> på GitHub
                  </>,
                ]}
              />
            }
          >
            <p>
              Det här är Sundsvalls kommuns API-katalog: en samlad förteckning över de API:er som
              just nu körs skarpt i produktion på kommunens gemensamma API-plattform. Varje API
              listas under det namn och med den version som det exponeras med på plattformen.
            </p>
            <p>
              Varje API presenteras på en egen sida med två delar: en verksamhetsnära beskrivning
              av vad API:et gör och vilken nytta det skapar, samt en teknisk dokumentation för dig
              som vill förstå hur tjänsten är byggd eller vill återanvända den i din egen
              organisation. Dessutom kan varje API:s samtliga resurser och datamodeller utforskas
              interaktivt i Swagger UI, direkt ur tjänstens OpenAPI-specifikation.
            </p>
            <p>
              Kommunen arbetar enligt principen <em>öppen källkod först</em>, och många av
              API:erna delas därför på GitHub där de kan användas, granskas och vidareutvecklas av
              andra kommuner och organisationer. Katalogen omfattar dock även API:er vars
              lösningar inte publiceras som öppen källkod.
            </p>
          </TwoColumns>
        </PageSection>

        <PageSection id="sok">
          <h2 className="font-header">Hitta rätt API</h2>
          <p className="text-lead">
            Sök på det du vill göra – skicka sms, hämta uppgifter om en person, skapa ett
            ärende – eller avgränsa med filtren. Listan nedan uppdateras medan du skriver.
          </p>
          <SearchPanel search={sok} />
        </PageSection>

        <PageSection id="apier" alt>
          <h2 className="font-header">API:er i katalogen</h2>
          <p className="text-lead">
            Katalogen omfattar de API:er som körs i produktion på kommunens gemensamma
            API-plattform, grupperade per område. Välj ett API för att läsa mer och utforska dess
            dokumentation.
          </p>
          <SearchResults search={sok} />
          <NoteBox>
            Katalogen visar de API:er, och de versioner, som körs skarpt i produktion vid
            ögonblicket. Avvecklade API:er och prototyper ingår inte. Nya API:er läggs till efter
            hand som de driftsätts.
          </NoteBox>
        </PageSection>
      </main>
      <SiteFooter links={footerLinks('../')} />
    </>
  );
}
