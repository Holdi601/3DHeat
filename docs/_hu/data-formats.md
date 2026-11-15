---
title: "Adatformátumok leírása"
nav_order: 19
lang: "hu"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Adatformátumok leírása

Ez az oldal felsorolja a 3DHeat által megnyitható minden fájltípust, és azt, hogy a bennük lévő táblának milyennek kell lennie. A tábla sorokból és oszlopokból áll, mint egy táblázat: minden sor megmondja, hol volt valami, és ha megvan, azt is, hogy mikor és ki volt.

Ez olvasható oszloponként a Hőtérkép fülön, és az is, milyen tippeket hordozhat egy Parquet-fájl. (A Versenyelemzés fül köröket olvas, a Meccs fül meccsösszegzéseket; lásd [Versenyelemzés](race-analysis.md) és [Meccselemzés](match-analysis.md).)

## Fájlok {#files}

Ez a teljes lista a betölthető fájlokról. A **Forrás** panel (**Fájlok…**, **Mappa…**, vagy húzással és elengedéssel) pontosan ezeket fogadja el:

| Kiterjesztés | Mi az | Ki olvassa |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tábla | a Parquet-olvasó (lent) |
| `.csv`, `.tsv`, `.txt` | Határolt szöveg | a szövegolvasó (lent) |
| `.3dheat` | Egy meccs egy fájlban (ZIP, benne a tábla és a kiegészítői) | a benne lévő táblaként töltődik be - [Egy fájl egy meccs](container.md) |
| `.acmi` (is: `.txt.acmi`, `.zip.acmi`) | Tacview repülésrögzítés | saját olvasó - [Tacview-felvételek](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-felvétel (Arma-típusú) | saját olvasó |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-útvonalak: GPX, KML/KMZ, NMEA-naplók, IGC vitorlázórepülő-naplók, FIT sportfájlok | saját olvasó; a pozíciókat a szélesség és a hosszúság adja |

Nem pozícióként töltődik be: a tábla mellett ülő kis JSON-fájlok, amelyek a táblát írják le (nevük `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json` végű), és a konverterek további táblái (`<meccs>.events.parquet` és hasonlók, lásd [Konverterek](converters.md)), hacsak külön nem választja ki őket. Minden más kimarad, és megadja az okát. Hogy a kijelölést hogyan szűri a program, azt a [Fájlok betöltése](loading-files.md#which-files-are-kept) részben magyarázzuk el.

Az üres fájlok kimaradnak. Olyan kijelölésben, amely `movement*.<kiterjesztés>` fájlokat tartalmaz, csak ezek töltődnek be ([Fájlok betöltése](loading-files.md#which-files-are-kept)).

Az adat **soronként egy minta**: egy pozíció egy pillanatban, opcionálisan azzal együtt, hogy ki volt, melyik csoporthoz és munkamenethez tartozott, hová nézett, és további oszlopokkal. Eseménysorok (egyölés, egy lerakás, egy lövés) ugyanabban a táblában állhatnak a pozíciósorok mellett; egy eseményoszlop különbözteti meg őket.

## Határolt szöveg (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

A legkisebb hasznos fájl, három sor:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Az oszlopok maguktól illeszkednek ([Oszlopok hozzárendelése](column-mapping.md)).

Egy bájtszintű olvasó dolgozza fel, amely csak a hozzárendelt oszlopokat dekódolja ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Szempont | Szabály |
|---|---|
| Fejléc | Az első nem üres sor tartalmazza az oszlopneveket. Egy üres név `column_N` lesz. |
| Elválasztó | Az első 1 MiB első 20 nem üres sorából érzékeljük, a vessző, a pontosvessző, a tabulátor és a függőleges vonal közül. Az nyer, amelyik minden mintasorban ugyanannyi mezőt ad, ezután az, amelyik több mezőt ad. A szóköz soha nem érzékelődik, de kiválasztható; bármilyen egyetlen karakter beírható ([Oszlopok hozzárendelése](column-mapping.md#the-fields)). |
| Idézőjelek | RFC 4180: a mezők dupla idézőjelbe tehetők, az idézőjeleken belüli `""` egy szó szerinti idézőjel. |
| Szóközök | A mezők elejéről és végéről a szóközök, tabulátorok és idézőjelek le lesznek vágva. |
| Mezők soronként | Legfeljebb 4096; több hiba (*jó az elválasztó?*). |
| Számok | Opcionális előjel, számjegyek, opcionális `.` és tizedesjegyek, opcionális kitevő (`1.5e-3`). A tizedesvessző (`1,5`), az ezres elválasztók és a mértékegység (`12 m`) nem értelmeződik, hiányzónak számít. Ha a fájlban tizedesvessző van, a betöltés előtt cserélje pontra; ez egy szövegszerkesztő keresés és csere funkciójával elvégezhető. |
| Számoszlop | Egy oszlop számként ajánlódik fel, ha az első 50 sor nem üres értékeinek több mint 90%-a számként értelmezhető. |
| Sorok száma | A betöltés előtt becsüljük az első 1 MiB átlagos sorhosszából. |
| Szövegkódolás | UTF-8. |

## Parquet {#parquet}

A [hyparquet](https://github.com/hyparam/hyparquet) olvassa, oszlopblokkonként, típusos tömbökbe, csak a hozzárendelt oszlopokat kérve ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Szempont | Szabály |
|---|---|
| Sorok száma | Pontos, a fájl láblécéből, betöltés előtt. |
| Előnézet | Az első 50 sor, objektumokként dekódolva; az értékeik döntik el, mely oszlopok néznek ki számnak. |
| Egészek | `INT32` és `INT64` (BigInt-ként dekódolva) számmá válik. |
| Lebegőpontosak | `FLOAT`, `DOUBLE`. |
| Logikai értékek | 1 és 0. |
| Szövegek | Személy-, csoport-, munkamenet- és kategóriaoszlopokra használva; számra hasonlító szöveg számszerepeknél is elfogadott. |
| `TIMESTAMP`, `DATE` logikai típusok | Időpontokká (1970 óta eltelt ezredmásodpercekké) dekódolódnak; időtengelyként használva a mértékegység-beállítás figyelmen kívül marad. |
| Egymásba ágyazott oszlopok | A struct- és lista-oszlopok egyik szerepre sem valók (az előnézetben JSON-szövegként jelennek meg); nincs tesztelve. |
| Lábléc-metaadat | A `heat3d` kulcs olvasása mint hozzárendelési tipp (lent). |

A pozícióhoz, időhöz vagy nézési irányhoz tartozó oszlop, ha nem számot tartalmaz, hiányzónak dekódolódik.

## Oszlopszerepek és típusok {#column-roles-and-types}

| Szerep | Típus a fájlban | Kötelező | Tárolva mint | Korlátok |
|---|---|---|---|---|
| X, Y, Z | szám | kettő a háromból | 32 bites lebegőpontos, a [tengelyleképezés](axes-units-and-time.md) után | Használható pozíció nélküli sor kimarad. |
| Time | szám az [időegységek](axes-units-and-time.md#time-units) egyikében, Parquet-időbélyeg vagy ISO-8601 szöveg | nem | 32 bites lebegőpontos másodperc, a legkorábbi sortól számítva | A rendezés 400 000 000 sor felett megtagadva ([miért](memory-and-budgets.md#the-sort-ceiling)). |
| Személy | bármi; szótáras kódolás | nem | 32 bites azonosító | |
| Munkamenet | bármi; szótáras kódolás | nem | 32 bites azonosító | Legfeljebb 100 000 munkamenet címkéi listázva. |
| Csoport | bármi; szótáras kódolás | nem | 16 bites azonosító | Legfeljebb 4096 csoport, különben a csoportosítás elvetődik. |
| Yaw, pitch | szám, fok vagy radián | nem | 32 bites lebegőpontos radián | |
| Direction X, Y, Z | szám | nem (mind a három együtt) | yaw-ra és pitch-re átszámolva | |
| Szűrőoszlop, *tartomány* | szám | nem | 32 bites lebegőpontos | Legfeljebb 4 szűrő aktív egyszerre. |
| Szűrőoszlop, *kategória* | bármi; szótáras kódolás | nem | 32 bites azonosító | Legfeljebb 4096 érték, különben az oszlop nem marad meg. |

A Parquet `TIMESTAMP` oszlop, amely szűrőoszlopként marad meg, az epoch-ezredmásodpercek *tartománya* – csúszka, nem lista.

## A `heat3d` tippek {#the-heat3d-hints}

Egy Parquet-fájl a saját olvasási utasításait is hordozhatja a lábléc kulcs-érték metaadataiban, a **`heat3d`** kulcs alatt, JSON-objektumként ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). A megjelenítő ezeket a saját találgatásai fölé teszi, ha a fájl a kijelölés első fájlja; minden bejegyzés opcionális, és minden eredmény látható és szerkeszthető az [Oszlopok hozzárendelése](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) panelen. Ami nem JSON-objektumként értelmezhető, figyelmen kívül marad.

### Séma {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          column names for the position
    "time": string,                                  the time column
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filter columns to keep, most useful first
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  must be > 0
  },
  "entity": {
    "size": number                                   size of one tracked thing in file units, > 0
  }
}
```

| Bejegyzés | Mikor érvényesül | Hatás |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | a megnevezett oszlop létezik a fájlban | beállítja azt a szerepet. |
| `columns.timeUnit` | a hét egység egyike | beállítja az időegységet. |
| `columns.angleUnit` | `"degrees"` vagy `"radians"` | beállítja a szögegységet. |
| `columns.lookMode` | `"vector"`, ha a dirX, dirY és dirZ mind be van állítva; `"yawPitch"`, ha a yaw be van állítva; `"none"` | beállítja a nézési módot. |
| `columns.extra` | tömb | lecseréli az automatikus szűrőlistát, csak a létező, szerepnek nem használt oszlopokat megtartva; mindegyik *tartomány*, ha az előnézetben számnak látszott, különben *kategória*. Hiányában az automatikus lista marad, mínusz minden oszlop, amit egy tipp szerepnek rendelt. |
| `axes.up` | `"y"` vagy `"z"` | függőleges tengely. |
| `axes.flipX/Y/Z` | logikai érték | tükrözés. |
| `axes.scale` | 0-nál nagyobb szám | egységskála. |
| `entity.size` | 0-nál nagyobb szám | [Entitásméret](sessions-persons-groups.md#entity-size) (a betöltéskor megszorozva az egységskálával). Ez az egyetlen mód a beállítására. |

### Példa {#example}

Egy kitalált lövöldözős export: Z-tengelyes, centiméter, balkezes világ, a játékosok kb. 72 cm szélesek.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Írás {#writing-it}

A pyarrow-val az egyéni séma-metaadat a fájl kulcs-érték metaadataiba íródik:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` kiírja a fájl sémáját; ez gyors módja annak ellenőrizni, hogy a tippek által említett oszlopnevek stimmelnek.

## Amit a Hőtérkép fül ír {#what-the-heatmap-tab-writes}

Az adatba semmi nem íródik vissza. A kimenetek:

- videók, WebM formátumban (VP9 vagy VP8) - [Kameraútvonal és videó](camera-path-and-video.md);
- egy kamerapozíció, szövegként a vágólapra másolva - [Kamera](camera.md#pose);
- a böngészőben mentett pályák a [pályakönyvtárban](level-library.md).
