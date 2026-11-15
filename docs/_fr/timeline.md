---
title: "Chronologie et lecture"
nav_order: 5
lang: "fr"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Chronologie et lecture

La barre sous l'image fonctionne comme un lecteur vidéo : vous pouvez lire les données comme un film, les mettre en pause, faire des sauts et changer la vitesse.

![La barre de chronologie : 1 Tout/Lecture, 2 boutons de transport, 3 horloge, 4 Vitesse, 5 Historique, avec Fenêtre et une Plage de 30 s](../assets/img/en/timeline-bar.webp)

La barre sous la vue est la chronologie ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Elle décide quelles lignes sont visibles à chaque instant. Elle exige une colonne de temps ; sans elle, toute la barre est désactivée, la vue reste en **Tout**, et la barre latérale indique *Pas de colonne de temps dans ces données - la chronologie est désactivée et chaque point de données est affiché d'un coup.*

## Tout et Lecture {#all-and-play}

Deux modes principaux, car ils répondent à des questions différentes.

- **Tout** (le mode par défaut à chaque chargement) ignore entièrement la tête de lecture et affiche chaque ligne qui passe les filtres. C'est la vue « où cela arrive », et ce n'est pas la même chose que d'avancer jusqu'à la fin. La barre de défilement est désactivée et l'horloge affiche `tout · <span> de données`.
- **Lecture** joue les données en accéléré. La barre de défilement, le transport et les réglages d'historique apparaissent.

Choisir **Tout** arrête aussi la lecture.

## Les commandes {#the-controls}

