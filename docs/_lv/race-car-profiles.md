---
title: "Automašīnu profili un salīdzinājums"
parent: "Sacīkšu analīze"
nav_order: 56
lang: "lv"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Automašīnu profili un salīdzinājums

Auto var bremzēt, pagriezties un paātrināties tikai tik stipri. Skatītājs mēra, cik stipri, pēc jūsu pašu apļiem, tāpēc tas nekad neliek jums darīt to, ko jūsu auto nevar. Tas arī izskaidro, cik no zaudētās sekundes bija auto vaina un cik - jūsu.

![Salīdzinātas automašīnas: divas automašīnas līdzās ar to sakeri, bremzēšanu un vilci](../assets/img/en/race-cars-compared.webp)

Analīze liek aplim bremzēt stiprāk, nest vairāk ātruma vai paātrināties agrāk tikai tur, kur automašīna to ir parādījusi, un no zaudējuma izņem to, ko pašas automašīnas izskaidro. Tāpēc katras automašīnas robežas (tās *aploksne*, zemāk) un raksturs (tās *profils*) tiek izmērīti no katra tās ielādētā apļa. Šī lapa aptver aploksni, profilu, sadaļu **Salīdzinātās automašīnas** un to, ko automašīnas nosaka katrā stūrī.

**Viena automašīna** = apļi ar to pašu automašīnas numuru (vai nosaukumu, bez numura) un to pašu veiktspējas indeksu: cita regulēšana ir cita automašīna.

## Aploksne: ko automašīna var katrā ātrumā {#the-envelope-what-the-car-can-do-at-each-speed}

Katrai automašīnai, pār visiem tās ielādētajiem apļiem, **5 m/s ātruma joslās** (24 joslas, līdz 120 m/s). Izslēgti ir paraugi gaisā, 0,3 s nostabilizēšanās pēc nolaišanās un no 0,1 s pirms katra trieciena līdz 1 s pēc tā, un paātrinājumi, kas ir 80 m/s² vai vairāk, tiek ignorēti (augstāk par to, ko notur jebkura auto ar spiedienu uz leju).

| Aploksne | Paraugi | Vērtība uz joslu | Vajag |
|---|---|---|---|
| **sānu sakere** | sānu paātrinājums, **turēts pusi sekundes** (tā absolūtās vērtības vidējais centrētā 0,5 s logā), tikai tur, kur auto stūrēja: vismaz trešdaļa no visa tā 99. procentiles | 95. procentile | 6 paraugi |
| **bremzēšana** | bremze > 0,3; garenvirziena paātrinājums kā katra parauga un tā diviem kaimiņiem mediāna | 95. procentile no palēninājuma | 4 paraugi |
| **pilnas gāzes vilce** | gāze > 0,95, bremze zem 0,05; tā pati trīs mediāna | 90. procentile | 4 paraugi |

Kāpēc turēts pusi sekundes: bordiūrs, slīdes atsitiens atpakaļ, auto, ko noķer, visi uzšauj sānu paātrinājumu uz brīdi, un auto, kas to dara bieži, izskatījās sakerīgāks, nekā ir. Kāpēc trīs paraugu mediāna: piecu metru soļos viens paraugs ir tālu, un viens paraugs, kas uzšauj, ir bordiūrs, bedre vai siena.

Aploksnes lasīšana noteiktā ātrumā interpolē starp joslu centriem un, ja josla ir tukša, ņem tuvāko joslu ar datiem.

**Par divu veidu zemi.** Kad automašīnas apļi tika braukti vismaz piektajā daļā paraugu uz katras no asfalta un irdenas zemes, katrai tiek saglabāta atsevišķa aploksne, un katrs stūris tiek vērtēts ar zemi zem auto tā lēnākajā punktā.

**Krustpunkts.** Ātrums, no kura vilce krītas kā `1/v` (jaudas ierobežota), nevis paliek līmenī (vilces ierobežota): pirmā josla, kuras `a·v` ir 15% robežās no augstākā novērotā `a·v`.

## Profils: kāda veida auto tā ir {#the-profile-what-kind-of-car-it-is}

`profile`, no tiem pašiem apļiem (paraugi uz zemes, neskarti, ātrāk par 8 m/s):

