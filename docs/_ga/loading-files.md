---
title: "Comhaid á lódáil"
parent: "Sonraí a iontráil"
nav_order: 1
lang: "ga"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Comhaid a lódáil

Taispeánann an leathanach seo conas do chomhaid a thabhairt do 3DHeat agus cad a dhéanann sé leo. Scaoil fillteán isteach, agus roghnaíonn sé na comhaid a bhfuil suíomhanna iontu agus cumascann siad ina pictiúr amháin.

1. Oscail **Foinse** ag barr an bhóthair chliathánaigh Teas.
2. Scaoil comhaid nó fillteán ar an limistéar scaoilte, nó brúigh **Comhaid…** nó **Fillteán…**.
3. Léigh líne an roghnaithe agus an **Meastachán cuimhne** (féach an pictiúr thíos).
4. Brúigh **Lódáil**.

![Painéal na Foinse tar éis fillteán de dheich gcluiche a scaoileadh: 1 líne an roghnaithe, 2 an Meastachán cuimhne ag fits, agus 3 Lódáil 10 gcomhad](../assets/img/en/loading-files-source.webp)

*Tar éis duit fillteán a scaoileadh, insíonn 3DHeat cad a fuair sé agus an bhfuil sé ar fáil.*

Lódáiltear comhaid sa phainéal **Foinse** ag barr an bhóthair chliathánaigh den chluaisín Teas. Déantar **aon** tacar sonraí amháin de gach rud a roghnaítear ag an am céanna.

## Comhaid a roghnú {#choosing-files}

| Rialú | Cad a dhéanann sé |
|---|---|
| **Scaoil comhaid nó fillteán anseo** (an limistéar scaoilte) | Scaoil aon mheascán comhad agus fillteán. Siúltar fillteáin go hathchúrsach. Má chliceáiltear ar an limistéar scaoilte osclaítear an roghnóir céanna le **Comhaid…**. |
| **Comhad amháin…** | Roghnóir comhaid do chomhad amháin. |
| **Comhaid…** | Roghnóir comhaid a ghlacann le roinnt comhad. |
| **Fillteán…** | Roghnóir fillteáin (roghnóir `webkitdirectory` an bhrabhsálaí); tairgtear gach comhad i gcrann an fhillteáin. |

Glacann na roghnóirí leis na cineálacha comhad sa [liosta comhad inlódálta](data-formats.md#files). Go hachomair: léitear `.parquet`/`.pq` mar Parquet, `.csv`/`.tsv`/`.txt` mar théacs scartha, téann `.acmi` (Tacview), OCAP `.json`/`.json.gz` agus na formáidí GPS (GPX, KML, KMZ, NMEA, IGC, FIT) tríd na léitheoirí féin, agus lódáiltear coimeádáin chluichí `.3dheat` mar na táblaí a choinníonn siad ([Comhad amháin cluiche](container.md)). Scipeáiltear coimeádán nach féidir a léamh mar *not a csv/parquet file*.

Siúltar fillteáin scaoilte go doimhneacht 12 leibhéal agus 20,000 comhad ar a mhéad, mar chosaint in aghaidh lúbanna naisc shiombailigh agus crainn gan srian.

## Na comhaid a choinnítear {#which-files-are-kept}

Sula léitear aon rud, scagtar an roghnú ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Scipeáiltear comhad a bhfuil síneadh eile air: *not a csv/parquet file*.
- Scipeáiltear comhad 0 bhearta: *empty (0 bytes)*.
- **Sáiteáin tiontaire** - na sonraí amha a choinníonn tiontaire taobh le tábla cluiche, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` agus na cinn eile atá liostaithe in [Coinníonn tiontairí gach rud](converters.md) - scipeáiltear iad: *a converter's sidecar*. Chun ceann a oscailt, roghnaigh nó scaoil ar a shon féin é (nó sáiteáin amháin): lódálann roghnú de shláiteáin amháin iad mar aon tábla. Ní thairgtear an JSON taobh le tábla (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` agus `.hints.json`) mar shuíomhanna go deo.
- **Riail an chomhaid gluaiseachta.** Má tá comhad ar bith sa roghnú dar teideal `movement*.parquet`, `movement*.csv` (agus na síneadh eile) - `movement.parquet`, `movement_1.parquet` agus mar sin de - scipeáiltear gach comhad sonraí eile: *not a movement file, and this folder has movement files*. Is minic a bhíonn tábla amháin suíomhanna i gcomhthéacs telemetry ar taobh le dosaen tábla gan suíomhanna, agus ní féidir ach an ceann a bhfuil suíomhanna ann a tharraingt. Lódálann fillteán gan aon chomhad gluaiseachta a chomhaid sonraí go léir. Sampla: lódálann fillteán le `movement_1.parquet`, `kills.parquet` agus `shop.parquet` `movement_1.parquet`; liostaítear an dá cheann eile mar scipeáilte. Sampla: lódálann fillteán le `movement_1.parquet`, `kills.parquet` agus `shop.parquet` `movement_1.parquet`; liostaítear an dá cheann eile mar scipeáilte.
- Cuirtear na comhaid a choinnítear in ord de réir a gcosáin laistigh den roghnú, ionas go dtáirgeann an fillteán céanna an tacar sonraí céanna agus na dathanna céanna i gcónaí.

