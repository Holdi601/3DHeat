---
title: "Socruithe, aonaid agus eochracha"
nav_order: 16
lang: "ga"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: true
---

# Socruithe, aonaid agus eochracha

Athraíonn na rialuithe beaga ag barr an bharra taoibh an bealach a labhraíonn an t-amharcóir leat: an teanga, na haonaid (méadair nó troithe, km/h nó cnota) agus mód cabhrach a mhíníonn na dathanna. Stóráiltear do roghanna i do bhrabhsálaí.

## Ceannlíne {#the-header}

Ag barr an bharra taoibh:

| Rialú | Cad a dhéanann sé |
|---|---|
| **?** | Mód cabhrach: cad a chiallaíonn gach dath (chomh maith le `?` nó `F1`) |
| Roghchlár **Aonaid** | Méadrach, Impiriúil, Eitlíochta nó Muirí |
| Cnaipe **...** taobh le **Aonaid** | Osclaíonn "Roghnaigh aonad do gach méid": liosta anuas amháin do gach cainníocht |
| Roghchlár **Teanga** | Teanga an amharcóra: [40 teanga](languages.md), nó teanga an bhrabhsálaí |

![Ceannlíne leis an roghchlár Aonaid agus an fhuinneog aonad-in-aghaidh-cainníochta oscailte](../assets/img/ga/settings-units.webp)

Is féidir uimhreacha a chlóscríobhann tú i mbosca pointe nó camóg a úsáid (`0.35` nó `0,35`). Léann an t-amharcóir an dá cheann agus taispeánann sé uimhreacha mar a scríobhann teanga an amharcóra iad.

## Aonaid {#units}

1. Roghnaigh réamhshocrú sa roghchlár **Aonaid**. Athraíonn gach cainníocht le chéile.
2. Chun cainníocht amháin a athrú, cliceáil ar an gcnaipe **...** taobh léi agus roghnaigh aonad di. Ansin léiríonn an roghchlár `*` tar éis an réamhshocraithe.
3. Leanann cainníocht nach ndearna tú socrú di an réamhshocrú. Roghnaigh "De réir an réamhshocraithe" chun filleadh air.

| Cainníocht | Méadrach (réamhshocrú) | Impiriúil | Eitlíochta | Muirí |
|---|---|---|---|---|
| Fad | km | mi | NM | NM |
| Airde, fad | m | ft | ft | m |
| Luas | km/h | mph | kt | kt |
| Luas ingearach | m/s | ft/min | ft/min | m/s |
| Teocht | °C | °F | °C | °C |
| Brú | hPa | inHg | hPa | hPa |
| Mais, breosla | kg, l | lb, gal | lb, gal | t, m³ |
| Uillinn | céimeanna | céimeanna | céimeanna | céimeanna |

Aonaid eile is féidir leat a roghnú do chainníocht amháin: fad km, mi, NM; luas km/h, m/s, kt, mph; luas ingearach m/s, ft/min, m/min; teocht °C, °F, K; brú hPa, inHg, mmHg, psi; mais kg, lb, t; uillinn céimeanna nó milleanna NATO (6400 sa chiorcal). Tá na haonaid mar an gcéanna ar fud an amharcóra: lipéid, cártaí, cairteacha, staitisticí.

## Mód cabhrach {#help-mode}

![Mód cabhrach: cad a chiallaíonn na dathanna](../assets/img/ga/help.webp)

Brúigh `?` nó `F1`, nó cliceáil ar an gcnaipe **?**. Taispeánann sé *Cad a chiallaíonn na dathanna*: finscéalta don radharc 3D, na grádáin theasa, dathanna foirne, dathanna an leibhéil, dathanna stádas na bpainéal, painéal an chluiche agus an radharc rása. Fanann sé ar siúl go dtí go múchann tú é. I gcluaisín Cluiche míníonn sé dathanna phainéal an chluiche freisin.

![Mód cabhrach sa chluaisín Cluiche](../assets/img/ga/settings-help-match.webp)

## Cad a chuimhníonn an brabhsálaí {#what-the-browser-remembers}

Coinnítear na socruithe seo i do bhrabhsálaí idir cuairteanna (ní sheoltar aon rud áit ar bith):

- an teanga, na haonaid agus an mód cabhrach;
- socruithe figiúr, siombail, lipéad, ceamara agus taispeántais taictiúla an athsheinm;
- luas athsheinm agus scátháin;
- leabharmharcanna in aghaidh taifeadta, toirteanna in aghaidh tacair sonraí, sraitheanna cuspóra;
- socruithe AI seachtracha (an eochair amháin mura ticeáil tú *Cuimhnigh*).

Tosaíonn socruithe teasa, scagairí agus an mód as an nua le gach lódáil. An liosta iomlán, ginte: [Socruithe stóráilte](ref-settings-storage.md).

## Eochracha a choinníonn an t-amharcóir ón mbrabhsálaí {#keys-the-viewer-keeps-from-the-browser}

Tógann seisiún le sonraí móra am a lódáil, mar sin cuireann an t-amharcóir cosc ar an mbrabhsálaí é a chaitheamh amach de thimpiste:

- Ní dhéanann `Ctrl`/`Cmd` + litreacha a phriontálann, a shábhálann, a osclaíonn, a athlódálann, a dhúnann nó a osclaíonn fuinneoga nua rud ar bith taobh amuigh de bhoscaí téacs; ní dhéanann `F1`, `F3`, `F5`, `F6` agus `F7` rud ar bith.
- Fiafraíonn dúnadh nó athlódáil an chluaisín ina bhfuil sonraí nó leibhéal lódáilte ar dtús.
- Sa lánscáileán glasálann an t-amharcóir na heochracha a úsáideann sé (W, T, N, S, R, P, Q, Esc), ionas nach nglacann an brabhsálaí iad.

An liosta cruinn: [Eochracha brabhsálaí](ref-browser-keys.md). Eochracha uile an amharcóra féin: [Tagairt don méarchlár agus don luch](keyboard-reference.md).
