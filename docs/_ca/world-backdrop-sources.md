---
title: "Fons del món: fonts i termes"
parent: "Fons del món"
grand_parent: "Nivells i geometria de fons"
nav_order: 1
lang: "ca"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Fons del món real: fonts i condicions

Les dades del mapa d'un [fons del món real](world-backdrop.md) vénen de serveis oberts. Aquesta pàgina enumera cada font, la seva llicència, i com 3DHeat es manté dins de les condicions.

| Font | Condicions (tal com es llegeixen el 7 de novembre de 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - tessel·les vectorials amb l'esquema OpenMapTiles, a partir d'OpenStreetMap, versió actual indicada per `https://tiles.openfreemap.org/planet` | Gratuït, sense clau, ús comercial permès. Les [condicions](https://openfreemap.org/tos/) prohibeixen recollir dades "de manera automatitzada, excepte per a descàrregues fora de línia": una aplicació pot deixar que els usuaris baixin una zona per usar-la fora de línia si cada descàrrega té com a màxim 3.000 tessel·les o 50 MB, feta amb com a màxim 4 peticions en paral·lel, i amb un User-Agent que identifiqui l'aplicació. L'atribució és obligatòria: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (la part d'OpenFreeMap és opcional). El servei pot acabar sense avís. |
| Dades d'[OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Obtenir-les en temps d'execució i dibuixar-les localment és ús privat; la vista dibuixada és una Obra Produïda que necessita un crèdit visible, i també ho necessiten les captures de pantalla i els vídeos fets a partir d'ella. |
| Esquema d'[OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 per a l'esquema; crèdit "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Publicat en domini públic; sense clau. El crèdit "Runways: OurAirports (public domain)" es mostra com a cortesia. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | La capa de 2016 és CC BY 4.0 (els anys posteriors són CC BY-NC-SA, no s'usen). La pàgina del servei d'EOX convida a usar els punts d'accés en aplicacions, com a servei de demostració sense garantia i amb límits de peticions; no diu res sobre la memòria cau, que CC BY permet. Crèdit, mostrat al llenç: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", amb enllaç. CORS: es reflecteix l'origen de la petició. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP sense pèrdues de 512 px codificat en Terrarium, sense clau, CORS obert. Fonts sota CC BY, domini públic i llicències obertes similars (cap de no comercial o de compartir igual); crèdit "© Mapterhorn" i, per a la capa global, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". No hi ha una política d'ús publicada per al punt d'accés públic. |
| Ortofotografia de [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map), `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "La major part de la informació del Servei Geològic dels Estats Units (USGS) és de domini públic i es pot usar sense restriccions"; demana crèdit, per exemple "(nom del producte o de les dades) courtesy of the U.S. Geological Survey". El servei anomena la seva font "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, també una obra federal de domini públic); aquest és el crèdit que es mostra. Sense clau, CORS obert. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Les condicions de la Géoplateforme enumeren el WMTS com a "Non soumis à limite d'usage" (sense límit d'ús; el WMS està limitat a 40-50 peticions per segon); les dades són "soumises à la licence choisie et renseignée par le Fournisseur de données", per defecte la Licence Ouverte d'Etalab, amb la qual BD ORTHO és oberta des del 2021; els usuaris han de "ne pas nuire, entraver ou fausser le bon fonctionnement des API". La memòria cau no es tracta; la Licence Ouverte permet la reutilització amb la font acreditada: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Sense clau, CORS obert. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Dades obertes de moltes fonts, cadascuna amb el seu propi crèdit ([llista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); sense clau, sense garantia de servei, servit amb CORS obert. Les altures es descodifiquen com `R × 256 + G + B / 256 − 32768` metres. |

## Com el fons es manté dins d'aquestes condicions {#how-the-backdrop-stays-inside-those-terms}

- Un fons sota una gravació descarrega com a màxim 36 tessel·les d'altura i 300 de vectorials; un escenari construït una vegada com a màxim 64 + 100 tessel·les d'altura i 64 + 1.500 de vectorials; un escenari en streaming una tessel·la de cada font alhora per tessel·la de mapa, a mesura que avança la càmera. Quatre peticions alhora per font.
- **Un escenari construït una vegada és una sola descàrrega**, i les descàrregues són com a màxim 1.000 tessel·les vectorials o 40 MB (les condicions d'OpenFreeMap permeten 3.000 tessel·les o 50 MB). Les tessel·les es demanen primer pel centre; passat el límit, la construcció només fa servir tessel·les ja a la memòria cau i diu quantes encara han de venir. Tornar a construir obté el següent bloc, i així successivament: una zona gran arriba a trossos, cadascun guardat a la memòria cau.
- Mesurat amb vols sintètics: un escenari amb una zona detallada de 25 km ocupa unes 370 tessel·les i 20 MB la primera vegada. Construït de nou, o seguit després, no es descarrega res.
- Les tessel·les només es descarreguen quan es prem **Fons del món real**, mai en segon pla.
- Un navegador no deixa que una pàgina defineixi el seu propi User-Agent; les peticions porten el del navegador, i l'origen de la pàgina com a `Origin`/`Referer`. Una versió d'escriptori del visor hauria d'enviar el seu propi.
- **Mai no es distribueix amb el visor ni es puja al seu repositori res derivat d'OpenStreetMap**: la clàusula de compartir igual de l'ODbL s'aplica a una base de dades derivada distribuïda. Els fons es construeixen a la màquina de l'usuari i només es guarden en aquell navegador (la memòria cau de tessel·les i, si es desa, la biblioteca de nivells).
