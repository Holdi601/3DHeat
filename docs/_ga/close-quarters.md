---
title: "Gar-achrann agus babhtaí"
parent: "Léargais"
nav_order: 2
lang: "ga"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Gar-achrann agus babhtaí

Do lámhaigh bunaithe ar bhabhtaí (Counter-Strike ar dtús, aon sonraí le babhtaí, taobhanna agus marúcháin), tomhaiseann Léargais conas a buadh na troideanna: cé a ghlac na dúshláin oscailte agus cad a bhí siad luachmhar, an ndearnadh básanna a thrádáil, an bhuail an t-imreoir a bhí ag piocadh isteach i gcúinne an té a bhí ag coinneáil air, an íocann crosstine agus soilsí, conas a bhog odds an bhabhta le gach marú, agus cé na doirse a mharaigh na himreoirí a chuaigh isteach iontu. Úsáid é chun a fheiceáil cén fáth a buadh babhtaí, ní hamháin cé a fuair na marúcháin.

Glacann na tomhaiseanna leo ó dhoiciméadú glanta seomraí agus uirbeach (an funil marfach, pointí ceannais, crosstine) agus ó anailís ríomhspóirt agus spóirt (dóchúlacht buaine, luach gníomhartha, plus-minus coigeartaithe). Léitear gach ceann acu tríd an [lionsa eolais](knowledge.md) agus luaitear é.

## Triail as {#try-it}

1. Lódáil meaitseáil amháin nó níos mó le babhtaí (tá gach rud a theastaíonn ag tiontú CS2).
2. Oscail **Léargais** agus brúigh **Aimsigh léargais**.
3. Faoi **Tomhais an lionsa**, léigh na línte ó *Round win probability* go *Player impact*; tá a uimhreacha, a eatramh 95%, a luach q agus na foinsí a leanann sé ag gach ceann.
4. Roghnaigh an lionsa **Ríomhspórt** nó **Uirbeach** chun iad a léamh tríd an litríocht sin; seolann **Scríobh le AI** iad leis an tuarascáil.

## Cad a thomhaiseann sé {#what-it-measures}

