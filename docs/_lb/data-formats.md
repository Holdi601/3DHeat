---
title: "Referenz vun de Datenformater"
nav_order: 19
lang: "lb"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referenz vun de Datenformater

Dës Säit listt all Zorte vu Fichieren op, déi 3DHeat opmaache kann, an wéi eng Tabell bannen ausgesinn muss. Eng Tabell ass Zeilen a Spalten, wéi an engem Tabellenkalkulatioun: all Zeil seet, wou eppes war, an, wann Der et wësst, wann a wien.

Wat den Heatmap-Tab liest, Spalt fir Spalt, an d'Hiweiser, déi eng Parquet-Fichier droe kann. (Den Tab [Course-Analys](race-analysis.md) liest Ronnefichieren, an den Match-Tab liest Match-Zesummefassungen; kuckt [Course-Analys](race-analysis.md) an [Match-Analys](match-analysis.md).)

## Fichieren {#files}

Dëst ass déi eenzeg komplett Lëscht vun alle Fichieren, déi een lueden kann. D'**Quell**-Panel (**Fichieren…**, **Dossier…** oder Zéien a Falen) akzeptéiert genau dës:

| Endung | Wat et ass | Gelies vun |
|---|---|---|
| `.parquet`, `.pq` | Parquet-Tabell | de Parquet-Leser (hei ënnen) |
| `.csv`, `.tsv`, `.txt` | Text mat Trennzeechen | de Textleser (hei ënnen) |
| `.3dheat` | Ee Match an enger Fichier (en ZIP mat der Tabell an hiren Extras) | gelueden als d'Tabell, déi se enthält - [Eng Fichier fir e Match](container.md) |
| `.acmi` (och `.txt.acmi`, `.zip.acmi`) | Tacview-Fluchopnam | säin eegenen Leser - [Tacview-Opnamen](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-Opnam (Arma-Stil) | säin eegenen Leser |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-Spuren: GPX, KML/KMZ, NMEA-Logbicher, IGC-Segelfluchlogbicher, FIT-Sportfichieren | säin eegenen Leser; d'Positiounen kommen aus Breet- an Längegrad |

Net als Positiounen gelueden: déi kleng JSON-Fichieren, déi nieft enger Tabell leien an se beschreiwen (Nimm, déi op `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` oder `.hints.json` ophalen), an d'zousätzlech Tabellen vun engem Konverter (`<match>.events.parquet` an ähnlech, kuckt [Konverter](converters.md)), ausser Der wielt se eleng aus. Alles anescht gëtt iwwersprongen, mat engem Grond. Wéi eng Auswiel gefiltert gëtt, steet an [Fichieren lueden](loading-files.md#which-files-are-kept).

Eidel Fichieren ginn iwwersprongen. An enger Auswiel, déi `movement*.<ext>`-Fichieren enthält, ginn nëmmen déi gelueden ([Fichieren lueden](loading-files.md#which-files-are-kept)).

D'Donnéeën sinn **eng Zeil pro Probe**: eng Positioun zu engem Moment, optional mat wiem, wéi enger Grupp, wéi enger Sessioun, wou se gekuckt hunn, an all weider Spalten. Event-Zeilen (en Ofschoss, eng Plant, e Schoss) kënnen an der selwechter Tabell stoen wéi d'Positiounszeilen; si ginn duerch eng Event-Spalt ënnerscheet.

## Text mat Trennzeechen (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Eng kleng nëtzlech Fichier, dräi Zeilen:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

D'Spalten ordnen sech selwer zou ([Spalten-Zuuerdnung](column-mapping.md)).

Gelies vun engem Byte-Scanner, deen nëmmen déi zougeuerdnete Spalten dekodéiert ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekt | Regel |
|---|---|
| Kapp | déi éischt net eidel Zeil enthält d'Spaltennimm. En eidele Numm gëtt `column_N`. |
| Trennzeechen | Erkannt aus den éischte 20 net eidelen Zeilen vun den éischte 1 MiB, ënner Komma, Semikolon, Tab a Pipe, duerch **Konsistenz**: deen Trennzeechen, deen bei all geprobte Zeilen déiselwecht Zuel Felder gëtt, gewënnt; dann deen, deen méi Felder gëtt. Leerzeechen gëtt ni erkannt, kann awer gewielt ginn; all eenzelt Zeechen kann een aginn ([Spalten-Zuuerdnung](column-mapping.md#the-fields)). |
| Zitater | RFC 4180: Felder kënnen a Gänsefüßercher gesat ginn; `""` bannent Gänsefüßercher ass ee wierklecht Gänsefouss. |
| Leerraum | Leeschtpläng a Schlusspläng Leerzeechen, Tabs a Gänsefüßercher ginn vun all Feld ewechgeholl. |
| Felder pro Zeil | Héchstens 4.096; méi ass e Feeler (*ass den Trennzeechen richteg?*). |
| Zuelen | Optionalt Vorzeechen, Ziffere, optionalt `.` an Dezimalen, optionalen Exponent (`1.5e-3`). E Dezimalkomma (`1,5`), Tausenderträenner oder nogesate Eenheeten (`12 m`) ginn net gelies a zielen als fehlend. Wann Är Fichier Dezimalkommaen benotzt, ersetzt se duerch Punkten, ier Der ladet (Sichen a Ersetzen an engem Texteditor geet). |
| Numeresch Spalt | Eng Spalt gëtt als numeresch ugebueden, wann méi wéi 90 % vun den net eidelen Wäerter an den éischte 50 Zeilen als Zuelen gelies ginn. |
| Zuel vun Zeilen | Virum Lueden geschätzt aus der duerchschnëttlecher Zeilelängt vun den éischte 1 MiB. |
| Textkodéierung | UTF-8. |

## Parquet {#parquet}

Gelies mat [hyparquet](https://github.com/hyparam/hyparquet), Spaltestéck fir Spaltestéck a getipte Arrays, a nëmmen déi zougeuerdnete Spalten ugefrot ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekt | Regel |
|---|---|
| Zuel vun Zeilen | Genau, aus dem Footer, virum Lueden. |
| Virschau | Déi éischt 50 Zeilen, dekodéiert als Objekter; hir Wäerter bestëmmen, wéi Spalten numeresch ausgesinn. |
| Ganzzuelen | `INT32`, a `INT64` (dekodéiert als BigInt) ginn Zuelen. |
| Kommazuelen | `FLOAT`, `DOUBLE`. |
| Boolesch | 1 an 0. |
| Strings | Benotzt fir Persoun-, Grupp-, Sessiouns- a Kategoriespalten; e String, deen no enger Zuel ausgesäit, gëtt fir numeresch Rollen akzeptéiert. |
| `TIMESTAMP`-, `DATE`-Logiktypen | Dekodéiere zu Zäitpunkten (Millisekonnen zanter 1970); wann als Zäitachs benotzt, gëtt d'Eenheet-Astellung ignoréiert. |
| Verschachtelt Spalten | Struct- a Lëschtespalten sinn fir keng Roll gemeent (si erschéngen als JSON-Text an der Virschau); net getest. |
| Footer-Metadaten | De Schlëssel `heat3d` gëtt als Zuuerdnungshiweiser gelies (hei ënnen). |

Eng Positiouns-, Zäit- oder Blécksspalt, déi eppes anescht wéi eng Zuel enthält, gëtt als fehlend dekodéiert.

## Spaltenrollen a Typen {#column-roles-and-types}

| Roll | Typ an der Fichier | Néideg | Gespäichert als | Gränzen |
|---|---|---|---|---|
| X, Y, Z | Zuel | zwou vu dräi | 32-Bit-Float, nom [Achsen-Zuuerdnung](axes-units-and-time.md) | Eng Zeil ouni brauchbar Positioun gëtt fortgeworf. |
| Zäit | Zuel an enger vun de [Zäiteenheeten](axes-units-and-time.md#time-units), Parquet-Zäitstempel oder ISO-8601-Text | nee | 32-Bit-Float Sekonnen vun der fréisten Zeil | Sortéiere gëtt ofgelehnt bei méi wéi 400.000.000 Zeilen ([firwat](memory-and-budgets.md#the-sort-ceiling)). |
| Persoun | egal; Wierderbuch-kodéiert | nee | 32-Bit-ID | |
| Sessioun | egal; Wierderbuch-kodéiert | nee | 32-Bit-ID | Etiketten fir bis zu 100.000 Sessiounen opgelëscht. |
| Grupp | egal; Wierderbuch-kodéiert | nee | 16-Bit-ID | Bis 4.096 Gruppen, soss fällt d'Gruppéierung fort. |
| Yaw, Pitch | Zuel, Grad oder Radianten | nee | 32-Bit-Float Radianten | |
| Richtung X, Y, Z | Zuel | nee (all dräi zesummen) | ëmgerechent a Yaw an Pitch | |
| Filterspalt, *Beräich* | Zuel | nee | 32-Bit-Float | Bis 4 Filter gläichzäiteg aktiv. |
| Filterspalt, *Kategorie* | egal; Wierderbuch-kodéiert | nee | 32-Bit-ID | Bis 4.096 Wäerter, soss gëtt d'Spalt net behalen. |

Eng Parquet-`TIMESTAMP`-Spalt, déi als Filterspalt behalen gëtt, ass e *Beräich* vu Epoch-Millisekonnen - en Schieber, keng Lëscht.

## Den `heat3d`-Hiweiser {#the-heat3d-hints}

Eng Parquet-Fichier kann hir eege Leseanweisungen an hiren Footer-Schlëssel-Wäert-Metadaten droen, ënnert dem Schlëssel **`heat3d`**, als JSON-Objet ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). De Betrachter wennt se iwwer seng eege Schätzungen un, wann d'Fichier déi éischt vun enger Auswiel ass; all Eintrag ass fakultativ, an all Resultat gëtt nach ëmmer gewisen an ass am Panel [Spalten-Zuuerdnung](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) änderbar. Alles, wat sech net als JSON-Objet liest, gëtt ignoréiert.

### Schema {#schema}

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

| Eintrag | Gëllt wann | Effekt |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | déi genannte Spalt gëtt et an der Fichier | Setzt déi Roll. |
| `columns.timeUnit` | et ass ee vun de siwe Eenheeten | Setzt d'Zäiteenheet. |
| `columns.angleUnit` | `"degrees"` oder `"radians"` | Setzt d'Winkeleenheet. |
| `columns.lookMode` | `"vector"` mat dirX, dirY an dirZ all gesat; `"yawPitch"` mat yaw gesat; `"none"` | Setzt de Blécksmodus. |
| `columns.extra` | et ass en Array | Ersetzt d'automatesch Filterlëscht, a behält nëmmen existent Spalten, déi keng Roll benotzt; all eng ass *Beräich*, wann se an der Virschau numeresch ausgesäit, soss *Kategorie*. Ouni dëst bleift d'automatesch Lëscht, awer ouni all Spalt, déi e Hiweis enger Roll zougeuerdnet huet. |
| `axes.up` | `"y"` oder `"z"` | Uewescht Achs. |
| `axes.flipX/Y/Z` | e Boolean | Dréint d'Achs ëm. |
| `axes.scale` | eng Zuel > 0 | Eenheetsskala. |
| `entity.size` | eng Zuel > 0 | [Objektgréisst](sessions-persons-groups.md#entity-size) (beim Lueden mat der Eenheetsskala multiplizéiert). Dat ass déi eenzeg Manéier, se ze setzen. |

### Beispill {#example}

E erfonnen Export vun engem Shooter: Z-uewen, Zentimeter, eng linkshänneg Welt, Spiller ongeféier 72 cm breet.

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

### Schreiwen {#writing-it}

Mat pyarrow gëtt eng eegen Schema-Metadatestéck an d'Schlëssel-Wäert-Metadaten vun der Fichier geschriwwen:

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

`npm run inspect -- file.parquet` druckt d'Schema vun enger Fichier, eng séier Manéier fir d'Spaltennimm ze kontrolléieren, op déi d'Hiweiser sech bezéien.

## Wat den Heatmap-Tab schreift {#what-the-heatmap-tab-writes}

Näischt gëtt zréck an d'Donnéeën geschriwwen. D'Ausgänge sinn:

- Videoen als WebM (VP9 oder VP8) - [Kamera-Wee a Video](camera-path-and-video.md);
- eng Kamerapositioun, als Text an d'Zwëschenablage kopéiert - [Kamera](camera.md#pose);
- Levelen, déi an der [Level-Bibliothéik](level-library.md) vum Browser gespäichert sinn.
