---
title: "Un file per partita (.3dheat)"
parent: "Caricare i dati"
nav_order: 9
lang: "it"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Un file per partita: `.3dheat`

Un file `.3dheat` è un'intera partita in un solo file, da copiare, conservare o condividere. Per aprirlo, basta trascinare il file nel pannello Sorgente.

```
match.3dheat   (un file ZIP)
  manifest      cos'è la partita, e l'elenco di tutto quello che contiene
  table         le posizioni (Parquet)
  match.json    il documento della partita
  sidecars      quello che il convertitore ha conservato intero (eventi, messaggi, ...)
```

Una partita convertita era prima più file affiancati: la tabella
`<match>.parquet`, il documento della partita `<match>.match.json` e i sidecar
`<match>.<cosa>.parquet` ([I convertitori conservano tutto](converters.md)). Un
file `.3dheat` contiene tutti questi in uno: un replay, un file, da copiare,
conservare o condividere.

È costruito in modo che caricarne mille sia veloce quanto caricare le tabelle
sciolte, e in modo che i convertitori futuri possano metterci molto di più senza
un nuovo formato.

## Caricarne uno {#loading-one}

Dovunque si carica un file o una cartella, si carica anche un file `.3dheat`, e
una cartella può mescolare contenitori e file sciolti:

| Dove | Cosa viene letto dal contenitore |
|---|---|
| Pannello Sorgente della **Mappa di calore** (file, cartella, trascinamento) | le sue tabelle, come se fossero il `<match>.parquet` sciolto |
| **Mappa di calore → Molte partite insieme** (File, Cartella, Aggiungi cartella) | le sue tabelle, lette sul posto dai worker del caricatore |
| Scheda **Partita** (Carica, o trascina sulla vista) | il documento della partita |
| Telemetria della **Lavagna tattica** | le sue tabelle |

Aprire un contenitore legge due piccole parti: la sua directory alla fine e il suo
manifest all'inizio; di una tabella non si legge nulla finché il caricatore non la
legge. I sidecar e il documento della partita vengono letti solo quando qualcosa li
chiede. Una cartella che contiene la stessa partita due volte, sciolta e
impacchettata, la carica una volta sola.

## Impacchettare e spacchettare {#packing-and-unpacking}

Le nuove conversioni scrivono contenitori per impostazione predefinita: il
convertitore di War Thunder (`heat3d-wt-replay`), il convertitore CS2 (`heat3d_cs2
demos`) e lo strumento Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` mantiene
i file separati.

Le partite convertite prima, o da altri strumenti, si impacchettano con:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** trova ogni tabella `<match>.parquet` nelle cartelle con i file che le
  appartengono e scrive `<match>.3dheat` accanto a loro. Una partita già
  impacchettata viene saltata. Ogni contenitore viene riletto per intero (sha256,
  dimensione, CRC e footer Parquet di ogni membro) prima di qualunque altra cosa; i
  file sciolti vengono cancellati solo con `--delete-loose`, e per una partita
  impacchettata prima solo quando sono identici, byte per byte, a quello che il
  contenitore contiene. Una partita con un file cambiato negli ultimi `--settle`
  minuti (di default 10) viene lasciata stare: un convertitore potrebbe starlo
  ancora scrivendo.
- **unpack** riscrive i membri come file sciolti accanto al contenitore.
- **update** aggiunge o sostituisce membri senza riscrivere le tabelle già nel
  contenitore (sotto).
- **repack** riscrive un contenitore per intero, eliminando quello che gli
  aggiornamenti hanno lasciato indietro.

## Il formato {#the-format}

Un file `.3dheat` è un archivio ZIP (qualunque strumento ZIP lo apre), con queste regole:

1. **`manifest.json` è il primo membro** quando un contenitore viene scritto, ed è
   sempre presente. Si trova tramite la directory centrale dello ZIP, quindi dopo un
   `update` può stare più avanti nel file.
2. **I membri letti per intervallo di byte o già compressi sono memorizzati** (metodo
   ZIP 0): Parquet, Arrow, immagini, modelli, audio, video, blob opachi. Un membro
   memorizzato è un unico intervallo continuo di byte del contenitore, quindi un
   lettore legge il footer di una tabella e i suoi blocchi di colonne sul posto, con
   `File.slice` in un browser o con una richiesta HTTP di intervallo, esattamente come
   leggerebbe il file sciolto.
3. **Il testo è compresso** (metodo 8): JSON, CSV, testo semplice. Sono piccoli e si
   leggono per intero.
4. I nomi sono UTF-8 (bit 11 del flag), relativi, separati da `/`, senza `..`; possono
   contenere cartelle (`analysis/heat.json`). Un file sciolto impacchettato mantiene il
   suo nome, quindi lo spacchettamento restituisce gli stessi file.
5. I membri più grandi di 4 GiB, o contenitori con più di 65.535 membri, usano ZIP64
   come di consueto. Chi scrive non mette data descriptor dopo i membri.

I membri che i convertitori scrivono oggi, in quest'ordine:

| Ruolo | Membro | Memorizzato |
|---|---|---|
| `table` | `<match>.parquet` | sì |
| `match` | `<match>.match.json` | no (compresso) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | sì |
| `summary` | `<match>.summary.json`, il riepilogo dell'indice di massa ([Analisi di massa](mass-analysis.md)), aggiunto da `tools/3dheat-summarize.mjs` | no (compresso) |

La tabella viene subito dopo il manifest, così la prima lettura del lettore all'inizio
del file copre insieme il manifest e l'intestazione locale della tabella.

### Il manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Campo | Significato |
|---|---|
| `format` | sempre `3dheat` |
| `format_version` | `major.minor` (sotto) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | cos'è la partita e cosa l'ha creata; `null` dove non si sa |
| `created`, `updated` | quando è stato scritto, quando è stato aggiornato l'ultima volta (`updated` compare solo dopo un aggiornamento) |
| `roles` | ogni ruolo con il nome del suo primo membro: un indice rapido |
| `members` | ogni membro tranne il manifest: l'elenco completo, quello di cui un lettore si fida |
| `matches` | facoltativo: le partite di un contenitore che ne contiene più d'una (sotto) |
| `references` | facoltativo: file che il contenitore richiede ma non contiene |
| `extensions` | facoltativo: i metadati propri di un convertitore |

Ogni membro:

| Campo | Significato |
|---|---|
| `name` | il suo percorso nel contenitore |
| `role` | a cosa serve (sotto) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` oppure `deflate` |
| `bytes` | la sua dimensione, non compressa |
| `sha256` | dei suoi byte, non compressi |
| `rows` | il numero di righe di una tabella |
| `schema` | la convenzione che segue, `{ "id", "version" }`: il `format` e la `version` propri di un documento (`heat3d-wt-replay-match` 2), `heat3d-table` per una tabella che il visualizzatore legge dal suo footer `heat3d`, `heat3d-acmi-table` per quella dello strumento Tacview |
| `match` | in un contenitore di più partite, il `matches[].id` a cui appartiene |

