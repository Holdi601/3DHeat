---
title: "Dateien laden"
parent: "Daten laden"
nav_order: 1
lang: "de"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Dateien laden

Diese Seite zeigt, wie du 3DHeat deine Dateien gibst und was es damit macht. Lege einen Ordner ab, und es wählt die Dateien aus, die Positionen enthalten, und führt sie zu einem Bild zusammen.

1. Öffne **Quelle** oben in der Seitenleiste des Heatmap-Tabs.
2. Lege Dateien oder einen Ordner auf die Ablagefläche, oder drücke **Dateien…** oder **Ordner…**.
3. Lies die Auswahlzeile und die **Speicherschätzung** (siehe das Bild unten).
4. Drücke **Laden**.

![Das Quelle-Feld nach dem Ablegen eines Ordners mit zehn Matches: 1 die Auswahlzeile, 2 die Speicherschätzung bei passt, und 3 Laden 10 Dateien](../assets/img/en/loading-files-source.webp)

*Nach dem Ablegen eines Ordners sagt dir 3DHeat, was es gefunden hat und ob es passt.*

Dateien werden im Feld **Quelle** oben in der Seitenleiste des Heatmap-Tabs geladen. Alles, was auf einmal gewählt ist, wird zu **einem** Datensatz.

## Dateien auswählen {#choosing-files}

| Bedienelement | Was es tut |
|---|---|
| **Dateien oder einen Ordner hier ablegen** (die Ablagefläche) | Lege beliebige Mischungen aus Dateien und Ordnern ab. Ordner werden rekursiv durchsucht. Ein Klick auf die Ablagefläche öffnet dieselbe Auswahl wie **Dateien…**. |
| **Eine Datei…** | Ein Dateiauswahl-Dialog für genau eine Datei. |
| **Dateien…** | Ein Dateiauswahl-Dialog, der mehrere Dateien annimmt. |
| **Ordner…** | Ein Ordnerauswahl-Dialog (der `webkitdirectory`-Dialog des Browsers); jede Datei im Ordnerbaum wird angeboten. |

Die Auswahl-Dialoge nehmen die Dateitypen aus der [Liste der ladbaren Dateien](data-formats.md#files) an. Kurz: `.parquet`/`.pq` werden als Parquet gelesen, `.csv`/`.tsv`/`.txt` als getrennter Text, `.acmi` (Tacview), OCAP `.json`/`.json.gz` und die GPS-Formate (GPX, KML, KMZ, NMEA, IGC, FIT) gehen durch ihre eigenen Leser, und `.3dheat`-Match-Container laden als die Tabellen, die sie enthalten ([Eine Datei pro Match](container.md)). Ein Container, der nicht gelesen werden kann, wird übersprungen als *keine csv/parquet-Datei*.

Abgelegte Ordner werden bis zu 12 Ebenen tief durchsucht und höchstens 20.000 Dateien weit, als Schutz vor Symlink-Schleifen und wuchernden Bäumen.

## Welche Dateien behalten werden {#which-files-are-kept}

Bevor etwas gelesen wird, wird die Auswahl gefiltert ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Eine Datei mit einer anderen Endung wird übersprungen: *keine csv/parquet-Datei*.
- Eine Datei mit 0 Byte wird übersprungen: *leer (0 Byte)*.
- **Begleitdateien der Konverter** – die Rohdaten, die ein Konverter neben der Tabelle eines Matches aufbewahrt, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` und die anderen, die in [Konverter bewahren alles](converters.md) stehen – werden übersprungen: *eine Begleitdatei des Konverters*. Um eine davon zu öffnen, wähle oder lege sie allein ab (oder nur Begleitdateien): Eine Auswahl aus nichts als Begleitdateien lädt sie wie jede Tabelle. Die JSON neben einer Tabelle (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` und `.hints.json`) wird nie als Positionen angeboten.
- **Die Bewegungsdatei-Regel.** Wenn eine Datei der Auswahl `movement*.parquet`, `movement*.csv` heißt (und die anderen Endungen) – `movement.parquet`, `movement_1.parquet` und so weiter –, dann wird jede andere Datendatei übersprungen: *keine Bewegungsdatei, und dieser Ordner hat Bewegungsdateien*. Telemetrie-Exporte enthalten oft eine Tabelle mit Positionen neben dutzenden Tabellen ohne Positionen, und nur die erste lässt sich zeichnen. Ein Ordner ohne Bewegungsdatei lädt alle seine Datendateien. Beispiel: Ein Ordner mit `movement_1.parquet`, `kills.parquet` und `shop.parquet` lädt `movement_1.parquet`; die beiden anderen werden als übersprungen aufgelistet.
- Die behaltenen Dateien werden nach ihrem Pfad innerhalb der Auswahl sortiert, sodass derselbe Ordner immer denselben Datensatz und dieselben Farben ergibt.

