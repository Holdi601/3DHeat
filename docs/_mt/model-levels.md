---
title: "Livelli 3D"
parent: "Livelli u ġeometrija tal-isfond"
nav_order: 2
lang: "mt"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# Livelli 3D

Livell 3D huwa mudell tal-post - għoljiet, toroq, bini - li d-dejta tiegħek tinsab fih. Jippermettilek tara f'liema sular, għolja jew saqaf jinsab is-heat. Il-viewer jaqsam il-livell f'art (solida), strutturi (trasparenti, sabiex tkun tista' tħares ġewwa) u ilma.

## Tgħabbi livell 3D {#load-a-3d-level}

1. Għabbi d-dejta tiegħek l-ewwel ([Kif tidħol id-dejta](getting-data-in.md)). Il-mudell irid juża l-istess spazju tad-dinja u l-istess unità tad-dejta, b'Y 'il fuq.
2. Fi **Sfond / livell**, agħżel **Mira tas-simplifikazzjoni**. Ħalliha fuq *Full - no simplification* sakemm il-mudell ma jkunx kbir ħafna.
3. Ipprimi **Mudell 3D…** u agħżel fajl `.glb`, `.gltf`, `.obj`, `.stl` jew `.ply`.
4. Stenna l-linja tal-progress. **Ikkanċella** tieqaf.
5. Ipprimi **F** fil-veduta. L-art hija solida, l-istrutturi huma kwoċċi trasparenti, l-ilma huwa ċatt.
6. Aġġusta l-ħarsa f'[Dehra tal-livell](level-appearance.md). Ipprimi **Issejvja fil-librerija** biex iżżomm ir-riżultat ([Librerija tal-livelli](level-library.md)).

![Livell 3D mgħobbi: art opaka b'linji tal-kontorn, bini trasparenti, ilma ċatt](../assets/img/en/model-levels-loaded.webp)

**Mudell 3D…** jgħabbi r-rete tal-livell. Tiġi ppurrjata, ikklassifikata u ssimplifikata f'worker fl-isfond ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) b'linja tal-progress u **Ikkanċella**: *Qed taqra l-mudell*, *Qed tipparsja l-fajl*, *Qed tqiegħed N texture*, *Qed tikklassifika N partijiet*, *Qed tissimplifika l-art (N tris)*, *Qed tissimplifika l-strutturi (N tris)*, *Qed tibni l-wireframe*.

## Formati {#formats}

| Format | X'jinqara | Limiti |
|---|---|---|
| `.glb` | Kull primittiva tal-mesh b'`mode` 4 (triangoli) jew mingħajr mode, b'kull trasformazzjoni tad-dinja tan-node applikata; `POSITION`; `COLOR_0` (vec3 jew vec4) bħala kulur tal-vertex; l-`baseColorTexture` tal-materjal u l-`TEXCOORD_n` tiegħu bħala texture; ismijiet tan-node u tal-mesh bħala ismijiet tal-partijiet. | Linji u punti jinqabżu. |
| `.gltf` | L-istess. | Biss b'buffers imdaħħla: glTF li jirreferi għal `.bin` estern jiġi rrifjutat b'*Esporta bħala `.glb` wieħed sabiex il-ġeometrija tkun imdaħħla.* |
| `.obj` | Uċuħ, b'blokki `o` u `g` bħala partijiet. | Ġeometrija biss (l-ebda materjali). |
| `.stl` | Binarju u ASCII (`solid …`). | Parti waħda. |
| `.ply` | ASCII biss. | PLY binarju jiġi rrifjutat b'*Ikkonverti f'`.glb` jew `.stl` binarju.* |

Ġeometrija biss: pożizzjonijiet, normali u triangoli magħquda f'buffer wieħed, flimkien mal-kuluri u l-koordinati tat-texture fejn ikunu hemm ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Mudell mingħajr triangoli jiġi rrifjutat. Il-mudell irid ikun fl-istess spazju tad-dinja u l-istess unità tad-dejta (Y 'il fuq): xejn ma jiġi ttrasformat biex jaqbel.

## L-art, l-istrutturi u l-ilma {#ground-structures-and-water}

Livell jinqasam f'tliet klassijiet meta jidħol, għax jeħtieġu trattamenti opposti ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Art** - tinżeħ opaka u tiġi dduwwata b'indikaturi tal-medda (inklinazzjoni, kontorni, rampa tal-għoli) sabiex tkun tista' tinqara l-pożizzjoni kontrieha.
- **Strutturi** - bini u props jitqiegħdu bejn il-kamera u s-heat ġewwa tagħhom, allura jinżeħħu bħala **kwoċċa trasparenti** (uċuħ dgħajfa b'bordura ċara, u truf mingħajr duplikati) - jew, meta jkunu b'texture, solidi bit-texture tagħhom.
- **Ilma** - ċatt, mingħajr indikaturi tat-terren: kontorn ma' lag huwa assurd.

Kull parti (node tal-glTF, oġġett tal-OBJ jew grupp) tiġi kklassifikata waħedha, mill-ewwel regola li tapplika:

1. **It-tikketta tal-esportatur.** Isem li jibda b'`ground:`, `structure:` jew `water:` (jew b'`|` minflok `:`) jittieħed kif inhu. L-esportaturi tal-proġett stess jittikkettaw kull parti b'dan il-mod.
2. **Ismijiet tal-ilma.** `water` bħala kelma (mhux *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Ismijiet tal-art.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Ismijiet tal-istrutturi.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Ġeometrija.** Parti li tkopri aktar minn 25% taż-żona X-Z tal-mappa b'aktar minn 60% tal-erja tat-triangoli tagħha li tħares 'il fuq hija art. Parti b'inqas minn 45% li tħares 'il fuq, jew li hija ogħla minn 15% tal-għoli tal-livell waqt li tkopri inqas minn 10% taż-żona tiegħu, hija struttura. Is-sehem li jħares 'il fuq jitkejjel bl-erja, allura dar ma titqiesx ċatta għax għandha saqaf.
6. **Inkella art** - parti ambigwa tiddefalta għal art, għax shell default preżkoċċ kważi invisibbli jagħmel il-livell jidher bħal falliment tar-rendering.

Mudell li huwa parti waħda kklassifikata bħala struttura jsir art (*single unnamed mesh - treated as ground*).

### Navigation meshes {#navigation-meshes}

Parti msemmija `nav:…` (`nav:walkable` ta' esportatur tal-livell) hija navigation mesh: fejn soldat jista' jieqaf. Hija elenkata bħala art (*navigation mesh - not drawn, as it lies on the ground; clicks still find it*) imma **m'hijiex miżjuda**. Hija mxerrda fuq l-art li minnha ġiet iġġenerata, koplanari magħha sa ċentimetri, u kieku tinżeħ bħala art iż-żewġ uċuħ kienu jiġġieldu għal kull pixel: fuq livell b'texture tal-art miżmuma, l-erja kollha li tista' tintlagħab kienet tidher bħala tbaqqiet ta' griż u beige b'truf iebsa, waħda għal kull triangolu tan-nav. Tinżamm, mhux simplifikata, sabiex [click-to-pick](camera.md#click-to-pick) jkun jista' jgħid jekk post huwiex mixi fuqu. L-entrati tal-librerija ma jżommux din.

**Uri l-klassifikazzjoni tal-partijiet (N)** fil-pannell (muri għal mudelli b'aktar minn parti waħda) jelenka kull parti bil-klassi tagħha u r-raġuni - *tikketta mill-esportatur*, *l-isem jaqbel ma' mudell*, *tkopri X% tal-mappa, Y% li tħares 'il fuq*, *Y% li tħares 'il fuq, Z% tal-għoli tal-livell*, *ambigwu - iddefalta għal art*. Biex tbiddel waħda, ibdel l-isem tal-parti fil-mudell tas-sors u erġa' ġibha: is-qsim huwa mikkott fil-buffers tal-indiċi.

## Issimplifikar {#simplification}

**Mira tas-simplifikazzjoni** tissettja l-baġit tat-triangoli għall-importazzjoni li jmiss ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Settings | Triangoli |
|---|---|
| *Full - no simplification* (default) | kollha |
| *High - 8M triangles* | 8,000,000 |
| *Medium - 3M triangles* | 3,000,000 |
| *Low - 800k triangles* | 800,000 |
| *Silhouette - 100k triangles* | 100,000 |

Il-baġit jinqasam **60% għall-istrutturi u 40% għall-art**, u jiġi ssimplifikat separatament - l-istrutturi jitilfu l-forma tagħhom l-aktar malajr taħt id-decimation. L-ilma ma jiġix issimplifikat. Is-simplifikazzjoni hija edge collapse bi quadric error metrics ([meshoptimizer](https://github.com/zeux/meshoptimizer), permezz ta' WebAssembly), wara li jingħaqdu l-vertices li jaqgħu fl-istess post, sabiex is-silhouettes u t-truf iebsa jibqgħu. Id-nota tal-importazzjoni tirrapporta `sorsi → issa triangoli, devjazzjoni X%`, is-qsim art / strutturi / ilma fost il-partijiet, u - meta ntuża *Full* fuq mudell ta' aktar minn 8M triangoli - tissuġġerixxi *High* (sa 30M) jew *Medium* (aktar minn hekk). Mingħajr WebAssembly, is-simplifikatur ma jkunx disponibbli u l-importazzjoni tgħid dan.

Livelli mill-esportaturi tal-proġett stess diġà għandhom il-baġit tagħhom; il-mira teżisti għal arti mhux ipproċessata li ma għandha l-ebda baġit wara.

## Textures {#textures}

`.glb` li l-partijiet tiegħu jġorru textures tal-kulur bażi jinżeħ bihom - eżempju, esportazzjoni ta' kors tat-tellieqa tġib waħda għal kull tile tat-terren u waħda għal kull mudell imqiegħed.

Texture tal-art tintwera b'default meta tkun preżenti; strutturi li jġorru textures jibdew **solidi, bit-textures tagħhom stess** (kerbs, guardrails, ħitan tal-tajers u sinjali huma t-truf ta' triq, mhux bini li wieħed irid iħares ġewwa), bil-wireframe mitfi u l-shading ċatt mitfi. Ara [Dehra tal-livell](level-appearance.md).

## Livelli kbar {#large-levels}

- Fuq **300,000** triangolu strutturali, it-truf tal-istrutturi jibdew mitfija u l-opaċità tal-uċuħ 35%: b'truf f'kull pixel, il-distrett jidher bħal bjanka ċatta.
- Il-pjan tal-kamera 'il bogħod jitwessa' biex jaqbel mal-livell kollu ([Livelli](levels.md#what-a-level-does-for-the-heat)).

## Għall-iżviluppaturi {#for-developers}

### Atlas tat-texture {#texture-atlas}

Kull texture tintrama f'**atlas wieħed** fil-worker tal-importazzjoni ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), sabiex il-livell jibqa' tpinġija waħda, sampler wieħed u attribute wieħed tal-koordinati tat-texture fuq it-tnejn il-backends:

- miġbur f'xkaffetti fid-daqs ta' kull immaġni, imnaqqas biss jekk is-sett ma jidħolx f'**8192 px** fi kwalunkwe direzzjoni (il-limitu default tad-daqs tat-texture tal-WebGPU);
- **gutter ta' 16-il pixel** madwar kull immaġni, u biss il-5 livelli tal-mip li l-gutter jipproteġi, sabiex sinjal 'il bogħod qatt ma jieħu texture tal-ġar tiegħu;
- **textures li jerġgħu jiġu ripetuti** jibqgħu ripetuti. Immaġni li s-sampler tal-glTF tagħha jerġa' jirrepeti (id-default tal-glTF) u li l-koordinati tal-texture tagħha joħorġu mill-0..1 - ħajt tal-ġebel li l-UV tiegħu jmur minn 0 sa 40 tul tiegħu - issir *tile*: il-vertices tagħha jżommu l-koordinati tagħhom stess u numru ta' tile ta' 16-il bit, u l-shaders jgħaqqdu l-koordinata fir-rettangolu tat-tile għal kull pixel, u jieħdu l-livell tal-mip mill-koordinata mhux imgħaqqda, sabiex il-konnessjonijiet ma jidhrux. Il-gutter ta' tile jżomm it-truf opposti tiegħu stess. Assi li s-sampler tiegħu jikklampja jiġi kklampjat; immaġni li l-koordinati tagħha jibqgħu fi 0..1 tinżeħ bħal qabel. Livell b'tiles jiswa 4 bytes aktar għal kull vertex.

### L-kuntratt tal-esportatur {#the-exporter-contract}

Dak li l-viewer jeħtieġ minn livell, minn kull min għamlu:

- `.glb` wieħed awtosuffiċjenti;
- `POSITION` float32, primittivi tat-triangolu;
- ismijiet tan-nodes `ground:*`, `structure:*` u `water:*` (kull ħaġa oħra tiġi kklassifikata bir-regoli hawn fuq), u `nav:*` għal navigation mesh, li tinżamm imma ma tinżiħx;
- koordinati tad-dinja, **Y 'il fuq**, fl-istess unità bħat-telemetrija, sabiex id-dejta tqiegħed fuq il-livell mingħajr ebda pass ta' tqegħid.
