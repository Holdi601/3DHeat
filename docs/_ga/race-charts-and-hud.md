---
title: "Cairteacha agus an HUD"
parent: "Anailís rása"
nav_order: 53
lang: "ga"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Cairteacha agus an HUD

Líníonn cairteacha do chuairteanna suas méadar ar mhéadar, ionas gur féidir leat a fheiceáil cá ndearna tiománaí amháin coscadh níos déanaí nó scaoil sé níos luaithe. Taispeánann na cártaí i mbarr na láimhe clé den radharc cad atá gach carr agus tiománaí a dhéanamh faoi láthair.

![Cairteacha faoin radharc: sraitheanna do shleamhnú, luais, luasaire, coscáin agus stiúir do dhá chuaird, na stiallacha ama agus cúise ar barr, agus an cúrsóir leis na cártaí](../assets/img/en/race-charts-rows.webp)

## Na cairteacha {#the-charts}

Gach cuaird ar aon ais fad amháin - méadair feadh an tagartha (féach [aon ais fad amháin](race-corner-analysis.md#one-distance-axis)) - ionas gurb ionann an x céanna agus an áit chéanna ar an rian do gach cuaird. Cairtítear cuaird amháin ina haonar (agus athsheinntear í); cairtítear dara cuaird den chúrsa céanna ina coinne. Gan cuairteanna lódáilte (nó nuair a theip ar an anailís) deir an limistéar: "Taispeántar cairteacha nuair a lódáiltear cuaird; lódáil cuaird eile den chúrsa céanna chun an dá cheann a chur i gcomparáid."

### Cad atá orthu {#what-is-on-them}

- **An miniceacht**: dath agus lipéad gach cuaird cairtithe, an tagarmharc marcáilte "(tagarmharc)"; "+N eile tarraingthe, gan a bheith sa chairt" nuair a bhíonn níos mó cuairteanna le feiceáil ná mar atá cairtithe; **Graif (N) ▾**; **An chuaird ar fad** agus an radharc zúmáilte; líne leide.
- **Dhá stiall** ag an mbarr, don chuaird dhíríthe:
  - *am*: an [léarscáil ama](race-replay-and-scene.md#time-map-where) mar stiall, dearg á caillteanas, glas á ghnóthachan;
  - *cúis*: gach caillteanas den chuid mar bharra os cionn áit a chúise, i ndath na cúise; crith ar bharra le haghaidh a theidil agus a chostais.
- **Bandaí cúinne**: banda scáthaithe ó iontráil gach cúinne go a haschur (mar a fuarthas ar an tagarmharc) agus a ainm (`T1` …) faoin ais ag an mbarr.
- **An toradh roghnaithe**: banda i ndath a chúise thar a raon.
- **Na sraitheanna** (graif), ceann do gach cainéal roghnaithe, gach ceann lena ainm agus barr agus bun a raoin ar an taobh clé, líne nialach nuair a thrasnaíonn an raon an nialach. Is líne ina dath í gach cuaird: an chuaird dhíríthe 2 px ar leithead agus soiléir, an tagarmharc soiléir, na cinn eile 1.5 px ag 75%. Fágann an tsraith bhearna an tagarmharc ar lár (is nialach é dó féin).
- **An cúrsóir**: líne ingearach ag suíomh an charr tagartha (nó ag an gcúrsóir luchfhéach), agus pointe do gach carr ar gach sraith ach an bhearna - ag an gcúrsóir bíonn gach carr ag an méadar céanna; seachas sin fad gach chairr féin ag clog an athsheinm.

Ní mó ná **8** cuairt a chairtítear: an chuaird dhíríthe, an ceann is fearr dá rang agus an tagarmharc ar dtús, ansin na cinn eile de réir ord an lódála.

### Sraitheanna agus a n-airde {#rows-and-their-heights}

Roinneann na sraitheanna airde na cairte de réir meáchain, gan ceann níos ísle ná 16 px:

| Sraith | Meáchan |
|---|---|
| Bearna (go dtí an tagarmharc, soicindí, le comhartha) | 1.7 |
| Luas (km/h) | 1.7 |
| cos (luasaire, coscán, cluiche) | 1 |
| stiúir | 1.1 |
| giar | 0.8 |
| lampa (coscán láimhe, ABS …) | 0.55 |
| rud ar bith eile | 1 |

Úsáideann cainéal a bhfuil raon taispeána seasta aige sa tábla (pedals 0-100%) an raon sin; feistítear cinn eile ar an gcuid le feiceáil de na cuairteanna. Má tá ainm sraithe ró-fhada don spás (focal fada i dteanga eile), bogann an luach barr síos líne sa sraith nuair a bhíonn an tsraith ard go leor, agus gearrtar é le ellipsis nuair nach bhfuil; is é an leid an t-ainm iomlán.

### Na graif réamhshocraithe {#the-default-graphs}

Go dtí go roghnaítear graif: an **bhearna**, ansin gach cainéal a mharcálann an tábla `graph` agus atá ag na cuairteanna - luasaire, coscán, cluiche, coscán láimhe, stiúir, giar, luas - ach amháin go bhfágtar cainéal cos nó lampa ar lár mura mbogann cuaird ar bith é thar 0.02 (ní graf é cluiche nach brúitear riamh). Is é ord an tábla a ordú.

### Roghnóir na ngraf {#the-graph-picker}

**Graif (N) ▾** oscailtear painéal os cionn an chnaipe:

- bosca scagaire (meaitseálann ainm nó ID cainéil);
- **Réamhshocruithe** (ar ais go dtí an tacar réamhshocraithe; a leid insíonn cé mhéad) agus **Dún**;
- *Bearna go dtí an tagarmharc*, ansin gach cainéal a iompraíonn na cuairteanna cairtithe, grúpáilte (gluaiseacht, ionchuir, inneall, cúnaimh, rubair, coscáin, fionraí, rothaí, eile, am, suíomh), seic-bhosca gach ceann; is líne amháin cainéal in aghaidh an rothair le sliseanna do gach rothar (FL, FR, RL, RR).

Coinníonn tic ord an tábla is cuma cén t-ord a ticeáiltear. Maireann an rogha go dtí **Réamhshocruithe** nó athlódáil. Tairgtear cainéil nach aithníonn an tábla faoi *eile*, agus ainmnítear iad óna n-ID féin ("brakeLinePress" → "Brake line press").

### Luchfhéach, rotha, zúmáil, cliceáil {#hover-wheel-zoom-click}

| Ionchur | Déanann sé |
|---|---|
| luchfhéach | bogann gach carr, a chárta agus a ionchuir go dtí an méadar sin; marcálann post ar an rian é; liostálann tábla luach gach cuaird chairtithe ar gach sraith ansin (taispeántar an bhearna mar "ref" don tagarmharc); os cionn na gcártaí, "ag N m - cúrsóir na gcairteacha". Nuair a bhogann tú amach as an bplota, filleann sé ar an athsheinm |
| rotha | céimníonn an athsheinm feadh na cuaird 1/200 den spás infheicthe in aghaidh an chliceála (Shift: 5×), ag stopadh an athsheinm; nuair a zúmáiltear, leanann an radharc an cúrsóir |
| Ctrl+rotha (Cmd+rotha) | zúmálann an ais fad faoin luchtaire, 1.25× amach / 0.8× isteach in aghaidh an chliceála, ní caolaíonn sé níos mó ná 40 m riamh; zúmáil amach go dtí an chuaird ar fad cuireann deireadh leis an zúmáil |
| rotha ar an taobh | pananna agus zúmáilte (10% den spás in aghaidh 100 aonad scroill) |
| cliceáil dúbailte, **An chuaird ar fad** | zúmáil amach |
| cliceáil | léimeann an athsheinm go dtí an áit a sroicheann an tagarmharc an méadar sin |
| Shift+cliceáil | cuireann na carranna ina n-ailíniú ansin (féach [ailíniú](race-replay-and-scene.md#lining-up)) |

Athdhéanann na cairteacha an teanga reatha nuair a athraíonn sí.

Déanann líne na leide sa mhiniceacht an rud céanna go gairid: "Luchfhéach: gach carr ansin · rotha: céimnigh feadh na cuaird · Ctrl+rotha: zúmáil · cliceáil: léim · Shift+cliceáil: ailínigh".

## Cártaí an charr (HUD) {#the-car-cards-hud}

Barr na láimhe clé den radharc, cárta do gach cuaird le feiceáil - ar a mhéad **6**, an chéad sé chuaird le feiceáil de réir ord an lódála - don nóiméad a bhfuil an athsheinm (nó cúrsóir na gcairteacha) ann.

**Ceann:** dath agus lipéad na cuaird; an bhearna bheo - am na cuaird seo chun a fad reatha a bhaint amach lúide am an tagartha chun an fad céanna a bhaint amach, "+0.48 s" - nó "tagarmharc"; **⋯** chun gach luach eile a thaispeáint nó a cur i bhfolach (mar an rud céanna le *Gach luach ar na cártaí*). Aibhsítear cárta an chairr atá á leanúint.

**An carr ón mbarr:** imlíne na coirp i dath na cuaird le saighead ag an tosaigh, ceithre rotha (na tosaigh casta suas le 28° leis an stiúir), gach ceann daite de réir a theochta, leis na glífeanna céanna agus an carr 3D tarraingthe réidh: fáinne sleamhnaithe, barra fionraí, lonradh coscáin, banda caite, barra lódála.

**Taispeáintí:** luas km/h, am féin na cuaird, a fad feadh an tagartha.

**Ionchuir:**

- roth stiúrach a chasann an t-ionchur stiúir (glas iomlán tarraingthe mar 180°) leis an gcéatadán faoi;
- barra do gach cos, ó chlé go deas mar i mbosca cos - cluiche, coscán, luasaire - gach ceann lena chéatadán agus gearrainm, ina dhath (na cosa a iompraíonn an chuaird amháin);
- an giar (R le haghaidh cúlghiaraithe, N le haghaidh neodrach);
- lampa beag do gach cainéal ar/as a iompraíonn an chuaird - coscán láimhe, ABS, TC, DRS, teorainn pit, san aer - lasta ina dhath agus é ar siúl (os cionn leath a raoin);
- taispeáint leibhéil do gach cainéal leibhéil: cothromaíocht coscáin, socruithe ABS agus TC, borradh, breosla.

**Rian na n-ionchur:** **6 soicind** dheireanacha de gach cos (lána amháin, gach ceann ina dhath) agus an stiúir (a lána féin, lárnaithe), ag críochnú ag an nóiméad seo - an rud a rinne an tiománaí ar an mbealach isteach ann. Suas le 160 pointe.

**Gach luach** (⋯ nó *Gach luach ar na cártaí*): gach scalar eile a iompraíonn an chuaird ag an nóiméad seo, ansin gach cainéal de réir rothair mar cheithre luach (FL FR RL RR), ainmnithe ón tábla cainéal nó ó ainm féin an chainéil, ordaithe de réir grúpa.

## Do fhorbróirí {#for-developers}

Cód: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### An tábla cainéal {#the-channel-table}

Is é `CHANNELS` in [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) an t-aon áit amháin a dtuairiscítear cainéal: a aonad, an bhfuil sé ina luach amháin in aghaidh samplaithe nó ceann amháin in aghaidh an rothair (stóráilte mar `name.FL` …), a ghrúpa, raon taispeána, conas a tharraingítear ar an gcarr é (`glyph`), conas a léiríonn sé ar an gcárta (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), an graf réamhshocraithe é, an céimníonn sé seachas a mheascadh (giar, bratacha), agus conas a thaispeántar é (scála, aonad, digití). Is teachtaireachtaí i ngach teanga iad lipéid agus gearrainmneacha (`race.channel.<name>.label` / `.short`).

Cainéil a bhfuil tarraingt nó graf réamhshocraithe acu:

| Cainéal | Aonad | Tarraingthe mar | Graf réamhshocraithe |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (glas, dearg, …), taispeánta i % | tá |
| `handbrake` | 0..1 | lampa | tá |
| `steer` | -1..1, dearfach ar dheis | roth stiúrach | tá |
| `gear` | - | giar | tá |
| `speed` | m/s, taispeánta km/h | - | tá |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampa | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | taispeáint leibhéil | - |
| `tireTemp` (do gach rothar) | °C, taispeáint 40-130 | dath rothair | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (do gach rothar) | mar a scálaíonn an cluiche é, taispeáint ±1.5 | fáinne sleamhnaithe | - |
| `combinedSlip`, `slipIndex` (do gach rothar) | taispeáint 0-1.5, 0-1 | fáinne sleamhnaithe | - |
| `suspension` (do gach rothar) | 0..1 | barra fionraí | - |
| `brakeTemp` (do gach rothar) | °C, taispeáint 100-900 | lonradh coscáin | - |
| `tireWear` (do gach rothar) | 0..1 | banda caite | - |
| `wheelLoad` (do gach rothar) | N, taispeáint 0-12 000 | barra lódála | - |

Cinn eile sa tábla (graifithe agus liostaithe, gan tarraingt): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (uillinn sleamhnaithe), `loose`, `lateral` (fritháireamh ón tagarmharc), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, chomh maith le `time`, `distance`, `x`, `y`, `z`.

**Cainéal nach bhfuil sa tábla** léitear fós é, graifithe (faoi *eile*) agus liostaithe ar na cártaí, ainmnithe óna ainm féin. **Chun ainm ceart, aonad agus tarraingt a thabhairt dó**, cuir iontráil amháin leis an tábla (agus a theachtaireacht lipéid le gach `src/i18n/locales/<language>/race-channels.json`). Is iontráil amháin i `WHEEL_GLYPHS` (glyph.ts) agus a dúbailt réidh `CARD_GLYPHS` (RaceHud.tsx) cineál nua tarraingte rothair; tá an dá cheann clóscríofa ag an gcineál, mar sin teipeann ar an tógáil go dtí go mbíonn an dá cheann ann. Seiceálann `src/race/extensible.test.ts` go sroicheann cainéil anaithnid na graif, go bhfuil gach glyph sa tábla inti-tarraingthe, agus go lasann na lampaí.
