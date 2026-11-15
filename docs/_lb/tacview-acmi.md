---
title: "Tacview-Opnamen (ACMI)"
parent: "Daten astellen"
nav_order: 7
lang: "lb"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---


# Tacview-Opnamen (ACMI)

Tacview ass e Programm, dat Flich an Fluchsimulatoren opholt; hir Dateien enden op `.acmi`. 3DHeat mécht se op, sou datt Dir gesitt, wou all Fliger gefloen ass.

Tacview-Flichopname lueden wéi all Tabell: wielt eng `.acmi` (Text, `.txt.acmi`, oder gezippt, `.zip.acmi`) aus oder zitt se eran, an dréckt **Lueden**. Dann kritt Dir d'Heat vun all Flich, an am Tab **Match** en Replay mat Figuren, Spuere a enger Eventlëscht ([Match-Replay](match-replay.md)). ACMI ass Tacview sengt ëffentlecht Dateiform ([Dokumentatioun](https://www.tacview.net/documentation/acmi/)); DCS (iwwer dem Exporter vu Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS an anerer schreiwen se, dofir liest dëst all dovun.

## Wat eng Opnam gëtt {#what-a-recording-becomes}

Eng Zeil all Kéier wann d'Positioun vun engem Objet geschriwwe gëtt, eng Zeil pro Event um Plaz vum Objet, a eng Zeil, wann e Objet fortgeet (`Removed`, wou en zulescht war). E Event ouni Objet, dat ee nach net gesinn huet - en Lesezeechen, eng Noriicht u jiddereen - ass eng Zeil vum Objet `(recording)` am Referenzpunkt. D'Opnam huet hir eege Liesanweisungen, dofir fëllt de Mapping-Schrëtt sech selwer aus. De Lieser schreift dës Kolonnen: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a derno all weider Eegenschaften, déi d'Opnam huet. Hir Rollen:

| Kolonn | Roll | Bedeitung |
|---|---|---|
| Time | Zäit | Sekonnen nom ReferenceTime vun der Opnam; Unix-Sekonnen, wann eng do ass, sou datt d'Auer déi richteg Zäit weist. |
| X, Y | Positioun | Ost a Nord, Meter, op enger Fläch, déi d'Äerd am Referenzpunkt vun der Opnam berréiert: Distanzen a Peilungen stëmmen dobäi, a wäit ewech siicht se um manner wéi een Tausendstel pro 100 km. Nord gëtt de -Z vun der Welt. |
| Altitude | Positioun (uewen) | Meter. |
| Object | Persoun | De Pilot an de Numm vum Objet mat senger ID, z. B. `Viper 1 (F-16C_50) #a01`; e Objet ouni Pilot `(T-90A) #401`. |
| Coalition | Team | D'Säit (oder d'Faarf, wann et keng Koalitioun gëtt). |
| Heading, Pitch | Siicht | Grad; Heading 0 ass Nord. |
| Recording | Sitzung | Den Titel vun der Opnam oder den Dateinumm: e puer Opname lueden nieft-nieneen, ouni datt hir Spuere zesummekommen. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | Filter | Fir d'Filtere behalen; Type an Name wielen d'[Figur](figures.md) vun all Objet, Event gëtt d'Eventlëscht vum Debrief, Roll kippt d'Fligerei. |
| U, V | | D'flaach Welt-Meter vum Spiel, wann all Probe se huet (DCS schreift se). |
| EventObjects | Filter | All Objeten, déi e Event nennt (`Message|a01|b02|...`), iwwer d'ID. |
| RecordingInfo | | D'eegen Eegenschaften vun der Opnam, wéi se an dem Moment waren - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - als JSON. |
| IAS, Mach, AOA, FuelWeight, ... | Filter | All aner numeresch Eegenschaft, déi d'Opnam huet. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | Filter | All aner Text-Eegenschaften, déi d'Opnam huet; eng Eegenschaft, deenen hire Wäert keng Zuel ass, ass Text. |

