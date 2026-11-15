---
title: "Tömegelemzés"
nav_order: 8
lang: "hu"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Tömeges elemzés: ezer meccs egyszerre

A **Tömeges elemzés** megmutatja, mivé áll össze egy egész mappányi meccs: melyik jármű nyer a legtöbbet, melyik oldal kedvezőbb, hol van a lényeg. Akkor használd, ha sokkal több meccsed van, mint amennyit meg tudnál nézni.

Minden meccs egy kis összefoglalójából dolgozik, így ezer vagy tízezer meccs gyorsan megnyílik. A teljes sorokat csak a kattintott meccsekhez tölti be.

## Próbáld ki {#try-it}

1. Nyisd meg a **Tömeges elemzést** a Hőtérkép oldalsávjában.
2. Nyomd meg a **Mappa…** (vagy a **Fájlok…**) gombot, és válaszd ki a `.3dheat` meccseidet.
3. Várj, amíg a panel beolvassa az összefoglalókat („Összefoglalók… n / N”).
4. Nyomd meg az **Elemzés megnyitása** gombot. Egy ablak nyílik, füllekkel.
5. Állítsd be a szűrőket (Játék, Térkép, Mód, Honnan, Hová), majd olvass el egy fület, például az Egyensúlyt.
6. Kattints egy sorra, egy cellára vagy egy felismerésre: a hozzá tartozó meccsek betöltődnek a 3D nézetbe, a kamera a helyen áll.

![Az Egyensúly fül: a győzelmi arány és az ölés halálonként jármű szerint](../assets/img/en/mass-balance.webp)

```
mappa .3dheat fájlokkal -> összefoglalók -> ablak (fülek) -> kattintás egy sorra -> meccsek megnyílnak 3D-ben
```

Egy `.3dheat` fájl egy meccs ([Egy fájl meccsenként](container.md)). A *hőtérkép* és a *sor* fogalmát a [szószedet](glossary.md) magyarázza.

## Az összefoglalók megszerzése {#getting-the-summaries}

A legtöbb embernek nincs teendője: a panel maga számolja ki a hiányzó összefoglalókat. Ha egy nagy mappát egyszer előre akarsz felkészíteni, használd az alábbi offline eszközt.

Minden `.3dheat` meccs kap egy összefoglalót (`src/mass/summarize.ts`), amelyet a konténerben tárol a `<match>.summary.json` tag (szerep: `summary`, lásd: [Egy fájl meccsenként](container.md)). Az offline eszköz ezeket írja meg, és mappánként egy indexet. Fejlesztői eszköz; egy nagy mappán futtasd, hogy a panelnek ne kelljen dolgoznia:

