---
title: "Sanasto"
nav_order: 21
lang: "fi"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Sanasto

Tämän sivuston sanojen lyhyet merkitykset selkokielellä. Jokainen merkintä linkittää sivulle, joka selittää sen kokonaan.

## Data {#data}

**Rivi.** Yksi rivi datassasi: yksi asia, joka tapahtui yhdessä paikassa ja hetkessä, esimerkiksi "pelaaja 7 oli täällä sekunnilla 12". Katselija piirtää jokaisen rivin. [Tiedostomuodot](data-formats.md)

**Sarake.** Yksi arvotyyppi riveissä, kuten x, y, z, aika tai joukkue. Katselija arvaa, mikä sarake on mikä, ja voit muuttaa arvausta. [Sarakemääritys](column-mapping.md)

**CSV.** Tavallinen tekstitaulukko: yksi rivi per rivi, arvot erotettu pilkuilla. Lähes jokainen ohjelma osaa kirjoittaa sen. [Tiedostojen lataaminen](loading-files.md)

**Parquet.** Tiivis taulukkotiedosto, joka aukeaa nopeasti, vaikka riviä olisi miljoonia. Se on paras muoto antaa katselijalle. [Tiedostojen lataaminen](loading-files.md)

**Tapahtuma.** Jokin, mikä tapahtui, kuten laukaus, osuma, tappo tai lentoonlähtö. Rivi voi olla tapahtuma, tai vain "minä olin täällä". [Suodattimet](filters.md)

**Henkilö.** Se, joka teki rivit: pelaaja, lentäjä, auto tai panssarivaunu. Yksi henkilö on yksi rivi sijainteja ajan yli. [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md)

**Ryhmä (joukkue).** Joukko henkilöitä, jotka näkyvät samalla värillä, esimerkiksi Sininen ja Punainen. [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md)

**Istunto (ottelu, kierros).** Yksi pelin kerta. Ottelu tai kierros on istunto. Katselija voi näyttää yhden istunnon tai asetella monta päällekkäin. [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md)

**Kenttä.** 3D-kartta, jolla data tapahtui: maa, rakennukset, seinät. Rivit näkyvät siellä, missä ne tapahtuivat kentällä. [Kentät ja taustageometria](levels.md)

## Datan katselu {#looking-at-the-data}

**Lämpökartta.** Kuva, jossa paikat, joihin monet rivit osuvat, hehkuvat kuumempina. Kylmät paikat ovat hiljaisia, kuumat paikat vilkkaita. [Lämpö](heat.md)

**Lämpö.** Kuinka paljon jossain kohdassa tapahtui. Katselija laskee yhteen jokaisen rivin hehkun kussakin paikassa; summa on lämpö. [Lämpö](heat.md)

**Sprite.** Pieni hehkuva pisteryhmä, jonka katselija piirtää yhdelle riville. Monet päällekkäiset spritet summautuvat lämmöksi. [Spriten muoto](sprite-shape.md)

**Valotus.** Kuinka kirkas kuva on. Kuten kamerassa, liian suuri valotus tekee kaiken valkoiseksi ja liian pieni piilottaa yksityiskohdat. [Väri ja valotus](colour-and-exposure.md)

**Kyllästys.** Lämmön määrä, joka lasketaan "yhtä kuumaksi kuin värit menevät". Laske sitä, jotta hiljaiset paikat näkyvät; nosta sitä, jotta näet vain kuumimmat. [Väri ja valotus](colour-and-exposure.md)

**Tilavuus.** Laatikko tai muoto, jonka asetat 3D-näkymään. Katselija laskee, mitä sen sisällä on, ja voi verrata tilavuuksia keskenään. [Tilavuudet ja vertailu](volumes.md)

**Suodatin.** Sääntö, joka piilottaa rivit, joita et halua, esimerkiksi "vain tappot" tai "vain joukkue Punainen". [Suodattimet](filters.md)

