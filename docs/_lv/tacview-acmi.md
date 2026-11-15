---
title: "Tacview ieraksti (ACMI)"
parent: "Datu ievade"
nav_order: 7
lang: "lv"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview ieraksti (ACMI)

Tacview ir programma, kas ieraksta lidojumus lidojumu simulatoros; tās faili beidzas ar `.acmi`. 3DHeat tos atver, lai jūs varētu redzēt, kur lidoja katrs lidaparāts.

Tacview lidojumu ieraksti ielādējas kā jebkura tabula: izvēlieties vai nometiet `.acmi` (teksts, `.txt.acmi` vai zipēts, `.zip.acmi`) un nospiediet **Ielādēt**. Tad jūs iegūstat visu lidojumu siltumu, un cilnē **Mačs** atkārtojumu ar figūrām, trajektorijām un notikumu sarakstu ([Spēles atkārtojums](match-replay.md)). ACMI ir Tacview publiskais failu formāts ([dokumentācija](https://www.tacview.net/documentation/acmi/)). DCS (caur Tacview eksportētāju), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS un citi to raksta, tātad šis lasītājs nolasa jebkuru no tiem.

## Ko kļūst par ierakstu {#what-a-recording-becomes}

Viena rinda katru reizi, kad tiek ierakstīta objekta pozīcija. Viena rinda katram notikumam objekta vietā. Viena rinda, kad objekts pazūd (`Removed`, kur tas bija pēdējoreiz). Notikums par objektu, kas vēl nav redzēts (atzīme, ziņa visiem), ir rinda objektam `(recording)` atsauces punktā. Ierakstā ir paša lasīšanas norādījumi, tāpēc kartēšanas solis aizpildās pats. Lasītājs raksta šīs kolonnas: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, un tad visas citas īpašības, kādas ierakstam ir. To lomas:

| Kolonna | Loma | Nozīme |
|---|---|---|
| Time | laiks | Sekundes pēc ieraksta ReferenceTime; Unix sekundes, ja tāda ir, lai pulkstenis rādītu īsto laiku. |
| X, Y | pozīcija | Austrumi un ziemeļi, metri, plaknē, kas pieskaras zemei ieraksta atsauces punktā: attālumi un virzieni ir pareizi tuvumā, novirzoties mazāk par tūkstošdaļu pie 100 km. Ziemeļi kļūst par pasaules -Z. |
| Altitude | pozīcija (augstums) | Metri. |
| Object | persona | Pilots un objekta nosaukums ar tā id, piem., `Viper 1 (F-16C_50) #a01`; objekts bez pilota `(T-90A) #401`. |
| Coalition | komanda | Puse (vai krāsa, ja koalīcijas nav). |
| Heading, Pitch | skatiens | Grādi; virziens 0 ir ziemeļi. |
| Recording | sesija | Ieraksta Title vai faila nosaukums: vairāki ieraksti ielādējas blakus, to trajektorijas nesaplūst. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Saglabāti filtrēšanai. Type un Name izvēlas katra objekta [figūru](figures.md), Event baro atbriefinga notikumu sarakstu, Roll noliec lidaparātu. |
| U, V | | Spēles pašas plakanās pasaules metri, kad katram paraugam tie ir (DCS tos raksta). |
| EventObjects | filtri | Katrs objekts, ko nosauc notikums (`Message|a01|b02|...`), pēc id. |
| RecordingInfo | | Ieraksta pašas īpašības, kādas tās bija šajā brīdī (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...) kā JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Jebkura cita skaitliska īpašība, ko ieraksts satur. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Jebkura cita teksta īpašība, ko ieraksts satur. Īpašība ar jebkuru vērtību, kas nav skaitlis, ir teksts. |

Visas četras Tacview pozīcijas formas (`lon|lat|alt`, ar `u|v`, ar `roll|pitch|yaw` un ar visām un virzienu) tiek nolasītas. Tukšie lauki saglabā pēdējo vērtību. `-id` noņem objektu, un id, kas izmantots atkārtoti pēc tam, ir jauns objekts. Izbēgušie komati un turpinātās rindas tiek apstrādātas.

Pozīcijas vienmēr tiek projicētas no platuma un garuma, nekad nenolasītas no U/V. Tāpēc ieraksti no katras spēles dala vienu projekciju ar reālas pasaules fonu.

## DCS serveri: kurš uzvarēja un kā beidzās katrs lidojums {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS daudzspēlētāju serveris visu diennakti ieraksta savas misijas ar Tacview, un pastāvīgs PvP serveris vada kampaņu daudzu misiju garumā: puse uzvar, ieņemot visus otras puses lidlaukus, FARP un zonas, un tas prasa vairākas dienas un daudzas misijas restartēšanas. Ierakstos ir lidojumi, nevis kampaņa: neviens ziņojums nesaka, kurš ko ieņēma, lidlauki tiek ierakstīti vienreiz sākumā, un nekas nesaka, kurš uzvarēja. Tacview konvertētājs (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) katrai rindai pievieno to, ko var zināt, un atstāj tukšu to, ko nevar - tas nekad neminē.

| Kolonna | Nozīme |
|---|---|
| `server` | serveris vai kampaņa no ieraksta galvenes (tās Title, Author un Comments nosauc zināmos publiskos serverus - Blue Flag, SPS Contention, Growling Sidewinder; citādi Author, kas kādu nosauc); `--server Name` dod nosaukumu visai mapei. Ieraksts, kura galvene nenosauc nevienu serveri - Author kā `Admin`, Title un Comments, ko neraksta neviens zināms serveris -, paliek nepiesaistīts: `server` ir tukšs arī tad, ja tas lejupielādēts no servera ierakstu lapas, jo lapā var būt arī citu kopienu misijas |
| `mission` | ieraksta Title bez versijas vai kampaņas mēneša: `Operation_Example_V7.7.99` kļūst par `Operation Example` |
| `campaign` | kampaņas kārta, kurai ieraksts pieder, pēc servera, kartes un numura: `Example Server North 3`. Viens ieraksts ir viena sesija (no restarta līdz restartam); kārta ilgst daudzas sesijas, dienas vai nedēļas |
| `round` | kārtas numurs: paša servera numurs, ja tas tādu publicē, citādi n-tā kārta, kas redzēta šajā serverī un kartē; no kārtu faila (zemāk), bez tā tukšs |
| `session` | ieraksta vieta starp kārtas sesijām, 1, 2, ...; `sessionStart` tās īstais sākums (Unix sekundēs) |
| `heldRed`, `heldBlue` | apstrīdētās vietas, ko katra puse turēja sesijas sākumā, no saķēdēta kārtu faila (zemāk) |
| `won`, `matchWon` | 1, ja rindas puse (tās Color, Red vai Blue) uzvarēja kampaņā, 0, ja zaudēja; tukšs, ja neviens kārtu fails nenosauc uzvarētāju, un neitrālās rindās. Kampaņa vienlaikus ir gan kārta, gan mačs, tāpēc abām ir viena vērtība |
| `roundEndReason` | `capture` kampaņai, kas uzvarēta, ieņemot visu |
| `won`, `matchWon` katrā kārtas sesijā | kārtas rezultāts, ierakstīts katrā tās ierakstā, kad tās beigas ir zināmas |
| `sortie` | lidmašīnas rindās: tās lidojums, 1, 2, ... no pacelšanās līdz pacelšanās; laiks uz zemes pirms pirmās pacelšanās un pēc nosēšanās pieskaitāms lidojumam, kuram tas pieder |
| `sortieResult` | kā lidojums beidzās: `landed`, `landed damaged` (pēc trāpījuma gaisā), `ejected`, `shot down`, `destroyed` (uz zemes), `crashed`, `despawned` (pazuda gaisā bez redzama iemesla - spēlētājs aizgāja), `airborne at end`, `no takeoff` |
| `sortieKills` | lidmašīnai šajā lidojumā ieskaitītās iznīcināšanas |

Pastāvīgā serverī lidojums ir vienība, kurai ir nozīme: filtrē pēc `sortieResult` = `shot down`, lai redzētu, kur lidojumi tika zaudēti, vai sadali siltumu pēc `sortieResult` vai `server` [sadalījumā](breakdown.md). Pacelšanās, nosēšanās, katapultēšanās, iznīcināšanas un avārijas, no kurām tas sastāv, ir notikumi, ko konvertētājs secina no tā, kā lidmašīnas pārvietojas (augstāk).

Vietas, kas ieņemtas starp divām kārtas sesijām - zināmas no kārtu faila, zemāk -, ir `capture` notikumi vēlākā ieraksta sākumā: `Object` `(campaign)`, pie vietas, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Lidlauks vai FARP, kas maina pusi tur, kur ieraksts to rāda - ierakstīts vēlreiz otrā krāsā vai noņemts un piecu minūšu laikā ierakstīts vēlreiz savā vietā otrā krāsā -, kļūst par `capture` notikumu pie laukuma: `Event` = `capture`, `Airfield` tā nosaukums, `Detail` `Red to Blue`, `Coalition` tā jaunā puse. Laukums, kas pirmo reizi ierakstīts kādā krāsā, nav ieņemšana. Līdz šim apskatītie serveri savus laukumus ieraksta vienreiz, tāpēc to ierakstos ieņemšanu nav.

### Kārtu faili {#rounds-files}

Kārtu fails katram serverim norāda tā kampaņas kārtas, kurš tajās uzvarēja, un katras kārtas sesijas. Tas nāk no tā, ko serveris publicē, vai no pašiem ierakstiem (zemāk).

Kurš uzvarēja kampaņā, ir tas, ko serveris publicē - kampaņas žurnāls tā tīmekļa lapā -, nevis kaut kas ierakstā. Kārtu fails to nes, un konvertētājs to nolasa ar `--rounds file.json` (var norādīt vairākus):

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

Ieraksts pieder tām sava `server` kārtām, kuru `title` (regulārā izteiksme) atbilst tā Title; katra rinda - kārtai, kurā iekrīt tās īstais laiks - ieraksta RecordingTime plus rindas sekundes, nevis misijas datums spēlē. Laiki ir UTC. Kārta bez uzvarētāja (nomainīta, vēl notiek) dod savām rindām kārtas numuru un tukšu rezultātu.

Mača dokumenta atbilstība, `acmi` kājene, saka, no kurienes rezultāts nāk, kā to dara War Thunder mača `result.source`: `outcome.result` ir `{ winner, round, endReason, source }`, `source` ir kārtu faila `source` vai `null`, ja nekas nenosauca uzvarētāju. `outcome` arī uzskaita ieraksta kārtas, tā ieņemšanas un tā lidojumus pēc tā, kā tie beidzās:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Pilota `Viper 1 (F-16C_50) #a01` rinda Blue pusē šajā kampaņā tad ir: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Kārtas no pašiem ierakstiem {#rounds-from-the-recordings-themselves}

Pastāvīgs serveris saglabā savu kampaņu pāri restartiem, un katrs ieraksts sākas ar abu pušu sauszemes vienībām un statiskajiem objektiem tur, kur kampaņa tos atstāja. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` nolasa katra ieraksta pirmās minūtes ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), sakārto katra servera vienas kartes ierakstus laika secībā un saķēdē tos:

- **Vietas**: zeme apmēram 2 km šūnās; šūna pieder pusei, ja trīs ceturtdaļas tur esošo vienību sesijas sākumā ir tās. *Apstrīdētās* vietas ir tās, kas redzētas abu pušu rokās.
- **Ieņemšanas**: vieta, ko nākamās sesijas sākumā tur otra puse - ieņemta starp misijām vai iepriekšējās laikā.
- **Jauna kārta**: sesija, kuras vietas atšķiras no iepriekšējās vairāk nekā 60 % no tām - jaunas kārtas sākuma izkārtojums, nevis vecās kārtas solis. Kārta beidzas arī tad, kad serveris pāriet uz citu karti (tā sesijas sākas pēc pēdējās un turpinās).
- **Kurš uzvarēja**: beigušās kārtas gadījumā puse, kas tās pēdējās sesijas sākumā turēja visas vietas (`capture`, augsta ticamība), citādi puse, kas turēja vairāk apstrīdēto vietu (vidēja, ja divreiz vairāk nekā otra, citādi zema; zema, ja kārta beidzās ar kartes maiņu). Atvērtai kārtai nav uzvarētāja, bet katra sesija saka, cik vietu katra puse turēja tās sākumā, tāpēc redzams, kurš bija priekšā.
- Serveris, kura sesijas visas sākas vienādi, starp tām nesaglabā stāvokli: tas netiek saķēdēts.

Pēdējās sesijas sākums var būt stundām pirms kārtas beigām, tāpēc ticamībai ir nozīme. Pārbaudīts pret serveri, kas publicē savus uzvarētājus: ķēde atrada katru jauno kārtu tajā sesijā, kurā sākās publicētā kārta, un puse, kas bija priekšā pēdējā sākumā, bija publicētais uzvarētājs katrā no 9 kārtām, ko tā varēja pārbaudīt. `--official file.json` saglabā šāda servera publicētās kārtas un pievieno tām ķēdes sesijas; faila `validation` saka, cik tālu ķēde sakrita. Izdomātā kampaņā:

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

### Kampaņas kārtas skatīšanās kā sērija {#watching-a-campaign-round-as-a-series}

Ielādē vienas kārtas ierakstus kopā - failus ar vienādu `campaign` -, un skatītājs tos atskaņo kā vienu sēriju: sesiju pēc sesijas to īstajā secībā, stundas vai dienas starp divām saīsinot līdz vienas minūtes pauzei. Laika skala atzīmē katras sesijas sākumu dzeltenā krāsā un pauzes kā tumšas joslas, un pulkstenis saka, kura sesija tiek atskaņota, un tās īsto datumu (`session 4/12 · 2026-11-02 12:38 UTC`). Siltums, atskaņošana, filtri un Atziņas darbojas visā sērijā tāpat kā jebkuros ielādētos datos. Cilnes Mačs sadaļa **Kampaņas kārta** uzskaita sesijas ar to datumiem, cik apstrīdēto vietu katra puse turēja katrā sākumā - arī kā diagrammu par visu kārtu - un cik tika ieņemts pirms tā; klikšķis aizved uz sesijas sākumu. Atsevišķi ielādēts ieraksts tur saka, kura kārta un sesija tas ir. Dažādu kārtu ieraksti, kas ielādēti kopā, nav sērija: katrs sākas no nulles, tāpat kā atsevišķi mači. Daudzu spēļu ielādētājs (**Daudzas spēles vienlaikus**) arī atskaņo kārtu kā sēriju, straumētu un pielāgotu GPU, daudzu gigabaitu kārtām.

Vietas, kas kārtas laikā mainīja īpašnieku, kartē tiek zīmētas kā ieņemšanas zonas, iekrāsotas pēc puses, kas katru turēja atskaņotās sesijas sākumā, un tās mainās pie sesiju robežām; katra maiņa ir ieņemšana atskaņojuma notikumu sarakstā. Tās tiek secinātas no ielādētajām rindām - katras sesijas sauszemes vienībām un statiskajiem objektiem tās pirmajās minūtēs, apmēram 2 km šūnās, kā to dara ķēde -, tāpēc tām vajag pilno ielādētāju (daudzu spēļu ielādētājs no katras rindas patur par maz).

**Visas kārtas ielāde no viena tās ieraksta.** Parastā pārlūkā skatītājs nevar atvērt failus, kurus tu neizvēlējies: ielādē kārtas failus kopā. Kad to pasniedz lokālais skatītāja serveris (`npm run dev` vai `npm run preview`), tas var: pievieno git ignorētajam `tools/local-data.json` ierakstu `campaigns`, kas nosauc kārtu failu mapi un konvertēto ierakstu mapes, un viena ieraksta sadaļa Kampaņas kārta piedāvā **Ielādēt visu kārtu**, ienes tur atrastās kārtas sesijas un ielādē tās ar daudzu spēļu ielādētāju:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Tiek pasniegti tikai tie ieraksti, ko nosauc kārtu fails (`tools/campaign-files.mjs`); sesija, kas šajās mapēs nav atrasta, tiek saskaitīta, bet netiek ielādēta.

Ko publicē zināmie serveri:

| Serveris | Kārta | Kā puse uzvar | Kur var nolasīt uzvarētāju |
|---|---|---|---|
| SPS Contention | kampaņa vienā kartē un ērā (dienas), pāri daudziem restartiem | ieņemti visi lidlauki, FARP un atbalsta punkti; kampaņa, kas beidzās bez uzvarētāja, tika nomainīta | servera publiskais kampaņu žurnāls (uzvarētājs, sākums, beigas katrai kampaņai) |
| Blue Flag | kampaņas kārta pāri daudzām 5 stundu misijām; `_YYYY_MM` Title laukā pēc katra restarta pavirzās par vienu mēnesi | ieņemtas visas ienaidnieka pozīcijas; vecākās kārtās uzvarētāja bija puse, kas pēc noteikta laika turēja vairāk | līdz šim nav atrasts publicēts kādā formā; ierakstu ķēde seko katrai kārtai un tam, kurš cik daudz tur katrā sākumā |
| Growling Sidewinder | atklāta konflikta misijas norise (6 stundas) | ieņemtas zonas un lidlauki | tā statistikas lapa rāda pilotus, nevis rezultātus; katra sesija sākas vienādi, tāpēc neviena kārta neaptver vairākas sesijas: tukšs |
| Misijas pret MI (zonu ieņemšanas misijas) | misijas norise | spēlētāju puse pret misijas MI: nav PvP rezultāta | tukšs |
| Nepiesaistīts (galvene nenosauc serveri) | - | - | tukšs, arī `server` tukšs |
