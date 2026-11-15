---
title: "Gineadóir sintéiseach"
parent: "Sonraí a iontráil"
nav_order: 5
lang: "ga"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Gineadóir sintéiseach

Gan sonraí de do chuid féin? Brúigh cnaipe amháin agus cruthaíonn 3DHeat cath bréagach duit, chomh beag nó chomh mór agus is maith leat.

1. Oscail an painéal **Tacar sonraí** sa bharra taobh Teasmhapa (faoi **Foinse**).
2. Scrollaigh go **Gineadóir sintéiseach**.
3. Socraigh **Rónna (milliúin)**. Bain triail as 1 ar dtús: is trom an réamhshocrú de 8 milliún do thriail thosaigh.
4. Brúigh **Gin**.

![1 milliún ró, 8 fhoireann, tarraingthe i dTeas foirne](../assets/img/en/synthetic-generator-team-heat.webp)

Is féidir leis an bpainéal **Tacar sonraí** tacar sonraí a ghiniúint in ionad ceann a lódáil. Tá sé ar son dhá rud: an léirsitheoir a thriail gan sonraí de do chuid féin, agus seiceáil an bhfuil líon áirithe sraitheanna, ga spriote agus buiséad ag coinneáil ráta fráma inúsáidte ar mheaisín *sula* dtiomnaíonn tú lódáil fhíor mhór dó. Tá a ghluaiseacht cruthaithe mar a bheadh cluiche battle royale - tosaíonn foirne scartha, ansin brúitear le chéile iad - mar go bhfeictear torann aonfhoirmeach go maith ag aon bhuiséad agus folaíonn sé díreach na cuimhsí is fiú a aimsiú.

## Rialaithe {#controls}

| Rialaithe | Réamhshocrú | Brí |
|---|---|---|
| **Rónna (milliúin)** | 8 | Rónna le giniúint. Bainte anuas go líon slán ticeanna do gach imreoir. |
| **Foirne** | 8 | Líon na ngrúpaí (ar a laghad 1). |
| **In aghaidh na foirne** | 12 | Imreoirí in aghaidh an ghrúpa (ar a laghad 1). |
| **Leathfhairsinge na léarscáile (m)** | 4000 | Leath leithead na limistéir ar féidir imirt inti ar X agus Z. |
| Líne mheastacháin | | "≈ X GB de RAM, Y GB ar an GPU tar éis cainníochtaithe." (thart ar 26 beart de RAM agus 8 bheart ar an GPU in aghaidh an tsraith). |
| **Gin** | | Giniúint sa oibrí iontrála, le dul chun cinn, agus cuireann sé in ionad aon tacar sonraí lódáilte. |

Ritheann giniúint sa oibrí cúlra, mar sin ní reoitear an leathanach ag na deicheanna milliún sraitheanna.

## Cad a ghiniúnann sé {#what-it-generates}

Ó [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Colúin:** suíomh, am, duine (`P000`, `P001`, ...), grúpa (`Team 1`, `Team 2`, ...), guairle agus claonadh, agus saolta. Gan colún seisiúin agus gan colúin scagaire.
- **Am:** sampla amháin in aghaidh an imreora gach 0.25 s, ag tosú ag 0 (am coibhneasta, gan cloc fíor).
- **Gluaiseacht:** tosaíonn gach foireann ina earnáil féin de fháinne ag 55-95% den leathfhairsinge. Crapann ciorcal sábháilte atá lárnaithe in aice leis an lár (cuirtear as dó go randamach suas go ceathrú den leathfhairsinge) go 8% den leathfhairsinge in sé chéim le plateau; stiúrann gach imreoir i dtreo pointe ag seachmall laistigh de, le maolú agus torann. Tonnfhoirmíonn an airde idir 0 agus 220 m.
- **Treo féachana:** guairle de réir threo an taistil, claonadh ó luas ingearach.
- **Athdhéanta:** tá síol randamach seasta (1337), mar sin tugann na socruithe céanna na sonraí céanna i gcónaí.

Oibríonn gach mód teasa, athsheinm bosca agus teas líne (rianta iomlána, mar nach bhfuil colún imeachta ann) air. Oibríonn stair an tsaoil freisin.
