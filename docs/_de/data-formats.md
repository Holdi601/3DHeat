---
title: "Referenz der Datenformate"
nav_order: 19
lang: "de"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Referenz der Datenformate

Diese Seite listet jede Art von Datei auf, die 3DHeat öffnen kann, und wie eine Tabelle darin aussehen muss. Eine Tabelle besteht aus Zeilen und Spalten, wie eine Tabellenkalkulation: Jede Zeile sagt, wo etwas war und, wenn du es hast, wann und wer.

Was der Reiter Heatmap liest, Spalte für Spalte, und die Hinweise, die eine Parquet-Datei enthalten kann. (Der Reiter Rennanalyse liest Rundendateien, der Reiter Match die Match-Zusammenfassungen; siehe [Rennanalyse](race-analysis.md) und [Match-Analyse](match-analysis.md).)

## Dateien {#files}

Dies ist die eine vollständige Liste aller ladbaren Dateien. Das Feld **Quelle** (**Dateien…**, **Ordner…** oder Ziehen und Ablegen) nimmt genau diese an:

| Endung | Was es ist | Gelesen von |
|---|---|---|
| `.parquet`, `.pq` | Parquet-Tabelle | der Parquet-Leser (unten) |
| `.csv`, `.tsv`, `.txt` | Text mit Trennzeichen | der Textleser (unten) |
| `.3dheat` | Ein Match in einer Datei (ein ZIP mit der Tabelle und ihren Zusätzen) | lädt als die Tabelle, die es enthält – [Ein Match in einer Datei](container.md) |
| `.acmi` (auch `.txt.acmi`, `.zip.acmi`) | Tacview-Flugaufzeichnung | ihr eigener Leser – [Tacview-Aufzeichnungen](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-Aufzeichnung (wie Arma) | ihr eigener Leser |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-Spuren: GPX, KML/KMZ, NMEA-Protokolle, IGC-Segelflugprotokolle, FIT-Sportdateien | ihr eigener Leser; Positionen kommen aus Breite und Länge |

Nicht als Positionen geladen: die kleinen JSON-Dateien neben einer Tabelle, die sie beschreiben (Namen, die auf `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json` enden), und die zusätzlichen Tabellen eines Konverters (`<match>.events.parquet` und ähnliche, siehe [Konverter](converters.md)), sofern du sie nicht einzeln auswählst. Alles andere wird mit einem Grund übersprungen. Wie eine Auswahl gefiltert wird, steht unter [Dateien laden](loading-files.md#which-files-are-kept).

Leere Dateien werden übersprungen. In einer Auswahl, die `movement*.<endung>`-Dateien enthält, werden nur diese geladen ([Dateien laden](loading-files.md#which-files-are-kept)).

Die Daten sind **eine Zeile pro Probe**: eine Position zu einem Zeitpunkt, optional mit Wer, welcher Gruppe, welcher Sitzung, wohin geschaut wurde, und weiteren Spalten. Ereigniszeilen (ein Abschuss, eine Platzierung, ein Schuss) können in derselben Tabelle stehen wie Positionszeilen; sie werden durch eine Ereignisspalte unterschieden.

## Text mit Trennzeichen (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Eine kleinste nützliche Datei, drei Zeilen:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Die Spalten ordnen sich selbst zu ([Spaltenzuordnung](column-mapping.md)).

Gelesen von einem Scanner auf Byte-Ebene, der nur die zugeordneten Spalten dekodiert ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekt | Regel |
|---|---|
| Kopfzeile | Die erste nicht leere Zeile enthält die Spaltennamen. Ein leerer Name wird zu `column_N`. |
| Trennzeichen | Aus den ersten 20 nicht leeren Zeilen der ersten 1 MiB erkannt, unter Komma, Semikolon, Tabulator und Pipe, nach **Konsistenz**: Das Trennzeichen, das in jeder geprüften Zeile dieselbe Feldanzahl ergibt, gewinnt, dann das, das mehr Felder ergibt. Leerzeichen wird nie erkannt, kann aber gewählt werden; jedes einzelne Zeichen kann eingetippt werden ([Spaltenzuordnung](column-mapping.md#the-fields)). |
| Anführungszeichen | RFC 4180: Felder dürfen in doppelte Anführungszeichen gesetzt sein, `""` innerhalb von Anführungszeichen ist ein wörtliches Anführungszeichen. |
| Leerraum | Führende und nachgestellte Leerzeichen, Tabulatoren und Anführungszeichen werden von jedem Feld abgeschnitten. |
| Felder pro Zeile | Höchstens 4.096; mehr ist ein Fehler (*Stimmt das Trennzeichen?*). |
| Zahlen | Optionales Vorzeichen, Ziffern, optionaler Punkt und Dezimalstellen, optionaler Exponent (`1.5e-3`). Ein Dezimalkomma (`1,5`), Tausendertrennzeichen oder nachgestellte Einheiten (`12 m`) werden nicht gelesen und zählen als fehlend. Wenn deine Datei Dezimalkommas nutzt, ersetze sie vor dem Laden durch Punkte (Suchen und Ersetzen in einem Texteditor funktioniert). |
| Zahlenspalte | Eine Spalte wird als Zahlenspalte angeboten, wenn mehr als 90 % der nicht leeren Werte in den ersten 50 Zeilen als Zahlen gelesen werden. |
| Zeilenanzahl | Vor dem Laden aus der durchschnittlichen Zeilenlänge der ersten 1 MiB geschätzt. |
| Textkodierung | UTF-8. |

## Parquet {#parquet}

Gelesen mit [hyparquet](https://github.com/hyparam/hyparquet), Spaltenblock für Spaltenblock in typisierte Arrays, wobei nur die zugeordneten Spalten angefordert werden ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekt | Regel |
|---|---|
| Zeilenanzahl | Genau, aus dem Footer, vor dem Laden. |
| Vorschau | Die ersten 50 Zeilen, als Objekte dekodiert; ihre Werte entscheiden, welche Spalten wie Zahlen aussehen. |
| Ganzzahlen | `INT32` und `INT64` (als BigInt dekodiert) werden zu Zahlen. |
| Gleitkommazahlen | `FLOAT`, `DOUBLE`. |
| Wahrheitswerte | 1 und 0. |
| Zeichenketten | Für Spalten mit Person, Gruppe, Sitzung und Kategorie; eine zahlenartige Zeichenkette wird für Zahlenrollen akzeptiert. |
| Logische Typen `TIMESTAMP`, `DATE` | Werden zu Zeitpunkten dekodiert (Millisekunden seit 1970); als Zeitachse benutzt ist die Einstellung der Einheit ohne Wirkung. |
| Verschachtelte Spalten | Struct- und List-Spalten sind für keine Rolle gedacht (sie zeigen sich in der Vorschau als JSON-Text); nicht getestet. |
| Footer-Metadaten | Der Schlüssel `heat3d` wird als Zuordnungshinweise gelesen (unten). |

Eine Position-, Zeit- oder Blickspalte, die etwas anderes als eine Zahl enthält, wird als fehlend dekodiert.

## Spaltenrollen und Typen {#column-roles-and-types}

| Rolle | Typ in der Datei | Pflicht | Gespeichert als | Grenzen |
|---|---|---|---|---|
| X, Y, Z | Zahl | zwei von dreien | 32-Bit-Gleitkommazahl, nach der [Achsenzuordnung](axes-units-and-time.md) | Eine Zeile ohne brauchbare Position wird verworfen. |
| Zeit | Zahl in einer der [Zeiteinheiten](axes-units-and-time.md#time-units), Parquet-Zeitstempel oder ISO-8601-Text | nein | 32-Bit-Gleitkommazahl in Sekunden ab der frühesten Zeile | Sortieren wird ab 400.000.000 Zeilen verweigert ([warum](memory-and-budgets.md#the-sort-ceiling)). |
| Person | beliebig; wörterbuchkodiert | nein | 32-Bit-ID | |
| Sitzung | beliebig; wörterbuchkodiert | nein | 32-Bit-ID | Beschriftungen bis 100.000 Sitzungen aufgelistet. |
| Gruppe | beliebig; wörterbuchkodiert | nein | 16-Bit-ID | Bis 4.096 Gruppen, sonst wird die Gruppierung verworfen. |
| Gierwinkel, Nickwinkel | Zahl, Grad oder Bogenmaß | nein | 32-Bit-Gleitkommazahl im Bogenmaß | |
| Blickrichtung X, Y, Z | Zahl | nein (alle drei zusammen) | in Gier- und Nickwinkel umgerechnet | |
| Filterspalte, *Bereich* | Zahl | nein | 32-Bit-Gleitkommazahl | Beliebig viele Filter gleichzeitig aktiv. |
| Filterspalte, *Kategorie* | beliebig; wörterbuchkodiert | nein | 32-Bit-ID | Bis 4.096 Werte, sonst wird die Spalte nicht behalten. |

Eine Parquet-Spalte vom Typ `TIMESTAMP`, die als Filterspalte behalten wird, ist ein *Bereich* aus Epochen-Millisekunden – ein Schieberegler, keine Liste.

## Ergebnisspalten {#outcome-columns}

Wer gewonnen hat, in jeder Zeile. So lässt sich ein Ort, ein Weg oder ein Spielzug danach beurteilen, wie oft seine Seite danach gewonnen hat ([Siegquote](win-rate.md)). Der Viewer behält diese Spalten von selbst, listet sie in den [Filtern](filters.md) zuerst, in der Sprache des Viewers, und liest sie in der [Siegquoten-Karte](win-rate.md), der [Aufschlüsselung](breakdown.md) und der [Volumen-Statistik](volumes.md#statistics). Ein Konverter für ein rundenbasiertes Spiel (CS2, Valorant, Rainbow Six Siege) oder ein matchbasiertes (War Thunder) schreibt alle vier; der Tacview-Konverter schreibt sie für die Kampagnen eines DCS-Servers, wo eine Rundendatei sagt, wer gewonnen hat ([DCS-Server](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Spalte | Typ | Bedeutung |
|---|---|---|
| `won` | 0/1 (leer, wo unbekannt) | die Seite (das Team) der Zeile hat **die Runde** gewonnen; in einem Spiel ohne Runden das Match |
| `matchWon` | 0/1 (leer, wo unbekannt) | die Seite (das Team) der Zeile hat **das Match** gewonnen; leer, wo die Aufnahme das Ende nicht zeigt |
| `round` | ganze Zahl, ab 1 | die Runde, zu der die Zeile gehört; in einem matchbasierten Spiel durchgehend 1 |
| `roundEndReason` | Text | wie die Runde endete (in einem matchbasierten Spiel das Match), mit den Wörtern unten |

`won` und `matchWon` gehören zur Seite der Zeile: Die Zeilen eines T-Spielers tragen das Ergebnis der T-Seite, die Zeilen einer KI-Einheit das ihres Teams; Zeilen, die zu keiner Seite gehören, lassen sie leer. Eine Seite, die zur Halbzeit wechselt, behält ihr eigenes `matchWon` und nimmt das `won` jeder Runde so, wie sie sie gespielt hat. Ein Unentschieden ist für beide Seiten 0.

Die Gründe für das Ende, gemeinsam für alle Spiele, damit ein Filter für alle funktioniert (das eigene Wort eines Spiels wird zugeordnet, wo es geht, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Bedeutung | Spiele |
|---|---|---|
| `elimination` | jeder Spieler einer Seite ist raus | CS2, Valorant, Rainbow Six Siege |
| `bomb` | die Bombe (der Spike, das Ziel des Entschärfers) ist explodiert | CS2, Valorant, Rainbow Six Siege |
| `defuse` | die Bombe (der Spike) wurde entschärft | CS2, Valorant, Rainbow Six Siege |
| `time` | die Rundenuhr ist abgelaufen; War Thunder: entschieden, als beide Seiten noch Tickets hatten | alle |
| `surrender` | eine Seite hat aufgegeben | CS2, Valorant, Rainbow Six Siege |
| `draw` | kein Sieger | CS2 |
| `objective` | ein Ziel eingenommen oder gehalten (Geisel befreit, Bereich gesichert) | Rainbow Six Siege |
| `capture` | Tickets ausgeblutet, während der Sieger Eroberungszonen hielt; DCS: eine persistente Kampagne, gewonnen durch die Einnahme jedes Flugplatzes und jeder Zone | War Thunder, DCS |
| `tickets` | Tickets durch Abschüsse verloren | War Thunder |
| `destruction` | die letzten Fahrzeuge auf einmal verloren, niemand mehr übrig zum Spawnen | War Thunder |
| `other` | alles andere | |

Nenne sie auch in der Liste `extra` der `heat3d`-Hinweise, wie jede andere Spalte. Die Spaltennamen `win`, `round_won`, `match_won`, `end_reason` und `win_reason` werden als dieselben Spalten gelesen.

### Wer gewonnen hat, anders gesagt {#who-won-said-another-way}

Nicht jede Quelle schreibt `won` je Zeile. Der Viewer leitet es beim Laden her, für jede Datei, CSV oder Parquet, aus einer Datei oder vielen:

- **Eine Siegerspalte.** Eine Spalte namens `winner`, `winning_team`, `winning_side`, `winning_faction`, `round_winner` oder `victor` nennt die Seite, die die Runde gewonnen hat (`match_winner`, `game_winner` oder `match_winning_team`: das Match). Wo die Datei kein `won` (kein `matchWon`) hat, bekommt jede Zeile eines daraus: 1, wo der Sieger die [Gruppe](glossary.md) der Zeile ist, 0, wo es eine andere ist, leer, wo es keinen Sieger gibt (leer, `draw`, `tie`). Namen werden locker verglichen: `Team 1`, `team_1` und `1` sind eine Seite, ebenso `Terrorists` und `T`, `CT` und `Counter-Terrorists`, `BLUFOR` und `blue`. Ein Sieger, der keine Gruppe, sondern einen Spieler nennt (Jeder gegen jeden), gibt dessen Zeilen 1. Die Siegerspalte wird nie als Gruppe erraten, auch wenn `winning_faction` danach klingt.
- **`won` als Wörter.** `true`/`false`, `yes`/`no`, `won`/`lost` werden als 1 und 0 gelesen.
- **Leer gelassene Zeilen.** Eine Ereigniszeile, die ein Konverter ohne `won` geschrieben hat (ein Abschuss, ein Legen), übernimmt das Ergebnis ihrer Seite im selben Match und, für `won`, in derselben `round`, wo die übrigen Zeilen dieser Seite übereinstimmen.

Die hergeleiteten Spalten heißen `won` und `matchWon` und verhalten sich genau wie solche, die die Datei geschrieben hat: die Filter **Rundenergebnis** und **Matchergebnis**, die Siegquoten-Karte, **Gewonnen gegen verloren** in der [Differenz-Aufteilung](difference.md), die Aufschlüsselung, das [Versus-Feld](compare-groups.md), die Ereignisliste der Wiedergabe und die [Massenanalyse](mass-analysis.md) lesen sie alle.

## Die `heat3d`-Hinweise {#the-heat3d-hints}

Eine Parquet-Datei kann ihre eigenen Leseanweisungen in den Schlüssel-Wert-Metadaten ihres Footers tragen, unter dem Schlüssel **`heat3d`**, als JSON-Objekt ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Der Viewer wendet sie über seine eigenen Vermutungen an, wenn die Datei die erste einer Auswahl ist; jeder Eintrag ist optional, und jedes Ergebnis wird weiterhin angezeigt und im Feld [Spaltenzuordnung](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) bearbeitbar. Alles, was sich nicht als JSON-Objekt lesen lässt, wird ignoriert.

### Schema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          Spaltennamen für die Position
    "time": string,                                  die Zeitspalte
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "timeLabel": string,                             wovon an die Zeit zählt, z. B. "since round start"
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           zu behaltende Filterspalten, die nützlichsten zuerst
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  muss > 0 sein
  },
  "entity": {
    "size": number                                   Größe eines verfolgten Dings in Dateieinheiten, > 0
  }
}
```

| Eintrag | Angewendet, wenn | Wirkung |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | die genannte Spalte in der Datei existiert | Setzt diese Rolle. |
| `columns.timeUnit` | es eine der sieben Einheiten ist | Setzt die Zeiteinheit. |
| `columns.timeLabel` | die Zeitspalte die genannte ist, ihre Einheit keine Uhrzeit ist, alle geladenen Dateien dasselbe sagen und keine Aufnahmen auf einen gemeinsamen Start verschoben wurden | Die Zeitleiste zeigt die eigene Zeit der Datei (statt der Zeit seit dem ersten Messpunkt) und dahinter die Angabe, wie geschrieben: `1:23 / 20:00 since round start`. |
| `columns.angleUnit` | `"degrees"` oder `"radians"` | Setzt die Winkeleinheit. |
| `columns.lookMode` | `"vector"`, wenn dirX, dirY und dirZ alle gesetzt sind; `"yawPitch"`, wenn yaw gesetzt ist; `"none"` | Setzt den Blickmodus. |
| `columns.extra` | es ein Array ist | Ersetzt die automatische Filterliste und behält nur vorhandene Spalten, die keine Rolle belegen; jede ist *Bereich*, wenn sie in der Vorschau wie eine Zahl aussah, sonst *Kategorie*. Ohne sie bleibt die automatische Liste, abzüglich jeder Spalte, die ein Hinweis einer Rolle zugewiesen hat. |
| `axes.up` | `"y"` oder `"z"` | Hochachse. |
| `axes.flipX/Y/Z` | ein Wahrheitswert | Spiegelungen. |
| `axes.scale` | eine Zahl > 0 | Einheitenmaßstab. |
| `entity.size` | eine Zahl > 0 | [Größe der Entität](sessions-persons-groups.md#entity-size) (beim Laden mit dem Einheitenmaßstab multipliziert). Der einzige Weg, sie zu setzen. |

### Beispiel {#example}

Ein erfundener Export eines Shooters: Z nach oben, Zentimeter, eine linkshändige Welt, Spieler etwa 72 cm breit.

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

### So schreibst du sie {#writing-it}

Mit pyarrow werden eigene Schema-Metadaten in die Schlüssel-Wert-Metadaten der Datei geschrieben:

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

`npm run inspect -- file.parquet` gibt das Schema einer Datei aus; so prüfst du schnell die Spaltennamen, auf die sich die Hinweise beziehen.

## Was der Reiter Heatmap schreibt {#what-the-heatmap-tab-writes}

Nichts wird in die Daten zurückgeschrieben. Die Ausgaben sind:

- Videos als WebM (VP9 oder VP8) – [Kamerapfad und Video](camera-path-and-video.md);
- eine Kameraposition, als Text in die Zwischenablage kopiert – [Kamera](camera.md#pose);
- Levels, gespeichert in der [Level-Bibliothek](level-library.md) des Browsers.
