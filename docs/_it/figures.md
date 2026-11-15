---
title: "Figure"
parent: "Replay"
nav_order: 3
has_children: true
lang: "it"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figure

Una **figura** è un piccolo modello 3D di ciò che un'unità è davvero: un carro, un jet, una nave, un soldato. Il [replay](match-replay.md) disegna ogni unità come la sua figura in dimensione reale, invece di un semplice cubo.

Ci sono circa 2.000 veicoli, aerei, navi, armi e soldati con nome, tutti costruiti dal visualizzatore stesso.

![Carri del dataset demo disegnati con le proprie figure](../assets/img/it/replay-tanks.webp)

## Cosa c'è nel catalogo {#what-is-in-the-catalogue}

| Ambito | Esempi |
|---|---|
| Persone | soldato in piedi, accovacciato, a terra; cecchino, anticarro, medico, equipaggio |
| Terra | carri armati, veicoli da combattimento per la fanteria, difesa aerea, artiglieria, camion e auto, treni e tram |
| Aria | caccia, aerei d'attacco, bombardieri, trasporti, elicotteri, dai biplani ai jet moderni |
| Mare | navi da guerra per classe, portaerei, sottomarini, barche, mercantili |
| Armi | missili, razzi, bombe, siluri, flare e chaff |
| Marcatori | granate fumogene, flash e incendiarie, bombe piazzate, bandiere, punti di comparsa, punti di passaggio |

## Come sono fatte le figure {#how-the-figures-are-made}

- **Costruite da dimensioni pubbliche.** La maggior parte delle figure è creata dal costruttore di figure del visualizzatore a partire da numeri pubblici: lunghezza, larghezza, altezza, ruote, torretta e cannone, ali e coda. La loro forma viene poi regolata su fotografie pubbliche, disegni e dimensioni pubblicate. Non vengono usati i modelli di nessun gioco.
- **Modelli gratuiti.** Alcune figure usano modelli 3D gratuiti (CC0 o CC BY) dove sono più fedeli, a volte combinati con lo scafo costruito. Gli autori delle opere CC BY sono citati in [Crediti delle figure](figure-credits.md); le opere CC0 non richiedono credito e non sono elencate lì.
- Ogni figura ha una versione completa, una grossolana e una lontana (livelli di dettaglio, LOD), così se ne possono disegnare migliaia insieme.

## Quale figura riceve un'unità {#which-figure-a-unit-gets}

Il visualizzatore guarda le colonne proprie dei dati:

1. **Nomi** - le colonne chiamate *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* o *Figure* - vengono confrontate con il catalogo: esattamente, tramite circa 4.000 alias (id di unità di diversi giochi), per il più lungo inizio noto (`F-16C_50` è l'F-16C), oppure per il nome di figura più corto che inizia così.
2. Un nome la cui figura non corrisponde al **tipo** dell'unità non viene usato (un camion chiamato *Typhoon* non è il caccia).
3. **Tipi** - colonne chiamate *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* o *Domain* - danno una figura di classe: tag Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), icone delle mappe o parole semplici (tank, helicopter, infantry).
4. I dati senza nessuno dei due sono dati di persone: ognuno è un soldato.

Quindi il modo più semplice per avere le figure giuste è una colonna `vehicle` con i nomi reali, oppure una colonna `type` con i tag Tacview.

**La mia unità appare come un cubo o un soldato.** Aggiungi una colonna `vehicle` con il nome reale, oppure una colonna `type` con un tag Tacview. Passa il mouse sull'unità per vedere quale nome è stato trovato. I dati che hanno tali colonne ma non dicono nulla su un'unità lasciano un cubo; i dati senza nessuna delle due vengono disegnati come soldati.

## Impostazioni {#settings}

La sezione **Figure** della barra laterale del replay imposta la dimensione, la dimensione minima sullo schermo, cosa diventano le unità lontane (figura, freccia, simbolo) e gli effetti disegnati su di esse. Vedi [Replay della partita](match-replay.md#figures). Fumo, fuoco e altri effetti a tempo: [Figure nelle figure sovrapposte](figure-replay.md).

## Un pacchetto locale di figure opzionale {#an-optional-local-figure-pack}

Puoi tenere sulla tua macchina un pacchetto opzionale di figure tue. Le sue figure prendono il posto delle figure del catalogo con gli stessi nomi. Non fa mai parte del repository né di una build pubblicata; senza di esso non cambia nulla.
