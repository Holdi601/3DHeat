---
title: "I convertitori conservano tutto"
parent: "Caricare i dati"
nav_order: 8
lang: "it"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# I convertitori conservano tutto

Non ti serve questa pagina per aprire un replay. È per chi scrive strumenti che trasformano i file di gioco in tabelle di 3DHeat, e per chi vuole sapere perché quelle tabelle contengono così tanto.

Ogni strumento che trasforma il replay, la demo, il log o la telemetria in tempo reale di un gioco in qualcosa che il visualizzatore apre segue una regola:

> **Converti tutto ciò che la fonte contiene e che si può leggere adesso, e conserva il resto intero, così può essere letto più tardi senza il file originale.**

Un replay spesso va perso dopo un aggiornamento del gioco, una reinstallazione o un disco pieno, e un flusso in tempo reale è perso nel momento in cui viene inviato. Ciò che un convertitore scarta è perso per sempre; ciò che conserva intero può essere decodificato il giorno in cui qualcuno lo capisce. Quindi un convertitore non decide mai che cosa sarà utile: decodifica ciò che può, conserva ogni altro messaggio, pacchetto, evento, proprietà o riga invariato accanto alla tabella, e dice nel proprio output quanto di ciascuno ha letto e quanto ha solo conservato.

Questa pagina è la convenzione che tutti i convertitori condividono: i convertitori dei replay di War Thunder, World of Tanks, World of Warships e Squad, il convertitore delle demo di CS2, il watcher in background (il suo decodificatore dei replay di Dota e ogni adattatore in tempo reale), i lettori di telemetria dello strumento di cattura di gioco e le importazioni proprie del visualizzatore (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). I lettori propri del visualizzatore sono descritti in [Registrazioni Tacview](tacview-acmi.md) e [Caricare i file](loading-files.md); la forma a un solo file è [Una partita in un file](container.md). Una partita diventa una tabella, un `match.json` e dei sidecar, facoltativamente impacchettati in un solo file `.3dheat`. La sezione **Completezza** del README di ogni strumento elenca, per quella fonte, cosa viene letto, cosa viene conservato grezzo e cosa non è disponibile, e perché.

## Tre posti per ogni elemento {#three-homes-for-every-item}

Tutto ciò che una fonte contiene finisce in esattamente uno di tre posti:

| Posto | Cosa ci va |
|---|---|
| **Decodificato** | La tabella (una riga per campione o evento, le colonne che legge il visualizzatore, colonne extra per ogni altro valore che appartiene a una riga) e il documento della partita `<match>.match.json` (tutto ciò che appartiene alla partita nel suo insieme: impostazioni, rose, risultati, tabelloni, l’autocontrollo). |
| **Conservato grezzo** | Un sidecar accanto alla tabella: ogni elemento non decodificato, o decodificato solo in parte, intero e invariato, con il suo tipo, il suo tempo e l’unità o entità a cui appartiene. |
| **Non disponibile** | Nominato nella sezione Completezza del README con il motivo: il formato non lo contiene (un replay lato client non ha gli input degli altri giocatori), la fonte non lo invia mai, oppure non è permesso leggerlo (un processo protetto, un blocco cifrato la cui chiave non è nostra da usare). |

Un elemento **in parte** decodificato è decodificato *e* conservato grezzo: la tabella riceve ciò che si capisce, il sidecar l’elemento intero, così un decodificatore migliore in futuro non ha bisogno del file originale.

Non esiste un quarto posto. Scartare qualcosa perché sembrava inutile, perché era un duplicato «probabilmente», o perché era grande, è un errore. Ridurre è permesso solo nella tabella (una telecamera a 2 Hz invece che a 60), mai nel sidecar.

## Sidecar {#sidecars}

Un sidecar è un file Parquet accanto alla tabella, con lo stesso nome:

