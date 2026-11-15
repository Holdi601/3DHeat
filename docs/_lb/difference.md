---
title: "Ënnerscheed"
parent: "Hëtztmodi"
nav_order: 5
lang: "lb"
source: "difference.md"
source_hash: "12fc27dc0616"
translated: true
outdated: false
---

# Ënnerscheed

Rout, wou Team A méi war, gréng-blo, wou Team B méi war, näischt, wou se gläich waren.

**Ënnerscheed** (Tast 2) ass Hëtzt mat engem Vorzeechen. Zeilen vun enger Populatioun addéieren Hëtzt; Zeilen vun enger aner zéien se ab. Wou béid sech gläichméisseg iwwerlappen, ass d'Resultat null an ganz duerchsiichteg; wou eng dominéiert, weist se sech a senger Säitefaarf - standardméisseg waarm (duerchsiichtig → rout → giel → wäiss) fir d'**+**-Säit an kal (duerchsiichtig → gréng → blo → purpur) fir d'**−**-Säit.

![Ënnerscheedshëtzt: rout, wou d'+-Säit méi war, gréng a blo, wou d'--Säit méi war](../assets/img/lb/difference-split.webp)

## Benotzen {#how-to-use-it}

1. Dréckt `2` (oder wielt **Ënnerscheed** an der Modusleescht).
2. Maacht **Ënnerscheedsopdeelung** an der Säitelëscht op.
3. Wielt, **Opdeelen no** wat: normalerweis *Gruppen*.
4. Setzt eng Grupp (oder e Wäert) op **+** an eng anerer op **−**.
5. Liest d'Faarwen: waarm heescht d'+-Säit, kal heescht d'−-Säit. De Panel warnt, wann eng Säit keng Zeilen huet (kuckt [Noriichten, déi Dir gesi kënnt](#messages-you-may-see)).

*Wéi* zwou Populatiounen ass déi ganz Fro, dofir kann d'Opdeelung all behalen Kolonn sinn, net nëmmen Gruppen. Zeilen, déi op **keng** vun de Säiten falen, ginn **weggelooss**, net als null gezielt: dat mécht, datt eng Opdeelung iwwer zwee vu ville Wäerter genau dës zwee vergläicht, an et kombinéiert sech mat de [Filteren](filters.md) - filtert op eng Kaart erof, a deelt dann dat no Build op.

De Modus brauch zwou Säiten: eng Gruppekolonn mat op d'mannst zwou Gruppen, oder eng Opdeelung iwwer eng Kolonn, déi fir de Filter behale ass. Bei Donnéeën mat manner wéi zwou Gruppen fänkt e Lueden mat enger Kolonnen-Opdeelung un - d'Kolonn *Source file* bei engem Lueden vu méi Dateien als éischt, soss déi éischt Kategoriekolonn mat zwee Wäerter, soss déi éischt Zuelekolonn mat enger Spann - sou datt *zwee Lueden vergläichen* och bei Donnéeën ouni Gruppen funktionéiert. Nëmmen Donnéeën ouni dat alles maachen de Modus net verfügbar; dat geschitt och bei enger Kolonnen-Opdeelung, wou nach näischt op enger Säit ass.

## De Panel Ënnerscheedsopdeelung {#the-difference-split-panel}

Gewisen am Ënnerscheedsmodus, ënner den Hëtzt-Panelen.

**Opdeelen no** bitt un:

| Optioun | Gewisen als | Opdeelungsreegel |
|---|---|---|
| Gruppen | *Grupp (N)* (wann eng Gruppekolonn do ass) | All Grupp op +, − oder keng, an der [Team-Lëscht](teams-list.md) gesat |
| Eng Kategoriekolonn | *Kolonn (N Wäerter)* | Wäerter op +, − oder keng |
| Eng Zuelekolonn | *Kolonn (numeresch)* | E Wäertberäich pro Säit |
| D'Datei vun der Hierkonft | *Source file - zwou Lueden vergläichen* (wann méi Dateie gelueden goufen) | Dateien op +, − oder keng |

