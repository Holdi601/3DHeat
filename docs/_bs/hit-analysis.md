---
title: "Analiza pogodaka (kartica Vozila)"
parent: "Reprodukcija"
nav_order: 4
lang: "bs"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# Analiza pogodaka

Kartica **Vozila** pokazuje gdje je jedan tenk, brod ili vojnik bio pogođen i od koga. Koristi je da vidiš koja strana tenka biva gađana, ili koji neprijatelj nanosi štetu.

## Isprobaj {#try-it}

1. Učitaj meč koji ima pogotke (tabela ispod pokazuje koje igre ih daju).
2. Otvori karticu **Vozila** na vrhu.
3. Pod **Vozilo** izaberi jedinicu, na primjer vrstu tenka. Broj u zagradi je koliko pogodaka je primila.
4. Čitaj figuru: svaka oznaka je pogodak, postavljen tamo gdje je udario.
5. Otvori **Ko je pogodio** da vidiš strijelce, oružja ili vozila strijelaca, s pogocima, štetom, ubistvima i daljinom.

![Kartica Vozila: demo tenk s oznakama pogodaka, i otvoren Ko je pogodio](../assets/img/en/hit-analysis-tank.webp)

Ako ništa nije učitano, ili podaci nemaju pogotke na vozilima, kartica kaže šta nedostaje i koji konverter koristiti.

```
        strijelac ----> o  oznaka pogotka na figuri
        strijelac ----> o
  [ figura tenka ]
```

Figura prikazuje pogotke tamo gdje podaci daju tačku ili dio tijela. Raščlamba (ko je pogodio, čim, koliko jako, sa koje daljine) radi za svaki izvor.

## Šta svaki izvor daje {#what-each-source-gives}

| Izvor | Tačka na jedinici | Strijelac | Oružje | Šteta / ishod |
|---|---|---|---|---|
| War Thunder | da, u okviru jedinice, s putanjom metka | da | vozilo strijelca | kritičan, težak, moduli uništeni, smrtonosni pogodak |
| CS2 | dio tijela (hitgroup) | da | da | šteta, oklop, preostalo zdravlje |
| World of Tanks | da (kutija komponente, ulaz i izlaz) | da | - | šteta ili nijedna (odskok, nema probijanja) |
| World of Warships | da, u okviru broda | da | vrsta pogotka | - |
| Squad | vozila: da - udar postavljen u okvir vozila iz njegove vlastite pozicije i smjera | ne (podaci ne imenuju nijednog) | vrsta štete | pad zdravlja vozila u tom trenutku, uništeno |
| Squad vojnici | ne: rezultati pogodaka (kost i tačka udara) se konverter čuva sirovo; redovi `impact` s `hitBone` se čitaju čim ih konverter upiše | | | samo rane i smrti |
| Arma (OCAP, snimač Arme 3) | ne: OCAP bilježi ko je koga pogodio ili ubio, čim, s koje daljine, a ne gdje | da | da | pogodak ili ubistvo, daljina |
| Tacview ACMI | da, gdje objekat oružja završi u 30 m od jedinice (ne lanser): njegovo posljednje mjesto u okviru jedinice (smjer, nagib, valjanje), dolazeći putanjom kojom je letio | `Parent` oružja | ime oružja, ili AmmoType Timeout-a | Outcome Timeout-a, padovi `Health`, `Destroyed`; bez oružja, ubistvo ili šteta bez tačke |
| IL-2 telemetrija (Watcher) | da: događaji `hit` / `damage` nose tačku u okviru sopstvenog aviona igrača (uzeto kao x naprijed, y gore, z desno) | ne | ne | sila |
| Dota 2 | ne: borbeni dnevnik nema mjesto na heroju | napadajuća jedinica | sposobnost ili predmet (nijedno: napad) | šteta, smrt heroja |
| Battlefield 6 (GameCapture) | ne: snimanje čita feed ubistava (ubistva, smrti, oznaka pogotka u glavu), ne pogotke | | | |
| DCS / ostali Watcher live izvori | nema događaja pogodaka osim onoga što čuvaju njihovi Tacview snimci | | | |

Gdje nijedan pogodak jedinice nema tačku, figura ne pokazuje oznake, a raščlamba **Ko je pogodio** se sama otvara: po strijelcu, oružju ili vozilu strijelca, svaki sa svojim pogocima, štetom i ubistvima, te medijanom i najdaljom daljinom.

## Ograniči na područje {#restrict-to-an-area}

Odjeljak **Područje** ograničava analizu na pogotke koji su se desili na nekom mjestu na karti.

1. Pritisni **Nacrtaj pravougaonik** ili **Nacrtaj poligon**, i crtaj na 3D tlu ili taktičkoj karti.
2. Izaberi **Žrtva unutra** (broji pogodak kada je pogođena jedinica bila u području) ili **Strijelac unutra** (kada je onaj koji je pucao bio).
3. Pritisni **Koristi kao filter**. Čipovi pokazuju „{n} od {total} pogodaka u području".
4. **Poništi područje** uklanja sva područja.

Svako područje je [zapremina](volumes.md), pa isti oblici filtriraju i toplinsku kartu i reprodukciju. Područje može uključivati ili isključivati (isključujuće područje ostavlja svoje pogotke van, prikazano kao „{n} od {total} pogodaka van područja"). Svako područje se prikazuje kao čip s brojem pogodaka jedinice unutra; × na čipu ga uklanja. Brojevi, figura, raščlamba i spiskovi filtera svi slijede.

Mjesta pogodaka: red iz kojeg pogodak potiče sadrži mjesto jedne strane (žrtve za povrijeđen ili pogođen, strijelca za pucanj); mjesto druge je sopstveni uzorak te jedinice najbliži po vremenu (unutar 5 s). Pogodak čije mjesto strane nije poznato se izostavlja dok područje filtrira, a panel kaže koliko ih je („Izostavljeno, nepoznato mjesto").

## Za programere {#for-developers}

Svaki konverter može dodati pogotke: red žrtve (`hit`, `impact`, `hurt`, `wounded`) s `hitBone` (kost skeleta, izbor u Armi, zona pogotka u Reforgeru - mapirano na glavu, grudi, stomak, ruke i noge) ili `hitLocalX/Y/Z` (metri, x naprijed, y gore, z desno), s `other` kao strijelcem i `damage`.
