---
title: "Bakgrunnur heimsins - heimildir og hugtök"
parent: "Bakgrunnur heimsins"
grand_parent: "Borð og bakgrunnsform"
nav_order: 1
lang: "is"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Bakgrunnur heimsins: heimildir og hugtök

Kortagögnin í [bakgrunni heimsins](world-backdrop.md) koma frá opinni þjónustu. Þessi síða telur upp hverja heimild, leyfi hennar, og hvernig 3DHeat heldur sig innan skilmálanna.

| Heimild | Skilmálar (eins og þeir voru lesnir 7. nóvember 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - vigurreitir í OpenMapTiles-skema úr OpenStreetMap, núverandi útgáfa sem heitir `https://tiles.openfreemap.org/planet` | Ókeypis, enginn lykill, viðskiptaleg notkun leyfð. [Skilmálarnir](https://openfreemap.org/tos/) banna söfnun gagna „á sjálfvirkan hátt, nema við niðurhal án nettengingar“: forrit mega leyfa notendum að hala niður svæði til notkunar án nettengingar ef hvert niðurhal er mest 3.000 reitir eða 50 MB, gert með mest 4 samhliða beiðnum, með User-Agent sem auðkennir forritið. Eigna er krafist: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (hlutinn um OpenFreeMap er valfrjáls). Þjónustan getur hætt án fyrirvara. |
| Gögn [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Að sækja þau við keyrslu og teikna þau á staðnum er einkanotkun; sýnda sýnin er afurð sem þarfnast sýnilegrar tilvísunar, og það sama gildir um skjámyndir og myndbönd sem eru gerð úr henni. |
| Skema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 fyrir skemað; tilvísun „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Gefið út í almenningseign; enginn lykill. Tilvísunin „Runways: OurAirports (public domain)“ er sýnd af kurteisi. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Lagið frá 2016 er CC BY 4.0 (síðari ár eru CC BY-NC-SA, ekki notuð). Þjónustusíða EOX býður notkun endapunktanna í forritum, sem prófþjónustu án ábyrgðar og með hraðatakmörkunum; hún segir ekkert um skyndiminni, sem CC BY leyfir. Tilvísun, sýnd á striganum: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, tengd. CORS: uppruni beiðninnar er endurvarpaður. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kóðaðar 512 px taplausar WebP-myndir, enginn lykill, opið CORS. Heimildir undir CC BY, almenningseign og svipuðum opnum leyfum (ekkert með takmörkun á viðskiptalegri notkun eða deilt-eins skilyrði); tilvísun „© Mapterhorn“ og, fyrir heimsvíða lagið, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Engin birt notkunarstefna fyrir opna endapunktinn. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) loftmyndir, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction“; það biður um tilvísun, til dæmis „(Product or data name) courtesy of the U.S. Geological Survey“. Þjónustan nefnir heimild sína „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, einnig alríkisverk í almenningseign); það er tilvísunin sem er sýnd. Enginn lykill, opið CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Skilmálar Géoplateforme telja WMTS sem „Non soumis à limite d'usage“ (engin notkunartakmörk; WMS er takmarkað við 40-50 beiðnir á sekúndu); gögnin eru „soumises à la licence choisie et renseignée par le Fournisseur de données“, sjálfgefið Etalab Licence Ouverte, sem BD ORTHO hefur verið opið undir síðan 2021; notendur mega „ne pas nuire, entraver ou fausser le bon fonctionnement des API“. Skyndiminni er ekki tekið fyrir; Licence Ouverte leyfir endurnotkun með heimildarinnar getið: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0“. Enginn lykill, opið CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Opin gögn úr mörgum heimildum, hver með sína eigin tilvísun ([listi](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); enginn lykill, engin þjónustutrygging, þjónað með opnu CORS. Hæðir afkóðast sem `R × 256 + G + B / 256 − 32768` metrar. |

## Hvernig bakgrunnurinn heldur sig innan þessara skilmála {#how-the-backdrop-stays-inside-those-terms}

- Bakgrunnur undir upptöku sækir mest 36 hæðarreiti og 300 vigurreiti; leikhús sem er byggt einu sinni mest 64 + 100 hæðarreiti og 64 + 1.500 vigurreiti; streymt leikhús einn reit úr hverri heimild í einu fyrir hvern kortareit, eftir því sem myndavélin fer. Fjórar beiðnir í einu fyrir hverja heimild.
- **Leikhús sem er byggt einu sinni er eitt niðurhal**, og niðurhöl sækja mest 1.000 vigurreiti eða 40 MB (skilmálar OpenFreeMap leyfa 3.000 reiti eða 50 MB). Reitir eru beðnir um miðjuna fyrst; eftir að heimildin þrýtur tekur smíðin aðeins reiti sem eru þegar í skyndiminninu og segir hversu margir eigi enn eftir að koma. Ef byggt er aftur sækir það næsta hluta, og svo koll af kolli: stórt svæði kemur í bitum, hver þeirra í skyndiminni.
- Mælt á tilbúnum flugum: leikhús með 25 km nákvæmu svæði tekur um 370 reiti og 20 MB í fyrsta skipti. Ef það er byggt aftur, eða flogið er yfir það aftur, er ekkert sótt.
- Reitir eru aðeins sóttir þegar **Bakgrunnur heimsins** er ýtt á, aldrei í bakgrunni.
- Vafri leyfir ekki síðu að setja sitt eigið User-Agent; beiðnirnar bera User-Agent vafrans, og uppruna síðunnar sem `Origin`/`Referer`. Skjáborðsútgáfa skoðarans ætti að senda sitt eigið.
- **Ekkert sem er unnið úr OpenStreetMap er nokkurn tíma sent með skoðaranum** eða sett í geymslu hans: deilt-eins ákvæði ODbL gildir um dreift afleitt gagnasafn. Bakgrunnar eru smíðaðir á tölvu notandans og geymdir aðeins í þeim vafra (reitaskyndiminnið og, ef vistað, borðasafnið).
