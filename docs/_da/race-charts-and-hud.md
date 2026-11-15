---
title: "Diagrammer og HUD"
parent: "Løbsanalyse"
nav_order: 53
lang: "da"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Diagrammer og HUD

Diagrammerne stiller dine omgange op meter for meter, så du kan se, hvor en fører bremsede senere eller løftede tidligere. Kortene øverst til venstre i visningen viser, hvad hver bil og fører gør lige nu.

![Diagrammer under visningen: rækker for gab, hastighed, gas, bremse og styring for to omgange, tids- og årsagsstriber øverst, og markøren med kortene](../assets/img/en/race-charts-rows.webp)

## Diagrammerne {#the-charts}

Hver omgang på én afstandsakse - meter langs referencen (se
[én afstandsakse](race-corner-analysis.md#one-distance-axis)) - så samme x er samme sted på
banen for hver omgang. En omgang tegnes alene (og afspilles); en anden omgang af samme bane
tegnes mod den. Uden indlæste omgange (eller når analysen fejlede) står der i området: "Diagrammer
vises, når en omgang er indlæst; indlæs en anden af samme bane for at sammenligne de to."

### Hvad der er på dem {#what-is-on-them}

- **Forklaringen**: hver tegnet omgangs farve og etiket, referencen markeret "(reference)"; "+N
  flere tegnet, ikke i diagrammet", når flere omgange er synlige end der er tegnet; **Grafer (N) ▾**;
  **Hele omgangen** mens der zoomes; en linje med et tip.
- **To striber** øverst, for den fokuserede omgang:
  - *tid*: [tidskortet](race-replay-and-scene.md#time-map-where) som en stribe, rød når den taber,
    grøn når den vinder;
  - *årsag*: hvert af dens tab som en bjælke over det sted, hvor årsagen ligger, i årsagens farve;
    hold musen over en bjælke for dens titel og omkostning.
- **Svingbånd**: et skraveret bånd fra hvert sving's indgang til dets udgang (som fundet på referencen)
  og dets navn (`T1` …) under aksen ved toppunktet.
- **Det valgte fund**: et bånd i dets årsagsfarve over dets spænd.
- **Rækkerne** (grafer), én pr. valgt kanal, hver med sit navn og toppen og bunden af dens område til
  venstre, en nullinje der hvor området krydser nul. Hver omgang er en linje i sin farve: den fokuserede
  omgang 2 px bred og ugennemsigtig, referencen ugennemsigtig, de andre 1,5 px ved 75 %. Gab-rækken
  udelader referencen (den er nul over for sig selv).
- **Markøren**: en lodret linje hvor referencebilen er (eller hvor musen er), og en prik pr. bil på hver
  række undtagen gab - ved markøren er hver bil ved samme meter; ellers hver bils egen afstand ved
  replay-uret.

Højst **8** omgange tegnes: den fokuserede omgang, dens klasses bedste og referencen først, derefter de
andre i indlæsningsrækkefølge.

### Rækkerne og deres højder {#rows-and-their-heights}

Rækkerne deler diagrammets højde efter vægt, ingen lavere end 16 px:

| Række | Vægt |
|---|---|
| Gab (til referencen, sekunder, med fortegn) | 1,7 |
| Hastighed (km/t) | 1,7 |
| et pedal (gas, bremse, kobling) | 1 |
| styring | 1,1 |
| gear | 0,8 |
| en lampe (håndbremse, ABS ...) | 0,55 |
| alt andet | 1 |

En kanal med et fast visningsområde i tabellen (pedaler 0-100 %) bruger det; andre tilpasses det synlige
stykke af omgangene. Et rækkenavn, der er for langt til pladsen (et langt ord på et andet sprog), flytter
den øverste værdi en linje ned, hvor rækken er høj nok, og kortes med tre prikker, hvor den ikke er; det
fulde navn er tooltip.

### Standardgrafene {#the-default-graphs}

Indtil grafer er valgt: **gab**, derefter hver kanal, tabellen markerer `graph`, som omgangene har - gas,
bremse, kobling, håndbremse, styring, gear, hastighed - undtagen at en pedal- eller lampekanal udelades,
medmindre en omgang flytter den over 0,02 (en kobling, der aldrig trykkes ned, er ikke en graf).
Rækkefølgen er tabellens.

### Grafvælgeren {#the-graph-picker}

**Grafer (N) ▾** åbner et panel over knappen:

- en filterboks (matcher en kanals navn eller id);
- **Standard** (tilbage til standardsættet; dens tooltip siger, hvor mange) og **Luk**;
- *Gab til referencen*, derefter hver kanal de tegnede omgange har, grupperet (bevægelse, input,
  motor, hjælpere, dæk, bremser, affjedring, hjul, andet, tid, position), et afkrydsningsfelt hver. En
  kanal pr. hjul er én linje med en brik pr. hjul (FL, FR, RL, RR).

Afkrydsning holder tabellens rækkefølge, uanset rækkefølgen man krydser af i. Valget holder til
**Standard** eller en genindlæsning. Kanaler tabellen ikke kender, tilbydes under *andet*, navngivet
ud fra deres eget id ("brakeLinePress" → "Brake line press").

### Hold musen, hjul, zoom, klik {#hover-wheel-zoom-click}

| Input | Gør |
|---|---|
| hold musen | hver bil, dens kort og dens input flytter til den meter; en pæl markerer den på banen; en tabel lister hver tegnet omgangs værdi på hver række der (gab vises som "ref" for referencen); over kortene står "ved N m - diagrammernes markør". Når musen forlader plottet, går det tilbage til replayet |
| hjul | flytter replayet langs omgangen med 1/200 af det synlige spænd pr. klik (Shift: 5×), og sætter replayet på pause; når der er zoomet, følger visningen markøren |
| Ctrl+hjul (Cmd+hjul) | zoomer afstandsaksen om musen, 1,25× ud / 0,8× ind pr. klik, aldrig smallere end 40 m; zoomer man ud til hele omgangen, stopper zoomen |
| sidelæns hjul | panorerer mens der er zoomet (10 % af spændet pr. 100 enheder scroll) |
| dobbeltklik, **Hele omgangen** | zoom ud |
| klik | springer replayet hen til, hvor referencen når den meter |
| Shift+klik | stiller bilerne op der (se [opstilling](race-replay-and-scene.md#lining-up)) |

Diagrammerne tegnes igen på det aktuelle sprog, når det skifter.

Tip-linjen i forklaringen siger det samme kort: "Hold musen: hver bil der · hjul: gå langs omgangen ·
Ctrl+hjul: zoom · klik: hop · Shift+klik: stil op".

## Bilkortene (HUD) {#the-car-cards-hud}

Øverst til venstre i visningen, et kort pr. synlig omgang - højst **6**, de første seks synlige omgange
i indlæsningsrækkefølge - for det øjeblik, replayet (eller diagrammernes markør) står på.

**Overskrift:** omgangens farve og etiket; det levende gab - denne omgangs tid for at nå sin nuværende
afstand minus referencens tid for at nå samme afstand, "+0,48 s" - eller "reference"; **⋯** for at vise
eller skjule alle andre værdier (det samme som *Alle værdier på kortene*). Den forfulgte bils kort er
fremhævet.

**Bilen set ovenfra:** bilens kontur i omgangens farve med en pil forrest, fire dæk (forhjulene drejet op
til 28° med styringen), hvert farvet efter sin temperatur, med de samme symboler som 3D-bilen tegnet fladt:
glideringen, affjedringsstangen, bremseglødet, slidbåndet, belastningsbjælken.

**Aflæsninger:** hastighed i km/t, omgangens egen tid, dens afstand langs referencen.

**Input:**

- et rat, drejet af styreinputtet (fuld udslag tegnes som 180°) med procenten under sig;
- en bjælke pr. pedal, fra venstre mod højre som i en pedalkasse - kobling, bremse, gas - hver med sin
  procent og korte navn, i sin farve (kun de pedaler omgangen har);
- gearet (R for bakgear, N for neutral);
- en lille lampe pr. til/fra-kanal omgangen har - håndbremse, ABS, TC, DRS, pit-begrænser, i luften - tændt
  i sin farve, mens den er til (over halvdelen af dens område);
- en aflæsning pr. niveau-kanal: bremsefordeling, ABS- og TC-indstillinger, boost, brændstof.

**Input-sporet:** de sidste **6 sekunder** af hvert pedal (én bane, hver i sin farve) og styringen (sin egen
bane, centreret), der slutter i dette øjeblik - hvad føreren gjorde på vej ind i det. Op til 160 punkter.

**Alle værdier** (⋯ eller *Alle værdier på kortene*): hver anden skalar omgangen har i dette øjeblik, derefter
hver kanal pr. hjul som fire værdier (FL FR RL RR), navngivet ud fra kanaltabellen eller fra kanalens eget
navn, sorteret efter gruppe.

## Til udviklere {#for-developers}

Kode: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Kanaltabellen {#the-channel-table}

`CHANNELS` i [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) er
det ene sted, en kanal beskrives: dens enhed, om den er én værdi pr. prøve eller én pr. hjul (gemt som
`name.FL` …), dens gruppe, et visningsområde, hvordan den tegnes på bilen (`glyph`), hvordan den vises på
kortet (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), om den er en standardgraf, om den springer
frem i trin i stedet for at blande (gear, flag), og hvordan den vises (skala, enhed, decimaler). Etiketter
og korte navne er beskeder på hvert sprog (`race.channel.<name>.label` / `.short`).

Kanaler med en tegning eller en standardgraf:

| Kanal | Enhed | Tegnet som | Standardgraf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (grøn, rød, …), vist i % | ja |
| `handbrake` | 0..1 | lampe | ja |
| `steer` | -1..1, højre positiv | rat | ja |
| `gear` | - | gear | ja |
| `speed` | m/s, vist km/t | - | ja |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampe | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | niveau-aflæsning | - |
| `tireTemp` (pr. hjul) | °C, visning 40-130 | dækfarve | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (pr. hjul) | som spillet skalerer den, visning ±1,5 | glidering | - |
| `combinedSlip`, `slipIndex` (pr. hjul) | visning 0-1,5, 0-1 | glidering | - |
| `suspension` (pr. hjul) | 0..1 | affjedringsbjælke | - |
| `brakeTemp` (pr. hjul) | °C, visning 100-900 | bremseglød | - |
| `tireWear` (pr. hjul) | 0..1 | slidbånd | - |
| `wheelLoad` (pr. hjul) | N, visning 0-12 000 | belastningsbjælke | - |

Andre i tabellen (tegnet som graf og listet, ikke tegnet på bilen): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (driftvinkel), `loose`, `lateral` (forskydning fra
referencen), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, samt `time`, `distance`, `x`, `y`, `z`.

**En kanal, der ikke er i tabellen**, læses stadig, tegnes som graf (under *andet*) og listes på kortene,
med etiket ud fra sit eget navn. **For at give den et ordentligt navn, enhed og tegning**, tilføj ét
punkt i tabellen (og dens etiketbesked i hver `src/i18n/locales/<sprog>/race-channels.json`). En ny *type*
hjultegning er ét punkt i `WHEEL_GLYPHS` (glyph.ts) og dens flade tvilling `CARD_GLYPHS` (RaceHud.tsx);
begge er typet efter typen, så bygningen fejler, indtil begge findes. `src/race/extensible.test.ts`
kontrollerer, at ukendte kanaler når grafene, at hvert symbol i tabellen kan tegnes, og at lamper tænder.
