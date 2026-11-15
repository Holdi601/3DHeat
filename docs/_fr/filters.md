---
title: "Filtres"
parent: "Filtres et outils"
nav_order: 1
lang: "fr"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtres

Les **Filtres** masquent les lignes qui ne vous intéressent pas, comme une classe de véhicule ou un type d'événement, et l'image se met à jour aussitôt. Le panneau liste les colonnes conservées au chargement sous *Garder pour le filtrage* ([Correspondance des colonnes](column-mapping.md)), plus *Fichier source* lorsque plusieurs fichiers ont été chargés.

## L'essayer {#try-it}

1. Chargez un jeu de données et ouvrez **Filtres** dans la barre latérale.
2. Sous **Classe de véhicule**, décochez *Tank*. L'image change aussitôt.
3. Appuyez sur **Effacer tous les filtres** pour annuler.

![Le panneau Filtres : les colonnes propres à la visionneuse (Type d'événement, Classe de véhicule) d'abord, puis les colonnes de votre fichier](../assets/img/en/filters.webp)

Les premières lignes sont les colonnes propres à la visionneuse (ci-dessous). Les lignes suivantes proviennent de votre fichier.

## Colonnes ajoutées par la visionneuse {#columns-the-viewer-adds}

Au chargement, la visionneuse détermine quatre colonnes qui lui sont propres et les liste **en premier**, avec noms et valeurs dans votre langue, de sorte que le même filtre fonctionne pour chaque jeu et chaque source de données :

| Colonne | Valeurs | Déduites de |
|---|---|---|
| **Type d'événement** | 23 types : Position, Tir, Lancement (missile, roquette, bombe), Impact, Raté (arme terminée près d'aucune cible), Explosion, Dégâts, Élimination, Mort, Détruit, Écrasement, Éjection / saut en parachute, Apparition, Disparition, Décollage, Atterrissage, Contact avec le sol, Arrêt au sol, Réarmement / ravitaillement, Capture / objectif, Leurre, Message, Autre | une colonne nommée `event`, `events`, `event_type` ou `event_name` ; les mots propres à chaque jeu (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) sont ramenés à ces types. Le tableau complet : [Types et classes d'événements](ref-event-types.md). |
| **Joueur ou IA** | Joueur, IA | une colonne `ai`, `is_ai`, `bot` ou `actor` ; sinon `is_player` / `human` ; sinon un identifiant de compte (`user_id`, `steam_id` ; vide ou 0 = IA) ; pour les enregistrements Tacview, si l'objet a un pilote |
| **Classe de véhicule** | 17 classes : Chasseur, Avion d'attaque, Bombardier, Autre avion, Hélicoptère, Char, Véhicule blindé, Défense aérienne, Artillerie, Camion / voiture, Navire, Sous-marin, Infanterie, Arme, Leurre, Structure, Autre | le nom du véhicule ou de l'unité (comparé au [catalogue de figurines](figures.md)) et les colonnes de type |
| **Classe de cible** | les mêmes classes | le véhicule de l'autre partie (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Seuls les types qui apparaissent sont listés. Les colonnes de valeur (`cost_*`, `earn_*`, `net_*` et *Source du coût*, voir [Pondération des valeurs](value-weighting.md)) se filtrent comme n'importe quelle colonne numérique : par exemple, décochez *estimation* sous *Source du coût* pour ne garder que les lignes chiffrées.

Une liste de catégories de plus de 12 valeurs reçoit une zone de recherche (*Rechercher n valeurs*) et un bouton **Seulement ceux-ci** qui n'autorise que les valeurs correspondantes.

Les colonnes qui peuvent être filtrées sont déterminées au chargement, car elles doivent être lues à ce moment-là. Sans colonne conservée, le panneau l'indique et renvoie à *Garder pour le filtrage*.

## Colonnes numériques (intervalle) {#numeric-columns-range}

![Un filtre d'intervalle (argent perdu) avec les deux bornes déplacées](../assets/img/en/filters-numeric.webp)

| Élément | Signification |
|---|---|
| Nom, et `min ... max` | La colonne, et l'intervalle courant (la plage complète de la colonne tant qu'aucun filtre n'est défini). |
| Première ligne : case numérique et curseur | La borne inférieure. Faire glisser le curseur au-delà de la borne supérieure entraîne la borne supérieure avec lui. |
| Deuxième ligne : case numérique et curseur | La borne supérieure. Glisser en dessous de la borne inférieure l'entraîne aussi. |
| **Réinitialiser *colonne*** | Supprime ce filtre. |

Les curseurs couvrent du minimum au maximum de la colonne en 1 000 pas ; les cases numériques acceptent n'importe quelle valeur. Une ligne passe lorsque sa valeur se trouve dans l'intervalle, bornes incluses. Les grandes valeurs s'affichent en notation exponentielle (`1.23e6`).

## Colonnes de catégorie {#category-columns}

| Élément | Signification |
|---|---|
| Nom, et `autorisées/total` | La colonne, et combien de ses valeurs sont autorisées. |
| Liste des valeurs | Une case à cocher par valeur ; une valeur vide s'affiche comme *(vide)*. |
| **Tout** / **Aucun** | Autoriser toutes les valeurs / aucune valeur. |

Autoriser toutes les valeurs supprime le filtre.

## Règles {#rules}

- **Quatre filtres à la fois.** L'en-tête affiche `actifs/4`. Un cinquième filtre n'est pas appliqué, et le panneau le signale. Une sélection dans [Entités](entities.md) (ou la mise au point sur un joueur de l'onglet Match) utilise elle aussi l'un des quatre. Un filtre qui couvre toute la colonne n'en utilise aucun.
- **Une colonne de catégorie a au plus 4 096 valeurs** ; une colonne plus large n'est pas conservée au chargement.
- **Les filtres se combinent en ET**, ainsi qu'avec la visibilité des équipes, la répartition différentielle, la fenêtre temporelle, l'élimination par distance et la [coupe](slice.md).
- **Modifier un filtre relance l'accumulation et remesure l'exposition** quelques images plus tard, car filtrer peut beaucoup changer la densité ([Couleur et exposition](colour-and-exposure.md#auto-exposure)).
- **Effacer tous les filtres** supprime chaque filtre de colonne. La visibilité des équipes et les sélections de joueurs faites ailleurs sont conservées.
- Les filtres de colonnes modifient les modes de chaleur. Ils ne modifient pas les figurines du [replay en figurines](box-replay.md), qui suivent la visibilité des équipes et la sélection d'Entités. La sélection d'Entités modifie les deux.
- Dans la [chaleur linéaire](line-heat.md), un filtre est testé sur la ligne où chaque segment *se termine*.
- À chaque nouveau jeu de données, tous les filtres sont effacés.

## Pour les développeurs {#for-developers}

**Emplacements.** Chaque filtre actif occupe l'un des quatre emplacements GPU ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), une texture de 4 octets par ligne. Les emplacements sont attribués aux filtres dans l'ordre de leur dernière modification ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), partagé par le shader et les deux panneaux). Au-delà de quatre, un message indique *Seuls les 4 premiers filtres sont appliqués. Retirez-en un - les autres sont ignorés, ils ne sont pas combinés en silence*, et le nom des filtres en surplus s'affiche sous la forme *colonne (non appliqué)*. Les filtres s'exécutent ligne par ligne dans le shader de sommets : modifier un seuil ne demande donc ni nouvelle analyse ni nouvel envoi.

**Filtres que le panneau n'affiche pas.** Deux autres types existent dans l'état de l'application ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)) :

- un filtre de **groupes**, défini par l'onglet Match lorsqu'il met au point un camp. Il masque les autres groupes dans chaque mode, y compris une répartition [différentielle](difference.md) par colonne.
- un filtre de **personnes**, défini par le panneau [Entités](entities.md) et par l'onglet Match lorsqu'il met au point un joueur. Il restreint le replay en figurines et les modes de chaleur. Dans la chaleur, c'est un filtre de catégorie sur les identifiants de personnes, et il occupe l'un des quatre emplacements. Son masque contient 65 536 identifiants ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)) ; une personne au-delà de ce nombre n'est pas dessinée dans la chaleur tant que le filtre est actif, même si elle est sélectionnée. Le replay en figurines continue de les afficher.