### Fatto per crescere {#made-to-grow}

Il formato è pensato per contenere replay molto più ricchi di quelli di oggi senza
rompere quello che li legge già:

- **Versioni.** `format_version` è `major.minor`. Un lettore legge ogni versione
  minore della sua major e ignora ogni campo che non conosce. La minore sale quando
  si aggiunge qualcosa; la major solo quando il layout cambia così che un lettore più
  vecchio lo leggerebbe in modo sbagliato (un membro non più memorizzato, il manifest
  spostato fuori dall'archivio). La convenzione di ogni membro è versionata a parte,
  nel suo `schema`, quindi un nuovo layout di tabella o una nuova versione di
  documento non richiede una nuova versione del contenitore. I primi contenitori
  scritti dicevano invece `"version": 1`; i lettori lo prendono come 1.0.
- **I ruoli sono aperti.** Un ruolo è una stringa qualunque. I lettori usano i ruoli
  che conoscono e tengono gli altri: un ruolo sconosciuto viene elencato, mai
  rifiutato, e `update` e `repack` lo portano avanti intatto. Un ruolo può avere molti
  membri: più tabelle (tracce per unità, telemetria a altre frequenze), eventi, voce,
  sincronizzazione video, riferimenti ai livelli, sostituzioni di figure, risultati di
  analisi. I nomi possono contenere cartelle.
- **Qualunque supporto.** Un membro può essere qualsiasi cosa con un tipo di supporto:
  Parquet, JSON, Arrow, miniature PNG o JPEG, modelli glTF, audio, blob grezzi.
- **Più partite.** Una sessione o un torneo può stare in un contenitore: `matches`
  le elenca (`{ "id", "map", "mode", "started", ... }`) e ogni membro indica la sua
  `match`. Il visualizzatore carica ogni membro con ruolo `table`.
- **Riferimenti.** I file che un contenitore richiede ma non contiene, come un livello,
  sono elencati in `references` per nome e sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), così il file giusto viene
  trovato e verificato senza copiarlo in ogni partita.
- **Estensioni.** `extensions` contiene i metadati propri di un convertitore sotto la
  sua chiave, `"<vendor>/<name>": { ... }`, così due convertitori non si scontrano mai
  e non serve aggiungere nulla ai campi condivisi.
- **Aggiornamento sul posto.** `update` aggiunge o sostituisce membri senza riscrivere
  le grandi tabelle memorizzate: i nuovi membri e un nuovo manifest vengono aggiunti
  dopo la fine del contenitore, seguiti da una nuova directory centrale. Ciò che è
  stato sostituito resta come byte non referenziati fino a `repack`. Ogni membro e ogni
  campo del manifest, noti o no, vengono mantenuti. Un aggiornamento che fallisce
  riporta il contenitore com'era.

I test del visualizzatore lo verificano: un contenitore in formato 1.7 con un ruolo
sconosciuto, un campo di membro, un'estensione e un membro audio, in una cartella, si
carica e sopravvive a un aggiornamento e a un repack con tutto intatto; un contenitore
di major 2 viene rifiutato.

## Chi scrive {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (scrittura, lettura, verifica, aggiornamento, repack), usato dallo strumento di
  impacchettamento e dallo strumento Tacview.
- Python: `container.py`, circa 140 righe sullo `zipfile` standard, lo stesso file in
  ogni convertitore (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), così nessun convertitore dipende da un altro. Un nuovo
  convertitore ne copia uno.
- Il visualizzatore legge con
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
