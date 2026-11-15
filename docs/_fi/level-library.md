---
title: "Kenttäkirjasto"
parent: "Kentät ja taustageometria"
nav_order: 4
lang: "fi"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Kenttäkirjasto

Kirjasto säilyttää kenttäsi tässä selaimessa, joten sinun ei tarvitse ladata ja yksinkertaistaa niitä uudelleen. **Sivuston tietojen tyhjentäminen selaimessa poistaa kirjaston, eikä sitä voi viedä ulos.** Säilytä alkuperäiset tiedostosi.

Kentän käsittely (jäsennys, luokittelu, hitsaus, harventaminen, tekstuurien pakkaus) on hidasta, ja tulos on aina sama. **Kirjasto** Taustan / kentän paneelin alareunassa säilyttää käsitellyt kentät tässä selaimessa. Harvennettua verkkoa ei siis rakenneta kahdesti ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Tallenna ja lataa kenttä uudelleen {#save-and-reload-a-level}

1. Lataa karttakuva tai 3D-malli ja tarkista, että se näyttää oikealta.
2. Paina **Tallenna kirjastoon**. Paneeli sanoo *Saved. It will load instantly next time.*
3. Seuraavalla kerralla avaa **Kirjasto**-luettelo ja paina kentän kohdalla ▸.
4. Paina ✕ poistaaksesi merkinnän, jota et enää tarvitse.

## Käyttö {#using-it}

| Säädin | Vaikutus |
|---|---|
| **Tallenna kirjastoon** | Tallentaa nykyisen kentän. Karttakuva tallennetaan PNG-kuvana sen kahdella ankkurilla. Malli tallennetaan käsiteltyinä puskureina. Paneeli sanoo *Saved. It will load instantly next time.* |
| Kirjastoluettelo | Yksi rivi per tallennettu kenttä: nimi (tallennettu koko näkyy osoitettaessa), mallilla kolmioiden määrä tai kuvalla leveys pikseleinä. |
| ▸ (*Load*) | Lataa merkinnän nykyiseksi kentäksi. |
| ✕ (*Delete*) | Poistaa merkinnän. |
| Käyttörivi | `Using X of Y.`: selaimen tallennustilan arvio tälle sivustolle. |

Kun mitään ei ole tallennettu, luettelo sanoo *Empty. Load a map or model, then "Save to library".*

## Mitä tallennetaan {#what-is-stored}

| Laji | Tallennetaan | Ei tallenneta |
|---|---|---|
| Karttakuva | Kuva (PNG), sen koko, sen ankkurit | Korkeus, peilaus, läpinäkyvyys, kirkkaus, värittömyys: palautuvat oletuksiin (korkeus = nykyisen aineiston pienin Y, peilaus päällä) |
| 3D-kenttä | Kärjet, kärkivärit, tekstuurikoordinaatit, niiden laatat ja tekstuuriatlas, maan / rakennelmien / veden kolmiot, rakennelmien reunat, kolmiomäärät | Osien nimet ja luokitteluperustelut sekä jokainen ulkoasun asetus: palautuvat tuoreen tuonnin oletuksiin |

Kirjastosta ladattu malli ei sisällä osaluetteloa. Sen rajat ja maan korkeusvyöhyke lasketaan uudelleen sen kärjistä.

## Missä se on {#where-it-lives}

Selaimen IndexedDB:ssä, tietokanta `3dheat`, objektivarasto `levels`, sivun alkuperälle (selaimen osoitepalkin osoite). Se on paikallinen kyseiselle selainprofiilille. Toinen selain, toinen profiili tai toinen osoite (esimerkiksi `localhost` `127.0.0.1`:n sijaan) näkee eri, tyhjän kirjaston. Sivuston tietojen tyhjentäminen selaimessa poistaa sen. Vanhemmilla versioilla ilman rakennelmia, värejä tai vettä tallennetut merkinnät latautuvat yhä.
