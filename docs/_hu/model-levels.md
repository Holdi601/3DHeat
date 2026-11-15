---
title: "3D pályák"
parent: "Pályák és háttérgeometria"
nav_order: 2
lang: "hu"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# 3D pályák

A 3D-pálya a hely modellje: dombok, utcák, épületek, amelyekben az adataid vannak. Megmutatja, melyik emeleten, dombon vagy tetőn van a hőtérkép. A nézegető három részre bontja: szárazföld (tömör), építmények (átlátszóak, hogy be lehessen nézni) és víz.

## 3D-pálya betöltése {#load-a-3d-level}

1. Először töltsd be az adataidat ([Adatok betöltése](getting-data-in.md)). A modellnek ugyanazt a világteret és mértékegységet kell használnia, mint az adatok, Y felfelé.
2. A **Háttér / pálya** alatt válaszd ki az **Egyszerűsítési cél**-t. Hagyd a *Teljes – nincs egyszerűsítés* értéken, hacsak a modell nem hatalmas.
3. Nyomd meg a **3D-modell…** gombot, és válassz egy `.glb`, `.gltf`, `.obj`, `.stl` vagy `.ply` fájlt.
4. Várj a folyamatsorra. A **Mégse** megállítja.
5. Nyomd meg az **F**-et a nézetben. A szárazföld tömör, az építmények átlátszó héjak, a víz sík.
6. Hangold a megjelenést a [Pályamegjelenés](level-appearance.md) oldalon. A **Mentés a könyvtárba** gombbal megtartod az eredményt ([Pályakönyvtár](level-library.md)).

![Betöltött 3D-pálya: átlátszatlan szárazföld szintvonalakkal, átlátszó épületek, sík víz](../assets/img/en/model-levels-loaded.webp)

A **3D-modell…** a pálya hálóját tölti be. Egy háttérmunkás dolgozza fel, osztályozza és egyszerűsíti ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)), folyamatsorral és **Mégse** gombbal: *Modell olvasása*, *Fájl feldolgozása*, *N textúra csomagolása*, *N rész osztályozása*, *Szárazföld egyszerűsítése (N háromszög)*, *Építmények egyszerűsítése (N háromszög)*, *Drótváz építése*.

## Formátumok {#formats}

| Formátum | Mit olvas be | Korlátok |
|---|---|---|
| `.glb` | Minden hálóelem a `mode` 4 (háromszögek) vagy mód nélkül, minden csomópont világtranszformációjával; `POSITION`; `COLOR_0` (vec3 vagy vec4) csúcsszínként; az anyag `baseColorTexture`-je és annak `TEXCOORD_n`-je textúraként; a csomópontok és hálók neve részneveként. | A vonalak és pontok kimaradnak. |
| `.gltf` | Ugyanaz. | Csak beágyazott pufferekkel: egy külső `.bin`-re hivatkozó glTF-et *Exportáld egyetlen .glb-ként, hogy a geometria be legyen ágyazva.* üzenettel elutasítják. |
| `.obj` | Háromszögek, az `o` és `g` blokkok részekként. | Csak geometria (nincs anyag). |
| `.stl` | Bináris és ASCII (`solid …`). | Egy rész. |
| `.ply` | Csak ASCII. | A bináris PLY-t *Alakítsd át .glb-re vagy bináris .stl-re* üzenettel elutasítják. |

Csak geometria: pozíciók, normálok és háromszögek egyetlen pufferbe egyesítve, plusz színek és textúrakoordináták, ha vannak ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Háromszögek nélküli modellt elutasítanak. A modellnek ugyanabban a világtérben és mértékegységben kell lennie, mint az adatok (Y felfelé). Semmi sem alakul át, hogy illeszkedjen.

## Szárazföld, építmények és víz {#ground-structures-and-water}

