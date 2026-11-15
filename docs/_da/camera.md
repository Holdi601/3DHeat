---
title: "Kamera og styring"
nav_order: 14
has_children: true
lang: "da"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera og styring

Du flyver gennem scenen som en fugl: **W A S D** for at bevæge dig, træk med musen for at kigge. Brug denne side til at flyve, til at hoppe til en top- eller sidevisning og til at læse præcis, hvor kameraet er.

## Flyv i 4 trin {#fly-in-4-steps}

1. Klik én gang på visningen, så den har tastaturet.
2. Hold **W** for at flyve frem, **S** tilbage, **A** og **D** til siderne, **Mellemrum** op, **Q** ned.
3. Hold venstre eller højre museknap og træk for at kigge rundt.
4. Tryk **F** for at tilpasse alle data til billedet igen.

Kameraet er et frit flykamera med perspektiv og en parallel projektion, færdige visninger, en skrevet positur og dybdeskarphed. Dets indstillinger ligger i panelet **Kamera og scene** nederst i sidepanelet (vises også i fanerne Løbsanalyse og Match). Implementeringen er [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Flyvning {#flying}

| Input | Virkning |
|---|---|
| `W` `A` `S` `D` eller piletasterne | Frem (langs visningen, inklusive dens pitch), venstre, tilbage, højre |
| `Mellemrum` eller `E` | Op (verdens op) |
| `Q` eller venstre `Ctrl` | Ned |
| `Shift` (holdt) | 6× hurtigere |
| venstre `Alt` (holdt) | 15 % fart |
| Træk med venstre eller højre museknap | Kig rundt. Markøren er låst, mens du trækker. |
| Musehjul | Flyvefart ×1,5 pr. hak (perspektiv); zoom (parallel) |
| `F` | Tilpas data til billedet |
| Klik (uden at trække) | Vis, hvad der er under markøren ([Undersøg visningen](#inspecting-the-view)) |
| `C` | Kopiér kameraets position, yaw og pitch |
| `G` | Gå til et skrevet punkt |
| `Esc` | Luk svævekortet (og stop med at følge en enhed) |

### Mens du følger en enhed {#while-following-a-unit}

Når kameraet følger en enhed i et replay ([Kamp-replay](match-replay.md)), gør flyvetasterne noget andet:

| Input | Virkning |
|---|---|
| Hjul, `W` / `S` | Tættere på enheden / længere væk (højere / lavere i satellitvisningen) |
| `A` / `D`, `Q` / `E` | Kredse om enheden (jagt- og kredsløbsvisninger) |
| Træk | Kig rundt om enheden (cockpit: kig rundt inde i cockpittet) |
| `V` / `Shift+V` | Næste / forrige kameravisning |
| `Esc` | Stop med at kigge på den anden enhed først, derefter stop med at følge |

Bevægelsestasterne lægges sammen med en [gamepad](gamepad.md); se [tastaturreferencen](keyboard-reference.md) for alt andet. Taster ignoreres, mens en tekstboks eller en rullemenu har fokus. Pitch begrænses, så den holder sig lige under lodret op og ned.

## Panelet Kamera og scene {#camera--scene-panel}

![Panelet Kamera og scene: Projektion, knapperne Færdige visninger, Synsfelt, Flyvehastighed og Positur](../assets/img/en/camera-panel.webp)

### Projektion {#projection}

**Projektion**: *Perspektiv* (standard) eller *Parallel*.

*Parallel* (ortografisk) fjerner perspektivforkortningen, så to hotspots med samme tæthed ser lige store ud alle steder i billedet - den sammenligning, et kortvarmekort findes for at understøtte - og det er det, der gør en isometrisk visning isometrisk. I parallel tilstand zoomer museHjulet (der er ingen bevægelse fremad, der ændrer skala), og [farvisningen](#fly-speed) er skjult.

**Skift holder motivet lige stort.** En parallel projektion har intet synsfelt, så dens billedfladehøjde har ingen forbindelse til kameraets afstand; et naivt skift zoomer voldsomt eller viser intet. Når du går til parallel, sættes billedfladehøjden til det, perspektivkameraet dækker i fokusafstanden (2 × afstand × tan(fov / 2), hvor fokusafstanden er afstanden fra den sidste tilpasning). Når du går tilbage, genskabes den perspektiviske positur, du forlod, i samme tilsyneladende skala, i stedet for hvor den parallelle visning endte.

### Færdige visninger {#preset-views}

| Gruppe | Knapper | Retning |
|---|---|---|
| **Isometrisk** | **NØ**, **NV**, **SØ**, **SV** | Parallel, pitch -35,264° (= atan(1/√2), vinklen, hvor alle tre akser projiceres til samme længde), yaw -45°, 45°, -135°, 135°. Fire hjørner, fordi et enkelt altid skjuler halvdelen af kortet bag det, der er tættest på. |
| **Opstalter** | **Oppefra**, **Nedefra**, **Forfra**, **Bagfra**, **Venstre**, **Højre** | Parallel. Oppefra kigger lige ned (pitch -89,9°), Nedefra lige op, Forfra langs -Z (yaw 0°), Bagfra langs +Z (180°), Venstre langs -X (-90°), Højre langs +X (90°). |
| | **Tilbage til perspektiv** | Vend tilbage til den perspektiviske positur, du forlod. Deaktiveret i perspektiv. |
| | **Trekvartvisning** | Perspektiv, yaw -35°, pitch -28°. |

Hver færdig visning skifter selve projektionen - under perspektiv konvergerer en "oppefra-visning" stadig mod et forsvindingspunkt, og lige store arealer holder op med at se lige store ud - og tilpasser data til billedet fra den retning.

### Synsfelt {#field-of-view}

**Synsfelt** - den lodrette vinkel. Standard 65°, 10-140° på skyderen (179° med håndtaget), med knapperne **Fladt 20°**, **Langt 35°**, **Normalt 50°**, **Bredt 65°**, **Meget bredt 90°**. Smalt flader perspektivet ud og minder mere om en parallel projektion; bredt overdriver dybden og gør afstande svære at bedømme. Det forbliver aktivt i parallel tilstand, hvor det sætter den skala, som skiftet tilbage løser for, og den afstand **Tilpas** bruger.

### Flyvehastighed {#fly-speed}

**Flyvehastighed** - verdensenheder (meter) pr. sekund ved fuld gas. Standard 120; ved hver indlæsning databasens vandrette udstrækning / 12. Logaritmisk, 0,02-20.000 (200.000 med håndtaget; håndtaget ændrer den med forhold, ikke med mængder). MuseHjulet ganger eller deler den med 1,5 pr. hak, inden for 0,02-200.000.

Den samme værdi vises nederst til højre i visningen (kun perspektiv): farten i m/s eller km/s og den tid, det tager at krydse dataene (eller banen, når en 3D-bane er indlæst) med den fart. Træk den op eller ned for at ændre farten.

### Nær og fjern {#near-and-far}

**Nær** (standard 0,5) og **Fjern** (standard 40.000) er klipafstande. Begge genudregnes ud fra dataene ved hver indlæsning (nær = max(0,05; udstrækning / 20.000), fjern = udstrækning × 12) og udvides, aldrig indsnævres, af en 3D-bane, der er større ([Baner](levels.md#what-a-level-does-for-the-heat)). Deres forhold sætter den dybdepræcision, som skjulning bygger på, så en lille nær med en stor fjern svækker [skjulningen](depth-and-culling.md). Set udefra scenen eller højt over dens jord flyttes det nærplan, der faktisk bruges, ud til 2 % af den afstand, så et kort set langt oppefra beholder nok dybdepræcision til, at vand og kyst ikke flimrer; boksen viser stadig den værdi, der er sat.

### Andre indstillinger {#other-controls}

| Indstilling | Standard | Betydning |
|---|---|---|
| **Invertér Y** | fra | Vender musens kig op/ned. |
| **Dybdeskarphed** | fra | Se nedenfor. |
| **Gamepad** | aktiveret | Se [Gamepad og HOTAS](gamepad.md). |
| **Positur** | | Se nedenfor. |
| **Undersøg** | | Kameraaflæsningen, klik-for-at-vælge, yaw-konventionen og *Gå til et punkt*; se [Undersøg visningen](#inspecting-the-view). |
| **Tilpas datasæt (F)** | | Tilpasser dataene (i fanen Løbsanalyse: rundene) til visningen og beholder den nuværende retning. Kameraet placeres i r / tan(fov / 2) fra midten, hvor r er halvdelen af dataenes diagonal. |
| **Gitter**, **Akser** | til, til | Et jordgitter med en afstand på 1/2/5 × 10ⁿ, cirka 1/40 af dataenes spænd (strækker sig til 1,5 × dataene, mellem 8 og 120 gitterskridt), og farvede akser. |
| **Invertér verdensakse** X, Y, Z | fra | Se nedenfor. |

### Positur {#pose}

Fem talfelter - **X**, **Y**, **Z** og **yaw °**, **pitch °** - der følger kameraet, så længe ingen af dem har fokus. Skriv en værdi og tryk `Enter` (eller forlad feltet) for at flytte kameraet dertil. **kopiér** lægger `pos X Y Z · yaw A · pitch B` på udklipsholderen (med `(game yaw)` efter, når den konvention er valgt). At flyve er, hvordan du udforsker; koordinater er, hvordan du gengiver en visning. De er de samme tal som [kameraaflæsningen](#camera-readout): dataenes egne koordinater, også når en akse er invertert, og yaw i den valgte [konvention](#yaw-conventions).

### Invertér verdensakse {#invert-world-axis}

**Invertér verdensakse X / Y / Z** tegner verden med den akse vendt om. Et spil, der holder en venstrehåndet verden, kommer spejlvendt ud i denne højrehåndede fremviser - højrehåndskurver tegnet som venstrehåndskurver - og at invertere X eller Z retter det igen. **Kun tegningen ændres**: dataene, analysen og alle koordinater, værktøjerne viser (positur, lineal, snit), forbliver spillets egne. Visningen vendes på stedet og lader dig stadig kigge på det samme sted. Indstillingen huskes i browseren (`localStorage`-nøglen `heat3d.mirror`); sammenlign med vendingerne ved indlæsning ([vendinger](axes-units-and-time.md#flips)), som ændrer dataene.

## Undersøg visningen {#inspecting-the-view}

Hvor kameraet er, hvad der er under markøren, og at gå til et punkt - blokken **Undersøg** i panelet Kamera og scene og to overlejringer øverst til venstre i visningen. Koden findes i [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) og [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Indstilling | Standard | Betydning |
|---|---|---|
| **Kameraposition over visningen** | til | Kameraaflæsningen, nedenfor. Lukkes også med dens **×**. |
| **Klik viser, hvad der er der** | til | Klik-for-at-vælge, nedenfor. |
| **Yaw-konvention** | Fremviser | Hvilken yaw aflæsningen, positurfelterne og springfeltet viser og læser. |

Disse tre huskes i browseren (`localStorage`-nøglen `heat3d.inspect`).

### Kameraaflæsning {#camera-readout}

Øverst til venstre i visningen: kameraets **x**, **y**, **z**, **yaw** og **pitch**, live, med et mærke, der navngiver yaw-konventionen. Den viser de samme tal som felterne [Positur](#pose) og koster intet under flyvning (den skrives til siden på billedeuret, uden at panelerne tegnes om).

- **kopiér** (eller `C` alle steder uden for et tekstfelt) lægger `x X y Y z Z yaw A pitch B (viewer yaw)` på udklipsholderen, med `.` som decimaltegn uanset sprog - en linje, springfeltet og ethvert script kan læse tilbage.
- **gå til** (eller `G`) åbner et felt under den: indsæt et punkt og tryk `Enter` for at se på det, eller indsæt en hel kopieret positur for at stå i den visning. `Esc` lukker feltet.

### Koordinater: dataenes egen ramme {#coordinates-the-datas-own-frame}

Alle koordinater, undersøgelsesværktøjerne viser eller accepterer, er i **den indlæste datas egen ramme**: [aksekortlægningen](axes-units-and-time.md) fra indlæsningen (op-akse, vendinger, skala) er fjernet igen. En position aflæst fra visningen er det tal, kildetabellen indeholder, og et tal fra tabellen skrevet i springfeltet lander præcis dér. Når kortlægningen intet ændrer (en Y-op, uskaleret indlæsning - hvad optagelsesværktøjerne og bane-eksportørerne skriver), er det blot verden; ellers bærer aflæsningen et mærke **datasystem**. Uden et datasæt er koordinaterne verdenskoordinater. Yaw og pitch er altid om fremviserens verden, Y op.

### Yaw-konventioner {#yaw-conventions}

| Konvention | Yaw 0° kigger langs | Vokser mod | Bruges af |
|---|---|---|---|
| **Fremviser** | -Z | -X | det frie flykamera, [færdige visninger](#preset-views) |
| **Spil / optageværktøjer** | +X | -Z | optageværktøjernes `yaw`-kolonner og positurer; i en bane eksporteret i fremviserens ramme, spillets egen yaw |

Pitch er den samme i begge: op fra det vandrette. De to adskiller sig med en kvart omdrejning og intet andet:

> fremviser-yaw = spil-yaw - 90°

En retning `d` er `(cos p · cos y, sin p, -cos p · sin y)` i spilkonventionen og `(-sin y · cos p, sin p, -cos y · cos p)` i fremviserens. Vælg **Spil / optageværktøjer** for at skrive en yaw direkte ud af en optagetabel, eller for at sammenligne aflæsningen med en.

### Gå til et punkt {#going-to-a-point}

**Gå til et punkt**, i blokken Undersøg (og feltet **gå til** i aflæsningen):

- tekstfeltet tager `x, y, z` eller `x y z` (eller `x; y; z`), med et punktum eller et komma som decimaltegn - `-321.6, 137.8, -59.9` og `-321,6 137,8 -59,9` er det samme punkt. Fem tal tilføjer en yaw og pitch, og en positur kopieret fra aflæsningen eller positurfelterne læses hel, mærker og konvention inkluderet;
- **yaw °** og **pitch °** (valgfri) drejer kameraet i den valgte konvention;
- **Se på** beholder retningen (vippet, så den kigger lidt ned, mindst 20°, hvis den kiggede vandret) og træder tilbage langs den til den nuværende afstand, holdt mellem 0,3 % og 3 % af scenens bredde - 6 til 60 m på en to-kilometers bane. Fokusafstanden, den parallelle visnings højde og flyvefarten følger med, så visningen er brugbar, når du ankommer;
- **Stå her** sætter kameraet på punktet, drejet til den angivne yaw og pitch, eller som det var.

En indsat positur med sin egen yaw og pitch står altid i den visning.

### Klik-for-at-vælge {#click-to-pick}

Et klik på visningen - tryk og slip uden at trække mere end 4 pixels; et træk kigger stadig rundt - viser et kort øverst til venstre med det, der er under markøren. Mens [linealen](measure.md) er slået til, går klik til linealen i stedet.

**Et tegnet datapunkt vinder.** Den nærmeste prøve inden for 8 pixels fra klikket, af dem der faktisk tegnes: rækkerne i tidsvinduet og levetiden, der går igennem [filtrene](filters.md), de viste grupper og forskelsopdelingen, inden for afstandsudskæringen og et snit, der klipper varmekortet. I boksreplayet: en boks under markøren (hvor som helst på den). Kortet lister hver kolonne rækken bærer, under kildens egne kolonnenavne - tid (vægursktid, eller filens egne sekunder med `m:ss.ss`), person, gruppe, session, hver bevaret kolonne, positionen og kiggeretningen - og afstanden fra kameraet. Kun kolonner, indlæsningen beholdt, er i hukommelsen: en kolonne, der ikke er valgt som [filterkolonne](column-mapping.md), vises ikke.

**Ellers banens overflade**: punktet, hvor klikkets stråle møder banens rigtige trekanter (ikke linealens referenceplan), med den **del** det hører til (eksportørens navn, `structure:props`, `ground:terrain …`), dens **slags** (jord, konstruktion, vand, kortbillede), koordinaterne og afstanden. Geometri skjult af et snit eller af afstandsudskæringen går igennem. Hvor banen har et [navigationsnet](model-levels.md#navigation-meshes), navngiver en linje det og siger, om stedet ligger på det (✓). Et delnavn med præfikset `≈` blev gættet ud fra delenes afgrænsningsbokse, fordi den del af banen blev forenklet ved indlæsningen.

Kortet bliver, indtil det lukkes (**×**, `Esc`), et nyt klik svarer på noget andet, eller der klikkes på tomt rum. Et cyan kryds tegnes på punktet i scenen og en ring over det på skærmen. Dets knapper: **kopiér** (alle værdier, og koordinaterne som `x, y, z`), **Se på** og **Stå her** (på et datapunkt, kigende den vej rækken kiggede, når den har en kiggeretning; på en overflade, 1,7 m over den).

Banen indekseres til valg ved det første klik, der har brug for det: et gitter af kolonner over dens fodaftryk, bygget nogle få millisekunder ad gangen mellem billeder, så visningen aldrig stopper (cirka et sekunds arbejde for en bane med flere millioner trekanter), og holdt, indtil banen skifter. Indtil da siger kortet *Forbereder banen til valg* med en procentdel og svarer på klikket, når den er klar. En søgning efter et datapunkt over mere end fire millioner tegnede rækker fordeles over billeder på samme måde.

## Dybdeskarphed {#depth-of-field}

Et sammenklappeligt afsnit i Kamera og scene, med titlen *Dybdeskarphed - til*, mens den er slået til. Fra som standard: det er en præsentationseffekt, og standardvisningen bør vise dataene snarere end en fortolkning af dem.

| Indstilling | Standard | Interval (skyder) | Betydning |
|---|---|---|---|
| **Aktiveret** | fra | | |
| **Fokus på det indrammede** | til | | Fokus i den afstand, den sidste tilpasning brugte (*Fokuseret på N m.*). |
| **Fokusafstand** | 1000 | 1-200.000, logaritmisk (10.000.000) | Vises, når fokus er manuelt. |
| **Blænde** | ±35 % | ±2 % til ±200 %, logaritmisk (±3200 %) | Dybden, der holdes skarp, som en brøkdel af fokusafstanden - relativ i stedet for et f-tal, fordi scener spænder fra et rum til et otte-kilometers kort. |
| **Maksimal sløring** | 12 px | 1-48 (256) | Den største sløringsradius; omkostningen skalerer med den. |

Den slører **banen, gitteret og boksene** - *ikke varmekortet*. Varme i en pixel er summen af sprites i mange dybder, så den har ingen enkelt dybde at være ude af fokus i; at sløre den med den geometri, der står bag den, ville være forkert, hvor den svæver foran. Skarpe data over blødgjort kontekst er også det mest nyttige af de to. Sløringen er en 24-punkts gylden-vinkel-samling i sammensætningspasset, vægtet, så en skarp forgrund ikke smøres udad af den slørede baggrund bag den. Ændring af den tegner igen uden at genstarte varmekortets akkumulering.

## Lærredets opløsning {#canvas-resolution}

Lærredet tegnes i skærmens pixelforhold, begrænset til 2. Varmebufferen kan tegnes i lavere opløsning end det ([Varmekortets opløsning](performance-and-stats.md)).

## Sider i dette afsnit {#pages-in-this-section}

- [Gamepad og HOTAS](gamepad.md)
- [Reference for tastatur og mus](keyboard-reference.md)
