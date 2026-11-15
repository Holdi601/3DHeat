---
title: "Massenanalyse"
nav_order: 8
lang: "de"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: true
---

# Massenanalyse: Tausende Matches auf einmal

Die **Massenanalyse** zeigt dir, was ein ganzer Ordner voller Matches ergibt: welches Fahrzeug am meisten gewinnt, welche Seite bevorzugt ist, wo das Geschehen liegt. Nutze sie, wenn du weit mehr Matches hast, als du dir ansehen kannst.

Sie arbeitet mit einer kleinen Zusammenfassung jedes Matches, daher öffnen sich tausend oder zehntausend Matches schnell. Die vollen Zeilen lädt sie nur für die Matches, die du anklickst.

## Ausprobieren {#try-it}

1. Öffne **Massenanalyse** in der Seitenleiste der Heatmap.
2. Drücke **Ordner…** (oder **Dateien…**) und wähle deine `.3dheat`-Matches.
3. Warte, während das Panel die Zusammenfassungen liest („Zusammenfassungen… n von N“).
4. Drücke **Analyse öffnen**. Ein Fenster mit Tabs öffnet sich.
5. Stelle die Filter ein (Spiel, Karte, Modus, Von, Nach) und lies einen Tab, zum Beispiel Balance.
6. Klick auf eine Zeile, eine Zelle oder eine Erkenntnis: Ihre Matches laden in die 3D-Ansicht, mit der Kamera am Ort.

![Der Tab Balance: Siegquote und Abschüsse je Tod nach Fahrzeug](../assets/img/en/mass-balance.webp)

```
folder of .3dheat -> summaries -> window (tabs) -> click a row -> matches open in 3D
```

Eine `.3dheat`-Datei ist ein Match ([Eine Datei pro Match](container.md)). Eine *Heatmap* und eine *Zeile* werden im [Glossar](glossary.md) erklärt.

## Die Zusammenfassungen erhalten {#getting-the-summaries}

Für die meisten Leute ist nichts zu tun: Das Panel berechnet fehlende Zusammenfassungen selbst. Um einen großen Ordner einmal vorzubereiten, nimm das Offline-Werkzeug unten.

Jedes `.3dheat`-Match bekommt eine Zusammenfassung (`src/mass/summarize.ts`), die im Container als Mitglied `<match>.summary.json` (Rolle `summary`, siehe [Eine Datei pro Match](container.md)) gespeichert wird. Das Offline-Werkzeug schreibt sie, und dazu einen Index je Ordner. Es ist ein Entwicklerwerkzeug; lauf es auf einem großen Ordner, um dem Panel die Arbeit zu sparen:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Ein Match, das schon zusammengefasst ist (gleiche Formatversion), wird nur gelesen; `--force`
  rechnet es neu aus. `--no-write` lässt die Container unberührt.
- Eine Datei, die in den letzten `--settle` Minuten (10) geändert wurde, wird ausgelassen: Ein Konverter
  schreibt sie vielleicht noch.
- `<folder>/3dheat-index.jsonl.gz`: eine Zeile pro Match – sein Pfad, seine Größe, Zeit
  und Zusammenfassung ohne das Raster. `<folder>/3dheat-index.grids.jsonl.gz`: eine Zeile pro Match
  mit seinem Raster.
- Lauf es auf dem Rechner, auf dem die Dateien liegen, mit niedriger Priorität (zum Beispiel `nice -n 19 ionice -c3` unter Linux).

Das Panel nimmt für jedes Match das Erste aus dieser Reihe: die Indexzeile des Ordners (gleicher
Pfad und gleiche Größe), den Cache des Browsers (IndexedDB, nach Name, Größe und Zeit), das
Mitglied `summary` des Containers oder eine Zusammenfassung, die in einem Pool aus Workern berechnet
und zwischengespeichert wird. So funktioniert auch ein Ordner ohne Index – das erste Mal in der
Geschwindigkeit des Lesens der Tabellen, danach aus dem Cache.

## Das Panel {#the-panel}

Wähle einen Ordner (oder Dateien; **Ordner hinzufügen…** hängt einen weiteren an). Das Fenster hat die Filter **Spiel**, **Karte**, **Modus**, **Von** und **Nach**, eine Auswahl **Aufteilen nach**, **Wenigste Leben** und **Nur Spieler** sowie diese Tabs. Jede Zahl stammt aus den Zusammenfassungen. Ein Klick auf eine Zeile, eine Zelle oder eine Erkenntnis lädt ihre Matches als Overlay für viele Matches in die Ansicht, mit den Filtern, die sie zeigen (Fahrzeug, Klasse, Waffe, Team, Spieler), und die Kamera am Ort:

