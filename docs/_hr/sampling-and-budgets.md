---
title: "Uzorkovanje i proračuni"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 3
lang: "hr"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Uzorkovanje i proračuni

Kad ima previše točaka da bi se nacrtale u jednom kadru, prikaz crta ravnomjeran uzorak i čini da svaka točka vrijedi više, pa slika ostaje točna. Kontroler prilagođava koliko ih crta da prikaz zadrži svoju brzinu kadrova.

## Upravljači ploče izvedbe {#performance-panel-controls}

| Kontrola | Zadano | Raspon (klizanje) |
|---|---|---|
| **Crtaj svaki redak u svakom kadru** | uključeno | |
| **Prilagodljivi proračun** | uključeno | |
| **Ciljani FPS** | 60 | 20–240 (1000) |
| **Početni spriteovi / kadar** (prilagodljivo) ili **Spriteovi / kadar** | 4,00M | 65.536–268.435.456, logaritamski (268.435.456) |
| **Rezolucija topline** | 100% | 25–100%, množi se s prilagođenom skalom druge faze |
| **Progresivno pročišćavanje** | uključeno | Isključeno: svaki kadar je svježa procjena jednog kadra (korisno za vidjeti sirov uzorak). |

Pogledajte i [Ploču izvedbe i statistiku](performance-and-stats.md).

## Za razvojne programere {#for-developers}

### Kandidatni retci {#candidate-rows}

Retci su spremljeni rastućim redom vremena. Prozor vremenske crte [*lo*, *hi*] postaje raspon redaka s dva binarna pretraživanja po stupcu vremena ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); bez stupca vremena svaki redak je kandidat. To su **Retci u prozoru** u statistici. Provjere po retku (filtri, grupe, podjela, odsijecanje, isječak, trajanje) događaju se kasnije, u shaderu; redak koji ne prođe košta jedan poziv vrha i nijedan fragment.

### Plan uzorkovanja {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) dijeli raspon kandidata na **blokove od 4096 uzastopnih redaka** i bira koliko će ih nacrtati iz proračuna spriteova kadra:

- Ako proračun pokriva svaki blok, crtaju se svi: kadar je točan.
- Inače se blokovi uzimaju u ravnomjernom koraku preko raspona, s pomakom koji se svakim kadrom pomiče za zlatni omjer, pa uzastopni kadrovi pokrivaju različite blokove, a zbroj se ravnomjerno popunjava. To je **stratificiran** uzorak: svaki dio vremenskog raspona zastupljen je u svakom kadru.

Toplina svakog nacrtanog retka množi se s **kandidati / poslani**, pa je očekivana toplina kadra točna pri svakom proračunu; samo šum ovisi o proračunu. Retci žive u dijelovima od 8.388.608 (pogledajte [Zauzeće GPU memorije](gpu-memory.md)); blok se dijeli kad prijeđe granicu dijela, a svaki dio dobiva popis početaka blokova koje mora nacrtati.

Jedan plan može nositi najviše 65.536 blokova, odnosno 268.435.456 spriteova, jer oba pozadinska sustava drže fiksni spremnik početaka blokova s 65.536 mjesta. Zahtjev za više se tu ograničava, a manjak se iskazuje iskreno kao više kadrova do konvergencije.

### Crtaj svaki redak u svakom kadru {#draw-every-row-each-frame}

**Izvedba → Crtaj svaki redak u svakom kadru** (zadano **uključeno**): proračun postaje donja granica, a ne gornja, i kadar koji započinje svježu procjenu crta svaki redak za koji je odgovoran (do ograničenja 268M).

Razlog: pomak kamere odbacuje akumulaciju, pa je pokretni kadar jedna procjena čiji šum određuje koliko je podataka nacrtao. S četvrtinom nacrtanom vidite četvrtinu u svijetlim ponderiranim točkama, a upravo to čini da se pokretan pogled svjuca. Crtanje svega čini svaki kadar gotovom slikom. Trošak je to što vrijeme kadra sada prati veličinu podataka u prozoru; poluge su uži vremenski prozor, filtri ili odsijecanje po udaljenosti, koji smanjuju kandidate umjesto da ih uzorkuju rjeđe.

