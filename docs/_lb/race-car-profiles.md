---
title: "Autosprofiler an Verglach"
parent: "Course-Analys"
nav_order: 56
lang: "lb"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Autosprofiler an Verglach

En Auto kann nëmmen esou hart bremsen, drécken an beschleunegen. De Viewer miesst wéi hart aus Ären eegene Ronnen, dofir seet en Iech ni, eppes ze maachen, wat Äre Auto net kann. Dat erkläert och, wéi vill vun enger verluerener Sekonn um Auto louch an net bei Iech.

![Autoen am Verglach: zwee Autoen niewenaneen mat hirem Gripp, Bremsen an Drock](../assets/img/en/race-cars-compared.webp)

D'Analyse seet enger Ronn nëmmen, si soll méi hart bremsen, méi Geschwindegkeet droen oder méi fréi beschleunegen, wou Äre Auto dat gewisen huet, an si zitt aus engem Verloscht ewech, wat d'Autoen selwer erklären. Dofir gi d'Grenzen vun all Auto (hir *Hëllef*, hei drënner) an hire Charakter (hiert *Profil*) aus all geluedene Ronn vun him gemooss. Dës Säit behandelt d'Hëllef, d'Profil, den Ofschnëtt **Autoen am Verglach**, an wat d'Autoen an all Kurv entscheeden.

**En Auto** = Ronnen mat der selwechter Autosnummer (oder dem Numm, ouni Nummer) an dem selwechte Leeschtungsindex: eng aner Tuning ass en anere Auto.

## D'Hëllef: wat de Auto bei all Geschwindegkeet kann {#the-envelope-what-the-car-can-do-at-each-speed}

Pro Auto, iwwer all geluedene Ronn vun him, a **5-m/s-Geschwindegkeetsbänner** (24 Bänner, bis 120 m/s). Proben an der Loft, Beruegung 0,3 s nom Landen, an vun 0,1 s virun all Treffer bis 1 s nom Treffer fale fort, a Beschleunegunge vu 80 m/s² oder méi ginn ignoréiert (méi wéi all Auto mat Downforce hält).

| Hëllef | Miessunge | Wäert pro Band | Brauch |
|---|---|---|---|
| **Querguerp** | d'Querbeschleunegung **eng halleb Sekonn gehalen** (de Mëttelwäert vum Absolutwäert iwwer en zentréiert 0,5-s-Fënster), nëmmen, wou de Wagen an der Kurv war: op d'mannst e Drëttel vum 99. Perzentil vun allem | 95. Perzentil | 6 Miessunge |
| **Bremsen** | Bremse > 0,3; d'Längsbeschleunegung als Mëttelwäert vu jiddwer Miessung an hire zwee Nopesen | 95. Perzentil vun der Verzögerung | 4 Miessunge |
| **Vollgaas-Schub** | Gaas > 0,95, Bremse ënner 0,05; dat selwecht Mëttelwäert vun dräi | 90. Perzentil | 4 Miessunge |

Firwat eng halleb Sekonn gehalen: en Bordstee, e Rutsch, dee zréckschnappt, oder en Auto, dat gefaange gëtt, heizen d'Querbeschleunegung fir en Ament op, an e Auto, dat dat dacks mécht, huet méi Gripp ausgesinn, wéi e wierklech hat. Firwat Mëttelwäert vun dräi: bei fënnf Meter Ofstand ass eng Miessung e laange Wee; eng eenzeg spëtzeg Miessung ass e Bordstee, e Stouss oder eng Mauer.

Wann een d'Hëllef bei enger Geschwindegkeet liest, interpoléiert en tëscht de Bännermëtten, a wann eng Band eidel ass, hëlt en déi nootste Band mat Daten.

**Op zwou Aarte vu Buedem.** Wann d'Ronnen vun engem Auto een Fënftel oder méi vun hiren Proben op Asphalt an och op lass Buedem gefuer sinn, gëtt fir all eng eegen Hëllef gehalen, an all Kurv gëtt mam Buedem beurteelt, deen ënner dem Auto bei sengem lanksamste Punkt ass.

**Iwwergank.** D'Geschwindegkeet, vun där den Schub ofhält wéi `1/v` (vum Leeschtung begrenzt) amplaz flach ze bleiwen (vum Traktioun begrenzt): déi éischt Band, wou `a·v` bannent 15 % vum héchsten `a·v` leit, dat gesinn ass.

## D'Profil: wéi een Auto et ass {#the-profile-what-kind-of-car-it-is}

`profile`, aus deene selwechte Ronnen (Proben um Buedem, net gestouss, méi schnell wéi 8 m/s):

