---
title: "Fahrzeugprofile und Vergleich"
parent: "Rennanalyse"
nav_order: 56
lang: "de"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Fahrzeugprofile und Vergleich

Ein Auto kann nur so stark bremsen, lenken und beschleunigen. Der Viewer misst, wie stark, aus deinen eigenen Runden, daher sagt er dir nie etwas, das dein Auto nicht kann. Das erklärt auch, wie viel einer verlorenen Sekunde am Auto lag und wie viel an dir.

![Autos im Vergleich: zwei Autos nebeneinander mit ihrem Grip, ihrer Bremsleistung und ihrem Schub](../assets/img/en/race-cars-compared.webp)

Die Analyse sagt einer Runde nur, dass sie später bremsen, mehr Tempo halten oder früher beschleunigen soll, wenn ihr Auto gezeigt hat, dass es das kann, und sie rechnet aus einem Verlust heraus, was die Autos selbst erklären. Daher werden die Grenzen jedes Autos (seine *Hülle*, unten) und sein Charakter (sein *Profil*) aus jeder geladenen Runde damit gemessen. Diese Seite behandelt die Hülle, das Profil, den Abschnitt **Autos im Vergleich** und was die Autos in jeder Kurve entscheiden.

**Ein Auto** = Runden mit derselben Startnummer (oder demselben Namen ohne Nummer) und demselben Leistungsindex: Eine andere Abstimmung ist ein anderes Auto.

## Die Hülle: was das Auto bei jeder Geschwindigkeit kann {#the-envelope-what-the-car-can-do-at-each-speed}

Je Auto, über jede geladene Runde davon, in **Geschwindigkeitsklassen von 5 m/s** (24 Klassen, bis 120 m/s). Messungen in der Luft, das Einschwingen von 0,3 s nach einer Landung und alles von 0,1 s vor jedem Treffer bis 1 s danach werden ausgelassen, und Beschleunigungen von 80 m/s² oder mehr werden ignoriert (mehr, als irgendein Auto mit Abtrieb hält).

| Hülle | Messungen | Wert je Klasse | Braucht |
|---|---|---|---|
| **Seitengrip** | die Querbeschleunigung, **die eine halbe Sekunde gehalten wird** (der Mittelwert ihres Betrags über ein zentriertes Fenster von 0,5 s), nur dort, wo das Auto um eine Kurve fuhr: mindestens ein Drittel des 99. Perzentils aller Querbeschleunigung | 95. Perzentil | 6 Messungen |
| **Bremsen** | Bremse über 0,3; die Längsbeschleunigung als Median jeder Messung und ihrer beiden Nachbarn | 95. Perzentil der Verzögerung | 4 Messungen |
| **Vollgas-Schub** | Gas über 0,95, Bremse unter 0,05; derselbe Median aus drei | 90. Perzentil | 4 Messungen |

Warum eine halbe Sekunde gehalten: Ein Randstein, ein Schlupf, der wieder einrastet, ein Auto, das eingefangen wird, lassen die Querbeschleunigung kurz hochschnellen, und ein Auto, das das oft tut, wirkte griffiger, als es ist. Warum der Median aus drei: Bei fünf Metern Abstand zwischen den Messungen ist eine einzelne Messung eine lange Strecke, und ein Ausreißer aus einer Messung ist ein Randstein, eine Bodenwelle oder eine Wand.

Beim Ablesen der Hülle bei einer Geschwindigkeit wird zwischen den Klassenmitten interpoliert; ist eine Klasse leer, wird die nächste Klasse mit Daten genommen.

**Zu zwei Arten von Untergrund.** Wenn die Runden eines Autos auf Asphalt und auf losem Untergrund jeweils ein Fünftel oder mehr ihrer Messungen gefahren sind, wird für jeden eine eigene Hülle geführt, und jede Kurve wird mit dem Untergrund unter dem Auto an ihrem langsamsten Punkt beurteilt.

**Übergang.** Die Geschwindigkeit, ab der der Schub als `1/v` abfällt (leistungsbegrenzt) statt gleich zu bleiben (traktionsbegrenzt): die erste Klasse, deren `a·v` innerhalb von 15 % des höchsten gesehenen `a·v` liegt.

## Das Profil: was für ein Auto es ist {#the-profile-what-kind-of-car-it-is}

