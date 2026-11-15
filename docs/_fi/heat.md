---
title: "Lämpö"
parent: "Lämmön tilat"
nav_order: 1
lang: "fi"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Lämpö

Lämpö maalaa paikat, joissa tapahtui paljon: punainen siellä, missä tapahtui vähän, valkoisen kuuma siellä, missä tapahtui paljon. Se vastaa kysymykseen "missä tämä tapahtuu ja kuinka paljon".

**Lämpö** (näppäin 1) on oletustila. Jokainen näkyvä [rivi](glossary.md) lisää kameraan päin olevan pyöreän [hahmon](glossary.md). Päällekkäiset hahmot kasautuvat liukulukupuskuriin. Summa muunnetaan väriliukuman läpi (oletuksena läpinäkyvä → punainen → keltainen → valkoinen) ja piirretään kohtauksen päälle.

![Lämpö 3D-kentällä: kuumia kohtia rakennusten sisällä ja päällä](../assets/img/en/shooter-heat.webp)

Kuvassa on ampujakierroksen lämpö kentällä, jolla on rakennuksia: kuumia kohtia on huoneissa ja portaissa, ei vain maassa.

## Käyttötapa {#how-to-use-it}

1. Lataa data ja paina `1` (tai valitse **Lämpö** tilapalkista).
2. Jos kaikki on valkoista tai tyhjää, paina **Automaattinen valotus kentästä** osiossa **Lämmön muoto**.
3. Muuta **Spriten säde** -arvoa, kunnes vierekkäiset pisteet sulautuvat nauhoiksi: pienempi näyttää yksittäisiä pisteitä, suurempi alueita.
4. Avaa **Lämmön värit** vaihtaaksesi värejä, tai **Syvyys** antaaksesi kukkuloiden ja seinien piilottaa lämmön takanaan.

![Sivupalkin osiot Lämmön muoto ja Lämmön värit, molemmat auki](../assets/img/en/heat-panel.webp)

Samat paneelit muokkaavat myös [Erotusta](difference.md), [Joukkuelämpöä](team-heat.md) ja [Viivalämpöä](line-heat.md). Ne eroavat siinä, mitä lisätään (etumerkillinen, värjätty tai viivoja pitkin), eivät siinä, miten.

## Paneelit ja niiden oletukset {#the-panels-and-their-defaults}

Jokainen alla oleva säädin vastaa varjostinparametria, joten sen muuttaminen maksaa vain uuden piirron. Liukusäätimien vieressä on kenttä arvon kirjoittamiseen ja vedin (pieni kahva oikealla: vedä ylös tai alas, kauempaa on nopeampaa, Shift hienosäätöön). Jos liukusäätimen rata päättyy ennen todellista rajaa, vedin voi mennä sen yli tässä annettuun *säädön ylärajaan* asti. Arvot merkitty *latauksessa* lasketaan uudelleen jokaiselle uudelle aineistolle.

### Lämmön muoto (auki) {#heat-shape-open}

