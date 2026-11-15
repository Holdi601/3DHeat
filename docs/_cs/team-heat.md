---
title: "Teplo týmů"
parent: "Režimy tepla"
nav_order: 6
lang: "cs"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: true
---

# Týmové teplo

Týmové teplo ukazuje, kde byl každý tým, každý tým svou barvou. Tam, kde se týmy překrývají, se barvy mísí.

**Týmové teplo** (klávesa 3) je hustotní pole [Tepla](heat.md), kde každá [skupina](glossary.md) dostane vlastní odstín. Kde se skupiny překrývají, jejich odstíny se mísí; vyrovnaný souboj vyjde neutrálně. Průhlednost stále nese hustotu přesně jako v ostatních režimech, takže obrázek odpovídá zároveň na *kolik* a *čí*. Potřebuje sloupec skupiny.

![Týmové teplo: každá strana svou barvou; tam, kde se překrývají, se barvy mísí](../assets/img/cs/heat-teams.webp)

Není to [překryv figur](box-replay.md): ten kreslí jednu figuru na osobu; tohle je pole tepla obarvené stejným sloupcem.

## Jak to použít {#how-to-use-it}

1. Stiskněte `3` (nebo vyberte **Týmové teplo** v liště režimů).
2. Otevřete **Barvy tepla**. Vzorky ukazují barvu každé skupiny; najetím na vzorek uvidíte název týmu.
3. Když všechno vypadá šedě, zvyšte **Oddělení barev**.
4. Odškrtnutím skupiny v [Seznamu týmů](teams-list.md) ji vyřadíte; barvy ostatních zůstanou tam, kde byly.

## Ovládání {#controls}

V sekci **Barvy tepla**:

| Ovládání | Výchozí | Význam |
|---|---|---|
| Vzorky | | Barva každé skupiny, pro prvních 12 skupin, pak *+N dalších*. Najetím uvidíte název skupiny a barvu. |
| **Oddělení barev** | 1,4 | Jak daleko se směs tlačí od neutrální, 0-4. 0 udělá vše šedé; 1 je skutečný průměr; nad zhruba 2 nejjasnější směsi opustí zobrazitelný rozsah a oříznou se po kanálech, což posune jejich odstín. |
| **Škála krytí (barva pochází ze skupiny)** | výchozí škála tepla | Používá se tu jen **alfa** škály: průhledné tam, kde nic není, neprůhledné nahoře. Její barvy se ignorují. |

Všechna ostatní ovládání tepla - tvar, sytost, odezva, minimální teplo, hloubka, vyřazování - fungují jako v [Teple](heat.md).

[Seznam týmů](teams-list.md) v tomto režimu ukazuje barvu týmového tepla každé skupiny jako její vzorek. Skrytí skupiny nechá barvy ostatních skupin tam, kde byly: odstíny se berou z celkového počtu skupin, ne z toho, co je zapnuté, takže dva obrázky zůstanou srovnatelné.

## Paleta {#the-palette}

Z [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Barvy leží v barevném prostoru **Oklab** při pevné světlosti (0,7) a sytosti (0,115), takže každá skupina je stejně světlá a červená skupina nepůsobí teplejším dojmem než modrá.
- Při *n* skupinách se kruh odstínů rozdělí na *n* stejných dílů a skupina *i* dostane **střed** svého dílu, `(i + 0,5) / n` otáčky. Každé dvě skupiny jsou od sebe tak daleko, jak počet dovolí, a protilehlé zůstanou protilehlé, ať je počet jakýkoli.
- Používá se nejvýš **16** různých odstínů. Při více skupinách se id rozmisťují opakovaným půlením (id v obráceném bitovém pořadí: 0, ½, ¼, ¾, ⅛, …), aby sousední id nesdílela odstín; skupiny nad 16 nutně sdílejí.
- Skupina, jejíž popisek znamená „žádná skupina“ - `0`, prázdný, `none`, `unknown`, `null` nebo `-1`, bez ohledu na velikost písmen - se kreslí **neutrální šedí** místo toho, aby dostala výseč kruhu. Takto se zachází jen s prvním takovým popiskem v seznamu skupin.

Výchozí oddělení je 1,4 místo 1, protože při 1 je směs pěti rovnoměrně rozložených odstínů *šedá*: správně, ale nečitelně. Lehce nad 1 udrží shodu poctivou a zároveň zviditelní rozdělení 60/40.

## Jak to funguje {#how-it-works}

Cíl tepla má v tomto režimu čtyři kanály. Každý sprite přidá svou hustotu *v* do prvního kanálu a *v* × Oklab souřadnice *a* a *b* skupiny do druhého a třetího. Při složení je směs pixelu průměr vážený hustotou: *a* = G / R, *b* = B / R, škálováno oddělením barev a převedeno do sRGB při světlosti palety. Dělení akumulovanou hustotou udržuje odstín nezávislý na tom, kolik dat je, a proto všechny ovládání hustoty dál působí jen na průhlednost.

Cíl o čtyřech kanálech stojí čtyřikrát tolik paměti GPU jako jednokanálový cíl tepla při stejném rozlišení.
