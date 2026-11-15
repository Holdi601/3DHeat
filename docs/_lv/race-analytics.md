---
title: "Sacīkšu analītika: metode"
parent: "Sacīkšu analīze"
nav_order: 58
lang: "lv"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---


# Sacīkšu analītika: metode

Īsumā:

- Apļi tiek salīdzināti **pēc attāluma**, nevis pēc laika, tāpēc tā pati vieta trasē sakrīt.
- Katrs līkums tiek vērtēts **veselā**, no vienas bremzēšanas zonas līdz nākamajai.
- Zaudētais laiks tiek **sadalīts** pēc tā, kur tas zaudēts (bremzēšana, ieeja, izeja, taisne), un pēc tā, cik daudz no tā izskaidro automašīna.
- Cēlonis tiek **izskaidrots vārdos** ar padomu.
- Lai to izmantotu, nevis lasītu, kā tas darbojas: skatiet [Sacīkšu analīze](race-analysis.md).

Šī ir metode aiz cilnes **Sacīkšu analīze**: ko tā mēra, kā tā nosaka, kur laiks ir aizgājis, un kā tā to pārvērš padomos. Tā ir specifikācija, ko seko analīzes kods (`src/race/`), tāpēc katram šeit minētajam noteikumam ir kods un tests, kas to pārbauda.

## Ko dara profesionālie rīki {#what-the-professional-tools-do}

Labi zināmie rīki saiet pie viena un tā paša kodola un atšķiras galvenokārt tikai ar to, cik tālu tie iet līdz *cēloņiem*:

