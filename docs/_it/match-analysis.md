---
title: "Analisi della partita (CS2)"
nav_order: 10
lang: "it"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---


# Analisi della partita (CS2)

La scheda **Partita** riproduce una registrazione come figure e, per una partita di Counter-Strike 2, mostra anche il tabellone: chi ha vinto ogni round, come, e chi ha fatto le uccisioni. Usala per rivedere una partita round per round, poi salta allo stesso momento nella mappa di calore.

La scheda Partita riproduce qualsiasi registrazione come figure: una registrazione di War Thunder o Tacview, o una demo di CS2, elencata sotto **Partite nel replay** ([Replay della partita](match-replay.md)). Un file CS2 `.match.json` aggiunge il tabellone descritto in questa pagina.

## Rivedere una partita di CS2 {#review-a-cs2-match}

1. Converti la demo ([sotto](#where-the-data-comes-from)) in un file `.parquet` e in un file `.match.json`.
2. Nella scheda **Mappa di calore**, carica il file `.parquet` sotto **Sorgente**.
3. Apri la scheda **Partita** e clicca su **Carica file partita…**, oppure trascina il file `.match.json` sulla vista.
4. Clicca una partita in **Riepiloghi partita**, poi una cella della striscia dei round per aprire quel round.
5. Clicca su **Mostra round** per vedere quel round nella mappa di calore, oppure su **Replay del round** per guardarlo come figure.

![La scheda Partita: striscia dei round con un round aperto, feed delle uccisioni e tabellone](../assets/img/en/match-analysis-round.webp)

Termini come KAST, ADR, eco, force buy e trade sono nel [glossario](glossary.md#counter-strike-words).

## Da dove vengono i dati {#where-the-data-comes-from}

Il convertitore di demo di [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
trasforma le demo in due file per partita, in una cartella per mappa:

```bash
python -m heat3d_cs2 demos <file demo o cartelle> -o out
```

| File | Caricato in | Contiene |
|---|---|---|
| `<partita>.parquet` | la scheda **Mappa di calore** (pannello Sorgente, come ogni Parquet - un file, più file, o l’intera cartella) | la posizione di ogni giocatore otto volte al secondo, e ogni evento dove è successo: uccisione, morte, danno, colpo, lancio, fumogeno, flash, HE, molotov, esca, accecamento, piazzamento, disinnesco, esplosione; con `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, direzione dello sguardo, `weapon`, `place`, `opening`, `traded` … |
| `<partita>.match.json` | la scheda **Partita** | squadre, punteggio, ogni round (vincitore, come, economia, il piazzamento, ogni uccisione in ordine, clutch, superstiti), la riga del tabellone di ogni giocatore |

Il piè di pagina del file Parquet porta le istruzioni di lettura (chiave `heat3d`), quindi si apre senza impostare nulla: il giocatore come persona, il lato come gruppo, ogni round (`roundId`, «<partita> #NN») come sessione, la direzione dello sguardo attiva, e il mondo nel verso giusto (il mondo di CS2 è destrorso con Z in alto; letto con la mappatura predefinita con Z in alto, risulterebbe specchiato). Vedi [Mappatura delle colonne](column-mapping.md) e [Caricare i file](loading-files.md).
`python -m heat3d_cs2 map <mappa>` esporta la geometria della mappa nello stesso sistema, caricata in **Livello**.

Le convenzioni dietro i numeri sono quelle del convertitore (dichiarate nel suo
README e riportate in ogni riepilogo): un morto è **tradato** quando chi lo ha ucciso viene ucciso da un compagno della vittima entro **5 s**; **KAST** è la quota dei round con un’uccisione, un assist (un assist di flash conta), la sopravvivenza o una morte tradata; il **danno** è la salute effettivamente persa, solo dei nemici; un **clutch** è essere l’ultimo in vita di un lato con nemici in piedi, vinto quando il lato vince; il **buy** di ogni lato dal valore medio dell’equipaggiamento alla fine del freeze time – il primo round di ciascun tempo regolamentare è un round di pistola (nessuno nei supplementari), poi sotto 1.500 $ un eco, sotto 4.000 $ un force buy, oltre un buy pieno.

## La scheda {#the-tab}

La barra laterale della scheda Partita contiene in alto il selettore di modalità della mappa di calore e il selettore di sessione, poi le sezioni della partita, e sotto i pannelli **Filtri**, **Livello** e **Telecamera** della mappa di calore – la vista è la mappa di calore di qualunque Parquet sia caricato nella scheda Mappa di calore.

### Riepiloghi partita {#match-summaries}

| Controllo | Fa |
|---|---|
| **Carica file partita…** | sceglie file `.json` (più di uno alla volta): i riepiloghi `.match.json` |
| trascina sulla vista | i file JSON trascinati sulla vista mentre la scheda Partita è aperta si caricano allo stesso modo (gli altri file sono ignorati) |
| **Svuota** | rimuove ogni partita |
| **Tutte le partite** (con due o più) | «N partite, M round»: le statistiche di tutte insieme |
| una riga partita | «TeamA 13 vs TeamB 9», mappa · N round: apre quella partita |

Un file è accettato quando è JSON con `"format": "heat3d-cs2-match"` e gli array `rounds`, `players` e `teams`. Gli errori sono elencati sotto i pulsanti: «<file>: non è JSON», «<file>: non è un riepilogo di partita CS2 (heat3d-cs2-match)», «<file>: mancano rounds, players o teams». Una partita caricata di nuovo (stesso nome `match`) sostituisce quella precedente. Le partite sono ordinate per mappa, poi per nome. Con una sola partita caricata viene aperta; altrimenti la selezione resta (per impostazione predefinita tutte le partite).

Con niente caricato la sezione lo spiega: converti con `python -m heat3d_cs2 demos`, carica qui i file `.match.json` e nella scheda Mappa di calore i file `.parquet`.

### Partita (una partita aperta) {#match-one-match-open}

**L’intestazione:** entrambe le squadre con il loro punteggio, la mappa, i tempi – «tempi 7-5, 6-6»: round 1-12 e 13-24 (il gioco premier e competitivo è MR12; la durata del tempo propria del riepilogo quando la dichiara, quindi 1-15 e 16-30 per MR15) – poi, quando la partita è andata ai supplementari, il suo punteggio da solo: «supplementari 4-2», i round dopo i due tempi. Un round pareggiato non conta per nessuna squadra. E «N round tagliati nella demo» quando il riepilogo elenca round incompleti.

**La striscia dei round:** una cella per round, colorata secondo il lato che ha vinto, con il suo numero e un segno per come è finito. Un round pareggiato (senza vincitore) è una cella grigia neutra marcata `=`, mai del colore di un lato; il suo suggerimento dice «Round 30: pareggio – nessuno dei due lati l’ha vinto».

| Segno | Finito per |
|---|---|
| B | bomba esplosa |
| D | bomba disinnescata |
| K | eliminati |
| T | tempo scaduto |
| S | resa |
| = | pareggio |
| ? | altro |

Una linea divisoria segna l’inizio del secondo tempo (round 13, o il round dopo la durata del tempo del riepilogo) e di ogni tempo di supplementari da tre round (round 25, 28, 31, …). Passa sopra una cella: «Round 7: TeamA (T) – bomba esplosa, piazzata A» («…, piazzata, sito sconosciuto» quando il riepilogo non ha il sito) e il buy e il valore dell’equipaggiamento di entrambi i lati. Clicca per aprire il round; clicca di nuovo per chiuderlo («Clicca un round per le sue uccisioni, l’economia e il replay.»).

**Il round:**

- «Round 7: <squadra> ha vinto – <come>» («Round 30: pareggio – nessuno dei due lati l’ha vinto» per un pareggio) e quanto è durato il round (dalla fine del freeze alla decisione, m:ss);
- l’economia: la squadra di ciascun lato, il buy (pistol, eco, force, piene) e il valore dell’equipaggiamento («$4.350»);
- il piazzamento: sito, giocatore e tempo dall’inizio del round (da entrambe le versioni del riepilogo); «Piazzata da <giocatore> alle 1:05, sito sconosciuto» quando il sito non è noto;
- **il feed delle uccisioni**, in ordine: tempo dall’inizio del round, attaccante (nel colore del lato; «world» per nessun attaccante), arma, e i contrassegni – **HS** colpo alla testa, **WB** attraverso un muro, **SM** attraverso il fumo; **open** la prima uccisione del round, **trade** (vendicato un compagno entro 5 s), **traded** (chi ha ucciso è stato ucciso entro 5 s), **team** un’uccisione tra compagni (un suicidio non ne ha). Le uccisioni dopo che il round è stato deciso sono attenuate;
- i clutch: «<giocatore> (T) da solo contro 3: ha vinto il clutch» / «l’ha perso»;
- chi era in vita alla fine, per lato («nessuno»);
- **Mostra round**: tutto ciò che c’è in questo round, nella mappa di calore;
- **Replay del round**: riproduce il round come scatole, dal suo inizio (sotto).

I pulsanti **Mostra nella mappa di calore** (vedi [sotto](#show-in-the-heatmap)) per questa partita, o per il round aperto.

### Tabellone {#scoreboard}

Una tabella per squadra, una riga per giocatore:

| Colonna | È |
|---|---|
| K, D | uccisioni, morti |
| A | assist, assist di flash inclusi |
| ± | uccisioni meno morti (verde sopra 0, rosso sotto) |
| ADR | danno per round, salute effettivamente persa |
| KAST | % dei round con un’uccisione, un assist, una sopravvivenza o una morte tradata |
| HS | % di uccisioni alla testa |
| Open | duelli d’apertura vinti-persi |
| Cl | clutch vinti/giocati |

Passa sopra un giocatore: uccisioni di trade, volte tradato, assist di flash, nemici accecati, danno da utility, e round con più uccisioni («2×3k»). **Clicca un giocatore** per le sue uccisioni e morti nella mappa di calore (questa partita).

### Tra le partite (Tutte le partite) {#across-matches-all-matches}

Su ogni partita caricata:

- «N partite · M round · <mappe>», e «N round pareggiati, vinti da nessun lato» quando ci sono pareggi;
- **Round vinti** per lato: in totale, sui round di **pistol** (i round di pistola del riepilogo), e sui buy **eco**, **force** e **piene** (ciascuno come percentuale con i round giocati; passa sopra per «vinti su giocati»). Un round pareggiato è giocato da entrambi i lati e non è vinto da nessuno;
- **Bomba**: piazzamenti per sito, e quante volte il lato T è poi riuscito a vincere quei round («12 piazzamenti su A (T ha vinto il 67%)»), piazzamenti di cui il riepilogo non conosce il sito da soli («2 piazzamenti su un sito sconosciuto (T ha vinto il 50%)»), oppure «mai piazzata»; come sono finiti i round, dal più comune;
- «Il lato che ha fatto la prima uccisione d’apertura ha vinto l’N% di quei round.» (un suicidio non è un’uccisione d’apertura; un round pareggiato non converte nessuna apertura);
- **Duelli d’apertura, dove**: i dieci posti con più uccisioni d’apertura (per dove si trovava la vittima; i nomi dei posti del gioco resi leggibili, «TopofMid» → «Top of Mid»), duelli e la quota vinta dal lato T;
- **Giocatori**: i quindici migliori per uccisioni meno morti, sommati su tutte le loro partite (abbinati per Steam ID): partite, K-D, ADR e KAST ponderati sui round giocati, HS% ponderato sulle uccisioni, duelli d’apertura. **Clicca un giocatore** per le sue uccisioni e morti su tutte le partite nella mappa di calore.

I pulsanti Mostra nella mappa di calore per tutte le partite caricate stanno sotto.

## Mostra nella mappa di calore {#show-in-the-heatmap}

Ogni collegamento imposta i **filtri** propri della mappa di calore, così ciò che si mostra resta visibile e modificabile nel pannello Filtri, e **Mostra tutti** li cancella. Lavorano sulla tabella della mappa di calore caricata nella scheda Mappa di calore; la scheda Partita non la carica mai da sola.

| Pulsante | Eventi mostrati |
|---|---|
| **Posizioni** | `position` - dove si trovavano i giocatori, otto volte al secondo |
| **Uccisioni** | `kill` - dove si trovava chi ha ucciso |
| **Morti** | `death` - dove è caduta la vittima |
| **Opening** | `kill` e `death` con `opening` = 1 - la prima uccisione di ogni round, dove si trovavano entrambi (offerto solo quando la tabella ha una colonna `opening`) |
| **Smoke** | `smoke` - dove sono atterrati i fumogeni |
| **Flash** | `flash` - dove sono scoppiati i flash |
| **Molotov** | `molotov` - dove hanno bruciato molotov e incendiari |
| **HE** | `he` - dove sono esplose le granate HE |
| **Plant** | `plant` - dove è stata piazzata la bomba |
| **Colpi** | `shot` - da dove sono stati sparati i colpi |

Limitato dal punto in cui sono i pulsanti: tutte le partite caricate, questa partita, o questo round («Mostra nella mappa di calore – round 7»).

Ciò che non si può applicare è detto sotto i pulsanti, non filtrato in silenzio fino a non mostrare nulla: «nessuna colonna della partita conservata – partita non applicata», «partita: X non presente nei dati caricati», lo stesso per round ed eventi, «giocatore X non presente nei dati caricati», «lato X non presente nei dati caricati», «nessun dato della mappa di calore caricato: carica i file .parquet delle partite nella scheda Mappa di calore». Senza dati caricati i collegamenti dicono anche «Carica i file .parquet delle partite nella scheda Mappa di calore per vederli sulla mappa».

**Replay del round** in più passa la mappa di calore a **Replay a scatole**, la linea del tempo alla modalità *riproduci* con la sua finestra impostata su *durata*, va all’inizio della sessione del round e riproduce. Quando il round non è una sessione dei dati caricati: «questo round non è una sessione dei dati caricati: niente da riprodurre».

## Per gli sviluppatori {#for-developers}

Codice: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versioni dei riepiloghi {#summary-versions}

La scheda legge i riepiloghi della versione 1 e della versione 2 (`"version"` nel file) uno accanto all’altro, e li tratta allo stesso modo:

| | Versione 2 | Versione 1 |
|---|---|---|
| tempo del piazzamento | secondi dall’inizio del round, come le uccisioni | secondi di partita; la scheda sottrae l’inizio del round |
| sito del piazzamento | `A` o `B`; vuoto quando la demo non lo dice | `A`, `B`, o un numero di entità – letto come sito sconosciuto |
| durata del tempo | `halfLength`, da dove i lati si scambiano per la prima volta; 12 quando è null | 12 (MR12) |
| round di pistola | `pistolRounds` (il round 1 e il primo round dopo il tempo) | i round il cui buy è `pistol` |
| round pareggiato | `winner` e `winnerTeam` vuoti | - |
| suicidio | `suicide` sull’uccisione, mai un’uccisione tra compagni | riconosciuto da attaccante e vittima che sono lo stesso giocatore |

`noscope` e `attackerBlind` di un’uccisione (versione 2) non sono mostrati nella scheda Partita, che non mostra nemmeno alcun posto dalla tabella della mappa di calore, quindi la colonna `place` vuota di una riga di granata non cambia nulla qui.

Come un focus diventa filtri (`focusFilters`):

- **match** → un filtro di categoria sulla colonna `match`;
- **round** → un filtro di intervallo `round` = N su una colonna numerica `round` (un filtro di categoria su una colonna categorica), e la sessione del round (`<partita> #NN`) viene selezionata nel selettore di sessione;
- **events** → un filtro di categoria sulla colonna `event`;
- **player** → un filtro di persona su quel giocatore;
- **side** → un filtro di gruppo.
