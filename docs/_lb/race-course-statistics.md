---
title: "Streckestatistik"
parent: "Course-Analys"
nav_order: 57
lang: "lb"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Streckestatistik

Ladet vill Ronnen vun enger Strecke, an de Viewer zielt d'Feeler: Kuerf, déi am meeschte Zäit kaschten, wéi vill Ronnen do schif gaange sinn, an firwat. Benotzt et, fir d'Kurv ze fannen, déi et wäert ass ze üben.

Probéiert et: **Demo-Ronnen** gëtt dräi Ronnen, duer dass dësen Abschnitt erschéngt.

![Streckestatistik mat der Feelerkaart: d'Strecke, gefierft no wéivill Ronnen an all Kurv Zäit verluer hunn, an d'Lëscht vun de Kuerwen](../assets/img/en/race-course-mistake-map.webp)

Ladet de ganze Dossier vun enger Strecke - dotzenden Ronnen, e puer Autoen, e puer Leeschtungsklassen - a jiddereng Ronn gëtt beurteelt an da gezielt. Dës Säit behandelt de Verglach no Klass, wat als Feeler zielt, den Abschnitt **Streckestatistik**, d'Feelerkaart, den Export an d'Heatmap, Strecken aus e puer Pisten an d'Leeschtungsgrenzen bei ville Ronnen.

## Géint de Beschten aus senger eegener Klass {#against-the-best-of-its-own-class}

