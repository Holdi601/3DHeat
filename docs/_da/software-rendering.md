---
title: "Registrering af softwarerendering"
parent: "Renderingens indre"
nav_order: 6
lang: "da"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Registrering af softwarerendering

Hvis din browser tegner på hovedprocessoren i stedet for på grafikkortet, er fremviseren mange gange langsommere. Fremviseren bemærker det og viser en rød boks, der fortæller, hvad du skal slå til.

Når en browser har hardwareacceleration slået fra, eller dens driver er sortlistet, tegner den WebGL og WebGPU på CPU'en. Alt virker stadig, blot mange gange langsommere, og oplevelsen bliver: "denne fremviser er ubrugeligt langsom med mine data". Det er et symptom, der peger på værktøjet og ikke på en kontakt i browseren. Derfor kigger fremviseren på rendererens navn og siger det ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Banneret {#the-banner}

Når rendereren med sikkerhed er identificeret som software, vises en rød boks øverst i sidebaren (fanerne Varme og Kamp), over tilstandslinjen:

![Det røde banner: Kører uden grafikkortet](../assets/img/en/software-rendering-banner.webp)

> **Kører uden grafikkortet.**
> Denne browser tegner på CPU'en i stedet for på grafikkortet. Det er mange gange langsommere, og det kan ikke håndtere store datasæt. Slå hardwareacceleration til i browserindstillingerne (Chrome: Indstillinger → System → "Brug grafikacceleration, når den er tilgængelig", og genstart), og kontrollér, at grafikdriveren er opdateret.

## Til udviklere {#for-developers}

### Sådan afgøres det {#how-it-decides}

Rendererstrengen (WebGL2's `UNMASKED_RENDERER_WEBGL`, eller WebGPU's adapterleverandør, arkitektur og enhed) gøres til små bogstaver og klassificeres:

- **software**, når den indeholder `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` eller `generic renderer`;
- **hardware**, når den indeholder en kendt GPU-leverandør eller -familie (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **ukendt** ellers.

Kun *software* viser banneret. En ukendt adapter siger slet ingenting. At sende en person med et fungerende GPU til at omkonfigurere sin browser er en værre fejl end at overse et tilfælde.

### Det korte navn {#the-short-name}

Det samme modul forkorter rendererstrengen til visning. Fra en ANGLE-streng som `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` beholder den enhedsfeltet, fjerner PCI-id'et og det efterfølgende API og shadermodel, og viser `Vendor Model`. Det korte navn vises under **Ressourcebudgetter** med den fulde streng som tooltip. Hukommelsesestimatet viser den fulde streng.