## Toisto {#replay}

**Hahmo.** Pieni malli panssarivaunusta, lentokoneesta, autosta tai sotilaasta, joka liikkuu sinne, missä data kertoo sen olleen. [Hahmot](figures.md)

**LOD (yksityiskohtataso).** Jokaisella hahmolla on yksityiskohtainen, yksinkertaisempi ja hyvin yksinkertainen versio. Lähellä olevat käyttävät yksityiskohtaista ja kaukana olevat yksinkertaista, joten tuhansia voi piirtää kerralla. [Hahmot](figures.md)

## Kilpa-ajo {#racing}

**Kierros.** Yksi kierros radalla, maaliviivalta takaisin maaliviivalle. [Kierrosten lataaminen](race-loading-laps.md)

**Vertailukierros.** Kierros, johon kaikkia muita verrataan. Erot näytetään "nopeampana" tai "hitaampana" kuin se. [Kierrosten lataaminen](race-loading-laps.md)

**Kärki.** Mutkan kohta, jossa auto on lähimpänä sisäreunaa. [Mutka mutkalta -analyysi](race-corner-analysis.md)

**Luisto.** Kuinka paljon rengas liukuu. Pieni luisto antaa eniten pitoa; liian suuri luisto saa auton lipsumaan. [Kisa-analytiikka: menetelmä](race-analytics.md)

**Verhokäyrä.** Mitä auto kykenee tekemään kussakin nopeudessa: kuinka kovaa se voi kääntyä, jarruttaa ja kiihtyä ennen kuin luistaa. [Kisa-analytiikka: menetelmä](race-analytics.md)

## Ilma-alusten luvut {#aircraft-numbers}

**ALT.** Korkeus: etäisyys maanpinnasta tai merenpinnasta. [Ottelun toisto](match-replay.md#labels-and-statistics)

**TAS.** Todellinen ilmanopeus: kuinka nopeasti lentokone liikkuu ilmassa. [Ottelun toisto](match-replay.md#labels-and-statistics)

## Tietokone {#computer}

**GPU.** Näytönohjain tai -siru. Se piirtää kuvan ja on paljon nopeampi kuin pääprosessori piirtämään miljoonia pisteitä. [Kaksi taustaohjelmaa](backends.md)

**WebGPU / WebGL2.** Kaksi tapaa, joilla selain antaa sivun käyttää GPU:ta. WebGPU on uudempi. Katselija voi käyttää kumpaa tahansa ja valitsee selaimesi parhaan. [Kaksi taustaohjelmaa](backends.md)

## Counter-Strike-sanat {#counter-strike-words}

**Kierros.** Yksi lyhyt taistelu ottelun sisällä. Yksi puoli voittaa sen, ja tulos kasvaa yhdellä.

**Eco, force buy, full buy.** Kuinka paljon rahaa puoli käyttää aseisiin kierroksen alussa. Eco säästää rahaa ja ostaa lähes ei mitään (keskimäärin alle 1 500 dollaria pelaajaa kohden). Force buy käyttää sen, mitä sillä on (alle 4 000 dollaria). Full buy ostaa kaiken, minkä voi. [Ottelun analyysi](match-analysis.md)

**Trade.** Tappo, joka maksaa takaisin tappion: sinut ammutaan, ja joukkuetoveri ampuu tappajasi 5 sekunnin sisällä. [Ottelun analyysi](match-analysis.md)

**KAST.** Osuus kierroksista, joissa pelaaja teki tapon, sai avun, selvisi hengissä tai oli trade-kaupassa. Suurempi luku tarkoittaa, että pelaaja auttoi useammalla kierroksella. [Ottelun analyysi](match-analysis.md)

**ADR.** Keskimääräinen vahinko kierrosta kohden: kuinka paljon terveyttä pelaaja otti vihollisilta kullakin kierroksella. [Ottelun analyysi](match-analysis.md)
