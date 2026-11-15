---
title: "Auto vadības notikumi"
parent: "Sacīkšu analīze"
nav_order: 54
lang: "lv"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Auto vadības notikumi

Skatītājs redz, kā katrs aplis ir braukts, un atzīmē vietas, kur vadītājs lika automašīnai slīdēt, apgriezties, trāpīt pret kaut ko vai zaudēt satvērumu. Tas ir noderīgi, jo kļūda, kas maksāja laiku, ir visātrāk labojama.

![Sadaļa Automašīnas vadība: cik bieži katrā aplī bloķējās ritenis, apgriezās vai izskrēja plašāk, un kļūdu saraksts ar vienu atvērtu](../assets/img/en/race-control-table.webp)

## Vienkāršos vārdos {#in-plain-words}

- **Bloķēšana**: bremzē tik stipri, ka ritenis apstājas un slīd. Auto bremzē sliktāk un nevar vadīties.
- **Riteņu buksēšana**: spied gāzi tik stipri, ka piedziņas riteņi griežas ātrāk, nekā auto virzās. Zaudē vilci.
- **Pārstūre**: auto aizmugure slīd plaši. Ja tā apgriežas pilnīgi, tā ir **apgriešanās**.
- **Nedostūre**: auto priekšdaļa slīd plaši ("spiež uz āru"); stūres ripas griešana vairāk nepalīdz.
- **Trāpījums** un **avārija**: auto kaut ko aizskāra (trāpījums ir pasitums vai saskrāpējums, avārija ir spēcīgs sitiens).
- **ABS**, **TC**: auto pašas palīgsistēmas, kas strādā pret bloķēšanos un riteņu buksēšanos. Tās nav kļūdas.

## Automašīnas vadības sadaļa (ko redzat) {#the-car-control-section-what-you-see}

Izvēlētajam aplim - ar to, ko aplī ir - bez riepu slīdes un bez drifta leņķa
tā rāda to, kas vēl ir atrodams, nevis neko (zemāk).

**Tabula**: viena rinda katram veidam, ko rāda vismaz viens no aplīm - Bloķētie riteņi,
Riteņu buksēšana, Aizmugure izslīd (pārstūre un apgriešanās), Plaša izbraukšana,
Avārijas, Trāpījumi, ABS darbojas, Vilces kontrole darbojas, Rokas bremze, Gaisā - katrā šūnā
"skaits · sekundes", izvēlētajam aplim un aplim, ar kuru tas tiek salīdzināts; un
*Lielākais drifta leņķis*, ja ir drifta leņķis (lielākais uz zemes).

**Saraksts**: tā kopīgi neizmantotās kļūdas, kas maksā vismaz 0,02 s, dārgākās pirmās,
ne vairāk kā 12, katra ar savu nosaukumu un izmaksu (un savas veida zīmi). Noklikšķiniet
uz vienas, lai izlasītu tās padomu, izlīdzinātu automašīnas 40 m pirms tās un atskaņotu to.
**Arī to, ko abi apļi tur darīja** pievieno katru kļūdu, arī kopīgās (zīme
"abi to darīja", izmaksa "—" zem 0,01 s). Ja nav nevienas: "Tas, ko X darīja ar riepām, tam
nomaksāja laiku, bet Y to nedarīja."

**Padoms zem tās** saka, ar ko noteikšana varēja strādāt - "No katra riteņa
slīdes un slīdes leņķa, un automašīnas drifta leņķa." (vai slīde un slīdes leņķis,
slīde un drifta leņķis, tikai slīde, vai "No vienīgi automašīnas drifta leņķa - šiem
aplīem nav riepu slīdes.") - zemi, kuriem robežas tika mērītas
(asfalts, irdens, jaukts: virs 80% irdenu paraugu ir irdens, zem 20% asfalts), kuram aplim
notikumi tika salīdzināti, un kā tiek skaitīta izmaksa.

Ja **nav riepu slīdes un nav drifta leņķa** (FH Companion apļa fails bez tā telemetrijas),
tabula un saraksts tiek rādīti tāpat, un padoms saka, kas vēl tika atrasts no tā, ko
apļi satur: "Šiem aplīem nav riepu slīdes un nav drifta leņķa, tāpēc bloķēšanos
un riteņu buksēšanos nevar noteikt. Joprojām atrasts: spiešana, no stūres salīdzinot ar
ceļu; trāpījumi un avārijas, no ātruma un paātrinājuma." - slīdes no griešanās ātruma
tiek nosauktas arī tad, ja aplos tāda ir, spiešana tikai tad, ja ir stūres dati. Teikums par
slīdes un drifta robežām tiek izlaists, un otrs padoms saka: "Forza Horizon gadījumā izvēlieties arī
`.tele.gz` failu blakus katram FH Companion aplim: tā ir pilna telemetrija,
katra riteņa slīde 64 reizes sekundē."

