---
title: "Konverter behalen alles"
parent: "Daten astellen"
nav_order: 8
lang: "lb"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konverter behalen alles

Dir braucht dës Säit net, fir eng Replay opzemaachen. Si ass fir Leit, déi Werkzeuch schreiwen, déi Spillddateien a 3DHeat-Tabellen ëmwandelen, an fir jiddereen, deen wëssen wëll, firwat dës Tabellen sou vill halen.

All Werkzeug, dat d'Replay, d'Demo, d'Logbuch oder d'Live-Telemetrie vun engem Spill an eppes ëmwandelt, wat den Viewer opmécht, hält sech un eng Regel:

> **Konvertéiert alles, wat d'Quell haalt an deen elo gelies ka ginn, a behalt de Rescht ganz, sou datt en spéider ka gelies ginn ouni d'Originaldatei.**

Eng Replay ass dacks nom Spill-Update, enger Neiinstallatioun oder enger vollen Festplack fort, an en Live-Feed ass fort, sobal en geschéckt gouf. Wat en Konverter fale léisst, ass fir ëmmer verluer; wat hie ganz hält, kann een spéider liesen, sobal een et versteet. Also entscheet en Konverter ni, wat nëtzlech sinn gëtt: hien decodéiert, wat hien kann, a behält all aner Noriicht, Paket, Evenement, Propertie oder Zeil ganz nieft der Tabell, an sot a sengem eegene Output, wéi vill vun all dovun hie gelies huet a wéi vill hie nëmmen behalen huet.

Dës Säit ass d'Konventioun, déi all Konverter deelen: d'Replay-Konverter fir War Thunder, World of Tanks, World of Warships a Squad, den CS2-Demo-Konverter, de Hannergrondwächter (säi Dota-Replay-Decodéierer an all Live-Adapter), d'Telemetrie-Lieser vum Spill-Opnamwerkzeug, an d'eege Importer vum Viewer (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). D'eege Lieser vum Viewer sinn an [Tacview-Opnamen](tacview-acmi.md) an [Dateien lueden](loading-files.md) beschriwwen; d'Eng-Datei-Form ass [Eng Datei pro Match](container.md). E Match gëtt eng Tabell, en `match.json` an Nebendateien, déi optional an eng `.3dheat`-Datei gepackt ginn. All Werkzeug seng README huet e Ofschnëtt **Vollstänneg**, deen fir dës Quell lëscht, wat gelies gëtt, wat ganz behalen gëtt, a wat net verfügbar ass, an firwat.

## Dräi Plazen fir all Element {#three-homes-for-every-item}

Alles, wat eng Quell hält, endet an genau enger vun dräi Plazen:

| Plaz | Wat dohin kënnt |
|---|---|
| **Decodéiert** | D'Tabell (eng Zeil pro Probe oder Evenement, d'Spalten, déi den Viewer liest, zousätzlech Spalten fir all aner Wäert, deen zu enger Zeil gehéiert) an d'Matchdokument `<match>.match.json` (alles, wat zum Match als Ganzt gehéiert: Astellungen, Opstellungen, Resultater, Resultatstabell, d'Selbstkontroll). |
| **Roh behalen** | Eng Nebendatei nieft der Tabell: all Element, dat net oder nëmmen deels decodéiert ass, ganz a onverännert, mat sengem Typ, senger Zäit an der Unitéit oder Entitéit, zu där et gehéiert. |
| **Net verfügbar** | Am Ofschnëtt Vollstänneg vun der README mat dem Grond genannt: d'Format hält et net (eng Client-Replay huet keng Aginge vun den anere Spiller), d'Quell schéckt et ni, oder et ze liesen ass net erlaabt (e geschützten Prozess, en verschlësselte Block, deen net eise Schlëssel ass). |

En Element, dat **deels** decodéiert ass, ass decodéiert *an* roh behalen: d'Tabell kritt dat, wat verstane gëtt, d'Nebendatei dat ganzt Element, sou datt en méi gudden Decodéierer spéider d'Originaldatei net brauch.

Et gëtt keng véiert Plaz. Ewechlossen, well et nutzlos ausgesinn huet, well et e Duplikat „wahrscheinlech" war, oder well et grouss war, ass e Feeler. Verdënnen ass nëmmen an der Tabell erlaabt (eng Kamera mat 2 Hz statt 60), ni an der Nebendatei.

## Nebendateien {#sidecars}

