---
title: "Atkārtojums un 3D aina"
parent: "Sacīkšu analīze"
nav_order: 52
lang: "lv"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Atkārtojums un 3D aina

Atskaņojiet savus apļus kopā, kā sacīkstes, un skatieties, kur viens auto izrauj priekšā. Šeit ir aprakstīts viss, ko redzat cilnes **Sacīkšu analīze** 3D skatā: izbrauktās līnijas, krāsas uz trases, automašīnas un etiķetes.

![Cēloņu karte ar automašīnām, izlīdzinātām 40 m pirms līkuma: krāsota trase, divas automašīnas un karoga stabs](../assets/img/en/race-replay-lined-up.webp)

## Atkārtojuma pulkstenis {#the-replay-clock}

Viens pulkstenis vada katru apli: sekundes **atsauces** apļa. Dzinējs to virza katrā kadrā, kamēr atskaņo (kadra laiks × atkārtojuma ātrums); beigās tas atgriežas uz 0, ja **Atkārtot** ir ieslēgts, citādi apstājas. Pulkstenis apzināti nav daļa no glabātuves, lai sānjosla nepārzīmētos katrā kadrā; galvenais displejs un diagrammas abonē to un atjaunina ne vairāk kā vienu reizi kadrā.

**Atkārtojuma garums** ir garākais, cik ilgi jebkurš aplis aizņem pulksteni: katra apļa laiks (mīnus tā nobīde *Vienā līnijā*), vai atsauces laiks *Blakus*.

## Transportēšanas josla {#the-transport-bar}

Zem skata, no kreisās uz labo:

| Vadība | Dara |
|---|---|
| ⏮ | atpakaļ uz sākumu (arī **Home**) |
| ▶ / ❚❚ | atskaņot / pauzēt (arī **K**) |
| ātrums | 0,25×, 0,5×, 1×, 2×, 4× |
| ritināšanas slīdnis | iestata pulksteni tieši, 0,01 s soļos |
| pulkstenis | `laiks / garums · metri`: pulkstenis kā apļa laiks, atkārtojuma garums un cik tālu pa atsauci atrodas atsauces auto |
| *No starta* / *Vienā līnijā* / *Blakus* | atkārtojuma režīms (zemāk) |
| **Nolikt līnijā šeit** | novieto katru auto tur, kur atsauce ir tagad, un turpina no turienes |
| **Atkārtot** | sākt no jauna beigās (pēc noklusējuma ieslēgts) |
| **Slēpt grafikus** / **Rādīt grafikus** | distances diagrammas zem joslas |

Pogas ir atslēgtas, līdz ir ielādēti apļi (viens aplis pietiek, lai to atkārtotu; salīdzinājumiem vajadzīgi divi).

## Atkārtojuma režīmi {#replay-modes}

Kā katra apļa pašu laiks seko no pulksteņa:

| Režīms | Katra apļa laiks | Ko rāda |
|---|---|---|
| **No starta** (`start`) | pats pulkstenis | katrs aplis no sava starta: sacensības starp tiem, starpība aug, kā tā notika uz trases |
| **Vienā līnijā** (`anchor`) | pulkstenis plus apļa nobīde | katrs auto tajā pašā vietā tajā pašā brīdī, tad palaists — kas notiek no šī punkta, nevis no apļa sākuma |
| **Blakus** (`locked`) | laiks, kad aplis sasniedza atsauces pašreizējo attālumu | katrs auto turēts atsauces attālumā visu apli: ātrumi un ievades salīdzinātas metru pa metram |

Lietojiet to, kad:

- **No starta**: vēlaties redzēt, kas ir priekšā un kā starpība aug.
- **Vienā līnijā**: vēlaties zināt, kas notiek vienā līkumā vai vienā taisnē, ar visiem sākot tur vienādi.
- **Blakus**: vēlaties salīdzināt, ko vadītāji dara ar pedāļiem un stūri vienā un tajā pašā vietā trasē.

