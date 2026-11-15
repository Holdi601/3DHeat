---
title: "Replay e scena 3D"
parent: "Analisi di gara"
nav_order: 52
lang: "it"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay e scena 3D

Riproduci i tuoi giri insieme, come una gara, e guarda dove un'auto prende il largo. Tutto
ciò che vedi nella vista 3D della scheda **Analisi di gara** è descritto qui: le traiettorie
percorse, i colori dipinti sulla pista, le auto e le etichette.

![Mappa delle cause con le auto allineate 40 m prima di una curva: pista colorata, due auto e il palo della bandiera](../assets/img/en/race-replay-lined-up.webp)

## L'orologio del replay {#the-replay-clock}

Un solo orologio guida ogni giro: i secondi del giro di **riferimento**. Il motore lo fa
avanzare a ogni fotogramma durante la riproduzione (di tempo di fotogramma × velocità del
replay); alla fine torna a 0 se **Ciclo** è attivo, altrimenti si ferma. L'orologio non fa
parte dello store di proposito, così la barra laterale non si ridisegna a ogni fotogramma;
il HUD e i grafici si collegano ad esso e si aggiornano al massimo una volta per fotogramma.

**La durata del replay** è il tempo più lungo che un giro occupa sull'orologio: il tempo di
ciascun giro (meno il suo ritardo in *Allineate*), oppure il tempo del riferimento in
*Affiancate*.

## La barra di controllo {#the-transport-bar}

Sotto la vista, da sinistra a destra:

| Comando | Fa |
|---|---|
| ⏮ | torna all'inizio (anche **Home**) |
| ▶ / ❚❚ | riproduci / pausa (anche **K**) |
| velocità | 0,25×, 0,5×, 1×, 2×, 4× |
| cursore | imposta direttamente l'orologio, a passi di 0,01 s |
| orologio | `tempo / durata · metri`: l'orologio come tempo sul giro, la durata del replay, e quanto avanti sul riferimento è l'auto di riferimento |
| *Dalla linea* / *Allineate* / *Affiancate* | la modalità del replay (sotto) |
| **Allinea qui** | mette ogni auto dove si trova ora il riferimento, e prosegue da lì |
| **Ciclo** | ricomincia dall'inizio alla fine (attivo di default) |
| **Nascondi grafici** / **Mostra grafici** | i grafici di distanza sotto la barra |

I comandi sono disattivati finché non ci sono giri caricati (basta un giro per riprodurlo;
i confronti ne richiedono due).

## Modalità del replay {#replay-modes}

Come il tempo di ogni giro deriva dall'orologio:

| Modalità | Tempo di ogni giro | Cosa mostra |
|---|---|---|
| **Dalla linea** (`start`) | l'orologio stesso | ogni giro dal proprio inizio: una gara tra loro, con il distacco che cresce come è cresciuto in pista |
| **Allineate** (`anchor`) | l'orologio più l'offset del giro | ogni auto nello stesso punto nello stesso istante, poi lasciata andare - cosa succede da quel punto in poi, non dall'inizio del giro |
| **Affiancate** (`locked`) | l'istante in cui il giro ha raggiunto la distanza attuale del riferimento | ogni auto tenuta alla distanza del riferimento per tutto il giro: velocità e comandi confrontati metro per metro |

Usala quando:

- **Dalla linea**: vuoi vedere chi è davanti e come cresce il distacco.
- **Allineate**: vuoi sapere cosa succede in una curva o su un rettilineo, con tutti che partono
  alla pari lì.
- **Affiancate**: vuoi confrontare cosa fanno i piloti con pedali e volante nello stesso punto del
  percorso.

