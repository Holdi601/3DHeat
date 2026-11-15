---
title: "Replay og 3D-scenen"
parent: "Løbsanalyse"
nav_order: 52
lang: "da"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay og 3D-scenen

Afspil dine omgange sammen, som et løb, og se, hvor den ene bil trækker fra. Alt, du ser i 3D-visningen på fanen **Løbsanalyse**, er beskrevet her: de kørte linjer, farverne på banen, bilerne og etiketterne.

![Årsagskort med bilerne stillet op 40 m før et sving: farvet bane, to biler og flagstangen](../assets/img/en/race-replay-lined-up.webp)

## Replay-uret {#the-replay-clock}

Ét ur styrer hver omgang: sekunder af **referencens** omgang. Motoren rykker det frem for hvert billede, mens der afspilles (med billedtid × replay-hastighed); ved slutningen går det tilbage til 0, når **Gentag** er slået til, ellers stopper det. Uret er bevidst ikke en del af lageret, så sidepanelet ikke tegnes om for hvert billede; HUD'et og grafene abonnerer på det og opdateres højst én gang pr. billede.

**Replayets længde** er den længste tid, nogen omgang løber på uret: hver omgangs tid (minus dens forskydning i *Stillet op*), eller referencens tid i *Side om side*.

## Afspilningslinjen {#the-transport-bar}

Under visningen, fra venstre mod højre:

| Kontrol | Gør |
|---|---|
| ⏮ | tilbage til starten (også **Home**) |
| ▶ / ❚❚ | afspil / pause (også **K**) |
| hastighed | 0,25×, 0,5×, 1×, 2×, 4× |
| glideskyder | sætter uret direkte, i trin på 0,01 s |
| ur | `tid / længde · meter`: uret som omgangstid, replayets længde og hvor langt referencen er kommet langs banen |
| *Fra stregen* / *Stillet op* / *Side om side* | replay-tilstanden (nedenfor) |
| **Stil op her** | sætter hver bil, hvor referencen er nu, og fortsætter derfra |
| **Gentag** | starter forfra ved slutningen (slået til som standard) |
| **Skjul grafer** / **Vis grafer** | distancegrafene under linjen |

Knapperne er deaktiveret, indtil omgange er indlæst (én omgang er nok til at afspille den; sammenligninger kræver to).

## Replay-tilstande {#replay-modes}

Hvordan hver omgangs egen tid følger af uret:

| Tilstand | Hver omgangs tid | Hvad den viser |
|---|---|---|
| **Fra stregen** (`start`) | selve uret | hver omgang fra sin egen start: et løb mellem dem, med gabet, der voksede, som det gjorde på banen |
| **Stillet op** (`anchor`) | uret plus omgangens forskydning | hver bil på samme sted i samme øjeblik, og så sluppet – det, der sker fra det punkt og frem, ikke fra omgangens start |
| **Side om side** (`locked`) | tidspunktet, hvor omgangen nåede referencens aktuelle distance | hver bil holdt ved referencens distance hele omgangen: fart og input sammenlignet meter for meter |

Brug den, når:

- **Fra stregen**: du vil se, hvem der er foran, og hvordan gabet vokser.
- **Stillet op**: du vil vide, hvad der sker i ét sving eller på én langside, med alle startet lige der.
- **Side om side**: du vil sammenligne, hvad førerne gør med pedaler og rat på det samme sted på banen.

