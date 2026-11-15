---
title: "Tasemete raamatukogu"
parent: "Tasemed ja taustgeomeetria"
nav_order: 4
lang: "et"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Taseme teek

Teek hoiab sinu tasemeid selles brauseris, nii et sa ei pea neid uuesti laadima ega lihtsustama. **Saidi andmete kustutamine brauseris kustutab teegi ja eksporti ei ole.** Hoia oma algsed failid alles.

Taseme töötlemine (parsimine, klassifitseerimine, liitmine, lihtsustamine, tekstuuride pakkimine) on aeglane ja tulemus on alati sama. Jaotise **Teek** all, taust/taseme paneeli allservas, hoitakse töödeldud tasemeid selles brauseris, nii et lihtsustatud võrku ei ehitata kunagi kahel korral ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Salvesta ja laadi tase uuesti {#save-and-reload-a-level}

1. Laadi kaardipilt või 3D mudel ja kontrolli, et see paistab õige.
2. Vajuta **Salvesta teeki**. Paneel ütleb *Salvestatud. Järgmisel korral laaditakse kohe.*
3. Järgmisel korral ava loend **Teek** ja vajuta tasemel ▸.
4. Vajuta ✕, et kustutada kirje, mida enam ei vaja.

## Kasutamine {#using-it}

| Juhtelement | Mõju |
|---|---|
| **Salvesta teeki** | Salvestab praeguse taseme. Kaardipilt salvestatakse PNG-na koos kahe ankruga; mudel oma töödeldud puhvritena. Paneel ütleb *Salvestatud. Järgmisel korral laaditakse kohe.* |
| Teegi loend | Üks rida salvestatud taseme kohta: nimi (salvestatud suurus hiirega peale viies), mudeli puhul kolmnurkade arv või pildi puhul laius pikslites. |
| ▸ (*Laadi*) | Laadib kirje praeguse tasemena. |
| ✕ (*Kustuta*) | Eemaldab kirje. |
| Kasutusrida | `Using X of Y.`: brauseri salvestusmahu hinnang sellele saidile. |

Kui midagi pole salvestatud, ütleb loend: *Tühi. Laadi kaart või mudel ja vajuta "Salvesta teeki".*

## Mis salvestatakse {#what-is-stored}

| Liik | Salvestatakse | Ei salvestata |
|---|---|---|
| Kaardipilt | Pilt (PNG), selle suurus, selle ankrud | Kõrgus, peegeldus, läbipaistmatus, heledus, värvuse vähendamine: taastatakse vaikeväärtustele (kõrgus = praeguse andmestiku madalaim Y, peegeldus sees) |
| 3D tase | Tippude, tippude värvid, tekstuuri koordinaadid, nende plaadid ja tekstuuri atlas, maapinna / struktuuride / vee kolmnurgad, struktuuride servad, kolmnurkade arvud | Osade nimed ja klassifitseerimise põhjused ning kõik välimuse seaded: taastatakse uue impordi vaikeväärtustele |

Teegist laaditud mudelil ei ole osade loendit ning selle piirid ja maapinna kõrguse vahemik arvutatakse uuesti tema tippudest.

## Kus see asub {#where-it-lives}

Brauseri IndexedDB-s, andmebaas `3dheat`, objektipood `levels`, lehe päritolu jaoks (aadress brauseri aadressiribal). See on kohalik selle brauseriprofiili jaoks: teine brauser, teine profiil või teine aadress (näiteks `localhost` `127.0.0.1` asemel) näeb teistsugust, tühja teeki. Saidi andmete kustutamine brauseris kustutab selle. Vanemate versioonide salvestatud kirjed ilma struktuuride, värvide ja veeta laaditakse ikka.
