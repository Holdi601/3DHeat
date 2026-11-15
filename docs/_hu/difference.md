---
title: "Különbség"
parent: "Hőmódok"
nav_order: 5
lang: "hu"
source: "difference.md"
source_hash: "9db62413b59c"
translated: true
outdated: false
---

# Különbség

Pirossal ott, ahol az A csapat volt többen; zöldkékkel ott, ahol a B csapat; semmi ott, ahol egyenlők voltak.

A **Különbség** (2-es gomb) előjeles hő. Az egyik populáció sorai hőt adnak hozzá, a másiké kivonják. Ahol a két populáció egyenletesen fedi egymást, az eredmény nulla és teljesen átlátszó; ahol az egyik dominál, abban az oldal színeiben látszik – alapértelmezetten melegen (átlátszó → piros → sárga → fehér) a **+** oldalnak, hűvösen (átlátszó → zöld → kék → lila) a **−** oldalnak.

![Különbség-hő: piros, ahol a + oldal volt többen, zöld és kék, ahol a − oldal](../assets/img/hu/difference-split.webp)

## Használat {#how-to-use-it}

1. Nyomd meg a `2`-t (vagy válaszd a **Különbség** gombot a módsávban).
2. Nyisd meg a **Különbség-felosztás** részt az oldalsávban.
3. Válaszd ki, mi szerint **Felosztás eszerint**: általában a *Csoportok*.
4. Tegyél egy csoportot (vagy értéket) a **+**-ra, egy másikat a **−**-ra.
5. Olvasd a színeket: a meleg a + oldal, a hűvös a − oldal. Ha az egyik oldalon nincs sor, a panel figyelmeztet (lásd [Az üzenetek, amelyeket láthatsz](#messages-you-may-see)).

*Melyik* két populáció a teljes kérdés, ezért a felosztás bármelyik megtartott oszlop lehet, nem csak csoport. Azok a sorok, amelyek **egyik** oldalra sem esnek, **kimaradnak**, nem számítanak nullának: ettől a sok érték közül két értéken végzett felosztás pontosan ezt a kettőt hasonlítja össze, és összeáll a [szűrőkkel](filters.md) – szűrj le egy térképre, majd bontsd azt verzió szerint.

A módhoz két oldal kell: egy csoportoszlop legalább két csoporttal, vagy egy megtartott szűrőoszlopon végzett felosztás. Két csoportnál kevesebbet tartalmazó adatnál a betöltés oszlop-felosztással indul – először a többfájlos betöltés *Source file* oszlopa, különben az első kategóriaoszlop két értékkel, különben az első számoszlop terjedelemmel –, így a *két betöltés összehasonlítása* csoportok nélküli adatnál is működik. Csak olyan adatnál nem elérhető a mód, amelyben egyik sincs; és az sem, ha egy oszlop-felosztásnál az egyik oldalon nem marad semmi.

## A Különbség-felosztás panel {#the-difference-split-panel}

A Különbség módban jelenik meg, a hőpanelek alatt.

A **Felosztás eszerint** a következőket kínálja:

| Lehetőség | Így látszik | Felosztási szabály |
|---|---|---|
| Csoportok | *Csoport (N)* (ha van csoportoszlop) | Minden csoport a +, a − vagy egyik oldalon, a [Csapatlistában](teams-list.md) beállítva |
| Egy kategóriaoszlop | *oszlop (N érték)* | Az értékek a +, a − vagy egyik oldalon |
| Egy számoszlop | *oszlop (szám)* | Egy értéktartomány mindkét oldalnak |
| A származási fájl | *Source file – két betöltés összehasonlítása* (ha több fájl volt betöltve) | Fájlok a +, a − vagy egyik oldalon |

Csak azok az oszlopok ajánlódnak fel, amelyeket betöltéskor a *Megtartás szűréshez* alatt megtartottunk.

### Az arányokat hasonlítsd, ne a darabszámokat {#compare-shares-not-counts}

Az **Arányokat hasonlítsd, ne a darabszámokat** (alapból ki) minden oldalt az saját sorszámának reciprokával súlyoz, így az az oldal, amelyiknek ötször annyi sora van, nem nyer pusztán a számok miatt. A szín ekkor azt mutatja, hol fordul elő arányosan gyakrabban az egyik oldal, mint a másik. Akkor használd, ha a két oldal adatmennyisége nagyon eltér, például két, eltérő hosszúságú munkamenet.

### Az üzenetek, amelyeket láthatsz {#messages-you-may-see}

A panel akkor figyelmeztet, ha a kép nem valódi különbség:

| Üzenet | Jelentés |
|---|---|
| *N + / M −* (vagy *N + / M − / K nincs használva*) | Hány érték van az egyes oldalon (és egyiken sem). |
| Az ablakban nincs sor a **+** oldalon | Csak a **−** oldal rajzolódik. Mozgasd az idővonal ablakát, vagy változtasd a felosztást. |
| Az ablakban nincs sor a **−** oldalon | Csak a **+** oldal rajzolódik. |
| Egyik oldalon sincs érték | A különbség nem rajzol semmit. Tegyél legalább egy értéket a **+** vagy a **−** oldalra. |
| *oszlop* nem osztható így | A választott oszlop nem illik a felosztáshoz. Válaszd újra az oszlopot. |
| A felosztási oszlop N / M darabnál nem fért be a GPU-memóriába | Ezek a sorok nem rajzolódnak. Növeld a GPU-keretet a Teljesítmény → Erőforráskeretek alatt, vagy tölts be kevesebb sort. |

### Csoportonként {#by-group}

A panel csak a [Csapatlistára](teams-list.md) mutat, ahol minden csoportnak van egy **+** és egy **−** gombja. Minden betöltésnél a csoportok első fele (felfelé kerekítve) a +-ra kerül, a többi a −-ra; a Csapatlista **Egyenletes felosztás** gombja ugyanezt újra megteszi. Az egyik oldalon sem álló csoport, vagy amely a jelölőnégyzetével el van rejtve, nem járul hozzá semmivel.

### Kategóriaértékenként {#by-category-values}

| Rész | Jelentés |
|---|---|
| `a + / b − / c nincs használva` | Hány érték van az egyes oldalon és egyiken sem. |
| **Törlés** | Minden értéket egyik oldalra sem tesz. |
| Értéklista | Minden értékhez egy **+** és egy **−** gomb (az aktívat újra megnyomva levehetjük az adott oldalról). Az üres érték *(hiányzik)* néven szerepel. |
| Korlát-megjegyzés | Csak az első 200 érték látszik: *Az N érték első 200-a látszik. Ilyen széles oszlopot jobb előbb szűréssel leszűkíteni, vagy tartomány szerint felosztani, ha az értékei rendezettek.* |

Az oszlop kiválasztásakor az első értéke a +-ra, a második a −-ra kerül. Ha egyik oldalon sincs érték, a felosztás csoportokra esik vissza, ahelyett hogy üres keretet mutatna. A *Source file* ugyanígy működik, fájlonként egy értékkel – így hasonlítunk össze két exportot, két tesztfuttatást vagy két buildet.

### Tartomány szerint {#by-range}

| Rész | Jelentés |
|---|---|
| Súgó | Az oszlop minimuma és maximuma. |
| **Pozitív tartomány (+)**, **ettől** / **eddig** | Ebbe a tartományba eső értékű sorok adnak hozzá. Mindkét végén zárt. |
| **Negatív tartomány (−)**, **ettől** / **eddig** | Ebbe a tartományba eső sorok kivonnak. |
| **Felosztás a felezőpontnál** | A +-t [minimum, középső] értékre, a −-t [középső, maximum] értékre állítja – az oszlop kiválasztása is ezt teszi. |

Ha egy érték mindkét tartományban benne van, +-nak számít. A tartományoknak nem kell lefedniük az oszlopot; az egyikben sem lévő értékek kimaradnak. *Az első két perc az utolsó két perccel szemben* egy időszerű oszlop tartomány szerinti felosztása.

## + aránya: a győzelmi arány térképe {#share-of--the-win-rate-map}

A panel tetején a **Különbség** / **+ aránya** választja ki, mi rajzolódik. A *+ aránya* minden helyet a + oldal arányával színez a két oldal ottani sorai közül, ehhez az arányhoz képest az összes megjelenített adaton: meleg felette, hideg alatta, semmi, ahol ugyanannyi, és semmi, ahol egy helyen túl kevés a sor. Ha a nyert körök a +, a vesztettek a − oldalon vannak, ez a győzelmi arány térképe; a **Nyert körök aránya** és a **Nyert meccsek aránya** egy gombnyomással beállítja ezt, ahol az adatnak vannak [eredményoszlopai](data-formats.md#outcome-columns). Lásd: [Győzelmi arány](win-rate.md).

## Színek {#colours}

A **Hőszínek** rész ebben a módban két skálaszerkesztőt mutat: **Pozitív (hozzáadó csapatok)** és **Negatív (kivonó csapatok)**, mindegyiknek saját visszaállító gombjával (*Visszaállítás: átlátszó → piros → sárga → fehér*, *Visszaállítás: átlátszó → zöld → kék → lila*). Az összetett kép a nettó hő abszolút értékét veszi a [telítettségi ponton és válaszon](colour-and-exposure.md) keresztül, és ahol a nettó kisebb nullánál, a negatív skálát választja. Lásd [Szín és expozíció](colour-and-exposure.md#the-ramp-editor).

Használd a *lineáris* sűrűségi választ, ha a különbség nagysága számít: ez az egyetlen válasz, amelyben az azonos szín azonos darabszámot jelent.

## Fejlesztőknek {#for-developers}

Minden sor +1, −1 vagy 0 előjelet kap a csúcspont-shaderben ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); a 0 a sort eldobja, mielőtt bármi kirajzolódna.

- Csoportonként az előjel egy 4096 bejegyzéses csoporttáblából jön, amelyet a sor csoport-azonosítója indexel (a csoport-azonosító a sor pozíció-texelének negyedik csatornáján utazik).
- Kategóriánként az előjel egy második, 4096 bejegyzéses táblából jön, amelyet kategóriaértékenként töltünk fel, a sor értékét pedig az oszlop szűrő-textúrájából olvassuk; a táblán túli értéket mindkét háttérrendszeren eldobjuk.
- Tartomány szerint a sor értékét a két tartománnyal hasonlítjuk össze.

A felosztás megváltoztatása újraindítja a halmozást.

**Az elrejtett csoportok minden felosztásnál rejtve maradnak.** Oszlop szerinti felosztásnál a csoporttábla már nem hordoz előjeleket; 1-et tartalmaz a látható csoportnak, 0-t a rejtettnek ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), és mindkét tábla egyszerre jut el a shaderhez – két sor egy előjel-textúrában WebGL2-n, két fél egy tároló pufferben WebGPU-n. Egy sor csak akkor rajzolódik, ha a csoportja látható *és* az oszlopértéke valamelyik oldalon van. Így a [Csapatlistában](teams-list.md) kikapcsolt csoport, vagy a Meccs fül oldalfókuszából kimaradt csoport, bárhogyan osztjuk is a különbséget, semmivel sem járul hozzá.
