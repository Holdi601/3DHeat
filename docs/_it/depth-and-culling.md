---
title: "Profondità e culling"
parent: "Modalità di calore"
nav_order: 4
lang: "it"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Profondità e culling

La profondità fa sì che colline e muri nascondano il calore dietro di sé, come un muro vero nasconde una persona. Il culling per distanza mantiene solo il calore tra una distanza vicina e una lontana dalla telecamera.

![Una telecamera bassa dietro una collina, con Nascondi dietro il terreno spento (a sinistra) e acceso (a destra)](../assets/img/en/depth-and-culling-terrain.webp)

![Culling per distanza con Lontano a 400 m e Taglia anche il livello attivo: una fetta della mappa intorno alla telecamera](../assets/img/en/depth-and-culling-far.webp)

Senza profondità, una mappa di calore su un [livello](levels.md) 3D è una sovrapposizione piatta: tutto ciò che il dataset contiene brilla attraverso ogni muro con piena intensità, gli indizi di profondità che il livello fornisce vengono annullati, e un punto caldo dentro un edificio sembra uguale a uno sul tetto. La sezione **Profondità** fa sì che il livello nasconda ciò che sta dietro; **Culling per distanza** limita il calore a un guscio o una lastra intorno alla telecamera; la [Sezione](slice.md) taglia una lastra dal mondo. Tutti e tre si applicano alle modalità di calore e cambiano quali righe contribuiscono, quindi cambiarli riavvia l'accumulo.

## Profondità {#depth}

