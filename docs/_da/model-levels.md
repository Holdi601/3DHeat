---
title: "3D-baner"
parent: "Baner og baggrundsgeometri"
nav_order: 2
lang: "da"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D-baner

En 3D-bane er en model af stedet - bakker, gader, bygninger - som dine data ligger inde i. Den lader dig se, på hvilken etage, bakke eller tag varmen ligger. Fremviseren deler den op i land (massivt), strukturer (gennemsigtige, så du kan kigge ind) og vand.

## Indlæs en 3D-bane {#load-a-3d-level}

1. Indlæs dine data først ([Få data ind](getting-data-in.md)). Modellen skal bruge samme verdensrum og enhed som dataene, Y op.
2. Under **Baggrund / bane** vælger du et **Forenklingsmål**. Lad det stå på *Fuld - ingen forenkling*, medmindre modellen er enorm.
3. Tryk **3D-model …** og vælg en `.glb`-, `.gltf`-, `.obj`-, `.stl`- eller `.ply`-fil.
4. Vent på fremskridtslinjen. **Annullér** stopper den.
5. Tryk **F** i visningen. Land er massivt, strukturer er gennemsigtige skaller, vand er fladt.
6. Justér udseendet i [Banens udseende](level-appearance.md). Tryk **Gem i biblioteket** for at beholde resultatet ([Banebiblioteket](level-library.md)).

![En indlæst 3D-bane: ugennemsigtigt land med koter, gennemsigtige bygninger, fladt vand](../assets/img/en/model-levels-loaded.webp)

**3D-model …** indlæser banens mesh. Den parses, klassificeres og forenkles i en baggrundsarbejder ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) med en fremskridtslinje og **Annullér**: *Læser model*, *Parser fil*, *Pakker N teksturer*, *Klassificerer N dele*, *Forenkler land (N trekanter)*, *Forenkler strukturer (N trekanter)*, *Bygger trådmodel*.

## Formater {#formats}

| Format | Hvad der læses | Begrænsninger |
|---|---|---|
| `.glb` | Hvert mesh-primitiv med `mode` 4 (trekanter) eller uden mode, med hver knudes verdenstransformation anvendt; `POSITION`; `COLOR_0` (vec3 eller vec4) som vertex-farve; materialets `baseColorTexture` og dets `TEXCOORD_n` som tekstur; knude- og mesh-navne som delnavne. | Linjer og punkter springes over. |
| `.gltf` | Det samme. | Kun med indlejrede buffere: en glTF, der henviser til en ekstern `.bin`, afvises med *Eksportér som én .glb, så geometrien er indlejret.* |
| `.obj` | Flader, med `o`- og `g`-blokke som dele. | Kun geometri (ingen materialer). |
| `.stl` | Binær og ASCII (`solid …`). | Én del. |
| `.ply` | Kun ASCII. | Binær PLY afvises med *Konvertér til .glb eller binær .stl.* |

Kun geometri: positioner, normaler og trekanter svejset sammen i én buffer, plus farver og teksturkoordinater, hvor de findes ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). En model uden trekanter afvises. Modellen skal være i samme verdensrum og enhed som dataene (Y op): intet bliver transformeret for at passe.

## Land, strukturer og vand {#ground-structures-and-water}

En bane deles ved import i tre klasser, fordi de kræver modsat behandling ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Land** - tegnes ugennemsigtigt og skygget med relieffortegn (hældning, koter, en højderampe), så position kan aflæses i forhold til det.
- **Strukturer** - bygninger og rekvisitter står mellem kameraet og varmen inde i dem, så de tegnes som en **gennemsigtig skal** (svage flader med en lys kant, plus de dublerede kanter) - eller, når de har teksturer, massive i deres teksturer.
- **Vand** - fladt, uden terrænfortegn: en kotelinje over en sø er meningsløs.

Hver del (glTF-knude, OBJ-objekt eller gruppe) klassificeres for sig selv, efter den første regel, der passer:

