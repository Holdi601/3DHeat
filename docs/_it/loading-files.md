---
title: "Caricamento dei file"
parent: "Caricare i dati"
nav_order: 1
lang: "it"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Caricare i file

Questa pagina mostra come dare a 3DHeat i tuoi file e cosa ne fa. Trascina una
cartella, e sceglie i file che contengono posizioni e li unisce in una sola immagine.

1. Apri **Sorgente** in cima alla barra laterale della Mappa di calore.
2. Trascina file o una cartella nell'area di trascinamento, oppure premi **File…** o **Cartella…**.
3. Leggi la riga della selezione e la **Stima della memoria** (vedi l'immagine sotto).
4. Premi **Carica**.

![Il pannello Sorgente dopo aver trascinato una cartella di dieci partite: 1 la riga della selezione, 2 la Stima della memoria su adatta, e 3 Carica 10 file](../assets/img/en/loading-files-source.webp)

*Dopo aver trascinato una cartella, 3DHeat ti dice cosa ha trovato e se ci sta.*

I file vengono caricati nel pannello **Sorgente**, in cima alla barra laterale della
scheda Mappa di calore. Tutto ciò che viene selezionato insieme diventa **un solo**
dataset.

## Scegliere i file {#choosing-files}

| Comando | Cosa fa |
|---|---|
| **Trascina qui file o una cartella** (l'area di trascinamento) | Trascina un qualunque mix di file e cartelle. Le cartelle vengono esplorate ricorsivamente. Un clic sull'area di trascinamento apre lo stesso selettore di **File…**. |
| **Un file…** | Un selettore di file per un solo file. |
| **File…** | Un selettore di file che accetta più file. |
| **Cartella…** | Un selettore di cartelle (il selettore `webkitdirectory` del browser); viene proposto ogni file dell'albero della cartella. |

I selettori accettano i tipi di file dell'[elenco dei file caricabili](data-formats.md#files). In breve: `.parquet`/`.pq` vengono letti come Parquet, `.csv`/`.tsv`/`.txt` come testo a separatori, `.acmi` (Tacview), `.json`/`.json.gz` di OCAP e i formati GPS (GPX, KML, KMZ, NMEA, IGC, FIT) passano dai loro lettori, e i contenitori di partita `.3dheat` si caricano come le tabelle che contengono ([Un file per partita](container.md)). Un contenitore che non si può leggere viene saltato come *non è un file csv/parquet*.

Le cartelle trascinate vengono esplorate fino a 12 livelli di profondità e al massimo 20.000 file, come protezione contro i cicli di collegamenti simbolici e gli alberi fuori controllo.

## Quali file vengono tenuti {#which-files-are-kept}

Prima che venga letto qualcosa, la selezione viene filtrata ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Un file con un'altra estensione viene saltato: *non è un file csv/parquet*.
- Un file di 0 byte viene saltato: *vuoto (0 byte)*.
- **I sidecar dei convertitori** - i dati grezzi che un convertitore tiene accanto alla tabella di una partita, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` e gli altri elencati in [I convertitori conservano tutto](converters.md) - vengono saltati: *un sidecar di un convertitore*. Per aprirne uno, scegline o trascinane uno da solo (o solo sidecar): una selezione fatta solo di sidecar li carica come una tabella qualsiasi. Il JSON accanto a una tabella (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` e `.hints.json`) non viene mai proposto come posizioni.
- **La regola del file di movimento.** Se un file della selezione si chiama `movement*.parquet`, `movement*.csv` (e le altre estensioni) - `movement.parquet`, `movement_1.parquet` e così via - allora ogni altro file di dati viene saltato: *non è un file di movimento, e questa cartella ha file di movimento*. Le esportazioni di telemetria spesso contengono una tabella di posizioni accanto a decine di tabelle senza posizioni, e solo la prima può essere disegnata. Una cartella senza alcun file di movimento carica tutti i suoi file di dati. Esempio: una cartella con `movement_1.parquet`, `kills.parquet` e `shop.parquet` carica `movement_1.parquet`; gli altri due sono elencati come saltati. Esempio: una cartella con `movement_1.parquet`, `kills.parquet` e `shop.parquet` carica `movement_1.parquet`; gli altri due sono elencati come saltati.
- I file tenuti vengono ordinati per il loro percorso dentro la selezione, così la stessa cartella produce sempre lo stesso dataset e gli stessi colori.

Il pannello mostra poi la selezione (il nome di un solo file, oppure `cartella (N file)` usando la cartella comune più lunga), il numero di file, la loro dimensione totale e il numero totale di righe - esatto quando tutti i file sono Parquet, segnato con `≈` quando uno è CSV. I file saltati vengono elencati con il loro motivo, i primi quattro per nome.

## Leggere lo schema {#reading-the-schema}

Il **primo** file della selezione viene aperto per descrivere lo schema ("Lettura dello schema"): i nomi delle sue colonne, le sue prime 50 righe di dati, quali colonne sembrano numeriche e, per i Parquet, il tipo logico di ogni colonna e la voce del footer `heat3d`. Una cartella di esportazioni di una stessa tabella condivide uno schema, quindi un file rappresenta tutti. Poi ogni file viene misurato ("Conteggio delle righe"): il footer di un Parquet dà il conteggio esatto con una piccola lettura; il conteggio di un CSV è stimato dalla lunghezza media delle righe del suo primo megabyte.

Il pannello [Mappatura delle colonne](column-mapping.md) si apre con le ipotesi della mappatura automatica, e la [stima della memoria](memory-and-budgets.md) compare sopra il pulsante **Carica**.

## Messaggi prima del caricamento {#messages-before-loading}

Sotto la selezione il pannello elenca, da [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Errori** (rossi) - il caricamento non può partire: meno di due assi di posizione, la stessa colonna su due assi, una colonna mappata che non è nel file, una colonna di posizione che non sembra numerica, una colonna del tempo i cui valori campionati sono testo mentre l'unità è un numero (ogni riga risulterebbe NaN e finirebbe al tempo 0), una colonna del tempo impostata su ISO-8601 di cui nessun valore campionato si legge come data, una scala delle unità di 0.
- **Avvisi** (ambra) - il caricamento parte, ma probabilmente non come voluto: una colonna di gruppo che assume un valore distinto nella maggior parte delle righe campionate (quindi è un id, non un gruppo), una colonna del tempo `DATE` (ogni riga di un giorno condivide lo stesso istante), direzione dello sguardo impostata senza le sue colonne.
- **Note** - cosa implica la mappatura: disegno su un piano quando un asse non è mappato, nessuna linea del tempo senza una colonna del tempo, nessun tracciato senza una colonna di persona, e senza una colonna di gruppo un solo colore per tutto e una differenza che può dividere solo su una colonna tenuta per il filtraggio.

## Caricamento {#loading}

Il pulsante **Carica** dice *Carica file*, *Carica N file*, oppure *Carica N file (1 su K)* quando è impostato un [passo di decimazione](memory-and-budgets.md#decimation). Dice *Troppo grande - riduci o decima* ed è disattivato quando il [controllo di adattamento](memory-and-budgets.md#the-fit-check) dice che il caricamento non entrerà; è disattivato anche quando la mappatura ha errori o è in corso un altro caricamento.

Durante il caricamento il pannello mostra il passo attuale (con `[file/file]` davanti quando sono più file), le righe lette finora, una barra di avanzamento e **Annulla**. Annulla termina il worker di acquisizione, e con esso ogni worker di analisi che ha avviato.

La pagina continua a disegnare mentre carica, perché il lavoro avviene in background. Vedi il passo attuale, le righe lette, una barra di avanzamento e **Annulla**. Dopo l'ultimo file il pannello mostra i passi *Metto le righe in ordine di tempo*, *Riordino le colonne (n di m)*, *Misuro l'estensione*, *Costruisco l'elenco*, *Riassumo le sessioni* e *Calcolo le durate di vita*, poi *Carico N righe sulla GPU* per un fotogramma, così un caricamento lungo non viene scambiato per un blocco.

### Come funziona {#how-it-works}

Il caricamento gira in un Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Con più file e più di un [thread di analisi](memory-and-budgets.md#parser-threads), fino a quel numero di file viene analizzato **insieme**, ognuno in un proprio worker di analisi ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), finché il budget della RAM lascia spazio; vengono comunque uniti uno alla volta nell'ordine della selezione, quindi il dataset è lo stesso di un caricamento uno alla volta. Mentre ne sono in corso più d'uno, la riga di avanzamento nomina il file che ha segnalato per ultimo, e la barra e il conteggio delle righe sommano ogni file in corso. Con un solo thread, o un solo file, i file vengono analizzati uno dopo l'altro nello stesso worker di acquisizione. Vengono lette solo le colonne che la mappatura nomina: una colonna non mappata di un file Parquet non costa nulla; un CSV viene scansionato byte per byte, ma vengono decodificati solo i campi mappati.

## Più file diventano un solo dataset {#several-files-become-one-dataset}

Quando viene caricato più di un file ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Un solo elenco.** Persone, gruppi, sessioni e valori di categoria sono dizionari condivisi tra tutti i file, quindi lo stesso giocatore in due esportazioni è una persona con un solo tracciato.
- **Una sola origine del tempo.** I tempi vengono tenuti come secondi a 64 bit durante l'unione e riportati al tempo più antico dell'*intera* selezione, poi memorizzati come secondi a 32 bit da quell'origine. Quattro esportazioni di quattro pomeriggi vengono messe nel loro vero ordine, non impilate l'una sull'altra.
- **Un solo ordine temporale.** Le righe di tutti i file vengono ordinate per tempo con un radix sort (vedi [il limite di ordinamento](memory-and-budgets.md#the-sort-ceiling)).
- **Una colonna `Source file`.** Ogni riga ricorda da quale file arriva, come colonna di categoria chiamata `Source file`. Compare nei [Filtri](filters.md) e come *Source file - confronta due caricamenti* nella [divisione per differenza](difference.md). Un caricamento di un solo file non la riceve - una colonna costante costerebbe 4 byte a riga per non dire nulla.
- **Colonne mancanti.** Un file che manca di una delle colonne di *filtro* contribuisce semplicemente con nessun valore per essa. Un file che manca di una colonna di *ruolo* mappata (X, tempo, persona, ...) fallisce con *il file non ha la colonna "name"*; in un caricamento di più file quel file viene saltato e gli altri si caricano lo stesso, e i file saltati vengono elencati sul dataset. Un caricamento di un solo file che fallisce mostra l'errore.
- **Avviso di mancanza.** Quando le righe caricate sono meno del 95% delle righe contate in precedenza, il dataset porta un avviso con la quota mancante - da file illeggibili o da righe senza una posizione utilizzabile, che vengono scartate all'ingresso.

## Dopo il caricamento {#after-loading}

Il nuovo dataset sostituisce quello precedente. A ogni caricamento ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- tutti i filtri e la visibilità dei gruppi vengono azzerati;
- la divisione per differenza per gruppo viene reimpostata: la prima metà dei gruppi (arrotondata per eccesso) positiva, il resto negativo;
- il raggio dello sprite viene impostato a estensione orizzontale / 120 e la saturazione a una stima analitica; la dimensione del cubo, la lunghezza del raggio di sguardo, la velocità di volo e i piani vicino/lontano vengono impostati dall'estensione (vedi [Sessioni, persone e gruppi](sessions-persons-groups.md#entity-size));
- la sessione del replay a scatole viene impostata alla sessione con più righe;
- i percorsi della mappa di calore delle linee vengono di nuovo stimati ([Mappa di calore delle linee](line-heat.md));
- la modalità di vista ricade su **Calore** se la modalità attuale non è supportata dai nuovi dati; la linea del tempo ricade su **Tutto** senza una colonna del tempo, e la cronologia su **Cumulativo** senza durate di vita;
- la testina viene riportata all'inizio e la riproduzione si ferma;
- la telecamera inquadra l'intero dataset dalla direzione predefinita (guardando lungo -Z, inclinata in basso di circa 36°).

Il pannello **Dataset** mostra poi il nome del dataset (la selezione, il numero di righe e di file, e il passo quando ne è stato usato uno), `N squadre · N persone · Ns durata`, e ogni avviso prodotto dal caricamento, in ambra, finché il dataset è caricato. **Scarica** in quel pannello rimuove il dataset.
