---
title: "Anailís cúinne ar chúinne"
parent: "Anailís rása"
nav_order: 55
lang: "ga"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Anailís cúinne ar chúinne

Cuirtear dhá lap den chúrsa céanna i gcomparáid cúinne ar chúinne. Do gach cúinne insíonn an fheidhmchlár cé a bhí níos tapúla, cé mhéad ama a bhí ann, agus cén fáth - coscadh ró-luath, cumhacht a fuarthas déanach, líne níos leithne a glacadh - ionas go bhfuil a fhios agat cad atá le cleachtadh ar dtús.

![Tátal oscailte i Cá bhfuil le feabhsú, in aice leis an tábla Cúinne ar chúinne](../assets/img/en/race-corner-finding.webp)

Sampla oibre: i gcúinne 3, coscann Tiománaí A 20 m níos luaithe ná Tiománaí B agus caillteann sé 0,15 s ag teacht ansin, ach tá sé ar an throttle níos luaithe agus gnóthaíonn sé 0,15 s ar an mbealach amach. Glan 0,00 s: tá an chúinne cothrom, agus ní insítear do dhuine ar bith coscán níos déanaí.

## Cad a fheiceann tú {#what-you-see}

### Cá bhfuil le feabhsú {#where-to-improve}

An chuid taobhbharra don lap dírithe ("Luchtaigh dhá lap ar a laghad de chúrsa amháin." go dtí sin).

**An ceann:** "<lap> <am> i gcoinne <tagairt> <am>" agus an bhearna am lap - nó, don tagairt, "i gcoinne an lap eile is tapúla tríd gach cúinne (…)" agus an iomlán a chaill sé. Taobh leis, an caillteanas scoilte i *tiomáint* agus *carr / comhthéacs*.

**Barra an bhriseadh síos:** an t-am caillte de réir grúpa cúise (coscánú, iontráil, slí amach, stráice, carr, comhthéacs), i ndathanna na gcúiseanna, le finscéal.

**Na tátail**, trí liosta:

1. Caillteanais tiomána, is costasaí ar dtús, ar a mhéad **12** - nó "Níl aon áit ar a seasfadh tiomáint difriúil mar bhua ama amach."
2. **Taispeáin cad a chosain an carr nó an staid (X s)** - caillteanais carr agus comhthéacs, ar a mhéad 8 (ar siúl de réir réamhshocraithe).
3. **Áit a bhfuil <lap> níos tapúla, nó cothrom ar bhealach eile (N)** - gnóthachain agus cúinní cothroma, ar a mhéad 10 (ar siúl de réir réamhshocraithe).

Taispeánann gach tátal a rang, a teideal (an chúinne agus cad a tharla, agus an costas do chaillteanas), an líne bhreithe, an costas (gnóthachain le lúide) le barra, agus sliseog: *coscánú*, *iontráil*, *slí amach*, *stráice* (caillteanais tiomána, le "· carr X" nuair a mhíníonn an carr 0,02 s nó níos mó), *carr*, *comhthéacs*, *níos tapúla*, *cothrom*. **Cliceáil ar cheann** chun na carranna a chur ar aon líne 40 m roimhe, é a fhrámú agus a athsheinm, agus oscail a thomhais:

- **Coscánú:** cá gcoscann gach duine (nó scaoil) agus ó cén luas, agus cé mhéad méadar níos luaithe nó níos déanaí (ó 5 m);
- **Is moille:** íosluas gach laps agus cá háit;
- **Throttle iomlán:** cá raibh gach duine cothrom, agus cé mhéad níos luaithe nó níos déanaí;
- **Líne:** difríocht tosaithe casaidh, gha is teannaí, cé chomh fada istigh nó amuigh, agus cruth líne agus buaic gach laps;
- **Stráice go dtí an chéad chúinne eile:** a fhad, an dá luas nuair a bhí an dá cheann cothrom, cad a chaill nó a fuair sé agus cén fáth - an luas tosaigh, tarraingt níos láidre an ceann eile, scaoileadh, luas scuabtha, conas a tiománadh é (codanna ó 0,02 s);
- **An carr:** cé mhéad den chaillteanas is carr é, agus cén fáth (tarraingt, greim, coscáin; nuair 0,02 s nó níos mó);

