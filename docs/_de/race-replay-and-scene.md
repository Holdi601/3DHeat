---
title: "Replay und die 3D-Szene"
parent: "Rennanalyse"
nav_order: 52
lang: "de"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay und die 3D-Szene

Spiele deine Runden zusammen ab, wie ein Rennen, und sieh, wo ein Auto davonzieht. Alles, was du in der 3D-Ansicht des Reiters **Rennanalyse** siehst, ist hier beschrieben: die gefahrenen Linien, die Farben auf der Strecke, die Autos und die Beschriftungen.

![Ursachenkarte mit den Autos, aufgestellt 40 m vor einer Kurve: farbige Strecke, zwei Autos und der Flaggenpfosten](../assets/img/en/race-replay-lined-up.webp)

## Die Replay-Uhr {#the-replay-clock}

Eine Uhr steuert jede Runde: Sekunden der **Referenz**-Runde. Die Engine schaltet sie bei der Wiedergabe in jedem Bild weiter (um die Bildzeit × Wiedergabegeschwindigkeit); am Ende springt sie auf 0 zurück, wenn **Schleife** an ist, sonst hält sie an. Die Uhr ist bewusst nicht im Speicher der Anwendung, damit sich die Seitenleiste nicht bei jedem Bild neu zeichnet; die Anzeige und die Diagramme hängen sich an die Uhr und aktualisieren sich höchstens einmal pro Bild.

**Die Länge des Replays** ist die längste Zeit, die eine Runde auf der Uhr läuft: die Rundenzeit jeder Runde (abzüglich ihres Versatzes in *Aufgestellt*) oder die Zeit der Referenz in *Nebeneinander*.

## Die Transportleiste {#the-transport-bar}

Unter der Ansicht, von links nach rechts:

| Bedienelement | Tut |
|---|---|
| ⏮ | zurück an den Anfang (auch **Pos1**) |
| ▶ / ❚❚ | abspielen / pausieren (auch **K**) |
| Geschwindigkeit | 0,25×, 0,5×, 1×, 2×, 4× |
| Schieberegler | setzt die Uhr direkt, in Schritten von 0,01 s |
| Uhr | `Zeit / Länge · Meter`: die Uhr als Rundenzeit, die Länge des Replays und wie weit die Referenz auf der Referenzrunde ist |
| *Ab dem Start* / *Aufgestellt* / *Nebeneinander* | der Replay-Modus (unten) |
| **Hier aufstellen** | stellt jedes Auto dorthin, wo die Referenz jetzt ist, und läuft von dort weiter |
| **Schleife** | von vorn beginnen am Ende (standardmäßig an) |
| **Diagramme ausblenden** / **Diagramme zeigen** | die Distanzdiagramme unter der Leiste |

Die Schaltflächen sind deaktiviert, bis Runden geladen sind (eine Runde genügt, um sie abzuspielen; Vergleiche brauchen zwei).

## Replay-Modi {#replay-modes}

Wie die eigene Zeit jeder Runde aus der Uhr folgt:

| Modus | Zeit jeder Runde | Was er zeigt |
|---|---|---|
| **Ab dem Start** (`start`) | die Uhr selbst | jede Runde von ihrem eigenen Start: ein Rennen zwischen ihnen, der Abstand wächst, wie er auf der Strecke gewachsen ist |
| **Aufgestellt** (`anchor`) | die Uhr plus der Versatz der Runde | jedes Auto am selben Ort zur selben Zeit, dann losgelassen – was von diesem Punkt an geschieht, nicht vom Start der Runde an |
| **Nebeneinander** (`locked`) | die Zeit, zu der die Runde die aktuelle Distanz der Referenz erreichte | jedes Auto auf der Distanz der Referenz gehalten, die ganze Runde lang: Geschwindigkeiten und Eingaben, Meter für Meter verglichen |

Verwende ihn so:

- **Ab dem Start**: Du willst sehen, wer vorn liegt und wie der Abstand wächst.
- **Aufgestellt**: Du willst wissen, was in einer Kurve oder auf einer Geraden passiert, wenn alle dort gleich beginnen.
- **Nebeneinander**: Du willst vergleichen, was die Fahrer mit Pedalen und Lenkrad an derselben Stelle der Strecke tun.

