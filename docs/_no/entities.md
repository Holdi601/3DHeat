---
title: "Objekter"
parent: "Filtre og verktøy"
nav_order: 3
lang: "no"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Enheter

**Enheter** lar deg velge én spiller (eller noen få) og bare se hvor den spilleren har vært. Bruk det til å følge din egen bevegelse eller én motstander.

Panelet vises når datasettet har en personkolonne. Overskriften viser antallet personer, eller `valgt av totalt` mens et utvalg er aktivt (en *person* er én spiller eller KI, se [ordlisten](glossary.md)).

## Velg en spiller {#pick-a-player}

1. Åpne **Enheter** i sidepanelet.
2. Skriv en del av navnet i søkeboksen.
3. Huk av spilleren. Overskriften viser for eksempel `2 av 10`, og alt annet forsvinner.
4. **Tøm** viser alle igjen.

![Enheter med to av ti spillere valgt](../assets/img/en/entities-selected.webp)

Utvalget viser bare de valgte personene, i varmemodusene (punkter, linjer, differanse, lagvarme) så vel som i sporene, figurene og sporene i [figurreplayet](box-replay.md). La den stå tom for å vise alle; å velge alle er det samme som å velge ingen.

## Panelet {#the-panel}

| Del | Betydning |
|---|---|
| Søkeboks | *Søk i N enheter...* - filtrerer listen etter en delstreng av navnet som ikke skiller store og små bokstaver. Viser `N treff`, eller `N treff, viser de første 200`; *Ingenting passer til "..."* når søket ikke finner noe. |
| Liste | Opptil 200 personer (de første 200 som passer), hver med en avkrysningsboks, en fargeprøve for personens farge, og navnet (*(uten navn)* for et tomt navn). |
| Hint for pågående | Når tiden spilles av, har listen de som *er i spill ved avspillingshodet*; et søk finner alle. |
| **KI (n)** | En sammenleggbar gruppe med de KI-styrte enhetene, adskilt fra spillerne. |
| **Legg til viste** | Legger alle som nå står i listen til utvalget. |
| **Bare viste** | Gjør utvalget nøyaktig til de som står i listen. |
| **Tøm** | Tømmer utvalget. |

## Grenser {#limits}

I varmen er utvalget et filter og bruker en av de fire [filterplassene](filters.md#rules). Når de andre filtrene allerede bruker alle fire, sier panelet *Ikke brukt på varmen: alle filterplasser er tatt. Figurreplayet viser fortsatt bare disse enhetene. Tøm et filter under Filtre for å frigjøre en.* Tøm et filter for å frigjøre en plass.

Utvalget tømmes ved hvert nytt datasett. Fanen Kamp setter det samme utvalget når den fokuserer en spiller.

## For utviklere {#for-developers}

Utvalget lagres som et *personer*-filter ([Filtre](filters.md#for-developers)). Maskeringen i shaderen holder 65 536 person-id-er; en person utover det tegnes ikke i varmen mens et utvalg er aktivt.
