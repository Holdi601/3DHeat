---
title: "Residenza della memoria GPU"
parent: "Dettagli del rendering"
nav_order: 5
lang: "it"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Residenza della memoria GPU

La scheda grafica ha solo una certa quantità di memoria. Se i tuoi dati non ci stanno, il visualizzatore mostra ciò che ci sta e lo dice: la sovrapposizione delle statistiche riceve una riga ambra **Non residente** con il numero delle righe lasciate fuori. Un dataset accorciato che sembra completo sarebbe l'errore peggiore che uno strumento di analisi possa fare, quindi questa riga non viene mai nascosta.

![La sovrapposizione delle statistiche con la riga ambra Non residente](../assets/img/en/gpu-memory-not-resident.webp)

Per farne entrare di più, alza il budget GPU in **Budget delle risorse** e carica di nuovo ([Memoria e budget](memory-and-budgets.md#raising-the-gpu-budget)), restringi prima i dati, oppure usa una scheda con più memoria.

## Per gli sviluppatori {#for-developers}

### Come le righe sono memorizzate sulla GPU {#how-rows-are-stored-on-the-gpu}

Le righe vengono caricate una volta sola, quando arriva un dataset, a **blocchi** di 8.388.608 righe (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Ogni blocco viene quantizzato rispetto al proprio riquadro di delimitazione e al proprio intervallo di tempo:

| Dati | Formato | Byte per riga |
|---|---|---|
| Posizione X, Y, Z e l'id del gruppo | quattro interi senza segno a 16 bit (RGBA16UI su WebGL2); X, Y, Z dentro il riquadro di delimitazione del blocco | 8 |
| Tempo e durata (quando il dataset ha sia tempo sia persona) | due interi senza segno a 16 bit (RG16UI): tempo dentro l'intervallo di tempo del blocco; durata, dove 65.535 significa "nessun campione successivo" | 4 |

Sono i riquadri di delimitazione per blocco a rendere sufficienti 16 bit: un blocco di solito copre una frazione della mappa, quindi il passo di quantizzazione resta ben sotto un centimetro su una mappa larga chilometri, molto al di sotto del rumore dei dati di telemetria reali. L'id del gruppo nel quarto canale è gratuito - ed è il motivo per cui i gruppi possono essere al massimo 4.096 ([Gruppi](sessions-persons-groups.md#limits)).

Su WebGL2 ogni blocco è una texture larga 8.192 texel, riempita fino a righe di texture intere; le righe vengono raggiunte da `gl_VertexID` tramite una texture di indici di blocco per fotogramma. Su WebGPU sono buffer di archiviazione.

Ulteriore memoria GPU per riga, allocata quando serve:

- ogni [filtro](filters.md) di colonna attivo: 4 byte per riga (valori in virgola mobile a 32 bit o id di categoria), caricato per blocco la prima volta che il filtro viene usato;
- [mappa di calore delle linee](line-heat.md): 8 byte per riga (inizio di ogni segmento, quantizzato dentro il riquadro di delimitazione dei dati, e i suoi flag) mentre la modalità Linee è attiva.

Più i target di rendering: colore e profondità della scena, il target del calore e il suo gemello di lavoro (quattro canali in [Calore per squadra](team-heat.md)), e gli strati di depth peeling per l'[occlusione](depth-and-culling.md); e la geometria del livello.

### Il budget è imposto al caricamento {#the-budget-is-enforced-at-upload}

WebGL accetta allocazioni che non può soddisfare, e poi o perde il contesto o ripiega sulla memoria di sistema a un costo disastroso; quindi il budget GPU viene imposto quando il dataset viene caricato ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- i blocchi vengono caricati in ordine (cioè in ordine temporale) finché ci stanno;
- il primo blocco che non ci sta viene caricato **in parte** - tante righe di texture intere quante ne contiene il budget rimanente - invece di non essere caricato affatto, così un budget che non può contenere un blocco intero mostra comunque quanto può; e poiché le righe sono in ordine temporale, la parte mostrata è un tratto di tempo coerente;
- tutto ciò che segue è **non residente**.

Il mancato caricamento non viene nascosto: la sovrapposizione delle statistiche mostra una riga **Non residente** in ambra con il numero delle righe che non sono entrate, ogni volta che è maggiore di zero. Un dataset troncato che sembra completo è il peggior errore che uno strumento di analisi possa avere. La [verifica di capienza](memory-and-budgets.md#the-fit-check) prima del caricamento serve a evitare questo caso.

Il budget usato dal renderer è il budget GPU di **Budget delle risorse**, lo stesso valore usato dalla verifica di capienza - anche sopra il valore rilevato, fino al limite massimo del cursore (vedi [Alzare il budget GPU](memory-and-budgets.md#raising-the-gpu-budget)). Viene applicato quando un dataset viene caricato; cambiarlo dopo ha effetto dal caricamento successivo.
