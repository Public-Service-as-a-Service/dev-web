import { Link } from '@sk-web-gui/react';
import {
  ButtonLink,
  DiagramFigure,
  FactBox,
  Hero,
  PageSection,
  TeaserCard,
  TwoColumns,
} from '../components/blocks';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

const menu = [
  { label: 'Om principerna', href: '#om-principerna' },
  { label: 'Principerna', href: '#principerna' },
  { label: 'Blueprint', href: '#blueprint' },
  { label: 'Lager för lager', href: '#lager' },
  { label: 'Källa', href: '#kalla' },
];

const footerLinks = [
  { label: 'Målarkitekturen', href: 'index.html' },
  {
    label: 'API-katalogen',
    href: 'https://api-katalog.sundsvall.dev/index.html',
    external: true,
  },
  {
    label: 'Webbkatalogen',
    href: 'https://web-katalog.sundsvall.dev/index.html',
    external: true,
  },
  { label: 'utveckling.sundsvall.se', href: 'https://utveckling.sundsvall.se/', external: true },
  {
    label: 'Sundsvalls kommun på GitHub',
    href: 'https://github.com/Sundsvallskommun',
    external: true,
  },
];

const medborgarcentrering = [
  {
    tag: 'DP1',
    title: 'Tillgång',
    original: 'Availability',
    text: 'Invånare och företagare ska nå de tjänster och den information som berör dem, utan att behöva veta vilken förvaltning eller vilket system som äger frågan. Principen bärs upp av öppna API:er och data som synkas i realtid i stället för kopieras mellan stuprör.',
  },
  {
    tag: 'DP2',
    title: 'Aktualitet',
    original: 'Timeliness',
    text: 'Den som väntar på ett besked ska se aktuell status direkt. Lösningarna byggs med händelsestyrda uppdateringar och automatiska aviseringar, så att ingen behöver ringa och fråga hur det går.',
  },
  {
    tag: 'DP3',
    title: 'Vägledning',
    original: 'Actionability',
    text: 'Tjänsten ska visa vad som händer härnäst och vad användaren behöver göra. Processkunskapen byggs in i lösningen genom stegvis vägledning och beslutsstöd, så att det går att göra rätt från början.',
  },
  {
    tag: 'DP4',
    title: 'Transparens',
    original: 'Transparency',
    text: 'Beslutsgången ska gå att följa. Digitala spår, öppen statusuppföljning och åtkomst till handlingar gör att den som berörs kan förstå, kontrollera och ifrågasätta ett beslut – oavsett om det fattats av en handläggare eller automatiskt.',
  },
  {
    tag: 'DP5',
    title: 'Personalisering',
    original: 'Personalisation',
    text: 'Tjänsten ska möta användaren där hen är. Rollanpassade gränssnitt och återanvänd information gör att ingen behöver fylla i samma uppgifter igen, samtidigt som dataskyddet hålls intakt.',
  },
];

const overforbarhet = [
  {
    tag: 'DP1',
    title: 'Överförbarhet i stort',
    original: 'Overall Transferability',
    text: 'Lösningar byggs modulärt, på generaliserade data- och processmodeller och med API:er på hög abstraktionsnivå. Då kan en förmåga skalas till hela koncernen och delas med andra kommuner i stället för att byggas om för varje verksamhet.',
  },
  {
    tag: 'DP2',
    title: 'Interoperabilitet',
    original: 'Interoperability',
    text: 'All funktionalitet ska gå att anropa och alla data ska gå att hantera via standardiserade gränssnitt enligt OpenAPI. Det är standarden – inte den enskilda leverantören – som avgör hur komponenter pratar med varandra.',
  },
  {
    tag: 'DP3',
    title: 'Öppen källkod',
    original: 'Application of Open Source',
    text: 'Det som utvecklas publiceras under öppen licens i publika kodförråd och är öppet för bidrag. Öppenheten ger insyn, sänker tröskeln för nya leverantörer och gör lösningen återanvändbar för hela sektorn.',
  },
];

