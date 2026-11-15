---
title: "Identifiering av programvarurendering"
parent: "Rendering i detalj"
nav_order: 6
lang: "sv"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Identifiering av programvarurendering

Om webbläsaren ritar med huvudprocessorn i stället för grafikkortet blir visaren många gånger långsammare. Visaren märker det och visar en röd ruta som säger vad du ska slå på.

När en webbläsare har hårdvaruacceleration avstängd, eller dess drivrutin står på en blockeringslista, ritar den WebGL och WebGPU på processorn. Allt fungerar fortfarande, bara många gånger långsammare. Upplevelsen blir ”den här visaren är oanvändbart långsam med mina data”, och det är en symptom som pekar på verktyget, inte på en inställning i webbläsaren. Därför läser visaren renderarens namn och säger det ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Bannern {#the-banner}

När renderaren med säkerhet identifieras som programvara visas en röd ruta överst i sidofältet (flikarna Värmekarta och Match), ovanför lägesfältet:

![Den röda bannern: Körs utan grafikkortet](../assets/img/en/software-rendering-banner.webp)

> **Körs utan grafikkortet.**
> Den här webbläsaren ritar med processorn i stället för grafikkortet, vilket är många gånger långsammare och inte klarar stora datamängder. Slå på maskinvaruacceleration i webbläsarens inställningar (Chrome: Inställningar → System → ”Använd grafikacceleration när det är tillgängligt”, starta sedan om) och kontrollera att grafikdrivrutinen är uppdaterad.

## För utvecklare {#for-developers}

### Så avgör den {#how-it-decides}

Renderarsträngen (WebGL2:s `UNMASKED_RENDERER_WEBGL`, eller WebGPU:s adapterleverantör, arkitektur och enhet) görs till gemener och klassificeras:

- **programvara** när den innehåller `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` eller `generic renderer`;
- **hårdvara** när den innehåller en känd GPU-leverantör eller GPU-familj (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **okänd** annars.

Bara *programvara* visar bannern. En oigenkänd adapter säger ingenting alls. Att skicka någon med ett fungerande grafikkort till att ändra sin webbläsare är ett värre fel än att missa ett fall.

### Det korta namnet {#the-short-name}

Samma modul förkortar renderarsträngen för visning. Från en ANGLE-sträng som `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` behålls enhetsfältet. PCI-id:t och det avslutande API:t och shadermodellen tas bort, och `Vendor Model` visas. Det korta namnet visas under **Resursbudgetar**, med hela strängen som verktygstips. Minnesuppskattningen visar hela strängen.
