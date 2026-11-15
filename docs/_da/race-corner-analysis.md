---
title: "Analyse sving for sving"
parent: "Løbsanalyse"
nav_order: 55
lang: "da"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analyse sving for sving

To omgange på samme bane sammenlignes sving for sving. For hvert sving siger viewer'en, hvem der var hurtigst, hvor meget tid det var værd, og hvorfor – bremset for tidligt, kom på gassen sent, tog en bredere linje – så du ved, hvad du skal øve først.

![En pointe åbnet under Hvor du kan forbedre dig, ved siden af tabellen Sving for sving](../assets/img/en/race-corner-finding.webp)

Et gennemregnet eksempel: i sving 3 bremser Driver A 20 m tidligere end Driver B og taber 0,15 s på vejen dertil, men er på gassen tidligere og vinder 0,15 s på vejen ud. Netto 0,00 s: svinget er lige, og ingen får besked om at bremse senere.

## Det du ser {#what-you-see}

### Hvor du kan forbedre dig {#where-to-improve}

Sidepanelets sektion for den valgte omgang ("Indlæs mindst to omgange på samme bane." indtil da).

**Hovedet:** "<omgang> <tid> mod <reference> <tid>" og forskellen i omgangstid – eller, for referencen, "mod den hurtigste anden omgang gennem hvert sving (…)" og det samlede tab. Ved siden af er tabet delt i *kørsel* og *bil / kontekst*.

**Fordelingsbaren:** den tid, der er tabt pr. årsagsgruppe (bremsning, indgang, udgang, langside, bil, kontekst), i årsagsfarverne, med en forklaring.

**Pointerne**, tre lister:

1. Førertab, dyreste først, højst **12** – eller "Intet sted, hvor en anderledes kørsel ville vinde tid, springer i øjnene."
2. **Vis hvad bilen eller situationen kostede (X s)** – tab på bil og kontekst, højst 8 (slået til som standard).
3. **Hvor <omgang> er hurtigere, eller lige på en anden måde (N)** – gevinster og lige sving, højst 10 (slået til som standard).

Hver pointe viser sin rangering, titel (svinget og hvad der skete, med omkostningen for et tab), dommslinjen, omkostningen (gevinster med minus) med en bjælke, og en brik: *bremsning*, *indgang*, *udgang*, *langside* (førertab, med "· bil X", når bilen forklarer 0,02 s eller mere), *bil*, *kontekst*, *hurtigere*, *lige*. **Klik på én** for at stille bilerne op 40 m før den, ramme den og afspille den, og åbne dens målinger:

- **Bremsning:** hvor hver bremsede (eller løftede) og fra hvilken fart, og hvor mange meter tidligere eller senere (fra 5 m);
- **Langsomst:** hver omgangs mindstefart og hvor;
- **Fuld gas:** hvor hver var flad, og hvor meget tidligere eller senere;
- **Linje:** forskel i indgangspunktet, snævreste radier, hvor langt inde eller ude, og hver omgangs linjeform og apex;
- **Langside til næste sving:** dens længde, begge farter der hvor begge var flade, hvad den tabte eller vandt og af hvad – startfarten, den andens stærkere træk, en løftning, fart der blev skrabet af, og hvordan den blev kørt (dele fra 0,02 s);
- **Bilen:** hvor stor en del af tabet der er bilen, og af hvad (træk, greb, bremser; når 0,02 s eller mere);

