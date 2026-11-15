---
title: "Løbsanalyse: metoden"
parent: "Løbsanalyse"
nav_order: 58
lang: "da"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Løbsanalyse: metoden

Kort fortalt:

- Omgange sammenlignes **efter distance**, ikke efter tid, så det samme sted på banen flugter.
- Hvert sving bedømmes **som en helhed**, fra én bremsezone til den næste.
- Den tabte tid **deles op** i, hvor den blev tabt (bremsning, indgang, udgang, langside), og hvor meget af den bilen forklarer.
- Årsagen **forklares med ord**, med råd.
- Vil du bruge den, og ikke læse hvordan den virker: se [Løbsanalyse](race-analysis.md).

Dette er metoden bag fanen **Løbsanalyse**: hvad den måler, hvordan den afgør, hvor tiden blev af, og hvordan den omsætter det til råd. Det er den specifikation, analysekoden (`src/race/`) følger, så hver regel her har en modpart dér og en test, der fastlægger den.

## Hvad de professionelle værktøjer gør {#what-the-professional-tools-do}

De etablerede værktøjer er enige om den samme kerne og adskiller sig mest i, hvor langt de går mod *årsager*:

- **Alt sammenlignes efter distance, ikke tid.** To omgange samples om på én fælles distanceakse; den løbende forskel i forløbet tid ved samme distance er *deltaet* (MoTeC kalder det time variance, andre kalder det time slip eller delta trace). Hældningen fortæller, hvor tid tabes lige nu: en flad hældning er acceleration, luftmodstand eller vedvarende greb; en stejl en forskel i bremsning eller gas; en bølge op og ned en afvejning mellem indgangsfart og udgangsfart.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Hvert sving deles op i faser**: bremsning, indgang, midte, udgang – bremsepunkt, topbremsning og slip, mindstefart og hvor den nås, gear, gaspåsætning, tilbage til fuld gas, udgangsfart.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sektorer pr. sving og en teoretisk bedste tid**, sat sammen af de hurtigste i hver. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Den kørte linje sammenlignes også**, men aldrig alene: "en linje på et billede betyder ikke noget, før du kender de bidragende faktorer" – den læses mod hastighedskurven og deltaet.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Årsag, ikke symptom.** Er tabet på langsiden virkelig gassen, eller tvang en dårlig indgang en sen gaspåsætning? Fejl rangeres efter omkostning i omgangstid og forklares i klartekst.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Hvad der gik galt i første version, og hvorfor det betyder noget {#what-went-wrong-in-the-first-version-and-why-it-matters}

Første version bedømte hver *fase* for sig og kiggede kun på tab. En omgang, der bremsede tidligere, tabte tid i bremsefasen og fik besked om at bremse senere – selv når den tidlige bremsning fik bilen drejet hurtigere, på gas hurtigere og ud af svinget hurtigere, og den vandt det hele tilbage nedad langsiden. I en test fik den omgang, der gjorde det, besked om at "bremse meget senere", mens den anden omgang – som havde bremset senere – havde misset apex, kørt ud i bredden og tabt præcis det, den havde vundet. Tidsdataene sagde, at de to veje var lige gode; rådet sagde det modsatte.

Rettelsen er den regel, alle kilderne ovenfor er enige om: **et sving bedømmes som en helhed**, fra bremsezonen for det til bremsezonen for det næste, for "at give et par millisekunder op i et sving kan forbedre den samlede omgangstid, fordi de hurtigere strækninger bagefter bliver hurtigere"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Racerviden, som reglerne koder {#racing-knowledge-the-rules-encode}

**Udgangsfart betyder mere end indgangsfart**, og mere jo længere den efterfølgende langside er: "tid brugt på langsider dominerer tid brugt i sving", og et fartunderskud ved udgangen føres med til næste bremsepunkt. Den hurtigste vej gennem et sving og en langside er ofte at køre langsommere ind i svinget, så gassen kommer tidligere – *langsomt ind, hurtigt ud*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
En planlægger for mindste tid, der også belønnes for udgangsfart, flytter sine apexer senere og får en *hurtigere* omgang; belønningen, der balancerer de to, er værd `L / v²` pr. enhed udgangsfart for en langside med længden `L` ved farten `v` – den tid, en fartforskel koster ned ad en langside, vokser med længden og falder med kvadratet på farten
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Sving efter, hvad de fører til.** Et, der fører ud på en langside: maksimér udgangsfarten, sen apex, tilbage på gas så hurtigt som muligt. Et for enden af en langside: maksimér farten ind i det, brems så sent som muligt; en tidligere apex er acceptabel. Et mellem to sving: indrettet efter det, der betyder mest efter det. Et sving, der kan være begge dele, behandles som et, der fører ud på en langside. Hurtigere sving vejer tungere: ved høj fart accelererer en bil svagt, og en tabt km/t henter man ikke igen.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Frictionscirklen.** Et dæk har ét grebsbudget, som bruges på bremsning, sving og acceleration i en vilkårlig blanding; den samlede acceleration er `sqrt(lat² + long²)`. Trail braking følger kanten af den: bremsen slippes, efterhånden som styring og sideværts belastning opbygges.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Coasting** – ingen pedal i bund – er den langsomste måde at miste fart på, og en målt nøgleindikator i sig selv.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slip.** Længdekraften topper ved et slipforhold på ca. 10-20 %, og falder så; derefter låser hjulet under bremsning eller spinner under gas. Forza rapporterer slip normaliseret: 0 er fuldt greb, en størrelse over 1 er tabt greb.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Under- og overstyring.** Forreste slipvinkel større end bageste er understyring; bageste større end forreste er overstyring. Uden slipvinkler: bilen drejer mindre, end styringen beder den om (styringen ud over Ackermann-vinklen `L/R`, som en bil har brug for ved lav fart).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrien i en linje {#the-geometry-of-a-line}

Den fart, en bil kan holde på en radius `R`, er `v = sqrt(a R)`, med `a` den sideværts acceleration dækkene giver (plus det, nedtrykket tilføjer, som vokser med `v²`). Så **fart vokser med kvadratroden af radius**: en linje gennem midten på en 20 % større radius er ca. 10 % hurtigere dér.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Den geometriske linje** er den største bue gennem et sving: fra den ydre kant, rører den indre kant ved apex, og tilbage til den ydre kant. For et sving, der drejer `θ` på en vej med bredden `w` (minus bilens bredde), har en bue, der tangerer begge ydre kanter og rører det indre hjørne, `R = w / (1 - cos(θ/2))` (plus den indre kants egen radius) – for en ret vinkel ca. `3,4 w`, for en hårnål `w`. Derfor betyder det mest at udnytte bredden i mellemstore sving og mindst i hårnåle.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Den sene apex** drejer ind senere og dybere, på en først strammere radius, og åbner radius på vej ud: langsommere gennem midten, men tidligere ud af svinget og tidligere fuld gas – "en lidt lavere mindstefart, men en stærkere acceleration på udgangen". **Den tidlige apex** er det modsatte: hurtigere ind, og en radius, der strammes på vej ud og holder gassen tilbage – i det hele taget en fejl, undtagen ved meget lavt greb, hvor fart tabt ind ikke kan hentes igen ud.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" og "U".** U er den klassiske runde linje: den bredeste radius og den mindste styreændring. V drejer ind tidligere, går dybere, roterer bilen hurtigt i midten og lægger den op til en mere lige udkørsel: bremsningen forbliver lige (så den kan være senere), mindstefarten er lavere men nås senere, og fuld gas kommer meget tidligere.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krumning mod afstand.** Den hurtigste linje er et kompromis mellem den korteste vej og den mindst krumme. På en racerbanes bredde betyder krumningen mere, og en linje med mindst krumning kommer tæt på linjen for mindste tid, hvor bilen er ved sin grænse – den skilles fra den dér, hvor bilen kunne accelerere.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Sving lige efter hinanden** – en dobbelt apex, en chikane – er ét problem: udgangslinjen i det ene er indgangslinjen i det næste, og de køres baglæns fra det sving, der fører ud på en langside.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Hvilken linje passer til hvilken bil {#which-line-suits-which-car}

Det, der afgør det, er bilens **effekt set i forhold til dens greb** ved svingets farter – "momentum er greb mod effekt, et forholdstal".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Bil, i dette sving | Linje | Hvorfor |
|---|---|---|
| Accelererer hårdt i forhold til sit greb ("point and shoot") | V: brems lige og sent, drej i en kort, stram midte, ud og fladt tidligt | tiden vindes med fuld gas, ikke med mindstefarten |
| Accelererer svagt i forhold til sit greb ("momentum") | bred U, lidt sen apex, hold mindstefarten oppe | den kan ikke hente fart igen, den har slidt væk |
| Midt imellem | langsomt ind, hurtigt ud: U med sen apex | det klassiske kompromis |
| Hurtigt sving, og mere så med nedtryk | U, tæt på den geometriske linje | accelerationen er svag ved høj fart; nedtryksgrebet vokser med `v²`, så fart gennem midten betaler to gange |
| Meget lavt greb (vådt, sne) | tidligere apex | fart tabt ind kan ikke hentes igen ud |
| Effekt langt over greb | linjen betyder mindre | trækkraft, ikke linjen, begrænser udgangen |


"Jo hurtigere sving, jo tættere på den geometriske linje; jo langsommere, jo mere ændrer man den med en senere apex."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

Drivlinjen ændrer, hvordan linjen køres, mere end selve linjen: en forhjulstrukken bil drejes på bremserne (trail braking) og får kun gas, når hjulet retter sig op, ellers glider den bredt; en kraftig baghjulstrukket bil skal være ret, før der gives fuld gas, ellers slipper bagenden; firhjulstræk kan give gas, mens bilen stadig drejer, så den får gas tidligere.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Viewer'en måler bilens forhold mellem effekt og greb i hvert sving ud fra dens egen kørsel – acceleration med fuld gas ved udgangsfarten divideret med sideværts greb ved mindstefarten – og kalder det "point and shoot" ved 0,45 og derover, "momentum" ved 0,25 og derunder. En bil, hvis greb ved 150-250 km/t er mere end 15 % over dens greb ved 55-110 km/t, har nedtryk i spil.

## Metoden {#the-method}

Tallene nedenfor er begrundelsen. Grænseværdierne, koden bruger, står hver for sig på en side, og de sider er referencen, når et tal her afviger: [Analyse sving for sving](race-corner-analysis.md), [Bilens kontrol: hændelser](race-control-events.md), [Bilprofiler og sammenligning](race-car-profiles.md) og [Banestatistik](race-course-statistics.md).

### 1. Én distanceakse {#one-distance-axis}

Den hurtigste omgang er referencen, medmindre brugeren vælger en anden. Dens kørte vej er aksen: hver andens omgangs samples projiceres på den, og får hver sample en distance langs referencen `s` og en fortegnet sideforskydning `d`. Projektionen søger kun fremad fra det foregående match, så en omgang, der krydser sig selv, aldrig hopper over på den forkerte side af en bro. Omgangene samples så om på ét fælles gitter, hver 2 m, for hver kanal. Hver omgang føres de sidste par meter videre med den fart, den havde, så dens delta ved stregen er forskellen i omgangstid.

### 2. Sving, og hvert svings andel af omgangen {#corners-and-each-corners-share-of-the-lap}

Hvordan sving, strækninger og komplekser findes: [Analyse sving for sving](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Tidsregnskabet for et sving {#the-time-account-of-a-corner}

Netto, fordeling, udgangsfart og bilernes træk: [Analyse sving for sving](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Dommen og årsagen {#the-verdict-and-the-cause}

Dommens mønstre og årsagerne ind og ud af svinget: [Analyse sving for sving](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Bilen mod føreren {#the-car-against-the-driver}

Når omgangene er i forskellige biler, tages det tab, bilen forklarer, ud, delvist:

- **træk**: bilerne fra samme fart ned ad langsiden, som ovenfor;
- **greb**: af den lavere mindstefart, der ikke forklares af en strammere radius, andelen `½ ln(greb_andre / greb_min) / ln(v_andre / v_min)`, når omgangen var ved sin bils grænse (90 % af det, den har vist ved den fart);
- **bremser**: fra `u` ned til `v` ved decelerationen `a1` mod `a2`, med slutpunkt samme sted, koster `(1/a1 - 1/a2)(u - v)² / 2u` – kun når omgangen bremsede omtrent så hårdt, som bilen kan over zonen i gennemsnit, ikke kun i en top.

Det, en bil kan, kommer fra hver indlæst omgang af den: sideværts greb, bremsning og acceleration med fuld gas pr. 5 m/s fartinterval (95., 95. og 90. percentil). Greb er det, bilen **holdt i et halvt sekund** – den sideværts acceleration gennemsnittet over 0,5 s – ikke det, en enkelt sample rørte ved. En kantsten, en slideglidning, der fanges igen, en bil, der bliver indhentet, sender alt sammen et spids op i et øjeblik, og en bil, der gør det ofte, ser mere grebsrig ud, end den er. (Kontrolleret mod optagede omgange af to forskellige biler: målet pr. sample placerede dem tæt sammen; holdt i et halvt sekund skiller det dem ad, som deres omgangstider gør.) Bremsning og træk tager hver sample som medianen af sig selv og sine naboer. Luften, den bevægelse, der falder til ro efter en landing, og hvert stød (afsnit 6), indtil bilen er kommet sig, er taget ud.

**Hvilken slags bil hver er** (`profile.ts`): ud fra de samme omgange,

- **holdt greb**: 95. percentil af den halvsekunds sideværts acceleration;
- **træk** med fuld gas op til 50 km/t, 50-120, 120-200 og over 200, og det mest, den viste;
- **bremsning** fra 60 til 160 km/t;
- **topfart**: hvor den holdt op med at få fart med fuld gas i et sekund på en langside – kørt ligeud, ikke en lang kurve taget fladt, hvor en bil taber fart ved enhver effekt. Hvor ingen langside var lang nok, siger det, den stadig trak med ved sin højeste fart, hvor langt fra den den var. Ingen gætten ud over det, omgangene viser: en tilpasning af effekt mod fart mod luftmodstand satte en vejbil 100 km/t over dens rigtige topfart, for gearing og begrænseren afslutter en bils træk langt før luftmodstanden gør;
- **at miste bagenden**: hvor mange gange pr. omgang den gled over 10° drift (20° på løst underlag) med hjulet drejet modsat svinget – fanget med modsat rat – hvor mange af dem der begyndte på gas, og ved hvilken andel af dens greb de begyndte. En bil, der køres lidt skævt med vilje, taber ikke noget; en, der skal fanges, gør. Det tælles ens for alle biler, så to biler kan sammenlignes;
- **balance**, hvor omgangene har slipvinkler: for- mod bag ved grænsen.

**Biler sammenlignet** stiller bilerne side om side – en tabel, en sætning pr. bil om, hvad bilen er i forhold til den anden ("X accelererer bedre, men kan ikke dreje så hårdt, skal bruge længere til at standse og mister bagenden lettere"), hver forskel, der er tydelig (4 % af greb, 5 % af træk eller bremsning, 4 km/t i topfart, en bagende fanget mindst én gang pr. omgang mere og halvt så ofte igen), og hvordan hver skal køres. Med én bil siger det, hvad den bil er.

**I hvert sving**, når omgangene er i forskellige biler, siger fundet, hvad af det bilerne afgør, og hvordan man får mest ud af denne:

- **gennem midten**: på den anden bils linje tillader denne bils greb `v_andre · √(greb_min / greb_andre)`. Hvis omgangen holdt det, er forskellen bilen, og ingen bremsepunkt ændrer den – det siges, og svinget tilskrives bilen og ikke føreren; holdt den mindre, er resten der at hente, og det siges, hvor meget. Derefter hvor tiden kan vindes i stedet: ud på en langside, eller i en bil, der trækker hårdere, efter apex – brems lige, drej ind senere, få bilen rettet mod udgangen tidligt; ellers den bredeste radius vejen tillader, for en større radius er den eneste vej til mere fart uden mere greb;
- **en bagende, der slap**, her, i en bil, der mister den lettere end den anden: hvad man gør i denne bil – gassen tilføres, efterhånden som hjulet retter sig op, eller bremsen slippes blødt uden at lette midt i svinget, efter hvordan dens glidninger begynder;
- **langsiden efter**: hvad den andens bils stærkere træk fra samme fart tog, og hvor denne bil løb tør for træk på den;
- **et tidligere bremsepunkt** i en bil, der bremser mindre hårdt.

En omgang, der gled igennem midten af et sving (over 10° drift på asfalt), var over sit greb, ikke under det: den får aldrig at vide, at den havde greb til overs der. Og hvor bagenden i denne omgang slap ved mindre sideværts acceleration, end svinget krævede, siger "greb til overs", at man skal finde det i små skridt.

### 6. Bilens kontrol: låsning, hjulspin, glidninger og understyring, stød og styrt {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Hver omgang læses også for, hvordan bilen blev styret – hvor et hjul låste, hvor de drevne hjul spinnede, hvor bagenden gled ud, hvor forenden gled bredt – for det er de fejl, tiden alene ikke navngiver. Tre ting gør, at det holder på tværs af spil og underlag.

**Hvor grebet slutter, måles ud fra bilens egen kørsel.** Ingeniører sætter en låsegrænse pr. bil ved det slip, der gav mest deceleration (MoTeC-kanalerne i OptimumGs bremseserie bruger -0,07 for én bil), ikke ud fra en bogværdi, og bogværdierne er alligevel uenige: kraften topper ved 5-20 % slip på asfalt alt efter dæk og model, ved 6 % eller ved 20-60 % på sne alt efter kilden, og ingen kilde giver en værdi for grus. Spillene skalerer slip endnu anderledes: Forzas er "normaliseret", så grebet er tabt ud over 1 – men en bils bremser kan give det bedste langt under eller langt over 1, og almindelige bremsezoner kan løbe over 1. Så for hver bil, over hver indlæst omgang af den, inddeles kraften, den lavede, efter det slip, den kørte – deceleration mod hjulenes slipforhold under bremsning i ret linje, acceleration (som andel af det, bilen yder ved den fart) mod de drevne hjuls slip, sideværts greb (som andel af bilens greb ved den fart) mod hver akslens slipvinkel – og grænsen er det slip ud over det bedste, hvor kraften er faldet 8 %. En kurve, der aldrig falder i dataene – Forza Horizons sving- og trækkurver – har ingen grænse, og slip alene markerer ikke noget der. Med for få data er grænsen halvanden gange den nominelle top.

**Underlaget kendes pr. sample**, hvor spillet siger det: Forza giver hjulene vibrationer på grus, jord og græs (få samples på en asfaltbane, mange på jord- og terrængående baner), Trackmania navngiver materialet under hvert hjul, og et rallystræknings underlag findes som afsnit 11 siger. Kurver, driftvaner og grænser holdes adskilt for asfalt og løst underlag.

**Hver hændelse lægges op mod den anden omgang over de samme meter.** På grus, på sne, i en driftstung arkaderacer er glidning, hvordan et sving køres: studier af optimal styring finder "lavdrift"-løsninger på asfalt og "aggressive, højdrift, endda modsat styring"-løsninger uden for vej, rallydata viser dæk "langt inde i det ikke-lineære område", og at låse et hjul på meget løst underlag kan endda stoppe bilen hurtigere. En hændelse, som den anden omgang også lavede – 80 % af den eller mere – er derfor, hvordan svinget køres, ikke en fejl, og en hændelse, den ikke lavede, er kun en fejl, hvis den kostede tid: den tid, der tabes fra lige før den til 40 m efter den. En fejl, der forklarer 40 % eller mere af et svings tab, bliver det svings årsag.

Registreringsgrænser, testen mod den anden omgang, stød og styrt og rådteksterne: [Bilens kontrol: hændelser](race-control-events.md).

### 6b. Mange omgange: banens statistik {#b-many-laps-the-courses-statistics}

Klassesammenligning, hvad der tæller som en fejl, statistikkerne og fejlkortet: [Banestatistik](race-course-statistics.md).

### 7. Den kørte linje {#the-driven-line}

For hver omgang og hvert sving, kun ud fra positioner: hvor den begyndte at dreje (en femtedel af dens snævreste krumning), dens snævreste radius (over ±8 m), gennemsnitsradius over første og anden halvdel af dens retningsskifte, og så

- **form**: snævreste over gennemsnitsradius under 0,55 er en V, over 0,75 en U;
- **apex**: udgangsradius over indgangsradius over 1,25 er sen, under 0,8 tidlig;
- **fart-apex**: dens langsomste punkt mere end 15 m før halvvejspunktet af dens sving er langsomt ind, hurtigt ud; mere end 15 m efter, og den bremser stadig efter midten.

Mod den anden omgang: hvor langt inde eller ude den kørte ved indgangen, gennem den snævreste del og der, hvor begge var flade, og hvor hver drejede ind.

Hvert fund afsluttes med den linje, der passer til omgangens bil i det sving – ud fra, hvad svinget fører ud på, og bilens målte forhold mellem effekt og greb, nedtryk og drivlinje – og om omgangen kørte den. Tabellen "Sving for sving" lister den hurtigste omgang gennem hvert sving med formen på dens linje, og de bedste sving sat sammen.

### 8. To kort {#two-maps}

- **Hvor**: banen farvet efter `dΔt/ds` mod referencen, rød hvor tid tabes, og grøn hvor den vindes.
- **Hvorfor**: hvert tab tegnet dér, hvor dets årsag er, farvet efter årsagens gruppe – bremsning, indgang, udgang, langside, bil – og bredere for et dyrere tab.

### 9. Replay {#replay}

Ét ur, tre måder at gøre det til hver omgangs egen tid: fra stregen, stillet op (hver omgang når ét punkt på banen i samme øjeblik, og slippes så) og side om side (hver omgang holdt ved referencens distance).

### 10. Hvilken vej verden vender {#which-way-round-the-world-is}

Viewer'ens verden er højrehåndet med Y op. En spilverden med venstre hånd (Forza blandt dem) bliver spejlvendt i den: hver højresving tegnes som et venstresving, både bane og omgange. Omgangene siger selv det – positiv styring går til højre i hver adapter, og den ydre ophængning i et sving trykkes sammen – så rennen tilbyder at rette det, og **Kamera og scene → Invertér verdenens akse** gør det: X, Y eller Z tegnes omvendt. Kun tegningen ændres – en spejling foldet ind i visningsmatricen; kameraet flyver i den tegnede verden, mens dataene, analysen og alle koordinater, værktøjerne viser, forbliver spillets egne. Analysen navngiver sving til venstre eller højre ud fra samme måling.

### 11. Rally: glidningen, venstrefoden, luften {#rally-the-slide-the-left-foot-the-air}

En rallystrækning er ikke en bane kørt med dårligere greb. På grus og sne tages et sving med glidning: bilen drejes på vej ind ved at flytte vægten – "bremser flytter bilens vægt fremad ... forhjulene får greb, baghjulene mister greb, og bilen roterer og glider ind i svinget", og derefter tilbage på gas, når den er "stillet op i den retning, du vil køre" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Venstrefoden klarer bremsningen, så gas og bremse kan spilles mod hinanden; håndbremsen drejer bilen i stramme sving ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), og bilen forlader jorden. Afsnit 6 læser allerede glidninger mod den anden omgang; disse regler bærer resten.

- **Underlaget.** Det, omgangen siger (`meta.surface`, rallyoptagernes `--surface`), ellers navnet på begivenheden – asfaltrallyerne (Spanien, Kroatien, Mellemeuropa, Tyskland, Japan, Korsika, Ypres), vinterrallyerne (sne), Monte-asfalten med sne og is på (blandet) – ellers hvordan bilen blev kørt. En Rally2-bils sideværts grænse er 0,7-0,9 g på grus og 1,3-1,4 g på asfalt ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)), og på grus kører den langt mere drift (afsnit 6). En strækning, hvor bilen trak 10 m/s² eller mere (95. percentil, ved fart, på underlaget) med en median drift under 6 grader, hvor den end svingede inden for 70 % af det, var derfor asfalt; alt andet, eller for lidt til at afgøre det, er løst.
- **Hvad bilen kan, på det underlag, den gjorde det på.** Greb, bremsning og træk (afsnit 5) måles på asfalt og løst underlag hver for sig, når omgangene kørte en femtedel eller mere af deres samples på hver, og hvert sving bedømmes med det underlag, der var under bilen ved sit langsomste punkt. Samples i luften og i 0,3 s efter en landing er taget ud af alt, der måler bilen – hylstre, dækkurver, låsninger og hjulspin: en landing rykker bilen ud over alt, dækkene kan, og hjul, der spinner op i luften, er ikke hjulspin. Nedtryk bedømmes ikke på løst underlag, hvor en stræknings hurtige og langsomme stykker er forskellige veje.
- **Et lille tryk med venstrefoden er ikke bremsning.** Et let tryk på bremsen med gassen stadig halvt eller mere nede, over mindre end 15 m, sætter bilen eller drejer den; hvor en omgang begyndte at bremse til et sving, er den første bremsning, under hvilken gassen blev sluppet, eller som varede længere.
- **Bilen drejet på vej ind.** For hver omgang og hvert sving: den største driftvinkel fra dens bremsning til 5 m efter dens langsomste punkt. På løst underlag: en omgang, der fik bilen drejet 8 grader eller mere mindre end den anden (som drejede den 12 eller mere) og kom på gassen eller fladt senere, **drejede bilen mindre**: rådet er at løfte eller trykke venstrefodsbremsen, mens den drejer ind, så bagenden kommer rundt – med den andens håndbremsepunkt, når den brugte et, eller håndbremsen i et sving langsommere end 54 km/t – og have den rettet mod udgangen før apex. En, der drejede den 12 grader eller mere ud over den anden og stadig kom på gassen senere, **drejede den for meget**: den skulle rettes op, før gassen kunne komme. Begge dele er svingets årsag på vej ud, efter en fejl i bilens kontrol. Linjerådet på løst underlag siger det samme for hvert sving.
- **Luften.** En flyvetur på 0,2 s eller mere længere end den andens omgang, der kostede tid fra 10 m før afløbet til 40 m efter landingen (eller svingets ende), er årsagen, når den forklarer 40 % eller mere af svingets tab, og det næste sving, der nås langsommere, siger det. I luften kan bilen hverken dreje, bremse eller køre. Rådet holder gassen på ved afløbet – "slip ikke gassen under afløbet", ellers synker næsen – og tager toppen en smule langsommere eller med et let tryk på bremsen, så bilen holder sig lav ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Komplekser på højst tre sving.** En snoet strækning, der aldrig køres flad, er ikke ét langt kompleks: efter tre sving starter et nyt.

`src/race/rally.test.ts` holder analysen op mod alt dette på strækninger kørt med en enkel model: en bil, der drejes mindre og sent på gassen, en længere flyvetur, venstrefodstryk, en snoet strækning, asfalt mod grus.

## Data, og hvad hver kilde tillader {#data-and-what-each-source-allows}

| Kilde | Hastighed | Kanaler | Tillader |
|---|---|---|---|
| FH Companion-omgangsfiler | ~5 m | position, fart, gas, bremse, styring, længde- og sideacceleration, gear | alt undtagen bilens kontrol, som kræver telemetrien ved siden af |
| FH Companions `.tele.gz`, ved siden af hver omgangsfil | spillets 64 Hz (en optager, der gemmer hver pakke, skriver ca. 110 i sekundet; gentagelserne fjernes) | Forzas hele Data Out: pr. hjul slipforhold, slipvinkel, samlet slip, rotation, ophængning, underlagsvibration; hastigheden i bilens ramme; krøjningshastighed | alt, også bilens kontrol |
| Forza Data Out, optaget af `heat3d_capture telemetry` | 60 Hz | alt ovenstående, plus pr. hjul: dækkets temperatur, slipforhold, slipvinkel, samlet slip, ophængningens slag, hjulfart, rumblestrip; omdrejninger, effekt, moment, krøjningshastighed | alt |
| Assetto Corsa, ACC, AC EVO, AC Rally (delt hukommelse, `heat3d_capture telemetry --game ...`) | 60-333 Hz | et supersæt: dækkets kerne og indre/midterste/ydre temperaturer, tryk, bremsetemperaturer, hjullaster, camber, slipforhold og -vinkel; hastigheden i bilens ramme; ABS og TC i brug (ACC, EVO, AC Rally) | alt |
| iRacing `.ibt`, læst direkte | 60 Hz | position fra GPS, pedaler, styring, g, krøjning, pr. hjul dækkets kernetemperatur, dæmperudslag, tryk, slid | alt; bilens kontrol ud fra driftvinklen (dens krøjning mod kørselsretningen) og styringen, ikke slip (ikke logget) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | pr. billede; 100 Hz | position, verdenshastighed og bilens akser, pr. hjul kontaktfladens hastighed og ophængning, pedaler, styring, stræknings-ur og -længde | alt; slip og driftvinkel udledes |
| Richard Burns Rally (NGP UDP) | pr. fysiktrin | position, bilens egne hastigheder, pr. hjul fjederudslag og kraft, pedaler | alt undtagen hjulslip |
| BeamNG.drive (`heat3d`-protokolmodden) | op til 100 Hz | position, verdenshastighed og akser, pr. hjul overfladehastighed, rotation, belastning og jordkontakt | alt; slip og driftvinkel udledes |
| Trackmania (Openplanet-plugin'en) | pr. billede | position, for- og sidehastighed, pedaler (bremse til/fra), styring, pr. hjul slipkoefficient og løst underlag, i luften | alt; driftvinklen ud fra sidehastigheden |

Hver kilde omsættes til ét omgangsformat, `heat3d-lap`, hvis kanaler har kanoniske navne (`speed`, `throttle`, `tireTemp[FL]` ...). Bilens figur og grafene tegner de kanaler, en omgang har.

## Kilder {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
