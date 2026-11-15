---
title: "Pozadina svijeta"
parent: "Razine i geometrija pozadine"
nav_order: 5
has_children: true
lang: "hr"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Pozadina svijeta

Pozadina svijeta stavlja pravo tlo ispod snimke leta: brda, ceste, rijeke, zračne luke i zgrade, preuzete iz besplatnih otvorenih kartografskih podataka. Koristite je kad bi snimka Tacviewa inače lebdjela nad praznom mrežom. To je [razina](glossary.md), pa toplina i figure leže na njoj.

## Izgradnja {#build-one}

1. Učitajte snimku leta koja kaže gdje je na Zemlji (datoteka Tacview `.acmi`), ili ne učitavajte ništa i u koraku 3 izaberite ratište. Vidi [Unos podataka](getting-data-in.md).
2. Otvorite **Pozadina / razina** u bočnoj traci.
3. Pritisnite **Stvarni svijet kao pozadina** da izgradite tlo ispod vaših podataka. Ili izaberite kartu igre u **Ratište** i pritisnite **Izgradi pozadinu ratišta** (ili **Strimaj ratište**).
4. Pričekajte. Ploča pokazuje napredak (*Pločice visina*, *Pločice karte*, *Izgradnja pozadine*); **Odustani** zaustavlja izgradnju.
5. Letite okolo. Tekst o izvoru podataka karte piše se dolje desno u pogledu.

Prvo preuzimanje skida nekoliko desetaka megabajta. Preglednik ih zadržava, pa drugo izgrađivanje istog područja ništa ne preuzima. **Zaboravi pločice karte** ih briše. Gumb **Stvarni svijet kao pozadina** prikazuje se samo kad učitani podaci nose zemljopisnu referencu (u nastavku).

Sve se gradi u pozadinskom radniku ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultat zamjenjuje trenutnu razinu i ponaša se kao svaka [3D razina](model-levels.md): sakriva toplinu iza sebe, reže je presjek, ima [postavke izgleda](level-appearance.md) i može se spremiti u [biblioteku](level-library.md).

## Gdje su podaci: zemljopisna referenca {#where-the-data-is-the-geographic-reference}

Skup podataka dobiva zemljopisnu referencu samo od izvora koji je navodi:

- **ACMI snimka**: zaglavlje `ReferenceLatitude` i `ReferenceLongitude`, te pozicije koje čitač projicira na ravninu koja dodiruje WGS84 elipsoid na tom mjestu (X istok, Y sjever, u metrima; visine su visina snimke iznad mora). Referenca se zadržava kad preslikavanje uzima **X** i **Y** kao osi tla, što potvrđuju i vlastiti nagovještaji snimke, a odbacuje se kad tlo dolazi iz nekog drugog stupca, poput ravnog svijeta igre **U** i **V**.
- **Parquet tablica čiji `heat3d` nagovještaji sadrže unos `geo`**: DCS, MSFS, X-Plane i IL-2 (Tacview) tablice [Watchera](https://github.com/Holdi601/3DHeat-Watcher). Unos je opisan pod [Za programere](#for-developers).

Učitavanje više datoteka zadržava referencu samo kad sve imaju istu. Svi ostali učitavači nisu pogođeni i ne nose nijednu.

Pozadina se projicira na isti način, pa prolazi kroz preslikavanje osi učitavanja. Tako se nađe ispod podataka, bez obzira na to što preslikavanje okreće ili skalira.

## Ratišta {#theatres}

Izbornik **Ratište** navodi stvarne karte DCS Worlda (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) i IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), svaku sa svojim okvirom na Zemlji ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS okviri su granice koje su urednici izračunali iz objavljenih projekcija. IL-2 okviri, i DCS oni koji su tako označeni, procjene su iz objavljenih veličina karata i gradova na njihovim rubovima. Ploča kaže koji je koji.

**Izgradi pozadinu ratišta** gradi dvije razine detalja u jednoj mreži:

