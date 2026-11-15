---
title: "Figuren"
parent: "Replay"
nav_order: 3
has_children: true
lang: "lb"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---


# Figuren

Eng **Figur** ass e klenge 3D-Modell vu wat eng Eenheet wierklech ass: e Panzer, en Jet, e Schëff, en Zaldot. De [Replay](match-replay.md) zeechent all Eenheet als hir Figur an der wierklecher Gréisst, amplaz als eenfach Box.

Et gi ronn 2.000 benannt Gefierer, Fligeren, Schëffer, Waffen a Zaldoten, all vun der Visualisatioun selwer gebaut.

![Panzer vum Demo, gezeechent als hir eege Figuren](../assets/img/lb/replay-tanks.webp)

## Wat am Katalog ass {#what-is-in-the-catalogue}

| Beräich | Beispiller |
|---|---|
| Mënschen | Zaldot stoend, kniend, um Bauch; Scharfschützen, Panzerofwehr, Sanitéter, Besatzung |
| Buedem | Panzer, Infanteriekampffahrzeuger, Loftofwehr, Artilleri, Camionen a Autoen, Zich a Stroossebunnen |
| Loft | Jagdfliger, Angrëffsfliger, Bommeflieger, Transportfliger, Helikopteren, vun Duebeldeckeren bis zu modernen Jetten |
| Mier | Krichsschëffer no Klass, Fligerkräiser, U-Booter, Boten, Handelsschëffer |
| Waffen | Raketen, Raketten, Bommen, Torpedoen, Liichtkugelen a Stanniol |
| Markéierungen | Rauch-, Blitz- a Brandgranaten, geluechte Bommen, Fändelen, Spawns, Wegpunkten |
| Noukampf | Zaldoten a Plackewester mat Sturmgewier, SMG, Schrotflënt, DMR, LMG, Pistoul oder Schild; Dronen, Kameraen, Stacheldrot, Schëlder, Mauerverstäerkung, Barrikaden, Sprengladungen, Fallen, Fënsteren, Granaten, den Defuser |

## Wéi d'Figuren gemaach ginn {#how-the-figures-are-made}

- **Aus publizéierte Moossen gebaut.** Déi meescht Figuren maache mir selwer, aus ëffentlechen Zuelen: Längt, Breet, Héicht, Stroossenräder, Turm an Kanoun, Flilleke a Schwanz. Hir Form gëtt dann géint ëffentlech Fotoen, Zeechnungen an publizéiert Moossen ofgestëmmt. Et gëtt kee Modell vun engem Spill benotzt.
- **Gratis Modeller.** E puer Figuren benotze gratis 3D-Modeller (CC0 oder CC BY), wou se méi wouer sinn, heiansdo mat dem gebaute Rumpf kombinéiert. D'Autoren vun CC-BY-Wierker sinn op [Figur-Kreditter](figure-credits.md) genannt; CC0-Wierker brauchen keen Kredit a sinn dort net opgelëscht.
- All Figur huet eng voll, eng grob an eng wäit Versioun (Detailstufen, LOD), sou datt Dausende op eemol gezeechent kënne ginn.

## Watt Figur eng Eenheet kritt {#which-figure-a-unit-gets}

D'Visualisatioun kuckt sech d'eege Kolonnen vun de Daten un:

1. **Nimm** - Kolonnen mat deenen Nimm *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* oder *Figure* - ginn mam Katalog verglach: genau, duerch ongeféier 4.000 Aliase (Eenheeten-IDen vu ville Spiller), duerch dee längste bekannte Ufank (`F-16C_50` ass d'F-16C), oder duerch den kierzesten Figurnumm, deen domat ufänkt.
2. E Numm, dessen Figur net zum **Typ** vun der Eenheet passt, gëtt net benotzt (en Camion mam Numm *Typhoon* ass net de Jet).
3. **Typen** - Kolonnen mat deenen Nimm *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* oder *Domain* - ginn eng Klassefigur: Tacview-Markéierungen (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), Kaarteikonen oder einfach Wieder (Panzer, Helikopter, Infanterie).
4. Daten ouni eent vun deenen zwee sinn Daten vu Mënschen: jiddereen ass e Soldat.

Déi einfachst Manéier, déi richteg Figuren ze kréien, ass also eng `vehicle`-Kolonn mat den echte Nimm, oder eng `type`-Kolonn mat Tacview-Markéierungen.

**Meng Eenheet weist sech als Box oder Zaldot.** Setzt eng `vehicle`-Kolonn mat dem echte Numm derbäi, oder eng `type`-Kolonn mat enger Tacview-Markéierung. Leet d'Maus op d'Eenheet, fir ze gesinn, welche Numm zougeuerdent gouf. Daten mat esou Kolonnen, déi awer näischt iwwer eng Eenheet soen, loossen se als Box; Daten ouni eent vun deenen zwee ginn als Zaldoten gezeechent.

## Noukampf-Figuren (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabellen, déi esou geschriwwe sinn wéi déi vum Replay-Lieser vu Rainbow Six Siege (Kolonnen `operator`, `pawn`, `primaryClass`, `side`), kréien hir eege Figuren:

- **Spiller** sinn hiren Operator: Jiddereen vun de 78 Operatoren huet seng eege Figur, ongeféier 1,8 m grouss, a sengen eegene Kleeder - zwou oder dräi Faarwe fir Jackett, Box an Ausrüstung no sengem üblechen ëffentleche Look (schwaarz, oliv, beige, urbaant Gro, wäiss, marineblo, mat rouder, orange oder petrolfaarwener Ausrüstung) - a mat sengen eegene Formen, en Drëttel méi grouss wéi an der Realitéit, wou se vun uewe gesi musse ginn: Kappbedeckung (Helmer, e Visier oder schwéieren Helm, Kappen, Mutzen, Baretten, e breede Boonie- oder Pelzhutt, Kapuzen, Schalen, Hoer), d'Gesiicht (Schutzbrëll, eng Gasmask, Brëll, eng Mask, e Baart, eng Brëll mat dräi Lënsen), e liichte, mëttleren oder schwéiere Kierperbau (déi schwéier breet, mat groussen Schëllerplacken an engem Halsschutz), e laange Mantel oder en Undeg, e Ghillie, wat se um Réck droen (en Hummer, Ladungen, Dronen, Kanisteren, en Tank, e Lanceursrouer, eng Armbrust, Panneauen, e Stéiersender, e Schild) oder um Aarm (e Lanceur, en Metallaarm), hiren eegene Schild (en héije Schild, e Policeschild, ee mat Luuchten) an eng Akzentfaarf op de Schëlleren. Si halen d'Klass vun hirer Haaptwaff. En Operator, deen d'Visualisatioun net kennt, ass en einfachen Zaldot a Plackewester an der Faarf vun der Equipe.
- **D'Säit** gesäit ee getrennt vun de Kleeder: e Rank um Buedem ënner all Operator, **amber fir den Ugrëff, hellcyan fir d'Verdeedegung**, mat der Faarf vun der Equipe dobannen, an Aarm- a Kappbänner an der selwechter Faarf. Eng `stance`-Kolonn (stand, crouch, prone) stellt se an eng Haltung; ouni déi stinn se.
- **Op Replay-Distanz ze ënnerscheeden:** 48 Pixel grouss vun uewen an op dräi Véierel gezeechent, ënnerscheede sech all zwee Operatoren op enger Säit duerch e kloren Faarfënnerscheed oder eng aner Form (vun den Tester vun der Visualisatioun kontrolléiert).
- **Etiketten** nennen de Spiller an den Operator, deen hien an deem Moment spillt, mat der Roll vum Operator als Symbol: ✸ haarde Breacher, ⚒ mëlle Breacher, ➤ Entry, ✦ Fragger, ✚ Support, ⬟ Schild, ◉ Informatioun, ◇ Flex, ↺ Flankewuecht, ⚓ Anker, ✕ Fallesteller, ⇄ Roamer, ↯ Anti-Gadget, ▣ Anti-Breach.
- **Dronen** sinn eng geheit Dron mat zwee Rieder, ongeféier 30 cm breet, all eng mat hirer eegener Spuer, benannt no hirem Besëtzer ("Ash · drone 2").
- **Plazéiert Gadgeten** stinn do, wou se higesat goufen, vun do un bis d'Ronn eriwwer ass, all als d'Figur vun deem, wat se maachen: eng Kamera, Stacheldrot, e Feldschild, eng Sprengladung, eng Ladung fir haart Breachen, eng kleng Klebladung, eng Buedemfal, eng Claymore mat hirem Stolperlaser, eng Eenwee-Fënster, e Panzerpanneau, eng Granat, e Gaskanister, e Stéiersender, e Sensor, eng Laserbarriär, eng Versuergungskëscht. Eng Figur déngt fir all Gadget, deen déiselwecht Aarbecht mécht. E Gadget, vun deem d'Daten d'Aart net soen, ass e klengen Apparat mat enger Luucht.
- **Den Defuser** steet do, wou e geluecht gouf, fir seng 45 Sekonnen.

All Dron an all Gadget gëtt beim Lueden vum Fichier eng eege Spuer, sou datt d'Figur vum Spiller selwer op sengem Kierper bleift. D'Operatore sinn vereinfacht Forme no hiren ëffentleche Beschreiwungen a Biller (wat se droen, den Apparat, deen hir Fäegkeet ass), an d'Gadgete kréien hir Form vun deem, wat se maachen. All dës Figuren sinn eegen Designs vun der Visualisatioun an der wierklecher Gréisst vun der Saach (eng Claymore ongeféier 22 cm breet, e Panneau esou grouss wéi eng Dier, 1 m op 2,1 m), keng Modeller aus dem Spill.

## Astellungen {#settings}

D'Sektioun **Figuren** an der Replay-Säitelëscht stellt d'Gréisst an, déi klengst Gréisst op dem Bildschierm, wat wäit Eenheeten ginn (Figur, Pfeil, Symbol) an d'Effekter, déi drop gezeechent ginn. Kuckt [Match-Replay](match-replay.md#figures). Rauch, Feier an aner zäitlech Effekter: [Figuren an der Figuren-Iwwerlagerung](figure-replay.md).

## E fakultative lokale Figurepak {#an-optional-local-figure-pack}

Dir kënnt op Ärem eegene Rechner e fakultativen Pak mat eegene Figuren halen. Seng Figuren huelen d'Plaz vun de Katalogfiguren mat deenen selwechten Nimm. Et ass ni Deel vum Repository oder vun engem publizéierte Build; ouni een ännert sech näischt.
