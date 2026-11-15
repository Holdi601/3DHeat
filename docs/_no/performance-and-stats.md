---
title: "Ytelsespanel og statistikk"
parent: "Rendering i detalj"
nav_order: 7
lang: "no"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Ytelsespanelet og statistikkboksen

Boksen øverst til høyre i visningen viser hvor hardt visningsprogrammet arbeider: hvor mange bilder per sekund, hvor mange prikker det tegner, og om det fortsatt forbedrer bildet. Panelet **Ytelse** lar deg bytte bildekvalitet mot fart.

## Statistikkboksen {#the-stats-overlay}

Boksen øverst til høyre i visningen, i fanene Varmekart og Kamp ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Den leser motorens direkte avlesning for hvert animasjonsbilde.

![Statistikkboksen på scenen for mange kamper, med nummererte merknader: 1 Backend, 2 FPS, 3 Frame, 4 Rader i vinduet, 5 Sprites / bilde, 6 Budsjett, 7 Varmeoppl., 8 Dekning](../assets/img/en/performance-stats-overlay.webp)

| Linje | Betydning |
|---|---|
| **Backend** | *WebGPU* eller *WebGL2*. Hold musepekeren over den for årsaken til at WebGPU ikke ble brukt, når den ikke ble det. Se [De to backendene](backends.md). |
| **FPS** | Bilder per sekund, snittet over minst 0,4 s. |
| **Frame** | Bildetid i ms, glattet (90 % forrige, 10 % nytt). Dette er tiden mellom bildene, ikke GPU-tid; ingen GPU-timing per pass måles. |
| **Rader i vinduet** | Kandidatrader: radene i det gjeldende tidsvinduet, før filtrering per rad i shaderen. |
| **Sprites / bilde** | Sprites som det siste bildets plan sendte inn (holdes på den planlagte verdien på inaktive bilder, som ikke tegner noe). |
| **Budsjett** | Spritebudsjettet dette bildet ble planlagt med: den adaptive kontrollens verdi, hevet til alle kandidatene når alle rader tegnes. |
| **Varmeoppl.** | Varmebufferens oppløsning som en andel av lerretet: innstillingen *Varmeoppløsning* ganger den adaptive trinn-to-skalaen. |
| **Dekning** | Hvor langt den progressive akkumuleringen har kommet mot å bruke alle radene: en prosentandel mens den konvergerer (gul), *eksakt* når den er ferdig. Et støyende bilde forveksles aldri med det ferdige bildet. |
| **Kuber** | Bokser som tegnes i [boksreplay](box-replay.md). |
| **Ikke i minnet** | Vises bare når rader ikke fikk plass i GPU-budsjettet: hvor mange. Se [GPU-minneresidens](gpu-memory.md). |

## Hastighetsvisningen {#the-speed-display}

Nederst til høyre i visningen, bare i perspektiv: flyvehastigheten og tiden det tar å krysse dataene med den farten. Dra den for å endre farten. Se [Kamera](camera.md#fly-speed).

## Hvis visningen er treg {#if-the-viewer-is-slow}

Se på statistikkboksen, og deretter:

1. **Rader i vinduet mye større enn Sprites / bilde, Dekning under 100 %**: bildet kan ikke tegne alt; det konvergerer over flere bilder når det står stille. Smalne vinduet, filtrer eller kutt for å redusere kandidatene; eller godta samplingen.
2. **Sprites / bilde lik Rader i vinduet, bildet fortsatt tregt**: kostnaden er per sprite på skjermen: senk *Maks pikselradius* ([Sprite-form](sprite-shape.md#pixel-clamps)) eller *Varmeoppløsning*.
3. **Treg med få rader**: sannsynligvis nivået: mange strukturer med kanter påslått, bakkentrekanter, feltdybde. Se [Nivåutseende](level-appearance.md).
4. **Alt er tregt, og et rødt banner**: programvaretegning ([Oppdaging av programvaretegning](software-rendering.md)).

## Ytelsespanelet {#the-performance-panel}

| Kontroll | Standard | Effekt |
|---|---|---|
| Tips | | Hvert bilde sprøyter en stratifisert tilfeldig delmengde av de synlige radene, med vekt skalert for å kompensere, slik at forventet varme er eksakt ved ethvert budsjett; når visningen holdes stille, fortsetter bildene å slå sammen til alle rader har bidratt. |
| **Tegn hver rad i hvert bilde** | på | Hvert bilde som starter et nytt estimat tegner alle kandidatradene (opptil ca. 268 M); budsjettet under blir et gulv. [Sampling og budsjetter](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptivt budsjett** | på | Juster sprites per bilde, deretter varmeoppløsning, for å holde mål-bildefrekvensen, og slutt å kutte når kutting ikke hjelper. [Sampling og budsjetter](sampling-and-budgets.md#the-adaptive-budget) |
| **Mål-FPS** | 60 | 20–240 (1000 med håndtaket). Verdier under 15 behandles som 15. |
| **Sprites / bilde ved start** / **Sprites / bilde** | 4,00 M | 65 536–268 435 456, logaritmisk. Kalles *Ved start* mens det adaptive er på, fordi kontrollen flytter den. |
| **Varmeoppløsning** | 100 % | 25–100 %. Fragmentkostnaden skalerer med kvadratet: 50 % gir en fjerdedel av blandearbeidet, og varmefeltet er glatt nok til at det knapt vises. |
| **Progressiv forbedring** | på | Akkumuler over bilder mens visningen står stille. Av viser estimatet for ett enkelt bilde hvert bilde. [Akkumulering](accumulation.md) |
| **Ressursbudsjetter** | oppdaget | Budsjetter for RAM, GPU og parsertråden. [Minne og budsjetter](memory-and-budgets.md#resource-budgets) |

Ingen av disse lagres; en lasting på nytt gjenoppretter standardverdiene.
