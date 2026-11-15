---
title: "Maailmataust - allikad ja mõisted"
parent: "Maailmataust"
grand_parent: "Tasemed ja taustgeomeetria"
nav_order: 1
lang: "et"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Maailma taust: allikad ja tingimused

[maailma tausta](world-backdrop.md) kaardiandmed tulevad avatud teenustest. See leht loetleb iga allika, selle litsentsi ja selle, kuidas 3DHeat jääb tingimuste piiridesse.

| Allikas | Tingimused (loetud 7. novembril 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - OpenStreetMapi andmetest OpenMapTiles-skeemi vektorplaadid, praegune versioon nimega `https://tiles.openfreemap.org/planet` | Tasuta, võtit pole, ärikasutus on lubatud. [Tingimused](https://openfreemap.org/tos/) keelavad andmete kogumise "automatiseeritud viisil, välja arvatud võrguühenduseta allalaadimised". Rakendus tohib lasta kasutajal ala võrguühenduseta alla laadida, kui iga allalaadimine on kuni 3000 plaati või 50 MB, tehakse kuni 4 paralleelse päringuga ja päringul on User-Agent, mis tuvastab rakenduse. Nõutav on viide: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (OpenFreeMapi osa on valikuline). Teenus võib ilma teatiseta lõppeda. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) andmed | ODbL 1.0. Andmete toomine käitusajal ja nende kohalik joonistamine on isiklik kasutus; joonistatud vaade on tuletatud teos, mis vajab nähtavat viidet, ja nii on ka sellest tehtud ekraanipildid ja videod. |
| [OpenMapTiles](https://openmaptiles.org) skeem | CC BY 4.0 skeemile; viide "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Avaldatud avalikus omandis; võtit pole. Viide "Runways: OurAirports (public domain)" kuvatakse viisakusest. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016. aasta kiht on CC BY 4.0 (hilisemad aastad on CC BY-NC-SA, neid ei kasutata). EOXi teenuselehel kutsutakse üles lõpp-punkte rakendustes kasutama demoteenusena, ilma garantiita ja kiiruspiiranguga; cache'imisest seal ei räägita, ja CC BY seda lubab. Viide, mis kuvatakse lõuendil: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", lingitud. CORS: päringu päritolu tagastatakse tagasi. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kodeeritud 512 px kadudeta WebP, võtit pole, avatud CORS. Allikad on CC BY, avaliku omandi ja sarnaste avatud litsentsidega (ükski pole mittekommertslik ega jagamisega-samadel-tingimustel). Viide "© Mapterhorn" ja globaalse kihi puhul "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Avaliku lõpp-punkti kasutuspoliitikat pole avaldatud. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) orto-pildid, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction" (suurem osa USGSi teabest on avalikus omandis ja seda võib kasutada piiranguteta); viidet palutakse, nt "(Toote või andmete nimi) courtesy of the U.S. Geological Survey". Teenus nimetab oma allikat "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, seegi föderaalne avalik töö); seda viidet kuvatakse. Võtit pole, avatud CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme'i tingimustes on WMTS loetletud kui "Non soumis à limite d'usage" (kasutuspiirangut pole; WMS on piiratud 40-50 päringuga sekundis); andmed on "soumises à la licence choisie et renseignée par le Fournisseur de données" ehk vaikimisi Etalabi Licence Ouverte, mille all on BD ORTHO avatud alates 2021. Kasutajad peavad "ne pas nuire, entraver ou fausser le bon fonctionnement des API" (mitte kahjustama, takistama ega moonutama API-de head toimimist). Cache'imist ei käsitleta; Licence Ouverte lubab taaskasutust allika märkimisega: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Võtit pole, avatud CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Avatud andmed paljudest allikatest, igaühel oma viide ([loend](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); võtit pole, teenusele pole tagatist, avatud CORS. Kõrgused dekodeeritakse valemiga `R × 256 + G + B / 256 − 32768` meetrit. |

## Kuidas taust jääb nende tingimuste piiridesse {#how-the-backdrop-stays-inside-those-terms}

- Salvestuse all olev taust laadib alla kuni 36 kõrgusplaati ja 300 vektorplaati; üks kord ehitatud teater kuni 64 + 100 kõrgusplaati ja 64 + 1500 vektorplaati; voogedastav teater ühe plaadi igast allikast korraga iga kaardiplaadi kohta, kui kaamera liigub. Allika kohta neli päringut korraga.
- **Üks kord ehitatud teater on üks allalaadimine**, ja allalaadimised on kuni 1000 vektorplaati või 40 MB (OpenFreeMapi tingimused lubavad 3000 plaati või 50 MB). Plaate küsitakse esmalt keskelt; lubatud mahu ületamisel võtab ehitus ainult vahemälus juba olevad plaadid ja ütleb, mitu veel jäänud on. Uuesti ehitades tuuakse järgmine tükk jne: suur ala tuleb tükkide kaupa, iga tükk vahemällu salvestatud.
- Sünteetilistel lendudel mõõdetult: teater 25 km detailse alaga võtab esimesel korral umbes 370 plaati ja 20 MB. Kui see uuesti ehitatakse või sellele tagasi lendatakse, ei laadita midagi alla.
- Plaate laaditakse alla ainult siis, kui **Maailma taust** vajutatakse, mitte kunagi taustal.
- Brauser ei lase lehel oma User-Agenti määrata; päringud kannavad brauseri oma ja lehe päritolu `Origin`/`Referer` päisena. Vaataja töölauaversioon peaks saatma oma.
- **OpenStreetMapist tuletatut ei lisata kunagi** vaatajaga kaasa ega commitita selle hoidlasse: ODbLi jagamine samadel tingimustel kehtib levitatava tuletatud andmebaasi kohta. Taustad ehitatakse kasutaja masinas ja hoitakse ainult selles brauseris (plaatide vahemälu ja, kui salvestatud, taseme raamatukogu).
