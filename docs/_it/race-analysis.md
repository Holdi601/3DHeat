---
title: "Analisi di gara"
nav_order: 11
has_children: true
lang: "it"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Analisi di gara

Hai guidato due volte lo stesso tracciato. La scheda **Analisi di gara** riproduce insieme in 3D le due corse, mostra dove un giro era più lento e ti dice perché. Non hai ancora giri? Premi **Giri demo**.

![La scheda Analisi di gara con i giri demo: la barra laterale con Giri e Dove migliorare, le auto sul percorso, i grafici sotto la vista](../assets/img/it/race-analysis-overview.webp)

La scheda confronta due o più giri di un solo percorso. Condivide la tela, la telecamera e il modello del percorso caricato (**Sfondo / livello**) con la mappa di calore; il resto è suo: la sua barra laterale e la sua barra sotto la vista. Parole come *giro*, *riferimento* e *punto di corda* sono nel [glossario](glossary.md).

Questa pagina è la mappa della scheda. Ogni parte ha la sua pagina:

| Pagina | Cosa copre |
|---|---|
| [Caricare i giri](race-loading-laps.md) | ogni formato di file, cartelle e percorsi, nomi delle auto, giri demo, l'elenco dei giri, riferimento e fuoco |
| [Replay e scena 3D](race-replay-and-scene.md) | la barra di trasporto, le tre modalità di replay, allineare le auto, la telecamera di inseguimento, le linee, le mappe, le auto, le etichette, i mondi speculari |
| [Grafici e HUD](race-charts-and-hud.md) | i grafici delle distanze, il selettore dei grafici, passaggio del mouse e zoom, le schede delle auto, la tabella dei canali |
| [Eventi di controllo dell'auto](race-control-events.md) | bloccaggi, pattinamento delle ruote, sovrasterzo, testacoda, sottosterzo, urti, incidenti, ABS/TC, freno a mano, aria - come viene rilevato ognuno, con ogni soglia |
| [Analisi curva per curva](race-corner-analysis.md) | allineamento per distanza, curve e tratti, il bilancio di tempo di una curva, ogni causa e l'ordine in cui vengono provate, la forma della linea e il consiglio |
| [Profili delle auto e confronto](race-car-profiles.md) | cosa sa fare ogni auto, misurato dai suoi giri; *Auto a confronto*; cosa decide l'auto in ogni curva |
| [Statistiche del percorso](race-course-statistics.md) | molti giri di un percorso: errori per curva e per tipo, la mappa degli errori, l'esportazione verso la mappa di calore, i limiti di prestazione |
| [Analisi delle gare: il metodo](race-analytics.md) | la ricerca dietro le regole, con le fonti |
| [Altri giochi di corsa](other-games.md) | cosa fa il visualizzatore con i giri di ogni gioco: scivolamento e derapata calcolati dove un gioco non li invia, mondi speculari, i canali in più |

## Lo schermo {#the-screen}

**Barra laterale**, dall'alto in basso (le sezioni si possono ripiegare):

1. **Giri** - caricamento, elenco, mostra/nascondi, riferimento, fuoco, inseguimento.
   Vedi [Caricare i giri](race-loading-laps.md).
2. **Statistiche del percorso** - solo da tre giri caricati in poi.
   Vedi [Statistiche del percorso](race-course-statistics.md).
3. **Dove migliorare** - i risultati del giro messo a fuoco, curva per curva.
   Vedi [Analisi curva per curva](race-corner-analysis.md).
4. **Curva per curva** (oppure *Curva per curva - classe X* con più classi) - il giro più
   veloce in ogni curva e la sua linea. Mostrato con due o più giri.
5. **Controllo dell'auto** - i bloccaggi, le scivolate, le spinte e gli urti del giro messo a fuoco.
   Vedi [Eventi di controllo dell'auto](race-control-events.md).
6. **Auto a confronto** (oppure **L'auto** con una sola auto) - vedi
   [Profili delle auto e confronto](race-car-profiles.md).
7. **Vista** - quale mappa viene dipinta sul tracciato e cosa viene disegnato.
   Vedi [Replay e scena 3D](race-replay-and-scene.md).
8. I pannelli condivisi **Livello** e **Telecamera e scena** (modello del percorso,
   inversione degli assi, telecamera) - documentati con la mappa di calore e
   [Telecamera](camera.md).

**La vista** mostra il percorso, le linee percorse, la mappa, le auto, le etichette
fissate al tracciato, e fino a sei schede delle auto in alto a sinistra (vedi
[Grafici e HUD](race-charts-and-hud.md)). Senza giri caricati dice "Nessun giro
caricato - Trascina qui due o più file di giri, oppure carica i giri demo dalla barra
laterale."

**La barra sotto la vista** contiene il trasporto del replay e, se non è nascosta,
i grafici delle distanze.

## Avvio rapido {#quick-start}

1. Apri la scheda **Analisi di gara** (accanto a **Mappa di calore** in cima alla barra laterale).
2. Carica dei giri. Premi **Giri demo** per vedere cosa fa la scheda con tre giri
   inventati. Per i tuoi giri, registrali prima ([formati dei file e registratori](race-loading-laps.md#file-formats)),
   poi premi **Carica file dei giri…** o **Cartella…**, oppure trascina file o cartelle sulla vista.
3. Il giro completo più veloce diventa il riferimento; il giro più lento tra gli altri viene
   messo a fuoco. Clicca un giro qualunque nell'elenco per metterlo a fuoco; ★ fa di un giro il riferimento.
4. Leggi **Dove migliorare**. Clicca un risultato: le auto vengono allineate 40 m prima,
   la telecamera lo inquadra, il replay lo riproduce e si aprono le misure.
5. Passa sopra i grafici per portare ogni auto a quel metro; Shift+clic per allinearle lì.

## Tastiera {#keyboard}

Mentre la scheda Analisi di gara è aperta:

| Tasto | Fa |
|---|---|
| **K** | riproduce / mette in pausa il replay |
| **Home** | torna all'inizio del replay |
| tasti numerici | nulla (nella mappa di calore cambiano le modalità) |

I tasti digitati in un campo di testo o in un menu a discesa vengono ignorati. I tasti
della telecamera funzionano come nella mappa di calore (**W A S D**, **Spazio** in alto,
**Q** in basso, **Shift** più veloce, **Alt** più lento, mouse per guardare; tutto in
[Telecamera](camera.md)); **F** inquadra i giri caricati (come fa il caricamento dei giri).

## Molti giri {#many-laps}

- Tutti i giri caricati vengono analizzati e contati; decine di giri richiedono uno o due secondi.
- Oltre **8** giri (`SHOW_ALL_UP_TO`), i giri aggiunti vengono disegnati solo quando sono il
  riferimento, il giro messo a fuoco, o il giro migliore della classe del giro messo a fuoco.
  *Mostra tutti* / *Solo quelli in esame* alternano.
- Oltre **10** auto visibili (`PLAIN_PAST`), i giri non in esame (non il fuoco, l'auto inseguita
  o il riferimento) vengono disegnati con linee diradate a un punto ogni 6 m invece di 1,5 m, e
  con auto semplici.
- I grafici disegnano al massimo **8** giri; la HUD mostra al massimo **6** schede.
- Le statistiche del percorso compaiono da **3** giri.

Dettagli: [Statistiche del percorso](race-course-statistics.md#performance-with-many-laps).

## Impostazioni predefinite della vista {#default-view-settings}

| Impostazione | Predefinito |
|---|---|
| Mappa | Mappa dei tempi |
| Linee percorse, Auto, Pneumatici e sospensioni, Etichette, Tracciato dai giri | attivi |
| Tutti i valori sulle schede | disattivo |
| Dimensione dell'auto | 1× |
| Grafici | mostrati |
| Modalità del replay | Dalla linea |
| Velocità del replay | 1× |
| Ciclo | attivo |

Nulla di questo viene salvato; un ricaricamento riparte dai predefiniti. Cosa viene ricordato
nel browser: la lingua, e i nomi delle auto imparati dai file dei giri (vedi
[Caricare i giri](race-loading-laps.md#car-names)).

## Per gli sviluppatori {#for-developers}

### Cosa succede quando si caricano i giri {#what-happens-when-laps-are-loaded}

Ogni volta che cambiano l'insieme dei giri, il riferimento o la lingua, l'intera analisi
viene rifatta (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Ai giri vengono aggiunti i canali derivati dove il gioco non li invia: angolo di deriva,
   scivolamento delle ruote dalle velocità delle ruote, in aria, terreno sciolto, velocità di
   imbardata ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. Il riferimento viene scelto e ogni giro viene proiettato sul suo percorso e ricampionato ogni
   2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Dai giri si stabilisce se il mondo del gioco è specchiato
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Le curve vengono trovate sul riferimento, e raggruppate in tratti da una zona di frenata
   alla successiva ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per auto: il suo inviluppo (aderenza, frenata, spinta per velocità), il suo profilo, le sue
   curve dei pneumatici ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per giro e tratto: cosa ha fatto (punto di frenata, punto più lento, acceleratore a tutto
   gas, ...) e la linea percorsa ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per giro: i suoi eventi di controllo dell'auto, ognuno messo accanto al giro con cui è
   confrontato lì.
8. Per giro e tratto: il bilancio di tempo rispetto al suo giro di confronto e il risultato
   in parole.
9. La mappa dei tempi e la mappa delle cause per giro.

I testi vengono prodotti nella lingua attuale; cambiare lingua rifà l'analisi (e rinomina i
giri demo). Un errore nell'analisi viene mostrato sotto i pulsanti **Giri** come errore, e i
giri restano caricati.

### File sorgente {#source-files}

| File | Ruolo |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | lettura dei file dei giri |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | il tipo di giro, i nomi, i giri demo |
| `src/race/derive.ts`, `handedness.ts` | canali derivati, mondi specchiati |
| `src/race/align.ts`, `segments.ts`, `line.ts` | asse delle distanze, curve, linee |
| `src/race/analysis.ts` | curve confrontate, cause, risultati |
| `src/race/envelope.ts`, `profile.ts` | cosa sa fare un'auto |
| `src/race/control.ts`, `impacts.ts` | controllo dell'auto, urti e incidenti |
| `src/race/stats.ts` | molti giri |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay e disegno |
| `src/race/schema.ts`, `graphs.ts` | la tabella dei canali, le righe dei grafici |
| `src/ui/race/*` | la barra laterale, i grafici, la HUD, le etichette |
| `src/state/raceStore.ts` | lo stato della scheda e l'orologio del replay |
