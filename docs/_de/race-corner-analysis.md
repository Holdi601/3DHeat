---
title: "Analyse Kurve für Kurve"
parent: "Rennanalyse"
nav_order: 55
lang: "de"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analyse Kurve für Kurve

Zwei Runden derselben Strecke werden Kurve für Kurve verglichen. Für jede Kurve sagt der Viewer, wer schneller war, wie viel Zeit es wert war und warum – zu früh gebremst, zu spät aufs Gas gekommen, eine breitere Linie genommen –, damit du weißt, was du zuerst üben solltest.

![Ein Befund, geöffnet in Wo Zeit zu holen ist, neben der Tabelle Kurve für Kurve](../assets/img/en/race-corner-finding.webp)

Ein Beispiel: In Kurve 3 bremst Fahrer A 20 m früher als Fahrer B und verliert dabei 0,15 s, ist aber früher auf dem Gas und gewinnt auf dem Weg hinaus 0,15 s. Netto 0,00 s: Die Kurve ist gleich, und niemand wird gesagt, später zu bremsen.

## Was du siehst {#what-you-see}

### Wo Zeit zu holen ist {#where-to-improve}

Der Seitenleistenabschnitt für die fokussierte Runde („Lade mindestens zwei Runden einer Strecke.“, bis dahin).

**Der Kopf:** „<Runde> <Zeit> gegen <Referenz> <Zeit>“ und der Rundenzeitabstand – oder, für die Referenz, „gegen die in jeder Kurve jeweils schnellste andere Runde (…)“ und die Gesamtsumme, die sie verlor. Daneben der Verlust, aufgeteilt in *Fahren* und *Auto / Umstände*.

**Die Balkenanzeige:** die verlorene Zeit nach Ursachengruppe (Bremsen, Einfahrt, Ausgang, Gerade, Auto, Umstand) in den Ursachenfarben, mit einer Legende.

**Die Befunde** in drei Listen:

1. Fehler des Fahrers, die teuersten zuerst, höchstens **12** – oder „Nirgends sticht eine Stelle heraus, an der eine andere Fahrweise Zeit gewinnen würde.“
2. **Zeigen, was Auto oder Umstände gekostet haben (X s)** – Verluste durch Auto und Umstände, höchstens 8 (standardmäßig an).
3. **Wo <Runde> schneller ist oder auf anderem Weg gleich (N)** – Gewinne und gleiche Kurven, höchstens 10 (standardmäßig an).

Jeder Befund zeigt seinen Rang, seinen Titel (die Kurve und was passierte, mit den Kosten bei einem Verlust), die Urteilszeile, die Kosten (Gewinne mit einem Minus) mit einem Balken und einen Chip: *Bremsen*, *Einfahrt*, *Ausgang*, *Gerade* (Fehler des Fahrers, mit „· Auto X“, wenn das Auto 0,02 s oder mehr erklärt), *Auto*, *Umstand*, *schneller*, *gleich*. **Klick einen an**, um die Autos 40 m davor auszurichten, ihn zu umrahmen und abzuspielen und seine Messungen zu öffnen:

- **Bremsen:** wo jeder gebremst (oder gelupft) hat und von welcher Geschwindigkeit, und wie viele Meter früher oder später (ab 5 m);
- **Langsamste Stelle:** das Geschwindigkeitsminimum jeder Runde und wo es lag;
- **Vollgas:** wo jeder vom Gas ging, und wie viel früher oder später;
- **Linie:** Unterschied beim Einlenken, engste Radien, wie weit innen oder außen, und die Form der Linie jeder Runde und ihr Scheitelpunkt;
- **Gerade bis zur nächsten Kurve:** ihre Länge, beide Geschwindigkeiten, wo beide voll auf dem Gas waren, was sie verloren oder gewonnen hat und wodurch – die Anfangsgeschwindigkeit, der stärkere Zug des anderen, ein Lupfer, abgebaute Geschwindigkeit, wie gefahren wurde (Teile ab 0,02 s);
- **Das Auto:** wie viel des Verlusts das Auto ist, und wodurch (Zug, Grip, Bremsen; wenn 0,02 s oder mehr);

