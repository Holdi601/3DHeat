---
title: "Residència de la memòria de la GPU"
parent: "Detalls interns del renderitzat"
nav_order: 5
lang: "ca"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---

# Permanència de memòria de la GPU

La targeta gràfica només té una certa quantitat de memòria. Si les teves dades no hi caben, el visor mostra el que hi cap i ho diu: la capa d'estadístiques rep una línia ambre **No resident** amb el nombre de files que s'han deixat fora. Un conjunt de dades retallat que semblava complet seria l'error més greu que pot cometre una eina d'anàlisi, així que aquesta línia mai no s'amaga.

![La capa d'estadístiques amb la línia ambre No resident](../assets/img/en/gpu-memory-not-resident.webp)

Per cabre'n més, puja el pressupost de la GPU a **Pressupostos de recursos** i carrega de nou ([Memòria i pressupostos](memory-and-budgets.md#raising-the-gpu-budget)), estreny primer les dades, o usa una targeta amb més memòria.

## Per als desenvolupadors {#for-developers}

### Com s'emmagatzemen les files a la GPU {#how-rows-are-stored-on-the-gpu}

Les files es pugen una sola vegada, quan arriba un conjunt de dades, en **blocs** de 8.388.608 files (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Cada bloc es quantitza contra la seva pròpia caixa contenidora i el seu interval de temps:

| Dades | Format | Bytes per fila |
|---|---|---|
| Posició X, Y, Z i l'id de grup | quatre enters sense signe de 16 bits (RGBA16UI a WebGL2); X, Y, Z dins la caixa contenidora del bloc | 8 |
| Temps i durada de vida (quan el conjunt de dades té temps i persona) | dos enters sense signe de 16 bits (RG16UI): temps dins l'interval de temps del bloc; durada de vida amb 65.535 volent dir «no hi ha cap mostra següent» | 4 |

Les caixes contenidores per bloc són el que fa que 16 bits siguin suficients: un bloc sol cobrir una fracció del mapa, de manera que el pas de quantització queda molt per sota d'un centímetre en un mapa de kilòmetres d'ample, molt per sota del soroll de la telemetria real. L'id de grup que va al quart canal és gratuït, i per això hi pot haver com a màxim 4.096 grups ([Grups](sessions-persons-groups.md#limits)).

A WebGL2 cada bloc és una textura de 8.192 texels d'amplada, emplenada fins a files de textura senceres; s'arriba a les files des de `gl_VertexID` a través d'una textura d'índexs de bloc per fotograma. A WebGPU són buffers d'emmagatzematge.

Memòria de GPU addicional per fila, assignada quan s'usa:

- cada [filtre](filters.md) de columna activa: 4 bytes per fila (valors de coma flotant de 32 bits o ids de categoria), pujat per bloc la primera vegada que s'usa el filtre;
- [calor de línia](line-heat.md): 8 bytes per fila (l'inici de cada segment, quantitzat dins la caixa contenidora de les dades, i els seus indicadors) mentre el mode Línies està activat.

A més, els objectius de renderitzat: el color i la profunditat de l'escena, l'objectiu de calor i el seu doble de treball (quatre canals a [Calor per equips](team-heat.md)), i les capes de *depth-peeling* per a l'[oclusió](depth-and-culling.md); i la geometria del nivell.

### El pressupost s'aplica en pujar {#the-budget-is-enforced-at-upload}

WebGL accepta assignacions que no pot atendre i després o perd el context o recorre a la memòria del sistema amb un cost ruïnós, així que el pressupost de la GPU s'aplica quan es puja el conjunt de dades ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- els blocs es pugen en ordre (és a dir, en ordre de temps) mentre hi caben;
- el primer bloc que no hi cap es puja **parcialment** —tantes files de textura senceres com hi caben al pressupost restant— en lloc de no pujar-se gens, de manera que un pressupost que no pot contenir un bloc sencer encara mostra tot el que pot; i com que les files estan ordenades per temps, la part mostrada és un tram coherent de temps;
- tot el que ve després és **no resident**.

La manca no s'amaga: la capa d'estadístiques mostra una línia **No resident** amb el nombre de files que no hi van cabre, en ambre, cada vegada que és superior a zero. Un conjunt de dades truncat que sembla complet és la pitjor fallada que pot tenir una eina d'anàlisi. La [comprovació de cabuda](memory-and-budgets.md#the-fit-check) abans de carregar serveix per evitar aquest cas.

El pressupost que usa el renderitzador és el de la GPU de **Pressupostos de recursos**, la mateixa xifra que usa la comprovació de cabuda: per sobre de la xifra detectada també, fins al sostre del control lliscant (vegeu [Pujar el pressupost de la GPU](memory-and-budgets.md#raising-the-gpu-budget)). S'aplica quan es puja un conjunt de dades; canviar-lo després té efecte a la següent càrrega.
