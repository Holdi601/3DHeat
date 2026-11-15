---
title: "Welt-Hintergrund"
parent: "Levels und Hintergrundgeometrie"
nav_order: 5
has_children: true
lang: "de"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Welt-Hintergrund

Ein Welt-Hintergrund legt den echten Boden unter eine Flugaufzeichnung: Hügel, Straßen, Flüsse, Flugplätze und Gebäude, aus frei verfügbaren offenen Kartendaten. Nutze ihn, wenn eine Tacview-Aufzeichnung sonst über einem leeren Raster schweben würde. Er ist ein [Level](glossary.md), daher liegen die Hitze und die Figuren darauf.

## Einen bauen {#build-one}

1. Lade eine Flugaufzeichnung, die angibt, wo auf der Erde sie stattfand (eine Tacview-Datei `.acmi`), oder lade nichts und wähle in Schritt 3 einen Schauplatz. Siehe [Daten laden](getting-data-in.md).
2. Öffne **Hintergrund / Level** in der Seitenleiste.
3. Drücke **Welt-Hintergrund**, um den Boden unter deinen Daten zu bauen. Oder wähle unter **Schauplatz** eine Karte des Spiels und drücke **Schauplatz-Hintergrund bauen** (oder **Schauplatz streamen**).
4. Warte. Das Feld zeigt den Fortschritt (*Höhenkacheln*, *Kartenkacheln*, *Hintergrund wird gebaut*); **Abbrechen** stoppt den Vorgang.
5. Flieg herum. Der Quellenhinweis zu den Kartendaten steht unten rechts in der Ansicht.

Der erste Aufbau lädt einige zehn Megabyte herunter. Der Browser behält sie, daher lädt ein zweiter Aufbau desselben Gebiets nichts herunter. **Kartenkacheln vergessen** löscht sie. Die Schaltfläche **Welt-Hintergrund** erscheint nur, wenn die geladenen Daten eine geografische Bezugsgröße haben (unten).

Alles wird in einem Hintergrundprozess gebaut ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Das Ergebnis ersetzt das aktuelle Level und verhält sich wie jedes [3D-Level](model-levels.md): Es verdeckt die Hitze dahinter, wird vom Schnitt beschnitten, hat die [Darstellungsoptionen](level-appearance.md) und kann in der [Bibliothek](level-library.md) gespeichert werden.

## Wo die Daten liegen: der geografische Bezug {#where-the-data-is-the-geographic-reference}

Ein Datensatz bekommt einen geografischen Bezug nur von einer Quelle, die einen angibt:

- **Eine ACMI-Aufzeichnung**: deren Kopfzeile `ReferenceLatitude` und `ReferenceLongitude`, und Positionen, die der Leser auf die Ebene projiziert, die dort das WGS84-Ellipsoid berührt (X nach Osten, Y nach Norden, in Metern; die Höhen sind die Flughöhe der Aufzeichnung über dem Meeresspiegel). Der Bezug bleibt erhalten, wenn die Zuordnung **X** und **Y** als Bodenachsen nimmt – das tun die eigenen Hinweise der Aufzeichnung –, und er entfällt, wenn der Boden aus einer anderen Spalte kommt, etwa aus der flachen Welt **U** und **V** eines Spiels.
- **Eine Parquet-Tabelle, deren `heat3d`-Hinweise einen Eintrag `geo` haben** – die DCS-, MSFS-, X-Plane- und IL-2-(Tacview-)Tabellen des [Watchers](https://github.com/Holdi601/3DHeat-Watcher). Der Eintrag ist unter [Für Entwickler](#for-developers) beschrieben.

Beim Laden mehrerer Dateien bleibt der Bezug nur erhalten, wenn alle denselben haben. Jeder andere Lader ist davon nicht betroffen und hat keinen Bezug.

Der Hintergrund wird genauso projiziert und danach durch die Achsenzuordnung des Ladens geschickt, sodass er unter den Daten landet, welche Spiegelung oder Skalierung die Zuordnung auch anwendet.

## Schauplätze {#theatres}

Die Auswahl **Schauplatz** listet die echten Karten von DCS World (Kaukasus, Nevada, Normandie 2, Der Kanal, Syrien, Persischer Golf, Marianen, Marianen WWII, Südatlantik, Sinai, Afghanistan, Kola, Deutschland Kalter Krieg, Irak) und IL-2 Great Battles (Stalingrad, Moskau, Kuban, Rheinland, Normandie, Prochorowka, Welikije Luki, Arras, Odessa, Finnischer Meerbusen / Leningrad, Korea), jeweils mit seinem Kasten auf der Erde ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Die DCS-Kästen sind die Ausdehnungen der Editoren, aus den veröffentlichten Projektionen berechnet; die IL-2-Kästen und die als solche markierten DCS-Kästen sind Schätzungen aus den veröffentlichten Kartengrößen und den Ortschaften an ihren Rändern – das Feld sagt, welche es sind.

**Schauplatz-Hintergrund bauen** baut zwei Detailstufen in einem Netz:

| Stufe | Gebiet | Gelände | Karte |
|---|---|---|---|
| Schauplatz | der ganze Kasten | die tiefste Zoomstufe bis 10, die höchstens 64 Höhenkacheln braucht (etwa 3 km pro Eckpunkt über dem Kaukasus, 1 km über der Normandie) | das Meer, Seen, Bodenbedeckung und Autobahnen aus höchstens 64 Vektorkacheln bei Zoom 4 bis 9 |
| Detailbereich | **Unter den Daten**, **Um einen Punkt** (Breite, Länge, 12 bis 400 km) oder keiner | bis Zoom 12 in höchstens 100 Kacheln, höchstens 500.000 Eckpunkte | alles Obige, aus höchstens 1.500 Vektorkacheln in der tiefsten Zoomstufe bis 14, die passt |

Der Detailbereich schneidet ein Loch in das Gitter des Schauplatzes, auf ganze Zellen verbreitert, damit beide Gitter ihre Randlinien teilen, und eine dünne Wand schließt die Naht, wo die Höhen unterschiedlich abgetastet werden.

Mit geladenen Daten wird der Schauplatz auf der Ebene der Daten gebaut, sodass er genau dort landet, wo er gebaut wurde. Ohne Daten wird er um den eigenen Bezugspunkt des Schauplatzes gebaut (ganze Grad nahe seinem Detailbereich). Werden später Daten mit einem anderen Bezug geladen – eine ACMI-Datei nennt ihren eigenen –, wandert der Hintergrund unter sie: Die genaue Verschiebung zwischen beiden Projektionen wird auf einem Gitter von 256 × 256 Punkten über dem Hintergrund berechnet und zwischen den Knoten abgelesen, auf einen oder zwei Meter genau über einen ganzen Schauplatz ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Ein in der Bibliothek gespeicherter Hintergrund behält seinen Platz und wandert beim Laden unter anderen Daten genauso.

### Einen Schauplatz streamen {#streaming-a-theatre}

**Schauplatz streamen** zeigt den Schauplatz so, wie es ein Kartenbetrachter eines Flugsimulators tut: Der Boden kommt als viele kleine Kacheln um die Kamera, die beim Fliegen geladen und entfernt werden, sobald sie außer Reichweite sind ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Ein Quadtree aus Web-Mercator-Kacheln.** Die Wurzeln bei Zoom 5 decken 1.500 km um die Kamera ab, sodass der Boden über den Kasten des Schauplatzes bis zum Horizont reicht. Eine Kachel teilt sich in ihre vier Unterkacheln, solange die Kamera näher als das 1,4-Fache ihrer Breite ist, bis hinunter zu Zoom 15 (etwa 1 km pro Kachel, 15 m zwischen den Geländepunkten): Die Detailstufe nimmt mit der Entfernung ab, so wie auf dem Bildschirm.
- **Jede Kachel ihr eigenes Netz**, in einem Hintergrundprozess gebaut ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): ein Geländegitter von 65 × 65 Punkten mit einem Rand ringsum (damit Nachbarn mit unterschiedlicher Detailstufe nie einen Riss zeigen), darauf gemalte Bodenbedeckung und das Meer, darüber Straßen, Bahnlinien, Seen, Flüsse, Flugplätze, vermessene Landebahnen und Gebäude, und optional das Satellitenbild ihres Quadrats. Der Renderer zeichnet die Kacheln mit dem Aussehen und den Tiefenregeln des Levels, sodass sie die Hitze dahinter genauso verdecken wie jedes Level.
- **Grob zuerst.** Die Kacheln werden grob und nahe zuerst angefragt, vier Downloads gleichzeitig pro Quelle; solange die Unterkacheln einer Kachel laden, steht die Kachel an ihrer Stelle, sodass die Ansicht sofort gefüllt ist und dann schärfer wird.
- **Speicher**: Fertige Kacheln werden bis 600 MB behalten; die zuletzt gezeichnete fällt zuerst weg. **Downloads** bleiben im Kachel-Cache, der auf ein Budget von 2 GB begrenzt ist, die älteste fällt zuerst heraus: Zurückfliegen über ein Gebiet kostet nichts, und es gibt keine Obergrenze pro Aufbau.
- **In der Bibliothek gespeichert** als das, was gestreamt wird – der Schauplatz, seine Optionen und sein Platz auf der Erde –, nicht als Kacheln: Beim Laden wird neu gestreamt, aus dem Kachel-Cache, wo die Kacheln noch vorhanden sind. Klicks und der Inspektor treffen die Kacheln wie bei jedem Level.
- Beide Renderer zeichnen die Kacheln: nebeneinander auf einer echten Grafikkarte geprüft (WebGPU und WebGL2 auf derselben Karte), auch mit Hitze, die hinter einem Grat verborgen ist.
- Mit geladenen Daten werden die Kacheln auf der Ebene der Daten gebaut; Daten, die später auf einer anderen Ebene geladen werden, bauen sie dort neu (aus dem Cache).
- Gemessen an synthetischen Flügen über drei Orten (Normandie, Nevada, Syrien): etwa 63, 45 und 24 MB beim ersten Besuch mit Bildern; ein zweiter Besuch lädt nichts herunter.

