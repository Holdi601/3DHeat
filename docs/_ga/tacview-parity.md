---
title: "Comhionannas Tacview"
parent: "Athsheinm cluiche"
grand_parent: "Athsheinm"
nav_order: 1
lang: "ga"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Comhionannas le Tacview

Is clár coitianta é Tacview chun taifeadtaí eitilte a fhéachaint. Má tá aithne agat air, taispeánann an leathanach seo cá bhfuil gach ceann dá uirlisí i 3DHeat.

Liostaítear gach gné de Tacview 1.9 (a lámhleabhar, a thábla téacs comhéadain agus formáid comhaid ACMI 2.2) agus cá bhfuil [athsheinm an chluiche](match-replay.md) 3DHeat ina leith. An aidhm: an rud is féidir le Tacview a dhéanamh do athsheinm agus dá sonraí, is féidir le 3DHeat é a dhéanamh freisin.

**Stádas:**
- **déanta**: tá sé i 3DHeat cheana féin.
- **nua**: tógtha chun gné de Tacview a mheaitseáil.
- **fós gan déanamh**: baineann sé, ach níl sé tógtha.
- **n/a**: ní baineann sé anseo, leis an gcúis.

Cá bhfaightear na gnéithe: an cluaisín **Cluiche**, **Athsheinm figiúirí** (nó **Forleagan figiúirí** sa chluaisín **Léarscáil teasa**), sna hearnálacha de bharra an taobh **Athsheinm**, **Aonaid**, **Imeachtaí**, **Leabharmharcanna**, **Taispeáint thaicticiúil**, **Staitisticí**, **Aistriú ama agus bearradh**, **Léarscáil agus suíomh**, **Fuaim agus físeán** agus **Lipéid**. Féach [Athsheinm cluiche](match-replay.md).

## Ceamaraí {#cameras}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Radharc an chábáin (F5), an léaslíne ag rolladh leis an aerárthach | **Cábán**: amach as an aonad ar feadh a staidiúir, mar atá ag an samhail gluaiseachta. Gearrtar figiúr an aonaid féin ar shiúl. Tarraing chun féachaint thart; athshocraíonn **Féach ar aghaidh arís**. | nua |
| HUD sa radharc an chábáin (rogha IAS/CAS/TAS) | **Taispeáint aníos** (H): léaslíne agus dréimire piche an radhairc iarbhír, marcóir cosán eitilte, téip ceann-treo, IAS, airde, TAS, Mach, G, uillinn ionsaithe, luas ingearach, AGL | nua |
| Ionstraimí 3D an chábáin, rianú cinn an phíolóta (PilotHead*), TrackIR | Gan samhlacha cábáin; taispeántar uillinneacha an chinn sa radharc **Amh** de chárta an aonaid | n/a (gan samhlacha cábáin; tá an rianú cinn le haghaidh eitilte beo) |
| Radharc seachtrach (F6): fithis timpeall an phríomh-rud | **Tóir** (casann sé leis an aonad) agus **Fithis** (coinníonn sé a threo féin) | déanta |
| Ceamara comhraic, "Féach ar an sprioc" (glas) | **Glas**: ón gcábán, coinnithe ar an sprioc | nua |
| Ceamara comhraic, "Lárnaithe" / "Féach ar aghaidh" | **Sprioc**: taobh thiar den aonad ar an líne ón sprioc, ag féachaint thar an sprioc ar an sprioc. **Seasta** ag azimut 0 féachann sé ar aghaidh ó thosach. | nua |
| Malartaigh príomh- agus tánaiste-rud | **Malartaigh** in aice leis an sprioc | nua |
| Radharc satailíte (F7), barr-thuas orthagrafach | **Satailít**: díreach síos ar an aonad, an tuaisceart in airde; tarraing chun casadh. Is é an plean orthagrafach an mapa 2D. | nua |
| Ceamara saor (F8), W/A/S/D, E/C | An ceamara eitilte saor (W/A/S/D, Spás/Q, Shift/Alt) | déanta |
| Breiseán Head-On camera; ceamara seachtrach seasta leis an réad | **Seasta**: áit timpeall an aonaid a chasann agus a rolladh leis; tarraing chun é a bhogadh (taobh thiar, ag bun sciathán, ceann le ceann) | nua |
| Breiseán Lock Camera (an suíomh a reo) | Stop ag leanúint (Esc): fanann an ceamara san áit a raibh sé | déanta |
| Radharc straitéiseach (zúmáil amach go dtí an Domhan ar fad) | [Cúlra an domhain](world-backdrop.md) agus fráma an taifid iomláin ar an mapa 2D | déanta |
| Socrú réimse amhairc | Réimse amhairc **Ceamara agus radharc** | déanta |
| Radharcanna a athrú le heochracha | **V** an chéad radharc eile, **Shift+V** ar ais | nua |

