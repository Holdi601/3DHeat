---
title: "Massenanalys"
nav_order: 8
lang: "lb"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Massenanalyse: Dausende Matcher op eemol

Mat der **Massenanalyse** gesitt Dir, wat ganz Dossier vu Matcher zesumme ausmécht: wiem den Ënnerscheed mécht, wéi d'Säite gewënnt, wou et sech ofspillt. Benotzt et, wann Dir vill méi Matcher hutt, wéi Dir kënnt kucken.

Si schafft mat enger klenger Zesummefaassung vun all Match, dofir ginn tausend oder zéng Dausend Matcher séier op. Si lued d'ganz Zeilen nëmmen fir d'Matcher, op déi Dir klickt.

## Probéiert et {#try-it}

1. Maacht d'**Massenanalyse** an der Heatmap-Säitebar op.
2. Drëckt **Dossier…** (oder **Fichieren…**) a wielt Är `.3dheat`-Matcher.
3. Waart, bis d'Fënster d'Zesummefaassungen gelies huet („Zesummefaassunge... n vun N").
4. Drëckt **Analyse opmaachen**. En Fënster geet op mat Tabs.
5. Stellt d'Filter an (Spiel, Kaart, Modus, Vun, Op), dann kuckt en Tab, zum Beispill Balance.
6. Klickt op eng Zeil, eng Zell oder eng Erkenntnis: hir Matcher lueden an d'3D-Usiicht, mat der Kamera op der Plaz.

![De Balance-Tab: Gewënnquote an Ofschëss pro Doud no Fuerzeug](../assets/img/en/mass-balance.webp)

```
Dossier mat .3dheat -> Zesummefaassungen -> Fënster (Tabs) -> Zeil klicken -> Matcher gi 3D opgemaach
```

Eng `.3dheat`-Datei ass ee Match ([Eng Datei pro Match](container.md)). Eng *Heatmap* an eng *Zeil* gi am [Glossaire](glossary.md) erkläert.

## Zesummefaassungen kréien {#getting-the-summaries}

Fir déi meeschte Leit gëtt näischt gemaach: d'Panel rechent fehlend Zesummefaassunge selwer aus. Fir e grousst Dossier eemol virzebereeden, benotzt d'Offline-Werkzeug hei drënner.

All `.3dheat`-Match kritt eng Zesummefaassung (`src/mass/summarize.ts`), am Container als Member `<match>.summary.json` gespäichert (Roll `summary`, kuckt [Eng Datei pro Match](container.md)). D'Offline-Werkzeug schreift se, an e Verzeechnes pro Dossier. Et ass e Entwéckler-Werkzeug; leeft et op engem grousse Dossier, spuert dat dem Panel d'Aarbecht:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- E Match, dee scho zesummegefaasst ass (selwechte Formatversioun), gëtt nëmmen gelies; `--force`
  rechent en nei aus. `--no-write` léisst d'Container a Rou.
- Eng Datei, déi an de leschte `--settle`-Minutten (10) geännert gouf, bleift draus: en Konverter
  schreift vläicht nach.
- `<folder>/3dheat-index.jsonl.gz`: eng Zeil pro Match - Pad, Gréisst, Zäit
  an d'Zesummefaassung ouni d'Gitter. `<folder>/3dheat-index.grids.jsonl.gz`: eng Zeil pro Match
  mat sengem Gitter.
- Leeft et op der Maschinn, wou d'Dateien sinn, mat niddereger Prioritéit (zum Beispill `nice -n 19 ionice -c3` ënner Linux).

Fir all Match hëlt d'Panel dat éischt vun dësen: d'Index-Zeil vum Dossier (selwe Pad an Gréisst), de Cache vum Browser (IndexedDB, no Numm, Gréisst an Zäit), de `summary`-Member vum Container, oder eng Zesummefaassung, déi a engem Pool vun Aarbechter ausgerechent an gespäichert gouf. Also geet e Dossier ouni Index och - déi éischt Kéier mat der Gasche vum Liesen vun den Tabellen, duerno aus dem Cache.

## D'Panel {#the-panel}

Wielt en Dossier (oder Dateien; **Dossier derbäisetzen…** setzt en anert derbäi). D'Fënster huet d'Filter **Spiel**, **Kaart**, **Modus**, **Vun** an **Op**, eng **Opdeelen no**-Wiel, **Mannst Liewen** an **Nëmme Spiller**, an dës Tabs. All Zuel kënnt aus den Zesummefaassungen, a en Klick op eng Zeil, eng Zell oder eng Erkenntnis lued hir Matcher an d'Usiicht als Iwwerlagerung fir vill Matcher mat de Filtere, déi se weisen (Fuerzeug, Klass, Waff, Team, Spiller), an d'Kamera op der Plaz:

| Tab | Wat |
|---|---|
| Iwwerbléck | Matcher, Stonnen, Spiller, Liewen, Zeilen, Datumen; Matcher pro Dag; no Spiel, Kaart, Modus; Evenement-Summen; Wirtschaft no Währung; wann am Match wat geschitt |
| Balance | no Fuerzeug, Klass, Waff oder Team, opgedeelt no Kaart, Modus, Stufe oder Spiel: K/D mat sengem ~95%-Intervall, Gewënnquote (Wilson), Iwwerliewen, Ofschëss an Treffer pro Minutt, Verdéngscht pro Minutt, an q - d'Benjamini-Hochberg-Falsch-Entdeckungsquote vum K/D an vum Gewënn géint de Rescht vun der Opdeelung. **Mannst Liewen** verstoppt Zeilen mat ze wéinege Liewen, fir se ze gleewen; **Nëmme Spiller** léisst weg, wat d'KI vun der Missioun gefuer huet |
| Trends | Benotzung (Undeel vun der Präsenz), K/D oder Gewënnquote vun den Top-Fuerzeuger oder -Klassen pro Dag, Woch oder Mount |
| Spiller | verschidde Spiller, Matcher pro Spiller, Spiller pro Match, déi heefegst Spiller |
| Säiten | all Säit vun all Kaart: Matcher gewonnen géint eng gläich Opdeelung |
| Noh Kampf | Rondendaten: Ouverture-Duell no Säit an hir Ëmsetzung, Handelen, Peeker géint Halter, Kräizfeier, geblendte Participatiounen, Zilen, Pflanzen, Mann-Virdeel an, **No Kaart**, d'Plaze, déi d'Spiller doten, déi se betrieden - jiddwer ass e Undeel mat sengem Wilson-Intervall, aus de `cqb`-Zuelen vun de Zesummefaassungen ([Noh Kampf an Ronnen](close-quarters.md)) |
| R6-Flächen | d'Spueren vu Rainbow Six Siege um Level (Kugellächer an ähnleches) pro Levelfläch: Spueren, pro Ronn vun der Kaart, de Raum, den Undeel, bei deem de Schütz erausfonnt gouf; e Klick weist d'Aarte vu Spueren, d'Operateuren an d'Waffeklasse vun de Schützen, a wou op der Fläch d'Spuere sinn (eng kleng Heatmap aus Zelle vun engem Véierelmeter); eng Fläch behält hir ID iwwer d'Matcher vun enger Kaartversioun. Aus de `marks`-Zuele vun de Zesummefaassungen |
| Kaart | d'Gitter vun enger Kaart zesummegezielt: Präsenz, Ofschëss, Doudesfäll, K/D, all Evenement, Flow, an **heiss a wéi vill Matcher** (Stabilitéit); no Team, bei 1, 2, 4 oder 8 mol der Zell |
| Plazen | Plazen, déi an den Zuelen erausstiechen, awer net an der Heatmap (eng grouss Zon déi ganz beschäftegt ass, Korridorer, Héichtebänner), a Plazen, wou déi, déi se halen, méi oder manner vun hire Ronne gewannen; **Plaze fannen** |
| Nischen | Gruppen, déi markant besser oder schlechter sinn wéi de Rescht (e Fuerzeug op enger Kaart, e Sektor op enger Héicht), a Gruppe vu Ronnen, déi méi gewonne goufen, wéi hir Säit an deene selwechte Matcher gewonnen huet; **Nischen fannen** |
| Erkenntnisser | d'Massendetektoren an d'Kaartdetektoren (ënnen); **Rapport kopéieren (JSON)** gëtt de JSON, deen e Sproochmodell liest |

## Erkenntnisser iwwer vill Matcher {#insights-over-many-matches}

De Tab **Plazen** fënnt Plazen, déi an den Zuelen erausstiechen, awer net an der Heatmap - eng grouss Zon déi ganz beschäftegt ass, e Korridor, en Héichtebank, eng Plaz déi nëmmen an engem Deel vum Match beschäftegt ass - markéiert déi, déi déi einfach Heatmap net weist, als **verstoppt**, a skizzéiert se an der 3D-Usiicht; **Lueden** fléit dohinner mat de Matcher, déi et gehal huet. De Tab **Nischen** fënnt Gruppen (e Fuerzeug op enger Kaart a Säit, en Sektor op enger Héicht), déi markant besser oder schlechter sinn wéi de Rescht; klickt eng un, fir hir Verfeinerungen ze gesinn.

### Wien huet gewonnen {#who-won}

Wann d'Matcher soen, wien all Ronn gewonnen huet (d'[Resultatspalt](data-formats.md#outcome-columns) `won`), ass d'Resultat en eegent Zil:

- **Plazen: Gewannquot.** Fir all Säit den Undeel vun hire Ronnen op enger Plaz, déi si gewonnen huet, géint den Undeel, deen si am selwechte Match iwwerall gewonnen huet - sou sinn d'Gläichgewiicht vun der Kaart, vun der Säit a vum Match selwer d'Basis, an et stiechen nëmme Plazen eraus, wou déi, déi se halen, méi (oder manner) vun hire Ronne gewannen. En erfonnt Beispill: *"Dust: d'Säit T gewënnt méi vu senge Ronnen, wann si hei ass: 61% vun 412 gewonnen, géint 49% erwaart aus hirer eegener Quote an deene selwechte Matcher (Odds 1,6x; gehalen a 31/48 Matcher)."* Déiselwecht Kontrolle vun der Falschentdeckungsrate an der Stabilitéit wéi bei all Plaz; **Lueden** luet d'Matcher, an deenen et gehalen huet, a weist d'Positioune vun där Säit.
- **Nischen: Ronnesiege.** D'Tabell **Ronnen** huet d'Ronn vun all Liewen: d'Kaart, d'Säit, den Deel vum Match (Ronnen 1-4, 5-8, ...), d'Gefier (en Operateur, en Agent), d'Waff, déi et am meeschte benotzt huet, d'Plaz, déi et am längste gehalen huet, den Akaf (eco, force, full) an ob seng Säit den éischte Kill gemaach huet. E Grupp gëtt géint dat beurteelt, wat seng Säit an deene selwechte Matcher gewonnen huet, sou ass *T op Dust mat enger AWP* nëmmen eng Nisch, wann déi Ronnen méi dacks gewonne goufen wéi déi aner Ronne vun T an deene Matcher. En erfonnt Beispill: *"m1 · T · AWP: gewënnt 80% vun 320 Ronnen, géint 62% erwaart vun deene selwechte Säiten an deene selwechte Matcher (Odds 2,3x; 40 Matcher)."* Gerangéiert no dem Lift mol der Ënnerstëtzung; **Lueden** luet d'Matcher, an deenen hir Ronnen et am stäerkste weisen.

Béid brauche Zesummefaassunge vun der Versioun 2 (kuckt [D'Zesummefaassunge kréien](#getting-the-summaries)): eeler ginn nei berechent.

De Tab **Erkenntnisser** fënnt iwwer all Matcher Fuerzeuger, déi besser oder schlechter handelen oder gewannen wéi de Rescht, Plazen, déi an engem stabilen Undeel vun de Matcher heiss sinn, Säiten, déi méi gewannen wéi eng gläich Opdeelung, Fuerzeuger, deenen hir Benotzung sech iwwer d'Datumer beweegt, an Deeler vum Match, déi méi Ofschëss hunn wéi eng gläichméisseg Verdeelung. All Fund huet seng Zuelen, Effekt, Intervall an eng Falsch-Entdeckungsquote (op 5 % gehalen), an e Klick lued seng Matcher. Detailer: [Fir Entwéckler](#for-developers).

## Skala {#scale}

Dir kënnt eng kleng Versioun dovunner selwer nofueren: `node tools/demo-data.mjs` schreift 150 synthetesch Panzer-Matcher an `tools/.shots/demo/mass` (ongeféier 1.000 Zeilen all). Gemooss un deenen 150 synthetesche Demo-Matcher vun `tools/demo-data.mjs` op engem Desktop-PC (e richtege Match ass vill méi grouss):

- `tools/3dheat-summarize.mjs` mat 4 Aarbechter: 2,6 bis 4,8 s fir all 150, 8 bis 21 ms pro Match an engem Aarbechter; e zweeten Lauf, deen nëmmen d'Zesummefaassungen liest, dauert ongeféier 2 s.
- Dossier am Panel opmaachen, mat dem Index do, bis d'Fënster steet: 0,9 bis 1,6 s (dat Stéck vum Aarbechter selwer, d'150 Index-Zeilen liesen, sinn 20 bis 40 ms).
- Op en Tab wiesselen, bis seng Tabell gezeechent ass: Iwwerbléck 10 bis 30 ms, Balance 30 bis 70 ms, Trends 30 bis 45 ms, Spiller 15 bis 35 ms, Säiten 15 bis 20 ms, Kaart 55 bis 130 ms.
- De Store hält d'150 Matcher a ronn 0,5 MB.

D'Fënster opmaachen dauert ee kuerzen Frame: d'Dateien, déi gewielt goufen, ginn 16 op eemol dem Aarbechter, an d'Datumsfelder an den éischten Tab kommen een Frame méi spéit wéi d'Fënster.

De Store hält ongeféier 15 KB pro Match, also huelen 10.000 Matcher ~150 MB am Aarbechter; Gitter ginn ni méi gehal, wéi d'Kaart verlaangt huet.

## Fir Entwéckler {#for-developers}

### Erkenntnisser iwwer vill Matcher {#insights-over-many-matches}

`src/mass/detect.ts` - all Fund mat sengen Zuelen, Effekt a Intervall, p an q (Benjamini-Hochberg iwwer alles, wat den Detektor probéiert huet, op 5 % gehalen), den Drill-down, deen seng Matcher lued, an e Saz-Schlëssel mat sengen Wäerter; de Rapport (`heat3d.mass/1`) ass dat, wat `massReportForModel` engem Erzieler iwwergëtt, an der selwechter Form wéi de Rapport vun engem eenzelne Match (`insights/seam.ts`).

| Detektor | Fënnt |
|---|---|
| `balance` | e Spiller-Fuerzeug, dat besser oder schlechter handelt oder gewënnt wéi de Rescht op enger Kaart oder an engem Modus |
| `hotspot` | Plazen, déi an engem stabilen Undeel vun de Matcher, déi koumen, heiss sinn (Matcher heiss / Matcher gesinn, géint déi aner Zellen vun der Kaart) - net nëmmen heiss an der Summ |
| `side` | eng Säit vun enger Kaart, déi méi gewënnt wéi eng gläich Opdeelung |
| `meta` | den Undeel vun engem Fuerzeug u Spiller-Liewen oder säin K/D, dat sech tëscht der fréiere an der spéideren Halschent vun den Datumen beweegt - grouss genuch fir ze zielen, a Richtung iwwer d'Quartaler, op de meeschte Kaarten selwecht (ënnen) |
| `phase` | e Stéck vun der Matchlängt, dat méi Ofschëss, Treffer, Starten... hält wéi eng gläichméisseg Verdeelung |
| `place` | Plazen, déi iwwer vill Matcher erausstiechen (Etapp B, ënnen): d'Quot vun enger Regioun oder den Ofschosse-Undeel géint déi eegen vun all Match, Kreesen, Korridorer, gewuessen Zonen, Héichtebänner, Phasen; verstoppt, wann déi einfach Heatmap se net weist |
| `niche` | Gruppen, déi markant besser oder schlechter sinn (Etapp B, ënnen) |
| `grid.*` | d'Eenzel-Datensatz-Detektoren (Positiounen vun der Kraaft, heiss a roueg Zonen, Klassenplazen) op de zesummegeleeëten Gitter vun all Kaart: `GridMerge.toInsightJob` füllt d'Gitter vum Erkenntnisdurchgank aus den Zesummefaassungen; d'Detektoren, déi Spuere brauchen, iwwerspréngen dat |

### D'Zesummefaassung {#the-summary}

Einfache JSON (`src/mass/types.ts`), ongeféier 5-30 KB komprimiert pro Match:

- de Match: Spiel, Kaart, Modus, Missioun, Start, Längt, Zeilen, Liewen, Spiller,
  KI, Teams (Liewen, Spiller, Präsenz, Ofschëss, Doudesfäll, gewonnen, Suen), Gewanner;
- pro Fuerzeug an Team: Klass, Stufe, Liewen, Spiller-Liewen, Präsenz, Evenementer
  no kanonescher Aart, Ofschëss no der Klass vum Zil, Gewënn, Suen;
- pro Spiller (no User-ID, soss Numm): Team, Liewen, Präsenz, Ofschëss, Doudesfäll,
- mat enger Resultatspalt (Versioun 2): gewonnen a gespillt Ronne pro Team, Gefier (`rw`, all Liewen a Ronn eemol), Spiller a Waff (d'Ronnen, an deenen eng Säit se benotzt huet); d'Ronn vun all Liewen (`outcome.u`: Ronn, Säit, Gefier, d'Waff, déi et am meeschte benotzt huet, d'Plaz, déi et am längste gehalen huet, den Akaf, gewonnen) an d'Nummer, de Gewënner an d'Säit vum éischte Kill vun all Ronn (`outcome.r`);
  Treffer, Starten, gewonnen, Fuerzeuger; pro Waff: Evenementer no Aart;
- d'Spalten vun der Wirtschaft (`cost_*`, `earn_*`) an hir Summen;
- Phasen: Evenementer no Aart an 20 Bänner vun der Matchlängt an no der Minutt;
- Verhalen: d'kollektiv-Verhalens-Miessunge vum Match (Ausriichtung, Route-Herden, Spuere, Gedréngel, Leader, Nokommer, Briechpunkt, Risiko no Verloschter, Serien, Kafs-Iwwereinstëmmung, Ënnerdréckung), all mat engem eegene Null-Modell, p an q - kuckt [Kollektiivt Verhalen](collective-behaviour.md);
- d'Gitter (ënnen).

Gezielt wéi de Viewer zielt: Spalten, wéi de Massen-Loader se fënnt (`leanSpec`), Evenementer iwwer `data/canonical.ts`; e Kill, deen eng Tacview-Waff huet, zielt fir de Schéisser; e Doud, dee zweemol gläichzäiteg gemellt gouf (`dead`, `death`), zielt eemol.

#### D'Gitter: wat Etapp B drop opbaut {#the-grid-what-stage-b-builds-on}

De räumleche Deel ass fir Scan-Statistiken iwwer Regiounen vun iergend enger Gréisst a Form gemaach, net nëmmen fir Heatmap-Biller:

- **Eng Pyramid.** D'Zellen sinn ausgeriichtet Zweierpotenzen an Weltunitéiten (x, z sou wéi de Viewer se setzt). Niveau `k` sinn d'Zellen, zesummegezielt iwwer `ix >> k, iz >> k` - exakt, bannent engem Match an iwwer Matcher mat anere Zellgréissten - an all Regioun (e Kaschtchen, en Korridor laanscht eng Linn, en Rank) ass eng Summ vun Zellen. De feinste Niveau passt op de robuste Beräich vum Match (d'Zellen, déi 99 % vun der Präsenz hunn) mat 128 Zellen; Ausreißer dobaussen bleiwen.
- **Belaaschtung nieft all Zuel.** Präsenzsekonnen pro Zell, pro Team (`pt`), pro Fuerzeugklass (`pc`) an pro Héichtebank (`ph`), dofir ginn Rate, Erwaardung an Verhältnis vun enger Regioun fir all Ënnergrupp ausgerechent.
- **Héicht.** Bänner iwwer dem Matchboden (dat 1. Perzentil vun der Héicht): ënner 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, driwwer; eng Datei mat enger Spalt `floor`/`storey`/`deck` deelt no hire Stackwierker. `y` ass déi mëttler Héicht vun all Zell, `y0` déi nidregst (hir Etasch, fir d'Héicht driwwer).
- **Evenementer** als Tupelen `[cell, kind, team, class, band, count]`.
- **Ronnen no Resultat** (Versioun 2, mat enger Resultatspalt an zwou Ronnen oder méi): `pw` als `[cell, team, rounds won, rounds lost]` - d'Ronnen, an deenen all Säit eng Sekonn oder méi an der Zell verbruecht huet, no hirem Resultat an der Ronn.
- **Zäitscheiwen** op engem gréwen Niveau (8 Zellen pro Säit), no der Minutt vum Matchufank: `[cx, cz, minute, kind, value]`, Präsenzsekonnen als Aart `GRID_KINDS.length`; Matchphasen sinn Minutten iwwer d'Längt.
- Dënn besat, Zuelen ganz Zuelen, Sekonnen op ee Zéngtel: begrenzt duerch dat, wat geschitt ass.

### Etapp B: Plazen a Nischen {#stage-b-places-and-niches}

Etapp B sicht no deem, wat an den Zuelen erausstécht, ouni dat Aaer ze fänken: e grousse Beräich, deen als Ganzt beschäftegt ass, ouni heesse Zell dran, e komeschen Ofschoss-Doud-Verhältnis op wéinege Evenementer, e Korridor, e Héichtebank, e Cluster, deen nëmmen an engem Deel vum Match do ass - an Gruppen (e Fuerzeug op enger Kaart op enger Säit, e Sektor op enger Héicht), déi markant besser oder schlechter sinn wéi de Rescht. Ee **Plazen fannen** / **Nischen fannen** / **Erkenntnisser fannen** leeft all Detektoren; déi dräi Tabs deele sech den Rapport.

#### Plazen (`src/mass/scan.ts`) {#places-srcmassscants}

D'Matcher vun all Kaart ginn zweemol gelies, ee Match nom anere; de Späicher hält Summen op engem Raster vun héchstens 64 Zellen pro Säit (16 fir den Zäit-Raum-Scan), ni d'Matcher.

- **Miessungen.** Eng Evenement-Rate pro Sekonn Präsenz - Ofschëss, Doudesfäll, Treffer, Starten, Eroberungen, fir all Eenheeten, pro Klass (déi 4 mat de meeschte Evenementer), pro Héichtebank - an den Undeel vun Ofschëss an Ofschëss- an Doudesfäll (all, pro Säit, pro Bank), an d'**Gewannquot** vun all Säit: hir Ronnen an der Zell gewonnen géint verluer (`pw`), wou 8 Matcher vun der Kaart oder méi Ronnen no Resultat zielen. Wéi d'Klassen an d'Säiten erausfalen, kënnt aus de Käpp (`planOf`).
- **Erwaardung pro Match.** D'Rate vun all Match iwwer seng eegen Präsenz an enger Zell ass d'Erwaardung vun där Zell (en Kovariabel-ugepasste Kulldorff-Scan, no Match gesplat): e puer blutteg Matcher oder ee bezuelte Server maachen keng Plaz. Fir d'Gewannquot ass d'Erwaardung den eegenen Undeel vun der Säit u gewonnene Ronnen an deem Match, sou ginn d'Gläichgewiicht vun der Kaart an dat vun der Säit ni eng Plaz. Eng Ronn a méi Zelle vun enger Regioun zielt an all eenzelner; d'Streeung, déi bei der Gréisst vun der Regioun gemooss gëtt, dréit dat.
- **Opléisung.** Matcher weiche wäit vu Poisson of. D'Reschtwäerter vun all Match ginn a Bléck vun 1, 2, 4, 8, 16 Zellen zesummegezielt; d'Opléisung vun all Blockgréisst (quadréiert Reschtwäerter iwwer déi Nullvarianz, zesummegefaasst, déi schlechtst 5 % vun de Bléck fort) skaléiert all Test vun enger Regioun vun deer Gréisst: en Quasi-Likelihood-Verhältnis, Poisson fir Raten, binomial fir Undeeler.
- **Regiounen.** Kreesen vun 0,75 bis 18 Zellen; Ellipsen a sechs Winkelen, 3 an 6 Mol sou lang wéi breet, 3 bis 18 Zellen (Korridorer; d'Achs ass dat `place.path` vun der Erkenntnis); Zonen, déi Zell fir Zell wuessen aus den staarkste lokalen Getis-Ord-Gi*-Zellen, sou laang wéi den z vun der Regioun wiisst (ong regelméisseg Formen) - op der eenger Halschent vun de Matcher gewuess an op der anerer getest, sou datt d'Freiheet vum Wuessen keng falsch Plazen kascht; all Héichtebank géint d'anert Bänner vum Match iwwer d'ganz Kaart (cluster-robust); Zäit-Raum-Zylinner: e Kreis an engem oder zwee Fënftel vun der Matchlängt, géint d'eege Verdeelung vun de Evenementer vum Match iwwer Plaz a Zäit (de Zäit-Raum-Permutatiounsscan).
- **Testen.** p aus der Quasi-Likelihood; Benjamini-Hochberg iwwer all Regioun, déi op all Kaart probéiert gouf (700.000 op dräi Kaarten ass normal), op 5 %. Wat duerchkënnt, gëtt geschnidden (eng Regioun, déi gréisstendeels an enger stäerkerer vun hirer Miessung läit, seet dat selwecht), nach eng Kéier fir hir **Stabilitéit** gelies - d'Matcher, déi se gesinn hunn, d'Matcher, an deenen se gehalen huet, hir Richtung iwwer fënf Falten vun de Matcher - an nach eng Kéier getest bei der Variaz, déi d'Matcher selwer weisen (cluster-robust, Matcher als Cluster, ni ënner Poisson), BH nach eng Kéier. Roueg Plazen op enger Basis (2 % oder méi vun de Spawns, Ofhiewen an Landungen vun der Kaart) ginn ewechgelooss.
- **Effekt.** D'Quot vun der Rate (oder vun de Chancen), mat empiresch-Bayes geschrumpft (eng Gamma-Priorverdeelung, un d'2x2-Bloe vun der Kaart ugepasst), mat engem ~95%-Intervall bei der Opléisung; Gi* bei 1, 2 an 4 Zellen an lokal Moran am Zentrum.
- **Visuell Oflenkbarkeet.** Wéi vill d'Regioun schonn an der einfacher Heatmap vun hirem Evenement weist (logaritmesch Skala bis zur hellsten Zell, wéi d'Usiichten se zeechnen): hire Kontrast mat engem Ring drëm (en Zéngtel vun der Palette ass schwéier ze gesinn, zwee Fënftel normal) an eng hell Spëtzt, déi den Iwwerschoss dréit; eng Quot gëtt nie vun der Heatmap gezeechent, dofir zielt en Undeel hallef. Ënner 35 % ass **verstoppt**. De Rang: Stäerkt (Effekt, mat 4 Mol gesättegt, roueg Plazen bei 0,7) mal `1 - 0,7 x Oflenkbarkeet` mal d'Iwwereneestëmmung vun de Falten.

De Tab **Plazen** lëscht se op (standardméisseg nëmmen déi verstoppt; no Kaart, Form, Richtung), e Klick skizzéiert d'Plazen vun der Kaart an der 3D-Usiicht (`placeLines.ts`: d'Top-Linne vum Motor, eemol gebaut - magenta verstoppt, bernsteinfarweg normal, cyan roueg, déi gewielt voll; e Band als Kascht vu sengem Buedem bis zu sengem Plafong) an op der Lleinwand vum Kaart-Tab; **Lueden** fléit dohinner a lued déi 60 Matcher, déi et am meeschten gehalen huet, gefiltert op hir Evenement (an d'Klass).

#### Nischen (`src/mass/niche.ts`) {#niches-srcmassnichets}

Strahlsuche (Breet 24, Déift 3) iwwer dräi Tabellen: **Liewen** (d'Liewen vun de Spiller: Spiel, Kaart, Modus, Klass, Fuerzeug, Säit, Stufe, Quartal vun den Datumen, Drëttel vun der Matchlängt; K/D, Gewënn, Doud pro Liewen, Ofschëss pro Stonn, Verdéngscht pro Minutt), **Plazen** (Ofschëss an Doudesfäll no Kaart, Modus, Datumen, Sektor vun der Kaart 4 x 4, Klass, Säit, Bank) an **Phasen** (Sektor an Fënftel vum Match: K/D, Doudesfäll pro Stonn Präsenz). Eng Gruppe gëtt géint dat Ganzt gelies, mat Matcher als Cluster (d'Sandwich-Varianz vun hiren Reschtwäerter pro Match), hire Effekt eng Chance- oder Quotverhältnis, geschrumpft mat enger Prior vun 20 Resultater; si brauch 30 Resultater an 8 Matcher, eng Verfeinerung muss 10 % méi staark sinn wéi hire Elterendeel, Gruppen, wou d'Resultat null oder all ass (net opgeholl fir si), fale fort. Behalen: BH ënner 5 % iwwer all Gruppe geprüft, eng geschrumpften Quot vun 1,25 (oder 1/1,25) mindestens, véier vun fënnef Falten averstanen, keng Verfeinerung, déi just hiren Elterendeel widderhëlt. De Tab **Nischen** lëscht se op; e Klick weist all Verfeinerung mat enger Bedingung vun der Gruppe (den Entdecker), **Lueden** lued hir Matcher. Ausstattungen sinn nach net an den Zesummefaassunge.

Déi véiert Tabell, **Ronnen** (`roundsTable`), huet d'Resultat vun der Ronn als Zil: eng Rei pro Ronn vun engem Liewen - Kaart, Säit, Deel vum Match (Ronnen 1-4, 5-8, ...), Gefier, déi am meeschte benotzt Waff, déi am längste gehale Plaz, Akaf, éischte Kill oder éischten Doud - beurteelt géint d'Gewannquot vu senger eegener Säit a sengem eegene Match (déi stratifizéiert Erwaardung vu Mantel-Haenszel: de Rescht ass `won - e`, `e` den Undeel vun der Säit am Match), sou ass eng Nisch ni d'Gläichgewiicht vun der Kaart oder vun der Säit. D'Matcher bleiwen d'Cluster. Hiren z ass kalibréiert: déiselwecht Strahlsuche leeft aacht Mol op de Resultater, déi tëscht de Ronne vun all Säit vun all Match gemëscht goufen (d'Quote vun der Säit an all Match bleift), an d'Streeung vun dësen Null-z iwwer eng Standardnormalverdeelung eraus - pro Zuel vu Konditiounen, aus der Mëtt (Median / 0,674) an dem Enn (99. Perzentil / 2,576), dee gréissere Wäert, ni ënner 1 - deelt déi richteg z virun hirem p an der Falschentdeckungsrate (eng empiresch Null, Efron 2004). Méi déif Gruppe kréien déi gréisser Skala: d'Strahlsuche behält Verfeinerunge vu Gruppen, déi wéinst hirem groussen z gewielt goufen. D'Basis vun enger Nisch ass hir eegen Erwaardung, hire Lift d'Punkten doriwwer, a si gëtt gerangéiert no dem Lift mol der Quadratwuerzel vun hire Ronnen, gehale vum Beweis an de Folds (`wracc` ass d'Ënnerstëtzung mol de Lift). Si dréit d'Matcher, an deenen si sech am stäerkste gewisen huet (`matchIds`), an e puer vun hire Ronnen (`rounds`, `[match, round]`) fir d'Detailsiicht.

#### Verännerungen vum Meta mat praktescher Bedeitung {#meta-shifts-with-practical-significance}

Bei gemëschte Datumen huet d'Binomial op Liewen bal all Ännerung als bedeitend gemellt. `meta` testt elo cluster-robust (all Match seng Liewen e Cluster), behält eng Benotzungsverännerung nëmme vu 2 Punkten an op d'mannst 25 %, eng K/D-Verännerung vum 1,3-Fache, d'Quartaler vun den Datumen, déi an déiselwecht Richtung goen (Kendall's tau op d'mannst 0,5) an, bei engem Fuerzeug op ville Kaarten, dee selwechte Richtung op de meeschte vun hinnen. Dat léisst nëmmen e puer Verännerungen op engem Testset iwwereg, wou den einfache Test bal all markéiert huet.

#### Fir e Modell {#for-a-model}

`massReportForModel` gëtt all Plaz hir `region` (Form, verstoppt, Oflenkbarkeet, Héichten, Phase) an all Nisch hir `conditions`, plus wéivill Regiounen a Gruppen probéiert goufen. D'Wëssens-Linse kann Plazen als Killzonen an Ugrëffsachsen liesen: hir Aarten sinn `place.*` an `niche.*`.

#### Kontrollen {#checks}

`scan.test.ts` setzt eng diffus Zon (1,6 mol d'Dout-Rate iwwer e Kreis vu 22 Zellen, schwaach an all Zell), e Korridor, e Héichtebank an en Cluster nëmme vun enger Phas an 240 synthetesche iwwerstreiche Matcher - all fonnt, déi diffus verstoppt - an leeft aacht Null-Sätz vu 60 Matcher: keng Plaz. `niche.test.ts` fënnt eng agesat Fuerzeug x Kaart x Säit-Gruppe an näischt an fënnef Null-Tabellen. `outcome.test.ts` kontrolléiert d'Zesummefaassung vun der Versioun 2 (gewonne Ronnen no Säit, Eenheet, Spiller a Waff, `pw`, d'Ronne vun den Eenheeten); setzt eng Gaass, wou d'Säit 70% vun hire Ronne gewënnt géint 35% (all Match säin eegent Gläichgewiicht) - fonnt - a leeft 20 Null-Sätz vu 50 Matcher, wou d'Gaassen näischt soen: keng Gewannquot-Plaz; setzt eng AWP op eng Kaart, déi d'Ronne vun hirer Säit 30 Punkte méi dacks gewënnt - fonnt, mat hire Matcher a Ronnen - a leeft 30 Null-Sätz vun 80 Matcher, mat all Match sengem eegene Gläichgewiicht an enger Säit, déi op enger Kaart méi staark ass: keng Nisch.