All véier Formen vun der Positioun bei Tacview ginn gelies (`lon|lat|alt`, mat `u|v`, mat `roll|pitch|yaw`, a mat alle deenen an enger Heading), a leer Felder behalen de leschten Wäert. `-id` läscht e Objet, an eng ID, déi nach eng Kéier benotzt gëtt, ass en neit Objet. Escaped Kommaen an weidergefouert Zeilen ginn och verschafft.

D'Positiounen ginn ëmmer aus Breet- a Längegrad projizéiert, ni aus U/V geholl; dofir deelen sech d'Opnamen all Spiller eng Projektioun mat engem Hannergrond vun der richteger Welt.

## DCS-Serveren: wien gewonnen huet, a wéi all Asaz opgehalen huet {#dcs-servers-who-won-and-how-each-sortie-ended}

En DCS-Multiplayer-Server hält seng Missiounen ronderëm d'Auer mat Tacview op, an e persistente PvP-Server leeft eng Campagne iwwer vill vun hinnen: eng Säit gewënnt, wann se all Fluchhafen, all FARP an all Zon vun der anerer hëlt, wat Deeg a vill Neistarte vun der Missioun dauert. D'Opnamen enthalen d'Flich, net d'Campagne: keng Noriicht seet, wien wat geholl huet, d'Fluchhäfe ginn eemol um Ufank geschriwwen, a keng seet, wien gewonnen huet. Den Tacview-Konverter (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) setzt dat, wat ee wësse kann, op all Zeil, a léisst eidel, wat een net wësse kann - en rifft ni.

| Kolonn | Bedeitung |
|---|---|
| `server` | de Server oder d'Campagne, aus dem Header vun der Opnam (säin Title, Author a Comments nennen déi bekannt ëffentlech Serveren - Blue Flag, SPS Contention, Growling Sidewinder; soss en Author, deen een nennt); `--server Name` nennt en fir e ganzen Dossier. Eng Opnam, där hire Header kee Server nennt - en Author wéi `Admin`, en Title a Comments, déi kee bekannte Server schreift -, bleift ouni Zouuerdnung: `server` eidel, och wann se vun der Opnamesäit vun engem Server erofgeluede gouf, well d'Säit och Missioune vun anere Communautéiten enthale kann |
| `mission` | den Title vun der Opnam ouni seng Versioun oder säi Campagnemount: `Operation_Example_V7.7.99` gëtt `Operation Example` |
| `campaign` | d'Campagnesronn, zu där d'Opnam gehéiert, no Server, Kaart an Nummer: `Example Server North 3`. Eng Opnam ass eng Sessioun (vun Neistart zu Neistart); eng Ronn leeft iwwer vill Sessiounen, Deeg oder Wochen |
| `round` | d'Nummer vun där Ronn: déi vum Server selwer, wou hien eng publizéiert, soss déi n-t Ronn, déi vun deem Server an där Kaart gesi gouf; aus engem Ronnen-Fichier (ënnen), eidel ouni een |
| `session` | d'Plaz vun der Opnam ënnert de Sessioune vun der Ronn, 1, 2, ...; `sessionStart` hiren echte Start (Unix-Sekonnen) |
| `heldRed`, `heldBlue` | déi ëmstridde Plazen, déi all Säit um Start vun der Sessioun gehal huet, aus engem verketten Ronnen-Fichier (ënnen) |
| `won`, `matchWon` | 1, wann d'Säit vun der Zeil (hir Color, Red oder Blue) dës Campagne gewonnen huet, 0, wann se verluer huet; eidel, wou kee Ronnen-Fichier e Gewënner nennt, an op neutralen Zeilen. Eng Campagne ass d'Ronn an de Match zugläich, dofir hunn déi zwou dat selwecht |
| `roundEndReason` | `capture` fir eng Campagne, déi gewonne gouf, andeems alles geholl gouf |
| `won`, `matchWon` op all Sessioun vun enger Ronn | d'Resultat vun der Ronn, op all Opnam dovun geschriwwen, soubal hiert Enn bekannt ass |
| `sortie` | op den Zeile vun engem Fliger: säi Fluch, 1, 2, ... vun Opstart zu Opstart; d'Zäit um Buedem virum éischten Opstart an no enger Landung zielt zum Fluch, zu deem se gehéiert |
| `sortieResult` | wéi dee Fluch opgehalen huet: `landed`, `landed damaged` (no engem Treffer an der Loft), `ejected`, `shot down`, `destroyed` (um Buedem), `crashed`, `despawned` (an der Loft verschwonnen ouni gesinnen Ursaach - e Spiller, dee geet), `airborne at end`, `no takeoff` |
| `sortieKills` | d'Ofschëss, déi dem Fliger an deem Fluch zougeschriwwe ginn |

