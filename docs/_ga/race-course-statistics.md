---
title: "Staitisticí cúrsa"
parent: "Anailís rása"
nav_order: 57
lang: "ga"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Staitisticí an chúrsa

Luchtaigh go leor cuairteanna de chúrsa amháin, agus comhaireamhann an radharc na botúin: cén cúinne a chosnaíonn an méid ama is mó, cé mhéad cuaird a chuaigh amú ann, agus cén fáth. Úsáid é chun an chúinne is fiú cleachtadh a aimsiú.

Bain triail as: tugann **Cuairteanna samplacha** trí chuaird, a leor chun go dtaispeánfar an chuid seo.

![Staitisticí an chúrsa leis an léarscáil botún: an rian péinteáilte de réir cé mhéad cuaird a chaill ama i ngach cúinne, agus liosta na gcúinní](../assets/img/en/race-course-mistake-map.webp)

Luchtaigh fillteán iomlán cúrsa - dosaen cuairteanna, go leor carranna, roinnt ranganna feidhmíochta - agus déantar breithiúnas ar gach cuaird, agus ansin comhaireamh. Clúdaíonn an leathanach seo an chomparáid de réir ranga, cad a chuntar mar bhotún, rannóg **Staitisticí an chúrsa**, an léarscáil botún, an onnmhairiú léarscála teasa, cúrsaí ó roinnt rianta, agus teorainneacha feidhmíochta le go leor cuairteanna.

## In aghaidh an fhearr dá rang féin {#against-the-best-of-its-own-class}