| Stupanj | Područje | Teren | Karta |
|---|---|---|---|
| Ratište | cijeli okvir | najdublji zum do 10 koji treba najviše 64 pločice visina (oko 3 km po vrhu nad Kavkazom, 1 km nad Normandijom) | more, jezera, pokrov zemljišta i autoceste iz najviše 64 vektorske pločice pri zumu 4 do 9 |
| Detaljno područje | **Ispod podataka**, **Oko točke** (zemljopisna širina, dužina, 12 do 400 km), ili nijedno | do zuma 12 u najviše 100 pločica, najviše 500.000 vrhova | sve gore navedeno, iz najviše 1.500 vektorskih pločica na najdubljem zumu do 14 koji stane |

Detaljno područje izrezuje rupu u mreži ratišta, proširenu na cijele ćelije tako da obje mreže dijele svoje rubne linije. Tanka stijenka zatvara šav gdje uzorkuju visine različito.

S učitanim podacima ratište se gradi na ravnini podataka, pa tamo i sjeda kako je izgrađeno. Bez podataka gradi se oko vlastite referentne točke ratišta (cijeli stupnjevi u blizini njegova detaljnog područja). Podaci učitani poslije na drugoj referenci (ACMI datoteka navodi svoju) pomiču pozadinu pod sebe. Točan pomak između dviju projekcija računa se na mreži 256 × 256 preko pozadine i čita između čvorova, unutar metra ili dva kroz cijelo ratište ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Pozadina spremljena u biblioteku zadržava svoje mjesto i pomiče se jednako kad se učita pod drugim podacima.

### Strimanje ratišta {#streaming-a-theatre}

**Strimaj ratište** prikazuje ratište onako kako to radi preglednik karte za simulatore leta: tlo dolazi kao mnogo malih pločica oko kamere, učitanih dok letite i odbačenih kad su izvan dosega ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Kvadrantno stablo Web Mercator pločica.** Korijeni na zumu 5 pokrivaju 1.500 km oko kamere, pa tlo seže preko okvira ratišta do horizonta. Pločica se dijeli na četiri djeteta dok je kamera bliža od 1,4 puta njezine širine, do zuma 15 (oko 1 km pločica, 15 m između vrhova terena). Detalj opada s udaljenošću kao što opada na ekranu.
- **Svaka pločica ima vlastitu mrežu**, izgrađenu u radniku ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): mreža terena 65 × 65 s rubom, tako da susjedi na različitim detaljima nikad ne pokazuju pukotinu. Pokrov zemljišta i more naslikani su na njoj, a ceste, pruge, jezera, rijeke, zračne luke, izmjerene piste i zgrade su iznad. Po želji dolazi i satelitska slika njezina kvadrata. Iscrtavač crta pločice s izgledom i pravilima dubine razine, pa one sakrivaju toplinu iza sebe kao i svaka razina.
- **Prvo grubo.** Pločice se traže grube i bliske najprije, po četiri preuzimanja istovremeno po izvoru. Dok se djeca pločice učitavaju, pločica stoji umjesto njih, pa se pogled odmah popuni i zatim izoštri.
- **Memorija**: izgrađene pločice čuvaju se do 600 MB, a najmanje nedavno crtane otpadaju prve. **Preuzimanja** ostaju u predmemoriji pločica, ograničenoj na proračun od 2 GB, a najstarija odlaze prva. Povratak preko područja zato ne košta ništa, i nema ograničenja po izgradnji.
- **Spremljeno u biblioteku** kao ono što strima: ratište, njegove postavke i njegovo mjesto na Zemlji, a ne pločice. Učitavanje ponovno strima, iz predmemorije pločica gdje su pločice još tu. Klikovi i inspektor pogađaju pločice kao što pogađaju svaku razinu.
- Oba iscrtavača crtaju pločice. Provjereno je jedan uz drugi na pravoj grafičkoj kartici (WebGPU i WebGL2 na istoj kartici), uključujući toplinu sakrivenu iza grebena.
- S učitanim podacima pločice se grade na ravnini podataka. Podaci učitani kasnije na drugoj ravnini ponovno ih grade tamo, iz predmemorije.
- Izmjereno na sintetičkim letovima preko tri mjesta (Normandija, Nevada, Sirija): oko 63, 45 i 24 MB pri prvom posjetu sa slikom. Drugi posjet ne preuzima ništa.

