---
title: "Replay della partita"
parent: "Replay"
nav_order: 1
has_children: true
lang: "it"
source: "match-replay.md"
source_hash: "14a8aade5ff0"
translated: true
outdated: false
---

# Replay della partita

Il replay è un film della partita con ogni giocatore disegnato come il mezzo che guidava. Usalo per rivedere uno scontro, seguire un'unità e vedere chi ha colpito chi.

Colpi, impatti, incendi e relitti vengono disegnati sulle unità e sugli obiettivi del livello. Telecamere, etichette e un display tattico aiutano a leggere lo scontro. Conosci Tacview? [Parità con Tacview](tacview-parity.md) mostra dove si trova ciascuno dei suoi strumenti.

![Replay a figure del demo dei carri: carri come proprie figure, con etichette di nome, veicolo e velocità](../assets/img/it/replay-overview.webp)

## Avviare un replay {#start-a-replay}

1. Carica una registrazione con **Sorgente → File…** oppure trascinandola sul pannello Sorgente (una tabella qualsiasi con una colonna **persona** e una colonna **tempo**, un file Tacview, un replay convertito, una partita [`.3dheat`](container.md)). Vedi [Caricare i dati](getting-data-in.md).
2. Apri la scheda **Partita** e scegli **Replay a figure**, oppure scegli **Figure sovrapposte** nella barra delle modalità della scheda Mappa di calore.
3. Sotto **Partite nel replay** scegli una partita, tutte insieme, o più di una.
4. Premi **Riproduci** sulla linea temporale (oppure `K`). Trascina la linea temporale per saltare.

Le figure sostituiscono le scatole per ogni unità di cui si conosce il nome o il tipo (vedi [Figure](figures.md)). I dati senza una colonna di nome o di tipo vengono disegnati come soldati.