| Tomhas | Cad a deir sé | Conas |
|---|---|---|
| Round win probability | Cé chomh dóchúil is a bhí gach taobh an babhta a bhuachan ag gach nóiméad | Aischéimniú lóistiúil ar na himreoirí beo ar gach taobh, an bunc nó an sprioc agus a am, cloc an bhabhta agus an ceannach, oiriúnaithe ar na sonraí lódáilte; deimhnítear an calibrú amach as an bhfo-fhilleadh de réir babhta (scór Brier agus scil, log loss, earráid chalabraithe thar deich mbosca, fána athchalabraithe, AUC) |
| Value of actions | Cé chomh mór a d'athraigh marú, marú dúshláin oscailte, trádáil, marú taobh thiar de sholas, plandáil nó solas dóchúlacht bua an taoibh | Dóchúlacht bua tar éis an ghnímh lúide roimhe; trádálacha, dúshláin oscailte agus marúcháin soilsithe tástáilte in aghaidh na marúcháin eile trí chomhthionól |
| Opening duels | Cén taobh a bhuann an chéad dúshlán, cé chomh minic is a bhuann sé an babhta sin, agus áiteanna ina mbuann taobh oscailtí i bhfad os cionn a mheáin féin | Eatraimh Wilson; áiteanna le tástáil binomial cruinn in aghaidh sciar an taobh, q thar na háiteanna |
| Trades | Básanna a fhreagraíonn marú an mharbhóra ag comrádaí laistigh de 5 s, an t-am a thóg sé, agus babhtaí a buadh nuair a trádáladh an chéad bhás | Tástáil cruinn Fisher, eatramh Newcombe |
| Peeker against holder | Dúshláin inar bhog imreoir isteach sa troid (1.5 m/s nó níos mó le linn an tsoicind dheireanaigh) agus inar sheas an ceann eile go socair (0.75 m/s nó níos lú): sciar an peeker | Tástáil binomial cruinn in aghaidh leath amháin |
| Aim before the duel | Radharc gach imreora in aghaidh an bhearing go dtí an ceann eile 0.75 s roimh an marú; cé a bhí níos fearr aimithe agus cé chomh minic is a bhuaigh an t-imreoir sin; coinneálaithe ar a n-uillinn (laistigh de 15°) in aghaidh as an uillinn sin; raonta marúcháin | Tástáil binomial cruinn; Fisher |
| Crossfire | Coinneálaithe le comrádaí socair laistigh de 25 m den peeker a bhfuil a líne air 35° nó níos mó as a líne féin, in aghaidh coinneálaithe ina n-aonar | Fisher, Newcombe |
| Utility into entries | Peekers taobh thiar de sholas lena dtaobh féin (laistigh de 3 s agus 15 m) nó de dheatach (laistigh de 18 s) in aghaidh peeks tirim; dúshláin oscailte le solas ar thaobh amháin; íospartaigh dallta | Fisher, binomial |
| Man advantage | Do gach staid d'imreoirí beo (5v4, 4v5, 2v1...) a sroicheadh ar dtús i mbabhta, sciar na mbabhtaí a buadh uaithi | Eatraimh Wilson |
| Clutches | Babhtaí inar tháinig taobh go dtí a imreoir deireanach: buanna in aghaidh na mbuanna a bhí ag súil leo ón tsamhail, de réir líon na n-iomaitheoirí | Tástáil normálta de bhreathnaithe in aghaidh ionchais |
| Stacks, rotations, lurks | An grúpa is mó laistigh de 10 m ag an dúshlán oscailte (3 nó níos mó: cruachadh); imreoirí níos mó ná 30 m ón gcéad troid nó ón gcuspóir plandáilte agus cé chomh tapa agus a thagann siad laistigh de 12 m; am agus cóimheas marú-go-bás níos mó ná 30 m ó gach comrádaí | Fisher; cóimheas odds le eatramh Woolf |
| Post-plant and retake | Babhtaí a bhuaigh an taobh plandála, de réir na líon ag an bplandáil, agus a sciar de dhúshláin tar éis na plandála | Eatraimh Wilson |
| Fatal funnels | Iontrálacha isteach i ngach áit (athrú ar cholún na háite, nó ar chill 8 m mura bhfuil) agus básanna laistigh de 2.5 s ó theacht isteach, in aghaidh ráta an léarscátha | Tástáil binomial cruinn, q thar na háiteanna; cóimheas laghdaithe le 20 iontráil ag ráta an léarscátha |
| Player impact | Dóchúlacht bua a chuirtear leis gach babhta ag gach imreoir (marúcháin, básanna, plandálacha), laghdaithe le Bayes empirical; plus-minus coigeartaithe crann de thorthaí babhta in aghaidh tús na samhla; luach marúcháin de réir áite agus arm, laghdaithe | Pionós roghnaithe ag bailíochtú cros cúig-fillteach |

Roinneann gach tástáil d'anailís amháin an ráta fíor-dhearbhaithe bréagach (Benjamini-Hochberg), agus tá gach áit a triailtear san áireamh, ní hamháin na háiteanna a thaispeántar; is thar iad go léir a ríomhtar an q a thaispeántar. Oiriúntar an tsamhail agus a calibrú ar na sonraí lódáilte, mar sin cuireann siad síos ar an daonra sin: míbhreathnaíonn samhail ghairmiúil imirt chaiméalach, agus a mhalairt.

Seiceáladh ar bhabhtaí sintéiseacha le héifeachtaí leagtha (fabhar an peeker, crosstine, soilse, feannóg mharfach amháin, aim níos fearr ag buachan), agus ar 100 tacar sonraí de na babhtaí céanna gan iad, áit a gcaithfidh ráta na bhfíor-dhearbhuithe bréagach na dtástálacha le héifeacht leagtha fanacht ag an 5% ainmniúil (laistigh de bhanda) (`src/insights/cqb/cqb.test.ts`); ar thimpeall míle babhta fíor scór an tsamhail Brier 0.14 in aghaidh 0.25 don ráta bunúsach, earráid chalabraithe 0.03 agus fána athchalabraithe 1.0.

