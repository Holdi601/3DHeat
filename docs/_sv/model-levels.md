---
title: "3D-banor"
parent: "Banor och bakgrundsgeometri"
nav_order: 2
lang: "sv"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D-banor

En 3D-bana är en modell av platsen – kullar, gator, byggnader – som dina data ligger inuti. Den låter dig se vilket våningsplan, vilken kulle eller vilket tak värmen ligger på. Visaren delar upp den i mark (fast), strukturer (genomskinliga, så att du kan titta in) och vatten.

## Läs in en 3D-bana {#load-a-3d-level}

1. Läs in dina data först ([Få in data](getting-data-in.md)). Modellen måste använda samma världsrum och enhet som datan, med Y upp.
2. Under **Bakgrund / nivå** väljer du ett **Förenklingsmål**. Lämna det på *Full - ingen förenkling* om modellen inte är enorm.
3. Tryck på **3D-modell…** och välj en fil `.glb`, `.gltf`, `.obj`, `.stl` eller `.ply`.
4. Vänta på förloppsraden. **Avbryt** stoppar den.
5. Tryck på **F** i vyn. Marken är fast, strukturerna är genomskinliga skal, vattnet är plant.
6. Ställ in utseendet i [Banans utseende](level-appearance.md). Tryck på **Spara i biblioteket** för att behålla resultatet ([Banbiblioteket](level-library.md)).

![En 3D-bana inläst: ogenomskinlig mark med höjdkurvor, genomskinliga byggnader, plant vatten](../assets/img/en/model-levels-loaded.webp)

**3D-modell…** läser in banans nät. Det tolkas, klassificeras och förenklas i en bakgrundsarbetare ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) med en förloppsrad och **Avbryt**: *Läser modell*, *Tolkar fil*, *Packar N texturer*, *Klassificerar N delar*, *Förenklar mark (N trianglar)*, *Förenklar strukturer (N trianglar)*, *Bygger ramnät*.

## Format {#formats}

| Format | Vad som läses | Gränser |
|---|---|---|
| `.glb` | Varje nätprimitiv med `mode` 4 (trianglar) eller ingen mode, med varje nods världstransform tillämpad; `POSITION`; `COLOR_0` (vec3 eller vec4) som vertexfärg; materialets `baseColorTexture` och dess `TEXCOORD_n` som textur; nod- och nätnamn som delnamn. | Linjer och punkter hoppas över. |
| `.gltf` | Detsamma. | Bara med inbäddade buffrar: en glTF som hänvisar till en extern `.bin` vägras med *Exportera som en enda .glb så att geometrin är inbäddad.* |
| `.obj` | Ytor, med blocken `o` och `g` som delar. | Bara geometri (inga material). |
| `.stl` | Binär och ASCII (`solid …`). | En del. |
| `.ply` | Bara ASCII. | Binär PLY vägras med *Konvertera till .glb eller binär .stl.* |

Bara geometri: positioner, normaler och trianglar svetsade till en buffert, plus färger och texturkoordinater där de finns ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). En modell utan trianglar vägras. Modellen måste ligga i samma världsrum och enhet som datan (Y upp): inget transformeras för att passa.

## Mark, strukturer och vatten {#ground-structures-and-water}

En bana delas vid importen i tre klasser, eftersom de vill ha motsatt behandling ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Mark** – ritas ogenomskinlig och skuggad med reliefledtrådar (lutning, höjdkurvor, en höjdskala) så att positionen kan läsas mot den.
- **Strukturer** – byggnader och rekvisita står mellan kameran och värmen inuti dem, så de ritas som ett **genomskinligt skal** (svaga ytor med en ljus kant, plus dubblettfria kanter) – eller, när de har texturer, ogenomskinliga i sina texturer.
- **Vatten** – plant, utan terrängledtrådar: en höjdkurva tvärs över en sjö är meningslös.

Varje del (glTF-nod, OBJ-objekt eller grupp) klassificeras för sig, efter den första regel som gäller:

