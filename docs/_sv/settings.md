---
title: "Inställningar, enheter och tangenter"
nav_order: 19
lang: "sv"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Inställningar, enheter och tangenter

De små reglagen överst i sidofältet styr hur visaren kommunicerar med dig: språket, enheterna (meter eller fot, km/h eller knop) och ett hjälpläge som förklarar färgerna. Dina val minns i webbläsaren.

## Sidhuvudet {#the-header}

Överst i sidofältet:

| Reglage | Vad det gör |
|---|---|
| **?** | Hjälpläge: vad varje färg betyder (även `?` eller `F1`) |
| Menyn **Enheter** | Metriskt, Imperialt, Flyg eller Nautiskt |
| Knappen **...** bredvid **Enheter** | Öppnar ”Välj en enhet för varje storhet”: en rullgardinsmeny per storhet |
| Menyn **Språk** | Visarens språk: [40 språk](languages.md), eller webbläsarens |

![Sidhuvudet med menyn Enheter och fönstret för en enhet per storhet öppet](../assets/img/en/settings-units.webp)

Siffror du skriver i en ruta kan använda antingen punkt eller komma (`0.35` eller `0,35`). Visaren läser båda och visar siffror så som visarens språk skriver dem.

## Enheter {#units}

1. Välj en förinställning i menyn **Enheter**. Alla storheter byter tillsammans.
2. Vill du ändra bara en storhet klickar du på knappen **...** bredvid den och väljer en enhet för just den. Menyn visar då ett `*` efter förinställningen.
3. En storhet du inte har satt följer förinställningen. Välj ”Som förinställningen” för att gå tillbaka.

| Storhet | Metriskt (standard) | Imperialt | Flyg | Nautiskt |
|---|---|---|---|---|
| Distans | km | mi | NM | NM |
| Höjd, längd | m | ft | ft | m |
| Fart | km/h | mph | kt | kt |
| Vertikal fart | m/s | ft/min | ft/min | m/s |
| Temperatur | °C | °F | °C | °C |
| Tryck | hPa | inHg | hPa | hPa |
| Massa, bränsle | kg, l | lb, gal | lb, gal | t, m³ |
| Vinkel | grader | grader | grader | grader |

Andra enheter du kan välja för en enskild storhet: distans km, mi, NM; fart km/h, m/s, kt, mph; vertikal fart m/s, ft/min, m/min; temperatur °C, °F, K; tryck hPa, inHg, mmHg, psi; massa kg, lb, t; vinkel grader eller NATO-mil (6 400 på ett varv). Enheterna är desamma överallt i visaren: etiketter, kort, diagram och statistik.

## Hjälpläge {#help-mode}

![Hjälpläge: vad färgerna betyder](../assets/img/en/help.webp)

Tryck `?` eller `F1`, eller klicka på knappen **?**. Då visas *Vad färgerna betyder*: förklaringar för 3D-vyn, värmerampen, lagfärgerna, banans färger, panelernas statusfärger, matchpanelen och racingvyn. Det är på tills du stänger av det. I fliken Match förklarar det även matchpanelens färger.

![Hjälpläget i fliken Match](../assets/img/en/settings-help-match.webp)

## Vad webbläsaren minns {#what-the-browser-remembers}

Dessa inställningar sparas i webbläsaren mellan besöken. Ingenting skickas någonstans:

- språket, enheterna och hjälpläget;
- reprisets inställningar för figurer, symboler, etiketter, kamera och taktisk visning;
- uppspelningshastigheten och speglingen;
- bokmärken per inspelning, volymer per datamängd och lager för mål;
- inställningarna för extern AI (nyckeln bara om du kryssar i *Kom ihåg*).

Värmeinställningar, filter och läget startar på nytt vid varje inläsning. Hela, genererade listan finns under [Sparade inställningar](ref-settings-storage.md).

## Tangenter som visaren behåller från webbläsaren {#keys-the-viewer-keeps-from-the-browser}

En session med stora data tar tid att läsa in, så visaren hindrar webbläsaren från att kasta bort den av misstag:

- `Ctrl`/`Cmd` + bokstäver som skulle skriva ut, spara, öppna, ladda om, stänga eller öppna nya fönster gör ingenting utanför textrutor. `F1`, `F3`, `F5`, `F6` och `F7` gör ingenting.
- Att stänga eller ladda om fliken med data eller en bana inläst frågar först.
- I helskärm låser visaren de tangenter den använder (W, T, N, S, R, P, Q, Esc), så att webbläsaren inte tar dem.

Hela listan finns under [Webbläsartangenter](ref-browser-keys.md). Alla visarens egna tangenter: [Tangentbords- och musreferens](keyboard-reference.md).