## Sonraí a theastaíonn {#data-it-needs}

- colúin **am**, **imreoir**, **taobh** agus **babhta** (an seisiún), agus marúcháin agus básanna sa cholún imeachta; tugtar babhtaí ina bhfaigheann éinne bás faoi dhó mar bhabhtaí díothaithe (teastaíonn siad don bhuntáiste fir, do chlutches agus don tsamhail);
- colún **páirtí eile** (`other`, `victim`, `killer`, `attacker`) a ainmníonn an íospartach ar mharú agus an marbhóir ar bhás (gan é, péireáiltear marúcháin agus básanna ar an nóiméad céanna);
- **treo amhairc** do na tomhaiseanna aim;
- colún `event` amh a ainmníonn `flash`, `smoke`, `he`, `molotov`, `plant` agus `defuse` d'úsáid agus do phlandálacha;
- `won` (bhuaigh taobh an tsraithe an babhta), `place` (glaonna), `weapon`, `buy` agus `state_flashed` nuair a bhíonn siad sna sonraí.

Ba chóir suíomhanna a shampláil cúpla uair sa soicind; léann luasanna, aim agus crosstine an dá shoicind dheireanacha roimh gach bás.

## Sa bhriseadh síos {#in-the-breakdown}

Tomhaiseann an [briseadh síos](breakdown.md) ceithre chás mar fhachtóirí, le *with / without*: *blinded* (dallta), *death traded* (bás trádáilte), *opening duel* (dúshlán oscailte) agus na huimhreacha (*man up* - fear suas, *even numbers* - uimhreacha cothroma, *man down* - fear síos), gach ceann ar K/D, babhtaí buaite, maireachtáil agus marúcháin sa nóiméad.

## Go leor meaitseálacha {#many-matches}

Iompraíonn gach achoimre meaitseála den [anailís go leor meaitseálacha](mass-analysis.md) de shonraí le colún babhta na tomhaiseanna céanna mar líon (`cqb` san achoimre): dúshláin oscailte, trádálacha, peeks, crosstine, iontrálacha soilsithe, aim, buntáiste fir, plandálacha agus na 40 áit is mó a ndéantar iontráil orthu lena n-iontrálacha agus básanna. Suimíonn líonta thar mheaitseálacha, mar sin tugann míle meaitseáil na sciareanna céanna le hanailís mhór amháin. Taispeánann rannóg **Comhrac gar** an phainéil iad mar sciareanna lena n-eatraimh, thar gach léarscáil nó de réir léarscála; cliceáil ar líne a lódálann na meaitseálacha as ar tháinig sí.

## Do fhorbróirí {#for-developers}

`src/insights/cqb/`: `walk.ts` (pas amháin thar sraitheanna in ord ama, babhtaí ar leithligh, dúshláin taifeadta lena stát), `finish.ts` (na tomhaiseanna agus na líonta in aghaidh meaitseála), `model.ts` (aischéimniú lóistiúil de réir IRLS, calibrú, riasc de réir grádiant comhchuibhithe, Bayes empirical, Fisher, Newcombe, tástálacha comhthionóil), `run.ts` agus `worker.ts` (an radharc: a oibrí féin, taobh leis an bpas léargais), `summary.ts` (bailitheoir achoimre na go leor meaitseálacha), `factors.ts` (na cásanna briseadh síos), `shows.ts` (cad a léann an lionsa), `synth.ts` (babhtaí tástála). Tá na hiontrálacha eolais in `src/insights/knowledge/cqb.ts`, na patrúin in `patterns-cqb.ts`. Téann na torthaí isteach sa tuarascáil mar `lens.cqb`.
