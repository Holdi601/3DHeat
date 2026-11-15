---
title: "Sfondo del mondo - fonti e termini"
parent: "Sfondo del mondo"
grand_parent: "Livelli e geometria di sfondo"
nav_order: 1
lang: "it"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Sfondo del mondo - fonti e termini

I dati cartografici di uno [sfondo del mondo](world-backdrop.md) provengono da servizi aperti. Questa pagina elenca ciascuna fonte, la sua licenza e come 3DHeat resta entro i termini.

| Fonte | Termini (come letti il 7 novembre 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - tessere vettoriali nello schema OpenMapTiles da OpenStreetMap, build attuale indicata da `https://tiles.openfreemap.org/planet` | Gratuito, senza chiave, uso commerciale consentito. I [termini](https://openfreemap.org/tos/) vietano la raccolta di dati "in modi automatizzati, tranne per i download offline": un'app può permettere agli utenti di scaricare un'area per l'uso offline se ogni download è di al massimo 3.000 tessere o 50 MB, fatto con al massimo 4 richieste parallele, con uno User-Agent che identifica l'app. L'attribuzione è obbligatoria: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (la parte OpenFreeMap facoltativa). Il servizio può terminare senza preavviso. |
| Dati di [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Recuperarli a tempo di esecuzione e disegnarli in locale è uso privato; la vista disegnata è un'Opera Prodotta che richiede un credito visibile, e lo stesso vale per le schermate e i video ricavati da essa. |
| Schema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 per lo schema; credito "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Rilasciato nel pubblico dominio; nessuna chiave. Il credito "Runways: OurAirports (public domain)" viene mostrato per cortesia. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Il livello 2016 è CC BY 4.0 (gli anni successivi sono CC BY-NC-SA, non usati). La pagina del servizio di EOX invita a usare gli endpoint nelle applicazioni, come servizio demo senza garanzie e con limitazione della frequenza; non dice nulla sulla cache, che CC BY consente. Credito, mostrato sul canvas: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", con collegamento. CORS: l'origine della richiesta viene riflessa. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP senza perdita da 512 px codificato Terrarium, nessuna chiave, CORS aperto. Fonti sotto CC BY, pubblico dominio e licenze aperte simili (nessuna non commerciale o con condivisione allo stesso modo); credito "© Mapterhorn" e, per il livello globale, "prodotto usando Copernicus WorldDEM-30 © DLR e.V. 2010-2014 e © Airbus Defence and Space GmbH 2014-2018 fornito nell'ambito di COPERNICUS dall'Unione europea e dall'ESA". Nessuna politica d'uso pubblicata per l'endpoint pubblico. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofoto, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "La maggior parte delle informazioni dello U.S. Geological Survey (USGS) appartiene al Pubblico Dominio e può essere usata senza restrizioni"; chiede un credito, per esempio "(nome del prodotto o dei dati) courtesy of the U.S. Geological Survey". Il servizio indica la sua fonte come "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, anch'essa un'opera federale di pubblico dominio); è il credito mostrato. Nessuna chiave, CORS aperto. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | I termini della Géoplateforme elencano il WMTS come "Non soumis à limite d'usage" (nessun limite d'uso; il WMS è limitato a 40-50 richieste al secondo); i dati sono "soumises à la licence choisie et renseignée par le Fournisseur de données", per impostazione predefinita la Licenza Aperta Etalab, con cui BD ORTHO è aperta dal 2021; gli utenti devono "ne pas nuire, entraver ou fausser le bon fonctionnement des API". La cache non è trattata; la Licenza Aperta consente il riuso citando la fonte: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Nessuna chiave, CORS aperto. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Dati aperti da molte fonti, ciascuna con il proprio credito ([elenco](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); nessuna chiave, nessuna garanzia del servizio, servito con CORS aperto. Le altezze si decodificano come `R × 256 + G + B / 256 − 32768` metri. |

## Come lo sfondo resta entro questi termini {#how-the-backdrop-stays-inside-those-terms}

- Uno sfondo sotto una registrazione scarica al massimo 36 tessere di altitudine e 300 tessere vettoriali; un teatro costruito una volta al massimo 64 + 100 tessere di altitudine e 64 + 1.500 tessere vettoriali; un teatro in streaming una tessera di ciascuna fonte alla volta per tessera della mappa, man mano che la telecamera si muove. Quattro richieste alla volta per fonte.
- **Un teatro costruito una volta è un unico download**, e scarica al massimo 1.000 tessere vettoriali o 40 MB (i termini di OpenFreeMap consentono 3.000 tessere o 50 MB). Le tessere vengono richieste prima quelle al centro; oltre il limite la costruzione prende solo le tessere già in cache e dice quante ne mancano ancora. Costruire di nuovo scarica il blocco successivo, e così via: un'area grande arriva a pezzi, ciascuno messo in cache.
- Misurato su voli sintetici: un teatro con un'area dettagliata di 25 km richiede circa 370 tessere e 20 MB la prima volta. Costruito di nuovo, o ripercorso all'indietro, non si scarica nulla.
- Le tessere vengono scaricate solo quando si preme **Sfondo del mondo**, mai in sottofondo.
- Un browser non permette a una pagina di impostare il proprio User-Agent; le richieste portano quello del browser, e l'origine della pagina come `Origin`/`Referer`. Una build desktop del visualizzatore dovrebbe inviare il proprio.
- **Nulla derivato da OpenStreetMap viene mai distribuito** con il visualizzatore né committato nel suo repository: la condivisione allo stesso modo di ODbL si applica a un database derivato distribuito. Gli sfondi vengono costruiti sulla macchina dell'utente e conservati solo in quel browser (la cache delle tessere e, se salvata, la libreria dei livelli).