| Commande | Par défaut | Signification |
|---|---|---|
| Barre de défilement | le début | La tête de lecture. Faites-la glisser pour vous déplacer ; 20 000 pas sur la plage. |
| **Tout** / **Lecture** | Tout | Voir ci-dessus. |
| ▶ / ❚❚ | en pause | Lire ou mettre en pause ; aussi `K`. |
| ◀ **Lecture arrière (J)** | | Joue les données à l'envers. Affiché seulement dans le mode **Figurines superposées** ; la même touche `J` y fonctionne aussi (voir [Clavier](#keyboard)). |
| ⏮ | | Retour au début de la plage. |
| Horloge | | `écoulé / total` au format `mm:ss.s` (ou `h:mm:ss`) et, lorsque la colonne de temps est un horodatage absolu, l'heure réelle de la tête de lecture au format `HH:MM:SSZ` (UTC). |
| **Vitesse** | 1× | Secondes de données par seconde réelle. Le menu propose 17 paliers de 0,01× à 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Personnalisée…** : tapez n'importe quelle vitesse de 0,001× à 3600× (par exemple 0,3 ou 12) et appuyez sur Entrée ; Échap garde la vitesse en cours. La dernière vitesse est mémorisée pour la visite suivante (voir [Réglages enregistrés](ref-settings-storage.md)). |
| **Historique** | Cumulé | Ce qui compte comme visible à la tête de lecture : *Cumulé*, *Fenêtre* ou *Durée de vie* (ci-dessous). |
| **Plage** (Fenêtre ; en mode Lignes aussi Durée de vie) | 30 s | Longueur de la fenêtre qui finit à la tête de lecture ; au moins 0,01 s. Dans la [Chaleur linéaire](line-heat.md#playback), c'est la longueur de la traînée. |
| **Durée de vie par défaut** (Durée de vie seulement, pas en mode Lignes) | 10 s | Durée pendant laquelle un point de données sans échantillon suivant de sa personne reste visible. |
| **Fondu** (Durée de vie seulement, pas en mode Lignes) | 0,4 | Fraction de la vie de chaque point de données consacrée à son estompage, de 0 à 1. |
| **Boucle** | activé | À la fin, repartir du début ; désactivé, on s'arrête à la fin. |
| Côté droit | | Le nom du jeu de données. |

La **plage** est l'étendue temporelle du jeu de données - ou, dans la [superposition de figurines](box-replay.md) avec une session sélectionnée, l'étendue de cette session.

## Historique {#history}

En mode Lecture :

- **Cumulé** - tout ce qui va du début de la plage jusqu'à la tête de lecture. La chaleur se constitue au fil de la lecture.
- **Fenêtre** - une étendue fixe d'historique qui finit à la tête de lecture (*Plage*).
- **Durée de vie** - chaque point de données vit jusqu'au **prochain échantillon de la même personne** (dans la même session), si bien qu'exactement une position par personne est courante à tout instant. Un point de données dont la personne n'apparaît plus jamais - une mort, une déconnexion, la fin du journal - n'a pas de prochain échantillon, et vit pendant la *Durée de vie par défaut* au lieu de disparaître aussitôt ou de persister indéfiniment. Les points de données **s'estompent** sur la dernière fraction *Fondu* de leur vie au lieu de disparaître brusquement : avec un échantillon vivant par personne, un point qui disparaît d'une image à l'autre fait scintiller tout le champ au rythme des échantillons. *Fondu* à 0 rétablit la coupure nette.

La Durée de vie exige une colonne de personne en plus de la colonne de temps ; sans elle, l'historique revient à Cumulé au chargement. Dans la [Chaleur linéaire](line-heat.md#playback), l'historique règle la durée pendant laquelle la traînée d'un trajet reste visible ; dans la [superposition de figurines](box-replay.md), la *Durée de vie par défaut* est le temps pendant lequel une personne sans autre échantillon est maintenue.

## Comportement de la lecture {#playback-behaviour}

Depuis la boucle d'image ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)) :

- La tête de lecture avance de *temps d'image × vitesse*. Le temps d'image est plafonné à 0,1 s, de sorte qu'un changement d'onglet ne téléporte pas la tête de lecture.
- Appuyer sur lecture à la toute fin de la plage repart du début, comme dans un lecteur multimédia. À chaque chargement, la tête de lecture est placée au début, si bien que le premier appui sur lecture lance la lecture.
- À la fin de la plage, la tête de lecture revient au début (Boucle activée) ou s'arrête là et la lecture se termine (Boucle désactivée).
- La barre de défilement lit directement la tête de lecture du moteur à chaque image ; l'état de l'application est mis à jour lors des déplacements, des démarrages, des arrêts et des bouclages.
- Choisir une session dans le sélecteur de session amène au début de cette session.

## Pourquoi la lecture est fluide et peu coûteuse {#why-playback-is-smooth-and-cheap}

Les lignes sont stockées triées par temps, si bien qu'une fenêtre temporelle se réduit à deux recherches dichotomiques sur la colonne de temps : faire avancer la tête de lecture ne déplace que deux entiers et ne touche aucune ligne, et le coût de la lecture suit le nombre de lignes dans la fenêtre, non la taille du jeu de données.

La façon dont la chaleur reste stable pendant que la fenêtre se déplace dépend de l'historique ([Accumulation](accumulation.md)) :

- **Cumulé** ne fait que croître ; chaque image ajoute donc seulement les lignes devenues visibles depuis la précédente, avec leur plein poids. Le champ se construit de façon monotone, et la pause ne change rien, car il ne reste rien à arriver. (Réestimer à la place ferait éclairer à chaque image un sous-ensemble aléatoire différent, puis le ferait disparaître, ce qui se voit comme des rafales qui s'allument et s'éteignent.)
- **Fenêtre** et **Durée de vie** changent réellement à chaque image et sont réestimés, mélangés en moyenne mobile exponentielle (poids 0,34 pour la nouvelle image), qui n'est pas biaisée en régime établi et bien plus calme que de repartir de zéro.
- En mode Durée de vie, les lignes candidates vont de *tête de lecture - max(plus long trou dans les données, Durée de vie par défaut)* jusqu'à la tête de lecture ; le shader écarte ensuite chaque ligne dont la vie propre est terminée et applique le fondu.

Passer de Tout à Lecture (ou l'inverse), ou changer l'historique, relance l'accumulation.

## Clavier {#keyboard}

| Touche | Effet |
|---|---|
| `K` | Lecture / pause |
| `J` | Lecture arrière ; un nouvel appui met en pause (Figurines superposées seulement) |
| `L` | Lecture avant ; un nouvel appui met en pause (Figurines superposées seulement) |

`J` et `L` basculent aussi la chronologie sur **Lecture**. Les touches sont ignorées lorsqu'une zone de texte ou un menu a le focus. Dans l'onglet Analyse de course, `K` pilote le replay propre à cet onglet.
