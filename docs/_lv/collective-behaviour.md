---
title: "Kolektīvā uzvedība"
parent: "Atziņas"
nav_order: 3
lang: "lv"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Kolektīvā uzvedība: pūļi, bars, ganāmpulki un lēmumi spiediena apstākļos

Spēlētāji mačā uzvedas kā cilvēki jebkur citur. Tie saspiežas pie durvīm, seko tam, kurš aizgāja pirmais, paliek kopā vai izklīst, atkāpjas pēc smagiem zaudējumiem un uzņemas lielāku risku pēc sliktas dzīves. **Uzvedības lēcas rādītāji** mēra šos modeļus ar pūļu zinātnes, kolektīvās kustības fizikas, uzvedības ekonomikas un militārās psiholoģijas metodēm. Katrs tiek salīdzināts ar savu nulles modeli, un tos lasa ar atbilstošiem ierakstiem [zināšanu bāzē](knowledge.md).

## Izmēģini {#try-it}

1. Ielādē vienu vai vairākus mačus ar laiku, pozīcijām un komandām.
2. Atver **Atziņas** un palaid to.
3. Atvērt **Lēcas rādītāji**: uzvedības mērījumi ir uzskaitīti kopā ar pārējiem (Kolektīvā saskaņotība, Maršrutu ganīšana, Joslas un takas, Blīvums, Līderi un sekotāji, Saķere un atpalikušie, Lūzuma punkts, Risks pēc zaudējumiem, Sērijas, Pirkuma saskaņotība, Apspiešana). Katrs ir ar saviem skaitļiem, testu un literatūru, kas to skaidro.
4. **Kopsavilkums** tos citē; **Rakstīt ar MI** nosūta tos kopā ar atskaiti.

## Mērījumi {#the-measures}

Trajektorijas tiek pārparaugotas uz vienu punktu ik pēc 2 s (pozīcija intervāla beigās un ātrums tā laikā). Attālumi tiek mērogoti pēc paša datu tipiskā atstatuma, proti, mediānas attāluma no vienības līdz tuvākajam komandas biedram. Tāpēc tas pats mērījums strādā gan kājniekiem, gan tankiem, gan lidmašīnām.

