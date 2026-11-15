---
title: "Kolonnu atbilstība"
parent: "Datu ievade"
nav_order: 2
lang: "lv"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Kolonnu piesaiste

Fails ir tabula, un 3DHeat jāzina, kura kolonna satur austrumu–rietumu pozīciju, kura laiku, kura spēlētāja vārdu un tā tālāk. Šis panelis saka, ko tas minēja, un tajā jūs labojat nepareizu minējumu.

![Kolonnu piesaistes panelis pēc Parquet faila ielādes: katrs lauks jau aizpildīts — 1 X, 2 Y, 3 Z, 4 Laiks, 5 Personas ID, 6 Sesija / mačs, 7 Komanda / grupa](../assets/img/en/column-mapping-panel.webp)

*Fails pats nosauca savas kolonnas, tāpēc katrs lauks jau ir aizpildīts.*

Piemēram, CSV ar galveni `x,y,z,t,player,team` piesaista sevi: x, y un z kļūst par pozīciju, `t` — par laiku, `player` — par [personu](glossary.md), bet `team` — par [grupu](glossary.md).

Kad faili ir izvēlēti, zem paneļa Avots atveras panelis **Kolonnu piesaiste**. Tas saka, kura kolonna spēlē kuru lomu. Tas tiek aizpildīts automātiski, un katru lauku var mainīt, pirms nospiest **Ielādēt**; piesaiste tiek nolasīta ielādes brīdī, tāpēc, ja to maina pēc tam, jāielādē vēlreiz.

## Lauki {#the-fields}

Visi kolonnu izvēlnes uzskaita katru pirmā faila kolonnu, plus *- nav -*.

