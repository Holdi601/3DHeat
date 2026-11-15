---
title: "Hændelser for bilkontrol"
parent: "Løbsanalyse"
nav_order: 54
lang: "da"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Hændelser for bilkontrol

Visningen viser, hvordan hver runde blev kørt. Den markerer de steder, hvor føreren fik bilen til at glide, snurre, ramme noget eller spilde greb. Det er nyttigt, fordi en fejl, der kostede tid, er den hurtigste at rette.

![Afsnittet Bilkontrol: hvor ofte hver runde låste et hjul, snurrede eller kørte for vidt, og listen over fejl med én åben](../assets/img/en/race-control-table.webp)

## Med egne ord {#in-plain-words}

- **Blokering**: du bremser så hårdt, at et hjul stopper med at dreje og glider. Bilen bremser dårligere og kan ikke styre.
- **Hjulspin**: du trykker speederen så hårdt i bund, at de drevne hjul snurrer hurtigere, end bilen kører. Du mister træk.
- **Overstyring**: bagenden af bilen glider ud til siden. Hvis den drejer hele vejen rundt, er det et **spin**.
- **Understyring**: forenden af bilen glider ud til siden ("skubber"). Det hjælper ikke at dreje rattet mere.
- **Træf** og **styrt**: bilen rørte ved noget. Et træf er et stød eller en ridse, og et styrt er et hårdt stød.
- **ABS** og **TC**: bilens egne hjælpere, som virker mod blokering og hjulspin. De er ikke fejl.

## Afsnittet Bilkontrol (det du ser) {#the-car-control-section-what-you-see}

For den valgte runde viser den, hvad runderne har, også uden hjulglidning og uden driftvinkel. Den viser stadig det, der kan findes, i stedet for ingenting (se nedenfor).

**Tabellen**: én række for hver slags, som mindst én af de to runder viser. Det er Låste hjul, Hjulspin, Bagende glider ud (overstyring og spin), Skubber ud, Styrt, Træf, ABS i brug, Sporkontrol i brug, Håndbremse og I luften. Hver celle viser "antal · sekunder" for den valgte runde og for den runde, den sammenlignes med. Og *Størst driftvinkel*, når der er en driftvinkel (den største på jorden).

**Listen**: dens ikke-delte fejl, der koster mindst 0,02 s, de dyreste først, højst 12. Hver med sin titel og pris (og mærket for sin slags). Klik på en for at læse dens tip, stil bilerne op 40 m før den og afspil den. **Også hvad begge runder gjorde der** tilføjer alle fejl, også de delte (mærket "begge gjorde det", pris "—" under 0,01 s). Hvis der ingen er: "Det X gjorde med dækkene, kostede ikke tid, men det Y ikke gjorde, kostede tid."

**Hintet under den** siger, hvad registreringen kunne bruge - "Ud fra hvert hjuls slip og slipvinkel, og bilens driftvinkel." (eller slip og slipvinkel, slip og driftvinkel, kun slip, eller "Kun ud fra bilens driftvinkel - disse runder har ikke hjulslip"). Det siger også, hvilket underlag grænserne blev målt for (asfalt, løst, blandet: over 80 % løse prøver er løst, under 20 % er asfalt), hvilken runde hændelserne blev lagt op mod, og hvordan prisen regnes.

Med **intet hjulslip og ingen driftvinkel** (en FH Companion-rundefil uden dens telemetri) vises tabellen og listen alligevel, og hintet siger, hvad der stadig kunne findes ud fra det, runderne indeholder: "Disse runder har ikke hjulslip og ingen driftvinkel, så låste hjul og hjulspin kan ikke bestemmes. Stadig fundet: skub, ud fra styringen mod banen; træf og styrt, ud fra fart og acceleration." - glid ud fra gyrehastigheden nævnes også, hvor runderne har den, og skub kun, hvor de har styring. Sætningen om grænserne for slip og drift udelades, og en anden hint siger: "Til Forza Horizon skal du også vælge `.tele.gz`-filen ved siden af hver FH Companion-runde: det er den fulde telemetri, hvert hjuls slip 64 gange i sekundet."

Runden samlede **pris** for kontrol (den bruges i opsummeringer) tæller overlappende fejl - en blokering og den glid, den starter, inden for 40 m - én gang, til den dyreste i klyngen.

## Sådan findes det {#how-it-is-detected}

Resten af siden er regelbogen: hver slags og hver grænse.