**Nobīdes *Vienā līnijā*:** enkuram `s` metros pa atsauci katra apļa nobīde ir tā paša laiks pie `s` mīnus atsauces laiks pie `s`, abi nolasīti no izlīdzinātajiem apļiem (skatiet [vienu distances asi](race-corner-analysis.md#one-distance-axis)). Aplis, kas neaptver `s`, paliek ar nobīdi 0. Izvēloties *Vienā līnijā* no režīmu pogām, enkurs tiek novietots atsauces pašreizējā attālumā.

Balts stabs ar karogu (14 m augsts) atzīmē enkuru režīmā *Vienā līnijā*.

### Izlīdzināšana {#lining-up}

| Darbība | Enkurs | Pulkstenis |
|---|---|---|
| **Nolikt līnijā šeit** | kur atsauce ir tagad | nemainīts |
| Shift+klikšķis uz diagrammām | noklikšķinātais metrs | 1,5 s pirms atsauce to sasniedz |
| atradums sadaļā *Kur uzlabot*, numurēts marķieris uz trases, *Līkums pa līkumam* rinda ar atradumu | 40 m pirms vietas, kur sākas atradumā cēlonis | 1,5 s pirms šī punkta; tad atskaņo |
| automašīnas vadības notikums, sadursmes etiķete | 40 m pirms notikuma | 1,5 s pirms; tad atskaņo |
| aplis trases statistikā | kā tā atradums vai notikums | kā augstāk, ar šo apli fokusētu |

Atradumu aplūkojot, kamera to arī ieskauj — bumba ap atradumu diapazona vidu, rādiuss lielāks no 40 m un puse no tā garuma plus 30 m (60 m notikumam) — ja vien kamera nesekot auto.

### Sekošanas kamera {#chase-camera}

⌖ lapas sarakstā liek kamerai sekot šim auto: 2,5 + 4 × auto izmērs metru aiz tā un 0,9 + 1,1 × auto izmērs metru virs, skatoties uz tā braukšanas virzienu, noliekta uz leju pret auto, izlīdzināta (20% ceļa katrā kadrā), lai tā netrīc ar katru svārstību. ⌖ vēlreiz to atbrīvo. Sekotais auto tiek zīmēts mazliet gaišāks, ar baltu gredzenu uz zemes, un tā kartīte ir izcelta.

## Skata sadaļa {#the-view-section}

| Vadība | Noklusējums | Dara |
|---|---|---|
| **Līnijas** / **Laika karte** / **Cēloņu karte** / **Kļūdu karte** | Laika karte | kas tiek nokrāsots gar trasi (zemāk); *Līnijas* neko nekrāso |
| leģenda | - | *ieguvumi ↔ zaudējumi* laika kartei, cēloņu krāsas cēloņu kartei, *maz apļu ↔ visvairāk apļu* kļūdu kartei |
| **Izbrauktās līnijas** | ieslēgts | katras redzamā apļa līnija tā krāsā |
| **Auto** | ieslēgts | automašīnas un HUD kartīšu avoti |
| **Riepas un piekare** | ieslēgts | riepu temperatūra, slīdes gredzeni, piekares stienīši un citi glifi pa riteni, un jumta lampas uz automašīnām |
| **Etiķetes** | ieslēgts | līkumu nosaukumi, numurēti marķieri, sadursmju etiķetes, kļūdu kartes līkumu etiķetes |
| **Trase no apļiem** | ieslēgts | ceļa virsma kursam bez izvilkta trases modeļa (paslēpts, kamēr ielādēts trases modelis) |
| **Visas vērtības kartītēs** | izslēgts | katrs kanāls, kas uzskaitīts uz katras HUD kartītes |
| **Automašīnu īstās formas** | ieslēgts | katra automašīna tās atbilstošā formā (skatiet [Automašīnas](#the-cars)); izslēgts: atvērtā vienvietīgā, kas nekā neslēpj no telemetrijas |
| **Auto izmērs** | 1× | no 1× līdz 10× soļos pa 0,5; 1× ir automašīnas īstais izmērs, tik gara un plata, cik tā ir spēlē. Neko citu nemaina tikai šis slīdnis |

## Izbrauktās līnijas {#driven-lines}

Katras redzamā apļa ceļš caur tā paša paraugiem tā krāsā, zīmēts 0,12 m zem ierakstītās pozīcijas (automašīnas ierakstītā pozīcija ir tās atsauces punkts, 0,28 līdz 0,47 m virs ceļa izvilktās Forza trasēs). Viens punkts tiek saglabāts ik pēc 1,5 m; ar vairāk nekā 10 redzamiem apļiem apļi, uz kuriem neskatās, saglabā ik pēc 6 m (katrs virsotne tiek nosūtīta uz GPU katrā kadrā).

## Kartes {#the-maps}

Visas trīs ir lentes gar **atsauces** ceļu, 0,2 m zem ierakstītajām pozīcijām, viens četrstūris uz katru 2 m režģa soli.

### Laika karte (`where`) {#time-map-where}

Fokusētam aplim: sekundes, ko iegūts vai zaudēts uz metru pret apli, ar ko tas tiek salīdzināts šajā punktā (labākais no savas klases, vai atsaucei — ātrākais cits aplis katrā segmentā), no izlīdzinātās starpības izmaiņas uz režģa soli, izlīdzināta ±10 m. Sarkana tur, kur zaudē laiku, zaļa, kur iegūst, pelēka starp; krāsu skala ir absolūto vērtību 95. procentile, tāpēc smailes tiek apgrieztas un lielākā daļa apļa ir diapazonā. 6 m plats.

### Cēloņu karte (`why`) {#cause-map-why}

Fokusētam aplim: katrs zaudējums nokrāsots pāri diapazonam, kur ir tā **cēlonis** (nevis kur parādās laiks), krāsots pēc cēloņa grupas, dārgākajam atradumam uzvarot, kur divi pārklājas. Platums `3 + 9·√(izmaksas / lielākās izmaksas)` metri; kur nekas nav zaudēts, pelēka 2 m josla. Atradums, kas izvēlēts sadaļā *Kur uzlabot*, ir nokrāsots baltā krāsā.

| Grupa | Krāsa | Atradumi |
|---|---|---|
| bremzēšana | oranža | braukšanas zaudējumi bremzēšanas fāzē |
| ieeja | magenta | braukšanas zaudējumi ieejā un caur vidu |
| izeja | zila | braukšanas zaudējumi izejā |
| taisne | dzeltena | braukšanas zaudējumi uz taisnes |
| auto | pelēka | ko skaidro auto |
| apstākļi | tumši pelēka | situācija (sacensību starts pret lidojošu apli) |

### Kļūdu karte {#mistake-map}

Cik no visiem apļiem (trases statistikā izvēlēto klašu) pieļāva kļūdu katrā metrā — jebkāda veida, vai tikai to, kas izvēlēts statistikā. Katrs aplis skaitās vienu reizi katrā metrā; katras kļūdas diapazons tiek paplašināts par 6 m katrā pusē, lai īsa būtu redzama. Platums `3 + 10·(apļi / visvairāk apļu)` metri un krāsa no blāvi brūnas līdz spilgti oranžai; pelēka 2 m vietās, kur neviens aplis nekļūdījās. Skatiet [Trases statistika](race-course-statistics.md#the-mistake-map).

## Trase no apļiem {#track-from-the-laps}

Spēlei, kuras trase nav izvilkta, zem līnijām tiek zīmēts ceļš: tik plats, cik apļi izkliedējas pāri atsaucei (sānu nobīdes 25 m robežās skaitās) plus 2 m katrā pusē, vismaz 4 m katrā pusē no atsauces līnijas, izlīdzināts ±8 režģa punktos (±16 m), asfalta pelēkā krāsā ar vieglām malu līnijām, 0,3 m zem ierakstītajām pozīcijām. Paslēpts, kamēr *Līmenī* ielādēts trases modelis.

## Sadursmes un avārijas uz trases {#hits-and-crashes-on-the-track}

Katra redzamā apļa sadursmes un avārijas (skatiet [Automašīnas vadības notikumi](race-control-events.md#hits-and-crashes)) tiek atzīmētas tur, kur tās notika, kad vien līnijas vai auto ir zīmēti: smailots zvaigznes simbols — sarkans avārijai, dzintara sadursmei — uz staba, ar gredzenu apļa krāsā tā pamatnē, izmērs atbilst auto izmēram (avārijas lielākas). Kad auto pāriet pār sadursmes brīdi, no tās 0,8 s izplatās trieciena gredzens.

## Palīdzības režīms {#help-mode}

**?** blakus valodas izvēlei vai taustiņi **?** vai **F1** ieslēdz atslēgu katrai krāsai ekrānā, visās trijās cilnēs ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Izvēle paliek šajā pārlūkā.

- **Atslēga** skata stūrī uzskaita krāsas cilnei un režīmam, kas tiek lietots. Katra skala nāk no tā, no kurienes skats to iegūst, tāpēc rediģēta siltuma skala parādās kā rediģēta. Sacīkšu cilnē uzskaitīts tikai tas, ko ielādētie apļi satur.
- **Katras automašīnas kartīte** iegūst tabulu ar to, kas uzzīmēts uz tās riteņiem, pēc nosaukuma, ar katra riteņa vērtību krāsā, kādā tā ir zīmēta.
- **Automašīna fokusā** saņem etiķeti pie katra riteņa ar to pašu, novietotu stūros. Paslēpta, kad automašīna ir pārāk maza ekrānā, lai tās ietilptu.

## Automašīnas {#the-cars}

**Katra automašīna savā formā**, tās apļa krāsā un īstajā izmērā. Formas nāk no automašīnu faila, kas reiz izveidots mašīnā, kur ir spēle:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bez tā katra automašīna tiek zīmēta kā **skatītāja pašas automašīna** savā tipā un laikmetā: sedans, kupeja, hečbeks, universāls, sporta auto, supermašīna, muscle car, apvidus auto, pikaps, furgons vai mikroauto, katrs kā klasika (pirms 1980), 80. un 90. gadu vai mūsdienu ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Tās ir veidotas šeit no vispārīgām proporcijām: nav logotipu, nav modeļu nosaukumu un nekas no jebkuras spēles failiem, tāpēc tās tiek piegādātas kopā ar skatītāju. Tips nāk no automašīnas nosaukuma, laikmets no tajā esošā gada; automašīna bez abiem tiek ņemta pēc tās klases. Ap simts reālām paaudzēm ir zināmas pēc to publicētā garuma, platuma, augstuma un riteņbāzes ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); katrs vienā rindā, noapaļots), tāpēc 1990. gadu 3 sērijas BMW iegūst tās automašīnas izmēru un stāju, joprojām kā vienkāršu formu bez emblēmas vai režģa.

Automašīnu fails tiek veidots jūsu pašu mašīnā no jūsu pašu spēles kopijas. Tajā ir katras automašīnas zemas detalizācijas modelis, aptuveni 900 trijstūru, ar tās riteņu pozīcijām (skatiet [izvilcēja `cars` komandu](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Ielādēt automašīnu failu...** skata iestatījumos vai faila nomešana uz sacīkšu cilnes ielādē to; tas paliek šajā pārlūkā. Tajā ir spēles formas, tāpēc tas nav nododams tālāk, un skatītājs nekādus nepiegādā.

Kura automašīna aizvieto apļa auto, tiek noteikts no tā, kas ir ielādēts katru reizi, un nekad netiek glabāts, tāpēc automašīna bez šodienas līdzinieka iegūst savu, tiklīdz jaunāks fails to satur ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Apļa automašīna | Zīmēta kā |
|---|---|
| tās numurs ir failā tai pašai spēlei | tieši šī automašīna |
| tā pati marka un modeļa vārds nosaukumā | šis modelis, tuvākais gados |
| tā pati marka, tā pati paaudze | tās markas automašīna, tuvākā gados |
| citādi, ar automašīnu failu | tās pašas markas tuvākā, ja tāda ir, citādi tāds pats kermeņa tips, tuvākais gados |
| atklātas riteņu automašīnas pēc nosaukuma | zemāk esošais vienvietīgais |
| nekas no pirmajiem diviem, un skatītājs automašīnu zina pēc tās izmēra | skatītāja pašas automašīna šī reālā auto izmērā, ar failu vai bez faila |
| jebkas cits bez faila | skatītāja pašas automašīna tādā tipā un laikmetā |

Tātad apļš citas spēles 1990. gada BMW 3 sērijas automašīnā rāda BMW apmēram šajā gadā, un automašīna, kas jaunāka par failu, rāda savu tuvāko radinieku, līdz fails tiek veidots no jauna. Apļa rīka padoms un rinda zem automašīnas izmēra fokusētam aplim saka, kā tā tiek zīmēta un cik tuvu tas ir.

Skatītāja pašu automašīnām ir tumši logi. Automašīnas faila modeļi ir viena krāsa visur, jo failā nav krāsas vai stikla. Riteņi, aizmugures lukturi, lampas un telemetrijas glifi tiek zīmēti kā vienvietīgajam; piedziņas stienis iet augšā pa riteņa ārpusi, kur to var redzēt, un ikri ir izlaisti.

**Vienvietīgais** ir atklāts riteņu auto apļa krāsā, tāpēc priekšpuse ir acīmredzama no jebkura leņķa un nekas nenoslēpj riteņus: monokoks, motora pārsegs, sānu korpusi, kabīne ar ķiveri, halo, grīda, priekšējais un aizmugurējais spārns; četri apaļi riteņi, priekšējie pagriezti ar stūri (līdz 0,5 rad pilnā pagriezienā), katrs uz diviem svira-balstiem ar stūri, šķērsstieni (priekšā) vai piedziņas vārpstu (aizmugurē) un piedziņas stienis. Modelis ir nolaists par 0,3 m zem ierakstītās pozīcijas, lai tā riteņi atrastos uz ceļa, un mērogots ar **Auto izmērs**.

**Virsbūve kustas uz saviem atsperēm:** kad apļam ir visas četras balstiekārtas nobīdes, katrs stūris nolaižas par savu nobīdi (pārspīlēts līdz 0,12 m no pilnas atslogošanas līdz pilnai saspiešanai, lai tas būtu redzams no sekošanas kameras), un virsbūve nogrimst, sašķiebjas un velkas plaknē caur visiem četriem.

**Ko zīmē no telemetrijas** (ar ieslēgtu *Riepas un piekare*) seko [kanālu tabulai](race-charts-and-hud.md#the-channel-table):

| Glifs | No | Zīmējums |
|---|---|---|
| riepas krāsa | `tireTemp` | pati riepa, zila auksta → ciāna → zaļa darba → dzeltena → sarkana karsta, 40-130 °C |
| slīdes gredzens | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (lielākais) | gredzens uz zemes zem riteņa, zaļš ar saķeri rokā, dzintars pie 0,66, sarkans pie 1 (saķeres mala, kā to ziņo spēle); vāja zem 0,3 |
| balstiekārtas josla | `suspension` (0..1) | stienis krāsots pēc nobīdes: zils izstiepts, balts vidū, sarkans saspiests |
| bremzes spīdums | `brakeTemp` (100-900 °C) | disks uz riteņa ārējās virsmas, tumšs līdz oranžam |
| nodiluma josla | `tireWear` (0..1) | josla ap protektora malu, balta jauna → sarkana nodilusi |
| slodzes josla | `wheelLoad` (0-12 000 N) | stabs blakus riteņam, tik augsts kā slodze |

Bremžu gaismas (lietus gaisma un spārna gala plāksnes) iedegas ar bremzes pedāli. Katrs `lamp` kanāls, kas ir ieslēgts (virs pusi no sava diapazona), iedegas lampa virs gaisa ieplūdes ar savu krāsu: ABS darbojas, vilces kontrole darbojas, DRS, boksa ierobežotājs, rokas bremze, gaisā.

**Pūlī** (vairāk nekā 10 redzamām), automašīnas, uz kurām neskatās, tiek zīmētas vienkārši: kermenis, spārni, riteņi un bremžu gaisma tikai.

## Etiķetes {#labels}

Piestiprinātas pie trases un novietotas katrā kadrā no kameras projekcijas (ārpus ekrāna vai aiz kameras — paslēptas). Ar ieslēgtām **Etiķetēm**:

| Etiķete | Kur | Klikšķis |
|---|---|---|
| līkumu nosaukumi (`T1`, `T2` …) | virs katra līkuma apeksa uz atsauces | - |
| numurēti marķieri 1-5 | fokusētā apļa piecas lielākās braukšanas zaudējumi, katra cēloņa diapazona vidū, apmalots cēloņa krāsā; uzvelciet kursoru, lai redzētu nosaukumu un izmaksas | izlīdzināt un atkārtot šo atradumu |
| sadursmju / avāriju etiķetes | virs katra uzliesmojuma **fokusētajam** aplim: "Avārija −45 km/h" / "Sadursme −12 km/h"; uzvelciet kursoru, lai redzētu pilnu aprakstu un padomu | izlīdzināt un atkārtot triecienu |
| kļūdu kartes līkumu etiketes (vietā līkumu nosaukumiem un marķieriem, kad karte ir kļūdu karte) | katra līkuma apekss: "T3 · 5/40 agrīna bremzēšana" (visbiežākā kļūda, apļi, kuri to pieļāva / apļi, kas brauca līkumu), "T3 · 5/40", kad izvēlēts viens veids, "T3 · tīrs", kad nav izvēlēts neviens; uzvelciet kursoru, lai redzētu līkuma zaudējumus un piecas biežākās kļūdas | atvērt vai aizvērt šo līkumu trases statistikā |

## Spoguļotas pasaules {#mirrored-worlds}

Skatītāja pasaule ir labās rokas sistēmā ar Y uz augšu: skatoties no augšas, auto, kura braukšanas virziens `atan2(dx, dz)` pieaug, pagriežas pa kreisi. Spēle ar kreisās rokas pasauli — starp tām Forza — nāk spoguļota: katrs labās puses līkums tiek zīmēts kā kreisās puses līkums, gan trase, gan apļi.

Apļi to paši saka ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): ejot pa katru apli pa dažiem metriem (3 m) vienlaikus, tā ceļa pagriešanās tiek salīdzināta ar ārējās balstiekārtas saspiešanu (`suspension.FR` mīnus `suspension.FL`) un, bez piekārtas, ar stūri (pozitīvs pa labi katrā adapterī). Aplis, kas pagriežas mazāk nekā π kopā, neko nesaka; pierādījums skaitās, kad pārsniedz 2% no pagriešanās. Apļi balso; neizšķirts ir "nevar pateikt".

Kad apļu spriedums nesakrīt ar pašreizējo ass apgriešanu (nepāra skaits apgriezto asu **Kamera un skats → Apgriezt pasaules asi**), sadaļa **Apļi** to saka zem saraksta:

- spēle ir spoguļota un nekas nav apgriezts: "Šie apļi stūrē pa labi, kur trase ir zīmēta pa kreisi …" ar **Apgriezt X**;
- asis ir apgrieztas, bet apļi nav spoguļoti: "Apgrieztās asis zīmē šos apļus spoguļotus …" ar **Atiestatīt asis**.

Mainās tikai zīmējums — atspulgs, kas iesaistīts skata matricā; dati, analīze un katra koordināte, ko rāda rīki, paliek paša spēles. Apgriešana tiek glabāta pārlūkā. Analīze nosauc līkumus pa kreisi vai pa labi ar to pašu mērījumu (nezināma pasaule tiek ņemta kā spoguļota, kā tā ir Forza).


## Izstrādātājiem {#for-developers}

Kods: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Kas auto ir noteiktā brīdī {#what-a-car-is-at-a-moment}

`stateAt` interpolē katru kanālu starp diviem paraugiem ap apļa laiku. Kanāli, kas soļo (pārnesums, karogi), ņem tuvāko paraugu. Aplis, kas ir beidzies, apstājas uz līnijas.

**Virziens.** Braukšanas virziens nāk no pozīcijām, kas ir dažus metrus atstatu (vismaz 2 m katrā pusē, lai svārstība nepagrieztu auto). Ķermeņa virziens nāk no spēles yaw tikai tad, kad tas ir piemērots braukšanas virzienam — zīme un nobīde, pēc cirkulārā vidējā pār paraugiem, kas ātrāki par 10 m/s (vismaz 20) — un tikai tad, ja tas tad sakrīt ar to (cirkulārā dispersija zem 0,05, ap 18° izkliedes); citādi ķermenis vērsts pa braukšanas virzienu. Tas saglabā slīdi redzamu (ķermenis un ceļš atšķirīgi), neuzticoties spēles leņķa konvencijai.

**Stūre un puses.** To, kurā virzienā pozitīvs stūrēšanas pagrieziens pagriež auto, un kurā pusē spēles labie riteņi pieder, mēra no apļa: stūre pret ceļa pagriešanos, un kura puse balstiekārtas saspiežas pa ārpusi līkumiem (bez piekārtas datiem Forza spēles tiek ņemtas kā spoguļotas).
