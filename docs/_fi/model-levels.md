---
title: "3D-kentät"
parent: "Kentät ja taustageometria"
nav_order: 2
lang: "fi"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D-kentät

3D-kenttä on paikan malli: mäet, kadut, rakennukset. Aineistosi on sen sisällä. Sen avulla näet, millä kerroksella, mäellä tai katolla lämpö on. Katseluohjelma jakaa kentän maahan (kiinteä), rakenteisiin (läpinäkyviä, jotta voit katsoa sisään) ja veteen.

## Lataa 3D-kenttä {#load-a-3d-level}

1. Lataa ensin aineisto ([Aineiston tuonti](getting-data-in.md)). Mallin on käytettävä samaa maailmatilaa ja yksikköä kuin aineisto, Y ylös.
2. Valitse **Tausta / kenttä**-kohdasta **Yksinkertaistuksen tavoite**. Jätä se arvoon *Täysi - ei yksinkertaistusta*, ellei malli ole valtava.
3. Paina **3D-malli…** ja valitse `.glb`-, `.gltf`-, `.obj`-, `.stl`- tai `.ply`-tiedosto.
4. Odota edistymisriviä. **Peruuta** pysäyttää sen.
5. Paina näkymässä **F**. Maa on kiinteä, rakenteet ovat läpinäkyviä kuoria, vesi on tasainen.
6. Säädä ulkoasua kohdassa [Kentän ulkoasu](level-appearance.md). Paina **Tallenna kirjastoon** säilyttääksesi tuloksen ([Kenttäkirjasto](level-library.md)).

![Ladattu 3D-kenttä: läpinäkymätön maa korkeuskäyrineen, läpinäkyviä rakennuksia, tasainen vesi](../assets/img/en/model-levels-loaded.webp)

**3D-malli…** lataa kentän verkon. Se jäsennetään, luokitellaan ja yksinkertaistetaan taustatyöntekijässä ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)). Mukana on edistymisrivi ja **Peruuta**: *Luetaan mallia*, *Jäsennetään tiedostoa*, *Pakataan N tekstuuria*, *Luokitellaan N osaa*, *Yksinkertaistetaan maata (N kolmiota)*, *Yksinkertaistetaan rakenteita (N kolmiota)*, *Rakennetaan rautalankaa*.

## Muodot {#formats}

| Muoto | Mitä luetaan | Rajat |
|---|---|---|
| `.glb` | Jokainen verkkoprimitiivi, jonka `mode` on 4 (kolmiot) tai ei tilaa, jokaisen solmun maailmamuunnos sovellettuna; `POSITION`; `COLOR_0` (vec3 tai vec4) kärkivärinä; materiaalin `baseColorTexture` ja sen `TEXCOORD_n` tekstuurina; solmujen ja verkkojen nimet osien nimiksi. | Viivat ja pisteet ohitetaan. |
| `.gltf` | Sama. | Vain upotetuilla puskureilla: glTF, joka viittaa ulkoiseen `.bin`-tiedostoon, hylätään viestillä *Vie yhtenä .glb-tiedostona, jotta geometria on upotettu.* |
| `.obj` | Pinnat, `o`- ja `g`-lohkot osina. | Vain geometria (ei materiaaleja). |
| `.stl` | Binäärinen ja ASCII (`solid …`). | Yksi osa. |
| `.ply` | Vain ASCII. | Binäärinen PLY hylätään viestillä *Muunna .glb- tai binääriseksi .stl-tiedostoksi.* |

Vain geometria: sijainnit, normaalit ja kolmiot hitsattuna yhteen puskuriin, sekä värit ja tekstuurikoordinaatit, kun niitä on ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Malli ilman kolmioita hylätään. Mallin on oltava samassa maailmatilassa ja yksikössä kuin aineisto (Y ylös): mitään ei muunneta sopivaksi.

## Maa, rakenteet ja vesi {#ground-structures-and-water}

