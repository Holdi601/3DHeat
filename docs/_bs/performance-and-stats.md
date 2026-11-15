---
title: "Panel performansi i statistika"
parent: "Interno renderovanje"
nav_order: 7
lang: "bs"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Panel performansi i prikaz statistike

Okvir u gornjem desnom uglu pogleda pokazuje koliko se preglednik trudi: koliko sličica u sekundi, koliko tačaka crta i da li još dotjerava sliku. Panel **Performanse** vam dozvoljava da kvalitet slike zamijenite za brzinu.

## Prikaz statistike {#the-stats-overlay}

Okvir u gornjem desnom uglu pogleda na karticama Mapa toplote i Meč ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Čita živo očitavanje motora pri svakoj sličici animacije.

![Prikaz statistike na sceni mnogo mečeva, sa numerisanim oznakama: 1 Backend, 2 FPS, 3 Sličica, 4 Redovi u prozoru, 5 Sprajtovi / sličica, 6 Budžet, 7 Rezolucija toplote, 8 Pokrivenost](../assets/img/en/performance-stats-overlay.webp)

| Red | Značenje |
|---|---|
| **Backend** | *WebGPU* ili *WebGL2*. Zadržite miš za razlog zašto WebGPU nije korišten, kad nije. Vidi [Dva backenda](backends.md). |
| **FPS** | Sličice u sekundi, prosječno u najmanje 0,4 s. |
| **Sličica** | Vrijeme sličice u ms, izglađeno (90% prethodno, 10% novo). Ovo je vrijeme između sličica, a ne vrijeme GPU-a; vrijeme po prolazu GPU-a se ne mjeri. |
| **Redovi u prozoru** | Kandidat redovi: redovi u tekućem vremenskom prozoru, prije filtriranja po redu u shaderu. |
| **Sprajtovi / sličica** | Sprajtovi koje je plan zadnje sličice poslao (zadržava planiranu vrijednost na praznim sličicama, koje ništa ne crtaju). |
| **Budžet** | Budžet sprajtova po kojem je ova sličica isplanirana: vrijednost adaptivnog kontrolera, podignuta na sve kandidate kad se crta svaki red. |
| **Rezolucija toplote** | Rezolucija bafera toplote kao udio platna: postavka *Rezolucija toplote* pomnožena adaptivnom skalom drugog stepena. |
| **Pokrivenost** | Koliko je progresivna akumulacija stigla do korištenja svakog reda: procenat dok konvergira (žuto), *tačno* kad je gotovo. Bučna sličica se nikad ne uzima kao završena slika. |
| **Kocke** | Kutije nacrtane u [replay kutija](box-replay.md). |
| **Nije u memoriji** | Prikazuje se samo kad redovi nisu stali u GPU budžet: koliko ih je. Vidi [Rezidentnost u GPU memoriji](gpu-memory.md). |

## Prikaz brzine {#the-speed-display}

U donjem desnom uglu pogleda, samo u perspektivi: brzina letenja i vrijeme da se pređe podatak tom brzinom. Prevucite ga da promijenite brzinu. Vidi [Kamera](camera.md#fly-speed).

## Ako je preglednik spor {#if-the-viewer-is-slow}

Pogledajte prikaz statistike, pa:

1. **Redovi u prozoru znatno veći od Sprajtovi / sličica, a Pokrivenost ispod 100%**: sličica ne može nacrtati sve; konvergira kroz nekoliko sličica kad miruje. Suzite prozor, filtrirajte ili odsijecajte da smanjite kandidate; ili prihvatite uzorkovanje.
2. **Sprajtovi / sličica jednaki Redovima u prozoru, a sličica i dalje spora**: trošak je po sprajtu na ekranu: smanjite *Najveći radijus u pikselima* ([Oblik sprajta](sprite-shape.md#pixel-clamps)) ili *Rezolucija toplote*.
3. **Sporo sa malo redova**: vjerovatno nivo: velik broj struktura sa uključenim ivicama, podne trouglove, dubinsko zamućenje. Vidi [Izgled nivoa](level-appearance.md).
4. **Sve sporo i crveni baner**: softversko renderovanje ([Otkrivanje softverskog renderovanja](software-rendering.md)).

## Panel Performanse {#the-performance-panel}

| Kontrola | Zadano | Učinak |
|---|---|---|
| Napomena | | Svaka sličica rasipa stratifikovani slučajni podskup vidljivih redova, sa težinom skaliranom da kompenzuje, pa je očekivana toplota tačna na bilo kojem budžetu; držanje pogleda mirnim nastavlja spajanje sličica dok svaki red ne doprinese. |
| **Crtaj svaki red u svakoj sličici** | uključeno | Svaka sličica koja počinje novu procjenu crta svaki kandidat red (do otprilike 268 miliona); budžet ispod postaje donja granica. [Uzorkovanje i budžeti](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Prilagodljivi budžet** | uključeno | Podešava sprajtove po sličici, pa rezoluciju toplote, da održi ciljnu brzinu sličica, i prestaje sa smanjivanjem kad smanjivanje ne pomaže. [Uzorkovanje i budžeti](sampling-and-budgets.md#the-adaptive-budget) |
| **Ciljni FPS** | 60 | 20-240 (1000 sa ručicom). Vrijednosti ispod 15 tretiraju se kao 15. |
| **Početni sprajtovi / sličica** / **Sprajtovi / sličica** | 4.00M | 65.536-268.435.456, logaritamski. Zove se *Početni* dok je adaptivni uključen, jer ga kontroler pomjera. |
| **Rezolucija toplote** | 100% | 25-100%. Trošak fragmenata raste s kvadratom: 50% smanjuje posao miješanja na četvrtinu, a polje toplote je dovoljno glatko da se to jedva vidi. |
| **Progresivno izoštravanje** | uključeno | Akumulira kroz sličice dok pogled miruje. Isključeno prikazuje procjenu jedne sličice svaki put. [Akumulacija](accumulation.md) |
| **Budžeti resursa** | otkriveno | Budžeti RAM-a, GPU-a i niti parsera. [Memorija i budžeti](memory-and-budgets.md#resource-budgets) |

Ništa od ovoga se ne čuva; ponovno učitavanje vraća zadane vrijednosti.
