---
title: "Konvertētāji saglabā visu"
parent: "Datu ievade"
nav_order: 8
lang: "lv"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konvertētāji saglabā visu

Lai atvērtu atskaņojumu, šī lapa nav vajadzīga. Tā ir domāta cilvēkiem, kas raksta rīkus, kas pārvērš spēļu failus 3DHeat tabulās, un ikvienam, kas vēlas zināt, kāpēc šīs tabulas satur tik daudz.

Ikviens rīks, kas pārvērš spēles atskaņojumu, demo, žurnālu vai tiešraides telemetriju skatītājam atveramā formā, ievēro vienu noteikumu:

> **Konvertējiet visu, ko avots satur un ko var nolasīt tagad, un atstājiet pārējo veselu, lai to varētu nolasīt vēlāk bez oriģinālā faila.**

Atskaņojums bieži pazūd pēc spēles atjauninājuma, pārinstalēšanas vai pilna diska, un tiešraides straume pazūd tajā brīdī, kad tā ir nosūtīta. Ko konvertētājs izmet, to zaudē uz visiem laikiem; ko tas patur veselu, to var atšifrēt dienā, kad kāds to saprot. Tāpēc konvertētājs nekad nenosaka, kas būs noderīgs: tas atšifrē to, ko var, un saglabā katru citu ziņojumu, paketi, notikumu, īpašību vai rindu nemainītu blakus tabulai, un pats savā izvadā saka, cik daudz no katra tas nolasīja un cik daudz tikai saglabāja.

