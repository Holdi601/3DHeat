---
title: "Līkumu pa līkumam analīze"
parent: "Sacīkšu analīze"
nav_order: 55
lang: "lv"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analīze līkums pa līkumam

Divi viena un tā paša trases apļi tiek salīdzināti līkums pēc līkuma. Katram līkumam skatītājs parāda, kurš bija ātrāks, cik daudz laika tas bija vērts un kāpēc — bremzēja par agru, tika pie jaudas par vēlu, izvēlējās platāku līniju —, lai jūs zinātu, ko vispirms trenēt.

![Atradums, kas atvērts sadaļā Kur uzlabot, blakus tabulai Līkums pa līkumam](../assets/img/en/race-corner-finding.webp)

Darba piemērs: līkumā 3 Auto A bremzē par 20 m agrāk nekā Auto B un tur zaudē 0,15 s, bet ir uz gāzes agrāk un atgūst 0,15 s ceļā ārā. Neto 0,00 s: līkums ir vienāds, un nevienam neliek bremzēt vēlāk.

## Ko jūs redzat {#what-you-see}

### Kur uzlabot {#where-to-improve}

Sānjoslas sadaļa fokusētajam aplim ("Ielādējiet vismaz divus apļus vienā trasē." līdz tam).

**Galvene:** "<aplis> <laiks> pret <atsauce> <laiks>" un apļa laika starpība — vai, atsaucei, "pret ātrāko citu apli katrā līkumā (…)" un kopējais zaudējums. Blakus ir zaudējums sadalīts starp *braukšanu* un *auto / apstākļiem*.

**Bremzēšanas josla:** laiks, kas zaudēts pēc cēloņa grupas (bremzēšana, ieiešana, izeja, taisne, auto, apstākļi), krāsās pēc cēloņa, ar leģendu.

**Atradumi**, trīs saraksti:

1. Braukšanas zaudējumi, dārgākie pirmie, ne vairāk kā **12** — vai "Nekur, kur citādi braukšana laiku varētu uzvarēt, nekas neizceļas."
2. **Parādīt, ko maksāja auto vai situācija (X s)** — auto un apstākļu zaudējumi, ne vairāk kā 8 (pēc noklusējuma ieslēgts).
3. **Kur <aplis> ir ātrāks vai vienāds citādi (N)** — ieguvumi un vienādi līkumi, ne vairāk kā 10 (pēc noklusējuma ieslēgts).

Katrs atradums rāda savu rangu, nosaukumu (līkums un tas, kas notika, ar zaudējumu, ja tas ir zaudējums), vērtējuma rindu, izmaksas (ieguvumi ar mīnusu) ar joslu un mikroshēmu: *bremzēšana*, *ieiešana*, *izeja*, *taisne* (braukšanas zaudējumi, ar "· auto X", kad auto izskaidro 0,02 s vai vairāk), *auto*, *apstākļi*, *ātrāks*, *vienāds*. **Noklikšķiniet uz viena**, lai izlīdzinātu automašīnas 40 m pirms tā, ieskatītu to un atkārtotu, un atvērtu tā mērījumus:

- **Bremzēšana:** kur katrs bremzēja (vai atlaida gāzi) un no kāda ātruma, un cik metru agrāk vai vēlāk (no 5 m);
- **Lēnākais:** katra apļa minimālais ātrums un kur;
- **Pilna gāze:** kur katrs bija līdz galam, un cik agrāk vai vēlāk;
- **Līnija:** pagrieziena sākuma atšķirība, visasākie rādiusi, cik tālu iekšā vai ārā, un katra apļa līnijas forma un apeks;
- **Taisne līdz nākamajam līkumam:** tās garums, abi ātrumi, kur abi bija līdz galam, ko tā zaudēja vai ieguva un no kā — sākuma ātrums, otra stiprākā vilkme, atlaišana, nomazgātais ātrums, kā tā tika braukta (daļas no 0,02 s);
- **Auto:** cik daudz no zaudējuma ir auto, un no kā (vilkme, saķere, bremzes; kad 0,02 s vai vairāk);

