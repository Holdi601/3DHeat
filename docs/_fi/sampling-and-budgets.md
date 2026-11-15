---
title: "Otanta ja rajat"
parent: "Piirron sisäiset"
nav_order: 3
lang: "fi"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Otanta ja budjetit

Kun pisteitä on liikaa piirrettäväksi yhdessä kuvassa, katselija piirtää tasaisen otoksen ja tekee jokaisesta pisteestä painavamman, jotta kuva pysyy oikeana. Ohjain säätää, kuinka monta se piirtää, jotta katselija pitää kuvanopeutensa.

## Suorituskykypaneelin säätimet {#performance-panel-controls}

| Säädin | Oletus | Alue (säätörulla) |
|---|---|---|
| **Piirrä jokainen rivi joka kuvassa** | päällä | |
| **Mukautuva budjetti** | päällä | |
| **Tavoite-FPS** | 60 | 20–240 (1000) |
| **Spritejä / kuva aluksi** (mukautuva) tai **Spritejä / kuva** | 4,00 M | 65 536–268 435 456, logaritminen (268 435 456) |
| **Lämmön tarkkuus** | 100 % | 25–100 %, kerrottuna mukautuvan toisen vaiheen skaalalla |
| **Progressiivinen tarkennus** | päällä | Pois: jokainen kuva on uusi yhden kuvan arvio (hyödyllinen nähdäksesi raakanäytteen). |

Katso myös [Suorituskykypaneeli ja tilastopeite](performance-and-stats.md).

## Kehittäjille {#for-developers}

### Ehdokasrivit {#candidate-rows}

Rivit ovat tallessa nousevassa aikajärjestyksessä. Aikajanan ikkuna [*lo*, *hi*] muuttuu rivialueeksi kahdella binäärihaulla aikasarakkeen yli ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); ilman aikassaraketta jokainen rivi on ehdokas. Nämä ovat tilastopeitteen **Rivejä ikkunassa**. Rivikohtaiset testit – suodattimet, ryhmät, jako, rajaus, viipale, elinikä – tapahtuvat myöhemmin varjostimessa; rivi, joka ei täytä ehtoja, maksaa yhden vertex-kutsun eikä yhtään fragmenttia.

### Otantasuunnitelma {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) jakaa ehdokasalueen **4 096 peräkkäisen rivin lohkoihin** ja valitsee kuinka monta piirtää kuvan spritebudjetista:

- Jos budjetti kattaa kaikki lohkot, kaikki piirretään – kuva on tarkka.
- Muuten lohkot otetaan tasaisella askelella alueen yli, siirrettynä värinällä, joka etenee kultaisen suhteen verran joka kuva, joten peräkkäiset kuvat kattavat eri lohkot ja unioni täyttyy tasaisesti. Tämä on **kerroksittainen** otos: jokainen aikavälin osa on edustettuna jokaisessa kuvassa.

Jokaisen piirretyn rivin lämpö kerrotaan **ehdokkaat / lähetetyt**-suhteella, joten kuvan odotettu lämpö on tarkka millä tahansa budjetilla; vain kohina riippuu budjetista. Rivit ovat paloissa, joiden koko on 8 388 608 (katso [GPU-muistin pysyvyys](gpu-memory.md)); lohko jaetaan, kun se ylittää palan rajan, ja jokainen pala saa listan lohkojen alkukohdista, jotka sen on piirrettävä.

Yksi suunnitelma voi kantaa enintään 65 536 lohkoa – 268 435 456 spritea – koska molemmat taustaohjelmat pitävät kiinteän 65 536 paikan lohkon alkukohtapuskurin. Pyyntö suuremmasta rajoitetaan siihen, ja vaje näkyy rehellisesti lisäkuvina lähentymiseen.

### Piirrä jokainen rivi joka kuvassa {#draw-every-row-each-frame}

**Suorituskyky → Piirrä jokainen rivi joka kuvassa** (oletus **päällä**): budjetista tulee lattia eikä katto, ja kuva, joka aloittaa uuden arvion, piirtää jokaisen rivin, josta se vastaa (enintään 268 M:n rajaan asti).

Syy: kameran liike hylkää kertymän, joten liikkuva kuva on yksi arvio, jonka kohina määräytyy sen mukaan, kuinka suuren osan datasta se piirsi – kun neljännes on piirretty, näet neljänneksen siitä kirkkaina painotettuina pisteinä, ja juuri tämä saa liikkuvan näkymän kimaltelemaan. Kaiken piirtäminen tekee jokaisesta kuvasta valmiin kuvan. Hinta on, että kuvan aika seuraa nyt ikkunan datan kokoa; vipuina ovat kapeampi aikaikkuna, suodattimet tai etäisyysrajaus, jotka vähentävät ehdokkaita sen sijaan, että ottaisivat niitä harvempaan.

