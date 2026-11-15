---
title: "Comportamento collettivo"
parent: "Rilevamenti"
nav_order: 3
lang: "it"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Comportamento collettivo: folle, stormi, mandrie e decisioni sotto pressione

I giocatori di una partita si comportano come le persone ovunque: si stringono alle porte, seguono chi è passato per primo, restano uniti o si sfilacciano, si ritirano dopo perdite pesanti, rischiano di più dopo una brutta vita. Le **metriche della lente del comportamento** misurano questi schemi con i metodi della scienza delle folle, della fisica del moto collettivo, dell'economia comportamentale e della psicologia militare, ognuno confrontato con il proprio modello nullo, e li leggono attraverso le voci corrispondenti della [base di conoscenza](knowledge.md).

## Provalo {#try-it}

1. Carica una o più partite con tempo, posizioni e squadre.
2. Apri **Rilevamenti** ed eseguilo.
3. Espandi **Metriche della lente**: le misure del comportamento sono elencate con le altre
   (Allineamento collettivo, Mandria sulla rotta, Corsie e tracce, Affollamento, Guide e seguaci,
   Coesione e ritardatari, Punto di rottura, Rischio dopo le perdite, Serie, Accordo sugli acquisti,
   Soppressione), ciascuna con i suoi numeri, il suo test e la letteratura che la spiega.
4. Il **Resoconto** le cita; **Scrivi con l'IA** le invia insieme al rapporto.

## Le misure {#the-measures}

Le traiettorie vengono ricampionate a un punto ogni 2 s (la posizione alla fine del
intervallo e la velocità su di esso). Le distanze vengono scalate con la spaziatura
tipica dei dati stessi - la distanza mediana di un'unità dal compagno più vicino - così la
stessa misura funziona per la fanteria, i carri e gli aerei.

