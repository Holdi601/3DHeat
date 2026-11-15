---
title: "Nahkampf a Runden"
parent: "Erkenntnisser"
nav_order: 2
lang: "lb"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Noukampf a Ronnen

Fir Shooter mat Ronnen (Counter-Strike als éischt, all Donnéeën mat Ronnen, Säiten a Killen), misst d'Erkenntnisser, wéi d'Gefechter gewonne goufen: wien d'éischt Duell gewonnen huet an wat dat wäert war, ob Doudesfäll gedeelt goufen, ob de Spiller, deen an e Wénkel eragaangen ass, de bass hat, deen hie gehal huet, ob Kräizfeier an Blëtzer sech bezuelt hunn, wéi d'Ronnechancen mat all Kill sech geännert hunn, an wéi eng Dieren d'Spiller ëmbruecht hunn, déi dodorch goungen. Benotzt et, fir ze gesinn, firwat Ronnen gewonne goufen, net nëmmen, wien d'Killen hat.

D'Moossunge kommen aus der Doktrin vum Zëmmerräumen an dem Stadkampf (den Doudestrichter, d'Dominanzpunkten, d'Kräizfeier) an aus dem E-Sport an der Sportanalys (Gewënn-Wahrscheinlechkeet, Wäert vun Aktiounen, bereinegten Plus-Minus). All gëtt duerch d'[Wëssenslens](knowledge.md) gelies an zitéiert.

## Probéiert et {#try-it}

1. Ladet een oder méi Matcher mat Ronnen (eng CS2-Konvertéierung huet alles, wat néideg ass).
2. Maacht **Erkenntnisser** op a dréckt **Erkenntnisser fannen**.
3. Ënner **Lëns-Moossen** liest d'Zeilen vun *Gewënn-Wahrscheinlechkeet pro Ronn* bis *Spiller-Impakt*; all huet seng Zuelen, hiert 95-%-Intervall, de q-Wäert an d'Quelle, déi se verfollegt.
4. Wielt d'Lëns **E-Sport** oder **Stadkampf**, fir se duerch déi Literatur ze liesen; **Mat KI schreiwen** schéckt se mam Bericht.

## Wat se misst {#what-it-measures}

