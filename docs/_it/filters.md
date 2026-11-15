---
title: "Filtri"
parent: "Filtri e strumenti"
nav_order: 1
lang: "it"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtri

**Filtri** nascondono le righe che non ti interessano, come una classe di veicolo o un tipo di evento, e l'immagine si aggiorna subito. Il pannello elenca le colonne mantenute al caricamento sotto *Mantieni per il filtraggio* ([Mappatura delle colonne](column-mapping.md)), più *File di origine* quando sono stati caricati più file.

## Provalo {#try-it}

1. Carica un dataset e apri **Filtri** nella barra laterale.
2. Sotto **Classe di veicolo**, deseleziona *Tank*. L'immagine cambia subito.
3. Premi **Rimuovi tutti i filtri** per annullare.

![Il pannello Filtri: prima le colonne proprie del visualizzatore (Tipo di evento, Classe di veicolo), poi le colonne del tuo file](../assets/img/en/filters.webp)

Le prime righe sono le colonne proprie del visualizzatore (sotto). Le righe seguenti vengono dal tuo file.

## Colonne aggiunte dal visualizzatore {#columns-the-viewer-adds}

All'apertura il visualizzatore ricava quattro colonne proprie e le elenca **per prime**, con nomi e valori nella tua lingua, così lo stesso filtro funziona per ogni gioco e ogni fonte di dati:

