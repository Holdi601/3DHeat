---
title: "Eine Datei pro Match (.3dheat)"
parent: "Daten laden"
nav_order: 9
lang: "de"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Eine Datei pro Match: `.3dheat`

Eine `.3dheat`-Datei ist ein ganzes Match in einer einzigen Datei, zum Kopieren, Aufbewahren oder Teilen. Zum Öffnen legst du die Datei einfach auf das Feld Quelle.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Ein konvertiertes Match war früher mehrere Dateien nebeneinander: die Tabelle `<match>.parquet`, das Match-Dokument `<match>.match.json` und die Begleitdateien `<match>.<was>.parquet` ([Konverter bewahren alles](converters.md)). Eine `.3dheat`-Datei enthält alle in einer: eine Wiedergabe, eine Datei, zum Kopieren, Aufbewahren oder Teilen.

Sie ist so gebaut, dass das Laden tausender davon so schnell ist wie das Laden der losen Tabellen, und dass spätere Konverter weit mehr hineinlegen können, ohne ein neues Format.

## Eine laden {#loading-one}

Überall, wo eine Datei oder ein Ordner geladen wird, lädt auch eine `.3dheat`-Datei, und ein Ordner darf Container und lose Dateien mischen:

| Wo | Was aus dem Container gelesen wird |
|---|---|
| **Heatmap**-Quellfeld (Dateien, Ordner, Ziehen und Ablegen) | seine Tabellen, als wären sie die losen `<match>.parquet` |
| **Heatmap → Viele Matches auf einmal** (Dateien, Ordner, Ordner hinzufügen) | seine Tabellen, direkt von den Workern des Laders gelesen |
| **Match**-Tab (Laden, oder auf die Ansicht ziehen) | das Match-Dokument |
| Telemetrie der **Taktik**-Tafel | seine Tabellen |

Das Öffnen eines Containers liest zwei kleine Teile davon, sein Verzeichnis am Ende und sein Manifest am Anfang; von einer Tabelle wird nichts gelesen, bis der Lader sie liest. Begleitdateien und das Match-Dokument werden nur gelesen, wenn etwas danach fragt. Ein Ordner, der dasselbe Match zweimal enthält, lose und gepackt, lädt es einmal.

## Packen und Entpacken {#packing-and-unpacking}

Neue Konvertierungen schreiben standardmäßig Container: der War-Thunder-Konverter (`heat3d-wt-replay`), der CS2-Konverter (`heat3d_cs2 demos`) und das Tacview-Werkzeug (`node tools/acmi-to-parquet.mjs`). `--loose` behält die getrennten Dateien.

Früher oder von anderen Werkzeugen konvertierte Matches werden mit diesem Befehl gepackt:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** findet unter den Ordnern jede Tabelle `<match>.parquet` mit den Dateien, die zu ihr gehören, und schreibt `<match>.3dheat` daneben. Ein schon gepacktes Match wird übersprungen. Jeder Container wird vollständig zurückgelesen (jedes Mitglied mit seinem sha256, seiner Größe, CRC und Parquet-Footer), bevor etwas anderes geschieht; die losen Dateien werden nur mit `--delete-loose` gelöscht, und bei einem früher gepackten Match nur, wenn sie Byte für Byte dem entsprechen, was der Container enthält. Ein Match mit einer Datei, die in den letzten `--settle`-Minuten geändert wurde (standardmäßig 10), bleibt unangetastet: Ein Konverter schreibt vielleicht noch.
- **unpack** schreibt die Mitglieder als lose Dateien neben den Container zurück.
- **update** fügt Mitglieder hinzu oder ersetzt sie, ohne die Tabellen neu zu schreiben, die schon im Container sind (unten).
- **repack** schreibt einen Container vollständig neu und verwirft, was Updates zurückgelassen haben.

## Das Format {#the-format}

Eine `.3dheat`-Datei ist ein ZIP-Archiv (jedes ZIP-Werkzeug öffnet sie), mit diesen Regeln:

