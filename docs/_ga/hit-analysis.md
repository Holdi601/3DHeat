---
title: "Anailís buailte (cluaisín Feithiclí)"
parent: "Athsheinm"
nav_order: 4
lang: "ga"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---


# Anailís buailte

Taispeánann an cluaisín **Feithiclí** cá ndearnadh buille de thanc, long nó saighdiúir amháin, agus cé a rinne é. Úsáid é chun a fheiceáil cén taobh de thanc a lámhaítear, nó cén namhaid a dhéanann an damáiste.

## Bain triail as {#try-it}

1. Luchtaigh cluiche a bhfuil buillí ann (féach an tábla thíos le haghaidh na gcluichí a thugann iad).
2. Oscail an cluaisín **Feithiclí** ag barr.
3. Faoi **Feithicil**, roghnaigh aonad, mar shampla cineál tanc. Is é an uimhir sna lúibíní cé mhéad buille a fuair sé.
4. Léigh an figiúr: is buille é gach marc, curtha san áit ar bhuail sé.
5. Oscail **Cé a bhuail** chun na lámhachóirí, na hairm nó feithiclí na lámhachóirí a fheiceáil, le buillí, damáiste, maruithe agus fad.

![An cluaisín Feithiclí: tanc demo le marcanna buillí, agus Cé a bhuail oscailte](../assets/img/en/hit-analysis-tank.webp)

Mura bhfuil aon rud luchtaithe, nó mura bhfuil aon bhuillí ar fheithiclí sna sonraí, insíonn an cluaisín cad atá ar iarraidh agus cén tiontaire ba cheart a úsáid.

```
        lámhachóir ----> o  marc buille ar an figiúr
        lámhachóir ----> o
  [ figiúr tanc ]
```

Taispeánann an figiúr na buillí san áit a thugann na sonraí pointe nó cuid de chorp. Oibríonn an miondealú (cé a bhuail, cad leis, cé chomh crua, ó cé chomh fada) do gach foinse.

## Cad a thugann gach foinse {#what-each-source-gives}

| Foinse | Pointe ar an aonad | Lámhachóir | Airm | Damáiste / toradh |
|---|---|---|---|---|
| War Thunder | tá, i gcreat an aonaid, leis an treo a bhí ag an urchair | tá | feithicil an lámhachóra | criticiúil, tromchúiseach, modúil scriosta, an urchair mharfach |
| CS2 | cuid de chorp (hitgroup) | tá | tá | damáiste, armúr, sláinte fágtha |
| World of Tanks | tá (bosca comhpháirte, iontráil agus imeacht) | tá | - | damáiste nó dada (preab, gan treá) |
| World of Warships | tá, i gcreat na loinge | tá | cineál buille | - |
| Squad | feithiclí: tá - an tionchar curtha i gcreat na feithicle ó a suíomh agus a ceann féin | níl (ní ainmníonn na sonraí aon cheann) | cineál damáiste | an titim i sláinte na feithicle ar an bpointe sin, scriosta |
| Saighdiúirí Squad | níl: coinníonn an tiontaire torthaí an bhuille (cnámh agus pointe tionchair) amh; léitear rónna `impact` le `hitBone` a luaithe a scríobhann sé iad | | | créachtaí agus básanna amháin |
| Arma (OCAP, taifeadán Arma 3) | níl: taifeadann OCAP cé a bhuail nó a mharaigh cé, cad leis, ó cé chomh fada, ní cá háit | tá | tá | buille nó marú, fad |
| Tacview ACMI | tá nuair a chríochnaíonn oibiacht airm laistigh de 30 m d'aonad (ní a sheolán): a háit dheireanach i gcreat an aonaid (ceann, pitse, roll), ag teacht sa treo a eitil sé | `Parent` an airm | ainm an airm, nó AmmoType Timeout | Outcome Timeout, titimeanna `Health`, `Destroyed`; gan airm, marú nó damáiste gan phointe |
| Teileamaetreacht IL-2 (Watcher) | tá: imeachtaí `hit` / `damage` ag iompar an phointe i gcreat an aerárthaigh an imreora féin (tógtha mar x chun tosaigh, y suas, z ar dheis) | níl | níl | an fórsa |
| Dota 2 | níl: níl áit ag an log comhraic ar laoch | an t-aonad ionsaithe | an scil nó an mhír (ní ceann: ionsaí) | damáiste, bás an laoich |
| Battlefield 6 (GameCapture) | níl: léann an ghabháil an fóidín maraithe (maruithe, básanna, bratach ceann), ní buillí | | | |
| DCS / foinsí beo eile de Watcher | níl imeachtaí buille thar an méid atá ina dtaifeadtaí Tacview | | | |

Nuair nach bhfuil pointe ag buille ar bith den aonad, ní thaispeánann an figiúr marcanna, agus osclaíonn an miondealú **Cé a bhuail** leis féin: de réir lámhachóra, airm nó fheithicil an lámhachóra, agus gach ceann acu lena bhuillí, damáiste agus maruithe, agus an fad meán agus an fad is faide.

## Teorainn le limistéar {#restrict-to-an-area}

Teorannaíonn an chuid **Limistéar** an anailís ar bhuillí a tharla in áit ar an léarscáil.

1. Brúigh **Tarraing dronuilleog** nó **Tarraing polagán**, agus tarraing ar an talamh 3D nó ar an léarscáil taictiúil.
2. Roghnaigh **Íospartach istigh** (comhair buille nuair a bhí an t-aonad buailte sa limistéar) nó **Lámhachóir istigh** (nuair a bhí an té a lámhaigh ann).
3. Brúigh **Úsáid iad mar scagaire**. Deir na sliseanna "{n} de {total} buille sa limistéar".
4. Baineann **Athshocraigh an limistéar** gach limistéar.

Is [toirt](volumes.md) é gach limistéar, mar sin scagann na cruthanna céanna an teasmhap agus an athsheinm freisin. Is féidir le limistéar a bheith san áireamh nó as an áireamh (fágann limistéar as an áireamh a bhuillí as, agus taispeántar "{n} de {total} buille lasmuigh den limistéar"). Taispeántar gach limistéar mar shlis lena líon buillí an aonaid a bhí ann; baineann × ar shlis é. Leanann comhaireamh, an figiúr, an miondealú agus liostaí an scagaire go léir.

Áiteanna buille: coinníonn an tsraith as ar tháinig an buille áit amháin den bheirt (an íospartach do ghortú nó do bhuailte, an lámhachóir do urchar); is é an ceann eile suíomh shamplach féin an aonaid is gaire ó thaobh ama (laistigh de 5 s). Fágtar buille nach bhfuil áit a pháirtí ar eolas amach agus limistéar ag scagadh, agus deir an painéal cé mhéad ("Fágtha ar lár, gan áit aitheanta").

## Do fhorbróirí {#for-developers}

Is féidir le haon tiontaire buillí a chur leis: rónna an íospartaigh (`hit`, `impact`, `hurt`, `wounded`) le `hitBone` (cnámh cnámharlaigh, roghnú Arma, crios buille Reforger - mapáilte go ceann, uchtán, bolg, lámha agus cosa) nó `hitLocalX/Y/Z` (méadair, x chun tosaigh, y suas, z ar dheis), le `other` an lámhachóir agus `damage`.
