---
title: "Anailís rása"
nav_order: 14
has_children: true
lang: "ga"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# Anailís rása

Thiomáin an rian céanna faoi dhó. Seinneann cluaisín **Anailís rása** an dá thiomáint le chéile sa 3D, taispeánann sé cá raibh cuairt amháin níos moille agus insíonn sé duit cén fáth. Gan cuairteanna fós? Brúigh **Cuairteanna samplacha**.

![Cluaisín Anailís rása le cuairteanna samplacha: an barra taoibh le Cuairteanna agus Cá háit le feabhsú, na gluaisteáin ar an gcúrsa, na cairteacha faoin radharc](../assets/img/ga/race-analysis-overview.webp)

Déanann an cluaisín cuairteanna dhá cheann nó níos mó de chúrsa amháin a chur i gcomparáid. Roinneann sé an canbhás, an ceamara agus múnla an chúrsa lódáilte (**Cúlra / leibhéal**) leis an léarscáil teasa; is leis féin gach rud eile: a bharra taoibh féin agus a bharra féin faoin radharc. Tá téarmaí mar *cuairt*, *tagartha* agus *barr an chúinne* sa [ghluais](glossary.md).

Is léarscáil den chluaisín é an leathanach seo. Tá leathanach dá chuid féin ag gach cuid:

| Leathanach | Cad a chlúdaíonn sé |
|---|---|
| [Cuairteanna a lódáil](race-loading-laps.md) | gach formáid comhaid, fillteáin agus cúrsaí, ainmneacha gluaisteán, cuairteanna samplacha, liosta na gcuairteanna, an tagartha agus an fócas |
| [Athsheinm agus an radharc 3D](race-replay-and-scene.md) | an barra iompair, na trí mhód athsheinm, na carranna a ailíniú, ceamara an tóraithe, línte, léarscáileanna, gluaisteáin, lipéid, domhan scáthaithe |
| [Cairteacha agus an HUD](race-charts-and-hud.md) | na cairteacha fad, roghnóir an ghraif, hover agus zúmáil, cártaí na ngluaisteán, an tábla cainéal |
| [Imeachtaí rialaithe gluaisteáin](race-control-events.md) | glasáil rothaí, sleamhnú rothaí, ró-stiúradh, spins, faoi-stiúradh, buailte, timpistí, ABS/TC, láimhbhrú, aer - conas a bhrathaítear gach ceann, le gach tairseach |
| [Anailís cúinne ar chúinne](race-corner-analysis.md) | ailíniú de réir achair, cúinní agus deighiltí, cuntas ama cúinne, gach cúis agus an t-ordú a dtriailtear iad ann, cruth na líne agus an comhairle |
| [Próifílí carr agus comparáid](race-car-profiles.md) | cad is féidir le gach carr, tomhaiste as a chuairteanna; *Carranna i gcomparáid*; cad a chinneann an carr i ngach cúinne |
| [Staitisticí an chúrsa](race-course-statistics.md) | go leor cuairteanna de chúrsa amháin: botúin in aghaidh gach cúinne agus de réir cineáil, an léarscáil botún, easpórtáil na léarscála teasa, teorainneacha feidhmíochta |
| [Anailís rásaí: an modh](race-analytics.md) | an taighde taobh thiar de na rialacha, le foinsí |
| [Cluichí rásaíochta eile](other-games.md) | cad a dhéanann an t-amharcóir le cuairteanna ó gach cluiche: sleamhnú agus drift a oibrítear amach nuair nach seolann cluiche iad, domhan scáthaithe, na cainéil bhreise |

## An scáileán {#the-screen}

**Barra taoibh**, ó bharr go bun (is féidir na codanna a fhálú):

1. **Cuairteanna** - lódáil, liosta, taispeáin/folaigh, tagartha, fócas, tóir.
   Féach [Cuairteanna a lódáil](race-loading-laps.md).
2. **Staitisticí an chúrsa** - ó thrí chuairt lódáilte amháin.
   Féach [Staitisticí an chúrsa](race-course-statistics.md).
3. **Cá háit le feabhsú** - torthaí na cuairte fócasaithe, cúinne ar chúinne.
   Féach [Anailís cúinne ar chúinne](race-corner-analysis.md).
