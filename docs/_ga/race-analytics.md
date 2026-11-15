---
title: "Anailís rásaí: an modh"
parent: "Anailís rása"
nav_order: 58
lang: "ga"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Anailís rásaí: an modh

Go hachomair:

- Cuirtear cuairteanna i gcomparáid **de réir fad**, ní de réir ama, ionas go mbíonn an áit chéanna ar aon líne.
- Breithnítear gach cúinne **ina hiomláine**, ó chrios coscánaithe amháin go dtí an chéad chrios eile.
- Roinntear an t-am caillte **idir** an áit ar caillteadh é (coscánú, iontráil, slí amach, stráice) agus cé mhéad de a mhíníonn an carr.
- Míníthear an chúis **i bhfocail**, le comhairle.
- Chun é a úsáid, ní chun a léamh conas a oibríonn sé: féach [Anailís rása](race-analysis.md).

Is é seo an modh taobh thiar den chluaisín **Anailís rása**: cad a thomhaiseann sé, conas a chinneann sé cá ndeachaigh an t-am, agus conas a iompraíonn sé sin ina chomhairle. Is í seo an tsonraíocht a leanann cód an anailíse (`src/race/`), agus mar sin tá comhghaolmhar ag gach riail anseo ann, agus tástáil a dhaingníonn é.

## Cad a dhéanann na huirlisí gairmiúla {#what-the-professional-tools-do}

Tagann na huirlisí aitheanta ar an gcroí céanna, agus is é an difríocht is mó cé chomh fada agus a théann siad i dtreo **cúiseanna**:

