---
title: "Mapáil colún"
parent: "Sonraí a iontráil"
nav_order: 2
lang: "ga"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Mapáil colún

Is tábla comhad, agus caithfidh 3DHeat a fhios aige cén colún a bhfuil an suíomh thoir-thiar ann, cén colún a bhfuil an am ann, cén colún a bhfuil ainm an imreora ann, agus mar sin de. Is anseo a deir an painéal cad a thuairim sé, agus is anseo a cheartaíonn tú tuairim mhícheart.

![Painéal Mapáil na gcolún tar éis comhad Parquet a lódáil: gach bosca líonta cheana - 1 X, 2 Y, 3 Z, 4 Am, 5 Aitheantas duine, 6 Seisiún / cluiche, 7 Foireann / grúpa](../assets/img/en/column-mapping-panel.webp)

*Ainmnigh an comhad a cholúin féin, mar sin tá gach bosca líonta cheana.*

Mar shampla, déanann comhad CSV a bhfuil an ceanntáisc `x,y,z,t,player,team` mapáil é féin: éireann x, y agus z ina suíomh, `t` ina am, `player` ina [dhuine](glossary.md) agus `team` ina [ghrúpa](glossary.md).

Tar éis comhaid a roghnú osclaítear an painéal **Mapáil na gcolún** faoin bpainéal Foinse. Deir sé cén colún a imríonn cén ról. Líonann sé é féin go huathoibríoch, agus is féidir gach réimse a athrú sula mbrúitear **Lódáil**; léitear an mhapáil ag am an lódála, mar sin ciallaíonn athrú ina dhiaidh sin an lódáil a athdhéanamh.

## Na réimsí {#the-fields}

Liostaíonn na roghchláir colún go léir an chéad chomhaid, plus *- gan ceann -*.