1. **Eksportørens mærkat.** Et navn, der starter med `ground:`, `structure:` eller `water:` (eller med `|` i stedet for `:`), tages for gode varer. Projektets egne eksportører mærker hver del sådan.
2. **Vandnavne.** `water` som et ord (ikke *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Landnavne.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Strukturnavne.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometri.** En del, der dækker mere end 25 % af kortets X-Z-areal, med mere end 60 % af sit trekantsareal vendt opad, er land. En del med mindre end 45 % vendt opad, eller højere end 15 % af banens højde, mens den dækker under 10 % af sit areal, er en struktur. Andelen opad vægtes efter areal, så et hus ikke kaldes fladt, fordi det har et tag.
6. **Ellers land** - en tvetydig del standard er land, for en nærmest usynlig skal som standard ville få banen til at se ud som en renderingsfejl.

En model, der er en enkelt del klassificeret som en struktur, gøres i stedet til land (*enkelt unavngivet mesh - behandles som land*).

### Navigationsnet {#navigation-meshes}

En del navngivet `nav:…` (en banes eksportørs `nav:walkable`) er et navigationsnet: hvor en soldat kan stå. Den opføres som land (*navigationsnet - tegnes ikke, da det ligger på jorden; klik finder det stadig*), men **tegnes ikke**. Den ligger udlagt over det land, den blev genereret fra, koplanar med det inden for centimeter, og når den tegnes som land, kæmpede de to flader om hver pixel: på en bane med en indbagt landtekstur viste hele det spilbare område sig som hårdkantede pletter i grå og beige, en for hver navne-trekant. Den beholdes, uforenklet, så [klik-for-at-vælge](camera.md#click-to-pick) kan sige, om et sted kan gås. Biblioteksposter beholder den ikke.

**Vis delklassificering (N)** i panelet (vises for modeller med mere end én del) lister hver del med dens klasse og grunden - *mærket af eksportøren*, *navnet matcher mønster*, *dækker X % af kortet, Y % opad vendt*, *Y % opad vendt, Z % af banens højde*, *tvetydig - standard til land*. For at ændre en, omdøb delen i kildemodellen og importér igen; opdelingen er bagt ind i indeksbufferne.

## Forenkling {#simplification}

**Forenklingsmål** sætter trekantbudgettet for den næste import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Indstilling | Trekanter |
|---|---|
| *Fuld - ingen forenkling* (standard) | alle |
| *Høj - 8 mio. trekanter* | 8.000.000 |
| *Medium - 3 mio. trekanter* | 3.000.000 |
| *Lav - 800 k trekanter* | 800.000 |
| *Silhuet - 100 k trekanter* | 100.000 |

Budgettet deles **60 % til strukturer og 40 % til land**, og forenkles hver for sig - strukturer mister deres form hurtigst under decimering. Vand forenkles ikke. Forenklingen er kantsammentrækning med kvadratiske fejlmål ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), efter at sammenfaldende hjørner er svejst, så silhuetter og hårde kanter består. Importnoten melder `kilde → nu trekanter, afvigelse X %`, fordelingen af land / strukturer / vand på tværs af delene, og - når *Fuld* blev brugt på en model over 8 mio. trekanter - foreslår *Høj* (op til 30 mio.) eller *Medium* (over det). Uden WebAssembly er forenkleren utilgængelig, og importen siger det.

Baner fra projektets egne eksportører er allerede budgetteret; målet findes for rå kunst uden et budget bag sig.

## Teksturer {#textures}

En `.glb`, hvis dele bærer grundfarve-teksturer, tegnes i dem - en eksport af en løbsbane har for eksempel en pr. terrænflise og en pr. placeret model.

Landtekstur vises som standard, når den findes; strukturer, der bærer teksturer, starter **massive, i deres egne teksturer** (kantsten, autoværn, dækvægge og skilte er kanten af en vej, ikke bygninger at kigge ind i), med trådmodellen slået fra og flad skygning slået fra. Se [Banens udseende](level-appearance.md).

## Store baner {#large-levels}

- Over **300.000** strukturtrekanter er strukturkanterne slukket fra start, og fladeuigennemsigtigheden er 35 %: med en kant i hver pixel fremstår kvarteret som flad hvid.
- Kameraets fjerne plan udvides, så det passer til banen ([Baner](levels.md#what-a-level-does-for-the-heat)).

## Til udviklere {#for-developers}

### Teksturatlas {#texture-atlas}

Hver tekstur pakkes i **ét atlas** i importarbejderen ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), så banen forbliver ét tegnekald, én sampler og én teksturkoordinat-attribut på begge backends:

- pakket i hylder i hvert billedes egen størrelse, og kun krympet, hvis sættet ikke ville passe i **8192 px** i nogen retning (WebGPU's standard grænse for teksturstørrelse);
- en **16-pixel-margen** rundt om hvert billede, og kun de 5 mip-niveauer, marginen beskytter, så et fjernt skilt aldrig sampler sin nabos tekstur;
- **gentagne teksturer** forbliver gentagne. Et billede, hvis glTF-sampler gentager (glTF's standard), og hvis teksturkoordinater går uden for 0..1 - en murstensvæg, hvis UV løber fra 0 til 40 langs den - bliver til en *flise*: dens hjørner beholder deres egne koordinater og et 16-bit flisenummer, og shaderne vikler koordinaten ind i flisens rektangel pr. pixel, og tager mip-niveauet fra den uvikle koordinat, så samlingerne ikke ses. En flises margen rummer sin egen modsatte kant. En akse, hvis sampler klemmer, klemmes; et billede, hvis koordinater bliver inden for 0..1, tegnes som før. En bane med fliser koster 4 bytes mere pr. vertex.

### Eksportørkontrakten {#the-exporter-contract}

Hvad fremviseren behøver fra en bane, uanset hvem der lavede den:

- én selvstændig `.glb`;
- float32 `POSITION`, trekantprimitiver;
- knudenavne `ground:*`, `structure:*` og `water:*` (alt andet klassificeres efter reglerne ovenfor), og `nav:*` for et navigationsnet, som beholdes, men ikke tegnes;
- verdensrumskoordinater, **Y op**, i samme enhed som telemetrien, så dataene ligger på banen uden noget placeringstrin.
