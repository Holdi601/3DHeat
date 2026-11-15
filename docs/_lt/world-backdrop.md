---
title: "Pasaulio fonas"
parent: "Lygiai ir fono geometrija"
nav_order: 5
has_children: true
lang: "lt"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Pasaulio fonas

Pasaulio fonas padeda tikrąjį žemės paviršių po skrydžio įrašu: kalvas, kelius, upes, aerodromus ir pastatus, parsisiųstus iš laisvų atvirų žemėlapių duomenų. Naudokite jį tada, kai kitaip Tacview įrašas plūduriuotų tuščiame tinkle. Tai [lygis](glossary.md), todėl šiluma ir figūros guli ant jo.

## Sukurti vieną {#build-one}

1. Įkelkite skrydžio įrašą, kuriame nurodyta, kur žemėje jis vyksta (Tacview `.acmi` failą), arba neįkelkite nieko ir 3 žingsnyje pasirinkite karo veiksmų teatrą. Žr. [Duomenų įkėlimas](getting-data-in.md).
2. Šoninėje juostoje atidarykite **Fonas / lygis**.
3. Spauskite **Tikrasis pasaulis kaip fonas**, kad sukurtumėte žemę po savo duomenimis. Arba pasirinkite žaidimo žemėlapį **Karo veiksmų teatras** ir spauskite **Kurti karo veiksmų teatro foną** (arba **Transliuoti karo veiksmų teatrą**).
4. Palaukite. Skydelyje rodoma eiga (*Elevation tiles*, *Map tiles*, *Building the backdrop*); **Atšaukti** ją sustabdo.
5. Skraidykite aplink. Žemėlapio duomenų šaltinio nuoroda rašoma apatiniame dešiniajame vaizdo kampe.

Pirmasis kūrimas parsisiunčia kelias dešimtis megabaitų. Naršyklė jas išsaugo, todėl antras to paties ploto kūrimas nieko neparsisiunčia. **Pamiršti žemėlapio plyteles** jas ištrina. Mygtukas **Tikrasis pasaulis kaip fonas** rodomas tik tada, kai įkelti duomenys turi geografinę nuorodą (žemiau).

Viskas kuriama foniniame darbininke ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultatas pakeičia dabartinį lygį ir veikia kaip bet kuris [3D lygis](model-levels.md): paslepia šilumą už savęs, kertamas pjūviu, turi [išvaizdos valdiklius](level-appearance.md) ir gali būti išsaugotas [bibliotekoje](level-library.md).

## Kur yra duomenys: geografinė nuoroda {#where-the-data-is-the-geographic-reference}

Duomenų rinkinys gauna geografinę nuorodą tik iš šaltinio, kuris ją nurodo:

- **ACMI įrašas**: jo antraštės `ReferenceLatitude` ir `ReferenceLongitude` ir padėtys, kurias skaitytuvas projektuoja į plokštumą, liečiančią WGS84 elipsoidą toje vietoje (X – rytai, Y – šiaurė, metrais; aukščiai yra įrašo aukštis virš jūros lygio). Nuoroda išlaikoma, kai susiejimas X ir Y laiko žemės ašimis – taip daro paties įrašo užuominos – ir atmetama, kai žemė ateina iš kito stulpelio, pavyzdžiui žaidimo plokščiojo pasaulio **U** ir **V**.
- **Parquet lentelė, kurios `heat3d` užuominose yra `geo` įrašas** – [Watcher](https://github.com/Holdi601/3DHeat-Watcher) DCS, MSFS, X-Plane ir IL-2 (Tacview) lentelės. Įrašas aprašytas skyriuje [Kūrėjams](#for-developers).

Kelių failų įkėlimas išlaiko nuorodą tik tada, kai visi turi tą pačią. Visi kiti skaitytuvai nepaveikiami ir nuorodos neturi.

Fonas projektuojamas tuo pačiu būdu ir tada praleidžiamas pro įkėlimo ašių susiejimą, todėl atsiduria po duomenimis, kad ir kokius apvertimus ar mastelį susiejimas taikytų.

## Karo veiksmų teatrai {#theatres}

**Karo veiksmų teatras** parinkiklis rodo DCS World tikrųjų pasaulio žemėlapius (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) ir IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), kiekvienas su savo dėžute ant žemės ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS dėžės – redaktorių ribos, apskaičiuotos iš paskelbtų projekcijų; IL-2 dėžės ir tos DCS dėžės, kurios taip pažymėtos, yra įvertinimai pagal žemėlapių paskelbtus dydžius ir miestus prie jų kraštų. Skydelyje nurodoma, kurios.