## Što se gradi {#what-is-built}

| Dio | Izvor | Kako |
|---|---|---|
| Slika (strimana ratišta, neobavezno) | EOX Sentinel-2 cloudless 2016 | **Satelitske snimke** prekrivaju bezoblačni mozaik iz 2016. (oko 10 m po pikselu, zum 14, dublje pločice ga povećavaju) preko tla umjesto naslikanog pokrova zemljišta. Ceste, piste, zgrade i imena ostaju iznad. |
| Finije snimke (SAD, Francuska) | USGS National Map orthoimagery; IGN BD ORTHO | Uz uključene **Satelitske snimke**, pločica karte sa zuma 13 koja leži potpuno unutar susjednih Sjedinjenih Država ili metropolitanske Francuske uzima nacionalnu ortofoto sliku umjesto nje, dva zuma dublje od pločice (šesnaest njezinih pločica složeno u jednu sliku, oko 1-2 m po pikselu izbliza). Drugdje EOX. |
| Teren (strimana ratišta) | Mapterhorn | Copernicus GLO-30 svugdje (oko 19 m po pikselu pri zumu 12), na razini metara gdje je u državi njezin vlastiti premjer (Francuska, SAD i druge). Čita se dva zuma grublje od svake pločice. AWS Terrain Tiles ako Mapterhorn nije dostupan. |
| Teren | AWS Terrain Tiles (Terrarium PNG) | Mreža visina nad okvirom: zum je najdublji do 12 (oko 28 m po pikselu na 43° N) koji treba najviše 36 pločica, a mreža je prorijeđena na najviše 400.000 vrhova. Crta se kao tlo s uobičajenim znakovima reljefa. |
| Ceste, pruge | OpenFreeMap vektorske pločice, sloj `transportation` | Ravne trake položene na teren, zgusnute na razmak terena i podignute nekoliko postotaka njega da se ne bi borile s njim. Širine po klasi, od 16 m (autocesta) do 3 m (staza, pruga); nikad uže od dijagonale okvira / 5000. Staze, trajekti i tuneli su izostavljeni. |
| Zračne luke | sloj `aeroway` | Poligoni piste, staze za vožnju, perona i heliodroma položeni kao tlo; crte piste i staze kao trake od 45 m i 18 m. |
| Voda | sloj `water` | More ravno na 0 m, jezera i bare ravno na njihovoj najnižoj obali, rijeke položene. Crta se kao voda: ravno osjenčana, bez izohipsa. |
| Pokrov zemljišta | slojevi `landcover` i `landuse` | Naslikano na vlastite vrhove terena, bez dodatnih trokuta: šume, trava i parkovi zeleni, poljoprivredno zemljište slamnato, močvara, pijesak, stijena, led; stambena, industrijska, komercijalna, vojna i kamenolomna područja u prigušenim tonovima. Voda je naslikana i pod površinom vode, pa se obala vidi s bilo koje visine. Tlo bez pokrova dobiva tihu nijansu visine (nizinsko sivo-zeleno, gorje smeđe, snijeg iznad 3.000 m). Čitljivo je na rezoluciji terena: oko 30-45 m u detaljnom području, kilometri u ratištu. |
| Imena mjesta | slojevi `place` i `aerodrome_label` | Gradovi, gradići i sela te zračne luke s ICAO kodom, ispisani preko pogleda. Koliko se koja vrsta prikazuje raste s visinom kamere, najviše 70 istovremeno. |
| Izmjerene piste | [OurAirports](https://ourairports.com/data/) `runways.csv` (javna domena) | Neobavezno (**Piste iz OurAirports**, zadano uključeno): svaka otvorena pista s oba kraja na popisu, od praga do praga na zapisanoj širini, s bočnim trakama, isprekidanom središnjom linijom i pragovima. Jedan popis od 4 MB, preuzet jednom i čuvan u predmemoriji. |
| Zgrade | sloj `building` | Tlocrti izvučeni od `render_min_height` do `render_height` (6 m kad nedostaje) iznad najnižeg tla pod njima; dijelovi `hide_3d` preskočeni. Crtaju se kao građevine. |

Vektorske pločice čitaju se pri zumu 14 (jedinom zumu sa zgradama) kad okvir treba najviše 300 njih. Inače se čitaju na najdubljem zumu koji to zadovoljava, do 8. Veće područje dobiva samo teren.

### Izgled {#look}

Pozadina počinje s uključenom opcijom **Snimljena boja**. Boja je ono što razlikuje svijetlu cestu od sivog tla na kojem leži, a tamnu pistu od njezina perona. Rubovi trokuta tla isključeni su, jer pravilna mreža ništa ne govori, a izohipse su blage. More je neprozirno (podloga pod njim borila bi se s površinom za dubinu u daljini), a zgrade su svijetlo sive i gotovo čvrste, kako ih karta crta. Otvoreno more ne dobiva nikakve trokute tla. Sve ostalo je zadani izgled modelne razine.

## Zasluge na platnu {#credits-on-the-canvas}

Dok je pozadina razina, zasluge njezinih izvora ispisuju se dolje desno u pogledu, bez potrebe za klikom, tako da snimke zaslona i prikazani videi nose zasluge:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Svaki dio vodi na stranicu o atribuciji svojeg izvora (openstreetmap.org/copyright i [popis atribucija](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) za Terrain Tiles). Pozadina spremljena u biblioteku zadržava svoje zasluge i ponovno ih prikazuje kad se učita. Tekst je preveden zajedno s preglednikom, a imena nisu.

## Izvori i njihovi uvjeti {#sources-and-their-terms}

Svaki izvor, njegova licenca i kako pozadina ostaje unutar uvjeta: [Pozadina svijeta: izvori i uvjeti](world-backdrop-sources.md).

## Predmemorija pločica {#the-tile-cache}

Svaka pločica i TileJSON vektorskih pločica čuvaju se u Cache API-ju preglednika pod `3dheat-world-tiles-v1`, po URL-u. Drugo izgrađivanje istog područja uopće ne šalje zahtjeve i radi izvan mreže. TileJSON se prvo traži i, kad to ne uspije, njegova predmemorirana kopija imenuje pločice koje su već tu. Pločice koje server nema (otvoreno more, 404) pamte se i kao odsutne.

URL-ovi vektorskih pločica nose datum izdanja karte. Kad OpenFreeMap objavi novo izdanje, sljedeća pozadina preuzima svježe pločice, a stare ostaju dok ih se ne očisti. Predmemorija je ograničena na 2 GB: kad ih premaši, prvo se brišu pločice pohranjene najdavnije. **Zaboravi pločice karte** briše cijelu predmemoriju. Predmemorija treba siguran izvor (`https://` ili `localhost`). Inače svako izgrađivanje preuzima ponovno.

## U usporedbi s Tacviewom {#compared-with-tacview}

Provjereno okom na po jednom mjestu za svako ratište, sa sintetičkim snimkama: piste za polijetanje leže na središnjim linijama nacrtanih pista, a prijelazi obale padaju na obalu. Tacviewova strana potječe iz njegove dokumentacije i objavljenih snimki zaslona (tacview.net, njegova stranica na Steamu), a ne iz pokretanja ovdje.

| | Tacview 1.9 | Ova pozadina, strimana |
|---|---|---|
| Doseg | cijeli globus | 1.500 km oko kamere, gdje god ona bila |
| Teren | ETOPO1 (oko 1,25 km) ugrađen; SRTM 25-75 m ako korisnik instalira datoteke; DCS teren izvezen iz DCS-a | Copernicus GLO-30 (Mapterhorn), na razini metara u Francuskoj i SAD-u |
| Slike | nijedne ugrađene; teksture koje korisnik preuzima (Mapview, SAS Planet, dodaci kao karta Kavkaza VFR) | EOX Sentinel-2 cloudless 2016, oko 10 m, strimano |
| Pokrov zemljišta | nijedan, osim ako je u teksturi | iz OpenStreetMapa, naslikan na teren (bez slike) |
| Ceste, pruge | nijedne, osim ako su u teksturi | svaka klasa blizu kamere, glavne ceste daleko |
| Zgrade | nijedne | izvučeni tlocrti blizu kamere |
| Zračne luke | oznake i piste kao ravni kvadri, bez oznaka | piste s izmjerenih krajeva sa bočnim trakama, središnjom linijom i pragovima; staze, peroni; imena s ICAO kodovima |
| Imena mjesta | neke oznake sela i gradova | gradovi, gradići, sela i zračne luke, prema udaljenosti i visini |

Gdje još zaostaje:

- **Rezolucija slike**: izvan SAD-a i Francuske 10 m satelitski mozaik je mekan ispod oko 2 km. Tacview s korisnički instaliranom teksturom zuma 17 je tamo oštriji.
- **Teren u DCS-ovom vlastitom obliku**: Tacview može prikazati teren koji DCS sam izvozi. Ovdje je to stvarna Zemlja, koja se razlikuje od DCS-ovog terena tamo gdje su modelari karte to promijenili.
- **Zakrivljenost**: tlo je ravna ploha, pa horizont nije horizont zakrivljene Zemlje. Tacview crta sferu.
- **Brzina**: prvi posjet mjestu preuzima desetke megabajta prije nego što postane oštro. U preglednicima s softverskim iscrtavanjem (snimke zaslona) crta se nekoliko sličica u sekundi s nekoliko stotina pločica.

## Ograničenja i što dolazi poslije {#limits-and-what-comes-later}

- **Rezolucija terena**: najbolje oko 30 m, a grublje u velikim područjima. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF na AWS-u, bez ključa, fiksan tekst zasluga) bolji je izvor: 30 m svugdje, GLO-90 gdje GLO-30 ima rupe (Armenija i Azerbajdžan, koje pokriva DCS Caucasus). Treba čitač GeoTIFF-a i još se ne koristi.
- **Bolji teren**: Copernicus GLO-30 na AWS-u ne šalje CORS zaglavlja, pa ga preglednik ne može čitati. Zrcalo OpenTopographyja može se čitati (CORS i rasponi), ali njihovi uvjeti za javnu aplikaciju nisu poznati. Treba pitati prije ikakve upotrebe. Mapterhorn već nosi GLO-30.
- **Zakrivljenost**: tlo je ravna ploha, a visine se ne spuštaju zbog zakrivljenosti Zemlje. To odgovara načinu na koji se snimke postavljaju (visina kao visina). Daleko od reference oboje se zajedno razilazi, za manje od dijela na tisuću na 100 km. Savijanje samo pločica odvojilo bi ih od podataka daleko, pa se ne nudi. Zakrivljen horizont traži isti pad (kvadrat udaljenosti od kamere podijeljen s dvostrukim polumjerom Zemlje), primijenjen u svakom prolazu koji crta položaj: razina, pločice, toplina, linije, kutije, oznake, odabir. Primjenjuje se kao jedna zajednička uniforma. Pravi globus traži i položaje podataka u odnosu na središte Zemlje te iscrtavanje relativno prema kameri. Oboje je planirano uz način globusa.
- **Samo sadašnji svijet**: povijesne karte DCS-a i IL-2 (Normandy 2, The Channel, Germany Cold War, svaka IL-2 karta) crtaju se s današnjim gradovima, cestama i obalnim radovima. Ploča to kaže. Povijesna zračna polja se ne crtaju.
- **Nema načina globusa**: pozadina je ravna lokalna ravnina. Pogled na cijelu Zemlju je planiran.
- Ceste se na velikim područjima proširuju da bi ostale vidljive. Izbliza su šire nego u stvarnosti.
- Nazivi DCS ratišta u Watcherovim tablicama podudaraju se kako ih DCS daje u `mission.theatre`. Naziv koji nije na popisu vraća se na prvu fiksnu točku zaokruženu na cijele stupnjeve, pa na samu zemljopisnu širinu i dužinu.

