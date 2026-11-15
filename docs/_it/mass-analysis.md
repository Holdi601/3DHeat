---
title: "Analisi di massa"
nav_order: 8
lang: "it"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: false
---


# Analisi di massa: migliaia di partite insieme

L’**Analisi di massa** ti mostra a cosa si sommano un’intera cartella di partite: quale veicolo vince di più, quale lato è avvantaggiato, dove si svolge l’azione. Usala quando hai molte più partite di quante ne potresti guardare.

Lavora su un piccolo riepilogo di ogni partita, quindi mille o diecimila partite si aprono in fretta. Carica le righe complete solo per le partite su cui clicchi.

## Provala {#try-it}

1. Apri **Analisi di massa** nella barra laterale della Mappa di calore.
2. Premi **Cartella...** (oppure **File...**) e scegli le tue partite `.3dheat`.
3. Attendi mentre il pannello legge i riepiloghi («Riepiloghi... n di N»).
4. Premi **Apri analisi**. Si apre una finestra con le schede.
5. Imposta i filtri (Gioco, Mappa, Modalità, Da, A), poi leggi una scheda, per esempio Bilanciamento.
6. Clicca una riga, una cella o un rilevamento: le sue partite si caricano nella vista 3D, con la telecamera sul luogo.

![La scheda Bilanciamento: tasso di vittoria e uccisioni per morte per veicolo](../assets/img/en/mass-balance.webp)

```
cartella di .3dheat -> riepiloghi -> finestra (schede) -> clic su una riga -> partite aperte in 3D
```

Un file `.3dheat` è una partita ([Una partita in un file](container.md)). Un *heatmap* e una *riga* sono spiegati nel [glossario](glossary.md).

## Ottenere i riepiloghi {#getting-the-summaries}

Per la maggior parte delle persone non c’è nulla da fare: il pannello calcola da sé i riepiloghi mancanti. Per preparare una cartella grande una volta sola, usa lo strumento offline qui sotto.

Ogni partita `.3dheat` riceve un riepilogo (`src/mass/summarize.ts`), conservato nel
contenitore come membro `<partita>.summary.json` (ruolo `summary`, vedi
[Una partita in un file](container.md)). Lo strumento offline li scrive, e un
indice per cartella. È uno strumento per sviluppatori; eseguilo su una cartella grande per risparmiare il lavoro al pannello:

