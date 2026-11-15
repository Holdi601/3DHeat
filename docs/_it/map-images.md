---
title: "Immagini delle mappe"
parent: "Livelli e geometria di sfondo"
nav_order: 1
lang: "it"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Immagini delle mappe

Un'immagine della mappa è una figura piatta - una minimappa, una foto satellitare, una pianta - stesa sotto i tuoi dati così puoi vedere dove si trova il calore. Dici al visualizzatore dove deve stare l'immagine fissando due punti su di essa a due luoghi del mondo (le "ancore").

## Caricare e collocare un'immagine della mappa {#load-and-place-a-map-image}

1. Carica prima i tuoi dati ([Caricare i dati](getting-data-in.md)).
2. In **Sfondo / livello** premi **Immagine della mappa…** e scegli l'immagine. Viene tesa sull'area dei dati.
3. Premi **Adatta ai limiti dei dati** se l'immagine è stata spostata. L'ancora 1 va sull'angolo in alto a sinistra dell'immagine, l'ancora 2 sull'angolo in basso a destra, ai bordi dei dati.
4. Se il calore non combacia con l'immagine, scegli due punti di riferimento lontani tra loro (per esempio due angoli opposti di un edificio o due incroci). Leggi il pixel di ciascuno sull'immagine e la sua posizione nel mondo (passa il mouse con il [righello](measure.md) per leggere **X** e **Z**).
5. Digitali in **Posizionamento**: per **Ancora 1** il **px**, il **py**, la **X mondo**, la **Z mondo** del punto di riferimento; lo stesso per **Ancora 2**.
6. Controlla: una traccia o un punto caldo che sai trovarsi su una strada dovrebbe ora stare su quella strada. Regola i numeri finché non succede.

