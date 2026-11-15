---
title: "Jõudluspaneel ja statistika"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 7
lang: "et"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Jõudluspaneel ja statistika

Vaate paremas ülanurgas olev kast näitab, kui palju vaatajal tööd on: mitu kaadrit sekundis, mitu punkti ta joonistab ja kas ta veel täpsustab pilti. Paneel **Jõudlus** lubab vahetada pildi kvaliteedi kiiruse vastu.

## Statistikakate {#the-stats-overlay}

Kast vaate paremas ülanurgas vahekaartidel Soojus ja Matš ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). See loeb mootori elavat näitu iga animatsioonikaadri ajal.

![Statistikakate stseenil many-matches, nummerdatud selgitustega: 1 Taustsüsteem, 2 FPS, 3 Kaader, 4 Read aknas, 5 Spraite / kaader, 6 Eelarve, 7 Soojuse lahutus, 8 Katvus](../assets/img/en/performance-stats-overlay.webp)

| Rida | Tähendus |
|---|---|
| **Taustsüsteem** | *WebGPU* või *WebGL2*. Hiirega üle viies näed, miks WebGPU-d ei kasutatud, kui ei kasutatud. Vt [Kaks renderdajat](backends.md). |
| **FPS** | Kaadrit sekundis, keskmistatud vähemalt 0,4 s peale. |
| **Kaader** | Kaadri aeg millisekundites, silutud (90% eelmine, 10% uus). See on aeg kaadrite vahel, mitte GPU aeg: GPU aega passide kaupa ei mõõdeta. |
| **Read aknas** | Kandidaatread: praeguse ajaakna read enne rea-kaupa filtreerimist shaderis. |
| **Spraite / kaader** | Spraidid, mille viimase kaadri plaan esitas (seisval kaadril, mis ei joonista midagi, jäävad need planeeritud arvuks). |
| **Eelarve** | Spraitide eelarve, millega see kaader planeeriti: kohanduva kontrolleri väärtus, tõstetud kõigile kandidaatidele, kui joonistatakse iga rida. |
| **Soojuse lahutus** | Soojuspuhvri lahutus osana canvasest: seade *Soojuse lahutusvõime* korrutatud kohandava teise astme skaalaga. |
| **Katvus** | Kui kaugele järkjärguline kogumine on jõudnud kõigi ridade kasutamisega: protsent koondumise ajal (merevaigu värvus), *täpne*, kui valmis. Müra kaadrit ei eksitata kunagi lõpliku pildiga. |
| **Kuubid** | [Kastide ülekandes](box-replay.md) joonistatud kastid. |
| **Pole mälus** | Näidatakse ainult siis, kui read ei mahtunud GPU eelarvesse: mitu. Vt [GPU mälu residentsus](gpu-memory.md). |

## Kiiruse näit {#the-speed-display}

Vaate paremas alanurgas, ainult perspektiivis: lennukiirus ja aeg andmete läbimiseks sellel kiirusel. Lohista kiiruse muutmiseks. Vt [Kaamera](camera.md#fly-speed).

## Kui vaataja on aeglane {#if-the-viewer-is-slow}

Vaata statistikakatet ja siis:

1. **Read aknas on palju suurem kui Spraite / kaader ja Katvus alla 100%**: kaader ei saa kõike joonistada; kui pilt on paigal, koondub see mitme kaadriga. Kitsenda akent, filtreeri või lõika, et vähendada kandidaate; või lepi valimiga.
2. **Spraite / kaader on võrdne Read aknas-ga ja kaader ikka aeglane**: kulu tekib spraidi kohta ekraanil: langeta *Maksimaalne pikslite raadius* ([Kujundi kuju](sprite-shape.md#pixel-clamps)) või *Soojuse lahutus*.
3. **Aeglane vähese arvu ridade korral**: tõenäoliselt tase: suur struktuuride arv servadega, maapinna kolmnurgad, sügavusteravus. Vt [Taseme välimus](level-appearance.md).
4. **Kõik on aeglane ja punane bänner**: tarkvaraline renderdus ([Tarkvaralise renderduse tuvastamine](software-rendering.md)).

## Jõudluspaneel {#the-performance-panel}

| Juhtnupp | Vaikimisi | Mõju |
|---|---|---|
| Vihje | | Iga kaader splatib kihilise juhusliku osa nähtavatest ridadest, mille kaal on kompenseeritud, nii et oodatav soojus on täpne mis tahes eelarve juures; vaate paigal hoidmisel liidetakse kaadreid, kuni iga rida on panustanud. |
| **Joonista igas kaadris kõik read** | sees | Iga kaader, mis alustab värsket hinnangut, joonistab kõik kandidaatread (kuni umbes 268M); allpool olev eelarve muutub põhjaks. [Valimi võtmine ja eelarved](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Kohanduv eelarve** | sees | Häälesta spraidid kaadri kohta, seejärel soojuse lahutus, et hoida siht-kaadrisagedust, ja lõpeta vähendamine, kui see ei aita. [Valimi võtmine ja eelarved](sampling-and-budgets.md#the-adaptive-budget) |
| **Siht-FPS** | 60 | 20–240 (nupuga 1000). Alla 15 olevad väärtused käsitletakse kui 15. |
| **Algne spraitide arv / kaader** / **Spraite / kaader** | 4,00M | 65 536–268 435 456, logaritmiline. Nimetatakse *Algne*, kui kohanduv on sees, sest kontroller seda liigutab. |
| **Soojuse lahutusvõime** | 100% | 25–100%. Fragmendi kulu kasvab ruudus: 50% vähendab segamistööd neljandiku võrra, ja soojusväli on nii sile, et see tuleb vaevu välja. |
| **Järkjärguline täpsustamine** | sees | Kogu kaadrite vahel, kui vaade on paigal. Väljas näitab iga kaader ühe kaadri hinnangut. [Akumulatsioon](accumulation.md) |
| **Ressursieelarved** | tuvastatud | RAM-i, GPU ja parseri lõime eelarved. [Mälu ja eelarved](memory-and-budgets.md#resource-budgets) |

Ükski neist seadetest ei salvestu; lehe uuesti laadimine taastab vaikeväärtused.
