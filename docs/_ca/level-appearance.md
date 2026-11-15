---
title: "Aspecte del nivell"
parent: "Nivells i geometria de fons"
nav_order: 3
lang: "ca"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Aspecte del nivell

Aquests controls canvien com es veu un nivell 3D, perquè la calor destaqui sobre ell i encara puguis llegir el lloc. Res d'aquí no canvia les dades.

## Inici ràpid {#quick-start}

1. Carrega un nivell 3D ([Nivells 3D](model-levels.md)).
2. A **Fons / nivell**, baixa la **Brillantor** fins que la calor sigui el més brillant de la pantalla.
3. Obre **Relleu del terra** i puja l'**Ombrejat per pendent** o la **Intensitat de les corbes** fins que puguis distingir un turó d'una planura.
4. Obre **Estructures**. Baixa l'**Opacitat de les cares** per veure dins dels edificis, o activa la **Textura de les estructures** per veure'ls sòlids.
5. Si el terra té una imatge pintada, prova la **Textura del terra** desactivada i activada.

![Les seccions Relleu del terra i Estructures obertes, amb el nivell mostrat amb pistes de relleu](../assets/img/en/level-appearance-sections.webp)

Amb un [nivell 3D](model-levels.md) carregat, el panell Fons / nivell mostra aquests controls. Els valors per defecte són els que rep un nivell importat de nou ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Canviar-los només redibuixa l'escena; l'acumulació de calor es conserva.

## Tot el nivell {#the-whole-level}

| Control | Per defecte | Rang | Significat |
|---|---|---|---|
| **Opacitat** | 100% | 0-100% | Per sota del 100% el nivell es barreja i no escriu profunditat, de manera que ja no [oclou](depth-and-culling.md) la calor. |
| **Brillantor** | 0,9 | 0-2 (roda 64) | |

El nivell es dibuixa desaturat - terra gris, una closca amb un to - perquè la calor sigui l'única cosa saturada de la pantalla. A diferència d'una [imatge de mapa](map-images.md), un nivell 3D no té control lliscant de Dessaturació.

## Relleu del terra {#ground-relief}

De lluny un turó i una planura es veuen igual de grisos, així que el visor afegeix tres pistes. Cadascuna respon a un error diferent:

| Control | Per defecte | Significat |
|---|---|---|
| **Separació de les corbes** | a partir del rang d'altures del terra | Altura entre les línies de nivell, logarítmica de 1/4000 a 1/2 del rang d'altures del nivell; el mínim de la pista és *apagat*. El per defecte és 1/40 del rang d'altures del terra arrodonit a un pas 1/2/5 - línies de 10 m van bé per a un vessant i no serveixen per al fons d'una pedrera. Cada 5a línia es dibuixa més marcada. Les corbes es dibuixen en espai de pantalla, de manera que sempre tenen un píxel d'ample a qualsevol zoom, i són l'única pista que sobreviu al terra massa pla per ombrejar-se. |
| **Intensitat de les corbes** | 35% | 0-100% |
| **Ombrejat per pendent** | 55% | Enfosqueix segons la inclinació, perquè els talussos i els penya-segats es llegeixin des de qualsevol angle de càmera - a diferència d'una llum, que aplana quan la mires de cara. |
| **Rampa d'altitud** | 50% | Terra baix més fosc, terra alt més clar, a través del rang d'altures del terra: la forma a gran escala. |

La capçalera de la secció mostra l'estat de les corbes: *cada N m*, la separació de les corbes, o *sense corbes* quan la separació és apagada.

## Superfície del terra {#ground-surface}