Šī lapa ir konvencija, ko ievēro visi konvertētāji: War Thunder, World of Tanks, World of Warships un Squad atskaņojumu konvertētāji, CS2 demo konvertētājs, fona novērotājs (tā Dota atskaņojumu dekodētājs un katrs tiešraides adapteris), spēles uztveršanas rīka telemetrijas lasītāji un skatītāja pašu imports (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Skatītāja pašu lasītāji aprakstīti [Tacview ierakstos](tacview-acmi.md) un [Failu ielādē](loading-files.md); vienfailu forma ir [Viens fails - viens mačs](container.md). Viens mačs kļūst par tabulu, `match.json` un blakusdaļām, pēc izvēles savāktām vienā `.3dheat` failā. Katra rīka README ir sadaļa **Pilnīgums**, kas šim avotam uzskaita, kas tiek nolasīts, kas tiek saglabāts neapstrādāts un kas nav pieejams, un kāpēc.

## Trīs mājas katram vienumam {#three-homes-for-every-item}

Viss, ko avots satur, nonāk tieši vienā no trim vietām:

| Māja | Kas tur nonāk |
|---|---|
| **Atšifrēts** | Tabula (viena rinda uz paraugu vai notikumu, skatītāja nolasītās kolonnas, papildu kolonnas katrai citai vērtībai, kas pieder rindai) un mača dokuments `<match>.match.json` (viss, kas pieder mačam kopumā: iestatījumi, sastāvi, rezultāti, rezultātu tabulas, pašpārbaude). |
| **Saglabāts neapstrādāts** | Blakusdaļa blakus tabulai: katrs vienums, kas nav atšifrēts vai ir atšifrēts tikai daļēji, vesels un nemainīts, ar tā tipu, laiku un vienību vai būtni, kam tas pieder. |
| **Nav pieejams** | Nosaukts README sadaļā Pilnīgums ar iemeslu: formāts to nenes (klienta atskaņojumā nav citu spēlētāju ievades), avots to nekad nesūta, vai to lasīt nav atļauts (aizsargāts process, šifrēts bloks, kura atslēga nav mūsu lietojumā). |

Vienums, kas ir **daļēji** atšifrēts, ir gan atšifrēts, gan saglabāts neapstrādāts: tabula saņem to, kas ir saprotams, blakusdaļa - visu vienumu, tātad vēlāk labāks dekodētājs nevajag oriģinālo failu.

Ceturtās vietas nav. Kaut kā izmešana, jo tas šķita nederīgs, jo tas bija dublikāts "varbūt", vai jo tas bija liels, ir kļūda. Retināšana ir atļauta tikai tabulā (kamera ar 2 Hz 60 Hz vietā), nekad blakusdaļā.

## Blakusdaļas {#sidecars}

Blakusdaļa ir Parquet fails blakus tabulai, nosaukts pēc tās:

```
<mape>/<match>.parquet              tabula
<mape>/<match>.match.json           mača dokuments
<mape>/<match>.<what>.parquet       blakusdaļa
```

`<what>` ir viens vārds no šī saraksta. Jauns konvertētājs izvēlas vārdu, kas der, vai pievieno jaunu šeit **un** `SIDECAR_PARQUET` failā
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
lai skatītājs to izlaistu, kad ielādē visu mapi.

| `<what>` | Satur | Izmanto |
|---|---|---|
| `messages` | tīkla straumes paketes, būtņu metožu izsaukumi un īpašību atjauninājumi, veseli | War Thunder, World of Tanks, World of Warships |
| `flight` | lidmašīnu lidojuma modeļa ieraksti pa lidmašīnu, veseli | War Thunder |
| `packets` | veseli kadri un tīkla ziņojumi vai konteineru daļas ārpus būtņu straumes | CS2, Dota 2, Squad |
| `events` | spēles notikumi ar visām to atslēgām, kā tos dod parsētājs | CS2 |
| `entities` | būtņu un īpašību atjauninājumi, attālie izsaukumi, atvērti un aizvērti kanāli, kā arī eksporti, kas vajadzīgi dekodētājam | Squad, Dota 2 |
| `props` | katra būtnes īpašība, ko lasa parsētājs, katru reizi, kad tā mainījās | CS2 |
| `units` | katras vienības stāvoklis ārpus pozīciju tabulas | Dota 2 |
| `combatlog` | kaujas žurnāls, katrs ieraksts ar katru lauku | Dota 2 |
| `strings` | katrs ieraksts katrā virkņu tabulā | CS2, Dota 2 |
| `objectives` | uztveršanas zonas un mērķi, katra izmaiņa ar savu laiku | War Thunder |
| `raw` | tiešraides straume: katra saņemtā paketa, rinda, API dokuments vai atmiņas nolasījums, vesels | novērotāja sesijas (`heat.raw.parquet`), spēles uztveršanas rīka apļu ierakstītāji (`<stamp>_<game>.raw.parquet`), novērotāja osu!, LoL un Valorant atskaņojumu faili |

Skatītāja mapes ielāde izlaiž katru šī saraksta `*.<what>.parquet`, un katru `*.match.json`, `*.meta.json`, `*.summary.json` un pārējās JSON blakusdaļas; ja atverat vienu no tām pašu, izvēloties vai nometot tikai šo failu, tas ielādējas kā jebkura cita tabula (skat. [Failu ielāde](loading-files.md)).

Šie ir faili, kā tos raksta konvertētājs ar `--loose`. Pēc noklusējuma War Thunder, CS2 un Tacview konvertētāji iesaiņo mača tabulu, dokumentu un blakusdaļas vienā failā `<match>.3dheat` ar tiem pašiem nosaukumiem (skat. [Viens fails - viens mačs](container.md)); viss šeit attiecas uz katru dalībnieku.

### Kolonnas {#columns}

Katra blakusdaļas rinda ir viens vienums. Kolonnas ir šādā secībā, tās, kas attiecas:

| Kolonna | Tips | Kas tas ir |
|---|---|---|
| `time` | float64 | sekundes tajā pašā pulkstenī kā tabulas `time` (vai `tick`, kur avots skaita tikus; tad abi) |
| `type` | virkne (vārdnīca) | kas vienums ir avota pašos terminos: paketes tips, ziņojuma id, notikuma nosaukums, īpašības ceļš, rindas priedēklis |
| `name` | virkne (vārdnīca) | tā nosaukums, kur tas ir zināms (kopienas nosaukums, klases nosaukums), citādi tukšs |
| `entity` / `unit` / `uid` / `player` | vesels skaitlis vai virkne | kam tas pieder, tajos pašos id kā tabulā, lai blakusdaļas rindu varētu savienot ar trasi |
| `decoded` | virkne (JSON) | kas no tā ir saprotams, ja kaut kas ir; citādi tukšs |
| `payload` | bināri | vienuma baiti, veseli un nemainīti (binārajos avotos) |
| `text` | virkne | vienuma teksts, vesels un nemainīts (teksta avotos: žurnāla rinda, JSON objekts, atslēgu-vērtību bloks) |

Papildu kolonnas ir atļautas (bitu nobīde, izmērs, kanāls). Atkārtotas virknes tiek kodētas vārdnīcā, un fails tiek rakstīts ar zstd, tāpēc blakusdaļa ir tikai daļa no paša atskaņojuma izmēra.

Blakusdaļai jābūt pietiekamai pašai par sevi: vēlāk rakstīts dekodētājs lasa blakusdaļu, nekad oriģinālo atskaņojumu. Kur vienumu nevar saprast bez konteksta (būtnes klase, virkņu tabula, atslēga, uz kuru atsaucas ziņojums), konteksts tiek ierakstīts arī blakusdaļā vai mača dokumentā.

### Tiešraides avoti {#live-sources}

Tiešraides adapteriem (UDP telemetrija, kopīga atmiņa, spēles žurnāls, vietējā API) nav neviena faila, uz ko atgriezties. Tie ieraksta **katru lauku, ko avots sūta**, pat tos, ko vēl nekas neizmanto:

- paketes straume: katra paketa vesela, `payload` - baiti, `type` - tās paketes id vai formāts, ar ātrumu, kādā tā ienāk;
- kopīga atmiņa vai aptaujāta API: katrs lauks katrā nolasījumā, vai nu kā nosauktas kolonnas, vai viss bloks kā `payload`, ar ātrumu, kādā adapteris lasa;
- žurnāls: katra rinda, `text` - rinda, `type` - rindas veids, ieskaitot rindas, ar kurām adapteris nerīkojas.

Šie nonāk `<session>.raw.parquet` blakus sesijas tabulai. Izmērs ir noteikuma cena; to samazina zstd un vārdnīcas kodēšana, nevis atstājot lietas ārpusē.

## Pašpārbaude {#the-self-check}

Katrs konvertētājs ieraksta savā mača dokumentā (vai sesijas `meta.json`, vai kopsavilkumā, kur mača dokumenta nav) bloku `completeness` zem `selfCheck`:

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

| Lauks | Nozīme |
|---|---|
| `seen` | cik šī tipa vienumu avots satur |
| `decoded` | nolasīts veselu tabulā vai mača dokumentā |
| `partial` | nolasīts daļēji tabulā vai dokumentā, un saglabāts vesels blakusdaļā |
| `raw` | saglabāts vesels tikai blakusdaļā, neatšifrēts |
| `lost` | `seen - decoded - partial - raw`: jābūt 0 |

Augšējā līmeņa `lost` ir summa. Konvertētāja testi apgalvo, ka tas ir 0 viņu sintētiskajos paraugos, un README saka, kāds tas bija reālajos. Nenulles `lost` ir konvertētāja paziņojums, ka tas pārkāpa noteikumu; tas nosauc tipu, lai spraugu varētu atrast.

"Tipi" ir paša avota: paketes tipi, ziņojumu id, notikumu nosaukumi, īpašību grupas, rindu veidi. Tie tiek skaitīti tur, kur konvertētājs tos sastop, nevis no saraksta ar to, ko tas sagaida, tāpēc tips, par kuru neviens nezināja, parādās ar savu skaitu, nevis pazūd.

## README sadaļa Pilnīgums {#the-readmes-completeness-section}

Katra konvertētāja README ir sadaļa ar virsrakstu **Pilnīgums** ar trim sarakstiem:

- **Nolasīts**: kas nonāk tabulā un mača dokumentā, un kā katrs jaunais lauks tika pārbaudīts pret kaut ko neatkarīgu (spēles pašu skaitļiem, otru avotu, ierakstu, kas veikts šim nolūkam).
- **Saglabāts neapstrādāts**: kas ir kurā blakusdaļā, zem kura `type`, un kas par to līdz šim zināms.
- **Nav pieejams**: ko avots nenes vai ko nedrīkst lasīt, un kāpēc.

Tā atsaucas atpakaļ uz šo lapu.

## Kur stāv katrs konvertētājs {#where-each-converter-stands}

| Konvertētājs | Blakusdaļas | Tā sadaļa Pilnīgums |
|---|---|---|
| War Thunder atskaņojumi | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (tā pašpārbaudes skaitļi ir zem `counts`; bloks `completeness` tiks pievienots) |
| World of Tanks atskaņojumi | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships atskaņojumi | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad servera demo | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 demo | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 atskaņojumi (novērotājs) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 atskaņojumi](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant atskaņojumi (novērotājs) | `raw` | to lapas [novērotāja dokumentos](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Tiešraides adapteri (novērotājs) | `raw` | katras spēles lapa [novērotāja dokumentos](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), un [izstrāde](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) `Session.raw` |
| Apļu ierakstītāji (spēles uztveršana) | `raw`, un `unparsed` baiti Forza apļa failā | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Skatītāja pašu imports | nav: skat. zemāk | šī lapa |

### Skatītāja pašu imports {#the-viewers-own-imports}

Tacview ACMI, OCAP un GPS formāti tiek nolasīti pārlūkprogrammā no lietotāja pašu faila; skatītājs no tiem neko neglabā, tāpēc pats fails paliek kā ieraksts. Tie tomēr nolasa, cik vien var:

- **Tacview ACMI** (`src/data/acmi.ts`): katra objekta rinda ar pozīciju ir rinda ar katru īpašību, ko ieraksts satur; katrs notikums ir rinda; katra noņemšana ir rinda; paša ieraksta īpašības (ar galvenes FileType un FileVersion) katrā rindā kā `RecordingInfo`; komentāra rinda ir notikums `Comment`, objekts, kas nekad nesaņem pozīciju, ir rinda `Unplaced` atsauces punktā, un U/V ir kolonnas, kad jebkurai rindai tās ir. Īpašības rinda bez pozīcijas tiek nolasīta daļēji: tās vērtības nonāk objekta nākamajā rindā, nevis savā laikā. `AcmiTable.completeness` uzskaita faila rindas pēc veida.
- **OCAP** (`src/data/ocap.ts`): katras būtnes kadri, šāvieni, marķieri, katrs notikumu veids (nezināmi veidi kā "Mission" rindas ar savu tekstu) un paša dokumenta lauki (`Info`). Vēl nav nolasīts: būtnes lauki un pozīciju elementi aiz tiem, kas uzskaitīti tā galvenē (jaunāka ierakstītāja papildinājumi), un miršanas vienības atkārtotie kadri pēc tās nāves (tīšām retināti: tajos nekas nemainās).
- **GPS formāti** (`src/data/geoTracks.ts`): fiksācijas, to laiks, augstums, kurss un ātrums, kā arī sirdsdarbība, kadence, jauda, temperatūra, satelīti, HDOP un spiediena augstums, kur fails tos reģistrē. Vēl nav nolasīts: citi GPX un KML paplašinājumi, NMEA teikumi, kas nav pozīciju teikumi, IGC ieraksti, kas nav fiksācijas un to paplašinājumi, un FIT ziņojumi, kas nav ieraksti (apļi, sesijas, ierīces informācija).

Šīs spraugas ir uzskaitītas, lai tās tiktu aizvērtas, nevis lai tās attaisnotu; skatītāja ielādēta ieraksta eksporti (`src/data/exportRecording.ts`) raksta tikai to, kas tika nolasīts.

## Konvertētāja pievienošana {#adding-a-converter}

1. Uzskaitiet, ko formāts satur, no tā dokumentācijas, tā paša struktūrām vai saskaitot katru ziņojuma tipu reālos paraugos. Saraksts ir pašpārbaudes `types`.
2. Atšifrējiet to, ko var pārbaudīt tagad. Katrs jaunais lauks tiek pārbaudīts pret kaut ko neatkarīgu, pirms tas nonāk tabulā; lauks, ko vēl nevar pārbaudīt, paliek neapstrādāts.
3. Saglabājiet pārējo veselu blakusdaļā ar nosaukumu, kā minēts augstāk, ar augstāk minētajām kolonnām.
4. Uzrakstiet bloku `completeness` un testu, ka tam `lost` ir 0.
5. Uzrakstiet README sadaļu Pilnīgums un saiti uz šo lapu.
6. Ja blakusdaļas `<what>` ir jauns, pievienojiet to tabulai augstāk un `SIDECAR_PARQUET` failā `src/data/filePick.ts`.

Konvertētāji ir tīras telpas: tie ir rakstīti no formātiem, dokumentācijas un paraugiem, nekad no GPL vai AGPL koda. Reālo atskaņojumu paraugi paliek mašīnā, kurā tie tika izveidoti; testos tiek izmantoti sintētiski faili.
