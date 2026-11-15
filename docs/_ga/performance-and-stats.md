---
title: "Painéal feidhmíochta agus staitisticí"
parent: "Inmheánacha rindreála"
nav_order: 7
lang: "ga"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Painéal feidhmíochta agus taispeántas staitisticí

Taispeánann an bosca barr ar dheis an amhairc cé chomh crua is atá an léirsitheoir ag obair: cé mhéad fráma sa soicind, cé mhéad ponc a tharraingíonn sé, agus an bhfuil sé fós ag mionchoigeartú an phictiúir. Ligeann painéal **Feidhmíocht** duit cáilíocht an phictiúir a mhalartú ar luas.

## Taispeántas staitisticí {#the-stats-overlay}

An bosca ag barr ar dheis an amhairc sna cluaisíní Teasmhapa agus Cluiche ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Léann sé léamh beo an innill ar gach fráma beochana.

![An taispeántas staitisticí ar radharc na mórmheaitseálacha, le glaonna uimhrithe: 1 Cúlchóras, 2 FPS, 3 Fráma, 4 Rónna san fhuinneog, 5 Sprideanna / fráma, 6 Buiséad, 7 Taifeach teasa, 8 Clúdach](../assets/img/en/performance-stats-overlay.webp)

| Líne | Brí |
|---|---|
| **Cúlchóras** | *WebGPU* nó *WebGL2*. Cuir an luch air chun an chúis nár úsáideadh WebGPU a fháil, nuair nár úsáideadh é. Féach [An dá chúltaca](backends.md). |
| **FPS** | Fráma sa soicind, meánaithe thar 0.4 s ar a laghad. |
| **Fráma** | Am an fhráma i ms, réidhithe (90% an seanmheán, 10% an nua). Is é an t-am idir frámaí é, ní am GPU - ní thomhaistear am GPU in aghaidh an phas. |
| **Rónna san fhuinneog** | Iarrthóirí sraitheanna: na sraitheanna sa fhuinneog ama reatha, sula scagtar iad de réir sraithe sa bhlaosc. |
| **Sprideanna / fráma** | Na spriotaí a chuir plean an fhráma dheireanaigh isteach (coinnithe ar an bhfigiúr pleanáilte ar fhrámaí díomhaoine, nach dtarraingíonn aon rud). |
| **Buiséad** | An buiséad spriote a pleanáladh an fráma seo leis - luach an rialaitheora oiriúnaigh, ardaithe go gach iarrthóir nuair a tharraingítear gach sraith. |
| **Taifeach teasa** | Rezolúiniú mhaolán an teasa mar sciar den canbhás: socrú *Taifeach teasa* iolraithe faoin scála oiriúnach an dara céime. |
| **Clúdach** | Cé chomh fada agus atá an carnadh forleathan tar éis dul i dtreo gach sraith a úsáid: céatadán agus é ag comhthiomsú (ómra), *beacht* nuair atá sé críochnaithe. Ní mheastar fráma torann riamh mar an pictiúr críochnaithe. |
| **Ciúbanna** | Boscaí tarraingthe i [athsheinm bosca](box-replay.md). |
| **Ní sa chuimhne** | Ní thaispeántar ach nuair nach raibh na sraitheanna laistigh de bhuiséad GPU: cé mhéad. Féach [Cónaí cuimhne GPU](gpu-memory.md). |

## An taispeán luais {#the-speed-display}

Ag bun ar dheis an amhairc, sa phroiseacht amháin: luas eitilte agus an t-am chun na sonraí a thrasnú ag an luas sin. Tarraing é chun an luas a athrú. Féach [Ceamara](camera.md#fly-speed).

## Má tá an léirsitheoir mall {#if-the-viewer-is-slow}

Féach ar an taispeántas staitisticí, agus ansin:

1. **Rónna san fhuinneog i bhfad níos mó ná Sprideanna / fráma, Clúdach faoi 100%** - ní féidir leis an bhfráma gach rud a tharraingt; comhthiomsaíonn sé thar roinnt frámaí nuair a bhíonn an t-amharc socair. Cúng an fhuinneog, scag, nó bain chun iarrthóirí a laghdú; nó glac leis an samplú.
2. **Sprideanna / fráma cothrom le Rónna san fhuinneog, an fráma fós mall** - is in aghaidh an spriote ar an scáileán an costas: laghdaigh an *Radius picteilíní uasta* ([Cruth spriote](sprite-shape.md#pixel-clamps)) nó an *Taifeach teasa*.
3. **Mall le sraitheanna beaga** - is dócha an leibhéal: líon mór struchtúr le imill ar, triantáin talún, doimhneacht fócais. Féach [Cuma an leibhéil](level-appearance.md).
4. **Gach rud mall, agus meirge dearg** - rindreáil bogearraí ([Brath rindreála bogearraí](software-rendering.md)).

## Painéal na Feidhmíochta {#the-performance-panel}

| Rialaithe | Réamhshocrú | Éifeacht |
|---|---|---|
| Leid | | Spláitéálann gach fráma fo-thacar randamach de na sraitheanna infheicthe, stratáilte, le meáchan scálaithe chun cúiteamh, ionas go bhfuil an teas ionchais beacht ag aon bhuiséad; má choinnítear an t-amharc socair leanann an fráma le cumasc go dtí go mbíonn gach sraith tar éis cur leis. |
| **Tarraing gach sraith i ngach fráma** | air | Tarraingíonn gach fráma a thosaíonn meastachán nua gach sraith iarrthóra (suas le thart ar 268M); déantar an buiséad thíos urlár. [Samplú agus buiséid](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Buiséad oiriúnach** | air | Coigeartaíonn sé spriotaí in aghaidh an fhráma, ansin rezolúiniú an teasa, chun an sprioc-ráta fráma a choinneáil - agus stopann sé de ghearradh nuair nach gcabhraíonn an gearradh. [Samplú agus buiséid](sampling-and-budgets.md#the-adaptive-budget) |
| **Sprioc-FPS** | 60 | 20-240 (1000 leis an láimhseáil). Glactar le luachanna faoi 15 mar 15. |
| **Sprideanna tosaigh / fráma** / **Sprideanna / fráma** | 4.00M | 65,536-268,435,456, logartamach. Ainmnithe *Tosaigh* nuair a bhíonn an oiriúnach air, mar go bogann an rialaitheoir é. |
| **Taifeach teasa** | 100% | 25-100%. Méadaíonn costas píosa leis an gcearnóg: 50% ceathrúnaigh an obair measctha, agus tá an réimse teasa chomh réidh nach léiríonn sé é. |
| **Mionchoigeartú forásach** | air | Carnann sé thar fhrámaí nuair a bhíonn an t-amharc socair. Múchta taispeánann sé an meastachán aonfhráma gach fráma. [Carnadh](accumulation.md) |
| **Buiséid acmhainní** | brathta | Buiséid RAM, GPU agus snáithe parsála. [Cuimhne agus buiséid](memory-and-budgets.md#resource-budgets) |

Ní shábháiltear aon cheann de na nithe seo; cuireann athlódáil na réamhshocruithe ar ais.
