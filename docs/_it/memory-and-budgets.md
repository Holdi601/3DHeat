---
title: "Memoria e budget"
parent: "Caricare i dati"
nav_order: 6
lang: "it"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memoria, budget e controllo di adattamento

Il tuo computer ha una memoria limitata. 3DHeat somma ciò che i tuoi file richiedono e ti dice, prima di **Carica**, se ci stanno.

![La Stima della memoria dice non ci sta, con Carica ogni [N] righe già compilato e il pulsante Carica che dice Troppo grande - riduci o decima](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Troppo grande per questo computer? 3DHeat suggerisce di caricare invece ogni N-esima riga.*

Una scheda del browser che esaurisce la memoria a metà di un caricamento si blocca e perde minuti di lavoro, e una GPU a cui si chiede più di quanto ha perde il suo contesto o rallenta fino a passo di lumaca. Quindi, prima che un caricamento inizi, il pannello Sorgente dice quanta memoria serve, confronta questo con i budget rilevati per questa macchina, e rifiuta – con una via d’uscita – quando non ci sta. Il modello è in [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## La stima della memoria {#the-memory-estimate}

Mostrata sopra il pulsante **Carica**, una volta contate le righe.

| Riga | Significato |
|---|---|
| **Stima della memoria** - *ci sta* / *al limite* / *non ci sta* | Il verdetto, verde, ambra o rosso. |
| `N righe · B B/riga` | Le righe che verranno caricate (dopo il passo) e i byte fissi per riga. |
| `RAM X residente, Y di picco durante il caricamento` | Memoria occupata una volta caricato, e il massimo raggiunto durante il caricamento. |
| `GPU Z · caricamento stimato T` | Memoria GPU per le righe, e una durata stimata a 1,2 milioni di righe al secondo. |
| Nome della GPU | Il nome del renderer, quando il driver lo riporta. |
| Messaggi | Perché non ci sta, o è al limite, e cosa fare. |
| **Carica ogni [N] righe** | Il passo di decimazione (vedi sotto). |
| `Budget: X RAM, Y GPU. Regola in Prestazioni → Budget delle risorse.` | I budget usati dal controllo. |

### Byte per riga {#bytes-per-row}

| Colonna | Fissi (RAM) | Note |
|---|---|---|
| Posizione | 12 | Tre float a 32 bit, sempre (un asse piatto è comunque un array) |
| Tempo | 4 | Quando è mappato |
| Durata | 4 | Quando tempo e persona sono mappati |
| Persona | 4 | Quando è mappata |
| Gruppo | 2 | Quando è mappato |
| Sessione | 4 | Quando è mappata |
| `Source file` | 4 | Quando è caricato più di un file |
| Ogni colonna di filtro | 4 | Per ogni colonna spuntata *Tieni per filtrare* |

Il **picco** aggiunge ciò che il caricamento richiede solo per un momento – 8 byte di tempo a 64 bit durante la fusione, 12 byte di chiavi di ordinamento e indici, 4 byte di spazio di lavoro per la permutazione (tutti e tre quando il tempo è mappato), e 4 byte mentre la colonna del gruppo è ancora a 32 bit – e moltiplica la somma per **2,0**. Quel fattore è stato misurato (un caricamento reale di più file ha raggiunto 1,9 volte gli array elencati, per l’insieme di lavoro del decodificatore Parquet, le copie che riducono ogni colonna alla lunghezza giusta, e la memoria liberata ma non ancora restituita) e arrotondato per eccesso, perché una stima troppo bassa costa una scheda bloccata, mentre una troppo alta costa solo un passo non necessario.

Sulla **GPU** ogni riga costa 8 byte (posizione e gruppo, 16 bit ciascuno), più 4 byte (tempo e durata, 16 bit ciascuno) quando sono mappati sia tempo sia persona. Vedi [Residenza della memoria GPU](gpu-memory.md). Le texture dei filtri (4 byte per riga per ogni filtro attivo) e gli inizi dei segmenti della linea di calore (8 byte per riga mentre la modalità Linee è attiva) non fanno parte di questa stima.

## Il controllo di adattamento {#the-fit-check}

Vengono confrontati tre vincoli ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- il picco di RAM rispetto al **budget RAM**,
- i byte GPU rispetto al **budget GPU**,
- il numero di righe rispetto al **limite di ordinamento** di 400.000.000 di righe, quando è mappata una colonna del tempo.

Decide il rapporto peggiore dei tre: fino al 70% *ci sta*, fino al 100% *al limite* (dovrebbe caricarsi, ma aspettati lentezza), oltre *non ci sta*. Quando non ci sta, il pannello indica il vincolo che decide e suggerisce:

- caricare ogni *N*-esima riga, con *N* = ⌈righe / righe che ci stanno⌉, già compilato nella casella del passo;
- togliere colonne di filtro, rimuovere la mappatura della colonna del tempo (che elimina l’ordinamento e il suo limite, a costo della linea del tempo), o alzare il budget.

Quando il budget stesso non è un fatto dell’hardware – il browser ha limitato il dato della RAM, il valore predefinito è stato tenuto basso da ciò che è libero in quel momento, oppure il dato della GPU è una stima – il messaggio lo dice, così non si ricorre a un passo che non serve.

### Decimazione {#decimation}

**Carica ogni [N] righe** tiene una riga su *N*, contata per file. Il calore è una media, quindi ogni *N*-esima riga dà la stessa distribuzione con più rumore – lo stesso compromesso che il renderer già fa ad ogni fotogramma. La casella parte da 1 (*riga (tutte)*); quando la selezione non ci sta, è già compilata con il passo suggerito, a meno che tu non ci abbia scritto. Il pulsante Carica allora dice *Carica N file (1 su K)*, e il nome del dataset registra `ogni K-esima riga`.

### Il limite di ordinamento {#the-sort-ceiling}

Il renderer vuole le righe in ordine crescente di tempo, quindi una colonna del tempo mappata significa ordinare ogni riga, con un ordinamento radix su chiavi a 32 bit ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Oltre **400 milioni** di righe questo viene rifiutato invece di tentarlo in una scheda. Il controllo avviene prima del caricamento, quindi una selezione oltre il limite viene rifiutata con un suggerimento di passo invece di essere letta per intero e fallire all’ultimo passo. Vicino al limite (*al limite*) il pannello avvisa che l’ordinamento è una lunga fase senza avanzamento proprio. Senza colonna del tempo non avviene alcun ordinamento e non si applica nessun limite.

## Budget delle risorse {#resource-budgets}

**Prestazioni → Budget delle risorse** (una riga richiudibile in fondo al pannello Prestazioni, che dice `Budget delle risorse - RAM, GPU, core`). I budget sono rilevati; il valore rilevato è quello predefinito; e i cursori non vanno oltre un **limite** che è il valore rilevato, tranne dove si sa che la rilevazione non è una misura.

| Controllo | Intervallo | Significato |
|---|---|---|
| **RAM per i dati delle righe** | da 256 MiB al limite della RAM, logaritmico | Il budget RAM per il controllo di adattamento. Segnato *(sopra quello rilevato)* oltre il valore predefinito rilevato, *(massimo)* al limite. |
| **GPU per i dati delle righe** | da 128 MiB al limite della GPU, logaritmico | Il budget GPU per il controllo di adattamento e per il caricamento delle righe. Segnato *(sopra quello rilevato)* oltre il valore predefinito rilevato, *(massimo)* al limite. |
| **Thread di parsing** | da 1 al numero di core logici | Quanti file un caricamento analizza insieme, ciascuno in un proprio worker. Predefinito core - 2 (core - 1 con quattro core o meno). Vedi [Thread di parsing](#parser-threads) (sotto Per gli sviluppatori). |
| Riga delle sorgenti | | Da dove viene ogni dato (`RAM: …. GPU: …. CPU: ….`). |
| **Rileva di nuovo** | | Chiede al server di sviluppo una nuova lettura della memoria e ricalcola ogni budget. |
| Nome della GPU | | Il nome breve dell’adattatore; la stringa completa del renderer è nel suggerimento. |

### Alzare il budget GPU {#raising-the-gpu-budget}

Un budget GPU sopra il valore rilevato si applica come impostato: il controllo di adattamento e il caricamento prendono lo stesso valore da una sola funzione ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), che lo limita solo al limite GPU dove si ferma il cursore. Quindi un caricamento che il controllo supera viene caricato per intero. Oltre il valore rilevato il cursore dice *(sopra quello rilevato)*: il numero è allora il tuo giudizio sulla scheda, non una misura, e impostarlo più alto di quanto la scheda abbia rischia un contesto perso o un rallentamento estremo.

## Dataset enormi: le leve {#huge-datasets-the-levers}

Dalla meno drastica alla più drastica:

1. **Meno colonne di filtro.** Ognuna costa 4 byte per riga e un passaggio di decodifica.
2. **Un passo.** Ogni *N*-esima riga.
3. **Nessuna colonna del tempo.** Nessun ordinamento, nessun limite di ordinamento, nessun 4-8 byte per riga di tempo e durata – e nessuna linea del tempo.
4. **Alzare i budget**, quando sai che la memoria c’è.

In fase di resa, i dataset grandi sono gestiti con il campionamento e l’accumulo progressivo invece che riducendo i dati; vedi [Campionamento e budget](sampling-and-budgets.md).


## Per gli sviluppatori {#for-developers}

### Thread di parsing {#parser-threads}

Un caricamento di più file ne analizza fino a **Thread di parsing** alla volta, ciascuno in un worker di parsing avviato dal worker di ingestione per quel caricamento ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). A 1, o per un file solo, i file sono analizzati uno dopo l’altro nel worker di ingestione stesso.

Eseguirne più d’uno insieme non allenta il controllo di adattamento:

- **Il costruttore è contato per primo.** Le colonne unite sono allocate per l’intera selezione prima che sia letto il primo file, quindi i file in corso ricevono solo ciò che il budget RAM lascia accanto a loro (`parseHeadroom`): posizione, tempo a 64 bit, angoli di sguardo, persona, gruppo a 32 bit, sessione, colonne di filtro e `Source file`, per riga da caricare – moltiplicato per 2,6 quando il numero di righe è una stima da CSV, perché una colonna cresce fino a una più grande.
- **Ogni file prenota il suo costo prima di partire** (`fileParseBytes`): le sue righe (dal piè di pagina Parquet; la quota di un CSV della stima in base alla dimensione) per le stesse colonne, per **8** – il blocco stesso, la copia accanto mentre si scartano le righe senza posizione, e l’insieme di lavoro del decodificatore, che per le colonne di testo è molto più grande dei loro id. Un passo non riduce questo, perché i file sono letti per intero e decimati dopo. L’8 è una tolleranza fissata con le misure: con 3, o con 5, trenta thread di parsing hanno portato una scheda oltre il suo limite su 86 milioni di righe con nomi di persone e sessioni; con 8 no.
- **Un altro file parte solo se la sua prenotazione ci sta** in ciò che resta. Un file finito che aspetta che un file precedente sia unito mantiene la sua prenotazione finché non è unito.
- **Un file gira sempre.** Quando non c’è nulla di prenotato, il file successivo parte qualunque sia il suo costo – è il caricamento uno alla volta che il controllo di adattamento ha ammesso, quindi un budget stretto ricade su di esso invece di rifiutare.

La cifra del *picco durante il caricamento* è il picco di un caricamento uno alla volta, che arriva all’ordinamento, dopo che ogni file è stato letto. I file analizzati fianco a fianco possono occupare memoria oltre quella cifra mentre sono letti; le prenotazioni la tengono entro il budget RAM, per quanto le stime sopra siano corrette.

L’ordine di unione è l’ordine della selezione, qualunque sia l’ordine in cui finiscono i file, quindi la numerazione di persone, gruppi e sessioni, le righe e i valori di `Source file` sono identici a un caricamento uno alla volta. Un file che non si può leggere viene saltato ed elencato esattamente come prima. Un worker di parsing che muore termina l’intero caricamento, come la morte del worker di ingestione ha sempre fatto, e ogni worker di parsing è terminato quando il caricamento finisce, comunque finisca. Se i worker di parsing non si possono avviare affatto, i file sono analizzati nel worker di ingestione.

### Come sono rilevati i valori {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) viene eseguito all’avvio, di nuovo quando il renderer esiste, e a **Rileva di nuovo**.

**RAM, con il server di sviluppo.** `start.bat` e `npm run dev` servono la pagina da un processo che può leggere la memoria della macchina, su `/__host/memory` (risposta entro 1,5 s oppure ignorata). Il predefinito è il minore tra il 60% della RAM installata e l’80% della RAM attualmente libera; il limite è il 60% di quella installata. Quando è la memoria libera a tenere basso il predefinito, il pannello lo dice e suggerisce di chiudere i programmi e premere **Rileva di nuovo**.

**RAM, senza di esso** (una distribuzione statica): nessuna API del browser riporta la memoria libera, e `navigator.deviceMemory` è arrotondata per difetto a una potenza di due e limitata a 8 GiB da Chrome ed Edge. Il predefinito è il 60% di `deviceMemory`, ulteriormente limitato a 4 volte l’heap JS libero della scheda dove il browser lo riporta, oppure a 4 GiB quando non è riportato nulla. Quando `deviceMemory` vale esattamente 8 (il limite), il valore è segnato come *limitato* e il limite è 4 volte il predefinito, con una nota che oltre il predefinito il numero è la tua affermazione, non una misura.

**In entrambi i casi**, il predefinito e il limite della RAM sono limitati a **12 GiB**, la memoria massima di array tipizzati che una scheda di Chrome può contenere qualunque sia la macchina (una pagina ha raggiunto circa 15,75 GB e ha fallito; 12 lascia spazio al resto), e non scendono mai sotto 256 MiB.

**Memoria GPU.** Nessuna API web la riporta affatto.

- Con il server di sviluppo, la memoria della scheda è letta da `nvidia-smi` (l’adattatore più grande) oppure, su Windows, dal valore del registro `HardwareInformation.qwMemorySize` dell’adattatore di visualizzazione. Il predefinito è il 70% di essa, il limite il 90%.
- Senza una lettura, è dedotta: 2 GiB per impostazione predefinita; 4 GiB quando la texture più grande è di 16.384 px o più (una scheda dedicata), 1 GiB quando è più piccola; oppure 8 volte il `maxBufferSize` di WebGPU quando è più grande. Il limite è allora 8 volte il valore dedotto, perché la deduzione distingue una parte integrata da una dedicata e niente di più fine. Il pannello dice che il valore è dedotto.
- Mai sotto 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 quando non è riportato).
