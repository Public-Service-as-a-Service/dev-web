# Utveckling

En öppen beskrivning av Sundsvalls kommuns digitala miljö: **riktningen vi
bygger mot** och **det som faktiskt körs i produktion**. Webbplatsen samlar tre
delar som tidigare låg på var sin domän:

- **Målarkitekturen** – riktning, långsiktigt mål och väsentliga vägval för
  kommunkoncernens digitala miljö, samt riktlinjerna och designprinciperna som
  styr utvecklingen.
- **Webbkatalogen** – de webbapplikationer kommunen publicerar som öppen
  källkod: vad varje tjänst gör, vem den är till för och hur den är uppbyggd.
- **API-katalogen** – de API:er som körs i produktion på kommunens
  API-plattform, med beskrivningar, arkitekturritningar, interaktiv
  dokumentation och programvaruförteckningar.

Startsidan är ingången till de tre och länkar vidare till närliggande
initiativ. Innehållet riktar sig till alla som vill förstå eller granska
kommunens digitala miljö – kollegor, leverantörer, andra kommuner och
invånare – inte bara till utvecklare. Utvecklarnära arbetssätt som golden
paths, DevOps och leveransgrindar hör hemma i utvecklarportalen och upprepas
inte här.

Katalogerna hålls aktuella automatiskt: programvaruförteckningarna uppdateras
varje vecka av ett arbetsflöde, och två schemalagda Claude-jobb stämmer av
katalogernas innehåll mot källkodsrepona (se `sites/api/docs/veckosynk.md` och
`sites/tjanster/docs/veckosynk.md`).

Webbplatsen är byggd med [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/):
komponenter importeras från `@sk-web-gui/react` och alla designtokens (färger,
typografi, avstånd) kommer från `@sk-web-gui/core` via dess Tailwind-preset.
Inga hex-värden eller CSS-variabler hårdkodas i projektet. Allt innehåll är på
svenska.

## Innehåll

Repot är ett monorepo: en startsida och en sektion per delwebbplats, som byggs
till en enda uppsättning statiska filer och publiceras som en container.

| Sektion | Adress | Källa |
| --- | --- | --- |
| Startsidan | `/` | `index.html`, `sites/start/` |
| Målarkitekturen | `/arkitektur/` | `arkitektur/*.html`, `sites/arkitektur/` |
| Webbkatalogen | `/tjanster/` | `tjanster/*.html`, `sites/tjanster/` |
| API-katalogen | `/api/` | `api/*.html`, `sites/api/` |

- `arkitektur/` – målarkitekturen med undersidorna Ekosystemet och
  Designprinciper, samt diagramgeneratorerna. Se `sites/arkitektur/README.md`.
- `tjanster/` – webbkatalogens startsida och 37 genererade tjänstesidor med
  lika många programvaruförteckningar. Se `sites/tjanster/README.md`.
- `api/` – API-katalogens startsida och 75 API-sidor med Swagger UI och
  programvaruförteckningar. Se `sites/api/README.md`.
- `packages/chrome/` – paketet `@sundsvall/chrome` med sidhuvud, sidfot,
  appskal, byggblock och webbplatsens gemensamma navigation. Sektionerna har
  inga egna kopior av chromet.
- `public/assets/` – delade ikoner. `public/SEKTION/assets/` – sektionernas
  genererade ritningar och OpenAPI-specar. Programvaruförteckningarna hämtas hit
  från datarepot [sbom-data](https://github.com/Public-Service-as-a-Service/sbom-data)
  av `scripts/fetch-sbom.sh` och ligger inte i det här repot.
- `.github/workflows/refresh-sbom.yml` – arbetsflöde som varje vecka uppdaterar
  båda katalogernas programvaruförteckningar från källkodsrepona.

Sidskalen (`*.html`) bär webbadressen och plockas upp automatiskt av
`vite.config.ts`; React-koden ligger under `sites/`. Katalogernas sidskal
**genereras** ur sektionernas datafiler och redigeras aldrig för hand.

## Utveckla och bygga

Webbplatsen är en React-applikation som byggs med Vite till statiska filer:

```sh
npm install            # installera beroenden
sh scripts/fetch-sbom.sh  # hämta programvaruförteckningarna (drygt 90 MB)
npm run dev            # utvecklingsserver med omedelbar omladdning
npm run build          # bygg produktionsversionen till dist/
```

Förteckningarna ligger i datarepot `sbom-data` och hämtas grunt. Utan dem
saknar SBOM-sidorna innehåll, och katalogernas generatorer avbryter med besked.

Bygget omfattar alla sektioner – knappt 300 sidor – så ett fel i en sektion
stoppar hela webbplatsen.

Designsystemet:

- Komponenter (`Button`, `Card`, `Link`, `Header`, `Footer`, `Logo`, `Label`
  med flera) importeras från `@sk-web-gui/react`.
- Designtokens kommer från `@sk-web-gui/core`, som kopplas in som
  Tailwind-preset i `tailwind.config.js`. Färger, typsnitt och avstånd används
  via klasser som `bg-vattjom-background-200`, `text-dark-secondary`,
  `font-header` och `max-w-content` – aldrig via hårdkodade hex-värden eller
  egna CSS-variabler.
- `GuiProvider` från `@sk-web-gui/react` sätter temats variabler i dokumentet.
- Typsnittet Raleway läses in via paketet `@fontsource/raleway`.

## Publicering

Containern är den enda publiceringen: `Dockerfile` bygger webbplatsen i ett
Node-steg och serverar `dist/` med nginx på port 80 (`nginx.conf` sätter
cache-huvuden). En webhook i repot anropar Dokploy vid varje push till `main`.
GitHub Pages används inte.

Bygget använder relativa sökvägar (`base: './'`), så samma artefakt kan serveras
från rot såväl som från en underkatalog vid lokal förhandsgranskning.

Domänbytet till `ekosystemet.sundsvall.dev` och omdirigeringarna från de fyra
gamla domänerna beskrivs i [`docs/publicering.md`](docs/publicering.md).

## Uppdatera innehållet

- **Startsidan:** texterna redigeras i `sites/start/StartPage.tsx`. Korten
  ligger som datalitteraler överst i filen.
- **Målarkitekturen:** texterna i `sites/arkitektur/pages/`, diagrammen via
  generatorerna i `sites/arkitektur/scripts/`.
- **Katalogerna:** aldrig i sidorna, utan i datafilerna
  `sites/tjanster/scripts/apps-data.json` respektive
  `sites/api/scripts/apis-data.json`, följt av en körning av sektionens
  `generate-pages.py` och `generate-diagrams.py`. Programvaruförteckningarna
  skrivs aldrig för hand – de underhålls av arbetsflödet.
- **Meny och sidfot:** i `packages/chrome/src/navigation.ts`, en gång för hela
  webbplatsen.

Verifiera lokalt innan push: bygg webbplatsen, rendera startsidan och minst en
sida per sektion med headless Chromium i både desktop- och mobilbredd, och
kontrollera att länkarna mellan sektionerna pekar rätt.

## Underlag

Katalogernas innehåll härleds ur källkoden i kommunens öppna repon på
[github.com/Sundsvallskommun](https://github.com/Sundsvallskommun). Startsidans
och målarkitekturens texter bygger på kommunens egen dokumentation av
målarkitekturen, samt på [kommuna.se](https://kommuna.se/index.html) och
[eneo.ai](https://eneo.ai/) för de initiativ som beskrivs under vidare läsning.
Designprinciperna kommer ur en doktorsavhandling som anges på sin egen sida.
