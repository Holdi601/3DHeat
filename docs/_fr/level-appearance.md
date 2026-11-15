---
title: "Apparence du niveau"
parent: "Niveaux et géométrie de fond"
nav_order: 3
lang: "fr"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Apparence du niveau

Ces commandes changent l’aspect d’un niveau 3D, pour que la chaleur ressorte sur lui et que vous puissiez toujours lire le lieu. Rien ici ne change les données.

## Démarrage rapide {#quick-start}

1. Chargez un niveau 3D ([Niveaux 3D](model-levels.md)).
2. Dans **Arrière-plan / niveau**, baissez la **Luminosité** jusqu’à ce que la chaleur soit ce qu’il y a de plus lumineux à l’écran.
3. Ouvrez **Relief du sol** et augmentez l’**Ombrage de pente** ou l’**Intensité des courbes** jusqu’à distinguer une colline d’une plaine.
4. Ouvrez **Structures**. Baissez l’**Opacité des faces** pour voir à l’intérieur des bâtiments, ou activez la **Texture des structures** pour les voir pleins.
5. Si le sol porte une image peinte, essayez la **Texture du sol** désactivée puis activée.

![Les sections Relief du sol et Structures ouvertes, avec le niveau montré avec ses repères de relief](../assets/img/en/level-appearance-sections.webp)

Quand un [niveau 3D](model-levels.md) est chargé, le panneau Arrière-plan / niveau affiche ces commandes. Les valeurs par défaut sont celles qu’obtient un niveau fraîchement importé ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Les modifier ne fait que redessiner la scène ; l’accumulation de chaleur est conservée.

## Le niveau entier {#the-whole-level}

| Commande | Par défaut | Plage | Signification |
|---|---|---|---|
| **Opacité** | 100 % | 0-100 % | En dessous de 100 %, le niveau est mélangé et n’écrit pas de profondeur, si bien qu’il ne [cache](depth-and-culling.md) plus la chaleur. |
| **Luminosité** | 0.9 | 0-2 (curseur 64) | |

Le niveau est dessiné désaturé - sol gris, coque teintée - si bien que la chaleur est la seule chose saturée à l’écran. Contrairement à une [image de carte](map-images.md), un niveau 3D n’a pas de curseur de désaturation.

## Relief du sol {#ground-relief}

De loin, une colline et une plaine ont le même gris ; la visionneuse ajoute donc trois indices. Chacun répond à un défaut différent :

| Commande | Par défaut | Signification |
|---|---|---|
| **Espacement des courbes** | d’après l’étendue des hauteurs du sol | Hauteur entre deux courbes de niveau, en échelle logarithmique de 1/4000 à 1/2 de l’étendue des hauteurs du niveau ; le bas de la piste correspond à *désactivé*. La valeur par défaut est 1/40 de l’étendue des hauteurs du sol, arrondie à un pas 1/2/5 - des lignes de 10 m conviennent à un coteau et ne servent à rien sur le fond d’une carrière. Une courbe sur 5 est dessinée plus marquée. Les courbes sont dessinées dans l’espace de l’écran, si bien qu’elles restent large d’un pixel à tout zoom, et elles sont le seul repère qui subsiste sur un sol trop plat pour être ombré. |
| **Intensité des courbes** | 35 % | 0-100 % | |
| **Ombrage de pente** | 55 % | Assombrit selon la raideur, pour que talus et falaises se lisent sous n’importe quel angle de caméra - contrairement à une lumière, qui s’aplatit dès que vous lui faites face. |
| **Rampe d’altitude** | 50 % | Sol bas plus sombre, sol haut plus clair, sur l’étendue des hauteurs du sol : la forme à grande échelle. |

L’en-tête de la section indique l’état des courbes : *tous les N m*, l’espacement des courbes, ou *aucune courbe* quand l’espacement est désactivé.

## Surface du sol {#ground-surface}

