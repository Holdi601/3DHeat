---
title: "Erkennung vum Software-Rendering"
parent: "Rendering-Interna"
nav_order: 6
lang: "lb"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---


# Erkennung vum Software-Rendering

Wann Ären Browser op dem Haaptprozessor zeechent anstatt op der Grafikkaart, ass d'Visualisatioun e puer Mol méi lues. D'Visualisatioun mierkt dat a weist eng rout Box, déi Iech seet, wat Dir afschalte sollt.

Wann e Browser d'Hardwarebeschleunegung ausgeschalt huet oder säin Treiber gespaart ass, zeechent en WebGL an WebGPU op dem Prozessor. Alles funktionéiert nach, nëmme vill méi lues. Dat Ergebnis ass "dës Visualisatioun ass mat mengen Daten net benotzbar" - e Symptom, dat op den Tool weist, net op eng Astellung am Browser. Dofir kuckt d'Visualisatioun op den Numm vum Renderer a seet dat ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## D'Banner {#the-banner}

Wann den Renderer sécher als Software erkannt gëtt, erschéngt eng rout Box uewen an der Säitelëscht (bei den Tabs Heatmap an Match), iwwer der Modusleescht:

![Den rouden Banner: Leeft ouni Grafikkaart](../assets/img/en/software-rendering-banner.webp)

> **Leeft ouni Grafikkaart.**
> Dësen Browser zeechent op dem Prozessor amplaz op der Grafikkaart, wat vill méi lues ass a grouss Datesätz net packt. Schalt d'Hardwarebeschleunegung an den Astellungen vum Browser an (Chrome: Astellungen → System → "Grafikbeschleunegung benotzen wann verfügbar", dann neistarten), a kuckt, datt den Grafiktreiber aktuell ass.

## Fir Entwéckler {#for-developers}

### Wéi et entscheet {#how-it-decides}

D'Renderer-Zeechekette - WebGL2 sengt `UNMASKED_RENDERER_WEBGL`, oder den Adapter-Hersteller, d'Architektur an d'Gerät vun WebGPU - gëtt a Klengbuschtawen ëmgewandelt an klasséiert:

- **Software**, wann se `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` oder `generic renderer` enthält;
- **Hardware**, wann se e bekannten GPU-Hersteller oder eng Familie enthält (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unbekannt** soss.

Nëmmen *Software* léist de Banner aus. Ee Adapter, dee mir net bekannt ass, seet guer näischt: e Mënsch mat engem funktionéierende GPU an seng Browser-Astellungen ze schécken, ass en méi schlechte Feeler, wéi en Fall ze verpassen.

### De kuerze Numm {#the-short-name}

Dat selwecht Modul kierzt d'Renderer-Zeechekette fir d'Uweisung: aus enger ANGLE-Zeechekette wéi `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` behält et d'Gerätefeld, léisst d'PCI-ID an déi lescht API- an Shader-Modell-Ugaben weg a weist `Vendor Model`. De kuerze Numm steet bei **Ressourcebudgeten**, mat der ganzer Zeechekette als Tooltip; d'Schätzung vum Späicher weist déi ganz Zeechekette.