const styrning = [
  {
    tag: 'DP1',
    title: 'Ägandeskap över data',
    original: 'Principled Data Ownership',
    text: 'Kommunen ska ha full åtkomst till och fullt ägandeskap över sina data. Avtal och teknisk portabilitet ska säkra att data aldrig blir en leverantörs tillgång – de är en gemensam resurs.',
  },
  {
    tag: 'DP2',
    title: 'Transparens',
    original: 'Transparency',
    text: 'Regler, processer och algoritmer ska vara öppna för insyn och möjliga att granska. Det gäller i synnerhet automatiserat beslutsfattande, där insyn är en förutsättning för ansvarsutkrävande.',
  },
  {
    tag: 'DP3',
    title: 'Sund upphandling',
    original: 'Sound Procurement Practices',
    text: 'Kvalificeringskrav ska släppa in nya leverantörer i stället för att stänga ute dem, avtal ska omprövas i stället för att förlängas rutinmässigt och dialogen i upphandlingen ska dokumenteras öppet.',
  },
  {
    tag: 'DP4',
    title: 'Förvaltarskap för öppen källkod',
    original: 'Open-Source Stewardship',
    text: 'Gemensamma projekt behöver en tydlig och leverantörsneutral förvaltning: uttalade roller, kända styrformer och granskning av kod som ingen enskild leverantör kontrollerar.',
  },
  {
    tag: 'DP5',
    title: 'Bryta status quo',
    original: 'Mitigation of Problems from the Status Quo',
    text: 'Riskundvikande och vana är starka krafter som håller kvar det gamla. Principen kräver aktivt förändringsledarskap, gemensamt experimenterande och incitament som gör det lättare att pröva nytt än att låta bli.',
  },
];

function PrincipleGrid({
  items,
}: {
  items: { tag: string; title: string; original: string; text: string }[];
}) {
  return (
    <div className="mt-24 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <TeaserCard key={item.title + item.tag} tag={item.tag} title={item.title}>
          <span className="block text-small text-dark-secondary">
            I avhandlingen: {item.original}
          </span>
          <span className="mt-8 block">{item.text}</span>
        </TeaserCard>
      ))}
    </div>
  );
}