**Versätze in *Aufgestellt*:** Für einen Anker bei `s` Metern entlang der Referenz ist der Versatz jeder Runde ihre eigene Zeit bei `s` minus die Zeit der Referenz bei `s`, beide aus den ausgerichteten Runden gelesen (siehe [eine Distanzachse](race-corner-analysis.md#one-distance-axis)). Eine Runde, die `s` nicht abdeckt, behält den Versatz 0. Wählst du *Aufgestellt* über die Modusschaltflächen, verankert er bei der aktuellen Distanz der Referenz.

Ein weißer Pfosten mit einer Flagge (14 m hoch) markiert den Anker im Modus *Aufgestellt*.

### Aufstellen {#lining-up}

| Aktion | Anker | Uhr |
|---|---|---|
| **Hier aufstellen** | wo die Referenz jetzt ist | bleibt |
| Umschalt+Klick auf den Diagrammen | der angeklickte Meter | 1,5 s bevor die Referenz ihn erreicht |
| ein Befund in *Wo du besser werden kannst*, eine nummerierte Marke auf der Strecke, eine Zeile von *Kurve für Kurve* mit einem Befund | 40 m vor der Stelle, an der die Ursache des Befunds beginnt | 1,5 s vor dieser Stelle; dann läuft es |
| ein Ereignis der Autokontrolle, ein Trefferlabel | 40 m vor dem Ereignis | 1,5 s vorher; dann läuft es |
| eine Runde in der Streckenstatistik | wie ihr Befund oder Ereignis | wie oben, mit dieser Runde im Fokus |

Ein Befund anzusehen, rahmt ihn außerdem mit der Kamera – eine Kugel um die Mitte des Bereichs des Befunds, mit dem Radius des größeren von 40 m und der halben Länge plus 30 m (60 m bei einem Ereignis) –, außer die Kamera verfolgt gerade ein Auto.

### Verfolgungskamera {#chase-camera}

⌖ in der Rundenliste lässt die Kamera diesem Auto folgen: 2,5 + 4 × Autogröße Meter dahinter und 0,9 + 1,1 × Autogröße Meter darüber, entlang seiner Fahrtrichtung ausgerichtet, nach unten zum Auto geneigt, und sanft nachgezogen (20 % des Wegs je Bild), damit sie bei jedem Wackeln nicht zittert. ⌖ noch einmal löst sie. Das verfolgte Auto wird etwas heller gezeichnet, mit einem weißen Ring auf dem Boden, und seine Karte ist hervorgehoben.

## Der Reiter Ansicht {#the-view-section}

| Bedienelement | Standard | Tut |
|---|---|---|
| **Linien** / **Zeitkarte** / **Ursachenkarte** / **Fehlerkarte** | Zeitkarte | was entlang der Strecke gemalt wird (unten); *Linien* malt nichts |
| Legende | - | *gewinnt ↔ verliert* bei der Zeitkarte, die Ursachenfarben bei der Ursachenkarte, *wenige Runden ↔ die meisten Runden* bei der Fehlerkarte |
| **Gefahrene Linien** | an | die Linie jeder sichtbaren Runde in ihrer Farbe |
| **Autos** | an | die Autos und die Quellen der Karten im Kopfbereich |
| **Reifen & Fahrwerk** | an | Reifentemperatur, Schlupfringe, Federstößel und andere Glyphen pro Rad sowie Dachlampen an den Autos |
| **Beschriftungen** | an | Kurvennamen, nummerierte Marken, Trefferbeschriftungen, die Kurvenbeschriftungen der Fehlerkarte |
| **Strecke aus den Runden** | an | eine Fahrbahnoberfläche für eine Strecke ohne extrahiertes Modell (verborgen, solange ein Streckenmodell in **Level** geladen ist) |
| **Alle Werte auf den Karten** | aus | jeder Kanal, der auf jeder Anzeigekarte steht |
| **Echte Autoformen** | an | jedes Auto in der Form seines Gegenstücks (siehe [Die Autos](#the-cars)); aus: der offene Einsitzer, der nichts von der Telemetrie verdeckt |
| **Autogröße** | 1× | 1× bis 10× in Schritten von 0,5; 1× ist die echte Größe des Autos, so lang und breit wie im Spiel. Nur dieser Schieberegler ändert sie |

## Gefahrene Linien {#driven-lines}

Der Weg jeder sichtbaren Runde durch ihre eigenen Proben, in ihrer Farbe, 0,12 m unter der aufgezeichneten Position gezeichnet (die aufgezeichnete Position eines Autos ist sein Bezugspunkt, 0,28 bis 0,47 m über der Fahrbahn auf extrahierten Forza-Strecken). Ein Punkt wird alle 1,5 m behalten; sind mehr als 10 Runden sichtbar, behalten die nicht betrachteten Runden alle 6 m einen Punkt (jeder Eckpunkt geht jedes Bild an die Grafikkarte).

## Die Karten {#the-maps}

Alle drei sind Bänder entlang des **Referenz**-Weges, 0,2 m unter den aufgezeichneten Positionen, ein Viereck pro 2-m-Gitterschritt.

### Zeitkarte (`where`) {#time-map-where}

Für die fokussierte Runde: gewonnene oder verlorene Sekunden pro Meter gegenüber der Runde, mit der sie verglichen wird, an diesem Punkt (die beste ihrer Klasse oder, für die Referenz, die schnellste andere Runde durch jeden Abschnitt), aus der Änderung des ausgerichteten Deltas pro Gitterschritt, geglättet über ±10 m. Rot, wo sie Zeit verliert, grün, wo sie gewinnt, grau dazwischen; die Farbskala ist das 95-Perzentil der absoluten Werte, sodass Ausreißer abgeschnitten werden und der größte Teil der Runde im Bereich liegt. 6 m breit.

### Ursachenkarte (`why`) {#cause-map-why}

Für die fokussierte Runde: jeder Verlust wird über den Bereich gemalt, in dem seine **Ursache** liegt (nicht dort, wo die Zeit sichtbar wird), gefärbt nach der Gruppe der Ursache; der teuerste Befund gewinnt, wo zwei sich überlappen. Breite `3 + 9·√(Kosten / größte Kosten)` Meter; wo nichts verloren wurde, ein graues 2-m-Band. Der in *Wo du besser werden kannst* gewählte Befund wird weiß gemalt.

| Gruppe | Farbe | Befunde |
|---|---|---|
| Bremsen | orange | Verluste des Fahrers in der Bremsphase |
| Einfahrt | magenta | Verluste des Fahrers bei der Einfahrt und in der Kurvenmitte |
| Ausgang | blau | Verluste des Fahrers beim Herausfahren |
| Gerade | gelb | Verluste des Fahrers auf der Geraden |
| Auto | grau | was das Auto erklärt |
| Umstand | dunkelgrau | die Situation (ein Rennstart gegen eine fliegende Runde) |

### Fehlerkarte {#mistake-map}

Wie viele aller Runden (der Klassen, die in der Streckenstatistik gewählt sind) an jedem Meter einen Fehler gemacht haben – jeder Art, oder nur der in der Statistik gewählten. Jede Runde zählt pro Meter einmal; der Bereich jedes Fehlers wird um 6 m auf jeder Seite verbreitert, damit auch ein kurzer sichtbar ist. Breite `3 + 10·(Runden / meiste Runden)` Meter und eine Farbe von gedecktem Braun bis leuchtendem Orange; graues 2 m, wo keine Runde einen Fehler machte. Siehe [Streckenstatistik](race-course-statistics.md#the-mistake-map).

## Gelände aus den Runden {#track-from-the-laps}

Für ein Spiel, dessen Strecke nicht extrahiert wurde, wird unter den Linien eine Straße gezeichnet: so breit, wie die Runden über die Referenz verteilt liegen (seitliche Abweichungen innerhalb von 25 m zählen), plus 2 m auf jeder Seite, mindestens 4 m auf jeder Seite der Referenzlinie, über ±8 Gitterpunkte (±16 m) geglättet, in Asphaltgrau mit hellen Randlinien, 0,3 m unter den aufgezeichneten Positionen. Verborgen, solange ein Streckenmodell in **Level** geladen ist.

## Treffer und Unfälle auf der Strecke {#hits-and-crashes-on-the-track}

Die Treffer und Unfälle jeder sichtbaren Runde (siehe [Ereignisse der Autokontrolle](race-control-events.md#hits-and-crashes)) werden an der Stelle markiert, an der sie passierten, immer wenn Linien oder Autos gezeichnet werden: ein gezackter Stern – rot für einen Unfall, bernsteinfarben für einen Treffer – auf einem Pfosten, mit einem Ring in der Farbe der Runde an seinem Fuß, in der Größe der Autogröße (Unfälle größer). Wenn ein Auto den Moment eines Treffers passiert, breitet sich 0,8 s lang ein Stoßring von ihm aus.

## Hilfemodus {#help-mode}

**?** neben der Sprachauswahl oder die Taste **?** oder **F1** schaltet einen Schlüssel zu jeder Farbe auf dem Bildschirm ein, auf allen drei Reitern ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Die Wahl bleibt in diesem Browser.

- **Der Schlüssel** in der Ecke der Ansicht listet die Farben für den Reiter und den Modus, die gerade benutzt werden. Jede Farbskala kommt von dort, wo die Ansicht sie bekommt, sodass eine Wärmeskala, die du bearbeitet hast, als bearbeitet erscheint. Im Reiter Rennanalyse wird nur aufgeführt, was die geladenen Runden mitbringen.
- **Die Karte jedes Autos** bekommt eine Tabelle dessen, was auf seinen Rädern gezeichnet wird, nach Name, mit dem Wert jedes Rades in der Farbe, in der er gezeichnet wird.
- **Das Auto im Fokus** bekommt an jedem Rad ein Label, das dasselbe sagt, außen an den Ecken platziert. Ausgeblendet, wenn das Auto auf dem Bildschirm zu klein ist, als dass sie hineinpassen.

## Die Autos {#the-cars}

**Jedes Auto in seiner eigenen Form**, in der Farbe seiner Runde und in seiner echten Größe. Die Formen kommen aus einer Autodatei, die einmal auf dem Rechner gemacht wird, auf dem das Spiel läuft:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Ohne eine solche Datei wird jedes Auto als **das eigene Auto des Viewers** seiner Art und Epoche gezeichnet: Limousine, Coupé, Kompaktwagen, Kombi, Sportwagen, Supersportwagen, Muscle Car, Geländewagen, Pickup, Transporter oder Kleinstwagen, jeweils als Klassiker (vor 1980), aus den 80ern und 90ern oder modern ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Diese werden hier aus allgemeinen Proportionen gebaut: keine Logos, keine Modellnamen und nichts aus den Dateien irgendeines Spiels, daher werden sie mit dem Viewer ausgeliefert. Die Art kommt aus dem Namen des Autos, die Epoche aus der Jahreszahl darin; ein Auto ohne beides bekommt seine Klasse. Etwa hundert echte Generationen sind über ihre veröffentlichte Länge, Breite, Höhe und ihren Radstand bekannt ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); eine Zeile je Auto, gerundet), sodass ein BMW 3er der 1990er die Größe und Haltung dieses Autos bekommt, weiterhin als schlichte Form ohne Emblem oder Kühlergrill.

Die Autodatei entsteht auf deinem eigenen Rechner aus deiner eigenen Kopie des Spiels. Sie enthält ein Modell jedes Autos mit wenig Detail, etwa 900 Dreiecke, mit seinen Radpositionen (siehe [der Befehl `cars` des Extraktors](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Autodatei laden...** in den Ansichtseinstellungen oder das Ablegen der Datei auf dem Reiter Rennanalyse lädt sie; sie bleibt in diesem Browser. Sie enthält die Formen des Spiels, daher ist sie nichts zum Weitergeben, und der Viewer liefert keine aus.

Welches Auto für das Auto einer Runde einspringt, wird jedes Mal aus dem berechnet, was gerade geladen ist, und nie gespeichert; ein Auto ohne Gegenstück heute bekommt sein eigenes, sobald eine neuere Datei es hat ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Auto der Runde | Gezeichnet als |
|---|---|
| seine Nummer steht in der Datei für dasselbe Spiel | genau dieses Auto |
| dieselbe Marke und ein Wort des Modells im Namen | dieses Modell, zeitlich am nächsten |
| dieselbe Marke, dieselbe Generation | das Auto dieser Marke, zeitlich am nächsten |
| alles andere, mit einer Autodatei | die nächste Verwandte derselben Marke, wenn es sie gibt, sonst dieselbe Karosserieart, zeitlich am nächsten |
| ein Formelwagen, nach seinem Namen | der Einsitzer unten |
| keines der ersten beiden, und der Viewer kennt das Auto nach seiner Größe | das eigene Auto des Viewers in der echten Größe dieses Autos, mit oder ohne Datei |
| alles andere ohne Datei | das eigene Auto des Viewers seiner Art und Epoche |

So zeigt eine Runde eines 1990er BMW 3er aus einem anderen Spiel einen BMW etwa dieses Jahrgangs, und ein Auto, das neuer ist als die Datei, zeigt seinen nächsten Verwandten, bis die Datei neu gemacht wird. Der Tooltip einer Runde und die Zeile unter der Autogröße für die fokussierte Runde sagen, als was sie gezeichnet wird und wie nah das ist.

Die eigenen Autos des Viewers haben dunkle Scheiben. Die Modelle einer Autodatei sind überall in einer Farbe, weil die Datei weder Lack noch Glas kennt. Die Räder, Schlusslichter, Lampen und Telemetrie-Glyphen unten werden wie beim Einsitzer gezeichnet; der Stößel läuft an der Außenseite des Rades hoch, wo sie zu sehen ist, und die Querlenker werden weggelassen.

**Der Einsitzer** ist ein offener Formelwagen in der Farbe der Runde, sodass die Front von jedem Winkel aus eindeutig ist und nichts die Räder verdeckt: Wanne, Motorhaube, Seitenkästen, Cockpit mit Helm, Halo, Boden, Front- und Heckflügel; vier runde Räder, die vorderen von der Lenkung gedreht (bis 0,5 rad bei vollem Einschlag), jedes an zwei Querlenkern mit Achsschenkel, Spurstange (vorn) oder Antriebswelle (hinten), und ein Stößel. Das Modell wird 0,3 m unter die aufgezeichnete Position abgesenkt, damit seine Räder auf der Straße stehen, und mit der **Autogröße** skaliert.

**Die Karosserie bewegt sich auf ihren Federn**: Hat die Runde alle vier Federwege, sinkt jede Ecke um ihren Weg (auf 0,12 m von voll ausgefedert bis voll eingefedert übertrieben, damit es aus einer Verfolgungskamera sichtbar ist), und die Karosserie sinkt, nickt und wankt auf der Ebene durch die vier.

**Was aus der Telemetrie gezeichnet wird** (bei eingeschaltetem *Reifen & Fahrwerk*) folgt der [Kanaltabelle](race-charts-and-hud.md#the-channel-table):

| Glyph | Aus | Zeichnung |
|---|---|---|
| Reifenfarbe | `tireTemp` | der Reifen selbst, blau kalt → cyan → grün arbeitend → gelb → rot heiß, über 40–130 °C |
| Schlupfring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (der größte) | ein Ring auf dem Boden unter dem Rad, grün mit Grip in der Hand, bernsteinfarben bei 0,66, rot bei 1 (die Grenze des Grips, wie das Spiel sie angibt); schwach unter 0,3 |
| Federungsbalken | `suspension` (0..1) | der Stößel, nach Federweg gefärbt: blau ausgefahren, weiß mittig, rot eingefedert |
| Bremsglühen | `brakeTemp` (100–900 °C) | eine Scheibe auf der Außenseite des Rades, dunkel bis orange |
| Verschleißband | `tireWear` (0..1) | ein Band um die Lauffläche, weiß neu → rot abgefahren |
| Lastbalken | `wheelLoad` (0–12.000 N) | ein Pfosten neben dem Rad, so hoch wie die Last |

Die Bremslichter (Regenlicht und Flügelendplatten) leuchten mit dem Bremspedal. Jeder Kanal `lamp`, der an ist (über der Hälfte seines Bereichs), lässt eine Lampe über dem Lufteinlass in seiner Farbe leuchten: ABS aktiv, Traktionskontrolle aktiv, DRS, Boxenbegrenzer, Handbremse, in der Luft.

**Bei einer Menge** (mehr als 10 sichtbare) werden die Autos, die nicht betrachtet werden, schlicht gezeichnet: nur Karosserie, Flügel, Räder und Bremslicht.

## Beschriftungen {#labels}

An die Strecke geheftet und jedes Bild aus der Projektion der Kamera platziert (außerhalb des Bildes oder hinter der Kamera: ausgeblendet). Bei eingeschalteten **Beschriftungen**:

| Beschriftung | Wo | Klick |
|---|---|---|
| Kurvennamen (`T1`, `T2` …) | über dem Scheitelpunkt jeder Kurve auf der Referenz | - |
| nummerierte Marken 1–5 | die fünf größten Fahrerverluste der fokussierten Runde, in der Mitte des Bereichs jeder Ursache, mit einem Rand in der Ursachenfarbe; darüber schweben für Titel und Kosten | Befund aufstellen und abspielen |
| Treffer- und Unfallbeschriftungen | über jedem Ausbruch der **fokussierten** Runde: „Unfall −45 km/h“ / „Treffer −12 km/h“; darüber schweben für die volle Beschreibung und den Tipp | Aufprall aufstellen und abspielen |
| Kurvenbeschriftungen der Fehlerkarte (statt der Kurvennamen und Marken, wenn die Karte die Fehlerkarte ist) | am Scheitelpunkt jeder Kurve: „T3 · 5/40 zu früh gebremst“ (der häufigste Fehler, Runden, die ihn machten / Runden, die die Kurve fuhren), „T3 · 5/40“, wenn eine Art gewählt ist, „T3 · sauber“, wenn keine gewählt ist; darüber schweben für die Verluste der Kurve und ihre fünf häufigsten Fehler | die Kurve in der Streckenstatistik öffnen oder schließen |

## Gespiegelte Welten {#mirrored-worlds}

Die Welt des Viewers ist rechtshändig mit Y nach oben: von oben gesehen fährt ein Auto, dessen Fahrtrichtung `atan2(dx, dz)` wächst, nach links. Ein Spiel mit linkshändiger Welt – Forza unter anderem – erscheint gespiegelt: jede Rechtskurve wird als Linkskurve gezeichnet, Strecke und Runden gleichermaßen.

Die Runden sagen das selbst ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): Geht man jede Runde in Schritten von wenigen Metern (3 m) ab, wird das Kurven des Pfades mit der Kompression der äußeren Federung (`suspension.FR` minus `suspension.FL`) verglichen und, ohne Federungsdaten, mit der Lenkung (in jedem Adapter positiv nach rechts). Eine Runde, die insgesamt weniger als π kurvt, sagt nichts; ein Beweis zählt, wenn er 2 % des Kurvens übersteigt. Die Runden stimmen ab; ein Gleichstand heißt „nicht zu sagen“.

Widerspricht das Urteil der Runden der aktuellen Achsenumkehr (eine ungerade Anzahl umgekehrter Achsen in **Kamera & Szene → Weltachse invertieren**), sagt der Abschnitt **Runden** das unter der Liste:

- Das Spiel ist gespiegelt, und nichts ist invertiert: „Diese Runden lenken nach rechts, wo die Strecke als Linkskurve gezeichnet ist …“ mit **X invertieren**;
- Achsen sind invertiert, die Runden aber nicht gespiegelt: „Die invertierten Achsen zeichnen diese Runden gespiegelt …“ mit **Achsen zurücksetzen**.

Nur die Darstellung ändert sich – eine Spiegelung, in die Ansichtsmatrix gefaltet; die Daten, die Analyse und jede Koordinate, die die Werkzeuge zeigen, bleiben die des Spiels. Die Umkehrung wird im Browser gespeichert. Die Analyse benennt Kurven nach links oder rechts mit derselben Messung (eine unbekannte Welt gilt als gespiegelt, wie die von Forza).

## Für Entwickler {#for-developers}

Code: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts), [`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts), [`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts), [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`), [`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Was ein Auto in einem Moment ist {#what-a-car-is-at-a-moment}

`stateAt` interpoliert jeden Kanal zwischen den beiden Proben um die Zeit der Runde. Kanäle, die springen (Gang, Flaggen), nehmen die nächste Probe. Eine Runde, die beendet ist, parkt auf der Linie.

**Kurswinkel.** Die Fahrtrichtung kommt aus Positionen, die einige Meter auseinanderliegen (mindestens 2 m auf jeder Seite, damit ein Wackeln das Auto nicht dreht). Der Kurswinkel der Karosserie kommt nur dann aus dem Gierwinkel des Spiels, wenn dieser an die Fahrtrichtung angepasst ist – Vorzeichen und Versatz, durch den zirkularen Mittelwert über Proben schneller als 10 m/s (mindestens 20) – und nur, wenn er dann damit übereinstimmt (zirkulare Varianz unter 0,05, etwa 18° Streuung); sonst zeigt die Karosserie entlang der Fahrtrichtung. So bleibt ein Rutschen sichtbar (Karosserie und Fahrtrichtung auseinander), ohne einer Winkelkonvention des Spiels zu trauen.

**Lenkung und Seiten.** Welche Richtung ein positiver Lenkeinschlag das Auto dreht und auf welcher Seite die rechten Räder des Spiels liegen, wird aus der Runde gemessen: die Lenkung gegen das Kurven des Pfades und welche Seite der Federung bei Kurven außen einfedert (ohne Federungsdaten gelten Forza-Spiele als gespiegelt).
