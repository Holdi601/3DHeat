---
title: "Pozadina svijeta"
parent: "Nivoi i geometrija pozadine"
nav_order: 5
has_children: true
lang: "bs"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Pozadina svijeta

Stvarni svijet kao pozadina stavlja pravo tlo ispod snimka leta: brda, puteve, rijeke, aerodrome i zgrade, preuzete iz slobodnih otvorenih podataka o mapi. Koristite je kada bi snimak Tacview-a inače lebdio nad praznom mrežom. To je [nivo](glossary.md), pa toplota i figure stoje na njemu.

## Izgradite jednu {#build-one}

1. Učitajte snimak leta koji kaže gdje je na zemlji (Tacview `.acmi` datoteka), ili ništa ne učitavajte i izaberite ratište u koraku 3. Vidi [Unos podataka](getting-data-in.md).
2. Otvorite **Pozadina / nivo** u bočnoj traci.
3. Pritisnite **Stvarni svijet kao pozadina** da izgradite tlo ispod vaših podataka. Ili izaberite mapu igre u **Ratište** i pritisnite **Izgradi pozadinu ratišta** (ili **Strimaj ratište**).
4. Sačekajte. Panel prikazuje napredak (*Pločice visina*, *Pločice mape*, *Izgradnja pozadine*); **Otkaži** zaustavlja.
5. Letite okolo. Tekst o zaslugama za podatke o mapi upisan je dolje desno u prikazu.

Prvo građenje preuzima nekoliko desetina megabajta. Pregledač ih zadržava, pa drugo građenje istog područja ne preuzima ništa. **Zaboravi pločice mape** ih briše. Dugme **Stvarni svijet kao pozadina** prikazuje se samo kada učitani podaci nose geografsku referencu (dolje).

Sve se gradi u pozadinskom radniku ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultat zamjenjuje trenutni nivo i ponaša se kao svaki [3D nivo](model-levels.md): sakriva toplotu iza sebe, sječe je presjek, ima [kontrole izgleda](level-appearance.md) i može se sačuvati u [biblioteci](level-library.md).

## Gdje su podaci: geografska referenca {#where-the-data-is-the-geographic-reference}

Skup podataka dobija geografsku referencu samo iz izvora koji je navodi:

- **ACMI snimak**: `ReferenceLatitude` i `ReferenceLongitude` iz njegovog zaglavlja, i pozicije koje čitač projektuje na ravan koja dodiruje WGS84 elipsoid na tom mjestu (X istok, Y sjever, metri; visine su nadmorska visina snimka). Referenca se čuva kada preslikavanje uzima **X** i **Y** kao osnovne ose – što kažu i sopstveni nagovještaji snimka – a odbacuje se kada tlo dolazi iz neke druge kolone, kao što su igrine vlastite ravne **U** i **V** koordinate.
- **Parquet tabela čiji `heat3d` nagovještaji nose `geo` stavku** – DCS, MSFS, X-Plane i IL-2 (Tacview) tabele [Watcher-a](https://github.com/Holdi601/3DHeat-Watcher). Stavka je opisana u odjeljku [Za programere](#for-developers).

Učitavanje više datoteka čuva referencu samo kada sve dijele istu. Svaki drugi učitavač je nepromijenjen i ne nosi nijednu.

Pozadina se projektuje na isti način, pa prolazi kroz preslikavanje osa učitavanja, i tako ostaje ispod podataka bez obzira na to koje obrtanje ili razmjeru preslikavanje primjenjuje.

## Ratišta {#theatres}

Birač **Ratište** nudi stvarne karte DCS World-a (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) i IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), svaku sa njenim okvirom na zemlji ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS okviri su obuhvati koje su urednici izračunali iz objavljenih projekcija; IL-2 okviri, i DCS oni označeni tako, su procjene iz objavljenih veličina karata i gradova na njihovim ivicama – panel kaže koji je koji.

**Izgradi pozadinu ratišta** pravi dva nivoa detalja u jednoj mreži:

