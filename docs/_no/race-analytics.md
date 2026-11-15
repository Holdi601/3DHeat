---
title: "Løpsanalyse: metoden"
parent: "Løpsanalyse"
nav_order: 58
lang: "no"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Løpsanalyse: metoden

Kort fortalt:

- Runder sammenlignes **etter distanse**, ikke etter tid, slik at samme sted på banen havner på linje.
- Hvert sving bedømmes **som helhet**, fra én bremsesone til den neste.
- Tiden som tapes, **deles** på hvor den tapes (bremsing, inngang, utgang, rettstrekning) og hvor mye av den bilen forklarer.
- Årsaken **forklares med ord**, med råd.
- Vil du bruke den, ikke lese hvordan den virker: se [Løpsanalyse](race-analysis.md).

Dette er metoden bak fanen **Løpsanalyse**: hva den måler, hvordan den avgjør hvor tiden ble borte, og hvordan den gjør det om til råd. Den er spesifikasjonen analysekoden (`src/race/`) følger, så hver regel her har en motpart der og en test som låser den fast.

## Hva de profesjonelle verktøyene gjør {#what-the-professional-tools-do}

De etablerte verktøyene er enige om kjernen og skiller seg mest i hvor langt de går mot *årsaker*:

- **Alt sammenlignes etter distanse, ikke tid.** To runder settes på samme distanseakse. Den løpende forskjellen i tid ved samme distanse er *deltaet* (MoTeC kaller det tidsvarians, andre kaller det tidsforskjell eller deltakurve). Stigningen forteller hvor tid tapes akkurat nå: en flat stigning er akselerasjon, luftmotstand eller vedvarende grep. En bratt stigning er en forskjell i bremsing eller gass. Et opp-og-ned-mønster er et bytte mellom inngangsfart og utgangsfart.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Hvert sving deles i faser**: bremsing, inngang, midt og utgang. Bremsepunkt, topp bremsing og slipp, lavest fart og hvor den skjer, gir, gasspådrag, tilbake til full gass og utgangsfart.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Miniseksjoner per sving, og en teoretisk beste runde** satt sammen av de raskeste delene.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Den kjørte linjen sammenlignes også**, men aldri alene: "en linje på et bilde betyr ingenting før du kjenner de bidragende faktorene". Den leses sammen med farten og deltaet.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Grunnårsak, ikke symptom.** Er tapet på rettstrekningen virkelig gassen, eller førte en dårlig inngang til sen gass? Feil rangeres etter hva de koster i rundetid og forklares med vanlig språk.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Hva som gikk galt i første versjon, og hvorfor det betyr noe {#what-went-wrong-in-the-first-version-and-why-it-matters}

Den første versjonen regnet hver *fase* for seg og så bare på tap. En runde som bremset tidligere, tapte tid i bremsefasen og fikk beskjed om å bremse senere, selv når den tidligere bremsingen fikk bilen rundt tidligere, på gass tidligere og raskere ut av svingen, og tok det hele igjen på rettstrekningen. I én test fikk runden som gjorde dette beskjed om å "bremse mye senere", mens den andre runden, som hadde bremset senere, hadde bommet på toppunktet, kjørt vidt og tapt akkurat det den hadde vunnet. Tidsdataene sa at de to veiene var like gode, og rådet sa det motsatte.

Løsningen er regelen alle kildene over er enige om: **et sving bedømmes som helhet**, fra bremsesonen for det til bremsesonen for det neste, fordi "noen ganger kan det å ofre noen millisekunder i et sving forbedre totaltiden for runden ved at de påfølgende delene kan kjøres raskere"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Racingkunnskapen reglene koder {#racing-knowledge-the-rules-encode}

**Utgangsfart betyr mer enn inngangsfart**, og mer jo lengre den påfølgende rettstrekningen er: "tid brukt på rettstrekninger dominerer tid brukt i sving", og en fartsunderskudd ved utgangen tas med til neste bremsepunkt. Den raskeste måten gjennom et sving og rettstrekning er ofte å svinge litt saktere, slik at gassen kommer tidligere. *Sakte inn, fort ut.*
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
En planlegger for minimumstid som også belønnes for utgangsfart, flytter toppunktene sine senere og får en *raskere* runde. Belønningen som balanserer de to er verdt `L / v²` per enhet utgangsfart for en rettstrekning med lengde `L` i fart `v`. Tiden en fartsforskjell koster nedover en rettstrekning vokser med lengden og minker med kvadratet av farten
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Sving etter hva de leder til.** Et sving som leder inn på en rettstrekning: maksimer utgangsfarten, sent toppunkt, tilbake på gass så tidlig som mulig. Et sving på enden av en rettstrekning: maksimer farten inn i det, brems så sent som mulig, et tidligere toppunkt går bra. Et sving mellom to andre: kompromiss for det som betyr mest etter det. Et sving som kan være begge deler, behandles som et som leder inn på en rettstrekning. Raske sving veier tyngre: ved høy fart akselererer en bil svakt, og en tapt km/t tas ikke igjen.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Friksjonssirkelen.** Et dekk har ett grepbudsjett som brukes på bremsing, sving og akselerasjon i en hvilken som helst blanding. Total akselerasjon er `sqrt(lat² + long²)`. Trail braking følger kanten av den: bremsen slippes etter hvert som styring og sideveis last bygges opp.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rulling** - ingen pedal nede - er den tregeste måten å miste fart på, og en målt nøkkelindikator i seg selv.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slip.** Langsgående kraft topper ved et slipforhold på omtrent 10-20 %, og faller deretter. Forbi det låser hjulet seg under bremsing eller spinner under kraft. Forza rapporterer slip normalisert: 0 er full grep, en størrelse over 1 er tapt grep.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Understyring og overstyring.** sideglidevinkel foran større enn bak er understyring. Bak større enn foran er overstyring. Uten sideglidevinkler: bilen svinger mindre enn styringen ber om (styringen over Ackermann-vinkelen `L/R` som en bil trenger ved lav fart).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometrien til en linje {#the-geometry-of-a-line}

Farten en bil kan holde på en radius `R` er `v = sqrt(a R)`, der `a` er sidekraften dekkene gir (pluss det downforce gir, som vokser med `v²`). Så **fart vokser med kvadratroten av radiusen**: en linje gjennom midten på en 20 % større radius er omtrent 10 % raskere der.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Den geometriske linjen** er den største buen gjennom et sving: fra ytterkanten, berører innsiden i toppunktet, og tilbake til ytterkanten. For et sving på `θ` grader på en vei med bredde `w` (minus bilens bredde), har en bue som tangerer begge ytterkantene og berører innerhjørnet `R = w / (1 - cos(θ/2))` (pluss innerkantens egen radius). For en rett vinkel er det omtrent `3,4 w`, for en hårnål `w`. Derfor betyr det mest å bruke bredden i middels svinger og minst i hårnåler.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Det sene toppunktet** svinger inn senere og dypere, på først en strammere radius, og åpner radiusen på veien ut: saktere midt i svingen, rett ut tidligere, flatt tidligere - "en litt lavere minimumsfart, men en sterkere akselerasjonsprofil på utgangen". **Det tidlige toppunktet** er det motsatte: raskere inn, og en radius som strammes på veien ut og holder gassen tilbake. Det er stort sett en feil, bortsett fra svært lavt grep, der fart tapt inn ikke kan tas igjen ut. ([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" og "U".** U-en er den klassiske runde linjen: den bredeste radiusen, minst styrebevegelse. V-en svinger inn tidligere, går dypere, roterer bilen raskt i midten og legger seg for en rettere vei ut: bremsingen blir rett (så den kan være senere), minimumsfarten er lavere men nås senere, full gass kommer mye tidligere.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krumning mot distanse.** Den raskeste linjen er et kompromiss mellom den korteste veien og den minst krumme. På en racebanes bredde betyr krumningen mer, og en linje med minimumskrumning kommer nær minimumstidslinjen der bilen er på grensen. Den skiller seg fra den der bilen kunne akselerert.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Svinger på rad** - et dobbelt toppunkt, en chicane - er ett problem: utgangslinjen i det ene er inngangslinjen i det neste, og de kjøres baklengs fra svingen som leder inn på en rettstrekning.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Hvilken linje som passer hvilken bil {#which-line-suits-which-car}

Det som avgjør er bilens **kraft mot grepet** ved svingets farter: "momentum er grep mot kraft, et forhold".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Bil, i dette svinget | Linje | Hvorfor |
|---|---|---|
| Akselererer hardt i forhold til grepet ("point and shoot") | V: brems rett og sent, roter i en kort, stram midtdel, rett og flatt tidlig | tiden vinnes med full gass, ikke med minimumsfarten |
| Akselererer svakt i forhold til grepet ("momentum") | bred U, litt sent toppunkt, hold minimumsfarten oppe | den kan ikke ta igjen fart den mister |
| Mellom disse | sakte inn, fort ut: U med sent toppunkt | det klassiske kompromisset |
| Raskt sving, og mer så med downforce | U, nær den geometriske linjen | akselerasjonen er svak ved høy fart; downforce-grepet vokser med `v²`, så fart gjennom midten betaler seg to ganger |
| Svært lavt grep (vått, snø) | tidligere toppunkt | fart tapt inn kan ikke tas igjen ut |
| Kraft langt over grepet | linjen betyr mindre | trekkraft, ikke linjen, begrenser utgangen |

"Jo raskere svingen, desto nærmere den geometriske linjen; jo saktere, desto mer endrer du den med et senere toppunkt."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

Drivlinjen endrer hvordan linjen kjøres mer enn selve linjen: en forhjulsdrevet bil roteres på bremsene (trail braking) og får kraft først når hjulet retter seg ut, ellers går den vidt. En kraftig bakhjulsdrevet bil må være rett før full gass, ellers bryter bakenden ut. Firehjulsdrift kan ta kraft mens bilen fortsatt svinger, så den tar gassen tidligere.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Visningsprogrammet måler bilens forhold mellom kraft og grep i hvert sving ut fra den egne kjøringen: akselerasjon med full gass ved utgangsfart delt på sidegrepet ved minimumsfart. Den kaller det "point and shoot" ved 0,45 og over, "momentum" ved 0,25 og under. En bil der grepet ved 150-250 km/t er mer enn 15 % over grepet ved 55-110 km/t, har downforce i virksomhet.

## Metoden {#the-method}

Tallene nedenfor er resonnementet. Grensene koden bruker, står på én side hver, og de sidene er referansen når et tall her avviker: [Analyse sving for sving](race-corner-analysis.md), [Bilhendelser](race-control-events.md), [Bilprofiler og sammenligning](race-car-profiles.md) og [Banestatistikk](race-course-statistics.md).

### 1. Én distanseakse {#one-distance-axis}

Den raskeste runden er referanse, med mindre brukeren velger en annen. Dens kjørte vei er aksen: hver annen runde sine målepunkter projiseres på den, og hvert målepunkt får en distanse langs referansen `s` og et fortegnet sideforskudd `d`. Projeksjonen søker bare framover fra forrige treff, så en runde som krysser seg selv aldri hopper over til feil side av en bro. Rundene resamples deretter til ett rutenett, hver 2 m, for hver kanal. Hver runde føres de siste metrene videre med farten den hadde, slik at deltaet ved streken er forskjellen i rundetid.

### 2. Sving, og hvert svings andel av runden {#corners-and-each-corners-share-of-the-lap}

Hvordan sving, seksjoner og komplekser finnes: [Analyse sving for sving](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Tidsregnskapet for et sving {#the-time-account-of-a-corner}

Netto, fordeling, utgangsfart og bilenes trekkraft: [Analyse sving for sving](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Dommen, og årsaken {#the-verdict-and-the-cause}

Dommenes mønstre og årsakene inn og ut av svinget: [Analyse sving for sving](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Bilen mot føreren {#the-car-against-the-driver}

Når rundene er kjørt i ulike biler, tas tapet bilen forklarer bort, i deler:

- **trekkraft**: bilene fra samme fart nedover rettstrekningen, som over;
- **grep**: av den lavere minimumsfarten som ikke forklares av en strammere radius, andelen `½ ln(grep_annen / grep_min) / ln(v_annen / v_min)`, når runden var på bilens grense (90 % av det den har vist ved den farten);
- **bremser**: fra `u` ned til `v` med retardasjon `a1` mot `a2`, som ender på samme punkt, koster `(1/a1 - 1/a2)(u - v)² / 2u`. Dette gjelder bare når runden bremset omtrent så hardt bilen kan over sonen i gjennomsnitt, ikke bare i en topp.

Det en bil kan, kommer fra alle innlastede runder med den: sidegrep, bremsing og akselerasjon med full gass per 5 m/s fartsintervall (95., 95. og 90. persentil). Grep er det bilen **holdt i et halvt sekund**, sidesakselerasjonen gjennomsnittet over 0,5 s, ikke det ett enkelt målepunkt rørte. En kantstein, en slide som snapper tilbake, en bil som tas igjen, gir alle en topp et øyeblikk, og en bil som gjør det ofte, så ut til å ha mer grep enn den har. (Sjekket mot innspilte runder av to ulike biler: målet per målepunkt plasserte dem nær hverandre. Holdt i et halvt sekund skiller de dem slik rundetidene deres gjør.) Bremsing og trekkraft tar hvert målepunkt som medianen av seg selv og naboene. Luften, settingen etter en landing og hvert støt (seksjon 6) til bilen har kommet seg, utelates.

**Hva slags bil hver er** (`profile.ts`): fra de samme rundene,

- **grep holdt**: 95. persentil av det halve sekundets sidesakselerasjon;
- **trekkraft** med full gass til 50 km/t, 50-120, 120-200 og over 200, og det mest den viste;
- **bremsing** fra 60 til 160 km/t;
- **topphastighet**: der den sluttet å øke med full gass i ett sekund på en rettstrekning, kjørt rett, ikke en lang kurve tatt flatt, der en bil taper fart uansett kraft. Der ingen rettstrekning var lang nok, sier det den fortsatt trakk med på sitt raskeste hvor langt unna den var. Ingen gjetning utover det runder viser: en tilpasning av kraft over fart mot luftmotstand plasserte en veibil 100 km/t over sin virkelige topphastighet, fordi girene og begrensere avslutter en bils trekk mye før luftmotstanden gjør det.
- **mister bakenden**: hvor mange ganger per runde den gled forbi 10° driftvinkel (20° på løst underlag) med hjulet vridd mot svingen, fanget med motsatt rattutslag. Hvor mange av dem som startet på gassen, og ved hvilken andel av grepet de startet. En bil som kjøres litt sidelengs med vilje, mister ingenting. En bil som må fanges, gjør det. Telles likt for alle biler, slik at to biler kan sammenlignes.
- **balanse**, der rundene har sideglidevinkler: foran mot bak ved grensen.

**Biler sammenlignet** setter bilene side om side: en tabell, en setning hver om hva bilen er i forhold til den andre ("X akselererer bedre, men kan ikke svinge like hardt, trenger lengre for å stoppe og mister bakenden lettere"), og hver forskjell som er tydelig (4 % grep, 5 % trekkraft eller bremsing, 4 km/t topphastighet, en bakende fanget ved minst én gang per runde oftere enn den andre og halvannen gang så ofte), og hvordan hver skal kjøres. Med én bil sier den hva bilen er.

**I hvert sving**, når rundene er kjørt i ulike biler, sier funnet hva av det bilene avgjør, og hvordan få mest ut av denne:

- **gjennom midten**: på den andre bilens linje tillater denne bilens grep `v_annen · √(grep_min / grep_annen)`. Hvis runden holdt den farten, er gapet bilen, og ingen bremsepunkt endrer det. Det sies, og svinget føres på bilen og ikke påføreren. Hvis runden holdt mindre, finnes resten å hente, og det sies hvor mye. Deretter hvor tiden kan vinnes i stedet: på en rettstrekning, eller i en bil med mer trekkraft, etter toppunktet. Brems rett, sving inn senere, få den pekt mot utgangen tidlig. Ellers den bredeste radiusen veien tillater, siden en større radius er den eneste måten å få mer fart uten mer grep.
- **en bakende som slapp taket** her, i en bil som mister den lettere enn den andre: hva du gjør i denne bilen. Gassen legges på etter hvert som rattet retter seg ut, eller bremsen slippes mykt uten å løfte midt i svinget, etter hvordan slidene starter.
- **rettstrekningen etter**: hva den andre bilens sterkere trekkraft fra samme fart tok, og hvor denne bilen gikk tom for trekkraft på den.
- **et tidligere bremsepunkt** i en bil som stopper mindre hardt.

En runde som gled gjennom midten av et sving (over 10° driftvinkel på asfalt) var forbi grepet, ikke under det. Den får aldri beskjed om at den hadde grep til overs der. Og der bilens bakende har sluppet taket i denne runden ved mindre sidesakselerasjon enn svinget krevde, sier "grep til overs" at den skal finnes i små steg.

### 6. Bilkontroll: låsing, hjulspinn, slide og understyring, støt og krasj {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Hver runde leses også for hvordan bilen ble håndtert: der et hjul låste seg, der drivhjulene spant, der bakenden brøt ut, der forenden gikk vidt. Det er feilene som tiden alene ikke navngir. Tre ting gjør at det holder på tvers av spill og underlag.

**Der grepet tar slutt måles ut fra bilens egen kjøring.** Ingeniører setter en låsegrense per bil ved det slippet som ga mest retardasjon (MoTeC-kanalene i OptimumGs bremseserie bruker -0,07 for én bil), ikke en bokverdi. Og bokverdiene er uenige uansett: kraften topper ved 5-20 % slip på asfalt avhengig av dekk og modell, ved 6 % eller 20-60 % på snø avhengig av kilden, og ingen kilde gir én for grus. Spill skalerer slip enda annerledes: Forzas er "normalisert", slik at grep er tapt over 1. Likevel kan en bils bremser gi sitt beste langt under eller langt over 1, og vanlige bremsesoner kan gå over 1. Så for hver bil, over hver innlastet runde av den, deles kraften den laget inn etter slippet den kjørte: retardasjon mot hjulenes slipforhold ved rett bremsing, akselerasjon (som andel av det bilen gir ved den farten) mot drivhjulenes slip, sidegrep (som andel av bilens grep ved den farten) mot hver akselens sideglidevinkel. Grensen er slippet forbi det beste der kraften har falt 8 %. En kurve som aldri faller i dataene, Forza Horizons sving- og trekkgrep, har ingen grense, og slip alene flagger ingenting der. Med for lite data er grensen halvannen gang den nominelle toppen.

**Underlaget kjennes per målepunkt**, der spillet sier det. Forza gir vibrasjon i dekkene på grus, jord og gress (få målepunkter på en asfaltbane, mange på jord- og terrengbaner). Trackmania navngir materialet under hvert hjul, og et rallystrekks underlag finnes som seksjon 11 sier. Kurver, driftvaner og grenser holdes adskilt for asfalt og løst underlag.

**Hver hendelse legges mot den andre runden over de samme meterne.** På grus, snø og i en driftstung arkaderacer er sliding måten et sving kjøres på. Studier av optimal styring finner "lavdrift"-løsninger på asfalt og "aggressive, høydrift, til og med motstyring" ute av vei. Rallydata viser dekk "godt inne i det ikke-lineære området", og å låse et hjul på svært løst underlag kan til og med stoppe bilen raskere. En hendelse som den andre runden også gjorde, 80 % eller mer, er derfor hvordan svinget kjøres, ikke en feil. En hendelse den ikke gjorde, er bare en feil hvis den kostet tid: tiden som tapes fra like før den til 40 m etter. En feil som forklarer 40 % eller mer av et svings tap, blir svingets årsak.

Deteksjonsgrenser, testen mot den andre runden, støt og krasj, og rådteksten: [Bilhendelser](race-control-events.md).

### 6b. Mange runder: banens statistikk {#b-many-laps-the-courses-statistics}

Klassesammenligning, hva som regnes som en feil, statistikken og feilkartet: [Banestatistikk](race-course-statistics.md).

### 7. Den kjørte linjen {#the-driven-line}

For hver runde og hvert sving, bare fra posisjoner: hvor den begynte å svinge (en femdel av dens strammeste krumning), dens strammeste radius (over ±8 m), gjennomsnittsradiusen over første og andre halvdel av retningsendringen, og så videre.

- **form**: strammeste radius delt på gjennomsnittsradiusen under 0,55 er en V, over 0,75 en U.
- **toppunkt**: utgangsradius delt på inngangsradius over 1,25 er sent, under 0,8 tidlig.
- **fartstoppunkt**: der den er saktest mer enn 15 m før halvveispunktet i svingen, er det sakte inn, fort ut. Mer enn 15 m etter, bremser den fortsatt forbi midten.

Mot den andre runden: hvor mye innenfor eller utenfor den kjørte ved innsving, gjennom den strammeste delen og der begge var flate, og hvor hver svinget inn. Hvert funn avsluttes med linjen som passer rundens bil i det svinget, etter hva svinget leder inn på og bilens målte kraft-grep-forhold, downforce og drivlinje, og om runden kjørte den. Tabellen "Sving for sving" lister den raskeste runden gjennom hvert sving med formen på linjen, og de beste svingene satt sammen.

### 8. To kart {#two-maps}

- **Hvor**: banen fargelagt etter `dΔt/ds` mot referansen, rødt der tid tapes og grønt der den vinnes.
- **Hvorfor**: hvert tap tegnet der årsaken er, farget etter årsakens gruppe (bremsing, inngang, utgang, rettstrekning, bil), og bredere for en dyrere.

### 9. Replay {#replay}

Én klokke, tre måter å gjøre den om til hver runde sin egen tid: fra streken, stilt opp (hver runde når ett punkt på banen i samme øyeblikk, og slippes så) og side om side (hver runde holdt ved referansens distanse).

### 10. Hvilken vei verden er {#which-way-round-the-world-is}

Visningsprogrammets verden er høyrehåndet med Y opp. Et spill med en venstrehåndet verden (Forza blant dem) kommer speilvendt ut i den: hver høyresving tegnet som et venstresving, både bane og runder. Rundene sier det selv: positivt rattutslag er til høyre i hver adapter, og den ytre hjulopphengingen i en sving trykkes sammen. Løpsfanen tilbyr derfor å rette det, og **Kamera og scene → Inverter verdensaksen** gjør det: X, Y eller Z tegnes snudd. Bare tegningen endres, en speiling lagt inn i visningsmatrisen. Kameraet flyr i den tegnede verdenen, mens dataene, analysen og alle koordinater verktøyene viser, forblir spillets egne. Analysen navngir svinger venstre eller høyre med samme måling.

### 11. Rally: slidet, venstrefoten, luften {#rally-the-slide-the-left-foot-the-air}

En rallystrekning er ikke en bane kjørt med dårligere grep. På grus og snø er slidet måten et sving tas på: bilen dreies på vei inn ved å flytte vekten. "Bremser flytter vekten til bilen forover ... forhjulene får grep, bakhjulene mister grep, og bilen roterer og slider inn i svingen", og deretter tilbake på gassen når den er "stilt opp i den retningen du vil kjøre" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Venstrefoten bremser, slik at gass og brems kan spilles mot hverandre. Håndbrekket dreier bilen i trange svinger ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), og bilen løfter fra bakken. Seksjon 6 leser allerede slide mot den andre runden. Disse reglene dekker resten.

- **Underlaget.** Det runden sier (`meta.surface`, rallyopptakernes `--surface`), ellers arrangementets navn: asfaltrallyene (Spania, Kroatia, Mellom-Europa, Tyskland, Japan, Korsika, Ypres), vinterrallyene (snø), og Monte-asfalten med snø og is på (blandet) - ellers hvordan bilen ble kjørt. En Rally2-bils sidegrense er 0,7-0,9 g på grus og 1,3-1,4 g på asfalt ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)). På grus kjøres det mye mer drift (seksjon 6). Så en strekning der bilen trakk 10 m/s² eller mer (95. persentil, ved fart, på underlaget) med medianan driftvinkel under 6 grader der den svingte innenfor 70 % av det, var asfalt. Alt annet, eller for lite til å avgjøre, er løst underlag.
- **Hva bilen kan, på underlaget den kjørte på.** Grep, bremsing og trekkraft (seksjon 5) måles på asfalt og løst underlag hver for seg når rundene kjørte en femdel eller mer av målepunktene sine på hvert av dem. Hvert sving bedømmes med underlaget under bilen på sitt saktest punkt. Målepunkter i luften og i 0,3 s etter en landing utelates fra alt som måler bilen: omhyllinger, dekkurver, låsing og hjulspinn. En landing rusker bilen forbi alt dekkene kan, og hjul som spant opp i luften er ikke hjulspinn. Downforce bedømmes ikke på løst underlag, der strekningens raske og langsomme deler er ulike veier.
- **Et lite tramp med venstrefoten er ikke bremsing.** Et lite trykk på bremsen med gassen fortsatt halvt eller mer nede, over mindre enn 15 m, setter bilen eller dreier den. Der en runde begynte å bremse for et sving, er det første bremsetrykket der gassen ble sluppet, eller det som varte lengst.
- **Bilen dreiet på vei inn.** For hver runde og hvert sving, den største driftvinkelen fra bremsingen til 5 m etter sitt saktest punkt. På løst underlag, der en runde hadde bilen dreiet 8 grader eller mer mindre enn den andre (som dreide den 12 eller mer) og kom på kraften senere, **dreide den bilen mindre**. Rådet er å løfte eller tramp venstrefotbremsen når den svinger inn, slik at bakenden kommer rundt, med den andre rundens håndbrekkpunkt når den brukte et, eller håndbrekket i et sving saktere enn 54 km/t, og ha den pekt mot utgangen før toppunktet. En som dreide den 12 grader eller mer utover den andre og fortsatt kom på kraften senere, **dreide den for langt**. Den måtte rettes opp før kraften kunne gå ned. Begge er svingets årsak på vei ut, etter en feil i bilkontrollen. Linjerådet på løst underlag sier det samme for hvert sving.
- **Luften.** En flytur 0,2 s eller mer lengre enn den andre rundens, som kostet tid fra 10 m før avsprang til 40 m etter landingen (eller slutten av svinget), er årsaken når den forklarer 40 % eller mer av svingets tap. Svingen etter den, nådd saktere, sier det. I luften kan bilen ikke svinge, bremse eller kjøre. Rådet holder gassen på ved avsprang, "ikke løft fra gassen under avsprang", som ellers får nesen til å dukke, og tar toppen litt saktere eller med et tramp av bremsen, slik at bilen holder seg lav ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Sammensatte deler på inntil tre svinger.** En kronglete strekning som kjøres uten å være flat et sted, er ikke én lang sammensetning: etter tre svinger starter en ny.

`src/race/rally.test.ts` holder analysen til alt dette på strekninger kjørt med en enkel modell: en bil som dreide mindre og sent på kraften, en lengre flytur, venstrefot-tramp, en kronglete strekning, asfalt mot grus.

## Data, og hva hver kilde tillater {#data-and-what-each-source-allows}

| Kilde | Frekvens | Kanaler | Tillater |
|---|---|---|---|
| FH Companion-rundefiler | ~5 m | posisjon, fart, gass, bremse, styring, lengde- og sideakselerasjon, gir | alt unntatt bilkontroll, som krever telemetrien ved siden av |
| FH Companions `.tele.gz`, ved siden av hver rundefil | spillets 64 Hz (en opptaker som beholder hver pakke skriver ~110 per sekund; gjentakelsene fjernes) | hele Forzas Data Out: per hjul slipforhold, sideglidevinkel, kombinert slip, rotasjon, fjæring, underlagsvibrasjon; farten i bilens ramme; girhastighet | alt, bilkontroll inkludert |
| Forza Data Out, tatt opp av `heat3d_capture telemetry` | 60 Hz | alt over, pluss per hjul: dekktemperatur, slipforhold, sideglidevinkel, kombinert slip, fjæringsutslag, hjulfart, rumblestripe; turtall, effekt, dreiemoment, girhastighet | alt |
| Assetto Corsa, ACC, AC EVO, AC Rally (delt minne, `heat3d_capture telemetry --game ...`) | 60-333 Hz | et supersett: dekkkjerne og indre/midtre/ytre temperaturer, trykk, bremsetemperaturer, hjullaster, kamber, slipforhold og vinkel; farten i bilens ramme; ABS og TC i bruk (ACC, EVO, AC Rally) | alt |
| iRacing `.ibt`, lest direkte | 60 Hz | posisjon fra GPS, pedaler, styring, g, girhastighet, per hjul karkasstemperatur, dempervandring, trykk, slitasje | alt; bilkontroll fra driftvinkelen (dens girhastighet mot kjøreretningen) og styringen, uten slip (ikke logget) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | per bilde; 100 Hz | posisjon, verdenshastighet og bilens akser, per hjul kontaktflatefart og fjæring, pedaler, styring, etappeklokke og lengde | alt; slip og driftvinkel utledet |
| Richard Burns Rally (NGP UDP) | per fysikksteg | posisjon, bilens egne hastigheter, per hjul fjærutslag og kraft, pedaler | alt unntatt hjulslip |
| BeamNG.drive (`heat3d`-protokollmodden) | opptil 100 Hz | posisjon, verdenshastighet og akser, per hjul overflatefart, rotasjon, last og bakkekontakt | alt; slip og driftvinkel utledet |
| Trackmania (Openplanet-plugin) | per bilde | posisjon, forover- og sidefart, pedaler (brems på/av), styring, per hjul slipkoeffisient og løst underlag, i luften | alt; driftvinkelen fra sidefarten |

Hver kilde gjøres om til ett rundeformat, `heat3d-lap`, der kanalene har kanoniske navn (`speed`, `throttle`, `tireTemp[FL]` ...). Bilsymbolet og diagrammene tegner de kanalene en runde har.

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
