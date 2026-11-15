---
title: "Eventi di controllo dell'auto"
parent: "Analisi di gara"
nav_order: 54
lang: "it"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: true
---

# Eventi di controllo dell’auto

Il visualizzatore guarda come è stato guidato ogni giro e segna dove il pilota ha fatto scivolare, girare o urtare l’auto, o dove ha sprecato aderenza. È utile, perché un errore che è costato tempo è la cosa più rapida da correggere.

![La sezione Controllo dell’auto: quante volte ogni giro ha bloccato una ruota, girato o allargato, e l’elenco dei difetti con uno aperto](../assets/img/en/race-control-table.webp)

## In parole semplici {#in-plain-words}

- **Bloccaggio**: freni così forte che una ruota smette di girare e scivola. L’auto frena peggio e non può sterzare.
- **Pattinamento**: dai così tanto gas che le ruote motrici girano più in fretta di quanto avanza l’auto. Perdi spinta.
- **Sovrasterzo**: il posteriore dell’auto scappa di lato. Se gira su se stesso, è un **testacoda**.
- **Sottosterzo**: l’anteriore dell’auto scappa di lato («allarga»); girare di più il volante non aiuta.
- **Urto** e **incidente**: l’auto ha toccato qualcosa (un urto è una botta o un graffio, un incidente è una botta forte).
- **ABS**, **TC**: gli aiuti dell’auto che agiscono contro il bloccaggio e il pattinamento. Non sono errori.

## La sezione Controllo dell’auto (cosa si vede) {#the-car-control-section-what-you-see}

Per il giro in primo piano, a seconda di ciò che contengono i giri: senza slittamento dei pneumatici e senza angolo di derapata, mostra ciò che si riesce ancora a trovare invece di nulla (vedi sotto).

**La tabella**: una riga per ogni tipo che almeno uno dei due giri mostra – Ruote bloccate, Pattinamento, Posteriore che scappa (sovrasterzo e testacoda), Anteriore che allarga, Incidenti, Urti, ABS attivo, Controllo di trazione attivo, Freno a mano, In volo – ogni cella «conteggio · secondi», per il giro in primo piano e per il giro con cui è confrontato; e *Angolo di derapata massimo* quando c’è un angolo di derapata (il più grande a terra).

**L’elenco**: i suoi difetti non condivisi che costano almeno 0,02 s, dal più costoso, al massimo 12, ciascuno con il suo titolo e costo (e il chip del suo tipo). Clicca su uno per leggere il suo consiglio, allinea le auto 40 m prima e riproducilo. **Anche ciò che hanno fatto entrambi i giri lì** aggiunge ogni difetto, anche quelli condivisi (chip «l’hanno fatto entrambi», costo «—» sotto 0,01 s). Se non ce n’è nessuno: «Nulla di ciò che X ha fatto con i pneumatici gli è costato tempo senza che lo facesse anche Y.»

**La nota sotto** dice con cosa il rilevamento poteva vedere – «Dallo slittamento e dall’angolo di deriva di ogni ruota, e dall’angolo di derapata dell’auto.» (oppure slittamento e angolo di deriva, slittamento e angolo di derapata, solo slittamento, oppure «Solo dall’angolo di derapata dell’auto – questi giri non contengono lo slittamento dei pneumatici.») – il fondo per cui sono stati misurati i limiti (asfalto, smosso, misto: oltre l’80% di campioni smossi è smosso, sotto il 20% è asfalto), a quale giro sono stati confrontati gli eventi, e come si conta il costo.

Con **nessuno slittamento dei pneumatici e nessun angolo di derapata** (un file di giro FH Companion senza la sua telemetria) la tabella e l’elenco sono mostrati lo stesso, e la nota dice cosa si è comunque trovato da ciò che i giri contengono: «Questi giri non contengono né slittamento dei pneumatici né angolo di derapata, quindi bloccaggi e pattinamento non si possono rilevare. Si rilevano comunque: il sottosterzo, dallo sterzo rispetto alla traiettoria; le scivolate, dalla velocità d’imbardata dove i giri la contengono; gli urti e gli incidenti, dalla velocità e dall’accelerazione.» Il sottosterzo si nomina solo dove ci sono dati di sterzo. La frase sui limiti di slittamento e di derapata viene omessa, e una seconda nota dice: «Per Forza Horizon, scegli anche il file `.tele.gz` accanto a ogni giro FH Companion: è la telemetria completa, lo slittamento di ogni ruota 64 volte al secondo.»

