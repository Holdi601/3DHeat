---
title: "Nahkampf und Runden"
parent: "Erkenntnisse"
nav_order: 2
lang: "de"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Nahkampf und Runden

Für rundenbasierte Shooter (zuerst Counter-Strike, jeder Datensatz mit Runden, Seiten und Abschüssen) misst Erkenntnisse, wie die Gefechte gewonnen wurden: wer die ersten Duelle gewann und was sie wert waren, ob Tode vergolten wurden, ob der Spieler, der um eine Ecke spähte, den gewann, der sie hielt, ob Kreuzfeuer und Blendgranaten sich auszahlten, wie sich die Rundenchancen mit jedem Abschuss veränderten und welche Türen die Spieler töteten, die hindurchgingen. Nutze es, um zu sehen, warum Runden gewonnen wurden, nicht nur, wer die Abschüsse hatte.

Die Maße stammen aus der Doktrin des Räumens von Räumen und des Stadtkampfs (der tödliche Trichter, Dominanzpunkte, Kreuzfeuer) und aus E-Sport- und Sportanalytik (Siegwahrscheinlichkeit, Wert von Aktionen, bereinigte Plus-Minus). Jedes wird durch die [Wissenslinse](knowledge.md) gelesen und zitiert.

## Ausprobieren {#try-it}

1. Lade ein oder mehrere Matches mit Runden (eine CS2-Konvertierung hat alles, was sie braucht).
2. Öffne **Erkenntnisse** und drücke **Erkenntnisse finden**.
3. Unter **Linsen-Kennzahlen** liest du die Zeilen von *Rundensiegwahrscheinlichkeit* bis *Spielerwirkung*; jede hat ihre Zahlen, ihr 95-%-Intervall, ihren q-Wert und die Quellen, denen sie folgt.
4. Wähle die Linse **E-Sport** oder **Stadtkampf**, um sie durch diese Literatur zu lesen; **Mit KI schreiben** sendet sie mit dem Bericht.

## Was es misst {#what-it-measures}

| Maß | Was es sagt | Wie |
|---|---|---|
| Rundensiegwahrscheinlichkeit | Wie wahrscheinlich jede Seite zu jedem Zeitpunkt die Runde gewinnen würde | Logistische Regression auf die lebenden Spieler jeder Seite, die Bombe oder das Ziel und ihre Zeit, die Rundenuhr und den Einkauf, angepasst an die geladenen Daten; Kalibrierung außerhalb der Anpassung nach Runde geprüft (Brier-Wert und Skill, Log Loss, Kalibrierungsfehler über zehn Klassen, Steigung der Neukalibrierung, AUC) |
| Wert der Aktionen | Wie sehr ein Abschuss, ein Eröffnungsabschuss, ein Trade, ein Abschuss hinter einer Blendgranate, ein Bombenlegen oder eine Blendgranate die Siegchance der Seite veränderte | Siegwahrscheinlichkeit nach minus vor der Aktion; Trades, Eröffnungs- und geblendete Abschüsse gegen die anderen Abschüsse durch Permutation geprüft |
| Eröffnungsduelle | Welche Seite das erste Duell gewinnt, wie oft das die Runde gewinnt, und wo eine Seite Eröffnungen weit über ihrem eigenen Durchschnitt gewinnt | Wilson-Intervalle; Plätze nach exaktem Binomialtest gegen den Anteil der Seite, q über die Plätze |
| Trades | Tode, die ein Teamkamerad innerhalb von 5 s mit einem Abschuss des Schützen vergilt, die dafür benötigte Zeit und die Runden, die gewonnen wurden, wenn der erste Tod vergolten wurde | Fishers exakter Test, Newcombe-Intervall |
| Angreifer gegen Halter | Duelle, bei denen ein Spieler in den Kampf vorrückte (1,5 m/s oder mehr in der letzten Sekunde) und der andere still hielt (0,75 m/s oder weniger): der Anteil des Angreifers | Exakter Binomialtest gegen eine Hälfte |
| Zielen vor dem Duell | Die Sicht jedes Spielers gegen die Richtung zum anderen 0,75 s vor dem Abschuss; wer besser zielte und wie oft dieser Spieler gewann; Halter in ihrem Winkel (innerhalb 15°) gegen außerhalb; Abschussreichweiten | Exakter Binomialtest; Fisher |
| Kreuzfeuer | Halter mit einem stillen Teamkameraden innerhalb von 25 m vom Angreifer, dessen Sichtlinie darauf 35° oder mehr von ihrer eigenen abweicht, gegen Halter allein | Fisher, Newcombe |
| Taktikmittel in Eintritte | Angreifer hinter einer eigenen Blendgranate (innerhalb 3 s und 15 m) oder einem Rauch (innerhalb 18 s) gegen trockene Vorstöße; Eröffnungsduelle mit einer Blendgranate nur auf einer Seite; geblendete Opfer | Fisher, Binomial |
| Mann-Vorteil | Für jeden Zustand lebender Spieler (5 gegen 4, 4 gegen 5, 2 gegen 1 ...), der zuerst in einer Runde erreicht wird, der Anteil der von dort gewonnenen Runden | Wilson-Intervalle |
| Clutches | Runden, in denen eine Seite auf ihren letzten Spieler kam: Siege gegen die vom Modell erwarteten Siege, nach Zahl der Gegner | Normaltest der beobachteten gegen die erwarteten |
| Stapel, Rotationen, Lauern | Die größte Gruppe innerhalb 10 m beim Eröffnungsduell (3 oder mehr: gestapelt); Spieler über 30 m vom ersten Gefecht oder dem gelegten Ziel und wie schnell sie innerhalb von 12 m kommen; Zeit und Abschuss-zu-Tod-Verhältnis über 30 m von jedem Teamkameraden | Fisher; Quotenverhältnis mit Woolfs Intervall |
| Nach dem Setzen und Zurückerobern | Runden, die die setzende Seite gewann, nach den Zahlen beim Setzen, und ihr Anteil an den Duellen nach dem Setzen | Wilson-Intervalle |
| Tödliche Trichter | Eintritte in jeden Ort (eine Änderung der Ortsspalte, sonst einer 8-m-Zelle) und Tode innerhalb von 2,5 s nach dem Eintritt, gegen die Rate der Karte | Exakter Binomialtest, q über die Orte; Verhältnis mit 20 Eintritten zur Rate der Karte gedämpft |
| Spielerwirkung | Hinzugewonnene Siegwahrscheinlichkeit je Runde durch jeden Spieler (Abschüsse, Tode, Bombenlegen), durch empirisches Bayes gedämpft; Ridge-bereinigtes Plus-Minus der Rundenergebnisse gegen den Start des Modells; Abschusswert nach Ort und Waffe, gedämpft | Strafterm, gewählt durch Fünffach-Kreuzvalidierung |

