---
title: "Mappatura delle colonne"
parent: "Caricare i dati"
nav_order: 2
lang: "it"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Mappatura delle colonne

Un file è una tabella, e 3DHeat deve sapere quale colonna contiene la posizione est-ovest, quale il tempo, quale il nome del giocatore, e così via. Questo pannello dice cosa ha indovinato, e dove correggi un'ipotesi sbagliata.

![Il pannello Mappatura delle colonne dopo il caricamento di un file Parquet: ogni casella già compilata - 1 X, 2 Y, 3 Z, 4 Tempo, 5 ID persona, 6 Sessione / partita, 7 Squadra / gruppo](../assets/img/en/column-mapping-panel.webp)

*Il file ha dato i nomi alle sue colonne, quindi ogni casella è già compilata.*

Per esempio, un CSV con l'intestazione `x,y,z,t,player,team` si mappa da solo: x, y e z diventano la posizione, `t` il tempo, `player` la [persona](glossary.md) e `team` il [gruppo](glossary.md).

Dopo aver selezionato i file, il pannello **Mappatura delle colonne** si apre sotto il pannello Sorgente. Dice quale colonna ha quale ruolo. Viene compilato in automatico e ogni campo può essere cambiato prima di premere **Carica**; la mappatura viene letta al momento del caricamento, quindi cambiarla dopo significa caricare di nuovo.

## I campi {#the-fields}

Tutti i menu delle colonne elencano ogni colonna del primo file, più *- nessuna -*.

