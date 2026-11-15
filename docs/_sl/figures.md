---
title: "Figure"
nav_order: 11
has_children: true
lang: "sl"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figure

**Figura** je majhen 3D model tega, kar je enota v resnici: tank, reaktivno letalo, ladja, vojak. [Predvajanje](match-replay.md) nariše vsako enoto kot njeno figuro v pravi velikosti, namesto kot preprosto kocko.

Obstaja okoli 2.000 imenovanih vozil, letal, ladij, orožij in vojakov, vse zgradi sam pregledovalnik.

![Tenki iz demo podatkov, narisani kot lastne figure](../assets/img/en/replay-tanks.webp)

## Kaj je v katalogu {#what-is-in-the-catalogue}

| Področje | Primeri |
|---|---|
| Ljudje | vojak stoji, čepi, leži; snajperist, protitankovec, medicinec, posadka |
| Kopno | tanki, bojna vozila pehote, protiletalska obramba, artilerija, tovornjaki in avtomobili, vlaki in tramvaji |
| Zrak | lovci, napadalna letala, bombniki, transportna letala, helikopterji, od dvokrilnikov do sodobnih reaktivnih letal |
| Morje | vojne ladje po razredih, letalonosilke, podmornice, čolni, trgovske ladje |
| Orožje | rakete, raketni streli, bombe, torpeda, bakle in pleve |
| Oznake | dimne, bliskovne in gorilne granate, postavljene bombe, zastave, spawni, točke poti |

## Kako nastanejo figure {#how-the-figures-are-made}

- **Zgrajene iz objavljenih dimenzij.** Večina figur nastane z lastnim graditeljem figur pregledovalnika iz javnih številk: dolžina, širina, višina, cestna kolesa, kupola in top, krila in rep. Njihova oblika se nato uglasi po javnih fotografijah, risbah in objavljenih dimenzijah. Modeli nobene igre niso uporabljeni.
- **Prosti modeli.** Nekaj figur uporablja proste 3D modele (CC0 ali CC BY), kjer so resničnejši, včasih združene z zgrajenim trupom. Avtorji del CC BY so navedeni na [Zasluge za figure](figure-credits.md); dela CC0 ne zahtevajo navedbe in tam niso našteta.
- Vsaka figura ima polno, grobo in oddaljeno različico (ravni podrobnosti, LOD), zato jih lahko narišemo na tisoče hkrati.

## Katero figuro dobi enota {#which-figure-a-unit-gets}

Pregledovalnik pogleda stolpce v samih podatkih:

1. **Imena** - stolpci z imeni *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ali *Figure* - se ujemajo s katalogom: natančno, prek približno 4.000 vzdevkov (ID-ji enot več iger), po najdaljšem znanem začetku (`F-16C_50` je F-16C) ali po najkrajšem imenu figure, ki se začne tako.
2. Ime, katerega figura ne ustreza **tipu** enote, se ne uporabi (tovornjak z imenom *Typhoon* ni lovec).
3. **Tipi** - stolpci *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ali *Domain* - dajo razredno figuro: oznake Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikone zemljevida ali navadne besede (tank, helicopter, infantry).
4. Podatki brez obojega so podatki o ljudeh: vsak je vojak.

Najlažji način, da dobite prave figure, je torej stolpec `vehicle` s pravimi imeni ali stolpec `type` z oznakami Tacview.

**Moja enota je prikazana kot kocka ali vojak.** Dodajte stolpec `vehicle` s pravim imenom ali stolpec `type` z oznako Tacview. Ob postavitvi na enoto vidite, katero ime je bilo ujeto. Podatki, ki imajo take stolpce, a o enoti nič ne povedo, jo pustijo kot kocko; podatki brez obojega so narisani kot vojaki.

## Nastavitve {#settings}

Razdelek **Figure** v stranski vrstici predvajanja nastavi velikost, najmanjšo velikost na zaslonu, kaj postanejo enote na daljavo (figura, puščica, simbol) in učinke, narisane nanje. Glejte [Predvajanje tekme](match-replay.md#figures). Dim, ogenj in drugi časovno omejeni učinki: [Figure v prekrivanju figur](figure-replay.md).

## Neobvezni lokalni paket figur {#an-optional-local-figure-pack}

Na svojem računalniku lahko hranite neobvezen paket lastnih figur. Njegove figure zamenjajo figure iz kataloga z enakimi imeni. Nikoli ni del repozitorija ali objavljene izdaje; brez njega se nič ne spremeni.
