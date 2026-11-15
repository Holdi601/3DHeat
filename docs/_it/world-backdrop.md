---
title: "Sfondo del mondo"
parent: "Livelli e geometria di sfondo"
nav_order: 5
has_children: true
lang: "it"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Sfondo del mondo

Uno sfondo del mondo mette il terreno reale sotto una registrazione di volo: colline, strade,
fiumi, aeroporti ed edifici, scaricati da dati aperti di mappe gratuiti. Usalo quando una
registrazione Tacview altrimenti fluttuerebbe su una griglia vuota. È un [livello](glossary.md), quindi
il calore e le figure poggiano su di esso.

## Costruirne uno {#build-one}

1. Carica una registrazione di volo che dica dove si trova sulla Terra (un file Tacview `.acmi`), oppure
   non caricare nulla e scegli un teatro al passo 3. Vedi [Come portare i dati](getting-data-in.md).
2. Apri **Sfondo / livello** nella barra laterale.
3. Premi **Sfondo del mondo reale** per costruire il terreno sotto i tuoi dati. Oppure scegli un mappa di
   gioco in **Teatro** e premi **Costruisci lo sfondo del teatro** (o **Teatro in streaming**).
4. Attendi. Il pannello mostra l'avanzamento (*Tessere di quota*, *Tessere di mappa*, *Costruzione dello
   sfondo*); **Annulla** lo ferma.
5. Vola intorno. La riga con i crediti della mappa è scritta in basso a destra della vista.

La prima costruzione scarica qualche decina di megabyte. Il browser le conserva, quindi una seconda
costruzione della stessa zona non scarica nulla. **Dimentica le tessere** le cancella. Il pulsante
**Sfondo del mondo reale** compare solo quando i dati caricati hanno un riferimento geografico (sotto).

