---
title: "Kamera ja ohjaimet"
nav_order: 14
has_children: true
lang: "fi"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera ja ohjaimet

Lennät näkymän läpi kuin lintu: **W A S D** liikuttaa, vedä hiirellä katsoaksesi. Tällä sivulla opit lentämään, hyppäämään ylä- tai sivunäkymään ja lukemaan tarkalleen, missä kamera on.

## Lentäminen neljässä vaiheessa {#fly-in-4-steps}

1. Napsauta näkymää kerran, jotta sillä on näppäimistö.
2. Pidä **W** pohjassa lentääksesi eteenpäin, **S** taakse, **A** ja **D** sivulle, **Välilyönti** ylös ja **Q** alas.
3. Pidä vasenta tai oikeaa hiiren painiketta pohjassa ja vedä katsoaksesi ympärillesi.
4. Paina **F** kuvataksesi kaiken aineiston uudelleen.

Kamera on vapaa lentokamera, jossa on perspektiivi- ja rinnakkaisprojektio, valmiit näkymät, kirjoitettava asento ja syväterävyys. Sen asetukset ovat **Kamera ja näkymä** -paneelissa sivupalkin alareunassa (näkyy myös Kisa-analyysi- ja Ottelu-välilehdillä). Toteutus on [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Lentäminen {#flying}

| Syöte | Vaikutus |
|---|---|
| `W` `A` `S` `D` tai nuolinäppäimet | Eteen (näkymän suuntaan, myös nyökkäyksen), vasen, taakse, oikea |
| `Välilyönti` tai `E` | Ylös (maailman ylös) |
| `Q` tai vasen `Ctrl` | Alas |
| `Shift` (pohjassa) | 6 kertaa nopeammin |
| vasen `Alt` (pohjassa) | 15 % nopeus |
| Vetäminen vasemmalla tai oikealla hiiren painikkeella | Katsominen ympärille. Osoitin lukittuu vedon ajaksi. |
| Hiiren rulla | Lentonopeus ×1,5 per naksahdus (perspektiivi); zoomaus (rinnakkais) |
| `F` | Kuvaa aineisto |
| Napsautus (ilman vetämistä) | Näyttää, mitä osoittimen alla on ([Näkymän tarkastelu](#inspecting-the-view)) |
| `C` | Kopioi kameran sijainti, kiertokulma ja nyökkäyskulma |
| `G` | Siirry kirjoitettuun pisteeseen |
| `Esc` | Sulje valintakortti (ja lopeta yksikön seuraaminen) |

### Kun seurataan yksikköä {#while-following-a-unit}

Kun kamera seuraa yksikköä toistossa ([Ottelun toisto](match-replay.md)), lentonäppäimet tekevät muuta:

| Syöte | Vaikutus |
|---|---|
| Rulla, `W` / `S` | Lähemmäs yksikköä / kauemmas (satelliittinäkymässä ylös / alas) |
| `A` / `D`, `Q` / `E` | Kiertää yksikön ympäri (takaa- ja kiertonäkymät) |
| Veto | Katsominen yksikön ympäri (ohjaamo: katsominen sisällä) |
| `V` / `Shift+V` | Seuraava / edellinen kameranäkymä |
| `Esc` | Ensin lopeta toisen yksikön katsominen, sitten seuraaminen |

Liikenäppäimet lasketaan yhteen [peliohjaimen](gamepad.md) kanssa. Muut näppäimet ovat [näppäimistöviitteessä](keyboard-reference.md). Näppäimet eivät vaikuta, kun tekstikenttä tai pudotusvalikko on aktiivinen. Nyökkäys rajataan juuri ennen suoraan ylös tai alas.

## Kamera ja näkymä -paneeli {#camera--scene-panel}

![Kamera ja näkymä -paneeli: Projektio, Valmiit näkymät, Näkökenttä-painikkeet, Lentonopeus ja Asento](../assets/img/en/camera-panel.webp)

### Projektio {#projection}

**Projektio**: *Perspektiivi* (oletus) tai *Rinnakkais*.

*Rinnakkais* (ortografinen) poistaa lyhennyksen, joten kaksi yhtä tiheää kuumaa kohtaa näkyvät samankokoisina missä tahansa kuvassa. Juuri tätä karttalämpökartta vertailuun tarvitsee, ja sen takia isometrinen näkymä on isometrinen. Rinnakkaistilassa hiiren rulla zoomaa (eteen liikkuminen ei muuta mittakaavaa), ja [nopeusnäyttö](#fly-speed) on piilossa.

**Vaihto pitää kohteen samankokoisena.** Rinnakkaisprojektiolla ei ole näkökenttää, joten sen katkaisun korkeus ei liity kameran etäisyyteen. Suora vaihto joko zoomaa rajusti tai ei näytä mitään. Rinnakkaiseen siirtyessä katkaisun korkeudeksi asetetaan se, mitä perspektiivikamera peittää tarkennusetäisyydellä (2 × etäisyys × tan(näkökenttä / 2); tarkennusetäisyys on viimeisimmän kuvauksen etäisyys). Takaisin siirtyessä palautuu se perspektiiviasento, josta lähdit, samassa näennäisessä mittakaavassa. Se ei palaudu siihen, minne rinnakkaisnäkymä ehti vaeltaa.

### Valmiit näkymät {#preset-views}

| Ryhmä | Painikkeet | Suunta |
|---|---|---|
| **Isometrinen** | **KO**, **LU**, **KA**, **LO** | Rinnakkais, nyökkäys -35,264° (= atan(1/√2), kulma, jossa kaikki kolme akselia piirtyvät samanpituisina), kiertokulma -45°, 45°, -135°, 135°. Neljä kulmaa, koska yksi kulma piilottaa aina puolet kartasta lähemmän asian taakse. |
| **Sivukuvat** | **Ylhäältä**, **Alhaalta**, **Edestä**, **Takaa**, **Vasemmalta**, **Oikealta** | Rinnakkais. Ylhäältä katsoo suoraan alas (nyökkäys -89,9°), Alhaalta suoraan ylös, Edestä pitkin -Z:tä (kiertokulma 0°), Takaa pitkin +Z:aa (180°), Vasemmalta pitkin -X:ää (-90°), Oikealta pitkin +X:ää (90°). |
| | **Takaisin perspektiiviin** | Palaa perspektiiviasentoon, josta lähdit. Poissa käytöstä perspektiivissä. |
| | **Viistonäkymä** | Perspektiivi, kiertokulma -35°, nyökkäys -28°. |

Jokainen valmis näkymä vaihtaa itse projektion. Perspektiivissä "ylänäkymä" lähenee yhä kadonneen pisteen kohti, eikä yhtä suuret alueet enää näytä yhtä suurilta. Jokainen valmis näkymä myös kuvaa aineiston tästä suunnasta.

### Näkökenttä {#field-of-view}

**Näkökenttä** on pystykulma. Oletus on 65°, radalla 10-140° (179° kahvan kanssa). Painikkeet ovat **Litteä 20°**, **Pitkä 35°**, **Normaali 50°**, **Leveä 65°** ja **Hyvin leveä 90°**. Kapea litistää perspektiiviä ja muistuttaa enemmän rinnakkaisprojektiota. Leveä liioittelee syvyyttä, ja etäisyyksiä on vaikea arvioida. Se pysyy käytössä rinnakkaistilassa, jossa se asettaa mittakaavan, jonka vaihto ratkaisee, ja etäisyyden, jota **Kuva** käyttää.

### Lentonopeus {#fly-speed}

**Lentonopeus** on maailman yksikköä (metriä) sekunnissa täydellä kaasulla. Oletus on 120. Joka latauksella se on aineiston vaakasuuntainen ulottuvuus / 12. Logaritminen, 0,02-20 000 (200 000 kahvan kanssa; kahva muuttaa sitä suhteina, ei määrinä). Hiiren rulla kertoo tai jakaa sen 1,5:llä naksahdusta kohti, rajoissa 0,02-200 000.

Sama arvo näkyy näkymän oikeassa alareunassa (vain perspektiivi): nopeus m/s tai km/s ja aika, joka kuluu aineiston ylityksessä (tai tasossa, kun 3D-taso on ladattu) sillä nopeudella. Vedä sitä ylös tai alas muuttaaksesi nopeutta.

### Lähiraja ja kaukoraja {#near-and-far}

**Lähiraja** (oletus 0,5) ja **Kaukoraja** (oletus 40 000) ovat leikkausetäisyyksiä. Molemmat lasketaan uudelleen aineistosta joka latauksella (lähiraja = max(0,05; ulottuvuus / 20 000), kaukoraja = ulottuvuus × 12). Suurempi 3D-taso voi vain leventää niitä, ei kaventaa (katso [Tasot](levels.md#what-a-level-does-for-the-heat)). Niiden suhde asettaa syvyystarkkuuden, johon peittyminen luottaa. Pieni lähiraja ja valtava kaukoraja heikentävät [peittymistä](depth-and-culling.md). Kun katsotaan sceneä ulkoa tai korkealta sen maasta, käytetty lähitaso siirtyy 2 prosenttiin tuosta etäisyydestä. Silloin kaukaa ylhäältä katsotussa kartassa on tarpeeksi syvyystarkkuutta, eikä vesi ja ranta välkkyy. Laatikko näyttää silti asetetun arvon.

### Muut säätimet {#other-controls}

| Säädin | Oletus | Merkitys |
|---|---|---|
| **Käännä Y** | pois | Kääntää hiiren katsomisen ylös ja alas. |
| **Syväterävyys** | pois | Katso alla. |
| **Peliohjain** | käytössä | Katso [Peliohjain ja HOTAS](gamepad.md). |
| **Asento** | | Katso alla. |
| **Tarkastele** | | Kameran lukema, napsautus valintaan, kiertokulman käytäntö ja *Siirry pisteeseen*; katso [Näkymän tarkastelu](#inspecting-the-view). |
| **Kuvaa aineisto (F)** | | Sovittaa aineiston (Kisa-analyysi-välilehdellä: kierrokset) näkymään ja säilyttää nykyisen suunnan. Kamera asetetaan etäisyydelle r / tan(näkökenttä / 2) keskipisteestä, missä r on aineiston rajojen lävistäjän puolikas. |
| **Ruudukko**, **Akselit** | päällä, päällä | Maaruudukko, jonka väli on 1/2/5 × 10ⁿ noin 1/40 aineiston jänteestä (ulottuu 1,5 kertaan aineistoon, 8-120 ruudukkoaskelen välillä), ja värilliset akselit. |
| **Käännä maailman akseli** X, Y, Z | pois | Katso alla. |

### Asento {#pose}

Viisi numerokenttää, **X**, **Y**, **Z** sekä **kiertokulma °** ja **nyökkäyskulma °**, seuraavat kameraa niin kauan kuin mikään niistä ei ole aktiivinen. Kirjoita arvo ja paina `Enter` (tai poistu kentästä), niin kamera siirtyy sinne. **kopioi** laittaa leikepöydälle `pos X Y Z · yaw A · pitch B` (ja perään `(pelin kiertokulma)`, kun se käytäntö on valittu). Lentäminen on tapa tutkia, koordinaatit ovat tapa toistaa näkymä. Ne ovat samat luvut kuin [kameran lukema](#camera-readout): aineiston omat koordinaatit, mukaan lukien akselin käännön jälkeen, ja kiertokulma valitussa [käytännössä](#yaw-conventions).

### Käännä maailman akseli {#invert-world-axis}

**Käännä maailman akseli X / Y / Z** piirtää maailman niin, että valittu akseli on takaperin. Peli, joka pitää maailman vasenkätisenä, näkyy tässä oikeakätisessä katselussa peilattuna: oikean käden kaari piirtyy vasemman käden kaarena. X:n tai Z:n kääntäminen palauttaa sen. **Vain piirto muuttuu**: aineisto, analyysi ja jokainen koordinaatti, jonka työkalut näyttävät (asento, viivain, viipale), pysyvät pelin omina. Näkymä kääntyy paikallaan, ja katsot yhä samaa kohtaa. Asetus muistetaan selaimessa (`localStorage`-avain `heat3d.mirror`). Vertaa latauksen [kääntöihin](axes-units-and-time.md#flips), jotka muuttavat aineistoa.

## Näkymän tarkastelu {#inspecting-the-view}

Missä kamera on, mitä osoittimen alla on ja siirtyminen pisteeseen: **Tarkastele**-osio Kamera ja näkymä -paneelista sekä kaksi peittokuvaa näkymän vasemmassa yläkulmassa. Koodi on tiedostoissa [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) ja [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Säädin | Oletus | Merkitys |
|---|---|---|
| **Kameran sijainti näkymän päällä** | päällä | Kameran lukema, alla. Sulkeutuu myös **×**:llä. |
| **Napsautus näyttää, mitä siinä on** | päällä | Napsautus valintaan, alla. |
| **Kiertokulman käytäntö** | Katseluohjelma | Mitä kiertokulmaa lukema, asennekentät ja hyppykenttä näyttävät ja lukevat. |

Nämä kolme asetusta muistetaan selaimessa (`localStorage`-avain `heat3d.inspect`).

### Kameran lukema {#camera-readout}

Näkymän vasemmassa yläkulmassa: kameran **x**, **y**, **z**, **kiertokulma** ja **nyökkäyskulma** reaaliajassa, ja merkki, joka kertoo kiertokulman käytännön. Ne ovat samat luvut kuin [Asento](#pose)-kentissä, eikä niiden näyttäminen maksa mitään lentäessä (ne kirjoitetaan sivulle kehyskellon mukaan, paneeleita piirtämättä uudelleen).

- **kopioi** (tai `C` missä tahansa tekstikentän ulkopuolella) laittaa leikepöydälle `x X y Y z Z yaw A pitch B (katseluohjelman kiertokulma)`. Desimaalit ovat pisteitä kielestä riippumatta, joten hyppykenttä ja mikä tahansa skripti voi lukea sen.
- **siirry** (tai `G`) avaa kentän sen alle: liitä piste ja paina `Enter` katsoaksesi sitä, tai liitä kopioitu asento seisoaksesi siinä näkymässä. `Esc` sulkee kentän.

### Koordinaatit: aineiston oma koordinaatisto {#coordinates-the-datas-own-frame}

Jokainen koordinaatti, jonka tarkastelutyökalut näyttävät tai hyväksyvät, on **ladatun aineiston omassa koordinaatistossa**. Latauksen [akselikuvaus](axes-units-and-time.md) (ylösakseli, kääntöt, mittakaava) puretaan. Näkymästä luettu sijainti on se luku, jonka lähdetaulukko sisältää. Taulukon luku, joka kirjoitetaan hyppykenttään, osuu samaan kohtaan. Kun kuvaus ei muuta mitään (Y ylös, skaalaamaton lataus, mitä tallennustyökalut ja tason viejät kirjoittavat), tämä on yksinkertaisesti maailma. Muuten lukemassa on **aineiston koordinaatisto** -merkki. Ilman aineistoa koordinaatit ovat maailman koordinaatteja. Kiertokulma ja nyökkäys ovat aina katseluohjelman maailmasta, Y ylös.

### Kiertokulman käytännöt {#yaw-conventions}

| Käytäntö | Kiertokulma 0° katsoo pitkin | Kasvaa kohti | Käyttäjä |
|---|---|---|---|
| **Katseluohjelma** | -Z | -X | lentokamera, [valmiit näkymät](#preset-views) |
| **Peli / tallennustyökalut** | +X | -Z | tallennustyökalujen `yaw`-sarakkeet ja asennot; tasossa, joka on viety katseluohjelman koordinaatistossa, pelin oma kiertokulma |

Nyökkäys on molemmissa sama: ylös vaakatasosta. Kaksi käytäntöä eroavat neljänneskierroksella eikä muulla:

> katseluohjelman kiertokulma = pelin kiertokulma - 90°

Suunta `d` on `(cos p · cos y, sin p, -cos p · sin y)` pelin käytännössä ja `(-sin y · cos p, sin p, -cos y · cos p)` katseluohjelman käytännössä. Valitse **Peli / tallennustyökalut**, kun haluat kirjoittaa kiertokulman suoraan tallennustaulukosta tai verrata lukemaa siihen.

### Siirtyminen pisteeseen {#going-to-a-point}

**Siirry pisteeseen** Tarkastele-osiossa (ja lukeman **siirry**-kenttä):

- tekstikenttä ottaa muodot `x, y, z` tai `x y z` (tai `x; y; z`), desimaalipisteellä tai desimaalipilkulla. `-321.6, 137.8, -59.9` ja `-321,6 137,8 -59,9` ovat sama piste. Viisi lukua lisää kiertokulman ja nyökkäyskulman. Lukemasta tai asennekentistä kopioitu asento luetaan kokonaisena, nimet ja käytäntö mukaan lukien.
- **kiertokulma °** ja **nyökkäyskulma °** (valinnaiset) kääntävät kameran valitussa käytännössä.
- **Katso** säilyttää suunnan (kallistetaan alas, jos katsottiin vaakatasossa, vähintään 20°) ja peräytyy sitä pitkin nykyiselle etäisyydelle. Etäisyys pidetään 0,3 %:n ja 3 %:n välillä scene-leveydestä: 6-60 m kahden kilometrin tasolla. Tarkennusetäisyys, rinnakkaisnäkymän korkeus ja lentonopeus seuraavat, joten näkymä on heti käyttökelpoinen.
- **Seiso tässä** asettaa kameran pisteeseen, käännettynä annettuun kiertokulmaan ja nyökkäykseen, tai sellaisena kuin se oli.

Liitetty asento omalla kiertokulmallaan ja nyökkäyksellään seisoo aina siinä näkymässä.

### Napsautus valintaan {#click-to-pick}

Napsautus näkymään (paina ja vapauta, vetämättä yli 4 pikseliä; vetäminen katsoo edelleen ympärille) näyttää kortin vasempaan yläkulmaan, jossa on se, mitä osoittimen alla on. Kun [viivain](measure.md) on päällä, napsautukset menevät viivaimelle.

**Piirretty datapiste voittaa.** Lähin näyte 8 pikselin sisällä napsautuksesta niistä, jotka oikeasti piirretään: aikaikkunan ja elinajan rivit, [suodattimet](filters.md) läpäisevät, näytetyt ryhmät ja erotuksen jako, etäisyysrajauksen sisällä ja viipaleen sisällä, joka leikkaa lämmön. Laatikkotoistossa osoittimen alla oleva laatikko (missä tahansa sen kohdassa). Kortissa on jokainen sarake, jonka rivi kantaa, lähteen omilla sarakenimillä: aika (seinäkello tai tiedoston omat sekunnit `m:ss.ss`), henkilö, ryhmä, sessio, jokainen säilytetty sarake, sijainti ja katselusuunta, sekä etäisyys kamerasta. Muistissa on vain ne sarakkeet, jotka lataus säilytti. Sarake, jota ei valittu [suodatinsarakkeeksi](column-mapping.md), ei näy.

**Muuten tason pinta**: kohta, jossa napsautuksen säde osuu tason todellisiin kolmioihin (ei viivaimen vertailutasoon). Mukana on **osa**, johon se kuuluu (viejän nimi, `structure:props`, `ground:terrain …`), sen **laji** (maa, rakenne, vesi, karttakuva), koordinaatit ja etäisyys. Viipaleen tai etäisyysrajauksen piilottama geometria läpäistään. Jos tasolla on [navigointiverkko](model-levels.md#navigation-meshes), rivi nimeää sen ja kertoo, onko kohta sen päällä (✓). Osan nimi, jonka edessä on `≈`, arvattiin osien rajauslaatikoista, koska tason tuo osa yksinkertaistettiin latauksessa.

Kortti pysyy, kunnes sen sulkee (**×**, `Esc`), toinen napsautus vastaa johonkin muuhun tai napsautetaan tyhjää. Kohtaan piirretään syaaninen risti sceneen ja sen ympärille rengas näytölle. Sen painikkeet: **kopioi** (kaikki arvot, ja koordinaatit muodossa `x, y, z`), **Katso** ja **Seiso tässä** (datapisteessä katsoen samaan suuntaan kuin rivi, kun sillä on katselusuunta; pinnalla 1,7 m sen yläpuolella).

Taso indeksoidaan valintaa varten ensimmäisellä napsautuksella, joka sitä tarvitsee: sarakkeiden ruudukko sen jalanjäljen päällä. Se rakennetaan muutamia millisekunteja kerrallaan ruutujen välissä, joten näkymä ei koskaan pysähdy. Työ vie noin sekunnin tasolle, jossa on useita miljoonia kolmioita. Indeksi pidetään, kunnes taso vaihtuu. Siihen asti kortissa lukee *Valmistellaan tasoa valintaa varten* prosentin kanssa, ja se vastaa napsautukseen, kun se on valmis. Datapisteen haku yli neljän miljoonan piirretyn rivin yli jaetaan ruutujen yli samalla tavalla.

## Syväterävyys {#depth-of-field}

Taitettava osio Kamera ja näkymä -paneelissa. Otsikko on *Syväterävyys - päällä*, kun se on käytössä. Oletuksena se on pois, koska se on esitystehoste. Oletusnäkymän pitää näyttää aineisto, ei tulkintaa siitä.

| Säädin | Oletus | Alue (säädin) | Merkitys |
|---|---|---|---|
| **Käytössä** | pois | | |
| **Tarkenna rajattuun** | päällä | | Tarkentaa viimeisimmän kuvauksen etäisyydelle (*Tarkennettu N m:iin*). |
| **Tarkennusetäisyys** | 1000 | 1-200 000, logaritminen (10 000 000) | Näkyy, kun tarkennus on käsin. |
| **Aukko** | ±35 % | ±2 % - ±200 %, logaritminen (±3200 %) | Terävänä pidettävä syvyys tarkennusetäisyyden murtolukuna. Suhteellinen, ei f-luku, koska kohtaukset vaihtelevat huoneesta kahdeksan kilometrin karttaan. |
| **Suurin sumennus** | 12 px | 1-48 (256) | Suurin sumennussäde. Kustannus kasvaa sen mukana. |

Se sumentaa **tason, ruudukon ja laatikot**, *ei lämpökarttaa*. Pikselin lämpö on monien eri syvyyksien sprite-tasojen summa, joten sillä ei ole yhtä syvyyttä, jossa se olisi epätarkka. Sen sumentaminen sen takana olevan geometrian mukaan olisi väärin siinä, missä se leijuu edessä. Terävä data pehmennetyn taustan päällä on myös hyödyllisempi. Sumennus on 24 pisteen kultakulmanäytteenottoa yhdistävässä vaiheessa, painotettuna niin, ettei terävää edustaa levitetä ulospäin takana olevan sumean taustan kautta. Muuttaminen piirtää uudelleen käynnistämättä lämmön kertymistä uudelleen.

## Kankaan resoluutio {#canvas-resolution}

Kangas piirretään näytön pikselisuhteella, enintään 2. Lämpöpuskuri voidaan piirtää tätä matalammalla resoluutiolla ([Lämmön resoluutio](performance-and-stats.md)).

## Tämän osion sivut {#pages-in-this-section}

- [Peliohjain ja HOTAS](gamepad.md)
- [Näppäimistön ja hiiren viite](keyboard-reference.md)
