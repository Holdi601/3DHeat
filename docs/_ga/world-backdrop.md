---
title: "Cúlra domhanda"
parent: "Leibhéil agus geoiméadracht chúlra"
nav_order: 5
has_children: true
lang: "ga"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Cúlra domhanda

Cuireann cúlra domhanda an talamh iarbhír faoi thaifeadadh eitilte: cnoic, bóithre, aibhneacha, aerpháirceanna agus foirgnimh, a íoslódáiltear ó shonraí léarscáile saor in aisce. Úsáid é nuair a bheadh taifeadadh Tacview ag snámh thar eangach fholamh ella. Is [leibhéal](glossary.md) é, mar sin suíonn an teas agus na figiúirí air.

## Tóg ceann {#build-one}

1. Luchtaigh taifeadadh eitilte a deir cá bhfuil sé ar an domhan (comhad Tacview `.acmi`), nó ná luchtaigh aon rud agus roghnaigh láthair chatha i gcéim 3. Féach [Sonraí a fháil isteach](getting-data-in.md).
2. Oscail **Cúlra / leibhéal** sa taobhbharra.
3. Brúigh **An fíorshaol mar chúlra** chun an talamh faoi do shonraí a thógáil. Nó roghnaigh léarscáil chluiche i **Láthair chatha** agus brúigh **Tóg cúlra na láithreach catha** (nó **Sruthaigh an láthair**).
4. Fan. Taispeánann an painéal an dul chun cinn (*Tíleanna airde*, *Tíleanna léarscáile*, *Ag tógáil an chúlra*); stopann **Cealaigh** é.
5. Eitil timpeall. Scríobhtar líne an chreidmheasa do shonraí na léarscáile sa bhun ar dheis den radharc.

Íoslódálann an chéad tógáil roinnt déanta mégabheart. Coinníonn an brabhsálaí iad, mar sin ní íoslódálann dara tógáil den cheantar céanna faic. Scriosann **Déan dearmad ar thíleanna léarscáile** iad. Ní thaispeántar an cnaipe **An fíorshaol mar chúlra** ach nuair a iompraíonn na sonraí luchtaithe tagairt gheografach (thíos).

Tógtar gach rud i gcúlobair cúlra ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Cuireann an toradh ionad an leibhéil reatha, agus iompraíonn sé mar aon [leibhéal 3D](model-levels.md): folaíonn sé an teas taobh thiar de, gearrtar é leis an sliús, tá [rialuithe chuma an leibhéil](level-appearance.md) aige, agus is féidir é a shábháil sa [leabharlann](level-library.md).

## Cá bhfuil na sonraí: an tagairt gheografach {#where-the-data-is-the-geographic-reference}

Faigheann tacar sonraí tagairt gheografach ó fhoinse a luann ceann amháin:

- **Taifeadadh ACMI**: `ReferenceLatitude` agus `ReferenceLongitude` a cheannlíne, agus suímh a sheolann an léitheoir ar an bplána a théann don elipsoid WGS84 ansin (X soir, Y thuaidh, méadair; is é an airde ná airde an taifeadta os cionn leibhéal na farraige). Coinnítear an tagairt nuair a ghlacann an mhapáil **X** agus **Y** mar aiseanna talaimh - mar a dhéanann leideanna an taifeadta féin - agus cailltear í nuair a thagann an talamh ó cholún eile ar bith, mar shampla **U** agus **V** comhthoisí cluiche.
- **Tábla Parquet a bhfuil intrá `geo` ina leideanna `heat3d`** - tá táblaí DCS, MSFS, X-Plane agus IL-2 (Tacview) an [Watcher](https://github.com/Holdi601/3DHeat-Watcher) mar shampla. Cuirtear síos ar an iontráil faoi [Do fhorbróirí](#for-developers).

Coinnítear an tagairt nuair a roinntear luchtú de roinnt comhad ach amháin nuair a roinneann siad uile an tagairt chéanna. Ní théann aon luchtaitheoir eile i bhfeidhm air agus ní iompraíonn sé aon cheann.

Teilgtear an cúlra ar an mbealach céanna agus ansin téann sé tríd an mapáil ais an luchtaithe, mar sin tuirlingíonn sé faoi na sonraí cibé athrú nó scála a chuireann an mhapáil i bhfeidhm.

## Láithreacha catha {#theatres}

Liostaíonn an roghnóir **Láthair chatha** na léarscáileanna fíorshaoil de DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) agus IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), agus bosca ar an domhan ag gach ceann ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Is iad boscaí DCS na síneadh a ríomhadh ó na tionscadail fhoilsithe ag na heagarthóirí; is meastacháin iad boscaí IL-2, agus na boscaí DCS a bhfuil sé marcáilte sin orthu, ó mhéideanna foilsithe na léarscáileanna agus na bailte ar a n-imeall - insíonn an painéal cé acu.

