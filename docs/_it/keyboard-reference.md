---
title: "Riferimento tastiera e mouse"
parent: "Telecamera e controlli"
nav_order: 2
lang: "it"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---

# Riferimento tastiera e mouse

Ogni tasto e ogni azione del mouse in un unico posto, così trovi quello che ti serve. Clicca prima sulla vista, così riceve la tastiera. I tasti vengono ignorati mentre una casella di testo o un menu a tendina ha il fuoco. La versione breve è stampata anche in basso a sinistra nella vista.

Ricerca rapida:

| Voglio ... | Premi |
|---|---|
| volare | `W A S D`, trascina per guardare |
| vedere tutto | `F` |
| riprodurre o mettere in pausa | `K` |
| riprodurre all'indietro | `J` (premi di nuovo per la pausa), in avanti `L` |
| vedere cosa significano i colori | `?` o `F1` |
| annullare nella scheda Tattica | `Ctrl+Z` |

## Telecamera {#camera}

Da [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Input | Effetto |
|---|---|
| `W` / `↑` | Avanti lungo la direzione di vista |
| `S` / `↓` | Indietro |
| `A` / `←` | Scarto a sinistra |
| `D` / `→` | Scarto a destra |
| `Spazio` / `E` | Su |
| `Q` / `Ctrl` sinistro | Giù |
| `Maiusc` (uno qualsiasi) | Tenuto: velocità 6× |
| `Alt` sinistro | Tenuto: velocità 15% |
| Trascinamento sinistro o destro sulla vista | Guarda (puntatore bloccato mentre il tasto è premuto) |
| Rotella (prospettiva) | Velocità di volo ×1,5 per scatto (al massimo 4 scatti per evento della rotella) |
| Rotella (parallela) | Zoom |
| Clic destro | Non apre nessun menu contestuale sulla vista |

## Generale {#global}

Da [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tasto | Effetto |
|---|---|
| `K` | Riproduci / pausa la [linea temporale](timeline.md) |
| `F` | Inquadra i dati |
| `C` | Copia la posizione della telecamera, imbardata e beccheggio ([lettura della telecamera](camera.md#camera-readout)) |
| `G` | Vai a un punto digitato: apre la casella sotto la lettura della telecamera |
| `Esc` | Chiude la scheda del punto scelto; poi smette di guardare la seconda unità; poi smette di seguire un'unità |
| `T` | Attiva o disattiva l'aspetto di visualizzazione tattica ([Replay della partita](match-replay.md#display-style)) |
| `?` / `F1` | Modalità guida: cosa significano i colori ([Impostazioni, unità e tasti](settings.md#help-mode)) |
| `1` | [Calore](heat.md) |
| `2` | [Differenza](difference.md) |
| `3` | [Calore per squadra](team-heat.md) |
| `4` | [Linee](line-heat.md) |
| `]` | Spinge fuori il limite di esclusione lontana ×1,12 (`Maiusc`: ×1,35) |
| `[` | Tira dentro il limite di esclusione lontana ÷1,12 (`Maiusc`: ÷1,35) |
| `\` | Spegne il limite di esclusione lontana / lo riaccende dove era ([Profondità e culling](depth-and-culling.md#keyboard)) |

La modalità **Figure sovrapposte** non ha un tasto numerico; si sceglie nella barra delle modalità o aprendo la scheda Partita. I tasti numerici passano dallo stesso controllo della barra delle modalità: un tasto per una modalità che la barra mostra come non disponibile per i dati caricati non fa nulla.

## Replay della partita {#match-replay}

Nella modalità Figure sovrapposte, che usa la scheda Partita ([Replay della partita](match-replay.md)). Funzionano sia con un'unità seguita sia senza, salvo dove indicato:

| Tasto | Effetto |
|---|---|
| `B` | Aggiunge un segnalibro: il momento e la telecamera |
| `M` | Mappa 2D: angolo, vista intera, spenta |
| `V` / `Maiusc+V` | Vista successiva / precedente della telecamera dell'unità seguita |
| `H` | Display a testa alta nella cabina e nelle viste padlock |
| `Pag giù` / `Pag su` | Evento successivo / precedente dei tipi che mostra l'elenco eventi |
| `J` | Riproduci all'indietro; di nuovo, per la pausa |
| `L` | Riproduci in avanti; di nuovo, per la pausa |
| `.` / `,` | Un secondo avanti / indietro, in pausa (`Maiusc`: dieci secondi) |
| `Esc` | Prima smette di guardare il bersaglio, poi smette di seguire |
| `Ctrl`+clic o `Alt`+clic su un'unità (nella vista o nell'elenco unità) | Guarda da lì dall'unità seguita (la vista a due unità); cliccala di nuovo per toglierla |
| `Maiusc`+clic su due unità | Misura tra di esse: rilevamento, distanza, differenza di altezza |

`V` richiede un'unità seguita. Qui `M` è la mappa 2D, e "sposta" nella scheda Tattica.

## Seguire un'unità {#following-a-unit}

Mentre la telecamera segue un'unità, la rotella e i tasti di volo ruotano attorno all'unità invece di volare liberamente ([Telecamera](camera.md#while-following-a-unit)):

| Input | Effetto |
|---|---|
| Rotella, `W` / `S` | Più vicino / più lontano (più in alto / più in basso nella vista satellite). Non nelle viste cabina e padlock. |
| `A` / `D`, `Q` / `E` | Orbita attorno all'unità (viste inseguimento e orbita) |
| Trascinamento | Guarda intorno all'unità; in cabina, guarda intorno all'interno |
| `V` / `Maiusc+V` | Vista successiva / precedente della telecamera |
| `H` | Display a testa alta (viste cabina e padlock) |
| `Esc` | Smette di guardare la seconda unità, poi smette di seguire |

## Lavagna tattica {#tactics-board}

Nella scheda Tattica ([Lavagna tattica](tactics-board.md)). `F`, `C`, `G` e `T` funzionano come sopra; i tasti numerici non fanno nulla.

| Tasto | Effetto |
|---|---|
| `Ctrl+Z` | Annulla |
| `Ctrl+Y` o `Ctrl+Maiusc+Z` | Ripeti |
| `Invio` | Termina la freccia in disegno (anche un doppio clic o un clic destro) |
| `Esc` | Annulla un trascinamento; altrimenti toglie la freccia o lo spostamento in corso; altrimenti deseleziona |
| `Canc` o `Backspace` | Elimina la selezione |
| `W` / `E` / `R` | Gizmo Sposta / Ruota / Scala per la selezione (schema tasti **W / E / R**) |
| `G` / `R` / `S` | Gizmo Sposta / Ruota / Scala per la selezione (schema tasti **G / R / S**) |
| `R` | Senza selezione: gira di 15° la prossima figura da posizionare. `Maiusc+R` la gira indietro. |
| `M` | Con una figura selezionata: la sposta al clic successivo |
| `K` | Riproduci o metti in pausa il piano |
| Maiusc+clic | Aggiunge o toglie dalla selezione |
| Maiusc+trascinamento | Disegna un riquadro per scegliere cosa selezionare |
| `Ctrl` mentre trascini una maniglia | Aggancia alla griglia o al passo angolare |

I tasti del gizmo funzionano solo quando qualcosa è selezionato; senza selezione, `W A S D` fanno volare la telecamera come al solito.

## Clic per scegliere {#click-to-pick}

Con **Il clic mostra cosa c'è** attivo e il righello spento ([Clic per scegliere](camera.md#click-to-pick)):

| Input | Effetto |
|---|---|
| Clic sinistro (senza trascinare più di 4 px) | Mostra il punto dati, o altrimenti il punto del livello, sotto il puntatore |

## Misura {#measure}

Con **Righello attivo** ([Misura](measure.md)):

| Input | Effetto |
|---|---|
| Clic sinistro (senza trascinare più di 4 px) | Mette un punto |
| Clic destro | Rimuove l'ultimo punto |

## Altrove {#elsewhere}

| Dove | Input | Effetto |
|---|---|---|
| La presa di qualsiasi cursore (la maniglia accanto al numero) | Trascina su / giù | Cambia il valore con continuità, più veloce più trascini lontano; tieni `Maiusc` per il controllo fine. Rilascia per fermarti. |
| Il display della velocità sopra la vista | Trascina su / giù | Cambia la velocità di volo nello stesso modo. |
| Caselle di posa | `Invio` | Applica la posizione o l'orientamento digitati. |
| Editor delle curve | Doppio clic / Alt+clic / clic destro | Aggiunge un punto / rimuove un punto ([Forma dello sprite](sprite-shape.md#the-curve-editor)). |

## Scheda Analisi di gara {#race-analysis-tab}

Nella scheda Analisi di gara `K` riproduce e mette in pausa il replay della gara, `Home` lo riporta all'inizio, e i tasti numerici non fanno nulla. Vedi [Analisi di gara](race-analysis.md).

## Tasti che il visualizzatore tiene dal browser {#keys-the-viewer-keeps-from-the-browser}

Alcune scorciatoie del browser chiuderebbero o ricaricherebbero la pagina e perderebbero una sessione caricata; il visualizzatore le tiene per sé. L'elenco è generato dal codice: [Tasti del browser](ref-browser-keys.md).

## Gamepad {#gamepad}

Vedi [Gamepad e HOTAS](gamepad.md).
