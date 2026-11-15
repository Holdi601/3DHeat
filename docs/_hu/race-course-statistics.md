---
title: "Pályastatisztikák"
parent: "Versenyelemzés"
nav_order: 57
lang: "hu"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Pályastatisztika

Egy pálya sok körét betöltve a megjelenítő megszámolja a hibákat: melyik kanyar veszi el a legtöbb időt, hány körben csúszott el ott a vezetés, és miért. Ezzel találhatod meg azt a kanyart, amelyet érdemes gyakorolni.

Próbáld ki: a **Demókörök** három kört ad. Ez elég ahhoz, hogy ez a szakasz megjelenjen.

![Pályastatisztika a hibatérképpel: a pálya színezve aszerint, hány kör vesztett időt az egyes kanyarokban, és a kanyarok listája](../assets/img/en/race-course-mistake-map.webp)

Egy pálya teljes mappáját töltsd be – több tucat kört, több autót, több teljesítményosztályt –, és minden kört megítélünk, majd megszámolunk. Ez az oldal az osztályok szerinti összehasonlítást, a hiba fogalmát, a **Pályastatisztika** szakaszt, a hibatérképet, a hőtérkép-exportot, a több pályából álló adatokat és a teljesítménykorlátokat tárgyalja sok körnél.

## A saját osztályának legjobbjával szemben {#against-the-best-of-its-own-class}

