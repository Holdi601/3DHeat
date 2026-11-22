---
title: "Nivells 3D"
parent: "Nivells i geometria de fons"
nav_order: 2
lang: "ca"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# Nivells 3D

Un nivell 3D és un model del lloc - turons, carrers, edificis - on hi ha les teves dades. Et permet veure en quin pis, turó o terrat és la calor. El visor el divideix en terra (sòlid), estructures (translúcides, perquè puguis mirar a dins) i aigua.

## Carregar un nivell 3D {#load-a-3d-level}

1. Carrega primer les teves dades ([Com entrar dades](getting-data-in.md)). El model ha d'usar el mateix espai del món i la mateixa unitat que les dades, Y amunt.
2. A **Fons / nivell**, tria un **Objectiu de simplificació**. Deixa-ho a *Complet - sense simplificació* tret que el model sigui enorme.
3. Prem **Model 3D…** i tria un fitxer `.glb`, `.gltf`, `.obj`, `.stl` o `.ply`.
4. Espera la línia de progrés. **Cancel·la** l'atura.
5. Prem **F** a la vista. El terra és sòlid, les estructures són closques translúcides, l'aigua és plana.
6. Ajusta l'aspecte a [Aparença del nivell](level-appearance.md). Prem **Desa a la biblioteca** per guardar el resultat ([Biblioteca de nivells](level-library.md)).

![Un nivell 3D carregat: terra opac amb línies de contorn, edificis translúcids, aigua plana](../assets/img/en/model-levels-loaded.webp)

**Model 3D…** carrega la malla del nivell. S'analitza, es classifica i es simplifica en un treballador de fons ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) amb una línia de progrés i **Cancel·la**: *Llegint el model*, *Analitzant el fitxer*, *Empaquetant N textures*, *Classificant N peces*, *Simplificant el terra (N triangles)*, *Simplificant les estructures (N triangles)*, *Construint la malla de filferro*.

## Formats {#formats}

| Format | Què es llegeix | Límits |
|---|---|---|
| `.glb` | Cada primitiva de malla amb `mode` 4 (triangles) o sense mode, amb la transformació del món de cada node aplicada; `POSITION`; `COLOR_0` (vec3 o vec4) com a color de vèrtex; el `baseColorTexture` del material i el seu `TEXCOORD_n` com a textura; els noms de node i de malla com a noms de peça. | Les línies i els punts s'ometen. |
| `.gltf` | Igual. | Només amb buffers incrustats: un glTF que referencia un `.bin` extern es rebutja amb *Exporta com a un sol .glb perquè la geometria quedi incrustada.* |
| `.obj` | Cares, amb els blocs `o` i `g` com a peces. | Només geometria (sense materials). |
| `.stl` | Binari i ASCII (`solid …`). | Una peça. |
| `.ply` | Només ASCII. | Un PLY binari es rebutja amb *Converteix a .glb o .stl binari.* |

Només geometria: posicions, normals i triangles soldats en un sol buffer, més colors i coordenades de textura quan n'hi ha ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Un model sense triangles es rebutja. El model ha d'estar al mateix espai del món i a la mateixa unitat que les dades (Y amunt): no es transforma res per encaixar-lo.

## Terra, estructures i aigua {#ground-structures-and-water}

