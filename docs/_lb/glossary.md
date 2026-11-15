---
title: "Glossar"
nav_order: 21
lang: "lb"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glossar

Kuerz Bedeitungen vun de Wierder, déi dës Säit benotzt, a klore Sprooch. All Entrée verlinkt op d'Säit, déi se ganz erklärt.

## Daten {#data}

**Zeil.** Eng Linn vun Ären Daten: eng Saach, déi op enger Plaz an enger Zäit geschitt ass, zum Beispill "Spiller 7 war hei an der 12. Sekonn". De Viewer zeechent all Zeil. [Datenformater](data-formats.md)

**Kolonn.** Eng Aart vu Wäert an den Zeilen, wéi x, y, z, Zäit oder Equipe. De Viewer erkennt, welch Kolonn wat ass, an Dir kënnt dat änneren. [Kolonnenzuuerdnung](column-mapping.md)

**CSV.** Eng eefach Textdabell: eng Zeil pro Linn, d'Wäerter mat Komma getrennt. Bal all Programm kann eng schreiwen. [Dateie lueden](loading-files.md)

**Parquet.** E kompakte Dabelle-Fichier, deen séier ze liesen ass, och mat Milliounen Zeilen. Et ass dat bescht Format fir den Viewer. [Dateie lueden](loading-files.md)

**Event.** Eppes, wat geschitt ass, wéi e Schoss, en Treffer, en Kill oder en Ofhiewen. Eng Zeil kann e Event sinn, oder just "ech war hei". [Filteren](filters.md)

**Persoun.** Deen, deen d'Zeilen gemaach huet: e Spiller, e Pilot, en Auto oder e Panzer. Eng Persoun ass eng Linn vu Positiounen duerch d'Zäit. [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md)

**Gruppe (Equipe).** E Set vu Persounen, déi an deeselwechter Faarf gewisen ginn, zum Beispill Blo a Rout. [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md)

**Sessioun (Match, Ronn).** Ee Lauf vum Spill. E Match oder eng Ronn ass eng Sessioun. De Viewer kann eng Sessioun weisen oder vill iwwer eenanner leeën. [Sessiounen, Persounen a Gruppen](sessions-persons-groups.md)

**Level.** D'3D-Kaart, op där d'Daten geschitt sinn: Buedem, Gebaier, Mauere. Zeilen erschéngen, wou se op dem Level geschitt sinn. [Levelen a Hannergrond-Geometrie](levels.md)

## D'Daten kucken {#looking-at-the-data}

**Heatmap.** E Bild, wou d'Plazen, déi vill Zeilen beréieren, méi hell gleewen. Kal Plazen sinn roueg, waarm Plazen sinn beschäftegt. [Hëtzt](heat.md)

**Heat.** Wéi vill op enger Plaz geschitt ass. De Viewer addéiert de Glanz vun all Zeil op all Plaz; d'Summ ass d'Hëtzt. [Hëtzt](heat.md)

**Sprite.** De klenge gleiwen Fleck, deen de Viewer fir eng Zeil zeechent. Vill iwwerlappend Sprite addéieren sech zu Hëtzt. [Sprite-Form](sprite-shape.md)

**Beliichtung.** Wéi hell d'Bild ass. Wéi bei enger Kamera mécht ze vill Beliichtung alles wäiss, an ze wéineg verstoppt d'Detailer. [Faarf a Belichtung](colour-and-exposure.md)

**Sättegung.** Déi Quantitéit Hëtzt, déi als "sou hees wéi d'Faarwen goen" zielt. Senkt se, fir roueg Plazen ze weisen; erhéicht se, fir nëmmen déi hëchst ze gesinn. [Faarf a Belichtung](colour-and-exposure.md)

**Volumen.** E Kaschtchen oder eng Form, déi Dir an der 3D-Usiicht setzt. De Viewer zielt, wat dra ass, an hie kann Volumen matenee vergläichen. [Volumen a Vergläich](volumes.md)

