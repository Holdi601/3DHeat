---
title: "Analyse sving for sving"
parent: "Løpsanalyse"
nav_order: 55
lang: "no"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analyse sving for sving

To runder på samme bane sammenlignes sving for sving. For hvert sving sier seeren hvem som var raskest, hvor mye tid det var verdt, og hvorfor: bremset for tidlig, kom på gass for sent, tok en bredere linje. Da vet du hva du skal øve på først.

![A finding opened in Where to improve, next to the Corner by corner table](../assets/img/en/race-corner-finding.webp)

Et eksempel: i sving 3 bremser Driver A 20 m tidligere enn Driver B og taper 0,15 s på vei dit, men er på gass tidligere og vinner 0,15 s på vei ut. Netto 0,00 s: svingen er likt, og ingen får beskjed om å bremse senere.

## Hva du ser {#what-you-see}

### Hvor du kan bli bedre {#where-to-improve}

Sidefeltets seksjon for den valgte runden ("Last inn minst to runder av en bane." til da).

**Hodet:** "<runde> <tid> mot <referanse> <tid>" og rundetidsgapet. For referansen står det i stedet "mot den raskeste andre runden gjennom hvert sving (…)" og totalen den tapte. Ved siden av er tapet delt i *kjøring* og *bil / kontekst*.

**Fremdriftsstolpen:** tiden som tapes per årsaksgruppe (bremsing, inngang, utgang, rettstrekning, bil, kontekst), i årsaksfargene, med forklaring.

**Funnene**, tre lister:

1. Førertap, dyrest først, høyst **12**, eller "Ingen steder der annen kjøring ville vunnet tid, skiller seg ut."
2. **Vis hva bilen eller situasjonen kostet (X s)**: bil- og kontekst-tap, høyst 8 (på som standard).
3. **Der <runde> er raskere, eller likt på en annen måte (N)**: gevinster og likt-svinger, høyst 10 (på som standard).

Hvert funn viser rangen, tittelen (svinget og hva som skjedde, med kostnaden for et tap), dommlinjen, kostnaden (gevinster med minus) med en stolpe, og en brikke: *bremsing*, *inngang*, *utgang*, *rettstrekning* (førertap, med "· bil X" når bilen forklarer 0,02 s eller mer), *bil*, *kontekst*, *raskere*, *likt*. **Klikk på ett** for å stille bilene opp 40 m før det, ramme det inn og spille det av, og åpne målingene:

- **Bremsing:** hvor hver bremset (eller løftet) og fra hvilken fart, og hvor mange meter tidligere eller senere (fra 5 m);
- **Saktest:** hver runde sin minimumsfart og hvor;
- **Full gass:** hvor hver var flat, og hvor mye tidligere eller senere;
- **Linje:** forskjell i innsving, strammeste radier, hvor mye innenfor eller utenfor, og hver runde sin linjeform og toppunkt;
- **Rett til neste sving:** lengden, begge farter der begge var flate, hva den tapte eller vant og på hva: startfarten, den andres sterkere trekkraft, et løft, fart som ble nedbremset, hvordan den ble kjørt (deler fra 0,02 s);
- **Bilen:** hvor mye av tapet som er bilen, og hva (trekkraft, grep, bremser; når 0,02 s eller mer);