dann der Tipp, **Die Autos:** (bei verschiedenen Autos, siehe [Autoprofile](race-car-profiles.md#what-the-cars-decide-in-a-corner)), und der Linienrat.

### Kurve für Kurve {#corner-by-corner}

Eine Tabelle (bei zwei oder mehr Runden), eine Zeile pro Abschnitt, mit der Klasse der fokussierten Runde, wenn es mehrere Klassen gibt:

| Spalte | Zeigt |
|---|---|
| Kurve | `T3`, `T11-T12` |
| Schnellste | die Runde, die dort am schnellsten war (ihre eigene Zeit vom Anfang bis zum Ende des Abschnitts) |
| Vorsprung | ihr Vorsprung vor der Zweitschnellsten, s |
| Linie | die Form der Linie der schnellsten Runde und ihr Scheitelpunkt („V · spät“, „U/V · Mitte“); darüber schweben für ihre engsten, Einfahrts- und Ausfahrtsradien; „beides“ für einen gemischten Komplex |
| (die fokussierte Runde) | wie weit sie hinter der Schnellsten lag, oder ✓, wenn sie die Schnellste war |

Ein Klick auf eine Zeile öffnet dort den Befund der fokussierten Runde (oder richtet die Autos 40 m vor dem Abschnitt aus). Unter der Tabelle, wenn jede Kurve eine Zeit hat: „Die Schnellste durch jede Kurve, zusammengesetzt: <Zeit> (± auf die Referenz / auf die Beste ihrer Klasse X)“ – die besten Abschnitte plus die schnellste Fahrt bis zur ersten Kurve, wenn das ein eigener Abschnitt ist.

## So wird es berechnet {#how-it-is-worked-out}

Die leitende Regel: **eine Kurve wird als Ganzes beurteilt**, von dem Bremspunkt für sie bis zum Bremspunkt für die nächste. Eine Runde, die früher bremst, um das Auto schneller einzudrehen und früher auf die Leistung zu bringen, bekommt den Ausgang angerechnet, den sie erkauft hat; ihr wird nicht gesagt, später zu bremsen.

## Eine Distanzachse {#one-distance-axis}

Runden werden nach Distanz verglichen, nicht nach Zeit – eine Sekunde zurück, sind zwei Runden an verschiedenen Kurven. Auch nicht nach dem eigenen Kilometerzähler jeder Runde (eine engere Linie fährt weniger Meter). Die gefahrene Linie der **Referenz**-Runde ist die Achse:

- Die Proben jeder anderen Runde werden auf den Referenzweg **projiziert**: Jede Probe bekommt `s`, wie weit sie entlang der Referenz liegt, und `d`, wie weit links (positiv) oder rechts. Die Suche läuft vorwärts ab dem vorigen Treffer (8 Wegabschnitte zurück bis 40 voraus), sodass eine Runde, die sich selbst kreuzt oder unterquert, nie auf die andere Kreuzung springt. Die erste Probe wird im ersten Viertel des Weges gesucht (auf einem Rundkurs fallen Start und Ziel zusammen); liegt nichts innerhalb von 30 m, wird der nächste Punkt irgendwo genommen, der nicht hinter dem letzten Treffer liegt (nach einem Dreher oder einem Ausbrechen). `s` nimmt nie ab: Eine Probe, die hinter der vorigen projiziert, wird gehalten.
- Jeder Kanal wird auf ein gemeinsames Gitter **umgerechnet**, **alle 2 m**, linear; schrittweise Kanäle (Gang, Flaggen) nach der nächsten Probe. Außerhalb des eigenen Bereichs einer Runde sind die Werte leer.
- Der erste und der letzte Punkt einer Runde projizieren etwas innerhalb der Enden der Referenz, daher wird jede Runde **bis zu 15 m** über ihre Enden hinaus mit der Geschwindigkeit fortgeschrieben, die sie hatte (die Zeit wächst mit Distanz geteilt durch Geschwindigkeit, der Rest bleibt), sodass ihr Delta auf der Linie ihr Rundenzeitunterschied ist.
- `delta` = die Zeit der Runde an jedem Gitterpunkt minus die der Referenz: der Abstand. `lateral` = `d` auf dem Gitter.

Die Zeit, die eine Runde zwischen zwei Gitterpunkten mehr brauchte als eine andere, ist die Differenz ihrer Deltas: `rel(s)`. Alles Weitere baut darauf auf.

## Kurven {#corners}

Auf der **Referenz** gefunden (`findCorners`), mit ihrer Geschwindigkeit geglättet über ±6 m und ihrer Krümmung (Richtungsänderung über ±5 Proben, geglättet über ±10 m):

1. **Geschwindigkeitsminima mit Prominenz.** Ein Punkt, der innerhalb von ±40 m der niedrigste ist, dessen Abfall von der höchsten Geschwindigkeit auf jeder Seite (vor einem niedrigeren Minimum) mindestens `max(2,5 m/s, 6 % der Geschwindigkeit)` beträgt.
2. **Knicke.** Ein lokaler Höchstwert der Krümmung enger als **300 m** Radius, ohne ein Geschwindigkeitsminimum innerhalb von 80 m: Ein Vollgas-Knick ist trotzdem eine Kurve, die man fahren muss.
3. **Phasen.** Von jedem Scheitelpunkt zurück, solange die Referenz bremst (> 0,1) oder nicht voll auf dem Gas steht (< 0,95): der Eingang; vorwärts, solange nicht voll auf dem Gas: der Ausgang. Ein Knick, der voll genommen wird, bekommt ±30 m. Überlappende Kurven bleiben getrennt, werden aber so angelegt, dass sie die Runde lückenlos aufteilen.
4. Nummeriert T1, T2 … in der Reihenfolge der Runde; **links oder rechts** nach dem Vorzeichen der Krümmung und ob die Welt gespiegelt ist (unbekannt gilt als gespiegelt).

**Das Kurvenfenster** (wo die Referenz abbiegt): vom engsten Punkt innerhalb von ±40 m um den Scheitelpunkt hinaus, solange die Krümmung über einem Sechstel ihres Höchstwerts bleibt, plus 10 m auf jeder Seite. Seine Seite gibt das Vorzeichen von „innen“ an.

## Abschnitte: vom Bremspunkt zum Bremspunkt {#segments-braking-zone-to-braking-zone}

Jede Kurve besitzt die Strecke bis zur Hälfte der Scheitelpunkte auf beiden Seiten. Darin:

- **Der langsamste Punkt jeder Runde** ist ein echter Einbruch ihrer Geschwindigkeit – nichts Langsameres innerhalb von 6 m (3 Gitterpunkte) auf beiden Seiten, wobei über die Enden des Abschnitts hinaus geschaut wird, damit der Kurvenausgang der vorigen Kurve, der noch in sie hineinbeschleunigt, nie für ihn gehalten wird – gesucht von 15 m vor dem Kurvenfenster bis 10 m nach ihm. Eine Runde, die dort nie verlangsamte, wird auf den Scheitelpunkt gesetzt.
- **Wo eine Runde anfing, für sie zu verlangsamen** (`entryOf`): rückwärts vom langsamsten Punkt durch das Bremsen oder den Lupfer, über kurze Vollgas-Unterbrechungen hinweg, bis sie den Fuß unten hatte (Gas ≥ 0,95, Bremse ≤ 0,1) für **10 m**; ein Gas, das in den letzten **30 m** vor dem langsamsten Punkt wieder aufgenommen wurde, gehört noch zur Kurve; ging es die ganze Strecke voll, der langsamste Punkt selbst. Eine Runde ohne Gaskanal oder die seit der Kurve davor nie den Fuß unten hatte, beginnt an ihrem schnellsten Punkt dazwischen.
- **Der Abschnitt beginnt** bei der ersten aller Runden, die anfängt, für ihn zu verlangsamen (4 m früher), und läuft bis zum Beginn des nächsten, sodass das Bremsen jeder Runde darin liegt und die Abschnitte die Runde lückenlos aufteilen.

**Komplexe.** Aufeinanderfolgende Kurven, zwischen denen die Referenz nie voll fährt – weniger als **40 m** Vollgas –, bilden einen Abschnitt „T11-T12“, der als einer gefahren wird; ein Komplex hat höchstens **drei** Bögen (ein kurvenreicher Abschnitt, der nie voll gefahren wird, beginnt einen neuen). Ein Komplex, der in beide Richtungen kurvt, ist *gemischt*: Für ihn wird keine einzelne Linienform gemessen.

**Auf einem Rundkurs** (die Referenz endet innerhalb von 50 m von ihrem Start) läuft die Gerade des letzten Abschnitts über die Ziellinie bis zum ersten Bremspunkt: Eine fliegende Runde, die von der Linie aus läuft, zählt zur letzten Kurve. Eine Runde, die aus dem Stand oder aus einem Rennstart begann (siehe [Der Start](#the-start)), hält diesen Lauf getrennt.

### Wohin eine Kurve führt {#what-a-corner-leads-onto}

Auf der Referenz gemessen: Meter auf Vollgas nach der Kurve (von ihrem Vollgas bis zum Ende des Abschnitts plus der Lauf über die Ziellinie) und davor (das „danach“ des vorigen Abschnitts oder ab dem Start).

| Typ | Regel |
|---|---|
| **zwischen zwei Geraden** (`both`) | 200 m oder mehr davor **und** 120 m oder mehr danach |
| **auf eine Gerade** | 200 m oder mehr danach, oder 120 m oder mehr danach und mindestens so viel wie davor |
| **nach einer Geraden** | 200 m oder mehr davor |
| **Verbindung** | alles andere |

## Was jede Runde in einer Kurve tat {#what-each-lap-did-in-a-corner}

`cornerMetrics`, pro Runde und Abschnitt, auf dem Gitter (Schritt 2 m). Pedale: Bremsen zählt über 0,1, Vollgas ist 0,95 und mehr.

| Maß | Regel |
|---|---|
| **Bremspunkt** | die erste Bremsung, unter der das Gas wegging (unter 0,5), oder die **15 m** dauerte – ein Antippen des linken Fußes bei eingeschalteter Leistung ist nicht der Beginn des Bremsens; mit nur Antippern das erste Antippen |
| **gelupft** | ohne Bremsen: der erste Punkt, an dem das Gas unter 0,8 fiel |
| (keine Pedale) | der Punkt, an dem die Runde zu verlangsamen begann (oben) |
| **Bremsfreigabe** | die letzte Bremsung bis 30 m nach dem langsamsten Punkt |
| **Geschwindigkeit am Bremspunkt**, **Bremsmeter** | bis zum langsamsten Punkt |
| **Bremsspitze**, **Verzögerungsspitze** | über die Bremszone (Beschleunigungen über 45 m/s² werden ignoriert) |
| **Trail-Braking** | Meter mit Bremse > 0,05 und |Lenkung| > 0,1 |
| **Radschlupf beim Blockieren** | der stärkste negative Schlupfwert der Räder in der Zone (wenn die Runde Schlupfdaten hat) |
| **langsamster Punkt**, **Mindestgeschwindigkeit** | wie oben |
| **Gas an** | nach der Freigabe (oder dem langsamsten Punkt) das erste Gas > 0,15 ohne Bremse |
| **Vollgas** | der erste Punkt danach, der 10 m lang bei ≥ 0,95 hielt |
| **Rollen** | Meter von der Freigabe bis zum Gas an, mit Bremse und Gas beide unter 0,05 |
| **Gaseinbrüche** | Mal, dass das Gas mehr als 0,25 unter sein laufendes Hoch fiel, zwischen Gas an und Vollgas |
| **Spitzen-Querbeschleunigung** | die größte Querbeschleunigung von 20 m vor der Freigabe bis zum späteren von Vollgas und 20 m nach dem langsamsten Punkt |
| **Gang am Scheitelpunkt** | am langsamsten Punkt |
| **Schlupf beim Durchdrehen** | der größte Schlupf der angetriebenen Räder zwischen Gas an und Vollgas |
| **Balance** | Schräglaufwinkel vorn minus hinten durch die Mitte (+ Untersteuern) |
| **Gerade auf Vollgas** | der Anteil des Abschnitts nach Vollgas (und dem Lauf über die Ziellinie) bei ≥ 0,95; der längste Lupfer darauf |
| **abgebaute Geschwindigkeit** | der größte Geschwindigkeitsverlust von einem Hoch mit Gas ≥ 0,9, ohne Bremse, auf dem Boden |
| **Driften beim Einlenken** | der größte Driftwinkel vom Bremspunkt bis 5 m nach dem langsamsten Punkt, auf dem Boden |
| **Handbremse** | wo sie anzog (> 0,2), bis 10 m nach dem langsamsten Punkt |
| **Luft** | Sekunden in der Luft über den Abschnitt und ihr längster Flug |

## Mit wem jede Runde verglichen wird {#who-each-lap-is-compared-with}

- Eine Runde wird mit der **schnellsten vollständigen Runde ihrer eigenen Leistungsklasse** verglichen (der Referenz, in der Klasse der Referenz).
- Diese Klassenbeste Runde selbst (und die Referenz) wird Abschnitt für Abschnitt mit **der anderen Runde ihrer Klasse** verglichen, die dort am schnellsten war – oder mit jeder Runde, wenn sie allein in ihrer Klasse ist.

Die Zeitkarte, die Abstände in der Rundenliste, die Ereignisse der Autokontrolle und die Tabelle Kurve für Kurve folgen demselben Vergleich.

## Die Zeitbilanz einer Kurve {#the-time-account-of-a-corner}

`compareCorner`, für eine Runde gegen die andere über einen Abschnitt:

- **netto** = `rel(Ende) - rel(Anfang)` (plus der Lauf über die Ziellinie bei einer fliegenden Runde): das Urteil. Näher als **0,03 s** ist **gleich**.
- **Die Aufteilung** – wo innerhalb der Kurve die führende Runde abbog: auf dem Stück vom ersten Bremspunkt oder langsamsten Punkt einer der beiden Runden bis zum späteren ihres Vollgas- oder langsamsten Punktes, die größte Schwankung, die die Runde dann wieder abgab oder zurückgewann, wenn diese Schwankung über **0,04 s** liegt; sonst der spätere der beiden langsamsten Punkte.
- **Bis zum Scheitelpunkt** = `rel(Aufteilung) - rel(Anfang)`; **danach** = netto minus das. Sind beide mindestens 0,04 s und haben entgegengesetzte Vorzeichen, hat die Runde das eine gegen das andere **getradet**.
- **Danach** teilt sich erneut, wo beide Runden voll auf dem Gas sind: der **Kurvenausgang** (von der Aufteilung bis zum späteren Vollgas) und die **Gerade** (von dort bis zum Ende).
- **Die Gerade** teilt sich in drei Teile:
  - *Ausgangsgeschwindigkeit* (`byExit`) – gemessen, nicht modelliert: Das langsamere Auto holt die Anfangsgeschwindigkeit des schnelleren ein ein Stück die Gerade hinunter, und von dort ist seine eigene Kurve das, was es ab dieser Geschwindigkeit getan hätte, mit seiner eigenen Übersetzung, seinem Luftwiderstand und seiner Steigung darin. Auf jenen Punkt zurückgeschoben (und mit seiner Endgeschwindigkeit für die Meter weitergelaufen, die es gewinnt), ist es seine Zeit ab dem schnelleren Start; die Differenz ist die Kosten der Ausgangsgeschwindigkeit. Erreicht das langsamere Auto diese Geschwindigkeit nie (oder nur in den letzten 2 Proben), wird seine eigene Beschleunigung auf dem Abschnitt als Leistung zurückgerechnet (`a·v` konstant gehalten), nie stärker als seine Hüllkurve bei dieser Geschwindigkeit zeigt (das Doppelte der gemessenen Beschleunigung ohne Hüllkurve).
  - *der Zug der Autos* (`byPower`) – nur bei verschiedenen Autos: beide Autos von derselben Geschwindigkeit über dieselben Meter, auf Vollgas, mit Integration der Beschleunigung auf Vollgas, die jedes bei jeder Geschwindigkeit gezeigt hat.
  - *wie gefahren wurde* (`driven`) – der Rest: ein Lupfer, bei Vollgas abgebaute Geschwindigkeit.

  Die Ausgangsgeschwindigkeit erklärt nie mehr als den Geraden-Verlust (und nie mit dem umgekehrten Vorzeichen), es sei denn, ein Lupfer oder abgebaute Geschwindigkeit hat etwas zurückgenommen. Eine Runde, die auf der Geraden **gelupft** hat, wenn ihr Anteil auf Vollgas unter 0,9 und unter dem Anteil des anderen minus 0,05 liegt. Abgebaute Geschwindigkeit zählt, wenn sich die beiden um mehr als 1 m/s unterscheiden. Eine Meinungsverschiedenheit unter 0,02 s im Vorzeichen wird auf 0 gesetzt.

Das Netto jedes Abschnitts ergibt zusammen den Rundenzeitunterschied, und das Bis-zum-Scheitelpunkt und Danach jeder Kurve ergibt ihr Netto (die Tests prüfen beides).

### Der Anteil des Autos {#the-cars-share}

Nur wenn die Runden in **verschiedenen Autos** sind und die Runde Zeit verlor (`carShare`):

- **Zug**: der Zug der Autos auf der Geraden (oben), bis zum Verlust;
- **Grip**: wenn die Runde am Limit ihres Autos war (Querbeschleunigung in der Mitte mindestens **90 %** dessen, was ihr Auto bei dieser Geschwindigkeit hält) und das andere Auto mehr als **5 %** mehr hält: von der niedrigeren Mindestgeschwindigkeit, die nicht durch einen engeren Radius erklärt wird, der Anteil `½ ln(Grip_anderes / Grip_mein) / ln(v_anderes / v_meine)` des verbleibenden Verlusts;
- **Bremsen**: wenn die Runde gebremst (nicht gelupft) hat, das andere Auto über **5 %** stärker bremst, und die *durchschnittliche* Verzögerung der Runde über die Zone mindestens **80 %** dessen betrug, was ihr Auto leisten kann: von `u` auf `v` bei `a1` gegen `a2`, am selben Punkt endend, `(1/a1 - 1/a2)(u - v)² / 2u`, bis zum Rest.

Die Kosten des Autos sind die Summe, höchstens der Verlust.

## Das Urteil und der Befund {#the-verdict-and-the-finding}

`cornerFinding` schreibt höchstens einen Befund pro Runde und Kurve, in dieser Reihenfolge geprüft:

| Fall | Befund | Ergebnis |
|---|---|---|
| Netto innerhalb von ±0,03 s, ein Tausch, die kleinere Seite ≥ **0,1 s** | **gleich, auf zwei Wegen** – wer innen langsam und außen schnell war, wer den anderen Weg; mit einer Geraden danach (auf eine Gerade oder zwischen zwei) ist der Weg „innen langsam, außen schnell“ der, auf dem man aufbauen sollte: sein frühes Gas behalten, den Eingang zurückgewinnen, indem man härter bremst, nicht später | gleich |
| Netto innerhalb von ±0,03 s, sonst | nichts gesagt | - |
| gewonnen, ein Tausch, bis zum Scheitelpunkt verloren | **langsam rein, schnell raus hat sich gelohnt**: behalten, hier ist der Ausgang mehr wert | Gewinn |
| gewonnen, ein Tausch, bis zum Scheitelpunkt gewonnen | **schneller bei der Einfahrt**: die Einfahrt stimmt, ein früheres Vollgas würde mehr behalten | Gewinn |
| gewonnen, und die andere Runde hat hier einen Verlust | **schneller – wegen dem, was der andere tat**, seine Ursache und sein Tipp, mit „Für die andere Runde: …“ | Gewinn |
| sonst gewonnen | **schneller bei der Einfahrt / beim Ausgang**, nach der Hälfte, die mehr gewann (später gebremst, mehr Tempo durch die Mitte; oder früher abgeflacht, stärkerer Zug) | Gewinn |
| verloren, und ein **Treffer oder Unfall** kostete mindestens `max(0,05 s, 40 % des Verlusts)` | der Aufprall ist die Geschichte der Kurve, vor den Autos | Verlust |
| verloren, und der **Anteil des Autos** ist 60 % oder mehr | **das Auto**: sein Zug auf der Geraden, sein Grip durch die Mitte oder seine Bremsen – der größte Teil; mit dem Anteil des Fahrers (≥ 0,03 s) als „Der andere X s: …“ | Verlust |
| verloren, und ein ungeteilter **Fehler der Autokontrolle** kostete mindestens `max(0,05 s, 40 %)` | dieser Fehler (siehe unten), mit wie sich die Zeit darum bewegte | Verlust |
| verloren, und ein **längerer Flug** kostete mindestens `max(0,05 s, 40 %)` | der Flug | Verlust |
| verloren, ein Tausch, bis zum Scheitelpunkt gewonnen | **zu schnell rein, langsam raus**: die Ursache des Ausgangs; etwas Einfahrt geben, um früher eingedreht zu sein und früher auf Vollgas, mit den Brems- und Vollgaspunkten der anderen Runde. Seine Wurzel (`cause`, was die [Statistiken](race-course-statistics.md) zählen): später gebremst, wenn sie ein paar Meter mehr später bremste als die andere; sonst die Ursache des Ausgangs | Verlust |
| verloren, ein Tausch, bis zum Scheitelpunkt verloren | **bei der Einfahrt mehr hergegeben, als der Ausgang zurückgewann**: die Ursache der Einfahrt, die zugleich ihre Wurzel ist (`cause`); den Ausgang behalten, bei der Einfahrt weniger verlieren | Verlust |
| verloren, auf der Geraden gelupft, und der gefahrene Teil mehr als die Hälfte des Verlusts | **auf der Geraden nicht voll auf dem Gas**: Anteil auf Vollgas gegen den des anderen, wo und wie lange der Lupfer war | Verlust |
| verloren, der Zug der Autos über 60 % des Verlusts und die Gerade über die Hälfte | **der Zug des Autos auf der Geraden** (mit dem Zug beider Autos bei 160 km/h) | Verlust |
| sonst verloren | die Ursache der Hälfte, die mehr verlor (bis zum Scheitelpunkt ≥ danach: die der Einfahrt; sonst die des Ausgangs). Nur langsamer heraus, weil langsamer durch die Mitte (um mehr als 1 m/s): stattdessen die Ursache der Mitte | Verlust |

Ein Befund zu einem Verlust kann außerdem mit **Außerdem:** enden – abgebaute Geschwindigkeit bei Vollgas oder ein Lupfer auf der Geraden –, wenn der gefahrene Teil der Geraden mehr als 0,04 s kostete und das nicht schon die Ursache war.

Befunde werden zuerst nach Verlusten sortiert, der teuerste zuerst; danach Gewinne und gleiche Kurven.

### Ursachen bei der Einfahrt {#causes-on-the-way-in}

`entryCause`, der erste, der zutrifft (Unterschiede der Mindestgeschwindigkeit in m/s; „5 m“ ist die Schwelle, ab der ein früherer oder späterer Punkt zählt):

| Nr. | Ursache (Fehler) | Regel |
|---|---|---|
| 1 | ein Treffer oder Unfall bei der Einfahrt | ein ungeteilter Aufprall, der bis 10 m nach dem langsamsten Punkt beginnt |
| 2 | **fast zum Stehen gekommen** (Zwischenfall) | langsamste Geschwindigkeit unter **60 %** dessen, was der Grip dieses Autos dort zulässt, wo die andere durchfuhr (`v_andere · √(Grip_mein / Grip_andere)`, wenn die andere mehr Grip hat, sonst die Geschwindigkeit der anderen), die andere Runde über 8 m/s – ein Dreher, Kontakt oder eine verfehlte Kurve |
| 3 | ein Fehler der Autokontrolle bei der Einfahrt | ein ungeteiltes Blockieren, Schieben, Dreher oder Rutschen nicht auf dem Gas, das bis 10 m nach dem langsamsten Punkt beginnt, Kosten ≥ 0,02 s |
| 4 | ein längerer Flug vor dem langsamsten Punkt | siehe [Rallye](#rally-rotation-and-flights) |
| 5 | **gelupft**, wo die andere voll blieb oder 5 m oder mehr später lupfte | diese Runde lupfte allein |
| 6 | **gebremst, wo die andere nur lupfte** oder voll blieb | und war durch die Mitte mehr als 0,5 m/s langsamer |
| 7 | **zaghaft gebremst** | sie bremste (nicht gelupft), hatte Platz, härter zu bremsen – mit Reifendaten, ihr Blockierschlupf unter **60 %** des Schlupfs, bei dem die Bremsen dieses Autos am besten wirken; ohne sie eine Verzögerungsspitze unter **85 %** dessen, was sie bei dieser Geschwindigkeit zeigt – das Pedal unter 0,95, und die Verzögerungsspitze der anderen Runde mehr als **15 %** höher |
| 8 | **zu früh gebremst** – oder **die Bremsen des Autos** | mehr als 5 m vor der anderen gebremst. In einem anderen Auto, dessen Bremsen über 5 % stärker sind, und mit nicht mehr als 10 m Reserve gegenüber der Strecke, die dieses Auto bei seiner eigenen Verzögerung braucht: die Bremsen des Autos. Sonst zu früh gebremst, mit „Später bremsen – etwa N m“ (in einem anderen Auto die Meter über dem, was es braucht) |
| 9 | **gerollt** | mehr als 10 m ohne beide Pedale und 5 m mehr als die andere |
| 10 | **langsamer durch die Mitte** | mehr als 0,5 m/s langsamer am langsamsten Punkt; aufgeteilt nach `v² = a·R` (unten) |
| 11 | **langsamer angekommen** | über 1 m/s langsamer am Bremspunkt, nicht zu früh gebremst: vorher entschieden – durch die Kurve davor und den Zug des Autos, oder durch einen Flug in der Kurve davor, der 0,2 s länger war. Die des Autos, wenn sich die Autos unterscheiden |
| 12 | langsamer bis zum Scheitelpunkt | sonst: die Bremse sanfter lösen und mehr Tempo in die Mitte rollen lassen |

**Langsamer durch die Mitte** (`middleSplit`): der Radius jeder Runde an ihrem langsamsten Punkt wird aus ihrem eigenen Weg gemessen (±8 m), ihre Querbeschleunigung als `v²/R`, und

`ln(v_andere / v_meine) = ½ ln(a_andere / a_meine) + ½ ln(R_andere / R_meine)`.

- Der Radius erklärt **die Hälfte oder mehr**: **eine zu enge Linie** – „mehr von der Straße nutzen“, mit beiden Radien und dem Anteil.
- Am Limit des Autos (rutschend über 10° Driftwinkel auf Asphalt / 20° auf losem Untergrund, oder Querbeschleunigung mindestens 90 % dessen, was es bei dieser Geschwindigkeit hält) und das andere Auto hat über 5 % mehr Grip: **der Grip des Autos**; stattdessen den Ausgang schützen.
- Durch die Kurve rutschend (Drift über 10° / 20°), und die andere Runde nicht (ihr Driftwinkel bei der Einfahrt mindestens 4° geringer): **seitlich** – über dem Grip, nicht unter ihm; etwas langsamer ankommen. Dies wird dem Auto zugeschrieben, wenn dieses Auto sein Heck mindestens einmal pro Runde öfter fängt als die andere.
- In einem anderen Auto, das unter **96 %** des Grips des anderen hält, und die Runde hielt sich innerhalb von 1 m/s von `v_andere · √(Grip_mein / Grip_andere)`: **der Grip des Autos** – „später bremsen wird das nicht schließen“.
- Sonst **Grip übrig**: Querbeschleunigung gegen die der anderen bei ähnlichem Radius und was dieses Auto hält; mehr Tempo bis zum Scheitelpunkt mitnehmen. Lässt das Heck dieses Autos los, bevor sein Grip ausgeschöpft ist (seine Rutsche beginnt unter 85 % seines Grips, und die Runde war bei 80 % davon), den Rest in kleinen Schritten suchen.

### Ursachen beim Herausfahren {#causes-on-the-way-out}

`exitCause`, der erste, der zutrifft:

| Nr. | Ursache (Fehler) | Regel |
|---|---|---|
| 1 | ein Fehler der Autokontrolle beim Herausfahren | ungeteiltes Durchdrehen der Räder, Dreher, Rutschen oder Aufprall, das bei oder nach 10 m vor dem langsamsten Punkt endet |
| 2 | **abgebaute Geschwindigkeit** | mehr als 1 m/s mehr Geschwindigkeit bei Vollgas verloren als die andere; über **7 m/s (25 km/h)** „eher Kontakt oder Dreher als Rutschen“ |
| 3 | **das Auto falsch gedreht** (loser Untergrund) | siehe [Rallye](#rally-rotation-and-flights) |
| 4 | **später aufs Gas** | Gas an mehr als 5 m später, auch von jedem Runden-eigenen langsamsten Punkt aus gezählt (eine Runde mit späterem langsamsten Punkt wird nicht für späteres Gas getadelt) |
| 5 | **zögerlich am Gas** | mehr Gaseinbrüche als die andere |
| 6 | **ging zu weit außen und wartete** | mehr als 1,5 m außen gegenüber der anderen, wo beide rollten, und Vollgas mehr als 5 m später von ihrem eigenen langsamsten Punkt aus |
| 7 | **Vollgas später** | Vollgas mehr als 5 m später, auch von ihrem eigenen langsamsten Punkt aus; mit der Beschleunigung des Autos dort |
| 8 | **der Antrieb des Autos** | in einem anderen Auto, das bei dieser Geschwindigkeit weniger als 95 % des anderen zieht, und der Zug einen Teil der Geraden erklärte |
| 9 | **langsamer aus der Kurve heraus** | sonst: ein späterer Scheitelpunkt, sodass das Auto früher gerade ist |

Lagen die beiden Runden am langsamsten Punkt in verschiedenen Gängen, endet der Tipp mit „Gang N am Scheitelpunkt; die andere nahm M.“

### Fehler der Autokontrolle und Aufprälle {#car-control-faults-and-impacts}

Ein Fehler aus [Ereignisse der Autokontrolle](race-control-events.md) als Ursache: Ein Blockieren ist eine *Brems*-Ursache, Durchdrehen oder ein Rutschen auf dem Gas eine *Ausgangs*-Ursache, der Rest *Einfahrt*; ein Aufprall nach dem langsamsten Punkt ist *Ausgang*, davor *Einfahrt*. Der Tipp ist der des Ereignisses selbst, danach „Es kostete etwa X s bis 40 m danach“ (oder „bis das Auto seine Geschwindigkeit wieder hatte“ bei einem Aufprall). Ein Blockieren, bei dem der Bremspunkt mehr als 5 m früher lag als bei der anderen, fügt hinzu, dass die Runde auch früh gebremst hat – mit drehenden Rädern hätte sie das nicht gebraucht.

### Rallye: Drehung und Flüge {#rally-rotation-and-flights}

Auf **losem Untergrund**, mit Driftwinkeln für beide Runden, und wenn diese Runde später (oder gar nicht) auf dem Gas ist, mehr als 5 m später:

- **Das Auto weniger eingedreht**: Die andere hatte das Auto bis zum langsamsten Punkt um **12°** oder mehr eingedreht, und mindestens **8°** mehr als diese Runde. Tipp: ein Lupfer oder ein kurzer Tritt des linken Fußes auf die Bremse beim Einlenken, mit dem Handbremspunkt der anderen Runde, wenn nur sie die Handbremse benutzte, oder der Handbremse in einer Kurve, die langsamer ist als 15 m/s (54 km/h).
- **Zu weit eingedreht**: Diese Runde hatte es um 12° oder mehr eingedreht und mindestens **12°** mehr als die andere: Es musste gerade gerichtet werden, bevor die Leistung wieder kommen konnte.

**Ein längerer Flug**: in der Luft 0,2 s oder mehr länger als die andere, und dabei mindestens 0,03 s Kosten von 10 m vor dem Absprung bis 40 m nach der Landung (oder dem Ende des Abschnitts). Vor dem langsamsten Punkt ist es eine Ursache der Einfahrt; er wird zur Geschichte der Kurve, wenn er 40 % oder mehr erklärt. Der Tipp: Am Absprung das Gas gehalten lassen, die Kuppe etwas langsamer nehmen oder mit einem Antippen der Bremse.

### Der Start {#the-start}

Vor der ersten Kurve, auf einer Sprintstrecke oder wenn eine der beiden Runden aus dem Stand begann (unter 5 m/s, wo beide zuerst auf der Achse sind) oder bei einem Rennstart (unter 60 % der Geschwindigkeit der anderen), ist der Lauf bis zum ersten Bremspunkt ein eigener Befund (Kurve 0), wenn er sich um mehr als 0,03 s unterscheidet: *Der Start*, *Der Rennstart* oder *Bis zur ersten Kurve*. Ein Verlust dort wird dem Umstand (*Umstand*) zugeschrieben, wenn eine Runde aus einem Rennstart und die andere mit Tempo begann; dem Auto, wenn die Runden in verschiedenen Autos sind; sonst dem Fahrer. Tipps: in einem anderen Auto aus dem Stand „meist das Auto“; ein stehender Start im selben Auto – mit weniger Radschlupf losfahren und im oberen Bereich des Leistungsbandes schalten; ein Rennstart – die erste Runde mit einer anderen vergleichen; ein fliegender Start – ein besserer Ausgang aus der letzten Kurve wird über die Linie mitgenommen.

## Die gefahrene Linie {#the-driven-line}

`lineMetrics`, pro Runde und Abschnitt (nicht für gemischte Komplexe), allein aus Positionen (über ±2 Proben geglättet) über das Kurvenfenster:

| Maß | Regel |
|---|---|
| Krümmung | Richtungsänderung über ±8 m des eigenen Weges der Runde |
| **engster Radius** | 1 / die Krümmungsspitze |
| **Einlenkpunkt** / **Ausfahrpunkt** | wo die Krümmung erstmals / zuletzt ein Fünftel ihrer Spitze überschreitet |
| **Mitte** | wo die Runde die Hälfte ihrer Richtungsänderung gedreht hatte |
| Radius ein / aus | Meter, gefahren über die Hälfte der Richtungsänderung, vor / nach der Mitte |
| **Form** | engster Radius geteilt durch den mittleren Radius beim Kurven: unter **0,55** ein **V**, über **0,75** ein **U**, dazwischen „U/V“ |
| **Scheitelpunkt** | Ausgangsradius geteilt durch Eingangsradius: über **1,25** spät, unter **0,8** früh, sonst Mitte |
| **Geschwindigkeitsscheitel** | der langsamste Punkt mehr als 15 m vor der Mitte: langsam rein, schnell raus; mehr als 15 m danach: bremst noch über die Mitte hinaus |

Gegen die andere Runde: wie weit innen (+) oder außen sie beim Einlenken fuhr, durch den engsten Teil und wo beide rollten (ab 1 m gesagt); wo jede einlenkte (ab 8 m gesagt).

### Welche Linie zu diesem Auto hier passt {#which-line-suits-this-car-here}

`lineFor`, aus dem, wohin die Kurve führt, und dem Charakter des Autos an dieser Kurve:

- **Leistung-zu-Grip** = die Beschleunigung des Autos auf Vollgas bei der Ausgangsgeschwindigkeit geteilt durch seinen Grip bei der Mindestgeschwindigkeit (aus seiner Hüllkurve). **Point and shoot** bei **0,45** und darüber; **Schwung** bei **0,25** und darunter.
- **Abtrieb**: Grip bei 151–252 km/h geteilt durch Grip bei 54–108 km/h von **1,15** oder mehr, für eine Kurve, die mit **144 km/h** (40 m/s) oder schneller genommen wird – dann ist es eine Schwung-Kurve, egal wie viel Leistung. Nicht auf losem Untergrund beurteilt.

| Kurventyp | Auto | Linie |
|---|---|---|
| nach einer Geraden | Point and shoot / anderes | V / U, Scheitelpunkt in der Mitte: „Die Bremszone ist der Gewinn“ |
| zwischen zwei Geraden | Schwung / anderes | U / V, später Scheitelpunkt |
| Verbindung | Schwung / anderes | U / V, Scheitelpunkt in der Mitte: „fahr sie für den Ausgang der nächsten“ |
| auf eine Gerade | Schwung (oder eine schnelle Abtriebskurve) | breites rundes U, leicht später Scheitelpunkt |
| auf eine Gerade | Point and shoot | V: gerade bremsen, spät einlenken, in einer kurzen engen Mitte drehen, früh gerade und auf Gas |
| auf eine Gerade | dazwischen | U mit spätem Scheitelpunkt: langsam rein, schnell raus |

Wo der Ausgang zählt (auf eine Gerade, zwischen zwei), fügt der Antriebsstrang einen Satz hinzu: **Frontantrieb** – auf der Bremse eindrehen, Leistung erst geben, wenn sich das Rad abrollt; **Heckantrieb** mit einem Leistung-zu-Grip von 0,35 oder mehr – gerade stellen, bevor Vollgas kommt; **Allrad** – es kann Leistung nehmen, während es noch eindreht. Auf losem Untergrund fügt jede Linie hinzu: das Auto schon bei der Einfahrt eindrehen.

Der Satz sagt dann, was gefahren wurde, und ob es passt: *zu langsamer später Scheitelpunkt bindet den Ausgang* oder *ein früher Scheitelpunkt bindet den Ausgang*, wo ein später Scheitelpunkt gewollt war und die Runde weder spät scheitelte noch früh am langsamsten war; *runder, als dieses Auto will*, wo ein V gewollt war; *eckiger, als dieses Auto will*, wo ein U gewollt war; sonst *das passt*.

## Für Entwickler {#for-developers}

Code: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts), [`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts), [`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts), [`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts), [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx). Die Begründung und ihre Quellen: [die Methode](race-analytics.md).