Tutto viene costruito in un worker in background ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)).
Il risultato sostituisce il livello attuale e si comporta come un qualunque [livello 3D](model-levels.md): nasconde
il calore dietro di esso, viene tagliato dalla sezione, ha i [controlli dell'aspetto](level-appearance.md), e può
essere salvato nella [libreria](level-library.md).

## Dove sono i dati: il riferimento geografico {#where-the-data-is-the-geographic-reference}

Un insieme di dati ottiene un riferimento geografico solo da una fonte che lo dichiara:

- **Una registrazione ACMI**: i suoi `ReferenceLatitude` e `ReferenceLongitude` nell'intestazione, e le posizioni
  che il lettore proietta sul piano tangente all'ellissoide WGS84 in quel punto (X est, Y nord, in metri; le
  altezze sono l'altitudine della registrazione sul livello del mare). Il riferimento viene mantenuto quando la
  mappatura usa **X** e **Y** come assi del suolo - come suggeriscono gli indizi della registrazione - e viene
  scartato quando il suolo viene da un'altra colonna, come la **U** e la **V** piatte di un gioco.
- **Una tabella Parquet i cui indizi `heat3d` contengono una voce `geo`** - le tabelle DCS, MSFS, X-Plane e IL-2
  (Tacview) del [Watcher](https://github.com/Holdi601/3DHeat-Watcher). La voce è descritta in
  [Per sviluppatori](#for-developers).

Un caricamento di più file mantiene il riferimento solo quando tutti ne condividono lo stesso. Ogni altro
caricatore non è toccato e non ne porta alcuno.

Lo sfondo viene proiettato allo stesso modo e poi passato attraverso la mappatura degli assi del caricamento,
così finisce sotto i dati qualunque inversione o scala applichi la mappatura.

## Teatri {#theatres}

Il selettore **Teatro** elenca le mappe reali di DCS World (Caucaso, Nevada, Normandia 2, La Manica, Siria, Golfo
Persico, Marianne, Marianne WWII, Atlantico meridionale, Sinai, Afghanistan, Kola, Germania Guerra Fredda, Iraq) e
di IL-2 Great Battles (Stalingrado, Mosca, Kuban, Rheinland, Normandia, Prokhorovka, Velikie Luki, Arras, Odessa,
Golfo di Finlandia / Leningrado, Corea), ciascuna con il proprio riquadro sulla Terra
([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). I riquadri DCS sono
le estensioni degli editor calcolate dalle proiezioni pubblicate; i riquadri IL-2, e quelli DCS così indicati, sono
stime dalle dimensioni pubblicate delle mappe e dai paesi ai loro bordi - il pannello dice quali.

**Costruisci lo sfondo del teatro** costruisce due livelli di dettaglio in un'unica mesh:

| Livello | Area | Terreno | Mappa |
|---|---|---|---|
| Teatro | l'intero riquadro | lo zoom più profondo fino a 10 che richiede al massimo 64 tessere di quota (circa 3 km per vertice sul Caucaso, 1 km sulla Normandia) | il mare, i laghi, la copertura del suolo e le autostrade da al massimo 64 tessere vettoriali a zoom da 4 a 9 |
| Area di dettaglio | **Sotto i dati**, **Attorno a un punto** (latitudine, longitudine, da 12 a 400 km), oppure nessuna | fino allo zoom 12 in al massimo 100 tessere, al massimo 500.000 vertici | tutto quanto sotto, da al massimo 1.500 tessere vettoriali al livello più profondo fino a 14 che ci sta |

L'area di dettaglio scava un foro nella griglia del teatro, allargato a celle intere perché le due griglie
condividano le linee di bordo, e una parete sottile chiude la cucitura dove campionano le altezze in modo diverso.

Con dei dati caricati il teatro viene costruito sul piano dei dati, quindi atterra sotto di essi com'è costruito.
Senza dati viene costruito attorno al punto di riferimento del teatro (gradi interi vicino alla sua area di dettaglio).
Dati caricati dopo su un altro riferimento - un file ACMI ne dichiara uno proprio - spostano lo sfondo sotto di essi:
lo spostamento esatto tra le due proiezioni si calcola su una griglia 256 × 256 sopra lo sfondo, e si legge tra i nodi,
entro un metro o due su un intero teatro ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)).
Uno sfondo salvato nella libreria mantiene il suo posto e si sposta allo stesso modo quando viene caricato sotto altri dati.

### Trasmettere un teatro {#streaming-a-theatre}

**Teatro in streaming** mostra il teatro come fa un visualizzatore di mappe per simulatori di volo: il terreno arriva
come molte piccole tessere attorno alla camera, caricate mentre si vola e scartate quando sono fuori portata
([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Un quadtree di tessere Web Mercator.** Le radici a zoom 5 coprono 1.500 km attorno alla camera, così il terreno
  arriva oltre il riquadro del teatro fino all'orizzonte. Una tessera si divide nei suoi quattro figli mentre la camera
  è più vicina di 1,4 volte la sua larghezza, fino allo zoom 15 (circa 1 km per tessera, 15 m tra i vertici del terreno):
  il dettaglio cala con la distanza come cala sullo schermo.
- **Ogni tessera è una mesh propria**, costruita in un worker ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)):
  una griglia del terreno 65 × 65 con un bordo a lembo attorno (così i vicini a dettagli diversi non mostrano mai una
  crepa), copertura del suolo e mare dipinti sopra, strade, ferrovie, laghi, fiumi, aeroporti, piste rilevate ed edifici
  in cima, e facoltativamente l'immagine satellitare del suo quadrato. Il renderer disegna le tessere con l'aspetto e le
  regole di profondità del livello, quindi nascondono il calore dietro di sé come qualunque livello.
- **Prima il grossolano.** Le tessere vengono richieste grossolane e vicine per prime, quattro download alla volta per
  sorgente; mentre i figli di una tessera si caricano, la tessera fa da sostituto per essi, così la vista si riempie subito
  e poi si affina.
- **Memoria**: le tessere costruite vengono tenute fino a 600 MB, eliminando per prime quelle disegnate meno di recente.
  **I download** restano nella cache delle tessere, limitata a un budget di 2 GB, eliminando per prime le più vecchie:
  volare di nuovo su una zona non costa nulla, e non c'è un limite per costruzione.
- **Salvato nella libreria** come ciò che viene trasmesso - il teatro, le sue opzioni e il suo posto sulla Terra - non come
  tessere: caricarlo ritrasmette, dalla cache delle tessere dove le tessere ci sono ancora. I clic e l'ispettore colpiscono
  le tessere come colpiscono un livello qualunque.
- Entrambi i renderer disegnano le tessere: verificato fianco a fianco su una vera GPU (WebGPU e WebGL2 sulla stessa scheda),
  anche con il calore nascosto dietro una cresta.
- Con dei dati caricati le tessere vengono costruite sul piano dei dati; dati caricati dopo su un altro piano ricostruiscono
  le tessere lì (dalla cache).
- Misurato su voli sintetici su tre punti (Normandia, Nevada, Siria): circa 63, 45 e 24 MB alla prima visita con immagini; una
  seconda visita non scarica nulla.

## Cosa viene costruito {#what-is-built}

| Parte | Fonte | Come |
|---|---|---|
| Immagini satellitari (teatri in streaming, facoltative) | EOX Sentinel-2 cloudless 2016 | **Immagini satellitari** stende sul terreno il mosaico 2016 senza nuvole (circa 10 m per pixel, zoom 14; le tessere più profonde lo ingrandiscono) al posto della copertura del suolo dipinta; strade, piste, edifici e nomi restano sopra. |
| Immagini più fini (Stati Uniti, Francia) | USGS National Map orthoimagery; IGN BD ORTHO | Con **Immagini satellitari** attivo, una tessera della mappa da zoom 13 che sta interamente negli Stati Uniti contigui o nella Francia metropolitana prende invece l'ortofoto nazionale, due zoom più in profondità della tessera (sedici delle sue tessere messe in un'unica immagine, circa 1-2 m per pixel da vicino). EOX ovunque altrove. |
| Terreno (teatri in streaming) | Mapterhorn | Copernicus GLO-30 ovunque (circa 19 m per pixel a zoom 12), scala del metro dove c'è il rilievo ufficiale di un paese (Francia, Stati Uniti e altri); letto due zoom più grossolano di ogni tessera. Gli AWS Terrain Tiles se Mapterhorn non è raggiungibile. |
| Terreno | AWS Terrain Tiles (PNG Terrarium) | Una griglia di altezze sul riquadro: lo zoom è il più profondo fino a 12 (circa 28 m per pixel a 43° N) che richiede al massimo 36 tessere, e la griglia è diradata fino a al massimo 400.000 vertici. Disegnato come terreno con i soliti segnali di rilievo. |
| Strade, ferrovie | Tessere vettoriali OpenFreeMap, livello `transportation` | Nastri piatti stesi sul terreno, resi più densi con la spaziatura del terreno e sollevati di qualche percento per non confliggere con esso. Larghezze per classe, da 16 m (autostrada) a 3 m (pista, ferrovia); mai più stretti della diagonale del riquadro / 5000. Sentieri, traghetti e gallerie sono esclusi. |
| Aeroporti | livello `aeroway` | Poligoni di pista, via di rullaggio, piazzale e eliporto stesi come terreno; linee di pista e via di rullaggio come nastri di 45 m e 18 m. |
| Acqua | livello `water` | Il mare piatto a 0 m, laghi e stagni piatti alla riva più bassa, fiumi stesi sul terreno. Disegnata come acqua: ombreggiatura piatta, senza curve di livello. |
| Copertura del suolo | livelli `landcover` e `landuse` | Dipinta sui vertici del terreno stesso, senza triangoli in più: boschi, prati e parchi verdi, campi color paglia, zone umide, sabbia, roccia, ghiaccio; aree residenziali, industriali, commerciali, militari e cave in toni smorzati. L'acqua è dipinta anche sotto la superficie dell'acqua, così la riva si legge da qualunque altezza. Il suolo nudo prende una lieve tinta d'altezza (grigio-verde di pianura, bruno d'altura, neve sopra i 3.000 m). Leggibile alla risoluzione del terreno: circa 30-45 m nell'area di dettaglio, chilometri nel teatro. |
| Nomi di luoghi | livelli `place` e `aerodrome_label` | Città, paesi e villaggi, e aeroporti con il loro codice ICAO, scritti sopra la vista; quanto ogni tipo si mostra cresce con l'altezza della camera, al massimo 70 alla volta. |
| Piste rilevate | [OurAirports](https://ourairports.com/data/) `runways.csv` (pubblico dominio) | Facoltativo (**Piste da OurAirports**, attivo di default): ogni pista aperta con entrambe le estremità nell'elenco, dalla soglia alla soglia alla sua larghezza indicata, con strisce laterali, linea centrale tratteggiata e barre di soglia. Un unico elenco da 4 MB, scaricato una volta e tenuto nella cache. |
| Edifici | livello `building` | Impronte estruse da `render_min_height` a `render_height` (6 m se manca) sopra il suolo più basso sotto di esse; le parti `hide_3d` sono saltate. Disegnati come strutture. |

Le tessere vettoriali si leggono a zoom 14 (l'unico zoom con gli edifici) quando il riquadro ne richiede al massimo
300, altrimenti allo zoom più profondo che ne richiede di meno, fino a 8. Un'area più grande riceve solo il terreno.

### Aspetto {#look}

Uno sfondo parte con **Mostra il colore acquisito** attivo - il colore è ciò che distingue una strada chiara dal suolo
grigio su cui giace, una pista scura dal suo piazzale - con i bordi dei triangoli del suolo disattivati, perché una griglia
regolare non dice nulla, curve di livello tenui, un mare opaco (un fondo sotto di esso combatterebbe la superficie per la
profondità da lontano), ed edifici grigio chiaro e quasi pieni, come li disegna una mappa. Il mare aperto non riceve affatto
triangoli del suolo. Tutto il resto è l'aspetto predefinito di un livello modello.

## Crediti sulla tela {#credits-on-the-canvas}

Mentre uno sfondo è il livello, i crediti delle sue fonti sono scritti in basso a destra della vista, senza bisogno di un clic,
così che le schermate e i video renderizzati li riportino:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Ogni parte collega alla pagina di attribuzione della sua fonte (openstreetmap.org/copyright e l'[elenco
di attribuzione](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) di Terrain Tiles). Uno sfondo salvato nella
libreria mantiene i suoi crediti e li mostra di nuovo quando viene caricato. Il testo è tradotto con il viewer; i nomi no.

## Fonti e loro condizioni {#sources-and-their-terms}

Ogni fonte, la sua licenza e come lo sfondo resta nei termini: [Sfondo del mondo: fonti e condizioni](world-backdrop-sources.md).

## La cache delle tessere {#the-tile-cache}

Ogni tessera, e il TileJSON delle tessere vettoriali, viene conservata nella Cache API del browser sotto
`3dheat-world-tiles-v1`, per URL. Una seconda costruzione della stessa zona non fa alcuna richiesta e funziona
offline: il TileJSON viene chiesto per primo e, quando fallisce, la sua copia in cache indica le tessere già presenti.
Le tessere che il server non ha (mare aperto, 404) sono ricordate come assenti.

Gli URL delle tessere vettoriali portano la data di build della mappa, quindi dopo che OpenFreeMap pubblica una nuova
build lo sfondo successivo scarica tessere fresche e quelle vecchie restano finché non vengono cancellate. La cache è
limitata a 2 GB: superato il limite, vengono eliminate per prime le tessere memorizzate da più tempo. **Dimentica le
tessere** cancella l'intera cache. La cache richiede un'origine sicura (`https://` o `localhost`); altrove ogni
costruzione scarica di nuovo.

## Confronto con Tacview {#compared-with-tacview}

Verificato a occhio su un punto per teatro, con registrazioni sintetiche: le corse di decollo cadono sulle linee centrali
delle piste disegnate, gli attraversamenti di costa cadono sulla costa. Il lato di Tacview viene dalla sua documentazione e
dalle sue schermate pubblicate (tacview.net, la sua pagina Steam), non dall'averlo fatto girare qui.

| | Tacview 1.9 | Questo sfondo, in streaming |
|---|---|---|
| Estensione | l'intero globo | 1.500 km attorno alla camera, ovunque essa sia |
| Terreno | ETOPO1 (circa 1,25 km) integrato; SRTM 25-75 m se l'utente installa i file; terreno DCS esportato da DCS | Copernicus GLO-30 (Mapterhorn), scala del metro in Francia e negli Stati Uniti |
| Immagini | nessuna integrata; texture che l'utente scarica (Mapview, SAS Planet, add-on come una carta VFR del Caucaso) | EOX Sentinel-2 cloudless 2016, circa 10 m, in streaming |
| Copertura del suolo | nessuna, salvo che in una texture | da OpenStreetMap, dipinta sul terreno (senza immagini) |
| Strade, ferrovie | nessuna, salvo che in una texture | ogni classe vicino alla camera, strade principali lontano |
| Edifici | nessuno | impronte estruse vicino alla camera |
| Aeroporti | etichette e piste come scatole piatte, senza segnaletica | piste dalle estremità rilevate con strisce laterali, linea centrale e barre di soglia; vie di rullaggio, piazzali; nomi con codici ICAO |
| Nomi di luoghi | alcune etichette di villaggi e città | città, paesi, villaggi, aeroporti, per distanza e altezza |

Dove resta indietro ancora:

- **Risoluzione delle immagini**: fuori dagli Stati Uniti e dalla Francia il mosaico satellitare di 10 m è morbido sotto circa
  2 km; Tacview con una texture zoom-17 installata dall'utente è più nitido lì.
- **Terreno nella forma propria di DCS**: Tacview può mostrare il terreno che DCS stesso esporta; qui è la vera Terra, che
  differisce dal terreno di DCS dove i modellatori della mappa lo hanno cambiato.
- **Curvatura**: il suolo è un piano piatto, quindi l'orizzonte non è quello di una Terra curva; Tacview disegna una sfera.
- **Velocità**: la prima visita a un punto scarica decine di megabyte prima di essere nitida; in un browser con rendering
  software (le schermate) disegna a qualche fotogramma al secondo con diverse centinaia di tessere.

## Limiti e cosa viene dopo {#limits-and-what-comes-later}

- **Risoluzione del terreno**: circa 30 m al meglio, e più grossolana nelle aree grandi. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/)
  (GeoTIFF ottimizzati per il cloud su AWS, senza chiave, un testo di credito fisso) è la fonte migliore: 30 m ovunque, GLO-90 dove
  GLO-30 ha lacune (Armenia e Azerbaigian, che DCS Caucaso copre). Serve un lettore GeoTIFF e non è ancora usata.
