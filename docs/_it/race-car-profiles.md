---
title: "Profili delle auto e confronto"
parent: "Analisi di gara"
nav_order: 56
lang: "it"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profili delle auto e confronto

Un’auto può frenare, sterzare e accelerare solo fino a un certo punto. Il visualizzatore misura quanto dai tuoi giri, così non ti dice mai di fare qualcosa che la tua auto non può fare. Questo spiega anche quanto di un secondo perso è colpa dell’auto e quanto è tua.

![Auto a confronto: due auto affiancate con la loro aderenza, frenata e spinta](../assets/img/en/race-cars-compared.webp)

L’analisi dice a un giro di frenare più forte, di portare più velocità o di accelerare prima solo dove la sua auto ha dimostrato di poterlo fare, e toglie da una perdita ciò che le auto stesse spiegano. Quindi i limiti di ogni auto (il suo *inviluppo*, sotto) e il suo carattere (il suo *profilo*) sono misurati da ogni giro caricato di essa. Questa pagina tratta l’inviluppo, il profilo, la sezione **Auto a confronto**, e ciò che le auto decidono in ogni curva.

**Un’auto** = giri con lo stesso numero di auto (o lo stesso nome, senza numero) e lo stesso indice di prestazione: una messa a punto diversa è un’auto diversa.

## L’inviluppo: cosa può fare l’auto a ogni velocità {#the-envelope-what-the-car-can-do-at-each-speed}

Per auto, su ogni giro caricato di essa, in **fasce di velocità di 5 m/s** (24 fasce, fino a 120 m/s). Sono esclusi i campioni in volo, l’assestamento per 0,3 s dopo un atterraggio, e da 0,1 s prima di ogni urto fino a 1 s dopo; le accelerazioni di 80 m/s² o più sono ignorate (sopra ciò che qualunque auto con carico aerodinamico regge).

| Inviluppo | Campioni | Valore per fascia | Servono |
|---|---|---|---|
| **aderenza laterale** | l’accelerazione laterale **tenuta per mezzo secondo** (la media del suo valore assoluto su una finestra centrata di 0,5 s), solo dove l’auto curvava: almeno un terzo del 99° percentile di tutta la sua | 95° percentile | 6 campioni |
| **frenata** | freno > 0,3; l’accelerazione longitudinale come mediana di ogni campione e dei suoi due vicini | 95° percentile della decelerazione | 4 campioni |
| **spinta a tutto gas** | gas > 0,95, freno sotto 0,05; la stessa mediana su tre | 90° percentile | 4 campioni |

Perché tenuta per mezzo secondo: un cordolo, una scivolata che rientra, un’auto che viene recuperata fanno salire l’accelerazione laterale per un attimo, e un’auto che lo fa spesso sembrava più aderente di quanto sia. Perché la mediana su tre: a una distanza di cinque metri un campione è molto lontano, e un picco di un solo campione è un cordolo, un dosso o un muro.

Leggere l’inviluppo a una velocità interpola tra i centri delle fasce, e prende la fascia più vicina con dati dove una fascia è vuota.

**Su due tipi di fondo.** Quando i giri di un’auto hanno percorso un quinto o più dei loro campioni su asfalto e su fondo smosso, un inviluppo separato è conservato per ciascuno, e ogni curva è giudicata con il fondo sotto l’auto nel suo punto più lento.

**Crossover.** La velocità da cui la spinta cala come `1/v` (limitata dalla potenza) invece di restare piatta (limitata dalla trazione): la prima fascia il cui `a·v` è entro il 15% del `a·v` più alto visto.

## Il profilo: che tipo di auto è {#the-profile-what-kind-of-car-it-is}

`profile`, dagli stessi giri (campioni a terra, non colpiti, più veloci di 8 m/s):

| Misura | Come |
|---|---|
| **aderenza tenuta** (m/s²) | 95° percentile dell’accelerazione laterale tenuta per mezzo secondo |
| **spinta** fino a 50 km/h, 50-120, 120-200, sopra 200 (m/s²) | la media della spinta a tutto gas dell’inviluppo su 3-14, 14-33, 33-56 e 56-90 m/s, alle velocità raggiunte dall’auto (fino alla sua più alta + 2 m/s), da almeno tre passi di 1 m/s; e la più grande mostrata, e dove |
| **frenata** (m/s²) | la frenata dell’inviluppo mediata da 60 a 160 km/h (16,7-44,4 m/s), la fascia che il confronto nomina |
| **più veloce** | la velocità più alta raggiunta |
| **arriva al massimo a** | dove smetteva di guadagnare a tutto gas su un rettilineo (sotto) |
| **spinge ancora alla velocità massima** | la spinta dell’inviluppo alla sua velocità massima: quanto le restava ancora da fare |
| **posteriore recuperato, per giro** | volte per giro in cui è scivolata e ha dovuto essere recuperata (sotto) |
| **quota sul gas** | di queste, la quota che è iniziata con gas > 0,5 e senza freno |
| **lascia andare a** | la mediana dell’accelerazione laterale tenuta 0,15 s prima dell’inizio di ogni scivolata, come quota dell’aderenza |
| **oltre 10° di derapata, in curva decisa** | dei campioni che curvano al 60% o più della loro aderenza, la quota in scivolata (10° sull’asfalto, 20° sullo smosso); servono 30 campioni |
| **derapata mediana** | sugli stessi campioni |
| **equilibrio** | angolo di slittamento anteriore meno posteriore (multipli del picco nominale) dove curva con decisione e non scivola, media di almeno 30 campioni: + allarga |
| **superficie** | sopra l’80% di campioni smossi: smosso; sotto il 20%: asfalto; altrimenti misto |