## Was gebaut wird {#what-is-built}

| Teil | Quelle | Wie |
|---|---|---|
| Bilder (gestreamte Schauplätze, optional) | EOX Sentinel-2 cloudless 2016 | **Satellitenbild** legt das wolkenfreie Mosaik von 2016 (etwa 10 m pro Pixel, Zoom 14, tiefere Kacheln vergrößern es) über den Boden, anstelle der gemalten Bodenbedeckung; Straßen, Landebahnen, Gebäude und Namen bleiben obenauf. |
| Feinere Bilder (USA, Frankreich) | USGS National Map Orthobilder; IGN BD ORTHO | Mit **Satellitenbild** an nimmt eine Kartenkachel ab Zoom 13, die ganz innerhalb der zusammenhängenden USA oder des französischen Mutterlands liegt, stattdessen das nationale Orthofoto, zwei Zoomstufen tiefer als die Kachel (sechzehn ihrer Kacheln zu einem Bild zusammengelegt, nah dran etwa 1–2 m pro Pixel). Überall sonst EOX. |
| Gelände (gestreamte Schauplätze) | Mapterhorn | Copernicus GLO-30 überall (etwa 19 m pro Pixel bei Zoom 12), im Meterbereich, wo die eigene Vermessung eines Landes vorliegt (Frankreich, die USA und andere); zwei Zoomstufen gröber gelesen als jede Kachel. Die AWS Terrain Tiles, falls Mapterhorn nicht erreichbar ist. |
| Gelände | AWS Terrain Tiles (Terrarium-PNG) | Ein Höhengitter über dem Kasten: Die Zoomstufe ist die tiefste bis 12 (etwa 28 m pro Pixel auf 43° N), die höchstens 36 Kacheln braucht, und das Gitter wird auf höchstens 400.000 Eckpunkte ausgedünnt. Gezeichnet als Boden mit den üblichen Reliefhinweisen. |
| Straßen, Bahnlinien | OpenFreeMap-Vektorkacheln, Ebene `transportation` | Flache Bänder, auf das Gelände gelegt, auf dessen Abstand verdichtet und um einige Prozent davon angehoben, damit sie nicht mit ihm flimmern. Breiten nach Klasse, von 16 m (Autobahn) bis 3 m (Piste, Schiene); nie schmaler als die Diagonale des Kastens / 5000. Wege, Fähren und Tunnel bleiben weg. |
| Flugplätze | Ebene `aeroway` | Polygone von Landebahn, Rollbahn, Vorfeld und Hubschrauberlandeplatz, als Boden auf das Gelände gelegt; Landebahn- und Rollbahnlinien als 45 m und 18 m breite Bänder. |
| Wasser | Ebene `water` | Das Meer flach bei 0 m, Seen und Teiche flach auf ihrem niedrigsten Ufer, Flüsse auf das Gelände gelegt. Gezeichnet als Wasser: flach schattiert, ohne Höhenlinien. |
| Bodenbedeckung | Ebenen `landcover` und `landuse` | Auf die eigenen Eckpunkte des Geländes gemalt, ohne zusätzliche Dreiecke: Wälder, Wiesen und Parks grün, Ackerland strohfarben, Feuchtgebiet, Sand, Fels, Eis; Wohn-, Industrie-, Gewerbe-, Militär- und Steinbruchflächen in gedämpften Tönen. Wasser wird auch unter der Wasserfläche gemalt, damit das Ufer aus jeder Höhe lesbar ist. Nackter Boden bekommt eine ruhige Höhentönung (Flachland graugrün, Hochland braun, Schnee über 3.000 m). Lesbar bei der Auflösung des Geländes: etwa 30–45 m im Detailbereich, Kilometer im Schauplatz. |
| Ortsnamen | Ebenen `place` und `aerodrome_label` | Städte, Ortschaften und Dörfer sowie Flugplätze mit ihrem ICAO-Code, über die Ansicht geschrieben; wie viele Arten gezeigt werden, wächst mit der Kamerahöhe, höchstens 70 gleichzeitig. |
| Vermessene Landebahnen | [OurAirports](https://ourairports.com/data/) `runways.csv` (gemeinfrei) | Optional (**Landebahnen von OurAirports**, standardmäßig an): jede offene Landebahn, deren beide Enden in der Liste stehen, von Schwelle zu Schwelle in ihrer angegebenen Breite, mit seitlichen Streifen, gestrichelter Mittellinie und Schwellenbalken. Eine Liste von 4 MB, einmal geladen und im Cache behalten. |
| Gebäude | Ebene `building` | Grundrisse, von `render_min_height` bis `render_height` (fehlt er, 6 m) über dem tiefsten Boden darunter hochgezogen; Teile mit `hide_3d` werden übersprungen. Gezeichnet als Bauwerke. |

Vektorkacheln werden bei Zoom 14 gelesen (der einzige Zoom mit Gebäuden), wenn der Kasten höchstens 300 davon braucht, sonst bei der tiefsten Zoomstufe, die das schafft, bis hinunter zu 8. Ein größeres Gebiet bekommt nur das Gelände.

### Aussehen {#look}

Ein Hintergrund startet mit **Aufgenommene Farbe zeigen** an. Die Farbe sagt, welche Straße hell ist und auf dem grauen Boden liegt, welche Landebahn dunkel ist und welche Vorfeld. Dazu kommen abgeschaltete Dreieckskanten des Bodens, da ein regelmäßiges Gitter nichts aussagt, schwache Höhenlinien, ein undurchsichtiges Meer (ein Boden darunter würde in der Ferne mit der Oberfläche um die Tiefe kämpfen) und Gebäude in Hellgrau, fast massiv, wie eine Karte sie zeichnet. Das offene Meer bekommt überhaupt keine Bodendreiecke. Alles andere hat das Standard-Aussehen eines Modell-Levels.

## Quellenhinweise auf der Leinwand {#credits-on-the-canvas}

Solange ein Hintergrund das Level ist, steht der Quellenhinweis seiner Quellen unten rechts in der Ansicht, ohne dass man klicken muss, damit Bildschirmfotos und gerenderte Videos ihn enthalten:

> OpenFreeMap © OpenMapTiles · Daten © OpenStreetMap-Mitwirkende · Höhen: Terrain Tiles – SRTM, GMTED2010, 3DEP mit freundlicher Genehmigung des U.S. Geological Survey; ETOPO1: NOAA; und andere

Jeder Teil verlinkt auf die Quellenseite seines Anbieters (openstreetmap.org/copyright und die [Liste der Quellenhinweise](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) der Terrain Tiles). Ein in der Bibliothek gespeicherter Hintergrund behält seine Hinweise und zeigt sie beim Laden wieder. Der Text wird mit der Anzeige übersetzt; die Namen nicht.

## Quellen und ihre Bedingungen {#sources-and-their-terms}

Jede Quelle, ihre Lizenz und wie der Hintergrund innerhalb der Bedingungen bleibt: [Welt-Hintergrund: Quellen und Bedingungen](world-backdrop-sources.md).

## Der Kachel-Cache {#the-tile-cache}

Jede Kachel und das TileJSON der Vektorkacheln wird im Cache API des Browsers unter `3dheat-world-tiles-v1` gehalten, nach URL. Ein zweiter Aufbau desselben Gebiets stellt gar keine Anfragen und funktioniert offline: Das TileJSON wird zuerst angefragt, und schlägt das fehl, nennt seine zwischengespeicherte Kopie die Kacheln, die schon vorhanden sind. Kacheln, die der Server nicht hat (offenes Meer, 404), werden ebenfalls als fehlend gemerkt.

Die URLs der Vektorkacheln tragen das Build-Datum der Karte. Sobald OpenFreeMap einen neuen Build veröffentlicht, lädt der nächste Hintergrund frische Kacheln herunter, und die alten bleiben, bis der Cache geleert wird. Der Cache ist auf 2 GB begrenzt: Darüber hinaus werden zuerst die Kacheln gelöscht, die am längsten gespeichert sind. **Kartenkacheln vergessen** löscht den ganzen Cache. Der Cache braucht einen sicheren Ursprung (`https://` oder `localhost`); anderswo lädt jeder Aufbau neu herunter.

## Verglichen mit Tacview {#compared-with-tacview}

Mit dem Auge geprüft, an je einem Ort pro Schauplatz, mit synthetischen Aufzeichnungen: Die Startläufe liegen auf den Mittellinien der gezeichneten Landebahnen, Küstenübergänge fallen auf die Küste. Die Seite von Tacview stammt aus seiner Dokumentation und seinen veröffentlichten Screenshots (tacview.net, seine Steam-Seite), nicht aus einem eigenen Lauf hier.

| | Tacview 1.9 | Dieser Hintergrund, gestreamt |
|---|---|---|
| Ausdehnung | der ganze Globus | 1.500 km um die Kamera, wo immer sie ist |
| Gelände | ETOPO1 (etwa 1,25 km) eingebaut; SRTM 25–75 m, wenn der Nutzer die Dateien installiert; DCS-Gelände aus DCS exportiert | Copernicus GLO-30 (Mapterhorn), im Meterbereich in Frankreich und den USA |
| Bilder | keine eingebaut; Texturen, die der Nutzer herunterlädt (Mapview, SAS Planet, Erweiterungen wie eine VFR-Karte des Kaukasus) | EOX Sentinel-2 cloudless 2016, etwa 10 m, gestreamt |
| Bodenbedeckung | keine, außer in einer Textur | aus OpenStreetMap, auf das Gelände gemalt (ohne Bilder) |
| Straßen, Bahnlinien | keine, außer in einer Textur | jede Klasse nah bei der Kamera, Hauptstraßen weit weg |
| Gebäude | keine | extrudierte Grundrisse nah bei der Kamera |
| Flugplätze | Beschriftungen und Landebahnen als flache Kästen, ohne Markierungen | Landebahnen von vermessenen Enden mit seitlichen Streifen, Mittellinie und Schwellenbalken; Rollbahnen, Vorfelder; Namen mit ICAO-Codes |
| Ortsnamen | einige Dorf- und Stadtbeschriftungen | Städte, Ortschaften, Dörfer, Flugplätze, nach Entfernung und Höhe |

Wo es noch zurückbleibt:

- **Auflösung der Bilder**: Außerhalb der USA und Frankreichs ist das 10-m-Satellitenmosaik unter etwa 2 km weich; Tacview mit einer vom Nutzer installierten Textur der Zoomstufe 17 ist dort schärfer.
- **Gelände in der eigenen Form von DCS**: Tacview kann das Gelände zeigen, das DCS selbst exportiert; hier ist es die echte Erde, die dort vom DCS-Gelände abweicht, wo die Modellierer der Karte es verändert haben.
- **Krümmung**: Der Boden ist eine flache Ebene, daher ist der Horizont nicht der einer gekrümmten Erde; Tacview zeichnet eine Kugel.
- **Geschwindigkeit**: Der erste Besuch eines Ortes lädt zehn Megabyte, bevor er scharf ist; in einem Browser mit Softwarerendering (den Screenshots) zeichnet er mit einigen Bildern pro Sekunde und mehreren hundert Kacheln.

## Grenzen und was später kommt {#limits-and-what-comes-later}

- **Auflösung des Geländes**: etwa 30 m im besten Fall, und in großen Gebieten gröber. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs auf AWS, ohne Schlüssel, ein fester Quellenhinweis) ist die bessere Quelle: 30 m überall, GLO-90 dort, wo GLO-30 Lücken hat (Armenien und Aserbaidschan, die DCS Kaukasus abdeckt). Sie braucht einen GeoTIFF-Leser und wird noch nicht genutzt.
- **Besseres Gelände**: Copernicus GLO-30 auf AWS sendet keine CORS-Header, daher kann ein Browser sie nicht lesen; die Spiegelung von OpenTopography kann gelesen werden (CORS und Bereiche), aber deren Bedingungen für die Laufzeitnutzung einer öffentlichen App sind unbekannt – vor jeder Nutzung zu klären. Mapterhorn enthält GLO-30 bereits.
- **Krümmung**: Der Boden ist eine flache Ebene, und die Höhen werden nicht für die Krümmung der Erde abgesenkt; das entspricht der Art, wie die Aufzeichnungen platziert werden (Höhe als Höhe). Weit vom Bezugspunkt driften beide gemeinsam, unter einem Tausendstel bei 100 km. Nur die Kacheln zu biegen würde sie weit draußen von den Daten trennen, daher wird das nicht angeboten. Ein gekrümmter Horizont braucht denselben Abfall – Abstand von der Kamera zum Quadrat geteilt durch den doppelten Erdradius – in jedem Durchgang, der eine Position zeichnet (Level, Kacheln, Hitze, Linien, Kästen, Beschriftungen, Auswahl), als eine gemeinsame Uniform. Ein echter Globus braucht erdzentrierte Positionen auch für die Daten und eine kamerarelative Darstellung. Beides ist mit dem Globusmodus geplant.
- **Nur die heutige Welt**: Die historischen Karten von DCS und IL-2 (Normandie 2, Der Kanal, Deutschland Kalter Krieg, jede IL-2-Karte) werden mit den heutigen Ortschaften, Straßen und Küsten gezeichnet; das Feld sagt es. Zeitgenössische Flugplätze werden nicht gezeichnet.
- **Kein Globusmodus**: Ein Hintergrund ist eine flache lokale Ebene. Eine Ansicht der ganzen Erde ist geplant.
- Straßen werden in großen Gebieten verbreitert, damit sie sichtbar bleiben; aus der Nähe sind sie breiter als im Leben.
- DCS-Schauplatznamen in den Tabellen des Watchers werden so zugeordnet, wie DCS sie in `mission.theatre` angibt; ein Name, der nicht in der Liste steht, fällt auf den ersten Fix gerundet auf ganze Grad zurück und nur auf Breite und Länge.

