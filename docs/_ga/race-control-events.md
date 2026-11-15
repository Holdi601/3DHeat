---
title: "Imeachtaí rialaithe gluaisteáin"
parent: "Anailís rása"
nav_order: 54
lang: "ga"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Imeachtaí smachta gluaisteáin

Breathnaíonn an t-amharcán ar conas a tiomáineadh gach lap agus marcálann sé na háiteanna inar sleamhnaigh an carr, inar chas sé timpeall, inar bhuail sé rud éigin nó inar chaill sé greim. Tá sé úsáideach mar is é an botún a chaill am an rud is tapa le ceartú.

![An chuid Smacht ar an gcarr: cé chomh minic is a ghlas gach lap roth, a chas nó a bhrúigh sé amach, agus liosta na lochtanna le ceann amháin oscailte](../assets/img/en/race-control-table.webp)

## I bhfocail shimplí {#in-plain-words}

- **Glasáil**: brúann tú an coscán chomh crua sin go stopann roth ag casadh agus go sleamhnaíonn sé. Stopann an carr níos measa agus ní féidir stiúradh leis.
- **Rothchasadh**: brúann tú an luchtaire chomh crua sin go gcasann na rothaí tiomána níos tapúla ná mar a bhogann an carr. Cailleann tú tarraingt.
- **Ró-stiúradh**: sleamhnaíonn cúl an chairr amach go leithead. Má théann sé timpeall go hiomlán, is **casadh timpeall** é sin.
- **Tearc-stiúradh**: sleamhnaíonn tosach an chairr amach go leithead ("ag brú"); ní chuidíonn sé leat an roth a chasadh níos mó.
- **Buille** agus **tuairt**: bhuail an carr rud éigin (is cnag nó scrábadh é buille, is tuairt chrua é tuairt).
- **ABS**, **TC**: cúntóirí an chairr féin a oibríonn in aghaidh na glasála agus an rothchasaidh. Ní botúin iad.

## An chuid Smacht ar an gcarr (cad a fheiceann tú) {#the-car-control-section-what-you-see}

Don lap atá in fócas, cibé rud a iompraíonn na laps - gan aon sleamhnú rubair ná uillinn drift, taispeánann sé an rud a fhágtar fós in ann a aimsiú seachas aon rud (thíos).

**An tábla**: sraith amháin do gach cineál a thaispeánann lap amháin ar a laghad - Rothaí glasáilte, Rothchasadh, Cúl ag sleamhnú amach (ró-stiúradh agus casadh timpeall), Ag brú amach, Tuairteanna, Buillí, ABS ag obair, Rialú tarraingthe ag obair, Coscán láimhe, San aer - agus gach cill "líon · soicindí", don lap atá in fócas agus don lap a chuirtear i gcomparáid leis; agus *An uillinn drift is mó* nuair a bhíonn uillinn drift ann (an ceann is mó ar an talamh).

**An liosta**: a lochtanna neamhroinnte a chosnaíonn 0.02 s ar a laghad, is costasaí ar dtús, 12 ar a mhéad, gach ceann lena theideal agus a chostas (agus a lipéad cineáil). Cliceáil ar cheann chun a leid a léamh, na carranna a ailíniú 40 m roimhe agus athsheinm a dhéanamh air. **Chomh maith leis sin an méid a rinne an dá lap ann** cuireann sé gach locht leis, na cinn roinnte san áireamh (lipéad "rinne an bheirt é", costas "—" faoi 0.01 s). Gan aon cheann: "Ní raibh aon rud a rinne X leis na rothaí dó costas ama nár rinne Y freisin."

**An leid faoi** a deir cad a bhí an bhrath in ann a úsáid - "Ó shleamhnú agus uillinn sleamhnaithe gach roth, agus ó uillinn drift an chairr." (nó sleamhnú agus uillinn sleamhnaithe, sleamhnú agus uillinn drift, sleamhnú amháin, nó "Ó uillinn drift an chairr amháin - ní iompraíonn na laps seo sleamhnú rubair.") - an talamh ar tomhaiseadh na teorainneacha dó (tarmac, scaoilte, measctha: thar 80% de shamplaí scaoilte is scaoilte é, faoi 20% is tarmac é), cén lap ar cuireadh na himeachtaí i gcomparáid leis, agus conas a áirítear an costas.