`profile`, aus denselben Runden (Messungen am Boden, nicht getroffen, schneller als 8 m/s):

| Maß | Wie |
|---|---|
| **gehaltener Grip** (m/s²) | 95. Perzentil der halb-sekündig gehaltenen Querbeschleunigung |
| **Schub** bis 50 km/h, 50–120, 120–200, über 200 (m/s²) | der Mittelwert des Vollgas-Schubs der Hülle über 3–14, 14–33, 33–56 und 56–90 m/s, bei Geschwindigkeiten, die das Auto erreichte (bis zu seinem Höchsttempo + 2 m/s), aus mindestens drei Schritten zu 1 m/s; dazu das Höchste, das es zeigte, und wo |
| **Bremsen** (m/s²) | das Bremsen der Hülle, gemittelt von 60 bis 160 km/h (16,7–44,4 m/s), das Band, das der Vergleich nennt |
| **schnellste** | die höchste Geschwindigkeit, die es erreichte |
| **Höchsttempo erreicht bei** | wo es bei Vollgas auf einer Geraden nicht mehr zulegte (unten) |
| **zieht bei seiner Höchstgeschwindigkeit noch** | der Schub der Hülle bei seiner schnellsten Geschwindigkeit: wie weit es noch hatte |
| **Heck gefangen, je Runde** | Male je Runde, in denen es rutschte und abgefangen werden musste (unten) |
| **Anteil am Gas** | davon der Anteil, der mit Gas über 0,5 und ohne Bremse begann |
| **lässt los bei** | der Median der gehaltenen Querbeschleunigung 0,15 s vor jedem Beginn eines Rutschens, als Anteil am Grip |
| **über 10° Drift, bei harter Kurvenfahrt** | von den Messungen, die mit 60 % oder mehr seines Grips um eine Kurve fahren, der Anteil, der rutscht (10° auf Asphalt, 20° auf losem Untergrund); braucht 30 Messungen |
| **mittlere Drift** | über dieselben Messungen |
| **Balance** | Schlupfwinkel vorne minus hinten (Vielfache des Nenn-Maximums), wo es hart um Kurven fährt und nicht rutscht, Mittelwert aus mindestens 30 Messungen: + schiebt nach außen |
| **Untergrund** | über 80 % lose Messungen: lose; unter 20 %: Asphalt; sonst gemischt |

**Das Höchsttempo.** Eine Messung zählt, wenn die Sekunde um sie herum (±0,5 s, mindestens 0,9 s Daten) durchgehend Vollgas war (> 0,95, keine Bremse), am Boden, **geradeaus** gefahren (|quer| unter dem größeren von 4 m/s² und einem Viertel seines Grips), weniger als **0,35 m/s²** an Tempo gewann, schneller als 25 m/s war und innerhalb von 90 % der schnellsten Geschwindigkeit der Runde lag. Vollgas einen Berg hinauf oder durch eine lange Kurve hört ebenfalls auf zuzulegen, weit unter dem Höchsttempo des Autos. Bei mindestens **einer Sekunde** solchen Plateaus über alle Runden ist der Median dieser Geschwindigkeiten der Punkt, an dem es das Höchsttempo erreicht. Sonst gibt es kein Höchsttempo: Wo keine Gerade lang genug war, sagt *zieht bei seiner Höchstgeschwindigkeit noch*, wie weit es davon entfernt war. Keine Vermutung über das hinaus, was die Runden zeigen – Übersetzung und Begrenzer beenden den Schub eines Autos lange bevor der Luftwiderstand es tut.

**Das Heck verlieren.** Gezählt, wo der Fahrer es abfangen musste: Kurvenfahrt mit 60 % oder mehr seines Grips, Rutschen (Drift über 10° auf Asphalt, 20° auf losem Untergrund), wobei das Lenkrad (über 0,06) **gegen** die Kurve eingeschlagen ist. Welches Vorzeichen der Lenkung zu welchem Vorzeichen der Querkraft passt, wird je Runde gemessen (Messungen, die ohne Rutschen einlenken). Ein Rutschen wird einmal gezählt, bis das Auto nicht mehr rutscht. Ein Auto, das man absichtlich ein wenig quer fährt, verliert nichts; eines, das Gegenlenken braucht, schon. Für jedes Auto gleich gezählt, damit zwei Autos verglichen werden können. Braucht Lenkung und einen Driftwinkel.

