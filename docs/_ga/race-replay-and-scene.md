---
title: "Athsheinm agus an radharc 3D"
parent: "Anailís rása"
nav_order: 52
lang: "ga"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Athsheinm agus an radharc 3D

Seinn do chuid cuairteanna le chéile, cosúil le rás, agus féach cá dtéann carr amháin chun cinn. Tá gach rud a fheiceann tú sa radharc 3D den chluaisín **Anailís rása** cur síos air anseo: na línte tiomáinte, na dathanna ar an rian, na carranna agus na lipéid.

![Léarscáil chúise le carranna ar aon líne 40 m roimh chúinne: rian daite, dhá charr agus an post bratach](../assets/img/en/race-replay-lined-up.webp)

## Clog an athsheinm {#the-replay-clock}

Tiománann clog amháin gach lap: soicindí de lap na **tagartha**. Bogann an inneall ar aghaidh é gach fráma agus an athsheinm á seinm (de réir am an fhráma × luas an athsheinm); ag an deireadh téann sé ar ais go 0 nuair a bhíonn **Lúb** ar siúl, murab ea stopann sé. Níl an clog mar chuid den stór d'aon ghnó, ionas nach ndéanann an taobhbharra athrendáil ar gach fráma; sáraíonn an HUD agus na cairteacha air agus nuashonraítear iad uaireanta ar a mhéad in aghaidh an fhráma.

**Fad an athsheinm** is é an fad is faide a ritheann aon lap ar an gclog: am gach laps (lúide a fhritháireamh in *Ar aon líne*), nó am na tagartha in *Taobh le taobh*.

## An barra iompair {#the-transport-bar}

Faoin radharc, ó chlé go deas:

| Rialaithe | Déanann sé |
|---|---|
| ⏮ | ar ais go dtí an tosach (freisin **Baile**) |
| ▶ / ❚❚ | seinn / cuir ar sos (freisin **K**) |
| luas | 0,25×, 0,5×, 1×, 2×, 4× |
| sleamhnán scrúdaithe | socraíonn an clog go díreach, i gcéimeanna 0,01 s |
| clog | `am / fad · méadair`: an clog mar am lap, fad an athsheinm, agus cé chomh fada is atá an carr tagartha ar an tagairt |
| *Ón líne* / *Ar aon líne* / *Taobh le taobh* | mód an athsheinm (thíos) |
| **Ar aon líne anseo** | cuireann gach carr ar an áit a bhfuil an tagairt anois, agus leanann sé ar aghaidh ó sin |
| **Lúb** | tosaigh arís ag an deireadh (ar siúl de réir réamhshocraithe) |
| **Folaigh na cairteacha** / **Taispeáin na cairteacha** | na cairteacha fad faoin mbarra |

Déantar na cnaipí a mhíchumasú go dtí go luchtaítear cuairteanna (tá lap amháin leor chun é a athsheinm; teastaíonn dhá cheann do chomparáidí).

## Mód an athsheinm {#replay-modes}

Conas a leanann am gach lap féin ón gclog:

| Mód | Am gach lap | Cad a thaispeánann sé |
|---|---|---|
| **Ón líne** (`start`) | an clog féin | gach lap óna thosach féin: rás eatarthu, an bhearna ag fás mar a d'fhás sí ar an rian |
| **Ar aon líne** (`anchor`) | an clog plus fritháireamh an laps | gach carr ar an spota céanna ag an nóiméad céanna, agus ansin scaoilte - cad a tharlaíonn ón bpointe sin ar aghaidh, ní ó thosach an laps |
| **Taobh le taobh** (`locked`) | an t-am a shroich an lap fad reatha na tagartha | gach carr coinnithe ar fhad na tagartha ar feadh an laps: luasanna agus ionchuir curtha i gcomparáid méadar ar mhéadar |

Úsáid é nuair:

- **Ón líne**: ba mhaith leat a fheiceáil cé atá chun cinn agus conas a fhásann an bhearna.
- **Ar aon líne**: ba mhaith leat a fháil amach cad a tharlaíonn i gcúinne amháin nó ar stráice amháin, agus gach duine ag tosú ar an leibhéal sin.
- **Taobh le taobh**: ba mhaith leat na tiománaithe a chur i gcomparáid leis na pedail agus leis an roth ag an áit chéanna ar an gcúrsa.

