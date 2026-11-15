---
title: "Lavagna tattica"
nav_order: 15
has_children: true
lang: "it"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Lavagna tattica

La scheda **Tattica** è una lavagna da disegno per un piano di squadra: metti piccole figure su una mappa, disegni frecce per dire dove vanno e premi play per vedere come si svolge. Usala per pianificare un round o un attacco prima di giocare. Condivide con le altre schede il canvas, la telecamera e il [livello](levels.md), e niente altro: un piano non è un dato e non disegna calore.

## Il tuo primo piano {#your-first-plan}

1. Apri la scheda **Tattica**. Scegli il **Gioco** (per esempio Counter-Strike 2) e, per Valorant, premi **Carica le mappe di Valorant** e scegli una **Mappa**. Oppure carica prima un [livello](levels.md).
2. Scegli uno **Schieramento** (imposta il colore) e premi **Vista dall'alto**.
3. Scegli **Luogo**, seleziona una figura in **Figure** (usa **Cerca figure** per trovarne una) e clicca sulla mappa. Piazzane due o tre.
4. Scegli **Freccia**, clicca su una figura, clicca lungo il percorso che dovrebbe fare, e premi **Invio** per terminare la freccia.
5. Premi **+** sotto la vista per aggiungere il passo 2. Ogni figura parte da dove finiva la sua freccia. Disegna altre frecce lì.
6. Premi **▶** (o `K`) per riprodurre il piano dal passo mostrato fino alla fine.
7. Dai un nome al piano in **Nome del piano** e premi **Salva**.

![La scheda Tattica in vista dall'alto: gioco, schieramenti e strumenti a sinistra, tre figure con frecce di movimento, un arco di lancio di fumogeno, un'Area e i passi lungo il fondo](../assets/img/en/tactics.webp)

## Avviare un piano {#starting-a-plan}

| Controllo | Cosa fa |
|---|---|
| **Gioco** | Sceglie gli schieramenti e le figure che la tavolozza offre: Counter-Strike 2 (T, CT; giocatori e utility), Valorant (Attacco, Difesa; giocatori e abilità generiche), Battlefield, Squad, Arma (fanteria, veicoli di terra, aerei, barche), DCS / War Thunder / IL-2 (jet, aerei a elica, elicotteri, difesa aerea, terra, navi, armi) e Altro. Un piano che ha già delle figure mantiene i suoi schieramenti quando cambi gioco. |
| **Nome del piano** | Il nome con cui il piano viene salvato. |
| **Mappa**, **Carica le mappe di Valorant** | Con Valorant scelto: **Carica le mappe di Valorant** ottiene l'elenco delle mappe da [valorant-api.com](https://valorant-api.com); **Mappa** poi mette la minimappa della mappa scelta come livello, inquadrata dall'alto. L'immagine viene scaricata quando viene scelta e non è mai distribuita con il programma. L'avviso di Riot viene mostrato finché è visibile (vedi sotto). |
| **Schieramento** | Lo schieramento a cui appartiene la prossima figura, freccia o area; prende il colore dello schieramento. |

Senza un livello la lavagna è il piano di terra piatto. Carica un livello sotto **Livello** per pianificare su una mappa vera: una mappa CS2 esportata con lo strumento CS2, un livello dalla libreria, oppure un'immagine di mappa.

## Strumenti {#tools}

