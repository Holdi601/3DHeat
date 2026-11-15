---
title: "Asetukset, yksiköt ja näppäimet"
nav_order: 16
lang: "fi"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: true
---

# Asetukset, yksiköt ja näppäimet

Sivupalkin yläosan pienet säätimet muuttavat tapaa, jolla katselin puhuu sinulle: kieltä, yksiköitä (metrit tai jalat, km/h tai solmut) ja ohjetilaa, joka selittää värit. Valintasi muistetaan selaimessasi.

## Ylätunniste {#the-header}

Sivupalkin yläosassa:

| Säädin | Mitä se tekee |
|---|---|
| **?** | Ohjetila: mitä jokainen väri tarkoittaa (myös `?` tai `F1`) |
| **Yksiköt**-valikko | Metrinen, Brittiläinen, Ilmailu tai Merenkulku |
| **...**-painike **Yksiköiden** vieressä | Avaa "Valitse yksikkö jokaiselle suureelle": yksi pudotusvalikko per suure |
| **Kieli**-valikko | Katselimen kieli: [40 kieltä](languages.md) tai selaimen kieli |

![Ylätunniste Yksiköt-valikko ja yksikkö-per-suure-ikkuna auki](../assets/img/fi/settings-units.webp)

Luvut, jotka kirjoitat kenttään, voivat käyttää joko pistettä tai pilkkua (`0.35` tai `0,35`). Katselin lukee molemmat ja näyttää luvut sillä tavalla, kuin katselimen kieli ne kirjoittaa.

## Yksiköt {#units}

1. Valitse esiasetus **Yksiköt**-valikosta. Kaikki suureet vaihtuvat yhdessä.
2. Vaihtaaksesi vain yhden suureen napsauta sen vieressä olevaa **...**-painiketta ja valitse yksikkö sille suureelle. Valikossa esiasetuksen perässä näkyy silloin `*`.
3. Suure, jota et ole asettanut, seuraa esiasetusta. Palaa valitsemalla "Esiasetuksen mukaan".

| Suure | Metrinen (oletus) | Brittiläinen | Ilmailu | Merenkulku |
|---|---|---|---|---|
| Matka | km | mi | NM | NM |
| Korkeus, pituus | m | ft | ft | m |
| Nopeus | km/h | mph | kt | kt |
| Pystynopeus | m/s | ft/min | ft/min | m/s |
| Lämpötila | °C | °F | °C | °C |
| Paine | hPa | inHg | hPa | hPa |
| Massa, polttoaine | kg, l | lb, gal | lb, gal | t, m³ |
| Kulma | astetta | astetta | astetta | astetta |

Muut yksiköt, joita voit valita yhdelle suureelle: matka km, mi, NM; nopeus km/h, m/s, kt, mph; pystynopeus m/s, ft/min, m/min; lämpötila °C, °F, K; paine hPa, inHg, mmHg, psi; massa kg, lb, t; kulma asteet tai NATO-milssit (6400 ympyrässä). Yksiköt ovat samat kaikkialla katselimessa: nimiöt, kortit, kaaviot ja tilastot.

## Ohjetila {#help-mode}

![Ohjetila: mitä värit tarkoittavat](../assets/img/fi/help.webp)

Paina `?` tai `F1` tai napsauta **?**-painiketta. Se näyttää *Mitä värit tarkoittavat*: selitteet 3D-näkymälle, lämpöliukumille, joukkueiden väreille, kentän väreille, paneelien tilavärit, ottelupaneelin ja kilpailunäkymän. Se pysyy päällä, kunnes kytket sen pois. Ottelu-välilehdessä se selittää myös ottelupaneelin värit.

![Ohjetila Ottelu-välilehdessä](../assets/img/fi/settings-help-match.webp)

## Mitä selain muistaa {#what-the-browser-remembers}

Nämä asetukset säilytetään selaimessasi käyntien välillä (mitään ei lähetetä minnekään):

- kieli, yksiköt ja ohjetila;
- toiston hahmo-, merkki-, nimiö-, kamera- ja taktisen näytön asetukset;
- toistonopeus ja peilaus;
- kirjanmerkit tallenteittain, tilavuudet aineistoittain, tavoitekerrokset;
- ulkoisen tekoälyn asetukset (avain vain, jos valitset *Muista*).

Lämpöasetukset, suodattimet ja tila alkavat alusta jokaisella latauksella. Koko luettelo, automaattisesti tuotettu: [Tallennetut asetukset](ref-settings-storage.md).

## Näppäimet, jotka katselin pitää selaimelta {#keys-the-viewer-keeps-from-the-browser}

Suuren datan istunnon lataaminen vie aikaa, joten katselin estää selainta hävittämästä sitä vahingossa:

- `Ctrl`/`Cmd` + kirjaimet, jotka tulostaisivat, tallentaisivat, avaisivat, lataisivat uudelleen, sulkisivat tai avaisivat uusia ikkunoita, eivät tee mitään tekstikenttien ulkopuolella; `F1`, `F3`, `F5`, `F6` ja `F7` eivät tee mitään.
- Välilehden sulkeminen tai uudelleenlataus, kun data tai kenttä on ladattuna, kysyy ensin.
- Koko näytön tilassa katselin lukitsee käyttämänsä näppäimet (W, T, N, S, R, P, Q, Esc), jotta selain ei ota niitä.

Tarkka luettelo: [Selaimen näppäimet](ref-browser-keys.md). Kaikki katselimen omat näppäimet: [Näppäimistön ja hiiren viite](keyboard-reference.md).
