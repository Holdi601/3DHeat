---
title: "Caricare i dati"
nav_order: 3
has_children: true
lang: "it"
source: "getting-data-in.md"
source_hash: "35eb9e47859c"
translated: true
outdated: false
---

# Caricare i dati

Prima che 3DHeat possa disegnare qualcosa, gli serve una tabella: ogni riga dice dove si trovava qualcosa e, se lo hai, quando e chi era. Questa sezione mostra come un file diventa un'immagine. Non hai ancora dati? Prova i [dati di esempio](demo-data.md).

**Fai questo subito:**

1. Nella barra laterale Mappa di calore apri **Sorgente** e premi **File…** (oppure trascina un file o una cartella nella zona di rilascio).
2. Controlla **Mappatura delle colonne**: di solito le caselle sono già compilate.
3. Controlla che **Stima della memoria** dica *entra*.
4. Premi **Carica**.

```mermaid
flowchart LR
  A["Sorgente<br/>scegli file o una cartella"] --> B["Anteprima<br/>prime righe"]
  B --> C["Mappatura delle colonne<br/>X, Y, Z, tempo, persona, squadra"]
  C --> D["Stima della memoria<br/>entra, al limite o non entra"]
  D --> E["Carica"]
  E --> F["L'immagine"]
```

Tutto ciò che mostra la scheda Mappa di calore viene da un solo **dataset**: una tabella di righe, ciascuna con una posizione e, facoltativamente, un tempo, una persona, un gruppo, una sessione, una direzione di sguardo e un numero qualsiasi di colonne extra tenute per i filtri. Questa sezione spiega come si crea un dataset.

## Il percorso dai file all'immagine {#the-path-from-files-to-picture}

1. **Seleziona i file** nel pannello **Sorgente**: uno, più d'uno, un albero di cartelle, oppure trascinandoli. Sono accettati Parquet, CSV, Tacview, tracce GPS e altro; l'elenco completo è in [Formati dei dati](data-formats.md#files). Vedi [Caricamento dei file](loading-files.md).
2. **Anteprima.** Viene aperto il primo file della selezione: i nomi delle sue colonne, le sue prime 50 righe, quali colonne sembrano numeriche e (per Parquet) il tipo logico di ogni colonna e le istruzioni di lettura del file, la voce `heat3d` del footer.
3. **Mappatura automatica.** Le colonne vengono assegnate a ruoli - X, Y, Z, tempo, persona, sessione, gruppo, direzione di sguardo - e alcune restano per il filtraggio. Ogni ipotesi è mostrata nel pannello **Mappatura delle colonne** e può essere cambiata. Vedi [Mappatura delle colonne](column-mapping.md) e [Assi, unità e tempo](axes-units-and-time.md).
4. **Conteggio.** Viene letto il numero di righe di ogni file (esatto dai footer Parquet, stimato per CSV), così il pannello può dire prima del caricamento quanta memoria serve e se entra. Se non entra, propone di caricare una riga ogni *N*. Vedi [Memoria e budget](memory-and-budgets.md).
5. **Carica.** Un worker in background analizza solo le colonne mappate di ogni file - più file alla volta, fino al budget dei [thread di parsing](memory-and-budgets.md#parser-threads) - e li unisce, nell'ordine della selezione, in un solo dataset: un unico dizionario condiviso di persone, gruppi e sessioni per tutti i file, un'unica origine temporale comune, tutte le righe ordinate per tempo. Vedi [Sessioni, persone e gruppi](sessions-persons-groups.md).
6. **Invio alla GPU.** Il thread principale annuncia "Invio di N righe alla GPU" per un fotogramma, poi impacchetta le righe nella memoria GPU entro il budget GPU. Vedi [Residenza della memoria GPU](gpu-memory.md).
7. **Prima immagine.** La telecamera inquadra i dati, il raggio degli sprite e la saturazione sono impostati in base all'estensione dei dati e al numero di righe, e dopo 8 fotogrammi resi la saturazione viene misurata dall'immagine stessa ([Colore ed esposizione](colour-and-exposure.md)).

## Requisiti, verificati prima del caricamento {#requirements-checked-before-a-load}

| Requisito | Cosa succede senza |
|---|---|
| **Almeno due tra X / Y / Z** | Il caricamento viene rifiutato. Con esattamente due, il terzo asse vale 0 e i dati sono disegnati come un piano piatto nella scena 3D - che è ciò che serve a una mappa di calore dall'alto. |
| Una colonna di tempo | Facoltativa. Senza, la linea temporale è disattivata, la vista resta in modalità **Tutto** e la barra laterale lo indica. |
| Una colonna di persona | Facoltativa. Serve per la [sovrapposizione delle figure](box-replay.md) (una figura per persona), per il [calore lineare](line-heat.md) (il percorso di ogni persona), per l'interpolazione, le scie e la cronologia **Durata di vita**. |
| Una colonna di gruppo | Facoltativa. Serve per il [calore per squadra](team-heat.md) e per la modalità [differenza](difference.md) (almeno due gruppi). |

Una modalità che i dati caricati non possono supportare è disattivata (in grigio) nella barra delle modalità; passandoci sopra il mouse si legge il motivo.

## Senza dati propri {#without-your-own-data}

Il pannello **Dataset** (sotto **Sorgente**) ha un [generatore sintetico](synthetic-generator.md) che produce un dataset di forma "battle royale" di qualsiasi dimensione, utile per provare il visualizzatore e per verificare cosa regge una macchina.

## Pagine di questa sezione {#pages-in-this-section}

- [Caricamento dei file](loading-files.md) - selettori, cartelle, trascinamento, unione di più file, la regola dei file di movimento, avanzamento e annullamento
- [Mappatura delle colonne](column-mapping.md) - ogni campo del pannello di mappatura, come la mappatura automatica indovina, i suggerimenti `heat3d`
- [Assi, unità e tempo](axes-units-and-time.md) - asse verticale, inversioni, scala delle unità, unità di tempo, direzione di sguardo
- [Sessioni, persone e gruppi](sessions-persons-groups.md) - cosa fa ciascuno, i limiti, i nomi condivisi, la dimensione delle entità, il pannello Dataset
- [Generatore sintetico](synthetic-generator.md)
- [Memoria e budget](memory-and-budgets.md) - il modello di occupazione, il controllo di adattamento, la riduzione, il limite di ordinamento, i budget delle risorse
