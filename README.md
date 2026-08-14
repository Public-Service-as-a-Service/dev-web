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
  applikationerna.
- `tjanster/*.html` – en sida per webbapplikation, med beskrivning och teknisk
  dokumentation:
  - `generisk-arendehantering.html`
  - `myndighetsutovning-mark-och-exploatering.html`
  - `myndighetsutovning-parkeringstillstand.html`
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

1. Skapa en ny sida under `tjanster/` (kopiera gärna en befintlig sida som
   mall). Sidan ska innehålla en verksamhetsnära beskrivning överst och en
   sektion "Teknisk dokumentation" (arkitektur, teknikstack, API-beroenden,
   konfiguration, källkod) längre ned.
2. Lägg till ett kort som länkar till sidan i sektionen "Webbapplikationer i
   katalogen" i `index.html`.

Beskriv applikationen utifrån verksamhetsnytta – vad den gör och vem den
hjälper. Interna projektnamn används inte i katalogen; applikationerna
presenteras under sina verksamhetsnamn.
