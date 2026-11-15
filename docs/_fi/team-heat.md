---
title: "Joukkuelämpö"
parent: "Lämmön tilat"
nav_order: 6
lang: "fi"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Joukkuelämpö

Joukkuelämpö näyttää, missä kukin joukkue oli, ja jokainen joukkue omalla värillään. Missä joukkueet menevät päällekkäin, värit sekoittuvat.

**Joukkuelämpö** (näppäin 3) on [Lämmön](heat.md) tiheyskenttä, jossa jokaiselle [ryhmälle](glossary.md) on annettu oma sävy. Missä ryhmät menevät päällekkäin, niiden sävyt sekoittuvat. Tasainen kamppailu tulee harmaaksi. Peittävyys kantaa edelleen tiheyttä kuten muissa tiloissa, joten kuva vastaa samalla kertaa kysymyksiin *kuinka paljon* ja *kenen*. Tila tarvitsee ryhmäsarakkeen.

![Joukkuelämpö: kumpikin puoli omalla värillään; missä ne menevät päällekkäin, värit sekoittuvat](../assets/img/fi/heat-teams.webp)

Se ei ole [hahmopeite](box-replay.md): se piirtää yhden hahmon per henkilö. Tämä on lämpökenttä, joka on väritetty saman sarakkeen mukaan.

## Käyttö {#how-to-use-it}

1. Paina `3` (tai valitse **Joukkuelämpö** tilapalkista).
2. Avaa **Lämmön värit**. Värinäytteet näyttävät kunkin ryhmän värin. Vie hiiri näytteen päälle nähdäksesi joukkueen nimen.
3. Jos kaikki näyttää harmaalta, nosta **Värierottelu**.
4. Poista ryhmän valinta [Joukkuelistasta](teams-list.md) poistaaksesi sen. Muiden ryhmien värit pysyvät paikoillaan.

## Säätimet {#controls}

Osiossa **Lämmön värit**:

| Säädin | Oletus | Merkitys |
|---|---|---|
| Värinäytteet | | Kunkin ryhmän väri, ensimmäiset 12 ryhmää, sitten *+N more*. Vie hiiri näytteen päälle nähdäksesi ryhmän nimen ja värin. |
| **Värierottelu** | 1,4 | Kuinka kauas sekoitus työnnetään pois harmaasta, 0-4. 0 tekee kaikesta harmaata; 1 on todellinen keskiarvo. Yli noin 2:n kirkkaimmat sekoitukset poistuvat näytettävältä alueelta ja rajataan kanavittain, mikä siirtää niiden sävyä. |
| **Peittävyysliukuma (väri tulee ryhmästä)** | oletuksen lämpöliukuma | Tässä käytetään vain liukuman **alfaa**: läpinäkyvä kohdissa, joissa ei ole mitään, ja läpinäkymätön yläosassa. Sen värit jätetään huomiotta. |

Ryhmä, jonka nimi tarkoittaa "ei ryhmää" (`0`, tyhjä, `none`, `unknown`, `null` tai `-1`), piirtyy harmaana.

Kaikki muut lämpösäätimet (muoto, kylläisyys, vaste, pienin lämpö, syvyys, rajaus) toimivat kuten sivulla [Lämpö](heat.md).

[Joukkuelista](teams-list.md) näyttää kunkin ryhmän joukkuelämmön värin värinäytteenä tässä tilassa. Ryhmän piilottaminen jättää muiden ryhmien värit paikoilleen: sävyt tulevat ryhmien kokonaismäärästä, eivät siitä, mikä on päällä. Siksi kaksi kuvaa pysyvät vertailukelpoisina.

## Kehittäjille {#for-developers}

### Paletti {#the-palette}

Tiedosto [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Värit ovat **Oklab**-väritasolla kiinteällä kirkkaudella (0,7) ja kromalla (0,115). Jokainen ryhmä on siis yhtä kirkas, eikä punainen ryhmä näytä kuumemmalta kuin sininen.
- Kun ryhmiä on *n*, sävyympyrä jaetaan *n* yhtäsuureen osaan, ja ryhmä *i* saa osansa **keskuksen**, `(i + 0,5) / n` kierrosta. Mitkä tahansa kaksi ryhmää ovat niin kaukana toisistaan kuin määrä sallii, ja vastakkaiset pysyvät vastakkaisina ryhmien määrästä riippumatta.
- Käytetään enintään **16** erillistä sävyä. Kun ryhmiä on enemmän, tunnisteet sijoitetaan toistuvalla puolittamisella (bittikäännetyt tunnisteet: 0, ½, ¼, ¾, ⅛ ...), jotta vierekkäiset tunnisteet eivät jaa sävyä. Yli 16 ryhmää jakavat väistämättä sävyjä.
- Ryhmä, jonka nimi tarkoittaa "ei ryhmää" (`0`, tyhjä, `none`, `unknown`, `null` tai `-1`, kirjainkoosta riippumatta), piirtyy **neutraalina harmaana** eikä saa palaa ympyrästä. Vain ryhmälistan ensimmäinen tällainen nimi käsitellään näin.

Oletus 1,4 eikä 1 on siksi, että tasaisesti jakautuneiden viiden sävyn sekoitus *on* 1:llä harmaa: oikein, mutta lukukelvoton. Hieman yli 1 pitää tasapelit rehellisinä ja tekee 60/40-jaon näkyväksi.

### Miten se toimii {#how-it-works}

Lämpökohteessa on tässä tilassa neljä kanavaa. Jokainen sprite lisää tiheytensä *v* ensimmäiseen kanavaan ja *v* × ryhmän Oklab-koordinaatit *a* ja *b* toiseen ja kolmanteen. Koostettaessa pikselin sekoitus on tiheyspainotettu keskiarvo: *a* = G / R, *b* = B / R, skaalattuna värierottelulla ja muunnettuna sRGB:hen paletin kirkkaudella. Jako kertyneellä tiheydellä pitää sävyn riippumattomana siitä, kuinka paljon dataa on. Siksi jokainen tiheyssäädin vaikuttaa vain peittävyyteen.

Neljän kanavan kohde maksaa saman resoluution yksikanavaisen lämpökohteen nelinkertaisen GPU-muistin.