| Moossung | Wat se seet | Wéi |
|---|---|---|
| Gewënn-Wahrscheinlechkeet pro Ronn | Wéi wahrscheinlech all Säit d'Ronn zu all Moment gewonnen hat | Logistesch Regressioun op d'Spiller, déi op all Säit liewen, d'Bomb oder de Ziel an hir Zäit, d'Rondenuhr an de Kaf, un d'geluedene Donnéeë ugepasst; d'Kalibrierung gëtt ausserhalb vun der Passung no Ronn geprüeft (Brier-Score an Skill, Log-Verloscht, Kalibrierfehler iwwer zéng Beräicher, Rekalibrierungssteigung, AUC) |
| Wäert vun Aktiounen | Wéi staark en Kill, en éischte Kill, en Austausch, en Kill hanner engem Blëtzer, e Bomb-Plant oder e Blëtzer d'Gewënnchance vun der Säit geännert huet | Gewënn-Wahrscheinlechkeet nodeems minus virdrunner; Austausch, éischt Kills an Kills mat Blëtzer ginn duerch Permutatioun géint déi anerer Kills getest |
| Éischt Duelle | Wéi eng Säit dat éischt Duell gewënnt, wéi oft dat d'Ronn gewënnt, a wou eng Säit d'Ufänk wäit iwwer hirem eegene Duerchschnëtt gewënnt | Wilson-Intervaller; Plazen duerch exakten Binomialtest géint den Undeel vun der Säit, q iwwer d'Plazen |
| Austausch | Dout, op déi e Matebierder mat engem Kill vum Killer bannent 5 s äntwert, d'Zäit dofir, a Ronnen, déi gewonne goufen, wann den éischte Doud ausgetauscht gouf | Fisher-Exakttest, Newcombe-Intervall |
| Peeker géint Holder | Duelle, wou ee Spiller an de Kampf gaangen ass (1,5 m/s oder méi an der leschter Sekonn) an deen anere stillgestanen ass (0,75 m/s oder manner): den Undeel vum Peeker | Exakte Binomialtest géint eng Hallschent |
| Zilen virum Duell | Dat Bléck vun all Spiller géint d'Richtung zum anere 0,75 s virum Kill; wien besser gezilt huet a wéi oft dee Spiller gewonnen huet; Holder op hirem Wénkel (bannent 15°) géint ausserhalb; Killdistanzen | Exakte Binomialtest; Fisher |
| Kräizfeier | Holder mat engem stëllen Teamkolleeg bannent 25 m vum Peeker, deenen hir Linn drop 35° oder méi aus hirer eegener ofwäicht, géint Holder eleng | Fisher, Newcombe |
| Hëllefsmëttel bei den Eenträg | Peeker hanner engem eegene Blëtzer vun hirer Säit (bannent 3 s an 15 m) oder engem Rauch (bannent 18 s) géint trocken Peeken; éischt Duelle mat engem Blëtzer just op enger Säit; geblend Affer | Fisher, Binomial |
| Mannvirdeel | Fir all Zoustand vu Spiller am Liewen (5v4, 4v5, 2v1 ...), deen als éischt an enger Ronn erreecht gouf, den Undeel vun de Ronnen, déi vun do aus gewonne goufen | Wilson-Intervaller |
| Clutches | Ronnen, wou eng Säit op hire läschte Spiller erofkoum: Gewënner géint déi erwaart Gewënner vum Modell, no Zuel vun de Géigner | Normal-Test vun der Beobachtung géint d'Erwaartung |
| Stacks, Rotatiounen, Lauer | Déi gréissten Grupp bannent 10 m beim éischte Duell (3 oder méi: gestackt); Spiller méi wéi 30 m vum éischte Kampf oder vum geplante Ziel an wéi séier se bannent 12 m kommen; Zäit an Kill-zu-Doud-Quot méi wéi 30 m vun all Teamkolleeg ewech | Fisher; Quotverhältnis mat Woolf-Intervall |
| Nom Plant an Retake | Ronnen, déi vun der plantender Säit gewonnen goufen, no den Zuelen beim Plant, an hire Undeel vun de Duelle nom Plant | Wilson-Intervaller |
| Tödlech Trichter | Eintrëtt an all Plaz (eng Ännerung vun der Plazkolonn, soss vun enger 8-m-Zell) an Dout bannent 2,5 s nom Eintrieden, géint d'Quot vun der Kaart | Exakte Binomialtest, q iwwer d'Plazen; Verhältnis mat 20 Eintréit op der Kaartquot gekierzt |
| Spiller-Impakt | Gewënn-Wahrscheinlechkeet, déi all Spiller pro Ronn bäidréit (Killen, Doudesfäll, Plants), mat empiresche Bayes gekierzt; Ridge-bereinegte Plus-Minus vun de Ronneresultater géint de Startwäert vum Modell; Killwäert no Plaz an Waff, gekierzt | Strof, gewielt mat fënnffacher Kräizvalidéierung |

All d'Tester vun enger Analys deelen sech eng Fals-Entdeckungsquot (Benjamini-Hochberg), mat allen Plazen, déi probéiert gi sinn, net nëmmen de gewisenen; de q, deen gewise gëtt, gëtt iwwer all dës Plazen gerechent. D'Modell an seng Kalibrierung ginn un d'geluedene Donnéeën ugepasst, sou datt se déi Populatioun beschreiwen: e Pro-Modell beurteelt Gelegenheetsspill falsch, an ëmgedréint.

