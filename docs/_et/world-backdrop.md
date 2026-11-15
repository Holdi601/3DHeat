---
title: "Maailmataust"
parent: "Tasemed ja taustgeomeetria"
nav_order: 5
has_children: true
lang: "et"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Maailmataust

Maailmataust paneb lennusalvestise alla päris maapinna: künkad, teed, jõed, lennuväljad ja hooned, mis on alla laaditud vabalt kasutatavatest avatud kaardiandmetest. Kasuta seda siis, kui Tacview salvestis muidu hõljuks tühjal ruudustikul. See on [tase](glossary.md), nii et soojus ja figuurid asetuvad sellele.

## Ehita see {#build-one}

1. Laadi lennusalvestis, mis ütleb, kus maakeral ta asub (Tacview `.acmi` fail), või ära laadi midagi ja vali samm 3 juures sõjatander. Vt [Andmete sisselugemine](getting-data-in.md).
2. Ava külgribal **Taust / tase**.
3. Vajuta **Päris maailm taustaks**, et ehitada maapind su andmete alla. Või vali **Sõjatander** mängu kaart ja vajuta **Ehita sõjatandri taust** (või **Voogesita sõjatanner**).
4. Oota. Paneel näitab edenemist (*Kõrgusepaanid*, *Kaardipaanid*, *Taustaehitus*); **Tühista** peatab selle.
5. Lenda ringi. Kaardiandmete viide kirjutatakse vaate alumisse paremasse nurka.

Esimene ehitus laadib alla mõnikümmend megabaiti. Brauser hoiab need alles, nii et sama ala teine ehitus ei lae midagi uut alla. **Unusta kaardipaanid** kustutab need. Nupp **Päris maailm taustaks** on nähtav ainult siis, kui laaditud andmetel on geograafiline viide (allpool).

Kõik ehitatakse taustatöötlejas ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Tulemus asendab praeguse taseme ja käitub nagu iga [3D-tase](model-levels.md): peidab selle taga oleva soojuse, on lõigatav [lõikega](slice.md), sellel on [välimuse juhtnupud](level-appearance.md) ja seda saab salvestada [tasemete raamatukokku](level-library.md).

## Kus on andmed: geograafiline viide {#where-the-data-is-the-geographic-reference}

Andmestik saab geograafilise viite ainult allikalt, mis selle ütleb:

