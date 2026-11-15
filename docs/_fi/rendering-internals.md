---
title: "Piirron sisäiset"
nav_order: 22
has_children: true
lang: "fi"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Piirron sisäiset

Katselija piirtää miljoonia pisteitä hehkuvina pallomaisina läiskinä ja laskee ne yhteen. Tämä osio selittää temput, joilla se pysyy nopeana, ja mitä tilastopaneelin luvut tarkoittavat. Lue se, jos katselija tuntuu hitaalta tai jos haluat työstää piirtäjää.

```
data -> aikaikkuna -> GPU-suodattimet -> näytteenottosuunnitelma -> splat -> kertymä -> väritys -> näyttö
```

Katso oman tietokoneesi tilannetta näkymän oikeassa yläkulmassa olevasta tilastoruudusta: [Suorituskykypaneeli ja tilastot](performance-and-stats.md). Uudet sanat (GPU, rivi, sprite, lämpökartta) ovat [sanastossa](glossary.md).

## Ydinongelma {#the-core-problem}

Päällekkäisten säteittäisten rampien summa maksaa *N* × π*r*² sekoitettua fragmenttia kehystä kohden. Sadalla miljoonalla spritellä, joiden säde on 8 px, se on 2 × 10¹⁰ fragmenttia, noin sekunnin työ huippuluokan GPU:lla. Sitä ei voi laskea voimalla joka kehys, joten katselija yhdistää seuraavat:

- **aikajärjestetyt rivit**: aikajanaikkuna on kaksi binäärihakua, ja toiston kustannus seuraa ikkunan rivejä, ei koko aineistoa;
- **ei rivikohtaista työtä CPU:lla kehystä kohden**: rivit ovat GPU-muistissa kvantisoituina. Suodattimet, ryhmien merkit, elinajan tarkistus, ikkuna, rajaus ja viipale lasketaan kaikki vertex-varjostimessa;
- **kerrostettu näytteenotto** painotuksin, jotka korjaavat tilannetta, kun kehys ei voi piirtää jokaista riviä, ja **progressiivinen kertyminen**, joka lähenee tarkkaa kaikkien rivien vastausta, kun näkymä pysyy paikallaan ([Näytteenotto ja budjetit](sampling-and-budgets.md), [Kertyminen](accumulation.md));
- **kaksivaiheinen kuristin**, joka vaihtaa sprite-määrää kehystä kohden ja sitten lämpöresoluutiota kehysnopeuden vuoksi ([Näytteenotto ja budjetit](sampling-and-budgets.md#the-adaptive-budget));
- **pakotetut muistibudjetit**, joten aineisto, joka ei mahdu, katkaistaan näkyvästi sen sijaan, että sovellus kaatuisi ([GPU-muistin pysyvyys](gpu-memory.md)).

## Yksi kehys {#one-frame}

Kehyssilmukka on [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Kaikki, mikä muuttuu kehysnopeudella (kamera, toistokohta, budjetti), on moottorissa, ei sovelluksen tilassa. Kehys ei siis maksa mitään React-työtä. Tila luetaan kerran kehystä kohden ja kirjoitetaan takaisin vain harvoin päivittyviin lukemiin.

1. **Uutta dataa?** Uusi aineisto ilmoitetaan (*Uploading N rows to the GPU*) yhdessä kehyksessä ja ladataan seuraavassa, jotta viesti ehtii piirtyä ennen kuin työ estää säikeen. Uusi kenttä annetaan piirtäjälle. Viivalämpöreitit rakennetaan tai vapautetaan.
2. **Toistokohta** etenee (enintään 0,1 s kellonaikaa kehystä kohden), kiertää tai pysähtyy.
3. **Kamera** lukee näppäimet, hiiren ja peliohjaimen. Akselin peilaus lasketaan näkymämatriisiin. WebGPU:lla syvyyden uudelleenkartoitusmatriisi muuntaa three.js:n OpenGL-tyylisen syvyysalueen WebGPU:n alueeksi.
4. **Mikä on näkyvissä**: aikaväli aikajanalta ja historiasta; ryhmien merkkitaulukko (näkyvyys vain, kun jaetaan sarakkeen mukaan); enintään neljä suodatinta, eli sarakesuodattimet ja kohdevalinta; lämpöjako.
5. **Väri- ja käyrätaulukot** rakennetaan uudelleen, jos niiden asetukset muuttuivat.
6. **Budjetti**: mukautuva ohjain asettaa tämän kehyksen sprite-budjetin ja lämpöresoluution. Kun *Draw every row each frame* on päällä, budjetti nostetaan kattamaan kaikki ehdokasrivit.
7. **Allekirjoitukset** päättävät, mitä kertymäpuskuri vielä tarkoittaa: muutos, joka vaikuttaa siihen, mitkä rivit osallistuvat tai miten (*geometria*), aikaikkunaan, tai pelkkään tuloksen väritykseen (*koostekuva*). Katso [Kertyminen](accumulation.md#what-restarts-it).
8. **Näytteenottosuunnitelma**: mitkä rivilohkot piirretään ([Näytteenotto ja budjetit](sampling-and-budgets.md)).
9. **Kertymätila**: nollaus, laajennus, liukuva keskiarvo, juokseva keskiarvo tai lepo.
10. **Box replay -geometria** (kuutiot, jäljet) lasketaan CPU:lla, vain tässä tilassa ja vain, kun ei olla levossa.
11. **Piirto**: taustaohjelma piirtää kohtauksen (kenttä, ruudukko, akselit, laatikot, jäljet, mittaviivain), roiskuttaa lämmön lämpökohteeseen, yhdistää sen kertymäpuskuriin ja koostaa lämmön kohtauksen päälle canvasille.
12. **Automaattinen valotus** käynnistyy, kun sen lähtölaskenta nollautuu. Viivaimen lämpöanturi lukee enintään yhden pikselin 120 ms välein. Lukemat julkaistaan.

Lepokehys (valmis, mitään ei ole muuttunut) ohittaa kohtauksen ja roiskuttamisen, mutta **koostaa silti uudelleen**. WebGL-canvas, joka luotiin ilman `preserveDrawingBuffer`-asetusta, on koostamisen jälkeen määrittelemätön. Siksi ei ole turvallista luottaa siihen, että se näyttää edellisen kehyksen. Kohtauksen ja lämpökohteet ovat katselijan omia kehyspuskureita, jotka säilyttävät sisältönsä. Lepokehys maksaa siis yhden koko ruudun läpiajon.

## Tämän osion sivut {#pages-in-this-section}

- [Kaksi taustaohjelmaa](backends.md): WebGPU ja WebGL2, miten valinta tehdään, URL-kytkimet
- [Kertyminen](accumulation.md): nollaus, laajennus, liukuva keskiarvo, juokseva keskiarvo
- [Näytteenotto ja budjetit](sampling-and-budgets.md): kerrostettu näytteenottaja, tarkka tila, mukautuva budjetti
- [Puolitarkkuuskertyminen](half-float-accumulation.md): alue ja tarkkuus 16-bittisissä kohteissa
- [GPU-muistin pysyvyys](gpu-memory.md): kvantisoitu rivitallennus ja pakotettu GPU-budjetti
- [Ohjelmistopiirron tunnistus](software-rendering.md)
- [Suorituskykypaneeli ja tilastot](performance-and-stats.md)
