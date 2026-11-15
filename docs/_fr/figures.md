---
title: "Figurines"
parent: "Replay"
nav_order: 3
has_children: true
lang: "fr"
source: "figures.md"
source_hash: "7040eba3b7ac"
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
| Combat rapproché | soldats en gilet porte-plaques avec fusil d'assaut, pistolet-mitrailleur, fusil à pompe, DMR, LMG, arme de poing ou bouclier ; drones, caméras, barbelés, boucliers, renforts de mur, barricades, charges de brèche, pièges, fenêtres, grenades, le désamorceur |

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

## Figurines de combat rapproché (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Les tableaux écrits comme ceux du lecteur de replays Rainbow Six Siege (colonnes `operator`, `pawn`, `primaryClass`, `side`) reçoivent leurs propres figurines :

- **Les joueurs** sont leur agent : chacun des 78 agents a sa propre figurine, d'environ 1,8 m, dans ses propres vêtements. Deux ou trois couleurs pour la veste, le pantalon et l'équipement suivent son allure publique habituelle (noir, olive, sable, gris urbain, blanc, bleu marine, avec un équipement rouge, orange ou bleu canard). Il a aussi ses propres formes, un tiers plus grandes que nature là où elles doivent se voir d'en haut : le couvre-chef (casques, une visière ou un casque lourd, casquettes, bonnets, bérets, un large chapeau de brousse ou une chapka, capuches, écharpes, cheveux), le visage (lunettes de protection, masque à gaz, lunettes, masque, barbe, lunettes à trois verres), une carrure légère, moyenne ou lourde (les lourds sont larges, avec de grandes épaulières et un col), un long manteau ou un costume, une tenue ghillie, ce qu'il porte dans le dos (un marteau, des charges, des drones, des bidons, un réservoir de carburant, un tube de lanceur, une arbalète, des panneaux, un brouilleur, un bouclier) ou au bras (un lanceur, un bras de métal), son propre bouclier (un grand, un bouclier anti-émeute, un avec des lumières), et une couleur d'accent sur les épaules. Il tient la classe de son arme principale. Un agent que la visionneuse ne connaît pas est un simple soldat en gilet porte-plaques, à la couleur de l'équipe.
- **Le camp** se voit à part des vêtements : un anneau au sol sous chaque agent, **ambre pour l'attaque, cyan pâle pour la défense**, avec la couleur de l'équipe à l'intérieur, et des brassards et bandeaux de la même couleur. Une colonne `stance` (stand, crouch, prone) leur donne leur posture ; sans elle, ils sont debout.
- **Distincts à distance de replay :** rendus à 48 pixels de haut, vus d'en haut et de trois quarts, deux agents d'un même camp diffèrent toujours par une nette différence de couleur ou une autre forme (vérifié par les tests de la visionneuse).
- **Les étiquettes** donnent le joueur et l'agent joué à ce moment, avec le rôle de l'agent en symbole : ✸ brèche lourde, ⚒ brèche légère, ➤ entrée, ✦ fragger, ✚ soutien, ⬟ bouclier, ◉ renseignement, ◇ polyvalent, ↺ garde de flanc, ⚓ ancre, ✕ poseur de pièges, ⇄ rôdeur, ↯ anti-gadget, ▣ anti-brèche.
- **Les drones** sont un drone à deux roues qu'on lance, d'environ 30 cm de large. Chacun est une piste à part, nommée d'après son propriétaire (« Ash · drone 2 »).
- **Les gadgets posés** restent là où ils ont été mis, de ce moment jusqu'à la fin de la manche. Chacun est la figurine de ce qu'il fait : une caméra, des barbelés, un bouclier déployable, une charge de brèche, une charge de brèche lourde, une petite charge collante, un piège au sol, une claymore avec son laser de déclenchement, une fenêtre sans tain, un panneau blindé, une grenade, une bonbonne de gaz, un brouilleur, un capteur, une barrière laser, une caisse de ravitaillement. Une seule figurine sert à tous les gadgets qui font le même travail. Un gadget dont les données ne disent pas le type est un petit appareil avec une lumière.
- **Le désamorceur** reste là où il a été posé pendant ses 45 secondes.

Chaque drone et chaque gadget devient une piste à part au chargement du fichier. Ainsi, la figurine du joueur reste sur son corps. Les agents sont des formes simplifiées d'après leurs descriptions et illustrations publiques (ce qu'ils portent, l'appareil qui est leur capacité). Les gadgets ont la forme de ce qu'ils font. Tout cela, ce sont des créations propres à la visionneuse, à la taille réelle de l'objet (une claymore d'environ 22 cm de large, un panneau de la taille d'une porte de 1 m sur 2,1 m), et non des modèles du jeu.

## Réglages {#settings}

La section **Figurines** de la barre latérale du replay règle la taille, la plus petite taille à l'écran, ce que deviennent les unités lointaines (figurine, flèche, symbole) et les effets dessinés dessus. Voir [Replay de match](match-replay.md#figures). Fumée, feu et autres effets temporisés : [Figurines dans la superposition](figure-replay.md).

## Un lot local de figurines facultatif {#an-optional-local-figure-pack}

Vous pouvez garder sur votre propre machine un lot facultatif de vos propres figurines. Ses figurines prennent la place des figurines du catalogue qui portent les mêmes noms. Il ne fait jamais partie du dépôt ni d'une version publiée. Sans lot, rien ne change.
