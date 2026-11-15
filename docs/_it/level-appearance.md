---
title: "Aspetto del livello"
parent: "Livelli e geometria di sfondo"
nav_order: 3
lang: "it"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Aspetto del livello

Questi comandi cambiano l'aspetto di un livello 3D, così il calore risalta su di esso e il luogo resta leggibile. Niente qui cambia i dati.

## Avvio rapido {#quick-start}

1. Carica un livello 3D ([Livelli 3D](model-levels.md)).
2. In **Sfondo / livello** abbassa **Luminosità** finché il calore è la cosa più luminosa sullo schermo.
3. Apri **Rilievo del terreno** e alza **Ombreggiatura della pendenza** o **Intensità delle curve** finché distingui una collina da una pianura.
4. Apri **Strutture**. Abbassa **Opacità delle facce** per vedere dentro gli edifici, oppure attiva **Texture delle strutture** per vederli pieni.
5. Se sul terreno c'è un'immagine dipinta, prova **Texture del terreno** spenta e accesa.

![Le sezioni Rilievo del terreno e Strutture aperte, con il livello mostrato con gli indizi di rilievo](../assets/img/en/level-appearance-sections.webp)

Con un [livello 3D](model-levels.md) caricato, il pannello Sfondo / livello mostra questi comandi. I predefiniti sono quelli che riceve un livello appena importato ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Cambiarli ridisegna soltanto la scena; l'accumulo del calore viene conservato.

## L'intero livello {#the-whole-level}

| Comando | Predefinito | Intervallo | Significato |
|---|---|---|---|
| **Opacità** | 100% | 0-100% | Sotto il 100% il livello viene miscelato e non scrive la profondità, quindi non [occlude](depth-and-culling.md) più il calore. |
| **Luminosità** | 0,9 | 0-2 (rotella 64) | |

Il livello viene disegnato desaturato - terreno grigio, un guscio tinto - così il calore è l'unica cosa satura sullo schermo. A differenza di una [immagine di mappa](map-images.md), un livello 3D non ha un cursore Desatura.

## Rilievo del terreno {#ground-relief}

Da lontano una collina e una pianura appaiono dello stesso grigio, quindi il visualizzatore aggiunge tre indizi. Ciascuno risponde a un problema diverso:

| Comando | Predefinito | Significato |
|---|---|---|
| **Spaziatura delle curve** | dall'intervallo di altezze del terreno | Altezza tra le curve di livello, logaritmica da 1/4000 a 1/2 dell'intervallo di altezze del livello; il minimo della corsa è *spento*. Il predefinito è 1/40 dell'intervallo di altezze del terreno arrotondato a un passo 1/2/5 - linee da 10 m vanno bene per un pendio e sono inutili sul fondo di una cava. Ogni 5ª linea viene disegnata più marcata. Le curve sono disegnate nello spazio dello schermo, quindi restano larghe un pixel a qualsiasi zoom, ed è l'unico indizio che sopravvive a un terreno troppo poco inclinato per essere ombreggiato. |
| **Intensità delle curve** | 35% | 0-100% |
| **Ombreggiatura della pendenza** | 55% | Scurisce in base alla ripidità, così argini e scogliere si leggono da qualsiasi angolo di telecamera - a differenza di una luce, che si appiattisce ogni volta che la guardi di fronte. |
| **Rampa di altitudine** | 50% | Terreno basso più scuro, terreno alto più chiaro, lungo l'intervallo di altezze del terreno: la forma su grande scala. |

L'intestazione della sezione mostra lo stato delle curve: *ogni N m*, la spaziatura delle curve, oppure *nessuna curva* quando la spaziatura è spenta.

## Superficie del terreno {#ground-surface}

