---
title: "Autóprofilok és összehasonlítás"
parent: "Versenyelemzés"
nav_order: 56
lang: "hu"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Autóprofilok és összehasonlítás

Egy autó csak ilyen erősen tud fékezni, kanyarodni és gyorsulni. A nézegető a saját köreidből méri meg, hogy mennyire, így soha nem mond olyat, amit az autód nem tud megcsinálni. Ez azt is megmutatja, hogy egy elvesztett másodpercből mennyi volt az autó hibája, és mennyi a tiéd.

![Összehasonlított autók: két autó egymás mellett a tapadásával, fékezésével és húzóerejével](../assets/img/en/race-cars-compared.webp)

Az elemzés csak akkor mondja egy körnek, hogy erősebben fékezzen, több sebességet vigyen vagy korábban gyorsítson, ha az autója ezt már megmutatta. A veszteségből azt veszi ki, amit maguk az autók megmagyaráznak. Ezért minden autó határait (a *burkolóját*, lent) és jellemét (a *profilját*) a betöltött köreiből mérik. Ez az oldal a burkolóról, a profilról, az **Autók összehasonlítva** szakaszról és arról szól, hogy az autók mit döntenek el minden kanyarban.

**Egy autó** = azonos autószámú (vagy név szerinti, szám nélküli) és azonos teljesítményindexű körök. Más hangolás másik autó.

## A burkoló: mit tud az autó minden sebességnél {#the-envelope-what-the-car-can-do-at-each-speed}

Autónként, a betöltött köreiből, **5 m/s-os sebességsávokban** (24 sáv, legfeljebb 120 m/s-ig). A levegőben lévő mintákat, a landolás utáni 0,3 másodpercig stabilizálódókat, és minden ütés előtt 0,1 másodperctől az ütés után 1 másodpercig tartókat kihagyják. A 80 m/s² vagy annál nagyobb gyorsulásokat figyelmen kívül hagyják (ez felette van annak, amit bármely légterhelt autó elbír).

| Burkoló | Minták | Érték sávonként | Kell |
|---|---|---|---|
| **oldalirányú tapadás** | az oldalirányú gyorsulás, amelyet **fél másodpercig tartott** (az abszolút értékének átlaga egy középre igazított 0,5 másodperces ablakon), csak ahol az autó kanyarodott: legalább a teljes körének 99. percentilisének egyharmada | 95. percentilis | 6 minta |
| **fékezés** | fék > 0,3; a hosszirányú gyorsulás a minta és két szomszédja mediánjaként | a lassulás 95. percentilise | 4 minta |
| **teljes gázos húzóerő** | gáz > 0,95, fék 0,05 alatt; ugyanaz a három-medián | 90. percentilis | 4 minta |

Miért fél másodpercig tartva: egy szegélykő, egy visszacsapó csúszás, egy elkapott autó mind egy pillanatra megugrasztja az oldalirányú gyorsulást, és az autó, amely ezt gyakran csinálja, tapadósabbnak látszott, mint valójában. Miért három-medián: öt méteres távolságnál egy minta nagy távolság, és egy egyetlen mintás csúcs szegélykő, egyenetlenség vagy fal.

Egy sebességnél a burkolót a sávközéppontok között interpolálják. Egy üres sávnál a legközelebbi adatos sávot veszik.

**Két talajfajtán.** Ha egy autó köreiben a minták legalább egyötödét aszfalton, és egyötödét laza talajon hajtották, külön burkolót tartanak mindkettőre. Minden kanyart az autó alatti talajjal ítélnek meg a leglassabb pontján.

**Átmenet.** Az a sebesség, ahonnan a húzóerő `1/v` szerint esik (teljesítménykorlátos), nem pedig lapos marad (tapadáskorlátos). Ez az első sáv, amelynek `a·v` értéke a látott legnagyobb `a·v` 15%-án belül van.

## A profil: milyen autó {#the-profile-what-kind-of-car-it-is}

A `profile` ugyanazokból a körökből készül (a földön lévő, nem ütött minták, 8 m/s-nál gyorsabbak):