**Kurti karo veiksmų teatro foną** sukuria dvi detalumo pakopas viename tinkle:

| Pakopa | Plotas | Reljefas | Žemėlapis |
|---|---|---|---|
| Teatras | visa dėžė | giliausias priartinimas iki 10, kuriam reikia ne daugiau kaip 64 aukščių plytelių (apie 3 km viršūnei virš Kaukazo, 1 km virš Normandijos) | jūra, ežerai, žemės danga ir greitkeliai iš ne daugiau kaip 64 vektorinių plytelių, 4–9 priartinimo lygiuose |
| Detalus plotas | **Po duomenimis**, **Aplink tašką** (platuma, ilguma, 12–400 km) arba nėra | iki 12 priartinimo ne daugiau kaip 100 plytelių, ne daugiau kaip 500 000 viršūnių | viskas, kas aukščiau, iš ne daugiau kaip 1 500 vektorinių plytelių giliausiame priartinimo lygyje iki 14, kuris telpa |

Detalus plotas teatro tinkle iškerta skylę, išplėstą iki visų langelių, kad abu tinklai turėtų bendras kraštines linijas, o plona siena uždaro siūlę, kur jie aukščius matuoja skirtingai.

Kai duomenys įkelti, teatras statomas duomenų plokštumoje, todėl atsiduria po jais, kaip pastatyta. Be duomenų jis statomas aplink paties teatro atskaitos tašką (sveikais laipsniais šalia jo detalaus ploto). Vėliau įkelti duomenys kitoje nuorodoje – ACMI failas nurodo savąją – perkelia foną po savimi: tikslus perkėlimas tarp dviejų projekcijų skaičiuojamas 256 × 256 tinkle virš fono ir nuskaitomas tarp mazgų, per vieną ar du metrus visame teatre ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Į biblioteką išsaugotas fonas išlaiko savo vietą ir perkeliamas tuo pačiu būdu, kai įkeliamas su kitais duomenimis.

### Teatro srautas {#streaming-a-theatre}

