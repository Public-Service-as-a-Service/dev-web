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
  { label: 'Om målarkitekturen', href: '#om-malarkitekturen' },
  { label: 'Arkitekturen', href: '#arkitekturen' },
  { label: 'Egenutveckling', href: '#egenutveckling' },
  { label: 'Riktlinjer', href: '#riktlinjer' },
  { label: 'Fördjupning', href: '#fordjupning' },
  { label: 'GitHub', href: 'https://github.com/Sundsvallskommun', external: true },
];

const footerLinks = [
  { label: 'utveckling.sundsvall.se', href: 'https://utveckling.sundsvall.se/', external: true },
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
  {
    label: 'Sundsvalls kommun på GitHub',
    href: 'https://github.com/Sundsvallskommun',
    external: true,
  },
  { label: 'kommuna.se', href: 'https://kommuna.se/', external: true },
  { label: 'sundsvall.se', href: 'https://sundsvall.se', external: true },
];

const riktlinjer = [
  {
    tag: 'Öppenhet',
    title: 'Ökat delande',
    text: 'Öppenhet skapar bättre förutsättningar för samverkan, innovation och demokrati. Därför ökar vi delandet av processer, kunskap, data och kod – så mycket som möjligt exponeras som öppen källkod och öppna data.',
  },
  {
    tag: 'Transparens',
    title: 'Insyn skapar tillit',
    text: 'Lösningar, algoritmer och AI ska vara transparenta och öppna för insyn. Arkitektur och dokumentation publiceras öppet, så att den som vill kan granska hur kommunens digitala service är uppbyggd.',
  },
  {
    tag: 'API-först',
    title: 'API:er är byggstenen',
    text: 'Tekniska lösningar utformas med fokus på återanvändning och API först. Funktionalitet och data exponeras via API:er enligt öppna standarder, och varje API har en ägare i verksamheten som förvaltar dess livscykel.',
  },
  {
    tag: 'Komponenter',
    title: 'Väl avgränsat ansvar',
    text: 'Komponenter är väl avgränsade i funktion och data och utformas för att vara skalbara i hela koncernen. Kompletta lösningar skapas genom att komponenter integreras med varandra.',
  },
  {
    tag: 'Ekosystem',
    title: 'Eget och upphandlat på lika villkor',
    text: 'Ekosystemet består av både egenutvecklade och upphandlade komponenter. Arkitekturens krav är desamma oavsett ursprung, och API-relaterade krav vid upphandling säkerställer att nya lösningar passar in.',
  },
  {
    tag: 'Återanvändning',
    title: 'Återanvänd före nybygge',
    text: 'Processdesign utgår från återanvändning av informationsobjekt och funktioner. En förmåga ska etableras en gång och användas av många – inom koncernen och tillsammans med andra kommuner.',
  },
  {
    tag: 'Digitalt först',
    title: 'Digitalt och automatiserat i grunden',
    text: 'Processer utformas för att fungera digitalt först – digitala och automatiserade i grunden, med manuell hantering som undantag snarare än regel.',
  },
  {
    tag: 'Säkerhet',
    title: 'Säkerhet och integritet inbyggt',
    text: 'All åtkomst till API:er är krypterad och alla anrop autentiseras. Grunddata hanteras samlat i stället för i spridda kopior, vilket begränsar exponeringen av personuppgifter.',
  },
  {
    tag: 'Långsiktighet',
    title: 'Ett möjliggörande digitalt arv',
    text: 'Den digitala infrastrukturen byggs på flexibilitet, långsiktighet och öppenhet. Målet är ett digitalt arv som möjliggör fortsatt utveckling – i stället för ett som hindrar den.',
  },
];