```
<cartella>/<partita>.parquet              la tabella
<cartella>/<partita>.match.json           il documento della partita
<cartella>/<partita>.<cosa>.parquet       un sidecar
```

`<cosa>` è una parola di questo elenco. Un nuovo convertitore sceglie la parola che si adatta, oppure ne aggiunge una qui **e** in `SIDECAR_PARQUET` in [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), così il visualizzatore la esclude quando viene caricata un’intera cartella.

| `<cosa>` | Contiene | Usata da |
|---|---|---|
| `messages` | pacchetti, chiamate di metodi di entità e aggiornamenti di proprietà di un flusso di rete, interi | War Thunder, World of Tanks, World of Warships |
| `flight` | voci del modello di volo per aereo, intere | War Thunder |
| `packets` | frame e messaggi di rete interi, o blocchi del contenitore, fuori dal flusso delle entità | CS2, Dota 2, Squad |
| `events` | eventi di gioco con tutte le loro chiavi, come li dà il parser | CS2 |
| `entities` | aggiornamenti di entità e proprietà, chiamate remote, canali aperti e chiusi, con le esportazioni che un decodificatore richiede | Squad, Dota 2 |
| `props` | ogni proprietà di entità che il parser legge, ogni volta che cambia | CS2 |
| `units` | stato per unità fuori dalla tabella delle posizioni | Dota 2 |
| `combatlog` | un log di combattimento, ogni voce con ogni campo | Dota 2 |
| `strings` | ogni voce di ogni tabella di stringhe | CS2, Dota 2 |
| `objectives` | zone di cattura e obiettivi, ogni cambiamento con il suo tempo | War Thunder |
| `raw` | un flusso in tempo reale: ogni pacchetto, riga, documento di API o lettura di memoria ricevuto, intero | le sessioni del watcher (`heat.raw.parquet`), i registratori di giro dello strumento di cattura di gioco (`<timbro>_<gioco>.raw.parquet`), i file di replay di osu!, LoL e Valorant del watcher |

Il caricamento della cartella del visualizzatore salta ogni `*.<cosa>.parquet` di questo elenco, e ogni `*.match.json`, `*.meta.json`, `*.summary.json` e gli altri sidecar JSON; aprirne uno da solo, scegliendo o trascinando solo quel file, lo carica come una qualsiasi tabella (vedi [Caricare i file](loading-files.md)).

Questi sono i file come li scrive un convertitore con `--loose`. Per impostazione predefinita i convertitori di War Thunder, CS2 e Tacview impacchettano la tabella, il documento e i sidecar di una partita in un solo file, `<partita>.3dheat`, con gli stessi nomi (vedi [Una partita in un file](container.md)); tutto qui vale per ogni membro.

### Colonne {#columns}

Ogni riga di un sidecar è un elemento. Le colonne sono, in questo ordine, quelle che si applicano:

| Colonna | Tipo | Cosa |
|---|---|---|
| `time` | float64 | secondi sullo stesso orologio del `time` della tabella (o `tick` dove la fonte conta i tick; allora entrambi) |
| `type` | stringa (dizionario) | cos’è l’elemento, nei termini della fonte: un tipo di pacchetto, un id di messaggio, un nome di evento, un percorso di proprietà, un prefisso di riga |
| `name` | stringa (dizionario) | il suo nome dove è noto (un nome della comunità, un nome di classe), altrimenti vuoto |
| `entity` / `unit` / `uid` / `player` | intero o stringa | a chi appartiene, con gli stessi id della tabella, così una riga del sidecar si può unire a una traccia |
| `decoded` | stringa (JSON) | ciò che si capisce di esso, dove si capisce qualcosa; altrimenti vuoto |
| `payload` | binario | i byte dell’elemento, interi e invariati (fonti binarie) |
| `text` | stringa | il testo dell’elemento, intero e invariato (fonti di testo: una riga di log, un oggetto JSON, un blocco chiave-valore) |

