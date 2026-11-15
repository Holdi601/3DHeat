---
title: "Glossaire"
nav_order: 24
lang: "fr"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Glossaire

Brèves définitions des mots utilisés sur ce site, en langage courant. Chaque entrée renvoie à la page qui l'explique en détail.

## Données {#data}

**Ligne.** Une ligne de vos données : une chose qui s'est produite à un endroit et un moment, par exemple « le joueur 7 était ici à la seconde 12 ». La visionneuse dessine chaque ligne. [Formats de données](data-formats.md)

**Colonne.** Un type de valeur dans les lignes, comme x, y, z, temps ou équipe. La visionneuse devine quelle colonne est laquelle, et vous pouvez corriger cette supposition. [Mappage des colonnes](column-mapping.md)

**CSV.** Un tableau en texte brut : une ligne par ligne, des valeurs séparées par des virgules. Presque tous les logiciels peuvent en écrire un. [Charger des fichiers](loading-files.md)

**Parquet.** Un fichier de tableau compact qui se lit vite, même avec des millions de lignes. C'est le meilleur format à donner à la visionneuse. [Charger des fichiers](loading-files.md)

**Événement.** Quelque chose qui s'est produit, comme un tir, un impact, une élimination ou un décollage. Une ligne peut être un événement, ou simplement « j'étais ici ». [Filtres](filters.md)

**Personne.** Celui qui a produit les lignes : un joueur, un pilote, une voiture ou un char. Une personne est une suite de positions dans le temps. [Sessions, personnes et groupes](sessions-persons-groups.md)

**Groupe (équipe).** Un ensemble de personnes affichées dans la même couleur, par exemple Blue et Red. [Sessions, personnes et groupes](sessions-persons-groups.md)

**Session (match, manche).** Une partie du jeu. Un match ou une manche est une session. La visionneuse peut afficher une session ou superposer plusieurs sessions. [Sessions, personnes et groupes](sessions-persons-groups.md)

**Niveau.** La carte 3D où se sont déroulées les données : sol, bâtiments, murs. Les lignes apparaissent là où elles se sont produites sur le niveau. [Niveaux et géométrie de fond](levels.md)

## Regarder les données {#looking-at-the-data}

**Carte de chaleur.** Une image où les endroits que touchent beaucoup de lignes brillent davantage. Les endroits froids sont calmes, les endroits chauds sont animés. [Chaleur](heat.md)

**Chaleur.** Ce qui s'est passé en un point. La visionneuse additionne la lueur de chaque ligne à chaque endroit ; la somme est la chaleur. [Chaleur](heat.md)

**Sprite.** La petite tache lumineuse que la visionneuse dessine pour une ligne. De nombreux sprites qui se recouvrent s'additionnent en chaleur. [Forme des sprites](sprite-shape.md)

**Exposition.** La luminosité de l'image. Comme un appareil photo, une exposition trop forte rend tout blanc, et une exposition trop faible cache les détails. [Couleur et exposition](colour-and-exposure.md)

**Saturation.** La quantité de chaleur qui compte comme « aussi chaud que les couleurs peuvent aller ». Baissez-la pour faire ressortir les endroits calmes ; montez-la pour ne voir que les plus chauds. [Couleur et exposition](colour-and-exposure.md)

**Volume.** Une boîte ou une forme que vous placez dans la vue 3D. La visionneuse compte ce qui s'y trouve et peut comparer les volumes entre eux. [Volumes et comparaison](volumes.md)

**Filtre.** Une règle qui masque les lignes dont vous ne voulez pas, par exemple « seulement les éliminations » ou « seulement l'équipe Red ». [Filtres](filters.md)

## Replay {#replay}

**Figure.** Un petit modèle d'un char, d'un avion, d'une voiture ou d'un soldat qui se déplace là où les données indiquent qu'il était. [Figurines](figures.md)

**LOD (niveau de détail).** Chaque figurine existe en version détaillée, en version plus simple et en version très simple. Les figurines proches utilisent la version détaillée et les lointaines la version simple, de sorte que des milliers peuvent être dessinées en même temps. [Figurines](figures.md)

## Course {#racing}

**Tour.** Un parcours complet du circuit, de la ligne jusqu'à la ligne. [Charger des tours](race-loading-laps.md)

**Tour de référence.** Le tour auquel tous les autres sont comparés. Les écarts sont indiqués comme « plus rapide » ou « plus lent » que lui. [Charger des tours](race-loading-laps.md)

**Corde (sommet de virage).** Le point d'un virage où la voiture est au plus près du bord intérieur. [Analyse virage par virage](race-corner-analysis.md)

**Glissement.** La quantité dont un pneu glisse. Un peu de glissement donne le plus d'adhérence ; trop, et la voiture dérape. [Analyse de course : la méthode](race-analytics.md)

**Enveloppe.** Ce qu'une voiture peut faire à chaque vitesse : à quel point elle peut tourner, freiner et accélérer avant de glisser. [Analyse de course : la méthode](race-analytics.md)

## Nombres de l'aviation {#aircraft-numbers}

**ALT.** Altitude : la hauteur au-dessus du sol ou du niveau de la mer. [Replay de match](match-replay.md#labels-and-statistics)

**TAS.** Vitesse vraie : la vitesse à laquelle un avion se déplace dans l'air. [Replay de match](match-replay.md#labels-and-statistics)

## Ordinateur {#computer}

**GPU.** La carte graphique ou la puce graphique. Elle dessine l'image et est bien plus rapide que le processeur principal pour dessiner des millions de taches. [Les deux moteurs de rendu](backends.md)

**WebGPU / WebGL2.** Les deux façons dont un navigateur permet à une page d'utiliser le GPU. WebGPU est plus récent. La visionneuse peut utiliser l'un ou l'autre et choisit le meilleur que votre navigateur propose. [Les deux moteurs de rendu](backends.md)

## Vocabulaire de Counter-Strike {#counter-strike-words}

**Manche.** Un court affrontement à l'intérieur d'un match. Un camp le gagne, et le score augmente d'un point.

**Éco, achat forcé, achat complet.** La somme qu'un camp dépense en armes au début d'une manche. Une éco économise et n'achète presque rien (moins de 1 500 $ par joueur en moyenne). Un achat forcé dépense ce qu'il a (moins de 4 000 $). Un achat complet achète tout ce qu'il peut. [Analyse de match](match-analysis.md)

**Échange.** Une élimination qui en rembourse une autre : vous êtes touché, et un coéquipier abat votre tueur dans les 5 secondes. [Analyse de match](match-analysis.md)

**KAST.** La part des manches où un joueur a fait une élimination, une aide, a survécu ou a été échangé. Un nombre plus élevé signifie que le joueur a aidé dans davantage de manches. [Analyse de match](match-analysis.md)

**ADR.** Dégâts moyens par manche : la quantité de vie qu'un joueur a retirée à ses ennemis à chaque manche. [Analyse de match](match-analysis.md)
