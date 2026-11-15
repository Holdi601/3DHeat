---
title: "3D-baner"
parent: "Baner og bakgrunnsgeometri"
nav_order: 2
lang: "no"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D-baner

En 3D-bane er en modell av stedet – åser, gater, bygninger – som dataene dine ligger inne i. Det lar deg se hvilken etasje, bakke eller tak varmen er på. Visningsprogrammet deler det i bakke (massiv), strukturer (gjennomsiktige, så du kan se inn i dem) og vann.

## Last inn en 3D-bane {#load-a-3d-level}

1. Last inn dataene dine først ([Få inn data](getting-data-in.md)). Modellen må bruke samme verdensrom og enhet som dataene, med Y opp.
2. Under **Bakgrunn / nivå** velger du et **Forenklingsmål**. La det stå på *Full – ingen forenkling* med mindre modellen er enorm.
3. Trykk **3D-modell…** og velg en fil `.glb`, `.gltf`, `.obj`, `.stl` eller `.ply`.
4. Vent på fremdriftslinjen. **Avbryt** stopper den.
5. Trykk **F** i visningen. Bakken er massiv, strukturene er gjennomsiktige skall, vannet er flatt.
6. Finjuster utseendet i [Nivåutseende](level-appearance.md). Trykk **Lagre i biblioteket** for å beholde resultatet ([Nivåbiblioteket](level-library.md)).

![A 3D level loaded: opaque ground with contour lines, see-through buildings, flat water](../assets/img/en/model-levels-loaded.webp)

**3D-modell…** laster inn nivåets mesh. Den parses, klassifiseres og forenkles i en bakgrunnsarbeider ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) med en fremdriftslinje og **Avbryt**: *Leser modell*, *Parser fil*, *Pakker N teksturer*, *Klassifiserer N deler*, *Forenkler bakke (N trekanter)*, *Forenkler strukturer (N trekanter)*, *Bygger trådmodell*.

## Formater {#formats}

| Format | Hva som leses | Begrensninger |
|---|---|---|
| `.glb` | Hver mesh-primitiv med `mode` 4 (trekanter) eller uten mode, med hver nodes verdenstransformasjon brukt; `POSITION`; `COLOR_0` (vec3 eller vec4) som vertex-farge; materialets `baseColorTexture` og dens `TEXCOORD_n` som tekstur; node- og mesh-navn som delnavn. | Linjer og punkter hoppes over. |
| `.gltf` | Det samme. | Bare med innebygde buffere: en glTF som refererer til en ekstern `.bin` avvises med *Eksporter som én .glb-fil slik at geometrien er innebygd.* |
| `.obj` | Flater, med `o`- og `g`-blokker som deler. | Bare geometri (ingen materialer). |
| `.stl` | Binær og ASCII (`solid …`). | Én del. |
| `.ply` | Bare ASCII. | Binær PLY avvises med *Konverter til .glb eller binær .stl.* |

Bare geometri: posisjoner, normaler og trekanter sveiset sammen til én buffer, pluss farger og teksturkoordinater der de finnes ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). En modell uten trekanter avvises. Modellen må være i samme verdensrom og enhet som dataene (Y opp): ingenting transformeres for å passe.

## Bakke, strukturer og vann {#ground-structures-and-water}

Et nivå deles i tre klasser ved import, fordi de krever motsatt behandling ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Bakke** – tegnes ugjennomsiktig og skyggelagt med relieff-spor (skråning, høydekurver, en høydefarge-rampe), slik at posisjonen kan leses mot den.
- **Strukturer** – bygninger og rekvisitter står mellom kameraet og varmen inne i dem, så de tegnes som et **gjennomsiktig skall** (svake flater med en lys kant, pluss fjernede dupliserte kanter) – eller, når de har tekstur, massive i sine teksturer.
- **Vann** – flatt, uten terrengspor: en høydekurve over en innsjø er meningsløs.

Hver del (glTF-node, OBJ-objekt eller gruppe) klassifiseres for seg selv, etter den første regelen som passer:

