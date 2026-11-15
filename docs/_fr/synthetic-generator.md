---
title: "Générateur synthétique"
parent: "Importer des données"
nav_order: 5
lang: "fr"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Générateur synthétique

Pas de données à vous ? Appuyez sur un bouton et 3DHeat invente pour vous une bataille fictive, aussi petite ou aussi grande que vous voulez.

1. Ouvrez le panneau **Jeu de données** dans la barre latérale de la Carte de chaleur (sous **Source**).
2. Faites défiler jusqu'à **Générateur synthétique**.
3. Réglez **Lignes (millions)**. Essayez 1 d'abord : la valeur par défaut de 8 millions est lourde pour un premier essai.
4. Appuyez sur **Générer**.

![1 million de lignes, 8 équipes, dessinées dans la Chaleur par équipe](../assets/img/en/synthetic-generator-team-heat.webp)

Le panneau **Jeu de données** peut générer un jeu de données au lieu d'en charger un. Il sert à deux choses : essayer la visionneuse sans données à vous, et vérifier si un nombre donné de lignes, un rayon de sprite et un budget gardent une fréquence d'images utilisable sur une machine, *avant* d'y charger un grand jeu réel. Son mouvement ressemble à une partie de bataille royale : les équipes commencent séparées, puis sont resserrées. Un bruit uniforme paraît correct à n'importe quel budget et cache justement les défauts qui valent la peine d'être repérés.

## Commandes {#controls}

| Commande | Défaut | Sens |
|---|---|---|
| **Lignes (millions)** | 8 | Lignes à générer. Arrondi à un nombre entier de pas de temps pour chaque joueur. |
| **Équipes** | 8 | Nombre de groupes (au moins 1). |
| **Par équipe** | 12 | Joueurs par groupe (au moins 1). |
| **Demi-étendue de la carte (m)** | 4 000 | Moitié de la largeur de la zone de jeu sur X et Z. |
| Ligne d'estimation | | « ≈ X Go de RAM, Y Go sur le GPU après quantification. » (environ 26 octets de RAM et 8 octets sur le GPU par ligne). |
| **Générer** | | Génère dans le travailleur d'ingestion, avec la progression, et remplace le jeu de données chargé. |

La génération tourne dans le travailleur en arrière-plan : des dizaines de millions de lignes ne figent donc pas la page.

## Ce qui est généré {#what-it-generates}

D'après [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts) :

- **Colonnes :** position, temps, personne (`P000`, `P001`, ...), groupe (`Team 1`, `Team 2`, ...), lacet et tangage, et durées de vie. Pas de colonne de session ni de colonne de filtre.
- **Temps :** un échantillon par joueur toutes les 0,25 s, à partir de 0 (temps relatif, pas d'horloge réelle).
- **Mouvement :** chaque équipe commence dans son propre secteur d'un anneau, à 55-95 % de la demi-étendue. Un cercle sûr centré près du milieu (décalé au hasard jusqu'à un quart de la demi-étendue) se rétrécit jusqu'à 8 % de la demi-étendue en six phases avec des paliers. Chaque joueur se dirige vers un point errant à l'intérieur de ce cercle, avec amortissement et bruit. La hauteur ondule entre 0 et 220 m.
- **Direction du regard :** lacet dans le sens du déplacement, tangage d'après la vitesse verticale.
- **Reproductible :** la graine aléatoire est fixe (1337). Les mêmes réglages donnent donc toujours les mêmes données.

Chaque mode de chaleur, le replay de boîtes et la chaleur linéaire (trajets entiers, puisqu'il n'y a pas de colonne d'événement) fonctionnent dessus. L'historique de durée de vie fonctionne aussi.
