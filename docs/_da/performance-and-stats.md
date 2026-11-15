---
title: "Ydelsespanel og statistik"
parent: "Renderingens indre"
nav_order: 7
lang: "da"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Ydelsespanel og statistik

Boksen øverst til højre i visningen viser, hvor hårdt fremviseren arbejder: hvor mange billeder der tegnes i sekundet, hvor mange prikker den tegner, og om den stadig forfiner billedet. Panelet **Ydeevne** lader dig bytte billedkvalitet for hastighed.

## Statistikoverlejringen {#the-stats-overlay}

Boksen øverst til højre i visningen i fanerne Varme og Kamp ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Den læser motorens levende aflæsning ved hvert animationsbillede.

![Statistikoverlejringen på scenen med mange kampe, med nummererede markeringer: 1 Backend, 2 FPS, 3 Billede, 4 Rækker i vinduet, 5 Sprites / billede, 6 Budget, 7 Varmeopløsning, 8 Dækning](../assets/img/en/performance-stats-overlay.webp)

| Linje | Betydning |
|---|---|
| **Backend** | *WebGPU* eller *WebGL2*. Hold musen over for at se, hvorfor WebGPU ikke blev brugt, hvis den ikke blev det. Se [De to backends](backends.md). |
| **FPS** | Billeder pr. sekund, gennemsnit over mindst 0,4 s. |
| **Billede** | Billedtid i ms, udjævnet (90 % forrige, 10 % ny). Det er tiden mellem billeder, ikke GPU-tid. Der måles ingen GPU-tid pr. pass. |
| **Rækker i vinduet** | Kandidatrækker: rækkerne i det aktuelle tidsvindue, før filtrering pr. række i shaderen. |
| **Sprites / billede** | Sprites, som det sidste billedes plan sendte. Holdes på den planlagte værdi i inaktive billeder, som ikke tegner noget. |
| **Budget** | Spritebudgettet, dette billede blev planlagt med: den adaptive styrings værdi, hævet til alle kandidater, når alle rækker tegnes. |
| **Varmeopløsning** | Varmebufferens opløsning som andel af lærredet: indstillingen *Varmeopløsning* ganget med den adaptive anden trins skala. |
| **Dækning** | Hvor langt den progressive akkumulering er nået mod at bruge alle rækker: en procentdel, mens den konvergerer (gulbrun), og *eksakt*, når den er færdig. Et støjende billede forveksles aldrig med det færdige billede. |
| **Terninger** | Bokse tegnet i [boksreplay](box-replay.md). |
| **Ikke indlæst** | Vises kun, når rækker ikke passede i GPU-budgettet: hvor mange. Se [GPU-hukommelsesresidens](gpu-memory.md). |

## Hastighedsvisningen {#the-speed-display}

Nederst til højre i visningen, kun i perspektiv: flyvehastigheden og tiden det tager at krydse dataene med den hastighed. Træk i den for at ændre hastigheden. Se [Kamera](camera.md#fly-speed).

## Hvis fremviseren er langsom {#if-the-viewer-is-slow}

Kig på statistikoverlejringen, og gør så følgende:

1. **Rækker i vinduet langt større end Sprites / billede, Dækning under 100 %**: billedet kan ikke tegne alt. Det konvergerer over flere billeder, når det står stille. Gør vinduet smallere, filtrér eller culling for at mindske kandidaterne, eller acceptér samplingen.
2. **Sprites / billede lig med Rækker i vinduet, billedet stadig langsomt**: prisen er pr. sprite på skærmen. Sænk *Maks. pixelradius* ([Sprite-form](sprite-shape.md#pixel-clamps)) eller *Varmeopløsning*.
3. **Langsomt med få rækker**: sandsynligvis banen, med mange strukturer og kanter slået til, jordtrekanter og dybdeskarphed. Se [Banens udseende](level-appearance.md).
4. **Alt er langsomt, og et rødt banner vises**: softwarerendering ([Registrering af softwarerendering](software-rendering.md)).

## Ydeevnepanelet {#the-performance-panel}

| Styring | Standard | Virkning |
|---|---|---|
| Forklaring | | Hvert billede sprøjter en stratificeret tilfældig delmængde af de synlige rækker ind, med en vægt der skaleres for at kompensere. Den forventede varme er dermed nøjagtig ved ethvert budget. Holdes visningen stille, bliver billederne ved med at blive lagt sammen, indtil hver række har bidraget. |
| **Tegn alle rækker i hvert billede** | til | Hvert billede, der starter et nyt estimat, tegner alle kandidatrækker (op til cirka 268 mio.). Budgettet nedenfor bliver en nedre grænse. [Sampling og budgetter](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptivt budget** | til | Justér sprites pr. billede og derefter varmeopløsning for at holde mål-billedfrekvensen, og stop med at skære ned, når det ikke hjælper. [Sampling og budgetter](sampling-and-budgets.md#the-adaptive-budget) |
| **Mål-FPS** | 60 | 20-240 (1000 med håndtaget). Værdier under 15 behandles som 15. |
| **Start-sprites / billede** / **Sprites / billede** | 4,00 mio. | 65.536-268.435.456, logaritmisk. Kaldes *Start*, mens det adaptive er slået til, fordi styringen flytter den. |
| **Varmeopløsning** | 100 % | 25-100 %. Fragmentomkostningen skalerer med kvadratet: 50 % giver en fjerdedel af blandingsarbejdet, og varmefeltet er så glat, at det næppe ses. |
| **Progressiv forfining** | til | Akkumulér på tværs af billeder, mens visningen står stille. Slået fra viser det enkeltbilledsestimat hvert billede. [Akkumulering](accumulation.md) |
| **Ressourcebudgetter** | registreret | RAM-, GPU- og parser-trådbudgetter. [Hukommelse og budgetter](memory-and-budgets.md#resource-budgets) |

Ingen af disse gemmes. En genindlæsning gendanner standardværdierne.