const fordjupning = [
  {
    tag: 'Utveckling',
    title: 'utveckling.sundsvall.se',
    href: 'https://utveckling.sundsvall.se/',
    more: 'Läs mer om utvecklingen',
    text: 'Kommunens webbplats om den digitala utvecklingen: målbild och strategi, den digitala infrastrukturens delar samt metoder och riktlinjer – inklusive API-strategin och krav vid upphandling.',
  },
  {
    tag: 'Samverkan',
    title: 'Kommuna',
    href: 'https://kommuna.se/',
    more: 'Läs mer om Kommuna',
    text: 'Plattform för delade AI- och digitala tjänster mellan kommuner, där tjänster som utvecklats i en kommun görs tillgängliga för andra.',
  },
  {
    tag: 'Katalog',
    title: 'API-katalogen',
    href: 'https://api-katalog.sundsvall.dev/index.html',
    more: 'Utforska katalogen',
    text: 'De API:er som körs i produktion på kommunens API-plattform, med beskrivningar, arkitekturritningar och interaktiv dokumentation.',
  },
  {
    tag: 'Katalog',
    title: 'Webbkatalogen',
    href: 'https://web-katalog.sundsvall.dev/index.html',
    more: 'Utforska katalogen',
    text: 'De webbapplikationer kommunen publicerar som öppen källkod – vad varje tjänst gör, vem den är till för och hur den är uppbyggd.',
  },
  {
    tag: 'Källkod',
    title: 'Sundsvalls kommun på GitHub',
    href: 'https://github.com/Sundsvallskommun',
    more: 'Besök GitHub',
    text: 'Källkoden till de komponenter som delas öppet – fri att använda, granska och vidareutveckla.',
  },
];

