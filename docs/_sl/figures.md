---
title: "Figure"
parent: "Ponovitev"
nav_order: 3
has_children: true
lang: "sl"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Figure

**Figura** je majhen 3D model tega, kar enota resnično je: tank, reaktivno letalo, ladja, vojak. [Predvajanje](match-replay.md) nariše vsako enoto kot njeno figuro v pravi velikosti, namesto kot preprosto škatlo.

Je približno 2.000 imenovanih vozil, letal, ladij, orožij in vojakov, vse jih je zgradil sam pregledovalnik.

![Tanki iz demo podatkov, narisani kot njihove lastne figure](../assets/img/sl/replay-tanks.webp)

## Kaj je v katalogu {#what-is-in-the-catalogue}

| Območje | Primeri |
|---|---|
| Ljudje | vojak stoječ, počepnjen, ležeč; snajper, protitankovec, zdravnik, posadka |
| Kopno | tanki, bojna vozila pehote, protiletalska obramba, topništvo, tovornjaki in avtomobili, vlaki in tramvaji |
| Zrak | lovci, jurišniki, bombniki, transportna letala, helikopterji, od dvokrilnikov do sodobnih reaktivnih letal |
| Morje | bojne ladje po razredih, letalonosilke, podmornice, čolni, trgovske ladje |
| Orožje | rakete, raketni izstrelki, bombe, torpedi, bakle in plevni |
| Oznake | dimne, bliskovne in gorilne granate, nastavljene bombe, zastave, točke pojava, točke poti |
| Bližnji boj | vojaki v nosilcih plošč z jurišno puško, brzostrelko, šibrenico, DMR, LMG, pištolo ali ščitom; droni, kamere, bodeča žica, ščiti, ojačitev sten, barikade, naboji za preboj, pasti, okna, granate, defuser |

## Kako so figure narejene {#how-the-figures-are-made}

- **Zgrajene iz objavljenih mer.** Večino figur naredi graditelj figur pregledovalnika iz javnih številk: dolžina, širina, višina, cestna kolesa, stolp in top, krila in rep. Njihova oblika se nato uglasi po javnih fotografijah, risbah in objavljenih merah. Modeli nobene igre se ne uporabljajo.
- **Prosti modeli.** Nekatere figure uporabljajo proste 3D modele (CC0 ali CC BY), kjer so bolj resnični, včasih združeni z zgrajenim trupom. Avtorji del CC BY so navedeni na [Zasluge za figure](figure-credits.md); dela CC0 ne potrebujejo navedbe in tam niso navedena.
- Vsaka figura ima polno, grobo in oddaljeno različico (ravni podrobnosti, LOD), zato jih je lahko narisanih na tisoče hkrati.

## Katero figuro dobi enota {#which-figure-a-unit-gets}

Pregledovalnik pogleda stolpce samih podatkov:

1. **Imena** – stolpci, imenovani *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ali *Figure* – se primerjajo s katalogom: natančno, prek približno 4.000 vzdevkov (id-ji enot več iger), po najdaljšem znanem začetku (`F-16C_50` je F-16C), ali po najkrajšem imenu figure, ki se začne tako.
2. Ime, katerega figura se ne ujema z **vrsto** enote, se ne uporabi (tovornjak z imenom *Typhoon* ni lovec).
3. **Vrste** – stolpci, imenovani *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ali *Domain* – dajo razredno figuro: oznake Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikone zemljevida ali navadne besede (tank, helikopter, pehota).
4. Podatki brez enega ali drugega so podatki o ljudeh: vsak je vojak.

Najlažji način, da dobite prave figure, je stolpec `vehicle` s pravimi imeni ali stolpec `type` z oznakami Tacview.

**Moja enota se prikaže kot škatla ali vojak.** Dodajte stolpec `vehicle` s pravim imenom ali stolpec `type` z oznako Tacview. Če se z miško ustavite nad enoto, vidite, katero ime se je ujemalo. Podatki, ki imajo take stolpce, a nič ne povedo o enoti, jo pustijo kot škatlo; podatki brez njih se narišejo kot vojaki.

## Figure za bližnji boj (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabele, zapisane kot tiste iz bralnika posnetkov Rainbow Six Siege (stolpci `operator`, `pawn`, `primaryClass`, `side`), dobijo svoje figure:

- **Igralci** so svoj operater: vsak od 78 operaterjev ima svojo figuro, visoko približno 1,8 m, v svojih oblačilih - dve ali tri barve za jakno, hlače in opremo po njihovem običajnem javnem videzu (črna, olivna, peščena, mestno siva, bela, mornarsko modra, z rdečo, oranžno ali modrozeleno opremo) - in s svojimi oblikami, za tretjino večjimi od resničnih tam, kjer morajo biti vidne od zgoraj: pokrivalo (čelade, vizir ali težka čelada, kape s šiltom, pletene kape, baretke, širok klobuk boonie ali krznena kapa, kapuce, šali, lasje), obraz (zaščitna očala, plinska maska, očala, maska, brada, očala s tremi lečami), lahka, srednja ali težka postava (težki so široki, z velikimi ramenskimi ploščami in ovratnikom), dolg plašč ali obleka, maskirna obleka ghillie, kar nosijo na hrbtu (kladivo, naboji, droni, kanistri, rezervoar za gorivo, cev lanserja, samostrel, plošče, motilec, ščit) ali na roki (lanser, kovinska roka), svoj ščit (visok ščit, policijski ščit, ščit z lučmi) in poudarjalna barva na ramenih. Držijo razred svojega glavnega orožja. Operater, ki ga pregledovalnik ne pozna, je navaden vojak v nosilcu plošč v barvi ekipe.
- **Stran** se vidi ločeno od oblačil: obroč na tleh pod vsakim operaterjem, **jantarni za napad, bledo cian za obrambo**, z barvo ekipe v notranjosti, ter trakovi na roki in glavi v isti barvi. Stolpec `stance` (stand, crouch, prone) jih postavi v držo; brez njega stojijo.
- **Ločljivi na razdalji posnetka:** izrisani 48 slikovnih pik visoko od zgoraj in s tričetrtinskega pogleda se vsaka dva operaterja na isti strani razlikujeta po jasni razliki v barvi ali po drugačni obliki (preverjeno s testi pregledovalnika).
- **Oznake** navedejo igralca in operaterja, ki ga ta trenutek igra, z vlogo operaterja kot simbolom: ✸ trdi preboj, ⚒ mehki preboj, ➤ vstop, ✦ fragger, ✚ podpora, ⬟ ščit, ◉ izvidovanje, ◇ fleks, ↺ varovanje boka, ⚓ sidro, ✕ pastar, ⇄ roamer, ↯ proti pripomočkom, ▣ proti preboju.
- **Droni** so dvokolesni dron za metanje, širok približno 30 cm, vsak svoja sled, poimenovana po lastniku („Ash · drone 2“).
- **Postavljeni pripomočki** stojijo tam, kamor so bili postavljeni, od takrat do konca runde, vsak kot figura tega, kar počne: kamera, bodeča žica, postavljiv ščit, naboj za preboj, naboj za trdi preboj, majhen lepljiv naboj, talna past, claymore s sprožilnim laserjem, enosmerno okno, oklepna plošča, granata, plinski kanister, motilec, senzor, laserska vrata, zaboj z zalogami. Ena figura služi vsakemu pripomočku, ki opravlja isto delo. Pripomoček, katerega vrste podatki ne povedo, je majhna naprava z lučko.
- **Defuser** stoji tam, kjer je bil nastavljen, svojih 45 sekund.

Vsak dron in pripomoček ob nalaganju datoteke postane svoja sled, zato igralčeva lastna figura ostane na njegovem telesu. Operaterji so poenostavljene oblike po njihovih javnih opisih in ilustracijah (kar nosijo, naprava, ki je njihova sposobnost), pripomočki pa so oblikovani po tem, kar počnejo. Vse to so lastni dizajni pregledovalnika v resnični velikosti stvari (claymore širok približno 22 cm, plošča v velikosti vrat 1 m × 2,1 m), ne modeli iz igre.

## Nastavitve {#settings}

Razdelek **Figure** na stranski vrstici predvajanja nastavi velikost, najmanjšo velikost na zaslonu, kaj postanejo oddaljene enote (figura, puščica, simbol) in učinke, narisane nanje. Glejte [Predvajanje tekme](match-replay.md#figures). Dim, ogenj in drugi časovno omejeni učinki: [Figure v prekrivanju figur](figure-replay.md).

## Neobvezen lokalni paket figur {#an-optional-local-figure-pack}

Na svojem računalniku lahko hranite neobvezen paket lastnih figur. Njegove figure nadomestijo figure iz kataloga z enakimi imeni. Nikoli ni del repozitorija ali objavljene različice; brez njega se nič ne spremeni.
