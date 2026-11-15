---
title: "Failu ielāde"
parent: "Datu ievade"
nav_order: 1
lang: "lv"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Failu ielāde

Šī lapa parāda, kā 3DHeat dot savus failus un ko tas ar tiem dara. Ievelciet mapi — un tas izvēlas failus, kuros ir pozīcijas, un saliek tos vienā attēlā.

1. Atveriet **Avots** augšā, Siltumkartes sānjoslā.
2. Ievelciet failus vai mapi ievilkšanas laukā vai nospiediet **Faili…** vai **Mape…**.
3. Izlasiet izvēles rindu un **Atmiņas novērtējums** (skatiet attēlu zemāk).
4. Nospiediet **Ielādēt**.

![Avota panelis pēc desmit mačus saturošas mapes ievilkšanas: 1 — izvēles rinda, 2 — atmiņas novērtējums "der", 3 — poga "Ielādēt 10 failus"](../assets/img/en/loading-files-source.webp)

*Pēc mapes ievilkšanas 3DHeat pasaka, ko tas atrada un vai tas ietilpst.*

Failus ielādē panelī **Avots** Siltumkartes cilnes sānjoslas augšdaļā. Viss, kas izvēlēts vienlaikus, kļūst par **vienu** datu kopu.

## Failu izvēle {#choosing-files}

| Vadība | Ko tā dara |
|---|---|
| **Ievelc šeit failus vai mapi** (ievilkšanas lauks) | Ievelciet jebkuru failu un mapju kombināciju. Mapes tiek pārlūkotas rekursīvi. Noklikšķinot uz ievilkšanas lauka, atveras tāds pats izvēlnis kā **Faili…**. |
| **Viens fails…** | Failu izvēlnis vienam failam. |
| **Faili…** | Failu izvēlnis, kas pieņem vairākus failus. |
| **Mape…** | Mapes izvēlnis (pārlūkprogrammas `webkitdirectory` izvēlnis); tiek piedāvāts katrs fails mapes kokā. |

