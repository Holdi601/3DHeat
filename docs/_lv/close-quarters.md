---
title: "Tuvcīņa un raundi"
parent: "Atziņas"
nav_order: 2
lang: "lv"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Tuvcīņa un raundi

Šaušanas spēlēm ar raundiem (vispirms Counter-Strike, jebkuriem datiem ar raundiem, pusēm un nogalinājumiem) Atziņas mēra, kā cīņas tika uzvarētas: kas ieguva atklājošos duelus un cik tie bija vērti, vai nāves tika apmainītas, vai spēlētājs, kas ielūkojas leņķī, uzvarēja to, kas tur to, vai krustuguns un zibinātāji atmaksājās, kā raunda izredzes mainījās ar katru nogalinājumu un kuras durvis nogalināja spēlētājus, kas tajās ienāca. Izmantojiet to, lai redzētu, kāpēc raundi tika uzvarēti, nevis tikai to, kas guva nogalinājumus.

Mēri nāk no telpu tīrīšanas un pilsētas doktrīnas (nāves piltuve, dominēšanas punkti, krustuguns) un no e-sporta un sporta analītikas (uzvaras varbūtība, darbību vērtība, pielāgotais plus-minus). Katrs tiek lasīts caur [zināšanu lēcu](knowledge.md) un citēts.

## Izmēģiniet {#try-it}

1. Ielādējiet vienu vai vairākus mačus ar raundiem (CS2 konvertācijai ir viss, kas vajadzīgs).
2. Atveriet **Atziņas** un nospiediet **Atrast atziņas**.
3. Zem **Lēcas rādītāji** izlasiet rindas no *Raunda uzvaras varbūtība* līdz *Spēlētāja ietekme*; katrai ir savi skaitļi, tās 95% intervāls, tās q vērtība un avoti, kurus tā seko.
4. Izvēlieties lēcu **E-sports** vai **Pilsētas kauja**, lai tās lasītu caur šo literatūru; **Rakstīt ar MI** nosūta tās kopā ar pārskatu.

## Ko tas mēra {#what-it-measures}

| Mērs | Ko tas saka | Kā |
|---|---|---|
| Raunda uzvaras varbūtība | Cik iespējams katrai pusei bija uzvarēt raundu katrā brīdī | Loģistiskā regresija pēc spēlētājiem, kas dzīvi katrā pusē, bumbas vai mērķa un tā laika, raunda pulksteņa un pirkuma, pielāgota ielādētajiem datiem; kalibrēšana pārbaudīta ārpus paraugkopas pēc raunda (Brier rādītājs un prasme, log zaudējums, kalibrēšanas kļūda desmit grupās, pārkalibrēšanas slīpums, AUC) |
| Darbību vērtība | Cik daudz nogalinājums, atklājošais nogalinājums, apmaiņa, nogalinājums aiz zibinātāja, uzstādīšana vai zibinātājs mainīja puses izredzes uzvarēt | Uzvaras varbūtība pēc mīnus pirms; apmaiņas, atklājošie un zibinātie nogalinājumi pārbaudīti pret citiem nogalinājumiem ar permutāciju |
| Atklājošie dueļi | Kura puse uzvar pirmo duelli, cik bieži tas uzvar raundu un kur viena puse uzvar atklājumus krietni virs savas vidējās | Vilsona intervāli; vietas ar precīzo binomiālo testu pret pusei piederošo daļu, q pār vietām |
| Apmaiņas | Nāves, uz ko atbildēts ar biedra nogalinājumu, kurš nogalina nogalinātāju 5 s laikā; cik ilgs tas prasīja un raundi, kas uzvarēti, kad pirmā nāve tika apmainīta | Fišera precīzais tests, Ņūkomba intervāls |
| Ielūkotājs pret turētāju | Duelji, kuros viens spēlētājs kustējās cīņā (1,5 m/s vai vairāk pēdējā sekundē), bet otrs stāvēja (0,75 m/s vai mazāk): ielūkotāja daļa | Precīzais binomiālais tests pret vienu pusi |
| Mērķēšana pirms duela | Katra spēlētāja skats pret virzienu uz otru 0,75 s pirms nogalinājuma; kurš bija labāk nomērķējis un cik bieži šis spēlētājs uzvarēja; turētāji savā leņķī (15° robežās) pret ārpus tā; nogalinājumu diapazoni | Precīzais binomiālais tests; Fišers |
| Krustuguns | Turētāji ar stāvošu biedru 25 m robežās no ielūkotāja, kura līnija uz to ir 35° vai vairāk no viņu paša, pret turētājiem vienatnē | Fišers, Ņūkombs |
| Palīglīdzekļi ieejā | Ielūkotāji aiz sava puses zibinātāja (3 s un 15 m robežās) vai dūmu (18 s robežās) pret sausiem ielūkiem; atklājošie duelji ar zibinātāju tikai vienā pusē; aklotie upuri | Fišers, binomiālais |
| Vīru pārsvars | Katram spēlētāju stāvoklim dzīvu (5 pret 4, 4 pret 5, 2 pret 1 ...), kas pirmo reizi sasniegts raundā — to raundu daļa, ko uzvarēja no tā | Vilsona intervāli |
| Clutch | Raundi, kur puse nonāca pie sava pēdējā spēlētāja: uzvaras pret modeļa gaidītajām uzvarām, pēc pretinieku skaita | Normāls tests novērotajam pret gaidīto |
| Sakopošanās, rotācijas, slēpšanās | Lielākā grupa 10 m robežās atklājošajā duelī (3 vai vairāk: sakopojušies); spēlētāji vairāk nekā 30 m no pirmās cīņas vai uzstādītā mērķa un cik ātri tie nonāk 12 m robežās; laiks un nogalinājumu pret nāvēm izredzes vairāk nekā 30 m no katra biedra | Fišers; izredžu attiecība ar Vulfa intervālu |
| Pēc uzstādīšanas un atkārtota uzbrukuma | Raundi, ko uzvarēja uzstādītāja puse, pēc skaitļiem uzstādīšanas brīdī un tās daļa duelos pēc uzstādīšanas | Vilsona intervāli |
| Nāves piltuves | Ieejas katrā vietā (vietas kolonnas maiņa, citādi 8 m šūnas maiņa) un nāves 2,5 s laikā pēc ieejas, pret kartes biežumu | Precīzais binomiālais tests, q pār vietām; attiecība saraujas ar 20 ieejām kartes biežumā |
| Spēlētāja ietekme | Uzvaras varbūtība, ko katrs spēlētājs pievieno katrā raundā (nogalinājumi, nāves, uzstādīšanas), saraujas ar empīrisko Bajesu; Riža pielāgotais plus-minus raunda rezultātiem pret modeļa sākumu; nogalinājuma vērtība pēc vietas un ieroča, saraujas | Sods izvēlēts ar piecu daļu krustvalidāciju |