| Mērs | Kā |
|---|---|
| **turēta sakere** (m/s²) | 95. procentile no pusi sekundes turētā sānu paātrinājuma |
| **vilce** līdz 50 km/h, 50-120, 120-200, virs 200 (m/s²) | vidējā aploksnes pilnas gāzes vilce 3-14, 14-33, 33-56 un 56-90 m/s, ātrumos, ko auto sasniedza (līdz tā ātrākajam + 2 m/s), no vismaz trim 1 m/s soļiem; un lielākā, ko tā parādīja, un kur |
| **bremzēšana** (m/s²) | aploksnes bremzēšana vidēji no 60 līdz 160 km/h (16,7-44,4 m/s), josla, ko salīdzinājums nosauc |
| **ātrākais** | augstākais ātrums, ko tas sasniedza |
| **sasniedz maksimumu pie** | kur tas pārstāja pieņemties pilnā gāzē taisnē (zemāk) |
| **joprojām velk savā ātrākajā** | aploksnes vilce tā ātrākajā ātrumā: cik tālu tam vēl bija jāiet |
| **aizmugure noķerta, uz apli** | reizes uz apli, kad tā slīdēja un bija jānoķer (zemāk) |
| **daļa ar gāzi** | no tiem - daļa, kas sākās ar gāzi > 0,5 un bez bremzes |
| **atlaiž pie** | sānu paātrinājuma, kas turēts, mediāna 0,15 s pirms katras slīdes sākuma, kā daļa no sakeres |
| **virs 10° drifta, stipras stūrēšanas laikā** | no paraugiem, kas stūrē ar 60% vai vairāk no sava sakeres, to daļa, kas slīd (10° uz asfalta, 20° uz irdenas); vajag 30 paraugus |
| **mediānais drifts** | tajos pašos paraugos |
| **līdzsvars** | priekšējais mīnus aizmugurējais slīdes leņķis (nominālā maksimuma daudzkārtņi), kad stipri stūrē un neslīd, vidējais no vismaz 30 paraugiem: + plaša izbraukšana |
| **virsma** | virs 80% irdenu paraugu: irdena; zem 20%: asfalts; citādi jaukta |

**Sasniedz maksimumu.** Paraugs skaitās, ja sekunde ap to (±0,5 s, vismaz 0,9 s datu) bija visa pilnā gāzē (> 0,95, bez bremzes), uz zemes, braukta **taisni** (|sānu| zem lielākā no 4 m/s² un ceturtdaļas no tās sakeres), iegūst mazāk par **0,35 m/s²**, ātrāk par 25 m/s un tuvu 90% no apļa ātrākā - pilna gāze augšup pa kalnu vai garā līkumā arī pārstāj iegūt, krietni zem auto maksimālā ātruma. Ar vismaz **vienu sekundi** šāda plato visos apļos mediāna no šiem ātrumiem ir vieta, kur tas sasniedz maksimumu. Citādi maksimālā ātruma nav: kur neviena taisne nebija pietiekami gara, *joprojām velk savā ātrākajā* saka, cik tālu tas bija. Nekas nav minēts pāri tam, ko rāda apļi - pārnesumi un ierobežotājs beidz auto vilci daudz pirms to izdara pretestība.

**Aizmugures zaudēšana.** Skaita tur, kur vadītājam bija jānoķer: stūrējot ar 60% vai vairāk no sakeres, slīdot (drifts pāri 10° uz asfalta, 20° uz irdenas zemes), ar stūri (virs 0,06) pagriezti **pret** līkumu. Tas, kura stūres zīme sakrīt ar kura sānu spēka zīmi, tiek mērīts katrā aplī (paraugi, kas pagriežas bez slīdes). Slīde tiek skaitīta vienreiz, kamēr auto pārstāj slīdēt. Auto, ko kādu brīdi tīši vada sānis, nekā nezaudē; tas, kam vajag pretēju stūri, zaudē. Skaitīts vienādi katrai automašīnai, tātad divas automašīnas var salīdzināt. Vajag stūri un drifta leņķi.

## Salīdzinātās automašīnas {#cars-compared}

Sānjoslas sadaļa ir **Automašīna** ar vienu automašīnu, **Salīdzinātās automašīnas** ar vairākām.

