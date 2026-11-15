---
title: "Teas foirne"
parent: "Modhanna teasa"
nav_order: 6
lang: "ga"
source: "team-heat.md"
source_hash: "e30b8372464b"
translated: true
outdated: false
---

# Teas foirne

Taispeánann teas foirne áit a raibh gach foireann, gach foireann ina dath féin. San áit a bhforlapann foirne measctar na dathanna.

Is é **Teas foirne** (eochair 3) páirc an dlúis de [Teas](heat.md) le dath aonair ar gach [grúpa](glossary.md). San áit a bhforlapann grúpaí measctar a ndathanna; tagann comhrac comhionann amach neodrach. Iompraíonn teimhneacht an dlús go díreach mar a dhéanann sna modhanna eile, ionas go bhfreagraíonn an pictiúr *cé mhéad* agus *cé leis* ag an am céanna. Teastaíonn colún grúpa uaidh.

![Teas foirne: gach taobh ina dhath féin; san áit a bhforlapann siad measctar na dathanna](../assets/img/en/heat-teams.webp)

Ní hé an [forleagan figiúr](box-replay.md) é: tarraingíonn sin figiúr amháin do gach imreoir; is páirc teasa é seo dathaithe ag an gcolún céanna.

## Conas é a úsáid {#how-to-use-it}

1. Brúigh `3` (nó roghnaigh **Teas foirne** sa bharra na modhanna).
2. Oscail **Dathanna teasa**. Taispeánann na swatches dath gach grúpa; leag an luch ar swatch chun ainm na foirne a fheiceáil.
3. Má dhealraíonn gach rud liath, ardaigh **Scaradh dathanna**.
4. Bain tic de ghrúpa sa [Liosta foirne](teams-list.md) chun é a bhaint as; fanann dathanna eile mar a bhí siad.

## Rialuithe {#controls}

Sa chuid **Dathanna teasa**:

| Rialú | Réamhshocrú | Ciall |
|---|---|---|
| Swatches | | Dath gach grúpa, do na chéad 12 grúpa, ansin *+N eile*. Leag an luch orthu don ainm grúpa agus don dath. |
| **Scaradh dathanna** | 1.4 | Cé chomh fada is a bhrúitear measctha ón neodrach, 0-4. Déanann 0 gach rud liath; is é 1 an meán fíor; thar thart ar 2 imíonn na measctha is gile as raon an taispeána agus teorannaítear iad de réir cainéil, rud a athraíonn a dhath. |
| **Grádán teimhneachta (tagann an dath ón ngrúpa)** | an grádán teasa réamhshocraithe | Ní úsáidtear ach **alfa** an ghrádáin anseo: trédhearcach san áit nach bhfuil rud ar bith, neamhtrédhearcach ag an mbarr. Déantar neamhaird ar a dhathanna. |

Oibríonn na rialuithe teasa eile go léir - cruth, sáithiú, freagairt, teas íosta, doimhneacht, baint - mar atá sa [Teas](heat.md).

Taispeánann an [Liosta foirne](teams-list.md) dath teas foirne gach grúpa mar a swatch sa mhód seo. Fágann folach grúpa dathanna gach grúpa eile san áit a raibh siad: tagann dathanna ó líon iomlán na ngrúpaí, ní ó cad atá casta air, ionas go mbeidh an dá phictiúr comparáide.

## An pailéad {#the-palette}

Ó [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Tá dathanna ar an bplána datha **Oklab** ar sholas seasta (0.7) agus ar chroma seasta (0.115), ionas go bhfuil gach grúpa chomh geal céanna agus nach léann grúpa dearg mar is teo ná grúpa gorm.
- Le *n* grúpa, roinntear ciorcal na dathanna ina *n* cuid chomhionanna, agus glacann grúpa *i* **lár** a chuid, `(i + 0.5) / n` de chasadh. Tá dhá ghrúpa ar bith chomh scartha is a cheadaíonn an líon, agus fanann contrártha contrártha pé líon atá ann.
- Úsáidtear **16** dath dhifriúla ar a mhéid. Le níos mó grúpaí, cuirtear aitheantais trí leathadh arís agus arís eile (aitheantais bit-reversed: 0, ½, ¼, ¾, ⅛, …) ionas nach roinneann aitheantais comharsanacha dath; roinneann grúpaí thar 16 dath go riachtanach.
- Tarraingítear grúpa a bhfuil a lipéad ag ciallaigh "gan grúpa" - `0`, folamh, `none`, `unknown`, `null` nó `-1`, gan aird ar chás - mar **liath neodrach** in ionad sliseanna den chiorcal a ghlacadh. Ní dhéantar ach an chéad lipéad den sórt sin ar liosta na ngrúpaí a láimhseáil mar seo.

Is é 1.4 an scaradh réamhshocraithe seachas 1 mar, ag 1, is *liath* measctha de chúig dhath scaoilte go cothrom: ceart agus do-léite. Coinníonn beagán os cionn 1 na ceangail macánta agus déanann sé roinn 60/40 infheicthe.

## Conas a oibríonn sé {#how-it-works}

Tá ceithre chainéal ag an spriocphointe teasa sa mhód seo. Cuireann gach sprid a dhlús *v* leis an gcéad chainéal agus *v* × comhordanáidí Oklab *a* agus *b* an ghrúpa leis an dara agus leis an tríú. Ag am an chomhdhéanta is é measc an phicteilín ná an meán meáchanaithe ag dlús: *a* = G / R, *b* = B / R, scálaithe ag an scaradh dathanna agus tiontaithe go sRGB ag solas an phailéid. Coinníonn roinnt ar an dlús carnaithe an dath neamhspleách ar an méid sonraí atá ann, agus sin é an fáth go leanann gach rialú dlúis ag gníomhú ar an teimhneacht amháin.

Costaíonn an spriocphointe ceithre chainéal ceathair oiread cuimhne GPU agus an spriocphointe teasa aon chainéal amháin ag an taifeadadh céanna.