tad padoms, **Auto:** (atšķirīgās automašīnās, skatiet [Automašīnu profili](race-car-profiles.md#what-the-cars-decide-in-a-corner)), un līnijas padoms.

### Līkums pa līkumam {#corner-by-corner}

Tabula (ar diviem vai vairāk apļiem), viena rinda katram segmentam, fokusētā apļa klasei, ja ir vairākas klases:

| Kolonna | Rāda |
|---|---|
| Līkums | `T3`, `T11-T12` |
| Ātrākais | aplis, kas bija ātrākais tajā (tā paša laiks no segmenta sākuma līdz beigām) |
| par | tā pārsvars pār otro ātrāko, s |
| līnija | ātrākā apļa forma un apeks ("V · late", "U/V · middle"); uzvelciet kursoru, lai redzētu tā visasākos, ieejas un izejas rādiusus; "both ways" sarežģītam kompleksam, kas griežas abos virzienos |
| (fokusētais aplis) | cik tālu tas bija aiz ātrākā, vai ✓, ja tas bija ātrākais |

Noklikšķinot uz rindas, atveras fokusētā apļa atradums tur (vai izlīdzina automašīnas 40 m pirms segmenta). Zem tabulas, kad katram līkumam ir laiks: "Ātrākie katrā līkumā, salikti kopā: <laiks> (± pret atsauci / pret labāko no klases X)" — labākie segmenti plus ātrākā braukšana līdz pirmajam līkumam, ja tas ir tā paša nodalījums.

## Kā tas tiek aprēķināts {#how-it-is-worked-out}

Vadošais noteikums: **līkums tiek vērtēts veselā**, no bremzēšanas zonas tam līdz bremzēšanas zonai nākamajam. Aplis, kas bremzē agrāk, lai automašīnu agrāk pagrieztu un agrāk uzliktu jaudu, tiek ieskaitīts par izeju, ko tas nopirka, nevis tiek likts bremzēt vēlāk.

## Viena distances ass {#one-distance-axis}

Apļi tiek salīdzināti pēc attāluma, nevis laika — sekundi aiz, divi apļi ir dažādos līkumos. Ne arī pēc katra apļa paša odometra (šaurāka līnija nobrauc mazāk metru). **Atsauces** braukto ceļu ass ir:

- Katra cita apļa paraugi tiek **projicēti** uz atsauces ceļa: katrs paraugs saņem `s`, cik tālu pa atsauci tas atrodas, un `d`, cik tālu pa kreisi (pozitīvi) vai pa labi. Meklēšana iet uz priekšu no iepriekšējās sakritības (8 ceļa segmenti atpakaļ līdz 40 uz priekšu), tāpēc aplis, kas šķērso vai zem sevis vai virs sevis, nekad nepieķeras otrai krustojumam. Pirmais paraugs tiek meklēts pirmajā ceturtdaļā no ceļa (trasē starts un finišs sakrīt); kad nekas nav 30 m robežās, tiek ņemts tuvākais punkts jebkur, kas nav aiz pēdējās sakrītības (pēc griešanās vai izbraukšanas). `s` nekad nesamazinās: paraugs, kas projicējas aiz iepriekšējā, tiek turēts.
- Katrs kanāls tiek **pārparaugots** uz viena režģa, **ik pēc 2 m**, lineāri; pakāpeniski mainīgie kanāli (pārnesums, karogi) pēc tuvākā paraugs. Ārpus paša apļa diapazona vērtības ir tukšas.
- Apļa pirmais un pēdējais paraugs projicējas nedaudz iekšpus atsauces galiem, tāpēc katrs aplis tiek **nests līdz 15 m** aiz saviem galiem ar ātrumu, kādu tam bija (laiks aug ar attālumu dalītu ar ātrumu, pārējais paliek) — tā tā starpība līnijā ir tā laika starpība.
- `delta` = apļa laiks katrā režģa punktā mīnus atsauces: starpība. `lateral` = `d` uz režģa.

Laiks, cik viens aplis vairāk nekā cits pavadīja starp diviem režģa punktiem, ir to delta starpība: `rel(s)`. Viss zemāk ir balstīts uz to.

## Līkumi {#corners}

Atrasti **atsaucē** (`findCorners`), tās ātrums izlīdzināts ±6 m un tās izliekums (virziena maiņa pār ±5 paraugiem, izlīdzināta ±10 m):

1. **Ātruma minimumi ar izcilību.** Punkts, kas ir zemākais ±40 m robežās un kura kritums no augstākā ātruma katrā pusē (pirms zemāka minimuma) ir vismaz `max(2,5 m/s, 6% no ātruma)`.
2. **Izliekumi.** Lokāla izliekuma virsotne, kas ir stingrāka par **300 m** rādiusu, bez ātruma minimuma 80 m robežās: pilnā gāzē braukts izliekums joprojām ir līkums, ko vadīt.
3. **Fāzes.** No katra apeksa atpakaļ, kamēr atsauce bremzē (> 0,1) vai nav pilnā gāzē (< 0,95): ieeja; uz priekšu, kamēr nav pilnā gāzē: izeja. Izliekums, ko brauc bez gāzes pārtraukšanas, saņem ±30 m. Pārklājošies līkumi tiek turēti atsevišķi, bet izvietoti, lai nosegtu apli.
4. Numurēti T1, T2 … apļa secībā; **pa kreisi vai pa labi** pēc izliekuma zīmes un tā, vai pasaule ir spoguļota (nezināms tiek uzskatīts par spoguļotu).

**Līkuma logs** (kur atsauce pagriežas): ārā no visstingrākā punkta ±40 m robežās ap apeksu, kamēr izliekums paliek virs sestās daļas no tā maksimuma, plus 10 m katrā pusē. Tā puse dod "iekšpuses" zīmi.

## Segmenti: no bremzēšanas zonas līdz bremzēšanas zonai {#segments-braking-zone-to-braking-zone}

Katrs līkums pieder ceļam līdz pusei ceļa līdz apeksiem abās pusēs. Tajā:

- **Katra apļa lēnākais punkts** ir īsts ātruma ieplakums — neviens nav lēnāks 6 m (3 režģa punkti) abās pusēs, skatoties aiz segmenta galiem, tā ka iepriekšējā līkuma izejas paātrinājums, kas vēl iet iekšā, nekad netiek sajaukts ar to — meklēts no 15 m pirms līkuma loga līdz 10 m pēc tā. Aplis, kas tur nekad nepalēninājās, tiek novietots apeksā.
- **Kur aplis sāka palēnināties** (`entryOf`): atpakaļ no tā lēnākā punkta caur bremzēšanu vai atlaišanu, pār pilnās gāzes īsiem pārtraukumiem, līdz tam bija kāja uz grīdas (gāze ≥ 0,95, bremze ≤ 0,1) **10 m**; gāzes atkal pieskaršana pēdējos **30 m** pirms lēnākā punkta joprojām pieder līkumam; pilnā gāzē visu ceļu — pats lēnākais punkts. Aplim bez gāzes kanāla vai tam, kam kāja nekad nebija uz grīdas kopš iepriekšējā līkuma, sākums ir tā ātrākajā punktā starp.
- **Segments sākas** pie pirmā no visiem apļiem, kas sāk palēnināties tam (4 m agrāk), un ir līdz nākamā sākumam, tā ka katra apļa bremzēšana ir segmentā un segmenti veido visu apli.

**Kompleksi.** Secīgi līkumi, starp kuriem sacensību aplis nekad nebrauc pilnā gāzē — mazāk par **40 m** pilnas gāzes — ir viens segments, "T11-T12", braukts kā viens; komplekss satur ne vairāk kā **trīs** līkumus (vijīgs posms, kas nekad netiek braukts pilnā gāzē, sāk jaunu). Komplekss, kas griežas abos virzienos, ir *jaukts*: tam nemēra nevienu vienotu līnijas formu.

**Trasē** (atsauces gals ir 50 m robežās no sākuma vietas) pēdējā segmenta taisne turpinās pāri finiša līnijai līdz pirmajam bremzēšanas punktam: lidojošā apļa braucieni no līnijas tiek skaitīti ar pēdējo līkumu. Aplis, kas sākās stāvot vai sākuma startā (skatiet [Starts](#the-start)), tur šo braucienu nodala.

### Kur līkums ved {#what-a-corner-leads-onto}

Mērīts atsaucē: metri pilnā gāzē pēc līkuma (no tā pilnās gāzes līdz segmenta beigām, plus braucieni pāri līnijai) un pirms tā (iepriekšējā segmenta "pēc", vai no starta).

| Tips | Noteikums |
|---|---|
| **starp divām taisnēm** (`both`) | 200 m vai vairāk pirms **un** 120 m vai vairāk pēc |
| **uz taisnes** | 200 m vai vairāk pēc, vai 120 m vai vairāk pēc un vismaz tikpat, cik pirms |
| **pēc taisnes** | 200 m vai vairāk pirms |
| **savienojums** | viss pārējais |

## Ko katrs aplis darīja līkumā {#what-each-lap-did-in-a-corner}

`cornerMetrics`, katram aplim un segmentam, uz režģa (solis 2 m). Pedāļi: bremze skaitās virs 0,1, pilna gāze ir 0,95 un vairāk.

| Mērs | Noteikums |
|---|---|
| **bremzēšanas punkts** | pirmā bremze, zem kuras gāze tika novilkta (zem 0,5) vai kura ilga **15 m** — kāju pieskāriens ar ieslēgtu jaudu nav tur, kur sākās bremzēšana; ja ir tikai pieskārieni, pirmais pieskāriens |
| **atlaists** | bez bremzēšanas — pirmais punkts, kur gāze nokrita zem 0,8 |
| (nav pedāļu) | punkts, kur aplis sāka palēnināties (augstāk) |
| **bremzes atlaišana** | pēdējā bremze līdz 30 m pēc lēnākā punkta |
| **ātrums bremzēšanas punktā**, **bremzēšanas metri** | līdz lēnākajam punktam |
| **maksimālā bremze**, **maksimālā palēnināšanās** | pāri bremzēšanas zonai (paātrinājumi virs 45 m/s² tiek ignorēti) |
| **bremzēšana ar iekšā turētu bremzi** | metri ar bremzi > 0,05 un |stūre| > 0,1 |
| **riteņu slīdējums** | visnegatīvākais riteņa slīdes koeficients zonā (kad aplim ir slīdējuma dati) |
| **lēnākais punkts**, **minimālais ātrums** | kā augstāk |
| **gāze ieslēgta** | pēc atlaišanas (vai lēnākā punkta) — pirmā gāze > 0,15 bez bremzes |
| **pilna gāze** | pirmais punkts pēc tam, kad tā noturējās ≥ 0,95 10 m |
| **ripošana** | metri no atlaišanas līdz gāzei ieslēgtai, ar bremzi un gāzi abi zem 0,05 |
| **gāzes kritumi** | reizes, kad gāze nokrita vairāk nekā 0,25 zem sava darbības augstā punkta starp gāzi ieslēgtu un pilnu gāzi |
| **sānu paātrinājums** | lielākais sānu paātrinājums no 20 m pirms atlaišanas līdz vēlākajam no pilnās gāzes un 20 m pēc lēnākā punkta |
| **pārnesums apeksā** | lēnākajā punktā |
| **slīdējums pa virsmu** | lielākais piedziņas riteņa slīdes koeficients starp gāzi ieslēgtu un pilnu gāzi |
| **līdzsvars** | priekšējais mīnus aizmugures slīdes leņķis caur vidu (+ nepietiekama stūrēšana) |
| **taisne pilnā gāzē** | daļa segmenta pēc pilnās gāzes (un braucieni pāri līnijai) ar ≥ 0,95; garākais atlaidums uz tās |
| **nomazgātais ātrums** | lielākais ātruma zudums no augsta punkta ar gāzi ≥ 0,9, bez bremzes, uz zemes |
| **ieejas noslīdējums** | lielākais dreifa leņķis no bremzēšanas punkta līdz 5 m pēc lēnākā punkta, uz zemes |
| **rokas bremze** | kur tā ieslēdzās (> 0,2), līdz 10 m pēc lēnākā punkta |
| **gaiss** | sekundes gaisā pāri segmentam un tā garākais lidojums |

## Ar ko katrs aplis tiek salīdzināts {#who-each-lap-is-compared-with}

- Aplis tiek salīdzināts ar **ātrāko pilnu apli savā veiktspējas klasē** (atsauce, atsauces klasē).
- Šis klases labākais aplis pats (un atsauce) tiek salīdzināts segmentu pa segmentam ar **to citu klases apli, kas bija ātrākais tajā** — vai ar katru apli, ja tas ir vienīgais savā klasē.

Laika karte, atstarpes apļu sarakstā, automašīnas vadības notikumi un līkumu tabula seko tam pašam salīdzinājumam.

## Līkuma laika uzskaite {#the-time-account-of-a-corner}

`compareCorner`, vienam aplim pret otru pāri segmentam:

- **neto** = `rel(end) - rel(start)` (plus braucieni pāri līnijai lidojošam aplim): spriedums. Tuvāk par **0,03 s** ir **vienāds**.
- **Sadalījums** — kur līkuma iekšienē vadošais aplis pagriezās: intervālā no pirmā bremzēšanas punkta vai lēnākā punkta jebkura no apļiem līdz vēlākajam no to pilnās gāzes un lēnākā punkta, lielākā svārstība, ko aplis tad atdeva vai atguva, kad šī svārstība ir virs **0,04 s**; citādi vēlākais no abiem lēnākajiem punktiem.
- **Līdz apeksam** = `rel(split) - rel(start)`; **pēc tā** = neto mīnus tas. Kad abi ir vismaz 0,04 s un ar pretējām zīmēm, aplis **atriebts** — viens tika apmainīts pret otru.
- **Pēc tā** sadalās vēlreiz tur, kur abi aplis ir pilnā gāzē: **izeja** (sadalījums līdz vēlākajai pilnajai gāzei) un **taisne** (no turienes līdz beigām).
- **Taisne** sadalās trīs veidos:
  - *izejas ātrums* (`byExit`) — izmērīts, nevis modelēts: lēnākais auto pāriet caur ātrākā auto sākuma ātrumu nedaudz pa taisni, un no turienes tā paša trase ir tas, ko tas darītu no šī ātruma, ar savu pārnesumu, pretestību un slīpumu iekšā. Pārvietots atpakaļ uz šo punktu (un uzlikts tā beigu ātrumā par metriem, ko tas iegūst) tas ir tā laiks no ātrākā starta; starpība ir izejas ātruma cena. Kad lēnākais auto nekad nesasniedz šo ātrumu (vai tikai pēdējos 2 paraugos), tā paša paātrinājums pa posmu tiek atpakaļ ieskaitīts kā jauda (`a·v` turēts), nekad stiprāk, nekā tā aploksne rāda šajā ātrumā (divreiz izmērītais paātrinājums bez aploksnes).
  - *automašīnu vilkme* (`byPower`) — tikai dažādās automašīnās: abas automašīnas no viena ātruma tās pašas metros, pilnā gāzē, integrējot pilnās gāzes paātrinājumu, ko katra ir parādījusi katrā ātrumā.
  - *kā tā tika braukta* (`driven`) — pārējais: atlaidums, nomazgāts ātrums pilnā gāzē.

  Izejas ātrums nekad neizskaidro vairāk nekā taisnes cenu (un nekad ar pretēju zīmi), izņemot, ja atlaidums vai nomazgātais ātrums kaut ko no tā atņēma atpakaļ. Aplis **atlaists** taisnē, kad tā daļa pilnā gāzē ir zem gan 0,9, gan otra daļas mīnus 0,05. Nomazgātais ātrums skaitās, kad abi atšķiras vairāk nekā par 1 m/s. Nesaskaņa zem 0,02 s zīmē tiek iestatīta uz 0.

Katra segmenta neto saskaitās līdz laika starpībai, un katra līkuma līdz apeksam un pēc tā saskaitās līdz tā neto (testi pārbauda abus).

### Auto daļa {#the-cars-share}

Tikai tad, kad apļi ir **dažādās automašīnās** un aplis zaudēja laiku (`carShare`):

- **vilkme**: automašīnu vilkme pa taisni (augstāk), līdz zaudējumam;
- **saķere**: kad aplis bija pie sava auto robežas (sānu paātrinājums vidū vismaz **90%** no tā, ko auto notur šajā ātrumā) un otra automašīna notur vairāk nekā **5%** vairāk: no zemākā minimālā ātruma, ko nepaskaidro stingrāks rādiuss, daļa `½ ln(saķere_otra / saķere_mana) / ln(ātrums_otra / ātrums_mans)` no atlikušā zaudējuma;
- **bremzes**: kad aplis bremzēja (nevis atlaida), otra automašīna bremzē vairāk nekā **5%** stiprāk, un apļa *vidējā* palēnināšanās zonā bija vismaz **80%** no tā, ko tā auto var: no `u` līdz `v` pie `a1` pret `a2`, beidzoties tajā pašā punktā, `(1/a1 - 1/a2)(u - v)² / 2u`, līdz tam, kas atlicis.

Auto izmaksa ir summa, ne vairāk kā zaudējums.

## Spriedums un atradums {#the-verdict-and-the-finding}

`cornerFinding` raksta ne vairāk kā vienu atradumu katram aplim un līkumam, izmēģinot šādā secībā:

| Gadījums | Atradums | Iznākums |
|---|---|---|
| neto ±0,03 s robežās, atriebts, mazākā puse ≥ **0,1 s** | **vienāds, divos veidos cauri** — kurš bija lēns ieejā un ātrs izejā, kurš otrādi; ar taisni pēc (uz taisnes vai starp divām), veids "lēns ieejā, ātrs izejā" ir tas, uz ko balstīties: saglabāt tā agro gāzi, atgūt ieeju, bremzējot stiprāk, nevis vēlāk | vienāds |
| neto ±0,03 s robežās citādi | nekas nav teikts | - |
| ieguvis, atriebts, zaudēts līdz apeksam | **lēns ieejā, ātrs izejā atmaksājās**: saglabāt, šeit izeja ir vairāk vērta | ieguvums |
| ieguvis, atriebts, ieguvis līdz apeksam | **ātrāks ieejā**: ieeja ir pareiza, agrāka pilna gāze saglabātu vairāk | ieguvums |
| ieguvis, un otram aplim šeit ir zaudējums | **ātrāks — jo tā otrs darīja**, tā cēlonis un padoms teica "Otram aplim: …" | ieguvums |
| citādi ieguvis | **ātrāks ieejā / izejā**, pēc tā, kura puse ieguva vairāk (bremzējot vēlāk, vairāk ātruma caur vidu; vai ātrāk nolaižoties, stiprāka vilkme) | ieguvums |
| zaudējis, un **avārijas vai sadursmes** izmaksa ir vismaz `max(0,05 s, 40% no zaudējuma)` | trieciens ir līkuma stāsts, pirms automašīnām | zaudējums |
| zaudējis, un **auto daļa** ir 60% vai vairāk | **auto**: tā vilkme pa taisni, tā saķere vidū, vai tās bremzes — lielākā daļa; ar braucēja daļu (≥ 0,03 s) teikts kā "Pārējie X s: …" | zaudējums |
| zaudējis, un viena nekopīga **automašīnas vadības kļūda** izmaksāja vismaz `max(0,05 s, 40%)` | šī kļūda (skatiet zemāk), ar to, kā laiks pārvietojās ap to | zaudējums |
| zaudējis, un **garāks lidojums** izmaksāja vismaz `max(0,05 s, 40%)` | lidojums | zaudējums |
| zaudējis, atriebts, ieguvis līdz apeksam | **pārāk ātrs ieejā, lēns izejā**: izejas cēlonis; atdot daļu no ieejas, lai agrāk pagrieztos un nonāktu pilnā gāzē, ar otra apļa bremzēšanas un pilnās gāzes punktiem. Tā sakne (`cause`, ko skaita [statistika](race-course-statistics.md)): bremzēšana vēlāk, ja tas bremzēja vairāk nekā dažus metrus vēlāk nekā otrs; citādi izejas cēlonis | zaudējums |
| zaudējis, atriebts, zaudējis līdz apeksam | **ieejā atdeva vairāk, nekā izeja atguva**: ieejas cēlonis, kas ir arī tā sakne (`cause`); saglabāt izeju, zaudēt mazāk ieejā | zaudējums |
| zaudējis, atlaists taisnē, un braukts daļa pārsniedz pusi no zaudējuma | **nav pilnā gāzē taisnē**: tās daļa pilnā gāzē pret otra daļu, kur un cik ilgi atlaidums | zaudējums |
| zaudējis, auto vilkme pārsniedz 60% no zaudējuma un taisne — pusi | **auto vilkme pa taisni** (ar abu auto vilkmi 160 km/h) | zaudējums |
| citādi zaudējis | cēlonis tai pusei, kas zaudēja vairāk (līdz apeksam ≥ pēc tā: ieejas; citādi izejas). Lēnāks ārā tikai tāpēc, ka lēnāks caur vidu (vairāk nekā par 1 m/s): tā vietā vidus cēlonis | zaudējums |

Atradumam par zaudējumu var beigties arī ar **Arī:** — nomazgāts ātrums pilnā gāzē vai atlaidums uz taisnes — kad braukta taisnes daļa maksāja vairāk nekā 0,04 s un tas jau nebija cēlonis.

Atradumi ir sakārtoti: zaudējumi pirmie, dārgākie pirmie; tad ieguvumi un vienādi līkumi.

### Cēloņi ieejā {#causes-on-the-way-in}

`entryCause`, pirmais, kas attiecas (ātruma atšķirības ir m/s; "5 m" ir slieksnis, lai agrāks vai vēlāks punkts skaitītos):

| # | Cēlonis (kļūda) | Noteikums |
|---|---|---|
| 1 | sadursme vai avārija ieejā | nekopīgs trieciens, kas sākas līdz 10 m aiz lēnākā punkta |
| 2 | **gandrīz apstājies** (incidents) | lēnākais ātrums zem **60%** no tā, ko šīs automašīnas saķere atļauj tajā vietā, kur otrs izbrauca (`v_other · √(grip_mine / grip_other)`, ja otra automašīna notur vairāk, citādi otra ātrums), otrs aplis virs 8 m/s — vērpšanās, kontakts vai palaists līkums |
| 3 | automašīnas vadības kļūda ieejā | nekopīgs bloķējums, grūdiens, vērpšanās vai slīde, ne gāzē, sākas līdz 10 m aiz lēnākā punkta, izmaksā ≥ 0,02 s |
| 4 | garāks lidojums pirms lēnākā punkta | skatiet [rallijs](#rally-rotation-and-flights) |
| 5 | **atlaists**, kur otrs palika pilnā gāzē vai atlaida 5 m vēlāk vai vēlāk | šis aplis tikai atlaida |
| 6 | **bremzēja, kur otrs tikai atlaida** vai palika pilnā gāzē | un bija vairāk nekā 0,5 m/s lēnāks caur vidu |
| 7 | **bremzēja maigi** | tas bremzēja (nevis atlaida), un tam bija vieta bremzēt stiprāk — ar riepu datiem, tā bloķēšanas slīde zem **60%** no slīdes, kur šī auto bremzes dod labāko; bez tiem maksimālā palēnināšanās zem **85%** no tā, ko tā rāda šajā ātrumā — pedālis zem 0,95, un otra apļa maksimālā palēnināšanās vairāk nekā par **15%** augstāka |
| 8 | **bremzēja par agru** — vai **auto bremzes** | bremzēja vairāk nekā 5 m pirms otra. Citā automašīnā, kuras bremzes ir vairāk nekā par 5% stiprākas, un ar ne vairāk kā 10 m atlikumu pret attālumu, ko šī automašīna vajag savā palēnināšanā: auto bremzes. Citādi bremzēja par agru, ar "Bremzē vēlāk — apmēram N m" (citā automašīnā — metri pāri tam, ko tā vajag) |
| 9 | **ripoja** | vairāk nekā 10 m ar nevienu pedāli, un par 5 m vairāk nekā otrs |
| 10 | **lēnāks caur vidu** | vairāk nekā 0,5 m/s lēnāks lēnākajā punktā; sadalīts ar `v² = a·R` (zemāk) |
| 11 | **ieradās lēnāk** | vairāk nekā 1 m/s lēnāks bremzēšanas punktā, nebremzēja par agru: izlemts jau iepriekš — ar iepriekšējo līkumu un auto vilkmi, vai ar lidojumu iepriekšējā līkumā, kas bija 0,2 s garāks. Auto, kad automašīnas atšķiras |
| 12 | lēnāk līdz apeksam | citādi: atlaist bremzi maigāk un ieripot vairāk ātruma vidū |

**Lēnāk caur vidu** (`middleSplit`): katra apļa rādiuss lēnākajā punktā tiek mērīts no pašas līnijas (±8 m), tā sānu paātrinājums kā `v²/R`, un

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- Rādiuss izskaidro **pusi vai vairāk**: **pārāk šaura līnija** — "izmantojiet vairāk ceļa", ar abiem rādiusiem un daļu.
- Pie auto robežas (slīdot pāri 10° dreifam uz asfalta / 20° uz irdena seguma, vai sānu paātrinājums vismaz 90% no tā, ko tā notur šajā ātrumā) un otra automašīna saķeras vairāk nekā par 5% vairāk: **auto saķere**; drīzāk nodrošiniet izeju.
- Slīdot cauri (dreifs virs 10° / 20°) un otrs aplis nē (tā ieejas dreifs vismaz par 4° mazāks): **sānis** — aiz tā saķeres, nevis īsu no tās; ieejiet nedaudz lēnāk. Teikts kā auto, kad šī automašīna noķer savu aizmuguri vismaz vienu reizi vairāk nekā otrs apli.
- Citā automašīnā, kas notur zem **96%** no otra saķeres, un aplis nobrauca 1 m/s robežās no `v_other · √(grip_mine / grip_other)`: **auto saķere** — "bremzēt vēlāk to neaizvērs".
- Citādi **saķere rezervē**: sānu paātrinājums pret otra līdzīgā rādiusā un to, ko šis auto notur; vairāk ātruma līdz apeksam. Kur šīs automašīnas aizmugure atlaiž, pirms saķere ir izlietota (tās slīdes sākas zem 85% no saķeres, un aplis bija 80% no tās), atrodiet pārējo mazos soļos.

### Cēloņi izejā {#causes-on-the-way-out}

`exitCause`, pirmais, kas attiecas:

| # | Cēlonis (kļūda) | Noteikums |
|---|---|---|
| 1 | automašīnas vadības kļūda izejā | nekopīgs riteņu slīdums, vērpšanās, slīde vai trieciens, kas beidzas vai nu 10 m pirms lēnākā punkta, vai pēc tā |
| 2 | **nomazgāts ātrums** | vairāk nekā 1 m/s ātruma zuduma pilnā gāzē nekā otram; virs **7 m/s (25 km/h)** "vairāk kā kontakts vai vērpšanās nekā slīde" |
| 3 | **pagrieza auto nepareizi** (irdens segums) | skatiet [rallijs](#rally-rotation-and-flights) |
| 4 | **uz jaudas vēlāk** | gāze ieslēgta vairāk nekā 5 m vēlāk, skaitot arī no katra apļa paša lēnākā punkta (aplis, kura lēnākais punkts ir vēlāk, netiek vainots par vēlāku gāzi) |
| 5 | **svārstījās ar gāzi** | vairāk gāzes kritumu nekā otram |
| 6 | **brauca plašāk un gaidīja** | vairāk nekā 1,5 m ārpus otra, kur abi bija pilnā gāzē, un pilna gāze vairāk nekā 5 m vēlāk no paša lēnākā punkta |
| 7 | **pilna gāze vēlāk** | pilna gāze vairāk nekā 5 m vēlāk, arī no paša lēnākā punkta; ar auto paātrinājumu tur |
| 8 | **auto piedziņa** | citā automašīnā, kas vilcas zem 95% no otra tajā ātrumā, un vilkme izskaidroja daļu no taisnes |
| 9 | **lēnāks ārā no līkuma** | citādi: vēlāks apekss, tāpēc automašīna ātrāk ir taisni |

Kad abi apļi bija dažādos pārnesumos lēnākajā punktā, padoms beidzas ar "Pārnesums N apeksā; otrs izmantoja M."

### Automašīnas vadības kļūdas un triecieni {#car-control-faults-and-impacts}

[Automašīnas vadības notikumu](race-control-events.md) kļūda kā cēlonis: bloķējums ir *bremzēšanas* cēlonis, riteņu slīdums vai slīde pie gāzes ir *izejas* cēlonis, pārējais *ieejas*; trieciens pēc lēnākā punkta ir *izejas*, pirms tā — *ieejas*. Padoms ir paša notikuma, tad "Tas izmaksāja apmēram X s līdz 40 m pēc tā" (vai "līdz brīdim, kad automašīnai bija atjaunots ātrums" triecienam). Bloķējums ar bremzēšanas punktu vairāk nekā 5 m agrāk nekā otrs pievieno, ka aplis arī bremzēja par agru — ar riteņiem, kas griežas, tas nebūtu vajadzējis.

### Rallijs: rotācija un lidojumi {#rally-rotation-and-flights}

**Irdenā segumā**, ar dreifa leņķiem abiem apļiem, un šis aplis ir uz jaudas (vai pilnā gāzē) vairāk nekā 5 m vēlāk:

- **Pagrieza auto mazāk**: otrs bija pagriezis auto **12°** vai vairāk līdz savam lēnākajam punktam, un vismaz **8°** vairāk nekā šis aplis. Padoms: atlaist vai pieskarties kreisās kājas bremzei, kad tas ieiet līkumā, ar otra apļa rokas bremzes punktu, ja tas izmantoja tikai to, vai rokas bremzi līkumā, kas ir lēnāks par 15 m/s (54 km/h).
- **Pagrieza pārāk tālu**: šim aplim tas bija pagriezts 12° vai vairāk un vismaz par **12°** vairāk nekā otram: tas bija jātaisno, pirms jaudu varēja palielināt.

**Garāks lidojums**: gaisā 0,2 s vai vairāk garāks nekā otram, izmaksājot vismaz 0,03 s no 10 m pirms pacelšanās līdz 40 m pēc nolaišanās (vai segmenta beigām). Pirms lēnākā punkta tas ir ieejas cēlonis; kļūst par līkuma stāstu, kad izskaidro 40% vai vairāk. Padoms: paturiet gāzi ieslēgtu pacelšanās brīdī, ņemiet kalnu nedaudz lēnāk vai ar pieskārienu bremzei.

### Starts {#the-start}

Pirms pirmā līkuma, sprintā vai kad kāds aplis sāka stāvot (zem 5 m/s, kad abi ir pirmie uz ass) vai sacensību startā (zem 60% no otra ātruma), brauciens līdz pirmajam bremzēšanas punktam ir savs atradums (līkums 0), kad tas atšķiras vairāk nekā par 0,03 s: *Starts*, *Sacensību starts* vai *Līdz pirmajam līkumam*. Zaudējums tur tiek nolikts uz situāciju (*apstākļi*), kad viens aplis sāka sacensību startā un otrs ar ātrumu, uz auto, kad automašīnas atšķiras, un uz braucēju citādi. Padomi: citā automašīnā no stāvus starta, "galvenokārt auto"; stāvošs starts tajā pašā automašīnā, uzsākt ar mazāku riteņu slīdumu un pārslēgt jaudas joslas augšā; sacensību starts, salīdziniet to ar citu pirmo apli; lidojošs starts, labāka izeja no pēdējā līkuma tiek pārnesta pāri līnijai.

## Braukta līnija {#the-driven-line}

`lineMetrics`, katram aplim un segmentam (ne jauktiem kompleksiem), no vienām pozīcijām (izlīdzināts ±2 paraugi) pār līkuma logu:

| Mērs | Noteikums |
|---|---|
| izliekums | virziena maiņa pāri ±8 m paša aploma ceļam |
| **visstingrākais rādiuss** | 1 / maksimālais izliekums |
| **ieejas punkts** / **izejas punkts** | kur izliekums pirmo reizi / pēdējo reizi pārsniedz piekto daļu no maksimuma |
| **vidus** | kur aplis bija pagriezies par pusi no sava virziena maiņas |
| rādiuss ieejā / izejā | metri, ko braukts pāri pusei no virziena maiņas, pirms / pēc vidus |
| **forma** | visstingrākais rādiuss dalīts ar vidējo rādiusu pagrieziena laikā: zem **0,55** — **V**, virs **0,75** — **U**, starp "U/V" |
| **apekss** | izejas rādiuss dalīts ar ieejas rādiusu: virs **1,25** — vēlu, zem **0,8** — agri, citādi vidū |
| **ātruma apekss** | lēnākais punkts vairāk nekā **15 m** pirms vidus: lēns ieejā, ātrs izejā; vairāk nekā 15 m pēc: joprojām palēninās pāri vidum |

Salīdzinot ar otru apli: cik tālu iekšā (+) vai ārā tas brauca ieejas punktā, caur visstingrāko daļu un kur abi bija pilnā gāzē (teikts no 1 m); kur katrs ieiet līkumā (teikts no 8 m).

### Kura līnija šim auto šeit der {#which-line-suits-this-car-here}

`lineFor`, no tā, uz ko līkums ved, un auto raksturs šajā līkumā:

- **jauda pret saķeri** = auto pilnās gāzes paātrinājums izejas ātrumā, dalīts ar tā saķeri lēnākajā ātrumā (no tā aploksnes). **Nospied un šauj** no **0,45** un augstāk; **impulss** no **0,25** un zemāk.
- **nolaišanās spēks**: saķere 151-252 km/h, dalīta ar saķeri 54-108 km/h, **1,15** vai vairāk, līkumam, ko brauc ar **144 km/h** (40 m/s) vai ātrāk — tad tas ir impulsa līkums neatkarīgi no jaudas. Nav vērtēts irdenā segumā.

| Līkuma tips | Auto | Līnija |
|---|---|---|
| pēc taisnes | nospied un šauj / cits | V / U, apekss vidū: "bremzēšanas zona ir balva" |
| starp divām taisnēm | impulss / cits | U / V, vēls apekss |
| savienojums | impulss / cits | U / V, apekss vidū: "vadiet to šī nākamā izejai" |
| uz taisnes | impulss (vai ātrs nolaišanās līkums) | plats apaļš U, nedaudz vēls apekss |
| uz taisnes | nospied un šauj | V: bremzēt taisni, ieiet vēlu, pagriezties īsā, stingrā vidū, taisni agri |
| uz taisnes | starp | U ar vēlu apeksu: lēns ieejā, ātrs izejā |

Kur izeja ir svarīga (uz taisnes, starp divām), piedziņa pievieno teikumu: **FWD** — pagriezt uz bremzēm, pievienot jaudu tikai kad ritenis atsiet; **RWD** ar jaudas un saķeres attiecību 0,35 vai vairāk — iztaisnot pirms pilnās gāzes; **AWD** — var ņemt jaudu, joprojām griežoties. Irdenā segumā katrs kartējums pievieno: pagriezt auto ieejā.

Teikums tad saka, ko braukts, un vai tas atbilst: *lēnais vēlu sasien izeju* vai *agrs apekss sasien izeju*, kur bija vēlāks apekss, un aplis ne vēlu apeksēja, nedz bija agri lēns; *apaļāks, nekā šis auto grib*, kur vajadzēja V; *kvadrātveidīgāks, nekā šis auto grib*, kur vajadzēja U; citādi *tas atbilst*.

## Izstrādātājiem {#for-developers}

Kods: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Pamatojums un tā avoti: [metode](race-analytics.md).
