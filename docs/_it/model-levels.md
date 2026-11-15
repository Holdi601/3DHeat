---
title: "Livelli 3D"
parent: "Livelli e geometria di sfondo"
nav_order: 2
lang: "it"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: false
---

# Livelli 3D

Un livello 3D è un modello del luogo – colline, strade, edifici – in cui stanno i tuoi dati. Permette di vedere su quale piano, collina o tetto si trova il calore. Il visualizzatore lo divide in terreno (pieno), strutture (trasparenti, così puoi guardare dentro) e acqua.

## Caricare un livello 3D {#load-a-3d-level}

1. Carica prima i tuoi dati ([Caricare i dati](getting-data-in.md)). Il modello deve usare lo stesso spazio del mondo e la stessa unità dei dati, con Y in alto.
2. In **Sfondo / livello**, scegli un **Obiettivo di semplificazione**. Lascialo su *Completo — nessuna semplificazione*, a meno che il modello non sia enorme.
3. Premi **Modello 3D…** e scegli un file `.glb`, `.gltf`, `.obj`, `.stl` o `.ply`.
4. Attendi la riga di avanzamento. **Annulla** la ferma.
5. Premi **F** nella vista. Il terreno è pieno, le strutture sono gusci trasparenti, l’acqua è piatta.
6. Regola l’aspetto in [Aspetto del livello](level-appearance.md). Premi **Salva nella libreria** per conservare il risultato ([Libreria dei livelli](level-library.md)).

![Un livello 3D caricato: terreno opaco con curve di livello, edifici trasparenti, acqua piatta](../assets/img/en/model-levels-loaded.webp)

**Modello 3D…** carica la mesh del livello. Viene analizzata, classificata e semplificata in un worker in background ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) con una riga di avanzamento e **Annulla**: *Lettura del modello*, *Analisi di <file>*, *Impacchettamento di N texture*, *Classificazione di N parti*, *Semplificazione del terreno (N triangoli)*, *Semplificazione delle strutture (N triangoli)*, *Creazione del wireframe*.

## Formati {#formats}

| Formato | Cosa viene letto | Limiti |
|---|---|---|
| `.glb` | Ogni primitiva di mesh con `mode` 4 (triangoli) o senza mode, con applicata la trasformazione nel mondo di ogni nodo; `POSITION`; `COLOR_0` (vec3 o vec4) come colore del vertice; la `baseColorTexture` del materiale e il suo `TEXCOORD_n` come texture; i nomi di nodo e di mesh come nomi di parte. | Linee e punti vengono saltati. |
| `.gltf` | Lo stesso. | Solo con buffer incorporati: un glTF che fa riferimento a un `.bin` esterno viene rifiutato con *Esporta come singolo .glb così la geometria viene incorporata.* |
| `.obj` | Facce, con i blocchi `o` e `g` come parti. | Solo geometria (nessun materiale). |
| `.stl` | Binario e ASCII (`solid …`). | Una parte. |
| `.ply` | Solo ASCII. | Il PLY binario viene rifiutato con *Converti in .glb o in .stl binario.* |

Solo geometria: posizioni, normali e triangoli saldati in un unico buffer, più colori e coordinate di texture dove ci sono ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Un modello senza triangoli viene rifiutato. Il modello deve essere nello stesso spazio del mondo e nella stessa unità dei dati (Y in alto): niente viene trasformato per adattarsi.

## Terreno, strutture e acqua {#ground-structures-and-water}

Un livello viene diviso in tre classi all’importazione, perché richiedono trattamenti opposti ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Terra** – disegnata opaca e ombreggiata con indizi di rilievo (pendenza, curve di livello, una rampa di quota) così che la posizione si possa leggere rispetto ad essa.
- **Strutture** – edifici ed elementi di scena stanno tra la telecamera e il calore al loro interno, quindi sono disegnati come un **guscio trasparente** (facce tenui con un bordo luminoso, più spigoli senza duplicati) – oppure, quando hanno texture, pieni nelle loro texture.
- **Acqua** – piatta, senza indizi del terreno: una curva di livello attraverso un lago non ha senso.

Ogni parte (nodo glTF, oggetto OBJ o gruppo) è classificata da sola, dalla prima regola che si applica:

1. **L’etichetta dell’esportatore.** Un nome che inizia con `ground:`, `structure:` o `water:` (o con `|` al posto di `:`) viene preso alla lettera. Gli esportatori del progetto etichettano ogni parte così.
2. **Nomi d’acqua.** `water` come parola (non *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Nomi di terreno.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Nomi di struttura.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Una parte che copre più del 25% dell’area X-Z della mappa con più del 60% dell’area dei suoi triangoli rivolta verso l’alto è terreno. Una parte con meno del 45% rivolto verso l’alto, o più alta del 15% dell’altezza del livello pur coprendo meno del 10% dell’area, è una struttura. La quota rivolta verso l’alto è pesata per area, così una casa non viene detta piatta per avere un tetto.
6. **Altrimenti terreno** – una parte ambigua è terreno per impostazione predefinita, perché un guscio predefinito quasi invisibile farebbe sembrare il livello un errore di resa.

Un modello che è una sola parte classificata come struttura diventa invece terreno (*singola mesh senza nome — trattata come terreno*).

### Mesh di navigazione {#navigation-meshes}

Una parte chiamata `nav:…` (per esempio `nav:walkable` di un esportatore di livelli) è una mesh di navigazione: dove un soldato può stare in piedi. È elencata come terreno (*mesh di navigazione — non disegnata perché giace sul terreno; i clic la trovano comunque*) ma **non disegnata**. Sta sopra il terreno da cui è stata generata, complanare con esso entro pochi centimetri, e disegnata come terreno le due superfici si contendevano ogni pixel: su un livello con una texture del terreno incorporata, tutta l’area giocabile appariva come macchie grigie e beige a bordi netti, una per triangolo di navigazione. Viene conservata, non semplificata, così che [il clic per scegliere](camera.md#click-to-pick) possa dire se un punto è percorribile. Le voci della libreria non la conservano.

**Mostra la classificazione delle parti (N)** nel pannello (mostrato per i modelli con più di una parte) elenca ogni parte con la sua classe e il motivo – *etichettato dall’esportatore*, *il nome corrisponde a …*, *copre il X% della mappa, Y% rivolto verso l’alto*, *Y% rivolto verso l’alto, Z% dell’altezza del livello*, *ambiguo — terreno per impostazione predefinita*. Per cambiarne una, rinomina la parte nel modello sorgente e reimporta – la suddivisione è incorporata negli index buffer.


## Semplificazione {#simplification}

**Obiettivo di semplificazione** imposta il budget dei triangoli per la prossima importazione ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Impostazione | Triangoli |
|---|---|
| *Completo — nessuna semplificazione* (predefinita) | tutti |
| *Alto — 8 milioni di triangoli* | 8.000.000 |
| *Medio — 3 milioni di triangoli* | 3.000.000 |
| *Basso — 800.000 triangoli* | 800.000 |
| *Sagoma — 100.000 triangoli* | 100.000 |

Il budget è diviso **60% alle strutture e 40% al terreno**, semplificati separatamente – le strutture perdono prima la forma sotto la decimazione. L’acqua non è semplificata. La semplificazione è un collasso di spigoli con metriche di errore quadriche ([meshoptimizer](https://github.com/zeux/meshoptimizer), tramite WebAssembly), dopo aver saldato i vertici coincidenti, così sagome e spigoli vivi sopravvivono. La nota di importazione riporta `sorgente → triangoli ora, deviazione X%`, la suddivisione terreno / strutture / acqua tra le parti, e – quando è stato usato *Completo* su un modello sopra gli 8 milioni di triangoli – suggerisce *Alto* (fino a 30 milioni) o *Medio* (oltre). Senza WebAssembly il semplificatore non è disponibile e l’importazione lo dice.

I livelli degli esportatori del progetto hanno già un budget; l’obiettivo esiste per l’arte grezza che non ha un budget alle spalle.

## Texture {#textures}

Un `.glb` le cui parti portano texture del colore di base viene disegnato con esse – un’esportazione di un circuito da corsa, per esempio, ne porta una per ogni tessera di terreno e una per ogni modello posizionato.

La texture del terreno è mostrata di default quando presente; le strutture che portano texture partono **piene, con le loro texture** (cordoli, guardrail, muri di pneumatici e cartelli sono i bordi di una strada, non edifici da guardare dentro), con il wireframe spento e l’ombreggiatura piatta spenta. Vedi [Aspetto del livello](level-appearance.md).

## Livelli grandi {#large-levels}

- Oltre **300.000** triangoli di struttura, gli spigoli delle strutture partono spenti e l’opacità delle facce al 35%: con uno spigolo in ogni pixel il quartiere si legge come bianco piatto.
- Il piano lontano della telecamera si allarga per contenere il livello ([Livelli](levels.md#what-a-level-does-for-the-heat)).

## Per gli sviluppatori {#for-developers}

### Atlante delle texture {#texture-atlas}

Ogni texture è impacchettata in **un solo atlante** nel worker di importazione ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), così il livello resta un solo disegno, un solo campionatore e un solo attributo di coordinate di texture su entrambi i backend:

- impacchettato a scaffali alla dimensione propria di ogni immagine, ridotto solo se l’insieme non entrerebbe in **8192 px** in nessuna direzione (il limite predefinito di WebGPU per le texture);
- un **margine di 16 pixel** attorno a ogni immagine, e solo i 5 livelli mip che quel margine protegge, così un cartello lontano non campiona la texture del vicino;
- le **texture ripetute** restano ripetute. Un’immagine il cui campionatore glTF ripete (il predefinito di glTF) e le cui coordinate di texture escono da 0..1 – un muro di mattoni il cui UV va da 0 a 40 lungo di esso – diventa una *tessera*: i suoi vertici mantengono le proprie coordinate e un numero di tessera a 16 bit, e gli shader riportano la coordinata nel rettangolo della tessera pixel per pixel, prendendo il livello mip dalla coordinata non riportata così le giunture non si vedono. Il margine di una tessera contiene il proprio bordo opposto. Un asse il cui campionatore blocca viene bloccato; un’immagine le cui coordinate restano in 0..1 viene disegnata come prima. Un livello con tessere costa 4 byte in più per vertice.

### Il contratto con l’esportatore {#the-exporter-contract}

Ciò di cui il visualizzatore ha bisogno da un livello, qualunque cosa l’abbia prodotto:

- un solo `.glb` autosufficiente;
- `POSITION` in float32, primitive di triangoli;
- nomi di nodo `ground:*`, `structure:*` e `water:*` (il resto è classificato dalle regole sopra), e `nav:*` per una mesh di navigazione, che è conservata ma non disegnata;
- coordinate nello spazio del mondo, **Y in alto**, nella stessa unità della telemetria, così i dati stanno sul livello senza alcun passo di posizionamento.
