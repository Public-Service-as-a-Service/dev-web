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
  ...sectionLinks('../', 'tjanster'),
  { label: 'Om katalogen', href: '#om-katalogen' },
  { label: 'Sök', href: '#sok' },
  { label: 'Webbapplikationer', href: '#tjanster' },
];


export function IndexPage() {
  const sok = useCatalogSearch(searchConfig);

  return (
    <>
      <SiteHeader menu={menu} prefix="../" />
      <main>
        <Hero
          kicker="Öppen källkod från Sundsvalls kommun"
          title="En katalog över kommunens öppna webbapplikationer"
          lead="Sundsvalls kommun utvecklar digitala tjänster för invånare, företag och medarbetare – och delar dem öppet med omvärlden. Här hittar du en samlad översikt över de webbapplikationer som kommunen publicerar som öppen källkod."
          actions={
            <>
              <ButtonLink as="a" href="#sok" variant="primary" color="vattjom">
                Sök bland applikationerna
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
                    <strong>Ett 40-tal</strong> öppna webbapplikationer
                  </>,
                  <>
                    Tjänster för <strong>invånare, företag och medarbetare</strong>
                  </>,
                  <>
                    Publiceras öppet på <strong>GitHub</strong>
                  </>,
                  <>
                    Fritt att <strong>återanvända och vidareutveckla</strong>
                  </>,
                ]}
              />
            }
          >
            <p>
              Sundsvalls kommun arbetar enligt principen <em>öppen källkod först</em> och
              tillgängliggör sina webbapplikationer på GitHub, där de kan användas, granskas och
              vidareutvecklas av andra kommuner, organisationer och intresserade.
            </p>
            <p>
              Varje webbapplikation presenteras på en egen sida med två delar: en verksamhetsnära
              beskrivning av vad tjänsten gör och vem den är till för, samt en teknisk
              dokumentation för dig som vill förstå hur applikationen är byggd eller vill
              återanvända den i din egen organisation.
            </p>
            <p>Katalogen byggs ut successivt med fler applikationer ur kommunens utbud.</p>
          </TwoColumns>
        </PageSection>

        <PageSection id="sok">
          <h2 className="font-header">Hitta rätt webbapplikation</h2>
          <p className="text-lead">
            Sök på det du vill göra – chatta med en AI-assistent, handlägga ekonomiskt bistånd,
            felanmäla något i stadsmiljön – eller avgränsa med filtren. Listan nedan uppdateras
            medan du skriver.
          </p>
          <SearchPanel search={sok} />
        </PageSection>

        <PageSection id="tjanster" alt>
          <h2 className="font-header">Webbapplikationer i katalogen</h2>
          <p className="text-lead">
            Katalogen omfattar de öppna webbapplikationer som körs i drift, grupperade per
            område – en sida per källkodsförråd. Bygger ett förråd flera webbappar presenteras
            de på en gemensam sida som visar vilka processer varje webb implementerar. Välj en
            applikation för att läsa mer.
          </p>
          <SearchResults search={sok} />
          <NoteBox>
            Katalogen omfattar samtliga repon som börjar med <code>web-app</code> hos Sundsvalls
            kommun på GitHub. Nya applikationer läggs till efter hand som de publiceras.
          </NoteBox>
        </PageSection>
      </main>
      <SiteFooter links={footerLinks('../')} />
    </>
  );
}
