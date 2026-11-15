---
title: "Otkrivanje softverskog iscrtavanja"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 6
lang: "hr"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Otkrivanje softverskog iscrtavanja

Ako tvoj preglednik crta na glavnom procesoru umjesto na grafičkoj kartici, preglednik je višestruko sporiji. Preglednik to primijeti i prikaže crveni okvir koji ti kaže što treba uključiti.

Kad preglednik ima isključeno hardversko ubrzanje, ili mu je upravljački program na crnoj listi, crta WebGL i WebGPU na procesoru. Sve i dalje radi, višestruko sporije, pa je iskustvo "ovaj preglednik je s mojim podacima neupotrebljivo spor" - simptom koji upućuje na alat, a ne na prekidač u pregledniku. Zato preglednik gleda naziv iscrtavača i kaže to ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Natpis {#the-banner}

Kad se iscrtavač pouzdano prepozna kao softver, crveni okvir se pojavljuje na vrhu bočne trake (kartice Toplinska karta i Meč), iznad trake načina:

![Crveni natpis: Rad bez grafičke kartice](../assets/img/en/software-rendering-banner.webp)

> **Rad bez grafičke kartice.**
> Ovaj preglednik iscrtava na procesoru umjesto na grafičkoj kartici, što je višestruko sporije i neće podnijeti velike skupove podataka. Uključi hardversko ubrzanje u postavkama preglednika (Chrome: Postavke → Sustav → „Upotrijebi grafičko ubrzanje kada je dostupno”, zatim ga ponovno pokreni) i provjeri je li upravljački program grafičke kartice ažuran.

## Za razvojne programere {#for-developers}

### Kako odlučuje {#how-it-decides}

Niz iscrtavača - `UNMASKED_RENDERER_WEBGL` od WebGL2, ili proizvođač adaptera, arhitektura i uređaj od WebGPU-a - pretvara se u mala slova i razvrstava:

- **software** kad sadrži `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` ili `generic renderer`;
- **hardware** kad sadrži poznatog proizvođača ili obitelj GPU-a (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** inače.

Samo *software* podiže natpis. Nepoznat adapter ne kaže ništa: slati nekoga s ispravnom grafičkom karticom da prekonfigurira preglednik gora je greška nego propustiti jedan slučaj.

### Kratki naziv {#the-short-name}

Isti modul skraćuje niz iscrtavača za prikaz: iz ANGLE niza kao `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` zadržava polje uređaja, odbacuje PCI id i završni API i model shadera, te prikazuje `Vendor Model`. Kratki naziv se pojavljuje u **Proračun resursa**, s punim nizom kao savjetom; procjena memorije prikazuje puni niz.