**Tóg cúlra na láithreach catha** tógann dhá leibhéal mionsonraí i líontán amháin:

| Leibhéal | Ceantar | Tír-raon | Léarscáil |
|---|---|---|---|
| Láthair | an bosca iomlán | an zúmáil is doimhne suas le 10 a theastaíonn ar a mhéad 64 tíl airde (thart ar 3 km ar an véarsa thar Caucasus, 1 km thar Normandy) | an fharraige, lochanna, clúdach talún agus mótarbhealaí ó 64 tíl veicteora ar a mhéad ag zúmáil 4 go 9 |
| Ceantar mionsonraí | **Faoi na sonraí**, **Timpeall pointe** (domhanleithead, fadlíne, 12 go 400 km), nó dada | suas le zúmáil 12 i 100 tíl ar a mhéad, 500,000 véarsa ar a mhéad | gach rud thíos, ó 1,500 tíl veicteora ar a mhéad ag an zúmáil is doimhne suas le 14 a fhóireann |

Gearrann an ceantar mionsonraí poll i ngreille na láithreach, leathnaithe go cealla iomlána ionas go roinneann an dá ghreille a línte imeall, agus druideann balla tanaí an fuaim áit a samplaíonn siad na haird ar bhealaí éagsúla.

Nuair a bhíonn sonraí luchtaithe tógtar an láthair ar phlána na sonraí, ionas go dtuirlingíonn sí faoin rud atá tógtha. Gan sonraí tógtar í timpeall ar phointe tagartha na láithreach féin (slánuimhreacha céimeanna gar dá ceantar mionsonraí). Athraíonn sonraí a luchtaítear ina dhiaidh sin ar thagairt eile - comhad ACMI a ainmníonn a cheann féin - an cúlra faoina: ríomhtar an t-aistriú beacht idir an dá theilgean ar eangach 256 × 256 thar an gcúlra agus léitear idir na nóid é, laistigh de mhéadar nó dhó trasna láithreach iomlán ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Coinníonn cúlra a sábháiltear sa leabharlann a áit agus bogann sé ar an mbealach céanna nuair a luchtaítear faoi shonraí eile.

### Láthair a shruthú {#streaming-a-theatre}