Op engem persistente Server ass den Asaz d'Eenheet, déi eppes bedeit: filtert op `sortieResult` = `shot down`, fir ze gesinn, wou Flich verluer gaange sinn, oder schlësselt d'Hëtzt no `sortieResult` oder `server` an der [Opschlësselung](breakdown.md) op. D'Opstarten, Landungen, Ausstéiss, Ofschëss an Ofstierz, aus deenen en besteet, sinn d'Evenementer, déi de Konverter aus der Bewegung vun de Fligeren erausfënnt (uewen).

Plazen, déi tëscht zwou Sessioune vun enger Ronn geholl goufen - bekannt aus dem Ronnen-Fichier, ënnen -, sinn `capture`-Evenementer um Start vun der spéiderer Opnam: `Object` `(campaign)`, op der Plaz, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

E Fluchhafen oder e FARP, deen d'Säit wiesselt, wou d'Opnam et weist - nach eng Kéier an der anerer Faarf geschriwwen, oder ewechgeholl an a bannent fënnef Minutten op senger Plaz an der anerer Faarf nei geschriwwen -, gëtt e `capture`-Evenement um Pad: `Event` = `capture`, `Airfield` säin Numm, `Detail` `Red to Blue`, `Coalition` seng nei Säit. E Pad, deen fir d'éischt an enger Faarf geschriwwe gëtt, ass keng Eruewerung. D'Serveren, déi bis elo ugekuckt goufen, schreiwen hir Paden eemol, dofir enthalen hir Opnamen keng Eruewerungen.

### Ronnen-Fichieren {#rounds-files}

E Ronnen-Fichier seet, pro Server, seng Campagnesronnen, wien se gewonnen huet an d'Sessioune vun all Ronn. Hie kënnt aus deem, wat de Server publizéiert, oder aus den Opnamen selwer (ënnen).

Wien eng Campagne gewonnen huet, ass dat, wat de Server publizéiert - e Campagne-Logbuch op senger Websäit -, net eppes an der Opnam. E Ronnen-Fichier dréit et, an de Konverter liest en mat `--rounds file.json` (méi wéi een ass méiglech):

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

Eng Opnam gehéiert zu de Ronne vun hirem `server`, där hiren `title` (e reegelméissegen Ausdrock) op hiren Title passt; all Zeil zu der Ronn, an déi hir echt Zäit fält - d'RecordingTime vun der Opnam plus d'Sekonne vun der Zeil, net den Datum vun der Missioun am Spill. D'Zäite sinn UTC. Eng Ronn ouni Gewënner (gewiesselt, leeft nach) gëtt hiren Zeilen d'Nummer vun der Ronn an en eidelt Resultat.