Le **gan sleamhnú rubair agus gan uillinn drift** (comhad lap FH Companion gan a thelemetry) taispeántar an tábla agus an liosta mar an gcéanna, agus deir an leid cad a fuarthas fós ón méid a iompraíonn na laps: "Ní iompraíonn na laps seo sleamhnú rubair ná uillinn drift, mar sin ní féidir glasáil agus rothchasadh a aithint. Fós aimsithe: brú amach, ón stiúradh i gcoinne an chosáin; buillí agus tuairteanna, ón luas agus ón luasghéarú." - sleamhnuithe ón ráta giotáin ainmnítear freisin i gcás go bhfuil ceann ag na laps, agus brú amach amháin i gcás go bhfuil stiúradh iontu. Fágtar an abairt ar theorainneacha sleamhnaithe agus drift ar lár, agus deir dara leid: "Le haghaidh Forza Horizon, roghnaigh an comhad `.tele.gz` in aice le gach lap FH Companion freisin: is é an telemetry iomlán é, sleamhnú gach roth 64 uair sa soicind."

Déanann **iomlán** costas smachta an lap cuntas ar lochtanna a chuireann thar a chéile - glasáil agus an sleamhnú a thosaíonn sí, laistigh de 40 m - uair amháin, ag an gcostasaí sa bhraisle.

## Conas a bhraitear é {#how-it-is-detected}

Is é an chuid eile den leathanach seo an leabhar rialacha: gach cineál, gach tairseach.

Cód: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Tá an réasúnaíocht agus an litríocht sa [modh](race-analytics.md).

## Na cineálacha {#the-kinds}

| Cineál | Sraith sa tábla | Locht? | An ghearrthréimhse is giorra a áirítear |
|---|---|---|---|
| `lock` | Rothaí glasáilte | tá | 0.1 s |
| `wheelspin` | Rothchasadh | tá | 0.15 s |
| `oversteer` | Cúl ag sleamhnú amach | tá | 0.2 s |
| `spin` | (áirítear le Cúl ag sleamhnú amach) | tá | 0.1 s |
| `understeer` | Ag brú amach | tá | 0.25 s |
| `crash` | Tuairteanna | tá | - |
| `hit` | Buillí | tá | - |
| `abs` | ABS ag obair | níl | 0.2 s |
| `tc` | Rialú tarraingthe ag obair | níl | 0.2 s |
| `handbrake` | Coscán láimhe | níl | 0.1 s |
| `airborne` | San aer | níl | 0.15 s |

Is torann iad rithe níos giorra (cuaille, bumpa, aon sampla amháin). Joinntear rithe de phointí greille (gach 2 m) a rith tástáil thar bhearnaí de 2 phointe ar a mhéad. Ní féidir ach le **lochtanna** a bheith ina mbotúin agus costas a bheith orthu; is é an chuid eile an rud a rinne an carr agus an tiománaí.

## Cad a theastaíonn ó gach tástáil {#what-every-test-needs}

### Cainéil dhíorthaithe {#derived-channels}

Sula ndéantar aon mheas, faigheann gach lap an rud nach seoltar ag a chluiche, faoi ainmneacha canónacha (buann luach an chluiche féin i gcónaí):

