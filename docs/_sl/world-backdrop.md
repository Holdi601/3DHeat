---
title: "Ozadje sveta"
parent: "Ravni in geometrija ozadja"
nav_order: 5
has_children: true
lang: "sl"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Ozadje sveta

Ozadje sveta položi pravo tla pod zapis leta: hribe, ceste, reke, letališča in stavbe, preneseno iz prostih odprtih zemljevidnih podatkov. Uporabite ga, kadar bi zapis Tacview sicer lebdel nad prazno mrežo. Je [nivo](glossary.md), zato toplota in figure ležijo nanj.

## Zgradite ga {#build-one}

1. Naložite zapis leta, ki pove, kje na Zemlji je (datoteka Tacview `.acmi`), ali ne naložite ničesar in v koraku 3 izberite bojišče. Glejte [Vnos podatkov](getting-data-in.md).
2. Odprite **Ozadje / nivo** v stranski vrstici.
3. Pritisnite **Resnični svet kot ozadje**, da zgradite tla pod svojimi podatki. Ali izberite igrino karto v **Bojišče** in pritisnite **Zgradi ozadje bojišča** (ali **Pretakaj bojišče**).
4. Počakajte. Plošča prikazuje napredek (*Ploščice višin*, *Ploščice zemljevida*, *Gradnja ozadja*); **Prekliči** ga ustavi.
5. Leti naokoli. Vrstica z zaslugami za zemljevidne podatke je napisana spodaj desno v pogledu.

Prva gradnja prenese nekaj deset megabajtov. Brskalnik jih hrani, zato druga gradnja istega območja ne prenese ničesar. **Pozabi ploščice zemljevida** jih izbriše. Gumb **Resnični svet kot ozadje** je prikazan samo, kadar naloženi podatki nosijo geografsko referenco (spodaj).

Vse se gradi v ozadnjem delavcu ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultat nadomesti trenutni nivo in se obnaša kot kateri koli [3D nivo](model-levels.md): skriva toploto za seboj, jo reže rez, ima [nastavitve videza](level-appearance.md) in ga je mogoče shraniti v [knjižnico](level-library.md).

## Kje so podatki: geografska referenca {#where-the-data-is-the-geographic-reference}

Nabor podatkov dobi geografsko referenco samo iz vira, ki jo navede:

- **Zapis ACMI**: glava `ReferenceLatitude` in `ReferenceLongitude` ter položaji, ki jih bralnik projicira na ravnino, ki se tam dotika elipsoida WGS84 (X vzhod, Y sever, v metrih; višine so nadmorska višina zapisa). Referenca se ohrani, kadar preslikava vzame **X** in **Y** kot osi tal – tako pravijo lastni namigi zapisa – in se opusti, kadar tla prihajajo iz katerega koli drugega stolpca, na primer ravni svet igre **U** in **V**.
- **Tabela Parquet, katere namigi `heat3d` vsebujejo vnos `geo`** – tabele Watcherja za DCS, MSFS, X-Plane in IL-2 (Tacview). Vnos je opisan pod [Za razvijalce](#for-developers).

Nalaganje več datotek ohrani referenco samo, kadar si jo vse delijo. Vsi drugi nalagalniki so nespremenjeni in je nimajo.

Ozadje se projicira na enak način in nato preko preslikave osi nalaganja, zato pristane pod podatki ne glede na obrnitve ali merilo, ki ga preslikava uporabi.

## Bojišča {#theatres}

Izbirnik **Bojišče** našteva zemljevide resničnega sveta DCS Worlda (Kavkaz, Nevada, Normandija 2, Kanal, Sirija, Perzijski zaliv, Marianske otoke, Marianske otoke II. sv. vojne, Južni Atlantik, Sinaj, Afganistan, Kola, Nemčija v hladni vojni, Irak) in IL-2 Great Battles (Stalingrad, Moskva, Kuban, Rheinland, Normandija, Prohorovka, Veliki Luki, Arras, Odesa, Finski zaliv / Leningrad, Koreja), vsak s svojim okvirjem na Zemlji ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Okviri DCS so razsežnosti, ki so jih izdelali urejevalci iz objavljenih projekcij; okviri IL-2 in tisti DCS, ki so tako označeni, so ocene iz objavljenih velikosti zemljevidov in mest na njihovih robovih – plošča pove, kateri so.

**Zgradi ozadje bojišča** zgradi dve stopnji podrobnosti v eni mreži:

| Stopnja | Območje | Teren | Zemljevid |
|---|---|---|---|
| Bojišče | ves okvir | najgloblji zoom do 10, ki potrebuje največ 64 ploščic višin (okoli 3 km na oglišče nad Kavkazom, 1 km nad Normandijo) | morje, jezera, pokrovnost tal in avtoceste iz največ 64 vektorskih ploščic pri zoomu od 4 do 9 |
| Podrobno območje | **Pod podatki**, **Okoli točke** (širina, dolžina, od 12 do 400 km) ali nič | do zooma 12 v največ 100 ploščicah, največ 500.000 oglišč | vse zgoraj, iz največ 1.500 vektorskih ploščic na najglobljem zoomu do 14, ki se prilega |

Podrobno območje izreže luknjo v mreži bojišča, razširjeno na cele celice, da obe mreži delita robne črte, tanka stena pa zapre šev tam, kjer mreži vzorčita višine različno.

Ko so podatki naloženi, se bojišče zgradi na ravnini podatkov, tako da pristane pod njimi, kakor je zgrajeno. Brez podatkov se zgradi okoli lastne referenčne točke bojišča (cele stopinje blizu njegovega podrobnega območja). Podatki, naloženi pozneje z drugo referenco – zapis ACMI navede svojo – premaknejo ozadje pod njih: točna premaknitev med obema projekcijama se izračuna na mreži 256 × 256 nad ozadjem in se prebere med vozlišči, znotraj metra ali dveh čez celo bojišče ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Ozadje, shranjeno v knjižnico, ohrani svoj položaj in se pri nalaganju pod drugimi podatki premakne na enak način.

### Pretakanje bojišča {#streaming-a-theatre}

**Pretakaj bojišče** prikaže bojišče tako, kot ga prikazuje pregledovalnik zemljevidov simulatorja leta: tla pridejo kot veliko majhnih ploščic okoli kamere, nalagajo se, medtem ko letite, in se odvržejo, ko so izven dosega ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Kvadrantno drevo ploščic Web Mercator.** Korenine pri zoomu 5 pokrivajo 1.500 km okoli kamere, tako da tla segajo čez okvir bojišča do obzorja. Ploščica se razdeli na štiri otroke, dokler je kamera bližje kot 1,4-kratnik njene širine, do zooma 15 (okoli 1 km na ploščico, 15 m med oglišči terena): podrobnost upada z razdaljo, kot upada na zaslonu.
- **Vsaka ploščica ima svojo mrežo**, zgrajeno v delavcu ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): mreža terena 65 × 65 z robom okoli roba (da sosedje pri različnih podrobnostih nikoli ne pokažejo razpoke), pokrovnost tal in morje naslikana nanjo, ceste, železnice, jezera, reke, letališča, izmerjene steze in stavbe zgoraj, po izbiri pa satelitska slika njihovega kvadrata. Upodabljalnik riše ploščice z videzom in pravili globine nivoja, zato skrivajo toploto za seboj kot kateri koli nivo.
- **Najprej grobo.** Ploščice se zahtevajo grobe in bližnje najprej, štiri prenose naenkrat na vir; medtem ko se nalagajo otroci ploščice, ploščica nadomešča njih, zato se pogled takoj napolni in nato izostri.
- **Pomnilnik**: zgrajene ploščice se hranijo do 600 MB, najmanj nedavno narisane se odvržejo najprej. **Prenosi** ostanejo v predpomnilniku ploščic, omejeni na proračun 2 GB, najstarejši najprej ven: vrnitev z letom nad območje ne stane ničesar, in ni omejitve števila gradenj.
- **Shranjeno v knjižnico** kot to, kar pretaka – bojišče, njegove možnosti in njegov položaj na Zemlji – ne kot ploščice: nalaganje ponovno pretaka, iz predpomnilnika ploščic, kjer so ploščice še. Kliki in preglednik zadevajo ploščice, kakor zadevajo kateri koli nivo.
- Oba upodabljalnika rišeta ploščice: preverjeno drug ob drugem na pravi grafični kartici (WebGPU in WebGL2 na isti kartici), vključno s toploto, skrito za grebenom.
- Ko so podatki naloženi, se ploščice zgradijo na ravnini podatkov; podatki, naloženi pozneje na drugi ravnini, jih tam ponovno zgradijo (iz predpomnilnika).
- Izmerjeno na sintetičnih letih nad tremi kraji (Normandija, Nevada, Sirija): okoli 63, 45 in 24 MB ob prvem obisku s slikami; drugi obisk ne prenese ničesar.


