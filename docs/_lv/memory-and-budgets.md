---
title: "Atmiņa un budžeti"
parent: "Datu ievade"
nav_order: 6
lang: "lv"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Atmiņa, budžeti un ietilpības pārbaude

Jūsu datoram ir ierobežota atmiņa. 3DHeat saskaita, cik atmiņas vajag jūsu failiem, un pirms **Ielādēt** pasaka, vai tie ietilpst.

![Atmiņas novērtējums: nav ietilpst, ar iepriekš aizpildītu Ielādēt katru [N] rindu un Ielādēt pogu, kurā rakstīts Pārāk liels - samaziniet vai retiniet](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Par lielu šim datoram? 3DHeat piedāvā ielādēt katru N-to rindu.*

Pārlūkprogrammas cilne, kurai ielādes vidū beidzas atmiņa, avarē un zaudē minūtes darba, un GPU, kam prasīts vairāk, nekā tam ir, vai nu zaudē kontekstu, vai palēninās līdz vilkšanai. Tāpēc pirms ielādes sākas avota panelis pasaka, cik atmiņas tā prasa, salīdzina to ar šai mašīnai noteiktajiem budžetiem un atsakās - ar izeju -, kad tas nederēs. Modelis atrodas [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Atmiņas novērtējums {#the-memory-estimate}

Rāda virs pogas **Ielādēt**, kad rindas ir saskaitītas.

| Rinda | Nozīme |
|---|---|
| **Atmiņas novērtējums** - *ietilpst* / *tuvu robežai* / *nav ietilpst* | Spriedums, zaļš, dzeltens vai sarkans. |
| `N rindas · B B/rinda` | Rindas, kas tiks ielādētas (pēc soļa), un pastāvīgie baiti uz rindu. |
| `RAM X rezidents, Y maksimums ielādes laikā` | Atmiņa, kas tiek turēta pēc ielādes, un augstākā atzīme ielādes laikā. |
| `GPU Z · ielādes laiks ap T` | GPU atmiņa rindām un paredzamais ilgums ar 1,2 miljoniem rindu sekundē. |
| GPU nosaukums | Renderētāja nosaukums, kad draiveris to ziņo. |
| Ziņojumi | Kāpēc nav ietilpst vai ir tuvu robežai, un ko darīt. |
| **Ielādēt katru [N] rindu** | Retināšanas solis (skat. zemāk). |
| `Budžets: X RAM, Y GPU. Pielāgojiet sadaļā Veiktspēja → Resursu budžeti.` | Budžeti, ko pārbaude izmantoja. |

### Baiti uz rindu {#bytes-per-row}

| Kolonna | Pastāvīgi (RAM) | Piezīmes |
|---|---|---|
| Pozīcija | 12 | Trīs 32 bitu peldošā komata skaitļi, vienmēr (plakana ass ir tāpat masīvs) |
| Laiks | 4 | Kad ir kartēts |
| Dzīves ilgums | 4 | Kad ir kartēts laiks un persona |
| Persona | 4 | Kad ir kartēta |
| Grupa | 2 | Kad ir kartēta |
| Sesija | 4 | Kad ir kartēta |
| `Source file` | 4 | Kad ir ielādēts vairāk nekā viens fails |
| Katra filtra kolonna | 4 | Uz katru atzīmēto kolonnu *Saglabāt filtrēšanai* |

**Maksimums** pieskaita to, ko ielāde vajag tikai uz brīdi - 8 baiti 64 bitu laikam apvienošanas laikā, 12 baiti kārtošanas atslēgām un indeksiem, 4 baiti permutācijas darbam (visi trīs, kad laiks ir kartēts), un 4 baiti, kamēr grupas kolonna vēl ir 32 bitu - un reizina summu ar **2,0**. Šis koeficients ir izmērīts (reāla vairāku failu ielāde sasniedza 1,9× no uzskaitītajiem masīviem, no Parquet dekodera darba kopas, kopijām, kas apgriež katru kolonnu līdz garumam, un atmiņas, kas ir atbrīvota, bet vēl nav atgriezta) un noapaļots uz augšu, jo par zemu novērtējums maksā avārijā cilni, bet par augstu novērtējums maksā tikai nevajadzīgu soli.

Uz **GPU** katra rinda maksā 8 baitus (pozīcija un grupa, katrs pa 16 bitiem), plus 4 baiti (laiks un dzīves ilgums, katrs pa 16 bitiem), kad ir kartēts gan laiks, gan persona. Skat. [GPU atmiņas noturība](gpu-memory.md). Filtru tekstūras (4 baiti rindā uz katru aktīvo filtru) un līniju siltuma segmentu sākumi (8 baiti rindā, kamēr ir ieslēgts Līniju režīms) šajā novērtējumā nav iekļauti.

## Ietilpības pārbaude {#the-fit-check}

Salīdzina trīs ierobežojumus ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- maksimālā RAM pret **RAM budžetu**,
- GPU baiti pret **GPU budžetu**,
- rindu skaits pret **kārtošanas griestiem** 400 000 000 rindu, kad ir kartēta laika kolonna.

Lielākais no trim attiecībām izlemj: līdz 70% - *ietilpst*, līdz 100% - *tuvu robežai* (tam vajadzētu ielādēties, bet gaidiet, ka būs lēni), virs tā - *nav ietilpst*. Kad nederēs, panelis nosauc saistošo ierobežojumu un iesaka:

- ielādēt katru *N*-to rindu, ar *N* = ⌈rindas / rindas, kas ietilpst⌉, iepriekš aizpildītu soļa lodziņā;
- nomest filtru kolonnas, atkartēt laika kolonnu (kas noņem kārtošanu un tās griestus, bet zaudē laika skalu) vai palielināt budžetu.

Kad pats budžets nav fakts par aparatūru - pārlūkprogramma ir ierobežojusi RAM skaitli, noklusējumu pieturējis tas, kas tobrīd ir brīvs, vai GPU skaitlis ir minējums -, ziņojums to saka, lai jūs nesniegtos pēc soļa, kas nav vajadzīgs.

### Retināšana {#decimation}

**Ielādēt katru [N] rindu** saglabā vienu rindu no *N*, skaitot pa failiem. Siltums ir vidējais, tāpēc katra *N*-tā rinda dod to pašu sadalījumu ar vairāk trokšņa - tas pats kompromiss, ko renderētājs jau katru kadru izdara. Lodziņš sākas ar 1 (*rinda (visas)*); kad izvēle nederēs, tas tiek iepriekš aizpildīts ar ieteikto soli, ja vien jūs tajā neesat rakstījis. Ielādes poga tad rāda *Ielādēt N failus (1 no K)*, un datu kopas nosaukumā tiek ierakstīts `every Kth row`.

### Kārtošanas griesti {#the-sort-ceiling}

Renderētājam rindas jāsaņem augošā laika secībā, tātad kartēta laika kolonna nozīmē katras rindas kārtošanu ar radix kārtošanu pār 32 bitu atslēgām ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Pāri **400 miljoniem** rindu to atsaka, nevis mēģina cilnē. Tas tiek pārbaudīts pirms ielādes, tātad izvēle virs robežas tiek noraidīta ar soļa ieteikumu, nevis nolasīta pilnībā un nomirstu pēdējā solī. Tuvu robežai (*tuvu robežai*) panelis brīdina, ka kārtošana ir garš posms bez paša progresa. Bez laika kolonnas kārtošana nenotiek un griestu nav.

## Resursu budžeti {#resource-budgets}

**Veiktspēja → Resursu budžeti** (sakļaujama rinda Veiktspējas paneļa apakšā, kur rakstīts `Resursu budžeti - RAM, GPU, kodoli`). Budžeti tiek noteikti; noteiktā vērtība ir noklusējums; un slīdņi nevar pāriet **griestus**, kas ir noteiktā vērtība, izņemot gadījumus, kad noteikšana ir zināma kā ne mērījums.

| Vadība | Diapazons | Nozīme |
|---|---|---|
| **RAM rindu datiem** | 256 MiB līdz RAM griestiem, logaritmisks | RAM budžets ietilpības pārbaudei. Atzīmēts *(virs noteiktā)* pāri noteiktajam noklusējumam, *(maks.)* pie griestiem. |
| **GPU rindu datiem** | 128 MiB līdz GPU griestiem, logaritmisks | GPU budžets ietilpības pārbaudei un rindu augšupielādei. Atzīmēts *(virs noteiktā)* pāri noteiktajam noklusējumam, *(maks.)* pie griestiem. |
| **Parsētāja pavedieni** | 1 līdz loģisko kodolu skaitam | Cik failus ielāde parsē vienlaikus, katru savā darbiniekā. Noklusējums kodoli - 2 (kodoli - 1 četros vai mazāk kodolos). Skat. [Parsētāja pavedieni](#parser-threads) (sadaļā Izstrādātājiem). |
| Avotu rinda | | No kurienes nāca katrs skaitlis (`RAM: …. GPU: …. CPU: ….`). |
| **Noteikt vēlreiz** | | Lūdz izstrādes serveri jaunu atmiņas rādījumu un pārrēķina katru budžetu. |
| GPU nosaukums | | Adaptera īsais nosaukums; pilns renderētāja teksts ir rīkjosla. |

### GPU budžeta paaugstināšana {#raising-the-gpu-budget}

GPU budžets virs noteiktās vērtības tiek piemērots, kā uzstādīts: ietilpības pārbaude un augšupielāde ņem to pašu vērtību no vienas funkcijas ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), kas to ierobežo tikai ar GPU griestiem, līdz kuriem slīdnis iet. Tātad ielāde, ko pārbaude pieņem, tiek augšupielādēta pilnībā. Pāri noteiktajai vērtībai slīdnis rāda *(virs noteiktā)*: skaitlis tad ir jūsu spriedums par karti, nevis mērījums, un uzstādīt to augstāku nekā kartei ir riski zaudēt kontekstu vai vilkties.

## Milzīgas datu kopas: svira {#huge-datasets-the-levers}

No vislētākā līdz visdrastiskākajam:

1. **Mazāk filtru kolonnu.** Katra ir 4 baiti uz rindu un viena dekodēšanas kārta.
2. **Solis.** Katra *N*-tā rinda.
3. **Bez laika kolonnas.** Nav kārtošanas, nav kārtošanas griestu, nav 4-8 baitu uz rindu laika un dzīves ilguma - un nav laika skalas.
4. **Paaugstiniet budžetus**, kad zināt, ka atmiņa ir.

Renderēšanas laikā lielas datu kopas tiek apstrādātas ar paraugu ņemšanu un progresīvu uzkrāšanu, nevis samazinot datus; skat. [Paraugu ņemšana un budžeti](sampling-and-budgets.md).

## Izstrādātājiem {#for-developers}

### Parsētāja pavedieni {#parser-threads}

Vairāku failu ielāde parsē līdz **Parsētāja pavedieniem** no tiem vienlaikus, katru parsētāja darbiniekā, ko sāk ievades darbinieks šai ielādei ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Ja ir 1 vai viens fails, faili tiek parsēti viens pēc otra pašā ievades darbiniekā.

Vairāku vienlaicīga palaišana neatslābina ietilpības pārbaudi:

- **Vispirms tiek skaitīts apvienotājs.** Apvienotās kolonnas tiek piešķirtas visai izvēlei pirms pirmā faila nolasīšanas, tātad failiem lidojumā paliek tikai tas, ko RAM budžets atstāj blakus (`parseHeadroom`): pozīcija, 64 bitu laiks, skatīšanās leņķi, persona, 32 bitu grupa, sesija, filtru kolonnas un `Source file`, uz katru ielādējamo rindu - reizināts ar 2,6, kad rindu skaits ir CSV novērtējums, lai kolonna augtu par lielāku.
- **Katrs fails rezervē savas izmaksas, pirms sākas** (`fileParseBytes`): tā rindas (no Parquet kājenes; CSV daļa no novērtējuma pēc izmēra) reizināts ar tām pašām kolonnām, reizināts ar **8** - pats bloks, kopija blakus, kamēr rindas bez pozīcijas tiek nomestas, un dekodera darba kopa, kas teksta kolonnām ir daudz lielāka nekā to id. Solis to nesamazina, jo faili tiek nolasīti pilnībā un pēc tam retināti. Skaitlis 8 ir pieļaujamais, kas izvēlēts mērot: ar 3 vai 5 trīsdesmit parsētāja pavedieni pārsniedza cilnes robežu 86 miljonos rindu ar personu un sesiju nosaukumiem; ar 8 - nē.
- **Cits fails sākas tikai tad, ja tā rezervācija ietilpst** tajā, kas paliek. Fails, kas ir pabeigts, bet gaida agrāka apvienošanu, patur savu rezervāciju līdz apvienošanai.
- **Viens fails vienmēr darbojas.** Kad nekas nav rezervēts, nākamais fails sākas neatkarīgi no izmaksām - tā ir ielāde pa vienam, ko ietilpības pārbaude pieļāva, tātad šaurs budžets atgriežas pie tās, nevis atsakās.

Skaitlis *maksimums ielādes laikā* ir viena faila pa vienam ielādes maksimums, kas notiek kārtošanas brīdī, pēc tam, kad visi faili ir nolasīti. Blakus parsētie faili var pārsniegt šo skaitli, kamēr tie tiek nolasīti; rezervācijas tur to RAM budžeta robežās, ciktāl augstāk esošie novērtējumi ir pareizi.

Apvienošanas secība ir izvēles secība neatkarīgi no tā, kādā secībā faili beidzas; tātad personu, grupu un sesiju numerācija, rindas un `Source file` vērtības ir identiskas ielādei pa vienam. Fails, ko nevar nolasīt, tiek izlaists un uzskaitīts tieši kā agrāk. Parsētāja darbinieks, kas nomirst, beidz visu ielādi, kā vienmēr darīja ievades darbinieka nāve, un katrs parsētāja darbinieks tiek apturēts, kad ielāde beidzas, neatkarīgi no tā, kā tā beidzas. Ja parsētāja darbiniekus nevar sākt vispār, faili tiek parsēti ievades darbiniekā.

### Kā tiek noteiktas vērtības {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) darbojas palaišanas brīdī, vēlreiz, kad renderētājs ir gatavs, un pie **Noteikt vēlreiz**.

**RAM, ar izstrādes serveri.** `start.bat` un `npm run dev` lapu pasniedz no procesa, kas var nolasīt mašīnas atmiņu, pie `/__host/memory` (atbild 1,5 s laikā vai tiek ignorēts). Noklusējums ir mazākais no 60% uzstādītās RAM un 80% pašlaik brīvās RAM; griesti ir 60% uzstādītās. Kad noklusējumu tur zemu brīvā atmiņa, panelis to saka un iesaka aizvērt programmas un nospiest **Noteikt vēlreiz**.

**RAM, bez tā** (statiska izvietošana): nevienas pārlūkprogrammas API nerāda brīvo atmiņu, un `navigator.deviceMemory` ir noapaļots uz leju līdz divu pakāpei un ierobežots ar 8 GiB Chrome un Edge. Noklusējums ir 60% no `deviceMemory`, papildus ierobežots ar 4 × cilnes brīvo JS kaudzi, kur pārlūkprogramma to rāda, vai 4 GiB, kad nekas nav ziņots. Kad `deviceMemory` rāda tieši 8 (ierobežojums), vērtība tiek atzīmēta kā *ierobežota*, un griesti ir 4 × noklusējums, ar piezīmi, ka pāri noklusējumam skaitlis ir jūsu apgalvojums, nevis mērījums.

**Abos gadījumos** RAM noklusējums un griesti ir ierobežoti līdz **12 GiB** - lielākā tipizēto masīvu atmiņa, ko viena Chrome cilne var turēt neatkarīgi no mašīnas (lapa sasniedza apmēram 15,75 GB un neizdevās; 12 atstāj vietu visam pārējam) - un nekad nav zem 256 MiB.

**GPU atmiņa.** Neviens tīmekļa API to nerāda.

- Ar izstrādes serveri kartes atmiņu nolasa `nvidia-smi` (lielākais adapteris) vai, Windows, no displeja adaptera reģistra vērtības `HardwareInformation.qwMemorySize`. Noklusējums ir 70% no tā, griesti 90%.
- Bez rādījuma tā tiek secināta: pēc noklusējuma 2 GiB; 4 GiB, kad lielākā tekstūra ir 16 384 px vai vairāk (diskrēta karte), 1 GiB, kad mazāka; vai 8 × WebGPU `maxBufferSize`, ja tas ir lielāks. Griesti tad ir 8 × secinātā vērtība, jo secinājums atšķir integrēto daļu no diskrētās, un nekas smalkāks. Panelis saka, ka vērtība ir secināta.
- Nekad zem 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4, ja nav ziņots).
