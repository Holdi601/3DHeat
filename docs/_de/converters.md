---
title: "Konverter behalten alles"
parent: "Daten laden"
nav_order: 8
lang: "de"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konverter behalten alles

Du brauchst diese Seite nicht, um ein Replay zu öffnen. Sie ist für Leute, die Werkzeuge schreiben, die Spieldateien in Tabellen für 3DHeat verwandeln, und für alle, die wissen wollen, warum diese Tabellen so viel enthalten.

Jedes Werkzeug, das das Replay, die Demo, das Protokoll oder die Live-Telemetrie eines Spiels in etwas verwandelt, das der Viewer öffnet, folgt einer Regel:

> **Konvertiere alles, was die Quelle enthält und das jetzt lesbar ist, und behalte den Rest ganz, damit er später ohne die Originaldatei gelesen werden kann.**

Ein Replay ist nach einem Spielupdate, einer Neuinstallation oder einer vollen Festplatte oft weg, und ein Live-Feed ist in dem Moment weg, in dem er gesendet wurde. Was ein Konverter weglässt, ist endgültig verloren; was er ganz behält, lässt sich an dem Tag decodieren, an dem jemand es versteht. Deshalb entscheidet ein Konverter nie, was nützlich sein wird: Er decodiert, was er kann, behält jede andere Nachricht, jedes Paket, jedes Ereignis, jede Eigenschaft oder Zeile unverändert neben der Tabelle und sagt in seiner eigenen Ausgabe, wie viel von jedem er gelesen hat und wie viel er nur behalten hat.

