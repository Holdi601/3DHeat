---
title: "Indstillinger, enheder og taster"
nav_order: 16
lang: "da"
source: "settings.md"
source_hash: "f25e4cbaf3bb"
translated: true
outdated: false
---

# Indstillinger, enheder og taster

De små styringer øverst i sidebaren ændrer, hvordan fremviseren taler til dig: sproget, enhederne (meter eller fod, km/t eller knob) og en hjælpetilstand, der forklarer farverne. Dine valg huskes i din browser.

## Headeren {#the-header}

Øverst i sidebaren:

| Styring | Hvad den gør |
|---|---|
| **?** | Hjælpetilstand: hvad hver farve betyder (også `?` eller `F1`) |
| Menuen **Enheder** | Metrisk, Imperial, Luftfart eller Nautisk |
| Knappen **...** ved siden af **Enheder** | Åbner "Vælg en enhed for hver størrelse": én rullemenu pr. størrelse |
| Menuen **Sprog** | Fremviserens sprog: [40 sprog](languages.md), eller browserens |

![Headeren med menuen Enheder og vinduet med én enhed pr. størrelse åbent](../assets/img/da/settings-units.webp)

Tal, du skriver i en boks, må bruge enten punktum eller komma (`0.35` eller `0,35`). Fremviseren læser begge og viser tal, sådan som fremviserens sprog skriver dem.

## Enheder {#units}

1. Vælg en forudindstilling i menuen **Enheder**. Alle størrelser skifter sammen.
2. Hvis du kun vil ændre én størrelse, så klik på knappen **...** ved siden af den, og vælg en enhed for den. Menuen viser så et `*` efter forudindstillingen.
3. En størrelse, du ikke har sat, følger forudindstillingen. Vælg "Som forudindstilling" for at gå tilbage.

| Størrelse | Metrisk (standard) | Imperial | Luftfart | Nautisk |
|---|---|---|---|---|
| Afstand | km | mi | NM | NM |
| Højde, længde | m | ft | ft | m |
| Hastighed | km/t | mph | kt | kt |
| Lodret hastighed | m/s | ft/min | ft/min | m/s |
| Temperatur | °C | °F | °C | °C |
| Tryk | hPa | inHg | hPa | hPa |
| Masse, brændstof | kg, l | lb, gal | lb, gal | t, m³ |
| Vinkel | grader | grader | grader | grader |

Andre enheder, du kan vælge for én størrelse: afstand km, mi, NM. Hastighed km/t, m/s, kt, mph. Lodret hastighed m/s, ft/min, m/min. Temperatur °C, °F, K. Tryk hPa, inHg, mmHg, psi. Masse kg, lb, t. Vinkel grader eller NATO-mil (6400 pr. omgang). Enhederne er de samme overalt i fremviseren: etiketter, kort, diagrammer og statistik.

## Hjælpetilstand {#help-mode}

![Hjælpetilstand: hvad farverne betyder](../assets/img/da/help.webp)

Tryk på `?` eller `F1`, eller klik på knappen **?**. Den viser *Hvad farverne betyder*: forklaringer til 3D-visningen, varmerampene, holdfarverne, banens farver, panelernes statusfarver, kampepanelet og løbsvisningen. Den bliver, indtil du slår den fra. I fanen Kamp forklarer den også kampepanelets farver.

![Hjælpetilstand i fanen Kamp](../assets/img/da/settings-help-match.webp)

## Hvad browseren husker {#what-the-browser-remembers}

Disse indstillinger gemmes i din browser mellem besøg. Intet sendes nogen steder hen:

- sproget, enhederne og hjælpetilstanden;
- replay-visningens indstillinger for figurer, symboler, etiketter, kamera og taktisk visning;
- afspilningshastigheden og spejlingen;
- bogmærker pr. optagelse, lydstyrker pr. datasæt og målslag;
- de eksterne AI-indstillinger (nøglen kun, hvis du sætter kryds i *Husk*).

Varmeindstillinger, filtre og tilstand starter forfra ved hver indlæsning. Den fulde, genererede liste: [Gemte indstillinger](ref-settings-storage.md).

## Taster, som fremviseren beholder fra browseren {#keys-the-viewer-keeps-from-the-browser}

En session med store data tager tid at indlæse, så fremviseren forhindrer browseren i at smide den væk ved en fejl:

- `Ctrl`/`Cmd` + bogstaver, der ville udskrive, gemme, åbne, genindlæse, lukke eller åbne nye vinduer, gør ingenting uden for tekstbokse. `F1`, `F3`, `F5`, `F6` og `F7` gør ingenting.
- At lukke eller genindlæse fanen, når der er data eller en bane indlæst, spørger først.
- I fuld skærm låser fremviseren de taster, den selv bruger (W, T, N, S, R, P, Q, Esc), så browseren ikke tager dem.

Den præcise liste: [Taster i browseren](ref-browser-keys.md). Alle fremviserens egne taster: [Reference for tastatur og mus](keyboard-reference.md).
