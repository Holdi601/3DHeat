---
title: "Detekcia softvérového renderovania"
parent: "Vnútorné časti renderovania"
nav_order: 6
lang: "sk"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---


# Detekcia softvérového vykresľovania

Ak váš prehliadač kreslí na hlavnom procesore namiesto grafickej karty, prehliadač je mnohonásobne pomalší. Prehliadač to zistí a ukáže červenú krabicu, ktorá vám povie, čo zapnúť.

Keď má prehliadač vypnuté hardvérové zrýchlenie, alebo je jeho ovládač na čiernej listine, kreslí WebGL a WebGPU na procesore. Všetko stále funguje, len mnohonásobne pomalšie, a skúsenosť je „tento prehliadač je s mojimi dátami nepoužiteľne pomalý“ - príznak, ktorý ukazuje na nástroj, nie na prepínač v prehliadači. Preto prehliadač pozrie na meno vykresľovača a povie to ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Banner {#the-banner}

Keď je vykresľovač jednoznačne určený ako softvérový, nad bočným panelom (karty Heatmapa a Zápas), nad lištou režimov, sa objaví červená krabica:

![Červený banner: Beží bez grafickej karty](../assets/img/en/software-rendering-banner.webp)

> **Beží bez grafickej karty.**
> Tento prehliadač kreslí na procesore namiesto grafickej karty, čo je mnohonásobne pomalšie a nezvládne veľké dátové sady. Zapnite v nastaveniach prehliadača hardvérovú akceleráciu (Chrome: Nastavenia → Systém → „Používať grafickú akceleráciu, ak je k dispozícii“, potom reštartujte) a skontrolujte, či je ovládač grafickej karty aktuálny.

## Pre vývojárov {#for-developers}

### Ako sa rozhoduje {#how-it-decides}

Reťazec vykresľovača - `UNMASKED_RENDERER_WEBGL` na WebGL2, alebo dodávateľ, architektúra a zariadenie adaptéra na WebGPU - sa prepíše na malé písmená a klasifikuje:

- **softvér**, keď obsahuje `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` alebo `generic renderer`;
- **hardvér**, keď obsahuje známeho dodávateľa alebo rodinu GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **neznáme** inak.

Banner zdvihne len *softvér*. Nerozpoznaný adaptér nepovie vôbec nič: poslať niekoho s fungujúcou GPU prenastavovať prehliadač je horšie zlyhanie než prehliadnutie jedného prípadu.

### Krátky názov {#the-short-name}

Ten istý modul skracuje reťazec vykresľovača na zobrazenie: z reťazca ANGLE, napríklad `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, ponechá pole zariadenia, zahodí PCI id a koncovú verziu API a modelu shaderov, a ukáže `Vendor Model`. Krátky názov sa zobrazí v **Rozpočty zdrojov**, s celým reťazcom v bubline; odhad pamäte ukazuje celý reťazec.