1. **`manifest.json` ist das erste Mitglied**, wenn ein Container geschrieben wird, und ist immer vorhanden. Es wird über das ZIP-Zentralverzeichnis gefunden, daher kann es nach einem `update` weiter hinten in der Datei liegen.
2. **Mitglieder, die nach Bytebereich gelesen werden oder schon komprimiert sind, werden gespeichert** (ZIP-Methode 0): Parquet, Arrow, Bilder, Modelle, Audio, Video, undurchsichtige Blobs. Ein gespeichertes Mitglied ist ein zusammenhängender Bytebereich des Containers, sodass ein Leser den Footer einer Tabelle und ihre Spaltenabschnitte an Ort und Stelle liest, per `File.slice` im Browser oder einer HTTP-Bereichsanfrage, genau so wie er die lose Datei lesen würde.
3. **Text wird deflated** (Methode 8): JSON, CSV, einfacher Text. Das ist klein und wird ganz gelesen.
4. Namen sind UTF-8 (Flag-Bit 11), relativ, mit `/` als Trenner, ohne `..`; sie dürfen Ordner enthalten (`analysis/heat.json`). Eine lose gepackte Datei behält ihren Namen, daher gibt Entpacken dieselben Dateien zurück.
5. Mitglieder größer als 4 GiB oder Container mit mehr als 65.535 Mitgliedern verwenden ZIP64 wie üblich. Schreiber setzen nach Mitgliedern keine Datendeskriptoren.

Die Mitglieder, die die Konverter heute schreiben, in dieser Reihenfolge:

| Rolle | Mitglied | Gespeichert |
|---|---|---|
| `table` | `<match>.parquet` | ja |
| `match` | `<match>.match.json` | nein (deflated) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | ja |
| `summary` | `<match>.summary.json`, der Zusammenfassungsindex der Massenanalyse ([Massenanalyse](mass-analysis.md)), ergänzt von `tools/3dheat-summarize.mjs` | nein (deflated) |

Die Tabelle kommt direkt nach dem Manifest, sodass das erste Lesen des Dateianfangs durch den Leser das Manifest und den lokalen Header der Tabelle zusammen abdeckt.

### Das Manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Feld | Bedeutung |
|---|---|
| `format` | immer `3dheat` |
| `format_version` | `Haupt.Neben` (unten) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | was das Match ist und was es erzeugt hat; `null`, wo unbekannt |
| `created`, `updated` | wann geschrieben, wann zuletzt aktualisiert (`updated` erscheint nur nach einem Update) |
| `roles` | jede Rolle auf den Namen ihres ersten Mitglieds: ein schneller Index |
| `members` | jedes Mitglied außer dem Manifest: die vollständige Liste, und die, der ein Leser vertraut |
| `matches` | optional: die Matches eines Containers mit mehreren (unten) |
| `references` | optional: Dateien, die der Container braucht, aber nicht enthält |
| `extensions` | optional: die eigenen Metadaten eines Konverters |

Jedes Mitglied:

