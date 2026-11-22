---
title: "3D-Levelen"
parent: "Levelen an Hannergrondgeometrie"
nav_order: 2
lang: "lb"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D-Levelen

E 3D-Level ass e Modell vum Ort - Hiwwelen, Strooss, Gebaier - an deem Är Date sëtzen. Et léisst Iech gesinn, op wéiem Stack, Hiwwel oder Dach d'Hëtzt läit. Den Viewer deelt en an Buedem (massiv), Strukturen (duerchsiichteg, dofir kann ee bannen kucken) a Waasser.

## En 3D-Level lueden {#load-a-3d-level}

1. Lued fir d'éischt Är Date ([Date ariichten](getting-data-in.md)). D'Modell muss dee selwechte Weltraum an d'selwecht Eenheet wéi d'Date benotzen, mat Y uewen.
2. Am **Hannergrond / Level** wielt en **Ziel vun der Vereinfachung**. Loosst et bei *Voll - keng Vereinfachung*, ausser d'Modell ass ganz grouss.
3. Drëckt **3D-Modell…** a wielt eng `.glb`-, `.gltf`-, `.obj`-, `.stl`- oder `.ply`-Datei.
4. Waart op d'Fortschrëttszeil. **Ofbriechen** hält et un.
5. Drëckt **F** an der Usiicht. Buedem ass massiv, Strukturen sinn duerchsiichteg Schuelen, Waasser ass flach.
6. Stellt den Look an [Level-Ausgesinn](level-appearance.md) an. Drëckt **An der Bibliothéik späicheren**, fir d'Resultat ze halen ([Level-Bibliothéik](level-library.md)).

![En 3D-Level gelueden: massive Buedem mat Héichtelinnen, duerchsiichteg Gebaier, flaacht Waasser](../assets/img/en/model-levels-loaded.webp)

**3D-Modell…** lued d'Levelmesh. Et gëtt an engem Hannergrond-Worker analyséiert, klasséiert an vereinfacht ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)), mat enger Fortschrëttszeil an **Ofbriechen**: *Modell liesen*, *Datei analyséieren*, *Packen N Texturen*, *Deeler klasséieren: N*, *Buedem vereinfachen (N Dräieck)*, *Strukturen vereinfachen (N Dräieck)*, *Drahtmodell bauen*.

## Formater {#formats}

| Format | Wat gelies gëtt | Grenzen |
|---|---|---|
| `.glb` | All Mesh-Primitiven mat `mode` 4 (Dräiecker) oder ouni Modus, mat der Weltmatrix vun all Knuet ugewannt; `POSITION`; `COLOR_0` (vec3 oder vec4) als Eckpunktfaarf; d'`baseColorTexture` vum Material an hire `TEXCOORD_n` als Textur; Knueden- an Mesh-Nimm als Deelnimm. | Linnen an Punkte ginn iwwersprongen. |
| `.gltf` | Dat selwecht. | Nëmme mat agebaute Puffer: eng glTF, déi eng extern `.bin` nennt, gëtt ofgelehnt mat *Als eenzel .glb exportéieren, sou datt d'Geometrie agebaut ass.* |
| `.obj` | Flächen, mat `o`- an `g`-Blöcke als Deeler. | Nëmme Geometrie (keng Materialien). |
| `.stl` | Binär an ASCII (`solid …`). | Ee Deel. |
| `.ply` | Nëmme ASCII. | Binär PLY gëtt ofgelehnt mat *An .glb oder binär .stl ëmwandelen.* |

Nëmme Geometrie: Positiounen, Normalen an Dräiecker, zesummegeschweesst an e Puffer, plus Faarwen an Textur-Koordinaten, wou se do sinn ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). E Modell ouni Dräiecker gëtt ofgelehnt. D'Modell muss am selwechte Weltraum an an der selwechter Eenheet wéi d'Date sinn (Y uewen): näischt gëtt verréckelt, fir ze passen.

## Buedem, Strukturen a Waasser {#ground-structures-and-water}

E Level gëtt beim Import a dräi Klassen opgedeelt, well si entgéintgesate Behandlungen braucht ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Buedem** - gezeechent massiv a mat Relief-Hiweiser schattéiert (Hang, Héichtelinnen, eng Héichtenrampe), dofir kann d'Positioun dogéint gelies ginn.
- **Strukturen** - Gebaier an Dekor stinn tëscht der Kamera an der Hëtzt, déi bannen ass, dofir ginn se als **duerchsiichteg Schuel** gezeechent (schwaach Flächen mat engem hellen Rand, plus dedupléiert Kanten) - oder, wann se texturéiert sinn, massiv mat hiren Texturen.
- **Waasser** - flaach, ouni Relief-Hiweiser: eng Héichtelinn iwwer e Séi wär Unsënn.

