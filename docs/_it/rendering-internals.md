---
title: "Dettagli del rendering"
nav_order: 22
has_children: true
lang: "it"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Interni del rendering

Il visualizzatore disegna milioni di punti come macchie luminose e le somma. Questa sezione spiega i trucchi che lo mantengono veloce, e che cosa significano i numeri nel pannello delle statistiche. Leggila se il visualizzatore sembra lento, o se vuoi lavorare sul renderer.

```
dati -> finestra temporale -> filtri GPU -> piano di campionamento -> splat -> accumulo -> colore -> schermo
```

Per vedere come sta andando il tuo computer, guarda il riquadro delle statistiche in alto a destra della vista: [Pannello prestazioni e sovrapposizione statistiche](performance-and-stats.md). Le parole nuove (GPU, riga, sprite, mappa di calore) sono nel [glossario](glossary.md).

## Il problema di fondo {#the-core-problem}

Una somma di rampe radiali sovrapposte costa *N* × π*r*² frammenti fusi per fotogramma. Con 100 milioni di sprite di raggio 8 px sono 2 × 10¹⁰ frammenti - circa un secondo di lavoro su una GPU di fascia alta. Non si può calcolare a forza bruta a ogni fotogramma, quindi il visualizzatore combina:

- **righe ordinate per tempo** - una finestra temporale sono due ricerche binarie, e il costo della riproduzione segue le righe della finestra, non l'intero dataset;
- **nessun lavoro per riga sulla CPU a ogni fotogramma** - le righe stanno nella memoria della GPU, quantizzate; filtri, segni dei gruppi, il test di durata, la finestra, lo scarto e la sezione vengono valutati nello shader dei vertici;
- **campionamento stratificato** con pesi di compensazione quando un fotogramma non può disegnare ogni riga, e **accumulo progressivo** che converge alla risposta esatta con tutte le righe mentre la vista resta ferma ([Campionamento e budget](sampling-and-budgets.md), [Accumulo](accumulation.md));
- **un regolatore a due stadi** che scambia sprite per fotogramma, poi risoluzione del calore, per ottenere la frequenza di fotogrammi ([Campionamento e budget](sampling-and-budgets.md#the-adaptive-budget));
- **budget di memoria imposti**, così un dataset che non ci sta viene troncato in modo visibile invece di far crollare l'app ([Residenza della memoria GPU](gpu-memory.md)).

## Un fotogramma {#one-frame}

Il ciclo dei fotogrammi è [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Tutto ciò che cambia alla frequenza dei fotogrammi - camera, testina di riproduzione, budget - vive nel motore, non nello stato dell'applicazione, quindi un fotogramma non costa lavoro di React; lo stato viene letto una volta per fotogramma e riscritto solo per le letture a bassa frequenza.

1. **Dati nuovi?** Un nuovo dataset viene annunciato (*Caricamento di N righe sulla GPU*) in un fotogramma e caricato nel successivo, così il messaggio viene dipinto prima che il lavoro blocchi il thread. Un nuovo livello viene consegnato al renderer; i percorsi della mappa di calore delle linee vengono costruiti o liberati.
2. **La testina di riproduzione** avanza (limitata a 0,1 s di tempo reale per fotogramma), torna all'inizio o si ferma.
3. **La camera** legge tasti, mouse e gamepad; lo specchio degli assi viene incorporato nella matrice di vista; su WebGPU una matrice di rimappatura della profondità converte l'intervallo di profondità in stile OpenGL di three.js in quello di WebGPU.
4. **Che cosa è visibile**: l'intervallo di tempo dalla timeline e dalla cronologia; la tabella dei segni dei gruppi (solo visibilità sotto una suddivisione per colonna); fino a quattro filtri - filtri di colonna e la selezione Entità; la suddivisione per differenza.
5. **Le tabelle di colori e curve** vengono ricostruite se sono cambiate le loro impostazioni.
6. **Budget**: il regolatore adattivo imposta il budget di sprite e la risoluzione del calore di questo fotogramma; con *Disegna ogni riga a ogni fotogramma* il budget viene alzato per coprire ogni riga candidata.
7. **Le firme** decidono che cosa significa ancora il buffer di accumulo: una modifica a qualsiasi cosa che cambi quali righe contribuiscono o come (*geometria*), all'intervallo temporale, oppure solo al modo in cui il risultato viene colorato (*composito*). Vedi [Accumulo](accumulation.md#what-restarts-it).
8. **Piano di campionamento**: quali blocchi di righe disegnare ([Campionamento e budget](sampling-and-budgets.md)).
9. **Modalità di accumulo**: reset, estendi, media mobile, media corrente, oppure inattivo.
10. **Geometria del replay dei box** (cubi, scie) sulla CPU, solo in quella modalità e solo quando non è inattiva.
11. **Rendering**: il backend disegna la scena (livello, griglia, assi, box, scie, righello), spalma il calore nel target del calore, lo fonde nell'accumulatore e compone il calore sopra la scena sul canvas.
12. **L'esposizione automatica** scatta quando il suo conto alla rovescia arriva a zero; la sonda di calore del righello legge al massimo un pixel ogni 120 ms; le letture vengono pubblicate.

Un fotogramma inattivo - convergente, senza cambiamenti - salta la scena e lo spalmare, ma **ricompone** comunque: un canvas WebGL creato senza `preserveDrawingBuffer` ha un contenuto non definito dopo la composizione, quindi non è sicuro contare su di esso per mantenere l'ultimo fotogramma. La scena e i target del calore sono i framebuffer propri del visualizzatore e li conservano, quindi un fotogramma inattivo costa un solo passaggio a schermo intero.

## Pagine di questa sezione {#pages-in-this-section}

- [I due backend](backends.md) - WebGPU e WebGL2, come se ne sceglie uno, parametri nell'indirizzo
- [Accumulo](accumulation.md) - reset, estendi, media mobile, media corrente
- [Campionamento e budget](sampling-and-budgets.md) - il campionatore stratificato, la modalità esatta, il budget adattivo
- [Accumulo in mezza precisione](half-float-accumulation.md) - intervallo e precisione sui target a 16 bit
- [Residenza della memoria GPU](gpu-memory.md) - archiviazione delle righe quantizzate e il budget GPU imposto
- [Rilevamento del rendering software](software-rendering.md)
- [Pannello prestazioni e sovrapposizione statistiche](performance-and-stats.md)
