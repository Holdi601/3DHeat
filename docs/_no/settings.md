---
title: "Innstillinger, enheter og taster"
nav_order: 16
lang: "no"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: true
---

# Innstillinger, enheter og taster

De små kontrollene øverst i sidepanelet endrer hvordan visningsprogrammet snakker med deg: språket, enhetene (meter eller fot, km/t eller knop) og en hjelpemodus som forklarer fargene. Valgene dine huskes i nettleseren din.

## Hodet {#the-header}

Øverst i sidepanelet:

| Kontroll | Hva den gjør |
|---|---|
| **?** | Hjelpemodus: hva hver farge betyr (også `?` eller `F1`) |
| **Enheter**-menyen | Metrisk, Imperisk, Luftfart eller Nautisk |
| **...**-knappen ved siden av **Enheter** | Åpner «Velg en enhet for hver størrelse»: én rullegardin per størrelse |
| **Språk**-menyen | Visningsprogrammets språk: [40 språk](languages.md), eller nettleserens |

![Hodet med menyen Enheter og vinduet for enhet per størrelse åpent](../assets/img/no/settings-units.webp)

Tall du skriver i en boks kan bruke enten punktum eller komma (`0.35` eller `0,35`). Visningsprogrammet leser begge og viser tall slik språket ditt skriver dem.

## Enheter {#units}

1. Velg en forhåndsinnstilling i menyen **Enheter**. Alle størrelser bytter sammen.
2. For å endre bare én størrelse klikker du på **...**-knappen ved siden av den og velger en enhet for den størrelsen. Menyen viser da et `*` etter forhåndsinnstillingen.
3. En størrelse du ikke har satt, følger forhåndsinnstillingen. Velg «Som forhåndsinnstilt» for å gå tilbake.

| Størrelse | Metrisk (standard) | Imperisk | Luftfart | Nautisk |
|---|---|---|---|---|
| Avstand | km | mi | NM | NM |
| Høyde, lengde | m | ft | ft | m |
| Fart | km/t | mph | kt | kt |
| Vertikal fart | m/s | ft/min | ft/min | m/s |
| Temperatur | °C | °F | °C | °C |
| Trykk | hPa | inHg | hPa | hPa |
| Masse, drivstoff | kg, l | lb, gal | lb, gal | t, m³ |
| Vinkel | grader | grader | grader | grader |

Andre enheter du kan velge for én størrelse: avstand km, mi, NM; fart km/t, m/s, kt, mph; vertikal fart m/s, ft/min, m/min; temperatur °C, °F, K; trykk hPa, inHg, mmHg, psi; masse kg, lb, t; vinkel grader eller NATO-mil (6400 på sirkelen). Enhetene er like overalt i visningsprogrammet: etiketter, kort, diagrammer, statistikk.

## Hjelpemodus {#help-mode}

![Hjelpemodus: hva fargene betyr](../assets/img/no/help.webp)

Trykk `?` eller `F1`, eller klikk på **?**-knappen. Den viser *Hva fargene betyr*: forklaringer for 3D-visningen, varmerampene, lagfargene, banens farger, panelenes statusfarger, kamppanelet og løpsvisningen. Den står på til du slår den av. I fanen Kamp forklarer den også fargene i kamppanelet.

![Hjelpemodus i fanen Kamp](../assets/img/no/settings-help-match.webp)

## Hva nettleseren husker {#what-the-browser-remembers}

Disse innstillingene lagres i nettleseren din mellom besøk (ingenting sendes noe sted):

- språket, enhetene og hjelpemodusen;
- innstillingene for replayets figurer, symboler, etiketter, kamera og taktisk visning;
- avspillingshastigheten og speiling;
- bokmerker per opptak, volumer per datasett, lag for mål;
- innstillingene for ekstern KI (nøkkelen bare hvis du krysser av for *Husk*).

Varmeinnstillinger, filtre og modus starter på nytt ved hver innlasting. Den fullstendige, genererte listen: [Lagrede innstillinger](ref-settings-storage.md).

## Taster visningsprogrammet beholder fra nettleseren {#keys-the-viewer-keeps-from-the-browser}

En økt med store data tar tid å laste, så visningsprogrammet hindrer at nettleseren kaster den ved en feil:

- `Ctrl`/`Cmd` + bokstaver som ville skrevet ut, lagret, åpnet, lastet på nytt, lukket eller åpnet nye vinduer gjør ingenting utenfor tekstbokser; `F1`, `F3`, `F5`, `F6` og `F7` gjør ingenting.
- Å lukke eller laste fanen på nytt med data eller en bane lastet spør først.
- I fullskjerm låser visningsprogrammet tastene det bruker (W, T, N, S, R, P, Q, Esc), så nettleseren ikke tar dem.

Den nøyaktige listen: [Nettleserens taster](ref-browser-keys.md). Alle visningsprogrammets egne taster: [Referanse for tastatur og mus](keyboard-reference.md).