Eng Ronn gëtt Kurv fir Kurv verglach mat der **schnellster vollstänneger Ronn vun hirer eegener Leeschtungsklass** (de Referenz, an der Klass vun der Referenz). Dës Ronn selwer gëtt mat deem verglach, deen aus hirer Klass an all Kurv am schnellsten war, oder mat all Ronn, wann se eleng an hirer Klass ass. Autoen ginn no der Leeschtungsklass vum Spill gruppéiert (am Forza vun D bis X; C an S2 si zwou dovun). Den Bremspunkt vun engem C-Auto gegen dee vun engem S2-Auto seet näischt iwwer d'Fuerkonst. D'Zäitkaart, d'Ofstänn an der Ronnlëscht an d'Tabell *Kurv fir Kurv* folgen deem selwechte Verglach (kuckt [mat wiem all Ronn verglach gëtt](race-corner-analysis.md#who-each-lap-is-compared-with)).

D'Statistiken sinn op der Analys vun all Ronn opgebaut, net nieft hir.

## Wat als Feeler zielt {#what-counts-as-a-mistake}

E **Virkomm** ass en Feeler vun enger Ronn an enger Kurv (Segment). D'Feeler vun enger Ronn an enger Kurv sinn:

1. **D'Fuerursaach**, déi d'Analys do fir hiren Verloscht fonnt huet - en Ergebnis, dat e Verloscht ass, dem Fuerer zougeschriwwen (net dem Auto oder der Situatioun), an dat **0,05 s** oder méi kascht géint seng Vergläichsronn. Hir Käschte sinn den Verloscht vun der Kurv.
2. **All Autokontroll-Feeler**, déi hien do gemaach huet an déi déi aner Ronn net gemaach huet (net gedeelt), a **0,03 s** oder méi kaschten - Blockéieren, Radspin, Hannerdeel, dat ausbricht, Schieben, Dréiung. Hir Käschte sinn d'eege vum Eventer.
3. **All Treffer a Crashen**, gedeelt oder net, egal wat se kaschten.

An enger Kurv kënne sech e puer Feeler sammelen; all Aart zielt **eemol pro Ronn an Kurv**. Gewënn, den Undeel vum Auto an e méi spéiden Erreechen, dat schonn an der Kurv virdrun entscheet gouf, sinn keng Feeler.

### Vun Ergebnisser zu Feeler {#from-findings-to-mistakes}

| Ergebnis | Feeler |
|---|---|
| ze séier eran, lues eraus, well et e puer Meter méi spéit gebremst huet wéi déi aner | Ze spéit gebremst |
| ze fréi gebremst | Ze fréi gebremst |
| ze schwaach gebremst | Ze schwaach gebremst |
| e Blockéieren als Ursaach | E Rad blockéiert |
| gerullt | Gerullt |
| Grip iwwreg, lues bis zum Scheitelpunkt, gebremst wou déi aner nëmmen de Fouss vum Gas geholl huet | Ze lues duerch d'Mëtt |
| eng ze enk Linn | Ze enk Linn |
| no baussen gedréckt | No baussen gedréckt |
| den Auto ze wéineg oder ze vill gedréint | Auto falsch gedréint |
| méi spéit um Power, méi spéit voll Gas, gezéiert | Spéit um Gas |
| méi lues aus der Kurv eraus | Méi lues eraus |
| Radspin | Duerchdréiend Rieder |
| den Hannerdeel ausgebrach, quer duerch d'Mëtt | Hannerdeel ausgebrach |
| ze wäit no baussen gaangen | Ze wäit no baussen |
| Vitess verluer | Vitess ofgebaut |
| Gas erofgeholl (bei der Aufahrt oder op der Gerade) | Gas erofgeholl |
| bal Stopp, Dréiung, Treffer oder Crash als Ursaach | Gedréint / Iergendwat getraff / Gecrasht, wann d'Ereignisser vun der Ronn dat soen (éischt Crash, dann Dréiung, dann Treffer); soss Bal gestoppt |
| en méi laangen Fluch | Ze wäit gefluegen |

Déi zwee Muster zielen d'Ursaach, déi an hinnen gefonnt gouf, an der selwechter Tabell. *Méi an der Aufahrt verschenkt wéi den Ausgank zréckbruecht huet* ass de Feeler vun der Ursaach vum Eventer: ze fréi gebremst ass *Ze fréi gebremst*, en Blockéieren *E Rad blockéiert*, am Rullen *Gerullt*, net genotzte Grip *Ze lues duerch d'Mëtt*. *Ze séier eran, lues eraus* ass *Ze spéit gebremst*, wann d'Ronn méi spéit gebremst huet wéi déi aner; soss den Feeler vun der Ursaach vum Ausgank - *Spéit um Gas*, *Duerchdréiend Rieder*, *Hannerdeel ausgebrach*, *Ze wäit no baussen*, *Méi lues eraus*. E Muster, deem seng Ursaach am Auto läit oder an engem méi laangsamen Erreechen, zielt net.

Net gezielt: méi laangsamt Erreechen, de Start, all *Auto*-Ergebnis (Zuch, Grip, Brems, Antrieb) an all Gewënn oder Kurv op engem Niveau.

### D'Aarte, an hirer Rei {#the-kinds-in-their-order}

Bremsen: *Ze spéit gebremst*, *Ze fréi gebremst*, *Ze schwaach gebremst*, *E Rad blockéiert*. Aufahrt: *Gerullt*, *Ze lues duerch d'Mëtt*, *Ze enk Linn*, *No baussen gedréckt*, *Auto falsch gedréint*. Ausfahrt: *Spéit um Gas*, *Méi lues eraus*, *Duerchdréiend Rieder*, *Hannerdeel ausgebrach*, *Ze wäit no baussen*, *Vitess ofgebaut*. Gerade: *Gas erofgeholl*. Virfäll: *Gedréint*, *Iergendwat getraff*, *Gecrasht*, *Bal gestoppt*, *Ze wäit gefluegen*.

## Den Abschnitt Streckestatistik {#the-course-statistics-section}

Gewisen ab **3** Ronnen, tëscht **Ronnen** a **Wou et ze verbesseren ass**.

- **D'Zesummefassung**: "40 Ronnen mat 9 Autoen, 3 Klassen: all Kurv gouf beurteelt géint déi schnellst Ronn vun hirer eegener Klass." (d'Autoen gezielt no der Startnummer oder dem Numm).
- **Klass-Chips** (bei e puer Klassen): **Alles** an ee Chip pro Klass, jiddwer mat senger Ronnzuel, an der Rei vum Spill (D, C, B, A, S1, S2, R, X, dann déi aner). Klickt op eng Klass fir nëmmen hir Ronnen ze gesinn; **Shift+Klick** setzt eng derbäi oder huelt eng eraus. Alles hei drënner - d'Lëschten, d'Kaart, den Export an d'Heatmap - follegt de Klassen, déi Dir gewielt hutt.
- **Wat am dackste schifgeet**: all Aart vun Feeler, déi meeschte Ronnen als éischt (dann déi meescht Mol, dann déi gréisste Käschte), héchstens 8 (**Alles N Aarten** weist de Rescht, **Manner** versteckt se erëm). Pro Zeil: den Numm, "N vu M Ronnen", e Balken vun deem Undeel, an "K Mol · ongeféier X s · am meeschten bei T3 (5), T7 (4), T1 (2)" - wéi oft et gemaach gouf (Ronn fir Kurv), wat et alles zesummen kascht, an déi dräi Kuerwen, wou déi meescht Ronnen et gemaach hunn. **Klickt eng Zeil**, fir se op der Feelerkaart ze weisen (an d'Kaart unzeschalten); nach eemol klicken fir all Feeler.
- **Kurv fir Kurv** (oder *Kurv fir Kurv - <Feeler>*, wann een ausgewielt ass): pro Segment "N vu M hunn Zäit verluer · X s" - Ronnen, déi d'ganz Kurv gefuer sinn, déi do **0,05 s** oder méi géint de Beschten vun hirer Klass verluer hunn, an all d'Zäit, déi se verluer hunn. Ageklappt, weist se déi dräi heefegste Feeler mat hiren Ronnzuelen. **Klickt eng Kurv**, fir se opzemaachen, mat der Kamera ze fänken an op d'Feelerkaart ëmzeschalten: fir all Feeler (oder nëmmen deen ausgewielten) eng Zeil wéi "12 vun 40 Ronnen hunn hei ze fréi gebremst. An 9 verschiddene Autoen - ongeféier 0,21 s all." an d'Ronnen, déi en gemaach hunn, **dat Schlëmmst als éischt**, all mat hiren Käschten - héchstens 8, "+N méi" fir de Rescht. **Klickt eng Ronn**, fir se ze fokussen an dee Feeler nei ze spillen (ugeriicht 40 m virdrun).
- **In der Heatmap weisen**: kuckt hei drënner. "Heatmap gëtt gebaut…", während et leeft; ausgegraut, wann et keng Feeler gëtt.

## D'Feelerkaart {#the-mistake-map}

**Usiicht → Feelerkaart** molt laanscht de Referenzwee, wéivill vun de Ronnen (vun den ausgewielte Klassen) an all Meter e Feeler gemaach hunn - vun all Aart, oder deem, deen an der Statistik ausgewielt ass. All Ronn zielt eemol pro Meter; d'Reechweit vun all Virkomm (wou seng Ursaach oder sengen Eventer war) gëtt op all Säit mat 6 m verbreet, sou datt eent Kuerz trotzdem sichtbar ass. Méi breet a méi hell, wou méi Ronnen dran waren: Breet `3 + 10 · (Ronnen hei / meeschte Ronnen iwwerall)` Meter, Faarf vun dënnem Brong bis hellem Orange; e graue 2-m-Streif, wou keng war. Legend: *wéineg Ronnen ↔ meescht Ronnen*.

Mat **Beschrëftungen** un, dréit all Kurv hire Scheitelpunkt mat hirem heefegste Feeler: "T3 · 12/40 ze fréi gebremst" (Ronnen, déi en gemaach hunn / Ronnen, déi d'Kurv gefuer sinn), "T3 · 12/40", wann eng Aart ausgewielt ass, "T3 · propper", wann keng. Wann Dir mat der Moss iwwer eng Beschrëftung fuert, weist eng Lëscht d'Verlusten vun der Kurv an hir fënnef heefegst Feeler; e Klick drop mécht déi Kurv an der Statistik op oder zou.

## In der Heatmap weisen {#show-in-the-heatmap}

**In der Heatmap weisen** gëtt dat Selwecht dem Heatmap-Tab als Datesaz mat dem Numm "Feeler op <Strecke>" (oder "Feeler op der Strecke"), sou datt dee ganze Werkzeigkasten vun der Heatmap - Hëtztmodi, Filteren, d'Zäitlinn, d'Schnëtter - op d'Plaze wierkt, wou d'Ronnen schifgoen.

Et ass eng CSV, déi am Späicher gebaut gëtt (`mistakeTable`), eng Zeil pro Gitterpunkt (all 2 m) vun all Virkomm, bei der **eegener Positioun vun der Ronn** do:

| Kolonn | Inhalt |
|---|---|
| `x`, `y`, `z` | d'Positioun vun der Ronn bei deem Meter (Spillkoordinaten) |
| `elapsed` | d'Zäit vun der Ronn do, s |
| `lap` | den Numm vun der Ronn |
| `car` | den Numm vum Auto (oder "car 1234") |
| `mistake` | den Numm vum Feeler, an der aktueller Sprooch |
| `car_class` | d'Klass, `-`, wann keng |
| `corner` | den Numm vun der Kurv, `T3` |
| `cost` | d'Käschte vum Virkomm, s |

Et gëtt iwwer de eegene Lueder vun der Heatmap gelueden, mat Mapping-Hiweiser: Y ass uewen, keng Achsendréinungen, Skala 1; Zäit `elapsed` a Sekonnen; **Persoun** = `car`, **Grupp** = `mistake`, **Sessioun** = `lap`; keng Blécksrichtung; `car_class`, `corner` und `cost` bleiwen als Filterkolonnen. De Tab wiesselt dann op **Heatmap** a rahmt d'Date. Nëmmen d'Klassen, déi an der Statistik ausgewielt sinn, ginn exportéiert.

## Strecken aus e puer Pisten {#courses-from-several-tracks}

Ronnen gi **eng Strecke op eemol** analyséiert. E Dossier mat Ronnen vun e puer Strecken - déi ganz Ronnbibliothéik - bitt all Strecke fir sech zum Lueden un (mat hirer Ronnzuel, déi meescht fir); Ronnen vun Fahrten, déi ni fäerdeg gi sinn (`unfinished/` vum FH Companion), ginn mat hirer Strecke, markéiert *partiell*. Ronnen vun e puer benannten Pisten, déi als Dateien ausgewielt sinn, ginn op déiselwecht Manéier ugebueden; Ronnen ouni Pistennumm gi mat där Piste, déi ausgewielt ass. Wann Dir Ronnen vun enger anerer benannter Piste lued, ersetzen se déi bis elo gelueden.
Detailer: [Ronnen lueden](race-loading-laps.md#folders-and-courses).

## Leeschtung mat ville Ronnen {#performance-with-many-laps}

Dotzen Ronnen ginn an enger oder zwou Sekonnen analyséiert (all vun hinnen, ëmmer). Wat gemoolt gëtt, ass limitéiert, sou datt d'Usiicht bei der Biller-Frequenz bleift:

| Grenz | Wäert | Effekt |
|---|---|---|
| Ronnen, déi standardméisseg gemoolt ginn | 8 (`SHOW_ALL_UP_TO`) | iwwer 8 gelueden Ronnen sinn nei derbäigesate Ronnen verstoppt, ausser si sinn d'Referenz, d'fokusséiert Ronn oder dee Beschten vun hirer Klass. **All weisen** moolt all Ronn; **Nëmmen déi gekuckten** geet zréck. Eng Ronn fokussen huet se erëm sichtbar, a mat deem Beschten vun hirer Klass |
| eenfach Autoen an dënn Linnen | iwwer 10 sichtbar (`PLAIN_PAST`) | Ronnen ausser dem Fokus, dem verfollegten Auto an der Referenz: e Linnepunkt all 6 m (amplaz 1,5 m), Autoen eenfach gemoolt |
| Ronnen am Diagramm | 8 (`CHART_LAPS`) | Fokus, de Beschten vun hirer Klass an d'Referenz als éischt; "+N méi gemoolt, net am Diagramm" |
| HUD-Kaarten | 6 | déi éischt sechs sichtbar Ronnen |
| Statistiken | vun 3 Ronnen un | den Abschnitt ass drënner verstoppt |
| Ergebnisser ugewisen | 12 Fuerer, 8 Auto/Kontext, 10 Gewënn | pro fokusséierter Ronn |
| Autopaare gewisen | 3 | iwwer 3 Paren, ee Paar mat enger Auswiel |

D'Feelervirkommen ginn eemol pro Analys ausgerechent an zwëschegespäichert; d'Dicht vun der Feelerkaart gëtt pro Klassenauswiel a Feeler zwëschegespäichert.

## Fir d'Entwéckler {#for-developers}

Code: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` an [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
