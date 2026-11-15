---
title: "Statistiche del percorso"
parent: "Analisi di gara"
nav_order: 57
lang: "it"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistiche del percorso

Carica molti giri di un percorso e il visualizzatore conta gli errori: quale
curva costa più tempo, in quanti giri si è sbagliato lì, e perché. Usalo per
trovare la curva che vale la pena esercitare.

Prova: **Giri demo** dà tre giri, abbastanza perché questa sezione compaia.

![Statistiche del percorso con la mappa degli errori: la pista dipinta in base a quanti giri hanno perso tempo in ogni curva, e la lista delle curve](../assets/img/en/race-course-mistake-map.webp)

Carica la cartella intera di un percorso - decine di giri, più auto, più classi
di prestazione - e ogni giro viene giudicato, poi contato. Questa pagina copre il
confronto per classe, cosa conta come errore, la sezione **Statistiche del
percorso**, la mappa degli errori, l'esportazione verso la mappa di calore, i
percorsi di più piste e i limiti di prestazione con molti giri.

## Contro il migliore della sua classe {#against-the-best-of-its-own-class}

Un giro viene confrontato curva per curva con il **giro completo più veloce
della sua classe di prestazione** (il riferimento, nella classe del riferimento);
quel giro stesso con chi della sua classe è stato più rapido in ogni curva, o
con tutti i giri quando è solo nella sua classe. Le auto sono raggruppate per
classe di prestazione del gioco (in Forza, da D a X; C e S2 sono due di esse).
Il punto di frenata di un'auto di classe C confrontato con quello di un'auto S2
non dice nulla sulla guida. La mappa dei tempi, i distacchi nella lista dei giri
e la tabella *Curva per curva* seguono lo stesso confronto (vedi [con chi viene
confrontato ogni giro](race-corner-analysis.md#who-each-lap-is-compared-with)).

Le statistiche sono costruite sull'analisi di ogni giro, non accanto ad essa.

## Cosa conta come errore {#what-counts-as-a-mistake}

Un **episodio** è l'errore di un giro in una curva (un tratto). Gli errori di un
giro in una curva sono:

1. **La causa di guida** che l'analisi ha trovato per la sua perdita lì - un
   risultato che è una perdita, attribuita al pilota (non all'auto o alla
   situazione), che costa **0,05 s** o più rispetto al suo giro di confronto. Il
   suo costo è la perdita della curva.
2. **Ogni errore di controllo dell'auto** commesso lì che l'altro giro non ha
   fatto (non condiviso), che costa **0,03 s** o più - bloccaggio, pattinamento
   delle ruote, retro che scivola, sottosterzo, testacoda. Il suo costo è quello
   dell'evento stesso.
3. **Ogni urto e incidente**, condiviso o no, qualunque sia il costo.

In una curva ce ne possono essere più d'uno; ogni tipo viene contato **una sola
volta per giro e curva**. I guadagni, la parte dovuta all'auto e un arrivo più
lento deciso nella curva precedente non sono errori.

### Dai risultati agli errori {#from-findings-to-mistakes}

| Risultato | Errore |
|---|---|
| troppo veloce in entrata, lento in uscita, per aver frenato di qualche metro più tardi dell'altro | Frenato troppo tardi |
| frenato presto | Frenato troppo presto |
| frenato dolcemente | Frenato troppo dolcemente |
| un bloccaggio come causa | Bloccato una ruota |
| rilasciato l'acceleratore senza frenare | Rilasciato in planata |
| aderenza da sfruttare, più lento al punto di corda, frenato dove l'altro ha solo alzato il piede | Troppo lento nel centro curva |
| una linea troppo stretta | Linea troppo stretta |
| spinto largo | Spinto largo |
| girato l'auto meno / troppo | Girato male l'auto |
| sull'acceleratore più tardi, a tutto gas più tardi, esitato | Acceleratore tardivo |
| più lento in uscita dalla curva | Più lento in uscita |
| pattinamento delle ruote | Pattinamento delle ruote |
| il retro è scivolato, di traverso nel centro curva | Retro scivolato |
| andato largo | Andato largo |
| perso velocità | Perso velocità |
| alzato il piede (in entrata, o sul rettilineo) | Alzato il piede |
| quasi fermo, testacoda, urto o incidente come causa | Testacoda / Urtato qualcosa / Incidentato quando gli eventi del giro lì lo dicono (prima incidente, poi testacoda, poi urto); altrimenti Quasi fermo |
| un percorso più lungo in volo | Volato troppo lontano |

I due schemi sono contati come la causa trovata al loro interno, con la stessa
tabella. *Ha dato più via entrando di quanto l'uscita ha recuperato* è l'errore
della causa del suo ingresso: frenare presto è *Frenato troppo presto*, un
bloccaggio *Bloccato una ruota*, rilasciare *Rilasciato in planata*, aderenza non
usata *Troppo lento nel centro curva*. *Troppo veloce in entrata, lento in uscita*
è *Frenato troppo tardi* dove il giro ha frenato più tardi dell'altro; altrimenti
è l'errore della causa della sua uscita - *Acceleratore tardivo*, *Pattinamento
delle ruote*, *Retro scivolato*, *Andato largo*, *Più lento in uscita*. Uno schema
la cui causa è dell'auto, o un arrivo più lento, non viene contato.

Non contati: l'arrivo più lento, la partenza, ogni risultato sull'*auto* (trazione,
aderenza, freni, guida) e ogni guadagno o curva in piano.

### I tipi, nel loro ordine {#the-kinds-in-their-order}

Frenata: *Frenato troppo tardi*, *Frenato troppo presto*, *Frenato troppo
dolcemente*, *Bloccato una ruota*. Ingresso: *Rilasciato in planata*, *Troppo
lento nel centro curva*, *Linea troppo stretta*, *Spinto largo*, *Girato male
l'auto*. Uscita: *Acceleratore tardivo*, *Più lento in uscita*, *Pattinamento
delle ruote*, *Retro scivolato*, *Andato largo*, *Perso velocità*. Rettilineo:
*Alzato il piede*. Incidenti: *Testacoda*, *Urtato qualcosa*, *Incidentato*,
*Quasi fermo*, *Volato troppo lontano*.

## La sezione Statistiche del percorso {#the-course-statistics-section}

Appare da **3** giri in poi, tra **Giri** e **Dove migliorare**.

- **Il riepilogo**: "40 giri con 9 auto, 3 classi: ogni curva giudicata
  confrontandola con il giro più veloce della sua classe." (le auto contate per
  numero di gara, o per nome).
- **Pillole di classe** (con più classi): **Tutto** e una pillola per classe,
  ognuna con il numero di giri, nell'ordine del gioco (D, C, B, A, S1, S2, R, X,
  poi le altre). Un clic su una classe mostra solo i suoi giri; **Shift+clic**
  ne aggiunge o toglie una. Tutto quello che c'è sotto - le liste, la mappa,
  l'esportazione verso la mappa di calore - segue le classi scelte.
