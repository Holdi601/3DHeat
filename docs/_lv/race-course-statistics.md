---
title: "Trases statistika"
parent: "Sacīkšu analīze"
nav_order: 57
lang: "lv"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Trases statistika

Ielādējiet daudzus vienas trases apļus, un skatītājs saskaita kļūdas: kurš līkums maksā visvairāk laika, cik no apļiem tur kļūdījās un kāpēc. Izmantojiet to, lai atrastu līkumu, kas ir vērts trenēšanās.

Izmēģiniet: **Demo apļi** dod trīs apļus, pietiekami, lai šī sadaļa parādītos.

![Trases statistika ar kļūdu karti: trase nokrāsota pēc tā, cik apļi zaudēja laiku katrā līkumā, un līkumu saraksts](../assets/img/en/race-course-mistake-map.webp)

Ielādējiet visu trases mapi — desmitiem apļu, vairākus auto, vairākas veiktspējas klases — un katrs aplis tiek novērtēts un tad saskaitīts. Šī lapa aplūko salīdzinājumu pa klasēm, ko uzskata par kļūdu, sadaļu **Trases statistika**, kļūdu karti, siltumkartes eksportu, vairāku trašu trases un veiktspējas ierobežojumus ar daudziem apļiem.

## Pret savas klases labāko {#against-the-best-of-its-own-class}

