---
title: "Sanasto"
nav_order: 21
lang: "fi"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Sanasto

Lyhyet merkitykset tämän sivuston sanoille selkokielellä. Jokainen kohta linkittää sivulle, joka selittää sen kokonaan.

## Data {#data}

**Rivi.** Yksi rivi datastasi: yksi asia, joka tapahtui yhdessä paikassa ja hetkessä, esimerkiksi "pelaaja 7 oli täällä sekunnissa 12". Katselin piirtää jokaisen rivin. [Tietomuodot](data-formats.md)

**Sarake.** Yksi arvotyyppi riveissä, kuten x, y, z, aika tai joukkue. Katselin arvaa, mikä sarake on mikä, ja arvausta voi muuttaa. [Sarakemääritys](column-mapping.md)

**CSV.** Tavallinen tekstitaulukko: yksi rivi per rivi, arvot erotettu pilkuilla. Melkein jokainen ohjelma osaa kirjoittaa sen. [Tiedostojen lataaminen](loading-files.md)

**Parquet.** Tiivis taulukkotiedosto, joka latautuu nopeasti, vaikka riviä olisi miljoonia. Se on paras muoto antaa katselimelle. [Tiedostojen lataaminen](loading-files.md)

**Tapahtuma.** Jokin, joka tapahtui, kuten laukaus, osuma, tappo tai lentoonlähtö. Rivi voi olla tapahtuma, tai pelkkä "olin täällä". [Suodattimet](filters.md)

**Henkilö.** Se, joka teki rivit: pelaaja, lentäjä, auto tai panssarivaunu. Yksi henkilö on yksi sijaintien rivi ajan yli. [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md)

**Ryhmä (joukkue).** Joukko henkilöitä, jotka näytetään samalla värillä, esimerkiksi Blue ja Red. [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md)

**Istunto (ottelu, kierros).** Yksi pelikerta. Ottelu tai kierros on istunto. Katselin voi näyttää yhden istunnon tai asettaa monta päällekkäin. [Istunnot, henkilöt ja ryhmät](sessions-persons-groups.md)

**Kenttä.** 3D-kartta, jolla data tapahtui: maa, rakennukset, seinät. Rivit näkyvät siellä, missä ne tapahtuivat kentällä. [Kentät ja taustageometria](levels.md)

## Datan katselu {#looking-at-the-data}

**Lämpökartta.** Kuva, jossa paikat, joihin monet rivit osuvat, hehkuvat kuumempina. Kylmät paikat ovat hiljaisia, kuumat vilkkaita. [Lämpö](heat.md)

**Lämpö.** Kuinka paljon jossakin paikassa tapahtui. Katselin laskee yhteen jokaisen rivin hehkun kussakin paikassa; summa on lämpö. [Lämpö](heat.md)

**Sprite.** Pieni hehkuva täplä, jonka katselin piirtää yhdelle riville. Monet päällekkäiset spritet kasautuvat lämmöksi. [Spriten muoto](sprite-shape.md)

**Valotus.** Kuinka kirkas kuva on. Kuten kamerassa, liian suuri valotus tekee kaiken valkoiseksi ja liian pieni piilottaa yksityiskohdat. [Väri ja valotus](colour-and-exposure.md)

**Kyllästys.** Lämmön määrä, joka lasketaan "niin kuumaksi kuin värit menevät". Laske sitä, jotta hiljaiset paikat näkyvät; nosta, jotta näet vain kuumimmat. [Väri ja valotus](colour-and-exposure.md)

**Tilavuus.** Laatikko tai muoto, jonka sijoitat 3D-näkymään. Katselin laskee sen sisällä olevan ja voi verrata tilavuuksia keskenään. [Tilavuudet ja vertailu](volumes.md)

**Suodatin.** Sääntö, joka piilottaa halumasi rivit, esimerkiksi "vain tappot" tai "vain joukkue Red". [Suodattimet](filters.md)

