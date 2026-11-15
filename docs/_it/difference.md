---
title: "Differenza"
parent: "Modalità di calore"
nav_order: 5
lang: "it"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Differenza

Rosso dove la squadra A ne ha fatto di più, verde-blu dove ne ha fatto di più la squadra B, niente dove erano pari.

**Differenza** (tasto 2) è calore con segno. Le righe di una popolazione aggiungono calore; quelle di un'altra lo sottraggono. Dove le due si bilanciano il risultato è zero e completamente trasparente; dove una prevale, si mostra con i colori di quel lato - di base caldi (trasparente → rosso → giallo → bianco) per il lato **+** e freddi (trasparente → verde → blu → viola) per il lato **−**.

![Calore di differenza: rosso dove il lato + ne ha fatto di più, verde e blu dove ne ha fatto di più il lato -](../assets/img/it/difference-split.webp)

## Come si usa {#how-to-use-it}

1. Premi `2` (oppure scegli **Differenza** nella barra delle modalità).
2. Apri **Suddivisione per differenza** nella barra laterale.
3. Scegli cosa **Suddividi per**: di solito *Gruppi*.
4. Metti un gruppo (o un valore) su **+** e un altro su **−**.
5. Leggi i colori: il caldo indica il lato +, il freddo il lato −. Il pannello avvisa se un lato non ha righe (vedi [Messaggi che potresti vedere](#messages-you-may-see)).

*Quali* due popolazioni confrontare è tutta la questione, quindi la suddivisione può usare qualsiasi colonna mantenuta, non solo i gruppi. Le righe che non cadono su **nessuno** dei due lati sono **escluse**, non contate come zero: è ciò che fa sì che una suddivisione su due valori tra molti confronti esattamente quei due, e si combina con i [filtri](filters.md) - filtra su una sola mappa, poi suddividi per versione.

La modalità richiede due lati: una colonna di gruppo con almeno due gruppi, oppure una suddivisione su una colonna mantenuta per il filtraggio. Con dati che hanno meno di due gruppi, un caricamento parte con una suddivisione per colonna - prima la colonna *File di origine* di un caricamento da più file, altrimenti la prima colonna categoria con due valori, altrimenti la prima colonna numerica con un intervallo - così *confronta due caricamenti* funziona anche su dati senza gruppi. Solo i dati che non hanno nulla di tutto ciò lasciano la modalità non disponibile; lo stesso vale per una suddivisione di colonna che lascia un lato vuoto.

## Il pannello Suddivisione per differenza {#the-difference-split-panel}

Mostrato in modalità Differenza, sotto i pannelli del calore.

**Suddividi per** offre:

| Opzione | Mostrata come | Regola di suddivisione |
|---|---|---|
| Gruppi | *Gruppo (N)* (quando c'è una colonna di gruppo) | Ogni gruppo su +, − o nessuno, impostato nell'[Elenco delle squadre](teams-list.md) |
| Una colonna categoria | *colonna (N valori)* | Valori su +, − o nessuno |
| Una colonna numerica | *colonna (numerica)* | Un intervallo di valori per ciascun lato |
| Il file di origine | *File di origine - confronta due caricamenti* (quando sono stati caricati più file) | File su +, − o nessuno |

Vengono offerte solo le colonne indicate con *Conserva per il filtraggio* al momento del caricamento.

### Confronta quote, non conteggi {#compare-shares-not-counts}

**Confronta quote, non conteggi** (predefinito disattivato) pesa ciascun lato per uno diviso per il proprio numero di righe, così un lato con cinque volte le righe non vince solo per numero. Il colore mostra allora dove ciascun lato è proporzionalmente più comune dell'altro. Usalo quando i due lati hanno quantità di dati molto diverse, per esempio due sessioni di durata diversa.

### Messaggi che potresti vedere {#messages-you-may-see}

Il pannello avvisa quando l'immagine non è una vera differenza:

| Messaggio | Significato |
|---|---|
| *N + / M −* (o *N + / M − / K non usati*) | Quanti valori stanno su ciascun lato (e su nessuno). |
| Nessuna riga nella finestra è sul lato **+** | Viene disegnato solo il lato **−**. Sposta la finestra della linea temporale o cambia la suddivisione. |
| Nessuna riga nella finestra è sul lato **−** | Viene disegnato solo il lato **+**. |
| Nessun valore è su nessuno dei due lati | La differenza non disegna nulla. Metti almeno un valore su **+** o **−**. |
| *colonna* non può essere suddivisa così | La colonna scelta non si adatta alla suddivisione. Scegli di nuovo la colonna. |
| La colonna di suddivisione non è entrata nella memoria GPU per N di M blocchi | Quelle righe non vengono disegnate. Aumenta il budget GPU in Prestazioni → Budget delle risorse, oppure carica meno righe. |

### Per gruppo {#by-group}

Il pannello rimanda all'[Elenco delle squadre](teams-list.md), dove ogni gruppo ha un pulsante **+** e uno **−**. A ogni caricamento la prima metà dei gruppi (arrotondata per eccesso) va su +, il resto su −; **Dividi equamente** nell'Elenco delle squadre fa di nuovo lo stesso. Un gruppo su nessuno dei due lati, o nascosto con la sua casella, non contribuisce.

### Per valori di categoria {#by-category-values}

| Parte | Significato |
|---|---|
| `a + / b − / c non usati` | Quanti valori stanno su ciascun lato e su nessuno. |
| **Svuota** | Mette ogni valore su nessuno dei due lati. |
| Elenco dei valori | Ogni valore con un pulsante **+** e uno **−** (clicca di nuovo sul pulsante attivo per toglierlo da quel lato). Un valore vuoto è elencato come *(mancante)*. |
| Nota sul limite | Vengono elencati solo i primi 200 valori: *Mostrati i primi 200 di N valori. Una colonna così ampia si restringe meglio prima con un filtro, oppure si suddivide per intervallo se i suoi valori sono ordinati.* |

Scegliendo la colonna, il suo primo valore va su + e il secondo su −. Quando nessuno dei due lati ha valori, la suddivisione torna ai gruppi invece di mostrare un riquadro vuoto. *File di origine* funziona allo stesso modo, un valore per file - è così che si confrontano due esportazioni, due prove o due versioni.

### Per intervallo {#by-range}

| Parte | Significato |
|---|---|
| Suggerimento | Il minimo e il massimo della colonna. |
| **Intervallo positivo (+)**, **da** / **a** | Le righe con un valore in questo intervallo, inclusi entrambi gli estremi, sommano. |
| **Intervallo negativo (−)**, **da** / **a** | Le righe in questo intervallo sottraggono. |
| **Suddividi a metà** | Imposta + su [minimo, centro] e − su [centro, massimo] - è anche ciò che accade scegliendo la colonna. |

Un valore in entrambi gli intervalli conta come +. Gli intervalli non devono coprire tutta la colonna; i valori fuori da entrambi sono esclusi. *I primi due minuti contro gli ultimi due* è una suddivisione per intervallo su una colonna di tipo tempo.

## Colori {#colours}

La sezione **Colori del calore** mostra in questa modalità due editor della rampa: **Positiva (squadre additive)** e **Negativa (squadre sottrattive)**, ciascuno con il proprio pulsante di ripristino (*Ripristina a trasparente → rosso → giallo → bianco*, *Ripristina a trasparente → verde → blu → viola*). Il composito prende il valore assoluto del calore netto attraverso il [punto di saturazione e la risposta](colour-and-exposure.md), e sceglie la rampa negativa dove il netto è sotto zero. Vedi [Colore ed esposizione](colour-and-exposure.md#the-ramp-editor).

Usa la risposta alla densità *Lineare* quando conta la grandezza della differenza: è l'unica risposta in cui lo stesso colore significa lo stesso conteggio.

## Come funziona {#how-it-works}

Ogni riga riceve un segno di +1, -1 o 0 nello shader dei vertici ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); uno 0 scarta la riga prima che venga disegnato qualunque frammento.

- Per gruppo, il segno viene da una tabella di 4.096 voci indicizzata dall'id di gruppo della riga (l'id di gruppo sta nel quarto canale del texel di posizione della riga).
- Per categoria, il segno viene da una seconda tabella di 4.096 voci, riempita per ogni valore di categoria, e il valore della riga viene letto dalla texture di filtro della colonna; un valore oltre la fine della tabella viene scartato su entrambi i backend.
- Per intervallo, il valore della riga viene confrontato con i due intervalli.

Cambiare la suddivisione riavvia l'accumulo.

**I gruppi nascosti restano nascosti con ogni suddivisione.** Con una suddivisione per colonna la tabella dei gruppi non porta più segni; contiene 1 per un gruppo mostrato e 0 per uno nascosto ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), e le due tabelle arrivano allo shader insieme - due righe di una texture di segno su WebGL2, due metà di un unico storage buffer su WebGPU. Una riga viene disegnata solo se il suo gruppo è mostrato *e* il valore della sua colonna sta su un lato. Quindi un gruppo deselezionato nell'[Elenco delle squadre](teams-list.md), o escluso dal focus di lato della scheda Partita, non contribuisce in nessun caso, qualunque sia la suddivisione della differenza.
