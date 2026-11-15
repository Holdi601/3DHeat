---
title: "Masveida analīze"
nav_order: 8
lang: "lv"
source: "mass-analysis.md"
source_hash: "e65b729b5928"
translated: true
outdated: false
---

# Masveida analīze: tūkstošiem maču uzreiz

**Masveida analīze** parāda, ko veido visa mapes maču kopa: kuru transportlīdzekli uzvar visbiežāk, kurai pusei veicas labāk, kur notiek darbība. Izmantojiet to, ja maču ir daudz vairāk, nekā varētu noskatīties.

Tā darbojas no katra maču īsa kopsavilkuma, tāpēc tūkstoš vai desmit tūkstoši maču atveras ātri. Pilnās rindas tā ielādē tikai tiem mačiem, uz kuriem noklikšķināt.

## Izmēģiniet {#try-it}

1. Atveriet **Masveida analīze** Siltumkartes sānjoslā.
2. Nospiediet **Mape...** (vai **Faili...**) un izvēlieties savus `.3dheat` maču failus.
3. Pagaidiet, kamēr panelis nolasa kopsavilkumus ("Kopsavilkumi... n no N").
4. Nospiediet **Atvērt analīzi**. Atveras logs ar cilnēm.
5. Iestatiet filtrus (Spēle, Karte, Režīms, No, Uz), tad izlasiet cilni, piemēram, Balanss.
6. Noklikšķiniet uz rindas, šūnas vai atziņas: tās mači ielādējas 3D skatā, kamera ir vērsta uz vietu.

![Cilne Balanss: uzvaru koeficients un nogalinājumi uz nāvi pēc transportlīdzekļa](../assets/img/en/mass-balance.webp)

```
.3dheat mape -> kopsavilkumi -> logs (cilnes) -> noklikšķiniet uz rindas -> mači atveras 3D
```

`.3dheat` fails ir viens mačs ([Viens fails - viens mačs](container.md)). *Siltumkarte* un *rinda* ir paskaidroti [terminu vārdnīcā](glossary.md).

## Kopsavilkumu iegūšana {#getting-the-summaries}

Lielākajai daļai cilvēku nav nekas jādara: panelis pats aprēķina trūkstošos kopsavilkumus. Lai reiz sagatavotu lielu mapi, izmantojiet bezsaistes rīku zemāk.

Katram `.3dheat` mačam tiek izveidots kopsavilkums (`src/mass/summarize.ts`), kas glabājas
konteinerā kā dalībnieks `<match>.summary.json` (loma `summary`, skat.
[Viens fails - viens mačs](container.md)). Bezsaistes rīks tos raksta un
katrai mapei indeksu. Tas ir izstrādātāja rīks; palaidiet to lielai mapei, lai panelim nebūtu jāstrādā:

