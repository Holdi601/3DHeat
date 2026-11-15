---
title: "Analisi curva per curva"
parent: "Analisi di gara"
nav_order: 55
lang: "it"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analisi curva per curva

Due giri dello stesso percorso si confrontano curva per curva. Per ogni curva il viewer dice chi è stato più veloce, quanto tempo ha valso e perché - frenato troppo presto, ripreso il gas tardi, preso una traiettoria più larga - così sai cosa allenare per primo.

![Un risultato aperto in Dove migliorare, accanto alla tabella Curva per curva](../assets/img/en/race-corner-finding.webp)

Un esempio svolto: nella curva 3, Driver A frena 20 m prima di Driver B e perde 0,15 s per arrivarci, ma è sul gas prima e guadagna 0,15 s in uscita. Netto 0,00 s: la curva è pari, e a nessuno viene detto di frenare più tardi.

## Cosa si vede {#what-you-see}

### Dove migliorare {#where-to-improve}

La sezione della barra laterale per il giro in focus ("Carica almeno due giri dello
stesso percorso." finché non ce ne sono).

**La testa:** "<giro> <tempo> contro <riferimento> <tempo>" e il distacco sul
giro - oppure, per il riferimento, "contro il giro più veloce tra gli altri in
ogni curva (…)" e il totale che ha perso. Accanto, la perdita divisa in *guida* e
*auto / contesto*.

**La barra di ripartizione:** il tempo perso per gruppo di causa (frenata, ingresso,
uscita, rettilineo, auto, contesto), con i colori delle cause, con una legenda.

**I risultati**, in tre elenchi:

1. Perdite di guida, dalla più costosa, al massimo **12** - oppure "Da nessuna
   parte guidare in modo diverso farebbe guadagnare tempo in modo evidente."
2. **Mostra quanto è costata l'auto o la situazione (X s)** - perdite dell'auto e del
   contesto, al massimo 8 (attivo di default).
3. **Dove <giro> è più veloce, o pari in altro modo (N)** - guadagni e curve pari,
   al massimo 10 (attivo di default).

Ogni risultato mostra il suo numero d'ordine, il titolo (la curva e cosa è
successo, con il costo per una perdita), la riga del verdetto, il costo (i guadagni
con un segno meno) con una barra, e un'etichetta: *frenata*, *ingresso*, *uscita*,
*rettilineo* (perdite di guida, con "· auto X" quando l'auto ne spiega 0,02 s o
più), *auto*, *contesto*, *più veloce*, *pari*. **Clicca su uno** per allineare le
auto 40 m prima, inquadrarlo e rivederlo, e aprirne le misure:

- **Frenata:** dove ognuno ha frenato (o alzato il piede) e da quale velocità, e di
  quanti metri prima o dopo (da 5 m);
- **Punto più lento:** la velocità minima di ogni giro e dove;
- **Tutto gas:** dove ognuno era a tutto gas, e di quanto prima o dopo;
- **Traiettoria:** differenza al punto di corda, raggi più stretti, di quanto
  dentro o fuori si è stati, e la forma della linea di ogni giro e la sua corda;
- **Rettilineo fino alla curva successiva:** la sua lunghezza, le due velocità dove
  entrambe erano a tutto gas, cosa ha perso o guadagnato e per quale motivo - la
  velocità di partenza, la spinta più forte dell'altro, un alzare il piede, velocità
  persa per strada, come è stato guidato (parti da 0,02 s);
- **L'auto:** quanta parte della perdita è dell'auto, e di cosa (spinta, aderenza,
  freni; quando è 0,02 s o più);