Kenttä jaetaan tuonnissa kolmeen luokkaan, koska ne vaativat vastakkaisia käsittelyjä ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Maa** - piirretään läpinäkymättömänä ja varjostettuna maaston vihjeillä (kaltevuus, korkeuskäyrät, korkeusgradientti), jotta sijainti voidaan lukea sitä vasten.
- **Rakenteet** - rakennukset ja esineet seisovat kameran ja niiden sisällä olevan lämmön välissä, joten ne piirretään **läpinäkyvänä kuorena** (himmeät pinnat kirkkaalla reunalla ja poistetuilla reunoilla) tai, kun niissä on tekstuuri, kiinteinä omilla tekstuureillaan.
- **Vesi** - tasainen ilman maaston vihjeitä: järven yli kulkeva korkeuskäyrä on mieletön.

Jokainen osa (glTF-solmu, OBJ-kohde tai ryhmä) luokitellaan itsenäisesti ensimmäisen sovellettavan säännön mukaan:

1. **Viejän tarra.** Nimi, joka alkaa `ground:`, `structure:` tai `water:` (tai `|` `:n sijaan), otetaan sanasta sanaan. Projektin omat viejät merkitsevät jokaisen osan näin.
2. **Vesinimet.** `water` sanana (ei *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Maannimet.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Rakennenimet.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Osa, joka peittää yli 25 % kartan X-Z-alasta ja jonka kolmioiden pinta-alasta yli 60 % osoittaa ylös, on maata. Osa, jossa ylöspäin osoittava osuus on alle 45 %, tai joka on korkeampi kuin 15 % kentän korkeudesta ja peittää alle 10 % alasta, on rakenne. Ylöspäin osoittava osuus painotetaan pinta-alalla, joten talo ei ole tasainen vain siksi, että sillä on katto.
6. **Muuten maa** - epäselvä osa oletetaan maaksi, koska melkein näkymätön kuori oletuksena saisi kentän näyttämään piirtovirheeltä.

Malli, joka on yksi osa ja luokiteltu rakenteeksi, tehdään maaksi (*yksi nimetön verkko - käsitellään maana*).

### Navigointiverkot {#navigation-meshes}

Osa, jonka nimi on `nav:…` (kentän viejän `nav:walkable`), on navigointiverkko: paikka, johon sotilas voi seistä. Se on listattu maaksi (*navigointiverkko - ei piirretä, koska se on maan päällä; napsautukset löytävät sen silti*), mutta sitä **ei piirretä**. Se on asetettu maan päälle, josta se on generoitu, ja se on senttimetrien tarkkuudella samassa tasossa. Jos se piirrettäisiin maana, kaksi pintaa taistelisivat jokaisesta pikselistä: kentällä, jossa on paistettu maatekstuuri, koko pelattava alue näkyi kovareunaisina harmaina ja beiginä laikkuina, yksi per navigointikolmio. Se säilytetään yksinkertaistamattomana, jotta [napsautus valintaan](camera.md#click-to-pick) voi kertoa, onko paikka kävelykelpoinen. Kirjastomerkinnät eivät säilytä sitä.

**Näytä osan luokitus (N)** paneelissa (näkyy malleille, joissa on enemmän kuin yksi osa) luettelee jokaisen osan luokkansa ja syynsä kanssa: *viejän nimeämä*, *nimi vastaa kaavaa*, *peittää X % kartasta, Y % ylöspäin*, *Y % ylöspäin, Z % kentän korkeudesta*, *epäselvä - oletettiin maaksi*. Osan muuttamiseksi nimeä osa uudelleen lähdemallissa ja tuo se uudelleen: jako on jo upotettu indeksipuskureihin.

## Yksinkertaistus {#simplification}

**Yksinkertaistuksen tavoite** asettaa seuraavan tuonnin kolmiobudjetin ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Asetus | Kolmiot |
|---|---|
| *Täysi - ei yksinkertaistusta* (oletus) | kaikki |
| *Korkea - 8 M kolmiota* | 8 000 000 |
| *Keskitaso - 3 M kolmiota* | 3 000 000 |
| *Matala - 800 k kolmiota* | 800 000 |
| *Siluetti - 100 k kolmiota* | 100 000 |

Budjetti jaetaan **60 % rakenteille ja 40 % maalle**, ja ne yksinkertaistetaan erikseen, koska rakenteet menettävät muotonsa nopeimmin harventamisessa. Vettä ei yksinkertaisteta. Yksinkertaistus on reunojen supistusta kvadraattisilla virhemetriikoilla ([meshoptimizer](https://github.com/zeux/meshoptimizer), WebAssemblyn kautta), kun päällekkäiset kärjet on hitsattu, joten reunat ja terävät kulmat säilyvät. Tuontiviesti kertoo `lähde → nyt kolmiota, poikkeama X %`, maan, rakenteiden ja veden jaon osien välillä, ja kun *Täysi* on valittu mallille, jossa on yli 8 M kolmiota, se ehdottaa *Korkea* (enintään 30 M) tai *Keskitaso* (sitä suuremmille). Ilman WebAssemblyä yksinkertaistaja ei ole käytössä, ja tuonti kertoo sen.

Projektin omien viejien kentille budjetti on jo määritetty; tavoite on olemassa raakaa taidetta varten, jolla ei ole budjettia.

## Tekstuurit {#textures}

`.glb`, jonka osissa on perusvärin tekstuureja, piirretään niillä. Kilpa-ajoradan viejä kantaa esimerkiksi yhden tekstuurin per maastolaatta ja yhden per sijoitettu malli.

Maatekstuuri näytetään oletuksena, kun se on olemassa. Rakenteet, joissa on tekstuurit, alkavat **kiinteinä, omilla tekstuureillaan** (reunakivet, suojakaiteet, rengasseinät ja kyltit ovat tien reunoja eikä taloja, joiden sisälle katsotaan), kun rautalanka on pois ja tasainen varjostus pois. Katso [Kentän ulkoasu](level-appearance.md).

## Suuret kentät {#large-levels}

- Yli **300 000** rakennekolmion kohdalla rakenteiden reunat kytketään alkuun pois ja pinnan peittävyys on 35 %: kun jokaisessa pikselissä on reuna, kaupunginosa näyttää tasaiselta valkoiselta.
- Kameran kaukotaso laajenee sopimaan kenttään ([Kentät](levels.md#what-a-level-does-for-the-heat)).

## Kehittäjille {#for-developers}

### Tekstuuriatlas {#texture-atlas}

Jokainen tekstuuri pakataan **yhteen atlakseen** tuontityöntekijässä ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)). Kenttä pysyy siis yhtenä piirtona, yhtenä näytteenottajana ja yhtenä tekstuurikoordinaattiattribuuttina molemmilla taustoilla:

- pakataan hyllyihin kunkin kuvan omassa koossa, pienennetään vain, jos joukko ei mahdu **8192 px:ään** kumpaankaan suuntaan (WebGPU:n oletustekstuurikoon raja);
- **16 pikselin reuna** jokaisen kuvan ympärillä, ja vain ne 5 mip-tasoa, jotka reuna suojaa, jotta kaukainen kyltti ei koskaan näytteenotta naapurin tekstuuria;
- **toistuvat tekstuurit pysyvät toistuvina.** Kuva, jonka glTF-näytteenottaja toistaa (glTF:n oletus) ja jonka tekstuurikoordinaatit jäävät 0..1:n ulkopuolelle - tiiliseinä, jonka UV kulkee 0:sta 40:een - muuttuu *laatoksi*: sen kärjet säilyttävät omat koordinaattinsa ja 16-bittisen laattanumeron, ja varjostimet kääräisevät koordinaatin laatan suorakulmioon pikseleittäin, ottaen mip-tason käärimättömästä koordinaatista, jotta saumat eivät näy. Laatan reuna sisältää oman vastakkaisen reunansa. Akseli, jonka näytteenottaja rajaa, rajataan; kuva, jonka koordinaatit pysyvät 0..1:n sisällä, piirretään kuten ennen. Kentässä, jossa on laattoja, kärki maksaa 4 tavua enemmän.

### Viejän sopimus {#the-exporter-contract}

Mitä katseluohjelma tarvitsee kentältä, kuka tahansa sen teki:

- yksi itsenäinen `.glb`;
- float32 `POSITION`, kolmioprimitiivit;
- solmujen nimet `ground:*`, `structure:*` ja `water:*` (muu luokitellaan yllä olevilla säännöillä), ja `nav:*` navigointiverkolle, joka säilytetään mutta ei piirretä;
- maailmatilan koordinaatit, **Y ylös**, samassa yksikössä kuin telemetria, jotta aineisto asettuu kentälle ilman sijoitusvaihetta.