Das Feld zeigt dann die Auswahl (den Namen einer einzelnen Datei oder `Ordner (N Dateien)` mit dem längsten gemeinsamen Ordner), die Anzahl der Dateien, ihre Gesamtgröße und die Gesamtzahl der Zeilen – genau, wenn alle Dateien Parquet sind, mit `≈` markiert, wenn eine CSV ist. Übersprungene Dateien werden mit ihrem Grund aufgelistet, die ersten vier mit Namen.

## Das Schema lesen {#reading-the-schema}

Die **erste** Datei der Auswahl wird geöffnet, um das Schema zu beschreiben („Schema wird gelesen“): ihre Spaltennamen, ihre ersten 50 Datenzeilen, welche Spalten nach Zahlen aussehen und bei Parquet der logische Typ jeder Spalte und der Eintrag `heat3d` im Footer. Ein Ordner mit Exporten einer Tabelle teilt sich ein Schema, sodass eine Datei für alle steht. Dann wird jede Datei gemessen („Zeilen werden gezählt“): Ein Parquet-Footer liefert die genaue Anzahl in einem kleinen Lesevorgang; die Anzahl einer CSV wird aus der mittleren Zeilenlänge der ersten Megabyte geschätzt.

Das Feld [Spaltenzuordnung](column-mapping.md) öffnet sich mit den automatisch zugeordneten Vermutungen, und die [Speicherschätzung](memory-and-budgets.md) erscheint über dem Knopf **Laden**.

## Meldungen vor dem Laden {#messages-before-loading}