export function StartPage() {
  return (
    <>
      <SiteHeader menu={menu} />
      <main>
        <Hero
          kicker="Sundsvalls kommun"
          title="Vår målarkitektur"
          lead="Målarkitekturen beskriver en riktning, ett långsiktigt mål och väsentliga vägval för kommunkoncernens digitala miljö: ett ekosystem av väl avgränsade komponenter – egenutvecklade såväl som upphandlade – som exponerar funktionalitet och data via API:er. Här beskrivs arkitekturen på hög nivå samt de riktlinjer som styr utvecklingen."
          actions={
            <>
              <ButtonLink as="a" href="#arkitekturen" variant="primary" color="vattjom">
                Utforska arkitekturen
              </ButtonLink>
              <ButtonLink as="a" href="#riktlinjer" variant="secondary" color="vattjom">
                Läs våra riktlinjer
              </ButtonLink>
            </>
          }
        />

        <PageSection id="om-malarkitekturen">
          <h2 className="font-header">Vad är målarkitekturen?</h2>
          <TwoColumns
            aside={
              <FactBox
                title="Snabbfakta"
                items={[
                  <>
                    Beskriver <strong>riktning, långsiktigt mål och väsentliga vägval</strong>
                  </>,
                  <>
                    <strong>Styrande</strong> vid utveckling, vidareutveckling och upphandling
                  </>,
                  <>
                    Ekosystem av <strong>egenutvecklade och upphandlade</strong> komponenter
                  </>,
                  <>
                    Funktionalitet och data exponeras via <strong>API:er</strong>
                  </>,
                  <>
                    Utformad för <strong>delning och samverkan</strong> mellan kommuner
                  </>,
                ]}
                links={[
                  {
                    label: 'Målbild och strategi',
                    href: 'https://utveckling.sundsvall.se/malbild-och-strategi',
                  },
                ]}
              />
            }
          >
            <p>
              Syftet med målarkitekturen är att beskriva en riktning, ett långsiktigt mål och
              väsentliga vägval för att nå verksamhetens mål. Den är styrande: lösningar ska i
              möjligaste mån utformas i enlighet med målarkitekturen, oavsett om de utvecklas i
              egen regi, upphandlas eller återanvänds från andra.
            </p>
            <p>
              Målarkitekturen är komponentbaserad. Komponenter är väl avgränsade i fråga om
              funktion och data, utformas för att vara skalbara och återanvändbara i hela
              kommunkoncernen, och exponerar sin funktionalitet och sina data via API:er enligt
              öppna standarder. Kompletta lösningar skapas genom att komponenter integreras med
              varandra – inte genom monolitiska helhetssystem.
            </p>
            <p>
              Ekosystemet består av både egenutvecklade och upphandlade komponenter. Vad som byggs
              själv och vad som upphandlas är ett verksamhets- och lämplighetsval; arkitekturens
              krav är desamma i båda fallen. Vid upphandling ställs därför API-relaterade krav som
              säkerställer att upphandlade lösningar passar in i den komponentbaserade
              arkitekturen och kan samverka med övriga delar av ekosystemet.
            </p>
          </TwoColumns>
        </PageSection>

        <PageSection id="arkitekturen" alt>
          <h2 className="font-header">Arkitekturen på hög nivå</h2>
          <p className="text-lead">
            Målarkitekturen kan beskrivas i skikt: digitala kanaler möter användarna, en gemensam
            API-infrastruktur förmedlar alla anrop, och bakom den ligger ekosystemet av
            komponenter – gemensamma förmågor, masterdata och specialiserade verksamhetssystem –
            med omvärldens tjänster anslutna via integrationer.
          </p>

          <DiagramFigure
            src="assets/diagrams/malarkitektur.svg"
            alt="Arkitekturritning: användare når digitala kanaler, som via den gemensamma API-infrastrukturen anropar ett ekosystem av komponenter – gemensamma förmågor, masterdata, specialiserade verksamhetssystem och paketerade lösningar – med nationella tjänster, externa leverantörstjänster och delade lösningar i omvärlden."
          >
            Målarkitekturen på hög nivå. Pilar visar anrop; funktionalitet och data exponeras
            genomgående via API:er.
          </DiagramFigure>

          <h3 className="font-header">Digitala kanaler</h3>
          <p>
            De digitala kanalerna samlar gränssnitten i kontakten med invånare, företagare och
            medarbetare: webbtjänster och appar, mina sidor och AI-assistenter. I mina sidor ingår
            även det som traditionellt lösts med e-tjänster – att registrera och följa ärenden.
            Kanalerna skapas med API:er och innehåller ingen egen verksamhetslogik. Det gör att
            interna system och processer kan förändras löpande utan att kanalerna påverkas – och
            att samma förmåga kan erbjudas i flera kanaler.
          </p>

          <h3 className="font-header">API-infrastruktur</h3>
          <p>
            API-infrastrukturen är ekosystemets sammanhållande funktion: en gemensam, säker ingång
            till komponenternas funktionalitet och data. All åtkomst är krypterad och alla anrop
            autentiseras. Genom att lösningar bryts ned i väldefinierade komponenter som
            integrerar med varandra via API-infrastrukturen kan delar utvecklas, upphandlas och
            bytas ut var för sig.
          </p>

          <h3 className="font-header">Gemensamma komponenter</h3>
          <p>
            Koncerngemensamma komponenter tillhandahåller generiska förmågor som många
            verksamheter behöver – till exempel kommunikation och utskick, ärende- och
            processtöd, dokumenthantering samt analys och AI. Varje komponent har ett tydligt
            avgränsat ansvarsområde och utformas för att kunna användas av samtliga förvaltningar
            och bolag. Generellt processtöd gör det möjligt att utforma verksamhetsprocesser som
            är digitala och automatiserade i grunden.
          </p>

          <h3 className="font-header">Masterdata</h3>
          <p>
            Gemensamma grunddata – om personer, företag, medarbetare och organisation – hanteras
            samlat och tillhandahålls via en metakatalog som övriga system och processer använder
            i stället för egna kopior. Det säkrar återanvändning av data, är en förutsättning för
            automatisering och minskar spridningen av personuppgifter i ekosystemet.
          </p>

          <h3 className="font-header">Verksamhetssystem och upphandlade lösningar</h3>
          <p>
            Specialiserade verksamhetssystem är en del av ekosystemet. Vissa har en mogen
            arkitektur där funktionalitet och data kan nås direkt via API:er; andra behöver
            kompletterande stöd för att komma till sin rätt. Vid upphandling ställs krav på
            arkitektur och API:er så att nya lösningar kan integreras med övriga komponenter och
            inte skapar inlåsning. Analysförmågan i ett gemensamt datalager gör det dessutom
            möjligt att förstå och följa upp verksamheten oberoende av enskilda system.
          </p>

          <h3 className="font-header">Omvärlden</h3>
          <p>
            Ekosystemet samspelar med omvärlden: nationella bastjänster och öppna data, externa
            leverantörstjänster samt lösningar som delas mellan kommuner. Samverkan är
            dubbelriktad – kommunen nyttjar andras tjänster och delar sina egna, bland annat genom
            samverkansplattformen{' '}
            <Link href="https://kommuna.se/" external>
              Kommuna
            </Link>
            , där tjänster som utvecklats i en kommun görs tillgängliga för fler.
          </p>
        </PageSection>

        <PageSection id="egenutveckling">
          <h2 className="font-header">Fokusområden för egenutveckling</h2>
          <p className="text-lead">
            Egenutvecklingen sprids inte över hela ekosystemet utan koncentreras till fyra
            fokusområden: <em>Förenkla för medborgare och företagare</em>, <em>Effektivare och
            smartare verksamhet</em>, <em>Morgondagens välfärd</em> och <em>Smart samhälle</em>.
            Områdena utvecklas med inbyggt AI-stöd och med maximerad automatiseringsgrad, och
            möjliggör lösningar som både kan skalas brett inom kommunkoncernen och kan delas med
            andra kommuner.
          </p>
          <p className="text-lead">
            Ritningen och beskrivningen nedan visar ett av dessa fokusområden:{' '}
            <strong>Förenkla för medborgare och företagare</strong>.
          </p>

          <DiagramFigure
            src="assets/diagrams/egenutveckling.svg"
            alt="Arkitekturritning över fokusområdet Förenkla för medborgare och företagare: invånare och företagare når Mina sidor, som är kopplad till ärendeområdena avvikelsehantering, support och myndighetsärenden, vilka handläggs av medarbetare. Ärendeområdena använder de gemensamma stödförmågorna dokumenthantering, diarium, e-arkiv, e-signering, kommunikation och masterdata. Mina sidor och ärendeområdena har inbyggt AI-stöd."
          >
            Fokusområdet Förenkla för medborgare och företagare. Pilar visar anrop; AI-märket
            anger förmågor med inbyggt AI-stöd.
          </DiagramFigure>

          <h3 className="font-header">Fokusområdets delar</h3>
          <p>
            <strong>Mina sidor</strong> är den personaliserade kanalen där invånare och företagare
            registrerar, uppdaterar och följer sina ärenden, avvikelser och fakturor.{' '}
            <strong>Avvikelsehantering</strong> omfattar bland annat felanmälan och orosanmälan,{' '}
            <strong>support</strong> stödjer kontaktcenter och andra verksamheter, och{' '}
            <strong>myndighetsärenden</strong> omfattar ärendeslag som bygglov, färdtjänst, miljö
            samt alkohol och tobak. Under dessa ligger gemensamma stödförmågor –
            dokumenthantering, diarium, e-arkiv, e-signering, kommunikation och masterdata – som
            används av alla ärendeområden. Medarbetare handlägger i samma förmågor som användarna
            möter via mina sidor: en förmåga per område, inte parallella lösningar.
          </p>

          <h3 className="font-header">Värdet av att äga utvecklingen</h3>
          <p>
            Att äga utvecklingen inom dessa områden ger kontroll över helheten. Förmågorna delar
            grunddata, ärendeinformation och stödförmågor, vilket gör det enkelt att få allt att
            hålla ihop: ett ärende som registreras i mina sidor är samma ärende som medarbetaren
            handlägger, dokumenteras i diariet och bevaras i e-arkivet – utan dubbellagring eller
            manuell överflyttning mellan system.
          </p>
          <p>
            Ägandet gör också att tvärgående förmågor kan införas konsekvent: AI-stöd och ökad
            automatisering rullas ut i alla ärendeområden samtidigt, i stället för att vänta in
            enskilda leverantörers utvecklingsplaner. Utvecklingstakt och prioriteringar styrs av
            verksamhetens behov, lösningarna förblir fria från inlåsning, och genom att områdena
            delas via Kommuna fördelas utvecklingskostnaden över flera kommuner samtidigt som
            lösningarna prövas i fler verksamheter.
          </p>
        </PageSection>

        <PageSection id="riktlinjer" alt>
          <h2 className="font-header">Riktlinjer och principer</h2>
          <p className="text-lead">
            Utvecklingen mot målarkitekturen styrs av ett antal riktlinjer. De gäller oavsett om
            en lösning utvecklas i egen regi, upphandlas eller återanvänds från någon annan.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
            {riktlinjer.map((item) => (
              <TeaserCard key={item.title} tag={item.tag} title={item.title}>
                {item.text}
              </TeaserCard>
            ))}
          </div>
        </PageSection>

        <PageSection id="fordjupning">
          <h2 className="font-header">Fördjupning och källor</h2>
          <p className="text-lead">
            Målarkitekturen dokumenteras löpande, och delar av den realiserade arkitekturen finns
            beskriven i öppna kataloger. Här kan du fördjupa dig.
          </p>
          <div className="mt-32 grid gap-24 md:grid-cols-2 xl:grid-cols-3">
            {fordjupning.map((item) => (
              <TeaserCard
                key={item.title}
                tag={item.tag}
                title={item.title}
                href={item.href}
                more={item.more}
              >
                {item.text}
              </TeaserCard>
            ))}
          </div>
        </PageSection>
      </main>
      <SiteFooter
        title="Målarkitekturen"
        description="En översiktlig beskrivning av Sundsvalls kommuns målarkitektur och de riktlinjer som styr kommunens digitala utveckling."
        links={footerLinks}
      />
    </>
  );
}
