---
title: "Kollektives Verhalten"
parent: "Erkenntnisse"
nav_order: 3
lang: "de"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kollektives Verhalten: Mengen, Schwärme, Herden und Entscheidungen unter Druck

Spieler in einem Match verhalten sich wie Menschen überall: Sie drängen sich an Türen, folgen dem, der zuerst gegangen ist, bleiben zusammen oder ziehen sich auseinander, ziehen sich nach schweren Verlusten zurück und gehen nach einem schlechten Leben mehr Risiko ein. Die **Kennzahlen der Verhaltenslinse** messen diese Muster mit den Methoden der Menschenmengenforschung, der Physik kollektiver Bewegung, der Verhaltensökonomie und der Militärpsychologie, jede gegen ihr eigenes Nullmodell, und lesen sie über die passenden Einträge der [Wissensbasis](knowledge.md).

## Ausprobieren {#try-it}

1. Lade ein oder mehrere Matches mit Zeit, Positionen und Teams.
2. Öffne **Erkenntnisse** und starte sie.
3. Klappe **Linsen-Kennzahlen** auf: Die Verhaltensmaße stehen mit den anderen (Kollektive Ausrichtung, Routen-Herdenbildung, Spuren und Bahnen, Gedränge, Anführer und Folger, Zusammenhalt und Nachzügler, Kipppunkt, Risiko nach Verlusten, Serien, Kaufübereinstimmung, Unterdrückung), jedes mit seinen Zahlen, seinem Test und der Literatur, die es erklärt.
4. Die **Nachbesprechung** zitiert sie; **Mit KI schreiben** schickt sie mit dem Bericht.

## Die Maße {#the-measures}

Spuren werden auf einen Punkt alle 2 s neu abgetastet (die Position am Ende des Intervalls und die Geschwindigkeit darüber). Abstände werden mit dem eigenen typischen Abstand der Daten skaliert - dem Median des Abstands einer Einheit zu ihrem nächsten Teamkameraden -, damit dasselbe Maß für Infanterie, Panzer und Flugzeuge funktioniert.

| Maß | Was es misst | Nullmodell und Test | Wissen |
|---|---|---|---|
| Kollektive Ausrichtung | Polarisierung (Länge der mittleren Blickrichtung der sich bewegenden Einheiten jeder Seite) alle 2 s, Kreisen (Drehung um den Schwerpunkt), Zeitanteile, in denen polarisiert, gekreist und geschwärmt wird, nach Match-Phase; in Gefechten zwischen zwei ausgerichteten Seiten der Abschussanteil der stärker ausgerichteten Seite | Die eigene Spur jeder Einheit wird innerhalb des Matches zeitlich verschoben (behält ihren Weg, bricht die Gleichzeitigkeit); Vorzeichen-Wechsel-Test über 60-s-Fenster | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Routen-Herdenbildung | Wie oft eine Einheit einen Ort auf dem Weg verlässt, den der Teamkamerad davor genommen hat (innerhalb von 30 s), für denselben Weg hinein, gegen die eigenen Ausgangsanteile des Ortes - und gegen das Kopieren eines früheren Durchgangs des Gegners | Ausgänge innerhalb von Ort und Eingang gemischt; der Effekt ist Kopieren im Team minus Kopieren beim Gegner (Manskis Reflexionsproblem: Kopieren und ein Plan, den die Seite teilt, sehen gleich aus) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Spuren und Bahnen | Seitliche Trennung der beiden Richtungen an Orten mit Gegenverkehr; Anteil der Bewegung auf den meistbefahrenen 10 % des Bodens, deren Gini und die Überlappung des meistbefahrenen Bodens der Matches | Richtungen zwischen ganzen Besuchen gemischt; zwei um einen halben Ort versetzte Raster, jedes getestet, Bonferroni | Helbing et al. 1997, 2005 |
| Gedränge | Geschwindigkeit (relativ zum eigenen Tempo der Einheit) und Fluss nach der Anzahl der Nachbarn innerhalb des doppelten typischen Abstands, der Kapazitätsabfall in der dichtesten Klasse, auf dem meistbefahrenen Boden; Todesfälle pro Stunde in Mengen; Schüsse pro Minute von nahen Teamkameraden (soziales Faulenzen) | Die eigene Geschwindigkeit-Dichte-Korrelation jeder Einheit, Vorzeichen-Wechsel über Einheiten, minimaler Effekt ρ über ±0,05; exakte Raten-Tests | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Anführer und Folger | Für Teamkameraden, die gemeinsam reisen, die Zeitverzögerung (bis 8 s), bei der die Blickrichtung des einen die des anderen am besten vorhersagt; Anführer-Graph, Transitivität der Dreiergruppen, Todes- und Abschussraten der Anführer | Paare mit einer zeitlich verschobenen Spur geben die 95-%-Schwelle; Binomialtest gegen 5 % | Nagy et al. 2010, Couzin et al. 2005 |
| Zusammenhalt und Nachzügler | Zeit jenseits des Dreifachen des typischen Abstands der Seite zum nächsten Teamkameraden; Todesrate dort gegenüber der Gruppe; der Abstand einer Seite gegenüber ihrem Anteil an den Abschüssen eines Gefechts | Exakter bedingter Test zweier Poisson-Raten | Shils und Janowitz 1948, Siebold 2007 |
| Kipppunkt | Annäherungsgeschwindigkeit an den Gegner (im eigenen Tempo der Seite) nach dem Anteil der Seite, der in der letzten Minute verloren ging; das niedrigste Verlustniveau, bei dem Seiten sich zurückziehen | Einseitiger Cluster-Bootstrap gegen einen Rückzug von einem Zehntel des Tempos (Verluste entstehen dort, wo Seiten aufeinandertreffen, und Seiten, die sich treffen, hören auf, sich zu nähern), Bonferroni über die Niveaus | Dupuy 1987, Rowland 2006 |
| Risiko nach Verlusten | Anteil des nächsten Lebens, den man vor der eigenen Seite in Richtung Gegner verbringt, über dem eigenen Anteil und dem anderer zurückkehrender Einheiten zu dieser Zeit: nach einem verlorenen Leben ohne Abschuss gegenüber einem mit Abschuss; früher Tod nach frühem Tod (Kipp-Effekt) | Die Leben jeder Einheit werden gemischt (das erste Leben bleibt), damit die Verzerrung durch endliche Folgen im Nullmodell steckt | Kahneman und Tversky 1979, Thaler und Johnson 1990 |
| Serien | P(Abschuss nach k Abschüssen) − P(Abschuss nach k Toden), k = 1..3 | Die Folge jedes Spielers wird 1.000-mal gemischt: Die Verzerrung, die Miller und Sanjurjo gezeigt haben, wird abgezogen; Bonferroni über k | Gilovich et al. 1985, Miller und Sanjurjo 2018 |
| Kaufübereinstimmung | Fleiss' κ der Ausrüstungsstufen (Eco, Kraft, voll; Terzile außerhalb von Counter-Strike) innerhalb der Runde einer Seite | Die Spieler-Runden der Seite werden über ihre Runden gemischt | Fleiss 1971 |
| Unterdrückung | Geschwindigkeit in den 4 s nach nicht tödlichem Schaden gegenüber den 4 s davor, und Schüsse in den 10 s danach gegenüber davor, bei Treffern und bei den ruhigen Momenten derselben Einheit | Vorzeichen-Wechsel über Einheiten, minimale Effekte 0,05 des Tempos und ein Schuss pro Minute | Rowland 2006 |