| Miessung | Wéi |
|---|---|
| **Gripp gehalen** (m/s²) | 95. Perzentil vun der halleber gehaalener Querbeschleunegung |
| **Schub** bis 50 km/h, 50-120, 120-200, iwwer 200 (m/s²) | de Mëttelwäert vum Vollgaas-Schub aus der Hëllef iwwer 3-14, 14-33, 33-56 an 56-90 m/s, bei Geschwindegkeete, déi de Wagen erreecht huet (bis zu sengem Schnellsten + 2 m/s), aus op d'mannst dräi 1-m/s-Schrëtt; an dat Mannst, wat e gewisen huet, an wou |
| **Bremsen** (m/s²) | d'Bremsen aus der Hëllef am Mëttel vun 60 bis 160 km/h (16,7-44,4 m/s), dat Band, dat de Vergläich nennt |
| **Schnellst** | déi héchst Geschwindegkeet, déi e erreecht huet |
| **Ëm d'Spëtzt** | wou en beim Vollgaas op engem Rietstreck net méi zougeluecht huet (ënnen) |
| **Zitt nach am Schnellsten** | den Schub vun der Hëllef bei senger schnellster Geschwindegkeet: wéi wäit hie nach ze goen hat |
| **Hannen gefaange, pro Ronn** | Mol pro Ronn, wou en gerutscht ass an gefaange gouf (ënnen) |
| **Undeel um Gaas** | vun deenen dee Undeel, deen mat Gaas > 0,5 an ouni Bremsen ugefaang huet |
| **Léisst lass bei** | de Mëttelwäert vun der gehaalener Querbeschleunegung 0,15 s virun all Rutsch, als Undeel vum Gripp |
| **Iwwer 10° Drift, bei haarder Kurvefuerung** | vun de Proben, déi mat 60 % vum Gripp oder méi an der Kurv sinn, den Undeel, deen rutscht (10° op Asphalt, 20° op lass); brauch 30 Proben |
| **Mëttelwäert vum Drift** | iwwer deeselwechte Proben |
| **Gläichgewiicht** | Schlupfwénkel vir minus hannen (Vilfache vum nominelle Spëtzewäert), wou hart gekuert gëtt an net gerutscht gëtt, Mëttelwäert vu mindestens 30 Proben: + dréckt no baussen |
| **Buedem** | iwwer 80 % lass Proben: lass; ënner 20 %: Asphalt; soss gemëscht |

**Ënner der Spëtzt.** Eng Miesszuel zielt, wann d'Sekonn ronderëm se (±0,5 s, mindestens 0,9 s Daten) ganz Vollgaas war (> 0,95, ouni Bremsen), um Buedem, **riichtaus** gefuer (|quer| ënner dem gréisseren vun 4 m/s² an engem Véierel vum Gripp), mat manner Gewënn wéi **0,35 m/s²**, méi schnell wéi 25 m/s, an innerhalb vun 90 % vum Schnellsten vun der Ronn - Vollgaas bergop oder duerch eng laang Kurv hält och d'Beschleunegung op, wäit ënner dem Spëtzentempo vum Auto. Mat mindestens **enger Sekonn** esou engem Plateau iwwer all Ronnen ass de Mëttelwäert vun deene Geschwindegkeete, wou en ënner der Spëtzt ass. Soss gëtt et keng Spëtzegeschwindegkeet: wou kee Rietstreck laang genuch war, seet *Zitt nach am Schnellsten*, wéi wäit et dovu war. Kee Rode iwwer dat, wat d'Ronnen weisen - d'Iwwersetzung an de Begrenzer enden de Schub vun engem Auto laang virun dem Widerstand.

**Hannen verléieren.** Gezielt, wou de Fuerer et hat ze fänken: an der Kurv mat 60 % vum Gripp oder méi, rutscht (Drift iwwer 10° op Asphalt, 20° op lass), mat der Lenkung (iwwer 0,06) **géint** d'Kurv gedréint. Welche Vorzeechen vun der Lenkung mat welchem Vorzeechen vun der Kurvekraaft iwwerteneen, gëtt pro Ronn gemooss (Proben, déi dréinen ouni ze rutschen). E Rutsch zielt eemol, bis de Wagen ophält ze rutschen. En Auto, dat e bësse bewosst zur Säit gefuer gëtt, verléiert näischt; een, deen Géigenlenkung brauch, sëtt. Fir all Auto gläich gezielt, dofir kënnen zwee Autoen verglach ginn. Brauch Lenkung an e Drift-Wénkel.

