---
title: "Race-analyse: de methode"
parent: "Race-analyse"
nav_order: 58
lang: "nl"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Race-analyse: de methode

In het kort:

- Rondes worden vergeleken **op afstand**, niet op tijd, zodat dezelfde plek op de baan op elkaar past.
- Elke bocht wordt **als geheel** beoordeeld, van het ene remvak tot het volgende.
- De verloren tijd wordt **verdeeld** over waar hij verloren ging (remmen, ingang, uitgang, recht stuk) en hoeveel daarvan de auto verklaart.
- De oorzaak wordt **in woorden uitgelegd**, met advies.
- Om het te gebruiken, niet om te lezen hoe het werkt: zie [Race-analyse](race-analysis.md).

Dit is de methode achter het tabblad **Race-analyse**: wat het meet, hoe het bepaalt waar de tijd bleef, en hoe het dat omzet in advies. Het is de specificatie die de analysecode (`src/race/`) volgt, dus elke regel hier heeft een tegenhanger daar en een test die hem vastlegt.

## Wat de professionele tools doen {#what-the-professional-tools-do}

De gevestigde tools komen op dezelfde kern uit en verschillen vooral in hoe ver ze gaan richting *oorzaken*:

- **Alles wordt vergeleken op afstand, niet op tijd.** Twee rondes worden op één afstandsas herrekend; het lopende verschil in verstreken tijd op dezelfde afstand is de *delta* (MoTeC noemt het time variance, anderen de time slip of delta-trace). De helling zegt waar nu tijd verloren gaat: een vlakke helling is versnelling, luchtweerstand of aanhoudende grip; een steile helling een verschil in remmen of gas; een golf omhoog en omlaag een afweging tussen insnelheid en uitgangssnelheid.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [sectietijdanalyse](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Elke bocht wordt in fasen verdeeld**: remmen, ingang, midden, uitgang - rempunt, maximale rem en loslaten, laagste snelheid en waar die valt, versnelling, gaspedaal erbij, terug naar vol gas, uitgangssnelheid.
  ([Driver61: zes fasen](https://driver61.com/uni/corner-phases/),
  [iRacing-gids voor rondeanalyse](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Minisecties per bocht, en een theoretisch beste ronde** samengesteld uit de snelste van elk. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **De gereden lijn wordt ook vergeleken**, maar nooit alleen: "een lijn op een afbeelding betekent niets zolang je de bijdragende factoren niet kent" - ze wordt gelezen naast het snelheidsverloop en de delta.
  ([Track Titan: telemetrie analyseren](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racelijnen](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Oorzaak, niet symptoom.** Komt het verlies op het rechte stuk echt door het gas, of heeft een slechte ingang het gas laat gemaakt? Fouten worden gerangschikt op rondetijdverlies en in gewone taal uitgelegd.
  ([Track Titan coachingstromen](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Wat er in de eerste versie misging, en waarom het ertoe doet {#what-went-wrong-in-the-first-version-and-why-it-matters}

De eerste versie rekende elke *fase* apart af en keek alleen naar verliezen. Een ronde die eerder remde, verloor tijd in de remfase, en kreeg te horen later te remmen - ook als die eerdere rem de auto eerder liet insturen, eerder op vermogen liet komen en sneller uit de bocht liet komen, en dat allemaal weer terugwon op het rechte stuk. In één test kreeg de ronde die dat deed te horen "veel later te remmen", terwijl de andere ronde - die wel later remde - het mikpunt had gemist, te wijd was gegaan en precies kwijt was wat hij had gewonnen. De tijdsdata zei dat de twee manieren gelijk waren; het advies zei het tegenovergestelde.

De oplossing is de regel waar alle bronnen hierboven het over eens zijn: **een bocht wordt als geheel beoordeeld**, van het remvak voor die bocht tot het remvak voor de volgende, omdat "soms een paar milliseconden verliezen in een bocht de totale rondetijd kan verbeteren doordat de snelle stukken erna sneller worden"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Racekennis waar de regels op rusten {#racing-knowledge-the-rules-encode}

**Uitgangssnelheid telt zwaarder dan insnelheid**, en des te zwaarder hoe langer het volgende rechte stuk is: "tijd op rechte stukken domineert tijd in bochten", en een snelheidstekort bij de uitgang wordt meegenomen tot het volgende rempunt. De snelste manier door een bocht-en-rechtstuk is vaak langzamer de bocht in, zodat het gas eerder komt - *langzaam in, snel uit*.
([Race & Track Driving: volgorde om je rondetijd te verbeteren](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: bochten prioriteren](https://driver61.com/uni/prioritising-corners/))
Een planner die de snelste lijn zoekt en ook beloond wordt voor uitgangssnelheid verlegt zijn mikpunten later en krijgt een *snellere* ronde. De beloning die beide in balans houdt, is `L / v²` per eenheid uitgangssnelheid voor een recht stuk van lengte `L` op snelheid `v` - de tijd die een snelheidsverschil kost op een rechtstuk groeit met de lengte en neemt af met het kwadraat van de snelheid
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Bochten naar wat ze opleveren.** Een bocht naar een rechtstuk: maximaliseer de uitgangssnelheid, late mikpunt, zo snel mogelijk weer gas. Een bocht aan het eind van een rechtstuk: maximaliseer de snelheid die je meeneemt, rem zo laat mogelijk, een vroeger mikpunt is acceptabel. Een bocht tussen twee andere bochten: een compromis voor de bocht die daarna het belangrijkst is. Een bocht die beide kan zijn, wordt behandeld als een bocht naar een rechtstuk. Snellere bochten wegen zwaarder: bij hoge snelheid versnelt een auto zwak, en een verloren km/u haal je niet meer terug.
([Allen Berg: drie soorten bochten](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: bochten prioriteren](https://driver61.com/uni/prioritising-corners/),
[Driver61: verschillende bochten, verschillende technieken](https://driver61.com/uni/different-corner-technique/))

**De wrijvingscirkel.** Een band heeft één budget aan grip, dat wordt besteed aan remmen, bochten en versnellen in welke mix ook; de totale versnelling is `sqrt(lat² + long²)`. Trail braking volgt de rand daarvan: de rem wordt losgelaten terwijl het stuur en de zijdelingse belasting oplopen.
([wrijvingscirkel](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g-diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Uitrollen** - geen pedaal ingedrukt - is de langzaamste manier om snelheid te verliezen, en een gemeten kernprestatie-indicator op zich.
([Racecar Engineering / OptimumG: uitrolfactor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slip.** De langsmacht piekt bij een slipverhouding van ongeveer 10-20%, en daalt daarna; voorbij dat punt blokkeert het wiel bij remmen of slipt het door bij gas. Forza rapporteert slip genormaliseerd: 0 is volle grip, een grootte boven 1 betekent dat de grip weg is.
([langsslip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Onder- en overstuur.** Een slipshoek voor die groter is dan achter, is onderstuur; achter groter dan voor is overstuur. Zonder slipshoeken: de auto draait minder dan het stuur vraagt (het stuur boven de Ackermann-hoek `L/R` die een auto bij lage snelheid nodig heeft).
([onderstuur, overzicht](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## De meetkunde van een lijn {#the-geometry-of-a-line}

De snelheid die een auto op een straal `R` kan houden is `v = sqrt(a R)`, met `a` de zijdelingse versnelling die zijn banden geven (plus wat downforce toevoegt, dat met `v²` groeit). Dus **snelheid groeit met de wortel van de straal**: een lijn door het midden op een 20% grotere straal is daar ongeveer 10% sneller.
([maximale bochtsnelheid](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: bochten](https://www.formula1-dictionary.net/cornering_tech.html))

**De geometrische lijn** is de grootste boog door een bocht: van de buitenrand, de binnenkant rakend bij het mikpunt, terug naar de buitenrand. Voor een bocht die `θ` draait op een weg van breedte `w` (min de breedte van de auto), heeft een boog die beide buitenranden raakt en de binnenhoek aanraakt `R = w / (1 - cos(θ/2))` (plus de eigen straal van de binnenrand) - voor een rechte hoek ongeveer `3,4 w`, voor een haarspeld `w`. Daarom telt de breedte het zwaarst in middelzware bochten en het minst in haarspelden.
([Racelijn](https://en.wikipedia.org/wiki/Racing_line))

**Het late mikpunt** draait later en dieper in, eerst op een strakkere straal, en opent de straal op de uitweg: langzamer door het midden, eerder recht, eerder vlak - "een iets lagere minimumsnelheid maar een sterker versnellingsprofiel bij de uitgang". **Het vroege mikpunt** is het omgekeerde: sneller erin, en een straal die zich op de uitweg aanscherpt en het gas inhoudt - grotendeels een fout, behalve bij zeer weinig grip, waar snelheid die je bij de ingang verliest bij de uitgang niet meer terug te halen is.
([Racelijn](https://en.wikipedia.org/wiki/Racing_line),
[Telemetrie-woordenlijst voor racing](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[wiskunde van de racelijn](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**De "V" en de "U".** De U is de klassieke ronde lijn: de breedste straal, de minste stuurbeweging. De V draait eerder in, gaat dieper, draait de auto snel in het midden en legt de uitweg recht voor een rechtere uitgang: het remmen blijft recht (zodat het later kan), de minimumsnelheid is lager maar wordt later bereikt, vol gas komt veel eerder.
([Track Titan: de V-lijn](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Kromming tegenover afstand.** De snelste lijn is een compromis tussen het kortste pad en de lijn met de minste kromming. Op de breedte van een racebaan telt de kromming zwaarder, en een lijn met minimale kromming komt overal waar de auto op zijn grens rijdt dicht bij de lijn met de kortste tijd - hij wijkt ervan af waar de auto zou kunnen versnellen.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Bochten achter elkaar** - een dubbel mikpunt, een chicane - zijn één probleem: de uitweglijn van de ene is de ingangslijn van de volgende, en ze worden achterstevoren gereden vanaf de bocht die op een rechtstuk uitkomt.
([Driver61: verschillende bochten, verschillende technieken](https://driver61.com/uni/different-corner-technique/))

## Welke lijn bij welke auto past {#which-line-suits-which-car}

Wat dat bepaalt is het **vermogen ten opzichte van de grip** van de auto bij de snelheden van die bocht - "momentum is grip ten opzichte van vermogen, een kwestie van verhouding".
([Ross Bentley: momentumauto's](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum boven pk's](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto, in deze bocht | Lijn | Waarom |
|---|---|---|
| Versnelt hard voor zijn grip ("point and shoot") | V: recht en laat remmen, laat draaien in een korte, strakke middenbocht, vroeg recht en vlak | de tijd wordt gewonnen met vol gas, niet met de minimumsnelheid |
| Versnelt zwak voor zijn grip ("momentum") | brede U, iets late mikpunt, houd de minimumsnelheid hoog | hij kan snelheid die hij afremt niet terugwinnen |
| Daartussen | langzaam in, snel uit: U met late mikpunt | het klassieke compromis |
| Snelle bocht, en meer nog met downforce | U, dicht bij de geometrische lijn | versnelling is zwak bij hoge snelheid; downforce-grip groeit met `v²`, dus snelheid door het midden betaalt dubbel |
| Zeer weinig grip (nat, sneeuw) | vroeger mikpunt | snelheid die je erin verliest, kun je er niet meer uit halen |
| Vermogen ver boven de grip | de lijn telt minder | tractie, niet de lijn, beperkt de uitgang |

"Hoe sneller de bocht, hoe dichter bij de geometrische lijn; hoe langzamer, hoe meer je hem verandert met een later mikpunt."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[wiskunde van de racelijn](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: de V-lijn](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

De aandrijving verandert hoe de lijn gereden wordt meer dan de lijn zelf: een voorwielaangedreven auto wordt op de rem gedraaid (trail braking) en pas gas gegeven als het wiel ontdraait, anders gaat hij wijd; een krachtige achterwielaangedreven auto moet recht zijn voor vol gas, anders breekt het achterwiel uit; vierwielaandrijving kan kracht geven terwijl hij nog draait, dus pakt het gas eerder op.
([FWD-techniek](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD in bochten](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

De viewer meet de vermogen-grip-verhouding van de auto in elke bocht uit zijn eigen rijstijl - versnelling op vol gas bij de uitgangssnelheid, gedeeld door de zijdelingse grip bij de minimumsnelheid - en noemt het "point and shoot" vanaf 0,45 en hoger, "momentum" bij 0,25 en lager. Een auto waarvan de grip bij 150-250 km/u meer dan 15% boven zijn grip bij 55-110 km/u ligt, heeft downforce die werkt.

## De methode {#the-method}

De getallen hieronder zijn de redenering. De drempels die de code gebruikt, staan elk op een eigen pagina, en die pagina's zijn de referentie als een getal hier afwijkt: [Analyse bocht voor bocht](race-corner-analysis.md), [Gebeurtenissen bij wagenbeheersing](race-control-events.md), [Wagenprofielen en vergelijking](race-car-profiles.md) en [Baanstatistieken](race-course-statistics.md).

### 1. Eén afstandsas {#one-distance-axis}

De snelste ronde is de referentie, tenzij de gebruiker een andere kiest. Zijn gereden pad is de as: de samples van elke andere ronde worden erop geprojecteerd, zodat elk sample een afstand langs de referentie `s` krijgt en een getekende zijdelingse afwijking `d`. De projectie zoekt alleen vooruit vanaf de vorige match, zodat een ronde die over zichzelf heen rijdt nooit naar de verkeerde kant van een brug springt. Rondes worden daarna voor elk kanaal op één raster herbemonsterd, elke 2 m. Elke ronde wordt de laatste paar meter doorgerekend tegen de snelheid die hij had, zodat zijn delta bij de finish zijn verschil in rondetijd is.

### 2. Bochten, en het aandeel van elke bocht in de ronde {#corners-and-each-corners-share-of-the-lap}

Hoe bochten, segmenten en complexen worden gevonden: [Analyse bocht voor bocht](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. De tijdrekening van een bocht {#the-time-account-of-a-corner}

Netto, verdeling, uitgangssnelheid en de trek van de auto's: [Analyse bocht voor bocht](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Het oordeel, en de oorzaak {#the-verdict-and-the-cause}

De oordeelspatronen en de oorzaken bij de ingang en bij de uitgang: [Analyse bocht voor bocht](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. De auto tegenover de bestuurder {#the-car-against-the-driver}

Als de rondes in verschillende auto's gereden zijn, wordt het verlies dat de auto verklaart eruit gehaald, per onderdeel:

- **trek**: de auto's vanaf dezelfde snelheid over het rechte stuk, zoals hierboven;
- **grip**: van de lagere minimumsnelheid die niet door een strakkere straal verklaard wordt, het aandeel `½ ln(grip_ander / grip_mijn) / ln(v_ander / v_mijn)`, als de ronde op de grens van zijn auto zat (90% van wat hij bij die snelheid heeft laten zien);
- **remmen**: van `u` naar `v` bij vertraging `a1` tegenover `a2`, eindigend op hetzelfde punt, kost `(1/a1 - 1/a2)(u - v)² / 2u` - alleen als de ronde over de zone gemiddeld ongeveer zo hard remde als zijn auto kan, niet alleen op een piek.

Wat een auto kan, komt uit elke geladen ronde van die auto: zijdelingse grip, remmen en versnelling op vol gas per snelheidsbak van 5 m/s (95e, 95e en 90e percentiel). Grip is wat de auto **een halve seconde vasthield** - de zijdelingse versnelling gemiddeld over 0,5 s - en niet wat één sample raakte: een kerb, een slide die terugklapt, een auto die wordt bijgevangen, geven allemaal een korte piek, en een auto die dat vaak doet, leek grijper dan hij is. (Gecontroleerd met opgenomen rondes van twee verschillende auto's: de maat per sample zette ze dicht bij elkaar; een halve seconde vastgehouden scheidt ze zoals hun rondetijden doen.) Remmen en trek nemen elk sample als de mediaan van zichzelf en zijn buren. De momenten in de lucht, het zetten na een landing, en elke klap (deel 6) tot de auto hersteld is, worden weggelaten.

**Wat voor auto het is** (`profile.ts`): uit dezelfde rondes:

- **grip vastgehouden**: het 95e percentiel van die halve-seconde zijdelingse versnelling;
- **trek** op vol gas tot 50 km/u, 50-120, 120-200 en boven 200, en het meeste dat hij liet zien;
- **remmen** van 60 naar 160 km/u;
- **topsnelheid**: waar hij bleef versnellen op vol gas, een seconde lang op een rechtstuk - rechtdoor gereden, niet een lange bocht vlak genomen, waar een auto bij elk vermogen snelheid verliest. Waar geen rechtstuk lang genoeg was, zegt wat hij op zijn snelst nog trok hoe ver hij ervan af zat. Geen gok buiten wat de rondes laten zien: een fit van vermogen over snelheid tegen luchtweerstand zette een gewone auto 100 km/u boven zijn echte topsnelheid, omdat de overbrenging en de begrenzer de trek van een auto veel eerder beëindigen dan de luchtweerstand dat doet;
- **achterwiel kwijt**: hoe vaak per ronde hij meer dan 10° slip overschreed (20° op losse ondergrond) met het stuur tegen de bocht in - gevangen met tegenstuur - hoeveel daarvan begonnen op het gas, en bij welk deel van zijn grip ze begonnen. Een auto die bewust een beetje schuin gereden wordt, verliest niets; een die gevangen moet worden, wel. Voor elke auto even geteld, zodat twee auto's vergeleken kunnen worden;
- **balans**, waar de rondes slipshoeken bevatten: voor tegenover achter op de grens.

**Auto's vergeleken** zet de auto's naast elkaar: een tabel, een zin per auto over wat hij is ten opzichte van de andere ("X versnelt beter, maar kan niet zo scherp draaien, heeft langer nodig om te stoppen en verliest zijn achterkant makkelijker"), elk verschil dat duidelijk is (4% grip, 5% trek of remmen, 4 km/u topsnelheid, een achterwiel dat minstens één keer per ronde vaker gevangen wordt en anderhalf keer zo vaak), en hoe elke auto gereden moet worden. Bij één auto zegt het wat die auto is.

**In elke bocht**, als de rondes in verschillende auto's gereden zijn, zegt de bevinding wat van het verschil de auto's bepalen, en hoe je het beste uit deze auto haalt:

- **door het midden**: op de lijn van de andere auto laat de grip van deze auto `v_ander · √(grip_mijn / grip_ander)` toe. Als de ronde dat haalde, is het verschil de auto, en geen remmpunt verandert dat - het wordt gezegd, en de bocht wordt op de auto geschoven en niet op de bestuurder. Haalde hij minder, dan is de rest te winnen, en wordt gezegd hoeveel. Daarna waar de tijd nu wel gewonnen kan worden: op een rechtstuk, of in een auto die harder trekt, na het mikpunt - rem recht, draai later in, zet hem vroeg op de uitgang; anders de breedste straal die de weg toelaat, want een grotere straal is de enige weg naar meer snelheid zonder meer grip;
- **een achterwiel dat hier loslaat**, in een auto die het makkelijker verliest dan de andere: wat je in deze auto moet doen - het gas geleidelijk erbij, terwijl het stuur terugdraait, of de rem zacht loslaten zonder gas los te laten midden in de bocht, afhankelijk van hoe de slides beginnen;
- **het rechtstuk erna**: wat de sterkere trek van de andere auto vanaf dezelfde snelheid opleverde, en waar deze auto op dat stuk zijn trek op had;
- **een eerder rempunt** in een auto die minder hard remt.

Een ronde die over het midden van een bocht slipte (meer dan 10° slip op asfalt), zat voorbij zijn grip, niet eronder: er wordt nooit gezegd dat hij daar grip over had. En waar het achterwiel in deze ronde losliet bij minder zijdelingse versnelling dan de bocht van hem vroeg, zegt "grip over" dat je het in kleine stappen moet vinden.

### 6. Autobediening: blokkeren, doorslippen, slides en duwen, klappen en botsingen {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Elke ronde wordt ook gelezen op hoe de auto bediend werd - waar een wiel blokkeerde, waar de aangedreven wielen doorslipten, waar het achterwiel uitbrak, waar het voorwiel wijd schoof - omdat dat de fouten zijn die tijd alleen niet benoemt. Drie dingen zorgen ervoor dat het standhoudt over games en ondergronden heen.

**Waar de grip ophoudt, wordt gemeten uit het eigen rijgedrag van de auto.** Ingenieurs stellen per auto een blokkeergrens in op de slip die de meeste vertraging gaf (de MoTeC-kanalen in de remserie van OptimumG gebruiken -0,07 voor één auto), niet op een boekwaarde, en de boekwaarden verschillen toch: de kracht piekt bij 5-20% slip op asfalt, afhankelijk van band en model, bij 6% of bij 20-60% op sneeuw, afhankelijk van de bron, en geen bron geeft er een voor grind. Games schalen de slip weer anders: die van Forza is "genormaliseerd", zodat voorbij 1 de grip weg is. Toch kunnen de remmen van een auto hun beste werk onder of ver boven 1 leveren, en gewone remzones kunnen voorbij 1 lopen. Dus voor elke auto, over elke geladen ronde ervan, wordt de kracht die hij maakte ingedeeld naar de slip waarmee hij reed: vertraging tegenover de slipverhouding van de wielen bij recht remmen; versnelling (als deel van wat de auto op die snelheid maakt) tegenover de slip van de aangedreven wielen; grip in bochten (als deel van de grip van de auto op die snelheid) tegenover de slipshoek van elke as. De grens is de slip voorbij het beste punt, waar de kracht 8% gedaald is. Een curve die in de data nooit daalt - de bocht- en tractiecurves van Forza Horizon - heeft geen grens, en slip alleen markeert daar niets. Met te weinig data is de grens anderhalf keer de nominale piek.

**De ondergrond is per sample bekend**, waar het spel het zegt: Forza laat de banden trillen op grind, zand en gras (weinig samples op een asfaltcircuit, veel op onverharde en cross-country-banen), Trackmania noemt het materiaal onder elk wiel, en de ondergrond van een rallyproef wordt gevonden zoals deel 11 zegt. Curves, slidegewoonten en drempels worden apart gehouden voor asfalt en losse ondergrond.

**Elke gebeurtenis wordt naast de andere ronde gelegd, over dezelfde meters.** Op grind, op sneeuw, in een arcade-racer met veel slides, is slippen hoe een bocht gereden wordt. Studies naar optimale besturing vinden "lage-slip"-oplossingen op asfalt en "agressieve, hoge-slip, zelfs tegenstuur"-oplossingen off-road, rallydata laat banden zien "ver binnen het niet-lineaire gebied", en een wiel laten blokkeren op zeer losse ondergrond kan de auto zelfs sneller doen stoppen. Dus een gebeurtenis die de andere ronde ook maakte - 80% of meer ervan - is hoe de bocht gereden wordt, geen fout. Een gebeurtenis die de andere ronde niet maakte, is alleen een fout als hij tijd kostte: de tijd die verloren gaat van net voor de gebeurtenis tot 40 m erna. Een fout die 40% of meer van het verlies van een bocht verklaart, wordt de oorzaak van die bocht.

Detectiedrempels, de test met de andere ronde, klappen en botsingen, en de adviesteksten: [Gebeurtenissen bij wagenbeheersing](race-control-events.md).

### 6b. Veel rondes: de statistieken van de baan {#b-many-laps-the-courses-statistics}

Klassenvergelijking, wat als fout telt, de statistieken en de foutenkaart: [Baanstatistieken](race-course-statistics.md).

### 7. De gereden lijn {#the-driven-line}

Voor elke ronde en bocht, alleen uit posities: waar hij begon te draaien (een vijfde van zijn strakste kromming), zijn strakste straal (over ±8 m), de gemiddelde straal over de eerste en de tweede helft van zijn koersverandering, en zo verder:

- **vorm**: strakste straal gedeeld door gemiddelde straal onder 0,55 is een V, boven 0,75 een U;
- **mikpunt**: uitgangsstraal gedeeld door ingangsstraal boven 1,25 is laat, onder 0,8 vroeg;
- **snelheidsmikpunt**: zijn langzaamste punt meer dan 15 m vóór het halverwege-punt van zijn bocht is langzaam erin, snel eruit; meer dan 15 m erna, nog remmend voorbij het midden.

Tegenover de andere ronde: hoe ver hij binnen of buiten reed bij het insturen, door het strakste deel en waar beide vlak waren, en waar elk insturen. Elke bevinding sluit af met de lijn die bij de auto van de ronde hoort in die bocht - op basis van waar de bocht naartoe leidt en het gemeten vermogen-grip-verhouding, de downforce en de aandrijving van de auto - en of de ronde die lijn ook reed. De tabel "Bocht voor bocht" geeft de snelste ronde door elke bocht met de vorm van zijn lijn, en de beste bochten samengevoegd.

### 8. Twee kaarten {#two-maps}

- **Waar**: de baan gekleurd op `dΔt/ds` ten opzichte van de referentie, rood waar tijd verloren gaat en groen waar tijd gewonnen wordt.
- **Waarom**: elk verlies getekend waar zijn oorzaak zit, gekleurd naar de groep van de oorzaak - remmen, ingang, uitgang, recht stuk, auto - en breder voor een duurder verlies.

### 9. Replay {#replay}

Één klok, drie manieren om hem om te zetten naar de eigen tijd van elke ronde: vanaf de start, opgesteld (elke ronde bereikt op hetzelfde moment één punt van de baan, waarna wordt losgelaten) en naast elkaar (elke ronde vastgehouden op de afstand van de referentie).

### 10. Welke kant de wereld op is {#which-way-round-the-world-is}

De wereld van de viewer is rechtshandig met Y omhoog. Een spel met een linkshandige wereld (Forza onder andere) komt er gespiegeld in: elke rechter bocht wordt getekend als een linker bocht, baan en rondes samen. De rondes zeggen het zelf - positief sturen is naar rechts bij elke adapter, en de buitenste vering van een bocht drukt in - dus de racetab biedt aan dit te herstellen, en **Camera & scène → Wereldas omkeren** doet dat: X, Y of Z wordt omgekeerd getekend. Alleen de tekening verandert: een spiegeling in de view-matrix. De camera vliegt in de getekende wereld, en de data, de analyse en elke coördinaat die de tools tonen, blijven van het spel zelf. De analyse benoemt bochten links of rechts met dezelfde meting.

### 11. Rally: de slide, de linkervoet, de lucht {#rally-the-slide-the-left-foot-the-air}

Een rallyproef is geen circuit dat op slechtere grip gereden wordt. Op grind en sneeuw is de slide hoe een bocht genomen wordt: de auto wordt bij het insturen gedraaid door het gewicht te verplaatsen - "remmen verplaatst het gewicht van de auto naar voren ... de voorbanden krijgen grip, de achterbanden verliezen grip, en de auto draait slidend de bocht in" - en daarna weer gas zodra hij "gericht staat in de richting waarin je wilt" ([DirtFish: zo gebruik je de remmen](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). De linkervoet doet het remmen, zodat gas en rem tegen elkaar gespeeld kunnen worden; de handrem draait de auto in strakke bochten
([RallySport Ontario: rallyrijden, de basis](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
en de auto komt van de grond. Deel 6 leest slides al naast de andere ronde; deze regels dragen de rest.

- **De ondergrond.** Wat de ronde zegt (`meta.surface`, de `--surface` van de rally-recorders), anders de naam van het evenement - de asfaltrally's (Spanje, Kroatië, Midden-Europa, Duitsland, Japan, Corsica, Ypres), de winterse (sneeuw), de asfaltstukken van de Monte met sneeuw en ijs erop (gemengd) - anders hoe de auto gereden werd.
  Een Rally2-auto haalt een zijdelingse limiet van 0,7-0,9 g op grind en 1,3-1,4 g op asfalt ([grenzbereich, referentiewaarden](https://github.com/GitCrush/grenzbereich)), en op grind schuift hij veel meer (deel 6). Dus een proef waarop de auto 10 m/s² of meer trok (95e percentiel, bij snelheid, op de ondergrond) met een mediane slip onder 6 graden, waar hij ook bochtte binnen 70% daarvan, was asfalt; alles anders, of te weinig om het te zien, is los.
- **Wat de auto kan, op de ondergrond waarop hij het deed.** Grip, remmen en trek (deel 5) worden apart gemeten op asfalt en op losse ondergrond wanneer de rondes een vijfde of meer van hun samples op elk van beide reden, en elke bocht wordt beoordeeld met de ondergrond onder de auto op zijn langzaamste punt. Samples in de lucht en 0,3 s na een landing worden weggelaten uit alles wat de auto meet - enveloppen, bandencurves, blokkeren en doorslippen. Een landing schudt de auto verder dan zijn banden kunnen, en wielen die in de lucht opdraaien, zijn geen doorslippen. Downforce wordt niet beoordeeld op losse ondergrond, waar de snelle en langzame stukken van een proef verschillende wegen zijn.
- **Een tikje met de linkervoet is geen remmen.** Een tik op de rem, met het gas nog op de helft of meer, over minder dan 15 m, zet de auto recht of draait hem; waar een ronde begon te remmen voor een bocht, is de eerste rem waaronder het gas eraf kwam, of die langer duurde.
- **De auto draaide bij het insturen.** Voor elke ronde en bocht de grootste slipshoek van het remmen tot 5 m voorbij zijn langzaamste punt. Op losse ondergrond draaide een ronde die de auto 8 graden of meer minder had gedraaid dan de andere (die 12 of meer draaide) en later op het vermogen kwam of vlak bleef, **de auto minder**. Het advies is het gas los te laten of de linkervoet-rem te tikken terwijl hij instuurt, zodat het achterwiel rond komt - met het handremmoment van de andere ronde als die er een gebruikte, of de handrem in een bocht langzamer dan 54 km/u - en hem voor het mikpunt op de uitgang te zetten. Een ronde die hem 12 graden of meer verder draaide dan de andere en toch later op het vermogen kwam, **draaide hem te ver**: hij moest rechtgezet worden voordat het vermogen erop kon. Beide zijn de oorzaak van die bocht op de uitweg, na een fout in de wagenbeheersing. Het lijnadvies op losse ondergrond zegt hetzelfde voor elke bocht.
- **De lucht.** Een vlucht die 0,2 s of meer langer duurde dan die van de andere ronde, en die tijd kostte van 10 m voor het afspringen tot 40 m na de landing (of het einde van de bocht), is de oorzaak als hij 40% of meer van het verlies van de bocht verklaart. De bocht erna, die langzamer bereikt wordt, zegt dat. In de lucht kan de auto niet draaien, remmen of gas geven. Het advies houdt het gas erop bij het afspringen - "het gas niet loslaten tijdens het afspringen", want anders duikt de neus - en neemt de top iets langzamer of met een tikje op de rem, zodat de auto laag blijft ([DirtFish: hoe spring je met een rallyauto](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complexen van hooguit drie bochten.** Een kronkelend stuk dat nooit vlak gereden wordt, is niet één lang complex: na drie bochten begint er een nieuw.

`src/race/rally.test.ts` houdt de analyse aan dit alles, op proeven die met een eenvoudig model gereden zijn: een auto die minder en later op het vermogen draait, een langere vlucht, tikken met de linkervoet, een kronkelend stuk, asfalt tegenover grind.

## Data, en wat elke bron toestaat {#data-and-what-each-source-allows}

| Bron | Resolutie | Kanalen | Maakt mogelijk |
|---|---|---|---|
| FH Companion-rondebestanden | ~5 m | positie, snelheid, gas, rem, stuur, lat/long-versnelling, versnelling | alles behalve wagenbeheersing, die de telemetrie ernaast nodig heeft |
| FH Companion's `.tele.gz`, naast elk rondebestand | de 64 Hz van het spel (een recorder die elk pakket bewaart, schrijft er ongeveer 110 per seconde; de herhalingen worden weggelaten) | Forza's hele Data Out: per wiel slipverhouding, slipshoek, gecombineerde slip, rotatie, vering, trillen van de ondergrond; de snelheid in het autoframe; gierhoeksnelheid | alles, wagenbeheersing inbegrepen |
| Forza Data Out, opgenomen met `heat3d_capture telemetry` | 60 Hz | alles hierboven, plus per wiel: bandtemperatuur, slipverhouding, slipshoek, gecombineerde slip, veerweg, wielsnelheid, trilstrook; toerental, vermogen, koppel, gierhoeksnelheid | alles |
| Assetto Corsa, ACC, AC EVO, AC Rally (gedeeld geheugen, `heat3d_capture telemetry --game ...`) | 60-333 Hz | een superset: temperatuur van de bandkern en van binnen, midden en buiten, drukken, remtemperaturen, wiellasten, camber, slipverhouding en -hoek; de snelheid in het autoframe; ABS en TC in werking (ACC, EVO, AC Rally) | alles |
| iRacing `.ibt`, direct gelezen | 60 Hz | positie via GPS, pedalen, stuur, g, gier, per wiel de carcasstemperatuur, dempervering, druk, slijtage | alles; wagenbeheersing uit de slipshoek (de gier tegen de rijrichting) en het stuur, geen slip (niet vastgelegd) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | per frame; 100 Hz | positie, wereldsnelheid en de assen van de auto, per wiel de snelheid van het contactvlak en de vering, pedalen, stuur, ritklok en lengte van de proef | alles; slip en slipshoek worden afgeleid |
| Richard Burns Rally (NGP UDP) | per fysicastap | positie, de eigen snelheden van de auto, per wiel de veerweg en kracht, pedalen | alles behalve wielslip |
| BeamNG.drive (de `heat3d`-protocolmod) | tot 100 Hz | positie, wereldsnelheid en assen, per wiel de oppervlaktesnelheid, rotatie, belasting en grondcontact | alles; slip en slipshoek worden afgeleid |
| Trackmania (de Openplanet-plug-in) | per frame | positie, voor- en zijsnelheid, pedalen (rem aan/uit), stuur, per wiel de slipcoëfficiënt en losse ondergrond, in de lucht | alles; de slipshoek uit de zijsnelheid |

Elke bron wordt omgezet naar één rondeformaat, `heat3d-lap`, waarvan de kanalen canonieke namen hebben (`speed`, `throttle`, `tireTemp[FL]` ...). Het autopictogram en de grafieken tekenen welke kanalen een ronde ook heeft.

## Bronnen {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Sectietijden versnellen: vormen van de tijdsvariantie](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta in het afstandsdomein)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing-gids voor rondeanalyse](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: rondes van een sessie](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: racelijnen analyseren](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretisch beste uit sectoren](https://overcut.gg/)
- [Track Titan: telemetrie analyseren](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: remanalyse, blokkeer- en stabiliteits-KPI's (sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: op het gas (jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: kerntaakindicatoren van racecoureurs (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modellen voor wrijving tussen band en weg en optimale slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: wrijving tussen band en wegdek, slip bij de piek op sneeuw en ijs](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: wrijvingscoëfficiënten van banden, piek en glijden](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: langskrachten](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: zijkrachten](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Voertuigstabiliteit, grenzen van de slipshoek (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rijden op rally met grote slipshoek (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimumtijd-manoeuvres in de rally (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Referentie-gierhoeksnelheid voor ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Onder- en overstuur herkennen door tegen de gier te sturen (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: stuurhoek, Ackermann en de onderstuur-gradiënt](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: wiskundige kanalen (Kus, gecombineerde g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: widget voor onder- en overstuur](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: blokkeren op zeer losse ondergrond](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: data loggen op grindrally's](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: zo gebruik je de remmen](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: zo spring je met een rallyauto](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rallyrijden, de basis](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: voertuigdynamica van rallyauto's, referentiewaarden](https://github.com/GitCrush/grenzbereich)
- [Trackmania-plug-in voor speed-drift-training (constanten)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania: beschrijving van de speedslide](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coachingstromen](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: de V-lijn](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Het rijgedrag van een kunstmatige racecoureur sturen (uitgangssnelheid tegenover minimumtijd)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: volgorde om je rondetijd te verbeteren](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: de drie soorten bochten](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: bochten prioriteren](https://driver61.com/uni/prioritising-corners/)
- [Driver61: verschillende bochten, verschillende technieken](https://driver61.com/uni/different-corner-technique/)
- [Driver61: de zes fasen van een bocht](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (fragment)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: wat is een momentumauto](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Het debat over momentum boven pk's](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Wiskunde van de racelijn, deel 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, deel 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD-techniek](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD in bochten](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racelijn](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: bochttechniek](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximale bochtsnelheid](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Woordenlijst telemetrie voor racing](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globale trajectplanning met minimumtijd, met kromming en afstand](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globale optimalisatie van de racetrajecten](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: de uitrolfactor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Introductie wrijvingscirkel](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g-diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Langsslip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Onderstuur, een overzicht](https://www.sciencedirect.com/topics/engineering/understeer)
- [Onderstuur en overstuur](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out-documentatie](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: door tractie beperkte versnelling](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: door vermogen beperkte versnelling](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO gedeeld geheugen](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally-telemetrielezer](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT-verwerking](https://github.com/teamjorge/ibt)