derefter tippet, **Bilerne:** (i forskellige biler, se [Bilprofiler](race-car-profiles.md#what-the-cars-decide-in-a-corner)), og linjerådet.

### Sving for sving {#corner-by-corner}

En tabel (med to eller flere omgange), én række pr. strækning, for den valgte omgangs klasse, når der er flere klasser:

| Kolonne | Viser |
|---|---|
| Sving | `T3`, `T11-T12` |
| Hurtigst | den omgang, der var hurtigst igennem den (dens egen tid fra strækningens start til slut) |
| med | dens forsprog til den næst hurtigste, s |
| linje | den hurtigste omgangs form og apex ("V · sen", "U/V · midt"); hold musen over for dens snævreste, indgangs- og udgangsradier; "begge veje" for et blandet kompleks |
| (den valgte omgang) | hvor langt bagud den var fra den hurtigste, eller ✓ når den var den hurtigste |

Et klik på en række åbner den valgte omgangs pointe dér (eller stiller bilerne op 40 m før strækningen). Under tabellen, når hvert sving har en tid: "Den hurtigste gennem hvert sving, sat sammen: <tid> (± på referencen / på den bedste i klasse X)" – de bedste strækninger plus den hurtigste kørsel til første sving, når den er en strækning for sig.

## Sådan regnes det ud {#how-it-is-worked-out}

Hovedreglen: **et sving bedømmes som en helhed**, fra bremsezonen for det til bremsezonen for det næste. En omgang, der bremser tidligere for at få bilen drejet og på gas hurtigere, får krediteret den udgang, den købte, og bliver ikke bedt om at bremse senere.

## Én distanceakse {#one-distance-axis}

Omgange sammenlignes efter distance, ikke tid – et sekund bagud er to omgange ved forskellige sving. Heller ikke efter hver omgangs egen kilometerteller (en snævrere linje dækker færre meter). Referencens **kørte vej** er aksen:

- Hver anden omgangs samples **projiceres** på referencevejen: hver sample får `s`, hvor langt langs referencen den er, og `d`, hvor langt til venstre (positiv) eller højre den er. Søgningen går fremad fra det foregående match (8 vejstykker tilbage til 40 frem), så en omgang, der krydser over eller under sig selv, aldrig snapper til det andet krydsningspunkt. Den første sample søges i det første kvarter af vejen (på en bane falder start og mål sammen); når intet ligger inden for 30 m, tages det nærmeste punkt hvor som helst, der ikke er bag det sidste match (efter en spin eller en udflugt). `s` falder aldrig: en sample, der projiceres bag den foregående, holdes.
- Hver kanal **samples om** på ét gitter, **hver 2 m**, lineært; trinvise kanaler (gear, flag) med den nærmeste sample. Uden for en omgangs eget område er værdierne tomme.
- En omgangs første og sidste samples projiceres en smule inde i referencens ender, så hver omgang **føres op til 15 m** ud over sine ender med den fart, den havde (tiden vokser med distance over fart, resten holdes) – så dens delta ved stregen er forskellen i omgangstid.
- `delta` = omgangens tid i hvert gitterpunkt minus referencens: gabet. `lateral` = `d` på gitteret.

Den tid, én omgang tog mere end en anden mellem to gitterpunkter, er forskellen mellem deres deltaer: `rel(s)`. Alt nedenfor bygger på den.

## Sving {#corners}

Fundet på **referencen** (`findCorners`), med dens fart udjævnet over ±6 m og dens krumning (ændring i retning over ±5 samples, udjævnet over ±10 m):

1. **Farteminima med fremtrædenhed.** Et punkt, der er det langsomste inden for ±40 m, og hvis fald fra den højeste fart på hver side (før et lavere minimum) er mindst `max(2,5 m/s, 6 % af farten)`.
2. **Knæk.** En lokal top i krumningen, der er snævrere end en **300 m** radius, uden et farteminimum inden for 80 m: et knæk, der køres fuld gas, er stadig et sving at køre.
3. **Faser.** Fra hver apex tilbage, mens referencen bremser (> 0,1) eller ikke er på fuld gas (< 0,95): indgangen; fremad, mens den ikke er på fuld gas: udgangen. Et knæk taget fladt får ±30 m. Overlappende sving holdes adskilt, men lægges op, så de dækker omgangen.
4. Nummereret T1, T2 … i omgangens rækkefølge; **venstre eller højre** efter krumningens fortegn og om verden er spejlvendt (ukendt tælles som spejlvendt).

**Svingvinduet** (hvor referencen drejer): ud fra det snævreste punkt inden for ±40 m af apex, så længe krumningen holder sig over en sjettedel af sin top, plus 10 m til hver side. Dens side giver fortegnet for "inde".

## Strækninger: fra bremsezone til bremsezone {#segments-braking-zone-to-braking-zone}

Hvert sving ejer vejen halvvejs til apexerne på hver side. I den:

- **Hver omgangs langsomste punkt** er et reelt dyk i dens fart – intet langsommere inden for 6 m (3 gitterpunkter) på hver side, set forbi strækningens ender, så den foregående udgang, der stadig accelererer ind i det, aldrig tages for det – søgt fra 15 m før svingvinduet til 10 m efter det. En omgang, der aldrig bremsede dér, placeres ved apex.
- **Hvor en omgang begyndte at bremse til det** (`entryOf`): tilbage fra dens langsomste punkt gennem bremsningen eller løftningen, over små stød af fuld gas, indtil den havde foden i bund (gas ≥ 0,95, bremse ≤ 0,1) i **10 m**; en gas, der blev taget op igen i de sidste **30 m** før det langsomste punkt, hører stadig til svinget; fuld gas hele vejen, selve det langsomste punkt. En omgang uden gaskanal, eller som aldrig havde foden i bund siden det foregående sving, starter ved sit hurtigste punkt midt imellem.
- **Strækningen starter** ved den første af alle omgange, der begyndte at bremse til den (4 m tidligere), og løber til starten af den næste, så hver omgangs bremsning ligger inde i den, og strækningerne dækker omgangen.

**Komplekser.** Efterfølgende sving, som referencen aldrig kører fuld gas imellem – under **40 m** fuld gas – er ét strækning, "T11-T12", kørt som én; et kompleks rummer højst **tre** sving (en snoet strækning, der aldrig køres flad, starter et nyt). Et kompleks, der drejer begge veje, er *blandet*: der måles ingen enkelt linjeform for det.

**På en bane** (referencen slutter inden for 50 m fra, hvor den startede), fortsætter den sidste strækning ligeud over stregen til det første bremsepunkt: en flyvende omgangs kørsel fra stregen tæller med det sidste sving. En omgang, der startede fra stilstand eller fra et løb-start (se [Starten](#the-start)), holder den kørsel adskilt.

### Hvad et sving fører ud på {#what-a-corner-leads-onto}

Målt på referencen: meter med fuld gas efter svinget (fra dens fuld gas til strækningens slut, plus kørslen over stregen) og før det (den foregående stræknings "efter", eller fra starten).

| Type | Regel |
|---|---|
| **mellem to langsider** (`both`) | 200 m eller mere før **og** 120 m eller mere efter |
| **ud på en langside** | 200 m eller mere efter, eller 120 m eller mere efter og mindst lige så meget som før |
| **efter en langside** | 200 m eller mere før |
| **forbindelse** | alt andet |

## Hvad hver omgang gjorde i et sving {#what-each-lap-did-in-a-corner}

`cornerMetrics`, pr. omgang og strækning, på gitteret (trin 2 m). Pedaler: bremsning tæller over 0,1, fuld gas er 0,95 og derover.

| Måling | Regel |
|---|---|
| **bremsepunkt** | den første bremsning, under hvilken gassen blev sluppet (under 0,5), eller som varede **15 m** – et let tryk med venstrefoden med effekt på er ikke, hvor bremsningen begyndte; med kun små tryk, det første lille tryk |
| **løftet** | uden bremsning, det første punkt, hvor gassen kom under 0,8 |
| (ingen pedaler) | det punkt, hvor omgangen begyndte at bremse (ovenfor) |
| **bremseslip** | den sidste bremsning op til 30 m efter det langsomste punkt |
| **fart ved bremsepunktet**, **bremsemeter** | til det langsomste punkt |
| **topbremsning**, **topdeceleration** | over bremsezonen (accelerationer over 45 m/s² ignoreres) |
| **trail braking** | meter med bremse > 0,05 og \|styring\| > 0,1 |
| **låsning** | den mest negative hjulslip-værdi i zonen (når omgangen har slip) |
| **langsomste punkt**, **mindstefart** | som ovenfor |
| **gas på** | efter slip (eller det langsomste punkt), den første gas > 0,15 uden bremse |
| **fuld gas** | det første punkt efter det, der holdt på ≥ 0,95 i 10 m |
| **rulning** | meter fra slip til gas på, med bremse og gas begge under 0,05 |
| **gasdyk** | antal gange gassen faldt mere end 0,25 under sin løbende top, mellem gas på og fuld gas |
| **sideværts top** | den største sideværts acceleration fra 20 m før slip til det senere af fuld gas og 20 m efter det langsomste punkt |
| **gear ved apex** | ved det langsomste punkt |
| **spin-slip** | det største drevne hjulslip mellem gas på og fuld gas |
| **balance** | for-minus-bag slipvinkel gennem midten (+ understyring) |
| **langside på fuld gas** | andelen af strækningen efter fuld gas (og kørslen over stregen) på ≥ 0,95; den længste løftning på den |
| **skrabet fart** | den største fart tabt fra et højt punkt med gas ≥ 0,9, ingen bremse, på underlaget |
| **indgangsdrift** | den største driftvinkel fra bremsepunktet til 5 m efter det langsomste punkt, på underlaget |
| **håndbremse** | hvor den kom på (> 0,2), op til 10 m efter det langsomste punkt |
| **luft** | sekunder i luften over strækningen, og dens længste flyvetur |

## Hvem hver omgang sammenlignes med {#who-each-lap-is-compared-with}

- En omgang sammenlignes med **den hurtigste fulde omgang i sin egen præstationsklasse** (referencen, i referencens klasse).
- Den bedste omgang i klassen (og referencen) sammenlignes selv, strækning for strækning, med **den af de andre omgange i klassen, der var hurtigst** igennem den – eller med alle omgange, når den er alene i sin klasse.

Tidskortet, forskellene i omgangslisten, bilkontrol-hændelserne og tabellen sving for sving følger den samme sammenligning.

## Tidsregnskabet for et sving {#the-time-account-of-a-corner}

`compareCorner`, for en omgang mod den anden over en strækning:

- **netto** = `rel(slut) - rel(start)` (plus kørslen over stregen på en flyvende omgang): dommen. Tættere end **0,03 s** er **lige**.
- **Fordelingen** – hvor inde i svinget føreren drejede: i stykket fra det første bremsepunkt eller langsomste punkt for en af omgangene til det senere af deres fuld gas- og langsomste punkter, den største udsving, den omgang derefter gav tilbage eller vandt tilbage, når udsvinget er over **0,04 s**; ellers det senere af de to langsomste punkter.
- **Til apex** = `rel(fordeling) - rel(start)`; **efter den** = netto minus det. Når begge er mindst 0,04 s og af modsat fortegn, **byttede** omgangen det ene for det andet.
- **Efter den** deles igen dér, hvor begge omgange er på fuld gas: **udgangen** (fordeling til senere fuld gas) og **langsiden** (derfra til enden).
- **Langsiden** deles i tre:
  - *udgangsfart* (`byExit`) – målt, ikke modelleret: den langsommere bil passerer den hurtigere bils startfart et stykke ned ad langsiden, og derfra er dens egen kurve, hvad den ville have gjort fra den fart, med sin egen gearing, luftmodstand og hældning med. Flyttet tilbage til det punkt (og kørt videre med sin sluthastighed for de meter, den vinder) er det dens tid fra den hurtigere start; forskellen er udgangsfartens omkostning. Når den langsommere bil aldrig når den fart (eller kun i de sidste 2 samples), lægges dens egen acceleration langs stykket tilbage som effekt (`a·v` holdt), aldrig hårdere, end dens kurve viser ved den fart (to gange den målte acceleration uden en kurve).
  - *bilernes træk* (`byPower`) – kun i forskellige biler: begge biler fra samme fart over samme meter, på fuld gas, med integration af den fulde acceleration, hver har vist ved hver fart.
  - *hvordan den blev kørt* (`driven`) – resten: en løftning, fart skrabet af på fuld gas.

  Udgangsfarten forklarer aldrig mere end langsidens omkostning (og aldrig med det modsatte fortegn), medmindre en løftning eller skrabet fart tog noget tilbage. En omgang **løftede** på langsiden, når dens andel på fuld gas er under både 0,9 og den andens andel minus 0,05. Skrabet fart tæller, når de to adskiller sig med mere end 1 m/s. En uenighed under 0,02 s i fortegn sættes til 0.

Hver stræknings netto lægger sig sammen til forskellen i omgangstid, og hvert sving's til-apex og efter-apex lægger sig sammen til dets netto (testene kontrollerer begge dele).

### Bilens andel {#the-cars-share}

Kun når omgangene er i **forskellige biler**, og omgangen tabte tid (`carShare`):

- **træk**: bilernes træk ned ad langsiden (ovenfor), op til tabet;
- **greb**: når omgangen var ved sin bils grænse (sideværts acceleration gennem midten mindst **90 %** af det, dens bil holder ved den fart), og den anden bil holder mere end **5 %** mere: af den lavere mindstefart, der ikke forklares af en snævrere radius, andelen `½ ln(greb_andre / greb_min) / ln(v_andre / v_min)` af det resterende tab;
- **bremser**: når omgangen bremsede (ikke løftede), bremser den anden bil over **5 %** hårdere, og omgangens *gennemsnitlige* deceleration over zonen var mindst **80 %** af det, dens bil kan: fra `u` ned til `v` ved `a1` mod `a2`, slutter samme sted, `(1/a1 - 1/a2)(u - v)² / 2u`, op til det, der er tilbage.

Bilens omkostning er summen, højst tabet.

## Dommen og pointen {#the-verdict-and-the-finding}

`cornerFinding` skriver højst én pointe pr. omgang og sving, prøvet i denne rækkefølge:

| Tilfælde | Pointe | Udfald |
|---|---|---|
| netto inden for ±0,03 s, en byttehandel, mindre side ≥ **0,1 s** | **lige, to veje igennem** – hvem der var langsom ind og hurtig ud, og hvem der var den modsatte vej; med en langside efter (ud på en langside, eller mellem to), er vejen langsomt ind, hurtigt ud den, man skal bygge på: behold dens tidlige gas, og vind indgangen tilbage ved at bremse hårdere, ikke senere | lige |
| netto inden for ±0,03 s ellers | intet siges | - |
| vundet, en byttehandel, tabt til apex | **langsomt ind, hurtigt ud betalte sig**: behold den, her er udgangen mere værd | gevinst |
| vundet, en byttehandel, vundet til apex | **hurtigere på vej ind**: indgangen er rigtig, en tidligere fuld gas ville beholde mere | gevinst |
| vundet, og den anden omgang har et tab her | **hurtigere – på grund af det den anden gjorde**, dens årsag og dens tip sagde "For den anden omgang: …" | gevinst |
| vundet ellers | **hurtigere på vej ind / ud**, efter hvilken halvdel der vandt mest (bremse senere, mere fart gennem midten; eller fladt tidligere, stærkere træk) | gevinst |
| tabt, og et **stød eller styrt** kostede mindst `max(0,05 s, 40 % af tabet)` | stødet er svingets historie, før bilerne | tab |
| tabt, og **bilens andel** er 60 % eller mere | **bilen**: dens træk ned ad langsiden, dens greb gennem midten, eller dens bremser – den største del; med førerens del (≥ 0,03 s) sagt som "De andre X s: …" | tab |
| tabt, og en udelt **bilkontrol-fejl** kostede mindst `max(0,05 s, 40 %)` | den fejl (se nedenfor), med hvordan tiden flyttede sig omkring den | tab |
| tabt, og en **længere flyvetur** kostede mindst `max(0,05 s, 40 %)` | flyveturen | tab |
| tabt, en byttehandel, vundet til apex | **for hurtigt ind, langsomt ud**: udgangens årsag; giv noget af indgangen op for at blive drejet og fladt tidligere, med den andens brems- og fuld gas-punkter. Dens rod (`cause`, som [statistikken](race-course-statistics.md) tæller): bremse senere, når den bremsede nogle meter senere end den anden; ellers udgangens årsag | tab |
| tabt, en byttehandel, tabt til apex | **gav mere væk på vej ind, end udgangen vandt tilbage**: indgangens årsag, som også er dens rod (`cause`); behold udgangen, tab mindre på vej ind | tab |
| tabt, løftet på langsiden, og den kørte del over halvdelen af tabet | **ikke på fuld gas på langsiden**: dens andel på fuld gas mod den andens, hvor og hvor længe løftningen var | tab |
| tabt, bilernes træk over 60 % af tabet og langsiden over halvdelen | **bilens træk ned ad langsiden** (med begge biler træk ved 160 km/t) | tab |
| tabt ellers | årsagen til den halvdel, der tabte mest (til apex ≥ efter den: indgangens; ellers udgangens). Langsommere ud kun fordi langsommere gennem midten (med mere end 1 m/s): midtens årsag i stedet | tab |

En pointe om et tab kan også slutte med **Også:** – fart skrabet af på fuld gas, eller en løftning på langsiden – når den kørte del af langsiden kostede mere end 0,04 s, og det ikke allerede var årsagen.

Pointerne sorteres med tab først, dyreste først; derefter gevinster og lige sving.

### Årsager på vej ind {#causes-on-the-way-in}

`entryCause`, den første der passer (farteforskelle i minimum er i m/s; "5 m" er grænsen for, at et tidligere eller senere punkt tæller):

| # | Årsag (fejl) | Regel |
|---|---|---|
| 1 | et stød eller styrt på vej ind | et udelt stød, der starter senest 10 m efter det langsomste punkt |
| 2 | **næsten standset** (hændelse) | langsomste fart under **60 %** af det, dens greb tillader, hvor den anden kørte igennem (`v_andre · √(greb_min / greb_andre)`, når den anden bil har mere greb, ellers den andens fart), den anden omgang over 8 m/s – en spin, kontakt eller et sving, der blev misset |
| 3 | en bilkontrol-fejl på vej ind | en udelt låsning, understyring, spin eller glidning, der ikke er på gas, og som starter senest 10 m efter det langsomste punkt, kostede ≥ 0,02 s |
| 4 | en længere flyvetur før det langsomste punkt | se [rally](#rally-rotation-and-flights) |
| 5 | **løftet**, hvor den anden blev på fuld gas eller løftede 5 m eller mere senere | denne omgang løftede bare |
| 6 | **bremset, hvor den anden kun løftede** eller blev på fuld gas | og var mere end 0,5 m/s langsommere gennem midten |
| 7 | **bremset blidt** | den bremsede (ikke løftede), og havde plads til at bremse hårdere – med dæk-data, dens låseslip under **60 %** af slippet, hvor denne bils bremser giver sit bedste; uden dem, en topdeceleration under **85 %** af det, den viser ved den fart – pedalen under 0,95, og den andens topdeceleration mere end **15 %** højere |
| 8 | **bremset tidligt** – eller **bilens bremser** | bremset mere end 5 m før den anden. I en anden bil, hvis bremser er over 5 % stærkere, og med højst 10 m at spare mod den afstand, denne bil skal bruge ved sin egen deceleration: bilens bremser. Ellers bremset tidligt, med "Brems senere – ca. N m" (i en anden bil, metrene ud over det, den skal bruge) |
| 9 | **rullet** | mere end 10 m uden nogen pedal, og 5 m mere end den anden |
| 10 | **langsommere gennem midten** | mere end 0,5 m/s langsommere ved det langsomste punkt; delt efter `v² = a·R` (nedenfor) |
| 11 | **kom langsommere frem** | over 1 m/s langsommere ved bremsepunktet, ikke bremset tidligt: afgjort før – af svinget før og bilens træk, eller af en flyvetur i svinget før, der var 0,2 s længere. Bilens, når bilerne er forskellige |
| 12 | langsommere til apex | ellers: slip bremsen mere blidt og rul mere fart ind i midten |

**Langsommere gennem midten** (`middleSplit`): hver omgangs radius ved sit langsomste punkt måles ud fra dens egen vej (±8 m), dens sideværts acceleration som `v²/R`, og

`ln(v_andre / v_min) = ½ ln(a_andre / a_min) + ½ ln(R_andre / R_min)`.

- Radius forklarer **halvdelen eller mere**: **for snæver en linje** – "brug mere af vejen", med begge radier og andelen.
- Ved bilens grænse (glidning ud over 10° drift på asfalt / 20° på løst underlag, eller sideværts acceleration mindst 90 % af det, den holder ved den fart) og den anden bil har mere end 5 % mere greb: **bilens greb**; beskyt udgangen i stedet.
- Glidning gennem det (drift over 10° / 20°) og den anden omgang gjorde ikke (dens indgangsdrift mindst 4° mindre): **sidelæns** – ud over sit greb, ikke under det; kom lidt langsommere ind. Det siges at være bilens, når denne bil fanger sin bagende mindst én gang pr. omgang mere end den anden.
- I en anden bil, der holder under **96 %** af den andens greb, og omgangen holdt inden for 1 m/s af `v_andre · √(greb_min / greb_andre)`: **bilens greb** – "at bremse senere vil ikke lukke det hul".
- Ellers **greb til overs**: sideværts acceleration mod den andens på en lignende radius, og hvad denne bil holder; tag mere fart med til apex. Hvor denne bils bagende slipper, før dens greb er brugt op (dens glidninger begynder under 85 % af dens greb, og omgangen var på 80 % af det), find resten i små skridt.

### Årsager på vej ud {#causes-on-the-way-out}

`exitCause`, den første der passer:

| # | Årsag (fejl) | Regel |
|---|---|---|
| 1 | en bilkontrol-fejl på vej ud | udelt hjulspin, spin, glidning eller stød, der slutter ved eller efter 10 m før det langsomste punkt |
| 2 | **skrabet fart** | mere end 1 m/s mere fart tabt på fuld gas end den anden; over **7 m/s (25 km/t)** "mere som kontakt eller en spin end en glidning" |
| 3 | **drejede bilen forkert** (løst underlag) | se [rally](#rally-rotation-and-flights) |
| 4 | **på gassen senere** | gas på mere end 5 m senere, også målt fra hver omgangs eget langsomste punkt (en omgang, der er langsomst senere, bebrejdes ikke en senere gas) |
| 5 | **tøvede med gassen** | flere gasdyk end den anden |
| 6 | **kørte bredt og ventede** | mere end 1,5 m ude i forhold til den anden, hvor begge var flade, og fuld gas mere end 5 m senere fra dens eget langsomste punkt |
| 7 | **fuld gas senere** | fuld gas mere end 5 m senere, også fra dens eget langsomste punkt; med bilens acceleration der |
| 8 | **bilens kørsel** | i en anden bil, der trækker under 95 % af den andens ved den fart, og trækket forklarede noget af langsiden |
| 9 | **langsommere ud af svinget** | ellers: en senere apex, så bilen er lige tidligere |

Når de to omgange var i forskellige gear ved det langsomste punkt, slutter tippet med "Gear N ved apex; den anden brugte M."

### Bilkontrol-fejl og stød {#car-control-faults-and-impacts}

En fejl fra [Bilens kontrol: hændelser](race-control-events.md) som årsag: en låsning er en *bremsningsårsag*, hjulspin eller en glidning på gas en *udgangsårsag*, resten *indgang*; et stød efter det langsomste punkt er *udgang*, før det *indgang*. Tippet er hændelsens eget, derefter "Den kostede ca. X s ved 40 m efter den" (eller "ved den tid, bilen havde fået sin fart igen" for et stød). En låsning med et bremsepunkt mere end 5 m tidligere end den andens tilføjer, at omgangen også bremsede tidligt – med hjulene drejende havde den ikke behøvet det.

### Rally: rotation og flyvninger {#rally-rotation-and-flights}

På **løst underlag**, med driftvinkler på begge omgange, og denne omgang på gas (eller flad) mere end 5 m senere:

- **Drejede bilen mindre**: den anden havde bilen drejet **12°** eller mere ved sit langsomste punkt og mindst **8°** mere end denne omgang. Tip: en løftning eller et lille tryk med venstrefodsbremsen, mens den drejer ind, med den andens håndbremsepunkt, når kun den brugte et, eller håndbremsen i et sving langsommere end 15 m/s (54 km/t).
- **Drejede den for meget**: denne omgang havde den drejet 12° eller mere og mindst **12°** mere end den anden: den skulle rettes op, før gassen kunne komme ned.

**En længere flyvetur**: i luften 0,2 s eller mere længere end den anden, og som koster mindst 0,03 s fra 10 m før afløbet til 40 m efter landingen (eller strækningens slut). Før det langsomste punkt er det en indgangsårsag; den bliver svingets historie, når den forklarer 40 % eller mere. Tippet: behold gassen på ved afløbet, tag toppen en smule langsommere eller med et let tryk på bremsen.

### Starten {#the-start}

Før det første sving, på en sprint, eller når en af omgangene startede fra stilstand (under 5 m/s, når begge er først på aksen) eller fra et løbsstart (under 60 % af den andens fart), er kørslen til det første bremsepunkt sin egen pointe (sving 0), når den adskiller sig med mere end 0,03 s: *Start*, *Løbets start* eller *Til første sving*. Et tab der sættes på situationen (*kontekst*), når den ene omgang startede med et løbsstart og den anden i fart, til bilen, når omgangene er i forskellige biler, og ellers til føreren. Tips: i en anden bil fra stilstand, "for det meste bilen"; en stående start i samme bil, start med mindre hjulspin og skift ved toppen af effektbåndet; et løbsstart, sammenlign med en anden første omgang; en flyvende start, en bedre udgang fra det sidste sving føres over stregen.

## Den kørte linje {#the-driven-line}

`lineMetrics`, pr. omgang og strækning (ikke for blandede komplekser), ud fra positioner alene (udjævnet ±2 samples) over svingvinduet:

| Måling | Regel |
|---|---|
| krumning | ændring i retning over ±8 m af omgangens egen vej |
| **snævreste radius** | 1 / den højeste krumning |
| **indgangspunkt** / **udgangspunkt** | hvor krumningen først / sidst overstiger en femtedel af sin top |
| **midte** | hvor omgangen havde drejet halvdelen af sin retningsændring |
| radius ind / ud | meter kørt over halvdelen af retningsændringen, før / efter midten |
| **form** | snævreste radius over gennemsnitsradius under drejning: under **0,55** en **V**, over **0,75** en **U**, ellers "U/V" |
| **apex** | radius ud over radius ind: over **1,25** sen, under **0,8** tidlig, ellers midt |
| **fart-apex** | det langsomste punkt mere end **15 m** før midten: langsomt ind, hurtigt ud; mere end 15 m efter: stadig bremsende forbi midten |

Mod den anden omgang: hvor langt inde (+) eller ude den kørte ved indgangspunktet, gennem den snævreste del og der, hvor begge var flade (sagt fra 1 m); hvor hver drejede ind (sagt fra 8 m).

### Hvilken linje passer til denne bil her {#which-line-suits-this-car-here}

`lineFor`, ud fra hvad svinget fører ud på og bilens karakter i dette sving:

- **effekt-til-greb** = bilens acceleration med fuld gas ved udgangsfarten divideret med dens greb ved mindstefarten (fra dens kurve). **Point and shoot** ved **0,45** og derover; **momentum** ved **0,25** og derunder.
- **nedtryk**: greb ved 151-252 km/t divideret med greb ved 54-108 km/t på **1,15** eller mere, for et sving taget ved **144 km/t** (40 m/s) eller hurtigere – så er det et momentum-sving uanset effekten. Ikke bedømt på løst underlag.

| Svingtype | Bil | Linje |
|---|---|---|
| efter en langside | point and shoot / andet | V / U, apex i midten: "bremsezonen er præmien" |
| mellem to langsider | momentum / andet | U / V, sen apex |
| forbindelse | momentum / andet | U / V, apex i midten: "kør den for udgangen af den næste" |
| ud på en langside | momentum (eller et hurtigt nedtryks-sving) | bred, rund U, lidt sen apex |
| ud på en langside | point and shoot | V: brems lige, drej ind sent, roter i en kort, stram midte, lige tidligt |
| ud på en langside | midt imellem | U med sen apex: langsomt ind, hurtigt ud |

Hvor udgangen betyder noget (ud på en langside, mellem to), tilføjer drivlinjen en sætning: **FWD** – roter den på bremserne, læg kun effekt på, efterhånden som hjulet retter sig op; **RWD** med et effekt-til-greb på 0,35 eller mere – ret den op før fuld gas; **AWD** – den kan give effekt, mens den stadig drejer. På løst underlag tilføjer alle linjer: drej bilen på vej ind.

Sætningen siger så, hvad omgangen kørte, og om det passer: *langsomst sent binder udgangen* eller *en tidlig apex binder udgangen*, hvor en sen apex var ønsket og omgangen hverken ramte apex sent eller var langsomst tidligt; *rundere end denne bil vil have* hvor en V var ønsket; *mere kantet end denne bil vil have* hvor en U var ønsket; ellers *det passer*.

## Til udviklere {#for-developers}

Kode: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Begrundelsen og dens kilder: [metoden](race-analytics.md).
