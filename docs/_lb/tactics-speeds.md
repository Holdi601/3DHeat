---
title: "Beweegungsgeschwindegkeeten"
parent: "Taktik-Board"
nav_order: 1
lang: "lb"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Beweegungsgeschwindegkeeten

Wéi laang brauch e Zaldot, e Panzer oder en Düs fir vu A op B ze kommen? Dës Säit seet, wéi séier all Figur op dem [Taktikbrett](tactics-board.md) sech beweegt, a wou dës Zuelen hierkommen, sou datt Dir d'Zäiten op Ärem Plang vertrauen oder änneren kënnt.

Den [Taktikbrett](tactics-board.md) setzt d'Zäit vun engem Plang no der Geschwindegkeet vun all Figur. D'Geschwindegkeete kommen aus enger Datei pro Spill am `src/tactics/speeds/`: eng Geschwindegkeet fir all Beweegungsmodus vun all Klass (Infanterie, Buedem-Gefierer, Schëffer, Fligeren, Helikopteren), plus benannte Profiler wéi een pro CS2-Waff oder een pro Fligertyp. All Datei weist hir Quellen, an all Wäert seet, ob en **offiziell** ass (d'eege Daten vum Spill oder d'verëffentlechte Zuelen vun engem richtegen Fligen) oder **ongeféier** (vun der Gemeinschaft gemooss oder en typesche Wäert).

Dat sinn Ausgangspunkten. **All Figur kann hir Geschwindegkeeten um Brett iwwerschreiwen**, sou datt en Plang eng gemooss Geschwindegkeet, en schwéier beluede Zaldot oder en beschiedegten Panzer benotze kann.

## Modi {#modes}

| Klass | Modi |
|---|---|
| Infanterie | Krauchen (op der Brust), Hucken, Lafen (dat luesam, roueg Goen), Lafen (Standard-Beweegung), Sprint |
| Buedem-Gefierer, Schëffer | Krauchen, virsiichteg, normal (querfeldeneen), Ufall (Héchstgeschwindegkeet op der Strooss) |
| Fligeren, Helikopteren | lues (Unnäherung, Kreesen, Schwiewen-Rullen), Reesegeschwindegkeet, Kampf (Kurvegeschwindegkeet oder Ugrëffsfluch), Maximum |

En Modus, deen d'Spill net huet, bleift eidel: CS2 an Valorant hunn kee Sprint an kee Liegen.

## Hänge {#slopes}

All Datei seet och, wéi d'Spill Hänge behandelt. CS2, Valorant a Squad begrenze d'horizontal Geschwindegkeet, sou datt e Hang en Spiller net bremst. Arma bremst Infanterie an Hänge, dofir benotzt seng Datei an déi generell d'Tobler-Wanderfunktioun. Battlefield an d'Gefier-Simulatioune benotzen eng eenfach Steigungsstrof.

## Pro Spill {#per-game}

**Counter-Strike 2** (Eenheeten pro Sekonn; eng Eenheet gëtt als ee Zoll geholl). **Offiziell.** D'Lafgeschwindegkeete sinn d'Wäerter `m_flMaxSpeed` aus de Waffendefinitioune vum Spill: d'Mes an C4 250, d'Granaten 245, d'Pistoule 240 (Desert Eagle 230, R8 180), SMGen 220 bis 240, Gewierer 210 bis 225, AWP 200, LMGen 195 an 150. D'Scharfschutz-AWP mat Zilfernrouer (100), AUG an SG 553 (150) an G3SG1 an SCAR-20 (120) hunn hir eegen Profiler. Gueën ass Lafgeschwindegkeet × 0,52, a Hucken ass Lafgeschwindegkeet × 0,34. Valve verëffentlecht dës zwee Multiplikatoren net, awer all Waff weist se a Demo-Opnamen. Fir e Plang géint richteg Beweegung ze kontrolléieren, lued eng Demo op der selwechter Kaart a vergläicht d'Geschwindegkeete vun de Spiller.

