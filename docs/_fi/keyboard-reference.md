---
title: "Näppäimistön ja hiiren viite"
parent: "Kamera ja ohjaimet"
nav_order: 2
lang: "fi"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Näppäimistö ja hiiri

Kaikki näppäimet ja hiiritoiminnot yhdessä paikassa, jotta löydät tarvitsemasi. Napsauta ensin näkymää, niin se saa näppäimistön. Näppäimet eivät toimi, kun tekstikenttä tai pudotusvalikko on valittuna. Lyhyt versio on myös näkymän vasemmassa alareunassa.

Pikahaku:

| Haluan ... | Paina |
|---|---|
| lentää | `W A S D`, vedä katsoaksesi |
| nähdä kaiken | `F` |
| toistaa tai pysäyttää | `K` |
| toistaa taaksepäin | `J` (paina uudelleen pysäyttääksesi), eteenpäin `L` |
| nähdä, mitä värit tarkoittavat | `?` tai `F1` |
| perua Taktiikka-välilehdessä | `Ctrl+Z` |

## Kamera {#camera}

Lähde: [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Syöte | Vaikutus |
|---|---|
| `W` / `↑` | Eteenpäin katselusuuntaan |
| `S` / `↓` | Taaksepäin |
| `A` / `←` | Sivuttain vasemmalle |
| `D` / `→` | Sivuttain oikealle |
| `Space` / `E` | Ylös |
| `Q` / vasen `Ctrl` | Alas |
| `Shift` (kumpi tahansa) | Pidä pohjassa: 6-kertainen nopeus |
| vasen `Alt` | Pidä pohjassa: 15 % nopeus |
| Vasen tai oikea vedos näkymässä | Katso (osoitin lukittuu, kun painike on pohjassa) |
| Rulla (perspektiivi) | Lentonopeus ×1,5 per askel (enintään 4 askelta per rullatapahtuma) |
| Rulla (rinnakkainen) | Zoomaus |
| Oikea napsautus | Ei avaa valikkoa näkymän päällä |

## Yleiset {#global}

Lähde: [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Näppäin | Vaikutus |
|---|---|
| `K` | Toista tai pysäytä [aikajana](timeline.md) |
| `F` | Sovita data näkymään |
| `C` | Kopioi kameran sijainti, kääntökulma ja nyökkäyskulma ([kameran lukema](camera.md#camera-readout)) |
| `G` | Mene kirjoitettuun pisteeseen: avaa ruudun kameran lukeman alla |
| `Esc` | Sulje valintakortti; sitten lopeta toisen yksikön katselu; sitten lopeta yksikön seuraaminen |
| `T` | Taktisen näytön ulkoasu päälle tai pois ([Ottelun toisto](match-replay.md#display-style)) |
| `?` / `F1` | Ohjetila: mitä värit tarkoittavat ([Asetukset, yksiköt ja näppäimet](settings.md#help-mode)) |
| `1` | [Lämpö](heat.md) |
| `2` | [Erotus](difference.md) |
| `3` | [Joukkuelämpö](team-heat.md) |
| `4` | [Viivat](line-heat.md) |
| `]` | Kaukoleikkauksen raja ulos ×1,12 (`Shift`: ×1,35) |
| `[` | Kaukoleikkauksen raja sisään ÷1,12 (`Shift`: ÷1,35) |
| `\` | Kaukoleikkauksen raja pois / takaisin päälle siihen kohtaan, jossa se oli ([Syvyys ja leikkaus](depth-and-culling.md#keyboard)) |

**Hahmot päällekkäin** -tilalla ei ole numeronäppäintä; valitse se tilapalkista tai avaa Ottelu-välilehti. Numeronäppäimet kulkevat saman tarkistuksen kautta kuin tilapalkki: näppäin tilalle, jonka tilapalkki näyttää lataamattomalle datalle epäsaatavilla, ei tee mitään.

## Ottelun toisto {#match-replay}

Hahmot päällekkäin -tilassa, jota Ottelu-välilehti käyttää ([Ottelun toisto](match-replay.md)). Ne toimivat, kun yksikköä seurataan tai ei, paitsi jos toisin mainitaan:

| Näppäin | Vaikutus |
|---|---|
| `B` | Lisää kirjanmerkki: hetki ja kamera |
| `M` | 2D-kartta: kulmanäkymä, koko näkymä, pois |
| `V` / `Shift+V` | Seuratun yksikön seuraava / edellinen kameranäkymä |
| `H` | Head-up-näyttö ohjaamo- ja padlock-näkymissä |
| `Page Down` / `Page Up` | Seuraava / edellinen tapahtuma niistä tyypeistä, joita tapahtumaluettelo näyttää |
| `J` | Toista taaksepäin; uudelleen, niin pysäyttää |
| `L` | Toista eteenpäin; uudelleen, niin pysäyttää |
| `.` / `,` | Sekunti eteenpäin / taaksepäin, pysäytettynä (`Shift`: kymmenen sekuntia) |
| `Esc` | Lopeta kohteen katselu ensin, sitten seuraaminen |
| `Ctrl`+napsautus tai `Alt`+napsautus yksikköä (näkymässä tai yksikköluettelossa) | Katso sitä seuratun yksikön näkökulmasta (kahden yksikön näkymä); napsauta uudelleen, niin se poistuu |
| `Shift`+napsautus kahta yksikköä | Mittaa niiden välinen suunta, etäisyys ja korkeusero |

`V` tarvitsee seuratun yksikön. `M` on tässä 2D-kartta, ja Taktiikka-välilehdessä se on "siirto".

## Yksikön seuraaminen {#following-a-unit}

Kun kamera seuraa yksikköä, rulla ja lentonäppäimet ohjaavat yksikön ympärillä eivätkä lennä vapaasti ([Kamera](camera.md#while-following-a-unit)):

| Syöte | Vaikutus |
|---|---|
| Rulla, `W` / `S` | Lähemmäs / kauemmas (ylempää / alempaa satelliittinäkymässä). Ei ohjaamo- eikä padlock-näkymissä. |
| `A` / `D`, `Q` / `E` | Kierrä yksikön ympäri (takaa- ja kiertonäkymät) |
| Vedä | Katso yksikön ympärille; ohjaamossa katso sen sisällä |
| `V` / `Shift+V` | Seuraava / edellinen kameranäkymä |
| `H` | Head-up-näyttö (ohjaamo- ja padlock-näkymät) |
| `Esc` | Lopeta toisen yksikön katselu, sitten seuraaminen |

## Taktiikkataulu {#tactics-board}

Taktiikka-välilehdessä ([Taktiikkataulu](tactics-board.md)). `F`, `C`, `G` ja `T` toimivat kuten yllä; numeronäppäimet eivät tee mitään.

| Näppäin | Vaikutus |
|---|---|
| `Ctrl+Z` | Kumoa |
| `Ctrl+Y` tai `Ctrl+Shift+Z` | Tee uudelleen |
| `Enter` | Lopeta piirrettävä nuoli (kaksoisnapsautus tai oikea napsautus tekee saman) |
| `Esc` | Peru vedos; muuten pudota nuoli tai meneillään oleva siirto; muuten poista valinta |
| `Delete` tai `Backspace` | Poista valinta |
| `W` / `E` / `R` | Siirto / kierto / skaalaus -gizmo valinnalle (näppäinjärjestys **W / E / R**) |
| `G` / `R` / `S` | Siirto / kierto / skaalaus -gizmo valinnalle (näppäinjärjestys **G / R / S**) |
| `R` | Kun mitään ei ole valittu: kääntää seuraavaksi sijoitettavaa hahmoa 15°. `Shift+R` kääntää sen takaisin. |
| `M` | Kun hahmo on valittu: siirtää sen seuraavaan napsautukseen |
| `K` | Toista tai pysäytä suunnitelma |
| Shift+napsautus | Lisää valintaan tai poista siitä |
| Shift+vedos | Piirrä laatikko valittavien ympärille |
| `Ctrl` kahvaa vedettäessä | Kiinnittyy ruudukkoon tai kulmaportaaseen |

Gizmo-näppäimet toimivat vain, kun jotain on valittuna; kun mitään ei ole valittu, `W A S D` lentävät kameraa kuten tavallisesti.

## Napsautus poimii {#click-to-pick}

Kun **Napsautus näyttää, mitä siinä on** on päällä ja viivain pois ([Napsautus poimii](camera.md#click-to-pick)):

| Syöte | Vaikutus |
|---|---|
| Vasen napsautus (ilman yli 4 px vetämistä) | Näyttää datapisteen tai kohdan kentällä, joka on osoittimen alla |

## Mitta {#measure}

Kun **Viivain käytössä** on päällä ([Mitta](measure.md)):

| Syöte | Vaikutus |
|---|---|
| Vasen napsautus (ilman yli 4 px vetämistä) | Pudottaa pisteen |
| Oikea napsautus | Poistaa viimeisen pisteen |

## Muualla {#elsewhere}

| Missä | Syöte | Vaikutus |
|---|---|---|
| Minkä tahansa liukusäätimen kahva (numeron vieressä oleva kahva) | Vedä ylös / alas | Muuttaa arvoa jatkuvasti, sitä nopeammin mitä pidemmälle vedät; pidä `Shift` pohjassa hienosäätöön. Vapauta lopettaaksesi. |
| Näytön nopeusnäyttö näkymän päällä | Vedä ylös / alas | Muuttaa lentonopeutta samalla tavalla. |
| Asentolaatikot | `Enter` | Ottaa kirjoitetun sijainnin tai suunnan käyttöön. |
| Käyrämuokkain | Kaksoisnapsautus / Alt-napsautus / oikea napsautus | Lisää pisteen / poistaa pisteen ([Sprite-muoto](sprite-shape.md#the-curve-editor)). |

## Kilpa-analyysi-välilehti {#race-analysis-tab}

Kisa-analyysi-välilehdessä `K` toistaa ja pysäyttää kisatoiston, `Home` kelaa sen alkuun, ja numeronäppäimet eivät tee mitään. Katso [Kisa-analyysi](race-analysis.md).

## Selaimen näppäimet, jotka katselija pitää itsellään {#keys-the-viewer-keeps-from-the-browser}

Jotkin selaimen pikanäppäimet sulkisivat tai lataisivat sivun uudelleen ja menettäisivät ladatun istunnon; katselija pitää ne itsellään. Luettelo on luotu koodista: [Selaimen näppäimet](ref-browser-keys.md).

## Ohjain {#gamepad}

Katso [Ohjain ja HOTAS](gamepad.md).
