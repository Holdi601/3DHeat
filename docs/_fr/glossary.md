---
title: "Glossaire"
nav_order: 21
lang: "fr"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glossaire

Brefs sens des mots que ce site utilise, en langage simple. Chaque entrée renvoie à la page qui l’explique en détail.

## Données {#data}

**Ligne.** Une ligne de vos données : une chose qui s’est produite à un endroit et à un moment, par exemple « le joueur 7 était ici à la seconde 12 ». La visionneuse dessine chaque ligne. [Formats de données](data-formats.md)

**Colonne.** Un genre de valeur dans les lignes, comme x, y, z, temps ou équipe. La visionneuse devine quelle colonne est laquelle, et vous pouvez changer sa supposition. [Mappage des colonnes](column-mapping.md)

**CSV.** Un tableau en texte brut : une ligne par ligne, des valeurs séparées par des virgules. Presque tous les logiciels savent en écrire un. [Charger des fichiers](loading-files.md)

**Parquet.** Un fichier de tableau compact, rapide à lire, même avec des millions de lignes. C’est le meilleur format à donner à la visionneuse. [Charger des fichiers](loading-files.md)

**Événement.** Quelque chose qui s’est produit, comme un tir, un coup au but, une élimination ou un décollage. Une ligne peut être un événement, ou seulement « j’étais ici ». [Filtres](filters.md)

**Personne.** Celui qui a produit les lignes : un joueur, un pilote, une voiture ou un char. Une personne est une ligne de positions au fil du temps. [Sessions, personnes et groupes](sessions-persons-groups.md)

**Groupe (équipe).** Un ensemble de personnes affichées dans la même couleur, par exemple Bleu et Rouge. [Sessions, personnes et groupes](sessions-persons-groups.md)

**Session (match, manche).** Un déroulement du jeu. Un match ou une manche est une session. La visionneuse peut en montrer une seule ou superposer plusieurs. [Sessions, personnes et groupes](sessions-persons-groups.md)

**Niveau.** La carte 3D sur laquelle se sont passées les données : sol, bâtiments, murs. Les lignes apparaissent là où elles se sont produites sur le niveau. [Niveaux et géométrie de fond](levels.md)

## Regarder les données {#looking-at-the-data}

**Carte de chaleur.** Une image où les endroits touchés par beaucoup de lignes brillent davantage. Les endroits froids sont calmes, les endroits chauds sont animés. [Chaleur](heat.md)

**Chaleur.** Ce qui s’est passé à un endroit. La visionneuse additionne la lueur de chaque ligne à chaque endroit ; la somme est la chaleur. [Chaleur](heat.md)

**Sprite.** La petite tache lumineuse que la visionneuse dessine pour une ligne. Beaucoup de sprites qui se chevauchent s’additionnent en chaleur. [Forme des sprites](sprite-shape.md)

**Exposition.** La luminosité de l’image. Comme avec un appareil photo, trop d’exposition rend tout blanc et trop peu cache les détails. [Couleur et exposition](colour-and-exposure.md)

**Saturation.** La quantité de chaleur qui compte comme « aussi chaud que les couleurs le permettent ». Baissez-la pour faire ressortir les endroits calmes ; montez-la pour ne voir que les plus chauds. [Couleur et exposition](colour-and-exposure.md)

**Volume.** Une boîte ou une forme que vous placez dans la vue 3D. La visionneuse compte ce qui s’y trouve et peut comparer des volumes entre eux. [Volumes et comparaison](volumes.md)

**Filtre.** Une règle qui masque les lignes que vous ne voulez pas, par exemple « seulement les éliminations » ou « seulement l’équipe Rouge ». [Filtres](filters.md)

## Replay {#replay}

**Figurine.** Un petit modèle d’un char, d’un avion, d’une voiture ou d’un soldat qui se déplace là où les données disent qu’il était. [Figurines](figures.md)

**LOD (niveau de détail).** Chaque figurine a une version détaillée, une version plus simple et une version très simple. Les figurines proches utilisent la détaillée, les lointaines la simple, si bien que des milliers peuvent être dessinées d’un coup. [Figurines](figures.md)

## Course {#racing}

**Tour.** Un parcours complet du circuit, de la ligne jusqu’à la ligne. [Charger des tours](race-loading-laps.md)

**Tour de référence.** Le tour auquel tous les autres sont comparés. Les écarts s’affichent comme « plus rapide » ou « plus lent » que lui. [Charger des tours](race-loading-laps.md)

**Corde.** Le point d’un virage où la voiture est la plus proche du bord intérieur. [Analyse virage par virage](race-corner-analysis.md)

**Glissement.** La quantité dont un pneu dérape. Un peu de glissement donne le plus d’adhérence ; trop, et la voiture chasse. [Analyse de course : la méthode](race-analytics.md)

**Enveloppe.** Ce qu’une voiture peut faire à chaque vitesse : jusqu’à quel point elle peut tourner, freiner et accélérer avant de déraper. [Analyse de course : la méthode](race-analytics.md)

## Chiffres des avions {#aircraft-numbers}

**ALT.** Altitude : la hauteur au-dessus du sol ou du niveau de la mer. [Replay de match](match-replay.md#labels-and-statistics)

**TAS.** Vitesse vraie : la vitesse à laquelle un avion se déplace dans l’air. [Replay de match](match-replay.md#labels-and-statistics)

## Ordinateur {#computer}

**GPU.** La carte ou la puce graphique. Elle dessine l’image et est bien plus rapide que le processeur principal pour dessiner des millions de taches. [Les deux moteurs](backends.md)

**WebGPU / WebGL2.** Les deux façons qu’a un navigateur de laisser une page utiliser le GPU. WebGPU est plus récent. La visionneuse peut utiliser l’un ou l’autre et choisit le meilleur que votre navigateur possède. [Les deux moteurs](backends.md)

## Mots de Counter-Strike {#counter-strike-words}

**Manche.** Un court combat à l’intérieur d’un match. Un camp le gagne, et le score monte d’un point.

**Éco, achat forcé, achat complet.** Combien d’argent un camp dépense en armes au début d’une manche. Une éco économise et n’achète presque rien (moins de 1 500 $ par joueur en moyenne). Un achat forcé dépense ce qu’il a (moins de 4 000 $). Un achat complet achète tout ce qu’il peut. [Analyse de match](match-analysis.md)

**Échange.** Une élimination qui en rembourse une : vous êtes touché, et un coéquipier tue votre tueur dans les 5 secondes. [Analyse de match](match-analysis.md)

**KAST.** La part des manches dans lesquelles un joueur a eu une élimination, une assistance, a survécu ou a été échangé. Plus ce nombre est élevé, plus le joueur a aidé dans de manches. [Analyse de match](match-analysis.md)

**ADR.** Dégâts moyens par manche : la quantité de vie qu’un joueur a perdue face aux ennemis à chaque manche. [Analyse de match](match-analysis.md)
