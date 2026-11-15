---
title: "Sampling u baġits"
parent: "Id-dettalji tar-rendering"
nav_order: 3
lang: "mt"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Kampjunar u bagħtiet

Meta jkun hemm wisq tikek biex jinġibdu f'frame wieħed, il-viewer jiġbed kampjun ugwali u jagħmel lil kull tikka tgħodd iktar, sabiex l-istampa tibqa' korretta. Kontrollur jaġġusta kemm jiġbed sabiex il-viewer iżomm il-frame rate tiegħu.

## Kontrolli tal-pannell tal-prestazzjoni {#performance-panel-controls}

| Kontroll | Default | Firxa (jog) |
|---|---|---|
| **Pinġi kull ringiela f'kull frame** | mixgħul | |
| **Baġit adattiv** | mixgħul | |
| **FPS immirati** | 60 | 20-240 (1000) |
| **Sprites / frame tal-bidu** (adattiv) jew **Sprites / frame** | 4.00M | 65,536-268,435,456, logaritmika (268,435,456) |
| **Riżoluzzjoni tas-sħana** | 100% | 25-100%, immultiplikata bil-iskala tat-tieni stadju adattiv |
| **Raffinament progressiv** | mixgħul | Mitfi: kull frame hu stima ġdida ta' frame wieħed (utli biex tara l-kampjun raw). |

Ara wkoll [Il-pannell tal-prestazzjoni u l-overlay tal-istatistika](performance-and-stats.md).

## Għall-iżviluppaturi {#for-developers}

### Ringieli kandidati {#candidate-rows}

Ringieli jinħażnu f'ħin ta' tlugħ. Il-firxa taż-żmien tal-linja taż-żmien [*lo*, *hi*] issir firxa ta' ringieli b'żewġ binary searches fuq il-kolonna taż-żmien ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); mingħajr kolonna taż-żmien kull ringiela tkun kandidata. Dawn huma l-**Ringieli fit-tieqa** tal-overlay tal-istatistika. It-testijiet għal kull ringiela - filtri, gruppi, qsim, qtugħ, qtugħ tal-qoxra, ħajja - isiru aktar tard, fis-shader; ringiela li tfalli tiswa invokation ta' vertex wieħed u ebda fragment.

### Il-pjan tal-kampjunar {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) jaqsam il-firxa tal-kandidati f'**blokki ta' 4,096 ringiela konsekuttiva** u jagħżel kemm għandu jinġibed mill-baġit tal-sprites tal-frame:

- Jekk il-baġit jkopri l-blokki kollha, jinġibdu kollha - il-frame hu eżatt.
- Inkella l-blokki jittieħdu b'pass ugwali fuq il-firxa, offset minn jitter li jitlaq bi ħdax-il proporzjon tad-deheb f'kull frame, sabiex frames suċċessivi jkopru blokki differenti u l-unjoni timtela b'mod ugwali. Dan hu kampjun **stratifikat**: kull parti tal-firxa taż-żmien tkun fil-frame kull darba.

Is-sħana ta' kull ringiela miġbuda timtellaq bi **kandidati / sottomessi**, sabiex is-sħana mistennija ta' frame tkun eżatta f'kull baġit; biss ir-rumur jiddependi mill-baġit. Ringieli jgħixu f'biċċiet ta' 8,388,608 (ara [Residenza tal-memorja tal-GPU](gpu-memory.md)); blokk jinqasam meta jaqsam bċċa, u kull biċċa tieħu l-lista tal-bidu tal-blokki li għandha tiġbed.

Pjan wieħed jista' jkollu mill-iktar 65,536 blokk - 268,435,456 sprite - għax it-tnejn il-backends iżommu buffer ta' bidu-blokk b'65,536 slot fissi. Talba għal iktar titqiegħed fil-limitu hemm, u n-nuqqas jidher onestament bħala iktar frames biex jikkonverġi.

### Ippitturi kull ringiela f'kull frame {#draw-every-row-each-frame}

**Prestazzjoni → Ippitturi kull ringiela f'kull frame** (default **mixgħul**): il-baġit isir sogħba minflok saqaf, u frame li jibda stima ġdida jinġibed kull ringiela li hu responsabbli għaliha (sa l-cap ta' 268M).

Ir-raġuni: moviment tal-kamera jitfa' l-akkumulazzjoni, għalhekk frame li jiċċaqlaq hu stima waħda li r-rumur tagħha huwa mqiegħed minn kemm mid-dejta ġibed - b'kwart miġbud, tara kwart fi tikek mtqal brillanti, u dan hu li jagħmel il-veduta li tiċċaqlaq tiddi. Li tiġbed kollox jagħmel kull frame l-istampa mtemmha. Il-kost hu li l-ħin tal-frame issa jsegwi d-daqs tad-dejta fit-tieqa; il-maniġġi huma tieqa taż-żmien iktar dejqa, filtri, jew qtugħ 'l bogħod, li jnaqqsu l-kandidati minflok ikampjunawhom iktar fin.

