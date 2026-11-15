---
title: "Diagrammer og HUD"
parent: "Løpsanalyse"
nav_order: 53
lang: "no"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagrammer og HUD

Diagrammer legger rundene dine på linje meter for meter, slik at du kan se hvor en fører bremset senere eller løftet tidligere. Kortene øverst til venstre i visningen viser hva hver bil og fører gjør akkurat nå.

![Diagrammer under visningen: rader for tidsforskjell, fart, gass, brems og styring for to runder, tids- og årsaksstripene øverst, og markøren med kortene](../assets/img/en/race-charts-rows.webp)

## Diagrammene {#the-charts}

Hver runde på én avstandsakse – meter langs referansen (se
[én avstandsakse](race-corner-analysis.md#one-distance-axis)) – slik at samme x er
samme sted på banen for hver runde. En runde tegnes alene (og spilles av); en
annen runde på samme bane tegnes mot den. Uten lastede runder (eller når analysen
mislyktes) står det i området: «Diagrammer vises når en runde er lastet; last inn en
annen runde på samme bane for å sammenligne de to.»

### Hva som er på dem {#what-is-on-them}

- **Forklaringen**: hver tegnet rundes farge og etikett, referansen merket
  «(referanse)»; «+N til tegnet, ikke i diagrammet» når flere runder er synlige enn
  det som tegnes; **Grafer (N) ▾**; **Hele runden** mens du er zoomet inn; en
  linje med tips.
- **To striper** øverst, for den fokuserte runden:
  - *tid*: [tidskartet](race-replay-and-scene.md#time-map-where) som en stripe,
    rødt når du taper tid, grønt når du vinner den;
  - *årsak*: hvert av tapene som en stolpe over der årsaken er, i årsaksfargen;
    hold musa over en stolpe for tittel og kostnad.
- **Svingbånd**: et skravert bånd fra hvert svings inngang til utgang (slik det
  er funnet på referansen) og navnet (`T1` …) under aksen ved toppunktet.
- **Det valgte funnet**: et bånd i årsaksfargen over dets område.
- **Radene** (grafene), én per valgt kanal, hver med navnet og toppen og bunnen
  av området til venstre, en nullinje der området krysser null. Hver runde er en
  linje i sin farge: den fokuserte runden 2 px bred og ugjennomsiktig,
  referansen ugjennomsiktig, de andre 1,5 px på 75 %. Tidsforskjell-raden utelater
  referansen (den er null mot seg selv).
- **Markøren**: en vertikal linje der referansebilen er (eller der pekeren er), og
  en prikk per bil på hver rad unntatt tidsforskjellen – ved markøren er hver bil på
  samme meter; ellers hver bils egen avstand på reprisens klokke.

Høyst **8** runder tegnes: den fokuserte runden, klassens beste og referansen først,
deretter de andre i innlastingsrekkefølge.

### Rader og høyder {#rows-and-their-heights}

Radene deler diagrammets høyde etter vekt, ingen lavere enn 16 px:

| Rad | Vekt |
|---|---|
| Tidsforskjell (til referansen, sekunder, med fortegn) | 1,7 |
| Fart (km/h) | 1,7 |
| et pedal (gass, brems, kopling) | 1 |
| styring | 1,1 |
| gir | 0,8 |
| et lys (håndbrems, ABS …) | 0,55 |
| alt annet | 1 |

En kanal med et fast visningsområde i tabellen (pedaler 0–100 %) bruker det; andre
tilpasses det synlige utsnittet av rundene. Et radnavn som er for langt for plassen
(et langt ord på et annet språk), flytter øverste verdi ned en linje der raden er
høy nok, og kuttes med «…» der den ikke er det; det fulle navnet er verktøytipset.

### Standardgrafene {#the-default-graphs}

Helt til grafer er valgt: **tidsforskjellen**, deretter hver kanal tabellen merker
`graph` som rundene har – gass, brems, kopling, håndbrems, styring, gir, fart – bortsett
fra at et pedal- eller lyskanal utelates med mindre en runde beveger den over 0,02
(en kopling som aldri trykkes, er ingen graf). Rekkefølgen er tabellens.

### Grafvelgeren {#the-graph-picker}

**Grafer (N) ▾** åpner et panel over knappen:

- en filterboks (treffer en kanals navn eller id);
- **Standard** (tilbake til standardsettet; verktøytipset sier hvor mange) og **Lukk**;
- *Tidsforskjell til referansen*, deretter hver kanal de tegnede rundene har, gruppert
  (bevegelse, inndata, motor, hjelpemidler, dekk, bremser, understell, hjul, annet,
  tid, posisjon), en avkrysningsboks hver; en per-hjul-kanal er én linje med en brikke
  per hjul (FL, FR, RL, RR).

Avkrysning beholder tabellens rekkefølge uansett hvilken rekkefølge du krysser av i.
Valget står til **Standard** eller en lasting på nytt. Kanaler tabellen ikke kjenner,
tilbys under *annet*, og navngis fra sin egen id («brakeLinePress» → «Brake line
press»).

### Hold musa, hjulet, zoom, klikk {#hover-wheel-zoom-click}

| Inndata | Gjør |
|---|---|
| hold musa | hver bil, kortet og inndataene flyttes til den meteren; en stolpe markerer den på banen; en tabell lister hver tegnet rundes verdi på hver rad der (tidsforskjell vises som «ref» for referansen); over kortene står «ved N m – diagrammenes markør». Når du flytter deg av plottet, går det tilbake til reprisen |
| hjul | flytter reprisen langs runden med 1/200 av det synlige spennet per hakk (Shift: 5×), og setter reprisen på pause; når du er zoomet inn, følger visningen markøren |
| Ctrl+hjul (Cmd+hjul) | zoomer avstandsaksen om pekeren, 1,25× ut / 0,8× inn per hakk, aldri smalere enn 40 m; zoom ut til hele runden avslutter zoomen |
| sideveis hjul | panorerer når du er zoomet inn (10 % av spennet per 100 enheter rulling) |
| dobbeltklikk, **Hele runden** | zoom ut |
| klikk | hopper reprisen dit referansen når den meteren |
| Shift+klikk | stiller bilene opp der (se [oppstilling](race-replay-and-scene.md#lining-up)) |

Diagrammene tegnes på nytt på gjeldende språk når det endres.

Tipslinjen i forklaringen sier det samme kort: «Hold musa: hver bil der · hjul: gå langs runden · Ctrl+hjul: zoom · klikk: hopp · Shift+klikk: still opp».

## Bilkortene (HUD) {#the-car-cards-hud}

Øverst til venstre i visningen, ett kort per synlig runde – høyst **6**, de seks første
synlige rundene i innlastingsrekkefølge – for det øyeblikket reprisen (eller diagrammenes
markør) står på.

**Hodet:** rundens farge og etikett; den levende tidsforskjellen – denne rundens tid for
å nå sin nåværende avstand minus referansens tid for å nå samme avstand, «+0,48 s» – eller
«referanse»; **⋯** for å vise eller skjule alle andre verdier (samme som *Alle verdier på
kortene*). Kortet til bilen som jages, er uthevet.

**Bilen ovenfra:** kontureen av karosseriet i rundens farge med en pil foran, fire dekk
(forhjulene dreiet opptil 28° med styringen), hvert farget etter sin temperatur, med de
samme symbolene som 3D-bilen tegnet flatt: glidering, understellsstang, bremseglød,
slitasjebånd, lastestang.

**Avlesninger:** fart i km/h, rundens egen tid, dens avstand langs referansen.

**Inndata:**

- et styrehjul dreid av styringsinndataen (full utslag tegnes som 180°) med prosenten
  under seg;
- en stolpe per pedal, fra venstre til høyre som i en pedalboks – kopling, brems,
  gass – hver med sin prosent og korte navn, i sin farge (bare pedaler runden har);
- giret (R for revers, N for nøytral);
- et lite lys per av/på-kanal runden har – håndbrems, ABS, TC, DRS, pit-begrenser, i luften –
  tent i sin farge når det er på (over halvparten av sitt område);
- en avlesning per nivåkanal: bremsefordeling, ABS- og TC-innstillinger, boost, drivstoff.

**Inndataspornet:** de siste **6 sekundene** av hvert pedal (én bane, hver i sin farge) og
styringen (sin egen bane, sentrert), som ender i dette øyeblikket – hva føreren gjorde på
vei inn i det. Opptil 160 punkter.

**Alle verdier** (⋯ eller *Alle verdier på kortene*): hver annen skalarverdi runden har i
dette øyeblikket, deretter hver per-hjul-kanal som fire verdier (FL FR RL RR), navngitt fra
kanaltabellen eller fra kanalens eget navn, ordnet etter gruppe.

## For utviklere {#for-developers}

Kode: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanaltabellen {#the-channel-table}

`CHANNELS` i [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
er det ene stedet en kanal beskrives: enheten, om den er én verdi per prøve eller én per hjul
(lagret som `name.FL` …), gruppen, et visningsområde, hvordan den tegnes på bilen (`glyph`),
hvordan den vises på kortet (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), om den er
en standardgraf, om den hopper i trinn i stedet for å blande seg (gir, flagg), og hvordan den
vises (skala, enhet, desimaler). Navn og korte navn er meldinger på hvert språk
(`race.channel.<navn>.label` / `.short`).

Kanaler med en tegning eller en standardgraf:

| Kanal | Enhet | Tegnes som | Standardgraf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (grønt, rødt, …), vist i % | ja |
| `handbrake` | 0..1 | lys | ja |
| `steer` | -1..1, høyre positiv | styrehjul | ja |
| `gear` | - | gir | ja |
| `speed` | m/s, vist km/h | - | ja |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lys | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | nivåavlesning | - |
| `tireTemp` (per hjul) | °C, visning 40–130 | dekkfarge | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (per hjul) | som spillet skalerer det, visning ±1,5 | glidering | - |
| `combinedSlip`, `slipIndex` (per hjul) | visning 0–1,5, 0–1 | glidering | - |
| `suspension` (per hjul) | 0..1 | understellsstang | - |
| `brakeTemp` (per hjul) | °C, visning 100–900 | bremseglød | - |
| `tireWear` (per hjul) | 0..1 | slitasjebånd | - |
| `wheelLoad` (per hjul) | N, visning 0–12 000 | lastestang | - |

Andre i tabellen (grafert og listet, ikke tegnet): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (driftvinkel), `loose`, `lateral` (avvik fra
referansen), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, pluss `time`, `distance`, `x`, `y`, `z`.

**En kanal som ikke står i tabellen**, leses fortsatt, grafes (under *annet*) og listes på
kortene, navngitt fra sin egen id. **For å gi den et ordentlig navn, enhet og tegning**, legg til
ett felt i tabellen (og dens meldingsnavn i hver `src/i18n/locales/<språk>/race-channels.json`).
En ny *type* hjultegning er ett felt i `WHEEL_GLYPHS` (glyph.ts) og dens flate tvilling
`CARD_GLYPHS` (RaceHud.tsx); begge er typet etter typen, så bygget feiler til begge finnes.
`src/race/extensible.test.ts` sjekker at ukjente kanaler når grafene, at hvert symbol i tabellen
kan tegnes, og at lysene tennes.
