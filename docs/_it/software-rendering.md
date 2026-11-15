---
title: "Rilevamento del rendering software"
parent: "Dettagli del rendering"
nav_order: 6
lang: "it"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# Rilevamento del rendering software

Se il tuo browser disegna con il processore principale invece che con la scheda grafica, il visualizzatore è molte volte più lento. Il visualizzatore se ne accorge e mostra un riquadro rosso che ti dice che cosa attivare.

Quando un browser ha l'accelerazione hardware disattivata, o il suo driver è in lista nera, disegna WebGL e WebGPU sulla CPU. Tutto continua a funzionare, molte volte più lentamente, e l'esperienza è "questo visualizzatore è inutilizzabile con i miei dati" - un sintomo che punta allo strumento, non a un interruttore del browser. Quindi il visualizzatore guarda il nome del renderer e lo dice ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## Il banner {#the-banner}

Quando il renderer viene riconosciuto con certezza come software, in cima alla barra laterale (schede Mappa di calore e Partita) compare un riquadro rosso, sopra la barra delle modalità:

![Il banner rosso: In esecuzione senza la scheda grafica](../assets/img/en/software-rendering-banner.webp)

> **In esecuzione senza la scheda grafica.**
> Questo browser disegna sulla CPU invece che sulla scheda grafica, il che è molte volte più lento e non reggerà dataset grandi. Attiva l'accelerazione hardware nelle impostazioni del browser (Chrome: Impostazioni → Sistema → "Usa l'accelerazione grafica quando disponibile", poi riavvia) e verifica che il driver grafico sia aggiornato.

## Per gli sviluppatori {#for-developers}

### Come decide {#how-it-decides}

La stringa del renderer - `UNMASKED_RENDERER_WEBGL` di WebGL2, oppure il fornitore, l'architettura e il dispositivo dell'adattatore WebGPU - viene convertita in minuscolo e classificata:

- **software** quando contiene `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` o `generic renderer`;
- **hardware** quando contiene un fornitore o una famiglia di GPU nota (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **sconosciuto** altrimenti.

Solo *software* fa comparire il banner. Un adattatore non riconosciuto non dice nulla: mandare chi ha una GPU funzionante a riconfigurare il browser è un errore peggiore che perdere un caso.

### Il nome breve {#the-short-name}

Lo stesso modulo accorcia la stringa del renderer per la visualizzazione: da una stringa ANGLE come `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` mantiene il campo del dispositivo, toglie l'id PCI e l'API finale con il modello di shader, e mostra `Vendor Model`. Il nome breve compare in **Budget delle risorse**, con la stringa completa come suggerimento; la stima della memoria mostra la stringa completa.
