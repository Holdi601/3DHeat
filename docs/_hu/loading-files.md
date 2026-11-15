---
title: "Fájlok betöltése"
parent: "Adatok betöltése"
nav_order: 1
lang: "hu"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Fájlok betöltése

Ez az oldal azt mutatja meg, hogyan adhatsz fájlokat a 3DHeatnek, és mit kezd velük. Húzz ide egy mappát: a program kiválasztja azokat a fájlokat, amelyek pozíciókat tartalmaznak, és egyetlen képpé egyesíti őket.

1. Nyisd meg a **Forrás** részt a Hőtérkép oldalsáv tetején.
2. Húzz fájlokat vagy egy mappát a húzási zónába, vagy nyomd meg a **Fájlok…** vagy a **Mappa…** gombot.
3. Olvasd el a kiválasztás sorát és a **Memóriabecslést** (lásd az alábbi képet).
4. Nyomd meg a **Betöltés** gombot.

![A Forrás panel tíz meccset tartalmazó mappa húzása után: 1 a kiválasztás sora, 2 a Memóriabecslés, amely szerint belefér, és 3 a Betöltés 10 fájl gomb](../assets/img/en/loading-files-source.webp)

*Miután húztál egy mappát, a 3DHeat megmondja, mit talált, és hogy belefér-e.*

A fájlokat a Hőtérkép fül oldalsávjának tetején lévő **Forrás** panelben töltjük be. Ami egyszerre van kiválasztva, az **egy** adatkészletté válik.

## Fájlok kiválasztása {#choosing-files}

| Vezérlő | Mit csinál |
|---|---|
| **Húzz ide fájlokat vagy egy mappát** (a húzási zóna) | Bármilyen keveréket húzhatsz ide, fájlokat és mappákat. A mappákat rekurzívan bejárjuk. A húzási zónára kattintva ugyanaz a választó nyílik meg, mint a **Fájlok…** esetén. |
| **Egy fájl…** | Fájlválasztó egyetlen fájlhoz. |
| **Fájlok…** | Fájlválasztó, amely több fájlt is elfogad. |
| **Mappa…** | Mappaválasztó (a böngésző `webkitdirectory` választója); a mappafa minden fájlját felajánljuk. |

