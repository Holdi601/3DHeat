---
title: "Paneli i performancës dhe statistikat"
parent: "Brendësitë e vizatimit"
nav_order: 7
lang: "sq"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Paneli i performancës dhe statistikat

Kutia lart djathtas në pamje tregon sa punon shikuesi: sa korniza në sekondë, sa pika vizaton, dhe nëse ende e rafinon figurën. Paneli **Performanca** të lejon të shkëmbesh cilësinë e figurës për shpejtësi.

## Kutia e statistikave {#the-stats-overlay}

Kutia lart djathtas në pamje, në skedat Heatmap dhe Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Lexon leximin e drejtpërdrejtë të motorit në çdo kornizë animacioni.

![Kutia e statistikave mbi skenën e shumë ndeshjeve njëherësh, me thirrje të numëruara: 1 Backend, 2 FPS, 3 Frame, 4 Rows in window, 5 Sprites / frame, 6 Budget, 7 Heat res, 8 Coverage](../assets/img/en/performance-stats-overlay.webp)

| Rreshti | Kuptimi |
|---|---|
| **Backend** | *WebGPU* ose *WebGL2*. Kalo miun për arsyen pse WebGPU nuk u përdor, nëse nuk u përdor. Shih [Dy backend-et](backends.md). |
| **FPS** | Korniza në sekondë, mesatarja mbi të paktën 0,4 s. |
| **Frame** | Koha e kornizës në ms, e butësuar (90% e mëparshme, 10% e re). Kjo është koha midis kornizave, jo koha e GPU-së - nuk matet koha e GPU për çdo kalim. |
| **Rows in window** | Rreshta kandidatë: rreshtat në dritaren kohore aktuale, para filtrimit për rresht në hijues. |
| **Sprites / frame** | Sprite-et që dërgoi plani i kornizës së fundit (mbahen në shifrën e planifikuar në kornizat e pazëna, që nuk vizatojnë asgjë). |
| **Budget** | Buxheti i sprite-ve me të cilin u planifikua kjo kornizë - vlera e kontrolluesit adaptiv, e ngritur për të gjithë kandidatët kur vizatohet çdo rresht. |
| **Heat res** | Rezolucioni i buffer-it të nxehtësisë si pjesë e canvas-it: cilësimi *Rezolucioni i nxehtësisë* herë shkallën adaptive të fazës së dytë. |
| **Coverage** | Sa larg ka arritur grumbullimi progresiv drejt përdorimit të çdo rreshti: një përqindje gjatë konvergjencës (me ngjyrë qelibari), *exact* kur mbaron. Një kornizë me zhurmë nuk merret kurrë si figura e përfunduar. |
| **Cubes** | Kutitë e vizatuara në [riprodhimin e kutive](box-replay.md). |
| **Not resident** | Shfaqet vetëm kur rreshtat nuk u futën në buxhetin e GPU: sa janë. Shih [Qëndrimi i kujtesës së GPU](gpu-memory.md). |

## Shfaqja e shpejtësisë {#the-speed-display}

Në fund djathtas të pamjes, vetëm në perspektivë: shpejtësia e fluturimit dhe koha për të kaluar të dhënat me atë shpejtësi. Tërhiqe për të ndryshuar shpejtësinë. Shih [Kamera](camera.md#fly-speed).

## Nëse shikuesi është i ngadaltë {#if-the-viewer-is-slow}

Shiko kutinë e statistikave, pastaj:

1. **Rows in window shumë më i madh se Sprites / frame, Coverage nën 100%** - kornizës nuk i del të vizatojë gjithçka; konvergjon gjatë disa kornizave kur pamja është e palëvizur. Ngushto dritaren, filtro, ose prit për të zvogëluar kandidatët; ose pranoje mostrimin.
2. **Sprites / frame i barabartë me Rows in window, kornizë ende e ngadaltë** - kostoja është për çdo sprite në ekran: ule *Rrezen maksimale të pikselit* ([Forma e sprite-it](sprite-shape.md#pixel-clamps)) ose *Rezolucionin e nxehtësisë*.
3. **I ngadaltë me pak rreshta** - ka gjasa niveli: numër i madh strukturash me skajet të ndezura, trekëndësha toke, thellësi fushe. Shih [Pamja e nivelit](level-appearance.md).
4. **Gjithçka e ngadaltë, dhe një banderolë e kuqe** - vizatim me softuer ([Zbulimi i vizatimit me softuer](software-rendering.md)).

## Paneli i performancës {#the-performance-panel}

| Kontrolli | Parazgjedhja | Efekti |
|---|---|---|
| Ndihmë | | Çdo kornizë shpërndan një nëngrup të rastësishëm të shtresuar të rreshtave të dukshëm, me peshë të shkallëzuar për ta kompensuar, kështu që nxehtësia e pritur është e saktë në çdo buxhet; mbajtja e pamjes të palëvizur vazhdon bashkimin e kornizave deri sa çdo rresht të ketë kontribuar. |
| **Vizato çdo rresht në çdo kornizë** | aktive | Çdo kornizë që nis një vlerësim të ri vizaton çdo rresht kandidat (deri rreth 268M); buxheti më poshtë bëhet minimum. [Mostrimi dhe buxhetet](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Buxhet adaptiv** | aktive | Rregullon sprite-et për kornizë, pastaj rezolucionin e nxehtësisë, për të mbajtur shkallën e synuar të kornizave - dhe ndalon prerjen kur prerja nuk ndihmon. [Mostrimi dhe buxhetet](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS i synuar** | 60 | 20-240 (1000 me dorezën). Vlerat nën 15 trajtohen si 15. |
| **Sprite fillestarë / kuadër** / **Sprite / kuadër** | 4.00M | 65.536-268.435.456, logaritmik. Emërtohet *Fillestarë* kur adaptive është aktive, sepse kontrolluesi e lëviz. |
| **Rezolucioni i nxehtësisë** | 100% | 25-100%. Kostoja e fragmenteve rritet me katrorin: 50% e kthen punën e përzierjes në një të katërtën, dhe fusha e nxehtësisë është aq e butë sa pothuajse nuk shihet. |
| **Përmirësim progresiv** | aktive | Grumbullon ndërmjet kornizave ndërsa pamja është e palëvizur. Joaktive shfaq vlerësimin e një kornize çdo kornizë. [Grumbullimi](accumulation.md) |
| **Buxhetet e burimeve** | të zbuluara | Buxhetet e RAM-it, GPU-së dhe fillit të analizuesit. [Kujtesa dhe buxhetet](memory-and-budgets.md#resource-budgets) |

Asnjë nga këto nuk ruhet; një rifreskim i rikthen parazgjedhjet.
