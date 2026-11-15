---
title: "Suorituskykypaneeli ja tilastot"
parent: "Piirron sisäiset"
nav_order: 7
lang: "fi"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Suorituskykypaneeli ja tilastot

Näkymän oikeassa yläkulmassa oleva ruutu näyttää, kuinka kovasti katselija työskentelee: kuinka monta kuvaa sekunnissa, kuinka monta pistettä se piirtää ja hioko se yhä kuvaa. Paneeli **Suorituskyky** antaa sinun vaihtaa kuvan laadun nopeuteen.

## Tilastopaneeli {#the-stats-overlay}

Ruutu näkymän oikeassa yläkulmassa välilehdillä Heatmap ja Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Se lukee moottorin reaaliaikaisen lukeman joka animaatiokuvalla.

![Tilastopaneeli monta ottelua kerralla -kohtauksessa, numeroidut huomautukset: 1 Rajapinta, 2 FPS, 3 Kuva, 4 Rivejä ikkunassa, 5 Spritejä / kuva, 6 Budjetti, 7 Lämmön tarkkuus, 8 Kattavuus](../assets/img/en/performance-stats-overlay.webp)

| Rivi | Merkitys |
|---|---|
| **Rajapinta** | *WebGPU* tai *WebGL2*. Osoita rivillä nähdäksesi, miksi WebGPU ei ollut käytössä, jos se ei ollut. Katso [Kaksi taustaohjelmaa](backends.md). |
| **FPS** | Kuvaa sekunnissa, keskiarvona vähintään 0,4 s ajalta. |
| **Kuva** | Kuvan aika ms:nä, tasoitettuna (90 % edellinen, 10 % uusi). Tämä on aika kuvien välillä, ei GPU:n aika. GPU-aikaa ei mitata yksittäisistä vaiheista. |
| **Rivejä ikkunassa** | Ehdokasrivit: nykyisen aikaikkunan rivit ennen rivikohtaista suodatusta varjostimessa. |
| **Spritejä / kuva** | Spritejä, jotka viimeisen kuvan suunnitelma lähetti. Lepokuvilla, jotka eivät piirrä mitään, luku pysyy suunnitellussa arvossa. |
| **Budjetti** | Sprite-budjetti, jolla tämä kuva suunniteltiin. Se on mukautuvan ohjaimen arvo, nostettuna kaikkiin ehdokkaisiin, kun piirretään jokainen rivi. |
| **Lämmön tarkkuus** | Lämpöpuskurin tarkkuus osuutena canvasista: asetus *Heat resolution* kerrottuna mukautuvalla toisen vaiheen kertoimella. |
| **Kattavuus** | Kuinka pitkällä progressiivinen kertyminen on kaikkien rivien käyttämisessä: prosentti lähentyessä (oranssi), *exact*, kun valmis. Kohinainen kuva ei koskaan sekoitu valmiiseen kuvaan. |
| **Kuutiot** | [Box replay](box-replay.md)-näkymässä piirretyt laatikot. |
| **Ei muistissa** | Näytetään vain, kun rivit eivät mahtuneet GPU-budjettiin: kuinka monta. Katso [GPU-muistin pysyvyys](gpu-memory.md). |

## Nopeusnäyttö {#the-speed-display}

Näkymän oikeassa alakulmassa, vain perspektiivissä: lentonopeus ja aika, joka kuluu aineiston ylittämiseen tällä nopeudella. Vedä sitä muuttaaksesi nopeutta. Katso [Kamera](camera.md#fly-speed).

## Jos katselija on hidas {#if-the-viewer-is-slow}

Katso ensin tilastopaneelia ja sen jälkeen:

1. **Rivejä ikkunassa paljon suurempi kuin Spritejä / kuva, Kattavuus alle 100 %**: kehys ei voi piirtää kaikkea. Kun näkymä on paikallaan, se lähentyy useiden kuvien aikana. Kaventa ikkunaa, suodata tai rajaa pienentääksesi ehdokkaita. Voit myös hyväksyä näytteenoton.
2. **Spritejä / kuva yhtä suuri kuin Rivejä ikkunassa, kuva yhä hidas**: kustannus on per sprite näytöllä. Laske *Max pixel radius* ([Spritemuoto](sprite-shape.md#pixel-clamps)) tai *Heat resolution* -arvoa.
3. **Hidas vähillä riveillä**: todennäköisesti kenttä: paljon rakennelmia, reunat päällä, maaperän kolmiot, syvyysterävyys. Katso [Kentän ulkoasu](level-appearance.md).
4. **Kaikki hidasta ja punainen banneri**: ohjelmistopiirto ([Ohjelmistopiirron tunnistus](software-rendering.md)).

## Suorituskykypaneeli {#the-performance-panel}

| Säädin | Oletus | Vaikutus |
|---|---|---|
| Vihje | | Jokainen kuva roiskuttaa satunnaisen kerrostetun osajoukon näkyvistä riveistä. Painot on skaalattu korjaamaan tilanne, joten odotettu lämpö on tarkka millä budjetilla tahansa. Kun näkymä pidetään paikallaan, kuvia yhdistetään, kunnes jokainen rivi on osallistunut. |
| **Piirrä jokainen rivi joka kuvassa** | päällä | Jokainen kuva, joka aloittaa uuden arvion, piirtää jokaisen ehdokasrivin (noin 268 M asti). Alla oleva budjetti muuttuu alarajaksi. [Näytteenotto ja budjetit](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Mukautuva budjetti** | päällä | Säädä spritejä kuvaa kohden ja sitten lämmön tarkkuutta, jotta kuvanopeus pysyy tavoitteessa. Lopeta leikkaaminen, kun se ei auta. [Näytteenotto ja budjetit](sampling-and-budgets.md#the-adaptive-budget) |
| **Tavoite-FPS** | 60 | 20-240 (1000 kahvalla). Alle 15 olevat arvot käsitellään arvona 15. |
| **Spritejä / kuva aluksi** / **Spritejä / kuva** | 4,00 M | 65 536-268 435 456, logaritminen. Nimi on *aluksi*, kun mukautuva budjetti on päällä, koska ohjain siirtää arvoa. |
| **Lämmön tarkkuus** | 100 % | 25-100 %. Fragmenttien kustannus skaalautuu neliöllä: 50 % neljännesti sekoitustyöstä, ja lämpökenttä on niin sileä, ettei ero juuri näy. |
| **Progressiivinen tarkennus** | päällä | Kertyy kuvien yli, kun näkymä on paikallaan. Kun pois, näytetään yhden kuvan arvio joka kuvassa. [Kertyminen](accumulation.md) |
| **Resurssibudjetit** | tunnistettu | RAM-, GPU- ja jäsennyssäikeen budjetit. [Muisti ja budjetit](memory-and-budgets.md#resource-budgets) |

Mikään näistä ei tallennu. Uudelleenlataus palauttaa oletukset.
