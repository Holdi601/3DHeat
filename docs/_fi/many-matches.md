---
title: "Monta ottelua kerralla"
parent: "Replay"
nav_order: 2
lang: "fi"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: true
---

# Monta ottelua kerralla

**Monta ottelua kerralla** toistaa paljon otteluita toistensa päällä, jolloin näet, minne kunkin ottelun pelaajat yleensä menevät. Sen avulla voit verrata satoja tai tuhansia otteluita yhdessä kuvassa.

Jokainen ottelu alkaa omasta alustaan, ja sen yksiköt liikkuvat hahmoina. Tiedostot menevät suoraan näytönohjaimelle, eikä koko taulukkoa rakenneta, joten toisto on sujuva siellä, missä tavallinen lataus loppuisi muistista.

![Kymmenen panssarivaunuottelua päällekkäin, yksi väri ottelua kohden](../assets/img/fi/many-matches.webp)

## Käyttötapa {#how-to-use-it}

1. Avaa **Monta ottelua kerralla** Lämpökartta-sivupalkissa.
2. Paina **Tiedostot…** (valitse monta tiedostoa), **Kansio…** (kansio ja sen alikansiot) tai **Lisää kansio…** (lisää ladattuun).
3. Katselin vaihtaa hahmot päällekkäin -näkymään ja alkaa alusta. Paina **Toista**.

Jokainen tiedosto on yksi ottelu (tai sisältää useita). Parquet-tiedostot ja [`.3dheat`](container.md)-säiliöt käyvät. Tiedostossa täytyy olla sijainti-, aika- ja yksikkösarake; nimi-, tyyppi- ja puolisarakkeet säilytetään. Muut tiedostot sekä muuntimien sivutiedostot (lento, viestit, tapahtumat, chat, tavoitteet) ohitetaan. Tavallista taulukkoa varten katso [Datan lataaminen](getting-data-in.md).

## Asetukset {#settings}

| Asetus | Mitä se tekee |
|---|---|
| **Joukkueittain** / **Otteluittain** | Värjää puolen mukaan tai oman värin kullekin ottelulle. |
| **Merkitse, missä yksiköt kuolivat** | Merkki siihen, missä kukin yksikkö kuoli, 10 s, 30 s, 120 s tai kaikki tähän mennessä. |

Paneeli näyttää, kuinka monta ottelua, yksikköä, riviä ja sijaintia luettiin, käytetyn muistin ja latausajan. *Tilaa* on, kuinka monta sijaintia näytönohjaimelle vielä mahtuisi. *Hahmot alkaen* on koko näytöllä, jonka alapuolella yksikkö piirretään pienenä nuolena eikä hahmonaan.

Hahmojen ulkonäössä käytetään samoja säätimiä kuin [ottelun toistossa](match-replay.md#figures): **Hahmojen koko**, **Pienin hahmo näytöllä** ja **Etäältä**.

## Vinkit {#tips}

- Kun kaikki ei mahtuisi muistiin, sijainteja harvennetaan (vain joka muutaman metrin sijainti säilytetään), ja paneeli kertoo siitä.
- Lämmön tilat toimivat myös peittokuvan datalla.
- Tilastoihin tuhansista otteluista ilman piirtämistä katso [Massa-analyysi](mass-analysis.md).
