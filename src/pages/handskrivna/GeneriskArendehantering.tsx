import { AppArticle } from '../../components/AppArticle';
import {
  drakenArkitekturIntro,
  drakenDiagramCaption,
  drakenFactLinks,
  drakenKallkod,
  drakenKonfiguration,
  drakenTeknik,
} from './draken';

const verksamheter: [string, string][] = [
  ['Kontakt Sundsvall', 'kommunens kontaktcenter för invånarnas frågor och ärenden.'],
  ['Kontakt Ånge', 'motsvarande kontaktcenter för Ånge kommun, som delar lösningen.'],
  ['Intern kundtjänst', 'stöd och service till kommunens medarbetare.'],
  ['Lön och pension', 'ärenden som rör medarbetarnas lön och pension.'],
  ['Rekrytering och bemanning', 'processer kring rekrytering och bemanning.'],
  ['Servicecenter Ekonomi', 'ekonomirelaterade ärenden och förfrågningar.'],
  ['MittSverige Vatten & Avfall', 'kundärenden inom vatten och avfall.'],
  ['Barn och utbildning', 'ärenden inom förskola och skola.'],
  ['Lokalplanering', 'ärenden som rör kommunens lokalförsörjning.'],
];

export function GeneriskArendehantering() {
  return (
    <AppArticle
      titel="Generisk ärendehantering"
      kategori="Ärendehantering"
      ingress="En fullt konfigurerbar webbapplikation för att ta emot, handlägga och avsluta ärenden och förfrågningar – en gemensam lösning som anpassas till varje verksamhets behov."
      beskrivning={[
        'Generisk ärendehantering är ett verktyg för kommunens handläggare. I stället för att varje verksamhet skaffar och underhåller sitt eget ärendesystem erbjuder applikationen en gemensam grund som konfigureras per verksamhet – med egna ärendekategorier, roller, statusflöden och kommunikationsmallar.',
        'Handläggaren kan registrera ärenden som kommer in via olika kanaler, se all information om den som ärendet gäller, kommunicera med invånare och medarbetare direkt från ärendet, samt följa ärendet från registrering till avslut. Färdiga mallar gör att brev och beslut får ett enhetligt utförande.',
        'Eftersom lösningen är generisk kan nya verksamheter anslutas utan att ny programvara behöver utvecklas – det är i första hand en fråga om konfiguration. Det ger kort startsträcka, lägre förvaltningskostnad och en enhetlig arbetsmiljö för handläggare i hela organisationen.',
      ]}
      funktionerTitel="Verksamheter som använder applikationen"
      funktioner={verksamheter.map(([namn, text]) => (
        <>
          <strong>{namn}</strong> – {text}
        </>
      ))}
      efterord="Att såväl förvaltningar som kommunala bolag och en annan kommun använder samma lösning visar styrkan i det generiska angreppssättet: samma öppna kodbas, konfigurerad för olika behov."
      factItems={[
        <>
          Målgrupp: <strong>handläggare</strong>
        </>,
        <>
          <strong>9 verksamheter</strong> använder tjänsten i dag
        </>,
        <>
          Konfigureras <strong>per verksamhet</strong>
        </>,
        <>
          Delas som <strong>öppen källkod</strong>
        </>,
      ]}
      factLinks={drakenFactLinks}
      diagramSlug="generisk-arendehantering"
      diagramAlt="Lösningsarkitektur för generisk ärendehantering: webbappen anropar verksamhets- och master-data-API:er via kommunens API-plattform WSO2, med inloggning via SAML."
      diagramCaption={drakenDiagramCaption}
      arkitektur={[
        drakenArkitekturIntro,
        'Samma kodbas används för samtliga verksamhetsinstanser. Vilken instans som byggs, och hur den beter sig, styrs av konfiguration och funktionsflaggor – inte av separata kodgrenar.',
      ]}
      teknik={drakenTeknik}
      apiRows={[
        { name: 'SupportManagement', version: '14.9', usage: 'Kärnan i ärendehanteringen – ärenden, kategorier, status, kommunikation och handläggning' },
        { name: 'CaseData', version: '13.0', usage: 'Eskalering av ärenden till myndighetsärende' },
        { name: 'CaseStatus', version: '4.3', usage: 'Statusinformation om ärenden' },
        { name: 'Relations', version: '1.1', usage: 'Relationer mellan ärenden' },
        { name: 'Templating', version: '2.1', usage: 'Mallar för brev, beslut och andra dokument' },
        { name: 'BillingPreprocessor', version: '4.5', usage: 'Faktureringsunderlag (används av vissa verksamheter, t.ex. Lön och pension)' },
        { name: 'Estateinfo', version: '2.2', usage: 'Fastighetsinformation i fastighetsanknutna ärenden' },
        { name: 'Citizen', version: '3.0', usage: 'Uppgifter om invånare' },
        { name: 'Employee', version: '2.0', usage: 'Uppgifter om medarbetare' },
        { name: 'LegalEntity', version: '2.0', usage: 'Uppgifter om organisationer och företag' },
        { name: 'Party', version: '2.1', usage: 'Id-översättning av parter i ärenden' },
        { name: 'ActiveDirectory', version: '2.0', usage: 'Uppslag av användare och behörigheter' },
      ]}
      konfiguration={drakenKonfiguration('per verksamhet')}
      kallkod={drakenKallkod}
    />
  );
}
