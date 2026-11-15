---
title: "Cluichí rásaíochta eile"
parent: "Anailís rása"
nav_order: 59
lang: "ga"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Cluichí rásaíochta eile sa léirsitheoir

Léann an léirsitheoir timthriallta ó cluichí rásaíochta go leor, ní ó chluiche amháin. Liostaíonn an leathanach seo iad agus insíonn sé conas timthriall a fháil as gach ceann acu.

## Na cluichí {#the-games}

| Cluiche | Taifeadán | Sleamhnú sa chomhad? | An domhan curtha ina scáthán? | Nótaí |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out thar UDP), nó comhaid timthriall FH Companion agus a `.tele.gz` | tá, de réir rothair (normalaithe) | tá (domhan lámh-chlé) | an `.tele.gz` in aice le gach timthriall FH Companion tugann sleamhnú gach rothair; ní thugann an comhad timthriall amháin é |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (cuimhne roinnte) | tá, de réir rothair | tomhaistear ó na timthriallta | freisin ABS agus rialú tarraingthe ag obair, ualaí rothar, teochtaí |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | níl, oibrítear amach ó luasanna rothar | tomhaistear ó na timthriallta | ralaí: déileáltar le talamh scaoilte agus le léimeanna ar bhealach difriúil |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | níl | tomhaistear ó na timthriallta | gan luasanna rothar |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (mód) | níl, oibrítear amach ó luasanna rothar | tomhaistear ó na timthriallta | |
| Trackmania | plugean Openplanet, `telemetry --game trackmania --install` | comhéifeacht sleamhnaithe do gach rothar | tomhaistear ó na timthriallta | fisic arcáide: déileáltar le sleamhnáin ar bhealach difriúil |
| iRacing | ní dhéantar aon rud: a chomhad `.ibt` féin | níl (ní logáiltear é); oibrítear amach ó ghiaró | níl (bunaithe ar GPS) | cas ar logáil sa charr le Alt+L |

## Conas timthriall a thaifeadadh {#how-to-record-a-lap}

1. Roghnaigh do chluiche sa tábla agus socraigh é mar a deir leathanach an taifeadáin don chluiche sin (socrú sa chluiche, mód, nó rud ar bith in iRacing). Tá na céimeanna difriúil do gach cluiche, mar sin tá siad sna doiciméid taifeadáin: [GameCapture: cluichí](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Cuir an taifeadán ag obair, agus tiomáin. Scríobhann sé comhad amháin in aghaidh an timthriall.
3. Sa chluaisín **Anailís rása** brúigh **Lódáil comhaid chuairte…** agus roghnaigh dhá thimthriall nó níos mó den chúrsa céanna (féach [Timthriallta a lódáil](race-loading-laps.md)).

Le haghaidh cluichí ralaí tugann an taifeadán comhad amháin in aghaidh rith staighre, agus is é an tús is éasca do Forza ná leabharlann FH Companion lena comhaid `.tele.gz` in aice leis na comhaid timthriall.

## Cad a dhoiciméadaíonn na taifeadáin {#what-the-recorders-document}

Is iad na taifeadáin a dhoiciméadaíonn conas a taifeadtar gach cluiche, cad a sheolann sé, na foinsí dá leagain amach, agus na cúrsaí is féidir a easpórtáil as a chomhaid: [GameCapture: cluichí](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (poiblí, i [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), agus is é [GameCapture: an formáid timthriall](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md) an comhad timthriall a scríobhann gach taifeadán.

## Cad a dhéanann an léirsitheoir leo {#what-the-viewer-does-with-them}

Críochnaíonn gach cluiche mar chomhaid `heat3d-lap` (nó mar CSV timthriall), le hainmneacha caighdeánacha na gcainéal ó `src/race/schema.ts` agus bloc `meta` a deir cad a chiallaíonn a chuid uimhreacha - conas a scálaítear a sleamhnú, ciorcad nó ralaí nó arcáid, an dromchla nuair is eol é - ionas go ndéileálann an cluaisín **Anailís rása** leo go léir ar an gcaoi chéanna. Nuair nach bhfuil samhail cúrsa lódáilte tarraingíonn an cluaisín **Anailís rása** bóthar as scaipeadh féin na dtimthriall, ionas gur féidir gach cluiche a úsáid gan ceann.

Tomhaistear an sleamhnú rothair - nach seolann aon chluiche ralaí - ón léirsitheoir: ó phaistí teagmhála nó luas dromchla gach rothair i gcoinne luas an chairr nuair a sheolann cluiche ceann (`(rothar - carr) / carr`), ó a rothlú agus ó ga rolla a tomhaistear ar an timthriall féin nuair nach seolann sé ach rothlú. Tagann uillinn an tarraingthe ó luasghearradh an chairr féin (Forza, cluichí AC, Trackmania, RBR), ó luasghearradh an domhain projectáilte ar aiseanna an chairr (EA WRC, DiRT, BeamNG), nó ó threo an chairr i gcoinne an chosáin. Chun a fháil an bhfuil an carr san aer úsáidtear teagmháil, ualaí nó crochadh a rothar. Féach `src/race/derive.ts`.

Nuair a bhíonn domhan cluiche lámh-chlé - mar atá ag Forza - léirítear an cúrsa scáthánaithe sa léirsitheoir; tugann stiúir agus crochadh na dtimthriall féin an rud ar shiúl, agus tairgeann an cluaisín **Anailís rása** ais a chasadh. Déileáiltear le cluichí nach bhfuil a lámh doiciméadaithe (RBR, BeamNG, Trackmania) ar an mbealach céanna: tomhaistear iad, ní glactar leo mar bhunús.

Chomh maith leis na cainéil tiomána, coimeádann na taifeadáin an rud a chuireann gach cluiche leis: gníomhú ABS agus rialú tarraingthe sna cluichí AC, dáileadh coscáin, DRS, teorainn an phoill, borradh, saol phadanna agus dhiosca coscáin; socruithe cabhrach iRacing, dáileadh coscáin, breosla, teochtaí ola agus uisce, agus gach cainéal eile a logáileann sé faoina ainm féin. Tarraingíonn an léirsitheoir iad as a thábla cainéal - lampaí, leibhéil, glifeanna, graif - agus mar sin ní gá aon athrú ar an léirsitheoir chun níos mó a thaifeadadh.
