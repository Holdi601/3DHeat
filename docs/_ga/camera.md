---
title: "Ceamara agus rialuithe"
nav_order: 14
has_children: true
lang: "ga"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Ceamara agus rialuithe

Eitlíonn tú tríd an radharc mar éan: **W A S D** chun bogadh, tarraing an luch chun féachaint. Bain úsáid as an leathanach seo chun eitilt, chun dul go radharc barr nó taobh, agus chun an áit cheart a bhfuil an ceamara a léamh.

## Eitil i 4 chéim {#fly-in-4-steps}

1. Cliceáil uair amháin ar an radharc ionas go mbeidh an méarchlár aige.
2. Coinnigh **W** chun eitilt ar aghaidh, **S** ar ais, **A** agus **D** taobh le taobh, **Space** suas, **Q** síos.
3. Coinnigh cnaipe clé nó deas na luiche agus tarraing chun féachaint thart.
4. Brúigh **F** chun na sonraí go léir a fhráma arís.

Is ceamara eitilte saor é an ceamara, le teilgean peirspictíochta agus teilgean comhthreomhar, radharcanna réamhshocraithe, staidiúr clóscríofa, agus doimhneacht réimse. Tá a shocruithe sa phainéal **Ceamara agus radharc** ag bun barra an taobh (le feiceáil freisin sna cluaisíní Anailís rása agus Cluiche). Is é [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts) an cur i bhfeidhm.

## Eitilt {#flying}