poi il suggerimento, **Le auto:** (con auto diverse, vedi
[Profili delle auto](race-car-profiles.md#what-the-cars-decide-in-a-corner)), e il
consiglio sulla linea.

### Curva per curva {#corner-by-corner}

Una tabella (con due o più giri), una riga per segmento, della classe del giro in
focus quando ci sono più classi:

| Colonna | Mostra |
|---|---|
| Curva | `T3`, `T11-T12` |
| Il più veloce | il giro più veloce in quel tratto (il suo tempo dall'inizio alla fine del segmento) |
| margine | il suo vantaggio sul secondo più veloce, in s |
| traiettoria | la forma della linea del giro più veloce e la sua corda ("V · tardiva", "U/V · al centro"); passandoci sopra: i suoi raggi più stretto, in ingresso e in uscita; "in entrambi i modi" per un complesso misto |
| (il giro in focus) | quanto è stato indietro rispetto al più veloce, o ✓ quando era il più veloce |

Cliccando una riga si apre lì il risultato del giro in focus (o si allineano le auto
40 m prima del segmento). Sotto la tabella, quando ogni curva ha un tempo: "Il più
veloce in ogni curva, messo insieme: <tempo> (± sul riferimento / sul migliore della
classe X)" - i migliori segmenti più il giro più veloce fino alla prima curva, quando
quel tratto è un tratto a sé.

## Come si calcola {#how-it-is-worked-out}

La regola guida: **una curva si giudica intera**, dalla zona di frenata per essa
fino a quella per la successiva. Un giro che frena prima per girare l'auto e riprendere
prima la potenza viene riconosciuto per l'uscita che si è procurato, e non gli si dice
di frenare più tardi.

## Un solo asse di distanza {#one-distance-axis}

I giri si confrontano per distanza, non per tempo - con un secondo di ritardo, due
giri sono in curve diverse. Né per il contachilometri di ciascun giro (una linea più
stretta copre meno metri). Il percorso guidato dal **riferimento** è l'asse:

- Ogni campione degli altri giri viene **proiettato** sul percorso di riferimento:
  ogni campione riceve `s`, quanto è avanti lungo il riferimento, e `d`, quanto è a
  sinistra (positivo) o a destra. La ricerca va in avanti dalla corrispondenza
  precedente (da 8 segmenti del percorso indietro a 40 avanti), così un giro che
  attraversa sopra o sotto se stesso non scatta mai sull'altro incrocio. Il primo
  campione viene cercato nel primo quarto del percorso (su un circuito, partenza e
  arrivo coincidono); quando nulla è entro 30 m, si prende il punto più vicino ovunque
  non indietro rispetto all'ultima corrispondenza (dopo un testacoda o una
  deviazione). `s` non diminuisce mai: un campione che si proietta dietro quello
  precedente viene trattenuto.
- Ogni canale viene **ricampionato** su una sola griglia, **ogni 2 m**, in modo
  lineare; i canali a gradini (marcia, bandiere) prendono il campione più vicino. Fuori
  dalla propria estensione di un giro, i valori sono vuoti.
- Il primo e l'ultimo campione di un giro si proiettano un poco dentro gli estremi del
  riferimento, quindi ogni giro viene **prolungato fino a 15 m** oltre i suoi estremi
  alla velocità che aveva (il tempo cresce con la distanza diviso per la velocità, il
  resto resta) - così il suo delta alla linea è la sua differenza di tempo sul giro.
- `delta` = il tempo del giro in ogni punto della griglia meno quello del riferimento:
  il distacco. `lateral` = `d` sulla griglia.

Il tempo che un giro ha impiegato in più di un altro tra due punti della griglia è la
differenza dei loro delta: `rel(s)`. Tutto il resto si costruisce su questo.

## Curve {#corners}

Trovate sul **riferimento** (`findCorners`), con la sua velocità smussata su ±6 m e la
sua curvatura (variazione di direzione su ±5 campioni, smussata su ±10 m):

1. **Minimi di velocità con rilievo.** Un punto che è il più basso entro ±40 m, la cui
   discesa dalla velocità più alta su ciascun lato (prima di un minimo più basso) è
   almeno `max(2,5 m/s, 6% della velocità)`.
2. **Angoli.** Un picco locale di curvatura più stretto di un raggio di **300 m**, senza
   minimo di velocità entro 80 m: un angolo preso a tutto gas è comunque una curva da
   guidare.
3. **Fasi.** Da ogni corda indietro finché il riferimento frena (> 0,1) o è fuori dal
   tutto gas (< 0,95): l'ingresso; in avanti finché è fuori dal tutto gas: l'uscita. Un
   angolo preso a gas aperto ha ±30 m. Le curve che si sovrappongono restano separate ma
   sono fatte per coprire il giro in piastrelle.
4. Numerate T1, T2 … in ordine di giro; **sinistra o destra** dal segno della curvatura e
   da se il mondo è specchiato (sconosciuto vale come specchiato).

**La finestra di curva** (dove il riferimento gira): fuori dal punto più stretto entro
±40 m dalla corda, finché la curvatura resta sopra un sesto del suo picco, più 10 m per
lato. Il suo lato dà il segno di "dentro".

## Segmenti: dalla zona di frenata alla zona di frenata {#segments-braking-zone-to-braking-zone}

Ogni curva possiede la strada a metà strada tra le corde ai due lati. In essa:

- **Il punto più lento di ogni giro** è un vero avvallamento della sua velocità - nulla
  più lento entro 6 m (3 punti della griglia) per lato, guardando oltre gli estremi del
  tratto, così l'uscita della curva precedente che ancora accelera non viene mai
  scambiata per questo - cercato da 15 m prima della finestra di curva fino a 10 m dopo.
  Un giro che lì non ha mai rallentato viene messo alla corda.
- **Dove un giro ha iniziato a rallentare per essa** (`entryOf`): indietro dal suo punto
  più lento attraverso la frenata o il rilascio, sopra brevi tratti di tutto gas, finché
  ha avuto il piede giù (gas ≥ 0,95, freno ≤ 0,1) per **10 m**; un gas ripreso negli
  ultimi **30 m** prima del punto più lento appartiene ancora alla curva; a tutto gas per
  tutto il tratto, il punto più lento stesso. Un giro senza canale del gas, o che non ha
  mai avuto il piede giù dalla curva precedente, parte dal suo punto più veloce nel
  mezzo.
- **Il segmento inizia** dal primo di tutti i giri che hanno cominciato a rallentare per
  essa (4 m prima), e arriva all'inizio della successiva, così ogni frenata di ogni giro
  è dentro di esso e i segmenti coprono il giro senza buchi.

**Complessi.** Curve consecutive che il riferimento non percorre mai a tutto gas in mezzo
- meno di **40 m** di tutto gas - sono un unico segmento, "T11-T12", guidato come un
  tutto; un complesso contiene al massimo **tre** curve (un tratto tortuoso guidato senza
  mai essere a gas aperto inizia un nuovo complesso). Un complesso che gira in entrambi i
  sensi è *misto*: per esso non si misura nessuna forma di linea.

**In un circuito** (il riferimento finisce entro 50 m da dove è partito), il rettilineo
dell'ultimo segmento continua fino alla linea, fino al primo punto di frenata: un giro
lanciato dalla linea conta il tratto con l'ultima curva. Un giro partito da fermo o da una
partenza di gara (vedi [La partenza](#the-start)) tiene quel tratto separato.

### Dove porta una curva {#what-a-corner-leads-onto}

Misurato sul riferimento: metri a tutto gas dopo la curva (dal suo tutto gas fino alla
fine del segmento, più il tratto oltre la linea) e prima di essa (la parte "dopo" del
segmento precedente, o dall'inizio).

| Tipo | Regola |
|---|---|
| **tra due rettilinei** (`both`) | 200 m o più prima **e** 120 m o più dopo |
| **su un rettilineo** | 200 m o più dopo, oppure 120 m o più dopo e almeno quanto prima |
| **dopo un rettilineo** | 200 m o più prima |
| **collegamento** | tutto il resto |

## Cosa ha fatto ogni giro in una curva {#what-each-lap-did-in-a-corner}

`cornerMetrics`, per giro e segmento, sulla griglia (passo 2 m). I pedali: il freno
conta sopra 0,1, il tutto gas è 0,95 e oltre.

| Misura | Regola |
|---|---|
| **punto di frenata** | il primo freno sotto il quale il gas è stato tolto (sotto 0,5), o che è durato **15 m** - un colpetto di piede sinistro con la potenza inserita non è dove è iniziata la frenata; con soli colpetti, il primo colpetto |
| **alzato il piede** | senza frenata, il primo punto in cui il gas è sceso sotto 0,8 |
| (nessun pedale) | il punto in cui il giro ha iniziato a rallentare (sopra) |
| **rilascio del freno** | l'ultima frenata fino a 30 m oltre il punto più lento |
| **velocità al punto di frenata**, **metri di frenata** | fino al punto più lento |
| **frenata massima**, **decelerazione massima** | sulla zona di frenata (accelerazioni oltre 45 m/s² ignorate) |
| **frenata in curva** | metri con freno > 0,05 e \|sterzo\| > 0,1 |
| **slittamento in bloccaggio** | il rapporto di slittamento della ruota più negativo nella zona (quando il giro ha dati di slittamento) |
| **punto più lento**, **velocità minima** | come sopra |
| **gas riaperto** | dopo il rilascio (o il punto più lento), il primo gas > 0,15 senza freno |
| **tutto gas** | il primo punto dopo, tenuto ≥ 0,95 per 10 m |
| **in inerzia** | metri dal rilascio al gas riaperto con freno e gas entrambi sotto 0,05 |
| **cali del gas** | volte in cui il gas è sceso più di 0,25 sotto il suo massimo corrente tra il gas riaperto e il tutto gas |
| **laterale massima** | la massima accelerazione laterale da 20 m prima del rilascio fino al più tardi tra il tutto gas e 20 m oltre il punto più lento |
| **marcia alla corda** | al punto più lento |
| **pattinamento in spinta** | il massimo rapporto di slittamento delle ruote motrici tra il gas riaperto e il tutto gas |
| **bilanciamento** | angolo di deriva anteriore meno posteriore nel centro (+ sottosterzo) |
| **rettilineo a tutto gas** | la quota del segmento dopo il tutto gas (e del tratto oltre la linea) a ≥ 0,95; l'alzata più lunga su di esso |
| **velocità persa** | la massima velocità persa da un picco con gas ≥ 0,9, senza freno, a terra |
| **deriva in ingresso** | il massimo angolo di deriva dal punto di frenata fino a 5 m oltre il punto più lento, a terra |
| **freno a mano** | dove è entrato (> 0,2), fino a 10 m oltre il punto più lento |
| **aria** | secondi in aria nel segmento, e il suo volo più lungo |

## Con chi si confronta ogni giro {#who-each-lap-is-compared-with}

- Un giro si confronta con il **giro completo più veloce della propria classe di
  prestazione** (il riferimento, nella classe del riferimento).
- Quel giro migliore di classe (e il riferimento) si confronta, segmento per segmento,
  con **l'altro giro della sua classe più veloce** in quel tratto - o con tutti i giri,
  quando è l'unico della sua classe.

La mappa dei tempi, i distacchi nell'elenco dei giri, gli eventi di controllo dell'auto
e la tabella delle curve seguono lo stesso confronto.

## Il conto del tempo di una curva {#the-time-account-of-a-corner}

`compareCorner`, per un giro contro l'altro su un segmento:

- **netto** = `rel(fine) - rel(inizio)` (più il tratto oltre la linea su un giro lanciato):
  il verdetto. Più vicino di **0,03 s** è **pari**.
- **La divisione** - dove, dentro la curva, il giro di testa ha girato: nel tratto dal
  primo punto di frenata o punto più lento di uno dei due giri fino al più tardi tra il
  loro tutto gas e il loro punto più lento, la più grande oscillazione che il giro ha poi
  restituito o recuperato, quando quell'oscillazione supera **0,04 s**; altrimenti il più
  tardi dei due punti più lenti.
- **Alla corda** = `rel(divisione) - rel(inizio)`; **dopo** = netto meno quello. Quando
  entrambi sono almeno 0,04 s e di segno opposto, il giro ha **tradato** l'uno per
  l'altro.
- **Dopo la corda** si divide di nuovo dove entrambi i giri sono a tutto gas: l'**uscita**
  (dalla divisione al tutto gas più tardi) e il **rettilineo** (da lì alla fine).
- **Il rettilineo** si divide in tre:
  - *velocità in uscita* (`byExit`) - misurata, non modellata: l'auto più lenta passa la
    velocità di partenza di quella più veloce un po' più avanti sul rettilineo, e da lì la
    sua stessa traccia è ciò che avrebbe fatto da quella velocità, con il proprio rapporto
    del cambio, la propria resistenza e la propria pendenza dentro. Riportata indietro a
    quel punto (e proseguita alla sua velocità finale per i metri che guadagna) è il suo
    tempo dalla partenza più veloce; la differenza è il costo della velocità in uscita. Se
    l'auto più lenta non raggiunge mai quella velocità (o solo negli ultimi 2 campioni), la
    sua accelerazione propria lungo il tratto viene rimessa come potenza (`a·v` tenuto
    costante), mai più forte di quanto mostri il suo inviluppo a quella velocità (il doppio
    dell'accelerazione misurata, senza inviluppo).
  - *la spinta delle auto* (`byPower`) - solo con auto diverse: entrambe le auto dalla
    stessa velocità sugli stessi metri, a tutto gas, integrando l'accelerazione a tutto gas
    che ognuna ha mostrato a ogni velocità.
  - *come è stata guidata* (`driven`) - il resto: un alzare il piede, velocità persa a gas
    aperto.

  La velocità in uscita non spiega mai più del costo del rettilineo (e mai con il segno
  opposto), a meno che un alzare il piede o la velocità persa non ne abbia riprese alcune.
  Un giro **ha alzato il piede** sul rettilineo quando la sua quota a tutto gas è sotto sia
  0,9 sia la quota dell'altro meno 0,05. La velocità persa conta quando i due differiscono
  di più di 1 m/s. Un disaccordo sotto 0,02 s nel segno viene posto a 0.

Ogni netto di segmento somma la differenza di tempo sul giro, e il netto di ogni curva
somma alla corda e a dopo la corda (i test verificano entrambe le cose).

### La quota dell'auto {#the-cars-share}

Solo quando i giri sono su **auto diverse** e il giro ha perso tempo (`carShare`):

- **spinta**: la spinta delle auto sul rettilineo (sopra), fino alla perdita;
- **aderenza**: quando il giro era al limite della sua auto (accelerazione laterale al
  centro di almeno il **90%** di ciò che l'auto tiene a quella velocità) e l'altra auto
  tiene più del **5%** in più: della velocità minima più bassa non spiegata da un raggio
  più stretto, la quota `½ ln(grip_altro / grip_mio) / ln(v_altro / v_mio)` della perdita
  residua;
- **freni**: quando il giro ha frenato (non alzato il piede), l'altra auto frena più del
  **5%** più forte, e la decelerazione *media* del giro nella zona è stata almeno l'**80%**
  di ciò che la sua auto può fare: da `u` a `v` con `a1` contro `a2`, fino allo stesso
  punto, `(1/a1 - 1/a2)(u - v)² / 2u`, fino a ciò che resta.

Il costo dell'auto è la somma, al massimo la perdita.

## Il verdetto e il risultato {#the-verdict-and-the-finding}

`cornerFinding` scrive al massimo un risultato per giro e curva, provando in questo ordine:

| Caso | Risultato | Esito |
|---|---|---|
| netto entro ±0,03 s, un tradato, il lato più piccolo ≥ **0,1 s** | **pari, in due modi** - chi era lento in entrata e veloce in uscita, e chi il contrario; con un rettilineo dopo (su un rettilineo, o tra due), il modo lento-in-entrata-veloce-in-uscita è quello su cui costruire: tenere il gas anticipato, recuperare l'ingresso frenando più forte, non più tardi | pari |
| netto entro ±0,03 s altrimenti | nulla da dire | - |
| guadagnato, un tradato, perso alla corda | **lento in entrata, veloce in uscita ha pagato**: tenerlo, qui l'uscita vale di più | guadagno |
| guadagnato, un tradato, guadagnato alla corda | **più veloce in entrata**: l'ingresso è giusto, un tutto gas anticipato ne terrebbe di più | guadagno |
| guadagnato, e l'altro giro ha una perdita qui | **più veloce - per quello che ha fatto l'altro**, la sua causa e il suo consiglio, con "Per l'altro giro: …" | guadagno |
| guadagnato altrimenti | **più veloce in entrata / in uscita**, a seconda della metà che ha guadagnato di più (frenare più tardi, più velocità nel mezzo; oppure partire prima, spinta più forte) | guadagno |
| perso, e un **urto o incidente** costato almeno `max(0,05 s, 40% della perdita)` | l'urto è la storia della curva, prima delle auto | perdita |
| perso, e la **quota dell'auto** è 60% o più | **l'auto**: la sua spinta sul rettilineo, la sua aderenza nel centro, o i suoi freni - la parte più grande; con la parte del pilota (≥ 0,03 s) detta come "L'altro X s: …" | perdita |
| perso, e un **guasto di controllo dell'auto** non condiviso, costato almeno `max(0,05 s, 40%)` | quel guasto (vedi sotto), con come il tempo si è spostato intorno ad esso | perdita |
| perso, e un **volo più lungo** costato almeno `max(0,05 s, 40%)` | il volo | perdita |
| perso, un tradato, guadagnato alla corda | **troppo veloce in entrata, lento in uscita**: la causa dell'uscita; cedere un po' di ingresso per essere girati e a gas prima, con i punti di frenata e di tutto gas dell'altro giro. La sua radice (`cause`, quella che contano le [statistiche](race-course-statistics.md)): frenare più tardi, quando ha frenato più di pochi metri dopo l'altro; altrimenti la causa dell'uscita | perdita |
| perso, un tradato, perso alla corda | **ha ceduto più in entrata di quanto l'uscita recuperasse**: la causa dell'entrata, che è anche la sua radice (`cause`); tenere l'uscita, perdere meno in entrata | perdita |
| perso, alzato il piede sul rettilineo, e la parte guidata oltre metà della perdita | **non a tutto gas sul rettilineo**: quota a tutto gas rispetto a quella dell'altro, dove e per quanto tempo l'alzata | perdita |
| perso, la spinta delle auto oltre il 60% della perdita e il rettilineo oltre metà | **la spinta dell'auto sul rettilineo** (con la spinta di entrambe le auto a 160 km/h) | perdita |
| perso altrimenti | la causa della metà che ha perso di più (alla corda ≥ dopo, quella dell'entrata; altrimenti quella dell'uscita). Più lento in uscita solo perché più lento nel mezzo (di più di 1 m/s): invece la causa del mezzo | perdita |

Un risultato su una perdita può chiudersi anche con **Inoltre:** - velocità persa a
tutto gas, o un alzare il piede sul rettilineo - quando la parte guidata del rettilineo
è costata più di 0,04 s e non era già la causa.

I risultati sono ordinati prima le perdite, dalla più costosa; poi guadagni e curve
pari.

### Cause in entrata {#causes-on-the-way-in}

`entryCause`, la prima che si applica (le differenze di velocità minima sono in m/s;
"5 m" è la soglia perché un punto anticipato o ritardato conti):

| # | Causa (errore) | Regola |
|---|---|---|
| 1 | un urto o incidente in entrata | un impatto non condiviso che inizia entro 10 m dopo il punto più lento |
| 2 | **quasi fermo** (incidente) | velocità più bassa sotto il **60%** di ciò che l'aderenza di questa auto permette dove l'altro è passato (`v_altro · √(grip_mio / grip_altro)` quando l'altra auto tiene di più, altrimenti la velocità dell'altro), il giro dell'altro sopra 8 m/s - un testacoda, un contatto o una curva mancata |
| 3 | un guasto di controllo dell'auto in entrata | un bloccaggio, una spinta, un testacoda o una scivolata non condivisi, non a gas aperto, che iniziano entro 10 m dopo il punto più lento, costati ≥ 0,02 s |
| 4 | un volo più lungo prima del punto più lento | vedi [rally](#rally-rotation-and-flights) |
| 5 | **alzato il piede** dove l'altro era a tutto gas o aveva alzato il piede 5 m o più dopo | questo giro ha solo alzato il piede |
| 6 | **frenato dove l'altro aveva solo alzato il piede** o era a tutto gas | ed era più lento nel mezzo di più di 0,5 m/s |
| 7 | **frenato dolcemente** | ha frenato (non alzato il piede), aveva margine per frenare più forte - con i dati degli pneumatici, il suo slittamento in bloccaggio sotto il **60%** dello slittamento dove i freni di questa auto danno il meglio; senza, una decelerazione massima sotto l'**85%** di ciò che mostra a quella velocità - il pedale sotto 0,95, e la decelerazione massima dell'altro giro più alta di oltre il **15%** |
| 8 | **frenato presto** - o **i freni dell'auto** | ha frenato più di 5 m prima dell'altro. In un'altra auto i cui freni sono più forti del 5%, e con non più di 10 m di margine rispetto alla distanza che quest'auto richiede alla propria decelerazione: i freni dell'auto. Altrimenti frenato presto, con "Frena più tardi - circa N m" (in un'altra auto, i metri oltre quelli che le servono) |
| 9 | **in inerzia** | più di 10 m senza nessuno dei due pedali, e 5 m in più dell'altro |
| 10 | **più lento nel mezzo** | più di 0,5 m/s più lento nel punto più lento; diviso con `v² = a·R` (sotto) |
| 11 | **arrivato più piano** | oltre 1 m/s più lento al punto di frenata, senza frenata presto: deciso prima - dalla curva precedente e dalla spinta dell'auto, oppure da un volo nella curva precedente più lungo di 0,2 s. È dell'auto quando le auto sono diverse |
| 12 | più lento alla corda | altrimenti: rilasciare il freno più dolcemente e portare più velocità nel mezzo |

**Più lento nel mezzo** (`middleSplit`): il raggio di ogni giro nel suo punto più lento
è misurato dal proprio percorso (±8 m), la sua accelerazione laterale come `v²/R`, e

`ln(v_altro / v_mio) = ½ ln(a_altro / a_mio) + ½ ln(R_altro / R_mio)`.

- Il raggio spiega **metà o più**: **linea troppo stretta** - "usa più strada", con
  entrambi i raggi e la quota.
- Al limite dell'auto (in sbandata oltre 10° di deriva su asfalto / 20° su fondo smosso,
  o accelerazione laterale di almeno il 90% di ciò che tiene a quella velocità) e l'altra
  auto tiene più del 5% in più: **l'aderenza dell'auto**; proteggere invece l'uscita.
- Scivolando nella curva (deriva oltre 10° / 20°) e l'altro giro no (la sua deriva
  d'ingresso di almeno 4° in meno): **di traverso** - oltre la sua aderenza, non sotto di
  essa; arrivare un po' più piano. Detto come dell'auto quando questa auto prende il
  retrotreno almeno una volta a giro in più dell'altro.
- In un'altra auto che tiene sotto il **96%** dell'aderenza dell'altra, e il giro ha
  portato entro 1 m/s di `v_altro · √(grip_mio / grip_altro)`: **l'aderenza dell'auto** -
  "frenare più tardi non lo colmerà".
- Altrimenti **aderenza da avanzare**: accelerazione laterale rispetto a quella dell'altro
  su un raggio simile, e ciò che questa auto tiene. Portare più velocità alla corda. Dove
  il retrotreno di questa auto cede prima che l'aderenza sia usata del tutto (le sue
  scivolate iniziano sotto l'85% della sua aderenza, e il giro era all'80% di quella),
  trovare il resto a piccoli passi.

### Cause in uscita {#causes-on-the-way-out}

`exitCause`, la prima che si applica:

| # | Causa (errore) | Regola |
|---|---|---|
| 1 | un guasto di controllo dell'auto in uscita | pattinamento, testacoda, scivolata o urto non condivisi che finiscono a 10 m o più prima del punto più lento, o dopo |
| 2 | **velocità persa** | più di 1 m/s di velocità persa a tutto gas rispetto all'altro; oltre **7 m/s (25 km/h)** "più simile a un contatto o a un testacoda che a una scivolata" |
| 3 | **girato l'auto male** (fondo smosso) | vedi [rally](#rally-rotation-and-flights) |
| 4 | **sul gas più tardi** | gas riaperto più di 5 m più tardi, contato anche dal punto più lento di ciascun giro (un giro con il punto più lento più tardi non è incolpato per un gas più tardi) |
| 5 | **esitato sul gas** | più cali del gas dell'altro |
| 6 | **andato largo e aspettato** | più di 1,5 m fuori dall'altro dove entrambi erano senza gas, e tutto gas più di 5 m dopo dal proprio punto più lento |
| 7 | **tutto gas più tardi** | tutto gas più di 5 m più tardi, anche dal proprio punto più lento; con l'accelerazione dell'auto lì |
| 8 | **la spinta dell'auto** | in un'altra auto che spinge sotto il 95% dell'altro a quella velocità, e la spinta spiegava parte del rettilineo |
| 9 | **più lento in uscita dalla curva** | altrimenti: una corda più tardiva, quindi l'auto dritta prima |

Quando i due giri erano in marce diverse al punto più lento, il consiglio finisce con
"Marcia N alla corda; l'altro ha usato M."

### Guasti di controllo dell'auto e urti {#car-control-faults-and-impacts}

Un guasto degli [Eventi di controllo dell'auto](race-control-events.md) come causa: un
bloccaggio è una causa *di frenata*, un pattinamento o una scivolata a gas aperto una
causa *d'uscita*, il resto *d'ingresso*; un urto dopo il punto più lento è *d'uscita*,
prima di esso *d'ingresso*. Il consiglio è quello dell'evento, poi "È costato circa X s
fino a 40 m dopo" (o "fino a quando l'auto ha ripreso la sua velocità" per un urto). Un
bloccaggio con un punto di frenata più di 5 m prima dell'altro aggiunge che il giro ha
frenato presto anche - con le ruote che girano, non ne avrebbe avuto bisogno.

### Rally: rotazione e voli {#rally-rotation-and-flights}

Su **fondo smosso**, con angoli di deriva su entrambi i giri, e questo giro a gas (o a
tutto gas) più di 5 m più tardi:

- **Ha girato meno l'auto**: l'altro l'aveva girata di **12°** o più entro il suo punto più
  lento, e di almeno **8°** più di questo giro. Consiglio: alzare il piede o dare un colpo di
  freno sinistro mentre entra in curva, con il punto di freno a mano dell'altro giro quando
  solo lui lo ha usato, oppure il freno a mano in una curva più lenta di 15 m/s (54 km/h).
- **L'ha girata troppo**: questo giro l'aveva girata di 12° o più, e di almeno **12°** più
  dell'altro: doveva essere raddrizzata prima che la potenza potesse scendere.

**Un volo più lungo**: in aria 0,2 s o più rispetto all'altro, costato almeno 0,03 s da 10 m
prima del decollo fino a 40 m dopo l'atterraggio (o alla fine del segmento). Prima del
punto più lento è una causa d'ingresso; diventa la storia della curva quando spiega il 40%
o più. Il consiglio: tenere il gas al decollo, prendere il dosso un po' più piano o con un
colpetto di freno.

### La partenza {#the-start}

Prima della prima curva, in uno sprint o quando uno dei due giri è partito da fermo (sotto
5 m/s dove entrambi sono i primi sull'asse) o da una partenza di gara (sotto il 60% della
velocità dell'altro), il tratto fino al primo punto di frenata è un risultato a sé (curva 0)
quando differisce per più di 0,03 s: *Lo scatto*, *La partenza della gara* o *Fino alla prima
curva*. Una perdita lì viene attribuita alla situazione (*contesto*) quando un giro è partito
da una partenza di gara e l'altro in velocità, all'auto quando i giri sono su auto diverse,
e al pilota altrimenti. Consigli: in un'altra auto partita da fermo, "soprattutto l'auto"; una
partenza da fermo con la stessa auto, scattare con meno pattinamento e cambiare in cima alla
potenza; una partenza di gara, confrontarla con un altro primo giro; una partenza lanciata,
un'uscita migliore dall'ultima curva si porta oltre la linea.

## La traiettoria percorsa {#the-driven-line}

`lineMetrics`, per giro e segmento (non per complessi misti), dalle sole posizioni (smussate
±2 campioni) sulla finestra di curva:

| Misura | Regola |
|---|---|
| curvatura | variazione di direzione su ±8 m del proprio percorso del giro |
| **raggio più stretto** | 1 / il picco di curvatura |
| **inizio curva** / **uscita dalla curva** | dove la curvatura supera per la prima / ultima volta un quinto del suo picco |
| **metà** | dove il giro ha girato metà della sua variazione di direzione |
| raggio in entrata / uscita | metri percorsi per metà della variazione di direzione, prima / dopo il centro |
| **forma** | raggio più stretto diviso per il raggio medio mentre gira: sotto **0,55** una **V**, sopra **0,75** una **U**, tra i due "U/V" |
| **corda** | raggio in uscita diviso per raggio in entrata: sopra **1,25** tardiva, sotto **0,8** anticipata, altrimenti al centro |
| **corda di velocità** | il punto più lento più di **15 m** prima del centro: entrare piano, uscire forte; più di 15 m dopo: sta ancora frenando oltre il centro |

Rispetto all'altro giro: di quanto è rimasto dentro (+) o fuori al punto di inizio curva,
attraverso la parte più stretta e dove entrambi erano senza gas (detto da 1 m); dove ognuno
ha iniziato a girare (detto da 8 m).

### Quale linea si addice a quest'auto qui {#which-line-suits-this-car-here}

`lineFor`, da dove porta la curva e dal carattere dell'auto in questa curva:

- **potenza-aderenza** = l'accelerazione a tutto gas dell'auto alla velocità di uscita,
  diviso la sua aderenza alla velocità minima (dal suo inviluppo). **Point and shoot** da
  **0,45** in su; **momentum** da **0,25** in giù.
- **carico aerodinamico**: aderenza a 151-252 km/h diviso aderenza a 54-108 km/h di
  **1,15** o più, per una curva presa a **144 km/h** (40 m/s) o più veloce - allora è una
  curva di momentum qualunque sia la potenza. Non giudicato su fondo smosso.

| Tipo di curva | Auto | Linea |
|---|---|---|
| dopo un rettilineo | point and shoot / altro | V / U, corda al centro: "la zona di frenata è il premio" |
| tra due rettilinei | momentum / altro | U / V, corda tardiva |
| collegamento | momentum / altro | U / V, corda al centro: "guidala per l'uscita della successiva" |
| su un rettilineo | momentum (o una curva veloce con carico aerodinamico) | U larga e tonda, corda leggermente tardiva |
| su un rettilineo | point and shoot | V: frenare dritti, entrare tardi, ruotare in un centro corto e stretto, dritti presto |
| su un rettilineo | a metà | U con corda tardiva: entrare piano, uscire forte |

Dove conta l'uscita (su un rettilineo, tra due), la trasmissione aggiunge una frase: **FWD**
- ruotare con i freni, aggiungere potenza solo mentre la ruota si srotola; **RWD** con una
potenza-aderenza di 0,35 o più - raddrizzare prima del tutto gas; **AWD** - può prendere
potenza ancora in curva. Su fondo smosso ogni linea aggiunge: girare l'auto in entrata.

La frase poi dice cosa ha guidato il giro, e se va bene: *il punto più lento tardi lega
l'uscita* oppure *una corda anticipata lega l'uscita* dove era voluta una corda tardiva e il
giro non ha messo la corda tardi né è stato lento presto; *più tondo di quanto voglia questa
auto* dove serviva una V; *più squadrato di quanto voglia questa auto* dove serviva una U;
altrimenti *va bene così*.

## Risorse per sviluppatori {#for-developers}

Codice: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Il ragionamento e le sue fonti: [il metodo](race-analytics.md).
