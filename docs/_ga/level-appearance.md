---
title: "Cuma an leibhéil"
parent: "Leibhéil agus geoiméadracht chúlra"
nav_order: 3
lang: "ga"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---


# Cuma an leibhéil

Athraíonn na rialuithe seo an chaoi a bhfeictear leibhéal 3D, ionas go seasann an teas amach uaidh agus gur féidir leat an áit a léamh fós. Ní athraíonn aon rud anseo na sonraí.

## Tús tapa {#quick-start}

1. Luchtaigh leibhéal 3D ([Leibhéil 3D](model-levels.md)).
2. Faoi **Cúlra / leibhéal**, ísligh **Gile** go dtí go mbíonn an teas an rud is gile ar an scáileán.
3. Oscail **Dealbhú na talún** agus ardaigh **Scáthú fánaí** nó **Neart na gcomhrianta** go dtí go n-aithneoidh tú cnoc ó ghleann.
4. Oscail **Struchtúir**. Ísligh **Teimhneacht na n-aghaidheanna** chun taobh istigh d'fhoirgnimh a fheiceáil, nó cas **Uigeacht na struchtúr** air chun iad a fheiceáil soladach.
5. Má tá pictiúr péinteáilte ar an talamh, bain triail as **Uigeacht na talún** a chasadh as agus air.

![Alt Dealbhú na talún agus Struchtúir ar oscailte, leis an leibhéal taispeánta le leideanna dealbhaithe](../assets/img/en/level-appearance-sections.webp)

Nuair a bhíonn [leibhéal 3D](model-levels.md) luchtaithe, taispeánann painéal an Chúlra / leibhéil na rialuithe seo. Is iad na réamhshocruithe iad a fhaigheann leibhéal nua-allmhairithe ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ní athtarraingíonn athrú orthu ach an radharc; coinnítear carnadh an teasa.

## An leibhéal iomlán {#the-whole-level}

| Rialú | Réamhshocrú | Raon | Brí |
|---|---|---|---|
| **Teimhneacht** | 100% | 0-100% | Faoi 100% déantar an leibhéal a mheascadh agus ní scríobhann sé doimhneacht, mar sin ní [folaíonn sé](depth-and-culling.md) an teas a thuilleadh. |
| **Gile** | 0.9 | 0-2 (jog 64) | |

Tarraingítear an leibhéal díshaturated - talamh liath, blaosc tintithe - ionas gurb é an teas an t-aon rud sáithithe ar an scáileán. In éagmais [íomhá léarscáile](map-images.md), níl sleamhnán Díshaturaithe ag leibhéal 3D.

## Dealbhú na talún {#ground-relief}

Ó i bhfad i gcéin is mar an gcéanna liath a fheictear cnoc agus gleann, mar sin cuireann an t-amharcóir trí leid leis. Freagraíonn gach ceann acu teip dhifriúil:

| Rialú | Réamhshocrú | Brí |
|---|---|---|
| **Spás idir comhrianta** | ó raon airde na talún | Airde idir línte comhrianta, logartamach ó 1/4000 go 1/2 de raon airde an leibhéil; is é bun an rian *as*. Is é an réamhshocrú 1/40 de raon airde na talún cruinnithe go céim 1/2/5 - is oiriúnach línte 10 m do thaobh cnoic agus is gan úsáid iad ar urlár cairéil. Tarraingítear gach 5ú líne níos láidre. Tarraingítear comhrianta sa spás scáileáin, mar sin fanann siad picteilín amháin ar leithead ag aon zúmáil, agus is iad an t-aon leid a mhaireann ar thalamh atá ró-éadrom le scáthú ar chor ar bith. |
| **Neart na gcomhrianta** | 35% | 0-100% |
| **Scáthú fánaí** | 55% | Dorchaíonn de réir géaire, ionas go léitear bruacha agus aillte ó aon uillinn ceamara - murab ionann agus solas, a dhíscaoileann nuair a bhíonn tú ina threo. |
| **Grádán airde** | 50% | Talamh íseal dorcha, talamh ard níos gile, ar fud raon airde na talún: cruth an scála mhóir. |

Taispeánann ceanntásc na roinne staid na gcomhrianta: *gach N m*, spás na gcomhrianta, nó *gan comhrianta* nuair a bhíonn an spás as.

## Dromchla na talún {#ground-surface}