A választók a [betölthető fájlok listájában](data-formats.md#files) szereplő fájltípusokat fogadják el. Röviden: a `.parquet`/`.pq` fájlokat Parquetként olvassuk, a `.csv`/`.tsv`/`.txt` fájlokat elválasztott szövegként, a `.acmi` (Tacview), az OCAP `.json`/`.json.gz` fájlok és a GPS-formátumok (GPX, KML, KMZ, NMEA, IGC, FIT) a saját olvasóikon mennek át, a `.3dheat` meccskonténerek pedig a bennük lévő táblákként töltődnek be ([Egy fájl meccsenként](container.md)). Azt a konténert, amelyet nem lehet beolvasni, kihagyjuk, mint *nem csv/parquet fájl*.

A húzott mappákat legfeljebb 12 szintig járjuk be, és legfeljebb 20 000 fájlig, védekezésül a szimbolikus linkek körbehurkolása és a túlburjánzó fák ellen.

## Mely fájlok maradnak meg {#which-files-are-kept}

Mielőtt bármit olvasnánk, a kiválasztást szűrjük ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Más kiterjesztésű fájlt kihagyunk: *nem csv/parquet fájl*.
- A 0 bájtos fájlt kihagyjuk: *üres (0 bájt)*.
- **Átalakítók kísérőfájljai** – a nyers adatok, amelyeket egy átalakító egy meccs táblája mellett őriz: `<meccs>.messages.parquet`, `.events.parquet`, `.raw.parquet` és a többi, amelyet a [Az átalakítók mindent megtartanak](converters.md) felsorol – kimaradnak: *egy átalakító kísérőfájlja*. Megnyitásukhoz külön válaszd ki vagy húzd be őket (vagy csak kísérőfájlokat): ha a kiválasztás csak kísérőfájlokból áll, azok úgy töltődnek be, mint bármely tábla. A tábla melletti JSON-fájlokat (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` és `.hints.json`) soha nem ajánljuk fel pozíciókként.
- **A mozgásfájl-szabály.** Ha a kiválasztás bármely fájlja `movement*.parquet`, `movement*.csv` (és a többi kiterjesztés) nevű – például `movement.parquet`, `movement_1.parquet` és így tovább –, akkor minden más adatfájl kimarad: *nem mozgásfájl, és ebben a mappában vannak mozgásfájlok*. A telemetriai exportok gyakran tartanak egy pozíciótáblát több tucat pozíció nélküli tábla mellett, és csak az előbbi rajzolható ki. Egy mozgásfájl nélküli mappa minden adatfájlját betölti. Példa: a `movement_1.parquet`, `kills.parquet` és `shop.parquet` fájlokat tartalmazó mappa a `movement_1.parquet` fájlt tölti be; a másik kettőt kihagyottként listázzuk.
- A megtartott fájlokat a kiválasztáson belüli útvonaluk szerint rendezzük, így ugyanaz a mappa mindig ugyanazt az adatkészletet és ugyanazokat a színeket adja.

A panel ezután megmutatja a kiválasztást (egy fájl neve, vagy `mappa (N fájl)` a leghosszabb közös mappa használatával), a fájlok számát, összméretüket és összes sorszámukat – pontosan, ha minden fájl Parquet, és `≈` jellel, ha bármelyik CSV. A kihagyott fájlokat az okukkal együtt listázzuk, az első négyet névvel.

## A séma olvasása {#reading-the-schema}

A kiválasztás **első** fájlját megnyitjuk, hogy leírjuk a sémát („Séma olvasása"): az oszlopneveket, az első 50 adatsort, azt, mely oszlopok tűnnek számnak, és Parquet esetén minden oszlop logikai típusát és a `heat3d` lábléc-bejegyzést. Egy tábla exportjainak mappája egy sémát oszt meg, így egy fájl az összes nevében áll. Ezután minden fájlt lemérünk („Sorok számlálása"): egy Parquet-lábléc egy kis olvasással megadja a pontos számot; egy CSV számát az első megabájtjának átlagos sorhosszából becsüljük.

A [Oszlop-hozzárendelés](column-mapping.md) panel az automatikusan felismert tippekkel nyílik meg, a [memóriabecslés](memory-and-budgets.md) pedig a **Betöltés** gomb fölött jelenik meg.

## Üzenetek betöltés előtt {#messages-before-loading}

A kiválasztás alatt a panel ezeket listázza a [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts) alapján:

- **Hibák** (pirossal) – a betöltés nem indulhat el: két pozíciótengelynél kevesebb van, ugyanaz az oszlop két tengelyen van, egy hozzárendelt oszlop nincs a fájlban, egy pozícióoszlop nem számnak látszik, egy időoszlop mintavett értékei szövegesek, miközben az egység szám (minden sor NaN-ként olvasódna, és 0 időpontba kerülne), egy ISO-8601-re állított időoszlop, amelynek egyetlen mintavett értéke sem dátum, vagy egységlépték 0.
- **Figyelmeztetések** (borostyánsárgával) – betöltődik, de valószínűleg nem úgy, ahogy szánták: egy csoportoszlop, amely a legtöbb mintasorban más-más értéket vesz fel (tehát azonosító, nem csoport), egy `DATE` típusú időoszlop (egy nap minden sora ugyanazt az időpontot kapja), és irányállás az oszlopai nélkül.
- **Megjegyzések** – mit jelent a hozzárendelés: síkon rajzolás, ha az egyik tengely nincs hozzárendelve; idővonal nélkül, ha nincs időoszlop; pályák nélkül, ha nincs személyoszlop; csoportoszlop nélkül egy szín mindenre, és olyan különbség, amely csak a szűrésre megtartott oszlopon oszthat.

## Betöltés {#loading}

A **Betöltés** gomb a *Fájl betöltése*, *N fájl betöltése* vagy *N fájl betöltése (1 a K-ból)* feliratot mutatja, ha [ritkítási lépésköz](memory-and-budgets.md#decimation) van beállítva. A *Túl nagy – csökkentsd vagy ritkítsd* feliratot mutatja, és le van tiltva, ha a [belefér-e ellenőrzés](memory-and-budgets.md#the-fit-check) szerint a betöltés nem fér bele; le van tiltva akkor is, ha a hozzárendelésnek hibái vannak, vagy egy másik betöltés fut.

Betöltés közben a panel mutatja az aktuális lépést (elöl `[fájl/fájlok]`-szal, ha több fájl van), az eddig beolvasott sorokat, egy folyamatsávot és a **Mégse** gombot. A Mégse leállítja a betöltő munkafolyamatot, és vele együtt az általa indított elemző munkafolyamatokat is.

Az oldal betöltés közben is rajzol tovább, mert a munka a háttérben folyik. Látod az aktuális lépést, a beolvasott sorokat, a folyamatsávot és a **Mégse** gombot. Az utolsó fájl után a panel ezeket a lépéseket mutatja: *Sorok időrendbe rendezése*, *Oszlopok átrendezése (n / m)*, *Kiterjedés mérése*, *Névsor összeállítása*, *Munkamenetek összegzése* és *Élettartamok számítása*, majd egy képkockára *N sor feltöltése a GPU-ra*, hogy a hosszú feltöltést soha ne lehessen összetéveszteni egy lefagyással.

### Hogyan működik {#how-it-works}

A betöltés egy Web Workerben fut ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Ha több fájl van, és egynél több [elemzőszál](memory-and-budgets.md#parser-threads) áll rendelkezésre, legfeljebb ennyi fájlt dolgozunk fel **egyszerre**, mindegyiket a saját elemzőmunkafolyamatában ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), amennyire a RAM-keret helyet ad. A fájlokat továbbra is egyesével, a kiválasztás sorrendjében egyesítjük, így az adatkészlet ugyanaz, mintha egyenként töltöttük volna be. Amíg több fájl van folyamatban, a folyamatsor azt a fájlt nevezi meg, amelyik utoljára jelentkezett, a sáv és a sorszám pedig minden folyamatban lévő fájlt összead. Egy szállal vagy egyetlen fájlnál a fájlokat egymás után elemezzük magában a betöltő munkafolyamatban. Csak azokat az oszlopokat olvassuk be, amelyeket a hozzárendelés megnevez: a Parquet-fájl nem hozzárendelt oszlopa nem kerül semmibe; a CSV-t bájtonként végigpásztázzuk, de csak a hozzárendelt mezőket dekódoljuk.

## Több fájlból egy adatkészlet lesz {#several-files-become-one-dataset}

Ha egynél több fájl töltődik be ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Egy névsor.** A személyek, csoportok, munkamenetek és kategóriaértékek minden fájlban közös szótárak, így ugyanaz a játékos két exportban egy személy egy pályával.
- **Egy időkezdet.** Az idők egyesítés közben 64 bites másodpercekként maradnak, és az *egész* kiválasztás legkorábbi időpontjára igazítjuk őket, majd ettől az időponttól 32 bites másodpercként tároljuk. Négy export négy délutánról a valódi sorrendjében kerül elhelyezésre, nem egymásra halmozva.
- **Egy időrend.** Minden fájl sorait időrendbe rendezzük radix-rendezéssel (lásd [a rendezési határ](memory-and-budgets.md#the-sort-ceiling)).
- **Egy `Source file` oszlop.** Minden sor emlékszik arra, melyik fájlból jött, kategóriaoszlopként, `Source file` néven. Megjelenik a [Szűrőkben](filters.md), és a [különbség-felosztásban](difference.md) mint *Source file – két betöltés összehasonlítása*. Egyfájlos betöltésnél nincs – egy állandó oszlop soronként 4 bájtba kerülne, hogy semmit ne mondjon.
- **Hiányzó oszlopok.** Az a fájl, amelyből hiányzik egy *szűrő*oszlop, egyszerűen nem ad hozzá értékeket. Az a fájl, amelyből hiányzik egy hozzárendelt *szerepkör*-oszlop (X, idő, személy …), *a fájlban nincs „name” oszlop* hibával bukik; többfájlos betöltésnél ezt a fájlt kihagyjuk, a többi betöltődik, és a kihagyott fájlok listázva vannak az adatkészleten. Egyfájlos betöltésnél, ha sikertelen, a hiba megjelenik.
- **Hiányossági figyelmeztetés.** Ha a betöltött sorok kevesebbek, mint az előzetesen megszámolt sorok 95%-a, az adatkészlet figyelmeztetést hordoz a hiányzó résszel – olvashatatlan fájlokból, vagy olyan sorokból, amelyeknek nincs használható pozíciójuk; ezeket a bekerüléskor eldobjuk.

## Betöltés után {#after-loading}

Az új adatkészlet felváltja az előzőt. Minden betöltésnél ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- minden szűrő és a csoportok láthatósága törlődik;
- a csoportonkénti különbség-felosztás visszaáll: a csoportok első fele (felfelé kerekítve) pozitív, a többi negatív;
- a sprite-sugár a vízszintes kiterjedés / 120, a telítettség pedig analitikus becslés; a kockaméret, a nézési sugár hossza, a repülési sebesség és a közeli/távoli síkok a kiterjedésből állnak be (lásd [Munkamenetek, személyek és csoportok](sessions-persons-groups.md#entity-size));
- a dobozos visszajátszás munkamenete az lesz, amelyik a legtöbb sorral rendelkezik;
- a vonal-hő útvonalait újra kitaláljuk ([Vonal-hő](line-heat.md));
- a nézetmód visszaesik **Hő**-re, ha az aktuális mód nem támogatott az új adatokon; az idővonal **Mind**-re esik vissza idő-oszlop nélkül, az előzmény pedig **Halmozott**-ra élettartamok nélkül;
- a lejátszófej az elejére áll, és a lejátszás megáll;
- a kamera az alapértelmezett irányból keretbe foglalja az egész adatkészletet (a −Z tengely mentén nézve, mintegy 36°-kal lefelé döntve).

Az **Adatkészlet** panel ezután megmutatja az adatkészlet nevét (a kiválasztást, a sor- és fájlszámokat, és ha volt, a ritkítási lépést), a `N csapat · N személy · Ns tartomány` sort, és a betöltés minden figyelmeztetését borostyánsárgával, amíg az adatkészlet be van töltve. Ebben a panelben az **Eltávolítás** eltávolítja az adatkészletet.