**Arrivare al massimo.** Un campione conta quando il secondo intorno ad esso (±0,5 s, con almeno 0,9 s di dati) era tutto a tutto gas (> 0,95, senza freno), a terra, guidato **dritto** (|laterale| sotto il maggiore tra 4 m/s² e un quarto della sua aderenza), con un guadagno sotto **0,35 m/s²**, più veloce di 25 m/s e entro il 90% della velocità più alta del giro – il tutto gas su una salita o attraverso una curva lunga si ferma anche lui di guadagnare, ben sotto la velocità massima dell’auto. Con almeno **un secondo** di tale altopiano su tutti i giri, la mediana di quelle velocità è il punto in cui l’auto arriva al massimo. Altrimenti non c’è una velocità massima: dove nessun rettilineo era abbastanza lungo, *spinge ancora alla velocità massima* dice quanto mancava. Nessuna supposizione oltre a ciò che mostrano i giri – il rapporto di trasmissione e il limitatore finiscono la spinta di un’auto molto prima della resistenza dell’aria.

**Perdere il posteriore.** Contato dove il pilota ha dovuto recuperarlo: in curva al 60% della sua aderenza o più, in scivolata (derapata oltre 10° sull’asfalto, 20° sul fondo smosso), con lo sterzo (oltre 0,06) girato **contro** la curva. Quale segno dello sterzo concorda con quale segno della forza in curva è misurato per ogni giro (campioni che girano senza scivolare). Una scivolata è contata una volta finché l’auto non smette di scivolare. Un’auto guidata un po’ di traverso di proposito non perde nulla; una che richiede il controsterzo sì. Contato allo stesso modo per ogni auto, così due auto si possono confrontare. Servono sterzo e un angolo di derapata.

## Auto a confronto {#cars-compared}

La sezione della barra laterale è **L’auto** con un’auto, **Auto a confronto** con più auto.

**La tabella**: una colonna per auto, una riga per ogni misura per cui ogni auto ha un valore: Aderenza tenuta; Spinta fino a 50 km/h, 50-120, 120-200, sopra 200; Frenata; Più veloce; Arriva al massimo a («spinge ancora» dove non ci è mai arrivata); Spinge ancora alla velocità massima; Posteriore recuperato, per giro; Oltre 10° di derapata, in curva decisa. Dove le auto differiscono di più del 3%, è segnato il valore migliore (più alto per aderenza, spinta, frenata, velocità; più basso per le scivolate del posteriore).

**Un’auto da sola**: frasi su ciò che i giri mostrano che sia – l’aderenza che tiene (m/s² e g), la sua spinta in ogni fascia, dove smetteva di guadagnare sui rettilinei lunghi (o che non arrivava mai al massimo, e cosa spingeva ancora alla velocità massima), con quale frequenza il suo posteriore doveva essere recuperato («quasi mai» sotto una volta per giro, «per lo più sul gas» quando il 60% o più è iniziato lì).

**Due auto**: per ogni coppia, una frase per ciascuna su ciò che l’auto è rispetto all’altra («X accelera meglio, ma non può girare con la stessa forza, ha bisogno di più spazio per fermarsi e perde il posteriore più facilmente»), la tabella, ogni differenza chiara in ordine di grandezza, poi **Come guidare ciascuna**. Con più di **3** coppie, ne è mostrata una sola: l’auto del giro in primo piano contro un’auto scelta da un elenco a discesa (per impostazione predefinita l’auto del miglior giro della sua classe, altrimenti quella di riferimento, altrimenti la prima altra).

Una differenza è detta solo quando i giri la mostrano chiaramente:

| Differenza | Detta da | Frase |
|---|---|---|
| aderenza | **4%** | «X tiene N% di aderenza in più nelle curve … significa M% di velocità in più nel mezzo di ogni curva» (velocità = √ del rapporto di aderenza) |
| spinta | **5%**, nella prima fascia che entrambe le auto hanno tra 120-200, 50-120, sopra 200 km/h | «X accelera N% più forte da 120 a 200 km/h»; anche in partenza, o «anche se Y parte più forte», quando la partenza differisce dell’8% |
| velocità massima | **4 km/h** | «X arriva più in alto: ha smesso di guadagnare a …» |
| velocità massima, solo una | un’auto ha raggiunto il massimo, l’altra no | «Y ha esaurito la spinta a …; X stava ancora guadagnando quando ha frenato» |
| velocità massima, nessuna | nessuna ha raggiunto il massimo | ciò che ciascuna stava ancora guadagnando alla sua velocità massima |
| frenata | **5%** | «X frena N% più forte … Y deve frenare prima» |
| perdere il posteriore | almeno una volta per giro in più **e** la metà in più di frequenza | «X perde il posteriore più facilmente: scivola abbastanza da richiedere il controsterzo N volte per giro contro M …» – per lo più sul gas (60%+) o per lo più in inserimento e in alzata (30% o meno), da circa P% della sua aderenza; sullo smosso «parte di ciò è come si gira un’auto; il recupero no» |
| di traverso | **12 punti percentuali** di curva decisa oltre la soglia di derapata | «X corre più di traverso al limite» |
| equilibrio anteriore | **0,3** del picco nominale | «X allarga di più all’anteriore … Va rallentata e girata prima del punto di corda» |

I tratti nel riepilogo: *tiene più aderenza* / *non può girare con la stessa forza*, *accelera meglio* / *spinge meno*, *arriva più in alto* / *arriva più in basso*, *spinge ancora alla fine dei rettilinei* / *esaurisce la spinta*, *frena più forte* / *ha bisogno di più spazio per fermarsi*, *è più stabile* / *perde il posteriore più facilmente* (*è molto più scivolosa …* con il doppio delle volte più una; *richiede più spesso di essere recuperata* sullo smosso), *allarga all’anteriore*. «Poco da distinguerla da Y su questi giri» quando non c’è nessuna differenza.

**Come guidare ciascuna:**

- un’auto tiene più aderenza e l’altra spinge di più: porta velocità nel mezzo su una linea ampia e tonda (la «U») con quella che tiene di più; frena dritto, ruotala in un centro corto e stretto e raddrizza l’uscita (la «V») con quella forte;
- un’auto è indietro su entrambe: il suo giro migliore è quello più pulito – frena dritto, il raggio più largo, tutto gas il prima possibile finché regge;
- un’auto che perde il posteriore più facilmente: dai gas solo mentre il volante si raddrizza e cambia marcia in anticipo (scivolate sul gas), oppure rilascia il freno dolcemente e tieni un gas costante nel mezzo (scivolate in inserimento).

Il suggerimento sotto la sezione ripete come si misura ciascuna.


## Cosa decidono le auto in una curva {#what-the-cars-decide-in-a-corner}

Quando i giri sono su auto diverse, ogni risultato su una curva persa termina con **Le auto:** – quale parte di esso decidono le auto, e come sfruttare al meglio questa (`carNote`):

- **Nel mezzo**, quando questa auto tiene meno del 96% dell’aderenza dell’altra, l’altra era più veloce di oltre 0,5 m/s nel punto più lento, e questo giro non era molto sotto ciò che la sua aderenza spiega (oltre il 70%): sulla linea dell’altra auto l’aderenza di questa consente `v_altra · √(aderenza_mia / aderenza_altra)`. Se il giro ha portato quella velocità (entro 1 m/s) la differenza è l’auto, e nessun punto di frenata la cambia; se di meno, quanto c’è ancora da guadagnare. Poi dove si può vincere il tempo invece: su un rettilineo, tra due, o in un’auto che spinge il 5% in più – dopo il punto di corda (frena dritto, gira più tardi, punta presto all’uscita); altrimenti il raggio più largo che la strada consente.
- **Un posteriore che ha ceduto qui** (una scivolata o un testacoda non condivisi, o una derapata oltre la soglia di scivolamento nell’ingresso), in un’auto che lo perde almeno una volta per giro in più e la metà in più di frequenza: cosa fare con questa auto – il gas dato man mano che il volante si raddrizza (le sue scivolate iniziano con la potenza nel 60% o più dei casi) oppure il freno rilasciato dolcemente senza alzata.
- **Il rettilineo dopo**: quando la spinta delle auto spiegava 0,03 s o più, la spinta più forte dell’altra auto dalla stessa velocità, con la spinta di entrambe da 120 a 200 km/h.
- **Velocità massima**: quando questo giro ha raggiunto il 98% di dove la sua auto arriva al massimo su un rettilineo lungo più di 150 m, e l’altra è andata 1,5 m/s più veloce: quella è la velocità massima dell’auto, e ogni km/h in più all’uscita della curva aiuta finché non ci arriva.
- **Frenata**: quando l’altra auto frena il 5% più forte e questo giro ha frenato più di 5 m prima, il fatto che parte della frenata anticipata sia dell’auto.

La quota dell’auto è anche tolta dal tempo stesso – vedi [la quota dell’auto](race-corner-analysis.md#the-cars-share) – e una curva dove l’auto spiega il 60% o più è attribuita all’auto.

## Per gli sviluppatori {#for-developers}

Codice: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` in [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` in [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
