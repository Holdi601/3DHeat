---
title: "Maailmataustan lähteet ja termit"
parent: "Maailmatausta"
grand_parent: "Kentät ja taustageometria"
nav_order: 1
lang: "fi"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Todellinen maailma taustana: lähteet ja ehdot

[Todellisen maailman taustan](world-backdrop.md) karttadata tulee avoimista palveluista. Tämä sivu luettelee jokaisen lähteen, sen lisenssin ja sen, miten 3DHeat pysyy ehdoissa.

| Lähde | Ehdot (luettu 7. marraskuuta 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – OpenMapTiles-skeeman vektoriruudut OpenStreetMapista, nykyinen koonti nimetty `https://tiles.openfreemap.org/planet` | Ilmainen, ei avainta, kaupallinen käyttö sallittu. [Ehdot](https://openfreemap.org/tos/) kieltävät datan keräämisen "automaattisin keinoin, paitsi offline-latauksiin": sovellus saa antaa käyttäjien ladata alueen offline-käyttöön, jos jokainen lataus on enintään 3 000 ruutua tai 50 MB, tehty enintään neljällä rinnakkaisella pyynnöllä ja User-Agentilla, joka tunnistaa sovelluksen. Lähdemaininta vaaditaan: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (OpenFreeMap-osa vapaaehtoinen). Palvelu voi päättyä ilman ilmoitusta. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)-data | ODbL 1.0. Sen hakeminen ajon aikana ja piirtäminen paikallisesti on yksityistä käyttöä; piirretty näkymä on Produced Work, joka vaatii näkyvän tunnustuksen, samoin siitä tehdyt kuvakaappaukset ja videot. |
| [OpenMapTiles](https://openmaptiles.org)-skeema | CC BY 4.0 skeemalle; maininta "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Julkaistu yleiseen omaisuuteen; ei avainta. Maininta "Runways: OurAirports (public domain)" näytetään kohteliaisuudesta. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Vuoden 2016 taso on CC BY 4.0 (myöhemmät vuodet ovat CC BY-NC-SA, eikä niitä käytetä). EOX:n palvelusivu kutsuu käyttämään päätepisteitä sovelluksissa demopalveluna ilman takuuta ja nopeusrajoituksin; se ei sano mitään välimuistista, minkä CC BY sallii. Maininta näytetään kankaalla: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", linkitettynä. CORS: pyynnön alkuperä kaiutetaan takaisin. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-koodattu 512 px häviötön WebP, ei avainta, avoin CORS. Lähteet ovat CC BY:n, yleisen omaisuuden ja vastaavien avointen lisenssien alaisia (ei yhtään ei-kaupallista tai jakoa vaativaa); maininta "© Mapterhorn" ja maailmanlaajuiselle tasolle "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Julkisella päätepisteellä ei ole julkaistua käyttökäytäntöä. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortokuvat, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"; se pyytää tunnustusta, esimerkiksi "(Product or data name) courtesy of the U.S. Geological Survey". Palvelu nimeää lähteensä "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, myös liittovaltion yleiseen omaisuuteen kuuluva teos); se on näytetty maininta. Ei avainta, avoin CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme-ehdot luettelevat WMTS:n kohdassa "Non soumis à limite d'usage" (ei käyttörajoitusta; WMS on rajattu 40–50 pyyntöön sekunnissa); data ovat "soumises à la licence choisie et renseignée par le Fournisseur de données", oletuksena Etalab Licence Ouverte, jonka alla BD ORTHO on ollut avoin vuodesta 2021; käyttäjien on "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Välimuistia ei käsitellä; Licence Ouverte sallii uudelleenkäytön lähdettä mainiten: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Ei avainta, avoin CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Avointa dataa monista lähteistä, joilla kullakin on oma mainintansa ([luettelo](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); ei avainta, ei palvelutakuuta, avoin CORS. Korkeudet puretaan muotoon `R × 256 + G + B / 256 − 32768` metreinä. |

## Miten taustakuva pysyy näissä ehdoissa {#how-the-backdrop-stays-inside-those-terms}

- Tallenteen alla oleva taustakuva lataa enintään 36 korkeusruutua ja 300 vektoriruutua; kerran rakennettu teatteri enintään 64 + 100 korkeusruutua ja 64 + 1 500 vektoriruutua; suoratoistettu teatteri yhden ruudun kustakin lähteestä kerrallaan karttaruutua kohden, kameran mukaan. Neljä pyyntöä kerrallaan lähdettä kohden.
- **Kerran rakennettu teatteri on yksi lataus**, ja lataukset ovat enintään 1 000 vektoriruutua tai 40 MB (OpenFreeMapin ehdot sallivat 3 000 ruutua tai 50 MB). Ruutuja pyydetään ensin keskustasta; sallitun määrän ylittyessä rakennus ottaa vain jo välimuistissa olevat ruudut ja kertoo, montako on vielä tulossa. Uudelleen rakentaminen hakee seuraavan erän, ja niin edelleen: suuri alue saapuu paloissa, joista jokainen on välimuistissa.
- Synteettisillä lennoilla mitattuna teatteri, jossa on 25 km:n yksityiskohtainen alue, vie ensimmäisellä kerralla noin 370 ruutua ja 20 MB. Kun se rakennetaan uudelleen tai lennetään takaisin yli, mitään ei ladata.
- Ruudut ladataan vain, kun **Maailman tausta** -painiketta painetaan, eikä koskaan taustalla.
- Selain ei anna sivun asettaa omaa User-Agentiaan; pyynnöt kantavat selaimen oman, ja sivun alkuperän `Origin`- ja `Referer`-otsikoissa. Katselijan työpöytäversion pitäisi lähettää oma.
- **OpenStreetMapista johdettua dataa ei koskaan toimiteta** katselijan mukana eikä talleteta sen repositorioon: ODbL:n jakamisvaatimus koskee jaettua johdettua tietokantaa. Taustakuvat rakennetaan käyttäjän omalla koneella ja säilytetään vain siinä selaimessa (ruutuvälimuisti ja, jos tallennettu, kenttäkirjasto).
