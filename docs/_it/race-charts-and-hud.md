---
title: "Grafici e HUD"
parent: "Analisi di gara"
nav_order: 53
lang: "it"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafici e HUD

I grafici allineano i tuoi giri metro per metro, così vedi dove un pilota ha frenato più tardi o ha alzato il piede prima. Le schede in alto a sinistra della vista mostrano cosa stanno facendo ora ogni auto e ogni pilota.

![Grafici sotto la vista: righe di distacco, velocità, acceleratore, freno e sterzo per due giri, le strisce del tempo e della causa in alto, e il cursore con le schede](../assets/img/en/race-charts-rows.webp)

## I grafici {#the-charts}

Ogni giro su un solo asse delle distanze - metri lungo il riferimento (vedi
[un solo asse delle distanze](race-corner-analysis.md#one-distance-axis)) - così
la stessa x è lo stesso punto della pista per ogni giro. Un giro viene messo in
grafico da solo (e si riproduce); un secondo giro dello stesso percorso viene messo
in grafico contro di lui. Senza giri caricati (o quando l'analisi è fallita) l'area
dice "I grafici appaiono quando un giro è caricato; carica un altro giro dello stesso
percorso per confrontare i due."

### Cosa c'è sopra {#what-is-on-them}

- **La legenda**: il colore e l'etichetta di ogni giro in grafico, il riferimento
  segnato "(riferimento)"; "+N altri disegnati, non in grafico" quando sono visibili
  più giri di quelli in grafico; **Grafici (N) ▾**; **Giro intero** mentre si è
  ingranditi; una riga di suggerimento.
- **Due strisce** in alto, per il giro messo a fuoco:
  - *tempo*: la [mappa dei tempi](race-replay-and-scene.md#time-map-where) come
    striscia, rosso quando si perde, verde quando si guadagna;
  - *causa*: ognuna delle sue perdite come barra sopra il punto della sua causa,
    nel colore della causa; passa sopra una barra per il suo titolo e il suo costo.
- **Fasce delle curve**: una fascia ombreggiata dall'ingresso all'uscita di ogni
  curva (come trovata sul riferimento) e il suo nome (`T1` …) sotto l'asse, al punto di corda.
- **Il risultato selezionato**: una fascia nel colore della sua causa sopra il suo intervallo.
- **Le righe** (grafici), una per ogni canale scelto, ognuna con il suo nome e il
  valore massimo e minimo del suo intervallo a sinistra, una linea dello zero dove
  l'intervallo attraversa lo zero. Ogni giro è una linea nel suo colore: il giro
  messo a fuoco largo 2 px e opaco, il riferimento opaco, gli altri 1,5 px al 75%. La
  riga del distacco lascia fuori il riferimento (è zero rispetto a se stesso).
- **Il cursore**: una linea verticale dove si trova l'auto di riferimento (o dove si
  trova il puntatore), e un punto per auto su ogni riga tranne il distacco - sul
  cursore ogni auto è allo stesso metro; altrimenti la distanza propria di ogni auto
  all'orologio della riproduzione.

Al massimo **8** giri sono in grafico: prima il giro messo a fuoco, il migliore della
sua classe e il riferimento, poi gli altri nell'ordine di caricamento.

### Righe e le loro altezze {#rows-and-their-heights}

Le righe condividono l'altezza del grafico in base al peso, nessuna più bassa di 16 px:

| Riga | Peso |
|---|---|
| Distacco (dal riferimento, in secondi, con segno) | 1,7 |
| Velocità (km/h) | 1,7 |
| un pedale (acceleratore, freno, frizione) | 1 |
| sterzo | 1,1 |
| marcia | 0,8 |
| una spia (freno a mano, ABS …) | 0,55 |
| qualunque altra cosa | 1 |

Un canale con un intervallo di visualizzazione fisso nella tabella (pedali 0-100%)
usa quello; gli altri si adattano al tratto visibile dei giri. Un nome di riga troppo
lungo per lo spazio (una parola lunga in un'altra lingua) sposta il valore più alto di
una riga verso il basso dove la riga è abbastanza alta, e viene tagliato con i puntini
dove non lo è; il nome completo è nel suggerimento.

### I grafici predefiniti {#the-default-graphs}

Finché non si scelgono i grafici: il **distacco**, poi ogni canale che la tabella
segna come `graph` e che i giri hanno - acceleratore, freno, frizione, freno a mano,
sterzo, marcia, velocità - tranne che un canale di pedale o di spia viene lasciato
fuori a meno che un giro lo muova oltre 0,02 (una frizione che non viene mai premuta
non è un grafico). L'ordine è quello della tabella.

### Il selettore dei grafici {#the-graph-picker}

**Grafici (N) ▾** apre un pannello sopra il pulsante:

- una casella di filtro (corrisponde al nome o all'id di un canale);
- **Predefiniti** (torna all'insieme predefinito; il suo suggerimento dice quanti sono) e
  **Chiudi**;
- *Distacco dal riferimento*, poi ogni canale che i giri in grafico hanno, raggruppati
  (movimento, comandi, motore, aiuti, pneumatici, freni, sospensioni, ruote, altro,
  tempi, posizione), una casella ciascuno; un canale per ruota è una riga con una
  pillola per ruota (FL, FR, RL, RR).

Spuntare mantiene l'ordine della tabella, qualunque sia l'ordine in cui si spunta. La
scelta resta fino a **Predefiniti** o a un ricaricamento. I canali che la tabella non
conosce vengono proposti sotto *altro*, con un nome preso dal loro id ("brakeLinePress"
→ "Brake line press").

### Passaggio del mouse, rotella, zoom, clic {#hover-wheel-zoom-click}

| Comando | Fa |
|---|---|
| passaggio del mouse | ogni auto, la sua scheda e i suoi comandi si spostano a quel metro; un palo la segna sulla pista; una tabella elenca il valore di ogni giro in grafico su ogni riga in quel punto (il distacco mostrato come "rif" per il riferimento); sopra le schede, "a N m - il cursore dei grafici". Uscendo dal grafico si torna alla riproduzione |
| rotella | fa avanzare la riproduzione lungo il giro di 1/200 dell'intervallo visibile per scatto (Shift: 5×), mettendo in pausa la riproduzione; quando si è ingranditi, la vista segue il cursore |
| Ctrl+rotella (Cmd+rotella) | ingrandisce l'asse delle distanze attorno al puntatore, 1,25× in uscita / 0,8× in entrata per scatto, mai più stretto di 40 m; allontanarsi fino al giro intero termina lo zoom |
| rotella laterale | sposta la vista mentre si è ingranditi (10% dell'intervallo ogni 100 unità di scorrimento) |
| doppio clic, **Giro intero** | allontana lo zoom |
| clic | porta la riproduzione dove il riferimento arriva a quel metro |
| Shift+clic | allinea le auto lì (vedi [allineare](race-replay-and-scene.md#lining-up)) |

I grafici vengono ridisegnati nella lingua attuale quando questa cambia.

La riga di suggerimento nella legenda dice la stessa cosa in breve: "Passaggio: ogni auto lì · rotella: avanti lungo il giro · Ctrl+rotella: zoom · clic: salta · Shift+clic: allinea".

## Le schede delle auto (HUD) {#the-car-cards-hud}

In alto a sinistra della vista, una scheda per ogni giro visibile - al massimo **6**, i
primi sei giri visibili nell'ordine di caricamento - per il momento in cui si trova la
riproduzione (o il cursore dei grafici).

**Intestazione:** il colore e l'etichetta del giro; il distacco in tempo reale - il
tempo di questo giro per raggiungere la sua distanza attuale meno il tempo del riferimento
per raggiungere la stessa distanza, "+0,48 s" - oppure "riferimento"; **⋯** per mostrare o
nascondere ogni altro valore (lo stesso di *Tutti i valori sulle schede*). La scheda
dell'auto inseguita è evidenziata.

**L'auto dall'alto:** il contorno della carrozzeria nel colore del giro con una freccia
davanti, quattro pneumatici (quelli anteriori girati fino a 28° con lo sterzo), ognuno
colorato in base alla sua temperatura, con gli stessi simboli dell'auto 3D disegnati
piatti: anello di scivolamento, barra della sospensione, bagliore dei freni, fascia
di usura, barra del carico.

**Letture:** velocità in km/h, il tempo del giro stesso, la sua distanza lungo il riferimento.

**Comandi:**

- un volante girato dal comando dello sterzo (pieno sterzo disegnato come 180°) con la
  percentuale sotto;
- una barra per pedale, da sinistra a destra come in una pedaliera - frizione, freno,
  acceleratore - ognuna con la sua percentuale e il nome breve, nel suo colore (solo i
  pedali che il giro ha);
- la marcia (R per la retromarcia, N per il folle);
- una piccola spia per ogni canale on/off che il giro ha - freno a mano, ABS, TC, DRS,
  limitatore dei box, in aria - accesa nel suo colore quando è attiva (sopra metà del suo
  intervallo);
- una lettura per ogni canale di livello: ripartizione della frenata, impostazioni di ABS
  e TC, sovralimentazione, carburante.

**La traccia dei comandi:** gli ultimi **6 secondi** di ogni pedale (una corsia, ognuna nel
suo colore) e dello sterzo (la sua corsia, centrata), che finisce in questo momento - cosa
ha fatto il pilota per arrivarci. Fino a 160 punti.

**Tutti i valori** (⋯ oppure *Tutti i valori sulle schede*): ogni altro valore scalare che il
giro ha in questo momento, poi ogni canale per ruota come quattro valori (FL FR RL RR),
con il nome preso dalla tabella dei canali o dal nome proprio del canale, ordinati per gruppo.

## Per gli sviluppatori {#for-developers}

Codice: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### La tabella dei canali {#the-channel-table}

`CHANNELS` in [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
è l'unico posto in cui un canale viene descritto: la sua unità, se è un valore per
campione o uno per ruota (memorizzato come `name.FL` …), il suo gruppo, un intervallo di
visualizzazione, come viene disegnato sull'auto (`glyph`), come compare sulla scheda
(`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), se è un grafico predefinito, se
salta invece di sfumare (marcia, flag), e come viene mostrato (scala, unità, cifre).
Le etichette e i nomi brevi sono messaggi in ogni lingua (`race.channel.<name>.label` /
`.short`).

Canali con un disegno o un grafico predefinito:

| Canale | Unità | Disegnato come | Grafico predefinito |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedale (verde, rosso, …), mostrato in % | sì |
| `handbrake` | 0..1 | spia | sì |
| `steer` | -1..1, destra positiva | volante | sì |
| `gear` | - | marcia | sì |
| `speed` | m/s, mostrato km/h | - | sì |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | spia | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | lettura di livello | - |
| `tireTemp` (per ruota) | °C, visualizzazione 40-130 | colore dello pneumatico | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (per ruota) | come li scala il gioco, visualizzazione ±1,5 | anello di scivolamento | - |
| `combinedSlip`, `slipIndex` (per ruota) | visualizzazione 0-1,5, 0-1 | anello di scivolamento | - |
| `suspension` (per ruota) | 0..1 | barra della sospensione | - |
| `brakeTemp` (per ruota) | °C, visualizzazione 100-900 | bagliore dei freni | - |
| `tireWear` (per ruota) | 0..1 | fascia di usura | - |
| `wheelLoad` (per ruota) | N, visualizzazione 0-12 000 | barra del carico | - |

Altri nella tabella (in grafico e elencati, non disegnati): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (angolo di deriva), `loose`, `lateral` (scostamento dal
riferimento), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, più `time`, `distance`, `x`, `y`, `z`.

**Un canale non nella tabella** viene comunque letto, messo in grafico (sotto *altro*) ed
elencato sulle schede, con l'etichetta presa dal suo nome. **Per dargli un nome, un'unità
e un disegno corretti**, aggiungi una voce alla tabella (e il suo messaggio di etichetta a
ogni `src/i18n/locales/<lingua>/race-channels.json`). Un nuovo *tipo* di disegno di ruota è
una voce in `WHEEL_GLYPHS` (glyph.ts) e il suo gemello piatto `CARD_GLYPHS` (RaceHud.tsx);
entrambi sono tipizzati per tipo, quindi la build fallisce finché non esistono entrambi.
`src/race/extensible.test.ts` verifica che i canali sconosciuti arrivino ai grafici, che ogni
simbolo della tabella si possa disegnare e che le spie si accendano.
