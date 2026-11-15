---
title: "Figure"
parent: "Replay"
nav_order: 3
has_children: true
lang: "bs"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: true
---

# Figure

**Figura** je mali 3D model onoga čime jedinica zaista jeste: tenk, mlaznjak, brod, vojnik. [Reprodukcija](match-replay.md) crta svaku jedinicu kao njenu figuru u pravoj veličini, umjesto obične kocke.

Ima oko 2.000 imenovanih vozila, aviona, brodova, oružja i vojnika, sve ih pravi sam prikazivač.

![Tenkovi iz demoa nacrtani kao sopstvene figure](../assets/img/bs/replay-tanks.webp)

## Šta je u katalogu {#what-is-in-the-catalogue}

| Oblast | Primjeri |
|---|---|
| Ljudi | vojnik stoji, čuči, leži; snajperista, protivoklopni, medicinar, posada |
| Kopno | tenkovi, borbena vozila pješadije, protivvazdušna odbrana, artiljerija, kamioni i auti, vozovi i tramvaji |
| Vazduh | lovci, jurišni avioni, bombarderi, transporti, helikopteri, od dvokrilaca do savremenih mlaznjaka |
| More | ratni brodovi po klasi, nosači aviona, podmornice, čamci, trgovački brodovi |
| Oružje | rakete, projektili, bombe, torpeda, mamci i čaff |
| Oznake | dimne, bljeskalice i zapaljive granate, postavljene bombe, zastave, spawnovi, putne tačke |

## Kako se figure prave {#how-the-figures-are-made}

- **Prave se iz objavljenih dimenzija.** Većinu figura pravi graditelj figura prikazivača iz javnih brojeva: dužina, širina, visina, točkovi, kupola i top, krila i rep. Njihov oblik se zatim podešava prema javnim fotografijama, crtežima i objavljenim dimenzijama. Ne koriste se modeli nijedne igre.
- **Besplatni modeli.** Nekoliko figura koristi besplatne 3D modele (CC0 ili CC BY) gdje su vjernije, ponekad kombinovane s izgrađenim trupom. Autori CC BY radova navedeni su na [Zaslugama za figure](figure-credits.md); CC0 radovi ne traže navođenje i nisu tamo navedeni.
- Svaka figura ima punu, grubu i udaljenu verziju (nivoi detalja, LOD), pa se hiljade mogu nacrtati odjednom.

## Koju figuru jedinica dobija {#which-figure-a-unit-gets}

Prikazivač gleda sopstvene kolone podataka:

1. **Imena** - kolone zvane *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ili *Figure* - upoređuju se s katalogom: tačno, kroz oko 4.000 aliasa (id-ovi jedinica iz više igara), po najdužem poznatom početku (`F-16C_50` je F-16C), ili po najkraćem nazivu figure koji počinje tako.
2. Ime čija figura ne odgovara **tipu** jedinice ne koristi se (kamion zvan *Typhoon* nije lovac).
3. **Tipovi** - kolone zvane *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ili *Domain* - daju figuru klase: Tacview oznake (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikone mapa ili obične riječi (tank, helikopter, pješadija).
4. Podaci bez ijedne od ovih su podaci o ljudima: svako je vojnik.

Dakle, najlakši način da dobijete prave figure je kolona `vehicle` sa pravim nazivima, ili kolona `type` s Tacview oznakama.

**Moja jedinica prikazuje se kao kutija ili vojnik.** Dodajte kolonu `vehicle` s pravim nazivom, ili kolonu `type` s Tacview oznakom. Zadržite pokazivač iznad jedinice da vidite koji naziv je uparen. Podaci koji imaju takve kolone, ali ne kažu ništa o jedinici, ostavljaju je kao kutiju; podaci bez ijedne od njih crtaju se kao vojnici.

## Postavke {#settings}

Odjeljak **Figure** u bočnoj traci reprodukcije postavlja veličinu, najmanju veličinu na ekranu, šta postaju udaljene jedinice (figura, strelica, simbol) i efekte nacrtane na njima. Vidi [Reprodukcija meča](match-replay.md#figures). Dim, vatra i drugi vremenski efekti: [Figure u preklapanju figura](figure-replay.md).

## Opcionalni lokalni paket figura {#an-optional-local-figure-pack}

Možete na svom računaru čuvati opcionalni paket sopstvenih figura. Njegove figure zauzimaju mjesto figura iz kataloga s istim nazivima. Nikada nije dio repozitorijuma ili objavljene verzije; bez njega ništa se ne mijenja.