## Autos im Vergleich {#cars-compared}

Der Abschnitt in der Seitenleiste heißt **Das Auto**, wenn ein Auto gewählt ist, und **Autos im Vergleich**, wenn mehrere gewählt sind.

**Die Tabelle**: eine Spalte je Auto, eine Zeile je Maß, für das irgendein Auto einen Wert hat: Gehaltener Grip; Schub bis 50 km/h, 50–120, 120–200, über 200; Bremsen; Schnellste; Höchsttempo erreicht bei („zieht noch“, wo es das nie erreichte); Zieht bei seiner Höchstgeschwindigkeit noch; Heck gefangen, je Runde; Über 10° Drift, bei harter Kurvenfahrt. Wo sich die Autos um mehr als 3 % unterscheiden, wird der bessere Wert markiert (höher bei Grip, Schub, Bremsen, Geschwindigkeiten; niedriger bei Heckrutschen).

**Ein Auto allein**: Sätze darüber, was die Runden von ihm zeigen – der Grip, den es hält (m/s² und g), sein Schub in jedem Band, wo es auf den langen Geraden aufhörte zuzulegen (oder dass es nie sein Höchsttempo erreichte und was es bei seiner Höchstgeschwindigkeit noch zog), wie oft sein Heck abgefangen werden musste („kaum“ unter einmal je Runde, „meist am Gas“, wenn 60 % oder mehr dort begannen).

**Zwei Autos**: für jedes Paar ein Satz darüber, was das eine Auto gegen das andere ist („X beschleunigt besser, kann aber nicht so hart lenken, braucht länger zum Bremsen und verliert das Heck leichter“), die Tabelle, jeder deutliche Unterschied, der größte zuerst, und dann **So fährst du jedes**. Bei mehr als **3** Paaren wird ein Paar gezeigt: das Auto der fokussierten Runde gegen ein Auto aus einer Auswahlliste (standardmäßig das Auto der besten Runde seiner Klasse, sonst das der Referenz, sonst das erste andere).

Ein Unterschied wird nur gesagt, wenn die Runden ihn klar zeigen:

| Unterschied | Gesagt ab | Satz |
|---|---|---|
| Grip | **4 %** | „X hält N % mehr Grip in den Kurven … das sind M % mehr Tempo durch die Mitte jeder Kurve“ (Tempo = √ des Griff-Verhältnisses) |
| Schub | **5 %**, im ersten Band, das beide Autos von 120–200, 50–120, über 200 km/h haben | „X beschleunigt von 120 auf 200 km/h N % stärker“; auch vom Start weg, oder „obwohl Y besser vom Start kommt“, wenn der Start sich um 8 % unterscheidet |
| Höchsttempo | **4 km/h** | „X erreicht ein höheres Tempo: Es hörte auf zuzulegen bei …“ |
| Höchsttempo, nur eines | nur ein Auto erreichte sein Höchsttempo, das andere nicht | „Y ging bei … der Schub aus; X legte beim Bremsen noch zu“ |
| Höchsttempo, keines | keines erreichte es | was jedes bei seiner Höchstgeschwindigkeit noch zulegte |
| Bremsen | **5 %** | „X bremst N % stärker … Y muss früher bremsen“ |
| Heck verlieren | mindestens einmal je Runde mehr **und** anderthalbmal so oft | „X verliert das Heck leichter: Es rutschte so weit aus, dass es N-mal je Runde Gegenlenken brauchte, gegen M …“ – meist am Gas (60 % und mehr) oder meist beim Einlenken und im Lupfen (30 % oder weniger), ab etwa P % seines Grips; auf losem Untergrund „ein Teil davon liegt daran, wie ein Auto gelenkt wird; das Abfangen nicht“ |
| seitlich | **12 Prozentpunkte** harter Kurvenfahrt über der Driftschwelle | „X fährt an der Grenze stärker quer“ |
| Balance vorne | **0,3** des Nenn-Maximums | „X schiebt vorne stärker … Es will vor dem Scheitelpunkt abgebremst und eingelenkt werden“ |

