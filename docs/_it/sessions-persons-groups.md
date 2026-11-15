---
title: "Sessioni, persone e gruppi"
parent: "Caricare i dati"
nav_order: 4
lang: "it"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessioni, persone e gruppi

Una **persona** è una cosa in movimento (un giocatore, un'auto). Una **squadra/gruppo** è la parte a cui appartiene. Una **sessione** è una partita o un giro. Vedi il [glossario](glossary.md).

Una riga di un file può indicarle tutte e tre:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` è la persona, `team` è il gruppo, `match` è la sessione.

Tre colonne facoltative descrivono *chi* e *dove nella storia* appartiene una riga. Ognuna viene codificata a dizionario al caricamento: i valori di testo diventano piccoli id interi per riga più un unico elenco di etichette, condiviso da tutti i file del caricamento.

## Persona {#person}

La colonna **ID persona** indica la cosa in movimento a cui appartiene una riga: un giocatore, un bot, un'auto. È memorizzata come id a 32 bit per riga.

Con una persona e una colonna del tempo, il caricamento calcola per ogni riga la sua **durata di vita**: il tempo fino al campione successivo della stessa persona *nella stessa sessione*, oppure "nessuno" (un valore sentinella, -1) quando non c'è un campione successivo - la persona è morta, se n'è andata, o il log è finito. Le durate di vita alimentano la cronologia **Durata di vita** della [linea del tempo](timeline.md), l'interpolazione e l'obsolescenza nel [replay a scatole](box-replay.md), e le interruzioni di percorso della [mappa di calore delle linee](line-heat.md). Cosa fa una riga senza successore è un'impostazione di visualizzazione (*Durata di vita di riserva*), non è incorporato nei dati.

A ogni persona viene assegnato il gruppo della sua **prima** riga nel tempo; questa assegnazione colora la sua scatola nel replay a scatole e decide quale interruttore di visibilità del gruppo la nasconde lì. Le modalità di calore usano invece il gruppo di ogni riga.

### Nomi portati da più cose insieme {#names-worn-by-several-things-at-once}

Un nome non è sempre una sola entità: in alcuni esport ogni bot di ogni partita viene registrato con un unico nome. Unire due campioni di una tale "persona" - con interpolazione, una scia o un percorso - disegna una linea tra due creature diverse attraverso la mappa.

Al caricamento ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) un nome viene segnato come **condiviso** quando due record di esso

- sono nella stessa sessione,
- hanno lo stesso tempo,
- sono della stessa categoria (ogni colonna di categoria mantenuta ha lo stesso valore), e
- sono più distanti dell'1% della diagonale dell'estensione dei dati.

I nomi condivisi vengono disegnati come campioni singoli - niente interpolazione, niente scia, niente percorso della mappa di calore delle linee. Il resto che li riguarda (il loro calore) non cambia. Il pannello Dataset elenca quanti nomi sono stati segnati, con fino a tre esempi, e il pannello del replay a scatole ripete il conteggio.

## Sessione {#session}

La colonna **Sessione / partita** indica a quale partita, incursione, round, corsa o giro appartiene una riga. È ciò che fa diventare i campioni di una persona un unico tracciato continuo: la telemetria reale spesso intreccia partite contemporanee, e un campione del giocatore appena prima della testina e quello appena dopo possono venire da partite diverse a centinaia di metri di distanza. Con una colonna di sessione:

- interpolazione, scie e percorsi della mappa di calore delle linee non attraversano mai un cambio di sessione;
- la durata di vita di una riga finisce alla fine della sua sessione;
- il selettore **Sessione** compare in cima alla barra laterale, sotto la barra delle modalità.

Una colonna di sessione è molto spesso un *timestamp* - l'istante di inizio della partita, ripetuto su ogni riga di quella partita. Il mappatore automatico cerca i nomi delle sessioni prima di persona e gruppo per questo motivo ([Mappatura delle colonne](column-mapping.md#session-person-group)). Anche un giro o uno stint di gara è una sessione: due giri della stessa auto non devono essere uniti in un unico tracciato.

### Il selettore di sessione {#the-session-picker}

![Il selettore di sessione aperto su un file di dieci partite: Tutte le sessioni (10), Match 01, Match 02 e così via](../assets/img/en/sessions-persons-groups-picker.webp)

*Dieci partite in un file: sceglierne una o vederle tutte.*

Viene mostrato quando il dataset ha delle sessioni elencate (vedi il limite sotto).

| Parte | Significato |
|---|---|
| Etichetta a destra | Il numero di righe della sessione scelta, oppure *tutte insieme*. |
| Menu | *Tutte le sessioni (N)*, poi ogni sessione, la più piena prima, come `etichetta - N righe, durata` (durata in secondi sotto i 90 s, in minuti sotto i 90 min, in ore sopra). |
| Suggerimento ambra | Mostrato per *Tutte le sessioni*: le posizioni non vengono mai unite tra sessioni, ma partite contemporanee mettono insieme sulla mappa giocatori che non c'entrano nulla. |
| Suggerimento | Mostrato nelle modalità di calore quando è scelta una sessione: la scelta sposta solo la testina. |

Al caricamento viene selezionata la sessione più piena. Scegliere una sessione porta la testina all'inizio di quella sessione.

Cosa cambia la selezione:

- Nel **[replay a scatole](box-replay.md)** decide quale sessione viene riprodotta: vengono disegnate solo le scatole e le scie di quella sessione, e l'intervallo della linea del tempo diventa la durata propria della sessione.
- Nelle **modalità di calore** non limita il calore, e un suggerimento sotto il selettore lo dice: *Nelle modalità di calore questo sposta solo la testina all'inizio della sessione; il calore conta ancora ogni sessione. Il replay a scatole riproduce da solo la sessione scelta.* Per limitare il calore a una sola sessione, tieni anche la colonna di sessione come colonna di filtro (*Tieni per filtrare*) e filtra su di essa. Una colonna può essere sia colonna di sessione sia colonna di filtro: il caricatore legge ogni colonna di filtro spuntata per conto proprio, qualunque ruolo abbia anche.

### Troppe sessioni {#too-many-sessions}

Vengono elencate fino a **100.000** sessioni. Oltre, la colonna è davvero un id (una cartella con milioni di sessioni di poche righe ciascuna), e mandare così tante etichette dal worker alla pagina è ciò che esaurisce la memoria di una scheda. Il caricamento allora mantiene gli **id** delle sessioni - così i confini restano rispettati ovunque - ma scarta le etichette e il selettore, e il pannello Dataset lo dice.

## Gruppo {#group}

La colonna **Squadra / gruppo** è una qualunque colonna a bassa cardinalità: una squadra, una parte, una squadra di gioco, una fazione, un flag giocatore-contro-IA, una classe di auto. È memorizzata come id a 16 bit per riga e guida:

- l'[elenco delle squadre](teams-list.md) (visibilità per gruppo, + / − parti),
- il [calore delle squadre](team-heat.md) (una tinta per gruppo),
- la [differenza](difference.md) divisa per gruppo,
- i colori delle scatole nel [replay a scatole](box-replay.md) (una famiglia di tinte per gruppo, una sfumatura per membro).

### Limiti {#limits}

Al massimo **4.096** gruppi distinti. L'id del gruppo viaggia nel quarto canale del texel di posizione di ogni riga sulla GPU, e ogni gruppo ha bisogno di un texel nella tabella dei segni di 4.096 larghezza che lo shader legge per decidere *nascosto*, *aggiunto* o *sottratto*. Una colonna con più valori distinti è un id, non un gruppo: **il caricamento mantiene ogni riga e scarta solo il raggruppamento**, con un avviso sul dataset che suggerisce di mapparla invece come colonna di persona, o di tenerla come colonna di filtro.

Lo stesso limite di 4.096 vale per una colonna di filtro di *categoria* mantenuta; una più larga non viene mantenuta e il dataset lo dice. Una colonna numerica (un timestamp, per esempio) non ha un limite del genere come filtro di *intervallo*.

I valori di gruppo `0`, un valore vuoto, `none`, `unknown`, `null` e `-1` (senza distinzione tra maiuscole e minuscole) significano "nessun gruppo" per il [calore delle squadre](team-heat.md), che li disegna in grigio neutro invece che con un colore sicuro.

## Dimensione dell'entità {#entity-size}

Quanto è grande una cosa tracciata - la scatola di collisione di un giocatore, un'auto - decide quanto sono grandi le scatole e i raggi di sguardo del [replay a scatole](box-replay.md). Nel pannello non c'è un campo per essa; viene dagli [suggerimenti `heat3d`](data-formats.md#the-heat3d-hints) del file (`entity.size`, nelle unità del file; il convertitore CS2 scrive 32). Il caricamento lo moltiplica per la scala delle unità.

A ogni caricamento ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), con *estensione* la più grande delle estensioni X e Z dei dati:

| Impostazione | Con una dimensione dell'entità | Senza |
|---|---|---|
| Dimensione del cubo | dimensione dell'entità | estensione / 500 |
| Lunghezza del raggio di sguardo | dimensione dell'entità × 4 | estensione / 200 |
| Raggio dello sprite | estensione / 120 | estensione / 120 |
| Punto di saturazione | stima analitica (poi misurata) | uguale |
| Velocità di volo | estensione / 12 | uguale |
| Piano lontano | estensione × 12 | uguale |
| Piano vicino | max(0,05; estensione / 20.000) | uguale |

## Il pannello Dataset {#the-dataset-panel}

Sotto il pannello Sorgente. Con un dataset caricato mostra:

- il **nome** del dataset - la selezione, il numero di righe, il numero di file, il passo quando ne è stato usato uno;
- **`N squadre · N persone · Ns durata`**;
- ogni **avviso** prodotto dal caricamento, in ambra, finché il dataset è caricato: gruppi o una colonna di filtro scartati per troppi valori, sessioni non elencate, nomi condivisi, righe mancanti, file saltati;
- il [generatore sintetico](synthetic-generator.md);
- **Scarica**, che rimuove il dataset.

Il numero di righe è mostrato nell'intestazione del pannello.
