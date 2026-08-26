# Webbkatalogen

En katalog över de webbapplikationer som Sundsvalls kommun publicerar som öppen
källkod på GitHub ([github.com/Sundsvallskommun](https://github.com/Sundsvallskommun)
– repon som börjar med `web-app`).

Katalogen beskriver applikationerna på ett lättillgängligt sätt: vad varje tjänst
gör, vem den är till för och vilken nytta den skapar – utan tekniska
utvecklingsdetaljer.

Varje webbapplikation presenteras på en egen sida med en verksamhetsnära
beskrivning följt av teknisk dokumentation (härledd från GitHub) på samma sida.

## Innehåll

- `index.html` – förstasidan med information om katalogen och en översikt över
  applikationerna, grupperad per kategori.
- `tjanster/*.html` – en sida per webbapplikation (ett 50-tal), med
  beskrivning och teknisk dokumentation. Tre sidor är handskrivna
  (`generisk-arendehantering`, `myndighetsutovning-*`); övriga genereras från
  `scripts/apps-data.json` med `scripts/generate-pages.py`.
- `scripts/apps-data.json` – fakta om varje applikation, härledd ur respektive
  källkodsrepo.
- `assets/styles.css` – webbplatsens utseende.
- `assets/diagrams/*.svg` – arkitekturritningar, genererade med
  `scripts/generate-diagrams.py`.
- `CLAUDE.md` – AI-instruktion som i detalj beskriver hur en tjänst
  dokumenteras i katalogen.
- `.github/workflows/deploy-pages.yml` – arbetsflöde som publicerar webbplatsen
  till GitHub Pages.

## Publicering

Webbplatsen är statisk och kräver inget byggsteg. Den publiceras automatiskt via
GitHub Pages när ändringar pushas till `main`-grenen.

Engångsinställning: under **Settings → Pages** i repot, välj **GitHub Actions**
som källa ("Source"). Därefter publiceras sidan på
`https://<organisation>.github.io/web-catalogue/` vid varje push till `main`
(eller manuellt via *Run workflow*).

Webbplatsen kan även driftsättas som container: `Dockerfile` bygger en
nginx-avbildning som serverar sidan på port 80 (används för deploy via
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
