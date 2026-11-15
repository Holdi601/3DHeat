---
title: "Oszlopok hozzárendelése"
parent: "Adatok betöltése"
nav_order: 2
lang: "hu"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Oszlop-hozzárendelés

A fájl egy tábla, és a 3DHeatnek tudnia kell, melyik oszlop tartalmazza a kelet–nyugati pozíciót, melyik az időt, melyik a játékos nevét, és így tovább. Ez a panel mondja meg, mit tippelt, és itt javítod ki a rossz tippet.

![Az Oszlop-hozzárendelés panel egy Parquet-fájl betöltése után: minden mező kitöltve – 1 X, 2 Y, 3 Z, 4 Idő, 5 Személyazonosító, 6 Munkamenet / meccs, 7 Csapat / csoport](../assets/img/en/column-mapping-panel.webp)

*A fájl a saját oszlopait megnevezte, így minden mező már ki van töltve.*

Példának: egy `x,y,z,t,player,team` fejlécű CSV magától hozzárendelődik: az x, y és z lesz a pozíció, a `t` az idő, a `player` a [személy](glossary.md), a `team` pedig a [csoport](glossary.md).

Miután fájlokat választottál, az **Oszlop-hozzárendelés** panel a Forrás panel alatt nyílik meg. Megmondja, melyik oszlop melyik szerepet tölti be. Automatikusan kitöltődik, és minden mező megváltoztatható a **Betöltés** gomb megnyomása előtt; a hozzárendelést a betöltéskor olvassuk, így ha utólag változtatod, újra kell betöltened.

## A mezők {#the-fields}

Minden oszlopmenü felsorolja az első fájl minden oszlopát, plusz *– nincs –*.