```
node tools/3dheat-summarize.mjs <mape>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Mačs, kas jau ir apkopots (tā pašā formāta versijā), tiek tikai nolasīts; `--force`
  aprēķina vēlreiz. `--no-write` konteinerus neaiztiek.
- Fails, kas mainīts pēdējās `--settle` minūtēs (10), tiek izlaists: konvertētājs
  varbūt vēl to raksta.
- `<mape>/3dheat-index.jsonl.gz`: viena rinda uz maču - tā ceļš, izmērs, laiks
  un kopsavilkums bez režģa. `<mape>/3dheat-index.grids.jsonl.gz`: viena rinda uz maču
  ar tā režģi.
- Palaidiet to datorā, kur ir faili, ar zemu prioritāti (piemēram, `nice -n 19 ionice -c3` Linux).

Panelis katram mačam ņem pirmo pieejamo: mapes indeksa rindu (tas pats
ceļš un izmērs), pārlūkprogrammas kešatmiņu (IndexedDB, pēc nosaukuma, izmēra un laika),
konteinera dalībnieku `summary` vai kopsavilkumu, kas aprēķināts darbinieku kopā un
saglabāts kešatmiņā. Tātad mape bez indeksa arī darbojas - pirmoreiz ar tabulu lasīšanas
ātrumu, pēc tam no kešatmiņas.

## Panelis {#the-panel}

Izvēlieties mapi (vai failus; **Pievienot mapi...** pievieno vēl vienu). Logā ir filtri **Spēle**, **Karte**, **Režīms**, **No** un **Uz**, izvēle **Sadalīt pēc**, **Mazāk dzīvību** un **Tikai spēlētāji**, un šīs cilnes. Katrs skaitlis nāk no kopsavilkumiem, un klikšķis uz rindas, šūnas vai atziņas ielādē tās mačus skatā kā daudzmaču pārklājumu ar filtriem, kas to rāda (transportlīdzeklis, klase, ierocis, komanda, spēlētājs), un kameru uz vietu:

| Cilne | Kas tajā ir |
|---|---|
| Pārskats | mači, stundas, spēlētāji, dzīvības, rindas, datumi; mači dienā; pēc spēles, kartes, režīma; notikumu kopsummas; ekonomika pēc valūtas; kad mačā notiek lietas |
| Balanss | pēc transportlīdzekļa, klases, ieroča vai komandas, sadalīts pēc kartes, režīma, līmeņa vai spēles: K/D ar tā ~95% intervālu, uzvaru koeficients (Wilson), izdzīvošana, nogalinājumi un trāpījumi minūtē, ieņēmumi minūtē, un q - Benjamini-Hochberg viltus atklāšanas līmenis K/D un uzvarai, salīdzinot ar pārējo sadalījumu. **Mazāk dzīvību** slēpj rindas ar pārāk maz dzīvību, lai tām uzticētos; **Tikai spēlētāji** izslēdz to, ko vadīja misijas MI |
| Tendences | izmantošana (daļa no klātbūtnes), K/D vai uzvaru koeficients labāko transportlīdzekļu vai klašu dienā, nedēļā vai mēnesī |
| Spēlētāji | atšķirīgi spēlētāji, mači uz spēlētāju, spēlētāji uz maču, visbiežākie spēlētāji |
| Puses | katra karšu puse: uzvarētie mači pret vienādu sadalījumu |
| Tuvā cīņa | raundu dati: atvēršanas dueļi pēc puses un to konvertācija, tirdzniecība, izspiedējs pret turētāju, krustuguns, iešana ar zibgranātu, tēmēšana, bumbu uzstādīšana, vīru pārsvars un, **Pēc kartes**, vietas, kur nogalina spēlētājus, kas tajās ieiet - katrs kā daļa ar savu Wilson intervālu, no kopsavilkumu `cqb` skaitļiem ([Tuvā cīņa un raundi](close-quarters.md)) |
| R6 virsmas | Rainbow Six Siege pēdas līmenī (ložu caurumi un tamlīdzīgi) pa līmeņa virsmām: pēdas, uz kartes raundu, telpa, daļa, kurai noteikts šāvējs; klikšķis atver pēdu veidus, šāvēju operatorus un ieroču klases, un to, kur uz virsmas ir pēdas (maza siltumkarte no ceturtdaļmetra šūnām); virsma saglabā savu id visos vienas kartes versijas mačos. No kopsavilkumu `marks` skaitiem |
| Karte | kartes summētais režģis: klātbūtne, nogalinājumi, nāves, K/D, jebkurš notikums, plūsma un **karsts cik mačos** (stabilitāte); pēc komandas, ar 1, 2, 4 vai 8 reižu šūnu |
| Vietas | vietas, kas izceļas skaitļos, bet ne siltumkartē (liels laukums, kas kopumā ir aizņemts, koridori, augstuma joslas), un vietas, kuru turētāji uzvar vairāk vai mazāk savu raundu; **Atrast vietas** |
| Nišas | grupas, kas redzami labāk vai sliktāk par pārējiem (transportlīdzeklis vienā kartē, sektors vienā augstumā), un raundu grupas, kas uzvarētas vairāk, nekā to puse uzvarēja tajos pašos mačos; **Atrast nišas** |
| Atziņas | masveida detektori un kartes detektori (zemāk); **Kopēt pārskatu (JSON)** dod JSON, ko lasa valodas modelis |

## Atziņas no daudziem mačiem {#insights-over-many-matches}

Cilne **Vietas** atrod vietas, kas izceļas skaitļos, bet ne siltumkartē - liels laukums, kas kopumā ir aizņemts, koridors, augstuma josla, vieta, kas aizņemta tikai vienā mača daļā - atzīmē tās, ko parastā siltumkarte nerāda, kā **slēptas**, un iezīmē tās 3D skatā; **Ielādēt** aizlido uz turieni ar mačiem, kas tur bija. Cilne **Nišas** atrod grupas (transportlīdzeklis vienā kartē un pusē, sektors vienā augstumā), kas redzami manāmi labāk vai sliktāk par pārējiem; noklikšķiniet uz vienas, lai redzētu tās precizējumus.

### Kas uzvarēja {#who-won}

Kur mači pasaka, kas uzvarēja katrā raundā ([iznākuma kolonna](data-formats.md#outcome-columns) `won`), rezultāts ir atsevišķs mērķis:

- **Vietas: uzvaru īpatsvars.** Katrai pusei tās raundu daļa vietā, kurus tā uzvarēja, pret daļu, ko tā uzvarēja tajā pašā mačā jebkur - tātad kartes, puses un paša mača balanss ir bāzes līnija, un izceļas tikai vietas, kuru turētāji uzvar vairāk (vai mazāk) savu raundu. Izdomāts piemērs: *„Dust: puse T uzvar vairāk savu raundu, kad tā ir šeit: uzvarēti 61% no 412, pret 49%, kas gaidīti pēc tās pašas līmeņa tajos pašos mačos (izredzes 1,6x; noturēta 31/48 mačos).”* Tāds pats viltus atklājumu līmenis un stabilitātes pārbaudes kā katrai vietai; **Ielādēt** ielādē mačus, kuros vieta tika noturēta, un parāda šīs puses pozīcijas.
- **Nišas: raunda uzvara.** Tabulā **Raundi** ir katras dzīves raunds: karte, puse, mača daļa (raundi 1-4, 5-8, ...), transportlīdzeklis (operators, aģents), visvairāk izmantotais ierocis, visilgāk noturētā vieta, pirkums (eco, force, full) un vai tās puse izdarīja pirmo nogalinājumu. Grupu vērtē pret to, ko tās puse uzvarēja tajos pašos mačos, tāpēc *T uz Dust ar AWP* ir niša tikai tad, ja šie raundi tika uzvarēti biežāk nekā citi T raundi tajos mačos. Izdomāts piemērs: *„m1 · T · AWP: uzvar 80% no 320 raundiem, pret 62%, kas gaidīti no tām pašām pusēm tajos pašos mačos (izredzes 2,3x; 40 mači).”* Sarindots pēc pacēluma reizinājuma ar atbalstu; **Ielādēt** ielādē mačus, kuru raundos tas redzams visvairāk.

Abiem vajag 2. versijas kopsavilkumus (skatiet [Kopsavilkumu iegūšana](#getting-the-summaries)): vecākie tiek aprēķināti no jauna.

Cilne **Atziņas** visos mačos atrod transportlīdzekļus, kas tirgojas vai uzvar labāk vai sliktāk par pārējiem, vietas, kas karstas stabilā maču daļā, puses, kas uzvar vairāk nekā vienādā sadalījumā, transportlīdzekļus, kuru izmantošana mainās pa datumiem, un mača daļas, kurās ir vairāk nogalinājumu nekā vienmērīgā sadalījumā. Katrai atziņai ir tās skaitļi, efekts, intervāls un viltus atklāšanas līmenis (turēts 5%), un klikšķis ielādē tās mačus. Sīkāk: [Izstrādātājiem](#for-developers).

## Mērogs {#scale}

Varat atkārtot nelielu šī versiju pats: `node tools/demo-data.mjs` ieraksta 150 sintētiskus tanku mačus `tools/.shots/demo/mass` (apmēram 1000 rindas katrs). Mērīts uz šiem 150 sintētiskajiem demo mačiem no `tools/demo-data.mjs` darbvirsmas datorā (īsts mačs ir daudz lielāks):

- `tools/3dheat-summarize.mjs` ar 4 darbiniekiem: 2,6 līdz 4,8 s visiem 150, 8 līdz 21 ms vienam mačam darbinieka iekšienē; otra palaišana, kas tikai nolasa kopsavilkumus, aizņem apmēram 2 s.
- Mapes atvēršana panelī, ja indekss ir klāt, līdz logs ir redzams: 0,9 līdz 1,6 s (darbinieka pašas daļa, 150 indeksa rindu lasīšana, ir 20 līdz 40 ms).
- Pārslēgšanās uz cilni, līdz tās tabula ir uzzīmēta: Pārskats 10 līdz 30 ms, Balanss 30 līdz 70 ms, Tendences 30 līdz 45 ms, Spēlētāji 15 līdz 35 ms, Puses 15 līdz 20 ms, Karte 55 līdz 130 ms.
- Glabātuvē 150 mači aizņem apmēram 0,5 MB.

Loga atvēršana aizņem vienu īsu kadru: izvēlētie faili tiek nosūtīti darbiniekam pa 16, un datumu lauki un pirmā cilne parādās kadru vēlāk nekā logs.

Glabātuve tur apmēram 15 KB uz maču, tāpēc 10 000 mačiem darbinieka iekšienē vajag ~150 MB; režģi nekad netiek turēti ilgāk, nekā karte prasa.

## Izstrādātājiem {#for-developers}

### Atziņas no daudziem mačiem {#insights-over-many-matches}

`src/mass/detect.ts` - katra atziņa ar tās skaitļiem, efektu un intervālu,
p un q (Benjamini-Hochberg pār visu, ko detektors izmēģināja, turēts 5%),
detalizētā skata, kas ielādē tās mačus, un teikuma atslēga ar tās vērtībām;
pārskats (`heat3d.mass/1`) ir tas, ko `massReportForModel` nodod stāstītājam,
tādā pašā formā kā viena maču pārskats (`insights/seam.ts`).

| Detektors | Atrod |
|---|---|
| `balance` | spēlētāja transportlīdzeklis, kas tirgojas vai uzvar labāk vai sliktāk par pārējiem kartē vai režīmā |
| `hotspot` | vietas, kas karstas stabilā maču daļā, no tiem, kas ienāca (karsti mači / redzēti mači, salīdzinot ar kartes citām šūnām) - ne tikai karstas summā |
| `side` | kartes puse, kas uzvar vairāk nekā vienādā sadalījumā |
| `meta` | transportlīdzekļa daļa no spēlētāju dzīvībām vai tā K/D, kas mainās starp agrāko un vēlāko datumu pusi, pa kartēm - pietiekami liela, lai būtu svarīga, tendence pa ceturkšņiem, tāda pati lielākajā daļā karšu (zemāk) |
| `phase` | mača garuma daļa, kurā ir vairāk nogalinājumu, trāpījumu, palaišanu... nekā vienmērīgā sadalījumā |
| `place` | vietas, kas izceļas pār daudziem mačiem (B posms, zemāk): reģiona likme vai nogalinājumu daļa salīdzinājumā ar katra maču pašu, apļi, koridori, izaugušas zonas, augstuma joslas, fāzes; slēpta, ja parastā siltumkarte tās nerāda |
| `niche` | grupas, kas redzami labāk vai sliktāk (B posms, zemāk) |
| `grid.*` | viendatu kopas detektori (jaudas pozīcijas, karstās un klusās zonas, klašu vietas) uz katras kartes summētajiem režģiem: `GridMerge.toInsightJob` aizpilda atziņu pārejas režģus no kopsavilkumiem; detektori, kam vajadzīgas trases, izlaiž |

### Kopsavilkums {#the-summary}

Vienkārša JSON (`src/mass/types.ts`), apmēram 5-30 KB saspiests uz maču:

- mačs: spēle, karte, režīms, misija, sākums, garums, rindas, dzīvības, spēlētāji,
  MI, komandas (dzīvības, spēlētāji, klātbūtne, nogalinājumi, nāves, uzvarējis, nauda), uzvarētājs;
- pa transportlīdzekli un komandu: klase, līmenis, dzīvības, spēlētāju dzīvības, klātbūtne, notikumi
  pēc kanoniskā veida, nogalinājumi pēc mērķa klases, uzvaras, nauda;
- pa spēlētāju (pēc lietotāja ID, citādi pēc vārda): komanda, dzīvības, klātbūtne, nogalinājumi, nāves,
  trāpījumi, palaišanas, uzvarējis, transportlīdzekļi; pa ieroci: notikumi pēc veida;
- ar rezultāta kolonnu (2. versija): uzvarētie un nospēlētie raundi pa komandām, transportlīdzekļiem
  (`rw`, katrs viena dzīve un raunds), spēlētājiem un ieročiem (raundi, kuros puse to
  izmantoja); katras dzīves raunds (`outcome.u`: raunds, puse, transportlīdzeklis, visvairāk
  izmantotais ierocis, visilgāk noturētā vieta, pirkums, uzvarēts) un katra raunda
  numurs, uzvarētājs un tā pirmā nogalinājuma puse (`outcome.r`);
- ekonomikas kolonnas (`cost_*`, `earn_*`) un to kopsummas;
- fāzes: notikumi pēc veida 20 mača garuma joslās un pēc minūtes;
- uzvedība: mača kolektīvās uzvedības mēri (saskaņotība, maršruta ganīšana, joslas, pūļošanās, līderi, atpalikušie, lūzuma punkts, risks pēc zaudējumiem, sērijas, pirkumu vienošanās, nomākšana), katrs ar savu nulles modeli,
  p un q - skat. [Kolektīvā uzvedība](collective-behaviour.md);
- režģis (zemāk).

Skaita tā, kā skaita skatītājs: kolonnas atrastas tā, kā tās atrod daudzmaču ielādētājs
(`leanSpec`), notikumi pēc `data/canonical.ts`; nogalinājums ar Tacview ieroci ieskaita skaitītu tā šāvējam;
nāve, kas pateikta divreiz vienlaikus (`dead`, `death`), skaitās vienreiz.

#### Režģis: uz ko balstās B posms {#the-grid-what-stage-b-builds-on}

Telpiskā daļa ir veidota statistiskai skenēšanai pār reģioniem jebkurā izmērā un formā,
ne tikai siltuma attēliem:

- **Piramīda.** Šūnas ir līdzinātas divu pakāpes skaitļiem pasaules vienībās (x, z kā skatītājs tās novieto). `k` līmenis ir šūnas, kas summētas pēc `ix >> k, iz >> k` -
  precīzi, vienā mačā un starp citu izmēru šūnu mačiem - un jebkurš reģions (kaste, gar līniju veidots koridors, gredzens) ir šūnu summa. Smalkākais līmenis ietilpst mača stabilajā apjomā (šūnas, kurās ir 99% klātbūtnes) 128 šūnās; ārpus tā esošie izkritumi tiek saglabāti.
- **Iedarbība blakus katram skaitam.** Klātbūtnes sekundes uz šūnu, uz komandu (`pt`), uz transportlīdzekļa klasi (`pc`) un uz augstuma joslu (`ph`), tāpēc reģiona likme, sagaidāmā vērtība un attiecība tiek aprēķinātas jebkurai apakšgrupai.
- **Augstums.** Joslas virs mača grīdas (augstuma 1. procentile): zem 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, virs; fails ar kolonnu `floor`/`storey`/`deck` joslās pēc savām stāvu grīdām. `y` ir katras šūnas vidējais augstums, `y0` - zemākais (tās stāva grīda augstumam virs tā).
- **Notikumi** kā kortežas `[šūna, veids, komanda, klase, josla, skaits]`.
- **Raundi pēc rezultāta** (2. versija, ar rezultāta kolonnu un diviem vai vairāk
  raundiem): `pw` kā `[cell, team, rounds won, rounds lost]` - raundi, kuros katra puse
  pavadīja šūnā sekundi vai vairāk, pēc tās rezultāta raundā.
- **Laika griezumi** raupjā līmenī (8 šūnas uz pusi), pēc minūtes no mača sākuma: `[cx, cz, minūte, veids, vērtība]`, klātbūtnes sekundes kā veids `GRID_KINDS.length`; mača fāzes ir minūtes pār garumu.
- Retināts, skaiti ir veseli skaitļi, sekundes līdz desmitdaļai: ierobežots ar to, kas notika.

### B posms: vietas un nišas {#stage-b-places-and-niches}

B posms meklē to, kas izceļas skaitļos, bet nekrīt acīs:
liels laukums, kas kopumā ir aizņemts bez karstas šūnas tajā, dīvains nogalinājumu un nāvju
attiecība uz maz notikumiem, koridors, augstuma josla, klasteris, kas ir tikai
vienā mača daļā - un grupas (transportlīdzeklis vienā kartē vienā pusē, sektors vienā augstumā), kas redzami manāmi labāk vai sliktāk par pārējiem. Viena
**Atrast vietas** / **Atrast nišas** / **Atrast atziņas** palaiž visus detektorus;
trīs cilnes dala vienu pārskatu.

#### Vietas (`src/mass/scan.ts`) {#places-srcmassscants}

Katras kartes mači tiek nolasīti divreiz, pa vienam mačam; atmiņā glabājas summas uz rastra ar ne vairāk kā 64 šūnām malā (telpas-laika skenēšanai 16), nekad paši mači.

- **Mēri.** Notikuma likme uz klātbūtnes sekundi - nogalinājumi, nāves,
  trāpījumi, palaišanas, pārņemšanas, visām vienībām, pa klasēm (4 ar visvairāk
  notikumiem), pa augstuma joslām - un nogalinājumu daļa nogalinājumos un nāvēs (visi, pa pusēm,
  pa joslām), un katras puses **uzvaru īpatsvars**: tās raundi šūnā uzvarēti pret zaudētiem (`pw`),
  kur 8 vai vairāk kartes mači skaita raundus pēc rezultāta. Kuras klases un puses nāk no galvām (`planOf`).
- **Sagaidāmā vērtība pēc mača.** Katra mača pašas likme, sadalīta pār tā pašu klātbūtni
  šūnā, ir šūnas sagaidāmā vērtība (Kulldorff skenēšana ar kovariātēm, stratificēta pēc mača): daži asiņaini mači vai viens aizņemts serveris nerada vietu. Uzvaru īpatsvaram sagaidāmā vērtība ir puses pašas uzvarēto raundu daļa tajā mačā, tāpēc kartes un puses balanss nekad nav vieta. Raunds vairākās apgabala šūnās skaitās katrā; izkliede, kas mērīta apgabala izmērā, to ņem vērā.
- **Izkliedēšana.** Mači nesaskan daudz vairāk nekā Puasona sadalījums. Katra mača atlikumi tiek summēti blokos pa 1, 2, 4, 8, 16 šūnām; katra bloka izmēra izkliedēšana (kvadrātveida atlikumi, dalīti ar nulles dispersiju, apvienoti, sliktākie 5% bloku izslēgti) skalē katru reģiona izmēra testu: kvazi-iespējamības attiecība, Puasons likmēm, binomiāls daļām.
- **Reģioni.** Apļi 0,75 līdz 18 šūnas; elipses sešos leņķos, 3 un 6 reizes garākas nekā platas, 3 līdz 18 šūnas (koridori; ass ir atziņas `place.path`); zonas, kas izaug šūna pa šūnai no spēcīgākajām lokālajām Getis-Ord Gi* šūnām, kamēr reģiona z aug (neregulāras formas) - audzētas uz vienas maču puses un pārbaudītas uz otras, tātad augšanas brīvība nemaksā ar viltus vietām; katra augstuma josla pret pārējām mača joslām visā kartē (kopu izturīga); telpas-laika cilindri: apļis vienā vai divās piektdaļās mača garuma, pret paša mača izkliedi starp tā notikumiem vietā un laikā (telpas-laika permutācijas skenēšana).
- **Testēšana.** p no kvazi-iespējamības; Benjamini-Hochberg pār katru reģionu, kas izmēģināts katrā kartē (parasti 700 000 trīs kartēs), 5%. Tas, kas iztur, tiek apgriezts (reģions, kas galvenokārt ir iekšā spēcīgākā tā mēra reģionā, saka to pašu), tiek atkārtoti nolasīts par tā **stabilitāti** - mačiem, kas to redzēja, mačiem, kuros tas bija, tā virzienu piecās maču daļās - un testēts vēlreiz pie izkliedes, ko paši mači rāda (kopu izturīgs, mači kā kopas, nekad zem Puasona), BH atkal. Klusas vietas uz pamata (2% vai vairāk no kartes dzimšanām, pacelšanos un nolaišanos) tiek izlaistas.
- **Efekts.** Likmes (vai izredžu) attiecība, saraujot ar empīrisko Bajesu (gamma prioram, kas pielāgots kartes 2x2 blokiem), ar ~95% intervālu pie izkliedes; Gi* pie 1, 2 un 4 šūnām un lokālais Moran centrā.
- **Vizuālā acīmredzamība.** Cik daudz reģions jau rāda parastajā tā notikuma siltumkartē (logaritmiska skala līdz spilgtākajai šūnai, kā to zīmē skati): tā kontrasts ar gredzenu ap to (desmitdaļa paletes ir grūti saskatāma, divas piektdaļas vienkārša) un spilgta smaile, kas nes pārpalikumu; attiecību siltumkarte nekad nezīmē, tāpēc daļa skaitās uz pusi. Zem 35% ir **slēpta**. Rangs: spēks (efekts, kas piesātinās 4 reizēs, klusām vietām 0,7) reizināts ar `1 - 0,7 x acīmredzamība` reizināts ar grupu savstarpējo vienprātību.

Cilne **Vietas** tās uzskaita (pēc noklusējuma tikai slēptās; pēc kartes, formas, virziena), klikšķis iezīmē kartes vietas 3D skatā (`placeLines.ts`: dzinēja augšējās līnijas, veidotas vienreiz - magenta slēptās, dzeltenbrūnas vienkāršās, ciāna klusās, izvēlētā pilnā; josla kā kaste no tās grīdas līdz griestiem) un cilnes Karte audekls; **Ielādēt** aizlido uz turieni un ielādē 60 mačus, kuros tā visbiežāk bija, filtrētus pēc tās notikuma (un klases).

#### Nišas (`src/mass/niche.ts`) {#niches-srcmassnichets}

Staru meklēšana (platums 24, dziļums 3) pār trim tabulām: **dzīvības** (spēlētāju dzīvības:
spēle, karte, režīms, klase, transportlīdzeklis, puse, līmenis, datumu ceturksnis, mača garumu trešdaļa; K/D, uzvara, nāve uz dzīvību, nogalinājumi stundā, ieņēmumi minūtē),
**vietas** (nogalinājumi un nāves pēc kartes, režīma, datumiem, kartes sektora 4 x 4, klases, puses, joslas) un **fāzes** (sektors un mača garuma piektdaļa: K/D, nāves stundā klātbūtnē). Grupa tiek pārbaudīta pret visiem, mačiem kā kopām (tās atlikumu sendviča dispersija pēc mača), tās efekts - izredžu vai likmes attiecība, saraujot ar prioru 20 iznākumiem; tai vajag 30 iznākumus 8 mačos, precizējumam jābūt 10% spēcīgākam nekā tā vecākam, grupas, kur iznākums ir neviens vai visi (netiek ierakstīts viņiem), tiek izlaistas. Paturēts: BH zem 5% pār katru novērtēto grupu, saraujama attiecība vismaz 1,25 (vai 1/1,25), četras no piecām daļām piekrīt, precizējums, kas tikai atkārto savu vecāku, netiek ņemts. Cilne **Nišas** tās uzskaita; klikšķis parāda katru vienas nosacījuma precizējumu grupai (pētnieks), **Ielādēt** ielādē tās mačus. Ieroču komplekti (loadouts) vēl nav kopsavilkumos.

Ceturtajai tabulai, **raundi** (`roundsTable`), mērķis ir raunda rezultāts: viena rinda uz katras dzīves raundu - karte, puse, mača daļa (raundi 1-4, 5-8, ...), transportlīdzeklis, visvairāk izmantotais ierocis, visilgāk noturētā vieta, pirkums, pirmais nogalinājums vai pirmā nāve - vērtēta pret savas puses uzvaru īpatsvaru savā mačā (Mantel-Haenszel stratificētā sagaidāmā vērtība: atlikums ir `won - e`, `e` puses daļa mačā), tāpēc niša nekad nav kartes vai puses balanss. Mači paliek klasteri. Tās z ir kalibrēts: tā pati staru meklēšana tiek palaista astoņas reizes ar rezultātiem, kas sajaukti starp katras puses raundiem katrā mačā (puses līmenis katrā mačā saglabāts), un šo nulles z izkliede virs standarta normālā sadalījuma - pēc nosacījumu skaita, no vidus (mediāna / 0,674) un astes (99. procentile / 2,576), lielākā, nekad zem 1 - dala īstos pirms to p un viltus atklājumu līmeņa (empīriskā nulle, Efron 2004). Dziļākas grupas saņem lielāko mērogu: stars patur precizējumus grupām, kas izvēlētas to lielā z dēļ. Nišas bāze ir tās pašas sagaidāmā vērtība, tās pacēlums - procentpunkti virs tās, un to sarindo pēc pacēluma reizinājuma ar tās raundu skaita kvadrātsakni, ko notur pierādījumi un locījumi (`wracc` ir atbalsts reiz pacēlums). Tā nes mačus, kuros tā izpaudās visvairāk (`matchIds`), un dažus to raundus (`rounds`, `[match, round]`) detalizētai izpētei.

#### Tendences ar praktisku nozīmīgumu {#meta-shifts-with-practical-significance}

Jauktos datumos binomiāls pēc dzīvībām atzīmēja gandrīz katru izmaiņu kā nozīmīgu. `meta` tagad testē kopu izturīgi (katra mača dzīvības ir kopa), paturot izmantošanas maiņu tikai ja tā ir 2 punkti un vismaz 25%, K/D maiņu 1,3 reizes, datumu ceturkšņus tendenci tajā pašā virzienā (Kendall tau vismaz 0,5) un, transportlīdzeklim vairākās kartēs, to pašu virzienu lielākajā daļā no tām. Tas atstāj tikai dažas maiņas testa kopā, kurā parastais tests atzīmēja gandrīz visas.

#### Modelim {#for-a-model}

`massReportForModel` katrai vietai dod tās `region` (forma, slēpta, acīmredzamība, augstumi, fāze) un katrai nišai tās `conditions`, plus to, cik reģionu un grupu tika izmēģināti. Zināšanu objektīvs var lasīt vietas kā nāves zonas un tuvošanās ceļus: to veidi ir `place.*` un `niche.*`.

#### Pārbaudes {#checks}

`scan.test.ts` ievieto izkliedētu laukumu (1,6 reizes nāves līmenis pār 22 šūnu apli, vāju katrā šūnā), koridoru, augstuma joslu un klasteri tikai vienā daļā 240 sintētiskos pārmērīgi izkliedētos mačos - visi tiek atrasti, izkliedētais slēpts - un palaiž astoņus nulles komplektus pa 60 mačiem: nekādas vietas.
`niche.test.ts` atrod ievietotu transportlīdzekļa x kartes x puses grupu un neko piecās nulles tabulās.
`outcome.test.ts` pārbauda 2. versijas kopsavilkumu (uzvarētie raundi pa pusēm, vienībām, spēlētājiem un ieročiem, `pw`, vienību raundi); ievieto joslu, kuras puse uzvar 70% savu raundu pret 35% (katram mačam savs balanss) - atrasta - un palaiž 20 nulles komplektus pa 50 mačiem, kur joslas neko nesaka: nekādas uzvaru īpatsvara vietas; ievieto AWP vienā kartē, kas uzvar savas puses raundus par 30 procentpunktiem vairāk - atrasts ar saviem mačiem un raundiem - un palaiž 30 nulles komplektus pa 80 mačiem, kur katram mačam savs balanss un viena puse ir stiprāka vienā kartē: nekādas nišas.
