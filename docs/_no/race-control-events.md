---
title: "Hendelser for bilkontroll"
parent: "Løpsanalyse"
nav_order: 54
lang: "no"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Bilkontrollhendelser

Viseren ser hvordan hver runde ble kjørt, og markerer hvor føreren fikk bilen til å slure, spinne, treffe noe eller miste grep. Dette er nyttig, for en feil som kostet tid er det raskeste å rette.

![The Car control section: how often each lap locked a wheel, spun or pushed wide, and the list of faults with one opened](../assets/img/en/race-control-table.webp)

## Med enkle ord {#in-plain-words}

- **Låsing**: du bremser så hardt at et hjul slutter å snurre og sklir. Bilen stopper dårligere og kan ikke styres.
- **Hjulspinn**: du trykker gassen så hardt at drivhjulene spinner fortere enn bilen beveger seg. Du mister trekkraft.
- **Overstyring**: bakenden av bilen sklir langt ut. Hvis den går hele veien rundt, er det en **spinn**.
- **Understyring**: fronten av bilen sklir langt ut ("skyver utover"); å vri rattet mer hjelper ikke.
- **Treff** og **krasj**: bilen traff noe (et treff er et dunk eller en skramme, et krasj er et hardt).
- **ABS** og **TC**: bilens egne hjelpere som virker mot låsing og hjulspinn. De er ikke feil.

## Bilkontroll-delen (det du ser) {#the-car-control-section-what-you-see}

For den valgte runden viser den det som fortsatt kan finnes, selv om rundene ikke har dekkglidning eller driftvinkel. Uten dem er det ingenting å se, så den viser i stedet det som kan finnes (under).

**Tabellen**: én rad for hver type som en av rundene viser – Låste hjul, Hjulspinn, Bakenden slipper (overstyring og spinn), Skyver utover, Krasj, Treff, ABS griper inn, Antispinn griper inn, Håndbrekk, I luften. Hver celle viser "antall · sekunder", for den valgte runden og for runden den sammenlignes med. Og *Størst driftvinkel* vises når det finnes en driftvinkel (den største på bakken).

**Listen**: de feilene i runden som ikke deles med den andre og som koster minst 0,02 s, dyreste først, høyst 12. Hver har tittel og kostnad (og brikken for sin type). Klikk på en for å lese tipset, still bilene på linje 40 m før den, og spill den av. **Også det begge rundene gjorde** legger til hver feil, også de delte (brikken "begge gjorde det", kostnaden "—" under 0,01 s). Uten noen feil står det: "Ingenting X gjorde med dekkene kostet tid som Y ikke også gjorde."

**Hintet under den** sier hva deteksjonen kunne se med. Det kan være "Fra hvert hjuls glidning og glidevinkel, og bilens driftvinkel." (eller glidning og glidevinkel, glidning og driftvinkel, bare glidning, eller "Bare fra bilens driftvinkel – disse rundene har ingen dekkglidning.") Hintet sier også hvilket underlag grensene er målt for (asfalt, løst, blandet: over 80 % løse prøver er løst, under 20 % er asfalt), hvilken runde hendelsene er lagt mot, og hvordan kostnaden regnes.

Med **ingen dekkglidning og ingen driftvinkel** (en FH Companion-rundefil uten telemetrien) vises tabellen og listen likevel. Hintet sier da hva som fortsatt kan finnes av det rundene har: "Disse rundene har ingen dekkglidning og ingen driftvinkel, så låsing og hjulspinn kan ikke avgjøres. Likevel funnet: skyving, fra styringen mot banen; treff og krasj, fra farten og akselerasjonen." Glidning fra giringshastigheten nevnes også der rundene har den, og skyving bare der de har styring. Setningen om glidnings- og driftgrensene utelates. Et andre hint sier: "For Forza Horizon, velg også `.tele.gz`-filen ved siden av hver FH Companion-runde: det er den fulle telemetrien, hvert hjuls glidning 64 ganger i sekundet."

Rundens **samlede** kontrollkostnad (brukes i sammendrag) teller overlappende feil én gang, den dyreste i klyngen. Det gjelder en låsing og glidningen den starter, innen 40 m.

## Slik oppdages det {#how-it-is-detected}

Resten av denne siden er regelboken: hver type og hver terskel.

Kode: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Begrunnelsen og litteraturen står i [metoden](race-analytics.md).

## Typene {#the-kinds}