## Autoen am Verglach {#cars-compared}

Den Ofschnëtt an der Säitebar heescht **Den Auto** bei engem Auto, **Autoen am Verglach** bei méi wéi engem.

**D'Tabell**: eng Kolonn pro Auto, eng Zeil pro Miessung, fir déi e Wäert huet: Gripp gehalen; Schub bis 50 km/h, 50-120, 120-200, iwwer 200; Bremsen; Schnellst; Ëm d'Spëtzt („zitt nach" wou en ni dra war); Zitt nach am Schnellsten; Hannen gefaange, pro Ronn; Iwwer 10° Drift, bei haarder Kurvefuerung. Wou d'Autoen sech ëm méi wéi 3 % ënnerscheeden, gëtt de besseren Wäert markéiert (méi héich fir Gripp, Schub, Bremsen, Geschwindegkeeten; méi niddereg fir hannen Rutscher).

**En Auto eleng**: Sätz iwwer dat, wat d'Ronnen et weisen - de Gripp, deen en hält (m/s² a g), säin Schub an all Band, wou et op de laange Rietstreck mat dem Zouluechen opgehalen huet (oder datt et ni d'Spëtzt erreecht huet, a wat et am Schnellsten nach gezunn huet), a wéi oft säi Hannen gefaange muss ginn („ganz selten" ënner engem Mol pro Ronn, „meeschtens um Gaas" wann 60 % oder méi do ugefaang hunn).

**Zwee Autoen**: fir all Paar en Satz pro Auto iwwer deen anere („X beschleunegt besser, kann awer net sou hart drénken, brauch méi laang fir ze stoppen an verléiert den Hannen méi liicht"), d'Tabell, all kloer Ënnerscheed, déi gréisst als éischt, dann **Wéi een all Auto fiert**. Mat méi wéi **3** Paaren gëtt nëmmen ee Paar gewisen: den Auto vun der gewielter Ronn géint en Auto, deen an enger Dropdown-Lëscht gewielt gouf (standardméisseg den Auto vun der beschter Ronn vun hirer Klass, soss vun der Referenz, soss den éischte anere).

En Ënnerscheed gëtt nëmmen gesot, wann d'Ronnen en kloer weisen:

| Ënnerscheed | Gesot aus | Saz |
|---|---|---|
| Gripp | **4 %** | „X hält N % méi Gripp an de Kurven … dat sinn M % méi Geschwindegkeet mëtten an all Kurv" (Geschwindegkeet = √ vum Gripp-Verhältnis) |
| Schub | **5 %**, an der éischter Band, déi béid Autoen vun 120-200, 50-120, iwwer 200 km/h hunn | „X beschleunegt N % méi haart vu 120 op 200 km/h"; och vum Startpunkt, oder „obwuel Y méi haart vum Start fortkënnt", wann de Start 8 % ausernee ass |
| Spëtzegeschwindegkeet | **4 km/h** | „X geet méi héich: en huet ophalt ze gewannen bei …" |
| Spëtzegeschwindegkeet, nëmmen ee | ee Auto ass an der Spëtzt, de Ray net | „Y ass bei … am Schub ausgaangen; X hat nach gewonnen, wéi en gebremst huet" |
| Spëtzegeschwindegkeet, keen | keen erreecht se | wat jiddwer am Schnellsten nach gewonnen huet |
| Bremsen | **5 %** | „X stoppt N % méi haart … Y muss méi fréi bremsen" |
| Hannen verléieren | mindestens een Mol pro Ronn méi **an** d'Halschent méi oft | „X verléiert den Hannen méi liicht: en ass sou wäit gerutscht, datt et Géigenlenkung brauch huet, N Mol pro Ronn géint M …" - meeschtens um Gaas (60 % oder méi) oder meeschtens beim Eroplenken an um Lift (30 % oder manner), vun ongeféier P % vum Gripp; op lass Buedem „e Stéck vun deem ass, wéi e Wagen gedréint gëtt; d'Fänken net" |
| Zur Säit | **12 Prozentpunkte** haarder Kurvefuerung iwwer dem Drift-Limit | „X fiert am Limit méi zur Säit" |
| Gläichgewiicht vir | **0,3** vum nominelle Spëtzewäert | „X dréckt méi vir … En wëllt virun der Apex méi lues gemaach an gedréint sinn" |

D'Charakterzich an der Zesummefassung: *hält méi Gripp* / *kann net sou hart drénken*, *beschleunegt besser* / *zitt manner*, *geet méi héich* / *geet méi nidderegt*, *zitt um Enn vun de Riichtstreck nach* / *geet am Schub aus*, *stoppt méi haart* / *brauch méi laang fir ze stoppen*, *ass méi stabil* / *verléiert den Hannen méi liicht* (*ass vill méi rutschig …* bei zweemol esou oft plus eent; *muss méi oft gefaange ginn* op lass Buedem), *dréckt vir*. „Wéineg Ënnerscheed zu Y op dësen Ronnen", wann et keen gëtt.

**Wéi een all fiert:**

- ee Auto hält méi Gripp an den anere zitt méi: an der Mëtt mat méi Geschwindegkeet duerch d'Kurv (d'„U") am griesseren, roundem Wee fueren, deen Auto mat dem Gripp; a riicht bremsen, an der kuerzer, enger Mëtt drénken an de Ausgank riichten (d'„V") am staarken;
- ee Auto ass bei béide hannendrun: seng beschte Ronn ass déi propperst - riichtaus bremsen, de breedste Radius, Vollgaas sou fréi wéi en hält;
- ee Auto, dat den Hannen méi liicht verléiert: de Gaas nëmmen nach an der Lenkung drénken, wann se sech ausdréit, a kuerz schalten (Rutscher um Gaas), oder d'Bremse suecht léisen an e stännegen Gaas duerch d'Mëtt halen (Rutscher beim Aklappen).