| Mező | Szerep | Megjegyzések |
|---|---|---|
| **Elválasztó** | Csak CSV: a mezőelválasztó. | Menü: *Vessző ,*, *Pontosvessző ;*, *Tabulátor*, *Függőleges vonal \|*, *Szóköz*; vagy írj be bármely egyetlen karaktert a *vagy írj be egy karaktert* mezőbe. Automatikusan felismert (lent). Ha megváltoztatod, az automatikus hozzárendelés újra lefut, így a korábbi szerkesztések elvesznek. |
| **X**, **Y**, **Z** | Pozíció. | Legalább kettő kell; egy hozzárendeletlen harmadik tengely 0 (az adat egy síkon fekszik). Ugyanaz az oszlop két tengelyen hiba. |
| **Felfelé mutató tengely a forrásban** | Melyik forrástengely mutat felfelé. | *Z felfelé van (a legtöbb játékmotor)* vagy *Y felfelé van (grafikai konvenció)*. Lásd [Tengelyek, mértékegységek és idő](axes-units-and-time.md). |
| **Egységlépték** | Minden pozíciót megszoroz. | Gombok: *1 (m)* és *0,01 (cm→m)*, vagy írj be egy értéket. |
| **Tükrözés X / Y / Z** | Egy forrástengely előjelét megfordítja. | A pozíciókra és a nézési irány vektoraira alkalmazzuk. |
| **Idő** | Az időtengely. | Nem kötelező. Nélküle nincs idővonal. |
| **Időegység** | Hogyan olvassuk az időoszlopot. | Hét egység; lásd [Tengelyek, mértékegységek és idő](axes-units-and-time.md#time). A Parquet `TIMESTAMP`/`DATE` oszlopoknál figyelmen kívül marad, amit a panel jelez. |
| **Személyazonosító** | Kié vagy mié a sor. | Nem kötelező. Pályákat, élettartamokat, dobozos visszajátszást és vonal-hőt tesz lehetővé. |
| **Munkamenet / meccs** | Melyik meccs, rajt, kör, futam vagy kör tartozik a sorhoz. | Nem kötelező. A pozíciókat sosem interpoláljuk, nem húzzuk el és nem kapcsoljuk össze útvonallá munkamenetváltáson át. Lásd [Munkamenetek, személyek és csoportok](sessions-persons-groups.md). |
| **Csapat / csoport** | Bármely kis számosságú oszlop. | Nem kötelező. Ez vezérli a csoportszíneket, a csapat-hőt és a csoportonkénti különbség-felosztást. |
| **Nézési irány** | *Nincs*, *Legyezés / bólintás oszlopok* vagy *Irányvektor-oszlopok*. | Legyezés/bólintással: **Legyezés**, **Bólintás** és **Szögegység** (*Fok* / *Radián*). Vektorral: **Dir X**, **Dir Y**, **Dir Z**. A [dobozos visszajátszás](box-replay.md) nézési sugaraihoz használjuk. |
| **Megtartás szűréshez** | Extra oszlopok a memóriában. | Jelölőnégyzet oszloponként, és minden bejelöltnél *tartomány* (szám) vagy *kategória*. Mindegyik soronként 4 bájtba kerül, és a betöltésnél egy dekódolási menetbe. Csak a megtartott oszlopok [szűrhetők](filters.md), használhatók [különbség-felosztáshoz](difference.md) vagy a [vonal-hő](line-heat.md) eseményoszlopaként. |
| **Mintasorok megjelenítése** | Az első 12 mintázott sor táblázata, minden oszloppal. | A tippek ellenőrzésére. |

Egy bejelölt szűrőoszlop, amelyet nem állítottak be kifejezetten, *tartományként* olvasódik; egy számnak látszó azonosítóoszlop gyakran hasznosabb *kategóriaként*. Egyszerre csak 4 szűrő lehet aktív ([Szűrők](filters.md)).

## Hogyan tippel az automatikus hozzárendelés {#how-the-auto-mapping-guesses}

A tippelés a [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts) fájlban van. Megnézi az oszlopneveket, azt, mely oszlopok számok a mintázott sorokban (a nem üres értékek több mint 90%-a számként értelmezhető), hogy hány különböző értéket vesz fel minden oszlop a mintában, és a Parquet logikai típusait. A névmintákat sorrendben próbáljuk, kis- és nagybetű-érzéketlenül; az első minta, amely bármelyik még szabad oszlopra illeszkedik, nyer.

### Pozíció {#position}

| Tengely | Névminták sorrendben (csak számoszlopok) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Ha egy tengely még üres, az első szabad számoszlopok (figyelmen kívül hagyva a `filename`, `level`, `year`, `month`, `day`, `hour`, `location` oszlopokat) sorrendben töltik ki. Egy rossz tipp a képernyőn szembetűnő; egy üres tengely üres nézetet hagyna.

### Idő {#time}

- **Először a Parquet időbélyeg-oszlopok.** A `TIMESTAMP` vagy `DATE` logikai típusú oszlopok közül a legjobbat pontszám szerint választjuk: +10 000, ha a neve időmintának felel meg, −5 000 egy egyszerű `DATE`-re, plusz a mintában lévő különböző értékek száma. Egy egész napos dátum és egy állandó munkamenetkezdet szinte semmi különböző értéket nem vesz fel, így az eseménypillanat nyer. Az egység ekkor *Unix-időbélyeg (ms)*.
- **Egyébként névvel:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, majd az eltelt idő nevei (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Az egységet ekkor az értékekből becsüljük: ISO-8601, ha egy érték `ÉÉÉÉ-HH-NNT…` vagy `ÉÉÉÉ-HH-NN …` alakú; egyébként a legnagyobb nagyságrend szerint: 10^17 nanoszekundum fölött, 10^14 mikroszekundum fölött, 10^11 Unix-milliszekundum fölött, 10^8 Unix-másodperc fölött, 10^6 milliszekundum fölött, különben másodperc.

Eltelt idejű oszlop kiválasztásakor a panel megjegyzi, hogy minden munkamenet a saját kezdetéhez igazodik – ez jó meccsek egymásra helyezéséhez, nem a valódi sorrendjükben való megjelenítéshez.

### Munkamenet, személy, csoport {#session-person-group}

A munkamenetet az idő tengely **után**, és a személy és a csoport **előtt** foglaljuk le, mert egy munkamenetoszlop gyakran időbélyeg (a meccs kezdő időpontja minden sorában).

| Szerep | Névminták sorrendben |
|---|---|
| Munkamenet | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (mindegyik pontosan, opcionálisan `_id`-val) |
| Személy | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, majd `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (versenyadatok: az autó az, ami mozog) |
| Csoport | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Csoport, tartalék | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Egy csoportjelölt, amely a legtöbb mintasorban más-más értéket vesz fel (több mint max(48, a minta 60%-a)), azonosító, nem csoport: ha nem találtunk személyoszlopot, ez lesz az, és csoportként nem használjuk. Ha egyáltalán nem találtunk csoportoszlopot, a nem számoszlop, amelyben 2 és 12 közötti a legkevesebb különböző érték, lesz a csoport.

### Nézési irány {#look-direction}

Egy számoszlop, amelynek neve `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` vagy `rot_z` / `rotation_z`, a nézési irányt legyezés/bólintás módra kapcsolja; a bólintást `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…` alakban keressük. Fokokat feltételezünk, ha a mintázott legyezés abszolút értéke bármelyik sorban 7 fölött van, egyébként radiánokat. Irányvektort soha nem találunk ki; az vagy a lent említett tippekből jön, vagy tőled.

### Szűrőoszlopok {#filter-columns}

Legfeljebb **6** oszlopot tartunk meg automatikusan, rangsorolva:

1. `region`, `sessionMode`, `actor` – olyan oszlopok, amelyek szűrésre valók (1200 pont);
2. kategóriaoszlopok, amelyek változnak a mintában, kevesebb különböző értékkel előbb (1000 mínusz a szám);
3. a mintában állandó oszlop, de csak ha több fájlt töltünk be – fájlonként változhat, például egy régió vagy egy tesztfuttatás azonosítója (600);
4. számoszlopok (500).

Azok az oszlopok, amelyek már szerepet töltenek be, a fent említett zajneveket, az egyfájlos betöltésben állandó oszlopokat és a szabad szöveges oszlopokat (max(16, a minta fele) különböző értéknél több) nem ajánljuk automatikusan. Bármelyik oszlop kézzel még mindig bejelölhető.

### Felfelé mutató tengely {#up-axis}

Ha mind a három tengely hozzá van rendelve, a mintában az Y és a Z közül a kisebb szórású tengelyt vesszük felfelé (egy térkép sokkal szélesebb, mint magas); egyébként Z-felfelét feltételezünk.

## A `heat3d` tippek a Parquet-láblécben {#the-heat3d-hints-in-a-parquet-footer}

Egy Parquet-fájl megmondhatja, hogyan kell olvasni. Ha a fájl láblécének kulcs/érték metaadataiban van **`heat3d`** kulcsú bejegyzés, az értékét JSON-ként értelmezzük, és ráfektetjük a tippekre ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). A CS2-demo-átalakító ilyen bejegyzést ír, így a táblái a játékossal mint személlyel, az oldallal mint csoporttal, minden körrel mint munkamenettel, bekapcsolt nézési iránnyal és helyesen álló világgal nyílnak meg.

Csak a kiválasztás **első** fájlját olvassuk tippekért. Minden bejegyzés nem kötelező, és minden tippelt érték megjelenik a panelen, és megváltoztatható. A séma teljes leírása egy példával és az írás módjával a [Adatformátumok leírása](data-formats.md#the-heat3d-hints) oldalon van.

Röviden a szabályok:

- A tipp által megnevezett oszlopot csak akkor alkalmazzuk, ha a fájlban megvan az oszlop.
- A `lookMode: "vector"` csak akkor lép életbe, ha a `dirX`, `dirY` és `dirZ` mind be van állítva; a `"yawPitch"` csak akkor, ha a `yaw` be van állítva.
- Az `extra`, ha jelen van, felváltja az automatikus szűrőlistát (az ismeretlen neveket és a már szerepet betöltő oszlopokat eldobjuk); minden elem tartomány/kategória típusa attól függ, számnak látszott-e. Ha hiányzik, az automatikus lista marad, a tipp által szerephez juttatott oszlopok nélkül.
- Az `axes.up` csak `"y"` vagy `"z"` lehet, a tükrözések logikai értékek, a `scale` pozitív.
- Az `entity.size`, ha pozitív, egy követett dolog méretét adja a fájl egységeiben ([entitásméret](sessions-persons-groups.md#entity-size)); ez az egyetlen módja a beállításának.

## Ismert hiba: a CSV-elválasztó felülírása {#known-issue-overriding-the-csv-separator}

Ha az elválasztót a felismerttől eltérőre változtatod, az oszloplista és a mintasorok nem változnak (az előnézet továbbra is a felismert elválasztóval bontja a sorokat). A kiválasztott elválasztót maga a betöltés továbbra is használja. Ha a felismert elválasztó rossz:

1. Nyisd meg a fájlt egy szövegszerkesztőben.
2. Mindenhol cseréld le az elválasztót vesszőre (a tizedesvesszőket pontokra).
3. Mentsd, majd töltsd be újra a fájlt.

A hiba oka a [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts) függvényben van.