Eng Nebendatei ass eng Parquet-Datei nieft der Tabell, mat dem selwechten Numm:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` ass ee Wuert aus dëser Lëscht. En neie Konverter wielt dat Wuert, dat passt, oder setzt hei en neit derbäi **an** an `SIDECAR_PARQUET` an [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), sou datt den Viewer se ewechléisst, wann ee ganze Dossier gelueden gëtt.

| `<what>` | Hält | Benotzt vun |
|---|---|---|
| `messages` | Pakete, Entitéits-Methodeopruffe a Propertie-Updates vun engem Netzwierkstroum, ganz | War Thunder, World of Tanks, World of Warships |
| `flight` | Flugmodell-Eegnunge pro Fliger, ganz | War Thunder |
| `packets` | ganz Frames a Netzwierknoriichten, oder Container-Stécker, ausserhalb vum Entitéitsstroum | CS2, Dota 2, Squad |
| `events` | Spill-Evenementer mat all hire Schlëssel, wéi den Parser se gëtt | CS2 |
| `entities` | Entitéits- a Propertie-Updates, Fernopruffe, Kanäl op- an zougemaach, mat den Exporten, déi e Decodéierer brauch | Squad, Dota 2 |
| `props` | all Entitéitspropertie, déi den Parser liest, jiddwer Kéier wann se sech geännert huet | CS2 |
| `units` | Zoustand vun den Eenheeten ausserhalb vun der Positiounstabell | Dota 2 |
| `combatlog` | e Kampflogbuch, all Eintrag mat all Feld | Dota 2 |
| `strings` | all Eintrag vun all Stringtabell | CS2, Dota 2 |
| `objectives` | Eruewerungszonen a Ziler, all Ännerung mat hirer Zäit | War Thunder |
| `raw` | e Live-Feed: all Paket, Zeil, API-Dokument oder Späicherliesung, déi ukomm ass, ganz | d'Sessioune vum Wächter (`heat.raw.parquet`), d'Lapen-Recorder vum Spill-Opnamwerkzeug (`<stamp>_<game>.raw.parquet`), d'osu!-, LoL- an Valorant-Replay-Dateien vum Wächter |

Den Dossier-Lueden vum Viewer iwwerspréngt all `*.<what>.parquet` vun dëser Lëscht an all `*.match.json`, `*.meta.json`, `*.summary.json` an déi anerer JSON-Nebendateien; wann Dir eng vun deenen eleng opmaacht, andeems Dir just déi Datei wielt oder fale léisst, gëtt se wéi all Tabell gelueden (kuckt [Dateien lueden](loading-files.md)).

Dat sinn d'Dateien, wéi se en Konverter mat `--loose` schreift. Standardméisseg packen d'War-Thunder-, CS2- an Tacview-Konverter d'Tabell, d'Dokument an d'Nebendateien vun engem Match an eng Datei, `<match>.3dheat`, ënner deenen Nimm (kuckt [Eng Datei pro Match](container.md)); alles hei gëllt fir all Member.

### Spalten {#columns}

All Nebendatei-Zeil ass ee Element. D'Spalten sinn, an dëser Reiefolleg, déi, déi gëllen:

| Spalt | Typ | Wat |
|---|---|---|
| `time` | float64 | Sekonnen op der selwechter Auer wéi `time` vun der Tabell (oder `tick`, wou d'Quell Ticks zielt; dann ëmmer béid) |
| `type` | string (Wörterbuch) | wat den Element ass, an de Wieren vun der Quell: en Paketentyp, eng Noriichts-ID, en Evenementnumm, e Propertie-Pad, e Zeilenufank |
| `name` | string (Wörterbuch) | säin Numm, wann een bekannt ass (en Gemeinschaftsnumm, en Klassennumm), soss eidel |
| `entity` / `unit` / `uid` / `player` | Ganzzuel oder String | wem en gehéiert, mat den selwechte IDen wéi an der Tabell, sou datt eng Zeil vun der Nebendatei mat engem Wee verbonne ka ginn |
| `decoded` | string (JSON) | wat dovun verstane gëtt, wann eppes verstane gëtt; soss eidel |
| `payload` | binär | d'Bytes vum Element, ganz a onverännert (Binär-Quellen) |
| `text` | string | de Text vum Element, ganz a onverännert (Text-Quellen: eng Logzeil, en JSON-Objekt, en Schlëssel-Wäert-Block) |

Weider Spalten sinn erlaabt (e Bitoffset, eng Gréisst, e Kanal). Wierder, déi sech widderhuelen, sinn am Wörterbuch kodéiert, an d'Datei gëtt mat zstd geschriwwen, sou datt eng Nebendatei nëmmen en Brochdeel vun der eegener Gréisst vun der Replay ass.

Eng Nebendatei muss eleng duergoen: e Decodéierer, deen spéider geschriwwe gëtt, liest d'Nebendatei, ni d'Originalreplay. Wou e Element ouni Kontext net verstane ka ginn (d'Klass vun enger Entitéit, eng Stringtabell, e Schlëssel, op deen eng Noriicht verweist), gëtt de Kontext och an d'Nebendatei geschriwwen oder an d'Matchdokument.

### Live-Quellen {#live-sources}

Live-Adaptere (UDP-Telemetrie, gemeinsame Späicher, e Spill-Logbuch, eng lokal API) hu gar keng Datei, zu där se zréckgoen kënnen. Si hale **all Feld, dat d'Quell schéckt**, och déi, déi näischt benotzt:

- en Paketfeed: all Paket ganz, `payload` d'Bytes, `type` seng Paket-ID oder Format, mat der Rate, wéi se ukënnt;
- gemeinsame Späicher oder eng gefrote API: all Feld vun all Liesung, entweder als benannte Spalten oder de ganze Block als `payload`, mat der Rate, wou den Adapter liest;
- e Logbuch: all Zeil, `text` d'Zeil, `type` d'Aart vun der Zeil, och Zeilen, déi den Adapter net notzt.

Dës Saache ginn an `<session>.raw.parquet` nieft der Tabell vun der Sessioun. D'Gréisst ass de Präis vun der Regel; si gëtt mat zstd an Wörterbuchkodéierung kleng gehalen, net andeems Dir Saache fortléisst.

## D'Selbstkontroll {#the-self-check}

All Konverter schreift an hiert Matchdokument (oder an d'`meta.json` vun der Sessioun, oder an eng Zesummefaassung, wann et kee Matchdokument gëtt) e Block `completeness` ënner `selfCheck`:

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

| Feld | Bedeitung |
|---|---|
| `seen` | wéivill Elementer vun dësem Typ d'Quell hält |
| `decoded` | ganz an d'Tabell oder d'Matchdokument gelies |
| `partial` | zum Deel an d'Tabell oder d'Dokument gelies, a ganz an enger Nebendatei behalen |
| `raw` | nëmmen an enger Nebendatei ganz behalen, net decodéiert |
| `lost` | `seen - decoded - partial - raw`: muss 0 sinn |

Dat `lost` um Enn ass d'Summ. D'Tester vun engem Konverter behaapten, datt et op hire synthetesche Beispiller 0 ass, an d'README seet, wat et op richtege war. E `lost`, deen net 0 ass, ass de Konverter, deen seet, datt hien d'Regel gebrach huet; hie nennt den Typ, sou datt d'Lück fonnt ka ginn.

D'„Typen" sinn d'Typen vun der Quell: Paketentypen, Noriichts-IDen, Evenementnimm, Propertiegruppen, Zeilenaarten. Si ginn gezielt, wou de Konverter se begéint, net aus enger Lëscht vun deem, wat hie erwaart, sou datt e Typ, deen kee gekannt huet, mat sengem Zuel opdaucht, anstatt ze verschwannen.

## Den Ofschnëtt Vollstänneg vun der README {#the-readmes-completeness-section}

D'README vun all Konverter huet e Ofschnëtt mat dem Titel **Vollstänneg**, mat dräi Lëschten:

- **Gelies**: wat an d'Tabell an d'Matchdokument geet, an wéi all nei Feld mat engem Onofhängege kontrolléiert gouf (d'eege Zuelen vum Spill, eng zweet Quell, eng Opnam, déi fir dat gemaach gouf).
- **Roh behalen**: wat an welcher Nebendatei ass, ënner wéi engem `type`, an wat bis elo dovun bekannt ass.
- **Net verfügbar**: wat d'Quell net dréit oder wat net gelies ka ginn, an firwat.

Si verlinkt zréck op dës Säit.

## Wou all Konverter steet {#where-each-converter-stands}

| Konverter | Nebendateien | Säin Ofschnëtt Vollstänneg |
|---|---|---|
| War-Thunder-Replays | `messages`, `flight` | [3DHeat-Ext-WarThunder-README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (seng Selbstkontroll-Zuelen stinn ënner `counts`; de Block `completeness` kënnt nach) |
| World-of-Tanks-Replays | `messages` | [3DHeat-Ext-WoT-README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World-of-Warships-Replays | `messages` | [3DHeat-Ext-WoWs-README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad-Serverdemoen | `entities`, `packets` | [3DHeat-Ext-Squad-README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-Demoen | `events`, `props`, `strings`, `packets` | [3DHeat-CS2-README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota-2-Replays (Wächter) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota-2-Replays](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!-, LoL-, Valorant-Replays (Wächter) | `raw` | hir Säiten an [de Wächter seng Dokumenter](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live-Adaptere (Wächter) | `raw` | d'Säit vun all Spill an [de Wächter seng Dokumenter](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), an [d'Entwécklung](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) fir `Session.raw` |
| Lapen-Recorder (Spill-Opnam) | `raw`, an `unparsed`-Bytes an enger Forza-Lap-Datei | [3DHeat-GameCapture-README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Dem Viewer seng eege Importer | keng: kuckt ënnen | dës Säit |

### Dem Viewer seng eege Importer {#the-viewers-own-imports}

Tacview ACMI, OCAP an d'GPS-Formater ginn am Browser aus der eegener Datei vum Benotzer gelies; de Viewer späichert näischt dovun, dofir bleift d'Datei selwer de Beleeg. Si liesen awer, sou vill si kënnen:

- **Tacview ACMI** (`src/data/acmi.ts`): all Objektzeil mat enger Positioun ass eng Zeil mat all Propertie, déi d'Opnam dréit, all Evenement eng Zeil, all Ewechhuelen eng Zeil, d'eege Propertien vun der Opnam (mat FileType a FileVersion vum Kapp) op all Zeil als `RecordingInfo`; eng Kommentarzeil ass e Evenement `Comment`, en Objet, dat ni eng Positioun kritt, eng Zeil `Unplaced` um Referenzpunkt, an U/V si Spalten, wann eng Zeil se hat. Eng Propertie-Zeil ouni Positioun gëtt zum Deel gelies: hir Wäerter kommen an déi nächst Zeil vum Objet, net op hirer eegener Zäit. `AcmiTable.completeness` zielt d'Zeilen vun der Datei no Aart.
- **OCAP** (`src/data/ocap.ts`): all Frames vun all Entitéit, Schëss, Markéierungen, all Evenementaart (onbekannt Aarten als Zeilen vu „Mission" mat hirem Text) an d'eegen Felder vum Dokument (`Info`). Nach net gelies: Entitéitsfelder a Positiounselementer um Enn, anerer wéi déi an sengem Kapp opgelëscht (Zousätz vun engem méi neie Recorder), an d'widderhuelend Frames vun enger doter Eenheet nom Doud (bewosst verdënnt: a deenen ännert sech näischt).
- **GPS-Formater** (`src/data/geoTracks.ts`): d'Fixen, hir Zäit, Héicht, Kurs an Geschwindegkeet, an Häerzfrequenz, Trëtt, Leeschtung, Temperatur, Satelliten, HDOP a Drockhéicht, wou d'Datei se logt. Nach net gelies: anerer GPX- an KML-Erweiderungen, NMEA-Sätz ausser de Positiounssätzen, IGC-Eintrëg ausser de Fixen an hire Erweiderungen, an FIT-Messagen ausser Records (Runden, Sessiounen, Geräteinfo).

Dës Lücken sinn opgelëscht, fir datt se zougemaach ginn, net fir se ze entschëllegen; d'Exporter vum Viewer vun enger gelueden Opnam (`src/data/exportRecording.ts`) schreiwen nëmmen, wat gelies gouf.

## En Konverter derbäisetzen {#adding-a-converter}

1. Lëscht op, wat d'Format hält, aus senger Dokumentatioun, aus senge eegene Strukturen, oder andeems Dir all Messagetyp a richtegen Proben zielt. D'Lëscht ass `types` vun der Selbstkontroll.
2. Decodéiert, wat elo kontrolléiert ka ginn. All nei Feld gëtt mat engem Onofhängege kontrolléiert, ier et an d'Tabell geet; e Feld, dat nach net kontrolléiert ka ginn, bleift roh.
3. Haalt de Rescht ganz an enger Nebendatei, mat dem Numm wéi uewen, mat de Spalten wéi uewen.
4. Schreift de Block `completeness` an e Test, datt `lost` 0 ass.
5. Schreift den Ofschnëtt Vollstänneg an der README a verlinkt hei.
6. Wann dat `<what>` vun der Nebendatei neit ass, setzt et an d'Tabell hei uewen an an `SIDECAR_PARQUET` an `src/data/filePick.ts`.

Konverter sinn clean-room: si gi aus Formater, Dokumentatioun an Proben geschriwwen, ni aus GPL- oder AGPL-Code. Proben vu richtegen Replays bleiwen op der Maschinn, déi se gemaach huet; d'Tester benotze synthetesch Dateien.

