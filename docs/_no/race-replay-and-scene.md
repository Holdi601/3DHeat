---
title: "Replay og 3D-scenen"
parent: "Løpsanalyse"
nav_order: 52
lang: "no"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay og 3D-scenen

Spill rundene av sammen, som et løp, og se hvor den ene bilen kjører fra. Alt du ser i 3D-visningen på fanen **Løpsanalyse** er beskrevet her: de kjørte linjene, fargene på banen, bilene og etikettene.

![Cause map with the cars lined up 40 m before a corner: coloured track, two cars and the flag post](../assets/img/en/race-replay-lined-up.webp)

## Replay-klokken {#the-replay-clock}

Én klokke styrer hver runde: sekunder av **referanserunden**. Motoren flytter den framover hvert bilde under avspilling (etter bildetid × replay-hastighet). Ved slutten går den tilbake til 0 når **Løkke** er på, ellers stopper den. Klokken er med vilje ikke en del av lageret, så sidefeltet ikke tegnes om hvert bilde. HUD-et og diagrammene abonnerer på den og oppdateres høyst én gang per bilde.

**Replayets lengde** er den lengste klokken noen runde går: hver runde sin tid (minus forskyvningen i *Stilt opp*), eller referansens tid i *Side om side*.

## Avspillingsbaren {#the-transport-bar}

Under visningen, fra venstre mot høyre:

| Kontroll | Gjør |
|---|---|
| ⏮ | tilbake til starten (også **Home**) |
| ▶ / ❚❚ | spill av / pause (også **K**) |
| hastighet | 0,25×, 0,5×, 1×, 2×, 4× |
| skyveknapp | setter klokken direkte, i steg på 0,01 s |
| klokke | `tid / lengde · meter`: klokken som rundetid, replayets lengde, og hvor langt framme på referansen referansebilen er |
| *Fra streken* / *Stilt opp* / *Side om side* | replay-modusen (under) |
| **Still opp her** | setter hver bil der referansen er nå, og fortsetter derfra |
| **Løkke** | starter på nytt ved slutten (på som standard) |
| **Skjul diagrammer** / **Vis diagrammer** | distansediagrammene under baren |

Knappene er deaktivert til runder er lastet inn (én runde er nok til å spille den av; sammenligninger krever to).

## Replay-moduser {#replay-modes}

Hvordan hver runde sin egen tid følger av klokken:

| Modus | Hver runde sin tid | Hva den viser |
|---|---|---|
| **Fra streken** (`start`) | selve klokken | hver runde fra sin egen start: et løp mellom dem, med gapet som vokser slik det gjorde på banen |
| **Stilt opp** (`anchor`) | klokken pluss rundens forskyvning | hver bil på samme sted i samme øyeblikk, og så sluppet - det som skjer fra det punktet, ikke fra rundens start |
| **Side om side** (`locked`) | tidspunktet da runden nådde referansens nåværende distanse | hver bil holdt på referansens distanse hele runden: farter og pedalbruk sammenlignet meter for meter |

Bruk den når:

- **Fra streken**: du vil se hvem som er foran, og hvordan gapet vokser.
- **Stilt opp**: du vil vite hva som skjer i ett sving eller på én rettstrekning, med alle på samme nivå der.
- **Side om side**: du vil sammenligne hva førerne gjør med pedaler og ratt på samme sted på banen.