![La sezione Posizionamento con due ancore e il calore disegnato su un'immagine di mappa](../assets/img/en/map-images-placement.webp)

I due punti di riferimento devono differire sia nelle colonne sia nelle righe di pixel, altrimenti il pannello dice *Le due ancore condividono una riga o una colonna di pixel*.

## Caricamento {#loading}

Qualsiasi formato immagine che il browser sa decodificare. Un'immagine il cui lato più lungo supera gli **8192 px** viene ridotta a 8192 (il lato più grande che la GPU deve contenere), e il pannello dice *Ridotta da L×A a l×a*.

Al caricamento l'immagine viene tesa sui limiti X-Z del dataset (oppure ±1000 unità senza dataset), con il nord in alto, alla Y più bassa del dataset. I predefiniti sono **Opacità** 100%, **Luminosità** 0,7, **Desatura** 100%, **Inverti nord/sud** attivo: desaturata e attenuata, perché il compito dello sfondo è far localizzare un punto caldo, non competere con esso.

## Comandi {#controls}

| Comando | Predefinito | Intervallo | Significato |
|---|---|---|---|
| **Opacità** | 100% | 0-100% | |
| **Luminosità** | 0,7 | 0-2 (rotella 64) | |
| **Desatura** | 100% | 0-100% | Sfondo grigio, calore saturo. Il colore della mappa compete con il colore dei dati. |
| **Inverti nord/sud** | attivo | | Quale riga dell'immagine è la Z massima del mondo. Cambiarlo con un dataset caricato riadatta anche le ancore ai limiti dei dati. |
| **Posizionamento**: Ancora 1, Ancora 2 | gli angoli dell'immagine sui limiti dei dati | | Ogni ancora è un pixel dell'immagine - **px** (da sinistra, da 0 alla larghezza) e **py** (dall'alto, da 0 all'altezza) - e la coordinata del mondo su cui si trova, **X mondo** e **Z mondo**. Scala e spostamento derivano dalla coppia. |
| **Adatta ai limiti dei dati** | | | Mette l'ancora 1 sull'angolo in alto a sinistra dell'immagine e l'ancora 2 su quello in basso a destra, sui limiti X-Z dei dati. Un punto di partenza per il posizionamento esatto. Richiede un dataset. |
| **Altitudine** | la Y più bassa del dataset | Y minima dei dati - 500 fino a Y massima + 500 (rotella Y massima + 100.000) | Altezza del piano della mappa. Mettilo appena sotto i dati così nulla viene nascosto da esso. |

La riga del nome mostra `larghezza×altezza px · x × z m/px`, cioè la dimensione nel mondo di un pixel su ciascun asse.

## Nella scena {#in-the-scene}

L'immagine è un unico quadrilatero con texture all'altezza dell'altitudine. A opacità piena scrive la profondità, quindi partecipa all'[occlusione](depth-and-culling.md) come terreno; sotto il 100% di opacità viene miscelata e non scrive la profondità, quindi non occlude nulla. Il [righello](measure.md) misura sul suo piano. La [libreria dei livelli](level-library.md) memorizza un livello immagine con le sue ancore.

## Mappa di Dota 2 {#dota-2-map}

**Mappa di Dota 2** accanto a **Immagine della mappa…** scarica il disegno della mappa attuale di Dota 2 che [OpenDota](https://www.opendota.com) mostra nelle sue pagine delle partite, e lo colloca sotto le tabelle che il [Watcher](https://github.com/Holdi601/3DHeat-Watcher) scrive dai replay di Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). L'immagine viene scaricata da opendota.com quando si preme il pulsante e non fa parte di 3DHeat; il disegno della patch più recente viene preso dalla lista di OpenDota, e quello della 7.40 quando la lista non si può leggere.

| | |
|---|---|
| Fonte | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Collocazione | La calibrazione di OpenDota: l'immagine copre le unità del mondo di Dota da -8192 a 8064 su entrambi gli assi (celle da 128 unità, dalla 64 alla 191), il nord in alto. Con gli assi della tabella del replay (Z in alto, Y invertita) sono X mondo da -8192 a 8064 e Z mondo da -8064 a 8192. Circa 18 unità a pixel. |
| Altitudine | 0. Gli eroi stanno da 0 a circa 600. |
| Aspetto | Luminosità 0,8, desatura 50%. |

Verificato sul replay di una partita pubblica della patch 7.40: il tracciato di ogni eroe segue le corsie disegnate, e le torri, le caserme e gli ancient che il replay colloca cadono sulle basi disegnate. La vista **Sopra** mostra la mappa con il nord in basso sullo schermo, come fa con qualsiasi tabella con Z in alto e Y invertita.

Il disegno è di OpenDota, della mappa di Valve; Valve non approva 3DHeat.

### La mappa 3D {#the-3d-map}

Con Dota 2 installato, il comando [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) del Watcher (`python -m heat3d_watch dota-map -o dota.glb`) crea la mappa in 3D dai file del gioco stesso: terreno, scogliere, acqua, alberi ed edifici, nelle unità e negli assi delle tabelle dei replay. Carica il file una volta con **Modello 3D…**: il visualizzatore lo riconosce dalle sue parti (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` in `dotaMap.ts`), lo mette subito nella [libreria dei livelli](level-library.md), sostituendone uno più vecchio, e lo segnala. Da allora **Mappa di Dota 2** carica quella mappa 3D dalla libreria invece di scaricare il disegno; se nella libreria non ce n'è nessuna, scarica il disegno e spiega come creare la mappa 3D. Il file viene dalla tua installazione e resta sul tuo computer.

## Per gli sviluppatori {#for-developers}

### Come le ancore collocano l'immagine {#how-the-anchors-place-the-image}

Da [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), con le ancore *a* e *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Due ancore fissano scala e spostamento su ciascun asse in modo indipendente, quindi una mappa può essere tesa in modo diverso su X e Z ma non ruotata. Le ancore devono differire in **entrambe** le coordinate di pixel; quando condividono una riga o una colonna non si può ricavare nessuna scala, la mappa non viene disegnata, e il pannello dice *Le due ancore condividono una riga o una colonna di pixel*.