## Povijesne karte (još nisu izgrađene) {#historical-maps-not-built-yet}

Povijesne karte mogle bi kasnije poslužiti kao tekstura povijesnim ratištima. Serije US Army Map Service (AMS) djela su američke savezne vlade, općenito smatrana javnim vlasništvom. Provjerite zapis svakog skena: mnoge su pretisci britanskih GSGS ili njemačkih originala, čiji su rokovi Crown copyright ili anonimnih djela također istekli.

| Ratište | Serija | Gdje je skenirano |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Istočna Europa 1:250.000 (sastavljena pedesetih iz sovjetskih i njemačkih karata) | UT Austin PCL; neki listovi georeferencirani na UT GeoData |
| IL-2 Normandy, DCS Normandy 2 i The Channel | AMS **M661** / GSGS 4250, Francuska 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 i **M841** 1:25.000 (Njemačka) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50.000 (izdanja iz 1951.) i **L552** 1:250.000 | ANU Open Research (listovi L751, "autorska prava istekla"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britanske karte rovova iz Prvog svjetskog rata (ne AMS) | McMaster University; National Library of Scotland (nekomercijalni uvjeti) |

Listovi AMS-a nose oznake zemljopisne širine i dužine na svojim kutovima. Svaki bi se smjestio poravnanjem na četiri kuta i položio na teren kao tekstura, izgrađen i čuvan lokalno kao pločice.

## Za programere {#for-developers}

### Unos `geo` u Parquet tablici {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` i `up` imenuju stupce koji drže istočne i sjeverne metre na istoj tangentnoj ravnini u (`lat0`, `lon0`) te visinu. Učitavanje nosi referencu kad njegovo preslikavanje uzima upravo te stupce (istok kao X, a sjever i visina kao Y i Z, u oba smjera). Neobavezni unos `dcs` imenuje vlastite metre DCS tablice (x sjever, y gore, z istok) i njezino ratište. Učitavanje koje preslikava te stupce umjesto toga se postavlja kroz poprečnu Mercatorovu projekciju tog ratišta ([DCS koordinate](#dcs-coordinates)). Tablica bez `geo` čita se kao i prije.

### DCS koordinate {#dcs-coordinates}

Svako DCS ratište je poprečna Mercatorova projekcija (WGS84, mjerilo 0,9996) sa svojim središnjim meridijanom i lažnim ishodištem. DCS x je sjeverna koordinata, a z istočna. Konstante su one koje objavljuje projekt pydcs. Matematika je Krügerov red do šestog reda (Karney 2011), prenesen u [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Pozadina za DCS metre gradi se izravno u njima, pa Watcherova DCS tablica preslikana preko `dcs_x`/`dcs_y`/`dcs_z`, razina koju zapisuje DCS pretvarač terena i pozadina dijele jedan okvir. Irakove konstante nisu objavljene. Prilagođene su objavljenim referentnim točkama (srednja kvadratna pogreška 4 cm).

Watcherove DCS tablice su na tangentnoj ravnini u fiksnoj referentnoj točki ratišta (ista točka koju koristi izbornik ratišta, dolje). Zato se više misija na jednom ratištu spaja s netaknutom referencom i poravnava s pozadinom ratišta bez pomicanja nje.

### Pojednostavljenje i proračun {#simplification-and-budget}

- Zgrade ispod 20 m² otpadaju. Kad je okvir širi od 30 km, otpadaju one ispod 60 m², a preko 80 km ispod 150 m². Ostale se dodaju od najveće prema manjoj dok zgrade ne dosegnu 1,5 M trokuta.
- Sporedne ceste, servisne ceste i staze otpadaju preko 60 km širine okvira. Preko 150 km ostaju samo autoceste, glavne, primarne i sekundarne ceste.
- Cijela pozadina ostaje ispod oko 3 M trokuta. Napomena uz uvoz kaže koliko je zgrada izostavljeno.