## Kaj se gradi {#what-is-built}

| Del | Vir | Kako |
|---|---|---|
| Slike (pretakana bojišča, izbirno) | EOX Sentinel-2 cloudless 2016 | **Satelitski posnetki** prekrijejo tla z mozaikom brez oblakov iz leta 2016 (okoli 10 m na slikovno piko, zoom 14, globlje ploščice ga povečajo) namesto naslikane pokrovnosti; ceste, steze, stavbe in imena ostanejo zgoraj. |
| Natančnejše slike (ZDA, Francija) | USGS National Map ortofoto; IGN BD ORTHO | Ob vklopljenih **Satelitskih posnetkih** ploščica zemljevida pri zoomu 13, ki leži v celoti znotraj sklenjenih ZDA ali metropolitanske Francije, vzame namesto tega nacionalni ortofoto, dva zooma globlje od ploščice (šestnajst njenih ploščic v eni sliki, okoli 1–2 m na piko z bližine). Drugod EOX. |
| Teren (pretakana bojišča) | Mapterhorn | Copernicus GLO-30 povsod (okoli 19 m na piko pri zoomu 12), merilo metrov tam, kjer je v njem lastna izmera države (Francija, ZDA in druge); branje dva zooma grobeje od vsake ploščice. AWS Terrain Tiles, če Mapterhorna ni mogoče doseči. |
| Teren | AWS Terrain Tiles (Terrarium PNG) | Mreža višin nad okvirjem: zoom je najgloblji do 12 (okoli 28 m na piko pri 43° S), ki potrebuje največ 36 ploščic, mreža pa je prorešena na največ 400.000 oglišč. Riše se kot tla z običajnimi reliefnimi znaki. |
| Ceste, železnice | Vektorske ploščice OpenFreeMap, sloj `transportation` | Ravni trakovi, položeni na teren, zgoščeni na razmik terena in dvignjeni za nekaj odstotkov njega, da se z njim ne borijo. Širine po razredu, od 16 m (avtocesta) do 3 m (steza, železnica); nikoli ožje od diagonale okvirja / 5000. Poti, trajekti in predori so izpuščeni. |
| Letališča | sloj `aeroway` | Poligoni steze, vozne steze, parkirišča in helikopterske ploščadi položeni kot tla; črte stez in voznih stez kot trakovi po 45 m in 18 m. |
| Voda | sloj `water` | Morje ravno pri 0 m, jezera in ribniki ravni pri svoji najnižji obali, reke položene. Riše se kot voda: ravno senčena, brez obrisov. |
| Pokrovnost tal | sloja `landcover` in `landuse` | Naslikano na lastna oglišča terena, brez dodatnih trikotnikov: gozdovi, travniki in parki zeleno, kmetijske površine slamnato, mokrišča, pesek, skala, led; stanovanjska, industrijska, komercialna, vojaška in kamnolomna območja v zbranih tonih. Voda je naslikana tudi pod vodno površino, da obala bere z vsake višine. Goli teren dobi tih barvni odtenek višine (nižinsko sivo-zeleno, višavsko rjavo, sneg nad 3.000 m). Berljivo pri ločljivosti terena: okoli 30–45 m v podrobnem območju, kilometri v bojišču. |
| Imena krajev | sloja `place` in `aerodrome_label` | Mesta, kraji in vasi ter letališča z ICAO kodo, napisana čez pogled; kako daleč se vsaka vrsta prikaže, raste z višino kamere, največ 70 naenkrat. |
| Izmerjene steze | [OurAirports](https://ourairports.com/data/) `runways.csv` (javna last) | Izbirno (**Letališke steze iz OurAirports**, privzeto vklopljeno): vsaka odprta steza z obema koncema na seznamu, od praga do praga pri navedeni širini, z bočnimi črtami, črtkano sredinsko črto in pragovnimi črtami. En seznam 4 MB, prenesen enkrat in hranjen v predpomnilniku. |
| Stavbe | sloj `building` | Tlorisi, izvlečeni od `render_min_height` do `render_height` (6 m, kadar manjka) nad najnižjimi tlemi pod njimi; deli `hide_3d` so izpuščeni. Riše se kot konstrukcije. |

Vektorske ploščice se berejo pri zoomu 14 (edini zoom s stavbami), kadar okvir potrebuje največ 300 od njih, sicer pri najglobljem zoomu, ki to zmore, do 8. Večje območje dobi samo teren.

### Videz {#look}

Ozadje se začne z vklopljenim **Prikaži zajeto barvo** – barva je tisto, kar loči svetlo cesto od sivih tal, na katerih leži, temno stezo od njene ploščadi – z izklopljenimi robovi trikotnikov tal, ker pravilna mreža ne pove ničesar, z nežnimi obrisi, z neprozornim morjem (tla pod njim bi se bojevala z površino za globino daleč stran) in s stavbami, svetlo sivimi in skoraj polnimi, kot jih riše zemljevid. Odprto morje ne dobi nobenih trikotnikov tal. Vse drugo je privzet videz modelskega nivoja.

## Zasluge na platnu {#credits-on-the-canvas}

Medtem ko je ozadje nivo, je zasluga njegovih virov napisana spodaj desno v pogledu, brez potrebe po kliku, da jo posnetki zaslona in upodobljeni videi nosijo s seboj:

> OpenFreeMap © OpenMapTiles · Podatki © sodelujoči pri OpenStreetMap · Višine: Terrain Tiles – SRTM, GMTED2010, 3DEP z dovoljenjem U.S. Geological Survey; ETOPO1: NOAA; in drugi

Vsak del povezuje na stran z navedbo avtorstva njegovega vira (openstreetmap.org/copyright in [seznam navedb](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) Terrain Tiles). Ozadje, shranjeno v knjižnico, ohrani svoje zasluge in jih ob nalaganju prikaže znova. Besedilo se prevaja skupaj s pregledovalnikom; imena ne.

## Viri in njihovi pogoji {#sources-and-their-terms}

Vsak vir, njegova licenca in kako ozadje ostane v njegovih pogojih: [Ozadje sveta: viri in pogoji](world-backdrop-sources.md).

## Predpomnilnik ploščic {#the-tile-cache}

Vsaka ploščica in TileJSON vektorskih ploščic se hrani v predpomnilniku API-ja Cache brskalnika pod `3dheat-world-tiles-v1`, po URL-ju. Drugo gradnja istega območja ne naredi nobene zahteve in deluje brez povezave: TileJSON se najprej vpraša in, kadar to ne uspe, njegova shranjena kopija navede ploščice, ki so že v hrambi. Ploščice, ki jih strežnik nima (odprto morje, 404), se prav tako zapomnijo kot odsotne.

URL-ji vektorskih ploščic nosijo datum izgradnje zemljevida, zato po tem, ko OpenFreeMap objavi novo izgradnjo, naslednje ozadje prenese sveže ploščice, stare pa ostanejo, dokler jih ne počistite. Predpomnilnik je omejen na 2 GB: čez mejo se najprej izbrišejo ploščice, shranjene najdlje nazaj. **Pozabi ploščice zemljevida** izbriše ves predpomnilnik. Predpomnilnik potrebuje varen izvor (`https://` ali `localhost`); drugje vsaka gradnja prenese znova.

## V primerjavi s Tacview {#compared-with-tacview}

Preverjeno z očmi na enem kraju na bojišče, s sintetičnimi zapisi: vzletne steze ležijo na sredinskih črtah narisanih stez, prehodi obale padajo na obalo. Tacviewova stran je iz njegove dokumentacije in njegovih objavljenih posnetkov zaslona (tacview.net, njegova stran na Steamu), ne iz tega, da bi ga tukaj zagnali.

| | Tacview 1.9 | To ozadje, pretakano |
|---|---|---|
| Obseg | ves globus | 1.500 km okoli kamere, kjer koli je |
| Teren | ETOPO1 (okoli 1,25 km) vgrajen; SRTM 25–75 m, če uporabnik namesti datoteke; teren DCS izvožen iz DCS | Copernicus GLO-30 (Mapterhorn), merilo metrov v Franciji in ZDA |
| Slike | nobene vgrajene; teksture, ki jih uporabnik prenese (Mapview, SAS Planet, dodatki, na primer karta Kavkaza VFR) | EOX Sentinel-2 cloudless 2016, okoli 10 m, pretakano |
| Pokrovnost tal | nobene, razen če je v teksturi | iz OpenStreetMap, naslikano na teren (brez slik) |
| Ceste, železnice | nobene, razen če je v teksturi | vsak razred blizu kamere, glavne ceste daleč stran |
| Stavbe | nobene | izvlečeni tlorisi blizu kamere |
| Letališča | oznake in steze kot ravne škatle, brez oznak | steze iz izmerjenih koncev z bočnimi črtami, sredinsko črto in pragovnimi črtami; vozne steze, ploščadi; imena z ICAO kodami |
| Imena krajev | nekatere oznake vasi in mest | mesta, kraji, vasi, letališča, po razdalji in višini |

Kje še vedno zaostaja:

- **Ločljivost slik**: zunaj ZDA in Francije je 10 m satelitski mozaik mehek pod okoli 2 km; Tacview z uporabniško nameščeno teksturo zoom 17 je tam ostrejši.
- **Teren v obliki DCS**: Tacview lahko prikaže teren, ki ga DCS sam izvozi; tukaj je pravi Zemljin teren, ki se razlikuje od terena DCS tam, kjer so ga oblikovalci zemljevida spremenili.
- **Ukrivljenost**: tla so ravna ploskev, zato obzorje ni obzorje ukrivljene Zemlje; Tacview riše kroglo.
- **Hitrost**: prvi obisk kraja prenese več deset megabajtov, preden je ostro; v brskalniku z upodabljanjem na procesorju (posnetki zaslona) riše pri nekaj sličicah na sekundo z nekaj sto ploščicami.

## Omejitve in kaj pride pozneje {#limits-and-what-comes-later}

- **Ločljivost terena**: okoli 30 m najboljše, na velikih območjih grobeje. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF na AWS, brez ključa, fiksno besedilo zaslug) je boljši vir: 30 m povsod, GLO-90 tam, kjer ima GLO-30 luknje (Armenija in Azerbajdžan, ki ju pokriva DCS Caucasus). Potrebuje bralnik GeoTIFF in še ni uporabljen.
- **Boljši teren**: Copernicus GLO-30 na AWS ne pošilja glav CORS, zato ga brskalnik ne more brati; zrcalo OpenTopography se lahko bere (CORS in obsegi), vendar njihovi pogoji za izvajanje javne aplikacije niso znani – treba je vprašati, preden se uporabi. Mapterhorn že nosi GLO-30.
- **Ukrivljenost**: tla so ravna ploskev in višine se ne znižujejo zaradi ukrivljenosti Zemlje, kar ustreza načinu, kako so zapisi postavljeni (višina kot višina); daleč od reference se oboje premika skupaj, za manj kot tisočinko na 100 km. Upogibanje samo ploščic bi jih oddaljilo od podatkov daleč stran, zato ni ponujeno. Ukrivljeno obzorje potrebuje isti padec – kvadrat razdalje od kamere, deljen z dvakratnikom polmera Zemlje – uporabljen v vsakem prehodu, ki riše položaj (nivo, ploščice, toplota, črte, škatle, oznake, izbiranje) kot skupno uniformo; pravi globus potrebuje še položaje podatkov, središčne na Zemlji, in upodabljanje relativno na kamero. Oboje je načrtovano z načinom globusa.
- **Samo sedanji svet**: zgodovinski zemljevidi DCS in IL-2 (Normandija 2, Kanal, Nemčija v hladni vojni, vsak zemljevid IL-2) so narisani z današnjimi mesti, cestami in obalo; plošča to pove. Obdobna letališča niso narisana.
- **Ni načina globusa**: ozadje je ravna lokalna ploskev. Pogled na celotno Zemljo je načrtovan.
- Ceste so na velikih območjih razširjene, da ostanejo vidne; zblizi so širše, kot so v resnici.
- Imena bojišč DCS v tabelah Watcherja se ujemajo, kakor jih DCS poda v `mission.theatre`; ime, ki ni na seznamu, se vrne na prvi položaj, zaokrožen na cele stopinje, in samo na širino in dolžino.

