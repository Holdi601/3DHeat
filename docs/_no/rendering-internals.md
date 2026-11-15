---
title: "Rendering i detalj"
nav_order: 22
has_children: true
lang: "no"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Tegneinternt

Visningsprogrammet tegner millioner av prikker som glødende klatter og legger dem sammen. Denne delen forklarer knepene som holder det raskt, og hva tallene i statistikkboksen betyr. Les den hvis visningen virker treg, eller hvis du vil jobbe med tegnemotoren.

```
data -> tidsvindu -> GPU-filtre -> samplingsplan -> splat -> akkumulering -> farge -> skjerm
```

For å se hvordan din egen datamaskin klarer seg, se på statistikkboksen øverst til høyre i visningen: [Ytelsespanelet og statistikkboksen](performance-and-stats.md). Nye ord (GPU, rad, sprite, varmekart) forklares i [ordlisten](glossary.md).

## Kjerneproblemet {#the-core-problem}

En sum av overlappende radielle rampe koster *N* × π*r*² blandede fragmenter per bilde. Med 100 millioner sprites med 8 px radius er det 2 × 10¹⁰ fragmenter, omtrent ett sekund arbeid på en GPU i toppklassen. Det kan ikke brute-forces hvert bilde, så visningsprogrammet kombinerer:

- **tidssorterte rader**: et tidsvindu er to binærsøk, og avspillingskostnaden følger radene i vinduet, ikke datasettet;
- **ingenting per rad på CPU-en per bilde**: rader ligger i GPU-minnet, kvantisert; filtre, gruppefortegn, levetidstesten, vinduet, skjæringen og snittet evalueres i vertex-shaderen;
- **stratifisert sampling** med kompenserende vekter når et bilde ikke kan tegne alle radene, og **progressiv akkumulering** som konvergerer mot det nøyaktige svaret med alle rader mens visningen står stille ([Sampling og budsjetter](sampling-and-budgets.md), [Akkumulering](accumulation.md));
- **en to-trinns trottel** som bytter sprites per bilde, og deretter varmeoppløsning, mot bildefrekvens ([Sampling og budsjetter](sampling-and-budgets.md#the-adaptive-budget));
- **håndhevede minnebudsjetter**, slik at et datasett som ikke får plass kuttes synlig i stedet for å krasje ([GPU-minneresidens](gpu-memory.md)).

## Ett bilde {#one-frame}

Bildeløkken er [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Alt som endrer seg med bildefrekvens (kamera, avspillingshode, budsjett) ligger i motoren, ikke i programtilstanden. Et bilde koster derfor ingen React-arbeid. Tilstanden leses én gang per bilde og skrives tilbake bare for avlesninger med lav frekvens.

1. **Nye data?** Et nytt datasett kunngjøres (*Laster N rader opp til GPU-en*) på ett bilde og lastes opp på det neste, slik at meldingen males før arbeidet blokkerer tråden. Et nytt nivå overlates til tegnemotoren; linjevarmeruter bygges eller frigjøres.
2. **Avspillingshodet** går videre (begrenset til 0,1 s klokketid per bilde), løkker eller stopper.
3. **Kameraet** leser taster, mus og gamepad; akseomspeilingen legges inn i visningsmatrisen; på WebGPU gjør en dybdeomskaleringsmatrise om three.js sitt OpenGL-aktige dybdeområde til WebGPU sitt.
4. **Hva som er synlig**: tidsområdet fra tidslinjen og historikken; gruppefortegnstabellen (synlighet bare under en deling etter en kolonne); opptil fire filtre: kolonnefiltre og utvalget i Entiteter; delingen for forskjellen.
5. **Farge- og kurvetabeller** bygges på nytt hvis innstillingene deres er endret.
6. **Budsjett**: den adaptive kontrollen setter dette bildets spritebudsjett og varmeoppløsning. Med *Tegn hver rad i hvert bilde* heves budsjettet slik at det dekker hver kandidatrad.
7. **Signaturer** avgjør hva akkumuleringsbufferen fortsatt betyr: en endring i noe som endrer hvilke rader som bidrar eller hvordan (*geometri*), i tidsvinduet, eller bare i hvordan resultatet farges (*sammensetning*). Se [Akkumulering](accumulation.md#what-restarts-it).
8. **Samplingsplan**: hvilke blokker med rader som skal tegnes ([Sampling og budsjetter](sampling-and-budgets.md)).
9. **Akkumuleringsmodus**: nullstill, utvid, glidende gjennomsnitt, løpende middelverdi, eller inaktiv.
10. **Geometri for boksreplay** (kuber, spor) på CPU-en, bare i den modusen og bare når den ikke er inaktiv.
11. **Tegning**: backenden tegner scenen (nivå, rutenett, akser, bokser, spor, linjal), sprøyter varmen inn i varmemålet, slår den sammen inn i akkumulatoren, og komponerer varme over scene til lerretet.
12. **Automatisk eksponering** utløses når nedtellingen når null; linjalens varmeprobe leser høyst én piksel hvert 120. ms; avlesninger publiseres.

Et inaktivt bilde (konvergert, ingenting endret) hopper over scenen og sprøytingen, men **komponerer fortsatt på nytt**: et WebGL-lerret laget uten `preserveDrawingBuffer` har udefinert innhold etter sammensetning, så det er ikke trygt å stole på at det viser forrige bilde. Scene- og varmemålene er visningsprogrammets egne bildebuffere og beholder innholdet, så et inaktivt bilde koster ett helskjermpass.

## Sider i denne delen {#pages-in-this-section}

- [De to backendene](backends.md) - WebGPU og WebGL2, hvordan en velges, URL-bryttere
- [Akkumulering](accumulation.md) - nullstill, utvid, glidende gjennomsnitt, løpende middelverdi
- [Sampling og budsjetter](sampling-and-budgets.md) - den stratifiserte samplingen, eksakt modus, det adaptive budsjettet
- [Flyttallsakkumulering](half-float-accumulation.md) - område og presisjon på 16-bits mål
- [GPU-minneresidens](gpu-memory.md) - kvantisert radlagring og det håndhevede GPU-budsjettet
- [Oppdaging av programvaretegning](software-rendering.md)
- [Ytelsespanelet og statistikkboksen](performance-and-stats.md)
