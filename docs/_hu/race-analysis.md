---
title: "Versenyelemzés"
nav_order: 14
has_children: true
lang: "hu"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Versenyelemzés

Kétszer ugyanazt a pályát hajtotta. A **Versenyelemzés** fül mindkét futást együtt játssza le 3D-ben, megmutatja, hol volt lassabb egy kör, és megmondja, miért. Még nincsenek körei? Nyomja meg a **Demókörök** gombot.

![A Versenyelemzés fül a demókörökkel: az oldalsáv a Körök és a Hol lehet javítani részekkel, az autók a pályán, a diagramok a nézet alatt](../assets/img/en/race-analysis-overview.webp)

A fül egy pálya két vagy több körét hasonlítja össze. A vászon, a kamera és a betöltött pályamodell (**Háttér / pálya**) a hőtérképpel közös; minden más saját: saját oldalsávja és saját sávja a nézet alatt. Az olyan szavak, mint a *kör*, a *referencia* és a *csúcspont*, a [szójegyzékben](glossary.md) vannak.

Ez az oldal a fül térképe. Minden része saját oldalt kap:

| Oldal | Mit fed le |
|---|---|
| [Körök betöltése](race-loading-laps.md) | minden fájlformátum, mappák és pályák, autónevek, demókörök, a körlista, referencia és fókusz |
| [Visszajátszás és a 3D-s jelenet](race-replay-and-scene.md) | az átviteli sáv, a három visszajátszási mód, az autók sorba állítása, az üldöző kamera, vonalak, térképek, autók, feliratok, tükrözött világok |
| [Diagramok és a HUD](race-charts-and-hud.md) | a távolságdiagramok, a grafikonválasztó, a fölé húzás és nagyítás, az autókártyák, a csatornatáblázat |
| [Autóvezetési események](race-control-events.md) | blokkolás, kerékpörgés, túlkormányzás, pörgés, alulkormányzás, ütközések, balesetek, ABS/TC, kézifék, levegő – minden észlelése minden küszöbértékkel |
| [Kanyarról kanyarra elemzés](race-corner-analysis.md) | igazítás távolság szerint, kanyarok és szakaszok, egy kanyar időmérlege, minden ok és azok a sorrend, amelyben megvizsgálják, a vonal alakja és a tanács |
| [Autóprofilok és összehasonlítás](race-car-profiles.md) | mit tud minden autó, a köreiből mérve; *Autók összehasonlítva*; mit dönt el az autó minden kanyarban |
| [Pályastatisztikák](race-course-statistics.md) | egy pálya sok köre: hibák kanyaronként és fajtánként, a hibatérkép, a hőtérkép-exportálás, teljesítményhatárok |
| [Versenyelemzés: a módszer](race-analytics.md) | a szabályok mögötti kutatás, forrásokkal |
| [Más versenyjátékok](other-games.md) | mit csinál a megjelenítő az egyes játékok köreivel: csúszás és driftelés, ahol a játék nem küldi, tükrözött világok, a többi csatorna |

## A képernyő {#the-screen}

**Oldalsáv**, felülről lefelé (a szakaszok összecsukhatók):

1. **Körök** – betöltés, lista, megjelenítés/elrejtés, referencia, fókusz, üldözés. Lásd [Körök betöltése](race-loading-laps.md).
2. **Pályastatisztika** – csak három betöltött körtől. Lásd [Pályastatisztikák](race-course-statistics.md).
3. **Hol lehet javítani** – a fókuszált kör megállapításai, kanyarról kanyarra. Lásd [Kanyarról kanyarra elemzés](race-corner-analysis.md).
4. **Kanyarról kanyarra** (vagy *Kanyarról kanyarra – X osztály*, több osztálynál) – a leggyorsabb kör minden kanyarja és annak vonala. Két vagy több körnél látszik.
5. **Autóirányítás** – a fókuszált kör blokkolásai, csúszásai, alulkormányzásai és ütközései. Lásd [Autóvezetési események](race-control-events.md).
6. **Autók összehasonlítva** (vagy **Az autó**, ha egy autó van) – lásd [Autóprofilok és összehasonlítás](race-car-profiles.md).
7. **Nézet** – melyik térkép van a pályára festve, és mi rajzolódik ki. Lásd [Visszajátszás és a 3D-s jelenet](race-replay-and-scene.md).
8. A közös **Pálya** és **Kamera és jelenet** panelek (pályamodell, tengelyek megfordítása, kamera) – a hőtérképpel és a [Kamerával](camera.md) együtt dokumentálva.

**A nézet** a pályát, a megtett vonalakat, a térképet, az autókat, a pályához rögzített feliratokat és legfeljebb hat autókártyát mutat balra fent (lásd [Diagramok és a HUD](race-charts-and-hud.md)). Körök nélkül ez áll: „Nincs betöltött kör – húzzon ide két vagy több körfájlt, vagy töltse be a demóköröket az oldalsávból.”

**A nézet alatti sáv** a visszajátszás átviteli vezérlőit tartalmazza, és – ha nincs elrejtve – a távolságdiagramokat.

## Gyors kezdés {#quick-start}

