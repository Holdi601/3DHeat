---
title: "Figurines"
parent: "Replay"
nav_order: 3
has_children: true
lang: "fr"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figurines

Une **figurine** est un petit modèle 3D de ce qu'est réellement une unité : un char, un avion à réaction, un navire, un soldat. Le [replay](match-replay.md) dessine chaque unité sous forme de sa figurine à taille réelle, au lieu d'une simple boîte.

Il existe environ 2 000 véhicules, avions, navires, armes et soldats nommés, tous construits par la visionneuse elle-même.

![Des chars de la démonstration dessinés comme leurs propres figurines](../assets/img/fr/replay-tanks.webp)

## Ce qui est dans le catalogue {#what-is-in-the-catalogue}

| Domaine | Exemples |
|---|---|
| Personnes | soldat debout, accroupi, couché ; tireur d'élite, antichar, secouriste, équipage |
| Terrestre | chars, véhicules de combat d'infanterie, défense antiaérienne, artillerie, camions et voitures, trains et tramways |
| Air | chasseurs, avions d'attaque, bombardiers, transports, hélicoptères, des biplans aux avions à réaction modernes |
| Mer | navires de guerre par classe, porte-avions, sous-marins, bateaux, navires marchands |
| Armes | missiles, roquettes, bombes, torpilles, leurres et paillettes |
| Marqueurs | grenades fumigènes, flash et incendiaires, bombes posées, drapeaux, points d'apparition, points de passage |

## Comment les figurines sont faites {#how-the-figures-are-made}

- **Construites à partir de dimensions publiées.** La plupart des figurines sont faites par le constructeur de figurines de la visionneuse, à partir de chiffres publics : longueur, largeur, hauteur, roues de route, tourelle et canon, ailes et empennage. Leur forme est ensuite réglée d'après des photos publiques, des dessins et des dimensions publiées. Aucun modèle de jeu n'est utilisé.
- **Modèles libres.** Quelques figurines utilisent des modèles 3D libres (CC0 ou CC BY) quand ceux-ci sont plus fidèles, parfois combinés à la coque construite. Les auteurs des œuvres CC BY sont crédités sur [Crédits des figures](figure-credits.md). Les œuvres CC0 n'ont pas besoin de crédit et n'y sont pas listées.
- Chaque figurine existe en version complète, grossière et lointaine (niveaux de détail, LOD), pour que des milliers puissent être dessinées en même temps.

## Quelle figurine reçoit une unité {#which-figure-a-unit-gets}

La visionneuse regarde les colonnes propres aux données :

1. **Noms** : les colonnes appelées *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ou *Figure* sont comparées au catalogue : exactement, grâce à environ 4 000 alias (identifiants d'unités de plusieurs jeux), par le plus long début connu (`F-16C_50` donne le F-16C), ou par le plus court nom de figurine qui commence par lui.
2. Un nom dont la figurine ne correspond pas au **type** de l'unité n'est pas utilisé (un camion appelé *Typhoon* n'est pas le chasseur).
3. **Types** : les colonnes appelées *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ou *Domain* donnent une figurine de classe : étiquettes Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), icônes de carte, ou simples mots (char, hélicoptère, infanterie).
4. Les données qui n'ont ni l'une ni l'autre sont des données de personnes : tout le monde est un soldat.

Ainsi, le moyen le plus simple d'obtenir les bonnes figurines est une colonne `vehicle` avec les vrais noms, ou une colonne `type` avec des étiquettes Tacview.

**Mon unité s'affiche comme une boîte ou un soldat.** Ajoutez une colonne `vehicle` avec le vrai nom, ou une colonne `type` avec une étiquette Tacview. Survolez l'unité pour voir quel nom a été reconnu. Des données qui ont de telles colonnes mais ne disent rien sur une unité laissent celle-ci en boîte ; des données sans aucune de ces colonnes sont dessinées en soldats.

## Réglages {#settings}

La section **Figurines** de la barre latérale du replay règle la taille, la plus petite taille à l'écran, ce que deviennent les unités lointaines (figurine, flèche, symbole) et les effets dessinés dessus. Voir [Replay de match](match-replay.md#figures). Fumée, feu et autres effets temporisés : [Figurines dans la superposition](figure-replay.md).

## Un lot local de figurines facultatif {#an-optional-local-figure-pack}

Vous pouvez garder sur votre propre machine un lot facultatif de vos propres figurines. Ses figurines prennent la place des figurines du catalogue qui portent les mêmes noms. Il ne fait jamais partie du dépôt ni d'une version publiée. Sans lot, rien ne change.