Taispeánann **Sruthaigh an láthair** an láthair ar an mbealach a dhéanann amharcléirí léarscáile sims eitilte: tagann an talamh mar go leor tíleanna beaga thart ar an gceamara, luchtaithe mar a eitlíonn tú agus scaoilte nuair a bhíonn siad as cúram ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Crann cheathairshleasán de thíleanna Web Mercator.** Clúdaíonn fréamhacha ag zúmáil 5 1,500 km timpeall an cheamara, ionas go sroicheann an talamh thar bhosca na láithreach go dtí an fhíor-chlíne. Scoilt tíl ina ceithre leanaí fad is atá an ceamara níos gaire ná 1,4 uair a leithead, síos go zúmáil 15 (thart ar 1 km an tíl, 15 m idir veirtéacsanna tíre): titeann an mhionsonra de réir an achair mar a thitfeadh sé ar an scáileán.
- **Mogall dá chuid féin do gach tíl**, tógtha i gcúlobair ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): greille tíre 65 × 65 le sciorta timpeall a imeall (ionas nach dtaispeánfaidh comharsanacha ar mhionsonra éagsúil crac riamh), clúdach talún agus an fharraige péinteáilte air, bóithre, iarnróid, lochanna, aibhneacha, aerpháirceanna, rianta eitilte suirbhéaráilte agus foirgnimh anuas air, agus go roghnach pictiúr satailíte a gcearnóg. Tarraingíonn an rindreálaí na tíleanna leis an dearcadh agus na rialacha doimhneachta leibhéil, ionas go bhfolaíonn siad an teas taobh thiar díobh mar aon leibhéal.
- **Garbh ar dtús.** Iarrtar tíleanna garbh agus gar ar dtús, ceithre íoslódáil ag an am in aghaidh foinse; fad is a luchtaíonn leanaí tíle, seasann an tíl ina n-áit, ionas go líonann an radharc ar an toirt agus go ngéaraíonn sé ina dhiaidh sin.
- **Cuimhne**: coinnítear tíleanna tógtha suas le 600 MB, agus scaoiltear an ceann is lú a tarraingíodh le déanaí ar dtús. Fanann **íoslódálacha** sa taisce tíleanna, faoi bhuiséad 2 GB, an sean-cheann ar dtús amach: má eitlíonn tú ar ais thar cheantar ní chosnaíonn sé tada, agus níl aon teorainn in aghaidh an tógála.
- **Sábháilte sa leabharlann** mar an rud a shrutháiltear - an láthair, a roghanna agus a háit ar an domhan - ní mar thíleanna: luchtaíonn sé arís é ag sruthú, ón taisce tíleanna nuair a fhanann na tíleanna ann. Buaileann cliceanna agus an t-iniúchóir na tíleanna mar a bhuaileann siad aon leibhéal.
- Tarraingíonn an dá rindreálaí na tíleanna: seiceáilte taobh le taobh ar GPU fíor (WebGPU agus WebGL2 ar an gcárta céanna), lena n-áirítear teas folaithe taobh thiar de chrios.
- Nuair a bhíonn sonraí luchtaithe tógtar na tíleanna ar phlána na sonraí; athtógann sonraí a luchtaítear ina dhiaidh ar phlána eile iad ansin (ón taisce).
- Tomhaiste ar eitiltí samhlaithe thar trí spota (Normandy, Nevada, Syria): thart ar 63, 45 agus 24 MB ar an gcéad chuairt le híomhánna; ní íoslódálann an dara cuairt faic.

## Cad a thógtar {#what-is-built}

