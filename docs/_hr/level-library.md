---
title: "Biblioteka razina"
parent: "Razine i geometrija pozadine"
nav_order: 4
lang: "hr"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Biblioteka razina

Biblioteka čuva tvoje razine u ovom pregledniku pa ih ne moraš ponovno učitavati i pojednostavljivati. **Brisanje podataka stranice u pregledniku briše biblioteku, a izvoz ne postoji.** Čuvaj izvorne datoteke.

Obrada razine - raščlanjivanje, klasifikacija, spajanje, pojednostavljivanje, pakiranje tekstura - spora je, a rezultat je uvijek isti. **Biblioteka** pri dnu ploče Pozadina / razina čuva obrađene razine u ovom pregledniku, pa se pojednostavljena mreža nikad ne gradi dvaput ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Spremi i ponovno učitaj razinu {#save-and-reload-a-level}

1. Učitaj sliku karte ili 3D model i provjeri da izgleda ispravno.
2. Pritisni **Spremi u biblioteku**. Ploča kaže *Spremljeno. Sljedeći put će se učitati odmah.*
3. Sljedeći put otvori popis **Biblioteka** i pritisni ▸ na razini.
4. Pritisni ✕ da izbrišeš unos koji ti više ne treba.

## Korištenje {#using-it}

| Kontrola | Učinak |
|---|---|
| **Spremi u biblioteku** | Sprema trenutnu razinu. Slika karte sprema se kao PNG s dva sidra; model kao svoji obrađeni bufferi. Ploča kaže *Spremljeno. Sljedeći put će se učitati odmah.* |
| Popis biblioteke | Jedan redak po spremljenoj razini: naziv (s njegovom spremljenom veličinom pri prelasku mišem), trokuti za model ili širina u pikselima za sliku. |
| ▸ (*Učitaj*) | Učitava unos kao trenutnu razinu. |
| ✕ (*Obriši*) | Uklanja unos. |
| Redak korištenja | `Using X of Y.` - procjena pohrane preglednika za ovu stranicu. |

Ako ništa nije spremljeno, popis kaže *Prazno. Učitaj kartu ili model, pa "Spremi u biblioteku".*

## Što se sprema {#what-is-stored}

| Vrsta | Spremljeno | Nije spremljeno |
|---|---|---|
| Slika karte | Slika (PNG), njezina veličina, njezina sidra | Nadmorska visina, okretanje, prozirnost, svjetlina, odzasićenje - vraćeno na zadane vrijednosti (nadmorska visina = najniži Y trenutnog skupa podataka, okretanje uključeno) |
| 3D razina | Vrhovi, boje vrhova, koordinate tekstura, njihove pločice i atlas tekstura, trokuti tla / građevina / vode, rubovi građevina, brojevi trokuta | Nazivi dijelova i razlozi klasifikacije, i svaka postavka izgleda - vraćeno na zadane vrijednosti svakog novog uvoza |

Model učitan iz biblioteke nema popis dijelova, a njegove granice i pojas visine tla ponovno se računaju iz njegovih vrhova.

## Gdje živi {#where-it-lives}

U IndexedDB pregledniku, baza `3dheat`, spremište objekata `levels`, za izvor stranice (adresa u adresnoj traci preglednika). Vezana je uz taj profil preglednika: drugi preglednik, drugi profil ili druga adresa (na primjer `localhost` umjesto `127.0.0.1`) vidi drugu, praznu biblioteku. Brisanje podataka stranice u pregledniku briše je. Unosi spremljeni u starijim verzijama bez građevina, boja ili vode i dalje se učitavaju.
