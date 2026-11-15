---
title: "Sampling a Budgeten"
parent: "Rendering-Interna"
nav_order: 3
lang: "lb"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Probennéiere a Budgeten

Wann et ze vill Punkten fir an engem Bild sinn, zeechent de Viewer eng gläichméisseg Probe a léisst all Punkt méi zielen, sou datt d'Bild richteg bleift. E Regler stellt no, wéi vill en zeechent, sou datt de Viewer seng Bildrate hält.

## Reglage vum Performance-Panel {#performance-panel-controls}

| Reglage | Standard | Beräich (Schiebe) |
|---|---|---|
| **All Zeil an all Frame zeechnen** | un | |
| **Adaptive Budget** | un | |
| **Zil-FPS** | 60 | 20-240 (1000) |
| **Sprites / Frame beim Start** (adaptiv) oder **Sprites / Frame** | 4,00M | 65.536-268.435.456, logaritmesch (268.435.456) |
| **Heat-Opléisung** | 100 % | 25-100 %, multiplizéiert mat der adaptiver Etapp-zwee-Skala |
| **Progressiv Verfeinerung** | un | Aus: all Bild ass eng frësch Eenzelbild-Schätzung (nëtzlech, fir d'roh Probe ze gesinn). |

Kuckt och [Performance-Panel an d'Statistiken](performance-and-stats.md).

## Fir Entwéckler {#for-developers}

### Kandidatezeilen {#candidate-rows}

D'Zeilen sinn an opsteigender Zäit gespäichert. D'Zäitlinn-Fënster [*lo*, *hi*] gëtt zu engem Zeilebereich mat zwou Binärsichen iwwer d'Zäitkolonn ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); ouni Zäitkolonn ass all Zeil e Kandidat. Dat sinn d'**Zeilen an der Fënster** vum Statistiken-Overlay. D'Tester pro Zeil - Filteren, Gruppen, Opdeelung, Verstoppen, Schnitt, Liewensdauer - lafen spéider am Shader; eng Zeil, déi duerchfällt, kascht ee Vertex-Opruff an keng Fragmenter.

### De Probeplang {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) deelt de Kandidatebereich an **Bléck vu 4.096 openerannerfolgenden Zeilen** an hëlt, wéi vill dovun gezeechent ginn, aus dem Sprite-Budget vum Bild:

- Wann d'Budget all Bléck ofdeckt, ginn all gezeechent - d'Bild ass exakt.
- Soss ginn d'Bléck an engem gläichméissege Schrëtt iwwer de Bereich geholl, mat engem Zoufall-Versatz, dee bei all Bild ëm de Goldene Schnëtt weidergeet, sou datt openerannerfolgend Biller anerer Bléck decken an d'Vereenegung sech gläichméisseg fëllt. Dat ass eng **geschichtet** Probe: all Deel vum Zäitberäich ass an all Bild vertrueden.

D'Hëtzt vun all gezeechneter Zeil gëtt mat **Kandidaten / ofgeschéckt** multiplizéiert, sou datt d'erwaart Hëtzt vun engem Bild bei all Budget exakt ass; nëmmen d'Rauschen hänkt vum Budget of. Zeilen liewen a Stécke vu 8.388.608 (kuckt [GPU-Erënnerungsresidenz](gpu-memory.md)); en Block gëtt getrennt, wann en eng Stéck iwwerschreift, an all Stéck kritt d'Lëscht vun den Blockufänke, déi et zéie muss.

E Plang kann héchstens 65.536 Bléck droen - 268.435.456 Sprites -, well béid Backends en fixen Puffer mat 65.536 Plaze fir d'Blockufänk hunn. Eng Ufro iwwer dat hannerhalen gëtt do ofgeschnidden, an de Feelbedrag weist sech ierlech a méi Biller bis zur Konvergenz.

### All Zeil an all Frame zeechnen {#draw-every-row-each-frame}

**Performance → All Zeil an all Frame zeechnen** (Standard **un**): d'Budget gëtt eng Ënnergrenz statt eng Uewergrenz, an e Bild, dat eng frësch Schätzung ufänkt, zeechent all Zeil, fir déi et verantwortlech ass (bis zum Plafong vun 268 Mio.).

De Grond: eng Kamerabewegung wëscht d'Accumulatioun, sou datt e bewegt Bild eng eenzeg Schätzung ass, deenen hiert Rauschen dervu bestëmmt gëtt, wéi vill Daten se gezeechent huet - wann eng Véierel gezeechent gëtt, gesitt Dir eng Véierel an hellen gewichtete Punkten, a dat mécht, datt eng bewegt Siicht gléiert. Alles ze zeechnen mécht all Bild zum fäerdege Bild. De Präis ass, datt d'Bildzäit elo der Gréisst vun den Daten am Fënster no geet; d'Hiewel sinn en méi schmuele Zäitfënster, Filteren, oder en Ofstandsschnitt, déi d'Kandidaten reduzéieren, anstatt se méi dënn ze probéieren.

Schalt et aus op Hardware, déi de ganze Feld net op eng Kéier packt: *Sprites / Frame* ass dann eng richteg Grenz, an d'Usiicht konvergéiert iwwer e puer stëll Bilder.

Wat e ganzen Plang kascht, gemooss op enger High-End-Desktop-GPU mat enger 4K-Leinwand a engem grousse Level, Sprites mat 1 m Radius (en oder zwee Pixelen): ongeféier 100 Mio. Sprites a Bild bei 30 fps, 200 Mio. bei 15 fps, an den Héchstwäert vun 268 Mio. bei ongeféier 12 fps. Bei sou klenge Sprites ass d'Vertex-Etapp de ganze Präis, an d'Hëtzt-Opléisung ännert näischt; bei grousse Sprites ass d'Fëllung de Problem: 8 Mio. Sprites mat 100 m Radius hunn 2,5 s pro Bild bei voller Hëtzt-Opléisung bruecht a 170 ms bei 25 %. **All Zeil an all Frame zeechnen** fänkt dofir bei 67 Mio. un, klëmmt ëm en Véierel pro Bild, sou lang d'Bild ënner 150 ms bleift, a halbéiert sech, wann se iwwer 400 ms bréngen, sou datt eng schwéier Siicht keen Bild iwwer dat leeft, wat den Watchdog vun der GPU erlaabt.

### Dat adaptiv Budget {#the-adaptive-budget}

**Performance → Adaptive Budget** (Standard un) stellt de Sprite-Budget esou an, datt **Zil-FPS** gehale bleift ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Et ruht bei der Box-Wiedergab an während Videoopnamen.

Den Input ass d'Bildzäit, geglättelt (90 % vum Véireg + 10 % vum Neien, mat eenzelen Bilder op héchstens 2 s begrenzt), géint en Zil vun 1000 / max(15; Zil-FPS) ms.

**Etapp eent - Sprites.** All Bild gëtt d'Budget mat `1 + (Zil / Bild - 1) × Gewënn` multiplizéiert, mat engem Gewënn vun 0,35, wann et ze lues ass, an 0,08, wann Luft do ass; begrenzt op e Faktor vun 0,5-1,25 pro Bild an op 65.536-268.435.456 Sprites.

**Etapp zwee - Opléisung.** Nëmme wann d'Budget schonn op senger Ënnergrenz ass an d'Bilder nach ëmmer méi wéi 10 % ze lues sinn, fällt d'Opléisung vun der Hëtztbuffer ëm 8 % pro Bild, bis op 25 % vun der Leinwand; si klëmmt ëm 4 % pro Bild erëm, wann 30 % Luft do sinn. D'Käschte vum Fragment falen mat dem Quadrat vun der Opléisung, a bei enger glatter Skala gesäit een dat kaum. (Gemooss op Software-Rendering mat 10 Mio. Zeilen a iwwergruewe Sprites: 141 ms → 17 ms pro Bild.) D'Skala gëtt op Sechzéngelen gerënnt; *Hëtz-Opl.* am Overlay weist se.

**Opginn.** E lues Bild gesäit déiselwecht aus, egal ob d'Sprites d'Ursaach sinn oder e schwéiere Level - et gëtt kee Timing pro Duerchgang. Wann d'Budget op senger Ënnergrenz hänkt a d'Bilder 30 Bild laang ënner 70 % vum Zil bleiwen, waren d'Sprites net d'Käschte: de Regler schalt op **Klëmmen** ëm, multiplizéiert d'Budget all 14 Bild mat 1,5 an stellt d'Opléisung erëm her, solang d'Bildzäit bei 1,5× vum bleift, wat se op der Ënnergrenz hat. Wann e Klimmen d'Saach méi schlecht mécht wéi dat, geet et op 60 % zréck an d'Normalsteierung fänkt erëm un; wann de Zil erreecht ass, hält de Klimmen op.

Wann dat adaptiv Budget aus ass, ass d'Budget einfach **Sprites / Frame**.

Mat *All Zeil an all Frame zeechnen* un leeft dat adaptiv Budget trotzdeem, awer d'exakt Regel hieft d'Budget bis dat all Kandidatezeilen deckt; a der Praxis steiert et nëmmen d'Opléisungsetapp an d'Bilder, déi keng frësch Schätzung ufänken.
