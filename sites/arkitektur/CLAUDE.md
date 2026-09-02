# CLAUDE.md – sektionen Målarkitekturen

Sidorna under `arkitektur/` beskriver Sundsvalls kommuns målarkitektur.
Webbplatsens gemensamma regler – designsystem, språk, tillgänglighet och
byggflöde – står i repots `CLAUDE.md`. Här står bara det som gäller den här
sektionen.

- Beskrivningen av arkitekturen hålls på en **abstrakt nivå**: skikt,
  komponenter och principer – inte teknik- eller produktval.
- **Diagrammen genereras – rita aldrig för hand.** Ändra i
  `sites/arkitektur/scripts/generate-diagram.py`,
  `generate-ekosystem-diagram.py` respektive `generate-blueprint-diagram.py`
  och kör om skriptet med `python3`. De skriver till
  `public/arkitektur/assets/diagrams/`.
- Diagrammen har utförliga alt-texter – **uppdatera dem när diagrammen
  ändras**.
- Sidskalen ligger i `arkitektur/*.html`, React-ingångarna i
  `sites/arkitektur/entries/` och sidorna i `sites/arkitektur/pages/`.