deretter tipset, **Bilene:** (i ulike biler, se [Bilprofiler](race-car-profiles.md#what-the-cars-decide-in-a-corner)), og linjerådet.

### Sving for sving {#corner-by-corner}

En tabell (med to eller flere runder), én rad per seksjon, for den valgte rundens klasse når det finnes flere klasser:

| Kolonne | Viser |
|---|---|
| Sving | `T3`, `T11-T12` |
| Raskest | runden som var raskest gjennom det (dens egen tid fra seksjonens start til slutt) |
| med | dens margin over den nest raskeste, s |
| linje | den raskeste rundens form og toppunkt ("V · sent", "U/V · midt"); hold musen over for dens strammeste, inn- og utgangsradier; "begge veier" for et blandet kompleks |
| (den valgte runden) | hvor langt bak den raskeste den var, eller ✓ når den var raskest |

Et klikk på en rad åpner den valgte rundens funn der (eller stiller bilene opp 40 m før seksjonen). Under tabellen, når alle svinger har en tid: "Den raskeste gjennom hvert sving, satt sammen: <tid> (± på referansen / på den beste i klasse X)". Det er de beste seksjonene pluss den raskeste kjøringen til første sving når det er en egen strekning.

## Slik regnes det ut {#how-it-is-worked-out}

Styrereglen: **et sving bedømmes som helhet**, fra bremsesonen for det til bremsesonen for det neste. En runde som bremser tidligere for å få bilen rundt og på gass tidligere, får kreditt for utgangen den kjøpte, og får ikke beskjed om å bremse senere.

## Én distanseakse {#one-distance-axis}

Runder sammenlignes etter distanse, ikke tid. Et sekund bak er to runder på ulike steder i svingene. Heller ikke etter hver runde sin egen kilometerteller (en strammere linje dekker færre meter). **Referanserundens** kjørte vei er aksen:

- Hver annen runde sine målepunkter **projiseres** på referansestien: hvert målepunkt får `s`, hvor langt framme på referansen det er, og `d`, hvor langt til venstre (positiv) eller høyre. Søket går bare framover fra forrige treff (8 stykker sti bakover til 40 framover), så en runde som krysser seg selv over eller under, aldri hopper til det andre krysset. Det første målepunktet søkes i første kvart av stien (på en bane sammenfaller start og mål). Når ingenting er innen 30 m, tas det nærmeste punktet overalt som ikke ligger bak siste treff (etter en snurr eller en avstikker). `s` går aldri ned: et målepunkt som projiseres bak det foregående, holdes.
- Hver kanal **resamples** til ett rutenett, **hver 2 m**, lineært. Trinnvise kanaler (gir, flagg) tas fra nærmeste målepunkt. Utenfor rundens eget område er verdiene tomme.
- En runde sitt første og siste målepunkt projiseres litt innenfor referansens ender, så hver runde **føres opptil 15 m** forbi endene sine med farten den hadde (tid vokser med distanse delt på fart, resten holder). Deltaet ved streken blir dermed forskjellen i rundetid.
- `delta` = rundens tid i hvert rutenettpunkt minus referansens: gapet. `lateral` = `d` på rutenettet.

Tiden en runde brukte mer enn en annen mellom to rutenettpunkter, er forskjellen mellom deres deltaer: `rel(s)`. Alt nedenfor bygger på den.

## Sving {#corners}

Finnes på **referansen** (`findCorners`), med farten jevnet over ±6 m og krumningen (retningsendring over ±5 målepunkter, jevnet over ±10 m):

1. **Fartsminima med fremtredende.** Et punkt som er det laveste innen ±40 m, og der fallet fra høyeste fart på hver side (før et lavere minimum) er minst `max(2,5 m/s, 6 % av farten)`.
2. **Knekk.** En lokal topp i krumning strammere enn **300 m** radius uten fartsminimum innen 80 m: et knekk tatt full gass er likevel et sving å kjøre.
3. **Faser.** Fra hvert toppunkt bakover så lenge referansen bremser (> 0,1) eller er av full gass (< 0,95): inngangen. Framover så lenge den er av full gass: utgangen. Et knekk tatt flatt får ±30 m. Overlappende svinger holdes adskilt, men legges til å dekke runden.
4. Nummereres T1, T2 … i rundens rekkefølge; **venstre eller høyre** etter krumningens fortegn og om verdenen er speilvendt (ukjent regnes som speilvendt).

**Svingvinduet** (der referansen svinger): ut fra det strammeste punktet innen ±40 m fra toppunktet, så lenge krumningen holder seg over en sjettedel av sin topp, pluss 10 m på hver side. Dens side gir fortegnet for "innenfor".

## Seksjoner: fra bremsesone til bremsesone {#segments-braking-zone-to-braking-zone}

Hvert sving eier veien halvveis til toppunktene på hver side. Der:

- **Hver runde sitt saktest punkt** er en reell dal i farten: ingenting saktere innen 6 m (3 rutenettpunkter) på hver side, og det ser forbi endene av strekningen, slik at forrige svings utgang som fortsatt akselererer inn i det, aldri tas feil for det. Søkt fra 15 m før svingvinduet til 10 m etter det. En runde som aldri bremset der, plasseres i toppunktet.
- **Der en runde begynte å bremse for det** (`entryOf`): bakover fra sitt saktest punkt gjennom bremsingen eller løftet, over små glimt av full gass, til den hadde foten ned (gass ≥ 0,95, bremse ≤ 0,1) i **10 m**. Gass tatt opp igjen i de siste **30 m** før det saktest punktet hører fortsatt til svinget. Full gass hele veien: det saktest punktet selv. En runde uten gasskanal, eller som aldri hadde foten nede siden svinget før, starter i sitt raskeste punkt mellom.
- **Seksjonen starter** der den første av alle rundene begynner å bremse for det (4 m tidligere), og går til starten av den neste, slik at hver runde sin bremsing er inne i den, og seksjonene dekker runden.

**Komplekser.** Etterfølgende sving som referansen aldri kjører full gass mellom - mindre enn **40 m** full gass - er én seksjon, "T11-T12", kjørt som én. Et kompleks rommer høyst **tre** svinger (en kronglete strekning kjørt uten å være flat, starter et nytt). Et kompleks som svinger begge veier, er *blandet*: ingen enkelt linjeform måles for det.

**På en bane** (referansen slutter innen 50 m fra der den startet), går den siste seksjonens rettstrekning videre over streken til det første bremsepunktet:
en flyvende runde sin kjøring fra streken regnes med det siste svinget. En runde som startet fra stillstand eller ved en rennstart (se [Starten](#the-start)), holder den kjøringen adskilt.

### Hva et sving leder inn på {#what-a-corner-leads-onto}

Målt på referansen: meter med full gass etter svinget (fra dens full gass til seksjonens slutt, pluss kjøringen over streken) og før det (den forrige seksjonens "etter", eller fra starten).

| Type | Regel |
|---|---|
| **mellom to rettstrekninger** (`both`) | 200 m eller mer før **og** 120 m eller mer etter |
| **inn på en rettstrekning** | 200 m eller mer etter, eller 120 m eller mer etter og minst like mye som før |
| **etter en rettstrekning** | 200 m eller mer før |
| **forbindelse** | alt annet |

## Hva hver runde gjorde i et sving {#what-each-lap-did-in-a-corner}

`cornerMetrics`, per runde og seksjon, på rutenettet (steg 2 m). Pedaler: bremsing telles over 0,1, full gass er 0,95 og over.

| Mål | Regel |
|---|---|
| **bremsepunkt** | den første bremsingen som gassen kom av under (under 0,5), eller som varte **15 m**. Et lite tramp med venstrefoten med kraften på er ikke der bremsingen begynte. Med bare tramp, det første trampet |
| **løftet** | uten bremsing, det første punktet gassen gikk under 0,8 |
| (ingen pedaler) | punktet der runden begynte å bremse ned (over) |
| **bremseslipp** | den siste bremsingen opp til 30 m etter det saktest punktet |
| **fart ved bremsepunktet**, **bremsemeter** | til det saktest punktet |
| **topp bremsing**, **toppretardasjon** | over bremsesonen (akselerasjoner over 45 m/s² ignoreres) |
| **trail braking** | meter med bremse > 0,05 og |styring| > 0,1 |
| **låsing** | det mest negative hjulslipforholdet i sonen (når runden har slip) |
| **saktest punkt**, **minimumsfart** | som over |
| **gass på** | etter slippet (eller det saktest punktet), den første gassen > 0,15 uten bremse |
| **full gass** | det første punktet etter det som holdt ≥ 0,95 i 10 m |
| **rulling** | meter fra slippet til gass på, med bremse og gass begge under 0,05 |
| **gassdykk** | ganger gassen falt mer enn 0,25 under sin løpende topp mellom gass på og full gass |
| **topp sideveis** | størst sidesakselerasjon fra 20 m før slippet til det senere av full gass og 20 m etter det saktest punktet |
| **gir i toppunktet** | i det saktest punktet |
| **spinnslip** | størst slipforhold på drivhjulene mellom gass på og full gass |
| **balanse** | fremre minus bakre sideglidevinkel gjennom midten (+ understyring) |
| **rettstrekning med full gass** | andelen av seksjonen etter full gass (og kjøringen over streken) på ≥ 0,95; det lengste løftet på den |
| **fart nedbremset** | mest fart tapt fra et høyt punkt med gass ≥ 0,9, ingen bremse, på underlaget |
| **inngangsdrift** | største driftvinkel fra bremsepunktet til 5 m etter det saktest punktet, på underlaget |
| **håndbrekk** | der det ble tatt i bruk (> 0,2), opp til 10 m etter det saktest punktet |
| **luft** | sekunder i luften over seksjonen, og dens lengste flytur |

## Hvem hver runde sammenlignes med {#who-each-lap-is-compared-with}

- En runde sammenlignes med **den raskeste hele runden i sin egen ytelsesklasse** (referansen, i referansens klasse).
- Klasseren selv (og referansen) sammenlignes, seksjon for seksjon, med **den andre runden i klassen som var raskest** gjennom den, eller med alle runder når den er alene i klassen.

Tidskartet, gapene i rundelisten, bilhendelsene og svingtabellen følger den samme sammenligningen.

## Tidsregnskapet for et sving {#the-time-account-of-a-corner}

`compareCorner`, for en runde mot den andre over en seksjon:

- **netto** = `rel(slutt) - rel(start)` (pluss kjøringen over streken på en flyvende runde): dommen. Nærmere enn **0,03 s** er **likt**.
- **Delingen** - hvor i svinget den ledende vant: på strekningen fra første bremsepunkt eller saktest punkt for begge rundene til det senere av deres full gass og saktest punkter, den største svingen runden da ga tilbake eller vant tilbake, når svingen er over **0,04 s**. Ellers det senere av de to saktest punktene.
- **Til toppunktet** = `rel(deling) - rel(start)`; **etter det** = netto minus det. Når begge er minst 0,04 s og med motsatt fortegn, **tradet** runden det ene for det andre.
- **Etter det** deles igjen der begge rundene er full gass: **utgangen** (delingen til det senere full gass) og **rettstrekningen** (derfra til slutten).
- **Rettstrekningen** deles tre veier:
  - *utgangsfart* (`byExit`) - målt, ikke modellert: den saktere bilen passerer den raskere bilens startfart et stykke ned rettstrekningen, og derfra er dens egen kurve det den ville gjort fra den farten, med sin egen giring, luftmotstand og helning i seg. Forskjøvet tilbake til det punktet (og kjørt videre med sluttfarten for meterne den vinner) er det dens tid fra den raskere startfarten. Forskjellen er utgangsfartens kostnad. Når den saktere bilen aldri når den farten (eller bare i de to siste målepunktene), settes dens egen akselerasjon langs strekningen tilbake som effekt (`a·v` holdt), og aldri hardere enn dens omhylling viser ved den farten (to ganger den målte akselerasjonen uten omhylling).
  - *bilenes trekkraft* (`byPower`) - bare i ulike biler: begge bilene fra samme fart over samme meter, full gass, og integrerer full-gass-akselerasjonen hver har vist ved hver fart.
  - *hvordan det ble kjørt* (`driven`) - resten: et løft, fart nedbremset med full gass.

  Utgangsfarten forklarer aldri mer enn kostnaden på rettstrekningen (og aldri med motsatt fortegn), med mindre et løft eller nedbremset fart tok noe tilbake. En runde **løftet** på rettstrekningen når dens andel med full gass er under både 0,9 og den andres andel minus 0,05. Nedbremset fart teller når de to skiller seg med mer enn 1 m/s. En uenighet under 0,02 s i fortegn settes til 0.

Hver seksjons netto summerer til forskjellen i rundetid, og hvert svings til-toppunktet og etter-det summerer til nettoen (testene sjekker begge).

### Bilens andel {#the-cars-share}

Bare når rundene er i **ulike biler**, og runden tapte tid (`carShare`):

- **trekkraft**: bilenes trekkraft nedover rettstrekningen (over), opp til tapet;
- **grep**: når runden var på bilens grense (sidesakselerasjon i midten minst **90 %** av det bilen holder ved den farten) og den andre bilen holder mer enn **5 %** mer: av den lavere minimumsfarten som ikke forklares av en strammere radius, andelen `½ ln(grep_annen / grep_min) / ln(v_annen / v_min)` av det gjenstående tapet;
- **bremser**: når runden bremset (ikke løftet), bremser den andre bilen over **5 %** hardere, og rundens *gjennomsnittlige* retardasjon over sonen var minst **80 %** av det bilen kan: fra `u` ned til `v` ved `a1` mot `a2`, som ender på samme punkt, `(1/a1 - 1/a2)(u - v)² / 2u`, opp til det som er igjen.

Bilens kostnad er summen, høyst tapet.

## Dommen og funnet {#the-verdict-and-the-finding}

`cornerFinding` skriver høyst ett funn per runde og sving, prøvd i denne rekkefølgen:

| Tilfelle | Funn | Utfall |
|---|---|---|
| netto innenfor ±0,03 s, en trade, mindre side ≥ **0,1 s** | **likt, to veier gjennom** - hvem som var sakte inn og rask ut, hvem som var motsatt; med en rettstrekning etter (inn på en rettstrekning, eller mellom to), er sakte-inn-fort-ut-veien den å bygge på: behold den tidlige gassen, vinn inngangen tilbake ved å bremse hardere, ikke senere | likt |
| netto innenfor ±0,03 s ellers | ingenting sagt | - |
| vunnet, en trade, tapt til toppunktet | **sakte inn, fort ut betalte seg**: behold den, her er utgangen verdt mer | gevinst |
| vunnet, en trade, vunnet til toppunktet | **raskere på vei inn**: inngangen er riktig, en tidligere full gass ville beholdt mer | gevinst |
| vunnet, og den andre runden har et tap her | **raskere - på grunn av det den andre gjorde**, dens årsak og tips sa "For den andre runden: …" | gevinst |
| vunnet ellers | **raskere på vei inn / ut**, etter hvilken halvdel som vant mest (bremse senere, mer fart gjennom midten; eller flat tidligere, sterkere trekkraft) | gevinst |
| tapt, og et **støt eller krasj** kostet minst `max(0,05 s, 40 % av tapet)` | støtet er svingets historie, før bilene | tap |
| tapt, og **bilens andel** er 60 % eller mer | **bilen**: dens trekkraft nedover rettstrekningen, dens grep gjennom midten, eller dens bremser - den største delen; med førerens del (≥ 0,03 s) sagt som "Den andre X s: …" | tap |
| tapt, og én ikke-delt **bilkontrollfeil** kostet minst `max(0,05 s, 40 %)` | den feilen (se under), med hvordan tiden flyttet seg rundt den | tap |
| tapt, og en **lengre flytur** kostet minst `max(0,05 s, 40 %)` | flyturen | tap |
| tapt, en trade, vunnet til toppunktet | **for fort inn, sakte ut**: utgangens årsak; gi fra deg litt inngang for å bli rundet og flat tidligere, med den andre rundens bremse- og full-gass-punkter. Dens rot (`cause`, det [statistikken](race-course-statistics.md) teller): bremse senere, når den bremset mer enn noen meter senere enn den andre; ellers utgangens årsak | tap |
| tapt, en trade, tapt til toppunktet | **ga bort mer på vei inn enn utgangen vant tilbake**: inngangens årsak, som også er dens rot (`cause`); behold utgangen, tap mindre på vei inn | tap |
| tapt, løftet på rettstrekningen, og den kjørte delen over halvparten av tapet | **ikke full gass på rettstrekningen**: andelen av den med full gass mot den andres, hvor og hvor lenge løftet var | tap |
| tapt, bilenes trekkraft over 60 % av tapet og rettstrekningen over halvparten | **bilens trekkraft nedover rettstrekningen** (med begge bilenes trekkraft ved 160 km/t) | tap |
| tapt ellers | årsaken til halvdelen som tapte mest (til toppunktet ≥ etter det: inngangens; ellers utgangens). Saktere ut bare fordi saktere gjennom midten (med mer enn 1 m/s): midtens årsak i stedet | tap |

Et funn på et tap kan også avsluttes med **Også:** - nedbremset fart med full gass, eller et løft på rettstrekningen - når den kjørte delen av rettstrekningen kostet mer enn 0,04 s og det ikke allerede var årsaken.

Funnene sorteres med tapene først, dyrest først; deretter gevinster og like svinger.

### Årsaker på vei inn {#causes-on-the-way-in}

`entryCause`, den første som gjelder (forskjeller i minimumsfart er i m/s; "5 m" er grensen for at et tidligere/senere punkt skal telle):

| # | Årsak (feil) | Regel |
|---|---|---|
| 1 | et støt eller krasj på vei inn | et ikke-delt støt som starter innen 10 m etter det saktest punktet |
| 2 | **nesten stoppet** (hendelse) | lavest fart under **60 %** av det bilens grep tillater der den andre gikk gjennom (`v_annen · √(grep_min / grep_annen)` når den andre bilen har mer grep, ellers den andres fart), den andre runden over 8 m/s: en snurr, kontakt eller et bommet sving |
| 3 | en bilkontrollfeil på vei inn | en ikke-delt låsing, presing, snurr eller slide som ikke er på gass, som starter innen 10 m etter det saktest punktet, koster ≥ 0,02 s |
| 4 | en lengre flytur før det saktest punktet | se [rally](#rally-rotation-and-flights) |
| 5 | **løftet** der den andre holdt flat eller løftet 5 m eller mer senere | denne runden bare løftet |
| 6 | **bremset der den andre bare løftet** eller holdt flat | og var mer enn 0,5 m/s saktere gjennom midten |
| 7 | **bremset forsiktig** | den bremset (ikke løftet), hadde rom til å bremse hardere - med dekkdata, dens låsingsslip under **60 %** av slippet der denne bilens bremser gir sitt beste; uten dem, en toppretardasjon under **85 %** av det den viser ved den farten - pedalen under 0,95, og den andre rundens toppretardasjon mer enn **15 %** høyere |
| 8 | **bremset tidlig** - eller **bilens bremser** | bremset mer enn 5 m før den andre. I en annen bil med bremser over 5 % sterkere, og med høyst 10 m å gå på mot avstanden denne bilen trenger ved sin egen retardasjon: bilens bremser. Ellers bremset tidlig, med "Brems senere - omtrent N m" (i en annen bil, metrene utover det den trenger) |
| 9 | **rullet** | mer enn 10 m uten noen pedal, og 5 m mer enn den andre |
| 10 | **saktere gjennom midten** | mer enn 0,5 m/s saktere i det saktest punktet; delt etter `v² = a·R` (under) |
| 11 | **kom inn saktere** | over 1 m/s saktere ved bremsepunktet, ikke bremset tidlig: avgjort før - av svinget før og bilens trekkraft, eller av en flytur i svinget før som var 0,2 s lengre. Bilens når bilene er ulike |
| 12 | saktere til toppunktet | ellers: slipp bremsen jevnere og rull inn mer fart i midten |

**Saktere gjennom midten** (`middleSplit`): hver runde sin radius i sitt saktest punkt måles fra sin egen sti (±8 m), sidesakselerasjonen som `v²/R`, og

`ln(v_annen / v_min) = ½ ln(a_annen / a_min) + ½ ln(R_annen / R_min)`.

- Radiusen forklarer **halvparten eller mer**: **for stram linje** - "bruk mer av veien", med begge radiene og andelen.
- Ved bilens grense (sliding over 10° driftvinkel på asfalt / 20° på løst underlag, eller sidesakselerasjon minst 90 % av det den holder ved den farten) og den andre bilen har over 5 % mer grep: **bilens grep**; beskytt utgangen i stedet.
- Slidet gjennom det (drift over 10° / 20°), og den andre runden gjorde ikke det (dens inngangsdrift minst 4° mindre): **sideveis** - forbi grepet, ikke under det; kom inn litt saktere. Sagt som bilens når denne bilen fanger bakenden minst én gang per runde mer enn den andre.
- I en annen bil som har under **96 %** av den andres grep, og runden holdt innen 1 m/s av `v_annen · √(grep_min / grep_annen)`: **bilens grep** - "å bremse senere lukker ikke det".
- Ellers **grep til overs**: sidesakselerasjon mot den andres på en lignende radius, og det denne bilen holder; ta med mer fart inn til toppunktet. Der denne bilens bakende slipper før grepet er brukt opp (slidene begynner under 85 % av grepet, og runden var på 80 % av det), finn resten i små steg.

### Årsaker på vei ut {#causes-on-the-way-out}

`exitCause`, den første som gjelder:

| # | Årsak (feil) | Regel |
|---|---|---|
| 1 | en bilkontrollfeil på vei ut | ikke-delt hjulspinn, snurr, slide eller støt som slutter ved eller etter 10 m før det saktest punktet |
| 2 | **nedbremset fart** | mer enn 1 m/s mer fart tapt med full gass enn den andre; over **7 m/s (25 km/t)** "mer som kontakt eller en snurr enn en slide" |
| 3 | **dreide bilen feil** (løst underlag) | se [rally](#rally-rotation-and-flights) |
| 4 | **på kraften senere** | gass på mer enn 5 m senere, også regnet fra hver runde sitt eget saktest punkt (en runde med senere saktest punkt skyldes ikke en sen gass) |
| 5 | **nølte på gassen** | flere gassdykk enn den andre |
| 6 | **kjørte vidt og ventet** | mer enn 1,5 m utenfor den andre der begge var flate, og full gass mer enn 5 m senere fra sitt eget saktest punkt |
| 7 | **full gass senere** | full gass mer enn 5 m senere, også fra sitt eget saktest punkt; med bilens akselerasjon der |
| 8 | **bilens kjøring** | i en annen bil som trekker under 95 % av den andre ved den farten, og trekkraften forklarte noe av rettstrekningen |
| 9 | **saktere ut av svinget** | ellers: et senere toppunkt, så bilen er rett tidligere |

Når de to rundene var i ulike gir i det saktest punktet, slutter tipset med "Gir N i toppunktet; den andre brukte M."

### Feil i bilkontrollen og støt {#car-control-faults-and-impacts}

En feil fra [Bilhendelser](race-control-events.md) som årsak: en låsing er en *bremse*-årsak, hjulspinn eller slide på gass er en *utgangs*-årsak, resten *inngang*. Et støt etter det saktest punktet er *utgang*, før det *inngang*. Tipset er hendelsens eget, deretter "Det kostet omtrent X s til 40 m etter den" (eller "til bilen fikk farten tilbake" for et støt). En låsing med et bremsepunkt mer enn 5 m tidligere enn den andre, legger til at runden også bremset tidlig - med hjulene i ro hadde den ikke trengt det.

### Rally: rotasjon og flyturer {#rally-rotation-and-flights}

På **løst underlag**, med driftvinkler på begge rundene, og denne runden på kraften (eller flat) mer enn 5 m senere:

- **Dreide bilen mindre**: den andre hadde bilen dreid **12°** eller mer ved sitt saktest punkt, og minst **8°** mer enn denne runden. Tips: et løft eller et tramp av venstrefotbremsen når den svinger inn, med den andre rundens håndbrekkpunkt når bare den brukte et, eller håndbrekket i et sving saktere enn 15 m/s (54 km/t).
- **Dreide den for langt**: denne runden hadde den dreid 12° eller mer, og minst **12°** mer enn den andre: den måtte rettes opp før kraften kunne gå ned.

**En lengre flytur**: i luften 0,2 s eller mer lengre enn den andre, og koster minst 0,03 s fra 10 m før avsprang til 40 m etter landingen (eller seksjonens slutt). Før det saktest punktet er det en inngangsårsak; det blir svingets historie når det forklarer 40 % eller mer. Tipset: hold gassen på ved avsprang, ta toppen litt saktere eller med et tramp av bremsen.

### Starten {#the-start}

Før det første svinget, på en sprint eller når en av rundene startet fra stillstand (under 5 m/s der begge er først på aksen) eller ved en rennstart (under 60 % av den andres fart), er kjøringen til det første bremsepunktet et eget funn (sving 0) når den skiller seg med mer enn 0,03 s: *Starten*, *Rennstarten* eller *Til det første svinget*. Et tap der legges på situasjonen (*kontekst*) når den ene runden startet med rennstart og den andre i fart, på bilen når rundene er i ulike biler, og ellers på føreren. Tips: i en annen bil fra stillstand, "mest bilen"; en stille start i samme bil: start med mindre hjulspinn og skift på toppen av effektbåndet; en rennstart: sammenlign den med en annen første runde; en flyvende start: en bedre utgang fra det siste svinget føres over streken.

## Den kjørte linjen {#the-driven-line}

`lineMetrics`, per runde og seksjon (ikke for blandede komplekser), bare fra posisjoner (jevnet ±2 målepunkter) over svingvinduet:

| Mål | Regel |
|---|---|
| krumning | retningsendring over ±8 m av rundens egen sti |
| **strammeste radius** | 1 / topp-krumningen |
| **innsving** / **utsving** | der krumningen først / sist overstiger en femdel av sin topp |
| **midt** | der runden hadde svinget halvparten av sin retningsendring |
| radius inn / ut | meter kjørt over halve retningsendringen, før / etter midten |
| **form** | strammeste radius delt på gjennomsnittsradiusen under svingen: under **0,55** en **V**, over **0,75** en **U**, mellom "U/V" |
| **toppunkt** | radius ut delt på radius inn: over **1,25** sent, under **0,8** tidlig, ellers midt |
| **fartstoppunkt** | det saktest punktet mer enn **15 m** før midten: sakte inn, fort ut; mer enn 15 m etter: bremser fortsatt forbi midten |

Mot den andre runden: hvor mye innenfor (+) eller utenfor den kjørte ved innsving, gjennom den strammeste delen og der begge var flate (sagt fra 1 m); der hver svingte inn (sagt fra 8 m).

### Hvilken linje som passer denne bilen her {#which-line-suits-this-car-here}

`lineFor`, fra hva svinget leder inn på og bilens karakter i dette svinget:

- **kraft-mot-grep** = bilens akselerasjon med full gass ved utgangsfarten delt på dens grep ved minimumsfarten (fra dens omhylling). **Point and shoot** ved **0,45** og over; **momentum** ved **0,25** og under.
- **downforce**: grep ved 151-252 km/t delt på grep ved 54-108 km/t på **1,15** eller mer, for et sving tatt ved **144 km/t** (40 m/s) eller raskere - da er det et momentum-sving uansett kraft. Ikke bedømt på løst underlag.

| Svingtype | Bil | Linje |
|---|---|---|
| etter en rettstrekning | point and shoot / annen | V / U, toppunkt i midten: "bremsesonen er premien" |
| mellom to rettstrekninger | momentum / annen | U / V, sent toppunkt |
| forbindelse | momentum / annen | U / V, toppunkt i midten: "kjør den for utgangen av det neste" |
| inn på en rettstrekning | momentum (eller et raskt downforce-sving) | bred, rund U, litt sent toppunkt |
| inn på en rettstrekning | point and shoot | V: brems rett, sving inn sent, roter i en kort, stram midtdel, rett tidlig |
| inn på en rettstrekning | mellom | U med sent toppunkt: sakte inn, fort ut |

Der utgangen betyr noe (inn på en rettstrekning, mellom to), legger drivlinjen til en setning: **FWD** - roter den på bremsene, legg på kraft bare når hjulet retter seg ut; **RWD** med kraft-mot-grep på 0,35 eller mer - rett den opp før full gass; **AWD** - den kan ta kraft mens den fortsatt svinger. På løst underlag legger hver linje til: dreie bilen på vei inn.

Setningen sier så hva runden kjørte, og om det passer: *sen saktest punkt binder opp utgangen* eller *et tidlig toppunkt binder opp utgangen* der et sent toppunkt var ønsket og runden verken tok toppunktet sent eller var saktest tidlig; *runder enn denne bilen vil* der en V var ønsket; *kantet enn denne bilen vil* der en U var ønsket; ellers *det passer*.

## For utviklere {#for-developers}

Kode: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Resonnementet og kildene: [metoden](race-analytics.md).
