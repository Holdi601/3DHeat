---
title: "Detectarea randării software"
parent: "Detalii interne ale randării"
nav_order: 6
lang: "ro"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Detectarea randării software

Dacă browserul tău desenează pe procesorul principal în loc de placa grafică, vizualizatorul este de multe ori mai lent. Vizualizatorul observă asta și arată o casetă roșie care îți spune ce să activezi.

Când un browser are accelerarea hardware oprită, sau driverul lui este pus pe lista neagră, desenează WebGL și WebGPU pe CPU. Totul încă funcționează, de multe ori mai lent, iar experiența este „vizualizatorul acesta este inutilizabil de lent cu datele mele" - un simptom care arată spre unealtă, nu spre un comutator din browser. Așa că vizualizatorul se uită la numele randatorului și o spune ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Bannerul {#the-banner}

Când randatorul este identificat clar ca software, o casetă roșie apare în partea de sus a barei laterale (filele Hartă de căldură și Meciuri), deasupra barei de moduri:

![Bannerul roșu: Rulează fără placa grafică](../assets/img/en/software-rendering-banner.webp)

> **Running without the graphics card.**
> This browser is drawing on the CPU instead of the graphics card, which is many times slower and will not handle large datasets. Turn on hardware acceleration in the browser settings (Chrome: Settings → System → "Use graphics acceleration when available", then restart), and check that the graphics driver is up to date.

## Pentru dezvoltatori {#for-developers}

### Cum decide {#how-it-decides}

Șirul randatorului - `UNMASKED_RENDERER_WEBGL` al WebGL2, sau furnizorul, arhitectura și dispozitivul adaptorului WebGPU - este transformat în litere mici și clasificat:

- **software** când conține `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` sau `generic renderer`;
- **hardware** când conține un furnizor sau o familie de GPU cunoscută (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **necunoscut** altfel.

Doar *software* ridică bannerul. Un adaptor nerecunoscut nu spune nimic: a trimite pe cineva cu un GPU funcțional să-și reconfigureze browserul este o greșeală mai gravă decât a rata un caz.

### Numele scurt {#the-short-name}

Același modul scurtează șirul randatorului pentru afișare: dintr-un șir ANGLE precum `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` păstrează câmpul dispozitivului, scoate id-ul PCI și API-ul și modelul de shader de la sfârșit, și arată `Vendor Model`. Numele scurt apare în **Bugete de resurse**, cu șirul complet ca text de ajutor; estimarea memoriei arată șirul complet.
