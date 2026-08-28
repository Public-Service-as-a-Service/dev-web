# Webbkatalogen

En katalog över de webbapplikationer som Sundsvalls kommun publicerar som öppen
källkod på GitHub ([github.com/Sundsvallskommun](https://github.com/Sundsvallskommun)
– repon som börjar med `web-app`). Katalogen listar endast webbapplikationer som
körs i drift – prototyper och avvecklade applikationer ingår inte.

Katalogen beskriver applikationerna på ett lättillgängligt sätt: vad varje tjänst
gör, vem den är till för och vilken nytta den skapar – utan tekniska
utvecklingsdetaljer.

Varje webbapplikation presenteras på en egen sida med en verksamhetsnära
beskrivning följt av teknisk dokumentation (härledd från GitHub) på samma sida.

Webbplatsen är byggd med [Sundsvalls kommuns designsystem](https://ui.sundsvall.dev/):
komponenter importeras från `@sk-web-gui/react` och alla designtokens (färger,
typografi, avstånd) kommer från `@sk-web-gui/core` via dess Tailwind-preset.
Inga hex-värden eller CSS-variabler hårdkodas i projektet.

## Innehåll

- `index.html` / `src/pages/IndexPage.tsx` – förstasidan med information om
  katalogen och en översikt över applikationerna, grupperad per kategori
  (korten renderas ur `scripts/apps-data.json`).
- `tjanster/*.html` – ett sidskal per webbapplikation (ett 40-tal) med sidans
  data inbäddad som JSON; innehållet renderas av React-komponenterna i
  `src/pages/`. Tre sidor är handskrivna React-sidor
  (`generisk-arendehantering`, `myndighetsutovning-*`, i
  `src/pages/handskrivna/`); övriga genereras från `scripts/apps-data.json`
  med `scripts/generate-pages.py`.
- `scripts/apps-data.json` – fakta om varje applikation, härledd ur respektive
  källkodsrepo.
- `src/components/` – delade byggblock (sidhuvud, sidfot, hero, kort med mera)
  ovanpå designsystemets komponenter.
- `assets/diagrams/*.svg` – arkitekturritningar, genererade med
  `scripts/generate-diagrams.py`.
- `CLAUDE.md` – AI-instruktion som i detalj beskriver hur en tjänst
  dokumenteras i katalogen.
- `.github/workflows/deploy-pages.yml` – arbetsflöde som publicerar webbplatsen
  till GitHub Pages.

## Utveckla och bygga

Webbplatsen är en React-applikation som byggs med Vite till statiska filer:

```sh
npm install   # installera beroenden
npm run dev   # utvecklingsserver med omedelbar omladdning
npm run build # bygg produktionsversionen till dist/
```

## Publicering

Webbplatsen byggs med `npm run build` och publiceras automatiskt via
GitHub Pages när ändringar pushas till `main`-grenen.

Engångsinställning: under **Settings → Pages** i repot, välj **GitHub Actions**
som källa ("Source"). Därefter publiceras sidan på
`https://<organisation>.github.io/web-catalogue/` vid varje push till `main`
(eller manuellt via *Run workflow*).

Webbplatsen kan även driftsättas som container: `Dockerfile` bygger webbplatsen
i ett Node-steg och serverar `dist/` med nginx på port 80 (används för deploy via
Dokploy – byggtyp Dockerfile, containerport 80, källan klonad över HTTPS
eftersom repot är publikt, med webhook som triggar deploy vid push till
`main`).

## Lägga till fler applikationer

Följ instruktionen i [`CLAUDE.md`](CLAUDE.md) – den beskriver i detalj hur
teknisk fakta härleds ur källkodsrepot (API-versioner ur `api-config.ts`,
instanser och funktioner ur miljöfiler och funktionsflaggor), hur tjänstesidan
struktureras och hur arkitekturritningen genereras.

Kort version: skapa en sida under `tjanster/` med verksamhetsnära beskrivning
överst och teknisk dokumentation längre ned, generera en arkitekturritning via
`scripts/generate-diagrams.py`, och lägg till ett kort i `index.html`. Interna
projektnamn används inte i katalogen; applikationerna presenteras under sina
verksamhetsnamn.

## Programvaruförteckningar (SBOM)

Varje applikation har en programvaruförteckning i SPDX-format:
`tjanster/<slug>-sbom.html` med komponenter, versioner och licenssammanfattning,
och `assets/sbom/<slug>.spdx.json` för maskinell läsning. De underhålls av
`.github/workflows/refresh-sbom.yml` och ska inte redigeras för hand.
