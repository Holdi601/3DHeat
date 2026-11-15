---
title: "Il-konvertituri jżommu kollox"
parent: "Kif tidħol id-data"
nav_order: 8
lang: "mt"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Il-konvertituri jżommu kollox

Ma teħtieġx din il-paġna biex tiftaħ replay. Hija għal nies li jikteb għodod li jdawru fajls tal-logħbiet f'tabelli ta' 3DHeat, u għal dawk li jridu jafu għalfejn dawn it-tabelli fihom daqshekk.

Kull għodda li tdawwar replay, demo, log jew telemetrija live ta' logħba f'xi ħaġa li l-viewer tista' tiftaħ, issegwi regola waħda:

> **Aqra kollox li s-sors fih u li jista' jinqara issa, u żomm il-bqija sħiħ, sabiex jinqara aktar tard mingħajr il-fajl oriġinali.**

Replay ta' spiss jinħeles wara aġġornament tal-logħba, reinstallazzjoni jew disk mimli, u telemetrija live tinħeles fl-istess mument li tintbagħat. Dak li jitħalla barra mill-konvertitur jintilef għal dejjem; dak li jinżamm sħiħ jista' jinftaħ fil-jum li wieħed jifhmu. Allura konvertitur qatt ma jiddeċiedi x'se jkun utli: iftaħ dak li jista', iżomm kull messaġġ, pakkett, avveniment, proprjetà jew linja oħra bla bidla ħdejn it-tabella, u jgħid fl-output tiegħu stess kemm minnha qara u kemm żammha biss.