| Feld | Bedeutung |
|---|---|
| `name` | sein Pfad im Container |
| `role` | wofür es da ist (unten) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` oder `deflate` |
| `bytes` | seine Größe, unkomprimiert |
| `sha256` | über seine Bytes, unkomprimiert |
| `rows` | die Zeilenzahl einer Tabelle |
| `schema` | die Konvention, der es folgt, `{ "id", "version" }`: das eigene `format` und `version` eines Dokuments (`heat3d-wt-replay-match` 2), `heat3d-table` für eine Tabelle, die der Viewer über ihren `heat3d`-Footer liest, `heat3d-acmi-table` für die des Tacview-Werkzeugs |
| `match` | in einem Container mit mehreren Matches die `matches[].id`, zu der es gehört |

### Für Wachstum gebaut {#made-to-grow}

Das Format soll weit reichere Wiedergaben tragen als heute, ohne zu brechen, was es jetzt liest:

- **Versionierung.** `format_version` ist `Haupt.Neben`. Ein Leser liest jede Nebenversion seiner Hauptversion und ignoriert jedes Feld, das er nicht kennt. Die Nebenversion steigt, wenn etwas hinzukommt; die Hauptversion nur, wenn sich das Layout so ändert, dass ein älterer Leser es falsch lesen würde (ein Mitglied nicht mehr gespeichert, das Manifest aus dem Archiv verlegt). Die eigene Konvention jedes Mitglieds wird getrennt versioniert, in seinem `schema`, sodass ein neues Tabellenlayout oder eine neue Dokumentversion keine neue Containerversion braucht. Die ersten geschriebenen Container sagten stattdessen `"version": 1`; Leser nehmen das als 1.0.
- **Rollen sind offen.** Eine Rolle ist jede Zeichenkette. Leser nutzen die Rollen, die sie kennen, und behalten den Rest: eine unbekannte Rolle wird aufgelistet, nie abgelehnt, und `update` und `repack` tragen sie unverändert weiter. Eine Rolle darf viele Mitglieder haben: mehrere Tabellen (Spuren je Einheit, Telemetrie mit anderen Raten), Ereignisse, Sprache, Video-Synchronisation, Kartenverweise, Figuren-Überschreibungen, Analyseergebnisse. Namen dürfen Ordner enthalten.
- **Jede Medienart.** Ein Mitglied darf alles sein, was einen Medientyp hat: Parquet, JSON, Arrow, PNG- oder JPEG-Vorschaubilder, glTF-Modelle, Audio, rohe Blobs.
- **Mehrere Matches.** Eine Sitzung oder ein Turnier darf in einen Container: `matches` listet sie auf (`{ "id", "map", "mode", "started", ... }`), und jedes Mitglied nennt sein `match`. Der Viewer lädt jedes Mitglied der Rolle `table`.
- **Verweise.** Dateien, die ein Container braucht, aber nicht enthält, etwa eine Karte für ein Match, werden in `references` nach Name und sha256 aufgelistet (`{ "kind": "level", "name": "...", "sha256": "..." }`), sodass die richtige Datei gefunden und geprüft wird, ohne sie in jedes Match zu kopieren.
- **Erweiterungen.** `extensions` enthält die eigenen Metadaten eines Konverters unter seinem eigenen Schlüssel, `"<hersteller>/<name>": { ... }`, sodass zwei Konverter nie kollidieren und nichts zu den gemeinsamen Feldern hinzugefügt werden muss.
- **Aktualisieren an Ort und Stelle.** `update` fügt Mitglieder hinzu oder ersetzt sie, ohne die großen gespeicherten Tabellen neu zu schreiben: die neuen Mitglieder und ein neues Manifest werden nach dem Ende des Containers angehängt, gefolgt von einem neuen Zentralverzeichnis. Was ersetzt wurde, bleibt als nicht referenzierte Bytes, bis `repack` kommt. Jedes Mitglied und jedes Manifestfeld, bekannt oder nicht, bleibt erhalten. Ein fehlgeschlagenes Update wird auf den Container, wie er vorher war, zurückgeschnitten.

Die Tests des Viewers prüfen das: Ein Container des Formats 1.7 mit einer unbekannten Rolle, einem Mitgliedsfeld, einer Erweiterung und einem Audio-Mitglied in einem Ordner lädt, und er übersteht ein Update und ein Repack mit allem unversehrt; ein Container der Hauptversion 2 wird abgelehnt.

## Schreiber {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs) (schreiben, lesen, prüfen, aktualisieren, repack), genutzt vom Pack-Werkzeug und vom Tacview-Werkzeug.
- Python: `container.py`, etwa 140 Zeilen auf dem Standard-`zipfile`, dieselbe Datei in jedem Konverter (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), damit kein Konverter von einem anderen abhängt. Ein neuer Konverter kopiert sie.
- Der Viewer liest mit [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