- **Terreno migliore**: Copernicus GLO-30 su AWS non invia intestazioni CORS, quindi un browser non può leggerlo; lo specchio di
  OpenTopography può essere letto (CORS e range), ma le sue condizioni per l'uso a runtime di un'app pubblica non sono note -
  da chiedere prima di qualunque uso. Mapterhorn contiene già GLO-30.
- **Curvatura**: il suolo è un piano piatto e le altezze non vengono abbassate per la curvatura della Terra, in linea con come
  vengono posizionate le registrazioni (altitudine come altezza); lontano dal riferimento entrambi si spostano insieme, di meno di
  una parte su mille a 100 km. Curvare solo le tessere le separerebbe dai dati lontano, quindi non è offerto. Un orizzonte curvo
  richiede la stessa discesa - distanza dalla camera al quadrato diviso per due volte il raggio della Terra - applicata in ogni passaggio
  che disegna una posizione (livello, tessere, calore, linee, scatole, etichette, selezione) come un'unica variabile uniforme condivisa;
  un vero globo richiede posizioni centrate sulla Terra anche per i dati e un rendering relativo alla camera. Entrambi sono pianificati
  con la modalità globo.
- **Solo il mondo di oggi**: le mappe storiche di DCS e IL-2 (Normandia 2, La Manica, Germania Guerra Fredda, ogni mappa IL-2) sono
  disegnate con le città, le strade e le coste attuali; il pannello lo dice. Gli aeroporti dell'epoca non vengono disegnati.
