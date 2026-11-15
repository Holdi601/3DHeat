---
title: "Manöver"
parent: "Erkenntnisse"
nav_order: 4
lang: "de"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manöver: wie Gruppen sich bewegen

**Erkenntnisse → Manöver** verfolgt, wie sich die Einheiten jeder Seite *als Gruppen* bewegen, und benennt die Manöver, die sie ausführen: einen Flankenangriff, eine Zange, einen Durchbruch, einen Hinterhalt, einen Rückzug, eine Raketenabwehr, das Überqueren des T. Zu jedem Manöver stehen die Sicherheit, die Zahlen dahinter, ob es sich gelohnt hat, und die Entsprechungen in Doktrin und Geschichte. **Massenanalyse → Manöver** zählt sie über Tausende Matches: wie oft jedes Manöver pro Karte, Modus und Seite ausgeführt wird und wie oft es sich lohnt.

Alles wird in deinem Browser berechnet, in einem eigenen Worker (`src/insights/maneuver`). Ein Match mit ein paar hundert Einheiten braucht 10 bis 500 ms, ein zweistündiger Luftkrieg mit tausenden Objekten etwa eine Sekunde.

## So wird es benutzt {#using-it}

- Öffne **Erkenntnisse**, Reiter **Manöver**. Beim ersten Öffnen wird gezählt. Nach dem Ändern der Filter **Neu suchen** drücken.
- **Sicher / Wahrscheinlich / Möglich** legt die angezeigte Sicherheit fest (standardmäßig Wahrscheinlich).
- Die **Zeitleiste** hat eine Spur pro Seite und einen Balken pro Manöver. Die **Liste** darunter zeigt dasselbe, nach Zeit sortiert. Ein Klick wechselt zum Replay an den Anfang des Manövers, fliegt die Kamera dorthin und zeichnet es in 3D: den Weg jeder Gruppe als Pfeil (die beiden Arme einer Zange sind ihre Bögen), die Umrisse der Gruppen im entscheidenden Moment (die des Feindes in der Farbe seiner Seite) und die Front des Feindes als weiße Linie. **Alle in 3D zeichnen** fügt die übrigen Manöver des Matches blass hinzu. Die Linien gehen einmal zur Grafikkarte, wenn sich die Auswahl ändert, nicht bei jedem Bild. Mit 480 Manövern, die während der Wiedergabe gezeichnet werden, sind die Bildzeiten auf einer echten GPU (WebGL2 und WebGPU, p99 18,0 bis 18,5 ms, max 19,5 bis 20,8 ms) gleich denen ohne.
- Ein geöffnetes Manöver zeigt sein Ergebnis (Abschüsse und Verluste der Einheiten, die es ausführten, während es lief und kurz danach, im Vergleich zum Austausch der Seite über das Match), seine Belege und die Einträge der Wissensbasis dazu: die Doktrin und die historischen Parallelen (Cannae für eine Zange, Sedan 1940 für einen Durchbruch, Tsushima für das Überqueren des T, Operation Bolo für eine Finte ...).
- Die kleine Tabelle am Ende: pro Art und Seite, ausgeführt und ob es sich gelohnt hat.

![Eine Zange im synthetischen Demo-Match: die Pfeile beider Arme, der feindliche Körper und seine Front](../assets/img/en/maneuvers.webp)

## Wie Gruppen gefunden werden {#how-groups-are-found}

Jede Einheit wird auf eine gemeinsame Zeitachse gesetzt (ein Schritt von 1 s zu Fuß, sonst 2 s, bei sehr großen Dateien länger). Über einem Tod bleibt sie stehen, damit ein Wiederauftauchen keine Linie quer über die Karte zieht. Bei jedem Schritt werden die Einheiten einer Seite und einer Art (Flugzeuge, Fahrzeuge, Schiffe, Infanterie) verbunden, wenn sie nah beieinander sind: 18 m zu Fuß, 170 m für Fahrzeuge, 3 km für Schiffe, 5 km für Flugzeuge, und wenn sie sich gleich bewegen (Geschwindigkeiten innerhalb der Hälfte der schnelleren Geschwindigkeit, oder beide stehen). Ein Cluster behält die Kennung der Gruppe, in der die meisten seiner Mitglieder waren. Eine Einheit ohne Klasse wird je nach Geschwindigkeit zu Fuß, im Fahrzeug oder in der Luft eingeordnet.

