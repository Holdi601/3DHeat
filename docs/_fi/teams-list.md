---
title: "Joukkuelista"
parent: "Suodattimet ja työkalut"
nav_order: 2
lang: "fi"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Joukkuelista

Paneeli **Joukkueet** antaa sinun piilottaa joukkueen tai asettaa sen vertailun toiselle puolelle. Käytä sitä, kun haluat katsoa vain Blueta, tai kysyä "minne Blue menee, minne Red ei mene?".

*Ryhmä* on joukkue tai puoli, esimerkiksi Blue ja Red ([Ryhmät](sessions-persons-groups.md#group)). Paneeli näytetään, kun aineistossa on ryhmäsarake. Ryhmien määrä on sen otsikossa. Tilassa Joukkuelämpö sivupalkissa on myös osio nimeltä **Joukkuenäkymä** omilla asetuksillaan. Tämä sivu kattaa **Joukkueet**-luettelon.

## Piilota joukkue {#hide-a-team}

1. Avaa **Joukkueet** sivupalkista.
2. Poista rasti joukkueen valintaruudusta (*Visible*), jonka haluat piilottaa. Kuva päivittyy heti.
3. Paina **Näytä kaikki** tuodaksesi kaikki joukkueet takaisin.

![Joukkueet-luettelo: Blue 5p, Red 5p, ja Näytä kaikki](../assets/img/en/teams-list.webp)

## Jokainen rivi {#each-row}

| Osa | Merkitys |
|---|---|
| Valintaruutu (*Visible*) | Näyttää tai piilottaa ryhmän. |
| Värinäyte | Ryhmän väri: sen [joukkuelämmön](team-heat.md) väri tilassa Joukkuelämpö, sen perusväri muissa tiloissa. |
| Nimi | Ryhmän nimiö (koko nimiö osoitettaessa). |
| **+** / **-** (tila Erotus) | Asettaa ryhmän [erotuksen](difference.md) positiiviselle tai negatiiviselle puolelle. Napsauta aktiivista painiketta uudelleen, jotta ryhmä ei ole kummallakaan puolella. |
| `Np` (muut tilat) | Niiden henkilöiden määrä, joiden ensimmäinen rivi on tässä ryhmässä. |

![Tila Erotus: Blue plus-puolella, Red miinus-puolella](../assets/img/en/teams-list-difference.webp)

## Painikkeet {#buttons}

| Painike | Vaikutus |
|---|---|
| **Näytä kaikki** | Tekee jokaisesta ryhmästä jälleen näkyvän. |
| **Jaa tasan** (tila Erotus) | Ensimmäinen puolikas ryhmistä (pyöristettynä ylöspäin) plus-puolelle, loput miinus-puolelle. Sama jako alkaa jokaisella latauksella. |

## Mitä ryhmän piilottaminen tekee {#what-hiding-a-group-does}

- Tiloissa **Lämpö**, **Joukkuelämpö** ja **Viivat** ryhmän rivit eivät vaikuta mitään.
- Tilassa **Erotus** piilotettu ryhmä ei vaikuta mihinkään puolelle se olisikaan, myös silloin, kun jaetaan toisen sarakkeen mukaan (katso [Erotus](difference.md#for-developers)).
- **hahmopeitenäkymässä** henkilöitä, joiden ensimmäinen rivi on tässä ryhmässä, ei piirretä.
- Tilassa **Joukkuelämpö** muut ryhmät säilyttävät värinsä. Sävyt annetaan ryhmien kokonaismäärästä, ei siitä, mikä on näkyvissä. Siksi kaksi kuvaa pysyvät vertailukelpoisina.

Näkyvyyden muuttaminen käynnistää kertymisen uudelleen. Jokaisessa uudessa aineistossa kaikki ryhmät ovat jälleen näkyvissä.

Paneelin vihje vaihtelee tilan mukaan: tilassa Erotus se selittää + ja -, tilassa Joukkuelämpö se kertoo, että värinäytteet ovat kunkin ryhmän piirtämät värit.
