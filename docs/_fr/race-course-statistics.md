---
title: "Statistiques du parcours"
parent: "Analyse de course"
nav_order: 57
lang: "fr"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistiques du parcours

Chargez beaucoup de tours d'un même circuit et la visionneuse compte les erreurs : quel virage coûte le plus de temps, combien de tours ont mal tourné là, et pourquoi. Servez-vous-en pour trouver le virage qui vaut la peine d'être travaillé.

Essayez : **Tours de démo** donne trois tours, assez pour que cette section apparaisse.

![Statistiques du parcours avec la carte des erreurs : le circuit peint selon le nombre de tours qui ont perdu du temps dans chaque virage, et la liste des virages](../assets/img/en/race-course-mistake-map.webp)

Chargez le dossier entier d'un parcours — des dizaines de tours, plusieurs voitures, plusieurs classes de performance — et chaque tour est jugé, puis compté. Cette page couvre la comparaison par classe, ce qui compte comme une erreur, la section **Statistiques du parcours**, la carte des erreurs, l'export vers la carte de chaleur, les parcours de plusieurs circuits et les limites de performance avec beaucoup de tours.

## Face au meilleur de sa propre classe {#against-the-best-of-its-own-class}

Un tour est comparé virage par virage au **tour complet le plus rapide de sa propre classe de performance** (la référence, dans la classe de la référence) ; ce tour-là est comparé à celui de sa classe qui a été le plus rapide dans chaque virage, ou à tous les tours s'il est seul dans sa classe. Les voitures sont regroupées par classe de performance du jeu (dans Forza, de D à X ; C et S2 en sont deux). Le point de freinage d'une voiture de classe C comparé à celui d'une voiture S2 ne dit rien sur la conduite. La carte des temps, les écarts dans la liste des tours et le tableau *Virage par virage* suivent cette même comparaison (voir [à qui chaque tour est comparé](race-corner-analysis.md#who-each-lap-is-compared-with)).

Les statistiques sont construites sur l'analyse de chaque tour, et non à côté.

## Ce qui compte comme une erreur {#what-counts-as-a-mistake}

Une **occurrence** est l'erreur d'un tour dans un virage (segment). Les erreurs d'un tour dans un virage sont :

1. **La cause de conduite** trouvée par l'analyse pour sa perte là — une constatation qui est une perte, imputée au pilote (et non à la voiture ou à la situation), coûtant **0,05 s** ou plus par rapport à son tour de comparaison. Son coût est la perte du virage.
2. **Chaque faute de contrôle de la voiture** commise là et que l'autre tour n'a pas faite (non partagée), coûtant **0,03 s** ou plus — blocage, patinage, arrière qui décroche, sous-virage, tête-à-queue. Son coût est celui de l'événement lui-même.
3. **Chaque choc et accident**, partagé ou non, quel qu'en soit le coût.

Un virage peut en contenir plusieurs ; chaque sorte n'est comptée **qu'une fois par tour et par virage**. Les gains, la part de la voiture et une arrivée plus lente décidée dans le virage précédent ne sont pas des erreurs.

### Des constatations aux erreurs {#from-findings-to-mistakes}

