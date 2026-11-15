---
title: "Match-Analys (CS2)"
nav_order: 10
lang: "lb"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---

# Match-Analys (CS2)

De Tab **Match** spillt eng Opnam als Figuren zeréck, a fir e Counter-Strike-2-Match weist en och d'Resultatstabell: wiem all Ronn gewonnen huet, wéi, an wiem d'Ofschëss kruten. Benotzt en, fir e Match Ronn fir Ronn duerchzegoen, an dann an d'selwecht Momentt an der Heatmap ze sprangen.

Den Tab **Match** spillt all Opnam als Figuren of: eng War-Thunder- oder Tacview-Opnam, oder en CS2-Demo, déi ënner **Matcher am Replay** stinn ([Match-Replay](match-replay.md)). Eng CS2-`.match.json`-Datei bäidréit d'Resultatstabell, déi op dëser Säit beschriwwe ass.

## E CS2-Match duerchkucken {#review-a-cs2-match}

1. Konvertéiert d'Demo ([ënnen](#where-the-data-comes-from)) an eng `.parquet`- an eng `.match.json`-Datei.
2. Am Tab **Heatmap** lued d'`.parquet`-Datei ënner **Quell**.
3. Maacht den Tab **Match** op a klickt **Match-Fichiere lueden…**, oder fallt d'`.match.json`-Datei op d'Usiicht.
4. Klickt e Match ënner **Match-Zesummefassungen**, dann eng Zell vun der Rondenreih, fir déi Ronn opzemaachen.
5. Klickt **Ronn weisen**, fir déi Ronn an der Heatmap ze gesinn, oder **Ronn ofspillen**, fir se als Figuren ze kucken.

![De Tab Match: Rondenreih mat enger opgemaachter Ronn, Ofschossliste an Resultatstabell](../assets/img/en/match-analysis-round.webp)

