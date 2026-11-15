---
title: "Linea temporale e riproduzione"
nav_order: 5
lang: "it"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Linea temporale e riproduzione

La barra sotto l'immagine è come un lettore video: puoi riprodurre i dati come un film, metterli in pausa, saltare avanti e indietro e cambiarne la velocità.

![La barra della linea temporale: 1 Tutto/Riproduci, 2 pulsanti di trasporto, 3 orologio, 4 Velocità, 5 Cronologia, con Finestra e un Intervallo di 30 s](../assets/img/en/timeline-bar.webp)

La barra sotto la vista è la linea temporale ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Decide quali righe sono visibili in ogni momento. Richiede una colonna di tempo: senza di essa l'intera barra è disattivata, la vista resta in **Tutto** e la barra laterale dice *Nessuna colonna di tempo in questi dati - la linea temporale è disattivata e ogni punto dato viene mostrato subito.*

## Tutto e Riproduci {#all-and-play}

Due modalità principali, perché rispondono a domande diverse.

- **Tutto** (predefinito a ogni caricamento) ignora del tutto la testina di riproduzione e mostra ogni riga che passa i filtri. È la vista "dove succede questa cosa", e non è la stessa cosa che portare il cursore alla fine. Il cursore è disattivato e l'orologio mostra `tutto · <span> di dati`.
- **Riproduci** fa scorrere i dati come un timelapse. Compaiono il cursore, i controlli di trasporto e le impostazioni della cronologia.

Scegliere **Tutto** ferma anche la riproduzione.

## I controlli {#the-controls}

