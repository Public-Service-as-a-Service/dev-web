# AI-instruktion: dokumentera en tjänst i Webbkatalogen

Den här filen beskriver hur en AI-assistent (eller människa) lägger till och
underhåller dokumentation av en webbapplikation i katalogen. Följ arbetssättet
nedan – det är så de befintliga sidorna är framtagna.

## Vad katalogen är

En statisk webbplats (ren HTML/CSS, inget byggsteg) som beskriver de
webbapplikationer Sundsvalls kommun publicerar som öppen källkod på
[github.com/Sundsvallskommun](https://github.com/Sundsvallskommun) – repon som
börjar med `web-app`. Publiceras till GitHub Pages via
`.github/workflows/deploy-pages.yml` vid push till `main`.

## Grundprinciper

1. **Verksamhetsnamn, inte projektnamn.** Interna projekt-/kodnamn (t.ex.
   "Draken") används aldrig i katalogen. Applikationer presenteras under sina
   verksamhetsvända namn ("Generisk ärendehantering",
   "Myndighetsutövning – parkeringstillstånd").
2. **En sida per webbapplikation.** En generisk/konfigurerbar lösning som delas
   av flera verksamheter är EN applikation och får EN sida (verksamheterna
   listas på sidan). Myndighetsutövande applikationer får varsin egen sida,
   även när de delar kodbas. Tumregel för uppdelning: instanser som bygger på
   samma kärn-API och enbart skiljer sig genom konfiguration hör till samma
   sida; olika kärn-API eller olika myndighetsprocess ⇒ egen sida.
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

## Två sätt att skapa tjänstesidor

1. **Datadrivet (standard).** Lägg till ett objekt i `scripts/apps-data.json`
   med de fält som redan finns där (repo, namn, slug, kategori, status,
   ingress, beskrivning, målgrupp, funktioner, apis, integrationer, auth,
   teknik, konfiguration, anteckningar) och kör
   `python3 scripts/generate-pages.py` följt av
   `python3 scripts/generate-diagrams.py`. Sidan, arkitekturritningen och
   startsidans kort (mellan `APP-CARDS`-markörerna i `index.html`) genereras
   då automatiskt med rätt struktur. Fyll fälten enligt tabellen ovan –
   uppgifterna ska vara härledda ur källkodsrepot.
2. **Handskrivet.** De tre ärendehanteringssidorna
   (`generisk-arendehantering`, `myndighetsutovning-*`) är handskrivna och
   rörs inte av generatorn; deras diagram definieras direkt i
   `scripts/generate-diagrams.py`. Använd det här sättet bara när en sida
   behöver avvika från standardstrukturen.

## Tjänstesidans struktur

Sidan heter `tjanster/<slug>.html` (slug utan å/ä/ö, med bindestreck,
härledd ur tjänstens namn – inte ur repots kodnamn). Strukturen, som
generatorn producerar och handskrivna sidor ska följa:

1. **Sidhuvud** – samma `site-header` som övriga sidor (länkar med `../`).
2. **`page-hero`** – brödsmulor (Start / Webbapplikationer / sidnamn),
   `app-tag app-tag-light` med kategori ("Ärendehantering" eller
   "Myndighetsutövning"), `h1` med tjänstens namn, `hero-lead` med en menings
   sammanfattning.
3. **"Om applikationen"** – 2–4 stycken verksamhetsnära text: vilket behov
   tjänsten löser, vem som använder den, vilken nytta den ger. Inga tekniska
   utvecklingsdetaljer här. Därefter en punktlista: antingen "Verksamheter som
   använder applikationen" (generiska tjänster) eller "Det här stödjer
   applikationen" (funktionsöversikt). I sidokolumnen en `fact-box`
   ("Snabbfakta") med målgrupp, typ och en `fact-box-link` till källkoden –
   länktext utan projektnamn, t.ex. "Källkod på GitHub".
4. **"Teknisk dokumentation"** (`section-alt`, id `teknisk-dokumentation`) med
   underrubrikerna, i denna ordning:
   - **Arkitektur** – först en `figure.diagram` med arkitekturritningen (se
     nedan) och figcaption "Lösningsarkitektur, härledd ur källkodens
     konfiguration …", därefter prosa om frontend/backend, API-plattform
     (WSO2) och SAML-inloggning, samt hur instansen förhåller sig till delad
     kodbas.
   - **Teknikstack** – punktlista: körmiljö, frontend-ramverk,
     pakethantering, testverktyg.
   - **API-beroenden** – tabell (API, Version, Användning) i `table-wrap`.
     Versionerna ska ordagrant komma från `api-config.ts`. Sortera med
     kärn-API:et först, sedan verksamhets-API:er, sist master-data.
     Notera avvikelser i användningskolumnen (t.ex. "e-post används inte").
   - **Konfiguration och driftsättning** – punktlista utifrån
     `validateEnv.ts` och miljöfilerna: miljövariabelfiler per instans,
     WSO2-uppgifter (`CLIENT_KEY`/`CLIENT_SECRET`), SAML-variabler,
     funktionsflaggor, utvecklings-/produktionsläge.
   - **Källkod** – länk till repot på GitHub (länktext utan projektnamn).
5. **Sidfot** – samma `site-footer` som övriga sidor.

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

- **`index.html`** – korten mellan `<!-- BEGIN:APP-CARDS -->` och
  `<!-- END:APP-CARDS -->` genereras av `scripts/generate-pages.py`
  (grupperade per kategori, sorterade på namn, med statusetikett för
  prototyper/avvecklade/verktyg); redigera aldrig det blocket för hand.
- **`README.md`** – uppdatera vid behov beskrivningen av innehållet.
- **Verifiera lokalt** innan push: rendera sidorna med headless Chromium och
  kontrollera layout, diagram och att inget projektnamn syns i löptext
  (`grep -i <projektnamn> *.html tjanster/*.html` ska bara träffa URL:er).

## Arbetsflöde

Utveckla på en arbetsgren, committa och pusha, skapa PR mot `main` och merga
efter godkännande. Merge till `main` publicerar automatiskt via GitHub Pages.
Obs: `main` skyddas av squash-merge – starta om arbetsgrenen från senaste
`origin/main` efter varje mergad PR innan nytt arbete pushas.
