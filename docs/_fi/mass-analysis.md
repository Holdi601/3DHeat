---
title: "Massa-analyysi"
nav_order: 8
lang: "fi"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: true
---

# Massa-analyysi: tuhansia otteluita kerralla

**Massa-analyysi** näyttää, mitä kokonainen kansio otteluita yhteensä tarkoittaa: mikä ajoneuvo voittaa useimmin, mikä puoli on suosittu ja missä toiminta on. Käytä sitä, kun otteluita on enemmän kuin ehtisit katsoa.

Se toimii kunkin ottelun pienestä yhteenvedosta, joten tuhat tai kymmenentuhatta ottelua aukeaa nopeasti. Täydet rivit se lataa vain ottelut, joita napsautat.

## Kokeile {#try-it}

1. Avaa **Massa-analyysi** Lämpökartta-sivupalkista.
2. Paina **Kansio...** (tai **Tiedostot...**) ja valitse `.3dheat`-ottelut.
3. Odota, kun paneeli lukee yhteenvedot ("Yhteenvedot... n / N").
4. Paina **Avaa analyysi**. Ikkuna aukeaa välilehdillä.
5. Aseta suodattimet (Peli, Kartta, Tila, Mistä, Mihin) ja lue välilehti, esimerkiksi Tasapaino.
6. Napsauta riviä, solua tai havaintoa. Sen ottelut latautuvat 3D-näkymään, ja kamera on paikassa.

![Tasapaino-välilehti: voittoprosentti ja tappoja kuolemaa kohden ajoneuvoittain](../assets/img/en/mass-balance.webp)

```
kansio .3dheat-tiedostoja -> yhteenvedot -> ikkuna (välilehdet) -> napsautus riviin -> ottelut auki 3D:ssä
```

`.3dheat`-tiedosto on yksi ottelu ([Yksi tiedosto per ottelu](container.md)). *Lämpökartta* ja *rivi* selitetään [sanastossa](glossary.md).

## Yhteenvetojen luominen {#getting-the-summaries}

Useimmat eivät joudu tekemään mitään: paneeli laskee puuttuvat yhteenvedot itse. Jos haluat valmistella ison kansion kerran, käytä alla olevaa offline-työkalua.

Jokaiselle `.3dheat`-ottelulle tehdään yhteenveto (`src/mass/summarize.ts`). Se tallennetaan konttiin jäsenenä `<ottelu>.summary.json` (rooli `summary`, katso [Yksi tiedosto per ottelu](container.md)). Offline-työkalu kirjoittaa ne sekä kunkin kansion hakemiston. Se on kehittäjän työkalu. Aja se suurelle kansiolle, niin paneelin ei tarvitse tehdä työtä:

```
node tools/3dheat-summarize.mjs <kansio>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Ottelu, jolle yhteenveto on jo tehty (sama muotoversio), vain luetaan. `--force` laskee sen uudelleen. `--no-write` jättää kontit koskematta.
- Tiedosto, joka muuttui viimeisten `--settle`-minuuttien (10) aikana, jätetään pois. Muunnin saattaa vielä kirjoittaa sitä.
- `<kansio>/3dheat-index.jsonl.gz`: yksi rivi ottelua kohti. Siinä ovat polku, koko, aika ja yhteenveto ilman ruudukkoa. `<kansio>/3dheat-index.grids.jsonl.gz`: yksi rivi ottelua kohti ruudukon kanssa.
- Aja se koneella, jossa tiedostot ovat, pienellä prioriteetilla (esimerkiksi `nice -n 19 ionice -c3` Linuxissa).

Paneeli ottaa jokaiselle ottelulle ensimmäisen löytyvän: kansion indeksirivin (sama polku ja koko), selaimen välimuistin (IndexedDB, nimen, koon ja ajan mukaan), kontin `summary`-jäsenen tai yhteenvedon, joka lasketaan työntekijäpoolissa ja tallennetaan välimuistiin. Kansio ilman indeksiä toimii siis myös. Ensimmäisellä kerralla se on hitaampi, koska taulukot luetaan, ja sen jälkeen välimuistista.

## Paneeli {#the-panel}

Valitse kansio (tai tiedostot; **Lisää kansio...** liittää toisen kansion). Ikkunassa on suodattimet **Peli**, **Kartta**, **Tila**, **Mistä** ja **Mihin**, valinta **Jaa sarakkeen mukaan**, **Vähiten elämiä** ja **Vain pelaajat** sekä seuraavat välilehdet. Jokainen luku tulee yhteenvedoista. Kun napsautat riviä, solua tai havaintoa, sen ottelut latautuvat näkymään monen ottelun päällekkäiskuvana. Suodattimet, jotka näyttävät sen (ajoneuvo, luokka, ase, joukkue, pelaaja), ja kamera on paikassa:

| Välilehti | Mitä siinä on |
|---|---|
| Yleiskatsaus | ottelut, tunnit, pelaajat, elämät, rivit ja päivämäärät; ottelut päivässä; peleittäin, kartoittain, tiloittain; tapahtumien summat; talous valuutoittain; milloin ottelun aikana tapahtuu asioita |
| Tasapaino | ajoneuvoittain, luokittain, aseittain tai joukkueittain, jaettuna kartan, tilan, tason tai pelin mukaan: K/D sen ~95 %:n välillä, voittoprosentti (Wilson), selviytyminen, tappoja ja osumia minuutissa, ansiot minuutissa sekä q, eli K/D:n ja voiton Benjamini-Hochberg-väärien löytöjen osuus verrattuna jakauman muihin. **Vähiten elämiä** piilottaa rivit, joissa on liian vähän elämiä luotettavasti; **Vain pelaajat** jättää pois tehtävän tekoälyn ajamat |
| Trendit | käytön osuus (läsnäolosta), K/D tai voittoprosentti parhaiden ajoneuvojen tai luokkien mukaan päivittäin, viikoittain tai kuukausittain |
| Pelaajat | eri pelaajat, ottelut pelaajaa kohti, pelaajat ottelua kohti, useimmin esiintyvät pelaajat |
| Puolet | jokaisen kartan jokainen puoli: ottelut, jotka voitettiin, verrattuna tasaiseen jakoon |
| Lähitaistelu | kierrosdata: avausduellit puolittain ja niiden muuttuminen, vaihdot, kurkkija vs. pitäjä, ristitulet, sokaistut sisäänmenot, tähtäys, pommin asetukset, miehen etu ja, **Kartan mukaan**, paikat, joissa pelaajat kuolevat niihin mennessään. Jokainen on osuus Wilsonin välillä. Ne tulevat yhteenvetojen `cqb`-laskureista ([Lähitaistelu ja kierrokset](close-quarters.md)) |
| Kartta | kartan summattu ruudukko: läsnäolo, tappoja, kuolemia, K/D, mikä tahansa tapahtuma, virtaus ja **kuinka monessa ottelussa kuuma** (vakaus). Joukkueittain, 1, 2, 4 tai 8 kertaa solun koolla |
| Paikat | paikat, jotka erottuvat luvuissa mutta eivät lämpökartassa (iso alue, joka on kiireinen kokonaisuutena, käytävät, korkeuskaistat); **Etsi paikkoja** |
| Lokerot | ryhmät, jotka menevät selvästi paremmin tai huonommin kuin muut (ajoneuvo yhdellä kartalla, sektori yhdessä korkeudessa); **Etsi lokeroita** |
| Havainnot | massa-ilmaisimet ja karttailmaisimet (alla); **Kopioi raportti (JSON)** antaa JSON:n, jota kielimalli lukee |

## Havainnot usean ottelun yli {#insights-over-many-matches}

**Paikat**-välilehti löytää paikat, jotka erottuvat luvuissa mutta eivät lämpökartassa. Näitä ovat iso alue, joka on kiireinen kokonaisuutena, käytävä, korkeuskaista tai paikka, joka on kiireinen vain osassa ottelua. Se merkitsee **piilossa** ne, joita tavallinen lämpökartta ei näytä, ja piirtää ne 3D-näkymään. **Lataa** lentää paikkaan sen otteluilla, joita se piti hallussaan. **Lokerot**-välilehti löytää ryhmät (ajoneuvo yhdellä kartalla ja puolella, sektori yhdessä korkeudessa), jotka menevät selvästi paremmin tai huonommin kuin muut. Napsauta yhtä nähdäksesi sen tarkennukset.

**Havainnot**-välilehti löytää kaikista otteluista ajoneuvot, jotka vaihtavat tai voittavat muita paremmin tai huonommin. Se löytää paikat, jotka ovat kuumia tasaisessa osuudessa otteluita, puolet, jotka voittavat enemmän kuin tasainen jako, ajoneuvot, joiden käyttö muuttuu päivämäärien mukaan, ja osat ottelusta, joissa on enemmän tappoja kuin tasainen jako antaisi. Jokaisessa löydöksessä on sen luvut, vaikutus, väli ja väärien löytöjen osuus (pidetään 5 %:ssa), ja napsautus lataa sen ottelut. Yksityiskohdat: [Kehittäjille](#for-developers).

## Mittakaava {#scale}

Voit toistaa pienen version itse: `node tools/demo-data.mjs` kirjoittaa 150 synteettistä tankkiottelua kansioon `tools/.shots/demo/mass` (noin 1 000 riviä kussakin). Mitattu näillä 150 synteettisellä demo-ottelulla, jotka tulevat työkalusta `tools/demo-data.mjs`, pöytäkoneella (oikea ottelu on paljon suurempi):

- `tools/3dheat-summarize.mjs` 4 työntekijällä: 2,6-4,8 s kaikille 150, 8-21 ms ottelua kohti työntekijän sisällä. Toinen ajo, joka vain lukee yhteenvedot, kestää noin 2 s.
- Kansion avaaminen paneelissa indeksin ollessa läsnä, kunnes ikkuna näkyy: 0,9-1,6 s. Työntekijän oma osuus (150 indeksiriviä luetaan) on 20-40 ms.
- Välilehdelle vaihtaminen, kunnes sen taulukko on piirretty: Yleiskatsaus 10-30 ms, Tasapaino 30-70 ms, Trendit 30-45 ms, Pelaajat 15-35 ms, Puolet 15-20 ms, Kartta 55-130 ms.
- Varasto pitää 150 ottelua noin 0,5 Mt:ssa.

Ikkunan avaaminen vie yhden lyhyen ruudun: valitut tiedostot menevät työntekijälle 16 kerrallaan, ja päivämääräkentät ja ensimmäinen välilehti tulevat ruudun myöhemmin kuin ikkuna.

Varasto pitää noin 15 KB ottelua kohti, joten 10 000 ottelua vie noin 150 MB työntekijässä. Ruudukkoja ei pidetä kerralla kauempaa kuin kartta pyytää.

## Kehittäjille {#for-developers}

### Havainnot usean ottelun yli {#insights-over-many-matches}

`src/mass/detect.ts`: jokainen löydös sen lukuineen, vaikutuksineen ja väleineen, p ja q (Benjamini-Hochberg kaikkien kokeiltujen ilmaisimien yli, pidetään 5 %:ssa), tarkempi tarkastelu, joka lataa sen ottelut, ja lauseavain sen arvoineen. Raportti (`heat3d.mass/1`) on se, minkä `massReportForModel` antaa kertojalle. Se on samassa muodossa kuin yhden ottelun raportti (`insights/seam.ts`).

| Ilmaisin | Löytää |
|---|---|
| `balance` | pelaajan ajoneuvon, joka vaihtaa tai voittaa muita paremmin tai huonommin kartalla tai tilassa |
| `hotspot` | paikat, jotka ovat kuumia tasaisessa osuudessa tulleista otteluista (kuumat ottelut / nähdyt ottelut, verrattuna kartan muihin soluihin). Ei vain summassa kuuma |
| `side` | kartan puoli, joka voittaa enemmän kuin tasainen jako |
| `meta` | ajoneuvon osuus pelaajien elämistä tai sen K/D, joka siirtyy päivämäärien alkupuoliskon ja loppupuoliskon välillä. Riittävän suuri, trendaa neljänneksittäin ja sama suunta useimmilla kartoilla (alla) |
| `phase` | osa ottelun pituudesta, jossa on enemmän tappoja, osumia, laukaisuja... kuin tasainen jako |
| `place` | paikat, jotka erottuvat monen ottelun yli (vaihe B, alla): alueen nopeus tai tappo-osuus verrattuna kunkin ottelun omaan, ympyrät, käytävät, kasvatetut vyöhykkeet, korkeuskaistat, vaiheet. Piilossa, jos tavallinen lämpökartta ei näytä niitä |
| `niche` | ryhmät, jotka menevät selvästi paremmin tai huonommin (vaihe B, alla) |
| `grid.*` | yksittäisen aineiston ilmaisimet (voimapaikat, kuumat ja hiljaiset vyöhykkeet, luokkapaikat) kunkin kartan summatuilla ruudukoilla. `GridMerge.toInsightJob` täyttää ruudukot yhteenvedoista. Ilmaisimet, jotka tarvitsevat reittejä, ohitetaan |

### Yhteenveto {#the-summary}

Tavallista JSONia (`src/mass/types.ts`), noin 5-30 KB pakattuna ottelua kohti:

- ottelu: peli, kartta, tila, tehtävä, alku, pituus, rivit, elämät, pelaajat, tekoäly, joukkueet (elämät, pelaajat, läsnäolo, tappoja, kuolemia, voitto, raha) ja voittaja;
- ajoneuvoittain ja joukkueittain: luokka, taso, elämät, pelaajaelämät, läsnäolo, tapahtumat kanonisen tyypin mukaan, tappoja kohteen luokan mukaan, voitot, raha;
- pelaajittain (käyttäjätunnuksen mukaan, muuten nimen): joukkue, elämät, läsnäolo, tappoja, kuolemia, osumia, laukaisuja, voitto, ajoneuvot; aseittain: tapahtumat tyypin mukaan;
- talouden sarakkeet (`cost_*`, `earn_*`) ja niiden summat;
- vaiheet: tapahtumat tyypin mukaan 20 osassa ottelun pituutta ja minuutin mukaan;
- käyttäytyminen: ottelun yhteiskäyttäytymisen mitat (linjautuminen, reittiohjaus, kaistat, ruuhkautuminen, johtajat, viimeiset, murtumispiste, riski tappioiden jälkeen, putket, ostojen sopimus, painostus), kukin omalla nollamallillaan, p ja q. Katso [Yhteiskäyttäytyminen](collective-behaviour.md);
- ruudukko (alla).

Laskenta tehdään samalla tavalla kuin katsoja laskee: sarakkeet löytyvät samalla tavalla kuin massalataaja löytää ne (`leanSpec`), ja tapahtumat luokitellaan tiedostolla `data/canonical.ts`. Tappo, jonka Tacview-ase tekee, kirjautuu ampujalle. Kuolema, joka kirjataan kahdesti samaan aikaan (`dead`, `death`), lasketaan kerran.

#### Ruudukko: mihin vaihe B perustuu {#the-grid-what-stage-b-builds-on}

Avaruudellinen osa on tehty skannaustilastoille alueille, joilla on mikä tahansa koko ja muoto, ei vain lämpökuville:

- **Pyramidi.** Solut ovat maailman yksiköissä kahden potensseja kohdistettuina (x ja z sellaisina kuin katsoja ne sijoittaa). Taso `k` on solut, jotka on summattu `ix >> k, iz >> k` -muodossa. Se on tarkka, saman ottelun sisällä ja eri solukokoisten otteluiden välillä. Mikä tahansa alue (laatikko, käytävä viivaa pitkin, rengas) on solujen summa. Hienoin taso sopii ottelun vankkaan ulottuvuuteen (solut, jotka pitävät 99 % läsnäolosta) 128 soluun. Sen ulkopuoliset harhautuneet pidetään.
- **Altistus jokaisen luvun vieressä.** Läsnäolosekunnit per solu, per joukkue (`pt`), per ajoneuvoluokka (`pc`) ja per korkeuskaista (`ph`). Alueen nopeus, odotus ja suhde lasketaan siis mille tahansa alaryhmälle.
- **Korkeus.** Kaistat ottelun lattian yläpuolella (korkeuden 1. persentiili): alle 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000 ja yli. Tiedosto, jossa on sarake `floor`, `storey` tai `deck`, jakaa kaistoihin kerrosten mukaan. `y` on kunkin solun keskikorkeus, `y0` sen alin kohta (sen kerros, kun korkeus on sen yläpuolella).
- **Tapahtumat** monikkoina `[solu, tyyppi, joukkue, luokka, kaista, määrä]`.
- **Aikaviipaleet** karkealla tasolla (8 solua sivulle), minuutin mukaan ottelun alusta: `[cx, cz, minuutti, tyyppi, arvo]`. Läsnäolosekunnit ovat tyyppi `GRID_KINDS.length`. Ottelun vaiheet ovat minuutteja pituuden yli.
- Harva, laskurit kokonaislukuja, sekunnit kymmenesosaan. Koko on rajattu sen mukaan, mitä tapahtui.

### Vaihe B: paikat ja lokerot {#stage-b-places-and-niches}

Vaihe B etsii sitä, mikä erottuu luvuissa, mutta ei silmiin: iso alue, joka on kiireinen kokonaisuutena ilman kuumaa solua, outo tappo-kuolema-suhde harvoilla tapahtumilla, käytävä, korkeuskaista, klusteri, joka on vain osassa ottelua. Ja ryhmät (ajoneuvo yhdellä kartalla yhdellä puolella, sektori yhdessä korkeudessa), jotka menevät selvästi paremmin tai huonommin kuin muut. Yksi **Etsi paikkoja** / **Etsi lokeroita** / **Etsi havaintoja** ajaa kaikki ilmaisimet. Kolme välilehteä jakavat saman raportin.

#### Paikat (`src/mass/scan.ts`) {#places-srcmassscants}

Kunkin kartan ottelut luetaan kahdesti, yksi ottelu kerrallaan. Muisti pitää summia rasterilla, jossa on enintään 64 solua sivulle (16 aika-avaruusskannaukselle). Ottelut itse eivät jää muistiin.

- **Mitat.** Tapahtuman nopeus läsnäoloa sekunnissa: tappoja, kuolemia, osumia, laukaisuja, valtauksia kaikille yksiköille, per luokka (4, joilla on eniten tapahtumia) ja per korkeuskaista. Sekä tappojen osuus tappoihin ja kuolemiin (kaikki, per puoli, per kaista). Mitkä luokat ja puolet otetaan, päättää `planOf`.
- **Odotus ottelun mukaan.** Kunkin ottelun oma nopeus, joka jakautuu sen omalle läsnäololle solussa, on solun odotus (kovariaatilla säädetty Kulldorffin skannaus, jaettu ottelun mukaan). Muutama verinen ottelu tai yksi kiireinen palvelin ei tee paikkaa.
- **Hajonta.** Ottelut eroavat paljon enemmän kuin Poisson antaisi. Kunkin ottelun jäännökset summataan lohkoissa, joissa on 1, 2, 4, 8 ja 16 solua. Kunkin lohkokoon hajonta (neliöidyt jäännökset jaettuna nollavarianssilla, yhdistetty, huonoin 5 % lohkoista pois jätettynä) skaalaa jokaisen kokoisen alueen testin. Tämä on quasi-likelihood-suhde: Poisson nopeuksille, binomi osuuksille.
- **Alueet.** Ympyrät 0,75-18 solua; ellipsit kuudessa kulmassa, 3 ja 6 kertaa niin pitkiä kuin leveitä, 3-18 solua (käytävät; akseli on oivalluksen `place.path`); vyöhykkeet, jotka kasvatetaan solu kerrallaan voimakkaimmista paikallisista Getis-Ord Gi* -soluista, kun alueen z kasvaa (epäsäännölliset muodot). Kasvatus tehdään yhdellä puoliskolla otteluista ja testataan toisella, joten kasvatuksen vapaus ei tuota vääriä paikkoja. Kukin korkeuskaista verrataan ottelun muihin kaistoihin koko kartalla (klusterin kestävä). Aika-avaruussylinterit: ympyrä yhdessä tai kahdessa viidesosassa ottelun pituutta, verrattuna ottelun omaan tapahtumien leviämiseen paikassa ja ajassa (aika-avaruuden permutaatioskannaus).
- **Testaus.** p quasi-likelihoodista. Benjamini-Hochberg kaikkien alueiden yli, joita kokeiltiin jokaisella kartalla (700 000 kolmella kartalla on tavallista), 5 %:ssa. Läpäisseet karsitaan (alue, joka on enimmäkseen vahvemman saman mitan alueen sisällä, sanoo saman asian). Ne luetaan uudelleen **vakauden** vuoksi: ottelut, jotka näkivät sen, ottelut, joissa se piti, sen suunta viidessä ottelujoukon taitoksessa. Ne testataan vielä kerran ottelujen oman hajonnan mukaan (klusterin kestävä, ottelut klustereina, ei koskaan Poisson), BH taas. Hiljaiset paikat perustasolla (2 % tai enemmän kartan synnyistä, lentoonlähdöistä ja laskuista) jätetään pois.
- **Vaikutus.** Nopeus- tai kertoimen suhde, kutistettu empiirisellä Bayesilla (kartan 2x2-lohkoihin sovitettu gamma-priori), noin 95 %:n väli hajonnassa. Gi* 1, 2 ja 4 solulla ja paikallinen Moran keskustassa.
- **Visuaalinen ilmeisyys.** Kuinka paljon alue näkyy jo tapahtuman tavallisessa lämpökartassa (logaritminen asteikko kirkkaimpaan soluun, kuten näkymät piirtävät). Sen kontrasti ympäröivään renkaaseen (kymmenesosa paletista on vaikea nähdä, kaksi viidesosaa on selvä) ja kirkas huippu, joka kantaa ylimäärän. Suhdetta ei koskaan piirretä lämpökartalla, joten osuus lasketaan puoleksi. Alle 35 % on **piilossa**. Sijoitus: vahvuus (vaikutus kyllästyy 4 kertaan, hiljaiset paikat 0,7:ään) kertaa `1 - 0,7 x ilmeisyys` kertaa taittojen yhtenevyys.

**Paikat**-välilehti luettelee ne (oletuksena vain piilossa olevat; kartan, muodon ja suunnan mukaan). Napsautus piirtää kartan paikat 3D-näkymään (`placeLines.ts`: moottorin ylälinjat, rakennettu kerran; magenta piilossa, meripihka tavallinen, syaani hiljainen, valittu täysin; kaista laatikkona lattiasta kattoon) ja Kartta-välilehden kankaalle. **Lataa** lentää paikkaan ja lataa 60 ottelua, joissa se oli eniten, suodatettuna sen tapahtumalla (ja luokalla).

#### Lokerot (`src/mass/niche.ts`) {#niches-srcmassnichets}

Säteihaku (leveys 24, syvyys 3) kolmen taulukon yli. **Elämät** (pelaajien elämät: peli, kartta, tila, luokka, ajoneuvo, puoli, taso, päivämäärien neljännes, ottelun pituuden kolmasosa; K/D, voitto, kuolema elämää kohden, tappoja tunnissa, ansio minuutissa). **Paikat** (tappoja ja kuolemia kartan, tilan, päivämäärien, kartan sektorin 4 x 4, luokan, puolen ja kaistan mukaan). **Vaiheet** (sektori ja ottelun viidesosa: K/D, kuolemia tunnissa läsnäoloa). Ryhmää verrataan koko aineistoon, ottelut klustereina (ryhmän jäännösten sandwich-varianssi ottelun mukaan). Sen vaikutus on kerroin tai nopeussuhde, kutistettu priorilla 20 lopputulosta. Se tarvitsee 30 lopputulosta 8 ottelussa. Tarkennuksen on oltava 10 % vahvempi kuin sen vanhempi. Ryhmät, joissa lopputulos on aina tai ei koskaan (ei tallennettu niille), jätetään pois. Säilytetään: BH alle 5 % kaikkien arvioitujen ryhmien yli, kutistettu suhde vähintään 1,25 (tai 1/1,25), neljä viidestä taitoksesta samaa mieltä, eikä tarkennusta, joka vain toistaa vanhempansa. **Lokerot**-välilehti luettelee ne. Napsautus näyttää jokaisen yhden ehdon tarkennuksen ryhmälle (tutkija), **Lataa** lataa sen ottelut. Varusteita ei ole vielä yhteenvedoissa.

#### Muutokset meta-tasolla, joilla on käytännön merkitystä {#meta-shifts-with-practical-significance}

Sekavilla päivämäärillä binomitesti elämille merkitsi lähes jokaisen muutoksen merkitseväksi. `meta` testaa nyt klusterin kestävästi (kunkin ottelun elämät klusterina). Se säilyttää käyttömuutoksen vain, kun se on vähintään 2 pistettä ja 25 %, K/D-muutoksen vain, kun se on vähintään 1,3 kertaa, ja päivämäärien neljännekset trendaavat samaan suuntaan (Kendallin tau vähintään 0,5). Ajoneuvolle usealla kartalla sen on oltava sama suunta useimmilla. Jäljelle jää vain muutama muutos testijoukossa, jossa tavallinen testi merkitsi lähes kaikki.

#### Mallille {#for-a-model}

`massReportForModel` antaa jokaiselle paikalle sen `region`-kentän (muoto, piilossa, ilmeisyys, korkeudet, vaihe) ja jokaiselle lokerolle sen `conditions`-kentän. Lisäksi se kertoo, kuinka monta aluetta ja ryhmää kokeiltiin. Tietolinssi voi lukea paikat tappoalueina ja lähestymisväylinä: niiden tyypit ovat `place.*` ja `niche.*`.

#### Tarkistukset {#checks}

`scan.test.ts` istuttaa hajanaisen alueen (1,6 kertaa kuolemanopeus 22 solun ympyrän yli, heikko jokaisessa solussa), käytävän, korkeuskaistan ja vain vaiheessa olevan klusterin 240 synteettiseen ylihajontaisen ottelun joukkoon. Kaikki löytyvät, hajanainen piilotetaan. Se ajaa kahdeksan nollajoukkoa, joissa on 60 ottelua: ei yhtään paikkaa. `niche.test.ts` löytää istutetun ajoneuvo x kartta x puoli -ryhmän eikä mitään viidessä nollataulukossa.