**Transliuoti karo veiksmų teatrą** rodo teatrą taip, kaip rodo skrydžių simuliatorių žemėlapių peržiūros: žemė ateina kaip daug mažų plytelių aplink kamerą, kraunamų skrendant ir išmetamų, kai jos nebepasiekiamos ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Web Mercator plytelių keturmedis.** Šaknys 5 priartinimo lygyje apima 1 500 km aplink kamerą, todėl žemė pasiekia už teatro dėžės iki horizonto. Plytelė dalijama į keturis vaikus, kol kamera yra arčiau nei 1,4 karto jos pločio atstumu, iki 15 priartinimo lygio (apie 1 km plytelė, 15 m tarp reljefo viršūnių): detalumas mažėja su atstumu, kaip mažėja ekrane.
- **Kiekviena plytelė – savas tinklas**, sukurtas darbininke ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): 65 × 65 reljefo tinklas su pakraščio juosta, kad kaimynai skirtingu detalumu niekada nerodytų įtrūkimo; ant jo nudažyta žemės danga ir jūra; viršuje keliai, geležinkeliai, ežerai, upės, aerodromai, išmatuoti kilimo ir tūpimo takai ir pastatai; pasirinktinai – palydovinis tos kvadrato dalies vaizdas. Atvaizdavimo sistema piešia plyteles pagal lygio išvaizdą ir gylio taisykles, todėl jos slepia šilumą už savęs kaip ir bet kuris lygis.
- **Pirma – grubiai.** Plytelės prašomos pirmiausia grubios ir artimos, po keturis parsisiuntimus vienu metu kiekvienam šaltiniui. Kol plytelės vaikai kraunasi, plytelė juos pakeičia, todėl vaizdas iš karto užsipildo ir paskui paaštrėja.
- **Atmintis**: sukurtos plytelės laikomos iki 600 MB, pirmiausia išmetamos mažiausiai neseniai nupieštos. **Parsisiuntimai** lieka plytelių talpykloje, ribojami 2 GB biudžetu, seniausi išmetami pirmi: grįžimas skrendant virš to paties ploto nieko nekainuoja, o kūrimui nėra jokios ribos.
- **Išsaugoma bibliotekoje** kaip tai, ką transliuoja – teatras, jo parinktys ir vieta žemėje – o ne plytelės: įkėlus jis vėl transliuojamas, iš plytelių talpyklos, kur plytelės dar yra. Paspaudimai ir tikrintuvas pataiko į plyteles, kaip ir į bet kurį lygį.
- Abu atvaizdavimo varikliai piešia plyteles: patikrinta vienas šalia kito tikroje GPU (WebGPU ir WebGL2 toje pačioje kortoje), įskaitant šilumą, paslėptą už kalvagūbrio.
- Kai duomenys įkelti, plytelės kuriamos duomenų plokštumoje; vėliau įkelti duomenys kitoje plokštumoje jas perkuria ten (iš talpyklos).
- Matuota sintetiniais skrydžiais virš trijų vietų (Normandija, Nevada, Sirija): maždaug 63, 45 ir 24 MB pirmą kartą su vaizdu; antras apsilankymas nieko neparsisiunčia.

## Kas statoma {#what-is-built}