| Campo | Ruolo | Note |
|---|---|---|
| **Separatore** | Solo CSV: il delimitatore dei campi. | Menu: *Virgola ,*, *Punto e virgola ;*, *Tab*, *Barra verticale \|*, *Spazio*; oppure scrivi un qualunque carattere singolo in *o scrivi un carattere*. Rilevato in automatico (vedi sotto). Cambiarlo rifà la mappatura automatica, quindi le modifiche fatte prima vanno perse. |
| **X**, **Y**, **Z** | Posizione. | Ne servono almeno due; un terzo asse non mappato vale 0 (i dati stanno su un piano). La stessa colonna su due assi è un errore. |
| **Asse verticale nella sorgente** | Quale asse della sorgente punta in alto. | *Z è in alto (la maggior parte dei motori di gioco)* o *Y è in alto (convenzione grafica)*. Vedi [Assi, unità e tempo](axes-units-and-time.md). |
| **Scala delle unità** | Moltiplica ogni posizione. | Pulsanti *1 (m)* e *0,01 (cm→m)*, oppure scrivi un valore. |
| **Inverti X / Inverti Y / Inverti Z** | Nega un asse della sorgente. | Applicato alle posizioni e ai vettori di direzione dello sguardo. |
| **Tempo** | L'asse del tempo. | Facoltativo. Senza di esso non c'è linea del tempo. |
| **Unità di tempo** | Come leggere la colonna del tempo. | Sette unità; vedi [Assi, unità e tempo](axes-units-and-time.md#time). Ignorato per le colonne Parquet `TIMESTAMP`/`DATE`, cosa che il pannello dice. |
| **ID persona** | Di chi o di cosa è una riga. | Facoltativo. Rende possibili tracce, durate di vita, replay a scatole e mappa di calore delle linee. |
| **Sessione / partita** | A quale partita, incursione, round, corsa o giro appartiene una riga. | Facoltativo. Le posizioni non vengono mai interpolate, tracciate o unite in un percorso attraverso un cambio di sessione. Vedi [Sessioni, persone e gruppi](sessions-persons-groups.md). |
| **Squadra / gruppo** | Una qualunque colonna a bassa cardinalità. | Facoltativo. Guida i colori dei gruppi, il calore delle squadre e la divisione per gruppo della differenza. |
| **Direzione dello sguardo** | *Nessuna*, *Colonne imbardata / beccheggio* oppure *Colonne vettore di direzione*. | Con imbardata/beccheggio: **Imbardata**, **Beccheggio** e **Unità degli angoli** (*Gradi* / *Radianti*). Con un vettore: **Dir X**, **Dir Y**, **Dir Z**. Usato per i raggi di sguardo del [replay a scatole](box-replay.md). |
| **Conserva per il filtraggio** | Colonne extra tenute in memoria. | Una casella per colonna, e per ognuna spuntata un *intervallo* (numerico) o una *categoria*. Ognuna costa 4 byte per riga e un passaggio di decodifica al caricamento. Solo le colonne tenute possono essere [filtrate](filters.md), usate per una [divisione per differenza](difference.md) o come colonna eventi della [mappa di calore delle linee](line-heat.md). |
| **Mostra righe di esempio** | Una tabella delle prime 12 righe campionate, tutte le colonne. | Per controllare le ipotesi. |

Una colonna di filtro spuntata che non è impostata esplicitamente viene letta come *intervallo*; una colonna di id dall'aspetto numerico è spesso più utile come *categoria*. Possono essere attivi solo 4 filtri alla volta ([Filtri](filters.md)).

## Come la mappatura automatica indovina {#how-the-auto-mapping-guesses}

L'indovinare è in [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Guarda i nomi delle colonne, quali colonne sono numeriche nelle righe campionate (più del 90% dei valori non vuoti si legge come numero), quanti valori distinti prende ogni colonna nel campione, e i tipi logici Parquet. I modelli di nome vengono provati in ordine, senza distinzione tra maiuscole e minuscole, e vince il primo modello che corrisponde a una colonna ancora libera.

### Posizione {#position}

| Asse | Modelli di nome, in ordine (solo colonne numeriche) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Se un asse è ancora vuoto, le prime colonne numeriche libere (ignorando `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) lo riempiono in ordine. Un'ipotesi sbagliata si vede subito sullo schermo; una vuota lascerebbe una vista vuota.

### Tempo {#time}

- **Prima le colonne timestamp Parquet.** Tra le colonne il cui tipo logico è `TIMESTAMP` o `DATE`, la migliore viene scelta per punteggio: +10.000 se il nome corrisponde a un modello di tempo, -5.000 per un semplice `DATE`, più il numero di valori distinti nel campione. Una data di un intero giorno e un inizio di sessione costante hanno quasi nessun valore distinto, quindi vince l'istante dell'evento. L'unità diventa allora *timestamp Unix (ms)*.
- **Altrimenti per nome:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, poi i nomi di tempo trascorso (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). L'unità viene allora indovinata dai valori: ISO-8601 quando un valore ha l'aspetto di `YYYY-MM-DDT…` o `YYYY-MM-DD …`; altrimenti dalla grandezza più grande: sopra 10^17 nanosecondi, sopra 10^14 microsecondi, sopra 10^11 millisecondi Unix, sopra 10^8 secondi Unix, sopra 10^6 millisecondi, altrimenti secondi.

Quando viene scelta una colonna di tempo trascorso, il pannello avvisa che ogni sessione viene allora allineata al proprio inizio - utile per sovrapporre partite, non per vederle in sequenza reale.

### Sessione, persona, gruppo {#session-person-group}

La sessione viene reclamata **dopo** l'asse del tempo e **prima** di persona e gruppo, perché una colonna di sessione è spesso un timestamp (l'istante di inizio della partita su ogni riga della partita).

| Ruolo | Modelli di nome, in ordine |
|---|---|
| Sessione | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (ognuno esattamente, facoltativamente con `_id`) |
| Persona | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, poi `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (dati di corsa: l'auto è ciò che si muove) |
| Gruppo | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Gruppo, di riserva | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Un candidato di gruppo che assume un valore distinto nella maggior parte delle righe campionate (più di max(48, 60% del campione)) è un id, non un gruppo: diventa la colonna di persona se non ne è stata trovata una, e non viene usato come gruppo. Se non si trova affatto una colonna di gruppo, si usa la colonna non numerica con il minor numero di valori distinti tra 2 e 12.

### Direzione dello sguardo {#look-direction}

Una colonna numerica chiamata `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` o `rot_z` / `rotation_z` porta la direzione dello sguardo su imbardata/beccheggio; il beccheggio viene cercato come `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Si presumono gradi quando un'imbardata campionata supera 7 in valore assoluto, altrimenti radianti. Un vettore di direzione non viene mai indovinato; viene dai suggerimenti qui sotto o da te.

### Colonne di filtro {#filter-columns}

Al massimo **6** colonne vengono tenute automaticamente, in ordine di importanza:

1. `region`, `sessionMode`, `actor` - colonne che esistono per essere filtrate (punteggio 1200);
2. colonne di categoria che variano nel campione, prima quelle con meno valori distinti (1000 meno il conteggio);
3. una colonna costante nel campione, ma solo quando sono caricati più file - può cambiare tra i file, come una regione o un id di prova (600);
4. colonne numeriche (500).

Le colonne che già hanno un ruolo, i nomi di disturbo qui sopra, le colonne costanti in un caricamento di un solo file, e le colonne di testo libero (più di max(16, metà del campione) valori distinti) non vengono proposte automaticamente. Qualunque colonna può comunque essere spuntata a mano.

### Asse verticale {#up-axis}

Con tutti e tre gli assi mappati, l'asse con la dispersione minore di Y e Z nel campione viene preso come verticale (una mappa è molto più larga che alta); altrimenti si presume Z in alto.

## Gli suggerimenti `heat3d` in un footer Parquet {#the-heat3d-hints-in-a-parquet-footer}

Un file Parquet può dire come va letto. Se i metadati chiave/valore del footer del file hanno una voce con la chiave **`heat3d`**, il suo valore viene letto come JSON e sovrapposto alle ipotesi ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Il convertitore di demo CS2 scrive una voce del genere, quindi le sue tabelle si aprono con il giocatore come persona, la parte come gruppo, ogni round come sessione, la direzione dello sguardo attiva e il mondo nel verso giusto.

Solo il **primo** file di una selezione viene letto per i suggerimenti. Ogni voce è facoltativa, e ogni valore suggerito compare comunque nel pannello e può essere cambiato. Una descrizione completa dello schema, con un esempio e come scriverlo, è nel [Riferimento dei formati dei dati](data-formats.md#the-heat3d-hints).

Le regole, in breve:

- Una colonna indicata da un suggerimento viene applicata solo quando il file ha quella colonna.
- `lookMode: "vector"` ha effetto solo quando `dirX`, `dirY` e `dirZ` sono tutti impostati; `"yawPitch"` solo quando è impostato `yaw`.
- `extra`, quando presente, sostituisce l'elenco automatico dei filtri (i nomi sconosciuti e le colonne che hanno già un ruolo vengono scartati); il tipo intervallo/categoria di ognuna segue se sembrava numerica. Quando manca, l'elenco automatico viene mantenuto meno ogni colonna a cui un suggerimento ha dato un ruolo.
- `axes.up` deve essere `"y"` o `"z"`, i capovolgimenti devono essere booleani, `scale` deve essere positivo.
- `entity.size`, quando positivo, è la dimensione di una cosa tracciata nelle unità del file ([dimensione dell'entità](sessions-persons-groups.md#entity-size)); è l'unico modo per impostarla.

## Problema noto: cambiare il separatore del CSV {#known-issue-overriding-the-csv-separator}

Quando cambi il separatore con uno diverso da quello rilevato, l'elenco delle colonne e le righe di esempio non cambiano (l'anteprima continua a dividere con il separatore rilevato). Il separatore scelto viene comunque usato per il caricamento vero e proprio. Se il separatore rilevato è sbagliato:

1. Apri il file in un editor di testo.
2. Sostituisci il separatore con una virgola dovunque (e le virgole decimali con i punti).
3. Salva, poi carica di nuovo il file.

La causa sta in [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