ansin an leid, **Na carranna:** (i gcarranna difriúla, féach [Próifílí carr](race-car-profiles.md#what-the-cars-decide-in-a-corner)), agus comhairle na líne.

### Cúinne ar chúinne {#corner-by-corner}

Tábla (le dhá lap nó níos mó), ráitis amháin do gach codán, de rang an laps dhírithe nuair a bhíonn roinnt rang ann:

| Colún | Taispeánann |
|---|---|
| Cúinne | `T3`, `T11-T12` |
| Is tapúla | an lap is tapúla tríd (a am féin ó thosach an chodáin go deireadh) |
| de | a ghlan os cionn an dara is tapúla, s |
| líne | cruth agus buaic an laps is tapúla ("V · déanach", "U/V · lár"); cuir an cursar os a chionn do na gha is teannaí, is iontráil agus is slí amach; "an dá bhealach" do choimpléasc measctha |
| (an lap dírithe) | cé chomh fada taobh thiar den is tapúla a bhí sé, nó ✓ nuair a bhí sé is tapúla |

Osclaíonn cliceáil ar líne tátal an laps dhírithe ansiúd (nó cuireann sí na carranna ar aon líne 40 m roimh an gcodán). Faoin tábla, nuair a bhíonn am ag gach cúinne: "Is tapúla tríd gach cúinne, curtha le chéile: <am> (± ar an tagairt / ar an gcinn is fearr den rang X)" - na codanna is fearr agus an rith is tapúla go dtí an chéad chúinne nuair is a stráice féin atá ann.

## Conas a oibrítear amach é {#how-it-is-worked-out}

An riail rialaithe: **déantar cúinne a mheas ina iomláine**, ó chrios coscánaithe dó go dtí an crios coscánaithe don chúinne eile. Creidtear lap a choscann níos luaithe chun an carr a chasadh agus ar an gcumhacht níos luaithe leis an slí amach a cheannaigh sé, agus ní insítear dó coscán níos déanaí.

## Aon ais fhaid amháin {#one-distance-axis}

Cuirtear laps i gcomparáid de réir fhaid, ní de réir ama - tá dhá lap ag cúinní difriúla nuair a bhíonn soicind taobh thiar. Ní de réir odaiméadar gach lap féin ach an oiread (clúdaíonn líne níos teannaí méadair níos lú). Is é conair tiomáinte an lap **tagartha** an t-ais:

- Déantar samplaí gach laps eile a **thionscnamh** ar chonair na tagartha: faigheann gach sampla `s`, cé chomh fada is atá sé ar an tagairt, agus `d`, cé chomh fada ar chlé (dearfach) nó ar dheis atá sé. Ritheann an cuardach ar aghaidh ón meaitseáil roimhe (8 codán cosáin siar go 40 ar aghaidh), ionas nach léimeann lap a thrasnaíonn é féin nó a rith faoi féin go dtí an trasnú eile riamh. Lorgaítear an chéad sampla sa chéad ceathrú den chonair (ar chiorcad, tagann tosach agus críoch le chéile); nuair nach bhfuil aon rud laistigh de 30 m, glactar leis an bpointe is gaire in áit ar bith nach bhfuil taobh thiar den mheaitseáil dheireanach (tar éis spin nó turas amach). Ní laghdaíonn `s` riamh: coinnítear sampla a thionscnaíonn taobh thiar den cheann roimhe.
- Athshamplaítear gach cainéal ar eangach amháin, **gach 2 m**, go líneach; cainéil a cheumnaíonn (gear, bratacha) leis an sampla is gaire. Lasmuigh de raon an laps féin tá na luachanna folamh.
- Tionscnaíonn an chéad sampla agus an deireanach de lap beagán istigh de chríocha na tagartha, mar sin **iompraítear gach lap suas le 15 m** thar a chríocha ag an luas a bhí aige (fásann an t-am de réir fad thar luas, coinnítear an chuid eile) - ionas go mbíonn a delta ag an líne ina dhifríocht am lap.
- `delta` = am an laps ag gach pointe eangaigh lúide na tagartha: an bhearna. `lateral` = `d` ar an eangach.

Is é an t-am a thóg lap níos mó ná lap eile idir dhá phointe eangaigh ná difríocht a ndeltaí: `rel(s)`. Tógtar gach rud thíos air.

## Cúinní {#corners}

Aimsítear ar an **tagairt** (`findCorners`), a luas réidh thar ±6 m agus a lúbthacht (athrú treo thar ±5 sampla, réidh thar ±10 m):

1. **Íosluasanna le feiceálacht.** Pointe is ísle taobh istigh de ±40 m, a bhfuil a thitim ón luas is airde ar gach taobh (sula dtagann íosíos níos ísle) ar a laghad `max(2,5 m/s, 6% den luas)`.
2. **Lúbanna.** Buaic áitiúil lúbthachta níos géire ná gha **300 m** gan íosluas taobh istigh de 80 m: is cúinne fós é lúb lán-throttle le tiomáint.
3. **Céimeanna.** Ó gach buaic siar fad is atá an tagairt ag coscánú (> 0,1) nó as throttle iomlán (< 0,95): an iontráil; ar aghaidh fad is atá as throttle iomlán: an slí amach. Faigheann lúb a glacadh go cothrom ±30 m. Coinnítear cúinní forluiteacha ar leithligh ach déantar iad a thíleáil timpeall an laps.
4. Uimhrithe T1, T2 … in ord an laps; **ar chlé nó ar dheis** de réir comhartha na lúbthachta agus cibé an bhfuil an domhan scáthánaithe (aithnítear mar scáthánaithe é nuair nach eol).

**Fuinneog na cúinne** (cá gcasann an tagairt): amach ón bpointe is teannaí taobh istigh de ±40 m den bhuaic fad is a fhanann an lúbthacht os cionn séú cuid de a buaic, móide 10 m ar gach taobh. Tugann a thaobh comhartha "istigh".

## Codáin: ó chrios coscánaithe go crios coscánaithe {#segments-braking-zone-to-braking-zone}

Tá an bóthar leath-bhealach go dtí na buaicphointí ar gach taobh faoi gach cúinne. Ann:

- **Is é pointe is moille gach laps** dip fíor ina luas - gan rud ar bith níos moille taobh istigh de 6 m (3 phointe eangaigh) ar gach taobh, ag féachaint thar chríocha an stráice, ionas nach dtuigtear riamh go bhfuil an slí amach ón gcúinne roimhe fós ag luasghéarú isteach ann mar é - cuardaithe ó 15 m roimh fhuinneog na cúinne go 10 m tar éis di. Cuirtear lap nár mhoilligh riamh ansin ag an mbuaic.
- **Cá dtosaíonn lap ag moilliú dó** (`entryOf`): siar ó a phointe is moille trí an coscánú nó an scaoileadh, thar bhlaoscanna de throttle iomlán, go dtí go mbeadh a chos síos aige (throttle ≥ 0,95, coscán ≤ 0,1) ar feadh **10 m**; coinnítear throttle a tógadh arís sna **30 m** deiridh roimh an bpointe is moille mar bhaineann sé fós leis an gcúinne; lán-throttle ar fad, an pointe is moille féin. Lap gan cainéal throttle, nó nár bhí a chos síos riamh ó an chúinne roimhe, tosaíonn sé ag a phointe is tapúla eatarthu.
- **Tosaíonn an codán** ag an gcéad cheann de gach lap a thosaíonn ag moilliú dó (4 m níos luaithe), agus ritheann go tosach an chéad cheann eile, ionas go bhfuil coscánú gach laps istigh ann agus go dtíleann na codáin an lap.

**Coimpléisc.** Cúinní as a chéile nach dtiomáineann an tagairt riamh go lán-throttle eatarthu - níos lú ná **40 m** de throttle iomlán - is codán amháin iad, "T11-T12", a thiomántar mar aon amháin; coinníonn coimpléasc **trí** lúb ar a mhéad (cuid chasta a thiomántar gan a bheith cothrom riamh tosaíonn ceann nua). Is *measctha* coimpléasc a chasann an dá bhealach: ní thomhaistear cruth líne aonair dó.

**Ar chiorcad** (críochnaíonn an tagairt laistigh de 50 m dá tosach), ritheann stráice an chodáin dheireanaigh thar an líne go dtí an chéad phointe coscánaithe: comhaireofar rith lap eitilte ón líne leis an gcúinne dheireanach. Coinníonn lap a thosaigh ó stad nó ó thosach rása (féach [An tosach](#the-start)) an rith sin ar leithligh.

### Cad a leanann cúinne isteach ann {#what-a-corner-leads-onto}

Tomhaiste ar an tagairt: méadair ag throttle iomlán tar éis na cúinne (ó a throttle iomlán go deireadh an chodáin, móide rith thar an líne) agus roimhe ("tar éis" an chodáin roimhe, nó ón tosach).

| Cineál | Riail |
|---|---|
| **idir dhá stráice** (`both`) | 200 m nó níos mó roimhe **agus** 120 m nó níos mó ina dhiaidh |
| **ar stráice** | 200 m nó níos mó ina dhiaidh, nó 120 m nó níos mó agus a oiread agus a bhí roimhe |
| **i ndiaidh stráice** | 200 m nó níos mó roimhe |
| **nasc** | rud ar bith eile |

## Cad a rinne gach lap i gcúinne {#what-each-lap-did-in-a-corner}

`cornerMetrics`, do gach lap agus codán, ar an eangach (céim 2 m). Pedail: comhaireann coscán os cionn 0,1, is é throttle iomlán 0,95 agus os a chionn.

| Tomhas | Riail |
|---|---|
| **pointe coscánaithe** | an chéad choscán faoina dtáinig an throttle as (faoi 0,5), nó a mhair **15 m** - ní bhíonn blaosc den chos chlé le cumhacht ar siúl mar thús an choscáin; le blaoscanna amháin, an chéad bhlaosc |
| **scaoilte** | gan coscán, an chéad phointe a chuaigh an throttle faoi 0,8 |
| (gan pedail) | an pointe ina dtosaíonn an lap ag moilliú (thuas) |
| **scaoileadh coscáin** | an coscán deireanach suas le 30 m tar éis an phointe is moille |
| **luas ag an bpointe coscánaithe**, **méadair coscánaithe** | go dtí an pointe is moille |
| **coscán is airde**, **díghéarú is airde** | thar an gcrios coscánaithe (luasghéarúcháin os cionn 45 m/s² neamhaird orthu) |
| **coscánú iarráin** | méadair le coscán > 0,05 agus |stiúir| > 0,1 |
| **sleamhnú glais** | an cóimheas sleamhnaithe roth is diúltaí sa chrios (nuair a bhíonn sleamhnú ag an lap) |
| **pointe is moille**, **íosluas** | mar thuas |
| **throttle ar** | tar éis an scaoilte (nó an phointe is moille), an chéad throttle > 0,15 gan coscán |
| **throttle iomlán** | an chéad phointe ina dhiaidh sin a choinnigh ≥ 0,95 ar feadh 10 m |
| **rith saor** | méadair ón scaoileadh go throttle-ar le coscán agus throttle araon faoi 0,05 |
| **titim throttle** | uaireanta a thit an throttle níos mó ná 0,25 faoina ard reatha idir throttle-ar agus throttle iomlán |
| **luasghéarú cliathánach is airde** | an luasghéarú cliathánach is mó ó 20 m roimh an scaoileadh go dtí an níos déanaí de throttle iomlán agus 20 m tar éis an phointe is moille |
| **gear ag an mbuaic** | ag an bpointe is moille |
| **sleamhnú casta** | an cóimheas sleamhnaithe roth tiomána is mó idir throttle-ar agus throttle iomlán |
| **cothromaíocht** | sleamhnú tosaigh lúide cúil tríd an lár (+ understeer) |
| **stráice ag throttle iomlán** | an sciar den chodán tar éis throttle iomlán (agus rith thar an líne) ag ≥ 0,95; an scaoileadh is faide air |
| **luas scuabtha** | an luas is mó a cailleadh ó phointe ard le throttle ≥ 0,9, gan coscán, ar an talamh |
| **drift iontrála** | an uillinn drift is mó ó phointe an choscáin go 5 m tar éis an phointe is moille, ar an talamh |
| **coscán láimhe** | cá ndeachaigh sé ar siúl (> 0,2), suas le 10 m tar éis an phointe is moille |
| **aer** | soicindí san aer thar an gcodán, agus a eitilt is faide |

## Cé leis a gcuirtear gach lap i gcomparáid {#who-each-lap-is-compared-with}

- Cuirtear lap i gcomparáid leis an **lap iomlán is tapúla dá rang feidhmíochta féin** (an tagairt, i rang na tagartha).
- Cuirtear an lap is fearr den rang féin (agus an tagairt) i gcomparáid, codán ar chodán, leis **pé lap eile dá rang a bhí is tapúla** tríd - nó le gach lap, nuair atá sé ina aonar ina rang.

Leanann léarscáil ama, na difríochtaí sa liosta lap, imeachtaí rialaithe carr agus an tábla cúinní an chomparáid chéanna.

## Cuntas ama cúinne {#the-time-account-of-a-corner}

`compareCorner`, do lap i gcoinne an lap eile thar chodán:

- **glan** = `rel(deireadh) - rel(tosach)` (plus rith thar an líne ar lap eitilte): an breith. Níos gaire ná **0,03 s** is **cothrom** é.
- **An scoilt** - cá istigh sa chúinne a chas an lámh-thosaigh: sa stráice ó chéad phointe coscánaithe nó ó phointe is moille dhá lap, go dtí an níos déanaí dá bpointí lán-throttle agus is moille, an luaineachán is mó a thug an lap ar ais nó a bhuaigh ar ais ansin, nuair a bhíonn an luaineachán sin os cionn **0,04 s**; murab ea, an níos déanaí de dhá phointe is moille.
- **Go dtí an buaic** = `rel(scoilt) - rel(tosach)`; **tar éis di** = glan lúide sin. Nuair a bhíonn an dá cheann ar a laghad 0,04 s agus comharthaí contrártha acu, **thrádáil** an lap ceann amháin ar an gceann eile.
- Scoilteann **tar éis di** arís nuair a bhíonn an dá lap cothrom go lán-throttle: an **slí amach** (scoilt go dtí lán-throttle níos déanaí) agus an **stráice** (ón áit sin go dtí deireadh).
- Scoilteann **an stráice** ina trí chuid:
  - *luas slí amach* (`byExit`) - tomhaiste, ní mhodhnaithe: téann an carr is moille trí luas tosaigh an chairr is tapúla beagán síos an stráice, agus as sin is é a rian féin an rud a dhéanfadh sé ón luas sin, lena ghiaráil, drag agus fána féin ann. Aistrithe ar ais go dtí an pointe sin (agus rith air ag a luas deiridh ar feadh na méadar a ghnóthaíonn sé) is é a am ón tosach níos tapúla; is é an difríocht costas luas na slí amach. Nuair nach sroicheann an carr is moille an luas sin riamh (nó ach sna 2 shampla dheireanacha), cuirtear a luasghéarú féin ar feadh an stráice ar ais mar chumhacht (`a·v` coinnithe), ní níos crua riamh ná mar a thaispeánann a imchlúdach ag an luas sin (dhá huaire an luasghéarú tomhaiste gan imchlúdach).
  - *tarraingt na gcarranna* (`byPower`) - sa charr difriúil amháin: an dá charr ón luas céanna thar na méadair chéanna, ag lán-throttle, ag suimiú an luasghéarúcháin lán-throttle a thaispeáin gach ceann ag gach luas.
  - *conas a tiománadh é* (`driven`) - an chuid eile: scaoileadh, luas scuabtha ag lán-throttle.

  Ní mhíníonn luas na slí amach níos mó ná costas an stráice riamh (agus ní leis an gcomhartha contrártha riamh), mura ndearna scaoileadh nó luas scuabtha cuid díobh a aisghabháil. Tá lap **scaoilte** ar an stráice nuair a bhíonn a chuid ag lán-throttle faoi 0,9 araon agus faoi chuid an ceann eile lúide 0,05. Áiríonn luas scuabtha nuair a dhifríonn an bheirt níos mó ná 1 m/s. Socraítear mí-aontú faoi 0,02 s sa chomhartha go 0.

Suimíonn glan gach codán leis an difríocht am lap, agus suimíonn go-dtí-an-bhuaic agus tar-éis-í gach cúinne go dtí a ghlan (dearbhaíonn na tástálacha an dá cheann).

### Scair an chairr {#the-cars-share}

Ach amháin nuair a bhíonn na laps i **gcarranna difriúla** agus chaill an lap am (`carShare`):

- **tarraingt**: tarraingt na gcarranna síos an stráice (thuas), suas go dtí an caillteanas;
- **greim**: nuair a bhí an lap ag teorainn a chairr (luasghéarú cliathánach sa lár ar a laghad **90%** den mhéid a choinníonn a charr ag an luas sin) agus go gcoinníonn an carr eile **5%** níos mó: den íosluas níos ísle nach míníonn gha níos teannaí, an sciar `½ ln(greim_eile / greim_liom) / ln(v_eile / v_liom)` den chaillteanas atá fágtha;
- **coscáin**: nuair a choscann an lap (nach scaoil), coscann an carr eile **5%** níos crua, agus bhí díghéarú *meánach* an lap thar an gcrios ar a laghad **80%** den mhéid is féidir lena charr: ó `u` síos go `v` ag `a1` i gcoinne `a2`, ag críochnú ag an bpointe céanna, `(1/a1 - 1/a2)(u - v)² / 2u`, suas go dtí an méid atá fágtha.

Is é costas an chairr an suim, ar a mhéad an caillteanas.

## An breith agus an tátal {#the-verdict-and-the-finding}

Scríobhann `cornerFinding` ar a mhéad tátal amháin do gach lap agus cúinne, agus iarrtar iad san ord seo:

| Cás | Tátal | Toradh |
|---|---|---|
| glan laistigh de ±0,03 s, trádáil, taobh is lú ≥ **0,1 s** | **cothrom, dhá bhealach tríd** - cé a bhí mall isteach agus tapa amach, agus an bealach eile thar a chéile; le stráice ina dhiaidh (ar stráice, nó idir dhá cheann), is é an bealach mall isteach-tapa amach an ceann le tógáil air: coinnigh a throttle luath, gnóthaigh an iontráil ar ais le coscán níos crua, ní níos déanaí | cothrom |
| glan laistigh de ±0,03 s ar shlí eile | ní deirtear aon rud | - |
| gnóthaithe, trádáil, caillte go dtí an bhuaic | **mall isteach, tapa amach d'íoc**: coinnigh é, anseo is mó an slí amach luach | gnóthachan |
| gnóthaithe, trádáil, gnóthaithe go dtí an bhuaic | **níos tapúla ar an mbealach isteach**: tá an iontráil ceart, throttle iomlán níos luaithe choinneodh níos mó | gnóthachan |
| gnóthaithe, agus tá caillteanas ag an lap eile anseo | **níos tapúla - mar gheall ar an rud a rinne an ceann eile**, a chúis agus a leid a dúirt "Don lap eile: …" | gnóthachan |
| gnóthaithe ar shlí eile | **níos tapúla ar an mbealach isteach / amach**, de réir an leath a ghnóthaigh níos mó (coscánú níos déanaí, luas níos mó tríd an lár; nó scaoileadh níos luaithe, tarraingt níos láidre) | gnóthachan |
| caillte, agus **buille nó timpiste** a chosain ar a laghad `max(0,05 s, 40% den chaillteanas)` | is é an tionchar scéal na cúinne, roimh na carranna | caillteanas |
| caillte, agus tá **sciar an chairr** 60% nó níos mó | **an carr**: a tharraingt síos an stráice, a ghreim tríd an lár, nó a choscáin - an codán is mó; le cuid an tiománaí (≥ 0,03 s) ráite mar "An X s eile: …" | caillteanas |
| caillte, agus chosain **fabht rialaithe carr** neamh-roinnte ar a laghad `max(0,05 s, 40%)` | an fabht sin (féach thíos), le conas a bhog an t-am timpeall air | caillteanas |
| caillte, agus chosain **eitilt níos faide** ar a laghad `max(0,05 s, 40%)` | an eitilt | caillteanas |
| caillte, trádáil, gnóthaithe go dtí an bhuaic | **ró-thapa isteach, mall amach**: cúis an slí amach; tabhair suas roinnt iontrála chun casadh agus a bheith cothrom níos luaithe, leis na pointí coscáin agus throttle iomlán den lap eile. A fhréamh (`cause`, a áirítear sna [staitisticí](race-course-statistics.md)): coscánú níos déanaí, nuair a choscann sé níos mó ná cúpla méadar níos déanaí ná an ceann eile; cúis an tslí amach murab ea | caillteanas |
| caillte, trádáil, caillte go dtí an bhuaic | **thug sé níos mó ar shiúl ag dul isteach ná mar a bhuaigh an slí amach ar ais**: cúis na hiontráile, a is fréamh freisin (`cause`); coinnigh an slí amach, caill níos lú ag dul isteach | caillteanas |
| caillte, scaoilte ar an stráice, agus an chuid tiomáinte os cionn leath an chaillteanais | **gan throttle iomlán ar an stráice**: a sciar de throttle iomlán i gcoinne an ceann eile, cá háit agus cé chomh fada is a bhí an scaoileadh | caillteanas |
| caillte, tarraingt na gcarranna os cionn 60% den chaillteanas agus an stráice os cionn leath | **tarraingt an chairr síos an stráice** (le tarraingt an dá charr ag 160 km/h) | caillteanas |
| caillte ar shlí eile | cúis an leath a chaill níos mó (go dtí an bhuaic ≥ ina dhiaidh: an iontráil; murab ea, an slí amach). Níos moille amach toisc níos moille tríd an lár amháin (níos mó ná 1 m/s): cúis an lár ina ionad sin | caillteanas |

Féadfaidh tátal ar chaillteanas críochnú le **Freisin:** - luas scuabtha ag lán-throttle, nó scaoileadh ar an stráice - nuair a chosain cuid tiomáinte an stráice níos mó ná 0,04 s agus nach raibh sé sin mar chúis cheana.

Cuirtear tátail in ord, caillteanais ar dtús, an costasaí ar dtús; ansin gnóthachain agus cúinní cothroma.

### Cúiseanna ar an mbealach isteach {#causes-on-the-way-in}

`entryCause`, an chéad cheann a bhfuil feidhm aige (is i m/s na difríochtaí íosluais; is é "5 m" an tairseach a chomhaireann pointe níos luaithe/níos déanaí):

| # | Cúis (botún) | Riail |
|---|---|---|
| 1 | buille nó timpiste ar an mbealach isteach | tionchar neamh-roinnte a thosaíonn faoi 10 m tar éis an phointe is moille |
| 2 | **beagnach stoptha** (eachtra) | luas is moille faoi **60%** den mhéid a cheadaíonn greim an chairr seo ag an áit ar chuaigh an ceann eile tríd (`v_eile · √(greim_liom / greim_eile)` nuair a bhíonn greim níos mó ag an gcarr eile, murab ea luas an eile), an lap eile os cionn 8 m/s - casadh, teagmháil nó cúinne caillte |
| 3 | fabhta rialaithe carr ar an mbealach isteach | glasáil, brú, casadh, nó sciorradh neamh-roinnte nach bhfuil ar an throttle, a thosaíonn faoi 10 m tar éis an phointe is moille, costas ≥ 0,02 s |
| 4 | eitilt níos faide roimh an bpointe is moille | féach [ralaí](#rally-rotation-and-flights) |
| 5 | **scaoilte** nuair a d'fhan an ceann eile lán-throttle nó scaoil sé 5 m nó níos déanaí | níor scaoil an lap seo ach |
| 6 | **coscán nuair nár scaoil an ceann eile ach** nó d'fhan lán-throttle | agus bhí sé níos moille ná 0,5 m/s tríd an lár |
| 7 | **coscán go bog** | choscann sé (nach scaoil), bhí seomra aige coscán a dhéanamh níos crua - le sonraí taoir, a sleamhnú glasála faoi **60%** den sleamhnú nuair a thugann coscáin an charr seo a mbuaic; gan iad, díghéarú is airde faoi **85%** den mhéid a thaispeánann sé ag an luas sin - an pedal faoi 0,95, agus díghéarú is airde an lap eile níos airde ná **15%** |
| 8 | **coscán go luath** - nó **coscáin an chairr** | coscann sé níos mó ná 5 m roimh an gceann eile. I gcarr eile a bhfuil a choscáin níos láidre ná 5%, agus gan níos mó ná 10 m le spáráil i gcoinne an achair a theastaíonn ón gcarr seo ag a dhíghéarú féin: coscáin an chairr. Murab ea, coscán go luath, le "Coscán níos déanaí - timpeall N m" (i gcarr eile, na méadair thar a dteastaíonn uaidh) |
| 9 | **rith saor** | níos mó ná 10 m gan pedal ar bith, agus 5 m níos mó ná an ceann eile |
| 10 | **níos moille tríd an lár** | níos mó ná 0,5 m/s níos moille ag an bpointe is moille; scoilte de réir `v² = a·R` (thíos) |
| 11 | **tháinig níos moille** | os cionn 1 m/s níos moille ag pointe an choscáin, gan coscánú go luath: cinnte roimhe - ag an gcúinne roimhe agus tarraingt an chairr, nó ag eitilt sa chúinne roimhe a bhí 0,2 s níos faide. Is carr é nuair a bhíonn na carranna difriúil |
| 12 | níos moille go dtí an bhuaic | murab ea: scaoil an coscán níos réidhe agus roth níos mó luais isteach sa lár |

**Níos moille tríd an lár** (`middleSplit`): tomhaistear gha gach laps ag a phointe is moille óna chonair féin (±8 m), a luasghéarú cliathánach mar `v²/R`, agus

`ln(v_eile / v_liom) = ½ ln(a_eile / a_liom) + ½ ln(R_eile / R_liom)`.

- Míníonn an gha **leath nó níos mó**: **líne ró-theann** - "úsáid níos mó den bhóthar", le dhá gha agus an sciar.
- Ag teorainn an chairr (ag sleamhnú thar 10° drift ar tarmac / 20° ar scaoilte, nó luasghéarú cliathánach 90% nó níos mó den mhéid a choinníonn sé ag an luas sin) agus go ngreamaíonn an carr eile níos mó ná 5%: **greim an chairr**; cosain an slí amach ina ionad.
- Ag sleamhnú tríd (drift thar 10° / 20°) agus níor rinne an lap eile (a drift iontrála 4° nó níos lú): **ar an taobh** - thar a ghreim, ní gearr air; tar éis tuirlingt beagán níos moille. Deirtear é mar an carr nuair a ghabhann an cúl an carr seo níos mó ná uair amháin sa lap níos mó ná an ceann eile.
- I gcarr eile a choinníonn faoi **96%** de ghreim an eile, agus an lap a iompraíonn laistigh de 1 m/s de `v_eile · √(greim_liom / greim_eile)`: **greim an chairr** - "ní dhúnfaidh coscánú níos déanaí an bhearna sin".
- Murab ea **greim le spáráil**: luasghéarú cliathánach i gcoinne an eile ar gha cosúil leis, agus an greim atá ag an gcarr seo; iompair níos mó luais go dtí an bhuaic. Nuair a scaoileann cúl an chairr seo sula n-úsáidtear a ghreim go hiomlán (tosaíonn a sciorradh faoi 85% dá ghreim, agus bhí an lap ag 80% de sin), faigh an chuid eile i gcéimeanna beaga.

### Cúiseanna ar an mbealach amach {#causes-on-the-way-out}

`exitCause`, an chéad cheann a bhfuil feidhm aige:

| # | Cúis (botún) | Riail |
|---|---|---|
| 1 | fabhta rialaithe carr ar an mbealach amach | casadh roth, spin, sciorradh nó tionchar neamh-roinnte a chríochnaíonn ag nó tar éis 10 m roimh an bpointe is moille |
| 2 | **luas scuabtha** | níos mó ná 1 m/s níos mó luais caillte ag lán-throttle ná an ceann eile; os cionn **7 m/s (25 km/h)** "is cosúla le teagmháil nó spin ná sciorradh" |
| 3 | **chas sé an carr mícheart** (talamh scaoilte) | féach [ralaí](#rally-rotation-and-flights) |
| 4 | **ar an gcumhacht níos déanaí** | throttle-ar níos mó ná 5 m níos déanaí, a áireamh ó phointe is moille gach laps féin freisin (ní cháintear lap a bhfuil a phointe is moille níos déanaí as throttle níos déanaí) |
| 5 | **mhothaigh sé ar an throttle** | níos mó titimí throttle ná an ceann eile |
| 6 | **rith leathan agus d'fhan sé** | níos mó ná 1,5 m taobh amuigh den cheann eile nuair a bhí an dá cheann cothrom, agus throttle iomlán níos mó ná 5 m níos déanaí óna phointe is moille féin |
| 7 | **throttle iomlán níos déanaí** | throttle iomlán níos mó ná 5 m níos déanaí, ó a phointe is moille féin freisin; leis luasghéarú an chairr ansin |
| 8 | **tiomáint an chairr** | i gcarr eile a tharraingíonn faoi 95% den eile ag an luas sin, agus mhínigh an tarraingt cuid den stráice |
| 9 | **níos moille as an gcúinne** | murab ea: buaic níos déanaí, mar sin bíonn an carr díreach níos luaithe |

Nuair a bhí na laps i gearanna difriúla ag an bpointe is moille, críochnaíonn an leid "Gear N ag an mbuaic; d'úsáid an ceann eile M."

### Fabhtanna rialaithe carr agus tionchair {#car-control-faults-and-impacts}

Fabht de [Imeachtaí rialaithe carr](race-control-events.md) mar chúis: is cúis *coscánaithe* glasáil, is cúis *slí amach* sleamhnú roth nó sciorradh ar an throttle, agus is cúis *iontráil* an chuid eile; is cúis *slí amach* tionchar tar éis an phointe is moille, agus *iontráil* roimhe. Is é an leid ag an imeacht féin, agus ansin "Chosain sé timpeall X s faoi 40 m tar éis dó" (nó "faoin am a fuair an carr a luas ar ais" le haghaidh tionchair). Cuireann glasáil le pointe coscáin níos luaithe ná 5 m ná an ceann eile leis go gcoscann an lap go luath freisin - le rothaí ag casadh ní bheadh sé ag teastáil uaidh.

### Ralaí: casadh agus eitiltí {#rally-rotation-and-flights}

Ar **talamh scaoilte**, le huillinní drift ar an dá lap, agus an lap seo ar an gcumhacht (nó lán-throttle) níos mó ná 5 m níos déanaí:

- **Chas sé an carr níos lú**: bhí an carr casta ag an ceann eile **12°** nó níos mó ag a phointe is moille agus **8°** nó níos mó ní ba mhó ná an lap seo. Leid: scaoileadh nó duirling den choscán cos clé agus an carr ag casadh isteach, leis an bpointe coscáin láimhe an lap eile nuair a d'úsáid sé ceann amháin, nó an coscán láimhe i gcúinne níos moille ná 15 m/s (54 km/h).
- **Chas sé thar a bhfuil ann**: bhí an lap seo casta ag 12° nó níos mó agus ní ba mhó ná **12°** ná an ceann eile: b'éigean é a dhíreachadh sula bhféadfaí an chumhacht a ísliú.

**Eitilt níos faide**: san aer 0,2 s nó níos mó níos faide ná an ceann eile, agus costas 0,03 s ar a laghad ó 10 m roimh an éirí go 40 m tar éis an tuirlingthe (nó deireadh an chodáin). Roimh an bpointe is moille is cúis iontrála é; éiríonn sé scéal na cúinne nuair a mhíníonn sé 40% nó níos mó. An leid: coinnigh an throttle ar siúl ag an éirí, tóg an bárr beagán níos moille nó le duirling den choscán.

### An tosach {#the-start}

Roimh an gcéad chúinne, ar sprint nó nuair a thosaigh lap ar bith ó stad (faoi 5 m/s nuair atá an dá cheann ar dtús ar an ais) nó ag tosach rása (faoi 60% de luas an eile), is tátal féin é an rith go dtí an chéad phointe coscánaithe (cúinne 0) nuair a dhifríonn sé níos mó ná 0,03 s: *An seoladh*, *Tosach an rása* nó *Go dtí an chéad chúinne*. Cuirtear caillteanas ansin ar an staid (*comhthéacs*) nuair a thosaigh lap amháin ag tosach rása agus an ceann eile ar luas, ar an gcarr nuair a bhíonn na laps i gcarranna difriúla, agus ar an tiománaí murab ea. Leideanna: i gcarr eile ó stad, "cuid mhór den charr"; tosach stad sa charr céanna, seol le níos lú casadh roth agus athraigh ag barr an bhanda cumhachta; tosach rása, déan é a chur i gcomparáid le céad lap eile; tosach ag luas, tugtar an slí amach níos fearr ón gcúinne deireanach thar an líne.

## An líne tiomáinte {#the-driven-line}

`lineMetrics`, do gach lap agus codán (ní le haghaidh coimpléisc mheasctha), ó na suímh amháin (réidh ±2 sampla) thar fhuinneog na cúinne:

| Tomhas | Riail |
|---|---|
| lúbthacht | athrú treo thar ±8 m de chonair an laps féin |
| **gha is teannaí** | 1 / lúbthacht an bhuaic |
| **casadh isteach** / **imeacht amach** | nuair a sháraíonn an lúbthacht cúigiú dá buaic den chéad uair / den deireanach |
| **lár** | an pointe ina ndearna an lap leath den athrú treo |
| gha isteach / amach | méadair a tiomáineadh thar leath an athraithe treo, roimh / tar éis an láir |
| **cruth** | gha is teannaí thar an meán-gha agus é ag casadh: faoi **0,55** is **V** é, os cionn **0,75** is **U** é, idir an dá cheann "U/V" |
| **buaic** | gha amach thar gha isteach: os cionn **1,25** déanach, faoi **0,8** luath, murab ea lár |
| **buaic luais** | an pointe is moille níos mó ná **15 m** roimh an lár: mall isteach, tapa amach; níos mó ná 15 m ina dhiaidh: fós ag moilliú thar an lár |

I gcoinne an lap eile: cé chomh fada istigh (+) nó amuigh a rith sé ag casadh isteach, tríd an gcuid is teannaí agus áit a raibh an dá cheann cothrom (a deirtear ó 1 m); áit a gcasann gach ceann isteach (a deirtear ó 8 m).

### Cén líne a oireann don charr seo anseo {#which-line-suits-this-car-here}

`lineFor`, ó cad a leanann an chúinne isteach ann agus carachtar an chairr ag an gcúinne seo:

- **cumhacht-go-greim** = luasghéarú lán-throttle an chairr ag luas na slí amach thar a ghreim ag an íosluas (ó a imchlúdach). **Point and shoot** ag **0,45** nó níos mó; **móiminteam** ag **0,25** nó níos ísle.
- **tiomáint síos**: greim ag 151-252 km/h thar greim ag 54-108 km/h de **1,15** nó níos mó, do chúinne a glacadh ag **144 km/h** (40 m/s) nó níos tapúla - ansin is cúinne móiminteam é is cuma leis an gcumhacht. Ní mheastar ar thalamh scaoilte é.

| Cineál cúinne | Carr | Líne |
|---|---|---|
| i ndiaidh stráice | point and shoot / eile | V / U, buaic sa lár: "is é an crios coscánaithe an duais" |
| idir dhá stráice | móiminteam / eile | U / V, buaic dhéanach |
| nasc | móiminteam / eile | U / V, buaic sa lár: "tiomáin é le haghaidh slí amach na chéad cheann eile" |
| ar stráice | móiminteam (nó cúinne tapa tiomána síos) | U leathan timpeall, buaic beagán déanach |
| ar stráice | point and shoot | V: coscán díreach, casadh isteach déanach, rothlú i lár gearr teann, díreach go luath |
| eatarthu | idir an dá cheann | U le buaic dhéanach: mall isteach, tapa amach |

Nuair a bhíonn an slí amach tábhachtach (ar stráice, idir dhá cheann) cuireann an tiomáint abairt leis: **FWD** - rothlaigh ar na coscáin, cuir cumhacht leis ach amháin de réir mar a scaoileann an roth; **RWD** le cumhacht-go-greim de 0,35 nó níos mó - dírigh é sula dtagann throttle iomlán; **AWD** - is féidir leis cumhacht a ghlacadh fós agus é ag casadh. Ar thalamh scaoilte cuireann gach líne leis: cas an carr ar an mbealach isteach.

Deir an abairt ansin cad a thiomáin an lap, agus an bhfuil sé oiriúnach: *is moille déanach ceanglaíonn an slí amach* nó *ceanglaíonn buaic luath an slí amach* nuair a theastaigh buaic dhéanach agus nár bhuail an lap buaic dhéanach ná nach raibh sé is moille go luath; *níos cruinne ná mar a theastaíonn ón gcarr seo* nuair a theastaigh V; *níos cearnaí ná mar a theastaíonn ón gcarr seo* nuair a theastaigh U; murab ea, *tá sin oiriúnach*.

## Do fhorbróirí {#for-developers}

Cód: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
An réasúnaíocht agus a foinsí: [an modh](race-analytics.md).
