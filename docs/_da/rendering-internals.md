---
title: "Renderingens indre"
nav_order: 22
has_children: true
lang: "da"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Renderingens indre

Fremviseren tegner millioner af prikker som lysende klatter og lægger dem sammen. Dette afsnit forklarer de tricks, der holder det hurtigt, og hvad tallene i statistikpanelet betyder. Læs det, hvis fremviseren føles langsom, eller hvis du vil arbejde på rendereren.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

For at se, hvordan din egen computer klarer sig, kig på statistikboksen øverst til højre i visningen: [Ydelsespanel og statistik](performance-and-stats.md). Nye ord (GPU, række, sprite, varmekort) står i [ordlisten](glossary.md).

## Kerneproblemet {#the-core-problem}

En sum af overlappende radiale rampe koster *N* × π*r*² blandede fragmenter pr. billede. Ved 100 millioner sprites med en radius på 8 px er det 2 × 10¹⁰ fragmenter, omkring et sekunds arbejde på et GPU i topklassen. Det kan ikke brute-forces hvert billede, så fremviseren kombinerer:

- **tidssorterede rækker**: et tidsvindue er to binære søgninger, og afspilningens omkostning følger rækkerne i vinduet, ikke datasættet;
- **intet arbejde pr. række på CPU'en pr. billede**: rækker ligger i GPU-hukommelsen, kvantiseret. Filtre, gruppefortegn, levetidstesten, vinduet, culling og snittet evalueres alle i vertex-shaderen;
- **stratificeret sampling** med kompenserende vægte, når et billede ikke kan tegne alle rækker, og **progressiv akkumulering**, der konvergerer mod det nøjagtige svar med alle rækker, mens visningen står stille ([Sampling og budgetter](sampling-and-budgets.md), [Akkumulering](accumulation.md));
- **en tostrins-begrænsning**, der bytter sprites pr. billede og derefter varmeopløsning for billedfrekvens ([Sampling og budgetter](sampling-and-budgets.md#the-adaptive-budget));
- **håndhævede hukommelsesbudgetter**, så et datasæt, der ikke passer, bliver synligt afkortet i stedet for at gå ned ([GPU-hukommelsesresidens](gpu-memory.md)).

## Et billede {#one-frame}

Billedløkken er [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Alt, der ændrer sig med billedfrekvens (kamera, afspilningshoved, budget), ligger i motoren og ikke i programmets tilstand. Et billede koster derfor intet React-arbejde. Tilstanden læses én gang pr. billede og skrives kun tilbage til de lavfrekvente aflæsninger.

1. **Nye data?** Et nyt datasæt annonceres (*Uploader N rækker til GPU'en*) på ét billede og uploades på det næste, så beskeden bliver malet, før arbejdet blokerer tråden. En ny bane gives til rendereren. Linjevarmeruter bygges eller frigives.
2. **Afspilningshovedet** rykker frem (højst 0,1 s virkelig tid pr. billede), løkkes eller stopper.
3. **Kameraet** læser taster, mus og gamepad. Akselspejlingen foldes ind i visningsmatricen. På WebGPU konverterer en dybdeomregningsmatrix three.js' dybdeområde i OpenGL-stil til WebGPU's.
4. **Hvad der er synligt**: tidsintervallet fra tidslinjen og historikken, gruppefortegnstabellen (synlighed kun ved en opdeling efter en kolonne), op til fire filtre (kolonnefiltre og valget af enheder) og forskelsopdelingen.
5. **Farve- og kurvetabeller** bygges om, hvis deres indstillinger er ændret.
6. **Budget**: den adaptive styring sætter dette billedes spritebudget og varmeopløsning. Med *Tegn hver række hvert billede* hæves budgettet, så det dækker alle kandidatrækker.
7. **Signaturer** afgør, hvad akkumuleringsbufferen stadig betyder: en ændring i noget, der ændrer, hvilke rækker der bidrager, eller hvordan (*geometri*), i tidsvinduet, eller kun i hvordan resultatet farves (*sammensætning*). Se [Akkumulering](accumulation.md#what-restarts-it).
8. **Samplingsplan**: hvilke blokke af rækker der skal tegnes ([Sampling og budgetter](sampling-and-budgets.md)).
9. **Akkumuleringstilstand**: nulstil, udvid, glidende gennemsnit, løbende middelværdi eller inaktiv.
10. **Geometri for boksreplay** (kubber, spor) på CPU'en, kun i den tilstand og kun når den ikke er inaktiv.
11. **Tegn**: backenden tegner scenen (bane, gitter, akser, bokse, spor, lineal), sprøjter varmen ind i varmemålet, flettes ind i akkumulatoren og sammensætter varmen over scenen på lærredet.
12. **Automatisk eksponering** udløses, når dens nedtælling når nul. Linealens varmeprobe læser højst én pixel hvert 120 ms. Aflæsningerne offentliggøres.

Et inaktivt billede, altså konvergeret og uden ændringer, springer scenen og sprøjtningen over, men **sammensætter stadig igen**. Et WebGL-lærred, der er oprettet uden `preserveDrawingBuffer`, har udefineret indhold efter sammensætning. Det er derfor ikke sikkert at stole på, at det viser det sidste billede. Scene- og varmemålene er fremviserens egne framebuffere og beholder indholdet, så et inaktivt billede koster ét fuldskærmspas.

## Sider i dette afsnit {#pages-in-this-section}

- [De to backends](backends.md): WebGPU og WebGL2, hvordan én vælges, URL-kontakter
- [Akkumulering](accumulation.md): nulstil, udvid, glidende gennemsnit, løbende middelværdi
- [Sampling og budgetter](sampling-and-budgets.md): den stratificerede sampler, eksakt tilstand, det adaptive budget
- [Akkumulering i halv præcision](half-float-accumulation.md): område og præcision på 16-bit-mål
- [GPU-hukommelsesresidens](gpu-memory.md): kvantiseret rækkelagring og det håndhævede GPU-budget
- [Registrering af softwarerendering](software-rendering.md)
- [Ydelsespanel og statistik](performance-and-stats.md)
