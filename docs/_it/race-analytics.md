---
title: "Analisi delle gare: il metodo"
parent: "Analisi di gara"
nav_order: 58
lang: "it"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analisi di gara: il metodo

In breve:

- I giri si confrontano **per distanza**, non per tempo, così lo stesso punto del tracciato si allinea.
- Ogni curva si giudica **intera**, dalla frenata di inizio alla frenata della curva successiva.
- Il tempo perso si **divide** in dove è stato perso (frenata, ingresso, uscita, rettilineo) e in quanta parte di esso spiega l'auto.
- La causa è **spiegata a parole**, con un consiglio.
- Per usarlo, non per capire come funziona: vedi [Analisi di gara](race-analysis.md).

Questo è il metodo alla base della scheda **Analisi di gara**: cosa misura, come
decide dove è andato il tempo e come lo trasforma in consigli. È la specifica
che il codice dell'analisi (`src/race/`) segue, quindi ogni regola qui ha una
corrispondenza nel codice e un test che la verifica.

## Cosa fanno gli strumenti professionali {#what-the-professional-tools-do}

Gli strumenti affermati convergono sullo stesso nucleo e si differenziano
soprattutto per quanto si spingono verso le *cause*:

- **Tutto si confronta per distanza, non per tempo.** Due giri vengono
  ricampionati su un unico asse di distanza; la differenza progressiva del
  tempo trascorso alla stessa distanza è il *delta* (MoTeC la chiama time
  variance, altri time slip o delta trace). La sua pendenza dice dove si sta
  perdendo tempo in quel momento: una pendenza dolce è accelerazione, resistenza
  o aderenza costante; una ripida è una differenza di frenata o di gas; un'onda
  che sale e scende è uno scambio tra velocità in ingresso e in uscita.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Ogni curva è divisa in fasi**: frenata, ingresso, centro, uscita - punto di
  frenata, frenata massima e rilascio, velocità minima e dove avviene, marcia,
  ripresa del gas, ritorno a tutto gas, velocità in uscita.
  ([Driver61: le sei fasi](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-settori per curva e un miglior giro teorico** ricavato mettendo insieme
  il più veloce di ciascuno. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Anche la traiettoria percorsa viene confrontata**, ma mai da sola: "una
  linea su un'immagine non significa nulla finché non conosci i fattori che
  contribuiscono" - si legge insieme alla traccia della velocità e al delta.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Causa alla radice, non sintomo.** La perdita in rettilineo dipende davvero
  dal gas, o un ingresso sbagliato ha costretto a riprendere il gas tardi? Gli
  errori si ordinano per costo in tempo sul giro e si spiegano in linguaggio
  semplice.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Cosa non andava nella prima versione, e perché conta {#what-went-wrong-in-the-first-version-and-why-it-matters}

La prima versione addebitava ogni *fase* separatamente e guardava solo le
perdite. Un giro che frenava prima perdeva tempo nella fase di frenata, e gli
veniva detto di frenare più tardi - anche quando quella frenata anticipata
faceva girare l'auto prima, riprendeva prima il gas e usciva più veloce dalla
curva, recuperando tutto nel rettilineo. In un test disse a un giro che aveva
fatto così di "frenare molto più tardi", mentre l'altro giro - che aveva
frenato più tardi - aveva mancato la corda, era uscito largo e aveva perso
esattamente quanto aveva guadagnato. I dati del tempo dicevano che i due modi
erano pari; il consiglio diceva il contrario.

La correzione è la regola su cui concordano tutte le fonti qui sopra: **una
curva si giudica intera**, dalla frenata che la precede a quella della curva
successiva, perché "a volte scambiare pochi millisecondi in una curva può
migliorare il tempo totale del giro, permettendo tratti più veloci dopo"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Il sapere da corsa che le regole codificano {#racing-knowledge-the-rules-encode}

**La velocità in uscita conta più di quella in ingresso**, e più conta quanto è
lungo il rettilineo che segue: "il tempo passato sui rettilinei domina il tempo
passato nelle curve", e un deficit di velocità in uscita si porta fino al punto
di frenata successivo. Il modo più rapido di percorrere una curva e un
rettilineo è spesso affrontare la curva più piano, così il gas arriva prima -
*entrare piano, uscire forte*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Un pianificatore del tempo minimo che premia anche la velocità in uscita sposta
i suoi punti di corda più in là e ottiene un giro *più veloce*; il premio che
bilancia i due aspetti vale `L / v²` per unità di velocità in uscita, per un
rettilineo di lunghezza `L` alla velocità `v` - il tempo che una differenza di
velocità costa lungo un rettilineo cresce con la sua lunghezza e cala con il
quadrato della velocità
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Curve in base a dove portano.** Una che porta su un rettilineo: massimizzare la
velocità in uscita, corda tardiva, ritorno al gas il prima possibile. Una in
fondo a un rettilineo: massimizzare la velocità portata nell'ingresso, frenare il
più tardi possibile, una corda anticipata è accettabile. Una tra due curve: si
sacrifica per quella che conta dopo. Una curva che potrebbe essere di entrambi i
tipi si tratta come una che porta su un rettilineo. Le curve più veloci pesano
di più: a velocità alta un'auto accelera poco e un km/h perso non si recupera.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**Il cerchio di aderenza.** Uno pneumatico ha un solo budget di aderenza, speso in
frenata, curva e accelerazione in qualunque mix; l'accelerazione totale è
`sqrt(lat² + long²)`. La frenata in curva segue il bordo di questo cerchio: il
freno si rilascia mentre lo sterzo e il carico laterale aumentano.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**L'inerzia** - nessun pedale premuto - è il modo più lento di perdere velocità,
e un indicatore di prestazione misurato a sé.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Slittamento.** La forza longitudinale raggiunge il massimo con un rapporto di
slittamento di circa 10-20%, poi cala; oltre, la ruota si blocca in frenata o
gira a vuoto in accelerazione. Forza riporta lo slittamento normalizzato: 0 è
aderenza piena, un valore assoluto sopra 1 è aderenza persa.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Sottosterzo e sovrasterzo.** Angolo di deriva anteriore più grande di quello
posteriore è sottosterzo; posteriore più grande dell'anteriore è sovrasterzo.
Senza angoli di deriva: l'auto gira meno di quanto chiede lo sterzo (lo sterzo
oltre l'angolo di Ackermann `L/R` che un'auto richiede a bassa velocità).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## La geometria di una linea {#the-geometry-of-a-line}

La velocità che un'auto può mantenere su un raggio `R` è `v = sqrt(a R)`, con `a`
l'accelerazione laterale che danno le sue gomme (più ciò che aggiunge il carico
aerodinamico, che cresce con `v²`). Quindi **la velocità cresce con la radice
quadrata del raggio**: una linea che passa al centro su un raggio più grande del
20% è circa il 10% più veloce in quel punto.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**La linea geometrica** è l'arco più ampio attraverso una curva: dal bordo esterno,
toccando l'interno al punto di corda, di nuovo al bordo esterno. Per una curva
che gira di `θ` su una strada larga `w` (meno la larghezza dell'auto), un arco
tangente a entrambi i bordi esterni e che tocca l'angolo interno ha
`R = w / (1 - cos(θ/2))` (più il raggio del bordo interno) - per un angolo retto
circa `3,4 w`, per un tornante `w`. Per questo usare la larghezza conta di più
nelle curve medie e di meno nei tornanti.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**La corda tardiva** entra più tardi e più in profondità, su un raggio più stretto
all'inizio, e apre il raggio in uscita: più lenta al centro, dritta prima, a
tutto gas prima - "una velocità minima leggermente più bassa ma un'accelerazione
più forte in uscita". **La corda anticipata** è l'opposto: più veloce in
ingresso, e un raggio che si stringe in uscita e trattiene il gas - in gran parte
un errore, tranne su aderenza molto bassa, dove la velocità persa in ingresso
non si recupera in uscita.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**La "V" e la "U".** La U è la linea classica e tonda: il raggio più ampio e il
minimo cambio di sterzo. La V entra prima, va più in profondità, fa ruotare
l'auto rapidamente al centro e allinea l'uscita per una corsa più dritta:
la frenata resta diritta (quindi può essere più tardiva), la velocità minima è
più bassa ma raggiunta più tardi, il tutto gas arriva molto prima.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Curvatura rispetto alla distanza.** La linea più veloce è un compromesso tra il
percorso più corto e quello meno curvo; su una pista la larghezza fa sì che conti
di più la curvatura, e una linea a curvatura minima si avvicina alla linea a tempo
minimo ovunque l'auto sia al limite - se ne discosta dove l'auto potrebbe
accelerare.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Curve una dopo l'altra** - una doppia corda, una chicane - sono un solo problema:
la linea di uscita di una è la linea di ingresso della successiva, e si
percorrono all'indietro partendo da quella che porta su un rettilineo.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Quale linea si addice a quale auto {#which-line-suits-which-car}

Decide la **potenza rispetto all'aderenza** dell'auto alle velocità di quella
curva - "il momentum è aderenza contro potenza, una questione di rapporto".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Auto, in questa curva | Linea | Perché |
|---|---|---|
| Accelera forte per la sua aderenza ("point and shoot") | V: frenata dritta e tardiva, ruota in un centro corto e stretto, dritta e a gas presto | il tempo si guadagna con il tutto gas, non con la velocità minima |
| Accelera poco per la sua aderenza ("momentum") | U larga, corda leggermente tardiva, tenere alta la velocità minima | non può recuperare la velocità che perde |
| Via di mezzo | entrare piano, uscire forte: U con corda tardiva | il compromesso classico |
| Curva veloce, e più ancora con carico aerodinamico | U, vicina alla linea geometrica | l'accelerazione è debole a velocità alta; l'aderenza da carico aerodinamico cresce con `v²`, quindi la velocità al centro vale doppio |
| Aderenza molto bassa (bagnato, neve) | corda anticipata | la velocità persa in ingresso non si recupera in uscita |
| Potenza ben oltre l'aderenza | la linea conta meno | è la trazione, non la linea, a limitare l'uscita |

"Più la curva è veloce, più è vicina alla linea geometrica; più è lenta, più la
modifichi con una corda tardiva."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

La trazione cambia il modo di guidare la linea più della linea stessa: un'auto a
trazione anteriore si ruota con i freni (frenata in curva) e riceve potenza solo
quando la ruota si srotola, altrimenti va largo; un'auto potente a trazione
posteriore deve essere dritta prima del tutto gas, o il retrotreno scappa; la
trazione integrale può dare potenza anche mentre gira, quindi riprende il gas
prima.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Il viewer misura il rapporto potenza-aderenza dell'auto in ogni curva dalla sua
stessa guida - accelerazione a tutto gas alla velocità di uscita divisa per
l'aderenza laterale alla velocità minima - e lo chiama "point and shoot" da 0,45
in su, "momentum" da 0,25 in giù. Un'auto la cui aderenza tra 150 e 250 km/h è
più alta del 15% rispetto a quella tra 55 e 110 km/h ha il carico aerodinamico
attivo.

## Il metodo {#the-method}

I numeri qui sotto sono il ragionamento. Le soglie che usa il codice sono
riportate in una pagina ciascuna, e quelle pagine sono il riferimento se un
numero qui è diverso: [Analisi curva per curva](race-corner-analysis.md), [Eventi di controllo dell'auto](race-control-events.md), [Profili delle auto e confronto](race-car-profiles.md) e [Statistiche del tracciato](race-course-statistics.md).

### 1. Un solo asse di distanza {#one-distance-axis}

Il giro più veloce è il riferimento, a meno che l'utente ne scelga un altro. Il
suo percorso è l'asse: ogni campione degli altri giri viene proiettato su di esso,
ottenendo per ciascuno una distanza lungo il riferimento `s` e uno scostamento
laterale con segno `d`. La proiezione cerca in avanti solo a partire dalla
corrispondenza precedente, così un giro che attraversa se stesso non salta mai
dall'altra parte di un ponte. I giri vengono poi ricampionati su un'unica griglia,
ogni 2 m, per ogni canale. Ogni giro viene prolungato per gli ultimi metri alla
velocità che aveva, così il suo delta alla linea è la sua differenza di tempo sul
giro.

### 2. Curve, e la parte di giro di ciascuna curva {#corners-and-each-corners-share-of-the-lap}

Come si trovano curve, segmenti e complessi: [Analisi curva per curva](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Il conto del tempo di una curva {#the-time-account-of-a-corner}

Netto, divisione, velocità in uscita e spinta delle auto: [Analisi curva per curva](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Il verdetto e la causa {#the-verdict-and-the-cause}

I modelli di verdetto e le cause in ingresso e in uscita: [Analisi curva per curva](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. L'auto contro il pilota {#the-car-against-the-driver}

Quando i giri sono su auto diverse, si toglie la parte di perdita che spiega
l'auto, per voci:

- **spinta**: le auto dalla stessa velocità lungo il rettilineo, come sopra;
- **aderenza**: della velocità minima più bassa non spiegata da un raggio più
  stretto, la quota `½ ln(grip_altro / grip_mio) / ln(v_altro / v_mio)`, quando
  il giro era al limite della sua auto (90% di ciò che ha mostrato a quella
  velocità);
- **freni**: da `u` a `v` con decelerazione `a1` contro `a2`, fino allo stesso
  punto, costa `(1/a1 - 1/a2)(u - v)² / 2u` - solo quando il giro ha frenato, in
  media nella zona, quasi quanto l'auto può frenare, non solo nel picco.

Quello che un'auto può fare viene da ogni giro caricato con quell'auto: aderenza
laterale, frenata e accelerazione a tutto gas per ogni classe di velocità da 5 m/s
(95°, 95° e 90° percentile). L'aderenza è ciò che l'auto **ha tenuto per mezzo
secondo** - l'accelerazione laterale media su 0,5 s - non ciò che un singolo
campione ha toccato: un cordolo, uno scatto di scivolata che rientra, un'auto che
viene ripresa fanno schizzare il valore per un istante, e un'auto che lo fa spesso
sembra più aderente di quanto sia. (Verificato su giri registrati di due auto
diverse: la misura per campione le metteva quasi insieme; mantenuta per mezzo
secondo le separa come separano i loro tempi sul giro.) Frenata e spinta prendono
ogni campione come mediana di sé e dei vicini. L'aria, la ripresa dopo un
atterraggio e ogni urto (sezione 6), finché l'auto non si è ripresa, sono esclusi.

**Che tipo di auto è ciascuna** (`profile.ts`): dagli stessi giri,

- **aderenza tenuta**: il 95° percentile di quell'accelerazione laterale su
  mezzo secondo;
- **spinta** a tutto gas fino a 50 km/h, da 50 a 120, da 120 a 200 e oltre 200,
  e il valore massimo mostrato;
- **frenata** da 60 a 160 km/h;
- **velocità massima**: dove smetteva di guadagnare a tutto gas per un secondo su
  un rettilineo - guidato dritto, non una curva lunga presa in pieno, dove un'auto
  perde velocità a ogni potenza. Dove nessun rettilineo era abbastanza lungo, dice
  quanto era lontana la spinta ancora presente alla velocità massima. Nessuna
  supposizione oltre quanto mostrano i giri: un adattamento di potenza su velocità
  contro la resistenza aveva messo un'auto stradale 100 km/h sopra la sua vera
  velocità massima, perché il rapporto del cambio e il limitatore finiscono la
  spinta molto prima della resistenza;
- **perdere il retrotreno**: quante volte un giro l'ha fatta scivolare oltre 10°
  di deriva (20° su fondo smosso) con il volante girato contro la curva - presa in
  controsterzo - quante di queste sono iniziate con il gas, e a quale quota
  dell'aderenza sono iniziate. Un'auto guidata un po' di traverso di proposito non
  sta perdendo nulla; una che va ripresa sì. Contato allo stesso modo per ogni
  auto, così due auto si possono confrontare;
- **bilanciamento**, dove i giri riportano gli angoli di deriva: anteriore contro
  posteriore al limite.

**Auto a confronto** mette le auto una accanto all'altra - una tabella, una frase
per ciascuna su cosa è l'auto rispetto all'altra ("X accelera meglio, ma non può
girare altrettanto stretta, ha bisogno di più spazio per fermarsi e perde il
retrotreno più facilmente"), ogni differenza che sia chiara (4% di aderenza, 5%
di spinta o frenata, 4 km/h di velocità massima, un retrotreno preso almeno una
volta in più a giro e la metà in più delle volte), e come guidare ciascuna. Con
una sola auto, dice che cos'è quell'auto.

**In ogni curva**, quando i giri sono su auto diverse, il verdetto dice quanto di
essa decidono le auto, e come sfruttare al meglio questa:

- **al centro**: sulla linea dell'altra auto, l'aderenza di questa auto consente
  `v_altro · √(grip_mio / grip_altro)`. Se il giro lo manteneva, il distacco è
  l'auto, e nessun punto di frenata lo cambia - viene detto, e la curva è
  attribuita all'auto e non al pilota; se il giro andava più piano, il resto è
  recuperabile, e si dice quanto. Poi dove il tempo si può guadagnare: su un
  rettilineo, o in un'auto che spinge di più, dopo la corda - frenare dritti,
  entrare più tardi, puntare presto l'uscita; altrimenti, il raggio più largo che
  la strada consente, perché un raggio maggiore è l'unico modo per più velocità
  senza più aderenza;
- **un retrotreno che ha mollato** qui, in un'auto che lo perde più facilmente
  dell'altra: cosa fare con questa auto - il gas dato gradualmente mentre la ruota
  si srotola, o il freno rilasciato dolcemente senza alzare il piede a metà curva,
  a seconda di come iniziano le sue scivolate;
- **il rettilineo dopo**: quanto ha preso la spinta più forte dell'altra auto dalla
  stessa velocità, e dove questa auto ha esaurito la spinta;
- **un punto di frenata più anticipato** in un'auto che frena meno forte.

Un giro che è scivolato al centro di una curva (oltre 10° di deriva su asfalto)
era oltre la sua aderenza, non sotto di essa: non gli si dice mai che aveva
aderenza da vendere lì. E dove il retrotreno dell'auto ha mollato in questo giro
con meno accelerazione laterale di quella che la curva chiedeva, "aderenza da
vendere" dice di ritrovarla a piccoli passi.

### 6. Controllo dell'auto: bloccaggi, pattinamenti, scivolate e spinte, urti e incidenti {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Ogni giro viene anche letto per come è stata gestita l'auto - dove una ruota si è
bloccata, dove le ruote motrici hanno pattinato, dove il retrotreno è uscito, dove
l'avantreno è andato largo - perché sono gli errori che il solo tempo non nomina.
Tre cose le fanno reggere tra giochi e superfici diverse.

**Dove finisce l'aderenza si misura dalla guida dell'auto stessa.** Gli ingegneri
fissano per ogni auto una soglia di bloccaggio allo slittamento che ha dato la
massima decelerazione (i canali MoTeC delle serie di frenata di OptimumG usano
-0,07 per un'auto), non un valore di manuale, e i valori di manuale comunque non
concordano: la forza raggiunge il massimo con il 5-20% di slittamento sull'asfalto
a seconda dello pneumatico e del modello, con il 6% o il 20-60% sulla neve a
seconda della fonte, e per lo sterrato nessuna fonte ne dà uno. I giochi scalano lo
slittamento in modo diverso ancora: quello di Forza è "normalizzato", così che oltre
1 si perde aderenza - eppure i freni di un'auto possono dare il meglio ben sotto o
ben sopra 1, e le normali zone di frenata possono superare 1. Quindi per ogni auto,
su ogni giro caricato, la forza che ha prodotto viene raggruppata in classi secondo
lo slittamento che aveva - decelerazione contro il rapporto di slittamento delle
ruote in frenata in linea retta, accelerazione (come quota di ciò che l'auto
produce a quella velocità) contro lo slittamento delle ruote motrici, aderenza in
curva (come quota dell'aderenza dell'auto a quella velocità) contro l'angolo di
deriva di ciascun asse - e il limite è lo slittamento oltre il massimo in cui la
forza è calata dell'8%. Una curva che nei dati non cala mai - l'aderenza in curva e
in trazione di Forza Horizon - non ha limite, e lo slittamento da solo non segnala
nulla lì. Con dati troppo scarsi, il limite è una volta e mezza il picco nominale.

**Il fondo è noto per campione**, dove il gioco lo dice: Forza fa vibrare le gomme
su ghiaia, sterrato ed erba (pochi campioni su un circuito d'asfalto, molti su
sterrato e percorsi cross-country), Trackmania indica il materiale sotto ciascuna
ruota, e il fondo di una prova speciale si trova come dice la sezione 11. Curve,
abitudini di deriva e soglie sono tenute separate per asfalto e fondo smosso.

**Ogni evento viene messo a confronto con l'altro giro sugli stessi metri.** Su
ghiaia, neve, in un arcade molto basato sulla deriva, la scivolata è il modo in cui
si prende una curva: gli studi di controllo ottimale trovano soluzioni "a bassa
deriva" sull'asfalto e "aggressive, ad alta deriva, perfino con controsterzo" fuori
strada; i dati di rally mostrano pneumatici "ben dentro la zona non lineare", e
bloccare una ruota su un fondo molto smosso può perfino fermare l'auto prima. Quindi
un evento che anche l'altro giro ha fatto - l'80% o più - è il modo in cui si prende
la curva, non un errore, e uno che l'altro giro non ha fatto è un difetto solo se è
costato tempo: il tempo perso da poco prima fino a 40 m dopo. Un difetto che spiega
il 40% o più della perdita di una curva diventa la causa di quella curva.

Soglie di rilevamento, il test con l'altro giro, urti e incidenti, e i testi dei
consigli: [Eventi di controllo dell'auto](race-control-events.md).

### 6b. Molti giri: le statistiche del tracciato {#b-many-laps-the-courses-statistics}

Confronto per classe, cosa conta come errore, le statistiche e la mappa degli
errori: [Statistiche del tracciato](race-course-statistics.md).

### 7. La traiettoria percorsa {#the-driven-line}

Per ogni giro e curva, dalle sole posizioni: dove inizia a girare (un quinto della
sua curvatura massima), il raggio più stretto (su ±8 m), il raggio medio nella
prima e nella seconda metà della sua variazione di direzione, e così via:

- **forma**: il raggio più stretto diviso per il raggio medio sotto 0,55 è una V,
  sopra 0,75 una U;
- **corda**: raggio in uscita diviso per raggio in ingresso sopra 1,25 è tardiva,
  sotto 0,8 anticipata;
- **corda di velocità**: se il punto più lento è più di 15 m prima della metà
  della sua curva, è entrare piano, uscire forte; più di 15 m dopo, sta ancora
  frenando oltre il centro.

Rispetto all'altro giro: di quanto è rimasto dentro o fuori al punto di entrata
in curva, attraverso la parte più stretta e dove entrambi erano a tutto gas, e
dove ognuno ha iniziato a girare. Ogni verdetto si chiude con la linea che si
addice all'auto del giro in quella curva - in base a dove porta la curva e al
rapporto potenza-aderenza misurato, al carico aerodinamico e alla trazione - e
con la verifica se il giro l'ha percorsa così. La tabella "Curva per curva" elenca
il giro più veloce di ogni curva con la forma della sua linea, e le curve migliori
messe insieme.

### 8. Due mappe {#two-maps}

- **Dove**: il tracciato colorato con `dΔt/ds` rispetto al riferimento, rosso dove
  si perde tempo e verde dove se ne guadagna.
- **Perché**: ogni perdita disegnata dove si trova la sua causa, colorata dal
  gruppo della causa - frenata, ingresso, uscita, rettilineo, auto - e più larga
  quella più costosa.

### 9. Replay {#replay}

Un unico orologio, tre modi per trasformarlo nel tempo di ogni giro: dalla linea;
allineati (ogni giro raggiunge un punto del tracciato nello stesso istante, poi
viene lasciato andare); affiancati (ogni giro tenuto alla distanza del
riferimento).

### 10. Da quale parte è girato il mondo {#which-way-round-the-world-is}

Il mondo del viewer è destrorso, con Y in alto. Un gioco con un mondo sinistrorso
(Forza tra questi) risulta specchiato: ogni curva a destra disegnata come curva a
sinistra, tracciato e giri compresi. I giri lo dicono da soli - lo sterzo positivo
va a destra in ogni adattatore, e la sospensione esterna in curva si comprime -
quindi la scheda di gara propone di correggerlo, e **Camera e scena → Inverti
l'asse del mondo** lo fa: X, Y o Z disegnati al contrario. Cambia solo il disegno,
una riflessione inserita nella matrice di vista; la camera vola nel mondo
disegnato, e i dati, l'analisi e ogni coordinata che mostrano gli strumenti restano
quelli del gioco. L'analisi chiama le curve a sinistra o a destra con la stessa
misura.

### 11. Rally: la scivolata, il piede sinistro, l'aria {#rally-the-slide-the-left-foot-the-air}

Una prova rally non è un circuito guidato con meno aderenza. Su sterrato e neve la
scivolata è il modo in cui si prende la curva: l'auto viene girata in ingresso
spostando il peso - "la frenata sposta il peso dell'auto in avanti ... le gomme
anteriori guadagnano aderenza, le posteriori la perdono, e l'auto ruota scivolando
nella curva", poi di nuovo sul gas quando è "allineata nella direzione in cui vuoi
andare" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)).
Il piede sinistro frena così gas e freno si possono giocare uno contro l'altro, il
freno a mano fa girare l'auto nelle curve strette
([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
e l'auto si stacca da terra. La sezione 6 legge già le scivolate contro l'altro
giro; queste regole coprono il resto.

- **Il fondo.** Ciò che dice il giro (`meta.surface`, l'opzione `--surface` dei
  registratori rally), altrimenti il nome della gara - le gare su asfalto (Spagna,
  Croazia, Europa centrale, Germania, Giappone, Corsica, Ypres), quelle invernali
  (neve), il tratto asfaltato del Monte con neve e ghiaccio (misto) - altrimenti
  come è stata guidata l'auto. Il limite laterale di una Rally2 è da 0,7 a 0,9 g
  su sterrato e da 1,3 a 1,4 g su asfalto
  ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)),
  e su sterrato va molto più in deriva (sezione 6). Quindi una prova in cui l'auto
  ha tirato 10 m/s² o più (95° percentile, a velocità, sul fondo) con una deriva
  mediana sotto i 6 gradi, dovunque ha curvato entro il 70% di quel valore, è
  asfalto; tutto il resto, o troppo poco per dirlo, è smosso.
- **Cosa può fare l'auto, sul fondo su cui l'ha fatto.** Aderenza, frenata e
  spinta (sezione 5) si misurano separatamente su asfalto e su fondo smosso quando
  i giri ne hanno guidato un quinto o più dei campioni su ciascuno, e ogni curva si
  giudica con il fondo sotto l'auto nel suo punto più lento. I campioni in aria e
  per 0,3 s dopo un atterraggio sono esclusi da tutto ciò che misura l'auto -
  inviluppi, curve delle gomme, bloccaggi e pattinamenti: un atterraggio scuote
  l'auto oltre ciò che le sue gomme possono dare, e le ruote che girano a vuoto in
  aria non sono pattinamento. Il carico aerodinamico non si giudica su fondo
  smosso, dove i tratti veloci e lenti di una prova sono strade diverse.
- **Un tocco del piede sinistro non è frenata.** Un tocco del freno con il gas
  ancora a metà o più, per meno di 15 m, assesta l'auto o la fa girare; dove un giro
  ha iniziato a frenare per una curva è la prima frenata sotto la quale il gas è
  stato tolto, o quella che è durata più a lungo.
- **L'auto girata in ingresso.** Per ogni giro e curva, il massimo angolo di
  deriva dalla sua frenata fino a 5 m oltre il punto più lento. Su fondo smosso, un
  giro che ha fatto girare l'auto di 8 gradi o più in meno dell'altro (che ne ha
  girati 12 o più) e ha ripreso il gas o è andato a tutto gas più tardi, **ha fatto
  girare l'auto meno**: il consiglio è di alzare il piede o dare un colpo di freno
  sinistro mentre entra in curva, così il retrotreno viene in avanti - con il punto
  di freno a mano dell'altro giro quando lo ha usato, o il freno a mano in una curva
  più lenta di 54 km/h - e averla puntata verso l'uscita prima della corda. Uno che
  l'ha girata di 12 gradi o più oltre l'altro e ha comunque ripreso il gas più tardi,
  **l'ha girata troppo**: va raddrizzata prima che la potenza possa scendere.
  Entrambi sono la causa della curva in uscita, dopo un guasto di controllo
  dell'auto. Il consiglio sulla linea su fondo smosso dice la stessa cosa per ogni
  curva.
- **L'aria.** Un salto di 0,2 s o più rispetto all'altro giro che ha costato tempo
  da 10 m prima dello stacco fino a 40 m dopo l'atterraggio (o la fine della curva)
  è la causa quando spiega il 40% o più della perdita della curva, e la curva
  successiva, raggiunta più piano, lo dice. In aria l'auto non può girare, frenare
  o guidare. Il consiglio tiene il gas acceso allo stacco - "non alzare il piede
  durante lo stacco", che fa abbassare il muso - e prende il dosso un po' più piano
  o con un tocco di freno, così l'auto resta bassa
  ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complessi di al massimo tre curve.** Un tratto tortuoso guidato senza mai
  essere a tutto gas non è un unico complesso lungo: oltre tre curve ne inizia uno
  nuovo.

`src/race/rally.test.ts` verifica l'analisi su tutto questo, con tappe percorse da
un semplice modello: un'auto che gira meno e in ritardo con la potenza, un salto
più lungo, tocchi del piede sinistro, un tratto tortuoso, asfalto contro ghiaia.

## Dati, e cosa permette ogni fonte {#data-and-what-each-source-allows}

| Fonte | Frequenza | Canali | Permette |
|---|---|---|---|
| File dei giri di FH Companion | ~5 m | posizione, velocità, gas, freno, sterzo, accelerazioni laterale e longitudinale, marcia | tutto tranne il controllo dell'auto, che richiede la telemetria accanto ad essi |
| `.tele.gz` di FH Companion, accanto a ogni file dei giri | i 64 Hz del gioco (un registratore che tiene ogni pacchetto ne scrive circa 110 al secondo; le ripetizioni vengono scartate) | tutto il Data Out di Forza: per ruota rapporto di slittamento, angolo di deriva, slittamento combinato, rotazione, sospensioni, vibrazione del fondo; la velocità nel sistema dell'auto; la velocità di imbardata | tutto, controllo dell'auto compreso |
| Data Out di Forza, registrato da `heat3d_capture telemetry` | 60 Hz | tutto quanto sopra, più per ruota: temperatura dello pneumatico, rapporto di slittamento, angolo di deriva, slittamento combinato, corsa della sospensione, velocità della ruota, cordolo; giri, potenza, coppia, velocità di imbardata | tutto |
| Assetto Corsa, ACC, AC EVO, AC Rally (memoria condivisa, `heat3d_capture telemetry --game ...`) | 60-333 Hz | un insieme più ampio: temperatura del nucleo e interna, centrale ed esterna dello pneumatico, pressioni, temperature dei freni, carichi delle ruote, camber, rapporto di slittamento e angolo; la velocità nel sistema dell'auto; ABS e TC attivi (ACC, EVO, AC Rally) | tutto |
| iRacing `.ibt`, letto direttamente | 60 Hz | posizione dal GPS, pedali, sterzo, g, imbardata, temperatura della carcassa per ruota, deflessione dell'ammortizzatore, pressione, usura | tutto; controllo dell'auto dall'angolo di deriva (la sua imbardata contro la direzione di marcia) e dallo sterzo, senza slittamento (non registrato) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | per fotogramma; 100 Hz | posizione, velocità nel mondo e assi dell'auto, velocità dell'impronta di ogni ruota e sospensione, pedali, sterzo, cronometro e lunghezza della tappa | tutto; slittamento e angolo di deriva derivati |
| Richard Burns Rally (NGP UDP) | per passo di fisica | posizione, velocità proprie dell'auto, deflessione e forza di molla per ruota, pedali | tutto tranne lo slittamento delle ruote |
| BeamNG.drive (la mod del protocollo `heat3d`) | fino a 100 Hz | posizione, velocità nel mondo e assi, velocità superficiale per ruota, rotazione, carico e contatto con il suolo | tutto; slittamento e angolo di deriva derivati |
| Trackmania (il plugin Openplanet) | per fotogramma | posizione, velocità frontale e laterale, pedali (freno acceso/spento), sterzo, coefficiente di slittamento per ruota e fondo smosso, in aria | tutto; l'angolo di deriva dalla velocità laterale |

Ogni fonte viene convertita in un unico formato di giro, `heat3d-lap`, i cui canali
hanno nomi canonici (`speed`, `throttle`, `tireTemp[FL]` ...). Il simbolo dell'auto
e i grafici disegnano qualunque canale abbia un giro.

## Fonti {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (distance-domain delta)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (Sep 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (Jan 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (exit speed against minimum time)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerpt)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