Il **costo totale** di controllo del giro (usato nei riepiloghi) conta una volta sola gli errori che si sovrappongono – un bloccaggio e la scivolata che ne nasce, entro 40 m – al costo più alto del gruppo.

## Come si rileva {#how-it-is-detected}

Il resto di questa pagina è il regolamento: ogni tipo, ogni soglia.

Codice: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Il ragionamento e la letteratura sono in [il metodo](race-analytics.md).

## I tipi {#the-kinds}

| Tipo | Riga della tabella | È un errore? | Il più breve che conta |
|---|---|---|---|
| `lock` | Ruote bloccate | sì | 0,1 s |
| `wheelspin` | Pattinamento | sì | 0,15 s |
| `oversteer` | Posteriore che scappa | sì | 0,2 s |
| `spin` | (conteggiato con Posteriore che scappa) | sì | 0,1 s |
| `understeer` | Anteriore che allarga | sì | 0,25 s |
| `crash` | Incidenti | sì | - |
| `hit` | Urti | sì | - |
| `abs` | ABS attivo | no | 0,2 s |
| `tc` | Controllo di trazione attivo | no | 0,2 s |
| `handbrake` | Freno a mano | no | 0,1 s |
| `airborne` | In volo | no | 0,15 s |

Le serie più brevi sono rumore (un cordolo, un dosso, un solo campione). Le serie di punti della griglia (ogni 2 m) che superano un test vengono unite se separate da al massimo 2 punti. Solo gli **errori** possono essere sbagli e hanno un costo; gli altri sono ciò che l’auto e il pilota hanno fatto.

## Cosa serve a ogni test {#what-every-test-needs}

### Canali derivati {#derived-channels}

Prima di giudicare qualcosa, ogni giro riceve ciò che il suo gioco non invia, con nomi canonici (il valore del gioco vince sempre):

| Canale | Da |
|---|---|
| `bodySlip` (angolo di derapata) | il vettore velocità nel sistema dell’auto, `atan2(latVel, abs(longVel))`, dove il gioco lo invia (0 sotto 3 m/s); altrimenti la direzione (lo `yaw` del gioco, adattato alla direzione di marcia con segno e offset sui campioni oltre 10 m/s, usato solo con una varianza circolare sotto 0,05) rispetto alla direzione di marcia (posizioni distanti almeno 2 m), a velocità sopra 3 m/s |
| `yawRate` | la variazione di `yaw` nel tempo, dove c’è una direzione ma non una velocità |
| `airborne` | il contatto a terra di ogni ruota spento (≤ 0,5); altrimenti il carico di ogni ruota sotto il 5% della sua mediana; altrimenti la corsa di ogni sospensione a 0,02 o meno (completamente estesa). Un solo campione isolato non è un volo |
| `slipRatio.<W>` | `(velocità superficiale della ruota − velocità dell’auto) / velocità dell’auto` sopra 3 m/s, dove il gioco invia le velocità superficiali delle ruote; oppure dalla rotazione della ruota × un raggio di rotolamento misurato sul giro – la mediana di `velocità / rotazione` mentre si rotola dritti (velocità > 10 m/s, gas < 0,3, freno < 0,05, abs(accelerazione longitudinale) < 3 m/s², non in volo; ogni campione sopra 10 m/s se sono meno di 20), accettato tra 0,1 e 1 m. Segnato `physical` |
| `loose` | la vibrazione del fondo di Forza su almeno 2 ruote (> 0,001) per almeno 0,33 s (un cordolo è più breve), con interruzioni sotto 1 s colmate |

### A terra e stabile {#on-the-ground-and-settled}

