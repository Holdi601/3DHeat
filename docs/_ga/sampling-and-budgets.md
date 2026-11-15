---
title: "Samplú agus buiséid"
parent: "Inmheánacha rindreála"
nav_order: 3
lang: "ga"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---


# Samplú agus buiséid

Nuair a bhíonn an iomarca poncanna le tarraingt i bhfráma amháin, tarraingíonn an t-amharcóir samplú cothrom agus déanann sé gach ponc níos mó, ionas go gcoinníonn an pictiúr ceart. Coigeartaíonn rialaitheoir cé mhéad a tharraingítear, ionas go gcoinníonn an t-amharcóir a luas fráma.

## Rialuithe an phainéil feidhmíochta {#performance-panel-controls}

| Rialú | Réamhshocrú | Raon (jog) |
|---|---|---|
| **Tarraing gach ró i ngach fráma** | air | |
| **Buiséad oiriúnaitheach** | air | |
| **Sprioc-FPS** | 60 | 20-240 (1000) |
| **Sprideanna tosaigh / fráma** (oiriúnaitheach) nó **Sprideanna / fráma** | 4.00M | 65,536-268,435,456, logartamach (268,435,456) |
| **Taifeach teasa** | 100% | 25-100%, iolraithe faoin scála céim-a-dó oiriúnaitheach |
| **Mionchoigeartú forásach** | air | As: is meastachán singil-fhráma úr gach fráma (úsáideach chun an samplú amh a fheiceáil). |

Féach freisin [Painéal feidhmíochta agus forleagan staitisticí](performance-and-stats.md).

## Do fhorbróirí {#for-developers}

### Sraitheanna iarrthóireachta {#candidate-rows}

Stóráiltear sraitheanna in ord méadaitheach ama. Athraíonn fuinneog na haimline [*lo*, *hi*] ina raon sraitheanna le dhá chuardach dheighilteach thar cholún an ama ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); gan cholún ama is iarrthóir é gach sraith. Is iad seo na **Sraitheanna sa fhuinneog** den fhorleagan staitisticí. Tarlaíonn tástálacha in aghaidh na sraitheanna - scagairí, grúpaí, roinnt, baint, stiall, saol - ina dhiaidh sin, sa shader; costaíonn sraith a theipeann aon ghlao veirtéacs amháin agus gan píosaí.

### An plean samplaithe {#the-sampling-plan}