| Constatation | Erreur |
|---|---|
| trop vite à l'entrée, lent à la sortie, pour avoir freiné de plus de quelques mètres plus tard que l'autre | Freiné trop tard |
| freiné tôt | Freiné trop tôt |
| freiné doucement | Freiné trop doucement |
| un blocage comme cause | Bloqué une roue |
| roulé sans gaz | Roulé sans gaz |
| de l'adhérence en réserve, plus lent au point de corde, freiné là où l'autre a seulement levé le pied | Trop lent au milieu |
| une trajectoire trop serrée | Trajectoire trop serrée |
| poussé vers l'extérieur | Poussé vers l'extérieur |
| tourné la voiture moins / trop | Mal tourné la voiture |
| sur la puissance plus tard, pleins gaz plus tard, hésité | Gaz remis tard |
| plus lent en sortie de virage | Plus lent en sortie |
| patinage | Patinage |
| l'arrière a décroché, en travers au milieu | Arrière décroché |
| sorti large | Sorti large |
| perdu de la vitesse | Perdu de la vitesse |
| levé le pied (à l'entrée, ou en ligne droite) | Levé le pied |
| un quasi-arrêt, un tête-à-queue, un choc ou un accident comme cause | Tête-à-queue / Heurté quelque chose / Accidenté quand les événements du tour à cet endroit le disent (accident d'abord, puis tête-à-queue, puis choc) ; sinon Quasi arrêté |
| un vol plus long | Trop long en l'air |

Les deux schémas sont comptés comme la cause trouvée à l'intérieur, par le même tableau. *A donné plus à l'entrée que la sortie n'a repris* est l'erreur de la cause de son entrée : freinage tôt donne *Freiné trop tôt*, un blocage *Bloqué une roue*, le roulage sans gaz *Roulé sans gaz*, l'adhérence inutilisée *Trop lent au milieu*. *Trop vite à l'entrée, lent à la sortie* est *Freiné trop tard* quand le tour a freiné plus tard que l'autre ; sinon l'erreur de la cause de sa sortie — *Gaz remis tard*, *Patinage*, *Arrière décroché*, *Sorti large*, *Plus lent en sortie*. Un schéma dont la cause est la voiture, ou une arrivée plus lente, n'est pas compté.

Non compté : l'arrivée plus lente, le départ, chaque constatation *voiture* (tirer, adhérence, freins, transmission) et chaque virage de gain ou de niveau.

### Les sortes, dans leur ordre {#the-kinds-in-their-order}

Freinage : *Freiné trop tard*, *Freiné trop tôt*, *Freiné trop doucement*, *Bloqué une roue*. Entrée : *Roulé sans gaz*, *Trop lent au milieu*, *Trajectoire trop serrée*, *Poussé vers l'extérieur*, *Mal tourné la voiture*. Sortie : *Gaz remis tard*, *Plus lent en sortie*, *Patinage*, *Arrière décroché*, *Sorti large*, *Perdu de la vitesse*. Ligne droite : *Levé le pied*. Incidents : *Tête-à-queue*, *Heurté quelque chose*, *Accidenté*, *Quasi arrêté*, *Trop long en l'air*.

## La section Statistiques du parcours {#the-course-statistics-section}

Affichée à partir de **3** tours, entre **Tours** et **Où progresser**.

- **Le résumé** : « 40 tours avec 9 voitures, 3 classes : chaque virage jugé face au tour le plus rapide de sa classe. » (les voitures comptées par numéro, ou par nom).
- **Pastilles de classe** (avec plusieurs classes) : **Tout** et une pastille par classe, chacune avec son nombre de tours, dans l'ordre du jeu (D, C, B, A, S1, S2, R, X, puis les autres). Cliquez sur une classe pour n'avoir que ses tours ; **Maj+clic** ajoute ou retire une classe. Tout ce qui suit — les listes, la carte, l'export vers la carte de chaleur — suit les classes choisies.
- **Les erreurs les plus fréquentes** : chaque sorte d'erreur, avec les tours les plus nombreux en premier (puis les plus nombreuses fois, puis le coût le plus élevé), au maximum 8 (**Tout N sortes** affiche le reste ; **Moins** les masque de nouveau). Chaque ligne : son nom, « N tours sur M », une barre de cette part, et « K fois · environ X s · surtout en T3 (5), T7 (4), T1 (2) » — combien de fois elle a été faite (tour par virage), son coût total, et les trois virages où le plus de tours l'ont faite. **Cliquez sur une ligne** pour la montrer sur la carte des erreurs (et l'activer) ; cliquez à nouveau pour toutes les erreurs.
- **Virage par virage** (ou *Virage par virage - <erreur>* avec une erreur choisie) : pour chaque segment, « N sur M ont perdu du temps · X s » — les tours qui ont parcouru tout le virage, ceux qui y ont perdu **0,05 s** ou plus par rapport au meilleur de leur classe, et tout le temps perdu. Replié, il liste ses trois erreurs les plus fréquentes avec le nombre de tours. **Cliquez sur un virage** pour l'ouvrir, le cadrer avec la caméra et passer à la carte des erreurs : pour chaque erreur (ou seulement celle choisie), une ligne comme « 12 tours sur 40 ont freiné trop tôt ici. Dans 9 voitures différentes — environ 0,21 s chacune. » et les tours qui l'ont faite, **les pires en premier**, chacun avec son coût — au maximum 8, « +N de plus » pour le reste. **Cliquez sur un tour** pour le mettre au point et rejouer cette erreur (alignée 40 m avant).
- **Afficher dans la carte de chaleur** : voir plus bas. « Construction de la carte de chaleur… » pendant le calcul ; désactivé quand il n'y a pas d'erreur.

## La carte des erreurs {#the-mistake-map}

**Vue → Carte des erreurs** peint le long du tracé de référence combien de tours (des classes choisies) ont fait une erreur à chaque mètre — toutes sortes confondues, ou celle choisie dans les statistiques. Chaque tour ne compte qu'une fois par mètre ; la plage de chaque occurrence (là où se trouvaient sa cause ou son événement) est élargie de 6 m de chaque côté pour qu'une courte apparaisse. Plus large et plus vive là où davantage de tours sont passés : largeur `3 + 10 · (tours ici / tours maximum partout)` mètres, couleur d'un brun sombre à un orange vif ; une bande grise de 2 m là où aucun n'est passé. Légende : *peu de tours ↔ le plus de tours*.

Avec **Étiquettes** activé, le point de corde de chaque virage porte son erreur la plus fréquente : « T3 · 12/40 freinage tôt » (tours qui l'ont faite / tours qui ont parcouru le virage), « T3 · 12/40 » avec une sorte choisie, « T3 · propre » sans choix. Survoler une étiquette liste les pertes du virage et ses cinq erreurs les plus fréquentes ; cliquer dessus ouvre ou ferme ce virage dans les statistiques.

## Afficher dans la carte de chaleur {#show-in-the-heatmap}

**Afficher dans la carte de chaleur** transmet la même chose à l'onglet carte de chaleur, comme jeu de données nommé « Erreurs sur <circuit> » (ou « Erreurs sur le parcours »), pour que toute la boîte à outils de la carte de chaleur — modes de chaleur, filtres, chronologie, tranches — fonctionne sur les endroits où les tours tournent mal.

C'est un CSV construit en mémoire (`mistakeTable`), une ligne par point de la grille (tous les 2 m) de chaque occurrence, à la **propre position du tour** à cet endroit :

| Colonne | Contenu |
|---|---|
| `x`, `y`, `z` | la position du tour à ce mètre (coordonnées du jeu) |
| `elapsed` | le temps du tour à cet endroit, s |
| `lap` | le nom du tour |
| `car` | le nom de la voiture (ou « car 1234 ») |
| `mistake` | le nom de l'erreur, dans la langue courante |
| `car_class` | la classe, `-` si aucune |
| `corner` | le nom du virage, `T3` |
| `cost` | le coût de l'occurrence, s |

Il est chargé par le chargeur de la carte de chaleur, avec des indications de mappage : Y vers le haut, sans inversion d'axes, échelle 1 ; temps `elapsed` en secondes ; **personne** = `car`, **groupe** = `mistake`, **session** = `lap` ; pas de direction du regard ; `car_class`, `corner` et `cost` gardés comme colonnes de filtre. L'onglet passe ensuite à **Carte de chaleur** et cadre les données. Seules les classes choisies dans les statistiques sont exportées.

## Parcours de plusieurs circuits {#courses-from-several-tracks}

Les tours sont analysés **un circuit à la fois**. Un dossier qui contient les tours de plusieurs circuits — toute la bibliothèque de tours — propose chaque circuit à charger séparément (avec son nombre de tours, le plus grand en premier) ; les tours de parcours jamais terminés (`unfinished/` de FH Companion) vont avec leur circuit, marqués *partiel*. Les tours de plusieurs circuits nommés choisis comme fichiers sont proposés de la même façon, les tours sans nom de circuit allant avec celui qui est choisi. Charger des tours d'un autre circuit nommé que ceux déjà chargés remplace ceux-ci. Détails : [Charger des tours](race-loading-laps.md#folders-and-courses).

## Performance avec beaucoup de tours {#performance-with-many-laps}

Des dizaines de tours sont analysés en une ou deux secondes (tous, toujours). Ce qui est dessiné est limité pour que la vue reste à la fréquence d'image :

| Limite | Valeur | Effet |
|---|---|---|
| tours dessinés par défaut | 8 (`SHOW_ALL_UP_TO`) | au-delà de 8 tours chargés, les tours ajoutés sont masqués, sauf s'ils sont la référence, le tour mis au point ou le meilleur de leur classe. **Tout afficher** dessine chaque tour ; **Seulement ceux examinés** revient en arrière. Mettre un tour au point le rend visible, ainsi que le meilleur de sa classe |
| voitures simples et lignes fines | plus de 10 visibles (`PLAIN_PAST`) | les tours autres que celui au point, la voiture poursuivie et la référence : un point de ligne tous les 6 m (au lieu de 1,5 m), voitures dessinées simplement |
| tours sur le graphique | 8 (`CHART_LAPS`) | le point, le meilleur de sa classe et la référence d'abord ; « +N de plus dessinés, pas sur le graphique » |
| cartes du HUD | 6 | les six premiers tours visibles |
| statistiques | à partir de 3 tours | la section est masquée en dessous |
| constatations listées | 12 pilote, 8 voiture/contexte, 10 gains | par tour mis au point |
| paires de voitures affichées | 3 | au-delà de 3 paires, une seule paire avec un sélecteur |

Les occurrences d'erreur sont calculées une fois par analyse et mises en cache ; la densité de la carte des erreurs est mise en cache par choix de classes et par erreur.

## Pour les développeurs {#for-developers}

Code : [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` dans [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