| Nivo | Područje | Teren | Mapa |
|---|---|---|---|
| Ratište | cijeli okvir | najdublji zum do 10, koji treba najviše 64 pločice visina (oko 3 km po vrhu nad Kavkazom, 1 km nad Normandijom) | more, jezera, pokrivač zemljišta i autoputevi iz najviše 64 vektorske pločice, zum od 4 do 9 |
| Detaljno područje | **Ispod podataka**, **Oko tačke** (geografska širina, dužina, 12 do 400 km), ili nijedno | do zuma 12 u najviše 100 pločica, najviše 500 000 vrhova | sve dolje, iz najviše 1 500 vektorskih pločica na najdubljem zumu do 14 koji stane |

Detaljno područje probija rupu u mreži ratišta, proširenu na cijele ćelije da obje mreže dijele svoje ivične linije, a tanak zid zatvara šav tamo gdje uzorkuju visine drugačije.

Sa učitanim podacima ratište se gradi na ravni podataka, pa leži ispod njih kako je izgrađeno. Bez podataka gradi se oko sopstvene referentne tačke ratišta (cijeli stepeni u blizini njegovog detaljnog područja). Podaci učitani kasnije na drugoj referenci – ACMI datoteka navodi svoju – pomjeraju pozadinu ispod sebe: tačan pomak između dvije projekcije računa se na mreži 256 × 256 preko pozadine i čita između čvorova, u granicama metra ili dva preko cijelog ratišta ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Pozadina sačuvana u biblioteci zadržava svoje mjesto i pomjera se na isti način kada se učita ispod drugih podataka.

### Strimovanje ratišta {#streaming-a-theatre}

**Strimaj ratište** prikazuje ratište kao što to radi pregledač mapa za simulatore leta: tlo dolazi kao mnogo malih pločica oko kamere, učitava se dok letite i odbacuje se kada je van dosega ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Kvadrodrvo Web Mercator pločica.** Korijeni na zumu 5 pokrivaju 1 500 km oko kamere, pa tlo seže preko okvira ratišta do horizonta. Pločica se dijeli na četiri djeteta dok je kamera bliža od 1,4 puta njene širine, do zuma 15 (oko 1 km po pločici, 15 m između vrhova terena): detalj opada sa rastojanjem kako opada na ekranu.
- **Svaka pločica sopstveni model**, građen u radniku ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): mreža terena 65 × 65 sa obrubom oko ivice (da se susjedi na različitim detaljima nikad ne pokažu kao pukotina), pokrivač zemljišta i more naslikani na njoj, putevi, pruge, jezera, rijeke, aerodromi, izmjerene piste i zgrade na vrhu, i po izboru satelitska slika njenog kvadrata. Renderer crta pločice sa izgledom i pravilima dubine nivoa, pa sakrivaju toplotu iza sebe kao svaki nivo.
- **Najprije grubo.** Pločice se traže grubo i blizu prvo, po četiri preuzimanja odjednom po izvoru; dok se djeca pločice učitavaju, pločica stoji umjesto njih, pa se prikaz odmah popuni i zatim izoštri.
- **Memorija**: izgrađene pločice se čuvaju do 600 MB, najmanje nedavno nacrtane odbacuju se prve. **Preuzimanja** ostaju u kešu pločica, ograničena na budžet od 2 GB, najstarija prva van: ponovni let iznad područja ne košta ništa, i nema ograničenja po gradnji.
- **Sačuvano u biblioteci** kao ono što strimuje – ratište, njegove opcije i njegovo mjesto na zemlji – a ne kao pločice: učitavanje ponovo strimuje, iz keša pločica tamo gdje su pločice još tu. Klikovi i inspektor pogađaju pločice kao što pogađaju svaki nivo.
- Oba renderera crtaju pločice: provjereno jedan pored drugog na pravom GPU-u (WebGPU i WebGL2 na istoj kartici), uključujući toplotu sakrivenu iza grebena.
- Sa učitanim podacima pločice se grade na ravni podataka; podaci učitani kasnije na drugoj ravni grade ih ponovo tamo (iz keša).
- Izmjereno na sintetičkim letovima nad tri mjesta (Normandija, Nevada, Sirija): oko 63, 45 i 24 MB pri prvoj poseti sa slikama; druga poseta ne preuzima ništa.