Un nivell es divideix en tres classes en importar-lo, perquè necessiten tractaments oposats ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Terra** - es dibuixa opac i amb ombrejat de relleu (pendent, contorns, una rampa d'altitud) perquè la posició es pugui llegir respecte a ell.
- **Estructures** - els edificis i els objectes es posen entre la càmera i la calor que hi ha dins, així que es dibuixen com una **closca translúcida** (cares tènues amb una vora brillant, més les arestes sense duplicats) - o, quan tenen textura, sòlides amb les seves textures.
- **Aigua** - plana, sense senyals de terreny: una línia de contorn travessant un llac no té sentit.

Cada peça (node de glTF, objecte o grup d'OBJ) es classifica pel seu compte, per la primera regla que s'aplica:

1. **L'etiqueta de l'exportador.** Un nom que comença per `ground:`, `structure:` o `water:` (o amb `|` en lloc de `:`) es pren al peu de la lletra. Els exportadors propis del projecte etiqueten cada peça així.
2. **Noms d'aigua.** `water` com a paraula (no *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Noms de terra.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Noms d'estructura.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Una peça que cobreix més del 25% de l'àrea X-Z del mapa amb més del 60% de l'àrea dels seus triangles mirant amunt és terra. Una peça amb menys del 45% mirant amunt, o més alta que el 15% de l'altura del nivell mentre cobreix menys del 10% de la seva àrea, és una estructura. La proporció mirant amunt es pondera per àrea, així que una casa no es considera plana per tenir una teulada.
6. **En cas contrari, terra** - una peça ambigua per defecte és terra, perquè una closca per defecte gairebé invisible faria semblar el nivell una fallada de renderitzat.

Un model que és una sola peça classificada com a estructura es converteix en terra (*malla única sense nom - tractada com a terra*).

### Malles de navegació {#navigation-meshes}

Una peça anomenada `nav:…` (el `nav:walkable` d'un exportador de nivells) és una malla de navegació: on pot estar de peu un soldat. Es llista com a terra (*malla de navegació - no es dibuixa, perquè està sobre el terra; els clics encara la troben*) però **no es dibuixa**. Està posada sobre el terra del qual es va generar, coplanària amb ell fins a centímetres, i si es dibuixés com a terra les dues superfícies es disputarien cada píxel: en un nivell amb una textura de terra cuita, tota l'àrea jugable es veia com a taques de bordes durs grises i beix, una per triangle de navegació. Es conserva, sense simplificar, perquè la [selecció fent clic](camera.md#click-to-pick) pugui dir si un lloc és transitable. Les entrades de la biblioteca no la conserven.

**Mostra la classificació de les peces (N)** al panell (es mostra per als models amb més d'una peça) llista cada peça amb la seva classe i el motiu - *etiquetada per l'exportador*, *el nom coincideix amb un patró*, *cobreix el X% del mapa, Y% mirant amunt*, *Y% mirant amunt, Z% de l'altura del nivell*, *ambigua - s'ha posat com a terra per defecte*. Per canviar-ne una, reanomena la peça al model d'origen i importa de nou: la divisió queda cuita als buffers d'índexs.

## Simplificació {#simplification}

**Objectiu de simplificació** fixa el pressupost de triangles per a la següent importació ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Ajust | Triangles |
|---|---|
| *Complet - sense simplificació* (per defecte) | tots |
| *Alt - 8M triangles* | 8.000.000 |
| *Mitjà - 3M triangles* | 3.000.000 |
| *Baix - 800k triangles* | 800.000 |
| *Silueta - 100k triangles* | 100.000 |

El pressupost es reparteix **60% per a les estructures i 40% per al terra**, simplificats per separat - les estructures perden la forma més de pressa sota la decimació. L'aigua no es simplifica. La simplificació és un colapse d'arestes amb mètriques d'error quadràtiques ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), després de soldar els vèrtexs coincidents, així que les siluetes i les arestes dures sobreviuen. La nota d'importació informa de `origen → triangles actuals, desviació X%`, de la divisió terra / estructures / aigua entre les peces, i - quan s'ha usat *Complet* amb un model de més de 8M triangles - suggereix *Alt* (fins a 30M) o *Mitjà* (per sobre). Sense WebAssembly el simplificador no està disponible i la importació ho diu.

Els nivells dels exportadors propis del projecte ja tenen pressupost; l'objectiu existeix per a l'art en brut sense pressupost al darrere.

## Textures {#textures}

Un `.glb` les peces del qual porten textures de color base es dibuixa amb elles - una exportació d'un circuit de carreres, per exemple, en porta una per cada rajola de terreny i una per cada model col·locat.

La textura del terra es mostra per defecte quan n'hi ha; les estructures que porten textures comencen **sòlides, amb les seves pròpies textures** (les vores, les barreres, els murs de pneumàtics i els senyals són les vores d'una carretera, no edificis per mirar a dins), amb la malla de filferro desactivada i l'ombrejat pla desactivat. Vegeu [Aparença del nivell](level-appearance.md).

## Nivells grans {#large-levels}

- Per sobre de **300.000** triangles d'estructura, les arestes de les estructures començen desactivades i l'opacitat de les cares al 35%: amb una aresta a cada píxel el districte es llegeix com a blanc pla.
- El pla llunyà de la càmera s'amplia per ajustar-se al nivell ([Nivells](levels.md#what-a-level-does-for-the-heat)).

## Per a desenvolupadors {#for-developers}

### Atles de textures {#texture-atlas}

Cada textura s'empaqueta en **un sol atles** al treballador d'importació ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), perquè el nivell continuï sent un sol dibuix, un sol mostrejador i un sol atribut de coordenades de textura en tots dos backends:

- empaquetat en prestatges a la mida pròpia de cada imatge, reduït només si el conjunt no cabria en **8192 px** en cap de les dues direccions (el límit de mida de textura per defecte de WebGPU);
- un **marge de 16 píxels** al voltant de cada imatge, i només els 5 nivells de mip que protegeix aquest marge, així que un senyal llunyà mai no mostreja la textura del seu veí;
- les **textures repetitives** segueixen repetint-se. Una imatge el mostrejador glTF de la qual repeteix (el valor per defecte de glTF) i les coordenades de textura de la qual surten de 0..1 - una paret de maons amb un UV que va de 0 a 40 al llarg seu - esdevé una *rajola*: els seus vèrtexs conserven les seves pròpies coordenades i un número de rajola de 16 bits, i els shaders envolten la coordenada dins del rectangle de la rajola píxel a píxel, prenent el nivell de mip de la coordenada sense envoltar perquè les juntures no es vegin. El marge d'una rajola conté la seva pròpia vora oposada. Un eix el mostrejador del qual subjecta es subjecta; una imatge les coordenades de la qual es queden dins de 0..1 es dibuixa com abans. Un nivell amb rajoles costa 4 bytes més per vèrtex.

### El contracte de l'exportador {#the-exporter-contract}

Què necessita el visor d'un nivell, sigui qui sigui qui l'ha fet:

- un `.glb` autocontingut;
- `POSITION` float32, primitives de triangles;
- noms de node `ground:*`, `structure:*` i `water:*` (qualsevol altre es classifica per les regles de dalt), i `nav:*` per a una malla de navegació, que es conserva però no es dibuixa;
- coordenades de l'espai del món, **Y amunt**, en la mateixa unitat que la telemetria, perquè les dades quedin sobre el nivell sense cap pas de col·locació.