| Controllo | Predefinito | Significato |
|---|---|---|
| Cursore | l'inizio | La testina di riproduzione. Trascina per spostarti; 20.000 passi lungo l'intervallo. |
| **Tutto** / **Riproduci** | Tutto | Vedi sopra. |
| ▶ / ❚❚ | in pausa | Riproduci o pausa; anche `K`. |
| ◀ **Riproduci all'indietro (J)** | | Riproduce i dati al contrario. Mostrato solo nella modalità **Figure sovrapposte**; il tasto `J` funziona anche lì (vedi [Tastiera](#keyboard)). |
| ⏮ | | Torna all'inizio dell'intervallo. |
| Orologio | | `trascorso / totale` come `mm:ss.s` (o `h:mm:ss`) e, quando la colonna di tempo è un timestamp assoluto, l'ora del giorno della testina come `HH:MM:SSZ` (UTC). |
| **Velocità** | 1× | Secondi dei dati per ogni secondo reale. Il menu ha 17 passi da 0,01× a 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), più **Personalizzata…**: scrivi una velocità qualsiasi da 0,001× a 3600× (per esempio 0,3 o 12) e premi Invio; Esc mantiene la velocità attuale. L'ultima velocità viene ricordata per la visita successiva (vedi [Impostazioni salvate](ref-settings-storage.md)). |
| **Cronologia** | Cumulativo | Cosa conta come visibile alla testina: *Cumulativo*, *Finestra* o *Durata di vita* (sotto). |
| **Intervallo** (Finestra; in modalità Linee anche Durata di vita) | 30 s | Lunghezza della finestra che termina alla testina; almeno 0,01 s. In [Calore lineare](line-heat.md#playback) è la lunghezza della scia. |
| **Durata predefinita** (solo Durata di vita, non in modalità Linee) | 10 s | Per quanto tempo resta visibile un punto dato senza un campione successivo della sua persona. |
| **Dissolvenza** (solo Durata di vita, non in modalità Linee) | 0,4 | Frazione della vita di ogni punto dato spesa a svanire, 0-1. |
| **Ciclo** | attivo | Alla fine ricomincia; disattivato si ferma alla fine. |
| Lato destro | | Il nome del dataset. |

L'**intervallo** è la durata temporale del dataset - oppure, nelle [figure sovrapposte](box-replay.md) con una sessione selezionata, la durata di quella sessione.

## Cronologia {#history}

In modalità Riproduci:

- **Cumulativo** - tutto dall'inizio dell'intervallo fino alla testina. Il calore si accumula mentre scorre.
- **Finestra** - un intervallo fisso di cronologia che termina alla testina (*Intervallo*).
- **Durata di vita** - ogni punto dato vive fino al **campione successivo della stessa persona** (nella stessa sessione), così esattamente una posizione per persona è attuale in ogni istante. Un punto dato la cui persona non ricompare mai - una morte, una disconnessione, la fine del log - non ha un campione successivo e vive per la *Durata predefinita*, invece di sparire subito o restare per sempre. I punti dati **svaniscono** durante l'ultima frazione *Dissolvenza* della loro vita invece di scomparire di colpo: con un campione vivo per persona, un punto che sparisce tra un fotogramma e il successivo fa sfarfallare l'intero campo alla frequenza dei campioni. *Dissolvenza* 0 ripristina il taglio netto.

Durata di vita richiede sia una colonna di persona sia una di tempo; senza la prima, la cronologia torna a Cumulativo al caricamento. In [Calore lineare](line-heat.md#playback) la cronologia stabilisce per quanto tempo resta visibile la scia di un percorso; nelle [figure sovrapposte](box-replay.md) la *Durata predefinita* è per quanto tempo viene trattenuta una persona senza altri campioni.

## Comportamento della riproduzione {#playback-behaviour}

Dal ciclo dei fotogrammi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- La testina avanza di *tempo del fotogramma × velocità*. Il tempo del fotogramma è limitato a 0,1 s, così cambiare scheda non teletrasporta la testina.
- Premere play alla fine dell'intervallo riparte dall'inizio, come fa un lettore multimediale. A ogni caricamento la testina è posizionata all'inizio, quindi il primo play parte subito.
- Alla fine dell'intervallo la testina torna all'inizio (Ciclo attivo) oppure si ferma lì e la riproduzione finisce (Ciclo disattivo).
- Il cursore legge direttamente la testina del motore a ogni fotogramma; lo stato dell'applicazione viene aggiornato durante gli spostamenti, le partenze, gli arresti e i cicli.
- Scegliere una sessione nel selettore delle sessioni porta all'inizio di quella sessione.

## Perché la riproduzione è fluida ed economica {#why-playback-is-smooth-and-cheap}

Le righe sono memorizzate ordinate per tempo, quindi una finestra temporale sono due ricerche binarie sulla colonna del tempo: far avanzare la testina sposta due interi e non tocca alcuna riga; il costo della riproduzione segue il numero di righe nella finestra, non la dimensione del dataset.

Come il calore resta stabile mentre la finestra si muove dipende dalla cronologia ([Accumulo](accumulation.md)):

- **Cumulativo** cresce soltanto, quindi ogni fotogramma aggiunge solo le righe diventate visibili dall'ultimo, a peso pieno. Il campo cresce in modo monotono e la pausa non cambia nulla, perché non resta nulla da arrivare. (Ristimare invece farebbe illuminare a ogni fotogramma un sottoinsieme casuale diverso per poi farlo svanire, cosa che si legge come raffiche che si accendono e spariscono.)
- **Finestra** e **Durata di vita** cambiano davvero a ogni fotogramma e vengono ristimati, mescolati come media mobile esponenziale (peso 0,34 per il nuovo fotogramma), che è senza distorsione a regime e molto più quieta che ripartire da zero.
- In modalità Durata di vita le righe candidate sono quelle da *testina - max(il buco più lungo nei dati, Durata predefinita)* fino alla testina; lo shader poi scarta ogni riga la cui vita è finita e applica la dissolvenza.

Passare da Tutto a Riproduci, o cambiare la cronologia, riavvia l'accumulo.

## Tastiera {#keyboard}

| Tasto | Effetto |
|---|---|
| `K` | Riproduci / pausa |
| `J` | Riproduci all'indietro; premerlo di nuovo mette in pausa (solo Figure sovrapposte) |
| `L` | Riproduci in avanti; premerlo di nuovo mette in pausa (solo Figure sovrapposte) |

`J` e `L` portano anche la linea temporale su **Riproduci**. I tasti vengono ignorati mentre una casella di testo o un menu ha il fuoco. Nella scheda Analisi di gara, `K` pilota invece il replay di quella scheda.