## Šta se gradi {#what-is-built}

| Dio | Izvor | Kako |
|---|---|---|
| Snimci (strimovana ratišta, opciono) | EOX Sentinel-2 cloudless 2016 | **Satelitski snimci** prekrivaju tlo bez oblaka iz 2016. mozaika (oko 10 m po pikselu, zum 14, dublje pločice ga uvećavaju) umjesto naslikanog pokrivača zemljišta; putevi, piste, zgrade i nazivi ostaju na vrhu. |
| Finiji snimci (SAD, Francuska) | USGS National Map ortofoto snimci; IGN BD ORTHO | Uz uključene **Satelitske snimke**, pločica mape sa zuma 13 koja leži potpuno unutar sadržanih Sjedinjenih Država ili francuske metropole umjesto toga uzima nacionalni ortofoto, dva zuma dublje od pločice (šesnaest njenih pločica složeno u jednu sliku, oko 1-2 m po pikselu izbliza). Svuda drugdje EOX. |
| Teren (strimovana ratišta) | Mapterhorn | Copernicus GLO-30 svuda (oko 19 m po pikselu na zumu 12), na metarskoj skali gdje je u njemu državna sopstvena izmjera (Francuska, SAD i drugi); čita se dva zuma grublje od svake pločice. AWS Terrain Tiles ako se Mapterhorn ne može dostići. |
| Teren | AWS Terrain Tiles (Terrarium PNG) | Mreža visina preko okvira: zum je najdublji do 12 (oko 28 m po pikselu na 43° N) koji treba najviše 36 pločica, a mreža se proređuje na najviše 400 000 vrhova. Crta se kao tlo sa uobičajenim reljefnim znacima. |
| Putevi, pruge | OpenFreeMap vektorske pločice, sloj `transportation` | Ravne trake položene na teren, zgusnute na razmak terena i podignute za nekoliko procenata njega da se ne bore sa njim. Širine po klasi, od 16 m (autoput) do 3 m (staza, pruga); nikad uže od dijagonale okvira / 5000. Staze, trajekti i tuneli se izostavljaju. |
| Aerodromi | sloj `aeroway` | Poligoni piste, staze za rulanje, platforme i heliodroma položeni kao tlo; linije piste i staze za rulanje kao trake od 45 m i 18 m. |
| Voda | sloj `water` | More ravno na 0 m, jezera i bare ravno na najnižoj obali, rijeke položene. Crta se kao voda: ravno osjenčeno, bez kontura. |
| Pokrivač zemljišta | slojevi `landcover` i `landuse` | Naslikano na sopstvene vrhove terena, bez dodatnih trouglova: šume, travnjaci i parkovi zeleni, poljoprivredno zemljište slamnato, močvara, pijesak, stijena, led; stambena, industrijska, komercijalna, vojna i kamenolomska područja prigušenim tonovima. Voda se slika i ispod površine vode, pa obala čitljiva sa svake visine. Golo tlo dobija tihu nijansu visine (nizijsko sivo-zeleno, planinsko smeđe, snijeg iznad 3 000 m). Čitljivo na rezoluciji terena: oko 30-45 m u detaljnom području, kilometri u ratištu. |
| Nazivi mjesta | slojevi `place` i `aerodrome_label` | Gradovi, varošice i sela, i aerodromi sa svojim ICAO kodom, ispisani preko prikaza; koliko koja vrsta se prikazuje raste sa visinom kamere, najviše 70 istovremeno. |
| Izmjerene piste | [OurAirports](https://ourairports.com/data/) `runways.csv` (javno vlasništvo) | Opciono (**Piste iz OurAirports**, podrazumijevano uključeno): svaka otvorena pista sa oba kraja na spisku, od praga do praga na navedenoj širini, sa bočnim prugama, isprekidanom središnjom linijom i pragovima. Jedan spisak od 4 MB, preuzet jednom i čuvan u kešu. |
| Zgrade | sloj `building` | Otisci izvučeni od `render_min_height` do `render_height` (6 m kada nedostaje) iznad najnižeg tla ispod njih; dijelovi `hide_3d` preskoče se. Crtaju se kao građevine. |

Vektorske pločice se čitaju na zumu 14 (jedini zum sa zgradama) kada okvir treba najviše 300 njih, inače na najdubljem zumu koji to zahtijeva, do 8. Veće područje dobija samo teren.

### Izgled {#look}

Pozadina počinje sa uključenom **Prikaži snimljenu boju** – boja je ono što razlikuje svijetao put od sivog tla na kojem leži, tamnu pistu od njene platforme – sa isključenim ivicama trouglova tla, jer pravilna mreža ništa ne kaže, s blagim konturama, neprozirnim morem (podloga ispod njega bi se borila sa površinom za dubinu iz daljine), i zgradama svijetlo sivim i gotovo punim, kako ih mapa crta. Otvoreno more ne dobija nikakve trouglove tla. Sve ostalo je podrazumijevani izgled modelskog nivoa.

## Zasluge na platnu {#credits-on-the-canvas}

Dok je pozadina nivo, zasluge njenih izvora upisuju se dolje desno u prikazu, bez potrebe za klikom, da snimci ekrana i prikazani video nose ih:

> OpenFreeMap © OpenMapTiles · Podaci © OpenStreetMap contributors · Visine: Terrain Tiles – SRTM, GMTED2010, 3DEP ljubaznošću U.S. Geological Survey; ETOPO1: NOAA; i drugi

Svaki dio vodi na stranicu sa atribucijom svog izvora (openstreetmap.org/copyright i [spisak atribucija](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) Terrain Tiles). Pozadina sačuvana u biblioteci zadržava svoje zasluge i pokazuje ih ponovo kada se učita. Tekst se prevodi zajedno sa pregledačem; nazivi se ne prevode.

## Izvori i njihovi uslovi {#sources-and-their-terms}

Svaki izvor, njegova licenca i kako pozadina ostaje unutar uslova: [Pozadina svijeta: izvori i uslovi](world-backdrop-sources.md).

## Keš pločica {#the-tile-cache}

Svaka pločica, i TileJSON vektorskih pločica, čuva se u Cache API-ju pregledača pod `3dheat-world-tiles-v1`, po URL-u. Druga gradnja istog područja ne šalje nijedan zahtjev i radi bez mreže: TileJSON se prvo traži i, kada to ne uspije, njegova sačuvana kopija imenuje pločice koje su već tu. Pločice koje server nema (otvoreno more, 404) pamte se kao odsutne.

URL-ovi vektorskih pločica nose datum izrade mape, pa nakon što OpenFreeMap objavi novu izradu, sljedeća pozadina preuzima nove pločice, a stare ostaju dok se ne obrišu. Keš je ograničen na 2 GB: kada ga pređe, prvo se brišu pločice sačuvane najdavnije. **Zaboravi pločice mape** briše cijeli keš. Keš traži siguran izvor (`https://` ili `localhost`); drugdje svaka gradnja ponovo preuzima.

## U poređenju sa Tacview-om {#compared-with-tacview}

Provjereno okom na po jednom mjestu za svako ratište, sa sintetičkim snimcima: vožnje za polijetanje leže na središnjim linijama nacrtanih pista, prelasci obale padaju na obalu. Tacview-ova strana je iz njegove dokumentacije i objavljenih snimaka ekrana (tacview.net, njegova Steam stranica), a ne iz pokretanja ovdje.

| | Tacview 1.9 | Ova pozadina, strimovana |
|---|---|---|
| Obuhvat | cijeli globus | 1 500 km oko kamere, gdje god ona bila |
| Teren | ETOPO1 (oko 1,25 km) ugrađen; SRTM 25-75 m ako korisnik instalira datoteke; DCS teren izvezen iz DCS-a | Copernicus GLO-30 (Mapterhorn), metarska skala u Francuskoj i SAD |
| Snimci | nijedan ugrađen; teksture koje korisnik preuzima (Mapview, SAS Planet, dodaci kao VFR karta Kavkaza) | EOX Sentinel-2 cloudless 2016, oko 10 m, strimovano |
| Pokrivač zemljišta | nijedan, osim ako je u teksturi | iz OpenStreetMap-a, naslikano na terenu (bez snimaka) |
| Putevi, pruge | nijedan, osim ako je u teksturi | svaka klasa blizu kamere, glavni putevi daleko |
| Zgrade | nijedna | izvučeni otisci blizu kamere |
| Aerodromi | oznake i piste kao ravni kvadri, bez oznaka | piste sa izmjerenih krajeva sa bočnim prugama, središnjom linijom i pragovima; staze za rulanje, platforme; nazivi sa ICAO kodovima |
| Nazivi mjesta | neke oznake sela i gradova | gradovi, varošice, sela, aerodromi, po rastojanju i visini |

Gdje i dalje zaostaje:

- **Rezolucija snimaka**: van SAD-a i Francuske 10 m satelitski mozaik je mekan ispod oko 2 km; Tacview sa teksturom od zuma 17 koju instalira korisnik je tamo oštriji.
- **Teren u DCS-ovom sopstvenom obliku**: Tacview može prikazati teren koji sam DCS izvozi; ovdje je to stvarna zemlja, koja se razlikuje od DCS-ovog terena tamo gdje su modelari karte to izmijenili.
- **Zakrivljenost**: tlo je ravna ravan, pa horizont nije horizont zakrivljene zemlje; Tacview crta sferu.
- **Brzina**: prva poseta mjestu preuzima desetine megabajta prije nego što bude oštro; u pregledaču sa softverskim renderovanjem (snimci ekrana) crta se nekoliko kadrova u sekundi sa nekoliko stotina pločica.

## Ograničenja i šta dolazi kasnije {#limits-and-what-comes-later}

- **Rezolucija terena**: oko 30 m u najboljem slučaju, a grublje na velikim površinama. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF na AWS-u, bez ključa, fiksan tekst zasluga) je bolji izvor: 30 m svuda, GLO-90 gdje GLO-30 ima rupe (Armenija i Azerbejdžan, koje pokriva DCS Caucasus). Treba mu čitač GeoTIFF-a i još se ne koristi.
- **Bolji teren**: Copernicus GLO-30 na AWS-u ne šalje CORS zaglavlja, pa ga pregledač ne može čitati; OpenTopography-jevo ogledalo može se čitati (CORS i opsezi), ali njihovi uslovi za javnu aplikaciju u radu nisu poznati – treba pitati prije bilo kakve upotrebe. Mapterhorn već nosi GLO-30.
- **Zakrivljenost**: tlo je ravna ravan i visine se ne spuštaju zbog zakrivljenosti zemlje, što odgovara načinu na koji su snimci postavljeni (visina kao visina); daleko od reference oboje se pomjeraju zajedno, za manje od dijela na hiljadu na 100 km. Savijanje samo pločica bi ih odvojilo od podataka daleko, pa se ne nudi. Zakrivljeni horizont treba isti pad – kvadrat rastojanja od kamere podijeljen sa dvostrukim poluprečnikom zemlje – primijenjen u svakom prolazu koji crta poziciju (nivo, pločice, toplota, linije, kutije, nazivi, biranje) kao jedna zajednička uniforma; pravi globus treba i pozicije podataka centrirane na zemlju i renderovanje relativno prema kameri. Oboje je planirano uz režim globusa.
- **Samo sadašnji svijet**: istorijske karte DCS-a i IL-2 (Normandy 2, The Channel, Germany Cold War, svaka IL-2 karta) crtaju se sa današnjim gradovima, putevima i obalnim radovima; panel to kaže. Aerodromi iz tog perioda se ne crtaju.
- **Nema režima globusa**: pozadina je ravna lokalna ravan. Pogled na cijelu Zemlju je planiran.
- Putevi se šire na velikim površinama da bi ostali vidljivi; izbliza su širi nego u stvarnosti.
- Nazivi DCS ratišta u Watcher-ovim tabelama podudaraju se onako kako ih DCS daje u `mission.theatre`; naziv koji nije na spisku pada na prvi fiks zaokružen na cijele stepene, i na samu geografsku širinu i dužinu.

