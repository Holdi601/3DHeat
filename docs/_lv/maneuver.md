---
title: "Manevri"
parent: "Atziņas"
nav_order: 4
lang: "lv"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevri: kā grupas pārvietojas

**Atziņas → Manevri** seko tam, kā katras puses vienības pārvietojas *kā grupas*. Tas nosauc manevrus, ko tās veic: flanga uzbrukumu, spīļu manevru, izrāvienu, zasēdi, atkāpšanos, raķešu aizsardzību un šķērsošanu T. Katram manevram tiek rādīts, cik pārliecināts ir tas, kādi skaitļi tam ir pamatā, vai tas atmaksājās un kādas paralēles tam ir doktrīnā un vēsturē. **Masveida analīze → Manevri** saskaita tos tūkstošos mačos: cik bieži katrs manevrs tiek veikts katrā kartē, katrā režīmā un katrā pusē un cik bieži tas atmaksājas.

Viss tiek aprēķināts jūsu pārlūkprogrammā, atsevišķā darba procesā (`src/insights/maneuver`). Mačs ar dažiem simtiem vienību aizņem 10–500 ms, divu stundu gaisa karš ar tūkstošiem objektu — apmēram sekundi.

## Lietošana {#using-it}

- Atveriet **Atziņas**, cilni **Manevri**. Pirmo reizi to atverot, tas saskaita. Pēc filtru maiņas nospiediet **Meklēt vēlreiz**.
- **Drošs / Ticams / Iespējams** iestata rādāmo ticamības līmeni (pēc noklusējuma — Ticams).
- **Laika līnijai** katrai pusei ir sava josla, un katram manevram — sava svītra. Zemāk esošais **saraksts** rāda to pašu, sakārtotu pēc laika. Klikšķis pārslēdz uz atskaņošanu manevra sākumā, pārvieto kameru tam klāt un to zīmē 3D: katras grupas kustības ceļu kā bultu (spīļu manevra abas rokas ir divas bultas), grupu kontūras galvenajā brīdī (ienaidnieka kontūru — tās puses krāsā) un ienaidnieka priekšpusi kā baltu līniju. **Zīmēt visus 3D** pievieno pārējos mača manevrus, bāli. Līnijas grafikas kartei nosūta vienreiz, kad izvēle mainās, nevis katrā kadrā. Ar 480 manevriem, kas zīmēti atskaņošanas laikā, kadru laiks reālā grafikas kartē (WebGL2 un WebGPU, p99 18,0–18,5 ms, maks. 19,5–20,8 ms) ir tāds pats kā bez tiem.
- Atvērtais manevrs rāda savu iznākumu: to vienību nogalinājumus un zaudējumus, kas to veica, gan tā laikā, gan tūlīt pēc tā, salīdzinot ar tās puses apmaiņu visā mačā. Tajā ir arī tā pierādījumi un zināšanu bāzes ieraksti par to: doktrīna un vēsturiskās paralēles (Kanna spīļu manevram, Sedāns 1940 izrāvienam, Cušima šķērsojot T, Operācija Bolo māņuzbrukumam...).
- Mazā tabula beigās: pa veidiem un pusēm — veikts un atmaksājies.

![Spīļu manevrs sintētiskajā demonstrācijas mačā: abu roku bultas, ienaidnieka korpuss un tā priekšpuse](../assets/img/en/maneuvers.webp)

## Kā atrod grupas {#how-groups-are-found}

Katra vienība tiek novietota uz kopīgas laika skalas. Solis ir 1 s kājniekiem, citādi 2 s; lielākiem failiem — garāks. Vienība pēc nāves tiek turēta uz vietas, lai atdzimšana nevilktu līniju pāri kartei. Katrā solī vienības vienas puses un viena veida (lidmašīnas, transportlīdzekļi, kuģi, kājnieki) tiek savienotas, ja tās atrodas tuvu — 18 m kājām, 170 m transportlīdzekļiem, 3 km kuģiem, 5 km lidmašīnām — un kustas līdzīgi (ātrumi atšķiras ne vairāk kā par pusi no ātrākā, vai arī abas stāv). Klasteris paturē to grupas ID, kurā bija lielākā daļa tā dalībnieku. Vienība bez klases tiek ieskaitīta kājnieku, transportlīdzekļu vai gaisa vienību skaitā pēc tās ātruma.