D'Géigestéck vum Match-Dokument, de `acmi`-Fouss, seet, wouhier d'Resultat kënnt, sou wéi `result.source` vun engem War-Thunder-Match: `outcome.result` ass `{ winner, round, endReason, source }`, `source` d'`source` vum Ronnen-Fichier, oder `null`, wann näischt e Gewënner genannt huet. `outcome` lëscht och d'Ronne vun der Opnam, hir Eruewerungen an hir Asätz no hirem Enn:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Eng Zeil vun engem Pilot `Viper 1 (F-16C_50) #a01` op der Säit Blue an där Campagne liest dann: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Ronnen aus den Opnamen selwer {#rounds-from-the-recordings-themselves}

E persistente Server behält seng Campagne iwwer Neistarten eraus, an all Opnam fänkt mat de Buedemeenheeten an de Statics vu béide Säiten un, do wou d'Campagne se gelooss huet. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` liest déi éischt Minutte vun all Opnam ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), setzt d'Opnamen vun all Server op enger Kaart an déi zäitlech Reiefolleg a verkett se:

- **Plazen**: de Buedem a Zelle vu ronn 2 km; eng Zell gehéiert enger Säit, wann dräi Véierel vun den Eenheeten, déi do um Start vun enger Sessioun sinn, hir sinn. *Ëmstridde* Plazen sinn déi, déi gesi goufen, wéi béid Säite se gehal hunn.
- **Eruewerungen**: eng Plaz, déi um Start vun der nächster Sessioun vun der anerer Säit gehal gëtt - tëscht de Missioune geholl, oder während där virdrun.
- **Eng nei Ronn**: eng Sessioun, där hir Plazen sech vun deene vun der leschter a méi wéi 60% ënnerscheeden - d'Startopstellung vun enger neier Ronn, net e Schrëtt vun der aler. Eng Ronn hält och op, wann de Server op eng aner Kaart wiesselt (hir Sessioune fänken no der leschter un a ginn weider).
- **Wien gewonnen huet**: vun enger Ronn, déi opgehalen huet, d'Säit, déi um Start vun hirer leschter Sessioun all Plaz gehal huet (`capture`, Vertrauen héich), soss d'Säit, déi méi vun den ëmstriddene Plaze gehal huet (mëttel bei duebel sou vill wéi déi aner, soss niddreg; niddreg, wann se mat engem Kaartewiessel opgehalen huet). Eng oppe Ronn huet kee Gewënner, mee all Sessioun seet, wéi vill Plazen all Säit um Start gehal huet, sou datt ee gesäit, wie vir war.
- E Server, deem seng Sessiounen all gläich ufänken, behält keen Zoustand tëscht hinnen: e gëtt net verketten.

De Start vun der leschter Sessioun ka Stonne virum Enn vun der Ronn leien, dofir ass d'Vertrauen wichteg. Iwwerpréift géint e Server, deen seng Gewënner publizéiert: d'Kette huet all nei Ronn bei där Sessioun fonnt, wou déi publizéiert Ronn ugefaangen huet, an d'Säit, déi beim leschte Start vir war, war an all eenzel vun den 9 Ronnen, déi se iwwerpréiwe konnt, de publizéierte Gewënner. `--official file.json` behält déi publizéiert Ronne vun esou engem Server a setzt d'Sessioune vun der Kette derbäi; d'`validation` vum Fichier seet, wéi wäit d'Kette iwwereenstëmmt. An enger erfonnter Campagne:

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

### Eng Campagnesronn als Serie kucken {#watching-a-campaign-round-as-a-series}

Luet d'Opnamen vun enger Ronn zesummen - d'Fichieren, där hir `campaign` déi selwecht ass -, an de Viewer spillt se als eng Serie of: Sessioun no Sessioun an hirer echter Reiefolleg, d'Stonnen oder Deeg tëscht zwou op eng Paus vun enger Minutt gekierzt. D'Zäitlinn markéiert de Start vun all Sessioun a giel an d'Pausen als donkel Bänner, an d'Auer seet, wéi eng Sessioun leeft an hiren echten Datum (`session 4/12 · 2026-11-02 12:38 UTC`). Hëtzt, de Replay, Filteren an **Erkenntnisser** funktionéieren op der ganzer Serie wéi op all gelueden Daten. D'Sektioun **Campagnesronn** vum Tab **Match** lëscht d'Sessioune mat hiren Datumen, wéi vill ëmstridde Plazen all Säit bei all Start gehal huet - och als Grafik iwwer d'Ronn - a wéi vill virdru geholl goufen; e Klick geet op de Start vun enger Sessioun. Eng Opnam, déi eleng gelueden ass, seet do, wéi eng Ronn a Sessioun se ass. Opnamen aus verschiddene Ronnen, déi zesumme geluede ginn, sinn keng Serie: all fänkt bei null un, wéi separat Matcher. De Lueder fir vill Matcher (**Vill Matcher op eemol**) spillt eng Ronn och als Serie of, gestreamt an op d'GPU ofgestëmmt, fir Ronne vu ville Gigabyte.

D'Plazen, déi während der Ronn d'Säit gewiesselt hunn, ginn op der Kaart als Eruewerungszonen gezeechent, gefierft no der Säit, déi se um Start vun der lafender Sessioun gehal huet, a wiesselen un de Grenze vun de Sessiounen; all Wiessel ass eng Eruewerung an der Evenementlëscht vum Replay. Si ginn aus de geluedenen Zeilen erausfonnt - d'Buedemeenheeten an d'Statics vun all Sessioun an hiren éischte Minutten, a Zelle vu ronn 2 km, sou wéi d'Kette et mécht -, dofir brauche se de komplette Lueder (de Lueder fir vill Matcher behält ze wéineg vun all Zeil).

**Déi ganz Ronn aus enger vun hiren Opnamen lueden.** An engem einfache Browser kann de Viewer keng Fichieren opmaachen, déi Dir net ausgewielt hutt: luet d'Fichiere vun der Ronn zesummen. Wann de lokale Viewer-Server en ausliwwert (`npm run dev` oder `npm run preview`), kann en et: gitt der vu git ignoréierter `tools/local-data.json` en Androg `campaigns`, deen den Dossier vun de Ronnen-Fichieren an d'Dossiere vun de konvertéierten Opnamen nennt, an d'Sektioun Campagnesronn vun enger eenzeler Opnam bitt **Ganz Ronn lueden** un, hëlt d'Sessioune vun der Ronn, déi do fonnt ginn, a luet se mam Lueder fir vill Matcher:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Nëmmen d'Opnamen, déi e Ronnen-Fichier nennt, ginn ausgeliwwert (`tools/campaign-files.mjs`); eng Sessioun, déi ënner dësen Dossieren net fonnt gëtt, gëtt gezielt, net gelueden.

Wat déi bekannt Serveren publizéieren:

| Server | Eng Ronn | Wéi eng Säit gewënnt | Wou de Gewënner ze liesen ass |
|---|---|---|---|
| SPS Contention | eng Campagne op enger Kaart an Epoch (Deeg), iwwer vill Neistarten | all Fluchhafen, FARP a Stäerkt geholl; eng Campagne, déi ouni Gewënner opgehalen huet, gouf gewiesselt | dat ëffentlecht Campagne-Logbuch vum Server (Gewënner, Start, Enn pro Campagne) |
| Blue Flag | eng Campagnesronn iwwer vill Missioune vu 5 Stonnen; den `_YYYY_MM` vum Title geet pro Neistart ee Mount weider | all feindlech Positioun geholl; méi al Ronnen hunn d'Säit genannt, déi no enger fixer Zäit méi gehal huet | net publizéiert an enger Form, déi bis elo fonnt gouf; d'Kette vun den Opnamen verfollegt all Ronn a wien bei all Start wéi vill hält |
| Growling Sidewinder | e Missiounslaf (6 Stonnen) vun enger Open-Conflict-Missioun | Zonen a Fluchhäfe geholl | seng Statistiksäit weist Piloten, keng Resultater; all Sessioun fänkt gläich un, dofir geet keng Ronn iwwer Sessiounen: eidel |
| Missioune géint d'KI (Missioune mat Zonen eruewere) | e Missiounslaf | d'Säit vun de Spiller géint d'KI vun der Missioun: kee PvP-Resultat | eidel |
| Ouni Zouuerdnung (Header nennt kee Server) | - | - | eidel, `server` och eidel |