| Rialú | Réamhshocrú | Taispeántar nuair | Brí |
|---|---|---|---|
| **Uisce** | air | tá uisce sa leibhéal | Lochanna, aibhneacha agus an fharraige, tarraingthe réidh i nglas gorm bán: ní bhaineann aon leid tíre le dromchla atá réidh de réir sainmhínithe. |
| **Teimhneacht an uisce** | 60% | Tá an t-uisce air | Feictear an cósta agus an talamh faoi na sraithe éadroma tríd an uisce trédhearcach. |
| **Triantáin na talún** | 30% (0 do leibhéal le huigeacht) | i gcónaí | Imill an tír-raoin féin tarraingthe thar an dromchla scáthaithe, ag dul i léig idir 6% agus 25% de leithead an leibhéil ón gceamara. Taispeánann sé cé chomh garbh agus a samplaíodh an talamh agus tugann sé rud éigin do fhána chun achar a mheas air. Tógtar ar an gcéad úsáid é, rud a thógann nóiméad ar leibhéal mór. |
| **Talamh mar shreangfhráma amháin** | as | i gcónaí | Cuireann an dromchla tír-raoin in ionad a imill. Léaráid iomlán é - caitheann sé an scáthú, na comhrianta agus an folú freisin, mar sin is é *Triantáin na talún* an rogha is fearr de ghnáth. |
| **Uigeacht na talún** | air | tá uigeachtaí sa leibhéal | Tarraingíonn sé an talamh sna huigeachtaí a iompraíonn an comhad (asfalt, imeall, féar). Cuirtear soilsiú an mhaisc orthu go bog, mar tá a dhealbhú mín féin ag an uigeacht cheana féin. Is é **Gile** an bealach chun é a chiúnú faoin teas; baineann an Díshaturú le híomhánna léarscáile. |
| **Dath gafa** | as | tá dathanna veirtéacs sa leibhéal | Scáthaíonn sé an talamh leis an dath a ghabh scanadh in ionad liath - murab ea, níl bóthar atáirgthe idirdhealaithe ón imeall. Níl aon dath ar onnmhairithe innill; nuair nach bhfuil, deir an painéal *Níl dath ar an leibhéal seo.* |

## Struchtúir {#structures}

Taispeánann ceanntásc na **Struchtúir** líon na dtriantán struchtúr; insíonn an leid thíos conas a tharraingítear iad (*tarraingthe soladach ina n-uigeachtaí féin* nó *tarraingthe mar bhlaosc trédhearcach ionas gur féidir an teas taobh istigh díobh a fheiceáil*) agus cé mhéad páirt atá ina struchtúir.

| Rialú | Réamhshocrú | Brí |
|---|---|---|
| **Uigeacht na struchtúr** | air nuair a bhíonn uigeachtaí ar na struchtúir | Tarraingigh struchtúir soladach, ina n-uigeachtaí féin. Ag cas air socraítear teimhneacht na n-aghaidheanna go 100% agus cuirtear na himill as; ag cas as filltear ar an mblaosc tintithe trédhearcach ag 25%. Soilsítear struchtúr uigeachta ón taobh a fheiceann an ceamara, mar is dhá aghaidh cúl le cúl é comhartha agus is ar rounding a bhraitheann cé a bhuann an tástáil doimhneachta. |
| **Imill sreangfhráma** | air; as os cionn 300,000 triantán struchtúr nó nuair a bhíonn uigeacht air | Imill dhúblaithe na struchtúr, líne amháin in aghaidh na himill. |
| **Teimhneacht na n-imeall** | 50% | |
| **Aghaidheanna an bhlaoisc** | air | Dromchla éadrom le himeall geal Fresnel, ionas go léitear foirgneamh mar thoirt in ionad cage nó bruach ceo. |
| **Teimhneacht na n-aghaidheanna** | 25% (35% os cionn 300,000 triantán struchtúr, 100% le huigeacht) | 0-60% ar an rian, suas go 100% leis an handle. Coinnigh íseal é: folaíonn struchtúir soladacha na sonraí istigh iontu. |
| **Imill ghéara** | air (as nuair a bhíonn uigeacht air) | Scáthaíonn sé gach triantán lena normal féin, ríomhtha sa fragment shader ó dhíorthaigh an spáis scáileáin. Tá leibhéil onnmhairithe welded agus iompraíonn siad normail mheánacha, rud a thiontaíonn gach cúinne bosca ina "foil leáite"; dá scoilfí gach veirtéacs chun é a shocrú, mhéadódh sé maolán na veirtéacsanna. Cas as é le haghaidh leibhéil a bhfuil dromchlaí cuartha níos tábhachtaí ann ná a gcúinní. |
| **Imir na struchtúr** | Cian | Roghnóir dathanna agus na réamhshocruithe **Cian**, **Ómrach**, **Corcairghorm**, **Bán**. |
| **Taispeáin aicmiú na bpáirteanna (N)** | | Gach páirt, a aicme agus an chúis; féach [Leibhéil 3D](model-levels.md#ground-structures-and-water). |

## Leibhéal a ghearradh {#cutting-the-level}

Gearrann an [Stiall](slice.md) agus, le *Gearr an leibhéal freisin*, [baint de réir faid](depth-and-culling.md#distance-culling) an talamh, na struchtúir agus an t-uisce ag na plánaí céanna leis an teas.