**Valorant** (m/s). De Mes leeft mat 6,75 m/s. All Waff multiplizéiert dat mat hirem Lafgeschwindegkeets-Multiplikator aus de Spillduaten, wat d'Geschwindegkeete gëtt, déi den Arsenal am Spill weist: 5,73 fir déi meescht Seitewaffen a SMGen, 5,4 fir Gewierer, 5,13 fir schwéier Waffen an den Operator, 5,06 fir Schrotflëntercher. Dës Lafgeschwindegkeete sinn exakt. Gueën- an Hucke-Geschwindegkeete sinn **Schätzungen** (0,55 an 0,4 × Lafen), well Riot se net verëffentlecht. D'Profiler vun de Scharfschutzen mat Zilfernrouer sinn och Schätzungen.

**Battlefield** (km/h). **Ongeféier.** EA verëffentlecht keng Beweegungszuelen. Infanterie: ongeféier 1 m/s op der Brust, 2 gehuckt, 4 am Lafen an 6,4 am Sprint. Gefierer, Fligeren, Helikopteren a Schëffer kréien typesch Geschwindegkeete aus dem Spill fir hir Klass.

**Squad** (km/h). **Ongeféier.** Lafen (3,3 m/s) an Sprint (5,9 m/s) kommen aus engem Gemeinschaftsbericht iwwer d'Spillmechanik. Krauchen, Hucken a lues Gueën sinn Schätzungen, an och jiddereg Gefierklass an Helikopter.

**Arma** (km/h). **Ongeféier.** Infanterie-Tempoen sinn Zäitmooss vun der Gemeinschaft: ongeféier 5 km/h am Gueën, 9 km/h taktescht Tempo gehuckt, 15 km/h am Trab an ongeféier 21 km/h am Sprint. D'Héchstgeschwindegkeete vun de Gefierer sinn d'konfiguréiert Maxima vun de Vanilla-Arma-3-Gefierer an all Klass, aus enger Lëscht vun Drëtt. Déi lues Gefier-Modi sinn Schätzungen.

**DCS / War Thunder / IL-2** (km/h). All Fligeren an Helikopter an der Palette huet säin eegene Profil. Reese- an Héchstgeschwindegkeete sinn d'**verëffentlechte Zuelen** vun den richtegen Fligeren, déi d'Simulatioune ganz no nodeeën. Maximum ass bei Mieresniveau fir Düsen an an der Nennhéicht fir Propellerfligeren, a just dësen Hiweis steet an all Profil. Lues an Kampfgeschwindegkeete sinn typesch Wäerter. Buedem-Gefierer benotze verëffentlechte Strooss-Geschwindegkeete vun den echte Gefierer, gerënnt (**ongeféier**). Schëffer benotze verëffentlech Héchstgeschwindegkeete vun hirer Klass.

**Anerer** (m/s). **Ongeféier** real-Welt-Standarden: Krauchen 0,5, Hucken 1,5, Gueën 1,4, Lafen 3,5, Sprint 6.

## Quellen {#sources}

Counter-Strike 2
- [CS2-Waffendefinitioune (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB-Waffesäiten](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Beweegungsmechanik](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com Waffen (Lafgeschwindegkeets-Multiplikatoren)](https://valorant-api.com/v1/weapons)
- [VLR.gg: Mes-Geschwindegkeet 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot-Support: Goen, Lafen a Hucken](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-Forume: Battlefield-6-Beweegungsgeschwindegkeet](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield-6-Beweegungsguide](https://deltiasgaming.com/?p=309455)
- [Virverëffentlechungsbericht vun engem 6,4-m/s-Sprint](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad-Spillmechanik-Bäitrag (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (verëffentlecht keng Geschwindegkeeten)

Arma
- [Bohemia-Forume: Gueëgeschwindegkeet](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-Forume: Beweegungsgeschwindegkeet ofstëmmen](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma-3-Feedback-Tracker: Sprintgeschwindegkeet](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infanterie-Steierung](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma-3-Gefier-Statistiken no Fraktioun (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- D'Wikipedia-Spezifikatiounen vun all Fligertyp an Helikopter, verlinkt vun all Profil an `air.json`
- [V-Geschwindegkeeten](https://en.wikipedia.org/wiki/V_speeds), fir typesch Unnäherungs- an Kampfgeschwindegkeeten
- [War-Thunder-Wiki](https://wiki.warthunder.com/), fir Buedem-Gefierer
- [Arleigh-Burke-Klass Zerstéierer](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), an déi verëffentlechte Geschwindegkeete vun den anere Schëffsklassen

Anerer
- [Bevorzugt Gueëgeschwindegkeet](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler-Wanderfunktioun](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