| Comando | Predefinito | Mostrato quando | Significato |
|---|---|---|---|
| **Acqua** | attiva | il livello ha acqua | Laghi, fiumi e mare, disegnati piatti in un grigio-azzurro pallido: nessuno degli indizi del terreno si applica a una superficie che è piana per definizione. |
| **Opacità dell'acqua** | 60% | l'acqua è attiva | La linea di costa e il terreno sotto i bassifondi si vedono attraverso l'acqua traslucida. |
| **Triangoli del terreno** | 30% (0 per un livello con texture) | sempre | I bordi stessi del terreno disegnati sopra la superficie ombreggiata, che svaniscono tra il 6% e il 25% della larghezza del livello dalla telecamera. Mostra quanto grossolanamente è stato campionato il terreno e dà a una pendenza qualcosa su cui giudicare la distanza. Costruiti al primo uso, il che richiede un momento su un livello grande. |
| **Terreno solo in wireframe** | spento | sempre | Sostituisce la superficie del terreno con i suoi bordi. Del tutto schematico - rinuncia anche all'ombreggiatura, alle curve e all'occlusione, quindi *Triangoli del terreno* è di solito la scelta migliore. |
| **Texture del terreno** | attiva | il livello ha texture | Disegna il terreno nelle texture che il file contiene (asfalto, margine, erba). L'illuminazione della mesh viene applicata con delicatezza sopra, perché la texture porta già il suo rilievo fine. **Luminosità** è il modo per attenuarla sotto il calore; Desatura appartiene alle immagini di mappa. |
| **Colore acquisito** | spento | il livello ha colori dei vertici | Ombreggia il terreno con il colore che una scansione ha catturato invece del grigio - una strada ricostruita altrimenti non si distingue dal margine. Gli export dei motori non ne hanno; quando mancano il pannello dice *Questo livello non ha colore.* |

## Strutture {#structures}

L'intestazione **Strutture** mostra il numero di triangoli delle strutture; il suggerimento sotto dice come vengono disegnate (*disegnate piene nelle loro texture* oppure *disegnate come un guscio trasparente così vedi il calore al loro interno*) e quante parti sono strutture.

| Comando | Predefinito | Significato |
|---|---|---|
| **Texture delle strutture** | attiva quando le strutture hanno texture | Disegna le strutture piene, nelle loro texture. Attivandolo, l'opacità delle facce va al 100% e i bordi si spengono; disattivandolo si torna al guscio tinto e trasparente al 25%. Una struttura con texture è illuminata dal lato che vede la telecamera, perché un cartello è due facce schiena contro schiena, e quale vince il test di profondità dipende dagli arrotondamenti. |
| **Spigoli in wireframe** | attivi; spenti sopra 300.000 triangoli di struttura o quando hanno texture | Spigoli delle strutture senza duplicati, una linea per spigolo. |
| **Opacità degli spigoli** | 50% | |
| **Facce del guscio** | attive | Una superficie tenue con un bordo Fresnel luminoso, così un edificio si legge come un volume invece che come una gabbia o una nebbia. |
| **Opacità delle facce** | 25% (35% sopra 300.000 triangoli di struttura, 100% con texture) | 0-60% sul binario, fino al 100% con la maniglia. Tienila bassa: le strutture piene nascondono i dati al loro interno. |
| **Spigoli vivi** | attivi (spenti con texture) | Ombreggia ogni triangolo con la sua normale, calcolata nello shader del frammento dalle derivate nello spazio dello schermo. I livelli esportati sono saldati e portano normali mediate, che arrotondano ogni spigolo di una scatola in una "lamina fusa"; dividere ogni vertice per correggerlo moltiplicherebbe il buffer dei vertici. Spegnilo per un livello le cui superfici curve contano più dei suoi spigoli. |
| **Tinta delle strutture** | Ciano | Un selettore colori e i predefiniti **Ciano**, **Ambra**, **Viola**, **Bianco**. |
| **Mostra la classificazione delle parti (N)** | | Ogni parte, la sua classe e il motivo; vedi [Livelli 3D](model-levels.md#ground-structures-and-water). |

## Tagliare il livello {#cutting-the-level}

La [Sezione](slice.md) e, con *Taglia anche il livello*, il [culling per distanza](depth-and-culling.md#distance-culling) tagliano terreno, strutture e acqua agli stessi piani del calore.