Niente viene giudicato in volo o per **0,3 s dopo un atterraggio** – le sospensioni toccano il fondo e le accelerazioni salgono di colpo, il che non è aderenza, frenata o trazione. Un campione deve anche essere **in movimento**: più veloce di 5 m/s.

### Il fondo {#the-ground}

Il fondo di ogni campione è **smosso** dove il canale `loose` del giro lo dice (la vibrazione del fondo di Forza, i materiali delle ruote di Trackmania), altrimenti la superficie del giro (vedi [disciplina e superficie](race-loading-laps.md#discipline-and-surface)): asfalto, o smosso per tutto il resto. Curve, abitudini di derapata e soglie sono tenute separate per asfalto e fondo smosso.

### Slittamento, come multiplo del picco nominale del pneumatico {#slip-as-a-multiple-of-the-tyres-nominal-peak}

I giochi scalano lo slittamento in modi diversi; `meta.slip` dice come, e ogni slittamento è diviso per una scala così che circa 1 sia il picco nominale del pneumatico:

| `meta.slip` | Significato | Diviso per |
|---|---|---|
| `peak` | normalizzato dal gioco: oltre 1 si perde aderenza (Forza Data Out) | 1 |
| `scaled` | slittamento fisico diviso per un picco sull’asfalto (il registratore Kunos) | il picco nominale del fondo diviso quello dell’asfalto |
| `index` | una misura di scivolamento da 0 a 1 (SlipCoef di Trackmania) | 0,5 |
| `physical` (o sconosciuto) | rapporto di slittamento come frazione, angolo di slittamento in radianti | il picco nominale del fondo |

Picchi nominali, quando non si sa di meglio:

| Fondo | Rapporto di slittamento | Angolo di slittamento |
|---|---|---|
| asfalto | 0,12 | 8° |
| misto | 0,18 | 12° |
| smosso (ghiaia) | 0,25 | 15° |
| neve | 0,25 | 15° |
| ghiaccio | 0,10 | 6° |

### Dove finisce l’aderenza: le curve dei pneumatici di ogni auto {#where-grip-ends-each-cars-tyre-curves}

Dove un pneumatico smette di dare di più è **misurato per ogni auto**, da ogni giro caricato (`measureTyres`), separatamente per asfalto e fondo smosso:

| Curva | Campioni (velocità > 10 m/s, stabili, accelerazioni sotto 45 m/s²) | Slittamento (x) | Forza (y) |
|---|---|---|---|
| frenata | freno > 0,3, freno a mano ≤ 0,2, in rettilineo (laterale sotto il 30% del massimo) | valore assoluto della media del rapporto di slittamento delle quattro ruote | decelerazione |
| trazione | gas > 0,8, freno ≤ 0,05, in rettilineo, la spinta a tutto gas dell’auto a quella velocità > 0,5 m/s² | il rapporto di slittamento della ruota motrice più slittante | accelerazione come quota di quella spinta |
| anteriore | laterale oltre il 30% del massimo, l’aderenza dell’auto a quella velocità > 1 m/s² | il più grande angolo di slittamento anteriore | accelerazione laterale come quota di quell’aderenza |
| posteriore | lo stesso | il più grande angolo di slittamento posteriore | lo stesso |

«Il massimo» è il 99° percentile del valore assoluto dell’accelerazione laterale del giro su quel fondo (tutto il fondo quando ha meno di 50 campioni). La trasmissione decide le ruote motrici (anteriori con FWD, posteriori con RWD, tutte con AWD; sconosciuta: tutte).

Da almeno **150 campioni**, lo slittamento è diviso in 6–14 fasce con lo stesso numero di campioni (una ogni 40 campioni); la forza di ogni fascia è il suo quartile superiore (ciò che il pneumatico ha dato quando il pilota lo ha chiesto), lisciato con le fasce vicine. Il **migliore** è la fascia con più forza; il **limite** è la prima fascia oltre la quale la forza è scesa dell’**8%**. Una curva che nei dati non scende mai ha un limite infinito – andare oltre il «picco» non costa nulla in quel gioco, e lo slittamento da solo non segnala niente lì (le curve di curva e trazione di Forza Horizon sono così). Con troppo pochi campioni su un fondo, si usano quelli dell’altro fondo; con troppo pochi in totale, il limite **nominale**: 1,5 volte il picco nominale.

Ogni auto ottiene anche:

- la sua **abitudine di derapata**: il quartile superiore del suo angolo di derapata ovunque curvi al 60% o più del suo massimo (servono 100 campioni);
- il suo **sterzo per curvatura** (`steerGain`), per fascia di velocità da 5 m/s: la mediana di abs(sterzo) / curvatura del percorso mentre curva con decisione ma ben dentro la sua aderenza (dal 30 al 60% del suo massimo, curvatura più stretta di un raggio di 400 m, sterzo sopra 0,02; 25 campioni per fascia). La curvatura del percorso è la velocità d’imbardata diviso la velocità dove il gioco invia una velocità d’imbardata, altrimenti dalle posizioni ±5 m.

## Rilevamento, tipo per tipo {#detection-kind-by-kind}

| Tipo | Test (su campioni in movimento e stabili) | `peak` e `limit` |
|---|---|---|
| **bloccaggio** | freno > 0,05, freno a mano non oltre 0,2, e lo slittamento di una ruota sotto il limite di frenata negativo | lo slittamento più negativo (multipli del picco nominale); il limite come negativo |
| **pattinamento** | gas > 0,2 (o nessun canale del gas), e lo slittamento di una ruota motrice sopra il limite di trazione | lo slittamento motore più grande; il limite |
| **sovrasterzo** (angolo di derapata) | l’angolo di derapata sopra il maggiore tra il minimo del fondo e 1,5 × l’abitudine di derapata dell’auto lì | il più grande angolo di derapata, in radianti |
| **sovrasterzo** (angoli di slittamento, senza angolo di derapata) | il più grande angolo di slittamento posteriore sopra il limite posteriore e più di 0,25 sopra quello anteriore | l’angolo di slittamento posteriore (multipli del picco) |
| **sovrasterzo** (senza angolo di derapata, ma con velocità d’imbardata e accelerazione laterale) | la «velocità d’assetto» – valore assoluto della velocità d’imbardata meno valore assoluto dell’accelerazione laterale diviso la velocità, sopra 8 m/s – sopra 0,2 rad/s, con lo sterzo contro la curva | rad/s; limite 0,2 |
| **testacoda** | una corsa di sovrasterzo il cui angolo di derapata ha superato **60°** | come sovrasterzo |
| **sottosterzo** (angoli di slittamento) | non in scivolata, il più grande angolo di slittamento anteriore sopra il limite anteriore e più di 0,3 sopra quello posteriore | l’angolo di slittamento anteriore; il limite |
| **sottosterzo** (senza angoli di slittamento) | più veloce di 12 m/s, non in scivolata, non in controsterzo, accelerazione laterale sopra la metà del massimo del giro (99° percentile), percorso più stretto di un raggio di 300 m, e sterzo più di **1,6 volte** ciò che lo sterzo per curvatura dell’auto dice che il percorso richiedeva | volte lo sterzo necessario; limite 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` sopra 0,5 | - |
| **freno a mano** | `handbrake` sopra 0,2 | - |
| **in volo** | `airborne` sopra 0,5 | - |
| **urto**, **incidente** | vedi [Urti e incidenti](#hits-and-crashes) | la velocità che l’urto ha tolto |

Soglie di angolo di derapata per fondo: asfalto **7°**, misto **10°**, smosso e neve **15°**, ghiaccio **10°**. Un’auto che deriva di più come cosa normale – un modello di pneumatico arcade, uno specialista dello sterrato – ha una soglia sua, più alta, dai suoi giri (1,5 × la sua abitudine).

**Da che parte gira l’auto** (per «contro la curva»): il cambio di direzione del percorso del giro su ±6 m (almeno 2 punti della griglia); più stretto di un raggio di 600 m conta come curva; destra o sinistra secondo se il mondo è specchiato. Lo sterzo è **contro** la curva quando abs(sterzo) > 0,05 e il suo segno è opposto a quello della curva – una scivolata **recuperata** con controsterzo.

**I pedali all’inizio** (`pedal`): *frenata* quando il freno è sopra 0,1; *gas* sopra 0,3; *alzata* quando il gas era sopra 0,5 entro gli 8 punti della griglia (16 m) prima; *in rilascio* altrimenti (o senza canale del gas).

## Messo a confronto con l’altro giro {#laid-against-the-other-lap}

Ogni evento è giudicato rispetto al giro con cui è confrontato il giro in primo piano in quel tratto (il migliore della sua classe; per quel giro stesso, chi della sua classe è stato più veloce nel tratto):

1. **Quanta strada ha fatto l’altro giro** sugli stessi metri, ±8 m: gli eventi propri dell’altro giro della stessa famiglia (un testacoda conta come sovrasterzo, un incidente come urto) misurati nelle stesse unità, senza soglie, usando le curve dei pneumatici dell’altra auto.
2. **Condiviso** quando l’altro giro ha fatto l’**80%** della strada o più: è così che si guida la curva, non un errore. I tipi che non sono errori sono sempre «condivisi».
3. **Costo**, per un errore non condiviso: il tempo che questo giro ha perso contro l’altro da 5 m prima dell’evento fino a **40 m dopo** (per un urto o un incidente, fino a quando l’auto ha recuperato la sua velocità – i metri per recuperarla con la sua spinta, da 40 a 400 m; senza una spinta misurata, 5 m/s²). Mai negativo.
4. **Velocità regalata** al limite dell’auto: per un bloccaggio, la decelerazione che l’auto mostra di poter fare a quella velocità meno quella che ha fatto, sommata sull’evento; per il pattinamento, la sua spinta a tutto gas meno quella che ha fatto; per un urto, la velocità che ha tolto. Indicata quando supera 0,5 m/s (1,8 km/h).

Un errore non condiviso che costa almeno **0,02 s** è elencato (le [statistiche del percorso](race-course-statistics.md) contano solo gli errori da **0,03 s** o più, così che un errore contato su molti giri sia un errore chiaro), e può diventare la causa della perdita di una curva (vedi [Analisi curva per curva](race-corner-analysis.md#car-control-faults-and-impacts)).

## Urti e incidenti {#hits-and-crashes}

`impacts.ts` legge gli urti dai **campioni propri** del giro, prima che siano ricampionati – un urto dura pochi centesimi di secondo. Le gomme non possono produrre le forze di un urto, quindi un urto è misurato rispetto all’auto stessa del giro:

- **La sua aderenza `G`**: il 99° percentile della sua accelerazione orizzontale `√(lat² + long²)` nel giro, a terra e sopra 5 m/s. Senza canali di accelerazione (o sotto 3 m/s²), 15 m/s² – l’aderenza di un’auto stradale.
- **Soglia**: `max(1,8 G, G + 18, 30)` m/s².
- **Campione colpito**: l’accelerazione orizzontale sopra la soglia *e* che salta più della metà di `G` rispetto al campione precedente; **oppure** la velocità che scende, entro 0,1 s, di più di quanto la soglia toglierebbe in 0,1 s più 1,5 m/s. Solo a terra e stabili, e solo quando l’auto era più veloce di 5 m/s.
- I campioni colpiti entro **0,4 s** sono un solo urto.
- **Prima / dopo**: la velocità più alta nei 0,15 s prima; la più bassa fino a 0,3 s dopo l’ultimo campione colpito.
- **Non è un urto**: velocità persa senza forza dietro – la massima accelerazione orizzontale entro 0,1 s sotto il maggiore tra `G` e 25 m/s² – è il gioco che riavvolge o reimposta l’auto.
- **Incidente** quando ha tolto **30 km/h** o più, o quando ha lasciato l’auto con meno della metà della sua velocità; **urto** altrimenti – una botta, un graffio contro un muro.
- **Direzione**: se l’accelerazione longitudinale è più grande della laterale e negativa: *frontale*; positiva: *da dietro*; se la laterale è più grande: *lateralmente*. Senza accelerazioni, frontale.

Ciò che un’auto può fare è misurato togliendo ogni urto, da 0,1 s prima fino a 1 s dopo (`struckMask`).

## I testi {#the-texts}

Ogni evento è descritto nominando entrambi i giri, con il punto (metri lungo il riferimento), la velocità da cui è iniziato, di quanto ha superato il limite rispetto all’altro giro, e un consiglio. Il consiglio segue dal tipo e da ciò che è stato misurato:

| Evento | Consiglio |
|---|---|
| bloccaggio, solo anteriori | un’anteriore bloccata non può sterzare: meno pressione in cima alla zona, scaricala entrando in curva |
| bloccaggio, solo posteriori | una posteriore bloccata fa ruotare l’auto: frena di più in linea retta, rilascia girando; sposta il bilanciamento in avanti se succede spesso |
| bloccaggio, fondo smosso | una ruota bloccata scava: stringi appena prima del bloccaggio |
| bloccaggio, altrimenti | troppo pedale per l’aderenza: stringi in modo più progressivo |
| pattinamento | dai il gas mentre il volante si raddrizza, e cambia in anticipo dove la trazione è il limite (su fondo smosso: una marcia più alta ammorbidisce la coppia) |
| testacoda / sovrasterzo | secondo il pedale: in frenata (trail braking troppo deciso, una scalata troppo presto), in alzata (tieni un gas costante), sul gas (troppo mentre è ancora girata), nessuno (inserita troppo in fretta); «recuperata con controsterzo» quando si è controsterzato; su fondo smosso o in rally, «un certo angolo è il modo veloce di girare – l’altro passaggio ne è bastato uno» |
| sottosterzo | più volante non serve a nulla una volta che l’anteriore è andato: entra più piano, tieni un po’ di freno per caricare l’anteriore, raddrizza; su fondo smosso, gira l’auto con un’alzata o un colpo di piede sinistro |
| urto / incidente | lateralmente: un metro di margine costa meno dello strisciamento; da dietro: un’altra auto o scivolare all’indietro; un incidente frontale: frena prima; un urto all’anteriore: hai sfiorato qualcosa. «X ha urtato anche lì.» quando è condiviso |

In Trackmania, una scivolata dice anche: sotto circa **400 km/h** (**300** su fondo smosso: sterrato, erba, plastica) una scivolata dà meno spinta che tenere la trazione; sopra, una speedslide all’angolo giusto guadagna, e questa è costata tempo quindi il suo angolo era sbagliato.

## Cosa permette ogni fonte {#what-each-source-allows}

| I giri contengono | Bloccaggi / pattinamento | Sovrasterzo / testacoda | Sottosterzo |
|---|---|---|---|
| slittamento e angolo di slittamento di ogni ruota, velocità dell’auto (Forza Data Out, i giochi AC) | dallo slittamento | dall’angolo di derapata, o dall’angolo di slittamento posteriore | dagli angoli di slittamento |
| velocità delle ruote, velocità nel mondo (giochi rally, BeamNG) | dallo slittamento derivato | dall’angolo di derapata derivato | dallo sterzo per curvatura |
| imbardata e velocità d’imbardata, nessuno slittamento (iRacing) | - | dall’angolo di derapata (l’imbardata adattata rispetto alla direzione di marcia); dalla velocità d’assetto, con controsterzo, solo quando l’imbardata non è affidabile | dallo sterzo per curvatura |
| solo direzione | - | dalla direzione rispetto alla marcia | dallo sterzo per curvatura |
| solo file di giro FH Companion (senza imbardata né slittamento) | - | - | dallo sterzo per curvatura (ci sono sterzo e accelerazioni) |

Urti e incidenti hanno bisogno solo della velocità (meglio con le accelerazioni), quindi ogni fonte li ha. La sezione **Controllo dell’auto** mostra cosa permette ogni fonte: con il solo file di giro FH Companion, i suoi sottosterzi dallo sterzo e i suoi urti, e il consiglio di caricare il `.tele.gz` per il resto.