| Tab | Was |
|---|---|
| Überblick | Matches, Stunden, Spieler, Leben, Zeilen, Daten; Matches pro Tag; nach Spiel, Karte, Modus; Summen der Ereignisse; Wirtschaft nach Währung; wann im Match Dinge geschehen |
| Balance | nach Fahrzeug, Klasse, Waffe oder Team, aufgeteilt nach Karte, Modus, Stufe oder Spiel: K/D mit seinem Intervall von ~95 %, Siegquote (Wilson), Überleben, Abschüsse und Treffer pro Minute, Verdienst pro Minute, und q – die Benjamini-Hochberg-Falschentdeckungsrate von K/D und Sieg gegen den Rest der Aufteilung. **Wenigste Leben** blendet Zeilen mit zu wenigen Leben aus, denen man nicht trauen kann; **Nur Spieler** lässt aus, was die KI der Mission steuerte |
| Trends | Nutzung (Anteil an der Anwesenheit), K/D oder Siegquote der führenden Fahrzeuge oder Klassen je Tag, Woche oder Monat |
| Spieler | verschiedene Spieler, Matches je Spieler, Spieler je Match, die häufigsten Spieler |
| Seiten | jede Seite jeder Karte: gewonnene Matches gegen eine gleichmäßige Aufteilung |
| Nahkampf | Rundendaten: Eröffnungsduelle nach Seite und ihrer Umsetzung, Trades, Angreifer gegen Verteidiger, Kreuzfeuer, Einstiege nach Blendung, Zielen, Plants, Mann-Vorteil und, **Nach Karte**, die Orte, die die Spieler töten, die sie betreten – jeweils ein Anteil mit seinem Wilson-Intervall, aus den `cqb`-Zählungen der Zusammenfassungen ([Nahkampf und Runden](close-quarters.md)) |
| Karte | die summierte Raster einer Karte: Anwesenheit, Abschüsse, Tode, K/D, jedes Ereignis, Fluss, und **heiß in wie vielen Matches** (Stabilität); nach Team, bei 1-, 2-, 4- oder 8-facher Zellgröße |
| Orte | Orte, die in den Zahlen auffallen, aber nicht in der Heatmap (ein großes Gebiet, das insgesamt belebt ist, Korridore, Höhenbänder); **Orte finden** |
| Nischen | Gruppen, die deutlich besser oder schlechter abschneiden als der Rest (ein Fahrzeug auf einer Karte, ein Sektor in einer Höhe); **Nischen finden** |
| Erkenntnisse | die Detektoren für viele Matches und die Kartendetektoren (unten); **Bericht kopieren (JSON)** gibt das JSON, das ein Sprachmodell liest |

## Erkenntnisse über viele Matches {#insights-over-many-matches}

Der Tab **Orte** findet Orte, die in den Zahlen auffallen, aber nicht in der Heatmap – ein großes Gebiet, das insgesamt belebt ist, ein Korridor, ein Höhenband, ein Ort, der nur in einem Teil des Matches belebt ist. Er markiert die, die die einfache Heatmap nicht zeigt, als **verborgen**, und umrandet sie in der 3D-Ansicht; **Laden** fliegt dorthin mit den Matches, die er darin hielt. Der Tab **Nischen** findet Gruppen (ein Fahrzeug auf einer Karte und Seite, ein Sektor in einer Höhe), die deutlich besser oder schlechter abschneiden als der Rest; klick eine an, um ihre Verfeinerungen zu sehen.