| Mérőszám | Hogyan |
|---|---|
| **tartott tapadás** (m/s²) | a fél másodpercig tartott oldalirányú gyorsulás 95. percentilise |
| **húzás** 50 km/h-ig, 50–120, 120–200, 200 felett (m/s²) | a burkoló teljes gázos húzóerejének átlaga 3–14, 14–33, 33–56 és 56–90 m/s-nál, azokon a sebességeken, amelyeket az autó elért (legfeljebb a leggyorsabb + 2 m/s), legalább három 1 m/s-os lépésből; és a legnagyobb, amit mutatott, és hol |
| **fékezés** (m/s²) | a burkoló fékezése átlagolva 60–160 km/h között (16,7–44,4 m/s), az a sáv, amelyet az összehasonlítás megnevez |
| **leggyorsabb** | a legnagyobb sebesség, amelyet elért |
| **ahol elérte a csúcsot** | ahol teljes gázon, egyenesen megállt a gyorsulása (lent) |
| **még húz a leggyorsabb sebességénél** | a burkoló húzóereje a leggyorsabb sebességén: mennyi volt még hátra |
| **hátsó elkapva, körönként** | hányszor csúszott meg egy körön, és kellett elkapni (lent) |
| **részesedés a gázon** | ezek közül az a rész, amely gázzal > 0,5 és fék nélkül kezdődött |
| **enged** | az oldalirányú tartott gyorsulás mediánja 0,15 másodperccel minden csúszás kezdete előtt, a tapadás részesedéseként |
| **10°-on túli drift, kemény kanyarodásnál** | a legalább a tapadása 60%-ával kanyarodó minták közül az a rész, amely csúszik (10° aszfalton, 20° laza talajon); 30 minta kell |
| **mediándrift** | ugyanazokon a mintákon |
| **egyensúly** | első mínusz hátsó csúszási szög (a névleges csúcs többszörösei), ahol kemény kanyarodás van és nem csúszik, legalább 30 minta átlaga: + kifelé tol |
| **felület** | 80% fölött laza mintán: laza; 20% alatt: aszfalt; különben vegyes |

**Elérte a csúcsot.** Egy minta akkor számít, ha a körülötte lévő másodperc (±0,5 s, legalább 0,9 másodpercnyi adattal) végig teljes gázon volt (> 0,95, fék nélkül), a földön, **egyenesen** hajtva (|oldalirányú| a 4 m/s² és a tapadása negyedének nagyobbika alatt), 0,35 m/s²-nál kevesebbet gyorsulva, 25 m/s-nál gyorsabban, és a kör leggyorsabb sebességének 90%-án belül. Teljes gázon egy domb felfelé vagy egy hosszú kanyaron át szintén megáll a gyorsulás, jóval az autó csúcssebessége alatt. Ha az összes körön legalább **egy másodperc** ilyen fennsík van, ezeknek a sebességeknek a mediánja az a sebesség, ahol az autó eléri a csúcsot. Különben nincs csúcssebesség: ahol nem volt elég hosszú egyenes, a *még húz a leggyorsabb sebességénél* megmondja, mennyivel maradt el. Nem tippelünk a körök által mutatottakon túl: a fogaskerekezés és a sebességkorlátozó jóval a légellenállás előtt véget vet egy autó húzásának.

**A hátsó elengedése.** Ott számolva, ahol a versenyzőnek el kellett kapnia: a tapadása 60%-án vagy annál erősebben kanyarodva csúszva (10° fölötti drift aszfalton, 20° laza talajon), a kormány (0,06 fölött) a kanyar **ellen** fordítva. Hogy a kormány melyik előjele egyezik a kanyarerő melyik előjelével, körönként mérik (csúszás nélkül kanyarodó minták). Egy csúszás egyszer számít, amíg az autó meg nem áll a csúszásban. Aki szándékosan kicsit oldalt fordítja az autót, az nem veszít semmit; aki ellenkormányt igényel, az igen. Minden autóra ugyanúgy számolva, így két autó összehasonlítható. Kormány és driftszög kell hozzá.

## Autók összehasonlítva {#cars-compared}

Az oldalsáv szakasza **Az autó**, ha egy autó van, és **Autók összehasonlítva**, ha több.

