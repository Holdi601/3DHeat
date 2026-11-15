---
title: "Otkrivanje softverskog renderovanja"
parent: "Interno renderovanje"
nav_order: 6
lang: "bs"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Otkrivanje softverskog renderovanja

Ako vaš pregledač crta na glavnom procesoru umjesto na grafičkoj kartici, preglednik je mnogo puta sporiji. Preglednik to primijeti i prikazuje crveni okvir koji vam kaže šta treba uključiti.

Kad je u pregledaču isključeno hardversko ubrzanje, ili je njegov drajver na crnoj listi, WebGL i WebGPU se crtaju na CPU-u. Sve i dalje radi, mnogo puta sporije, a iskustvo je "ovaj preglednik je sa mojim podacima neupotrebljivo spor", što pokazuje na alat, a ne na prekidač u pregledaču. Zato preglednik gleda ime renderera i to kaže ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Baner {#the-banner}

Kad je renderer pozitivno prepoznat kao softverski, crveni okvir se pojavljuje na vrhu bočne trake (kartice Toplotna mapa i Meč), iznad trake režima:

![Crveni baner: Radi bez grafičke kartice](../assets/img/en/software-rendering-banner.webp)

> **Rad bez grafičke kartice.**
> Ovaj preglednik crta na procesoru umjesto na grafičkoj kartici, što je mnogo puta sporije i neće izdržati velike skupove podataka. Uključite hardversko ubrzanje u postavkama preglednika (Chrome: Postavke → Sistem → „Koristi grafičko ubrzanje kada je dostupno“, zatim ponovo pokrenite) i provjerite je li upravljački program grafičke kartice ažuran.

## Za programere {#for-developers}

### Kako odlučuje {#how-it-decides}

String renderera - `UNMASKED_RENDERER_WEBGL` iz WebGL2, ili dobavljač adaptera, arhitektura i uređaj iz WebGPU-a - pretvara se u mala slova i klasifikuje se:

- **softverski** kad sadrži `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` ili `generic renderer`;
- **hardverski** kad sadrži poznatog proizvođača ili porodicu GPU-a (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **nepoznat** inače.

Samo *softverski* podiže baner. Nepoznat adapter uopšte ništa ne kaže: poslati nekoga sa ispravnom GPU-om da mijenja postavke pregledača je gora greška nego propustiti jedan slučaj.

### Kratko ime {#the-short-name}

Isti modul skraćuje string renderera za prikaz: iz ANGLE stringa kao `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` zadržava polje uređaja, izbacuje PCI id i završni API i model shadera, i prikazuje `Vendor Model`. Kratko ime se pojavljuje u **Budžeti resursa**, sa punim stringom kao savjetom pri zadržavanju miša; procjena memorije prikazuje puni string.
