---
title: "Nastavení, jednotky a klávesy"
nav_order: 19
lang: "cs"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Nastavení, jednotky a klávesy

Malá ovládání nahoře v postranním panelu mění, jak s vámi prohlížeč mluví: jazyk, jednotky (metry nebo stopy, km/h nebo uzly) a režim nápovědy, který vysvětluje barvy. Vaše volby si prohlížeč pamatuje.

## Hlavička {#the-header}

Nahoře v postranním panelu:

| Ovládání | Co dělá |
|---|---|
| **?** | Režim nápovědy: co znamená každá barva (také `?` nebo `F1`) |
| Nabídka **Jednotky** | Metrické, Imperiální, Letecké nebo Námořní |
| Tlačítko **...** vedle **Jednotky** | Otevře „Vyberte jednotku pro každou veličinu“: jednu rozbalovací nabídku pro každou veličinu |
| Nabídka **Jazyk** | Jazyk zobrazení: [40 jazyků](languages.md), nebo jazyk webového prohlížeče |

![Hlavička s nabídkou Jednotky a otevřeným oknem jednotky pro každou veličinu](../assets/img/cs/settings-units.webp)

Čísla, která napíšete do pole, mohou mít tečku nebo čárku (`0.35` nebo `0,35`). Prohlížeč čte obojí a čísla zobrazuje tak, jak je píše jazyk prohlížeče.

## Jednotky {#units}

1. Vyberte předvolbu v nabídce **Jednotky**. Všechny veličiny se přepnou společně.
2. Chcete-li změnit jen jednu veličinu, klikněte vedle ní na tlačítko **...** a vyberte jednotku pro tuto veličinu. Nabídka pak za předvolbou ukáže `*`.
3. Veličina, kterou jste nenastavili, se řídí předvolbou. Vyberte „Podle předvolby“, abyste se vrátili.

| Veličina | Metrická (výchozí) | Imperiální | Letecká | Námořní |
|---|---|---|---|---|
| Vzdálenost | km | mi | NM | NM |
| Výška, délka | m | ft | ft | m |
| Rychlost | km/h | mph | kt | kt |
| Vertikální rychlost | m/s | ft/min | ft/min | m/s |
| Teplota | °C | °F | °C | °C |
| Tlak | hPa | inHg | hPa | hPa |
| Hmotnost, palivo | kg, l | lb, gal | lb, gal | t, m³ |
| Úhel | stupně | stupně | stupně | stupně |

Další jednotky, které lze vybrat pro jednu veličinu: vzdálenost km, mi, NM; rychlost km/h, m/s, kt, mph; vertikální rychlost m/s, ft/min, m/min; teplota °C, °F, K; tlak hPa, inHg, mmHg, psi; hmotnost kg, lb, t; úhel stupně nebo NATO mily (6400 na kruh). Jednotky jsou všude v prohlížeči stejné: popisky, karty, grafy, statistiky.

## Režim nápovědy {#help-mode}

![Režim nápovědy: co znamenají barvy](../assets/img/cs/help.webp)

Stiskněte `?` nebo `F1`, nebo klikněte na tlačítko **?**. Zobrazí se *Co znamenají barvy*: legendy pro 3D pohled, škály tepla, barvy týmů, barvy levelu, stavové barvy panelů, panel zápasu a pohled závodu. Zůstane zapnutý, dokud ho nevypnete. Na kartě Zápas vysvětluje i barvy panelu zápasu.

![Režim nápovědy na kartě Zápas](../assets/img/cs/settings-help-match.webp)

## Co si prohlížeč pamatuje {#what-the-browser-remembers}

Tato nastavení se uchovávají ve vašem prohlížeči mezi návštěvami (nic se nikam neposílá):

- jazyk, jednotky a režim nápovědy;
- nastavení figur, symbolů, popisků, kamery a taktického displeje přehrávání;
- rychlost přehrávání a zrcadlení;
- záložky podle záznamu, objemy podle datové sady, vrstvy cílů;
- nastavení externí AI (klíč jen tehdy, když zaškrtnete *Zapamatovat*).

Nastavení tepla, filtry a režim se při každém načtení začínají od nuly. Úplný, vygenerovaný seznam: [Uložená nastavení](ref-settings-storage.md).

## Klávesy, které prohlížeč drží z prohlížeče {#keys-the-viewer-keeps-from-the-browser}

Relace s velkými daty trvá, než se načte, takže prohlížeč brání tomu, aby ji prohlížeč omylem zahodil:

- `Ctrl`/`Cmd` + písmena, která by tiskla, ukládala, otevírala, znovu načítala, zavírala nebo otevírala nová okna, nedělají nic mimo textová pole; `F1`, `F3`, `F5`, `F6` a `F7` nedělají nic.
- Zavření nebo znovunačtení karty s načtenými daty nebo levelem se nejdřív zeptá.
- Na celou obrazovku prohlížeč zamkne klávesy, které používá (W, T, N, S, R, P, Q, Esc), takže je prohlížeč nepřevezme.

Přesný seznam: [Klávesy prohlížeče](ref-browser-keys.md). Všechny klávesy prohlížeče: [Přehled klávesnice a myši](keyboard-reference.md).
