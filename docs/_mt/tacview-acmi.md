---
title: "Reġistrazzjonijiet Tacview (ACMI)"
parent: "Kif tidħol id-data"
nav_order: 7
lang: "mt"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Reġistrazzjonijiet Tacview (ACMI)

Tacview huwa programm li jirreġistra titjiriet fis-simulaturi tat-titjir; il-fajls tiegħu jispiċċaw b'`.acmi`. 3DHeat jiftaħhom biex tara fejn tajjar kull ajruplan.

Ir-reġistrazzjonijiet tat-titjir ta' Tacview jitgħabbew bħal kull tabella: agħżel jew aqbad `.acmi` (test, `.txt.acmi`, jew miżmum f'zip, `.zip.acmi`) u agħfas **Għabbi**. Imbagħad ikollok is-sħana tat-titjiriet kollha, u fit-tab **Partita** replay b'figuri, traċċi u lista ta' avvenimenti ([Replay tal-partita](match-replay.md)). ACMI huwa l-format pubbliku tal-fajls ta' Tacview ([dokumentazzjoni](https://www.tacview.net/documentation/acmi/)); DCS (permezz tal-esportatur ta' Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS u oħrajn jikitbuh, għalhekk dan jaqra kwalunkwe wieħed minnhom.

## X'isir minn reġistrazzjoni {#what-a-recording-becomes}

Ringiela waħda kull darba li tinkiteb pożizzjoni ta' oġġett, ringiela waħda għal kull avveniment fil-post tal-oġġett, u ringiela waħda meta oġġett jitlaq (`Removed`, fejn kien l-aħħar). Avveniment dwar oġġett li għadu ma nrawx - bookmark, messaġġ għal kulħadd - huwa ringiela tal-oġġett `(recording)` fil-punt ta' referenza. Ir-reġistrazzjoni tgħorr l-istruzzjonijiet tagħha stess għall-qari, għalhekk il-pass tal-mapping jimla lilu nnifsu. Il-qarrej jikteb dawn il-kolonni: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, u wara dawn kull proprjetà oħra li tkun fir-reġistrazzjoni. Ir-rwoli tagħhom:

| Kolonna | Rwol | Tifsira |
|---|---|---|
| Time | ħin | Sekondi wara l-ReferenceTime tar-reġistrazzjoni; sekondi Unix meta jkollha waħda, għalhekk l-arloġġ juri l-ħin reali. |
| X, Y | pożizzjoni | Lvant u tramuntana, f'metri, fuq pjan li jmiss mal-art fil-punt ta' referenza tar-reġistrazzjoni: id-distanzi u id-direzzjonijiet huma eżatti ħdejh, u jiżvarjaw b'inqas minn parti f'elf f'100 km. It-tramuntana ssir -Z tad-dinja. |
| Altitude | pożizzjoni (fuq) | Metri. |
| Object | persuna | Il-pilota u l-isem tal-oġġett bl-ID tiegħu, pereżempju `Viper 1 (F-16C_50) #a01`; oġġett mingħajr pilota `(T-90A) #401`. |
| Coalition | tim | In-naħa (jew il-kulur, meta ma jkunx hemm coalition). |
| Heading, Pitch | ħarsa | Gradi; heading 0 hija t-tramuntana. |
| Recording | sessjoni | It-Title tar-reġistrazzjoni, jew l-isem tal-fajl: diversi reġistrazzjonijiet jitgħabbew flimkien mingħajr ma t-traċċi tagħhom jaqsmu. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Miżmuma għall-filtrar; Type u Name jagħżlu l-[figura](figures.md) ta' kull oġġett, Event jimla l-lista ta' avvenimenti tad-debrief, Roll jmejjel l-ajruplan. |
| U, V | | Il-metri tad-dinja ċatta tal-logħba stess, meta kull kampjun ikollu dawn (DCS jiktibhom). |
| EventObjects | filtri | Kull oġġett li avveniment isemmi (`Message|a01|b02|...`), bl-ID. |
| RecordingInfo | | Il-proprjetajiet tar-reġistrazzjoni kif kienu f'dak il-mument - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - bħala JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Kull proprjetà numerika oħra li tgħorr ir-reġistrazzjoni. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Kull proprjetà testwali oħra li tgħorr ir-reġistrazzjoni; proprjetà b'valur li mhuwiex numru hija test. |

