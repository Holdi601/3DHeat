---
title: "Campionamento e budget"
parent: "Dettagli del rendering"
nav_order: 3
lang: "it"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Campionamento e budget

Quando ci sono troppi puntini da disegnare in un fotogramma, il visualizzatore ne disegna un campione uniforme e fa contare di più ciascun puntino, così l'immagine resta corretta. Un controllore regola quanti ne disegna perché il visualizzatore mantenga la sua frequenza di fotogrammi.

## Comandi del pannello prestazioni {#performance-panel-controls}

| Comando | Predefinito | Intervallo (rotella) |
|---|---|---|
| **Disegna ogni riga a ogni fotogramma** | attivo | |
| **Budget adattivo** | attivo | |
| **FPS obiettivo** | 60 | 20-240 (1000) |
| **Sprite / fotogramma iniziali** (adattivo) oppure **Sprite / fotogramma** | 4,00M | 65.536-268.435.456, logaritmico (268.435.456) |
| **Risoluzione del calore** | 100% | 25-100%, moltiplicata per la scala della seconda fase adattiva |
| **Affinamento progressivo** | attivo | Spento: ogni fotogramma è una stima nuova su un solo fotogramma (utile per vedere il campione grezzo). |

Vedi anche [Pannello delle prestazioni e statistiche](performance-and-stats.md).

## Per gli sviluppatori {#for-developers}

### Righe candidate {#candidate-rows}

Le righe sono memorizzate in ordine crescente di tempo. La finestra della linea temporale [*lo*, *hi*] diventa un intervallo di righe con due ricerche binarie sulla colonna del tempo ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); senza una colonna del tempo ogni riga è un candidato. Queste sono le **Righe nella finestra** della sovrapposizione delle statistiche. I test per riga - filtri, gruppi, divisione, culling, sezione, durata - avvengono più tardi, nello shader; una riga che fallisce costa un'invocazione di vertice e nessun frammento.

### Il piano di campionamento {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) divide l'intervallo di candidati in **blocchi di 4.096 righe consecutive** e sceglie quanti disegnarne dal budget di sprite del fotogramma:

- Se il budget copre ogni blocco, vengono disegnati tutti - il fotogramma è esatto.
- Altrimenti i blocchi vengono presi a un passo uniforme lungo l'intervallo, con uno sfasamento casuale che avanza di un rapporto aureo a ogni fotogramma, così i fotogrammi successivi coprono blocchi diversi e l'unione riempie in modo uniforme. È un campione **stratificato**: ogni parte dell'intervallo di tempo è rappresentata in ogni fotogramma.

Il calore di ogni riga disegnata viene moltiplicato per **candidati / inviati**, così il calore atteso di un fotogramma è esatto a qualsiasi budget; solo il rumore dipende dal budget. Le righe vivono in blocchi di 8.388.608 (vedi [Residenza della memoria GPU](gpu-memory.md)); un blocco viene diviso dove attraversa un pezzo, e ogni pezzo riceve l'elenco degli inizi di blocco che deve disegnare.

Un piano può contenere al massimo 65.536 blocchi - 268.435.456 sprite - perché entrambi i backend tengono un buffer fisso di inizi di blocco da 65.536 slot. Una richiesta di più viene limitata a quel valore, e la differenza compare onestamente come più fotogrammi per convergere.

### Disegna ogni riga a ogni fotogramma {#draw-every-row-each-frame}

**Prestazioni → Disegna ogni riga a ogni fotogramma** (predefinito **attivo**): il budget diventa un minimo invece che un massimo, e un fotogramma che avvia una stima nuova disegna ogni riga di cui è responsabile (fino al limite di 268M).

