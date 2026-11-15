---
title: "Figure nelle figure sovrapposte"
parent: "Figure"
grand_parent: "Replay"
nav_order: 2
lang: "it"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figure nella sovrapposizione delle figure

Questa pagina riguarda il modo di trasformare i box in piccole figure 3D di ciò che ogni unità era davvero, e il fumo e il fuoco che le figure lasciano dietro di sé. I comandi del replay stesso sono nel [Replay della partita](match-replay.md).

Nel [replay dei box](box-replay.md) e nel replay a figure della scheda Partita, **Figure invece di cubi** (attivo di default) disegna ogni persona viva come la figura di ciò che è: un soldato a piedi, il carro che qualcuno guida, l'aereo di una traccia Tacview. La figura ha il colore, il posto e la direzione del box. Per aerei e missili ha anche il beccheggio e, dove i dati hanno una colonna Roll, l'inclinazione. **Dimensione figure** le scala; 1 volta è la dimensione reale. I clic su una figura rispondono come rispondevano i clic sul suo box.

## Quale figura {#which-figure}

Decidono le colonne di nome e di tipo dei dati. Le regole complete, con i nomi delle colonne, sono in [Figure](figures.md#which-figure-a-unit-gets). I dati senza nessuno dei due tipi di colonna sono dati di persone: ognuno è un soldato.

La corrispondenza viene memorizzata per etichetta, quindi un fotogramma costa solo il posizionamento. Un'unità dei dati è un metro, a meno che i dati non dicano quanto è grande una cosa tracciata (l'esportazione di CS2 dice che un giocatore è largo 32 unità); le figure vengono scalate di conseguenza.

Un pacchetto opzionale di figure tue può sostituire le figure del catalogo sulla tua macchina; vedi [Figure](figures.md#an-optional-local-figure-pack).

## Effetti {#effects}

Le righe di evento che lasciano qualcosa per un po' vengono disegnate dove sono accadute per tutta la loro durata, nel colore di chi le ha causate: un fumo (circa 18 s), un molotov o incendiario (7 s), un flash (circa un secondo) e un'esplosione HE (meno di un secondo), un'esca (15 s), una bomba piazzata (40 s). Vengono da una colonna di evento (Event, Events) la cui etichetta è `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` o `plant` - l'esportazione di CS2 le scrive al momento dell'esplosione.

## Replay della partita: gli strumenti di Tacview {#match-replay-tacviews-tools}

Telecamere, segnalibri, la visualizzazione tattica, le statistiche, le etichette, le **Linee verticali**, l'elenco degli eventi e la finestra dei grafici sono descritti nel [Replay della partita](match-replay.md). [Parità con Tacview](tacview-parity.md) elenca ogni funzione di Tacview e a che punto è.