Taispeánann an painéal ansin an roghnú (ainm comhaid amháin, nó `folder (N files)` ag úsáid an fho-fhillteáin is comónta is faide), líon na gcomhad, a n-iomlán méide agus iomlán na línte - beacht nuair is Parquet gach comhad, marcáilte `≈` nuair is CSV ceann ar bith. Liostaítear comhaid scipeáilte lena gcúis, na ceithre cinn is luaithe ainmnithe.

## Scéimre a léamh {#reading-the-schema}

Osclaítear an **chéad** chomhad den roghnú chun an scéimre a thuairisciú ("Reading schema"): a ainmneacha colún, a 50 chéad sraith sonraí, cé na colúin a bhfuil cuma uimhriúil orthu agus, do Parquet, cineál loighciúil gach colúin agus iontráil bonnlíne `heat3d`. Roinneann fillteán onnmhaithe de thábla amháin scéimre amháin, mar sin seasann comhad amháin do gach ceann. Ansin tomhaistear gach comhad ("Counting rows"): tugann bonnlíne Parquet an líon beacht i léamh beag amháin; meastar líon CSV ó mheán fhad na líne sa chéad mheigabheart.

Osclaíonn painéal [Mapáil na gcolún](column-mapping.md) leis na tuairimí uathmhapáilte, agus tagann an [meastachán cuimhne](memory-and-budgets.md) os cionn chnaipe **Lódáil**.

## Teachtaireachtaí roimh an lódáil {#messages-before-loading}

