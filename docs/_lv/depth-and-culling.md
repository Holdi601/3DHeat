---
title: "Dziļums un nogriešana"
parent: "Siltuma režīmi"
nav_order: 4
lang: "lv"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Dziļums un nogriešana

Dziļums liek kalniem un sienām paslēpt siltumu aiz sevis, tāpat kā reāla siena paslēpj cilvēku. Atmešana pēc attāluma atstāj tikai siltumu starp tuvo un tālo attālumu no kameras.

![Zema kamera aiz kalna, ar Slēpt aiz reljefa izslēgtu (pa kreisi) un ieslēgtu (pa labi)](../assets/img/en/depth-and-culling-terrain.webp)

![Atmešana pēc attāluma ar Tālā 400 m un Griezt arī līmeni ieslēgtu: griezums kartē ap kameru](../assets/img/en/depth-and-culling-far.webp)

Bez dziļuma siltumkarte virs 3D [līmeņa](levels.md) ir plakns pārklājums. Viss, ko datu kopa satur, spīd caur katru sienu pilnā stiprumā. Dziļuma pazīmes, ko dod līmenis, tiek anulētas, un karsts punkts ēkas iekšpusē izskatās tāpat kā tāds pats punkts uz tās jumta. Sadaļa **Dziļums** liek līmenim paslēpt to, kas atrodas aiz tā. **Atmešana pēc attāluma** ierobežo siltumu apvalkam vai plāksnei ap kameru, un [Griezums](slice.md) izgriež plāksni no pasaules. Visas trīs attiecas uz siltuma režīmiem un maina, kuras rindas dod ieguldījumu. Tāpēc, tās mainot, uzkrāšana sākas no jauna.

## Dziļums {#depth}

