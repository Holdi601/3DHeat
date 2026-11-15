---
title: "Diagramme und HUD"
parent: "Rennanalyse"
nav_order: 53
lang: "de"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagramme und HUD

Diagramme legen deine Runden Meter für Meter übereinander, damit du sehen kannst, wo ein Fahrer später gebremst oder früher vom Gas gegangen ist. Die Karten oben links in der Ansicht zeigen, was jedes Auto und jeder Fahrer gerade tut.

![Diagramme unter der Ansicht: Zeilen für Abstand, Geschwindigkeit, Gas, Bremse und Lenkung für zwei Runden, oben die Zeit- und Ursachenstreifen und der Cursor mit den Karten](../assets/img/en/race-charts-rows.webp)

## Die Diagramme {#the-charts}

Alle Runden auf einer gemeinsamen Entfernungsachse – Meter entlang der Referenz (siehe [eine Entfernungsachse](race-corner-analysis.md#one-distance-axis)) –, sodass dasselbe x für jede Runde derselbe Ort auf der Strecke ist. Eine Runde wird allein gezeichnet (und läuft ab); eine zweite Runde derselben Strecke wird gegen sie gezeichnet. Ohne geladene Runden (oder wenn die Analyse fehlgeschlagen ist) steht im Bereich: „Diagramme erscheinen, sobald eine Runde geladen ist; lade eine weitere Runde derselben Strecke, um die beiden zu vergleichen.“

### Was darauf zu sehen ist {#what-is-on-them}

- **Die Legende**: die Farbe und Bezeichnung jeder gezeichneten Runde, die Referenz mit „(Referenz)“ markiert; „+N weitere gezeichnet, nicht im Diagramm“, wenn mehr Runden sichtbar sind, als im Diagramm stehen; **Graphen (N) ▾**; **Ganze Runde**, solange hineingezoomt ist; eine Zeile Hilfetext.
- **Zwei Streifen** oben, für die fokussierte Runde:
  - *Zeit*: die [Zeitkarte](race-replay-and-scene.md#time-map-where) als Streifen, rot für Verlust, grün für Gewinn;
  - *Ursache*: jeder ihrer Verluste als Balken über dem Ort seiner Ursache, in der Ursachenfarbe; fährst du über einen Balken, erscheinen sein Titel und seine Kosten.
- **Kurvenbänder**: ein schattiertes Band vom Einfahrts- bis zum Ausfahrtspunkt jeder Kurve (wie auf der Referenz gefunden) und ihr Name (`T1` …) unter der Achse am Scheitelpunkt.
- **Der gewählte Befund**: ein Band in seiner Ursachenfarbe über seinem Bereich.
- **Die Zeilen** (Graphen), eine pro gewähltem Kanal, jede mit ihrem Namen und dem oberen und unteren Wert ihres Bereichs links, einer Nulllinie, wo der Bereich durch null geht. Jede Runde ist eine Linie in ihrer Farbe: die fokussierte Runde 2 px breit und deckend, die Referenz deckend, die anderen 1,5 px bei 75 %. Die Zeile Abstand lässt die Referenz weg (sie ist sich selbst gleich).
- **Der Cursor**: eine senkrechte Linie, wo das Referenzauto ist (oder wo der Zeiger ist), und ein Punkt pro Auto auf jeder Zeile außer dem Abstand – am Cursor steht jedes Auto auf demselben Meter; sonst die eigene Entfernung jedes Autos zur Replay-Uhr.

Höchstens **8** Runden werden gezeichnet: zuerst die fokussierte Runde, die Beste ihrer Klasse und die Referenz, dann die anderen in der Ladereihenfolge.

### Zeilen und ihre Höhen {#rows-and-their-heights}

Die Zeilen teilen sich die Höhe des Diagramms nach Gewicht, keine niedriger als 16 px:

| Zeile | Gewicht |
|---|---|
| Abstand (zur Referenz, Sekunden, mit Vorzeichen) | 1,7 |
| Geschwindigkeit (km/h) | 1,7 |
| ein Pedal (Gas, Bremse, Kupplung) | 1 |
| Lenkung | 1,1 |
| Gang | 0,8 |
| eine Leuchte (Handbremse, ABS …) | 0,55 |
| alles andere | 1 |

Ein Kanal mit einem festen Anzeigebereich in der Tabelle (Pedale 0–100 %) verwendet ihn; die anderen werden an den sichtbaren Ausschnitt der Runden angepasst. Ein Zeilenname, der für den Platz zu lang ist (ein langes Wort in einer anderen Sprache), rückt den oberen Wert eine Zeile tiefer, wenn die Zeile hoch genug ist, und wird mit Auslassungszeichen gekürzt, wo sie es nicht ist; der volle Name steht im Tooltip.

### Die Standardgraphen {#the-default-graphs}

Bis Graphen gewählt werden: der **Abstand**, dann jeder Kanal, den die Tabelle als `graph` markiert und den die Runden haben – Gas, Bremse, Kupplung, Handbremse, Lenkung, Gang, Geschwindigkeit –, außer dass ein Pedal- oder Leuchtenkanal weggelassen wird, wenn keine Runde ihn über 0,02 bewegt (eine nie betätigte Kupplung ist kein Graph). Die Reihenfolge ist die der Tabelle.

### Die Graphenauswahl {#the-graph-picker}

**Graphen (N) ▾** öffnet ein Feld über dem Knopf:

- ein Filterfeld (passt auf den Namen oder die Kennung eines Kanals);
- **Standard** (zurück zum Standardsatz; sein Tooltip sagt, wie viele es sind) und **Schließen**;
- *Abstand zur Referenz*, dann jeder Kanal, den die gezeichneten Runden haben, gruppiert (Bewegung, Eingaben, Motor, Hilfen, Reifen, Bremsen, Federung, Räder, anderes, Zeitnahme, Position), mit einem Kästchen je Kanal; ein Kanal pro Rad ist eine Zeile mit einem Chip pro Rad (FL, FR, RL, RR).

Das Anhaken behält die Reihenfolge der Tabelle, egal in welcher Reihenfolge angehakt wurde. Die Auswahl gilt, bis **Standard** gedrückt oder neu geladen wird. Kanäle, die die Tabelle nicht kennt, werden unter *anderes* angeboten, benannt aus ihrer eigenen Kennung („brakeLinePress“ → „Brake line press“).

### Hovern, Rad, Zoom, Klick {#hover-wheel-zoom-click}

| Eingabe | Wirkung |
|---|---|
| Darüberfahren | jedes Auto, seine Karte und seine Eingaben springen auf diesen Meter; ein Pfosten markiert ihn auf der Strecke; eine Tabelle listet den Wert jeder gezeichneten Runde auf jeder Zeile dort (Abstand als „ref“ für die Referenz); über den Karten „bei N m – der Cursor der Diagramme“. Wer die Fläche verlässt, übergibt wieder an das Replay |
| Rad | springt das Replay um 1/200 des sichtbaren Ausschnitts pro Raste die Runde entlang (Shift: 5-mal so weit) und hält das Replay an; im Zoom folgt die Ansicht dem Cursor |
| Strg+Rad (Cmd+Rad) | zoomt die Entfernungsachse um den Zeiger, 1,25-fach heraus / 0,8-fach hinein pro Raste, nie enger als 40 m; herauszoomen bis zur ganzen Runde beendet den Zoom |
| seitliches Rad | verschiebt im Zoom (10 % des Ausschnitts pro 100 Einheiten Scroll) |
| Doppelklick, **Ganze Runde** | herauszoomen |
| Klick | springt das Replay dorthin, wo die Referenz diesen Meter erreicht |
| Shift+Klick | richtet die Autos dort aus (siehe [Ausrichten](race-replay-and-scene.md#lining-up)) |

Die Diagramme werden neu in der aktuellen Sprache gezeichnet, wenn sie wechselt.

Die Hilfezeile in der Legende sagt dasselbe kurz: „Darüberfahren: alle Autos dort · Rad: entlang der Runde schreiten · Strg+Rad: zoomen · Klick: springen · Shift+Klick: ausrichten“.

## Die Autokarten (HUD) {#the-car-cards-hud}

Oben links in der Ansicht, eine Karte pro sichtbarer Runde – höchstens **6**, die ersten sechs sichtbaren Runden in der Ladereihenfolge – für den Moment, auf dem das Replay (oder der Cursor der Diagramme) steht.

**Kopfzeile:** die Farbe und Bezeichnung der Runde; der laufende Abstand – die Zeit dieser Runde, um ihre aktuelle Entfernung zu erreichen, minus die Zeit der Referenz für dieselbe Entfernung, „+0,48 s“ – oder „Referenz“; **⋯**, um jeden anderen Wert ein- oder auszublenden (dasselbe wie *Alle Werte auf den Karten*). Die Karte des verfolgten Autos ist hervorgehoben.

**Das Auto von oben:** der Umriss der Karosserie in der Farbe der Runde mit einem Pfeil vorn, vier Reifen (die vorderen bis zu 28° mit der Lenkung gedreht), jeder in der Farbe seiner Temperatur, mit denselben Symbolen wie das 3D-Auto, flach gezeichnet: Schlupfring, Federungsbalken, Bremsglühen, Verschleißband, Lastbalken.

**Anzeigen:** Geschwindigkeit in km/h, die eigene Zeit der Runde, ihre Entfernung entlang der Referenz.

**Eingaben:**

- ein Lenkrad, das durch die Lenkeingabe gedreht wird (voller Einschlag als 180° gezeichnet), mit dem Prozentwert darunter;
- ein Balken pro Pedal, von links nach rechts wie in einem Pedalkasten – Kupplung, Bremse, Gas –, jeder mit seinem Prozentwert und Kurznamen, in seiner Farbe (nur Pedale, die die Runde hat);
- der Gang (R für Rückwärts, N für Leerlauf);
- eine kleine Leuchte pro An/Aus-Kanal, den die Runde hat – Handbremse, ABS, TC, DRS, Boxenbegrenzer, in der Luft –, in ihrer Farbe leuchtend, wenn an (über der Hälfte ihres Bereichs);
- eine Anzeige pro Stufenkanal: Bremsverteilung, ABS- und TC-Einstellungen, Ladedruck, Kraftstoff.

**Der Eingabeverlauf:** die letzten **6 Sekunden** jedes Pedals (eine Spur, jede in ihrer Farbe) und der Lenkung (eigene Spur, mittig), der mit diesem Moment endet – was der Fahrer auf dem Weg dorthin getan hat. Bis zu 160 Punkte.

**Alle Werte** (⋯ oder *Alle Werte auf den Karten*): jeder andere skalare Wert, den die Runde in diesem Moment hat, danach jeder Kanal pro Rad als vier Werte (FL FR RL RR), benannt aus der Kanaltabelle oder aus dem eigenen Namen des Kanals, nach Gruppe geordnet.

## Für Entwickler {#for-developers}

Code: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Die Kanaltabelle {#the-channel-table}

`CHANNELS` in [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) ist die eine Stelle, an der ein Kanal beschrieben wird: seine Einheit, ob er ein Wert pro Messpunkt oder einer pro Rad ist (gespeichert als `name.FL` …), seine Gruppe, ein Anzeigebereich, wie er am Auto gezeichnet wird (`glyph`), wie er auf der Karte erscheint (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), ob er ein Standardgraph ist, ob er springt statt zu gleiten (Gang, Flags), und wie er angezeigt wird (Maßstab, Einheit, Stellen). Bezeichnungen und Kurznamen sind Meldungen in jeder Sprache (`race.channel.<name>.label` / `.short`).

Kanäle mit einer Zeichnung oder einem Standardgraphen:

| Kanal | Einheit | Gezeichnet als | Standardgraph |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | Pedal (grün, rot, …), angezeigt in % | ja |
| `handbrake` | 0..1 | Leuchte | ja |
| `steer` | -1..1, rechts positiv | Lenkrad | ja |
| `gear` | - | Gang | ja |
| `speed` | m/s, angezeigt km/h | - | ja |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | Leuchte | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | Stufenanzeige | - |
| `tireTemp` (pro Rad) | °C, Anzeige 40–130 | Reifenfarbe | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (pro Rad) | wie das Spiel es skaliert, Anzeige ±1,5 | Schlupfring | - |
| `combinedSlip`, `slipIndex` (pro Rad) | Anzeige 0–1,5, 0–1 | Schlupfring | - |
| `suspension` (pro Rad) | 0..1 | Federungsbalken | - |
| `brakeTemp` (pro Rad) | °C, Anzeige 100–900 | Bremsglühen | - |
| `tireWear` (pro Rad) | 0..1 | Verschleißband | - |
| `wheelLoad` (pro Rad) | N, Anzeige 0–12 000 | Lastbalken | - |

Andere in der Tabelle (als Graph und in der Liste, nicht gezeichnet): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (Driftwinkel), `loose`, `lateral` (Versatz zur Referenz), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, außerdem `time`, `distance`, `x`, `y`, `z`.

**Ein Kanal, der nicht in der Tabelle steht,** wird trotzdem gelesen, als Graph (unter *anderes*) gezeichnet und auf den Karten aufgelistet, mit seinem eigenen Namen beschriftet. **Um ihm einen richtigen Namen, eine Einheit und eine Zeichnung zu geben**, füge einen Eintrag in die Tabelle hinzu (und seine Bezeichnungsmeldung in jede `src/i18n/locales/<Sprache>/race-channels.json`). Eine neue *Art* Radzeichnung ist ein Eintrag in `WHEEL_GLYPHS` (glyph.ts) und dessen flaches Gegenstück `CARD_GLYPHS` (RaceHud.tsx); beide sind nach der Art typisiert, sodass der Build fehlschlägt, bis beide existieren. `src/race/extensible.test.ts` prüft, dass unbekannte Kanäle die Graphen erreichen, dass jedes Symbol der Tabelle gezeichnet werden kann und dass Leuchten aufleuchten.