Visiem vienas analīzes testiem ir kopīgs nepatiesu atklājumu īpatsvars (Benjamini–Hohberga), ieskaitot katru izmēģināto vietu, nevis tikai parādītās; parādītā q vērtība ir pār visiem tiem. Modelis un tā kalibrēšana tiek pielāgoti ielādētajiem datiem, tāpēc tie apraksta šo populāciju: profesionāls modelis nepareizi vērtē parastu spēli un otrādi.

Pārbaudīts uz sintētiskiem raundiem ar iestrādātiem efektiem (ielūkotāja pārsvars, krustuguns, zibinātāji, viena nāves piltuve, labāka mērķēšana uzvar), un uz 100 datu kopām ar tiem pašiem raundiem bez tiem, kur nepatiesu atklājumu īpatsvars iestrādāto efektu testiem jāpaliek nominālajos 5% (noteiktā joslā) (`src/insights/cqb/cqb.test.ts`); uz aptuveni tūkstoš reāliem raundiem modelis ieguva Brier rādītāju 0,14 pret 0,25 bāzes līmenim, kalibrēšanas kļūdu 0,03 un pārkalibrēšanas slīpumu 1,0.

## Kādi dati vajadzīgi {#data-it-needs}

- kolonnas **laiks**, **spēlētājs**, **puse** un **raunds** (sesija), un nogalinājumi un nāves notikumu kolonnā; raundi, kuros neviens nemirst divreiz, tiek uzskatīti par izslēgšanas raundiem (vīru pārsvars, clutch un modelis tos vajag);
- kolonna **cita puse** (`other`, `victim`, `killer`, `attacker`), kas nosauc upuri nogalinājumā un nogalinātāju nāvē (bez tās nogalinājumi un nāves tajā pašā brīdī tiek savienoti pāros);
- **skata virziens** mērķēšanas mēriem;
- neapstrādāta kolonna `event`, kas nosauc `flash`, `smoke`, `he`, `molotov`, `plant` un `defuse` palīglīdzekļiem un uzstādīšanai;
- `won` (rindas puse uzvarēja raundu), `place` (izsaukumi), `weapon`, `buy` un `state_flashed`, kur dati tos satur.

Pozīcijas vajadzētu paraugot vairākas reizes sekundē; ātrumi, mērķēšana un krustuguns nolasa pēdējās divas sekundes pirms katras nāves.

## Sadalījumā {#in-the-breakdown}

[Sadalījums](breakdown.md) četras situācijas mēra kā faktorus, ar un bez: *aklots*, *nāve apmainīta*, *atklājošais duelis* un skaitļi (*vīrs pārsvarā*, *vienādi skaitļi*, *vīrs mazāk*), katrs pēc K/D, uzvarētiem raundiem, izdzīvošanas un nogalinājumiem minūtē.

## Daudzi mači {#many-matches}

Katrs mača kopsavilkums no [daudzu mačų analīzes](mass-analysis.md) datiem ar raunda kolonnu satur tos pašus mērus kā skaitus (`cqb` kopsavilkumā): atklājošos duelus, apmaiņas, ielūkus, krustuguni, zibinātās ieejas, mērķēšanu, vīru pārsvaru, uzstādīšanas un 40 visbiežāk ieietās vietas ar to ieejām un nāvēm. Skaitļi saskaitās pa mačiem, tāpēc tūkstoš mači dod tādas pašas daļas kā viena liela analīze. Paneļa cilnē **Tuvcīņa** tās tiek rādītas kā daļas ar to intervāliem, pār visām kartēm vai pa kartēm; rindas klikšķis ielādē mačus, no kuriem tā nākusi.

## Izstrādātājiem {#for-developers}

`src/insights/cqb/`: `walk.ts` (viena caurlaide pa rindām laika secībā, raundi turēti atsevišķi, duelji ierakstīti ar to stāvokli), `finish.ts` (mēri un katra mača skaiti), `model.ts` (loģistiskā regresija ar IRLS, kalibrēšana, regresija ar konjugētiem gradientiem, empīriskais Bajess, Fišers, Ņūkombs, permutācijas testi), `run.ts` un `worker.ts` (skatītājs: savs darbinieks, blakus atziņu caurlaidei), `summary.ts` (daudzu maču kopsavilkuma kolektors), `factors.ts` (sadalījuma situācijas), `shows.ts` (ko lēca lasa), `synth.ts` (testa raundi). Zināšanu ieraksti ir `src/insights/knowledge/cqb.ts`, shēmas — `patterns-cqb.ts`. Rezultāti pārskatā ieiet kā `lens.cqb`.
