---
title: "Osumaanalyysi (Ajoneuvot-välilehti)"
parent: "Toisto"
nav_order: 4
lang: "fi"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Osumaanalyysi

**Ajoneuvot**-välilehti näyttää, mihin yhtä panssarivaunua, laivaa tai sotilasta osuttiin ja kuka osui. Sen avulla näet, mikä puoli panssarivaunusta saa osumia, tai kuka vihollinen tekee vahinkoa.

## Kokeile {#try-it}

1. Lataa ottelu, jossa on osumia (katso taulukosta, mitkä pelit antavat niitä).
2. Avaa **Ajoneuvot**-välilehti ylhäällä.
3. Valitse kohdassa **Ajoneuvo** yksikkö, esimerkiksi panssarivaunutyyppi. Suluissa oleva luku on, kuinka monta osumaa se otti.
4. Lue kuva: jokainen merkki on osuma, sijoitettuna sinne, mihin se osui.
5. Avaa **Kuka osui** nähdäksesi ampujat, aseet tai ampujien ajoneuvot osumineen, vahinkoineen, tappoineen ja etäisyyksineen.

![Ajoneuvot-välilehti: demo-panssarivaunu osumamerkkeineen ja Kuka osui auki](../assets/img/en/hit-analysis-tank.webp)

Jos mitään ei ole ladattu tai datassa ei ole ajoneuvoosumia, välilehti kertoo, mistä on pulaa ja mitä muunninta käyttää.

```
        ampuja ----> o  osumamerkki hahmossa
        ampuja ----> o
  [ panssarivaunuhahmo ]
```

Kuva näyttää osumat siinä, missä data antaa pisteen tai ruumiinosan. Erittely (kuka osui, millä, kuinka kovaa, kuinka kaukaa) toimii jokaisesta lähteestä.

## Mitä kukin lähde antaa {#what-each-source-gives}

| Lähde | Piste yksikössä | Ampuja | Ase | Vahinko / lopputulos |
|---|---|---|---|---|
| War Thunder | kyllä, yksikön koordinaatistossa, laukauksen suunnassa | kyllä | ampujan ajoneuvo | kriittinen, vakava, moduulit tuhoutuivat, tappava osuma |
| CS2 | ruumiinosa (hitgroup) | kyllä | kyllä | vahinko, panssari, jäljellä oleva terveys |
| World of Tanks | kyllä (komponenttilaatikko, sisään- ja ulostulo) | kyllä | - | vahinko tai ei mitään (pomppu, ei läpäisyä) |
| World of Warships | kyllä, laivan koordinaatistossa | kyllä | osumatyyppi | - |
| Squad | ajoneuvot: kyllä – isku sijoitettuna ajoneuvon koordinaatistoon sen omasta sijainnista ja suunnasta | ei (data ei nimeä) | vahinkotyyppi | ajoneuvon terveyden lasku sillä hetkellä, tuhoutui |
| Squad-sotilaat | ei: muunnin pitää osumatulokset (luu ja iskukohta) raakana; rivit `impact`, joissa on `hitBone`, luetaan heti kun muunnin kirjoittaa ne | | | vain haavat ja kuolemat |
| Arma (OCAP, Arma 3 -tallentaja) | ei: OCAP kirjaa, kuka osui tai tappoi ketä, millä ja kuinka kaukaa, ei missä | kyllä | kyllä | osuma tai tappo, etäisyys |
| Tacview ACMI | kyllä, kun aseen objekti päättyy 30 m:n sisään yksiköstä (ei sen laukaisijasta): sen viimeinen paikka yksikön koordinaatistossa (suunta, nousu, kallistus), tulemassa sitä kautta, mistä se lensi | aseen `Parent` | aseen nimi, tai Timeoutin AmmoType | Timeoutin Outcome, `Health`-laskut, `Destroyed`; ilman asetta tappo tai vahinko ilman pistettä |
| IL-2-telemetria (Watcher) | kyllä: `hit`- / `damage`-tapahtumat kantavat pisteen pelaajan oman koneen koordinaatistossa (x eteenpäin, y ylös, z oikealle) | ei | ei | voima |
| Dota 2 | ei: taistelulokissa ei ole paikkaa sankarilla | hyökkäävä yksikkö | kyky tai esine (ei mitään: hyökkäys) | vahinko, sankarin kuolema |
| Battlefield 6 (GameCapture) | ei: kaappaus lukee tappolistan (tappot, kuolemat, päänosumalippu), ei osumia | | | |
| DCS / muut Watcher-live-lähteet | ei osumatapahtumia sen lisäksi, mitä niiden Tacview-tallenteet sisältävät | | | |

Kun yksikön osumilla ei ole pistettä, kuva ei näytä merkkejä, ja **Kuka osui** -erittely avautuu itsestään: ampujan, aseen tai ampujan ajoneuvon mukaan, kukin osumineen, vahinkoineen ja tappoineen sekä mediaani- ja kaukaisin etäisyys.

## Rajaa alueeseen {#restrict-to-an-area}

**Alue**-osio rajaa analyysin osumiin, jotka tapahtuivat kartan tietyssä paikassa.

1. Paina **Piirrä suorakulmio** tai **Piirrä monikulmio** ja piirrä 3D-maan tai taktisen kartan päälle.
2. Valitse **Uhri sisällä** (laske osuma, kun osuman kohteena ollut yksikkö oli alueella) tai **Ampuja sisällä** (kun ampuja oli).
3. Paina **Käytä suodattimena**. Sirut näyttävät "{n} / {total} osumaa alueella".
4. **Nollaa alue** poistaa kaikki alueet.

Jokainen alue on [tilavuus](volumes.md), joten samat muodot suodattavat myös lämpökarttaa ja toistoa. Alue voi sisältää tai sulkea pois (sulkeva alue jättää osumansa pois, ja näkyy "{n} / {total} osumaa alueen ulkopuolella"). Jokainen alue näkyy sirunä, jossa on, kuinka monta yksikön osumaa oli siinä; sirun × poistaa sen. Luvut, kuva, erittely ja suodatinluettelot seuraavat kaikki.

Osuman paikat: rivi, josta osuma tuli, sisältää yhden osapuolen paikan (uhrin vahingoittuessa tai osuttaessa, ampujan laukauksessa); toisen osapuolen paikka on sen oma näyte, joka on lähinnä ajallisesti (5 s:n sisällä). Osuma, jonka osapuolen paikkaa ei tunneta, jätetään pois, kun alue suodattaa, ja paneeli kertoo montako ("Jätetty pois, ei tunnettua paikkaa").

## Kehittäjille {#for-developers}

Mikä tahansa muunnin voi lisätä osumia: uhrin rivin (`hit`, `impact`, `hurt`, `wounded`), jossa on `hitBone` (luuranko-luu, Arma-valinta, Reforger-osumavyöhyke – kartoitettu päähän, rintaan, vatsaan, käsiin ja jalkoihin) tai `hitLocalX/Y/Z` (metreinä, x eteenpäin, y ylös, z oikealle), `other` ampujana ja `damage`.