| Lauks | Loma | Piezīmes |
|---|---|---|
| **Atdalītājs** | Tikai CSV: lauku atdalītājs. | Izvēlne: *Komats ,*, *Semikols ;*, *Tabulēšana*, *Vertikālā josla \|*, *Atstarpe*; vai ierakstiet jebkuru vienu rakstzīmi laukā *vai ierakstiet vienu rakstzīmi*. Tiek noteikts automātiski (skatiet zemāk). Ja to maina, automātiskā piesaiste tiek palaista no jauna, tāpēc iepriekšējie labojumi pazūd. |
| **X**, **Y**, **Z** | Pozīcija. | Vajadzīgas vismaz divas; nepiesaistīta trešā ass ir 0 (dati atrodas plaknē). Viena un tā pati kolonna divās asīs ir kļūda. |
| **Augšupvērstā ass avotā** | Kura avota ass rāda uz augšu. | *Z ir augšā (lielākā daļa spēļu dzinēju)* vai *Y ir augšā (grafikas konvencija)*. Skatiet [Asis, vienības un laiks](axes-units-and-time.md). |
| **Vienību mērogs** | Reizina katru pozīciju. | Pogas *1 (m)* un *0,01 (cm→m)*, vai ierakstiet vērtību. |
| **Apgriezt X / Apgriezt Y / Apgriezt Z** | Noliedz avota asi. | Piemēro pozīcijām un skata virziena vektoriem. |
| **Laiks** | Laika ass. | Nav obligāts. Bez tā nav laika skalas. |
| **Laika vienība** | Kā lasīt laika kolonnu. | Septiņas vienības; skatiet [Asis, vienības un laiks](axes-units-and-time.md#time). Ignorēta Parquet kolonnām `TIMESTAMP`/`DATE`, ko panelis norāda. |
| **Personas ID** | Kam vai kam pieder rinda. | Nav obligāts. Ļauj izveidot trajektorijas, dzīves ilgumus, kastes atskaņošanu un līniju siltumu. |
| **Sesija / mačs** | Kuram mačam, reidam, raundam, braucienam vai aplim pieder rinda. | Nav obligāts. Pozīcijas nekad netiek interpolētas, nevelk pēdas un nesavienojas maršrutā pāri sesijas maiņai. Skatiet [Sesijas, personas un grupas](sessions-persons-groups.md). |
| **Komanda / grupa** | Jebkura kolonna ar nelielu vērtību skaitu. | Nav obligāta. Vada grupu krāsas, komandu siltumu un starpības sadalījumu pēc grupas. |
| **Skata virziens** | *Nav*, *Pagrieziena / slīpuma kolonnas* vai *Virziena vektora kolonnas*. | Ar pagriezienu/slīpumu: **Pagrieziens**, **Slīpums** un **Leņķa vienība** (*Grādi* / *Radiāni*). Ar vektoru: **Dir X**, **Dir Y**, **Dir Z**. Izmanto [kastes atskaņošanas](box-replay.md) skata stariem. |
| **Saglabāt filtrēšanai** | Papildu kolonnas, kas paturētas atmiņā. | Izvēles rūtiņa katrai kolonnai, un katrai atzīmētajai — *diapazons* (skaitlisks) vai *kategorija*. Katra maksā 4 baitus katrā rindā un dekodēšanas caurlaidi ielādē. Tikai paturētās kolonnas var [filtrēt](filters.md), izmantot [starpības sadalījumam](difference.md) vai kā [līniju siltuma](line-heat.md) notikumu kolonnu. |
| **Rādīt rindu paraugus** | Tabula ar pirmajām 12 paraugu rindām, visas kolonnas. | Minējumu pārbaudei. |

Atzīmēta filtra kolonna, kas nav noteikta skaidri, tiek nolasīta kā *diapazons*; skaitliski izskatīga ID kolonna bieži ir noderīgāka kā *kategorija*. Vienlaikus aktīvi var būt tikai 4 filtri ([Filtri](filters.md)).

## Kā automātiskā piesaiste min {#how-the-auto-mapping-guesses}

Minējumi ir failā [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Tas skatās uz kolonnu nosaukumiem, uz to, kuras kolonnas paraugrindās ir skaitliskas (vairāk nekā 90% no neapstrādātajām vērtībām nolasās kā skaitļi), uz to, cik dažādas vērtības katra kolonna ņem paraugā, un uz Parquet loģiskajiem tipiem. Nosaukumu šabloni tiek izmēģināti pēc kārtas, neatkarīgi no lielajiem burtiem, un pirmais šablons, kas atbilst kādai vēl brīvai kolonnai, uzvar.

### Pozīcija {#position}

| Ass | Nosaukumu šabloni pēc kārtas (tikai skaitliskas kolonnas) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Ja ass joprojām ir tukša, pirmās brīvās skaitliskās kolonnas (ignorējot `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) to aizpilda pēc kārtas. Nepareizs minējums ir redzams ekrānā; tukšs atstātu tukšu skatu.

### Laiks {#time}

- **Vispirms Parquet laika zīmogu kolonnas.** Starp kolonnām, kuru loģiskais tips ir `TIMESTAMP` vai `DATE`, labāko izvēlas pēc vērtējuma: +10 000, ja nosaukums atbilst laika šablonam, -5000 par vienkāršu `DATE`, plus dažādu vērtību skaits paraugā. Visas dienas datums un nemainīgs sesijas sākums dod gandrīz nevienu dažādu vērtību, tāpēc uzvar notikuma brīdis. Vienība tad ir *Unix laika zīmogs (ms)*.
- **Citādi pēc nosaukuma:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, tad pagājušā laika nosaukumi (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Vienība tad tiek minēta no vērtībām: ISO-8601, kad vērtība izskatās kā `GGGG-MM-DDT…` vai `GGGG-MM-DD …`; citādi pēc lielākās lielumkārtas: virs 10^17 nanosekundēm, virs 10^14 mikrosekundēm, virs 10^11 Unix milisekundēm, virs 10^8 Unix sekundēm, virs 10^6 milisekundēm, citādi sekundes.

Kad izvēlēta pagājušā laika kolonna, panelis norāda, ka katra sesija tad tiek saskaņota ar savu sākumu — labi maču pārklāšanai, bet ne to redzēšanai reālā secībā.

### Sesija, persona, grupa {#session-person-group}

Sesija tiek pieprasīta **pēc** laika ass un **pirms** personas un grupas, jo sesijas kolonna bieži ir laika zīmogs (mača sākuma brīdis katrā mača rindā).

| Loma | Nosaukumu šabloni pēc kārtas |
|---|---|
| Sesija | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (katrs precīzi, neobligāti ar `_id`) |
| Persona | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, tad `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (sacīkšu dati: kustas auto) |
| Grupa | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupa, rezerve | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Grupas kandidāts, kas lielākajā daļā paraugrindu ņem atšķirīgu vērtību (vairāk nekā max(48; 60% no parauga)), ir ID, nevis grupa: ja persona nav atrasta, tā kļūst par personas kolonnu, un grupai netiek izmantota. Ja grupas kolonnu nav atrasts nemaz, izmanto nenumerisko kolonnu ar mazāko dažādu vērtību skaitu no 2 līdz 12.

### Skata virziens {#look-direction}

Skaitliska kolonna ar nosaukumu `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` vai `rot_z` / `rotation_z` pārslēdz skata virzienu uz pagriezienu/slīpumu; slīpums tiek meklēts kā `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Pieņem grādus, ja kāds paraugā nolasītais pagrieziens pārsniedz 7 pēc absolūtās vērtības, citādi radiānus. Virziena vektoru nekad nemin; tas nāk no zemāk esošajiem norādījumiem vai no jums.

### Filtra kolonnas {#filter-columns}

Automātiski tiek paturētas ne vairāk kā **6** kolonnas, sarindotas:

1. `region`, `sessionMode`, `actor` — kolonnas, kas pastāv, lai pēc tām filtrētu (vērtējums 1200);
2. kategoriju kolonnas, kas paraugā mainās, ar mazāku dažādu vērtību skaitu pirmās (1000 mīnus skaits);
3. kolonna, kas paraugā ir nemainīga, bet tikai tad, kad ielādēti vairāki faili — tā var atšķirties starp failiem, piemēram, reģions vai testa braucienu ID (600);
4. skaitliskas kolonnas (500).

Kolonnas, kas jau spēlē kādu lomu, iepriekš minētie trokšņa nosaukumi, kolonnas, kas nemainās vienfailu ielādē, un brīvā teksta kolonnas (vairāk nekā max(16; puse no parauga) dažādu vērtību) automātiski netiek piedāvātas. Jebkuru kolonnu joprojām var atzīmēt ar roku.

### Augšupvērstā ass {#up-axis}

Kad visas trīs asis ir piesaistītas, ass ar mazāku Y un Z izkliedi paraugā tiek ņemta kā augšup (karte ir daudz platāka nekā augstāka); citādi pieņem Z augšup.

## `heat3d` norādījumi Parquet kājenē {#the-heat3d-hints-in-a-parquet-footer}

Parquet fails var pateikt, kā to lasīt. Ja faila kājenes atslēgas/vērtību metadatos ir ieraksts ar atslēgu **`heat3d`**, tā vērtība tiek parsēta kā JSON un uzlikta pāri minējumiem ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). CS2 demo konvertētājs raksta šādu ierakstu, tāpēc tā tabulas atveras ar spēlētāju kā personu, pusi kā grupu, katru raundu kā sesiju, skata virzienu ieslēgtu un pasauli pareizi orientētu.

Norādījumiem tiek nolasīts tikai **pirmais** izvēles fails. Katrs ieraksts ir neobligāts, un katra norādītā vērtība joprojām parādās panelī un to var mainīt. Pilns shēmas apraksts ar piemēru un to, kā to rakstīt, ir [Datu formātu uzziņā](data-formats.md#the-heat3d-hints).

Noteikumi īsumā:

- Kolonna, ko nosauc norādījums, tiek piemērota tikai tad, ja failā ir šī kolonna.
- `lookMode: "vector"` darbojas tikai tad, ja `dirX`, `dirY` un `dirZ` ir visi uzstādīti; `"yawPitch"` — tikai tad, ja uzstādīts `yaw`.
- `extra`, ja tas ir, aizvieto automātisko filtru sarakstu (nezināmi nosaukumi un kolonnas, kas jau spēlē lomu, tiek izmesti); katras kolonnas diapazona/kategorijas tips seko tam, vai tā izskatījās skaitliska. Ja tā nav, automātiskais saraksts paliek, bez kolonnas, kurai norādījums devis lomu.
- `axes.up` jābūt `"y"` vai `"z"`, apgriešanai jābūt būla vērtībām, `scale` jābūt pozitīvam.
- `entity.size`, ja tas ir pozitīvs, ir viena izsekotas lietas izmērs faila vienībās ([vienības izmērs](sessions-persons-groups.md#entity-size)); tas ir vienīgais veids, kā to uzstādīt.

## Zināma problēma: CSV atdalītāja maiņa {#known-issue-overriding-the-csv-separator}

Kad jūs mainat atdalītāju uz citu nekā noteikto, kolonnu saraksts un paraugrindas nemainās (priekšskatījums joprojām dala ar noteikto atdalītāju). Izvēlētais atdalītājs tomēr tiek izmantots pašai ielādei. Ja noteiktais atdalītājs ir nepareizs:

1. Atveriet failu teksta redaktorā.
2. Visur nomainiet atdalītāju uz komatu (un decimālkomatus uz punktiem).
3. Saglabājiet un ielādējiet failu vēlreiz.

Cēlonis ir [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