1. **Eksportørens merkelapp.** Et navn som begynner med `ground:`, `structure:` eller `water:` (eller med `|` i stedet for `:`) tas på ordet. Prosjektets egne eksportører merker hver del slik.
2. **Vannnavn.** `water` som et ord (ikke *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Bakkenavn.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Strukturnavn.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometri.** En del som dekker mer enn 25 % av kartets X-Z-areal, med mer enn 60 % av trekantarealet vendt opp, er bakke. En del med mindre enn 45 % vendt opp, eller høyere enn 15 % av nivåets høyde mens den dekker under 10 % av arealet, er en struktur. Andelen oppvendt vektes etter areal, slik at et hus ikke kalles flatt fordi det har et tak.
6. **Ellers bakke** – en tvetydig del får standard bakke, fordi en nesten usynlig skall-standard ville få nivået til å se ut som en renderingsfeil.

En modell som er én del klassifisert som struktur, gjøres i stedet til bakke (*enkelt umerket mesh – behandles som bakke*).

### Navigasjonsnett {#navigation-meshes}

En del som heter `nav:…` (en nivåeksportørs `nav:walkable`) er et navigasjonsnett: der en soldat kan stå. Den listes som bakke (*navigasjonsnett – tegnes ikke, siden den ligger på bakken; klikk finner den likevel*), men **tegnes ikke**. Den ligger som et teppe over bakken den ble laget fra, i samme plan som den, til innen centimeter, og tegnet som bakke kjempet de to flatene om hver piksel: på et nivå med en innbakt bakketekstur sto hele det spillbare området som harde flekker av grått og beige, én per navntrekant. Den beholdes, uforenklet, slik at [klikk-for-å-velge](camera.md#click-to-pick) kan si om et sted er gangbart. Biblioteksoppføringer beholder den ikke.

**Vis delklassifisering (N)** i panelet (vises for modeller med mer enn én del) lister hver del med sin klasse og grunnen – *merket av eksportøren*, *navnet passer mønsteret*, *dekker X % av kartet, Y % oppvendt*, *Y % oppvendt, Z % av nivåets høyde*, *tvetydig – satt til bakke*. For å endre en, gi delen nytt navn i kildemodellen og importer på nytt; delingen er innbakt i indeksbuffrene.

## Forenkling {#simplification}

**Forenklingsmål** setter trekantbudsjettet for neste import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Innstilling | Trekanter |
|---|---|
| *Full – ingen forenkling* (standard) | alle |
| *Høy – 8M trekanter* | 8 000 000 |
| *Middels – 3M trekanter* | 3 000 000 |
| *Lav – 800k trekanter* | 800 000 |
| *Silhuett – 100k trekanter* | 100 000 |

Budsjettet deles **60 % til strukturer og 40 % til bakken**, og forenkles hver for seg – strukturer mister formen sin raskest ved desimering. Vann forenkles ikke. Forenkling er kantkollaps med kvadratiske feilmål ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), etter at sammenfallende hjørner er sveiset sammen, slik at silhuetter og harde kanter overlever. Importnotatet rapporterer `kilde → nå trekanter, avvik X %`, fordelingen mellom bakke, strukturer og vann over delene, og – når *Full* ble brukt på en modell over 8M trekanter – foreslår *Høy* (opptil 30M) eller *Middels* (over det). Uten WebAssembly er forenkleren utilgjengelig, og importen sier det.

Nivåer fra prosjektets egne eksportører har allerede et budsjett; målet finnes for rå kunst uten noe budsjett bak seg.

## Teksturer {#textures}

En `.glb` der delene bærer teksturer for grunnfarge, tegnes i dem – en eksport fra en løpsbane har for eksempel én per terrengflis og én per plassert modell.

Bakketeksturen vises som standard når den finnes; strukturer som har teksturer starter **massive, i sine egne teksturer** (kanter, veirekkverk, dekkvegger og skilt er kanten av en vei, ikke bygninger å se inn i), med trådmodellen av og flat skyggelegging av. Se [Nivåutseende](level-appearance.md).

## Store nivåer {#large-levels}

- Over **300 000** strukturtrekanter er strukturkantene som standard slått av, og flateugjennomsiktigheten på 35 %: med en kant i hver piksel fremstår distriktet som flatt hvitt.
- Kameraets fjernplan utvides for å passe nivået ([Nivåer](levels.md#what-a-level-does-for-the-heat)).

## For utviklere {#for-developers}

### Teksturatlas {#texture-atlas}

Hver tekstur pakkes inn i **ett atlas** i importarbeideren ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), slik at nivået forblir ett tegnekall, én sampler og ett teksturkoordinat-attributt på begge backendene:

- pakket i hyller med hvert bildes egen størrelse, krympet bare dersom settet ikke ville passe **8192 px** i noen retning (WebGPUs standardgrense for teksturstørrelse);
- en **16-piksel-margin** rundt hvert bilde, og bare de 5 mip-nivåene margen beskytter, slik at et fjernt skilt aldri sampler naboens tekstur;
- **gjentakende teksturer** forblir gjentakende. Et bilde hvis glTF-sampler gjentar (glTF-standarden) og hvis teksturkoordinater går utenfor 0..1 – en murvegg der UV løper fra 0 til 40 langs den – blir en *flis*: hjørnene beholder sine egne koordinater og et 16-bits flisnummer, og shaderne bryter koordinaten inn i flisens rektangel per piksel, og tar mip-nivået fra den ubrutte koordinaten, slik at sømmene ikke vises. En flis' margin holder sin egen motsatte kant. En akse hvis sampler klemmer, klemmes; et bilde hvis koordinater holder seg innenfor 0..1 tegnes som før. Et nivå med fliser koster 4 bytes ekstra per hjørne.

### Eksportørkontrakten {#the-exporter-contract}

Det visningsprogrammet trenger fra et nivå, uansett hva som laget det:

- én selvstendig `.glb`;
- `POSITION` i float32, trekantprimitiver;
- nodenavn `ground:*`, `structure:*` og `water:*` (alt annet klassifiseres etter reglene over), og `nav:*` for et navigasjonsnett, som beholdes men ikke tegnes;
- koordinater i verdensrom, **Y opp**, i samme enhet som telemetrien, slik at dataene ligger på nivået uten noe plasseringssteg.