4. **Cúinne ar chúinne** (nó *Cúinne ar chúinne - aicme X* le roinnt aicmí) - an chuairt is tapúla trí gach cúinne agus a líne. Taispeántar le dhá chuairt nó níos mó.
5. **Smacht ar an gcarr** - glasálacha, sleamhnáin, brúcháin agus buailte na cuairte fócasaithe.
   Féach [Imeachtaí rialaithe gluaisteáin](race-control-events.md).
6. **Carranna i gcomparáid** (nó **An carr** le carr amháin) - féach [Próifílí carr agus comparáid](race-car-profiles.md).
7. **Amharc** - cén léarscáil a phéinteáiltear ar an rian agus cad a tharraingítear.
   Féach [Athsheinm agus an radharc 3D](race-replay-and-scene.md).
8. Painéil roinnte **Leibhéal** agus **Ceamara agus radharc** (múnla an chúrsa, inbhéartú aiseanna, ceamara) - doiciméadaithe leis an léarscáil teasa agus leis an [Ceamara](camera.md).

**Tá an radharc** ag taispeáint an chúrsa, na línte tiománta, an léarscáil, na gluaisteáin, lipéid ceangailte leis an rian, agus suas le sé chárta gluaisteán ar bharr ar chlé (féach [Cairteacha agus an HUD](race-charts-and-hud.md)). Gan cuairteanna lódáilte deir sé "Níl aon chuaird lódáilte - Scaoil dhá chomhad cuairte nó níos mó anseo, nó lódáil na cuairteanna samplacha ón mbarra taoibh."

**Tá an barra faoin radharc** ag coinneáil iompar an athsheinm agus, mura bhfolaítear é, na cairteacha fad.

## Tús tapa {#quick-start}

