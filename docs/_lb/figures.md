---
title: "Figuren"
nav_order: 11
has_children: true
lang: "lb"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figuren

Eng **Figur** ass e klenge 3D-Modell vun deem, wat eng Eenheet wierklech ass: e Panzer, en Düsejet, e Schëff, e Zalod. De [Replay](match-replay.md) zeechent all Eenheet als hir Figur an richteger Gréisst, amplaz als eng einfach Këscht.

Et gi ronn 2.000 benannte Gefierer, Fligeren, Schëffer, Waffen a Zaldoten, all vum Viewer selwer gebaut.

![D'Panzer vum Demo als hir eegen Figuren gezeechent](../assets/img/en/replay-tanks.webp)

## Wat am Katalog ass {#what-is-in-the-catalogue}

| Beräich | Beispiller |
|---|---|
| Mënschen | Zaldot stoend, kniebeegt, liegend; Scharfschütz, Panzerabwehr, Sanitéter, Besatzung |
| Buedem | Panzer, Schützenpanzer, Loftofwier, Artillerie, Camionen a Autoen, Zich a Trams |
| Loft | Jeeër, Attack-Fligeren, Bomber, Transporter, Helikopteren, vun Duebeldecker bis modern Jet |
| Mier | Kricksschëffer no Klass, Fliegerschëffer, U-Booter, Boten, Handelsschëffer |
| Waffen | Raketen, Bomme, Torpedoen, Fackelen a Chaff |
| Markéierungen | Rauch-, Blitz- a Brandgranaten, gelegt Bomme, Fändelen, Spawnen, Wegpunkten |

## Wéi d'Figuren gemaach ginn {#how-the-figures-are-made}

- **Aus publizéierte Miessunge gebaut.** Déi meescht Figuren entstinn aus dem eegene Figurebauer vum Viewer, mat ëffentlechen Zuelen: Längt, Breet, Héicht, Stroossenrieder, Tuerm an Kanoun, Flilleke an Hack. Hir Form gëtt dann mat ëffentlechen Photoen, Zeechnungen a publizéierte Miessunge ugepasst. Keng Spillmodelle ginn benotzt.
- **Gratis Modeller.** E puer Figuren benotzen gratis 3D-Modeller (CC0 oder CC BY), wou se méi getreu sinn, heiansdo mat dem gebaute Rumpf kombinéiert. D'Autoren vu CC-BY-Wierker sinn op [Figurekreditter](figure-credits.md) genannt; CC0-Wierker bräuchen kee Kredit a stinn do net.
- All Figur huet eng voll, eng grof an eng wäit ewech Versioun (Detailstufen, LOD), sou datt Dausende op eemol gezeechent kënne ginn.

## Wéi eng Figur eng Eenheet kritt {#which-figure-a-unit-gets}

De Viewer kuckt op d'eegen Kolonnen vun den Daten:

1. **Nimm** - Kolonnen mat Nimm wéi *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* oder *Figure* - ginn mam Katalog verglach: exakt, duerch ongeféier 4.000 Alias-Nimm (Eenheets-IDen vu verschiddene Spiller), duerch den längste bekannte Ufank (`F-16C_50` ass den F-16C), oder duerch de kierzesten Figurennumm, deen domat ufänkt.
2. E Numm, deem seng Figur net zum **Typ** vun der Eenheet passt, gëtt net benotzt (en Camion mam Numm *Typhoon* ass net de Jeeër).
3. **Typen** - Kolonnen mat Nimm wéi *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* oder *Domain* - ginn eng Klassefigur: Tacview-Markéierungen (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), Kaartesymboler oder einfach Wieder (Panzer, Helikopter, Infanterie).
4. Daten mat engem vun deenen zwee sinn Daten vu Mënschen: jiddereen ass e Zaldot.

Also ass de einfachste Wee fir déi richteg Figuren eng `vehicle`-Kolonn mat den echte Nimm, oder eng `type`-Kolonn mat Tacview-Markéierungen.

**Meng Eenheet gëtt als Këscht oder Zaldot gewisen.** Setzt eng `vehicle`-Kolonn mam richtege Numm derbäi, oder eng `type`-Kolonn mat enger Tacview-Markéierung. Fiert mat der Maus iwwer d'Eenheet, fir ze gesinn, wéi den Numm erkannt gouf. Daten, déi esou Kolonnen hunn, awer näischt iwwer eng Eenheet soen, loossen se als Këscht; Daten ouni gëtt als Zaldote gezeechent.

## Astellungen {#settings}

D'Sektioun **Figuren** an der Replay-Säitelleescht stellt d'Gréisst an, déi klengst Gréisst um Écran, wat wäit Eenheeten ginn (Figur, Pfeil, Symbol), an d'Effekter, déi op hinnen gezeechent ginn. Kuckt [Match-Replay](match-replay.md#figures). Rauch, Brand an aner zäitgebonne Effekter: [Figuren am Figuren-Overlay](figure-replay.md).

## E fakultative lokale Figurepak {#an-optional-local-figure-pack}

Dir kënnt en fakultativen Pak mat äigenen Figuren op Ärem eegenen Rechner halen. Seng Figuren huelen d'Plaz vu Katalogfiguren mat deenselwechten Nimm an. Si ass ni Deel vum Repository oder vun engem publizéierte Build; ouni Pak ännert sech näischt.
