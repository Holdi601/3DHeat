---
title: "3D-Levels"
parent: "Levels und Hintergrundgeometrie"
nav_order: 2
lang: "de"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D-Levels

Ein 3D-Level ist ein Modell des Ortes – Hügel, Straßen, Gebäude –, in dem deine Daten liegen. Damit siehst du, auf welchem Stockwerk, Hügel oder Dach die Heat liegt. Der Viewer teilt es in Boden (massiv), Strukturen (durchsichtig, damit du hineinsehen kannst) und Wasser.

## Ein 3D-Level laden {#load-a-3d-level}

1. Lade zuerst deine Daten ([Daten hineinbekommen](getting-data-in.md)). Das Modell muss denselben Weltraum und dieselbe Einheit wie die Daten nutzen, Y oben.
2. Wähle unter **Hintergrund / Level** ein **Vereinfachungsziel**. Lass es auf *Voll – keine Vereinfachung*, außer das Modell ist riesig.
3. Drück **3D-Modell…** und wähle eine Datei `.glb`, `.gltf`, `.obj`, `.stl` oder `.ply`.
4. Warte auf die Fortschrittszeile. **Abbrechen** stoppt sie.
5. Drück **F** in der Ansicht. Der Boden ist massiv, Strukturen sind durchsichtige Hüllen, Wasser ist flach.
6. Stell das Aussehen in [Level-Darstellung](level-appearance.md) ein. Drück **In Bibliothek speichern**, um das Ergebnis zu behalten ([Level-Bibliothek](level-library.md)).

![Ein 3D-Level geladen: undurchsichtiger Boden mit Höhenlinien, durchsichtige Gebäude, flaches Wasser](../assets/img/en/model-levels-loaded.webp)

**3D-Modell…** lädt das Netz des Levels. Es wird in einem Hintergrund-Worker geparst, klassifiziert und vereinfacht ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) – mit einer Fortschrittszeile und **Abbrechen**: *Modell wird gelesen*, *Datei wird geparst*, *N Texturen werden gepackt*, *N Teile werden klassifiziert*, *Boden wird vereinfacht (N Dreiecke)*, *Strukturen werden vereinfacht (N Dreiecke)*, *Drahtgitter wird aufgebaut*.

## Formate {#formats}

| Format | Was gelesen wird | Grenzen |
|---|---|---|
| `.glb` | Jedes Netzprimitiv mit `mode` 4 (Dreiecke) oder ohne Modus, mit der Welttransformation jedes Knotens; `POSITION`; `COLOR_0` (vec3 oder vec4) als Eckpunktfarbe; die `baseColorTexture` des Materials und ihre `TEXCOORD_n` als Textur; Knoten- und Netznamen als Teilnamen. | Linien und Punkte werden übersprungen. |
| `.gltf` | Dasselbe. | Nur mit eingebetteten Puffern: Ein glTF, das auf eine externe `.bin` verweist, wird mit *Als einzelne .glb exportieren, damit die Geometrie eingebettet ist.* abgelehnt. |
| `.obj` | Flächen, mit den Blöcken `o` und `g` als Teile. | Nur Geometrie (keine Materialien). |
| `.stl` | Binär und ASCII (`solid …`). | Ein Teil. |
| `.ply` | Nur ASCII. | Binäres PLY wird mit *In .glb oder binäres .stl umwandeln.* abgelehnt. |

Nur Geometrie: Positionen, Normalen und Dreiecke, verschmolzen in einen Puffer, dazu Farben und Texturkoordinaten, wo vorhanden ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Ein Modell ohne Dreiecke wird abgelehnt. Das Modell muss im selben Weltraum und in derselben Einheit wie die Daten liegen (Y oben): Nichts wird verändert, um es passend zu machen.

## Boden, Strukturen und Wasser {#ground-structures-and-water}

Ein Level wird beim Import in drei Klassen geteilt, weil sie entgegengesetzt behandelt werden müssen ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Boden** – undurchsichtig gezeichnet und mit Reliefhinweisen schattiert (Neigung, Höhenlinien, eine Höhenrampe), damit man die Position daran ablesen kann.
- **Strukturen** – Gebäude und Requisiten stehen zwischen der Kamera und der Heat darin, daher werden sie als **durchsichtige Hülle** gezeichnet (schwache Flächen mit hellem Rand, dazu entdoppelte Kanten) – oder, wenn sie texturiert sind, massiv in ihren Texturen.
- **Wasser** – flach, ohne Geländehinweise: Eine Höhenlinie quer über einen See ergibt keinen Sinn.

