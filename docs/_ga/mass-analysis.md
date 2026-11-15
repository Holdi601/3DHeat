---
title: "Anailís mhais"
nav_order: 8
lang: "ga"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Anailís mhais: na mílte cluiche ag an am céanna

**Anailís mhais** taispeánann duit cad a shuimeann iomlán fillteáin chluichí: cén fheithicil a bhuann is mó, cén taobh a fhabhraítear, cá bhfuil an gníomh. Bain úsáid as nuair a bhíonn i bhfad níos mó cluichí agat ná mar is féidir leat a fhéachaint.

Oibríonn sé ó achoimre bheag ar gach cluiche, mar sin oscailtear na mílte nó na deich mílte cluiche go tapa. Lódálann sé na sraitheanna iomlána don chluiche a chliceálann tú air amháin.

## Bain triail as {#try-it}

1. Oscail **Anailís mhais** sa bharra taobh Léarscáil teasa.
2. Brúigh **Fillteán…** (nó **Comhaid…**) agus roghnaigh do chluichí `.3dheat`.
3. Fan fad a léann an painéal na hachoimrí ("Achoimrí... n as N").
4. Brúigh **Oscail anailís**. Osclaítear fuinneog le cluaisíní.
5. Socraigh na scagairí (Cluiche, Léarscáil, Mód, Ó, Go), ansin léigh cluaisín, mar shampla Cothromaíocht.
6. Cliceáil ar shraith, ar chill nó ar léargas: lódálfar a gcluichí sa radharc 3D, leis an gceamara ar an áit.

![Cluaisín na Cothromaíochta: ráta buaite agus maruithe in aghaidh báis de réir feithicle](../assets/img/en/mass-balance.webp)

```
folder of .3dheat -> summaries -> window (tabs) -> click a row -> matches open in 3D
```

Is cluiche amháin comhad `.3dheat` ([Comhad amháin in aghaidh an chluiche](container.md)). Mínítear *léarscáil teasa* agus *sraith* sa [ghluais](glossary.md).

## Achoimrí a fháil {#getting-the-summaries}

Níl aon rud le déanamh ag formhór na ndaoine: oibríonn an painéal amach na hachoimrí atá ar iarraidh é féin. Chun fillteán mór a ullmhú uair amháin, bain úsáid as an uirlis as líne thíos.

Faigheann gach cluiche `.3dheat` achoimre (`src/mass/summarize.ts`), coinnithe sa choimeádán mar an comhalta `<match>.summary.json` (ról `summary`, féach [Comhad amháin in aghaidh an chluiche](container.md)). Scríobhann an uirlis as líne iad, agus innéacs in aghaidh an fhillteáin. Is uirlis forbróra í; rith í ar fhillteán mór chun an obair a shábháil don phainéal:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Léitear cluiche atá achoimrithe cheana (leagan formáide céanna) amháin; oibríonn `--force` as an nua. Fágann `--no-write` na coimeádáin ina riocht.
- Fágtar ar lár comhad a athraíodh sna `--settle` nóiméad dheireanacha (10): b'fhéidir go bhfuil tiontaire fós á scríobh.
- `<folder>/3dheat-index.jsonl.gz`: líne in aghaidh cluiche - a chosán, a mhéid, a am agus a achoimre gan an greille. `<folder>/3dheat-index.grids.jsonl.gz`: líne in aghaidh cluiche lena greille.
- Rith é ar an meaisín a choimeádann na comhaid, ag tosaíocht íseal (mar shampla `nice -n 19 ionice -c3` ar Linux).

Glacann an painéal, do gach cluiche, an chéad cheann de: líne innéacs an fhillteáin (an cosán céanna agus an méid céanna), taisce an bhrabhsálaí (IndexedDB, de réir ainm, méide agus ama), comhalta `summary` an choimeádáin, nó achoimre a oibrítear amach i bpoll oibrithe agus a chuirtear i dtaisce. Mar sin oibríonn fillteán gan innéacs freisin: an chéad uair ar luas léamh na dtáblaí, ina dhiaidh sin ón taisce.

## An painéal {#the-panel}

