# AI-instruktion: dokumentera en tjänst i Webbkatalogen

Den här filen beskriver hur en AI-assistent (eller människa) lägger till och
underhåller dokumentation av en webbapplikation i katalogen. Följ arbetssättet
nedan – det är så de befintliga sidorna är framtagna.

## Vad katalogen är

En statisk webbplats – en React-applikation som byggs med Vite – som beskriver
de webbapplikationer Sundsvalls kommun publicerar som öppen källkod på
[github.com/Sundsvallskommun](https://github.com/Sundsvallskommun) – repon som
börjar med `web-app`. Publiceras till GitHub Pages via
`.github/workflows/deploy-pages.yml` vid push till `main` (arbetsflödet kör
`npm ci && npm run build` och publicerar `dist/`).

## Designsystem – obligatoriskt

Webbplatsen följer [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/)
(dokumentation för AI-verktyg: <https://ui.sundsvall.dev/llms-full.txt>).

- **Importera komponenter från `@sk-web-gui/react`**: `Button`, `Card`, `Link`,
  `Label`, `Table`, `Breadcrumb`, `Header`, `Footer`, `Logo`, `GuiProvider`
  med flera. Bygg inte egna varianter av komponenter som designsystemet redan
  har.
- **Alla designtokens kommer från `@sk-web-gui/core`**, inkopplat som
  Tailwind-preset i `tailwind.config.js`. Använd tokenklasser som
  `bg-vattjom-background-200`, `text-dark-secondary`, `border-divider`,
  `font-header`, `text-lead`, `max-w-content`, `rounded-cards` samt
  avståndsskalan (`p-24`, `gap-16`, `py-40` …).
- **Hårdkoda aldrig hex-värden eller CSS-variabler.** Inga `#`-färger, inga
  `var(--…)` och ingen egen CSS utöver Tailwind-direktiven i `src/index.css` –
  allt utseende ska komma från paketen via komponenter och tokenklasser.
- `vattjom` (blå) är webbplatsens primärtema. Typsnitt: Raleway för rubriker
  via `font-header` (läses in från paketet `@fontsource/raleway`), Arial för
  brödtext (temats standard).
- **Knapptexter ska vara verb i imperativ** ("Utforska applikationerna",
  "Ladda ner SPDX (JSON)") och **länktexter beskriva målet** ("Läs mer om
  Mina sidor" – aldrig bara "Läs mer").

## Grundprinciper

0. **Endast applikationer i drift.** Katalogen listar de webbapplikationer som
   körs i drift. Prototyper och avvecklade applikationer ska inte finnas i
   katalogen – när en applikation avvecklas tas dess post bort ur
   `scripts/apps-data.json` tillsammans med de genererade filerna (tjänstesidan
   och arkitekturritningen), varefter generatorskripten körs om.

1. **Verksamhetsnamn, inte projektnamn.** Interna projekt-/kodnamn (t.ex.
   "Draken") används aldrig i katalogen. Applikationer presenteras under sina
   verksamhetsvända namn ("Ärendehantering och myndighetsutövning",
   "Mina sidor").
2. **En sida per källkodsförråd.** Varje `web-app`-repo får EN post i
   `scripts/apps-data.json` och därmed EN sida, även när repot bygger flera
   webbappar. **Bygger repot flera webbar är fältet `webbar` obligatoriskt**:
   det ska räkna upp varje webb och de processer den implementerar (se
   "Webbappar och processer per webb" nedan), så att sidan synliggör vad de
   olika webbarna gör. Exempel: `web-app-draken-public` bygger den generiska
   ärendehanteringen och de två myndighetsutövningswebbarna (mark och
   exploatering respektive parkeringstillstånd) och dokumenteras på sidan
   "Ärendehantering och myndighetsutövning".
3. **Koden är sanningskällan, inte README.** README-filer kan vara inaktuella.
   Härled alltid teknisk fakta (API:er, versioner, funktioner) ur
   källkodsrepots konfiguration och kod. Verifierade avvikelser från README har
   företräde.
4. **Två delar på samma sida.** Varje tjänstesida har först en verksamhetsnära
   beskrivning (utan tekniska utvecklingsdetaljer), därefter en sektion
   "Teknisk dokumentation" – på samma sida, inte en undersida.
5. **Allt innehåll på svenska.**

## Så härleder du teknisk fakta ur ett `web-app`-repo

Klona repot (grunt räcker: `git clone --depth 1 …`) och undersök:

| Fakta | Källa i repot |
| --- | --- |
| API-prenumerationer och versioner | `backend/src/config/api-config.ts` – listan `APIS` anger exakt vilka API:er applikationen är byggd mot och i vilka versioner. Använd dessa versioner i tabeller och diagram. |
| Vilka instanser/verksamheter som finns | `frontend/.env.<instans>-example` och `backend/.env.<instans>.example.local` – en fil per instans. `NEXT_PUBLIC_APPLICATION_NAME` ger verksamhetsnamnet, `APPLICATION` ger koden (KC, MEX, PT, LOP …). |
| Applikationstyp per instans | Frontend-flaggorna `NEXT_PUBLIC_IS_SUPPORTMANAGEMENT` respektive `NEXT_PUBLIC_IS_CASEDATA` avgör om instansen är en supportärende-applikation eller en myndighetsutövningsapplikation. |
| Funktioner per instans | `NEXT_PUBLIC_USE_*`-flaggorna i frontend-miljöfilerna, mappade mot `frontend/src/config/appconfig.tsx` (t.ex. `NEXT_PUBLIC_USE_BILLING` ⇒ fakturering, `NEXT_PUBLIC_USE_CONTRACTS` ⇒ avtal). En funktion som inte är påslagen för instansen ska inte påstås i dess dokumentation. |
| Vilken kod som använder vilket API | Sök `apiServiceName('<api>')` i `backend/src/controllers/` och `backend/src/services/`. Controller-/servicefilens namn visar sammanhanget (t.ex. `asset.controller.ts` ⇒ PartyAssets för tillståndsregister). |
| Instansspecifik logik | `backend/src/services/application.service.ts` (`isMEX()`, `isPT()`, `isKC()` …) och sökning på dessa i koden. Exempel på fynd: PT skickar aldrig beslut via e-post (`message.controller.ts`). |
| Obligatorisk konfiguration | `backend/src/utils/validateEnv.ts` – gemensamma krav (API_BASE_URL, CLIENT_KEY/CLIENT_SECRET, SAML_*) samt per applikationstyp (CASEDATA_* respektive SUPPORTMANAGEMENT_*). |
| Arkitekturens grunddrag | Repostrukturen: `frontend/` (React/Next.js) + `backend/` (Node.js, BFF). `API_BASE_URL` i backend-miljöfilerna pekar på kommunens API-plattform (WSO2); SAML-variablerna visar SSO-inloggning. Frontend anropar aldrig verksamhets-API:er direkt. |
| Teknikstack | `package.json` i rot, `frontend/` och `backend/` (ramverk, testverktyg), README endast som komplement. |

Attribuera API:er till rätt sida: supportapplikationerna använder
SupportManagement som kärna (kommunikation sker via SupportManagement, inte
Messaging); CaseData-applikationerna använder CaseData som kärna plus sina
specifika API:er (MEX: Contract, Estateinfo, Billing*, Company; PT:
PartyAssets, JsonSchema, Messaging). Gemensamma master-data-API:er för alla:
Citizen, Employee, LegalEntity, Party, ActiveDirectory.

## Webbappar och processer per webb

För repon som bygger flera webbappar (t.ex. `web-app-draken-public`, där
instans styrs av konfiguration och funktionsflaggor i stället för separata
kodgrenar) fylls fältet `webbar` i posten:

```json
"webbar": [
  { "namn": "Generisk ärendehantering",
    "beskrivning": "den konfigurerbara grunden, i drift hos nio verksamheter",
    "processer": ["Kontaktcenterärenden för invånare – Kontakt Sundsvall och Kontakt Ånge", "…"] }
]
```

- **`namn`** är webbens verksamhetsvända namn, **`processer`** räknar upp de
  verksamhetsprocesser webben implementerar – härledda ur källkoden
  (instansernas miljöfiler, funktionsflaggor, byggkonfiguration och
  API-användning), inte ur README.
- Sidan renderar detta som sektionen "Webbappar och deras processer", och
  Snabbfakta visar antalet webbar. **Håll listan aktuell**: när en ny
  verksamhet eller webb tillkommer i repot, eller en process flyttar mellan
  webbar, uppdateras `webbar` i samma veva som övriga fält och sidorna
  genereras om.
- API-tabellens användningskolumn ska ange vilken webb eller process som
  använder API:et när det inte används av alla (t.ex. "Avtal i mark- och
  exploateringsärenden").

## Så skapas tjänstesidor

**Datadrivet (enda sättet).** Lägg till ett objekt i `scripts/apps-data.json`
med de fält som redan finns där (repo, namn, slug, kategori, status,
ingress, beskrivning, målgrupp, funktioner, webbar, apis, integrationer,
auth, teknik, konfiguration, anteckningar) och kör
`python3 scripts/generate-pages.py` följt av
`python3 scripts/generate-diagrams.py`. Generatorn skriver **sidskal**
under `tjanster/` – head-metadata plus sidans data inbäddad som JSON i
`<script id="page-data">` – och innehållet renderas av
`src/pages/AppPage.tsx` respektive `src/pages/SbomPage.tsx` med
designsystemet. Startsidans kort behöver inte genereras:
`src/pages/IndexPage.tsx` importerar `apps-data.json` direkt. Fyll fälten
enligt tabellen ovan – uppgifterna ska vara härledda ur källkodsrepot.
Ändras sidornas struktur eller utseende görs det i React-komponenterna;
ändras datat körs generatorn om. Det finns inga handskrivna sidor.

## Tjänstesidans struktur

Sidan heter `tjanster/<slug>.html` (slug utan å/ä/ö, med bindestreck,
härledd ur tjänstens namn – inte ur repots kodnamn). Strukturen definieras
av `src/components/AppArticle.tsx`:

1. **Sidhuvud** – `SiteHeader` (designsystemets `Header` med kommunlogotypen).
2. **`PageHero`** – brödsmulor (Start / Webbapplikationer / sidnamn,
   designsystemets `Breadcrumb`), `Label` med kategori ("Ärendehantering"
   eller "Myndighetsutövning"), `h1` med tjänstens namn och en menings
   sammanfattning.
3. **"Om applikationen"** – 2–4 stycken verksamhetsnära text: vilket behov
   tjänsten löser, vem som använder den, vilken nytta den ger. Inga tekniska
   utvecklingsdetaljer här. Därefter punktlistan "Det här stödjer
   applikationen" (funktionsöversikt) och, för repon med flera webbar,
   sektionen "Webbappar och deras processer" (renderad ur fältet `webbar`).
   I sidokolumnen en `FactBox` ("Snabbfakta") med målgrupp, typ, antal
   webbar när det är fler än en, samt länk till källkoden – länktext utan
   projektnamn, t.ex. "Källkod på GitHub".
4. **"Teknisk dokumentation"** (id `teknisk-dokumentation`) med
   underrubrikerna, i denna ordning:
   - **Arkitektur** – först en `DiagramFigure` med arkitekturritningen (se
     nedan) och bildtext "Lösningsarkitektur, härledd ur källkodens
     konfiguration …", därefter prosa om frontend/backend, API-plattform
     (WSO2) och SAML-inloggning, samt hur instansen förhåller sig till delad
     kodbas.
   - **Teknikstack** – punktlista: körmiljö, frontend-ramverk,
     pakethantering, testverktyg.
   - **API-beroenden** – tabell (API, Version, Användning, designsystemets
     `Table`). Versionerna ska ordagrant komma från `api-config.ts`. Sortera med
     kärn-API:et först, sedan verksamhets-API:er, sist master-data.
     Notera avvikelser i användningskolumnen (t.ex. "e-post används inte").
   - **Konfiguration och driftsättning** – punktlista utifrån
     `validateEnv.ts` och miljöfilerna: miljövariabelfiler per instans,
     WSO2-uppgifter (`CLIENT_KEY`/`CLIENT_SECRET`), SAML-variabler,
     funktionsflaggor, utvecklings-/produktionsläge.
   - **Källkod** – länk till repot på GitHub (länktext utan projektnamn).
5. **Sidfot** – `SiteFooter` (designsystemets `Footer`).

## Programvaruförteckningen (SBOM)

`tjanster/<slug>-sbom.html` genereras av samma skript ur
`assets/sbom/<slug>.spdx.json` – komponentlistan bäddas in i sidskalet som
JSON – och renderas av `src/pages/SbomPage.tsx`: applikationens
tredjepartskomponenter med version och licens, en licenssammanfattning och
ett filterfält.

**Skriv aldrig SBOM-filerna för hand och regenerera dem inte som en del av det
vanliga arbetsflödet.** Till skillnad från sidorna och ritningarna, som är rena
funktioner av `apps-data.json`, är en SBOM en funktion av 36 externa repon som
Dependabot uppdaterar löpande. De underhålls av
`.github/workflows/refresh-sbom.yml`, som varje vecka checkar ut varje
källkodsrepo, installerar beroendena, kör Trivy och commitar det som ändrats.
Workflowet publicerar också till GitHub Pages i ett eget steg: en push gjord med
`GITHUB_TOKEN` startar inga nya workflows, så `deploy-pages.yml` plockar *inte*
upp den commiten.

Fyra saker är avgörande om workflowet någon gång skrivs om:

- **Beroendena måste installeras, per delprojekt.** En npm-lockfil bär ingen
  licensinformation alls – Trivy läser licensen ur
  `node_modules/<paket>/package.json`. Utan installation blir komponentlistan
  komplett men 100 % av licenserna `NOASSERTION`; med installation cirka 90 %.
  Installationen måste ske i varje delprojekt: 24 av de 29 katalogförda repon som
  finns lokalt saknar `package.json` i roten och är upplagda som `frontend/` +
  `backend/` (+ `admin/`), i snitt 2,1 lockfiler per repo.
- **`--include-dev-deps` vid scanning.** Trivy utesluter `devDependencies` ur
  npm/yarn-lockfiler som standard, vilket hade lämnat hela byggkedjan utanför
  rapporten. Byggkedjan är en verklig attackyta och därmed precis vad ett
  leveranskedjedokument ska täcka. Flaggan *höjer* dessutom licenstäckningen
  (uppmätt 91 % → 96 %): byggverktygen har välmärkt paketmetadata, medan det som
  ändå saknar licens mest är plattformsbinärer som aldrig installerats.
- **`--ignore-scripts` vid installation.** Annars kör CI postinstall-skript från
  36 repons hela transitiva beroendeträd. Licenserna ligger i paketmetadatan, så
  inget skript behöver köras för att samla in dem, och att köra dem vore att
  införa precis den exponering katalogen finns till för att dokumentera.
- **Scanningen måste ske inifrån utcheckningen med `trivy fs … .`** Trivy
  härleder varje pakets `SPDXID` ur ett PkgID som innehåller scan-sökvägen, så
  `trivy fs src` byter identitet på samtliga paket vid varje körning.
- **Trivy-versionen är pinnad**, av samma skäl. En uppgradering ska vara en egen,
  granskad ändring.

En misslyckad installation fäller avsiktligt den matrisgrenen i stället för att
ge en degraderad SBOM: en delvis installation gör tyst om licenser till
`NOASSERTION`, vilket hade commitat en diff som inte motsvarar någon verklig
beroendeändring. Grenen behåller då sin förra SBOM.

`scripts/sbom-extra.json` finns kvar för repon som skulle behöva en
programvaruförteckning utan egen tjänstesida; listan är för närvarande tom –
alla repon med SBOM har en egen sida i katalogen.

**Licensutfallet är plattformsberoende — jaga inte den diffen.** Bara de
plattformsbinärer som faktiskt installeras får licens, och installeraren väljer
efter värdplattformen. En körning på macOS ger licens åt `@img/sharp-darwin-arm64`
men inte åt `@img/sharp-linux-x64`; på CI:s ubuntu-runner är det tvärtom. Uppmätt
skillnad mellan macOS och Linux för pratomaten: 19 paket. Inom CI är utfallet
deterministiskt eftersom runnern alltid är ubuntu — men en lokal regenerering på
en Mac kommer aldrig att matcha det incheckade byte för byte. CI är sanningskällan;
committa inte en lokalt regenererad SBOM.

`scripts/normalize-sbom.py` låser de fält som annars varierar mellan körningar
(namnrymd och tidsstämpel) till den scannade committen, tar bort Trivys
verktygsinterna annoteringar och skriver in härkomsten i dokumentet.
Kvarvarande licensluckor rapporteras som **en** grupperad varning per app –
merparten är plattformsbinärer (`@esbuild/*`, `@rollup/*`, `@next/swc-*` …),
alltså `optionalDependencies` för andra plattformar än runnerns som aldrig
installeras och därför saknar `package.json`. Varje modern frontend har några
dussin; en varning per paket hade blivit ~1500 per körning, och en
varningsström ingen läser är samma sak som ingen varning.

**60-dagarsregeln.** GitHub stänger av schemalagda workflows i publika repon efter
60 dagar utan aktivitet i repot. Workflowet commitar bara när ett beroende faktiskt
ändrats, så ett par genuint tysta månader hade gett noll aktivitet och schemat hade
tystnat utan att någon märkte det. `keepalive`-jobbet återaktiverar därför workflowet
via API:et vid varje körning, oavsett om något ändrats.

GitHub dokumenterar varken vad som räknas som "repository activity" eller att
återaktivering nollställer räknaren — det är den bästa tillgängliga åtgärden, inte en
garanti. Jobbet loggar därför workflowets `state` före och efter, så att utfallet går
att se. Att commita sig levande vore alternativet, men keepalive-verktygen har gått
ifrån dummy-commits till just API-anropet.

## Arkitekturritningen

En SVG per applikation i `assets/diagrams/<samma slug>.svg`, genererad med
`scripts/generate-diagrams.py`. Datadrivna applikationer får sin ritning
automatiskt ur `scripts/apps-data.json`; lager utan innehåll utelämnas
(en app utan API-plattformskopplingar visar bara webb-app, eventuell
inloggning och externa integrationer). Handskrivna sidor har egna
`diagram(...)`-anrop i skriptet. Rita aldrig för hand – generatorn håller
stil och layout konsekvent.

Ritningens lager, uppifrån och ned:

1. **Webb-app** (blå) – frontend + backend, med reponamnet som undertext.
2. **SAML IdP** (grå, streckad = extern/gemensam tjänst) till höger, med
   streckad pil "autentisering".
3. **API-plattform (WSO2)** (grå med mörk ram) – all trafik går genom den;
   pilen från webb-appen märks med OAuth2/klientuppgifter.
4. **Verksamhets-API:er** (grön grupp) – applikationens API:er med version och
   kort användningstext; kärn-API:et markeras med mörkare grön.
5. **Master-data-API:er** (gul grupp) – Citizen, Employee, LegalEntity, Party,
   ActiveDirectory.
6. **Noteringar och teckenförklaring** nederst – kodverifierade särdrag
   (t.ex. "PT skickar inte beslut via e-post").

Innehållet i diagrammet (API-uppsättning, versioner, noteringar) ska stämma
exakt med sidans API-tabell – båda kommer från samma källor i repot.

## Övrigt att uppdatera

- **`README.md`** – uppdatera vid behov beskrivningen av innehållet.
- **Verifiera lokalt** innan push: kör `npx tsc --noEmit` och `npm run build`,
  servera `dist/` (`npm run preview`, kom ihåg `cp -r assets dist/assets` om du
  byggt utan npm-skriptet) och rendera sidorna med headless Chromium –
  kontrollera layout, diagram och att inget projektnamn syns i löptext
  (`grep -ri <projektnamn> src/ tjanster/` ska bara träffa URL:er och
  filnamn).

## Arbetsflöde

Utveckla på en arbetsgren, committa och pusha, skapa PR mot `main` och merga
efter godkännande. Merge till `main` publicerar automatiskt via GitHub Pages.
Obs: `main` skyddas av squash-merge – starta om arbetsgrenen från senaste
`origin/main` efter varje mergad PR innan nytt arbete pushas.