## Toisto {#replay}

**Hahmo.** Pieni malli panssarivaunusta, lentokoneesta, autosta tai sotilaasta, joka liikkuu sinne, missä data kertoo sen olleen. [Hahmot](figures.md)

**LOD (yksityiskohtataso).** Jokaisella hahmolla on yksityiskohtainen, yksinkertaisempi ja hyvin yksinkertainen versio. Lähellä olevat käyttävät yksityiskohtaista ja kaukana olevat yksinkertaista, joten tuhansia voi piirtää kerralla. [Hahmot](figures.md)

## Kilpa-ajo {#racing}

**Kierros.** Yksi kierros radan ympäri, linjalta takaisin linjalle. [Kierrosten lataaminen](race-loading-laps.md)

**Vertailukierros.** Kierros, johon kaikkia muita verrataan. Erot näytetään "nopeampana" tai "hitaampana" kuin se. [Kierrosten lataaminen](race-loading-laps.md)

**Kärki.** Mutkan kohta, jossa auto on lähinnä sisäreunaa. [Mutka mutkalta -analyysi](race-corner-analysis.md)

**Luisto.** Kuinka paljon rengas liukuu. Pieni luisto antaa eniten pitoa; liian suuri, ja auto luistaa. [Kisa-analytiikka: menetelmä](race-analytics.md)

**Verhokäyrä.** Mitä auto pystyy tekemään kussakin nopeudessa: kuinka kovaa se voi kääntyä, jarruttaa ja kiihtyä ennen kuin luistaa. [Kisa-analytiikka: menetelmä](race-analytics.md)

## Ilma-alusten luvut {#aircraft-numbers}

**ALT.** Korkeus: etäisyys maan tai merenpinnan yläpuolella. [Ottelun toisto](match-replay.md#labels-and-statistics)

**TAS.** Todellinen ilmanopeus: kuinka nopeasti lentokone liikkuu ilmassa. [Ottelun toisto](match-replay.md#labels-and-statistics)

## Tietokone {#computer}

**GPU.** Näytönohjain tai siru. Se piirtää kuvan ja on paljon nopeampi kuin pääprosessori miljoonien täplien piirtämisessä. [Kaksi taustaohjelmaa](backends.md)

**WebGPU / WebGL2.** Kaksi tapaa, joilla selain antaa sivun käyttää GPU:ta. WebGPU on uudempi. Katselin voi käyttää kumpaa tahansa ja valitsee selaimesi parhaan. [Kaksi taustaohjelmaa](backends.md)

## Counter-Strike-sanat {#counter-strike-words}

**Kierros.** Yksi lyhyt taistelu ottelun sisällä. Toinen puoli voittaa sen, ja tulos kasvaa yhdellä.

**Eco, force buy, full buy.** Kuinka paljon rahaa puoli käyttää aseisiin kierroksen alussa. Eco säästää rahaa ja ostaa lähes ei mitään (alle 1 500 dollaria pelaajaa kohden keskimäärin). Force buy käyttää kaiken, mitä sillä on (alle 4 000 dollaria). Full buy ostaa kaiken, minkä pystyy. [Ottelun analyysi](match-analysis.md)

**Vaihtokauppa.** Tappo, joka maksaa takaisin tapon: sinut ammutaan, ja joukkuetoveri ampuu tappajasi 5 sekunnin sisällä. [Ottelun analyysi](match-analysis.md)

**KAST.** Niiden kierrosten osuus, joissa pelaaja teki tapon, avustuksen, selvisi tai joutui vaihtokauppaan. Suurempi luku tarkoittaa, että pelaaja auttoi useammalla kierroksella. [Ottelun analyysi](match-analysis.md)

**ADR.** Keskimääräinen vahinko kierrosta kohden: kuinka paljon terveyttä pelaaja menetti vihollisilta joka kierroksella. [Ottelun analyysi](match-analysis.md)
