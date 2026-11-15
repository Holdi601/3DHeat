---
title: "Décor du monde réel : sources et conditions"
parent: "Décor du monde réel"
grand_parent: "Niveaux et géométrie de fond"
nav_order: 1
lang: "fr"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Décor du monde réel : sources et conditions

Les données cartographiques d’un [décor du monde réel](world-backdrop.md) viennent de services ouverts. Cette page énumère chaque source, sa licence, et la façon dont 3DHeat reste dans les conditions d’utilisation.

| Source | Conditions (telles que lues le 7 novembre 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - tuiles vectorielles au schéma OpenMapTiles, issues d’OpenStreetMap, build courant nommé par `https://tiles.openfreemap.org/planet` | Gratuit, sans clé, usage commercial autorisé. Les [conditions](https://openfreemap.org/tos/) interdisent de collecter des données « de façon automatisée, sauf pour des téléchargements hors ligne » : une application peut laisser les utilisateurs télécharger une zone pour un usage hors ligne si chaque téléchargement fait au plus 3 000 tuiles ou 50 Mo, avec au plus 4 requêtes en parallèle, et avec un User-Agent qui identifie l’application. L’attribution est obligatoire : « OpenFreeMap © OpenMapTiles Data from OpenStreetMap » (la partie OpenFreeMap est facultative). Le service peut prendre fin sans préavis. |
| Données [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Les récupérer à l’exécution et les dessiner localement relève d’un usage privé ; la vue dessinée est une œuvre produite qui exige une mention visible, de même que les captures d’écran et les vidéos qui en sont tirées. |
| Schéma [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 pour le schéma ; mention « © OpenMapTiles ». |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Publié dans le domaine public ; sans clé. La mention « Runways: OurAirports (public domain) » est affichée par courtoisie. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | La couche 2016 est en CC BY 4.0 (les années suivantes sont en CC BY-NC-SA, non utilisées). La page du service d’EOX invite à utiliser les points d’accès dans les applications, comme un service de démonstration sans garantie et avec une limitation de débit ; elle ne dit rien sur la mise en cache, que la CC BY autorise. Mention, affichée sur la toile : « EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017) », avec lien. CORS : l’origine de la requête est renvoyée. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP sans perte de 512 px encodé en Terrarium, sans clé, CORS ouvert. Sources sous CC BY, domaine public et licences ouvertes semblables (aucune non commerciale ni à partage à l’identique) ; mention « © Mapterhorn » et, pour la couche mondiale, « produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA ». Aucune politique d’usage publiée pour le point d’accès public. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) orthoimagerie, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS : « La plupart des informations de l’U.S. Geological Survey (USGS) relèvent du domaine public et peuvent être utilisées sans restriction » ; l’USGS demande une mention, par exemple « (nom du produit ou des données) courtesy of the U.S. Geological Survey ». Le service nomme sa source « USDA, USGS The National Map: Orthoimagery » (USDA NAIP, également une œuvre fédérale du domaine public) ; c’est la mention affichée. Sans clé, CORS ouvert. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Les conditions de la Géoplateforme indiquent le WMTS comme « Non soumis à limite d’usage » (pas de limite d’usage ; le WMS est limité à 40-50 requêtes par seconde) ; les données sont « soumises à la licence choisie et renseignée par le Fournisseur de données », par défaut la Licence Ouverte d’Etalab, sous laquelle la BD ORTHO est ouverte depuis 2021 ; les utilisateurs doivent « ne pas nuire, entraver ou fausser le bon fonctionnement des API ». La mise en cache n’est pas traitée ; la Licence Ouverte autorise la réutilisation avec mention de la source : « Orthophotos : © IGN – BD ORTHO, Licence Ouverte 2.0 ». Sans clé, CORS ouvert. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Données ouvertes de nombreuses sources, chacune avec sa propre mention ([liste](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)) ; sans clé, sans garantie de service, servi avec CORS ouvert. Les altitudes se décodent en `R × 256 + G + B / 256 − 32768` mètres. |

## Comment le décor reste dans ces conditions {#how-the-backdrop-stays-inside-those-terms}

- Un décor posé sous un enregistrement télécharge au plus 36 tuiles d’altitude et 300 tuiles vectorielles ; un théâtre construit une fois, au plus 64 + 100 tuiles d’altitude et 64 + 1 500 tuiles vectorielles ; un théâtre en flux, une tuile de chaque source à la fois par tuile de carte, au fil de la caméra. Quatre requêtes à la fois par source.
- **Un théâtre construit une fois est un seul téléchargement**, et les téléchargements ne dépassent pas 1 000 tuiles vectorielles ou 40 Mo (les conditions d’OpenFreeMap autorisent 3 000 tuiles ou 50 Mo). Les tuiles sont demandées en commençant par le centre ; au-delà du quota, la construction ne prend que les tuiles déjà en cache et indique combien restent à venir. Reconstruire récupère le lot suivant, et ainsi de suite : une grande zone arrive par morceaux, chacun mis en cache.
- Mesuré sur des vols synthétiques : un théâtre avec une zone détaillée de 25 km prend environ 370 tuiles et 20 Mo la première fois. Reconstruit, ou survolé à nouveau, rien n’est téléchargé.
- Les tuiles ne sont téléchargées que lorsque l’on appuie sur **Décor du monde réel**, jamais en arrière-plan.
- Un navigateur ne laisse pas une page définir son propre User-Agent ; les requêtes portent celui du navigateur, et l’origine de la page en `Origin`/`Referer`. Une version de bureau de la visionneuse devrait envoyer le sien.
- **Rien dérivé d’OpenStreetMap n’est jamais livré** avec la visionneuse ni versionné dans son dépôt : le partage à l’identique de l’ODbL s’applique à une base dérivée distribuée. Les décors sont construits sur la machine de l’utilisateur et ne sont gardés que dans ce navigateur (le cache de tuiles et, si on l’enregistre, la bibliothèque de niveaux).
