---
title: "Percorso della telecamera e video"
nav_order: 15
lang: "it"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---

# Percorso della telecamera e video

Fai un film dei tuoi dati: metti la telecamera in pochi punti, il visualizzatore vola tra di essi e salva un video. Ogni fotogramma è molto pulito, senza grana. La telecamera e la testina di riproduzione si muovono insieme, quindi lo stesso pannello fa anche un timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Crea un volo {#make-a-flythrough}

1. Vola fino a dove inizia il film e premi **Aggiungi fotogramma chiave qui** in **Percorso della telecamera e rendering**.
2. Vola fino al punto successivo e premilo di nuovo. Ripeti per ogni tappa.
3. Metti la spunta su **Anteprima lungo il percorso** e trascina **Posizione lungo il percorso** per controllare il movimento.
4. Imposta **Durata** (quanto dura il video). Un movimento giusto ma troppo veloce richiede solo una durata maggiore.
5. Premi **Esegui il rendering del video**. Aspetta la linea di avanzamento; il file viene scaricato al termine.

![Il pannello Percorso della telecamera e rendering con tre fotogrammi chiave, interpolazione Morbida, 12 s, 30 fps e 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Fotogrammi chiave {#keyframes}

| Comando | Effetto |
|---|---|
| **Aggiungi fotogramma chiave qui** | Aggiunge la posizione attuale della telecamera, imbardata, beccheggio e campo visivo come fotogramma chiave. |
| **Svuota** | Rimuove tutti i fotogrammi chiave. |
| Elenco dei fotogrammi chiave | Una riga per chiave: il suo numero (clicca per far volare la telecamera lì, impostando anche il campo visivo), la posizione, `imbardata° / beccheggio°`, e **×** per rimuoverla. |

Le chiavi sono distanziate **in modo uniforme** lungo un asse normalizzato del percorso da 0 a 1 ogni volta che ne viene aggiunta o rimossa una; la durata di uscita allunga poi l'intero movimento, quindi un'inquadratura giusta ma troppo veloce richiede solo una durata maggiore. L'imbardata viene srotolata tra le chiavi così la telecamera gira per la via più breve.

Senza fotogrammi chiave, un rendering tiene ferma la telecamera attuale per tutta la clip - un timelapse perfettamente valido.

## Impostazioni del percorso {#path-settings}

| Comando | Predefinito | Intervallo (rotella) | Significato |
|---|---|---|---|
| **Interpolazione** (2+ chiavi) | *Morbida* | *Morbida* / *Rettilinea* | *Morbida*: una curva cubica di Hermite attraverso le chiavi con tangenti dalle chiavi vicine, così la velocità combacia attraverso ogni chiave e non c'è uno scatto dove i segmenti si incontrano. *Rettilinea*: linee dritte tra le chiavi, prevedibile, con un angolo visibile a ogni chiave. Il campo visivo è sempre interpolato in modo lineare. |
| Linea di percorrenza (2+ chiavi) | | | `N unità di percorrenza - M al secondo a questa durata`, oppure una nota che le chiavi sono tutte nello stesso punto. |
| **Anteprima lungo il percorso** (1+ chiavi) | spento | | Guida la telecamera della vista dal percorso, e muove la testina di riproduzione con essa come fa il rendering, così il movimento si può giudicare prima di renderizzare. |
| **Posizione lungo il percorso** (durante l'anteprima) | 0% | 0-100% | Dove sul percorso mostrare l'anteprima. |
| **Durata** | 12 s | 1-120 s (3600) | Lunghezza del video. |
| **Frequenza dei fotogrammi** | 30 fps | 6-60 (240) | |
| **Bitrate** | 16 Mbps | 1-60 Mbps, logaritmico (400) | I gradienti di calore si spezzano male a bitrate bassi: c'è poco dettaglio dietro cui un codec può nascondere l'errore. |
| **Limite di attesa della convergenza** | 240 fotogrammi | 2-600 (10.000) | Il massimo che un fotogramma in uscita può attendere per diventare esatto. I fotogrammi che lo raggiungono vengono scritti comunque, e conteggiati. |
| Riepilogo | | | `N fotogrammi · finestra: cumulativa/fissa/durata`, e quando la linea temporale è in modalità Tutto: *(il rendering passa da Tutto a Riproduci così la testina ha un significato)*. |
| **Esegui il rendering del video** / **Annulla** | | | Avvia il rendering; mentre gira, mostra `fotogramma i / n · atteso w · X MB` e quanti fotogrammi non sono stati esatti. Richiede un dataset. |

## Suggerimenti {#tips}

- La dimensione dell'output è la dimensione del canvas in pixel fisici (il rapporto di pixel del display, limitato a 2). Ridimensiona la finestra del browser per cambiarla.
- Una storia cumulativa costruisce il calore lungo la clip; una finestra o una storia a durata mostra una fetta mobile di tempo.
- Le posizioni dei fotogrammi chiave sono coordinate di visualizzazione: con un [asse del mondo invertito](camera.md#invert-world-axis), le chiavi create prima di invertirlo puntano altrove dopo.

## Per gli sviluppatori {#for-developers}

### Cosa fa un rendering {#what-a-render-does}

1. Esegue una cattura di prova del fotogramma per conoscere la dimensione esatta dell'output in pixel fisici.
2. Sceglie un codec tramite WebCodecs: **VP9** (`vp09.00.10.08`), altrimenti **VP8**, al bitrate e alla frequenza scelti. Senza `VideoEncoder` si ferma con *Questo browser non ha VideoEncoder - WebCodecs è richiesto per scrivere un video*; con nessuno dei due codec, *Nessun codec video supportato (provati VP9, VP8)*.
3. Prende il controllo delle impostazioni che un rendering richiede: mette in pausa la riproduzione, disattiva il **budget adattivo**, attiva l'**affinamento progressivo** e porta il budget di sprite a 64M per fotogramma (il budget adattivo protegge la frequenza di fotogrammi, che qui è l'obiettivo sbagliato: leggerebbe ogni fotogramma lento in convergenza come un motivo per spruzzare meno righe, cosa che richiede più fotogrammi per convergere), e porta la linea temporale da **Tutto** a **Riproduci**. L'impostazione della storia (cumulativa, finestra, durata) resta com'è: un rendering deve essere ciò che stavi guardando, riprodotto e messo per iscritto.
4. Per ogni fotogramma di output *f* di *n*, con *u* = f / (n - 1):
   - colloca la telecamera nella posa del percorso a *u* (se ci sono chiavi);
   - porta la testina di riproduzione alla stessa frazione *u* dell'intervallo della linea temporale (l'arco della sessione selezionata nel replay a scatola);
   - forza una stima nuova, anche quando la telecamera non si è mossa - ereditare l'accumulo del fotogramma precedente lascerebbe un fantasma della finestra precedente;
   - attende, fotogramma per fotogramma, finché l'immagine è esatta (tutte le righe candidate disegnate in un fotogramma, oppure l'accumulo completato), fino al limite di attesa;
   - cattura il fotogramma composto e lo codifica, con un fotogramma chiave ogni 2 secondi di output così il file è navigabile.
5. Unisce i fotogrammi in un file WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) con timestamp scelti dalla frequenza dei fotogrammi - il tempo reale impiegato da ogni fotogramma è irrilevante.
6. Ripristina il budget, il campo visivo, la modalità della linea temporale, la testina e se era in riproduzione.
7. Scarica il video come `3dheat-<larghezza>x<altezza>-<fotogrammi>f.webm` e riporta `N fotogrammi a L×A, X MB - ogni fotogramma esatto`, oppure quanti hanno raggiunto il limite di attesa.

**Annulla** si ferma dopo il fotogramma corrente (*Rendering annullato.*) e ripristina le impostazioni.
