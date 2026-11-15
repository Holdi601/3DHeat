---
title: "Speicher und Budgets"
parent: "Daten laden"
nav_order: 6
lang: "de"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Speicher, Budgets und die Passungsprüfung

Dein Computer hat begrenzten Speicher. 3DHeat addiert, was deine Dateien brauchen, und sagt dir vor **Laden**, ob sie hineinpassen.

![Die Speicherschätzung bei „passt nicht“, mit vorausgefülltem Laden jeder [N]. Zeile und dem Schalter Laden, der „Zu groß – verringern oder ausdünnen“ zeigt](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Zu groß für diesen Computer? 3DHeat schlägt vor, nur jede N-te Zeile zu laden.*

Ein Browser-Tab, dem mitten in einem Ladevorgang der Speicher ausgeht, stürzt ab und verliert Minuten Arbeit, und eine GPU, der mehr angefordert wird, als sie hat, verliert entweder ihren Kontext oder wird unerträglich langsam. Deshalb sagt das Panel Quelle vor jedem Laden, wie viel Speicher es braucht, vergleicht das mit den für diesen Rechner erkannten Budgets und lehnt ab – mit einem Ausweg –, wenn es nicht passt. Das Modell steht in [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Die Speicherschätzung {#the-memory-estimate}

Sie steht über der Schaltfläche **Laden**, sobald die Zeilen gezählt sind.

| Zeile | Bedeutung |
|---|---|
| **Speicherschätzung** – *passt* / *knapp* / *passt nicht* | Das Urteil, grün, gelb oder rot. |
| `N rows · B B/row` | Zeilen, die geladen werden (nach der Schrittweite), und die dauerhaften Bytes je Zeile. |
| `RAM X resident, Y peak while loading` | Speicher, der nach dem Laden gehalten wird, und der Höchstwert während des Ladens. |
| `GPU Z · est. load T` | GPU-Speicher für die Zeilen und eine geschätzte Dauer bei 1,2 Millionen Zeilen pro Sekunde. |
| GPU-Name | Der Name des Renderers, wenn der Treiber ihn meldet. |
| Meldungen | Warum es nicht passt oder knapp ist, und was zu tun ist. |
| **Jede [N]. Zeile laden** | Die Schrittweite der Ausdünnung (siehe unten). |
| `Budget: X RAM, Y GPU. Adjust under Performance → Resource budgets.` | Die Budgets, die die Prüfung benutzt hat. |

### Bytes je Zeile {#bytes-per-row}

| Spalte | Dauerhaft (RAM) | Hinweise |
|---|---|---|
| Position | 12 | Drei 32-Bit-Fließkommazahlen, immer (eine flache Achse ist trotzdem ein Array) |
| Zeit | 4 | Wenn zugeordnet |
| Lebensdauer | 4 | Wenn Zeit und Person zugeordnet sind |
| Person | 4 | Wenn zugeordnet |
| Gruppe | 2 | Wenn zugeordnet |
| Sitzung | 4 | Wenn zugeordnet |
| `Source file` | 4 | Wenn mehr als eine Datei geladen ist |
| Jede Filterspalte | 4 | Je angehakter Spalte *Für Filterung behalten* |

Die **Spitze** addiert, was das Laden nur vorübergehend braucht – 8 Bytes für die 64-Bit-Zeit beim Zusammenführen, 12 Bytes für Sortierschlüssel und Indizes, 4 Bytes für die Permutations-Zwischenspeicher (alle drei, wenn die Zeit zugeordnet ist) und 4 Bytes, solange die Gruppenspalte noch 32 Bit hat – und multipliziert die Summe mit **2,0**. Dieser Faktor wurde gemessen (ein echtes Laden über mehrere Dateien erreichte das 1,9-Fache der aufgeführten Arrays, durch den Arbeitssatz des Parquet-Decoders, die Kopien, die jede Spalte auf die Länge kürzen, und Speicher, der freigegeben, aber noch nicht zurückgegeben war) und aufgerundet, denn eine Unterschätzung kostet einen abgestürzten Tab, eine Überschätzung nur eine unnötige Schrittweite.

Auf der **GPU** kostet jede Zeile 8 Bytes (Position und Gruppe, je 16 Bit), dazu 4 Bytes (Zeit und Lebensdauer, je 16 Bit), wenn Zeit und Person beide zugeordnet sind. Siehe [GPU-Speicherresidenz](gpu-memory.md). Filter-Texturen (4 Bytes je Zeile und aktivem Filter) und die Segmentstarts der Linien-Heatmap (8 Bytes je Zeile, solange der Modus Linien an ist) gehören nicht zu dieser Schätzung.

## Die Passungsprüfung {#the-fit-check}

Drei Grenzen werden verglichen ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- die Spitze des RAM gegen das **RAM-Budget**,
- die GPU-Bytes gegen das **GPU-Budget**,
- die Zeilenzahl gegen die **Sortiergrenze** von 400.000.000 Zeilen, wenn eine Zeitspalte zugeordnet ist.

Das schlechteste der drei Verhältnisse entscheidet: bis 70 % *passt*, bis 100 % *knapp* (es sollte laden, wird aber langsam sein), darüber *passt nicht*. Wenn es nicht passt, nennt das Panel die bindende Grenze und schlägt vor:

- jede *N*-te Zeile zu laden, mit *N* = ⌈Zeilen / Zeilen, die passen⌉, vorausgefüllt im Feld der Schrittweite;
- Filterspalten wegzulassen, die Zeitspalte abzuwählen (das entfernt das Sortieren und seine Grenze, auf Kosten der Zeitleiste) oder das Budget zu erhöhen.

Wenn das Budget selbst keine Tatsache über die Hardware ist – der Browser hat die RAM-Angabe gedeckelt, der Standard wurde durch den gerade freien Speicher niedrig gehalten, oder die GPU-Angabe ist eine Schätzung –, sagt die Meldung das, damit du nicht zu einer Schrittweite greifst, die du nicht brauchst.

### Ausdünnung {#decimation}

**Jede [N]. Zeile laden** behält je Datei eine Zeile von *N*. Die Heatmap ist ein Mittelwert, daher ergibt jede *N*-te Zeile dieselbe Verteilung mit mehr Rauschen – derselbe Tausch, den der Renderer ohnehin bei jedem Frame macht. Das Feld beginnt bei 1 (*Zeile (alle)*); wenn die Auswahl nicht passt, ist es mit der vorgeschlagenen Schrittweite vorausgefüllt, solange du nichts hineingetippt hast. Der Schalter Laden zeigt dann *N Dateien laden (1 von K)*, und der Name des Datensatzes trägt `every Kth row`.

### Die Sortiergrenze {#the-sort-ceiling}

Der Renderer braucht die Zeilen in aufsteigender Zeitfolge, daher bedeutet eine zugeordnete Zeitspalte, jede Zeile zu sortieren, mit einem Radix-Sortierverfahren über 32-Bit-Schlüssel ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Über **400 Millionen** Zeilen wird das abgelehnt, statt es in einem Tab zu versuchen. Das wird vor dem Laden geprüft, daher wird eine Auswahl über der Grenze mit einem Vorschlag für die Schrittweite abgelehnt, statt vollständig gelesen zu werden und beim letzten Schritt zu scheitern. Nahe der Grenze (*knapp*) warnt das Panel, dass das Sortieren ein langer Durchlauf ohne eigenen Fortschritt ist. Ohne Zeitspalte wird nichts sortiert, und keine Grenze gilt.

## Ressourcenbudgets {#resource-budgets}

**Leistung → Ressourcenbudgets** (eine einklappbare Zeile unten im Panel Leistung, die `Resource budgets - RAM, GPU, cores` zeigt). Die Budgets werden erkannt; der erkannte Wert ist der Standard; und die Schieberegler gehen nicht höher als eine **Obergrenze**, die der erkannte Wert ist, außer wo bekannt ist, dass die Erkennung keine Messung ist.

| Einstellung | Bereich | Bedeutung |
|---|---|---|
| **RAM für Zeilendaten** | 256 MiB bis zur RAM-Obergrenze, logarithmisch | Das RAM-Budget für die Passungsprüfung. Markiert *(über erkannt)* jenseits des erkannten Standards, *(max)* an der Obergrenze. |
| **GPU für Zeilendaten** | 128 MiB bis zur GPU-Obergrenze, logarithmisch | Das GPU-Budget für die Passungsprüfung und das Hochladen der Zeilen. Markiert *(über erkannt)* jenseits des erkannten Standards, *(max)* an der Obergrenze. |
| **Parser-Threads** | 1 bis zur Zahl der logischen Kerne | Wie viele Dateien ein Laden gleichzeitig parst, jede in einem eigenen Worker. Standard Kerne − 2 (Kerne − 1 bei vier oder weniger Kernen). Siehe [Parser-Threads](#parser-threads) (unter Für Entwickler). |
| Zeile „Quellen“ | | Woher jede Angabe kam (`RAM: …. GPU: …. CPU: ….`). |
| **Neu erkennen** | | Fragt den Entwicklungsserver nach einer neuen Speicherangabe und berechnet jedes Budget neu. |
| GPU-Name | | Der Kurzname des Adapters; der vollständige Renderer-Text steht im Tooltip. |

### Das GPU-Budget erhöhen {#raising-the-gpu-budget}

Ein GPU-Budget über dem erkannten Wert gilt wie eingestellt: Die Passungsprüfung und das Hochladen nehmen denselben Wert aus einer Funktion ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), die ihn nur an der GPU-Obergrenze begrenzt, bei der der Schieberegler anhält. Ein Laden, das die Prüfung besteht, wird daher vollständig hochgeladen. Über dem erkannten Wert zeigt der Schieberegler *(über erkannt)*: Die Zahl ist dann dein Urteil über die Karte, keine Messung, und ein Wert höher als die Karte hat, riskiert einen verlorenen Kontext oder eine kriechende Darstellung.

## Riesige Datensätze: die Hebel {#huge-datasets-the-levers}

Vom billigsten zum drastischsten:

1. **Weniger Filterspalten.** Jede kostet 4 Bytes je Zeile und einen Decodierdurchlauf.
2. **Eine Schrittweite.** Jede *N*-te Zeile.
3. **Keine Zeitspalte.** Kein Sortieren, keine Sortiergrenze, keine 4–8 Bytes je Zeile für Zeit und Lebensdauer – und keine Zeitleiste.
4. **Die Budgets erhöhen**, wenn du weißt, dass der Speicher da ist.

Beim Rendern werden große Datensätze durch Stichproben und fortschreitendes Akkumulieren behandelt, nicht durch Verkleinern der Daten; siehe [Stichproben und Budgets](sampling-and-budgets.md).

## Für Entwickler {#for-developers}

### Parser-Threads {#parser-threads}

Ein Laden mehrerer Dateien parst bis zu **Parser-Threads** davon gleichzeitig, jede in einem Parser-Worker, den der Ingest-Worker für dieses Laden startet ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Bei 1 oder bei einer einzelnen Datei werden die Dateien nacheinander im Ingest-Worker selbst geparst.

Mehrere gleichzeitig zu parsen lockert die Passungsprüfung nicht:

- **Der Aufbau wird zuerst gezählt.** Die zusammengeführten Spalten werden für die ganze Auswahl angelegt, bevor die erste Datei gelesen wird, daher bekommen die laufenden Dateien nur, was das RAM-Budget neben ihnen übrig lässt (`parseHeadroom`): Position, 64-Bit-Zeit, Blickwinkel, Person, 32-Bit-Gruppe, Sitzung, Filterspalten und `Source file`, je Zeile, die geladen werden soll – mal 2,6, wenn die Zeilenzahl eine CSV-Schätzung ist, weil eine Spalte in eine größere wächst.
- **Jede Datei reserviert ihre Kosten, bevor sie startet** (`fileParseBytes`): ihre Zeilen (aus dem Fuß der Parquet-Datei; bei einer CSV ihr Anteil an der Schätzung nach Größe) mal dieselben Spalten mal **8** – der Block selbst, die Kopie daneben, während Zeilen ohne Position verworfen werden, und der Arbeitssatz des Decoders, der bei Textspalten weit größer ist als ihre IDs. Eine Schrittweite verringert das nicht, denn die Dateien werden ganz gelesen und danach ausgedünnt. Die 8 ist eine Reserve, die durch Messung festgelegt wurde: Bei 3 oder bei 5 brachten dreißig Parser-Threads einen Tab bei 86 Millionen Zeilen mit Personen- und Sitzungsnamen über seine Grenze; bei 8 taten sie es nicht.
- **Eine weitere Datei startet nur, wenn ihre Reservierung in den Rest passt.** Eine Datei, die fertig ist und darauf wartet, dass eine frühere zusammengeführt wird, behält ihre Reservierung, bis sie zusammengeführt ist.
- **Eine Datei läuft immer.** Ist nichts reserviert, startet die nächste Datei, was sie auch kostet – das ist das Laden nacheinander, das die Passungsprüfung zugelassen hat, daher fällt ein knappes Budget darauf zurück, statt abzulehnen.

Die Angabe *Spitze beim Laden* ist die Spitze eines Ladens nacheinander, die beim Sortieren auftritt, nachdem alle Dateien gelesen wurden. Nebeneinander geparste Dateien können während des Lesens über diesen Wert hinausgehen; die Reservierungen halten es innerhalb des RAM-Budgets, soweit die obigen Schätzungen stimmen.

Die Reihenfolge des Zusammenführens ist die Reihenfolge der Auswahl, unabhängig davon, in welcher Reihenfolge die Dateien fertig werden, daher sind die Nummerierung von Person, Gruppe und Sitzung, die Zeilen und die Werte von `Source file` identisch mit einem Laden nacheinander. Eine Datei, die sich nicht lesen lässt, wird übersprungen und wie bisher aufgelistet. Stirbt ein Parser-Worker, endet das ganze Laden, wie der Tod des Ingest-Workers es immer tat, und jeder Parser-Worker wird beendet, wenn das Laden endet, gleich wie es endet. Können Parser-Worker gar nicht gestartet werden, werden die Dateien im Ingest-Worker geparst.

### Wie die Angaben erkannt werden {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) läuft beim Start, noch einmal, sobald der Renderer existiert, und bei **Neu erkennen**.

**RAM, mit dem Entwicklungsserver.** `start.bat` und `npm run dev` liefern die Seite von einem Prozess aus, der den Speicher des Rechners lesen kann, unter `/__host/memory` (Antwort innerhalb von 1,5 s, sonst ignoriert). Der Standard ist der kleinere Wert von 60 % des eingebauten RAM und 80 % des derzeit freien RAM; die Obergrenze ist 60 % des eingebauten. Wenn der freie Speicher den Standard drückt, sagt das Panel das und schlägt vor, Programme zu schließen und **Neu erkennen** zu drücken.

**RAM, ohne ihn** (eine statische Auslieferung): Keine Browser-API meldet freien Speicher, und `navigator.deviceMemory` wird auf eine Zweierpotenz abgerundet und von Chrome und Edge auf höchstens 8 GiB begrenzt. Der Standard ist 60 % von `deviceMemory`, weiter begrenzt auf 4 × den freien JS-Heap des Tabs, wo der Browser einen meldet, oder 4 GiB, wenn nichts gemeldet wird. Wenn `deviceMemory` genau 8 liest (die Grenze), wird die Angabe als *gedeckelt* markiert, und die Obergrenze ist 4 × der Standard, mit dem Hinweis, dass die Zahl jenseits des Standards deine Behauptung ist, keine Messung.

**In beiden Fällen** sind Standard und Obergrenze des RAM auf **12 GiB** begrenzt, mehr als ein Chrome-Tab an getyptem Array-Speicher halten kann, was auch immer der Rechner hat (eine Seite erreichte etwa 15,75 GB und scheiterte; 12 lässt Platz für alles andere), und sie fallen nie unter 256 MiB.

**GPU-Speicher.** Keine Web-API meldet ihn überhaupt.

- Mit dem Entwicklungsserver wird der Speicher der Karte von `nvidia-smi` gelesen (der größte Adapter) oder unter Windows aus dem Registerwert `HardwareInformation.qwMemorySize` des Anzeigeadapters. Der Standard ist 70 % davon, die Obergrenze 90 %.
- Ohne Messung wird er geschätzt: standardmäßig 2 GiB; 4 GiB, wenn die größte Textur 16.384 px oder mehr hat (eine dedizierte Karte), 1 GiB, wenn kleiner; oder 8 × `maxBufferSize` von WebGPU, wenn das größer ist. Die Obergrenze ist dann 8 × der geschätzte Wert, weil die Schätzung eine integrierte von einer dedizierten Grafik unterscheidet und nichts Feineres. Das Panel sagt, dass der Wert geschätzt ist.
- Nie unter 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, wenn nichts gemeldet wird).
