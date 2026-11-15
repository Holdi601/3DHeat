---
title: "Seisiúin, daoine agus grúpaí"
parent: "Sonraí a iontráil"
nav_order: 4
lang: "ga"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Seisiúin, daoine agus grúpaí

Is **duine** rud gluaiseachta amháin (imreoir, carr). Is é an **fhoireann / grúpa** an taobh a mbaineann siad leis. Is **seisiún** cluiche nó cuaird amháin é. Féach an [gluais](glossary.md).

Is féidir le sraith amháin de chomhad na trí cinn a ainmniú:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

Is é `player` an duine, is é `team` an grúpa, is é `match` an seisiún.

Trí cholún roghnacha a chuireann síos ar *cé* agus ar *cá háit sa scéal* a bhaineann sraith le. Ionchódaítear gach ceann acu mar fhoclóir ar an lódáil: is uimhreacha beaga aitheantais in aghaidh na sraithe na luachanna téacs, agus liosta amháin de lipéid, roinnte ar fud gach comhaid den lódáil.

## Duine {#person}

Ainmníonn colún **Aitheantas duine** an rud gluaiseachta a mbaineann sraith leis: imreoir, bot, carr. Stóráiltear é mar aitheantas 32-ghiotán in aghaidh na sraithe.

Le colún duine agus colún ama, ríomhann an lódáil **saolré** gach sraithe: an t-am go dtí sampla eile ar bith den duine céanna *sa seisiún céanna*, nó "none" (luach faire, -1) nuair nach bhfuil aon sampla eile ann - fuair an duine bás, d'imigh sé, nó chríochnaigh an logáil. Is iad saolréanna a thugann an stair **Saolré** den [amlíne](timeline.md), an idirmheánú agus an stalc i [athsheinm bhosca](box-replay.md), agus briseadh na mbealaí i [teas líne](line-heat.md). Is socrú amhairc é an rud a dhéanann sraith gan chomharsa (*Ais saolré*), agus ní bácáiltear isteach sna sonraí é.

Tugtar grúpa gach duine ón **gcéad** sraith dó in ord ama; déanann an tsanntú sin a dathú a bhosca in athsheinm bhosca agus socraíonn sé cén grúpa a fholaíonn an scagaire infheictheachta é ann. Úsáideann módanna teasa grúpa gach sraithe féin ina ionad.

### Ainmneacha a iompraíonn roinnt rudaí ag an am céanna {#names-worn-by-several-things-at-once}

Ní hionann ainm agus aonán i gcónaí: i roinnt onnmhairithe logálann gach bot de gach cluiche faoin ainm céanna. Má nascann tú dhá shampla de "dhuine" den sórt sin - le hidirmheánú, rian nó bealach - tarraingítear líne idir dhá chréatúr éagsúla trasna an léarscátha.

Ag an lódáil ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) marcáiltear ainm mar **roinnte** nuair a bhíonn dhá thaifead de:

- sa seisiún céanna,
- ar an am céanna,
- den chineál céanna (gach colún catagóire coinnithe den luach céanna), agus
- níos faide óna chéile ná 1% de thrasnán shíneadh na sonraí.

Tarraingítear ainmneacha roinnte mar shamplaí aonair - gan idirmheánú, gan rian, gan bealach teas líne. Níl aon tionchar ag an gcuid eile orthu (a dteas). Liostaíonn painéal an Tacair Sonraí cé mhéad ainm a marcáladh, le trí shampla ar a mhéad, agus athdhéanann painéal athsheinm bhosca an líon.

## Seisiún {#session}

Insíonn an colún **Seisiún / cluiche** cén cluiche, cén babhta, cén rith nó cén cuaird a bhaineann sraith le. Is é a dhéanann rian leanúnach de shamplaí duine: is minic a bhíonn cluichí comhthreomhara measctha i dteiliméadracht fhíor, agus d'fhéadfadh go mbeadh sampla imreora díreach roimh an seinnteoir agus an ceann díreach ina dhiaidh ó chluichí difriúla, céadta méadar óna chéile. Le colún seisiúin:

- ní thrasnaíonn idirmheánú, rianta ná bealaí teas líne riamh athrú seisiúin;
- críochnaíonn saolré sraithe ag deireadh a sheisiúin féin;
- tagann an roghnóir **Seisiún** ag barr an bhóthair chliathánaigh, faoin mbarra módanna.

Is minic a bhíonn colún seisiúin ina *amstampa* - nóiméad thús an chluiche, athdhéanta ar gach sraith den chluiche. Is ar an gcúis sin a lorgaíonn an mhapálaí uathoibríoch ainmneacha seisiúin roimh dhuine agus grúpa ([Mapáil na gcolún](column-mapping.md#session-person-group)). Is seisiún é cuaird nó stint rásaíochta freisin: ní chóir dhá chuaird den charr céanna a cheangal i rian amháin.

### An roghnóir Seisiúin {#the-session-picker}

![Roghnóir an tseisiúin oscailte ar chomhad de dheich gcluiche: Gach seisiún (10), Match 01, Match 02 agus mar sin de](../assets/img/en/sessions-persons-groups-picker.webp)

*Deich gcluiche i gcomhad amháin: roghnaigh ceann amháin nó féach ar na deich go léir.*

Taispeántar nuair a bhfuil seisiúin liostaithe ag an tacar sonraí (féach an teorainn thíos).

| Cuid | Brí |
|---|---|
| Lipéad ar dheis | Líon sraitheanna an tseisiúin roghnaithe, nó *all at once*. |
| Roghchlár | *All sessions (N)*, ansin gach seisiún, is gnóthaí ar dtús, mar `label - N rows, span` (fad i soicindí faoi 90 s, i nóiméid faoi 90 nóiméad, i n-uaireanta os a chionn). |
| Leid ómra | Taispeántar do *All sessions*: ní nascar suíomhanna trasna seisiún riamh fós, ach cuireann cluichí comhthreomhara imreoirí neamhghaolmhara le chéile ar an léarscáil. |
| Leid | Taispeántar i módanna teasa nuair a roghnaítear seisiún amháin: ní bhogann an rogha ach an seinnteoir. |

Ar lódáil roghnaítear an seisiún is gnóthaí. Nuair a roghnaítear seisiún, cuirtear an seinnteoir go tús an tseisiúin sin.

Cad a athraíonn an roghnú:

- In **[athsheinm bhosca](box-replay.md)** cinntíonn sé cén seisiún a athsheinntear: ní tharraingítear ach boscaí agus rianta an tseisiúin sin, agus is é raon an amlíne spás an tseisiúin féin.
- I **módanna teasa** ní theorannaíonn sé an teas, agus deir leid faoin roghnóir é sin: *In the heat modes this only moves the playhead to the session's start; the heat still counts every session. Box replay plays the chosen session alone.* I módanna teasa ní bhogann sé ach an seinnteoir go tús an tseisiúin; cuireann an teas gach seisiún san áireamh fós. Seinneann athsheinm bhosca an seisiún roghnaithe ina aonar.
  Chun an teas a theorannú do sheisiún amháin, coinnigh an colún seisiúin mar cholún scagaire freisin (*Coinnigh le haghaidh scagtha*) agus scagaigh air. Is féidir colún a bheith ina cholún seisiúin agus ina cholún scagaire araon: léann an lódálaí gach colún scagaire roghnaithe ar a shon féin, pé ról eile a imríonn sé freisin.

### An iomarca seisiún {#too-many-sessions}

Liostaítear suas le **100,000** seisiún. Thar sin is aitheantas i ndáiríre an colún (fillteán le milliúin seisiún de bheagán sraitheanna an ceann), agus is é sin na lipéid go léir a sheoladh ón oibrí chuig an leathanach a rithfeadh cuimhne an tab amach. Coinníonn an lódáil ansin **aitheantais** an tseisiúin - mar sin cuirtear teorainneacha i bhfeidhm fós i ngach áit - ach scaoileann sí na lipéid agus an roghnóir, agus deir painéal an Tacair Sonraí é.

## Grúpa {#group}

Is colún ar bith é **Foireann / grúpa** le líon beag luachanna: foireann, taobh, squad, faicsean, bratach imreoir-i-gcoinne-AI, rang carr. Stóráiltear é mar aitheantas 16-ghiotán in aghaidh na sraithe agus tiomáineann sé:

- an [liosta foirne](teams-list.md) (infheictheacht de réir grúpa, + / − taobhanna),
- [teas foirne](team-heat.md) (dath amháin do gach grúpa),
- an scoilt [difríochta](difference.md) de réir grúpa,
- dathanna boscaí in [athsheinm bhosca](box-replay.md) (teaghlach dathanna amháin do gach grúpa, scáth amháin do gach ball).

### Teorainneacha {#limits}

Ar a mhéad **4,096** grúpa éagsúil. Iompraíonn an GPU an t-aitheantas grúpa sa cheathrú cainéal de theacsal suíomh gach sraithe, agus teastaíonn teacsal sa tábla comhartha 4,096-leathan a léann an sceathán le cinneadh *i bhfolach*, *curtha leis* nó *dealaithe*. Is aitheantas é colún le níos mó luachanna éagsúla, ní grúpa: **coinníonn an lódáil gach sraith agus ní scaoileann sí ach an grúpú**, agus tugtar rabhadh ar an tacar sonraí a mholann é a mhapáil mar cholún duine ina ionad, nó é a choinneáil mar cholún scagaire.

Baineann an teorainn chéanna le colún scagaire *catagóire* coinnithe; ní coinnítear colún níos leithne, agus deir an tacar sonraí é sin. Níl an teorainn sin ag colún uimhriúil (amstampa, mar shampla) mar scagaire *raon*.

Ciallaíonn luachanna grúpa `0`, luach folamh, `none`, `unknown`, `null` agus `-1` (gan aird ar chás) "gan grúpa" do [theas foirne](team-heat.md), a tharraingíonn iad i liath neodrach seachas dath muiníneach.

## Méid aonáin {#entity-size}

Cé chomh mór is atá rud amháin rianaithe - bosca imbhualadh imreora, carr - a chinneann cé chomh mór is a tharraingítear boscaí agus gathanna amhairc [athsheinm bhosca](box-replay.md). Níl réimse dó sa phainéal; tagann sé ó [leideanna `heat3d`](data-formats.md#the-heat3d-hints) an chomhaid (`entity.size`, in aonaid an chomhaid féin; scríobhann tiontaire CS2 32). Iolraíonn an lódáil é le scála an aonaid.

Ar gach lódáil ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), le *síneadh* mar an mó de raonta X agus Z na sonraí:

| Socrú | Le méid aonáin | Gan é |
|---|---|---|
| Méid ciúib | méid aonáin | síneadh / 500 |
| Fad gath amhairc | méid aonáin × 4 | síneadh / 200 |
| Ga spríte | síneadh / 120 | síneadh / 120 |
| Pointe sáithithe | meastachán anailíseach (ansin tomhaiste) | mar an gcéanna |
| Luas eitilte | síneadh / 12 | mar an gcéanna |
| Plána i gcéin | síneadh × 12 | mar an gcéanna |
| Plána gar | max(0.05, síneadh / 20,000) | mar an gcéanna |

## Painéal an Tacair Sonraí {#the-dataset-panel}

Faoi phainéal na Foinse. Nuair a bhíonn tacar sonraí lódáilte taispeánann sé:

- **ainm** an tacair - an roghnú, líon na sraitheanna, líon na gcomhad, an chéim nuair a úsáideadh ceann;
- **`N teams · N persons · Ns span`**;
- gach **rabhadh** a tháinig ón lódáil, in ómra, fad a bhíonn an tacar lódáilte: grúpaí nó colúin scagaire curtha ar lár mar go bhfuil an iomarca luachanna iontu; seisiúin nach liostaítear; ainmneacha roinnte; sraitheanna ar iarraidh; comhaid scipeáilte;
- an [ginearadóir sintéiseach](synthetic-generator.md);
- **Díluchtaigh**, a bhaineann an tacar sonraí.

Taispeántar líon na sraitheanna i gceann an phainéil.
