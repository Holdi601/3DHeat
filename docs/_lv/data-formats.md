---
title: "Datu formātu uzziņa"
nav_order: 19
lang: "lv"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Datu formātu uzziņa

Šajā lapā ir uzskaitīts katrs failu veids, ko 3DHeat var atvērt, un tas, kādai jābūt tabulai tā iekšienē. Tabula ir rindas un kolonnas, kā izklājlapā: katra rinda saka, kur kaut kas bija un, ja tas ir zināms, kad un kas to izdarīja.

Šeit ir aprakstīts, ko Siltuma karte lasa kolonnu pa kolonnai, un norādes, ko Parquet fails var saturēt. (Cilne Sacīkšu analīze lasa apļu failus, bet cilne Spēles analīze — spēļu kopsavilkumus; skatiet [Sacīkšu analīze](race-analysis.md) un [Spēles analīze (CS2)](match-analysis.md).)

## Faili {#files}

Šis ir pilnais sarakstā ielādējamo failu uzskaitījums. Panelis **Avots** (**Faili…**, **Mape…** vai vilkšana un nomešana) pieņem tieši šos:

| Paplašinājums | Kas tas ir | Lasa |
|---|---|---|
| `.parquet`, `.pq` | Parquet tabula | Parquet lasītājs (zemāk) |
| `.csv`, `.tsv`, `.txt` | Ar atdalītāju atdalīts teksts | teksta lasītājs (zemāk) |
| `.3dheat` | Viena spēle vienā failā (ZIP, kurā ir tabula un tās papildu dati) | ielādējas kā tabula, ko tas satur — [Viens fails vienai spēlei](container.md) |
| `.acmi` (arī `.txt.acmi`, `.zip.acmi`) | Tacview lidojuma ieraksts | savs lasītājs — [Tacview ieraksti](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP ieraksts (Arma tipa) | savs lasītājs |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS trases: GPX, KML/KMZ, NMEA žurnāli, IGC planieru žurnāli, FIT sporta faili | savs lasītājs; pozīcijas nāk no platuma un garuma |

Kā pozīcijas netiek ielādēti mazie JSON faili, kas stāv blakus tabulai un to apraksta (faili ar nosaukumiem `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), un konvertētāja papildu tabulas (`<spēle>.events.parquet` un tamlīdzīgi, skatiet [Konvertētāji](converters.md)), ja vien tās neizvēlaties atsevišķi. Viss pārējais tiek izlaists ar iemeslu. Kā atlase tiek filtrēta, paskaidrots lapā [Failu ielāde](loading-files.md#which-files-are-kept).

Tukšie faili tiek izlaisti. Atlasē, kurā ir `movement*.<paplašinājums>` faili, ielādējas tikai tie ([Failu ielāde](loading-files.md#which-files-are-kept)).

Dati ir **viena rinda vienam paraugam**: pozīcija kādā brīdī, pēc izvēles ar to, kas tas ir, kura grupa, kura sesija, kur skatījās, un jebkuras citas kolonnas. Notikumu rindas (nāve, bumbas uzstādīšana, šāviens) var atrasties tajā pašā tabulā kā pozīciju rindas; atšķir tās pēc notikuma kolonnas.

## Teksts ar atdalītājiem (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Vismazākais noderīgais fails, trīs rindas:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolonnas sasaistās pašas ([Kolonnu atbilstība](column-mapping.md)).

Lasa baitu līmeņa skeneris, kas atšifrē tikai sasaistītās kolonnas ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekts | Noteikums |
|---|---|
| Galvene | Pirmā neiztukšā rindiņa satur kolonnu nosaukumus. Tukšs nosaukums kļūst par `column_N`. |
| Atdalītājs | Nosaka no pirmajām 20 neiztukšajām rindām pirmajā 1 MiB, starp komatu, semikolu, tabulēšanas zīmi un cauruli, pēc **konsekvences**: atdalītājs, kas katrā paraugrindā dod to pašu lauku skaitu, uzvar, tad tas, kas dod vairāk lauku. Atstarpi nekad neatpazīst, bet to var izvēlēties; var ierakstīt jebkuru vienu rakstzīmi ([Kolonnu atbilstība](column-mapping.md#the-fields)). |
| Pēdiņas | RFC 4180: lauki var būt ievietoti dubultās pēdiņās, `""` pēdiņās ir burtisks pēdiņu simbols. |
| Atstarpes | Vadošās un beigu atstarpes, tabulēšanas zīmes un pēdiņas tiek apgrieztas katrā laukā. |
| Lauki vienā rindā | Ne vairāk kā 4 096; vairāk ir kļūda (*vai atdalītājs ir pareizs?*). |
| Skaitļi | Pēc izvēles zīme, cipari, pēc izvēles `.` un decimāldaļas, pēc izvēles eksponents (`1.5e-3`). Decimālkomats (`1,5`), tūkstošu atdalītāji vai mērvienības aiz skaitļa (`12 m`) netiek nolasīti un tiek uzskatīti par trūkstošiem. Ja jūsu failā ir decimālkomati, pirms ielādes nomainiet tos ar punktiem (to var izdarīt teksta redaktorā ar meklēšanu un aizvietošanu). |
| Skaitliska kolonna | Kolonna tiek piedāvāta kā skaitliska, ja vairāk nekā 90% no neiztukšajām vērtībām pirmajās 50 rindās nolasās kā skaitļi. |
| Rindu skaits | Tiek aprēķināts pirms ielādes pēc pirmā 1 MiB vidējā rindas garuma. |
| Teksta kodējums | UTF-8. |

## Parquet {#parquet}

Lasa ar [hyparquet](https://github.com/hyparam/hyparquet), kolonnu daļu pa daļai tipizētos masīvos, pieprasot tikai sasaistītās kolonnas ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekts | Noteikums |
|---|---|
| Rindu skaits | Precīzs, no faila beigu daļas, pirms ielādes. |
| Priekšskatījums | Pirmās 50 rindas, atšifrētas kā objekti; to vērtības nosaka, kuras kolonnas izskatās skaitliskas. |
| Veseli skaitļi | `INT32` un `INT64` (atšifrēts kā BigInt) kļūst par skaitļiem. |
| Peldošā komata skaitļi | `FLOAT`, `DOUBLE`. |
| Būla vērtības | 1 un 0. |
| Teksti | Izmanto personu, grupu, sesiju un kategoriju kolonnām; teksts, kas izskatās kā skaitlis, tiek pieņemts skaitliskām lomām. |
| `TIMESTAMP`, `DATE` loģiskie tipi | Atšifrē kā momentus (milisekundes kopš 1970); ja izmanto kā laika asi, mērvienības iestatījums tiek ignorēts. |
| Ligzdotas kolonnas | Struct un list kolonnas nav domātas nevienai lomai (rāda kā JSON tekstu); nav pārbaudīts. |
| Beigu daļas metadati | Atslēga `heat3d` tiek nolasīta kā sasaistes norādes (zemāk). |

Pozīcijas, laika vai skatienu kolonna, kurā ir kaut kas cits, nevis skaitlis, tiek atšifrēta kā trūkstoša.

## Kolonnu lomas un tipi {#column-roles-and-types}

| Loma | Tips failā | Obligāta | Saglabāta kā | Ierobežojumi |
|---|---|---|---|---|
| X, Y, Z | skaitlis | divas no trim | 32 bitu peldošais skaitlis, pēc [ass sasaistes](axes-units-and-time.md) | Rinda bez lietojamas pozīcijas tiek izmesta. |
| Laiks | skaitlis vienā no [laika mērvienībām](axes-units-and-time.md#time-units), Parquet laika zīmogs vai ISO-8601 teksts | nē | 32 bitu peldošie sekundes no agrākās rindas | Kārtošana tiek atteikta virs 400 000 000 rindām ([kāpēc](memory-and-budgets.md#the-sort-ceiling)). |
| Persona | jebkas; vārdnīcas kodēts | nē | 32 bitu id | |
| Sesija | jebkas; vārdnīcas kodēts | nē | 32 bitu id | Iezīmes uzskaitītas līdz 100 000 sesijām. |
| Grupa | jebkas; vārdnīcas kodēts | nē | 16 bitu id | Līdz 4 096 grupām, citādi grupēšana tiek atmesta. |
| Yaw, pitch | skaitlis, grādi vai radiāni | nē | 32 bitu peldošais skaitlis radiānos | |
| Virziens X, Y, Z | skaitlis | nē (visi trīs kopā) | pārvērsts yaw un pitch | |
| Filtra kolonna, *diapazons* | skaitlis | nē | 32 bitu peldošais skaitlis | Līdz 4 aktīviem filtriem vienlaikus. |
| Filtra kolonna, *kategorija* | jebkas; vārdnīcas kodēts | nē | 32 bitu id | Līdz 4 096 vērtībām, citādi kolonna netiek saglabāta. |

Parquet `TIMESTAMP` kolonna, kas saglabāta kā filtra kolonna, ir *diapazons* epohas milisekundēs — slīdnis, nevis saraksts.

## Iznākuma kolonnas {#outcome-columns}

Kurš uzvarēja, katrā rindā, lai vietu, maršrutu vai gājienu varētu vērtēt pēc tā, cik bieži tā puse beigās uzvarēja ([Uzvaru daļa](win-rate.md)). Skatītājs pats patur šīs kolonnas, uzskaita tās pirmās [filtros](filters.md) skatītāja valodā un nolasa tās [uzvaru kartē](win-rate.md), [sadalījumā](breakdown.md) un [tilpumu statistikā](volumes.md#statistics). Konvertētājs raundu spēlei (CS2, Valorant, Rainbow Six Siege) vai spēlei, kas notiek kā viens mačs (War Thunder), raksta visas četras; Tacview konvertētājs tās raksta DCS servera kampaņām, kur kārtu fails saka, kurš uzvarēja ([DCS serveri](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Kolonna | Tips | Nozīme |
|---|---|---|
| `won` | 0/1 (tukša, ja nav zināms) | rindas puse (komanda) uzvarēja **raundā**; spēlē bez raundiem - mačā |
| `matchWon` | 0/1 (tukša, ja nav zināms) | rindas puse (komanda) uzvarēja **mačā**; tukša, ja ieraksts nerāda beigas |
| `round` | vesels skaitlis, no 1 | raunds, kuram rinda pieder; spēlē bez raundiem visu laiku 1 |
| `roundEndReason` | teksts | kā raunds beidzās (spēlē bez raundiem - mačs), ar zemāk esošajiem vārdiem |

`won` un `matchWon` pieder rindas pusei: T spēlētāja rindām ir T puses iznākums, AI vienības rindām - tās komandas; rindām, kas nepieder nevienai pusei, tās paliek tukšas. Puse, kas mainās puslaikā, patur savu `matchWon` un ņem katra raunda `won` tā, kā to spēlēja. Neizšķirts ir 0 abām pusēm.

Beigu iemesli ir kopīgi visām spēlēm, lai viens filtrs darbotos visās (spēles paša vārds tiek piesaistīts tiem, kur iespējams, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Nozīme | Spēles |
|---|---|---|
| `elimination` | visi vienas puses spēlētāji ārā | CS2, Valorant, Rainbow Six Siege |
| `bomb` | bumba (spike, atmīnētāja mērķis) uzsprāga | CS2, Valorant, Rainbow Six Siege |
| `defuse` | bumba (spike) atmīnēta | CS2, Valorant, Rainbow Six Siege |
| `time` | raunda pulkstenis beidzās; War Thunder: izšķirts, kad abām pusēm vēl bija biļetes | visas |
| `surrender` | puse padevās | CS2, Valorant, Rainbow Six Siege |
| `draw` | nav uzvarētāja | CS2 |
| `objective` | mērķis ieņemts vai noturēts (ķīlnieks izvests, zona nodrošināta) | Rainbow Six Siege |
| `capture` | biļetes beidzās, kamēr uzvarētājs turēja ieņemšanas zonas; DCS: pastāvīga kampaņa, kas uzvarēta, ieņemot visus lidlaukus un zonas | War Thunder, DCS |
| `tickets` | biļetes zaudētas notriekšanās | War Thunder |
| `destruction` | pēdējie transportlīdzekļi zaudēti uzreiz, neviena, kas varētu parādīties no jauna | War Thunder |
| `other` | viss cits | |

Nosauc tās arī `heat3d` norāžu `extra` sarakstā, kā jebkuru citu kolonnu. Kolonnu nosaukumi `win`, `round_won`, `match_won`, `end_reason` un `win_reason` tiek nolasīti kā tās pašas kolonnas.

## `heat3d` norādes {#the-heat3d-hints}

Parquet fails var saturēt savas lasīšanas instrukcijas faila beigu daļas atslēgu un vērtību metadatos, zem atslēgas **`heat3d`**, kā JSON objektu ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Skatītājs tās piemēro pāri saviem minējumiem, ja fails ir pirmais atlasē; katrs ieraksts ir neobligāts, un katrs rezultāts joprojām ir redzams un labojams panelī [Kolonnu atbilstība](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Viss, kas nav derīgs JSON objekts, tiek ignorēts.

### Shēma {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          kolonnu nosaukumi pozīcijai
    "time": string,                                  laika kolonna
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filtra kolonnas, ko paturēt, noderīgākās pirmās
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  jābūt > 0
  },
  "entity": {
    "size": number                                   vienas izsekotas lietas izmērs failu vienībās, > 0
  }
}
```

| Ieraksts | Piemērots, kad | Ietekme |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | nosauktā kolonna eksistē failā | Iestata šo lomu. |
| `columns.timeUnit` | ir viena no septiņām vienībām | Iestata laika vienību. |
| `columns.angleUnit` | `"degrees"` vai `"radians"` | Iestata leņķa vienību. |
| `columns.lookMode` | `"vector"`, ja dirX, dirY un dirZ ir visi iestatīti; `"yawPitch"`, ja yaw ir iestatīts; `"none"` | Iestata skatienu režīmu. |
| `columns.extra` | ir masīvs | Aizstāj automātisko filtru sarakstu, paturot tikai esošās kolonnas, kas nav piešķirtas nevienai lomai; katra ir *diapazons*, ja priekšskatījumā izskatījās skaitliska, citādi *kategorija*. Bez tā automātiskais saraksts paliek, mīnus jebkura kolonna, ko norāde piešķīra lomai. |
| `axes.up` | `"y"` vai `"z"` | Augšējā ass. |
| `axes.flipX/Y/Z` | būla vērtība | Apgriešana. |
| `axes.scale` | skaitlis > 0 | Vienību mērogs. |
| `entity.size` | skaitlis > 0 | [Vienības izmērs](sessions-persons-groups.md#entity-size) (reizināts ar vienību mērogu ielādes brīdī). Vienīgais veids, kā to iestatīt. |

### Piemērs {#example}

Izdomāts šāvēja spēles eksports: Z augšup, centimetri, kreisās rokas pasaule, spēlētāji apmēram 72 cm plati.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Ierakstīšana {#writing-it}

Ar pyarrow pielāgotie shēmas metadati tiek ierakstīti faila atslēgu un vērtību metadatos:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` parāda faila shēmu — ātrs veids, kā pārbaudīt kolonnu nosaukumus, uz kuriem norādes atsaucas.

## Ko raksta Siltuma karte {#what-the-heatmap-tab-writes}

Nekas netiek ierakstīts atpakaļ datos. Rezultāti ir:

- video WebM formātā (VP9 vai VP8) — [Kameras ceļš un video](camera-path-and-video.md);
- kameras poza, nokopēta starpliktuvē kā teksts — [Kamera](camera.md#pose);
- līmeņi, kas saglabāti pārlūkā [Līmeņu bibliotēkā](level-library.md).