| Cainéal | Ó |
|---|---|
| `bodySlip` (uillinn drift) | an luas sa chreat an chairr, `atan2(latVel, abs(longVel))`, nuair a sheolann an cluiche é (0 faoi 3 m/s); seachas sin, an ceann-treo (giotán an chluiche, oiriúnaithe do threo an taistil de réir comhartha agus ofráil thar shamplaí níos tapúla ná 10 m/s, agus ní iontaofa ach nuair a bhíonn an fhilleadh chiorclach faoi 0.05) i gcoinne threo an taistil (suíomhanna 2 m ar a laghad óna chéile), ag luasanna thar 3 m/s |
| `yawRate` | athrú `yaw` le himeacht, nuair a bhíonn ceann-treo ann ach gan ráta |
| `airborne` | teagmháil talún gach roth as (≤ 0.5); seachas sin, ualach gach roth faoi 5% dá mheán; seachas sin, fad fionraí gach roth ag nó faoi 0.02 (síneadh iomlán). Ní eitilt é aon sampla seachránach amháin |
| `slipRatio.<W>` | `(luas dromchla an rotha - luas an chairr) / luas an chairr` os cionn 3 m/s, nuair a sheolann an cluiche luasanna dromchla rothaí; nó ó rothlú roth × ga rolla a tomhaiseadh ar an lap - an mhedian de `speed / rotation` le linn seoladh díreach ar an gcosán (luas > 10 m/s, luchtaire < 0.3, coscán < 0.05, abs(luasghéarú fadlínteach) < 3 m/s², gan a bheith san aer; gach sampla os cionn 10 m/s nuair is lú ná 20 ann), glactha idir 0.1 agus 1 m. Marcáilte `physical` |
| `loose` | torann dromchla Forza ar 2 roth ar a laghad (> 0.001) ar feadh 0.33 s ar a laghad (is giorra ná sin cuaille), bearnaí faoi 1 s áthraithe |

### Ar an talamh agus socraithe {#on-the-ground-and-settled}

Ní mheastar aon rud san aer nó ar feadh **0.3 s tar éis tuirlingthe** - íslíonn an fionraí agus cuireann luasghéaráin spící leis, nach greim, coscán nó tiomáint é. Ní mór do shampla a bheith **ag bogadh** freisin: níos tapúla ná 5 m/s.

### An talamh {#the-ground}

