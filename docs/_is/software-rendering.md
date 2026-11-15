---
title: "Greining hugbúnaðarmyndvinnslu"
parent: "Innri hlutar myndvinnslu"
nav_order: 6
lang: "is"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Greining á hugbúnaðarteikningu

Ef vafrinn þinn teiknar á aðalörgjörvanum í stað skjákortsins er skoðarinn margfalt hægari. Skoðarinn tekur eftir þessu og sýnir rauðan reit sem segir þér hvað á að kveikja á.

Þegar vafri hefur slökkt á vélbúnaðarhröðun, eða rekill hans er settur á svartan lista, teiknar hann WebGL og WebGPU á örgjörvanum. Allt virkar enn, margfalt hægar, og upplifunin er „þessi skoðari er ónothæfilega hægur með mín gögn“ - einkenni sem bendir á verkfærið, ekki á rofa í vafranum. Þess vegna skoðar skoðarinn nafn teiknarans og segir frá því ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Borðinn {#the-banner}

Þegar teiknarinn er ótvírætt greindur sem hugbúnaður birtist rauður reitur efst í hliðarstikunni (flipum Heatmap og Match), fyrir ofan hamstikuna:

![Rauði borðinn: Keyrt án skjákortsins](../assets/img/en/software-rendering-banner.webp)

> **Running without the graphics card.**
> Þessi vafri teiknar á örgjörvanum í stað skjákortsins, sem er margfalt hægara og ræður ekki við stór gagnasöfn. Kveiktu á vélbúnaðarhröðun í stillingum vafrans (Chrome: Settings → System → "Use graphics acceleration when available", síðan endurræstu), og athugaðu að skjárekillinn sé uppfærður.

## Fyrir forritara {#for-developers}

### Hvernig það ákveður {#how-it-decides}

Strengurinn um teiknarann - `UNMASKED_RENDERER_WEBGL` hjá WebGL2, eða seljandi, arkitektúr og tæki millistykkis WebGPU - er gerður að lágstöfum og flokkaður:

- **software** þegar hann inniheldur `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` eða `generic renderer`;
- **hardware** þegar hann inniheldur þekktan GPU-seljanda eða -ætt (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** annars.

Aðeins *software* kveikir borðann. Millistykki sem þekkist ekki segir alls ekkert: að senda einhvern með virkt skjákort í að stilla vafrann sinn upp á nýtt er verri bilun en að missa af tilviki.

### Stutta heitið {#the-short-name}

Sama eining styttir strenginn um teiknarann til birtingar: úr ANGLE-streng eins og `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` heldur hún tækjareitnum, sleppir PCI-auðkenninu og lokaforminu fyrir API og skyggjalíkan, og sýnir `Vendor Model`. Stutta heitið birtist undir **Auðlindaheimildir**, með fullu strengnum sem skýringu við músarbendingu; minnisáætlunin sýnir fullan strenginn.
