---
title: "Combattimento ravvicinato e round"
parent: "Rilevamenti"
nav_order: 2
lang: "it"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Combattimento ravvicinato e round

Per gli sparatutto a round (prima Counter-Strike, qualunque dato con round, parti e uccisioni), Rilevamenti misura come sono stati vinti i combattimenti: chi ha vinto i primi duelli e quanto valevano, se le morti sono state scambiate, se il giocatore che si sporgeva in un angolo ha battuto quello che lo teneva, se i fuochi incrociati e i flash hanno pagato, come sono cambiate le probabilità del round a ogni uccisione, e quali porte hanno ucciso i giocatori che vi entravano. Usalo per capire perché i round sono stati vinti, non solo chi ha fatto le uccisioni.

Le misure vengono dalla dottrina del combattimento in edifici e urbano (l'imbuto letale, i punti di dominio, il fuoco incrociato) e dall'analisi degli esport e dello sport (probabilità di vittoria, valore delle azioni, plus-minus corretto). Ognuna viene letta attraverso la [lente della conoscenza](knowledge.md) e citata.

## Provala {#try-it}

1. Carica una o più partite con round (una conversione CS2 ha tutto ciò che serve).
2. Apri **Rilevamenti** e premi **Trova rilevamenti**.
3. Sotto **Metriche della lente**, leggi le righe da *Probabilità di vittoria del round* a *Impatto del giocatore*; ognuna ha i suoi numeri, il suo intervallo al 95%, il suo valore q e le fonti che segue.
4. Scegli la lente **Esport** o **Urbano** per leggerle attraverso quella letteratura; **Scrivi con l'IA** le invia insieme al rapporto.

## Cosa misura {#what-it-measures}

| Misura | Cosa dice | Come |
|---|---|---|
| Probabilità di vittoria del round | Quanto era probabile che ogni parte vincesse il round in ogni momento | Regressione logistica sui giocatori vivi di ogni parte, la bomba o l'obiettivo e il suo tempo, il cronometro del round e l'acquisto, adattata ai dati caricati; calibrazione verificata fuori campione per round (punteggio di Brier e abilità, perdita logaritmica, errore di calibrazione su dieci classi, pendenza di ricalibrazione, AUC) |
| Valore delle azioni | Quanto una uccisione, una uccisione di apertura, uno scambio, una uccisione dietro un flash, un piazzamento o un flash hanno cambiato la probabilità di vittoria della parte | Probabilità di vittoria dopo meno prima; scambi, aperture e uccisioni accecate messi alla prova contro le altre uccisioni con una permutazione |
| Duelli di apertura | Quale parte vince il primo duello, quanto spesso questo vince il round, e dove una parte vince le aperture molto sopra la sua media | Intervalli di Wilson; luoghi con test binomiale esatto contro la quota della parte, q sui luoghi |
| Scambi | Morti a cui risponde l'uccisione di un compagno sul killer entro 5 s, il tempo che ha richiesto, e i round vinti quando la prima morte è stata scambiata | Test esatto di Fisher, intervallo di Newcombe |
| Chi si sporge contro chi tiene | Duelli in cui un giocatore si è mosso nel combattimento (1,5 m/s o più nell'ultimo secondo) e l'altro è stato fermo (0,75 m/s o meno): la quota di chi si sporgeva | Test binomiale esatto contro una metà |
| Mira prima del duello | La visuale di ogni giocatore rispetto alla direzione dell'altro 0,75 s prima dell'uccisione; chi mirava meglio e quante volte quel giocatore ha vinto; chi teneva sul proprio angolo (entro 15°) contro chi ne era fuori; distanze di uccisione | Test binomiale esatto; Fisher |
| Fuoco incrociato | Chi teneva con un compagno fermo entro 25 m da chi si sporgeva, la cui linea verso di lui è di 35° o più fuori dalla propria, contro chi teneva da solo | Fisher, Newcombe |
| Utilità nelle entrate | Chi si sporgeva dietro un flash della propria parte (entro 3 s e 15 m) o un fumo (entro 18 s) contro le sporgenze a secco; duelli di apertura con un flash da una sola parte; vittime accecate | Fisher, binomiale |
| Vantaggio di uomini | Per ogni stato di giocatori vivi (5v4, 4v5, 2v1...) raggiunto per primo in un round, la quota di round vinti da quello stato | Intervalli di Wilson |
| Rimonte | Round in cui una parte è rimasta con l'ultimo giocatore: vittorie contro le vittorie attese dal modello, per numero di avversari | Test normale: osservato contro atteso |
| Ammassi, rotazioni, appostamenti | Il gruppo più grande entro 10 m al duello di apertura (3 o più: ammassati); giocatori oltre 30 m dal primo combattimento o dall'obiettivo piazzato, e quanto in fretta si avvicinano entro 12 m; tempo e probabilità uccisione-morte oltre 30 m da ogni compagno | Fisher; rapporto di probabilità con l'intervallo di Woolf |
| Dopo il piazzamento e la riconquista | Round vinti dalla parte che ha piazzato, in base ai numeri al piazzamento, e la sua quota di duelli dopo il piazzamento | Intervalli di Wilson |
| Imbuti letali | Ingressi in ogni luogo (un cambio della colonna del luogo, altrimenti di una cella di 8 m) e morti entro 2,5 s dall'entrare, contro il tasso della mappa | Test binomiale esatto, q sui luoghi; rapporto ridotto con 20 ingressi al tasso della mappa |
| Impatto del giocatore | Probabilità di vittoria aggiunta per round da ogni giocatore (uccisioni, morti, piazzamenti), ridotta con l'approccio bayesiano empirico; plus-minus corretto con regressione di cresta dei risultati dei round contro la partenza del modello; valore delle uccisioni per luogo e arma, ridotto | Penalità scelta con validazione incrociata a cinque parti |

Tutti i test di una analisi condividono un unico tasso di falsi positivi
(Benjamini-Hochberg), compresi tutti i luoghi provati, non solo quelli mostrati;
il q mostrato è calcolato su tutti. Il modello e la sua calibrazione sono adattati
ai dati caricati, quindi descrivono quella popolazione: un modello professionale
giudica male il gioco casual, e viceversa.

Verificato su round sintetici con effetti inseriti (il vantaggio di chi si sporge,
fuochi incrociati, flash, un imbuto letale, una mira migliore che vince), e su 100
set di dati degli stessi round senza di essi, dove il tasso di falsi positivi dei
test con effetti inseriti deve restare al 5% nominale (entro una fascia)
(`src/insights/cqb/cqb.test.ts`); su circa mille round reali il modello ha ottenuto
un punteggio di Brier di 0,14 contro 0,25 del tasso di base, un errore di
calibrazione di 0,03 e una pendenza di ricalibrazione di 1,0.

## Dati necessari {#data-it-needs}

- le colonne **tempo**, **giocatore**, **parte** e **round** (la sessione), e uccisioni e morti nella colonna degli eventi; i round in cui nessuno muore due volte sono trattati come round di eliminazione (vantaggio di uomini, rimonte e il modello ne hanno bisogno);
- una colonna **altra parte** (`other`, `victim`, `killer`, `attacker`) che nomina la vittima in un'uccisione e il killer in una morte (senza di essa, uccisioni e morti nello stesso istante vengono accoppiati);
- una **direzione dello sguardo** per le misure di mira;
- una colonna `event` grezza che nomina `flash`, `smoke`, `he`, `molotov`, `plant` e `defuse` per utilità e piazzamenti;
- `won` (la parte della riga ha vinto il round), `place` (i nomi dei luoghi), `weapon`, `buy` e `state_flashed` dove i dati li hanno.

Le posizioni dovrebbero essere campionate più volte al secondo; velocità, mira e fuochi incrociati leggono i due secondi prima di ogni morte.

## Nella ripartizione {#in-the-breakdown}

La [ripartizione](breakdown.md) misura quattro delle situazioni come fattori, con
e senza: *accecato*, *morte scambiata*, *duello di apertura* e i numeri (*in
superiorità*, *numeri pari*, *in inferiorità*), ognuno su K/D, round vinti,
sopravvivenza e uccisioni al minuto.

## Molte partite {#many-matches}

Ogni riepilogo di partita dell'[analisi di molte partite](mass-analysis.md) di dati
con una colonna di round porta le stesse misure come conteggi (`cqb` nel
riepilogo): duelli di apertura, scambi, sporgenze, fuochi incrociati, ingressi
con flash, mira, vantaggio di uomini, piazzamenti e i 40 luoghi più frequentati
con i loro ingressi e morti. I conteggi si sommano tra le partite, quindi mille
partite danno le stesse quote di una grande analisi sola. La scheda **Combattimento
ravvicinato** del pannello le mostra come quote con i loro intervalli, su tutte le
mappe o per mappa; un clic su una riga carica le partite da cui viene.

## Per gli sviluppatori {#for-developers}

`src/insights/cqb/`: `walk.ts` (un passaggio sulle righe in ordine di tempo, round
tenuti separati, duelli registrati con il loro stato), `finish.ts` (le metriche e i
conteggi per partita), `model.ts` (regressione logistica con IRLS, calibrazione,
regressione di cresta con gradienti coniugati, approccio bayesiano empirico, Fisher,
Newcombe, test di permutazione), `run.ts` e `worker.ts` (il visualizzatore: il suo
worker, accanto al passaggio dei rilevamenti), `summary.ts` (il raccoglitore del
riepilogo di molte partite), `factors.ts` (le situazioni della ripartizione),
`shows.ts` (quello che legge la lente), `synth.ts` (i round di prova). Le voci della
conoscenza sono in `src/insights/knowledge/cqb.ts`, gli schemi in `patterns-cqb.ts`.
I risultati entrano nel rapporto come `lens.cqb`.
