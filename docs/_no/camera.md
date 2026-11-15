---
title: "Kamera og kontroller"
nav_order: 14
has_children: true
lang: "no"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera og kontroller

Du flyr gjennom scenen som en fugl: **W A S D** for å bevege deg, dra med musen for å se rundt. Bruk denne siden for å fly, hoppe til en ovenfra- eller sidevisning, og for å lese nøyaktig hvor kameraet er.

## Fly i 4 steg {#fly-in-4-steps}

1. Klikk én gang på visningen, så får den tastaturet.
2. Hold **W** for å fly fram, **S** tilbake, **A** og **D** til sidene, **Mellomrom** opp, **Q** ned.
3. Hold venstre eller høyre museknapp og dra for å se rundt.
4. Trykk **F** for å bilde datasettet på nytt.

Kameraet er et fritt flykamera med perspektiv- og parallellprojeksjon, ferdige visninger, en skrevet positur og dybdeskarphet. Innstillingene ligger i panelet **Kamera og scene** nederst i sidepanelet (også vist i fanene Løpsanalyse og Kamp). Implementasjonen er [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Flyging {#flying}

| Inndata | Effekt |
|---|---|
| `W` `A` `S` `D` eller piltastene | Fram (langs visningen, også dens stigning), venstre, tilbake, høyre |
| `Mellomrom` eller `E` | Opp (verdens opp) |
| `Q` eller venstre `Ctrl` | Ned |
| `Shift` (holdt) | 6 ganger raskere |
| venstre `Alt` (holdt) | 15 % fart |
| Dra med venstre eller høyre museknapp | Se rundt. Pekeren er låst mens du drar. |
| Musehjulet | Flyhastighet ×1,5 per klikk (perspektiv); zoom (parallell) |
| `F` | Bilde dataene på nytt |
| Klikk (uten å dra) | Vis hva som er under pekeren ([Inspiser visningen](#inspecting-the-view)) |
| `C` | Kopier kameraets posisjon, yaw og pitch |
| `G` | Gå til et skrevet punkt |
| `Esc` | Lukk valgkortet (og slutt å følge en enhet) |

### Mens du følger en enhet {#while-following-a-unit}

Når kameraet følger en enhet i en reprise ([Kampreprise](match-replay.md)), gjør flytastene noe annet:

| Inndata | Effekt |
|---|---|
| Hjulet, `W` / `S` | Nærmere enheten / lenger unna (høyere / lavere i satellittvisningen) |
| `A` / `D`, `Q` / `E` | Gå i bane rundt enheten (jakt- og banevisninger) |
| Dra | Se rundt enheten (cockpit: se rundt inne i den) |
| `V` / `Shift+V` | Neste / forrige kameravisning |
| `Esc` | Slutt å se på den andre enheten først, deretter slutt å følge |

Bevegelsestastene legges sammen med en [spillkontroll](gamepad.md). Se [tastaturreferansen](keyboard-reference.md) for alt annet. Taster ignoreres mens en tekstboks eller en rullegardinliste har fokus. Stigningen er begrenset rett under rett opp og ned.

## Panelet Kamera og scene {#camera--scene-panel}

![The Camera & scene panel: Projection, Preset views, Field of view buttons, Fly speed and Pose](../assets/img/en/camera-panel.webp)

### Projeksjon {#projection}

**Projeksjon**: *Perspektiv* (standard) eller *Parallell*.

*Parallell* (ortografisk) fjerner forkortelse, så to varmepunkter med lik tetthet ser like store ut hvor som helst i rammen – sammenligningen et kartvarmekart finnes for å støtte – og det er det som gjør en isometrisk visning isometrisk. I parallellmodus zoomer musehjulet (det finnes ingen framover-bevegelse som endrer skalaen), og [fartsvisningen](#fly-speed) er skjult.

**Å bytte beholder motivet like stort.** En parallell projeksjon har ingen synsvinkel, så høyden på dens synsvolum henger ikke sammen med kameraets avstand. Et naivt bytte zoomer enten voldsomt eller viser ingenting. Når du går til parallell, settes synsvolumets høyde til det perspektivkameraet dekker ved fokusavstanden (2 × avstand × tan(fov / 2), der fokusavstanden er avstanden fra siste innramming). Når du går tilbake, gjenopprettes perspektivposituren du forlot, i samme synlige skala, i stedet for der parallellvisningen har vandret.

### Ferdige visninger {#preset-views}

| Gruppe | Knapper | Retning |
|---|---|---|
| **Isometrisk** | **NØ**, **NV**, **SØ**, **SV** | Parallell, stigning -35,264° (= atan(1/√2), vinkelen der alle tre aksene projiseres til samme lengde), yaw -45°, 45°, -135°, 135°. Fire hjørner, fordi ett alltid skjuler halvparten av kartet bak det som er nærmere. |
| **Oppriss** | **Ovenfra**, **Nedenfra**, **Forfra**, **Bakfra**, **Venstre**, **Høyre** | Parallell. Ovenfra ser rett ned (stigning -89,9°), Nedenfra rett opp, Forfra langs -Z (yaw 0°), Bakfra langs +Z (180°), Venstre langs -X (-90°), Høyre langs +X (90°). |
| | **Tilbake til perspektiv** | Gå tilbake til perspektivpositouren du forlot. Deaktivert i perspektiv. |
| | **Trekvart visning** | Perspektiv, yaw -35°, stigning -28°. |

Hver forhåndsvisning bytter selve projeksjonen – under perspektiv konvergerer en "ovenfra-visning" fortsatt mot et forsvinningspunkt, og like arealer slutter å se like ut – og rammer inn dataene fra den retningen.

### Synsfelt {#field-of-view}

**Synsfelt** – den vertikale vinkelen. Standard 65°, 10–140° på skyveknappen (179° med håndtaket), med knappene **Flat 20°**, **Lang 35°**, **Normal 50°**, **Bred 65°**, **Veldig bred 90°**. Smalt flater perspektivet og ligner mer på en parallell projeksjon; bredt overdriver dybden og gjør avstander vanskelige å bedømme. Det er fortsatt aktivt i parallellmodus, der det setter skalaen som bytte tilbake løser for, og avstanden **Bilde** bruker.

### Flyhastighet {#fly-speed}

**Flyhastighet** – verdensenheter (meter) per sekund ved full gass. Standard 120; ved hver innlasting er dataenes horisontale utstrekning / 12. Logaritmisk, 0,02–20 000 (200 000 med håndtaket; håndtaket endrer den med forhold, ikke beløp). Musehjulet ganger eller deler den med 1,5 per klikk, innenfor 0,02–200 000.

Den samme verdien vises nederst til høyre i visningen (bare perspektiv): farten i m/s eller km/s, og tiden det tar å krysse dataene (eller nivået, når et 3D-nivå er lastet) med den farten. Dra den opp eller ned for å endre farten.

### Nær og fjern {#near-and-far}

**Nær** (standard 0,5) og **Fjern** (standard 40 000) er klippeavstander. Begge regnes ut på nytt fra dataene ved hver innlasting (nær = maks(0,05, utstrekning / 20 000), fjern = utstrekning × 12) og utvides, aldri innsnevres, av et 3D-nivå som er større ([Nivåer](levels.md#what-a-level-does-for-the-heat)). Forholdet mellom dem setter dybdepresisjonen som okklusjon er avhengig av, så et lite nær med en stor fjern svekker [okklusjonen](depth-and-culling.md). Sett fra utenfor scenen eller høyt over bakken, flyttes det nærplanet som faktisk brukes ut til 2 % av den avstanden, slik at et kart sett langt ovenfra beholder nok dybdepresisjon til at vann og strand ikke flimrer. Boksen viser fortsatt verdien som er satt.

### Andre kontroller {#other-controls}

| Kontroll | Standard | Betydning |
|---|---|---|
| **Inverter Y** | av | Inverterer musens se opp/ned. |
| **Dybdeskarphet** | av | Se under. |
| **Spillkontroll** | aktivert | Se [Spillkontroll og HOTAS](gamepad.md). |
| **Positur** | | Se under. |
| **Inspiser** | | Kameraavlesningen, klikk-for-å-velge, yaw-konvensjonen og *Gå til et punkt*; se [Inspiser visningen](#inspecting-the-view). |
| **Bilde datasettet (F)** | | Tilpasser dataene (i fanen Løpsanalyse: rundene) til visningen, og beholder gjeldende retning. Kameraet plasseres på r / tan(fov / 2) fra midten, der r er halvparten av dataenes diagonal. |
| **Rutenett**, **Akser** | på, på | Et bakkerutenett med avstand 1/2/5 × 10ⁿ, omtrent 1/40 av dataenes spenn (strekker seg til 1,5 × dataene, mellom 8 og 120 rutenettsteg), og fargede akser. |
| **Inverter verdensakse** X, Y, Z | av | Se under. |

### Positur {#pose}

Fem tallfelt – **X**, **Y**, **Z** og **yaw °**, **pitch °** – som følger kameraet så lenge ingen av dem har fokus. Skriv en verdi og trykk `Enter` (eller forlat feltet) for å flytte kameraet dit. **kopier** legger `pos X Y Z · yaw A · pitch B` på utklippstavlen (med `(spill-yaw)` etter, når den konvensjonen er valgt). Å fly er hvordan du utforsker; koordinater er hvordan du gjenskaper en visning. De er de samme tallene som i [kameraavlesningen](#camera-readout): dataenes egne koordinater, også når en akse er invertert, og yaw i den valgte [konvensjonen](#yaw-conventions).

### Inverter verdensakse {#invert-world-axis}

**Inverter verdensakse X / Y / Z** tegner verdenen med den aksen snudd. Et spill som har en venstrehåndet verden kommer speilvendt ut i denne høyrehåndede visningsprogrammet – høyresvinger tegnes som venstresvinger – og å invertere X eller Z setter den tilbake. **Bare tegningen endres**: dataene, analysen og hver koordinat verktøyene viser (positur, linjal, snitt) forblir spillets egne. Visningen snur på stedet, og du ser fortsatt på samme sted. Denne innstillingen huskes i nettleseren (`localStorage`-nøkkel `heat3d.mirror`); sammenlign med [speilvendingene](axes-units-and-time.md#flips) ved innlasting, som endrer dataene.

## Inspiser visningen {#inspecting-the-view}

Hvor kameraet er, hva som er under pekeren, og å gå til et punkt – **Inspiser**-blokken i panelet Kamera og scene, og to overlegg øverst til venstre i visningen. Koden ligger i [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) og [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Kontroll | Standard | Betydning |
|---|---|---|
| **Kameraposisjon over visningen** | på | Kameraavlesningen, under. Lukkes også med **×**. |
| **Klikk viser hva som er der** | på | Klikk-for-å-velge, under. |
| **Yaw-konvensjon** | Viseren | Hvilken yaw avlesningen, positurfeltene og hoppfeltet viser og leser. |

Disse tre huskes i nettleseren (`localStorage`-nøkkel `heat3d.inspect`).

### Kameraavlesning {#camera-readout}

Øverst til venstre i visningen: kameraets **x**, **y**, **z**, **yaw** og **pitch**, live, med en merkelapp som navngir yaw-konvensjonen. Den viser de samme tallene som feltene i [Positur](#pose) og koster ingenting under flyging (den skrives til siden på bildeklokken, uten å tegne panelene på nytt).

- **kopier** (eller `C` hvor som helst utenfor et tekstfelt) legger `x X y Y z Z yaw A pitch B (viewer yaw)` på utklippstavlen, med `.` som desimaltegn uansett språk – en linje som hoppfeltet, og ethvert skript, leser tilbake.
- **gå til** (eller `G`) åpner et felt under den: lim inn et punkt og trykk `Enter` for å se på det, eller lim inn en hel kopiert positur for å stå i den visningen. `Esc` lukker feltet.

### Koordinater: dataenes egen ramme {#coordinates-the-datas-own-frame}

Hver koordinat inspeksjonsverktøyene viser eller tar imot, er i **de innlastede dataenes egen ramme**: [aksekartleggingen](axes-units-and-time.md) ved innlasting (opp-akse, speilvendinger, skala) er reversert. En posisjon lest av visningen er tallet tabellen med kildedataene holder, og et tall fra tabellen skrevet i hoppfeltet lander på det stedet. Når kartleggingen ikke endrer noe (en Y-opp, uskalert innlasting – det opptaksverktøyene og nivåeksporterne skriver) er det rett og slett verden; ellers viser avlesningen en **dataramme**-merkelapp. Uten et datasett er koordinatene verdenskoordinater. Yaw og pitch gjelder alltid seerens verden, med Y opp.

### Yaw-konvensjoner {#yaw-conventions}

| Konvensjon | Yaw 0° ser langs | Vokser mot | Brukes av |
|---|---|---|---|
| **Viseren** | -Z | -X | flykameraet, [ferdige visninger](#preset-views) |
| **Spill / opptaksverktøy** | +X | -Z | opptaksverktøyenes `yaw`-kolonner og positurer; i et nivå eksportert i seerens ramme, spillets egen yaw |

Pitch er den samme i begge: opp fra horisontalen. De to skiller seg med en kvart omdreining og ikke noe annet:

> viewer yaw = spill-yaw - 90°

En retning `d` er `(cos p · cos y, sin p, -cos p · sin y)` i spillkonvensjonen og `(-sin y · cos p, sin p, -cos y · cos p)` i seerens. Velg **Spill / opptaksverktøy** for å skrive inn en yaw rett fra en opptakstabell, eller for å sammenligne avlesningen med en.

### Gå til et punkt {#going-to-a-point}

**Gå til et punkt**, i Inspiser-blokken (og boksen **gå til** i avlesningen):

- tekstboksen tar `x, y, z` eller `x y z` (eller `x; y; z`), med desimalpunktum eller desimalkomma – `-321.6, 137.8, -59.9` og `-321,6 137,8 -59,9` er det samme punktet. Fem tall legger til en yaw og pitch, og en positur kopiert fra avlesningen eller positurfeltene leses hel, med merkelapper og konvensjon;
- **yaw °** og **pitch °** (valgfritt) snur kameraet, i den valgte konvensjonen;
- **Se på** beholder retningen (vippet til å se litt ned, minst 20°, hvis den så rett fram) og trekker seg tilbake langs den til gjeldende avstand, holdt mellom 0,3 % og 3 % av scenens bredde – 6 til 60 m på et to kilometer langt nivå. Fokusavstanden, parallellvisningens høyde og flyhastigheten følger, så visningen er brukbar når den ankommer;
- **Stå her** setter kameraet på punktet, vendt til gitt yaw og pitch, eller slik det var.

En innlimt positur med sin egen yaw og pitch står alltid i den visningen.

### Klikk-for-å-velge {#click-to-pick}

Et klikk på visningen – trykk og slipp uten å dra mer enn 4 piksler; en dra ser fortsatt rundt – viser et kort øverst til venstre med hva som er under pekeren. Mens [linjalen](measure.md) er på, går klikk til linjalen i stedet.

**Et tegnet datapunkt vinner.** Nærmeste prøve innen 8 piksler fra klikket, blant de som faktisk tegnes: radene i tidsvinduet og levetiden, som består [filtrene](filters.md), gruppene som vises og delingen av forskjellen, innenfor avstandsklippet og et snitt som klipper varmen. I boksreprisen: en boks under pekeren (hvor som helst på den). Kortet lister hver kolonne raden har, under kildens egne kolonnenavn – tid (klokketid, eller filens egne sekunder med `m:ss.ss`), person, gruppe, økt, hver beholdt kolonne, posisjonen og siktretningen – og avstanden fra kameraet. Bare kolonner innlastingen beholdt er i minnet: en kolonne som ikke er valgt som [filterkolonne](column-mapping.md), vises ikke.

**Ellers nivåets overflate**: punktet der klikkets stråle møter nivåets ekte trekanter (ikke linjalens referanseplan), med **delen** den hører til (eksportørens navn, `structure:props`, `ground:terrain …`), dens **type** (bakke, struktur, vann, kartbilde), koordinatene og avstanden. Geometri skjult av et snitt eller av avstandsklippet sendes gjennom. Der nivået har et [navigasjonsnett](model-levels.md#navigation-meshes), nevner en linje det og sier om punktet ligger på det (✓). Et delnavn med prefikset `≈` ble gjettet fra delenes omsluttende bokser, fordi den delen av nivået ble forenklet ved innlasting.

Kortet blir værende til det lukkes (**×**, `Esc`), et nytt klikk svarer på noe annet, eller et klikk på tomt rom. Et cyan kryss tegnes på punktet i scenen og en ring over det på skjermen. Knappene: **kopier** (alle verdiene, og koordinatene som `x, y, z`), **Se på** og **Stå her** (på et datapunkt, og ser i den retningen raden så ut når den har en siktretning; på en overflate, 1,7 m over den).

Nivået indekseres for valg på det første klikket som trenger det: et rutenett av kolonner over fotavtrykket, bygget noen millisekunder om gangen mellom bilder slik at visningen aldri stopper (omtrent ett sekund arbeid for et nivå med flere millioner trekanter), og beholdt til nivået endres. Inntil da sier kortet *Forbereder nivået for valg* med en prosent, og svarer på klikket når det er klart. Et søk etter datapunkter over mer enn fire millioner tegnede rader fordeles over bilder på samme måte.

## Dybdeskarphet {#depth-of-field}

En sammenleggbar seksjon i Kamera og scene, med tittelen *Dybdeskarphet – på* mens den er aktivert. Av som standard: det er en presentasjonseffekt, og standardvisningen bør vise dataene i stedet for en tolkning av dem.

| Kontroll | Standard | Område (skyveknapp) | Betydning |
|---|---|---|---|
| **Aktivert** | av | | |
| **Fokuser på det som ble rammet inn** | på | | Fokus på avstanden siste innramming brukte (*Fokusert på N m.*). |
| **Fokusavstand** | 1000 | 1–200 000, logaritmisk (10 000 000) | Vises når fokus er manuelt. |
| **Blender** | ±35 % | ±2 % til ±200 %, logaritmisk (±3200 %) | Dybden som holdes skarp, som en brøkdel av fokusavstanden – relativ i stedet for en f-verdi, fordi scener varierer fra et rom til et åtte kilometer langt kart. |
| **Maksimal uskarphet** | 12 px | 1–48 (256) | Den største uskarphetsradiusen; kostnaden skalerer med den. |

Den gjør **nivået, rutenettet og boksene** uskarpe – *ikke varmen*. Varmen i en piksel er summen av sprites på mange dybder, så den har ikke én dybde å være ute av fokus på; å gjøre den uskarp etter hva slags geometri som ligger bak den, ville være feil der den svever foran. Skarpe data over mykgjort kontekst er også den nyttigste av de to. Uskarpheten er en 24-tappers gullvinkel-innsamling i sammensetningspasset, vektet slik at en skarp forgrunn ikke smøres utover av den uskarpe bakgrunnen bak. Å endre den tegner på nytt uten å starte varmeakkumuleringen på nytt.

## Lerretsoppløsning {#canvas-resolution}

Lerretet tegnes i skjermens pikselforhold, begrenset til 2. Varmebufferen kan tegnes i lavere oppløsning enn det ([Varmeoppløsning](performance-and-stats.md)).

## Sider i denne delen {#pages-in-this-section}

- [Spillkontroll og HOTAS](gamepad.md)
- [Referanse for tastatur og mus](keyboard-reference.md)
