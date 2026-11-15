---
title: "Taktiikkataulu"
nav_order: 15
has_children: true
lang: "fi"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktiikkataulu

**Taktiikka**-välilehti on piirtotaulu joukkueen suunnitelmalle: asetat pieniä hahmoja kartalle, piirrät nuolia siitä, minne ne menevät, ja painat toistoa nähdäksesi tapahtuman. Sen avulla voit suunnitella kierroksen tai hyökkäyksen ennen pelaamista. Se jakaa piirtoalueen, kameran ja [kentän](levels.md) muiden välilehtien kanssa, eikä mitään muuta. Suunnitelma ei ole dataa, eikä se piirrä lämpöä.

## Ensimmäinen suunnitelmasi {#your-first-plan}

1. Avaa **Taktiikka**-välilehti. Valitse **Peli** (esimerkiksi Counter-Strike 2) ja Valorantille paina **Lataa Valorant-kartat** ja valitse **Kartta**. Tai lataa ensin [kenttä](levels.md).
2. Valitse **Puoli** (se asettaa värin) ja paina **Ylhäältä**.
3. Valitse **Paikka**, valitse hahmo kohdasta **Hahmot** (käytä **Hae hahmoja** löytääksesi sen) ja napsauta karttaa. Aseta kaksi tai kolme.
4. Valitse **Nuoli**, napsauta hahmoa, napsauta reittiä, jota sen pitäisi kulkea, ja paina **Enter** lopettaaksesi nuolen.
5. Lisää vaihe 2 painamalla **+** näkymän alla. Jokainen hahmo alkaa sieltä, mihin sen nuoli päättyi. Piirrä siihen lisää nuolia.
6. Paina **▶** (tai `K`) toistaaksesi suunnitelman näytetystä vaiheesta loppuun.
7. Nimeä suunnitelma kohdassa **Suunnitelman nimi** ja paina **Tallenna**.

![Taktiikka-välilehti ylhäältä: peli, puolet ja työkalut vasemmalla, kolme hahmoa liikenuolilla, savun heittokaari, alue ja vaiheet alareunassa](../assets/img/en/tactics.webp)

## Suunnitelman aloittaminen {#starting-a-plan}