Nëmmen Kolonnen, déi beim Lueden ënner *Fir ze filteren behalen* bliwwen sinn, ginn ugebueden.

### Undeeler vergläichen, net Zuelen {#compare-shares-not-counts}

**Undeeler vergläichen, net Zuelen** (standardméisseg aus) gewiicht all Säit mat engem Duerch iwwer hir eegen Zuel vu Zeilen, sou datt eng Säit mat fënnef Mol méi Zeilen net nëmmen duerch d'Zuelen gewënnt. D'Faarf weist dann, wou all Säit méi heefeg ass am Verhältnis zur anerer. Benotzt et, wann déi zwou Säite ganz verschidde Mengen u Donnéeën hunn, zum Beispill zwou Sessiounen vu verschiddener Längt.

### Noriichten, déi Dir gesi kënnt {#messages-you-may-see}

De Panel warnt, wann d'Bild kee richtege Ënnerscheed ass:

| Noriicht | Bedeitung |
|---|---|
| *N + / M −* (oder *N + / M − / K net benotzt*) | Wéivill Wäerter op all Säit sinn (an op keng vun hinnen). |
| Kee Zeil am Fënster ass op der **+**-Säit | Nëmmen d'**−**-Säit gëtt gemoolt. Réckelt d'Zäitlinnen-Fënster oder ännert d'Opdeelung. |
| Kee Zeil am Fënster ass op der **−**-Säit | Nëmmen d'**+**-Säit gëtt gemoolt. |
| Kee Wäert ass op enger Säit | De Ënnerscheed zeechent näischt. Setzt op d'mannst ee Wäert op **+** oder **−**. |
| *Kolonn* kann sou net opgedeelt ginn | D'Kolonn passt net zur Opdeelung. Wielt d'Kolonn nei. |
| D'Opdeelungskolonn huet bei N vun M Bléicken net an de GPU-Späicher gepasst | Déi Zeile ginn net gemoolt. Erhéicht de GPU-Budget ënner Leeschtungspanel → Ressourcebudgeten, oder ladet manner Zeilen. |

### No Gruppe {#by-group}

De Panel weist just op d'[Team-Lëscht](teams-list.md), wou all Grupp e **+**- an e **−**-Knäppchen huet. Beim Lueden gëtt déi éischt Halschent vun de Gruppen (opgerënnt) op +, de Rescht op − gesat; **Gläichméisseg opdeelen** an der Team-Lëscht mécht dat nach eemol. Eng Grupp op keng Säit, oder mat hirem Kästchen verstoppt, dréit näischt bäi.

### No Kategoriewäerter {#by-category-values}

| Deel | Bedeitung |
|---|---|
| `a + / b − / c net benotzt` | Wéivill Wäerter op all Säit sinn an op keng. |
| **Läschen** | Setzt all Wäert op keng Säit. |
| Wäerterlëscht | All Wäert mat engem **+**- an engem **−**-Knäppchen (klickt de aktive nach eemol, fir en vun där Säit ze huelen). E eidelen Wäert steet als *(fehlt)*. |
| Limit-Notiz | Nëmmen déi éischt 200 Wäerter ginn ugewisen: *Déi éischt 200 vun N Wäerter ginn ugewisen. Eng sou breet Kolonn ass besser, wann Dir se fir d'Éischt mat engem Filter enkt, oder no Beräich opdeelt, wann hir Wäerter geuerdnet sinn.* |

Wann Dir d'Kolonn wielt, kënnt hire éischte Wäert op + an hire zweeten op −. Wann keng Säit iwwerhaapt e Wäert hat, fält d'Opdeelung op Gruppen zréck, amplaz e läiere Rumm ze weisen. *Source file* funktionéiert genau sou, ee Wäert pro Datei - sou vergläicht ee zwee Exporter, zwee Testlaf oder zwee Builds.