L-erba' forom tal-pożizzjoni ta' Tacview (`lon|lat|alt`, b'`u|v`, b'`roll|pitch|yaw`, u bihom kollha u heading) jinqraw kollha, bil-kaxxi vojta jżommu l-aħħar valur; `-id` jneħħi oġġett, u ID użat mill-ġdid wara dan huwa oġġett ġdid. Il-virgoli mhux maqfula u l-linji kontinwi jiġu ttrattati.

Il-pożizzjonijiet dejjem jiġu proġettati mill-latitudni u l-longitudni, qatt ma jittieħdu minn U/V, għalhekk ir-reġistrazzjonijiet minn kull logħba jaqsmu proġezzjoni waħda ma' sfond tad-dinja reali.

## Servers tad-DCS: min rebaħ, u kif spiċċat kull titjira {#dcs-servers-who-won-and-how-each-sortie-ended}

Server multiplayer tad-DCS jirreġistra l-missjonijiet tiegħu b'Tacview lejl u nhar. Server PvP permanenti jmexxi kampanja fuq ħafna minnhom: naħa tirbaħ meta tieħu kull ajruport, FARP u żona tan-naħa l-oħra, u dan jieħu jiem u ħafna bidu mill-ġdid tal-missjoni. Ir-reġistrazzjonijiet fihom it-titjiriet, mhux il-kampanja: l-ebda messaġġ ma jgħid min ħa xiex, l-ajruporti jinkitbu darba fil-bidu, u xejn ma jgħid min rebaħ. Il-konvertitur ta' Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) iżid ma' kull ringiela dak li jista' jkun magħruf, u jħalli vojt dak li ma jistax. Qatt ma jaqta'.

| Kolonna | Tifsira |
|---|---|
| `server` | is-server jew il-kampanja, mill-header tar-reġistrazzjoni (it-Title, l-Author u l-Comments tagħha jsemmu s-servers pubbliċi magħrufa - Blue Flag, SPS Contention, Growling Sidewinder; inkella Author li jsemmi lil xi ħadd); `--server Name` jagħti isem lil folder sħiħ. Reġistrazzjoni li l-header tagħha ma jsemmi l-ebda server - Author bħal `Admin`, Title u Comments li l-ebda server magħruf ma jikteb - tibqa' mhux attribwita: `server` vojt, anki meta tniżżlet mill-paġna tar-reġistrazzjonijiet ta' server, għax il-paġna tista' jkun fiha missjonijiet ta' komunitajiet oħra wkoll |
| `mission` | it-Title tar-reġistrazzjoni mingħajr il-verżjoni jew ix-xahar tal-kampanja: `Operation_Example_V7.7.99` isir `Operation Example` |
| `campaign` | ir-rawnd tal-kampanja li għalih tappartjeni r-reġistrazzjoni, skont is-server, il-mappa u n-numru: `Example Server North 3`. Reġistrazzjoni waħda hija sessjoni waħda (minn bidu mill-ġdid għal ieħor); rawnd jgħaddi minn ħafna sessjonijiet, jiem jew ġimgħat |
| `round` | in-numru ta' dak ir-rawnd: dak tas-server stess fejn jippubblikah, inkella r-rawnd numru n li deher f'dak is-server u dik il-mappa; minn fajl tar-rawnds (hawn taħt), vojt mingħajru |
| `session` | il-post tar-reġistrazzjoni fost is-sessjonijiet tar-rawnd, 1, 2, ...; `sessionStart` il-bidu reali tagħha (sekondi Unix) |
| `heldRed`, `heldBlue` | il-postijiet ikkontestati li kull naħa kellha fil-bidu tas-sessjoni, minn fajl tar-rawnds marbut f'katina (hawn taħt) |
| `won`, `matchWon` | 1 meta n-naħa tar-ringiela (il-Color tagħha, Red jew Blue) rebħet dik il-kampanja, 0 meta tilfitha; vojta fejn l-ebda fajl tar-rawnds ma jsemmi rebbieħ, u fuq ringieli newtrali. Kampanja hija r-rawnd u l-partita fl-istess ħin, għalhekk it-tnejn għandhom l-istess valur |
| `roundEndReason` | `capture` għal kampanja mirbuħa billi ttieħed kollox |
| `won`, `matchWon` fuq kull sessjoni ta' rawnd | ir-riżultat tar-rawnd, miktub fuq kull reġistrazzjoni tiegħu malli jkun magħruf it-tmiem tiegħu |
| `sortie` | fuq ir-ringieli ta' ajruplan: it-titjira tiegħu, 1, 2, ... minn tlugħ għal tlugħ; il-ħin fuq l-art qabel l-ewwel tlugħ u wara nżul jgħodd għat-titjira li tappartjeni għaliha |
| `sortieResult` | kif spiċċat dik it-titjira: `landed`, `landed damaged` (wara daqqa fl-ajru), `ejected`, `shot down`, `destroyed` (fuq l-art), `crashed`, `despawned` (għeb fl-ajru mingħajr ebda kawża li dehret - plejer li ħareġ), `airborne at end`, `no takeoff` |
| `sortieKills` | il-qtil ikkreditat lill-ajruplan f'dik it-titjira |