**Forskyvninger i *Stilt opp*:** for et ankerpunkt på `s` meter langs referansen, er hver runde sin forskyvning dens egen tid ved `s` minus referansens tid ved `s`, begge lest fra de utjevnede rundene (se
[én distanseakse](race-corner-analysis.md#one-distance-axis)). En runde som ikke dekker `s`, beholder forskyvning 0. Når du velger *Stilt opp* fra modusknappene, ankres det ved referansens nåværende distanse.

En hvit stolpe med et flagg (14 m høy) markerer ankeret i *Stilt opp*-modus.

### Stille opp {#lining-up}

| Handling | Anker | Klokke |
|---|---|---|
| **Still opp her** | der referansen er nå | uendret |
| Shift+klikk på diagrammene | meteren du klikket på | 1,5 s før referansen når den |
| et funn i *Hvor du kan bli bedre*, et nummerert merke på banen, en rad i *Sving for sving* med et funn | 40 m før der funnets årsak begynner | 1,5 s før det punktet; spiller deretter |
| en bilhendelse, et støts etikett | 40 m før hendelsen | 1,5 s før; spiller deretter |
| en runde i banestatistikken | som dens funn eller hendelse | som over, med den runden fokusert |

Når du ser på et funn, rammer kameraet det også inn - en kule rundt midten av funnets område, med radius det største av 40 m og halve lengden pluss 30 m (60 m for en hendelse) - med mindre kameraet følger en bil.

### Jagekamera {#chase-camera}

⌖ i rundelisten gjør at kameraet følger den bilen: 2,5 + 4 × bilstørrelse meter bak den og 0,9 + 1,1 × bilstørrelse meter over, sett langs kjøreretningen, vippet ned mot bilen, og jevnet (20 % av veien hvert bilde) så det ikke ryster med hver vissel. ⌖ igjen slipper den. Den jagede bilen tegnes litt lysere, med en hvit ring på bakken, og kortet er uthevet.

## Visningsdelen {#the-view-section}

| Kontroll | Standard | Gjør |
|---|---|---|
| **Linjer** / **Tidskart** / **Årsakskart** / **Feilkart** | Tidskart | hva som males langs banen (under); *Linjer* maler ingenting |
| forklaring | - | *vinner ↔ taper* for tidskartet, årsaksfargene for årsakskartet, *få runder ↔ flest runder* for feilkartet |
| **Kjørte linjer** | på | hver synlige runde sin linje i sin farge |
| **Biler** | på | bilene, og kildene til HUD-kortene |
| **Dekk og hjuloppheng** | på | dektemperatur, slipringer, fjæringsstenger og andre glyfer per hjul, og takbelysning på bilene |
| **Etiketter** | på | sving-navn, nummererte merker, støtetiketter, feilkartets svingetiketter |
| **Bane ut fra rundene** | på | en veioverflate for en bane uten utpakket modell (skjult mens en banemodell er lastet) |
| **Alle verdier på kortene** | av | hver kanal som står oppført på hvert HUD-kort |
| **Ekte bilformer** | på | hver bil i formen til sin motpart (se [Bilene](#the-cars)); av: den åpne enseteren, som ikke skjuler noe av telemetrien |
| **Bilstørrelse** | 1× | 1× til 10× i steg på 0,5; 1× er bilens virkelige størrelse, like lang og bred som i spillet. Ingenting unntatt denne skyveknappen endrer den |

## Kjørte linjer {#driven-lines}

Hver synlige runde sin sti gjennom sine egne prøver, i sin farge, tegnet
0,12 m under den innspilte posisjonen (en bils innspilte posisjon er referansepunktet, 0,28 til 0,47 m over veien på utpakkede Forza-baner). Et punkt beholdes hver 1,5 m; med mer enn 10 synlige runder beholder de runder som ikke er sett på, ett punkt hver 6 m (hvert hjørne sendes til GPU-en hvert bilde).

## Kartene {#the-maps}

Alle tre er bånd langs **referanse**-stien, 0,2 m under de innspilte posisjonene, ett firkantet felt per 2 m rutenettsteg.

### Tidskart (`where`) {#time-map-where}

For den fokuserte runden: sekunder vunnet eller tapt per meter mot runden den sammenlignes med der (den beste i sin klasse, eller for referansen den raskeste andre runden gjennom hvert segment), fra endringen i det utjevnede deltaet per rutenettsteg, jevnet over ±10 m. Rødt der den taper tid, grønt der den vinner, grått imellom. Fargeskalaen er 95. persentil av absoluttverdiene, så topper klippes og det meste av runden er innenfor skalaen. 6 m bred.

### Årsakskart (`why`) {#cause-map-why}

For den fokuserte runden: hvert tap males over området der dens **årsak** er (ikke der tiden vises), farget etter årsakens gruppe, med det dyreste funnet som vinner der to overlapper. Bredde `3 + 9·√(kostnad / største kostnad)` meter; der ingenting ble tapt, en grå 2 m stripe. Funnet som er valgt i *Hvor du kan bli bedre*, males hvitt.

| Gruppe | Farge | Funn |
|---|---|---|
| bremsing | oransje | førertap i bremsefasen |
| inngang | magenta | førertap på vei inn og gjennom midten |
| utgang | blå | førertap på vei ut |
| rettstrekning | gul | førertap på rettstrekningen |
| bil | grå | det bilen forklarer |
| kontekst | mørkegrå | situasjonen (en rennstart mot en flyvende runde) |

### Feilkart {#mistake-map}

Hvor mange av alle rundene (i klassene valgt i banestatistikken) som gjorde en feil ved hver meter - av alle slag, eller bare den som er valgt i statistikken. Hver runde telles én gang per meter; hver feil sitt område utvides med 6 m på hver side, så en kort feil vises. Bredde `3 + 10·(runder / flest runder)` meter og en farge fra dempet brunt til klart oransje; grått 2 m der ingen runde gjorde en feil. Se [Banestatistikk](race-course-statistics.md#the-mistake-map).

## Bane ut fra rundene {#track-from-the-laps}

For et spill der banen ikke er pakket ut, tegnes en vei under linjene: så bred som rundene er spredt over referansen (sideforskudd innen 25 m telles) pluss 2 m på hver side, minst 4 m på hver side av referanselinjen, jevnet over ±8 rutenettpunkter (±16 m), i asfaltgrått med lyse kantlinjer, 0,3 m under de innspilte posisjonene. Skjult mens en banemodell er lastet inn i **Nivå**.

## Støt og krasj på banen {#hits-and-crashes-on-the-track}

Hver synlig runde sine støt og krasj (se [Bilhendelser](race-control-events.md#hits-and-crashes)) merkes der de skjedde, når linjer eller biler tegnes: en spiss stjerne - rød for et krasj, gul for et støt - som står på en stolpe, med en ring i rundens farge ved foten, størrelsen følger bilstørrelsen (krasj større). Når en bil passerer øyeblikket for et støt, sprer en støtring seg fra det i 0,8 s.

## Hjelpemodus {#help-mode}
**?** ved siden av språkvelgeren, eller tasten **?** eller **F1**, slår på en nøkkel til hver farge på skjermen, på alle tre fanene ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Valget blir i denne nettleseren.

- **Nøkkelen** i hjørnet av visningen lister fargene for fanen og modusen i bruk. Hver fargeskala kommer fra der visningen henter den, så en varmeskala du redigerte, vises som redigert. På løpsfanen listes bare det de innlastede rundene har.
- **Hvert bilkort** får en tabell over det som tegnes på hjulene, etter navn, med hvert hjuls verdi i fargen den tegnes i.
- **Bilen i fokus** får en etikett ved hvert hjul som sier det samme, plassert ute ved hjørnene. Skjult når bilen er for liten på skjermen til at de får plass.

## Bilene {#the-cars}

**Hver bil i sin egen form**, i sin runde sin farge og i sin virkelige størrelse. Formene kommer fra en bilfil, laget én gang på maskinen spillet står på:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Uten en slik fil tegnes hver bil som **visningens egen bil** av sin type og tidsalder: sedan, coupé, hatchback, stasjonsvogn, sportsbil, supercar, muscle car, terrengbil, pickup, varebil eller microcar, hver som en klassiker (før 1980), fra 80- og 90-tallet, eller moderne ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). De bygges her ut fra generelle proporsjoner: ingen logoer, ingen modellnavn og ingenting fra noe spills filer, så de følger med visningen. Typen kommer fra bilens navn, tidsalderen fra årstallet i det; en bil med ingen av delene tas fra sin klasse. Omtrent hundre virkelige generasjoner kjennes igjen på sin publiserte lengde, bredde, høyde og akselavstand ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); en linje hver, avrundet), så en 3-serie fra 1990-tallet får den bilens størrelse og holdning, fortsatt som en vanlig form uten emblem eller grill.

Bilfilen lages på din egen maskin fra din egen kopi av spillet. Den holder en lavdetaljert modell av hver bil, omtrent 900 trekanter, med hjulenes posisjoner (se [utpakkerens `cars`-kommando](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Last inn bilfil...** i visningsinnstillingene, eller å slippe filen på fanen for løp, laster den; den blir i denne nettleseren. Den holder spillets former, så den er ikke noe å gi videre, og visningen leverer ingen.

Hvilken bil som står for en runde sin bil, finnes ut fra det som er lastet hver gang og lagres aldri, så en bil uten motpart i dag får sin egen så snart en nyere fil har den ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Rundens bil | Tegnes som |
|---|---|
| nummeret står i filen for samme spill | nettopp den bilen |
| samme merke, og et ord av modellen i navnet | den modellen, nærmest i år |
| samme merke, samme generasjon | merkets bil nærmest i år |
| alt annet, med en bilfil | merkets nærmeste hvis det finnes, ellers samme karosstype, nærmest i år |
| en åpenhjulsbil, etter navnet | enseteren nedenfor |
| ingen av de to første, og visningen kjenner bilen på størrelsen | visningens egen bil i den virkelige bilens størrelse, med eller uten fil |
| alt annet uten fil | visningens egen bil av den typen og tidsalderen |

Så en runde i et annet spills BMW 3-serie fra 1990 viser en BMW fra omtrent det året, og en bil nyere enn filen viser sin nærmeste slektning inntil filen lages på nytt. Rundens verktøytips, og linjen under bilstørrelsen for den fokuserte runden, sier hva den tegnes som, og hvor nær det er.

Visningens egne biler har mørke vinduer. Modellene i en bilfil er én farge over alt, fordi filen ikke har lakk eller glass å gå etter. Hjulene, baklysene, lampene og telemetriglyfene under tegnes som på enseteren; støtstangen går opp på utsiden av hjulet, der den kan sees, og vinkelarmene utelates.

**Enseteren** er en åpenhjulsbil i rundens farge, så forsiden er tydelig fra hvilken som helst vinkel og ingenting skjuler hjulene: karosseriskall, motordeksel, sidekasser, førerrom med hjelm, halo, bunn, for- og bakvinger; fire runde hjul, forhjulene vridd av styringen (opptil 0,5 rad ved full utslag), hver på to vinkelarmer med oppreist, styrestang (foran) eller drivaksel (bak), og en støtstang. Modellen senkes 0,3 m fra den innspilte posisjonen, så hjulene står på veien, og skaleres av **Bilstørrelse**.

**Karosseriet beveger seg på fjærene sine**: når runden har alle fire fjæringsutslag, synker hvert hjørne med sitt utslag (overdrevet til 0,12 m fra full utfjæring til full innfjæring, så det vises fra et jagekamera), og karosseriet synker, stamper og ruller på planet gjennom de fire.

**Det som tegnes fra telemetrien** (med *Dekk og hjuloppheng* på) følger [kanaltabellen](race-charts-and-hud.md#the-channel-table):

| Glyf | Fra | Tegning |
|---|---|---|
| dekkfarge | `tireTemp` | selve dekket, blått kaldt → cyan → grønt arbeidstemperatur → gult → rødt varmt, over 40-130 °C |
| slipring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (den største) | en ring på bakken under hjulet, grønn med grep i hånden, gul ved 0,66, rød ved 1 (kanten av grepet slik spillet rapporterer det); svak under 0,3 |
| fjæringsstang | `suspension` (0..1) | fjærstangen farget etter utslag: blå utstrakt, hvit midt, rød sammentrykt |
| bremseglød | `brakeTemp` (100-900 °C) | en skive på hjulets ytterside, mørk til oransje |
| slitasjebånd | `tireWear` (0..1) | et bånd rundt kanten av mønsteret, hvitt nytt → rødt slitt |
| laststolpe | `wheelLoad` (0-12 000 N) | en stolpe ved siden av hjulet like høy som lasten |

Bremselysene (regnlys og vingeendeplater) lyser med bremsepedalen. Hver `lamp`-kanal som er på (over halvparten av sitt område), tenner en lampe over luftboksen i sin farge: ABS i bruk, sporingskontroll i bruk, DRS, pit-begrenser, håndbrekk, i luften.

**I en mengde** (mer enn 10 synlige), tegnes de bilene som ikke er sett på, enkelt: karosseri, vinger, hjul og bremselys bare.

## Etiketter {#labels}

Festet til banen og plassert hvert bilde fra kameraets projeksjon (utenfor skjermen eller bak kameraet, skjult). Med **Etiketter** på:

| Etikett | Hvor | Klikk |
|---|---|---|
| svingnavn (`T1`, `T2` …) | over hvert svings toppunkt på referansen | - |
| nummererte merker 1-5 | den fokuserte rundens fem største førertap, midt i hver årsaks område, kantet i årsaksfargen; hold musen over for tittel og kostnad | still opp og spill av det funnet |
| støt-/krasjetiketter | over hvert utbrudd på den **fokuserte** runden: "Krasj −45 km/t" / "Støt −12 km/t"; hold musen over for hele beskrivelsen og tipset | still opp og spill av støtet |
| feilkartets svingetiketter (i stedet for svingnavn og merker, når kartet er feilkartet) | hvert svings toppunkt: "T3 · 5/40 tidlig bremsing" (den vanligste feilen, runder som gjorde den / runder som kjørte svingen), "T3 · 5/40" når én type er valgt, "T3 · ren" når ingen; hold musen over for svingets tap og dets fem vanligste feil | åpne eller lukk det svinget i banestatistikken |

## Speilvendte verdener {#mirrored-worlds}

Visningsprogrammets verden er høyrehåndet med Y opp: sett ovenfra svinger en bil til venstre når retningen `atan2(dx, dz)` vokser. Et spill med en venstrehåndet verden - Forza blant dem - kommer speilvendt ut: hver høyresving tegnet som et venstresving, både bane og runder.

Rundene sier det selv ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): hver runde gås gjennom noen meter (3 m) om gangen, og svingingen av stien sammenlignes med kompresjonen i den ytre fjæringen (`suspension.FR` minus `suspension.FL`) og, uten fjæring, med styringen (positiv til høyre i hver adapter). En runde som svinger mindre enn π totalt, sier ingenting; bevis teller når det overstiger 2 % av svingingen. Rundene stemmer; et uavgjort er "kan ikke si".

Når rundenes dom er uenig med den nåværende aksinversjonen (et odde antall inverterte akser i **Kamera og scene → Inverter verdensaksen**), sier seksjonen **Runder** det under listen:

- spillet er speilvendt og ingenting er invertert: "Disse rundene styrer til høyre der banen tegnes som en venstresving …" med **Inverter X**;
- aksene er inverterte men rundene er ikke speilvendt: "De inverterte aksene tegner disse rundene speilvendt …" med **Tilbakestill aksene**.

Bare tegningen endres - en speiling lagt inn i visningsmatrisen; dataene, analysen og alle koordinater verktøyene viser, forblir spillets egne. Inverteringen lagres i nettleseren. Analysen navngir svinger venstre eller høyre med samme måling (en ukjent verden tas som speilvendt, slik Forzas er).

## For utviklere {#for-developers}

Kode: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Hvor en bil er på et øyeblikk {#what-a-car-is-at-a-moment}

`stateAt` interpolerer hver kanal mellom de to prøvene rundt rundens tid. Kanaler som tar trinn (gir, flagg) tar nærmeste prøve. En runde som er ferdig, parkeres på streken.

**Retning.** Kjøreretningen kommer fra posisjoner noen meter fra hverandre (minst 2 m på hver side, så en vissel ikke vrir bilen). Karosseriets retning kommer fra spillets gir bare når den er tilpasset kjøreretningen - fortegn og forskyvning, ved sirkulært gjennomsnitt over prøver raskere enn 10 m/s (minst 20) - og bare hvis den da stemmer med den (sirkulær varians under 0,05, omtrent 18° spredning); ellers peker karosseriet langs kjøreretningen. Det holder et slide synlig (karosseri og kjøring fra hverandre) uten å stole på et spills vinkelkonvensjon.

**Styring og sider.** Hvilken vei et positivt styreutslag vrir bilen, og hvilken side spillets høyrehjul hører til, måles fra runden: styringen mot stiens sving, og hvilken side sin fjæring som trykkes sammen på utsiden av svingene (uten fjæringsdata tas Forza-spill som speilvendte).
