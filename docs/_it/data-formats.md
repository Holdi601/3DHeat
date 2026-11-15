---
title: "Riferimento dei formati dei dati"
nav_order: 19
lang: "it"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Riferimento dei formati dei dati

Questa pagina elenca ogni tipo di file che 3DHeat può aprire, e come deve essere fatta una tabella al suo interno.
Una tabella è fatta di righe e colonne, come un foglio di calcolo: ogni riga dice dove si trovava qualcosa e,
se lo hai, quando e chi era.

Cosa legge la scheda **Mappa di calore**, colonna per colonna, e i suggerimenti che un file Parquet può portare.
(La scheda Analisi di gara legge i file dei giri, e la scheda Partita i riepiloghi delle partite; vedi [Analisi di
gara](race-analysis.md) e [Analisi delle partite](match-analysis.md).)

## File {#files}

Questo è l'elenco completo dei file caricabili. Il pannello **Sorgente** (**File…**, **Cartella…**, oppure trascinamento)
accetta esattamente questi:

| Estensione | Cos'è | Letto da |
|---|---|---|
| `.parquet`, `.pq` | tabella Parquet | il lettore Parquet (sotto) |
| `.csv`, `.tsv`, `.txt` | testo delimitato | il lettore di testo (sotto) |
| `.3dheat` | una partita in un solo file (uno ZIP che contiene la tabella e i suoi extra) | si carica come la tabella che contiene - [Un file per partita](container.md) |
| `.acmi` (anche `.txt.acmi`, `.zip.acmi`) | registrazione di volo Tacview | il suo lettore - [Registrazioni Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | registrazione OCAP (in stile Arma) | il suo lettore |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | tracce GPS: GPX, KML/KMZ, log NMEA, log di volo a vela IGC, file sportivi FIT | il suo lettore; le posizioni vengono da latitudine e longitudine |

Non caricati come posizioni: i piccoli file JSON che stanno accanto a una tabella per descriverla (nomi che finiscono
in `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), e le
tabelle extra di un convertitore (`<partita>.events.parquet` e simili, vedi [Convertitori](converters.md)) a meno che
tu non le scelga da sole. Tutto il resto viene saltato con un motivo. Come viene filtrata una selezione è spiegato in
[Caricamento dei file](loading-files.md#which-files-are-kept).

I file vuoti vengono saltati. In una selezione che contiene file `movement*.<ext>`, vengono caricati solo quelli
([Caricamento dei file](loading-files.md#which-files-are-kept)).

I dati sono **una riga per campione**: una posizione in un istante, facoltativamente con chi, quale gruppo, quale sessione,
dove stava guardando, e altre colonne. Le righe di evento (un'uccisione, un piazzamento, un colpo) possono stare nella stessa
tabella delle righe di posizione, distinte da una colonna di evento.

## CSV, testo delimitato (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Un file minimo utile, tre righe:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Le colonne si mappano da sole ([Mappatura delle colonne](column-mapping.md)).

Letto da uno scanner a livello di byte che decodifica solo le colonne mappate ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspetto | Regola |
|---|---|
| Intestazione | La prima riga non vuota contiene i nomi delle colonne. Un nome vuoto diventa `column_N`. |
| Separatore | Riconosciuto dalle prime 20 righe non vuote dei primi 1 MiB, tra virgola, punto e virgola, tabulazione e barra verticale, per **coerenza**: vince il separatore che dà lo stesso numero di campi su ogni riga campionata, poi quello che dà più campi. Lo spazio non viene mai riconosciuto ma può essere scelto; qualunque carattere singolo può essere digitato ([Mappatura delle colonne](column-mapping.md#the-fields)). |
| Virgolette | RFC 4180: i campi possono essere racchiusi tra doppie virgolette, `""` dentro le virgolette è un apice letterale. |
| Spazi | Gli spazi iniziali e finali, le tabulazioni e le virgolette vengono tolti da ogni campo. |
| Campi per riga | Al massimo 4.096; di più è un errore (*il separatore è giusto?*). |
| Numeri | Segno facoltativo, cifre, `.` facoltativo e decimali, esponente facoltativo (`1.5e-3`). Una virgola decimale (`1,5`), i separatori delle migliaia o le unità scritte (`12 m`) non vengono letti e contano come mancanti. Se il tuo file usa virgole decimali, sostituiscile con punti prima di caricarlo (trova e sostituisci in un editor di testo funziona). |
| Colonna numerica | Una colonna viene offerta come numerica quando più del 90% dei valori non vuoti nelle prime 50 righe si legge come numeri. |
| Numero di righe | Stimato prima del caricamento dalla lunghezza media delle righe dei primi 1 MiB. |
| Codifica del testo | UTF-8. |

## Parquet {#parquet}

Letto con [hyparquet](https://github.com/hyparam/hyparquet), blocco di colonne per blocco di colonne, in array tipizzati, richiedendo solo le colonne mappate
([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspetto | Regola |
|---|---|
| Numero di righe | Esatto, dal footer, prima del caricamento. |
| Anteprima | Le prime 50 righe, decodificate come oggetti; i loro valori decidono quali colonne sembrano numeriche. |
| Interi | `INT32`, e `INT64` (decodificato come BigInt) diventano numeri. |
| Decimali | `FLOAT`, `DOUBLE`. |
| Booleani | 1 e 0. |
| Stringhe | Usate per le colonne di persona, gruppo, sessione e categoria; una stringa che sembra un numero è accettata per i ruoli numerici. |
| Tipi logici `TIMESTAMP`, `DATE` | Si decodificano in istanti (millisecondi dal 1970); usati come asse del tempo, l'impostazione dell'unità è ignorata. |
| Colonne annidate | Le colonne struct e list non sono pensate per nessun ruolo (in anteprima appaiono come testo JSON); non testate. |
| Metadati del footer | La chiave `heat3d` viene letta come suggerimenti di mappatura (sotto). |

Una colonna di posizione, tempo o sguardo che contiene qualcosa di diverso da un numero viene decodificata come mancante.

## Ruoli e tipi delle colonne {#column-roles-and-types}

| Ruolo | Tipo nel file | Obbligatorio | Memorizzato come | Limiti |
|---|---|---|---|---|
| X, Y, Z | numero | due su tre | float a 32 bit, dopo la [mappatura degli assi](axes-units-and-time.md) | Una riga senza una posizione utilizzabile viene scartata. |
| Tempo | numero in una delle [unità di tempo](axes-units-and-time.md#time-units), timestamp Parquet, o testo ISO-8601 | no | secondi float a 32 bit dalla riga più antica | L'ordinamento è rifiutato oltre 400.000.000 di righe ([perché](memory-and-budgets.md#the-sort-ceiling)). |
| Persona | qualunque; codificata a dizionario | no | id a 32 bit | |
| Sessione | qualunque; codificata a dizionario | no | id a 32 bit | Etichette elencate fino a 100.000 sessioni. |
| Gruppo | qualunque; codificata a dizionario | no | id a 16 bit | Fino a 4.096 gruppi, altrimenti il raggruppamento viene eliminato. |
| Imbardata, beccheggio | numero, gradi o radianti | no | float a 32 bit in radianti | |
| Direzione X, Y, Z | numero | no (tutte e tre insieme) | convertita in imbardata e beccheggio | |
| Colonna di filtro, *intervallo* | numero | no | float a 32 bit | Fino a 4 filtri attivi insieme. |
| Colonna di filtro, *categoria* | qualunque; codificata a dizionario | no | id a 32 bit | Fino a 4.096 valori, altrimenti la colonna non viene tenuta. |

Una colonna `TIMESTAMP` Parquet tenuta come colonna di filtro è un *intervallo* di millisecondi epoch - un cursore, non un elenco.

## Colonne di esito {#outcome-columns}

Chi ha vinto, su ogni riga. Così un punto, un percorso o una giocata si può giudicare da quanto spesso il suo lato ha poi vinto ([Percentuale di vittorie](win-rate.md)). Il visualizzatore tiene queste colonne da solo, le elenca per prime nei [filtri](filters.md), nella lingua del visualizzatore, e le legge nella [mappa delle percentuali di vittoria](win-rate.md), nel [dettaglio](breakdown.md) e nelle [statistiche dei volumi](volumes.md#statistics). Un convertitore per un gioco a round (CS2, Valorant, Rainbow Six Siege) o a partite (War Thunder) le scrive tutte e quattro; il convertitore Tacview le scrive per le campagne di un server DCS quando un file dei round dice chi ha vinto ([Server DCS](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Colonna | Tipo | Significato |
|---|---|---|
| `won` | 0/1 (vuota se sconosciuto) | il lato (la squadra) della riga ha vinto **il round**; in un gioco senza round, la partita |
| `matchWon` | 0/1 (vuota se sconosciuto) | il lato (la squadra) della riga ha vinto **la partita**; vuota se la registrazione non mostra la fine |
| `round` | numero intero, da 1 | il round a cui appartiene la riga; 1 per tutta la partita in un gioco a partite |
| `roundEndReason` | testo | come è finito il round (in un gioco a partite, la partita), con le parole qui sotto |

`won` e `matchWon` sono del lato della riga: le righe di un giocatore T portano l'esito del lato T, quelle di un'unità IA quello della sua squadra; le righe che non appartengono a nessun lato le lasciano vuote. Un lato che cambia all'intervallo tiene il proprio `matchWon` e prende il `won` di ogni round come l'ha giocato. Un pareggio vale 0 per entrambi i lati.

I motivi di fine, comuni a tutti i giochi perché un solo filtro funzioni su tutti (la parola propria di un gioco viene associata dove si può, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Significato | Giochi |
|---|---|---|
| `elimination` | tutti i giocatori di un lato fuori | CS2, Valorant, Rainbow Six Siege |
| `bomb` | la bomba (lo spike, il bersaglio del disinnescatore) è esplosa | CS2, Valorant, Rainbow Six Siege |
| `defuse` | la bomba (lo spike) disinnescata | CS2, Valorant, Rainbow Six Siege |
| `time` | il tempo del round è scaduto; War Thunder: decisa con ticket rimasti a entrambi i lati | tutti |
| `surrender` | un lato si è arreso | CS2, Valorant, Rainbow Six Siege |
| `draw` | nessun vincitore | CS2 |
| `objective` | un obiettivo preso o tenuto (ostaggio estratto, area messa in sicurezza) | Rainbow Six Siege |
| `capture` | finiti i ticket mentre il vincitore teneva le zone di cattura; DCS: una campagna persistente vinta conquistando ogni aeroporto e ogni zona | War Thunder, DCS |
| `tickets` | ticket persi per le uccisioni | War Thunder |
| `destruction` | gli ultimi veicoli persi tutti insieme, nessuno rimasto per rientrare | War Thunder |
| `other` | qualsiasi altra cosa | |

Indicale anche nella lista `extra` dei suggerimenti `heat3d`, come ogni altra colonna. I nomi di colonna `win`, `round_won`, `match_won`, `end_reason` e `win_reason` vengono letti come le stesse colonne.

## I suggerimenti `heat3d` {#the-heat3d-hints}

Un file Parquet può portare le proprie istruzioni di lettura nei metadati chiave/valore del suo footer, sotto la chiave
**`heat3d`**, come oggetto JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Il viewer le
applica sopra le proprie ipotesi quando il file è il primo di una selezione; ogni voce è facoltativa e ogni risultato resta mostrato e
modificabile nel pannello [Mappatura delle colonne](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Tutto ciò che non si legge
come oggetto JSON viene ignorato.

### Schema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          nomi delle colonne per la posizione
    "time": string,                                  la colonna del tempo
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           colonne di filtro da tenere, dalla più utile
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  deve essere > 0
  },
  "entity": {
    "size": number                                   dimensione di una cosa tracciata in unità del file, > 0
  }
}
```

| Voce | Applicata quando | Effetto |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | la colonna indicata esiste nel file | Imposta quel ruolo. |
| `columns.timeUnit` | è una delle sette unità | Imposta l'unità di tempo. |
| `columns.angleUnit` | `"degrees"` o `"radians"` | Imposta l'unità degli angoli. |
| `columns.lookMode` | `"vector"` con dirX, dirY e dirZ tutti impostati; `"yawPitch"` con yaw impostato; `"none"` | Imposta la modalità di sguardo. |
| `columns.extra` | è un array | Sostituisce l'elenco automatico dei filtri, tenendo solo le colonne esistenti non usate da un ruolo; ognuna è *intervallo* quando sembrava numerica nell'anteprima, altrimenti *categoria*. Senza, si mantiene l'elenco automatico meno ogni colonna assegnata a un ruolo da un suggerimento. |
| `axes.up` | `"y"` o `"z"` | Asse verticale. |
| `axes.flipX/Y/Z` | un booleano | Inversioni. |
| `axes.scale` | un numero > 0 | Scala delle unità. |
| `entity.size` | un numero > 0 | [Dimensione dell'entità](sessions-persons-groups.md#entity-size) (moltiplicata per la scala delle unità al caricamento). L'unico modo per impostarla. |

### Esempio {#example}

Un'esportazione inventata di uno sparatutto: asse Z in alto, centimetri, un mondo sinistrorso, giocatori larghi circa 72 cm.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Come scriverlo {#writing-it}

Con pyarrow, i metadati di schema personalizzati vengono scritti nei metadati chiave/valore del file:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` stampa lo schema di un file, un modo rapido per controllare i nomi delle colonne a cui
si riferiscono i suggerimenti.

## Cosa scrive la scheda Mappa di calore {#what-the-heatmap-tab-writes}

Nulla viene riscritto nei dati. Le uscite sono:

- video, in WebM (VP9 o VP8) - [Percorso della camera e video](camera-path-and-video.md);
- una posa della camera, copiata negli appunti come testo - [Camera](camera.md#pose);
- livelli salvati nella [libreria dei livelli](level-library.md) del browser.