Sono consentite altre colonne (un offset in bit, una dimensione, un canale). Le stringhe che si ripetono sono codificate a dizionario e il file è scritto con zstd, quindi un sidecar resta una frazione della dimensione del replay stesso.

Un sidecar deve bastare da solo: un decodificatore scritto più tardi legge il sidecar, mai il replay originale. Quando un elemento non si può capire senza contesto (la classe di un’entità, una tabella di stringhe, una chiave a cui si riferisce un messaggio), il contesto va nel sidecar, o nel documento della partita.

### Fonti in tempo reale {#live-sources}

Gli adattatori in tempo reale (telemetria UDP, memoria condivisa, il log di un gioco, un’API locale) non hanno affatto un file a cui tornare. Registrano **ogni campo che la fonte invia**, anche quelli che nulla usa ancora:

- un flusso di pacchetti: ogni pacchetto intero, `payload` i byte, `type` il suo id di pacchetto o formato, alla velocità con cui arriva;
- memoria condivisa o un’API interrogata: ogni campo di ogni lettura, o come colonne con nome o l’intero blocco come `payload`, alla velocità con cui l’adattatore legge;
- un log: ogni riga, `text` la riga, `type` il tipo di riga, incluse le righe su cui l’adattatore non agisce.

Questi vanno in `<sessione>.raw.parquet` accanto alla tabella della sessione. La dimensione è il prezzo della regola; si contiene con zstd e la codifica a dizionario, non lasciando fuori nulla.

## L’autocontrollo {#the-self-check}