export function DesignPrinciperPage() {
  return (
    <>
      <SiteHeader menu={menu} />
      <main>
        <Hero
          kicker="Sundsvalls kommun"
          title="Designprinciper"
          lead="Målarkitekturen beskriver vad vi bygger. Designprinciperna beskriver hur och varför. De kommer ur forskning om socio-teknisk skuld i kommunal sektor och är samlade i tre familjer: medborgarcentrering, överförbarhet och styrning. Tillsammans med arkitekturens blueprint visar de hur en kommun tar sig från inlåst arv till öppna, återanvändbara komponenter."
          actions={
            <>
              <ButtonLink as="a" href="#blueprint" variant="primary" color="vattjom">
                Visa arkitekturens blueprint
              </ButtonLink>
              <ButtonLink as="a" href="#principerna" variant="secondary" color="vattjom">
                Läs designprinciperna
              </ButtonLink>
            </>
          }
        />

        <PageSection id="om-principerna">
          <h2 className="font-header">Varför designprinciper?</h2>
          <TwoColumns
            aside={
              <FactBox
                title="Snabbfakta"
                items={[
                  <>
                    <strong>13 designprinciper</strong> i tre familjer
                  </>,
                  <>
                    Framtagna genom <strong>designforskning</strong> i skarpa kommunprojekt
                  </>,
                  <>
                    Riktade mot <strong>socio-teknisk skuld</strong> – både teknisk och
                    organisatorisk
                  </>,
                  <>
                    Sammanfattas i en <strong>blueprint</strong> för arkitekturen
                  </>,
                  <>
                    Gäller lika för <strong>egenutvecklat och upphandlat</strong>
                  </>,
                ]}
                links={[
                  {
                    label: 'Läs om målarkitekturen',
                    href: 'index.html#riktlinjer',
                  },
                ]}
              />
            }
          >
            <p>
              Kommuner samlar på sig <strong>socio-teknisk skuld</strong>: en väv av föråldrade
              system, låsta data och avtal – men också av organisatoriska stuprör, arbetssätt och
              vanor. Skulden är alltså inte bara teknisk. Den byggs upp under decennier och gör
              varje ny förändring dyrare och långsammare än den föregående.
            </p>
            <p>
              Designprinciperna nedan är svaret på den skulden. De är framtagna genom
              designforskning i skarpa kommunala projekt – bland annat inkapsling av ett
              upphandlat bygglovssystem, införande av öppen källkod och en öppen plattform för
              generativ AI – och är sedan generaliserade så att de går att använda långt utanför
              de enskilda fallen.
            </p>
            <p>
              Principerna hänger ihop i tre nivåer. För att kunna erbjuda medborgarcentrerade
              tjänster behöver IT-landskapet vara byggt på öppna, transparenta och överförbara
              lösningar med standardiserad integration – helst på öppen källkod. Och för att
              lyckas med det behöver organisationen reformera sin upphandling, förvalta öppen
              källkod ordnat och bryta status quo. Tekniken ensam räcker inte: utan
              styrningsprinciperna blir en ny arkitektur bara ett nytt lager ovanpå samma
              arbetssätt.
            </p>
          </TwoColumns>
        </PageSection>

        <PageSection id="principerna" alt>
          <h2 className="font-header">De tre familjerna</h2>
          <p className="text-lead">
            Principerna anges med sitt svenska namn och sitt ursprungliga namn i avhandlingen, så
            att det går att följa varje princip tillbaka till källan.
          </p>

          <h3 className="font-header mt-40">Medborgarcentrering</h3>
          <p>
            Tjänsterna utgår från invånarnas och företagarnas faktiska behov och hela deras resa –
            inte från ärendets gång i förvaltningen. Principerna riktar sig mot den ärendecentrerade
            logiken, där administrativa krav skymmer användarens upplevelse.
          </p>
          <PrincipleGrid items={medborgarcentrering} />

          <h3 className="font-header mt-40">Överförbarhet</h3>
          <p>
            Modularitet, interoperabilitet och återanvändning gör att en lösning kan flyttas och
            skalas mellan verksamheter och kommuner. Principerna motverkar inlåsning,
            fragmentering och det leverantörsberoende som upphandling annars lätt förstärker.
          </p>
          <PrincipleGrid items={overforbarhet} />

          <h3 className="font-header mt-40">Styrning</h3>
          <p>
            Styrningsprinciperna säkrar öppenhet, transparens, ansvar och ägandeskap. De ska se
            till att kommunen behåller kontrollen över sin digitala infrastruktur, sina data och
            sina algoritmer – i stället för att bli allt mer beroende av leverantörer och av
            beslutslogik som ingen kan granska.
          </p>
          <PrincipleGrid items={styrning} />
        </PageSection>

        <PageSection id="blueprint">
          <h2 className="font-header">Arkitekturens blueprint</h2>
          <p className="text-lead">
            Blueprinten är principernas artefakt: den visar hur de ser ut när de blir arkitektur.
            Bilden läses uppifrån och ned – från invånarens kontaktytor, via API-gateway och
            slutanvändarnära tjänster, ned till två parallella världar. Till vänster det arv som
            kapslas in, till höger de generiska förmågor som arvet ska ersättas av. Pilen längst ned
            är själva transformationen.
          </p>

          <DiagramFigure
            src="assets/diagrams/design-principer.svg"
            alt="Arkitekturritning över blueprinten: överst invånare, företagare och medarbetare som når slutanvändarens kontaktytor, webb och app. Under dem en API-gateway med anropen POST, GET, PATCH och DELETE, och därunder slutanvändarnära tjänster som CaseStatus, MyRepresentative, ContactSettings, Invoices och PartyAssets. Under dessa delar arkitekturen sig i två spår med var sin API-gateway: till vänster ett inkapslingslager med RPA, integration och databasfasad som döljer ett stuprör med användargränssnitt, verksamhetssystem och data där handläggaren arbetar och där skulden finns; till höger generiska, skalbara förmågor som Messaging, SupportManagement, CaseData, Document, Operaton och ESigning samt masterdata i Party och Employee. Längst ned en pil märkt Transformera som går från inkapslat arv till generiska, öppna komponenter. Streckade rutor till höger visar vilka designprinciper som styr varje lager."
          >
            Arkitekturens blueprint med designprinciperna utsatta per lager. Pilar visar anrop;
            texten i varje lager ger exempel ur kommunens egna komponenter.{' '}
            <Link href="assets/diagrams/design-principer.svg" target="_blank" rel="noopener">
              Öppna bilden i full storlek
            </Link>
          </DiagramFigure>

          <p>
            Blueprinten säger inget om vilka produkter som ska användas. Den säger var gränserna
            går: kontaktytorna innehåller ingen verksamhetslogik, all åtkomst sker via
            standardiserade API:er, och arvet får finnas kvar – men bara bakom ett inkapslingslager
            som håller det borta från användaren. Det ger en lösare koppling mellan det invånaren
            möter och de system som råkar ligga bakom, och därmed en väg ut ur inlåsningen som inte
            kräver att allt byts på en gång.
          </p>
        </PageSection>

        <PageSection id="lager" alt>
          <h2 className="font-header">Lager för lager – med våra komponenter</h2>
          <p className="text-lead">
            Blueprinten är generell och gäller vilken kommun som helst. Så här ser lagren ut hos
            oss, med exempel ur webbkatalogen och API-katalogen.
          </p>

          <h3 className="font-header">Slutanvändarens kontaktytor</h3>
          <p>
            Webb och app är de ytor invånare, företagare och medarbetare möter. Hos oss är det de{' '}
            <Link href="https://web-katalog.sundsvall.dev/index.html" external>
              39 webbapplikationerna i webbkatalogen
            </Link>{' '}
            – bland andra <strong>Mina sidor för företag hos kommunen</strong>,{' '}
            <strong>Felanmälan</strong>, <strong>Sundsvallsminnen</strong> och{' '}
            <strong>Luftkvalitet i Sundsvall</strong>. De innehåller ingen egen verksamhetslogik
            utan skapas med API:er, och de publiceras som öppen källkod. Här styr alla fem
            medborgarcentreringsprinciper: det är i kontaktytan tillgång, aktualitet, vägledning,
            transparens och personalisering blir märkbara för den som använder tjänsten.
          </p>

          <h3 className="font-header">API-gateway</h3>
          <p>
            Blueprintens gateway är hos oss den gemensamma <strong>API-plattformen</strong>: samma
            krypterade och autentiserade ingång till samtliga 75 API:er i{' '}
            <Link href="https://api-katalog.sundsvall.dev/index.html" external>
              API-katalogen
            </Link>
            , dokumenterade enligt OpenAPI. Det är principen om interoperabilitet i sin mest
            konkreta form – ett gränssnitt att lära sig, oavsett vilken komponent som svarar.
          </p>

          <h3 className="font-header">Slutanvändarnära tjänster</h3>
          <p>
            Mellan kanalen och förmågorna ligger tjänster som sätter samman flera komponenter till
            det en kanal behöver, utan att lägga verksamhetslogik i kanalen.{' '}
            <strong>CaseStatus</strong> ger en samlad bild av användarens ärenden,{' '}
            <strong>MyRepresentative</strong> avgör vem som får företräda ett företag,{' '}
            <strong>ContactSettings</strong> håller reda på hur någon vill bli kontaktad, och{' '}
            <strong>Invoices</strong> och <strong>PartyAssets</strong> samlar fakturor respektive
            engagemang. De är byggda för att kunna användas av flera kanaler – överförbarhet i
            praktiken.
          </p>

          <h3 className="font-header">Inkapslingslager – där arvet finns kvar</h3>
          <p>
            Blueprintens vänstra spår är det upphandlade arvet, som får ligga kvar bakom RPA,
            integrationer och databasfasader. Hos oss är{' '}
            <strong>ByggrIntegrator</strong>, <strong>OepIntegrator</strong>,{' '}
            <strong>LifecareIntegrator</strong> och <strong>CaseManagement</strong> precis den
            sortens komponenter: de kapslar in system som kommunen inte äger och exponerar dem via
            samma öppna API:er som allt annat. Invånaren möter aldrig arvet direkt. Det är också
            här skulden sitter – handläggaren arbetar fortfarande i systemets eget gränssnitt,
            och stuprören lever kvar bakom fasaden.
          </p>

          <h3 className="font-header">Generiska, skalbara förmågor och data</h3>
          <p>
            Det högra spåret är det arvet ska ersättas av: väl avgränsade förmågor som många
            verksamheter kan använda. <strong>Messaging</strong> sköter all kommunikation och alla
            utskick, <strong>SupportManagement</strong> och <strong>CaseData</strong> hanterar
            ärenden, <strong>Document</strong>, <strong>Archive</strong> och{' '}
            <strong>ESigning</strong> tar hand om handlingar, och <strong>Operaton</strong> driver
            automatiserade processflöden. Gemensamma grunddata ligger i metakatalogen –{' '}
            <strong>Party</strong>, <strong>Citizen</strong>, <strong>LegalEntity</strong> och{' '}
            <strong>Employee</strong> – i stället för i spridda kopior. Här är
            styrningsprinciperna om ägandeskap och transparens direkt avläsbara: det är kommunens
            egna data, egna regler och egna algoritmer. Handläggaren arbetar i samma förmågor som
            invånaren möter, bara när det behövs.
          </p>

          <h3 className="font-header">Transformationen</h3>
          <p>
            Pilen längst ned i bilden är det som avgör om resten blir verklighet. Den drivs av
            styrningsprinciperna om upphandling, förvaltarskap och att bryta status quo. Hos oss
            syns det i API-relaterade krav vid upphandling, i att källkoden publiceras på{' '}
            <Link href="https://github.com/Sundsvallskommun" external>
              GitHub
            </Link>{' '}
            och i att förmågor delas mellan kommuner via{' '}
            <Link href="https://kommuna.se/" external>
              Kommuna
            </Link>
            . Utan den delen förblir en ny arkitektur bara ett nytt lager ovanpå samma arbetssätt.
          </p>
        </PageSection>

        <PageSection id="kalla">
          <h2 className="font-header">Källa och avgränsningar</h2>
          <p className="text-lead">
            Principerna och blueprinten är hämtade ur en doktorsavhandling. Exemplen är våra egna.
          </p>
          <p>
            Designprinciperna och arkitekturblueprinten kommer från Per Perssons doktorsavhandling{' '}
            <em>
              Managing Socio-Technical Debt: Causes and Design-Science Solutions for
              Citizen-Centred Digital Public Services
            </em>{' '}
            (Institutionen för tillämpad informationsteknologi, Göteborgs universitet, 2025).
            Principerna återges här i urval och i sammanfattad form på svenska – de mest
            detaljerade underprinciperna om hantverket i projekt med öppen källkod är utelämnade.
            Den fullständiga specifikationen, med implementerare, kontext, mekanismer och
            motivering för varje princip, finns i avhandlingens bilaga 4.{' '}
            <Link href="https://hdl.handle.net/2077/90120" external>
              Läs avhandlingen i GUPEA
            </Link>
            .
          </p>
          <p>
            Några avgränsningar: blueprinten är en principskiss, inte en systemkarta – rutorna
            visar roller i arkitekturen, och komponentnamnen är exempel som illustrerar rollen, inte
            en fullständig uppräkning. Vilka komponenter som finns i verkligheten framgår av{' '}
            <Link href="index.html">målarkitekturen</Link> och av katalogerna. Kopplingen mellan
            principerna och våra komponenter är gjord här, i denna beskrivning, och är inte en del
            av avhandlingens material.
          </p>
        </PageSection>
      </main>
      <SiteFooter
        title="Designprinciper"
        description="Designprinciperna bakom målarkitekturen – medborgarcentrering, överförbarhet och styrning – samt arkitekturens blueprint lager för lager, med exempel ur kommunens egna komponenter."
        links={footerLinks}
      />
    </>
  );
}
