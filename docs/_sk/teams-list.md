---
title: "Tímy"
parent: "Filtre a nástroje"
nav_order: 2
lang: "sk"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---


# Zoznam tímov

Panel **Tímy** vám umožní skryť tím alebo ho dať na jednu stranu porovnania. Použite ho, keď chcete pozrieť len Modrých, alebo sa opýtať „kam ide Modrý, kam nejde Červený?“.

*Skupina* je tím alebo strana, napríklad Modrí a Červení ([Skupiny](sessions-persons-groups.md#group)). Panel sa zobrazí, keď dataset má stĺpec skupín; počet skupín je v jeho hlavičke. V režime Teplo tímov má bočný panel aj sekciu **Zobrazenie tímov** s vlastnými nastaveniami; táto stránka pokrýva zoznam **Tímy**.

## Skrytie tímu {#hide-a-team}

1. Otvorte **Tímy** na bočnom paneli.
2. Odškrtnite políčko (*Viditeľné*) tímu, ktorý chcete skryť. Obraz sa hneď aktualizuje.
3. Stlačte **Zobraziť všetky**, aby sa vrátili všetky tímy.

![Zoznam tímov: Blue 5p, Red 5p, so Zobraziť všetky](../assets/img/en/teams-list.webp)

## Každý riadok {#each-row}

| Časť | Význam |
|---|---|
| Políčko (*Viditeľné*) | Zobrazí alebo skryje skupinu. |
| Vzorka | Farba skupiny: jej farba [teploty tímov](team-heat.md) v režime Teplo tímov, jej základná farba v ostatných režimoch. |
| Názov | Popisok skupiny (plný popisok po podržaní myši). |
| **+** / **-** (režim Rozdiel) | Dá skupinu na kladnú alebo zápornú stranu [rozdielu](difference.md); kliknutím na aktívne tlačidlo znova ju dáte na žiadnu stranu. |
| `Np` (ostatné režimy) | Počet osôb, ktorých prvý riadok je v tejto skupine. |

![Režim Rozdiel: Modrí na strane +, Červení na strane -](../assets/img/en/teams-list-difference.webp)

## Tlačidlá {#buttons}

| Tlačidlo | Účinok |
|---|---|
| **Zobraziť všetky** | Znovu zviditeľní každú skupinu. |
| **Rozdeliť rovnomerne** (režim Rozdiel) | Prvá polovica skupín (zaokrúhlená nahor) na +, zvyšok na -; to isté rozdelenie, s ktorým sa začne pri každom načítaní. |

## Čo robí skrytie skupiny {#what-hiding-a-group-does}

- V **Teple**, **Teple tímov** a **Čiarach** riadky skupiny neprispievajú ničím.
- V **Rozdiele** skrytá skupina neprispieva nič, na ktorejkoľvek strane je, a to ani pri rozdelení podľa iného stĺpca (pozri [Rozdiel](difference.md#for-developers)).
- V **prekrytí figúrok** sa osoby, ktorých prvý riadok je v tejto skupine, nekreslia.
- V **Teple tímov** si ostatné skupiny ponechajú svoje farby: odtiene sa priraďujú podľa celkového počtu skupín, nie podľa toho, čo je viditeľné, takže dva obrazy zostanú porovnateľné.

Zmena viditeľnosti reštartuje akumuláciu. Pri každom novom datasete sú všetky skupiny znovu viditeľné.

Nápoveda panela sa mení podľa režimu: v Rozdieli vysvetľuje + a -; v Teple tímov hovorí, že vzorky sú farby, ktorými každá skupina kreslí.
