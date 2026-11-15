---
title: "Detecció de renderitzat per programari"
parent: "Detalls interns del renderitzat"
nav_order: 6
lang: "ca"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Detecció de renderitzat per programari

Si el teu navegador dibuixa amb el processador principal en lloc de amb la targeta gràfica, el visor va moltes vegades més lent. El visor se n'adona i mostra un quadre vermell que et diu què has d'activar.

Quan un navegador té l'acceleració per maquinari desactivada, o el seu controlador està a la llista negra, dibuixa WebGL i WebGPU a la CPU. Tot segueix funcionant, moltes vegades més lent, i l'experiència és «aquest visor és inutilitzable amb les meves dades»: un símptoma que apunta a l'eina, no a un interruptor del navegador. Per això el visor mira el nom del renderitzador i ho diu ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## El bàner {#the-banner}

Quan el renderitzador s'identifica de manera positiva com a programari, apareix un quadre vermell a dalt de la barra lateral (pestanyes Mapa de calor i Partida), per sobre de la barra de modes:

![El bàner vermell: funcionant sense la targeta gràfica](../assets/img/en/software-rendering-banner.webp)

> **Funcionant sense la targeta gràfica.**
> Aquest navegador dibuixa a la CPU en lloc de a la targeta gràfica, cosa que va moltes vegades més lenta i no gestionarà conjunts de dades grans. Activa l'acceleració per maquinari a la configuració del navegador (Chrome: Configuració → Sistema → «Usa l'acceleració gràfica quan estigui disponible», i després reinicia), i comprova que el controlador gràfic està actualitzat.

## Per als desenvolupadors {#for-developers}

### Com decideix {#how-it-decides}

La cadena del renderitzador —el `UNMASKED_RENDERER_WEBGL` de WebGL2, o el fabricant, l'arquitectura i el dispositiu de l'adaptador de WebGPU— es passa a minúscules i es classifica:

- **software** quan conté `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` o `generic renderer`;
- **hardware** quan conté un fabricant o família de GPU coneguda (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **unknown** en qualsevol altre cas.

Només *software* activa el bàner. Un adaptador no reconegut no diu res: enviar algú amb una GPU que funciona a reconfigurar el seu navegador és una fallada pitjor que no detectar un cas.

### El nom curt {#the-short-name}

El mateix mòdul escurça la cadena del renderitzador per mostrar-la: d'una cadena ANGLE com `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` conserva el camp del dispositiu, treu l'identificador PCI i l'API i el model de shader del final, i mostra `Vendor Model`. El nom curt apareix a **Pressupostos de recursos**, amb la cadena completa com a indicació en passar el ratolí; l'estimació de memòria mostra la cadena completa.