| Type | Tabellrad | Er en feil? | Kortest som teller |
|---|---|---|---|
| `lock` | Låste hjul | ja | 0,1 s |
| `wheelspin` | Hjulspinn | ja | 0,15 s |
| `oversteer` | Bakenden slipper | ja | 0,2 s |
| `spin` | (telles med Bakenden slipper) | ja | 0,1 s |
| `understeer` | Skyver utover | ja | 0,25 s |
| `crash` | Krasj | ja | - |
| `hit` | Treff | ja | - |
| `abs` | ABS griper inn | nei | 0,2 s |
| `tc` | Antispinn griper inn | nei | 0,2 s |
| `handbrake` | Håndbrekk | nei | 0,1 s |
| `airborne` | I luften | nei | 0,15 s |

Korte løp er støy (en kantstein, en ujevnhet, ett enkelt punkt). Løp av rutepunkter (hver 2 m) som passerer en test, slås sammen over hull på opptil 2 punkter. Bare **feil** kan være tabber og få en kostnad. De andre er det bilen og føreren gjorde.

## Det alle testene trenger {#what-every-test-needs}

### Avledede kanaler {#derived-channels}

Før noe bedømmes, får hver runde det spillet ikke sender, under kanoniske navn (et spills egen verdi vinner alltid):

| Kanal | Fra |
|---|---|
| `bodySlip` (driftvinkel) | bilens hastighet i bilens eget system, `atan2(latVel, abs(longVel))`, der spillet sender den (0 under 3 m/s). Ellers retningen (spillets giring, tilpasset kjøreretningen etter fortegn og forskyvning over prøver raskere enn 10 m/s, og bare med en sirkulær varians under 0,05) mot kjøreretningen (posisjoner minst 2 m fra hverandre), ved fart over 3 m/s |
| `yawRate` | endringen av `yaw` over tid, der det finnes en retning men ingen rate |
| `airborne` | alle hjul uten bakkekontakt (≤ 0,5); ellers alle hjul med last under 5 % av medianen; ellers all fjæringsbevegelse på eller under 0,02 (helt utstrakt). En enkelt tilfeldig prøve er ikke en flyvning |
| `slipRatio.<W>` | `(hjulets overflatefart - bilens fart) / bilens fart` over 3 m/s, der spillet sender hjulenes overflatefart. Ellers fra hjulrotasjon × en rullende radius målt på runden: medianen av `fart / rotasjon` mens bilen ruller rett fram (fart over 10 m/s, gass under 0,3, brems under 0,05, abs(lengdeakselerasjon) under 3 m/s², ikke i luften; hver prøve over 10 m/s når det er færre enn 20). Godtatt mellom 0,1 og 1 m. Merket `physical` |
| `loose` | Forzas overflaterumling på minst 2 hjul (> 0,001) i minst 0,33 s (en kantstein er kortere). Hull under 1 s bygges over |

### På bakken og stabil {#on-the-ground-and-settled}

Ingenting bedømmes i luften, eller i **0,3 s etter en landing**. Fjæringen treffer bunnen og akselerasjonene spiker, og det er ikke grep, bremsing eller drift. En prøve må også være **i bevegelse**: raskere enn 5 m/s.

### Underlaget {#the-ground}