```
node tools/3dheat-summarize.mjs <cartella>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Una partita già riassunta (stessa versione del formato) viene solo letta; `--force`
  la ricalcola. `--no-write` lascia intatti i contenitori.
- Un file cambiato negli ultimi `--settle` minuti (10) viene escluso: un convertitore
  potrebbe stare ancora scrivendolo.
- `<cartella>/3dheat-index.jsonl.gz`: una riga per partita – il suo percorso, dimensione, tempo
  e riepilogo senza la griglia. `<cartella>/3dheat-index.grids.jsonl.gz`: una riga per partita
  con la sua griglia.
- Eseguilo sulla macchina che contiene i file, a bassa priorità (per esempio `nice -n 19 ionice -c3` su Linux).

Il pannello prende, per ogni partita, il primo disponibile tra: la riga dell’indice della cartella (stesso
percorso e dimensione), la cache del browser (IndexedDB, per nome, dimensione e tempo),
il membro `summary` del contenitore, oppure un riepilogo calcolato in un gruppo di worker e messo in cache.
Quindi anche una cartella senza indice funziona – la prima volta alla velocità della lettura delle tabelle, poi dalla cache.

## Il pannello {#the-panel}

Scegli una cartella (o dei file; **Aggiungi cartella...** ne aggiunge un’altra). La finestra ha i filtri **Gioco**, **Mappa**, **Modalità**, **Da** e **A**, una scelta **Suddividi per**, **Meno vite** e **Solo giocatori**, e queste schede. Ogni numero viene dai riepiloghi, e un clic su una riga, una cella o un rilevamento carica le sue partite nella vista come sovrapposizione di molte partite, con i filtri che le mostrano (veicolo, classe, arma, squadra, giocatore) e la telecamera sul luogo:

| Scheda | Cosa |
|---|---|
| Panoramica | partite, ore, giocatori, vite, righe, date; partite al giorno; per gioco, mappa, modalità; totali degli eventi; economia per valuta; quando nel corso della partita succedono le cose |
| Bilanciamento | per veicolo, classe, arma o squadra, suddiviso per mappa, modalità, livello o gioco: K/D con il suo intervallo al ~95%, tasso di vittoria (Wilson), sopravvivenza, uccisioni e colpi al minuto, guadagni al minuto, e q – il tasso di falsa scoperta di Benjamini-Hochberg di K/D e vittoria rispetto al resto della suddivisione. **Meno vite** nasconde le righe con troppe poche vite per essere affidabili; **Solo giocatori** esclude ciò che guidava l’IA della missione |
| Tendenze | uso (quota di presenza), K/D o tasso di vittoria dei veicoli o delle classi principali per giorno, settimana o mese |
| Giocatori | giocatori distinti, partite di un giocatore, giocatori di una partita, i giocatori più frequenti |
| Schieramenti | ogni lato di ogni mappa: partite vinte rispetto a una divisione equa |
| Combattimento ravvicinato | dati dei round: duelli d’apertura per lato e la loro conversione, trade, peeker contro holder, incroci di fuoco, ingressi accecati, mira, piazzamenti, vantaggio di uomini e, **Per mappa**, i luoghi che uccidono i giocatori che vi entrano – ciascuno come quota con il suo intervallo di Wilson, dai conteggi `cqb` dei riepiloghi ([Combattimento ravvicinato e round](close-quarters.md)) |
| Mappa | la griglia sommata di una mappa: presenza, uccisioni, morti, K/D, qualsiasi evento, flusso, e **caldo in quante partite** (stabilità); per squadra, a 1, 2, 4 o 8 volte la cella |
| Luoghi | luoghi che risaltano nei numeri ma non nel calore (un’area ampia occupata nel complesso, corridoi, fasce di altezza); **Trova luoghi** |
| Nicchie | gruppi che fanno nettamente meglio o peggio del resto (un veicolo su una mappa, un settore a un’altezza); **Trova nicchie** |
| Rilevamenti | i rilevatori di massa e i rilevatori di mappa (sotto); **Copia rapporto (JSON)** dà il JSON che legge un modello linguistico |


## Rilevamenti su molte partite {#insights-over-many-matches}

La scheda **Luoghi** trova luoghi che risaltano nei numeri ma non nel calore – un’area ampia occupata nel complesso, un corridoio, una fascia di altezza, un luogo occupato solo in una parte della partita – segna come **nascosti** quelli che il calore semplice non mostra, e li delinea nella vista 3D; **Carica** vola lì con le partite che li contenevano. La scheda **Nicchie** trova gruppi (un veicolo su una mappa e un lato, un settore a un’altezza) che fanno nettamente meglio o peggio del resto; clicca su uno per vederne i raffinamenti.

La scheda **Rilevamenti** trova, su tutte le partite, veicoli che scambiano o vincono meglio o peggio del resto, luoghi caldi in una quota stabile di partite, lati che vincono più di una divisione equa, veicoli il cui uso cambia nel corso delle date, e parti della partita che contengono più uccisioni di una distribuzione uniforme. Ogni risultato porta i suoi conteggi, l’effetto, l’intervallo e un tasso di falsa scoperta (mantenuto al 5%), e un clic carica le sue partite. Dettagli: [Per gli sviluppatori](#for-developers).

## Scala {#scale}

Puoi ripetere da solo una piccola versione di questo: `node tools/demo-data.mjs` scrive 150 partite sintetiche di carri armati in `tools/.shots/demo/mass` (circa 1.000 righe ciascuna). Misurato su quelle 150 partite demo sintetiche di `tools/demo-data.mjs` su un PC desktop (una partita reale è molto più grande):

- `tools/3dheat-summarize.mjs` con 4 worker: da 2,6 a 4,8 s per tutte e 150, da 8 a 21 ms a partita dentro un worker; una seconda esecuzione che legge solo i riepiloghi richiede circa 2 s.
- Apertura della cartella nel pannello, con l’indice presente, fino alla comparsa della finestra: da 0,9 a 1,6 s (la parte del worker, la lettura delle 150 righe dell’indice, è da 20 a 40 ms).
- Passaggio a una scheda, fino al disegno della sua tabella: Panoramica da 10 a 30 ms, Bilanciamento da 30 a 70 ms, Tendenze da 30 a 45 ms, Giocatori da 15 a 35 ms, Schieramenti da 15 a 20 ms, Mappa da 55 a 130 ms.
- Lo store contiene le 150 partite in circa 0,5 MB.

Aprire la finestra richiede un fotogramma breve: i file scelti vanno al worker 16 alla volta, e i campi delle date e la prima scheda arrivano un fotogramma dopo la finestra.

Lo store tiene circa 15 KB a partita, quindi 10.000 partite occupano circa 150 MB nel worker; le griglie non vengono mai tenute per più di quanto la mappa ha richiesto.

## Per gli sviluppatori {#for-developers}

### Rilevamenti su molte partite {#insights-over-many-matches}

`src/mass/detect.ts` – ogni risultato con i suoi conteggi, effetto e intervallo,
p e q (Benjamini-Hochberg su tutto ciò che il rilevatore ha provato, mantenuto al 5%),
l’esplorazione che carica le sue partite e una chiave di frase con i suoi valori;
il rapporto (`heat3d.mass/1`) è ciò che `massReportForModel` consegna a un narratore,
nella stessa forma del rapporto di una singola partita (`insights/seam.ts`).

| Rilevatore | Trova |
|---|---|
| `balance` | un veicolo di giocatore che scambia o vince meglio o peggio del resto su una mappa o in una modalità |
| `hotspot` | luoghi caldi in una quota stabile delle partite arrivate (partite calde / partite viste, rispetto alle altre celle della mappa) – non solo caldi nella somma |
| `side` | un lato di una mappa che vince più di una divisione equa |
| `meta` | la quota di vite dei giocatori di un veicolo o il suo K/D che si spostano tra la prima e la seconda metà delle date, per mappa – abbastanza grande da contare, in tendenza nei trimestri, nello stesso modo sulla maggior parte delle mappe (sotto) |
| `phase` | una parte della durata della partita che contiene più uccisioni, colpi, lanci... di una distribuzione uniforme |
| `place` | luoghi che risaltano su molte partite (Fase B, sotto): il tasso di una regione o la sua quota di uccisioni rispetto a quella di ogni partita, cerchi, corridoi, zone cresciute, fasce di altezza, fasi; nascosti quando il calore semplice non li mostra |
| `niche` | gruppi che fanno nettamente meglio o peggio (Fase B, sotto) |
| `grid.*` | i rilevatori su un solo dataset (posizioni di potenza, zone calde e silenziose, luoghi di classe) sulle griglie sommate di ogni mappa: `GridMerge.toInsightJob` riempie le griglie del passaggio di rilevamento dai riepiloghi; i rilevatori che richiedono le tracce saltano |

### Il riepilogo {#the-summary}

JSON semplice (`src/mass/types.ts`), circa 5-30 KB compressi a partita:

- la partita: gioco, mappa, modalità, missione, inizio, durata, righe, vite, giocatori,
  IA, squadre (vite, giocatori, presenza, uccisioni, morti, vittoria, denaro), vincitore;
- per veicolo e squadra: classe, livello, vite, vite dei giocatori, presenza, eventi
  per tipo canonico, uccisioni per classe del bersaglio, vittorie, denaro;
- per giocatore (per id utente, altrimenti per nome): squadra, vite, presenza, uccisioni, morti,
  colpi, lanci, vittorie, veicoli; per arma: eventi per tipo;
- le colonne dell’economia (`cost_*`, `earn_*`) e i loro totali;
- fasi: eventi per tipo in 20 fasce della durata della partita e per minuto;
- comportamento: le misure di comportamento collettivo della partita (allineamento, branco sulla rotta, corsie,
  affollamento, guide, ritardatari, punto di rottura, rischio dopo le perdite, serie, accordo sugli acquisti,
  soppressione), ciascuna con il suo modello nullo, p e q – vedi [Comportamento collettivo](collective-behaviour.md);
- la griglia (sotto).

Contato come lo conta il visualizzatore: colonne trovate come le trova il caricatore di molte partite (`leanSpec`), eventi tramite `data/canonical.ts`; un’uccisione con un’arma di Tacview dà conteggi al suo tiratore; una morte dichiarata due volte insieme (`dead`, `death`) conta una volta.

#### La griglia: su cui si basa la Fase B {#the-grid-what-stage-b-builds-on}

La parte spaziale è fatta per le statistiche di scansione su regioni di qualunque dimensione e forma, non solo per le immagini di calore:

- **Una piramide.** Le celle sono potenze di due allineate in unità del mondo (x, z come li colloca il visualizzatore). Il livello `k` sono le celle sommate per `ix >> k, iz >> k` – esatte, dentro una partita e tra partite con altre dimensioni di cella – e qualunque regione (un riquadro, un corridoio lungo una linea, un anello) è una somma di celle. Il livello più fine si adatta all’estensione robusta della partita (le celle che contengono il 99% della presenza) in 128 celle; le celle isolate fuori di essa sono conservate.
- **Esposizione accanto a ogni conteggio.** Secondi di presenza per cella, per squadra (`pt`), per classe di veicolo (`pc`) e per fascia di altezza (`ph`), così il tasso, l’aspettativa e il rapporto di una regione si calcolano per qualunque sottogruppo.
- **Altezza.** Fasce sopra il piano della partita (il 1° percentile dell’altezza): sotto 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, sopra; un file con una colonna `floor`/`storey`/`deck` le divide per i suoi piani. `y` è l’altezza media di ogni cella, `y0` la più bassa (il suo piano, per l’altezza sopra di esso).
- **Eventi** come tuple `[cella, tipo, squadra, classe, fascia, conteggio]`.
- **Fette temporali** a un livello grossolano (8 celle per lato), per minuto dall’inizio della partita: `[cx, cz, minuto, tipo, valore]`, con i secondi di presenza come tipo `GRID_KINDS.length`; le fasi della partita sono minuti sulla durata.
- Sparsi, conteggi interi, secondi al decimo: limitati da ciò che è successo.

### Fase B: luoghi e nicchie {#stage-b-places-and-niches}

La Fase B cerca ciò che risalta nei numeri senza attirare l’occhio: un’area ampia occupata nel complesso senza una cella calda al suo interno, un rapporto uccisioni-morti anomalo su pochi eventi, un corridoio, una fascia di altezza, un gruppo che c’è solo in una parte della partita – e gruppi (un veicolo su una mappa, da un lato, un settore a un’altezza) che fanno nettamente meglio o peggio del resto. Un solo **Trova luoghi** / **Trova nicchie** / **Trova rilevamenti** esegue tutti i rilevatori; le tre schede condividono il rapporto.

#### Luoghi (`src/mass/scan.ts`) {#places-srcmassscants}

Le partite di ogni mappa sono lette due volte, una partita alla volta; la memoria tiene somme su una griglia di al massimo 64 celle per lato (16 per la scansione spazio-temporale), mai le partite.

- **Misure.** Il tasso di un evento per secondo di presenza – uccisioni, morti, colpi, lanci, catture, per tutte le unità, per classe (le 4 con più eventi), per fascia di altezza – e la quota di uccisioni nelle uccisioni e nelle morti (tutte, per lato, per fascia). Quali classi e lati sono viene dalle teste (`planOf`).
- **Aspettativa per partita.** Il tasso proprio di ogni partita distribuito sulla propria presenza in una cella è l’aspettativa della cella (una scansione di Kulldorff aggiustata per covariate, stratificata per partita): poche partite sanguinose o un server molto occupato non creano un luogo.
- **Dispersione.** Le partite si discostano molto più di quanto dica Poisson. I residui di ogni partita sono sommati in blocchi di 1, 2, 4, 8, 16 celle; la dispersione di ogni dimensione di blocco (residui al quadrato sulla varianza nulla, raggruppati, lasciando fuori il 5% peggiore dei blocchi) scala ogni test di una regione di quella dimensione: un rapporto di verosimiglianza quasi-quadratico, Poisson per i tassi, binomiale per le quote.
- **Regioni.** Cerchi da 0,75 a 18 celle; ellissi a sei angoli, lunghe 3 e 6 volte la larghezza, da 3 a 18 celle (corridoi; l’asse è il `place.path` del rilevamento); zone fatte crescere cella per cella dalle celle locali più forti di Getis-Ord Gi* mentre la z della regione cresce (forme irregolari) – fatte crescere su una metà delle partite e testate sull’altra, così la libertà della crescita non costa falsi luoghi; ogni fascia di altezza contro le altre fasce della partita sull’intera mappa (robusta ai cluster); cilindri spazio-temporali: un cerchio in uno o due quinti della durata della partita, contro la dispersione propria della partita dei suoi eventi nello spazio e nel tempo (la scansione a permutazione spazio-temporale).
- **Verifica.** p dalla verosimiglianza quasi-quadratica; Benjamini-Hochberg su ogni regione provata su ogni mappa (700.000 su tre mappe è normale) al 5%. Ciò che passa viene potato (una regione per lo più dentro una più forte del suo stesso misuratore dice la stessa cosa), riletto per la sua **stabilità** – partite che l’hanno vista, partite in cui era contenuta, la sua direzione in cinque fold delle partite – e testato un’altra volta alla varianza che le partite stesse mostrano (robusto ai cluster, partite come cluster, mai sotto Poisson), di nuovo BH. I luoghi silenziosi su una base (2% o più degli spawn, decolli e atterraggi della mappa) sono lasciati fuori.
- **Effetto.** Il rapporto di tasso (o di quote), ridotto con il bayesiano empirico (un prior gamma adattato ai blocchi 2x2 della mappa), con un intervallo ~95% alla dispersione; Gi* a 1, 2 e 4 celle e Moran locale al centro.
- **Evidenza visiva.** Quanto la regione è già visibile nel calore semplice del suo evento (scala logaritmica fino alla cella più luminosa, come la disegnano le viste): il suo contrasto con un anello intorno (un decimo della tavolozza è difficile da vedere, due quinti semplice) e un picco luminoso che porta l’eccesso; un rapporto non è mai disegnato dal calore, quindi una quota conta per metà. Sotto il 35% è **nascosto**. Il ranking: forza (effetto che satura a 4 volte, luoghi silenziosi a 0,7) per `1 - 0,7 x evidenza` per l’accordo dei fold.

La scheda **Luoghi** li elenca (nascosti solo per impostazione predefinita; per mappa, forma, direzione); un clic delinea i luoghi della mappa nella vista 3D (`placeLines.ts`: le linee superiori del motore, costruite una volta – magenta nascosti, ambra semplici, ciano silenziosi, quello scelto pieno; una fascia come riquadro dal suo pavimento al suo soffitto) e sulla tela della scheda Mappa; **Carica** vi vola e carica le 60 partite che lo contenevano di più, filtrate per il suo evento (e classe).

#### Nicchie (`src/mass/niche.ts`) {#niches-srcmassnichets}

Ricerca a fascio (larghezza 24, profondità 3) su tre tabelle: **vite** (vite dei giocatori: gioco, mappa, modalità, classe, veicolo, lato, livello, trimestre delle date, terzo della durata della partita; K/D, vittoria, morte una vita, uccisioni all’ora, guadagni al minuto), **luoghi** (uccisioni e morti per mappa, modalità, date, settore della mappa 4 x 4, classe, lato, fascia) e **fasi** (settore e quinto della partita: K/D, morti all’ora di presenza). Un gruppo è testato contro il totale con le partite come cluster (la varianza sandwich dei suoi residui per partita), il suo effetto un rapporto di quote o di tassi ridotto da un prior di 20 esiti; servono 30 esiti in 8 partite, un raffinamento deve essere più forte del 10% del suo genitore, e i gruppi in cui l’esito è nessuno o tutti (non registrato per loro) sono lasciati fuori. Tenuti: BH sotto il 5% su ogni gruppo valutato, un rapporto ridotto di almeno 1,25 (o 1/1,25), quattro fold su cinque d’accordo, e non un raffinamento che ripete soltanto il suo genitore. La scheda **Nicchie** li elenca; un clic mostra ogni raffinamento a una condizione del gruppo (l’esploratore), **Carica** carica le sue partite. Gli equipaggiamenti non sono ancora nei riepiloghi.

#### Le variazioni della meta con significato pratico {#meta-shifts-with-practical-significance}

Con date miste la binomiale sulle vite segnalava quasi ogni cambiamento come significativo. Ora `meta` verifica in modo robusto ai cluster (le vite di ogni partita come cluster), tiene una variazione di uso solo se di almeno 2 punti e 25%, una variazione di K/D di 1,3 volte, i trimestri delle date che vanno nella stessa direzione (tau di Kendall di almeno 0,5) e, per un veicolo su più mappe, la stessa direzione sulla maggior parte di esse. Ne restano solo poche su un insieme di prova dove il test semplice segnalava quasi tutte.

#### Per un modello {#for-a-model}

`massReportForModel` dà a ogni luogo la sua `region` (forma, nascosto, evidenza, altezze, fase) e a ogni nicchia le sue `conditions`, più quante regioni e gruppi sono stati provati. La lente della conoscenza può leggere i luoghi come zone di uccisione e vie di avvicinamento: i loro tipi sono `place.*` e `niche.*`.

#### Verifiche {#checks}

`scan.test.ts` inserisce un’area diffusa (1,6 volte il tasso di morte su un cerchio di 22 celle, tenue in ogni cella), un corridoio, una fascia di altezza e un cluster solo di fase in 240 partite sintetiche con dispersione – tutti trovati, quello diffuso nascosto – ed esegue otto insiemi nulli di 60 partite: nessun luogo. `niche.test.ts` trova un gruppo veicolo x mappa x lato inserito e nient’altro in cinque tabelle nulle.
