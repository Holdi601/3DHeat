---
title: "GPU-Speicherbelegung"
parent: "Interna des Renderings"
nav_order: 5
lang: "de"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# GPU-Speicherbelegung

Die Grafikkarte hat nur begrenzt Speicher. Passen deine Daten nicht hinein, zeigt der Viewer, was hineinpasst, und sagt es dir: Das Statistik-Overlay bekommt eine gelbe Zeile **Nicht im Speicher** mit der Zahl der Zeilen, die ausgelassen wurden. Ein gekürzter Datensatz, der vollständig aussieht, wäre der schlimmste Fehler, den ein Analysewerkzeug machen kann. Deshalb wird diese Zeile nie ausgeblendet.

![Das Statistik-Overlay mit der gelben Zeile Nicht im Speicher](../assets/img/en/gpu-memory-not-resident.webp)

Um mehr hineinzubekommen, erhöhe das GPU-Budget unter **Ressourcenbudgets** und lade erneut ([Speicher und Budgets](memory-and-budgets.md#raising-the-gpu-budget)). Oder grenze die Daten zuerst ein, oder nimm eine Karte mit mehr Speicher.

## Für Entwickler {#for-developers}

### So werden Zeilen auf der GPU gespeichert {#how-rows-are-stored-on-the-gpu}

Zeilen werden einmal hochgeladen, wenn ein Datensatz ankommt, in **Blöcken** zu 8.388.608 Zeilen (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Jeder Block wird gegen seine eigene Umrandung und Zeitspanne quantisiert:

| Daten | Format | Bytes je Zeile |
|---|---|---|
| Position X, Y, Z und die Gruppen-ID | vier vorzeichenlose 16-Bit-Ganzzahlen (RGBA16UI auf WebGL2); X, Y, Z innerhalb der Umrandung des Blocks | 8 |
| Zeit und Lebensdauer (wenn der Datensatz beides hat, Zeit und Person) | zwei vorzeichenlose 16-Bit-Ganzzahlen (RG16UI): Zeit innerhalb der Zeitspanne des Blocks; Lebensdauer, wobei 65.535 „kein nächster Messwert“ bedeutet | 4 |

Die Umrandungen je Block sind der Grund, warum 16 Bit reichen: Ein Block deckt meist nur einen Teil der Karte ab. Die Quantisierungsstufe liegt deshalb weit unter einem Zentimeter bei einer Karte, die Kilometer breit ist. Das ist weit unter dem Rauschen echter Telemetrie. Die Gruppen-ID im vierten Kanal kostet nichts extra. Darum gibt es höchstens 4.096 Gruppen ([Gruppen](sessions-persons-groups.md#limits)).

Auf WebGL2 ist jeder Block eine Textur mit 8.192 Texeln Breite, aufgefüllt auf ganze Texturzeilen. Die Zeilen werden über `gl_VertexID` durch eine Block-Index-Textur je Bild erreicht. Auf WebGPU sind es Storage-Buffer.

Weiterer GPU-Speicher je Zeile, der bei Bedarf belegt wird:

- jeder aktive Spalten-[Filter](filters.md): 4 Byte je Zeile (32-Bit-Fließkommawerte oder Kategorie-IDs), beim ersten Gebrauch je Block hochgeladen;
- [Linien-Heatmap](line-heat.md): 8 Byte je Zeile (Anfang jedes Segments, innerhalb der Umrandung der Daten quantisiert, und seine Markierungen), solange der Modus Linien an ist.

Dazu kommen die Render-Ziele: Szenenfarbe und -tiefe, das Heatmap-Ziel und sein Zwischenziel (vier Kanäle beim [Team-Heatmap](team-heat.md)) und die Tiefenabziehschichten für die [Verdeckung](depth-and-culling.md). Außerdem die Geometrie des Levels.

### Das Budget wird beim Hochladen erzwungen {#the-budget-is-enforced-at-upload}

WebGL nimmt Reservierungen an, die es nicht bedienen kann, und verliert dann den Kontext oder fällt auf den Systemspeicher zurück, zu einem verheerenden Preis. Deshalb wird das GPU-Budget beim Hochladen eines Datensatzes erzwungen ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- Blöcke werden in ihrer Reihenfolge hochgeladen (also in zeitlicher Reihenfolge), solange sie passen;
- der erste Block, der nicht passt, wird **teilweise** hochgeladen: so viele ganze Texturzeilen, wie das verbleibende Budget hält, statt gar nicht. So zeigt ein Budget, das keinen ganzen Block fasst, trotzdem so viel es kann. Da Zeilen zeitlich geordnet sind, ist der gezeigte Teil ein zusammenhängender Zeitabschnitt;
- alles danach ist **nicht im Speicher**.

Der Fehlbetrag bleibt nicht verborgen: Das Statistik-Overlay zeigt eine gelbe Zeile **Nicht im Speicher** mit der Zahl der Zeilen, die nicht passten, sobald sie über null liegt. Ein gekürzter Datensatz, der vollständig aussieht, ist der schlimmste Fehler, den ein Analysewerkzeug haben kann. Die [Passungsprüfung](memory-and-budgets.md#the-fit-check) vor dem Laden soll diesen Fall verhindern.

Das Budget, das der Renderer nutzt, ist das GPU-Budget aus **Ressourcenbudgets**, dieselbe Zahl, die die Passungsprüfung nutzt. Es liegt auch über dem erkannten Wert, bis zur Obergrenze des Schiebereglers (siehe [GPU-Budget erhöhen](memory-and-budgets.md#raising-the-gpu-budget)). Es wird beim Hochladen eines Datensatzes angewendet. Eine spätere Änderung wirkt erst beim nächsten Laden.
