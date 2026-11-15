---
title: "Modalità di calore"
nav_order: 4
has_children: true
lang: "it"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Modalità di calore

Ogni punto aggiunge un piccolo bagliore, i bagliori si accumulano e il mucchio viene dipinto con dei colori. Le modalità sono cinque modi di dipingerlo, e ognuna risponde a una domanda.

La barra delle modalità in cima alla barra laterale della scheda Mappa di calore sceglie come viene disegnato il [dataset](glossary.md). I tasti 1-4 scelgono Calore, Differenza, Calore per squadra e Linee. Figure sovrapposte non ha un tasto.

![La barra delle modalità con Calore, Differenza, Calore per squadra, Figure sovrapposte e Linee](../assets/img/en/heat-modes-bar.webp)

| Modalità | Domanda a cui risponde |
|---|---|
| **Calore** | Dove è successo, e quanto? |
| **Differenza** | Quale lato ne ha fatto di più? |
| **Calore per squadra** | Di chi era? |
| **Linee** | Da che parte sono andate le persone? |
| **Figure sovrapposte** | Chi era dove, e quando? |

![Gli stessi dati in quattro modalità: Calore, Differenza, Calore per squadra e Linee](../assets/img/en/heat-modes-grid.webp)

| Modalità (etichetta nella barra) | Tasto | Cosa disegna | Richiede |
|---|---|---|---|
| **Calore** | 1 | Densità additiva: ogni riga visibile aggiunge uno sprite radiale rivolto verso la telecamera. [Calore](heat.md) | un dataset |
| **Differenza** | 2 | Densità con segno: una popolazione aggiunge, un'altra sottrae. [Differenza](difference.md) | due lati: almeno due gruppi, oppure una suddivisione su una colonna mantenuta |
| **Calore per squadra** | 3 | Densità colorata per gruppo: una tinta per gruppo, mescolate dove i gruppi si sovrappongono. [Calore per squadra](team-heat.md) | una colonna di gruppo |
| **Figure sovrapposte** | - | Una figura (o un riquadro) per persona, che si muove lungo la linea temporale: il replay. [Figure sovrapposte](box-replay.md), [Replay della partita](match-replay.md) | una colonna di persona |
| **Linee** | 4 | Calore lineare: una linea da ogni campione di una persona al suo successivo, con il calore che si attenua di lato. [Calore lineare](line-heat.md) | una colonna di persona e una di tempo |

Una modalità che i dati non possono supportare è disattivata in grigio, e il suo suggerimento ne spiega il motivo, per esempio *Non disponibile - la modalità Differenza richiede due gruppi o una colonna da suddividere; questi dati hanno un solo gruppo.* Quando un nuovo dataset non può supportare la modalità attuale, la vista passa a **Calore**.

I tasti 1-4 vengono controllati sui dati nello stesso modo: il tasto di una modalità disattivata non fa nulla.

## Quali pannelli mostra ogni modalità {#which-panels-each-mode-shows}

| Pannello | Calore | Differenza | Calore per squadra | Figure sovrapposte | Linee |
|---|---|---|---|---|---|
| Percorsi ([calore lineare](line-heat.md)) | | | | | sì |
| Forma del calore (con **Segui la vista** e **Stessa densità a ogni zoom**), Colori del calore, Limiti in pixel degli sprite, Profondità, Esclusione per distanza | sì | sì | sì | | sì |
| Direzione ([calore direzionale](directional-heat.md)), Valore ([ponderazione dei valori](value-weighting.md)) | sì | sì | sì | | sì |
| Vista squadre ([figure sovrapposte](box-replay.md)) | | | | sì | |
| Suddivisione per differenza ([differenza](difference.md)) | | sì | | | |
| [Elenco delle squadre](teams-list.md), [Entità](entities.md), [Filtri](filters.md), Sfondo / livello, [Sezione](slice.md), [Misura](measure.md), Percorso della telecamera e resa, Prestazioni, Telecamera e scena | sì | sì | sì | sì | sì |

## Cosa condividono tutte le modalità di calore {#what-every-heat-mode-shares}

Tutte e quattro le modalità di calore (tutte tranne le figure sovrapposte) sono la stessa macchina con input diversi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Quali righe.** La [linea temporale](timeline.md) sceglie un intervallo continuo di righe ordinate per tempo; i [filtri](filters.md), la visibilità dei gruppi, la suddivisione per differenza, l'[esclusione per distanza](depth-and-culling.md#distance-culling) e la [sezione](slice.md) decidono, riga per riga, nello shader dei vertici, se e quanto ciascuna riga contribuisce.
2. **Splatting.** Ogni riga che contribuisce viene disegnata come uno sprite (o, in modalità Linee, come un segmento) in un **bersaglio di calore** in virgola mobile, aggiungendo il proprio valore della rampa. Quando le righe sono più di quante un fotogramma può permettersi, ne viene disegnato un campione stratificato, pesato per compensare. Vedi [Campionamento e budget](sampling-and-budgets.md).
3. **Accumulo.** Finché nulla cambia, i fotogrammi vengono fusi finché ogni riga ha contribuito esattamente una volta. Vedi [Accumulo](accumulation.md).
4. **Composizione.** Il valore accumulato in ogni pixel viene diviso per il **punto di saturazione**, modellato dalla **risposta alla densità**, sollevato dal **calore minimo** e cercato nella **rampa dei colori**, il cui canale alfa lo mescola con la scena. Vedi [Colore ed esposizione](colour-and-exposure.md).

Tutto ciò che è al passo 4 viene applicato al momento della composizione, quindi trascinare quei controlli non riavvia mai l'accumulo; ciò che è ai passi 1-2 sì.

## Pagine di questa sezione {#pages-in-this-section}

- [Calore](heat.md) - la modalità calore semplice, e la panoramica dei suoi pannelli
  - [Forma dello sprite](sprite-shape.md) - raggio, intensità, attenuazione, l'editor della curva, limiti in pixel, appiattimento
  - [Colore ed esposizione](colour-and-exposure.md) - editor della rampa, punto di saturazione, esposizione automatica, calore minimo, risposta alla densità
  - [Profondità e culling](depth-and-culling.md) - occlusione dal livello, nascondere dietro il terreno, esclusione per distanza
- [Differenza](difference.md) - la suddivisione per differenza
- [Calore per squadra](team-heat.md)
- [Calore lineare](line-heat.md) - percorsi
- [Figure sovrapposte](box-replay.md) - la modalità replay (il file si chiama ancora box replay)
- [Calore direzionale](directional-heat.md)
- [Ponderazione dei valori](value-weighting.md)