![La scheda Partita: il selettore delle partite, la sezione Figure, le viste della telecamera, Riproduci e l'elenco degli eventi](../assets/img/it/match-replay-tab.webp)

## Figure {#figures}

![Un carro in fiamme con la telecamera in orbita, con il colpo che lo ha colpito](../assets/img/it/replay-tanks.webp)

| Impostazione (sezione **Figure**) | Predefinito | Cosa fa |
|---|---|---|
| **Figure invece di cubi** | attivo | Spento disegna scatole semplici. |
| **Dimensione figure** (volte la dimensione reale) | 1 | 1 è la dimensione reale; da 0,25 a 20 volte (scala logaritmica). Un valore più alto aiuta da lontano. |
| **Figura più piccola sullo schermo** | 36 px | Le figure lontane crescono per restare lunghe questi pixel, da 0 a 200 px; 0 mantiene la dimensione reale. |
| **A distanza**: Figura, Freccia, Simbolo | Figura | Cosa diventa un'unità lontana. |
| **Simboli** | NATO (APP-6) | NATO (APP-6), segni tattici russi, icone della **Mappa di gioco**, oppure **Solo forme (adatto ai daltonici)**. |
| **Dimensione simbolo**, **La mia parte**, **Ostile / Neutrale**, **Tacche di rotta** | 28 px (da 12 a 64), automatico, ostile, attivo | Come appaiono i simboli e quale lato è amico. |
| **Linee verticali** | attivo | Una linea da ogni unità dritta fino al suolo, così le altezze si leggono in 3D. |
| **Linee a terra ed etichette sulle armi** | spento | Linee fino al suolo ed etichette su missili e bombe. |
| **Incendi sulle unità** | attivo | Fiamme dal momento in cui un'unità prende fuoco fino a quando viene spenta. |
| **Colpi sulle unità** | attivo | Segni dove i colpi hanno colpito (sotto). **I colpi restano**: da 1 a 300 secondi, oppure **Tutta la vita**. **Indicatori fluttuanti**: segni disegnati sopra la superficie. |
| **Linee di mira e torretta** | spento | Tratteggiate: dove guarda il giocatore; continue: dove punta il cannone. |
| **Edifici** | pieni | Edifici pieni o trasparenti, quando il livello li dipinge. |

### Simboli a distanza {#symbols-at-a-distance}

Quando un'unità sarebbe più piccola di **Figura più piccola sullo schermo**, può diventare un simbolo che resta leggibile. La forma dice il tipo (per esempio una scatola arrotondata con un segno di cingolo per i blindati); il colore dice il lato. Apri il menu **Simboli** per cambiare lo stile.

![Le stesse sei unità come simboli NATO, segni tattici russi, icone della mappa di gioco e sole forme](../assets/img/it/match-replay-symbols-styles.webp)

### Segni dei colpi, relitti e incendi {#hit-marks-wrecks-and-fires}

- I **segni dei colpi** stanno sulla superficie che il colpo ha incontrato, alla scala della figura. Il loro aspetto dice cosa è successo: un foro (passato), uno spruzzo luminoso (non passato), un solco (rimbalzato), una stella di fuliggine (proiettile esplosivo). Un anello colorato dice cosa ha fatto: colpo mortale, modulo distrutto, critico, grave, danno, nessun danno, colpito. Passa sopra un segno per il nome del round.
- Un'unità distrutta viene disegnata **carbonizzata** come relitto dalla sua morte fino a quando non rinasce o non viene rimossa; il suo simbolo è barrato.
- Gli **incendi** bruciano su un'unità dal momento in cui prende fuoco fino a quando viene spenta.
- Le **torrette** girano verso dove i dati dicono che punta il cannone (o, senza quel dato, dove guarda il giocatore).

### Armi, esche e traccianti {#weapons-decoys-and-tracers}

Con **Armi, colpi e centri** attivo (sezione Vista squadre): missili, razzi, bombe e siluri volano come figure proprie con una scia di fumo; proiettili e granate sono traccianti; impatti ed esplosioni lampeggiano. Un tracciante disegnato **tratteggiato** è stato ricavato da un colpo, perché i dati non avevano lo sparo. Bengala e chaff vengono disegnati come esche; sono nascosti dall'elenco delle unità a meno che *Esche e proiettili* non sia selezionato.

## Telecamere {#cameras}

Clicca su un'unità o sulla sua etichetta per **seguirla**; la sezione **Replay** offre **Inseguimento**, **Orbita**, **Cockpit** (con un display a testa alta, `H`), **Fissa**, **Padlock**, **Bersaglio** e **Satellite**. `V` le scorre, **Distanza della telecamera** imposta quanto è lontana. Esc si ferma.

- **Vista a due unità**: scegli un **Bersaglio** (oppure Ctrl/Alt-clic su un'unità) per guardarla dall'unità seguita; **Scambia** le inverte.
- **Misura**: Maiusc-clic su due unità per il rilevamento, la distanza e la differenza di altezza tra di esse.
- **Mappa 2D** (`M`): angolo o vista intera, con scie e nomi.
- **Segnalibri** (`B`): salva il momento e la telecamera; vengono elencate anche le uccisioni, le morti e i segni propri della registrazione.
- **Eventi**: ogni evento in ordine di tempo; un clic ci porta lì. `Pag su` / `Pag giù` saltano tra gli eventi; **Pausa sull’evento** si ferma su ciascuno.

## Display tattico {#tactical-display}

![La scena aerea con l'aspetto del display tattico (T): terreno a fil di ferro, pannelli di uccisioni ed eventi](../assets/img/it/replay-air-tactical.webp)

La sezione **Display tattico** disegna, per nessuna unità, quelle selezionate, tutte, oppure un tipo (velivoli, terra, navi, armi): vettori di velocità e percorso davanti, linee del muso e della portanza, coni radar, aggancio, collegamenti dati, zone e linee di ingaggio, linee di vista, dove guardano i giocatori (coni di vista), la mira della torretta e la telecamera registrata.

### Stile del display {#display-style}

`T` (oppure l'interruttore **Mostra come display tattico**) passa l'aspetto a uno stile da schermo radar: bagliore, contorni, curve di livello, una griglia di misura, linee di scansione, anelli di portata, scale di altitudine, pannelli con uccisioni ed eventi, e un **Regista** che sposta da solo la telecamera verso gli eventi.

![Lo stesso scontro aereo nell'aspetto normale](../assets/img/it/replay-air.webp)

## Obiettivi {#objectives}

Quando una partita arriva con i suoi obiettivi, la sezione **Obiettivi** li disegna sul livello: zone di cattura (con proprietario e avanzamento della cattura), punti di spawn, aeroporti, aree e bersagli di bombardamento, ciascun livello attivabile e disattivabile, con etichette. Si vedono attraverso il terreno. Con più modalità di gioco caricate, **Modalità** filtra le partite per modalità. Gli obiettivi vengono da un file di partita del convertitore accanto alla registrazione o dentro un contenitore [`.3dheat`](container.md).

## Etichette e statistiche {#labels-and-statistics}

- **Etichette**: regole per tipo (**Selezionate**, **Velivoli**, **Terra**, **Navi**, **Armi**, **IA**): mostrate o no, quali valori, e una **Priorità** per chi ottiene lo spazio quando le etichette si sovrappongono. **Tieni separate le etichette** sposta un'etichetta accanto alla sua unità quando coprirebbe un'altra, e la lascia fuori dove non c'è spazio. **Dimensione etichette** va dal 60 al 250%. **Torna a nome, veicolo, altitudine e velocità** ripristina le regole.
  - Le unità terrestri partono con nome, veicolo e velocità.
  - I velivoli partono con nome, veicolo, altitudine e velocità.
  - Le navi partono con nome, veicolo, velocità e rotta.
  - Passa sopra un'unità per vedere ogni valore che ha.
- **Statistiche**: per squadra e unità: uccisioni, morti, colpi, impatti, rapporto di colpi, decolli, atterraggi, tempo in volo, velocità massima, altezza e G, distanza. Esportazione CSV.
- **Grafici**: i valori di un'unità nel tempo, due unità confrontate, oppure un valore contro un altro.

## Molte partite insieme {#many-matches-at-once}

Per sovrapporre centinaia o migliaia di partite, vedi [Molte partite insieme](many-matches.md). Dettagli delle figure (fumo, fuoco, altri effetti a tempo): [Figure nelle figure sovrapposte](figure-replay.md). Elenco delle funzioni Tacview: [Parità con Tacview](tacview-parity.md), pagina figlia di questa.
