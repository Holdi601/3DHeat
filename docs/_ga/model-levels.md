---
title: "Leibhéil 3D"
parent: "Leibhéil agus geoiméadracht chúlra"
nav_order: 2
lang: "ga"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# Leibhéil 3D

Is samhail den áit é leibhéal 3D - cnoic, sráideanna, foirgnimh - a bhfuil do chuid sonraí ann. Cabhraíonn sé leat a fheiceáil cén urlár, cnoc nó díon ar a bhfuil an teas. Roinneann an t-amharcán é ina thalamh (soladach), struchtúir (trédhearcach, ionas gur féidir leat féachaint isteach iontu) agus uisce.

## Lódáil leibhéal 3D {#load-a-3d-level}

1. Lódáil do chuid sonraí ar dtús ([Sonraí a fháil isteach](getting-data-in.md)). Caithfidh an tsamhail an spás domhain agus an t-aonad céanna a bheith aici leis na sonraí, Y suas.
2. I **Cúlra / leibhéal**, roghnaigh **Sprioc simplithe**. Fág ag *Iomlán - gan simpliú* mura bhfuil an tsamhail an-mhór.
3. Brúigh **Samhail 3T…** agus roghnaigh comhad `.glb`, `.gltf`, `.obj`, `.stl` nó `.ply`.
4. Fan leis an líne dul chun cinn. **Cealaigh** stopann é.
5. Brúigh **F** sa radharc. Tá an talamh soladach, is blaincéid trédhearcacha iad na struchtúir, tá an t-uisce cothrom.
6. Cuir an cuma ar do shaintoil i [Cuma an leibhéil](level-appearance.md). Brúigh **Sábháil sa leabharlann** chun an toradh a choinneáil ([Leabharlann leibhéal](level-library.md)).

![Leibhéal 3D lódáilte: talamh doiléir le líníní comhleibhéil, foirgnimh trédhearcacha, uisce cothrom](../assets/img/en/model-levels-loaded.webp)

Lódálann **Samhail 3T…** mogall an leibhéil. Déantar é a pharsáil, a rangú agus a shimpliú i gcoimeádán oibrí cúlra ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) le líne dul chun cinn agus **Cealaigh**: *Ag léamh an tsamhail*, *Ag parsáil an chomhaid*, *Ag pacáil N thextúr*, *Ag rangú N páirt*, *Ag simpliú an talaimh (N tris)*, *Ag simpliú na struchtúr (N tris)*, *Ag tógáil an fhrámaigh*.

## Formáidí {#formats}

| Formáid | Cad a léitear | Teorainneacha |
|---|---|---|
| `.glb` | Gach primitíof mhogaill le `mode` 4 (triantáin) nó gan mhód, le trasfhoirmeacht domhain gach nód curtha i bhfeidhm; `POSITION`; `COLOR_0` (vec3 nó vec4) mar dhath an vearteacs; an `baseColorTexture` den ábhar agus a `TEXCOORD_n` mar thextúr; ainmneacha nód agus mogaill mar ainmneacha páirte. | Léimtear línte agus pointí. |
| `.gltf` | Mar an gcéanna. | Ach amháin le buffers leabaithe: diúltaítear do glTF a thagraíonn do `.bin` seachtrach le *Easpórtáil mar `.glb` aonair ionas go leabófar an geoiméadracht.* |
| `.obj` | Aghaidheanna, le blocanna `o` agus `g` mar pháirteanna. | Geoiméadracht amháin (gan ábhair). |
| `.stl` | Dénártha agus ASCII (`solid …`). | Páirt amháin. |
| `.ply` | ASCII amháin. | Diúltaítear do PLY dénártha le *Tiontaigh go .glb nó .stl dénártha.* |

Geoiméadracht amháin: suíomhanna, normálacha agus triantáin wéilte isteach i mbufair amháin, agus datha agus comhordanáidí uigeachta mura bhfuil iad ann ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Diúltaítear do shamhail gan triantáin. Caithfidh an tsamhail a bheith sa spás domhain céanna agus san aonad céanna leis na sonraí (Y suas): ní athraítear aon rud chun dul ina áit.

## Talamh, struchtúir agus uisce {#ground-structures-and-water}