## Taispeáint 3D agus roghanna taispeána {#d-view-and-display-options}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Rianta ribín, sleamhnán fad | Rianta (soicindí) sa Amharcán Foirne | déanta |
| Rian ionchasach (cosán romhainn) | **Cosán romhainn**: cá dtéann an aonad i ndáiríre sna soicindí atá le teacht | nua |
| Línte airde an réada / ballaí | **Línte ingearacha** | déanta (línte; ballaí gan tógáil) |
| Veicteoirí réada roghnaithe: ceann-treo (ponc), cúrsa (líne réidh), ardú | **Veicteoirí luais** (cúrsa agus luas ar feadh an oiread soicind, le leid) agus **Línte srón agus ardaithe** (srón lánscoiteach, ardú gearr agus dorcha) | nua |
| Líne radhairc an phíolóta | **Líne radhairc an phíolóta**: líne cyan lánscoiteach feadh PilotHeadYaw/PilotHeadPitch (nó colún HeadYaw, ViewYaw nó LookYaw) in aghaidh ais an aonaid | nua |
| Fáinní raon marfach SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, dhá "2") | **Limistéir ionsaithe**: fáinní, ovaid nuair a bhíonn raon ingearach difriúil, as nuair a bhíonn EngagementMode 0 | nua |
| Glais radair (LockedTarget..9) le lipéid | **Glais**: línte dearga go gach réad faoi ghlas; dearg lánscoiteach go FocusedTarget; feadh LockedTargetAzimuth/Elevation/Range nuair nach ainmnítear réad. **Lipéid ghlais**: ainm agus raon na sprice ar gach líne ghlais | nua |
| Cón radair (RadarMode, Azimuth, Elevation, Roll, Range, leithead trabhaí) agus geata raoin | **Cón radair**: imeall agus fáinne lár an trabhaí, casta ag azimut, ardú agus rolladh in aghaidh an aonaid; geata an raoin mar dhá imeall bhuí. Gan leithead trabhaí, ais an trabhaí amháin. | nua |
| Líne radhairc idir an dá réad roghnaithe (glas / dearg ponc nuair a bhlocálann an talamh) | Casann líne na péire tomhaiste dearg agus lánscoiteach nuair a bhíonn an leibhéal eatarthu | nua |
| Réada i bhfad uainn a mhéadú go huathoibríoch | An figiúr is lú ar an scáileán (picteilíní) | déanta |
| Greille domhanleithead/domhanfhad | **Léarscáil agus suíomh → Greille**: línte domhanleithead agus domhanfhad ar an talamh faoin gceamara, ar spásáil chruinn de réir airde (10° síos go 1'), lipéadaithe; nó greille kilaiméadar **MGRS** de chrios UTM, leis an gcrios agus an cearnóg 100 km ar taispeáint. Greille an mhapa 2D mar a bhí | nua |
| Fáinní bullseye | Fáinní timpeall bullseye gach foirne ar an mapa 2D | nua (2D amháin) |
| Forleagan glideslope | **Fánaí tuirlingthe**: cosáin 3° leis na imeall lánscála ±0.7° ar an dá cheann de gach rúidbhealach gar don taifead, ó na tairseacha agus na hairde suirveáilte ó OurAirports (íoslódáilte uair amháin, coinnithe as líne), tic ag gach míle mhara, ainmnithe de réir aerfort agus rúidbhealaigh | nua |
| Srianta airde (aláram urláir/síleála) | **Srian airde**: urlár agus síleáil; lipéid aonaidí lasmuigh ag casadh dearg, agus liostaítear gach trasnú (faoin urlár, thuas ar an tsíleáil, ar ais istigh) - téann cliceáil ann agus leanann an aonad | nua |
| Réada scriosta liath, bainte tar éis 15 nóiméad | Críochnaíonn saolta lena rian; déantar aonad marbh a dhorchú sa liosta aonaidí | déanta |
| Airíonna Infheicthe / Díchumasaithe | Taispeántar in **Amh**; ní cheiltear aon rud leo | fós gan déanamh |
| Taispeáin suíomhanna maidhme/throttle/pedal | Luach an throttle agus an innill i bpáirceanna; ionchuir rialaithe in **Amh** | déanta (mar luachanna) |
| Tráchtanna mar fhotheidil | **Teachtaireachtaí mar fhotheidil** (Lipéid): imeachtaí ACMI Message agus Comment, agus comhrá ó aon chluiche (imeachtaí Chat, Say nó Radio, nó colún comhrá), ag bun an radhairc leis an duine a dúirt é, ar feadh sé soicind | nua |
| Taispeáint dáta agus am UTC | Clog amlíne le UTC nuair a bhíonn am tagartha ag an taifead | déanta |
| Suíomh luchóige domhanleithead/domhanfhad, MGRS, bullseye | Cárta an phiocaidh (cliceáil pointe) tugann domhanleithead/domhanfhad i gcéimeanna, nóiméid agus soicindí agus MGRS in aice le méadair an domhain; bullseye in aghaidh an aonaid (páirc) | nua |
| Lógó saincheaptha | Gan tógáil | n/a (branda) |
| Samhlacha 3D, is gaire nuair nach eol | Bailiúchán figiúirí féin, an comhghuaisí is gaire, méid fíor | déanta |
| Comhraic iolracha (línte idir gach péire) | **Línte comhraic**: ó gach aonad sa raon go gach céile laistigh den raon socraithe (1-200 km), gach ceann lena raon, na 60 péire is gaire; an péire tomhaiste mar a bhí | nua |

## Lipéid {#labels}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Lipéid ar/as, ar leithligh do réada roghnaithe agus neamhroghnaithe | **Lipéid** le rialacha do **Roghnaithe**, **Aerárthaí**, **Talamh**, **Longa**, **Arm** agus **AI**: taispeánta nó nach ea, luachanna féin, tosaíocht | nua |
| Páirceanna lipéid: ainm, comhartha glaoch, píolóta, luasanna (TAS/CAS/IAS/Mach/GS), airde (ASL/AGL), VS, AOA, AOS, G (ingearach, cliathach, fadlíneach), ráta casaidh agus ga, fuinneamh, meáchan/toirt/sreabhadh breosla, ceann-treo/rian, rolladh/piche, ritheadh croí | Gach luach de `fields.ts`: an liosta céanna, ríomhtha nuair nach taifeadadh é (meastacháin marcáilte ~). Ráta rolladh agus SpO2 ach trí Amh. | déanta |
| Suíomh an aonaid sna lipéid | Páirc **Bullseye (treo / raon)** | nua |
| Éalúchtaí ILS, fad eitilte | Luachanna Amh; fad eitilte sna staitisticí | déanta (go páirteach) |
| Teilimeatracht neamhroghnaithe a shoiléiriú | **Coinnigh na lipéid óna chéile**, ordaithe de réir tosaíocht gach rialach | déanta / nua |
| Lipéadaigh gach réad talún / na bagairtí amháin | Rialacha Talamh agus AI | nua |
| Scála lipéad | **Méid na lipéad** (60-250 %) | nua |
| Aonaid mheittreacha / impiriúla | Méadrach / impiriúil | déanta (dhá réamhshocrú, ní ocht) |

## Faisnéis réada agus teilimeatracht {#object-info-and-telemetry}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Príomh- agus tánaiste-roghnú | Cliceáil leanann agus roghnaíonn; cliceáil dhá cheann le tomhas a dhéanamh; roghnóir **Sprioc** | déanta / nua |
| Raon / treo / aispeict / dlúthú idir dhá réad | Líne BRAA na péire tomhaiste; páirceanna Raon, Treo, Aispeict agus Dlúthú ón aonad leantar | déanta |
| Treo coibhneasta, ráta LOS | Páirceanna **Treo coibhneasta** (ó shrón an aonaid leantair, L/R) agus **Ráta na líne radhairc** (°/s) | nua |
| Fuinneoga teilimeatrach | Cárta an aonaid agus cárta na luchóige | déanta |
| Teilimeatracht amh (gach airí taifeadta, fiú iad siúd nach eol) | **Amh** i gcárta an aonaid: gach colún ar líne an aonaid mar a scríobhadh é | nua |
| Liosta réada gníomhacha | **Aonaid**: imreoirí, AI, arm ar eitilt, na cinn bheo geal | déanta |
| Fuinneog airíonna taifid (teideal, údar, brífeáil...) | Coinnithe mar cholún RecordingInfo; taispeántar in Amh | déanta (gan fuinneog) |
| Formáidí suímh DMS/MGRS, tuaisceart maighnéadach | **Suíomh (domhanleithead / domhanfhad)** i DMS agus i bpáirceanna **MGRS**; páirc **Treo maighnéadach**; **Treonna maighnéadacha** scríobhann ceann-treo, cúrsa agus treo maighnéadach (°M) agus taispeánann sé compás leis an dá thuaisceart agus an athrú - an World Magnetic Model 2025 (comhéifeachtaí fearainn phoiblí), ríomhtha anseo ag ionad agus dáta an aonaid | nua |

## Gráficí {#charts}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Gráf de réad amháin, suas le 4 luach | **Thar am** (agus an gráf faoi Athsheinm) | déanta |
| Plota suas le 4 réad ag an am céanna | **Comparáid**: luach amháin de suas le 8 aonad ar scála amháin | nua |
| Luach in aghaidh luacha (stíl inmhianaitheachta fuinnimh) | **Luach in aghaidh luacha**: ráta casaidh in aghaidh luais nó aon phéire, gach aonad mar líne, a phointe reatha marcáilte | nua |
| Ais X de réir ama; zúmáil; scrúdú ama ón ngráf | Zúmálann an roth in am, déanann cliceáil dhúbailte athshocrú, téann cliceáil chuig an nóiméad | nua |
| Ais X de réir fad aeir nó talún | **Am / Fad aeir / Fad talún** ar ghraif Am agus Comparáid; oibríonn zúmáil agus cliceáil-chun-dul mar an gcéanna | nua |
| Gráif réamhshocraithe (fuinneamh, luasghéarú...) | Is féidir aon luach a roghnú (is luachanna iad airde fuinnimh agus a ráta) | déanta |

## Staitisticí, dialann eitilte, imeachtaí {#statistics-flight-log-events}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Dialann eitilte: tógadh, tuirlingeadh, lasadh, buaileadh ag, scriosadh ag, fágadh an limistéar | **Staitisticí** in aghaidh an aonaid: saolta, maruithe, básanna, lámhachtaí, buailte, cóimheas buailte, éirí de thalamh, tuirlingintí, am san aer, G uasta (agus íosta), luas uasta, airde agus Mach, fad. Tagann éirí de thalamh ó imeachtaí TakenOff/Landed, OnGround, AGL, nó meastachán marcáilte ~. | nua |
| Breiseáin scórchláir agus tuairisce misin | Achoimre in aghaidh foirne agus na maruithe is mó; scórchlár féin an achoimre chluiche | nua / déanta |
| Easpórtáil dialann eitilte XML/CSV | **Easpórtáil CSV** ar na staitisticí, agus ar na himeachtaí mar atá liostaithe | nua (CSV amháin) |
| Easpórtáil teilimeatrach CSV ag ráta | **Teilimeatracht an aonaid roghnaithe**: gach luach, 1-20 in aghaidh an tsoicind | nua |
| Logchomhad imeachtaí, cliceáil faoi dhó le dul ansin agus roghnú | Liosta **Imeachtaí**, scagtha de réir cineáil agus aonaid; cliceáil eitlíonn sé ansin | déanta |
| Imeacht roimhe / ina dhiaidh (Ctrl+←/→) | **Page Up / Page Down** | nua |
| Sos ag imeacht | **Sos ag imeacht** | nua |
| Marcóirí amlíne (scaoileadh, buillí, scriosadh; an réad roghnaithe i gorm; leabharmharcanna dearg) | Maruithe agus básanna mar bharra dlúis, an t-aonad leantair i gorm, leabharmharcanna dearg; cliceáil le dul | nua |
| Imeacht a bhaint, maraigh-bain | Gan tógáil | n/a (is leis an taifead na himeachtaí; cuireann scagairí i bhfolach iad) |

## Leabharmharcanna {#bookmarks}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Leabharmharc a chur isteach le roghnú agus pointe amhairc | **Cuir leabharmharc leis** (B): an nóiméad, an ceamara saor nó an t-aonad leantair lena radharc, fad agus sprioc; ainmnithe; coinnithe sa bhrabhsálaí seo in aghaidh an taifid | nua |
| Leabharmharc a bhaint | × sa liosta | nua |
| Leabharmharcanna ar an amlíne agus sna logchomhaid | Marcanna dearga; an liosta | nua |
| Event=Bookmark in ACMI | Liostaithe faoi mharcanna an taifid, le maruithe, básanna agus teachtaireachtaí | nua |
| Aicearra cóipeáil/greamaigh (radharc a roinnt) | **Easpórtáil / Iompórtáil** na leabharmharcanna mar chomhad; cóipeálann C staidiúir an cheamara | nua |

## Athsheinm {#playback}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Seinn/sos, go tosach, luas, scrúdú amlíne | Amlíne | déanta |
| Fráma ar fhráma | **,** agus **.** soicind siar agus ar aghaidh (Shift: deich) | nua |
| Athsheinm ar gcúl | **◀** ar an amlíne, **J** (**L** ar aghaidh; an eochair chéanna arís sos): seinneann ón deireadh go dtí an tosach ar an luas roghnaithe, ag lúbadh nó ag stopadh ag an tosach | nua |
| Dialóg léim ama | An amlíne agus liosta na n-imeachtaí | déanta |
| Aistriú ama réad amháin (taibhse) | **Aistriú ama agus bearradh**: bog eitilt aonaid amháin, nó taifead iomlán, faoi chomh mórán soicind; **Ailínigh na taifid** bogann cúpla taifead go tosú le chéile agus seinneann siad ag an am céanna (dhá sorties ó lá éagsúil taobh le taobh). Atógtar an taifead, mar sin leanann rianta, imeachtaí, gráif agus staitisticí | nua |
| Bearradh roimh/i ndiaidh | **Ó anois / Go dtí anois / Gearr go dtí an spás seo** (cealaíonn an aisghabháil na haistrithe), ansin **Easpórtáil CSV** (lódálann ar ais i 3DHeat) nó **Easpórtáil ACMI** (téacs Tacview 2.2, do thaifead a chuirtear ar an domhan) | nua |

## Talamh agus léarscáil {#terrain-and-map}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Fíor-thalamh, airde saincheaptha agus uigeachtaí | Leibhéil (léarscáil an chluiche féin mar mhúnla 3D), tíleanna chúlra an domhain | déanta |
| Modhanna talún cothrom / folamh / ard-chodarsnachta | [Cuma an leibhéil](level-appearance.md): faoisimh an talaimh, dromchla agus struchtúir taispeánta nó nach ea | déanta (ní na modhanna céanna) |
| Léarscáil taicticiúil 2D (níl ag Tacview ceann: radharc satailíte) | **Mapa 2D**: cúinne nó radharc iomlán, siombailí de réir cineáil agus foirne (imreoirí líonta, AI imlíneáilte) casta ar a gceann-treo, rianta, ainmneacha, barra scála, fáinní raoin timpeall an aonaid leantair, fáinní bullseye, áit cheamara 3D, básanna le déanaí; tarraing, roth, cliceáil le leanúint (M) | nua |
| Réada statach (aerfoirt, rúidbhealaigh, pointí bealaigh, limistéir, KML) | Rúidbhealaigh suirveáilte (OurAirports) i gcúlra an domhain agus a bhfánaí tuirlingthe; pointí bealaigh GPX agus pointí KML ualaithe mar réada seasta; [Clár na dtaictící](tactics-board.md) tarraingíonn limistéir agus bealaí | nua |

## Iompórtáil, easpórtáil, taifeadadh {#import-export-recording}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| ACMI téacs agus zip | [Tacview ACMI](tacview-acmi.md) | déanta |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (rianta, bealaí, pointí bealaigh; cróga croí, cadence, cumhacht, teocht Garmin), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC agus GGA de aon chainteoir, seiceálfar suimeanna seiceála, thar mheán oíche), **IGC** (taifid B, dáta, píolóta agus gleider), **FIT** (teachtaireachtaí taifid, stampaí ama comhbhrúite) - gach ceann curtha ar an bplean de réir domhanleithead agus domhanfhad ag lár na rianta, ionas go mbíonn cúlra an domhain ceart; ceann-treo, claonadh agus luas ón gcomhad nó ó phointe go pointe. CSV agus Parquet mar a bhí | nua (DIS n/a: prótacal líonra beo) |
| Taifeadáin dhúchais (DCS, BMS, IL-2, MSFS...) | Tiontóirí dúchais 3DHeat (War Thunder, CS2, Squad, Arma agus eile) | déanta (dúchasach) |
| Teilimeatracht fíor-ama thar TCP, ADS-B | Gan tógáil | n/a (athsheinmeanna tar éis an chluiche) |
| Fuaim/físeán sioncrónaithe | **Fuaim agus físeán**: seinneann comhad áitiúil, sosann, cuardaíonn agus athraíonn luas leis an amlíne ó thosach socraithe (**Tosaíonn anois**, ±0.1 s); físeán i bpainéal inathraithe thar an radharc, nó pictiúr-i-bpictiúr. Fanann an comhad sa bhrabhsálaí | nua |
| Easpórtáil físeáin | [Conair ceamara agus físeán](camera-path-and-video.md) | déanta |

## Eile {#other}

| Tacview | 3DHeat | Stádas |
|---|---|---|
| Breiseáin Lua | Gan tógáil | n/a (foinse oscailte: athraigh an amharcán féin) |
| Dí-bhriefeáil ar líne (seisiún roinnte) | Gan tógáil | n/a (is seisiún óstáilte é ag Tacview a choinníonn gach duine ar an gceann céanna cheann seinnte. Níl freastalaí ag 3DHeat agus coinnítear taifid ar mheaisín an amharcáin, agus teastaíonn freastalaí comharthaíochta fiú le nasc peer-to-peer. Roinntear dí-bhriefeáil mar chomhaid: an taifead bearrtha (Easpórtáil ACMI nó CSV) agus comhad na leabharmharcanna, a oscailtear ag na nóiméid chéanna agus na radhairc chéanna) |
| Rialú iargúlta ag teagascóir | Gan tógáil | n/a (rialaíonn sé comhfhorbróir atá ag rith) |
| Eagarthóireacht réada (réada a chur leis, a chur in eagar, a bhaint) | [Clár na dtaictící](tactics-board.md) do réada pleanáilte; tá taifid inléite amháin | n/a |
| Teangacha | 40 teanga | déanta |
| Fíordheimhniú taifead | Gan tógáil | n/a |

## Do fhorbróirí: airíonna ACMI 2.2 {#for-developers-acmi-22-properties}

Léite ag `data/acmi.ts`; bíonn airíonna uimhriúla ina gcolúin uimhreacha, agus bíonn airíonna téacs ina gcolúin catagóire. Taispeántar iad uile faoi **Amh** i gcárta an aonaid. Léitear iad seo ar chúis:

| Airíonna | Úsáid |
|---|---|
| T (na ceithre fhoirm go léir), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Suíomh, staidiúr, figiúr, ainm an aonaid, foireann |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Páirceanna, gráif, HUD, brath éirí de thalamh agus tuirlingthe |
| VerticalGForce, LongitudinalGForce, LateralGForce | Páirceanna G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Páirceanna |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Páirceanna breosla, suimithe thar na tanceanna |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Cóin radair agus geata raoin |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Línte glasa |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Fáinní ionsaithe |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Páirceanna |
| Health | Páirc |
| Imeachtaí: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Liosta imeachtaí, staitisticí (básanna, éirí de thalamh, tuirlingintí), leabharmharcanna; Message agus Comment mar fhotheidil |
| PilotHeadYaw, PilotHeadPitch | Líne radhairc an phíolóta |
| Clib cineáil Bullseye (Navaid+Static+Bullseye) | Páirc bullseye agus fáinní léarscáile |
| Gach rud eile (PilotHeadRoll, rialuithe, dromchlaí, éalúchtaí ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, méideanna...) | Taispeántar mar a scríobhadh faoi **Amh** |

Glactar le huillinneacha radair agus glais i gcoinne ais féin an aonaid: azimut chun na láimhe deise, ardú suas, rolladh deis síos. Deir sonraíocht ACMI go bhfuil siad coibhneasta leis an aerárthach ach ní deir sí cén treo is dearfach; leanann an léamh seo a chlaochlú (giotán deiseal, piche suas, rolladh deis).