Kode: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Begrundelsen og litteraturen står i [metoden](race-analytics.md).

## Slagterne {#the-kinds}

| Slags | Tabelrække | En fejl? | Kortest der tæller |
|---|---|---|---|
| `lock` | Låste hjul | ja | 0,1 s |
| `wheelspin` | Hjulspin | ja | 0,15 s |
| `oversteer` | Bagende glider ud | ja | 0,2 s |
| `spin` | (talt med Bagende glider ud) | ja | 0,1 s |
| `understeer` | Skubber ud | ja | 0,25 s |
| `crash` | Styrt | ja | - |
| `hit` | Træf | ja | - |
| `abs` | ABS i brug | nej | 0,2 s |
| `tc` | Sporkontrol i brug | nej | 0,2 s |
| `handbrake` | Håndbremse | nej | 0,1 s |
| `airborne` | I luften | nej | 0,15 s |

Kortere forløb er støj (en kantsten, en bule, ét måleresultat). Forløb af gitterpunkter (hver 2 m), der består en test, sættes sammen over huller på op til 2 punkter. Kun **fejl** kan være mistag og får en pris. De andre er det, bilen og føreren gjorde.

## Det alle test kræver {#what-every-test-needs}

### Afledte kanaler {#derived-channels}

Før noget vurderes, får hver runde det, dens spil ikke sender, under kanoniske navne (et spils egen værdi vinder altid):

| Kanal | Fra |
|---|---|
| `bodySlip` (driftvinkel) | bilens hastighed i bilens eget koordinatsystem, `atan2(latVel, abs(longVel))`, hvor spillet sender den (0 under 3 m/s); ellers retningen (spillets gyring, tilpasset kørselsretningen efter fortegn og forskydning over prøver hurtigere end 10 m/s, og kun stolet på med en cirkulær varians under 0,05) mod kørselsretningen (positioner mindst 2 m fra hinanden), ved hastigheder over 3 m/s |
| `yawRate` | ændringen af `yaw` over tid, hvor der er en retning, men ingen rate |
| `airborne` | alle hjul uden jordkontakt (≤ 0,5); ellers alle hjul med en belastning under 5 % af deres median; ellers al ophængningsbevægelse på eller under 0,02 (helt udstrakt). En enkelt tilfældig prøve er ikke et flyv |
| `slipRatio.<W>` | `(hjulets overfladefart - bilens fart) / bilens fart` over 3 m/s, hvor spillet sender hjulenes overfladefart; eller ud fra hjulrotation × en rullende radius målt på runden - medianen af `fart / rotation` mens der rulles lige ud (fart > 10 m/s, gas < 0,3, bremse < 0,05, abs(længdeacceleration) < 3 m/s², ikke i luften; alle prøver over 10 m/s, når der er færre end 20), accepteret mellem 0,1 og 1 m. Markeret `physical` |
| `loose` | Forzas overfladerumle på mindst 2 hjul (> 0,001) i mindst 0,33 s (en kantsten er kortere), huller under 1 s overbygges |

### På jorden og stabil {#on-the-ground-and-settled}

Intet vurderes i luften eller i **0,3 s efter en landing** - ophængningen rammer bunden, og accelerationerne spiller op, og det er ikke greb, bremsning eller træk. En prøve skal også **være i bevægelse**: hurtigere end 5 m/s.

### Underlaget {#the-ground}