Roinntear leibhéal ina thrí rang ar iompórtáil, toisc go dteastaíonn cóireálacha contrártha uathu ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Talamh** - tarraingthe doiléir agus scáthaithe le leideanna réise (fána, comhleibhéil, rampa airde) ionas gur féidir suíomh a léamh inti.
- **Struchtúir** - seasann foirgnimh agus maoin idir an ceamara agus an teas taobh istigh díobh, mar sin tarraingítear iad mar **blaincéad trédhearcach** (aghaidheanna lag le imeall geal, agus imeall dúbailte-bainte) - nó, nuair a bhíonn siad téacsúraithe, soladach ina dtextúir.
- **Uisce** - cothrom, gan leideanna réise: is amaidí comhcheangal comhleibhéil trasna loch.

Rangaítear gach páirt (nód glTF, réad OBJ nó grúpa) ar leithligh, de réir an chéad riail a bhaineann:

1. **Lipéad an onnmhaireora.** Glactar le hainm a thosaíonn le `ground:`, `structure:` nó `water:` (nó le `|` in ionad `:`) mar a deirtear é. Lipéadaíonn onnmhaireoirí an tionscadail gach páirt mar seo.
2. **Ainmneacha uisce.** `water` mar fhocal (ní *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Ainmneacha talaimh.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Ainmneacha struchtúr.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geoiméadracht.** Is talamh páirt a chlúdaíonn níos mó ná 25% de limistéar X-Z an léarscáile agus a bhfuil níos mó ná 60% dá limistéar triantán ag féachaint suas. Is struchtúr páirt a bhfuil níos lú ná 45% de ag féachaint suas, nó atá níos airde ná 15% d'airde an leibhéil agus clúdaíonn níos lú ná 10% dá limistéar. Meáitear an sciar atá ag féachaint suas de réir limistéir, mar sin ní dhéantar foirgneamh cothrom a thabhairt air mar gheall ar dhíon.
6. **Seachas sin talamh** - réamhshocraítear páirt doiléir mar thalamh, mar gheall ar go mbeadh an leibhéal ag breathnú mar theip rindreála dá réamhshocrú blaincéad beagnach dofheicthe.

Déantar samhail a bhfuil páirt amháin inti a rangaíodh mar struchtúr ina talamh ina ionad (*single unnamed mesh - treated as ground*).

### Líonraí nascleanúna {#navigation-meshes}

Is líonra nascleanúna páirt a dtugtar `nav:…` uirthi (`nav:walkable` onnmhaireora leibhéil): an áit ar féidir le saighdiúir seasamh. Liostaítear í mar thalamh (*navigation mesh - not drawn, as it lies on the ground; clicks still find it*) ach **ní tharraingítear í**. Tá sí draped thar an talamh a gineadh uaithi, comhphlána leis go cm-cheart, agus dá dtarraingítí mar thalamh throid an dá dhromchla ar gach picteilín: ar leibhéal a bhfuil textúr talaimh bácáilte air chonacthas an limistéar iomlán inimirce mar phaistí crua-imeallach liath agus beige, ceann do gach triantán nascleanúna. Coinnítear gan simpliú í, ionas gur féidir le [cliceáil-chun-pioc](camera.md#click-to-pick) a rá an bhfuil spota inshiúlta. Ní choinníonn iontrálacha leabharlainne í.

**Taispeáin rangú páirte (N)** sa phainéal (le feiceáil do shamhlacha le níos mó ná páirt amháin) liostaíonn gach páirt lena rang agus an chúis - *lipéadaithe ag an onnmhaireoir*, *cuireann ainm le patrún*, *clúdaíonn X% den léarscáil, Y% ag féachaint suas*, *Y% ag féachaint suas, Z% d'airde an leibhéil*, *doiléir - réamhshocraithe mar thalamh*. Chun ceann a athrú, athainmnigh an pháirt sa tsamhail foinse agus iompórtáil arís é; tá an scoilt bácáilte sna bufair innéacs.

## Simpliú {#simplification}

Socraíonn **Sprioc simplithe** buiséad triantán don iompórtáil eile ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Socrú | Triantáin |
|---|---|
| *Iomlán - gan simpliú* (réamhshocrú) | gach ceann |
| *Ard - 8M triantán* | 8,000,000 |
| *Meán - 3M triantán* | 3,000,000 |
| *Íseal - 800k triantán* | 800,000 |
| *Siluéad - 100k triantán* | 100,000 |

Roinntear an buiséad **60% chuig struchtúir agus 40% chuig an talamh**, agus simplítear ar leithligh iad - cailleann struchtúir a gcruth is tapa faoi dhíchruthú. Ní simplítear an t-uisce. Is é simpliú ná cnagadh imeall le meadraicí earráide cearnach ([meshoptimizer](https://github.com/zeux/meshoptimizer), tríd an WebAssembly), tar éis vearteacsanna comhthacha a wéiliú, ionas go maireann siluéid agus imill chrua. Tuairiscíonn nóta an iompórtála `source → now triangles, deviation X%`, an scoilt talamh / struchtúr / uisce thar na páirteanna, agus - nuair a úsáideadh *Iomlán* ar shamhail os cionn 8M triantán - molann sé *Ard* (suas go 30M) nó *Meán* (os a cionn). Gan WebAssembly níl an simplitheoir ar fáil agus deir an t-iompórtáil sin.

Tá buiséid leibhéal onnmhaitheoirí an tionscadail réamhchinnte cheana; tá an sprioc ann do ealaín amh nach bhfuil buiséad taobh thiar di.

## Textúir {#textures}

Tarraingítear `.glb` a bhfuil textúir dath bunúsach ar a pháirteanna iontu iontu - tá onnmhálacha rásaíochta, mar shampla, ceann do gach tíleán talaimh agus ceann do gach samhail curtha.

Taispeántar textúr talaimh de réir réamhshocraithe nuair a bhíonn sé ann; tosaíonn struchtúir a iompraíonn textúir **soladach, ina dtextúir féin** (is iad na imill-chosáin, na rialaithe garda, na ballaí rothaí agus na comharthaí imill bóthair, ní foirgnimh le féachaint isteach iontu), leis an sreang-fhráma as agus scáthú cothrom as. Féach [Cuma an leibhéil](level-appearance.md).

## Leibhéil mhóra {#large-levels}

- Os cionn **300,000** triantán struchtúir casann imill na struchtúr as ar dtús agus socraítear dothrachtacht na n-aghaidheanna ag 35%: le himeall i ngach picteilín léitear an ceantar mar gheal cothrom.
- Leathnaíonn plána i gcéin an cheamara chun an leibhéil a shásamh ([Leibhéil](levels.md#what-a-level-does-for-the-heat)).

## Do fhorbróirí {#for-developers}

### Atlas textúr {#texture-atlas}

Pacáiltear gach textúr isteach in **atlas amháin** sa choimeádán iompórtála ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), ionas go bhfanann an leibhéal ina tharraingt amháin, ina shamplóir amháin agus ina aitríbiúid comhordanáide uigeachta amháin ar an dá thaobh:

- pacáiltear i seilfeanna ar mhéid cheap gach íomhá, ísleofar é ach amháin má nach dtiocfadh an tacar isteach i **8192 px** ar aon taobh (teorainn mhéid réamhshocraithe textúir WebGPU);
- **imeall 16 picteilín** timpeall ar gach íomhá, agus na 5 leibhéal mip amháin a chosnaíonn an t-imeall sin, ionas nach samplaíonn comhartha i gcéin textúr a chomharsan riamh;
- **fanann textúir athfhillteacha** athfhillteach. Is tíl í íomhá a athfhilleann a samplóir glTF (réamhshocrú glTF) agus a bhfuil a comhordanáidí uigeachta lasmuigh de 0..1 - balla brící a rith UV 0 go 40 fheadh a fhaid - a fhágann a vearteacsanna a gcomhordanáidí féin agus uimhir tíle 16-giotán, agus cuireann na sceadair an comhordanáid i dtríthéar an tíle in aghaidh picteilín, ag tógáil leibhéal an mip ón gcomhordanáid neamhfhillte ionas nach dtaispeánfar na seamaí. Coinníonn imeall tíle a imeall féin contrártha. Teorannaítear ais a theorannaíonn a shamplóir; tarraingítear íomhá a bhfanann a comhordanáidí laistigh de 0..1 mar a bhí roimhe. Costaíonn leibhéal le tíleanna 4 bheart in aghaidh an vearteacs breise.

### Conradh an onnmhaireora {#the-exporter-contract}

Cad a theastaíonn ón amharcán ó leibhéal, cibé rud a rinne é:

- `.glb` amháin féin-iomlán;
- `POSITION` float32, primitíofa triantáin;
- ainmneacha nód `ground:*`, `structure:*` agus `water:*` (rangaítear rud ar bith eile de réir na rialacha thuas), agus `nav:*` do líonra nascleanúna, a choinnítear ach nach dtarraingítear;
- comhordanáidí spáis domhain, **Y suas**, san aonad céanna leis an teilimeatracht, ionas go suíonn na sonraí ar an leibhéal gan aon chéim suímh.
