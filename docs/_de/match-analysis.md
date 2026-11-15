---
title: "Match-Analyse (CS2)"
nav_order: 10
lang: "de"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---

# Match-Analyse (Counter-Strike 2)

Der Tab **Match** spielt eine Aufnahme als Figuren ab, und für ein Counter-Strike-2-Match zeigt er auch die Wertungstafel: wer jede Runde gewonnen hat, wie, und wer die Abschüsse hatte. Nutze ihn, um ein Match Runde für Runde durchzugehen, und spring dann zum selben Moment in der Heatmap.

Der Tab Match spielt jede Aufnahme als Figuren ab: eine Aufnahme von War Thunder oder Tacview oder eine CS2-Demo, aufgeführt unter **Matches im Replay** ([Match-Replay](match-replay.md)). Eine CS2-Datei `.match.json` fügt die Wertungstafel hinzu, die auf dieser Seite beschrieben ist.

## Ein CS2-Match durchgehen {#review-a-cs2-match}

1. Konvertiere die Demo ([unten](#where-the-data-comes-from)) in eine Datei `.parquet` und eine `.match.json`.
2. Lade im Tab **Heatmap** unter **Quelle** die Datei `.parquet`.
3. Öffne den Tab **Match** und klick auf **Match-Dateien laden…**, oder zieh die Datei `.match.json` auf die Ansicht.
4. Klick ein Match unter **Match-Zusammenfassungen**, dann eine Zelle der Rundenleiste, um diese Runde zu öffnen.
5. Klick auf **Runde zeigen**, um diese Runde in der Heatmap zu sehen, oder auf **Runde abspielen**, um sie als Figuren anzuschauen.

![Der Tab Match: Rundenleiste mit einer geöffneten Runde, Abschussliste und Scoreboard](../assets/img/en/match-analysis-round.webp)

Begriffe wie KAST, ADR, Eco, Force Buy und Trade stehen im [Glossar](glossary.md#counter-strike-words).

## Woher die Daten kommen {#where-the-data-comes-from}

Der Demo-Konverter von [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
macht aus Demos zwei Dateien je Match, in einem Ordner je Karte:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Datei | Geladen im | Enthält |
|---|---|---|
| `<match>.parquet` | dem Tab **Heatmap** (Panel Quelle, wie jede Parquet-Datei – eine Datei, mehrere oder der ganze Ordner) | die Position jedes Spielers achtmal pro Sekunde und jedes Ereignis, bei dem es geschah: Abschuss, Tod, Verletzung, Schuss, Wurf, Rauch, Blendung, HE, Molotow, Attrappe, Blindheit, Plant, Entschärfung, Explosion; mit `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, Blickrichtung, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | dem Tab **Match** | Teams, Stand, jede Runde (Gewinner, wie, Wirtschaft, der Plant, jeder Abschuss in Reihenfolge, Clutches, Überlebende), die Wertungszeile jedes Spielers |

Die Fußzeile der Parquet-Datei trägt Leseanweisungen (Schlüssel `heat3d`), daher öffnet sie sich ohne etwas einzustellen: der Spieler als Person, die Seite als Gruppe, jede Runde (`roundId`, „<match> #NN“) als Sitzung, die Blickrichtung an, und die Welt richtig herum (die Welt von CS2 ist rechtshändig mit Z oben; mit der Standardzuordnung für Z oben gelesen käme sie gespiegelt heraus). Siehe [Spaltenzuordnung](column-mapping.md) und [Dateien laden](loading-files.md).
`python -m heat3d_cs2 map <map>` exportiert die Geometrie der Karte im selben Bezugssystem, geladen unter **Level**.

Die Regeln hinter den Zahlen stammen vom Konverter (in seinem README angegeben und in jeder Zusammenfassung enthalten): Ein Tod gilt als **getradet**, wenn sein Täter innerhalb von **5 s** von einem Teamkameraden des Opfers getötet wird; **KAST** ist der Anteil der Runden mit einem Abschuss, einer Vorlage (eine Blendungsvorlage zählt), Überleben oder einem getradeten Tod; **Schaden** ist tatsächlich verlorene Gesundheit, nur bei Gegnern; ein **Clutch** ist, als letzter Lebender einer Seite gegen stehende Gegner zu sein, gewonnen, wenn die Seite die Runde gewinnt; **Kauf** je Seite nach dem durchschnittlichen Ausrüstungswert am Ende der Freezetime – die erste Runde jeder regulären Halbzeit eine Pistolenrunde (in der Verlängerung keine), dann unter 1.500 $ ein Eco, unter 4.000 $ ein Force Buy, alles darüber ein voller Kauf.

## Der Tab {#the-tab}

Die Seitenleiste des Tabs Match enthält oben den Moduswechsel und die Sitzungsauswahl der Heatmap, darunter die Abschnitte des Matches und darunter die Panels **Filter**, **Level** und **Kamera** der Heatmap – die Ansicht ist die Heatmap dessen, was im Tab Heatmap als Parquet geladen ist.

### Match-Zusammenfassungen {#match-summaries}

| Einstellung | Tut |
|---|---|
| **Match-Dateien laden…** | wählt `.json`-Dateien (mehrere auf einmal): die Zusammenfassungen `.match.json` |
| auf der Ansicht ablegen | JSON-Dateien, die auf der Ansicht abgelegt werden, während der Tab Match offen ist, werden genauso geladen (andere Dateien werden ignoriert) |
| **Leeren** | entfernt jedes Match |
| **Alle Matches** (bei zwei oder mehr) | „N Matches, M Runden“: die Statistik über alle |
| eine Matchzeile | „TeamA 13 gegen TeamB 9“, Karte · N Runden: öffnet dieses Match |

Eine Datei wird angenommen, wenn sie JSON ist mit `"format": "heat3d-cs2-match"` und den Feldern `rounds`, `players` und `teams`. Fehler stehen unter den Schaltflächen: „<Datei>: kein JSON“, „<Datei>: keine CS2-Match-Zusammenfassung (heat3d-cs2-match)“, „<Datei>: rounds, players oder teams fehlen“. Ein Match, das erneut geladen wird (gleicher Name `match`), ersetzt das frühere. Matches werden nach Karte, dann nach Name sortiert. Wenn genau ein Match geladen ist, wird es geöffnet; sonst bleibt die Auswahl (standardmäßig alle Matches).

Ohne geladene Daten erklärt der Abschnitt: Konvertiere mit `python -m heat3d_cs2 demos`, lade hier die `.match.json`-Dateien und im Tab Heatmap die `.parquet`-Dateien.

### Match (ein Match ist geöffnet) {#match-one-match-open}

**Der Kopf:** beide Teams mit ihrem Stand, die Karte, die Halbzeiten – „Halbzeiten 7–5, 6–6“: Runden 1–12 und 13–24 (Premier- und Wettkampfspiel MR12; die eigene Halbzeitlänge einer Zusammenfassung, wenn sie eine angibt, also 1–15 und 16–30 bei MR15) –, dann, wenn das Match in die Verlängerung ging, sein Stand für sich allein: „Verlängerung 4–2“, die Runden nach beiden Halbzeiten. Eine unentschiedene Runde zählt für keines der Teams. Und „N Runden in der Demo abgeschnitten“, wenn die Zusammenfassung unvollständige Runden auflistet.

**Die Rundenleiste:** eine Zelle je Runde, gefärbt nach der Seite, die gewonnen hat, mit ihrer Nummer und einer Markierung, wie sie endete. Eine unentschiedene Runde (ohne Gewinner) ist eine neutrale graue Zelle mit `=`, nie in der Farbe einer Seite; ihr Tipp sagt „Runde 30: unentschieden – keine Seite hat sie gewonnen“.

| Markierung | Beendet durch |
|---|---|
| B | Bombe explodiert |
| D | Bombe entschärft |
| K | ausgeschaltet |
| T | Zeit abgelaufen |
| S | Aufgabe |
| = | unentschieden |
| ? | anderes |

Ein Trennstrich markiert den Beginn der zweiten Halbzeit (Runde 13 oder die Runde nach der Halbzeitlänge der Zusammenfassung) und jeder dreirundigen Verlängerungshälfte (Runden 25, 28, 31 …). Fahr mit dem Zeiger über eine Zelle: „Runde 7: TeamA (T) – Bombe explodiert, A gelegt“ („…, gelegt, Ort unbekannt“, wenn die Zusammenfassung keinen Ort hat) und Kauf und Ausrüstungswert beider Seiten. Klick, um die Runde zu öffnen; klick erneut, um sie zu schließen („Klick auf eine Runde für ihre Abschüsse, Wirtschaft und Wiedergabe.“).

**Die Runde:**

- „Runde 7: <Team> gewann – <wie>“ („Runde 30: unentschieden – keine Seite hat sie gewonnen“ bei einem Unentschieden) und wie lange die Runde dauerte (Ende der Freezetime bis zur Entscheidung, m:ss);
- die Wirtschaft: das Team jeder Seite, Kauf (Pistole, Eco, Force Buy, voller Kauf) und Ausrüstungswert („4.350 $“);
- der Plant: Ort, Spieler und Zeit in der Runde (aus beiden Versionen der Zusammenfassung); „Gelegt von <Spieler> bei 1:05, Ort unbekannt“, wenn der Ort nicht bekannt ist;
- **die Abschussliste**, in Reihenfolge: Zeit in der Runde, Angreifer (in der Farbe der Seite; „world“ ohne Angreifer), Waffe und Markierungen – **HS** Kopfschuss, **WB** durch eine Wand, **SM** durch Rauch; **Open** der erste Abschuss der Runde, **Trade** (rächt einen Teamkameraden innerhalb von 5 s), **getradet** (der Täter wurde innerhalb von 5 s getötet), **Team** ein Teamkill (ein Selbstmord zählt nicht). Abschüsse nach der Entscheidung der Runde sind abgedunkelt;
- die Clutches: „<Spieler> (T) allein gegen 3: Clutch gewonnen“ / „verloren“;
- wer am Ende lebte, je Seite („niemand“);
- **Runde zeigen**: alles in dieser Runde, in der Heatmap;
- **Runde abspielen**: spielt die Runde als Boxen ab, ab ihrem Start (unten).

Schaltflächen **In der Heatmap zeigen** (siehe [unten](#show-in-the-heatmap)) für dieses Match oder die geöffnete Runde.

### Scoreboard {#scoreboard}

Eine Tabelle je Team, eine Zeile je Spieler:

| Spalte | Ist |
|---|---|
| K, D | Abschüsse, Tode |
| A | Vorlagen, Blendungsvorlagen eingerechnet |
| ± | Abschüsse minus Tode (grün über 0, rot darunter) |
| ADR | Schaden je Runde, tatsächlich verlorene Gesundheit |
| KAST | % der Runden mit einem Abschuss, einer Vorlage, Überleben oder einem getradeten Tod |
| HS | % Kopfschuss-Abschüsse |
| Open | gewonnene-verlorene Opening-Duelle |
| Cl | gewonnene/gespielte Clutches |

Fahr mit dem Zeiger über einen Spieler: Trade-Abschüsse, getradet-Male, Blendungsvorlagen, geblendete Gegner, Schaden durch Hilfsmittel und Runden mit mehreren Abschüssen („2×3k“). **Klick auf einen Spieler** für seine Abschüsse und Tode in der Heatmap (dieses Match).

### Über Matches hinweg (Alle Matches) {#across-matches-all-matches}

Über jedes geladene Match:

- „N Matches · M Runden · <Karten>“ und „N Runden unentschieden, von keiner Seite gewonnen“, wenn es Unentschieden gab;
- **Gewonnene Runden** je Seite: insgesamt, bei **Pistol**-Runden (die Pistolenrunden der Zusammenfassung) und bei **Eco**-, **Force**- und **vollen** Käufen (jeweils als Prozentwert mit den gespielten Runden; mit dem Zeiger: „gewonnen von gespielt“). Eine unentschiedene Runde wird von beiden Seiten gespielt und von keiner gewonnen;
- **Bombe**: Plants je Ort und wie oft die T-Seite danach diese Runden gewann („12 Plants auf A (T gewann 67 %)“), Plants, deren Ort die Zusammenfassung allein nicht kennt („2 Plants auf einem unbekannten Ort (T gewann 50 %)“), oder „nie gelegt“; wie Runden endeten, häufigste zuerst;
- „Die Seite, die den ersten Abschuss nahm, gewann N % dieser Runden.“ (ein Selbstmord ist kein Opening-Abschuss; eine unentschiedene Runde verwandelt kein Opening);
- **Opening-Duelle, wo**: die zehn Orte mit den meisten Opening-Abschüssen (nach dem Ort des Opfers; die Ortsnamen des Spiels lesbar gemacht, „TopofMid“ → „Top of Mid“), Duelle und der Anteil, den die T-Seite gewann;
- **Spieler**: die fünfzehn besten nach Abschüssen minus Tode, zusammengefasst über alle ihre Matches (zugeordnet über die Steam-ID): Matches, K-D, ADR und KAST, gewichtet nach gespielten Runden, HS-% gewichtet nach Abschüssen, Opening-Duelle. **Klick auf einen Spieler** für seine Abschüsse und Tode über alle Matches in der Heatmap.

Die Schaltflächen In der Heatmap zeigen für alle geladenen Matches stehen darunter.

## Was die Runden entschied {#what-decided-the-rounds}

Der Tab zählt; [Erkenntnisse](insights.md#who-won-what-decided-the-rounds) erklärt. Ist die Heatmap-Tabelle eines Matches geladen (sie trägt die Spalte `won`), teilt **Erkenntnisse** die Runden jeder Seite danach auf, was in ihnen geschah – das Eröffnungsduell, der Kauf, ein vergoltener erster Tod, die Platzierung, Hilfsmittel, ein früher erster Kontakt, jeder gehaltene Ort und jeder in den ersten 25 s erreichte Ort – und sagt, was den Unterschied machte, mit der Differenz der Siegquoten, ihrem 95-%-Intervall und q, und *wenige Runden*, wo ein Zweig weniger als acht hat. Es nennt die Wendepunkte (die Abschüsse und Platzierungen, die die Siegwahrscheinlichkeit am meisten bewegten) und die Spieler und Orte, die am meisten hinzufügten oder kosteten, und die **Nachbesprechung** und der **Kommentator** beginnen damit. Ein erfundenes Beispiel:

> T gewann 79 % der 19 Runden, in denen es Mid hielt, gegen 24 % von 21 ohne (55 Punkte, 95 % 26 bis 74) – q 0,004.
>
> Wendepunkte: Runde 17 bei 48 s, ein Abschuss von CT an B site bewegte seine Chance von 31 % auf 58 %, und es holte die Runde.

Ein Match hat weniger als 30 Runden, daher kommen seine Siegwahrscheinlichkeiten aus einem festen Vorab-Modell aus den lebenden Spielern, der Platzierung und der Uhr; der Text sagt das. Über viele Matches stellt die [Massenanalyse](mass-analysis.md#who-won) dieselben Fragen.

## In der Heatmap zeigen {#show-in-the-heatmap}

Jeder Link setzt die eigenen **Filter** der Heatmap, daher bleibt sichtbar und änderbar, was gezeigt wird, im Panel Filter, und **Alle zeigen** löscht sie. Sie arbeiten auf der Heatmap-Tabelle, die im Tab Heatmap geladen ist; der Tab Match lädt sie nie selbst.

| Schaltfläche | Gezeigte Ereignisse |
|---|---|
| **Positionen** | `position` – wo die Spieler waren, achtmal pro Sekunde |
| **Abschüsse** | `kill` – wo der Täter stand |
| **Tode** | `death` – wo das Opfer fiel |
| **Opening Kills** | `kill` und `death` mit `opening` = 1 – der erste Abschuss jeder Runde, wo beide standen (nur angeboten, wenn die Tabelle eine Spalte `opening` hat) |
| **Smokes** | `smoke` – wo Rauch landete |
| **Flashes** | `flash` – wo Blendgranaten zündeten |
| **Molotovs** | `molotov` – wo Molotows und Brandbomben brannten |
| **HE** | `he` – wo HE-Granaten detonierten |
| **Plants** | `plant` – wo die Bombe gelegt wurde |
| **Schüsse** | `shot` – wo Schüsse abgegeben wurden |

Der Geltungsbereich richtet sich nach dem Ort der Schaltflächen: alle geladenen Matches, dieses Match oder diese Runde („In der Heatmap zeigen – Runde 7“).

Was nicht angewendet werden kann, steht unter den Schaltflächen, statt stillschweigend auf nichts gefiltert zu werden: „keine Match-Spalte behalten – Match nicht angewendet“, „Match: X nicht in den geladenen Daten“, dasselbe für Runde und Ereignisse, „Spieler X nicht in den geladenen Daten“, „Seite X nicht in den geladenen Daten“, „keine Heatmap-Daten geladen: lade die .parquet-Dateien der Matches im Tab Heatmap“. Ohne geladene Daten sagen die Links außerdem: „Lade die .parquet-Dateien der Matches im Tab Heatmap, um sie auf der Karte zu sehen.“

**Runde abspielen** schaltet zusätzlich die Heatmap auf **Box-Replay**, die Zeitleiste auf den Modus *abspielen* mit ihrem Fenster auf *Lebensdauer*, springt zum Anfang der Sitzung der Runde und spielt ab. Wenn die Runde keine Sitzung der geladenen Daten ist: „diese Runde ist keine Sitzung der geladenen Daten: nichts zum Abspielen“.

## Für Entwickler {#for-developers}

Code: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Zusammenfassungs-Versionen {#summary-versions}

Der Tab liest Zusammenfassungen der Version 1 und der Version 2 (`"version"` in der Datei) nebeneinander und behandelt sie gleich:

| | Version 2 | Version 1 |
|---|---|---|
| Zeit des Plants | Sekunden in der Runde, wie bei den Abschüssen | Sekunden des Matches; der Tab zieht den Start der Runde ab |
| Ort des Plants | `A` oder `B`; leer, wenn die Demo es nicht sagt | `A`, `B` oder eine Entitätsnummer – als unbekannter Ort gelesen |
| Halbzeitlänge | `halfLength`, ab dem Punkt, an dem die Seiten zuerst tauschen; 12, wenn es null ist | 12 (MR12) |
| Pistolenrunden | `pistolRounds` (Runde 1 und die erste Runde nach der Halbzeit) | die Runden, deren Kauf `pistol` ist |
| unentschiedene Runde | `winner` und `winnerTeam` leer | – |
| Selbstmord | `suicide` beim Abschuss, nie ein Teamkill | erkannt daran, dass Täter und Opfer derselbe Spieler sind |

`noscope` und `attackerBlind` eines Abschusses (Version 2) werden im Tab Match nicht gezeigt, und der Tab zeigt auch keinen Ort aus der Heatmap-Tabelle, daher ändert ein leerer `place` einer Granatenzeile dort hier nichts.

Wie ein Fokus zu Filtern wird (`focusFilters`):

- **Match** → ein Kategoriefilter auf der Spalte `match`;
- **Runde** → ein Bereichsfilter `round` = N auf einer numerischen Spalte `round` (ein Kategoriefilter bei einer kategorischen), und die Sitzung der Runde (`<match> #NN`) wird in der Sitzungsauswahl gewählt;
- **Ereignisse** → ein Kategoriefilter auf der Spalte `event`;
- **Spieler** → ein Personenfilter auf diesen Spieler;
- **Seite** → ein Gruppenfilter.
