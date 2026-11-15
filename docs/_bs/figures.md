---
title: "Figure"
parent: "Reprodukcija"
nav_order: 3
has_children: true
lang: "bs"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figure

**Figura** je mali 3D model onoga što jedinica zaista jeste: tenk, mlaz, brod, vojnik. [Replay](match-replay.md) crta svaku jedinicu kao njenu figuru u pravoj veličini, umjesto kao običnu kutiju.

Ima oko 2.000 imenovanih vozila, aviona, brodova, oružja i vojnika, sve ih pravi sam preglednik.

![Tenkovi iz demo podataka nacrtani kao sopstvene figure](../assets/img/bs/replay-tanks.webp)

## Šta je u katalogu {#what-is-in-the-catalogue}

| Oblast | Primjeri |
|---|---|
| Ljudi | vojnik stoji, čuči, leži ničice; snajperista, protivtenkovski, medicinar, posada |
| Kopno | tenkovi, borbena vozila pješaštva, protivvazduhoplovna odbrana, artiljerija, kamioni i automobili, vozovi i tramvaji |
| Vazduh | lovci, jurišni avioni, bombarderi, transporti, helikopteri, od dvokrilaca do modernih mlaznjaka |
| More | ratni brodovi po klasi, nosači aviona, podmornice, čamci, trgovački brodovi |
| Oružje | rakete, raketni projektili, bombe, torpeda, baklje i reflektujuće trake |
| Oznake | dimne, bljeskalice i zapaljive granate, postavljene bombe, zastave, mjesta pojavljivanja, putne tačke |

## Kako se figure prave {#how-the-figures-are-made}

- **Prave se od objavljenih dimenzija.** Većina figura je napravljena pomoću sopstvenog graditelja figura u pregledniku, od javnih brojeva: dužina, širina, visina, točkovi na stazi, kupola i top, krila i rep. Njihov oblik se zatim podešava prema javnim fotografijama, crtežima i objavljenim dimenzijama. Nijedan model iz igara se ne koristi.
- **Besplatni modeli.** Nekoliko figura koristi besplatne 3D modele (CC0 ili CC BY) tamo gdje su vjernije, ponekad kombinovane sa izgrađenim trupom. Autori djela pod CC BY navedeni su na [Zasluge za figure](figure-credits.md); djela pod CC0 ne traže navođenje i nisu tamo navedena.
- Svaka figura ima punu, grubu i daleku verziju (nivoi detalja, LOD), pa se hiljade mogu nacrtati odjednom.

## Koju figuru jedinica dobija {#which-figure-a-unit-gets}

Preglednik gleda sopstvene kolone podataka:

1. **Imena**: kolone zvane *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ili *Figure* upoređuju se sa katalogom: tačno, kroz oko 4.000 aliasa (id-ovi jedinica iz nekoliko igara), po najdužem poznatom početku (`F-16C_50` je F-16C), ili po najkraćem imenu figure koje počinje tako.
2. Ime čija figura ne odgovara **tipu** jedinice se ne koristi (kamion zvan *Typhoon* nije lovac).
3. **Tipovi**: kolone zvane *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ili *Domain* daju figuru klase: Tacview oznake (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikone na karti, ili obične riječi (tank, helikopter, pješaštvo).
4. Podaci bez nijednog od njih su podaci o ljudima: svi su vojnici.

Zato je najlakši način da dobijete prave figure kolona `vehicle` sa pravim imenima, ili kolona `type` sa Tacview oznakama.

**Moja jedinica se prikazuje kao kutija ili vojnik.** Dodajte kolonu `vehicle` sa pravim imenom, ili kolonu `type` sa Tacview oznakom. Zadržite miš na jedinici da vidite koje je ime upareno. Podaci koji imaju takve kolone, ali ništa ne govore o jedinici, ostavljaju je kao kutiju; podaci bez ijedne od njih crtaju se kao vojnici.

## Postavke {#settings}

Odjeljak **Figure** u bočnoj traci replaya podešava veličinu, najmanju veličinu na ekranu, u šta se pretvaraju daleke jedinice (figura, strelica, simbol), i efekte koji se crtaju na njima. Vidi [Replay meča](match-replay.md#figures). Dim, vatra i drugi vremenski efekti: [Figure u sloju figura](figure-replay.md).

## Opcioni lokalni paket figura {#an-optional-local-figure-pack}

Na sopstvenom računaru možete držati opcioni paket sopstvenih figura. Njegove figure zamjenjuju figure iz kataloga istih imena. Nikad nije dio repozitorijuma ni objavljene verzije; bez njega se ništa ne mijenja.
