---
title: "Glossar"
nav_order: 24
lang: "lb"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Glossar

Kuerz Bedeitungen vun de Wieder, déi dës Websäit benotzt, a Klartext. All Entrée verlinkt op d'Säit, déi et ganz erkläert.

## Daten {#data}

**Zeil.** Eng Linn vun Ären Daten: ee Stéck, dat un enger Plaz a zu enger Zäit geschitt ass, zum Beispill "Spiller 7 war hei an der 12. Sekonn". De Viewer zeechent all Zeil. [Datenformater](data-formats.md)

**Kolonn.** Eng Aart vu Wäert an de Zeilen, wéi x, y, z, Zäit oder Equipe. De Viewer rode wéi all Kolonn ass, an Dir kënnt de Rot änneren. [Kolonnenzouweisung](column-mapping.md)

**CSV.** Eng eenfach Textdatei mat Tabell: eng Zeil pro Linn, Wäerter mat Kommaen getrennt. Bal all Programm kann eng schreiwen. [Dateien lueden](loading-files.md)

**Parquet.** Eng kompakt Tabelldatei, déi séier ze liesen ass, och mat Millioune Zeilen. Dat ass dat bescht Format fir de Viewer. [Dateien lueden](loading-files.md)

**Evenement.** Eppes, wat geschitt ass, wéi e Schoss, e Treffer, e Ofschoss oder e Start. Eng Zeil kann e Evenement sinn oder just "ech war hei". [Filteren](filters.md)

**Persoun.** Deen, deen d'Zeilen gemaach huet: e Spiller, e Pilot, e Auto oder e Panzer. Eng Persoun ass eng Linn vu Positiounen duerch d'Zäit. [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md)

**Grupp (Equipe).** Eng Rei vu Persounen, déi an der selwechter Faarf gewise ginn, zum Beispill Blo a Rout. [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md)

**Sessioun (Match, Ronn).** E Lauf vum Spill. E Match oder eng Ronn ass eng Sessioun. Den Viewer kann eng Sessioun weisen oder vill iwwer eenanner leeën. [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md)

**Level.** D'3D-Kaart, op där d'Daten geschitt sinn: Buedem, Gebaier, Mauere. D'Zeilen erscheinen do, wou se um Level geschitt sinn. [Levelen an Hannergrondgeometrie](levels.md)

## D'Daten kucken {#looking-at-the-data}

**Heatmap.** E Bild, wou d'Plazen, wou vill Zeilen virkommen, méi waarm gléinen. Kal Plazen sinn roueg, waarm Plazen si beschäftegt. [Heat](heat.md)

**Heat.** Wéi vill op enger Plaz geschitt ass. Den Viewer addéiert de Glanz vun all Zeil op all Plaz; d'Summ ass d'Hëtzt. [Heat](heat.md)

**Sprite.** De klenge gléngende Fleck, deen den Viewer fir eng Zeil zeechent. Vill iwwerlappend Sprite addéieren sech zu Hëtzt. [Sprite-Form](sprite-shape.md)

**Belichtung.** Wéi hell d'Bild ass. Wéi bei enger Kamera: ze vill Belichtung mécht alles wäiss, ze wéineg verstoppt d'Detailer. [Faarf a Belichtung](colour-and-exposure.md)

**Sättegung.** D'Quantitéit Hëtzt, déi als "sou waarm, wéi d'Faarwe ginn" zielt. Senken, fir roueg Plazen ze weisen; erhéicht, fir nëmmen déi waarmsten ze gesinn. [Faarf a Belichtung](colour-and-exposure.md)

**Volumen.** Eng Këscht oder Form, déi Dir an der 3D-Usiicht setzt. Den Viewer zielt, wat dra ass, an kann Volumen matenee vergläichen. [Volumen a Verglach](volumes.md)

**Filter.** Eng Regel, déi Zeilen verstoppt, déi Dir net wëllt, zum Beispill "nëmmen Ofschëss" oder "nëmmen Equipe Rout". [Filteren](filters.md)

## Replay {#replay}

**Figur.** En klent Modell vun engem Panzer, Fliger, Auto oder Zaldot, dat sech beweegt, wou d'Daten seet, dat et war. [Figuren](figures.md)

**LOD (Detailstufe).** All Figur huet eng detailléiert, eng méi einfach an eng ganz einfach Versioun. Noen Figuren huelen déi detailléiert, wäit ewech déi einfach, sou datt Dausende op eemol gezeechent kënne ginn. [Figuren](figures.md)

## Rennen {#racing}

**Ronn.** Eng Fuert ronderëm de Kurs, vun der Linn bis zréck op d'Linn. [Ronnen lueden](race-loading-laps.md)

**Referenzronn.** D'Ronn, mat där all aner verglach ginn. Ënnerscheeder ginn als "méi séier" oder "méi lues" wéi déi gewisen. [Ronnen lueden](race-loading-laps.md)

**Scheitelpunkt.** De Punkt an enger Kurv, wou d'Auto dem bannenzegen Rand am nootste ass. [Kurv-fir-Kurv-Analys](race-corner-analysis.md)

**Schlupp.** Wéi vill e Pneu rutscht. E bësse Schlupp gëtt den meeschte Griff; ze vill, an d'Auto schléckt. [Rennanalys: d'Method](race-analytics.md)

**Hëllecker.** Wat e Auto bei all Vitess ka maachen: wéi hart et dréien, bremsen a beschleunege kann, ier et rutscht. [Rennanalys: d'Method](race-analytics.md)

## Fliger-Zuelen {#aircraft-numbers}

**ALT.** Héicht: d'Héicht iwwer dem Buedem oder dem Mieresspigel. [Match-Replay](match-replay.md#labels-and-statistics)

**TAS.** Wouer Loftvitess: wéi séier e Fliger duerch d'Loft fiert. [Match-Replay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** D'Grafikkaart oder de Grafikchip. Hien zeechent d'Bild a ass vill méi séier wéi den Haaptprozessor, wann et ëm Millioune Fläck geet. [Déi zwee Backends](backends.md)

**WebGPU / WebGL2.** Déi zwee Weeër, wéi e Browser eng Säit d'GPU benotze léisst. WebGPU ass méi neier. Den Viewer kann een vun deenen benotzen a wielt de beschten, deen Ären Browser huet. [Déi zwee Backends](backends.md)

## Counter-Strike-Wieder {#counter-strike-words}

**Ronn.** E kuerze Kampf bannent engem Match. Eng Säit gewënnt en, an d'Punktzuel geet ëm een erop.

**Eco, Force-Buy, Full-Buy.** Wéi vill Geld eng Säit am Ufank vun enger Ronn fir Waffen ausgitt. E Eco spuert a kaaft bal näischt (ënner $1.500 pro Spiller am Schnëtt). En Force-Buy gitt dat aus, wat et huet (ënner $4.000). En Full-Buy kaaft alles, wat geet. [Match-Analys](match-analysis.md)

**Trade.** En Ofschoss, deen en Ofschoss zréckbezuelt: du gëss geschoss, an e Matspiller schéisst dengen Killer bannen 5 Sekonnen. [Match-Analys](match-analysis.md)

**KAST.** Den Undeel vun de Ronnen, wou e Spiller en Ofschoss, eng Assistenz hat, iwwerlieft huet oder getradet gouf. Eng méi héich Zuel heescht, de Spiller huet a méi Ronnen gehollef. [Match-Analys](match-analysis.md)

**ADR.** Duerchschnëttleche Schued pro Ronn: wéi vill Gesondheet e Spiller all Ronn vu Gegner geholl huet. [Match-Analys](match-analysis.md)