Gepréift op synthetesche Ronnen mat agebaute Effekter (e Vireel vum Peeker, Kräizfeier, Blëtzer, ee tödleche Trichter, besser Zilen, déi gewannen), an op 100 Dateséizen mat deenselwechten Ronnen ouni sou Effekter, wou d'Fals-Entdeckungsquot vun den Tester mat agebaute Effekter bei den nominalen 5 % muss bleiwen (innerhalb engem Band) (`src/insights/cqb/cqb.test.ts`); op ongeféier dausend richtege Ronnen huet d'Modell e Brier-Score vun 0,14 erreecht géint 0,25 fir de Basiswäert, en Kalibrierfehler vun 0,03 an eng Rekalibrierungssteigung vun 1,0.

## Donnéeën, déi et brauch {#data-it-needs}

- **Zäit-**, **Spiller-**, **Säit-** an **Ronn-** (d'Sessioun) Kolonnen, a Killen a Doudesfäll an der Evenementkolonn; Ronnen, wou kee zweemol stierft, gi als Ausscheedungsronnen behandelt (Mannvirdeel, Clutches an d'Modell brauchen se);
- eng **Géigner-**Kolonn (`other`, `victim`, `killer`, `attacker`), déi bei engem Kill d'Affer an bei engem Doud den Killer nennt (ouni se ginn Killen an Doudesfäll am selwechte Moment paart);
- eng **Blécksrichtung** fir d'Zilmoossungen;
- eng rauh `event`-Kolonn, déi `flash`, `smoke`, `he`, `molotov`, `plant` a `defuse` nennt, fir Hëllefsmëttel an Plants;
- `won` (d'Säit vun der Zeil huet d'Ronn gewonn), `place` (Callouts), `weapon`, `buy` a `state_flashed`, wann d'Donnéeë se hunn.

D'Positiounen sollten e puer Mol pro Sekonn ofgetast sinn; Geschwindegkeeten, Zilen a Kräizfeier liesen déi lescht zwou Sekonnen virun all Doud.

## Am Opschlësselung {#in-the-breakdown}

D'[Opschlësselung](breakdown.md) misst véier vun de Situatiounen als Faktoren, mat a ouni: *geblend*, *Doud ausgetosch*, *Éischt Duell* an d'Zuelen (*Mann méi*, *gläich vill*, *Mann manner*), jeweils op K/D, gewonnen Ronnen, Iwwerliewen an Killen pro Minutt.

## Vill Matcher {#many-matches}

All Matchzesummefassung vun der [Analys vu ville Matcher](mass-analysis.md) mat enger Ronnkolonn dréit déiselwecht Moossunge als Zuele (`cqb` an der Zesummefassung): Éischt Duelle, Austausch, Peeks, Kräizfeier, Eintréit mat Blëtzer, Zilen, Mannvirdeel, Plants an déi 40 meescht betratenen Plazen mat hiren Eintréit a Doudesfäll. D'Zuele addéiere sech iwwer Matcher, sou datt tausend Matcher déiselwecht Undeeler ginn wéi eng grouss Analys. De Panel-Tab **Noukampf** weist se als Undeeler mat hiren Intervaller, iwwer all Kaarten oder pro Kaart; e Klick op eng Zeil lued d'Matcher, vun deenen se koumen.

## Fir d'Entwéckler {#for-developers}

`src/insights/cqb/`: `walk.ts` (ee Duerchgang duerch d'Zeilen an der Zäitreiefolleg, Ronnen getrennt gehalen, Duelle mat hirem Zoustand festgehalen), `finish.ts` (d'Moossunge an d'Zuele pro Match), `model.ts` (logistesch Regressioun mat IRLS, Kalibrierung, Ridge mat konjugéierte Gradienten, empiresch Bayes, Fisher, Newcombe, Permutatiounstester), `run.ts` an `worker.ts` (de Viewer: säin eegene Worker, nieft dem Erkenntnis-Duerchgang), `summary.ts` (de Sammler vun der Zesummefassung vu ville Matcher), `factors.ts` (d'Situatiounen vun der Opschlësselung), `shows.ts` (wat d'Lëns liest), `synth.ts` (d'Testronnen). D'Wëssensagänge sinn an `src/insights/knowledge/cqb.ts`, d'Muster an `patterns-cqb.ts`. D'Resultater ginn an de Bericht als `lens.cqb` geschriwwen.