- **Cuirtear gach rud i gcomparáid de réir fad, ní de réir ama.** Athshamplaítear dhá chuairt ar aon ais fhaid amháin; is é an *delta* an difríocht rite san am a chaitear ag an bhfad chéanna (glaonn MoTeC *time variance* air, glaonn cinn eile *time slip* nó *delta trace* air). Léiríonn a fhána cá bhfuil am á chailleadh faoi láthair: is fána éadomhain luasghéarú, drag nó greim leanúnach; is fána géar difríocht choscánaithe nó throttle; is tonn suas is síos malartú idir luas iontrála agus luas slí amach. ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/), [anailís ama earnála](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html), [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Roinntear gach cúinne ina chéimeanna**: coscánú, iontráil, lár, slí amach - pointe an choscáin, an coscán is airde agus a scaoileadh, an luas is ísle agus cá dtarlaíonn sé, an gear, tosú an throttle, filleadh ar throttle iomlán, luas slí amach. ([Driver61: sé chéim](https://driver61.com/uni/corner-phases/), [treoir anailíse lap iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mion-earnálacha in aghaidh cúinne, agus lap teoiriciúil** a chuirtear le chéile as an gcuid is tapúla de gach ceann. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps), [Overcut](https://overcut.gg/))
- **Cuirtear an líne tiomáinte i gcomparáid freisin**, ach ní ar leithligh riamh: "ní chiallaíonn líne ar íomhá rud ar bith go dtí go mbíonn a fhachtóirí rannchuidithe ar eolas" - léitear í i gcomhar leis an rian luais agus leis an delta. ([Track Titan: conas telemetry a anailísiú](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing), [Sim Racing Telemetry: línte rásaíochta](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Bunchúis, ní comhartha.** An é go bhfuil an caillteanas ar an stráice mar gheall ar an throttle i ndáiríre, nó ar iontráil dhona a d'fhág go raibh an throttle déanach? Rangaítear botúin de réir chostas an ama ar lap agus míntear i mbéarla simplí iad. ([Track Titan: sreafaí coitseála](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Cad a chuaigh mícheart sa chéad leagan, agus cén fáth a bhfuil sé tábhachtach {#what-went-wrong-in-the-first-version-and-why-it-matters}

Ghearr an chéad leagan táille ar gach *chéim* ar leithligh agus níor fhéach sé ach ar chaillteanais riamh. Chuir cuairt a choscann níos luaithe am caillte sa chéim choscánaithe, agus dúradh léi coscánú níos déanaí - fiú nuair a chuir an coscánú níos luaithe an carr ar an gcumhacht níos luaithe agus amach as an gcúinne níos tapúla, agus gur bhuaigh sé an t-am ar ais go léir síos an stráice. I dtástáil amháin dúradh leis an gcuairt sin "coscán i bhfad níos déanaí", cé gur chaill an chuairt eile - a bhí coscán níos déanaí aici - an buaic, chuaigh sí ar leithead, agus chaill sí díreach an méid a bhí gnóthaithe aici. Dúirt na sonraí ama go raibh an dá bhealach cothrom; dúirt an chomhairle a mhalairt.

Is é an leasú ná an riail a aontaíonn gach foinse thuas: **déantar cúinne a bhreithniú ina hiomláine**, ó chrios coscánaithe dó go dtí an crios coscánaithe don chúinne eile, mar "uaireanta is féidir milleasoin bheag a thrádáil ar chúinne chun am iomlán an lap a fheabhsú trí ligean do chodanna níos tapúla ina dhiaidh sin" ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## An eolas rásaíochta a ionchorpraíonn na rialacha {#racing-knowledge-the-rules-encode}

**Is tábhachtaí luas slí amach ná luas iontrála**, agus is mó an tábhacht sin dá fhad an stráice a leanann: "is é an t-am a chaitear ar stráicí a fhorcann an t-am sna cúinní", agus iompraítear easnamh luais ag an slí amach go dtí an chéad phointe coscánaithe eile. Is minic gurb é an bealach is tapúla trí chúinne-agus-stráice an cúinne a ghabháil níos moille, ionas go dtagann an throttle níos luaithe - *mall isteach, tapa amach*. ([Race & Track Driving: seicheamh chun am lap a fheabhsú](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/), [Driver61: cúinní a thosaíocht](https://driver61.com/uni/prioritising-corners/)) Bogann pleanálaí íosaimh-ama a dhámhtar as luas slí amach a bhuaic níos déanaí agus faigheann sé lap *níos tapúla*. Is é an luach a chothromaíonn an dá rud `L / v²` in aghaidh an aonaid luais slí amach, do stráice de fhad `L` ag luas `v`: méadaíonn an t-am a chosnaíonn difríocht luais síos stráice lena fhad agus laghdaítear é le cearnóg an luais ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Cúinní de réir an rud a leanann siad.** Ceann a leanann isteach ar stráice: uasmhéadaigh luas slí amach, buaic dhéanach, ar ais chuig an gcumhacht chomh luath agus is féidir. Ceann ag deireadh stráice: uasmhéadaigh an luas a iompraítear isteach ann, coscán chomh déanach agus is féidir; is inghlactha buaic níos luaithe. Ceann idir dhá chúinne: comhdhéanta don cheann is tábhachtaí a leanann é. Glactar le cúinne a d'fhéadfadh a bheith ar cheann ar bith mar chúinne a leanann stráice. Meáchan níos mó ar chúinní tapa: ag luas gearrann carr go lag, agus ní fhaightear ar ais km/h caillte. ([Allen Berg: trí chineál cúinní](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/), [Driver61: cúinní a thosaíocht](https://driver61.com/uni/prioritising-corners/), [Driver61: cúinní éagsúla, teicnící éagsúla](https://driver61.com/uni/different-corner-technique/))

**An ciorcal frithchuimilte.** Tá buiséad amháin greime ag taior, a chaitear ar choscánú, ar chasadh agus ar luasghéarú i meascán ar bith; is é `sqrt(lat² + long²)` an luasghéarú iomlán. Leanann coscánú iarráin imeall an chiorcail: scaoiltear an coscán de réir mar a thógann an stiúir agus an lód trasnánach. ([ciorcal frithchuimilte](https://www.yourdatadriven.com/friction-circle-introduction/), [léaráid g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Rith saor** - gan aon phedal faoi - is é an bealach is moille chun luas a chailleadh, agus táscaire feidhmíochta tomhaiste ina aonar é. ([Racecar Engineering / OptimumG: fachtóir rith saor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Sleamhnú.** Sroicheann fórsa fadaimseartha buaic ag cóimheas sleamhnaithe de thart ar 10-20%, agus ansin titeann sé; thar sin glasann an roth faoi choscánú nó casann sé faoi chumhacht. Tuairiscíonn Forza an sleamhnú normalaithe: is 0 greim iomlán, agus is greim caillte é méid os cionn 1. ([sleamhnú fadaimseartha](https://www.sciencedirect.com/topics/engineering/longitudinal-slip), [Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Tar-eisteacht (understeer) agus thar-eisteacht (oversteer).** Is tar-eisteacht é nuair is mó uillinn sleamhnaithe an rotha thosaigh ná an rotha cúil; is thar-eisteacht é nuair is mó an cúl ná an tosach. Gan uillinní sleamhnaithe: casann an carr níos lú ná mar a iarrann an stiúir air (an stiúir os cionn uillinn Ackermann `L/R` a theastaíonn ó charr ag luas íseal).
([tar-eisteacht, forbhreathnú](https://www.sciencedirect.com/topics/engineering/understeer), [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geoiméadracht líne {#the-geometry-of-a-line}

Is é an luas is féidir le carr a choinneáil ar gha `R` ná `v = sqrt(a R)`, agus is é `a` an luasghéarú trasnánach a thugann a tháirgí (agus cad a bhreisíonn an tiomáint síos, a fhásann le `v²`). Mar sin **fásann an luas le fréamh chearnach na gha**: is thart ar 10% níos tapúla an líne a théann tríd an lár ar gha 20% níos mó ansin.
([luas uasta cornaithe](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html), [formula1-dictionary: cornaí](https://www.formula1-dictionary.net/cornering_tech.html))

**An líne gheoiméadrach** is é an bogha is mó trí chúinne: ón imeall seachtrach, ag teagmháil leis an taobh istigh ag an mbuaic, ar ais go dtí an taobh seachtrach. Do chúinne a chasann trí `θ` ar bhóthar `w` ar leithead (lúide leithead an chairr), tá `R = w / (1 - cos(θ/2))` ag bogha atá ina tangant leis an dá imeall seachtrach agus a bhfuil teagmháil aige le cúinne an taobh istigh (móide gha an imeall istigh féin). Do chúinne ceart tá sé thart ar `3,4 w`; do lúb ghéar `w`. Sin an fáth go bhfuil an leithead tábhachtach is mó i gcúinní measartha agus is lú i lúbanna géara.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Buaic dhéanach** casann isteach níos déanaí agus níos doimhne, ar gha níos teannaí ar dtús, agus oscailtear an gha ar an mbealach amach: níos moille tríd an lár, stráice níos luaithe, cothrom níos luaithe - "íosluas beagán níos ísle ach próifíl luasghéarúcháin níos láidre ar an slí amach". Is é an **buaic luath** an rud contrártha: níos tapúla isteach, agus gha a theannann ar an mbealach amach agus a choinníonn an throttle ar ais. Is botún den chuid is mó é, ach amháin ar ghreim an-íseal, nuair nach féidir an luas a chailltear isteach a aisíoc amach.
([Racing line](https://en.wikipedia.org/wiki/Racing_line), [foclóir telemetry rásaíochta](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/), [matamaitic na líne rásaíochta](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**An "V" agus an "U".** Is é an U an líne chruinn chlasaiceach: an gha is leithne, an t-athrú stiúir is lú. Casann an V isteach níos luaithe, téann sé níos doimhne, rothlaíonn sé an carr go tapa sa lár agus cuireann sé an slí amach ar líne le rith níos díreiche amach. Fanann an coscánú díreach (ionas gur féidir é a dhéanamh níos déanaí), is ísle an t-íosluas ach sroichtear níos déanaí é, agus tagann an throttle iomlán i bhfad níos luaithe.
([Track Titan: líne an V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Lúbthacht i gcoinne faid.** Is compromise idir an conair is giorra agus an ceann is lú lúbach an líne is tapúla. Ar leithead rian rásaíochta is mó an tábhacht atá leis an lúbthacht, agus tagann líne an íoslúbthachta gar do líne an íosama ama áit ar bith a bhfuil an carr ag a theorainn. Scarann sí uaidh áit a bhféadfadh an carr luasghéarú.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2), [TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Lúbanna in éineacht** - buaic dhúbailte, chicane - is fadhb amháin iad: is é líne slí amach ceann amháin líne iontrála an chéad cheann eile, agus tiomáintear ar gcúl iad ón gcúinne a leanann isteach ar stráice.
([Driver61: cúinní éagsúla, teicnící éagsúla](https://driver61.com/uni/different-corner-technique/))

## Cén líne a oireann do cén carr {#which-line-suits-which-car}

Is é a chinneann é **cumhacht an chairr i gcoinne a ghreime** ag luasanna na cúinne sin. "Is rud é cóimheas an móiminteam: greim i gcoinne cumhachta."
([Ross Bentley: carranna móiminteam](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/), [móiminteam os cionn cumhachta capaill](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Carr, ag an gcúinne seo | Líne | Cén fáth |
|---|---|---|
| Luasghéarú crua dá ghreim ("point and shoot") | V: coscán díreach agus déanach, rothlú i lár gearr teann, díreach agus cothrom go luath | buaitear an t-am le throttle iomlán, ní leis an t-íosluas |
| Luasghéarú lag dá ghreim ("móiminteam") | U leathan, buaic beagán déanach, coinnigh an t-íosluas suas | ní féidir leis an luas a scuabann sé amú a aisghabháil |
| Idir an dá cheann | mall isteach, tapa amach: U le buaic dhéanach | an compromise clasaiceach |
| Cúinne tapa, agus níos mó fós le tiomáint síos | U, gar don líne gheoiméadrach | tá an luasghéarú lag ag luas; fásann greim tiomáint síos le `v²`, mar sin íocann luas tríd an lár faoi dhó |
| Greim an-íseal (fliuch, sneachta) | buaic níos luaithe | ní féidir an luas a chailltear isteach a aisíoc amach |
| Cumhacht i bhfad os cionn greime | is lú an tábhacht atá leis an líne | teannann tarraingt, ní an líne, an slí amach |

"Mar is tapúla an chúinne, is gaire í don líne gheoiméadrach; mar is moille í, is mó a athraíonn tú í le buaic dhéanach."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html), [matamaitic na líne rásaíochta](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/), [Track Titan: líne an V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide), [Driver61: greim](https://driver61.com/uni/grip/))

Athraíonn an tiomáint conas a tiomáintear an líne níos mó ná an líne féin. Casttear carr tiomána tosaigh le coscán (coscánú iarráin), agus tugtar cumhacht dó ach amháin mar a scaoileann an roth, nó imíonn sé thar an leithead. Caithfidh carr cumhachtach tiomána cúil a bheith díreach sula dtagann an throttle iomlán, nó sciorrann an cúl amach. Is féidir le tiomáint ar gach roth cumhacht a ghlacadh fós agus é ag casadh, mar sin tosaíonn an throttle níos luaithe.
([teicníc FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/), [RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/), [cornaí AWD vs RWD](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Ríomhann an feidhmchlár cóimheas cumhacht-greime an chairr ag gach cúinne óna thiomáint féin: luasghéarú throttle iomlán ag luas slí amach thar greim trasnánach ag an íosluas. Glaonn sé "point and shoot" air ag 0,45 agus os a chionn, agus "móiminteam" ag 0,25 agus faoi. Tá tiomáint síos ag obair má tá greim an chairr ag 150-250 km/h níos mó ná 15% os cionn a ghreime ag 55-110 km/h.

## An modh {#the-method}

Is í an réasúnaíocht atá sna huimhreacha thíos. Coimeádtar na tairseacha a úsáideann an cód ar leathanach amháin do gach ceann, agus is iad na leathanaigh sin an tagairt nuair a bhíonn uimhir anseo difriúil: [Anailís cúinne ar chúinne](race-corner-analysis.md), [Imeachtaí rialaithe carr](race-control-events.md), [Próifílí carr agus comparáid](race-car-profiles.md) agus [Staitisticí cúrsa](race-course-statistics.md).

### 1. Ais fhaid amháin {#one-distance-axis}

Is í an lap is tapúla an tagairt, mura roghnaíonn an t-úsáideoir ceann eile. Is é a chonair tiomáinte an t-ais: tionscnaítear samplaí gach laps eile air, agus tugtar fad `s` ar an tagairt agus díláithriú side `d` do gach sampla. Ní chuardaíonn an tionscnamh ach ar aghaidh ón meaitseáil roimhe, ionas nach léimeann lap a thrasnaíonn é féin go dtí an taobh mícheart de dhroichead riamh. Ansin athshamplaítear na laps ar eangach amháin, gach 2 m, do gach cainéal. Coinnítear gach lap ar feadh na chúpla méadar deiridh ag an luas a bhí aige, ionas gurb é a dhifríocht ama lap an delta ag an líne.

### 2. Cúinní, agus scair gach cúinne den lap {#corners-and-each-corners-share-of-the-lap}

Conas a aimsítear cúinní, codanna agus coimpléisc: [Anailís cúinne ar chúinne](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Cuntas ama cúinne {#the-time-account-of-a-corner}

Glan, roinnte, luas slí amach agus tarraingt na gcarranna: [Anailís cúinne ar chúinne](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. An breith, agus an chúis {#the-verdict-and-the-cause}

Patrúin na breithe agus na cúiseanna ar an mbealach isteach agus amach: [Anailís cúinne ar chúinne](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. An carr i gcoinne an tiománaí {#the-car-against-the-driver}

Nuair a bhíonn na laps i gcarranna éagsúla, bainetar an caillteanas a mhíníonn an carr, cuid ar chuid:

- **tarraingt**: na carranna ón luas céanna síos an stráice, mar thuas;
- **greim**: den íosluas níos ísle nach míníonn gha níos teannaí, an chuid `½ ln(greim_eile / greim_liom) / ln(luas_eile / luas_liom)`, nuair a bhí an lap ag teorainn a chairr (90% de na taispeánadh ag an luas sin);
- **coscáin**: ó `u` síos go `v` ag díghéarú `a1` i gcoinne `a2`, ag críochnú ag an bpointe céanna, costas `(1/a1 - 1/a2)(u - v)² / 2u` - ach amháin nuair a choscann an lap thart ar chomh crua agus a fhéadfadh a charr thar an gcrios, ar an meán, ní ag buaic amháin.

Tagann an méid a fhéadann carr a dhéanamh ó gach lap luchtaithe de: greim trasnánach, coscánú agus luasghéarú throttle iomlán do gach bosca luais 5 m/s (an 95ú, an 95ú agus an 90ú pórsa). Is é an greim an méid a **choinnigh an carr ar feadh leathshoicind** - an luasghéarú trasnánach meánaithe thar 0,5 s - ní an méid a bhain le sampla aonair: cuireann cuibhe, sciorradh a aisghabhann, carr a ghabhtar uile spíce ar feadh nóiméid, agus carr a dhéanann sin go minic breathnaítear go bhfuil sé níos greimí ná mar atá. (Seiceáladh i gcoinne laps taifeadta de dhá charr éagsúil: léirigh an tomhas in aghaidh an tsamplaí iad gar dá chéile; coinníodh ar feadh leathshoicind, scarann sé iad mar a scarann a n-amanna lap iad.) Glacann an coscán agus an tarraingt gach sampla mar mheán-luach é féin agus a chomharsana. Fágtar an t-aer, an socrú tar éis tuirlingthe, agus gach buille (roinn 6) go dtí go mbíonn an carr aisghabhta as.

**Cén cineál carr é gach ceann** (`profile.ts`): ó na laps céanna,

- **greim coinnithe**: an 95ú pórsa den luasghéarú trasnánach leathshoicind sin;
- **tarraingt** ag throttle iomlán go 50 km/h, 50-120, 120-200 agus os cionn 200, agus an méid is mó a léirigh sé;
- **coscánú** ó 60 go 160 km/h;
- **luas uasta**: an áit ar stop sé de bheith ag fáil ar aghaidh ag throttle iomlán ar feadh soicind ar stráice - tiomáinte díreach, ní cuar fada a tógadh go cothrom, áit a scuabann carr luas ar aon chumhacht. Nuair nach raibh stráice ar fad fada go leor, insíonn an méid a bhí fós á tharraingt aige ag a luas is tapúla cé chomh fada is a bhí sé as. Gan tuairim thar an méid a thaispeánann na laps: chuir feistiú cumhachta thar luas i gcoinne drag carr bóthair 100 km/h os cionn a luais uasta fíor, mar go gcuireann giaráil agus an teorainneoir deireadh le tarraingt carr i bhfad roimh an drag;
- **an cúl a chailleadh**: cé mhéad uair sa lap a sciorr sé thar 10° drift (20° ar thalamh scaoilte) agus an roth casta in aghaidh na cúinne - gafa le glas contrártha - cé mhéad acu sin a thosaigh ar an throttle, agus ag cén cuid dá ghreim a thosaigh siad. Ní chailleann carr a thiomáintear beagán ar an taobh d'aon turas aon rud; tá carr a theastaíonn a ghabháil ag cailleadh. Comhaireofar an rud céanna do gach carr, ionas gur féidir dhá charr a chur i gcomparáid;
- **cothromaíocht**, nuair a iompraíonn na laps uillinní sleamhnaithe: tosaigh i gcoinne cúil ag an teorainn.

**Carranna i gcomparáid** cuireann na carranna taobh le taobh - tábla, seantence do gach ceann ar an méid atá an carr i gcoinne an chéad cheann eile ("luasghéarann X níos fearr, ach ní féidir leis casadh chomh crua, teastaíonn níos mó ama uaidh le stopadh agus caillteann sé an cúl níos éasca"), gach difríocht atá soiléir (4% de ghreim, 5% de tharraingt nó de choscánú, 4 km/h de luas uasta, cúl a ghabhtar ar a laghad uair amháin sa lap níos mó agus leath arís chomh minic), agus conas tiomáint ar gach ceann. Le carr amháin, deir sé cad é an carr sin.

**I ngach cúinne**, nuair a bhíonn na laps i gcarranna éagsúla, insíonn an breith cad a chinneann na carranna den chúinne, agus conas an ceann seo a úsáid chomh maith agus is féidir:

- **tríd an lár**: ar líne an chairr eile, ceadaíonn greim an chairr seo `v_eile · √(greim_liom / greim_eile)`. Má rinne an lap sin, is é an carr an bhearna, agus ní athraíonn aon phointe coscánaithe é - deirtear é, agus cuirtear an cúinne síos don charr seachas don tiománaí; mura ndearna sé, tá an chuid eile ar fáil, agus deirtear cé mhéad. Ansin cá bhfuil an t-am le buachan ina ionad sin: ar stráice, nó i gcarr a tharraingíonn níos crua, i ndiaidh na buaice - coscán díreach, casadh isteach níos déanaí, an carr á chur ar an slí amach go luath; murab ea, an gha is leithne a cheadaíonn an bóthar, mar is é gha níos mó an t-aon bhealach chun luas níos mó gan greim níos mó;
- **cúl a scaoil**: anseo, i gcarr a chailleann é níos éasca ná an ceann eile: cad le déanamh sa charr seo - an throttle a thabhairt isteach de réir mar a scaoileann an roth, nó an coscán a scaoileadh go réidh gan titim lár na cúinne, de réir mar a thosaíonn a sciorradh;
- **an stráice ina dhiaidh**: cad a thóg tarraingt níos láidre an chairr eile ón luas céanna, agus cá ndeachaigh an tarraingt amach ag an gcarr seo air;
- **pointe coscánaithe níos luaithe** i gcarr a stopann níos lú go crua.

Lap a sciorr tríd an lár cúinne (thar 10° drift ar tarmac) bhí sé thar a ghreim, ní gearr air: ní insítear dó riamh go raibh greim le spáráil aige ansin. Agus nuair a scaoil cúl an chairr sa lap seo ó luasghéarú trasnánach níos lú ná mar a d'iarr an chúinne air, deir "greim le spáráil" é a aimsiú i gcéimeanna beaga.

### 6. Rialú carr: glasáil, sleamhnú roithe agus sciorrtha, brúcha, buillí agus timpistí {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Léitear gach lap freisin le haghaidh conas a láimhsíodh an carr - cá nglasáil roth, cá ndearna na rothaí tiomána sleamhnú, cá ndeachaigh an cúl amach, cá ndeachaigh an tosach ar leithead - mar is iad sin na botúin nach ainmníonn an t-am amháin. Tá trí rud ann a choinníonn é sin ar fud cluichí agus dromchlaí.

**Feictear cá dtagann deireadh le greim ón tiomáint féin an chairr.** Socraíonn innealtóirí tairseach glasála do gach carr ag an sleamhnú a thug an díghéarú is mó (úsáideann cainéil MoTeC i sraith coscánaithe OptimumG `-0,07` do charr amháin), ní ag luach leabhair, agus ní aontaíonn luachanna na leabhar ar aon chuma: buaiceann an fórsa ag 5-20% sleamhnaithe ar tarmac ag brath ar an taior agus ar an tsamhail, ag 6% nó ag 20-60% ar shneachta ag brath ar an bhfoinse, agus ní thugann foinse ar bith ceann do chloch mhín. Scálaíonn cluichí an sleamhnú ar bhealach eile arís: tá sleamhnú Forza "normalaithe" ionas go gcailltear greim thar 1 - ach is féidir le coscáin carr a n-ardfheidhmíocht a thabhairt i bhfad faoi 1 nó i bhfad os a chionn, agus is féidir le crios coscánaithe gnáthach dul thar 1. Mar sin, do gach carr, thar gach lap luchtaithe de, cuirtear an fórsa a rinne sé i gcoinne an tsleamhnaithe a rith sé in ísleabhair - díghéarú i gcoinne chóimheas sleamhnaithe na rothaí faoi choscánú líne dhíreach, luasghéarú (mar chuid den méid a dhéanann an carr ag an luas sin) i gcoinne sleamhnaithe na rothaí tiomána, greim cúinne (mar chuid de ghreim an chairr ag an luas sin) i gcoinne uillinn sleamhnaithe gach aiseanna - agus is é an teorainn an sleamhnú thar an gcéim is fearr áit ar thit an fórsa 8%. Ní bhíonn teorainn ag cuar nach dtiteann riamh sna sonraí - greim cúinne agus tarraingt Forza Horizon - agus ní shamhlaíonn an sleamhnú amháin tada ann. Le sonraí rófhánacha, is é an teorainn aon uair agus leath an buaic ainmniúil.

**Tá an talamh ar eolas do gach sampla**, nuair a deir an cluiche é: cuireann Forza crith ar na taiora ar mhíodar, ar salachar agus ar fhéar (sampla beaga ar chiorcad tarmac, go leor ar salachar agus ar chúrsaí tír-thrasna), aithníonn Trackmania an t-ábhar faoi gach roth, agus faightear talamh stáitse ralaí mar a deirtear in roinn 11. Coinnítear cuair, nósanna drift agus tairseacha ar leith do tarmac agus do thalamh scaoilte.

**Cuirtear gach imeacht i gcomparáid leis an lap eile thar na méadair chéanna.** Ar mhíodar, ar shneachta, i rásaí arcade lán de drift, is é sciorradh an bealach a thiomáintear cúinne: aimsíonn staidéir rialaithe optimach "drift íseal" ar tarmac agus "drift ard ionsaitheach, fiú frithstiúir" as bóthar, sonraí rallaí a thaispeánann taiora "go mór laistigh den réigiún neamhlíneach", agus is féidir glasáil roth ar thalamh an-scaoilte an carr a stopadh níos luaithe fiú. Mar sin, is é an rud atá an lap eile déanta freisin - 80% de nó níos mó - an bealach a thiomáintear an cúinne, ní botún, agus is locht é nach ndearna sé ach amháin má chosain sé am: an t-am caillte ó díreach roimhe go 40 m tar éis dó. Imeacht a mhíníonn 40% nó níos mó de chaillteanas cúinne, is é cúis an chúinne sin é.

Tairseacha braite, an tástáil lap eile, buillí agus timpistí, agus téacsanna na comhairle: [Imeachtaí rialaithe carr](race-control-events.md).

### 6b. Go leor laps: staitisticí an chúrsa {#b-many-laps-the-courses-statistics}

Comparáid aicme, cad a chomhaireofar mar bhotún, na staitisticí agus an léarscáil botún: [Staitisticí cúrsa](race-course-statistics.md).

### 7. An líne tiomáinte {#the-driven-line}

Do gach lap agus cúinne, ó na suímh amháin: cá dtosaíonn sé ag casadh (cúigiú dá lúbthacht is géire), a gha is teannaí (thar ±8 m), an gha mheánach thar an gcéad leath agus an dara leath dá athrú treo, agus mar sin de.

- **cruth**: gha is teannaí thar gha mheánach faoi 0,55 is V é, os cionn 0,75 is U é;
- **buaic**: gha amach thar gha isteach os cionn 1,25 is déanach é, faoi 0,8 is luath é;
- **buaic luais**: má tá a phointe is moille níos mó ná 15 m roimh leath an chasadh is slí isteach mhall, slí amach thapa é; níos mó ná 15 m ina dhiaidh sin, fós ag moilliú thar an lár é.

I gcoinne an lap eile: cé mhéad istigh nó amuigh a rith sé ag tosú an chasadh, tríd an gcuid is teannaí agus áit a raibh an bheirt cothrom, agus cá gcasann gach ceann acu isteach. Cuireann gach breith an líne a oireann do charr an lap ag an gcúinne sin ar fáil - de réir cad a leanann an chúinne isteach ann agus cóimheas cumhacht-greime, tiomáint síos agus tiomáint an chairr atá tomhaiste - agus cé acu an rith an lap é. Liostaíonn an tábla "Cúinne ar chúinne" an lap is tapúla tríd gach cúinne le cruth a líne, agus cuirtear na cúinní is fearr le chéile.

### 8. Dhá léarscáil {#two-maps}

- **Cá**: an cúrsa dathaithe de réir `dΔt/ds` i gcoinne na tagartha, dearg áit a bhfuil am á chailleadh agus glas áit a bhfuil sé á fháil.
- **Cén fáth**: gach caillteanas tarraingthe ar an áit a bhfuil a chúis, dathaithe de réir grúpa na cúise - coscánú, iontráil, slí amach, stráice, carr - agus níos leithne do cheann níos costasaí.

### 9. Athsheinm {#replay}

Clog amháin, trí bhealach chun é a iompú ina am féin do gach lap: ón líne, ar aon líne (gach lap ag sroicheadh pointe amháin den rian ar an nóiméad céanna, agus ansin scaoilte) agus taobh le taobh (gach lap coinnithe ar fhad na tagartha).

### 10. Cén bealach atá an domhan timpeall {#which-way-round-the-world-is}

Tá domhan an fheidhmchláir ceartlámhach le Y suas. Tagann cluiche a bhfuil domhan clé-lámhach aige (Forza ina measc) amach scáthaithe ann: gach lúb dheas tarraingthe mar lúb chlé, cúrsa agus laps araon. Deir na laps é féin - tá an stiúir dheas ar dheis i ngach oiriúntóir, agus comhbhrúann fionraí sheachtrach casadh - agus mar sin tairgeann an cluaisín rása é a shocrú, agus déanann **Ceamara & radharc → Inbhéartaigh ais an domhain** é: X, Y nó Z tarraingthe droim ar ais. Athraíonn an tarraingt amháin - scáthaithe sa mhatrica amhairc; is féidir leis an gceamara eitilt sa domhan tarraingthe;
scáthán sa mhatrica amhairc; agus fanann na sonraí, an anailís agus gach comhordanáid a thaispeánann na huirlisí mar atá sa chluiche féin. Ainmníonn an anailís lúbanna ar chlé nó ar dheis leis an tomhas céanna.

### 11. Ralaí: an sciorradh, an cos chlé, an t-aer {#rally-the-slide-the-left-foot-the-air}

Ní chiorcad a thiomáintear ar ghreim níos measa é stáitse ralaí. Ar mhíodar agus ar shneachta is é an sciorradh an bealach a ghabhtar cúinne: casann an carr ar an mbealach isteach trí a mheáchan a bhogadh - "bogann coscáin meáchan an chairr ar aghaidh ... faigheann na taiora tosaigh greim, cailleann na taiora cúil greim, agus casann an carr ag sciorradh isteach sa chúinne", agus ansin ar ais go dtí an throttle nuair a bheidh sé "ar aon líne sa treo ar mian leat dul" ([DirtFish: conas na coscáin a úsáid](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Déanann an cos clé an coscánú ionas gur féidir an throttle agus an coscán a imirt i gcoinne a chéile; casann an coscán láimhe an carr i gcúinní géara ([RallySport Ontario: tiomáint ralaí, na bunsmaointe](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), agus fágann an carr an talamh. Léann roinn 6 sciorrtha i gcoinne an lap eile cheana féin; iompraíonn na rialacha seo an chuid eile.

- **An talamh.** An méid a deir an lap (`meta.surface`, `--surface` na dtaifeadóirí ralaí), nó ansin ainm na imeachta - na ralaí tarmac (an Spáinn, an Chróatia, an Eoraip Lárnach, an Ghearmáin, an tSeapáin, an Chorsaic, Ypres), na cinn gheimhridh (sneachta), tarmac an Monte le sneachta agus oighear air (measctha) - agus ansin mar a tiomáineadh an carr. Tá teorainn thrasnánach carr Rally2 0,7-0,9 g ar mhíodar agus 1,3-1,4 g ar tarmac ([grenzbereich, luachanna tagartha](https://github.com/GitCrush/grenzbereich)), agus ar mhíodar ritheann sé i bhfad níos mó drift (roinn 6). Mar sin is tarmac é stáitse ar a ndearna an carr 10 m/s² nó níos mó tarraingthe (95ú pórsa, ag luas, ar an talamh) le meán-drift faoi 6 céim ar aon áit a ndearna sé cúinne laistigh de 70% den sin; is scaoilte gach rud eile, nó an rud nach leor sonraí chun a rá.
- **Cad is féidir leis an gcarr a dhéanamh, ar an talamh a ndearna sé é.** Tomhaistear greim, coscánú agus tarraingt (roinn 5) ar thalamh tarmac agus scaoilte ar leithligh nuair a thiomáin na laps cúigiú nó níos mó dá samplaí ar gach ceann, agus meastar gach cúinne leis an talamh faoin gcarr ag a phointe is moille. Fágtar amach na samplaí san aer agus 0,3 s tar éis tuirlingthe ó gach rud a thomhaiseann an carr - imchlúdaigh, cuair taiora, glasáil agus sleamhnú roth - mar cuireann tuirlingt an carr thar rud ar bith is féidir lena thaiora a dhéanamh, agus ní sleamhnú roth iad rothaí a casadh suas san aer. Ní mheastar tiomáint síos ar thalamh scaoilte, mar go bhfuil stáitse gasta agus stáitse mall ina dhá bhóthar éagsúla.
- **Ní coscánú é an cos clé a bhualadh.** Ní socraíonn an coscán beag le throttle ag leath nó níos mó, thar níos lú ná 15 m, an carr nó casann sé é; is é an chéad choscán nach dtagann an throttle ar ais faoi, nó a mhaireann níos faide, an áit a dtosaíonn lap ag coscánú do chúinne.
- **Casadh an carr ar an mbealach isteach.** Do gach lap agus cúinne, an uillinn drift is mó ó a choscán go 5 m tar éis a phointe is moille. Ar thalamh scaoilte, lap a ndearna an carr casadh 8 céim nó níos lú air ná an ceann eile (a chas é 12 nó níos mó) agus a fuair ar an gcumhacht nó faoi chothrom níos déanaí **chas sé an carr níos lú**: is í an chomhairle an throttle a scaoileadh nó an coscán cos clé a bhualadh agus an carr ag casadh chun go dtiocfaidh an cúl thart - leis an bpointe handbrake an lap eile, nuair a d'úsáid sé ceann, nó an coscán láimhe i gcúinne is moille ná 54 km/h - agus go mbeidh sé ag díriú ar an slí amach sula dtagann an buaic. Ceann a chas é 12 céim nó níos mó thar an gceann eile agus a fuair fós ar an gcumhacht níos déanaí **chas sé thar a bhfuil ann**: b'éigean é a dhíreachadh sula bhféadfaí an chumhacht a ísliú. Is cúis na cúinne ar an mbealach amach é ceann ar bith díobh, tar éis locht rialaithe carr. Deir comhairle na líne ar thalamh scaoilte an rud céanna do gach cúinne.
- **An t-aer.** Eitilt 0,2 s nó níos faide ná lap eile a chaill am ó 10 m roimh an éirí ón talamh go 40 m tar éis an tuirlingthe (nó deireadh na cúinne) is cúis í nuair a mhíníonn sé 40% nó níos mó de chaillteanas na cúinne, agus deir an chúinne tar éis sin, a ritheadh níos moille, é sin. San aer ní féidir leis an carr casadh, coscánú ná tiomáint. Coinníonn an chomhairle an throttle ar siúl ag an éirí - "gan an throttle a scaoileadh le linn an éirí", rud a ísleann an srón - agus glacann sí an bárr beagán níos moille nó le coscán beag, ionas go bhfanann an carr íseal ([DirtFish: conas carr ralaí a léim](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Coimpléisc de thrí lúb ar a mhéad.** Ní coimpléasc fada amháin é cuid casta gan a bheith cothrom riamh: tar éis trí lúb tosaíonn ceann nua.

`src/race/rally.test.ts` coinníonn an anailís ar fad seo ar stáitsí a ritheadh le samhail shimplí: carr a chas níos lú agus go déanach ar an gcumhacht, eitilt níos faide, cos clé ag bualadh, cuid casta, tarmac in aghaidh mhíodair.

## Sonraí, agus cad a cheadaíonn gach foinse {#data-and-what-each-source-allows}

| Foinse | Ráta | Cainéil | Ceadaíonn sé |
|---|---|---|---|
| Comhaid lap FH Companion | ~5 m | suíomh, luas, throttle, coscán, stiúir, luasghéarú fada/leathan, gear | gach rud ach rialú carr, a theastaíonn telemetry in aice leo |
| `.tele.gz` FH Companion, in aice le gach comhad lap | 64 Hz an chluiche (scríobhann taifeadóir a choimeádann gach pacáiste ~110 sa soicind; cuirtear na hathrá ar shiúl) | Data Out iomlán Forza: sleamhnú roth de réir rotha, uillinn sleamhnaithe, meascán sleamhnaithe, rothlú, fionraí, torann dromchla; luas fhráma an chairr; ráta giúrach | gach rud, rialú carr san áireamh |
| Forza Data Out, taifeadta ag `heat3d_capture telemetry` | 60 Hz | gach ceann thuas, agus de réir rotha: teocht taoir, sleamhnú roth, uillinn sleamhnaithe, meascán sleamhnaithe, taisteal fionraí, luas rotha, stiall torainn; RPM, cumhacht, tuirse, ráta giúrach | gach rud |
| Assetto Corsa, ACC, AC EVO, AC Rally (cuimhne roinnte, `heat3d_capture telemetry --game ...`) | 60-333 Hz | níos mó ná sin: croí taoir agus teochtaí istigh/lár/amuigh, brúnna, teochtaí coscán, ualaí rotha, cambar, cóimheas agus uillinn sleamhnaithe; luas fhráma an chairr; ABS agus TC ag obair (ACC, EVO, AC Rally) | gach rud |
| iRacing `.ibt`, léite go díreach | 60 Hz | suíomh ó GPS, pedail, stiúir, g, giúrach, teocht corp an rotha de réir rotha, cur-as an damper, brú, caitheamh | gach rud; rialú carr ón uillinn drift (a ghiúrach i gcoinne treo an taistil) agus an stiúir, gan sleamhnú (nach logáiltear) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | de réir fráma; 100 Hz | suíomh, luas domhanda agus aiseanna an chairr, luas phaisteal teagmhála an rotha agus fionraí, pedail, stiúir, clog stáitse agus fad | gach rud; sleamhnú agus uillinn drift díorthaithe |
| Richard Burns Rally (NGP UDP) | de réir céime fisice | suíomh, luasanna an chairr féin, cur-as spring de réir rotha agus fórsa, pedail | gach rud ach sleamhnú roth |
| BeamNG.drive (mód prótacal `heat3d`) | suas le 100 Hz | suíomh, luas domhanda agus aiseanna, luas dromchla de réir rotha, rothlú, ualach agus teagmháil talaimh | gach rud; sleamhnú agus uillinn drift díorthaithe |
| Trackmania (breiseán Openplanet) | de réir fráma | suíomh, luas tosaigh agus taobh, pedail (coscán ar/as), stiúir, comhéifeachtaí sleamhnaithe de réir rotha agus talamh scaoilte, san aer | gach rud; uillinn drift ón luas taobh |

Iompraítear gach foinse ina formáid lap amháin, `heat3d-lap`, a bhfuil a cainéil ainmnithe go canónta (`speed`, `throttle`, `tireTemp[FL]` ...). Tarraingíonn carachtar an chairr agus na cairteacha gach cainéal atá ag lap.

## Foinsí {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Ag luasú do chodanna: cruth an ama éagsúlachta](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta sa raon fada)](https://github.com/taishiliu25/lap-delta-analyzer)
- [treoir anailíse lap iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: laps seisiúin](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: línte rásaíochta a anailísiú](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: am is fearr teoiriciúil ó earnálacha](https://overcut.gg/)
- [Track Titan: conas telemetry a anailísiú](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: anailís coscáin, glasála agus cobhsaíochta KPI (Meán Fómhair 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: ar an throttle (Eanáir 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: príomh-tháscaire feidhmíochta tiománaithe rásaí (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Samhlacha frithchuimilte taior-bhóthair agus sleamhnú optamach (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: frithchuimilte taior-chosáin, sleamhnú ag an mbuaic ar shneachta agus oighear](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: comhéifeachtaí frithchuimilte taiora, buaic agus sleamhnú](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: fórsaí fadaimseartha](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: fórsaí trasnánacha](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Cobhsaíocht feithidle, teorainneacha sleamhnaithe coirp (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Tiomáint ralaí ag sleamhnú ard (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Oibríochtaí ralaí íosaimh-ama (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Ráta giúrach tagartha ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer agus oversteer a bhrath trí stiúir i gcoinne giúrach (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: uillinn stiúir, Ackermann agus gradient an understeer](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: cainéil mhatamaiticiúla (Kus, g comhcheangailte)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: giuirléid understeer agus oversteer](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Coscánú cadence: glasáil ar dhromchlaí an-scaoilte](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: logáil sonraí ralaí chloch mhín](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: conas na coscáin a úsáid](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: conas carr ralaí a léim](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: tiomáint ralaí, na bunsmaointe](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: feithiclí ralaí, luachanna tagartha](https://github.com/GitCrush/grenzbereich)
- [breiseán cleachtaidh drift luas Trackmania (tairiscintí)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [scríbhinn speedslide Trackmania](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: sreafaí coitseála](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: líne an V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Tiomáint stíl tiománaí rásaí saorga a chlaonadh (luas slí amach i gcoinne am íosta)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: seicheamh chun am lap a fheabhsú](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: trí chineál cúinní](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: cúinní a thosaíocht](https://driver61.com/uni/prioritising-corners/)
- [Driver61: cúinní éagsúla, teicnící éagsúla](https://driver61.com/uni/different-corner-technique/)
- [Driver61: sé chéim cúinne](https://driver61.com/uni/corner-phases/)
- [Driver61: greim](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (sliocht)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: cad é carr móiminteam](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [An díospóireacht móiminteam os cionn cumhachta capaill](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matamaitic na líne rásaíochta, cuid 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, cuid 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [teicníc FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [cornaí AWD vs RWD](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Líne rásaíochta](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: teicníc cornaithe](https://www.formula1-dictionary.net/cornering_tech.html)
- [Luas uasta cornaithe](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Foclóir telemetry rásaíochta](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Pleanáil líne íosaimh-ama domhanda ag cur lúbthachta agus faid san áireamh](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: optimú conair rásaíochta domhanda](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: fachtóir rith saor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Réamhrá an chiorcail fhrithchuimilte](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: léaráid g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Sleamhnú fadaimseartha](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, forbhreathnú](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer agus oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out, doiciméadú](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: luasghéarú teorannaithe ag tarraingt](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: luasghéarú teorannaithe ag cumhacht](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO cuimhne roinnte](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Parsáil IBT iRacing](https://github.com/teamjorge/ibt)