**A táblázat**: autónként egy oszlop, soronként egy mérőszám, amelyre bármelyik autónak van értéke: tartott tapadás; húzás 50 km/h-ig, 50–120, 120–200, 200 felett; fékezés; leggyorsabb; ahol elérte a csúcsot („még húz”, ha sosem érte el); még húz a leggyorsabb sebességénél; hátsó elkapva, körönként; 10°-on túli drift kemény kanyarodásnál. Ahol az autók 3%-nál jobban különböznek, a jobb érték meg van jelölve: a tapadásnál, húzásnál, fékezésnél és sebességeknél a magasabb, a hátsó csúszásoknál az alacsonyabb.

**Egyetlen autó**: mondatok arról, amit a körök mutatnak róla. A tartott tapadása (m/s² és g), húzása minden sávban, ahol abbahagyta a gyorsulást a hosszú egyeneseken (vagy hogy sosem érte el a csúcsot, és mennyit húzott még a leggyorsabb sebességénél), és hogy milyen gyakran kellett elkapni a hátsóját: „alig valaha”, ha körönként egynél kevesebb, „főleg a gázon”, ha 60% vagy több ott kezdődött.

**Két autó**: párokként egy-egy mondat arról, mi az egyik autó a másikhoz képest („X jobban gyorsul, de nem tud olyan erősen kanyarodni, tovább tart megállnia, és könnyebben veszíti el a hátsóját”), a táblázat, minden egyértelmű különbség a legnagyobbal kezdve, majd **Hogyan vezesd az egyes autókat**. Több mint **3** párnál egy pár látszik: a kiválasztott kör autója a legördülő listából választott autóval szemben. Alapból az osztályán belüli legjobb kör autója, különben a referencia autója, különben az első másik.

Különbséget csak akkor mondunk ki, ha a körök egyértelműen mutatják:

| Különbség | Ettől mondjuk | Mondat |
|---|---|---|
| tapadás | **4%** | „X N%-kal több tapadást tart a kanyarokban … ez M%-kal több sebesség minden kanyar közepén” (a sebesség a tapadásarány négyzetgyöke) |
| húzás | **5%**, az első sávban, amelyet mindkét autó megvan: 120–200, 50–120, 200 km/h felett | „X M%-kal erősebben gyorsul 120-tól 200 km/h-ig”; a rajtnál is, vagy „bár Y erősebben indul”, ha a rajt 8%-kal különbözik |
| csúcssebesség | **4 km/h** | „X magasabbra jut: ott állt meg a gyorsulása …” |
| csúcssebesség, csak az egyik | az egyik autó elérte a csúcsot, a másik nem | „Y ott fogyott ki a húzásból: …; X még gyorsult, amikor fékezett” |
| csúcssebesség, egyik sem | egyik sem érte el | mindkettő még milyen sebességnél gyorsult a leggyorsabb sebességén |
| fékezés | **5%** | „X N%-kal erősebben fékez … Y korábban kell fékezzen” |
| hátsó elvesztése | körönként legalább egyszer több **és** másfélszer olyan gyakran | „X könnyebben veszíti el a hátsóját: olyan messze csúszik ki, hogy körönként N-szer ellenkormányt igényel, M-mel szemben …”. Főleg a gázon (60%+), vagy főleg befordulva és elengedve (30% vagy kevesebb), a tapadása kb. P%-ától. Laza talajon: „ebből némi az, ahogy az autót fordítják; az elkapás nem az” |
| oldalazás | **12 százalékpont** a kemény kanyarodás driftküszöb feletti részében | „X jobban oldalt fut a határon” |
| első egyensúly | **0,3** a névleges csúcsból | „X jobban tol elöl … lassítani és befordulni kell a csúcs előtt” |

Az összefoglalóban szereplő jellemzők: *több tapadást tart* / *nem tud olyan erősen kanyarodni*, *jobban gyorsul* / *kevesebbet húz*, *magasabbra jut* / *alacsonyabbra jut*, *még húz az egyenesek végén* / *kifogy a húzásból*, *erősebben fékez* / *tovább tart megállnia*, *stabilabb* / *könnyebben veszíti el a hátsóját* (*sokkal csúszósabb …*, ha kétszer olyan gyakran, plusz egy; *gyakrabban kell elkapni* laza talajon), *elöl tol*. „Alig van mit megkülönböztetni Y-tól ezeken a köreken”, ha nincs különbség.