Din il-paġna hija l-konvenzjoni li jaqsmu l-konverturi kollha: il-konverturi tar-replay ta' War Thunder, World of Tanks, World of Warships u Squad, il-konvertitur tad-demo ta' CS2, il-watcher tal-isfond (id-decoder tar-replay ta' Dota u kull adapter live) u l-leturi tat-telemetrija tal-għodda tal-qbid tal-logħba, u l-importazzjonijiet tal-viewer stess (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Il-leturi tal-viewer stess huma deskritti f'[Tacview recordings](tacview-acmi.md) u [Loading files](loading-files.md); il-forma ta' fajl wieħed hija [Fajl wieħed kull partita](container.md). Partita waħda ssir tabella, `match.json` u sidecars, imqabbda fakultattivament f'fajl wieħed `.3dheat`. Kull README ta' għodda għandu taqsima **Completeness** li tilista, għal dak is-sors, x'jinqara, x'jinżamm bħala raw u x'mhuwiex disponibbli, u għaliex.

## Tliet postijiet għal kull oġġett {#three-homes-for-every-item}

Kollox li sors fih jispiċċa f'waħda biss minn tliet postijiet:

| Post | X'jmur hemm |
|---|---|
| **Iddekodat** | It-tabella (ringiel wieħed għal kull kampjun jew avveniment, il-kolonni li l-viewer jaqra, kolonni addizzjonali għal kull valur ieħor li jappartjeni għal ringiel) u d-dokument tal-partita `<match>.match.json` (kollox li jappartjeni lill-partita bħala kollox: is-settings, il-listi tal-plejers, ir-riżultati, l-iskorijiet, l-awtoverifika). |
| **Miżmum raw** | Sidecar ħdejn it-tabella: kull oġġett li mhux iddekodat, jew iddekodat f'parti biss, sħiħ u mhux mibdul, bit-tip tiegħu, il-ħin tiegħu u l-unità jew l-entità li tappartjeni għaliha. |
| **Mhux disponibbli** | Imsemmi fit-taqsima Completeness tal-README bir-raġuni: il-format ma jġorrux (replay tal-klijent ma jkollux l-inputs tal-plejers l-oħra), is-sors qatt ma jibgħatu, jew il-qari mhuwiex permess (proċess protett, blokk iċċifrat li ċ-ċavetta tiegħu mhix tagħna biex nużawha). |

Oġġett li huwa **parzjalment** iddekodat huwa kemm iddekodat *u* miżmum raw: it-tabella tieħu dak li jinftiehem, is-sidecar tieħu l-oġġett sħiħ, sabiex dekoder aħjar aktar tard ma jkollux bżonn il-fajl oriġinali.

M'hemm l-ebda raba' post. Li titlef xi ħaġa għax dehret bla użu, għax kienet duplikat "probabbilment", jew għax kienet kbira, huwa bug. It-tnaqqis huwa permess biss fit-tabella (kamera f'2 Hz minflok 60), qatt mhux fis-sidecar.

## Sidecars {#sidecars}

Sidecar huwa fajl Parquet ħdejn it-tabella, imsemmi b'ismha:

```
<folder>/<match>.parquet              it-tabella
<folder>/<match>.match.json           id-dokument tal-partita
<folder>/<match>.<what>.parquet       sidecar
```

`<what>` huwa kelma waħda minn din il-lista. Konverturi ġdid jagħżel il-kelma li taqbel, jew iżid tip ġdid hawn **u** fi `SIDECAR_PARQUET` f'[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), sabiex il-viewer jħallih barra meta jinġarr folder shiħ.

| `<what>` | Iżomm | Użat minn |
|---|---|---|
| `messages` | pakketti, sejħiet ta' metodi tal-entità u aġġornamenti tal-proprjetajiet ta' stream tan-netwerk, sħaħ | War Thunder, World of Tanks, World of Warships |
| `flight` | dħul tal-mudell tat-titjir għal kull ajruplan, sħiħ | War Thunder |
| `packets` | frames u messaġġi tan-netwerk sħaħ, jew biċċiet tal-container, barra mill-istream tal-entitajiet | CS2, Dota 2, Squad |
| `events` | avvenimenti tal-logħba bil-ċwievet kollha tagħhom, kif jagħtihom il-parser | CS2 |
| `entities` | aġġornamenti tal-entitajiet u tal-proprjetajiet, sejħiet remoti, kanali miftuħa u magħluqa, bl-esportazzjonijiet li jeħtieġ id-decoder | Squad, Dota 2 |
| `props` | kull proprjetà ta' entità li l-parser jaqra, kull darba li tinbidel | CS2 |
| `units` | stat għal kull unità barra mit-tabella tal-pożizzjonijiet | Dota 2 |
| `combatlog` | log tal-ġlieda, kull dħul b'kull qasam | Dota 2 |
| `strings` | kull dħul ta' kull tabella ta' stringi | CS2, Dota 2 |
| `objectives` | żoni tal-qbid u objectives, kull bidla bil-ħin tagħha | War Thunder |
| `raw` | stream live: kull pakkett, linja, dokument ta' API jew qari tal-memorja riċevut, sħiħ | is-sessjonijiet tal-watcher (`heat.raw.parquet`), ir-recorders tal-lap tal-għodda tal-qbid (`<stamp>_<game>.raw.parquet`), il-fajls tar-replay ta' osu!, LoL u Valorant tal-watcher |

Il-caricament tal-folder tal-viewer jaqbeż kull `*.<what>.parquet` ta' din il-lista, u kull `*.match.json`, `*.meta.json`, `*.summary.json` u s-sidecars l-oħra JSON; jekk tiftaħ wieħed minnhom waħdu, billi tagħżel jew tiġbed dak il-fajl biss, jitgħabba bħal kull tabella oħra (ara [Loading files](loading-files.md)).

Dawn huma l-fajls kif konvertitur jiktibhom bl-`--loose`. B'default, il-konverturi ta' War Thunder, CS2 u Tacview jgħaqqdu t-tabella, id-dokument u s-sidecars ta' partita f'fajl wieħed, `<match>.3dheat`, bl-istess ismijiet (ara [Fajl wieħed kull partita](container.md)); dan kollu hawn jgħodd għal kull membru.

### Kolonni {#columns}

Kull ringiel tas-sidecar huwa oġġett wieħed. Il-kolonni huma, f'dan l-ordni, dawk li japplikaw:

| Kolonna | Tip | X'inhi |
|---|---|---|
| `time` | float64 | sekondi fuq l-istess arloġġ bħall-`time` tat-tabella (jew `tick` fejn is-sors jgħodd tick; allura t-tnejn) |
| `type` | string (dictionary) | x'inhu l-oġġett, fit-termini tas-sors stess: tip ta' pakkett, numru tal-messaġġ, isem tal-avveniment, mogħdija tal-proprjetà, prefiss tal-linja |
| `name` | string (dictionary) | ismu fejn ikun magħruf (isem tal-komunità, isem tal-klassi), inkella vojt |
| `entity` / `unit` / `uid` / `player` | integer jew string | lil min jappartjeni, bl-istess ID tat-tabella, sabiex ringiel tas-sidecar jistgħu jingħaqdu ma' traċċa |
| `decoded` | string (JSON) | x'jinftiehem minnu, fejn ikun hemm xi ħaġa; inkella vojt |
| `payload` | binary | il-bytes tal-oġġett, sħaħ u mhux mibdul (sorsi binarji) |
| `text` | string | it-test tal-oġġett, sħiħ u mhux mibdul (sorsi tat-test: linja ta' log, oġġett JSON, blokk ta' key-value) |

Kolonni oħra huma permessi (bit offset, daqs, kanal). Stringi li jerġgħu jidhru jinkodifikaw bil-dictionary u l-fajl jinkiteb bil-zstd, sabiex sidecar jibqa' frazzjoni tad-daqs tal-replay stess.

Sidecar irid ikun biżżejjed waħdu: dekoder miktub aktar tard jaqra s-sidecar, qatt mhux ir-replay oriġinali. Fejn oġġett ma jistax jinftiehem mingħajr kuntest (klassi ta' entità, tabella ta' stringi, ċavetta li messaġġ jirreferi għaliha), il-kuntest jidħol fis-sidecar ukoll, jew fid-dokument tal-partita.

### Adapters live {#live-sources}

Adapters live (telemetrija UDP, memorja kondiviża, log tal-logħba, API lokali) m'għandhom l-ebda fajl li wieħed jista' jmur lura għalih. Huma jirrekordjaw **kull qasam li s-sors jibgħat**, anke dawk li għadu ħadd ma juża:

- stream ta' pakketti: kull pakkett sħiħ, `payload` il-bytes, `type` l-ID tal-pakkett jew il-format tiegħu, bir-rata li tasal;
- memorja kondiviża jew API mistħarrġa: kull qasam ta' kull qari, jew bħala kolonni bl-isem jew il-blokk sħiħ bħala `payload`, bir-rata li l-adapter jaqra;
- log: kull linja, `text` il-linja, `type` it-tip tal-linja, inkluż linji li l-adapter ma jaġixxix fuqhom.

Dawn imorru f'`<session>.raw.parquet` ħdejn it-tabella tas-sessjoni. Id-daqs huwa l-prezz tar-regola; jinżamm baxx permezz tal-zstd u tal-kodifikazzjoni tad-dictionary, mhux billi jitħallew oġġetti barra.

## L-awtoverifika {#the-self-check}

Kull konvertitur jikteb, fid-dokument tal-partita tiegħu (jew fl-`meta.json` tas-sessjoni, jew fis-sommarju fejn m'hemm l-ebda dokument tal-partita), blokk `completeness` taħt `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Qasam | Tfisser |
|---|---|
| `seen` | kemm hemm oġġetti ta' dan it-tip fis-sors |
| `decoded` | maqrija sħaħ fit-tabella jew fid-dokument tal-partita |
| `partial` | maqrija f'parti fit-tabella jew fid-dokument, u miżmuma sħiħa f'sidecar |
| `raw` | miżmuma sħiħa f'sidecar biss, mhux iddekodata |
| `lost` | `seen - decoded - partial - raw`: irid ikun 0 |

Il-`lost` fil-quċċata huwa s-somma. It-testijiet tal-konvertitur jafferma li huwa 0 fuq l-kampjuni sintetiċi tiegħu, u l-README tgħid kemm kien fuq dawk reali. `lost` mhux 0 huwa l-konvertitur jgħid li kiser ir-regola; jsemmi t-tip, sabiex it-toqba tkun tista' tinstab.

L-"types" huma dawk tas-sors: tipi ta' pakketti, numri tal-messaġġi, ismijiet tal-avvenimenti, gruppi ta' proprjetajiet, tipi ta' linji. Jingħaddu fejn jiltaqa' magħhom il-konvertitur, mhux minn lista ta' dak li jistenna, sabiex tip li ħadd ma kien jaf bih jidher bl-għadd tiegħu minflok ma jisparixxi.

## It-taqsima Completeness tal-README {#the-readmes-completeness-section}

Kull README ta' konvertitur għandu taqsima bit-titolu **Completeness**, b'tliet listi:

- **Read**: x'imur fit-tabella u fid-dokument tal-partita, u kif kull qasam ġdid ġie ċċekkjat ma' xi ħaġa indipendenti (in-numri tal-logħba stess, sors ieħor, rekording magħmul għall-iskop).
- **Kept raw**: x'jinsab f'liema sidecar, taħt liema `type`, u x'inhu magħruf dwaru s'issa.
- **Not available**: dak li s-sors ma jġorrux jew ma jistax jinqara, u għaliex.

Tirritorna għal hawn.

## Fejn jinsab kull konvertitur {#where-each-converter-stands}

| Konvertitur | Sidecars | It-taqsima Completeness tiegħu |
|---|---|---|
| Replays ta' War Thunder | `messages`, `flight` | [README ta' 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (l-għadd tal-awtoverifika tiegħu hemm taħt `counts`; il-blokk `completeness` għadu se jiġi) |
| Replays ta' World of Tanks | `messages` | [README ta' 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Replays ta' World of Warships | `messages` | [README ta' 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demos tas-server ta' Squad | `entities`, `packets` | [README ta' 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demos ta' CS2 | `events`, `props`, `strings`, `packets` | [README ta' 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Replays ta' Dota 2 (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Replays ta' Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Replays ta' osu!, LoL, Valorant (watcher) | `raw` | il-paġni tagħhom fid-[dokumentazzjoni tal-watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adapters live (watcher) | `raw` | il-paġna ta' kull logħba fid-[dokumentazzjoni tal-watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), u [l-iżvilupp](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) għal `Session.raw` |
| Recorders tal-lap (game capture) | `raw`, u bytes `unparsed` ġewwa fajl tal-lap ta' Forza | [README ta' 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| L-importazzjonijiet tal-viewer stess | l-ebda: ara hawn taħt | din il-paġna |

### L-importazzjonijiet tal-viewer stess {#the-viewers-own-imports}

Tacview ACMI, OCAP u l-formati tal-GPS jinqraw fil-browser mill-fajl tal-utent stess; il-viewer ma jaħżen xejn minnhom, allura l-fajl innifsu jibqa' r-rekord. Madankollu jaqraw kemm jistgħu:

- **Tacview ACMI** (`src/data/acmi.ts`): kull linja ta' oġġett b'pożizzjoni hija ringiel b'kull proprjetà li r-rekording iġorr, kull avveniment ringiel, kull tneħħija ringiel, il-proprjetajiet tar-rekording stess (bil-FileType u l-FileVersion tal-header) fuq kull ringiel bħala `RecordingInfo`; linja tal-kumment hija avveniment `Comment`, oġġett li qatt ma jieħu pożizzjoni ringiel `Unplaced` fil-punt ta' referenza, u U/V huma kolonni kull meta ringiel ikollu xi wieħed minnhom. Linja ta' proprjetà mingħajr pożizzjoni tinqara f'parti: il-valuri tagħha jaslu għall-ringiel li jmiss tal-oġġett, mhux fil-ħin tagħhom. `AcmiTable.completeness` jgħodd il-linji tal-fajl skont it-tip.
- **OCAP** (`src/data/ocap.ts`): il-frames, il-tiri, il-markers, kull tip ta' avveniment kollu (tipi mhux magħrufa bħala ringiel ta' "Mission" bit-test tagħhom) u l-oqsma tad-dokument stess (`Info`). Għadu ma jinqarax: oqsma tal-entità u elementi tal-pożizzjoni fi tmiemhom għajr dawk imsemmija fl-header tiegħu (żidiet ta' rekorder aktar ġdid), u l-frames ripetuti ta' unità mejta wara l-mewt tagħha (imnaqqsa apposta: xejn ma jinbidel fihom).
- **Formati tal-GPS** (`src/data/geoTracks.ts`): il-fixes, il-ħin tagħhom, l-għoli, il-kors u l-veloċità, u l-heart rate, il-cadence, il-power, it-temperatura, is-satellites, l-HDOP u l-għoli tal-pressjoni fejn il-fajl jirrekordjahom. Għadhom ma jinqrawx: estensjonijiet oħra ta' GPX u KML, sentenzi NMEA għajr dawk tal-pożizzjoni, rekords IGC għajr il-fixes u l-estensjonijiet tagħhom, u messaġġi FIT għajr ir-records (il-laps, is-sessjonijiet, l-informazzjoni tal-apparat).

Dawn it-toqob huma elenkati sabiex jingħalqu, mhux biex jiġu skużati; l-esportazzjonijiet tal-viewer ta' rekording mgħobbi (`src/data/exportRecording.ts`) jiktbu biss dak li tinqara.

## Iż-żieda ta' konvertitur {#adding-a-converter}

1. Elenka dak li l-format iżomm, mid-dokumentazzjoni tiegħu, mill-istrutturi tiegħu stess, jew billi tgħodd kull tip ta' messaġġ f'kampjuni reali. L-elenku huwa l-`types` tal-awtoverifika.
2. Iddekodita dak li jista' jiġi ċċekkjat issa. Kull qasam ġdid jiġi ċċekkjat ma' xi ħaġa indipendenti qabel ma jidħol fit-tabella; qasam li ma jistax jiġi ċċekkjat għadu stat raw.
3. Żomm il-bqija sħiħ f'sidecar imsemmi kif ġie msemmi hawn fuq, bil-kolonni ta' hawn fuq.
4. Ikteb il-blokk `completeness` u test li juri li `lost` huwa 0.
5. Ikteb it-taqsima Completeness tal-README u għaqqad ma' hawn.
6. Jekk `<what>` tas-sidecar ikun ġdid, żidu mat-tabella ta' hawn fuq u ma' `SIDECAR_PARQUET` f'`src/data/filePick.ts`.

Il-konverturi huma clean-room: miktuba mill-formati, mid-dokumentazzjoni u mill-kampjuni, qatt mhux minn kodiċi GPL jew AGPL. Kampjuni ta' replays reali jibqgħu fuq il-magna li għamlithom; it-testijiet jużaw fajls sintetiċi.