Isključite na hardveru koji ne može priuštiti cijelo polje odjednom: *Spriteovi / kadar* tada je stvarno ograničenje, a prikaz konvergira kroz nekoliko mirnih kadrova.

Što koštaju puni plan, mjereno na vrhunskoj desktop GPU kartici na 4K platnu s velikom razinom, spriteovi polumjera 1 m (piksel ili dva): otprilike 100M spriteova po kadru na 30 fps, 200M na 15 fps, a maksimum od 268M na oko 12 fps. Sa spriteovima tako malim cijeli trošak je faza vrhova, a rezolucija topline ništa ne mijenja; sa velikim spriteovima trošak je popunjavanje: 8M spriteova polumjera 100 m trajalo je 2,5 s po kadru pri punoj rezoluciji topline i 170 ms pri 25%. **Crtaj svaki redak u svakom kadru** zato počinje od 67M i pri svakom kadru raste za četvrtinu dok kadrovi traju manje od 150 ms, a prepolovljuje se dok traju više od 400 ms, tako da teški pogled ne može prekoračiti ono što čuvar GPU-a dopušta.

### Prilagodljivi proračun {#the-adaptive-budget}

**Izvedba → Prilagodljivi proračun** (zadano uključeno) podešava proračun spriteova tako da drži **Ciljani FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Miruje u reprodukciji kutije i pri renderiranju videa.

Ulaz je vrijeme kadra, izglađeno (90% prethodno + 10% novo, uz to da se pojedinačni kadrovi ograničavaju na 2 s), prema cilju od 1000 / max(15, ciljani FPS) ms.

**Prva faza - spriteovi.** Svakog kadra proračun se množi s `1 + (cilj / kadar - 1) × pojačanje`, uz pojačanje 0,35 kad je prespor i 0,08 kad ima rezerve, ograničeno na faktor 0,5–1,25 po kadru i na 65.536–268.435.456 spriteova.

**Druga faza - rezolucija.** Tek kad je proračun već na donjoj granici, a kadrovi su i dalje više od 10% prespori, rezolucija teksture topline pada za 8% po kadru, do 25% platna; oporavlja se za 4% po kadru dok ima 30% rezerve. Trošak fragmenata pada s kvadratom rezolucije, što je pod glatkom skalom gotovo nevidljivo. (Mjereno na softverskom renderiranju s 10M redaka i prevelikim spriteovima: 141 ms → 17 ms po kadru.) Skala se zaokružuje na šesnaestine; *Rez. topline* u prekrivnom prikazu pokazuje je.

**Odustajanje.** Spor kadar izgleda isto bez obzira na to jesu li ga uzrokovali spriteovi ili teška razina; vremena po prolazu nema. Ako proračun stoji na donjoj granici i kadrovi ostaju ispod 70% cilja 30 kadrova, spriteovi nisu trošak: kontroler prelazi na **penjanje**, množeći proračun s 1,5 svakih 14 kadrova i vraćajući rezoluciju, dok vrijeme kadra ostaje unutar 1,5× onoga što je bilo na donjoj granici. Penjanje koje pogorša stvari više od toga vraća se na 60% i nastavlja normalnu kontrolu; dostizanje cilja završava penjanje.

Kad je prilagodljivi proračun isključen, proračun je jednostavno **Spriteovi / kadar**.

Kad je *Crtaj svaki redak u svakom kadru* uključeno, prilagodljivi proračun i dalje radi, ali točno pravilo podiže proračun da pokrije sve kandidatne retke, pa u praksi kontrolira samo fazu rezolucije i kadrove koji ne započinju svježu procjenu.