- **Gli errori più frequenti**: ogni tipo di errore, prima i giri con più
  occorrenze (poi più volte, poi più costo), al massimo 8 (**Tutti N tipi**
  mostra il resto, **Meno** li nasconde di nuovo). Ogni riga: il suo nome, "N
  giri su M", una barra di quella quota, e "K volte · circa X s · più spesso in
  T3 (5), T7 (4), T1 (2)" - quante volte è stato commesso (giro per curva), quanto
  è costato in tutto, e le tre curve dove più giri lo hanno commesso. **Un clic su
  una riga** lo mostra sulla mappa degli errori (e accende la mappa); un altro clic
  mostra tutti gli errori.
- **Curva per curva** (o *Curva per curva - <errore>* con uno scelto): per tratto,
  "N di M hanno perso tempo · X s" - i giri che hanno percorso tutta la curva,
  quelli che vi hanno perso **0,05 s** o più rispetto al migliore della loro
  classe, e tutto il tempo perso. Ripiegata, elenca i tre errori più comuni con il
  numero di giri. **Un clic su una curva** la apre, la inquadra con la telecamera e
  passa alla mappa degli errori: per ogni errore (o solo quello scelto) una riga
  come "12 giri su 40 hanno frenato troppo presto qui. In 9 auto diverse - circa
  0,21 s ciascuna." e i giri che lo hanno commesso, **il peggiore per primo**, ognuno
  con il suo costo - al massimo 8, "+N altri" per il resto. **Un clic su un giro**
  lo mette a fuoco e riproduce quell'errore (allineato 40 m prima).
- **Mostra nella mappa di calore**: vedi sotto. "Creazione della mappa di
  calore…" mentre lavora; disattivato quando non ci sono errori.

## La mappa degli errori {#the-mistake-map}

**Vista → Mappa degli errori** dipinge lungo il percorso di riferimento quanti
giri (delle classi scelte) hanno commesso un errore in ogni metro - di ogni tipo,
o quello scelto nelle statistiche. Ogni giro conta una volta per metro; l'intervallo
di ogni episodio (dove stava la sua causa o il suo evento) si allarga di 6 m per
lato, così uno breve si vede. Più larga e più luminosa dove più giri lo hanno
fatto: larghezza `3 + 10 · (giri qui / il massimo di giri ovunque)` metri, colore
da marrone spento ad arancione brillante; una striscia grigia di 2 m dove nessuno
lo ha fatto. Legenda: *pochi giri ↔ più giri*.

