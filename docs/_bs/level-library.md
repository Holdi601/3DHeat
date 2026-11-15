---
title: "Biblioteka nivoa"
parent: "Nivoi i geometrija pozadine"
nav_order: 4
lang: "bs"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteka nivoa

Biblioteka čuva vaše nivoe u ovom pregledaču, pa ih ne morate ponovo učitavati i pojednostavljivati. **Brisanje podataka sajta u pregledaču briše biblioteku, a izvoza nema.** Sačuvajte svoje originalne datoteke.

Obrada nivoa (parsiranje, klasifikacija, spajanje, smanjivanje broja trouglova, pakovanje tekstura) je spora, a rezultat je uvijek isti. **Biblioteka** na dnu panela Pozadina / nivo čuva obrađene nivoe u ovom pregledaču, pa se smanjena mreža nikad ne pravi dvaput ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Sačuvajte i ponovo učitajte nivo {#save-and-reload-a-level}

1. Učitajte sliku karte ili 3D model i provjerite da izgleda tačno.
2. Pritisnite **Spremi u biblioteku**. Panel kaže *Sačuvano. Sljedeći put će se učitati odmah.*
3. Sljedeći put otvorite listu **Biblioteka** i pritisnite ▸ na nivou.
4. Pritisnite ✕ da obrišete unos koji vam više ne treba.

## Korištenje {#using-it}

| Kontrola | Učinak |
|---|---|
| **Spremi u biblioteku** | Čuva tekući nivo. Slika karte se čuva kao PNG sa dva sidra; model kao svoji obrađeni baferi. Panel kaže *Sačuvano. Sljedeći put će se učitati odmah.* |
| Lista biblioteke | Jedan red po sačuvanom nivou: ime (sa sačuvanom veličinom pri zadržavanju miša), trouglovi za model ili širina u pikselima za sliku. |
| ▸ (*Učitaj*) | Učitava unos kao tekući nivo. |
| ✕ (*Obriši*) | Uklanja unos. |
| Red zauzeća | `Koristi X od Y.`: procjena pregledačkog skladišta za ovaj sajt. |

Kad ništa nije sačuvano, lista kaže *Prazno. Učitajte kartu ili model, pa "Spremi u biblioteku".*

## Šta se čuva {#what-is-stored}

| Vrsta | Čuva se | Ne čuva se |
|---|---|---|
| Slika karte | Slika (PNG), njena veličina, njena sidra | Visina, preokret, neprozirnost, svjetlina, odzasićenost - vraćaju se na zadane vrijednosti (visina = najniži Y tekućeg skupa podataka, preokret uključen) |
| 3D nivo | Vrhovi, boje vrhova, koordinate teksture, njihove pločice i atlas tekstura, trouglovi tla / struktura / vode, ivice struktura, brojevi trouglova | Imena dijelova i razlozi klasifikacije, i svaka postavka izgleda - vraćaju se na zadane vrijednosti svježeg uvoza |

Model učitan iz biblioteke nema listu dijelova, a njegove granice i pojas visine tla se ponovo računaju iz njegovih vrhova.

## Gdje živi {#where-it-lives}

U IndexedDB pregledača, baza `3dheat`, objektno skladište `levels`, za porijeklo stranice (adresa u adresnoj traci pregledača). Lokalna je za taj profil pregledača: drugi pregledač, drugi profil ili druga adresa (na primjer `localhost` umjesto `127.0.0.1`) vidi drugu, praznu biblioteku. Brisanje podataka sajta u pregledaču briše je. Unosi sačuvani u starijim verzijama bez struktura, boja ili vode se i dalje učitavaju.