Unter der Auswahl listet das Feld aus [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Fehler** (rot) – das Laden kann nicht beginnen: weniger als zwei Positionsachsen, dieselbe Spalte auf zwei Achsen, eine zugeordnete Spalte, die nicht in der Datei ist, eine Positionsspalte, die nicht nach Zahlen aussieht, eine Zeitspalte, deren Stichprobenwerte Text sind, während die Einheit eine Zahl ist (jede Zeile würde als NaN gelesen und auf Zeit 0 landen), eine Zeitspalte auf ISO-8601, von deren Stichprobenwerten keiner als Datum lesbar ist, ein Einheitenmaßstab von 0.
- **Warnungen** (gelb) – es wird geladen, aber wahrscheinlich nicht wie gemeint: eine Gruppenspalte, die auf den meisten Stichprobenzeilen einen eigenen Wert annimmt (also eine Kennung ist, keine Gruppe), eine Zeitspalte `DATE` (jede Zeile eines Tages teilt sich einen Zeitpunkt), Blickrichtung gesetzt ohne ihre Spalten.
- **Hinweise** – was die Zuordnung bedeutet: Zeichnen in einer Ebene, wenn eine Achse nicht zugeordnet ist, keine Zeitleiste ohne Zeitspalte, keine Spuren ohne Personenspalte, und ohne Gruppenspalte eine Farbe für alles und eine Differenz, die nur an einer zum Filtern behaltenen Spalte aufteilen kann.

## Laden {#loading}

Der Knopf **Laden** zeigt *Datei laden*, *N Dateien laden* oder *N Dateien laden (1 von K)*, wenn ein [Dezimierungsschritt](memory-and-budgets.md#decimation) gesetzt ist. Er zeigt *Zu groß – verringern oder dezimieren* und ist deaktiviert, wenn die [Passprüfung](memory-and-budgets.md#the-fit-check) sagt, dass das Laden nicht passt; er ist auch deaktiviert, solange die Zuordnung Fehler hat oder ein anderes Laden läuft.

Während des Ladens zeigt das Feld den aktuellen Schritt (mit `[Datei/Dateien]` davor, wenn es mehrere sind), die bisher gelesenen Zeilen, einen Fortschrittsbalken und **Abbrechen**. Abbrechen beendet den Einlese-Worker und mit ihm alle Parser-Worker, die er gestartet hat.

Die Seite zeichnet beim Laden weiter, weil die Arbeit im Hintergrund geschieht. Du siehst den aktuellen Schritt, die gelesenen Zeilen, einen Fortschrittsbalken und **Abbrechen**. Nach der letzten Datei zeigt das Feld die Schritte *Zeilen in Zeitfolge bringen*, *Spalten neu ordnen (n von m)*, *Ausdehnung messen*, *Liste aufbauen*, *Sitzungen zusammenfassen* und *Lebensdauern berechnen*, dann *N Zeilen auf die GPU hochladen* für einen Frame, damit ein langer Upload nie für ein Einfrieren gehalten wird.

### So funktioniert es {#how-it-works}

Das Laden läuft in einem Web-Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Bei mehreren Dateien und mehr als einem [Parser-Thread](memory-and-budgets.md#parser-threads) werden bis zu so vielen Dateien **gleichzeitig** geparst, jede in einem eigenen Parser-Worker ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), soweit das RAM-Budget Platz lässt; sie werden trotzdem einzeln in der Reihenfolge der Auswahl zusammengeführt, sodass der Datensatz derselbe ist wie bei einem Laden nacheinander. Während mehrere unterwegs sind, nennt die Fortschrittszeile die Datei, die zuletzt gemeldet hat, und Balken und Zeilenzahl addieren jede Datei, die unterwegs ist. Mit einem Thread oder einer einzelnen Datei werden die Dateien nacheinander im Einlese-Worker selbst geparst. Gelesen werden nur die Spalten, die die Zuordnung nennt: Eine nicht zugeordnete Spalte einer Parquet-Datei kostet nichts; eine CSV wird Byte für Byte durchsucht, aber nur zugeordnete Felder werden dekodiert.

## Mehrere Dateien werden ein Datensatz {#several-files-become-one-dataset}

Wenn mehr als eine Datei geladen wird ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Eine Liste.** Personen, Gruppen, Sitzungen und Kategoriewerte sind Wörterbücher, die alle Dateien teilen, sodass derselbe Spieler in zwei Exporten eine Person mit einer Spur ist.
- **Ein Zeitursprung.** Zeiten werden beim Zusammenführen als 64-Bit-Sekunden gehalten und auf die früheste Zeit der *ganzen* Auswahl umgerechnet, dann als 32-Bit-Sekunden ab diesem Ursprung gespeichert. Vier Exporte von vier Nachmittagen werden in ihrer echten Reihenfolge eingeordnet, nicht übereinander gestapelt.
- **Eine Zeitfolge.** Zeilen aus allen Dateien werden mit einem Radix-Sort nach Zeit sortiert (siehe [die Sortiergrenze](memory-and-budgets.md#the-sort-ceiling)).
- **Eine Spalte `Source file`.** Jede Zeile merkt sich, aus welcher Datei sie kam, als Kategoriespalte namens `Source file`. Sie erscheint in den [Filtern](filters.md) und als *Source file – zwei Ladungen vergleichen* in der [Differenz-Aufteilung](difference.md). Eine Ladung aus einer einzigen Datei bekommt sie nicht – eine konstante Spalte würde 4 Byte pro Zeile kosten, um nichts zu sagen.
- **Fehlende Spalten.** Eine Datei ohne eine der *Filter*-Spalten trägt für sie einfach keine Werte bei. Eine Datei ohne eine zugeordnete *Rollen*-Spalte (X, Zeit, Person, ...) schlägt mit *Datei hat keine Spalte „Name“* fehl; bei einem Laden mit mehreren Dateien wird diese Datei übersprungen, und die anderen werden trotzdem geladen; die übersprungenen Dateien stehen am Datensatz. Ein Laden einer einzelnen Datei, das fehlschlägt, meldet den Fehler.
- **Warnung bei Fehlmenge.** Wenn die geladenen Zeilen weniger als 95 % der vorher gezählten sind, trägt der Datensatz eine Warnung mit dem fehlenden Anteil – aus nicht lesbaren Dateien oder aus Zeilen ohne brauchbare Position, die beim Einlesen verworfen werden.

## Nach dem Laden {#after-loading}

Der neue Datensatz ersetzt jeden früheren. Bei jedem Laden ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- werden alle Filter und die Sichtbarkeit der Gruppen gelöscht;
- wird die Differenz-Aufteilung nach Gruppe zurückgesetzt: die erste Hälfte der Gruppen (aufgerundet) positiv, der Rest negativ;
- wird der Radius der Sprites auf die horizontale Ausdehnung / 120 gesetzt und die Sättigung auf eine analytische Schätzung; Würfelgröße, Länge des Blickstrahls, Fluggeschwindigkeit und die nahe/fernen Ebenen werden aus der Ausdehnung gesetzt (siehe [Sitzungen, Personen und Gruppen](sessions-persons-groups.md#entity-size));
- wird die Sitzung des Box-Replays auf die Sitzung mit den meisten Zeilen gesetzt;
- werden die Routen der Linien-Intensität neu geschätzt ([Linien-Intensität](line-heat.md));
- fällt die Ansichtsart auf **Intensität** zurück, wenn die aktuelle Art von den neuen Daten nicht unterstützt wird; die Zeitleiste fällt ohne Zeitspalte auf **Alle** zurück und der Verlauf ohne Lebensdauern auf **Kumulativ**;
- steht der Abspielkopf am Anfang und die Wiedergabe hält an;
- rahmt die Kamera den ganzen Datensatz aus der Standardrichtung (entlang -Z blickend, etwa 36° nach unten geneigt).

Das Feld **Datensatz** zeigt dann den Namen des Datensatzes (die Auswahl, die Zeilen- und Dateianzahl und den Schritt, falls einer genutzt wurde), `N Teams · N Personen · Ns Spanne` und jede Warnung, die das Laden erzeugt hat, gelb, solange der Datensatz geladen ist. **Entladen** in diesem Feld entfernt den Datensatz.
