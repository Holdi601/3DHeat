---
title: "Banebibliotek"
parent: "Baner og baggrundsgeometri"
nav_order: 4
lang: "da"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---

# Banebibliotek

Biblioteket gemmer dine baner i denne browser, så du ikke skal indlæse og forenkle dem igen. **Rydning af sitets data i browseren sletter biblioteket, og der er ingen eksport.** Gem dine originalfiler.

Behandling af en bane (parse, klassificering, sammensvejsning, decimering, pakning af teksturer) er langsomt, og resultatet er det samme hver gang. **Biblioteket** nederst i panelet Baggrund / bane gemmer behandlede baner i denne browser, så et decimeret net aldrig bygges to gange ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Gem og indlæs en bane igen {#save-and-reload-a-level}

1. Indlæs et kortbillede eller en 3D-model, og kontrollér, at den ser rigtig ud.
2. Tryk på **Gem i biblioteket**. Panelet siger *Gemt. Den indlæses med det samme næste gang.*
3. Næste gang: åbn listen **Bibliotek**, og tryk på ▸ ved banen.
4. Tryk på ✕ for at slette en post, du ikke længere har brug for.

## Brug {#using-it}

| Styring | Virkning |
|---|---|
| **Gem i biblioteket** | Gemmer den aktuelle bane. Et kortbillede gemmes som en PNG med sine to ankre. En model gemmes som sine behandlede buffere. Panelet siger *Gemt. Den indlæses med det samme næste gang.* |
| Bibliotekslisten | Én række pr. gemt bane: navn (med dens gemte størrelse ved musen over), trekanter for en model eller bredde i pixel for et billede. |
| ▸ (*Indlæs*) | Indlæser posten som den aktuelle bane. |
| ✕ (*Slet*) | Fjerner posten. |
| Forbrugslinje | `Bruger X af Y.`: browserens lagerestimat for dette site. |

Er intet gemt, siger listen *Tom. Indlæs et kort eller en model, og tryk derefter på "Gem i biblioteket".*

## Hvad der gemmes {#what-is-stored}

| Slags | Gemt | Ikke gemt |
|---|---|---|
| Kortbillede | Billedet (PNG), dets størrelse, dets ankre | Højde, spejling, opacitet, lysstyrke og afmætning. Disse gendannes til standardværdierne (højde = det aktuelle datasæts laveste Y, spejling til) |
| 3D-bane | Hjørner, hjørnefarver, teksturkoordinater, deres fliser og teksturatlasset, trekanter for jord, strukturer og vand, kanter på strukturer, antal trekanter | Delnavne og klassifikationsbegrundelser, og alle udseendeindstillinger. Disse gendannes til standardværdierne for en ny import |

En model indlæst fra biblioteket har ingen delliste. Dens grænser og højdebånd for jorden genberegnes ud fra dens hjørner.

## Hvor den ligger {#where-it-lives}

I browserens IndexedDB, databasen `3dheat`, objektlageret `levels`, for sidens oprindelse (adressen i browserens adressefelt). Den er lokal for den browserprofil: en anden browser, en anden profil eller en anden adresse (fx `localhost` i stedet for `127.0.0.1`) ser et andet, tomt bibliotek. Rydning af sitets data i browseren sletter det. Poster gemt af ældre versioner uden strukturer, farver eller vand indlæses stadig.