| Colonna | Valori | Ricavata da |
|---|---|---|
| **Tipo di evento** | 23 tipi: Posizione, Colpo sparato, Lancio (missile, razzo, bomba), Colpito, Mancato (l'arma è finita vicino a nessun bersaglio), Esplosione, Danno, Uccisione, Morte, Distrutto, Schianto, Eiezione / lancio con il paracadute, Comparsa, Scomparsa, Decollo, Atterraggio, Contatto con il suolo, Fermo a terra, Riarmo / rifornimento, Cattura / obiettivo, Esca, Messaggio, Altro | una colonna chiamata `event`, `events`, `event_type` o `event_name`; le parole di ciascun gioco (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) vengono ricondotte a questi tipi. La tabella completa: [Tipi e classi di evento](ref-event-types.md). |
| **Giocatore o IA** | Giocatore, IA | una colonna `ai`, `is_ai`, `bot` o `actor`; altrimenti `is_player` / `human`; altrimenti un id account (`user_id`, `steam_id`; vuoto o 0 è IA); per le registrazioni Tacview, se l'oggetto ha un pilota |
| **Classe di veicolo** | 17 classi: Caccia, Aereo d'attacco, Bombardiere, Altro aereo, Elicottero, Carro armato, Veicolo corazzato, Difesa aerea, Artiglieria, Camion / auto, Nave, Sottomarino, Fanteria, Arma, Esca, Struttura, Altro | il nome del veicolo o dell'unità (confrontato con il [catalogo delle figure](figures.md)) e le colonne di tipo |
| **Classe del bersaglio** | le stesse classi | il veicolo dell'altra parte (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Vengono elencati solo i tipi che compaiono. Le colonne di valore (`cost_*`, `earn_*`, `net_*` e *Fonte del costo*, vedi [Ponderazione dei valori](value-weighting.md)) si filtrano come qualsiasi colonna numerica: per esempio deseleziona *stima* sotto *Fonte del costo* per tenere solo le righe con un prezzo.

Una lista di categorie con più di 12 valori ottiene una casella di ricerca (*Cerca n valori*) e un pulsante **Solo questi**, che consente esattamente i valori che corrispondono.

Quali colonne si possono filtrare viene deciso al caricamento, perché allora devono essere lette. Senza colonne mantenute il pannello lo dice e rimanda a *Mantieni per il filtraggio*.

## Colonne numeriche (intervallo) {#numeric-columns-range}

![Un filtro di intervallo (denaro perso) con entrambe le estremità trascinate](../assets/img/en/filters-numeric.webp)

| Parte | Significato |
|---|---|
| Nome, e `min ... max` | La colonna e l'intervallo attuale (l'intervallo completo della colonna finché non c'è un filtro). |
| Prima riga: casella numerica e cursore | Il limite inferiore. Trascinando il cursore oltre il limite superiore, lo spinge con sé. |
| Seconda riga: casella numerica e cursore | Il limite superiore. Trascinando sotto il limite inferiore, spinge anche quello. |
| **Ripristina *colonna*** | Rimuove questo filtro. |

I cursori coprono il minimo e il massimo della colonna in 1.000 passi; le caselle numeriche accettano qualsiasi valore. Una riga passa quando il suo valore sta nell'intervallo, estremi inclusi. I valori grandi vengono mostrati in forma esponenziale (`1.23e6`).

## Colonne di categoria {#category-columns}

| Parte | Significato |
|---|---|
| Nome, e `consentiti/totale` | La colonna e quanti dei suoi valori sono consentiti. |
| Elenco dei valori | Una casella per valore; un valore vuoto è mostrato come *(vuoto)*. |
| **Tutti** / **Nessuno** | Consente ogni valore / nessun valore. |

Consentire ogni valore rimuove il filtro.

## Regole {#rules}

- **Quattro filtri insieme.** L'intestazione mostra `attivi/4`. Un quinto filtro non viene applicato, e il pannello lo dice. Una selezione in [Entità](entities.md) (o il focus sul giocatore della scheda Partita) usa uno dei quattro. Un filtro che copre tutta la colonna non ne usa nessuno.
- **Una colonna di categoria ha al massimo 4.096 valori**; una più ampia non viene mantenuta al caricamento.
- **I filtri si combinano con AND**, e con la visibilità delle squadre, la suddivisione per differenza, la finestra temporale, l'esclusione per distanza e la [sezione](slice.md).
- **Cambiare un filtro riavvia l'accumulo e rimisura l'esposizione** qualche fotogramma dopo, perché filtrare può cambiare molto la densità ([Colore ed esposizione](colour-and-exposure.md#auto-exposure)).
- **Rimuovi tutti i filtri** elimina ogni filtro di colonna. Visibilità delle squadre e selezioni dei giocatori impostate altrove restano.
- I filtri di colonna cambiano le modalità di calore. Non cambiano le figure del [replay delle figure](box-replay.md), che seguono la visibilità delle squadre e la selezione in Entità. La selezione in Entità cambia entrambe.
- Nel [calore lineare](line-heat.md) un filtro viene verificato sulla riga in cui ciascun segmento *finisce*.
- A ogni nuovo dataset tutti i filtri vengono rimossi.

## Per gli sviluppatori {#for-developers}

**Slot.** Ogni filtro attivo occupa uno dei quattro slot GPU ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), una texture di 4 byte per riga. Gli slot vanno ai filtri nell'ordine in cui sono stati cambiati l'ultima volta ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), condiviso da shader e dai due pannelli). Oltre quattro, un errore dice *Vengono applicati solo i primi 4 filtri. Rimuovine uno - gli altri vengono ignorati, non combinati in silenzio*, e i nomi dei filtri extra riportano *colonna (non applicato)*. I filtri vengono eseguiti riga per riga nello shader dei vertici, quindi cambiare una soglia non richiede né un nuovo parsing né un nuovo caricamento.

**Filtri che il pannello non mostra.** Nello stato dell'applicazione esistono altri due tipi ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- un filtro **gruppi**, impostato dalla scheda Partita quando mette a fuoco un lato. Nasconde gli altri gruppi in ogni modalità, anche una [differenza](difference.md) suddivisa per colonna.
- un filtro **persone**, impostato dal pannello [Entità](entities.md) e dalla scheda Partita quando mette a fuoco un giocatore. Limita il replay delle figure e le modalità di calore. Nel calore è un filtro di categoria sugli id delle persone e occupa uno dei quattro slot. La sua maschera contiene 65.536 id ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); una persona oltre quel limite non viene disegnata nel calore mentre il filtro è attivo, anche se selezionata. Il replay delle figure le mostra comunque.
