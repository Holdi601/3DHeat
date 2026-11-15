---
title: "Zbulimi i vizatimit me softuer"
parent: "Brendësitë e vizatimit"
nav_order: 6
lang: "sq"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Zbulimi i vizatimit me softuer

Nëse shfletuesi yt vizaton me procesorin kryesor në vend të kartës grafike, shikuesi është shumë herë më i ngadaltë. Shikuesi e vëren këtë dhe shfaq një kuti të kuqe që të thotë çfarë të ndezësh.

Kur një shfletues ka përshpejtimin me harduer të fikur, ose drejtuesi i tij është në listën e zezë, ai vizaton WebGL dhe WebGPU me CPU-në. Gjithçka ende funksionon, shumë herë më ngadalë, dhe përvoja është "ky shikues është i papërdorshëm me të dhënat e mia" - një simptomë që tregon te mjeti, jo te një çelës i shfletuesit. Prandaj shikuesi shikon emrin e vizatuesit dhe e thotë këtë ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Banderola {#the-banner}

Kur vizatuesi identifikohet me siguri si softuer, një kuti e kuqe shfaqet lart në shiritin anësor (skedat Heatmap dhe Match), mbi shiritin e modaliteteve:

![Banderola e kuqe: Po punon pa kartën grafike](../assets/img/en/software-rendering-banner.webp)

> **Po punon pa kartën grafike.**
> Ky shfletues po vizaton me CPU-në në vend të kartës grafike, që është shumë herë më i ngadaltë dhe nuk do të përballojë grupe të mëdha të dhënash. Ndiz përshpejtimin me harduer te cilësimet e shfletuesit (Chrome: Cilësimet → Sistemi → "Përdor përshpejtimin grafik kur është e disponueshme", pastaj rinis), dhe kontrollo që drejtuesi i grafikës të jetë i përditësuar.

## Për zhvilluesit {#for-developers}

### Si vendos {#how-it-decides}

Vargu i vizatuesit - `UNMASKED_RENDERER_WEBGL` i WebGL2, ose prodhuesi, arkitektura dhe pajisja e adapterit WebGPU - kthehet në shkronja të vogla dhe klasifikohet:

- **softuer** kur përmban `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` ose `generic renderer`;
- **harduer** kur përmban një prodhues ose familje të njohur GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **e panjohur** përndryshe.

Vetëm *softueri* ngre banderolën. Një adapter i panjohur nuk thotë asgjë fare: t'i dërgosh dikujt me GPU të punueshme të rikonfigurojë shfletuesin e vet është një gabim më i keq sesa të humbasësh një rast.

### Emri i shkurtër {#the-short-name}

I njëjti modul e shkurton vargun e vizatuesit për shfaqje: nga një varg ANGLE si `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` mban fushën e pajisjes, heq ID-në PCI dhe modelin e API-t dhe hijuesit në fund, dhe shfaq `Vendor Model`. Emri i shkurtër shfaqet te **Buxhetet e burimeve**, me vargun e plotë si tekst kur kalon miun; vlerësimi i memories shfaq vargun e plotë.