Hver prøves underlag er **løst**, hvor rundens `loose`-kanal siger det (Forzas overfladerumle, Trackmanias hjulmaterialer), ellers rundens overflade (se [disciplin og overflade](race-loading-laps.md#discipline-and-surface)): asfalt, eller løst for alt andet. Kurver, driftvaner og grænser holdes adskilt for asfalt og løst underlag.

### Slip, som et multiplum af dækkets nominelle top {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Spil skalerer slip forskelligt; `meta.slip` siger hvordan, og hvert slip divideres med en skala, så ca. 1 er dækkets nominelle top:

| `meta.slip` | Betydning | Divideret med |
|---|---|---|
| `peak` | normaliseret af spillet: efter 1 mistes greb (Forza Data Out) | 1 |
| `scaled` | fysisk slip divideret med en asfalttop (Kunos-optageren) | underlagets nominelle top over asfaltens |
| `index` | et 0..1 glidemål (Trackmanias SlipCoef) | 0,5 |
| `physical` (eller ukendt) | slipforhold som en brøkdel, slipvinkel i radianer | underlagets nominelle top |

Nominelle toppe, når intet bedre er kendt:

| Underlag | Slipforhold | Slipvinkel |
|---|---|---|
| asfalt | 0,12 | 8° |
| blandet | 0,18 | 12° |
| løst (grus) | 0,25 | 15° |
| sne | 0,25 | 15° |
| is | 0,10 | 6° |

### Hvor grebet stopper: hver bils dækkurver {#where-grip-ends-each-cars-tyre-curves}

Hvor et dæk ikke giver mere, måles **for hver bil** ud fra hver belastet runde med den (`measureTyres`), adskilt for asfalt og løst underlag:

| Kurve | Prøver (fart > 10 m/s, stabil, accelerationer under 45 m/s²) | Slip (x) | Kraft (y) |
|---|---|---|---|
| bremsning | bremse > 0,3, håndbremse ≤ 0,2, kører lige ud (sidekraft under 30 % af det hårdeste) | abs(gennemsnitligt slipforhold for de fire hjul) | nedbremsning |
| træk | gas > 0,8, bremse ≤ 0,05, lige ud, bilens fulde gastræk ved den fart > 0,5 m/s² | den største drevne hjuls slipforhold | acceleration som en andel af det træk |
| for | sidekraft over 30 % af det hårdeste, bilens greb ved den fart > 1 m/s² | den største forreste slipvinkel | sideacceleration som en andel af det greb |
| bag | det samme | den største bageste slipvinkel | det samme |

"Det hårdeste" er den 99. percentil af rundens abs(sideacceleration) på det underlag (alt underlag, når det har under 50 prøver). Drivlinjen bestemmer de drevne hjul (FWD: forhjulene, RWD: baghjulene, AWD: alle; ukendt: alle).

Fra mindst **150 prøver** deles slipet op i 6 til 14 lige store grupper (én pr. 40 prøver), hver gruppes kraft er dens øvre kvartil (det dækket gav, når føreren bad om det), udjævnet over nabogrupperne. Den **bedste** er gruppen med mest kraft; **grænsen** er den første gruppe efter den, hvor kraften er faldet med **8 %**. En kurve, der aldrig falder i dataene, har ingen grænse (uendelig) - at køre ud over "toppen" koster intet i det spil, og slip alene markerer intet der (Forza Horizons hjørne- og træk-kurver er sådan). Med for få prøver på ét underlag bruges det andet underlags; med for få samlet bruges den **nominelle** grænse: 1,5 gange den nominelle top.

Hver bil får også:

- sin **driftvane**: den øvre kvartil af dens driftvinkel, overalt hvor den tager en sving ved 60 % af sit hårdeste eller mere (kræver 100 prøver);
- sin **styring pr. krumning** (`steerGain`), pr. 5 m/s fartbånd: medianen af abs(styr) / banens krumning, mens den tager en sving fast men godt inden for sit greb (30-60 % af sit hårdeste, krumning strammere end en 400 m radius, styr over 0,02; 25 prøver pr. bånd). Banens krumning er gyringen over fart, hvor spillet sender en gyrerate, ellers ud fra positionerne ±5 m.

## Måling, slags for slags {#detection-kind-by-kind}

| Slags | Test (på prøver i bevægelse og stabile) | `peak` og `limit` |
|---|---|---|
| **lock** | bremse > 0,05, håndbremse ikke over 0,2, og et hjuls slipforhold under minus bremsegrænsen | det mest negative slip (multipla af nominel top); grænsen som negativ |
| **wheelspin** | gas > 0,2 (eller ingen gaskanal), og et drevet hjuls slipforhold over trækgrænsen | det største drevne slip; grænsen |
| **oversteer** (driftvinkel) | driftvinklen over det største af underlagets gulv og 1,5 × bilens driftvane der | den største driftvinkel, radianer |
| **oversteer** (slipvinkler, ingen driftvinkel) | den største bageste slipvinkel over den bageste grænse og mere end 0,25 over den største forreste | den bageste slipvinkel (multipla af top) |
| **oversteer** (ingen driftvinkel, men gyrerate og sideacceleration) | "holdningshastigheden" - abs(gyrerate) minus abs(sideacceleration) / fart, over 8 m/s - over 0,2 rad/s, med styringen mod sving | rad/s; grænse 0,2 |
| **spin** | en overstyring-forløb, hvis driftvinkel toppede over **60°** | som overstyring |
| **understeer** (slipvinkler) | ikke glidende, den største forreste slipvinkel over den forreste grænse og mere end 0,3 over den bageste | den forreste slipvinkel; grænsen |
| **understeer** (ingen slipvinkler) | hurtigere end 12 m/s, ikke glidende, ikke modstyring, sideacceleration over halvdelen af rundens hårdeste (99. percentil), banen strammere end en 300 m radius, og styring mere end **1,6 gange** det, bilens egen styring pr. krumning siger banen krævede | gange den nødvendige styring; grænse 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` over 0,5 | - |
| **handbrake** | `handbrake` over 0,2 | - |
| **airborne** | `airborne` over 0,5 | - |
| **hit**, **crash** | se [Træf og styrt](#hits-and-crashes) | den fart stødet tog |

Driftvinkel-gulve pr. underlag: asfalt **7°**, blandet **10°**, løst og sne **15°**, is **10°**. En bil, der glider mere som en selvfølge - en arkademodel for dæk, en grussspecialist - har sin egen, højere grænse ud fra sine egne runder (1,5 × dens vane).

**Hvilken vej bilen drejer** (til "mod svinget"): ændringen i rundens egen bane over ±6 m (mindst 2 gitterpunkter); strammere end en 600 m radius tæller som sving; højre eller venstre efter om verden er spejlvendt. Styringen er **mod** svinget, når abs(styr) > 0,05, og fortegnet er modsat svinget - en glidning der bliver **fanget** med modsat rat.

**Pedalerne, som de var i starten** (`pedal`): *bremsning*, når bremsen er over 0,1; *gas* over 0,3; *slip* når gassen var over 0,5 inden for de 8 gitterpunkter (16 m) før; *rullende* ellers (eller uden gaskanal).

## Lagt op mod den anden runde {#laid-against-the-other-lap}

Hver hændelse vurderes mod den runde, den valgte runde sammenlignes med i det segment (den bedste i sin klasse; for selve runden, hvem der i sin klasse var hurtigst igennem segmentet):

1. **Hvor langt den anden runde kom** over de samme meter, ±8 m: den anden rundes egne hændelser af samme familie (et spin tæller som overstyring, et styrt som et træf) målt i de samme enheder, uden grænser, med den anden bils dækkurver.
2. **Delt**, når den anden runde kom **80 %** så langt eller længere: så køres hjørnet sådan, det er ikke en fejl. Ikke-fejl-slags er altid "delt".
3. **Pris**, for en ikke-delt fejl: den tid denne runde tabte mod den anden fra 5 m før hændelsen til **40 m efter** den (for et træf eller et styrt, indtil bilen har fået sin fart tilbage - de meter der skal til at få den igen med sit eget træk, 40 til 400 m; uden målt træk, 5 m/s²). Aldrig negativ.
4. **Fart givet væk** til bilens grænse: for en blokering den nedbremsning, bilen viser, den kan klare ved den fart, minus det den gjorde, lagt sammen over hændelsen; for hjulspin dets fulde gastræk minus det den gjorde; for et stød den fart, stødet tog. Angives, når over 0,5 m/s (1,8 km/t).

En fejl, der ikke er delt og koster mindst **0,02 s**, står på listen ([banestatistikken](race-course-statistics.md) tæller kun fejl på **0,03 s** eller mere, så en fejl, der tælles over mange runder, er en klar), og den kan blive årsagen til et hjørnes tab (se [Hjørne for hjørne](race-corner-analysis.md#car-control-faults-and-impacts)).

## Træf og styrt {#hits-and-crashes}

`impacts.ts` læser træf fra rundens **egne prøver**, før de resamples - et træf er overstået på hundredele af et sekund. Dæk kan ikke give kræfterne i et træf, så et træf måles mod rundens egen bil:

- **Dens greb `G`**: den 99. percentil af dens vandrette acceleration `√(lat² + long²)` over runden, på jorden og hurtigere end 5 m/s. Uden accelerationskanaler (eller under 3 m/s²) er det 15 m/s² - en vejbils greb.
- **Grænse**: `max(1.8 G, G + 18, 30)` m/s².
- **Ramt prøve**: den vandrette acceleration over grænsen *og* springer mere end halvdelen af `G` fra den forrige prøve; **eller** farten falder, inden for 0,1 s, med mere end grænsen ville tage på 0,1 s plus 1,5 m/s. Kun på jorden og stabil, og kun når bilen var hurtigere end 5 m/s.
- Ramte prøver inden for **0,4 s** er ét træf.
- **Før / efter**: den højeste fart i de 0,15 s før; den laveste indtil 0,3 s efter den sidste ramte prøve.
- **Ikke et træf**: fart væk uden kraft bag den - den største vandrette acceleration inden for 0,1 s under det største af `G` og 25 m/s² - er spillet, der spoler tilbage eller nulstiller bilen.
- **Styrt**, når det tog **30 km/t** eller mere, eller tog bilen under halvdelen af sin fart; ellers **træf** - et stød, en ridse langs en mur.
- **Retning**: den længdeacceleration er større end den sidelæggende og negativ: *frontal*; positiv: *bagfra*; den sidelæggende er størst: *langs siden*. Uden accelerationer: frontal.

Det en bil kan, måles med alle træf udeladt, fra 0,1 s før det til 1 s efter (`struckMask`).

## Teksterne {#the-texts}

Hver hændelse siges og navngiver begge runder, med hvor (meter langs referencen), farten den startede med, hvor langt over grænsen mod den anden runde, og et tip. Tippet følger af slagen og det, der blev målt:

| Hændelse | Tip |
|---|---|
| lock, kun forhjul | et låst forhjul kan ikke styre: mindre tryk øverst i zonen, slip lidt af ind i svinget |
| lock, kun baghjul | et låst baghjul lader bilen rotere: brems mere i en lige linje, slip op for at dreje ind; flyt fordelingen fremad, hvis det bliver ved |
| lock, løst underlag | et låst hjul pløjer: pres lige til før det låser |
| lock, ellers | for meget pedal til grebet: pres mere gradvist |
| wheelspin | giv gas, når rattet retter sig ud, skift tidligt op, hvor trækket er begrænset (på løst underlag: et højere gear blødgør momentet) |
| spin / overstyring | efter pedalen: under bremsning (for hård trailbremsning, et for tidligt nedgear), med gas sluppet (slip-overstyring: hold en jævn gas), på speederen (for meget, mens den stadig er drejet), ingen af delene (drejet ind for hurtigt); "fanget med modsat rat", når der blev modstyret; på løst underlag eller i et rally: "en vinkel er den hurtige vej rundt - den anden runde klarede sig med nok" |
| understyring | mere rat hjælper ikke, når forenden er gået: kom langsommere ind, træk lidt bremse for at belaste forenden, ret ud; på løst underlag, drej bilen med en slip-gas eller et let tryk med venstre fod |
| træf / styrt | langs siden: en meter margin koster mindre end ridsen; bagfra: en anden bil eller at glide baglæns; et frontalt styrt: brems tidligere; et stød foran: ramte noget let. "X ramte der også." når delt |

I Trackmania siger en glidning også: under cirka **400 km/t** (**300** på løst underlag: jord, græs, plastik) giver en glidning mindre drev end at holde grebet; over det giver en fartglidning i den rigtige vinkel gevinst, og denne kostede tid, så dens vinkel var forkert.

## Hvad hver kilde tillader {#what-each-source-allows}

| Runderne indeholder | Blokeringer / hjulspin | Overstyring / spin | Understyring |
|---|---|---|---|
| slipforhold og slipvinkel pr. hjul, bilens hastighed (Forza Data Out, AC-spillene) | ud fra slip | ud fra driftvinkel, eller bageste slipvinkel | ud fra slipvinkler |
| hjulhastigheder, hastighed i verden (rallyspil, BeamNG) | ud fra afledt slip | ud fra afledt driftvinkel | ud fra styring pr. krumning |
| gyring og gyrerate, intet slip (iRacing) | - | ud fra driftvinklen (den tilpassede gyring mod kørselsretningen); ud fra holdningshastigheden med modstyring kun, når gyringen ikke kan stoles på | ud fra styring pr. krumning |
| kun retning | - | ud fra retning mod kørsel | ud fra styring pr. krumning |
| FH Companion-rundefil alene (ingen gyring, intet slip) | - | - | ud fra styring pr. krumning (den har styring og accelerationer) |

Træf og styrt kræver kun fart (bedre med accelerationer), så alle kilder har dem. Afsnittet **Bilkontrol** viser, hvad hver kilde tillader: med en FH Companion-rundefil alene dens skub ud fra styringen og dens træf, og hintet om at indlæse `.tele.gz` for resten.
