---
title: "Lämmön tilat"
nav_order: 4
has_children: true
lang: "fi"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Lämmön tilat

Jokainen piste lisää pienen hehkun, hehkut kasautuvat, ja kasa maalataan väreillä. Tiloja on viisi tapaa maalata se, ja kukin vastaa yhteen kysymykseen.

Lämpökartta-välilehden sivupalkin yläosan tilapalkki valitsee, miten [aineisto](glossary.md) piirretään. Näppäimet 1-4 valitsevat Lämpö, Erotus, Joukkuelämpö ja Viivat. Hahmot päällekkäin -tilalla ei ole näppäintä.

![Tilapalkki: Lämpö, Erotus, Joukkuelämpö, Hahmot päällekkäin ja Viivat](../assets/img/en/heat-modes-bar.webp)

| Tila | Kysymys, johon se vastaa |
|---|---|
| **Lämpö** | Missä se tapahtui ja kuinka paljon? |
| **Erotus** | Kumpi puoli teki sitä enemmän? |
| **Joukkuelämpö** | Kenen se oli? |
| **Viivat** | Mihin suuntaan ihmiset menivät? |
| **Hahmot päällekkäin** | Kuka oli missäkin ja milloin? |

![Sama data neljässä tilassa: Lämpö, Erotus, Joukkuelämpö ja Viivat](../assets/img/en/heat-modes-grid.webp)

| Tila (tilapalkin nimi) | Näppäin | Mitä se piirtää | Tarvitsee |
|---|---|---|---|
| **Lämpö** | 1 | Lisäävä tiheys: jokainen näkyvä rivi lisää kameraan päin olevan säteittäisen hahmon. [Lämpö](heat.md) | aineiston |
| **Erotus** | 2 | Etumerkillinen tiheys: yksi joukko lisää, toinen vähentää. [Erotus](difference.md) | kaksi puolta: vähintään kaksi ryhmää tai jako säilytetyn sarakkeen mukaan |
| **Joukkuelämpö** | 3 | Ryhmän mukaan värjätty tiheys: sävy kullekin ryhmälle, sekoitettuna siellä, missä ryhmät menevät päällekkäin. [Joukkuelämpö](team-heat.md) | ryhmäsarakkeen |
| **Hahmot päällekkäin** | - | Hahmo (tai laatikko) per henkilö, liikkuu aikajanalla: toisto. [Hahmot päällekkäin](box-replay.md), [Ottelun toisto](match-replay.md) | henkilösarakkeen |
| **Viivat** | 4 | Viivalämpö: viiva jokaisesta henkilön näytteestä seuraavaan, lämpö häviää sivusuunnassa. [Viivalämpö](line-heat.md) | henkilö- ja aikasarakkeen |

Tila, jota data ei tue, on harmaana, ja sen vihjeruudussa kerrotaan syy, esimerkiksi *Ei käytettävissä - Erotus-tila tarvitsee kaksi ryhmää tai säilytetyn sarakkeen jaettavaksi; tässä datassa on yksi ryhmä.* Kun uusi aineisto ei tue nykyistä tilaa, näkymä siirtyy tilaan **Lämpö**.

Näppäimet 1-4 tarkistetaan datan mukaan samalla tavalla: harmaana olevan tilan näppäin ei tee mitään.

## Mitä paneeleita kukin tila näyttää {#which-panels-each-mode-shows}

| Paneeli | Lämpö | Erotus | Joukkuelämpö | Hahmot päällekkäin | Viivat |
|---|---|---|---|---|---|
| Reitit ([viivalämpö](line-heat.md)) | | | | | kyllä |
| Lämmön muoto (**Seuraa näkymää** ja **Sama tiheys kaikilla zoomaustasoilla**), Lämmön värit, Spriten pikselirajat, Syvyys, Etäisyyspiilotus | kyllä | kyllä | kyllä | | kyllä |
| Suunta ([suuntalämpö](directional-heat.md)), Arvo ([arvopainotus](value-weighting.md)) | kyllä | kyllä | kyllä | | kyllä |
| Joukkuenäkymä ([hahmot päällekkäin](box-replay.md)) | | | | kyllä | |
| Erotuksen jako ([erotus](difference.md)) | | kyllä | | | |
| [Joukkueet](teams-list.md), [Kohteet](entities.md), [Suodattimet](filters.md), Tausta / kenttä, [Viipale](slice.md), [Mittaus](measure.md), Kamerapolku ja piirto, Suorituskyky, Kamera ja näkymä | kyllä | kyllä | kyllä | kyllä | kyllä |

## Mitä kaikki lämmön tilat yhteisesti käyttävät {#what-every-heat-mode-shares}

Kaikki neljä lämmön tilaa (kaikki paitsi hahmot päällekkäin) ovat sama kone eri syötteillä ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Mitkä rivit.** [Aikajana](timeline.md) valitsee jatkuvan välin aikajärjestetyistä riveistä. [Suodattimet](filters.md), ryhmien näkyvyys, erotuksen jako, [etäisyysrajaus](depth-and-culling.md#distance-culling) ja [viipale](slice.md) päättävät rivi riviltä kärkishaderissa, osallistuuko kukin rivi ja kuinka voimakkaasti.
2. **Roiskutus.** Jokainen osallistuva rivi piirretään hahmona (tai Viivat-tilassa segmenttinä) liukulukuiseen **lämpökohteeseen**, lisäten oman liukuarvonsa. Kun rivejä on enemmän kuin kehys ehtii käsitellä, piirretään rivien tasattu otos, painotettuna sen korjaamiseksi. Katso [Otanta ja rajat](sampling-and-budgets.md).
3. **Kertyminen.** Kun mikään ei muutu, kehyksiä yhdistetään, kunnes jokainen rivi on osallistunut täsmälleen kerran. Katso [Kertyminen](accumulation.md).
4. **Yhdistäminen.** Kunkin pikselin kertynyt arvo jaetaan **kyllästyspisteellä**, muokataan **tiheysvasteella**, nostetaan **vähimmäislämmöllä** ja haetaan **väriliukumasta**, jonka alfa sekoittaa sen kuvaan. Katso [Väri ja valotus](colour-and-exposure.md).

Kaikki vaiheessa 4 sovelletaan yhdistämisen aikana, joten näiden säätimien vetäminen ei käynnistä kertymistä uudelleen. Vaiheiden 1-2 muutokset käynnistävät sen.

## Tämän osion sivut {#pages-in-this-section}

- [Lämpö](heat.md) - tavallinen lämpötila ja sen paneelien yleiskatsaus
  - [Spriten muoto](sprite-shape.md) - säde, voimakkuudet, vaimeneminen, käyrän muokkain, pikselirajat, litistäminen
  - [Väri ja valotus](colour-and-exposure.md) - väriliukuman muokkain, kyllästyspiste, automaattinen valotus, vähimmäislämpö, tiheysvaste
  - [Syvyys ja piilotus](depth-and-culling.md) - kenttä peittää, piilotus maaston taakse, etäisyysrajaus
- [Erotus](difference.md) - erotuksen jako
- [Joukkuelämpö](team-heat.md)
- [Viivalämpö](line-heat.md) - reitit
- [Hahmot päällekkäin](box-replay.md) - toistotila (tiedoston nimi on edelleen box replay)
- [Suuntalämpö](directional-heat.md)
- [Arvopainotus](value-weighting.md)