```
node tools/3dheat-summarize.mjs <mappa>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Az a meccs, amely már össze van foglalva (ugyanaz a formátumverzió), csak olvasásra kerül; a `--force` újra kiszámolja. A `--no-write` nem nyúl a konténerekhez.
- Az a fájl, amely az utolsó `--settle` percben (10) változott, kimarad: egy konverter még írhatja.
- `<mappa>/3dheat-index.jsonl.gz`: meccsenként egy sor – az elérési útja, mérete, ideje és az összefoglalója a rács nélkül. `<mappa>/3dheat-index.grids.jsonl.gz`: meccsenként egy sor a rácsával együtt.
- Azon a gépen futtasd, amelyen a fájlok vannak, alacsony prioritással (például `nice -n 19 ionice -c3` Linuxon).

A panel meccsenként ebben a sorrendben vesz valamit: a mappa indexének sorát (ugyanaz az elérési út és méret), a böngésző gyorsítótárát (IndexedDB, név, méret és idő szerint), a konténer `summary` tagját, vagy egy összefoglalót, amelyet munkásokból álló készletben számolnak ki, és elmentenek. Így index nélküli mappa is működik: először a táblázatok olvasásának sebességével, utána a gyorsítótárból.

## A panel {#the-panel}

Válassz egy mappát (vagy fájlokat; a **Mappa hozzáadása…** egy másikat csatol). Az ablak szűrői: **Játék**, **Térkép**, **Mód**, **Honnan** és **Hová**. Van egy **Felosztás eszerint** választó, a **Legkevesebb élet** és a **Csak játékosok** kapcsoló, és ezek a fülek. Minden szám az összefoglalókból jön. A sorra, cellára vagy felismerésre kattintás betölti a hozzá tartozó meccseket a nézetbe, mint a sok meccses átfedést, a szűrőkkel, amelyek megmutatják (jármű, osztály, fegyver, csapat, játékos), és a kamera a helyen áll:

| Fül | Mit mutat |
|---|---|
| Áttekintés | meccsek, órák, játékosok, életek, sorok, dátumok; meccsek naponta; játék, térkép és mód szerint; eseményösszesítők; a gazdaság pénznemenként; mikor történik valami a meccsen |
| Egyensúly | jármű, osztály, fegyver vagy csapat szerint, felosztva térkép, mód, szint vagy játék szerint: K/D a ~95%-os intervallumával, győzelmi arány (Wilson), túlélés, ölések és találatok percenként, kereset percenként, valamint q – a K/D és a győzelem Benjamini–Hochberg-féle hamis felfedezési aránya a felosztás többi részéhez képest. A **Legkevesebb élet** elrejti a túl kevés élettel rendelkező sorokat, amelyekben nem lehet megbízni; a **Csak játékosok** kihagyja, amit a küldetés MI-je vezetett |
| Trendek | a felhasználás (a jelenlét aránya), a K/D vagy a győzelmi arány a legjobb járműveknél vagy osztályoknál naponta, hetente vagy havonta |
| Játékosok | különböző játékosok, meccsek játékosonként, játékosok meccsenként, a leggyakoribb játékosok |
| Oldalak | minden térkép minden oldala: a megnyert meccsek egyenlő megoszláshoz mérve |
| Közelharc | köradatok: nyitópárbajok oldal szerint és azok konverziója, cserék, lesben álló és őrző, kereszttüzek, elvakított belépések, célzás, lerakások, emberelőny; és a **Térkép szerint** a helyek, amelyek megölik a bejutó játékosokat – mindegyik arányként a Wilson-intervallumával, az összefoglalók `cqb` számlálóiból ([Közelharc és körök](close-quarters.md)) |
| R6 felületek | a Rainbow Six Siege nyomai a pályán (golyónyomok és hasonlók) pályafelületenként: nyomok, a térkép körönként, a szoba, azok aránya, amelyeknek a lövőjét kikövetkeztették; egy kattintás megnyitja a nyomfajtákat, a lövők operátorait és fegyverosztályait, és azt, hol vannak a nyomok a felületen (egy kis hőtérkép negyedméteres cellákból); egy felület megtartja az azonosítóját egy térképváltozat meccsei között. Az összefoglalók `marks` számlálóiból |
| Térkép | egy térkép összegzett rácsa: jelenlét, ölések, halálok, K/D, bármely esemény, áramlás, és **forró hány meccsben** (stabilitás); csapat szerint, a cella 1-, 2-, 4- vagy 8-szorosával |
| Helyek | azok a helyek, amelyek a számokban kiemelkednek, de a hőtérképen nem (egy nagy terület, amely egészében forgalmas, folyosók, magassági sávok), és azok a helyek, amelyek tartói több vagy kevesebb kört nyernek meg; **Helyek keresése** |
| Fülkék | olyan csoportok, amelyek jelentősen jobban vagy rosszabbul teljesítenek a többinél (egy jármű egy térképen, egy szektor egy magasságon), és olyan körcsoportok, amelyeket többször nyertek meg, mint ahányat az oldaluk ugyanazokban a meccsekben; **Fülkék keresése** |
| Felismerések | a tömeges detektorok és a térképdetektorok (lent); a **Jelentés másolása (JSON)** azt a JSON-t adja, amelyet egy nyelvi modell olvas |

## Felismerések sok meccsen át {#insights-over-many-matches}

A **Helyek** fül azokat a helyeket találja meg, amelyek a számokban kiemelkednek, de a hőtérképen nem: egy nagy területet, amely egészében forgalmas, egy folyosót, egy magassági sávot, egy helyet, amely csak a meccs egy részében forgalmas. Azokat, amelyeket a sima hőtérkép nem mutat, **rejtettként** jelöli meg, és körvonalat ad nekik a 3D nézetben. A **Betöltés** oda repül a meccsekkel, amelyeket tartott. A **Fülkék** fül olyan csoportokat talál (egy jármű egy térképen és oldalon, egy szektor egy magasságon), amelyek jelentősen jobban vagy rosszabbul teljesítenek a többinél; kattints egyre, hogy lásd a finomításait.

### Ki nyert {#who-won}

Ha a meccsek megmondják, ki nyerte az egyes köröket (a `won` [eredményoszlop](data-formats.md#outcome-columns)), az eredmény önálló cél lesz:

- **Helyek: győzelmi arány.** Minden oldalra: egy helyen töltött köreinek hányadát nyerte meg, szemben azzal, amennyit ugyanabban a meccsben bárhol nyert – így a térkép, az oldal és maga a meccs egyensúlya az alap, és csak azok a helyek emelkednek ki, amelyek tartói több (vagy kevesebb) kört nyernek meg. Egy kitalált példa: *„Dust: a T oldal több körét nyeri meg, amikor itt van: 412-ből 61% megnyerve, szemben az ugyanazokban a meccsekben mért saját aránya alapján várt 49%-kal (esélyhányados 1,6x; 31/48 meccsben tartva).”* Ugyanazok a hamis felfedezési arány- és stabilitás-ellenőrzések, mint minden helynél; a **Betöltés** betölti azokat a meccseket, amelyekben tartották, és annak az oldalnak a pozícióit mutatja.
- **Fülkék: körgyőzelem.** A **Körök** táblázat minden élet körét tartalmazza: a térképet, az oldalt, a meccs részét (1–4., 5–8. kör, ...), a járművet (egy operátor, egy ügynök), a legtöbbet használt fegyvert, a legtovább tartott helyet, a vásárlást (eco, force, full), és hogy az oldala ölt-e elsőként. Egy csoportot azzal vetünk össze, amennyit az oldala ugyanazokban a meccsekben nyert, így a *T a Duston AWP-vel* csak akkor fülke, ha azokat a köröket gyakrabban nyerték meg, mint T többi körét azokban a meccsekben. Egy kitalált példa: *„m1 · T · AWP: 320 kör 80%-át nyeri, szemben az ugyanazon oldalaktól ugyanazokban a meccsekben várt 62%-kal (esélyhányados 2,3x; 40 meccs).”* A többlet és a támogatottság szorzata szerint rangsorolva; a **Betöltés** azokat a meccseket tölti be, amelyek körei a legjobban mutatják.

Mindkettőhöz 2-es verziójú összefoglalók kellenek (lásd [Az összefoglalók megszerzése](#getting-the-summaries)): a régebbieket újraszámolja.

A **Felismerések** fül minden meccsen át megtalálja azokat a járműveket, amelyek a többinél jobban vagy rosszabbul cserélnek vagy nyernek, azokat a helyeket, amelyek a meccsek egy állandó részében forgalmasak, azokat az oldalakat, amelyek egyenlő megoszlásnál többet nyernek, azokat a járműveket, amelyek használata a dátumokkal változik, és a meccs azon részeit, amelyekben egyenletes eloszlásnál több az ölés. Minden megállapításhoz tartozik a számlálója, a hatása, az intervalluma és egy hamis felfedezési arány (5%-on tartva), és egy kattintás betölti a meccseit. Részletek: [Fejlesztőknek](#for-developers).

## Méretezés {#scale}

Egy kis változatot te is megismételhetsz: a `node tools/demo-data.mjs` 150 szintetikus tankmeccset ír a `tools/.shots/demo/mass` mappába (meccsenként nagyjából 1000 sor). Asztali számítógépen mért értékek ezen a 150 szintetikus demo-meccsen, amelyet a `tools/demo-data.mjs` készít (egy valódi meccs ennél sokkal nagyobb):

- A `tools/3dheat-summarize.mjs` 4 munkással: 2,6–4,8 s mind a 150-re, egy meccs 8–21 ms egy munkásban; egy második futás, amely csak az összefoglalókat olvassa, nagyjából 2 s.
- A mappa megnyitása a panelben, az index jelenlétével, amíg az ablak megjelenik: 0,9–1,6 s (a munkás saját része, a 150 indexsor olvasása 20–40 ms).
- Fülváltás, amíg a táblázata megrajzolódik: Áttekintés 10–30 ms, Egyensúly 30–70 ms, Trendek 30–45 ms, Játékosok 15–35 ms, Oldalak 15–20 ms, Térkép 55–130 ms.
- A tár a 150 meccset nagyjából 0,5 MB-ban tartja.

Az ablak megnyitása egyetlen rövid képkockát vesz igénybe: a kiválasztott fájlok 16-osával mennek a munkásnak, a dátummezők és az első fül pedig egy képkockával az ablak után érkezik.

A tár meccsenként nagyjából 15 KB-ot tart, így 10 000 meccs ~150 MB-ot foglal a munkásban. A rácsokat soha nem tartják meg a térkép által kért mennyiségnél többet.

## Fejlesztőknek {#for-developers}

### Felismerések sok meccsen át {#insights-over-many-matches}

`src/mass/detect.ts` – minden megállapítás a számlálóival, hatásával és intervallumával, p és q (Benjamini–Hochberg mindenen, amit a detektor kipróbált, 5%-on tartva), a részletező nézet, amely betölti a meccseit, és egy mondatkulcs az értékeivel. A jelentés (`heat3d.mass/1`) az, amit a `massReportForModel` egy elbeszélőnek ad, ugyanabban a formában, mint az egymeccses jelentés (`insights/seam.ts`).

| Detektor | Megtalálja |
|---|---|
| `balance` | egy játékos-jármű, amely a többinél jobban vagy rosszabbul cserél vagy nyer egy térképen vagy egy módban |
| `hotspot` | helyek, amelyek a beérkezett meccsek egy állandó részében forgalmasak (forró meccsek / látott meccsek, a térkép többi cellájához képest) – nem csak összegben forgalmasak |
| `side` | a térkép egyik oldala, amely egyenlő megoszlásnál többet nyer |
| `meta` | egy jármű játékos-életekből való részesedése vagy K/D-je a dátumok korábbi és későbbi fele között, térképenként – elég nagy ahhoz, hogy számítson, a negyedévek alatt trendelve, és a legtöbb térképen ugyanúgy (lent) |
| `phase` | a meccs hosszának egy része, amely több ölést, találatot, kilövést... tart, mint egyenletes eloszlás |
| `place` | helyek, amelyek sok meccsen át kiemelkednek (B szakasz, lent): egy régió aránya vagy ölésrészesedése a meccs saját arányához képest; körök, folyosók, növesztett zónák, magassági sávok, szakaszok. Rejtettek, ha a sima hőtérkép nem mutatja őket |
| `niche` | csoportok, amelyek jelentősen jobban vagy rosszabbul teljesítenek (B szakasz, lent) |
| `grid.*` | az egy adathalmazos detektorok (erőpozíciók, forró és csendes zónák, osztályhelyek) minden térkép összegzett rácsán: a `GridMerge.toInsightJob` tölti fel a felismerési menet rácsait az összefoglalókból; a pályákat igénylő detektorok kimaradnak |

### Az összefoglaló {#the-summary}

Sima JSON (`src/mass/types.ts`), meccsenként nagyjából 5–30 KB tömörítve:

- a meccs: játék, térkép, mód, küldetés, kezdet, hossz, sorok, életek, játékosok, MI, csapatok (életek, játékosok, jelenlét, ölések, halálok, megnyert, pénz), győztes;
- jármű és csapat szerint: osztály, szint, életek, játékos-életek, jelenlét, események egységes fajta szerint, ölések a cél osztálya szerint, győzelmek, pénz;
- játékosonként (felhasználói azonosító, különben név): csapat, életek, jelenlét, ölések, halálok, találatok, kilövések, megnyert, járművek; fegyverenként: események fajta szerint;
- eredményoszloppal (2-es verzió): megnyert és lejátszott körök csapatonként, járművenként (`rw`, mindegyik egy élet és egy kör), játékosonként és fegyverenként (azok a körök, amelyekben egy oldal használta); minden élet köre (`outcome.u`: kör, oldal, jármű, a legtöbbet használt fegyver, a legtovább tartott hely, a vásárlás, győzelem) és minden kör száma, győztese és az első ölés oldala (`outcome.r`);
- a gazdaság oszlopai (`cost_*`, `earn_*`) és összegeik;
- szakaszok: események fajta szerint a meccs hosszának 20 sávjában és percenként;
- viselkedés: a meccs kollektív viselkedési mérőszámai (összehangolódás, útvonalterelés, sávok, tömörülés, vezetők, lemaradók, törésponti pont, kockázat a veszteségek után, sorozatok, vásárlási egyetértés, elnyomás), mindegyik a saját nullmodelljével, p és q – lásd: [Kollektív viselkedés](collective-behaviour.md);
- a rács (lent).

A nézegető módjára számolva: az oszlopokat úgy találja, ahogy a sok meccses betöltő megtalálja őket (`leanSpec`), az eseményeket a `data/canonical.ts` szerint. Egy Tacview-fegyver által elért ölés a lövője javára számít. Egy egyszerre kétszer mondott halál (`dead`, `death`) egyszer számít.

#### A rács: amire a B szakasz épül {#the-grid-what-stage-b-builds-on}

A térbeli rész olyan szkennelési statisztikákhoz készült, amelyek bármilyen méretű és alakú régiókon futnak, nem csak hőtérképekhez:

- **Piramis.** A cellák a világegységekben igazított kettő-hatványok (x, z ahogy a nézegető elhelyezi őket). A `k` szint azoknak a celláknak az összege, amelyeket `ix >> k, iz >> k` szerint csoportosítunk – pontos, egy meccsen belül és más cellaméretű meccsek között is –, és bármely régió (egy doboz, egy vonal menti folyosó, egy gyűrű) cellák összege. A legfinomabb szint a meccs robusztus kiterjedését (a jelenlét 99%-át tartó cellák) 128 cellába illeszti; a kívülük eső kóborlók megmaradnak.
- **Expozíció minden szám mellett.** Jelenléti másodpercek cellánként, csapatonként (`pt`), járműosztályonként (`pc`) és magassági sávonként (`ph`), így egy régió aránya, várható értéke és hányadosa bármely részcsoportra kiszámolható.
- **Magasság.** Sávok a meccs padlója (a magasság 1. percentilise) fölött: 3 m alatt, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, fölötte. A `floor`/`storey`/`deck` oszloppal rendelkező fájl helyette az emeletei szerint sávoz. A `y` minden cella átlagos magassága, a `y0` a legalacsonyabbja (az emelete, a fölötte lévő magassághoz).
- **Események** párokként: `[cell, kind, team, class, band, count]`.
- **Körök eredmény szerint** (2-es verzió, eredményoszloppal és legalább két körrel): `pw` mint `[cell, team, rounds won, rounds lost]` – azok a körök, amelyekben az egyes oldalak legalább egy másodpercet töltöttek a cellában, a kör eredménye szerint.
- **Időszeletek** durva szinten (oldalanként 8 cella), a meccs kezdetétől számított perc szerint: `[cx, cz, minute, kind, value]`. A jelenléti másodpercek fajtaként `GRID_KINDS.length`; a meccs szakaszai percek a hosszon.
- Ritka, a számlálók egészek, a másodpercek tizedre kerekítve: attól korlátozva, ami történt.

### B szakasz: helyek és fülkék {#stage-b-places-and-niches}

A B szakasz azt keresi, ami a számokban kiemelkedik anélkül, hogy a szemnek feltűnne: egy nagy terület, amely egészében forgalmas úgy, hogy nincs benne forró cella; furcsa ölés–halál arány kevés eseményen; egy folyosó; egy magassági sáv; egy csoport, amely csak a meccs egy részében van jelen. Ide tartoznak azok a csoportok is (egy jármű egy térképen, egy oldalon, egy szektor egy magasságon), amelyek jelentősen jobban vagy rosszabbul teljesítenek a többinél. Egy **Helyek keresése** / **Fülkék keresése** / **Felismerések keresése** indítja az összes detektort; a három fül ugyanazt a jelentést használja.

#### Helyek (`src/mass/scan.ts`) {#places-srcmassscants}

Minden térkép meccseit kétszer olvassák, egyszerre egy meccset. A memória összegeket tart egy legfeljebb 64 cellás oldalú rasztereken (16 a tér-idő szkennelésnél), soha nem a meccseket.

- **Mérőszámok.** Egy esemény aránya a jelenlét másodpercenként – ölések, halálok, találatok, kilövések, elfoglalások, minden egységre, osztályonként (a 4, amelyiknek a legtöbb eseménye van), magassági sávonként –, és az ölések részesedése az ölésekben és a halálokban (összesen, oldalanként, sávonként), valamint minden oldal **győzelmi aránya**: a cellában töltött köreinek megnyert és elvesztett száma (`pw`), ahol a térkép 8 vagy több meccse eredmény szerint számolja a köröket. Mely osztályok és oldalak számítanak, az a fejekből jön (`planOf`).
- **Várakozás meccsenként.** Egy cella várható értéke az, hogy a meccs saját aránya a saját jelenlétével szétosztva az adott cellában (kovariánsra igazított Kulldorff-szkennelés, meccsenként rétegezve). Néhány véres meccs vagy egy forgalmas szerver nem hoz létre helyet. A győzelmi aránynál a várakozás az oldal saját megnyert köreinek aránya abban a meccsben, így a térkép és az oldal egyensúlya sosem lesz hely. Egy régió több cellájában lévő kör mindegyikben számít; a régió méretén mért szórás ezt figyelembe veszi.
- **Szóródás.** A meccsek sokkal jobban eltérnek, mint ahogy a Poisson-eloszlás megengedné. Minden meccs maradékait 1, 2, 4, 8, 16 cellás blokkokban összegzik. Minden blokkméret szóródása (a négyzetes maradékok a nullvariancia felett, egyesítve, a legrosszabb 5% blokk nélkül) skálázza az adott méretű régió minden tesztjét: kvázi-valószínűségi arány; arányoknál Poisson, részesedéseknél binomiális.
- **Régiók.** 0,75–18 cellás körök; ellipszisek hat szögben, a szélességük 3- és 6-szorosa hosszúak, 3–18 cella (folyosók; a tengely az felismerés `place.path`-ja). Zónák, amelyeket cellánként növesztenek a legerősebb helyi Getis-Ord Gi* cellákból, amíg a régió z-je nő (szabálytalan alakok). A növesztés a meccsek felén történik, a másikon tesztelve, így a növesztés szabadsága nem hoz hamis helyeket. Minden magassági sáv a térkép többi sávjához képest az egész térképen (klaszter-robusztus). Tér-idő hengerek: egy kör a meccs hosszának egy vagy két ötödében, a meccs saját eseményeinek eloszlásához képest hely és idő szerint (a tér-idő permutációs szkennelés).
- **Tesztelés.** p a kvázi-valószínűségből; Benjamini–Hochberg minden térkép minden kipróbált régiójára (három térképen 700 000 a szokásos) 5%-on. Ami átmegy, azt megnyesik: a régió, amely a mérőszámának erősebb régióján belül van, ugyanazt mondja. Ezután újra megvizsgálják a **stabilitására** (a meccsek, amelyek látták, azok, amelyekben tartotta magát, az iránya a meccsek öt redőjében), és még egyszer tesztelik azon a szóráson, amelyet maguk a meccsek mutatnak (klaszter-robusztus, a meccsek klaszterként, soha nem Poisson alatt), újra BH. A csendes helyek egy alapon (a térkép spawnjainak, felszállásainak és leszállásainak 2% vagy több) kimaradnak.
- **Hatás.** Az arány (vagy esélyhányados), empirikus Bayes-módszerrel zsugorítva (a térkép 2x2-es blokkjaihoz illesztett gamma-prior), ~95%-os intervallummal a szóráson; Gi* 1, 2 és 4 cellán, és helyi Moran a közepén.
- **Vizuális nyilvánvalóság.** Mennyit mutat a régió már az eseménye sima hőtérképén (logaritmikus skála a legfényesebb celláig, ahogy a nézetek rajzolják): a kontrasztja a körülötte lévő gyűrűvel (a paletta egytizede nehezen látható, kettő ötöd sima), és egy fényes csúcs, amely a többletet hordozza. Az arányt a hőtérkép soha nem rajzolja, így a részesedés fele számít. 35% alatt **rejtett**. A rangsor: az erő (a hatás 4-szeresnél telítődik, a csendes helyek 0,7-nél) szorozva `1 - 0,7 x nyilvánvalóság`-gal, szorozva a redők egyezésével.

A **Helyek** fül felsorolja őket (alapból csak a rejtetteket; térkép, alak, irány szerint). Egy kattintás körvonalazza a térkép helyeit a 3D nézetben (`placeLines.ts`: a motor felső vonalai, egyszer felépítve – a rejtett bíborvörös, a sima borostyán, a csendes ciánkék, a kiválasztott teljes; egy sáv dobozként, a padlójától a mennyezetéig), és a Térkép fül vásznán. A **Betöltés** odarepül, és betölti azt a 60 meccset, amelyben a leggyakrabban volt, az eseményére (és osztályára) szűrve.

#### Fülkék (`src/mass/niche.ts`) {#niches-srcmassnichets}

Sugárkeresés (szélesség 24, mélység 3) három táblán: **életek** (a játékosok életei: játék, térkép, mód, osztály, jármű, oldal, szint, a dátumok negyedéve, a meccshosszok harmada; K/D, győzelem, halál egy életen, ölés óránként, kereset percenként), **helyek** (ölések és halálok térkép, mód, dátumok, a térkép 4 x 4-es szektora, osztály, oldal, sáv szerint) és **szakaszok** (szektor és a meccs ötöde: K/D, halál a jelenlét óránként). Egy csoportot a teljes egészhez képest tesztelnek, a meccseket klaszterként kezelve (a maradékok szendvics-varianciája meccsenként). A hatása esélyhányados vagy arányszám, 20 kimenetel előzetesével zsugorítva. 8 meccsen 30 kimenetel kell, egy finomításnak 10%-kal erősebbnek kell lennie a szülőjénél, és kimaradnak azok a csoportok, ahol a kimenetel nincs vagy mindenhol van (nincs rájuk rögzítve). Megtartva: BH 5% alatt minden kiértékelt csoporton, a zsugorított arány legalább 1,25 (vagy 1/1,25), öt redőből négy egyetért, és nem olyan finomítás, amely csak a szülőjét ismétli. A **Fülkék** fül felsorolja őket; egy kattintás megmutatja a csoport minden egyfeltételes finomítását (a felfedező), a **Betöltés** betölti a meccseit. A felszerelések még nincsenek az összefoglalókban.

A negyedik táblázat, a **körök** (`roundsTable`) célja a kör eredménye: egy sor egy élet köre – térkép, oldal, a meccs része (1–4., 5–8. kör, ...), jármű, a legtöbbet használt fegyver, a legtovább tartott hely, vásárlás, első ölés vagy első halál –, a saját oldala saját meccsbeli győzelmi arányával összevetve (a Mantel–Haenszel-féle rétegzett várakozás: a reziduum `won - e`, ahol `e` az oldal aránya a meccsben), így egy fülke sosem a térkép vagy az oldal egyensúlya. A klaszterek továbbra is a meccsek. A z-je kalibrált: ugyanaz a nyalábkeresés nyolcszor fut le olyan eredményeken, amelyeket minden meccs minden oldalának körei között megkevertek (az oldal aránya minden meccsben megmarad), és ezeknek a null z-knek a standard normálison túli szórása – a feltételek száma szerint, a középből (medián / 0,674) és a farokból (99. percentilis / 2,576), a nagyobbik, sosem 1 alatt – elosztja a valódiakat a p-jük és a hamis felfedezési arány előtt (empirikus null, Efron 2004). A mélyebb csoportok nagyobb skálát kapnak: a nyaláb a nagy z-jük miatt választott csoportok finomításait tartja meg. Egy fülke alapja a saját várakozása, a többlete az afölötti pontok, és a többlet és a körei számának négyzetgyöke szerinti szorzat rangsorolja, a bizonyítékok és a hajtások által alátámasztva (a `wracc` a támogatottság és a többlet szorzata). Magával viszi azokat a meccseket, ahol a legjobban megmutatkozott (`matchIds`), és néhány körüket (`rounds`, `[match, round]`) a részletezéshez.

#### Meta-eltolódások gyakorlati jelentőséggel {#meta-shifts-with-practical-significance}

Vegyes dátumoknál az életeken alkalmazott binomiális teszt szinte minden változást szignifikánsnak mondott. A `meta` most klaszter-robusztusan tesztel (minden meccs élete egy klaszter). Csak azt a használati eltolódást tartja meg, amely legalább 2 pont és legalább 25%; egy K/D-eltolódást, amely 1,3-szoros; azt, hogy a dátumok negyedévei ugyanígy trendelnek (Kendall-tau legalább 0,5); és egy több térképen szereplő járműnél azt, hogy a legtöbb térképen ugyanabba az irányba mutat. Így egy tesztkészleten, ahol a sima teszt szinte mindent megjelölt, már csak néhány eltolódás marad.

#### Egy modellnek {#for-a-model}

A `massReportForModel` minden helynek megadja a `region`-jét (alak, rejtett, nyilvánvalóság, magasságok, szakasz), minden fülkének a `conditions`-ét, valamint azt, hány régiót és csoportot próbáltak ki. A tudásnézet a helyeket ölőzónaként és támadási útvonalként olvashatja: fajtáik `place.*` és `niche.*`.

#### Ellenőrzések {#checks}

A `scan.test.ts` egy szétterülő területet (a halálozási ráta 1,6-szorosa egy 22 cellás körön, minden cellában halványan), egy folyosót, egy magassági sávot és egy csak szakaszban jelentkező csoportot ültet 240 szintetikus, túlszórt meccsbe. Mindegyiket megtalálja, a szétterülő rejtve van. Nyolc nullkészletet futtat 60-60 meccsel: nincs hely. A `niche.test.ts` megtalál egy beültetett jármű × térkép × oldal csoportot, és semmit sem talál öt nulltáblázatban. Az `outcome.test.ts` ellenőrzi a 2-es verziójú összefoglalót (megnyert körök oldalanként, egységenként, játékosonként és fegyverenként, `pw`, az egységkörök); beültet egy sávot, amelynek oldala a körei 70%-át nyeri 35% helyett (minden meccsnek saját egyensúlya van) – megtalálja –, és 20 nullkészletet futtat 50-50 meccsel, ahol a sávok semmit sem mondanak: nincs győzelmiarány-hely; beültet egy AWP-t egy térképen, amely 30 ponttal többet nyer oldala köreiből – megtalálja, a meccseivel és köreivel együtt –, és 30 nullkészletet futtat 80-80 meccsel, ahol minden meccsnek saját egyensúlya van, és az egyik oldal erősebb egy térképen: nincs fülke.
