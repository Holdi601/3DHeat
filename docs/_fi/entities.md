---
title: "Kohteet"
parent: "Suodattimet ja työkalut"
nav_order: 3
lang: "fi"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entiteetit

**Entiteetit** antaa sinun valita yhden pelaajan (tai muutaman) ja nähdä vain, minne se pelaaja meni. Sitä käytetään oman liikkeen tai yhden vastustajan seuraamiseen.

Paneeli näytetään, kun aineistossa on henkilösarake. Sen otsikko näyttää henkilöiden määrän, tai `selected of total` kun valinta on käytössä. *Henkilö* on yksi pelaaja tai tekoäly (katso [sanasto](glossary.md)).

## Valitse pelaaja {#pick-a-player}

1. Avaa **Entiteetit** sivupalkista.
2. Kirjoita osa nimestä hakukenttään.
3. Rastita pelaaja. Otsikossa lukee esimerkiksi `2 of 10`, ja kaikki muu katoaa.
4. **Tyhjennä** näyttää kaikki taas.

![Entiteetit, kaksi kymmenestä pelaajasta valittu](../assets/img/en/entities-selected.webp)

Valinta näyttää vain valitut henkilöt lämpötiloissa (pisteet, viivat, erotus, joukkuelämpö) sekä [hahmotoiston](box-replay.md) radoissa, hahmoissa ja jäljissä. Jätä tyhjäksi, jos haluat näyttää kaikki. Kaikkien valitseminen on sama kuin ei kenenkään valitseminen.

## Paneeli {#the-panel}

| Osa | Merkitys |
|---|---|
| Hakukenttä | *Search N entities...* suodattaa luettelon nimen osajonolla, kirjainkoosta riippumatta. Näyttää `N matches` tai `N matches, showing the first 200`. *Nothing matches "..."*, kun haku ei löydä mitään. |
| Luettelo | Enintään 200 henkilöä (ensimmäiset 200 osumaa), kullakin valintaruutu, henkilön värinäyte ja nimi (*(unnamed)*, jos nimi on tyhjä). |
| Pelissä-vihje | Kun aika kulkee, luettelo sisältää ne, jotka ovat *toistokohdassa pelissä*. Haku löytää kaikki. |
| **AI (n)** | Kokoontaitettava ryhmä tekoälyn ohjaamille yksiköille, erillään pelaajista. |
| **Lisää näytetyt** | Lisää valintaan kaikki juuri nyt luetellut. |
| **Vain näytetyt** | Tekee valinnasta täsmälleen listatut. |
| **Tyhjennä** | Tyhjentää valinnan. |

## Rajat {#limits}

Lämmössä valinta on suodatin, ja se käyttää yhtä neljästä [suodatinpaikasta](filters.md#rules). Kun muut suodattimet käyttävät jo kaikki neljä, paneeli sanoo *Not applied to the heat: all filter slots are taken. The figure replay still shows only these entities. Clear a filter under Filters to free one.* Tyhjennä suodatin vapauttaaksesi paikan.

Valinta tyhjenee jokaisessa uudessa aineistossa. Välilehti Ottelu asettaa saman valinnan, kun se kohdistaa yhteen pelaajaan.

## Kehittäjille {#for-developers}

Valinta tallennetaan suodattimena *persons* ([Suodattimet](filters.md#for-developers)). Varjostimen maski pitää 65 536 henkilötunnusta. Tämän ylittävää henkilöä ei piirretä lämpöön, kun valinta on käytössä.
