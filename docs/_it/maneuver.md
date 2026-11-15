---
title: "Manovre"
parent: "Rilevamenti"
nav_order: 4
lang: "it"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manovre: come si muovono i gruppi

**Rilevamenti → Manovre** segue come si muovono, *come gruppi*, le unità di
ogni parte, e dà un nome alle manovre che fanno: un fianco, una tenaglia, una
rottura, un agguato, una ritirata, una difesa dai missili, attraversare la T.
Per ognuna mostra quanto è sicura, i numeri su cui si basa, se ha pagato, e
i suoi paralleli nella dottrina e nella storia. **Analisi di massa → Manovre**
le conta su migliaia di partite: quante volte ognuna viene fatta per mappa,
modalità e parte, e quante volte paga.

Tutto viene calcolato nel tuo browser, nel suo worker
(`src/insights/maneuver`). Una partita di qualche centinaio di unità richiede
da 10 a 500 ms; una guerra aerea di due ore con migliaia di oggetti circa un
secondo.

## Come si usa {#using-it}

- Apri **Rilevamenti**, scheda **Manovre**. Il conteggio parte alla prima
  apertura; dopo aver cambiato i filtri usa **Trova di nuovo**.
- **Sicura / Probabile / Possibile** imposta il livello di fiducia mostrato
  (di default Probabile).
- La **linea del tempo** ha una corsia per parte e una barra per manovra; la
  **lista** sotto la mostra uguale, in ordine di tempo. Un clic passa al replay
  all'inizio della manovra, porta la telecamera lì e la disegna in 3D: il
  percorso di ogni gruppo come freccia (le due braccia di una tenaglia sono i
  suoi archi), i contorni dei gruppi nel momento chiave (quello del nemico nel
  colore della sua parte), il fronte del nemico come linea bianca.
  **Disegna tutte in 3D** aggiunge le altre manovre della partita, in modo
  tenue. Le linee vanno alla scheda grafica una volta, quando cambia la
  selezione, non a ogni fotogramma: con 480 manovre disegnate durante la
  riproduzione, i tempi di fotogramma su una GPU vera (WebGL2 e WebGPU, p99
  18,0-18,5 ms, massimo 19,5-20,8 ms) sono uguali a quelli senza.
- Una manovra aperta mostra il suo esito (le uccisioni e le perdite delle
  unità che l'hanno fatta, mentre durava e subito dopo, confrontate con lo
  scambio della parte per tutta la partita), le sue prove, e le voci della base
  di conoscenza per essa: la dottrina e i paralleli storici (Canne per una
  tenaglia, Sedan 1940 per una rottura, Tsushima per attraversare la T,
  Operazione Bolo per una finta...).
- La piccola tabella in fondo: per tipo e parte, fatte e pagate.

![Una tenaglia sulla partita dimostrativa sintetica: le frecce delle due braccia, il corpo nemico e il suo fronte](../assets/img/en/maneuvers.webp)

## Come si trovano i gruppi {#how-groups-are-found}

Ogni unità viene messa su una linea del tempo comune (un passo di 1 s a piedi,
2 s altrimenti, più lungo per file molto grandi), tenuta ferma sopra una
morte, così un ricomparire non traccia una linea sulla mappa. A ogni passo le
unità di una parte e di un tipo (aerei, veicoli, navi, fanteria) vengono
collegate quando sono vicine - 18 m a piedi, 170 m per i veicoli, 3 km per le
navi, 5 km per gli aerei - e si muovono allo stesso modo (velocità entro metà
di quella più veloce, oppure tutte ferme). Un gruppo mantiene l'id del gruppo
in cui era la maggior parte dei suoi membri. Un'unità senza classe viene messa
a piedi, su un veicolo o in aria in base alla sua velocità.

La **forma** di un gruppo si legge rispetto alla sua direzione: una colonna o
una linea in base a come si allarga in lunghezza e in larghezza, un cuneo
quando il centro è in testa, un echelon quando i membri si spostano indietro
su un lato, un quadrato quando tengono gli angoli.

Tutto si giudica alla scala della partita. Il **raggio di ingaggio** `R` è il
75° percentile della distanza tra un killer e la sua vittima (limitato al senso
del dominio), e i tempi di una manovra scalano con il tipo di unità (la
fanteria un terzo di quelli del terreno).

## Cosa trova {#what-it-finds}