Apļa **kopējā** kontroles izmaksa (ko izmanto kopsavilkumos) skaita pārklājošās kļūdas -
bloķēšanu un slīdi, ko tā sāk, 40 m robežās - vienu reizi, pēc dārgākās no klastera.

## Kā tas tiek noteikts {#how-it-is-detected}

Pārējā šī lapa ir noteikumu grāmata: katrs veids, katrs slieksnis.

Kods: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Pamatojums un literatūra ir [metodē](race-analytics.md).

## Veidi {#the-kinds}

| Veids | Tabulas rinda | Kļūda? | Īsākais, kas skaitās |
|---|---|---|---|
| `lock` | Bloķētie riteņi | jā | 0,1 s |
| `wheelspin` | Riteņu buksēšana | jā | 0,15 s |
| `oversteer` | Aizmugure izslīd | jā | 0,2 s |
| `spin` | (skaitīts kopā ar Aizmugure izslīd) | jā | 0,1 s |
| `understeer` | Plaša izbraukšana | jā | 0,25 s |
| `crash` | Avārijas | jā | - |
| `hit` | Trāpījumi | jā | - |
| `abs` | ABS darbojas | nē | 0,2 s |
| `tc` | Vilces kontrole darbojas | nē | 0,2 s |
| `handbrake` | Rokas bremze | nē | 0,1 s |
| `airborne` | Gaisā | nē | 0,15 s |

Īsākas daļas ir troksnis (bordiūrs, bedre, viens paraugs). Režģa punktu virknes
(ik pa 2 m), kas iztur pārbaudi, tiek savienotas pāri spraugām līdz 2 punktiem. Tikai
**kļūdas** var būt kļūdas un nes izmaksu; pārējais ir tas, ko auto un vadītājs darīja.

## Ko prasa katrs tests {#what-every-test-needs}

### Atvasinātie kanāli {#derived-channels}

Pirms kaut kā vērtēšanas katrs aplis iegūst to, ko spēle nesūta, ar kanonisku
nosaukumu (spēles pašas vērtība vienmēr uzvar):

| Kanāls | No |
|---|---|
| `bodySlip` (drifta leņķis) | automašīnas koordinātu sistēmas ātrums, `atan2(latVel, abs(longVel))`, kur spēle to sūta (0 zem 3 m/s); citādi virziens (spēles yaw, pielāgots braukšanas virzienam pēc zīmes un nobīdes pār paraugiem ātrāk par 10 m/s, uzticams tikai ar apļveida dispersiju zem 0,05) pret braukšanas virzienu (pozīcijas vismaz 2 m attālumā), ātrumos virs 3 m/s |
| `yawRate` | `yaw` izmaiņa laikā, kur ir virziens, bet nav ātruma |
| `airborne` | katra riteņa zemes kontakts izslēgts (≤ 0,5); citādi katra riteņa slodze zem 5% no tā mediānas; citādi katras balstiekārtas nobraukums vai zem 0,02 (pilnīgi izstiepta). Viens nejaušs paraugs nav lidojums |
| `slipRatio.<W>` | `(riteņa virsmas ātrums - auto ātrums) / auto ātrums` virs 3 m/s, kur spēle sūta riteņu virsmas ātrumus; vai no riteņa griešanās × aplī izmērīts ripošanas rādiuss - `ātrums / griešanās` mediāna, kamēr auto brauc taisni bez gāzes (ātrums > 10 m/s, gāze < 0,3, bremze < 0,05, abs(garenisks paātrinājums) < 3 m/s², nav gaisā; visi paraugi virs 10 m/s, ja ir mazāk par 20), pieņemts no 0,1 līdz 1 m. Atzīmēts kā `physical` |
| `loose` | Forza virsmas dārdoņa vismaz uz 2 riteņiem (> 0,001) vismaz 0,33 s (bordiūrs ir īsāks), spraugas zem 1 s savienotas |

### Uz zemes un nostabilizējies {#on-the-ground-and-settled}