| Mērījums | Ko tas mēra | Nulles modelis un tests | Zināšanas |
|---|---|---|---|
| Kolektīvā saskaņotība | Polarizācija (vidējā vienību virziena garums) katras puses kustīgajām vienībām ik pēc 2 s, virpuļošana (rotācija ap centroīdu), laika daļa polarizētai, virpuļojošai un spiestai kustībai pa mača fāzēm; kaujās starp divām saskaņotām pusēm — labāk saskaņotās puses nogalināto daļa | Katras vienības pašas trajektorija, nobīdīta laikā mača ietvaros (saglabā ceļu, bet izjauc vienlaicīgumu); zīmju apgriešanas tests 60 s logos | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Maršrutu ganīšana | Cik bieži vienība atstāj vietu tādā pašā veidā, kā to pirms tam darīja komandas biedrs (30 s laikā), tam pašam ieejas veidam, pret vietas paša izejas daļām, un pret ienaidnieka agrāka ceļa kopēšanu | Izejas sajauktas vietas un ieejas ietvaros; efekts ir komandas biedra kopēšana mīnus ienaidnieka kopēšana (Manska atspoguļojuma problēma: kopēšana un kopīgs plāns izskatās vienādi) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Joslas un takas | Divu virzienu sānu nošķiršanās vietās ar pretplūsmu; kustības daļa uz aizņemtākajiem 10% zemes, tās Džini koeficients un abu mačų aizņemtākās zemes pārklājums | Virzieni sajaukti starp visām apmeklējumu daļām; divi režģi, nobīdīti par pusi vietas, katrs pārbaudīts, Bonferroni | Helbing et al. 1997, 2005 |
| Blīvums | Ātrums (attiecībā pret vienības paša tempu) un plūsma pēc kaimiņu skaita divkāršā tipiskā atstatuma robežās, jaudas kritums blīvākajā klasē, aizņemtākajā zemē; nāves stundā pūļos; šāvieni minūtē, ko izdara tuvumā esoši komandas biedri (sociālā atpūta) | Katras vienības pašas ātruma un blīvuma korelācija, zīmju apgriešana pa vienībām, minimālais efekts ρ aiz ±0,05; precīzi likmju testi | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Līderi un sekotāji | Komandas biedriem, kas kopā pārvietojas, laika nobīde (līdz 8 s), kurā viena virziens vislabāk paredz otra virzienu; līderu grafs, trijstūru tranzitivitāte, līderu nāves un nogalinājumu likmes | Pāri ar vienu trajektoriju, nobīdītu laikā, dod 95% slieksni; binomiālais tests pret 5% | Nagy et al. 2010, Couzin et al. 2005 |
| Saķere un atpalikušie | Laiks, kas pavadīts vairāk nekā trīs reizes tālāk par puses tipisko atstatumu no tuvākā komandas biedra; nāves likme tur pret grupā; puses atstatums pret tās daļu no kaujas nogalinājumiem | Precīzs nosacītais tests divām Puasona likmēm | Shils and Janowitz 1948, Siebold 2007 |
| Lūzuma punkts | Tuvošanās ātrums ienaidniekam (puses paša tempā) pēc tā, cik lielu puses daļu zaudēja pēdējā minūtē; zemākais zaudējumu līmenis, kurā puses atkāpjas | Vienpusējs klastera bootstrap pret atkāpšanos ar desmitdaļu no tempa (zaudējumi krīt tur, kur puses saskaras, un puses, kas saskaras, pārtrauc tuvoties), Bonferroni pa līmeņiem | Dupuy 1987, Rowland 2006 |
| Risks pēc zaudējumiem | Nākamās dzīves daļa, kas pavadīta aiz savas puses virzienā uz ienaidnieku, virs puses paša daļas un citām atgriežamajām vienībām tajā laikā: pēc dzīves, kas zaudēta bez nogalinājuma, salīdzinājumā ar pēc dzīves ar nogalinājumu; agra nāve pēc agras nāves (sašķobīšanās) | Katras vienības dzīves sajauktas (pirmā dzīve paliek), tāpēc galīgās secības novirze ir iekļauta nullē | Kahneman and Tversky 1979, Thaler and Johnson 1990 |
| Sērijas | P(nogalinājums pēc k nogalinājumiem) − P(nogalinājums pēc k nāvēm), k = 1..3 | Katra spēlētāja pašu secība sajaukta 1 000 reizes: no tā atņem novirzi, ko parādīja Millers un Sandžurjo; Bonferroni pa k | Gilovich et al. 1985, Miller and Sanjurjo 2018 |
| Pirkuma saskaņotība | Fleisa κ aprīkojuma joslām (eko, spēks, pilns; tercili ārpus Counter-Strike) puses raundā | Puses spēlētāju-raundu sajaukti pa tās raundiem | Fleiss 1971 |
| Apspiešana | Ātrums 4 s pēc nenāvējoša bojājuma pret 4 s pirms tā, un šāvieni 10 s pēc pret pirms tiem, trāpījumos un tās pašas vienības mierīgos brīžos | Zīmju apgriešana pa vienībām, minimālie efekti 0,05 no tempa un viens šāviens minūtē | Rowland 2006 |

Katra atskaites p-vērtība iet caur Benjamini–Hohberga lašu atklāšanas līmeni (`q`). Mērījums tiek izlaists, ja dati to nevar nest: uzvedības pirkumam vajag raundus un ekipējuma vērtības, apspiešanai — bojājumu notikumus, sērijām un riskam — vienību piedēvētus nogalinājumus un nāves.

## Masveida analīzē {#in-the-mass-analysis}

Katrs mača kopsavilkums (`<match>.summary.json`, skat. [Masveida analīze](mass-analysis.md)) satur tos pašus mērījumus šim mačam savā sadaļā `behaviour`. Tāpēc tūkstošiem mačus var salīdzināt, neskatoties to rindas vēlreiz.

## Cik labi tas strādā {#how-well-it-works}

Uz simulētām kaujām ar katru efektu iebūvētu un uz tām pašām pasaulēm bez tā (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): katrs mērījums atrod savu iestrādāto efektu, un nulles pasaules paliek zem lašu atklāšanas sliekšņa. Riskam pēc zaudējumiem ir vismazākā jauda. Maršrutu ganīšana nevar atšķirt kopēšanu no kopīga plāna (puse, kas dalās vienā mērķī, pēc šī mērījuma ir "ganīšana").

## Izstrādātājiem {#for-developers}

- `src/insights/behaviour/acc.ts` — uzkrājējs (pārparaugotās trajektorijas, notikumi, raundi) un `finish`; `motion.ts` un `choice.ts` — mērījumi; `bstats.ts` — permutācijas, bootstrap un kappa palīgfunkcijas; `shows.ts` — modeļi un teikumi, ko lēca lasa (`lens.<measure>`).
- `feed.ts` to baro no atziņu darbinieka daļām; `summaryTap.ts` — no mača kopsavilkuma, kad tas plūst pa tabulu.
- Zināšanas: `src/insights/knowledge/behaviour.ts` (ieraksti), `patterns-behaviour.ts`, `refs-behaviour.ts` (atsauces, katra pārbaudīta pret savu Crossref vai Open Library ierakstu).
- Etiķetes: `lens.metric.<measure>` failos `locales/*/lens.json`.
