---
title: "Lista echipelor"
parent: "Filtre și instrumente"
nav_order: 2
lang: "ro"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Lista echipelor

Panoul **Echipe** te lasă să ascunzi o echipă sau să o pui pe o parte a unei comparații. Folosește-l ca să te uiți doar la Albaștri sau ca să întrebi „unde merg Albaștrii și Roșii nu?".

O *grupă* este o echipă sau o tabără, de exemplu Albaștri și Roșii ([Grupuri](sessions-persons-groups.md#group)). Panoul apare când setul de date are o coloană de grup; numărul de grupuri este în antetul lui. În modul Căldură pe echipe, bara laterală are și o secțiune numită **Vizualizare pe echipe**, cu setările ei; pagina aceasta acoperă lista **Echipe**.

## Ascunde o echipă {#hide-a-team}

1. Deschide **Echipe** în bara laterală.
2. Debifează caseta (*Vizibil*) a echipei de ascuns. Imaginea se actualizează imediat.
3. Apasă **Arată tot** ca să readuci fiecare echipă.

![Lista echipelor: Albaștri 5p, Roșii 5p, cu Arată tot](../assets/img/en/teams-list.webp)

## Fiecare rând {#each-row}

| Parte | Înseamnă |
|---|---|
| Caseta (*Vizibil*) | Arată sau ascunde grupul. |
| Mostra | Culoarea grupului: culoarea lui din [căldura pe echipe](team-heat.md) în modul Căldură pe echipe, culoarea de bază în celelalte moduri. |
| Nume | Eticheta grupului (eticheta completă la trecerea cursorului). |
| **+** / **-** (modul Diferență) | Pune grupul pe partea pozitivă sau negativă a [diferenței](difference.md); apasă din nou butonul activ ca să-l scoți de pe ambele părți. |
| `Np` (celelalte moduri) | Numărul de persoane al căror prim rând este în acest grup. |

![Modul Diferență: Albaștri pe partea +, Roșii pe partea -](../assets/img/en/teams-list-difference.webp)

## Butoane {#buttons}

| Buton | Efect |
|---|---|
| **Arată tot** | Face din nou vizibil fiecare grup. |
| **Împarte egal** (modul Diferență) | Prima jumătate a grupurilor (rotunjită în sus) pe +, restul pe -; aceeași împărțire cu care pornește fiecare încărcare. |

## Ce face ascunderea unui grup {#what-hiding-a-group-does}

- În **Căldură**, **Căldură pe echipe** și **Linii**, rândurile grupului nu contribuie cu nimic.
- În **Diferență**, un grup ascuns nu contribuie cu nimic, indiferent pe ce parte este, și nici când există o împărțire după altă coloană (vezi [Diferență](difference.md#for-developers)).
- În **suprapunerea de figuri**, persoanele al căror prim rând este în acel grup nu sunt desenate.
- În **Căldură pe echipe**, celelalte grupuri își păstrează culorile: nuanțele se atribuie din numărul total de grupuri, nu din cele vizibile, astfel încât două imagini rămân comparabile.

Schimbarea vizibilității repornește acumularea. La fiecare set de date nou, fiecare grup este din nou vizibil.

Indiciul panoului se schimbă după mod: în Diferență explică + și -; în Căldură pe echipe, că mostrele sunt culorile cu care desenează fiecare grup.
