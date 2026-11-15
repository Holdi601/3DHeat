---
title: "Inmheánacha rindreála"
nav_order: 22
has_children: true
lang: "ga"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Inmheánacha rindreála

Tarraingíonn an léirsitheoir na milliúin ponc mar bholgáin lonracha agus cuireann sé ar a chéile iad. Mínítear sa chuid seo na cleasanna a choinníonn é sin tapa, agus cad a chiallaíonn na huimhreacha sa taispeántas staitisticí. Léigh é má mothaíonn an léirsitheoir mall, nó má theastaíonn uait obair a dhéanamh ar an rindreálaí.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

Chun a fheiceáil conas atá do ríomhaire féin ag déanamh, féach ar an mbosca staitisticí barr ar dheis an amhairc: [Painéal feidhmíochta agus taispeántas staitisticí](performance-and-stats.md). Tá focail nua (GPU, sraith, spriote, teasmhapa) sa [ghluais](glossary.md).

## An fhadhb lárnach {#the-core-problem}

Costaíonn suim de rampaí radacha forluiteacha *N* × π*r*² píosaí measctha in aghaidh an fhráma. Ag 100 milliún spriote de radius 8 px is 2 × 10¹⁰ píosa é - tuairim is soicind oibre ar GPU ard-deiridh. Ní féidir é a dhéanamh le fórsa brúidiúil gach fráma, mar sin cuireann an léirsitheoir ar a chéile:

- **sraitheanna sórtáilte de réir ama** - is é fuinneog amlíne dhá chuardach dhéadach, agus leanann costas an athsheinnte na sraitheanna sa fhuinneog, ní an tacar sonraí ar fad;
- **gan aon rud in aghaidh na sraithe ar an PNL in aghaidh an fhráma** - maireann na sraitheanna sa chuimhne GPU, cainníochtaithe; déantar na scagairí, comharthaí grúpaí, an tástáil saoil, an fhuinneog, an baint agus an sliseadh go léir sa veirtéacsshader;
- **samplú stratáithe** le meáchain chúiteacha nuair nach féidir le fráma gach sraith a tharraingt, agus **carnadh forleathan** a thagann le toradh ceart an tsraith uile fad is atá an t-amharc fós ([Samplú agus buiséid](sampling-and-budgets.md), [Carnadh](accumulation.md));
- **smachtaire dhá-ghrád** a mhalartaíonn spriotaí in aghaidh an fhráma, ansin rezolúiniú an teasa, ar son ráta fráma ([Samplú agus buiséid](sampling-and-budgets.md#the-adaptive-budget));
- **buiséid chuimhne fhorfheidhmithe**, ionas go ngearrtar sonraí nach dtagann isteach go soiléir in ionad tuairteála ([Cuimhne GPU](gpu-memory.md)).

## Fráma amháin {#one-frame}

Is é [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts) an lúb fráma. Gach rud a athraíonn ag ráta fráma - an ceamara, an cheannródaí, an buiséad - maireann sé san inneall, ní i stát na feidhmchlár, ionas nach gcosnaíonn fráma aon obair React; léitear an stát uair amháin in aghaidh an fhráma agus scríobhtar ar ais é do léamha ísealmhinicíochta amháin.

1. **Sonraí nua?** Fógraítear tacar sonraí nua (*Uaslódáil N sraith chuig an GPU*) ar fhráma amháin agus uaslódáiltear ar an gcéad fhráma eile, ionas go bpéintéar an teachtaireacht sula mbacann an obair ar an snáithe. Tugtar leibhéal nua don rindreálaí; tógtar nó saortar bealaí teasa líne.
2. **Feidhmíonn an cheannródaí ar aghaidh** (teorannaithe le 0.1 s de am fíor in aghaidh an fhráma), lúbann nó stopann.
3. **Léann an ceamara eochracha, an luch agus an gléas cluiche;** cuirtear scáthán an aiseanna isteach sa mhaitrís amhairc; ar WebGPU athraíonn maitrís athmhapála doimhneachta raon doimhneachta stíl OpenGL three.js go raon WebGPU.
4. **Cad atá infheicthe**: raon ama ón amlíne agus ón stair; tábla comharthaí na ngrúpaí (infheictheacht amháin faoi roinnt de réir colúin); suas le ceithre scagaire - scagairí colúin agus roghnú na nEintiteas; an roinnt difrí.
5. **Athtógtar tablaí dath agus cuair** má athraigh a socruithe.
6. **Buiséad**: socraíonn an rialaitheoir oiriúnach buiséad spriote an fhráma seo agus rezolúiniú an teasa; leis an *Tarraing gach sraith in aghaidh an fhráma* ardaítear an buiséad chun gach sraith iarrthóra a chlúdach.
7. **Sínithe** a chinneann cad a chiallaíonn an maolán carnta go fóill: athrú ar rud ar bith a athraíonn cad a chuireann sraitheanna leis nó conas (*geoiméadracht*), ar an bhfuinneog ama, nó ar conas a dhathaítear an toradh amháin (*comhdhéanamh*). Féach [Carnadh](accumulation.md#what-restarts-it).
8. **Plean samplaithe**: cé de bhlocanna sraitheanna a tharraingítear ([Samplú agus buiséid](sampling-and-budgets.md)).
9. **Mód carnta**: athshocraigh, sín, meán gluaiseach, meán reatha, nó díomhaoin.
10. **Geoiméadracht athsheinnte bosca** (ciúbanna, rianta) ar an PNL, sa mhód sin amháin agus nuair nach bhfuil sé díomhaoin.
11. **Rindreáil**: tarraingíonn an cúlchóras an radharc (leibhéal, eangach, aiseanna, boscaí, rianta, rialóir), spláitéálann an teas isteach sa sprioc teasa, cumascann é leis an gcarnadóir, agus comhdhéanann an teas thar an radharc go dtí an canbhás.
12. **Múchadh uathoibríoch** tosaíonn nuair a shroicheann a chomhaireamh ar ais nialas; léann probe teasa an rialóra picteilín amháin ar a mhéid, ar a laghad gach 120 ms; foilsítear na léamha.

Fráma díomhaoin - comhthiomsaithe, gan athrú ar bith - scipeann sé an radharc agus an spláitéáil ach comhdhéanann sé **arís** fós: ní bhíonn ábhar canbhás WebGL a cruthaíodh gan `preserveDrawingBuffer` sainithe tar éis comhdhéanta, mar sin ní sábháilte a bheith ag brath air an fráma deireanach a choinneáil ar taispeáint. Is iad na spriocanna radharc agus teasa frámbhufair an léirsitheora féin, agus coinníonn siad a n-ábhar, mar sin ní chosnaíonn fráma díomhaoin ach pas lánscáileáin amháin.

## Leathanaigh sa chuid seo {#pages-in-this-section}

- [An dá chúltaca](backends.md) - WebGPU agus WebGL2, conas a roghnaítear ceann, lasca URL
- [Carnadh](accumulation.md) - athshocraigh, sín, meán gluaiseach, meán reatha
- [Samplú agus buiséid](sampling-and-budgets.md) - an samplóir stratáithe, an mód beacht, an buiséad oiriúnach
- [Carnadh leathsnámhphointe](half-float-accumulation.md) - raon agus beachtas ar spriocanna 16-bit
- [Cónaí cuimhne GPU](gpu-memory.md) - stóráil sraitheanna cainníochtaithe agus buiséad GPU forfheidhmithe
- [Brath rindreála bogearraí](software-rendering.md)
- [Painéal feidhmíochta agus taispeántas staitisticí](performance-and-stats.md)