Minden kört kanyarról kanyarra hasonlítunk össze a **saját teljesítményosztályának leggyorsabb teljes körével** (ez a referencia, a referencia osztályában). Maga a referenciakör a saját osztályának azzal az autóval hasonlítható össze, amelyik az adott kanyarban a leggyorsabb volt az osztályából – vagy, ha egyedül van az osztályában, az összes kör közül. Az autókat a játék teljesítményosztálya szerint csoportosítjuk (a Forzában D-től X-ig; a C és az S2 ezek közül kettő). Egy C-osztályú autó fékezési pontja egy S2-es autóéhoz képest nem mond semmit a vezetésről. Az időtérkép, a körlista időkülönbségei és a *Kanyarról kanyarra* táblázat ugyanezt az összehasonlítást követi (lásd: [kinek a körével hasonlítjuk össze az egyes köröket](race-corner-analysis.md#who-each-lap-is-compared-with)).

A statisztika minden kör elemzésére épül, nem mellette futó külön számításra.

## Mit számít hibának {#what-counts-as-a-mistake}

Egy **előfordulás** egy kör egy hibája egy kanyarban (szakaszban). Egy kör hibái egy kanyarban:

1. **Az elemzés által ott talált vezetési ok** a veszteségére – olyan megállapítás, amely veszteség, és a sofőrnek tulajdonítható (nem az autónak vagy a helyzetnek) –, és az összehasonlító körhöz képest **0,05 s** vagy több. Költsége a kanyar vesztesége.
2. **Minden autóirányítási hiba**, amelyet ott elkövetett, és amelyet a másik kör nem (nem közös), és amely **0,03 s** vagy több: blokkolás, kerékcsúszás, a hátsó kicsúszása, tolódás, pörgés. Költsége az esemény saját költsége.
3. **Minden találat és ütközés**, közös vagy nem közös, bármennyibe került.

Egy kanyarban több is lehet; minden fajtát **körönként és kanyaronként egyszer** számolunk. A nyereség, az autó részesedése és a korábbi kanyarban történt lassabb érkezés nem hiba.

### A megállapításoktól a hibákig {#from-findings-to-mistakes}

| Megállapítás | Hiba |
|---|---|
| túl gyorsan ment be, lassan jött ki, mert néhány méterrel később fékezett, mint a másik | Későn fékezett |
| korán fékezett | Korán fékezett |
| enyhén fékezett | Túl enyhén fékezett |
| blokkolás volt az ok | Blokkolt egy kereket |
| gurult | Gurult |
| tapadás maradt, lassabb a csúcsig, a másik csak engedett, ő fékezett | Túl lassú a közepén |
| túl szoros vonal | Túl szoros vonal |
| kitolódott | Kitolódott |
| az autót kevesebbet vagy túl sokat fordította | Rosszul fordította az autót |
| később adott gázt, később nyomta le teljesen a gázt, habozott | Későn adott gázt |
| lassabban jött ki a kanyarból | Lassabban jött ki |
| kerékcsúszás | Kerékcsúszás |
| a hátsó kicsúszott, oldalt a középen | A hátsó kicsúszott |
| túl szélesre ment | Túl szélesre ment |
| sebességet vesztett | Sebességet vesztett |
| engedett (a belépésnél vagy az egyenesen) | Engedett |
| közel megállás, pörgés, találat vagy ütközés volt az ok | Megpördült / Nekiment valaminek / Balesetet szenvedett, ha a kör eseményei ott ezt mutatják (először a baleset, aztán a pörgés, aztán a találat); egyébként Majdnem megállt |
| hosszabb repülés | Túl messzire repült |

A két mintát az ott talált ok szerint számoljuk, ugyanezzel a táblázattal. *Több sebességet adott fel a belépésnél, mint amennyit a kijárat visszahozott* a bejegyzése okának hibája: a korai fékezés *Korán fékezett*, a blokkolás *Blokkolt egy kereket*, a gurulás *Gurult*, a ki nem használt tapadás *Túl lassú a közepén*. A *Túl gyorsan be, lassan ki* *Későn fékezett*, ha a kör későbben fékezett, mint a másik; egyébként a kijárat okának hibája: *Későn adott gázt*, *Kerékcsúszás*, *A hátsó kicsúszott*, *Túl szélesre ment*, *Lassabban jött ki*. Az olyan mintát, amelynek oka az autóé, vagy lassabb érkezés, nem számoljuk.

Nem számít: a lassabb érkezés, a rajt, és minden *autó*-megállapítás (húzás, tapadás, fékek, hajtás), valamint minden nyereség vagy egyszerű kanyar.

### A fajták sorrendje {#the-kinds-in-their-order}

Fékezés: *Későn fékezett*, *Korán fékezett*, *Túl enyhén fékezett*, *Blokkolt egy kereket*. Belépés: *Gurult*, *Túl lassú a közepén*, *Túl szoros vonal*, *Kitolódott*, *Rosszul fordította az autót*. Kijárat: *Későn adott gázt*, *Lassabban jött ki*, *Kerékcsúszás*, *A hátsó kicsúszott*, *Túl szélesre ment*, *Sebességet vesztett*. Egyenes: *Engedett*. Események: *Megpördült*, *Nekiment valaminek*, *Balesetet szenvedett*, *Majdnem megállt*, *Túl messzire repült*.

## A Pályastatisztika szakasz {#the-course-statistics-section}

**3** körtől látszik, a **Körök** és a **Hol lehet javítani** között.

- **Az összefoglaló**: „40 kör 9 autóval, 3 osztályban: minden kanyar a saját osztályának leggyorsabb körével összevetve." (az autókat rajtszámuk vagy nevük szerint számoljuk).
- **Osztálycímkék** (több osztály esetén): **Mind** és osztályonként egy címke, mindegyik a körszámával, a játék sorrendjében (D, C, B, A, S1, S2, R, X, majd a többi). Egy osztályra kattintva csak annak a köreit látod; a **Shift+kattintás** hozzáad vagy eltávolít egyet. Minden, ami alább van – a listák, a térkép, a hőtérkép-export –, a kiválasztott osztályokat követi.
- **Mi megy félre a leggyakrabban**: minden hibafajta, a legtöbb körrel elöl (aztán a legtöbb alkalommal, aztán a legnagyobb költség szerint), legfeljebb 8. A **Mind N fajta** mutatja a többit, a **Kevesebb** újra elrejti őket. Minden sorban: a neve, „N a M körből", egy sáv ennek a résznek, és „K alkalommal · kb. X s · legtöbbször T3 (5), T7 (4), T1 (2)" – hányszor fordult elő (körönként és kanyaronként), mennyibe került összesen, és a három kanyar, ahol a legtöbb kör elkövette. **Kattints egy sorra**, hogy megjelenjen a hibatérképen (és a térkép bekapcsoljon); újabb kattintás: minden hiba.
- **Kanyarról kanyarra** (vagy *Kanyarról kanyarra – <hiba>*, ha egyet kiválasztottál): szakaszonként „N a M körből vesztett időt · X s" – azok a körök, amelyek az egész kanyart megtették, azok, amelyek ott **0,05 s** vagy többet vesztettek az osztályuk legjobbjához képest, és az összes elvesztett idő. Összecsukva a három leggyakoribb hibát mutatja a körszámukkal. **Kattints egy kanyarra**, hogy megnyisd, a kamerával képkockába vedd, és a hibatérképre válts: minden hibára (vagy csak a kiválasztottra) egy ilyen sor: „12 a 40 körből itt korán fékezett. 9 különböző autóval – körülbelül 0,21 s-onként.", és a hibát elkövető körök, **a legrosszabbal elöl**, mindegyik a költségével – legfeljebb 8, a többit „+N további" jelzi. **Kattints egy körre**, hogy kiemeld, és játszd vissza azt a hibát (40 m-rel előtte összeigazítva).
- **Megjelenítés a hőtérképen**: lásd lent. „Hőtérkép készítése…" amíg fut; hibák nélkül letiltva.

## A hibatérkép {#the-mistake-map}

**Nézet → Hibatérkép** a referenciaúton festi be, hány kör (a kiválasztott osztályokból) hibázott minden méteren – minden fajtából, vagy a statisztikában kiválasztott egyből. Minden kör egyszer számít méterenként. Minden előfordulás hatótávolsága (ahol az oka vagy eseménye volt) mindkét oldalán 6 m-rel szélesebb, hogy a rövid is látszódjon. Szélesebb és fényesebb ott, ahol több kör volt: a szélesség `3 + 10 · (körök itt / a legtöbb kör bárhol)` méter, a szín a halvány barnától a fényes narancsig; szürke, 2 m-es csík ott, ahol senki sem hibázott. Jelmagyarázat: *kevés kör ↔ a legtöbb kör*.

A **Feliratok** bekapcsolásakor minden kanyar csúcsán ott áll a leggyakoribb hibája: „T3 · 12/40 korai fékezés" (a hibázó körök / a kanyart megtett körök), „T3 · 12/40" egy kiválasztott fajtánál, „T3 · tiszta", ha nincs hiba. A címke fölé húzva a kanyar veszteségei és az öt leggyakoribb hibája látszik; rákattintva a kanyar a statisztikában megnyílik, vagy bezárul.

## Megjelenítés a hőtérképen {#show-in-the-heatmap}

A **Megjelenítés a hőtérképen** ugyanezt átadja a hőtérkép fülnek, „Hibák itt: <pálya>" (vagy „Hibák a pályán") nevű adatkészletként. Így a hőtérkép teljes eszköztára – hőmódok, szűrők, idővonal, szeletelés – azon működik, hol hibáznak a körök.

Ez memóriában épített CSV (`mistakeTable`), egy sor minden rácspontra (2 méterenként), minden előfordulásnál, a **kör saját pozíciójában** azon a helyen:

| Oszlop | Tartalom |
|---|---|
| `x`, `y`, `z` | a kör pozíciója azon a méteren (játékkoordináták) |
| `elapsed` | a kör ideje ott, másodpercben |
| `lap` | a kör címkéje |
| `car` | az autó neve (vagy „autó 1234") |
| `mistake` | a hiba neve az aktuális nyelven |
| `car_class` | az osztály, `-`, ha nincs |
| `corner` | a kanyar címkéje, `T3` |
| `cost` | az előfordulás költsége, másodpercben |

A hőtérkép saját betöltőjén keresztül töltjük be, leképezési tippekkel: Y felfelé, nincs tengelycsere, méretarány 1; az idő `elapsed` másodpercben; **személy** = `car`, **csoport** = `mistake`, **munkamenet** = `lap`; nincs nézési irány; a `car_class`, `corner` és `cost` szűrőoszlopként marad meg. A fül ezután a **Hőtérkép** lapra vált, és keretbe foglalja az adatot. Csak a statisztikában kiválasztott osztályok kerülnek exportálásra.

## Több pályából álló körök {#courses-from-several-tracks}

A köröket **egyszerre egy pályán** elemezzük. Egy mappa, amely több pálya köreit tartalmazza – a teljes körkönyvtár –, minden pályát külön ajánl betöltésre (a körszámával, a legtöbbel elöl). A be nem fejezett futamok körei (az FH Companion `unfinished/` mappája) a pályájukhoz kerülnek, *részleges* jelzéssel. Több megnevezett pálya köre, fájlként kiválasztva, ugyanígy ajánlódik fel. A pályát nem nevező körök ahhoz a pályához kerülnek, amelyik ki van választva. Egy másik megnevezett pálya köreinek betöltése a már betöltötteket cseréli le. Részletek: [Körök betöltése](race-loading-laps.md#folders-and-courses).

## Teljesítmény sok körrel {#performance-with-many-laps}

Több tucat kört egy-két másodperc alatt elemzünk (mindig mindet). Ami ki van rajzolva, az korlátozott, hogy a nézet képkockasebességen maradjon:

| Korlát | Érték | Hatás |
|---|---|---|
| alapértelmezetten rajzolt körök | 8 (`SHOW_ALL_UP_TO`) | 8 betöltött kör felett az újonnan hozzáadott körök rejtve maradnak, hacsak nem a referencia, a kiemelt kör vagy az osztályuk legjobbja. Az **Összes megjelenítése** minden kört kirajzol; a **Csak a vizsgáltak** visszaáll. Egy kör kiemelése megjeleníti azt, és az osztálya legjobbját |
| egyszerű autók és vékony vonalak | 10 látható felett (`PLAIN_PAST`) | a kiemelttől, a követett autótól és a referenciától eltérő körök: 6 m-enként egy vonalpont (1,5 m helyett), az autók egyszerű rajzban |
| diagramozott körök | 8 (`CHART_LAPS`) | a kiemelt, az osztályuk legjobbja és a referencia először; „+N további kirajzolva, nem diagramozva" |
| HUD-kártyák | 6 | az első hat látható kör |
| statisztika | 3 körtől | a szakasz e alatt rejtve |
| felsorolt megállapítások | 12 vezetési, 8 autó/környezeti, 10 nyereség | kiemelt körönként |
| megjelenített autópárok | 3 | 3 pár felett egy pár, választóval |

A hibaelőfordulásokat elemzésenként egyszer számoljuk ki és gyorsítótárazzuk. A hibatérkép sűrűségét osztálykiválasztásonként és hibánként tároljuk gyorsítótárban.

## Fejlesztőknek {#for-developers}

Kód: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` a [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) fájlban.