Roinneann [`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) an raon iarrthóireachta ina **bloic de 4,096 sraith as a chéile** agus roghnaíonn sé cé mhéad le tarraingt ón mbuiséad spriorad an fhráma:

- Má chlúdaíonn an buiséad gach bloc, tarraingítear iad go léir - tá an fráma beacht.
- Murab ea, glactar bloic ar fhad chothrom ar fud an raoin, arna scaoileadh le jitter a bhogann an uimhir órga gach fráma, ionas go gclúdaíonn fráma i ndiaidh a chéile bloic dhifriúla agus go líonann an t-aonach go cothrom. Is **samplú stratach** é seo: tá gach cuid den raon ama i ngach fráma.

Iolraítear teas gach sraithe tarraingthe faoi **iarrthóirí / curtha isteach**, ionas go bhfuil teas ionchasach an fhráma beacht ag aon bhuiséad; ní bhraitheann ach an torann ar an mbuiséad. Maireann sraitheanna i gcuid de 8,388,608 (féach [Cuimhne GPU](gpu-memory.md)); scoiltear bloc nuair a thrasnaíonn sé cuid, agus faigheann gach cuid liosta na dtosach bloc is gá di a tharraingt.

Ní féidir le plean amháin níos mó ná 65,536 bloc - 268,435,456 spriorad - a iompar, toisc go gcoinníonn an dá chúltaca maolán tosach bloc 65,536-slot seasta. Teorannaítear iarratas ar níos mó ansin, agus léirítear an easnamh go hionraic mar fhrámaí breise le teacht le chéile.

### Tarraing gach ró i ngach fráma {#draw-every-row-each-frame}

**Feidhmíocht → Tarraing gach ró i ngach fráma** (réamhshocrú **air**): is urlár in ionad uachtar an buiséad, agus tarraingíonn fráma a thosaíonn meastachán úr gach sraith ar a bhfuil sé freagrach (suas le teorainn 268M).

An fáth: scriosann bogadh ceamara an carnadh, ionas gur meastachán singil é fráma gluaiseach a bhfuil a thorann socraithe ag cé mhéad sonraí a tharraing sé - le ceathrú díobh tarraingthe, feiceann tú ceathrú díobh i bponcanna meáchanta geala, agus sin a fhágann go ndealraíonn radharc gluaiseach ina ghlioscarnach. Déanann tarraingt gach rud gach fráma ina phictiúr críochnaithe. Is é an costas go leanann am an fhráma anois méid na sonraí san fhuinneog; is iad na lúiseanna fuinneog ama níos caolaí, scagairí, nó baint faid, a laghdaíonn na hiarrthóirí in ionad iad a shamplú níos tanaí.

Cas as é ar chrua-earraí nach féidir leo an raon iomlán a iompar ag an am céanna: is teorainn fhíor é *Sprideanna / fráma* ansin, agus tagann an radharc le chéile thar cúpla frámaí fanacha in ionad sin.

Seo an costas a bheith ag plean iomlán, tomhaiste ar GPU deisce ardchaighdeáin ag canbhás 4K le leibhéal mór, sprideanna de ga 1 m (picteilín nó dhó): thart ar 100M spriorad in aghaidh an fhráma ag 30 fps, 200M ag 15 fps, agus an uasmhéid 268M ag thart ar 12 fps. Le sprideanna chomh beag sin is é an céim veirtéacs an costas ar fad, agus ní athraíonn taifeach an teasa dada; le sprideanna móra is é an líonadh é: 8M sprideanna de ga 100 m thóg 2.5 s in aghaidh an fhráma ag taifeach teasa iomlán agus 170 ms ag 25%. Mar sin tosaíonn **Tarraing gach ró i ngach fráma** ag 67M agus méadaíonn sé de cheathrú in aghaidh an fhráma le fad go mbíonn fráma faoi bhun 150 ms, agus laghdaítear faoi dhó nuair a bhíonn siad os cionn 400 ms, ionas nach rithfidh radharc trom fráma thar a bhfuil an faire GPU ceadaithe.

### An buiséad oiriúnaitheach {#the-adaptive-budget}

Coigeartaíonn **Feidhmíocht → Buiséad oiriúnaitheach** (réamhshocrú air) buiséad na sprideanna chun **Sprioc-FPS** a choinneáil ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Tá sé neamhghníomhach san athsheinm boscaí agus le linn renders físe.

Is é an t-ionchur an t-am fráma, réidhithe (90% den luach roimhe + 10% den luach nua, le frámaí aonair teoranta go 2 s), i gcoinne sprioc 1000 / max(15, Sprioc-FPS) ms.

**Céim a haon - spriorad.** Gach fráma iolraítear an buiséad faoi `1 + (sprioc / fráma - 1) × gnóthachan`, le gnóthachan 0.35 nuair a bhíonn sé ró-mhall agus 0.08 nuair a bhíonn spás ann, teorannaithe go fachtóir 0.5-1.25 in aghaidh an fhráma agus go 65,536-268,435,456 spriorad.

**Céim a dó - taifeach.** Ach amháin nuair a bhíonn an buiséad ag a urlár cheana féin agus nuair atá frámaí fós níos mó ná 10% ró-mhall, titeann taifeach an mhaolán teasa, 8% in aghaidh an fhráma, síos go 25% den canbhás; téann sé ar ais 4% in aghaidh an fhráma nuair a bhíonn 30% spáis ann. Titeann costas an fhragment leis an gcearnóg den taifeach, rud atá beagnach dofheicthe faoi grádán mín. (Tomhaiste ar rindreáil bhogearraí le 10M sraith agus sprideanna ró-mhóra: 141 ms → 17 ms in aghaidh an fhráma.) Cruinnítear an scála go sechéadaí, agus taispeánann *Taifeach teasa* an fhorleagain é.

**Ag éirí as.** Is cosúil fráma mall é is cibé an spriorad a chuir ann é nó leibhéal trom - ní thugtar aon am de réir pas. Má sheasann an buiséad ag a urlár agus má fhanann frámaí faoi bhun 70% den sprioc ar feadh 30 fráma, níor na sprideanna ba chúis leis an gcostas: athraíonn an rialaitheoir go **dreapadh**, ag iolrú an bhuiséid faoi 1.5 gach 14 fráma agus ag athchóiriú an taifigh, chomh fada is a fhanann am an fhráma laistigh de 1.5× mar a bhí ag an urlár. Gearrann dreapadh a dhéanann rudaí níos measa ná sin siar go 60% agus tosaíonn an rialú gnáth arís; cuireann an sprioc deireadh leis an dreapadh.

Nuair a bhíonn an buiséad oiriúnaitheach as, is é an buiséad **Sprideanna / fráma** go simplí.

Nuair a bhíonn *Tarraing gach ró i ngach fráma* air, ritheann an buiséad oiriúnaitheach fós, ach ardaíonn an riail bheacht an buiséad chun gach sraith iarrthóireachta a chlúdach, agus mar sin ní rialaíonn sé ach céim an taifigh agus frámaí nach dtosaíonn meastachán úr i ndáiríre.