| Manovra | Trovata quando |
|---|---|
| Formazione | un gruppo mantiene una forma per il 60% dei suoi passi in movimento, per 30 s |
| Attacco frontale | un gruppo si avvicina dalla fuori portata fino al contatto, ¾ R o più, da entro 35° dalla direzione in cui il nemico è rivolto |
| Attacco di fianco | lo stesso, da 50-130° (il retro oltre); sicuro solo con una *forza di blocco* amica che combatte il nemico lì (uccisioni da entrambe le parti) |
| Tenaglia | due attacchi di fianco di una parte sullo stesso corpo nemico, da lati opposti (100° o più di distanza), entro 90 s; sicura quando i due bracci combattono |
| Accerchiamento | un gruppo nemico compatto con almeno altrettanti dell'altra parte intorno entro 1,5 R, da due o più gruppi, senza buchi oltre 100°, per un minuto, tagliato fuori dalla propria parte; sicuro quando l'anello si stringe di ½ R e combatte la sacca |
| Penetrazione | un gruppo passa una linea tenuta (nemici fermi per 30 s sia a sinistra che a destra, il centro della loro parte oltre di loro); sicura quando arriva a ½ R oltre, resta 20 s e combatte lì; una rottura un altro R oltre |
| Copertura a balzi | in un gruppo piccolo, una parte si muove mentre il resto sta fermo, i ruoli si scambiano quattro volte o più, con fuoco di copertura dalla parte ferma |
| Concentrazione / dispersione | la quota di una parte vicina al suo punto più denso sale dal 35% al 60% (unità che arrivano a 1,5 R o più, poi contatto) - oppure scende quando la parte si allarga |
| Finta | un piccolo elemento in contatto attira due o più nemici da altrove; un gruppo più grande colpisce poi quattro raggi più lontano, dove il nemico ha meno forze |
| Ritirata / inseguimento | un gruppo in contatto si gira e apre R da dove ha combattuto; sicura quando un nemico lì aveva appena ucciso uno del gruppo e il gruppo si è portato a 2 R da quel killer (mai a piedi: vedi sotto); i nemici che si muovono nella stessa direzione e tengono il passo inseguono |
| Difesa in profondità | unità ferme in due o più fasce attraverso l'asse del nemico, R di profondità, il nemico che avanza, fuoco dalle fasce |
| Pendio inverso | tre o più uccisioni a corto raggio da unità ferme sulle vittime che sono arrivate da una cresta |
| Agguato | un gruppo in movimento incontra nemici che stavano fermi da 45 s; loro sparano per primi e i mobili perdono due unità o metà del gruppo |
| Schermo | una o due unità in movimento avanti a un corpo di tre o più, che incontrano per primi il nemico |
| Linee interne | i gruppi di una parte vicini tra quelli dell'altra, le sue unità che si spostano tra loro |
| Ritmo | una parte che risponde al contatto (svolta, cambio di velocità, primo colpo) 1,5 volte più in fretta, p di Mann-Whitney sotto 0,05 |
| Manovella, tacca, trascinamento, pompa | il bersaglio di un lancio missilistico gira il tiratore a 35-70°, 75-105°, oltre 140°, oppure lo trascina e torna indietro |
| Tenaglia aerea, muro, coda-testa, tritatutto | una coppia che si divide su un nemico; tre affiancati verso il nemico; un elemento 5-20 km dietro un altro; due che orbitano un punto a distanza di uno |
| Pattuglia di combattimento aereo | orbita intorno a una stazione per tre minuti |
| Combattimento di energia / di angoli | in un combattimento ravvicinato - rotte distanti 30°, ognuno che tiene l'altro sul muso a turno, o un'uccisione tra loro - altezza usata e in salita, oppure piatti e in virata stretta rallentando; sicuro quando uno ha ucciso l'altro |
| Pacchetto d'attacco, SEAD | un gruppo aereo con ruoli misti, alcuni dei quali colpiscono il suolo; uccisioni della contraerea prima di quasi tutte le altre uccisioni a terra |
| Linea di battaglia, attraversare la T | tre navi in colonna; una colonna che attraversa in quadrato la testa di una colonna nemica |

Ogni manovra indica quali **schemi** della base di conoscenza mostra
(`patterns-maneuver.ts`: formazione, attacco frontale, doppio avviluppamento,
accerchiamento, penetrazione, fuoco e manovra, finta, ritirata, inseguimento,
difesa in profondità, schermo, dispersione, difesa dai missili, combattimento
di angoli, pattuglia di combattimento aereo, pacchetto d'attacco, linea di
battaglia, attraversare la T) e le voci da leggere per prime; le voci più
vecchie portano i nuovi schemi tramite `knowledge/maneuver-tags.ts`. Vedi
[La lente della conoscenza](knowledge.md).

**Ha pagato** confronta lo scambio delle unità mentre la manovra durava (e un
minuto dopo) con quello della loro parte per tutta la partita. Una ritirata
paga quando, dopo essersi girata, ha perso meno unità di prima; una difesa dai
missili quando l'aereo sopravvive un minuto; un accerchiamento quando la sacca
perde la metà.

