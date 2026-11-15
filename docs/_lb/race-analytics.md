---
title: "Rennanalys: d'Method"
parent: "Course-Analys"
nav_order: 58
lang: "lb"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Course-Analys: d'Method

Kuerz gesot:

- Ronnen ginn **no der Distanz** verglach, net no der Zäit, sou datt déiselwecht Plaz um Parcours sech deckt.
- All Kurv gëtt **als Ganzt** beuerteelt, vu enger Bremszon bis zur nächster.
- D'verluer Zäit gëtt **opgedeelt** no wou se verluer gaangen ass (Bremsen, Eragang, Ausgank, Riichtstreck) a wéi vill dovun den Auto erkläert.
- D'Ursaach gëtt **a Wieder erkläert**, mat Rot.
- Fir et ze benotzen, net fir ze liesen, wéi et funktionnéiert: kuckt [Course-Analys](race-analysis.md).

Dat ass d'Method hanner dem Tab **Course-Analys**: wat se miesst, wéi se entscheet, wou d'Zäit higaangen ass, an wéi se dat a Rot ëmsetzt. Et ass d'Spezifikatioun, un déi sech de Code vun der Analys (`src/race/`) hält, sou datt all Regel hei e Géigestéck dra huet an en Test, deen se festhält.

## Wat déi professionell Tools maachen {#what-the-professional-tools-do}

Déi etabléiert Tools kommen op deeselwechte Kär zesummen a sinn haaptsächlech a wéi wäit se an Richtung *Ursaachen* goen:

- **Alles gëtt no der Distanz verglach, net no der Zäit.** Zwou Ronnen ginn op eng Distanzachs gemëttelt; de lafende Ënnerscheed an der vergaangener Zäit bei der selwechter Distanz ass den *Delta* (MoTeC nennt et Zäitvarianz, anerer Zäitverloscht- oder Delta-Kurv). Seng Steigung seet, wou gerad Zäit verluer geet: eng flaach Steigung ass Beschleunegung, Widderstand oder duerhalen Gripp; eng steil eng Bremsen- oder Gas-Differenz; eng Welle mat Op a Erof en Tausch tëscht Eragangsgeschwindegkeet an Ausgank. ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/), [Sektiounszäit-Analys](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html), [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **All Kurv gëtt a Phasen opgedeelt**: Bremsen, Eragang, Mëtt, Ausgank - Bremspunkt, Spëtzebremse an Lassgoen, lamsamsten Punkt an wou en ass, Gang, Gas-Opnahm, Réck op de Vollgas, Ausgangsgeschwindegkeet. ([Driver61: sechs Phasen](https://driver61.com/uni/corner-phases/), [iRacing-Guide zur Rondenanalys](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-Sektoren pro Kurv, an eng theoretesch beschte Ronn**, zesummegesat aus dem Schnellsten vun all Stéck. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps), [Overcut](https://overcut.gg/))
- **Déi gefuer Linn gëtt och verglach**, awer ni eleng: "eng Linn op engem Bild bedeit näischt, bis ee déi mataktiv Faktore kennt" - si gëtt mat der Geschwindegkeetskurv an dem Delta gelies. ([Track Titan: Telemetrie analyséieren](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing), [Sim Racing Telemetry: Renlinnen](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **D'Wuerzel, net de Symptom.** Ass de Verloscht op der Riichtstreck wierklech de Gas, oder huet en schlechte Eragang de Gas spéit erzwongen? Feeler ginn no Ronnzäitkäschten gerangéiert an a klore Wieder erkläert. ([Track Titan Coaching-Flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Wat an der éischter Versioun falsch war, a firwat et wichteg ass {#what-went-wrong-in-the-first-version-and-why-it-matters}

D'éischt Versioun huet all *Phas* separat bezuelt an nëmmen Verlëscht ugekuckt. Eng Ronn, déi méi fréi gebremst huet, huet Zäit an der Bremsphase verluer, an krut gesot, méi spéit ze bremsen - och wann dat fréiere Bremsen de Wagen séier ëm d'Kurv bruecht huet, säi Gas méi fréi kritt huet an aus der Kurv méi séier erausgaangen ass, an dat ganz um Riichtstreck erëm zréckgewonnen huet. Bei engem Test huet et der Ronn, déi dat gemaach huet, gesot "vill méi spéit bremsen", wärend déi aner Ronn - déi méi spéit gebremst huet - de Scheitelpunkt verpasst, ze wäit erausgefuer ass an genau dat verluer huet, wat se gewonnen hat. D'Zäitdaten hunn gesot, datt déi zwee Weeër gläich waren; d'Rot hat dat Géigendeel gesot.

D'Léisung ass d'Regel, op déi sech all Quell hei uewen eens ass: **eng Kurv gëtt als Ganzt beuerteelt**, vun der Bremszon fir se bis zur Bremszon fir déi nächst, well "heiansdo ass et besser, an enger Kurv e puer Millisekonnen opzeginn, well dat d'Ronn insgesamt méi séier mécht, wann d'Segmenter duerno méi séier sinn" ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Rennwëssen, déi d'Reegelen codéieren {#racing-knowledge-the-rules-encode}

**D'Ausgangsgeschwindegkeet wiegt méi wéi d'Eragangsgeschwindegkeet**, a méi wéi méi laang d'Riichtstreck duerno ass: "d'Zäit op de Riichtstrecken dominéiert d'Zäit an de Kurven", an en Defizit an der Ausgangsgeschwindegkeet gëtt bis zum nächste Bremspunkt weidergedroen. De séierste Wee duerch Kurv-a-Riichtstreck ass oft, an der Kurv méi lues ze sinn, sou datt de Gas méi fréi kënnt - *lues eragoen, séier ausgoen*. ([Race & Track Driving: Reiefolleg fir d'Ronnzäit ze verbesseren](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/), [Driver61: Kurven priorisieren](https://driver61.com/uni/prioritising-corners/)) E Planer vun der mannster Zäit, dee fir d'Ausgangsgeschwindegkeet belount gëtt, réckt seng Scheitelpunkte méi spéit a kritt eng *méi séier* Ronn; de Belounung, deen béid ausbalanséiert, ass `L / v²` pro Eenheet Ausgangsgeschwindegkeet fir e Riichtstreck vun der Längt `L` mat der Geschwindegkeet `v` - d'Zäit, déi en Geschwindegkeetsënnerscheed op engem Riichtstreck kascht, wiisst mat senger Längt a fält mam Quadrat vun der Geschwindegkeet ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Kurven no deem, wouhin se féieren.** Eng, déi op e Riichtstreck féiert: Ausgangsgeschwindegkeet maximéieren, spéiden Scheitelpunkt, sou séier wéi méiglech zréck op d'Kraaft. Eng um Enn vun engem Riichtstreck: d'Geschwindegkeet maximéieren, déi een mat eragleet, sou spéit wéi méiglech bremsen, en fréiere Scheitelpunkt ass akzeptabel. Eng tëscht Kurven: fir déi Kompromëss, déi duerno zielt. Eng Kurv, déi béides kann sinn, gëtt wéi eng op e Riichtstreck behandelt. Séier Kurven zielen méi: bei Geschwindegkeet beschleunegt en Auto schwaach, an ee verluerene km/h gëtt net zréckgewonnen. ([Allen Berg: dräi Zorte Kurven](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/), [Driver61: Kurven priorisieren](https://driver61.com/uni/prioritising-corners/), [Driver61: verschidde Kurven, verschidden Techniken](https://driver61.com/uni/different-corner-technique/))

**De Reibungskrees.** E Rif huet ee Gripp-Budget, dat fir Bremsen, Kurvefueren a Beschleunegen an all Mëschung ausgi gëtt; d'Gesamtbeschleunegung ass `sqrt(lat² + long²)`. Trail-Bremsen follegt dem Rand dovun: d'Bremse gëtt lass, wéi d'Lenkung a Querlast opbaut. ([Reibungskrees](https://www.yourdatadriven.com/friction-circle-introduction/), [g-g-Diagramm](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rullen** - keen Pedal gedréckt - ass dat lues Verléieren vun der Geschwindegkeet, an eng gemooss Schlësselleeschtungszuel fir sech. ([Racecar Engineering / OptimumG: Rull-Faktor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Rutsch.** Längskraaft erreecht hir Spëtz bei engem Schlupfverhältnis vu ronn 10-20 % an fällt dann; doriwwer blockéiert d'Rad beim Bremsen oder dréit beim Gas. Forza mellt de Rutsch normaliséiert: 0 ass vollen Gripp, en Betrag iwwer 1 heescht Gripp verluer. ([Längsrutsch](https://www.sciencedirect.com/topics/engineering/longitudinal-slip), [Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Ënnersteieren a Iwwersteieren.** Vördere Schräglaafwénkel méi grouss wéi hënneren ass Ënnersteieren; hënneren méi grouss wéi vördere Iwwersteieren. Ouni Schräglaafwénkel: de Wagen dréint manner wéi d'Lenkung freet (d'Lenkung iwwer dem Ackermann-Wénkel `L/R`, dee e Auto bei nidderegen Geschwindegkeeten brauch). ([Ënnersteieren, Iwwerbléck](https://www.sciencedirect.com/topics/engineering/understeer), [Ënnersteieren und Iwwersteieren](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## D'Geometrie vun enger Linn {#the-geometry-of-a-line}

D'Geschwindegkeet, déi e Auto op engem Radius `R` halen kann, ass `v = sqrt(a R)`, mat `a` der Querbeschleunegung, déi seng Rieder ginn (plus dat, wat Downforce dobäi gëtt, dat mat `v²` wiisst). Also **wiisst d'Geschwindegkeet mat der Wuerzel vum Radius**: eng Linn duerch d'Mëtt op engem 20 % gréisseren Radius ass do ongeféier 10 % méi séier. ([Maximal Kurvegeschwindegkeet](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html), [formula1-dictionary: Kurvenfueren](https://www.formula1-dictionary.net/cornering_tech.html))

**D'geometresch Linn** ass de gréisste Bogen duerch eng Kurv: vun der baussenzeger Kant, d'Innenkant am Scheitelpunkt berieren, zréck op d'Ausseséit. Fir eng Kurv, déi `θ` dréint, op enger Strooss `w` breet (ofzeeglech der Breet vum Auto), huet en Bogen, deen béid baussen Kanten tangiéiert an d'Innenkurve berëiert, `R = w / (1 - cos(θ/2))` (plus dem eegene Radius vun der Innenkant) - bei engem rechte Wénkel ongeféier `3,4 w`, bei enger Haarnadelkurv `w`. Dofir ass d'Benotze vun der Breet an mëttelgruussen Kurven am wichtegsten an an Haarnadelkurven am mannsten. ([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**De spéiden Scheitelpunkt** dréint méi spéit a méi déif an, am Ufank op engem méi enken Radius, a mécht den Radius op dem Wee eraus erëm op: méi lues an der Mëtt, méi fréi geradeaus, méi fréi voll Gas - "e liicht méi nidderegt Minimum, awer e stäerkt Beschleunegungsprofil beim Ausgank". **De fréie Scheitelpunkt** ass dat Géigendeel: méi séier eran, an e Radius, deen op dem Wee eraus enger gëtt an de Gas zréckhält - gréisstendeels e Feeler, ausser bei ganz nidderegem Gripp, wou Geschwindegkeet, déi een eragoen verléiert, sech net méi eraushuele léisst. ([Racing line](https://en.wikipedia.org/wiki/Racing_line), [Racing-Telemetrie-Vokabular](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/), [Mathematik vun der Renlinn](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**D'"V" an d'"U".** D'U ass d'klassesch rond Linn: de breetste Radius, déi mannste Lenkungsännerung. D'V dréint méi fréi an, geet méi déif, dréint den Auto séier an der Mëtt a leet den Ausgank fir e geradere Wee eraus: d'Bremsen bleift gerad (sou datt se méi spéit kann sinn), d'Mindestgeschwindegkeet ass méi nidder, awer méi spéit erreecht, de voll Gas kënnt vill méi fréi. ([Track Titan: d'V-Linn](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krümmung géint d'Distanz.** Déi séierst Linn ass e Kompromëss tëscht dem kuerzeste Wee an deem mat der mannster Krümmung; op enger Rennstreck-Breet zielt d'Krümmung méi, an eng Linn mat der mannster Krümmung kënnt nobei un déi mannst Zäit, iwwerall wou de Wagen um Limit ass - se trennt sech dovun, wou de Wagen méi kéint beschleunegen. ([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2), [TUM globale Renntrajektorie-Optimiséierung](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Kurven hannereneen** - e Duebelscheitel, eng Schikan - sinn ee Problem: d'Ausgangslinn vun där eenzeger ass d'Eragangslinn vun der nächster, a se ginn vun där gefuer, déi op e Riichtstreck féiert, zréck.
([Driver61: verschidde Kurven, verschidden Techniken](https://driver61.com/uni/different-corner-technique/))

## Wéi eng Linn zu wéi engem Auto passt {#which-line-suits-which-car}

Wat et entscheet, ass d'**Kraaft vum Auto géint säin Gripp** bei deene Geschwindegkeete vun där Kurv - "Momentum ass Gripp géint Kraaft, eng Verhältnisfro." ([Ross Bentley: Momentum-Autoen](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/), [Momentum iwwer Pferdestäerkt](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto, bei dëser Kurv | Linn | Firwat |
|---|---|---|
| Beschleunegt staark fir säi Gripp ("point and shoot") | V: gerad a spéit bremsen, an enger kuerzer enger Mëtt dréien, fréi gerad a flaach | d'Zäit gëtt mat vollem Gas gewonnen, net mat der Mindestgeschwindegkeet |
| Beschleunegt schwaach fir säi Gripp ("Momentum") | breet U, liicht spéiden Scheitelpunkt, d'Mindestgeschwindegkeet héich halen | et kann d'Geschwindegkeet net zréckgewannen, déi et verluer huet |
| Dertëscht | lues eragoen, séier ausgoen: spéiden U-Scheitelpunkt | de klassesche Kompromëss |
| Séier Kurv, a méi mat Downforce | U, no bei der geometrescher Linn | d'Beschleunegung ass bei Geschwindegkeet schwaach; Downforce-Gripp wiisst mat `v²`, also zielt d'Geschwindegkeet an der Mëtt duebel |
| Ganz nidderegen Gripp (nass, Schnéi) | fréiere Scheitelpunkt | Geschwindegkeet, déi ee verluer huet, léisst sech net zréckgewannen |
| Kraaft wäit iwwer dem Gripp | d'Linn zielt manner | d'Traktioun, net d'Linn, begrenzt den Ausgank |

"Wat méi séier d'Kurv, wat méi no bei der geometrescher Linn; wat méi lues, wat méi een se mat engem spéiden Scheitelpunkt verännert." ([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html), [Mathematik vun der Renlinn](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/), [Track Titan: d'V-Linn](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide), [Driver61: Gripp](https://driver61.com/uni/grip/))

De Triebstrang ännert, wéi d'Linn gefuer gëtt, méi wéi d'Linn selwer: e Vördertriebsauto gëtt op de Bremsen gedréint (Trail-Bremsen) an nëmmen Kraaft ginn, wann d'Rad sech ausdréit, oder et schléit wäit eraus; e staarkt Hënnertriebsauto muss gerad sinn, ier de Vollgas kënnt, oder d'Hënnerrad brécht aus; Allradantrieb kann Kraaft huelen, wann et nach dréit, sou datt de Gas méi fréi kann opgeholl ginn. ([FWD-Technik](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/), [RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/), [AWD vs RWD beim Kurvefueren](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

De Viewer miesst d'Verhältnis vun der Kraaft zum Gripp bei all Kurv aus sengem eegenen Fueren - d'Beschleunegung bei vollem Gas bei der Ausgangsgeschwindegkeet iwwer dem Quergripp bei der Mindestgeschwindegkeet - a nennt et "point and shoot" bei 0,45 an driwwer, "Momentum" bei 0,25 an drënner. E Auto, dessen Gripp bei 150-250 km/h méi wéi 15 % iwwer sengem Gripp bei 55-110 km/h ass, huet Downforce am Spill.

## D'Method {#the-method}

D'Zuelen hei ënnen sinn d'Iwwerleeungen. D'Schwellen, déi de Code benotzt, sinn all op enger eegener Säit festgehalen, a just déi Säiten zielen, wann eng Zuel hei vun deem ofwäicht: [Kurv-fir-Kurv-Analys](race-corner-analysis.md), [Autosstüerungs-Evenementer](race-control-events.md), [Autoprofiler a Verglach](race-car-profiles.md) an [Parcoursstatistiken](race-course-statistics.md).

### 1. Eng Distanzachs {#one-distance-axis}

D'schnellst Ronn ass d'Referenz, ausser de Benotzer wielt eng anerer. Hire gefuerene Wee ass d'Achs: all aner Ronn hir Samples ginn drop projizéiert, a kréien all eng Distanz laanscht der Referenz `s` an eng virzeechent Querdistanz `d`. D'Projektioun sicht nëmmen vum viregte Match aus viru, sou datt eng Ronn, déi sech selwer iwwerkräizt, ni op déi falsch Säit vun enger Bréck spréngt. Ronnen ginn dann op ee Gitter gemëttelt, all 2 m, fir all Kanal. All Ronn gëtt déi lescht puer Meter mat der Geschwindegkeet weidergefouert, déi se hat, sou datt hire Delta an der Linn hiren Zäitënnerscheed ass.

### 2. Kurven, an dem Ufank vun all Kurv säi Undeel vun der Ronn {#corners-and-each-corners-share-of-the-lap}

Wéi d'Kurven, d'Segmenter an d'Komplexer fonnt ginn: [Kurv-fir-Kurv-Analys](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. D'Zäitrechnung vun enger Kurv {#the-time-account-of-a-corner}

Netto, Opdeelung, Ausgangsgeschwindegkeet an d'Kraaft vun den Autoen: [Kurv-fir-Kurv-Analys](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Den Urteil an d'Ursaach {#the-verdict-and-the-cause}

D'Urteilsmuster an d'Ursaachen am Eragang an am Ausgank: [Kurv-fir-Kurv-Analys](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. De Wagen géint de Fuerer {#the-car-against-the-driver}

Wann d'Ronnen a verschiddene Autoen sinn, gëtt de Verloscht, deen den Auto erkläert, erausgeholl, a Stécker:

- **Zuch**: d'Autoen vun der selwechter Geschwindegkeet d'Riichtstreck erof, wéi uewen;
- **Gripp**: vun der nidderegerer Mindestgeschwindegkeet, déi net duerch en enken Radius erkläert ass, den Undeel `½ ln(Gripp_anerer / Gripp_mengem) / ln(v_anerer / v_mengem)`, wann d'Ronn um Limit vum Auto war (90 % vun deem, wat hien bei där Geschwindegkeet gewisen huet);
- **Bremsen**: vun `u` bis `v` mat der Verzögerung `a1` géint `a2`, mat engem Enn um selwechte Punkt, kascht `(1/a1 - 1/a2)(u - v)² / 2u` - nëmmen, wann d'Ronn iwwer d'Zone am Duerchschnëtt bal sou haart gebremst huet, wéi den Auto ka, net nëmmen op enger Spëtz.

Wat en Auto kann, kënnt vun all gelueden Ronn vun deem: Quergripp, Bremsen a Beschleunegung bei vollem Gas pro 5-m/s-Geschwindegkeetsstéck (95., 95. a 90. Perzentil). Gripp ass dat, wat den Auto **eng hallef Sekonn gehalen huet** - d'Querbeschleunegung iwwer 0,5 s gemëttelt - net wat ee eenzelle Sample beréiert huet: en Trottoir, en Rutsch, deen zréckschléit, en Auto, dee gefaangen gëtt, dréift et all fir e Moment, an en Auto, dee dat dacks mécht, huet méi Gripp ausgesinn, wéi e wierklech huet. (Gepréift un opgeholle Ronnen vun zwee verschidde Autoen: d'Mooss pro Sample huet se no beieneen gesat; iwwer eng hallef Sekonn gehalen trennt se, wéi hir Ronnzäiten et maachen.) Bremsen an Zuch huelen all Sample als de Median vu sech selwer a senge Noperen. D'Loft, d'Settlement no enger Landung an all Stouss (Sektioun 6) bis de Wagen sech erholl huet, bleiwe fort.

**Wéi e Kaart all Auto ass** (`profile.ts`): aus deenselwechte Ronnen:

- **Gripp gehalen**: d'95. Perzentil vun deem hallef-Sekonne-Quergriff;
- **Zuch** bei vollem Gas bis 50 km/h, 50-120, 120-200 an iwwer 200, an dat meescht, wat et gewisen huet;
- **Bremsen** vun 60 op 160 km/h;
- **Héchstgeschwindegkeet**: wou et bei vollem Gas op engem Riichtstreck eng Sekonn laang net méi gewonnen huet - geradeaus gefuer, net eng laang Kurv voll geholl, wou ee Scheck Geschwindegkeet verléiert bei all Kraaft. Wou kee Riichtstreck laang genuch war, seet dat, wat et bei senger Spëtz nach gezunn huet, wéi wäit et ewech war. Keng Schätzung iwwer dat hinaus, wat d'Ronnen weisen: en Fit vu Kraaft iwwer Geschwindegkeet géint Widderstand huet e Stroossenauto 100 km/h iwwer seng reell Héchstgeschwindegkeet geluecht, well d'Iwwersetzung an den Begrenzer de Zuch vun engem Auto vill fréiner benden wéi de Widderstand;
- **Hënnerrad verléieren**: wéivill Mol pro Ronn et iwwer 10° Drift rutscht (20° op locker Buedem), wann d'Lenkung géint d'Kurv gedréint ass - mat Géigelenkung gefaangen - wéivill vun deene mat Gas ugefaange sinn, an bei wéi engem Undeel vum Gripp se ugefaang hunn. E Auto, dat bewosst e bësse seitlech gefuer gëtt, verléiert näischt; een, dee gefaange muss ginn, schonn. Fir all Auto gläich gezielt, sou datt zwee Autoen verglach kënne ginn;
- **Balance**, wou d'Ronnen Schräglaafwénkel hunn: virn géint hanen um Limit.

**Autoen verglach** setzt d'Autoen nieft-enee - eng Tabell, e Saz pro Auto iwwer wat den Auto géint den anere ass ("X beschleunegt besser, kann awer net sou haart dréien, brauch méi laang fir ze stoppen an verléiert den Hënnerrad méi liicht"), all kloer Ënnerscheed (4 % Gripp, 5 % Zuch oder Bremsen, 4 km/h Héchstgeschwindegkeet, en Hënnerrad, dat e Mol pro Ronn méi a bal d'Halschent méi dacks gefaange gouf), an wéi all ee gefuer gëtt. Mat engem eenzege Auto seet et, wat dee Auto ass.

**An all Kurv**, wann d'Ronnen a verschiddene Autoen sinn, seet de Befund, wat dovun d'Autoen entscheeden, a wéi een dat Bescht aus dësem maache kann:

- **duerch d'Mëtt**: op der Linn vum anere Wagen erlaabt dësen Auto säin Gripp `v_anerer · √(Gripp_mengem / Gripp_anerer)`. Wann d'Ronn dat hat, ass de Ënnerscheed den Auto, a kee Bremspunkt ännert dat - et gëtt gesot, an d'Kurv gëtt dem Auto zougeschriwwen, net dem Fuerer; wann se manner hat, ass de Rescht do fir ze gewannen, a wéivill gesot. Dann, wou d'Zäit amplaz ka gewonnen ginn: op e Riichtstreck, oder bei engem Auto, dee méi haart zitt, no dem Scheitelpunkt - gerad bremsen, méi spéit anlenken, de Wagen fréi op d'Ausfahrt richten; soss den breetsten Radius, deen d'Strooss erlaabt, well en gréissere Radius déi eenzeg Manéier ass, méi Geschwindegkeet ze kréien ouni méi Gripp;
- **e Hënnerrad, dat hei lass ass**, an engem Auto, dee se méi liicht verléiert wéi den anere: wat an dësem Auto ze maachen ass - de Gas lues doséiert wéi d'Lenkung sech ausdréit, oder d'Bremse suanft lass ouni Opnahm an der Kurv, no wéi seng Rutsch ufänken;
- **de Riichtstreck duerno**: wat de stäerkere Zuch vum anere Wagen aus der selwechter Geschwindegkeet geholl huet, an wou dësen Auto op deem Stéck d'Zuch ausgaang ass;
- **e fréiere Bremspunkt** an engem Auto, dee manner haart stoppt.

Eng Ronn, déi an der Mëtt vun enger Kurv gerutscht ass (iwwer 10° Drift op Asphalt), war iwwer hirem Gripp, net ënner et: si kritt ni gesot, datt se do Gripp zum Spueren hat. An wann d'Hënnerrad vum Auto an dëser Ronn bei manner Querbeschleunegung lass gelooss huet, wéi d'Kurv verlaangt huet, seet "Gripp zum Spueren", et iwwer kleng Schrëtt ze fannen.

### 6. Auto-Kontroll: Blockéieren, Raddréien, Rutschen a Stéiss, Zesummestéiss a Kraachen {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

All Ronn gëtt och gelies, wéi den Auto gefouert gouf - wou e Rad blockéiert huet, wou d'Antriebsräder gedréint hunn, wou d'Hënnerrad ausgebrach ass, wou d'Virderrad breet ausgerutscht ass - well dat Feeler sinn, déi d'Zäit eleng net benennt. Dräi Saache loossen dat iwwer Spiller a Buedemen hannen.

**Wou de Gripp ophält, gëtt aus dem eegenen Fueren vum Auto gemooss.** Ingenieuren setzen eng Blockéierschwell pro Auto op de Schlupf, dee déi meescht Verzögerung ginn huet (d'MoTeC-Kanäle an OptimumGs Bremsserie benotzen -0,07 fir ee Auto), an net op e Buchwäert, a Buchwäerter widderspriechen sech sowisou: d'Kraaft erreecht hir Spëtz bei 5-20 % Schlupf op Asphalt, jee no Rif a Modell, bei 6 % oder bei 20-60 % op Schnéi, jee no Quell, an keng Quell gëtt een fir Schotter. Spiller skaléieren de Schlupf nach eng Kéier anescht: Forza säin ass "normaliséiert", sou datt iwwer 1 de Gripp verluer ass - awer d'Bremsen eent Autos kënnen hir Spëtz wäit ënner oder wäit iwwer 1 hunn, an normal Bremszonen kënnen iwwer 1 goen. Also gëtt fir all Auto, iwwer all gelueden Ronn vun deem, d'Kraaft, déi en gemaach huet, géint den Schlupf, dee en hat, an Kächer gesat - Verzögerung géint den Längsschlupf vun de Rieder bei gerader Bremsung, Beschleunegung (als Undeel vun deem, wat den Auto bei där Geschwindegkeet mécht) géint den Schlupf vun den Antriebsrieder, Kurvegripp (als Undeel vum Gripp vum Auto bei där Geschwindegkeet) géint de Schräglaafwénkel vun all Achs - an d'Limit ass de Schlupf no dem Bescht, wou d'Kraaft ëm 8 % gefall ass. Eng Kurv, déi an de Daten ni fält - dem Forza Horizon seng Kurven- an Traktiounskurven - huet keng Limit, a Schlupf allee markéiert do näischt. Mat ze wéineg Daten ass d'Limit eng hallef méi wéi déi nominell Spëtz.

**De Buedem ass pro Sample bekannt**, wou de Spill et seet: Forza schüttelt d'Rieder op Schotter, Dreck a Gras (wéineg Samples op engem Asphalt-Circuit, vill op Dreck- an Crosscountry-Parcoursen), Trackmania benennt d'Material ënner all Rad, an de Buedem vun enger Rallye-Etapp gëtt sou fonnt wéi an Sektioun 11. Kurven, Driftgewunnechten a Schwellen sinn fir Asphalt an locker Buedem getrennt.

**All Evenement gëtt géint déi aner Ronn iwwer déiselwecht Meter geluecht.** Op Schotter, op Schnéi, an engem drift-stäerken Arcade-Racer ass d'Rutschen d'Manéier, wéi eng Kurv gefuer gëtt: optimal-Kontroll-Studien fannen "wéineg-Drift"-Léisungen op Asphalt an "aggressiv, héich-Drift, och Géigelenkung" ënnerwee; Rallye-Donnéeën weisen Rif "wäit an der nichtlinearer Zone", a Blockéieren op ganz lockerem Buedem kann de Wagen souguer méi fréi stoppen. Also ass en Evenement, deen déi aner Ronn och gemaach huet - 80 % oder méi dovun - d'Manéier, wéi d'Kurv gefuer gëtt, kee Feeler; een, deen se net gemaach huet, ass nëmmen e Feeler, wann en Zäit kascht huet: d'Zäit, déi vun ëmmer just virdrun bis 40 m no him verluer gaangen ass. E Feeler, deen 40 % oder méi vum Verléscht vun enger Kurv erkläert, gëtt d'Ursaach vun där Kurv.

D'Erkennungsschwellen, de Test mat der anerer Ronn, Stéiss a Kraacher an d'Rot-Texter: [Autosstüerungs-Evenementer](race-control-events.md).

### 6b. Vill Ronnen: d'Statistike vum Parcours {#b-many-laps-the-courses-statistics}

Klassenverglach, wat als Feeler zielt, d'Statistiken an d'Feelerkaart: [Parcoursstatistiken](race-course-statistics.md).

### 7. D'gefuer Linn {#the-driven-line}

Fir all Ronn an all Kurv, nëmmen aus de Positiounen: wou se ugefaang huet ze dréinen (en Fënnefel vun hirer engster Krümmung), hiren engsten Radius (iwwer ±8 m), den Duerchschnëttsradius iwwer déi éischt an déi zweet Halschent vun hirem Richtungswiessel, an sou weider

- **Form**: engste iwwer Duerchschnëttsradius ënner 0,55 ass e V, iwwer 0,75 e U;
- **Scheitelpunkt**: Radius eraus iwwer Radius eran iwwer 1,25 ass spéit, ënner 0,8 fréi;
- **Geschwindegkeetsscheitel**: wann hire lamsamste Punkt méi wéi 15 m virun der Halschent vun hirer Dréiung ass, ass et lues eragoen, séier ausgoen; méi wéi 15 m no hir: nach ëmmer bremsen iwwer d'Mëtt.

Géint déi aner Ronn: wéi wäit dovun dran oder dobaussen et beim Anlenken war, duerch den engste Bereich an wou béid flaach waren, an wou all eent ugelent huet. All Befund schléisst mat der Linn, déi zum Auto vun der Ronn bei där Kurv passt - no deem, wouhin d'Kurv féiert, a dem gemooss Kraaft-zu-Gripp, dem Downforce an dem Triebstrang - an ob d'Ronn se gefuer huet. D'Tabell "Kurv fir Kurv" listt déi schnellst Ronn duerch all Kurv mat der Form vun hirer Linn, an déi bescht Kurven zesummegesat.

### 8. Zwou Kaarten {#two-maps}

- **Wou**: de Parcours, faarwt no `dΔt/ds` géint d'Referenz, rout wou Zäit verluer geet, gréng wou se gewonnen gëtt.
- **Firwat**: all Verloscht gemoolt, wou seng Ursaach ass, gefaarwt no der Grupp vun der Ursaach - Bremsen, Eragang, Ausgank, Riichtstreck, Auto - a méi breet fir en deiersten.

### 9. Replay {#replay}

Eng Auer, dräi Weeër fir se an all Ronn hir eegen Zäit ze verwandelen: vum Start aus, opgestallt (all Ronn erreecht an deem selwechte Moment een Punkt vun der Streck, a léiert dann lass) an niewenteneen (all Ronn op der Distanz vun der Referenz gehalen).

### 10. Wéi eng Richtung d'Welt huet {#which-way-round-the-world-is}

D'Welt vum Betrachter ass rietshänneg mat Y no uewen. E Spill mat enger lénkshänneger Welt (Forza ënner hinnen) kënnt drin gespigelt eraus: all rietsgaang Kurv gëtt als linksgaang gezeechent, bei Parcours an Ronnen zesummen. D'Ronnen soen dat selwer - positiv Lenkung ass bei all Adapter riets, an d'Ausseséit-Fiederung vun enger Kurv drécken sech zesummen - sou datt de Renn-Tab uniséiert, dat ze reparéieren, an **Kamera & Szen → Weltachs ëmdréinen** mécht dat: X, Y oder Z gi ëmgedréint gezeechent. Nëmmen d'Zeechnung ännert sech - eng Spigelung an d'Usiichtmatrix gefaltt; d'Kamera fléit an der gezeechneter Welt, an d'Donnéeën, d'Analys an all Koordinaten, déi d'Tools weisen, bleiwe d'Spill seng eege. D'Analys nennt Kurven lénks oder riets mat derselwechter Miessung.

### 11. Rallye: d'Rutschen, de lénksen Fouss, d'Loft {#rally-the-slide-the-left-foot-the-air}

Eng Rallye-Etapp ass kee Circuit, dee mat schlechtere Gripp gefuer gëtt. Op Schotter an Schnéi ass d'Rutschen d'Manéier, wéi eng Kurv geholl gëtt: de Wagen gëtt beim Eragang gedréint, andeem d'Gewiicht bewegt gëtt - "d'Bremsen verréckelen d'Gewiicht vum Auto no vir ... d'Virderrifen kréien Gripp, d'Hënnerrifen verléieren Gripp, an de Wagen dréit sech a rutscht an d'Kurv", dann zréck op de Gas, wann e "a Richtung ausgeriicht ass, an déi Dir wëllt fueren" ([DirtFish: wéi een d'Bremsen benotzt](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). De lénke Fouss mécht d'Bremse, sou datt Gas an Bremse géigeneneen gespillt kënne ginn; d'Handbremse dréint de Wagen an enge Kurven ([RallySport Ontario: Rallye-Fueren, d'Basisser](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), an de Wagen hiewt sech vum Buedem. Sektioun 6 liest Rutschen schonn géint déi aner Ronn; dës Reegelen droen de Rescht.

- **De Buedem.** Wat d'Ronn seet (`meta.surface`, dat `--surface` vun de Rallye-Recorder), soss den Numm vum Evenement - d'Asphalt-Rallye (Spuenien, Kroatien, Mëtteleuropa, Däitschland, Japan, Korsika, Ypres), d'Wanterrallyen (Schnéi), dem Monte seng Asphaltstréck mat Schnéi an Äis drop (gemëscht) - soss, wéi de Wagen gefuer gouf. E Rally2-Auto seng Quer-Limit ass 0,7-0,9 g op Schotter an 1,3-1,4 g op Asphalt ([grenzbereich, Referenzwäerter](https://github.com/GitCrush/grenzbereich)), an op Schotter fiert et vill méi Drift (Sektioun 6). Also eng Etapp, wou de Wagen 10 m/s² oder méi gedréckt huet (95. Perzentil, bei Geschwindegkeet, um Buedem) mat engem Mediane-Drift ënner 6 Grad, wou ëmmer en a 70 % dovun gekuerft huet, war Asphalt; alles anescht, oder ze wéineg fir ze beuerteelen, ass locker.
- **Wat de Wagen kann, op deem Buedem, wou en et gemaach huet.** Gripp, Bremsen an Zuch (Sektioun 5) ginn op Asphalt an locker Buedem getrennt gemooss, wann d'Ronnen op all engem en Véierel oder méi vun hiren Samples gefuer sinn, an all Kurv gëtt mam Buedem beuerteelt, deen ënner dem Auto bei sengem lamsamste Punkt war. Samples an der Loft an 0,3 s no enger Landung ginn aus allem fort, wat den Auto miesst - Enveloppen, Rifkurven, Blockéieren an Raddréiwen: eng Landung rëselt de Wagen iwwer alles, wat seng Rieder kënnen, a Rieder, déi an der Loft gedréint hunn, sinn kee Raddréien. Downforce gëtt op lockerem Buedem net beuerteelt, well d'Séier- an d'Lues-Stécker vun enger Etapp anerer Strooss sinn.
- **E Fitz vum lénksen Fouss ass kee Bremsen.** E liichte Bremsenooptouch, wann de Gas nach op hallwer oder méi ass, iwwer manner wéi 15 m, setzt de Wagen oder dréit en; wou eng Ronn ugefaang huet fir eng Kurv ze bremsen, ass dat éischt Bremsen, ënner deem de Gas erofkoum, oder dat, dat méi laang gedauert huet.
- **De Wagen am Eragang gedréint.** Fir all Ronn an Kurv de gréisste Driftwénkel vun hirem Bremsen bis 5 m no hirem lamsamste Punkt. Op lockerem Buedem: eng Ronn, déi de Wagen 8 Grad oder méi manner gedréint hat wéi déi aner (déi 12 oder méi gedréint huet), an déi spéider am Gas oder flaach war, **huet de Wagen manner gedréint**: d'Empfehlung ass, beim Anlenken lass ze goen oder de lénksen Fouss ze dabben, sou datt de Hënnerrad ëm sech kënnt - mat dem Handbremspunkt vun der anerer Ronn, wann déi eng benotzt huet, oder der Handbremse an enger Kurv méi lues wéi 54 km/h - an hien virum Scheitelpunkt op den Ausgank riichten. Eng, déi en 12 Grad oder méi iwwer där anerer gedréint huet an trotzdeem méi spéit am Gas war, **huet en ze wäit gedréint**: en hat missen opgeriicht ginn, ier de Gas kann erofgoen. Béid ass als Ursaach vun der Kurv am Ausgank, nom Auto-Kontrollfeeler. De Linn-Tipp op lockerem Buedem seet dat selwecht bei all Kurv.
- **D'Loft.** E Fluch 0,2 s oder méi méi laang wéi deen aneren Ronn, deen Zäit kascht huet vun 10 m virum Ofsprong bis 40 m no der Landung (oder dem Enn vun der Kurv), ass d'Ursaach, wann en 40 % oder méi vum Verléscht vun der Kurv erkläert, an déi Kurv duerno, déi lues erreecht gëtt, seet dat. An der Loft kann de Wagen net dréien, bremsen oder fueren. De Rot hält de Gas beim Ofsprong oben - "de Gas beim Ofsprong net lassloossen", wat d'Nues erofdréckt - a hëlt de Kamm e bëssen lues oder mat engem Dab vun der Bremse, sou datt de Wagen nidder bleift ([DirtFish: wéi ee mat engem Rallye-Auto sprëtzt](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Komplexer mat héchstens dräi Kéiren.** E kurvegräichte Stéck, dat ni flaach gefuer gëtt, ass kee laange Komplex: no dräi Kéiren fänkt en neien un.

`src/race/rally.test.ts` hält d'Analys un dat alles fest, op Etappen, déi mat engem einfache Modell gefuer ginn: e Wagen, dee manner a spéit am Gas gedréint gouf, e méi laange Fluch, Dabs mam lénksen Fouss, e kurvegräicht Stéck, Asphalt géint Schotter.

## Donnéeën, an wat all Quell erlaabt {#data-and-what-each-source-allows}

| Quell | Rate | Kanäl | Erlaabt |
|---|---|---|---|
| FH-Companion-Ronnefichieren | ~5 m | Positioun, Geschwindegkeet, Gas, Bremse, Lenkung, Längs-/Querbeschleunegung, Gang | alles ausser Auto-Kontroll, dat d'Telemetrie nieft hinnen brauch |
| FH Companions `.tele.gz`, nieft all Ronnefichier | dat Spill seng 64 Hz (en Recorder, dee all Paket hält, schreift ~110 pro Sekonn; d'Widderhuelungen falen fort) | dat ganzt Data Out vu Forza: pro Rad Schlupfverhältnis, Schräglaafwénkel, kombinéierte Schlupf, Rotatioun, Fiederung, Belagrumble; d'Geschwindegkeet am Autosrahmen; Gierrate | alles, och Auto-Kontroll |
| Forza Data Out, opgeholl mat `heat3d_capture telemetry` | 60 Hz | alles vum Uewen, plus pro Rad: Rifentemperatur, Schlupfverhältnis, Schräglaafwénkel, kombinéierten Schlupf, Fiederungswee, Radgeschwindegkeet, Rumble-Strëpp; RPM, Leeschtung, Drehmoment, Gierrate | alles |
| Assetto Corsa, ACC, AC EVO, AC Rally (Shared Memory, `heat3d_capture telemetry --game ...`) | 60-333 Hz | e Super-Set: Rifkär a Temperatur innen/Mëtt/baussen, Drécker, Bremstemperaturen, Radlaascht, Sturz, Schlupfverhältnis an -wénkel; d'Geschwindegkeet am Autosrahmen; ABS an TC aktiv (ACC, EVO, AC Rally) | alles |
| iRacing `.ibt`, direkt gelies | 60 Hz | Positioun aus GPS, Pedaler, Lenkung, g, Gier, pro Rad Rifkarkass-Temperatur, Dämpferausschlag, Drock, Verschleess | alles; Autosstüerung aus dem Driftwénkel (sengem Yaw géint d'Fuerrichtung) an der Lenkung, kee Schlupf (net opgeholl) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | pro Bild; 100 Hz | Positioun, Weltgeschwindegkeet an d'Achsen vum Auto, pro Rad Kontaktflächen-Geschwindegkeet an Fiederung, Pedaler, Lenkung, Etappenauer an -längt | alles; Schlupf an Driftwénkel ofgeleet |
| Richard Burns Rally (NGP UDP) | pro Physikschrëtt | Positioun, d'eegen Geschwindegkeete vum Auto, pro Rad Fiederungsausschlag an -kraaft, Pedaler | alles ausser Radschlupf |
| BeamNG.drive (de `heat3d`-Protokoll-Mod) | bis 100 Hz | Positioun, Weltgeschwindegkeet an Achsen, pro Rad Belagsgeschwindegkeet, Rotatioun, Laascht an Bodekontakt | alles; Schlupf an Driftwénkel ofgeleet |
| Trackmania (den Openplanet-Plugin) | pro Bild | Positioun, Vir- a Säitegeschwindegkeet, Pedaler (Bremse un/aus), Lenkung, pro Rad Schlupfkoeffizient an locker Buedem, an der Loft | alles; den Driftwénkel aus der Säitegeschwindegkeet |

All Quell gëtt an ee Ronnformat ëmgewandelt, `heat3d-lap`, dessen Kanäl kanonesch Nimm hunn (`speed`, `throttle`, `tireTemp[FL]` ...). D'Autossymbol an d'Diagrammer zeechnen, wat fir Kanäl eng Ronn huet.

## Quellen {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Sektiounszäiten verbesseren: Zäitvarianz-Forme](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (Delta an der Distanzdomän)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing-Guide zur Rondenanalys](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: Sessiounsronnen](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: Renlinnen analyséieren](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretesch Beschtt aus Sektoren](https://overcut.gg/)
- [Track Titan: Telemetrie analyséieren](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: Bremsanalys, Blockéier- an Stabilitéits-KPIen (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: um Gas (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: Schlësselleeschtungs-Indikatoren vu Rennfuerer (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Rif-Strooss-Reibungsmodeller an optimalen Schlupf (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: Rif-Belag-Reibung, Schlupf bei der Spëtz op Schnéi a Äis](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: Rif-Reibungskoeffizienten, Spëtz a Gleiten](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: Längskräfte](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: Quérkräfte](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Fuerstabilitéit, Schrauwenwénkel-Limiten (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rallye-Fueren mat héijem Schräglaaf (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manöver an der mannster Zäit bei der Rallye (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC-Referenz-Gierrate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Erkennung vun Ënnersteieren a Iwwersteieren duerch Lenkung géint Gier (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: Lenkwénkel, Ackermann an de Ënnersteier-Gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: Mathekanäl (Kus, kombinéiert g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: Iwwersteieren- an Ënnersteieren-Widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence-Bremsen: Blockéieren op ganz lockeren Oberflächen](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: Donnéeën-Opholl bei Schotterrallyen](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: wéi een d'Bremsen benotzt](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: wéi ee mat engem Rallye-Auto sprëtzt](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: Rallye-Fueren, d'Basisser](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: Rallye-Fahrzeugdynamik, Referenzwäerter](https://github.com/GitCrush/grenzbereich)
- [Trackmania Speed-Drift-Trainer-Plugin (Konstanten)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania-Speedslide-Beschreiwung](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: Coaching-Flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: d'V-Linn](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (Ausgangsgeschwindegkeet géint Mindestzäit)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: Reiefolleg fir d'Ronnzäit ze verbesseren](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: dräi Zorte Kurven](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: Kurven priorisieren](https://driver61.com/uni/prioritising-corners/)
- [Driver61: verschidde Kurven, verschidden Techniken](https://driver61.com/uni/different-corner-technique/)
- [Driver61: déi sechs Phasen vun enger Kurv](https://driver61.com/uni/corner-phases/)
- [Driver61: Gripp](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (Auszuch)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: wat ass en Momentum-Auto](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Momentum iwwer Pferdestäerkt](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Mathematik vun der Renlinn, Deel 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, Deel 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD-Technik](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD beim Kurvefueren](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: Kurvenfuer-Technik](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximal Kurvegeschwindegkeet](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing-Telemetrie-Vokabular](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globale Renntrajektorie-Optimiséierung](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: de Rull-Faktor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Reibungskrees: Aféierung](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g-Diagramm](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Längsrutsch](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Ënnersteieren, en Iwwerbléck](https://www.sciencedirect.com/topics/engineering/understeer)
- [Ënnersteieren a Iwwersteieren](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out Dokumentatioun](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traktiounsbegrenzt Beschleunegung](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: leeschtungsbegrenzt Beschleunegung](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO Shared Memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally Telemetrie-Leser](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT-Analys](https://github.com/teamjorge/ibt)
