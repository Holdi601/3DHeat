---
title: "Welt-Hintergrund – Quellen und Begriffe"
parent: "Welt-Hintergrund"
grand_parent: "Levels und Hintergrundgeometrie"
nav_order: 1
lang: "de"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Welt-Hintergrund: Quellen und Bedingungen

Die Kartendaten eines [Welt-Hintergrunds](world-backdrop.md) kommen von offenen Diensten. Diese Seite listet jede Quelle, ihre Lizenz und wie 3DHeat innerhalb der Bedingungen bleibt.

| Quelle | Bedingungen (gelesen am 7. November 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - Vektor-Kacheln im OpenMapTiles-Schema aus OpenStreetMap, aktueller Stand unter `https://tiles.openfreemap.org/planet` | Kostenlos, kein Schlüssel, kommerzielle Nutzung erlaubt. Die [Bedingungen](https://openfreemap.org/tos/) verbieten das Sammeln von Daten „auf automatisierte Weise, außer für Offline-Downloads“: Eine App darf Nutzern erlauben, einen Bereich zur Offline-Nutzung herunterzuladen, wenn jeder Download höchstens 3.000 Kacheln oder 50 MB umfasst, mit höchstens 4 parallelen Anfragen und einem User-Agent, der die App nennt. Eine Namensnennung ist Pflicht: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (der Teil OpenFreeMap ist optional). Der Dienst kann ohne Vorankündigung enden. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)-Daten | ODbL 1.0. Sie zur Laufzeit zu holen und lokal zu zeichnen ist private Nutzung; die gezeichnete Ansicht ist ein Produced Work, das eine sichtbare Nennung braucht, und ebenso Screenshots und Videos, die daraus entstehen. |
| [OpenMapTiles](https://openmaptiles.org)-Schema | CC BY 4.0 für das Schema; Nennung „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Gemeinfrei veröffentlicht; kein Schlüssel. Die Nennung „Runways: OurAirports (public domain)“ wird aus Höflichkeit angezeigt. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Die Ebene von 2016 ist CC BY 4.0 (spätere Jahre sind CC BY-NC-SA und werden nicht genutzt). Die Dienstseite von EOX lädt ein, die Endpunkte in Anwendungen zu nutzen, als Demo-Dienst ohne Garantie und mit Ratenbegrenzung; sie sagt nichts über Zwischenspeicherung, die CC BY erlaubt. Nennung, auf der Leinwand angezeigt: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, verlinkt. CORS: Der Ursprung der Anfrage wird zurückgegeben. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kodiertes, verlustfreies WebP mit 512 px, kein Schlüssel, offenes CORS. Quellen unter CC BY, gemeinfreien und ähnlichen offenen Lizenzen (keine nicht-kommerziellen oder Share-alike-Lizenzen); Nennung „© Mapterhorn“ und für die globale Ebene „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Keine veröffentlichte Nutzungsrichtlinie für den öffentlichen Endpunkt. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map)-Orthobilder, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Die meisten Informationen des U.S. Geological Survey (USGS) sind gemeinfrei und dürfen ohne Einschränkung genutzt werden“; der USGS bittet um Nennung, zum Beispiel „(Produkt- oder Datenname) courtesy of the U.S. Geological Survey“. Der Dienst nennt seine Quelle „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, ebenfalls ein gemeinfreies Bundeswerk); das ist die angezeigte Nennung. Kein Schlüssel, offenes CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Die Bedingungen der Géoplateforme nennen den WMTS „Non soumis à limite d'usage“ (keine Nutzungsgrenze; WMS ist auf 40-50 Anfragen pro Sekunde begrenzt); die Daten sind „soumises à la licence choisie et renseignée par le Fournisseur de données“, standardmäßig die Etalab Licence Ouverte, unter der BD ORTHO seit 2021 offen ist; Nutzer müssen „ne pas nuire, entraver ou fausser le bon fonctionnement des API“ (die API nicht beschädigen, behindern oder verfälschen). Zwischenspeicherung wird nicht geregelt; die Licence Ouverte erlaubt die Weiterverwendung mit genannter Quelle: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0“. Kein Schlüssel, offenes CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Offene Daten aus vielen Quellen, jede mit eigener Nennung ([Liste](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); kein Schlüssel, keine Dienstgarantie, mit offenem CORS ausgeliefert. Höhen werden als `R × 256 + G + B / 256 − 32768` Meter dekodiert. |

## Wie der Hintergrund innerhalb dieser Bedingungen bleibt {#how-the-backdrop-stays-inside-those-terms}

- Ein Hintergrund unter einer Aufnahme lädt höchstens 36 Höhenkacheln und 300 Vektorkacheln; ein einmal gebautes Theater höchstens 64 + 100 Höhenkacheln und 64 + 1.500 Vektorkacheln; ein gestreamtes Theater jeweils eine Kachel jeder Quelle pro Kartenkachel, während sich die Kamera bewegt. Vier Anfragen gleichzeitig pro Quelle.
- **Ein einmal gebautes Theater ist ein einziger Download**, und Downloads umfassen höchstens 1.000 Vektorkacheln oder 40 MB (die Bedingungen von OpenFreeMap erlauben 3.000 Kacheln oder 50 MB). Kacheln werden zuerst in der Mitte angefragt; über das Kontingent hinaus nimmt der Aufbau nur Kacheln, die schon im Cache sind, und sagt, wie viele noch fehlen. Ein erneuter Aufbau holt den nächsten Abschnitt, und so weiter: Ein großer Bereich kommt in Stücken an, jedes im Cache gespeichert.
- Gemessen an synthetischen Flügen: Ein Theater mit einem 25 km großen detaillierten Bereich braucht beim ersten Mal etwa 370 Kacheln und 20 MB. Wird es erneut gebaut oder fliegt man zurück darüber, wird nichts heruntergeladen.
- Kacheln werden nur geladen, wenn **Welt-Hintergrund** gedrückt wird, nie im Hintergrund.
- Ein Browser erlaubt einer Seite nicht, ihren eigenen User-Agent zu setzen; die Anfragen tragen den des Browsers und den Ursprung der Seite als `Origin`/`Referer`. Eine Desktop-Version des Viewers sollte ihren eigenen senden.
- **Nichts, was aus OpenStreetMap abgeleitet ist, wird je** mit dem Viewer ausgeliefert oder in sein Repository übernommen: Das Share-alike von ODbL gilt für eine verteilte abgeleitete Datenbank. Hintergründe werden auf dem Rechner des Nutzers gebaut und nur in diesem Browser gehalten (der Kachel-Cache und, wenn gespeichert, die Level-Bibliothek).
