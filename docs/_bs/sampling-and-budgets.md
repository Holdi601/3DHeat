---
title: "Uzorkovanje i budžeti"
parent: "Interno renderovanje"
nav_order: 3
lang: "bs"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Uzorkovanje i budžeti

Kada ima previše tačaka da se nacrtaju u jednom kadru, prikaz crta ravnomjeran uzorak i čini da svaka tačka broji više, pa slika ostaje tačna. Kontroler prilagođava koliko ih crta da prikaz zadrži svoj broj sličica u sekundi.

## Kontrole panela performansi {#performance-panel-controls}

| Kontrola | Zadano | Opseg (klizač) |
|---|---|---|
| **Crtaj svaki red u svakoj sličici** | uključeno | |
| **Prilagodljivi budžet** | uključeno | |
| **Ciljni FPS** | 60 | 20-240 (1000) |
| **Početni sprajtovi / sličica** (prilagodljivo) ili **Sprajtovi / sličica** | 4,00M | 65.536-268.435.456, logaritamski (268.435.456) |
| **Rezolucija toplote** | 100% | 25-100%, pomnoženo sa skalom druge faze prilagođavanja |
| **Progresivno izoštravanje** | uključeno | Isključeno: svaka sličica je nova procjena jedne sličice (korisno da vidiš sirovi uzorak). |

Vidi i [Panel performansi i pregled statistike](performance-and-stats.md).

## Za programere {#for-developers}

### Kandidatni redovi {#candidate-rows}

Redovi se čuvaju uzlaznim redom vremena. Prozor vremenske linije [*lo*, *hi*] postaje raspon redova s dvije binarne pretrage po koloni vremena ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); bez kolone vremena svaki red je kandidat. To su **Redovi u prozoru** pregleda statistike. Provjere po redu - filteri, grupe, podjela, odsijecanje, presjek, trajanje - dešavaju se kasnije, u shaderu; red koji ne prođe košta jedan poziv vertexa i nijedan fragment.

### Plan uzorkovanja {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) dijeli raspon kandidata na **blokove od 4.096 uzastopnih redova** i bira koliko da nacrta iz budžeta sprajtova sličice:

- Ako budžet pokriva svaki blok, svi se crtaju - sličica je tačna.
- Inače se blokovi uzimaju s ravnomjernim korakom preko raspona, pomjereni za drhtaj koji se svake sličice pomjera za zlatni presjek, pa uzastopne sličice pokrivaju različite blokove i unija se ravnomjerno popunjava. Ovo je **slojevit** uzorak: svaki dio vremenskog raspona je zastupljen u svakoj sličici.

Toplota svakog nacrtanog reda se množi s **kandidati / poslano**, pa je očekivana toplota sličice tačna pri svakom budžetu; samo šum zavisi od budžeta. Redovi žive u dijelovima od 8.388.608 (vidi [Upravljanje GPU memorijom](gpu-memory.md)); blok se dijeli gdje prelazi dio, a svaki dio dobija listu početaka blokova koje mora nacrtati.

Jedan plan može nositi najviše 65.536 blokova - 268.435.456 sprajtova - jer oba backenda drže bafer početaka blokova fiksne veličine od 65.536 mjesta. Zahtjev za više je tu ograničen, a manjak se iskreno pokazuje kao više sličica do konvergencije.

### Crtaj svaki red u svakoj sličici {#draw-every-row-each-frame}

**Performanse → Crtaj svaki red u svakoj sličici** (zadano **uključeno**): budžet postaje donja granica umjesto gornje, a sličica koja počinje novu procjenu crta svaki red za koji je odgovorna (do ograničenja od 268M).

Razlog: pomjeranje kamere odbacuje akumulaciju, pa je sličica u pokretu jedna procjena čiji šum zavisi od toga koliko je podataka nacrtala - ako je nacrtana četvrtina, vidiš četvrtinu u svijetlim ponderisanim tačkama, a upravo to čini da pogled u pokretu blista. Crtanje svega čini svaku sličicu gotovom slikom. Cijena je da vrijeme sličice sada prati veličinu podataka u prozoru; poluge su uži vremenski prozor, filteri ili odsijecanje po udaljenosti, koji smanjuju kandidate umjesto da ih uzorkuju tanje.