### No Beräich {#by-range}

| Deel | Bedeitung |
|---|---|
| Hiweis | D'Minimum an d'Maximum vun der Kolonn. |
| **Positive Beräich (+)**, **vun** / **bis** | Zeile mat engem Wäert an dësem Beräich, bei beiden Enden mat abegraff, addéieren. |
| **Negative Beräich (−)**, **vun** / **bis** | Zeile an dësem Beräich zéien of. |
| **An der Mëtt opdeelen** | Setzt + op [Minimum, Mëtt] an − op [Mëtt, Maximum] - dat ass och, wat d'Wiel vun der Kolonn mécht. |

E Wäert an béiden Beräicher zielt als +. D'Beräicher musse d'Kolonn net ofdecken; Wäerter an keinem falen ewech. *Déi éischt zwou Minutten géint déi lescht zwou* ass eng Beräich-Opdeelung op enger zäitähnlecher Kolonn.

## Faarwen {#colours}

De Ofschnëtt **Heat-Faarwen** weist an dësem Modus zwou Rampen-Editoren: **Positiv (additiv Equippen)** a **Negativ (subtraktiv Equippen)**, jiddereen mat sengem eegenen Zrécksetz-Knäppchen (*Zréck op duerchsiichteg → rout → giel → wäiss*, *Zréck op duerchsiichteg → gréng → blo → purpur*). De Komposit hëlt de absolute Wäert vun der Nettohëtzt duerch de [Sättigungspunkt an d'Äntwert](colour-and-exposure.md), a wielt d'negativ Rampe, wann d'Netto ënner null ass. Kuckt [Faarf a Belichtung](colour-and-exposure.md#the-ramp-editor).

Benotzt d'*Linear*-Dichtungsäntwert, wann d'Gréisst vum Ënnerscheed wichteg ass: dat ass déi eenzeg Äntwert, wou déiselwecht Faarf déiselwecht Zuel heescht.

## Fir d'Entwéckler {#for-developers}

All Zeil kritt en Vorzeechen vun +1, -1 oder 0 am Vertex-Shader ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); eng 0 wëscht d'Zeil fort, ier e Fragment gezeechent gëtt.

- Nom Grupp kënnt d'Vorzeechen aus enger 4 096-Eintrag-Gruppentabell, indexéiert mat der Grupp-ID vun der Zeil (d'Grupp-ID sëtzt am véierten Kanal vum Positiounstexel vun der Zeil).
- Nom Kategorie kënnt d'Vorzeechen aus enger zweeter 4 096-Eintrag-Tabell, pro Kategoriewäert gefëllt, an de Wäert vun der Zeil gëtt aus der Filtertextur vun der Kolonn gelies; e Wäert no dem Enn vun der Tabell gëtt op béide Backends ofgeleent.
- Nom Beräich gëtt de Wäert vun der Zeil mat den zwee Beräicher verglach.

Eng Ännerung vun der Opdeelung fänkt d'Akkumulatioun nei un.

**Verstoppte Gruppen bleiwen mat all Opdeelung verstoppt.** Ënner enger Opdeelung no enger Kolonn dréit d'Gruppentabell keng Vorzeechen méi; si hält 1 fir eng gewisen Grupp an 0 fir eng verstoppt ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), an béid Tabellen kommen zesumme beim Shader un - zwou Reien an enger Vorzeechen-Textur op WebGL2, zwou Hallschte vun engem Storage-Buffer op WebGPU. Eng Zeil gëtt nëmmen da gemoolt, wann hir Grupp gewisen ass *an* hire Kolonnewäert op enger Säit ass. Also dréit eng Grupp, déi an der [Team-Lëscht](teams-list.md) ofgewielt ass oder vum Säit-Fokus vum Match-Tab ewechgelooss gëtt, näischt bäi, egal wéi den Ënnerscheed opgedeelt ass.