Die **Form** einer Gruppe wird gegen ihre Marschrichtung gelesen: eine Kolonne oder eine Linie nach ihrer Ausdehnung längs und quer, ein Keil, wenn die Mitte vorausgeht, eine Staffel, wenn die Mitglieder zu einer Seite zurückversetzt sind, ein Karree, wenn sie die Ecken halten.

Alles wird am Maßstab des Matches selbst gemessen: die **Gefechtsreichweite** `R` ist das 75. Perzentil des Abstands zwischen einem Töter und seinem Opfer (begrenzt auf den Sinn der Domäne). Die Zeiten eines Manövers skalieren mit der Art der Einheit (Infanterie ein Drittel des Bodens).

## Was gefunden wird {#what-it-finds}

| Manöver | Gefunden, wenn |
|---|---|
| Formation | eine Gruppe hält bei 60 % ihrer sich bewegenden Schritte 30 s lang eine Form |
| Frontalangriff | eine Gruppe schließt aus außer Reichweite bis zum Kontakt auf, ¾ R oder mehr, aus 35° der Blickrichtung des Feindes |
| Flankenangriff | dasselbe aus 50 bis 130° (der Rücken darüber hinaus); sicher nur mit einer eigenen *Fixierungskraft*, die dort den Feind bekämpft (Abschüsse in beide Richtungen) |
| Zange | zwei Flankenangriffe einer Seite auf denselben feindlichen Körper, von gegenüberliegenden Seiten (100° oder mehr auseinander), innerhalb von 90 s; sicher, wenn die beiden Arme kämpfen |
| Einkesselung | ein kompakter feindlicher Verband, um den mindestens so viele der anderen Seite innerhalb von 1,5 R stehen, aus zwei oder mehr Gruppen, ohne Lücke über 100°, eine Minute lang, von der eigenen Seite abgeschnitten; sicher, wenn der Ring sich um ½ R geschlossen hat und die Tasche bekämpft |
| Durchbruch | eine Gruppe durchbricht eine gehaltene Linie (Feinde stehen 30 s lang links und rechts von ihr, die Mitte ihrer Seite jenseits von ihnen); sicher, wenn sie ½ R dahinter ankommt, 20 s bleibt und dort kämpft; ein Durchbruch, der einen weiteren R dahinter liegt |
| Sprungweises Vorgehen mit Überwachung | in einer kleinen Gruppe bewegt sich ein Teil, während der Rest steht, die Rollen wechseln viermal oder öfter, mit Deckungsfeuer vom stehenden Teil |
| Kräftekonzentration / Auflockerung | der Anteil einer Seite nahe ihrem dichtesten Punkt steigt von 35 % auf 60 % (Einheiten kommen 1,5 R oder mehr, dann Kontakt) – oder fällt, wenn sich die Seite ausbreitet |
| Finte | ein kleines Element im Kontakt zieht zwei oder mehr Feinde von anderswo weg; eine größere Gruppe greift dann vier Reichweiten entfernt an, wo der Feind weniger hat |
| Rückzug / Verfolgung | eine Gruppe im Kontakt wendet sich ab und bringt R Abstand zu dem Ort, an dem sie kämpfte; sicher, wenn ein Feind dort gerade eine von ihr getötet hat und die Gruppe 2 R von diesem Töter kam (nie zu Fuß: siehe unten); Feinde, die in dieselbe Richtung ziehen und mithalten, verfolgen |
| Verteidigung in der Tiefe | stehende Einheiten in zwei oder mehr Riegeln quer zur Achse des Feindes, R tief, der Feind rückt heran, Feuer aus den Riegeln |
| Hinterhangstellung | drei oder mehr Abschüsse auf kurze Distanz durch stehende Einheiten, deren Opfer über einen Kamm kamen |
| Hinterhalt | eine sich bewegende Gruppe trifft auf Feinde, die 45 s gestanden haben; sie schießen zuerst, und die Bewegten verlieren zwei oder die Hälfte der Gruppe |
| Sicherung | eine oder zwei Einheiten bewegen sich vor einem Körper aus drei oder mehr und treffen zuerst auf den Feind |
| Innere Linie | die Gruppen einer Seite liegen dicht zwischen denen der anderen, ihre Einheiten wechseln zwischen ihnen |
| Tempo | eine Seite antwortet auf Kontakt (Wende, Geschwindigkeitswechsel, erster Schuss) 1,5-mal schneller, Mann-Whitney p unter 0,05 |
| Crank, Notch, Drag, Pump | das Ziel eines Raketenstarts dreht den Schützen auf 35 bis 70°, 75 bis 105°, über 140°, oder zieht und dreht zurück |
| Luftzange, Wall, Lead-Trail, Grinder | ein Paar teilt sich auf einen Feind; drei nebeneinander auf den Feind zu; ein Element 5 bis 20 km hinter einem anderen; zwei kreisen einen Punkt, einen Abstand voneinander |
| Luftraumüberwachung (CAP) | kreist drei Minuten lang um einen Stützpunkt |
| Energie- / Winkelkampf | in einem Nahkampf – Kurse 30° auseinander, jeder hält den anderen abwechselnd auf der Nase, oder ein Abschuss zwischen ihnen – Höhe genutzt und steigend, oder flach und hart kurvend während des Abbremsens; sicher, wenn einer den anderen abgeschossen hat |
| Strike-Paket, SEAD | eine Luftgruppe mit gemischten Rollen, von denen einige den Boden treffen; Abschüsse der Luftabwehr vor den meisten anderen Bodenabschüssen |
| Kiellinie, Überqueren des T | drei Schiffe in Kiellinie; eine Kolonne quer vor dem Kopf einer feindlichen Kolonne |