Déantar cuaird a chur i gcomparáid cúinne ar chúinne leis an **gcuaird iomlán is tapúla dá rang feidhmíochta féin** (an tagarmharc, sa rang atá aige); an cuaird féin leis an duine ba thapúla dá rang tríd gach cúinne, nó le gach cuaird nuair is ina haonar atá sí sa rang. Déantar carranna a ghrúpáil de réir rang feidhmíochta an chluiche (i Forza, D suas go X; is iad C agus S2 dhá cheann acu). Ní insíonn pointe coscartha carr C-rang i gcomparáid le carr S2 faic faoin tiomáint. Leanann an léarscáil ama, na bearnaí sa liosta cuairteanna agus an tábla *Cúinne ar chúinne* an chomparáid chéanna (féach [cé leis a chuirtear comparáid ar gach cuaird](race-corner-analysis.md#who-each-lap-is-compared-with)).

Tógtar na staitisticí ar anailís gach cuaird, ní taobh le taobh léi.

## Cad a chuntar mar bhotún {#what-counts-as-a-mistake}

Is **tarlú** botún cuaird amháin i gcúinne amháin (cuid). Is iad botúin cuaird cuairte i gcúinne:

1. **An chúis tiomána** a fuarthas san anailís dá chaill sí ansin - toradh caillte, a chuirtear leis an tiománaí (ní leis an gcarr nó leis an staid), a chosnaíonn **0.05 s** nó níos mó i gcomparáid lena cuaird chomparáide. Is é a costas caillteanas na cúinne.
2. **Gach earráid rialaithe carr** a rinne sí ansin nach ndearna an chuaird eile (gan roinnt), a chosnaíonn **0.03 s** nó níos mó - glas, sciorradh rothair, cúl ag sciorradh amach, brú, casadh. Is é costas an tarlaithe féin.
3. **Gach bualadh agus taisme**, roinnte nó nach roinnte, is cuma cé mhéad a chosnaíonn.

Is féidir go leor a bheith i gcúinne amháin; comhaireofar gach cineál **uair amháin in aghaidh na cuaird agus na cúinne**. Ní botúin iad gnóthachain, sciar an chairr, agus teacht níos moille a cinneadh sa chúinne roimhe sin.

### Ó thorthaí go botúin {#from-findings-to-mistakes}

| Toradh | Botún |
|---|---|
| ró-thapa isteach, mall amach, coscadh cúpla méadar níos déanaí ná an ceann eile | Coscánú ródhéanach |
| coscadh go luath | Coscánú róluath |
| coscadh go bog | Coscánú róbhog |
| glas roth mar chúis | Roth glasáilte |
| sheol gan brú | Rith saor |
| greim le spáráil, níos moille go dtí an barr, coscadh nuair nach raibh ag an gceann eile ach an cos a scaoileadh | Rómhall tríd an lár |
| líne ró-chúng | Líne róchúng |
| brú leathan | Brú amach |
| chas an carr níos lú / ró-fhada | Casadh mícheart ar an gcarr |
| ar an gcumhacht níos déanaí, lánluasaire níos déanaí, d'fhan | Déanach ar an luasaire |
| níos moille amach as an gcúinne | Níos moille amach |
| sciorradh rothair | Rothchasadh |
| an cúl sciorr amach, ar taobh tríd an lár | D'éalaigh an cúl |
| rith leathan | Leathan amach |
| luas scuabtha | Luas caillte |
| scaoil (ar an mbealach isteach, nó ar an stráice) | Cos ardaithe |
| stad beagnach, casadh, bualadh nó taisme mar chúis | Casadh timpeall, Buaileadh rud éigin nó Tuairt nuair a deir imeachtaí na cuaird ansin cé acu (taisme ar dtús, ansin casadh, ansin bualadh); seachas sin Beagnach stoptha |
| eitilt níos faide | Eitilt rófhada |

Déantar an dá phatrún a chomhaireamh mar an chúis a fuarthas laistigh díobh, leis an tábla céanna. Is botún a chúise iontrála é *Thug níos mó ar shiúl ag dul isteach ná mar a fuair an t-imeacht ar ais*: coscadh luath is *Coscánú róluath*, glas is *Roth glasáilte*, rith saor is *Rith saor*, greim gan úsáid is *Rómhall tríd an lár*. Is é *Ró-thapa isteach, mall amach* *Coscánú ródhéanach* nuair a bhraith an chuaird níos déanaí ná an ceann eile; seachas sin botún a chúise amach - *Déanach ar an luasaire*, *Rothchasadh*, *D'éalaigh an cúl*, *Leathan amach*, *Níos moille amach*. Ní chuntar patrún a bhfuil a chúis ag an gcarr, nó teacht níos moille.

Ní chuntar: teacht níos moille, an tosach, gach torthaí *carr* (tarraingt, greim, coscáin, tiomáint) agus gach gnóthachan nó cúinne cothrom.

### Na cineálacha, san ord acu {#the-kinds-in-their-order}

Coscadh: *Coscánú ródhéanach*, *Coscánú róluath*, *Coscánú róbhog*, *Roth glasáilte*. Iontráil: *Rith saor*, *Rómhall tríd an lár*, *Líne róchúng*, *Brú amach*, *Casadh mícheart ar an gcarr*. Amach: *Déanach ar an luasaire*, *Níos moille amach*, *Rothchasadh*, *D'éalaigh an cúl*, *Leathan amach*, *Luas caillte*. Ar an stráice: *Cos ardaithe*. Eachtraí: *Casadh timpeall*, *Buaileadh rud éigin*, *Tuairt*, *Beagnach stoptha*, *Eitilt rófhada*.

## Rannóg Staitisticí an chúrsa {#the-course-statistics-section}

Taispeántar ó **3** cuaird suas, idir **Cuairteanna** agus **Cá háit le feabhsú**.

- **An achoimre**: "40 cuaird in 9 gcarr, 3 rang: gach cúinne breithiúnaithe ó chúinne go cúinne i gcoinne na cuaird is tapúla dá rang féin." (carranna comhaireamh de réir uimhir an chairr, nó ainm).
- **Míreanna ranga** (le roinnt ranganna): **Gach rud** agus mír amháin do gach rang, gach ceann lena líon cuaird, in ord an chluiche (D, C, B, A, S1, S2, R, X, agus ansin cinn eile). Cliceáil rang le haghaidh a chuairteanna amháin; cliceáil **Shift+cliceáil** chun ceann a chur leis nó a bhaint. Leanann gach rud thíos - na liostaí, an léarscáil, an onnmhairiú léarscála teasa - na ranganna roghnaithe.
- **Cad is minice a théann amú**: gach cineál botúin, na cuairteanna is mó ar dtús (ansin an méid is mó uaireanta, ansin an costas is mó), ar a mhéad 8 (**Gach N cineál** taispeánann an chuid eile, **Níos lú** cuireann i bhfolach arís iad). Gach líne: a hainm, "N as M cuaird", barra den sciar sin, agus "K uair · thart ar X s · is mó i T3 (5), T7 (4), T1 (2)" - cé chomh minic a rinneadh é (cuaird de réir cúinne), cad a chosain sé ina iomlán, agus an trí chúinne ina ndearna an chuid is mó cuairteanna é. **Cliceáil líne** chun é a thaispeáint ar an léarscáil botún (agus an léarscáil a chasadh air); cliceáil arís le haghaidh gach botúin.
- **Cúinne ar chúinne** (nó *Cúinne ar chúinne - <botún>* le ceann roghnaithe): de réir rannáin, "N as M chaill am · X s" - cuairteanna a thiomáin an chúinne ar fad, iad siúd a chaill **0.05 s** nó níos mó ann i gcomparáid leis an rang is fearr, agus an t-am ar fad a chaill siad. Nuair a dhúntar é, liostaítear a thrí botún is coitianta lena líon cuaird. **Cliceáil cúinne** chun é a oscailt, a fhrámú leis an gceamara agus an léarscáil botún a athrú: do gach botún (nó an ceann roghnaithe amháin) líne mar "12 as 40 cuaird a choisc luath anseo. I 9 gcarr éagsúla - thart ar 0.21 s an ceann." agus na cuairteanna a rinne é, **is measa ar dtús**, gach ceann lena chostas - ar a mhéad 8, "+N eile" don chuid eile. **Cliceáil cuaird** chun díriú uirthi agus an botún sin a athsheinm (ailínithe 40 m roimhe).
- **Taispeáin sa léarscáil teasa**: féach thíos. "Ag tógáil na léarscála teasa…" le linn a reáchtála; díchumasaithe nuair nach bhfuil aon bhotúin ann.

## An léarscáil botún {#the-mistake-map}

**Radharc → Léarscáil botún** péinteálann sé ar an mbealach tagartha cé mhéad de na cuairteanna (de na ranganna roghnaithe) a rinne botún ag gach méadar - gach cineál, nó an ceann roghnaithe sna staitisticí. Comhaireofar gach cuaird uair amháin in aghaidh an mhéadair; leathnaítear raon gach tarlaithe (cá raibh a chúis nó a imeacht) 6 m ar gach taobh ionas go n-infheicfear ceann gearr. Níos leithne agus níos gile san áit a raibh níos mó cuairteanna: leithead `3 + 10 · (cuairteanna anseo / cuairteanna is mó in aon áit)` méadar, dath ó dhonn lag go horáiste geal; stiall liath 2 m nuair nach raibh aon cheann ann. Míniú: *cuairteanna beaga ↔ cuairteanna is mó*.

Nuair a bhíonn **Lipéid** ar siúl, iompraíonn barr gach cúinne a botún is coitianta: "T3 · 12/40 coscadh luath" (cuairteanna a rinne é / cuairteanna a thiomáin an chúinne), "T3 · 12/40" nuair a roghnaítear cineál amháin, "T3 · glan" nuair nach bhfuil aon cheann. Liostaíonn lipéad ar a ndéanann tú fochoiste an chúinne a chaill sé agus a cúig botún is coitianta; cliceáil air chun an chúinne sin a oscailt nó a dhúnadh sna staitisticí.

## Taispeáin sa léarscáil teasa {#show-in-the-heatmap}

**Taispeáin sa léarscáil teasa** tugann an rud céanna do chluaisín na léarscála teasa mar thacar sonraí dar teideal "Botúin ar <rian>" (nó "Botúin ar an gcúrsa"), ionas go n-oibríonn uirlisí iomlána na léarscála teasa - modhanna teasa, scagairí, an amlíne, an sliseadh - ar an áit a dtéann cuairteanna amú.

Is CSV é a thógtar sa chuimhne (`mistakeTable`), líne amháin do gach pointe greille (gach 2 m) de gach tarlú, ag **suíomh féin na cuaird** ansin:

| Colún | Ábhar |
|---|---|
| `x`, `y`, `z` | suíomh na cuaird ag an méadar sin (comhordanáidí an chluiche) |
| `elapsed` | am na cuaird ansin, s |
| `lap` | lipéad na cuaird |
| `car` | ainm an chairr (nó "car 1234") |
| `mistake` | ainm an bhotúin, sa teanga reatha |
| `car_class` | an rang, `-` nuair nach bhfuil aon cheann |
| `corner` | lipéad na cúinne, `T3` |
| `cost` | costas an tarlaithe, s |

Luchtaítear é tríd an lódálaí féin na léarscála teasa le leideanna mapála: Y suas, gan aiseanna a iompú, scála 1; am `elapsed` sa soicindí; **duine** = `car`, **grúpa** = `mistake`, **seisiún** = `lap`; gan treo amhairc; `car_class`, `corner` agus `cost` coinnithe mar cholúin scagtha. Athraíonn an cluaisín go **Léarscáil teasa** ansin agus frámaíonn na sonraí. Ní onnmhairítear ach na ranganna a roghnaíodh sna staitisticí.

## Cúrsaí ó roinnt rianta {#courses-from-several-tracks}

Déantar cuaird a anailísiú **cúrsa amháin ag an am**. Cuireann fillteán a bhfuil cuairteanna de roinnt cúrsaí ann - leabharlann iomlán na gcuaird - gach cúrsa ar fáil le luchtú ar leith (lena líon cuaird, is mó ar dtús); téann cuairteanna de rithe nár críochnaíodh riamh (`unfinished/` de FH Companion) lena gcúrsa, marcáilte *páirteach*. Cuirtear cuairteanna de roinnt rianta ainmnithe a roghnaíodh mar chomhaid ar fáil ar an gcaoi chéanna, agus téann cuairteanna nach luann rian ar bith leis an gceann a roghnaítear. Má lódálann tú cuairteanna de rian ainmnithe eile seachas na cinn lódáilte, cuirtear ina n-áit iad. Sonraí: [Cuairteanna a lódáil](race-loading-laps.md#folders-and-courses).

## Feidhmíocht le go leor cuairteanna {#performance-with-many-laps}

Déantar dosaen cuaird a anailísiú i soicind nó dhó (gach ceann acu, i gcónaí). Tá an méid a tarraingítear teoranta ionas go gcoinníonn an radharc an fhrámaráta:

| Teorainn | Luach | Éifeacht |
|---|---|---|
| cuairteanna tarraingthe de réir réamhshocraithe | 8 (`SHOW_ALL_UP_TO`) | thar 8 gcuaird lódáilte, bíonn cuairteanna nua i bhfolach mura iad an tagarmharc, an chuaird dhírithe nó an ceann is fearr dá rang iad. **Taispeáin iad uile** tarraingíonn gach cuaird; **Na cinn atá faoi scrúdú amháin** cuireann ar ais é. Díriú ar chuaird ag nochtadh í féin agus ceann is fearr a ranga |
| carranna simplí agus línte tanaí | níos mó ná 10 le feiceáil (`PLAIN_PAST`) | cuairteanna seachas an fócas, an carr a leantar agus an tagarmharc: pointe líne gach 6 m (in ionad 1.5 m), carranna tarraingthe go simplí |
| cuairteanna sa chairt | 8 (`CHART_LAPS`) | an fócas, an ceann is fearr dá rang agus an tagarmharc ar dtús; "+N eile tarraingthe, gan a bheith sa chairt" |
| cártaí HUD | 6 | an chéad sé chuaird le feiceáil |
| staitisticí | ó 3 chuaird | tá an rannóg i bhfolach faoi sin |
| torthaí liostaithe | 12 tiománaí, 8 carr/comhthéacs, 10 gnóthachan | do gach cuaird dhírithe |
| péirí carr le taispeáint | 3 | thar 3 phéire, péire amháin le roghnóir |

Déantar tarlúcháin botún a ríomh uair amháin in aghaidh an anailíse agus stóráiltear iad sa taisce; stóráiltear dlús na léarscála botún de réir roghnú ranga agus botúin.

## Do fhorbróirí {#for-developers}

Cód: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` in [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