- **Viss tiek salīdzināts pēc attāluma, nevis laika.** Divi apļi tiek pārparaugoti uz vienas distances ass; atšķirība pašpagājušajā laikā tajā pašā attālumā ir *delta* (MoTeC to sauc par laika variāciju, citi — par laika nobīdi vai delta līniju). Tās slīpums parāda, kur laiks tiek zaudēts tieši tagad: sekls slīpums ir paātrinājums, pretestība vai ilgstoša saķere; stāvs — bremzēšanas vai gāzes atšķirība; uz augšu un uz leju viļņojoša līnija — kompromiss starp ieejas ātrumu un izeju. ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/), [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html), [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Katrs līkums tiek sadalīts fāzēs**: bremzēšana, ieeja, vidus, izeja — bremzēšanas punkts, maksimālā bremze un atlaišana, minimālais ātrums un kur tas notiek, pārnesums, gāzes uzņemšana, atgriešanās pilnā gāzē, izejas ātrums. ([Driver61: six phases](https://driver61.com/uni/corner-phases/), [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sektori katrā līkumā un teorētiskais labākais**, sastādīts no ātrākajiem katrā. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps), [Overcut](https://overcut.gg/))
- **Arī braukto līniju salīdzina**, bet nekad atsevišķi: "līnija attēlā nenozīmē neko, kamēr neznat veicinošos faktorus" — to lasa kopā ar ātruma līkni un deltu. ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing), [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Cēlonis, nevis simptoms.** Vai zaudējums uz taisnes patiešām ir gāze, vai slikta ieeja piespieda vēlu gāzi? Kļūdas tiek sakārtotas pēc laika izmaksām apļa un izskaidrotas vienkāršā valodā. ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Kas nogāja greizi pirmajā versijā un kāpēc tas ir svarīgi {#what-went-wrong-in-the-first-version-and-why-it-matters}

Pirmā versija katru *fāzi* izmaksāja atsevišķi un skatījās tikai uz zaudējumiem. Aplis, kas bremzēja agrāk, zaudēja laiku bremzēšanas fāzē un tam teica bremzēt vēlāk — pat tad, kad šī agrākā bremzēšana pagrieza automašīnu ātrāk, lika gāzi ātrāk un izvilka no līkuma ātrāk, un visu to atguva uz taisnes. Vienā testā tas teica apļam, kas tā darīja, "bremzēt daudz vēlāk", kad otrs aplis — kas bremzēja vēlāk — bija palaidis apeksu, izbraucis plašāk un zaudējis tieši to, ko bija ieguvis. Laika dati teica, ka abi veidi caur līkumu ir vienādi; padoms teica pretējo.

Labojums ir noteikums, ar ko piekrīt visi iepriekš minētie avoti: **līkums tiek vērtēts veselā**, no bremzēšanas zonas tam līdz bremzēšanas zonai nākamajam, jo "dažreiz milisekunžu atdošana līkumā var uzlabot kopējo apļa laiku, ļaujot ātrākiem segmentiem pēc tam" ([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Sacīkšu zināšanas, ko noteikumi kodē {#racing-knowledge-the-rules-encode}

**Izejas ātrums ir svarīgāks par ieejas ātrumu**, un jo vairāk, jo garāka ir sekojošā taisne: "laiks, ko pavada taisnēs, dominē pār laiku līkumos", un ātruma deficīts izejā tiek nests līdz nākamajam bremzēšanas punktam. Ātrākais veids cauri līkumam un taisnei bieži ir braukt lēnāk līkumā, lai gāze nāktu agrāk — *lēns ieejā, ātrs izejā*. ([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/), [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)) Minimālā laika plānotājs, kas arī tiek atalgots par izejas ātrumu, pārvieto apeksus vēlāk un iegūst *ātrāku* apli; atalgojums, kas līdzsvaro abus, ir vērts `L / v²` uz vienību izejas ātruma taisnei garumā `L` ar ātrumu `v` — laiks, ko ātruma atšķirība izmaksā pa taisni, aug ar tās garumu un krīt ar ātruma kvadrātu ([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Līkumi pēc tā, uz ko tie ved.** Tas, kas ved uz taisni: maksimizēt izejas ātrumu, vēlu apeksu, atgriezties pie jaudas pēc iespējas ātrāk. Tas, kas ir taisnes galā: maksimizēt ātrumu, ko ienes, bremzēt pēc iespējas vēlāk, agrāks apekss ir pieņemams. Tas, kas ir starp līkumiem: kompromiss tam, kas svarīgāks pēc tā. Līkums, kas varētu būt jebkurš, tiek traktēts kā tāds, kas ved uz taisni. Ātrākiem līkumiem ir lielāks svars: ātrumā automašīna paātrinās vāji, un nozaudēto km/h neatgūst. ([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/), [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/), [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Berzes aplis.** Riepai ir viens saķeres budžets, ko tērē bremzēšanai, līkumošanai un paātrināšanai jebkurā kombinācijā; kopējais paātrinājums ir `sqrt(lat² + long²)`. Bremzēšana līkumā seko šā apļa malai: bremze tiek atlaista, kad stūre un sānu slodze pieaug. ([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/), [g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Ripošana** — neviens pedālis nav nospiests — ir lēnākais veids, kā zaudēt ātrumu, un pati par sevi mērāms galvenais rādītājs. ([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slīde.** Garenvirziena spēks sasniedz maksimumu pie slīdes koeficienta ap 10-20%, tad krītas; pēc tam ritenis bremzējot bloķējas vai, dzenot, griežas tukšgaitā. Forza ziņo normalizētu slīdi: 0 ir pilna saķere, lielums virs 1 nozīmē zaudētu saķeri. ([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip), [Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Nepietiekama un pārmērīga stūrēšana.** Priekšējais slīdes leņķis, lielāks par aizmugurējo, ir nepietiekama stūrēšana; aizmugurējais, lielāks par priekšējo — pārmērīga. Bez slīdes leņķiem: automašīna pagriežas mazāk, nekā stūre prasa (stūrēšana virs Ackermann leņķa `L/R`, kāds automašīnai vajadzīgs zemā ātrumā). ([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer), [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Līnijas ģeometrija {#the-geometry-of-a-line}

Ātrums, ko automašīna var noturēt uz rādiusa `R`, ir `v = sqrt(a R)`, kur `a` ir sānu paātrinājums, ko dod tās riepas (plus ko pievieno nolaišanās spēks, kas aug ar `v²`). Tātad **ātrums aug ar rādiusa kvadrātsakni**: līnija caur vidu ar 20% lielāku rādiusu ir apmēram 10% ātrāka tur. ([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html), [formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**Ģeometriskā līnija** ir lielākais loks caur līkumu: no ārējās malas, pieskaroties iekšpusei apeksā, atpakaļ uz ārējo malu. Līkumam, kas pagriežas par `θ` pa ceļu ar platumu `w` (mīnus automašīnas platums), loks, kas pieskaras abām ārējām malām un pieskaras iekšējam stūrim, ir `R = w / (1 - cos(θ/2))` (plus iekšējās malas pašas rādiuss) — taisnam leņķim apmēram `3,4 w`, pakavveida līkumam `w`. Tāpēc platuma izmantošana ir svarīgākā vidējos līkumos un vismazāk svarīga pakavveida līkumos. ([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**Vēlais apekss** pagriežas vēlāk un dziļāk, sākumā uz stingrāka rādiusa, un atver rādiusu izejā: lēnāks caur vidu, taisnāks agrāk, pilnā gāzē agrāk — "nedaudz zemāks minimālais ātrums, bet stiprāks paātrinājuma profils izejā". **Agrais apekss** ir pretējs: ātrāks ieejā, un rādiuss, kas sašaurinās izejā un tur gāzi atpakaļ — lielākoties kļūda, izņemot ļoti zemu saķeri, kur ieejā zaudēto ātrumu nevar atgūt izejā. ([Racing line](https://en.wikipedia.org/wiki/Racing_line), [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/), [math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" un "U".** U ir klasiskā apaļā līnija: platākais rādiuss, mazākā stūres maiņa. V ieiet līkumā agrāk, iet dziļāk, ātri pagriež automašīnu vidū un sagatavo izeju taisnākam izbraukumam: bremzēšana paliek taisna (tāpēc to var darīt vēlāk), minimālais ātrums ir zemāks, bet sasniegts vēlāk, pilna gāze nāk daudz agrāk. ([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Līkums pret distanci.** Ātrākā līnija ir kompromiss starp īsāko ceļu un vismazāk izliekto; uz sacīkšu trases platuma izliekums ir svarīgāks, un minimālā izliekuma līnija tuvojas minimālā laika līnijai visur, kur automašīna ir savā robežā — tā no tās atšķiras tur, kur automašīna varētu paātrināties. ([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2), [TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Līkumi pēc kārtas** — dubultais apekss, šikāna — ir viena problēma: viena izejas līnija ir nākamā ieejas līnija, un tie tiek braukti atpakaļ no tā, kas ved uz taisni. ([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Kura līnija der kurai automašīnai {#which-line-suits-which-car}

To nosaka automašīnas **jauda pret saķeri** šī līkuma ātrumos — "moments ir saķere pret jaudu, tas ir attiecības jautājums". ([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/), [momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Automašīna šajā līkumā | Līnija | Kāpēc |
|---|---|---|
| Paātrinās stipri pret savu saķeri ("nospied un šauj") | V: bremzēt taisni un vēlu, pagriezties īsā, stingrā vidū, taisni un agrā pilnā gāzē | laiku uzvar pilna gāze, nevis minimālais ātrums |
| Paātrinās vāji pret savu saķeri ("impulss") | plats U, nedaudz vēls apekss, uzturēt minimālo ātrumu augstu | tā nevar atgūt ātrumu, ko tā zaudē |
| Pa vidu | lēns ieejā, ātrs izejā: U ar vēlu apeksu | klasisks kompromiss |
| Ātrs līkums, un vēl vairāk ar nolaišanās spēku | U, tuvu ģeometriskajai līnijai | paātrinājums ātrumā ir vājš; nolaišanās saķere aug ar `v²`, tāpēc ātrums vidū atmaksājas divreiz |
| Ļoti zema saķere (slapjums, sniegs) | agrāks apekss | ieejā zaudēto ātrumu nevar atgūt izejā |
| Jauda tālu pāri saķerei | līnija mazāk svarīga | trakcija, nevis līnija, ierobežo izeju |

"Jo ātrāks līkums, jo tuvāk ģeometriskajai līnijai; jo lēnāks, jo vairāk to maina ar vēlāku apeksu." ([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html), [math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/), [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide), [Driver61: grip](https://driver61.com/uni/grip/))

Piedziņa vairāk maina to, kā līnija tiek braukta, nekā pati līnija: priekšējā piedziņas automašīna tiek pagriezta ar bremzēm (trail braking) un saņem jaudu tikai tad, kad ritenis atsiet, citādi tā nes plašāk; jaudīga aizmugurējā piedziņas automašīna pirms pilnās gāzes ir jāiztaisno, citādi aizmugure aizslīd; visu riteņu piedziņa var ņemt jaudu, joprojām griežoties, tāpēc tā gāzi uzņem agrāk. ([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/), [RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/), [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Skatītājs mēra automašīnas jaudas un saķeres attiecību katrā līkumā no tās pašas braukšanas — pilnas gāzes paātrinājums izejas ātrumā, dalīts ar sānu saķeri minimālajā ātrumā — un to sauc par "nospied un šauj" no 0,45 un augstāk, "impulss" no 0,25 un zemāk. Automašīna, kuras saķere 150-250 km/h ir vairāk nekā par 15% virs tās saķeres 55-110 km/h, darbina nolaišanās spēku.


## Metode {#the-method}

Zemāk esošie skaitļi ir pamatojums. Koda izmantotie sliekšņi ir atsevišķi katrā lapā, un šīs lapas ir atsauce, ja šeit minētais skaitlis atšķiras: [Līkumu pa līkumam analīze](race-corner-analysis.md), [Automašīnas vadības notikumi](race-control-events.md), [Automašīnu profili un salīdzinājums](race-car-profiles.md) un [Trases statistika](race-course-statistics.md).

### 1. Viena distances ass {#one-distance-axis}

Ātrākais aplis ir atsauce, ja vien lietotājs neizvēlas citu. Tā braukts ceļš ir ass: katra cita apļa paraugi tiek projicēti uz to, dodot katram paraugam distanci pa atsauci `s` un parakstītu sānu nobīdi `d`. Projekcija meklē uz priekšu tikai no iepriekšējās sakritības, tāpēc aplis, kas šķērso pats sevi, nekad nelec uz nepareizo tilta pusi. Pēc tam apļi tiek pārparaugoti uz vienu režģi, ik pēc 2 m, katram kanālam. Katrs aplis tiek nests pēdējos dažus metrus ar ātrumu, kādu tam bija, tāpēc tā delta līnijā ir tā laika starpība.

### 2. Līkumi un katra līkuma daļa no apļa {#corners-and-each-corners-share-of-the-lap}

Kā tiek atrasti līkumi, segmenti un kompleksi: [Līkumu pa līkumam analīze](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Laika uzskaite līkumā {#the-time-account-of-a-corner}

Neto, sadalījums, izejas ātrums un automašīnu vilkme: [Līkumu pa līkumam analīze](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Spriedums un cēlonis {#the-verdict-and-the-cause}

Spriedumu raksti un cēloņi ieejā un izejā: [Līkumu pa līkumam analīze](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Automašīna pret vadītāju {#the-car-against-the-driver}

Kad apļi ir dažādās automašīnās, zaudējums, ko izskaidro automašīna, tiek atņemts pa daļām:

- **vilkme**: automašīnas no viena un tā paša ātruma pa taisni, kā augstāk;
- **saķere**: no zemākā minimālā ātruma, ko nepaskaidro stingrāks rādiuss, daļa `½ ln(saķere_otra / saķere_mana) / ln(ātrums_otra / ātrums_mans)`, kad aplis bija pie sava auto robežas (90% no tā, ko tas parādījis šajā ātrumā);
- **bremzes**: no `u` līdz `v` pie palēnināšanās `a1` pret `a2`, beidzoties tajā pašā punktā, izmaksā `(1/a1 - 1/a2)(u - v)² / 2u` — tikai tad, kad aplis bremzēja gandrīz tikpat stipri, cik automašīna var zonā vidēji, nevis tikai ar virsotni.

Ko automašīna var, nāk no katra ielādētā tās apļa: sānu saķere, bremzēšana un pilnās gāzes paātrinājums katrā 5 m/s ātruma joslā (95., 95. un 90. procentile). Saķere ir tas, ko automašīna **noturēja pusi sekundes** — sānu paātrinājums, vidēji 0,5 s, nevis tas, ko pieskārās viens paraugs: bordiūra, slīdes atgriešanās, automašīnas noķeršana to visu uz mirkli uzspiež, un automašīna, kas to dara bieži, izskatās saķeres bagātāka, nekā tā ir. (Pārbaudīts pret ierakstītiem apļiem divās dažādās automašīnās: viena parauga mērs tās novietoja tuvu kopā; pusi sekundes noturēts tās atdala tā, kā to dara to apļu laiki.) Bremzēšanai un vilkmei katrs paraugs tiek ņemts kā sevis un tā kaimiņu mediāna. Gaiss, nosēšanās atgūšanās un katrs trieciens (6. punkts) līdz automašīnas atgūšanai tiek izlaisti.

**Kāda ir katra automašīna** (`profile.ts`): no tiem pašiem apļiem:

- **noturēta saķere**: 95. procentile no šī pusi sekundes sānu paātrinājuma;
- **vilkme** pilnā gāzē līdz 50 km/h, 50-120, 120-200 un virs 200, un lielākā, ko tā parādīja;
- **bremzēšana** no 60 līdz 160 km/h;
- **maksimālais ātrums**: kur tā pārstāja iegūt ātrumu pilnā gāzē vienu sekundi uz taisnes — braukts taisni, nevis gara pagrieziena pilnā gāzē, kur automašīna nomazgā ātrumu jebkurā jaudā. Kur nebija pietiekami garas taisnes, tas, ko tā vēl vilka savā ātrākajā punktā, pasaka, cik tālu tā bija. Nekādu minējumu pāri tam, ko apļi rāda: jaudas pret ātrumu piemērojums pret pretestību piespieda ceļa automašīnu 100 km/h virs tās īstā maksimālā ātruma, jo pārnesumi un ierobežotājs beidz automašīnas vilkmi daudz pirms pretestība to dara;
- **aizmugures zaudēšana**: cik reižu apli tā slīdēja pāri 10° dreifam (20° irdenā segumā) ar stūri pret līkumu — noķerta ar pretējo stūri — un cik no tām sākās ar gāzi, un kāda daļa no tās saķeres tās sākās. Automašīna, ko tīšāk brauc nedaudz sānis, neko nezaudē; tā, kuru jānoķer, zaudē. Skaitīts vienādi katrai automašīnai, tāpēc divas automašīnas var salīdzināt;
- **līdzsvars**, kur apļi nes slīdes leņķus: priekšējais pret aizmuguri robežā.

**Auto salīdzinājums** novieto automašīnas blakus — tabulu, teikumu katrai par to, kas automašīna ir pret otru ("X paātrinās labāk, bet nevar tā pagriezties, vajag ilgāku bremzēšanas ceļu un vieglāk zaudē aizmuguri"), katru skaidru atšķirību (4% saķeres, 5% vilkmes vai bremzēšanas, 4 km/h maksimālā ātruma, aizmugure, kas noķerta vismaz vienu reizi vairāk un pusotru reizi biežāk nekā apli), un to, kā katru vadīt. Ar vienu automašīnu tas saka, kāda šī automašīna ir.

**Katrā līkumā**, kad apļi ir dažādās automašīnās, atradums saka, kuru daļu no tā nosaka automašīnas, un kā no šīs automašīnas izspiest maksimumu:

- **caur vidu**: otras automašīnas līnijā šīs automašīnas saķere atļauj `v_other · √(grip_mine / grip_other)`. Ja aplis to nesa, starpība ir automašīna, un neviens bremzēšanas punkts to nemaina — tas tiek pateikts, un līkums tiek novelts automašīnai, nevis vadītājam; ja aplis nesa mazāk, atlikums ir pieejams, un tiek pateikts, cik daudz. Tad kur laiku var iegūt: uz taisnes vai automašīnā, kas vilcas stiprāk, pēc apeksa — bremzēt taisni, ieiet vēlāk, pagriezt agrāk pret izeju; citādi — platākais rādiuss, ko ceļš atļauj, jo lielāks rādiuss ir vienīgais veids, kā iegūt vairāk ātruma bez vairāk saķeres;
- **aizmugure, kas atlaida**: šajā vietā, automašīnā, kas to zaudē vairāk nekā otra: ko darīt šajā automašīnā — gāzi ievadīt, kad stūre atsiet, vai bremzi atlaist maigi bez atlaišanas vidū, atkarībā no tā, kā tās slīdes sākas;
- **taisne pēc tam**: ko otras automašīnas stiprākā vilkme no tā paša ātruma paņēma, un kur šī automašīna uz tās beidza vilkmi;
- **agrāks bremzēšanas punkts** automašīnā, kas apstājas mazāk stipri.

Aplis, kas slīdēja caur līkuma vidu (pāri 10° dreifam uz asfalta), bija pāri savai saķerei, nevis tai pietrūka; tam nekad netiek teikts, ka tam tur bija saķere atlikumā. Un kur šī lapas aizmugure atlaida šajā apli no mazāka sānu paātrinājuma nekā līkums prasīja, "saķere rezervē" saka atrast to mazos soļos.

### 6. Automašīnas vadība: bloķējumi, riteņu slīdumi, slīdes un grūdieni, sadursmes un avārijas {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Katrs aplis tiek lasīts arī pēc tā, kā automašīna tika vadīta — kur ritenis bloķējās, kur piedziņas riteņi griezās, kur aizmugure atlaidās, kur priekšējais aizslīdēja platu — jo šīs kļūdas laiks viens pats nenosauc. Trīs lietas padara to noturīgu pret spēlēm un virsmām.

**Kur saķere beidzas, to mēra no automašīnas paša braukšanas.** Inženieri katrai automašīnai uzstāda bloķēšanās slieksni pie slīdes, kas deva lielāko palēnināšanos (OptimumG bremžu sērijas MoTeC kanāli izmanto -0,07 vienai automašīnai), nevis pie grāmatas vērtības, un grāmatas vērtības tik un tā nesaskan: spēks sasniedz maksimumu pie 5-20% slīdes uz asfalta atkarībā no riepas un modeļa, pie 6% vai 20-60% uz sniega atkarībā no avota, un neviens avots nedod vienu vērtību grants ceļam. Spēles mēro slīdi citādi: Forza ir "normalizēta" tā, ka pēc 1 saķere ir zaudēta — tomēr automašīnas bremzes var dot savu labāko zem vai virs 1, un parastas bremzēšanas zonas var pāriet pāri 1. Tātad katrai automašīnai, pāri katram tās ielādētajam aplim, spēks, ko tā radīja, tiek ievietots grozos pret slīdi, ko tā braukusi — palēnināšanos pret riteņu slīdes koeficientu taisnas bremzēšanas laikā, paātrinājumu (kā daļu no tā, ko automašīna rada šajā ātrumā) pret piedziņas riteņu slīdi, saķeri līkumā (kā daļu no automašīnas saķeres šajā ātrumā) pret katras ass slīdes leņķi — un robeža ir slīde aiz labākā punkta, kur spēks ir krities par 8%. Līkne, kas datos nekad nekrītas — Forza Horizon līkumošana un vilkme —, nav robežas, un tur viena slīde nekā neatzīmē. Ar pārāk mazu datu daudzumu robeža ir pusotrs reizes nominālais maksimums.

**Zeme ir zināma katram paraugam**, kur spēle to pasaka: Forza trīc riepas uz grants, dubļiem un zāles (maz paraugu uz asfalta trases, daudz uz dubļiem un apvidus trasēm), Trackmania nosauc materiālu zem katra riteņa, un rallija posma zeme tiek atrasta kā 11. punkts saka. Līknes, dreifa paradumi un sliekšņi tiek turēti atsevišķi asfaltam un irdenam segumam.

**Katrs notikums tiek likts pret otru apli pār tiem pašiem metriem.** Uz grants, uz sniega, aizraujošā dreifu pilnā arkādes spēlē slīdēšana ir veids, kā līkums tiek braukts: optimālās vadības pētījumi atrod "zema dreifa" risinājumus uz asfalta un "agresīvus, augsta dreifa, pat pretstūres" risinājumus bezceļos, rallija dati rāda riepas "labi iekšā nelineārajā zonā", un bloķēt riteni ļoti irdenā segumā var pat apturēt automašīnu ātrāk. Tāpēc notikums, ko arī otrs aplis izdarīja — 80% no tā vai vairāk — ir tas, kā līkums tiek braukts, nevis kļūda, un tāds, ko tas neizdarīja, ir kļūda tikai tad, ja tas izmaksāja laiku: laiku, kas zaudēts no tieši pirms tā līdz 40 m pēc tā. Kļūda, kas izskaidro 40% vai vairāk no līkuma zaudējuma, kļūst par šī līkuma cēloni.

Noteikšanas sliekšņi, otra apļa tests, sadursmes un avārijas, un padomu teksti: [Automašīnas vadības notikumi](race-control-events.md).

### 6b. Daudz apļu: trases statistika {#b-many-laps-the-courses-statistics}

Klašu salīdzinājums, kas skaitās par kļūdu, statistika un kļūdu karte: [Trases statistika](race-course-statistics.md).

### 7. Braukta līnija {#the-driven-line}

Katram aplim un līkumam, no pozīcijām vien: kur tas sāka pagriezties (piektā daļa no tā stingrākā izliekuma), tā stingrākais rādiuss (pāri ±8 m), vidējais rādiuss pirmajā un otrajā pusē no tā virziena maiņas, un tā tālāk

- **forma**: stingrākais pret vidējo rādiusu zem 0,55 ir V, virs 0,75 — U;
- **apekss**: izejas rādiuss pret ieejas rādiusu virs 1,25 ir vēls, zem 0,8 — agrs;
- **ātruma apekss**: tā lēnākais punkts vairāk nekā 15 m pirms tā pagrieziena vidus ir lēns ieejā, ātrs izejā; vairāk nekā 15 m pēc — joprojām palēninās pāri vidum.

Salīdzinot ar otru apli: cik tālu iekšā vai ārā tas brauca pagrieziena sākumā, caur visstingrāko daļu un kur abi bija pilnā gāzē, un kur katrs ieiet līkumā. Katrs atradums beidzas ar līniju, kas der šā apļa automašīnai šajā līkumā — pēc tā, uz ko līkums ved, un automašīnas izmērītās jaudas un saķeres attiecības, nolaišanās spēka un piedziņas — un to, vai aplis to braucis. Tabula "Līkums pa līkumam" uzskaita ātrāko apli katrā līkumā ar tā līnijas formu, un labākie līkumi salikti kopā.

### 8. Divas kartes {#two-maps}

- **Kur**: trase, krāsota ar `dΔt/ds` pret atsauci, sarkana tur, kur laiks tiek zaudēts, zaļa, kur tas tiek iegūts.
- **Kāpēc**: katrs zaudējums zīmēts tur, kur ir tā cēlonis, krāsots pēc cēloņa grupas — bremzēšana, ieeja, izeja, taisne, automašīna — un platāks dārgākam.

### 9. Atkārtojums {#replay}

Viens pulkstenis, trīs veidi, kā to pārvērst katra apļa pašu laikā: no starta, vienā līnijā (katrs aplis sasniedz vienu trases punktu tajā pašā brīdī, tad palaists) un blakus (katrs aplis turēts atsauces attālumā).

### 10. Kurā virzienā ir pasaule {#which-way-round-the-world-is}

Skatītāja pasaule ir labās rokas ar Y uz augšu. Spēle ar kreisās rokas pasauli (starp tām Forza) tajā nāk spoguļota: katrs labās puses līkums zīmēts kā kreisās puses līkums, gan trase, gan apļi. Apļi to paši saka — pozitīvā stūre ir pa labi katrā adapterī, un līkuma ārējā balstiekārta saspiežas — tāpēc sacīkšu cilne piedāvā to salabot, un **Kamera un skats → Apgriezt pasaules asi** to dara: X, Y vai Z zīmēta apgriezti. Mainās tikai zīmējums — atspulgs, kas iesaistīts skata matricā; kamera lido pa zīmēto pasauli, un dati, analīze un katra koordināte, ko rāda rīki, paliek spēles pašas. Analīze nosauc līkumus pa kreisi vai pa labi ar to pašu mērījumu.

### 11. Rallijs: slīde, kreisā kāja, gaiss {#rally-the-slide-the-left-foot-the-air}

Rallija posms nav trase, kas braukta ar sliktāku saķeri. Uz grants un sniega slīde ir veids, kā līkums tiek ņemts: automašīnu ieiešanā pagriež, pārvietojot tās svaru — "bremzes pārvieto automašīnas svaru uz priekšu ... priekšējām riepām pieaug saķere, aizmugurējām zūd, un automašīna rotē slīdot līkumā", pēc tam atpakaļ pie gāzes, kad tā ir "izlīdzināta virzienā, kurā gribat braukt" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Kreisā kāja veic bremzēšanu, lai gāzi un bremzi varētu spēlēt viena pret otru; rokas bremze pagriež automašīnu šaurās līkumos ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)); un automašīna pamet zemi. 6. punkts jau lasa slīdes pret otru apli; šie noteikumi nes pārējo.

- **Zeme.** Ko saka apļa dati (`meta.surface`, ierakstītāju `--surface`), citādi pasākuma nosaukums — asfalta rallijus (Spānija, Horvātija, Centrālā Eiropa, Vācija, Japāna, Korsika, Ipra), ziemas (sniegs), Monte asfalts ar sniegu un ledu virsū (jaukts) — citādi tas, kā automašīna tika braukta. Rallija Rally2 automašīnas sānu robeža ir 0,7-0,9 g uz grants un 1,3-1,4 g uz asfalta ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)), un uz grants tā dreifo daudz vairāk (6. punkts). Tātad posms, kurā automašīna nāca ar 10 m/s² vai vairāk (95. procentile, ātrumā, uz zemes) ar mediānu dreifu zem 6 grādiem, kur tā līkumoja ar 70% no tā vai vairāk, bija asfalts; viss cits vai pārāk maz, lai spriestu, ir irdens segums.
- **Ko automašīna var, uz zemes, kur to darīja.** Saķere, bremzēšana un vilkme (5. punkts) tiek mērītas atsevišķi uz asfalta un irdena seguma, ja apļi tajās braukuši piektdaļu vai vairāk no saviem paraugiem katrā, un katrs līkums tiek vērtēts ar zemi zem automašīnas tās lēnākajā punktā. Paraugi gaisā un 0,3 s pēc nosēšanās tiek izlaisti no visa, kas mēra automašīnu — aploksnēm, riepu līknēm, bloķējumiem un riteņu slīdumiem: nosēšanās sakrata automašīnu vairāk nekā jebkas, ko riepas spēj, un riteņi, kas griezušies gaisā, nav riteņu slīdums. Nolaišanās spēks netiek vērtēts irdenā segumā, kur posma ātrās un lēnās daļas ir atšķirīgi ceļi.
- **Kreisās kājas pieskāriens nav bremzēšana.** Viegls bremzes pieskāriens ar gāzi vēl pusē vai vairāk, pār mazāk nekā 15 m, nosliece automašīnu vai pagriež to; kur apļš sāka bremzēt līkumam, ir pirmā bremze, zem kuras gāze tika novilkta, vai kas ilga ilgāk.
- **Automašīna pagriezta ieejā.** Katram aplim un līkumam — lielākais dreifa leņķis no tā bremzēšanas līdz 5 m pēc tā lēnākā punkta. Irdenā segumā aplis, kas automašīnu pagriezis par 8 grādiem vai vairāk mazāk nekā otrs (kurš pagrieza 12 vai vairāk), un kurš uz jaudas vai pilnā gāzē bija vēlāk, **pagrieza automašīnu mazāk**: padoms ir atlaist vai pieskarties kreisās kājas bremzei, kad tā ieiet līkumā, lai aizmugure apgrieztos — ar otra apļa rokas bremzes punktu, ja tas to izmantoja, vai rokas bremzi līkumā, kas lēnāks par 54 km/h — un tai jābūt vērstai uz izeju pirms apeksa. Tas, kurš pagrieza 12 grādus vai vairāk pāri otram un joprojām bija uz jaudas vēlāk, **pagrieza par daudz**: tā bija jāiztaisno, pirms jauda varēja nākt. Abi ir līkuma cēlonis izejā pēc automašīnas vadības kļūdas. Irdenā segumā līniju padoms saka to pašu katram līkumam.
- **Gaiss.** Lidojums, kas ir 0,2 s vai garāks nekā otra apļa, un kas izmaksāja laiku no 10 m pirms pacelšanās līdz 40 m pēc nosēšanās (vai līkuma beigām), ir cēlonis, kad tas izskaidro 40% vai vairāk no līkuma zaudējuma, un nākamais līkums, sasniegts lēnāk, to saka. Gaisā automašīna nevar pagriezties, bremzēt vai braukt. Padoms saglabā gāzi pacelšanās brīdī — "nelaid gāzi pacelšanās laikā", kas nolaiž degunu — un ņem kalnu nedaudz lēnāk vai ar bremzes pieskārienu, lai automašīna paliktu zemu ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksi līdz trim līkumiem.** Vijīgs posms, ko nekad neizbrauc pilnā gāzē, nav viens garš komplekss: pēc trim līkumiem sākas jauns.

`src/race/rally.test.ts` tur analīzi pie visa tā uz posmiem, ko vada vienkāršs modelis: automašīna, kas pagriezta mazāk un vēlu uz jaudas, garāks lidojums, kreisās kājas pieskārieni, vijīgs posms, asfalts pret grantu.

## Dati un ko katrs avots ļauj {#data-and-what-each-source-allows}

| Avots | Biežums | Kanāli | Ļauj |
|---|---|---|---|
| FH Companion apļu faili | ~5 m | pozīcija, ātrums, gāze, bremze, stūre, garenvirziena/sānu paātrinājums, pārnesums | viss, izņemot automašīnas vadību, kam vajadzīga blakus telemetrija |
| FH Companion `.tele.gz`, blakus katram apļa failam | spēles 64 Hz (ierakstītājs, kas glabā katru paketi, raksta ~110 sekundē; atkārtojumi tiek izmesti) | visa Forza Data Out: katram riteni slīdes koeficients, slīdes leņķis, kombinētā slīde, rotācija, piekare, ceļa trīce; automašīnas rāmja ātrums; yaw rate | viss, ieskaitot automašīnas vadību |
| Forza Data Out, ierakstīts ar `heat3d_capture telemetry` | 60 Hz | viss iepriekš minētais, plus katram riteni: riepas temperatūra, slīdes koeficients, slīdes leņķis, kombinētā slīde, piekares nobīde, riteņa ātrums, trīces josla; RPM, jauda, griezes moments, yaw rate | viss |
| Assetto Corsa, ACC, AC EVO, AC Rally (koplietotā atmiņa, `heat3d_capture telemetry --game ...`) | 60-333 Hz | superkopa: riepas kodols un iekšējā/vidējā/ārējā temperatūra, spiedieni, bremžu temperatūras, riteņu slodzes, kambers, slīdes koeficients un leņķis; automašīnas rāmja ātrums; ABS un TC darbībā (ACC, EVO, AC Rally) | viss |
| iRacing `.ibt`, nolasīts tieši | 60 Hz | pozīcija no GPS, pedāļi, stūre, g, yaw, katram riteni karkasa temperatūra, amortizatora nobīde, spiediens, nodilums | viss; automašīnas vadība no dreifa leņķa (tā yaw pret braukšanas virzienu) un stūres, bez slīdes (nav ierakstīta) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | pēc kadra; 100 Hz | pozīcija, pasaules ātrums un automašīnas asis, katram riteni kontaktlaukuma ātrums un piekare, pedāļi, stūre, posma pulkstenis un garums | viss; slīde un dreifa leņķis izvesti |
| Richard Burns Rally (NGP UDP) | pēc fizikas soļa | pozīcija, automašīnas pašas ātrumi, katram riteni atsperes nobīde un spēks, pedāļi | viss, izņemot riteņu slīdi |
| BeamNG.drive (`heat3d` protokola mods) | līdz 100 Hz | pozīcija, pasaules ātrums un asis, katram riteni virsmas ātrums, rotācija, slodze un zemes kontakts | viss; slīde un dreifa leņķis izvesti |
| Trackmania (Openplanet spraudnis) | pēc kadra | pozīcija, priekšējais un sānu ātrums, pedāļi (bremze ieslēgta/izslēgta), stūre, katram riteni slīdes koeficients un irdena zeme, gaisā | viss; dreifa leņķis no sānu ātruma |

Katrs avots tiek pārvērsts vienā apļa formātā, `heat3d-lap`, kura kanāliem ir kanoniski nosaukumi (`speed`, `throttle`, `tireTemp[FL]` ...). Automašīnas glifs un diagrammas zīmē visus kanālus, kādi aplim ir.

## Avoti {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