**Offset in *Allineate*:** per un'ancora a `s` metri lungo il riferimento, l'offset di ogni giro è il
suo tempo a `s` meno il tempo del riferimento a `s`, entrambi letti dai giri allineati (vedi
[un solo asse di distanza](race-corner-analysis.md#one-distance-axis)). Un giro che non copre `s`
mantiene offset 0. Scegliere *Allineate* dai pulsanti della modalità ancora alla distanza attuale del
riferimento.

Un palo bianco con una bandiera (alto 14 m) segna l'ancora in modalità *Allineate*.

### Allineare {#lining-up}

| Azione | Ancora | Orologio |
|---|---|---|
| **Allinea qui** | dove si trova ora il riferimento | invariato |
| Maiusc+clic sui grafici | il metro cliccato | 1,5 s prima che il riferimento lo raggiunga |
| un risultato in *Dove migliorare*, un distintivo numerato sulla pista, una riga di *Curva per curva* con un risultato | 40 m prima del punto in cui inizia la causa del risultato | 1,5 s prima di quel punto; poi riproduce |
| un evento di controllo dell'auto, l'etichetta di un urto | 40 m prima dell'evento | 1,5 s prima; poi riproduce |
| un giro nelle statistiche del percorso | come il suo risultato o evento | come sopra, con quel giro in focus |

Guardando un risultato lo si inquadra anche con la camera - una sfera attorno al centro del
tratto del risultato, di raggio il maggiore tra 40 m e metà della sua lunghezza più 30 m (60 m per un
evento) - a meno che la camera non stia seguendo un'auto.

### Camera inseguimento {#chase-camera}

⌖ nell'elenco dei giri fa seguire l'auto alla camera: 2,5 + 4 × dimensione dell'auto metri dietro
di essa e 0,9 + 1,1 × dimensione dell'auto metri sopra, guardando lungo la direzione di marcia,
inclinata verso il basso sull'auto, ammorbidita (il 20% del tragitto a ogni fotogramma) così non
trema a ogni oscillazione. ⌖ di nuovo la rilascia. L'auto seguita è disegnata un po' più chiara,
con un anello bianco a terra, e la sua scheda è evidenziata.

## La sezione Vista {#the-view-section}

| Comando | Predefinito | Fa |
|---|---|---|
| **Linee** / **Mappa dei tempi** / **Mappa delle cause** / **Mappa degli errori** | Mappa dei tempi | cosa viene dipinto lungo la pista (sotto); *Linee* non dipinge nulla |
| legenda | - | *guadagna ↔ perde* per la mappa dei tempi, i colori delle cause per la mappa delle cause, *pochi giri ↔ più giri* per la mappa degli errori |
| **Traiettorie percorse** | attivo | la traiettoria di ogni giro visibile, nel suo colore |
| **Auto** | attivo | le auto, e le fonti delle schede del HUD |
| **Pneumatici e sospensioni** | attivo | temperatura degli pneumatici, anelli di slittamento, aste delle sospensioni e altri simboli per ruota, e fanali sul tetto delle auto |
| **Etichette** | attivo | nomi delle curve, distintivi numerati, etichette degli urti, etichette delle curve della mappa degli errori |
| **Pista dai giri** | attivo | una superficie stradale per un percorso senza modello estratto (nascosta mentre è caricato un modello del percorso) |
| **Tutti i valori sulle schede** | disattivo | ogni canale elencato su ogni scheda del HUD |
| **Forme reali delle auto** | attivo | ogni auto nella forma della sua controparte (vedi [Le auto](#the-cars)); disattivo: la monoposto aperta, che non nasconde nulla della telemetria |
| **Dimensione delle auto** | 1× | da 1× a 10× a passi di 0,5; 1× è la dimensione reale dell'auto, lunga e larga quanto nel gioco. Nulla cambia questo valore se non il cursore |

## Traiettorie percorse {#driven-lines}

Il percorso di ogni giro visibile attraverso i suoi campioni, nel suo colore, disegnato 0,12 m
sotto la posizione registrata (la posizione registrata di un'auto è il suo punto di riferimento,
0,28-0,47 m sopra la strada sui percorsi Forza estratti). Viene tenuto un punto ogni 1,5 m; con più
di 10 giri visibili, i giri non guardati tengono un punto ogni 6 m (ogni vertice va alla GPU a ogni
fotogramma).

## Le mappe {#the-maps}

Tutte e tre sono nastri lungo il percorso del **riferimento**, 0,2 m sotto le posizioni registrate,
un quadrilatero per passo di griglia da 2 m.

### Mappa dei tempi (`where`) {#time-map-where}

Per il giro in focus: secondi guadagnati o persi al metro rispetto al giro con cui è confrontato in
quel punto (il migliore della sua classe, o per il riferimento il più veloce tra gli altri in ogni
tratto), dalla variazione del delta allineato per passo di griglia, smussata su ±10 m. Rosso dove
perde tempo, verde dove guadagna, grigio nel mezzo; la scala dei colori è il 95° percentile dei valori
assoluti, così i picchi sono tagliati e la maggior parte del giro sta nell'intervallo. Larga 6 m.

### Mappa delle cause (`why`) {#cause-map-why}

Per il giro in focus: ogni perdita dipinta sul tratto dove sta la sua **causa** (non dove appare il
tempo), colorata dal gruppo della causa, con il risultato più costoso che vince dove due si
sovrappongono. Larghezza `3 + 9·√(costo / costo più alto)` metri; dove non si è perso nulla, una striscia
grigia di 2 m. Il risultato scelto in *Dove migliorare* è dipinto in bianco.

| Gruppo | Colore | Risultati |
|---|---|---|
| frenata | arancione | perdite di guida nella fase di frenata |
| ingresso | magenta | perdite di guida in entrata e nel mezzo |
| uscita | blu | perdite di guida in uscita |
| rettilineo | giallo | perdite di guida sul rettilineo |
| auto | grigio | ciò che spiega l'auto |
| contesto | grigio scuro | la situazione (una partenza di gara contro un giro lanciato) |

### Mappa degli errori {#mistake-map}

Quanti di tutti i giri (delle classi scelte nelle statistiche del percorso) hanno fatto un errore in ogni
metro - di ogni tipo, o solo quello scelto nelle statistiche. Ogni giro conta una volta per metro; il
tratto di ogni errore è allargato di 6 m per lato, così uno breve si vede. Larghezza `3 + 10·(giri / giri
più numerosi)` metri e un colore dal marrone spento all'arancione vivo; griglia di 2 m dove nessun giro ha
fatto un errore. Vedi [Statistiche del percorso](race-course-statistics.md#the-mistake-map).

## Pista dai giri {#track-from-the-laps}

Per un gioco il cui percorso non è stato estratto, sotto le linee viene disegnata una strada: larga
quanto i giri si estendono attorno al riferimento (gli scostamenti laterali entro 25 m contano) più 2 m
per lato, e almeno 4 m per lato della linea di riferimento, smussata su ±8 punti di griglia (±16 m), in
grigio asfalto con linee di bordo chiare, 0,3 m sotto le posizioni registrate. Nascosta mentre un modello
del percorso è caricato in **Livello**.

## Urti e incidenti sulla pista {#hits-and-crashes-on-the-track}

Gli urti e gli incidenti di ogni giro visibile (vedi
[Eventi di controllo dell'auto](race-control-events.md#hits-and-crashes)) sono segnati dove sono avvenuti,
ogni volta che sono disegnate linee o auto: una stella appuntita - rossa per un incidente, ambra per un
urto - su un palo, con un anello del colore del giro alla sua base, dimensionata con la dimensione
dell'auto (gli incidenti più grandi). Quando un'auto passa nel momento di un urto, da lì si espande un
anello d'urto per 0,8 s.

## Modalità aiuto {#help-mode}

**?** accanto al selettore della lingua, oppure il tasto **?** o **F1**, attiva una legenda di ogni colore
sullo schermo, in tutte e tre le schede ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). La scelta resta in
questo browser.

- **La legenda** nell'angolo della vista elenca i colori per la scheda e la modalità in uso. Ogni scala
  viene da dove la vista la prende, quindi una scala termica che hai modificato appare come modificata.
  Nella scheda gara sono elencati solo i dati che i giri caricati contengono.
- **La scheda di ogni auto** guadagna una tabella di ciò che è disegnato sulle sue ruote, per nome, con il
  valore di ogni ruota nel colore in cui è disegnato.
- **L'auto in focus** riceve un'etichetta su ogni ruota che dice lo stesso, posta fuori agli angoli.
  Nascosta quando l'auto è troppo piccola sullo schermo perché ci stiano.

## Le auto {#the-cars}

**Ogni auto nella propria forma**, nel colore del giro e alla sua dimensione reale. Le forme vengono
da un file delle auto, creato una volta sulla macchina su cui gira il gioco:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Senza, ogni auto è disegnata come **l'auto propria del viewer** del suo tipo e della sua epoca:
berlina, coupé, hatchback, station wagon, sportiva, supercar, muscle car, fuoristrada, pickup, furgone o
microcar, ciascuna come classica (prima del 1980), anni 80 e 90, o moderna
([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Sono costruite qui
da proporzioni generiche: nessun logo, nessun nome di modello e nulla dai file di alcun gioco, quindi vengono
distribuite con il viewer. Il tipo viene dal nome dell'auto, l'epoca dall'anno che c'è dentro; un'auto con
nessuno dei due è presa dalla sua classe. Un centinaio di generazioni reali sono note dalla lunghezza,
larghezza, altezza e passo pubblicati ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts);
una riga ciascuna, arrotondata), così una 3 Serie degli anni 90 ha la dimensione e la sagoma di quell'auto,
sempre come forma semplice senza stemma né calandra.

Il file delle auto si crea sulla tua macchina, dalla tua copia del gioco. Contiene un modello a basso
dettaglio di ogni auto, circa 900 triangoli, con le posizioni delle ruote (vedi [il comando `cars`
dell'estrattore](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Carica file auto...** nelle impostazioni della vista, oppure trascinare il file sulla scheda gara, lo
carica; resta in questo browser. Contiene le forme del gioco, quindi non è qualcosa da passare ad altri, e
il viewer non ne include nessuno.

Quale auto fa da controparte a quella di un giro viene calcolato ogni volta da ciò che è caricato, e mai
memorizzato: così un'auto senza controparte oggi ottiene la propria non appena un file più recente la contiene
([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Auto del giro | Disegnata come |
|---|---|
| il suo numero è nel file per lo stesso gioco | proprio quell'auto |
| stessa marca, e una parola del modello nel nome | quel modello, il più vicino per anni |
| stessa marca, stessa generazione | l'auto di quella marca più vicina per anni |
| qualsiasi altra, con un file delle auto | la più vicina della stessa marca se c'è, altrimenti lo stesso tipo di carrozzeria, più vicina per anni |
| una monoposto, dal nome | la monoposto sotto |
| nessuna delle prime due, e il viewer conosce l'auto dalla sua dimensione | l'auto propria del viewer alla dimensione di quell'auto reale, con o senza file |
| qualsiasi altra senza file | l'auto propria del viewer di quel tipo e di quell'epoca |

Quindi un giro dell'auto di un altro gioco, una BMW Serie 3 del 1990, mostra una BMW di circa quell'anno, e
un'auto più recente del file mostra la sua parente più vicina finché il file non viene rifatto. Il suggerimento
di un giro, e la riga sotto la dimensione dell'auto per il giro in focus, dicono cosa viene disegnato e quanto
è vicino.

Le auto proprie del viewer hanno i finestrini scuri. I modelli di un file delle auto sono di un solo colore,
perché il file non ha vernice né vetri da cui partire. Le ruote, i fanali posteriori, i fari e i simboli di
telemetria sotto sono disegnati come sulla monoposto; l'asta della sospensione corre lungo l'esterno della
ruota, dove si vede, e i bracci oscillanti sono omessi.

**La monoposto** è una ruota aperta nel colore del giro, così il muso si riconosce da ogni angolazione e nulla
nasconde le ruote: scocca, copertura del motore, pance laterali, abitacolo con casco, halo, fondo, ali anteriore
e posteriore; quattro ruote tonde, le anteriori girate dallo sterzo (fino a 0,5 rad a fondo corsa), ciascuna su
due bracci oscillanti con mozzo, barra di sterzo (anteriore) o semiasse (posteriore), e un'asta della sospensione.
Il modello è abbassato di 0,3 m rispetto alla posizione registrata perché le ruote stiano sulla strada, e scalato
con **Dimensione delle auto**.

**La carrozzeria si muove sulle molle**: quando il giro ha tutte e quattro le corse delle sospensioni, ogni angolo
scende della propria corsa (esagerata a 0,12 m dalla massima estensione alla massima compressione perché si veda
da una camera inseguimento), e la carrozzeria affonda, beccheggia e rolla sul piano passante per le quattro.

**Ciò che si disegna dalla telemetria** (con *Pneumatici e sospensioni* attivo) segue la
[tabella dei canali](race-charts-and-hud.md#the-channel-table):

| Simbolo | Da | Disegno |
|---|---|---|
| colore dello pneumatico | `tireTemp` | lo pneumatico stesso, da blu (freddo) a ciano, verde (in temperatura), giallo, rosso (caldo), su 40-130 °C |
| anello di slittamento | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (il più grande) | un anello a terra sotto la ruota, verde con aderenza disponibile, ambra a 0,66, rosso a 1 (il limite dell'aderenza come lo riporta il gioco); tenue sotto 0,3 |
| barra della sospensione | `suspension` (0..1) | l'asta colorata per corsa: blu estesa, bianca a metà, rossa compressa |
| bagliore dei freni | `brakeTemp` (100-900 °C) | un disco sulla faccia esterna della ruota, da scuro ad arancione |
| fascia di usura | `tireWear` (0..1) | una fascia sul bordo del battistrada, da bianca (nuovo) a rossa (consumato) |
| barra del carico | `wheelLoad` (0-12 000 N) | un palo accanto alla ruota alto quanto il carico |

I fanali di stop (la luce di pioggia e i bordi delle ali) si accendono con il pedale del freno. Ogni canale
`lamp` che è acceso (sopra metà della sua scala) accende un fanale sopra la presa d'aria nel suo colore: ABS
in azione, controllo di trazione in azione, DRS, limitatore di corsia box, freno a mano, in aria.

**In una folla** (più di 10 auto visibili), le auto non guardate sono disegnate semplici: carrozzeria, ali,
ruote e luce di stop soltanto.

## Etichette {#labels}

Fissate alla pista e posizionate a ogni fotogramma dalla proiezione della camera (fuori schermo o dietro la
camera, nascoste). Con **Etichette** attivo:

| Etichetta | Dove | Clic |
|---|---|---|
| nomi delle curve (`T1`, `T2` …) | sopra la corda di ogni curva sul riferimento | - |
| distintivi numerati 1-5 | le cinque perdite di guida più grandi del giro in focus, al centro del tratto di ogni causa, con bordo nel colore della causa; passando sopra, titolo e costo | allinea e riproduce quel risultato |
| etichette di urto / incidente | sopra ogni raffica del giro **in focus**: "Incidente −45 km/h" / "Urto −12 km/h"; passando sopra, la descrizione completa e il suggerimento | allinea e riproduce l'urto |
| etichette delle curve della mappa degli errori (al posto dei nomi delle curve e dei distintivi, quando la mappa è quella degli errori) | alla corda di ogni curva: "T3 · 5/40 frenata anticipata" (l'errore più comune, giri che l'hanno fatto / giri che hanno guidato la curva), "T3 · 5/40" quando è scelto un tipo, "T3 · pulita" quando nessuno; passando sopra, le perdite della curva e i suoi cinque errori più comuni | apre o chiude quella curva nelle statistiche del percorso |

## Mondi specchiati {#mirrored-worlds}

Il mondo del viewer è destrorso con Y in alto: visto dall'alto, un'auto la cui direzione di marcia
`atan2(dx, dz)` cresce sta girando a sinistra. Un gioco con un mondo sinistrorso - Forza tra questi - risulta
specchiato: ogni curva a destra disegnata come curva a sinistra, tracciato e giri compresi.

I giri lo dicono da soli ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)):
percorrendo ogni giro a piccoli passi di alcuni metri (3 m), la sterzata del suo percorso viene confrontata con
la compressione della sospensione esterna (`suspension.FR` meno `suspension.FL`) e, senza sospensioni, con lo
sterzo (positivo a destra in ogni adattatore). Un giro che gira meno di π in totale non dice nulla; la prova
conta quando supera il 2% della sterzata. I giri votano; una parità è "impossibile dire".

Quando il verdetto dei giri non concorda con l'inversione attuale degli assi (un numero dispari di assi
invertiti in **Camera e scena → Inverti l'asse del mondo**), la sezione **Giri** lo dice sotto l'elenco:

- il gioco è specchiato e non è invertito nulla: "Questi giri sterzano a destra dove il percorso è disegnato
  che curva a sinistra …" con **Inverti X**;
- gli assi sono invertiti ma i giri non sono specchiati: "Gli assi invertiti disegnano questi giri specchiati
  …" con **Ripristina gli assi**.

Cambia solo il disegno - una riflessione inserita nella matrice di vista; i dati, l'analisi e ogni coordinata
che mostrano gli strumenti restano quelli del gioco. L'inversione resta nel browser. L'analisi chiama le curve a
sinistra o a destra con la stessa misura (un mondo sconosciuto è preso come specchiato, come quello di Forza).

## Per sviluppatori {#for-developers}

Codice: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Cosa è un'auto in un istante {#what-a-car-is-at-a-moment}

`stateAt` interpola ogni canale tra i due campioni attorno al tempo del giro. I canali a gradini (marcia,
bandiere) prendono il campione più vicino. Un giro finito si ferma sulla linea.

**Direzione.** La direzione di marcia viene dalle posizioni a qualche metro di distanza (almeno 2 m per lato,
così una oscillazione non gira l'auto). La direzione della carrozzeria viene dall'imbardata del gioco solo quando
è adattata alla direzione di marcia - segno e offset, per media circolare sui campioni più veloci di 10 m/s (almeno
20) - e solo se poi concorda con essa (varianza circolare sotto 0,05, circa 18° di dispersione); altrimenti la
carrozzeria punta lungo la direzione di marcia. Così una scivolata resta visibile (carrozzeria e marcia divergenti)
senza fidarsi della convenzione d'angolo di un gioco.

**Sterzo e lati.** Quale verso faccia girare l'auto uno sterzo positivo, e da quale lato stiano le ruote destre del
gioco, si misurano dal giro: lo sterzo contro la sterzata del percorso, e quale lato delle sospensioni si comprime
all'esterno delle curve (senza dati di sospensione, i giochi Forza sono presi come specchiati).
