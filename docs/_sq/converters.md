---
title: "Konvertuesit ruajnë gjithçka"
parent: "Si të futni të dhënat"
nav_order: 8
lang: "sq"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konvertuesit ruajnë gjithçka

Nuk ju duhet kjo faqe për të hapur një riluajtje. Është për njerëzit që shkruajnë mjete që kthejnë skedarët e lojërave në tabela të 3DHeat, dhe për kë dëshiron të dijë pse ato tabela mbajnë kaq shumë.

Çdo mjet që kthen një riluajtje, demo, regjistrim ose telemetri të drejtpërdrejtë të lojës në diçka që shikuesi e hap ndjek një rregull:

> **Konverto gjithçka që burimi mban dhe që mund të lexohet tani, dhe mbaj të tjerat të plota, që të lexohen më vonë pa skedarin origjinal.**

Një riluajtje shpesh humbet pas një përditësimi të lojës, një rinstalimi ose një disku të mbushur, dhe një rrjedhë e drejtpërdrejtë humbet në çastin që u dërgua. Ajo që heq një konvertues humbet përgjithmonë; ajo që mban të plotë mund të dekodohet ditën kur dikush e kupton. Prandaj një konvertues nuk vendos kurrë se çfarë do të jetë e dobishme: dekodon atë që mund, mban çdo mesazh, paketë, ngjarje, veti ose rresht tjetër të pandryshuar pranë tabelës, dhe thotë në vetë daljen e tij sa prej çdo lloji lexoi dhe sa vetëm mbajti.