Den Hiweis ënnert dem Ofschnëtt widderhëlt, wéi all dovun gemooss gëtt.

## Wat d'Autoen an enger Kurv entscheeden {#what-the-cars-decide-in-a-corner}

Wann d'Ronnen a verschiddene Autoen sinn, endet all Fund zu enger verluerener Kurv mat **D'Autoen:** - wat dovun d'Autoen entscheeden, a wéi een dat Bescht aus dësem Auto maacht (`carNote`):

- **Duerch d'Mëtt**, wann dësen Auto manner wéi 96 % vum Gripp vum anere hält, deen anere beim lanksamsten Punkt méi wéi 0,5 m/s méi séier war, an dës Ronn net wäit ënner deem war, wat säin Gripp erkläert (iwwer 70 % dorunner): op der Linn vum anere Auto léisst de Gripp vun dësem Auto `v_anerer · √(Gripp_mäin / Gripp_anerer)` zou. Wann d'Ronn dat gedroen huet (bannent 1 m/s), ass d'Lück de Wagen, a kee Bremspunkt ännert dat; wann manner, wéivill nach do ass fir ze verdéngen. Dann, wou d'Zäit amplaz gewonne ka ginn: op engem Rietstreck, tëscht zwee, oder an engem Auto, dat 5 % méi haart drécken; nom Apex (riichtaus bremsen, méi spéit an d'Kurv gon, fréi op de Ausgank ausriichten); soss de breedsten Radius, deen d'Strooss erlaabt.
- **Een Hannen, deen hei lass gelooss huet** (en ongeteelte Rutsch oder Dréier, oder en Drift iwwer der Rutschgrenz op dem Wee dran), an engem Auto, dee en mindestens eemol pro Ronn méi oft a méi wéi d'Halschent méi oft verléiert: wat ze maachen an dësem Auto - de Gaas méi wéi d'Lenkung sech ausdréit, oder d'Bremse suecht léisen ouni Lift (seng Rutscher fänken zu 60 % oder méi um Gaas un).
- **Den Rietstreck duerno**: wann d'Schub vun den Autoen 0,03 s oder méi erkläert, dem anere säin staarkere Schub aus deer selwechter Geschwindegkeet, mat dem Schub vun deenen zwee Autoen vun 120 bis 200 km/h.
- **Spëtzegeschwindegkeet**: wann d'Ronn 98 % vun deem erreecht huet, wou säin Auto op engem Rietstreck méi wéi 150 m laang an der Spëtzt ass, an dee anere 1,5 m/s méi schnell war: dat ass d'Spëtzegeschwindegkeet vum Auto, an all km/h méi aus der Kurv hëlleft nach ëmmer, bis hien dohinner kënnt.
- **Bremsen**: wann den anere Auto 5 % méi haart bremst an dës Ronn méi wéi 5 m virdrun gebremst huet, datt e Stéck vun deem fréiere Bremsen dem Auto gehéiert.

De Undeel vum Auto gëtt och aus der Zäit selwer erausgeholl - kuckt [den Undeel vum Auto](race-corner-analysis.md#the-cars-share) -, an eng Kurv, wou de Wagen 60 % oder méi erkläert, gëtt dem Auto zougeschriwwen.

## Fir Entwéckler {#for-developers}

Code: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` an [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` an [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).

