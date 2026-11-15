---
title: "Rennanalyse: die Methode"
parent: "Rennanalyse"
nav_order: 58
lang: "de"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Rennanalyse: die Methode

Kurz gesagt:

- Runden werden **nach Distanz** verglichen, nicht nach Zeit, sodass dieselbe Stelle der Strecke übereinanderliegt.
- Jede Kurve wird **als Ganzes** beurteilt, vom einen Bremsbereich bis zum nächsten.
- Die verlorene Zeit wird **aufgeteilt**: wo sie verloren ging (Bremsen, Einfahrt, Ausgang, Gerade) und wie viel davon das Auto erklärt.
- Die Ursache wird **in Worten erklärt**, mit einem Rat.
- Zum Benutzen, nicht zum Nachlesen, wie es funktioniert: siehe [Rennanalyse](race-analysis.md).

Das ist die Methode hinter dem Reiter **Rennanalyse**: was er misst, wie er entscheidet, wo die Zeit verloren ging, und wie er daraus einen Rat macht. Es ist die Spezifikation, der der Analysecode (`src/race/`) folgt, sodass jede Regel hier ein Gegenstück dort hat und einen Test, der sie festhält.

## Was die professionellen Werkzeuge tun {#what-the-professional-tools-do}

Die etablierten Werkzeuge laufen auf denselben Kern zu und unterscheiden sich vor allem darin, wie weit sie zu den *Ursachen* vordringen:

- **Alles wird nach Distanz verglichen, nicht nach Zeit.** Zwei Runden werden auf eine gemeinsame Distanzachse umgerechnet; die laufende Differenz der verstrichenen Zeit bei gleicher Distanz ist das *Delta* (MoTeC nennt es Zeitvarianz, andere Zeitabstand oder Delta-Verlauf). Seine Steigung sagt, wo gerade Zeit verloren wird: Eine flache Steigung ist Beschleunigung, Luftwiderstand oder anhaltender Grip; eine steile eine Differenz beim Bremsen oder Gas; eine auf und ab gehende Welle ein Tausch zwischen Einfahrtsgeschwindigkeit und Ausgang.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [Abschnittszeitanalyse](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Jede Kurve wird in Phasen geteilt**: Bremsen, Einfahrt, Mitte, Ausgang – Bremspunkt, Bremsspitze und Freigabe, geringste Geschwindigkeit und wo sie liegt, Gang, Gas-Aufnahme, Rückkehr auf Vollgas, Ausgangsgeschwindigkeit.
  ([Driver61: sechs Phasen](https://driver61.com/uni/corner-phases/),
  [iRacing-Leitfaden zur Rundenanalyse](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-Sektoren pro Kurve und eine theoretische Bestzeit**, aus den schnellsten aus jedem zusammengesetzt.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Die gefahrene Linie wird ebenfalls verglichen**, aber nie für sich allein: „Eine Linie auf einem Bild bedeutet nichts, solange du die beitragenden Faktoren nicht kennst“ – sie wird gegen den Geschwindigkeitsverlauf und das Delta gelesen.
  ([Track Titan: wie man Telemetrie analysiert](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: Rennlinien](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Grundursache, nicht Symptom.** Ist der Verlust auf der Geraden wirklich das Gas, oder hat eine schlechte Einfahrt das späte Gas erzwungen? Fehler werden nach Rundenzeitkosten gereiht und in einfacher Sprache erklärt.
  ([Track Titan: Coaching-Abläufe](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Was in der ersten Version falsch lief, und warum es wichtig ist {#what-went-wrong-in-the-first-version-and-why-it-matters}

Die erste Version rechnete jede *Phase* einzeln an und sah nur auf Verluste. Eine Runde, die früher bremste, verlor Zeit in der Bremsphase und bekam gesagt, später zu bremsen – selbst wenn das frühere Bremsen das Auto früher eindrehte, früher auf die Leistung brachte und schneller aus der Kurve kam und alles auf der Geraden zurückgewann. In einem Test sagte sie der Runde, die das tat, sie solle „viel später bremsen“, obwohl die andere Runde – die später gebremst hatte – den Scheitelpunkt verfehlt, breit gefahren war und genau das verlor, was sie gewonnen hatte. Die Zeitdaten sagten, die beiden Wege seien gleich; der Rat sagte das Gegenteil.

Die Lösung ist die Regel, auf die sich alle obigen Quellen einigen: **eine Kurve wird als Ganzes beurteilt**, vom Bremsbereich für sie bis zum Bremsbereich für die nächste, denn „manchmal kann das Abgeben einiger Millisekunden in einer Kurve die Rundenzeit insgesamt verbessern, weil die folgenden Abschnitte schneller werden“ ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Rennfahrer-Wissen, das die Regeln kodieren {#racing-knowledge-the-rules-encode}

**Ausgangsgeschwindigkeit zählt mehr als Einfahrtsgeschwindigkeit**, und umso mehr, je länger die folgende Gerade ist: „Zeit auf Geraden dominiert die Zeit in Kurven“, und ein Geschwindigkeitsdefizit am Ausgang wird bis zum nächsten Bremspunkt mitgenommen. Der schnellste Weg durch eine Kurve-und-Gerade ist oft, langsamer in die Kurve zu gehen, damit das Gas früher kommt – *langsam rein, schnell raus*.
([Race & Track Driving: Reihenfolge zur Verbesserung der Rundenzeit](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: Kurven priorisieren](https://driver61.com/uni/prioritising-corners/))
Ein Planer für die kürzeste Zeit, der auch für Ausgangsgeschwindigkeit belohnt wird, verschiebt seine Scheitelpunkte später und erhält eine *schnellere* Runde; die Belohnung, die beides ausgleicht, ist `L / v²` pro Einheit Ausgangsgeschwindigkeit für eine Gerade der Länge `L` bei der Geschwindigkeit `v` – die Zeit, die ein Geschwindigkeitsunterschied auf einer Geraden kostet, wächst mit ihrer Länge und fällt mit dem Quadrat der Geschwindigkeit ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Kurven nach dem, wohin sie führen.** Eine, die auf eine Gerade führt: Ausgangsgeschwindigkeit maximieren, später Scheitelpunkt, so früh wie möglich zurück auf die Leistung. Eine am Ende einer Geraden: die Geschwindigkeit maximieren, die man hineinträgt, so spät wie möglich bremsen; ein früherer Scheitelpunkt ist akzeptabel. Eine zwischen Kurven: auf die zugunsten der Kurve danach ausgerichtet, die zählt. Eine Kurve, die beides sein könnte, wird wie eine behandelt, die auf eine Gerade führt. Schnellere Kurven wiegen mehr: Bei Tempo beschleunigt ein Auto schwach, und ein verlorener km/h wird nicht zurückgewonnen.
([Allen Berg: drei Kurvenarten](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: Kurven priorisieren](https://driver61.com/uni/prioritising-corners/),
[Driver61: verschiedene Kurven, verschiedene Techniken](https://driver61.com/uni/different-corner-technique/))

**Der Reibungskreis (Friction Circle).** Ein Reifen hat ein Grip-Budget, das für Bremsen, Kurvenfahren und Beschleunigen in beliebiger Mischung ausgegeben wird; die Gesamtbeschleunigung ist `sqrt(quer² + längs²)`. Trail-Braking folgt seinem Rand: Die Bremse wird gelöst, während Lenkung und Seitenlast aufgebaut werden.
([Friction Circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g-Diagramm](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rollen** – kein Pedal gedrückt – ist die langsamste Art, Geschwindigkeit zu verlieren, und eine gemessene Leistungskennzahl für sich.
([Racecar Engineering / OptimumG: Rollfaktor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Schlupf.** Die Längskraft erreicht ihr Maximum bei einem Schlupfverhältnis von etwa 10–20 % und fällt dann; darüber blockiert das Rad beim Bremsen oder dreht unter Leistung durch. Forza meldet den Schlupf normiert: 0 ist voller Grip, ein Betrag über 1 ist verlorener Grip.
([Längsschlupf](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Untersteuern und Übersteuern.** Ein vorderer Schräglaufwinkel größer als der hintere ist Untersteuern; ein hinterer größer als der vordere Übersteuern. Ohne Schräglaufwinkel: Das Auto dreht weniger, als die Lenkung verlangt (die Lenkung über dem Ackermann-Winkel `L/R`, den ein Auto bei niedriger Geschwindigkeit braucht).
([Untersteuern, Überblick](https://www.sciencedirect.com/topics/engineering/understeer),
[Untersteuern und Übersteuern](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Die Geometrie einer Linie {#the-geometry-of-a-line}

Die Geschwindigkeit, die ein Auto auf einem Radius `R` halten kann, ist `v = sqrt(a R)`, mit `a` der Querbeschleunigung, die seine Reifen erzeugen (plus was der Abtrieb hinzufügt, der mit `v²` wächst). Die **Geschwindigkeit wächst also mit der Quadratwurzel des Radius**: Eine Linie durch die Mitte auf einem um 20 % größeren Radius ist dort etwa 10 % schneller.
([Maximale Kurvengeschwindigkeit](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: Kurventechnik](https://www.formula1-dictionary.net/cornering_tech.html))

**Die geometrische Linie** ist der größte Bogen durch eine Kurve: von der Außenkante, die Innenseite im Scheitelpunkt berührend, zurück zur Außenkante. Für eine Kurve, die sich um `θ` dreht, auf einer Straße der Breite `w` (abzüglich der Breite des Autos), hat ein Bogen, der beide Außenkanten tangiert und die innere Ecke berührt, `R = w / (1 - cos(θ/2))` (plus der eigene Radius der inneren Kante) – für einen rechten Winkel etwa `3,4 w`, für eine Haarnadel `w`. Deshalb zählt die Breite am meisten in mittleren Kurven und am wenigsten in Haarnadeln.
([Ideallinie](https://en.wikipedia.org/wiki/Racing_line))

**Der späte Scheitelpunkt** dreht später und tiefer ein, zuerst auf einem engeren Radius, und öffnet den Radius auf dem Weg hinaus: langsamer durch die Mitte, früher gerade, früher flach – „eine etwas niedrigere Mindestgeschwindigkeit, aber ein stärkeres Beschleunigungsprofil am Ausgang“. **Der frühe Scheitelpunkt** ist das Gegenteil: schneller hinein, und ein Radius, der sich auf dem Weg hinaus verengt und das Gas zurückhält – im Großen und Ganzen ein Fehler, außer bei sehr wenig Grip, wo Tempo, das man hineinverliert, nicht wieder herausgeholt werden kann.
([Ideallinie](https://en.wikipedia.org/wiki/Racing_line),
[Vokabular der Renntelemetrie](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[Mathematik der Ideallinie](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**Das „V“ und das „U“.** Das U ist die klassische runde Linie: der weiteste Radius, die geringste Lenkänderung. Das V dreht früher ein, geht tiefer, dreht das Auto in der Mitte schnell und legt den Ausgang für einen geradere Fahrt hinaus an: Das Bremsen bleibt gerade (sodass es später sein kann), die Mindestgeschwindigkeit ist niedriger, wird aber später erreicht, Vollgas kommt viel früher.
([Track Titan: die V-Linie](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krümmung gegen Distanz.** Die schnellste Linie ist ein Kompromiss zwischen dem kürzesten Weg und dem am wenigsten gekrümmten; auf der Breite einer Rennstrecke zählt die Krümmung mehr, und eine Linie mit minimaler Krümmung kommt nahe an die Ideallinie der minimalen Zeit heran, wo das Auto am Limit ist – sie weicht von ihr dort ab, wo das Auto noch beschleunigen könnte.
([Globale Trajektorienplanung für die minimale Zeit unter Berücksichtigung von Krümmung und Distanz](https://www.nature.com/articles/s41598-025-21211-2),
[TUM: globale Rennstrecken-Trajektorienoptimierung](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Kurven hintereinander** – ein Doppelscheitel, eine Schikane – sind ein Problem: Die Ausgangslinie der einen ist die Einfahrtslinie der nächsten, und sie werden rückwärts von der gefahren, die auf eine Gerade führt.
([Driver61: verschiedene Kurven, verschiedene Techniken](https://driver61.com/uni/different-corner-technique/))

## Welche Linie zu welchem Auto passt {#which-line-suits-which-car}

Entscheidend ist die **Leistung des Autos gegen seinen Grip** bei den Geschwindigkeiten dieser Kurve – „Schwung ist Grip gegen Leistung, eine Verhältnisfrage“.
([Ross Bentley: Schwung-Autos](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[Schwung über Pferdestärken](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto, bei dieser Kurve | Linie | Warum |
|---|---|---|
| Beschleunigt stark für seinen Grip („point and shoot“) | V: gerade und spät bremsen, in einer kurzen engen Mitte drehen, früh gerade und auf Vollgas | die Zeit wird über Vollgas gewonnen, nicht über die Mindestgeschwindigkeit |
| Beschleunigt schwach für seinen Grip („Schwung“) | breites U, leicht später Scheitelpunkt, Mindestgeschwindigkeit hochhalten | es kann Tempo, das es abbaut, nicht zurückgewinnen |
| Dazwischen | langsam rein, schnell raus: U mit spätem Scheitelpunkt | der klassische Kompromiss |
| Schnelle Kurve, und mehr so mit Abtrieb | U, nahe der geometrischen Linie | die Beschleunigung ist bei Tempo schwach; Abtriebsgrip wächst mit `v²`, daher zahlt sich Tempo durch die Mitte doppelt aus |
| Sehr wenig Grip (nass, Schnee) | früherer Scheitelpunkt | verlorenes Tempo bei der Einfahrt kann nicht mehr herausgeholt werden |
| Leistung weit über dem Grip | die Linie zählt weniger | Traktion, nicht die Linie, begrenzt den Ausgang |

„Je schneller die Kurve, desto näher an der geometrischen Linie; je langsamer, desto mehr verändert man sie durch einen späteren Scheitelpunkt.“
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[Mathematik der Ideallinie](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: die V-Linie](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: Grip](https://driver61.com/uni/grip/))

Der Antriebsstrang verändert, wie die Linie gefahren wird, mehr als die Linie selbst: Ein frontgetriebenes Auto wird auf den Bremsen eingedreht (Trail-Braking) und erst beim Abrollen des Rades mit Leistung versorgt, sonst schiebt es nach außen; ein starkes heckgetriebenes Auto muss gerade sein, bevor Vollgas kommt, sonst bricht das Heck aus; Allrad kann Leistung nehmen, während es noch eindreht, und nimmt deshalb das Gas früher auf.
([FWD-Technik](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs. FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs. RWD in Kurven](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Der Viewer misst das Leistung-zu-Grip-Verhältnis des Autos an jeder Kurve aus seinem eigenen Fahrstil – Beschleunigung auf Vollgas bei der Ausgangsgeschwindigkeit geteilt durch den Quergrip bei der Mindestgeschwindigkeit – und nennt es „point and shoot“ ab 0,45, „Schwung“ bei 0,25 und darunter. Ein Auto, dessen Grip bei 150–250 km/h mehr als 15 % über seinem Grip bei 55–110 km/h liegt, hat Abtrieb, der arbeitet.

## Die Methode {#the-method}

Die folgenden Zahlen sind die Begründung. Die Schwellenwerte, die der Code benutzt, stehen je auf einer eigenen Seite, und diese Seiten sind die Referenz, wenn eine Zahl hier abweicht: [Analyse Kurve für Kurve](race-corner-analysis.md), [Ereignisse der Autokontrolle](race-control-events.md), [Autoprofile und Vergleich](race-car-profiles.md) und [Streckenstatistik](race-course-statistics.md).

### 1. Eine Distanzachse {#one-distance-axis}

Die schnellste Runde ist die Referenz, sofern der Nutzer keine andere wählt. Ihr gefahrener Weg ist die Achse: Die Proben jeder anderen Runde werden auf sie projiziert, und jede Probe bekommt eine Distanz `s` entlang der Referenz und einen vorzeichenbehafteten seitlichen Versatz `d`. Die Projektion sucht nur vorwärts ab dem vorigen Treffer, sodass eine Runde, die sich wieder über sich selbst fährt, nie auf die falsche Seite einer Brücke springt. Die Runden werden dann auf ein Gitter umgerechnet, alle 2 m, für jeden Kanal. Jede Runde wird über die letzten Meter mit der Geschwindigkeit fortgeschrieben, die sie hatte, sodass ihr Delta auf der Linie ihr Rundenzeitunterschied ist.

### 2. Kurven und der Anteil jeder Kurve an der Runde {#corners-and-each-corners-share-of-the-lap}

Wie Kurven, Abschnitte und Komplexe gefunden werden: [Analyse Kurve für Kurve](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Die Zeitbilanz einer Kurve {#the-time-account-of-a-corner}

Netto, Aufteilung, Ausgangsgeschwindigkeit und der Zug der Autos: [Analyse Kurve für Kurve](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Das Urteil und die Ursache {#the-verdict-and-the-cause}

Die Muster der Urteile und die Ursachen bei Einfahrt und Ausgang: [Analyse Kurve für Kurve](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Das Auto gegen den Fahrer {#the-car-against-the-driver}

Wenn die Runden in verschiedenen Autos sind, wird der Verlust, den das Auto erklärt, herausgerechnet, und zwar in Teilen:

- **Zug**: die Autos aus derselben Geschwindigkeit die Gerade hinunter, wie oben;
- **Grip**: von der niedrigeren Mindestgeschwindigkeit, die nicht durch einen engeren Radius erklärt wird, der Anteil `½ ln(Grip_anderes / Grip_meiner) / ln(v_andere / v_meine)`, wenn die Runde am Limit ihres Autos war (90 % dessen, was es bei dieser Geschwindigkeit gezeigt hat);
- **Bremsen**: von `u` auf `v` bei der Verzögerung `a1` gegen `a2`, am selben Punkt endend, kostet `(1/a1 - 1/a2)(u - v)² / 2u` – nur wenn die Runde im Mittel über die Zone etwa so stark bremste, wie ihr Auto kann, nicht nur mit einer Spitze.

Was ein Auto leisten kann, kommt aus jeder geladenen Runde mit ihm: Quergrip, Bremsen und Beschleunigung auf Vollgas pro Geschwindigkeitsband von 5 m/s (95., 95. und 90. Perzentil). Der Grip ist das, was das Auto **eine halbe Sekunde lang gehalten hat** – die über 0,5 s gemittelte Querbeschleunigung –, nicht das, was eine einzelne Probe berührte: Ein Randstein, ein zurückschnappendes Rutschen, ein Auto, das gefangen wird, treiben es alle für einen Moment hoch, und ein Auto, das das oft tut, sah griffiger aus, als es ist. (Geprüft an aufgezeichneten Runden zweier verschiedener Autos: Das Maß pro Probe brachte sie nah zusammen; über eine halbe Sekunde gehalten trennt es sie so, wie es ihre Rundenzeiten tun.) Bremsen und Zug nehmen jede Probe als Median ihrer selbst und ihrer Nachbarn. Die Luft, das Setzen nach einer Landung und jeder Treffer (Abschnitt 6), bis sich das Auto erholt hat, bleiben außen vor.

**Welche Art Auto jedes ist** (`profile.ts`): aus denselben Runden:

- **Grip gehalten**: das 95. Perzentil dieser halbsekündigen Querbeschleunigung;
- **Zug** auf Vollgas bis 50 km/h, 50–120, 120–200 und über 200, und das Höchste, das es zeigte;
- **Bremsen** von 60 auf 160 km/h;
- **Höchstgeschwindigkeit**: wo es auf Vollgas aufhörte zuzulegen, für eine Sekunde auf einer Geraden – gerade gefahren, nicht eine lange Kurve voll genommen, wo ein Auto bei jeder Leistung Tempo abbaut. Wo keine Gerade lang genug war, sagt, wie weit es davon entfernt war, was es bei seinem höchsten Punkt noch zog. Keine Schätzung über das hinaus, was die Runden zeigen: Eine Anpassung von Leistung über Geschwindigkeit gegen Luftwiderstand legte ein Straßenauto 100 km/h über seine wirkliche Höchstgeschwindigkeit, weil die Übersetzung und der Begrenzer den Zug eines Autos viel früher beenden als der Luftwiderstand;
- **Verlieren des Hecks**: wie oft eine Runde über 10° Driftwinkel rutschte (20° auf losem Untergrund), während das Lenkrad gegen die Kurve eingeschlagen war – mit Gegenlenken abgefangen –, wie viele davon auf dem Gas begannen, und bei welchem Anteil ihres Grips sie begannen. Ein Auto, das absichtlich ein wenig seitlich gefahren wird, verliert nichts; eines, das gefangen werden muss, schon. Für jedes Auto gleich gezählt, sodass zwei Autos verglichen werden können;
- **Balance**, wo die Runden Schräglaufwinkel tragen: vorn gegen hinten am Limit.

**Autos im Vergleich** stellt die Autos nebeneinander – eine Tabelle, ein Satz zu jedem darüber, was das Auto gegenüber dem anderen ist („X beschleunigt besser, kann aber nicht so scharf drehen, braucht länger zum Anhalten und verliert leichter das Heck“), jeden Unterschied, der deutlich ist (4 % Grip, 5 % Zug oder Bremsen, 4 km/h Höchstgeschwindigkeit, ein Heck, das mindestens einmal pro Runde häufiger gefangen wird und halb so oft noch einmal), und wie jedes zu fahren ist. Mit einem einzigen Auto sagt es, was dieses Auto ist.

**In jeder Kurve**, wenn die Runden in verschiedenen Autos sind, sagt der Befund, was davon die Autos bestimmen, und wie man das Beste aus diesem macht:

- **durch die Mitte**: Auf der Linie des anderen Autos erlaubt der Grip dieses Autos `v_andere · √(Grip_meiner / Grip_anderer)`. Hat die Runde das gehalten, ist die Lücke das Auto, und kein Bremspunkt ändert sie – es wird so gesagt, und die Kurve wird dem Auto zugeschrieben statt dem Fahrer; hat sie weniger gehalten, ist der Rest zu holen, und es wird gesagt, wie viel. Dann, wo die Zeit stattdessen gewonnen werden kann: auf eine Gerade, oder in einem Auto, das stärker zieht, nach dem Scheitelpunkt – gerade bremsen, später einlenken, das Auto früh auf den Ausgang zeigen lassen; sonst der weiteste Radius, den die Straße zulässt, denn ein größerer Radius ist der einzige Weg zu mehr Tempo ohne mehr Grip;
- **ein Heck, das hier losgelassen hat**, in einem Auto, das es leichter verliert als das andere: was in diesem Auto zu tun ist – das Gas nach und nach zugeben, während das Lenkrad zurückläuft, oder die Bremse sanft lösen ohne Lupfer mitten in der Kurve, je nachdem wie seine Rutschen beginnen;
- **die Gerade danach**: was der stärkere Zug des anderen Autos von derselben Geschwindigkeit aus gekostet hat, und wo dieses Auto auf ihr die Kraft ausging;
- **ein früherer Bremspunkt** in einem Auto, das weniger hart bremst.

Eine Runde, die durch die Mitte einer Kurve rutschte (über 10° Drift auf Asphalt), war über ihrem Grip, nicht unter ihm: Ihr wird nie gesagt, dort hätte sie Grip übrig gehabt. Und wo das Heck des Autos in dieser Runde bei weniger Querbeschleunigung losgelassen hat, als die Kurve verlangte, sagt „Grip übrig“, es in kleinen Schritten zu suchen.

### 6. Autokontrolle: Blockieren, Durchdrehen, Rutschen und Schieben, Treffer und Unfälle {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Jede Runde wird außerdem darauf gelesen, wie das Auto gehandhabt wurde – wo ein Rad blockierte, wo die angetriebenen Räder durchdrehten, wo das Heck ausbrach, wo die Front nach außen rutschte –, weil das die Fehler sind, die die Zeit allein nicht benennt. Drei Dinge machen, dass das über Spiele und Untergründe hinweg trägt.

**Wo der Grip endet, wird aus dem eigenen Fahren des Autos gemessen.** Ingenieure setzen eine Blockiergrenze pro Auto bei dem Schlupf, der die meiste Verzögerung ergab (die MoTeC-Kanäle in OptimumGs Bremsreihe benutzen −0,07 für ein Auto), nicht bei einem Lehrbuchwert – und die Lehrbuchwerte widersprechen sich ohnehin: Die Kraft erreicht ihr Maximum bei 5–20 % Schlupf auf Asphalt, je nach Reifen und Modell, bei 6 % oder bei 20–60 % auf Schnee, je nach Quelle, und für Kies gibt keine Quelle einen Wert. Spiele skalieren den Schlupf wieder anders: Der von Forza ist „normiert“, sodass über 1 der Grip verloren ist – doch die Bremsen eines Autos können ihre beste Leistung weit unter oder weit über 1 davon erreichen, und gewöhnliche Bremszonen können über 1 hinausgehen. Also wird für jedes Auto über jede geladene Runde die Kraft, die es erzeugte, gegen den Schlupf aufgetragen, den es fuhr – Verzögerung gegen den Schlupfwert der Räder beim geraden Bremsen, Beschleunigung (als Anteil dessen, was das Auto bei dieser Geschwindigkeit erzeugt) gegen den Schlupf der angetriebenen Räder, Kurvengrip (als Anteil am Grip des Autos bei dieser Geschwindigkeit) gegen den Schräglaufwinkel jeder Achse –, und die Grenze ist der Schlupf nach dem Optimum, an dem die Kraft um 8 % gefallen ist. Eine Kurve, die in den Daten nie fällt – Forza Horizons Kurven- und Traktionsgrip – hat keine Grenze, und Schlupf allein markiert dort nichts. Bei zu wenig Daten ist die Grenze das Eineinhalbfache des nominellen Maximums.

**Der Untergrund ist pro Eckpunkt bekannt**, wo das Spiel es meldet: Forza lässt die Reifen auf Kies, Schotter und Gras rumpeln (wenige Proben auf einem Asphaltkurs, viele auf Schotter und Gelände-Strecken), Trackmania benennt das Material unter jedem Rad, und der Untergrund einer Rallye-Etappe wird wie in Abschnitt 11 gefunden. Kurven, Driftgewohnheiten und Schwellenwerte werden für Asphalt und losen Untergrund getrennt gehalten.

**Jedes Ereignis wird gegen die andere Runde über dieselben Meter gelegt.** Auf Kies, auf Schnee, in einem driftlastigen Arcaderennen ist das Rutschen die Art, wie eine Kurve gefahren wird: Studien zur optimalen Steuerung finden „driftarme“ Lösungen auf Asphalt und „aggressive, driftreiche, sogar Gegenlenkung“ abseits der Straße; Rallye-Daten zeigen Reifen „weit im nichtlinearen Bereich“, und das Blockieren eines Rades auf sehr losem Untergrund kann das Auto sogar früher anhalten. Ein Ereignis, das auch die andere Runde machte – 80 % davon oder mehr –, ist also die Art, wie die Kurve gefahren wird, kein Fehler; eines, das sie nicht machte, ist nur dann ein Fehler, wenn es Zeit kostete: die Zeit, die von kurz davor bis 40 m danach verloren ging. Ein Fehler, der 40 % oder mehr des Verlusts einer Kurve erklärt, wird die Ursache dieser Kurve.

Erkennungsschwellen, der Test mit der anderen Runde, Treffer und Unfälle und die Texte der Ratschläge: [Ereignisse der Autokontrolle](race-control-events.md).

### 6b. Viele Runden: die Statistik der Strecke {#b-many-laps-the-courses-statistics}

Der Klassenvergleich, was als Fehler zählt, die Statistik und die Fehlerkarte: [Streckenstatistik](race-course-statistics.md).

### 7. Die gefahrene Linie {#the-driven-line}

Für jede Runde und Kurve, allein aus Positionen: wo sie zu drehen begann (ein Fünftel ihrer engsten Krümmung), ihr engster Radius (über ±8 m), der mittlere Radius über die erste und die zweite Hälfte ihrer Richtungsänderung, und so weiter

- **Form**: engster über mittlerem Radius unter 0,55 ist ein V, über 0,75 ein U;
- **Scheitelpunkt**: Ausgangsradius über Eingangsradius über 1,25 ist spät, unter 0,8 früh;
- **Geschwindigkeitsscheitel**: liegt ihr langsamster Punkt mehr als 15 m vor der Halbzeit ihrer Drehung, ist es langsam rein, schnell raus; mehr als 15 m danach, bremst es noch über die Mitte hinaus.

Gegen die andere Runde: wie weit innen oder außen sie beim Einlenken fuhr, durch den engsten Teil und wo beide rollten, und wo jede einlenkte. Jeder Befund endet mit der Linie, die zum Auto der Runde an dieser Kurve passt – nach dem, wohin die Kurve führt, und dem gemessenen Leistung-zu-Grip, Abtrieb und Antriebsstrang des Autos –, und damit, ob die Runde sie so gefahren ist. Die Tabelle Kurve für Kurve listet die schnellste Runde durch jede Kurve mit der Form ihrer Linie, und die besten Kurven werden zusammengefasst.

### 8. Zwei Karten {#two-maps}

- **Wo**: die Strecke, gefärbt nach `dΔt/ds` gegen die Referenz, rot, wo Zeit verloren wird, und grün, wo sie gewonnen wird.
- **Warum**: jeder Verlust, gezeichnet dort, wo seine Ursache liegt, gefärbt nach der Gruppe der Ursache – Bremsen, Einfahrt, Ausgang, Gerade, Auto – und breiter für einen teureren.

### 9. Replay {#replay}

Eine Uhr, drei Arten, sie in die eigene Zeit jeder Runde zu übersetzen: ab dem Start, aufgestellt (jede Runde erreicht einen Punkt der Strecke im selben Augenblick, dann losgelassen) und nebeneinander (jede Runde auf der Distanz der Referenz gehalten).

### 10. Welche Richtung die Welt hat {#which-way-round-the-world-is}

Die Welt des Viewers ist rechtshändig mit Y nach oben. Ein Spiel mit linkshändiger Welt (Forza unter anderem) erscheint darin gespiegelt: jede Rechtskurve als Linkskurve gezeichnet, Strecke und Runden gleichermaßen. Die Runden sagen das selbst – positive Lenkung ist in jedem Adapter nach rechts, und die äußere Federung einer Kurve komprimiert sich –, sodass der Reiter Rennanalyse anbietet, es zu korrigieren, und **Kamera & Szene → Weltachse invertieren** tut das: X, Y oder Z umgekehrt gezeichnet. Nur die Darstellung ändert sich – eine Spiegelung, in die Ansichtsmatrix gefaltet; die Kamera fliegt in der gezeichneten Welt, und die Daten, die Analyse und jede Koordinate, die die Werkzeuge zeigen, bleiben die des Spiels. Die Analyse benennt Kurven nach links oder rechts mit derselben Messung.

### 11. Rallye: das Rutschen, der linke Fuß, die Luft {#rally-the-slide-the-left-foot-the-air}

Eine Rallye-Etappe ist keine Rundstrecke, die mit schlechterem Grip gefahren wird. Auf Schotter und Schnee ist das Rutschen die Art, wie eine Kurve genommen wird: Das Auto wird beim Hineinfahren gedreht, indem man sein Gewicht verlagert – „Bremsen verlagern das Gewicht des Autos nach vorn … die Vorderreifen gewinnen Grip, die Hinterreifen verlieren Grip, und das Auto dreht sich, rutschend in die Kurve“ –, dann wieder aufs Gas, sobald es „in die Richtung ausgerichtet ist, in die du willst“ ([DirtFish: wie man die Bremsen benutzt](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Der linke Fuß bremst, damit Gas und Bremse gegeneinander gespielt werden können; die Handbremse dreht das Auto in engen Kurven ([RallySport Ontario: Rallyefahren, die Grundlagen](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian Flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), und das Auto verlässt den Boden. Abschnitt 6 liest das Rutschen schon gegen die andere Runde; diese Regeln tragen den Rest.

- **Der Untergrund.** Was die Runde sagt (`meta.surface`, das `--surface` der Rallye-Aufzeichnungsprogramme), sonst der Name der Veranstaltung – die Asphalt-Rallyes (Spanien, Kroatien, Mitteleuropa, Deutschland, Japan, Korsika, Ypern), die Winter-Rallyes (Schnee), die Asphaltstrecke der Monte mit Schnee und Eis darauf (gemischt) – sonst, wie das Auto gefahren wurde. Die Querbeschleunigungsgrenze eines Rally2-Autos liegt bei 0,7–0,9 g auf Kies und 1,3–1,4 g auf Asphalt ([grenzbereich, Referenzwerte](https://github.com/GitCrush/grenzbereich)), und auf Kies fährt es deutlich mehr Drift (Abschnitt 6). Eine Etappe, auf der das Auto 10 m/s² oder mehr zog (95. Perzentil, bei Tempo, auf dem Boden) mit einem medianen Drift unter 6 Grad, wo immer es innerhalb von 70 % davon kurvte, ist also Asphalt; alles andere, oder zu wenig zum Urteilen, ist loser Untergrund.
- **Was das Auto auf dem Untergrund kann, auf dem es fuhr.** Grip, Bremsen und Zug (Abschnitt 5) werden auf Asphalt und losem Untergrund getrennt gemessen, wenn die Runden ein Fünftel oder mehr ihrer Proben auf jedem davon fuhren, und jede Kurve wird mit dem Untergrund unter dem Auto an seinem langsamsten Punkt beurteilt. Proben in der Luft und für 0,3 s nach einer Landung bleiben aus allem heraus, was das Auto misst – Hüllkurven, Reifenkurven, Blockieren und Durchdrehen: Eine Landung rüttelt das Auto über alles hinaus, was seine Reifen können, und in der Luft hochgedrehte Räder sind kein Durchdrehen. Abtrieb wird auf losem Untergrund nicht beurteilt, wo die schnellen und langsamen Stücke einer Etappe verschiedene Straßen sind.
- **Ein Antippen des linken Fußes ist kein Bremsen.** Ein leichter Druck auf die Bremse bei halbem oder mehr Gas, über weniger als 15 m, stabilisiert das Auto oder dreht es; wo eine Runde begann, für eine Kurve zu bremsen, ist die erste Bremsung, unter der das Gas wegging, oder die, die länger dauerte.
- **Das Auto wird beim Hineinfahren gedreht.** Für jede Runde und Kurve der größte Driftwinkel vom Bremsen bis 5 m nach ihrem langsamsten Punkt. Auf losem Untergrund dreht eine Runde, die das Auto um 8 Grad oder mehr weniger gedreht hatte als die andere (die es um 12 oder mehr drehte), und später aufs Gas oder gar nicht kam, **das Auto weniger**: Der Rat ist, beim Einlenken zu lupfen oder mit dem linken Fuß leicht zu bremsen, damit das Heck herumkommt – mit dem Handbremspunkt der anderen Runde, wenn sie ihn benutzte, oder der Handbremse in einer Kurve, die langsamer ist als 54 km/h – und es vor dem Scheitelpunkt auf den Ausgang zu richten. Eine, die es 12 Grad oder mehr über die andere hinaus gedreht hatte und trotzdem später aufs Gas kam, **drehte es zu weit**: Es musste gerade gerichtet werden, bevor die Leistung wieder kommen konnte. Beides ist die Ursache der Kurve auf dem Weg hinaus, nach einem Fehler der Autokontrolle. Der Linienrat auf losem Untergrund sagt bei jeder Kurve dasselbe.
- **Die Luft.** Ein Flug, 0,2 s oder mehr länger als der der anderen Runde und der Zeit kostete von 10 m vor dem Absprung bis 40 m nach der Landung (oder dem Ende der Kurve), ist die Ursache, wenn er 40 % oder mehr des Verlusts der Kurve erklärt, und die Kurve danach, auf die man langsamer kommt, sagt das. In der Luft kann das Auto nicht lenken, bremsen oder antreiben. Der Rat hält das Gas beim Absprung an – „beim Absprung nicht vom Gas gehen“, sonst kippt die Nase weg – und nimmt die Kuppe etwas langsamer oder mit einem Antippen der Bremse, damit das Auto tief bleibt ([DirtFish: wie man ein Rallyeauto springen lässt](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Komplexe aus höchstens drei Bögen.** Ein kurvenreicher Abschnitt, der nie voll gefahren wird, ist kein langer Komplex: Nach drei Bögen beginnt ein neuer.

`src/race/rally.test.ts` prüft die Analyse an all dem auf Etappen, die mit einem einfachen Modell gefahren werden: ein Auto, das weniger gedreht wurde und spät aufs Gas kam, ein längerer Flug, Antippen mit dem linken Fuß, ein kurvenreicher Abschnitt, Asphalt gegen Kies.

## Daten und was jede Quelle erlaubt {#data-and-what-each-source-allows}

| Quelle | Rate | Kanäle | Erlaubt |
|---|---|---|---|
| FH-Companion-Rundendateien | ~5 m | Position, Geschwindigkeit, Gas, Bremse, Lenkung, Quer- und Längsbeschleunigung, Gang | alles außer der Autokontrolle, die die Telemetrie daneben braucht |
| FH Companions `.tele.gz`, neben jeder Rundendatei | die 64 Hz des Spiels (ein Aufzeichnungsprogramm, das jedes Paket behält, schreibt etwa 110 pro Sekunde; die Wiederholungen werden verworfen) | Forzas gesamtes Data Out: Schlupf je Rad, Schräglaufwinkel, kombinierter Schlupf, Drehung, Federung, Oberflächenrumpeln; die Geschwindigkeit im Fahrzeugrahmen; Gierrate | alles, Autokontrolle eingeschlossen |
| Forza Data Out, aufgezeichnet von `heat3d_capture telemetry` | 60 Hz | alles Obige, dazu je Rad: Reifentemperatur, Schlupfverhältnis, Schräglaufwinkel, kombinierter Schlupf, Federweg, Raddrehzahl, Rumpelstreifen; Drehzahl, Leistung, Drehmoment, Gierrate | alles |
| Assetto Corsa, ACC, AC EVO, AC Rally (gemeinsamer Speicher, `heat3d_capture telemetry --game ...`) | 60–333 Hz | eine Obermenge: Reifenkern und innere/mittlere/äußere Temperaturen, Drücke, Bremstemperaturen, Radlasten, Sturz, Schlupfverhältnis und -winkel; die Geschwindigkeit im Fahrzeugrahmen; ABS und TC aktiv (ACC, EVO, AC Rally) | alles |
| iRacing `.ibt`, direkt gelesen | 60 Hz | Position aus GPS, Pedale, Lenkung, g, Gieren, je Rad Karkassentemperatur, Dämpferauslenkung, Druck, Verschleiß | alles; Autokontrolle aus dem Driftwinkel (sein Gieren gegen die Fahrtrichtung) und der Lenkung, kein Schlupf (nicht protokolliert) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | je Bild; 100 Hz | Position, Weltgeschwindigkeit und die Achsen des Autos, je Rad Geschwindigkeit der Aufstandsfläche und Federung, Pedale, Lenkung, Etappenuhr und -länge | alles; Schlupf und Driftwinkel abgeleitet |
| Richard Burns Rally (NGP UDP) | je Physikschritt | Position, die eigenen Geschwindigkeiten des Autos, je Rad Federweg und Kraft, Pedale | alles außer dem Radschlupf |
| BeamNG.drive (die Mod-Schnittstelle `heat3d`) | bis 100 Hz | Position, Weltgeschwindigkeit und Achsen, je Rad Oberflächengeschwindigkeit, Drehung, Last und Bodenkontakt | alles; Schlupf und Driftwinkel abgeleitet |
| Trackmania (das Openplanet-Plugin) | je Bild | Position, Front- und Seitengeschwindigkeit, Pedale (Bremse an/aus), Lenkung, je Rad Schlupfkoeffizient und loser Untergrund, in der Luft | alles; der Driftwinkel aus der Seitengeschwindigkeit |

Jede Quelle wird in ein Rundenformat umgewandelt, `heat3d-lap`, dessen Kanäle kanonische Namen haben (`speed`, `throttle`, `tireTemp[FL]` ...). Das Autosymbol und die Diagramme zeichnen, welche Kanäle eine Runde auch hat.

## Quellen {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Abschnittszeiten beschleunigen: Formen der Zeitvarianz](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (Delta im Distanzbereich)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing-Leitfaden zur Rundenanalyse](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: Sitzungsrunden](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: Rennlinien analysieren](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretische Bestzeit aus Sektoren](https://overcut.gg/)
- [Track Titan: wie man Telemetrie analysiert](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: KPIs für Brems-Analyse, Blockier- und Stabilitätskennzahlen (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: am Gas (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: Leistungskennzahlen von Rennfahrern (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Reifen-Fahrbahn-Reibungsmodelle und optimaler Schlupf (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: Reifen-Fahrbahn-Reibung, Schlupf bei Maximum auf Schnee und Eis](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: Reibungskoeffizienten von Reifen, Haften und Gleiten](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: Längskräfte](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: Querkräfte](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Fahrzeugstabilität, Schwimmwinkel-Grenzen (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rallyefahren bei hohem Schwimmwinkel (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Rallye-Manöver für die minimale Zeit (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC-Referenz-Gierrate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Erkennung von Unter- und Übersteuern durch Lenken gegen Gieren (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: Lenkwinkel, Ackermann und der Untersteuergradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: Mathekanäle (Kus, kombiniertes g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: Untersteuern-Übersteuern-Anzeige](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Stotterbremsen: Blockieren auf sehr losem Untergrund](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: Datenaufzeichnung bei Kies-Rallyes](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: wie man die Bremsen benutzt](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: wie man ein Rallyeauto springen lässt](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: Rallyefahren, die Grundlagen](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian Flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: Fahrdynamik von Rallyeautos, Referenzwerte](https://github.com/GitCrush/grenzbereich)
- [Trackmania-Speed-Drift-Trainer-Plugin (Konstanten)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania-Speedslide-Beschreibung](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: Coaching-Abläufe](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: die V-Linie](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (Ausgangsgeschwindigkeit gegen minimale Zeit)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: Reihenfolge zur Verbesserung der Rundenzeit](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: die drei Kurvenarten](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: Kurven priorisieren](https://driver61.com/uni/prioritising-corners/)
- [Driver61: verschiedene Kurven, verschiedene Techniken](https://driver61.com/uni/different-corner-technique/)
- [Driver61: die sechs Phasen einer Kurve](https://driver61.com/uni/corner-phases/)
- [Driver61: Grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (Auszug)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: was ein Schwung-Auto ist](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Die Debatte Schwung über Pferdestärken](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Mathematik der Ideallinie, Teil 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs. FWD, Teil 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD-Technik](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs. RWD in Kurven](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Ideallinie](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: Kurventechnik](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximale Kurvengeschwindigkeit](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Vokabular der Renntelemetrie](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globale Trajektorienplanung für die minimale Zeit unter Berücksichtigung von Krümmung und Distanz](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globale Rennstrecken-Trajektorienoptimierung](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: der Rollfaktor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction Circle, Einführung](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g-Diagramm](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Längsschlupf](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Untersteuern, ein Überblick](https://www.sciencedirect.com/topics/engineering/understeer)
- [Untersteuern und Übersteuern](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out-Dokumentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traktionsbegrenzte Beschleunigung](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: leistungsbegrenzte Beschleunigung](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO gemeinsamer Speicher](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC-Rally-Telemetrieleser](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing-IBT-Auswertung](https://github.com/teamjorge/ibt)