Con **Etichette** attive, il punto di corda di ogni curva porta il suo errore più
comune: "T3 · 12/40 frenata precoce" (giri che lo hanno commesso / giri che hanno
percorso la curva), "T3 · 12/40" con un tipo scelto, "T3 · pulita" con nessuno.
Passando sopra un'etichetta si elencano le perdite della curva e i suoi cinque
errori più comuni; un clic la apre o la chiude nelle statistiche.

## Mostra nella mappa di calore {#show-in-the-heatmap}

**Mostra nella mappa di calore** passa lo stesso alla scheda della mappa di
calore come un dataset chiamato "Errori su <pista>" (oppure "Errori sul
percorso"), così l'intero set di strumenti della mappa di calore - modalità di
calore, filtri, linea del tempo, sezioni - lavora su dove i giri vanno storti.

È un CSV costruito in memoria (`mistakeTable`), una riga per ogni punto della
griglia (ogni 2 m) di ogni episodio, nella **posizione propria del giro** in quel
punto:

| Colonna | Contenuto |
|---|---|
| `x`, `y`, `z` | la posizione del giro a quel metro (coordinate di gioco) |
| `elapsed` | il tempo del giro lì, s |
| `lap` | l'etichetta del giro |
| `car` | il nome dell'auto (o "car 1234") |
| `mistake` | il nome dell'errore, nella lingua attuale |
| `car_class` | la classe, `-` quando non c'è |
| `corner` | l'etichetta della curva, `T3` |
| `cost` | il costo dell'episodio, s |

Viene caricato dal caricatore della mappa di calore stessa con suggerimenti di
mappatura: Y in alto, nessun ribaltamento degli assi, scala 1; il tempo `elapsed`
in secondi; **persona** = `car`, **gruppo** = `mistake`, **sessione** = `lap`;
nessuna direzione di sguardo; `car_class`, `corner` e `cost` mantenuti come colonne
di filtro. La scheda passa poi a **Mappa di calore** e inquadra i dati. Vengono
esportate solo le classi scelte nelle statistiche.

## Percorsi di più piste {#courses-from-several-tracks}

I giri vengono analizzati **un percorso alla volta**. Una cartella con i giri di
più percorsi - tutta la libreria dei giri - offre ogni percorso da caricare da
solo (con il numero di giri, prima il più numeroso); i giri di corse mai finite
(`unfinished/` di FH Companion) vanno con il loro percorso, segnati come *parziali*.
I giri di più piste con nome, scelti come file, vengono offerti allo stesso
modo; i giri che non nominano una pista vanno con quella scelta. Caricare giri di
un'altra pista con nome rispetto a quelli caricati li sostituisce. Dettagli:
[Caricare i giri](race-loading-laps.md#folders-and-courses).

## Prestazioni con molti giri {#performance-with-many-laps}

Decine di giri vengono analizzati in uno o due secondi (tutti, sempre). Quello
che viene disegnato è limitato, perché la vista resti alla frequenza di
fotogramma:

| Limite | Valore | Effetto |
|---|---|---|
| giri disegnati di default | 8 (`SHOW_ALL_UP_TO`) | oltre 8 giri caricati, i giri appena aggiunti sono nascosti, a meno che siano il riferimento, il giro messo a fuoco o il migliore della sua classe. **Mostra tutti** disegna ogni giro; **Solo quelli in esame** torna indietro. Mettere a fuoco un giro lo rende di nuovo visibile insieme al migliore della sua classe |
| auto semplici e linee sottili | oltre 10 visibili (`PLAIN_PAST`) | giri diversi dal fuoco, dall'auto inseguita e dal riferimento: un punto di linea ogni 6 m (invece di 1,5 m), auto disegnate semplici |
| giri in grafico | 8 (`CHART_LAPS`) | prima il fuoco, il suo migliore di classe e il riferimento; "+N disegnati, non in grafico" |
| schede HUD | 6 | i primi sei giri visibili |
| statistiche | da 3 giri | la sezione è nascosta sotto questo numero |
| risultati elencati | 12 del pilota, 8 auto/contesto, 10 guadagni | per giro messo a fuoco |
| coppie di auto mostrate | 3 | oltre 3 coppie, una coppia con un selettore |

Gli episodi di errore vengono calcolati una volta per analisi e messi in cache;
la densità della mappa degli errori è in cache per selezione di classi e per
errore.

## Per gli sviluppatori {#for-developers}

Codice: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` in [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