Faoin roghnú liostaíonn an painéal, ó [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Earráidí** (dearg) - ní féidir an lódáil a thosú: níos lú ná dhá ais suímh, an colún céanna ar dhá ais, colún mapáilte nach bhfuil sa chomhad, colún suímh nach cuma uimhriúil air, colún ama a bhfuil a luachanna samplaithe ina téacs cé go bhfuil an t-aonad ina uimhir (léifí gach sraith mar NaN agus thiteadh sé ag am 0), colún ama socraithe ISO-8601 nach bhfuil aon luach samplaithe ina dháta, scála aonaid 0.
- **Rabhaidh** (ómra) - lódálfaidh sé, ach is dócha nach mar a bhí i gceist: colún grúpa a ghlacann luach ar leith ar an gcuid is mó de na sraitheanna samplaithe (is aitheantas é mar sin, ní grúpa), colún ama `DATE` (roinneann gach sraith lae an nóiméad céanna), treo amhairc socraithe gan a cholúin.
- **Nótaí** - an rud a thugann an mhapáil le tuiscint: tarraingt ar phlána nuair a bhíonn ais amháin gan mhapáil, gan amlíne gan colún ama, gan rianta gan colún duine, agus gan colún grúpa dath amháin do gach rud agus scoilt difríochta nach féidir ach ar cholún coinnithe le haghaidh scagtha a dhéanamh.

## Lódáil {#loading}

Léann cnaipe **Lódáil** *Load file*, *Load N files*, nó *Load N files (1 in K)* nuair a bhíonn [céim dhíghrádaithe](memory-and-budgets.md#decimation) socraithe. Léann sé *Too large - reduce or decimate* agus díchumasaítear é nuair a deir [seiceáil an oiriúnaithe](memory-and-budgets.md#the-fit-check) nach mbeidh an lódáil ar fáil; díchumasaítear é freisin fad a bhíonn earráidí sa mhapáil nó lódáil eile ar siúl.

Le linn lódála, taispeánann an painéal an chéim reatha (le `[file/files]` os a comhair nuair a bhíonn comhaid iomadúla ann), na sraitheanna léite go dtí seo, barra dul chun cinn, agus **Cealaigh**. Cuireann Cealaigh deireadh leis an oibrí ionchuir, agus leis aon oibrithe parsála a thosaigh sé.

Leanann an leathanach de tarraingt le linn lódála, mar tarlaíonn an obair sa chúlra. Feiceann tú an chéim reatha, na sraitheanna léite, barra dul chun cinn agus **Cealaigh**. Tar éis an chomhaid dheireanaigh taispeánann an painéal na céimeanna *Putting rows in time order*, *Reordering columns (n of m)*, *Measuring extent*, *Building the roster*, *Summarising sessions* agus *Computing lifetimes*, ansin *Uploading N rows to the GPU* ar feadh fráma amháin, ionas nach gcuirfear uaslódáil fhada i bhfad le reo.

### Conas a oibríonn sé {#how-it-works}

Ritheann an lódáil i Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Le comhaid iomadúla agus níos mó ná [snáithe parsála](memory-and-budgets.md#parser-threads) amháin, déantar suas go dtí an oiread sin comhad a pharsáil **ag an am céanna**, gach ceann in oibrí parsála dá chuid féin ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), a mhéad a fhágann buiséad RAM spás; cumasctar iad fós ceann i ndiaidh a chéile in ord an roghnaithe, ionas go bhfuil an tacar sonraí mar an gcéanna le lódáil ceann i ndiaidh a chéile. Agus roinnt á déanamh acu, ainmníonn líne an dul chun cinn an comhad a thuairiscigh go deireanach, agus suimíonn an barra agus an líon sraitheanna gach comhad atá ar bun. Le snáithe amháin, nó comhad amháin, déantar comhaid a pharsáil ceann i ndiaidh a chéile san oibrí ionchuir féin. Léitear na colúin a ainmníonn an mhapáil amháin: ní chosnaíonn colún neamhmhapáilte de chomhad Parquet rud ar bith; scanntar CSV beart ar bheart ach ní dhíchódaítear ach réimsí mapáilte.

## Roinnt comhad ina dtacar sonraí amháin {#several-files-become-one-dataset}

Nuair a lódáiltear níos mó ná comhad amháin ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Liosta amháin.** Is foclóirí roinnte ar fud na gcomhad iad daoine, grúpaí, seisiúin agus luachanna catagóire, mar sin is duine amháin le rian amháin an imreoir céanna in dhá onnmhairiú.
- **Tús ama amháin.** Coinnítear amanna mar shoicindí 64-giotán agus iad á gcumasc, agus athbhunaítear iad ar an am is luaithe de *iomlán* an roghnaithe, agus stóráiltear ansin mar shoicindí 32-ghiotán ón tús sin. Cuirtear ceithre onnmhairiú ó cheithre thráthnóna ina n-ord fíor, seachas iad a chur ar a chéile.
- **Ord ama amháin.** Déantar sraitheanna ó na comhaid go léir a shórtáil de réir ama le sórtáil radix (féach [teorainn an tsórtála](memory-and-budgets.md#the-sort-ceiling)).
- **Colún `Source file`.** Cuimhníonn gach sraith ar an gcomhad as a dtáinig sé, mar cholún catagóire dar teideal `Source file`. Tá sé le feiceáil in [Scagairí](filters.md) agus mar *Source file - compare two loads* sa [scoilt difríochta](difference.md). Ní fhaigheann lódáil comhaid amháin é - chosnódh colún seasta 4 bheart in aghaidh na sraithe gan aon rud a rá.
- **Colúin ar iarraidh.** Ní chuireann comhad nach bhfuil ceann de na colúin *scagaire* ann aon luachanna leis dóibh. Teipeann comhad nach bhfuil colún *róil* mapáilte ann (X, am, duine, ...) le *file has no column "name"*; i lódáil iomadúla scipeáiltear an comhad sin agus lódáiltear na cinn eile fós, agus liostaítear na comhaid scipeáilte ar an tacar sonraí. Tuairisceoidh lódáil comhaid amháin a theipeann an earráid.
- **Rabhadh easnaimh.** Nuair is lú na sraitheanna a lódáladh ná 95% de na sraitheanna a comhaireadh roimhe, iompraíonn an tacar sonraí rabhadh leis an sciar a bhí ar iarraidh - ó chomhaid nach féidir a léamh nó ó shraitheanna gan suíomh inúsáidte, a scaoiltear ar an mbealach isteach.

## Tar éis na lódála {#after-loading}

Cuireann an tacar sonraí nua ar leataobh aon tacar roimhe. Ar gach lódáil ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- glantar gach scagaire agus infheictheacht grúpa;
- athshocraítear scoilt difríochta de réir grúpa: an chéad leath de na grúpaí (suas) dearfach, an chuid eile diúltach;
- socraítear ga an spríte go dtí an síneadh cothrománach / 120 agus an sáithiú go meastachán anailíseach; socraítear méid an chiúib, fad na gathanna amhairc, luas eitilte agus na plána gar/fad ón síneadh (féach [Seisiúin, daoine agus grúpaí](sessions-persons-groups.md#entity-size));
- socraítear seisiún an athsheinm bhosca go dtí an seisiún leis na sraitheanna is mó;
- tomhaistear bealaí na teasa líne as an nua ([Teas líne](line-heat.md));
- titeann an mód radhairc ar ais go **Teas** mura dtacaíonn na sonraí nua leis an mód reatha; titeann an amlíne ar ais go **Gach rud** gan colún ama, agus an stair go **Carnach** gan saolréanna;
- cuirtear an ceann seinnte ag an tús agus stopann an athsheinm;
- frámaíonn an ceamara an tacar sonraí ar fad ón treo réamhshocraithe (ag féachaint ar feadh -Z, claonta síos thart ar 36°).

Taispeánann an painéal **Tacar sonraí** ansin ainm an tacair (an roghnú, líon na sraitheanna agus na gcomhad, agus an céim má úsáideadh ceann), `N teams · N persons · Ns span`, agus gach rabhadh a tháinig ón lódáil, in ómra, fad a bhíonn an tacar sonraí lódáilte. Baineann **Díluchtaigh** sa phainéal sin an tacar sonraí.
