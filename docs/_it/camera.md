---
title: "Telecamera e controlli"
nav_order: 14
has_children: true
lang: "it"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Telecamera e controlli

Voli attraverso la scena come un uccello: **W A S D** per muoverti, trascina il mouse per guardare. Usa questa pagina per volare, per saltare a una vista dall’alto o di lato, e per leggere esattamente dove si trova la telecamera.

## Volare in 4 passi {#fly-in-4-steps}

1. Fai un clic una volta sulla vista, così ha la tastiera.
2. Tieni premuto **W** per volare avanti, **S** indietro, **A** e **D** di lato, **Spazio** in alto, **Q** in basso.
3. Tieni premuto il pulsante sinistro o destro del mouse e trascina per guardarti intorno.
4. Premi **F** per inquadrare di nuovo tutti i dati.

La telecamera è una telecamera libera di volo con una proiezione prospettica e una parallela, viste predefinite, una posa digitata e la profondità di campo. Le sue impostazioni sono nel pannello **Telecamera e scena** in fondo alla barra laterale (si vede anche nelle schede Analisi di gara e Partita). L’implementazione è [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Volo {#flying}

| Comando | Effetto |
|---|---|
| `W` `A` `S` `D` o i tasti freccia | Avanti (lungo la vista, inclusa la sua inclinazione), sinistra, indietro, destra |
| `Spazio` o `E` | In alto (in alto nel mondo) |
| `Q` o `Ctrl` sinistro | In basso |
| `Shift` (tenuto premuto) | 6 volte più veloce |
| `Alt` sinistro (tenuto premuto) | 15% della velocità |
| Trascina con il pulsante sinistro o destro del mouse | Guarda intorno. Il puntatore è bloccato mentre trascini. |
| Rotella del mouse | Velocità di volo ×1,5 per scatto (prospettica); zoom (parallela) |
| `F` | Inquadra i dati |
| Clic (senza trascinare) | Mostra cosa c’è sotto il puntatore ([Ispezionare la vista](#inspecting-the-view)) |
| `C` | Copia la posizione, l’imbardata e il beccheggio della telecamera |
| `G` | Vai a un punto digitato |
| `Esc` | Chiude la scheda del punto (e smette di seguire un’unità) |

### Mentre segui un’unità {#while-following-a-unit}

Quando la telecamera segue un’unità in un replay ([Replay della partita](match-replay.md)), i tasti di volo fanno altro:

| Comando | Effetto |
|---|---|
| Rotella, `W` / `S` | Più vicino all’unità / più lontano (più in alto / più in basso nella vista satellite) |
| `A` / `D`, `Q` / `E` | Orbita attorno all’unità (viste inseguimento e orbita) |
| Trascina | Guarda intorno all’unità (cockpit: guarda dentro) |
| `V` / `Shift+V` | Vista della telecamera successiva / precedente |
| `Esc` | Prima smette di guardare la seconda unità, poi smette di seguire |

I tasti di movimento si sommano con un [gamepad](gamepad.md); per tutto il resto vedi il [riferimento dei tasti](keyboard-reference.md). I tasti sono ignorati quando una casella di testo o un elenco a discesa ha il fuoco. L’inclinazione è limitata appena prima di guardare dritto in alto e in basso.

## Pannello Telecamera e scena {#camera--scene-panel}

![Il pannello Telecamera e scena: Proiezione, pulsanti Viste predefinite, Campo visivo, Velocità di volo e Posa](../assets/img/en/camera-panel.webp)

### Proiezione {#projection}

**Proiezione**: *Prospettica* (predefinita) o *Parallela*.

*Parallela* (ortografica) toglie la deformazione prospettica, quindi due punti caldi di uguale densità si leggono della stessa dimensione ovunque nel fotogramma – il confronto che serve a una heatmap su mappa – ed è ciò che rende isometrica una vista isometrica. In modalità parallela la rotella del mouse fa zoom (non c’è un movimento in avanti che cambi la scala) e la [visualizzazione della velocità](#fly-speed) è nascosta.

**Cambiare proiezione mantiene il soggetto della stessa dimensione.** Una proiezione parallela non ha un campo visivo, quindi la sua altezza del tronco non è legata alla distanza della telecamera; passarvi in modo ingenuo o ingrandisce in modo selvaggio o non mostra nulla. Passando alla parallela, l’altezza del tronco è impostata su ciò che la telecamera prospettica copre alla distanza di messa a fuoco (2 × distanza × tan(campo / 2), dove la distanza di messa a fuoco è la distanza dell’ultima inquadratura). Tornando indietro si ripristina la posa prospettica che avevi lasciato, alla stessa scala apparente, invece di dove si era spostata la vista parallela.

### Viste predefinite {#preset-views}

| Gruppo | Pulsanti | Orientamento |
|---|---|---|
| **Isometrica** | **NE**, **NO**, **SE**, **SO** | Parallela, beccheggio -35,264° (= atan(1/√2), l’angolo al quale tutti e tre gli assi si proiettano alla stessa lunghezza), imbardata -45°, 45°, -135°, 135°. Quattro angoli, perché uno solo nasconde sempre metà della mappa dietro ciò che è più vicino. |
| **Prospetti** | **Sopra**, **Sotto**, **Davanti**, **Dietro**, **Sinistra**, **Destra** | Parallela. Sopra guarda dritto in basso (beccheggio -89,9°), Sotto dritto in alto, Davanti lungo -Z (imbardata 0°), Dietro lungo +Z (180°), Sinistra lungo -X (-90°), Destra lungo +X (90°). |
| | **Torna alla prospettiva** | Torna alla posa prospettica che avevi lasciato. Disattivato in prospettiva. |
| | **Vista di tre quarti** | Prospettica, imbardata -35°, beccheggio -28°. |

Ogni vista predefinita cambia la proiezione stessa – in prospettiva una «vista dall’alto» converge ancora verso un punto di fuga e le aree uguali non si leggono più come uguali – e inquadra i dati da quella direzione.

### Campo visivo {#field-of-view}

**Campo visivo** – l’angolo verticale. Predefinito 65°, 10-140° sulla barra (179° con la maniglia), con i pulsanti **Piatta 20°**, **Lunga 35°**, **Normale 50°**, **Larga 65°**, **Molto larga 90°**. Uno stretto appiattisce la prospettiva e si legge più come una proiezione parallela; uno largo esagera la profondità e rende difficile giudicare le distanze. Resta attivo in modalità parallela, dove imposta la scala che il ritorno alla prospettiva calcola e la distanza che usa **Inquadra**.

### Velocità di volo {#fly-speed}

**Velocità di volo** – unità del mondo (metri) al secondo a tutto gas. Predefinita 120; ad ogni caricamento è l’estensione orizzontale dei dati / 12. Logaritmica, 0,02-20.000 (200.000 con la maniglia; la maniglia la cambia per rapporti, non per quantità). La rotella del mouse la moltiplica o divide per 1,5 per scatto, entro 0,02-200.000.

Lo stesso valore è mostrato in basso a destra della vista (solo prospettica): la velocità in m/s o km/s e il tempo che serve per attraversare i dati (o il livello, quando è caricato un livello 3D) a quella velocità. Trascinalo su o giù per cambiare la velocità.

### Vicino e lontano {#near-and-far}

**Vicino** (predefinito 0,5) e **Lontano** (predefinito 40.000) sono le distanze di taglio. Entrambe sono ricalcolate dai dati ad ogni caricamento (vicino = max(0,05; estensione / 20.000), lontano = estensione × 12) e allargate, mai ristrette, da un livello 3D più grande ([Livelli](levels.md#what-a-level-does-for-the-heat)). Il loro rapporto fissa la precisione di profondità su cui si basa l’occlusione, quindi un vicino minuscolo con un lontano enorme indebolisce l’[occlusione](depth-and-culling.md). Visto da fuori la scena o da molto in alto sopra il suo terreno, il piano vicino effettivamente usato si sposta fino al 2% di quella distanza, così una mappa vista da molto in alto mantiene abbastanza precisione di profondità perché acqua e riva non sfarfallino; la casella mostra comunque il valore impostato.

### Altri controlli {#other-controls}

| Controllo | Predefinito | Significato |
|---|---|---|
| **Inverti Y** | spento | Inverte il movimento verso l’alto/il basso del mouse. |
| **Profondità di campo** | spento | Vedi sotto. |
| **Gamepad** | attivo | Vedi [Gamepad e HOTAS](gamepad.md). |
| **Posa** | | Vedi sotto. |
| **Ispeziona** | | La lettura della telecamera, il clic per scegliere, la convenzione di imbardata e *Vai a un punto*; vedi [Ispezionare la vista](#inspecting-the-view). |
| **Fotogramma dataset (F)** | | Adatta i dati (nella scheda Analisi di gara: i giri) alla vista, mantenendo la direzione attuale. La telecamera è posta a r / tan(campo / 2) dal centro, dove r è metà della diagonale dei limiti dei dati. |
| **Griglia**, **Assi** | sì, sì | Una griglia del terreno con una spaziatura 1/2/5 × 10ⁿ di circa 1/40 dell’estensione dei dati (che si estende fino a 1,5 volte i dati, tra 8 e 120 passi di griglia), e assi colorati. |
| **Inverti un asse del mondo** X, Y, Z | spenti | Vedi sotto. |

### Posa {#pose}

Cinque caselle numeriche – **X**, **Y**, **Z** e **imbardata °**, **beccheggio °** – che seguono la telecamera finché nessuna di loro ha il fuoco. Scrivi un valore e premi `Invio` (o lascia la casella) per spostare la telecamera lì. **copia** mette `pos X Y Z · yaw A · pitch B` negli appunti (con `(imbardata di gioco)` dopo, quando è scelta quella convenzione). Volare è come esplori; le coordinate sono come riproduci una vista. Sono gli stessi numeri della [lettura della telecamera](#camera-readout): le coordinate proprie dei dati, anche quando un asse è invertito, e l’imbardata nella [convenzione](#yaw-conventions) scelta.

### Inverti un asse del mondo {#invert-world-axis}

**Inverti un asse del mondo X / Y / Z** disegna il mondo con quell’asse invertito. Un gioco che mantiene un mondo mancino appare specchiato in questo visualizzatore destrorso – le curve a destra disegnate come curve a sinistra – e invertire X o Z lo rimette a posto. **Cambia solo il disegno**: i dati, l’analisi e ogni coordinata che mostrano gli strumenti (posa, righello, sezione) restano quelli del gioco. La vista si ribalta sul posto, mantenendoti a guardare lo stesso punto. Questa impostazione è ricordata nel browser (chiave `localStorage` `heat3d.mirror`); confronta i [ribaltamenti](axes-units-and-time.md#flips) al caricamento, che invece cambiano i dati.

## Ispezionare la vista {#inspecting-the-view}

Dove si trova la telecamera, cosa c’è sotto il puntatore, e andare a un punto – il blocco **Ispeziona** del pannello Telecamera e scena, e due sovrapposizioni in alto a sinistra della vista. Il codice è in [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) e [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Controllo | Predefinito | Significato |
|---|---|---|
| **Posizione della telecamera sulla vista** | attivo | La lettura della telecamera, sotto. Si chiude anche con la sua **×**. |
| **Il clic mostra cosa c’è** | attivo | Clic per scegliere, sotto. |
| **Convenzione di imbardata** | Visualizzatore | Quale imbardata mostrano e leggono la lettura, le caselle della posa e la casella di salto. |

Queste tre sono ricordate nel browser (chiave `localStorage` `heat3d.inspect`).

### Lettura della telecamera {#camera-readout}

In alto a sinistra della vista: **x**, **y**, **z**, **imbardata** e **beccheggio** della telecamera, in tempo reale, con un’etichetta che indica la convenzione di imbardata. Mostra gli stessi numeri delle caselle [Posa](#pose) e non costa nulla mentre voli (viene scritta nella pagina al ritmo dei fotogrammi, senza ridisegnare i pannelli).

- **copia** (o `C` ovunque fuori da una casella di testo) mette `x X y Y z Z yaw A pitch B (imbardata del visualizzatore)` negli appunti, con i decimali con il punto qualunque sia la lingua – una riga che la casella di salto, e ogni script, sa leggere.
- **vai a** (o `G`) apre una casella sotto: incolla un punto e premi `Invio` per guardarlo, oppure incolla una posa copiata intera per stare in quella vista. `Esc` chiude la casella.

### Coordinate: il sistema proprio dei dati {#coordinates-the-datas-own-frame}

Ogni coordinata che gli strumenti di ispezione mostrano o accettano è nel **sistema proprio dei dati caricati**: la [mappatura degli assi](axes-units-and-time.md) del caricamento (asse verso l’alto, ribaltamenti, scala) viene annullata. Una posizione letta dalla vista è il numero che la tabella di origine contiene, e un numero della tabella digitato nella casella di salto porta su quel punto. Quando la mappatura non cambia nulla (un caricamento con Y in alto e senza scala – quello che scrivono gli strumenti di cattura e gli esportatori dei livelli) è semplicemente il mondo; altrimenti la lettura porta un’etichetta **sistema dei dati**. Senza un dataset, le coordinate sono coordinate del mondo. Imbardata e beccheggio sono sempre riferiti al mondo del visualizzatore, con Y in alto.

### Convenzioni di imbardata {#yaw-conventions}

| Convenzione | L’imbardata 0° guarda lungo | Cresce verso | Usata da |
|---|---|---|---|
| **Visualizzatore** | -Z | -X | la telecamera di volo, [viste predefinite](#preset-views) |
| **Gioco / strumenti di cattura** | +X | -Z | le colonne `yaw` e le pose degli strumenti di cattura; in un livello esportato nel sistema del visualizzatore, l’imbardata propria del gioco |

Il beccheggio è lo stesso in entrambe: verso l’alto dall’orizzontale. Le due differiscono di un quarto di giro e di nient’altro:

> imbardata visualizzatore = imbardata gioco - 90°

Una direzione `d` è `(cos p · cos y, sin p, -cos p · sin y)` nella convenzione del gioco e `(-sin y · cos p, sin p, -cos y · cos p)` in quella del visualizzatore. Scegli **Gioco / strumenti di cattura** per scrivere un’imbardata direttamente da una tabella di cattura, o per confrontare la lettura con una di quelle.

### Andare a un punto {#going-to-a-point}

**Vai a un punto**, nel blocco Ispeziona (e nella casella **vai a** della lettura):

- la casella di testo accetta `x, y, z` o `x y z` (o `x; y; z`), con un punto decimale o una virgola decimale – `-321.6, 137.8, -59.9` e `-321,6 137,8 -59,9` sono lo stesso punto. Cinque numeri aggiungono un’imbardata e un beccheggio, e una posa copiata dalla lettura o dalle caselle della posa viene letta per intero, con etichette e convenzione compresi;
- **imbardata °** e **beccheggio °** (facoltativi) girano la telecamera, nella convenzione scelta;
- **Guarda** mantiene la direzione (inclinata per guardare in basso di almeno 20° se guardava in piano) e arretra lungo di essa fino alla distanza attuale, tenuta tra lo 0,3% e il 3% della larghezza della scena – da 6 a 60 m su un livello di due chilometri. La distanza di messa a fuoco, l’altezza della vista parallela e la velocità di volo seguono, così la vista arriva utilizzabile;
- **Posizionati qui** mette la telecamera sul punto, girata secondo l’imbardata e il beccheggio indicati, o come era.

Una posa incollata con la propria imbardata e il proprio beccheggio sta sempre in quella vista.

### Clic per scegliere {#click-to-pick}

Un clic sulla vista – premi e rilascia senza trascinare più di 4 pixel; un trascinamento guarda ancora intorno – mostra una scheda in alto a sinistra con cosa c’è sotto il puntatore. Mentre il [righello](measure.md) è attivo, i clic vanno al righello.

**Un punto dati disegnato vince.** Il campione più vicino entro 8 pixel dal clic, tra quelli effettivamente disegnati: le righe nella finestra temporale e nella durata, che passano i [filtri](filters.md), i gruppi mostrati e la divisione della differenza, dentro il taglio per distanza e una sezione che ritaglia il calore. Nel replay a scatola, una scatola sotto il puntatore (ovunque su di essa). La scheda elenca ogni colonna che la riga porta, con i nomi di colonna della fonte – tempo (orologio, o i secondi propri del file con `m:ss.ss`), persona, gruppo, sessione, ogni colonna conservata, la posizione e la direzione dello sguardo – e la distanza dalla telecamera. In memoria ci sono solo le colonne che il caricamento ha tenuto: una colonna non scelta come [colonna del filtro](column-mapping.md) non viene mostrata.

**Altrimenti la superficie del livello**: il punto in cui il raggio del clic incontra i veri triangoli del livello (non il piano di riferimento del righello), con la **parte** a cui appartiene (il nome dell’esportatore, `structure:props`, `ground:terrain …`), il suo **tipo** (terreno, struttura, acqua, immagine della mappa), le coordinate e la distanza. La geometria nascosta da una sezione o dal taglio per distanza viene attraversata. Dove il livello ha una [maglia di navigazione](model-levels.md#navigation-meshes), una riga la nomina e dice se il punto ci sta sopra (✓). Un nome di parte con il prefisso `≈` è stato stimato dai riquadri delle parti, perché quella parte del livello è stata semplificata al caricamento.

La scheda resta finché non viene chiusa (**×**, `Esc`), un altro clic risponde a qualcos’altro, o un clic sullo spazio vuoto. Nella scena è disegnata una croce ciano nel punto e sullo schermo un anello sopra. I suoi pulsanti: **copia** (ogni valore, e le coordinate come `x, y, z`), **Guarda**, e **Posizionati qui** (su un punto dati, guardando nella direzione in cui guardava la riga quando ha una direzione dello sguardo; su una superficie, a 1,7 m sopra di essa).

Il livello è indicizzato per la selezione al primo clic che ne ha bisogno: una griglia di colonne sulla sua impronta, costruita a pochi millisecondi alla volta tra un fotogramma e l’altro così la vista non si ferma mai (circa un secondo di lavoro per un livello di diversi milioni di triangoli), e tenuta finché il livello non cambia. Fino ad allora la scheda dice *Preparazione del livello per la selezione: N%*, e risponde al clic quando è pronta. Una ricerca di punti dati su più di quattro milioni di righe disegnate è distribuita sui fotogrammi allo stesso modo.

## Profondità di campo {#depth-of-field}

Una sezione richiudibile in Telecamera e scena, con il titolo *Profondità di campo — attiva* mentre è attiva. Spenta per impostazione predefinita: è un effetto di presentazione, e la vista predefinita deve mostrare i dati piuttosto che un’interpretazione di essi.

| Controllo | Predefinito | Intervallo (rotella) | Significato |
|---|---|---|---|
| **Attiva** | spenta | | |
| **Metti a fuoco ciò che è stato inquadrato** | attivo | | Fuoco alla distanza usata dall’ultima inquadratura (*Messo a fuoco a N m.*). |
| **Distanza di messa a fuoco** | 1000 | 1-200.000, logaritmica (10.000.000) | Mostrata quando il fuoco è manuale. |
| **Apertura** | ±35% | da ±2% a ±200%, logaritmica (±3200%) | La profondità tenuta nitida, come frazione della distanza di messa a fuoco – relativa e non un numero f, perché le scene vanno da una stanza a una mappa di otto chilometri. |
| **Sfocatura massima** | 12 px | 1-48 (256) | Il raggio di sfocatura più grande; il costo cresce con esso. |

Sfoca i **livelli, la griglia e le scatole** – *non il calore*. Il calore in un pixel è la somma di sprite a molte profondità, quindi non ha una sola profondità in cui essere fuori fuoco; sfocarlo con la geometria che c’è dietro sarebbe sbagliato ovunque fluttui davanti. Dati nitidi su un contesto ammorbidito sono anche la cosa più utile delle due. La sfocatura è un campionamento a 24 punti con angolo aureo nel passaggio di composizione, pesato in modo che un primo piano nitido non venga trascinato verso l’esterno dallo sfondo sfocato dietro. Cambiarla ridisegna senza riavviare l’accumulo del calore.

## Risoluzione della tela {#canvas-resolution}

La tela è resa al rapporto di pixel del display, limitato a 2. Il buffer del calore può essere reso a una risoluzione più bassa di quella ([Risoluzione del calore](performance-and-stats.md)).

## Pagine di questa sezione {#pages-in-this-section}

- [Gamepad e HOTAS](gamepad.md)
- [Riferimento di tastiera e mouse](keyboard-reference.md)