Kytke se pois laitteistolle, joka ei jaksa koko kenttää kerralla: *Spritejä / kuva* on silloin todellinen raja, ja näkymä lähentyy muutaman paikallaan olevan kuvan aikana.

Mitä täysi suunnitelma maksaa, mitattuna huippuluokan pöytäkoneen näytönohjaimella 4K-kankaalla ja suurella kentällä, spriteillä, joiden säde on 1 m (pikseli tai kaksi): noin 100 M spritea kuvaa kohden 30 fps:llä, 200 M 15 fps:llä ja 268 M:n enimmäismäärä noin 12 fps:llä. Näin pienillä spriteillä koko kustannus on vertex-vaiheessa, eikä lämmön tarkkuus muuta mitään; suurilla spriteillä kustannus on täyttö: 8 M spritea, joiden säde on 100 m, vei 2,5 s kuvalta täydellä lämmön tarkkuudella ja 170 ms 25 %:lla. **Piirrä jokainen rivi joka kuvassa** aloittaa siis 67 M:stä ja nousee neljänneksen kuvaa kohden, kun kuvat vievät alle 150 ms, ja puolittuu, kun ne vievät yli 400 ms, jotta raskas näkymä ei ajaisi kuvaa yli sen, minkä GPU:n vahtikoira sallii.

### Mukautuva budjetti {#the-adaptive-budget}

**Suorituskyky → Mukautuva budjetti** (oletuksena päällä) säätää spritebudjetin pitämään **Tavoite-FPS**-arvon ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Se on joutilaana laatikkotoistossa ja videoiden renderöinnin aikana.

Syöte on kuvan aika, tasoitettuna (90 % edellinen + 10 % uusi, yksittäiset kuvat rajattuna 2 s:iin), verrattuna tavoitteeseen 1000 / max(15, tavoite-FPS) ms.

**Vaihe yksi – spritet.** Joka kuva budjettia kerrotaan `1 + (tavoite / kuva - 1) × vahvistus`-kaavalla, vahvistus 0,35, kun se on liian hidas, ja 0,08, kun on varaa; rajattuna kertoimeen 0,5–1,25 kuvaa kohden ja välille 65 536–268 435 456 spritea.

**Vaihe kaksi – tarkkuus.** Vasta kun budjetti on jo lattiassaan ja kuvat ovat yhä yli 10 % liian hitaita, lämpöpuskurin tarkkuus laskee 8 % kuvaa kohden, 25 %:iin kankaan koosta asti; se palautuu 4 % kuvaa kohden, kun on 30 %:n varaa. Fragmenttien kustannus laskee tarkkuuden neliön mukaan, mikä on pehmeän liukuman alla lähes näkymätöntä. (Mitattu ohjelmistorenderöinnissä 10 M rivillä ja liian suurilla spriteillä: 141 ms → 17 ms kuvaa kohden.) Skaala pyöristetään kuudestoistaosiin; tilapeitteen *Lämmön tarkkuus* näyttää sen.

**Luovuttaminen.** Hidas kuva näyttää samalta, aiheuttivatpa spritet sen tai raskas kenttä – vaiheittaista ajoitusta ei ole. Jos budjetti on lattiassaan ja kuvat pysyvät alle 70 %:ssa tavoitteesta 30 kuvan ajan, spritet eivät olleet kustannus: ohjain siirtyy **kiipeämään**, kertoo budjetin 1,5:llä joka 14. kuva ja palauttaa tarkkuuden, niin kauan kuin kuvan aika pysyy 1,5-kertaisena siitä, mikä se oli lattiassa. Kiipeäminen, joka pahentaa asioita tätä enemmän, peruu 60 %:iin ja jatkaa normaalia ohjausta; tavoitteen saavuttaminen lopettaa kiipeämisen.

Kun mukautuva budjetti on pois, budjetti on yksinkertaisesti **Spritejä / kuva**.

Kun *Piirrä jokainen rivi joka kuvassa* on päällä, mukautuva budjetti toimii yhä, mutta tarkka sääntö nostaa budjetin kattamaan kaikki ehdokasrivit, joten käytännössä se ohjaa vain tarkkuusvaihetta ja kuvia, jotka eivät aloita uutta arviota.