| Commande | Par défaut | Affichée quand | Signification |
|---|---|---|---|
| **Eau** | activé | le niveau a de l’eau | Lacs, rivières et mer, dessinés à plat en gris-bleu pâle : aucun repère de terrain ne s’applique à une surface qui est plane par définition. |
| **Opacité de l’eau** | 60 % | l’eau est activée | Le littoral et le sol sous les bas-fonds se voient à travers l’eau translucide. |
| **Triangles du sol** | 30 % (0 pour un niveau texturé) | toujours | Les arêtes propres au terrain, dessinées par-dessus la surface ombrée, qui s’estompent entre 6 % et 25 % de la largeur du niveau à partir de la caméra. Elles montrent à quel point le sol a été échantillonné grossièrement et donnent à une pente quelque chose pour juger les distances. Construites au premier usage, ce qui prend un moment sur un grand niveau. |
| **Sol en fil de fer uniquement** | désactivé | toujours | Remplace la surface du terrain par ses arêtes. Entièrement schématique - cela renonce aussi à l’ombrage, aux courbes et à l’occlusion, si bien que *Triangles du sol* est en général le meilleur choix. |
| **Texture du sol** | activé | le niveau a des textures | Dessine le sol avec les textures que porte le fichier (asphalte, bas-côté, herbe). L’éclairage du maillage est appliqué doucement par-dessus, car la texture porte déjà son propre relief fin. La **Luminosité** est le moyen de l’atténuer sous la chaleur ; la désaturation relève des images de carte. |
| **Couleur capturée** | désactivé | le niveau a des couleurs par sommet | Ombre le sol avec la couleur qu’a capturée un scan au lieu du gris - une route reconstruite est sinon indiscernable de son bas-côté. Les exports de moteur n’en portent pas ; sans elle, le panneau dit *Ce niveau ne porte pas de couleur.* |

## Structures {#structures}

L’en-tête **Structures** affiche le nombre de triangles des structures ; l’indication dessous dit comment elles sont dessinées (*dessinées pleines avec leurs propres textures* ou *dessinées en coque transparente pour voir la chaleur à l’intérieur*) et combien de parties sont des structures.

| Commande | Par défaut | Signification |
|---|---|---|
| **Texture des structures** | activé quand les structures portent des textures | Dessine les structures pleines, avec leurs propres textures. L’activer règle l’opacité des faces à 100 % et coupe les arêtes ; la désactiver revient à la coque teintée et transparente à 25 %. Une structure texturée est éclairée du côté que voit la caméra, car un panneau est deux faces dos à dos, et c’est l’arrondi qui décide laquelle gagne le test de profondeur. |
| **Arêtes en fil de fer** | activé ; désactivé au-delà de 300 000 triangles de structures ou quand c’est texturé | Arêtes dédoublonnées des structures, une ligne par arête. |
| **Opacité des arêtes** | 50 % | |
| **Faces de la coque** | activé | Une surface discrète avec un liseré de Fresnel lumineux, pour qu’un bâtiment se lise comme un volume et non comme une cage ou un banc de brouillard. |
| **Opacité des faces** | 25 % (35 % au-delà de 300 000 triangles de structures, 100 % texturé) | 0-60 % sur la piste, jusqu’à 100 % avec la poignée. Gardez-la basse : les structures pleines cachent les données qui sont à l’intérieur. |
| **Arêtes vives** | activé (désactivé quand c’est texturé) | Ombre chaque triangle selon sa propre normale, calculée dans le shader de fragments à partir des dérivées de l’écran. Les niveaux exportés sont soudés et portent des normales moyennées, ce qui arrondit chaque angle de boîte en « feuille de métal fondue » ; dédoubler chaque sommet pour corriger cela multiplierait le tampon de sommets. Désactivez-la pour un niveau dont les surfaces courbes comptent plus que ses angles. |
| **Teinte des structures** | Cyan | Un sélecteur de couleur et les préréglages **Cyan**, **Ambre**, **Violet**, **Blanc**. |
| **Afficher la classification des parties (N)** | | Chaque partie, sa classe et la raison ; voir [Niveaux 3D](model-levels.md#ground-structures-and-water). |

## Couper le niveau {#cutting-the-level}

La [Coupe](slice.md) et, avec *Couper aussi le niveau*, l’[élimination par distance](depth-and-culling.md#distance-culling) coupent le sol, les structures et l’eau aux mêmes plans que la chaleur.