Grupas **formu** nolasa attiecībā pret tās virzienu: kolonna vai līnija — pēc tā, cik lielā mērā dalībnieki izkliedējas gar un šķērsām. Ķīlis ir tad, kad vidus virzās priekšā. Ešelons ir tad, kad dalībnieki atkāpjas uz vienu pusi. Kaste ir tad, kad tie aizņem stūrus.

Viss tiek vērtēts pēc paša mača mēroga. **Iesaistīšanās diapazons** `R` ir 75. procentile attālumam starp nogalinātāju un upuri (ierobežots ar domēna robežām). Manevra laiks mērogojas atkarībā no vienību veida: kājniekiem — trešdaļa no sauszemes vienību laika.

## Ko tas atrod {#what-it-finds}

| Manevrs | Atrasts, kad |
|---|---|
| Formējums | grupa 30 s saglabā vienu un to pašu formu 60% savu kustības soļu |
| Frontālais uzbrukums | grupa tuvojas no ārpus diapazona līdz saskarei, ¾ R vai vairāk, virzienā, kurā ienaidnieks ir vērsts, ne vairāk kā 35° novirzē |
| Flanga uzbrukums | tas pats, bet no 50–130° (aiz muguras — vēl tālāk); pilnīgi drošs tikai ar draudzīgu *nostiprinošo spēku*, kas tur cīnās ar ienaidnieku (nogalinājumi jebkurā virzienā) |
| Spīļu manevrs | divi flanga uzbrukumi no vienas puses uz to pašu ienaidnieka korpusu no pretējām pusēm (100° vai vairāk vienu no otra), 90 s laikā; pilnīgi drošs, ja abas rokas cīnās |
| Ieskaušana | kompakta ienaidnieka grupa ar vismaz tikpat daudz citas puses vienībām apkārt 1,5 R attālumā, no divām vai vairākām grupām, bez spraugas virs 100°, minūti, nogriezta no savas puses. Pilnīgi droša, ja gredzens sašaurinājās par ½ R un cīnījās ar kabatu |
| Iespiešanās | grupa šķērso turētu līniju (ienaidnieki stāv 30 s gan pa kreisi, gan pa labi no tās, viņu puses centrs — aiz tiem). Pilnīgi droša, ja tā nonāk ½ R aiz tās, paliek 20 s un cīnās tur; izrāviens — vēl R tālāk |
| Segu apguve | mazā grupā daļa kustās, kamēr pārējie stāv, lomām četras vai vairāk reizes mainoties, ar seguma uguni no stāvošās daļas |
| Koncentrācija / izkliedēšanās | puses īpatsvars tuvu tās blīvākajai vietai pieaug no 35% līdz 60% (vienības nāk 1,5 R vai vairāk, tad saskare) vai krīt, kad puse izkliedējas |
| Māņu manevrs | neliels elements saskarē piesaista divus vai vairākus ienaidniekus no citurienes; lielāka grupa tad uzbrūk 4 diapazonu attālumā, kur ienaidniekam ir mazāk |
| Atkāpšanās / vajāšana | grupa saskarē pagriežas prom un atver R attālumu no vietas, kur cīnījās. Pilnīgi droša, ja tur esošs ienaidnieks tikko bija nogalinājis vienu no tās un grupa tālāk par šo slepkavu bija 2 R attālumā (kājām nekad — skatīt zemāk); ienaidnieki, kas kustas tajā pašā virzienā un tur kopā, vajā |
| Aizsardzība dziļumā | stāvošas vienības divās vai vairākās joslās pāri ienaidnieka asij, R dziļumā, ienaidnieks nāk virsū, uguns no joslām |
| Apgāztā nogāze | trīs vai vairāk nogalinājumi īsā attālumā no stāvošām vienībām, kuru upuri bija nākuši pār grēdu |
| Zasēde | kustīga grupa satiek ienaidniekus, kas 45 s stāvēja; tie šauj pirmie, un kustīgie zaudē divus vai pusi no grupas |
| Ekrāns | viena vai divas vienības virzās priekšā trīs vai vairāku vienību korpusam un pirmās satiek ienaidnieku |
| Iekšējās līnijas | puses grupas atrodas cieši blakus starp otras grupām, un tās vienības pārvietojas starp tām |
| Tempo | puse atbild uz saskari (pagrieziens, ātruma maiņa, pirmais šāviens) par 1,5 reizēm ātrāk; Mann–Whitney p mazāks par 0,05 |
| Sviras, iecirtums, velkšana, sūknēšana | raķešu palaišanas mērķis pagriež šāvēju par 35–70°, 75–105° vai vairāk nekā 140°, vai velkas un pagriežas atpakaļ |
| Gaisa spīles, siena, vadītājs–sekotājs, slīpēšana | pāris, kas dalās un virzās uz vienu ienaidnieku; trīs blakus pret ienaidnieku; elements 5–20 km aiz cita; divi riņķo ap vienu punktu, viens no otra atstatu |
| Kaujas gaisa patrulēšana | riņķo ap staciju trīs minūtes |
| Enerģijas / leņķu cīņa | tuvā cīņā — virzieni 30° attālumā, katrs pēc kārtas tur otru savā priekšā, vai nogalinājums starp tiem — izmantots augstums un kāpšana vai lidojums līdzeni un stipri pagriežoties, samazinot ātrumu. Pilnīgi droša, ja viens nogalināja otru |
| Triecienu grupa, SEAD | gaisa grupa ar jauktām lomām, daļa no kurām trieca zemi; pretgaisa aizsardzības nogalinājumi — pirms lielākās daļas citu nogalinājumu uz zemes |
| Kaujas līnija, T šķērsošana | trīs kuģi kolonnā; kolonna kvadrātā šķērso ienaidnieka kolonnas priekšgalu |

