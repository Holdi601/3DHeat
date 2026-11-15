---
title: "Level-Ausgesinn"
parent: "Levelen an Hannergrondgeometrie"
nav_order: 3
lang: "lb"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Level-Ausgesinn

Dës Reglage änneren, wéi en 3D-Level ausgesäit, sou datt d'Hëtzt sech dovun ofhieft an Dir de Plaz nach ëmmer liesen kënnt. Hei gëtt näischt un den Daten geännert.

## Séiere Start {#quick-start}

1. Lued e 3D-Level ([3D-Levelen](model-levels.md)).
2. Bei **Hannergrond / Level** setzt d'**Hellegkeet** erof, bis d'Hëtzt dat hellst Ding um Écran ass.
3. Maacht **Buedemrelief** op a erhéicht **Hangschattéierung** oder **Stäerkt vun den Héichtelinnen**, bis Dir e Bierg vun enger Ebene ënnerscheede kënnt.
4. Maacht **Strukturen** op. Setzt **Deckkraaft vun de Flächen** erof, fir an d'Gebaier ze gesinn, oder schalt **Strukturtextur** un, fir se massiv ze gesinn.
5. Wann de Buedem en Bild dropgemoolt hat, probéiert **Buedemtextur** aus a erëm un.

![D'Sektiounen Buedemrelief an Strukturen opgemaach, de Level mat Relief-Hiweiser gewisen](../assets/img/en/level-appearance-sections.webp)

Mat engem gelueden [3D-Level](model-levels.md) weist d'Panel Hannergrond / Level dës Reglage. D'Standarden sinn déi, déi e frësch importéierten Level kritt ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Wann Dir se ännert, gëtt nëmmen d'Szen nei gezeechent; d'Hëtzt-Accumulatioun bleift.

## De ganze Level {#the-whole-level}

| Reglage | Standard | Beräich | Bedeitung |
|---|---|---|---|
| **Deckkraaft** | 100 % | 0-100 % | Ënner 100 % gëtt de Level gemëscht an schreift keng Déift, also verdeckt en d'Hëtzt net méi ([Déift a Verdeckung](depth-and-culling.md)). |
| **Hellegkeet** | 0,9 | 0-2 (Schiebe 64) | |

De Level gëtt ouni Faarf gezeechent - graue Buedem, e liichten Faarftoun -, sou datt d'Hëtzt dat eenzegt faarwege Ding um Écran ass. Am Géigesaz zu engem [Kaartebild](map-images.md) huet en 3D-Level keen Schieber fir Entsättegung.

## Buedemrelief {#ground-relief}

Vu wäit ewech gesäit en Bierg an eng Ebene gleich grau aus, dofir fügt de Viewer dräi Hiweiser bäi. All vun hinnen beäntwert en aneren Fehler:

| Reglage | Standard | Bedeitung |
|---|---|---|
| **Ofstand vun den Héichtelinnen** | aus der Héichtespann vum Buedem | Héicht tëscht den Héichtelinnen, logaritmesch vun 1/4000 bis 1/2 vun der Héichtespann vum Level; déi ënnescht Spuer ass *aus*. De Standard ass 1/40 vun der Héichtespann vum Buedem, gerënnt op en 1/2/5-Schrëtt - 10-m-Linnen passen op e Bierghang a sinn op engem Steebruch-Buedem nutzlos. All 5. Linn gëtt méi staark gezeechent. D'Héichtelinnen ginn am Écranraum gezeechent, sou datt se bei all Zoom ee Pixel breet bleiwen, an si sinn déi eenzeg Hiweis, deen op Buedem iwwerlieft, deen ze flach ass fir iwwerhaapt schattéiert ze ginn. |
| **Stäerkt vun den Héichtelinnen** | 35 % | 0-100 % |
| **Hangschattéierung** | 55 % | Dunkelt no der Steelheet, sou datt Ufer a Fielsen vun all Kamerawénkel aus liesbar sinn - anescht wéi e Liicht, dat flaacht, wann Dir dorop kuckt. |
| **Héicteverlaf** | 50 % | Déi nidderegen Hänn méi donkel, déi héijen méi hell, iwwer d'Héichtespann vum Buedem: d'grouss Form. |

Den Titel vum Abschnitt weist den Zoustand vun den Héichtelinnen: *all N m*, den Ofstand vun den Héichtelinnen, oder *keng Héichtelinnen*, wann den Ofstand aus ass.

## Buedemfläch {#ground-surface}

| Reglage | Standard | Gewisen wann | Bedeitung |
|---|---|---|---|
| **Waasser** | un | den Level huet Waasser | Séien, Flëss an d'Mier, flach a bleechem Blo-Grau gezeechent: keng vun den Terrain-Hiweiser gëllen fir eng Fläch, déi per Definitioun eben ass. |
| **Deckkraaft vum Waasser** | 60 % | Waasser ass un | D'Küst an de Buedem ënner dem Flaachwaasser schéngen duerch dat duerchsiichteg Waasser. |
| **Buedemdräiecker** | 30 % (0 bei engem Level mat Texturen) | ëmmer | D'eegen Kanten vum Terrain, iwwer der schattéierter Fläch gezeechent, a sech tëscht 6 % an 25 % vun der Breet vum Level ab der Kamera ausbläichen. Weist, wéi grob de Buedem ofgeholl gouf, a gëtt enger Hang eppes, un deem d'Distanz gemooss ka ginn. Gëtt beim éischte Gebrauch gebaut, dat dauert bei engem groussen Level e Moment. |
| **Buedem nëmmen als Drotmodell** | aus | ëmmer | Ersetzt d'Terrain-Fläch duerch seng Kanten. Ganz schematesch - et verzicht och op d'Schattéierung, d'Héichtelinnen an d'Verdeckung, dofir ass *Buedemdräiecker* meeschtens déi bessert Wiel. |
| **Buedemtextur** | un | den Level huet Texturen | Zeechent de Buedem mat de Texturen, déi d'Datei dréit (Asphalt, Bordstee, Gras). D'Beliichtung vum Gitter gëtt drop sanft ugewannt, well d'Textur säin eegene feine Relief schonn dran huet. **Hellegkeet** ass de Wee, fir se ënner der Hëtzt roueg ze maachen; Entsättegung gehéiert zu Kaartebiller. |
| **Erfaasste Faarf** | aus | den Level huet Eckpunkt-Faarwen | Schattéiert de Buedem mat der Faarf, déi e Scan erfaasst huet, anstatt mat Grau - eng rekonstruéiert Strooss ass soss net vum Bordstee ze ënnerscheeden. Motorexporter hunn keng; wann si feelen, seet d'Panel *Dësen Level dréit keng Faarf.* |

## Strukturen {#structures}

D'Kopfzeil **Strukturen** weist d'Zuel vun den Dräieck vun de Strukturen; de Hiweis drënner seet, wéi se gezeechent ginn (*massiv a senge eegene Texturen gezeechent* oder *als duerchsiichteg Schuel gezeechent, sou datt Dir d'Hëtzt bannen gesitt*) a wéivill Deeler Strukturen sinn.

| Reglage | Standard | Bedeitung |
|---|---|---|
| **Strukturtextur** | un, wann d'Strukturen Texturen droen | Strukturen massiv an hiren eegene Texturen zeechnen. Un schalten setzt d'Flächen-Deckkraaft op 100 % an d'Kanten aus; aus schalten geet zréck op déi gefärwte duerchsiichteg Schuel mat 25 %. Eng texturéiert Struktur gëtt vun där Säit beliicht, déi d'Kamera gesäit, well e Schëld zwee Flächen Réck-un-Réck ass an wéi de Tiefentest entscheet, hänkt vum Rondungsfehler of. |
| **Drotmodell-Kanten** | un; aus bei méi wéi 300.000 Dräieck vun de Strukturen oder wann se texturéiert sinn | Zesummegeluegt Kanten vun de Strukturen, eng Linn pro Kant. |
| **Deckkraaft vun de Kanten** | 50 % | |
| **Schuelflächen** | un | Eng schwaach Fläch mat engem hellen Fresnel-Rand, sou datt en Gebai als Volumen liest an net als Gitter oder Niwwelbank. |
| **Deckkraaft vun de Flächen** | 25 % (35 % iwwer 300.000 Dräieck vun de Strukturen, 100 % texturéiert) | 0-60 % op der Spuer, bis 100 % mam Griff. Hält se niddreg: massiv Strukturen verstoppen d'Daten bannen. |
| **Schaarf Kanten** | un (aus bei Texturen) | Schattéiert all Dräieck no sengem eegene Normalvektor, am Fragment-Shader aus de Späicht-Ablëtungen am Écranraum ausgerechent. Exportéiert Levelen sinn zesummegeschweesst a ginn Duerchschnittsnormalvektoren mat, wat all Gebaiskant zu "geschmolzenem Folie" ronnt; all Eckpunkt ze trennen fir dat ze fixéieren, géif den Eckpunktspuffer vervillfachen. Stellt se aus fir e Level, dee seng gebéiert Flächen méi wichteg sinn wéi seng Ecken. |
| **Faarftoun vun de Strukturen** | Cyan | E Faarfwielen a Virlagen **Cyan**, **Bernstee**, **Violett**, **Wäiss**. |
| **Deelklassifikatioun weisen (N)** | | All Deel, seng Klass an de Grond; kuckt [3D-Levelen](model-levels.md#ground-structures-and-water). |

## Level schneiden {#cutting-the-level}

De [Schnitt](slice.md) an, mat *De Level och schneiden*, [Ofstandsgrenzen](depth-and-culling.md#distance-culling) schneiden de Buedem, d'Strukturen a d'Waasser an deenselwechte Fläche wéi d'Hëtzt.
