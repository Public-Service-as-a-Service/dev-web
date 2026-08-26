# Målarkitekturen

En webbplats som beskriver Sundsvalls kommuns målarkitektur på hög nivå samt de
riktlinjer – öppenhet, transparens, återanvändning med flera – som styr
kommunens digitala utveckling.

Webbplatsen delar grafisk profil och teknik med systerkatalogerna
[api-catalogue](https://github.com/Public-Service-as-a-Service/api-catalogue)
och [web-catalogue](https://github.com/Public-Service-as-a-Service/web-catalogue):
ren HTML/CSS utan byggsteg, allt innehåll på svenska.

## Innehåll

- `index.html` – hela webbplatsen: vad målarkitekturen är, arkitekturen på hög
  nivå (skikt för skikt), riktlinjerna samt länkar till byggstenarna.
- `assets/styles.css` – webbplatsens utseende (samma profil som katalogerna).
- `assets/diagrams/malarkitektur.svg` – översiktsritningen av målarkitekturen,
  genererad med `scripts/generate-diagram.py`. Rita aldrig för hand – ändra i
  skriptet och generera om.
- `scripts/generate-diagram.py` – genererar översiktsritningen i samma
  diagramstil som katalogernas arkitekturritningar.
- `.github/workflows/deploy-pages.yml` – arbetsflöde som publicerar webbplatsen
  till GitHub Pages.

## Publicering

Webbplatsen är statisk och kräver inget byggsteg. Den publiceras automatiskt via
GitHub Pages när ändringar pushas till `main`-grenen.

Engångsinställning: under **Settings → Pages** i repot, välj **GitHub Actions**
som källa ("Source"). Därefter publiceras sidan på
`https://<organisation>.github.io/target-architecture/` vid varje push till
`main` (eller manuellt via *Run workflow*).

## Uppdatera innehållet

Texterna redigeras direkt i `index.html`. Diagrammet ändras i
`scripts/generate-diagram.py` följt av `python3 scripts/generate-diagram.py`.
Verifiera lokalt innan push: rendera sidan med headless Chromium och
kontrollera layout och att diagrammet läses in korrekt.

## Underlag

Innehållet är framtaget ur bland annat:

- [utveckling.sundsvall.se](https://utveckling.sundsvall.se/)
- [API-katalogen](https://public-service-as-a-service.github.io/api-catalogue/index.html)
- [Webbkatalogen](https://public-service-as-a-service.github.io/web-catalogue/index.html)
- [Sundsvalls kommun på GitHub](https://github.com/Sundsvallskommun)
- [Kommunens utvecklarwiki](https://sundsvall.atlassian.net/wiki/home)
- [kommuna.se](https://kommuna.se/)
