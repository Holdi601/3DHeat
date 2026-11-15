---
title: "Pasaulio fonas – šaltiniai ir sąlygos"
parent: "Pasaulio fonas"
grand_parent: "Lygiai ir fono geometrija"
nav_order: 1
lang: "lt"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Pasaulio fonas: šaltiniai ir sąlygos

Pasaulio fono [žemėlapio duomenys](world-backdrop.md) ateina iš atvirų paslaugų. Šis puslapis išvardija kiekvieną šaltinį, jo licenciją ir tai, kaip 3DHeat laikosi sąlygų.

| Šaltinis | Sąlygos (kaip perskaityta 2026 m. lapkričio 7 d.) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – OpenMapTiles schemos vektorinės plytelės iš OpenStreetMap, dabartinė versija pavadinta `https://tiles.openfreemap.org/planet` | Nemokama, be rakto, komercinis naudojimas leidžiamas. [Sąlygos](https://openfreemap.org/tos/) draudžia rinkti duomenis „automatiniais būdais, išskyrus neprisijungus atsisiunčiamus“: programa gali leisti vartotojams atsisiųsti sritį naudojimui neprisijungus, jei kiekvienas atsisiuntimas yra ne didesnis nei 3 000 plytelių arba 50 MB, daromas ne daugiau kaip 4 lygiagrečiomis užklausomis ir su User-Agent, identifikuojančiu programą. Autorystė privaloma: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (OpenFreeMap dalis neprivaloma). Paslauga gali nutrūkti be įspėjimo. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) duomenys | ODbL 1.0. Duomenų gavimas vykdymo metu ir jų piešimas vietoje yra asmeninis naudojimas; nupiešta peržiūra yra Produced Work, kuriam reikia matomo nurodymo, kaip ir ekrano nuotraukoms bei vaizdo įrašams, padarytiems iš jos. |
| [OpenMapTiles](https://openmaptiles.org) schema | CC BY 4.0 schemai; nurodymas „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Paskelbta viešuoju domenu; be rakto. Nurodymas „Runways: OurAirports (public domain)“ rodomas kaip mandagumas. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016 sluoksnis yra CC BY 4.0 (vėlesni metai yra CC BY-NC-SA, nenaudojami). EOX paslaugos puslapis kviečia naudoti galinius taškus programose kaip demonstracinę paslaugą be garantijos ir su greičio ribojimu; jame nieko nesakoma apie talpyklas, o CC BY tai leidžia. Nurodymas, rodomas drobėje: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, su nuoroda. CORS: užklausos kilmė atkartojama. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium koduotas 512 px nuostolių nesukeliantis WebP, be rakto, atviras CORS. Šaltiniai yra pagal CC BY, viešąjį domeną ir panašias atviras licencijas (nei viena nekomercinė ar su išlygine dalijimosi sąlyga); nurodymas „© Mapterhorn“ ir, pasauliniam sluoksniui, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Viešam galiniam taškui nepaskelbta jokios naudojimo politikos. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofotografija, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Dauguma JAV Geologijos tarnybos (USGS) informacijos priklauso viešajam domenui ir gali būti naudojama be apribojimų“; jie prašo nurodymo, pavyzdžiui, „(produkto ar duomenų pavadinimas) courtesy of the U.S. Geological Survey“. Paslauga savo šaltinį įvardija „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, taip pat federalinis viešojo domeno kūrinys); šis nurodymas ir rodomas. Be rakto, atviras CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme sąlygose WMTS įvardijamas kaip „Non soumis à limite d'usage“ (naudojimo riba netaikoma; WMS riboja 40–50 užklausų per sekundę); duomenys yra „soumises à la licence choisie et renseignée par le Fournisseur de données“, pagal numatytąją Etalab Licence Ouverte, pagal kurią BD ORTHO atvira nuo 2021 m.; vartotojai privalo „ne nuire, entraver ou fausser le bon fonctionnement des API“. Talpyklos klausimas nesprendžiamas; Licence Ouverte leidžia naudoti pakartotinai, nurodant šaltinį: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0“. Be rakto, atviras CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Atviri duomenys iš daugelio šaltinių, kiekvienas su savo nurodymu ([sąrašas](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); be rakto, be paslaugos garantijos, teikiama su atviru CORS. Aukščiai dekoduojami kaip `R × 256 + G + B / 256 − 32768` metrai. |

## Kaip fonas laikosi tų sąlygų {#how-the-backdrop-stays-inside-those-terms}

- Fonas po įrašu atsisiunčia daugiausia 36 aukščių plyteles ir 300 vektorinių plytelių; vieną kartą sukurtas teatras – daugiausia 64 + 100 aukščių plytelių ir 64 + 1 500 vektorinių plytelių; srautinis teatras – vieną kiekvieno šaltinio plytelę vienu metu kiekvienai žemėlapio plytelei, kai kamera juda. Keturios užklausos vienu metu kiekvienam šaltiniui.
- **Vieną kartą sukurtas teatras yra vienas atsisiuntimas**, ir atsisiunčiama daugiausia 1 000 vektorinių plytelių arba 40 MB (OpenFreeMap sąlygos leidžia 3 000 plytelių arba 50 MB). Plytelės pirmiausia prašomos nuo centro; viršijus leistiną kiekį, kūrimas paima tik jau talpykloje esančias plyteles ir praneša, kiek dar liko. Pakartotinai kuriant gaunamas kitas gabalas, ir taip toliau: didelė sritis ateina dalimis, kiekviena įrašoma į talpyklą.
- Išmatuota su sintetiniais skrydžiais: teatras su 25 km detalia sritimi pirmą kartą paima apie 370 plytelių ir 20 MB. Sukūrus iš naujo arba peržiūrėjus vėl, nieko neatsisiunčiama.
- Plytelės atsisiunčiamos tik paspaudus **Pasaulio fonas**, niekada fone.
- Naršyklė neleidžia puslapiui nustatyti savo User-Agent; užklausos neša naršyklės User-Agent ir puslapio kilmę kaip `Origin`/`Referer`. Darbalaukio peržiūros versija turėtų siųsti savąjį.
- **Niekas, gauta iš OpenStreetMap, niekada nepridedama prie peržiūros ir nekomituojama į jos saugyklą**: ODbL dalijimosi sąlyga taikoma platinamai išvestinei duomenų bazei. Fonai kuriami vartotojo kompiuteryje ir laikomi tik toje naršyklėje (plytelių talpykloje ir, jei išsaugota, lygių bibliotekoje).
