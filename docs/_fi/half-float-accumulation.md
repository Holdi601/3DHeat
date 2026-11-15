---
title: "Puolitarkkuuskertyminen"
parent: "Piirron sisäiset"
nav_order: 4
lang: "fi"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Puolitarkkuuskertyminen

Osa näytönohjaimista voi pitää lämpöä vain pienissä 16-bittisissä luvuissa. Ne voisivat katkaista tai pyöristää kuumimmat kohdat. Katselija skaalaa luvut, jotta tämä ei näy. Sinun ei tarvitse tehdä mitään. Tämä sivu on kehittäjille.

## Kehittäjille {#for-developers}

Laite, joka ei voi sekoittaa 32-bittisiin float-tekstuureihin (ei `float32-blendable` ja `float32-filterable` WebGPU:ssa, ei `EXT_float_blend` WebGL2:ssa), saa **16-bittisen float**-lämpökohteen (`r16float`). Sen enimmäisarvo on 65 504 ja mantissassa on 11 bittiä. Tiheä kenttä ylittää useita satoja tuhansia, joten 16-bittinen kohde sekä **katkaisee** että **pyöristää**. Pyöristysvirhe kasvaa arvon mukana. Se näkyy hyvin tarkasti: tiheimmät alueet näyttävät paljon viileämmiltä kuin ovat, ja harvat alueet näyttävät oikeilta. Kaksi mekanismia hoitaa tämän. Kuva on oikein vain, kun molemmat toimivat.

### Alue: vahvistus jokaisessa roiskeessa {#range-a-gain-on-every-splat}

Jokainen roiske kerrotaan **vahvistuksella**, ja koostettaessa se jaetaan takaisin. Kenttä on siis luvuissa, joita puolitarkkuus hoitaa hyvin ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = tämän aineiston, säteen ja keskiintensiteetin analyyttinen kyllästysarvio
gain     = 2 ^ round(log2(2048 / estimate)), eksponentti rajattu välille -20..20
```

2048 jättää noin 32-kertaisen varan rampin yläpuolelle ennen 65 504:ää. Vahvistus on **kahden potenssi**. Pieni muutos arviossa ei muuta sitä eikä kertyvää puskuria. Se on osa [geometriaallekirjoitusta](accumulation.md#what-restarts-it), joten muutos käynnistää kertymisen uudelleen.

Se on kiinnitetty analyyttiseen arvioon eikä tarkoituksella **kyllästyspisteeseen**. Kyllästys sovelletaan koostettaessa juuri siksi, että sen siirtäminen ei koskaan käynnistä lähentymistä uudelleen. Jos vahvistus liikkuisi sen mukana, puskuri sisältäisi yhä vanhalla vahvistuksella kirjoitettuja arvoja, kun koostaja jakaa uudella. Kaksi virhettä kumoaisivat toisensa tarkasti, ja liukusäädin näyttäisi, ettei se tee mitään.

32-bittisellä kohteella vahvistus on aina 1.

### Tarkkuus: osittaiset kehykset nollasta {#precision-partial-frames-from-zero}

Kehys, joka yhdistetään kertymäpuskuriin painolla 1/n, roiskutetaan ensin **välikohteeseen** nollasta ja sekoitetaan sitten sisään. Sitä ei roiskuteta suoraan kertymäpuskuriin painolla 1/n ([Kertyminen](accumulation.md#why-each)). Suoraan jokaisen spriten osuus olisi 1/n siitä kokonaissummasta, johon se lisätään. Puolitarkkuus pyöristäisi sen pois, sitä enemmän mitä tiheämpi pikseli on. Nollasta alkaen jokainen lisättävä on verrattavissa kokonaissummaan, johon se liittyy. Se on sama laskutoimitus, jonka yksi kehys jo tekee.

### Mitattu vaikutus {#measured-effect}

Tiheällä synteettisellä kohtauksella kenttä luetaan yhteismitallisissa yksiköissä:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bittinen (vertailu) | 6051 | 60742 | 121199 | 232744 |
| 16-bittinen ennen | 1372 | 6972 | 7840 | 7840 |
| 16-bittinen jälkeen | 5996 | 59666 | 118824 | 210357 |

Huippuarvo meni 30 kertaa liian matalasta 0,90 kertaan. Koostettu kuva vastaa 32-bittistä kuvaa 0,1 %:n tarkkuudella keskimääräisestä kirkkaudesta.

### Testaus {#testing-it}

`?heat=f16` pakottaa tämän polun kummalle tahansa taustaohjelmalle. Ilman kytkintä vain heikommat näytönohjaimet ajavat tätä laskutointa, ja sitä testaisivat vain ihmiset, jotka niitä ajavat. `npm run smoke:f16` ajaa koko selainsarjan sen kanssa.

Luvut kumoavat vahvistuksen. Automaattinen valotus jakaa luetun kentän sillä, ja `engine.readHeatProbe()` antaa sen piirtäjälle. Näin myös [viivaimen elävä lämpölukema](measure.md#notes) luetaan.