All Deel (glTF-Knuet, OBJ-Objet oder Grupp) gëtt fir sech klasséiert, no der éischter Regel, déi zoutrëfft:

1. **De Label vum Exporter.** E Numm, deen mat `ground:`, `structure:` oder `water:` ufänkt (oder mat `|` statt `:`), gëtt wuertwiertlech geholl. D'Exporter vum Projet markéiere all Deel sou.
2. **Waassernimm.** `water` als Wuert (net *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Buedemnimm.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Strukturnimm.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrie.** E Deel, dat méi wéi 25 % vun der X-Z-Fläche vun der Kaart deckt an dat méi wéi 60 % vu sengem Dräieckfläch no uewen huet, ass Buedem. E Deel mat manner wéi 45 % no uewen, oder dat méi héich ass wéi 15 % vun der Héicht vum Level, bei mat manner wéi 10 % vun der Fläch, ass eng Struktur. Den Undeel no uewen gëtt no Fläch gewiicht, dofir gëtt e Gebai net flaach genannt, nëmme well et e Dach huet.
6. **Soss Buedem** - e mëssverständlecht Deel gëtt als Buedem gesat, well eng Standard-Schuel, déi kaum ze gesinn ass, de Level wéi e Rendering-Feeler ausgesinn léisst.

Ee Modell, dat ee eenzegt Deel ass, dat als Struktur klasséiert gëtt, gëtt stattdessen Buedem (*eenzel Mesh ouni Numm - als Buedem behandelt*).

### Navigatiounsnetzer {#navigation-meshes}

En Deel mat dem Numm `nav:…` (dem Exporter sengem `nav:walkable`) ass en Navigatiounsnetz: wou e Soldat stoe kann. Et steet als Buedem gelëscht (*Navigatiounsnetz - net gezeechent, well et um Buedem läit; Klicke fannen et awer nach ëmmer*), gëtt awer **net gezeechent**. Et läit iwwer dem Buedem, aus deem et erzeegt gouf, bannent Zentimeteren op der selwechter Fläch, a wann et als Buedem gezeechent gouf, kämpften déi zwou Flächen ëm all Pixel: op engem Level mat engem agebackene Buedemtextur war de ganze spillbare Beräich als hart begrenzte Fleck a Gro an Béisch ze gesinn, een pro Navigatiounsdräieck. Et bleift onvereinfacht, sou datt [Klick-zum-Wielen](camera.md#click-to-pick) soen kann, ob e Fleck begaang ka ginn. Bibliothéikseintrëg behalen et net.

**Deelklassifikatioun weisen (N)** am Panel (gewisen bei Modeller mat méi wéi engem Deel) lëscht all Deel mat senger Klass an dem Grond op - *vum Exporter bezeechent*, *Numm passt op Muster*, *deckt X % vun der Kaart, Y % no uewen*, *Y % no uewen, Z % vun der Levelhéicht*, *ambivalent - als Buedem gesat*. Fir een ze änneren, benennt de Deel am Quellmodell ëm a importéiert nees; d'Trennung ass an d'Indexpuffer agebaken.

## Vereinfachung {#simplification}

**Ziel vun der Vereinfachung** setzt d'Dräieckbudget fir den nächste Import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Astellung | Dräiecker |
|---|---|
| *Voll - keng Vereinfachung* (Standard) | all |
| *Héich - 8 Mio. Dräiecker* | 8.000.000 |
| *Mëttel - 3 Mio. Dräiecker* | 3.000.000 |
| *Niddreg - 800k Dräiecker* | 800.000 |
| *Silhouette - 100k Dräiecker* | 100.000 |

De Budget gëtt **60 % op Strukturen an 40 % op de Buedem** opgedeelt, separat vereinfacht - Strukturen verléieren hir Form am schnellsten beim Ausdënnen. Waasser gëtt net vereinfacht. D'Vereinfachung ass Kantenofbau mat Quadric-Fehlermetriken ([meshoptimizer](https://github.com/zeux/meshoptimizer), iwwer WebAssembly), nodeems ganz gläich Eckpunkte zesummegeschweesst goufen, sou datt Silhouette a schaarf Kanten bleiwen. D'Importnotiz mellt `Quell → elo Dräiecker, Ofwäichung X %`, d'Verdeelung Buedem / Strukturen / Waasser iwwer d'Deeler, an - wann *Voll* bei engem Modell iwwer 8 Mio. Dräiecker benotzt gouf - schléit *Héich* (bis 30 Mio.) oder *Mëttel* (driwwer) vir. Ouni WebAssembly ass de Vereinfacher net verfügbar, an de Import seet dat.

Levelen aus den eegene Exporter vum Projet hu schonn e Budget; den Zil gëtt et fir Roh-Kunst ouni Budget dahannen.

## Texturen {#textures}

Eng `.glb`, deenen hir Deeler Basisfaarf-Texturen droen, gëtt a deenen gezeechent - en Export vun enger Rennstreck zum Beispill dréit eng pro Buedemkachel an eng pro agestallt Modell.

Buedemtextur gëtt standardméisseg gewisen, wann se do ass; Strukturen mat Texturen fänken **massiv mat hiren eegenen Texturen** un (Bordsteng, Leitplanken, Reifewänn a Schëlder sinn d'Rand vun enger Strooss, net Gebaier, an déi ee vun bannen kuckt), mat Drahtmodell aus an flacher Schattéierung aus. Kuckt [Level-Ausgesinn](level-appearance.md).

## Grouss Levelen {#large-levels}

- Iwwer **300.000** Strukturdräiecker fänken d'Strukturkanten ausgeschalt un, an d'Flächen-Dichtheet bei 35 %: mat enger Kante an all Pixel gesäit de Quartier wéi wäiss Fläch aus.
- D'Kamera-Rëschtefläch wiidert sech, fir de Level ze passen ([Levelen](levels.md#what-a-level-does-for-the-heat)).

## Fir Entwéckler {#for-developers}

### Textur-Atlas {#texture-atlas}

All Textur gëtt an de Import-Worker a **ee Atlas** gepackt ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), sou datt de Level op béiden Backends ee Zeechnen, ee Sampler an ee Textur-Koordinatenattribut bleift:

- a Reien an der eegener Gréisst vun all Bild gepackt, nëmme verkleinert, wann de Set op kee Fall an **8192 px** an iergend enger Richtung passt (dat Standardlimit vun der WebGPU-Texturgréisst);
- e **16-Pixel-Rand** ronderëm all Bild, a nëmmen déi 5 Mip-Niveauen, déi dësen Rand schützt, sou datt e wäit ewech Schëld ni d'Textur vum Nopesch hëlt;
- **widderhuelend Texturen** bleiwe widderhuelend. E Bild, deem säin glTF-Sampler sech widderhëlt (dat glTF-Standard), a deem seng Textur-Koordinaten d'0..1 verloossen - eng Zillsteenmauer, deenen hir UV laanscht 0 bis 40 leeft - gëtt eng *Kachel*: seng Eckpunkte behalen hir eegen Koordinaten an eng 16-Bit-Kachelnummer, a d'Shader wéckelen d'Koordinat pro Pixel an d'Rechteck vun der Kachel, mat der Mip-Niveau vun der net gewéckelter Koordinat, sou datt d'Nähten net ze gesinn sinn. E Rand vun enger Kachel huet hiren eegene géigeniwwerleiende Rand. Eng Achs, deenen hir Sampler klemmt, gëtt geklemmt; e Bild, dessen Koordinate bannent 0..1 bleiwen, gëtt wéi virdrun gezeechent. E Level mat Kachelen kascht 4 Bytes méi pro Eckpunkt.

### De Vertrag mam Exporter {#the-exporter-contract}

Wat de Viewer vun engem Level brauch, egal wiem en gemaach huet:

- eng eenzeg, eegenstänneg `.glb`;
- float32-`POSITION`, Dräieckprimitiven;
- Knuedennimm `ground:*`, `structure:*` an `water:*` (alles anert gëtt no de Regele vu boben klasséiert), an `nav:*` fir e Navigatiounsnetz, dat behalen, awer net gezeechent gëtt;
- Koordinaten am Weltraum, **Y uewen**, an der selwechter Eenheet wéi d'Telemetrie, sou datt d'Date ouni Plazéierungsschrëtt um Level sëtzen.

