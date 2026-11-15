---
title: "Identifikazzjoni tar-rendering bis-software"
parent: "Id-dettalji tar-rendering"
nav_order: 6
lang: "mt"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Identifikazzjoni tar-rendering bis-software

Jekk il-browser tiegħek jipinġi fuq il-processur ewlieni minflok fuq il-karta tal-grafika, il-viewer ikun ħafna drabi aktar bil-mod. Il-viewer jinnota dan u juri kaxxa ħamra li tgħidlek x'għandek tixgħel.

Meta browser ikollu l-aċċelerazzjoni bl-hardware mitfija, jew id-driver tiegħu ikun imblukkat, jipinġi WebGL u WebGPU fuq is-CPU. Kollox xorta jaħdem, ħafna drabi bil-mod, u r-reazzjoni tkun "dan il-viewer huwa bil-mod b'mod li ma jintużax bid-dejta tiegħi" - sintomu li jindika l-għodda, mhux setting fil-browser. Għalhekk il-viewer iħares lejn l-isem tar-renderer u jgħid dan ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Il-banner {#the-banner}

Meta r-renderer jiġi identifikat b'mod pożittiv bħala software, kaxxa ħamra tidher fil-quċċata tas-sidebar (tabs Heatmap u Partita), fuq il-mode bar:

![Il-banner ħamra: Qed taħdem mingħajr il-karta tal-grafika](../assets/img/en/software-rendering-banner.webp)

> **Qed taħdem mingħajr il-karta tal-grafika.**
> Dan il-browser qed ipinġi bis-CPU minflok bil-karta tal-grafika, li hu ħafna drabi aktar bil-mod u ma jlaħħaqx ma' datasets kbar. Attiva l-aċċelerazzjoni bl-hardware fis-settings tal-browser (Chrome: Settings → System → "Use graphics acceleration when available", imbagħad erġa' ibda), u ċċekkja li d-driver tal-grafika jkun aġġornat.

## Għall-iżviluppaturi {#for-developers}

### Kif jiddeċiedi {#how-it-decides}

Is-string tar-renderer - `UNMASKED_RENDERER_WEBGL` tal-WebGL2, jew il-vendor, l-architettura u l-device tal-adapter tal-WebGPU - titnaqqas għal ittri żgħar u tiġi klassifikata:

- **software** meta fih `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` jew `generic renderer`;
- **hardware** meta fih vendor jew familja magħrufa tal-GPU (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** inkella.

Biss *software* iqajjem il-banner. Adapter mhux magħruf ma jgħid xejn: jibgħat lil xi ħadd b'GPU li jaħdem biex jerġa' jikkonfigura l-browser tiegħu huwa falliment agħar milli jinqabad każ wieħed.

### L-isem qasir {#the-short-name}

L-istess modulu jqassar is-string tar-renderer għall-wiri: minn string ta' ANGLE bħal `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` iżomm il-qasam tal-apparat, ineħħi l-ID tal-PCI u l-verżjoni tal-API u tal-shader fl-aħħar, u juri `Vendor Model`. L-isem qasir jidher f'**Baġits tar-riżorsi**, bl-isem sħiħ bħala tooltip tiegħu; l-istima tal-memorja turi l-isem sħiħ.