F'server permanenti, it-titjira hija l-unità li tfisser xi ħaġa. Iffiltra b'`sortieResult` = `shot down` biex tara fejn intilfu t-titjiriet, jew aqsam is-sħana skont `sortieResult` jew `server` fil-[qsim](breakdown.md). It-tlugħ, l-inżul, l-ejezzjonijiet, il-qtil u l-ħabtiet li minnhom hija magħmula huma l-avvenimenti li l-konvertitur joħroġ minn kif jiċċaqlaq l-ajruplan (hawn fuq).

Il-postijiet meħuda bejn żewġ sessjonijiet ta' rawnd (magħrufa mill-fajl tar-rawnds, hawn taħt) huma avvenimenti `capture` fil-bidu tar-reġistrazzjoni ta' wara: `Object` `(campaign)`, fil-post, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Ajruport jew FARP li jibdel in-naħa fejn ir-reġistrazzjoni turih (miktub mill-ġdid bil-kulur tan-naħa l-oħra, jew imħassar u miktub mill-ġdid f'postu bil-kulur tal-oħra fi żmien ħames minuti) isir avveniment `capture` fil-post tal-inżul: `Event` = `capture`, `Airfield` ismu, `Detail` `Red to Blue`, `Coalition` in-naħa l-ġdida tiegħu. Post tal-inżul miktub l-ewwel darba b'kulur mhuwiex qbid. Is-servers li ħarisna lejhom s'issa jiktbu l-postijiet tal-inżul tagħhom darba, għalhekk ir-reġistrazzjonijiet tagħhom ma fihomx qbid.

### Fajls tar-rawnds {#rounds-files}

Fajl tar-rawnds jgħid, għal kull server, ir-rawnds tal-kampanja tiegħu, min rebaħhom u s-sessjonijiet ta' kull wieħed. Jiġi minn dak li jippubblika s-server, jew mir-reġistrazzjonijiet infushom (hawn taħt).

Min rebaħ kampanja huwa dak li jippubblika s-server (log tal-kampanja fuq il-paġna web tiegħu), mhux xi ħaġa fir-reġistrazzjoni. Fajl tar-rawnds iġorr dan, u l-konvertitur jaqrah b'`--rounds file.json` (jistgħu jingħataw aktar minn wieħed):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Reġistrazzjoni tappartjeni għar-rawnds tas-`server` tagħha li t-`title` tagħhom (espressjoni regolari) jaqbel mat-Title tagħha. Kull ringiela tappartjeni għar-rawnd li fih jaqa' l-ħin reali tagħha: ir-RecordingTime tar-reġistrazzjoni flimkien mas-sekondi tar-ringiela, mhux id-data tal-missjoni ġewwa l-logħba. Il-ħinijiet huma f'UTC. Rawnd mingħajr rebbieħ (mibdul, għadu għaddej) jagħti lir-ringieli tiegħu n-numru tar-rawnd u riżultat vojt.

L-ekwivalenti tad-dokument tal-partita, il-footer `acmi`, jgħid minn fejn ġie r-riżultat, kif jagħmel ir-`result.source` ta' partita ta' War Thunder: `outcome.result` huwa `{ winner, round, endReason, source }`, fejn `source` huwa s-`source` tal-fajl tar-rawnds, jew `null` meta xejn ma semma rebbieħ. `outcome` jelenka wkoll ir-rawnds tar-reġistrazzjoni, il-qbid tagħha u t-titjiriet tagħha skont kif spiċċaw:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Ringiela ta' pilota `Viper 1 (F-16C_50) #a01` fuq in-naħa l-blu f'dik il-kampanja mbagħad taqra: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rawnds mir-reġistrazzjonijiet infushom {#rounds-from-the-recordings-themselves}

Server permanenti jżomm il-kampanja tiegħu minn bidu mill-ġdid għal ieħor, u kull reġistrazzjoni tibda bl-unitajiet tal-art u l-oġġetti statiċi taż-żewġ naħat fejn ħalliethom il-kampanja. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` jaqra l-ewwel minuti ta' kull reġistrazzjoni ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), ipoġġi r-reġistrazzjonijiet ta' kull server fuq mappa waħda f'ordni ta' ħin u jorbothom f'katina:

- **Postijiet**: l-art f'ċelloli ta' madwar 2 km; ċellola hija ta' naħa meta tliet kwarti tal-unitajiet hemmhekk fil-bidu ta' sessjoni huma tagħha. Il-postijiet *ikkontestati* huma dawk li dehru f'idejn iż-żewġ naħat.
- **Qbid**: post li fil-bidu tas-sessjoni ta' wara għandha n-naħa l-oħra - meħud bejn il-missjonijiet, jew waqt dik ta' qabel.
- **Rawnd ġdid**: sessjoni li l-postijiet tagħha jvarjaw minn dawk ta' qabilha f'aktar minn 60% minnhom - it-tqassim tal-bidu ta' rawnd ġdid, mhux pass tal-qadim. Rawnd jispiċċa wkoll meta s-server jgħaddi għal mappa oħra (is-sessjonijiet tiegħu jibdew wara l-aħħar waħda u jkomplu).
- **Min rebaħ**: f'rawnd li spiċċa, in-naħa li kellha kull post fil-bidu tal-aħħar sessjoni tiegħu (`capture`, kunfidenza għolja), inkella n-naħa li kellha aktar postijiet ikkontestati (medja meta jkunu d-doppju tal-oħra, inkella baxxa; baxxa meta spiċċa b'bidla ta' mappa). Rawnd miftuħ m'għandux rebbieħ, iżda kull sessjoni tgħid kemm postijiet kellha kull naħa fil-bidu tagħha, għalhekk jidher min kien quddiem.
- Server li s-sessjonijiet tiegħu kollha jibdew l-istess ma jżomm l-ebda stat bejniethom: ma jintrabatx f'katina.

Il-bidu tal-aħħar sessjoni jista' jkun sigħat qabel tmiem ir-rawnd, għalhekk il-kunfidenza hija importanti. Iċċekkjat ma' server li jippubblika r-rebbieħa tiegħu: il-katina sabet kull rawnd ġdid fis-sessjoni fejn beda r-rawnd ippubblikat, u n-naħa li kienet quddiem fl-aħħar bidu kienet ir-rebbieħ ippubblikat f'kull wieħed mid-9 rawnds li setgħet tiċċekkja. `--official file.json` iżomm ir-rawnds ippubblikati ta' server bħal dan u jżidilhom is-sessjonijiet tal-katina; il-qasam `validation` tal-fajl jgħid kemm qablet il-katina. F'kampanja vvintata:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Tara rawnd ta' kampanja bħala serje {#watching-a-campaign-round-as-a-series}

Għabbi flimkien ir-reġistrazzjonijiet ta' rawnd wieħed (il-fajls li għandhom l-istess `campaign`), u l-viewer jilgħabhom bħala serje waħda: sessjoni wara sessjoni fl-ordni reali tagħhom, bis-sigħat jew il-jiem bejn tnejn maqtugħin għal waqfa ta' minuta. Il-linja tal-ħin timmarka l-bidu ta' kull sessjoni bl-isfar u l-waqfiet bħala strixxi skuri, u l-arloġġ jgħid liema sessjoni qed tintlagħab u d-data reali tagħha (`session 4/12 · 2026-11-02 12:38 UTC`). Is-sħana, ir-replay, il-filtri u l-Insights jaħdmu fuq is-serje kollha bħal fuq kwalunkwe data mgħobbija. It-taqsima **Rawnd tal-kampanja** tat-tab **Partita** telenka s-sessjonijiet bid-dati tagħhom, kemm postijiet ikkontestati kellha kull naħa f'kull bidu (ukoll bħala grafika fuq ir-rawnd kollu) u kemm minnhom ittieħdu qabel; klikk jieħdok għall-bidu ta' sessjoni. Reġistrazzjoni mgħobbija waħedha tgħid hemmhekk liema rawnd u liema sessjoni hi. Reġistrazzjonijiet ta' rawnds differenti mgħobbija flimkien mhumiex serje: kull waħda tibda minn żero, bħal partiti separati. Il-loader ta' ħafna partiti (**Ħafna logħbiet f'daqqa**) jilgħab ukoll rawnd bħala serje, bi streaming u daqs skont il-GPU, għal rawnds ta' ħafna gigabytes.

Il-postijiet li bidlu l-idejn waqt ir-rawnd jitpinġew fuq il-mappa bħala żoni tal-qbid, ikkuluriti skont in-naħa li kellha kull wieħed fil-bidu tas-sessjoni li qed tintlagħab, u jinbidlu fil-fruntieri bejn is-sessjonijiet; kull bidla hija qbid fil-lista tal-avvenimenti tar-replay. Jinħarġu mir-ringieli mgħobbija (l-unitajiet tal-art u l-oġġetti statiċi ta' kull sessjoni fl-ewwel minuti tagħha, f'ċelloli ta' madwar 2 km, kif tagħmel il-katina), għalhekk jeħtieġu l-loader sħiħ (il-loader ta' ħafna partiti jżomm ftit wisq minn kull ringiela).

**Tgħabbija tar-rawnd kollu minn waħda mir-reġistrazzjonijiet tiegħu.** F'browser normali, il-viewer ma jistax jiftaħ fajls li ma għażiltx int: għabbi l-fajls tar-rawnd flimkien. Meta jkun servut mis-server lokali tal-viewer (`npm run dev` jew `npm run preview`), jista': agħti lill-fajl `tools/local-data.json`, li git jinjorah, entrata `campaigns` li ssemmi l-folder tal-fajls tar-rawnds u l-folders tar-reġistrazzjonijiet ikkonvertiti. Imbagħad it-taqsima Rawnd tal-kampanja ta' reġistrazzjoni waħda toffri **Tella' r-rawnd kollu**: iġġib is-sessjonijiet tar-rawnd li jinsabu hemm u tgħabbihom bil-loader ta' ħafna partiti:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Jiġu servuti biss ir-reġistrazzjonijiet li jsemmi fajl tar-rawnds (`tools/campaign-files.mjs`); sessjoni li ma tinstabx f'dawk il-folders tingħadd, ma titgħabbiex.

X'jippubblikaw is-servers magħrufa:

| Server | Rawnd | Kif tirbaħ naħa | Fejn jista' jinqara r-rebbieħ |
|---|---|---|---|
| SPS Contention | kampanja fuq mappa u epoka waħda (jiem), fuq ħafna bidu mill-ġdid | kull ajruport, FARP u fortizza meħuda; kampanja li spiċċat mingħajr rebbieħ inbidlet | il-log pubbliku tal-kampanji tas-server (rebbieħ, bidu, tmiem għal kull kampanja) |
| Blue Flag | rawnd ta' kampanja fuq ħafna missjonijiet ta' 5 sigħat; il-`_YYYY_MM` tat-Title jimxi xahar għal kull bidu mill-ġdid | kull pożizzjoni tal-għadu meħuda; rawnds eqdem kienu jsemmu n-naħa li kellha aktar wara ħin fiss | mhux ippubblikat f'forma li nstabet s'issa; il-katina tar-reġistrazzjonijiet issegwi kull rawnd u min għandu kemm f'kull bidu |
| Growling Sidewinder | tħaddim (6 sigħat) ta' missjoni ta' kunflitt miftuħ | żoni u ajruporti meħuda | il-paġna tal-istatistika tiegħu turi piloti, mhux riżultati; kull sessjoni tibda l-istess, għalhekk l-ebda rawnd ma jkopri aktar minn sessjoni: vojt |
| Missjonijiet kontra l-AI (missjonijiet ta' qbid taż-żoni) | tħaddim tal-missjoni | in-naħa tal-plejers kontra l-AI tal-missjoni: l-ebda riżultat PvP | vojt |
| Mhux attribwiti (il-header ma jsemmi l-ebda server) | - | - | vojt, `server` vojt ukoll |
