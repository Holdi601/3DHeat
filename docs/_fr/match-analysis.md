---
title: "Analyse de match (CS2)"
nav_order: 10
lang: "fr"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: true
---


# Analyse de match (Counter-Strike 2)

L'onglet **Match** rejoue un enregistrement sous forme de figurines, et pour un match de Counter-Strike 2 il montre aussi le tableau des scores : qui a gagné chaque round, comment, et qui a fait les frags. Utilisez-le pour revoir un match round par round, puis sautez au même moment dans la carte de chaleur.

L'onglet Match rejoue n'importe quel enregistrement sous forme de figurines : un enregistrement War Thunder ou Tacview, ou une démo CS2, listé sous **Matchs du replay** ([Replay de match](match-replay.md)). Un fichier CS2 `.match.json` ajoute le tableau des scores décrit sur cette page.

## Revoir un match CS2 {#review-a-cs2-match}

1. Convertissez la démo ([plus bas](#where-the-data-comes-from)) en un fichier `.parquet` et un fichier `.match.json`.
2. Dans l'onglet **Carte de chaleur**, chargez le fichier `.parquet` sous **Source**.
3. Ouvrez l'onglet **Match** et cliquez sur **Charger des matchs…**, ou déposez le fichier `.match.json` sur la vue.
4. Cliquez sur un match dans **Résumés de match**, puis sur une case de la bande des rounds pour ouvrir ce round.
5. Cliquez sur **Afficher le round** pour voir ce round dans la carte de chaleur, ou sur **Rejouer le round** pour le regarder sous forme de figurines.

![L'onglet Match : bande des rounds avec un round ouvert, fil des frags et tableau des scores](../assets/img/en/match-analysis-round.webp)

Les termes comme KAST, ADR, éco, achat forcé et trade sont dans le [glossaire](glossary.md#counter-strike-words).

## D'où viennent les données {#where-the-data-comes-from}

Le convertisseur de démos de [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
transforme les démos en deux fichiers par match, dans un dossier par carte :

```bash
python -m heat3d_cs2 demos <fichiers de démo ou dossiers> -o out
```

| Fichier | Chargé dans | Contenu |
|---|---|---|
| `<match>.parquet` | l'onglet **Carte de chaleur** (panneau Source, comme tout Parquet : un fichier, plusieurs, ou le dossier entier) | la position de chaque joueur huit fois par seconde, et chaque événement où il s'est produit : frag, mort, blessure, tir, lancer, fumigène, flash, HE, molotov, leurre, aveuglement, pose de bombe, désamorçage, explosion ; avec `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, direction du regard, `weapon`, `place`, `opening`, `traded` … |
| `<match>.match.json` | l'onglet **Match** | équipes, score, chaque round (vainqueur, comment, économie, la pose, chaque frag dans l'ordre, les clutchs, les survivants), la ligne du tableau des scores de chaque joueur |

Le pied de page du fichier Parquet porte des instructions de lecture (clé `heat3d`), donc il s'ouvre sans rien régler : le joueur comme personne, le camp comme groupe, chaque round (`roundId`, « <match> #NN ») comme session, la direction du regard activée, et le monde dans le bon sens (le monde de CS2 est droitier avec Z vers le haut ; lu avec la correspondance Z-vers-le-haut par défaut, il sortirait en miroir). Voir [Mappage des colonnes](column-mapping.md) et [Charger des fichiers](loading-files.md).
`python -m heat3d_cs2 map <carte>` exporte la géométrie de la carte dans le même repère, à charger dans **Niveau**.

Les conventions derrière les chiffres sont celles du convertisseur (énoncées dans son README et reprises dans chaque résumé) : un mort est **tradé** lorsque son tueur est abattu par un coéquipier de la victime dans les **5 s** ; le **KAST** est la part des rounds avec un frag, une aide (une aide au flash compte), une survie ou une mort tradée ; les **dégâts** sont les points de vie réellement perdus, ennemis seulement ; un **clutch** consiste à être le dernier vivant d'un camp face à des ennemis encore debout, gagné lorsque le camp gagne ; l'**achat** de chaque camp vient de la valeur moyenne de l'équipement à la fin du temps de gel : le premier round de chaque moitié réglementaire est un round au pistolet (aucun en prolongation), puis sous 1 500 $ un éco, sous 4 000 $ un achat forcé, au-delà un achat complet.

## L'onglet {#the-tab}

La barre latérale de l'onglet Match contient en haut le sélecteur de mode de la carte de chaleur et le choix de session, puis les sections du match en dessous, puis les panneaux **Filtres**, **Niveau** et **Caméra** de la carte de chaleur : la vue est la carte de chaleur de ce qui est chargé dans l'onglet Carte de chaleur.

### Résumés de match {#match-summaries}

| Réglage | Effet |
|---|---|
| **Charger des matchs…** | choisit des fichiers `.json` (plusieurs à la fois) : les résumés `.match.json` |
| déposer sur la vue | les fichiers JSON déposés sur la vue pendant que l'onglet Match est ouvert se chargent de la même façon (les autres fichiers sont ignorés) |
| **Effacer** | retire chaque match |
| **Tous les matchs** (à partir de deux) | « N matchs, M rounds » : les statistiques de tous |
| une ligne de match | « TeamA 13 contre TeamB 9 », carte · N rounds : ouvre ce match |

Un fichier est accepté lorsqu'il est du JSON avec `"format": "heat3d-cs2-match"` et les tableaux `rounds`, `players` et `teams`. Les erreurs sont listées sous les boutons : « <fichier> : pas du JSON », « <fichier> : pas un résumé de match CS2 (heat3d-cs2-match) », « <fichier> : rounds, players ou teams manquant ». Un match chargé de nouveau (même nom `match`) remplace le précédent. Les matchs sont triés par carte, puis par nom. Lorsqu'un seul match est chargé, il s'ouvre ; sinon la sélection reste (tous les matchs par défaut).

Sans rien de chargé, la section explique : convertissez avec `python -m heat3d_cs2 demos`, chargez ici les fichiers `.match.json` et, dans l'onglet Carte de chaleur, les fichiers `.parquet`.

### Match (un match ouvert) {#match-one-match-open}

**L'en-tête :** les deux équipes avec leur score, la carte, les moitiés - « moitiés 7-5, 6-6 » : rounds 1 à 12 et 13 à 24 (en jeu premier et compétitif MR12 ; la durée de moitié propre au résumé lorsqu'il l'indique, donc 1 à 15 et 16 à 30 pour MR15) - puis, lorsque le match est allé en prolongation, son score à part : « prolongation 4-2 », les rounds après les deux moitiés. Un round nul ne compte pour aucune équipe. Et « N rounds coupés dans la démo » lorsque le résumé liste des rounds incomplets.

**La bande des rounds :** une case par round, colorée selon le camp qui a gagné, avec son numéro et une marque sur la façon dont il s'est terminé. Un round nul (sans vainqueur) est une case grise neutre marquée `=`, jamais de la couleur d'un camp ; son info-bulle dit « Round 30 : égalité - aucun camp ne l'a gagné ».

| Marque | Terminé par |
|---|---|
| B | bombe explosée |
| D | bombe désamorcée |
| K | éliminés |
| T | temps écoulé |
| S | reddition |
| = | égalité |
| ? | autre |

Une séparation marque le début de la deuxième moitié (round 13, ou le round après la durée de moitié du résumé) et de chaque demi-prolongation de trois rounds (rounds 25, 28, 31, …). Survolez une case : « Round 7 : TeamA (T) - bombe explosée, posée en A » (« …, posée, site inconnu » lorsque le résumé n'a pas de site) et l'achat et la valeur d'équipement des deux camps. Cliquez pour ouvrir le round ; cliquez à nouveau pour le fermer (« Cliquez sur un round pour ses frags, son économie et son replay. »).

**Le round :**

- « Round 7 : <équipe> a gagné - <comment> » (« Round 30 : égalité - aucun camp ne l'a gagné » pour une égalité) et la durée du round (de la fin du gel à la décision, m:ss) ;
- l'économie : l'équipe de chaque camp, l'achat (pistolet, éco, achat forcé, achat complet) et la valeur d'équipement (« 4 350 $ ») ;
- la pose : site, joueur et temps dans le round (depuis l'une ou l'autre version du résumé) ; « Posée par <joueur> à 1:05, site inconnu » lorsque le site n'est pas connu ;
- **le fil des frags**, dans l'ordre : temps dans le round, attaquant (à la couleur de son camp ; « world » lorsqu'il n'y a pas d'attaquant), arme, et drapeaux - **HS** tir à la tête, **WB** à travers un mur, **SM** à travers une fumée ; **open** le premier frag du round, **trade** (vengé un coéquipier dans les 5 s), **traded** (le tueur a été abattu dans les 5 s), **team** un frag entre coéquipiers (un suicide n'est pas compté). Les frags après que le round a été décidé sont atténués ;
- les clutchs : « <joueur> (T) seul contre 3 : clutch gagné » / « perdu » ;
- qui était vivant à la fin, par camp (« personne ») ;
- **Afficher le round** : tout ce qui se passe dans ce round, dans la carte de chaleur ;
- **Rejouer le round** : rejoue le round sous forme de boîtes, depuis son début (plus bas).

Les boutons **Afficher dans la carte de chaleur** (voir [plus bas](#show-in-the-heatmap)) concernent ce match, ou le round ouvert.

### Tableau des scores {#scoreboard}

Un tableau par équipe, une ligne par joueur :

| Colonne | Contenu |
|---|---|
| K, D | frags, morts |
| A | aides, aides au flash comprises |
| ± | frags moins morts (vert au-dessus de 0, rouge en dessous) |
| ADR | dégâts par round, points de vie réellement perdus |
| KAST | % de rounds avec un frag, une aide, une survie ou une mort tradée |
| HS | % de frags à la tête |
| Open | duels d'ouverture gagnés-perdus |
| Cl | clutchs gagnés/joués |

Survolez un joueur : frags tradés, fois tradé, aides au flash, ennemis aveuglés, dégâts des équipements, et rounds à frags multiples (« 2×3k »). **Cliquez sur un joueur** pour ses frags et ses morts dans la carte de chaleur (ce match).

### Entre les matchs (Tous les matchs) {#across-matches-all-matches}

Sur tous les matchs chargés :

- « N matchs · M rounds · <cartes> », et « N rounds nuls, gagnés par aucun camp » lorsqu'il y a des égalités ;
- **Manches gagnées** par camp : au total, sur les rounds **pistolet** (les rounds au pistolet du résumé), et sur les achats **éco**, **forcé** et **complet** (chacun en pourcentage avec les rounds joués ; survolez pour « gagnés sur joués »). Un round nul est joué par les deux camps et gagné par aucun ;
- **Bombe** : poses par site, et combien de fois le camp T a ensuite gagné ces rounds (« 12 poses en A (T a gagné 67 %) »), les poses dont le site n'est pas connu du résumé à elles seules (« 2 poses sur un site inconnu (T a gagné 50 %) »), ou « jamais posée » ; comment les rounds se sont terminés, le plus fréquent d'abord ;
- « Le camp qui a fait le premier frag a gagné N % de ces rounds. » (un suicide n'est pas un frag d'ouverture ; un round nul ne transforme aucune ouverture) ;
- **Duels d'ouverture, où** : les dix lieux avec le plus de frags d'ouverture (selon l'endroit de la victime ; les noms de lieux du jeu rendus lisibles, « TopofMid » → « Top of Mid »), les duels et la part gagnée par le camp T ;
- **Joueurs** : les quinze meilleurs au frags moins morts, cumulés sur tous leurs matchs (identifiés par Steam ID) : matchs, K-D, ADR et KAST pondérés par les rounds joués, % HS pondéré par les frags, duels d'ouverture. **Cliquez sur un joueur** pour ses frags et ses morts sur tous les matchs dans la carte de chaleur.

Les boutons Afficher dans la carte de chaleur de tous les matchs chargés se trouvent sous cette section.

## Afficher dans la carte de chaleur {#show-in-the-heatmap}

Chaque lien règle les **filtres** propres à la carte de chaleur, pour que ce qui est affiché reste visible et modifiable dans le panneau Filtres ; **Tout afficher** les efface. Ils agissent sur la table de la carte de chaleur chargée dans l'onglet Carte de chaleur ; l'onglet Match ne la charge jamais lui-même.

| Bouton | Événements affichés |
|---|---|
| **Positions** | `position` - où se trouvaient les joueurs, huit fois par seconde |
| **Frags** | `kill` - où se tenait le tueur |
| **Morts** | `death` - où est tombée la victime |
| **Opening kills** | `kill` et `death` avec `opening` = 1 - le premier frag de chaque round, là où les deux se tenaient (proposé seulement lorsque la table a une colonne `opening`) |
| **Fumées** | `smoke` - où les fumigènes sont tombés |
| **Flashs** | `flash` - où les flashs ont explosé |
| **Molotovs** | `molotov` - où les molotovs et incendiaires ont brûlé |
| **HE** | `he` - où les grenades HE ont explosé |
| **Plants** | `plant` - où la bombe a été posée |
| **Tirs** | `shot` - d'où les tirs ont été faits |

La portée dépend de l'endroit où se trouvent les boutons : tous les matchs chargés, ce match, ou ce round (« Afficher dans la carte de chaleur - round 7 »).

Ce qui ne peut pas être appliqué est dit sous les boutons, au lieu d'être filtré en silence jusqu'à ne plus rien : « aucune colonne de match conservée - match non appliqué », « match : X absent des données chargées », de même pour le round et les événements, « joueur X absent des données chargées », « camp X absent des données chargées », « aucune donnée de carte de chaleur chargée : chargez les fichiers .parquet des matchs dans l'onglet Carte de chaleur ». Sans données chargées, les liens disent aussi « Chargez les fichiers .parquet des matchs dans l'onglet Carte de chaleur pour les voir sur la carte. »

**Rejouer le round** bascule en plus la carte de chaleur sur le **Replay en boîtes**, la frise en mode *lecture* avec sa fenêtre réglée sur *durée de vie*, se place au début de la session du round et lance la lecture. Lorsque le round n'est pas une session des données chargées : « ce round n'est pas une session des données chargées : rien à rejouer ».

## Pour les développeurs {#for-developers}

Code : [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versions du résumé {#summary-versions}

L'onglet lit côte à côte les résumés de version 1 et de version 2 (`"version"` dans le fichier), et les traite de la même façon :

| | Version 2 | Version 1 |
|---|---|---|
| temps de pose | secondes dans le round, comme les frags | secondes du match ; l'onglet soustrait le début du round |
| site de pose | `A` ou `B` ; vide lorsque la démo ne le dit pas | `A`, `B`, ou un numéro d'entité - lu comme site inconnu |
| durée de moitié | `halfLength`, depuis l'endroit où les camps changent de côté pour la première fois ; 12 lorsqu'il est nul | 12 (MR12) |
| rounds au pistolet | `pistolRounds` (le round 1 et le premier round après la moitié) | les rounds dont l'achat est `pistol` |
| round nul | `winner` et `winnerTeam` vides | - |
| suicide | `suicide` sur le frag, jamais un frag entre coéquipiers | repéré lorsque l'attaquant et la victime sont le même joueur |

Le `noscope` et l'`attackerBlind` d'un frag (version 2) ne sont pas affichés dans l'onglet Match, qui n'affiche pas non plus de lieu venant de la table de la carte de chaleur ; la case `place` vide d'une ligne de grenade n'y change donc rien.

Comment un point de mise au point devient des filtres (`focusFilters`) :

- **match** → un filtre de catégorie sur la colonne `match` ;
- **round** → un filtre d'intervalle `round` = N sur une colonne `round` numérique (un filtre de catégorie sur une colonne catégorielle), et la session du round (`<match> #NN`) est sélectionnée dans le choix de session ;
- **events** → un filtre de catégorie sur la colonne `event` ;
- **player** → un filtre de personne sur ce joueur ;
- **side** → un filtre de groupe.