Katrs manevrs norāda, kuras zināšanu bāzes **shēmas** tas rāda (`patterns-maneuver.ts`: formējums, frontālais uzbrukums, dubultā ieskaušana, ieskaušana, iespiešanās, uguns un manevrs, māņu manevrs, atkāpšanās, vajāšana, aizsardzība dziļumā, ekrānēšana, izkliedēšanās, raķešu aizsardzība, leņķu cīņa, kaujas gaisa patrulēšana, triecienu grupa, kaujas līnija, T šķērsošana), kā arī ierakstus, kas jālasa vispirms. Vecākie ieraksti jaunās shēmas pārnes caur `knowledge/maneuver-tags.ts`. Skatīt [Zināšanu lēca](knowledge.md).

**Atmaksājās** salīdzina vienību apmaiņu tā laikā (un minūti pēc tā) ar tās puses apmaiņu visā mačā. Atkāpšanās atmaksājas, ja pēc pagrieziena zaudēts mazāk vienību nekā pirms tā. Raķešu aizsardzība atmaksājas, ja lidmašīna dzīvo minūti. Ieskaušana atmaksājas, ja kabata zaudē pusi.

## Vairāku mačų kopskats {#over-many-matches}

Katra mača kopsavilkums (`src/mass/summarize.ts`, skatīt [Masveida analīze](mass-analysis.md)) satur nelielu `maneuvers` sadaļu: pa veidiem un pusēm — veikts (Ticams vai augstāk), atmaksājies, neatmaksājies, nogalinājumi un zaudējumi. **Masveida analīze → Manevri** saskaita tos mačos, ko filtrs atstāj — pa karti un režīmu vai visiem kopā — ar atmaksāšanās rādītāja Vilsona intervālu. Rindas klikšķis ielādē mačus, kuros tas veikts. Kopsavilkumi, kas rakstīti pirms šīs sadaļas, to nesatur: palaidiet `node tools/3dheat-summarize.mjs <mape> --force`, lai to pievienotu.

## Cik tas ir drošs {#how-sure-it-is}