Die Eigenschaften in der Zusammenfassung: *hält mehr Grip* / *kann nicht so hart lenken*, *beschleunigt besser* / *zieht weniger*, *erreicht ein höheres Tempo* / *erreicht ein niedrigeres Tempo*, *zieht am Ende der Geraden noch* / *geht der Schub aus*, *bremst härter* / *braucht länger zum Bremsen*, *ist stabiler* / *verliert das Heck leichter* (*rutscht viel mehr …* bei doppelt so oft plus eins; *muss öfter abgefangen werden* auf losem Untergrund), *schiebt vorne*. „Kaum ein Unterschied zu Y auf diesen Runden“, wenn keiner da ist.

**So fährst du jedes:**

- Ein Auto hat mehr Grip und das andere mehr Schub: In dem griffigeren Auto Tempo durch die Mitte halten auf einer weiten, runden Linie (das „U“); im starken Auto gerade bremsen, es in einer kurzen, engen Mitte eindrehen und den Ausgang gerade ziehen (das „V“);
- ein Auto ist bei beidem hinten dran: Seine beste Runde ist die sauberste – gerade bremsen, der weiteste Radius, Vollgas so früh, wie es hält;
- ein Auto, das das Heck leichter verliert: das Gas nur in dem Maße aufziehen, wie sich das Lenkrad löst, und kurz schalten (Rutschen am Gas), oder die Bremse sanft lösen und in der Mitte gleichmäßig Gas halten (Rutschen beim Einlenken).

Der Hinweis unter dem Abschnitt wiederholt, wie jedes gemessen wird.

## Was die Autos in einer Kurve entscheiden {#what-the-cars-decide-in-a-corner}

Wenn die Runden in verschiedenen Autos gefahren sind, endet der Befund jeder verlorenen Kurve mit **Die Autos:** – was davon die Autos entscheiden und wie man das Beste aus diesem herausholt (`carNote`):

- **Durch die Mitte**, wenn dieses Auto weniger als 96 % des Grips des anderen hält, das andere am langsamsten Punkt mehr als 0,5 m/s schneller war und diese Runde nicht weit unter dem lag, was ihr Grip erklärt (über 70 % davon): Auf der Linie des anderen Autos erlaubt der Grip dieses Autos `v_other · √(grip_mine / grip_other)`. Hat die Runde das getragen (innerhalb von 1 m/s), liegt der Abstand am Auto, und kein Bremspunkt ändert daran etwas; wenn weniger, wie viel davon noch zu holen ist. Dann, wo die Zeit stattdessen zu gewinnen ist: auf einer Geraden, zwischen zwei, oder in einem Auto, das 5 % stärker zieht – nach dem Scheitelpunkt (gerade bremsen, später einlenken, früh auf den Ausgang zeigen); sonst der weiteste Radius, den die Strecke erlaubt.
- **Ein Heck, das hier losgelassen hat** (ein nicht geteiltes Rutschen oder Dreher, oder ein Drift über der Rutschschwelle beim Einlenken), in einem Auto, das es mindestens einmal je Runde mehr und anderthalbmal so oft verliert: was in diesem Auto zu tun ist – das Gas, das mit dem Lösen des Lenkrads eingezogen wird (seine Rutschvorgänge beginnen zu 60 % oder mehr unter Last), oder die Bremse, die sanft ohne Lupfen gelöst wird.
- **Die Gerade danach**: wenn der Schub der Autos 0,03 s oder mehr erklärte, der stärkere Schub des anderen Autos aus derselben Geschwindigkeit, mit dem Schub beider Autos von 120 bis 200 km/h.
- **Höchsttempo**: wenn diese Runde 98 % dessen erreichte, wo ihr Auto auf einer Geraden von mehr als 150 m Länge das Höchsttempo erreicht, und das andere 1,5 m/s schneller war: Das ist das Höchsttempo des Autos, und jeder km/h mehr aus der Kurve hilft, bis es dort ist.
- **Bremsen**: wenn das andere Auto 5 % stärker bremst und diese Runde mehr als 5 m früher bremste, dass ein Teil des früheren Bremsens am Auto liegt.

Der Anteil des Autos wird auch von der Zeit selbst abgezogen – siehe [der Anteil des Autos](race-corner-analysis.md#the-cars-share) –, und eine Kurve, bei der das Auto 60 % oder mehr erklärt, wird dem Auto zugeschrieben.

## Für Entwickler {#for-developers}

Code: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` in [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` in [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