| Säädin | Oletus | Alue (säädön yläraja) | Lisätiedot |
|---|---|---|---|
| **Spriten säde** | 6 m; latauksessa laajuus / 120 | 0,05-2000 m, logaritminen (50 000) | [Spriten muoto](sprite-shape.md#sprite-radius) |
| **Keskustan voimakkuus** | 1 | 0-10 (1000) | [Spriten muoto](sprite-shape.md#centre-and-edge-intensity) |
| **Reunan voimakkuus** | 0 | -2-10 (1000) | [Spriten muoto](sprite-shape.md#centre-and-edge-intensity) |
| **Liukuman muoto** | *Vaimeneminen* | *Vaimeneminen* / *Käyrä* | [Spriten muoto](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Vaimeneminen** (vain Vaimeneminen) | 1,6 | 0,1-8 (64) | [Spriten muoto](sprite-shape.md#falloff) |
| **Pehmeä liukuma** (vain Vaimeneminen) | päällä | | [Spriten muoto](sprite-shape.md#falloff) |
| Käyrän muokkain (vain Käyrä) | *Pehmeä* esiasetus | | [Spriten muoto](sprite-shape.md#the-curve-editor) |
| **Kyllästymispiste** | 24; latauksessa arvio, sitten mitataan | 0,1-4000, logaritminen (10 000 000) | [Väri ja valotus](colour-and-exposure.md#saturation-point) |
| **Vähimmäislämpö** | pois (0) | 0-100 % | [Väri ja valotus](colour-and-exposure.md#minimum-heat) |
| **Tiheysvaste** | *Kyllästyvä* | *Kyllästyvä* / *Lineaarinen* / *Log* | [Väri ja valotus](colour-and-exposure.md#density-response) |
| **Automaattinen valotus kentästä** | | painike | [Väri ja valotus](colour-and-exposure.md#auto-exposure) |
| **Seuraa näkymää** | päällä | | Mittaa valotuksen uudelleen joka kerta, kun kamera pysähtyy, joten alue, johon lennät, käyttää koko väriliukumaa. Pienet muutokset jätetään huomiotta ja asteikko liukuu. Poista valinta tai vedä **Kyllästymispistettä** lukitaksesi asteikon ja vertaillaksesi paikkoja yhdellä asteikolla. [Väri ja valotus](colour-and-exposure.md#follow-the-view) |
| **Sama tiheys kaikilla zoomaustasoilla** | päällä | | Väri tarkoittaa samaa rivimäärää maa-alaa kohden, olitpa kuinka lähellä tahansa. Sprite, jonka pikselirajat suurentavat (kaukana) tai pienentävät (lähellä), säilyttää lämmön, jonka sen todellinen koko lisäisi, joten kuva, joka on valotettu kaukaa, ei häivy, kun lennät sen sisään. Pois päältä rajatun spriten täysi paino lisätään sen rajatussa koossa. [Spriten muoto](sprite-shape.md#pixel-clamps) |
| **Litistä maatasolle** | pois | | [Spriten muoto](sprite-shape.md#flatten-onto-ground-plane) |

### Lämmön värit (kiinni) {#heat-colours-closed}

| Säädin | Oletus | Lisätiedot |
|---|---|---|
| Ryhmien värinäytteet ja **Värierottelu** (vain Joukkuelämpö) | 1,4 | [Joukkuelämpö](team-heat.md) |
| **Lämpöliukuma**-muokkain (*Positiivinen (lisäävät joukkueet)* Erotuksessa, *Peittävyysliukuma* Joukkuelämmössä) | läpinäkyvä → punainen → keltainen → valkoinen | [Väri ja valotus](colour-and-exposure.md#the-ramp-editor) |
| **Palauta: läpinäkyvä → punainen → keltainen → valkoinen** | | |
| **Negatiivinen (vähentävät joukkueet)** -liukuma (vain Erotus) | läpinäkyvä → vihreä → sininen → violetti | [Erotus](difference.md#colours) |

### Spriten pikselirajat (kiinni) {#sprite-pixel-clamps-closed}

| Säädin | Oletus | Alue (säädön yläraja) | Lisätiedot |
|---|---|---|---|
| **Pienin pikselisäde** | 1 px | 0-16 (512) | [Spriten muoto](sprite-shape.md#pixel-clamps) |
| **Suurin pikselisäde** | 96 px | 2-1024, logaritminen (8192) | [Spriten muoto](sprite-shape.md#pixel-clamps) |

### Syvyys (auki) {#depth-open}

| Säädin | Oletus | Lisätiedot |
|---|---|---|
| **Piilota maaston taakse** | päällä | [Syvyys ja piilotus](depth-and-culling.md#hide-behind-terrain) |
| **Geometrian taakse piilotettu** | 0,8 (*80 % himmeämpi*) | [Syvyys ja piilotus](depth-and-culling.md#hidden-behind-geometry) |

### Etäisyysrajaus (kiinni) {#distance-culling-closed}

| Säädin | Oletus | Alue (säädön yläraja) | Lisätiedot |
|---|---|---|---|
| **Lähiraja** | pois (0) | 0,5-5000 m, logaritminen, radan pohja = pois (200 000) | [Syvyys ja piilotus](depth-and-culling.md#distance-culling) |
| **Kaukoraja** | pois (0) | 1-200 000 m, logaritminen, pohja = pois (10 000 000) | [Syvyys ja piilotus](depth-and-culling.md#distance-culling) |
| **Leikkaa tasolla** | päällä | | [Syvyys ja piilotus](depth-and-culling.md#distance-culling) |
| **Leikkaa myös kenttä** | päällä | | [Syvyys ja piilotus](depth-and-culling.md#distance-culling) |

Näppäimet: `[` ja `]` siirtävät kaukorajaa sisään ja ulos, `\` vaihtaa sen päälle ja pois ([Syvyys ja piilotus](depth-and-culling.md#keyboard)).

### Suunta ja Arvo {#direction-and-value}

Lämmön muodon alapuolella on kaksi osiota lisää. **Suunta** piirtää jokaisen rivin kiilana ja lisää nuolia: katso [Suuntalämpö](directional-heat.md). **Arvo** painottaa lämmön sillä, mitä kukin rivi maksoi tai ansaitsi: katso [Arvopainotus](value-weighting.md).

## Mitä tallennetaan {#what-is-saved}

Yllä olevat lämpöasetukset eivät säily istuntojen välillä: sivun lataaminen uudelleen palauttaa oletukset. Kaksi asiaa säilytetään selaimessa: viimeisin toistonopeus (`heat3d.speed`, katso [Aikajana](timeline.md)) ja [hahmo päällekkäin -näkymän](box-replay.md) hahmoasetukset (merkkityyli, koko, osumamerkit ja niin edelleen). Samoin kieli, [käännetyt maailma-akselit](camera.md#invert-world-axis), kisa-välilehden muistetut autonimet ja [kenttäkirjasto](level-library.md). Koko luettelo on sivulla [Tallennetut asetukset](ref-settings-storage.md).
