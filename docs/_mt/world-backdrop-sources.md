---
title: "Isfond tad-dinja - sorsi u termini"
parent: "Isfond tad-dinja"
grand_parent: "Livelli u ġeometrija tal-isfond"
nav_order: 1
lang: "mt"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Id-dinja vera bħala sfond: sorsi u termini

Id-dejta tal-mappa ta' [id-dinja vera bħala sfond](world-backdrop.md) ġejja minn servizzi miftuħa. Din il-paġna telenka kull sors, il-liċenzja tiegħu, u kif 3DHeat jibqa' ġewwa t-termini tiegħu.

| Sors | Termini (kif jinqraw fis-7 ta' Novembru 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - tiles vector fi skema OpenMapTiles minn OpenStreetMap, il-bini kurrenti msemmi mill-`https://tiles.openfreemap.org/planet` | Ħieles, bla ċavetta, użu kummerċjali permess. [it-termini](https://openfreemap.org/tos/) jipprojbixxu l-ġbir tad-dejta "b'modi awtomatiċi, ħlief għal tniżżil offline": app tista' tħalli lill-utenti jniżżlu żona għall-użu offline jekk kull tniżżil ikun l-iktar 3,000 tile jew 50 MB, magħmul b'l-iktar 4 talbiet paralleli, b'User-Agent li jidentifika l-app. Jeħtieġ attribuzzjoni: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (il-parti OpenFreeMap fakultattiva). Is-servizz jista' jieqaf mingħajr avviż. |
| Dejta ta' [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Li tiġbedha waqt it-tħaddim u tpittirha lokalment hu użu privat; il-veduta mpittra hi Produced Work li jrid kreditu viżibbli, u hekk ukoll l-screenshots u l-vidjows magħmulin minnha. |
| Skema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 għall-iskema; kreditu "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Maħruġ fid-dominju pubbliku; bla ċavetta. Il-kreditu "Runways: OurAirports (public domain)" jintwera bħala kortesija. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Is-saff tal-2016 hu CC BY 4.0 (is-snin ta' wara huma CC BY-NC-SA, mhux użati). Il-paġna tas-servizz ta' EOX tistieden l-użu tal-endpoints f'applikazzjonijiet, bħala servizz demo mingħajr garanzija u b'rate limiting; ma tgħid xejn dwar il-cache, li CC BY tippermettiha. Kreditu, muri fuq il-canvas: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", b'link. CORS: l-origin tat-talba jiġi rreġistrat mill-ġdid. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP 512 px bla telf, kodifikat Terrarium, bla ċavetta, CORS miftuħ. Sorsi taħt CC BY, dominju pubbliku u liċenzji miftuħa simili (ebda waħda mhix mhux kummerċjali jew share-alike); kreditu "© Mapterhorn" u, għas-saff globali, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Ebda politika ta' użu ppubblikata għall-endpoint pubbliku. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) orthoimagery, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"; jitlob kreditu, pereżempju "(Product or data name) courtesy of the U.S. Geological Survey". Is-servizz isemmi s-sors tiegħu "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, wkoll xogħol federali fid-dominju pubbliku); dak hu l-kreditu muri. Bla ċavetta, CORS miftuħ. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | It-termini tal-Géoplateforme jelenkaw il-WMTS bħala "Non soumis à limite d'usage" (ebda limitu ta' użu; WMS hu limitat għal 40-50 talba kull sekonda); id-dejta hi "soumises à la licence choisie et renseignée par le Fournisseur de données", b'default il-Licence Ouverte ta' Etalab, li taħtha BD ORTHO ilu miftuħ mill-2021; l-utenti għandhom "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Il-cache ma tiġix indirizzata; il-Licence Ouverte tippermetti l-użu mill-ġdid bil-kreditu tas-sors: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Bla ċavetta, CORS miftuħ. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Dejta miftuħa minn ħafna sorsi, kull wieħed b'kreditu tiegħu ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bla ċavetta, bla garanzija tas-servizz, imqassam b'CORS miftuħ. L-għoljiet jinkodifikaw bħala `R × 256 + G + B / 256 − 32768` metri. |

## Kif is-sfond jibqa' ġewwa dawk it-termini {#how-the-backdrop-stays-inside-those-terms}

- Sfond taħt reġistrazzjoni jniżżel l-iktar 36 tile tal-għoli u 300 vector tile; teatru mibni darba wahda l-iktar 64 + 100 tile tal-għoli u 64 + 1,500 vector tile; teatru stream-jat tul tile wieħed minn kull sors kull darba għal kull tile tal-mappa, hekk kif tmexxi l-kamera. Erba' talbiet kull darba għal kull sors.
- **Teatru mibni darba hu tniżżil wieħed**, u t-tniżżil hu l-iktar 1,000 vector tile jew 40 MB (it-termini ta' OpenFreeMap jippermettu 3,000 tile jew 50 MB). It-tiles jintalbu iċ-ċentru l-ewwel; wara l-kwota, il-bini jieħu biss tiles diġà fil-cache u jgħid kemm għad fadal. Bini mill-ġdid jiġbed il-biċċa li jmiss, u hekk 'il quddiem: żona kbira tasal f'biċċiet, kull waħda fil-cache.
- Imkejjel fuq titjiriet sintetiċi: teatru b'żona dettaljata ta' 25 km jieħu madwar 370 tile u 20 MB l-ewwel darba. Imibni mill-ġdid, jew imsegwi lura, ma jitniżżel xejn.
- Tiles jitniżżlu biss meta jiġi mgħaffeġ **Id-dinja vera bħala sfond**, qatt fil-background.
- Browser ma jħallix paġna tissettja l-User-Agent tagħha; it-talbiet iġorru dak tal-browser, u l-oriġini tal-paġna bħala `Origin`/`Referer`. Build tad-desktop tal-viewer għandu jibgħat tiegħu.
- **Xejn derivat minn OpenStreetMap qatt ma jinqara mal-viewer** jew ma jiġi kommess fir-repożitorju tiegħu: is-share-alike ta' ODbL japplika għal database derivat imqassam. Is-sfondi jinbnew fuq magna l-utent u jinżammu biss f'dak il-browser (il-cache tal-tiles u, jekk jiġu mħaffrin, il-librerija tal-livelli).