**Forskydninger i *Stillet op*:** for et anker ved `s` meter langs referencen er hver omgangs forskydning dens egen tid ved `s` minus referencens tid ved `s`, begge læst fra de flugtede omgange (se [én distanceakse](race-corner-analysis.md#one-distance-axis)). En omgang, der ikke dækker `s`, beholder forskydning 0. Valg af *Stillet op* i tilstandsknapperne ankrer ved referencens aktuelle distance.

En hvid stolpe med et flag (14 m høj) markerer ankeret i *Stillet op*-tilstanden.

### Stille op {#lining-up}

| Handling | Anker | Ur |
|---|---|---|
| **Stil op her** | hvor referencen er nu | uændret |
| Shift+klik på grafene | den klikkede meter | 1,5 s før referencen når den |
| en pointe i *Hvor du kan forbedre dig*, et nummereret mærke på banen, en række i *Sving for sving* med en pointe | 40 m før dér, hvor pointens årsag begynder | 1,5 s før det punkt; spiller så af |
| en bilkontrol-hændelse, et støds etiket | 40 m før hændelsen | 1,5 s før; spiller så af |
| en omgang i banestatistikken | som dens pointe eller hændelse | som ovenfor, med den omgang i fokus |

Ser man på en pointe, indrammer kameraet den også – en kugle omkring midten af pointens område, med en radius på det største af 40 m og halvdelen af dens længde plus 30 m (60 m for en hændelse) – medmindre kameraet følger en bil.

### Følgekamera {#chase-camera}

⌖ i omgangslisten får kameraet til at følge den bil: 2,5 + 4 × bilstørrelse meter bag den og 0,9 + 1,1 × bilstørrelse meter over, kigger i dens kørselsretning, vippet ned mod bilen og udjævnet (20 % af vejen pr. billede), så det ikke ryster ved hver vippe. ⌖ igen slipper den. Den fulgte bil tegnes en smule lysere, med en hvid ring på jorden, og dens kort fremhæves.

## Visningssektionen {#the-view-section}

| Kontrol | Standard | Gør |
|---|---|---|
| **Linjer** / **Tidskort** / **Årsagskort** / **Fejlkort** | Tidskort | hvad der males langs banen (nedenfor); *Linjer* maler intet |
| forklaring | - | *vinder ↔ taber* for tidskortet, årsagsfarverne for årsagskortet, *få omgange ↔ flest omgange* for fejlkortet |
| **Kørte linjer** | til | hver synlig omgangs linje i dens farve |
| **Biler** | til | bilerne, og kildene til HUD-kortene |
| **Dæk og affjedring** | til | dækkets temperatur, slipringe, affjedringens stødstænger og andre glyffer pr. hjul, og takbelysning på bilerne |
| **Etiketter** | til | sving-navne, nummererede mærker, stødetiketter og fejlkortets svingetiketter |
| **Bane ud fra omgangene** | til | en vejoverflade for en bane uden udtrukket model (skjult, når en banemodel er indlæst) |
| **Alle værdier på kortene** | fra | hver kanal, der er opført på hvert HUD-kort |
| **Rigtige bilformer** | til | hver bil i formen af dens modpart (se [Bilerne](#the-cars)); fra: den åbne enkeltsædede, som ikke skjuler noget af telemetrien |
| **Bilstørrelse** | 1× | 1× til 10× i trin på 0,5; 1× er bilens rigtige størrelse, så lang og bred, som den er i spillet. Intet andet end denne skyder ændrer den |

## Kørte linjer {#driven-lines}

Hver synlige omgangs sti gennem sine egne samples, i dens farve, tegnet 0,12 m under den optagne position (en bils optagne position er dens referencepunkt, 0,28 til 0,47 m over vejen på udtrukne Forza-baner). Et punkt beholdes hver 1,5 m; med mere end 10 synlige omgange beholder de omgange, der ikke kigges på, et punkt hver 6 m (hvert hjørnepunkt sendes til GPU'en for hvert billede).

## Kortene {#the-maps}

Alle tre er bånd langs **referencens** sti, 0,2 m under de optagne positioner, ét firkant pr. 2 m gitterskridt.

### Tidskort (`where`) {#time-map-where}

For den omgang i fokus: sekunder vundet eller tabt pr. meter over for den omgang, den sammenlignes med på det sted (den bedste i sin klasse, eller for referencen den hurtigste anden omgang gennem hvert delstykke), ud fra ændringen i det flugtede delta pr. gitterskridt, udjævnet over ±10 m. Rødt, hvor tid tabes, grønt, hvor den vindes, gråt derimellem; farveskalaen er 95. percentil af de absolutte værdier, så udsving klippes, og det meste af omgangen er inden for området. 6 m bred.

### Årsagskort (`why`) {#cause-map-why}

For den omgang i fokus: hvert tab males over det område, hvor dets **årsag** ligger (ikke dér, hvor tiden vises), farvet efter årsagens gruppe, og den dyreste pointe vinder, hvor to overlapper. Bredde `3 + 9·√(omkostning / største omkostning)` meter; hvor intet blev tabt, en grå stribe på 2 m. Pointen valgt i *Hvor du kan forbedre dig* males hvid.

| Gruppe | Farve | Pointer |
|---|---|---|
| bremsning | orange | førertab i bremsefasen |
| indgang | magenta | førertab på vej ind og gennem midten |
| udgang | blå | førertab på vej ud |
| langside | gul | førertab på langsiden |
| bil | grå | det bilen forklarer |
| kontekst | mørkegrå | situationen (et løbsstart mod en flyvende omgang) |

### Fejlkort {#mistake-map}

Hvor mange af alle omgangene (i de klasser, der er valgt i banestatistikken) der lavede en fejl ved hver meter – af enhver slags, eller kun den, der er valgt i statistikken. Hver omgang tæller én gang pr. meter; hver fejls område udvides med 6 m til hver side, så en kort vises. Bredde `3 + 10·(omgange / flest omgange)` meter og en farve fra mat brun til lys orange; grå 2 m, hvor ingen omgang lavede en. Se [Banestatistik](race-course-statistics.md#the-mistake-map).

## Bane ud fra omgangene {#track-from-the-laps}

For et spil, hvis bane ikke er udtrukket, tegnes en vej under linjerne: lige så bred, som omgangene spreder sig hen over referencen (sideforskydninger inden for 25 m tæller) plus 2 m til hver side, mindst 4 m til hver side af referencelinjen, udjævnet over ±8 gitterpunkter (±16 m), i asfaltgrå med lyse kantlinjer, 0,3 m under de optagne positioner. Skjult, når en banemodel er indlæst i **Niveau**.

## Stød og styrt på banen {#hits-and-crashes-on-the-track}

Hver synlig omgangs stød og styrt (se [Bilens kontrol: hændelser](race-control-events.md#hits-and-crashes)) markeres dér, hvor de skete, hver gang linjer eller biler tegnes: en stjerne med spidser – rød for et styrt, gul-orange for et stød – stående på en stolpe, med en ring i omgangens farve ved foden, størrelsen efter bilstørrelsen (styrt større). Når en bil passerer øjeblikket for et stød, breder en chokring sig fra det i 0,8 s.

## Hjælpetilstand {#help-mode}

**?** ved siden af sprogvælgeren, eller tasten **?** eller **F1**, tænder en nøgle til hver farve på skærmen, på alle tre faner ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Valget bliver i denne browser.

- **Nøglen** i hjørnet af visningen viser farverne for den fane og tilstand, der er i brug. Hver skala kommer fra der, hvor visningen henter den, så en varmeskala, du har redigeret, vises som redigeret. På løbsfanen vises kun det, de indlæste omgange har.
- **Hvert bilkort** får en tabel over, hvad der tegnes på dets hjul, efter navn, med hvert hjuls værdi i den farve, den tegnes i.
- **Bilen i fokus** får en etiket ved hvert hjul, der siger det samme, placeret ude ved hjørnerne. Skjult, når bilen er for lille på skærmen til, at de passer.

## Bilerne {#the-cars}

**Hver bil i sin egen form**, i sin omgangs farve og i sin rigtige størrelse. Formerne kommer fra en bilfil, lavet én gang på maskinen, spillet ligger på:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Uden en sådan tegnes hver bil som **viewer'ens egen bil** af dens slags og tidsalder: sedan, coupé, hatchback, stationcar, sportsvogn, supercar, muscle car, terrængående bil, pickup, varevogn eller mikrobil, hver som en klassiker (før 1980), fra 80'erne og 90'erne, eller moderne ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Disse bygges her ud fra almindelige proportioner: ingen logoer, ingen modelnavne og intet fra noget spils filer, så de følger med viewer'en. Slagset kommer fra bilens navn, tidsalderen fra årstallet i det; en bil med hverken delen tages fra sin klasse. Omkring hundrede rigtige generationer er kendt ud fra deres offentliggjorte længde, bredde, højde og akselafstand ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); en linje hver, afrundet), så en 3-serie fra 1990'erne får den bils størrelse og holdning, stadig som en almindelig form uden mærke eller kølergrill.

Bilfilen laves på din egen maskine ud fra din egen kopi af spillet. Den holder en modmodel med lav detaljegrad af hver bil, ca. 900 trekanter, med dens hjulpositioner (se [udtrækkerens `cars`-kommando](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Indlæs bilfil...** i visningsindstillingerne, eller at slippe filen på løbsfanen, indlæser den; den bliver i denne browser. Den holder spillets former, så den er ikke noget, man kan videregive, og viewer'en medfølger ingen.

Hvilken bil der står i for en omgangs bil, findes ud fra det, der er indlæst hver gang, og gemmes aldrig, så en bil uden modpart i dag får sin egen, så snart en nyere fil har den ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Omgangens bil | Tegnes som |
|---|---|
| dens nummer findes i filen for samme spil | netop den bil |
| samme mærke, og et ord af modellen i navnet | den model, nærmest i årstal |
| samme mærke, samme generation | det mærkes bil nærmest i årstal |
| alt andet, med en bilfil | det samme mærkes nærmeste, hvis der er en, ellers samme slags karosseri, nærmest i årstal |
| en åben hjulbil, efter dens navn | enkeltsæderen nedenfor |
| ingen af de to første, og viewer'en kender bilen ud fra dens størrelse | viewer'ens egen bil i den rigtige bils størrelse, med eller uden en fil |
| alt andet uden fil | viewer'ens egen bil af den slags og tidsalder |

Så en omgang af en anden spils 1990 BMW 3-serie viser en BMW fra omkring det år, og en bil nyere end filen viser sin nærmeste slægtning, indtil filen laves igen. En omgangs tooltip, og linjen under bilstørrelsen for omgangen i fokus, siger, hvad den tegnes som, og hvor tæt det er.

Viewer'ens egne biler har mørke ruder. En bilfils modeller er én farve over det hele, fordi filen ikke har maling eller glas at gå efter. Hjulene, baglygterne, lamperne og telemetriglyfferne nedenfor tegnes som på enkeltsæderen; stødstangen løber op ad hjulets yderside, hvor den kan ses, og vingestøtterne er udeladt.

**Enkeltsæderen** er en åben hjulbil i omgangens farve, så forenden er tydelig fra enhver vinkel, og intet skjuler hjulene: kassen, motordækslet, sidepodene, cockpittet med en hjelm, halo, bunden, for- og bagvinger; fire runde hjul, forhjulene drejet af styringen (op til 0,5 rad ved fuld rat), hver på to vinkelarme med en ophængningsarm, styrestang (for) eller drivaksel (bag) og en stødstang. Modellen sænkes 0,3 m fra den optagne position, så dens hjul står på vejen, og skaleres af **Bilstørrelse**.

**Karosseriet bevæger sig på sine fjedre**: når omgangen har alle fire affjedringsudslag, sænkes hvert hjørne med sit udslag (overdrevet til 0,12 m fra fuld udfjedring til fuld sammentrykning, så det ses fra et følgekamera), og karosseriet synker, vipper og krænger i planet gennem de fire.

**Hvad der tegnes ud fra telemetrien** (med *Dæk og affjedring* til) følger [kanaltabellen](race-charts-and-hud.md#the-channel-table):

| Glyf | Fra | Tegning |
|---|---|---|
| dækkets farve | `tireTemp` | selve dækket, blåt koldt → cyan → grønt arbejdende → gult → rødt varmt, over 40-130 °C |
| slipring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (den største) | en ring på jorden under hjulet, grøn med greb i hånden, gul ved 0,66, rød ved 1 (grebets kant, som spillet rapporterer det); svag under 0,3 |
| affjedringsstang | `suspension` (0..1) | stødstangen farvet efter udslag: blå udstrakt, hvid midt, rød sammentrykt |
| bremseglød | `brakeTemp` (100-900 °C) | en skive på hjulets ydre flade, mørk til orange |
| slidbånd | `tireWear` (0..1) | et bånd om slidbanens kant, hvid ny → rød slidt |
| belastningsstang | `wheelLoad` (0-12 000 N) | en stolpe ved siden af hjulet lige så høj som belastningen |

Bremselygterne (regnlys og vingeendeplader) tændes med bremsepedalen. Hver `lamp`-kanal, der er tændt (over halvdelen af sit område), tænder en lampe over luftboksen i sin farve: ABS i brug, trækkontrol i brug, DRS, pit-begrænser, håndbremse, i luften.

**I en menneskemængde** (mere end 10 synlige) tegnes de biler, der ikke kigges på, almindeligt: karosseri, vinger, hjul og bremselys alene.

## Etiketter {#labels}

Fastgjort til banen og placeret for hvert billede ud fra kameraets projektion (uden for skærmen eller bag kameraet, skjult). Med **Etiketter** til:

| Etiket | Hvor | Klik |
|---|---|---|
| sving-navne (`T1`, `T2` …) | over hvert svings apex på referencen | - |
| nummererede mærker 1-5 | den omgang i fokus' fem største førertab, midt i hver årsags område, med kant i årsagens farve; hold musen over for titel og omkostning | stil op og afspil den pointe |
| stød-/styrt-etiketter | over hvert udbrud af den **fokuserede** omgang: "Styrt −45 km/t" / "Stød −12 km/t"; hold musen over for den fulde beskrivelse og tippet | stil op og afspil stødet |
| fejlkortets svingetiketter (i stedet for sving-navne og mærker, når kortet er fejlkortet) | ved hvert svings apex: "T3 · 5/40 tidlig bremsning" (den hyppigste fejl, omgange der lavede den / omgange der kørte svinget), "T3 · 5/40", når én slags er valgt, "T3 · uden fejl", når ingen er; hold musen over for svingets tab og dets fem hyppigste fejl | åbn eller luk svinget i banestatistikken |

## Spejlvendte verdener {#mirrored-worlds}

Viewer'ens verden er højrehåndet med Y op: set oppefra drejer en bil til venstre, når dens kørselsretning `atan2(dx, dz)` vokser. En spilverden med venstre hånd – Forza blandt dem – kommer spejlvendt, hver højresving tegnes som et venstresving, både bane og omgange.

Omgangene siger det selv ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): ved at gå hver omgang et par meter (3 m) ad gangen sammenlignes drejningen af dens sti med komprimeringen af affjedringen på ydersiden (`suspension.FR` minus `suspension.FL`) og, uden affjedringsdata, med styringen (positiv til højre i hver adapter). En omgang, der drejer mindre end π i alt, siger intet; belæg tæller, når det overstiger 2 % af drejningen. Omgangene stemmer; ved uafgjort siges "kan ikke afgøre det".

Når omgangenes dom ikke stemmer med den aktuelle akseinvertering (et ulige antal inverterede akser i **Kamera og scene → Invertér verdenens akse**), siger sektionen **Omgange** det under listen:

- spillet er spejlvendt, og intet er inverteret: "Disse omgange styrer til højre, hvor banen tegnes svingende til venstre …" med **Invertér X**;
- akser er inverteret, men omgangene er ikke spejlvendt: "De inverterede akser tegner disse omgange spejlvendt …" med **Nulstil akserne**.

Kun tegningen ændres – en spejling foldet ind i visningsmatricen; dataene, analysen og alle koordinater, værktøjerne viser, forbliver spillets egne. Inverteringen gemmes i browseren. Analysen navngiver sving til venstre eller højre ud fra samme måling (en ukendt verden tages som spejlvendt, som Forzas er).

## Til udviklere {#for-developers}

Kode: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Hvad en bil er i et øjeblik {#what-a-car-is-at-a-moment}

`stateAt` interpolerer hver kanal mellem de to samples omkring omgangens tid. Kanaler, der springer (gear, flag), tager den nærmeste sample. En omgang, der er færdig, parkerer på stregen.

**Retning.** Kørselsretningen kommer fra positioner, et par meter fra hinanden (mindst 2 m til hver side, så en vippe ikke drejer bilen). Karosseriets retning kommer fra spillets krøjning først, når den er tilpasset kørselsretningen – fortegn og forskydning, ved cirkulært gennemsnit over samples hurtigere end 10 m/s (mindst 20) – og kun hvis den så stemmer med den (cirkulær varians under 0,05, ca. 18° spredning); ellers peger karosseriet langs kørselsretningen. Det holder en glidning synlig (karosseri og kørsel adskilt) uden at stole på et spils vinkelkonvention.

**Styring og sider.** Hvilken vej en positiv styring drejer bilen, og hvilken side spillets højre hjul hører til, måles ud fra omgangen: styringen mod stiens drejning, og hvilken side affjedringen komprimeres på ydersiden af sving (uden affjedringsdata tages Forza-spil som spejlvendte).