Jedes Manöver nennt, welche **Muster** der Wissensbasis es zeigt (`patterns-maneuver.ts`: Formation, Frontalangriff, doppelte Umfassung, Einkesselung, Durchbruch, Feuer und Bewegung, Finte, Rückzug, Verfolgung, Verteidigung in der Tiefe, Sicherung, Auflockerung, Raketenabwehr, Winkelkampf, Luftraumüberwachung, Strike-Paket, Kiellinie, Überqueren des T) und die Einträge, die man zuerst lesen sollte. Ältere Einträge tragen die neuen Muster über `knowledge/maneuver-tags.ts` weiter. Siehe [Die Wissenslinse](knowledge.md).

**Hat sich gelohnt** vergleicht den Austausch der Einheiten, während das Manöver lief (und eine Minute danach), mit dem ihrer Seite über das Match. Ein Rückzug lohnt sich, wenn nach dem Wenden weniger Einheiten verloren gehen als vorher; eine Raketenabwehr, wenn das Flugzeug eine Minute überlebt; eine Einkesselung, wenn die Tasche die Hälfte verliert.

## Über viele Matches {#over-many-matches}

Die Zusammenfassung jedes Matches (`src/mass/summarize.ts`, siehe [Massenanalyse](mass-analysis.md)) enthält einen kleinen Abschnitt `maneuvers`: pro Art und Seite ausgeführt (bei Wahrscheinlich oder höher), gelohnt, nicht gelohnt, Abschüsse und Verluste. **Massenanalyse → Manöver** zählt sie über die Matches zusammen, die der Filter behält – pro Karte und Modus oder insgesamt – mit dem Wilson-Intervall der Lohnquote. Eine Zeile lädt die Matches, in denen sie ausgeführt wurde. Zusammenfassungen, die vor diesem Abschnitt geschrieben wurden, haben keinen: `node tools/3dheat-summarize.mjs <Ordner> --force` ergänzt ihn.

## Wie sicher es ist {#how-sure-it-is}