## Historische Karten (noch nicht gebaut) {#historical-maps-not-built-yet}

Zeitgenössische Karten könnten die historischen Schauplätze später als Textur bekommen. Die Serien des US Army Map Service (AMS) sind Werke der US-Bundesregierung und gelten allgemein als gemeinfrei (prüfe den Nachweis jedes Scans; viele sind Nachdrucke britischer GSGS- oder deutscher Originale, deren Crown-Copyright bzw. Schutzfrist für anonyme Werke ebenfalls abgelaufen ist):

| Schauplatz | Serie | Wo gescannt |
|---|---|---|
| IL-2 Stalingrad, Moskau, Kuban, Welikije Luki, Prochorowka, Leningrad | AMS **N501**, Osteuropa 1:250.000 (in den 1950er Jahren aus sowjetischen und deutschen Karten zusammengestellt) | UT Austin PCL; einige Blätter bei UT GeoData georeferenziert |
| IL-2 Normandie, DCS Normandie 2 und Der Kanal | AMS **M661** / GSGS 4250, Frankreich 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 und **M841** 1:25.000 (Deutschland) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50.000 (Ausgaben von 1951) und **L552** 1:250.000 | ANU Open Research (L751-Blätter, „copyright expired“), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britische Schützengrabenkarten des Ersten Weltkriegs (nicht AMS) | McMaster University; National Library of Scotland (nicht-kommerzielle Bedingungen) |

