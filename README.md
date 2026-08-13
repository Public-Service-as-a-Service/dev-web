# Webbkatalogen

En katalog över de webbapplikationer som Sundsvalls kommun publicerar som öppen
källkod på GitHub ([github.com/Sundsvallskommun](https://github.com/Sundsvallskommun)
– repon som börjar med `web-app`).

Katalogen beskriver applikationerna på ett lättillgängligt sätt: vad varje tjänst
gör, vem den är till för och vilken nytta den skapar – utan tekniska
utvecklingsdetaljer.

## Innehåll

- `index.html` – förstasidan med information om katalogen samt en första
  applikationsbeskrivning (Draken).
- `assets/styles.css` – webbplatsens utseende.
- `.github/workflows/deploy-pages.yml` – arbetsflöde som publicerar webbplatsen
  till GitHub Pages.

## Publicering

Webbplatsen är statisk och kräver inget byggsteg. Den publiceras automatiskt via
GitHub Pages när ändringar pushas till `main`-grenen.

Engångsinställning: under **Settings → Pages** i repot, välj **GitHub Actions**
som källa ("Source"). Därefter publiceras sidan på
`https://<organisation>.github.io/web-catalogue/` vid varje push till `main`
(eller manuellt via *Run workflow*).

## Lägga till fler applikationer

Nya applikationsbeskrivningar läggs till som ytterligare `app-card`-sektioner i
`index.html`. Beskriv applikationen utifrån verksamhetsnytta – vad den gör och
vem den hjälper – och länka till källkoden på GitHub.
