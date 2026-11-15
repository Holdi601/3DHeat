---
title: "Regjistrimet Tacview (ACMI)"
parent: "Si të futni të dhënat"
nav_order: 7
lang: "sq"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Regjistrimet Tacview (ACMI)

Tacview është një program që regjistron fluturimet në simulatorët e fluturimit; skedarët e tij mbarojnë me `.acmi`. 3DHeat i hap, që të shohësh ku fluturoi çdo avion.

Regjistrimet e fluturimeve të Tacview ngarkohen si çdo tabelë: zgjidh ose lësho një `.acmi` (tekst, `.txt.acmi`, ose i zipuar, `.zip.acmi`) dhe shtyp **Ngarko**. Pastaj merr nxehtësinë e të gjitha fluturimeve, dhe në skedën **Ndeshja** një riprodhim me figura, gjurmë dhe listë ngjarjesh ([Riprodhimi i ndeshjes](match-replay.md)). ACMI është formati publik i skedarëve të Tacview ([dokumentimi](https://www.tacview.net/documentation/acmi/)); DCS (përmes eksportuesit të Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS dhe të tjerë e shkruajnë, kështu që kjo lexon çdonjërin prej tyre.

## Çfarë bëhet një regjistrim {#what-a-recording-becomes}

Një rresht për çdo herë që shkruhet pozicioni i një objekti, një rresht për çdo ngjarje te vendi i objektit, dhe një rresht kur një objekt largohet (`Removed`, aty ku ishte për herë të fundit). Një ngjarje për një objekt që nuk është parë ende - një shenjë, një mesazh për të gjithë - është një rresht i objektit `(recording)` te pika e referencës. Regjistrimi mbart vetë udhëzimet e veta të leximit, kështu që hapi i përshtatjes plotësohet vetë. Lexuesi shkruan këto kolona: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, pastaj çdo veti tjetër që ka regjistrimi. Rolet e tyre:

| Kolona | Roli | Kuptimi |
|---|---|---|
| Time | koha | Sekonda pas ReferenceTime të regjistrimit; sekonda Unix kur ka një të tillë, që ora të tregojë kohën reale. |
| X, Y | pozicioni | Lindje dhe veri, metra, në një plan që prek tokën te pika e referencës së regjistrimit: distancat dhe drejtimet janë të sakta afër saj, dhe shmangen nën një të mijtën në 100 km. Veriu bëhet -Z e botës. |
| Altitude | pozicioni (lart) | Metra. |
| Object | personi | Piloti dhe emri i objektit me ID-në e tij, p.sh. `Viper 1 (F-16C_50) #a01`; një objekt pa pilot `(T-90A) #401`. |
| Coalition | ekipi | Krahu (ose ngjyra, kur nuk ka koalicion). |
| Heading, Pitch | shikimi | Gradë; drejtimi 0 është veri. |
| Recording | seanca | Titulli i regjistrimit, ose emri i skedarit: disa regjistrime ngarkohen krah për krah pa i bashkuar gjurmët. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtrat | Mbahen për filtrim; Type dhe Name zgjedhin [figurën](figures.md) e çdo objekti, Event ushqen listën e ngjarjeve të debrifingut, Roll e anon avionin. |
| U, V | | Metrat e botës së sheshtë të vetë lojës, kur çdo mostër i ka ato (DCS i shkruan). |
| EventObjects | filtrat | Çdo objekt që e emëron një ngjarje (`Message|a01|b02|...`), sipas ID-së. |
| RecordingInfo | | Vetitë e vetë regjistrimit ashtu siç ishin në atë moment - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - si JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtrat | Çdo veti tjetër numerike që mban regjistrimi. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtrat | Çdo veti tjetër tekstuale që mban regjistrimi; një veti me çdo vlerë që nuk është numër është tekst. |

Të katër format e pozicionit të Tacview (`lon|lat|alt`, me `u|v`, me `roll|pitch|yaw`, dhe me të gjitha dhe një drejtim) lexohen; fushat boshe mbajnë vlerën e fundit; `-id` heq një objekt, dhe një ID e përdorur sërish pasi është hequr është objekt i ri. Presjet e shpëtuara dhe rreshtat e vazhduar trajtohen.

Pozicionet projektohen gjithmonë nga gjerësia dhe gjatësia gjeografike, kurrë nuk merren nga U/V, kështu që regjistrimet nga çdo lojë ndajnë një projeksion të vetëm me një sfond të botës reale.

## Serverët DCS: kush fitoi dhe si përfundoi çdo fluturim luftarak {#dcs-servers-who-won-and-how-each-sortie-ended}

Një server DCS me shumë lojtarë i regjistron misionet e tij me Tacview ditë e natë. Një server PvP i përhershëm zhvillon një fushatë përgjatë shumë prej tyre: një palë fiton kur merr çdo aeroport, FARP dhe zonë të palës tjetër, gjë që zgjat ditë dhe shumë rinisje të misionit. Regjistrimet mbajnë fluturimet, jo fushatën: asnjë mesazh nuk thotë kush mori çfarë, aeroportet shkruhen një herë në fillim dhe asgjë nuk thotë kush fitoi. Konvertuesi Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) i shton çdo rreshti atë që mund të dihet dhe lë bosh atë që nuk mund të dihet. Ai nuk hamendëson kurrë.

| Kolona | Kuptimi |
|---|---|
| `server` | serveri ose fushata, nga koka e regjistrimit (Title, Author dhe Comments e tij emërtojnë serverët publikë të njohur - Blue Flag, SPS Contention, Growling Sidewinder; përndryshe një Author që emërton dikë); `--server Name` i jep emër një dosjeje të tërë. Një regjistrim, koka e të cilit nuk emërton asnjë server - një Author si `Admin`, një Title dhe Comments që nuk i shkruan asnjë server i njohur - mbetet pa atribuim: `server` bosh, edhe kur është shkarkuar nga faqja e regjistrimeve të një serveri, sepse faqja mund të mbajë edhe misione të komuniteteve të tjera |
| `mission` | Title i regjistrimit pa versionin ose muajin e fushatës: `Operation_Example_V7.7.99` bëhet `Operation Example` |
| `campaign` | raundi i fushatës ku bën pjesë regjistrimi, sipas serverit, hartës dhe numrit: `Example Server North 3`. Një regjistrim është një seancë (nga rinisja në rinisje); një raund zgjat shumë seanca, ditë ose javë |
| `round` | numri i atij raundi: i vetë serverit, kur ai e publikon, përndryshe raundi i n-të i parë në atë server dhe hartë; nga një skedar raundesh (më poshtë), bosh pa të |
| `session` | vendi i regjistrimit mes seancave të raundit, 1, 2, ...; `sessionStart` fillimi i tij i vërtetë (sekonda Unix) |
| `heldRed`, `heldBlue` | vendet e kontestuara që mbante secila palë në fillim të seancës, nga një skedar raundesh i zinxhiruar (më poshtë) |
| `won`, `matchWon` | 1 kur pala e rreshtit (Color i tij, Red ose Blue) e fitoi atë fushatë, 0 kur e humbi; bosh kur asnjë skedar raundesh nuk emërton fitues, dhe në rreshtat neutralë. Një fushatë është njëkohësisht raundi dhe ndeshja, kështu që të dyja mbajnë të njëjtën vlerë |
| `roundEndReason` | `capture` për një fushatë të fituar duke marrë gjithçka |
| `won`, `matchWon` në çdo seancë të një raundi | rezultati i raundit, i shkruar në çdo regjistrim të tij sapo dihet fundi i tij |
| `sortie` | në rreshtat e një avioni: fluturimi i tij, 1, 2, ... nga ngritja në ngritje; koha në tokë para ngritjes së parë dhe pas një uljeje i përket fluturimit ku bën pjesë |
| `sortieResult` | si përfundoi ai fluturim: `landed`, `landed damaged` (pas një goditjeje në ajër), `ejected`, `shot down`, `destroyed` (në tokë), `crashed`, `despawned` (u zhduk në ajër pa shkak të parë - një lojtar që doli), `airborne at end`, `no takeoff` |
| `sortieKills` | rrëzimet që i njihen avionit në atë fluturim |

Në një server të përhershëm, fluturimi luftarak është njësia që ka kuptim. Filtro me `sortieResult` = `shot down` për të parë ku humbën fluturimet, ose ndaje nxehtësinë sipas `sortieResult` ose `server` te [zbërthimi](breakdown.md). Ngritjet, uljet, katapultimet, rrëzimet dhe përplasjet nga të cilat përbëhet janë ngjarjet që konvertuesi i nxjerr nga mënyra si lëviz avioni (më sipër).

Vendet e marra mes dy seancave të një raundi (të njohura nga skedari i raundeve, më poshtë) janë ngjarje `capture` në fillim të regjistrimit të mëvonshëm: `Object` `(campaign)`, te vendi, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Një aeroport ose FARP që ndërron palë aty ku e tregon regjistrimi (shkruar sërish me ngjyrën e palës tjetër, ose fshirë dhe shkruar sërish në vendin e tij me ngjyrën e tjetrës brenda pesë minutave) bëhet ngjarje `capture` te pista: `Event` = `capture`, `Airfield` emri i saj, `Detail` `Red to Blue`, `Coalition` pala e saj e re. Një pistë e shkruar për herë të parë me një ngjyrë nuk është pushtim. Serverët e parë deri tani i shkruajnë pistat e tyre një herë, kështu që regjistrimet e tyre nuk kanë pushtime.

### Skedarët e raundeve {#rounds-files}

Një skedar raundesh tregon, për çdo server, raundet e fushatës së tij, kush i fitoi dhe seancat e secilit. Vjen nga ajo që publikon serveri, ose nga vetë regjistrimet (më poshtë).

Kush e fitoi një fushatë është ajo që publikon serveri (një regjistër fushate në faqen e tij të internetit), jo diçka në regjistrim. Një skedar raundesh e mbart këtë, dhe konvertuesi e lexon me `--rounds file.json` (mund të jepen më shumë se një):

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

Një regjistrim u përket atyre raundeve të `server` të tij, `title` i të cilëve (një shprehje e rregullt) përputhet me Title të tij. Çdo rresht i përket raundit ku bie koha e tij e vërtetë: RecordingTime i regjistrimit plus sekondat e rreshtit, jo data e misionit brenda lojës. Orët janë në UTC. Një raund pa fitues (i ndërruar, ende në vazhdim) u jep rreshtave të tij numrin e raundit dhe një rezultat bosh.

Homologu i dokumentit të ndeshjes, fundfaqja `acmi`, tregon nga erdhi rezultati, siç bën `result.source` i një ndeshjeje War Thunder: `outcome.result` është `{ winner, round, endReason, source }`, ku `source` është `source` i skedarit të raundeve, ose `null` kur asgjë nuk emërtoi fitues. `outcome` rendit gjithashtu raundet e regjistrimit, pushtimet e tij dhe fluturimet e tij sipas mënyrës si përfunduan:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Një rresht i pilotit `Viper 1 (F-16C_50) #a01` në palën blu në atë fushatë atëherë lexohet: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Raunde nga vetë regjistrimet {#rounds-from-the-recordings-themselves}

Një server i përhershëm e mban fushatën e tij nga një rinisje në tjetrën, dhe çdo regjistrim nis me njësitë tokësore dhe objektet statike të të dyja palëve aty ku i la fushata. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` lexon minutat e para të çdo regjistrimi ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), vendos regjistrimet e çdo serveri në një hartë sipas kohës dhe i lidh në zinxhir:

- **Vende**: terreni në qeliza rreth 2 km; një qelizë është e një pale kur tri të katërtat e njësive aty në fillim të një seance janë të sajat. Vendet *e kontestuara* janë ato që janë parë në duart e të dyja palëve.
- **Pushtime**: një vend që në fillim të seancës së ardhshme e mban pala tjetër - i marrë mes misioneve, ose gjatë asaj të mëparshme.
- **Një raund i ri**: një seancë, vendet e së cilës ndryshojnë nga ato të së mëparshmes në më shumë se 60% të tyre - vendosja fillestare e një raundi të ri, jo një hap i të vjetrit. Një raund përfundon gjithashtu kur serveri kalon në një hartë tjetër (seancat e tij nisin pas së fundit dhe vazhdojnë).
- **Kush fitoi**: në një raund që përfundoi, pala që mbante çdo vend në fillim të seancës së tij të fundit (`capture`, besueshmëri e lartë), përndryshe pala që mbante më shumë vende të kontestuara (mesatare kur janë dyfishi i tjetrës, përndryshe e ulët; e ulët kur përfundoi me ndërrim harte). Një raund i hapur nuk ka fitues, por çdo seancë tregon sa vende mbante secila palë në fillim të saj, kështu që duket kush ishte përpara.
- Një server, seancat e të cilit nisin të gjitha njësoj, nuk mban gjendje mes tyre: nuk lidhet në zinxhir.

Fillimi i seancës së fundit mund të jetë orë para fundit të raundit, prandaj besueshmëria ka rëndësi. U kontrollua në një server që publikon fituesit e tij: zinxhiri gjeti çdo raund të ri te seanca ku nisi raundi i publikuar, dhe pala përpara në fillimin e fundit ishte fituesi i publikuar në secilin nga 9 raundet që mundi të kontrollonte. `--official file.json` mban raundet e publikuara të një serveri të tillë dhe u shton seancat e zinxhirit; fusha `validation` e skedarit tregon sa u përputh zinxhiri. Në një fushatë të sajuar:

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

### Shikimi i një raundi fushate si seri {#watching-a-campaign-round-as-a-series}

Ngarko bashkë regjistrimet e një raundi (skedarët me të njëjtin `campaign`) dhe shikuesi i luan si një seri: seancë pas seance në rendin e tyre të vërtetë, me orët ose ditët mes dyve të shkurtuara në një pushim prej një minute. Vija kohore shënon fillimin e çdo seance me të verdhë dhe pushimet si shirita të errët, dhe ora tregon cila seancë po luhet dhe datën e saj të vërtetë (`session 4/12 · 2026-11-02 12:38 UTC`). Nxehtësia, përsëritja, filtrat dhe Insights punojnë në të gjithë serinë si në çdo të dhënë të ngarkuar. Seksioni **Raundi i fushatës** i skedës **Ndeshja** rendit seancat me datat e tyre, sa vende të kontestuara mbante secila palë në çdo fillim (edhe si grafik përgjatë raundit) dhe sa u morën para tij; një klikim të çon te fillimi i një seance. Një regjistrim i ngarkuar vetëm tregon aty cili raund dhe cila seancë është. Regjistrimet e raundeve të ndryshme të ngarkuara bashkë nuk janë seri: secili nis nga zero, si ndeshjet e veçanta. Ngarkuesi i shumë ndeshjeve (**Shumë ndeshje njëherësh**) e luan gjithashtu një raund si seri, me rrjedhë dhe i përmasuar sipas GPU-së, për raunde prej shumë gigabajtësh.

Vendet që ndërruan duar gjatë raundit vizatohen në hartë si zona kapjeje, të ngjyrosura sipas palës që mbante secilin në fillim të seancës që po luhet, dhe ndërrojnë në kufijtë e seancave; çdo ndryshim është një pushtim në listën e ngjarjeve të përsëritjes. Ato nxirren nga rreshtat e ngarkuar (njësitë tokësore dhe objektet statike të çdo seance në minutat e saj të para, në qeliza rreth 2 km, siç bën zinxhiri), kështu që kanë nevojë për ngarkuesin e plotë (ngarkuesi i shumë ndeshjeve mban shumë pak nga çdo rresht).

**Ngarkimi i të gjithë raundit nga një prej regjistrimeve të tij.** Në një shfletues të zakonshëm, shikuesi nuk mund të hapë skedarë që nuk i ke zgjedhur ti: ngarko bashkë skedarët e raundit. Kur e shërben serveri lokal i shikuesit (`npm run dev` ose `npm run preview`), mundet: jepi skedarit `tools/local-data.json`, të cilin git e shpërfill, një hyrje `campaigns` që emërton dosjen e skedarëve të raundeve dhe dosjet e regjistrimeve të konvertuara. Atëherë seksioni Raundi i fushatës i një regjistrimi të vetëm ofron **Ngarko gjithë raundin**: merr seancat e raundit të gjetura aty dhe i ngarkon me ngarkuesin e shumë ndeshjeve:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Shërbehen vetëm regjistrimet që emërton një skedar raundesh (`tools/campaign-files.mjs`); një seancë që nuk gjendet në ato dosje numërohet, nuk ngarkohet.

Çfarë publikojnë serverët e njohur:

| Serveri | Një raund | Si fiton një palë | Ku mund të lexohet fituesi |
|---|---|---|---|
| SPS Contention | një fushatë në një hartë dhe një epokë (ditë), përgjatë shumë rinisjeve | çdo aeroport, FARP dhe fortesë e marrë; një fushatë që përfundoi pa fitues u ndërrua | regjistri publik i fushatave i serverit (fituesi, fillimi, fundi për çdo fushatë) |
| Blue Flag | një raund fushate përgjatë shumë misioneve 5-orëshe; `_YYYY_MM` i Title përparon një muaj në çdo rinisje | çdo pozicion armik i marrë; raundet më të vjetra shpallnin palën që mbante më shumë pas një kohe të caktuar | nuk publikohet në një formë të gjetur deri tani; zinxhiri i regjistrimeve ndjek çdo raund dhe kush mban sa në çdo fillim |
| Growling Sidewinder | një ekzekutim (6 orë) i një misioni me konflikt të hapur | zona dhe aeroporte të marra | faqja e tij e statistikave tregon pilotë, jo rezultate; çdo seancë nis njësoj, kështu që asnjë raund nuk shtrihet në disa seanca: bosh |
| Misione kundër AI-së (misione kapjeje zonash) | një ekzekutim misioni | pala e lojtarëve kundër AI-së së misionit: asnjë rezultat PvP | bosh |
| Pa atribuim (koka nuk emërton asnjë server) | - | - | bosh, edhe `server` bosh |