## Istorijske karte (još nisu izgrađene) {#historical-maps-not-built-yet}

Karte iz tog perioda mogle bi kasnije da oblože istorijska ratišta. Serije Američke službe za mapiranje (AMS) su američka savezna vladina djela, uglavnom tretirana kao javno vlasništvo (provjerite zapis svakog skena; mnoge su ponovna izdanja britanskih GSGS ili njemačkih originala, čiji su autorski rok krunskog autorstva ili anonimnog djela takođe istekli):

| Ratište | Serija | Gdje je skenirano |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Istočna Evropa 1:250 000 (sastavljena 1950-ih iz sovjetskih i njemačkih karata) | UT Austin PCL; neki listovi georeferencirani na UT GeoData |
| IL-2 Normandy, DCS Normandy 2 i The Channel | AMS **M661** / GSGS 4250, Francuska 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 i **M841** 1:25 000 (Njemačka) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (izdanja iz 1951) i **L552** 1:250 000 | ANU Open Research (listovi L751, „autorsko pravo isteklo“), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britanske karte rovova iz Prvog svjetskog rata (ne AMS) | McMaster University; National Library of Scotland (nekomercijalni uslovi) |

Listovi AMS-a nose oznake geografske širine i dužine na uglovima, pa bi se svaki postavio poklapanjem po četiri ugla i položio na teren kao tekstura, građen i čuvan lokalno kao pločice.