## Su molte partite {#over-many-matches}

Il riepilogo di ogni partita (`src/mass/summarize.ts`, vedi [Analisi di
massa](mass-analysis.md)) contiene una piccola sezione `maneuvers`: per tipo e
parte, fatte (a Probabile o più), pagate, non pagate, uccisioni e perdite.
**Analisi di massa → Manovre** le somma sulle partite che il filtro tiene - per
mappa e modalità, oppure su tutte - con l'intervallo di Wilson del tasso di
pagamento; una riga carica le partite in cui è stata fatta. I riepiloghi scritti
prima che esistesse la sezione non ne hanno: esegui
`node tools/3dheat-summarize.mjs <folder> --force` per aggiungerla.

## Quanto è sicura {#how-sure-it-is}

Partite sintetiche con manovre inserite apposta (`synth.ts`, eseguite da
`maneuver.test.ts`): tutte e 28 le specie inserite vengono trovate a
Probabile o più; delle 50 manovre segnalate, 31 sono della specie inserita e
le altre 19 ci sono davvero (la formazione del gruppo in movimento, l'avvicinamento
frontale della colonna che penetra); nessuna è sbagliata. Su 30 partite nulle -
passeggiate casuali separate e mescolate, unità ferme a caso, aerei su rotte
dritte, una folla che si muove senza meta - non viene segnalato nulla a
Probabile o più.

Sui dati reali (decine di battaglie a terra, alcune lunghe missioni di guerra
aerea, una dozzina di partite di sparatutto): attacchi frontali, fianchi,
penetrazioni e accerchiamenti nelle battaglie di carri, formazioni e
combattimenti ravvicinati in aria, difese dai missili, orbite di pattuglia e
coppie coda-testa nelle missioni di guerra aerea, esecuzioni frontali, colonne e
qualche agguato e coppie di copertura nello sparatutto. Le soglie sono le forme
della dottrina alla scala del gioco; leggi una singola scoperta con le sue prove,
e i tassi della tabella di massa con i loro intervalli.

### Contro i modelli nulli delle stesse partite {#against-null-models-of-the-same-matches}

Un rilevatore può essere ingannato dal terreno e dalla folla: in una mischia
ogni gruppo ha nemici tutt'intorno. Quindi ogni tipo viene eseguito anche su
**modelli nulli** costruiti dalle stesse partite (`nulls.ts`), dove le parti non
si incontrano più come prima: la linea del tempo di una parte girata di un terzo
o due terzi della partita (*shift*), oppure i suoi percorsi girati intorno al
centro della mappa (*rotate*); e le etichette delle squadre mescolate (*teams*,
che per costruzione tiene circa metà dei combattimenti reali). I combattimenti
vengono contati solo come uccisioni accoppiate alle loro morti, con il killer
entro 2 R e la vittima sul posto - un modello nullo rompe questo legame.
Scoperte a Probabile o più, reali contro i modelli nulli (30 battaglie di carri;
12 partite di sparatutto):

| Tipo | Battaglie di carri: reali / shift / rotate | Sparatutto: reali / shift / rotate |
|---|---|---|
| Accerchiamento | 0 / 0 / 0 (era 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Penetrazione | 0,03 / 0,02 / 0,05 (era 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Fianco | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Attacco frontale | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Ritirata | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (quindi mai sicura a piedi) |
| Agguato | - | 0,17 / 0,04 / 0,04 |
| Combattimento di energia | 1,2 / 0,1 / 0,85 | - |
| Combattimento di angoli | 0,6 / 0,07 / 0,3 | - |

I combattimenti aerei ravvicinati sopra il centro di una battaglia restano
dopo una virata intorno a quel centro, quindi la colonna rotate li favorisce
meno di quanto faccia con i tipi di terra. I tipi interni a una parte - formazione,
pattuglia di combattimento aereo, tritatutto, pacchetto d'attacco, SEAD,
copertura, schermo - non dipendono dall'altra parte e non vengono provati in
questo modo. `maneuver.test.ts` verifica che i modelli nulli eliminino dalle
partite sintetiche il fianco, la tenaglia, l'accerchiamento, la penetrazione,
l'agguato e la ritirata inseriti.

## Limiti {#limits}

- I gruppi hanno bisogno di posizioni nel tempo; un file di soli eventi non ne ha.
- La direzione non viene letta dai dati: il fronte del nemico è dove la forza di
  blocco lo ingaggia, altrimenti dove si muove, altrimenti da dove è arrivato
  l'attaccante.
- Il terreno si legge dalle altezze delle unità stesse (il pendio inverso); non
  c'è un controllo della linea di vista.
- I file molto grandi vengono campionati a passi più lunghi; le brevi manovre
  aeree al loro interno si leggono comunque da passi di 2-4 s.