| Säädin | Mitä se tekee |
|---|---|
| **Peli** | Valitsee puolet ja hahmot, joita paletti tarjoaa: Counter-Strike 2 (T, CT; pelaajat ja apuvälineet), Valorant (Attack, Defense; pelaajat ja yleiset kyvyt), Battlefield, Squad, Arma (jalkaväki, maa-ajoneuvot, ilma-alukset, veneet), DCS / War Thunder / IL-2 (suihkukoneet, potkurikoneet, helikopterit, ilmatorjunta, maa, laivat, aseet) ja Muu. Suunnitelma, jossa on jo hahmoja, säilyttää puolensa, kun peli vaihtuu. |
| **Suunnitelman nimi** | Nimi, jolla suunnitelma tallennetaan. |
| **Kartta**, **Lataa Valorant-kartat** | Kun Valorant on valittu: **Lataa Valorant-kartat** hakee karttalistan osoitteesta [valorant-api.com](https://valorant-api.com); **Kartta** asettaa valitun kartan minikartan kentäksi, kehystettynä ylhäältä. Kuva haetaan valittaessa eikä sitä toimiteta mukana. Riotin ilmoitus näytetään, kun se on ruudulla (katso alla). |
| **Puoli** | Puoli, johon seuraava hahmo, nuoli tai alue kuuluu; se saa puolen värin. |

Ilman kenttää taulu on tasainen maataso. Lataa kenttä kohdassa **Kenttä** suunnitellaksesi todellisella kartalla: CS2-kartta, joka on viety CS2-työkalulla, kirjastosta valittu kenttä tai karttakuva.

## Työkalut {#tools}

| Työkalu | Napsautus | Huomioita |
|---|---|---|
| **Valitse** | Hahmo, reittipiste, nuoli, alue tai muistiinpano valitsee sen. | Shift+napsautus lisää tai poistaa; Shift+vetäminen piirtää laatikon lisättävien ympärille. Valinnalla on muunnosgizmo (katso alla); `Delete` tai `Backspace` poistaa sen. `M` siirtää valitun hahmon seuraavaan napsautukseen. |
| **Paikka** | Asettaa valitun hahmon. | Hahmo valitaan **Hahmot**-paletista (**Hae hahmoja** -kentällä). Kun mitään ei ole valittuna, `R` kääntää seuraavan hahmon 15° ennen asettamista (`Shift+R` toiseen suuntaan). |
| **Nuoli** | Jokainen napsautus lisää pisteen; Enter, kaksoisnapsautus tai oikea napsautus lopettaa, Esc hylkää. | **Liike**, **Hyökkäys** (leveämpi kärki) tai **Tähystys** (ohut viiva silmänkorkeudella). Hahmosta alkava nuoli on sen hahmon reitti tässä vaiheessa: toistettaessa hahmo kulkee sen, ja seuraava vaihe alkaa sen päästä. |
| **Heitto** | Heittäjä, sitten minne se osuu. | Katkoviivainen kaari heittäjän ja kohteen välillä, ja valittu apuväline (savu, välähdys, molotov ...) ilmestyy kohtaan, johon se osuu, ja pysyy siitä vaiheesta alkaen. |
| **Alue** | Keskipiste, sitten reuna. | Kiekko puolen värillä. |
| **Muistiinpano** | Mihin muistiinpano menee; pyytää sen tekstin. | Näkyy neulana, ja sen teksti sen päällä. |
| **Poista** | Hahmo, nuoli, alue tai muistiinpano. | Poistaa sen tästä vaiheesta alkaen; ensimmäisessä vaiheessa poistaa sen kokonaan. |

**Kumoa** ja **Tee uudelleen** (`Ctrl+Z`; `Ctrl+Y` tai `Ctrl+Shift+Z`) käyvät läpi jokaisen muutoksen. Suunnitelman alla oleva rivi kertoo, kuinka monta hahmoa, nuolta ja vaihetta siinä on. **Ylhäältä** katsoo suoraan alas (ortografinen), **3D-näkymä** palaa perspektiiviin, **Kuva** sovittaa suunnitelman, tai kentän kun suunnitelma on tyhjä.

**Hahmojen koko** skaalaa kaikki taulun hahmot; 1× on todellinen koko, joka ylhäältä katsottuna on henkilölle muutama pikseli.

## Siirtäminen, kääntäminen ja skaalaus {#moving-turning-and-scaling}

Kaikkea taululla voi siirtää kuten 3D-editorissa: hahmoja, apuvälineitä, merkkejä, yksittäisiä reittipisteitä ja kokonaisia nuolia, alueita ja muistiinpanoja. Valitulla kohteella on gizmo keskellään:

| Tila | Näppäimet | Kahvat |
|---|---|---|
| **Siirrä** | W (tai G) | Nuoli kullekin akselille (X punainen, Y vihreä ja ylös, Z sininen) liikuttaa sitä sen suuntaisesti; neliö liikuttaa tasossaan; keskus liikuttaa kentän yli osoittimen alla. |
| **Kierrä** | E (tai R) | Rengas kullekin akselille kääntää sen ympäri. Yksittäisen hahmon renkaat ovat sen oma suuntima, kallistus ja kierto; ryhmä kääntyy maailman akselien ympäri keskeltään. |
| **Skaalaa** | R (tai S) | Levittää tai kokoaa valinnan keskeltään akselin suuntaan tai joka suuntaan; alueen säde kasvaa sen mukana. |

**Näppäimet** vaihtaa W / E / R (Unity, Unreal) ja G / R / S (Blender) välillä; näppäimet valitsevat tilan vain, kun jotain on valittuna, ja muuten lentävät kameraa. Joten `R` tarkoittaa **Skaalaa** W / E / R -näppäimillä ja **Kiertää** G / R / S -näppäimillä, kun jotain on valittuna, ja kääntää seuraavaa asetettavaa hahmoa, kun mitään ei ole. Kaikki taulun näppäimet on listattu [näppäinviitteessä](keyboard-reference.md#tactics-board). Pidä **Ctrl** pohjassa vetäessäsi, jotta siirto napsahtaa **Ruudukkoon** (metrit) tai käännös **Kulma-askeleeseen**. **Kiinnitä maahan** (oletuksena päällä) asettaa siirretyt ihmiset, ajoneuvot, merkit, reittipisteet ja alueet kentän pintaan; ilma-alukset ja helikopterit säilyttävät korkeutensa, ja vetäminen Y-nuolta pitkin ei koskaan napsahda. Kahvan vetäminen ei koskaan siirrä kameraa. **Esc** peruuttaa vedon, ja jokainen muutos on yksi Kumoa-askel.

Reittipisteet näkyvät pisteinä näytetyn vaiheen nuolissa: napsauta yhtä valitaksesi sen, vedä siirtääksesi, Delete poistaaksesi sen. **Valitut**-osio näyttää valinnan paikan metreinä, hahmon suuntiman, kallistuksen ja kierron asteina sekä alueen säteen, kaikki kirjoitettavissa.

## Ajoitus {#timing}

Hahmon reitti on ajoitettu: jokainen osuus vie aikaa pituutensa mukaan kentällä - näytteenotettuna pinnalta pari metriä välein, joten kukkula tai portaikko kahden pisteen välissä lasketaan mukaan - sen hahmon liikkumis**tilan** nopeudella tässä pelissä, ja lisäksi mahdollisen **odotuksen** reittipisteessä. Jalkaväki ryömii, kyykkii, kävelee (hiljaa), juoksee tai sprintaa; ajoneuvot ja veneet ryömivät, menevät varovasti, normaalisti tai syöksyvät; ilma-alukset ja helikopterit lentävät hitaasti, risteilynopeudella, taistelunopeudella tai maksimilla. Tila, jota pelissä ei ole (CS2:ssa ei ole sprinttiä), ottaa lähimmän, jonka pelillä on. Miten rinne hidastaa, riippuu pelistä: CS2:ssa ja Valorantissa lasketaan vain vaakasuuntainen matka, kuten peleissä; sotasimulaattorit hidastavat jalkaväkeä ylämäessä (Toblerin vaellusfunktio) ja ajoneuvoja kaltevuuden mukaan.

Nopeudet tulevat pelikohtaisista taulukoista lähteineen (katso [Liikkumisnopeudet](tactics-speeds.md)): CS2 pidetyn aseen mukaan pelin aseiden määrittelyistä; Valorant aseen mukaan; Battlefield, Squad, Arma ja ilmapelit ajoneuvotyypin ja -luokan mukaan. **Liikkuu kuten** valitsee hahmon profiilin (aseen, ajoneuvotyypin); **Oma (m/s)** ohittaa minkä tahansa tilan kyseiselle hahmolle. Tilat on nimetty kuten taulu ne näyttää: *Ryömintä*, *Kyykky*, *Kävely (hiljaa)*, *Juoksu*, *Sprintti*; *Varovainen*, *Normaali*, *Syöksy*; *Hidas*, *Risteily*, *Taistelu*, *Maksimi*.

Jokainen reittipiste näyttää ajan edellisestä ja ajan suunnitelman alusta ("+3,9 s · 0:12"). Valitun hahmon reitti luettelee jokaisen osuuden tilansa, pituutensa ja aikansa, odotuksen ja saapumisen. **Saapumiset** kohdassa **Ajanotto** asettaa jokaisen reititetyn hahmon yhdelle aikajanalle, ensimmäinen saapuja ylimpänä. Kun **Toista reaaliajassa** on päällä (oletuksena), vaihe kestää, kunnes hitain reitti saapuu, ja jokainen hahmo liikkuu omalla nopeudellaan; **Sekuntia** on silloin vaiheen lyhin pituus. **Kentän yksikköä metrissä** kertoo, mitä kenttä on: 39,37 CS2-kartoille (pelin yksiköt), 1 metrikartoille.

## Vertailu otteludataan {#compare-with-match-data}

**Lataa ottelutiedostot…** lukee kartan CS2-ottelutaulukot (CS2-työkalun Parquet-tiedostot, niin monta kuin haluat; vain tarvittavat sarakkeet, taustalla); **Käytä ladattua dataa** ottaa katselimeen ladatun datan. Sen jälkeen:

- **Aikaisin saapuminen kartalla** värittää kartan sen mukaan, kuinka kauan kierroksen alusta pelaaja saavutti kunkin paikan ensimmäisen kerran - painike **Nopein** näyttää nopeimman kaikista kierroksista, **Tyypillinen (mediaani)** keskimmäisen kierroksen - vihreästä varhain punaiseen myöhään, toiselle tai molemmille puolille. Se näyttää, mitä on mahdollista ja milloin.
- Valittu reitti verrataan siihen, mitä pelaajat saavuttivat sen alusta (tai kierroksen alusta) sen loppuun; kumpikin pää on asetetun säteen kiekko: "Nopein havaittu 14,2 s, p10 15,0 s, mediaani 18,3 s 41 ajosta; suunnitelmasi 15,1 s".
- Nopeudet, joilla pelaajat todella liikkuivat - juoksu, kävely, kyykky, taulukoiden kävely- ja kyykkysarakkeista - m/s-yksikössä.

## Vaiheet {#steps}

Näkymän alla oleva palkki sisältää vaiheet. Suunnitelma alkaa yhdestä; **+** lisää yhden, ja jokainen hahmo alkaa siitä, missä sen reitti edellisessä vaiheessa päättyi; **−** poistaa näytetyn. **Sekuntia** on, kuinka kauan näytetty vaihe kestää toistettaessa. **▶** (K) toistaa näytetystä vaiheesta loppuun: reitin omaavat hahmot kulkevat sen, seuraavassa vaiheessa uuteen paikkaan siirretyt liukuvat sinne, ja loput seisovat. Kun vaihe on näkyvissä, jokaisen hahmon paikka seuraavassa vaiheessa piirretään himmeänä haamuna, ja edellisen vaiheen nuolet himmeästi tämän vaiheen alla.

## Tallentaminen {#saving}

**Tiedosto**-osio sisältää **Tallenna**, **Avaa** ja **Tyhjennä**. **Tallenna** kirjoittaa suunnitelman tiedostoon `<name>.h3dplan.json` (tavallinen JSON: puolet, vaiheet, hahmot paikalla per vaihe, nuolet, alueet, muistiinpanot); **Avaa** lukee sen takaisin. Toisen version tiedosto tai tiedosto, joka ei ole suunnitelma, hylätään syyn kanssa. **Tyhjennä** tyhjentää suunnitelman; Kumoa palauttaa sen.

## Hahmot {#figures}

Katselin rakentaa jokaisen hahmon itse: yksinkertaisia muotoja tyypin julkaistuun kokoon, lisättynä piirteillä, jotka erottavat sen naapureistaan - panssarivaunun telapyörät ja torni, ilmatorjuntaajoneuvon aseet, ohjukset ja tutkat, koneen siiven muoto, pyrstö ja moottorit, helikopterin roottorit ja tukisiivet. Mitään ei oteta pelistä. Pelin keksimä muotoilu näytetään sen luokan yleisenä hahmona. Katso [Hahmot](figures.md#which-figure-a-unit-gets), miten data löytää hahmonsa.

## Riotin ilmoitus {#riots-notice}

Valorant-kartat näytetään Riot Gamesin "Legal Jibber Jabber" -käytännön mukaisesti, joka sallii ilmaiset yhteisöprojektit käyttää niitä ja pyytää tätä ilmoitusta aina, kun niitä näytetään: *3DHeat on luotu Riot Gamesin "Legal Jibber Jabber" -käytännön mukaisesti käyttäen Riot Gamesin omistamia aineistoja. Riot Games ei hyväksy tai sponsoroi tätä projektia.* Taulun kyvyt ovat yleisiä muotoja, eivät Riotin taidetta.