- **ACMI salvestis**: päises `ReferenceLatitude` ja `ReferenceLongitude` ning asukohad, mille lugeja projitseerib sellele kohale puutuva tasandi WGS84 elliptoidil (X itta, Y põhja, meetrites; kõrgused on salvestise kõrgus merepinnast). Viide säilib, kui kaardistus võtab maapinna teljeks **X** ja **Y** – salvestise enda vihjed teevad seda – ja kaob, kui maapind tuleb mõnest muust veerust, näiteks mängu enda lameda maailma **U** ja **V**.
- **Parquet-tabel, mille `heat3d` vihjed kannavad `geo` kirjet** – [Watcheri](https://github.com/Holdi601/3DHeat-Watcher) DCS-, MSFS-, X-Plane- ja IL-2 (Tacview) tabelid. Kirje on kirjeldatud jaotises [Arendajatele](#for-developers).

Mitme faili laadimine säilitab viite ainult siis, kui kõigil on sama. Iga teine laadija jääb samaks ja ei kanna viidet.

Taust projitseeritakse samamoodi ja viiakse seejärel läbi laadimise teljekaardistuse, nii et ta jääb andmete alla, olenemata sellest, milliseid peegeldusi või mõõtkava kaardistus rakendab.

## Sõjatandrid {#theatres}

Valija **Sõjatander** loetleb DCS Worldi päris maailma kaardid (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) ja IL-2 Great Battles'i kaardid (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), kumbki oma kastiga maakeral ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS-i kastid on redaktorite ulatused, arvutatud avaldatud projektsioonidest; IL-2 kastid ja need DCS-i kastid, mis on nii märgitud, on hinnangud kaartide avaldatud suuruste ja servades olevate linnade järgi. Paneel ütleb, millised.

**Ehita sõjatandri taust** ehitab ühte võrku kaks detailsustaset:

| Tase | Ala | Maapind | Kaart |
|---|---|---|---|
| Sõjatander | kogu kast | kõige sügavam suurendus kuni 10, mis vajab kõige rohkem 64 kõrgusepaani (umbes 3 km tipu kohta Kaukaasias, 1 km Normandias) | meri, järved, maakate ja maanteed kuni 64 vektorpaanist suurendustel 4 kuni 9 |
| Üksikasjalik ala | **Andmete all**, **Punkti ümber** (laiuskraad, pikkuskraad, 12 kuni 400 km) või puudub | suurendus kuni 12, kõige rohkem 100 paanis, kõige rohkem 500 000 tippu | kõik eelpool, kuni 1500 vektorpaanist kõige sügavamal suurendusel kuni 14, mis mahub |

Üksikasjalik ala lõikab sõjatandri ruudustikku augu, mis on laiendatud täisruutudeks, et mõlemad ruudustikud jagaksid oma servajooni. Õhuke sein sulgeb õmbluse seal, kus need kõrgusi erinevalt proovivad.

Andmetega laaditud sõjatander ehitatakse andmete tasapinnale, nii et ta jääb nende alla täpselt sellisena, nagu ehitati. Ilma andmeteta ehitatakse see sõjatandri enda viitepunkti ümber (terved kraadid üksikasjaliku ala lähedal). Hiljem laaditud andmed teisel viitel – ACMI-fail nimetab oma – liigutavad tausta enda alla. Täpne nihe kahe projektsiooni vahel arvutatakse 256 × 256 ruudustikul tausta kohal ja loetakse sõlmede vahelt; kogu sõjatandri ulatuses on viga meetri-kahe piires ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Raamatukokku salvestatud taust säilitab oma koha ja liigub samamoodi, kui ta laaditakse muude andmete alla.

### Sõjatandri voogesitamine {#streaming-a-theatre}

**Voogesita sõjatanner** näitab sõjatandrit nii, nagu lennusimulaatori kaardivaataja: maapind tuleb kaamera ümber paljude väikeste paanidena, mis laaditakse lennu ajal ja visatakse ära, kui need jäävad kättesaamatusse kaugusesse ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Web Mercatori paanide nelikpuu.** Juured suurendusel 5 katavad 1500 km kaamera ümber, nii et maapind ulatub sõjatandri kastist horisondini. Paan jagatakse oma nelja lapseks, kui kaamera on lähemal kui 1,4 korda paanide laiusest, kuni suurenduseni 15 (umbes 1 km paan, 15 m maapinnatippude vahel). Detail väheneb kaugusega nii, nagu see väheneb ekraanil.
- **Iga paan on oma võrk**, mis ehitatakse töötajas ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): 65 × 65 maapinna ruudustik ümber servade hõlmaga (nii et erineva detailsusega naabrid ei näita kunagi pragu), maakate ja meri peale värvitud, teed, raudteed, järved, jõed, lennuväljad, mõõdistatud rajad ja hooned peal, ja valikuliselt selle ruudu satelliidipilt. Renderdaja joonistab paanid taseme välimuse ja sügavusreeglitega, nii et need peidavad soojuse nagu iga tase.
- **Esmalt jäme.** Paane küsitakse jämedalt ja lähedalt esimesena, allikaga korraga neli allalaadimist. Kuni paani lapsed laaditakse, asendab paan neid, nii et vaade täitub kohe ja muutub siis teravamaks.
- **Mälu**: ehitatud paane hoitakse kuni 600 MB, kõige vähem hiljuti joonistatud visatakse esimesena välja. **Allalaadimised** jäävad paanivahemällu, mida hoitakse 2 GB eelarves, vanimad lähevad esimesena: lendamine tagasi mõne ala kohale ei maksa midagi ja ehitusel ei ole ülemist piiri.
- **Raamatukokku salvestatud** sellena, mida ta voogesitab – sõjatander, tema valikud ja koht maakeral –, mitte paanidena. Laadimisel voogesitatakse uuesti, paanivahemälust seal, kus paanid veel alles on. Klõpsud ja inspektor tabavad paane nagu iga taset.
- Mõlemad renderdajad joonistavad paane. Seda on kontrollitud kõrvuti päris GPU-l (WebGPU ja WebGL2 samal kaardil), sealhulgas soojust, mis on hari taha peidetud.
- Andmetega laaditud sõjatandri paanid ehitatakse andmete tasapinnale. Hiljem teisel tasapinnal laaditud andmed ehitavad need seal ümber (vahemälust).
- Mõõdetud sünteetilistel lendudel kolmes kohas (Normandia, Nevada, Süüria): umbes 63, 45 ja 24 MB esimesel külastusel koos piltidega. Teine külastus ei lae midagi alla.

