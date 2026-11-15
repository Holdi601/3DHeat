---
title: "Fondo del mundo: fuentes y términos"
parent: "Fondo del mundo"
grand_parent: "Niveles y geometría de fondo"
nav_order: 1
lang: "es"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Fondo del mundo real: fuentes y condiciones

Los datos del mapa de un [fondo del mundo real](world-backdrop.md) proceden de servicios abiertos. Esta página enumera cada fuente, su licencia y cómo 3DHeat se mantiene dentro de sus condiciones.

| Fuente | Condiciones (según se leyeron el 7 de noviembre de 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - teselas vectoriales con el esquema de OpenMapTiles a partir de OpenStreetMap, versión actual indicada por `https://tiles.openfreemap.org/planet` | Gratuito, sin clave, uso comercial permitido. Las [condiciones](https://openfreemap.org/tos/) prohíben recoger datos «de forma automatizada, salvo para descargas sin conexión»: una aplicación puede permitir a los usuarios descargar una zona para uso sin conexión si cada descarga es de como máximo 3.000 teselas o 50 MB, hecha con como máximo 4 peticiones en paralelo, y con un User-Agent que identifique la aplicación. Se exige atribución: «OpenFreeMap © OpenMapTiles Data from OpenStreetMap» (la parte de OpenFreeMap es opcional). El servicio puede terminar sin aviso. |
| Datos de [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Obtenerlos en tiempo de ejecución y dibujarlos localmente es uso privado; la vista dibujada es una Obra Producida que necesita un crédito visible, y lo mismo las capturas de pantalla y los vídeos hechos a partir de ella. |
| Esquema de [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 para el esquema; crédito «© OpenMapTiles». |
| `runways.csv` de [OurAirports](https://ourairports.com/data/) | Publicado en el dominio público; sin clave. Se muestra como cortesía el crédito «Runways: OurAirports (public domain)». |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | La capa de 2016 es CC BY 4.0 (los años posteriores son CC BY-NC-SA, que no se usan). La página del servicio de EOX invita a usar los puntos de acceso en aplicaciones, como servicio de demostración sin garantía y con límite de peticiones; no dice nada sobre la caché, que CC BY permite. Crédito, mostrado en el lienzo: «EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)», con enlace. CORS: se devuelve el origen de la petición. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP sin pérdida de 512 px codificado en Terrarium, sin clave, CORS abierto. Fuentes bajo CC BY, dominio público y licencias abiertas similares (ninguna no comercial ni de compartir igual); crédito «© Mapterhorn» y, para la capa global, «produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA». No hay una política de uso publicada para el punto de acceso público. |
| Ortoimagen de [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map), `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: «La mayor parte de la información del U.S. Geological Survey (USGS) pertenece al dominio público y puede usarse sin restricciones»; pide crédito, por ejemplo «(nombre del producto o de los datos) courtesy of the U.S. Geological Survey». El servicio nombra su fuente «USDA, USGS The National Map: Orthoimagery» (USDA NAIP, también una obra federal de dominio público); ese es el crédito que se muestra. Sin clave, CORS abierto. |
| BD ORTHO de la [Géoplateforme del IGN](https://cartes.gouv.fr/cgu), `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Las condiciones de la Géoplateforme indican que el WMTS está «Non soumis à limite d'usage» (sin límite de uso; el WMS está limitado a 40-50 peticiones por segundo); los datos están «soumises à la licence choisie et renseignée par le Fournisseur de données», por defecto la Licence Ouverte de Etalab, bajo la cual BD ORTHO es abierta desde 2021; los usuarios deben «ne pas nuire, entraver ou fausser le bon fonctionnement des API». La caché no se trata; la Licence Ouverte permite la reutilización citando la fuente: «Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0». Sin clave, CORS abierto. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Datos abiertos de muchas fuentes, cada una con su propio crédito ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); sin clave, sin garantía de servicio, servido con CORS abierto. Las alturas se decodifican como `R × 256 + G + B / 256 − 32768` metros. |

## Cómo se mantiene el fondo dentro de esas condiciones {#how-the-backdrop-stays-inside-those-terms}

- Un fondo bajo una grabación descarga como máximo 36 teselas de elevación y 300 teselas vectoriales; un teatro construido una vez, como máximo 64 + 100 teselas de elevación y 64 + 1.500 teselas vectoriales; un teatro en streaming, una tesela de cada fuente cada vez por cada tesela del mapa, a medida que avanza la cámara. Cuatro peticiones a la vez por fuente.
- **Un teatro construido una vez es una sola descarga**, y las descargas son como máximo de 1.000 teselas vectoriales o 40 MB (las condiciones de OpenFreeMap permiten 3.000 teselas o 50 MB). Las teselas se piden primero desde el centro; al superar el cupo, la construcción solo toma las teselas que ya están en la caché y dice cuántas quedan por llegar. Al construir de nuevo se obtiene el siguiente bloque, y así sucesivamente: una zona grande llega por partes, y cada una se guarda en caché.
- Medido con vuelos sintéticos: un teatro con una zona detallada de 25 km tarda unas 370 teselas y 20 MB la primera vez. Si se vuelve a construir, o si se vuelve a sobrevolar, no se descarga nada.
- Las teselas solo se descargan al pulsar **Fondo del mundo real**, nunca en segundo plano.
- Un navegador no deja que una página fije su propio User-Agent; las peticiones llevan el del navegador, y el origen de la página como `Origin`/`Referer`. Una versión de escritorio del visor debería enviar el suyo.
- **Nunca se incluye en el visor ni se sube al repositorio nada derivado de OpenStreetMap**: la cláusula de compartir igual de ODbL se aplica a una base de datos derivada que se distribuye. Los fondos se construyen en la máquina del usuario y se guardan solo en ese navegador (la caché de teselas y, si se guarda, la biblioteca de niveles).