Wieder wéi KAST, ADR, eco, force buy an trade stinn am [Glossaire](glossary.md#counter-strike-words).

## Vun wou d'Daten kommen {#where-the-data-comes-from}

De Demo-Konverter vum [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
mécht aus Demoen zwou Dateien pro Match, an engem Ordner pro Kaart:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Datei | Gelueden am | Hält |
|---|---|---|
| `<match>.parquet` | den Tab **Heatmap** (Quell-Panel, wéi all Parquet - eng Datei, méi wéi eng, oder de ganze Ordner) | all Spiller seng Positioun aacht Mol pro Sekonn, an all Evenement, wou et geschitt ass: Ofschoss, Doud, Verletzung, Schoss, Wuerf, Rauch, Blëtz, HE, Molotov, Lockvull, Blannéierung, Pflanzen, Entschäerfen, Explosioun; mat `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, Blickrichtung, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | den Tab **Match** | Equipen, Score, all Ronn (Gewanner, Wéi, Wirtschaft, d'Pflanzen, all Ofschoss an der Rei, Clutches, Iwwerliewend), all Spiller seng Resultatzeil |

De Fouss vun der Parquet-Datei dréit Liesanweisungen (Schlëssel `heat3d`), dofir mécht se sech ouni Astellung op: de Spiller als Persoun, d'Säit als Grupp, all Ronn (`roundId`, „<match> #NN") als Sessioun, d'Blickrichtung un, an d'Welt richteg erëm (d'CS2-Welt ass rietshänneg mat Z uewen; mat der Standard-Z-uewen-Zuerdnung liest, kéim se gespigelt eraus). Kuckt [Spalten-Zuerdnung](column-mapping.md) an [Dateien lueden](loading-files.md). `python -m heat3d_cs2 map <map>` exportéiert d'Geometrie vun der Kaart am selwechten Frame, gelueden an **Niveau**.

D'Konventioune hannert den Zuelen sinn vum Konverter (si stinn a senger README an an all Zesummefassung): e Doud ass **getradet**, wann säin Ëmbréngen vun engem vun de Teamkollegen vum Affer ëmbruecht gëtt, bannent **5 s**; **KAST** ass den Undeel vun de Ronnen mat engem Ofschoss, enger Hëllef (eng Blëtz-Hëllef zielt mat), Iwwerliewen oder engem getradete Doud; **Schued** ass tatsächlech verluerene Gesondheetszoustand, nëmme vu Gegner; e **Clutch** ass dee Lescht vun enger Säit, déi nach Gegner virun sech huet, gewonnen, wann d'Säit gewënnt; **Buy** pro Säit aus dem Duerchschnëtt vum Ausrüstungswäert um Enn vun der Freeze-Zäit - déi éischt Ronn vun all reguläre Halschent en Pistoulronn (keng an der Verlängerung), duerno ënner 1.500 $ en eco, ënner 4.000 $ en force buy, alles Méi en full buy.

## Den Tab {#the-tab}

D'Säitebar vum Tab Match huet uewen de Modus-Ëmschalter an d'Sessiounswiel vun der Heatmap, duerno d'Match-Ofschnitter, a ënnen d'Panelen **Filteren**, **Niveau** an **Kamera** vun der Heatmap - d'Usiicht ass d'Heatmap vun deem Parquet, dat am Tab Heatmap gelueden ass.

### Match-Zesummefassungen {#match-summaries}

| Steierung | Mécht |
|---|---|
| **Match-Fichiere lueden…** | wielt `.json`-Dateien (méi wéi eng op eemol): d'`.match.json`-Zesummefassungen |
| op d'Usiicht falen | JSON-Dateien, déi op d'Usiicht fale wann den Tab Match op ass, ginn esou gelueden (aner Dateien ginn ignoréiert) |
| **Läschen** | läscht all Match |
| **All Matcher** (bei zwee oder méi) | „N Matcher · M Ronnen": d'Statistik iwwer all vun hinnen |
| eng Matchzeil | „TeamA 13 géint TeamB 9", Kaart · N Ronnen: mécht dat Match op |

Eng Datei gëtt ugeholl, wann se JSON ass mat `"format": "heat3d-cs2-match"` an de Felder `rounds`, `players` an `teams`. Feeler stinn ënner den Knäppercher: „<Datei>: net JSON", „<Datei>: kee CS2-Match-Zesummefassung (heat3d-cs2-match)", „<Datei>: rounds, players oder teams fehlen". En Match, dat nees gelueden gëtt (selwechte `match`-Numm), ersetzt dat fréiere. Matcher sinn no der Kaart sortéiert, dann no Numm. Wann genau ee Match gelueden ass, gëtt en opgemaach; soss bleift d'Wiel (standardméisseg all Matcher).

Ouni datt eppes gelueden ass, erkläert den Ofschnëtt: konvertéiert mat `python -m heat3d_cs2 demos`, lued d'`.match.json`-Dateien hei a d'`.parquet`-Dateien am Tab Heatmap.

### Match (ee Match op) {#match-one-match-open}

**De Kapp:** béid Equipen mat hirem Score, d'Kaart, d'Halschenten - „Halschenten 7-5, 6-6": Ronnen 1-12 an 13-24 (Premier- an Kompetitiivspiller MR12; d'eege Halschentlängt vun enger Zesummefassung, wann se een uginn, also 1-15 an 16-30 fir MR15) - an, wann de Match an d'Verlängerung gaangen ass, säin Score alleng: „Verlängerung 4-2", d'Ronnen nom Enn vun beiden Halschenten. Eng remis Ronn zielt fir keng vun den Equipen. A „N Ronnen am Demo ofgeschnidden", wann d'Zesummefassung onfäerdeg Ronnen opzielt.

**D'Rondenreih:** eng Zell pro Ronn, faarweg no der Säit, déi gewonnen huet, mat hirer Nummer an engem Zeechen fir wéi se ended ass. Eng remis Ronn (kee Gewanner) ass eng neutral grau Zell mat `=`, nie d'Faarf vun enger Säit; hiren Tipp seet „Ronn 30: e Remis - keng Säit huet se gewonnen".

| Zeechen | Ënner |
|---|---|
| B | Bomm explodéiert |
| D | Bomm entschäerft |
| K | eliminéiert |
| T | d'Zäit ass ëm |
| S | Opginn |
| = | Remis |
| ? | anert |

Eng Trennlinn markéiert den Ufank vun der zweeter Halschent (Ronn 13, oder d'Ronn nom Halschentlängt vun der Zesummefassung) an vun all dräi-Ronne-Halschent vun der Verlängerung (Ronnen 25, 28, 31, …). Hält d'Maus iwwer eng Zell: „Ronn 7: TeamA (T) - Bomm explodéiert, A pflanzt" („…, pflanzt, Plaz onbekannt", wann d'Zesummefassung keng Plaz huet) an de Buy an de Ausrüstungswäert vun dësen zwou Säiten. Klickt, fir d'Ronn opzemaachen; nach eng Kéier, fir se zouzemaachen („Klickt eng Ronn fir seng Ofschëss, Wirtschaft a Wiederhuelung.").

**D'Ronn:**

- „Ronn 7: <Equipe> huet gewonnen - <Wéi>" („Ronn 30: e Remis - keng Säit huet se gewonnen" bei engem Remis) an wéi laang d'Ronn gedauert huet (vum Freeze-Enn bis zur Entscheedung, m:ss);
- d'Wirtschaft: all Säit hir Equipe, Buy (Pistoul, eco, force buy, full buy) an Ausrüstungswäert („$4,350");
- d'Pflanzen: Plaz, Spiller an d'Zäit an der Ronn (vun enger vun beiden Zesummefassungsversiounen); „Gepflanzt vun <Spiller> bei 1:05, Plaz onbekannt", wann d'Plaz net bekannt ass;
- **d'Ofschossliste**, an der Rei: d'Zäit an der Ronn, de Schéisser (an der Faarf vun der Säit; „world" ouni Schéisser), d'Waff, an d'Markéierungen - **HS** Kappschoss, **WB** duerch eng Mauer, **SM** duerch Rauch; **open** den éischte Ofschoss vun der Ronn, **trade** (en Teamkollegen an 5 s gerächt), **traded** (de Killer gouf bannent 5 s ëmbruecht), **team** en Teamkill (e Selbstmord zielt net). Ofschëss nom Entscheed vun der Ronn ginn ofgeschwächt;
- d'Clutches: „<Spiller> (T) eleng géint 3: Clutch gewonnen" / „verluer";
- wien um Enn iwwerlieft huet, pro Säit („keen");
- **Ronn weisen**: alles an dëser Ronn, an der Heatmap;
- **Ronn ofspillen**: spillt d'Ronn als Boxen vun hirem Ufank of (hei drënner).

**An der Heatmap weisen**-Knäppercher (kuckt [hei drënner](#show-in-the-heatmap)) fir dëst Match, oder fir déi oppen Ronn.

### Resultatstabell {#scoreboard}

Eng Tabell pro Equipe, eng Zeil pro Spiller:

| Spalt | Ass |
|---|---|
| K, D | Ofschëss, Doudeger |
| A | Hëllefen, Blëtz-Hëllefe mat abegraff |
| ± | Ofschëss minus Doudeger (gréng iwwer 0, rout drënner) |
| ADR | Schued pro Ronn, tatsächlech verluerene Gesondheetszoustand |
| KAST | % vun de Ronnen mat engem Ofschoss, enger Hëllef, Iwwerliewen oder engem getradete Doud |
| HS | % Kappschoss-Ofschëss |
| Open | gewonnen-verluer bei den Opening-Duellen |
| Cl | Clutches gewonnen/gespillt |

Hält d'Maus iwwer e Spiller: Trade-Ofschëss, getradet Mol, Blëtz-Hëllefe, geblëtzt Gegner, Schued duerch Hëllefsmëttel, an Ronnen mat Mehrfachofschëss („2×3k"). **Klickt en Spiller** fir seng Ofschëss a Dëtter an der Heatmap (dëst Match).

### Iwwer d'Matcher (All Matcher) {#across-matches-all-matches}

Iwwer all geluede Matcher:

- „N Matcher · M Ronnen · <Kaarten>", an „N Ronnen remis, vun keng Säit gewonnen", wann et Remisen gouf;
- **Gewonnene Rounden** pro Säit: insgesamt, op **Pistoul**-Ronnen (d'Pistoul-Ronnen aus der Zesummefassung), an op **eco**-, **force**- an **voll**-Buyen (all als Prozentzuel mat den gespillten Ronnen; hält d'Maus fir „gewonnen vun gespillt"). Eng remis Ronn gëtt vu béide Säiten gespillt an vun keng gewonnen;
- **Bomm**: Pflanzen pro Plaz, a wéi oft d'T-Säit dono dës Ronnen gewonnen huet („12 Pflanzen op A (T huet 67 % gewonnen)"), Pflanzen, deren Plaz d'Zesummefassung net vun eleng kennt („2 Pflanzen op enger onbekannter Plaz (T huet 50 % gewonnen)"), oder „ni gepflanzt"; wéi d'Ronnen ended sinn, dat Heefegst als éischt;
- „D'Säit, déi de Opening-Ofschoss gemaach huet, huet N % vun deenen Ronnen gewonnen." (e Selbstmord ass kee Opening-Ofschoss; eng remis Ronn setzt kee Opening-Ofschoss ëm);
- **Opening-Duellen, wou**: déi zéng Plazen mat de meeschte Set-Ofschëss (no wou d'Affer war; d'Plazennimm vum Spill liesbar gemaach, „TopofMid" → „Top of Mid"), Duellen an den Undeel, dén d'T-Säit gewonnen huet;
- **Spiller**: déi fofzéng beschten no Ofschëss minus Doudeger, zesummegezielt iwwer all hir Matcher (zouenee iwwer d'Steam-ID): Matcher, K-D, ADR a KAST gewiicht no gespillten Ronnen, HS% gewiicht no Ofschëss, Opening-Duellen. **Klickt en Spiller** fir seng Ofschëss a Dëtter iwwer all Matcher an der Heatmap.

D'Knäppercher „An der Heatmap weisen" fir all geluede Matcher sinn drënner.

## Wat d'Ronnen entscheed huet {#what-decided-the-rounds}

Den Tab zielt; [Erkenntnisser](insights.md#who-won-what-decided-the-rounds) erkläert. Mat der geluedener Heatmap-Tabell vun engem Match (si huet d'Kolonn `won`) deelt **Erkenntnisser** d'Ronne vun all Säit no deem, wat an hinne geschitt ass - dat Ouverture-Duell, den Akaf, en getradeten éischten Doud, de Plant, Utility, e fréien éischte Kontakt, all gehale Plaz an all Plaz, déi an den éischten 25 s erreecht gouf - a seet, wat den Ënnerscheed gemaach huet, mat dem Ënnerscheed vun de Gewannquoten, sengem 95%-Intervall an q, an *wéineg Ronnen*, wann e Grupp manner wéi aacht huet. Et nennt d'Wendepunkten (d'Kills an d'Plants, déi d'Siegwahrscheinlechkeet am meeschte verréckelt hunn) an d'Spiller a Plazen, déi am meeschte bäigedroen oder kascht hunn, an d'**Zesummefaassung** an de **Kommentator** fänke mat hinnen un. En erfonnt Beispill:

> T huet 79% vun den 19 Ronne gewonnen, an deenen et Mid gehalen huet, géint 24% vun 21 ouni (55 Punkten, 95% vun 26 bis 74) - q 0,004.
>
> Wendepunkten: Ronn 17 bei 48 s, e Kill vu CT um B-Site huet hir Chance vun 31% op 58% verréckelt, an si huet d'Ronn gewonnen.

Ee Match huet manner wéi 30 Ronnen, dofir kommen seng Siegwahrscheinlechkeeten aus engem fixe Virab-Modell vun de Leit, déi nach liewen, dem Plant an der Auer; den Text seet dat. Iwwer vill Matcher stellt d'[Massenanalys](mass-analysis.md#who-won) déiselwecht Froen.

## An der Heatmap weisen {#show-in-the-heatmap}

All Link setzt d'eege **Filteren** vun der Heatmap, sou datt dat, wat gewisen gëtt, am Panel Filteren sichtbar an ännerbar bleift, an **All weisen** läscht se. Si schaffen op der Heatmap-Tabell, déi am Tab Heatmap gelueden ass; de Match-Tab lued se ni selwer.

| Knäppchen | Evenementer gewisen |
|---|---|
| **Positiounen** | `position` - wou d'Spiller waren, aacht Mol pro Sekonn |
| **Ofschëss** | `kill` - wou de Killer stoung |
| **Doudeger** | `death` - wou d'Affer gefall ass |
| **Openings** | `kill` an `death` mat `opening` = 1 - den éischte Ofschoss vun all Ronn, wou béid stoungen (nëmme ugebueden, wann d'Tabell eng `opening`-Spalt huet) |
| **Smokes** | `smoke` - wou Rauch gelant ass |
| **Flashes** | `flash` - wou Blëtzer opgaange sinn |
| **Molotovs** | `molotov` - wou Molotovs an Brandbomme gebrannt hunn |
| **HE** | `he` - wou HE-Granaten explodéiert sinn |
| **Plants** | `plant` - wou d'Bomm gepflanzt gouf |
| **Shots** | `shot` - wou Schëss ofgefeiert goufen |

Gebonne u wou d'Knäppercher sinn: all geluede Matcher, dësen Match oder dës Ronn („An der Heatmap weisen - Ronn 7").

Wat net ugewannt ka ginn, gëtt ënner de Knäppercher gesot, net stil op näischt gefiltert: „keng Match-Spalt bewahrt - Match net ugewannt", „Match: X net an de gelueden Daten", dat selwecht fir Ronn an Evenementer, „Spiller X net an de gelueden Daten", „Säit X net an de gelueden Daten", „keng Heatmap-Daten gelueden: lued d'.parquet-Dateie vun de Matcher am Tab Heatmap". Ouni gelueden Daten soen d'Linken ausserdeem „Lued d'.parquet-Dateie vun de Matcher am Tab Heatmap, fir se op der Kaart ze gesinn."

**Ronn ofspillen** schält d'Heatmap zousätzlech op **Box-Replay**, d'Zäitlinn an de Spillmodus mat sengem Fënster op *Liewensdauer*, sprengt op den Ufank vun der Sessioun vun der Ronn a spillt of. Wann d'Ronn keng Sessioun vun de gelueden Daten ass: „dës Ronn ass keng Sessioun vun de gelueden Daten: näischt zum Ofspillen".

## Fir Entwéckler {#for-developers}

Code: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Zesummefassungsversiounen {#summary-versions}

Den Tab liest Zesummefassunge vun Versioun 1 a Versioun 2 (`"version"` an der Datei) nieft-enee a behandelt se gläich:

| | Versioun 2 | Versioun 1 |
|---|---|---|
| Pflanzzäit | Sekonnen an der Ronn, wéi bei den Ofschëss | Matchsekonnen; den Tab zitt den Ufank vun der Ronn of |
| Pflanzplaz | `A` oder `B`; leer, wann d'Demo et net seet | `A`, `B`, oder eng Entitéitsnummer - als onbekannt Plaz gelies |
| Halschentlängt | `halfLength`, vun deem Punkt, wou d'Säiten als éischt tauschen; 12, wann et null ass | 12 (MR12) |
| Pistoul-Ronnen | `pistolRounds` (Ronn 1 an déi éischt Ronn nom Halschent) | d'Ronnen, deenen hiren Buy `pistol` ass |
| remis Ronn | `winner` an `winnerTeam` leer | - |
| Selbstmord | `suicide` beim Ofschoss, ni e Teamkill | ausgemaach, wann Schéisser an Affer den selwechte Spiller sinn |

Den `noscope` an `attackerBlind` vun engem Ofschoss (Versioun 2) gi bei Tab Match net gewisen, deen och keng Plaz aus der Heatmap-Tabell weist, dofir ännert eng eidel `place` vun enger Granat-Zeil hei näischt.

Wéi e Fokus Filteren gëtt (`focusFilters`):

- **match** → e Kategoriefilter op der `match`-Spalt;
- **round** → e Beräichsfilter `round` = N op enger numeresch `round`-Spalt (e Kategoriefilter op enger kategoreschen), an d'Sessioun vun der Ronn (`<match> #NN`) gëtt am Sessiounswieler gewielt;
- **events** → e Kategoriefilter op der `event`-Spalt;
- **player** → e Persoun-Filter op deen Spiller;
- **side** → e Grupp-Filter.