Alle Tests einer Analyse teilen sich eine Falsch-Entdeckungsrate (Benjamini-Hochberg), mit jedem geprüften Ort, nicht nur den gezeigten; der angezeigte q-Wert gilt über alle. Das Modell und seine Kalibrierung sind an die geladenen Daten angepasst, sie beschreiben also diese Population: Ein Profimodell fehlbeurteilt Gelegenheitsspiel und umgekehrt.

Geprüft an synthetischen Runden mit eingebauten Effekten (der Vorteil eines Spähers, Kreuzfeuer, Blendgranaten, ein tödlicher Trichter, besseres Zielen, das gewinnt) und an 100 Datensätzen derselben Runden ohne sie, wo die Falsch-Entdeckungsrate der Tests mit eingebautem Effekt bei den nominalen 5 % bleiben muss (innerhalb eines Bandes) (`src/insights/cqb/cqb.test.ts`); an etwa tausend echten Runden erreichte das Modell einen Brier-Wert von 0,14 gegen 0,25 für die Basisrate, einen Kalibrierungsfehler von 0,03 und eine Steigung der Neukalibrierung von 1,0.

## Benötigte Daten {#data-it-needs}

- Die Spalten **Zeit**, **Spieler**, **Seite** und **Runde** (die Sitzung), und Abschüsse und Tode in der Ereignisspalte; Runden, in denen niemand zweimal stirbt, werden als Eliminierungsrunden behandelt (Mann-Vorteil, Clutches und das Modell brauchen sie);
- eine Spalte **Gegenpartei** (`other`, `victim`, `killer`, `attacker`), die bei einem Abschuss das Opfer und bei einem Tod den Töter nennt (ohne sie werden Abschüsse und Tode im selben Moment gepaart);
- eine **Blickrichtung** für die Zielmaße;
- eine rohe Spalte `event`, die `flash`, `smoke`, `he`, `molotov`, `plant` und `defuse` nennt, für Taktikmittel und Bombenlegen;
- `won` (die Seite der Zeile hat die Runde gewonnen), `place` (Ortsnamen), `weapon`, `buy` und `state_flashed`, wo die Daten sie haben.

Positionen sollten mehrmals pro Sekunde abgetastet werden; Geschwindigkeiten, Zielen und Kreuzfeuer lesen die letzten zwei Sekunden vor jedem Tod.

## In der Aufschlüsselung {#in-the-breakdown}

Die [Aufschlüsselung](breakdown.md) misst vier der Situationen als Faktoren, mit gegen ohne: *geblendet*, *Tod vergolten*, *Eröffnungsduell* und die Zahlen (*Mann oben*, *gleiche Zahl*, *Mann unten*), jeweils bei K/D, gewonnenen Runden, Überleben und Abschüssen pro Minute.

## Viele Matches {#many-matches}

Jede Match-Zusammenfassung der [Analyse vieler Matches](mass-analysis.md) bei Daten mit einer Rundenspalte trägt dieselben Maße als Zählungen (`cqb` in der Zusammenfassung): Eröffnungsduelle, Trades, Vorstöße, Kreuzfeuer, Eintritte nach Blendgranate, Zielen, Mann-Vorteil, Bombenlegen und die 40 am häufigsten betretenen Orte mit ihren Eintritten und Toden. Zählungen addieren sich über Matches, sodass tausend Matches dieselben Anteile ergeben wie eine große Analyse. Der Reiter **Nahkampf** des Felds zeigt sie als Anteile mit ihren Intervallen, über alle Karten oder nach Karte; ein Klick auf eine Zeile lädt die Matches, aus denen sie stammt.

## Für Entwickler {#for-developers}

`src/insights/cqb/`: `walk.ts` (ein Durchgang über die Zeilen in Zeitfolge, Runden getrennt gehalten, Duelle mit ihrem Zustand aufgezeichnet), `finish.ts` (die Maße und die Zählungen je Match), `model.ts` (logistische Regression per IRLS, Kalibrierung, Ridge per konjugierten Gradienten, empirisches Bayes, Fisher, Newcombe, Permutationstests), `run.ts` und `worker.ts` (der Viewer: eigener Worker, neben dem Erkenntnisdurchgang), `summary.ts` (der Sammler der Zusammenfassung vieler Matches), `factors.ts` (die Situationen der Aufschlüsselung), `shows.ts` (was die Linse liest), `synth.ts` (die Testrunden). Die Wissenseinträge stehen in `src/insights/knowledge/cqb.ts`, die Muster in `patterns-cqb.ts`. Die Ergebnisse gehen als `lens.cqb` in den Bericht.
