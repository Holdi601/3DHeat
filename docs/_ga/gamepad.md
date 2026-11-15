---
title: "Pada cluiche agus HOTAS"
parent: "Ceamara agus rialuithe"
nav_order: 1
lang: "ga"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---

# Cluiche-phadán agus HOTAS

Is féidir leat an ceamara a eitilt le rialaitheoir de chineál Xbox in ionad na méarchláir. Úsáid é nuair is mian leat ligean siar agus breathnú thart ar radharc mór. Cuireann a ionchur **leis** an ionchur ón méarchlár, mar sin is féidir leat an dá cheann a úsáid ag an am céanna.

## Nasc rialaitheoir {#connect-a-controller}

1. Plugáil an rialaitheoir isteach (nó péireáil é).
2. Cliceáil ar an amharc agus brúigh aon chnaipe ar an rialaitheoir. Ní thaispeánann brabhsálaithe rialaitheoir go dtí a chéad ionchur.
3. Oscail **Ceamara agus radharc → Cluiche-phadán**. Taispeánann liosta na ngléas é le `●`.
4. Brúigh an maide clé chun eitilt, an maide deas chun breathnú. Má théann an ceamara ar strae agus na maidí lárnaithe, ardaigh **Crios marbh**.

Oibríonn aon ghléas a léarscáileann an brabhsálaí go dtí an leagan caighdeánach cluiche-phadáin. Déantar neamhaird ar mhaide eitilte nó smacht (HOTAS) de ghnáth; féach thíos.

## Léarscáiliú {#mapping}

| Rialaithe | Éifeacht |
|---|---|
| Maide clé | Bog: ar aghaidh/siar agus stracadh |
| Maide deas | Breathnaigh: guairle agus claonadh, ag *Luas amhairc* céimeanna sa soicind ag lán-chlaonadh |
| `RT` / `LT` (analógach) | Suas / síos; sa tionscadal comhthreomhar, súmáil isteach / amach |
| `RB` (coinnithe) | 6× níos tapúla |
| `LB` (coinnithe) | 15% den luas |
| `A` (coinnithe) | Sprionta 3× (comhcheanglaíonn le RB/LB) |
| `Y` (brú) | Fráma na sonraí |

Leanann uimhreacha na gcnaipe an leagan caighdeánach: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; na maidí ar aiseanna 0-1 (clé) agus 2-3 (deas).

## Socruithe an chluiche-phadáin {#the-gamepad-settings}

I **Ceamara agus radharc → Cluiche-phadán**. Osclaíonn **Socruithe** / **Folaigh** na rialaithe ghearrtha.

| Rialaithe | Réamhshocrú | Raon (luascadh) | Brí |
|---|---|---|---|
| **Cumasaithe** | air | | |
| Stádas gléis | | | Gach gléas ceangailte, `●` nuair a leantar é, `○` nuair nach leantar, agus *- nach pad XInput é, neamhaird air* nó *- nach pad XInput é, úsáidtear ar aon nós* do ghléasanna neamhchaighdeánacha. Gan aon cheann: *Níl aon pad brathta. Ní nochtann brabhsálaithe rialaitheoir go dtí go seolann sé a chéad ionchur - brúigh cnaipe air.* |
| **Úsáid an gléas** | *Padáin XInput amháin (molta)* | | Taispeántar nuair a bhíonn gléas neamhchaighdeánach ceangailte. Roghnaigh gléas de réir ainm chun leanúint air ina ionad. |
| **Luas amhairc** | 150°/s | 20-540 (5000) | Luas casta ag lán-chlaonadh an mhaide dheas. |
| **Crios marbh** | 12% | 0-50% (95%) | Radiach: ní shileann brú trasnánach isteach in ais amháin riamh. Ardaigh é má théann an ceamara ar strae agus na maidí lárnaithe. |
| **Cuar an mhaide** | x² | líneach (1) go x⁴ (16) | Easponant freagartha tar éis an chriosa mhairbh: rialú níos mín gar don lár, luas iomlán fós ar an imeall. |
| **Inbhéartaigh Y an mhaide** | as | | |
| **Malartaigh na maidí** | as | | Bog ar an maide deas, breathnaigh ar an maide clé. |

Cruth an mhaide: le claonadh *m* (fad veicteoir an mhaide) agus crios marbh *d*, is é an t-aschur ((m - d) / (1 - d)) ^ cuar ar threo an mhaide, agus 0 laistigh den chrios marbh.

## Cén fáth nach léitear ach padáin chaighdeánacha de réir réamhshocraithe {#why-only-standard-pads-by-default}

Tuairiscíonn an API Gamepad **gach** gléas HID le haiseanna - maidí eitilte, smachtanna, peidil, rothanna - agus ní luíonn siad ar lár: bíonn ais casta nó lever smachta ag lán-chlaonadh nuair nach mbíonn duine ag teagmháil leo. Léite mar mhaide, is ionchur iomlán-luais buan é nach féidir le crios marbh ar bith a chur faoi chois, agus casann an ceamara leis féin ón nóiméad a luchtaítear an leathanach (agus is cosúil go bhfuil gach mód teasa briste freisin, toisc go dtosaíonn ceamara a bhogann an carnadh ó thús in aghaidh an fhráma).

Mar sin ní leantar gléas ach nuair a thuairiscíonn an brabhsálaí `mapping: "standard"`, a bhealach ag rá "pad de stíl XInput leis na haiseanna ar an áit a bhfuil súil agat leo". Liostaítear gléasanna eile agus marcáiltear go bhfuil neamhaird orthu, agus cuireann **Úsáid an gléas** rogha go sainráite i gcrích - chun an ceamara a eitilt le HOTAS, mar shampla. Nuair a leantar pad, fanann an ceamara leis, ionas nach gcuireann dhá rialaitheoir troid ar an gceamara de réir an ordaithe comhaireamh.

**HOTAS:** léitear aiseanna 0-3 (dhá mhaide) agus na cnaipí caighdeánacha amháin. Ní dhéanann smachtán nó peidil ar aiseanna eile aon rud, agus b'fhéidir go gcaithfear **Crios marbh** níos mó a úsáid le maide nó smacht nach luíonn a aiseanna ag lár.

Folaíonn brabhsálaithe rialaitheoir go dtí go seolann sé a chéad ionchur, mar sin níl pad atá ceangailte ach gan a bheith curtha in úsáid ann fós don leathanach.