Egy pálya importkor három osztályba kerül, mert ellentétes kezelést kérnek ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Szárazföld** – átlátszatlanul rajzolják, domborzati jelzésekkel árnyékolva (lejtés, szintvonalak, magassági átmenet), hogy a pozíció lehessen rá olvasni.
- **Építmények** – az épületek és tárgyak a kamera és a bennük lévő hő közé állnak, ezért **átlátszó héjként** rajzolják (halvány lapok fényes peremmel, plusz duplikáció nélküli élek). Textúrázva szilárdan jelennek meg, a textúrájukban.
- **Víz** – sík, domborzati jelzések nélkül: egy szintvonal, amely egy tavon fut át, nonszensz.

Minden rész (glTF-csomópont, OBJ-objektum vagy csoport) külön osztályozódik, az első alkalmazható szabály szerint:

1. **Az exportáló címkéje.** A `ground:`, `structure:` vagy `water:` (vagy `:` helyett `|`) előtaggal kezdődő nevet szóról szóra vesszük. A projekt saját exportálói így címkézik minden részüket.
2. **Víz-nevek.** A `water` mint szó (nem *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Szárazföld-nevek.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Építmény-nevek.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Az a rész, amely a pálya X–Z területének 25%-ánál többet fed, és a háromszög-területének 60%-ánál többel felfelé néz, szárazföld. Az a rész, amely 45% alatt felfelé néz, vagy magasabb a pálya magasságának 15%-ánál, miközben a területének 10%-ánál kevesebbet fed, építmény. A felfelé nézés aránya területtel súlyozott, így egy ház nem lesz laposnak tekintve a teteje miatt.
6. **Különben szárazföld.** Egy kétértelmű rész alapból szárazföld, mert egy alig látható héj-alapérték úgy nézne ki, mint egy renderelési hiba.

Egyetlen részből álló modell, amelyet építménynek osztályoztak, szárazföldé válik (*egyetlen névtelen háló – szárazföldként kezelve*).

### Navigációs hálók {#navigation-meshes}

Az `nav:…` nevű rész (egy pályaexportáló `nav:walkable`-je) navigációs háló: ott állhat egy katona. Szárazföldként szerepel (*navigációs háló – nincs rajzolva, mert a talajon fekszik; a kattintás még megtalálja*), de **nincs rajzolva**. A szárazföldön fekszik, amelyből készült, centiméteren belül vele egysíkban. Ha szárazföldként rajzolnák, a két felület minden képpontért versengene. Egy beégetett talajtextúrával rendelkező pályán a teljes játszható terület kemény szélű szürke és bézs foltokként látszott, navigációs háromszögenként egyként. Egyszerűsítetlenül megtartják, hogy a [kattintásos kiválasztás](camera.md#click-to-pick) meg tudja mondani, járható-e egy hely. A könyvtári bejegyzések nem tartják meg.

A panelen a **Részek osztályozásának megjelenítése (N)** (több részt tartalmazó modelleknél látszik) felsorolja minden rész osztályát és okát: *az exportáló címkézte*, *a név mintát illeszt*, *a pálya X%-át fedi, Y%-a felfelé néz*, *Y%-a felfelé néz, Z% a pálya magasságából*, *kétértelmű – alapból szárazföld*. Egy rész megváltoztatásához nevezd át a forrásmodellben, és importáld újra: az osztályozás bele van égetve az indexpufferekbe.

## Egyszerűsítés {#simplification}

Az **Egyszerűsítési cél** a következő importhoz adja a háromszög-keretet ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Beállítás | Háromszögek |
|---|---|
| *Teljes – nincs egyszerűsítés* (alapértelmezett) | mind |
| *Magas – 8M háromszög* | 8 000 000 |
| *Közepes – 3M háromszög* | 3 000 000 |
| *Alacsony – 800k háromszög* | 800 000 |
| *Sziluett – 100k háromszög* | 100 000 |

A keretet **60%-ra az építményekre, 40%-ra a szárazföldre** osztják, és külön egyszerűsítik. Az építmények alakja ritkításnál a leggyorsabban vész el. A víz nincs egyszerűsítve. Az egyszerűsítés élösszevonás kvadratikus hibametrikával ([meshoptimizer](https://github.com/zeux/meshoptimizer), WebAssembly-n keresztül), az egybeeső csúcsok egyesítése után, így a sziluettek és a kemény élek megmaradnak. Az importjegyzet jelenti a `forrás → most háromszög, eltérés X%` értéket, a szárazföld / építmény / víz megoszlást a részek között. Ha a *Teljes* beállítást 8M háromszög fölötti modellen használták, javasolja a *Magas*-at (30M-ig) vagy a *Közepes*-t (e fölött). WebAssembly nélkül az egyszerűsítő nem érhető el, és az import ezt kimondja.

A projekt saját exportálóinak pályái már kerettel rendelkeznek. A cél olyan nyers grafikához való, amelynek nincs mögötte keret.

## Textúrák {#textures}

Egy `.glb`, amelynek részei alapszín-textúrákat hordoznak, azokkal van rajzolva. Egy versenypálya-export például csempénként egy textúrát hordoz, és minden elhelyezett modellhez egyet.

A szárazföld textúrája alapból látszik, ha van. A textúrás építmények **szilárdan, a saját textúrájukban** indulnak: a szegélyek, korlátok, gumifalak és táblák egy út szélei, nem belülről nézhető épületek. A drótváz ki van kapcsolva, és a sík árnyékolás is. Lásd: [Pályamegjelenés](level-appearance.md).

## Nagy pályák {#large-levels}

- **300 000** építmény-háromszög fölött az építményélek alapból kikapcsolnak, a lap átlátszatlansága pedig 35%: ha minden képpontban van él, a városrész lapos fehérnek látszik.
- A kamera távoli síkja a pályához igazodva tágul ([Pályák](levels.md#what-a-level-does-for-the-heat)).

## Fejlesztőknek {#for-developers}

### Textúra-atlasz {#texture-atlas}

Minden textúra **egy atlaszba** kerül az importmunkásban ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)). Így a pálya egy rajzolás, egy mintavevő és egy textúrakoordináta-attribútum marad mindkét háttéren:

- polcokban csomagolva, mindegyik kép saját méretén, csak akkor zsugorítva, ha a készlet egyik irányban sem férne el **8192 px**-en (a WebGPU alapértelmezett textúraméret-korlátja);
- minden kép körül **16 képpontos szegély**, és csak az 5 mip-szint, amelyet a szegély véd, így egy távoli tábla sosem mintavételez a szomszédja textúrájából;
- **az ismétlődő textúrák ismétlődnek.** Az a kép, amelynek glTF-mintavevője ismétlődik (a glTF alapértelmezése), és textúrakoordinátái kilépnek a 0..1 tartományból (egy téglafal, amelynek UV-je 0-tól 40-ig fut rajta), *csempévé* válik. A csúcsai megtartják saját koordinátáikat, és egy 16 bites csempeszámot kapnak. A shaderek pixelenként a koordinátát a csempe téglalapjába csomagolják, a mip-szintet pedig a ki nem csomagolt koordinátából véve, hogy ne látszódjanak az illesztések. Egy csempe szegélye a saját szemközti szélét tartja. Egy tengely, amelynek mintavevője szorít, szorított marad. Egy kép, amelynek koordinátái a 0..1 tartományon belül maradnak, a régi módon rajzolódik. Csempés pálya csúcsonként 4 bájttal többe kerül.

### Az exportáló szerződése {#the-exporter-contract}

Amit a nézegető egy pályától vár, bármi készítette:

- egy önálló `.glb`;
- float32 `POSITION`, háromszög-primitívek;
- csomópontnevek `ground:*`, `structure:*` és `water:*` (minden más a fenti szabályok szerint osztályozódik), és `nav:*` a navigációs hálóhoz, amely megmarad, de nincs rajzolva;
- világtérbeli koordináták, **Y felfelé**, ugyanabban a mértékegységben, mint a telemetria, így az adatok a pályán vannak minden elhelyezési lépés nélkül.