Hver prøves underlag er **løst** der rundens `loose`-kanal sier det (Forzas overflaterumling, Trackmanias hjulmaterialer). Ellers er det rundens underlag (se [disiplin og underlag](race-loading-laps.md#discipline-and-surface)): asfalt, eller løst for alt annet. Kurver, driftvaner og terskler holdes adskilt for asfalt og løst underlag.

### Glidning, som et multiplum av dekkets nominelle topp {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Spill skalerer glidning ulikt. `meta.slip` sier hvordan, og hver glidning deles på en skala slik at omtrent 1 er dekkets nominelle topp:

| `meta.slip` | Betydning | Deles på |
|---|---|---|
| `peak` | normalisert av spillet: forbi 1 er grepet tapt (Forza Data Out) | 1 |
| `scaled` | fysisk glidning delt på en asfalttopp (Kunos-opptakeren) | underlagets nominelle topp delt på asfalttoppen |
| `index` | et glidemål fra 0 til 1 (Trackmanias SlipCoef) | 0,5 |
| `physical` (eller ukjent) | glidningsforhold som brøkdel, glidevinkel i radianer | underlagets nominelle topp |

Nominelle topper, når ingenting bedre er kjent:

| Underlag | Glidningsforhold | Glidevinkel |
|---|---|---|
| asfalt | 0,12 | 8° |
| blandet | 0,18 | 12° |
| løst (grus) | 0,25 | 15° |
| snø | 0,25 | 15° |
| is | 0,10 | 6° |

### Der grepet slutter: hver bils dekkkurver {#where-grip-ends-each-cars-tyre-curves}

Der et dekk slutter å gi mer, måles **per bil**, fra hver belastede runde med den (`measureTyres`). Det måles separat for asfalt og løst underlag:

| Kurve | Prøver (fart over 10 m/s, stabil, akselerasjoner under 45 m/s²) | Glidning (x) | Kraft (y) |
|---|---|---|---|
| bremsing | brems over 0,3, håndbrekk ≤ 0,2, kjører rett (sideveis under 30 % av det hardeste) | abs(gjennomsnittlig glidningsforhold for de fire hjulene) | retardasjon |
| trekk | gass over 0,8, brems ≤ 0,05, rett, bilens fulle gasstrekk ved den farten over 0,5 m/s² | det største drevne hjulets glidningsforhold | akselerasjon som en andel av det trekket |
| front | sideveis over 30 % av det hardeste, bilens grep ved den farten over 1 m/s² | den største glidevinkelen foran | sideakselerasjon som en andel av det grepet |
| bak | det samme | den største glidevinkelen bak | det samme |

"Det hardeste" er den 99. persentilen av rundens abs(sideakselerasjon) på det underlaget. Alt underlag brukes når det har færre enn 50 prøver. Drivlinjen avgjør hvilke hjul som drives (FWD: forhjulene, RWD: bakhjulene, AWD: alle; ukjent: alle).

Fra minst **150 prøver** deles glidningen i 6 til 14 like store grupper (én per 40 prøver). Hver gruppes kraft er dens øvre kvartil, altså det dekket ga når føreren ba om det, jevnet ut over nabogruppene. **Beste** er gruppen med mest kraft. **Grensen** er den første gruppen forbi den der kraften har falt **8 %**. En kurve som aldri faller i dataene, har ingen grense (uendelig). Å kjøre forbi "toppen" koster ingenting i det spillet, og glidning alene markerer ingenting der. Forza Horizons kurver for sving og trekk er slik. Med for få prøver på ett underlag brukes det andre underlagets prøver. Med for få totalt brukes den **nominelle** grensen: 1,5 ganger den nominelle toppen.

Hver bil får også:

- sin **driftvane**: den øvre kvartilen av driftvinkelen der den svinger med 60 % av det hardeste eller mer (krever 100 prøver);
- sin **styring per krumning** (`steerGain`), per fartsbånd på 5 m/s: medianen av abs(styring) / banekrumning mens den svinger fast, men godt innenfor sitt grep (30–60 % av det hardeste, krumning strammere enn 400 m radius, styring over 0,02; 25 prøver per bånd). Banens krumning er giringshastigheten delt på farten der spillet sender en giringshastighet. Ellers er den fra posisjonene ±5 m.

## Detektering, type for type {#detection-kind-by-kind}

| Type | Test (på bevegelige, stabile prøver) | `peak` og `limit` |
|---|---|---|
| **lock** | brems over 0,05, håndbrekk ikke over 0,2, og et hjuls glidningsforhold under minus bremsegrensen | den mest negative glidningen (multiplum av nominell topp); grensen som negativ |
| **wheelspin** | gass over 0,2 (eller ingen gasskanal), og et drevet hjuls glidningsforhold over trekkgrensen | den største drevne glidningen; grensen |
| **oversteer** (driftvinkel) | driftvinkelen over det største av underlagets gulv og 1,5 × bilens driftvane der | den største driftvinkelen, i radianer |
| **oversteer** (glidevinkler, ingen driftvinkel) | den største bakre glidevinkelen over bakgrensen og mer enn 0,25 over den største fremre | den bakre glidevinkelen (multiplum av topp); grensen |
| **oversteer** (ingen driftvinkel, men giringshastighet og sideakselerasjon) | "holdningsfarten" – abs(giringshastighet) minus abs(sideakselerasjon) / fart, over 8 m/s – over 0,2 rad/s, med styringen mot svingen | rad/s; grense 0,2 |
| **spin** | en overstyringsrunde der driftvinkelen toppet seg over **60°** | som overstyring |
| **understeer** (glidevinkler) | ikke i glidning, den største fremre glidevinkelen over fremgrensen og mer enn 0,3 over den bakre | den fremre glidevinkelen; grensen |
| **understeer** (ingen glidevinkler) | raskere enn 12 m/s, ikke i glidning, ikke motstyring, sideakselerasjon over halvparten av rundens hardeste (99. persentil), banen strammere enn 300 m radius, og styring mer enn **1,6 ganger** det bilens egen styring per krumning sier at banen krevde | ganger den nødvendige styringen; grense 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` over 0,5 | - |
| **handbrake** | `handbrake` over 0,2 | - |
| **airborne** | `airborne` over 0,5 | - |
| **hit**, **crash** | se [Treff og krasj](#hits-and-crashes) | farten støtet tok |

Driftvinkelgulvene per underlag: asfalt **7°**, blandet **10°**, løst og snø **15°**, is **10°**. En bil som kjører mer som en selvfølge – en arkademodell for dekk, en grusspesialist – får en egen, høyere terskel fra sine egne runder (1,5 × driftvanen).

**Hvilken vei bilen svinger** (for "mot svingen"): endringen i rundens egen bane i retning over ±6 m (minst 2 rutepunkter). Strammere enn 600 m radius teller som sving. Høyre eller venstre avgjøres av om verden er speilvendt. Styringen er **mot** svingen når abs(styring) er over 0,05 og fortegnet er motsatt av svingen. Det er en glidning som blir **fanget** med motstyring.

**Pedalene når det startet** (`pedal`): *brems* når bremsen er over 0,1. *Gass* over 0,3. *Sluppet* når gassen var over 0,5 innen de 8 rutepunktene (16 m) før. *Rulling* ellers (eller uten gasskanal).

## Lagt mot den andre runden {#laid-against-the-other-lap}

Hver hendelse bedømmes mot runden den fokuserte runden sammenlignes med i det segmentet. Det er den raskeste i klassen. For den runden selv er det den raskeste av klassen gjennom segmentet:

1. **Hvor langt den andre runden gikk** over de samme meterne, ±8 m: den andre rundens egne hendelser i samme familie (en spinn regnes som overstyring, et krasj som et treff), målt i samme enheter, uten terskler og med den andre bilens dekkkurver.
2. **Delt** når den andre runden gikk **80 %** så langt eller lenger. Da er det slik hjørnet kjøres, ikke en tabbe. Ikke-feiltyper er alltid "delt".
3. **Kostnad**, for en ikke-delt feil: tiden denne runden tapte mot den andre fra 5 m før hendelsen til **40 m etter** den. For et treff eller et krasj gjelder det til bilen har fått farten tilbake: metrene den bruker på å hente den igjen med sitt eget trekk, 40 til 400 m. Uten målt trekk brukes 5 m/s². Aldri negativ.
4. **Fart gitt bort** til bilens grense: for en låsing er det retardasjonen bilen viser den kan klare ved den farten minus det den gjorde, summert over hendelsen. For hjulspinn er det det fulle gasstrekket minus det den gjorde. For et støt er det farten støtet tok. Det vises når det er over 0,5 m/s (1,8 km/t).

En ikke-delt feil som koster minst **0,02 s**, blir listet. [Banestatistikken](race-course-statistics.md) teller bare feil på **0,03 s** eller mer, slik at en tabbe som telles over mange runder er en klar en. Feilen kan bli årsaken til at et hjørne taper tid (se [hjørne for hjørne](race-corner-analysis.md#car-control-faults-and-impacts)).

## Treff og krasj {#hits-and-crashes}

`impacts.ts` leser treff fra rundens **egne prøver**, før de resamples. Et treff er over på hundredeler av et sekund. Dekk kan ikke lage kreftene i et treff, så et treff måles mot rundens egen bil:

- **Dens grep `G`**: den 99. persentilen av dens horisontale akselerasjon `√(lat² + long²)` over runden, på bakken og raskere enn 5 m/s. Uten akselerasjonskanaler (eller under 3 m/s²) brukes 15 m/s², grepet til en vanlig veibil.
- **Terskel**: `max(1,8 G, G + 18, 30)` m/s².
- **Treffprøve**: den horisontale akselerasjonen over terskelen *og* som hopper mer enn halvparten av `G` fra forrige prøve; **eller** farten som faller, innen 0,1 s, med mer enn terskelen ville tatt på 0,1 s pluss 1,5 m/s. Bare på bakken og stabil, og bare når bilen var raskere enn 5 m/s.
- Treffprøver innen **0,4 s** er ett treff.
- **Før / etter**: den høyeste farten i de 0,15 s før; den laveste til 0,3 s etter den siste treffprøven.
- **Ikke et treff**: fart tapt uten kraft bak den – den største horisontale akselerasjonen innen 0,1 s under det største av `G` og 25 m/s² – er spillet som spoler tilbake eller nullstiller bilen.
- **Krasj** når det tok **30 km/t** eller mer, eller når bilen mistet under halvparten av farten sin. **Treff** ellers, altså et dunk eller en skramme langs en vegg.
- **Retning**: lengdeakselerasjonen større enn den sideveis, og negativ: *rett forfra*. Positiv: *bakfra*. Sideveis større: *langs siden*. Uten akselerasjoner: rett forfra.

Hva en bil kan gjøre måles med alle treff tatt ut, fra 0,1 s før til 1 s etter (`struckMask`).

## Tekstene {#the-texts}

Hver hendelse fortelles med begge rundene nevnt, med hvor (meter langs referansen), farten den startet med, hvor langt over grensen mot den andre runden, og et tips. Tipset følger av typen og det som ble målt:

| Hendelse | Tips |
|---|---|
| låsing, bare forhjul | et låst forhjul kan ikke styre: mindre trykk øverst i sonen, slipp det av inn i svingen |
| låsing, bare bakhjul | et låst bakhjul lar bilen rotere: brems mer i rett linje, slipp av idet du svinger inn; flytt fordelingen fremover hvis det skjer stadig |
| låsing, løst underlag | et låst hjul pløyer videre: klem til like før låsing |
| låsing ellers | for mye pedal for grepet: klem mer gradvis |
| hjulspinn | gi gass i takt med at rattet rettes ut, gir opp tidlig der trekkraften setter grensen (på løst underlag: et høyere gir demper dreiemomentet) |
| spinn / overstyring | etter pedalen: under bremsing (for hard trail-brems, en for tidlig nedgiring), sluppet (løft-overstyring: hold jevn gass), på gassen (for mye mens rattet fortsatt er vridd), ingen av disse (svingt inn for fort). "fanget med motstyring" når det ble motstyrt; på løst underlag eller i rally: "en viss vinkel er den raske veien rundt – den andre rundens var nok" |
| understyring | mer ratt hjelper ikke når fronten har gått: kom inn saktere, hold litt brems inn i svingen for å laste fronten, rett ut rattet; på løst underlag: sving bilen med et gasslipp eller et lett trykk med venstre fot |
| treff / krasj | langs siden: en meter margin koster mindre enn skrapet; bakfra: en annen bil eller at bilen sklir baklengs; et krasj rett forfra: brems tidligere; et dunk foran: traff noe. "X traff der også." når det deles |

I Trackmania sier en glidning også: under omtrent **400 km/t** (**300** på løst underlag: grus, gress, plast) gir en glidning mindre drivkraft enn å kjøre på grep. Over det gir en speedslide i riktig vinkel fart, men denne kostet tid, så vinkelen var feil.

## Hva hver kilde tillater {#what-each-source-allows}

| Rundene har | Låsing / hjulspinn | Overstyring / spinn | Understyring |
|---|---|---|---|
| glidning per hjul og glidevinkel, bilens hastighet (Forza Data Out, AC-spillene) | fra glidning | fra driftvinkel, eller bakre glidevinkel | fra glidevinkler |
| hjulfarter, verdenshastighet (rallyspill, BeamNG) | fra avledet glidning | fra avledet driftvinkel | fra styring per krumning |
| giring og giringshastighet, ingen glidning (iRacing) | - | fra driftvinkelen (den tilpassede giringen mot kjøreretningen); fra holdningsfarten med motstyring bare når giringen ikke kan stoles på | fra styring per krumning |
| bare retning | - | fra retning mot kjøring | fra styring per krumning |
| FH Companion-rundefil alene (ingen giring, ingen glidning) | - | - | fra styring per krumning (den har styring og akselerasjoner) |

Treff og krasj trenger bare fart (bedre med akselerasjoner), så alle kilder har dem. **Bilkontroll**-delen viser hva hver kilde tillater. Med en FH Companion-rundefil alene får du skyvingene fra styringen og treffene, og hintet om å laste `.tele.gz` for resten.