Der Tab **Erkenntnisse** findet über alle Matches Fahrzeuge, die schlechter oder besser tauschen oder gewinnen als der Rest, Orte, die in einem gleichbleibenden Anteil der Matches heiß sind, Seiten, die mehr als eine gleichmäßige Aufteilung gewinnen, Fahrzeuge, deren Nutzung sich über die Daten verschiebt, und Teile des Matches, die mehr Abschüsse halten als eine gleichmäßige Verteilung. Jeder Fund trägt seine Zählungen, seine Wirkung, sein Intervall und eine Falschentdeckungsrate (auf 5 % begrenzt), und ein Klick lädt seine Matches. Einzelheiten: [Für Entwickler](#for-developers).

## Umfang {#scale}

Du kannst selbst eine kleine Version davon wiederholen: `node tools/demo-data.mjs` schreibt 150 synthetische Panzer-Matches nach `tools/.shots/demo/mass` (etwa 1.000 Zeilen je Match). Gemessen an diesen 150 synthetischen Demo-Matches von `tools/demo-data.mjs` auf einem Desktop-PC (ein echtes Match ist weit größer):

- `tools/3dheat-summarize.mjs` mit 4 Workern: 2,6 bis 4,8 s für alle 150, 8 bis 21 ms je Match in einem Worker; ein zweiter Lauf, der nur die Zusammenfassungen liest, dauert etwa 2 s.
- Den Ordner im Panel öffnen, mit vorhandenem Index, bis das Fenster erscheint: 0,9 bis 1,6 s (der eigene Teil des Workers, das Lesen der 150 Indexzeilen, dauert 20 bis 40 ms).
- Zu einem Tab wechseln, bis seine Tabelle gezeichnet ist: Überblick 10 bis 30 ms, Balance 30 bis 70 ms, Trends 30 bis 45 ms, Spieler 15 bis 35 ms, Seiten 15 bis 20 ms, Karte 55 bis 130 ms.
- Der Speicher hält die 150 Matches in etwa 0,5 MB.

Das Öffnen des Fensters braucht einen kurzen Frame: Die ausgewählten Dateien gehen 16 auf einmal an den Worker, und die Datumsfelder und der erste Tab kommen einen Frame danach.

Der Speicher hält etwa 15 KB je Match, also nehmen 10.000 Matches etwa 150 MB im
Worker ein; Raster werden nie für mehr gehalten, als die Karte verlangt.

## Für Entwickler {#for-developers}

### Erkenntnisse über viele Matches {#insights-over-many-matches}

`src/mass/detect.ts` – jeder Fund mit seinen Zählungen, Wirkung und Intervall,
p und q (Benjamini-Hochberg über alles, was der Detektor versucht hat, auf 5 % begrenzt),
die Detailansicht, die seine Matches lädt, und ein Satzschlüssel mit seinen Werten;
der Bericht (`heat3d.mass/1`) ist das, was `massReportForModel` einem Erzähler übergibt,
in derselben Form wie der Bericht eines einzelnen Matches (`insights/seam.ts`).

| Detektor | Findet |
|---|---|
| `balance` | ein Spielerfahrzeug, das auf einer Karte oder in einem Modus besser oder schlechter tauscht oder gewinnt als der Rest |
| `hotspot` | Orte, die in einem gleichbleibenden Anteil der Matches heiß sind, die kamen (heiße Matches / gesehene Matches, gegen die anderen Zellen der Karte) – nicht nur insgesamt heiß |
| `side` | eine Seite einer Karte, die mehr als eine gleichmäßige Aufteilung gewinnt |
| `meta` | der Anteil eines Fahrzeugs an den Spielerleben oder sein K/D, das sich zwischen der früheren und der späteren Hälfte der Daten verschiebt, je Karte – groß genug, um zu zählen, über die Quartale einen Trend zeigend, auf den meisten Karten in gleicher Richtung (unten) |
| `phase` | ein Teil der Matchlänge, der mehr Abschüsse, Treffer, Starts ... hält als eine gleichmäßige Verteilung |
| `place` | Orte, die über viele Matches auffallen (Stufe B, unten): die Rate einer Region oder der Abschussanteil gegen den eigenen jedes Matches, Kreise, Korridore, gewachsene Zonen, Höhenbänder, Phasen; verborgen, wenn die einfache Heatmap sie nicht zeigt |
| `niche` | Gruppen, die deutlich besser oder schlechter abschneiden (Stufe B, unten) |
| `grid.*` | die Detektoren für einen einzelnen Datensatz (Positionen mit Kraft, heiße und ruhige Zonen, Klassenorte) auf den summierten Rastern jeder Karte: `GridMerge.toInsightJob` füllt die Raster des Erkenntnisdurchgangs aus den Zusammenfassungen; die Detektoren, die Spuren brauchen, werden übersprungen |

### Die Zusammenfassung {#the-summary}

Einfaches JSON (`src/mass/types.ts`), etwa 5–30 KB komprimiert je Match:

- das Match: Spiel, Karte, Modus, Mission, Start, Länge, Zeilen, Leben, Spieler,
  KI, Teams (Leben, Spieler, Anwesenheit, Abschüsse, Tode, gewonnen, Geld), Sieger;
- je Fahrzeug und Team: Klasse, Stufe, Leben, Spielerleben, Anwesenheit, Ereignisse
  nach kanonischer Art, Abschüsse nach Klasse des Ziels, Siege, Geld;
- je Spieler (nach Benutzer-ID, sonst Name): Team, Leben, Anwesenheit, Abschüsse, Tode,
  Treffer, Starts, gewonnen, Fahrzeuge; je Waffe: Ereignisse nach Art;
- die Spalten der Wirtschaft (`cost_*`, `earn_*`) und ihre Summen;
- Phasen: Ereignisse nach Art in 20 Abschnitten der Matchlänge und nach der Minute;
- Verhalten: die Maße des kollektiven Verhaltens im Match (Ausrichtung, Routenherde, Spuren,
  Gedränge, Anführer, Nachzügler, Bruchpunkt, Risiko nach Verlusten, Serien,
  Kaufübereinstimmung, Unterdrückung), jeweils mit eigenem Nullmodell,
  p und q – siehe [Kollektives Verhalten](collective-behaviour.md);
- das Raster (unten).

Gezählt, wie der Viewer zählt: Spalten, die der Lader für viele Matches findet
(`leanSpec`), Ereignisse nach `data/canonical.ts`; ein Abschuss, den eine Tacview-Waffe
erzielt, zählt für ihren Schützen; ein Tod, der zweimal gleichzeitig gemeldet wird
(`dead`, `death`), zählt einmal.

#### Das Raster: worauf Stufe B aufbaut {#the-grid-what-stage-b-builds-on}

Der räumliche Teil ist für Scan-Statistiken über Regionen jeder Größe und Form gemacht,
nicht nur für Heatmap-Bilder:

- **Eine Pyramide.** Zellen sind ausgerichtete Zweierpotenzen in Welteinheiten (x, z, so wie der
  Viewer sie setzt). Stufe `k` sind die Zellen, summiert nach `ix >> k, iz >> k` –
  exakt, innerhalb eines Matches und über Matches mit anderen Zellgrößen hinweg – und jede
  Region (ein Kasten, ein Korridor entlang einer Linie, ein Ring) ist eine Summe von Zellen. Die
  feinste Stufe passt die robuste Ausdehnung des Matches (die Zellen mit 99 % der Anwesenheit)
  in 128 Zellen; Ausreißer außerhalb davon bleiben erhalten.
- **Belastung neben jeder Zählung.** Anwesenheitssekunden je Zelle, je Team (`pt`),
  je Fahrzeugklasse (`pc`) und je Höhenband (`ph`), sodass die Rate, der Erwartungswert und das
  Verhältnis einer Region für jede Untergruppe berechnet werden können.
- **Höhe.** Bänder über dem Boden des Matches (dem 1. Perzentil der Höhe): unter 3 m, 3–10,
  10–30, 30–100, 100–300, 300–1000, 1000–3000, darüber; eine Datei mit einer Spalte `floor`/`storey`/`deck`
  bildet stattdessen Bänder nach ihren Stockwerken. `y` ist die mittlere Höhe jeder Zelle, `y0`
  ihre niedrigste (ihr Stockwerk, für die Höhe darüber).
- **Ereignisse** als Tupel `[cell, kind, team, class, band, count]`.
- **Zeitscheiben** auf einer groben Stufe (8 Zellen je Seite), nach der Minute ab
  dem Matchstart: `[cx, cz, minute, kind, value]`, Anwesenheitssekunden als Art
  `GRID_KINDS.length`; Matchphasen sind Minuten über die Länge.
- Dünn besetzt, Zählungen als ganze Zahlen, Sekunden auf ein Zehntel genau: begrenzt durch das, was geschah.

### Stufe B: Orte und Nischen {#stage-b-places-and-niches}

Stufe B sucht, was in den Zahlen auffällt, ohne ins Auge zu fallen: ein großes Gebiet,
das insgesamt belebt ist, ohne eine heiße Zelle darin; ein ungewöhnliches
Abschuss-Tod-Verhältnis bei wenigen Ereignissen; ein Korridor, ein Höhenband, eine Ansammlung, die nur
in einem Teil des Matches da ist – und Gruppen (ein Fahrzeug auf einer Karte auf einer Seite, ein
Sektor in einer Höhe), die deutlich besser oder schlechter abschneiden als der Rest. Ein
**Orte finden** / **Nischen finden** / **Erkenntnisse finden** führt alle Detektoren aus;
die drei Tabs teilen sich den Bericht.

#### Orte (`src/mass/scan.ts`) {#places-srcmassscants}

Die Matches jeder Karte werden zweimal gelesen, ein Match nach dem anderen; der Speicher hält Summen
auf einem Raster von höchstens 64 Zellen je Seite (16 für den Raum-Zeit-Scan), nie die
Matches.

- **Maße.** Die Rate eines Ereignisses je Sekunde Anwesenheit – Abschüsse, Tode,
  Treffer, Starts, Eroberungen, für alle Einheiten, je Klasse (die 4 mit den meisten
  Ereignissen), je Höhenband – und der Anteil der Abschüsse an Abschüssen und Toden
  (alle, je Seite, je Band). Welche Klassen und Seiten gelten, kommt aus den Köpfen
  (`planOf`).
- **Erwartung je Match.** Die eigene Rate jedes Matches, verteilt über seine eigene Anwesenheit
  in einer Zelle, ist der Erwartungswert der Zelle (ein durch Kovariaten bereinigter
  Kulldorff-Scan, nach Match geschichtet): ein paar blutige Matches oder ein stark
  besuchter Server machen keinen Ort.
- **Streuung.** Matches weichen weit mehr voneinander ab, als Poisson erlaubt. Die Residuen
  jedes Matches werden in Blöcken von 1, 2, 4, 8, 16 Zellen summiert; die Streuung jeder
  Blockgröße (quadrierte Residuen geteilt durch die Nullvarianz, zusammengefasst, die schlechtesten
  5 % der Blöcke ausgelassen) skaliert jeden Test einer Region dieser Größe: ein
  Quasi-Likelihood-Verhältnis, Poisson für Raten, Binomial für Anteile.
- **Regionen.** Kreise mit 0,75 bis 18 Zellen; Ellipsen in sechs Winkeln, 3- und 6-mal so lang wie breit,
  3 bis 18 Zellen (Korridore; die Achse ist der `place.path` der Erkenntnis); Zonen, die
  Zelle für Zelle von den stärksten lokalen Getis-Ord-Gi*-Zellen aus wachsen, solange der z-Wert der
  Region steigt (unregelmäßige Formen) – auf einer Hälfte der Matches gewachsen und auf der
  anderen geprüft, damit die Freiheit des Wachsens keine falschen Orte kostet; jedes Höhenband gegen die
  anderen Bänder der Karte insgesamt (clusterrobust); Raum-Zeit-Zylinder: ein Kreis in einem
  oder zwei Fünfteln der Matchlänge, gegen die eigene Streuung der Ereignisse des Matches über Ort und
  Zeit (der Raum-Zeit-Permutationsscan).
- **Prüfung.** p aus der Quasi-Likelihood; Benjamini-Hochberg über jede Region, die auf jeder
  Karte versucht wurde (700.000 auf drei Karten ist üblich), auf 5 %. Was besteht, wird
  beschnitten (eine Region, die größtenteils in einer stärkeren ihres Maßes liegt, sagt dasselbe),
  erneut auf ihre **Stabilität** geprüft – Matches, die sie sahen, Matches, in denen sie
  lag, ihre Richtung in fünf Falten der Matches – und noch einmal bei der Varianz getestet, die
  die Matches selbst zeigen (clusterrobust, Matches als Cluster, nie unter Poisson), wieder BH.
  Ruhige Orte auf einer Basis (2 % oder mehr der Spawns, Starts und Landungen der Karte) fallen weg.
- **Wirkung.** Das Raten- (oder Chancen-) Verhältnis, durch empirische Bayes geschrumpft (eine
  Gamma-Verteilung als Prior, angepasst an die 2x2-Blöcke der Karte), mit einem Intervall von ~95 % bei
  der Streuung; Gi* bei 1, 2 und 4 Zellen und lokales Moran im Zentrum.
- **Sichtbarkeit.** Wie sehr die Region in der einfachen Heatmap ihres Ereignisses schon zu sehen ist
  (logarithmische Skala bis zur hellsten Zelle, so wie die Ansichten sie zeichnen): ihr Kontrast
  zu einem Ring darum (ein Zehntel der Palette ist schwer zu sehen, zwei Fünftel schlicht) und ein heller
  Gipfel, der den Überschuss trägt; ein Verhältnis wird von der Heatmap nie gezeichnet, daher zählt ein
  Anteil halb. Unter 35 % ist sie **verborgen**. Der Rang: Stärke (die Wirkung, bei 4-facher
  Sättigung, ruhige Orte bei 0,7) mal `1 - 0.7 x obviousness` mal der Übereinstimmung der Falten.

Der Tab **Orte** listet sie auf (standardmäßig nur verborgene; nach Karte, Form, Richtung); ein Klick
umrandet die Orte der Karte in der 3D-Ansicht (`placeLines.ts`: die oberen Linien der Engine, einmal
gebaut – Magenta verborgen, Bernstein einfach, Cyan ruhig, der gewählte voll; ein Band als Kasten von
seinem Boden bis zu seiner Decke) und die Zeichenfläche des Tabs Karte; **Laden** fliegt dorthin und
lädt die 60 Matches, die er am meisten hielt, gefiltert auf sein Ereignis (und seine Klasse).

#### Nischen (`src/mass/niche.ts`) {#niches-srcmassnichets}

Strahlsuche (Breite 24, Tiefe 3) über drei Tabellen: **Leben** (Spielerleben:
Spiel, Karte, Modus, Klasse, Fahrzeug, Seite, Stufe, Quartal der Daten, Drittel der
Matchlängen; K/D, Sieg, Tod bei einem Leben, Abschüsse pro Stunde, Verdienst pro
Minute), **Orte** (Abschüsse und Tode nach Karte, Modus, Daten, Sektor der Karte
4 x 4, Klasse, Seite, Band) und **Phasen** (Sektor und Fünftel des Matches:
K/D, Tode pro Stunde Anwesenheit). Eine Gruppe wird gegen das Ganze geprüft, mit Matches
als Clustern (die Sandwich-Varianz ihrer Residuen nach Match), ihre Wirkung ein Chancen- oder Ratenverhältnis,
geschrumpft durch einen Prior von 20 Ergebnissen; sie braucht 30 Ergebnisse in 8 Matches, eine
Verfeinerung muss 10 % stärker sein als ihr Elternteil, Gruppen, bei denen das Ergebnis immer
oder nie eintritt (dafür nicht erfasst), fallen weg. Behalten: BH unter 5 % über jede geprüfte
Gruppe, ein geschrumpftes Verhältnis von mindestens 1,25 (oder 1/1,25), vier von fünf Falten einig,
keine Verfeinerung, die nur ihr Elternteil wiederholt. Der Tab **Nischen** listet sie auf; ein Klick
zeigt jede Verfeinerung der Gruppe um eine Bedingung (der Explorer), **Laden** lädt ihre Matches.
Ausrüstungen sind noch nicht in den Zusammenfassungen.

#### Verschiebungen im Meta mit praktischer Bedeutung {#meta-shifts-with-practical-significance}

Bei gemischten Daten hat der Binomialtest auf Leben fast jede Änderung als bedeutsam gemeldet.
`meta` prüft jetzt clusterrobust (die Leben jedes Matches als Cluster), behält eine
Nutzungsverschiebung nur bei mindestens 2 Punkten und 25 %, eine K/D-Verschiebung um das
1,3-fache, die Quartale der Daten mit gleichem Trend (Kendalls tau mindestens 0,5) und, bei einem
Fahrzeug auf mehreren Karten, dieselbe Richtung auf den meisten davon. Das lässt auf einem Testsatz, auf dem der einfache Test fast alle markierte, nur wenige Verschiebungen übrig.

#### Für ein Modell {#for-a-model}

`massReportForModel` gibt jedem Ort seine `region` (Form, verborgen,
Sichtbarkeit, Höhen, Phase) und jeder Nische ihre `conditions`, dazu, wie viele
Regionen und Gruppen geprüft wurden. Die Wissenslinse kann Orte als Todeszonen und Anmarschwege
lesen: ihre Arten sind `place.*` und `niche.*`.

#### Prüfungen {#checks}

`scan.test.ts` pflanzt in 240 synthetischen, überstreuten Matches einen diffusen Bereich (1,6-fache Todesrate über einem Kreis
von 22 Zellen, in jeder Zelle schwach), einen Korridor, ein Höhenband und einen
nur-Phasen-Cluster – alle gefunden, der diffuse verborgen – und führt acht Nulldatensätze mit je 60 Matches aus: kein Ort.
`niche.test.ts` findet eine eingepflanzte Gruppe Fahrzeug x Karte x Seite und nichts in
fünf Null-Tabellen.