## Zgodovinski zemljevidi (še niso zgrajeni) {#historical-maps-not-built-yet}

Obdobni zemljevidi bi lahko kasneje teksturirali zgodovinska bojišča. Serije Ameriške vojaške službe za zemljevide (AMS) so dela zveznih ameriških vlade, na splošno obravnavana kot javna last (preverite zapis vsakega skena; mnogi so ponatisi britanskih GSGS ali nemških izvirnikov, katerih avtorske pravice krone ali rok za anonimna dela pa je prav tako pretekel):

| Bojišče | Serija | Kje je skenirano |
|---|---|---|
| IL-2 Stalingrad, Moskva, Kuban, Veliki Luki, Prohorovka, Leningrad | AMS **N501**, Vzhodna Evropa 1:250.000 (sestavljena v 50. letih iz sovjetskih in nemških zemljevidov) | UT Austin PCL; nekateri listi georeferencirani pri UT GeoData |
| IL-2 Normandija, DCS Normandija 2 in Kanal | AMS **M661** / GSGS 4250, Francija 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 in **M841** 1:25.000 (Nemčija) | UT Austin PCL |
| IL-2 Koreja | AMS **L751** 1:50.000 (izdaje iz leta 1951) in **L552** 1:250.000 | ANU Open Research (listi L751, "avtorske pravice potekle"), UT Austin PCL, Yale |
| IL-2 Arras (Leteči cirkus) | britanski zemljevidi rovov iz prve svetovne vojne (ne AMS) | McMaster University; National Library of Scotland (nekomercialni pogoji) |