Is **scaoilte** talamh gach sampla nuair a deir cainéal `loose` an lap sin (torann dromchla Forza, ábhair rothaí Trackmania), seachas sin dromchla an lap (féach [disciplín agus dromchla](race-loading-laps.md#discipline-and-surface)): tarmac, nó scaoilte aon rud eile. Coinnítear lúbáin, nósanna drift agus tairseacha ar leith do thalamh tarmac agus scaoilte.

### Sleamhnú, mar iolraí de bharr nominal rotha {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Scálaíonn cluichí sleamhnú ar bhealaí difriúla; deir `meta.slip` cén bealach, agus roinntear gach sleamhnú ar scála ionas go mbeidh thart ar 1 ar bharr nominal an rotha:

| `meta.slip` | Brí | Roinnte ag |
|---|---|---|
| `peak` | normalaithe ag an gcluiche: thar 1 cailltear an greim (Forza Data Out) | 1 |
| `scaled` | sleamhnú fisiciúil roinnte ar bharr tarmac (taifeadán Kunos) | barr nominal an talaimh thar bharr an tarmac |
| `index` | tomhas sleamhnaithe 0..1 (SlipCoef Trackmania) | 0.5 |
| `physical` (nó anaithnid) | cóimheas sleamhnaithe mar chodán, uillinn sleamhnaithe sna radanna | barr nominal an talaimh |

Barraí nominale, nuair nach bhfuil aon rud níos fearr ar eolas:

| Dromchla | Cóimheas sleamhnaithe | Uillinn sleamhnaithe |
|---|---|---|
| tarmac | 0.12 | 8° |
| measctha | 0.18 | 12° |
| scaoilte (meall) | 0.25 | 15° |
| sneachta | 0.25 | 15° |
| oighear | 0.10 | 6° |

### Cá stopann an greim: lúbáin tirim gach carr {#where-grip-ends-each-cars-tyre-curves}

Tomhaistear cá stopann rubar ag tabhairt níos mó **do gach carr**, ó gach lap ualaithe dá chuid (`measureTyres`), ar leithligh do thalamh tarmac agus scaoilte:

| Lúb | Samplaí (luas > 10 m/s, socraithe, luasghéaraithe faoi 45 m/s²) | Sleamhnú (x) | Fórsa (y) |
|---|---|---|---|
| coscán | coscán > 0.3, coscán láimhe ≤ 0.2, ag tiomáint go díreach (cliathach faoi 30% den is crua) | abs(meán cóimheas sleamhnaithe na gceithre roth) | malldhíghéarú |
| tarraingt | luchtaire > 0.8, coscán ≤ 0.05, díreach, tarraingt lánscoiteach an chairr ag an luas sin > 0.5 m/s² | cóimheas sleamhnaithe an rotha tiomána is mó | luasghéarú mar scair den tarraingt sin |
| tosach | cliathach os cionn 30% den is crua, greim an chairr ag an luas sin > 1 m/s² | an uillinn sleamhnaithe tosaigh is mó | luasghéarú cliathach mar scair den ghreim sin |
| cúl | mar an gcéanna | an uillinn sleamhnaithe chúil is mó | mar an gcéanna |

Is é "an is crua" an 99ú pearsanachán de abs(luasghéarú cliathach) an lap ar an dromchla sin (an talamh ar fad nuair a bhíonn níos lú ná 50 sampla aige). Is iad na rothaí tiomána a shocraíonn an tiomáint (tiomáint tosaigh (FWD): na tosaigh; tiomáint chúil (RWD): na cúil; AWD: ar fad; anaithnid: ar fad).

Ó 150 sampla ar a laghad, gearrtar an sleamhnú ina 6 go 14 bhosca de líon comhionann (ceann in aghaidh 40 sampla). Is é fórsa gach bosca a cheathrú uachtarach (cad a thug an rubar nuair a d'iarr an tiománaí é), réidhithe thar bhoscaí comharsanacha. Is é an **is fearr** an bosca a bhfuil an fórsa is mó aige; is é an **teorainn** an chéad bhosca tar éis an fhórsa a bheith tar éis titim **8%**. Ní bhíonn teorainn ag lúb nach dtiteann riamh sna sonraí (éigríoch) - rith thar an "barr" ní chosnaíonn sé aon rud sa chluiche sin, agus ní bhratar aon rud sa sleamhnú ansin (mar sin a bhíonn lúbáin chasaidh agus tarraingthe Forza Horizon). Le ró-bheagán samplaí ar dhromchla amháin, úsáidtear ceann an dromchla eile; le ró-bheagán ar fad, an **teorainn nominal**: 1.5 uair barr nominal.

Faigheann gach carr freisin:

- a **nós drift**: an ceathrú uachtarach dá uillinn drift in áit ar bith a lúbann sé ag 60% dá chrua nó níos mó (teastaíonn 100 sampla);
- a **stiúradh in aghaidh cuair** (`steerGain`), de réir banda luais 5 m/s: an mhedian de abs(steer) / cuar an chosáin agus é ag lúbadh go daingean ach go maith laistigh dá greim (30-60% dá chrua, cuar níos dlúithe ná ga 400 m, steer os cionn 0.02; 25 sampla de réir banda). Is é cuar an chosáin ráta an ghiotáin thar luas nuair a sheolann an cluiche ráta giotáin, seachas sin ó na suíomhanna ±5 m.

## Brath, cineál ar chineál {#detection-kind-by-kind}

| Cineál | Tástáil (ar shamplaí ag bogadh, socraithe) | `peak` agus `limit` |
|---|---|---|
| **lock** | coscán > 0.05, coscán láimhe nach mó ná 0.2, agus sleamhnú aon roth faoi theorainn an choscáin diúltach | an sleamhnú is diúltaí (iolraí de bharr nominal); an teorainn mar dhiúltach |
| **wheelspin** | luchtaire > 0.2 (nó gan cainéal luchtaire), agus sleamhnú roth tiomána os cionn theorainn na tarraingte | an sleamhnú tiomána is mó; an teorainn |
| **oversteer** (uillinn drift) | uillinn drift os cionn an mhéid is mó de urlár an dromchla agus 1.5 × nós drift an chairr ansin | an uillinn drift is mó, radanna |
| **oversteer** (uillinneacha sleamhnaithe, gan uillinn drift) | uillinn sleamhnaithe chúil is mó os cionn na teorann chúil agus níos mó ná 0.25 os cionn an tosaigh is mó | an uillinn sleamhnaithe chúil (iolraí de bharr) |
| **oversteer** (gan uillinn drift, ach ráta giotáin agus luasghéarú cliathach) | an "luas aitíde" - abs(ráta giotáin) lúide abs(luasghéarú cliathach) / luas, os cionn 8 m/s - thar 0.2 rad/s, agus an stiúradh i gcoinne an casaidh | rad/s; teorainn 0.2 |
| **spin** | rith ró-stiúrtha a shroich a uillinn drift **60°** | mar oversteer |
| **understeer** (uillinneacha sleamhnaithe) | gan sleamhnú, uillinn sleamhnaithe tosaigh is mó os cionn na teorann tosaigh agus níos mó ná 0.3 os cionn an chúil | an uillinn sleamhnaithe tosaigh; an teorainn |
| **understeer** (gan uillinneacha sleamhnaithe) | níos tapúla ná 12 m/s, gan sleamhnú, gan counter-stiúradh, luasghéarú cliathach os cionn leath an is crua den lap (99ú pearsanachán), cosán níos dlúithe ná ga 300 m, agus stiúradh níos mó ná **1.6 uair** an méid a deir stiúradh an chairr féin in aghaidh cuair go dteastaíonn ón gcosán | an stiúradh is gá, uaire; teorainn 1.6 |
| **abs**, **tc** | `absActive` / `tcActive` os cionn 0.5 | - |
| **handbrake** | `handbrake` os cionn 0.2 | - |
| **airborne** | `airborne` os cionn 0.5 | - |
| **hit**, **crash** | féach [Buillí agus tuairteanna](#hits-and-crashes) | an luas a bhain an tionchar |

Urláir uillinne drift de réir dromchla: tarmac **7°**, measctha **10°**, scaoilte agus sneachta **15°**, oighear **10°**. Tá tairseach níos airde ag carr a rithfidh níos mó mar ghnáth - samhail rothair arcade, speisialtóir gaineamh - ó na laps féin (1.5 × a nós).

**Cén treo a lúbann an carr** (le haghaidh "in aghaidh an chasaidh"): athrú ceann-treo chosán an lap féin thar ±6 m (2 phointe greille ar a laghad); níos dlúithe ná ga 600 m, áirítear mar lúbadh; ar dheis nó ar chlé de réir an bhfuil an domhan íomhánaithe. Tá an stiúradh **in aghaidh** an chasaidh nuair a bhíonn abs(steer) > 0.05 agus a chomhartha contrártha leis an gcasadh - sleamhnú a **ghabhtar** le glas contrártha.

**Na pedail mar a thosaigh sé** (`pedal`): *coscán* nuair a bhíonn an coscán os cionn 0.1; *luchtaire* os cionn 0.3; *scaoilte* nuair a bhí an luchtaire os cionn 0.5 laistigh de na 8 phointe greille (16 m) roimhe sin; *ag seoladh* seachas sin (nó gan cainéal luchtaire).

## Curtha i gcomparáid leis an lap eile {#laid-against-the-other-lap}

Breithnítear gach imeacht i gcomparáid leis an lap a bhfuil an lap atá in fócas curtha i gcomparáid leis sa ghné sin (an ceann is fearr dá rang; don lap féin, an duine dá rang is tapúla tríd an ngné).

1. **Cé chomh fada is a chuaigh an lap eile** thar na méadair chéanna, ±8 m: imeachtaí féin an lap eile den chineál céanna (is ró-stiúradh casadh timpeall, is buille tuairt), tomhaiste sna haonaid chéanna, gan tairseacha, ag úsáid lúbáin rothair an chairr eile.
2. **Roinnte** nuair a chuaigh an lap eile **80%** chomh fada nó níos faide: is é sin an bealach a thiomáintear an cúinne, ní botún é. Is i gcónaí "roinnte" na cineálacha neamhlochtacha.
3. **Costas**, do locht neamhroinnte: an t-am a chaill an lap seo i gcoinne an eile ó 5 m roimh an imeacht go **40 m tar éis** dó (le buille nó tuairt, go dtí go mbeidh luas an chairr ar ais aige - na méadair chun é a fháil ar ais ag a tarraingt féin, 40 go 400 m; gan tarraingt tomhaiste, 5 m/s²). Ní bhíonn sé diúltach riamh.
4. **Luas tugtha** don teorainn an chairr: le haghaidh glasála, an mhalldhíghéarú a thaispeánann an carr gur féidir leis a dhéanamh ag an luas sin lúide an méid a rinne sé, suimithe thar an imeacht; le haghaidh rothchasaidh, a tarraingt lánscoiteach lúide an méid a rinne sé; le haghaidh tionchair, an luas a bhain sé. Ráite nuair a bhíonn sé os cionn 0.5 m/s (1.8 km/h).

Liostaítear locht nach roinnte agus a chosain 0.02 s ar a laghad ([staitisticí an chúrsa](race-course-statistics.md) áiríonn siad lochtanna de 0.03 s nó níos mó amháin, ionas gur botún soiléir é botún a áirítear thar go leor laps), agus is féidir leis a bheith ina chúis le caill cúinne (féach [Anailís cúinne ar chúinne](race-corner-analysis.md#car-control-faults-and-impacts)).

## Buillí agus tuairteanna {#hits-and-crashes}

Léann `impacts.ts` buillí ó **shamplaí féin an lap**, sula ndéantar athshamplú orthu - is thar an gcéad ghiota de sheicind a dhéantar buille. Ní féidir le rothair fórsaí buille a dhéanamh, mar sin tomhaistear buille i gcoinne charr an lap féin:

- **A ghreim `G`**: an 99ú pearsanachán dá luasghéarú cothrománach `√(lat² + long²)` thar an lap, ar an talamh agus níos tapúla ná 5 m/s. Gan cainéil luasghéaraithe (nó faoi 3 m/s²), 15 m/s² - greim carr bóthair.
- **Tairseach**: `max(1.8 G, G + 18, 30)` m/s².
- **Sampla buailte**: an luasghéarú cothrománach os cionn na tairsí *agus* léim níos mó ná leath de `G` ón sampla roimhe; **nó** an luas ag titim, laistigh de 0.1 s, níos mó ná mar a thógfadh an tairseach i 0.1 s móide 1.5 m/s. Ar an talamh agus socraithe amháin, agus nuair a bhí an carr níos tapúla ná 5 m/s amháin.
- Samplaí buailte laistigh de **0.4 s** = buille amháin.
- **Roimh / tar éis**: an luas is airde sa 0.15 s roimhe; an íosluas go dtí 0.3 s tar éis an tsampla bhuailte deiridh.
- **Ní tionchar é**: luas caillte gan fórsa taobh thiar de - an luasghéarú cothrománach is airde laistigh de 0.1 s faoin ceann is mó de `G` agus 25 m/s² - is é an cluiche a chasann siar an carr nó a athshocraíonn é.
- **Tuairt** nuair a thóg sé **30 km/h** nó níos mó, nó nuair a d'fhág sé an carr faoi leath a luais; **buille** seachas sin - cnag, scrábadh feadh balla.
- **Treo**: an luasghéarú fadlíneach níos mó ná an cliathach, agus diúltach: *ceann le ceann*; dearfach: *ó chúl*; an cliathach níos mó: *feadh a thaobhaidh*. Gan luasghéaraithe, ceann le ceann.

Tomhaistear cad is féidir le carr a dhéanamh le gach tionchar fágtha as, ó 0.1 s roimhe go 1 s tar éis dó (`struckMask`).

## Na téacsanna {#the-texts}

Ráitear gach imeacht ag ainmniú an dá lap, leis an áit (méadair feadh an tagartha), an luas a thosaigh sé air, cé chomh fada os cionn na teorann i gcoinne an lap eile, agus leid. Leanann an leid an cineál agus an rud a tomhaiseadh:

| Imeacht | Leid |
|---|---|
| glasáil, na tosaigh amháin | ní féidir le tosach glasáilte stiúradh: níos lú brú ag barr an limistéir, scaoil é isteach sa chasadh |
| glasáil, na cúil amháin | lig do thosach glasáilte an carr a rothlú: coscán níos mó i líne dhíreach, scaoil ar an gcasadh isteach; bog an claonadh chun tosaigh más rud é go dtarlaíonn sé arís is arís eile |
| glasáil, talamh scaoilte | rollann roth glasáilte tríd an talamh: brúigh go dtí díreach roimh an nglasáil |
| glasáil, seachas sin | an iomarca pedal don ghreim: brúigh níos mó go céimniúil |
| rothchasadh | cuir an luchtaire isteach mar a scaoileann an stiúradh; athraigh gear go gearr nuair a bhíonn an tarraingt teoranta (ar thalamh scaoilte: maolaíonn gear níos airde an torque) |
| spin / ró-stiúradh | de réir an phedail: faoi choscán (coscán-chasadh ró-dhian, athrú gear ró-luath), scaoilte (scaoilte ag ardú: coinnigh luchtaire seasmhach), ar an luchtaire (an iomarca fós casta), ceachtar (casta isteach ró-thapa); "gabhtha le glas contrártha" nuair a bhí counter-stiúradh; ar thalamh scaoilte nó i ralaí, "is é uillinn áirithe an bealach tapa thart - bhí sin leordhóthanach don rith eile" |
| tearc-stiúradh | ní chuidíonn stiúradh níos mó nuair a bhí an tosach imithe: tar níos moille, coinnigh coscán beag chun an tosach a ualú, scaoil; ar thalamh scaoilte, lúb an carr le scaoilte nó le dab ar an gcos chlé |
| buille / tuairt | feadh an taobh: méadar corrlaigh costas níos lú ná an scrábadh; ó chúl: carr eile nó ag sleamhnú siar; tuairt ceann le ceann: coscán níos luaithe; cnag ag an tosach: bhain sé le rud éigin. "Bhuail X ann freisin." nuair a bhí sé roinnte |

I Trackmania, deir sleamhnú freisin: faoi thart ar **400 km/h** (**300** ar thalamh scaoilte: salachar, féar, plaisteach) tugann sleamhnú tiomáint níos lú ná mar a thugann greim; thuas air sin, gnóthaíonn sleamhnú luais ag an uillinn cheart, agus chaill seo am mar bhí a uillinn as alt.

## Cad a cheadaíonn gach foinse {#what-each-source-allows}

| Iompraíonn na laps | Glasáil / rothchasadh | Ró-stiúradh / casadh timpeall | Tearc-stiúradh |
|---|---|---|---|
| cóimheas sleamhnaithe agus uillinn sleamhnaithe in aghaidh rotha, luas an chairr (Forza Data Out, cluichí AC) | ó shleamhnú | ó uillinn drift, nó uillinn sleamhnaithe chúil | ó uillinneacha sleamhnaithe |
| luasanna rothaí, luas domhanda (cluichí ralaí, BeamNG) | ó shleamhnú díorthaithe | ó uillinn drift dhíorthaithe | ó stiúradh in aghaidh cuair |
| giotán agus ráta giotáin, gan sleamhnú (iRacing) | - | ón uillinn drift (an giotán oiriúnaithe i gcoinne threo an taistil); ón luas aitíde le counter-stiúradh amháin nuair nach féidir an giotán a iontaobhú | ó stiúradh in aghaidh cuair |
| ceann-treo amháin | - | ó cheann-treo i gcoinne taistil | ó stiúradh in aghaidh cuair |
| comhad lap FH Companion amháin (gan giotán, gan sleamhnú) | - | - | ó stiúradh in aghaidh cuair (tá stiúradh agus luasghéaraithe aige) |

Teastaíonn ó bhuillí agus tuairteanna luas amháin (is fearr le luasghéaraithe), mar sin tá siad ag gach foinse. Taispeánann an chuid **Smacht ar an gcarr** cad a cheadaíonn gach foinse: le comhad lap FH Companion amháin, a bpuisheanna ó stiúradh agus a mbuillí, agus an leid an `.tele.gz` a lódáil don chuid eile.
