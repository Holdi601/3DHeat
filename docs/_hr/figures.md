---
title: "Figure"
nav_order: 11
has_children: true
lang: "hr"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figure

**Figura** je mali 3D model onoga čime jedinica stvarno jest: tenka, mlaznjaka, broda, vojnika. [Reprodukcija](match-replay.md) crta svaku jedinicu kao njezinu figuru u stvarnoj veličini, umjesto kao običnu kutiju.

Ima oko 2000 imenovanih vozila, zrakoplova, brodova, oružja i vojnika, a sve ih je izradio sam preglednik.

![Tenkovi iz demo podataka nacrtani kao vlastite figure](../assets/img/hr/replay-tanks.webp)

## Što je u katalogu {#what-is-in-the-catalogue}

| Područje | Primjeri |
|---|---|
| Ljudi | vojnik stoji, čuči, leži; snajperist, protuoklopni, medicinar, posada |
| Kopno | tenkovi, borbena vozila pješaštva, protuzračna obrana, topništvo, kamioni i auti, vlakovi i tramvaji |
| Zrak | lovci, jurišni zrakoplovi, bombarderi, transporti, helikopteri, od dvokrilaca do modernih mlaznjaka |
| More | ratni brodovi po klasi, nosači zrakoplova, podmornice, čamci, trgovački brodovi |
| Oružje | projektili, rakete, bombe, torpeda, mamci i pljevu |
| Oznake | dimne, bljeskalice i zapaljive granate, postavljene bombe, zastave, spawnovi, točke puta |

## Kako nastaju figure {#how-the-figures-are-made}

- **Izrađene iz objavljenih dimenzija.** Većinu figura izrađuje vlastiti graditelj figura preglednika iz javnih brojeva: duljina, širina, visina, kotači, kupola i top, krila i rep. Njihov oblik se zatim podešava prema javnim fotografijama, crtežima i objavljenim dimenzijama. Ne koriste se modeli nijedne igre.
- **Besplatni modeli.** Nekoliko figura koristi besplatne 3D modele (CC0 ili CC BY) tamo gdje su istinitiji, ponekad kombinirane s izrađenim trupom. Autori CC BY radova navedeni su na [Zasluge za figure](figure-credits.md); CC0 radovi ne traže navođenje i nisu tamo popisani.
- Svaka figura ima punu, grubu i daleku verziju (razine detalja, LOD), pa se tisuće mogu crtati odjednom.

## Koju figuru jedinica dobiva {#which-figure-a-unit-gets}

Preglednik gleda stupce samih podataka:

1. **Imena** - stupci pod nazivima *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ili *Figure* - uspoređuju se s katalogom: točno, kroz oko 4000 aliasa (id-evi jedinica iz nekoliko igara), po najdužem poznatom početku (`F-16C_50` je F-16C), ili po najkraćem imenu figure koje počinje tim tekstom.
2. Ime čija figura ne odgovara **tipu** jedinice se ne koristi (kamion zvan *Typhoon* nije lovac).
3. **Tipovi** - stupci pod nazivima *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ili *Domain* - daju figuru klase: Tacview oznake (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikone karte ili obične riječi (tank, helikopter, pješaštvo).
4. Podaci bez ijednog od njih su podaci o ljudima: svaki je vojnik.

Dakle, najlakši način da dobijete ispravne figure je stupac `vehicle` sa stvarnim imenima ili stupac `type` s Tacview oznakama.

**Moja jedinica se prikazuje kao kutija ili vojnik.** Dodajte stupac `vehicle` sa stvarnim imenom ili stupac `type` s Tacview oznakom. Zadržite pokazivač na jedinici da vidite koje je ime pronađeno. Podaci koji imaju takve stupce, ali ništa ne kažu o jedinici, ostavljaju je kao kutiju; podaci bez ijednog od njih crtaju se kao vojnici.

## Postavke {#settings}

Odjeljak **Figure** na bočnoj traci reprodukcije postavlja veličinu, najmanju veličinu na zaslonu, u što se daleke jedinice pretvaraju (figura, strelica, simbol) i učinke nacrtane na njima. Vidi [Reprodukcija utakmice](match-replay.md#figures). Dim, vatra i drugi učinci s vremenom: [Figure u preklapanju figura](figure-replay.md).

## Neobavezni lokalni paket figura {#an-optional-local-figure-pack}

Na vlastitom računalu možete držati neobavezni paket vlastitih figura. Njegove figure zamjenjuju figure iz kataloga istih imena. Nikad nije dio repozitorija ni objavljene verzije; bez njega ništa se ne mijenja.