**Fritháireamh in *Ar aon líne*:** do ancaire ag `s` méadar ar fhad na tagartha, is é fritháireamh gach laps a am féin ag `s` lúide am na tagartha ag `s`, an dá cheann léite ó na laps ailínithe (féach [aon ais fhaid amháin](race-corner-analysis.md#one-distance-axis)). Coinníonn lap nach gclúdaíonn `s` fritháireamh 0. Má roghnaítear *Ar aon líne* ó na cnaipí mód, cuirtear an t-ancaire ar fhad reatha na tagartha.

Marcálann post bán le bratach (14 m ar airde) an t-ancaire sa mhód *Ar aon líne*.

### Ag ailíniú {#lining-up}

| Gníomh | Ancaire | Clog |
|---|---|---|
| **Ar aon líne anseo** | áit a bhfuil an tagairt anois | gan athrú |
| Shift+cliceáil ar na cairteacha | an méadar cliceáilte | 1,5 s roimh a shroicheann an tagairt é |
| tátal i *Cá bhfuil le feabhsú*, fáinne uimhrithe ar an rian, líne de *Cúinne ar chúinne* le tátal | 40 m roimh a dtosaíonn cúis an tátail | 1,5 s roimh an bpointe sin; ansin seinntear |
| imeacht rialaithe carr, lipéad buille | 40 m roimh an imeacht | 1,5 s roimh; ansin seinntear |
| lap sna staitisticí cúrsa | mar a thátal nó imeacht | mar thuas, leis an lap sin dírithe |

Nuair a fhéachtar ar thátal, cuirtear creat air freisin leis an gceamara - liathróid thart ar lár raon an tátail, an ga is mó de 40 m agus leath a fhaid breise 30 m (60 m d'imeacht) - mura bhfuil an ceamara ag leanúint carr.

### Ceamara leanúnach {#chase-camera}

Cuireann ⌖ sa liosta cuairte an ceamara ag leanúint an chairr sin: 2,5 + 4 × méid an chairr méadar taobh thiar de agus 0,9 + 1,1 × méid an chairr méadar thuas, ag féachaint ar a threo taistil, claonta síos go dtí an carr, réidh (20% den bhealach gach fráma) ionas nach gcrithfheadh sé le gach luascadh. Scaoileann ⌖ arís é. Tá an carr leanta beagán níos éadroime, le fáinne bán ar an talamh, agus tá a chárta aibhsithe.

## Cuid an Radhairc {#the-view-section}

| Rialaithe | Réamhshocrú | Déanann sé |
|---|---|---|
| **Línte** / **Léarscáil ama** / **Léarscáil cúiseanna** / **Léarscáil botún** | Léarscáil ama | cad a pheintear feadh an rian (thíos); *Línte* ní pheintear aon rud |
| finscéal | - | *gains ↔ loses* don léarscáil ama, dathanna na gcúiseanna don léarscáil chúiseanna, *few laps ↔ most laps* don léarscáil botún |
| **Línte tiomáinte** | ar | líne gach laps infheicthe ina dhath |
| **Carranna** | ar | na carranna, agus foinsí chártaí an HUD |
| **Boinn agus crochadh** | ar | teocht taoir, fáinní sleamhnaithe, slata brú an chrochta agus glyphs eile de réir rotha, agus lampaí dín ar na carranna |
| **Lipéid** | ar | ainmneacha cúinní, fáinní uimhrithe, lipéid bhuillí, lipéid chúinní na léarscáile botún |
| **Rian ó na cuairteanna** | ar | dromchla bóthair do chúrsa gan múnla eastráite (folaithe agus múnla cúrsa luchtaithe i **Leibhéal**) |
| **Gach luach ar na cártaí** | as | gach cainéal liostaithe ar gach cárta HUD |
| **Cruthanna réalta na gcarr** | ar | gach carr i gcruth a leath cothrom (féach [Na carranna](#the-cars)); as: an t-aon-suíochán oscailte, nach gcuireann aon rud den telemetry i bhfolach |
| **Méid an chairr** | 1× | 1× go 10× i gcéimeanna 0,5; is é 1× méid fíor an chairr, chomh fada agus chomh leathan is atá sé sa chluiche. Ní athraíonn aon rud ach an sleamhnán seo é |

## Línte tiomáinte {#driven-lines}

Cosán gach laps infheicthe tríd a shamplaí féin, ina dhath, tarraingthe 0,12 m faoin suíomh taifeadta (is í pointe tagartha carr an suíomh taifeadta, 0,28 go 0,47 m os cionn an bhóthair ar chúrsaí Forza eastráite). Coinnítear pointe gach 1,5 m; nuair a bhíonn níos mó ná 10 lap infheicthe, coinníonn na laps nach ndírítear orthu pointe amháin gach 6 m (téann gach veirtéacs chuig an GPU gach fráma).

## Na léarscáileanna {#the-maps}

Is bindí iad na trí cinn feadh chosán na **tagartha**, 0,2 m faoi na suíomhanna taifeadta, ceathairshleasán amháin do gach céim eangaigh 2 m.

### Léarscáil ama (`where`) {#time-map-where}

Don lap dírithe: soicindí gnóthaithe nó caillte in aghaidh an mhéadair i gcoinne an lap a chuirtear i gcomparáid leis ag an bpointe sin (an lap is fearr dá rang, nó don tagairt an lap eile is tapúla tríd gach earnáil), ó athrú an delta ailínithe in aghaidh chéim eangaigh, réidh thar ±10 m. Dearg áit a gcailltear am, glas áit a ngnóthaítear é, liath idir an dá cheann; is é an 95ú pórsa de na luachanna iomlána scála an dathanna, ionas go ngearrtar spící agus go bhfuil an chuid is mó den lap sa raon.
6 m ar leithead.

### Léarscáil chúiseanna (`why`) {#cause-map-why}

Don lap dírithe: péintear gach caillteanas ar an raon ina bhfuil a **chúis** (ní ina bhfuil an t-am le feiceáil), dathaithe de réir ghrúpa na cúise, agus an tátal is costasaí ag bua nuair a chumasc dhá cheann. Leithead `3 + 9·√(costas / costas is mó)` méadar; nuair nár caillteadh rud ar bith, stiall liath 2 m. Péintear an tátal roghnaithe i *Cá bhfuil le feabhsú* bán.

| Grúpa | Dath | Tátail |
|---|---|---|
| coscánú | oráiste | caillteanais tiomsaitheora sa chéim choscánaithe |
| iontráil | magenta | caillteanais tiomsaitheora ar an mbealach isteach agus tríd an lár |
| slí amach | gorm | caillteanais tiomsaitheora ar an mbealach amach |
| stráice | buí | caillteanais tiomsaitheora ar an stráice |
| carr | liath | cad a mhíníonn an carr |
| comhthéacs | liath dorcha | an staid (tosach rásaí i gcoinne lap rite) |

### Léarscáil botún {#mistake-map}

Cé mhéad de na laps go léir (de na ranganna roghnaithe sna staitisticí cúrsa) a rinne botún ar gach méadar - de gach cineál, nó an ceann amháin a roghnaíodh sna staitisticí. Áiríonn gach lap uair amháin in aghaidh an mhéadair; leathnaítear raon gach botúin 6 m ar gach taobh ionas go dtaispeánfar ceann gearr. Leithead `3 + 10·(laps / most laps)` méadar agus dath ó dhonn lom go oráiste geal; liath 2 m nuair nach rinne lap ar bith botún. Féach [Staitisticí cúrsa](race-course-statistics.md#the-mistake-map).

## Rian ó na cuairteanna {#track-from-the-laps}

Do chluiche nach bhfuil a chúrsa eastráite, tarraingítear bóthar faoi na línte: chomh leathan agus atá na laps scaipthe thar an tagairt (ofsetí trasnánacha laistigh de 25 m a áirítear) móide 2 m ar gach taobh, ar a laghad 4 m ar gach taobh de líne na tagartha, réidh thar ±8 phointe eangaigh (±16 m), i liath asfalt le línte imeall éadroma, 0,3 m faoi na suíomhanna taifeadta. Folaithe agus múnla cúrsa luchtaithe i **Leibhéal**.

## Buillí agus timpistí ar an rian {#hits-and-crashes-on-the-track}

Marcáiltear buillí agus timpistí gach laps infheicthe (féach [Imeachtaí rialaithe carr](race-control-events.md#hits-and-crashes)) san áit a tharla siad, aon uair a tharraingítear línte nó carranna: réalta ghéar - dearg le haghaidh timpiste, ómra le haghaidh buille - ina seasamh ar phost, le fáinne i dath an laps ag a bhonn, méid de réir mhéid an chairr (timpistí níos mó). Agus carr ag dul thar nóiméad buille, leathann fáinne turraing uaidh ar feadh 0,8 s.

## Mód cabhrach {#help-mode}

Cuireann **?** in aice leis an roghnóir teanga, nó an eochair **?** nó **F1**, eochair do gach dath ar an scáileán ar fad, ar na trí cluaisín ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Fanann an rogha sa bhrabhsálaí seo.

- **An eochair** i gcúinne an radhairc liostaíonn sí na dathanna don chluaisín agus don mhód in úsáid. Tagann gach scála ó áit a fhaigheann an radharc é, ionas go dtaispeánfar scála teasa a chuir tú in eagar mar atá curtha in eagar. Ar an gcluaisín rásaíochta, liostaítear ach cad atá ar na laps luchtaithe.
- **Cárta gach carr** faigheann tábla de cad a tharraingítear ar a rothanna, de réir ainm, le luach gach roth sa dath ina dtarraingítear é.
- **An carr atá dírithe** faigheann lipéad ag gach roth a dhéanann an rud céanna a rá, curtha amach ag cúinní. Ceiltear é nuair a bhíonn an carr ró-bheag ar an scáileán chun go gcuirfeadh siad isteach air.

## Na carranna {#the-cars}

**Gach carr ina chruth féin**, ina dhath an laps agus ar a mhéid fíor. Tagann na cruthanna ó chomhad carr, a dhéantar uair amháin ar an meaisín ar a bhfuil an cluiche:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Gan ceann, tarraingítear gach carr mar **charr féin an amharcléirí** dá chineál agus dá ré: saloon, coupé, hatchback, estate, carr spóirt, supercar, muscle car, off-roader, pickup, van nó microcar, gach ceann mar chlasaiceach (roimh 1980), de na 80idí agus na 90idí, nó nua-aimseartha ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Tógtar iad seo anseo ó chomhréireanna ginearálta: gan lógónna, gan ainmneacha samhla agus gan rud ar bith ó chomhaid aon chluiche, ionas go seoltar iad leis an amharcléirí. Tagann an cineál ó ainm an chairr, an ré ón mbliain atá ann; glactar le carr nach bhfuil ceachtar acu ó a rang. Tá thart ar céad ghlúin fhíor ar eolas ó fhad, leithead, airde agus fad buncheann a foilsíodh ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); líne amháin do gach ceann, cruinnithe), mar sin faigheann 3 Series na 1990idí méid agus seasamh an chairr sin, fós mar chruth simplí gan ainm ná greille.

Déantar an comhad carr ar do mheaisín féin ó do chóip féin den chluiche. Coinníonn sé múnla ísealmhionsonra de gach carr, thart ar 900 triantán, lena shuíomhanna rothaí (féach [ordú `cars` an eastraitheora](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Luchtaigh comhad carranna...** sna socruithe radhairc, nó an comhad a scaoileadh ar an gcluaisín rásaíochta, luchtaíonn sé; fanann sé sa bhrabhsálaí seo. Coinníonn sé cruthanna an chluiche, mar sin ní rud é le roinnt, agus ní sheolann an t-amharcléirí aon cheann.

Cinntear cén carr a sheasann do charr lap ó cad atá luchtaithe gach uair agus ní stóráiltear riamh é, mar sin faigheann carr gan cúiteamh inniu a chuid féin chomh luath agus a bhíonn comhad níos nuaí ag an gcarr sin ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Carr an laps | Tarraingítear mar |
|---|---|
| tá a uimhir sa chomhad don chluiche céanna | an carr céanna sin |
| an déantús céanna, agus focal den tsamhail san ainm | an tsamhail sin, is gaire ó thaobh blianta de |
| an déantús céanna, an ghlúin chéanna | carr an déantúis sin is gaire ó thaobh blianta de |
| aon rud eile, le comhad carr | carr an déantúis chéanna is gaire mura bhfuil ann, nó an cineál comhlachta céanna, is gaire ó thaobh blianta de |
| carr rothaí oscailte, de réir a ainm | an t-aon-suíochán thíos |
| ní cheann den dá chéad cheann, agus go n-aithníonn an t-amharcléirí an carr ar a mhéid | carr féin an amharcléirí ar mhéid an chairr fhíor sin, le comhad nó gan comhad |
| aon rud eile gan comhad | carr féin an amharcléirí dá chineál agus dá ré |

Mar sin tarraingítear carr 1990 BMW 3 Series de chluiche eile mar BMW de thart ar an mbliain sin, agus taispeánann carr níos nuaí ná an comhad a gaol is gaire go dtí go ndéantar an comhad arís. Insíonn leid laps, agus an líne faoi mhéid an chairr don lap dírithe, cad a tharraingítear mar é agus cé chomh gar is atá sé sin.

Tá fuinneoga dorcha ag carranna féin an amharcléirí. Is dath amháin ar fad atá ag samhlacha comhaid carr, mar níl peinteáil ná gloine sa chomhad le bheith ag brath air. Tarraingítear na rothaí, na lampaí eireabaill, na lampaí agus na glyphs telemetry thíos mar a tharraingítear ar an aon-suíochán; ritheann an slata brú suas taobh amuigh den roth, áit a bhfeictear é, agus fágtar na cuaillí-lámh ar lár.

**An t-aon-suíochán** is rothaí oscailte é i dath an laps, ionas go bhfuil an tosach soiléir ó aon uillinn agus nach gcuireann aon rud na rothaí i bhfolach: tub, clúdach an innill, taobh-phoill, cócphít le clogad, halo, urlár, sciathán tosaigh agus cúil; ceithre roth chruinn, na tosaigh casta leis an stiúir (suas le 0,5 rad ar an nglas iomlán), gach ceann ar dhá chuaille-lámh le hordóg, slat rian (tosaigh) nó seaft tiomána (cúil), agus slata brú. Ísligh an tsamhail 0,3 m ón suíomh taifeadta ionas go mbíonn a rothaí ar an mbóthar, agus scálaítear í le **Méid an chairr**.

**Bogann an comhla ar a springs**: nuair a bhíonn na ceithre fhaid chrochta ag an lap, titeann gach cúinne faoina fhad (méadaithe go 0,12 m ó lán-droop go lán-bump ionas go bhfeictear ó cheamara leanúnach), agus téann an comhla faoi, claonann sí agus rollaíonn sí ar an bplána trí na ceithre cinn.

**Cad a tharraingítear ón telemetry** (le *Boinn agus crochadh* ar siúl) leanann sé [tábla na gcainéal](race-charts-and-hud.md#the-channel-table):

| Glyph | Ó | Tarraingt |
|---|---|---|
| dath taoir | `tireTemp` | an taior féin, gorm fuar → cian → glas oibre → buí → dearg te, thar 40-130 °C |
| fáinne sleamhnaithe | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (an ceann is mó) | fáinne ar an talamh faoin roth, glas le greim i láimh, ómra ag 0,66, dearg ag 1 (imeall an ghreim mar a thuairiscíonn an cluiche); lag faoi 0,3 |
| barra crochta | `suspension` (0..1) | an slata brú daite de réir taistil: gorm sínte, bán lár, dearg comhbhrúite |
| lonradh coscáin | `brakeTemp` (100-900 °C) | diosca ar aghaidh sheachtrach an rotha, dorcha go horáiste |
| banda caitheamh | `tireWear` (0..1) | banda thart ar imeall an chosáin, bán nua → dearg caite |
| barra ualaigh | `wheelLoad` (0-12 000 N) | post in aice leis an roth chomh hard leis an ualach |

Lasann lampaí coscáin (solas báistí agus scairteáin sciathán) leis an bpedal coscáin. Lasann gach cainéal `lamp` atá ar siúl (os cionn leath dá raon) lampa os cionn an aerbhosca ina dhath: ABS ag obair, rialú tarraingthe ag obair, DRS, teorainneoir pit, coscán láimhe, san aer.

**I slua** (níos mó ná 10 infheicthe), tarraingítear na carranna nach ndírítear orthu go simplí: comhla, sciatháin, rothaí agus solas coscáin amháin.

## Lipéid {#labels}

Greamaithe don rian agus suite gach fráma ó thuairisc an cheamara (as an scáileán nó taobh thiar den cheamara, folaithe). Le **Lipéid** ar:

| Lipéad | Cá háit | Cliceáil |
|---|---|---|
| ainmneacha cúinní (`T1`, `T2` …) | os cionn bhuaic gach cúinne ar an tagairt | - |
| fáinní uimhrithe 1-5 | cúig chaillteanas tiomsaitheora is mó an laps dhírithe, i lár raon gach cúise, teorannaithe i ndath na cúise; cuir an cursar os a chionn don teideal agus don chostas | cuir an tátal sin in ailíniú agus athsheinn é |
| lipéid bhuille / timpiste | os cionn gach bhurst den lap **dírithe**: "Timpiste −45 km/h" / "Buille −12 km/h"; cuir an cursar os a chionn don tuairisc iomlán agus don leid | cuir an tionchar in ailíniú agus athsheinn é |
| lipéid chúinní na léarscáile botún (in ionad ainmneacha agus fáinní cúinní, nuair is í an léarscáil botún an léarscáil) | buaic gach cúinne: "T3 · 5/40 coscánú luath" (an botún is coitianta, laps a rinne é / laps a thiomáin an chúinne), "T3 · 5/40" nuair a roghnaítear cineál amháin, "T3 · glan" nuair nach roghnaítear aon cheann; cuir an cursar os a chionn don chaillteanas agus na cúig botún is coitianta | oscail nó dún an chúinne sin sna staitisticí cúrsa |

## Domhain scáthánaithe {#mirrored-worlds}

Tá domhan an amharcléirí dheis-lámhach le Y suas: a fheictear ó thuas, tá carr a bhfuil a threo taistil `atan2(dx, dz)` ag méadú ag casadh ar chlé. Tagann cluiche a bhfuil domhan clé-lámhach aige - Forza ina measc - amach scáthánaithe, agus gach lúb dheas tarraingthe mar lúb chlé, an cúrsa agus na laps araon.

Deir na laps féin é ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): ag siúl gach lap cúpla méadar (3 m) ag an am, déantar cas a chosáin a chur i gcomparáid le comhbhrú an fhionraí taobh amuigh (`suspension.FR` lúide `suspension.FL`) agus, gan fionraí, leis an stiúir (dearfach ar dheis i ngach oiriúntóir). Ní deir lap a chasann níos lú ná π go hiomlán aon rud; comhaireann fianaise nuair a sháraíonn sí 2% den chasadh. Vótálann na laps; is é cothrom "ní féidir a rá".

Nuair nach n-aontaíonn breith na laps leis an íompú ais reatha (líon corr d'aiseanna inbhéartaithe i **Ceamara & radharc → Inbhéartaigh ais an domhain**), insíonn an chuid **Cuairteanna** sin faoin liosta:

- tá an cluiche scáthánaithe agus níl aon rud inbhéartaithe: "Casann na laps seo ar dheis san áit a tarraingítear an cúrsa ag lúbadh ar chlé …" le **Inbhéartaigh X**;
- tá aiseanna inbhéartaithe ach níl na laps scáthánaithe: "Tarraingíonn na haiseanna inbhéartaithe na laps seo mar scáthán …" le **Athshocraigh na haiseanna**.

Ní athraíonn an tarraingt amháin - scáthaithe sa mhatrica amhairc; agus fanann na sonraí, an anailís agus gach comhordanáid a thaispeánann na huirlisí mar atá sa chluiche féin. Coinnítear an t-íompú sa bhrabhsálaí. Ainmníonn an anailís lúbanna ar chlé nó ar dheis leis an tomhas céanna (glactar le domhan anaithnid mar scáthánaithe, mar a dhéantar le Forza).

## Do fhorbróirí {#for-developers}

Cód: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Cad é carr ag nóiméad {#what-a-car-is-at-a-moment}

Idirshuíonn `stateAt` gach cainéal idir an dá shampla atá thart ar am an laps. Glacann cainéil a cheumnaíonn (gear, bratacha) an sampla is gaire. Stadann lap a chríochnaigh ar an líne.

**Treo.** Tagann treo an taistil ó shuímh a bhfuil cúpla méadar eatarthu (2 m ar a laghad ar gach taobh, ionas nach gcasfaidh luascadh an carr). Ní thagann treo na comhlainne ó ghiúrach an chluiche ach nuair a bhíonn sé feistithe ar threo an taistil - comhartha agus fritháireamh, de mheán ciorclach thar shamplaí níos tapúla ná 10 m/s (20 ar a laghad) - agus ansin amháin má aontaíonn sé leis (variance ciorclach faoi 0,05, thart ar 18° de scaipeadh); murab ea, pointeann an chomhla ar threo an taistil. Coinníonn sé sin sleamhnú infheicthe (comhla agus taisteal scartha) gan muinín a chur i gcoinbhinsiún uillinne cluiche.

**Stiúir agus taobhanna.** Cén treo a gcasann stiúir dhearfach an carr, agus cén taobh a bhaineann rothaí deise an chluiche leis, tomhaistear ón lap: an stiúir i gcoinne chasadh an chosáin, agus cén taobh den fhionraí a chomhbhrúann ar an taobh amuigh de lúba (gan sonraí fionraí, glactar le cluichí Forza mar scáthánaithe).