- **Nessuna modalità globo**: uno sfondo è un piano locale piatto. Una vista di tutta la Terra è pianificata.
- Le strade sono allargate nelle aree grandi perché restino visibili; da vicino sono più larghe del vero.
- I nomi dei teatri DCS nelle tabelle del Watcher sono abbinati come DCS li dà in `mission.theatre`; un nome non nell'elenco
  ricade sul primo punto arrotondato a gradi interi, e a sola latitudine e longitudine.

## Mappe storiche (non ancora costruite) {#historical-maps-not-built-yet}

Le mappe d'epoca potrebbero rivestire più avanti i teatri storici. Le serie dell'US Army Map Service (AMS) sono opere del governo
federale degli Stati Uniti, generalmente considerate di pubblico dominio (verificare la scheda di ogni scansione; molte sono ristampe
di originali britannici GSGS o tedeschi, il cui copyright della Corona o il termine per le opere anonime è anch'esso scaduto):

| Teatro | Serie | Dove è scansionata |
|---|---|---|
| IL-2 Stalingrado, Mosca, Kuban, Velikie Luki, Prokhorovka, Leningrado | AMS **N501**, Europa orientale 1:250.000 (compilata negli anni 1950 da mappe sovietiche e tedesche) | UT Austin PCL; alcuni fogli georeferenziati su UT GeoData |
| IL-2 Normandia, DCS Normandy 2 e La Manica | AMS **M661** / GSGS 4250, Francia 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 e **M841** 1:25.000 (Germania) | UT Austin PCL |
| IL-2 Corea | AMS **L751** 1:50.000 (edizioni 1951) e **L552** 1:250.000 | ANU Open Research (fogli L751, "copyright scaduto"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | mappe delle trincee britanniche della Prima guerra mondiale (non AMS) | McMaster University; National Library of Scotland (condizioni non commerciali) |

I fogli AMS portano le tacche di latitudine e longitudine agli angoli, quindi ognuno verrebbe posizionato con un adattamento su quattro
angoli e steso sul terreno come texture, costruito e tenuto localmente come le tessere.

## Per sviluppatori {#for-developers}

### La voce `geo` in una tabella Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` e `up` indicano le colonne che contengono i metri verso est e verso nord sullo stesso piano
tangente in (`lat0`, `lon0`) e l'altitudine. Il caricamento mantiene il riferimento quando la sua mappatura usa esattamente
quelle colonne (est come X, nord e altezza come Y e Z in un senso o nell'altro). La voce facoltativa `dcs` indica i metri
propri di una tabella DCS (x verso nord, y in alto, z verso est) e il suo teatro: un caricamento che mappa quelle colonne viene
invece posizionato attraverso la proiezione Mercatore trasversa del teatro ([coordinate DCS](#dcs-coordinates)). Una tabella
senza `geo` si legge come prima.

### Coordinate DCS {#dcs-coordinates}

Ogni teatro DCS è una proiezione Mercatore trasversa (WGS84, scala 0,9996) con il proprio meridiano centrale e la propria origine
falsa; la x di DCS è la coordinata nord e la z è quella est. Le costanti sono quelle che pubblica il progetto pydcs; la matematica
è la serie di Krüger al sesto ordine (Karney 2011), portata in [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts).
Uno sfondo per metri DCS viene costruito direttamente in esse, quindi una tabella DCS del Watcher mappata con
`dcs_x`/`dcs_y`/`dcs_z`, un livello scritto dal convertitore del terreno DCS e lo sfondo condividono un unico sistema. Le costanti
dell'Iraq non sono pubblicate; sono adattate a punti di riferimento pubblicati (4 cm di errore quadratico medio).

Le tabelle DCS del Watcher sono su un piano tangente nel punto di riferimento fisso del teatro (lo stesso punto che usa il selettore
dei teatri, più sotto), quindi più missioni dello stesso teatro si uniscono con il loro riferimento intatto e si allineano con uno
sfondo del teatro senza spostarlo.

### Semplificazione e budget {#simplification-and-budget}

- Gli edifici sotto i 20 m² sono scartati; 60 m² quando il riquadro è più largo di 30 km, 150 m² oltre 80 km. I restanti vengono
  aggiunti dal più grande fino a che gli edifici raggiungono 1,5 M di triangoli.
- Le strade minori, le strade di servizio e le piste sono scartate oltre 60 km di larghezza; oltre 150 km restano solo autostrade,
  strade principali, primarie e secondarie.
- L'intero sfondo resta sotto circa 3 M di triangoli. La nota di importazione dice quanti edifici sono stati lasciati fuori.
