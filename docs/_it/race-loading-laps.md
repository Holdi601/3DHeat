---
title: "Caricamento dei giri"
parent: "Analisi di gara"
nav_order: 51
lang: "it"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Caricamento dei giri

Un file di giro è la registrazione di una guida: dove era l'auto e cosa ha fatto il
pilota, molte volte al secondo. Carica due o più giri dello stesso percorso e la
scheda **Analisi di gara** può confrontarli.

![La sezione Giri della scheda Analisi di gara con tre giri demo caricati: elenco dei giri, stella del riferimento, focus](../assets/img/en/race-loading-laps-list.webp)

## I primi giri {#your-first-laps}

1. Apri la scheda **Analisi di gara**.
2. Solo per dare un'occhiata? Premi **Giri demo** (vedi [Giri demo](#demo-laps)).
3. I tuoi giri: registrali nel gioco con un registratore (vedi [Formati dei file](#file-formats)). Il registratore scrive un file per ogni giro.
4. Premi **Carica giri…** e scegli due o più file dello stesso percorso, oppure premi **Cartella…** e scegli la cartella che li contiene. Puoi anche trascinare file o cartelle sulla vista 3D.
5. Clicca un giro nell'elenco per vedere dove perde tempo.

**Attenzione: i giri si confrontano un percorso alla volta.** Caricare un giro di un altro percorso con nome cancella i giri già caricati.

## I pulsanti {#the-buttons}

| Comando | Fa |
|---|---|
| **Carica giri…** | un selettore di file per `.json`, `.csv`, `.txt`, `.ibt`, `.gz` e `.h3dcars`, più file insieme (`.h3dcars` è un file delle auto, vedi [Auto](race-replay-and-scene.md#the-cars)) |
| **Cartella…** | un selettore di cartelle: ogni file di giro nella cartella e in quelle sotto di essa |
| **Giri demo** | tre giri inventati di un circuito inventato (vedi [Giri demo](#demo-laps)) |
| **Svuota** | rimuove ogni giro (mostrato quando ci sono giri caricati) |
| trascinare sulla vista | file e intere cartelle trascinati sulla vista 3D si caricano allo stesso modo |

I giri vengono **aggiunti** a quelli già caricati - **tranne quando sono di un altro
percorso con nome: allora i giri caricati vengono prima cancellati** (i giri si
confrontano un percorso alla volta). I file che non si possono leggere sono elencati
sotto i pulsanti, una riga ciascuno; gli altri vengono caricati lo stesso.

## Formati dei file {#file-formats}

Il formato si riconosce dal contenuto, non dal nome del file. In parole semplici:

- **heat3d-lap** è il file che il registratore di 3DHeat scrive per la maggior parte dei giochi.
- **FH Companion** è uno strumento gratuito che registra i giri di Forza Horizon. Scrive un file di giro e, accanto, un file `.json.tele.gz` (lo stesso giro con i dati di ogni pneumatico, compressi con gzip). Scegli entrambi insieme.
- **iRacing `.ibt`** è il file di telemetria di iRacing; attiva la registrazione nell'auto con Alt+L e carica il file così com'è.
- Un **CSV di giro** è una tabella semplice, una riga per ogni istante.

| Formato | Fonte tipica | Letto da |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon e Motorsport tramite Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| JSON di giro FH Companion | la libreria di giri di FH Companion | `fromFhCompanion` |
| Telemetria FH Companion `.json.tele.gz` | accanto a ogni file di giro FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | i file di telemetria di iRacing (registrazione attivata con Alt+L nell'auto) | `readIbt` |
| CSV di giro | `heat3d_capture laps`, il plugin di Trackmania, o qualunque CSV con `x`, `z`, una colonna del tempo e facoltativamente una colonna `lap` | `fromCsv` |

Come viene registrato ogni gioco e cosa invia è descritto dai registratori:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
e [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Vedi anche [Altri giochi di corsa](other-games.md).

## Cartelle e percorsi {#folders-and-courses}

**Cartella…**, o una cartella trascinata, porta con sé ogni file sotto di essa. Dentro
una cartella vengono considerati solo i file che finiscono con `.json`, `.csv`, `.txt`,
`.ibt` o `.tele.gz`, e un `.json` che non è un giro (il file di un percorso, la sua
mappa) viene saltato senza errore.

**Più percorsi in una sola scelta.** La libreria di giri di FH Companion tiene ogni
percorso in una cartella chiamata `<nome del percorso> (course_<x>_<z>_to_<x>_<z>)` (o
un semplice `course_...` per un percorso senza nome). Quando i file scelti stanno in più
di una di queste cartelle di percorso, non si carica nulla; invece la sezione **Giri**
dice "Questi sono giri di N percorsi, e i giri si confrontano un percorso alla volta.
Scegline uno:" ed elenca ogni percorso con il numero dei suoi giri, dal più ricco. Cliccando
un percorso si caricano i file di quel percorso.

Un percorso è identificato dal suo **nome** e dal suo punto di **partenza**, non da
quello di arrivo: le corse non finite vengono tenute da FH Companion sotto lo stesso nome
e partenza (in `unfinished/`) con il punto in cui si sono fermate come arrivo, e vanno con
il loro percorso - segnate **parziale** nell'elenco.

**Più tracciati tra i file scelti.** Quando i file scelti direttamente (non dalle cartelle
dei percorsi) sono giri di più di un tracciato con nome, la scelta viene offerta per ogni
tracciato; i giri che non indicano un tracciato vanno con quello scelto.

## Nomi delle auto {#car-names}

Un giro è chiamato con il nome intero dell'auto, come lo dà il gioco. Quando il file del
giro non indica l'auto:

1. **La cartella.** La libreria di FH Companion conserva i giri in
   `<percorso>/<classe>/<nome auto> '<yy> (car<numero>)/<messa a punto>/<etichetta>/<giro>.json`.
   La cartella più interna che corrisponde a `<nome> (car<numero>)` dà il nome e il numero;
   una che corrisponde a `car<numero>` dà solo il numero. Questo percorso c'è solo nelle
   cartelle scelte e nelle cartelle trascinate.
2. **Un altro giro della stessa auto.** Appena un giro indica un'auto, ogni giro con lo stesso
   gioco e numero di auto prende quel nome - i giri caricati insieme, e quelli caricati più
   tardi in questo browser: i nomi si conservano in `localStorage` sotto `heat3d.carNames`
   (con chiave `<gioco>:<numero auto>`). In una finestra privata durano quanto i giri.
3. Altrimenti "auto 1234" con il suo numero, o "auto".

**Etichette.** Nell'elenco dei giri un giro mostra il nome dell'auto; più giri della stessa
auto sono numerati "Nome #1", "Nome #2". Le frasi dell'analisi usano le stesse etichette
quando sono uniche; altrimenti il nome dell'auto con il tempo sul giro, "Nome (1:29.616)"
(tempi d'esempio), numerato di più se ancora non è unico.

**Raggruppamento.** I giri appartengono alla stessa auto (per inviluppi, profili e
confronti) quando il loro numero di auto - o il nome, se non c'è un numero - e il loro
indice di prestazione sono gli stessi (`carKey`): lo stesso modello con una messa a punto
diversa è un'auto diversa.

**Classi.** La classe di prestazione di un giro è quella del gioco (Forza D..X, il nome
breve della classe di iRacing); le statistiche le ordinano D, C, B, A, S1, S2, R, X, poi le
altre in ordine alfabetico.

## Giri demo {#demo-laps}

**Giri demo** carica tre giri di un circuito inventato (quattro rettilinei e quattro curve
a destra), fatti da un semplice modello di veicolo
([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)):
la velocità limitata dall'aderenza di ogni curva, un passaggio di accelerazione in avanti e
uno di frenata all'indietro, come fa un simulatore di giri.

| Giro | Auto | Errori |
|---|---|---|
| pulito | Auto con grip | nessuno |
| con errori | Auto con grip | frena 35 m presto in T2, riprende il gas 30 m tardi in uscita da T3, prende T4 a 0,88 della sua velocità, va 1,2 m da un lato |
| altra auto | Auto di potenza | nessuno; va 1,2 m dall'altro lato |

| Auto (numero) | Grip | Frenata | Trazione | Potenza/massa | Resistenza |
|---|---|---|---|---|---|
| Auto con grip (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Auto di potenza (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Il giro con gli errori è quello in focus. Il circuito è disposto come Forza tiene il suo mondo
(sinistrorso), quindi - esattamente come con un vero giro di Forza - esce specchiato, e la
scheda offre **Inverti X**. Tutti e tre i giri portano dati per ogni ruota, così ogni parte
della scheda ha qualcosa da mostrare.

## L'elenco dei giri {#the-lap-list}

Ogni riga, da sinistra a destra:

| Elemento | Fa |
|---|---|
| ● / ○ | mostra / nasconde il giro (linee, auto, scheda, grafici); i giri nascosti sono comunque analizzati |
| tratto colorato | il colore del giro |
| nome ed etichette | clicca per **mettere a fuoco** il giro; passando sopra, il file di origine e l'auto (nome · classe PI · trazione) |
| ⌖ | fa seguire questa auto dalla camera (clicca di nuovo per fermare) |
| ★ | confronta tutto con questo giro (lo rende il riferimento); disattivato sul riferimento |
| × | rimuove il giro |

**Etichette:** *riferimento*; *il migliore di X* (o *il migliore della sua classe*) sul giro più
veloce di una classe quando ci sono più classi; *parziale* su una corsa che non ha raggiunto
l'arrivo.

**La seconda riga:** la classe (solo con più classi), il tempo sul giro (`1:29.616`), il distacco
dal giro con cui viene confrontato (il migliore della sua classe, o il riferimento) come
`+0,512` (esempio), e *parte in ritardo* quando il giro inizia più di 10 m dopo la partenza del
riferimento.

Con più di 8 giri compare una riga "N di M disegnati" con **Mostra tutti** (disegna ogni giro:
più lento, e un groviglio) e **Solo quelli in esame** (il riferimento, il giro in focus e il
migliore della sua classe; le statistiche contano ogni giro in ogni caso).

Sotto l'elenco: il suggerimento sullo specchio quando i giri dicono che il disegno è specchiato
(vedi [mondi specchiati](race-replay-and-scene.md#mirrored-worlds)), e con due o più giri il
suggerimento "Clicca un giro per vedere dove perde tempo …", più, con più classi, che ogni giro
si confronta con il più veloce della propria classe.

### Riferimento e focus {#reference-and-focus}

- **Riferimento:** il giro a cui sono allineati tutti gli altri e, per impostazione predefinita,
  con cui si confrontano. È il giro più veloce **completo**, a meno che l'utente non scelga
  un altro con ★ (il primo giro caricato quando nessuno è completo). Rimuovere il giro di
  riferimento torna alla scelta automatica.
- **Focus:** il giro di cui si mostrano risultati, controllo dell'auto e mappe. Resta dove
  l'utente l'ha messo; altrimenti è il giro **più lento** che non è il riferimento ("quello da cui
  imparare di più"). Mettere a fuoco un giro lo rende anche visibile, insieme al miglior giro della
  sua classe. Mettere a fuoco il riferimento lo confronta con l'altro giro più veloce in ogni
  curva.
- **Classi:** con giri di più classi di prestazione, ogni giro si confronta con il giro completo più
  veloce della propria classe (il riferimento, nella classe del riferimento). Vedi
  [Statistiche del percorso](race-course-statistics.md).

### Colori {#colours}

Ogni giro ha il proprio colore, secondo la sua posizione nell'ordine di caricamento, così un giro
mantiene il colore anche quando altri sono nascosti. Le tonalità sono distribuite sulla ruota dei
colori come la modalità team della mappa termica distribuisce i gruppi; per ogni posto, la
luminosità (da 0,52 a 0,66 in OKLCH) e la saturazione (da 0,12 a 0,18) sono scelte per essere il
più possibile lontane dai posti vicini (e l'ultimo dal primo) con la vista normale, protanopica e
deuteranopica, ciascuna almeno 3:1 rispetto allo sfondo scuro del grafico.

## Per sviluppatori {#for-developers}

Codice: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Come viene letto ogni formato {#how-each-format-is-read}

Ogni formato finisce in un unico `LapTrace`: canali con nomi canonici (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., vedi la [tabella dei canali](race-charts-and-hud.md#the-channel-table)), l'auto, il tempo sul giro, se è un giro completo, e un blocco `meta`. Per ogni formato, `time` e `distance` sono spostati per partire da 0, e dove una fonte non ha `speed`, la velocità viene calcolata come distanza diviso tempo dai campioni vicini.

#### JSON heat3d-lap {#heat3d-lap-json}

Un oggetto JSON con `"format": "heat3d-lap"`. Campi letti:

| Campo | Uso |
|---|---|
| `channels` | un oggetto di array, uno per canale, con nome canonico; i canali per ruota come `nome.FL`, `nome.FR`, `nome.RL`, `nome.RR`. `time`, `x` e `z` sono obbligatori |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | l'auto: id, nome, indice di classe di Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indice di prestazione, codice della trazione (0 anteriore, 1 posteriore, 2 integrale) |
| `lap.seconds` | il tempo sul giro; l'ultimo valore di `time` se manca |
| `lap.complete` | `false` segna una corsa parziale; qualunque altro valore è completo |
| `game`, `track` | nomi; `game` decide la disciplina (vedi sotto) |
| `units.slipRatio` / `units.slipAngle` | come viene scalato lo slittamento: un'unità che contiene `raw` vuol dire `scaled`, `normalised` vuol dire `peak`, qualunque altra `physical` |
| `meta` | `slip`, `surface`, `discipline` se indicati sostituiscono quanto sopra |

Senza un canale `distance`, la distanza viene sommata dalle posizioni 3D.

#### File di giro FH Companion {#fh-companion-lap-files}

Un oggetto JSON con un oggetto `Lap` che contiene un array `samples` (un campione circa ogni 5 m).
Campi mappati:

| FH Companion | Canale |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (spostato perché il giro parta da 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | gli stessi, in minuscolo |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², nonostante il nome) |
| `Puddle` | `puddle` |

L'auto viene da `Lap.carOrdinal`, `Lap.carName` (solo nei file più recenti), `Class` (o
`Lap.carClass` come indice di classe di Forza), `Lap.performanceIndex`, `Lap.drivetrain` e
`Lap.peakKilowatts`; il tempo da `Lap.lapSeconds`; una corsa con `EndedAtFinish: false` è
parziale. Il gioco è `forza-horizon`.

Questi file non portano dati degli pneumatici né la direzione, quindi bloccaggi, pattinamenti e
scivolate non si possono giudicare da soli; spinte (dallo sterzo contro il percorso) e urti e
incidenti sì. Prendi anche il `.tele.gz` accanto a ciascuno per il resto.

#### Telemetria FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON compresso con gzip `{ version, columns, data }`: tutto il Data Out di Forza per un giro, una
riga per pacchetto, con i nomi di campo del gioco. Le colonne si cercano per nome, mai per posizione.
Il formato 2 conserva ogni pacchetto (circa 110 al secondo contro i 64 tick del gioco); una riga
identica a quella precedente in tutto tranne l'orologio del registratore (`t`, `metres`) viene
scartata, così un giro si legge alla velocità del gioco, 64 righe al secondo. (Il suggerimento del
pulsante di caricamento lo dice: "per lo slittamento di ogni pneumatico a 64 Hz".)

| Campo Data Out | Canale |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (sistema dell'auto: x a destra, y in alto, z in avanti) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, portati da 0..255 a 0..1 |
| `Steer` | `steer`, portato da -127..127 a -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, convertito da Fahrenheit a °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` per ruota |

`<Wheel>` è `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Lo slittamento è segnato `peak` (lo slittamento normalizzato di Forza: oltre
1 lo pneumatico ha perso aderenza).

**Abbinamento.** Un file di giro `<giro>.json` e `<giro>.json.tele.gz` scelti o trascinati insieme
(stesso percorso ma con `.tele.gz`) diventano **un solo** giro: i canali della telemetria, con
l'auto, la classe, il tempo, il tracciato e il flag di parzialità del file di giro. Il nome dell'auto
del file di telemetria prevale quando ce l'ha. Un `.tele.gz` da solo si carica lo stesso: i file in
formato 2 portano `car` (`ordinal`, `name`, `class`, `pi`), `track` e `lapSeconds`; senza di questi il
tempo sul giro è la durata della telemetria e l'auto è sconosciuta.

#### iRacing `.ibt` {#iracing-ibt}

Il file di telemetria di iRacing viene letto direttamente (nel browser, senza conversione): l'intestazione
di 112 byte, la sotto-intestazione del disco di 32 byte, la tabella delle variabili (144 byte per canale)
e lo YAML della sessione.

- **Canali richiesti:** `SessionTime`, `Lap`, `Lat`, `Lon`. Senza di essi: "… non ha i canali
  SessionTime, Lap, Lat e Lon - è un file di telemetria di iRacing?"
- **Posizioni:** latitudine e longitudine sono disposte in metri su un piano tangente al primo punto
  non nullo (raggio della Terra 6 371 008,8 m): x a est, z a sud, y l'altitudine (`Alt`) - quindi con la
  camera predefinita il nord sta in alto nello schermo. Non è il sistema del tracciato: un modello
  estratto del percorso non si allineerebbe.
- **Giri:** la sessione viene divisa dove cambia `Lap`; un giro si tiene quando ha più di 60 campioni,
  parte sotto il 5% di `LapDistPct` e finisce sopra il 95%. I giri parziali vengono scartati. Se non ne
  resta nessuno: "… non ha un giro completo del tracciato di N km" (lunghezza del tracciato dallo YAML)
  o "… non ha un giro completo".
- **Distanza:** `LapDist` dall'inizio del giro, altrimenti sommata dalle posizioni.
- **Auto:** da `DriverInfo`: `CarScreenName` del giocatore, `CarID` (come numero dell'auto) e
  `CarClassShortName` (come classe). Tracciato: `TrackDisplayName`, altrimenti `TrackName`.

Canali mappati:

| iRacing | Canale | Conversione |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | stessi nomi | - |
| `Clutch` | `clutch` | `1 - v` (iRacing conta l'innesto; il nostro è il pedale) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianti in senso antiorario, da -1 a 1, destra positiva; massimo almeno 0,1, π se manca) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | stessi, in minuscolo | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | diviso per 100 quando supera 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura del centro della carcassa |
| `LFshockDefl` ... | `suspensionM.FL` ... | deflessione dell'ammortizzatore, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa in psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefissi delle ruote: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Ogni altro** canale con un
valore per campione (non di tipo a bit) passa con il proprio nome - per ruota quando inizia con un
prefisso di ruota (`RRspeed` diventa `speed.RR`) - così i grafici e gli elenchi valori delle schede
offrono tutti. iRacing non registra lo slittamento delle gomme: il controllo dell'auto si giudica dall'angolo
di deriva - `Yaw`, riferito alla direzione di marcia, contro dove va l'auto - e dallo sterzo contro il
percorso. L'imbardata contro l'accelerazione laterale si usa solo quando la direzione non si può adattare,
quindi non c'è angolo di deriva (vedi [Eventi di controllo dell'auto](race-control-events.md)).

Errori: "… è troppo corto per essere un file .ibt", "… non ha un'intestazione di telemetria iRacing",
"… non ha rilevamenti di posizione".

#### CSV di giro {#lap-csv}

Una riga per campione; più giri in un file si distinguono da una colonna `lap`. Il separatore viene
riconosciuto dalle prime cinque righe. Una prima riga facoltativa `# { ...json... }` descrive la corsa:
`game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Colonna (non sensibile alle maiuscole) | Canale |
|---|---|
| `x`, `y`, `z` | posizione (`x` e `z` obbligatori) |
| `elapsed` o `time` | `time` (obbligatorio per giro) |
| `metres` o `distance` | `distance` (altrimenti sommata dalle posizioni) |
| `speed_ms` o `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | stessi |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| qualunque nome canonico di canale, per esempio `latVel`, `slipIndex.FL` | se stesso |
| `lap` | a quale giro appartiene una riga |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | tempo sul giro, numero dell'auto, classe, PI, tracciato (dalla prima riga di ogni giro) |

Senza descrizione, il gioco è preso come `forza-horizon` e ogni giro come completo. La fonte di un
giro è mostrata come `<file> · <giro>` quando il file ne contiene più di uno. Errori: "… non ha
righe", "… non ha colonne x e z", "… non ha giri con una colonna del tempo".

#### Disciplina e fondo {#discipline-and-surface}

Cosa presume l'analisi su un giro, quando il giro non lo dice (`lap.ts`):

- **Disciplina:** `meta.discipline`, altrimenti un nome di gioco che corrisponde a
  `rally|wrc|dirt|rbr` è **rally**, `trackmania` è **arcade**, qualunque altro **circuito**.
- **Fondo:** `meta.surface`, altrimenti dal nome del tracciato e dalla fonte: una gara rally con
  nome `monte` è **misto**; `snow|ice|winter|arctic|sweden` **neve**; le gare rally su asfalto
  (Spagna/España/Catalunya/Costa Daurada, Croazia/Hrvatska, Europa centrale, Germania/Deutschland,
  Giappone, Corsica/Corse, Ypres, o le parole tarmac/asphalt) **asfalto**; qualunque nome con
  `scramble|trail|cross country|dirt|gravel` **smosso**; un'altra tappa rally si giudica da come
  l'auto è stata guidata: sui campioni più veloci di 12 m/s e a terra (almeno 200), un 95° percentile di
  accelerazione laterale di 10 m/s² o più insieme a un angolo di deriva mediano sotto 6° (preso dove
  l'auto curvava al 70% di quel valore o più, almeno 30 campioni) è asfalto; tutto il resto, o troppo
  poco per dirlo, è smosso. Un nome non rally con `rally` dentro è smosso; tutto il resto è asfalto.
- Per campione, un canale `loose` (la vibrazione del fondo di Forza, i materiali di Trackmania, vedi
  [Eventi di controllo dell'auto](race-control-events.md#the-ground)) sostituisce il fondo del giro.
