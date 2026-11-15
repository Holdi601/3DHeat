---
title: "Muisti ja rajat"
parent: "Datan lataaminen"
nav_order: 6
lang: "fi"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Muisti, rajat ja mahtumistarkistus

Tietokoneesi muisti on rajallinen. 3DHeat laskee yhteen, mitä tiedostosi tarvitsevat, ja kertoo ennen **Lataa**-painallusta, mahtuvatko ne.

![Muistiarvio sanoo, ettei mahdu, Lataa joka [N]. rivi on valmiiksi täytetty ja Lataa-painike sanoo Liian suuri - pienennä tai harvenna](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Liian suuri tälle koneelle? 3DHeat ehdottaa, että ladataan joka N:s rivi.*

Selainvälilehti, joka loppuu muistista kesken latauksen, kaatuu ja menettää minuutteja työtä. Näytön, jolle pyydettiin enemmän kuin sillä on, konteksti katoaa tai se hidastuu ryömimiseen. Siksi Lähde-paneeli kertoo ennen latauksen alkua, kuinka paljon muistia se tarvitsee, vertaa sitä tälle koneelle tunnistettuihin rajoihin ja kieltäytyy, kun se ei mahdu, ja kertoo, miten pääsee eteenpäin. Malli on tiedostossa [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Muistiarvio {#the-memory-estimate}

Näkyy **Lataa**-painikkeen yläpuolella, kun rivit on laskettu.

| Rivi | Merkitys |
|---|---|
| **Muistiarvio** - *mahtuu* / *tiukka* / *ei mahdu* | Tuomio: vihreä, keltainen tai punainen. |
| `N riviä · B B/rivi` | Ladattavat rivit (harvennuksen jälkeen) ja pysyvät tavut per rivi. |
| `RAM X käytössä, Y huippu latauksen aikana` | Muisti, joka on varattu latauksen jälkeen, ja latauksen aikainen huippu. |
| `GPU Z · arv. lataus T` | GPU-muisti riveille ja arvioitu kesto nopeudella 1,2 miljoonaa riviä sekunnissa. |
| GPU-nimi | Piirtäjän nimi, kun ajuri sen kertoo. |
| Viestit | Miksi se ei mahdu tai on tiukka, ja mitä tehdä. |
| **Lataa joka [N]. rivi** | Harvennusväli (katso alla). |
| `Budjetti: X RAM, Y GPU. Säädä kohdassa Suorituskyky → Resurssibudjetit.` | Budjetit, joita tarkistus käytti. |

### Tavut per rivi {#bytes-per-row}

| Sarake | Pysyvä (RAM) | Huomiot |
|---|---|---|
| Sijainti | 12 | Kolme 32-bittistä liukulukua aina (tasainen akseli on silti taulukko) |
| Aika | 4 | Kun on kartoitettu |
| Elinikä | 4 | Kun aika ja henkilö on kartoitettu |
| Henkilö | 4 | Kun kartoitettu |
| Ryhmä | 2 | Kun kartoitettu |
| Sessio | 4 | Kun kartoitettu |
| `Lähdetiedosto` | 4 | Kun ladataan useampi kuin yksi tiedosto |
| Jokainen suodatinsarake | 4 | Per rasti *Säilytä suodatusta varten* -sarakkeelle |

**Huippu** lisää sen, mitä lataus tarvitsee vain hetkellisesti: 8 tavua 64-bittistä aikaa yhdistämisen aikana, 12 tavua lajitteluavaimia ja indeksejä, 4 tavua permutaation työtilaa (kaikki kolme, kun aika on kartoitettu) ja 4 tavua, kun ryhmäsarake on vielä 32-bittinen. Summa kerrotaan luvulla **2,0**. Tämä kerroin on mitattu (todellinen usean tiedoston lataus huipentui 1,9-kertaiseen eriteltyihin taulukoihin nähden, Parquet-purkajan työjoukosta, kopioista, jotka leikkaavat jokaisen sarakkeen pituuteen, ja muistista, joka on vapautettu mutta ei vielä palautettu) ja pyöristetty ylöspäin. Syy on se, että liian pieni arvio maksaa kaatuneen välilehden, kun liian suuri arvio maksaa vain tarpeettoman harvennuksen.

**GPU:lla** jokainen rivi maksaa 8 tavua (sijainti ja ryhmä, 16 bittiä kumpikin), ja 4 tavua lisää (aika ja elinikä, 16 bittiä kumpikin), kun sekä aika että henkilö on kartoitettu. Katso [GPU-muistin pysyvyys](gpu-memory.md). Suodatintekstuurit (4 tavua rivi per aktiivinen suodatin) ja viivalämmön segmenttien alut (8 tavua rivi, kun Viivat-tila on päällä) eivät kuulu tähän arvioon.

## Mahtumistarkistus {#the-fit-check}

Kolme rajoitetta verrataan ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- huippu-RAM suhteessa **RAM-budjettiin**,
- GPU-tavut suhteessa **GPU-budjettiin**,
- rivimäärä suhteessa **lajittelurajaan**, joka on 400 000 000 riviä, kun aikasarake on kartoitettu.

Pahin kolmesta suhteesta ratkaisee: jopa 70 % on *mahtuu*, jopa 100 % on *tiukka* (sen pitäisi latautua, mutta odota hidasta), yli sen *ei mahdu*. Kun se ei mahdu, paneeli nimeää sitovan rajoitteen ja ehdottaa:

- ladataan joka *N*:s rivi, missä *N* = ⌈rivit / riviä, jotka mahtuvat⌉, valmiiksi täytettynä väliruutuun;
- pudotetaan suodatinsarakkeita, poistetaan aikasarakkeen kartoitus (mikä poistaa lajittelun ja sen rajan, mutta maksaa aikajanan) tai nostetaan budjettia.

Kun budjetti ei itsessään ole tosiasia laitteistosta (selain rajoitti RAM-lukua, oletus pidettiin alhaalla sillä, mitä on juuri nyt vapaana, tai GPU-luku on arvaus), viesti sanoo sen, ettet tavoittele harvennusta, jota et tarvitse.

### Harvennus {#decimation}

**Lataa joka [N]. rivi** pitää yhden rivin per *N*, laskettuna tiedostoa kohti. Lämpö on keskiarvo, joten joka *N*:s rivi antaa saman jakauman enemmällä kohinalla. Se on sama kauppa, jonka piirtäjä tekee jo joka kehyksessä. Ruutu alkaa arvolla 1 (*rivi (kaikki)*). Kun valinta ei mahdu, se täytetään ehdotetulla välillä, ellet ole kirjoittanut siihen itse. Lataa-painike lukee sitten *Lataa N tiedostoa (1 / K)*, ja aineiston nimi kirjaa `joka K:s rivi`.

### Lajittelun raja {#the-sort-ceiling}

Piirtäjä tarvitsee rivit nousevassa aikajärjestyksessä, joten kartoitettu aikasarake tarkoittaa jokaisen rivin lajittelua, radix-lajittelulla 32-bittisillä avaimilla ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Yli **400 miljoonan** rivin kohdalla se kielletään eikä yritetä välilehdessä. Tämä tarkistetaan ennen latausta, joten rajan ylittävä valinta hylätään harvennusehdotuksella sen sijaan, että se luettaisiin kokonaan ja kaadettaisiin viimeisessä vaiheessa. Lähellä rajaa (*tiukka*) paneeli varoittaa, että lajittelu on pitkä vaihe ilman omaa edistymistään. Ilman aikasaraketta lajittelua ei tehdä eikä rajaa ole.

## Resurssibudjetit {#resource-budgets}

**Suorituskyky → Resurssibudjetit** (taitettava rivi Suorituskyky-paneelin alareunassa, jossa lukee `Resurssibudjetit - RAM, GPU, ytimet`). Budjetit tunnistetaan; tunnistettu luku on oletus; liukusäätimet eivät mene yli **katon**, joka on tunnistettu luku paitsi silloin, kun tunnistus tiedetään olevan muu kuin mittaus.

| Säädin | Alue | Merkitys |
|---|---|---|
| **RAM rividatalle** | 256 MiB RAM-kattoon, logaritminen | RAM-budjetti mahtumistarkistukseen. Merkitään *(yli tunnistetun)* tunnistetun oletuksen yli, *(enintään)* katossa. |
| **GPU rividatalle** | 128 MiB GPU-kattoon, logaritminen | GPU-budjetti mahtumistarkistukseen ja rivien lähetykseen. Merkitään *(yli tunnistetun)* tunnistetun oletuksen yli, *(enintään)* katossa. |
| **Jäsennyssäikeet** | 1 loogisten ytimien määrään | Kuinka monta tiedostoa lataus jäsentää kerralla, kukin omassa työntekijässään. Oletus on ytimet - 2 (ytimet - 1, kun ytimiä on neljä tai vähemmän). Katso [Jäsennyssäikeet](#parser-threads) (kehittäjille-osiossa). |
| Lähteet-rivi | | Mistä kukin luku tuli (`RAM: …. GPU: …. CPU: ….`). |
| **Tunnista uudelleen** | | Pyytää kehityspalvelinta antamaan uuden muistilukeman ja laskee jokaisen budjetin uudelleen. |
| GPU-nimi | | Sovittimen lyhyt nimi; koko piirtäjän merkkijono on vihjeessä. |

### GPU-budjetin nostaminen {#raising-the-gpu-budget}

Tunnistettua suurempi GPU-budjetti otetaan käyttöön sellaisena kuin se on asetettu: mahtumistarkistus ja lähetys ottavat saman luvun yhdestä funktiosta ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), joka rajoittaa sen vain GPU-kattoon, johon liukusäädin pysähtyy. Joten lataus, jonka tarkistus hyväksyy, lähetetään kokonaan. Tunnistetun luvun yli liukusäädin näyttää *(yli tunnistetun)*: luku on silloin arvionne kortista, ei mittaus, ja jos asetat sen korttia suuremmaksi, riskinä on menetetty konteksti tai ryömintä.

## Valtavat aineistot: vivut {#huge-datasets-the-levers}

Halvimmasta kaikkein rajuimpaan:

1. **Vähemmän suodatinsarakkeita.** Jokainen on 4 tavua rivi ja yksi purkukierros.
2. **Harvennusväli.** Joka *N*:s rivi.
3. **Ei aikasaraketta.** Ei lajittelua, ei lajittelun rajaa, ei 4-8 tavua riviltä aikaa ja elinikää - eikä aikajanaa.
4. **Nosta budjetteja**, kun tiedät, että muistia on.

Piirtoaikana suuria aineistoja käsitellään otannalla ja progressiivisella kertymisellä eikä pienentämällä dataa. Katso [Otanta ja budjetit](sampling-and-budgets.md).

## Kehittäjille {#for-developers}

### Jäsennyssäikeet {#parser-threads}

Useamman tiedoston lataus jäsentää kerralla enintään **Jäsennyssäikeet**-määrän, kukin jäsennintyöntekijässä, jonka sisääntulotyöntekijä käynnistää tälle lataukselle ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Yhdellä säikeellä tai yhdelle tiedostolle tiedostot jäsennetään peräkkäin sisääntulotyöntekijässä itsessään.

Useamman samanaikainen ajaminen ei löysennä mahtumistarkistusta:

- **Rakentaja lasketaan ensin.** Yhdistetyt sarakkeet varataan koko valinnalle ennen ensimmäisen tiedoston lukemista, joten lennossa olevat tiedostot saavat vain sen, mitä RAM-budjetti jättää niiden viereen (`parseHeadroom`): sijainti, 64-bittinen aika, katselukulmat, henkilö, 32-bittinen ryhmä, sessio, suodatinsarakkeet ja `Lähdetiedosto`, per ladattava rivi - kerrottuna 2,6:lla, kun rivimäärä on CSV-arvio, sarakkeelle, joka kasvaa suuremmaksi.
- **Jokainen tiedosto varaa kustannuksensa ennen kuin se alkaa** (`fileParseBytes`): sen rivit (Parquet-alatunnisteesta; CSV:n osuus arviosta koon mukaan) kerrottuna samoilla sarakkeilla kerrottuna **8:lla** - itse lohko, kopio sen vieressä, kun rivit ilman sijaintia pudotetaan, ja purkajan työjoukko, joka tekstisarakkeille on paljon suurempi kuin niiden tunnisteet. Harvennus ei tätä pienennä, koska tiedostot luetaan kokonaan ja harvennetaan jälkikäteen. Kahdeksan on mittauksella asetettu varaus: kolmella tai viidellä kolmekymmentä jäsennyssäiettä vei välilehden rajansa yli 86 miljoonalla rivillä henkilö- ja sessionimillä; kahdeksalla ne eivät vienyt.
- **Toinen tiedosto alkaa vain, jos sen varaus mahtuu jäljelle jäävään.** Tiedosto, joka on valmis mutta odottaa aiemman yhdistämistä, pitää varauksensa, kunnes se on yhdistetty.
- **Yksi tiedosto ajetaan aina.** Kun mitään ei ole varattu, seuraava tiedosto alkaa, mitä se maksaakin. Se on yksi kerrallaan -lataus, jonka mahtumistarkistus hyväksyi, joten tiukka budjetti palaa siihen sen sijaan, että se kieltäytyisi.

Lukema *huippu latauksen aikana* on yksi kerrallaan -latauksen huippu, joka tulee lajittelussa sen jälkeen, kun kaikki tiedostot on luettu. Rinnakkain jäsennetyt tiedostot voivat viedä muistia yli tämän lukeman, kun niitä luetaan. Varaukset pitävät sen RAM-budjetin sisällä niin pitkälle kuin yllä olevat arviot pitävät paikkansa.

Yhdistämisjärjestys on valinnan järjestys, riippumatta siitä, missä järjestyksessä tiedostot valmistuvat. Henkilöiden, ryhmien ja sessioiden numerointi, rivit ja `Lähdetiedosto`-arvot ovat siis samat kuin yksi kerrallaan -latauksessa. Tiedosto, jota ei voi lukea, ohitetaan ja listataan kuten ennenkin. Jäsennintyöntekijä, joka kuolee, lopettaa koko latauksen, kuten sisääntulotyöntekijän kuolema aina teki, ja jokainen jäsennintyöntekijä lopetetaan, kun lataus päättyy, miten tahansa se päättyy. Jos jäsennintyöntekijöitä ei voi käynnistää lainkaan, tiedostot jäsennetään sisääntulotyöntekijässä.

### Miten luvut tunnistetaan {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) ajetaan käynnistyksessä, uudelleen kun piirtäjä on olemassa, ja kun painetaan **Tunnista uudelleen**.

**RAM, kehityspalvelimen kanssa.** `start.bat` ja `npm run dev` tarjoavat sivun prosessista, joka voi lukea koneen muistin, osoitteessa `/__host/memory` (vastataan 1,5 s:n sisällä tai ohitetaan). Oletus on pienempi kahdesta: 60 % asennetusta RAM:ista tai 80 % tällä hetkellä vapaasta RAM:ista. Katto on 60 % asennetusta. Kun vapaa muisti pitää oletuksen alhaalla, paneeli sanoo sen ja ehdottaa ohjelmien sulkemista ja **Tunnista uudelleen** -painallusta.

**RAM ilman sitä** (staattinen julkaisu): mikään selaimen rajapinta ei kerro vapaata muistia, ja `navigator.deviceMemory` pyöristetään alas kahden potenssiin ja Chrome ja Edge rajoittavat sen 8 GiB:iin. Oletus on 60 % `deviceMemory`:stä, rajattuna vielä 4 × välilehden vapaaseen JS-kasaan, jos selain sen kertoo, tai 4 GiB, kun mitään ei kerrota. Kun `deviceMemory` on tasan 8 (katto), luku merkitään *rajatuksi*, ja katto on 4 × oletus, ja huomautetaan, että oletuksen yli luku on väite, ei mittaus.

**Kummassakin tapauksessa** RAM-oletus ja katto rajataan **12 GiB:iin**, joka on enemmän kuin yksi Chrome-välilehti voi pitää taulukkomuistia koneesta riippumatta (sivu pääsi noin 15,75 GB:hen ja epäonnistui; 12 jättää tilaa kaikelle muulle), eikä koskaan alle 256 MiB.

**GPU-muisti.** Mikään web-rajapinta ei kerro sitä lainkaan.

- Kehityspalvelimen kanssa kortin muisti luetaan `nvidia-smi`:llä (suurin sovitin) tai Windowsissa sovittimen rekisteriarvosta `HardwareInformation.qwMemorySize`. Oletus on 70 % siitä, katto 90 %.
- Ilman lukemaa se päätellään: oletuksena 2 GiB; 4 GiB, kun suurin tekstuuri on 16 384 px tai enemmän (erillinen kortti), 1 GiB, kun pienempi; tai 8 × WebGPU:n `maxBufferSize`, kun se on suurempi. Katto on silloin 8 × päätelty luku, koska päättely erottaa integroidun piirin erillisestä, eikä mitään tarkempaa. Paneeli sanoo, että luku on päätelty.
- Ei koskaan alle 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, kun sitä ei kerrota).