Synthetische Matches mit eingesetzten Manövern (`synth.ts`, läuft in `maneuver.test.ts`): alle 28 eingesetzten Arten werden auf Wahrscheinlich oder höher gefunden. Von 50 gemeldeten Manövern sind 31 die eingesetzte Art, und die anderen 19 sind ebenfalls wirklich da (die Formation der sich bewegenden Gruppe, die frontale Annäherung der durchbrechenden Kolonne). Keines ist falsch. Bei 30 Nullmatches – Irrwege, auseinander und gemischt, Einheiten stehen zufällig, Flugzeuge auf geraden Strecken, eine Menge, die umherläuft – wird auf Wahrscheinlich oder höher nichts gemeldet.

Bei echten Daten (dutzende Bodenschlachten, einige lange Luftkriegsmissionen, ein Dutzend Shooter-Matches): Frontalangriffe, Flanken, Durchbrüche und Einkesselungen in den Panzerschlachten, Formationen und Nahkämpfe in der Luft, Raketenabwehr, CAP-Kreise und Lead-Trail-Paare in den Luftkriegsmissionen, frontale Hinrichtungen, Kolonnen und einige Hinterhalte und Sprungpaare im Shooter. Die Schwellen sind die Formen der Doktrin im Maßstab des Spiels. Lies einen einzelnen Fund mit seinen Belegen und die Raten der Tabelle mit ihren Intervallen.

### Gegen Nullmodelle derselben Matches {#against-null-models-of-the-same-matches}

Ein Erkenner lässt sich vom Gelände und von der Menge täuschen: in einem Gewühl hat jede Gruppe Feinde ringsum. Deshalb wird jede Art zusätzlich auf **Nullmodellen** aus denselben Matches gerechnet (`nulls.ts`), in denen die Seiten nicht mehr so aufeinandertreffen wie im Original: die Zeitachse einer Seite um ein Drittel bis zwei Drittel des Matches gedreht (*shift*), oder ihre Spuren um die Mitte der Karte gedreht (*rotate*); und die Teamkennungen gemischt (*teams*, was per Konstruktion etwa die Hälfte der echten Gefechte erhält). Gefechte werden nur als Abschüsse gezählt, gepaart mit ihren Toden: der Töter innerhalb von 2 R und das Opfer am Ort. Ein Nullmodell bricht diese Paare. Gefunden bei Wahrscheinlich oder höher, echt gegen die Nullmodelle (30 Panzerschlachten; 12 Shooter-Matches):

| Art | Panzerschlachten: echt / shift / rotate | Shooter: echt / shift / rotate |
|---|---|---|
| Einkesselung | 0 / 0 / 0 (war 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Durchbruch | 0,03 / 0,02 / 0,05 (war 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flankenangriff | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontalangriff | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Rückzug | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (daher zu Fuß nie sicher) |
| Hinterhalt | - | 0,17 / 0,04 / 0,04 |
| Energiekampf | 1,2 / 0,1 / 0,85 | - |
| Winkelkampf | 0,6 / 0,07 / 0,3 | - |

Nahe Luftkämpfe über der Mitte eines Schlachtfelds überstehen eine Drehung um diese Mitte, daher schmeichelt die Spalte rotate ihnen weniger als den Bodenarten. Arten innerhalb einer Seite – Formation, Luftraumüberwachung, Grinder, Strike-Paket, SEAD, sprungweises Vorgehen, Sicherung – hängen nicht von der anderen Seite ab und werden so nicht getestet. `maneuver.test.ts` prüft, dass die Nullmodelle den eingesetzten Flankenangriff, die Zange, die Einkesselung, den Durchbruch, den Hinterhalt und den Rückzug aus den synthetischen Matches entfernen.

## Grenzen {#limits}

- Gruppen brauchen Positionen über die Zeit; eine Datei aus reinen Ereignissen hat keine.
- Die Blickrichtung wird nicht aus den Daten gelesen: die Front des Feindes liegt dort, wo die Fixierungskraft ihn bekämpft, sonst dort, wo er sich bewegt, sonst dort, woher der Angreifer kam.
- Das Gelände wird aus den eigenen Höhen der Einheiten gelesen (der Hinterhang); es gibt keine Sichtlinienprüfung.
- Sehr große Dateien werden mit längeren Schritten abgetastet; kurze Luftmanöver darin werden trotzdem aus 2- bis 4-s-Schritten gelesen.