Il motivo: uno spostamento della telecamera scarta l'accumulo, quindi un fotogramma in movimento è una stima singola il cui rumore è fissato da quanta parte dei dati ha disegnato - con un quarto disegnato, ne vedi un quarto in puntini pesati e luminosi, ed è ciò che fa scintillare una vista in movimento. Disegnare tutto rende ogni fotogramma l'immagine finita. Il costo è che il tempo di fotogramma ora segue la dimensione dei dati nella finestra; le leve sono una finestra temporale più stretta, i filtri o un culling per distanza, che riducono i candidati invece di campionarli più radi.

Spegnilo su hardware che non può permettersi l'intero campo in una volta: *Sprite / fotogramma* diventa allora un limite reale, e la vista converge nel giro di pochi fotogrammi fermi.

Quanto costa un piano pieno, misurato su una GPU da desktop di fascia alta con un canvas 4K e un livello grande, con sprite di raggio 1 m (un pixel o due): circa 100M sprite a fotogramma a 30 fps, 200M a 15 fps, e il massimo di 268M a circa 12 fps. Con sprite così piccoli il costo intero è lo stadio dei vertici, e la risoluzione del calore non cambia nulla; con sprite grandi il costo è il riempimento: 8M sprite di raggio 100 m richiedevano 2,5 s a fotogramma alla piena risoluzione del calore e 170 ms al 25%. **Disegna ogni riga a ogni fotogramma** quindi parte da 67M e sale di un quarto a ogni fotogramma finché i fotogrammi richiedono meno di 150 ms, e si dimezza quando ne richiedono più di 400 ms, così una vista pesante non può spingere un fotogramma oltre ciò che il watchdog della GPU consente.

### Il budget adattivo {#the-adaptive-budget}

**Prestazioni → Budget adattivo** (predefinito attivo) regola il budget di sprite per mantenere **FPS obiettivo** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). È inattivo nel replay a scatola e durante i rendering video.

L'ingresso è il tempo di fotogramma, levigato (90% il precedente + 10% il nuovo, con i singoli fotogrammi limitati a 2 s), rispetto a un obiettivo di 1000 / max(15, FPS obiettivo) ms.

**Stadio uno - sprite.** A ogni fotogramma il budget viene moltiplicato per `1 + (target / frame - 1) × guadagno`, con un guadagno di 0,35 quando è troppo lento e 0,08 quando c'è margine, limitato a un fattore 0,5-1,25 per fotogramma e a 65.536-268.435.456 sprite.

**Stadio due - risoluzione.** Solo quando il budget è già al suo minimo e i fotogrammi sono ancora più del 10% troppo lenti, la risoluzione del buffer del calore scende dell'8% a fotogramma, fino al 25% del canvas; si recupera del 4% a fotogramma mentre c'è il 30% di margine. Il costo dei frammenti scende con il quadrato della risoluzione, il che è quasi invisibile sotto una rampa morbida. (Misurato con il rendering software con 10M righe e sprite sovradimensionati: da 141 ms a 17 ms per fotogramma.) La scala viene arrotondata a sedicesimi; *Risoluzione calore* della sovrapposizione la mostra.

**Rinuncia.** Un fotogramma lento appare uguale sia che a causarlo siano stati gli sprite sia che sia stato un livello pesante - non c'è una misura del tempo per passata. Se il budget sta al suo minimo e i fotogrammi restano sotto il 70% dell'obiettivo per 30 fotogrammi, la causa non erano gli sprite: il controllore passa a **salita**, moltiplicando il budget per 1,5 ogni 14 fotogrammi e ripristinando la risoluzione, purché il tempo di fotogramma resti entro 1,5 volte quello che era al minimo. Una salita che peggiora le cose oltre questo limite torna indietro al 60% e riprende il controllo normale; raggiungere l'obiettivo termina la salita.

Con il budget adattivo spento, il budget è semplicemente **Sprite / fotogramma**.

Con *Disegna ogni riga a ogni fotogramma* attivo, il budget adattivo gira comunque, ma la regola esatta alza il budget fino a coprire tutte le righe candidate, quindi in pratica controlla solo lo stadio della risoluzione e i fotogrammi che non avviano una stima nuova.
