---
title: "Analiza pogodaka (kartica Vozila)"
parent: "Reprodukcija"
nav_order: 4
lang: "hr"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analiza pogodaka

Kartica **Vozila** prikazuje gdje je jedan tenk, brod ili vojnik pogođen i tko ga je pogodio. Koristite je da vidite koja se strana tenka pogađa ili koji neprijatelj nanosi štetu.

## Isprobajte {#try-it}

1. Učitajte meč koji ima pogotke (tablica dolje pokazuje koje igre ih daju).
2. Otvorite karticu **Vozila** na vrhu.
3. Pod **Vozilo** odaberite jednu jedinicu, na primjer vrstu tenka. Broj u zagradi je koliko je pogodaka primila.
4. Pročitajte sliku: svaka oznaka je pogodak, postavljen tamo gdje je udario.
5. Otvorite **Tko je pogodio** da vidite strijelce, oružje ili vozila strijelaca, s pogocima, štetom, ubojstvima i udaljenošću.

![Kartica Vozila: demo tenk s oznakama pogodaka i otvorenim Tko je pogodio](../assets/img/en/hit-analysis-tank.webp)

Ako ništa nije učitano ili podaci nemaju pogodaka na vozilima, kartica kaže što nedostaje i koji pretvarač koristiti.

```
        strijelac ----> o  oznaka pogotka na figuri
        strijelac ----> o
  [ figura tenka ]
```

Slika prikazuje pogotke tamo gdje podaci daju točku ili dio tijela. Raščlamba (tko je pogodio, čime, koliko jako, s koje udaljenosti) radi za svaki izvor.

## Što daje svaki izvor {#what-each-source-gives}

| Izvor | Točka na jedinici | Strijelac | Oružje | Šteta / ishod |
|---|---|---|---|---|
| War Thunder | da, u okviru jedinice, s putanjom hica | da | vozilo strijelca | kritično, teško, moduli uništeni, ubojiti hitac |
| CS2 | dio tijela (hitgroup) | da | da | šteta, oklop, preostalo zdravlje |
| World of Tanks | da (okvir komponente, ulaz i izlaz) | da | - | šteta ili nijedna (odbijanje, bez probijanja) |
| World of Warships | da, u okviru broda | da | vrsta pogotka | - |
| Squad | vozila: da - udar postavljen u okvir vozila iz njegova položaja i smjera | ne (podaci ne imenuju nijednog) | vrsta štete | pad zdravlja vozila u tom trenutku, uništeno |
| Squad vojnici | ne: rezultati pogotka (kost i točka udara) ostaju sirovi u pretvaraču; redci `impact` s `hitBone` čitaju se čim ih on zapiše | | | samo rane i smrti |
| Arma (OCAP, snimač Arma 3) | ne: OCAP bilježi tko je koga pogodio ili ubio, čime, s koje udaljenosti, a ne gdje | da | da | pogodak ili ubojstvo, udaljenost |
| Tacview ACMI | da, gdje objekt oružja završi unutar 30 m od jedinice (ne njezin lanser): njegovo zadnje mjesto u okviru jedinice (smjer, nagib, valjanje), dolazeći putanjom kojom je letio | `Parent` oružja | ime oružja, ili AmmoType Timeouta | Outcome Timeouta, padovi `Health`, `Destroyed`; bez oružja, ubojstvo ili šteta bez točke |
| IL-2 telemetrija (Watcher) | da: događaji `hit` / `damage` nose točku u okviru igračeva vlastitog zrakoplova (uzima se kao x naprijed, y gore, z desno) | ne | ne | sila |
| Dota 2 | ne: borbeni dnevnik nema mjesto na heroju | napadajuća jedinica | sposobnost ili predmet (ništa: napad) | šteta, smrt heroja |
| Battlefield 6 (GameCapture) | ne: snimanje čita feed ubojstava (ubojstva, smrti, zastavica pogotka u glavu), ne pogotke | | | |
| DCS / ostali Watcher live izvori | nema događaja pogodaka osim onoga što sadrže njihove Tacview snimke | | | |

Tamo gdje nijedan pogodak jedinice nema točku, slika nema oznaka, a raščlamba **Tko je pogodio** otvara se sama: po strijelcu, oružju ili vozilu strijelca, svaki s pogocima, štetom i ubojstvima, te s medijanom i najdaljom udaljenošću.

## Ograničite na područje {#restrict-to-an-area}

Odjeljak **Područje** ograničava analizu na pogotke koji su se dogodili na mjestu na karti.

1. Pritisnite **Nacrtaj pravokutnik** ili **Nacrtaj mnogokut** i crtajte na 3D tlu ili na taktičkoj karti.
2. Odaberite **Žrtva unutra** (broji pogodak kad je pogođena jedinica bila u području) ili **Strijelac unutra** (kad je onaj koji je pucao bio u njemu).
3. Pritisnite **Koristi kao filtar**. Čipovi pokazuju "{n} od {total} pogodaka u području".
4. **Poništi područje** uklanja sva područja.

Svako područje je [volumen](volumes.md), pa isti oblici filtriraju i toplinsku kartu i reprodukciju. Područje može uključivati ili isključivati (područje koje isključuje ostavlja svoje pogotke van, prikazano kao "{n} od {total} pogodaka izvan područja"). Svako područje prikazuje se kao čip s brojem pogodaka jedinice koji su u njemu; × na čipu uklanja ga. Brojke, slika, raščlamba i popisi filtra svi slijede.

Mjesta pogodaka: redak iz kojeg pogodak dolazi drži jednu stranu (žrtvinu za ozlijeđenog ili pogođenog, strijelčevu za hitac); drugu stranu predstavlja vlastiti uzorak te jedinice najbliži u vremenu (unutar 5 s). Pogodak čije mjesto strane nije poznato izostavlja se dok područje filtrira, a panel kaže koliko ih je ("Izostavljeno, nepoznato mjesto").

## Za razvojne programere {#for-developers}

Svaki pretvarač može dodati pogotke: redak žrtve (`hit`, `impact`, `hurt`, `wounded`) s `hitBone` (kost skeleta, odabir Arme, zona pogotka Reforgera - preslikano na glavu, prsa, trbuh, ruke i noge) ili `hitLocalX/Y/Z` (metri, x naprijed, y gore, z desno), s `other` kao strijelcem i `damage`.
