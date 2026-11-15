---
title: "Registrazioni Tacview (ACMI)"
parent: "Caricare i dati"
nav_order: 7
lang: "it"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Registrazioni Tacview (ACMI)

Tacview è un programma che registra i voli nei simulatori di volo; i suoi file finiscono in `.acmi`. 3DHeat li apre così puoi vedere dove ha volato ogni aereo.

Le registrazioni di volo di Tacview si caricano come qualsiasi tabella: scegli o trascina un `.acmi` (testo, `.txt.acmi`, oppure compresso, `.zip.acmi`) e premi **Carica**. Ottieni allora il calore di tutti i voli, e nella scheda **Partita** un replay con figure, tracce e un elenco di eventi ([Replay della partita](match-replay.md)). ACMI è il formato pubblico di file di Tacview ([documentazione](https://www.tacview.net/documentation/acmi/)); DCS (tramite l'esportatore di Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS e altri lo scrivono, quindi questo legge qualsiasi di essi.

## Che cosa diventa una registrazione {#what-a-recording-becomes}

Una riga ogni volta che viene scritta la posizione di un oggetto, una riga per ogni evento nel punto dell'oggetto, e una riga quando un oggetto esce (`Removed`, dove si trovava per ultimo). Un evento riguardante un oggetto non ancora visto - un segnalibro, un messaggio a tutti - è una riga dell'oggetto `(recording)` nel punto di riferimento. La registrazione porta con sé le proprie istruzioni di lettura, quindi il passo di mappatura si compila da solo. Il lettore scrive queste colonne: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, poi ogni altra proprietà che la registrazione ha. Il loro ruolo:

| Colonna | Ruolo | Significato |
|---|---|---|
| Time | tempo | Secondi dopo il ReferenceTime della registrazione; secondi Unix quando ne ha uno, così l'orologio mostra l'ora reale. |
| X, Y | posizione | Est e nord, in metri, su un piano che tocca la terra nel punto di riferimento della registrazione: distanze e rilevamenti sono veri nelle sue vicinanze, con una deriva inferiore a una parte su mille a 100 km. Il nord diventa il -Z del mondo. |
| Altitude | posizione (in alto) | Metri. |
| Object | persona | Il pilota e il nome dell'oggetto con il suo id, per esempio `Viper 1 (F-16C_50) #a01`; un oggetto senza pilota `(T-90A) #401`. |
| Coalition | squadra | Il lato (o il colore, quando non c'è una coalizione). |
| Heading, Pitch | sguardo | Gradi; il rilevamento 0 è il nord. |
| Recording | sessione | Il Title della registrazione, o il nome del file: più registrazioni si caricano affiancate senza che le loro tracce si uniscano. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtri | Conservate per il filtraggio; Type e Name scelgono la [figura](figures.md) di ogni oggetto, Event alimenta l'elenco degli eventi della revisione, Roll inclina l'aereo. |
| U, V | | I metri piani del mondo del gioco, quando ogni campione li ha (DCS li scrive). |
| EventObjects | filtri | Ogni oggetto che un evento nomina (`Message|a01|b02|...`), per id. |
| RecordingInfo | | Le proprietà della registrazione così come erano in quel momento - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - in JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtri | Ogni altra proprietà numerica che la registrazione porta con sé. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtri | Ogni altra proprietà di testo che la registrazione porta con sé; una proprietà con un valore che non è un numero è testo. |

Vengono letti tutti e quattro i modi della posizione di Tacview (`lon|lat|alt`, con `u|v`, con `roll|pitch|yaw`, e con tutti questi più una direzione), i campi vuoti mantengono l'ultimo valore; `-id` rimuove un oggetto, e un id riusato dopo è un oggetto nuovo. Le virgole con escape e le righe continuate sono gestite.

Le posizioni sono sempre proiettate da latitudine e longitudine, mai prese da U/V, così le registrazioni di ogni gioco condividono una sola proiezione con uno sfondo del mondo reale.

## Server DCS: chi ha vinto e come è finita ogni sortita {#dcs-servers-who-won-and-how-each-sortie-ended}

Un server multigiocatore di DCS registra le sue missioni con Tacview giorno e notte, e un server PvP persistente porta avanti una campagna su molte di esse: uno schieramento vince conquistando ogni aeroporto, FARP e zona dell'altro, il che richiede giorni e molti riavvii della missione. Le registrazioni contengono i voli, non la campagna: nessun messaggio dice chi ha preso cosa, gli aeroporti vengono scritti una volta all'inizio, e nessuno dice chi ha vinto. Il convertitore Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) aggiunge a ogni riga ciò che si può sapere e lascia vuoto ciò che non si può - non tira mai a indovinare.

| Colonna | Significato |
|---|---|
| `server` | il server o la campagna, dall'intestazione della registrazione (il suo Title, Author e Comments nominano i server pubblici noti - Blue Flag, SPS Contention, Growling Sidewinder; altrimenti un Author che nomina qualcuno); `--server Name` lo nomina per un'intera cartella. Una registrazione la cui intestazione non nomina alcun server - un Author come `Admin`, un Title e dei Comments che nessun server noto scrive - resta non attribuita: `server` vuoto, anche se è stata scaricata dalla pagina delle registrazioni di un server, perché quella pagina può contenere anche missioni di altre comunità |
| `mission` | il Title della registrazione senza la versione e il mese di campagna: `Operation_Example_V7.7.99` diventa `Operation Example` |
| `campaign` | il round di campagna a cui appartiene la registrazione, per server, mappa e numero: `Example Server North 3`. Una registrazione è una sessione (da riavvio a riavvio); un round dura molte sessioni, giorni o settimane |
| `round` | il numero di quel round: quello del server se ne pubblica uno, altrimenti l'n-esimo round visto di quel server e di quella mappa; da un file dei round (sotto), vuoto senza |
| `session` | il posto della registrazione tra le sessioni del round, 1, 2, ...; `sessionStart` il suo vero inizio (secondi Unix) |
| `heldRed`, `heldBlue` | i luoghi contesi che ogni schieramento teneva all'inizio della sessione, da un file dei round concatenato (sotto) |
| `won`, `matchWon` | 1 quando lo schieramento della riga (il suo Color, Red o Blue) ha vinto quella campagna, 0 quando l'ha persa; vuoto dove nessun file dei round nomina un vincitore, e sulle righe neutrali. Una campagna è insieme il round e la partita, quindi entrambi contengono lo stesso valore |
| `roundEndReason` | `capture` per una campagna vinta conquistando tutto |
| `won`, `matchWon` su ogni sessione di un round | il risultato del round, scritto su ogni sua registrazione appena se ne conosce la fine |
| `sortie` | sulle righe di un aereo: il suo volo, 1, 2, ... da decollo a decollo; il tempo a terra prima del primo decollo e dopo un atterraggio conta per il volo a cui appartiene |
| `sortieResult` | come è finito quel volo: `landed`, `landed damaged` (dopo un colpo in volo), `ejected`, `shot down`, `destroyed` (a terra), `crashed`, `despawned` (sparito in volo senza una causa visibile - un giocatore che esce), `airborne at end`, `no takeoff` |
| `sortieKills` | gli abbattimenti attribuiti all'aereo in quel volo |

In un server persistente la sortita è l'unità che conta: filtra su `sortieResult` = `shot down` per vedere dove sono stati persi dei voli, oppure suddividi il calore per `sortieResult` o per `server` nel [dettaglio](breakdown.md). I decolli, gli atterraggi, le eiezioni, gli abbattimenti e gli schianti di cui è fatta sono gli eventi che il convertitore ricava da come si muovono gli aerei (sopra).

I luoghi presi tra due sessioni di un round - noti dal file dei round, sotto - sono eventi `capture` all'inizio della registrazione successiva: `Object` `(campaign)`, nel luogo, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Un aeroporto o un FARP che cambia schieramento dove la registrazione lo mostra - scritto di nuovo nell'altro colore, oppure rimosso e scritto di nuovo al suo posto nell'altro entro cinque minuti - diventa un evento `capture` sulla piazzola: `Event` = `capture`, `Airfield` il suo nome, `Detail` `Red to Blue`, `Coalition` il suo nuovo schieramento. Una piazzola scritta per la prima volta in un colore non è una conquista. I server esaminati finora scrivono le loro piazzole una sola volta, quindi le loro registrazioni non contengono conquiste.

### File dei round {#rounds-files}

Un file dei round indica, per ogni server, i suoi round di campagna, chi li ha vinti e le sessioni di ciascuno. Viene da ciò che il server pubblica, oppure dalle registrazioni stesse (sotto).

Chi ha vinto una campagna lo pubblica il server - un registro delle campagne sulla sua pagina web -, non sta nella registrazione. Un file dei round lo riporta, e il convertitore lo legge con `--rounds file.json` (se ne può indicare più di uno):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Una registrazione appartiene ai round del suo `server` il cui `title` (un'espressione regolare) corrisponde al suo Title; ogni riga appartiene al round in cui cade la sua ora reale - il RecordingTime della registrazione più i secondi della riga, non la data della missione nel gioco. Gli orari sono in UTC. Un round senza vincitore (ruotato, ancora in corso) dà alle sue righe il numero del round e un risultato vuoto.

L'equivalente nel documento della partita, il piè di pagina `acmi`, dice da dove viene il risultato, come fa `result.source` per una partita di War Thunder: `outcome.result` è `{ winner, round, endReason, source }`, con `source` uguale alla `source` del file dei round, oppure `null` quando nulla ha nominato un vincitore. `outcome` elenca anche i round della registrazione, le sue conquiste e le sue sortite secondo come sono finite:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Una riga di un pilota `Viper 1 (F-16C_50) #a01` dello schieramento blu in quella campagna si legge allora: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Round ricavati dalle registrazioni stesse {#rounds-from-the-recordings-themselves}

Un server persistente mantiene la sua campagna tra un riavvio e l'altro, e ogni registrazione inizia con le unità di terra e gli oggetti statici di entrambi gli schieramenti dove la campagna li ha lasciati. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` legge i primi minuti di ogni registrazione ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), mette in ordine di tempo le registrazioni di una stessa mappa di ogni server e le concatena:

- **Luoghi**: il terreno in celle di circa 2 km; una cella appartiene a uno schieramento quando tre quarti delle unità presenti all'inizio di una sessione sono sue. I luoghi *contesi* sono quelli visti in mano a entrambi gli schieramenti.
- **Conquiste**: un luogo tenuto dall'altro schieramento all'inizio della sessione successiva - preso tra le missioni, o durante quella precedente.
- **Un nuovo round**: una sessione i cui luoghi differiscono da quelli della precedente in più del 60 % dei casi - lo schieramento iniziale di un nuovo round, non un passo del vecchio. Un round finisce anche quando il server passa a un'altra mappa (le sue sessioni iniziano dopo l'ultima e proseguono).
- **Chi ha vinto**: per un round concluso, lo schieramento che teneva ogni luogo all'inizio della sua ultima sessione (`capture`, fiducia alta), altrimenti lo schieramento che teneva più luoghi contesi (media se ne teneva il doppio dell'altro, altrimenti bassa; bassa quando è finito con un cambio di mappa). Un round aperto non ha vincitore, ma ogni sessione dice quanti luoghi teneva ogni schieramento al suo inizio, quindi si vede chi era in vantaggio.
- Un server le cui sessioni iniziano tutte allo stesso modo non mantiene alcuno stato tra di esse: non viene concatenato.

L'inizio dell'ultima sessione può precedere di ore la fine del round, per questo la fiducia conta. Verificata su un server che pubblica i suoi vincitori, la catena ha trovato ogni nuovo round nella sessione in cui iniziava il round pubblicato, e lo schieramento in vantaggio all'ultimo inizio era il vincitore pubblicato in ciascuno dei 9 round che ha potuto verificare. `--official file.json` mantiene i round pubblicati di un server di questo tipo e vi aggiunge le sessioni della catena; il `validation` del file dice fino a che punto la catena concordava. In una campagna inventata:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Guardare un round di campagna come una serie {#watching-a-campaign-round-as-a-series}

Carica insieme le registrazioni di un round - i file con la stessa `campaign` - e il visualizzatore le riproduce come un'unica serie: sessione dopo sessione nel loro ordine reale, con le ore o i giorni tra due sessioni ridotti a una pausa di un minuto. La linea temporale segna in giallo l'inizio di ogni sessione e le pause come bande scure, e l'orologio dice quale sessione è in riproduzione e la sua data reale (`session 4/12 · 2026-11-02 12:38 UTC`). Il calore, il replay, i filtri e i Rilevamenti funzionano sull'intera serie come su qualsiasi dato caricato. La sezione **Round di campagna** della scheda Partita elenca le sessioni con le loro date, quanti luoghi contesi teneva ogni schieramento a ogni inizio - anche come grafico lungo il round - e quanti ne sono stati presi prima; un clic porta all'inizio di una sessione. Una registrazione caricata da sola dice lì quale round e quale sessione è. Registrazioni di round diversi caricate insieme non sono una serie: ognuna parte da zero, come partite separate. Il caricatore di molte partite (**Molte partite insieme**) riproduce anch'esso un round come serie, in streaming e dimensionato per la GPU, per round di molti gigabyte.

I luoghi che hanno cambiato mano durante il round sono disegnati sulla mappa come zone di conquista, colorate secondo lo schieramento che teneva ciascuno all'inizio della sessione in riproduzione, e cambiano ai confini tra le sessioni; ogni cambio è una conquista nell'elenco degli eventi del replay. Sono ricavati dalle righe caricate - le unità di terra e gli oggetti statici di ogni sessione nei suoi primi minuti, in celle di circa 2 km, come fa la catena -, quindi richiedono il caricatore completo (il caricatore di molte partite tiene troppo poco di ogni riga).

**Caricare l'intero round da una delle sue registrazioni.** In un normale browser il visualizzatore non può aprire file che non hai scelto tu: carica insieme i file del round. Servito dal server locale del visualizzatore (`npm run dev` o `npm run preview`), invece può: aggiungi al file `tools/local-data.json`, ignorato da git, una voce `campaigns` che nomina la cartella dei file dei round e le cartelle delle registrazioni convertite, e la sezione Round di campagna di una singola registrazione offre **Carica l'intero round**, recupera le sessioni del round trovate lì e le carica con il caricatore di molte partite:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Vengono servite solo le registrazioni che un file dei round nomina (`tools/campaign-files.mjs`); una sessione non trovata in quelle cartelle viene contata, non caricata.

Cosa pubblicano i server noti:

| Server | Un round | Come vince uno schieramento | Dove si legge il vincitore |
|---|---|---|---|
| SPS Contention | una campagna su una mappa e un'epoca (giorni), su molti riavvii | ogni aeroporto, FARP e roccaforte conquistati; una campagna finita senza vincitore è stata ruotata | il registro pubblico delle campagne del server (vincitore, inizio, fine di ogni campagna) |
| Blue Flag | un round di campagna su molte missioni di 5 ore; il `_YYYY_MM` del Title avanza di un mese a ogni riavvio | ogni posizione nemica conquistata; i round più vecchi indicavano lo schieramento che teneva di più dopo un tempo fisso | non pubblicato in una forma trovata finora; la catena delle registrazioni segue ogni round e chi tiene quanto a ogni inizio |
| Growling Sidewinder | un'esecuzione (6 ore) di una missione a conflitto aperto | zone e aeroporti conquistati | la sua pagina delle statistiche mostra piloti, non risultati; ogni sessione inizia allo stesso modo, quindi nessun round si estende su più sessioni: vuoto |
| Missioni contro l'IA (missioni di conquista delle zone) | un'esecuzione della missione | lo schieramento dei giocatori contro l'IA della missione: nessun risultato PvP | vuoto |
| Non attribuito (l'intestazione non nomina alcun server) | - | - | vuoto, anche `server` vuoto |