Itfih fuq hardware li ma jistax jaffordja l-qasam kollu f'daqqa: *Sprites / frame* imbagħad isir limitu reali, u l-veduta tikkonverġi matul ftit frames sodi.

Dak li tiswa pjan sħiħ, imkejjel fuq GPU ta' desktop tal-ogħla klassi f'canvas ta' 4K b'livell kbir, sprites ta' raġġ 1 m (pixel jew tnejn): madwar 100M sprite għal kull frame f'30 fps, 200M f'15 fps, u l-massimu ta' 268M f'madwar 12 fps. Bi sprites daqshekk iżgħar il-vertex stage hu l-kost kollu, u r-riżoluzzjoni tas-sħana ma tbiddel xejn; bi sprites kbar il-fill hu: 8M sprite ta' raġġ 100 m ħadu 2.5 s għal kull frame bir-riżoluzzjoni sħiħa tas-sħana u 170 ms fuq 25%. **Ippitturi kull ringiela f'kull frame** għalhekk jibda minn 67M u jitla' bi kwart kull frame sakemm il-frames jieħdu inqas minn 150 ms, u jinqasam f'nofs meta jieħdu iktar minn 400 ms, sabiex veduta tqila ma tmorrx il-frame lil hinn minn dak li l-watchdog tal-GPU jippermetti.

### Il-baġit adattiv {#the-adaptive-budget}

**Prestazzjoni → Baġit adattiv** (default mixgħul) jaġġusta l-baġit tal-sprites biex iżomm **FPS immirati** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Hu bla attività fir-[replay tal-kaxxi](box-replay.md) u waqt rendering tal-vidjo.

L-input hu l-ħin tal-frame, immellet (90% tal-preċedenti + 10% il-ġdid, b'frames individwali mqabbdin għal 2 s), kontra mira ta' 1000 / max(15, FPS immirati) ms.

**L-ewwel stadju - sprites.** F'kull frame il-baġit jiġi immultiplikat bi `1 + (target / frame - 1) × gain`, b'gain ta' 0.35 meta jkun bil-mod wisq u 0.08 meta jkun hemm spazju, imqabbad għal fattur ta' 0.5-1.25 f'kull frame u għal 65,536-268,435,456 sprite.

**It-tieni stadju - riżoluzzjoni.** Biss meta l-baġit ikun diġà fil-minimu tiegħu u l-frames għadhom aktar minn 10% bil-mod, ir-riżoluzzjoni tal-buffer tas-sħana tonqos, b'8% f'kull frame, sa 25% tal-canvas; terġa' tirkupra b'4% f'kull frame waqt li jkun hemm 30% spazju. Il-kost tal-fragment jonqos mal-kwadru tar-riżoluzzjoni, u dan hu kważi bla ma jidher taħt rampa lixxa. (Imkejjel fuq rendering software b'10M ringiela u sprites kbar wisq: 141 ms → 17 ms f'kull frame.) L-iskala tiġi mdawra għal sittax-il wieħed, u *Riżol. s-sħana* fl-overlay juriha.

**Jitlaq.** Frame bil-mod jidher l-istess jekk l-sprites ikunu kkawżawh jew jekk livell tqil ikunu l-kawża - ma hemm ebda ħin għal kull passaġġ. Jekk il-baġit jibqa' fil-minimu tiegħu u l-frames jibqgħu taħt 70% tal-mira għal 30 frame, l-sprites ma kinux il-kost: il-kontrollur jaqleb għal **titlaq**, jimmultiplika l-baġit b'1.5 kull 14-il frame u jerġa' jtella' r-riżoluzzjoni, sakemm il-ħin tal-frame jibqa' fi ħdan 1.5× ta' dak li kien fil-minimu. Titlaq li jagħmel il-affarijiet agħar minn hekk jerġa' jitnaqqas għal 60% u jerġa' jibda l-kontroll normali; jekk tilħaq il-mira, it-titlaq jieqaf.

Bil-baġit adattiv mitfi, il-baġit hu sempliċiment **Sprites / frame**.

Bil-*Ippitturi kull ringiela f'kull frame* mixgħul, il-baġit adattiv jibqa' jaħdem, imma r-regola eżatta tgħolli l-baġit biex jigdeb ringieli kandidati kollha, u għalhekk fil-prattika jikkontrolla biss l-istadju tar-riżoluzzjoni u l-frames li ma jibdewx stima ġdida.