Jeder p-Wert des Berichts geht durch die Benjamini-Hochberg-Falschentdeckungsrate (`q`). Ein Maß wird weggelassen, wenn die Daten es nicht tragen können: Runden und Ausrüstungswerte braucht die Kaufübereinstimmung, Schadensereignisse die Unterdrückung, Abschüsse und Tode, die Einheiten gutgeschrieben werden, die Serien und das Risiko.

## In der Massenanalyse {#in-the-mass-analysis}

Jede Match-Zusammenfassung (`<match>.summary.json`, siehe [Massenanalyse](mass-analysis.md)) trägt dieselben Maße für dieses Match in ihrem Abschnitt `behaviour`, so dass Tausende Matches verglichen werden können, ohne ihre Zeilen erneut zu lesen.

## Wie gut es funktioniert {#how-well-it-works}

Bei simulierten Schlachten mit jedem eingebauten Effekt und denselben Welten ohne ihn (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): Jedes Maß findet seinen eingepflanzten Effekt, und die Nullwelten bleiben unter der Falschentdeckungsschwelle. Das Risiko nach Verlusten hat die geringste Trennschärfe; die Routen-Herdenbildung kann Kopieren nicht von einem gemeinsamen Plan unterscheiden (eine Seite, die ein gemeinsames Ziel hat, gilt nach diesem Maß als „Herde“).

## Für Entwickler {#for-developers}

- `src/insights/behaviour/acc.ts` - der Akkumulator (neu abgetastete Spuren, Ereignisse, Runden) und `finish`; `motion.ts` und `choice.ts` die Maße;
  `bstats.ts` Permutations-, Bootstrap- und Kappa-Hilfen; `shows.ts` die Muster und Sätze, die die Linse liest (`lens.<measure>`).
- `feed.ts` füttert sie aus den Chunks des Erkenntnis-Workers; `summaryTap.ts` aus einer Match-Zusammenfassung, während sie die Tabelle streamt.
- Wissen: `src/insights/knowledge/behaviour.ts` (Einträge),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (Literaturangaben, jede gegen ihren Crossref- oder Open-Library-Eintrag geprüft).
- Beschriftungen: `lens.metric.<measure>` in `locales/*/lens.json`.