Isključi na hardveru koji ne može priuštiti cijelo polje odjednom: *Sprajtovi / sličica* tada je stvarno ograničenje, a prikaz konvergira kroz nekoliko mirnih sličica.

Šta cijeli plan košta, mjereno na visokokvalitetnoj desktop GPU kartici pri 4K platnu s velikim nivoom, sprajtovi poluprečnika 1 m (piksel ili dva): otprilike 100M sprajtova po sličici na 30 fps, 200M na 15 fps, a maksimum od 268M na oko 12 fps. Sa tako malim sprajtovima cijela cijena je faza vrhova, a rezolucija toplote ništa ne mijenja; sa velikim sprajtovima cijena je popunjavanje: 8M sprajtova poluprečnika 100 m trajalo je 2,5 s po sličici pri punoj rezoluciji toplote i 170 ms pri 25%. **Crtaj svaki red u svakoj sličici** zato počinje na 67M i raste za četvrtinu po sličici dok sličice traju manje od 150 ms, a prepolovljava se dok traju više od 400 ms, tako da teški pogled ne može gurnuti sličicu preko onoga što dopušta watchdog GPU-a.

### Prilagodljivi budžet {#the-adaptive-budget}

**Performanse → Prilagodljivi budžet** (zadano uključeno) podešava budžet sprajtova da zadrži **Ciljni FPS** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). U reprodukciji kutije i tokom renderovanja videa miruje.

Ulaz je vrijeme sličice, izglađeno (90% prethodno + 10% novo, uz pojedinačne sličice ograničene na 2 s), naspram cilja od 1000 / max(15, ciljni FPS) ms.

**Prva faza - sprajtovi.** Svake sličice budžet se množi s `1 + (cilj / sličica - 1) × pojačanje`, s pojačanjem 0,35 kad je prespor i 0,08 kad ima rezerve, ograničeno na faktor 0,5-1,25 po sličici i na 65.536-268.435.456 sprajtova.

**Druga faza - rezolucija.** Tek kada je budžet već na donjoj granici, a sličice su i dalje više od 10% prespore, rezolucija bafera toplote pada za 8% po sličici, do 25% platna; oporavlja se za 4% po sličici dok ima 30% rezerve. Trošak popunjavanja pada s kvadratom rezolucije, što je pod glatkom rampom gotovo nevidljivo. (Mjereno na softverskom renderovanju s 10M redova i prevelikim sprajtovima: 141 ms → 17 ms po sličici.) Razmjera se zaokružuje na šesnaestine; *Rez. toplote* u pregledu to pokazuje.

**Odustajanje.** Spora sličica izgleda isto bez obzira na to da li su je izazvali sprajtovi ili težak nivo - nema vremenskog mjerenja po prolazu. Ako budžet ostane na donjoj granici, a sličice ostaju ispod 70% cilja 30 sličica, sprajtovi nisu bili trošak: kontroler prelazi na **penjanje**, množeći budžet sa 1,5 svakih 14 sličica i vraćajući rezoluciju, sve dok vrijeme sličice ostaje unutar 1,5× onoga što je bilo na donjoj granici. Penjanje koje pogorša stvari više od toga vraća se na 60% i nastavlja normalnu kontrolu; dostizanje cilja završava penjanje.

Kada je prilagodljivi budžet isključen, budžet je jednostavno **Sprajtovi / sličica**.

Kada je *Crtaj svaki red u svakoj sličici* uključeno, prilagodljivi budžet i dalje radi, ali tačno pravilo podiže budžet da pokrije sve kandidatne redove, pa u praksi kontroliše samo fazu rezolucije i sličice koje ne počinju novu procjenu.
