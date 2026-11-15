---
title: "Erotus"
parent: "Lämmön tilat"
nav_order: 5
lang: "fi"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Erotus

Punainen siellä, missä joukkue A oli enemmän, vihreä-sininen siellä, missä joukkue B oli, ei mitään siellä, missä ne olivat tasan.

**Erotus** (näppäin 2) on etumerkillinen lämpö. Yhden joukon rivit lisäävät lämpöä, toisen joukon rivit vähentävät sitä. Siellä, missä kaksi joukkoa ovat tasan, tulos on nolla ja täysin läpinäkyvä. Siellä, missä toinen hallitsee, se näkyy sen puolen väreissä: oletuksena lämpimillä (läpinäkyvä → punainen → keltainen → valkoinen) **+**-puolelle ja viileillä (läpinäkyvä → vihreä → sininen → violetti) **−**-puolelle.

![Erotuslämpö: punainen siellä, missä +-puoli oli enemmän, vihreä ja sininen siellä, missä -puoli oli enemmän](../assets/img/en/difference-split.webp)

## Käyttötapa {#how-to-use-it}

1. Paina `2` (tai valitse **Erotus** tilapalkista).
2. Avaa **Erotusjako** sivupalkista.
3. Valitse **Jaa sarakkeen mukaan**: yleensä *Ryhmät*.
4. Aseta yksi ryhmä (tai arvo) **+**-puolelle ja toinen **−**-puolelle.
5. Lue värit: lämmin tarkoittaa +-puolta, viileä −-puolta. Paneeli varoittaa, jos toisella puolella ei ole rivejä (katso [Viestit, joita saatat nähdä](#messages-you-may-see)).

*Mitkä* kaksi joukkoa ovat koko kysymys, joten jako voi olla mikä tahansa säilytetty sarake, ei vain ryhmät. Rivit, jotka osuvat **kummallekaan** puolelle, **jätetään pois**, eikä niitä lasketa nollina. Tämän ansiosta jako useiden arvojen joukosta vertaa täsmälleen kahta valittua arvoa, ja se yhdistyy [suodattimiin](filters.md): suodata ensin yhteen karttaan ja jaa sitten se version mukaan.

Tila tarvitsee kaksi puolta: ryhmäsarakkeen, jossa on vähintään kaksi ryhmää, tai jaon sarakkeen, joka on säilytetty suodatusta varten. Datassa, jossa on alle kaksi ryhmää, lataus aloittaa sarakejaolla: monen tiedoston latauksessa ensin sarakkeella *Lähdetiedosto*, muuten ensimmäisellä kategoriasarakkeella, jossa on kaksi arvoa, muuten ensimmäisellä numeerisella sarakkeella, jolla on väli. Näin *vertaa kahta latausta* toimii datalla ilman ryhmiä. Vain data, jossa ei ole kumpaakaan, jättää tilan pois käytöstä. Samoin käy, jos sarakejako jää ilman mitään toisella puolella.

## Erotusjaon paneeli {#the-difference-split-panel}

Näkyy Erotus-tilassa lämpöpaneelien alapuolella.

**Jaa sarakkeen mukaan** tarjoaa:

| Vaihtoehto | Näytetään nimellä | Jakosääntö |
|---|---|---|
| Ryhmät | *Ryhmä (N)* (kun on ryhmäsarake) | Kukin ryhmä +-, −- tai kummallekaan puolelle, asetettuna [Joukkuelistassa](teams-list.md) |
| Kategoriasarake | *sarake (N arvoa)* | Arvot +-, −- tai kummallekaan puolelle |
| Numeerinen sarake | *sarake (numeerinen)* | Arvoväli kummallekin puolelle |
| Lähdetiedosto | *Lähdetiedosto - vertaa kahta latausta* (kun useita tiedostoja on ladattu) | Tiedostot +-, −- tai kummallekaan puolelle |

Vain sarakkeet, jotka on säilytetty kohdassa *Säilytä suodatusta varten* latauksessa, tarjotaan.

### Vertaa osuuksia, ei määriä {#compare-shares-not-counts}

**Vertaa osuuksia, ei määriä** (oletuksena pois) painottaa kumpaakin puolta yhdellä jaettuna sen omalla rivimäärällä, joten puoli, jolla on viisi kertaa enemmän rivejä, ei voita pelkillä luvuilla. Väri näyttää silloin, missä kumpi puoli on suhteellisesti yleisempi kuin toinen. Käytä sitä, kun kahdella puolella on hyvin eri määrä dataa, esimerkiksi kaksi eripituista istuntoa.

### Viestit, joita saatat nähdä {#messages-you-may-see}

Paneeli varoittaa, kun kuva ei ole todellinen erotus:

| Viesti | Merkitys |
|---|---|
| *N + / M −* (tai *N + / M − / K käyttämättä*) | Kuinka monta arvoa on kummallakin puolella (ja kummallekaan). |
| Ikkunassa ei ole riviä **+**-puolella | Piirretään vain **−**-puoli. Siirrä aikajanan ikkunaa tai vaihda jakoa. |
| Ikkunassa ei ole riviä **−**-puolella | Piirretään vain **+**-puoli. |
| Kummallakaan puolella ei ole arvoa | Erotus ei piirrä mitään. Aseta vähintään yksi arvo **+**- tai **−**-puolelle. |
| *sarake* ei voi jakautua näin | Valittu sarake ei sovi tähän jakoon. Valitse sarake uudelleen. |
| Jakosarake ei mahtunut näytönohjaimen muistiin N / M osasta | Näitä rivejä ei piirretä. Nosta näytönohjaimen rajaa kohdasta Suorituskyky → Resurssirajat tai lataa vähemmän rivejä. |

### Ryhmittäin {#by-group}

Paneeli vain osoittaa [Joukkuelistaan](teams-list.md), jossa jokaisella ryhmällä on **+**- ja **−**-painike. Jokaisessa latauksessa ryhmien ensimmäinen puoli (pyöristettynä ylöspäin) asetetaan +-puolelle ja loput −-puolelle. **Jaa tasan** Joukkuelistassa tekee saman uudelleen. Ryhmä, joka ei ole kummallakaan puolella tai joka on piilotettu valintaruudullaan, ei lisää mitään.

### Kategoria-arvoittain {#by-category-values}

| Osa | Merkitys |
|---|---|
| `a + / b − / c käyttämättä` | Kuinka monta arvoa on kummallakin puolella ja kummallekaan. |
| **Tyhjennä** | Asettaa jokaisen arvon kummallekaan puolelle. |
| Arvoluettelo | Jokainen arvo **+**- ja **−**-painikkeella (napsauta aktiivista uudelleen poistaaksesi sen puolelta). Tyhjä arvo on luettelossa nimellä *(puuttuu)*. |
| Rajamerkintä | Vain 200 ensimmäistä arvoa listataan: *Näytetään 200 ensimmäistä N arvosta. Näin leveä sarake kannattaa ensin kaventaa suodattimella, tai jakaa välin mukaan, jos sen arvot ovat järjestyksessä.* |

Sarakkeen valitseminen asettaa sen ensimmäisen arvon +-puolelle ja toisen −-puolelle. Kun kummallakaan puolella ei ole arvoa, jako palautuu ryhmiin sen sijaan, että näyttäisi tyhjän kehyksen. *Lähdetiedosto* toimii samalla tavalla, yksi arvo tiedostoa kohden. Näin verrataan kahta vientiä, kahta testiajoa tai kahta versiota.

### Välin mukaan {#by-range}

| Osa | Merkitys |
|---|---|
| Vihje | Sarakkeen pienin ja suurin arvo. |
| **Positiivinen väli (+)**, **alku** / **loppu** | Rivit, joiden arvo on tällä välillä (molemmat päät mukaan lukien), lisäävät. |
| **Negatiivinen väli (−)**, **alku** / **loppu** | Tällä välillä olevat rivit vähentävät. |
| **Jaa keskikohdasta** | Asettaa + välille [pienin, keskikohta] ja − välille [keskikohta, suurin]. Sama tapahtuu, kun valitset sarakkeen. |

Arvo molemmilla väleillä lasketaan +-puolelle. Välien ei tarvitse kattaa saraketta; arvot kummallakaan välillä jätetään pois. *Kaksi ensimmäistä minuuttia vastaan kaksi viimeistä* on välijako aikamaisella sarakkeella.

## Värit {#colours}

**Lämmön värit** -osio näyttää tässä tilassa kaksi liukumuokkainta: **Positiivinen (lisäävät joukkueet)** ja **Negatiivinen (vähentävät joukkueet)**, kummallakin oma palautuspainike (*Palauta: läpinäkyvä → punainen → keltainen → valkoinen*, *Palauta: läpinäkyvä → vihreä → sininen → violetti*). Yhdistäjä ottaa nettolämmön itseisarvon [kyllästymispisteen ja vasteen](colour-and-exposure.md) läpi ja valitsee negatiivisen liukuman siellä, missä netto on alle nollan. Katso [Väri ja valotus](colour-and-exposure.md#the-ramp-editor).

Käytä *Lineaarista* tiheysvastetta, kun erotuksen koko on tärkeä: se on ainoa vaste, jossa sama väri tarkoittaa samaa määrää.

## Miten se toimii {#how-it-works}

Jokaisen rivin etumerkki on +1, -1 tai 0 kärkishaderissa ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)). Nolla hylkää rivin ennen kuin yksikään fragmentti piirretään.

- Ryhmittäin etumerkki tulee 4 096 merkinnän ryhmätaulukosta, joka indeksoidaan rivin ryhmätunnuksella (ryhmätunnus kulkee rivin sijaintitekselin neljännessä kanavassa).
- Kategoriittain etumerkki tulee toisesta 4 096 merkinnän taulukosta, joka täytetään kullekin kategoria-arvolle, ja rivin arvo luetaan sarakkeen suodatustekstuurista. Taulukon lopun ylittävä arvo hylätään molemmilla taustaohjelmilla.
- Välin mukaan rivin arvoa verrataan kahteen väliin.

Jaon muuttaminen käynnistää kertymisen uudelleen.

**Piilotetut ryhmät pysyvät piilossa jokaisella jaolla.** Sarakkeen mukaan jaettaessa ryhmätaulukko ei enää kanna etumerkkejä. Se pitää arvon 1 näytettävälle ryhmälle ja 0 piilotetulle ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)). Molemmat taulukot tulevat varjostimeen yhdessä: kaksi riviä yhdessä etumerkkitekstuurissa WebGL2:lla, kaksi puolikasta yhdessä tallennuspuskurissa WebGPU:lla. Rivi piirretään vain, jos sen ryhmä on näkyvissä *ja* sen sarakearvo on jollakin puolella. Joten ryhmä, jonka valinnan olet poistanut [Joukkuelistasta](teams-list.md), tai jonka Ottelu-välilehden puolifokus jättää pois, ei lisää mitään, miten erotus sitten jaetaankin.