**Hogyan vezesd az egyes autókat:**

- az egyik autó jobban tapad, a másik többet húz: a tapadósabbal sebességet vigyél a kanyar közepére széles, kerek vonalon (a „U”); az erősebbel fékezz egyenesen, a rövid, szoros közepén fordulj, és a kijáratnál egyenesíts (a „V”);
- az egyik autó mindkettőben gyengébb: a legjobb köre a legtisztább – fékezz egyenesen, a legszélesebb sugárral, és teljes gázt a lehető legkorábban, ahogy az tartja;
- egy autó, amely könnyebben veszíti el a hátsóját: a gázt csak akkor add rá, ahogy a kormány visszatekeredik, és rövid fokozatokban válts (csúszások a gázon), vagy engedd lassan a féket, és tarts állandó gázt a közepén (csúszások belépéskor).

A szakasz alatti tipp megismétli, hogyan mérik mindegyiket.

## Amit az autók eldöntenek egy kanyarban {#what-the-cars-decide-in-a-corner}

Ha a körök különböző autókban vannak, minden elvesztett kanyar megállapításának végén van egy **Az autók:** rész. Ebben az látszik, mit döntenek el az autók, és hogyan hozd ki a legtöbbet ebből az autóból (`carNote`):

- **Középen keresztül**, ha ez az autó a másik tapadásának 96%-a alatt tartja, a másik több mint 0,5 m/s-mal gyorsabb volt a leglassabb pontján, és ez a kör nem maradt messze attól, amit a tapadása megmagyaráz (az annak 70%-a fölött). A másik autó vonalán ez az autó tapadása `v_másik · √(tapadás_enyém / tapadás_másik)` sebességet enged. Ha a kör ezt vitte (1 m/s-on belül), a különbség az autó, és semmilyen fékezési pont nem változtatja meg. Ha kevesebbet vitt, akkor mennyi van még megnyerhető. Ezután hol nyerhető meg az idő: egy egyenesen, kettő között, vagy egy olyan autóban, amely 5%-kal erősebben húz. A csúcs után: egyenesen fékezz, később kanyarodj be, és korán a kijárat felé irányíts. Különben a legszélesebb sugár, amelyet az út enged.
- **Egy hátsó, amely itt elengedett** (egy meg nem osztott csúszás vagy megpördülés, vagy egy drift a csúszási küszöb fölött a belépésnél), olyan autóban, amely körönként legalább egyszer, másfélszer olyan gyakran veszíti el: mit tegyél ebben az autóban. A gázt a kormány visszatekerésekor add rá (csúszásai az idő 60%-ában vagy annál többször gázon kezdődnek), vagy engedd lazán a féket, gázelengedés nélkül.
- **Az utána következő egyenes**: ha az autók húzása 0,03 másodperc vagy annál több különbséget magyarázott, a másik autó erősebb húzása ugyanabból a sebességből, mindkét autó húzásával 120-tól 200 km/h-ig.
- **Csúcssebesség**: ha ez a kör a csúcs 98%-át érte el ott, ahol az autó egy 150 m-nél hosszabb egyenesen megáll, és a másik 1,5 m/s-mal gyorsabban ment: ez az autó csúcssebessége. Minden további km/h, amelyet a kanyarból kihozol, segít, amíg oda nem érsz.
- **Fékezés**: ha a másik autó 5%-kal erősebben fékez, és ez a kör 5 m-nél korábban fékezett, akkor a korábbi fékezés egy része az autóé.

Az autó részesedését magából az időből is kivonják (lásd: [az autó részesedése](race-corner-analysis.md#the-cars-share)). Ahol az autó a kanyar 60% vagy annál többjét magyarázza, azt az autónak tulajdonítják.

## Fejlesztőknek {#for-developers}

Kód: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
a `carNote` a [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts) fájlban,
a `CarsSection` a [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx) fájlban.
