---
title: "Lapaí á lódáil"
parent: "Anailís rása"
nav_order: 51
lang: "ga"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Cuairteanna a lódáil

Is taifead de thiomáint amháin é comhad lap: cá raibh an carr agus cad a rinne an tiománaí, arís agus arís eile sa soicind. Luchtaigh dhá lap nó níos mó den chúrsa céanna agus is féidir leis an gcluaisín **Anailís rása** iad a chur i gcomparáid.

![Chuid na Cuairteanna den chluaisín Anailís rása le trí chuairt shampla luchtaithe: liosta na gcuairteanna, réalta na tagartha, an fócas](../assets/img/en/race-loading-laps-list.webp)

## Do chéad chuairteanna {#your-first-laps}

1. Oscail an cluaisín **Anailís rása**.
2. Ag breathnú amháin? Brúigh **Cuairteanna samplacha** (féach [Cuairteanna samplacha](#demo-laps)).
3. Do chuairteanna féin: taifead iad sa chluiche le taifeadóir (féach [Formáidí comhaid](#file-formats)). Scríobhann an taifeadóir comhad amháin do gach lap.
4. Brúigh **Lódáil comhaid chuairte…** agus roghnaigh dhá chomhad nó níos mó den chúrsa céanna, nó brúigh **Fillteán…** agus roghnaigh an fillteán a choinníonn iad. Is féidir leat comhaid nó fillteáin a scaoileadh ar an radharc 3D freisin.
5. Cliceáil lap sa liosta chun a fheiceáil cá gcailleann sé am.

**Rabhadh: déantar cuairteanna a chur i gcomparáid ar chúrsa amháin ag an am.** Glanann cuairt de chúrsa ainmnithe eile na cuairteanna a bhí luchtaithe cheana.

## Na cnaipí {#the-buttons}

| Rialaithe | Déanann sé |
|---|---|
| **Lódáil comhaid chuairte…** | roghnóir comhad do chomhaid `.json`, `.csv`, `.txt`, `.ibt`, `.gz` agus `.h3dcars`, cúpla ag an am (is comhad carr é `.h3dcars`, féach [Carranna](race-replay-and-scene.md#the-cars)) |
| **Fillteán…** | roghnóir fillteáin: gach comhad lap sa fhillteán agus faoi |
| **Cuairteanna samplacha** | trí chuairt shamhlaithe de chiorcad samhlaithe (féach [Cuairteanna samplacha](#demo-laps)) |
| **Glan** | baintear gach lap (le feiceáil nuair a bhíonn cuairteanna luchtaithe) |
| scaoil ar an radharc | comhaid agus fillteáin iomlána a scaoiltear ar an radharc 3D luchtaítear ar an mbealach céanna iad |

Cuirtear cuairteanna **leis** na cinn a luchtaíodh - **mura bhfuil siad de chúrsa ainmnithe eile: ansin glantar na cuairteanna luchtaithe ar dtús** (déantar cuairteanna a chur i gcomparáid ar chúrsa amháin ag an am). Liostaítear comhaid nach féidir a léamh faoi na cnaipí, líne amháin do gach ceann; luchtaítear na cinn eile fós.

## Formáidí comhaid {#file-formats}

Aithnítear an fhormáid ón ábhar, ní ón ainm comhaid. I bhfocail shimplí:

- Is é **heat3d-lap** an comhad a scríobhann taifeadóir 3DHeat do an chuid is mó de na cluichí.
- Is uirlis saor in aisce é **FH Companion** a thaifeadann cuairteanna Forza Horizon. Scríobhann sé comhad lap agus, in aice leis, comhad `.json.tele.gz` (an lap céanna le sonraí gach taoir, comhbhrúite le gzip). Roghnaigh an dá cheann le chéile.
- Is comhad telemetry féin de chuid iRacing é **iRacing `.ibt`**; cas an logáil air sa charr le Alt+L agus luchtaigh an comhad mar atá sé.
- Is tábla simplí é **CSV lap**, líne amháin do gach nóiméad.

| Formáid | Foinse nodanta | Léite ag |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon agus Motorsport thar Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion lap `.json` | leabharlann laps FH Companion | `fromFhCompanion` |
| Telemetry FH Companion `.json.tele.gz` | in aice le gach comhad lap FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | comhaid telemetry iRacing féin (logáil ar siúl le Alt+L sa charr) | `readIbt` |
| CSV lap | `heat3d_capture laps`, breiseán Trackmania, nó aon CSV le `x`, `z`, colún ama agus colún `lap` de rogha | `fromCsv` |

Déanann na taifeadóirí cur síos ar conas a thaifeadtar gach cluiche agus cad a sheolann sé:
[GameCapture: cluichí](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
agus [GameCapture: an formáid lap](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Féach freisin [Cluichí rásaíochta eile](other-games.md).

## Fillteáin agus cúrsaí {#folders-and-courses}

**Fillteán…**, nó fillteán scaoilte, tugann sé gach comhad faoi. Taobh istigh de fhillteán ní bhreithnítear ach comhaid a chríochnaíonn le `.json`, `.csv`, `.txt`, `.ibt` nó `.tele.gz`, agus scipeáiltear `.json` nach lap é (comhad féin cúrsa, a léarscáil) gan earráid.

**Cúrsaí éagsúla i roghnú amháin.** Coimeádann leabharlann lap FH Companion gach cúrsa i bhfillteán darb ainm `<ainm cúrsa> (course_<x>_<z>_to_<x>_<z>)` (nó `course_...` nocht do chúrsa gan ainm). Nuair a bhíonn na comhaid roghnaithe i níos mó ná fillteán cúrsa amháin den sort sin, ní luchtaítear aon rud; ina ionad sin deir an chuid **Cuairteanna** "Is cuairteanna de N chúrsa iad seo, agus déantar cuairteanna a chur i gcomparáid ar chúrsa amháin ag an am. Roghnaigh ceann:" agus liostaíonn sé gach cúrsa lena líon laps (comhaid a chríochnaíonn `.json`, `.csv` nó `.ibt`, gan `course.json` a áireamh), na cuairteanna is mó ar dtús. Cliceáil ar cheann acu agus luchtaítear comhaid an chúrsa sin.

Eochair cúrsa is ainm agus pointe **tosaigh** é, ní a chríochnaithe: coimeádann FH Companion rithí nár chríochnaigh riamh faoin ainm agus an tosach céanna (in `unfinished/`), agus an áit ar stop siad mar chríochnú, agus téann siad lena gcúrsa - marcáilte **páirteach** sa liosta.

**Roinnt rianta i measc comhaid roghnaithe.** Nuair is cuairteanna de níos mó ná rian ainmnithe amháin iad comhaid a roghnaíodh go díreach (gan ó fhillteáin chúrsa), tairgtear an rogha chéanna do gach rian; téann cuairteanna nach ainmníonn rian ar bith leis an rian a roghnófar.

## Ainmneacha carr {#car-names}

Tugtar ainm iomlán a chairr ar lap, mar a thugann an cluiche é. Nuair nach ainmníonn an comhad lap an carr:

1. **An fillteán.** Coimeádann leabharlann FH Companion laps i `<course>/<class>/<car name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json`. Tugann an fillteán is istigh a mheaitseálann `<name> (car<number>)` an t-ainm agus an uimhir; ceann a mheaitseálann `car<number>` an uimhir amháin. Ní iompraíonn ach roghnuithe fillteáin agus fillteáin scaoilte an conair seo.
2. **Lap eile den charr céanna.** Nuair a ainmníonn aon lap carr, tugtar an t-ainm sin ar gach lap a bhfuil an cluiche agus uimhir an chairr chéanna aige - na laps luchtaithe le chéile, agus laps a luchtaítear ina dhiaidh sin sa bhrabhsálaí seo: coimeádtar na hainmneacha i `localStorage` faoi `heat3d.carNames` (eochair `<game>:<car number>`). I bhfuinneog phríobháideach maireann siad chomh fada leis na cuairteanna.
3. Seachas sin "car 1234" de réir a uimhreach, nó "car".

**Lipéid.** Sa liosta cuairte taispeánann lap ainm a chairr; uimhrítear roinnt laps den charr céanna mar "Ainm #1", "Ainm #2". Úsáideann abairtí na hanailíse na lipéid chéanna nuair a bhíonn siad uathúil; murab ea, ainm an chairr leis an am lap, "Ainm (1:29.616)" (amanna samplacha), agus uimhrítear níos mó fós má tá siad fós gan uathúlacht.

**Grúpáil.** Baineann laps leis an gcarr céanna (le haghaidh imchlúdaí, próifílí agus comparáidí) nuair a bhíonn a uimhir chairr - nó a ainm mura bhfuil uimhir ann - agus a innéacs feidhmíochta araon mar an gcéanna (`carKey`): is carr difriúil é an tsamhail chéanna le tiúin dhifriúil.

**Ranganna.** Is í rang feidhmíochta lap rang an chluiche (Forza D..X, gearrainm rang carr iRacing); ordaíonn na staitisticí iad D, C, B, A, S1, S2, R, X, agus ansin na cinn eile de réir aibítre.

## Cuairteanna samplacha {#demo-laps}

Luchtaíonn **Cuairteanna samplacha** trí chuairt de chiorcad samhlaithe (ceithre stráice agus ceithre lúb dheas), a rinneadh le samhail fhíorasach simplí ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): luas teoranta grip ag gach cúinne, pas luasghéarúcháin ar aghaidh agus pas coscánaithe ar ais, mar a dhéanann insamhlálaí lap.

| Lap | Carr | Locht |
|---|---|---|
| glan | Carr greime | níl aon cheann |
| le botúin | Carr greime | coscann 35 m go luath isteach i T2, fanann sé ar an throttle 30 m go déanach amach as T3, tógann sé T4 ag 0,88 de a luas, tiomáineann 1,2 m go taobh amháin |
| carr eile | Carr cumhachta | níl aon cheann; tiomáineann 1,2 m go taobh eile |

| Carr (uimhir) | Greim | Coscánú | Tarraingt | Cumhacht/mais | Drag |
|---|---|---|---|---|---|
| Carr greime (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Carr cumhachta (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Dírítear ar an lap leis na botúin. Tá an ciorcad leagtha amach ar an mbealach a choinníonn Forza a dhomhan (clé-lámhach), mar sin - díreach mar a tharlaíonn le lap fíor Forza - tagann sé amach scáthánaithe agus tairgeann an cluaisín **Inbhéartaigh X**. Tá sonraí do gach roth ag na trí chuairt, mar sin tá rud éigin le taispeáint ag gach cuid den chluaisín.

## Liosta na gcuairteanna {#the-lap-list}

Gach líne, ó chlé go deas:

| Eilimint | Déanann sé |
|---|---|
| ● / ○ | taispeánann / folaíonn an lap (línte, carr, cárta, cairteacha); déantar anailís ar laps folaithe fós |
| stráic dathach | dath an laps |
| ainm agus clibeanna | cliceáil chun an lap a **dhíriú**; hover chun a chomhad foinse agus a charr a fheiceáil (ainm · PI rang · tiomáint) |
| ⌖ | lean an carr seo leis an gceamara (cliceáil arís chun stop) |
| ★ | déan gach rud a chur i gcomparáid leis an lap seo (déan an tagairt de); faoi mhíchumas ar an tagairt |
| × | bain an lap |

**Clibeanna:** *tagairt*; *is fearr de X* (nó *is fearr dá rang*) ar an lap is tapúla de rang nuair a bhíonn roinnt rang ann; *páirteach* ar rith nár shroich an críoch.

**An dara líne:** an rang (ach amháin le roinnt rang), an t-am lap (`1:29.616`), an fad go dtí an lap a chuirtear i gcomparáid leis (an lap is fearr dá rang, nó an tagairt) mar `+0.512` (sampla), agus *tosaíonn déanach* nuair a thosaíonn an lap níos mó ná 10 m tar éis thosach na tagartha.

Nuair a bhíonn níos mó ná 8 lap ann tairgeann líne "N de M tarraingthe" **Taispeáin iad uile** (tarraing gach lap: níos moille, agus ceangailte) agus **Na cinn atá faoi scrúdú amháin** (an tagairt, an lap dírithe agus an lap is fearr dá rang; áirítear gach lap sna staitisticí ar aon nós).

Faoin liosta: leid an scáthánaithe nuair a deir na laps go bhfuil an tarraingt scáthánaithe (féach [domhain scáthánaithe](race-replay-and-scene.md#mirrored-worlds)), agus nuair a bhíonn dhá lap nó níos mó ann an leid "Cliceáil lap chun a fheiceáil cá gcailleann sé am …", agus, le roinnt rang, go gcuirtear gach lap i gcomparáid leis an lap is tapúla dá rang féin.

### Tagairt agus fócas {#reference-and-focus}

- **Tagairt:** an lap a ailínítear gach lap eile leis agus, de réir réamhshocraithe, a gcuirtear i gcomparáid leis. An lap iomlán is tapúla mura roghnaigh ★ lap eile (an chéad lap luchtaithe nuair nach bhfuil lap iomlán ar bith ann). Tilleann bainistiú an lap tagartha ar an rogha uathoibríoch.
- **Fócas:** an lap a dtaispeántar a bhfionnachtana, a rialú carr agus a léarscáileanna dó. Fanann sé áit a chuir an t-úsáideoir é; murab ea, is é an lap **is moille** nach é an tagairt é ("is mó is féidir a fhoghlaim"). Dírithe ar lap, nochtann sé freisin é agus an lap is fearr dá rang. Nuair a dhíríonn tú ar an tagairt, cuirtear í i gcomparáid leis an lap eile ba thapúla tríd gach cúinne.
- **Ranganna:** nuair a bhíonn cuairteanna de roinnt rang feidhmíochta ann, cuirtear gach lap i gcomparáid leis an lap iomlán is tapúla dá rang féin (an tagairt, i rang na tagartha). Féach [Staitisticí cúrsa](race-course-statistics.md).

### Dathanna {#colours}

Faigheann gach lap a dhath féin, de réir a shuíomh san ord luchtaithe, ionas go gcoimeádann lap a dhath nuair a bhíonn cinn eile i bhfolach. Tá na huaslathanna spásáilte timpeall rothar an dathanna mar a spásálann mód foirne an teasmhapa na grúpaí; do gach sloite roghnaítear an éadroimnigh (0,52 go 0,66 in OKLCH) agus an chroma (0,12 go 0,18) chun seasamh is faide ó na sloite comharsanacha (agus an ceann deireanach ón gcéad cheann) faoi fhís ghnáth, protan agus deutan, gach ceann ag 3:1 ar a laghad i gcoinne dromchla dorcha na cairte.

## Do fhorbróirí {#for-developers}

Cód: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Conas a léitear gach formáid {#how-each-format-is-read}

Críochnaíonn gach formáid mar `LapTrace` amháin: cainéil faoi ainmneacha canónacha (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., féach [tábla na gcainéal](race-charts-and-hud.md#the-channel-table)), an carr, am an laps, cibé an lap iomlán é, agus bloc `meta`. Do gach formáid, cuirtear `time` agus `distance` ag tosú ag 0, agus nuair nach bhfuil `speed` ag foinse ríomhtar é mar fhad thar ama ó na samplaí comharsanacha.

#### heat3d-lap JSON {#heat3d-lap-json}

Réad JSON le `"format": "heat3d-lap"`. Réimsí léite:

| Réimse | Úsáid |
|---|---|
| `channels` | réad de shreangaí, ceann do gach cainéal, de réir ainm canónach; cainéil de réir rotha mar `name.FL`, `name.FR`, `name.RL`, `name.RR`. Riachtanach: `time`, `x` agus `z` |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | an carr: id, ainm, innéacs rang Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), innéacs feidhmíochta, cód tiomána (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | am an laps; an luach `time` deireanach nuair a bhíonn sé as láthair |
| `lap.complete` | marcálann `false` rith páirteach; aon rud eile is iomlán é |
| `game`, `track` | ainmneacha; cinneann `game` an disciplín (féach thíos) |
| `units.slipRatio` / `units.slipAngle` | conas a scálaítear sleamhnú: aonad ina bhfuil `raw` ciallaíonn `scaled`, `normalised` ciallaíonn `peak`, aon rud eile `physical` |
| `meta` | `slip`, `surface`, `discipline` mar a thugtar iad sáraíonn siad na cinn thuas |

Gan cainéal `distance` suimítear fad ó na suíomhanna 3D.

#### Comhaid lap FH Companion {#fh-companion-lap-files}

Réad JSON le réad `Lap` a choinníonn sraith `samples` (sampla thart ar gach 5 m). Réimsí mapáilte:

| FH Companion | Cainéal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (aistrithe ionas go dtosaíonn an lap ag 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | mar an gcéanna, litreacha beaga |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², cé go bhfuil an t-ainm eile) |
| `Puddle` | `puddle` |

Tagann an carr ó `Lap.carOrdinal`, `Lap.carName` (comhaid nua amháin), `Class` (nó `Lap.carClass` mar innéacs rang Forza), `Lap.performanceIndex`, `Lap.drivetrain` agus `Lap.peakKilowatts`; an t-am ó `Lap.lapSeconds`; is páirteach rith a bhfuil `EndedAtFinish: false` aige. Is é `forza-horizon` an cluiche.

Níl sonraí taoir ná ceann sna comhaid seo, mar sin ní féidir glasáil, sleamhnú roth agus sciorradh a mheas astu amháin; is féidir brúcha (ón stiúir i gcoinne an chonair) agus buillí agus timpistí fós. Roghnaigh an `.tele.gz` in aice le gach ceann freisin don chuid eile.

#### Telemetry FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON comhbhrúite le gzip `{ version, columns, data }`: Data Out iomlán Forza do lap amháin, sraith amháin do gach pacáiste, ainmneacha réimse bhunaidh an chluiche. Déantar colúin a lorg de réir ainm, riamh de réir suíomh. Coimeádann formáid 2 gach pacáiste (thart ar 110 sa soicind i gcoinne 64 tic an chluiche); scriosaitear ró atá comhionann leis an gceann roimhe ina gach rud ach clog féin an taifeadóra (`t`, `metres`), ionas go léitear lap ag 64 ró sa soicind an chluiche. (Deir leid an chnaipe lódála é: "do shleamhnú gach taoir ag 64 Hz".)

| Réimse Data Out | Cainéal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (fráma an chairr: x ar dheis, y suas, z ar aghaidh) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, scálaithe ó 0..255 go 0..1 |
| `Steer` | `steer`, scálaithe ó -127..127 go -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, athraithe ó Fahrenheit go °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` do gach roth |

Is é `<Wheel>` `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Marcáiltear sleamhnú mar `peak` (sleamhnú normalaithe Forza: thar 1 scaoil an taior greim).

**Péireáil.** Nuair a roghnaítear nó a scaoiltear comhad lap `<lap>.json` agus `<lap>.json.tele.gz` le chéile (an cosán céanna ach gurb é `.tele.gz` a deireadh) bíonn **lap amháin** díobh: cainéil an telemetry, le carr, rang, am, rian agus bratach pháirteach an chomhaid lap. Buaileann ainm carr an chomhaid telemetry féin an ceann eile nuair a bhíonn ceann aige.
Luchtaítear comhad `.tele.gz` ina n-aonar fós: iompraíonn comhaid formáid 2 `car` (`ordinal`, `name`, `class`, `pi`), `track` agus `lapSeconds`; gan iad sin is é fad féin an telemetry an t-am lap agus níl an carr ar eolas.

#### iRacing `.ibt` {#iracing-ibt}

Léitear comhad telemetry iRacing go díreach (sa bhrabhsálaí, gan tiontú): an ceannlíne 112-beart, an fo-cheannlíne diosca 32-beart, an tábla athraitheach (144 beart do gach cainéal) agus YAML an seisiúin.

- **Cainéil riachtanacha:** `SessionTime`, `Lap`, `Lat`, `Lon`. Gan iad: "… níl cainéil SessionTime, Lap, Lat agus Lon aige - an comhad telemetry iRacing é?"
- **Suímh:** leagtar domhanleithead agus fadlíne amach i méadair ar phlána tangant ag an gcéad phointe neamh-nialasach (ga na Cruinne 6 371 008,8 m): x soir, z aneas, y an airde (`Alt`) - mar sin le ceannteideal réamhshocraithe an cheamara tuaidh tá sé suas ar an scáileán. Ní fhráma an rian féin é: ní bheadh an múnla cúrsa eastráite ailínithe.
- **Laps:** roinntear an seisiún ar an áit a n-athraíonn `Lap`; coinnítear lap nuair a bhfuil níos mó ná 60 sampla ann, tosaíonn sé faoi 5% de `LapDistPct` agus críochnaíonn sé os cionn 95%. Scriosaítear laps páirteacha. Gan aon cheann fágtha: "… níl aon lap iomlán den rian N km aige" (fad an rian ó YAML) nó "… níl aon lap iomlán aige".
- **Fad:** `LapDist` ó thosach an laps, nó suimithe ó shuímh.
- **Carr:** ó `DriverInfo`: `CarScreenName` an imreoir, `CarID` (mar uimhir an chairr) agus `CarClassShortName` (mar an rang). Rian: `TrackDisplayName`, nó `TrackName`.

Cainéil mapáilte:

| iRacing | Cainéal | Tiontú |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | na hainmneacha céanna | - |
| `Clutch` | `clutch` | `1 - v` (comhaireann iRacing an ceangal; is é ár bpedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radanna tuathal go -1..1 ar dheis dearfach; uasmhéid 0,1 ar a laghad, π nuair nach bhfuil sé) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | mar an gcéanna, litreacha beaga | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | roinnte ar 100 nuair a bhíonn sé os cionn 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | teocht lárnach an chorpáin |
| `LFshockDefl` ... | `suspensionM.FL` ... | cur-as an damper, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa go psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Réimíreanna rotha: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Gach cainéal eile** a bhfuil luach amháin aige do gach sampla (nach de chineál na mbeart-réimsí é) téitear trasna faoina ainm féin - do gach roth nuair a thosaíonn sé le réimír rotha (tiontaítear `RRspeed` ina `speed.RR`) - ionas go gcuireann na graif agus liostaí luachanna na gcárta na cinn sin go léir ar fáil. Ní logálann iRacing sleamhnú taoir: meastar rialú carr ón uillinn drift - `Yaw`, feistithe ar threo an taistil, i gcoinne an áit a dtéann an carr - agus an stiúir i gcoinne an chonair. Ní úsáidtear an ráta giúrach i gcoinne an luasghéarúcháin trasnánaigh ach nuair nach féidir an ceann a fheistiú, mar sin níl uillinn drift ann (féach [Imeachtaí rialaithe carr](race-control-events.md)).

Earráidí: "… is ró-ghearr é a bheith ina chomhad .ibt", "… níl ceannlíne telemetry iRacing aige", "… níl aon suíomh aige".

#### CSV lap {#lap-csv}

Ró amháin do gach sampla; aithnítear go leor laps i gcomhad amháin de réir colún `lap`. Brathaítear an deighilteoir ón gcéad cúig líne. Déanann líne roghnach `# { ...json... }` cur síos ar an rith: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Colún (gan aird ar chás) | Cainéal |
|---|---|
| `x`, `y`, `z` | suíomh (`x` agus `z` riachtanach) |
| `elapsed` nó `time` | `time` (riachtanach do gach lap) |
| `metres` nó `distance` | `distance` (nó suimithe ó shuímh) |
| `speed_ms` nó `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | mar an gcéanna |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| aon ainm canónach cainéil, m.sh. `latVel`, `slipIndex.FL` | é féin |
| `lap` | cén lap a bhaineann ró le |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | am an laps, uimhir an chairr, rang, PI, rian (ó chéad ró gach laps) |

Gan tuairisc tógtar an cluiche mar `forza-horizon` agus gach lap mar iomlán. Taispeántar foinse lap mar `<file> · <lap>` nuair a bhíonn roinnt laps sa chomhad. Earráidí: "… níl aon róanna aige", "… níl colúin x agus z aige", "… níl aon laps aige le colún ama".

#### Disciplín agus dromchla {#discipline-and-surface}

Cad a glacann an anailís leis faoi lap, nuair nach ndeir an lap é (`lap.ts`):

- **Disciplín:** `meta.discipline`, nó murab ea, is cluiche a mheaitseálann `rally|wrc|dirt|rbr` **rally** é, is é `trackmania` **arcade**, agus is **circuit** aon rud eile.
- **Dromchla:** `meta.surface`, nó murab ea, ó ainm an rian agus an fhoinse: is **mixed** ralaí darb ainm `monte`; is **snow** `snow|ice|winter|arctic|sweden`; na ralaí tarmac (an Spáinn/España/Catalunya/Costa Daurada, an Chróatia/Hrvatska, an Eoraip Lárnach, an Ghearmáin/Deutschland, an tSeapáin, an Chorsaic/Corse, Ypres, nó na focail tarmac/asphalt) **tarmac**; aon ainm le `scramble|trail|cross country|dirt|gravel` **loose**; measann stáitse ralaí eile ón gcaoi a dtiomáintear an carr: os cionn na samplaí níos tapúla ná 12 m/s agus ar an talamh (200 ar a laghad díobh), is tarmac é 95ú pórsa de luasghéarú trasnánach de 10 m/s² nó níos mó in éineacht le meán-uillinn drift faoi 6° (glactar leis san áit a ndearna an carr cúinne ag 70% den sin nó níos mó, 30 sampla ar a laghad); aon rud eile, nó an rud nach leor sonraí chun a rá, is loose é. Is loose ainm nach rally é ach ina bhfuil `rally`; is tarmac gach rud eile.
- Do gach sampla, cuireann cainéal `loose` (torann dromchla Forza, ábhair Trackmania, féach [Imeachtaí rialaithe carr](race-control-events.md#the-ground)) an dromchla ar an lap thar a ceann.
