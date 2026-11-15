---
title: "Akumulacija"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 2
lang: "hr"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akumulacija

Kad prikaz ne može nacrtati svaku točku u jednom kadru, nacrta jedan dio, zatim drugi dio, i zbraja slike dok stojite mirno. Slika postaje sve jasnija, kao fotografija koja se razvija. Pomak kamere kreće ispočetka. Redak **Pokrivenost** prekrivnog prikaza statistike pokazuje koliko je to daleko.

![Prekrivni prikaz statistike: Pokrivenost pokazuje postotak dok se slika razvija, a *točno* kad je gotova](../assets/img/en/performance-stats-overlay.webp)

## Za razvojne programere {#for-developers}

Kad jedan kadar ne može nacrtati svaki redak, nacrta uzorak i ponderira ga; slika je tada nepristrana, ali bučna procjena. **Akumulacija** spaja uzastopne kadrove tako da procjena konvergira k točnom odgovoru dok se ništa ne mijenja. Svaki kadar bira jedan od pet načina ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); zadnji korišteni je na `engine.live.accumMode`.

| Način | Kad | Što se događa s akumulatorom |
|---|---|---|
| **reset** | kamera se pomaknula, nešto što mijenja polje se promijenilo, progresivno pročišćavanje je isključeno, počinje rastući prozor (prvi kadar reprodukcije, nakon skoka), ili se linijska toplina reproducirane putanje pomaknula | Zamijenjen procjenom ovog kadra. |
| **extend** | prozor s načinom **Kumulativno** koji je samo narastao od zadnjeg kadra | Ovaj kadar crta samo retke koji su upravo postali vidljivi, punom težinom, i dodaje ih. Ništa ne slabi. |
| **ema** | klizni prozor (**Prozor**, **Životni vijek**) se pomaknuo | `acc = acc × (1 - 0,34) + frame × 0,34` - eksponencijalni pomični prosjek od oko tri kadra. |
| **mean** | ništa se nije promijenilo, a procjena nije potpuna | `acc = acc × (1 - 1/n) + frame × 1/n` na *n*-tom kadru: tekući prosjek. |
| **skip** (miruje) | konvergirano i ništa se nije promijenilo | Ništa se ne crta; kadar se samo ponovno slaže. |

### Zašto svaki {#why-each}

- **Tekući prosjek, a ne zbroj.** Skaliranje spremnika s 1 - 1/n i dodavanje 1/n novog kadra algebarski je isto što i zbrajanje i dijeljenje s *n* na kraju, ali spremnik uvijek drži vrijednost jednog polja. Zbroj doseže *n* puta polje, a na 16-bitnoj meti zasiti se na 65.504; uz djelitelj koji stalno raste, mirni pogled bi se zatim blijedio što duže stoji, dok je pokretna kamera, koja se resetira svaki kadar, izgledala savršeno. Test dima potvrđuje da 16 spojenih kadrova drži 1,00× onoga što drži jedan kadar.
- **Extend za kumulativnu reprodukciju.** Retci koji su već akumulirani i dalje su vidljivi, pa kadru treba samo dio sekunde koji je upravo stigao, a on stane u jedan kadar, pa se upisuje točno. Ponovna procjena bi osvijetlila drugačiji slučajni podskup svakim kadrom i blijedila ga, što izgleda kao rafali koji blijeste i nestaju, a pauzirani kadar bi stalno dopunjavao. Test potvrđuje da se ukupno monotono penje tijekom reprodukcije i da se drži unutar 0,02% kroz 2,5 s pauze.
- **Pomični prosjek za klizne prozore.** Oni se stvarno mijenjaju svaki kadar. Fiksna težina miješanja prati pomični prozor (prosjek svih kadrova od početka reprodukcije zaostajao bi za glavom za reprodukciju) i mnogo je mirniji od početka ispočetka.
- **Reset za reproducirane linije.** Glave linijske topline pomiču se svaki kadar; pomični prosjek bi svaku razmazao u trag, pa se svaki kadar crta cijel, a blijeđenje repa je sama slika.
- **Djelomični kadrovi idu kroz privremenu metu.** Kadar spojen pri djelomičnoj težini nacrta se u zasebnu metu od nule, pa se tek onda miješa u akumulator, umjesto da se crta izravno s težinom 1/n. Izravno bi se svaki sprite dodao s 1/n veličine zbroja kojem se pridružuje, a poluprecizna meta to zaokruži - najgore tamo gdje je najgušće ([Akumulacija poluprecizne vrijednosti](half-float-accumulation.md)).

### Konvergencija {#convergence}

Plan za svaki kadar zna koliko ima kandidatnih redaka i koliko ih šalje, pa je broj kadrova potrebnih da pokriju svaki redak ⌈kandidati / poslani⌉. Kad je toliko kadrova spojeno, pogled je **konvergirao**: redak **Pokrivenost** prekrivnog prikaza statistike pretvara se iz postotka u *točno*, a daljnji kadrovi miruju. Uz uključeno **Crtaj svaki redak u svakom kadru** (zadano) jedan kadar obično pokriva sve, pa je konvergencija odmah, a progresivni mehanizam treba se samo kad prozor drži više redaka nego što jedan plan crtanja može nositi (oko 67 milijuna).

### Što ga ponovno pokreće {#what-restarts-it}

Postavke spadaju u tri skupine, ovisno o tome što akumulirani spremnik još znači nakon njihove promjene:

| Skupina | Mijenja | Učinak |
|---|---|---|
| **Geometrija** - koji redci doprinose i koliko | način prikaza; putanje linija; polumjer spritea, intenzitet u središtu i na rubu, opadanje, glatka skala, krivulja, ograničenja piksela, spljoštavanje; odsijecanje po udaljenosti blizu, daleko i ravninski; zakrivanje i skrivanje iza terena; isječak; veličina platna; rezolucija topline; vidljivost i predznaci grupa; podjela razlike; Sve / Reprodukcija; povijest; filtri stupaca i odabir Entiteta; pojačanje poluprecizne vrijednosti | Reset. |
| **Prozor** - raspon vremena | pomicanje glave za reprodukciju; rezervni Životni vijek i blijeđenje | Extend (kumulativno) ili pomični prosjek (klizno). |
| **Kompozicija** - samo bojanje | zasićenje, odziv gustoće, minimalna toplina, skale boja; rezanje razine; mreža i osi; postavke reprodukcije kutija i sesija; dubina polja | Ponovno crtanje bez diranja topline. |

Pomak kamere uvijek resetira. Dakle povlačenje zasićenja ili skale je besplatno; povlačenje polumjera spritea ponovno pokreće konvergenciju na svakom koraku.
