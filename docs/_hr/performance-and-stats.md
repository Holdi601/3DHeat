---
title: "Ploča performansi i statistika"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 7
lang: "hr"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Ploča performansi i statistika

Okvir gore desno u pogledu pokazuje koliko se preglednik trudi: koliko kadrova u sekundi, koliko točkica crta i je li još pročišćava sliku. Ploča **Performanse** omogućuje da kvalitetu slike zamijeniš za brzinu.

## Prikaz statistike {#the-stats-overlay}

Okvir gore desno u pogledu na karticama Toplinska karta i Meč ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Čita motorovo trenutno očitanje pri svakom kadru animacije.

![Prikaz statistike na sceni s mnogo mečeva, s brojevima: 1 Pozadinski sustav, 2 FPS, 3 Kadar, 4 Retci u prozoru, 5 Spriteovi / kadar, 6 Proračun, 7 Rezolucija topline, 8 Pokrivenost](../assets/img/en/performance-stats-overlay.webp)

| Stavka | Značenje |
|---|---|
| **Pozadinski sustav** | *WebGPU* ili *WebGL2*. Pređi mišem za razlog zašto WebGPU nije korišten, ako nije. Vidi [Dva pozadinska sustava](backends.md). |
| **FPS** | Kadrova u sekundi, prosjek kroz najmanje 0,4 s. |
| **Kadar** | Vrijeme kadra u ms, zaglađeno (90% prijašnje, 10% novo). To je vrijeme između kadrova, a ne vrijeme GPU-a - vrijeme po prolazu GPU-a se ne mjeri. |
| **Retci u prozoru** | Kandidatski retci: retci u trenutnom vremenskom prozoru, prije filtriranja po retku u shaderu. |
| **Spriteovi / kadar** | Spriteovi koje je plan zadnjeg kadra poslao (ostaje na planiranoj vrijednosti u kadrima mirovanja, koji ništa ne crtaju). |
| **Proračun** | Proračun spriteova s kojim je ovaj kadar planiran - vrijednost prilagodljivog upravljača, podignuta na sve kandidate kad se crta svaki redak. |
| **Rezolucija topline** | Rezolucija međuspremnika topline kao udio platna: postavka *Rezolucija topline* puta prilagodljivo mjerilo druge faze. |
| **Pokrivenost** | Koliko je progresivna akumulacija stigla prema korištenju svakog retka: postotak dok konvergira (jantarno), *točno* kad je gotovo. Šumni kadar se nikad ne zamjenjuje za gotovu sliku. |
| **Kocke** | Kutije nacrtane u [preklapanju figura](box-replay.md). |
| **Nije u memoriji** | Prikazuje se samo kad retci nisu stali u proračun GPU-a: koliko ih je. Vidi [Boravak u memoriji GPU-a](gpu-memory.md). |

## Prikaz brzine {#the-speed-display}

Dolje desno u pogledu, samo u perspektivi: brzina leta i vrijeme za prelazak podataka pri toj brzini. Povuci je da promijeniš brzinu. Vidi [Kamera i upravljanje](camera.md#fly-speed).

## Ako je pogled spor {#if-the-viewer-is-slow}

Pogledaj prikaz statistike, pa:

1. **Retci u prozoru znatno veći od Spriteovi / kadar, Pokrivenost ispod 100%** - kadar ne može nacrtati sve; konvergira kroz nekoliko kadrova dok miruje. Suzi prozor, filtriraj ili odbaci da smanjiš kandidate; ili prihvati uzorkovanje.
2. **Spriteovi / kadar jednaki Retci u prozoru, kadar i dalje spor** - trošak je po spriteu na ekranu: smanji *Maksimalni radijus u pikselima* ([Oblik sprite-a](sprite-shape.md#pixel-clamps)) ili *Rezoluciju topline*.
3. **Spor pri malo redaka** - vjerojatno razina: velik broj struktura s uključenim rubovima, trokuti tla, dubinska oštrina. Vidi [Izgled razine](level-appearance.md).
4. **Sve sporo i crveni natpis** - softversko iscrtavanje ([Otkrivanje softverskog iscrtavanja](software-rendering.md)).

## Ploča performansi {#the-performance-panel}

| Kontrola | Zadano | Učinak |
|---|---|---|
| Savjet | | Svaki kadar nanosi slojevito slučajan podskup vidljivih redaka, s težinom skaliranom za kompenzaciju, pa je očekivana toplina točna pri svakom proračunu; držanje pogleda mirnim nastavlja spajanje kadrova dok svaki redak ne doprinese. |
| **Crtaj svaki redak u svakom kadru** | uključeno | Svaki kadar koji počinje svježu procjenu crta svaki kandidatski redak (do otprilike 268M); proračun ispod postaje donja granica. [Uzorkovanje i proračuni](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Prilagodljivi proračun** | uključeno | Podešava spriteove po kadru, pa rezoluciju topline, da zadrži ciljani broj kadrova u sekundi - i prestaje rezati kad rezanje ne pomaže. [Uzorkovanje i proračuni](sampling-and-budgets.md#the-adaptive-budget) |
| **Ciljani FPS** | 60 | 20-240 (1000 s ručkom). Vrijednosti ispod 15 tretiraju se kao 15. |
| **Početni spriteovi / kadar** / **Spriteovi / kadar** | 4,00M | 65.536-268.435.456, logaritamski. Zove se *Početni* dok je prilagodljivi proračun uključen, jer ga upravljač pomiče. |
| **Rezolucija topline** | 100% | 25-100%. Trošak fragmenata raste s kvadratom: 50% je četvrtina posla miješanja, a toplinsko polje je dovoljno glatko da se to jedva vidi. |
| **Progresivno pročišćavanje** | uključeno | Akumulira kroz kadrove dok pogled miruje. Isključeno prikazuje procjenu jednog kadra svaki kadar. [Akumulacija](accumulation.md) |
| **Proračuni resursa** | otkriveno | Proračuni RAM-a, GPU-a i niti parsera. [Memorija i proračuni](memory-and-budgets.md#resource-budgets) |

Ništa od ovoga se ne sprema; ponovno učitavanje vraća zadane vrijednosti.