1. Nyissa meg a **Versenyelemzés** fület (a **Hőtérkép** mellett, az oldalsáv tetején).
2. Vigyen be köröket. A **Demókörök** gombbal lássa, mit csinál a fül három kitalált körrel. A saját köreihez először rögzítse őket ([fájlformátumok és rögzítők](race-loading-laps.md#file-formats)), majd nyomja meg a **Körfájlok betöltése…** vagy a **Mappa…** gombot, vagy dobjon fájlokat vagy mappákat a nézetre.
3. A leggyorsabb teljes kör lesz a referencia; a leglassabb többi kör a fókuszban van. Kattintson bármely körre a listában, hogy fókuszba kerüljön; a ★ jellel a kör referencia lesz.
4. Olvassa el a **Hol lehet javítani** részt. Kattintson egy megállapításra: az autók 40 m-rel előtte sorba állnak, a kamera keretbe foglalja, a visszajátszás lejátssza, és megnyílnak a mérések.
5. Vigye az egeret a diagramokra, hogy minden autót arra a méterre mozgasson; a Shift+kattintás ott sorba állítja őket.

## Billentyűk {#keyboard}

Amíg a Versenyelemzés fül nyitva van:

| Billentyű | Teszi |
|---|---|
| **K** | lejátssza / szünetelteti a visszajátszást |
| **Home** | vissza a visszajátszás elejére |
| számbillentyűk | semmit (a hőtérképen módokat váltanak) |

A szövegmezőbe vagy legördülő menübe írt billentyűket figyelmen kívül hagyjuk. A kameragombok ugyanúgy működnek, mint a hőtérképen (**W A S D**, **Space** fel, **Q** le, **Shift** gyorsabb, **Alt** lassabb, az egérrel nézés; mind a [Kameránál](camera.md)); az **F** a betöltött köröket keretbe foglalja (ahogy a körök betöltése is).

## Sok kör {#many-laps}

- Minden betöltött kört elemzünk és megszámolunk; tucatnyi egy-két másodpercet vesz igénybe.
- A **8** kör (`SHOW_ALL_UP_TO`) fölött a hozzáadott körök csak akkor rajzolódnak, ha ők a referencia, a fókuszált kör, vagy a fókuszált kör osztályának legjobb köre. A *Összes megjelenítése* / *Csak a megnézettek* kapcsol.
- A **10** látható autó (`PLAIN_PAST`) fölött a nem megnézett köröket (nem a fókuszt, az üldözött autót vagy a referenciát) pontig ritkított vonalakkal rajzoljuk, 1,5 m helyett 6 méterenként, és egyszerű autókkal.
- A diagramok legfeljebb **8** kört rajzolnak; a HUD legfeljebb **6** kártyát mutat.
- A pályastatisztika **3** körtől jelenik meg.

Részletek: [Pályastatisztikák](race-course-statistics.md#performance-with-many-laps).

## Alapértelmezett nézetbeállítások {#default-view-settings}

| Beállítás | Alapérték |
|---|---|
| Térkép | Időtérkép |
| Megtett vonalak, Autók, Gumik és felfüggesztés, Feliratok, Pálya a körökből | be |
| Minden érték a kártyákon | ki |
| Autóméret | 1× |
| Diagramok | látszanak |
| Visszajátszási mód | A vonaltól |
| Visszajátszási sebesség | 1× |
| Ismétlés | be |

Ezek egyike sem mentődik; az újratöltés az alapértékekkel indít. A böngészőben megjegyzett dolgok: a nyelv és a körfájlokból megtanult autónevek (lásd [Körök betöltése](race-loading-laps.md#car-names)).

## Fejlesztőknek {#for-developers}

### Mi történik körök betöltésekor {#what-happens-when-laps-are-loaded}

A körök halmaza, a referencia vagy a nyelv bármely változásakor az egész elemzés újrafut (`analyse`, a [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts) fájlban):

1. Minden körhöz hozzáadjuk a származtatott csatornákat ott, ahol a játék nem küldi őket: sodródási szög, kerékcsúszás a kerékfordulatszámokból, levegőben, laza talajon, forgási sebesség ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. A referenciát kiválasztjuk, és minden kört rávetítünk az útvonalára, és 2 m-enként újramintavételezzük ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. A körökből kiderítjük, tükrözött-e a játék világa ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. A referencián kanyarokat találunk, és egy fékezési zónától a következőig szakaszokba csoportosítjuk őket ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Autónként: a burkolója (tapadás, fékezés, húzás sebességenként), a profilja, a gumigörbéi ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Körönként és szakaszonként: mit csinált (fékpont, legalacsonyabb pont, teljes gáz, ...) és a megtett vonal ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Körönként: az autóvezetési eseményei, mindegyik ott ahhoz a körhöz állítva, amellyel összehasonlítják.
8. Körönként és szakaszonként: az időmérleg az összehasonlító körhöz képest, és a megállapítás szavakban.
9. Körönként az időtérkép és az okok térképe.

A szövegek az aktuális nyelven készülnek; a nyelvváltás újra lefuttatja az elemzést (és átnevezi a demóköröket). Az elemzés hibáját a **Körök** gombok alatt hibaként mutatjuk, a körök betöltve maradnak.

### Forrásfájlok {#source-files}

| Fájl | Szerep |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | körfájlok olvasása |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | a körtípus, az elnevezés, a demókörök |
| `src/race/derive.ts`, `handedness.ts` | származtatott csatornák, tükrözött világok |
| `src/race/align.ts`, `segments.ts`, `line.ts` | távolságtengely, kanyarok, vonalak |
| `src/race/analysis.ts` | összehasonlított kanyarok, okok, megállapítások |
| `src/race/envelope.ts`, `profile.ts` | mit tud egy autó |
| `src/race/control.ts`, `impacts.ts` | autóirányítás, ütközések és balesetek |
| `src/race/stats.ts` | sok kör |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | visszajátszás és rajzolás |
| `src/race/schema.ts`, `graphs.ts` | a csatornatáblázat, a diagramok sorai |
| `src/ui/race/*` | az oldalsáv, a diagramok, a HUD, a feliratok |
| `src/state/raceStore.ts` | a fül állapota és a visszajátszás órája |
