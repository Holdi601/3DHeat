---
title: "Accumulo"
parent: "Dettagli del rendering"
nav_order: 2
lang: "it"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Accumulo

Quando il visualizzatore non riesce a disegnare ogni puntino in un solo fotogramma, ne disegna una parte, poi un'altra, e somma le immagini mentre sei fermo. L'immagine diventa più nitida, come una foto che si sviluppa. Spostare la telecamera ricomincia da capo. La riga **Copertura** della sovrapposizione delle statistiche mostra a che punto è.

![La sovrapposizione delle statistiche: Copertura mostra una percentuale mentre l'immagine si sviluppa e *esatta* quando è completa](../assets/img/en/performance-stats-overlay.webp)

## Per gli sviluppatori {#for-developers}

Quando un fotogramma non può disegnare ogni riga, ne disegna un campione e lo pesa; l'immagine è allora una stima senza distorsione ma rumorosa. L'**accumulo** unisce i fotogrammi successivi così la stima converge alla risposta esatta finché nulla cambia. Ogni fotogramma sceglie una di cinque modalità ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); l'ultima usata si trova in `engine.live.accumMode`.

| Modalità | Quando | Cosa succede all'accumulatore |
|---|---|---|
| **reset** | la telecamera si è mossa, qualcosa che cambia il campo è cambiato, l'affinamento progressivo è spento, una finestra crescente sta iniziando (primo fotogramma della riproduzione, dopo un salto), oppure le linee di calore in riproduzione si sono spostate | Sostituito dalla stima di questo fotogramma. |
| **extend** | una finestra **Cumulativa** che dall'ultimo fotogramma è solo cresciuta | Questo fotogramma disegna solo le righe appena diventate visibili, a peso pieno, e le aggiunge. Nulla decade. |
| **ema** | una finestra scorrevole (**Finestra**, **Durata di vita**) si è spostata | `acc = acc × (1 - 0,34) + frame × 0,34` - una media mobile esponenziale di circa tre fotogrammi. |
| **mean** | nulla è cambiato e la stima non è completa | `acc = acc × (1 - 1/n) + frame × 1/n` all'*n*-esimo fotogramma: una media progressiva. |
| **skip** (inattivo) | convergenza raggiunta e nulla è cambiato | Nulla viene disegnato; il fotogramma ricompone soltanto. |

### Perché ciascuna {#why-each}

- **Media progressiva, non somma.** Scalare il buffer per 1 - 1/n e aggiungere 1/n del nuovo fotogramma è algebricamente la stessa cosa che sommare e dividere per *n* alla fine, ma il buffer contiene sempre la quantità di un solo campo. Una somma raggiunge *n* volte il campo, e su un target a 16 bit satura a 65.504; con un divisore che continua a crescere, una vista ferma sbiadirebbe tanto più quanto più a lungo resta ferma - mentre una telecamera in movimento, che si azzera a ogni fotogramma, sembra perfettamente corretta. La suite di test verifica che 16 fotogrammi uniti contengano 1,00× quello che contiene un fotogramma.
- **Extend per la riproduzione cumulativa.** Le righe già accumulate restano visibili, quindi un fotogramma ha bisogno solo della frazione di secondo appena arrivata - che sta in un fotogramma, quindi entra esatta. Stimare di nuovo accenderebbe ogni volta un sottoinsieme casuale diverso e lo farebbe sbiadire, leggendosi come raffiche che si accendono e spariscono, e un fotogramma in pausa continuerebbe a riempirsi. La suite verifica che il totale salga in modo monotono durante la riproduzione e resti entro lo 0,02% per 2,5 s in pausa.
- **Media mobile per le finestre scorrevoli.** Quelle cambiano davvero a ogni fotogramma. Un peso di miscela fisso segue la finestra mobile (una media su tutti i fotogrammi dall'inizio della riproduzione sarebbe in ritardo rispetto alla testina) ed è molto più quieta che ricominciare da capo.
- **Reset per le linee in riproduzione.** Le testine delle linee di calore si muovono a ogni fotogramma; una media mobile le sfumerebbe ciascuna in una striscia, quindi ogni fotogramma viene disegnato intero e la dissolvenza della coda è quella dell'immagine stessa.
- **I fotogrammi parziali passano da un target di appoggio.** Un fotogramma unito a una frazione del peso pieno viene spruzzato in un target separato partendo da zero e poi miscelato nell'accumulatore, invece di essere spruzzato direttamente con peso 1/n. Direttamente, ogni sprite verrebbe aggiunto a 1/n della dimensione del totale a cui si unisce, cosa che un target half-float arrotonda via - peggio dove è più denso ([Accumulo half-float](half-float-accumulation.md)).

### Convergenza {#convergence}

Il piano di ogni fotogramma sa quante righe candidate ci sono e quante ne invia, quindi il numero di fotogrammi necessari per coprire ogni riga è ⌈candidati / inviati⌉. Una volta uniti tanti fotogrammi, la vista è **convergente**: la riga *Copertura* della sovrapposizione delle statistiche passa da una percentuale a *esatta*, e i fotogrammi successivi restano inattivi. Con **Disegna ogni riga a ogni fotogramma** attivo (predefinito) un solo fotogramma di solito copre tutto, quindi la convergenza è immediata, e il meccanismo progressivo serve solo quando la finestra contiene più righe di quante ne possa portare un unico piano di disegno (circa 67 milioni).

### Cosa lo fa ripartire {#what-restarts-it}

Le impostazioni si dividono in tre gruppi, a seconda di cosa significa ancora il buffer accumulato dopo che cambiano:

| Gruppo | Cambiano | Effetto |
|---|---|---|
| **Geometria** - quali righe contribuiscono e quanto | modalità di vista; percorsi delle linee; raggio dello sprite, intensità al centro e al bordo, attenuazione, rampa morbida, la curva, limiti in pixel, appiattimento; culling per distanza vicino, lontano e planare; occlusione e nascondi dietro il terreno; la sezione; dimensione del canvas; risoluzione del calore; visibilità e segni dei gruppi; la divisione di differenza; Tutto / Riproduci; la storia; i filtri di colonna e la selezione Entità; il guadagno half-float | Reset. |
| **Finestra** - l'intervallo di tempo | la testina che si sposta; la durata di vita di riserva e la sua dissolvenza | Extend (cumulativa) o media mobile (scorrevole). |
| **Composizione** - solo la colorazione | saturazione, risposta alla densità, calore minimo, le rampe di colori; il taglio del livello; griglia e assi; impostazioni del replay a scatola e sessione; profondità di campo | Ridisegna senza toccare il calore. |

Uno spostamento della telecamera azzera sempre. Quindi trascinare la saturazione o la rampa è gratuito; trascinare il raggio dello sprite riavvia la convergenza a ogni passo.