Roghnaigh fillteán (nó comhaid; **Cuir fillteán leis…** ceanglaíonn ceann eile). Tá na scagairí **Cluiche**, **Léarscáil**, **Mód**, **Ó** agus **Go** sa fhuinneog, rogha **Scoilt de réir**, **Saolta is lú** agus **Imreoirí amháin**, agus na cluaisíní seo. Is ó na hachoimrí a thagann gach uimhir, agus cuireann cliceáil ar shraith, ar chill nó ar léargas a gcluichí sa radharc mar fhorleagan na n-iliomad cluichí leis na scagairí a thaispeánann é (feithicil, aicme, arm, foireann, imreoir) agus an ceamara ar an áit:

| Cluaisín | Cad é |
|---|---|
| Forbhreathnú | cluichí, uair an chloig, imreoirí, saolta, sraitheanna, dátaí; cluichí in aghaidh an lae; de réir cluiche, léarscáile, mhód; iomlán imeachtaí; eacnamaíocht de réir airgeadra; cathain sa chluiche a tharlaíonn rudaí |
| Cothromaíocht | de réir feithicle, aicme, airm nó foirne, roinnte de réir léarscáile, mhód, leibhéil nó chluiche: K/D lena eatramh ~95%, ráta buaite (Wilson), marthanas, maruithe agus buailte in aghaidh an nóiméid, tuilleamh in aghaidh an nóiméid, agus q - an ráta fíorthaispeántais bréagach Benjamini-Hochberg de K/D agus de bhuaite i gcoinne an chuid eile den roinnt. **Saolta is lú** folaíonn sraitheanna a bhfuil ró-bheagán saolta acu le go n-iontaofaí iad; **Imreoirí amháin** fágann sé ar lár an méid a thiomáin AI an mhisin |
| Treochtaí | úsáid (scair den láithreacht), K/D nó ráta buaite na bhfeithiclí nó na n-aicmí is fearr in aghaidh an lae, na seachtaine nó na míosa |
| Imreoirí | imreoirí ar leith, cluichí in aghaidh imreora, imreoirí in aghaidh cluiche, na himreoirí is minice |
| Taobhanna | gach taobh de gach léarscáil: cluichí buaite i gcoinne roinnt chothrom |
| Gar-throid | sonraí babhta: céadchomhraic de réir taobh agus a dtiontú, trádálacha, an lámhachóir i gcoinne an choinneora, crosaí tine, iontrálacha dallta, lámhachas, plandálacha, buntáiste duine ar dhuine agus, **De réir léarscáile**, na háiteanna a mharaíonn na himreoirí a théann isteach - gach ceann mar scair lena eatramh Wilson, ó chomhairimí `cqb` na n-achoimrí ([Gar-throid agus babhtaí](close-quarters.md)) |
| Dromchlaí R6 | marcanna Rainbow Six Siege ar an leibhéal (poill piléar agus a leithéid) in aghaidh dromchla an leibhéil: marcanna, in aghaidh babhta den léarscáil, an seomra, an scair ar oibríodh amach a lámhachóir; osclaíonn cliceáil cineálacha na marcanna, oibreoirí agus aicmí airm na lámhachóirí, agus cá háit ar an dromchla atá na marcanna (teas beag de chealla ceathrú méadair); coinníonn dromchla a aitheantas thar chluichí leagan amháin den léarscáil. Ó chomhairimí `marks` na n-achoimrí |
| Léarscáil | greille iomlánaithe na léarscáile: láithreacht, maruithe, básanna, K/D, imeacht ar bith, sreabhadh, agus **te i gcúpla cluiche** (cobhsaíocht); de réir foirne, ag 1, 2, 4 nó 8 uair an chill |
| Áiteanna | áiteanna a sheasann amach sna huimhreacha ach nach sa teas (ceantar mór gnóthach mar iomlán, coridéir, bandaí airde), agus áiteanna a mbuann a gcoinneoirí níos mó nó níos lú dá mbabhtaí; **Aimsigh áiteanna** |
| Nideoga | grúpaí a bhfuil níos fearr nó níos measa ná an chuid eile go suntasach (feithicil ar léarscáil amháin, roinn ag airde amháin), agus grúpaí babhtaí a buadh thar an méid a bhuaigh a dtaobh sna cluichí céanna; **Aimsigh nideoga** |
| Léargais | na brathadóirí iliomad agus na brathadóirí léarscáile (thíos); tugann **Cóipeáil tuarascáil (JSON)** an JSON a léann samhail teanga |

## Léargais thar iliomad cluichí {#insights-over-many-matches}