| Misura | Cosa misura | Modello nullo e test | Conoscenza |
|---|---|---|---|
| Allineamento collettivo | Polarizzazione (lunghezza della direzione media delle unità) delle unità in movimento di ciascuna parte ogni 2 s, il vorticare (rotazione attorno al baricentro), le quote di tempo polarizzato, in vorticare e sciamare, per fase della partita; negli scontri tra due parti allineate, la quota di uccisioni della parte più allineata | La traiettoria di ogni unità spostata nel tempo all'interno della partita (conserva il suo percorso, rompe la simultaneità); test di inversione del segno su finestre di 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Mandria sulla rotta | Quanto spesso un'unità lascia un luogo nel modo in cui lo ha fatto il compagno precedente (entro 30 s), per lo stesso modo di entrare, rispetto alle quote di uscita del luogo stesso - e rispetto al copiare un passaggio precedente del nemico | Uscite mescolate all'interno del luogo e dell'ingresso; l'effetto è compagni meno copiatura dal nemico (problema della riflessione di Manski: copiare e un piano condiviso dalla parte sembrano uguali) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Corsie e tracce | Segregazione laterale delle due direzioni nei luoghi con flusso contrario; quota del movimento sul 10% del terreno più frequentato, il suo Gini e la sovrapposizione del terreno più frequentato delle partite | Direzioni mescolate tra le visite intere; due griglie sfasate di mezzo luogo, ciascuna testata, Bonferroni | Helbing et al. 1997, 2005 |
| Affollamento | Velocità (relativa al passo proprio dell'unità) e flusso per numero di vicini entro il doppio della spaziatura tipica, il calo di capacità nella classe più densa, sul terreno più frequentato; morti all'ora nelle folle; colpi al minuto dei compagni vicini (pigrizia sociale) | Correlazione velocità-densità propria di ogni unità, inversione del segno tra le unità, effetto minimo ρ oltre ±0,05; test esatti sui tassi | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Guide e seguaci | Per i compagni che viaggiano insieme, il ritardo temporale (fino a 8 s) al quale la direzione di uno prevede meglio quella dell'altro; grafo delle guide, transitività delle triadi, tassi di morte e di uccisione delle guide | Coppie con una traccia spostata nel tempo danno la soglia del 95%; test binomiale contro il 5% | Nagy et al. 2010, Couzin et al. 2005 |
| Coesione e ritardatari | Tempo passato oltre tre volte la spaziatura tipica della parte dal compagno più vicino; tasso di morte lì rispetto al gruppo; la spaziatura di una parte rispetto alla sua quota di uccisioni di uno scontro | Test condizionale esatto di due tassi di Poisson | Shils e Janowitz 1948, Siebold 2007 |
| Punto di rottura | Velocità di avvicinamento al nemico (al passo della parte) per quota della parte persa nell'ultimo minuto; il livello di perdite più basso al quale le parti si ritirano | Bootstrap a grappoli unilaterale contro un ritiro di un decimo del passo (le perdite arrivano dove le parti si incontrano, e le parti che si incontrano smettono di avvicinarsi), Bonferroni sui livelli | Dupuy 1987, Rowland 2006 |
| Rischio dopo le perdite | Quota della vita successiva passata davanti alla propria parte verso il nemico, sopra la quota della parte stessa e di altre unità che rientrano in quel momento: dopo una vita persa senza uccisione rispetto a dopo una con uccisione; morte precoce dopo morte precoce (tilt) | Vite di ogni unità mescolate (la prima vita conservata), così il bias della sequenza finita è nel modello nullo | Kahneman e Tversky 1979, Thaler e Johnson 1990 |
| Serie | P(uccisione dopo k uccisioni) − P(uccisione dopo k morti), k = 1..3 | La sequenza di ogni giocatore mescolata 1.000 volte: si sottrae il bias mostrato da Miller e Sanjurjo; Bonferroni su k | Gilovich et al. 1985, Miller e Sanjurjo 2018 |
| Accordo sugli acquisti | κ di Fleiss delle fasce di equipaggiamento (eco, forza, pieno; tertili fuori da Counter-Strike) all'interno del round di una parte | Round-giocatore della parte mescolati tra i suoi round | Fleiss 1971 |
| Soppressione | Velocità nei 4 s dopo un danno non letale rispetto ai 4 s prima, e colpi nei 10 s dopo rispetto a prima, sui colpi e nei momenti tranquilli della stessa unità | Inversione del segno tra le unità, effetti minimi 0,05 del passo e un colpo al minuto | Rowland 2006 |

Ogni p-value del rapporto passa per il tasso di falsa scoperta di Benjamini-Hochberg (`q`). Una misura viene esclusa quando i dati non la possono sostenere:
servono round e valori di equipaggiamento per l'accordo sugli acquisti, eventi di danno per la soppressione,
uccisioni e morti attribuite alle unità per serie e rischio.

## Nell'analisi di massa {#in-the-mass-analysis}

Ogni riepilogo di partita (`<match>.summary.json`, vedi [Analisi di massa](mass-analysis.md))
porta le stesse misure per quella partita nella sua sezione `behaviour`, così migliaia di partite
si possono confrontare senza rileggerne di nuovo le righe.

## Quanto funziona bene {#how-well-it-works}

Su battaglie simulate con ogni effetto incorporato, e sugli stessi mondi senza
(`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): ogni misura trova l'effetto
inserito, e i mondi nulli restano sotto la soglia di falsa scoperta. Il rischio dopo le perdite ha la potenza minore; la mandria sulla rotta non sa distinguere la copiatura da un piano condiviso (una parte che condivide un unico obiettivo risulta "mandria" con questa misura).

## Per gli sviluppatori {#for-developers}

- `src/insights/behaviour/acc.ts` - l'accumulatore (tracce ricampionate, eventi,
  round) e `finish`; `motion.ts` e `choice.ts` le misure;
  `bstats.ts` gli helper di permutazione, bootstrap e kappa; `shows.ts` gli schemi e le frasi
  che la lente legge (`lens.<measure>`).
- `feed.ts` lo alimenta dai blocchi del worker degli approfondimenti; `summaryTap.ts` da un
  riepilogo di partita mentre trasmette la tabella.
- Conoscenza: `src/insights/knowledge/behaviour.ts` (voci),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (riferimenti, ciascuno verificato
  contro il suo record Crossref o Open Library).
- Etichette: `lens.metric.<measure>` in `locales/*/lens.json`.
