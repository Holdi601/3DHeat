---
title: "Csapathő"
parent: "Hőmódok"
nav_order: 6
lang: "hu"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Csapathő

A csapathő megmutatja, hol volt minden csapat, mindegyiket a saját színében. Ahol a csapatok átfedik egymást, a színek keverednek.

A **Csapathő** (3-as billentyű) a [Hő](heat.md) sűrűségi mezője, minden [csoport](glossary.md) saját árnyalatot kap. Ahol a csoportok átfednek, az árnyalatok keverednek; az egyenlő küzdelem semleges színt ad. Az átlátszóság továbbra is ugyanúgy hordozza a sűrűséget, mint a többi módban, így a kép egyszerre válaszol arra, *mennyi* és *kié*. Csoportoszlop kell hozzá.

![Csapathő: mindkét oldal a saját színében; ahol átfednek, a színek keverednek](../assets/img/en/heat-teams.webp)

Ez nem a [figurás átfedés](box-replay.md): az személyenként egy figurát rajzol; ez egy hőmező, amelyet ugyanaz az oszlop színez.

## Használat {#how-to-use-it}

1. Nyomja meg a `3`-at (vagy válassza a **Csapathő** módot a módválasztó sávon).
2. Nyissa meg a **Hőszínek** részt. A mintaszínek mutatják az egyes csoportok színét; vigye a mintára az egeret a csapat nevéért.
3. Ha minden szürkének látszik, emelje a **Színszétválasztás** értékét.
4. A [Csapatlistában](teams-list.md) vegyen ki egy csoportot a jelölőnégyzetével; a többi szín a helyén marad.

## Vezérlők {#controls}

A **Hőszínek** szakaszban:

| Vezérlő | Alapérték | Jelentése |
|---|---|---|
| Mintaszínek | | Minden csoport színe az első 12 csoportig, utána *+N további*. Az egérrel rámutatva látszik a csoport neve és színe. |
| **Színszétválasztás** | 1,4 | Mennyire tolódik a keverék a semlegestől, 0–4. A 0 mindent szürkévé tesz; az 1 a valódi átlag; kb. 2 fölött a legfényesebb keverékek kilépnek a megjeleníthető tartományból, és csatornánként levágódnak, ami eltolja az árnyalatukat. |
| **Átlátszatlansági skála (a színt a csoport adja)** | az alapértelmezett hőskála | Itt csak a skála **alfája** számít: átlátszó, ahol nincs semmi, és teljesen átlátszatlan a teteje. A színeit figyelmen kívül hagyja. |

A többi hővezérlő – alak, telítettség, válasz, minimális hő, mélység, kihagyás – ugyanúgy működik, mint a [Hőnél](heat.md).

A [Csapatlista](teams-list.md) ebben a módban minden csoport csapathő-színét a mintájaként mutatja. Egy csoport elrejtése a többi csoport színét a helyén hagyja: az árnyalatok a csoportok teljes számából jönnek, nem abból, ami be van kapcsolva, így a két kép összehasonlítható marad.

## A paletta {#the-palette}

A [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts) fájlból:

- A színek az **Oklab** színsíkon élnek, rögzített fényerővel (0,7) és telítettséggel (0,115), így minden csoport egyformán világos, és a piros csoport nem tűnik melegebbnek a kéknél.
- *n* csoport esetén a színkört *n* egyenlő részre osztjuk, és az *i*-edik csoport a része **közepét** kapja: `(i + 0,5) / n` fordulat. Bármely két csoport a lehető legtávolabb van egymástól, és az ellentétek a számtól függetlenül ellentétesek maradnak.
- Legfeljebb **16** különböző árnyalatot használunk. Több csoport esetén az azonosítókat ismételt felezéssel helyezzük el (bitfordított azonosítók: 0, ½, ¼, ¾, ⅛, …), hogy a szomszédos azonosítók ne osszanak árnyalatot; a 16. fölötti csoportok szükségszerűen osztoznak.
- Az a csoport, amelynek címkéje „nincs csoport” jelentésű – `0`, üres, `none`, `unknown`, `null` vagy `-1`, a kis- és nagybetűket figyelmen kívül hagyva –, a színkör egy szelete helyett **semleges szürke** lesz. Csak az első ilyen címkét kezeljük így a csoportlistában.

Az alapértelmezett szétválasztás 1,4 és nem 1, mert 1-nél öt egyenletesen elosztott árnyalat keveréke *szürke*: helyes, de olvashatatlan. Valamivel 1 fölött a döntetlenek őszinték maradnak, miközben egy 60/40-es felosztás látható lesz.

## Hogyan működik {#how-it-works}

A hőcélpont ebben a módban négy csatornás. Minden sprite a sűrűségét *v* az első csatornához adja, a *v* × a csoport Oklab *a* és *b* koordinátáit pedig a másodikhoz és a harmadikhoz. Az összeállításkor a pixel keveréke a sűrűséggel súlyozott átlag: *a* = G / R, *b* = B / R, skálázva a színszétválasztással, és sRGB-re konvertálva a paletta fényerején. A halmozott sűrűséggel való osztás miatt az árnyalat független attól, mennyi adat van, és ezért hat minden sűrűségvezérlő továbbra is kizárólag az átlátszóságra.

A négycsatornás cél négyszer annyi GPU-memóriát igényel, mint az egycsatornás hőcél ugyanazon felbontáson.