Izvēlņi pieņem failu tipus no [ielādējamo failu saraksta](data-formats.md#files). Īsumā: `.parquet`/`.pq` tiek lasīti kā Parquet, `.csv`/`.tsv`/`.txt` — kā teksts ar atdalītājiem, `.acmi` (Tacview), OCAP `.json`/`.json.gz` un GPS formāti (GPX, KML, KMZ, NMEA, IGC, FIT) iet caur savu lasītāju, un `.3dheat` mača konteineri tiek ielādēti kā tabulas, ko tie satur ([Viens fails vienai spēlei](container.md)). Konteineris, ko nevar nolasīt, tiek izlaists ar ziņu *nav csv/parquet fails*.

Ievilktās mapes tiek pārlūkotas līdz 12 līmeņu dziļumam un ne vairāk kā 20 000 failiem — lai pasargātu no simboliskām saišu cilpām un nekontrolējami lieliem kokiem.

## Kuri faili tiek paturēti {#which-files-are-kept}

Pirms kaut kas tiek nolasīts, izvēle tiek filtrēta ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Fails ar citu paplašinājumu tiek izlaists: *nav csv/parquet fails*.
- Fails ar 0 baitiem tiek izlaists: *tukšs (0 baiti)*.
- **Konvertētāju palīgfaili** — neapstrādātie dati, ko konvertētājs glabā blakus mača tabulai: `<mačs>.messages.parquet`, `.events.parquet`, `.raw.parquet` un citi, kas uzskaitīti lapā [Konvertētāji saglabā visu](converters.md) — tiek izlaisti: *konvertētāja palīgfails*. Lai atvērtu kādu no tiem, izvēlieties vai ievelciet to atsevišķi (vai tikai palīgfailus): izvēle, kurā ir tikai palīgfaili, tos ielādē kā jebkuru tabulu. JSON blakus tabulai (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` un `.hints.json`) nekad netiek piedāvāts kā pozīcijas.
- **Kustības failu noteikums.** Ja kāds izvēlē esošs fails ir nosaukts `movement*.parquet`, `movement*.csv` (un citi paplašinājumi) — `movement.parquet`, `movement_1.parquet` un tamlīdzīgi —, tad visi pārējie datu faili tiek izlaisti: *nav kustības fails, un šajā mapē ir kustības faili*. Telemetrijas eksportos bieži ir viena pozīciju tabula blakus desmitiem tabulu bez pozīcijām, un tikai pirmo var uzzīmēt. Mape bez kustības failiem ielādē visus savus datu failus. Piemērs: mape ar `movement_1.parquet`, `kills.parquet` un `shop.parquet` ielādē `movement_1.parquet`; pārējie divi tiek uzskaitīti kā izlaisti. Piemērs: mape ar `movement_1.parquet`, `kills.parquet` un `shop.parquet` ielādē `movement_1.parquet`; pārējie divi tiek uzskaitīti kā izlaisti.
- Paturētie faili tiek sakārtoti pēc sava ceļa izvēlē, tāpēc tā pati mape vienmēr dod to pašu datu kopu un tās pašas krāsas.

Panelis pēc tam rāda izvēli (viena faila nosaukums vai `mape (N failu)`, izmantojot garāko kopīgo mapi), failu skaitu, to kopējo izmēru un kopējo rindu skaitu — precīzu, ja visi faili ir Parquet, bet ar zīmi `≈`, ja kāds ir CSV. Izlaistie faili tiek uzskaitīti ar iemeslu, pirmie četri pēc nosaukuma.

## Shēmas lasīšana {#reading-the-schema}

Izvēles **pirmais** fails tiek atvērts, lai aprakstītu shēmu ("Lasa shēmu"): tā kolonnu nosaukumus, pirmās 50 datu rindas, kuras kolonnas izskatās skaitliskas un — Parquet gadījumā — katras kolonnas loģisko tipu un `heat3d` kājenes ierakstu. Vienas tabulas eksportu mape dala vienu shēmu, tāpēc viens fails pārstāv visus. Pēc tam tiek izmērīts katrs fails ("Skaita rindas"): Parquet kājene dod precīzu skaitu vienā mazā nolasījumā; CSV skaits tiek novērtēts pēc pirmā megabaita vidējā rindas garuma.

Panelis [Kolonnu atbilstība](column-mapping.md) atveras ar automātiski piedāvātajiem minējumiem, bet virs pogas **Ielādēt** parādās [atmiņas novērtējums](memory-and-budgets.md).

## Ziņojumi pirms ielādes {#messages-before-loading}

Zem izvēles panelis no [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts) uzskaita:

- **Kļūdas** (sarkanas) — ielāde nevar sākties: mazāk nekā divas pozīcijas asis, viena un tā pati kolonna divās asīs, piesaistīta kolonna, kuras failā nav, pozīcijas kolonna, kas neizskatās skaitliska, laika kolonna, kuras paraugvērtības ir teksts, kamēr vienība ir skaitlis (katra rinda tiktu lasīta kā NaN un nokļūtu laikā 0), laika kolonna ar ISO-8601, kuras neviena paraugvērtība nesanāk kā datums, un vienību mēroga vērtība 0.
- **Brīdinājumi** (dzeltenīgi) — tas tiks ielādēts, bet, visticamāk, ne tā, kā domāts: grupu kolonna, kurai lielākajā daļā paraugrindu ir atšķirīga vērtība (tātad tas ir ID, nevis grupa), laika kolonna `DATE` (katra dienas rinda dala vienu brīdi), skata virziens uzstādīts bez savām kolonnām.
- **Piezīmes** — ko piesaiste nozīmē: zīmēšana plaknē, ja viena ass nav piesaistīta; nav laika skalas bez laika kolonnas; nav trajektoriju bez personas kolonnas; un bez grupu kolonnas — viena krāsa visam un starpība, ko var sadalīt tikai pēc kolonnas, kas paturēta filtrēšanai.

## Ielāde {#loading}

Poga **Ielādēt** rāda *Ielādēt failu*, *Ielādēt N failus* vai *Ielādēt N failus (1 no K)*, ja ir iestatīts [decimēšanas solis](memory-and-budgets.md#decimation). Tā rāda *Par lielu — samaziniet vai decimējiet* un ir atspējota, ja [derības pārbaude](memory-and-budgets.md#the-fit-check) saka, ka ielāde nenoder; tā ir atspējota arī tad, kad piesaistē ir kļūdas vai notiek cita ielāde.

Ielādes laikā panelis rāda pašreizējo soli (ar `[fails/faili]` priekšā, ja ir vairāki faili), līdz šim nolasītās rindas, progresa joslu un **Atcelt**. Atcelt beidz ievades darbinieku un līdz ar to visus parsēšanas darbiniekus, ko tas bija palaidis.

Lapa turpina zīmēt ielādes laikā, jo darbs notiek fonā. Jūs redzat pašreizējo soli, nolasītās rindas, progresa joslu un **Atcelt**. Pēc pēdējā faila panelis rāda soļus *Liek rindas laika secībā*, *Pārkārto kolonnas (n no m)*, *Mēra apjomu*, *Veido sarakstu*, *Apkopo sesijas* un *Aprēķina dzīves ilgumus*, tad *Augšupielādē N rindas GPU* vienam kadram — lai garu augšupielādi nekad nepārprastu kā iesaldējumu.

### Kā tas darbojas {#how-it-works}

Ielāde notiek Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Ja ir vairāki faili un vairāk nekā viens [parsēšanas pavediens](memory-and-budgets.md#parser-threads), līdz tik daudz failiem tiek parsēti **vienlaikus**, katrs savā parsēšanas darbiniekā ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), ciktāl RAM budžets atstāj vietu. Tie joprojām tiek apvienoti pa vienam, izvēles secībā, tāpēc datu kopa ir tāda pati kā ielādējot pa vienam. Kamēr vairāki ir procesā, progresa rindā ir nosaukts fails, kurš pēdējais ziņoja, un josla un rindu skaits saskaita visus procesā esošos failus. Ar vienu pavedienu vai vienu failu faili tiek parsēti pa vienam ievades darbiniekā pašā. Tiek nolasītas tikai tās kolonnas, ko piesaiste nosauc: Parquet faila nepiesaistīta kolonna nemaksā neko; CSV tiek skenēts baitu pa baitam, bet tiek atkodēti tikai piesaistītie lauki.

## Vairāki faili kļūst par vienu datu kopu {#several-files-become-one-dataset}

Ielādējot vairāk nekā vienu failu ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Viens saraksts.** Personas, grupas, sesijas un kategoriju vērtības ir vārdnīcas, kas kopīgas visiem failiem, tāpēc tas pats spēlētājs divos eksportos ir viena persona ar vienu trajektoriju.
- **Viens laika sākumpunkts.** Laiki apvienošanas laikā tiek glabāti kā 64 bitu sekundes un pārbīdīti uz *visas* izvēles agrāko laiku, pēc tam saglabāti kā 32 bitu sekundes no šī sākumpunkta. Četri eksporti no četrām pēcpusdienām tiek novietoti savā reālajā secībā, nevis viens uz otra.
- **Viena laika secība.** Rindas no visiem failiem tiek sakārtotas pēc laika ar radix kārtošanu (skatiet [kārtošanas griestus](memory-and-budgets.md#the-sort-ceiling)).
- **Kolonna `Source file`.** Katra rinda atceras, no kura faila tā nāca, kā kategoriju kolonnu ar nosaukumu `Source file`. Tā parādās lapā [Filtri](filters.md) un kā *Source file - salīdzināt divas ielādes* [starpības sadalījumā](difference.md). Ielāde no viena faila to nesaņem — konstante kolonna maksātu 4 baitus katrā rindā, lai neko nepateiktu.
- **Trūkstošās kolonnas.** Fails, kuram trūkst kādas *filtra* kolonnas, vienkārši nedod tai nevienu vērtību. Fails, kuram trūkst piesaistītas *lomas* kolonnas (X, laiks, persona, ...), neizdodas ar *failā nav kolonnas "nosaukums"*; vairāku failu ielādē šis fails tiek izlaists, un pārējie tiek ielādēti, un izlaistie faili ir uzskaitīti datu kopā. Ielāde no viena faila, kas neizdodas, parāda kļūdu.
- **Brīdinājums par trūkumu.** Ja ielādētās rindas ir mazākas par 95% no iepriekš saskaitītajām rindām, datu kopai ir brīdinājums ar trūkstošo daļu — no nelasāmiem failiem vai no rindām bez derīgas pozīcijas, kas tiek izmestas, ienākot.

## Pēc ielādes {#after-loading}

Jaunā datu kopa aizstāj iepriekšējo. Katrā ielādē ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- tiek notīrīti visi filtri un grupu redzamība;
- grupu starpības sadalījums tiek atiestatīts: pirmā grupu puse (noapaļota uz augšu) pozitīva, pārējās negatīvas;
- sprite rādiuss tiek iestatīts uz horizontālo izmēru / 120, piesātinājums — uz analītisku novērtējumu; kuba izmērs, skata stara garums, lidojuma ātrums un tuvā/tālā plakne tiek iestatīti pēc izmēra (skatiet [Sesijas, personas un grupas](sessions-persons-groups.md#entity-size));
- kastes atskaņošanas sesija tiek iestatīta uz sesiju ar visvairāk rindām;
- līniju siltuma maršruti tiek minēti no jauna ([Līniju siltums](line-heat.md));
- skata režīms atkrīt uz **Siltums**, ja pašreizējo režīmu jaunie dati neatbalsta; laika josla atkrīt uz **Viss**, ja nav laika kolonnas, un vēsture uz **Kumulatīvi**, ja nav dzīves ilgumu;
- atskaņošanas galva tiek novietota sākumā un atskaņošana apstājas;
- kamera ietver visu datu kopu no noklusējuma virziena (skatoties pa -Z, noliekta uz leju par apmēram 36°).

Panelis **Datu kopa** pēc tam rāda datu kopas nosaukumu (izvēli, rindu un failu skaitu un soli, ja tas tika izmantots), `N komandas · N personas · Ns ilgums` un katru brīdinājumu, ko ielāde radīja, dzeltenā krāsā — tik ilgi, cik datu kopa ir ielādēta. **Izlādēt** šajā panelī noņem datu kopu.
