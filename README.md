# Målarkitekturen

En webbplats som beskriver Sundsvalls kommuns målarkitektur på hög nivå samt de
riktlinjer – öppenhet, transparens, återanvändning med flera – som styr
kommunens digitala utveckling.

Beskrivningen hålls medvetet på en abstrakt nivå: skikt, komponenter och
principer, inte teknik- eller produktval. Målarkitekturen omfattar ett ekosystem
av både egenutvecklade och upphandlade komponenter.

Webbplatsen delar grafisk profil och teknik med systerkatalogerna
[api-catalogue](https://github.com/Public-Service-as-a-Service/api-catalogue)
och [web-catalogue](https://github.com/Public-Service-as-a-Service/web-catalogue):
ren HTML/CSS utan byggsteg, allt innehåll på svenska.

## Innehåll

- `index.html` – hela webbplatsen: målarkitekturens syfte, arkitekturen på hög
  nivå (skikt för skikt), fokusområdena för egenutveckling, riktlinjerna samt
  fördjupningslänkar.
- `ekosystemet.html` – fristående undersida (länkas inte från startsidan) som
  visar hela ekosystemet i en bild: alla webbappar, alla API:er de anropar och
  API:ernas inbördes integrationer.
- `assets/styles.css` – webbplatsens utseende (samma profil som katalogerna).
- `assets/diagrams/malarkitektur.svg` – översiktsritningen av målarkitekturen.
- `assets/diagrams/egenutveckling.svg` – ritningen över fokusområdena för
  egenutveckling.
- `assets/diagrams/ekosystemet.svg` – helhetsritningen över ekosystemet med
  samtliga anropsrelationer.
- `scripts/generate-diagram.py` – genererar de två översiktsritningarna i samma
  diagramstil som katalogernas arkitekturritningar. Rita aldrig för hand –
  ändra i skriptet och generera om.
- `scripts/generate-ekosystem-diagram.py` – genererar helhetsritningen ur en
  ögonblicksbild av katalogernas data (`apis-data.json` och `apps-data.json` i
  [api-catalogue](https://github.com/Public-Service-as-a-Service/api-catalogue)
  respektive
  [web-catalogue](https://github.com/Public-Service-as-a-Service/web-catalogue)).
  Layouten beräknas ur beroendegrafen; uppdatera datalitteralerna i skriptet
  från katalogerna och generera om.
- `.github/workflows/deploy-pages.yml` – arbetsflöde som publicerar webbplatsen
  till GitHub Pages.

## Publicering

Webbplatsen är statisk och kräver inget byggsteg. Den publiceras automatiskt via
GitHub Pages när ändringar pushas till `main`-grenen, på
`https://<organisation>.github.io/target-architecture/`.

Webbplatsen kan även driftsättas som container: `Dockerfile` bygger en
nginx-avbildning som serverar sidan på port 80 (används av deployn till
[arkitektur.sundsvall.dev](https://arkitektur.sundsvall.dev/) via Dokploy –
byggtyp Dockerfile, containerport 80). En webhook i repot anropar Dokploy vid
varje push till `main`, så containerdeployn sker automatiskt precis som
GitHub Pages-publiceringen.

## Uppdatera innehållet

Texterna redigeras direkt i `index.html` respektive `ekosystemet.html`.
Översiktsdiagrammen ändras i `scripts/generate-diagram.py` följt av
`python3 scripts/generate-diagram.py`; helhetsritningen på ekosystemsidan
ändras i `scripts/generate-ekosystem-diagram.py` följt av
`python3 scripts/generate-ekosystem-diagram.py`.
Verifiera lokalt innan push: rendera sidan med headless Chromium och
kontrollera layout och att diagrammen läses in korrekt.

## Underlag

Innehållet är framtaget ur bland annat:

- [Målbild och strategi](https://utveckling.sundsvall.se/malbild-och-strategi)
  samt [API-strategin](https://utveckling.sundsvall.se/malbild-och-strategi/api-strategi)
  på utveckling.sundsvall.se
- [Digital infrastruktur](https://utveckling.sundsvall.se/digital-infrastruktur)
  med undersidor (digitala kanaler, API-infrastruktur, koncerngemensamma
  komponenter, metakatalogen, datalager, generellt processtöd, paketerade
  lösningar) på utveckling.sundsvall.se
- [Målarkitektur-sidan i kommunens utvecklarwiki](https://sundsvall.atlassian.net/wiki/spaces/SKA/pages/1117323272)
- [kommuna.se](https://kommuna.se/)
- [API-katalogen](https://public-service-as-a-service.github.io/api-catalogue/index.html)
  och [Webbkatalogen](https://public-service-as-a-service.github.io/web-catalogue/index.html)
- [Sundsvalls kommun på GitHub](https://github.com/Sundsvallskommun)
