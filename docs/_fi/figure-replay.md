---
title: "Hahmot päällekkäin -näkymässä"
parent: "Hahmot"
grand_parent: "Toisto"
nav_order: 2
lang: "fi"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---


Tämä sivu kertoo, miten laatikot muutetaan pieniksi 3D-hahmoiksi, jotka kuvaavat kunkin yksikön todellista olemusta, ja savusta ja tulesta, joita hahmot jättävät jälkeensä. Toiston omat säätimet ovat sivulla [Ottelun toisto](match-replay.md).

[Laatikkotoistossa](box-replay.md) ja välilehden Ottelu hahmotoistossa **Hahmot laatikoiden sijaan** (oletuksena päällä) piirtää jokaisen elävän henkilön hahmona siitä, mikä hän on: jalkaisin kulkevan sotilaan, jonkun ajaman panssarivaunun tai lentokoneen, jonka Tacview-rata esittää. Hahmolla on laatikon väri, paikka ja suunta. Lentokoneilla ja ohjuksilla siinä on myös kallistus ja, jos datassa on Roll-sarake, kaarto. **Hahmojen koko** skaalaa ne. Yksi kerta on todellinen koko. Hahmoon napsauttaminen vastaa samoin kuin sen laatikkoon napsauttaminen.

## Mikä hahmo {#which-figure}

Datan omat nimi- ja tyyppisarakkeet päättävät. Kaikki säännöt sarakenimineen ovat sivulla [Hahmot](figures.md#which-figure-a-unit-gets). Data, jossa ei ole kumpaakaan sarakelajia, on ihmisten dataa: jokainen on sotilas.

Vastaavuus tallennetaan välimuistiin nimikkeen mukaan, joten kuva maksaa vain sijoittamisen. Datayksikkö on metri, ellei data kerro, kuinka suuri seurattu kohde on. Esimerkiksi CS2-vienti kertoo, että pelaaja on 32 yksikköä leveä. Hahmot skaalataan sen mukaan.

Oma paikallinen hahmopaketti voi korvata katalogin hahmot koneellasi. Katso [Hahmot](figures.md#an-optional-local-figure-pack).

## Efektit {#effects}

Tapahtumarivit, jotka jättävät jotain jäljelle hetkeksi, piirretään siihen paikkaan, jossa ne tapahtuivat, niin kauan kuin ne kestävät. Väri on sen väri, joka sai aikaan tapahtuman: savu (noin 18 s), molotov tai sytytyskranaatti (7 s), välähdys (noin sekunti) ja HE-räjähdys (alle sekunti), harhautus (15 s) ja asetettu pommi (40 s). Ne tulevat tapahtumasarakkeesta (Event, Events), jonka nimike on `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` tai `plant`. CS2-vienti kirjoittaa ne räjähdyksen hetkellä.

## Ottelun toisto: Tacviewn työkalut {#match-replay-tacviews-tools}

Kamerat, kirjanmerkit, taktinen näyttö, tilastot, nimiöt, **Pystyviivat**, tapahtumalista ja kaaviot-ikkuna on kuvattu sivulla [Ottelun toisto](match-replay.md). Sivu [Tacview-vastaavuus](tacview-parity.md) listaa jokaisen Tacview-ominaisuuden ja sen tilanteen.
