---
title: "Taifeadtaí Tacview (ACMI)"
parent: "Sonraí a iontráil"
nav_order: 7
lang: "ga"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Taifeadtaí Tacview (ACMI)

Is clár é Tacview a thaifeadann eitiltí i gcluichí eitilte; comhaid a chríochnaíonn le `.acmi` a dhéanann sé. Oscailtear 3DHeat iad ionas gur féidir leat a fheiceáil cá eitil gach aerárthach.

Lódálann taifeadtaí eitilte Tacview cosúil le gach tábla: roghnaigh nó scaoil `.acmi` (téacs, `.txt.acmi`, nó zipáilte, `.zip.acmi`) agus brúigh **Lódáil**. Faigheann tú ansin teas gach eitilte, agus sa chluaisín **Cluiche** athsheinm le figiúir, rianta agus liosta imeachtaí ([Athsheinm cluiche](match-replay.md)). Is é ACMI formáid phoiblí comhaid Tacview ([doiciméadú](https://www.tacview.net/documentation/acmi/)); scríobhann DCS (tríd an easpórtálaí Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS agus cinn eile é, mar sin léitear aon cheann acu leis seo.

## Cad a bhíonn de thaifead {#what-a-recording-becomes}

Sraith amháin gach uair a scríobhtar suíomh réad, sraith amháin in aghaidh imeachta ag áit an réada, agus sraith amháin nuair a fhágann réad (`Removed`, san áit ar deineadh é a fheiceáil go deireanach). Is sraith de réad `(recording)` ag an bpointe tagartha imeacht maidir le réad nach bhfacthas fós - leabharmharc, teachtaireacht chuig gach duine. Iompraíonn an taifead a threoracha léirmhínithe féin, mar sin líonann an chéim mapála í féin. Scríobhann an léitheoir na colúin seo: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, agus ansin aon mhaoin eile a bhíonn ag an taifead. A bpríomhról:

| Colún | Ról | Brí |
|---|---|---|
| Time | am | Soicindí tar éis ReferenceTime an taifid; soicindí Unix nuair a bhíonn ceann aige, ionas go dtaispeánann an clog an t-am fíor. |
| X, Y | suíomh | Soir agus thuaidh, méadair, ar phlána a theagmhaíonn leis an talamh ag pointe tagartha an taifid: tá fad agus treonna fíor in aice leis, ag sleamhnú faoi chuid amháin de mhíle ag 100 km. Bíonn an tuaisceart ina -Z an domhain. |
| Altitude | suíomh (suas) | Méadair. |
| Object | duine | An píolóta agus ainm an réad lena aitheantas, mar shampla `Viper 1 (F-16C_50) #a01`; réad gan duine `(T-90A) #401`. |
| Coalition | foireann | An taobh (nó an dath, nuair nach bhfuil comhcheangal ann). |
| Heading, Pitch | féachaint | Céimeanna; is é 0 an treo thuaidh. |
| Recording | seisiún | Teideal an taifid, nó ainm an chomhaid: lódáiltear roinnt taifead taobh le taobh gan a rianta a cheangal. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | scagairí | Coinnítear le haghaidh scagadh; roghnaíonn Type agus Name [figiúr](figures.md) gach réad, cothaíonn Event liosta imeachtaí an díbhriefe, bánann Roll an aerárthach. |
| U, V | | Méadair talún comhthreomhar an chluiche féin, nuair a bhíonn siad i ngach sampla (scríobhann DCS iad). |
| EventObjects | scagairí | Gach réad a ainmníonn imeacht (`Message|a01|b02|...`), de réir aitheantais. |
| RecordingInfo | | Maoine an taifid mar a bhí siad ag an nóiméad sin - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - mar JSON. |
| IAS, Mach, AOA, FuelWeight, ... | scagairí | Aon mhaoin uimhriúil eile a iompraíonn an taifead. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | scagairí | Aon mhaoin téacs eile a iompraíonn an taifead; is téacs maoin a bhfuil luach nach uimhir ann. |

Léitear na ceithre fhoirm de shuíomh Tacview go léir (`lon|lat|alt`, le `u|v`, le `roll|pitch|yaw`, agus le gach ceann acu agus ceann tosaigh), agus coinníonn réimsí folmha an luach deiridh; scriosann `-id` réad, agus is réad nua é id a úsáidtear arís ina dhiaidh. Láimhseáiltear comhartha scapaithe agus línte leanúnacha.

Projectáiltear na suíomhanna i gcónaí ó domhanleithead agus fadlíne, ní ghlactar le U/V riamh, mar sin roinneann taifeadtaí ó gach cluiche tionscadal amháin le cúlra den domhan fíor.

## Freastalaithe DCS: cé a bhuaigh, agus conas a chríochnaigh gach ruathar {#dcs-servers-who-won-and-how-each-sortie-ended}

Taifeadann freastalaí ilimreoirí DCS a mhisin le Tacview de ló is d'oíche, agus ritheann freastalaí PvP buan feachtas thar go leor acu: buann taobh nuair a ghlacann sé gach aerpháirc, FARP agus crios den taobh eile, rud a thógann laethanta agus go leor atosuithe misin. Coinníonn na taifid na heitiltí, ní an feachtas: ní deir aon teachtaireacht cé a ghlac cad, scríobhtar na haerpháirceanna uair amháin ag an tús, agus ní deir aon cheann cé a bhuaigh. Cuireann tiontaire Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) an méid is féidir a bheith ar eolas le gach sraith, agus fágann sé folamh an méid nach féidir - ní dhéanann sé buille faoi thuairim riamh.

| Colún | Brí |
|---|---|
| `server` | an freastalaí nó an feachtas, ó cheanntásc an taifid (ainmníonn a Title, a Author agus a Comments na freastalaithe poiblí aitheanta - Blue Flag, SPS Contention, Growling Sidewinder; nó Author a ainmníonn duine éigin); ainmníonn `--server Name` é d'fhillteán iomlán. Fanann taifead nach n-ainmníonn a cheanntásc aon fhreastalaí - Author ar nós `Admin`, Title agus Comments nach scríobhann aon fhreastalaí aitheanta - gan sannadh: `server` folamh, fiú nuair a íoslódáladh é ó leathanach taifead freastalaí, mar d'fhéadfadh misin pobal eile a bheith ar an leathanach freisin |
| `mission` | Title an taifid gan a leagan ná mí an fheachtais: déantar `Operation Example` de `Operation_Example_V7.7.99` |
| `campaign` | babhta an fheachtais lena mbaineann an taifead, de réir freastalaí, léarscáile agus uimhreach: `Example Server North 3`. Is seisiún amháin taifead amháin (ó atosú go hatosú); ritheann babhta thar go leor seisiún, laethanta nó seachtainí |
| `round` | uimhir an bhabhta sin: uimhir an fhreastalaí féin nuair a fhoilsíonn sé ceann, nó an n-ú babhta a chonacthas den fhreastalaí agus den léarscáil sin; ó chomhad babhtaí (thíos), folamh gan ceann |
| `session` | áit an taifid i measc sheisiúin an bhabhta, 1, 2, ...; `sessionStart` a thús fíor (soicindí Unix) |
| `heldRed`, `heldBlue` | na háiteanna faoi chonspóid a bhí ag gach taobh ag tús an tseisiúin, ó chomhad babhtaí slabhraithe (thíos) |
| `won`, `matchWon` | 1 nuair a bhuaigh taobh na sraithe (a Color, Red nó Blue) an feachtas sin, 0 nuair a chaill sé; folamh nuair nach n-ainmníonn aon chomhad babhtaí buaiteoir, agus ar shraitheanna neodracha. Is é feachtas an babhta agus an cluiche in éineacht, mar sin coinníonn an dá cheann an rud céanna |
| `roundEndReason` | `capture` d'fheachtas a buadh trí gach rud a ghlacadh |
| `won`, `matchWon` ar gach seisiún de bhabhta | toradh an bhabhta, scríofa ar gach taifead de nuair is eol a dheireadh |
| `sortie` | ar shraitheanna aerárthaigh: a eitilt, 1, 2, ... ó éirí de thalamh go héirí de thalamh; áirítear an t-am ar an talamh roimh an gcéad éirí agus tar éis tuirlingthe leis an eitilt lena mbaineann sé |
| `sortieResult` | conas a chríochnaigh an eitilt sin: `landed`, `landed damaged` (tar éis buille san aer), `ejected`, `shot down`, `destroyed` (ar an talamh), `crashed`, `despawned` (imithe san aer gan cúis le feiceáil - imreoir ag fágáil), `airborne at end`, `no takeoff` |
| `sortieKills` | na marú a cuireadh chun sochair an aerárthaigh san eitilt sin |

I bhfreastalaí buan, is é an ruathar an t-aonad a chiallaíonn rud éigin: scag ar `sortieResult` = `shot down` chun a fheiceáil cá ndeachaigh eitiltí amú, nó miondealaigh an teas de réir `sortieResult` nó `server` sa [mhiondealú](breakdown.md). Is iad na héirí de thalamh, na tuirlingtí, na teilgin amach, na marú agus na tuairteanna atá ann na himeachtaí a oibríonn an tiontaire amach ó ghluaiseacht na n-aerárthach (thuas).

Is imeachtaí `capture` ag tús an taifid níos déanaí iad áiteanna a glacadh idir dhá sheisiún de bhabhta - ar eolas ón gcomhad babhtaí, thíos: `Object` `(campaign)`, ag an áit, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Aerpháirc nó FARP a athraíonn taobh san áit a dtaispeánann an taifead é - scríofa arís sa dath eile, nó bainte agus scríofa arís ina áit sa dath eile laistigh de chúig nóiméad - éiríonn sé ina imeacht `capture` ag an bpaid: `Event` = `capture`, `Airfield` a ainm, `Detail` `Red to Blue`, `Coalition` a thaobh nua. Ní gabháil é paid a scríobhtar den chéad uair i ndath. Scríobhann na freastalaithe a breathnaíodh orthu go dtí seo a bpaideanna uair amháin, mar sin níl aon ghabháil ina dtaifid.

### Comhaid babhtaí {#rounds-files}

Insíonn comhad babhtaí, in aghaidh an fhreastalaí, babhtaí a fheachtais, cé a bhuaigh iad agus seisiúin gach ceann acu. Tagann sé ón méid a fhoilsíonn an freastalaí, nó ó na taifid féin (thíos).

Is é an rud a fhoilsíonn an freastalaí - loga feachtais ar a leathanach gréasáin - cé a bhuaigh feachtas, ní rud atá sa taifead. Iompraíonn comhad babhtaí é, agus léann an tiontaire é le `--rounds file.json` (is féidir níos mó ná ceann amháin a thabhairt):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Baineann taifead le babhtaí a `server` a mbíonn a `title` (slonn ionadaíochta) ag teacht lena Title; gach sraith leis an mbabhta ina dtiteann a am fíor - RecordingTime an taifid móide soicindí na sraithe, ní dáta an mhisin sa chluiche. Is UTC na hamanna. Tugann babhta gan buaiteoir (rothlaithe, fós ar siúl) uimhir an bhabhta agus toradh folamh dá shraitheanna.

Insíonn macasamhail dhoiciméad an chluiche, buntásc `acmi`, cá as a dtáinig an toradh, mar a dhéanann `result.source` cluiche War Thunder: is é `outcome.result` `{ winner, round, endReason, source }`, `source` an `source` den chomhad babhtaí, nó `null` nuair nár ainmnigh aon rud buaiteoir. Liostaíonn `outcome` freisin babhtaí an taifid, a ghabhálacha agus a ruathair de réir mar a chríochnaigh siad:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Léann sraith de phíolóta `Viper 1 (F-16C_50) #a01` ar an taobh Blue san fheachtas sin ansin: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Babhtaí ó na taifid féin {#rounds-from-the-recordings-themselves}

Coinníonn freastalaí buan a fheachtas thar atosuithe, agus tosaíonn gach taifead le haonaid talún agus le statacha an dá thaobh san áit ar fhág an feachtas iad. Léann `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` na chéad nóiméid de gach taifead ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), cuireann sé taifid gach freastalaí d'aon léarscáil in ord ama agus slabhrann sé iad:

- **Áiteanna**: an talamh i gcealla de thart ar 2 km; is le taobh cill nuair is leis trí cheathrú de na haonaid atá ann ag tús seisiúin. Is áiteanna *faoi chonspóid* iad siúd a chonacthas i seilbh an dá thaobh.
- **Gabhálacha**: áit i seilbh an taobh eile ag tús an chéad seisiúin eile - glactha idir na misin, nó le linn an cheann níos luaithe.
- **Babhta nua**: seisiún a bhfuil a áiteanna difriúil ó áiteanna an cheann deireanaigh i níos mó ná 60% díobh - leagan amach tosaigh babhta nua, ní céim den seancheann. Críochnaíonn babhta freisin nuair a aistríonn an freastalaí go léarscáil eile (tosaíonn a sheisiúin i ndiaidh an cheann deireanaigh agus leanann siad ar aghaidh).
- **Cé a bhuaigh**: de bhabhta a chríochnaigh, an taobh a raibh gach áit aige ag tús a sheisiúin dheireanaigh (`capture`, muinín ard), nó an taobh a raibh níos mó de na háiteanna faoi chonspóid aige (meánach ag dhá oiread an taoibh eile, íseal mura bhfuil; íseal nuair a chríochnaigh sé le hathrú léarscáile). Níl buaiteoir ag babhta oscailte, ach insíonn gach seisiún cé mhéad áit a bhí ag gach taobh ag a thús, mar sin feictear cé a bhí chun tosaigh.
- Ní choinníonn freastalaí a dtosaíonn a sheisiúin uile mar an gcéanna aon staid eatarthu: ní shlabhraítear é.

Féadann tús an tseisiúin dheireanaigh a bheith uaireanta an chloig roimh dheireadh an bhabhta, mar sin is tábhachtach an mhuinín. Seiceáilte i gcoinne freastalaí a fhoilsíonn a bhuaiteoirí: d'aimsigh an slabhra gach babhta nua ag an seisiún inar thosaigh an babhta foilsithe, agus ba é an taobh a bhí chun tosaigh ag an tús deireanach an buaiteoir foilsithe i ngach ceann de na 9 mbabhta a d'fhéadfadh sé a sheiceáil. Coinníonn `--official file.json` babhtaí foilsithe a leithéid d'fhreastalaí agus cuireann sé seisiúin an tslabhra leo; insíonn `validation` an chomhaid cé chomh mór agus a d'aontaigh an slabhra. I bhfeachtas cumtha:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Babhta feachtais a fhéachaint mar shraith {#watching-a-campaign-round-as-a-series}

Lódáil taifid babhta amháin le chéile - na comhaid a bhfuil an `campaign` céanna acu - agus seinneann an t-amharcóir iad mar shraith amháin: seisiún i ndiaidh seisiúin ina n-ord fíor, agus gearrtar na huaireanta nó na laethanta idir dhá cheann go sos nóiméid. Marcálann an amlíne tús gach seisiúin i mbuí agus na sosanna mar bhandaí dorcha, agus insíonn an clog cén seisiún atá á sheinm agus a dháta fíor (`session 4/12 · 2026-11-02 12:38 UTC`). Oibríonn teas, an athsheinm, scagairí agus **Léargais** ar an tsraith iomlán mar a oibríonn siad ar aon sonraí lódáilte. Liostaíonn an chuid **Babhta feachtais** den chluaisín **Cluiche** na seisiúin lena ndátaí, cé mhéad áit faoi chonspóid a bhí ag gach taobh ag gach tús - mar chairt thar an mbabhta freisin - agus cé mhéad a glacadh roimhe; téann cliceáil go tús seisiúin. Insíonn taifead a lódáiltear leis féin ansin cén babhta agus cén seisiún é. Ní sraith iad taifid de bhabhtaí éagsúla a lódáiltear le chéile: tosaíonn gach ceann ag nialas, mar a dhéanann cluichí ar leith. Seinneann an lódálaí ilchluichí (**Go leor cluichí in éineacht**) babhta mar shraith freisin, sruthaithe agus de mhéid don GPU, do bhabhtaí de go leor gigibheart.

Tarraingítear na háiteanna a d'athraigh lámha le linn an bhabhta ar an léarscáil mar chriosanna gabhála, daite de réir an taoibh a raibh gach ceann acu aige ag tús an tseisiúin atá á sheinm, ag athrú ag teorainneacha na seisiún; is gabháil i liosta imeachtaí na hathsheinme gach athrú. Oibrítear amach iad ó na sraitheanna lódáilte - aonaid talún agus statacha gach seisiúin ina chéad nóiméid, i gcealla de thart ar 2 km, mar a dhéanann an slabhra - mar sin teastaíonn an lódálaí iomlán uathu (coinníonn an lódálaí ilchluichí ró-bheagán de gach sraith).

**An babhta iomlán a lódáil ó cheann dá thaifid.** I mbrabhsálaí simplí ní féidir leis an amharcóir comhaid nár roghnaigh tú a oscailt: lódáil comhaid an bhabhta le chéile. Nuair a fhreastalaíonn freastalaí áitiúil an amharcóra air (`npm run dev` nó `npm run preview`), is féidir leis: tabhair iontráil `campaigns` don `tools/local-data.json` a dhéanann git neamhaird de, ag ainmniú fhillteán na gcomhad babhtaí agus fhillteáin na dtaifead tiontaithe, agus tairgeann an chuid Babhta feachtais de thaifead aonair **Lódáil an babhta ar fad**, faigheann sé seisiúin an bhabhta a aimsíodh ansin agus lódálann sé iad leis an lódálaí ilchluichí:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Ní fhreastalaítear ach na taifid a ainmníonn comhad babhtaí (`tools/campaign-files.mjs`); áirítear seisiún nach bhfuarthas faoi na fillteáin sin, ní lódáiltear é.

An méid a fhoilsíonn na freastalaithe aitheanta:

| Freastalaí | Babhta | Conas a bhuann taobh | Cá háit ar féidir an buaiteoir a léamh |
|---|---|---|---|
| SPS Contention | feachtas ar léarscáil agus ré amháin (laethanta), thar go leor atosuithe | gach aerpháirc, FARP agus daingean glactha; rothlaíodh feachtas a chríochnaigh gan buaiteoir | loga feachtais poiblí an fhreastalaí (buaiteoir, tús, deireadh in aghaidh an fheachtais) |
| Blue Flag | babhta feachtais thar go leor misean 5 uair an chloig; téann `_YYYY_MM` an Title ar aghaidh mí amháin in aghaidh an atosaithe | gach suíomh namhaid glactha; d'ainmnigh babhtaí níos sine an taobh a raibh níos mó aige tar éis ama sheasta | níor foilsíodh i bhfoirm a aimsíodh go dtí seo; leanann slabhra na dtaifead gach babhta agus cé mhéad atá ag cé ag gach tús |
| Growling Sidewinder | rith misin (6 uair an chloig) de mhisean coimhlinte oscailte | criosanna agus aerpháirceanna glactha | taispeánann a leathanach staitisticí píolótaí, ní torthaí; tosaíonn gach seisiún mar an gcéanna, mar sin ní shíneann aon bhabhta thar sheisiúin: folamh |
| Misin in aghaidh an AI (misin ghabhála criosanna) | rith misin | taobh na n-imreoirí in aghaidh AI an mhisin: gan toradh PvP | folamh |
| Gan sannadh (ní ainmníonn an ceanntásc aon fhreastalaí) | - | - | folamh, `server` folamh freisin |