**Filter.** Eng Reegel, déi Zeilen verstoppt, déi Dir net wëllt, zum Beispill "nëmmen Killen" oder "nëmmen Equipe Rout". [Filteren](filters.md)

## Replay {#replay}

**Figur.** E klenge Modell vun engem Panzer, Fliger, Auto oder Zaldot, dee sech do beweegt, wou d'Daten sot, datt se war. [Figuren](figures.md)

**LOD (Detailgrad).** All Figur huet eng detailléiert, eng méi einfach an eng ganz einfach Versioun. Noer Figuren benotzen déi detailléiert, wäit Figuren déi einfach, sou datt Dausende op eng Kéier gezeechent kënne ginn. [Figuren](figures.md)

## Rennen {#racing}

**Runn.** Eng Fuert ronderëm de Parcours, vun der Linn bis zréck zur Linn. [Runnen lueden](race-loading-laps.md)

**Referenzrunn.** D'Runn, mat där all déi aner verglach ginn. Ënnerscheeder ginn als "méi séier" oder "méi lues" wéi déi gewisen. [Runnen lueden](race-loading-laps.md)

**Apex.** De Punkt an enger Kurv, wou d'Auto dem bannenzege Rand am nootsten ass. [Kurve fir Kurve Analyse](race-corner-analysis.md)

**Schlupp.** Wéi vill e Pneu rutscht. E bësse Schlupp gëtt de meeschten Hafft; ze vill, an d'Auto schléist sech. [Rennanalyse: d'Method](race-analytics.md)

**Hëllkurv.** Wat e Auto bei all Geschwindegkeet kann: wéi staark et kann dréinen, bremsen an beschleunegen, ier et rutscht. [Rennanalyse: d'Method](race-analytics.md)

## Fligerzuelen {#aircraft-numbers}

**ALT.** Héicht: d'Héicht iwwer dem Buedem oder dem Mieresniveau. [Match-Replay](match-replay.md#labels-and-statistics)

**TAS.** Richteg Loftgeschwindegkeet: wéi séier e Fliger duerch d'Loft fléie kann. [Match-Replay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** D'Grafikkaart oder de Chip. Si zeechent d'Bild a si vill méi séier wéi den Haaptprozessor, wann et ëm Millioune Flecken geet. [Déi zwee Backends](backends.md)

**WebGPU / WebGL2.** Déi zwou Weeër, wéi e Browser eng Säit d'GPU benotze léisst. WebGPU ass méi nei. Den Viewer kann een vun deenen zwee benotzen a wielt deen, deen Ären Browser am beschte kann. [Déi zwee Backends](backends.md)

## Counter-Strike-Wierder {#counter-strike-words}

**Ronn.** E kuerze Kampf an engem Match. Eng Säit gewënnt en, an d'Zuel steigt ëm een.

**Eco, Force Buy, Full Buy.** Wéi vill Geld eng Säit am Ufank vun enger Ronn fir Waffen ausgëtt. E Eco spuert Geld an kaaft bal näischt (ënner 1.500 $ pro Spiller am Duerchschnëtt). E Force Buy gëtt alles aus, wat ee huet (ënner 4.000 $). E Full Buy kaaft alles, wat geet. [Match-Analyse](match-analysis.md)

**Trade.** E Kill, deen en Kill zréckbezuelt: du gëss geschoss, an e Kolleeg schéisst däin Killer bannent 5 Sekonnen. [Match-Analyse](match-analysis.md)

**KAST.** Den Undeel vun de Ronnen, an deenen e Spiller e Kill, eng Hëllef, iwwerlieft hat oder getraded gouf. Eng méi héich Zuel heescht, datt de Spiller a méi Ronnen gehollef huet. [Match-Analyse](match-analysis.md)

**ADR.** Duerchschnëttlechen Schued pro Ronn: wéi vill Liewen e Spiller all Ronn vu Feinden verluer huet. [Match-Analyse](match-analysis.md)
