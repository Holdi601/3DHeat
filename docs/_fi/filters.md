---
title: "Suodattimet"
parent: "Suodattimet ja työkalut"
nav_order: 1
lang: "fi"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Suodattimet

**Suodattimet** piilottavat rivit, joista et välitä, kuten yhden ajoneuvoluokan tai yhden tapahtumatyypin, ja kuva päivittyy heti. Paneeli listaa sarakkeet, jotka on säilytetty latauksessa kohdassa *Säilytä suodatusta varten* ([Sarakemääritys](column-mapping.md)), sekä *Lähdetiedoston*, kun useita tiedostoja on ladattu.

## Kokeile {#try-it}

1. Lataa aineisto ja avaa **Suodattimet** sivupalkista.
2. Kohdassa **Ajoneuvoluokka** poista *Tank* valinta. Kuva muuttuu heti.
3. Paina **Tyhjennä kaikki suodattimet** kumotaksesi.

![Suodattimet-paneeli: ensin katselimen omat sarakkeet (Tapahtumatyyppi, Ajoneuvoluokka), sitten tiedostosi sarakkeet](../assets/img/en/filters.webp)

Ensimmäiset rivit ovat katselimen omia sarakkeita (alla). Niiden jälkeiset rivit tulevat tiedostostasi.

## Katselimen lisäämät sarakkeet {#columns-the-viewer-adds}

Latauksessa katselin päättelee neljä omaa saraketta ja listaa ne **ensimmäisinä**. Nimet ja arvot ovat kielelläsi, joten sama suodatin toimii jokaiselle pelille ja datalähteelle:

| Sarake | Arvot | Päätelty lähteestä |
|---|---|---|
| **Tapahtumatyyppi** | 23 tyyppiä: Sijainti, Laukaus, Lähtö (ohjus, raketti, pommi), Osuma, Ohiampuminen (ase päättyi lähelle kohdetta), Räjähdys, Vaurio, Tappo, Kuolema, Tuhottu, Törmäys, Poistuminen / hyppy, Synty, Poisto, Lentoonlähtö, Lasku, Maakosketus, Pysähdys maassa, Uudelleenlataus / tankkaus, Tavoite / valtaus, Harhautus, Viesti, Muu | sarake `event`, `events`, `event_type` tai `event_name`; kunkin pelin omat sanat (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) yhdistetään näihin tyyppeihin. Koko taulukko: [Tapahtumatyypit ja luokat](ref-event-types.md). |
| **Pelaaja tai tekoäly** | Pelaaja, Tekoäly | sarake `ai`, `is_ai`, `bot` tai `actor`; muuten `is_player` / `human`; muuten tilitunnus (`user_id`, `steam_id`; tyhjä tai 0 on tekoäly); Tacview-tallenteille se, onko kohteella lentäjä |
| **Ajoneuvoluokka** | 17 luokkaa: Hävittäjä, Maahyökkäyskone, Pommikone, Muu lentokone, Helikopteri, Tankki, Panssariajoneuvo, Ilmatorjunta, Tykistö, Kuorma-auto / auto, Laiva, Sukellusvene, Jalkaväki, Ase, Harhautus, Rakennelma, Muu | ajoneuvon tai yksikön nimi (verrataan [hahmoluetteloon](figures.md)) ja tyyppisarakkeet |
| **Kohdeluokka** | samat luokat | vastapuolen ajoneuvo (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Vain esiintyvät tyypit luetellaan. Arvosarakkeet (`cost_*`, `earn_*`, `net_*` ja *Kustannuksen lähde*, katso [Arvopainotus](value-weighting.md)) voi suodattaa kuten mitä tahansa numerosaraketta: esimerkiksi poista *arvio* valinta kohdasta *Kustannuksen lähde*, jotta jää vain hinnoitellut rivit.

Luokkaluettelo, jossa on yli 12 arvoa, saa hakukentän (*Hae n arvoa*) ja painikkeen **Vain nämä**, joka sallii täsmälleen täsmäävät arvot.

Se, mitkä sarakkeet voi suodattaa, päätetään latauksessa, koska ne täytyy lukea silloin. Jos mitään sarakettä ei ole säilytetty, paneeli kertoo siitä ja ohjaa kohtaan *Säilytä suodatusta varten*.

## Numeerisat sarakkeet (väli) {#numeric-columns-range}

![Väli-suodatin (menetetty raha), molemmat päät vedettyinä](../assets/img/en/filters-numeric.webp)

| Osa | Merkitys |
|---|---|
| Nimi ja `min ... max` | Sarake ja nykyinen väli (sarakkeen koko väli, kun suodatinta ei ole asetettu). |
| Ensimmäinen rivi: numerokenttä ja liukusäädin | Alaraja. Kun vedät liukusäätimen ylärajan yli, yläraja siirtyy mukana. |
| Toinen rivi: numerokenttä ja liukusäädin | Yläraja. Kun vedät alarajan alle, myös se siirtyy. |
| **Palauta *sarake*** | Poistaa tämän suodattimen. |

Liukusäätimet kattavat sarakkeen pienimmästä suurimpaan 1 000 askeleessa; numerokentät hyväksyvät minkä tahansa arvon. Rivi läpäisee, kun sen arvo on välillä, molemmat päät mukaan lukien. Suuret arvot näkyvät eksponenttimuodossa (`1.23e6`).

## Luokkasarakkeet {#category-columns}

| Osa | Merkitys |
|---|---|
| Nimi ja `sallittu/yhteensä` | Sarake ja kuinka monta sen arvoa on sallittu. |
| Arvoluettelo | Valintaruutu jokaiselle arvolle; tyhjä arvo näytetään nimellä *(tyhjä)*. |
| **Kaikki** / **Ei mitään** | Sallii kaikki arvot / ei yhtään arvoa. |

Kaikkien arvojen salliminen poistaa suodattimen.

## Säännöt {#rules}

- **Neljä suodatinta kerralla.** Otsikko näyttää `aktiiviset/4`. Viidettä suodatinta ei käytetä, ja paneeli kertoo siitä. Myös valinta [Kohteissa](entities.md) (tai Ottelu-välilehden pelaajafokus) käyttää yhtä neljästä. Suodatin, joka kattaa koko sarakkeen, ei käytä yhtään.
- **Luokkasarakkeessa on enintään 4 096 arvoa**; leveämpää ei säilytetä latauksessa.
- **Suodattimet yhdistetään JA-periaatteella**, ja myös joukkueiden näkyvyys, erotusjako, aikaväli, etäisyysrajaus ja [viipale](slice.md) vaikuttavat.
- **Suodattimen muuttaminen käynnistää kertymisen uudelleen ja mittaa valotuksen uudelleen muutaman kehyksen kuluttua**, koska suodatus voi muuttaa tiheyttä paljon ([Väri ja valotus](colour-and-exposure.md#auto-exposure)).
- **Tyhjennä kaikki suodattimet** poistaa kaikki sarakesuodattimet. Joukkueiden näkyvyys ja muualla asetetut pelaajavalinnat säilyvät.
- Sarakesuodattimet muuttavat lämmön tiloja. Ne eivät muuta [hahmotoiston](box-replay.md) hahmoja, jotka seuraavat joukkueiden näkyvyyttä ja Kohteet-valintaa. Kohteet-valinta muuttaa molempia.
- [Viivalämmössä](line-heat.md) suodatinta testataan sillä rivillä, johon kukin segmentti *päättyy*.
- Jokaisella uudella aineistolla kaikki suodattimet tyhjennetään.

## Kehittäjille {#for-developers}

**Paikat.** Jokainen aktiivinen suodatin vie yhden neljästä GPU-paikasta ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), tekstuurin, jossa on 4 tavua per rivi. Paikat annetaan suodattimille siinä järjestyksessä, jossa niitä viimeksi muutettiin ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), jaettu varjostimen ja molempien paneelien kesken). Neljän yli virhe kertoo *Vain 4 ensimmäistä suodatinta käytetään. Tyhjennä yksi - loput jätetään huomiotta, eikä niitä yhdistetä hiljaa*, ja lisäsuodattimien nimet ovat *sarake (ei käytössä)*. Suodattimet ajetaan rivi riviltä kärkishaderissa, joten kynnysarvon muuttaminen ei vaadi uudelleenjäsennystä eikä uudelleenlähetystä.

**Paneelin näyttämättömät suodattimet.** Sovellustilassa on vielä kaksi lajia ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- **ryhmäsuodatin**, jonka Ottelu-välilehti asettaa, kun se keskittyy yhteen puoleen. Se piilottaa muut ryhmät kaikissa tiloissa, myös sarakkeen mukaan jaetun [erotuksen](difference.md).
- **henkilösuodatin**, jonka asettavat [Kohteet](entities.md)-paneeli ja Ottelu-välilehti, kun se keskittyy yhteen pelaajaan. Se rajoittaa hahmotoiston ja lämmön tiloja. Lämmössä se on luokkasuodatin henkilötunnuksille ja vie yhden neljästä paikasta. Sen maski pitää 65 536 tunnusta ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); sitä suuremman henkilön lämpöä ei piirretä, kun suodatin on aktiivinen, vaikka se olisi valittu. Hahmotoisto näyttää heidät yhä.