Entrambi i comandi richiedono un [livello](levels.md) - un'immagine di mappa o un modello 3D. Senza un livello caricato non c'è niente dietro cui nascondersi, e non fanno nulla. Entrambi sono spenti mentre [Appiattisci sul piano del terreno](sprite-shape.md#flatten-onto-ground-plane) è attivo.

### Nascondi dietro il terreno {#hide-behind-terrain}

**Nascondi dietro il terreno** (predefinito attivo): un punto dati la cui superficie più vicina verso la telecamera è il *terreno* (non una struttura) viene scartato del tutto, non solo attenuato.

Terreno e muri sono opachi in modi diversi. Guardi *attraverso* un muro di proposito, per vedere a quale piano passava il traffico; non vuoi mai guardare attraverso una collina, perché dietro c'è il lato lontano della mappa - che, su una mappa larga chilometri, è la maggior parte dei dati, e si somma lungo l'orizzonte in una fascia più luminosa di qualsiasi cosa in primo piano. Un solo attenuatore non può servire entrambi, quindi il terreno ottiene una soglia di taglio e i muri mantengono l'attenuazione più sotto.

### Nascosto dietro la geometria {#hidden-behind-geometry}

**Nascosto dietro la geometria** (predefinito 0,8): quanto fortemente viene soppresso un punto dati dietro la geometria del livello. Il valore si legge *si vede attraverso* a 0, *N% più scuro* nel mezzo (la posizione del cursore, non l'attenuazione misurata), *nascosto del tutto* a 1.

Ogni muro o pavimento tra un punto e la telecamera lo scurisce ulteriormente: un muro lascia qualche per cento con il valore predefinito, e ogni superficie in più dimezza ciò che resta, fino a quattro superfici. A 1 non viene disegnato nulla dietro la geometria, ed è l'impostazione più economica.

Vedi anche [Aspetto del livello](level-appearance.md).

## Culling per distanza {#distance-culling}

**Culling per distanza** (chiuso di default) limita il calore alle righe comprese tra un limite vicino e uno lontano dalla telecamera. Imposta un limite lontano per leggere la densità dentro un edificio senza che il lato lontano della mappa si sommi sopra; imposta un limite vicino per volare *attraverso* un punto caldo invece che contro di esso.

| Controllo | Predefinito | Intervallo (rotella) | Significato |
|---|---|---|---|
| **Vicino** | spento | 0,5-5000 m, logaritmico, il 5% più basso della corsa = spento (200.000) | Le righe più vicine di questo vengono saltate. |
| **Lontano** | spento | 1-200.000 m, logaritmico, in basso = spento (10.000.000) | Le righe più lontane di questo vengono saltate. |
| **Taglia su un piano** | attivo | | Misura i limiti lungo l'asse di vista invece che dall'occhio, così il taglio è un piano parallelo allo schermo invece di una sfera intorno a te. Il bordo di una sfera si incurva attraverso il fotogramma e scivola ogni volta che ruoti; un piano resta dove l'hai messo. |
| **Taglia anche il livello** | attivo | | Taglia anche il terreno, le strutture e l'acqua agli stessi limiti. Con il livello lasciato intero, il taglio rimuove i punti dati e lascia l'edificio in piedi davanti a loro; con entrambi tagliati, è una sezione attraverso la mappa e i punti stanno appoggiati ai loro muri e pavimenti. Questo comando ridisegna soltanto; non riavvia l'accumulo. |

### Tastiera {#keyboard}

Il limite lontano è un comando che si scorre - lo fai camminare attraverso un edificio e guardi a quale piano appare il traffico - quindi è sulla tastiera mentre voli ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tasto | Effetto |
|---|---|
| `]` | Spinge il limite lontano fuori di un fattore 1,12 (Maiusc: 1,35) |
| `[` | Lo tira dentro dello stesso fattore |
| `\` | Spegne il limite lontano, o lo riaccende alla distanza a cui era stato lasciato (6000 la prima volta) |

I passi sono geometrici perché l'intervallo utile copre quattro ordini di grandezza, da una stanza a una mappa. La tastiera mantiene il limite lontano tra 100 e 400.000. I tasti non fanno nulla mentre una casella di testo o un menu ha il fuoco.

## Per gli sviluppatori {#for-developers}

### Nascondi dietro il terreno {#hide-behind-terrain}

Le strutture vengono disegnate in una texture di profondità propria. Un frammento che sta dietro la profondità della scena ma *non* dietro la profondità delle strutture sta dietro il terreno, e viene scartato. Costa un passaggio di profondità sulle strutture, saltato quando l'interruttore è spento.

### Nascosto dietro la geometria {#hidden-behind-geometry}

Viene contato **per superficie**. Un singolo confronto di profondità può dire solo "c'è qualcosa davanti", quindi un punto dietro un muro e un punto quattro stanze dentro un edificio verrebbero scuriti allo stesso modo, e l'interno si leggerebbe come una macchia unica e fioca. Invece la geometria delle strutture viene **sbucciata in profondità** in fino a 3 strati aggiuntivi ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): ogni frammento conta quante superfici ha davanti (la profondità propria della scena più gli strati sbucciati: fino a quattro), e l'attenuazione si compone:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Cursore | 1 superficie | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (predefinito) | 4% | 2% | 1% | 0,6% (minimo) |
| 1,0 | non disegnato | non disegnato | non disegnato | non disegnato |

Perché due fattori: il cursore è calibrato in modo che un muro lasci qualche per cento - l'aspetto che si legge come "dietro qualcosa" - e qualche per cento composto diventerebbe nulla al terzo muro; dimezzare a ogni superficie in più mantiene quattro passi distinguibili. Perché al quadrato: in modo lineare un campo saturo restava saturo dietro un muro; alla quarta potenza cancellava tutto a 0,8. Perché un minimo: nascondere completamente il calore occluso fa sembrare una stanza piena di traffico nascosto una stanza vuota, senza nulla che suggerisca di ricorrere alla [Sezione](slice.md). Solo un cursore fissato a 1 lo nasconde del tutto - ed è l'impostazione più economica, perché i punti occlusi vengono scartati.

Come ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), gli shader di calore a punti): il confronto avviene per frammento, contro la texture di profondità della scena, in **profondità di finestra** invece che in distanza nel mondo. Un fetch della texture di profondità nello stadio dei vertici legge "lontano" ovunque su alcuni driver (il rasterizzatore software di ANGLE tra questi), e linearizzare entrambe le profondità in metri perde la separazione per precisione con un intervallo vicino/lontano ampio. Il bias è un raggio di sprite convertito in unità di finestra più pochi bit meno significativi, così un punto dati appoggiato su una superficie non si fa ombra da solo.

Le strutture vengono disegnate traslucide, ma vengono disegnate nella profondità che l'occlusione legge; un livello le cui strutture non raggiungessero la texture di profondità si occluderebbe solo contro il terreno.

### Culling per distanza {#distance-culling}

Entrambi i limiti vengono valutati nello shader dei vertici, quindi una riga tagliata costa un vertice e nessun frammento.