| Cuid | Foinse | Conas |
|---|---|---|
| Íomhánna (láithreacha sruthaithe, roghnach) | EOX Sentinel-2 cloudless 2016 | **Íomhánna satailíte** drapálann an mosáic 2016 gan scamall (thart ar 10 m an picteilín, zúmáil 14, méadaíonn tíleanna níos doimhne é) thar an talamh in ionad an chlúdaigh talún phéinteáilte; fanann bóithre, rianta eitilte, foirgnimh agus ainmneacha ar barr. |
| Íomhánna níos mine (SAM, an Fhrainc) | USGS National Map orthoimagery; IGN BD ORTHO | Le **Íomhánna satailíte** ar, glacann tíl léarscáile ó zúmáil 13 atá go hiomlán laistigh de Stáit Aontaithe na Meiriceá Thuaidh agus de mhórcheantar na Fraince an orthafótagraf náisiúnta ina ionad, dhá zúmáil níos doimhne ná an tíl (sé déag dá tíleanna curtha i bpictiúr amháin, thart ar 1-2 m an picteilín gar dó). EOX in áiteanna eile. |
| Tír-raon (láithreacha sruthaithe) | Mapterhorn | Copernicus GLO-30 i ngach áit (thart ar 19 m an picteilín ag zúmáil 12), méadar-scála áit a bhfuil suirbhé náisiúnta tíre ann (an Fhrainc, SAM agus daoine eile); léitear dhá zúmáil níos garbha ná gach tíl. Tíleanna Tír-raon AWS mura féidir Mapterhorn a bhaint amach. |
| Tír-raon | AWS Terrain Tiles (Terrarium PNG) | Greille airde thar an mbosca: is í an zúmáil is doimhne suas le 12 (thart ar 28 m an picteilín ag 43° N) a theastaíonn ar a mhéad 36 tíl, agus tanaítear an greille go 400,000 véarsa ar a mhéad. Tarraingítear mar thalamh leis na leideanna reatha ardaithe. |
| Bóithre, iarnróid | Tíleanna veicteora OpenFreeMap, sraith `transportation` | Stiallacha comhréidh drapáilte ar an tír-raon, dlúthaithe go spásáil an tír-raoin agus ardaithe cúpla faoin gcéad de ionas nach gcomhraic siad leis. Leithead de réir aicme, ó 16 m (mótarbhealach) go 3 m (rian, iarnród); ní chaolaíonn sé riamh faoi thrasnán an bhosca / 5000. Fágtar cosáin, tráchtlínte agus tollán ar lár. |
| Aerpháirceanna | sraith `aeroway` | Ilghuaiseanna rian, tacsa-bhealaigh, bhalla agus heilipeaid drapáilte mar thalamh; línte rian agus tacsa-bhealaigh mar stiallacha 45 m agus 18 m. |
| Uisce | sraith `water` | An fharraige comhréidh ag 0 m, lochanna agus linne comhréidh ar a gcladach is ísle, aibhneacha drapáilte. Tarraingítear mar uisce: scáthú comhréidh, gan imlíne. |
| Clúdach talún | sraitheanna `landcover` agus `landuse` | Péinteáilte ar veirtéacsanna féin an tír-raoin, gan triantáin bhreise: foraoisí, féar agus páirceanna glas, feirm mar chuid de stráan, talamh bog, gainimh, carraig, oighear; ceantair chónaithe, thionsclaíocha, tráchtála, mhíleata agus chairéil i dathanna múchta. Péinteáiltear uisce faoi dhromchla an uisce freisin, ionas go léitear an chladach ó aon airde. Faigheann talamh lom dath airde ciúin (liath-ghlas íseal, donn ard, sneachta os cionn 3,000 m). Inléite ag rúnlaí an tír-raoin: thart ar 30-45 m sa cheantar mionsonraí, ciliméadair sa láthair. |
| Ainmneacha áiteanna | sraitheanna `place` agus `aerodrome_label` | Cathracha, bailte agus sráidbhailte, agus aerpháirceanna lena gcód ICAO, scríofa thar an radharc; fásann an raon a thaispeántar ar gach cineál de réir airde an cheamara, ar a mhéad 70 ag an am céanna. |
| Rianta eitilte suirbhéaráilte | [OurAirports](https://ourairports.com/data/) `runways.csv` (fearann poiblí) | Roghnach (**Rianta eitilte ó OurAirports**, ar siúl de réir réamhshocraithe): gach rian oscailte a bhfuil an dá cheann sa liosta, ó thairseach go tairseach ag a leithead liostaithe, le stiallacha taobh, líne lárnach bhriste agus barraí tairseacha. Liosta 4 MB amháin, íoslódáilte uair amháin agus coinnithe sa taisce. |
| Foirgnimh | sraith `building` | Bunanna sínte ó `render_min_height` go `render_height` (6 m nuair a bhíonn sé ar iarraidh) os cionn an talaimh is ísle faoina; scipeáiltear codanna `hide_3d`. Tarraingítear mar struchtúir. |

Léitear tíleanna veicteora ag zúmáil 14 (an t-aon zúmáil a bhfuil foirgnimh ann) nuair a theastaíonn ar a mhéad 300 díobh ón mbosca, nó ag an zúmáil is doimhne a dhéanann sin, síos go 8. Faigheann ceantar níos mó tír-raon amháin.

### Cuma {#look}

Tosaíonn cúlra le **Taispeáin dath gafa** ar - is é an dath a insíonn bóthar éadrom ón talamh liath a shíneann sé air, rian dorcha ón gcosán a ghabhann leis - le himill triantán an talaimh as, toisc nach dtugann greille rialta aon eolas, imlínte éadroma, farraige dhoiléir (ní chuirfeadh urlár faoi troidfeadh sé leis an dromchla ar son doimhneachta i bhfad i gcéin), agus foirgnimh liath éadrom agus beagnach soladach, mar a tharraingíonn léarscáil iad. Ní fhaigheann an fharraige oscailte triantáin talaimh ar chor ar bith. Is é cuma réamhshocraithe leibhéal samhla gach rud eile.

## Creidmheasa ar an gcanbhás {#credits-on-the-canvas}

Fad is é cúlra an leibhéal, scríobhtar creidmheas a fhoinsí faoi dheis ar bun an radhairc, gan gá le cliceáil, ionas go n-iompraíonn scáileáin agus físeáin rindreáilte é:

> OpenFreeMap © OpenMapTiles · Sonraí © OpenStreetMap contributors · Airde: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; agus daoine eile

Nascann gach cuid lena leathanach creidiúnaithe foinse (openstreetmap.org/copyright agus an [liosta creidiúnaithe](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) Terrain Tiles). Coinníonn cúlra a sábháiltear sa leabharlann a chreidmheasa agus taispeánann sé arís iad nuair a luchtaítear é. Aistrítear an téacs leis an amharcléirí; ní aistrítear na hainmneacha.

## Foinsí agus a dtéarmaí {#sources-and-their-terms}

Gach foinse, a ceadúnas agus conas a fhanann an cúlra laistigh dá théarmaí: [Cúlra domhanda: foinsí agus téarmaí](world-backdrop-sources.md).

## Taisce na dtíleanna {#the-tile-cache}

Coinnítear gach tíle, agus TileJSON na dtíleanna veicteora, i API Taisce an bhrabhsálaí faoi `3dheat-world-tiles-v1`, de réir URL. Ní dhéanann dara tógáil den cheantar céanna iarratas ar bith agus oibríonn sé as líne: iarrtar TileJSON ar dtús agus, nuair a theipeann air sin, ainmníonn a chóip shábháilte na tíleanna atá coinnithe cheana. Déantar tíleanna nach bhfuil ag an bhfreastalaí (farraige oscailte, 404) a chuimhniú mar as láthair freisin.

Tá a dátaí tógála léarscáile sa URL tíle veicteora, mar sin tar éis do OpenFreeMap tógáil nua a fhoilsiú íoslódálann an chúlra ar dheis tíleanna nua agus fanann na seanchinn go nglanfar iad. Coinnítear an taisce ag 2 GB: ina dhiaidh sin scriostar na tíleanna a stóráladh is faide ó shin ar dtús. Scriosann **Déan dearmad ar thíleanna léarscáile** an taisce ar fad. Teastaíonn bunús slán (`https://` nó `localhost`) ón taisce; in áiteanna eile íoslódálann gach tógáil arís.

## I gcomparáid le Tacview {#compared-with-tacview}

Seiceáilte le súil ar spota amháin i ngach láthair, le taifeadtaí samhlaithe: tagann rothaíocht na seolta ar líne lárnach na rianta tarraingtheacha, tuirlingíonn trasnuithe cósta ar an gcósta. Tá cuid Tacview ó a doiciméadú agus a scáileáin fhoilsithe (tacview.net, a leathanach Steam), ní ó é a rith anseo.

| | Tacview 1.9 | An cúlra seo, sruthaithe |
|---|---|---|
| Síneadh | an domhan iomlán | 1,500 km timpeall an cheamara, cibé áit a bhfuil sé |
| Tír-raon | ETOPO1 (thart ar 1.25 km) tógtha isteach; SRTM 25-75 m mura suiteálann an t-úsáideoir na comhaid; tír-raon DCS onnmhairithe ó DCS | Copernicus GLO-30 (Mapterhorn), méadar-scála sa Fhrainc agus sna SAM |
| Íomhánna | ceann ar bith tógtha isteach; uigeachtaí a íoslódálann an t-úsáideoir (Mapview, SAS Planet, breiseáin cosúil le cairt VFR Caucasus) | EOX Sentinel-2 cloudless 2016, thart ar 10 m, sruthaithe |
| Clúdach talún | níl aon cheann, mura bhfuil sa uigeacht | ó OpenStreetMap, péinteáilte ar an tír-raon (gan íomhánna) |
| Bóithre, iarnróid | níl aon cheann, mura bhfuil sa uigeacht | gach aicme in aice leis an gceamara, príomhbhóithre i bhfad i gcéin |
| Foirgnimh | níl | bunanna sínte in aice leis an gceamara |
| Aerpháirceanna | lipéid agus rianta mar bhoscaí comhréidh, gan marcanna | rianta ó cheanna suirbhéaráilte le stiallacha taobh, líne lárnach agus barraí tairseacha; tacsa-bhealaí, bhallaí; ainmneacha le cóid ICAO |
| Ainmneacha áiteanna | roinnt lipéad sráidbhaile agus cathrach | cathracha, bailte, sráidbhailte, aerpháirceanna, de réir achair agus airde |

Cá bhfuil sé fós ag teip:

- **Réiteach íomhá**: lasmuigh de na SAM agus na Fraince bíonn mosáic an satailít 10 m bog faoi thart ar 2 km; tá Tacview le huigeacht zúmáil-17 a shuiteálann an t-úsáideoir níos géire ansin.
- **Tír-raon i riocht DCS féin**: is féidir le Tacview an tír-raon a onnmhairíonn DCS féin a thaispeáint; anseo is é an talamh iarbhír, a dhéanann difríocht ó thír-raon DCS áit ar athraigh múnlóirí na léarscáile é.
- **Lúbthacht**: is plána comhréidh é an talamh, mar sin ní fíor-ghlúin an fhíor-chrann; tarraingíonn Tacview sphéar.
- **Luas**: tógann an chéad chuairt ar spota tíos mégabheart sula bhfuil sé géar; i mbrabhsálaí rindreáilte bogearraí (na scáileáin) tarraingíonn sé ar an mbeagán fráma sa soicind le roinnt céadta tíle.

## Teorainneacha agus cad a thiocfaidh ina dhiaidh {#limits-and-what-comes-later}

- **Réiteach tír-raoin**: thart ar 30 m ag an mbarr, agus níos garbha i gceantair mhóra. Is é [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFFanna Barr-Optamaithe ar AWS, gan eochair, téacs creidmheasa seasta) an fhoinse níos fearr: 30 m i ngach áit, GLO-90 nuair a bhíonn bearnaí sa GLO-30 (an Airméin agus an Asarbaiseáin, a chlúdaíonn DCS Caucasus). Teastaíonn léitheoir GeoTIFF uaidh agus níl sé in úsáid fós.
- **Tír-raon níos fearr**: ní sheolann Copernicus GLO-30 ar AWS ceanntuairisc CORS, mar sin ní féidir le brabhsálaí é a léamh; is féidir léamh ó scátháin OpenTopography (CORS agus raonta), ach níl a dtéarmaí le haghaidh úsáide ama rite d'aip phoiblí ar eolas - le fiafraí sula n-úsáidtear é. Tá GLO-30 ag Mapterhorn cheana.
- **Lúbthacht**: is plána comhréidh é an talamh agus ní ísltear na hairde do chuar an domhain, ag teacht le conas a leagtar na taifeadtaí (an airde mar airde); i bhfad ón tagairt téann an bheirt chun cinn le chéile, faoi bhun cuid de mhíle ag 100 km. Ní thairgtear lúbadh na dtíleanna amháin, mar bheadh siad scartha ó na sonraí i bhfad i gcéin. Teastaíonn an titim chéanna - an fad ón gceamara cearnaithe thar dhá huair ga an domhain - in gach pas a tharraingíonn suíomh (leibhéal, tíleanna, teas, línte, boscaí, lipéid, roghnú) mar aon uniform comhroinnte amháin; teastaíonn suíomhanna lárnaithe ar an domhan do sonraí fíor-ghlobe chomh maith agus rindreáil choibhneasta ceamara. Tá an dá cheann pleanáilte leis an mód glóbe.
- **An domhan láithreach amháin**: tá léarscáileanna stairiúla DCS agus IL-2 (Normandy 2, The Channel, Germany Cold War, gach léarscáil IL-2) tarraingthe le baile, bóithre agus obair chósta an lae inniu; insíonn an painéal sin. Ní tharraingítear aerpháirceanna na tréimhse.
- **Gan mód glóbe**: is plána áitiúil comhréidh é cúlra. Tá radharc an domhain iomláin pleanáilte.
- Leathnaítear bóithre i gceantair mhóra ionas go bhfanann siad le feiceáil; gar dóibh tá siad níos leithne ná mar atá i ndáiríre.
- Ainmneacha láithreacha DCS i dtáblaí an Watcher meaitseáiltear mar a thugann DCS iad i `mission.theatre`; titeann ainm nach bhfuil ar an liosta siar ar an gcéad sheasamh ciorclaithe go slánuimhreacha céimeanna, agus ar domhanleithead agus fadlíne amháin.

## Léarscáileanna stairiúla (níl tógtha fós) {#historical-maps-not-built-yet}

D'fhéadfadh léarscáileanna na tréimhse na láithreacha stairiúla a uigeachtú níos moille. Is saothair fheidearálta rialtais SAM iad sraitheanna Mhapaí Arm na SAM (AMS), agus meastar go ginearálta go bhfuil siad i bpoiblíocht (seiceáil taifead gach scanadh; is athchlóthanna de bhunsamhlacha GSGS na Breataine nó na Gearmáine iad go leor, a bhfuil a dtéarma cóipchirt Corónach nó oibre gan ainm imithe in éag freisin):

| Láthair | Sraith | Cá scanta |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, An Eoraip Thoir 1:250,000 (curtha le chéile sna 1950idí ó léarscáileanna Sóivéadacha agus Gearmánacha) | UT Austin PCL; cuid de na dreasa georeferenced ag UT GeoData |
| IL-2 Normandy, DCS Normandy 2 agus The Channel | AMS **M661** / GSGS 4250, An Fhrainc 1:50,000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250,000 agus **M841** 1:25,000 (An Ghearmáin) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50,000 (eagráin 1951) agus **L552** 1:250,000 | ANU Open Research (dreasa L751, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | léarscáileanna tranch an Chéad Chogaidh na Breataine (ní AMS) | Ollscoil McMaster; Leabharlann Náisiúnta na hAlban (téarmaí neamhthráchtálacha) |

Tá ticeanna domhanleithead agus fadlíne ag dreasa AMS ag a gcúinní, mar sin chuirfí gach ceann ina áit le fit ceithre-chúinne agus tarraingítear ar an tír-raon mar uigeacht é, tógtha agus coinnithe go háitiúil cosúil leis na tíleanna.

## Do fhorbróirí {#for-developers}

### An iontráil `geo` i dtábla Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

Ainmníonn `east`, `north` agus `up` na colúin a iompraíonn méadair thoir agus thuaidh ar an bplána tangant céanna ag (`lat0`, `lon0`) agus an airde. Iompraíonn an luchtú an tagairt nuair a ghlacann a mhapáil na colúin sin go díreach (thoir mar X, thuaidh agus airde mar Y agus Z ar aon bhealach). Ainmníonn an iontráil roghnach `dcs` méadair féin tábla DCS (x thuaidh, y suas, z thoir) agus a láthair: is trí theilgean Mercator trasnaí na láithreach a chuirtear an luchtú a mhapálann na colúin sin ina háit ([comhordanáidí DCS](#dcs-coordinates)). Léitear tábla gan `geo` mar a léitear roimhe seo.

### Comhordanáidí DCS {#dcs-coordinates}

Is teilgean Mercator Trasnaí é gach láthair DCS (WGS84, scála 0.9996) lena meiridian lárnach féin agus a thionscnamh bréagach, agus is é x DCS an tuaisceart agus z an t-oirthear. Is iad na tairiscintí a fhoilsíonn tionscadal pydcs iad; is é matamaitic shraith Krüger ag an séú ord (Karney 2011), curtha i [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Tógtar cúlra do mhéadair DCS díreach iontu, mar sin roinneann tábla DCS Watcher a léartar trí `dcs_x`/`dcs_y`/`dcs_z`, leibhéal a scríobh tiontaire tír-raoin DCS agus an cúlra an fhráma chéanna. Níl tairiscintí Iraq foilsithe; tá siad feistithe ar phointí tagartha foilsithe (4 cm meán-chearnóg fhréimhe).

Tá tábla DCS an Watcher ar phlána tangant ag pointe tagartha seasta na láithreach (an pointe céanna a úsáideann roghnóir na láithreach, thíos), mar sin cumascann roinnt misean ar láthair amháin lena dtagairt slán agus líneáiltear siad le cúlra láithreach gan bogadh air.

### Simpliú agus buiséad {#simplification-and-budget}

- Scriostar foirgnimh faoi 20 m²; 60 m² nuair a bhíonn an bosca níos mó ná 30 km trasna, 150 m² thar 80 km. Cuirtear an chuid eile leis is mó ar dtús go dtí go sroicheann na foirgnimh 1.5M triantán.
- Scriostar bóithre mionúla, bóithre seirbhíse agus rianta thar 60 km trasna; thar 150 km ní fhanann ach mótarbhealaí, príomh-bhóithre, bóithre príomha agus dara-bhóithre.
- Fanann an cúlra iomlán faoi thart ar 3M triantán. Insíonn nóta an iompórtála cé mhéad foirgneamh a fágadh ar lár.
