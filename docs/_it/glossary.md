---
title: "Glossario"
nav_order: 21
lang: "it"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glossario

Significati brevi delle parole che usa questo sito, in linguaggio semplice. Ogni voce rimanda alla pagina che la spiega per intero.

## Dati {#data}

**Riga.** Una linea dei tuoi dati: una cosa successa in un luogo e in un momento, per esempio "il giocatore 7 era qui al secondo 12". Il visualizzatore disegna ogni riga. [Riferimento dei formati dei dati](data-formats.md)

**Colonna.** Un tipo di valore nelle righe, come x, y, z, tempo o squadra. Il visualizzatore indovina quale colonna è quale, e puoi cambiare l'ipotesi. [Mappatura delle colonne](column-mapping.md)

**CSV.** Una tabella di testo semplice: una riga per linea, valori separati da virgole. Quasi ogni programma ne sa scrivere una. [Caricamento dei file](loading-files.md)

**Parquet.** Un file tabella compatto che si legge in fretta, anche con milioni di righe. È il formato migliore da dare al visualizzatore. [Caricamento dei file](loading-files.md)

**Evento.** Qualcosa che è successo, come un colpo, un impatto, un'uccisione o un decollo. Una riga può essere un evento, oppure solo "ero qui". [Filtri](filters.md)

**Persona.** Chi ha prodotto le righe: un giocatore, un pilota, un'auto o un carro. Una persona è una linea di posizioni nel tempo. [Sessioni, persone e gruppi](sessions-persons-groups.md)

**Gruppo (squadra).** Un insieme di persone mostrato con lo stesso colore, per esempio Blu e Rosso. [Sessioni, persone e gruppi](sessions-persons-groups.md)

**Sessione (partita, round).** Una partita del gioco. Una partita o un round è una sessione. Il visualizzatore può mostrare una sessione o sovrapporne molte. [Sessioni, persone e gruppi](sessions-persons-groups.md)

**Livello.** La mappa 3D su cui sono avvenuti i dati: terreno, edifici, muri. Le righe compaiono dove sono avvenute sul livello. [Livelli e geometria di sfondo](levels.md)

## Guardare i dati {#looking-at-the-data}

**Mappa di calore.** Un'immagine in cui i luoghi toccati da molte righe brillano di più. I luoghi freddi sono tranquilli, quelli caldi sono affollati. [Calore](heat.md)

**Calore.** Quanto è successo in un punto. Il visualizzatore somma il bagliore di ogni riga in ogni luogo; la somma è il calore. [Calore](heat.md)

**Sprite.** La piccola macchia luminosa che il visualizzatore disegna per una riga. Molti sprite sovrapposti si sommano in calore. [Forma dello sprite](sprite-shape.md)

**Esposizione.** Quanto è luminosa l'immagine. Come in una macchina fotografica, troppa esposizione rende tutto bianco e troppo poca nasconde i dettagli. [Colore ed esposizione](colour-and-exposure.md)

**Saturazione.** La quantità di calore che conta come "caldo quanto arrivano i colori". Abbassala per far emergere i luoghi tranquilli; alzala per vedere solo i più caldi. [Colore ed esposizione](colour-and-exposure.md)

**Volume.** Una scatola o una forma che piazzi nella vista 3D. Il visualizzatore conta ciò che c'è dentro e può confrontare i volumi tra loro. [Volumi e confronto](volumes.md)

**Filtro.** Una regola che nasconde le righe che non vuoi, per esempio "solo uccisioni" o "solo squadra Rossa". [Filtri](filters.md)

## Replay {#replay}

**Figura.** Un piccolo modello di un carro, un aereo, un'auto o un soldato che si muove dove i dati dicono che era. [Figure](figures.md)

**LOD (livello di dettaglio).** Ogni figura ha una versione dettagliata, una più semplice e una molto semplice. Quelle vicine usano quella dettagliata e quelle lontane quella semplice, così se ne possono disegnare migliaia insieme. [Figure](figures.md)

## Gare {#racing}

**Giro.** Un percorso completo del circuito, dalla linea di partenza di nuovo alla linea. [Caricamento dei giri](race-loading-laps.md)

**Giro di riferimento.** Il giro con cui si confrontano tutti gli altri. Le differenze si mostrano come "più veloce" o "più lento" di esso. [Caricamento dei giri](race-loading-laps.md)

**Apice.** Il punto di una curva in cui l'auto è più vicina al bordo interno. [Analisi curva per curva](race-corner-analysis.md)

**Slittamento.** Quanto scivola un pneumatico. Un po' di slittamento dà la massima aderenza; troppo, e l'auto derapa. [Analisi delle gare: il metodo](race-analytics.md)

**Inviluppo.** Ciò che un'auto può fare a ogni velocità: quanto forte può sterzare, frenare e accelerare prima di scivolare. [Analisi delle gare: il metodo](race-analytics.md)

## Numeri degli aerei {#aircraft-numbers}

**ALT.** Altitudine: l'altezza sopra il suolo o il livello del mare. [Replay della partita](match-replay.md#labels-and-statistics)

**TAS.** Velocità vera rispetto all'aria: quanto veloce si muove un aereo attraverso l'aria. [Replay della partita](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** La scheda o il chip grafico. Disegna l'immagine ed è molto più veloce del processore principale nel disegnare milioni di macchie. [I due backend](backends.md)

**WebGPU / WebGL2.** I due modi in cui un browser permette a una pagina di usare la GPU. WebGPU è più recente. Il visualizzatore può usarne entrambi e sceglie il migliore che il tuo browser ha. [I due backend](backends.md)

## Parole di Counter-Strike {#counter-strike-words}

**Round.** Un breve combattimento dentro una partita. Un lato lo vince, e il punteggio sale di uno.

**Eco, acquisto forzato, acquisto completo.** Quanto denaro spende una squadra in armi all'inizio di un round. Un eco risparmia denaro e compra quasi nulla (meno di 1.500 $ a giocatore in media). Un acquisto forzato spende ciò che ha (meno di 4.000 $). Un acquisto completo compra tutto ciò che può. [Analisi della partita (CS2)](match-analysis.md)

**Scambio.** Un'uccisione che ripaga un'uccisione: ti sparano, e un compagno spara al tuo assassino entro 5 secondi. [Analisi della partita (CS2)](match-analysis.md)

**KAST.** La quota di round in cui un giocatore ha ottenuto un'uccisione, un assist, è sopravvissuto o è stato scambiato. Un numero più alto significa che il giocatore ha aiutato in più round. [Analisi della partita (CS2)](match-analysis.md)

**ADR.** Danno medio per round: quanta salute un giocatore ha tolto ai nemici in ogni round. [Analisi della partita (CS2)](match-analysis.md)