Abām vadībām vajag [līmeni](levels.md) — kartes attēlu vai 3D modeli. Ja līmenis nav ielādēts, nav aiz kā slēpties, un abas nedara neko. Abas ir izslēgtas, kamēr ieslēgta [Saplacināt uz zemes plaknes](sprite-shape.md#flatten-onto-ground-plane).

### Slēpt aiz reljefa {#hide-behind-terrain}

**Slēpt aiz reljefa** (noklusējums ieslēgts): datu punkts, kura tuvākā virsma virzienā uz kameru ir *zeme* (nevis būve), tiek pilnībā izmests, nevis tikai aptumšots.

Reljefs un sienas ir necaurspīdīgas dažādos veidos. Caur sienu tu skaties *tīšām*, lai redzētu, uz kura stāva bija satiksme. Caur kalnu tu nekad neskaties, jo aiz tā ir kartes tālā puse. Kartē, kas stiepjas pāri kilometriem, tā ir lielākā daļa datu, un tie horizontā saskaitās joslā, kas ir spilgtāka par visu priekšplānā. Viens aptumšojums nevar kalpot abiem, tāpēc reljefam ir griezuma robeža, bet sienām paliek zemāk esošais aptumšojums.

### Paslēpts aiz ģeometrijas {#hidden-behind-geometry}

**Paslēpts aiz ģeometrijas** (noklusējums 0,8): cik stipri tiek nomākts datu punkts, kas atrodas aiz līmeņa ģeometrijas. Vērtība 0 nozīmē *redzams caur*, starp tām *N % tumšāks* (slīdņa pozīcija, nevis izmērītais aptumšojums), bet 1 nozīmē *pilnībā paslēpts*.

Katra siena vai grīda starp punktu un kameru to vēl vairāk aptumšo. Noklusējumā viena siena atstāj dažus procentus, un katra papildu virsma atstāto daļu sadala uz pusēm, līdz četrām virsmām. Pie 1 nekas aiz ģeometrijas netiek zīmēts, un tas ir lētākais iestatījums.

Skat. arī [Līmeņa izskats](level-appearance.md).

## Atmešana pēc attāluma {#distance-culling}

**Atmešana pēc attāluma** (noklusējums aizvērta) ierobežo siltumu līdz rindām starp tuvo un tālo robežu no kameras. Iestati tālo robežu, lai lasītu blīvumu ēkas iekšpusē, bez tā, ka kartes tālā puse saskaitās virsū. Iestati tuvo robežu, lai lidotu *cauri* karstam punktam, nevis *ietrieties* tajā.

| Vadība | Noklusējums | Diapazons (kustināšana) | Nozīme |
|---|---|---|---|
| **Tuvā** | izslēgta | 0,5–5000 m, logaritmiski, apakšējie 5% no trases = izslēgts (200 000) | Rindas, kas ir tuvākas par šo, tiek izlaistas. |
| **Tālā** | izslēgta | 1–200 000 m, logaritmiski, apakšā = izslēgts (10 000 000) | Rindas, kas ir tālākas par šo, tiek izlaistas. |
| **Griezt pa plakni** | ieslēgts | | Robežas mēra pa skata asi, nevis no acs. Tāpēc griezums ir plakne, paralēla ekrānam, nevis sfēra ap tevi. Sfēras mala izliecas pāri kadram un slīd, kad pagriez. Plakne paliek tur, kur to novietoji. |
| **Griezt arī līmeni** | ieslēgts | | Griež zemi, būves un ūdeni tajās pašās robežās. Ja līmenis paliek vesels, griezums izņem datu punktus, un ēka paliek stāvam to priekšā. Ja griezti abi, tas ir griezums caur karti, un punkti atrodas pie savām sienām un grīdām. Šī vadība tikai pārzīmē; tā neatsāk uzkrāšanu. |

### Taustiņi {#keyboard}

Tālā robeža ir vadība, ko pārvelk. Ej ar to cauri ēkai un skaties, uz kura stāva parādās satiksme. Tāpēc tā ir uz tastatūras, kamēr lido ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Taustiņš | Efekts |
|---|---|
| `]` | Pārvieto tālo robežu uz āru ar koeficientu 1,12 (Shift: 1,35) |
| `[` | Pārvieto to uz iekšu ar to pašu koeficientu (Shift: ÷1,35) |
| `\` | Izslēdz tālo robežu vai ieslēdz atpakaļ attālumā, kur tā tika atstāta (pirmoreiz 6000) |

Soļi ir ģeometriski, jo derīgais diapazons aptver četras kārtas — no istabas līdz kartei. Taustiņi tālo robežu tur starp 100 un 400 000. Taustiņi nedara neko, kamēr teksta lodziņš vai izvēlne ir fokusā.

## Izstrādātājiem {#for-developers}

### Slēpt aiz reljefa {#hide-behind-terrain}

Konstrukcijas tiek zīmētas savā dziļuma tekstūrā. Fragments, kas ir aiz ainas dziļuma, bet *ne* aiz konstrukciju dziļuma, atrodas aiz zemes un tiek izmests. Tas maksā vienu dziļuma piegājienu pār konstrukcijām, kas tiek izlaists, kad slēdzis ir izslēgts.

### Paslēpts aiz ģeometrijas {#hidden-behind-geometry}

Tas tiek skaitīts **pa virsmām**. Viens dziļuma salīdzinājums var pateikt tikai "kaut kas ir priekšā". Tāpēc punkts aiz vienas sienas un punkts četrās istabās dziļāk ēkā tiktu aptumšoti vienādi, un iekšpuse izskatītos kā viens blāvs traips. Tā vietā ģeometrija tiek **dziļuma nolobīta** līdz 3 papildu slāņiem ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Katrs fragments skaita, cik virsmu ir tā priekšā (ainas pašas dziļums plus nolobītie slāņi: līdz četrām), un aptumšojums saskaitās:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Slīdnis | 1 virsma | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (noklusējums) | 4% | 2% | 1% | 0,6% (zemākā robeža) |
| 1,0 | nav zīmēts | nav zīmēts | nav zīmēts | nav zīmēts |

Kāpēc divi koeficienti: slīdnis ir kalibrēts tā, lai viena siena atstātu dažus procentus. Tas ir izskats, kas nolasās kā "aiz kaut kā". Vairāki procenti, kas saskaitās, pie trešās sienas būtu nekas. Katru papildu virsmu dalot uz pusēm, paliek četri atšķirami soļi. Kāpēc kvadrāts: lineārā funkcija piesātinātu lauku atstāja piesātinātu aiz sienas, bet ceturtā pakāpe pie 0,8 to izdzēsa. Kāpēc zemākā robeža: pilnīgi paslēpts siltums padara istabu, pilnu paslēptas satiksmes, izskatu kā tukšu istabu, bez nekā, kas liktu sniegties pēc [Griezuma](slice.md). Tikai slīdnis, kas nostiprināts pie 1, paslēpj pilnībā. Tas ir lētākais iestatījums, jo aizsegtie punkti tiek izmesti.

Kā ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), punktu siltuma šeideri): salīdzinājums notiek katrā fragmentā, pret ainas dziļuma tekstūru, **loga dziļumā**, nevis pasaules attālumā. Virsotņu posma dziļuma tekstūras nolasījums dažos draiveros (starp tiem ANGLE programmatūras rasterizētājs) lasa "tālu" visur. Abu dziļumu pārvēršana metros zaudē atšķirību precizitātes dēļ, ja diapazons starp tuvo un tālo ir plašs. Nobīde ir viena spraita rādiuss, pārvērsts loga vienībās, plus dažas mazākās bitu vērtības. Tāpēc punkts, kas atrodas uz virsmas, neaizēno pats sevi.

Konstrukcijas ir zīmētas caurspīdīgas, bet tās tiek zīmētas dziļumā, ko izmanto aizsegšana. Līmenis, kura konstrukcijas nebūtu sasniegušas dziļuma tekstūru, aizsegtos tikai pret reljefu.

### Atmešana pēc attāluma {#distance-culling}

Abas robežas tiek novērtētas virsotņu šeiderī, tāpēc izmests rindas punkts maksā vienu virsotni un nevienu fragmentu.