| Réimse | Ról | Nótaí |
|---|---|---|
| **Deighilteoir** | Ach CSV: an teorannóir réimse. | Roghchlár: *Camóg ,*, *Leathphonc ;*, *Tab*, *Píopa \|*, *Spás*; nó clóscríobh aon charachtar amháin i *nó clóscríobh carachtar amháin*. Brathfar go huathoibríoch (féach thíos). Athrú air rithfidh an mhapáil uathoibríoch arís, agus cailfear na heagarthaí a rinneadh roimhe sin. |
| **X**, **Y**, **Z** | Suíomh. | Teastaíonn ar a laghad dhá cheann; is 0 an tríú ais gan mhapáil (luíonn na sonraí ar phlána). Is earráid an colún céanna ar dhá ais. |
| **Ais suas san fhoinse** | Cén ais foinse a dhíríonn suas. | *Is é Z suas (most game engines)* nó *Is é Y suas (graphics convention)*. Féach [Aiseanna, aonaid agus am](axes-units-and-time.md). |
| **Scála aonaid** | Iolraíonn gach suíomh. | Cnaipí *1 (m)* agus *0.01 (cm→m)*, nó clóscríobh luach. |
| **Cas X / Cas Y / Cas Z** | Séan ais foinse. | Cuirtear i bhfeidhm ar shuíomh agus ar veicteoirí treo an amhairc. |
| **Am** | An ais ama. | Roghnach. Gan é níl amlíne ann. |
| **Aonad ama** | Conas an colún ama a léamh. | Seacht n-aonad; féach [Aiseanna, aonaid agus am](axes-units-and-time.md#time). Déanta neamhaird de le colúin Parquet `TIMESTAMP`/`DATE`, a deir an painéal. |
| **Aitheantas duine** | Cé nó cad a bhaineann sraith le. | Roghnach. Déanann sé rianta, saolréanna, bosca athsheinm agus teas líne indéanta. |
| **Seisiún / cluiche** | Cén cluiche, cén rith, cén babhta, cén rith nó cén cuaird a bhaineann sraith leis. | Roghnach. Ní idirmheánaítear suíomhanna riamh, ní rianaítear iad ná ní nascar iad ina mbealach trasna athraithe seisiúin. Féach [Seisiúin, daoine agus grúpaí](sessions-persons-groups.md). |
| **Foireann / grúpa** | Colún ar bith le líon beag luachanna. | Roghnach. Tiomáineann dathanna grúpa, teas foirne agus an scoilt difríochta de réir grúpa. |
| **Treo an amhairc** | *Dada*, *Colúin luascadh / tuairteála* nó *Colúin veicteora treo*. | Le luascadh/tuairteáil: **Luascadh**, **Tuairteáil** agus **Aonad uillinne** (*Céimeanna* / *Radanna*). Le veicteoir: **Treo X**, **Treo Y**, **Treo Z**. Úsáidtear le haghaidh na gathanna amhairc de [athsheinm bhosca](box-replay.md). |
| **Coinnigh le haghaidh scagtha** | Colúin bhreise coinnithe sa chuimhne. | Seic-bhosca do gach colún, agus do gach ceann roghnaithe *raon* (uimhriúil) nó *catagóir*. Costaíonn gach ceann 4 bheart in aghaidh na sraithe agus pas dí-ionchódaithe ag an lódáil. Ní féidir [scagadh](filters.md) ach ar cholúin coinnithe, nó iad a úsáid le haghaidh [scoilte difríochta](difference.md) nó mar cholún imeachta de [theas líne](line-heat.md). |
| **Taispeáin rónna samplacha** | Tábla de na 12 sraith samplacha is luaithe, gach colún. | Chun na tuairimí a sheiceáil. |

Léitear colún scagaire roghnaithe nach bhfuil socraithe go sainráite mar *raon*; is minic is fearr aitheantas uimhriúil a bheith ina *catagóir*. Ní féidir ach 4 scagaire a bheith gníomhach ag an am céanna ([Scagairí](filters.md)).

## Conas a thuaraíonn an mhapáil uathoibríoch {#how-the-auto-mapping-guesses}

Tá an tuairimíocht sa [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Breathnaíonn sé ar ainmneacha colún, ar cé na colúin atá uimhriúil sna rónna samplacha (níos mó ná 90% de na luachanna neamhfholamh a pharsáiltear mar uimhreacha), ar cé mhéad luach éagsúil atá ag gach colún sa sampla, agus ar chineálacha loighciúla Parquet. Triailtear patrúin ainmneacha in ord, gan aird ar chás, agus buaileann an chéad phatrún a mheaitseálann colún saor ar bith.

### Suíomh {#position}

| Ais | Patrúin ainmneacha, in ord (colúin uimhriúla amháin) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Má tá ais fós folamh, líonann na colúin uimhriúla spártha is luaithe (gan aird ar `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) é in ord. Tá tuairim mhíchruinn le feiceáil ar an scáileán; dhéanfadh ceann folamh an fhíseán a fhágáil folamh.

### Am {#time}

- **Colúin amstampa Parquet ar dtús.** I measc na gcolún a bhfuil cineál loighciúil `TIMESTAMP` nó `DATE` acu, roghnaítear an ceann is fearr de réir scóir: +10,000 má mheaitseálann an t-ainm patrún ama, -5,000 le haghaidh `DATE` simplí, agus líon na luachanna éagsúla sa sampla. Ní bhíonn ach roinnt luachanna éagsúla ag dáta lae iomláin agus tús seasta seisiúin, mar sin buaigh an nóiméad imeachta. Is é *Amstampa Unix (ms)* an t-aonad ansin.
- **Seachas sin de réir ainm:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, ansin ainmneacha ama caite (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Ansin tuairtear an t-aonad ó na luachanna: ISO-8601 nuair a dhealraíonn luach `YYYY-MM-DDT…` nó `YYYY-MM-DD …`; seachas sin de réir an mhéid is mó: os cionn 10^17 nanaisoicind, os cionn 10^14 micreasoicind, os cionn 10^11 milleasoicind Unix, os cionn 10^8 soicind Unix, os cionn 10^6 milleasoicind, eile soicind.

Nuair a roghnaítear colún ama caite, deir an painéal go ailínítear gach seisiún lena thús féin - go maith chun cluichí a chur le chéile, ach ní chun iad a fheiceáil san ord fíor.

### Seisiún, duine, grúpa {#session-person-group}

Éilítear an seisiún **tar éis** an ais ama agus **sula** dtagann duine agus grúpa, mar is minic gur amstampa é colún seisiúin (tús an chluiche ar gach sraith den chluiche).

| Ról | Patrúin ainmneacha, in ord |
|---|---|
| Seisiún | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (gach ceann go díreach, roghnach `_id`) |
| Duine | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, ansin `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (sonraí rásaíochta: is é an carr a bhogann) |
| Grúpa | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grúpa, rogha eile | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Ní grúpa é iarrthóir grúpa a ghlacann luach ar leith ar an gcuid is mó de na rónna samplacha (níos mó ná max(48, 60% den sampla)): is aitheantas é, ní grúpa; déantar colún duine de mura bhfuarthas ceann, agus ní úsáidtear mar ghrúpa é. Mura bhfuarthas aon cholún grúpa, úsáidtear an colún neamhuimhriúil is lú luachanna éagsúla idir 2 agus 12.

### Treo an amhairc {#look-direction}

Athraíonn colún uimhriúil dar teideal `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` nó `rot_z` / `rotation_z` treo an amhairc go luascadh/tuairteáil; cuirtear `pitch`, `…rot…pitch…`, `…elevation…angle…` nó `…view…pitch…` ar lorg na tuairteála. Glactar leis go bhfuil céimeanna ann nuair a bhíonn luascadh sampla níos mó ná 7 ar mhéid, radanna seachas sin. Ní thuairimítear veicteoir treo riamh; tagann sé ó na leideanna thíos nó uait féin.

### Colúin scagaire {#filter-columns}

Coinnítear 6 cholún ar a mhéad go huathoibríoch, rangaithe:

1. `region`, `sessionMode`, `actor` - colúin atá ann chun scagadh orthu (scór 1200);
2. colúin catagóire a athraíonn sa sampla, na cinn a bhfuil níos lú luachanna éagsúla acu ar dtús (1000 lúide an líon);
3. colún seasta sa sampla, ach amháin nuair a lódáiltear comhaid iomadúla - d'fhéadfadh sé athrú idir comhaid, mar réigiún nó ID rite tástála (600);
4. colúin uimhriúla (500).

Ní thairgtear go huathoibríoch colúin a bhfuil ról acu cheana, na hainmneacha torainn thuas, colúin seasta i lódáil comhaid amháin, agus colúin téacs saor (níos mó ná max(16, leath an tsampla) luach éagsúil). Is féidir colún ar bith a roghnú de láimh fós.

### Ais suas {#up-axis}

Nuair a bhíonn an trí ais mapáilte, glactar leis gurb é an t-ais a bhfuil an scaipeadh is lú ag Y agus Z sa sampla a bheith suas (is leithne i bhfad léarscáil ná mar atá sí ard); seachas sin glactar le Z suas.

## Leideanna `heat3d` i bhonnlíne Parquet {#the-heat3d-hints-in-a-parquet-footer}

Is féidir le comhad Parquet a rá conas ba chóir é a léamh. Má tá iontráil ag meiteashonraí eochair/luacha bonnlíne an chomhaid leis an eochair **`heat3d`**, parsáiltear a luach mar JSON agus cuirtear os cionn na dtuairimí é ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Scríobhann tiontaire demo CS2 iontráil den sórt sin, mar sin osclaíonn a thablaí leis an imreoir mar dhuine, an taobh mar ghrúpa, gach babhta mar sheisiún, treo an amhairc ar siúl, agus an domhan ceart ó thaobh an chasadh de.

Ní léitear leideanna ach ón **gcéad** chomhad de roghnú. Tá gach iontráil roghnach, agus tá gach luach leid fós le feiceáil sa phainéal agus is féidir é a athrú. Tá cur síos iomlán ar an scéimre, le sampla agus conas é a scríobh, sa [tagairt Formáidí sonraí](data-formats.md#the-heat3d-hints).

Na rialacha, go hachomair:

- Cuirtear colún a luaitear i leid i bhfeidhm ach amháin má tá an colún sin sa chomhad.
- Ní thiocfaidh `lookMode: "vector"` i bhfeidhm ach nuair a bhíonn `dirX`, `dirY` agus `dirZ` socraithe go léir; `"yawPitch"` ach nuair a bhíonn `yaw` socraithe.
- Nuair a bhíonn `extra` ann, cuireann sé an liosta uathoibríoch scagaire in ionad (baintear ainmneacha anaithnide agus colúin a bhfuil ról acu cheana); leanann cineál raon/catagóire gach ceann an bhfuil sé uimhriúil le sracadh. Nuair nach bhfuil, coinnítear an liosta uathoibríoch lúide aon cholún a fuair ról ó leid.
- Caithfidh `axes.up` a bheith `"y"` nó `"z"`, caithfidh bratacha a bheith ina mbuleáin, agus caithfidh `scale` a bheith dearfach.
- Nuair a bhíonn `entity.size` dearfach, is é méid aon rud rianaithe amháin in aonaid an chomhaid ([méid aonáin](sessions-persons-groups.md#entity-size)); is é an t-aon bhealach é a shocrú.

## Fadhb ar eolas: deighilteoir CSV a shárú {#known-issue-overriding-the-csv-separator}

Nuair a athraíonn tú an deighilteoir go ceann difriúil ón gceann braite, ní athraíonn liosta na gcolún ná na rónna samplacha (roinneann an réamhamharc leis an deighilteoir braite fós). Úsáidtear an deighilteoir roghnaithe don lódáil féin fós. Mura bhfuil an deighilteoir braite ceart:

1. Oscail an comhad in eagarthóir téacs.
2. Cuir camóg in ionad an deighilteora i ngach áit (agus camóga deachúlacha in ionad poncanna deachúlacha).
3. Sábháil, agus ansin lódáil an comhad arís.

Tá an chúis sa [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
