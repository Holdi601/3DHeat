---
title: "Doimhne agus baint"
parent: "Modhanna teasa"
nav_order: 4
lang: "ga"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---


# Doimhneacht agus scagadh

Cuireann an doimhneacht ar chnoic agus ar bhallaí an teas taobh thiar díobh, mar a cheilfeadh balla fíor duine. Ní choinníonn baint de réir faid ach an teas idir fad gar agus fad i gcéin ón gceamara.

![Ceamara íseal taobh thiar de chnoc, le Folaigh taobh thiar den tír-raon as (ar chlé) agus air (ar dheis)](../assets/img/en/depth-and-culling-terrain.webp)

![Baint de réir faid le I gcéin ag 400 m agus Gearr an leibhéal freisin ar siúl: stiall den léarscáil thart ar an gceamara](../assets/img/en/depth-and-culling-far.webp)

Gan doimhneacht, is forleagan réidh é léarscáil teasa thar [leibhéal](levels.md) 3D: glowann gach rud atá sa tacar sonraí tríd gach balla ag lán-neart, cealaítear na leideanna doimhneachta a sholáthraíonn an leibhéal, agus breathnaíonn buaicphointe taobh istigh d'fhoirgneamh mar an gcéanna le ceann ar a dhíon. Déanann alt an **Doimhneacht** go gcuireann an leibhéal i bhfolach an rud atá taobh thiar de; cuireann **Baint de réir faid** an teas teorainn le sliogán nó slab timpeall an cheamara; gearrann an [Stiall](slice.md) slab amach as an domhan. Baineann an trí cinn le módhanna an tí teasa agus athraíonn siad na sraitheanna a chuireann leis, mar sin tosaíonn an carnadh arís nuair a athraítear iad.

## Doimhneacht {#depth}