## Za programere {#for-developers}

### `geo` stavka u Parquet tabeli {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` i `up` navode kolone koje drže metre istoka i sjevera na istoj tangentnoj ravni u (`lat0`, `lon0`) i visinu. Učitavanje nosi referencu kada njegovo preslikavanje uzima upravo te kolone (istok kao X, sjever i visina kao Y i Z, u oba smjera). Opciona `dcs` stavka navodi sopstvene metre DCS tabele (x sjever, y gore, z istok) i njeno ratište: učitavanje koje preslikava te kolone umjesto toga se smješta kroz Transverzalnu Merkatorovu projekciju ratišta ([DCS koordinate](#dcs-coordinates)). Tabela bez `geo` čita se kao prije.

### DCS koordinate {#dcs-coordinates}

Svako DCS ratište je Transverzalna Merkatorova projekcija (WGS84, razmjer 0,9996) sa sopstvenim centralnim meridijanom i lažnim početkom, pri čemu je DCS x sjeverni pomak, a z istočni. Konstante su one koje objavljuje pydcs projekat; matematika je Krügerov red do šestog reda (Karney 2011), prenesena u [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Pozadina za DCS metre gradi se direktno u njima, pa DCS tabela Watcher-a preslikana kroz `dcs_x`/`dcs_y`/`dcs_z`, nivo koji je napisao DCS konvertor terena i pozadina dijele isti okvir. Iračke konstante nisu objavljene; prilagođene su objavljenim referentnim tačkama (4 cm srednja kvadratna greška).

DCS tabele Watcher-a su na tangentnoj ravni u fiksnoj referentnoj tački ratišta (ista tačka koju koristi birač ratišta, dolje), pa se više misija na jednom ratištu spaja sa sačuvanom referencom i poklapa sa pozadinom ratišta bez pomjeranja.

### Pojednostavljenje i budžet {#simplification-and-budget}

- Zgrade ispod 20 m² se brišu; 60 m² kada je okvir širi od 30 km, 150 m² preko 80 km. Ostale se dodaju od najveće prema manjoj dok zgrade ne dostignu 1,5 miliona trouglova.
- Sporedni putevi, servisni putevi i staze se brišu preko 60 km širine; preko 150 km ostaju samo autoputevi, magistralni, primarni i sekundarni putevi.
- Cijela pozadina ostaje ispod oko 3 miliona trouglova. Napomena o uvozu kaže koliko je zgrada izostavljeno.