**Tabula**: kolonna katrai automašīnai, rinda katram mēram, kuram kādai automašīnai ir vērtība: Turēta sakere; Vilce līdz 50 km/h, 50-120, 120-200, virs 200; Bremzēšana; Ātrākais; Sasniedz maksimumu pie ("joprojām velk", ja nekad nav sasniedzis); Joprojām velk savā ātrākajā; Aizmugure noķerta, uz apli; Virs 10° drifta, stipras stūrēšanas laikā. Kur automašīnas atšķiras vairāk nekā par 3%, labākā vērtība ir atzīmēta (augstāka sakerei, vilcei, bremzēšanai, ātrumiem; zemāka aizmugures slīdēm).

**Viena automašīna**: teikumi par to, kāda tā ir pēc apļiem - sakere, ko tā notur (m/s² un g), tās vilce katrā joslā, kur tā pārstāja pieņemties garās taisnēs (vai ka tā nekad nesasniedza maksimumu un ko vēl velka savā ātrākajā), cik bieži tās aizmugure vajadzēja noķert ("gandrīz nekad" zem vienas reizes uz apli, "galvenokārt ar gāzi", kad 60% vai vairāk sākās tur).

**Divas automašīnas**: katram pārim pa teikumam par to, kāda automašīna ir pret otru ("X paātrinās labāk, bet nevar pagriezties tik stipri, vajag ilgāk, lai apstātos, un vieglāk zaudē aizmuguri"), tabula, katra skaidra atšķirība, lielākā pirmā, un tad **Kā vadīt katru**. Ar vairāk nekā **3** pāriem tiek rādīts viens pāris: fokusētā apļa automašīna pret automašīnu, kas izvēlēta no nolaižamā saraksta (pēc noklusējuma tās klases labākā apļa automašīna, citādi atsauces, citādi pirmā cita).

Atšķirība tiek pateikta tikai tad, kad apļi to skaidri rāda:

| Atšķirība | No | Teikums |
|---|---|---|
| sakere | **4%** | "X notur N% vairāk sakeres līkumos … tas ir M% vairāk ātruma katra līkuma vidū" (ātrums = √ no sakeres attiecības) |
| vilce | **5%**, pirmajā joslā, ko abas automašīnas ir 120-200, 50-120, virs 200 km/h | "X paātrinās N% stiprāk no 120 līdz 200 km/h"; arī no starta vietas, vai "lai gan Y no starta vietas izrauj stiprāk", kad starts atšķiras par 8% |
| maksimālais ātrums | **4 km/h** | "X sasniedz augstāku maksimumu: tas pārstāja pieņemties pie …" |
| maksimālais ātrums, tikai vienai | viena automašīna sasniedza maksimumu, otra nē | "Y beidza vilci pie …; X vēl pieņēmās, kad bremzēja" |
| maksimālais ātrums, nevienai | nevienai nav sasniegts maksimums | ko katra vēl pieņēmās savā ātrākajā |
| bremzēšana | **5%** | "X aptur N% stiprāk … Y ir jābremzē agrāk" |
| aizmugures zaudēšana | vismaz vienu reizi uz apli vairāk **un** par pusi biežāk | "X vieglāk zaudē aizmuguri: tā izslīdēja pietiekami tālu, lai vajadzētu pretēju stūri N reizes uz apli, pret M …" - galvenokārt ar gāzi (60%+) vai galvenokārt ieejot līkumā un ar atlaidi (30% vai mazāk), no aptuveni P% no tās sakeres; irdenā zemē "daļa no tā ir tas, kā auto tiek pagriezts; noķeršana nav" |
| sānis | **12 procentpunkti** stipra stūrēšana pār drifta slieksni | "X vairāk brauc sānis robežā" |
| priekšējais līdzsvars | **0,3** no nominālā maksimuma | "X vairāk spiež ar priekšu … tam vajag palēnināt un pagriezt pirms virsotnes" |