Kjo faqe është konventa që ndajnë të gjithë konvertuesit: konvertuesit e riluajtjeve të War Thunder, World of Tanks, World of Warships dhe Squad, konvertuesi i demove të CS2, vëzhguesi i sfondit (dekoderi i riluajtjeve të Dota dhe çdo përshtatës i drejtpërdrejtë), lexuesit e telemetrisë së mjetit të regjistrimit të lojës, dhe importet e vetë shikuesit (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Lexuesit e vetë shikuesit përshkruhen te [regjistrimet Tacview](tacview-acmi.md) dhe [Ngarkimi i skedarëve](loading-files.md); forma me një skedar është [Një skedar për ndeshje](container.md). Një ndeshje bëhet një tabelë, një `match.json` dhe sidecar-e, opsionalisht e mbledhur në një skedar `.3dheat`. Çdo README i veglës ka një seksion **Completeness** që liston, për atë burim, çfarë lexohet, çfarë mbahet e papërpunuar dhe çfarë nuk është e disponueshme, dhe pse.

## Tre vende për çdo gjë {#three-homes-for-every-item}

Gjithçka që mban një burim përfundon në saktësisht një nga tre vendet:

| Vendi | Çfarë shkon atje |
|---|---|
| **I dekoduar** | Tabela (një rresht për mostër ose ngjarje, kolonat që lexon shikuesi, kolona shtesë për çdo vlerë tjetër që i përket një rreshti) dhe dokumenti i ndeshjes `<match>.match.json` (çdo gjë që i përket ndeshjes si e tërë: cilësimet, listat e lojtarëve, rezultatet, tabelat e rezultateve, vetëkontrolli). |
| **I mbajtur i papërpunuar** | Një sidecar pranë tabelës: çdo send që nuk është dekoduar, ose vetëm pjesërisht, i tërë dhe i pandryshuar, me llojin, kohën e tij dhe njësinë ose entitetin ku i përket. |
| **I pa disponueshëm** | Emërtuar te seksioni Completeness i README me arsyen: formati nuk e mban (një riluajtje klienti nuk ka hyrjet e lojtarëve të tjerë), burimi kurrë nuk e dërgon, ose leximi nuk është i lejuar (një proces i mbrojtur, një bllok i enkriptuar kyçi i të cilit nuk është yni për ta përdorur). |

Një send që është **pjesërisht** i dekoduar dekodohet *dhe* mbahet i papërpunuar: tabela merr atë që kuptohet, sidecar-i merr sendin e tërë, kështu që një dekoder më i mirë më vonë nuk ka nevojë për skedarin origjinal.

Nuk ka vend të katërt. Hedhja e diçkaje sepse dukej e padobishme, sepse ishte një kopje "ndoshta", ose sepse ishte e madhe, është një gabim. Pakësimi lejohet vetëm në tabelë (një kamerë me 2 Hz në vend të 60), kurrë në sidecar.

## Sidecar-et {#sidecars}

Një sidecar (skedar shoqërues) është një skedar Parquet pranë tabelës, i emërtuar sipas saj:

```
<folder>/<match>.parquet              tabela
<folder>/<match>.match.json           dokumenti i ndeshjes
<folder>/<match>.<what>.parquet       një sidecar
```

`<what>` është një fjalë nga kjo listë. Një konvertues i ri zgjedh fjalën që përshtatet, ose shton një të re këtu **dhe** te `SIDECAR_PARQUET` në [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), që shikuesi ta lërë jashtë kur ngarkohet një dosje e tërë.

| `<what>` | Mban | Përdoret nga |
|---|---|---|
| `messages` | paketa, thirrje metodash entitetesh dhe përditësime vetësh të një rrjedhe rrjeti, të tëra | War Thunder, World of Tanks, World of Warships |
| `flight` | hyrje modeli fluturimi për avion, të tëra | War Thunder |
| `packets` | korniza dhe mesazhe rrjeti të tëra, ose pjesë kontejneri, jashtë rrjedhës së entiteteve | CS2, Dota 2, Squad |
| `events` | ngjarje lojë me të gjitha çelësat e tyre, ashtu si i jep analizuesi | CS2 |
| `entities` | përditësime entitetesh dhe vetësh, thirrje në distancë, kanale të hapura dhe të mbyllura, me eksportet që i duhen një dekoderi | Squad, Dota 2 |
| `props` | çdo veti entiteti që lexon analizuesi, sa herë ka ndryshuar | CS2 |
| `units` | gjendja e njësive jashtë tabelës së pozicionit | Dota 2 |
| `combatlog` | një regjistër luftimi, çdo hyrje me çdo fushë | Dota 2 |
| `strings` | çdo hyrje e çdo tabele teksti | CS2, Dota 2 |
| `objectives` | zona kapjeje dhe objektiva, çdo ndryshim me kohën e vet | War Thunder |
| `raw` | një rrjedhë e drejtpërdrejtë: çdo paketë, rresht, dokument API ose lexim memorieje i marrë, i tërë | seancat e vëzhguesit (`heat.raw.parquet`), regjistruesit e xhirove të mjetit të regjistrimit të lojës (`<stamp>_<game>.raw.parquet`), skedarët e riluajtjes osu!, LoL dhe Valorant të vëzhguesit |

Ngarkimi i dosjes nga shikuesi kalon çdo `*.<what>.parquet` të kësaj liste, dhe çdo `*.match.json`, `*.meta.json`, `*.summary.json` dhe sidecar-et e tjera JSON; hapja e një prej tyre vetëm, duke e zgjedhur ose hedhur vetëm atë skedar, e ngarkon si çdo tabelë tjetër (shih [Ngarkimi i skedarëve](loading-files.md)).

Këto janë skedarët ashtu si i shkruan një konvertues me `--loose`. Si parazgjedhje konvertuesit e War Thunder, CS2 dhe Tacview e mbledhin tabelën, dokumentin dhe sidecar-et e një ndeshjeje në një skedar të vetëm, `<match>.3dheat`, me të njëjtat emra (shih [Një skedar për ndeshje](container.md)); gjithçka këtu vlen për secilin anëtar.

### Kolonat {#columns}

Çdo rresht sidecar-i është një send. Kolonat janë, në këtë renditje, ato që zbatohen:

| Kolona | Lloji | Çfarë |
|---|---|---|
| `time` | float64 | sekonda në të njëjtin orë si `time` e tabelës (ose `tick` aty ku burimi numëron tiket; atëherë të dyja) |
| `type` | string (fjalor) | çfarë është sendi, me termat e vetë burimit: një lloj paketë, një id mesazhi, një emër ngjarjeje, një shteg vetie, një prefiks rreshti |
| `name` | string (fjalor) | emri i tij aty ku njihet (një emër i komunitetit, një emër klase), përndryshe bosh |
| `entity` / `unit` / `uid` / `player` | numër i plotë ose string | kujt i përket, me të njëjtat id si tabela, që një rresht i sidecar-it të mund të lidhet me një gjurmë |
| `decoded` | string (JSON) | çfarë kuptohet për të, aty ku diçka kuptohet; përndryshe bosh |
| `payload` | binar | bajtet e sendit, të tëra dhe të pandryshuara (burime binare) |
| `text` | string | teksti i sendit, i tërë dhe i pandryshuar (burime tekstuale: një rresht regjistri, një objekt JSON, një bllok çift çelës-vlerë) |

Lejohen kolona të tjera (një zhvendosje biti, një madhësi, një kanal). Vargjet që përsëriten koduohen me fjalor dhe skedari shkruhet me zstd, kështu që një sidecar mbetet një pjesë e vogël e madhësisë së vetë riluajtjes.

Një sidecar duhet të mjaftojë vetë: një dekoder i shkruar më vonë e lexon sidecar-in, kurrë riluajtjen origjinale. Aty ku një send nuk mund të kuptohet pa kontekst (klasa e një entiteti, një tabelë tekstesh, një çelës ku i referohet një mesazh), konteksti shkon edhe ai në sidecar, ose në dokumentin e ndeshjes.

### Burimet e drejtpërdrejta {#live-sources}

Përshtatësit e drejtpërdrejtë (telemetria UDP, memoria e përbashkët, një skedar regjistri i lojës, një API lokale) nuk kanë fare një skedar ku të kthehen. Ata regjistrojnë **çdo fushë që dërgon burimi**, edhe ato që asgjë nuk i përdor ende:

- një rrjedhë paketash: çdo paketë e tërë, `payload` bajtet, `type` id-ja ose formati i saj e paketës, me shpejtësinë me të cilën vjen;
- memorie të përbashkët ose një API e pyetur: çdo fushë e çdo leximi, si kolona të emërtuara ose e tërë blloku si `payload`, me shpejtësinë me të cilën e lexon përshtatësi;
- një regjistër: çdo rresht, `text` është rreshti, `type` lloji i rreshtit, përfshirë rreshtat që përshtatësi nuk i vepron.

Këto shkojnë në `<session>.raw.parquet` pranë tabelës së seancës. Madhësia është çmimi i rregullit; mbahet e ulët nga zstd dhe koduesi i fjalorit, jo duke lënë gjëra jashtë.

## Vetëkontrolli {#the-self-check}

Çdo konvertues shkruan, në dokumentin e vet të ndeshjes (ose në `meta.json` të seancës, ose një përmbledhje aty ku nuk ka dokument ndeshjeje), një bllok `completeness` nën `selfCheck`:

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

| Fusha | Kuptimi |
|---|---|
| `seen` | sa sende të këtij lloji mban burimi |
| `decoded` | të lexuara të tëra në tabelë ose në dokumentin e ndeshjes |
| `partial` | të lexuara pjesërisht në tabelë ose dokument, dhe të mbajtura të tëra në një sidecar |
| `raw` | të mbajtura të tëra vetëm në një sidecar, pa u dekoduar |
| `lost` | `seen - decoded - partial - raw`: duhet të jetë 0 |

`lost` në nivelin e sipërm është shuma. Testet e një konvertuesi pohojnë se është 0 mbi mostrat e tij sintetike, dhe README thotë sa ishte mbi ato reale. Një `lost` jo zero është konvertuesi që thotë se e ka thyer rregullin; ai e emërton llojin, që hendeku të gjendet.

"Llojet" janë të burimit: lloje paketash, id mesazhesh, emra ngjarjesh, grupe vetësh, lloje rreshtash regjistri. Numërohen aty ku i takon konvertuesi, jo nga një listë e asaj që pret, kështu që një lloj që askush nuk e njihte shfaqet me numërimin e vet në vend që të zhduket.

## Seksioni Completeness i README {#the-readmes-completeness-section}

README e secilit konvertues ka një seksion me titull **Completeness**, me tre lista:

- **Lexuar**: çfarë shkon në tabelë dhe në dokumentin e ndeshjes, dhe si u kontrollua çdo fushë e re kundrejt diçkaje të pavarur (numrave vetë të lojës, një burimi të dytë, një regjistrimi të bërë për këtë qëllim).
- **Mbajtur i papërpunuar**: çfarë është në cilin sidecar, nën cilin `type`, dhe çfarë njihet për të deri tani.
- **Të pa disponueshme**: çfarë burimi nuk e mban ose nuk lejohet ta lexojmë, dhe pse.

Ai lidhet përsëri me këtë faqe.

## Ku qëndron çdo konvertues {#where-each-converter-stands}

| Konvertuesi | Sidecar-et | Seksioni i tij Completeness |
|---|---|---|
| Riluajtjet e War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (numërimet e vetëkontrollit të tij janë nën `counts`; blloku `completeness` do të vijë) |
| Riluajtjet e World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Riluajtjet e World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demot e serverit Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demot e CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Riluajtjet e Dota 2 (vëzhguesi) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Riluajtjet e Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Riluajtjet e osu!, LoL, Valorant (vëzhguesi) | `raw` | faqet e tyre te [dokumentet e vëzhguesit](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Përshtatësit e drejtpërdrejtë (vëzhguesi) | `raw` | faqja e secilës lojë te [dokumentet e vëzhguesit](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), dhe [zhvillimi](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) për `Session.raw` |
| Regjistruesit e xhirove (mjeti i regjistrimit të lojës) | `raw`, dhe bajtet `unparsed` brenda një skedari xhiroje Forza | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Importet e vetë shikuesit | asnjë: shih më poshtë | kjo faqe |

### Importet e vetë shikuesit {#the-viewers-own-imports}

Tacview ACMI, OCAP dhe formatet GPS lexohen në shfletues nga skedari i vetë përdoruesit; shikuesi nuk ruan asgjë prej tyre, kështu që vetë skedari mbetet regjistrimi. Megjithatë lexojnë sa më shumë mundet:

- **Tacview ACMI** (`src/data/acmi.ts`): çdo rresht objekti me pozicion është një rresht me çdo veti që mban regjistrimi, çdo ngjarje një rresht, çdo heqje një rresht, vetitë e vetë regjistrimit (me FileType dhe FileVersion të kokës) në çdo rresht si `RecordingInfo`; një rresht komenti është një ngjarje `Comment`, një objekt që kurrë nuk merr pozicion një rresht `Unplaced` te pika e referencës, dhe U/V janë kolona kurdo që ndonjë rresht i ka. Një rresht vetie pa pozicion lexohet pjesërisht: vlerat e tij arrijnë te rreshti tjetër i objektit, jo në kohën e tyre. `AcmiTable.completeness` numëron rreshtat e skedarit sipas llojit.
- **OCAP** (`src/data/ocap.ts`): kornizat, të shtënat, shënuesit e çdo entiteti, çdo lloj ngjarjeje (llojet e panjohura si rreshta "Mission" me tekstin e tyre) dhe fushat vetë të dokumentit (`Info`). Nuk lexohen ende: fushat e entiteteve dhe elementët e pozicionit në fund të tjerë nga ata të listuar në kokën e tij (shtesat e një regjistruesi më të ri), dhe kornizat e përsëritura të një njësie të vdekur pas vdekjes së saj (të pakësuara me qëllim: asgjë nuk ndryshon në to).
- **Formatet GPS** (`src/data/geoTracks.ts`): pikat e fiksimit, koha e tyre, lartësia, kursi dhe shpejtësia, dhe rrahja e zemrës, kadenca, fuqia, temperatura, satelitët, HDOP dhe lartësia e presionit aty ku skedari i regjistron. Nuk lexohen ende: zgjerime të tjera GPX dhe KML, fjali NMEA përveç atyre të pozicionit, rekorde IGC përveç fiksimeve dhe zgjerimeve të tyre, dhe mesazhe FIT përveç rekordeve (xhiro, seanca, informacion pajisjeje).

Këto hendekë listohen që të mbyllen, jo për t'i justifikuar; eksportet e shikuesit të një regjistrimi të ngarkuar (`src/data/exportRecording.ts`) shkruajnë vetëm atë që u lexua.

## Shtimi i një konvertuesi {#adding-a-converter}

1. Listoni çfarë mban formati, nga dokumentimi i tij, strukturat e veta, ose duke numëruar çdo lloj mesazhi në mostra reale. Lista është `types` e vetëkontrollit.
2. Dekodoni çfarë mund të kontrollohet tani. Çdo fushë e re kontrollohet kundrejt diçkaje të pavarur para se të shkojë në tabelë; një fushë që nuk mund të kontrollohet akoma mbetet e papërpunuar.
3. Mbajeni pjesën tjetër të tërë në një sidecar të emërtuar si më sipër, me kolonat si më sipër.
4. Shkruani bllokun `completeness` dhe një test që tregon `lost` 0.
5. Shkruani seksionin Completeness të README dhe lidheni me këtë faqe.
6. Nëse `<what>` i sidecar-it është i ri, shtojeni në tabelën më sipër dhe te `SIDECAR_PARQUET` në `src/data/filePick.ts`.

Konvertuesit janë "clean-room": shkruhen nga formatet, dokumentimi dhe mostrat, kurrë nga kodi GPL ose AGPL. Mostrat e riluajtjeve reale qëndrojnë në kompjuterin që i bëri ato; testet përdorin skedarë sintetikë.