Sintētiskie mači ar iestrādātiem manevriem (`synth.ts`, palaiž `maneuver.test.ts`): visi 28 iestrādātie veidi tiek atrasti ar Ticams vai augstāku. No 50 ziņotajiem manevriem 31 ir iestrādātais veids, bet pārējie 19 patiesi ir arī tur (grupas formējums, iespiežošās kolonnas frontālā tuvošanās). Neviens nav kļūdains. Uz 30 nulles mačiem — nejauši gājieni atsevišķi un jaukti, vienības stāv nejauši, lidmašīnas taisnos lidojumos, pūlis, kas klaiņo — ar Ticams vai augstāku nekas nav ziņots.

Uz īstiem datiem (desmitiem sauszemes kauju, daži gari gaisa kara misijas, duci šāvēju mačiem): frontālie uzbrukumi, flangi, iespiešanās un ieskaušanas tanku kaujās; formējumi un tuvās cīņas gaisā; raķešu aizsardzības, kaujas gaisa patrulēšanas un vadītāja–sekotāja pāri gaisa kara misijās; frontālās izpildes, kolonnas un daži zasēdes un segu pāri šāvēju spēlēs. Slieksņi ir doktrīnas formas spēles mērogā. Atsevišķu atradumu lasiet kopā ar tā pierādījumiem, bet masas tabulas īpatsvarus — kopā ar to intervāliem.

### Pret nulles modeļiem tiem pašiem mačiem {#against-null-models-of-the-same-matches}

Detektoru var pievilt zeme un pūlis: kautiņā ikvienai grupai ir ienaidnieki visapkārt. Tāpēc katrs veids tiek palaists arī uz **nulles modeļiem**, kas veidoti no tiem pašiem mačiem, kur puses vairs nesatiekas kā īstenībā: vienas puses laika līnija pagriezta par trešdaļu līdz divām trešdaļām mača (*shift*) vai tās trajektorijas pagrieztas ap kartes centru (*rotate*); un komandu etiķetes sajauktas (*teams*, kas pēc konstrukcijas saglabā apmēram pusi no īstajām cīņām). Cīņas tiek skaitītas tikai kā nogalinājumi, sapāroti ar to nāvēm: nogalinātājs 2 R attālumā un upuris vietā. Nulles modelis šos pārus izjauc. Atrod mačā ar Ticams vai augstāk, īsti pret nulles modeļiem (30 tanku kaujas; 12 šāvēju spēļu mači):

| Veids | Tanku kaujas: īsts / shift / rotate | Šāvēju spēle: īsts / shift / rotate |
|---|---|---|
| Ieskaušana | 0 / 0 / 0 (bija 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Iespiešanās | 0,03 / 0,02 / 0,05 (bija 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flangs | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontālais uzbrukums | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Atkāpšanās | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (tāpēc kājām nekad nav drošs) |
| Zasēde | - | 0,17 / 0,04 / 0,04 |
| Enerģijas cīņa | 1,2 / 0,1 / 0,85 | - |
| Leņķu cīņa | 0,6 / 0,07 / 0,3 | - |

Tuvās gaisa cīņas virs kaujas lauka centra pārdzīvo pagriezienu ap šo centru, tāpēc rotate kolonna tām mazāk labvēlīga nekā sauszemes veidiem. Veidi vienas puses ietvaros — formējums, kaujas gaisa patrulēšana, slīpēšana, triecienu grupa, SEAD, segu pāri, ekrāns — nav atkarīgi no otras puses, un tos šādi nepārbauda. `maneuver.test.ts` pārbauda, ka nulles modeļi no sintētiskajiem mačiem izņem iestrādāto flanga, spīļu manevra, ieskaušanas, iespiešanās, zasēdes un atkāpšanās manevru.

## Ierobežojumi {#limits}

- Grupām vajadzīgas pozīcijas laika gaitā. Fails, kurā ir tikai notikumi, pozīciju nesatur.
- Virziens netiek nolasīts no datiem. Ienaidnieka priekšpuse ir tur, kur nostiprinošais spēks to satiek; ja ne, tad tur, kur tas kustas; ja ne, tad tur, no kurienes nāca uzbrucējs.
- Reljefs tiek nolasīts pēc vienību pašu augstumiem (apgāztā nogāze). Redzamības līnijas pārbaudes nav.
- Ļoti lieli faili tiek paraugoti lielākos soļos. Īsus gaisa manevrus tajos joprojām nolasa no 2–4 s soļiem.