| Ionchur | Éifeacht |
|---|---|
| `W` `A` `S` `D` nó eochracha saighead | Ar aghaidh (feadh an radhairc, an claonadh san áireamh), clé, ar ais, deis |
| `Space` nó `E` | Suas (suas an domhain) |
| `Q` nó `Ctrl` clé | Síos |
| `Shift` (coinnithe) | 6× níos tapúla |
| `Alt` clé (coinnithe) | 15% den luas |
| Tarraing le cnaipe clé nó deas na luiche | Féach thart. Tá an luchóg faoi ghlas agus tú ag tarraingt. |
| Roth na luiche | Luas eitilte ×1.5 in aghaidh an chliceáil (peirspictíocht); zúmáil (comhthreomhar) |
| `F` | Fráma na sonraí |
| Cliceáil (gan tarraingt) | Taispeáin cad atá faoin luchóg ([Iniúchadh an radhairc](#inspecting-the-view)) |
| `C` | Cóipeáil suíomh, giotán agus claonadh an cheamara |
| `G` | Téigh go pointe clóscríofa |
| `Esc` | Dún cárta an phiocaidh (agus stop ag leanúint aonaid) |

### Agus aonad á leanúint {#while-following-a-unit}

Nuair a leanann an ceamara aonad i [athsheinm cluiche](match-replay.md), déanann na heochracha eitilte rud eile:

| Ionchur | Éifeacht |
|---|---|
| Roth, `W` / `S` | Níos gaire don aonad / níos faide uaidh (níos airde / níos ísle sa radharc satailíte) |
| `A` / `D`, `Q` / `E` | Fithis timpeall an aonaid (radharcanna tóir agus fithise) |
| Tarraing | Féach thart ar an aonad (cábán: féach thart istigh) |
| `V` / `Shift+V` | An radharc ceamara eile ar aghaidh / ar ais |
| `Esc` | Stop ag féachaint ar an dara haonad ar dtús, ansin stop ag leanúint |

Suimítear eochracha gluaiseachta le [ceap cluiche](gamepad.md); féach an [tagairt méarchláir](keyboard-reference.md) le haghaidh gach rud eile. Déantar neamhaird de na heochracha nuair a bhíonn bosca téacs nó roghchlár titim faoi fhócas. Tá an claonadh teoranta díreach faoi bhun díreach suas agus síos.

## Painéal Ceamara agus radharc {#camera--scene-panel}

![Painéal Ceamara agus radharc: Teilgean, cnaipí radharcanna réamhshocraithe, cnaipí Réimse amhairc, Luas eitilte agus Staidiúr](../assets/img/en/camera-panel.webp)

### Teilgean {#projection}

**Teilgean**: *Peirspictíocht* (réamhshocrú) nó *Comhthreomhar*.

*Comhthreomhar* (orthagrafach) baineann sé an giorrú dearcaidh, mar sin léitear dhá phointe te de dhlús cothrom mar an méid céanna in aon áit sa fhráma - an chomparáid a bhfuil léarscáil teasa ann chun tacú léi - agus is é a fhágann go bhfuil radharc isiméadrach isiméadrach. Sa mhód comhthreomhar, zúmálann roth na luiche (níl aon ghluaiseacht ar aghaidh a athraíonn an scála) agus tá an [taispeáint luais](#fly-speed) i bhfolach.

**Coinníonn athrú an t-ábhar mar an méid céanna.** Níl réimse amhairc ag teilgean comhthreomhar, mar sin níl airde a fhrustaim gaolmhar le fad an cheamara; seachas sin zúmálann an athrú go fiáin nó ní thaispeánann sé rud ar bith. Dul go comhthreomhar socraíonn airde an fhrustaim go dtí an méid a chlúdaíonn an ceamara peirspictíochta ag fad an fhócais (2 × fad × tan(fov / 2), agus is é fad an fhócais fad an fhráma dheireanaigh). Dul ar ais tugann ar ais an staidiúr peirspictíochta a d'fhág tú, ag an scála céanna le feiceáil, in ionad áit ar bith a rith an radharc comhthreomhar.

### Radharcanna réamhshocraithe {#preset-views}

| Grúpa | Cnaipí | Treoshuíomh |
|---|---|---|
| **Isiméadrach** | **OT**, **IT**, **OD**, **ID** | Comhthreomhar, claonadh -35.264° (= atan(1/√2), an uillinn ag a dtéann an trí ais go léir chuig an bhfad chéanna), giotán -45°, 45°, -135°, 135°. Ceithre chúinne, mar go gcuireann ceann amháin leath an mhapa i bhfolach i gcónaí taobh thiar de rud atá níos gaire. |
| **Ingearchlónna** | **Barr**, **Bun**, **Tosach**, **Cúl**, **Clé**, **Deas** | Comhthreomhar. Féachann Barr díreach síos (claonadh -89.9°), Bun díreach suas, Tosach feadh -Z (giotán 0°), Cúl feadh +Z (180°), Clé feadh -X (-90°), Deas feadh +X (90°). |
| | **Ar ais chuig peirspictíocht** | Fill ar an staidiúr peirspictíochta a d'fhág tú. Díchumasaithe sa pheirspictíocht. |
| | **Radharc trí cheathrú** | Peirspictíocht, giotán -35°, claonadh -28°. |

Athraíonn gach réamhshocrú an teilgean féin - faoi pheirspictíocht fós tiontaíonn "radharc barr" i dtreo pointe imeasctha agus stopann limistéir chomhionanna de bheith léite mar chomhionanna - agus fráma na sonraí ón treo sin.

### Réimse amhairc {#field-of-view}

**Réimse amhairc** - an uillinn ingearach. Réamhshocrú 65°, 10-140° ar an rian (179° leis an hanla), le cnaipí **Cothrom 20°**, **Fada 35°**, **Gnáth 50°**, **Leathan 65°**, **An-leathan 90°**. Cúngaíonn cúng an pheirspictíocht agus is cosúla é le teilgean comhthreomhar; cuireann leathan an doimhneacht in iar-mhéid agus is deacair fad a mheas. Fanann sé beo sa mhód comhthreomhar, áit a socraíonn sé an scála a réitíonn an t-athrú ar ais dó agus an fad a úsáideann **Fráma**.

### Luas eitilte {#fly-speed}

**Luas eitilte** - aonaid domhain (méadair) in aghaidh an tsoicind ag lánthrotail. Réamhshocrú 120; ar gach lódáil is é fad cothrománach na sonraí / 12. Logartamach, 0.02-20,000 (200,000 leis an hanla; athraíonn an hanla de réir cóimheas, ní de réir méideanna). Iolraíonn nó roinneann roth na luiche faoi 1.5 in aghaidh an chliceáil é, laistigh de 0.02-200,000.

Taispeántar an luach céanna ag bun na láimhe deise den radharc (peirspictíocht amháin): an luas i m/s nó km/s, agus an t-am a thógann sé na sonraí (nó an leibhéal, nuair a bhíonn leibhéal 3D lódáilte) a thrasnú ag an luas sin. Tarraing suas nó síos chun an luas a athrú.

### Gar agus i gcéin {#near-and-far}

**Gar** (réamhshocrú 0.5) agus **I gcéin** (réamhshocrú 40,000) na faid ghearrtha. Athríomhtar an dá cheann ó na sonraí ar gach lódáil (gar = max(0.05, síneadh / 20,000), i gcéin = síneadh × 12) agus leathnaítear iad, ní chúngaítear go deo, ag leibhéal 3D atá níos mó ([Leibhéil](levels.md#what-a-level-does-for-the-heat)). Socraíonn a gcóimheas an doimhneacht chruinnis a bhraitheann an folú air, mar sin cuireann gar beag agus i gcéin mór an [folú](depth-and-culling.md) i laige. Nuair a fheictear ón taobh amuigh den radharc nó ard os cionn a thalaimh, bogann an plána gar a úsáidtear amach go 2% den fhad sin, mar sin coinníonn léarscáil a fheictear ó i bhfad suas doimhneacht chruinnis go leor nach gcuireann uisce agus cladach ar snámh; taispeánann an bosca an luach socraithe fós.

### Rialuithe eile {#other-controls}

| Rialtán | Réamhshocrú | Brí |
|---|---|---|
| **Inbhéartaigh Y** | as | Cas an luch suas/síos. |
| **Doimhneacht réimse** | as | Féach thíos. |
| **Ceap cluiche** | cumasaithe | Féach [Ceap cluiche agus HOTAS](gamepad.md). |
| **Staidiúr** | | Féach thíos. |
| **Iniúchadh** | | An taispeáint ón gceamara, pioc le cliceáil, an coinbhinsiún luascaidh agus *Téigh go pointe*; féach [Iniúchadh an radhairc](#inspecting-the-view). |
| **Fráma tacair sonraí (F)** | | Oiriúnaíonn na sonraí (sa chluaisín Anailís rása: na laps) don radharc, agus an treo reatha á choinneáil. Cuirtear an ceamara ag r / tan(fov / 2) ón lár, agus is é r leath trasnáin theorainneacha na sonraí. |
| **Greille**, **Aiseanna** | ar, ar | Greille talún le spásáil 1/2/5 × 10ⁿ de thart ar 1/40 de réimse na sonraí (ag síneadh go 1.5 × na sonraí, idir 8 agus 120 céim greille), agus aiseanna datha. |
| **Inbhéartaigh ais an domhain** X, Y, Z | as | Féach thíos. |

### Staidiúr {#pose}

Cúig bhosca uimhreacha - **X**, **Y**, **Z** agus **luascadh °**, **tuairteáil °** - a leanann an ceamara fad nach bhfuil fócas ag ceann acu. Clóscríobh luach agus brúigh `Enter` (nó fág an bosca) chun an ceamara a bhogadh ann. Cuireann **cóipeáil** `pos X Y Z · yaw A · pitch B` ar an ngearrthaisce (agus `(game yaw)` ina dhiaidh nuair a roghnaítear an coinbhinsiún sin). Is é eitilt an bealach chun iniúchadh; is iad comhordanáidí an bealach chun radharc a athdhéanamh. Is iad na huimhreacha céanna iad leis an [léitheoir ceamara](#camera-readout): comhordanáidí féin na sonraí, fiú nuair a bhíonn ais inbhéartaithe, agus an giotán sa [choinbhinsiún](#yaw-conventions) roghnaithe.

### Inbhéartaigh ais an domhain {#invert-world-axis}

**Inbhéartaigh ais an domhain X / Y / Z** tarraingíonn an domhan leis an ais sin cásaithe. Cuireann cluiche a choinníonn domhan ar chlé-lámh an radharc seo mar íomhá scáthaithe sa radharc deas-lámh seo - lúbthaí ar dheis tarraingthe mar lúbthaí ar chlé - agus cuireann inbhéartú X nó Z ar ais é. **Athraíonn an tarraingt amháin**: fanann na sonraí, an anailís agus gach comhordanáid a thaispeánann na huirlisí (staidiúr, tomhas, sliseanna) mar atá ag an gcluiche féin. Athraíonn an radharc ina áit, agus coinnítear tú ag féachaint ar an spota céanna. Cuimhnítear an socrú seo sa bhrabhsálaí (eochair `localStorage` `heat3d.mirror`); cuir i gcomparáid le [casadh](axes-units-and-time.md#flips) an lódála, a athraíonn na sonraí.

## Iniúchadh an radhairc {#inspecting-the-view}

Cá bhfuil an ceamara, cad atá faoin luchóg, agus dul go pointe - bloc **Iniúchadh** den phainéal Ceamara agus radharc, agus dhá fhorleagan ag barr na láimhe clé den radharc. Tá an cód sa [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), sa [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) agus sa [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Rialtán | Réamhshocrú | Brí |
|---|---|---|
| **Suíomh an cheamara thar an radharc** | ar | An léitheoir ceamara, thíos. Dúntar é freisin lena **×**. |
| **Taispeánann cliceáil cad atá ann** | ar | Pioc le cliceáil, thíos. |
| **Coinbhinsiún luascaidh** | Amharcán | Cén luascadh a thaispeánann agus a léann an léitheoir, boscaí an staidiúir agus an bosca léimeanna. |

Cuimhnítear na trí cinn seo sa bhrabhsálaí (eochair `localStorage` `heat3d.inspect`).

### Léitheoir an cheamara {#camera-readout}

Ag barr na láimhe clé den radharc: **x**, **y**, **z**, **luascadh** agus **tuairteáil** an cheamara, beo, le lipéad ag ainmniú an choinbhinsiúin luascaidh. Taispeánann sé na huimhreacha céanna leis na boscaí [Staidiúr](#pose), agus ní chosnaíonn sé aon rud le linn eitilte (scríobhtar é ar an leathanach ar chlog an fhrámaithe, gan na painéil a athrendálú).

- **cóipeáil** (nó `C` áit ar bith lasmuigh de bhosca téacs) cuireann `x X y Y z Z yaw A pitch B (viewer yaw)` ar an ngearrthaisce, le deachúlacha `.` cibé teanga atá ann - líne a léann an bosca léimeanna, agus aon script, ar ais.
- **téigh go** (nó `G`) oscailt bosca faoi: greamaigh pointe agus brúigh `Enter` chun é a fheiceáil, nó greamaigh staidiúr iomlán cóipeáilte chun seasamh sa radharc sin. Dúnann `Esc` an bosca.

### Comhordanáidí: fráma féin na sonraí {#coordinates-the-datas-own-frame}

Tá gach comhordanáid a thaispeánann nó a nglacann na huirlisí iniúchta i **bhfráma féin na sonraí lódáilte**: cuirtear ar ais [mapáil an aiseanna](axes-units-and-time.md) an lódála (ais suas, casadh, scála). Is é an uimhir a shealbhaíonn an tábla foinse an suíomh a léitear ón radharc, agus tagann uimhir ón tábla a chlóscríobhtar sa bhosca léimeanna ar an spota sin. Nuair nach athraíonn an mhapáil rud ar bith (lódáil Y-suas gan scála - is iad sin a scríobhann na huirlisí gabhála agus na onnmhaireoirí leibhéal) is é seo an domhan díreach; seachas sin iompraíonn an léitheoir lipéad **córas na sonraí**. Gan tacar sonraí, is comhordanáidí domhain iad na comhordanáidí. Bíonn giotán agus claonadh i gcónaí faoi dhomhan an amharcáin, Y suas.

### Coinbhinsiúin luascaidh {#yaw-conventions}

| Coinbhinsiún | Luascadh 0° féachann feadh | Fásann i dtreo | Úsáidtear ag |
|---|---|---|---|
| **Amharcán** | -Z | -X | an ceamara eitilte, [radharcanna réamhshocraithe](#preset-views) |
| **Cluiche / uirlisí gabhála** | +X | -Z | colúin `yaw` agus staidiúir na n-uirlisí gabhála; i leibhéal onnmhaithe i bhfráma an amharcáin, luascadh féin an chluiche |

Tá an tuairteáil mar an gcéanna sa dá cheann: suas ón gcothrománach. Is ceathrú cas an difríocht eatarthu agus níl aon rud eile ann:

> luascadh an amharcáin = luascadh an chluiche - 90°

Is é treo `d` `(cos p · cos y, sin p, -cos p · sin y)` sa choinbhinsiún cluiche agus `(-sin y · cos p, sin p, -cos y · cos p)` sa cheann an amharcáin. Roghnaigh **Cluiche / uirlisí gabhála** chun luascadh a chlóscríobh díreach as tábla gabhála, nó chun an léitheoir a chur i gcomparáid le ceann acu.

### Téigh go pointe {#going-to-a-point}

**Téigh go pointe**, sa bhloc Iniúchadh (agus bosca **téigh go** an léitheora):

- glacann an bosca téacs `x, y, z` nó `x y z` (nó `x; y; z`), le pointe deachúil nó camóg deachúil - is é an pointe céanna `-321.6, 137.8, -59.9` agus `-321,6 137,8 -59,9`. Cuireann cúig uimhir giotán agus claonadh leis, agus léitear staidiúr cóipeáilte ón léitheoir nó ó bhoscaí an staidiúir ina iomlán, lipéid agus coinbhinsiún san áireamh;
- **luascadh °** agus **tuairteáil °** (roghnach) cas an ceamara, sa choinbhinsiún roghnaithe;
- **Féach air** coinníonn sé an ceann-treo (cas síos chun féachaint síos 20° ar a laghad mura raibh sé ag féachaint go cothrom) agus cúlaíonn sé feadh é go dtí an fad reatha, ag coinneáil idir 0.3% agus 3% de leithead na radharcghrafa - 6 go 60 m ar leibhéal dhá chiliméadar. Leanann fad an fhócais, airde radharc comhthreomhair agus luas eitilte, ionas go mbíonn an radharc in-úsáidte ar a theacht;
- **Seas anseo** cuireann an ceamara ar an bpointe, casta go dtí an giotán agus an claonadh tugtha, nó mar a bhí.

Seasann staidiúr greamaithe lena ghiotán agus a chlaonadh féin sa radharc sin i gcónaí.

### Pioc le cliceáil {#click-to-pick}

Taispeánann cliceáil ar an radharc - brúigh agus scaoil gan tarraingt níos mó ná 4 picteilín; leanann tarraingt ag féachaint thart fós - cárta ag barr na láimhe clé leis an méid atá faoin luchóg. Agus an [tomhas](measure.md) ar siúl, téann cliceálacha chuig an tomhas ina ionad.

**Buann pointe sonraí tarraingthe.** An sampla is gaire laistigh de 8 picteilín ón gcliceáil, de na cinn atá tarraingthe i ndáiríre: na sraitheanna sa fhuinneog ama agus sa saol, a théann tríd na [scagairí](filters.md), na grúpaí a thaispeántar agus an scoilt dhifríochta, laistigh den bhearradh fad agus de shliseanna a ghearrann an teas. I dtaispeántas an bhosca, bosca faoin luchóg (in aon áit air). Liostaíonn an cárta gach colún a iompraíonn an tsraith, faoi ainmneacha colún na foinse féin - am (am an bhalla, nó soicindí an chomhaid féin le `m:ss.ss`), duine, grúpa, seisiún, gach colún coinnithe, an suíomh agus an treo féachana - agus an fad ón gceamara. Níl sa chuimhne ach colúin a choinnigh an lódáil: ní thaispeántar colún nár roghnaíodh mar [cholún scagaire](column-mapping.md).

**Seachas sin dromchla an leibhéil**: an pointe ina dtagann gathán na cliceála le triantáin fhíor an leibhéil (ní an plána tagartha an tomhais), leis an **bpáirt** a bhaineann leis (ainm an onnmhaireora, `structure:props`, `ground:terrain …`), a **chineál** (talamh, struchtúr, uisce, íomhá léarscáile), na comhordanáidí agus an fad. Téann geoiméadracht a fholaíonn sliseanna nó an bhearradh fad tríd. Nuair a bhíonn [líonra nascleanúna](model-levels.md#navigation-meshes) ag an leibhéal, ainmníonn líne é agus deir sí an bhfuil an spota air (✓). Ciallaíonn ainm páirte le `≈` roimhe gur buaileadh amach é ó bhosca teorainne na bpáirteanna, mar gur simplíodh an chuid sin den leibhéal ag lódáil.

Fanann an cárta go dtí go ndúntar é (**×**, `Esc`), go bhfreagraíonn cliceáil eile rud eile, nó go gcliceáiltear ar spás folamh. Tarraingítear crois cyan ag an bpointe sa radharc agus fáinne thar a barr ar an scáileán. Na cnaipí: **cóipeáil** (gach luach, agus na comhordanáidí mar `x, y, z`), **Féach air**, agus **Seas anseo** (ar phointe sonraí, ag féachaint mar a bhí an tsraith nuair a bhíonn treo féachana aici; ar dhromchla, 1.7 m os a chionn).

Innéacsaítear an leibhéal le haghaidh piocadh ar an gcéad chliceáil a theastaíonn sé: greille de cholúin ar a bhunghéag, tógtha cúpla milliseacht ag an am idir frámaí ionas nach stopann an radharc riamh (thart ar soicind oibre le haghaidh leibhéil de chúpla milliún triantán), agus coinnithe go dtí go n-athraíonn an leibhéal. Go dtí sin deir an cárta *Ag ullmhú an leibhéil don phiocadh* le céatadán, agus freagraíonn sé an chliceáil nuair a bhíonn sé réidh. Scaiptear cuardach pointe sonraí thar níos mó ná ceithre mhilliún sraith tarraingte ar fhrámaí ar an modh céanna.

## Doimhneacht réimse {#depth-of-field}

Rannán inscoilte i Ceamara agus radharc, teideal *Doimhneacht réimse - ar* agus é cumasaithe. As de réir réamhshocraithe: is éifeacht láithreoireachta é, agus ba chóir don radharc réamhshocraithe na sonraí a thaispeáint seachas léirmhíniú orthu.

| Rialtán | Réamhshocrú | Raon (hanla) | Brí |
|---|---|---|---|
| **Cumasaithe** | as | | |
| **Fócas ar an rud a frámaíodh** | ar | | Fócas ag an bhfad a úsáideadh sa fhráma deireanach (*Fócasaithe ag N m.*). |
| **Fad fócais** | 1000 | 1-200,000, logartamach (10,000,000) | Taispeántar nuair a bhíonn an fócas de láimh. |
| **Cró** | ±35% | ±2% go ±200%, logartamach (±3200%) | An doimhneacht a choinnítear géar, mar chodán d'fhad an fhócais - coibhneasta seachas uimhir f, toisc go dtéann raon na radharc ó sheomra go léarscáil ocht gcilteanach. |
| **Doiléiriú uasta** | 12 px | 1-48 (256) | An ga doiléirithe is mó; méadaíonn an costas leis. |

Doiléirníonn sé an **leibhéal, an greille agus na boscaí** - *ní an teas*. Is é an teas ag picteilín suim sprites ag go leor doimhneachtaí, mar sin níl doimhneacht amháin aige le bheith as fócas; bheadh sé mícheart é a dhoiléiriú de réir aon gheoiméadrachta atá taobh thiar de, áit ar bith a bhfuil sé ag snámh os a chomhair. Tá sonraí géara thar chomhthéacs bog níos úsáidí freisin den bheirt. Is 24-tap ag bailiú uillinne órga sa phas comhdhéanta an doiléiriú, meáite ionas nach smearálfar an tulra géar tosaigh amach ag an gcúlra doiléir taobh thiar de. Athdhéanann athrú air an radharc gan an carnadh teasa a atosú.

## Taifeach an chanbháis {#canvas-resolution}

Rindreáiltear an canbhás ag cóimheas picteilíní an scáileáin, teoranta go 2. Féadfar maolán an teasa a rindreáil ag taifeach níos ísle ná sin ([Taifeach an teasa](performance-and-stats.md)).

## Leathanaigh sa chuid seo {#pages-in-this-section}

- [Ceap cluiche agus HOTAS](gamepad.md)
- [Tagairt méarchláir agus luiche](keyboard-reference.md)
