---
title: "Streckenstatistik"
parent: "Rennanalyse"
nav_order: 57
lang: "de"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Streckenstatistik

Lade viele Runden einer Strecke, und der Viewer zählt die Fehler: welche Kurve die meiste Zeit kostet, in wie vielen Runden dort etwas schiefging und warum. Damit findest du die Kurve, die sich zu üben lohnt.

Probier es aus: **Demo-Runden** gibt drei Runden, genug, damit dieser Abschnitt erscheint.

![Streckenstatistik mit der Fehlerkarte: die Strecke, eingefärbt nach der Anzahl der Runden, die in jeder Kurve Zeit verloren, und die Liste der Kurven](../assets/img/en/race-course-mistake-map.webp)

Lade den ganzen Ordner einer Strecke – dutzende Runden, mehrere Autos, mehrere Leistungsklassen –, und jede Runde wird beurteilt und dann gezählt. Diese Seite behandelt den Vergleich nach Klasse, was als Fehler gilt, den Abschnitt **Streckenstatistik**, die Fehlerkarte, den Export für die Heatmap, Strecken aus mehreren Rennstrecken und die Leistungsgrenzen bei vielen Runden.

## Gegen die Beste der eigenen Klasse {#against-the-best-of-its-own-class}

Eine Runde wird Kurve für Kurve mit der **schnellsten vollständigen Runde ihrer eigenen Leistungsklasse** verglichen (der Referenz, in der Klasse der Referenz). Diese Runde selbst wird mit dem Schnellsten ihrer Klasse in jeder Kurve verglichen, oder mit allen Runden, wenn sie allein in ihrer Klasse ist. Autos werden nach der Leistungsklasse des Spiels gruppiert (in Forza D bis X; C und S2 sind zwei davon). Der Bremspunkt eines C-Autos gegen den eines S2-Autos sagt nichts über das Fahren aus. Die Zeitkarte, die Lücken in der Rundenliste und die Tabelle *Kurve für Kurve* folgen demselben Vergleich (siehe [mit wem jede Runde verglichen wird](race-corner-analysis.md#who-each-lap-is-compared-with)).

Die Statistik baut auf der Analyse jeder Runde auf, nicht daneben.

## Was als Fehler gilt {#what-counts-as-a-mistake}

Ein **Vorkommen** ist der Fehler einer Runde in einer Kurve (einem Abschnitt). Die Fehler einer Runde in einer Kurve sind:

1. **Die fahrerische Ursache**, die die Analyse für ihren Verlust dort gefunden hat – ein Befund, der ein Verlust ist, dem Fahrer zugeschrieben (nicht dem Auto oder der Situation), und der **0,05 s** oder mehr gegenüber ihrer Vergleichsrunde kostet. Seine Kosten sind der Verlust der Kurve.
2. **Jeder Fehler bei der Fahrzeugkontrolle**, den sie dort machte und die andere Runde nicht (nicht geteilt), der **0,03 s** oder mehr kostet – Blockieren, Durchdrehen, Heck, das ausbricht, Schieben, Dreher. Seine Kosten sind die des Ereignisses selbst.
3. **Jeder Kontakt und Unfall**, geteilt oder nicht, egal was er kostete.

Eine Kurve kann mehrere enthalten; jede Art wird **einmal pro Runde und Kurve** gezählt. Gewinne, der Anteil des Autos und eine spätere Ankunft, die in der Kurve davor entschieden wurde, sind keine Fehler.

### Von Befunden zu Fehlern {#from-findings-to-mistakes}

| Befund | Fehler |
|---|---|
| zu schnell hinein, langsam heraus, weil mehr als ein paar Meter später gebremst wurde als bei der anderen | Zu spät gebremst |
| zu früh gebremst | Zu früh gebremst |
| zu zaghaft gebremst | Zu zaghaft gebremst |
| ein Blockieren als Ursache | Rad blockiert |
| gerollt | Gerollt |
| Griff übrig, langsamer zum Scheitelpunkt, gebremst, wo die andere nur vom Gas ging | Zu langsam durch die Kurvenmitte |
| eine zu enge Linie | Zu enge Linie |
| nach außen geschoben | Nach außen geschoben |
| das Auto zu wenig / zu weit eingedreht | Auto falsch eingedreht |
| später am Gas, später Vollgas, gezögert | Spät am Gas |
| langsamer aus der Kurve | Langsamer raus |
| Radschlupf | Durchdrehende Räder |
| das Heck brach aus, seitlich durch die Kurvenmitte | Heck ausgebrochen |
| nach außen getragen | Nach außen getragen |
| Tempo verloren | Tempo vernichtet |
| vom Gas (beim Hineinfahren oder auf der Geraden) | Gelupft |
| beinahe Stillstand, Dreher, Kontakt oder Unfall als Ursache | Gedreht / Kontakt / Unfall, wenn die Ereignisse der Runde dort es sagen (Unfall zuerst, dann Dreher, dann Kontakt); sonst Fast stehen geblieben |
| ein zu weiter Flug | Zu weit geflogen |

Die beiden Muster werden nach der Ursache gezählt, die in ihnen steckt, nach derselben Tabelle. *Beim Hineinfahren mehr hergegeben, als der Ausgang zurückholte* ist der Fehler der Ursache seines Eintrags: frühes Bremsen ist *Zu früh gebremst*, ein Blockieren *Rad blockiert*, Rollen *Gerollt*, ungenutzter Griff *Zu langsam durch die Kurvenmitte*. *Zu schnell hinein, langsam heraus* ist *Zu spät gebremst*, wenn die Runde später bremste als die andere; sonst der Fehler der Ursache seines Ausgangs – *Spät am Gas*, *Durchdrehende Räder*, *Heck ausgebrochen*, *Nach außen getragen*, *Langsamer raus*. Ein Muster, dessen Ursache beim Auto liegt oder bei einer späteren Ankunft, zählt nicht.

Nicht gezählt: spätere Ankunft, der Start, jeder Befund zum *Auto* (Zug, Griff, Bremsen, Antrieb) und jeder Gewinn oder jede Kurve ohne Verlust.

### Die Arten in ihrer Reihenfolge {#the-kinds-in-their-order}

Bremsen: *Zu spät gebremst*, *Zu früh gebremst*, *Zu zaghaft gebremst*, *Rad blockiert*. Einfahrt: *Gerollt*, *Zu langsam durch die Kurvenmitte*, *Zu enge Linie*, *Nach außen geschoben*, *Auto falsch eingedreht*. Ausfahrt: *Spät am Gas*, *Langsamer raus*, *Durchdrehende Räder*, *Heck ausgebrochen*, *Nach außen getragen*, *Tempo vernichtet*. Gerade: *Gelupft*. Zwischenfälle: *Gedreht*, *Kontakt*, *Unfall*, *Fast stehen geblieben*, *Zu weit geflogen*.

## Der Abschnitt Streckenstatistik {#the-course-statistics-section}

Er erscheint ab **3** Runden, zwischen **Runden** und **Wo Zeit zu holen ist**.

- **Die Zusammenfassung**: „40 Runden in 9 Autos, 3 Klassen: jede Kurve für Kurve mit der schnellsten Runde ihrer eigenen Klasse verglichen.“ (Autos werden nach Startnummer gezählt oder nach Name.)
- **Klassen-Chips** (bei mehreren Klassen): **Alle** und ein Chip pro Klasse, jeweils mit ihrer Rundenzahl, in der Reihenfolge des Spiels (D, C, B, A, S1, S2, R, X, dann andere). Ein Klick auf eine Klasse zeigt nur deren Runden; **Shift+Klick** fügt eine hinzu oder entfernt sie. Alles darunter – die Listen, die Karte, der Export für die Heatmap – folgt den gewählten Klassen.
- **Was am häufigsten schiefgeht**: jede Fehlerart, die meisten Runden zuerst (dann die meiste Zeit, dann die meisten Kosten), höchstens 8 (**Alle N Arten** zeigt den Rest, **Weniger** blendet sie wieder aus). Jede Zeile: ihr Name, „N von M Runden“, ein Balken dieses Anteils und „K-mal · etwa X s · am häufigsten in T3 (5), T7 (4), T1 (2)“ – wie oft sie vorkam (Runde für Kurve), was sie insgesamt kostete und die drei Kurven, in denen die meisten Runden sie machten. **Klick auf eine Zeile** zeigt sie auf der Fehlerkarte (und schaltet die Karte ein); ein erneuter Klick zeigt alle Fehler.
- **Kurve für Kurve** (oder *Kurve für Kurve – <Fehler>*, wenn einer gewählt ist): pro Abschnitt „N von M verloren Zeit · X s“ – Runden, die die ganze Kurve fuhren, davon die, die dort **0,05 s** oder mehr gegenüber der Besten ihrer Klasse verloren, und die ganze Zeit, die sie verloren. Aufgeklappt listet sie ihre drei häufigsten Fehler mit der Anzahl der Runden. **Klick auf eine Kurve** öffnet sie, rahmt sie mit der Kamera ein und wechselt zur Fehlerkarte: für jeden Fehler (oder nur den gewählten) eine Zeile wie „12 von 40 Runden haben hier zu früh gebremst. In 9 verschiedenen Autos – je etwa 0,21 s.“ und die Runden, die ihn machten, **die schlimmsten zuerst**, jede mit ihren Kosten – höchstens 8, „+N weitere“ für den Rest. **Klick auf eine Runde** fokussiert sie und spielt diesen Fehler ab (ausgerichtet 40 m davor).
- **In der Heatmap zeigen**: siehe unten. „Heatmap wird erstellt…“, während sie läuft; deaktiviert, wenn es keine Fehler gibt.

## Die Fehlerkarte {#the-mistake-map}

**Ansicht → Fehlerkarte** malt entlang des Referenzpfads, wie viele der Runden (der gewählten Klassen) an jedem Meter einen Fehler machten – jede Art oder die in der Statistik gewählte. Jede Runde zählt einmal pro Meter; der Bereich jedes Vorkommens (wo seine Ursache oder sein Ereignis war) wird um je 6 m nach beiden Seiten verbreitert, damit ein kurzer sichtbar wird. Breiter und heller, wo mehr Runden hier waren: Breite `3 + 10 · (Runden hier / meiste Runden überall)` Meter, Farbe von dunklem Braun zu hellem Orange; ein graues 2-m-Band, wo keine war. Legende: *wenige Runden ↔ die meisten Runden*.

Mit eingeschalteten **Beschriftungen** trägt der Scheitelpunkt jeder Kurve ihren häufigsten Fehler: „T3 · 12/40 frühes Bremsen“ (Runden, die ihn machten / Runden, die die Kurve fuhren), „T3 · 12/40“ mit einer gewählten Art, „T3 · sauber“ ohne Auswahl. Beim Darüberfahren listet ein Label die Verluste der Kurve und ihre fünf häufigsten Fehler; ein Klick darauf öffnet oder schließt diese Kurve in der Statistik.

## In der Heatmap zeigen {#show-in-the-heatmap}

**In der Heatmap zeigen** gibt dasselbe an den Heatmap-Tab als Datensatz mit dem Namen „Fehler auf <Strecke>“ (oder „Fehler auf der Strecke“), so dass das ganze Werkzeug der Heatmap – Heat-Modi, Filter, die Zeitleiste, Schnitte – auf die Frage angewendet werden kann, wo die Runden schiefgehen.

Es ist eine CSV, die im Speicher erstellt wird (`mistakeTable`), eine Zeile pro Rasterpunkt (alle 2 m) jedes Vorkommens, an der **eigenen Position der Runde** dort:

| Spalte | Inhalt |
|---|---|
| `x`, `y`, `z` | die Position der Runde auf diesem Meter (Spielkoordinaten) |
| `elapsed` | die Zeit der Runde dort, s |
| `lap` | die Bezeichnung der Runde |
| `car` | der Name des Autos (oder „car 1234“) |
| `mistake` | der Name des Fehlers in der aktuellen Sprache |
| `car_class` | die Klasse, `-` wenn keine |
| `corner` | die Bezeichnung der Kurve, `T3` |
| `cost` | die Kosten des Vorkommens, s |

Sie wird über den eigenen Lader der Heatmap geladen, mit Zuordnungshinweisen: Y oben, keine Achsenspiegelung, Maßstab 1; Zeit `elapsed` in Sekunden; **Person** = `car`, **Gruppe** = `mistake`, **Sitzung** = `lap`; keine Blickrichtung; `car_class`, `corner` und `cost` bleiben als Filterspalten erhalten. Danach wechselt der Tab zu **Heatmap** und rahmt die Daten ein. Exportiert werden nur die Klassen, die in der Statistik gewählt sind.

## Strecken aus mehreren Rennstrecken {#courses-from-several-tracks}

Runden werden **eine Strecke nach der anderen** analysiert. Ein Ordner mit den Runden mehrerer Strecken – die ganze Rundenbibliothek – bietet jede Strecke einzeln zum Laden an (mit ihrer Rundenzahl, die meisten zuerst). Runden von Fahrten, die nie ins Ziel kamen (`unfinished/` von FH Companion), gehen mit ihrer Strecke und sind als *teilweise* markiert. Runden mehrerer benannter Rennstrecken, als Dateien gewählt, werden ebenso angeboten; Runden ohne Streckenname gehen zu der, die gewählt ist. Das Laden von Runden einer anderen benannten Strecke als der geladenen ersetzt sie. Details: [Runden laden](race-loading-laps.md#folders-and-courses).

## Leistung bei vielen Runden {#performance-with-many-laps}

Dutzende Runden werden in ein oder zwei Sekunden analysiert (immer alle). Was gezeichnet wird, ist begrenzt, damit die Ansicht bei Bildrate bleibt:

| Grenze | Wert | Wirkung |
|---|---|---|
| standardmäßig gezeichnete Runden | 8 (`SHOW_ALL_UP_TO`) | ab 8 geladenen Runden werden neu hinzugefügte Runden ausgeblendet, außer sie sind die Referenz, die fokussierte Runde oder die Beste ihrer Klasse. **Alle zeigen** zeichnet jede Runde; **Nur die betrachteten** nimmt das zurück. Eine Runde zu fokussieren blendet sie und die Beste ihrer Klasse wieder ein |
| einfache Autos und dünne Linien | über 10 sichtbare (`PLAIN_PAST`) | Runden außer dem Fokus, dem verfolgten Auto und der Referenz: ein Linienpunkt alle 6 m (statt 1,5 m), Autos einfach gezeichnet |
| aufgelistete Runden im Diagramm | 8 (`CHART_LAPS`) | Fokus, Beste ihrer Klasse und Referenz zuerst; „+N weitere gezeichnet, nicht im Diagramm“ |
| HUD-Karten | 6 | die ersten sechs sichtbaren Runden |
| Statistik | ab 3 Runden | der Abschnitt ist darunter ausgeblendet |
| aufgelistete Befunde | 12 Fahrer, 8 Auto/Kontext, 10 Gewinne | pro fokussierter Runde |
| angezeigte Autopaare | 3 | über 3 Paare hinaus ein Paar mit Auswahl |

Die Fehlervorkommen werden einmal pro Analyse berechnet und zwischengespeichert; die Dichte der Fehlerkarte wird pro Klassenauswahl und Fehler zwischengespeichert.

## Für Entwickler {#for-developers}

Code: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` in [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
