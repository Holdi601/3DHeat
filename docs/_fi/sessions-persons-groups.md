---
title: "Istunnot, henkilöt ja ryhmät"
parent: "Datan lataaminen"
nav_order: 4
lang: "fi"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Istunnot, henkilöt ja ryhmät

**Henkilö** on yksi liikkuva asia (pelaaja, auto). **Joukkue/ryhmä** on puoli, johon se kuuluu. **Istunto** on yksi ottelu tai kierros. Katso [sanasto](glossary.md).

Yksi tiedoston rivi voi kertoa kaikki kolme:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` on henkilö, `team` on ryhmä ja `match` on istunto.

Kolme valinnaista saraketta kuvaavat, *kenelle* ja *missä tarinan kohdassa* rivi kuuluu. Jokainen niistä koodataan sanakirjaksi latauksessa. Tekstiarvot muuttuvat riveittäin pieniksi kokonaisluku-tunnuksiksi, ja yksi nimiluettelo on yhteinen kaikille latauksen tiedostoille.

## Henkilö {#person}

Sarake **Henkilön tunniste** nimeää liikkuvan asian, johon rivi kuuluu: pelaajan, botin tai auton. Se tallennetaan 32-bittisenä tunnuksena riviä kohti.

Kun henkilö- ja aikasarake ovat olemassa, lataus laskee jokaiselle riville **elinajan**. Se on aika, joka kuluu saman henkilön seuraavaan näytteeseen *samassa istunnossa*. Jos seuraavaa näytettä ei ole, arvo on "none" (vartija, -1). Silloin henkilö kuoli, poistui tai loki päättyi. Elinajat ohjaavat [aikajanan](timeline.md) **Elinaika**-historiaa, [laatikkotoiston](box-replay.md) interpolointia ja vanhentumista sekä [viivalämmön](line-heat.md) reittikatkoja. Se, mitä rivi ilman seuraajaa tekee, on katseluasetus (*Varaelinaika*), ei osa dataa.

Jokainen henkilö saa ryhmän, joka on hänen **ensimmäisen** rivinsä ryhmä. Tämä ryhmä värittää hänen laatikkonsa laatikkotoistossa, ja se päättää, minkä ryhmän näkyvyyskytkin piilottaa hänet siellä. Lämpötilat käyttävät kunkin rivin omaa ryhmää.

### Nimet, joita useat asiat kantavat yhtä aikaa {#names-worn-by-several-things-at-once}

Nimi ei aina tarkoita yhtä kohdetta. Joissakin vienneissä jokainen botti jokaisesta ottelusta kirjataan yhdellä nimellä. Jos tällaisen "henkilön" kaksi näytettä yhdistetään (interpoloinnilla, jäljellä tai reitillä), piirtyy viiva kahden eri olennon välille kartalla.

Latauksessa ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) nimi merkitään **jaetuksi**, kun kaksi sen tietuetta

- ovat samassa istunnossa,
- ovat samassa ajassa,
- ovat samaa lajia (jokaisella säilytetyllä kategoriasarakkeella on sama arvo), ja
- ovat kauempana toisistaan kuin 1 % datan laajuuden lävistäjästä.

Jaetut nimet piirretään yksittäisinä näytteinä. Niissä ei ole interpolointia, jälkeä eikä viivalämmön reittiä. Muu niihin liittyvä (esimerkiksi niiden lämpö) ei muutu. Aineisto-paneeli luettelee, kuinka monta nimeä merkittiin, ja esittää enintään kolme esimerkkiä. Laatikkotoiston paneeli toistaa lukumäärän.

## Istunto {#session}

Sarake **Istunto / ottelu** kertoo, mihin otteluun, raidiin, kierrokseen, ajoon tai kisaan rivi kuuluu. Se tekee henkilön näytteistä yhtenäisen radan. Oikea telemetria lomittaa usein samanaikaisia otteluita. Pelaajan näyte juuri ennen soittopäätä ja sen jälkeinen näyte voivat olla eri otteluista, satojen metrien päässä toisistaan. Kun istuntosarake on olemassa:

- interpolointi, jäljet ja viivalämmön reitit eivät koskaan ylitä istunnon vaihtumista;
- rivin elinaika päättyy oman istuntonsa loppuun;
- **Istunto**-valitsin näkyy sivupalkin yläosassa tilapalkin alla.

Istuntosarake on hyvin usein *aikaleima*, eli ottelun alkuhetki, toistettuna jokaisella ottelun rivillä. Siksi automaattinen kartoitus etsii istuntonimiä ennen henkilöä ja ryhmää ([Sarakemääritys](column-mapping.md#session-person-group)). Kilpa-ajon kierros tai pysähdys on myös istunto. Kahta saman auton kierrosta ei saa yhdistää yhdeksi radaksi.

### Istunto-valitsin {#the-session-picker}

![Istunto-valitsin auki tiedostossa, jossa on kymmenen ottelua: Kaikki istunnot (10), Match 01, Match 02 ja niin edelleen](../assets/img/en/sessions-persons-groups-picker.webp)

*Kymmenen ottelua yhdessä tiedostossa: valitse yksi tai näe kaikki.*

Näkyy, kun aineistossa on listattuja istuntoja (katso alla oleva raja).

| Osa | Merkitys |
|---|---|
| Oikealla oleva nimiö | Valitun istunnon rivimäärä, tai *kaikki kerralla*. |
| Valikko | *Kaikki istunnot (N)* ja sitten jokainen istunto vilkkaimmasta alkaen muodossa `nimi - N riviä, jakso` (jakso sekunneissa alle 90 s, minuuteissa alle 90 min, tunneissa tätä suuremmilla). |
| Keltainen vihje | Näkyy *Kaikki istunnot* -valinnalla. Sijainteja ei yhdistetä edelleenkään istuntojen välillä. Samanaikaiset ottelut tuovat kuitenkin kartalle yhteen toisiinsa liittymättömiä pelaajia. |
| Vihje | Näkyy lämpötiloissa, kun yksi istunto on valittu. Valinta siirtää vain soittopäätä. |

Latauksessa valitaan vilkkain istunto. Istunnon valinta siirtää soittopään istunnon alkuun.

Valinta muuttaa seuraavaa:

- **[laatikkotoistossa](box-replay.md)** se päättää, minkä istunnon toisto näytetään. Piirretään vain sen istunnon laatikot ja jäljet, ja aikajanan alue on istunnon oma jakso.
- **lämpötiloissa** se ei rajaa lämpöä. Valitsimen alla oleva vihje kertoo tämän: *Lämpötiloissa tämä vain siirtää soittopään istunnon alkuun. Lämpö laskee yhä mukaan kaikki istunnot. Laatikkotoisto toistaa valitun istunnon yksin.* Jos haluat rajata lämmön yhteen istuntoon, säilytä istuntosarake myös suodatussarakkeena (*Säilytä suodatusta varten*) ja suodata sen mukaan. Sarake voi olla sekä istuntosarake että suodatussarake. Lataaja lukee jokaisen valitun suodatussarakkeen erikseen, riippumatta siitä, mikä muu rooli sillä on.

### Liian monta istuntoa {#too-many-sessions}

Enintään **100 000** istuntoa listataan. Sen yli sarake on oikeastaan tunniste. Esimerkiksi kansiossa on miljoonia istuntoja, joissa kussakin on muutama rivi. Silloin tämän määrän nimien lähettäminen työntekijästä sivulle ajaisi välilehden muistista loppuun. Lataus säilyttää silloin istuntojen **tunnisteet**, joten rajat pätevät yhä kaikkialla. Nimiöt ja valitsin jätetään kuitenkin pois, ja Aineisto-paneeli kertoo tästä.

## Ryhmä {#group}

Sarake **Joukkue / ryhmä** on mikä tahansa sarake, jossa on vähän eri arvoja. Se voi olla joukkue, puoli, ryhmä, fraktio, pelaaja–tekoäly-lippu tai auton luokka. Se tallennetaan 16-bittisenä tunnuksena riviä kohti. Se ohjaa:

- [Joukkuelistaa](teams-list.md) (näkyvyys ryhmittäin, + / − puolille),
- [joukkuelämpöä](team-heat.md) (sävy ryhmää kohti),
- [erotuksen](difference.md) jakoa ryhmittäin,
- laatikoiden värejä [laatikkotoistossa](box-replay.md) (sävyperhe ryhmää kohti, sävy jäsentä kohti).

### Rajat {#limits}

Enintään **4 096** eri ryhmää. Ryhmän tunnus kulkee GPU:lla kunkin rivin sijaintitexelin neljännessä kanavassa. Jokainen ryhmä tarvitsee texelin 4 096 leveässä merkkitaulukossa, jota varjostin lukee päättääkseen *piilotettu*, *lisätty* tai *vähennetty*. Sarake, jolla on enemmän eri arvoja, on tunniste eikä ryhmä. **Lataus säilyttää jokaisen rivin ja pudottaa vain ryhmittelyn.** Aineistossa on varoitus, joka ehdottaa, että sarake kartoitetaan henkilösarakkeena tai säilytetään suodatussarakkeena.

Sama 4 096 raja koskee säilytettyä *kategoria*-suodatussaraketta. Leveämpää saraketta ei säilytetä, ja aineisto kertoo tämän. Numeerisella sarakkeella (esimerkiksi aikaleimalla) ei ole tätä rajaa *väli*-suodattimena.

Ryhmäarvot `0`, tyhjä arvo, `none`, `unknown`, `null` ja `-1` (kirjainkoosta riippumatta) tarkoittavat [joukkuelämmölle](team-heat.md) "ei ryhmää". Se piirtää ne neutraalina harmaana eikä varmana värinä.

## Kohteen koko {#entity-size}

Yhden seuratun asian koko, kuten pelaajan törmäyslaatikko tai auto, ratkaisee, kuinka suuria [laatikkotoiston](box-replay.md) laatikot ja katsesäteet piirretään. Paneelissa ei ole siihen kenttää. Arvo tulee tiedoston [`heat3d`-vihjeistä](data-formats.md#the-heat3d-hints) (`entity.size`, tiedoston omissa yksiköissä. CS2-muunnin kirjoittaa arvon 32). Lataus kertoo sen yksikköskaalalla.

Jokaisessa latauksessa ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)) asetetaan seuraavat arvot. *Laajuus* on datan X- ja Z-jakson suurempi:

| Asetus | Kohteen koolla | Ilman |
|---|---|---|
| Kuution koko | kohteen koko | laajuus / 500 |
| Katsesäteen pituus | kohteen koko × 4 | laajuus / 200 |
| Pisteen säde | laajuus / 120 | laajuus / 120 |
| Kyllästyspiste | analyyttinen arvio (sitten mitattu) | sama |
| Lentonopeus | laajuus / 12 | sama |
| Kaukotaso | laajuus × 12 | sama |
| Lähitaso | max(0,05; laajuus / 20 000) | sama |

## Aineisto-paneeli {#the-dataset-panel}

Lähde-paneelin alapuolella. Kun aineisto on ladattu, se näyttää:

- aineiston **nimen**: valinnan, rivimäärän, tiedostomäärän ja askeleen, jos sitä käytettiin;
- rivin **`N joukkuetta · N henkilöä · N s jakso`**;
- jokaisen latauksen tuottaman **varoituksen** keltaisena niin kauan kuin aineisto on ladattuna. Varoitukset kertovat ryhmistä tai suodatussarakkeista, jotka pudotettiin liian monien arvojen takia, luettelemattomista istunnoista, jaetuista nimistä, puuttuvista riveistä ja ohitetuista tiedostoista;
- [synteettisen generaattorin](synthetic-generator.md);
- **Vapauta**-painikkeen, joka poistaa aineiston.

Rivimäärä näkyy paneelin otsikossa.