| Control | Per defecte | Es mostra quan | Significat |
|---|---|---|---|
| **Aigua** | activat | el nivell té aigua | Llacs, rius i mar, dibuixats plans en un blau-gris pàl·lid: cap de les pistes del terreny s'aplica a una superfície que és plana per definició. |
| **Opacitat de l'aigua** | 60% | L'aigua és activada | La línia de costa i el terra sota les aigües poc fondes es veuen a través de l'aigua translúcida. |
| **Triangles del terra** | 30% (0 per a un nivell amb textures) | sempre | Les arestes pròpies del terreny dibuixades sobre la superfície ombrejada, que s'esvaeixen entre el 6% i el 25% de l'amplada del nivell des de la càmera. Mostra com de gruixudament s'ha mostrejat el terra i dona a una pendent alguna cosa amb què jutjar la distància. Es construeix en el primer ús, cosa que triga un moment en un nivell gran. |
| **Terra només com a malla de filferro** | apagat | sempre | Substitueix la superfície del terreny per les seves arestes. És totalment esquemàtic - també renuncia a l'ombrejat, a les corbes i a l'oclusió, així que *Triangles del terra* sol ser la millor opció. |
| **Textura del terra** | activat | el nivell té textures | Dibuixa el terra amb les textures que porta el fitxer (asfalt, vorera, herba). La il·luminació de la malla s'aplica suaument per sobre, perquè la textura ja porta el seu propi relleu fi. La **Brillantor** és la manera de silenciar-la sota la calor; la Dessaturació pertany a les imatges de mapa. |
| **Color capturat** | apagat | el nivell porta colors de vèrtex | Ombreja el terra amb el color que va capturar un escàner en lloc de gris - una carretera reconstruïda, si no, és indistingible de la vorera. Les exportacions de motors no en porten; quan no n'hi ha, el panell diu *Aquest nivell no porta color.* |

## Estructures {#structures}

La capçalera **Estructures** mostra el nombre de triangles de les estructures; la indicació de sota diu com es dibuixen (*dibuixades sòlides amb les seves textures* o *dibuixades com una closca transparent perquè vegis la calor a dins*) i quantes parts són estructures.

| Control | Per defecte | Significat |
|---|---|---|
| **Textura de les estructures** | activat quan les estructures porten textures | Dibuixa les estructures sòlides, amb les seves textures. En activar-la, l'opacitat de les cares es posa al 100% i les arestes es desactiven; en desactivar-la es torna a la closca translúcida amb to al 25%. Una estructura amb textura s'il·lumina pel costat que veu la càmera, perquè un cartell són dues cares d'esquena a esquena i quina guanya la prova de profunditat depèn de l'arrodoniment. |
| **Arestes de filferro** | activat; desactivat per sobre de 300.000 triangles d'estructura o quan té textura | Arestes sense duplicats de les estructures, una línia per aresta. |
| **Opacitat de les arestes** | 50% | |
| **Cares de la closca** | activat | Una superfície tènue amb una vora de Fresnel brillant, perquè un edifici es llegeixi com un volum i no com una gàbia o un banc de boira. |
| **Opacitat de les cares** | 25% (35% per sobre de 300.000 triangles d'estructura, 100% amb textura) | De 0 a 60% a la pista, fins al 100% amb la nansa. Mantén-la baixa: les estructures sòlides amaguen les dades que hi ha dins. |
| **Arestes vives** | activat (desactivat amb textura) | Ombreja cada triangle segons la seva pròpia normal, calculada al shader de fragments a partir de les derivades de l'espai de pantalla. Els nivells exportats estan soldats i porten normals promitjades, cosa que arrodoneix cada cantonada de caixa fins a "paper d'alumini fos"; separar cada vèrtex per arreglar-ho multiplicaria el buffer de vèrtexs. Desactiva-la per a un nivell en què les superfícies corbes importen més que les seves cantonades. |
| **To de les estructures** | Cian | Un selector de color i els preajustos **Cian**, **Ambre**, **Violeta**, **Blanc**. |
| **Mostra la classificació de les parts (N)** | | Cada part, la seva classe i el motiu; mira [Nivells 3D](model-levels.md#ground-structures-and-water). |

## Tallar el nivell {#cutting-the-level}

El [Tall](slice.md) i, amb *Talla també el nivell* activat, el [retall per distància](depth-and-culling.md#distance-culling) tallen el terra, les estructures i l'aigua als mateixos plans que la calor.