Aplis tiek salīdzināts līkumu pa līkumam ar **ātrāko pilno apli savā veiktspējas klasē** (atsauci, atsauces klasē); pats šis aplis — ar to no savas klases, kas bija ātrākais katrā līkumā, vai ar katru apli, ja tas ir vienīgais savā klasē. Auto tiek grupēti pēc spēles veiktspējas klases (Forza gadījumā D līdz X; C un S2 ir divas no tām). C klases auto bremzēšanas punkts pret S2 auto nerāda neko par braukšanu. Laika karte, atstarpes apļu sarakstā un tabula *Līkums pa līkumam* seko tam pašam salīdzinājumam (skatiet [ar ko katrs aplis tiek salīdzināts](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistika ir veidota uz katra apļa analīzes, nevis blakus tai.

## Kas tiek uzskatīts par kļūdu {#what-counts-as-a-mistake}

**Gadījums** ir viena apļa kļūda vienā līkumā (segmentā). Apļa kļūdas līkumā ir šādas:

1. **Braukšanas cēlonis**, ko analīze atrada tā zaudējumam tur — atradums, kas ir zaudējums, un ko var attiecināt uz vadītāju (nevis auto vai situāciju), un kas maksā **0,05 s** vai vairāk salīdzinājuma aplī. Tā izmaksa ir līkuma zaudējums.
2. **Katra auto vadības kļūda**, ko tas tur izdarīja un kuru otrs aplis neizdarīja (nedalīta), kas maksā **0,03 s** vai vairāk — bloķēšana, riteņu slīdēšana, aizmugurē izslīdēšana, spiešana, griešanās. Tās izmaksa ir paša notikuma.
3. **Katrs trāpījums un avārija**, vai kopīgs vai nē, neatkarīgi no tā, cik tie maksāja.

Vienā līkumā var būt vairāki; katrs veids tiek saskaitīts **vienu reizi uz apli un līkumu**. Ieguvumi, auto daļa un lēnāka ierašanās, ko jau noteica iepriekšējais līkums, nav kļūdas.

### No atradumiem līdz kļūdām {#from-findings-to-mistakes}

| Atradums | Kļūda |
|---|---|
| par ātru iekšā, lēns ārā, no bremzēšanas vairākus metrus vēlāk nekā otrs | Bremzēja par vēlu |
| bremzēja agri | Bremzēja par agri |
| bremzēja maigi | Bremzēja pārāk maigi |
| bloķēšana kā cēlonis | Bloķēja riteni |
| brauca ar atlaistu gāzi | Brauca ar atlaistu gāzi |
| pieejama saķere, lēnāk līdz virsotnei, bremzēja tur, kur otrs tikai atlaida | Pārāk lēns vidū |
| pārāk strikta līnija | Pārāk strikta līnija |
| izspiests platāk | Izspiests platāk |
| pagrieza auto mazāk / par tālu | Pagrieza auto nepareizi |
| gāzi pieliek vēlāk, pilnu gāzi vēlāk, svārstījās | Gāze vēlu |
| lēnāk ārā no līkuma | Lēnāk ārā |
| riteņu slīdēšana | Riteņu slīdēšana |
| aizmugure izslīdēja, sāniski vidū | Aizmugure izslīdēja |
| aizbrauca platāk | Aizbrauca platāk |
| nomēra ātrumu | Nomēra ātrumu |
| atlaida (ieejot vai taisnē) | Atlaida |
| gandrīz apstājās, griezās, trāpīja vai avārija kā cēlonis | Griezās / Trāpīja kaut ko / Avarēja, kad apļa notikumi tur to norāda (vispirms avārija, tad griešanās, tad trāpījums); citādi Gandrīz apstājās |
| garāks lidojums | Lidoja par tālu |

Divi šablons tiek skaitīti kā cēlonis, kas atrasts to iekšienē, pēc tās pašas tabulas. *Iedeva vairāk ieejot, nekā izeja atguva* ir tā ieraksta cēloņa kļūda: agra bremzēšana ir *Bremzēja par agri*, bloķēšana — *Bloķēja riteni*, atlaišana — *Brauca ar atlaistu gāzi*, neizmantots saķeres pārpalikums — *Pārāk lēns vidū*. *Par ātru iekšā, lēns ārā* ir *Bremzēja par vēlu*, ja aplis bremzēja vēlāk nekā otrs; citādi tā ieejas cēloņa kļūda — *Gāze vēlu*, *Riteņu slīdēšana*, *Aizmugure izslīdēja*, *Aizbrauca platāk*, *Lēnāk ārā*. Šablons, kura cēlonis ir auto, vai lēnāka ierašanās, netiek skaitīts.

Netiek skaitīts: lēnāka ierašanās, starts, katrs *auto* atradums (vilkme, saķere, bremzes, piedziņa) un katrs ieguvums vai labs līkums.

### Veidi to secībā {#the-kinds-in-their-order}

Bremzēšana: *Bremzēja par vēlu*, *Bremzēja par agri*, *Bremzēja pārāk maigi*, *Bloķēja riteni*. Ieeja: *Brauca ar atlaistu gāzi*, *Pārāk lēns vidū*, *Pārāk strikta līnija*, *Izspiests platāk*, *Pagrieza auto nepareizi*. Izeja: *Gāze vēlu*, *Lēnāk ārā*, *Riteņu slīdēšana*, *Aizmugure izslīdēja*, *Aizbrauca platāk*, *Nomēra ātrumu*. Taisne: *Atlaida*. Incidenti: *Griezās*, *Trāpīja kaut ko*, *Avarēja*, *Gandrīz apstājās*, *Lidoja par tālu*.

## Trases statistikas sadaļa {#the-course-statistics-section}

Rāda no **3** apļiem, starp **Apļi** un **Kur uzlaboties**.

- **Kopsavilkums**: "40 apļi 9 auto, 3 klases: katrs novērtēts līkumu pa līkumam pret ātrāko apli savā klasē." (auto skaita pēc auto numura vai nosaukuma).
- **Klašu mikroshēmas** (ar vairākām klasēm): **Viss** un viena mikroshēma katrai klasei, katra ar savu apļu skaitu, spēles secībā (D, C, B, A, S1, S2, R, X, tad citas). Noklikšķiniet uz klases, lai redzētu tikai tās apļus; **Shift+klikšķis** pievieno vai noņem vienu. Viss zemāk — saraksti, karte, siltumkartes eksports — seko izvēlētajām klasēm.
- **Visbiežāk noiet greizi**: katra kļūdas veids, vispirms tie, kuriem ir visvairāk apļu (tad vairāk reižu, tad lielākas izmaksas), ne vairāk kā 8 (**Visi N veidi** rāda pārējos, **Mazāk** tos atkal paslēpj). Katrā rindā: tās nosaukums, "N no M apļiem", šīs daļas josla un "K reizes · ap X s · visvairāk T3 (5), T7 (4), T1 (2)" — cik bieži tā tika izdarīta (pa apļiem līkumā), cik tā kopumā maksāja un trīs līkumi, kuros visvairāk apļu to izdarīja. **Noklikšķiniet uz rindas**, lai to parādītu kļūdu kartē (un ieslēgtu karti); vēlreiz noklikšķiniet, lai redzētu katru kļūdu.
- **Līkums pa līkumam** (vai *Līkums pa līkumam - <kļūda>* ar izvēlētu): pa segmentiem, "N no M zaudēja laiku · X s" — apļi, kas nobrauca visu līkumu, tie, kas tur zaudēja **0,05 s** vai vairāk pret savas klases labāko, un viss zaudētais laiks. Salocīts, tajā uzskaitītas trīs biežākās kļūdas ar to apļu skaitu. **Noklikšķiniet uz līkuma**, lai to atvērtu, ietvertu ar kameru un pārslēgtos uz kļūdu karti: katrai kļūdai (vai tikai izvēlētajai) rāda rindu, piemēram, "12 no 40 apļiem šeit bremzēja pārāk agri. 9 dažādos auto — ap 0,21 s katrs." un apļus, kas to izdarīja, **sliktākais pirmais**, katram ar tā izmaksu — ne vairāk kā 8, "+N vēl" pārējiem. **Noklikšķiniet uz apļa**, lai to fokusētu un atskaņotu šo kļūdu (saskaņotu 40 m pirms tās).
- **Rādīt siltumkartē**: skatiet zemāk. "Veido siltumkarti…", kamēr tas notiek; atspējots, kad kļūdu nav.

## Kļūdu karte {#the-mistake-map}

**Skats → Kļūdu karte** nokrāso pa atsauces ceļu, cik no apļiem (izvēlētajām klasēm) kļūdījās katrā metrā — visu veidu vai to, kas izvēlēts statistikā. Katrs aplis skaitās vienu reizi katrā metrā; katras kļūdas diapazons (kur bija tās cēlonis vai notikums) tiek paplašināts par 6 m katrā pusē, lai īsa kļūda būtu redzama. Jo platāk un spilgtāk, jo vairāk apļu tur kļūdījās: platums `3 + 10 · (apļi šeit / visvairāk apļu jebkur)` metri, krāsa no blāvi brūnas līdz spilgti oranžai; pelēka 2 m josla, kur neviens nekļūdījās. Leģenda: *maz apļu ↔ visvairāk apļu*.

Ar ieslēgtām **Etiķetēm** katra līkuma virsotnē ir tā biežākā kļūda: "T3 · 12/40 agra bremzēšana" (apļi, kas to izdarīja / apļi, kas brauca līkumu), "T3 · 12/40", ja izvēlēts viens veids, "T3 · tīrs", ja neviens. Uzvedot uz etiķetes, uzskaitīti līkuma zaudējumi un tā pieci biežākie kļūdu veidi; noklikšķinot uz tās, statistikā līkums tiek atvērts vai aizvērts.

## Rādīt siltumkartē {#show-in-the-heatmap}

**Rādīt siltumkartē** nodod to pašu cilnei Siltumkarte kā datu kopu ar nosaukumu "Kļūdas uz <trase>" (vai "Kļūdas trasē"), tāpēc viss siltumkartes rīku komplekts — siltuma režīmi, filtri, laika skala, griešana — darbojas ar to, kur apļi kļūdās.

Tā ir CSV, kas veidota atmiņā (`mistakeTable`), viena rinda katram režģa punktam (katrs 2 m) katram gadījumam, pie **paša apļa pozīcijas** tur:

| Kolonna | Saturs |
|---|---|
| `x`, `y`, `z` | apļa pozīcija šajā metrā (spēles koordinātes) |
| `elapsed` | apļa laiks tur, s |
| `lap` | apļa etiķete |
| `car` | auto nosaukums (vai "car 1234") |
| `mistake` | kļūdas nosaukums tekošajā valodā |
| `car_class` | klase, `-`, ja nav |
| `corner` | līkuma etiķete, `T3` |
| `cost` | gadījuma izmaksa, s |

To ielādē caur siltumkartes pašu ielādētāju ar kartēšanas norādēm: Y augšā, bez ass apgriešanas, mērogs 1; laiks `elapsed` sekundēs; **persona** = `car`, **grupa** = `mistake`, **sesija** = `lap`; bez skata virziena; `car_class`, `corner` un `cost` paturēti kā filtra kolonnas. Cilne tad pārslēdzas uz **Siltumkarte** un ietver datus kadrā. Eksportē tikai statistikā izvēlētās klases.

## Vairāku trašu trases {#courses-from-several-tracks}

Apļi tiek analizēti **pa vienai trasei**. Mape ar vairāku trašu apļiem — viss apļu katalogs — piedāvā katru trasi ielādēt atsevišķi (ar tās apļu skaitu, vispirms lielākā); apļi no nepabeigtiem braucieniem (FH Companion `unfinished/`) iet kopā ar savu trasi, atzīmēti kā *daļējs*. Izvēlētu failu apļi no vairākām nosauktām trasēm tiek piedāvāti tāpat, un apļi, kuriem nav nosaukta trase, iet pie tās, kas izvēlēta. Ielādējot apļus citai nosauktai trasei nekā tās, kas jau ielādētas, tie aizstāj tos. Sīkāk: [Apļu ielāde](race-loading-laps.md#folders-and-courses).

## Veiktspēja ar daudziem apļiem {#performance-with-many-laps}

Desmiti apļu tiek analizēti sekundē vai divās (visi, vienmēr). Tas, kas tiek zīmēts, ir ierobežots, lai skats paliktu kadru ātrumā:

| Ierobežojums | Vērtība | Ietekme |
|---|---|---|
| apļi, kas zīmēti pēc noklusējuma | 8 (`SHOW_ALL_UP_TO`) | pāri 8 ielādētiem apļiem jaunie pievienotie apļi ir paslēpti, ja vien tie nav atsauce, fokusētais aplis vai labākais savā klasē. **Rādīt visus** zīmē katru apli; **Tikai aplūkotos** atgriež. Apļa fokusēšana to atklāj un atklāj arī tā klases labāko |
| vienkārši auto un plānas līnijas | vairāk nekā 10 redzami (`PLAIN_PAST`) | apļi, kas nav fokusētais, vajātais auto un atsauce: līnijas punkts katrs 6 m (nevis 1,5 m), auto zīmēti vienkārši |
| apļi diagrammā | 8 (`CHART_LAPS`) | vispirms fokuss, tā klases labākais un atsauce; "+N vēl zīmēti, nav diagrammā" |
| HUD kartītes | 6 | pirmie seši redzamie apļi |
| statistika | no 3 apļiem | sadaļa ir paslēpta zemāk |
| uzskaitītie atradumi | 12 vadītājam, 8 auto/konteksta, 10 ieguvumi | uz fokusēto apli |
| auto pāri, kas rādīti | 3 | pāri 3 pāriem — viens pāris ar izvēlētāju |

Kļūdu gadījumi tiek aprēķināti vienreiz katrā analīzē un saglabāti kešatmiņā; kļūdu kartes blīvums tiek saglabāts kešatmiņā katrai klašu izvēlei un kļūdai.

## Izstrādātājiem {#for-developers}

Kods: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` in [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