1. Oscail cluaisín **Anailís rása** (taobh le **Léarscáil teasa** ag barr an bharra taoibh).
2. Faigh cuairteanna isteach. Brúigh **Cuairteanna samplacha** chun a fheiceáil cad a dhéanann an cluaisín le trí chuairt shamplach. Le haghaidh do chuairteanna féin, taifead iad ar dtús ([formáidí comhad agus taifeadtóirí](race-loading-laps.md#file-formats)), ansin brúigh **Lódáil comhaid chuairte…** nó **Fillteán…**, nó scaoil comhaid nó fillteáin ar an radharc.
3. Is í an chuairt iomlán is tapúla an tagartha; is í an chuairt eile is moille an fócas. Cliceáil ar aon chuairt sa liosta chun í a fhócasú; ★ déanann cuairt an tagartha.
4. Léigh **Cá háit le feabhsú**. Cliceáil ar thorthaí: cuirtear na gluaisteáin ar aon líne 40 m roimhe, frámaítear é leis an gceamara, seinntear an athsheinm tríd, agus osclaíonn na tomhaiseanna.
5. Leag an luch ar na cairteacha chun gach carr a bhogadh chuig an méadar sin; Shift+cliceáil chun iad a líniú ansin.

## Méarchlár {#keyboard}

Fad a bhíonn cluaisín na Rásaíochta oscailte:

| Eochair | Déanann sé |
|---|---|
| **K** | seinn / stop an athsheinm |
| **Home** | ar ais go tús an athsheinm |
| eochracha digit | rud ar bith (sa léarscáil teasa athraíonn siad modhanna) |

Déantar neamhaird ar eochracha clóscríofa i réimse téacs nó i liosta anuas. Oibríonn eochracha an cheamara mar atá sa léarscáil teasa (**W A S D**, **Spás** suas, **Q** síos, **Shift** níos tapúla, **Alt** níos moille, an luch chun féachaint; go léir sa [Ceamara](camera.md)); frámaíonn **F** na cuairteanna lódáilte (mar a dhéanann lódáil cuairteanna).

## Go leor cuairteanna {#many-laps}

- Déantar gach cuairt lódáilte a anailísiú agus a chomhaireamh; cuireann dosaen nó dhó cúpla soicind isteach.
- Thar **8** cuairt (`SHOW_ALL_UP_TO`), ní tharraingítear cuairteanna breise ach nuair is iad an tagartha, an chuairt fhócasaithe, nó an chuairt is fearr de aicme na cuairte fócasaithe. Athraíonn *Taispeáin iad uile* / *Na cinn a bhfuiltear ag féachaint orthu amháin* é.
- Thar **10** gluaisteán infheicthe (`PLAIN_PAST`), tarraingítear na cuairteanna nach bhfuil á bhféachaint (ní an fócas, ní an carr á thóraíocht, ní an tagartha) le líní tanaithe go pointe gach 6 m in ionad 1.5 m, agus gluaisteáin shimplí.
- Tarraingíonn na cairteacha 8 gcuairt ar a mhéad; taispeánann an HUD 6 chárta ar a mhéad.
- Taispeánann staitisticí an chúrsa ó **3** chuairt ar aghaidh.

Sonraí: [Staitisticí an chúrsa](race-course-statistics.md#performance-with-many-laps).

## Réamhshocruithe an radhairc {#default-view-settings}

| Socrú | Réamhshocrú |
|---|---|
| Léarscáil | Léarscáil ama |
| Línte tiománta, Gluaisteáin, Rothaí agus fionraí, Lipéid, Rian ó na cuairteanna | ar siúl |
| Gach luach ar na cártaí | as |
| Méid an ghluaisteáin | 1× |
| Cairteacha | taispeánta |
| Mód athsheinm | Ón líne |
| Luas athsheinm | 1× |
| Lúb | ar siúl |

Ní shábháiltear aon cheann díobh; athshocraíonn athlódáil iad. Cuimhnítear sa bhrabhsálaí: an teanga, agus ainmneacha na ngluaisteán a foghlaimíodh ó chomhaid chuairte (féach [Cuairteanna a lódáil](race-loading-laps.md#car-names)).

## Do fhorbróirí {#for-developers}

### Cad a tharlaíonn nuair a lódáiltear cuairteanna {#what-happens-when-laps-are-loaded}

Gach uair a athraíonn tacar na gcuairteanna, an tagartha nó an teanga, déantar an anailís ar fad arís (`analyse` i [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Cuirtear cainéil díorthaithe le gach cuairt san áit nach seolann an cluiche iad: uillinn drift, sleamhnú rothaí ó luasanna rothaí, san aer, talamh scaoilte, luas casaidh ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Roghnaítear an tagartha agus déantar gach cuairt a thionscadal ar a cosán agus a athsamplú gach 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Oibrítear amach ón gcuairt an bhfuil domhan an chluiche le hiompú ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Aimsítear cúinní ar an tagartha, agus grúpáiltear ina ndeighiltí ó chrios coscadh amháin go dtí an chéad cheann eile ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Do gach carr: a chlúdach (greim, coscadh, tarraingt de réir luais), a phróifíl, a cuar rothaí ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Do gach cuairt agus deighilt: cad a rinne sé (pointe coscadh, pointe is moille, lánsmacht, ...) agus an líne a tiomáineadh ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Do gach cuairt: a imeachtaí rialaithe gluaisteáin, gach ceann acu curtha i gcomparáid leis an gcuairt is gaire ansin.
8. Do gach cuairt agus deighilt: cuntas ama i gcoinne a chuairte comparáide agus an torthaí i bhfocail.
9. An léarscáil ama agus an léarscáil chúise do gach cuairt.

Déantar na téacsanna sa teanga reatha; athrú teanga reáchtálann an anailís arís (agus athainmníonn sé na cuairteanna samplacha). Taispeántar teip san anailís mar earráid faoi chnaipí **Cuairteanna** agus fanann na cuairteanna lódáilte.

### Comhaid fhoinse {#source-files}

| Comhad | Ról |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | comhaid chuairte a léamh |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | cineál na cuairte, ainmniú, cuairteanna samplacha |
| `src/race/derive.ts`, `handedness.ts` | cainéil díorthaithe, domhan scáthaithe |
| `src/race/align.ts`, `segments.ts`, `line.ts` | ais achair, cúinní, línte |
| `src/race/analysis.ts` | cúinní curtha i gcomparáid, cúiseanna, torthaí |
| `src/race/envelope.ts`, `profile.ts` | cad is féidir le carr a dhéanamh |
| `src/race/control.ts`, `impacts.ts` | smacht carr, buailte agus timpistí |
| `src/race/stats.ts` | go leor cuairteanna |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | athsheinm agus tarraingt |
| `src/race/schema.ts`, `graphs.ts` | tábla na gcainéal, sraitheanna na gcairteacha |
| `src/ui/race/*` | an barra taoibh, na cairteacha, an HUD, na lipéid |
| `src/state/raceStore.ts` | staid an chluaisín agus clog an athsheinm |