AMS-Blätter tragen Breiten- und Längenmarken an ihren Ecken, sodass jedes durch eine Anpassung über vier Ecken eingeordnet und als Textur auf das Gelände gelegt würde, lokal gebaut und gespeichert wie die Kacheln.

## Für Entwickler {#for-developers}

### Der Eintrag `geo` in einer Parquet-Tabelle {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` und `up` benennen die Spalten, die Meter nach Osten und Norden auf derselben Tangentialebene bei (`lat0`, `lon0`) und die Höhe enthalten. Die Ladung trägt den Bezug, wenn ihre Zuordnung genau diese Spalten nimmt (Osten als X, Norden und Höhe als Y und Z, in beiderlei Reihenfolge). Der optionale Eintrag `dcs` benennt die eigenen Meter einer DCS-Tabelle (x nach Norden, y nach oben, z nach Osten) und ihren Schauplatz; eine Ladung, die diese Spalten zuordnet, wird stattdessen über die transversale Mercator-Projektion des Schauplatzes platziert ([DCS-Koordinaten](#dcs-coordinates)). Eine Tabelle ohne `geo` wird wie bisher gelesen.

### DCS-Koordinaten {#dcs-coordinates}

Jeder DCS-Schauplatz ist eine transversale Mercator-Projektion (WGS84, Maßstab 0,9996) mit eigenem Mittelmeridian und eigenem falschen Ursprung; DCS x ist der Nordwert, z der Ostwert. Die Konstanten sind jene, die das pydcs-Projekt veröffentlicht; die Mathematik ist Krügers Reihe bis zur sechsten Ordnung (Karney 2011), nach [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts) übertragen. Ein Hintergrund für DCS-Meter wird direkt in ihnen gebaut, sodass eine Watcher-DCS-Tabelle, die über `dcs_x`/`dcs_y`/`dcs_z` zugeordnet wird, ein Level, das der DCS-Geländekonverter geschrieben hat, und der Hintergrund alle denselben Rahmen teilen. Die Konstanten für den Irak sind nicht veröffentlicht; sie sind an veröffentlichten Referenzpunkten angepasst (4 cm mittlerer quadratischer Fehler).

Die DCS-Tabellen des Watchers liegen auf einer Tangentialebene am festen Bezugspunkt des Schauplatzes (demselben Punkt, den die Schauplatzauswahl oben nutzt), sodass mehrere Missionen auf einem Schauplatz mit ihrem Bezug zusammengeführt werden und sich mit einem Schauplatz-Hintergrund ausrichten, ohne ihn zu verschieben.

### Vereinfachung und Budget {#simplification-and-budget}

- Gebäude unter 20 m² werden weggelassen; 60 m², wenn der Kasten mehr als 30 km breit ist, 150 m² jenseits von 80 km. Die übrigen werden vom größten zum kleinsten hinzugefügt, bis die Gebäude 1,5 Mio. Dreiecke erreichen.
- Nebenstraßen, Zufahrten und Pisten werden jenseits von 60 km Kastenbreite weggelassen; jenseits von 150 km bleiben nur Autobahnen sowie Haupt- und Landstraßen.
- Der ganze Hintergrund bleibt unter etwa 3 Mio. Dreiecken. Der Importhinweis sagt, wie viele Gebäude weggelassen wurden.