Ogni convertitore scrive, nel proprio documento della partita (o nel `meta.json` della sessione, o in un riepilogo dove non c’è un documento della partita), un blocco `completeness` sotto `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Campo | Significato |
|---|---|
| `seen` | quanti elementi di questo tipo contiene la fonte |
| `decoded` | letti interi nella tabella o nel documento della partita |
| `partial` | letti in parte nella tabella o nel documento, e conservati interi in un sidecar |
| `raw` | conservati interi solo in un sidecar, non decodificati |
| `lost` | `seen - decoded - partial - raw`: deve essere 0 |

Il `lost` di primo livello è la somma. I test di un convertitore verificano che sia 0 sui propri campioni sintetici, e il README dice quanto era su quelli reali. Un `lost` diverso da zero è il convertitore che dice di aver violato la regola; ne nomina il tipo, così la lacuna si può trovare.

I «types» sono quelli della fonte: tipi di pacchetto, id di messaggio, nomi di evento, gruppi di proprietà, tipi di riga. Vengono contati dove il convertitore li incontra, non da un elenco di ciò che si aspetta, così un tipo che nessuno conosceva compare con il suo conteggio invece di sparire.

### La sezione Completezza del README {#the-readmes-completeness-section}

Il README di ogni convertitore ha una sezione intitolata **Completezza**, con tre elenchi:

- **Letto**: cosa va nella tabella e nel documento della partita, e come ogni nuovo campo è stato verificato con qualcosa di indipendente (i numeri del gioco stesso, una seconda fonte, una registrazione fatta apposta).
- **Conservato grezzo**: cosa c’è in quale sidecar, sotto quale `type`, e cosa si sa finora.
- **Non disponibile**: ciò che la fonte non contiene o non si può leggere, e perché.

Rimanda a questa pagina.

## A che punto è ogni convertitore {#where-each-converter-stands}

| Convertitore | Sidecar | La sua sezione Completezza |
|---|---|---|
| Replay di War Thunder | `messages`, `flight` | [README di 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (i conteggi del suo autocontrollo sono sotto `counts`; il blocco `completeness` arriverà) |
| Replay di World of Tanks | `messages` | [README di 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Replay di World of Warships | `messages` | [README di 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demo dei server di Squad | `entities`, `packets` | [README di 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demo di CS2 | `events`, `props`, `strings`, `packets` | [README di 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Replay di Dota 2 (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Replay di Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Replay di osu!, LoL, Valorant (watcher) | `raw` | le loro pagine nella [documentazione del watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adattatori in tempo reale (watcher) | `raw` | la pagina di ogni gioco nella [documentazione del watcher](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), e [sviluppo](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) per `Session.raw` |
| Registratori di giro (strumento di cattura di gioco) | `raw`, e byte `unparsed` dentro un file di giro di Forza | [README di 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Le importazioni proprie del visualizzatore | nessuno: vedi sotto | questa pagina |

### Le importazioni proprie del visualizzatore {#the-viewers-own-imports}

Tacview ACMI, OCAP e i formati GPS sono letti nel browser dal file proprio dell’utente; il visualizzatore non conserva nulla di essi, quindi il file stesso resta la registrazione. Leggono comunque tutto ciò che possono:

- **Tacview ACMI** (`src/data/acmi.ts`): ogni riga di oggetto con una posizione è una riga con ogni proprietà che la registrazione contiene, ogni evento è una riga, ogni rimozione è una riga, le proprietà proprie della registrazione (con FileType e FileVersion dell’intestazione) su ogni riga come `RecordingInfo`; una riga di commento è un evento `Comment`, un oggetto che non riceve mai una posizione una riga `Unplaced` nel punto di riferimento, e U/V sono colonne ogni volta che una riga le ha. Una riga di proprietà senza posizione è letta in parte: i suoi valori arrivano alla riga successiva dell’oggetto, non al proprio tempo. `AcmiTable.completeness` conta le righe del file per tipo.
- **OCAP** (`src/data/ocap.ts`): i frame di ogni entità, i colpi, i marcatori, ogni tipo di evento (i tipi sconosciuti come righe di «Mission» con il loro testo) e i campi propri del documento (`Info`). Non ancora letti: i campi delle entità e gli elementi di posizione finali diversi da quelli elencati nella sua intestazione (le aggiunte di un registratore più recente), e i frame ripetuti di un’unità morta dopo la sua morte (ridotti di proposito: in essi non cambia nulla).
- **Formati GPS** (`src/data/geoTracks.ts`): i fix, il loro tempo, altitudine, rotta e velocità, e frequenza cardiaca, cadenza, potenza, temperatura, satelliti, HDOP e altitudine di pressione dove il file le registra. Non ancora letti: altre estensioni GPX e KML, frasi NMEA diverse da quelle di posizione, record IGC diversi dai fix e dalle loro estensioni, e messaggi FIT diversi dai record (giri, sessioni, informazioni sul dispositivo).

Queste lacune sono elencate perché vengano chiuse, non per giustificarle; le esportazioni del visualizzatore di una registrazione caricata (`src/data/exportRecording.ts`) scrivono solo ciò che è stato letto.

## Aggiungere un convertitore {#adding-a-converter}

1. Elenca ciò che il formato contiene, dalla sua documentazione, dalle sue strutture o contando ogni tipo di messaggio in campioni reali. L’elenco sono i `types` dell’autocontrollo.
2. Decodifica ciò che si può verificare adesso. Ogni nuovo campo è verificato con qualcosa di indipendente prima di entrare nella tabella; un campo che non si può ancora verificare resta grezzo.
3. Conserva il resto intero in un sidecar chiamato come sopra, con le colonne sopra.
4. Scrivi il blocco `completeness` e un test che verifichi che `lost` sia 0.
5. Scrivi la sezione Completezza del README e rimanda a questa pagina.
6. Se il `<cosa>` del sidecar è nuovo, aggiungilo alla tabella sopra e a `SIDECAR_PARQUET` in `src/data/filePick.ts`.

I convertitori sono a stanza pulita: sono scritti a partire dai formati, dalla documentazione e dai campioni, mai da codice GPL o AGPL. I campioni di replay reali restano sulla macchina che li ha prodotti; i test usano file sintetici.
