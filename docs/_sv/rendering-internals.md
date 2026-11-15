---
title: "Rendering i detalj"
nav_order: 22
has_children: true
lang: "sv"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Rendering i detalj

Visaren ritar miljontals punkter som glödande klumpar och summerar dem. Det här avsnittet förklarar knepen som håller det snabbt, och vad siffrorna i statistikrutan betyder. Läs det om visaren känns långsam, eller om du vill arbeta med renderaren.

```
data -> tidsfönster -> GPU-filter -> samplingsplan -> utspridning -> ackumulering -> färg -> skärm
```

Om du vill se hur din egen dator klarar sig, titta på statistikrutan uppe till höger i vyn: [Prestandapanelen och statistik](performance-and-stats.md). Nya ord (GPU, rad, sprite, värmekarta) finns i [ordlistan](glossary.md).

## Grundproblemet {#the-core-problem}

En summa av överlappande radiella ramper kostar *N* × π*r*² blandade fragment per bildruta. Vid 100 miljoner sprites med 8 px radie blir det 2 × 10¹⁰ fragment, ungefär en sekund arbete på ett grafikkort i toppklass. Det går inte att räkna ut med våld varje bildruta, så visaren kombinerar:

- **tidssorterade rader** - ett tidsfönster är två binärsökningar, och uppspelningens kostnad följer raderna i fönstret, inte hela datamängden;
- **ingenting per rad på processorn per bildruta** - raderna ligger i GPU-minnet, kvantiserade; filter, gruppsignaturer, livstidstestet, fönstret, bortsortering och snittet beräknas i vertex-shadern;
- **stratifierad sampling** med kompenserande vikter när en bildruta inte kan rita varje rad, och **progressiv ackumulering** som konvergerar mot det exakta svaret med alla rader medan vyn står still ([Sampling och budgetar](sampling-and-budgets.md), [Ackumulering](accumulation.md));
- **en tvåstegs-strypning** som byter sprites per bildruta, sedan värmeupplösning, mot bildfrekvens ([Sampling och budgetar](sampling-and-budgets.md#the-adaptive-budget));
- **tvingade minnesbudgetar**, så att en datamängd som inte ryms kapas synligt i stället för att krascha ([GPU-minnets residens](gpu-memory.md)).

## En bildruta {#one-frame}

Bildloopen är [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Allt som ändras varje bildruta - kamera, uppspelningshuvud, budget - ligger i motorn, inte i appens tillstånd. En bildruta kostar därför inget React-arbete. Tillståndet läses en gång per bildruta och skrivs tillbaka bara för avläsningar som ändras sällan.

1. **Nya data?** En ny datamängd meddelas (*Uploading N rows to the GPU*) på en bildruta och laddas upp på nästa, så att meddelandet hinner ritas innan arbetet blockerar tråden. En ny bana överlämnas till renderaren; linjevärmevägar byggs eller frigörs.
2. **Uppspelningshuvudet** går framåt (högst 0,1 s väggtid per bildruta), loopar eller stannar.
3. **Kameran** läser tangentbord, mus och handkontroll. Axelspegeln viks in i vymatrisen. På WebGPU gör en djupomskalningsmatris om three.js:s djupintervall i OpenGL-stil till WebGPU:s.
4. **Vad som syns**: tidsintervallet från tidslinjen och historiken; gruppsignaturtabellen (synlighet bara vid delning efter en kolumn); upp till fyra filter, det vill säga kolumnfilter och urvalet i Entiteter; värmedelningen.
5. **Färg- och kurvtabeller** byggs om om deras inställningar har ändrats.
6. **Budget**: den adaptiva regulatorn sätter denna bildrutas spritebudget och värmeupplösning. Med *Draw every row each frame* höjs budgeten så att alla kandidatrader ryms.
7. **Signaturer** avgör vad ackumuleringsbufferten fortfarande betyder: en ändring i något som påverkar vilka rader som bidrar eller hur (*geometry*), i tidsfönstret, eller bara i hur resultatet färgas (*composite*). Se [Ackumulering](accumulation.md#what-restarts-it).
8. **Samplingsplan**: vilka block av rader som ska ritas ([Sampling och budgetar](sampling-and-budgets.md)).
9. **Ackumuleringsläge**: nollställ, förläng, glidande medelvärde, löpande medelvärde, eller vila.
10. **Boxrepriserns geometri** (kuber, spår) på processorn, bara i det läget och bara när visaren inte vilar.
11. **Rendering**: bakändan ritar scenen (bana, rutnät, axlar, boxar, spår, linjal), sprider värmen till värmemålet, slår ihop den i ackumulatorn och komponerar värmen över scenen till canvasen.
12. **Automatisk exponering** körs när nedräkningen når noll. Linjalens värmeprov läser högst en pixel var 120 ms. Avläsningarna publiceras.

En vilande bildruta, alltså en som har konvergerat och där ingenting har ändrats, hoppar över scenen och utspridningen men **komponerar ändå om**. En WebGL-canvas som skapats utan `preserveDrawingBuffer` har odefinierat innehåll efter komposition, så det går inte att lita på att den visar förra bildrutan. Scen- och värmemålen är visarens egna framebuffers och behåller sitt innehåll. En vilande bildruta kostar därför ett fullskärmspass.

## Sidor i det här avsnittet {#pages-in-this-section}

- [De två bakändarna](backends.md) - WebGPU och WebGL2, hur en väljs, URL-växlar
- [Ackumulering](accumulation.md) - nollställ, förläng, glidande medelvärde, löpande medelvärde
- [Sampling och budgetar](sampling-and-budgets.md) - den stratifierade samplaren, exakt läge, den adaptiva budgeten
- [Ackumulering i halvprecision](half-float-accumulation.md) - område och precision på 16-bitarsmål
- [GPU-minnets residens](gpu-memory.md) - kvantiserad radlagring och den tvingade GPU-budgeten
- [Identifiering av programvarurendering](software-rendering.md)
- [Prestandapanelen och statistik](performance-and-stats.md)