Raksturojumi kopsavilkumā: *notur vairāk sakeres* / *nevar pagriezties tik stipri*, *paātrinās labāk* / *velk mazāk*, *sasniedz augstāku maksimumu* / *sasniedz zemāku maksimumu*, *joprojām velk taisnes beigās* / *beidz vilci*, *aptur stiprāk* / *vajag ilgāk, lai apstātos*, *ir stabilāka* / *vieglāk zaudē aizmuguri* (*ir daudz slīdīgākā …*, kad divreiz biežāk plus viens; *vajag noķert biežāk* irdenā zemē), *spiež ar priekšu*. "Maz, ko atšķirt no Y šajos aplos", kad nav nekādas atšķirības.

**Kā vadīt katru:**

- viena automašīna notur vairāk sakeres un otra vilkt vairāk: nes ātrumu cauri vidum plašā, apaļā līnijā ("U") sakeres automašīnā; bremzē taisni, pagriež to īsā, stingrā vidū un iztaisno izbraukšanu ("V") spēcīgākajā;
- viena automašīna ir zemāk abos: tās labākais aplis ir tīrākais - bremzē taisni, platākais rādiuss, pilna gāze, cik agri vien tā notur;
- automašīna, kas vieglāk zaudē aizmuguri: pievienojiet gāzi tikai tad, kad stūre atgriežas, un īsi pārslēdziet (slīdes ar gāzi), vai viegli atlaidiet bremzi un turiet vienmērīgu gāzi caur vidu (slīdes ieejot).

Zem sadaļas esošais padoms atkārto, kā katrs tiek mērīts.

## Ko automašīnas nosaka stūrī {#what-the-cars-decide-in-a-corner}

Kad apļi ir dažādās automašīnās, katra zaudēta stūra secinājums beidzas ar
**Automašīnas:** - ko no tā nosaka automašīnas un kā no šīs vislabāk izspiest (`carNote`):

- **Caur vidu**, kad šī automašīna notur mazāk nekā 96% no otras sakeres, otra bija vairāk nekā 0,5 m/s ātrāka lēnākajā punktā un šis aplis nebija tālu zem tā, ko izskaidro tā sakere (vairāk nekā 70% no tās): uz otras automašīnas līnijas šīs automašīnas sakere atļauj `v_other · √(grip_mine / grip_other)`. Ja aplis to nesa (1 m/s robežās), starpība ir automašīna, un neviens bremzēšanas punkts to nemaina; ja mazāk, cik vēl ir ko iegūt. Tad - kur laiku var iegūt: uz taisnes, starp divām, vai automašīnā, kas velk par 5% stiprāk - pēc virsotnes (bremzē taisni, pagriežas vēlāk, vērš uz izbraukšanu agri); citādi - platākais rādiuss, ko ceļš atļauj.
- **Aizmugure, kas šeit atlaida** (neatzīta slīde vai griešanās, vai drifts pāri slīdes slieksnim, ieejot), automašīnā, kas to zaudē vismaz vienu reizi uz apli vairāk un par pusi biežāk: ko darīt šajā automašīnā - gāze, kas tiek pievienota, kad stūre atgriežas (tās slīdes sākas ar jaudu 60% vai vairāk no laika), vai bremze, kas viegli atlaista bez atlaides.
- **Taisne pēc tam**: kad automašīnu vilce izskaidroja 0,03 s vai vairāk, otras automašīnas stiprāka vilce no tā paša ātruma, ar abu automašīnu vilci no 120 līdz 200 km/h.
- **Maksimālais ātrums**: kad šis aplis sasniedza 98% no tā, kur tā automašīna sasniedz maksimumu garā taisnē (virs 150 m), un otra gāja par 1,5 m/s ātrāk: tas ir automašīnas maksimālais ātrums, un katrs km/h vairāk no līkuma palīdz, līdz tas tiek sasniegts.
- **Bremzēšana**: kad otra automašīna bremzē par 5% stiprāk un šis aplis bremzēja vairāk nekā par 5 m agrāk, ka daļa no agrākās bremzēšanas ir automašīnas.

Automašīnas daļa tiek atņemta arī no paša laika - skat. [automašīnas daļu](race-corner-analysis.md#the-cars-share) - un stūris, kur automašīna izskaidro 60% vai vairāk, tiek piešķirts automašīnai.

## Izstrādātājiem {#for-developers}

Kods: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` failā [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` failā [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
