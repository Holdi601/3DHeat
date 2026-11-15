---
title: "Tarkvaralise renderduse tuvastamine"
parent: "Renderdamise sisemine tööpõhimõte"
nav_order: 6
lang: "et"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Tarkvaralise renderduse tuvastamine

Kui sinu brauser joonistab peaprotsessoriga graafikakaardi asemel, on vaataja mitu korda aeglasem. Vaataja märkab seda ja näitab punast kasti, mis ütleb, mida sisse lülitada.

Kui brauseril on riistvaraline kiirendus välja lülitatud või draiver on musta nimekirja pandud, joonistab ta WebGL-i ja WebGPU-d protsessoril. Kõik töötab veel, ainult palju aeglasemalt, ja kogemus on "see vaataja on minu andmetega kasutamatult aeglane". See sümptom viitab tööriistale, mitte brauseri seadele. Seega vaataja vaatab renderdaja nime ja ütleb seda ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Bänner {#the-banner}

Kui renderdaja on kindlalt tuvastatud tarkvaralisena, ilmub punane kast külgriba ülaossa (vahekaartidel Soojus ja Matš), mooduriba kohal:

![Punane bänner: Töötab ilma graafikakaardita](../assets/img/en/software-rendering-banner.webp)

> **Töötab ilma graafikakaardita.**
> See brauser joonistab graafikakaardi asemel protsessoriga, mis on mitu korda aeglasem ega tule suurte andmestikega toime. Lülita brauseri seadetes sisse riistvarakiirendus (Chrome: Seaded → Süsteem → „Kasuta graafikakiirendust, kui see on saadaval“, seejärel taaskäivita) ja kontrolli, et graafikadraiver oleks ajakohane.

## Arendajatele {#for-developers}

### Kuidas see otsustab {#how-it-decides}

Renderdaja string (WebGL2 `UNMASKED_RENDERER_WEBGL` või WebGPU adapteri tootja, arhitektuur ja seade) muudetakse väiketähtedeks ja liigitatakse:

- **tarkvaraline**, kui see sisaldab `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` või `generic renderer`;
- **riistvaraline**, kui see sisaldab tuntud GPU tootjat või perekonda (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **tundmatu** muidu.

Ainult *tarkvaraline* tõstab bännerit. Tundmatu adapter ei ütle üldse midagi: inimese, kellel on töötav GPU, saatmine oma brauserit ümber seadistama on halvem viga kui mõne juhtumi märkamata jätmine.

### Lühinimi {#the-short-name}

Sama moodul lühendab renderdaja stringi kuvamiseks: ANGLE stringist, nagu `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`, jätab seadme välja, eemaldab PCI ID ja lõpus oleva API ja shaderi mudeli ning näitab `Vendor Model`. Lühinimi on jaotises **Ressursieelarved** koos täieliku stringiga tooltipina; mälu hinnang näitab täielikku stringi.