| Dalis | Šaltinis | Kaip |
|---|---|---|
| Vaizdas (transliuojami teatrai, neprivaloma) | EOX Sentinel-2 cloudless 2016 | **Satellite imagery** uždengia žemę be debesų 2016 m. mozaika (apie 10 m pikselis, 14 priartinimo lygis, gilesnės plytelės ją padidina) vietoj nudažytos žemės dangos; keliai, kilimo ir tūpimo takai, pastatai ir pavadinimai lieka viršuje. |
| Tikslesnis vaizdas (JAV, Prancūzija) | USGS National Map orthoimagery; IGN BD ORTHO | Įjungus **Satellite imagery**, žemėlapio plytelė nuo 13 priartinimo lygio, visiškai esanti JAV žemyninėje dalyje ar Prancūzijos metropolijoje, paima nacionalinę ortofotografiją, dviem lygiais giliau nei plytelė (šešiolika jos plytelių sudėta į vieną paveikslą, apie 1–2 m pikselis iš arti). Kitur – EOX. |
| Reljefas (transliuojami teatrai) | Mapterhorn | Copernicus GLO-30 visur (apie 19 m pikselis 12 priartinimo lygyje), metrų tikslumo ten, kur yra šalies pačios geodezinė apklausa (Prancūzija, JAV ir kitos); skaitoma dviem lygiais grubiau nei kiekviena plytelė. AWS Terrain Tiles, jei Mapterhorn nepasiekiamas. |
| Reljefas | AWS Terrain Tiles (Terrarium PNG) | Aukščių tinklas virš dėžės: priartinimas – giliausias iki 12 (apie 28 m pikselis 43° š. pl.), kuriam reikia ne daugiau kaip 36 plytelių; tinklas retinamas iki ne daugiau kaip 400 000 viršūnių. Piešiamas kaip žemė su įprastais reljefo ženklais. |
| Keliai, geležinkeliai | OpenFreeMap vektorinės plytelės, `transportation` sluoksnis | Plokščios juostos, uždengtos ant reljefo, sutankintos iki reljefo žingsnio ir pakeltos kelis procentus, kad nesikonfliktuotų su juo. Pločiai pagal klasę – nuo 16 m (greitkelis) iki 3 m (takas, geležinkelis); niekada siauresni nei dėžės įstrižainė / 5000. Takai, keltai ir tuneliai praleidžiami. |
| Aerodromai | `aeroway` sluoksnis | Kilimo ir tūpimo takų, rulėjimo takų, aikštelių ir sraigtasparnių aikštelių poligonai uždengti kaip žemė; kilimo ir tūpimo takų bei rulėjimo takų linijos – kaip 45 m ir 18 m juostos. |
| Vanduo | `water` sluoksnis | Jūra plokščia 0 m aukštyje, ežerai ir tvenkiniai plokšti prie žemiausio kranto, upės uždengtos. Piešiamas kaip vanduo: plokščias šešėliavimas, be kontūrų. |
| Žemės danga | `landcover` ir `landuse` sluoksniai | Nudažoma ant paties reljefo viršūnių, be papildomų trikampių: miškai, pievos ir parkai žali, ūkiai – šiaudų spalvos, pelkės, smėlis, uolos, ledas; gyvenamosios, pramoninės, komercinės, karinės ir karjerų zonos – prislopintais tonais. Vanduo nudažomas ir po vandens paviršiumi, todėl krantą matyti iš bet kurio aukščio. Nuogas gruntas gauna ramų aukščio atspalvį (žemumų pilkai žalsvas, aukštumų rudas, sniegas virš 3 000 m). Įskaitomas reljefo skiriamąja geba: apie 30–45 m detaliame plote, kilometrai teatre. |
| Vietovardžiai | `place` ir `aerodrome_label` sluoksniai | Miestai, miesteliai ir kaimai bei aerodromai su ICAO kodu, užrašyti ant vaizdo; kiek kiekvienos rūšies rodoma, priklauso nuo kameros aukščio, ne daugiau kaip 70 vienu metu. |
| Išmatuoti kilimo ir tūpimo takai | [OurAirports](https://ourairports.com/data/) `runways.csv` (viešasis domenas) | Neprivaloma (**Kilimo ir tūpimo takai iš OurAirports**, įjungta pagal numatymą): kiekvienas atviras kilimo ir tūpimo takas, kurio abu galai yra sąraše, nuo slenksčio iki slenksčio nurodytu pločiu, su šoninėmis juostomis, brūkšniuota centrine linija ir slenksčio juostomis. Vienas 4 MB sąrašas, parsisiųstas vieną kartą ir laikomas talpykloje. |
| Pastatai | `building` sluoksnis | Pėdsakai išstumiami nuo `render_min_height` iki `render_height` (6 m, jei nėra) virš žemiausios žemės po jais; `hide_3d` dalys praleidžiamos. Piešiami kaip statiniai. |

Vektorinės plytelės skaitomos 14 priartinimo lygyje (vienintelis su pastatais), kai dėžei reikia ne daugiau kaip 300 jų; kitaip – giliausiame lygyje, kuris tam tinka, iki 8. Didesnis plotas gauna tik reljefą.

### Išvaizda {#look}

Fonas pradedamas su įjungta **Show captured colour** – spalva parodo, kuo šviesus kelias skiriasi nuo pilkos žemės, kuriai jis guli, o tamsus kilimo ir tūpimo takas nuo aikštelės – su išjungtomis reljefo trikampių briaunomis, nes taisyklingas tinklas nieko nesako, silpnais kontūrais, neskaidria jūra (po ja esantis pagrindas kovotų su paviršiumi dėl gylio toli) ir pastatais šviesiai pilkais ir beveik vientisais, kaip juos piešia žemėlapis. Atviroji jūra visai negauna reljefo trikampių. Viskas kita – modelio lygio numatytoji išvaizda.

## Šaltinių nuorodos ant vaizdo {#credits-on-the-canvas}

Kol fonas yra lygis, jo šaltinių nuoroda rašoma apatiniame dešiniajame vaizdo kampe, be papildomo paspaudimo, kad ekrano nuotraukose ir atvaizduotuose vaizdo įrašuose ji liktų:

> OpenFreeMap © OpenMapTiles · Duomenys © OpenStreetMap prisidėjėjai · Aukščiai: Terrain Tiles – SRTM, GMTED2010, 3DEP, pateikė U.S. Geological Survey; ETOPO1: NOAA; ir kiti

Kiekviena dalis rodo į savo šaltinio autorystės puslapį (openstreetmap.org/copyright ir Terrain Tiles [autorystės sąrašas](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Į biblioteką išsaugotas fonas išlaiko savo nuorodas ir jas vėl rodo įkėlus. Tekstas išverstas su peržiūros programa; pavadinimai – ne.

## Šaltiniai ir jų sąlygos {#sources-and-their-terms}

Kiekvienas šaltinis, jo licencija ir kaip fonas lieka sąlygų ribose: [Pasaulio fonas: šaltiniai ir sąlygos](world-backdrop-sources.md).

## Plytelių talpykla {#the-tile-cache}

Kiekviena plytelė ir vektorinių plytelių TileJSON laikomi naršyklės Cache API po `3dheat-world-tiles-v1`, pagal URL. Antras to paties ploto kūrimas nedaro jokių užklausų ir veikia be interneto: pirmiausia klausiama TileJSON, o jam nepavykus, jo talpyklos kopija nurodo jau laikomas plyteles. Plytelės, kurių serveryje nėra (atviroji jūra, 404), taip pat prisimenamos kaip nesančios.

Vektorinių plytelių URL turi žemėlapio kūrimo datą, todėl kai OpenFreeMap paskelbia naują versiją, kitas fonas parsisiunčia naujas plyteles, o senos lieka, kol nebus išvalytos. Talpykla laikoma iki 2 GB: viršijus, pirmiausia ištrinamos seniausiai įrašytos plytelės. **Pamiršti žemėlapio plyteles** ištrina visą talpyklą. Talpyklai reikia saugios kilmės (`https://` arba `localhost`); kitur kiekvienas kūrimas parsisiunčia iš naujo.

## Palyginimas su Tacview {#compared-with-tacview}

Patikrinta akimi vienoje vietoje kiekviename teatre, su sintetiniais įrašais: pakilimo bėgimai guli nubrėžtų kilimo ir tūpimo takų centrinėse linijose, krantų perėjimai – ant kranto. Tacview pusė paimta iš jo dokumentacijos ir paskelbtų ekrano nuotraukų (tacview.net, jo Steam puslapis), o ne iš jo paleidimo čia.

| | Tacview 1.9 | Šis fonas, transliuojamas |
|---|---|---|
| Apimtis | visas rutulys | 1 500 km aplink kamerą, kur ji bebūtų |
| Reljefas | ETOPO1 (apie 1,25 km) įdiegtas; SRTM 25–75 m, jei naudotojas įdiegia failus; DCS reljefas, eksportuotas iš DCS | Copernicus GLO-30 (Mapterhorn), metrų tikslumo Prancūzijoje ir JAV |
| Vaizdas | neįdiegta; tekstūras naudotojas parsisiunčia pats (Mapview, SAS Planet, papildiniai, pvz., Kaukazo VFR žemėlapis) | EOX Sentinel-2 cloudless 2016, apie 10 m, transliuojamas |
| Žemės danga | nėra, nebent tekstūroje | iš OpenStreetMap, nudažyta ant reljefo (be vaizdo) |
| Keliai, geležinkeliai | nėra, nebent tekstūroje | visos klasės šalia kameros, pagrindiniai keliai toli |
| Pastatai | nėra | išstumti pėdsakai šalia kameros |
| Aerodromai | užrašai ir kilimo ir tūpimo takai kaip plokščios dėžės, be žymėjimų | kilimo ir tūpimo takai nuo išmatuotų galų su šoninėmis juostomis, centrine linija ir slenksčio juostomis; rulėjimo takai, aikštelės; pavadinimai su ICAO kodais |
| Vietovardžiai | kai kurie kaimų ir miestų užrašai | miestai, miesteliai, kaimai, aerodromai, pagal atstumą ir aukštį |

Kur dar atsilieka:

- **Vaizdo skiriamoji geba**: už JAV ir Prancūzijos ribų 10 m palydovinė mozaika žemiau apie 2 km neryški; Tacview su naudotojo įdiegta 17 priartinimo lygio tekstūra ten ryškesnis.
- **Reljefas DCS pavidalu**: Tacview gali rodyti patį DCS eksportuojamą reljefą; čia – tikroji žemė, kuri skiriasi nuo DCS reljefo ten, kur žemėlapio modeliuotojai jį pakeitė.
- **Kreivumas**: žemė yra plokščia plokštuma, todėl horizontas nėra lenktos žemės horizontas; Tacview piešia sferą.
- **Greitis**: pirmas apsilankymas vietoje parsisiunčia kelias dešimtis megabaitų, kol vaizdas paaštrėja; naršyklėje, kuri piešia programine įranga (ekrano nuotraukos), su keliais šimtais plytelių jis piešiamas keliais kadrais per sekundę.

## Ribos ir kas bus vėliau {#limits-and-what-comes-later}

- **Reljefo skiriamoji geba**: geriausiu atveju apie 30 m, o didelėse vietovėse grubiau. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF failai AWS, be rakto, fiksuotas autorystės tekstas) yra geresnis šaltinis: visur 30 m, o GLO-90 ten, kur GLO-30 turi spragų (Armėnija ir Azerbaidžanas, kuriuos dengia DCS Caucasus). Jam reikia GeoTIFF skaitytuvo, jis dar nenaudojamas.
- **Geresnis reljefas**: Copernicus GLO-30 AWS nesiunčia CORS antraščių, todėl naršyklė jo nepasiekia; OpenTopography veidrodį galima skaityti (CORS ir diapazonai), tačiau jų sąlygos viešos programos vykdymo metu nežinomos – prieš bet kokį naudojimą reikia paklausti. Mapterhorn jau turi GLO-30.
- **Kreivumas**: žemė yra plokščia plokštuma, o aukščiai nenuleidžiami pagal Žemės kreivumą, kaip įrašai ir sudedami (aukštis kaip aukštis); toli nuo atskaitos taško abu nukrypsta kartu, mažiau nei viena tūkstantoji dalis 100 km. Lenkiant tik plyteles, jos atsiskirtų nuo duomenų toli, todėl to nesiūloma. Lenkto horizonto reikia to paties nuleidimo – atstumas nuo kameros kvadratu, padalytas iš dvigubo Žemės spindulio – taikyto kiekviename perdavime, kuris piešia padėtį (lygis, plytelės, šiluma, linijos, dėžės, užrašai, pasirinkimas), kaip vieną bendrą kintamąjį; tikras rutulys reikalauja, kad ir duomenims būtų Žemės centro padėtys bei piešimas kameros atžvilgiu. Abu planuojami kartu su rutulio režimu.
- **Tik dabartinis pasaulis**: DCS ir IL-2 istoriniai žemėlapiai (Normandy 2, The Channel, Germany Cold War, visi IL-2 žemėlapiai) piešiami su šiandieniniais miestais, keliais ir pakrantės darbais; skydelis tai nurodo. Laikotarpio aerodromai nepiešiami.
- **Rutulio režimo nėra**: fonas yra plokščia vietinė plokštuma. Viso pasaulio vaizdas planuojamas.
- Keliai didelėse vietovėse išplatinami, kad liktų matomi; iš arti jie platesni nei gyvenime.
- DCS teatrų pavadinimai Watcher lentelėse atitinka tai, kaip DCS juos pateikia `mission.theatre`; pavadinimas, kurio sąraše nėra, grįžta prie pirmosios fiksacijos, suapvalintos iki sveikų laipsnių, ir tik prie platumos bei ilgumos.

## Istoriniai žemėlapiai (dar nepastatyti) {#historical-maps-not-built-yet}

Laikotarpio žemėlapiai vėliau galėtų uždengti istorinius teatrus. JAV armijos topografinės tarnybos (AMS) serijos yra JAV federalinės vyriausybės darbai, paprastai laikomi viešuoju domenu (kiekvieno nuskaitymo įrašą patikrinkite pats: daugelis yra britų GSGS ar vokiškų originalų perspausdinimai, kurių Karūnos autorių teisės ar anoniminio darbo terminas taip pat jau pasibaigęs):

| Teatras | Serija | Kur nuskenuota |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Rytų Europa 1:250 000 (sudaryta 1950-aisiais iš sovietinių ir vokiškų žemėlapių) | UT Austin PCL; kai kurie lapai georeferencuoti UT GeoData |
| IL-2 Normandy, DCS Normandy 2 ir The Channel | AMS **M661** / GSGS 4250, Prancūzija 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 ir **M841** 1:25 000 (Vokietija) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (1951 m. leidimai) ir **L552** 1:250 000 | ANU Open Research (L751 lapai, „copyright expired“), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britų Pirmojo pasaulinio karo apkasų žemėlapiai (ne AMS) | McMaster University; National Library of Scotland (nekomercinės sąlygos) |

AMS lapai turi platumos ir ilgumos žymes kampuose, todėl kiekvienas būtų padėtas keturių kampų pritaikymu ir uždengtas ant reljefo kaip tekstūra, kuriama ir laikoma vietoje, kaip plytelės.

## Kūrėjams {#for-developers}

### `geo` įrašas Parquet lentelėje {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` ir `up` nurodo stulpelius, kuriuose yra rytų ir šiaurės metrai toje pačioje liečiančioje plokštumoje ties (`lat0`, `lon0`) ir aukštis. Įkėlimas išlaiko nuorodą, kai jo susiejimas ima būtent tuos stulpelius (rytai kaip X, šiaurė ir aukštis kaip Y ir Z bet kuria tvarka). Neprivalomas `dcs` įrašas nurodo DCS lentelės paties metrus (x – šiaurė, y – aukštyn, z – rytai) ir jos teatrą: įkėlimas, kuris susieja tuos stulpelius, vietoj to talpinamas per teatro skersinę Merkatoriaus projekciją ([DCS koordinatės](#dcs-coordinates)). Lentelė be `geo` skaitoma kaip anksčiau.

### DCS koordinatės {#dcs-coordinates}

Kiekvienas DCS teatras yra skersinė Merkatoriaus projekcija (WGS84, mastelis 0,9996) su savo centriniu meridianu ir klaidingąja pradžios tašku. DCS x yra šiaurinis poslinkis, z – rytinis. Konstantos yra tos, kurias paskelbia pydcs projektas; matematika yra Krügerio eilutė iki šeštos eilės (Karney 2011), perkelta į [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Fonas DCS metrams statomas tiesiogiai jomis, todėl Watcher DCS lentelė, susieta per `dcs_x`/`dcs_y`/`dcs_z`, DCS reljefo konverterio įrašytas lygis ir fonas dalijasi vienu rėmu. Irako konstantos nepaskelbtos; jos pritaikytos prie paskelbtų atskaitos taškų (4 cm vidutinė kvadratinė paklaida).

Watcher DCS lentelės guli ant pastovaus teatro atskaitos taško tangentinės plokštumos (to paties taško, kurį naudoja teatro parinkiklis, žemiau), todėl kelios misijos viename teatre susilieja išlaikydamos atskaitą ir sutampa su teatro fonu, nejudindamos jo.

### Supaprastinimas ir biudžetas {#simplification-and-budget}

- Pastatai, mažesni nei 20 m², išmetami; 60 m², kai dėžė plačiau nei 30 km, ir 150 m² toliau nei 80 km. Likę pridedami nuo didžiausio, kol pastatai pasiekia 1,5 mln. trikampių.
- Smulkūs keliai, aptarnavimo keliai ir takai išmetami, kai dėžė plotesnė nei 60 km; toliau nei 150 km lieka tik greitkeliai, magistraliniai, pirminiai ir antriniai keliai.
- Visas fonas lieka apie 3 mln. trikampių ribose. Importo pastaboje nurodoma, kiek pastatų buvo paliekta.