Nekas netiek vērtēts gaisā vai **0,3 s pēc nolaišanās** - balstiekārta
iedziļinās un paātrinājumi uzšaujas, un tā nav sakere, bremzēšana vai piedziņa. Paraugam
jābūt arī **kustībā**: ātrāk par 5 m/s.

### Zeme {#the-ground}

Katra parauga zeme ir **irdena**, ja to tā norāda aplā esošais `loose` kanāls (Forza
virsmas dārdoņa, Trackmania riteņu materiāli), citādi aplā esošā virsma (skat.
[disciplīna un virsma](race-loading-laps.md#discipline-and-surface)):
asfalts vai irdena jebkurai citai. Līknes, drifta paradumi un sliekšņi tiek turēti
atsevišķi asfaltam un irdenai zemei.

### Slīde kā tās riepas nominālās maksimālās vērtības daudzkārtnis {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Spēles slīdi mēro atšķirīgi; `meta.slip` norāda, kā, un katra slīde tiek
dalīta ar mērogu, lai aptuveni 1 būtu riepas nominālais maksimums:

| `meta.slip` | Nozīme | Dalīts ar |
|---|---|---|
| `peak` | normalizēts ar spēli: aiz 1 sakere tiek zaudēta (Forza Data Out) | 1 |
| `scaled` | fiziskā slīde, dalīta ar asfalta maksimumu (Kunos ierakstītājs) | zemes nominālais maksimums, dalīts ar asfalta maksimumu |
| `index` | 0..1 slīdes mērs (Trackmania SlipCoef) | 0,5 |
| `physical` (vai nezināms) | slīdes koeficients kā daļa, slīdes leņķis radiānos | zemes nominālais maksimums |

Nominālie maksimumi, ja nekas labāks nav zināms:

| Virsma | Slīdes koeficients | Slīdes leņķis |
|---|---|---|
| asfalts | 0,12 | 8° |
| jaukts | 0,18 | 12° |
| irdens (grants) | 0,25 | 15° |
| sniegs | 0,25 | 15° |
| ledus | 0,10 | 6° |

### Kur sakere beidzas: katras automašīnas riepu līknes {#where-grip-ends-each-cars-tyre-curves}

Vieta, kur riepa pārstāj dot vairāk, tiek **mērīta katrai automašīnai** no katra
slogota tās apļa (`measureTyres`), atsevišķi asfaltam un irdenai zemei:

| Līkne | Paraugi (ātrums > 10 m/s, nostabilizējies, paātrinājumi zem 45 m/s²) | Slīde (x) | Spēks (y) |
|---|---|---|---|
| bremzēšana | bremze > 0,3, rokas bremze ≤ 0,2, brauc taisni (sānu virziens zem 30% no visspēcīgākā) | abs(četru riteņu vidējais slīdes koeficients) | palēninājums |
| vilce | gāze > 0,8, bremze ≤ 0,05, taisni, auto pilnas gāzes vilce šajā ātrumā > 0,5 m/s² | lielākā piedziņas riteņa slīdes koeficients | paātrinājums kā daļa no šīs vilces |
| priekšējie | sānu virziens virs 30% no visspēcīgākā, auto sakere šajā ātrumā > 1 m/s² | lielākais priekšējo riteņu slīdes leņķis | sānu paātrinājums kā daļa no šīs sakeres |
| aizmugurējie | tas pats | lielākais aizmugurējo riteņu slīdes leņķis | tas pats |

"Visspēcīgākais" ir aplā 99. procentile no abs(sānu paātrinājums) tajā zemē
(visa zeme, ja tās ir mazāk par 50 paraugi). Piedziņa nosaka piedziņas riteņus (FWD - priekšējie, RWD - aizmugurējie, AWD - visi; nezināms: visi).

No vismaz **150 paraugiem** slīde tiek sadalīta 6 līdz 14 vienādu skaitu grupās
(pa vienai uz 40 paraugiem), katras grupas spēks ir tās augšējais kvartīls (ko riepa
deva, kad vadītājs to prasīja), izlīdzināts pa blakus grupām. **Labākais** ir
grupa ar vislielāko spēku; **robeža** ir pirmā grupa pēc tā, kur spēks ir
samazinājies par **8%**. Līknei, kas datos nekad nekrītas, robežas nav (bezgalība) - "maksimuma"
pārsniegšana šajā spēlē nemaksā, un slīde viena pati tur nekā neatzīmē (Forza Horizon
stūrēšanas un vilces līknes ir tādas). Ja vienā zemē ir par maz paraugu, izmanto citas zemes;
ja kopumā par maz, **nominālo** robežu: 1,5 reizes nominālais maksimums.

Katrai automašīnai arī tiek noteikts:

- tās **drifta paradums**: tā drifta leņķa augšējais kvartīls tur, kur tā stūrē ar 60% vai
  vairāk no savas visspēcīgākās sakeres (vajadzīgi 100 paraugi);
- tās **stūrēšana pret līkumu** (`steerGain`), katrā 5 m/s ātruma joslā: abs(stūre) / ceļa
  līkuma mediāna, kamēr stingri stūrē, bet labi zem savas sakeres (30-60% no visspēcīgākās,
  līkums stingrāks par 400 m rādiusu, stūre virs 0,02; 25 paraugi katrā joslā). Ceļa līkums ir
  griešanās ātrums, dalīts ar ātrumu, kur spēle sūta griešanās ātrumu, citādi no pozīcijām ±5 m.

## Noteikšana pa veidiem {#detection-kind-by-kind}

| Veids | Tests (kustīgos, nostabilizējušos paraugos) | `peak` un `limit` |
|---|---|---|
| **lock** | bremze > 0,05, rokas bremze nav virs 0,2, un kāda riteņa slīdes koeficients zem mīnus bremzēšanas robežas | visnegatīvākā slīde (nominālā maksimuma daudzkārtņi); robeža kā negatīva |
| **wheelspin** | gāze > 0,2 (vai nav gāzes kanāla), un piedziņas riteņa slīdes koeficients virs vilces robežas | lielākā piedziņas slīde; robeža |
| **oversteer** (drifta leņķis) | drifta leņķis virs lielākā no virsmas zemākās robežas un 1,5 × auto drifta paraduma šeit | lielākais drifta leņķis, radiānos |
| **oversteer** (slīdes leņķi, nav drifta leņķa) | lielākais aizmugurējais slīdes leņķis virs aizmugurējās robežas un vairāk nekā par 0,25 virs lielākā priekšējā | aizmugurējais slīdes leņķis (maksimuma daudzkārtņi) |
| **oversteer** (nav drifta leņķa, bet ir griešanās ātrums un sānu paātrinājums) | "stāvokļa ātrums" - abs(griešanās ātrums) mīnus abs(sānu paātrinājums) / ātrums, virs 8 m/s - virs 0,2 rad/s, ar stūri pret līkumu | rad/s; robeža 0,2 |
| **spin** | pārstūres daļa, kuras drifta leņķis sasniedza **60°** | kā oversteer |
| **understeer** (slīdes leņķi) | neslīd, lielākais priekšējais slīdes leņķis virs priekšējās robežas un vairāk nekā par 0,3 virs aizmugurējā | priekšējais slīdes leņķis; robeža |
| **understeer** (nav slīdes leņķu) | ātrāk par 12 m/s, neslīd, nestūrē pretēji, sānu paātrinājums virs pusi no aplā visspēcīgākā (99. procentile), ceļš stingrāks par 300 m rādiusu, un stūre vairāk nekā **1,6 reizes** tas, ko pašas automašīnas stūrēšana pret līkumu prasa šim ceļam | reizes vairāk stūres, nekā vajadzēja; robeža 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` virs 0,5 | - |
| **handbrake** | `handbrake` virs 0,2 | - |
| **airborne** | `airborne` virs 0,5 | - |
| **hit**, **crash** | skat. [Trāpījumi un avārijas](#hits-and-crashes) | ātrums, ko trieciens atņēma |

Drifta leņķa zemākās robežas pēc virsmas: asfaltam **7°**, jauktai **10°**, irdenai un sniegam
**15°**, ledum **10°**. Auto, kas slīd kā parasta lieta - arkādes riepu modelis,
grants speciālists - tai ir savs, augstāks slieksnis no pašas aplēm
(1,5 × tās paradums).

**Kurā virzienā automašīna pagriežas** (priekš "pret līkumu"): aplā ceļa
virziena izmaiņa ±6 m robežās (vismaz 2 režģa punkti); stingrāks par 600 m rādiusu skaitās kā pagriešanās; pa labi vai pa kreisi atkarībā no tā, vai pasaule ir spoguļattēlā.
Stūre ir **pret** līkumu, kad abs(stūre) > 0,05 un tās zīme ir pretēja līkumam - slīde, kas
ir **noķerta** ar pretēju stūri.

**Pedāļi, kā tas sākās** (`pedal`): *bremze*, kad bremze virs 0,1; *gāze* virs 0,3;
*atlaists*, kad gāze bija virs 0,5 8 režģa punktos (16 m) pirms tam; citādi *ripo* (vai bez
gāzes kanāla).

## Salīdzināts ar otru apli {#laid-against-the-other-lap}

Katrs notikums tiek vērtēts pret apli, ar ko izvēlētais aplis tiek salīdzināts šajā
segmentā (labākais no tā klases; pašam šim aplim - tas no tā klases, kurš šajā segmentā bija ātrākais):

1. **Cik tālu otrs aplis aizbrauca** tajos pašos metros, ±8 m: otra apļa paša notikumi
   tās pašas saimes (apgriešanās skaitās kā pārstūre, avārija kā trāpījums), mērīti tajās pašās vienībās,
   bez slieksniem, ar otras automašīnas riepu līknēm.
2. **Kopīgs**, kad otrs aplis aizbrauca **80%** tik tālu vai vairāk: tā ir tā, kā
   stūris tiek braukts, nevis kļūda. Nekādas kļūdas veidi vienmēr ir "kopīgi".
3. **Izmaksa**, nekopīgai kļūdai: laiks, ko šis aplis zaudēja pret otru
   no 5 m pirms notikuma līdz **40 m pēc** tā (trāpījumam vai avārijai - līdz brīdim, kad
   auto atgūst ātrumu - metri, lai to atgūtu pēc savas vilces, 40 līdz 400 m; bez izmērītas vilces, 5 m/s²).
   Nekad nav negatīva.
4. **Ātrums, ko atdeva** automašīnas robežai: bloķēšanai - palēninājums, ko auto
   parāda, ka var šajā ātrumā, mīnus tas, ko tas darīja, summēts pa notikumu; buksēšanai - tās pilnās
   gāzes vilce mīnus tas, ko tā darīja; triecienam - ātrums, ko tas atņēma. Tiek teikts, kad virs 0,5 m/s (1,8 km/h).

Kļūda, kas nav kopīga un maksā vismaz **0,02 s**, tiek iekļauta sarakstā (
[kursa statistika](race-course-statistics.md) skaita tikai kļūdas, kas ir **0,03 s** vai vairāk, lai kļūda, kas skaitīta pa daudziem aplīm, būtu skaidra), un tā var
kļūt par stūra zaudējuma cēloni (skat.
[Stūris pa stūrim analīze](race-corner-analysis.md#car-control-faults-and-impacts)).

## Trāpījumi un avārijas {#hits-and-crashes}

`impacts.ts` nolasa trāpījumus no aplā **pašiem paraugiem**, pirms tie tiek pārparaugoti - trāpījums beidzas simtdaļās sekundes. Riepas nevar radīt trāpījuma spēkus, tāpēc trāpījums tiek mērīts pret paša apļa automašīnu:

- **Tās sakere `G`**: horizontālā paātrinājuma `√(lat² + long²)` 99. procentile visā aplā, uz zemes un ātrāk par 5 m/s. Bez paātrinājuma kanāliem (vai zem 3 m/s²) - 15 m/s² - ceļa auto sakere.
- **Slieksnis**: `max(1,8 G, G + 18, 30)` m/s².
- **Trāpītais paraugs**: horizontālais paātrinājums virs sliekšņa *un* lēciens vairāk nekā par pusi no `G` no iepriekšējā parauga; **vai** ātruma krišanās 0,1 s laikā vairāk nekā sliekšņa paņemtu 0,1 s plus 1,5 m/s. Tikai uz zemes un nostabilizējies, un tikai tad, kad auto brauca ātrāk par 5 m/s.
- Trāpītie paraugi 0,4 s robežās ir viens trāpījums.
- **Pirms / pēc**: lielākais ātrums 0,15 s pirms; mazākais līdz 0,3 s pēc pēdējā trāpītā parauga.
- **Nav trāpījums**: ātruma zudums bez spēka aiz tā - lielākais horizontālais paātrinājums 0,1 s robežās zem lielākā no `G` un 25 m/s² - ir spēles atgriešana vai auto atiestatīšana.
- **Avārija**, kad tā atņēma **30 km/h** vai vairāk, vai atstāja auto zem pusi no tā ātruma; citādi **trāpījums** - sitiens, berzēšana pret sienu.
- **Virziens**: garenais paātrinājums lielāks par sānu un negatīvs: *pa priekšu*; pozitīvs: *no aizmugures*; sānu lielāks: *pa tā sāniem*. Bez paātrinājumiem - pa priekšu.

Ko auto var, tiek mērīts ar visiem trāpījumiem izslēgtiem, no 0,1 s pirms tā līdz 1 s pēc tā (`struckMask`).

## Teksti {#the-texts}

Katrs notikums tiek aprakstīts, nosaucot abus aplus, ar vietu (metros pa atsauci), ātrumu, ar kuru tas sākās, cik tālu pāri robežai pret otru apli, un padomu. Padoms seko no veida un no tā, ko izmērīja:

| Notikums | Padoms |
|---|---|
| bloķēšana, tikai priekšējie | bloķēts priekšējais nevar stūrēt: mazāk spiediena zonas augšā, atlaidiet to līkumā |
| bloķēšana, tikai aizmugurējie | bloķēta aizmugure ļauj automašīnai griezties: bremzējiet vairāk taisnā līnijā, atlaidiet, pagriežot; pārvietojiet sadalījumu uz priekšu, ja tas atkārtojas |
| bloķēšana, irdena zeme | bloķēts ritenis arē zemi: spiediet līdz tieši pirms bloķēšanās |
| bloķēšana, citādi | pedālis pārāk stiprs saķerei: spiediet pakāpeniskāk |
| riteņu buksēšana | ievadiet gāzi, kad stūre atgriežas, īsi pārslēdziet, kur vilce ir ierobežota (irdenā zemē: augstāka pārnesums mīkstina griezes momentu) |
| apgriešanās / pārstūre | pēc pedāļa: zem bremzēšanas (pārāk stipra bremzēšana līkumā, pārāk agra pārslēgšana uz zemāku pārnesumu), atlaists (pārstūre pēc atlaišanas: turiet vienmērīgu gāzi), uz gāzes (pārāk daudz, kamēr vēl pagriezts), nekas (ieņemts pārāk ātri); "noķerta ar pretēju stūri", kad stūrēts pretēji; irdenā zemē vai rallijā "kāds leņķis ir ātrākais veids, kā apgriezties - otra brauciena pietika"|
| nedostūre | stūres ripas griešana neko nedara, kad priekšdaļa jau ir aizgājusi: ieejiet lēnāk, nedaudz turiet bremzi, lai noslogotu priekšdaļu, atvelciet; irdenā zemē pagrieziet auto ar atlaišanu vai kreisās kājas pieskārienu |
| trāpījums / avārija | pa sāniem: metrs rezerves maksā mazāk nekā berzēšana; no aizmugures: cits auto vai slīdēšana atpakaļ; frontāla avārija: bremzējiet agrāk; sitiens priekšā: kaut ko aizskārāt. "X arī tur trāpīja." kad kopīgs |

Trackmania spēlē slīde vēl saka: zem aptuveni **400 km/h**
(**300** irdenā zemē: netīrums, zāle, plastmasa) slīde dod mazāk piedziņas nekā sakere; virs tā ātrumslīde ar pareizu leņķi iegūst, un šī izmaksāja laiku, tāpēc tās leņķis bija nepareizs.

## Ko katrs avots ļauj {#what-each-source-allows}

| Apļi satur | Bloķēšana / riteņu buksēšana | Pārstūre / apgriešanās | Nedostūre |
|---|---|---|---|
| katra riteņa slīdes koeficients un slīdes leņķis, auto ātrums (Forza Data Out, AC spēles) | no slīdes | no drifta leņķa vai aizmugurējā slīdes leņķa | no slīdes leņķiem |
| riteņu ātrumi, pasaules ātrums (rallija spēles, BeamNG) | no atvasinātās slīdes | no atvasinātā drifta leņķa | no stūrēšanas pret līkumu |
| yaw un griešanās ātrums, bez slīdes (iRacing) | - | no drifta leņķa (pielāgotais yaw pret braukšanas virzienu); no stāvokļa ātruma ar pretēju stūri tikai tad, kad yaw nevar uzticēties | no stūrēšanas pret līkumu |
| tikai virziens | - | no virziena pret braukšanu | no stūrēšanas pret līkumu |
| tikai FH Companion apļa fails (bez yaw, bez slīdes) | - | - | no stūrēšanas pret līkumu (tam ir stūre un paātrinājumi) |

Trāpījumiem un avārijām vajag tikai ātrumu (labāk ar paātrinājumiem), tāpēc tie ir katrā avotā. Sadaļa **Automašīnas vadība** rāda, ko ļauj katrs avots: ar vienu FH Companion apļa failu - tā spiešanu no stūres un tās trāpījumus, un padomu ielādēt `.tele.gz` pārējam.