| Strumento | Clic | Note |
|---|---|---|
| **Seleziona** | Una figura, un punto di passaggio, una freccia, un'area o una nota la selezionano. | Shift+clic aggiunge o toglie; Shift+trascina disegna un riquadro attorno a ciò che va aggiunto. La selezione riceve un manipolatore di trasformazione (vedi sotto); `Canc` o `Backspace` la rimuove. `M` sposta la figura selezionata al clic successivo. |
| **Luogo** | Posa la figura scelta. | Una figura si sceglie nella tavolozza **Figure** (con **Cerca figure**). Senza nulla selezionato, `R` ruota la prossima figura di 15° prima che venga piazzata (`Shift+R` nel senso opposto). |
| **Freccia** | Ogni clic aggiunge un punto; Invio, un doppio clic o un clic destro la terminano, Esc la annulla. | **Movimento**, **Attacco** (punta più larga) o **Sorveglia** (una linea sottile all'altezza degli occhi). Una freccia iniziata su una figura è il percorso di quella figura in questo passo: riprodotta, la figura lo percorre, e il passo successivo inizia dove è finito. |
| **Lancio** | Chi lancia, poi dove atterra. | Un arco tratteggiato dall'uno all'altro, e l'utility scelta (fumo, flash, molotov, ...) appare dove atterra e resta da questo passo in poi. |
| **Area** | Il centro, poi il bordo. | Un disco nel colore dello schieramento. |
| **Nota** | Dove va la nota; chiede il suo testo. | Mostrata come una puntina, con il suo testo sopra. |
| **Cancella** | Una figura, freccia, area o nota. | La rimuove da questo passo in poi; al suo primo passo, la rimuove del tutto. |

**Annulla** e **Ripeti** (`Ctrl+Z`; `Ctrl+Y` o `Ctrl+Shift+Z`) scorrono ogni modifica. Una riga sotto il piano mostra quante figure, frecce e passi contiene. **Vista dall'alto** guarda dritto in basso (ortografica), **Vista 3D** torna alla prospettiva, **Fotogramma** adatta il piano, o il livello quando il piano è vuoto.

**Dimensione figure** scala ogni figura sulla lavagna; 1× è la dimensione reale, che vista da molto in alto è di pochi pixel per una persona.

## Spostare, ruotare e scalare {#moving-turning-and-scaling}

Tutto ciò che è sulla lavagna può essere spostato come in un editor 3D: figure, utility, marcatori, singoli punti di passaggio e intere frecce, aree e note. Ciò che è selezionato riceve un manipolatore al suo centro:

| Modalità | Tasti | Maniglie |
|---|---|---|
| **Sposta** | W (o G) | Una freccia per asse (X rosso, Y verde e verso l'alto, Z blu) si muove lungo di esso; un quadrato si muove nel suo piano; il centro si muove sul livello sotto il puntatore. |
| **Ruota** | E (o R) | Un anello per asse ruota attorno ad esso. Gli anelli di una singola figura sono il suo imbardata, beccheggio e rollio; un gruppo ruota attorno agli assi del mondo intorno al proprio centro. |
| **Scala** | R (o S) | Allarga o restringe la selezione dal suo centro lungo un asse o in ogni direzione; il raggio di un'area cresce con essa. |

**Tasti** passa tra W / E / R (Unity, Unreal) e G / R / S (Blender); i tasti scelgono la modalità solo quando qualcosa è selezionato, altrimenti muovono la telecamera. Quindi `R` significa **Scala** con i tasti W / E / R e **Ruota** con i tasti G / R / S quando qualcosa è selezionato, e ruota la prossima figura da piazzare quando non lo è. Tutti i tasti della lavagna sono elencati nel [riferimento dei tasti](keyboard-reference.md#tactics-board). Tieni premuto **Ctrl** mentre trascini per agganciare uno spostamento alla **Griglia** (metri) o una rotazione all'**Passo angolo**. **Aggancia al suolo** (attivo di default) mette persone, veicoli, marcatori, punti di passaggio e aree sulla superficie del livello; aerei ed elicotteri mantengono la loro altezza, e un trascinamento lungo la freccia Y non si aggancia mai. Trascinare una maniglia non sposta mai la telecamera. **Esc** annulla un trascinamento, e ogni modifica è un passo di Annulla.

I punti di passaggio appaiono come puntini sulle frecce del passo mostrato: clicca uno per selezionarlo, trascinalo per spostarlo, Canc per toglierlo. La sezione **Selezionate** mostra la posizione della selezione in metri, il rollio, il beccheggio e l'imbardata di una figura in gradi, e il raggio di un'area, ciascuno da digitare.

## Cronometraggio {#timing}

Il percorso di una figura è cronometrato: ogni segmento richiede la sua lunghezza sul livello - campionata sulla superficie ogni paio di metri, quindi una collina o una scala tra due punti conta - alla velocità della **modalità** di movimento di quella figura in quel gioco, più l'eventuale **attesa** a un punto di passaggio. La fanteria striscia, si accovaccia, cammina (silenziosa), corre o sprinta; veicoli e barche strisciano, vanno con cautela, normalmente o di corsa; aerei ed elicotteri volano lenti, in crociera, a velocità di combattimento o al massimo. Una modalità che il gioco non ha (CS2 non ha lo sprint) prende la più vicina che ha. Come una pendenza rallenta dipende dal gioco: in CS2 e Valorant conta solo la distanza orizzontale, come nei giochi; i simulatori militari rallentano la fanteria in salita (funzione di escursionismo di Tobler) e i veicoli in base alla pendenza.

Le velocità vengono da tabelle per gioco con le loro fonti (vedi [Velocità di movimento](tactics-speeds.md)): CS2 in base all'arma impugnata, dalle definizioni delle armi del gioco; Valorant in base all'arma; Battlefield, Squad, Arma e i giochi aerei in base al tipo e alla classe di veicolo. **Si muove come** sceglie il profilo di una figura (un'arma, un tipo di veicolo); **Propria (m/s)** sostituisce qualsiasi modalità per quella figura. Le modalità hanno i nomi che la lavagna mostra: *Striscia*, *Accovacciato*, *Cammina (silenzioso)*, *Corri*, *Sprint*; *Cautela*, *Normale*, *Di corsa*; *Lento*, *Crociera*, *Combattimento*, *Massimo*.

Ogni punto di passaggio mostra il tempo dall'ultimo e il tempo dall'inizio del piano ("+3,9 s · 0:12"). Il percorso della figura selezionata elenca ogni segmento con la sua modalità, lunghezza e tempo, l'attesa e l'arrivo. **Arrivi** sotto **Cronometraggio** mette ogni figura con percorso su una stessa linea del tempo, primo arrivo in cima. Con **Riproduci in tempo reale** (attivo di default) un passo dura finché arriva il percorso più lento e ogni figura si muove alla propria velocità; **Secondi** è allora la lunghezza minima del passo. **Unità del livello per metro** dice in cosa è il livello: 39,37 per le mappe CS2 (unità di gioco), 1 per le mappe in metri.

## Confronto con i dati di partita {#compare-with-match-data}

**Carica file partita…** legge le tabelle delle partite CS2 della mappa (i file Parquet dello strumento CS2, quanti se ne vogliono; solo le colonne necessarie, in background); **Usa i dati caricati** prende i dati caricati nel visualizzatore. Poi:

- **Arrivo più rapido sulla mappa** colora la mappa in base al tempo dall'inizio del round in cui un giocatore ha raggiunto per primo ogni punto - il pulsante **Il più veloce** mostra il più rapido su tutti i round, **Tipico (mediana)** il round di mezzo - dal verde all'inizio al rosso alla fine, per un lato o per entrambi. Mostra cosa è possibile e quando.
- Il percorso selezionato viene confrontato con ciò che i giocatori hanno ottenuto dal suo inizio (o dall'inizio del round) alla sua fine, ciascun estremo un disco del raggio impostato: "Più rapido osservato 14,2 s, p10 15,0 s, mediana 18,3 s su 41 prove; il tuo piano 15,1 s".
- Le velocità a cui i giocatori si sono davvero mossi - correndo, camminando, accovacciati, dalle colonne di camminata e di accovacciamento delle tabelle - in m/s.

## Passi {#steps}

La barra sotto la vista contiene i passi. Un piano ne inizia con uno; **+** ne aggiunge uno, e ogni figura inizia lì dove finiva il suo percorso nell'ultimo passo; **−** rimuove quello mostrato. **Secondi** è quanto dura il passo mostrato quando viene riprodotto. **▶** (K) riproduce dal passo mostrato fino alla fine: le figure con un percorso lo percorrono, quelle spostate in un nuovo punto nel passo successivo scivolano lì, le altre restano ferme. Mentre un passo è mostrato, il posto di ogni figura nel passo successivo è disegnato come un fantasma tenue, e le frecce dell'ultimo passo appaiono debolmente sotto quelle di questo.

## Salvataggio {#saving}

La sezione **File** contiene **Salva**, **Open** e **Svuota**. **Salva** scrive il piano come `<nome>.h3dplan.json` (JSON semplice: schieramenti, passi, figure con un posto per passo, frecce, aree, note); **Open** lo rilegge. Un file di un'altra versione, o uno che non è un piano, viene rifiutato con il motivo. **Svuota** svuota il piano; Annulla lo riporta.

## Figure {#figures}

Ogni figura è costruita dal visualizzatore stesso: forme semplici alla dimensione pubblicata di un tipo, con le caratteristiche che la distinguono dalle vicine - i ruotini e la torretta di un carro, i cannoni, i missili e i radar di un mezzo di difesa aerea, la pianta delle ali, la coda e i motori di un aereo, i rotori e le ali corte di un elicottero. Nulla è preso da un gioco. Un design inventato da un gioco viene mostrato come la figura generica della sua classe. Vedi [Figure](figures.md#which-figure-a-unit-gets) per come i dati trovano la propria figura.

## Avviso di Riot {#riots-notice}

Le mappe di Valorant vengono mostrate secondo la policy "Legal Jibber Jabber" di Riot Games, che permette ai progetti gratuiti della comunità di usarle e chiede questo avviso ovunque appaiano: *3DHeat è stato creato secondo la policy "Legal Jibber Jabber" di Riot Games usando asset di proprietà di Riot Games. Riot Games non approva né sponsorizza questo progetto.* Le abilità sulla lavagna sono forme generiche, non l'arte di Riot.