Jeder Teil (Knoten eines glTF, Objekt oder Gruppe einer OBJ) wird für sich klassifiziert, nach der ersten Regel, die zutrifft:

1. **Die Beschriftung des Exporters.** Ein Name, der mit `ground:`, `structure:` oder `water:` beginnt (oder mit `|` statt `:`), gilt wörtlich. Die eigenen Exporter des Projekts beschriften jeden Teil so.
2. **Wassernamen.** `water` als eigenes Wort (nicht *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Bodennamen.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Strukturnamen.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrie.** Ein Teil, das mehr als 25 % der X-Z-Fläche der Karte bedeckt und dessen Dreiecksfläche zu mehr als 60 % nach oben zeigt, ist Boden. Ein Teil mit weniger als 45 % nach oben oder höher als 15 % der Levelhöhe, bei weniger als 10 % der Fläche, ist eine Struktur. Der Anteil nach oben wird nach Fläche gewichtet, damit ein Haus nicht als flach gilt, weil es ein Dach hat.
6. **Sonst Boden** – ein mehrdeutiger Teil wird als Boden angenommen, weil eine fast unsichtbare Hülle als Standard das Level wie einen Darstellungsfehler aussehen ließe.

Ein Modell, das aus einem einzigen Teil besteht, das als Struktur klassifiziert wurde, wird stattdessen zu Boden (*einzelnes unbenanntes Netz – als Boden behandelt*).

### Navigationsnetze {#navigation-meshes}

Ein Teil mit dem Namen `nav:…` (ein `nav:walkable` des Level-Exporters) ist ein Navigationsnetz: Dort kann ein Soldat stehen. Es wird als Boden geführt (*Navigationsnetz – nicht gezeichnet, da es auf dem Boden liegt; Klicks finden es trotzdem*), aber **nicht gezeichnet**. Es liegt über dem Boden, aus dem es erzeugt wurde, auf den Zentimeter genau in derselben Ebene, und wenn es als Boden gezeichnet würde, kämpften die beiden Flächen um jeden Pixel: Auf einem Level mit eingebackener Bodentextur zeigte sich das ganze spielbare Gebiet als scharf begrenzte Flecken aus Grau und Beige, einer je Navigationsdreieck. Es wird unvereinfacht behalten, damit das [Klick-zum-Auswählen](camera.md#click-to-pick) sagen kann, ob eine Stelle begehbar ist. Bibliothekseinträge behalten es nicht.

**Teil-Klassifizierung anzeigen (N)** im Panel (bei Modellen mit mehr als einem Teil) listet jedes Teil mit seiner Klasse und dem Grund auf – *vom Exporter beschriftet*, *Name passt zum Muster*, *deckt X % der Karte, Y % nach oben*, *Y % nach oben, Z % der Levelhöhe*, *mehrdeutig – als Boden angenommen*. Um eines zu ändern, benenne das Teil im Quellmodell um und importiere erneut; die Aufteilung ist in die Indexpuffer eingebacken.

## Vereinfachung {#simplification}

**Vereinfachungsziel** legt das Dreiecksbudget für den nächsten Import fest ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Einstellung | Dreiecke |
|---|---|
| *Voll – keine Vereinfachung* (Standard) | alle |
| *Hoch – 8 Mio. Dreiecke* | 8.000.000 |
| *Mittel – 3 Mio. Dreiecke* | 3.000.000 |
| *Niedrig – 800 Tsd. Dreiecke* | 800.000 |
| *Silhouette – 100 Tsd. Dreiecke* | 100.000 |

Das Budget wird **zu 60 % auf Strukturen und zu 40 % auf den Boden** verteilt und getrennt vereinfacht – Strukturen verlieren ihre Form bei der Dezimierung am schnellsten. Wasser wird nicht vereinfacht. Die Vereinfachung ist Kantenkollaps mit Quadrik-Fehlermaßen ([meshoptimizer](https://github.com/zeux/meshoptimizer), über WebAssembly), nach dem Verschmelzen zusammenfallender Eckpunkte, damit Silhouetten und harte Kanten erhalten bleiben. Die Importnotiz meldet `source → now triangles, deviation X%`, die Aufteilung auf Boden, Strukturen und Wasser über die Teile und – wenn *Voll* bei einem Modell über 8 Mio. Dreiecken benutzt wurde – schlägt *Hoch* (bis 30 Mio.) oder *Mittel* (darüber) vor. Ohne WebAssembly ist der Vereinfacher nicht verfügbar, und der Import sagt das.

Levels aus den eigenen Exportern des Projekts sind schon budgetiert; das Ziel ist für rohe Kunst gedacht, hinter der kein Budget steht.

## Texturen {#textures}

Ein `.glb`, dessen Teile Basisfarben-Texturen tragen, wird in ihnen gezeichnet – ein Export einer Rennstrecke zum Beispiel trägt eine je Geländekachel und eine je platziertem Modell.

Die Bodentextur wird standardmäßig gezeigt, wenn sie vorhanden ist; Strukturen mit Texturen beginnen **massiv, in ihren eigenen Texturen** (Bordsteine, Leitplanken, Reifenwände und Schilder sind die Ränder einer Straße, keine Gebäude zum Hineinsehen), mit ausgeschaltetem Drahtgitter und ausgeschalteter flacher Schattierung. Siehe [Level-Darstellung](level-appearance.md).

## Große Levels {#large-levels}

- Ab **300.000** Dreiecken der Strukturen sind die Strukturkanten zunächst aus und die Flächendeckkraft bei 35 %: Mit einer Kante in jedem Pixel wirkt das Viertel wie eine flache weiße Fläche.
- Die ferne Ebene der Kamera weitet sich, um das Level zu umfassen ([Levels](levels.md#what-a-level-does-for-the-heat)).

## Für Entwickler {#for-developers}

### Textur-Atlas {#texture-atlas}

Jede Textur wird im Import-Worker in **einen Atlas** gepackt ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), damit das Level auf beiden Backends ein Zeichnen, einen Sampler und ein Texturkoordinaten-Attribut bleibt:

- in Reihen gepackt, jedes Bild in seiner eigenen Größe, nur verkleinert, wenn der Satz in keiner Richtung in **8192 px** passt (die Standard-Texturgrößengrenze von WebGPU);
- ein **16-Pixel-Rand** um jedes Bild, und nur die 5 Mip-Stufen, die dieser Rand schützt, damit ein fernes Schild nie die Textur seines Nachbarn abtastet;
- **wiederholende Texturen** bleiben wiederholend. Ein Bild, dessen glTF-Sampler wiederholt (der glTF-Standard) und dessen Texturkoordinaten 0..1 verlassen – eine Ziegelwand, deren UV von 0 bis 40 entlang läuft –, wird zu einer *Kachel*: Ihre Eckpunkte behalten ihre eigenen Koordinaten und eine 16-Bit-Kachelnummer, und die Shader umschließen die Koordinate pro Pixel in das Rechteck der Kachel, wobei die Mip-Stufe aus der nicht umschlossenen Koordinate kommt, damit keine Nähte sichtbar werden. Der Rand einer Kachel enthält ihre eigene gegenüberliegende Kante. Eine Achse, deren Sampler klemmt, wird geklemmt; ein Bild, dessen Koordinaten in 0..1 bleiben, wird wie bisher gezeichnet. Ein Level mit Kacheln kostet 4 Bytes je Eckpunkt mehr.

### Der Exporter-Vertrag {#the-exporter-contract}

Was der Viewer von einem Level braucht, egal, wer es gemacht hat:

- eine einzelne, in sich geschlossene `.glb`;
- `POSITION` als float32, Dreiecks-Primitive;
- Knotennamen `ground:*`, `structure:*` und `water:*` (alles andere wird nach den obigen Regeln klassifiziert), und `nav:*` für ein Navigationsnetz, das behalten, aber nicht gezeichnet wird;
- Koordinaten im Weltraum, **Y oben**, in derselben Einheit wie die Telemetrie, damit die Daten ohne Platzierungsschritt auf dem Level liegen.
