---
title: "Memorja u baġits"
parent: "Kif tidħol id-data"
nav_order: 6
lang: "mt"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memorja, baġits u l-kontroll tal-adattament

Il-kompjuter tiegħek għandu memorja limitata. 3DHeat jgħodd x'jeħtieġu l-fajls tiegħek u jgħidlek qabel **Għabbi** jekk jidħlu.

![Il-Memory estimate jgħid won't fit, b'Għabbi kull [N] ringiel mimli minn qabel u l-buttuna Load taqra Too large - reduce or decimate](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Kbir wisq għal dan il-kompjuter? 3DHeat jissuġġerilek li tgħabbi kull N-ta ringiel minflok.*

Tab tal-browser li jispiċċa mill-memorja f'nofs tagħbija jaħbat u jitlef minuti ta' xogħol, u GPU li titlob aktar minn dak li għandha titlef il-kuntest tagħha jew tibqa' bil-mod ħafna. Allura qabel tibda tagħbija, il-pannell tas-Sors jgħid kemm memorja tieħu, iqabbel dan ma' baġits misjuba għal din il-magna, u jirrifjuta - b'mod kif toħroġ - meta ma jidħolx. Il-mudell hu f'[`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Il-stima tal-memorja {#the-memory-estimate}

Muri fuq il-buttuna **Għabbi** ladarba jkunu għuddu r-ringieli.

| Linja | Tfisser |
|---|---|
| **Memory estimate** - *fits* / *tight* / *won't fit* | Il-verdett, aħdar, kannella jew aħmar. |
| `N rows · B B/row` | Ringieli li jitgħabbew (wara l-passi) u l-bytes stabbli għal kull ringiel. |
| `RAM X resident, Y peak while loading` | Memorja miżmuma ladarba mgħobbija, u l-ogħla punt waqt it-tagħbija. |
| `GPU Z · est. load T` | Memorja GPU għar-ringieli, u dewmien stmat f'1.2 miljun ringiel kull sekonda. |
| Isem tal-GPU | L-isem tar-renderer, meta d-driver jirrapportah. |
| Messaġġi | Għaliex ma jidholx, jew għaliex huwa mqiegħed, u x'għandek tagħmel. |
| **Għabbi kull [N] ringiel** | Il-pass tal-iddeċimar (ara hawn taħt). |
| `Budget: X RAM, Y GPU. Adjust under Performance → Resource budgets.` | Il-baġits li l-kontroll użax. |

### Bytes għal kull ringiel {#bytes-per-row}

| Kolonna | Stabbli (RAM) | Noti |
|---|---|---|
| Pożizzjoni | 12 | Tlitt float ta' 32-bit, dejjem (anke assi ċatt huwa array) |
| Ħin | 4 | Meta mmappjat |
| Ħajja | 4 | Meta l-ħin u l-persuna mmappjati |
| Persuna | 4 | Meta mmappjata |
| Grupp | 2 | Meta mmappjat |
| Sessjoni | 4 | Meta mmappjata |
| `Source file` | 4 | Meta aktar minn fajl wieħed ikun mgħobbi |
| Kull kolonna tal-filtru | 4 | Għal kull kolonna mmarkata *Żomm għall-filtrar* |

Il-**peak** iżid dak li t-tagħbija teħtieġ biss għal żmien qasir - 8 bytes tal-ħin 64-bit waqt l-għaqda, 12 bytes tal-ċwievet tal-issortjar u l-indiċi, 4 bytes tal-permutazzjoni tal-iskrars (it-tlieta kollha meta l-ħin ikun mmappjat), u 4 bytes waqt li l-kolonna tal-grupp tkun għadha 32-bit - u jimmultiplika s-somma b'**2.0**. Dan il-fattur ġie kkejjel (tagħbija multi-fajl reali laħqet 1.9× l-arrays imħassba, mill-working set tad-decoder tal-Parquet, il-kopji li jnaqqsu kull kolonna għat-tul tagħha, u memorja rilaxxata iżda għadha ma rritornatx) u ġie aġġustat 'il fuq, għax stima baxxa tiswa tab maqtul, filwaqt li stima għolja tiswa biss stride bla bżonn.

Fuq il-**GPU** kull ringiel jiswa 8 bytes (il-pożizzjoni u l-grupp, 16-il bit kull wieħed), flimkien ma' 4 bytes (il-ħin u l-ħajja, 16-il bit kull wieħed) meta t-tnejn il-ħin u l-persuna jkunu mmappjati. Ara [Residenza tal-memorja tal-GPU](gpu-memory.md). It-texture tal-filtri (4 bytes kull ringiel għal kull filtru attiv) u l-bidu tas-segmenti tal-line heat (8 bytes kull ringiel waqt li l-modalità Lines tkun mixgħula) m'humiex parti minn din l-istima.

## Il-kontroll tal-adattament {#the-fit-check}

Tlieta mill-limiti jitqabblu ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- il-peak tar-RAM kontra l-**baġit tar-RAM**,
- il-bytes tal-GPU kontra l-**baġit tal-GPU**,
- l-għadd tar-ringieli kontra l-**limitu tal-issortjar** ta' 400,000,000 ringiel, meta tkun mmappjata kolonna tal-ħin.

L-aktar proporzjon ta' dawk it-tlieta jiddeċiedi: sa 70% *fits*, sa 100% *tight* (għandu jitgħabba, imma stenna li jkun bil-mod), 'l fuq minn hekk *won't fit*. Meta ma jidholx, il-pannell isemmi l-limitu li jorbot u jissuġġerixxi:

- it-tagħbija ta' kull *N*-ta ringiel, b'*N* = ⌈ringieli / ringieli li jidħlu⌉, imqiegħda minn qabel fil-kaxxa tal-pass;
- it-tkeċċija ta' kolonni tal-filtru, it-tneħħija tal-mmappjar tal-kolonna tal-ħin (li tneħħi l-issortjar u l-limitu tiegħu, bl-ispiża tal-linja tal-ħin), jew it-tlugħ tal-baġit.

Meta l-baġit innifsu ma jkunx fatt dwar il-hardware - il-browser ikkapjaha l-figura tar-RAM, id-default kien imnaqqas minn dak li hu ħieles f'dan il-mument, jew il-figura tal-GPU hija tahmin - il-messaġġ jgħid dan, sabiex ma tiħux pass tal-istride li ma tkunx tħtieġ.

### Iddeċimar {#decimation}

**Għabbi kull [N] ringiel** iżomm ringiel minn kull *N*, imgħodd għal kull fajl. Is-heat huwa medja, allura kull *N*-ta ringiel tagħti l-istess distribuzzjoni b'aktar storbju - l-istess kompromess li r-renderer diġà jagħmel kull frame. Il-kaxxa tibda minn 1 (*row (all)*); meta l-għażla ma tidħolx, tiġi mimlija minn qabel bl-istride suġġerit sakemm ma tkunx ikteb fiha int. Il-buttuna Għabbi mbagħad taqra *Għabbi N fajls (1 minn K)*, u l-isem tas-dataset jiġbed `every Kth row`.

### Il-limitu tal-issortjar {#the-sort-ceiling}

Ir-renderer iħtieġ ringieli fl-ordni ta' ħin li jiżdied, allura kolonna tal-ħin immappjata tfisser li kull ringiel jiġi issortjat, b'radix sort fuq ċwievet ta' 32-bit ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Fuq **400 miljun** ringiel dan jiġi rrifjutat minflok ma jiġi ppruvat f'tab. Dan jiġi ċċekkjat qabel it-tagħbija, allura għażla ta' fuq il-limitu tiġi rrifjutata b'suġġeriment ta' stride minflok ma tinqara kollha u tfalli fl-aħħar pass. Qrib il-limitu (*tight*) il-pannell iwissi li l-issortjar huwa pass twil bla progress tiegħu. Mingħajr kolonna tal-ħin ma ssir l-ebda sortjar u l-ebda limitu ma japplika.

## Baġits tar-riżorsi {#resource-budgets}

**Performance → Resource budgets** (linja li tinfetaħ u tingħalaq fil-qiegħ tal-pannell Performance, li taqra `Resource budgets - RAM, GPU, cores`). Il-baġits jinstabu awtomatikament; il-figura misjuba hija d-default; u s-sliders ma jmorrux aktar 'il fuq minn **limitu** li hu l-figura misjuba ħlief fejn is-sejba hija magħrufa li mhijiex kejl.

| Kontroll | Firxa | Tfisser |
|---|---|---|
| **RAM għad-dejta tar-ringieli** | 256 MiB sal-limitu tar-RAM, logaritmika | Il-baġit tar-RAM għall-kontroll tal-adattament. Immarkat *(above detected)* wara d-default misjub, *(max)* fil-limitu. |
| **GPU għad-dejta tar-ringieli** | 128 MiB sal-limitu tal-GPU, logaritmika | Il-baġit tal-GPU għall-kontroll tal-adattament u għat-tagħbija tar-ringieli fuq il-GPU. Immarkat *(above detected)* wara d-default misjub, *(max)* fil-limitu. |
| **Threads tal-parser** | 1 sa l-għadd tal-cores loġiċi | Kemm fajls titgħabba l-istess ħin, kull wieħed f'worker tiegħu. Default cores - 2 (cores - 1 f'erba' cores jew inqas). Ara [Threads tal-parser](#parser-threads) (taħt For developers). |
| Linja tas-sorsi | | Min ġab kull figura (`RAM: …. GPU: …. CPU: ….`). |
| **Erġa' skopri** | | Titlob kejl ġdid tal-memorja mis-server tal-iżvilupp u jerġa' jikkalkula kull baġit. |
| Isem tal-GPU | | L-isem qasir tal-adapter; l-istring sħiħ tar-renderer huwa t-tooltip. |

### Tlugħ tal-baġit tal-GPU {#raising-the-gpu-budget}

Baġit tal-GPU ogħla mill-figura misjuba japplika kif imqiegħed: il-kontroll tal-adattament u t-tagħbija jieħdu l-istess figura minn funzjoni waħda ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), li tillimitah biss għal-limitu tal-GPU li s-slider jieqaf fih. Allura tagħbija li l-kontroll jgħaddi tiġi mtella' kollha. Lil hinn mill-figura misjuba, is-slider jaqra *(above detected)*: in-numru allura huwa l-ġudizzju tiegħek dwar il-kard, u mhux kejl, u li tpoġġih ogħla minn dak li l-kard għandha jirriskja li tintilef il-kuntest jew li tibqa' bil-mod.

## Oġġetti kbar ħafna: il-levers {#huge-datasets-the-levers}

Mill-irħas għall-aktar drastiku:

1. **Inqas kolonni tal-filtru.** Kull waħda hija 4 bytes kull ringiel u pass tad-decode.
2. **Stride.** Kull *N*-ta ringiel.
3. **L-ebda kolonna tal-ħin.** L-ebda sortjar, l-ebda limitu tal-issortjar, l-ebda 4-8 bytes kull ringiel tal-ħin u l-ħajja - u l-ebda linja tal-ħin.
4. **Tlugħ tal-baġits**, meta tkun taf li l-memorja hemm.

Waqt ir-rendering, dejta kbira titmexxa b'sampling u akkumulazzjoni progressiva minflok ma titnaqqas; ara [Sampling u baġits](sampling-and-budgets.md).

## Għall-iżviluppaturi {#for-developers}

### Threads tal-parser {#parser-threads}

Tagħbija ta' diversi fajls tiġbed sa **Threads tal-parser** minnhom f'daqqa, kull wieħed f'worker tal-parser tiegħu mibda mill-worker tal-ingest għal dik it-tagħbija ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Fuq 1, jew għal fajl wieħed, il-fajls jiġu pparsjati wieħed wara l-ieħor fil-worker tal-ingest innifsu.

Li jaħdmu diversi f'daqqa ma jrilassax il-kontroll tal-adattament:

- **Il-builder jitgħadd l-ewwel.** Il-kolonni magħquda jitqassmu għall-għażla kollha qabel ma jinqara l-ewwel fajl, allura l-fajls li jkunu għaddejjin jieħdu biss dak li l-baġit tar-RAM iħalli lilhom (`parseHeadroom`): pożizzjoni, ħin 64-bit, angoli tal-ħarsa, persuna, grupp 32-bit, sessjoni, kolonni tal-filtru u `Source file`, għal kull ringiel li jrid jitgħabba - imdawwal 2.6 meta l-għadd ta' ringieli huwa stima ta' CSV, għal kolonna li tikber f'waħda akbar.
- **Kull fajl jirriżerva l-ispiża tiegħu qabel ma jibda** (`fileParseBytes`): ringieli tiegħu (mill-footer tal-Parquet; sehem CSV mill-istima skont id-daqs) imdawwal bl-istess kolonni, imdawwal bi **8** - il-blokk innifsu, il-kopja ħdejh waqt li jitneħħew ringieli mingħajr pożizzjoni, u l-working set tad-decoder, li għall-kolonni tat-test huwa ferm akbar mill-ID tagħhom. Stride ma jnaqqasx dan, għax il-fajls jinqraw sħaħ u jiġu iddeċimati wara. L-8 huwa allowance misjub bil-kejl: bi 3, jew bi 5, tletin thread tal-parser ġarrew tab lil hinn mil-limitu tiegħu fuq 86 miljun ringiel b'ismijiet ta' persuni u ta' sessjonijiet; bi 8 le.
- **Fajl ieħor jibda biss jekk ir-riservazzjoni tiegħu tidħol f'dak li jkun baqa'.** Fajl li spiċċa iżda qiegħed jistenna li wieħed ta' qabel jiġi magħqud jibqa' jżomm ir-riservazzjoni tiegħu sakemm jiġi magħqud.
- **Fajl wieħed dejjem jaħdem.** Meta ma tkun riservata xejn, il-fajl li jmiss jibda għalkemm jiswa kemm jiswa - dik hija t-tagħbija waħda minn wara l-ieħor li l-kontroll tal-adattament ħalla tgħaddi, allura baġit ristrett jaqa' għaliha minflok ma jirrifjutaha.

Il-figura *peak while loading* hija l-peak ta' tagħbija waħda minn wara l-oħra, li tasal fl-issortjar, wara li jkunu nqraw il-fajls kollha. Fajls ipparsjati flimkien jistgħu jieħdu memorja aktar minn dik il-figura waqt li jinqraw; ir-riservazzjonijiet iżommuha fil-limitu tal-baġit tar-RAM, sa fejn l-istimi hawn fuq huma korretti.

L-ordni tal-għaqda hija l-ordni tal-għażla, għal kwalunkwe ordni li fiha jispiċċaw il-fajls, allura n-numerazzjoni tal-persuna, tal-grupp u tas-sessjoni, ir-ringieli u l-valuri `Source file` huma identiċi għal tagħbija waħda minn wara l-oħra. Fajl li ma jistax jinqara jitħalla barra u jitniżżel bħal qabel. Worker tal-parser li jmut itemm it-tagħbija kollha, bħalma dejjem għamel il-mewt tal-worker tal-ingest, u kull worker tal-parser jitwaqqaf meta t-tagħbija tintemm, kif tintemm. Jekk worker tal-parser ma jistgħux jibdew xejn, il-fajls jiġu pparsjati fil-worker tal-ingest.

### Kif jinstabu l-figuri {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) jaħdem meta jibda s-sistema, għal darba oħra ladarba jeżisti r-renderer, u fuq **Erġa' skopri**.

**RAM, bis-server tal-iżvilupp.** `start.bat` u `npm run dev` iservu l-paġna minn proċess li jista' jaqra l-memorja tal-magna, fuq `/__host/memory` (jitwieġeb fi 1.5 s jew jiġi injorat). Id-default huwa l-inqas minn 60% tal-RAM installata u 80% tar-RAM ħielsa bħalissa; il-limitu huwa 60% tal-installata. Meta l-memorja ħielsa tkun dik li żżomm id-default baxx, il-pannell jgħid dan u jissuġġerixxi li tagħlaq programmi u tagħfas **Erġa' skopri**.

**RAM, mingħajr dan** (deployment statiku): l-ebda API tal-browser ma tirrapporta l-memorja ħielsa, u `navigator.deviceMemory` jitnaqqas għal qawwa ta' tnejn u jiġi mgħobbi f'8 GiB minn Chrome u Edge. Id-default huwa 60% tal-`deviceMemory`, imnaqqas aktar għal 4 × il-heap JS ħieles tat-tab fejn il-browser jirrapportah, jew 4 GiB meta ma jiġi rrapportat xejn. Meta `deviceMemory` jaqra eżattament 8 (il-limitu), il-figura titqies *capped* u l-limitu huwa 4 × id-default, bi nota li lil hinn mid-default in-numru huwa l-asserzjoni tiegħek, mhux kejl.

**Bil-mod kif jkun**, id-default u l-limitu tar-RAM huma mnaqqsa għal **12 GiB**, l-ogħla memorja tat-tipi ta' typed-array li tab ta' Chrome tista' tiżżomm irrispettivament mill-magna (paġna laħqet madwar 15.75 GB u falliet; 12 jħalli spazju għal kollox l-ieħor), u qatt ma jinzlu taħt 256 MiB.

**Memorja tal-GPU.** Ebda API tal-web ma tirrapportaha xejn.

- Bis-server tal-iżvilupp, il-memorja tal-kard tinqara minn `nvidia-smi` (l-akbar adapter) jew, fuq Windows, mill-valur tar-reġistru `HardwareInformation.qwMemorySize` tal-adapter tal-wiri. Id-default huwa 70% tagħha, il-limitu 90%.
- Mingħajr qari, tkun inferita: 2 GiB b'default; 4 GiB meta l-akbar texture tkun 16,384 px jew aktar (kard diskreta), 1 GiB meta tkun iżgħar; jew 8 × il-`maxBufferSize` tal-WebGPU meta dan ikun akbar. Il-limitu allura huwa 8 × il-figura inferita, għax l-inferenza tgħid parti integrata minn waħda diskreta u xejn aktar fin minn hekk. Il-pannell jgħid li l-figura hija inferita.
- Qatt taħt 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 meta ma jiġix rrapportat).