Teastaíonn [leibhéal](levels.md) ó na dhá rialú - íomhá léarscáile nó samhail 3D. Gan leibhéal luchtaithe níl aon rud taobh thiar de, agus ní dhéanann siad aon rud. Cuirtear as iad araon agus [Leag ar an talamh-phlána](sprite-shape.md#flatten-onto-ground-plane) ar siúl.

### Folaigh taobh thiar den tír-raon {#hide-behind-terrain}

**Folaigh taobh thiar den tír-raon** (ar siúl de réir réamhshocraithe): cuirtear pointe sonraí ar fad as má is é an *talamh* (ní struchtúr) an dromchla is gaire don cheamara.

Tá an tír-raon agus na ballaí opaque ar bhealaí difriúla. Féachann tú *trí* bhalla d'aon ghnó, chun a fháil amach cén urlár a raibh an trácht air; ní theastaíonn uait riamh breathnú trí chnoc, mar taobh thiar de tá taobh i gcéin den léarscáil - agus ar léarscáil a bhfuil cileaiméadair ar leithead inti, is é sin formhór na sonraí, agus suimíonn sé ar an léaslíne ina bhanda níos gile ná aon rud sa réimse tosaigh. Ní féidir le aon dim amháin an dá rud a dhéanamh, mar sin faigheann an tír-raon teorainn dhíchill agus coinníonn ballaí an dim thíos.

### Folaithe taobh thiar de chéimseata {#hidden-behind-geometry}

**Folaithe taobh thiar de chéimseata** (réamhshocrú 0.8): cé chomh láidir agus a chuirtear pointe sonraí taobh thiar de gheoiméadracht an leibhéil faoi chois. Léitear an luach *le feiceáil tríd* ag 0, *N% níos dorcha* eatarthu (suíomh an sliodair, ní an dorchú tomhaiste), *folaithe go hiomlán* ag 1.

Déanann gach balla nó urlár idir pointe agus an ceamara é a dhorchú tuilleadh: fágann balla amháin cúpla faoin gcéad ag an réamhshocrú, agus leathann gach dromchla breise an chuid atá fágtha, suas go ceithre dhromchla. Ag 1 ní tharraingítear aon rud taobh thiar de gheoiméadracht, agus is é sin an rogha is saoire.

Féach freisin [Cuma an leibhéil](level-appearance.md).

## Baint de réir faid {#distance-culling}

Cuireann **Baint de réir faid** (dúnta de réir réamhshocraithe) an teas teoranta do shraitheanna idir teorainn ghar agus theorainn i gcéin ón gceamara. Socraigh teorainn i gcéin chun dlús a léamh taobh istigh d'fhoirgneamh gan taobh i gcéin den léarscáil a shuimiú air; socraigh teorainn gar chun *trí* bhuaicphointe a eitilt in ionad isteach ann.

| Rialú | Réamhshocrú | Raon (jog) | Brí |
|---|---|---|---|
| **Gar** | as | 0.5-5000 m, logartamach, 5% is ísle den rian = as (200,000) | Déantar neamhaird de shraitheanna atá níos gaire ná seo. |
| **I gcéin** | as | 1-200,000 m, logartamach, bun = as (10,000,000) | Déantar neamhaird de shraitheanna atá níos faide ná seo. |
| **Gearr ag plána** | air | | Tomhais na teorainneacha feadh ais an amhairc in ionad ón tsúil, ionas gurb é an gearradh plána comhthreomhar leis an scáileán in ionad spháir timpeall ort. Casann imeall spháir amach ar fud an fhráma agus sleamhnaíonn sé nuair a iompraíonn tú; fanann plána mar a chuireann tú é. |
| **Gearr an leibhéal freisin** | air | | Gearr an talamh, na struchtúir agus an t-uisce ag na teorainneacha céanna. Nuair a fhágtar an leibhéal slán, baintear na pointí sonraí agus fanann an foirgneamh os a gcomhair; nuair a ghearrtar an bheirt, is stiall tríd an léarscáil atá ann agus suíonn na pointí in aghaidh a mballaí agus a n-urlár. Athtarraingíonn an rialú seo amháin; ní thosaíonn sé an carnadh arís. |

### Méarchlár {#keyboard}

Is rud é an teorainn i gcéin a scuabann tú - siúil tríd foirgneamh í agus féach cén urlár a dtaispeánfar an trácht air - agus mar sin tá sé ar an méarchlár agus tú ag eitilt ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Eochair | Toradh |
|---|---|
| `]` | Brúigh an teorainn i gcéin amach ar fhachtóir 1.12 (Shift: 1.35) |
| `[` | Tarraing isteach í ar an bhfachtóir céanna |
| `\` | Cas an teorainn i gcéin as, nó ar ais air ag an bhfad inar fágadh é (6000 an chéad uair) |

Is céimeanna iolraitheacha iad na céimeanna toisc go spréann an raon úsáideach ceithre ordú méide, ó sheomra go léarscáil. Coinníonn an méarchlár an teorainn i gcéin idir 100 agus 400,000. Ní dhéanann na heochracha aon rud agus bosca téacs nó roghchlár fócasaithe.

## Do fhorbróirí {#for-developers}

### Folaigh taobh thiar den tír-raon {#hide-behind-terrain}

Tarraingítear na struchtúir isteach i dtéacsúr doimhneachta dá gcuid féin. Is taobh thiar den talamh é píosa atá taobh thiar de dhoimhneacht an radhairc ach *nach* taobh thiar de dhoimhneacht na struchtúr, agus caitear uaidh é. Costaíonn sé pas doimhneachta amháin thar na struchtúir, agus scipeáiltear é nuair a bhíonn an lasc as.

### Folaithe taobh thiar de chéimseata {#hidden-behind-geometry}

Áirítear é **in aghaidh an dromchla**. Ní féidir le comparáid doimhneachta amháin rud a rá ach "tá rud éigin os a chomhair", agus mar sin dhorchódh pointe taobh thiar de bhalla amháin agus pointe ceithre sheomra isteach i bhfoirgneamh go cothrom, agus léifí an taobh istigh mar smearadh lag amháin. In ionad sin, **déanann an geoiméadracht struchtúir doimhneacht-peeled** isteach i suas le 3 sraith bhreise ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), comhaireann gach píosa cé mhéad dromchla atá os a chomhair (doimhneacht an radhairc féin plus na sraitheanna peeled: suas le ceithre), agus cuirtear an dorchú i gcomhcheangal:

```
neart         = 1 - (1 - sliodar)²                  (sliodar 1 → 1)
infheictheacht = (1 - neart) × 0.5 ^ (dromchlaí - 1)
infheictheacht = max(infheictheacht, 0.006)         (gan urlár ag sliodar 1)
```

| Sliodar | 1 dromchla | 2 | 3 | 4 |
|---|---|---|---|---|
| 0.5 | 25% | 12.5% | 6.25% | 3.1% |
| 0.8 (réamhshocrú) | 4% | 2% | 1% | 0.6% (urlár) |
| 1.0 | gan tarraingt | gan tarraingt | gan tarraingt | gan tarraingt |

Cén fáth dhá fhachtóir: calabraítear an sliodar ionas go bhfágann balla amháin cúpla faoin gcéad - an cuma a léitear mar "taobh thiar de rud éigin" - agus dhéanfadh cúpla faoin gcéad comhchuirthe níl ann faoin tríú balla; coinníonn an leath in aghaidh dromchla breise ceithre chéim inaitheanta. Cén fáth cearnach: fágann líneach réimse sáithithe fós sáithithe taobh thiar de bhalla; scriosann ceathrú cumhacht é ag 0.8. Cén fáth urlár: dá gcuirfí an teas folaithe i bhfolach go hiomlán, bheadh seomra lán trácht folaithe cosúil le seomra folamh, gan aon rud a mholfadh an [Stiall](slice.md) a úsáid. Ní folaíonn ach sliodar socraithe ag 1 an teas go hiomlán - agus is é sin an rogha is saoire, mar diúscairtear na pointí folaithe.

Conas ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), na sciadairí teasa pointe): déantar an chomparáid in aghaidh picteilín, i gcoinne théacsúr doimhneachta an radhairc, i **doimhneacht fuinneoige** in ionad fad domhanda. Léann aischur téacsúr doimhneachta ar an staid vertex "i gcéin" ar roinnt tiománaithe (rasterizer bogearraí ANGLE ina measc), agus cailltear an scaradh má líneáraítear an dá dhoimhneacht go méadair le raon leathan gar/i gcéin. Is é an claonadh radius amháin de spráidín, tiontaithe go haonaid fuinneoige, agus cúpla giota is lú-suntasach, ionas nach ndéanann pointe sonraí atá ina luí ar dhromchla scáth ar a fhéin.

Tarraingítear struchtúir trédhearcach, ach tarraingítear iad isteach sa doimhneacht a léann an folú; dá gcuirfeadh leibhéal nach dtiocfadh a struchtúir chuig an téacsúr doimhneachta, ní fholódh sé ach i gcoinne an tír-raoin.

### Baint de réir faid {#distance-culling}

Meastar an dá theorainn sa vertex shader, mar sin costaíonn sraith scagtha vertex amháin agus gan píosaí.