## Mis ehitatakse {#what-is-built}

| Osa | Allikas | Kuidas |
|---|---|---|
| Pildid (voogesitatud sõjatandrid, valikuline) | EOX Sentinel-2 cloudless 2016 | **Satelliidipilt** katab maapinna pilvevaba 2016. aasta mosaiigiga (umbes 10 m piksel, suurendus 14, sügavamad paanid suurendavad seda) maakatte värvimise asemel. Teed, rajad, hooned ja nimed jäävad peale. |
| Peenem pilt (USA, Prantsusmaa) | USGS National Map orthoimagery; IGN BD ORTHO | Kui **Satelliidipilt** on sees, võtab kaardipaan suurendusel 13, mis asub täielikult Ameerika Ühendriikide mandriosas või Prantsusmaa mandriosas, selle asemel riigi ortofoto, kaks suurendust sügavamalt kui paan (selle 16 paani pilt ühes pildis, lähedalt umbes 1–2 m piksel). Mujal EOX. |
| Maapind (voogesitatud sõjatandrid) | Mapterhorn | Copernicus GLO-30 kõikjal (umbes 19 m piksel suurendusel 12), meetri täpsusega seal, kus riigi enda mõõdistus on olemas (Prantsusmaa, USA ja teised); loetakse kaks suurendust jämedamalt kui iga paan. AWS Terrain Tiles, kui Mapterhorniga ei saa ühendust. |
| Maapind | AWS Terrain Tiles (Terrarium PNG) | Kõrgusruudustik kasti kohal: suurendus on kõige sügavam kuni 12 (umbes 28 m piksel 43° N juures), mis vajab kõige rohkem 36 paani, ja ruudustik hõrendatakse kõige rohkem 400 000 tipuni. Joonistatakse maapinnana tavaliste reljeefivihjetega. |
| Teed, raudteed | OpenFreeMap vektorpaanid, kiht `transportation` | Lamedad lindid, mis on maapinnale asetatud, tihendatud maapinna sammuni ja tõstetud mõne protsendi võrra, et nad maapinnaga ei võitleks. Laiused klassi järgi: 16 m (mootorteed) kuni 3 m (metsatee, raudtee); kunagi kitsamad kui kasti diagonaal / 5000. Jalgteed, parvlaevad ja tunnelid jäetakse välja. |
| Lennuväljad | kiht `aeroway` | Raja-, rullraja-, platsi- ja helikopterikohtade hulknurgad maapinnana; raja- ja rullraja jooned 45 m ja 18 m lintidena. |
| Vesi | kiht `water` | Meri lamedana 0 m kõrgusel, järved ja tiigid lamedad oma madalaimal kaldal, jõed maapinnale asetatud. Joonistatud veena: lamedalt varjutatud, ilma kontuurideta. |
| Maakate | kihid `landcover` ja `landuse` | Värvitud maapinna enda tippudele, lisakolmnurki ei tule: metsad, rohumaad ja pargid rohelised, põllud kõlvikuvärvi, märgalad, liiv, kivi, jää; elu-, tööstus-, äri-, sõjaväe- ja karjäärialad vaiksetes toonides. Vesi on värvitud ka veepinna alla, nii et kaldajoon on loetav igalt kõrguselt. Paljale maapinnale tuleb vaikne kõrgustoon (madalik hallroheline, kõrgendik pruun, lumi üle 3000 m). Loetav maapinna eraldusvõimes: umbes 30–45 m üksikasjalikul alal, kilomeetrid sõjatandril. |
| Kohanimed | kihid `place` ja `aerodrome_label` | Linnad, alevid ja külad ning lennuväljad oma ICAO koodiga, kirjutatud vaate peale. Iga liigi nähtavus kasvab kaamera kõrgusega, kõige rohkem 70 korraga. |
| Mõõdistatud rajad | [OurAirports](https://ourairports.com/data/) `runways.csv` (avalik omand) | Valikuline (**Lennurajad OurAirportsist**, vaikimisi sees): iga avatud rada, mille mõlemad otsad on nimekirjas, lävest lävele oma nimekirjas oleva laiusega, koos külgribade, katkendliku keskjoone ja lävepiirdega. Üks 4 MB nimekiri, laetakse alla üks kord ja hoitakse vahemälus. |
| Hooned | kiht `building` | Jalajäljed, mis tõstetakse `render_min_height`-st kuni `render_height`-ni (6 m, kui puudub), kõige madalama maapinna kohal nende all; osad `hide_3d` jäetakse vahele. Joonistatud ehitistena. |

Vektorpaane loetakse suurendusel 14 (ainus suurendus, millel on hooned), kui kast vajab neid kõige rohkem 300; muidu sellel kõige sügavamal suurendusel, mis seda teeb, kuni 8ni. Suurem ala saab ainult maapinna.

### Välimus {#look}

Taust algab sisselülitatud valikuga **Näita pildi värve** – värv on see, mis eristab kerge tee halli maapinna seest ja tumeda raja tema platsist –, maapinna kolmnurkade servad on välja lülitatud, sest korrapärane ruudustik ei ütle midagi, kontuurid on nõrgad, meri on läbipaistmatu (selle all olev põhi võitleks sügavuses pinnaga kaugel) ja hooned on heledad hallid ja peaaegu tahked, nii nagu kaart neid joonistab. Avamere ei saa üldse maapinna kolmnurki. Kõik muu on mudelitaseme vaikimisi välimus.

## Allikaviited vaatel {#credits-on-the-canvas}

Kui taust on tase, kirjutatakse selle allikate viide vaate alumisse paremasse nurka, ilma klõpsamata, et ekraanipildid ja renderdatud videod seda kannaksid:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Iga osa lingib oma allika autoriõiguse lehele (openstreetmap.org/copyright ja Terrain Tiles [autorite loetelu](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Raamatukokku salvestatud taust säilitab oma viited ja näitab neid uuesti, kui see laaditakse. Tekst on tõlgitud vaatajaga; nimed ei ole.
## Allikad ja nende tingimused {#sources-and-their-terms}

Iga allikas, tema litsents ja see, kuidas taust jääb tingimustega kooskõlla: [Maailmataust - allikad ja mõisted](world-backdrop-sources.md).

## Paanide vahemälu {#the-tile-cache}

Iga paan ja vektorpaanide TileJSON hoitakse brauseri Cache API-s nimega `3dheat-world-tiles-v1`, URL-i järgi. Sama ala teine ehitus ei tee üldse päringuid ja töötab võrguühenduseta: TileJSON küsitakse esimesena ja kui see ebaõnnestub, nimetab selle vahemällu salvestatud koopia need paanid, mis juba olemas on. Paanid, mida server ei oma (avamere, 404), jäetakse meelde kui puuduvad.

Vektorpaanide URL-id kannavad kaardi ehitamise kuupäeva, nii et kui OpenFreeMap avaldab uue ehituse, laeb järgmine taust värsked paanid ja vanad jäävad alles, kuni need tühjendatakse. Vahemälu piiratakse 2 GB-le: selle ületamisel kustutatakse esimesena kõige kauem salvestatud paanid. **Unusta kaardipaanid** kustutab kogu vahemälu. Vahemälu nõuab turvalist päritolu (`https://` või `localhost`); mujal laaditakse iga ehitus uuesti alla.

## Võrdlus Tacviewga {#compared-with-tacview}

Kontrollitud silmaga ühe koha kohta igas sõjatandris sünteetiliste salvestistega: rulluvad stardid jäävad joonistatud radade keskjoonele, rannikuületused langevad rannikule. Tacview poolt on pärit selle dokumentatsioonist ja avaldatud ekraanipiltidest (tacview.net, selle Steami leht), mitte siin käivitamisest.

| | Tacview 1.9 | See taust, voogesitatuna |
|---|---|---|
| Ulatus | terve maakera | 1500 km kaamera ümber, kus iganes see on |
| Maapind | ETOPO1 (umbes 1,25 km) sisseehitatud; SRTM 25–75 m, kui kasutaja installib failid; DCS-i maapind eksporditud DCS-ist | Copernicus GLO-30 (Mapterhorn), meetri täpsusega Prantsusmaal ja USA-s |
| Pildid | sisseehitatud pole; tekstuurid, mille kasutaja alla laeb (Mapview, SAS Planet, lisad nagu Caucasuse VFR kaart) | EOX Sentinel-2 cloudless 2016, umbes 10 m, voogesitatud |
| Maakate | puudub, välja arvatud tekstuuris | OpenStreetMapist, värvitud maapinnale (ilma piltideta) |
| Teed, raudteed | puuduvad, välja arvatud tekstuuris | iga klass kaamera lähedal, põhiteed kaugemal |
| Hooned | puuduvad | ekstrudeeritud jalajäljed kaamera lähedal |
| Lennuväljad | sildid ja rajad lamedate kastidena, ilma märgisteta | mõõdistatud otstega rajad, külgribade, keskjoone ja lävepiiretega; rullrajad, platsid; nimed ICAO koodidega |
| Kohanimed | mõned küla- ja linnasildid | linnad, alevid, külad, lennuväljad, kauguse ja kõrguse järgi |

Kohad, kus ta veel jääb alla:

- **Pildi eraldusvõime**: väljaspool USA-d ja Prantsusmaad on 10 m satelliidimosaiik alla umbes 2 km pehme; Tacview koos kasutaja installitud suurendusel 17 tekstuuriga on seal teravam.
- **Maapind DCS-i enda kujul**: Tacview võib näidata maapinda, mille DCS ise eksportis; siin on see päris maakera, mis erineb DCS-i maapinnast seal, kus kaardi modelleerijad seda muutsid.
- **Kumerus**: maapind on lame tasapind, seega horisont ei ole kõvera maakera oma; Tacview joonistab kera.
- **Kiirus**: esimene külastus kohas laeb alla mõnikümmend megabaiti enne, kui pilt on terav; tarkvaraliselt renderdavas brauseris (ekraanipildid) joonistab see mõne kaadri sekundis mitmesaja paaniga.

## Piirangud ja mis tuleb hiljem {#limits-and-what-comes-later}

- **Maapinna eraldusvõime**: parimal juhul umbes 30 m ja suurtel aladel jämedam. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (AWS-is pilvele optimeeritud GeoTIFF-id, võtmeta, fikseeritud autoritekst) on parem allikas: 30 m kõikjal, GLO-90 seal, kus GLO-30-l on lüngad (Armeenia ja Aserbaidžaan, mida katab DCS Caucasus). See vajab GeoTIFF-lugejat ja seda ei kasutata veel.
- **Parem maapind**: Copernicus GLO-30 AWS-is ei saada CORS-päiseid, nii et brauser ei saa seda lugeda. OpenTopography peegel on loetav (CORS ja vahemikud), aga nende tingimused avaliku äpi käitamisel on teadmata; enne igasugust kasutamist tuleb küsida. Mapterhorn sisaldab GLO-30 juba.
- **Kumerus**: maapind on lame tasapind ja kõrgusi ei langetata maakera kumeruse järgi, see vastab sellele, kuidas salvestised on paigutatud (kõrgus kui kõrgus). Viitest kaugel liiguvad mõlemad koos, alla osa tuhandikust 100 km juures. Ainult paanide painutamine lahutaks need andmetest kaugel, seega seda ei pakuta. Kumer horisont nõuab sama langust (kauguse kaamerast ruudus jagatud kahe maakera raadiusega), mis rakendatakse igas passis, mis joonistab asukohti (tase, paanid, soojus, jooned, kastid, sildid, valik), ühe ühise ühtsusena. Päris gloobus nõuab ka andmete maakeskseid asukohti ja kaameraga suhtelist renderdust. Mõlemat on kavandatud gloobusrežiimiga.
- **Ainult tänapäeva maailm**: DCS-i ja IL-2 ajaloolised kaardid (Normandy 2, The Channel, Germany Cold War ja kõik IL-2 kaardid) on joonistatud tänapäevaste linnade, teede ja rannikutöödega; paneel ütleb seda. Ajastu lennuvälju ei joonistata.
- **Gloobusrežiimi ei ole**: taust on lame kohalik tasapind. Kogu maakera vaade on kavandatud.
- Teid laiendatakse suurtel aladel, et need jääksid nähtavaks; lähedalt on need eluskujust laiemad.
- DCS-i sõjatandrite nimed Watcheri tabelites sobitatakse nii, nagu DCS need annab väljas `mission.theatre`. Nimi, mida nimekirjas ei ole, langeb tagasi esimesele asukohapunktile, mis ümardatakse täisdraadideks, ja ainult laiuskraadile ning pikkuskraadile.

## Ajaloolised kaardid (veel ehitamata) {#historical-maps-not-built-yet}

Ajastu kaardid võiksid hiljem katta ajaloolisi sõjatandreid. US Army Map Service (AMS) sarjad on USA föderaalvalitsuse tööd, mida üldiselt peetakse avalikuks omandiks (kontrolli iga skannide kirjet; paljud on Briti GSGS või Saksa originaalide ümbertrükid, mille Crowni autoriõigus või anonüümse teose tähtaeg on samuti möödunud):

| Sõjatander | Sari | Kust skannitud |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Ida-Euroopa 1:250 000 (koostatud 1950ndatel Nõukogude ja Saksa kaartide järgi) | UT Austin PCL; mõned lehed georefereeritud UT GeoData juures |
| IL-2 Normandy, DCS Normandy 2 ja The Channel | AMS **M661** / GSGS 4250, Prantsusmaa 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 ja **M841** 1:25 000 (Saksamaa) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (1951. aasta väljaanded) ja **L552** 1:250 000 | ANU Open Research (L751 lehed, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | Briti I maailmasõja kaevikukaardid (mitte AMS) | McMaster University; National Library of Scotland (mittekommertslikud tingimused) |

AMS-lehed kannavad nurkades laiuskraadi ja pikkuskraadi märke, nii et igaüks paigutataks nelja nurga sobitamisega ja kantaks maapinnale tekstuurina; see ehitatakse ja hoitakse kohapeal nagu paanid.

## Arendajatele {#for-developers}

### Parquet-tabeli `geo` kirje {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` ja `up` nimetavad veerud, mis hoiavad ida- ja põhjameetreid samal puutujatasandil punktis (`lat0`, `lon0`) ning kõrgust. Laadimine kannab viidet, kui selle kaardistus võtab just need veerud (ida kui X, põhi ja kõrgus kui Y ja Z, kumbki pool peale). Valikuline `dcs` kirje nimetab DCS-i tabeli enda meetrid (x põhi, y üles, z ida) ja selle sõjatandri: laadimine, mis kaardistab need veerud, paigutatakse selle asemel läbi sõjatandri Transverse Mercatori projektsiooni ([DCS-i koordinaadid](#dcs-coordinates)). Tabel ilma `geo`-ta loetakse nagu varem.

### DCS-i koordinaadid {#dcs-coordinates}

Iga DCS-i sõjatander on Transverse Mercatori projektsioon (WGS84, mõõtkava 0.9996) oma keskmeridiaani ja oma võltsalgpunktiga; DCS-i x on põhjasuunaline ja z idasuunaline. Konstandid on need, mille pydcs projekt avaldab. Arvutus on Krügeri rida kuuenda järguni (Karney 2011), porditud faili [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). DCS-i meetrite taust ehitatakse otse nendes, nii et Watcheri DCS-i tabel, mis on kaardistatud `dcs_x`/`dcs_y`/`dcs_z` kaudu, DCS-i maapinna konverteri kirjutatud tase ja taust jagavad kõik ühte raami. Iraki konstante ei ole avaldatud; need on sobitatud avaldatud viitepunktidele (4 cm ruutkeskmine viga).

Watcheri DCS-i tabelid on tangentsiaaltasapinnal sõjatandri fikseeritud viitepunktis (sama punkt, mida sõjatandri valija kasutab, allpool), nii et mitu missiooni ühel sõjatandril ühinevad oma viitega ja joonduvad sõjatandri taustaga ilma seda liigutamata.

### Lihtsustamine ja eelarve {#simplification-and-budget}

- Alla 20 m² suurused hooned jäetakse välja; 60 m², kui kast on üle 30 km laiune, ja 150 m², kui üle 80 km. Ülejäänud lisatakse suurimast väiksemani, kuni hooned jõuavad 1,5 miljoni kolmnurgani.
- Kõrvalteed, teeninduseteed ja metsateed jäetakse välja üle 60 km laiuse ala puhul; üle 150 km jäävad alles ainult mootorteed, põhi-, peamised ja teisesed teed.
- Terve taust jääb umbes 3 miljoni kolmnurga piiri alla. Impordimärge ütleb, mitu hoonet jäeti välja.
