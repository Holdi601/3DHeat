---
title: "Observations"
nav_order: 7
has_children: true
lang: "fr"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Observations

Les **Observations** parcourent les données chargées à la recherche de ce qui ressort - les bonnes positions, les zones mortelles, les pièges de réapparition, les points de goulot, les joueurs très au-dessus de leurs pairs - et vous le disent, du plus fort au plus faible, avec les preuves. Servez-vous-en pour comprendre en une minute où un match a été gagné ou perdu. Elles peuvent ensuite rédiger un bilan et, sur un seul replay, jouer le rôle d'un commentateur qui saute aux grands moments.

Tout est compté dans votre navigateur. Rien ne quitte votre ordinateur, sauf si vous activez une IA externe (voir [IA externe](#external-ai)).

![Observations sur la démo de chars : 14 constats, du plus fort au plus faible](../assets/img/en/insights.webp)

La section **Observations** se trouve dans la barre latérale des onglets Carte de chaleur et Match. Elle comporte trois onglets : **Constats**, **Bilan** et **Commentateur**.

## Constats {#findings}

1. Chargez des données et ouvrez **Observations**. Appuyez sur **Trouver des observations** (« Comptage… n% » indique la progression).
2. Lisez la liste. Chaque constat a une barre de force, une phrase, la qualité des preuves (*Preuves solides*, *Bonnes preuves* ou *Quelques preuves*), le détecteur qui l'a trouvé, et la classe de véhicule lorsque cela compte.
3. **Cliquez sur un constat** : la visionneuse applique ses filtres, fait voler la caméra jusqu'au lieu, saute au moment, et ouvre le détail : l'effet avec son intervalle à 95 %, les valeurs p et q, les preuves comptées, et **Volume ici**, qui trace un [volume](volumes.md) autour du lieu.
4. **Restaurer les filtres** remet vos filtres en place. **Copier le JSON** copie le rapport entier.

Le comptage utilise les filtres en cours, les groupes masqués et le match choisi sur toute la plage temporelle. Si vous modifiez ensuite les filtres, une note le signale ; appuyez sur **Recompter**.

Les lignes en haut de la liste (par exemple les totaux d'argent) résument l'ensemble des données avant les constats.

![Un constat ouvert : la zone chaude des tirs, ses chiffres, et un passage correspondant de la littérature](../assets/img/en/insights-finding.webp)

### Les détecteurs {#the-detectors}

| Détecteur | Ce qu'il trouve | Nécessite dans les données |
|---|---|---|
| **Positions de force** | Lieux où le rapport éliminations/morts est bien meilleur que sur le reste de la carte, et *terrain sûr* où peu de joueurs meurent par rapport au temps passé | événements d'élimination et de mort |
| **Zones chaudes et froides** | Lieux où un type d'événement (tirs, impacts, captures ...) survient beaucoup plus ou beaucoup moins souvent que le temps passé sur place ne le laisse prévoir | une colonne d'événements |
| **Terrain ouvert et couvert** | Morts en terrain découvert face à une géométrie de niveau proche, et lenteur face à un mouvement rapide | morts ; un niveau 3D pour la partie géométrie |
| **Spawns** | Spawns forts, pièges de réapparition, spawns sûrs, temps avant le premier contact | temps et personnes |
| **Classe par lieu** | Une classe de véhicule, ou des joueurs contre l'IA, qui font nettement mieux ou moins bien dans une zone | éliminations plus une colonne de classe de véhicule ou joueur/IA |
| **Joueurs** | Joueurs qui éliminent ou meurent beaucoup plus ou moins que les autres de la même classe | personnes et éliminations |
| **Goulets et flancs** | Points de goulot (bien plus de passages que le terrain autour) et itinéraires de flanc (rarement empruntés, mais menant à des éliminations) | personnes |
| **Valeur** | *Terrain coûteux* et *Terrain rentable* | [colonnes de valeur](value-weighting.md) |

Les détecteurs qui ne peuvent pas tourner sur les données sont listés en bas avec la raison.

### Comment les constats sont classés {#how-findings-are-ranked}

Chaque lieu ou groupe est testé par rapport au reste de la carte (tests binomiaux exacts ou tests de taux). Le taux de fausses découvertes est maintenu à 5 % (Benjamini-Hochberg). Le hasard peut ressembler à un motif ; cela garde les fausses alertes basses : parmi les constats affichés, environ un sur vingt devrait être dû au hasard au plus. Les effets issus de peu d'événements sont ramenés vers « aucun effet » avant le classement. Au plus 60 constats sont listés, et chaque détecteur obtient quelques lieux en haut de liste.

## Bilan {#debrief}

L'onglet **Bilan** rédige les constats sous forme de court texte : une introduction, le constat le plus net, un pour la tactique, un pour l'équilibrage, le reste regroupé par détecteur, et le nombre de constats reposant sur des preuves plus faibles. Chaque paragraphe a des boutons numérotés qui montrent ses constats. **Copier le texte** le copie.

![Le bilan rédigé par le narrateur intégré](../assets/img/en/debrief.webp)

Le narrateur intégré fonctionne hors ligne, dans votre langue. Le sélecteur **Prisme** au-dessus (voir [Le prisme de connaissances](knowledge.md)) décide des ouvrages cités par les paragraphes.

### IA externe {#external-ai}

**Réglages de l'IA** permet à un modèle d'IA de votre choix de rédiger le bilan à la place :

| Réglage | Signification |
|---|---|
| **Fournisseur** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (local), LM Studio (local), serveur llama.cpp (local), ou tout point d'accès compatible OpenAI |
| **URL de base**, **Modèle** | Renseignés par le fournisseur ; **Lister les modèles** interroge le serveur |
| **Clé API** | Envoyée uniquement à l'URL de base. Jamais journalisée, jamais enregistrée dans les vues, exports ou fichiers `.3dheat`. La plupart des serveurs locaux n'en demandent aucune. |
| **Mémoriser la clé dans ce navigateur** | Désactivé par défaut : la clé est oubliée à la fermeture de la page |
| **Utiliser une IA externe** | Désactivé par défaut |
| **Envoyer les noms des joueurs** | Désactivé par défaut : les joueurs sont envoyés sous les noms P1, P2 ... |

Saisissez ensuite une question facultative et appuyez sur **Rédiger avec l'IA**. Seuls les constats et leurs chiffres sont envoyés - jamais les lignes de vos données. La réponse s'affiche au fil de l'écriture ; les constats cités deviennent des boutons.

## Commentateur {#caster}

Pour **un seul match** (choisissez-en un si plusieurs sont chargés), le **Commentateur** trouve les moments qui méritent d'être regardés : premier sang, multi-éliminations, échanges, situations désespérées remportées, bascules d'objectifs, retournements, joueurs qui se démarquent, tirs à longue distance.

![Les moments du commentateur pour une manche de la démo de tireur](../assets/img/en/caster.webp)

- Cliquez sur un moment : la vue passe au replay, saute juste avant, y vole et suit le joueur.
- **Lire les moments** lit chacun jusqu'à sa fin puis passe au suivant ; **Précédent** / **Suivant** parcourent la liste.
- Avec une IA externe activée, **Commentaire par l'IA** rédige un commentaire à partir de la liste des moments (types, heures, noms ou pseudonymes, équipes, classes, distances).

Il exige des personnes et des événements d'élimination/mort (ou de capture) ; une colonne `other`/`victim` rend possibles les échanges et les tirs à longue distance.

## Le prisme de connaissances {#knowledge-lens}

Un constat peut être lu à travers un **prisme** de connaissances établies : doctrine militaire, combat aérien et naval, opérations urbaines, conception de jeux et esport (ou *Auto*, choisi d'après les unités des données). Un constat ouvert affiche alors l'entrée de **doctrine et de littérature** la plus proche et un **parallèle historique**, avec des références, et **Mesures du prisme** calcule à partir de cette littérature des mesures sur les données (ajustements de Lanchester, rapports d'échange, rapports de forces, champs de tir, terrain clé, échanges, initiative). Le bilan et l'invite de l'IA les incluent. Tout ce qui s'y rapporte : [Le prisme de connaissances](knowledge.md).

Les mesures du prisme mesurent aussi la façon dont les joueurs se comportent en foule et en groupe - alignement et tournoiement, guidage des trajets, voies et sentiers, encombrement, meneurs et suiveurs, traînards, point de rupture sous les pertes, risque après une vie perdue, séries, accord sur les achats et réponse aux tirs reçus - chacun face à son propre modèle nul : [Comportement collectif](collective-behaviour.md).

## Les données qui permettent les observations {#data-that-makes-insights-work}

- des positions avec une colonne de **temps**, une colonne de **personne** et une colonne d'**équipe** ;
- une colonne d'**événements** avec les éliminations et les morts (`kill`, `death`), et d'autres (`hit`, `fire`, `capture` ...) ;
- une colonne d'**autre partie** (`other`, `victim`) pour les échanges et les directions ;
- une colonne de **véhicule** ou de **type** pour les classes ; une colonne `ai` pour les joueurs contre l'IA ;
- une colonne de **session** / **match** / **manche** lorsqu'il y a plusieurs matchs.

Les [données de démonstration](demo-data.md) contiennent toutes ces colonnes.
