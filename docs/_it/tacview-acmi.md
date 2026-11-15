---
title: "Registrazioni Tacview (ACMI)"
parent: "Caricare i dati"
nav_order: 7
lang: "it"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
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
