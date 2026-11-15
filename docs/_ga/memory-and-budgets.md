---
title: "Cuimhne agus buiséid"
parent: "Sonraí a iontráil"
nav_order: 6
lang: "ga"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Cuimhne, buiséid agus seiceáil oiriúnachta

Tá cuimhne theoranta ag do ríomhaire. Suimíonn 3DHeat suas cad a theastaíonn ó do chomhaid agus insíonn sé duit roimh **Lódáil** an bhfeileann siad.

![An Meastachán cuimhne ag "won't fit", le Lódáil gach [N] rónna réamhlíonta agus an cnaipe Lódáil ag léamh Too large - reduce or decimate](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Ró-mhór don ríomhaire seo? Molann 3DHeat gach N-ú rón a lódáil ina ionad.*

Teipeann ar chluaisín brabhsálaí a bhfuil an cuimhne ídithe aige i lár lódála agus caillfidh sé nóiméid oibre, agus caillfidh GPU a bhfuil níos mó iarrtha air ná mar atá aige a chomhthéacs nó tiocfaidh mall mór air. Mar sin roimh a dtosaíonn lódáil deir painéal na Foinse cé mhéad cuimhne a theastaíonn, cuireann sé i gcomparáid le buiséid a braitheadh don mheaisín seo é, agus diúltaíonn sé - le bealach amach - nuair nach bhfeileann sé. Tá an tsamhail sa [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Meastachán na cuimhne {#the-memory-estimate}

Taispeántar é os cionn chnaipe **Lódáil** nuair a bheidh na rónna comhairithe.

| Líne | Brí |
|---|---|
| **Meastachán cuimhne** - *feileann* / *teann* / *ní fheileann* | An breith, glas, ómra nó dearg. |
| `N rónna · B B/rón` | Na rónna a lódálfar (tar éis an chéimnithe) agus na bearta seasta in aghaidh an róin. |
| `RAM X resident, Y peak while loading` | Cuimhne a coinnítear nuair a lódáiltear, agus an barr le linn na lódála. |
| `GPU Z · est. load T` | Cuimhne GPU do na rónna, agus fad measta ag 1.2 milliún rón in aghaidh an tsoicind. |
| Ainm GPU | Ainm an rindreálaí, nuair a thuairiscíonn an tiománaí é. |
| Teachtaireachtaí | Cén fáth nach bhfeileann sé, nó go bhfuil sé teann, agus cad atá le déanamh. |
| **Lódáil gach [N] rón** | An céimniú díghrádaithe (féach thíos). |
| `Budget: X RAM, Y GPU. Adjust under Performance → Resource budgets.` | Na buiséid a d'úsáid an seiceáil. |

### Bearta in aghaidh an róin {#bytes-per-row}

| Colún | Seasta (RAM) | Nótaí |
|---|---|---|
| Suíomh | 12 | Trí fhlaoitphointe 32-giotán, i gcónaí (tá eagar fiú ar ais ingearach réidh) |
| Am | 4 | Nuair a bhíonn mapáilte |
| Saol | 4 | Nuair a bhíonn am agus duine mapáilte |
| Duine | 4 | Nuair a bhíonn mapáilte |
| Grúpa | 2 | Nuair a bhíonn mapáilte |
| Seisiún | 4 | Nuair a bhíonn mapáilte |
| `Source file` | 4 | Nuair a lódáiltear níos mó ná comhad amháin |
| Gach colún scagaire | 4 | In aghaidh colúin *Coinnigh le haghaidh scagadh* a bhfuil tic air |

Cuireann an **barr** leis an méid nach dteastaíonn ach go sealadach ón lódáil - 8 beart de am 64-giotán le linn cumasc, 12 beart d'eochracha sórtála agus d'innéacsanna, 4 beart de scríobadh permutation (an trí cinn nuair a bhíonn am mapáilte), agus 4 beart fad a bhíonn an colún grúpa fós 32-giotán - agus iolraíonn sé an suim faoi **2.0**. Tomhaiseadh an fachtóir sin (rinne lódáil iolracomhad fíor barr ar 1.9× na n-eagar liostaithe, ón tacar oibre den dhíchódóir Parquet, na cóipeanna a ghearrann gach colún go fad, agus cuimhne a scaoileadh nach bhfuil ar ais go fóill) agus cruinníodh suas é, mar go gcosnaíonn meastachán faoin mbarr cluaisín a thuairteadh, ach ní chosnaíonn meastachán thar an mbarr ach céimniú gan ghá.

Ar an **GPU** cosnaíonn gach rón 8 beart (suíomh agus grúpa, 16 giotán in aghaidh an cheann), breis 4 beart (am agus saol, 16 giotán in aghaidh an cheann) nuair a bhíonn an dá cheann am agus duine mapáilte. Féach [Cónaitheacht cuimhne GPU](gpu-memory.md). Níl téacsúiri scagaire (4 beart in aghaidh an róin in aghaidh scagaire ghníomhaigh) agus tosaí deirí an teasa líne (8 beart in aghaidh an róin nuair a bhíonn mód Línte ar siúl) san mheastachán seo.

## An seiceáil oiriúnachta {#the-fit-check}

Déantar comparáid idir trí shrian ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- barr RAM i gcoinne an **bhuiséid RAM**,
- bearta GPU i gcoinne an **bhuiséid GPU**,
- líon na rónna i gcoinne an **uasteorainn sórtála** de 400,000,000 rón, nuair a bhíonn colún ama mapáilte.

Socraíonn an cóimheas is measa de na trí cinn: suas go 70% *feileann*, suas go 100% *teann* (ba cheart go lódálfaí é, ach bí ag súil go mbeidh sé mall), os cionn sin *ní fheileann*. Nuair nach bhfeileann sé, ainmníonn an painéal an srian ceangailteach agus molann sé:

- gach *N*-ú rón a lódáil, le *N* = ⌈rónna / rónna a fheileann⌉, réamhlíonta sa bhosca céimnithe;
- colúin scagaire a scaoileadh, colún ama a dhí-mhapáil (a bhaineann an sórtáil agus a theorainn, ar chostas na haicsine ama), nó an buiséad a ardú.

Nuair nach fíric faoin crua-earraí í an buiséad féin - chuir an brabhsálaí teorainn leis an bhfigiúr RAM, choinnigh an réamhshocrú síos an rud atá saor faoi láthair, nó is tuairim í an figiúr GPU - deir an teachtaireacht sin, ionas nach sroichfidh tú céimniú nach dteastaíonn uait.

### Céimniú {#decimation}

**Lódáil gach [N] rón** coinníonn sé rón amháin as *N*, comhairithe in aghaidh an chomhaid. Is meán é an teas, mar sin tugann gach N-ú rón an dáileadh céanna le níos mó torainn - an margadh céanna a dhéanann an rindreálaí cheana ar gach frámú. Tosaíonn an bosca ag 1 (*rón (uile)*); nuair nach bhfeileann an roghnú, líontar é leis an gcéimniú molta mura bhfuil tú tar éis rud a chlóscríobh ann. Léann cnaipe Lódáil ansin *Lódáil N comhad (1 in aghaidh K)*, agus taifeadtar ainm an tacair sonraí `every Kth row`.

### Uasteorainn an tsórtála {#the-sort-ceiling}

Tá an rindreálaí ag teastáil ó rónna in ord ama méadaitheach, mar sin ciallaíonn colún ama mapáilte gach rón a shórtáil, le sórtáil radacs thar eochracha 32-giotán ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Os cionn **400 milliún** rón diúltaítear é in ionad iarracht a dhéanamh air i gcluaisín. Seiceáiltear é seo roimh an lódáil, mar sin diúltaítear roghnú os cionn na teorann le moladh céimnithe in ionad é a léamh go hiomlán agus teip ag an gcéim dheireanach. Gar don teorainn (*teann*) tugann an painéal rabhadh go bhfuil an sórtáil ina pas fada gan dul chun cinn ar leith. Gan colún ama ní tharlaíonn aon sórtáil agus ní bhaineann aon teorainn leis.

## Buiséid acmhainne {#resource-budgets}

**Feidhmíocht → Resource budgets** (líne inscoilte ag bun phainéal na Feidhmíochta, a léann `Resource budgets - RAM, GPU, cores`). Braitear na buiséid; is é an figiúr braite an réamhshocrú; agus ní théann na sleamhnáin níos airde ná **uasteorainn** a bhfuil an figiúr braite mar é ach amháin nuair a bhfuil ar eolas nach tomhas é an braith.

| Rialtán | Raon | Brí |
|---|---|---|
| **RAM do shonraí na rónna** | 256 MiB go teorainn an RAM, logartamach | Buiséad RAM don seiceáil oiriúnachta. Marcáilte *(os cionn braite)* thar an réamhshocrú braite, *(max)* ag an teorainn. |
| **GPU do shonraí na rónna** | 128 MiB go teorainn an GPU, logartamach | Buiséad GPU don seiceáil oiriúnachta agus do uaslódáil rónna. Marcáilte *(os cionn braite)* thar an réamhshocrú braite, *(max)* ag an teorainn. |
| **Snáitheanna parsála** | 1 go líon na gcroí loighciúil | Cé mhéad comhad a pharsáiltear ag an am céanna lódála, gach ceann i gcoimeádán oibrí dá chuid féin. Réamhshocrú croí - 2 (croí - 1 ar cheithre chroí nó níos lú). Féach [Snáitheanna parsála](#parser-threads) (faoi Do fhorbróirí). |
| Líne foinsí | | Cá tháinig gach figiúr (`RAM: …. GPU: …. CPU: ….`). |
| **Athbhraith** | | Iarrann sé léamh cuimhne nua ar an bhfreastalaí forbartha agus athríomhann sé gach buiséad. |
| Ainm GPU | | Gearrainm an oiriúntóra; is é an sreang iomlán an rindreálaí an tooltip. |

### Buiséad GPU a ardú {#raising-the-gpu-budget}

Feidhmíonn buiséad GPU os cionn an fhigiúir bhraite mar a socraíodh é: tógann an seiceáil agus an uaslódáil an figiúr céanna ó fheidhm amháin ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), a theorannaíonn é ach ag uasteorainn GPU a stopann an sleamhnán. Mar sin uaslódáiltear lódáil a pasann an seiceáil go hiomlán. Thar an bhfigiúr braite léann an sleamhnán *(os cionn braite)*: is é an uimhir ansin do bhreithiúnas féin ar an gcárta, ní tomhas, agus baineann sé an riosca de chomhthéacs caillte nó mall mór a bheith mar thoradh air má leagtar níos airde ná mar atá ag an gcárta é.

## Tacair mhóra sonraí: na luamháin {#huge-datasets-the-levers}

Ó is saoire go dtí is láidre:

1. **Níos lú colún scagaire.** Is 4 bheart in aghaidh an róin agus pas díchódaithe gach ceann acu.
2. **Céimniú.** Gach *N*-ú rón.
3. **Gan colún ama.** Gan sórtáil, gan uasteorainn sórtála, gan 4-8 bheart in aghaidh an róin d'am agus saol - agus gan amlíne.
4. **Buiséid a ardú**, nuair a bhíonn a fhios agat go bhfuil an chuimhne ann.

Ag am rindreála láimhseálann tacair mhóra sonraí trí shampláil agus carnadh forásach in ionad na sonraí a laghdú; féach [Samplú agus buiséid](sampling-and-budgets.md).

## Do fhorbróirí {#for-developers}

### Snáitheanna parsála {#parser-threads}

Parsálann lódáil de roinnt comhad suas go **Snáitheanna parsála** díobh ag an am céanna, gach ceann i gcoimeádán parsálaí a thosaíonn an coimeádán ionchuir don lódáil sin ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Ag 1, nó do chomhad amháin, parsáiltear comhaid ceann i ndiaidh a chéile sa choimeádán ionchuir féin.

Ní scaoileann rith roinnte ag an am céanna an seiceáil oiriúnachta:

- **Comhairítear an tógálaí ar dtús.** Leithdháiltear na colúin chumaisc don roghnú iomlán sula léitear an chéad chomhad, mar sin ní fhaigheann na comhaid atá ar siúl ach an méid a fhágann buiséad RAM taobh leo (`parseHeadroom`): suíomh, am 64-giotán, uillinn féachana, duine, grúpa 32-giotán, seisiún, colúin scagaire agus `Source file`, in aghaidh an róin atá le lódáil - faoi 2.6 nuair is meastachán CSV é líon na rónna, do cholún a fhásann ina cholún níos mó.
- **Forchoimeádann gach comhad a chostas sula dtosaíonn sé** (`fileParseBytes`): a rónna (ó fhoot Parquet; sciar CSV den mheastachán de réir méide) faoi na colúin chéanna, faoi **8** - an bloc féin, an cóip in aice leis fad a dhéantar rónna gan suíomh a dhíchur, agus tacar oibre an díchódóra, a bhfuil i bhfad níos mó ná a n-aitheantais ag colúin téacs. Ní laghdaíonn céimniú é seo, mar léitear comhaid go hiomlán agus déantar céimniú ina dhiaidh sin. Is lamháltas tomhaiste é an 8: ag 3, nó ag 5, chuir tríocha snáithe parsála tábla thar a theorainn ar 86 milliún rón le hainmneacha duine agus seisiúin; ag 8 ní dhearna.
- **Ní thosaíonn comhad eile ach amháin má fheileann a fhorchoimeádadh** sa mhéid atá fágtha. Coinníonn comhad a chríochnaigh ach a bhfuil ag fanacht ar chomhad roimhe a chumasc a fhorchoimeádadh go dtí go gcumasctar é.
- **Ritheann comhad amháin i gcónaí.** Nuair nach bhfuil aon rud forchoimeádta, tosaíonn an chéad chomhad eile cibé costas atá air - is í sin an lódáil ceann-ar-cheann a cheadaigh an seiceáil oiriúnachta, mar sin titeann buiséad teann siar go dtí í in ionad diúltú.

Is é an figiúr *barr le linn lódála* barr lódála ceann-ar-cheann, a thagann ag an sórtáil, tar éis gach comhad a léamh. D'fhéadfadh comhaid parsáilte taobh le taobh cuimhne os cionn an fhigiúir sin a ghlacadh agus iad á léamh; coinníonn na forchoimeádais laistigh de bhuiséad RAM é, a mhéid is atá na meastacháin thuas ceart.

Is é ord cumaisc ord an roghnaithe, cibé ord ina gcríochnaíonn na comhaid, mar sin tá an uimhriú duine, grúpa agus seisiúin, na rónna agus luachanna `Source file` comhionann le lódáil ceann-ar-cheann. Léimtear comhad nach féidir a léamh agus liostaítear é mar a bhíothas roimhe seo. Deireann bás oibrí parsála leis an lódáil ar fad, mar a bhí le bás an oibrí ionchuir riamh, agus scoirtear gach oibrí parsála nuair a chríochnaíonn an lódáil, cibé mar a chríochnaíonn sí. Mura féidir oibrithe parsála a thosú ar chor ar bith, parsáiltear na comhaid sa choimeádán ionchuir ina ionad.

### Conas a braitear na figiúirí {#how-the-figures-are-detected}

Ritheann [`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) ag tosú, arís nuair a bhíonn an rindreálaí ann, agus ar **Athbhraith**.

**RAM, leis an bhfreastalaí forbartha.** Frithéann `start.bat` agus `npm run dev` an leathanach ó phróiseas a fhéadann cuimhne an mheaisín a léamh, ag `/__host/memory` (freagraítear laistigh de 1.5 s nó déantar neamhaird de). Is é an réamhshocrú an níos lú de 60% den RAM suiteáilte agus 80% den RAM saor faoi láthair; is é an uasteorainn 60% den suiteáilte. Nuair is é an cuimhne saor a choinníonn an réamhshocrú síos, deir an painéal é sin agus molann sé clár a dhúnadh agus **Athbhraith** a bhrú.

**RAM, gan é** (suiteáil statach): ní thuairiscíonn aon API brabhsálaí cuimhne saor, agus úsáideann Chrome agus Edge `navigator.deviceMemory` a thiontar síos go cumhacht de dhó agus a theorannaítear go 8 GiB. Is é an réamhshocrú 60% de `deviceMemory`, teorannaithe breise go 4 × heap JS saor an cluaisín sa mhéid a thuairiscíonn an brabhsálaí, nó 4 GiB nuair nach dtuairiscítear aon rud. Nuair a léann `deviceMemory` go díreach 8 (an teorainn), marcáiltear an figiúr mar *capped* agus is é an uasteorainn 4 × an réamhshocraithe, le nóta nach uimhir dearbhaithe duitse í an uimhir thar an réamhshocrú, ní tomhas.

**Cibé acu**, tá an réamhshocrú RAM agus an uasteorainn teorannaithe go **12 GiB**, an méid cuimhne array-ar-chineál is mó a fhéadann cluaisín Chrome amháin a shealbhú cibé rud atá ar an meaisín (shroich leathanach 15.75 GB agus theip air; fágann 12 seomra do gach rud eile), agus ní théann sé riamh faoi 256 MiB.

**Cuimhne GPU.** Ní thuairiscíonn aon API gréasáin í ar chor ar bith.

- Leis an bhfreastalaí forbartha, léann `nvidia-smi` cuimhne an chárta (an oiriúntóir is mó) nó, ar Windows, luach clárlainne an oiriúntóra taispeána `HardwareInformation.qwMemorySize`. Is é an réamhshocrú 70% de, an uasteorainn 90%.
- Gan léamh, tuairtear é: 2 GiB de réir réamhshocraithe; 4 GiB nuair is 16,384 px nó níos mó an tuar is mó (cárta scartha), 1 GiB nuair is lú; nó 8 × `maxBufferSize` WebGPU nuair is mó sin. Is é an uasteorainn ansin 8 × an figiúr tuartha, mar ní insíonn an tuar mar is mó ach ceann comhtháite ó cheann scartha agus níos mionsonraí ná sin ní insíonn sé. Deir an painéal go bhfuil an figiúr tuartha.
- Ní faoi 128 MiB riamh.

**CPU.** `navigator.hardwareConcurrency` (4 nuair nach dtuairiscítear).
