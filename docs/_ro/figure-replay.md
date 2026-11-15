---
title: "Figurile din suprapunerea figurilor"
parent: "Figuri"
grand_parent: "Reluare"
nav_order: 2
lang: "ro"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figuri în suprapunerea de figuri

Pagina aceasta este despre transformarea cuburilor în mici figuri 3D ale a ceea ce era de fapt fiecare unitate, și despre fumul și focul lăsate în urmă de figuri. Comenzile redării în sine sunt la [Redarea meciului](match-replay.md).

În [redarea cutiilor](box-replay.md) și în redarea figurilor din fila Meciuri, **Figuri în loc de cuburi** (pornit implicit) desenează fiecare persoană vie ca figura a ceea ce este: un soldat pe jos, tancul pe care îl conduce cineva, aeronava la care se referă un traseu Tacview. Figura are culoarea, locul și direcția cutiei. Pentru aeronave și rachete are și înclinare și, unde datele au o coloană Roll, înclinare laterală. **Mărimea figurilor** le scalează; 1 înseamnă mărime reală. Clicurile pe o figură răspund ca și clicurile pe cutia ei.

## Ce figură {#which-figure}

Coloanele proprii ale datelor cu nume și tip decid. Regulile complete, cu numele coloanelor, sunt la [Figuri](figures.md#which-figure-a-unit-gets). Datele fără niciunul dintre cele două feluri de coloane sunt date despre oameni: toată lumea este soldat.

Potrivirea se ține în memorie pe etichetă, deci un cadru costă doar plasarea. O unitate din date este un metru, cu excepția cazului în care datele spun cât de mare este un lucru urmărit (exportul CS2 spune că un jucător are 32 de unități în lățime); figurile sunt scalate în consecință.

Un pachet opțional cu propriile figuri poate înlocui figurile din catalog pe calculatorul tău; vezi [Figuri](figures.md#an-optional-local-figure-pack).

## Efecte {#effects}

Rândurile de evenimente care lasă ceva în urmă pentru o vreme sunt desenate acolo unde s-au întâmplat, cât timp durează, în culoarea celui care le-a provocat: un fum (aproximativ 18 s), un molotov sau o incendiară (7 s), o lumină orbitoare (aproximativ o secundă) și o explozie HE (sub o secundă), o momeală (15 s), o bombă amplasată (40 s). Vin dintr-o coloană de evenimente (Event, Events) a cărei etichetă este `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` sau `plant` - exportul CS2 le scrie la detonare.

## Redarea meciului: uneltele Tacview {#match-replay-tacviews-tools}

Camerele, semnele de carte, afișarea tactică, statisticile, etichetele, **Linii verticale**, lista de evenimente și fereastra de grafice sunt descrise la [Redarea meciului](match-replay.md). [Paritatea cu Tacview](tacview-parity.md) listează fiecare funcție Tacview și unde se află.