Aimsíonn an cluaisín **Áiteanna** áiteanna a sheasann amach sna huimhreacha ach nach sa teas - ceantar mór gnóthach mar iomlán, coridéar, banda airde, áit atá gnóthach i gcuid amháin den chluiche - marcálann na cinn nach dtaispeánann an teas simplí mar **i bhfolach**, agus cuireann imlíne orthu sa radharc 3D; eitlíonn **Lódáil** ansiúd leis na cluichí a bhí iontu. Aimsíonn an cluaisín **Nideoga** grúpaí (feithicil ar léarscáil agus taobh amháin, roinn ag airde amháin) a bhfuil níos fearr nó níos measa iad ná an chuid eile; cliceáil ar cheann chun a leasuithe a fheiceáil.

### Cé a bhuaigh {#who-won}

Nuair a deir na cluichí cé a bhuaigh gach babhta (an [colún toraidh](data-formats.md#outcome-columns) `won`), is sprioc ann féin an toradh:

- **Áiteanna: ráta buaite.** I gcás gach taoibh, an scair dá bhabhtaí in áit a bhuaigh sé, i gcomparáid leis an scair a bhuaigh sé áit ar bith sa chluiche céanna - mar sin is iad cothromaíocht na léarscáile, an taoibh agus an chluiche féin an bonn, agus ní sheasann amach ach áiteanna a mbuann a gcoinneoirí níos mó (nó níos lú) dá mbabhtaí. Sampla cumtha: *"Dust: buaineann taobh T níos mó dá bhabhtaí nuair atá sé anseo: 61% de 412 buaite, i gcomparáid le 49% a bhíothas ag súil leo óna ráta féin sna cluichí céanna (corrlach 1.6x; coinnithe i 31/48 cluiche)."* Na seiceálacha céanna ar ráta fionnachtana bréagaí agus ar chobhsaíocht agus atá ar gach áit; lódálann **Lódáil** na cluichí a raibh sé iontu, agus taispeánann sé suíomhanna an taoibh sin.
- **Nideoga: bua babhta.** Coinníonn an tábla **Babhtaí** babhta gach saoil: an léarscáil, an taobh, an chuid den chluiche (babhtaí 1-4, 5-8, ...), an fheithicil (oibreoir, gníomhaire), an t-arm is mó a d'úsáid sé, an áit is faide a choinnigh sé, an ceannach (eco, force, full) agus ar rinne a thaobh an chéad mharú. Meastar grúpa i gcoinne an méid a bhuaigh a thaobh sna cluichí céanna, mar sin ní nideog é *T ar Dust le AWP* ach nuair a buadh na babhtaí sin níos minice ná babhtaí eile T sna cluichí sin. Sampla cumtha: *"m1 · T · AWP: buaineann 80% de 320 babhta, i gcomparáid le 62% a bhíothas ag súil leo ó na taobhanna céanna sna cluichí céanna (corrlach 2.3x; 40 cluiche)."* Rangaithe de réir an ardaithe faoin tacaíocht; lódálann **Lódáil** na cluichí ina dtaispeánann a mbabhtaí é is mó.

Teastaíonn achoimrí de leagan 2 don dá cheann (féach [Achoimrí a fháil](#getting-the-summaries)): oibrítear amach arís na cinn níos sine.

Aimsíonn an cluaisín **Léargais**, thar gach cluiche, feithiclí a thrádálann nó a bhuann níos fearr nó níos measa ná an chuid eile, áiteanna atá te i scair chobhsaí de chluichí, taobhanna a bhuann níos mó ná roinnt chothrom, feithiclí a bhogann a n-úsáid thar na dátaí, agus codanna den chluiche a shealbhaíonn níos mó maruithe ná scaipeadh cothrom. Tugann gach torthaí a chuid comhaireamh, éifeacht, eatramh agus ráta fíorthaispeántais bréagach (coinnithe ag 5%), agus lódálann cliceáil a chluichí. Sonraí: [Do fhorbróirí](#for-developers).

## Scála {#scale}

Is féidir leat leagan beag den seo a athrá thú féin: scríobhann `node tools/demo-data.mjs` 150 cluiche tanc sintéiseach go `tools/.shots/demo/mass` (thart ar 1,000 sraith in aghaidh an chluiche). Tomhaiste ar na 150 cluiche demo sintéiseacha sin de `tools/demo-data.mjs` ar ríomhaire deisce (is i bhfad níos mó é cluiche fíor):

- `tools/3dheat-summarize.mjs` le 4 oibrí: 2.6 go 4.8 s do na 150 go léir, 8 go 21 ms in aghaidh cluiche laistigh d'oibrí; léann an dara rith nach léann ach na hachoimrí thart ar 2 s.
- Fillteán a oscailt sa phainéal, leis an innéacs i láthair, go dtaispeánann an fhuinneog: 0.9 go 1.6 s (cuid an oibrí féin, na 150 líne innéacs a léamh, 20 go 40 ms).
- Cluaisín a athrú, go dtarraingítear a thábla: Forbhreathnú 10 go 30 ms, Cothromaíocht 30 go 70 ms, Treochtaí 30 go 45 ms, Imreoirí 15 go 35 ms, Taobhanna 15 go 20 ms, Léarscáil 55 go 130 ms.
- Coimeádann an stór na 150 cluiche in thart ar 0.5 MB.

Tógann fuinneog a oscailt frám gearr amháin: téann na comhaid roghnaithe chuig an oibrí 16 ag an am, agus tagann na réimsí dátaí agus an chéad chluaisín frám tar éis na fuinneoige.

Coimeádann an stór thart ar 15 KB in aghaidh an chluiche, mar sin tógann 10,000 cluiche thart ar 150 MB san oibrí; ní choinnítear greilleanna níos faide ná mar a iarrann an léarscáil.

## Do fhorbróirí {#for-developers}

### Léargais thar iliomad cluichí {#insights-over-many-matches}

`src/mass/detect.ts` - gach torthaí lena chuntais, éifeacht agus eatramh, p agus q (Benjamini-Hochberg thar gach rud a rinne an brathadóir triail as, coinnithe ag 5%), an drill-down a lódálann a chluichí agus eochair abairte lena luachanna; is é an tuarascáil (`heat3d.mass/1`) an rud a thugann `massReportForModel` do scéalaí, sa chruth céanna le tuarascáil an chluiche aonair (`insights/seam.ts`).

| Brathadóir | Aimsíonn |
|---|---|
| `balance` | feithicil imreora a thrádálann nó a bhuann níos fearr nó níos measa ná an chuid eile ar léarscáil nó i mód |
| `hotspot` | áiteanna atá te i scair chobhsaí de na cluichí a tháinig (cluichí te / cluichí feicthe, i gcoinne chealla eile na léarscáile) - ní hamháin te sa suim |
| `side` | taobh de léarscáil a bhuann níos mó ná roinnt chothrom |
| `meta` | scair saolta imreoirí feithicle nó a K/D ag bogadh idir leath níos luaithe agus leath níos déanaí de na dátaí, in aghaidh léarscáile - méid leordhóthanach chun a bheith tábhachtach, ag treochtú thar na ráithe, ar an mbealach céanna ar an gcuid is mó de na léarscáileanna (thíos) |
| `phase` | cuid de fhad an chluiche a shealbhaíonn níos mó maruithe, buillí, seolta... ná scaipeadh cothrom |
| `place` | áiteanna a sheasann amach thar go leor cluichí (Céim B, thíos): ráta réigiúin nó scair maruithe i gcoinne an chluiche féin, ciorcail, coridéir, limistéir fhásta, bandaí airde, céimeanna; i bhfolach nuair nach dtaispeánann an teas simplí iad |
| `niche` | grúpaí a bhfuil níos fearr nó níos measa go suntasach (Céim B, thíos) |
| `grid.*` | na brathadóirí tacair sonraí amháin (suíomhanna cumhachta, limistéir te agus ciúin, áiteanna de réir aicme) ar na greilleanna iomlánaithe in aghaidh gach léarscáile: líonann `GridMerge.toInsightJob` greilleanna an phas léargais ón achoimre; fágann na brathadóirí a theastaíonn rianta ar lár |

### An achoimre {#the-summary}

JSON shimplí (`src/mass/types.ts`), thart ar 5-30 KB díchomhbhrúite in aghaidh an chluiche:

- an cluiche: cluiche, léarscáil, mód, misean, tús, fad, sraitheanna, saolta, imreoirí, AI, foirne (saolta, imreoirí, láithreacht, maruithe, básanna, buaite, airgead), buaiteoir;
- in aghaidh feithicle agus foirne: aicme, leibhéal, saolta, saolta imreoirí, láithreacht, imeachtaí de réir cineáil chanónaigh, maruithe de réir aicme an sprice, buaiteanna, airgead;
- in aghaidh imreora (de réir id úsáideora, nó ainm): foireann, saolta, láithreacht, maruithe, básanna, buailte, seolta, buaite, feithiclí; in aghaidh airm: imeachtaí de réir cineáil;
- le colún toraidh (leagan 2): babhtaí buaite agus imeartha in aghaidh foirne, feithicle (`rw`, saol agus babhta an ceann), imreora agus airm (na babhtaí inar úsáid taobh é); babhta gach saoil (`outcome.u`: babhta, taobh, feithicil, an t-arm is mó a d'úsáid sé, an áit is faide a choinnigh sé, an ceannach, buaite) agus uimhir, buaiteoir agus taobh an chéad mharaithe de gach babhta (`outcome.r`);
- colúin an gheilleagair (`cost_*`, `earn_*`) agus a suimeanna;
- céimeanna: imeachtaí de réir cineáil i 20 bhosca de fhad an chluiche agus de réir an nóiméid;
- iompar: tomhais iompair chomhchoitinne an chluiche (ailíniú, treoir sléibhe ar bhealach, lánaí, plódú, ceannairí, lagaithe, pointe briste, riosca tar éis cailliúna, sraitheanna, comhaontú ceannaigh, cur faoi bhraistint), gach ceann lena shamhail null féin, p agus q - féach [Iompar comhchoitianta](collective-behaviour.md);
- an greille (thíos).

Comhairítear mar a chomhairíonn an t-amharcán: colúin a aimsíonn an lódálaí iliomad cluichí iad (`leanSpec`), imeachtaí de réir `data/canonical.ts`; scóráil maruithe arm Tacview a chuntas don lámhachóir; cuntar bás a dúradh faoi dhó ag an am céanna (`dead`, `death`) uair amháin.

#### An greille: cad a thógann Céim B air {#the-grid-what-stage-b-builds-on}

Tá an chuid spáis déanta le haghaidh staitisticí scanadh thar réigiúin de mhéid agus cruth ar bith, ní hamháin le haghaidh pictiúr teasa:

- **Pirimid.** Tá cealla ailínithe mar chumhachtaí de dhó in aonaid domhain (x, z mar a chuireann an t-amharcán iad). Is é leibhéal `k` na cealla a shuimítear de `ix >> k, iz >> k` - beacht laistigh de chluiche agus thar chluichí de mhéideanna cealla eile - agus is suim de chealla aon réigiún (bosca, coridéar feadh líne, fáinne). Oireann an leibhéal is mine do shíneadh láidir an chluiche (na cealla a shealbhaíonn 99% den láithreacht) i 128 chill; coinnítear seachránaigh taobh amuigh de.
- **Nochtadh in aice le gach comhaireamh.** Soicindí láithreachta in aghaidh na cille, in aghaidh foirne (`pt`), in aghaidh aicme feithicle (`pc`) agus in aghaidh banda airde (`ph`), ionas go n-oibrítear amach ráta, ionchas agus cóimheas réigiúin do aon fho-ghrúpa.
- **Airde.** Bandaí os cionn urlár an chluiche (an 1ú pearsanachán den airde): faoi 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, os a gcionn; comhad a bhfuil colún `floor`/`storey`/`deck` aige bandaíonn sé de réir a urlair ina ionad. Is é `y` meánairde gach cille, `y0` an íoslíne (a urlár, le haghaidh airde os a cionn).
- **Imeachtaí** mar thuplaí `[cell, kind, team, class, band, count]`.
- **Babhtaí de réir toraidh** (leagan 2, le colún toraidh agus dhá bhabhta nó níos mó): `pw` mar `[cell, team, rounds won, rounds lost]` - na babhtaí ar chaith gach taobh soicind nó níos mó sa chill, de réir a thoraidh sa bhabhta.
- **Sliseanna ama** ag leibhéal garbh (8 chill ar gach taobh), de réir an nóiméid ó thús an chluiche: `[cx, cz, minute, kind, value]`, soicindí láithreachta mar chineál `GRID_KINDS.length`; is nóiméid thar fhad an chluiche iad céimeanna an chluiche.
- Tanúil, comhaireamh slánuimhreacha, soicindí go deichiú: teoranta ag an méid a tharla.

### Céim B: áiteanna agus nideoga {#stage-b-places-and-niches}

Lorgaíonn Céim B an rud a sheasann amach sna huimhreacha gan an radharc a ghabháil: ceantar mór gnóthach mar iomlán gan chill te ann, cóimheas maruithe-básanna corr ar mhórán imeachtaí, coridéar, banda airde, bunsraith a bhíonn ann i gcuid amháin den chluiche - agus grúpaí (feithicil ar léarscáil ar thaobh amháin, roinn ag airde amháin) a bhfuil níos fearr nó níos measa ná an chuid eile. Ritheann **Aimsigh áiteanna** / **Aimsigh nideoga** / **Aimsigh léargais** gach brathadóir; roinneann na trí chluaisín an tuarascáil.

#### Áiteanna (`src/mass/scan.ts`) {#places-srcmassscants}

Léitear cluichí gach léarscáile faoi dhó, cluiche ag an am; coinníonn an cuimhne suimeanna ar raster de 64 chill ar a mhéad ar gach taobh (16 don scanadh spás-ama), ní na cluichí riamh.

- **Tomhais.** Ráta imeachta in aghaidh an tsoicind láithreachta - maruithe, básanna, buailte, seolta, gabhálacha, do gach aonad, in aghaidh aicme (na 4 cinn le imeachtaí is mó), in aghaidh banda airde - agus scair na maruithe i maruithe agus i mbásanna (go léir, in aghaidh taobh, in aghaidh banda), agus **ráta buaite** gach taoibh: a bhabhtaí sa chill buaite i gcoinne caillte (`pw`), nuair a chomhaireann 8 gcluiche den léarscáil nó níos mó babhtaí de réir toraidh. Tagann na haicmí agus na taobhanna as na cinn (`planOf`).
- **Ionchas de réir cluiche.** Is é ionchas na cille scaipeadh ráta gach cluiche ar a láithreacht féin sa chill (scanadh Kulldorff comhchoigeartaithe, stratáilte de réir cluiche): ní dhéanann cúpla cluiche fuilteach nó freastalaí gnóthach amháin áit ar bith. Don ráta buaite is é an t-ionchas scair an taoibh féin de bhabhtaí buaite sa chluiche sin, mar sin ní áit riamh iad cothromaíocht na léarscáile ná an taoibh. Comhairtear babhta i roinnt cealla de réigiún i ngach ceann acu; iompraíonn an scaipeadh a thomhaistear ag méid an réigiúin é sin.
- **Scaipeadh.** Easaontaíonn cluichí i bhfad thar Poisson. Suimítear iarmhair gach cluiche i mbloic de 1, 2, 4, 8, 16 chill; scálaíonn scaipeadh gach méid bloc (iarmhair chearnaithe thar an athraitheacht null, comhcheangailte, an 5% is measa de bhlocanna fágtha ar lár) gach tástáil ar réigiún den mhéid sin: cóimheas dóchúlachta cáilíochta, Poisson le haghaidh rátaí, binomach le haghaidh scaireanna.
- **Réigiúin.** Ciorcail de 0.75 go 18 chill; ellipses ag sé uillinn, 3 agus 6 huaire chomh fada agus is leithead, 3 go 18 chill (coridéir; is í an ais `place.path` an léargais); crioncha fásta cill ar chill ón Getis-Ord Gi* áitiúil is láidre fad a fhásann an réigiún z (cruthanna neamhrialta) - fásta ar leath amháin de na cluichí agus tástáilte ar an leath eile, ionas nach gcosnaíonn saoirse an fháis aon áiteanna bréagacha; gach banda airde i gcoinne bhandaí eile an chluiche ar an léarscáil iomlán (cadharta de réir bhraisle); cilindrí spás-ama: ciorcal i gcúigiú nó dhá chúigiú de fhad an chluiche, i gcoinne scaipeadh an chluiche féin dá imeachtaí thar áit agus am (scanadh athrú spás-ama).
- **Tástáil.** p ón gcóimheas dóchúlachta cáilíochta; Benjamini-Hochberg thar gach réigiún a bhain triail as ar gach léarscáil (700,000 ar thrí léarscáil is gnách) ag 5%. Baintear as an méid a rith an bhearradh (réigiún atá sa chuid is mó laistigh de réigiún níos láidre dá thomhas ag rá an rud céanna), léitear arís é as a **chobhsaíocht** - cluichí a chonaic é, cluichí ina raibh sé, a threo i gcúig fhillteán de na cluichí - agus tástáiltear arís é ag an athraitheacht a thaispeánann na cluichí féin (cadharta de réir bhraisle, cluichí mar bhraisle, riamh faoi Poisson), BH arís. Fágtar ar lár áiteanna ciúine ar bhonn (2% nó níos mó de ghineadh, de thógálacha agus de thalmhaithe na léarscáile).
- **Éifeacht.** Cóimheas an ráta (nó na ndóchas), crapthe ag Bayes eimpíreach (réamhthuairim gáma feistithe ar bhloic 2x2 na léarscáile), le heatramh ~95% ag an scaipeadh; Gi* ag 1, 2 agus 4 chill agus Moran áitiúil ag an lár.
- **Soiléireacht amhairc.** Cé mhéad a thaispeánann an réigiún cheana sa teas simplí dá imeacht (scála logartamach go dtí an chill is gile, mar a tharraingíonn na radhairc é): a chodarsnacht le fáinne timpeall air (tá deichiú den pailéad deacair a fheiceáil, dhá cúigiú simplí) agus buaic gheal a iompraíonn an barrachas; ní tharraingíonn an teas cóimheas riamh, mar sin áirítear scair leath. Faoi 35% is **i bhfolach** é. An rangú: neart (éifeacht a shásaíonn ag 4 uair, áiteanna ciúine ag 0.7) uair `1 - 0.7 x soiléireacht` uair comhaontú na bhfillteán.

Liostaíonn cluaisín **Áiteanna** iad (i bhfolach amháin de réir réamhshocraithe; de réir léarscáile, cruth, treo). Déanann cliceáil imlíne ar áiteanna na léarscáile sa radharc 3D (`placeLines.ts`: príomhlínte an innill, tógtha uair amháin - magenta i bhfolach, ómra simplí, cian ciúin, an ceann roghnaithe lán; banda mar bhosca óna urlár go dtí a síleáil) agus ar chanbhás chluaisín na Léarscáile. **Lódáil** eitlíonn ansiúd agus lódálann na 60 cluiche a bhí iontu is mó, scagtha de réir a imeachta (agus aicme).

#### Nideoga (`src/mass/niche.ts`) {#niches-srcmassnichets}

Cuardach trast (leithead 24, doimhneacht 3) thar trí tábla: **saolta** (saolta imreoirí: cluiche, léarscáil, mód, aicme, feithicil, taobh, leibhéal, ráithe de na dátaí, tríthí de fhaid na gcluichí; K/D, buaite, bás ina saol, maruithe in aghaidh uaire, tuilleamh in aghaidh an nóiméid), **áiteanna** (maruithe agus básanna de réir léarscáile, mhóid, dátaí, earnáil na léarscáile 4 x 4, aicme, taobh, banda) agus **céimeanna** (earnáil agus cúigiú an chluiche: K/D, básanna in aghaidh uaire láithreachta). Déantar triail ar ghrúpa i gcoinne an iomláin le cluichí mar bhraisle (athraitheacht sandwich de na hiarmhair de réir cluiche), a éifeacht mar chóimheas dóchúlachta nó rátaí crapthe ag réamhthuairim de 20 toradh; teastaíonn 30 toradh i 8 gcluiche uaidh, caithfidh mionsonrú a bheith 10% níos láidre ná a thuismitheoir, agus fágtar ar lár grúpaí ina bhfuil an toradh ar gach ceann nó ar neamh (gan a thaifeadadh dóibh). Coinnithe: BH faoi 5% thar gach grúpa a meastar, cóimheas crapthe 1.25 (nó 1/1.25) ar a laghad, ceithre cinn de chúig fhillteán ag aontú, gan mionsonrú nach déanann ach athrá a thuismitheora. Liostaíonn cluaisín **Nideoga** iad; taispeánann cliceáil gach mionsonrú aon-choinníll den ghrúpa (an taiscéalaí), agus lódálann **Lódáil** a chluichí. Níl lódálacha sna hachoimrí go fóill.

Tá toradh an bhabhta mar sprioc ag an gceathrú tábla, **babhtaí** (`roundsTable`): sraith amháin in aghaidh babhta saoil - léarscáil, taobh, cuid den chluiche (babhtaí 1-4, 5-8, ...), feithicil, an t-arm is mó a úsáideadh, an áit is faide a coinníodh, ceannach, an chéad mharú nó an chéad bhás - meáite i gcoinne ráta buaite a thaoibh féin ina chluiche féin (ionchas stratáilte Mantel-Haenszel: is é an t-iarmhar `won - e`, `e` scair an taoibh sa chluiche), mar sin ní nideog riamh í cothromaíocht na léarscáile ná an taoibh. Fanann na cluichí mar bhraislí. Tá a z calabraithe: ritheann an cuardach trast céanna ocht n-uaire ar na torthaí suaite idir babhtaí gach taoibh de gach cluiche (ráta an taoibh i ngach cluiche coinnithe), agus roinneann scaipeadh na z null sin thar ghnáthdháileadh caighdeánach - in aghaidh líon na gcoinníollacha, ón lár (airmheán / 0.674) agus ón eireaball (99ú peircintíl / 2.576), an ceann is mó, riamh faoi 1 - na cinn fhíora roimh a p agus an ráta fionnachtana bréagaí (null eimpíreach, Efron 2004). Faigheann grúpaí níos doimhne an scála níos mó: coinníonn an cuardach mionsonruithe de ghrúpaí a roghnaíodh as a z mór. Is é a ionchas féin bonn nideoige, a ardú na pointí os a chionn, agus rangaítear í de réir an ardaithe faoi fhréamh chearnach a babhtaí, coinnithe ag an bhfianaise agus na fillteáin (is é `wracc` an tacaíocht faoin ardú). Iompraíonn sí na cluichí inar léirigh sí is mó (`matchIds`) agus cuid dá mbabhtaí (`rounds`, `[match, round]`) don mhionscrúdú.

#### Athruithe meta le tábhacht phraiticiúil {#meta-shifts-with-practical-significance}

Ar dhátaí measctha ghlaoigh an binomach ar shaolta beagnach gach athrú suntasach. Tástálann `meta` anois cadharta (gach saol imreora ina bhraisle), coinníonn sé athrú úsáide ach 2 phointe agus 25% ar a laghad, athrú K/D 1.3 uair, ráitheanna na ndátaí ag treochtú ar an mbealach céanna (tau Kendall 0.5 ar a laghad) agus, do fheithicil ar léarscáileanna iomadúla, an treo céanna ar chuid is mó díobh. Fágann sé sin cúpla athrú amháin ar thacar tástála ina ndearna an tástáil shimplí bratach ar bheagnach iad uile.

#### Do shamhail {#for-a-model}

Tugann `massReportForModel` a `region` (cruth, i bhfolach, soiléireacht, airde, céim) do gach áit agus a `conditions` do gach nideog, chomh maith le cé mhéad réigiún agus grúpa a triailadh. Is féidir leis an lionsa eolais áiteanna a léamh mar limistéir mharfacha agus mar bhealaí ionsaí: is `place.*` agus `niche.*` a gcineálacha.

#### Seiceálacha {#checks}

Cuireann `scan.test.ts` limistéar scaipthe isteach (1.6 uair an ráta báis thar chiorcal de 22 chill, lag i ngach cill), coridéar, banda airde agus bunsraith amháin de chéim i 240 cluiche sintéiseach thar-scaipthe - aimsítear iad go léir, agus an scaipthe i bhfolach - agus rithtear ocht dtacar null de 60 cluiche: níl aon áit ann. Aimsíonn `niche.test.ts` grúpa curtha isteach feithicle x léarscáile x taobh agus níl aon rud i gcúig tábla null. Seiceálann `outcome.test.ts` achoimre leagan 2 (babhtaí buaite de réir taoibh, aonaid, imreora agus airm, `pw`, babhtaí na n-aonad); cuireann sé lána isteach a mbuann a thaobh 70% dá bhabhtaí i gcoinne 35% (cothromaíocht féin ag gach cluiche) - aimsítear é - agus ritheann sé 20 tacar null de 50 cluiche nach ndeir na lánaí aon rud iontu: níl áit ráta buaite ann; cuireann sé AWP isteach ar léarscáil amháin a bhuann babhtaí a thaoibh 30 pointe níos mó - aimsítear é, lena chluichí agus a bhabhtaí - agus ritheann sé 30 tacar null de 80 cluiche le cothromaíocht féin ag gach cluiche agus taobh amháin níos láidre ar léarscáil amháin: níl nideog ann.