Listi AMS nosijo oznake zemljepisne širine in dolžine na svojih vogalih, zato bi
vsakega postavili s prilagoditvijo na štiri vogale in ga položili na teren kot teksturo,
zgrajeno in shranjeno lokalno kot ploščice.


## Za razvijalce {#for-developers}

### Vnos `geo` v tabeli Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` in `up` imenujejo stolpce, ki hranijo vzhodne in severne metre na isti tangentni ravnini pri (`lat0`, `lon0`) in višino. Nalaganje ohrani referenco, kadar njegova preslikava vzame prav te stolpce (vzhod kot X, sever in višina kot Y in Z na katero koli stran). Neobvezni vnos `dcs` imenuje lastne metre tabele DCS (x sever, y navzgor, z vzhod) in njeno bojišče: nalaganje, ki preslika te stolpce, se namesto tega postavi preko transverzalne Mercatorjeve projekcije bojišča ([koordinate DCS](#dcs-coordinates)). Tabela brez `geo` se bere kot prej.

### Koordinate DCS {#dcs-coordinates}

Vsako bojišče DCS je transverzalna Mercatorjeva projekcija (WGS84, merilo 0,9996) s svojim središčnim meridianom in lažnim izhodiščem; x DCS je severni premik, z pa vzhodni. Konstante so tiste, ki jih objavlja projekt pydcs; matematika je Krügerjeva vrsta do šestega reda (Karney 2011), prenesena v [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Ozadje za metre DCS se zgradi naravnost v njih, zato tabela DCS Watcherja, preslikana z `dcs_x`/`dcs_y`/`dcs_z`, nivo, ki ga je zapisal pretvornik terena DCS, in ozadje vsi delijo en okvir. Konstante za Irak niso objavljene; prilagojene so objavljenim referenčnim točkam (koren srednjega kvadratnega odstopanja 4 cm).

Tabele DCS Watcherja so na tangentni ravnini pri fiksni referenčni točki bojišča (ista točka, ki jo uporablja izbirnik bojišč, spodaj), zato se več misij na enem bojišču zlije z ohranjeno referenco in se poravna z ozadjem bojišča, ne da bi se premaknilo.

### Poenostavitev in proračun {#simplification-and-budget}

- Stavbe pod 20 m² se izpustijo; 60 m², kadar je okvir širši od 30 km, 150 m² čez 80 km. Preostale se dodajajo od največje naprej, dokler stavbe ne dosežejo 1,5 M trikotnikov.
- Manjše ceste, servisne ceste in steze se izpustijo čez 60 km; čez 150 km ostanejo samo avtoceste, glavne, primarne in sekundarne ceste.
- Celotno ozadje ostane pod okoli 3 M trikotnikov. Uvozna opomba pove, koliko stavb je bilo izpuščenih.