Diese Seite ist die Konvention, die alle Konverter teilen: die Konverter für Replays von War Thunder, World of Tanks, World of Warships und Squad, den Konverter für CS2-Demos, den Hintergrund-Watcher (seinen Dota-Replay-Decoder und jeden Live-Adapter), die Telemetrie-Leser des Aufnahmewerkzeugs für Spiele und die eigenen Importe des Viewers (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Die eigenen Leser des Viewers stehen in [Tacview-Aufnahmen](tacview-acmi.md) und [Dateien laden](loading-files.md); die Ein-Datei-Form steht in [Eine Datei pro Match](container.md). Ein Match wird zu einer Tabelle, einer `match.json` und Beiwagen-Dateien, optional in einer `.3dheat`-Datei zusammengepackt. Der README jedes Werkzeugs hat einen Abschnitt **Vollständigkeit**, der für diese Quelle auflistet, was gelesen wird, was roh behalten wird und was nicht verfügbar ist, und warum.

## Drei Ablagen für jedes Element {#three-homes-for-every-item}

Alles, was eine Quelle enthält, landet genau an einem von drei Orten:

| Ablage | Was dorthin gehört |
|---|---|
| **Decodiert** | Die Tabelle (eine Zeile je Messwert oder Ereignis, die Spalten, die der Viewer liest, und zusätzliche Spalten für jeden anderen Wert, der zu einer Zeile gehört) und das Match-Dokument `<match>.match.json` (alles, was zum Match als Ganzes gehört: Einstellungen, Aufstellungen, Ergebnisse, Wertungstafeln, die Selbstprüfung). |
| **Roh behalten** | Eine Beiwagen-Datei neben der Tabelle: jedes Element, das nicht oder nur teilweise decodiert ist, ganz und unverändert, mit seinem Typ, seiner Zeit und der Einheit oder Entität, zu der es gehört. |
| **Nicht verfügbar** | Im Abschnitt Vollständigkeit des README mit dem Grund genannt: Das Format enthält es nicht (ein Client-Replay hat keine Eingaben der anderen Spieler), die Quelle sendet es nie, oder es zu lesen ist nicht erlaubt (ein geschützter Prozess, ein verschlüsselter Block, dessen Schlüssel nicht unserer ist). |

Ein **teilweise** decodiertes Element wird *sowohl* decodiert *als auch* roh behalten: Die Tabelle bekommt, was verstanden wird, die Beiwagen-Datei das ganze Element, damit ein besserer Decoder später die Originaldatei nicht braucht.

Es gibt keine vierte Ablage. Etwas wegzulassen, weil es nutzlos aussah, weil es ein Duplikat „wahrscheinlich“ war oder weil es groß war, ist ein Fehler. Verdünnen ist nur in der Tabelle erlaubt (eine Kamera mit 2 Hz statt 60), nie in der Beiwagen-Datei.

## Beiwagen-Dateien {#sidecars}

Eine Beiwagen-Datei ist eine Parquet-Datei neben der Tabelle, nach ihr benannt:

```
<folder>/<match>.parquet              die Tabelle
<folder>/<match>.match.json           das Match-Dokument
<folder>/<match>.<what>.parquet        eine Beiwagen-Datei
```

`<what>` ist ein Wort aus dieser Liste. Ein neuer Konverter wählt das passende Wort oder fügt hier ein neues hinzu **und** in `SIDECAR_PARQUET` in
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
damit der Viewer sie ausspart, wenn ein ganzer Ordner geladen wird.

| `<what>` | Enthält | Verwendet von |
|---|---|---|
| `messages` | Pakete, Methodenaufrufe von Entitäten und Eigenschaftsänderungen eines Netzwerkstroms, ganz | War Thunder, World of Tanks, World of Warships |
| `flight` | Einträge des Flugmodells je Flugzeug, ganz | War Thunder |
| `packets` | ganze Frames und Netzwerknachrichten oder Container-Blöcke außerhalb des Entitätsstroms | CS2, Dota 2, Squad |
| `events` | Spielereignisse mit allen ihren Schlüsseln, so wie der Parser sie liefert | CS2 |
| `entities` | Entitäts- und Eigenschaftsänderungen, Fernaufrufe, geöffnete und geschlossene Kanäle, mit den Exporten, die ein Decoder braucht | Squad, Dota 2 |
| `props` | jede Entitätseigenschaft, die der Parser liest, jedes Mal, wenn sie sich ändert | CS2 |
| `units` | Zustand je Einheit außerhalb der Positionstabelle | Dota 2 |
| `combatlog` | ein Kampfprotokoll, jeder Eintrag mit jedem Feld | Dota 2 |
| `strings` | jeder Eintrag jeder Zeichenkettentabelle | CS2, Dota 2 |
| `objectives` | Eroberungszonen und Ziele, jede Änderung mit ihrer Zeit | War Thunder |
| `raw` | ein Live-Feed: jedes empfangene Paket, jede Zeile, jedes API-Dokument oder jeder Speicherzugriff, ganz | die Sitzungen des Watchers (`heat.raw.parquet`), die Rundenrekorder des Aufnahmewerkzeugs für Spiele (`<stamp>_<game>.raw.parquet`), die Replay-Dateien des Watchers für osu!, LoL und Valorant |

Der Ordner-Lader des Viewers überspringt jedes `*.<what>.parquet` aus dieser Liste sowie jede `*.match.json`, `*.meta.json`, `*.summary.json` und die anderen JSON-Beiwagen-Dateien; wenn du eine davon allein öffnest, indem du nur diese Datei auswählst oder ablegst, wird sie wie jede andere Tabelle geladen (siehe [Dateien laden](loading-files.md)).

Das sind die Dateien, so wie ein Konverter sie mit `--loose` schreibt. Standardmäßig packen die Konverter von War Thunder, CS2 und Tacview die Tabelle, das Dokument und die Beiwagen-Dateien eines Matches in eine Datei, `<match>.3dheat`, unter denselben Namen (siehe [Eine Datei pro Match](container.md)); alles hier gilt für jedes Mitglied.

### Spalten {#columns}

Jede Zeile einer Beiwagen-Datei ist ein Element. Die Spalten sind, in dieser Reihenfolge, die, die zutreffen:

| Spalte | Typ | Was |
|---|---|---|
| `time` | float64 | Sekunden auf derselben Uhr wie `time` der Tabelle (oder `tick`, wo die Quelle Ticks zählt; dann beide) |
| `type` | string (Wörterbuch) | was das Element ist, in den eigenen Begriffen der Quelle: ein Pakettyp, eine Nachrichten-ID, ein Ereignisname, ein Eigenschaftspfad, ein Zeilenpräfix |
| `name` | string (Wörterbuch) | sein Name, wo einer bekannt ist (ein Name aus der Community, ein Klassenname), sonst leer |
| `entity` / `unit` / `uid` / `player` | Ganzzahl oder String | wem es gehört, in denselben IDs wie in der Tabelle, sodass eine Zeile der Beiwagen-Datei mit einer Spur verbunden werden kann |
| `decoded` | string (JSON) | was davon verstanden wird, wo etwas verstanden wird; sonst leer |
| `payload` | binär | die Bytes des Elements, ganz und unverändert (binäre Quellen) |
| `text` | string | der Text des Elements, ganz und unverändert (Textquellen: eine Protokollzeile, ein JSON-Objekt, ein Schlüssel-Wert-Block) |

Weitere Spalten sind erlaubt (ein Bit-Versatz, eine Größe, ein Kanal). Sich wiederholende Zeichenketten werden wörterbuchkodiert, und die Datei wird mit zstd geschrieben, sodass eine Beiwagen-Datei nur einen Bruchteil der Größe des Replays selbst hat.

Eine Beiwagen-Datei muss für sich allein genügen: Ein später geschriebener Decoder liest die Beiwagen-Datei, nie das Originalreplay. Wo ein Element nicht ohne Zusammenhang verstanden werden kann (die Klasse einer Entität, eine Zeichenkettentabelle, ein Schlüssel, auf den eine Nachricht verweist), kommt der Zusammenhang ebenfalls in die Beiwagen-Datei oder in das Match-Dokument.

### Live-Quellen {#live-sources}

Live-Adapter (UDP-Telemetrie, gemeinsamer Speicher, das Protokoll eines Spiels, eine lokale API) haben gar keine Datei, zu der man zurückkehren könnte. Sie zeichnen **jedes Feld auf, das die Quelle sendet**, auch die, die noch nichts verwendet:

- ein Paketfeed: jedes Paket ganz, `payload` die Bytes, `type` seine Paket-ID oder sein Format, in der Rate, in der es ankommt;
- gemeinsamer Speicher oder eine abgefragte API: jedes Feld jedes Lesezugriffs, entweder als benannte Spalten oder der ganze Block als `payload`, in der Rate, in der der Adapter liest;
- ein Protokoll: jede Zeile, `text` die Zeile, `type` die Art der Zeile, einschließlich der Zeilen, auf die der Adapter nicht reagiert.

Diese landen in `<session>.raw.parquet` neben der Tabelle der Sitzung. Die Größe ist der Preis der Regel; sie wird durch zstd und Wörterbuchkodierung klein gehalten, nicht dadurch, dass man Dinge weglässt.

## Die Selbstprüfung {#the-self-check}

Jeder Konverter schreibt in sein Match-Dokument (oder in die `meta.json` der Sitzung oder eine Zusammenfassung, wo er kein Match-Dokument hat) einen Block `completeness` unter `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Feld | Bedeutung |
|---|---|
| `seen` | wie viele Elemente dieser Art die Quelle enthält |
| `decoded` | ganz in die Tabelle oder das Match-Dokument gelesen |
| `partial` | teilweise in die Tabelle oder das Dokument gelesen und ganz in einer Beiwagen-Datei behalten |
| `raw` | nur ganz in einer Beiwagen-Datei behalten, nicht decodiert |
| `lost` | `seen - decoded - partial - raw`: muss 0 sein |

Das oberste `lost` ist die Summe. Die Tests eines Konverters bestätigen, dass es bei ihren synthetischen Beispielen 0 ist, und der README sagt, was es bei echten war. Ein `lost` ungleich 0 ist der Konverter, der sagt, dass er die Regel gebrochen hat; er nennt die Art, damit die Lücke gefunden werden kann.

Die „Arten“ sind die eigenen der Quelle: Pakettypen, Nachrichten-IDs, Ereignisnamen, Eigenschaftsgruppen, Zeilenarten. Sie werden gezählt, wo der Konverter ihnen begegnet, nicht aus einer Liste dessen, was er erwartet; daher erscheint eine Art, von der niemand wusste, mit ihrer Anzahl, statt zu verschwinden.

## Der Abschnitt Vollständigkeit im README {#the-readmes-completeness-section}

Das README jedes Konverters hat einen Abschnitt mit der Überschrift **Vollständigkeit** und drei Listen:

- **Gelesen**: was in die Tabelle und das Match-Dokument geht und wie jedes neue Feld gegen etwas Unabhängiges geprüft wurde (die eigenen Zahlen des Spiels, eine zweite Quelle, eine Aufnahme, die dafür gemacht wurde).
- **Roh behalten**: was in welcher Beiwagen-Datei liegt, unter welchem `type`, und was davon bisher bekannt ist.
- **Nicht verfügbar**: was die Quelle nicht enthält oder nicht lesen darf, und warum.

Er verweist zurück auf diese Seite.

## Wo jeder Konverter steht {#where-each-converter-stands}

| Konverter | Beiwagen-Dateien | Sein Abschnitt Vollständigkeit |
|---|---|---|
| War-Thunder-Replays | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (seine Selbstprüfungs-Zählungen stehen unter `counts`; der Block `completeness` folgt noch) |
| World-of-Tanks-Replays | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World-of-Warships-Replays | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad-Server-Demos | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-Demos | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota-2-Replays (Watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota-2-Replays](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!-, LoL- und Valorant-Replays (Watcher) | `raw` | ihre Seiten in den [Dokumenten des Watchers](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live-Adapter (Watcher) | `raw` | die Seite jedes Spiels in den [Dokumenten des Watchers](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) und [Entwicklung](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) für `Session.raw` |
| Rundenrekorder (Aufnahmewerkzeug für Spiele) | `raw`, und `unparsed`-Bytes in einer Forza-Rundendatei | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Die eigenen Importe des Viewers | keine: siehe unten | diese Seite |

### Die eigenen Importe des Viewers {#the-viewers-own-imports}

Tacview ACMI, OCAP und die GPS-Formate werden im Browser aus der eigenen Datei des Nutzers gelesen; der Viewer speichert nichts davon, daher bleibt die Datei selbst der Nachweis. Sie lesen trotzdem so viel, wie sie können:

- **Tacview ACMI** (`src/data/acmi.ts`): jede Objektzeile mit einer Position ist eine Zeile mit jeder Eigenschaft, die die Aufnahme führt, jedes Ereignis eine Zeile, jede Entfernung eine Zeile, die eigenen Eigenschaften der Aufnahme (mit FileType und FileVersion aus dem Kopf) in jeder Zeile als `RecordingInfo`; eine Kommentarzeile ist ein Ereignis `Comment`, ein Objekt, das nie eine Position bekommt, eine Zeile `Unplaced` am Bezugspunkt, und U/V sind Spalten, wann immer eine Zeile sie hat. Eine Eigenschaftszeile ohne Position wird teilweise gelesen: Ihre Werte erreichen die nächste Zeile des Objekts, nicht zu ihrer eigenen Zeit. `AcmiTable.completeness` zählt die Zeilen der Datei nach Art.
- **OCAP** (`src/data/ocap.ts`): alle Frames, Schüsse und Markierungen jeder Entität, jede Ereignisart (unbekannte Arten als Zeilen von „Mission“ mit ihrem Text) und die eigenen Felder des Dokuments (`Info`). Noch nicht gelesen: Entitätsfelder und nachgestellte Positionselemente außer denen, die im Kopf aufgeführt sind (Ergänzungen eines neueren Aufzeichnungsgeräts), und die sich wiederholenden Frames einer toten Einheit nach ihrem Tod (absichtlich ausgedünnt: in ihnen ändert sich nichts).
- **GPS-Formate** (`src/data/geoTracks.ts`): die Fixes, ihre Zeit, Höhe, Kurs und Geschwindigkeit sowie Herzfrequenz, Trittfrequenz, Leistung, Temperatur, Satelliten, HDOP und Druckhöhe, wo die Datei sie protokolliert. Noch nicht gelesen: andere GPX- und KML-Erweiterungen, NMEA-Sätze außer den Positionssätzen, IGC-Einträge außer Fixes und ihren Erweiterungen, und FIT-Nachrichten außer Records (Runden, Sitzungen, Gerätedaten).

Diese Lücken stehen hier, damit sie geschlossen werden, nicht als Entschuldigung; die Exporte des Viewers einer geladenen Aufnahme (`src/data/exportRecording.ts`) schreiben nur, was gelesen wurde.

## Einen Konverter hinzufügen {#adding-a-converter}

1. Liste auf, was das Format enthält, aus seiner Dokumentation, seinen eigenen Strukturen oder indem man jede Nachrichtenart in echten Beispielen zählt. Die Liste sind die `types` der Selbstprüfung.
2. Decodiere, was jetzt geprüft werden kann. Jedes neue Feld wird gegen etwas Unabhängiges geprüft, bevor es in die Tabelle geht; ein Feld, das noch nicht geprüft werden kann, bleibt roh.
3. Behalte den Rest ganz in einer Beiwagen-Datei mit dem oben genannten Namen, mit den oben genannten Spalten.
4. Schreib den Block `completeness` und einen Test, dass `lost` 0 ist.
5. Schreib den Abschnitt Vollständigkeit des README und verlinke auf diese Seite.
6. Wenn das `<what>` der Beiwagen-Datei neu ist, nimm es in die Tabelle oben und in `SIDECAR_PARQUET` in `src/data/filePick.ts` auf.

Konverter sind Clean-Room-Arbeit: Sie werden aus Formaten, Dokumentation und Beispielen geschrieben, nie aus GPL- oder AGPL-Code. Beispiele echter Replays bleiben auf dem Rechner, der sie erzeugt hat; Tests verwenden synthetische Dateien.