1. **Exportörens märkning.** Ett namn som börjar med `ground:`, `structure:` eller `water:` (eller med `|` i stället för `:`) tas på sitt ord. Projektets egna exportörer märker varje del så.
2. **Vattennamn.** `water` som ett ord (inte *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Markens namn.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Strukturnamn.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometri.** En del som täcker mer än 25 % av kartans X-Z-yta med mer än 60 % av sin triangelyta vänd uppåt är mark. En del med mindre än 45 % vänd uppåt, eller högre än 15 % av banans höjd medan den täcker mindre än 10 % av ytan, är en struktur. Andelen uppåtvänd yta viktas efter area, så att ett hus inte kallas plant för att det har ett tak.
6. **Annars mark** – en tvetydig del blir mark som standard, eftersom ett nästan osynligt skal som standard skulle få banan att se ut som ett renderingsfel.

En modell som är en enda del klassificerad som struktur görs i stället till mark (*enskilt namnlöst nät – behandlas som mark*).

### Navigeringsmeshar {#navigation-meshes}

En del med namnet `nav:…` (en banexportörs `nav:walkable`) är en navigeringsmesh: där en soldat kan stå. Den listas som mark (*navigeringsmesh – ritas inte, eftersom den ligger på marken; klick hittar den ändå*) men **ritas inte**. Den ligger över den mark den genererades från, plan med den inom centimeter, och ritad som mark kämpade de två ytorna om varje bildpunkt: på en bana med en inbakad marktextur syntes hela det spelbara området som hårdkantade fläckar av grått och beige, en per navtriangel. Den behålls, oförenklad, så att [klicka-för-att-välja](camera.md#click-to-pick) kan säga om en plats går att gå på. Biblioteksposter behåller den inte.

**Visa delklassificering (N)** i panelen (visas för modeller med fler än en del) listar varje del med sin klass och skälet – *märkt av exportören*, *namnet matchar mönster*, *täcker X % av kartan, Y % uppåtvänd*, *Y % uppåtvänd, Z % av banans höjd*, *tvetydig – satt till mark som standard*. För att ändra en, byt namn på delen i källmodellen och importera igen; delningen är inbakad i indexbuffrarna.

## Förenkling {#simplification}

**Förenklingsmål** sätter triangelbudgeten för nästa import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Inställning | Trianglar |
|---|---|
| *Full - ingen förenkling* (standard) | alla |
| *Hög - 8 M trianglar* | 8 000 000 |
| *Medel - 3 M trianglar* | 3 000 000 |
| *Låg - 800 k trianglar* | 800 000 |
| *Silhuett - 100 k trianglar* | 100 000 |

Budgeten delas **60 % till strukturer och 40 % till marken**, och förenklas var för sig – strukturer tappar sin form snabbast vid gallring. Vatten förenklas inte. Förenklingen är kantkollaps med kvadriska felmått ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), efter att sammanfallande hörn svetsats ihop, så att silhuetter och hårda kanter överlever. Importnoten anger `källa → nu trianglar, avvikelse X %`, delningen mark / strukturer / vatten över delarna, och – när *Full* användes på en modell över 8 M trianglar – föreslår *Hög* (upp till 30 M) eller *Medel* (över det). Utan WebAssembly är förenklaren inte tillgänglig, och importen säger det.

Banor från projektets egna exportörer har redan en budget; målet finns för råa konstverk utan någon budget bakom sig.

## Texturer {#textures}

En `.glb` vars delar bär basfärgstexturer ritas i dem – en banexport för en racebana bär till exempel en per terrängruta och en per placerad modell.

Marktexturen visas som standard när den finns; strukturer som bär texturer startar **ogenomskinliga, i sina egna texturer** (kantstenar, skyddsräcken, däckvallar och skyltar är kanten på en väg, inte byggnader att titta in i), med ramnätet av och platt skuggning av. Se [Banans utseende](level-appearance.md).

## Stora banor {#large-levels}

- Över **300 000** strukturtrianglar startar strukturkanterna avstängda och ytans opacitet på 35 %: med en kant i varje bildpunkt blir området platt vitt.
- Kamerans fjärrplan vidgas för att passa banan ([Banor](levels.md#what-a-level-does-for-the-heat)).

## För utvecklare {#for-developers}

### Texturatlas {#texture-atlas}

Varje textur packas i **en atlas** i importarbetaren ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), så att banan förblir en ritning, en sampler och ett texturkoordinatattribut på båda backends:

- packad i hyllor i varje bilds egen storlek, krympt bara om uppsättningen inte ryms i **8192 px** åt något håll (WebGPU:s standardgräns för texturstorlek);
- en **16 pixlars marginal** runt varje bild, och bara de 5 mipnivåer som marginalen skyddar, så att ett fjärran skylt aldrig samplar grannens textur;
- **upprepade texturer** förblir upprepande. En bild vars glTF-sampler upprepar (glTF:s standard) och vars texturkoordinater går utanför 0..1 – en tegelvägg vars UV löper från 0 till 40 längs den – blir en *ruta*: dess hörn behåller sina egna koordinater och ett 16-bitars rutnummer, och shaderna lindar koordinaten in i rutans rektangel per bildpunkt, med mipnivån tagen från den olindade koordinaten så att skarvarna inte syns. En rutas marginal innehåller sin egen motsatta kant. En axel vars sampler klampar klampas; en bild vars koordinater ligger kvar inom 0..1 ritas som förut. En bana med rutor kostar 4 byte extra per vertex.

### Exportörskontraktet {#the-exporter-contract}

Det visaren behöver av en bana, oavsett vad som gjorde den:

- en självständig `.glb`;
- `POSITION` i float32, triangelprimitiver;
- nodnamn `ground:*`, `structure:*` och `water:*` (allt annat klassificeras efter reglerna ovan), och `nav:*` för en navigeringsmesh, som behålls men inte ritas;
- världskoordinater, **Y upp**, i samma enhet som telemetrin, så att datan ligger på banan utan något placeringssteg.
