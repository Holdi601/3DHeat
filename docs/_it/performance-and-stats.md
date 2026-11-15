---
title: "Pannello delle prestazioni e statistiche"
parent: "Dettagli del rendering"
nav_order: 7
lang: "it"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Pannello prestazioni e sovrapposizione statistiche

Il riquadro in alto a destra della vista mostra quanto lavora il visualizzatore: quanti fotogrammi al secondo, quanti punti disegna e se sta ancora affinando l'immagine. Il pannello **Prestazioni** ti permette di scambiare qualità dell'immagine con velocità.

## La sovrapposizione delle statistiche {#the-stats-overlay}

Il riquadro in alto a destra della vista nelle schede Mappa di calore e Partita ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Legge i dati live del motore a ogni fotogramma di animazione.

![La sovrapposizione delle statistiche sulla scena dei molti incontri, con didascalie numerate: 1 Backend, 2 FPS, 3 Fotogramma, 4 Righe nella finestra, 5 Sprite / fotogramma, 6 Budget, 7 Ris. calore, 8 Copertura](../assets/img/en/performance-stats-overlay.webp)

| Riga | Significato |
|---|---|
| **Backend** | *WebGPU* o *WebGL2*. Passa sopra con il mouse per il motivo per cui WebGPU non è stato usato, quando non lo è stato. Vedi [I due backend](backends.md). |
| **FPS** | Fotogrammi al secondo, mediati su almeno 0,4 s. |
| **Fotogramma** | Tempo di fotogramma in ms, levigato (90% il valore precedente, 10% il nuovo). È il tempo tra i fotogrammi, non il tempo GPU - non viene misurato il tempo GPU per passaggio. |
| **Righe nella finestra** | Righe candidate: le righe nella finestra temporale attuale, prima del filtro per riga nello shader. |
| **Sprite / fotogramma** | Gli sprite inviati dal piano dell'ultimo fotogramma (mantenuto al valore pianificato sui fotogrammi inattivi, che non disegnano nulla). |
| **Budget** | Il budget di sprite con cui è stato pianificato questo fotogramma - il valore del regolatore adattivo, alzato a tutti i candidati quando si disegna ogni riga. |
| **Ris. calore** | La risoluzione del buffer del calore come quota del canvas: l'impostazione *Risoluzione del calore* moltiplicata per la scala adattiva del secondo stadio. |
| **Copertura** | Quanto l'accumulo progressivo è arrivato a usare ogni riga: una percentuale mentre converge (ambra), *esatto* quando ha finito. Un fotogramma rumoroso non viene mai scambiato per l'immagine finita. |
| **Cubi** | Box disegnati nel [replay dei box](box-replay.md). |
| **Non residente** | Mostrato solo quando le righe non entravano nel budget GPU: quante. Vedi [Residenza della memoria GPU](gpu-memory.md). |

## La visualizzazione della velocità {#the-speed-display}

In basso a destra della vista, solo in prospettiva: la velocità di volo e il tempo per attraversare i dati a quella velocità. Trascinala per cambiare la velocità. Vedi [Camera](camera.md#fly-speed).

## Se il visualizzatore è lento {#if-the-viewer-is-slow}

Guarda la sovrapposizione delle statistiche, poi:

1. **Righe nella finestra molto più grandi di Sprite / fotogramma, Copertura sotto il 100%** - il fotogramma non può disegnare tutto; converge su più fotogrammi quando è fermo. Restringi la finestra, filtra o scarta per ridurre i candidati; oppure accetta il campionamento.
2. **Sprite / fotogramma uguali a Righe nella finestra, fotogramma ancora lento** - il costo è per sprite sullo schermo: abbassa il *Raggio massimo in pixel* ([Forma dello sprite](sprite-shape.md#pixel-clamps)) o la *Risoluzione del calore*.
3. **Lento con poche righe** - probabilmente il livello: molti elementi strutturali con i bordi attivi, triangoli del terreno, profondità di campo. Vedi [Aspetto del livello](level-appearance.md).
4. **Tutto lento e un banner rosso** - rendering software ([Rilevamento del rendering software](software-rendering.md)).

## Il pannello Prestazioni {#the-performance-panel}

| Controllo | Predefinito | Effetto |
|---|---|---|
| Suggerimento | | Ogni fotogramma spalma un sottoinsieme casuale stratificato delle righe visibili, con un peso scalato per compensare, così il calore atteso è esatto a qualsiasi budget; tenere la vista ferma continua a unire fotogrammi finché ogni riga ha contribuito. |
| **Disegna ogni riga a ogni fotogramma** | attivo | Ogni fotogramma che avvia una stima nuova disegna ogni riga candidata (fino a circa 268 milioni); il budget qui sotto diventa un minimo. [Campionamento e budget](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Budget adattivo** | attivo | Regola gli sprite per fotogramma, poi la risoluzione del calore, per mantenere la frequenza di fotogrammi obiettivo - e smette di tagliare quando il taglio non aiuta. [Campionamento e budget](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS obiettivo** | 60 | 20-240 (1000 con la maniglia). I valori sotto 15 vengono trattati come 15. |
| **Sprite / fotogramma iniziali** / **Sprite / fotogramma** | 4,00M | 65.536-268.435.456, logaritmico. Chiamato *Iniziali* mentre l'adattivo è attivo, perché il regolatore lo sposta. |
| **Risoluzione del calore** | 100% | 25-100%. Il costo dei frammenti cresce con il quadrato: 50% riduce a un quarto il lavoro di fusione, e il campo del calore è così liscio che quasi non si nota. |
| **Affinamento progressivo** | attivo | Accumula tra i fotogrammi mentre la vista è ferma. Disattivato mostra la stima di un solo fotogramma a ogni fotogramma. [Accumulo](accumulation.md) |
| **Budget delle risorse** | rilevati | Budget di RAM, GPU e del thread di analisi. [Memoria e budget](memory-and-budgets.md#resource-budgets) |

Nessuna di queste impostazioni viene salvata; ricaricando la pagina tornano i valori predefiniti.
