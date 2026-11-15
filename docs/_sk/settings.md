---
title: "Nastavenia, jednotky a klávesy"
nav_order: 19
lang: "sk"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Nastavenia, jednotky a klávesy

Malé ovládače hore na bočnom paneli menia, ako s vami prehliadač hovorí: jazyk, jednotky (metre alebo stopy, km/h alebo uzly) a režim pomoci, ktorý vysvetľuje farby. Vaše voľby sa pamätajú v prehliadači.

## Hlavička {#the-header}

Hore na bočnom paneli:

| Ovládač | Čo robí |
|---|---|
| **?** | Režim pomoci: čo znamená každá farba (aj `?` alebo `F1`) |
| Ponuka **Jednotky** | Metrické, Imperiálne, Letecké alebo Námorné |
| Tlačidlo **...** vedľa **Jednotky** | Otvorí „Vyberte jednotku pre každú veličinu“: jedna rozbaľovacia ponuka pre každú veličinu |
| Ponuka **Jazyk** | Jazyk prehliadača: [40 jazykov](languages.md), alebo jazyk prehliadača |

![Hlavička s ponukou Jednotky a oknom jednotky pre každú veličinu otvoreným](../assets/img/en/settings-units.webp)

Čísla, ktoré napíšete do políčka, môžu mať bodku alebo čiarku (`0.35` alebo `0,35`). Prehliadač prijme obe a zobrazí čísla tak, ako ich píše jazyk prehliadača.

## Jednotky {#units}

1. Vyberte predvoľbu v ponuke **Jednotky**. Všetky veličiny sa prepnú spoločne.
2. Ak chcete zmeniť len jednu veličinu, kliknite na tlačidlo **...** vedľa nej a vyberte jednotku pre ňu. Ponuka potom zobrazí `*` za predvoľbou.
3. Veličina, ktorú ste nenastavili, sleduje predvoľbu. Vyberte „Ako predvoľba“, ak sa chcete vrátiť.

| Veličina | Metrické (predvolené) | Imperiálne | Letecké | Námorné |
|---|---|---|---|---|
| Vzdialenosť | km | mi | NM | NM |
| Výška, dĺžka | m | ft | ft | m |
| Rýchlosť | km/h | mph | kt | kt |
| Vertikálna rýchlosť | m/s | ft/min | ft/min | m/s |
| Teplota | °C | °F | °C | °C |
| Tlak | hPa | inHg | hPa | hPa |
| Hmotnosť, palivo | kg, l | lb, gal | lb, gal | t, m³ |
| Uhol | stupne | stupne | stupne | stupne |

Ďalšie jednotky, ktoré môžete vybrať pre jednu veličinu: vzdialenosť km, mi, NM; rýchlosť km/h, m/s, kt, mph; vertikálna rýchlosť m/s, ft/min, m/min; teplota °C, °F, K; tlak hPa, inHg, mmHg, psi; hmotnosť kg, lb, t; uhol stupne alebo NATO mils (6400 na kružnicu). Jednotky sú v prehliadači všade rovnaké: popisky, karty, grafy, štatistiky.

## Režim pomoci {#help-mode}

![Režim pomoci: čo znamenajú farby](../assets/img/en/help.webp)

Stlačte `?` alebo `F1`, alebo kliknite na tlačidlo **?**. Zobrazí *Čo znamenajú farby*: legendy pre 3D pohľad, škály tepla, farby tímov, farby levelu, farby stavových indikátorov panelov, panel zápasu a pohľad pretekov. Zostáva zapnutý, kým ho nevypnete. Na karte Zápas vysvetľuje aj farby panela zápasu.

![Režim pomoci na karte Zápas](../assets/img/en/settings-help-match.webp)

## Čo si prehliadač pamätá {#what-the-browser-remembers}

Tieto nastavenia sa uchovávajú vo vašom prehliadači medzi návštevami (nikam sa nič neposiela):

- jazyk, jednotky a režim pomoci;
- nastavenia figúrok, symbolov, popiskov, kamery a taktického displeja prehrávania;
- rýchlosť prehrávania a zrkadlenie;
- záložky pre každý záznam, objemy pre každú dátovú sadu, vrstvy cieľov;
- nastavenia externej AI (kľúč len vtedy, keď zaškrtnete *Zapamätať*).

Nastavenia tepla, filtre a režim sa pri každom načítaní začínajú odznova. Úplný vygenerovaný zoznam: [Uložené nastavenia](ref-settings-storage.md).

## Klávesy, ktoré prehliadač nechá vo viewer {#keys-the-viewer-keeps-from-the-browser}

Relácia s veľkými dátami sa načíta dlho, takže prehliadač zabraňuje tomu, aby ju omylom zahodil:

- `Ctrl`/`Cmd` + písmená, ktoré by tlačili, ukladali, otvárali, obnovovali, zatvárali alebo otvárali nové okná, nerobia nič mimo textových polí; `F1`, `F3`, `F5`, `F6` a `F7` nerobia nič.
- Zatvorenie alebo obnovenie karty s načítanými dátami alebo levelom sa najprv opýta.
- Na celú obrazovku prehliadač uzamkne klávesy, ktoré používa (W, T, N, S, R, P, Q, Esc), aby ich prehliadač nezachytil.

Presný zoznam: [Klávesy prehliadača](ref-browser-keys.md). Všetky vlastné klávesy prehliadača: [Referencia klávesnice a myši](keyboard-reference.md).
