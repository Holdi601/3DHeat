---
title: "Analyse de masse"
nav_order: 8
lang: "fr"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: true
---


# Analyse de masse : des milliers de parties d'un coup

**L'analyse de masse** montre ce que représente tout un dossier de parties : quel véhicule gagne le plus, quel camp est avantagé, où se trouve l'action. Utilisez-la quand vous avez bien plus de parties que vous ne pourriez en regarder.

Elle travaille à partir d'un petit résumé de chaque partie, donc un millier ou dix mille parties s'ouvrent vite. Elle ne charge les lignes complètes que pour les parties sur lesquelles vous cliquez.

## Essayer {#try-it}

1. Ouvrez **Analyse de masse** dans la barre latérale de la carte de chaleur.
2. Appuyez sur **Dossier…** (ou **Fichiers…**) et choisissez vos parties `.3dheat`.
3. Attendez pendant que le panneau lit les résumés (« Résumés… n sur N »).
4. Appuyez sur **Ouvrir l'analyse**. Une fenêtre s'ouvre avec des onglets.
5. Réglez les filtres (Jeu, Carte, Mode, De, Vers), puis lisez un onglet, par exemple Équilibre.
6. Cliquez sur une ligne, une case ou une observation : ses parties se chargent dans la vue 3D, la caméra sur le lieu.

![L'onglet Équilibre : taux de victoire et frags par mort par véhicule](../assets/img/en/mass-balance.webp)

```
dossier de .3dheat -> résumés -> fenêtre (onglets) -> clic sur une ligne -> parties ouvertes en 3D
```

Un fichier `.3dheat` est une partie ([Un fichier par partie](container.md)). Une *carte de chaleur* et une *ligne* sont expliquées dans le [glossaire](glossary.md).

## Obtenir les résumés {#getting-the-summaries}

Rien à faire pour la plupart des gens : le panneau calcule lui-même les résumés manquants. Pour préparer un gros dossier une seule fois, utilisez l'outil hors ligne ci-dessous.

Chaque partie `.3dheat` reçoit un résumé (`src/mass/summarize.ts`), gardé dans le conteneur comme élément `<partie>.summary.json` (rôle `summary`, voir [Un fichier par partie](container.md)). L'outil hors ligne les écrit, ainsi qu'un index par dossier. C'est un outil de développeur ; lancez-le sur un gros dossier pour épargner au panneau ce travail :

```
node tools/3dheat-summarize.mjs <dossier>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Une partie déjà résumée (même version de format) est seulement lue ; `--force`
  la recalcule. `--no-write` laisse les conteneurs intacts.
- Un fichier modifié dans les dernières minutes de `--settle` (10) est laissé de côté :
  un convertisseur est peut-être encore en train de l'écrire.
- `<dossier>/3dheat-index.jsonl.gz` : une ligne par partie - son chemin, sa taille, sa date
  et son résumé sans la grille. `<dossier>/3dheat-index.grids.jsonl.gz` : une ligne
  par partie avec sa grille.
- Lancez-le sur la machine qui contient les fichiers, à basse priorité (par exemple `nice -n 19 ionice -c3` sous Linux).

Le panneau prend, pour chaque partie, le premier de ces éléments : la ligne d'index du dossier (même
chemin et même taille), le cache du navigateur (IndexedDB, par nom, taille et date), l'élément
`summary` du conteneur, ou un résumé calculé dans un groupe de travailleurs puis mis en cache.
Un dossier sans index fonctionne donc aussi : la première fois à la vitesse de lecture des tables,
ensuite depuis le cache.

## Le panneau {#the-panel}

Choisissez un dossier (ou des fichiers ; **Ajouter un dossier…** en ajoute un autre). La fenêtre a les filtres **Jeu**, **Carte**, **Mode**, **De** et **Vers**, un choix **Répartir selon**, **Moins de vies** et **Joueurs seulement**, ainsi que les onglets suivants. Chaque chiffre vient des résumés. Un clic sur une ligne, une case ou une observation charge ses parties dans la vue, en superposition de nombreuses parties, avec les filtres qui les montrent (véhicule, classe, arme, équipe, joueur) et la caméra sur le lieu :

| Onglet | Contenu |
|---|---|
| Vue d'ensemble | parties, heures, joueurs, vies, lignes, dates ; parties par jour ; par jeu, carte, mode ; totaux d'événements ; économie par monnaie ; à quel moment de la partie les choses arrivent |
| Équilibre | par véhicule, classe, arme ou équipe, réparti par carte, mode, rang ou jeu : K/D avec son intervalle à ~95 %, taux de victoire (Wilson), survie, frags et touches par minute, gains par minute, et q, le taux de fausses découvertes de Benjamini-Hochberg pour le K/D et la victoire par rapport au reste de la répartition. **Moins de vies** masque les lignes avec trop peu de vies pour être fiables ; **Joueurs seulement** laisse de côté ce que l'IA de la mission pilotait |
| Tendances | utilisation (part de présence), K/D ou taux de victoire des véhicules ou classes en tête, par jour, semaine ou mois |
| Joueurs | joueurs distincts, parties par joueur, joueurs par partie, les joueurs les plus fréquents |
| Camps | chaque camp de chaque carte : parties gagnées face à une répartition égale |
| Combat rapproché | données de manche : duels d'ouverture par camp et leur conversion, échanges, celui qui sort contre celui qui tient, feux croisés, entrées aveuglées, visée, poses, avantage numérique et, **Par carte**, les lieux qui tuent les joueurs qui y entrent. Chacun est une part avec son intervalle de Wilson, à partir des comptes `cqb` des résumés ([Combat rapproché et manches](close-quarters.md)) |
| Carte | la grille cumulée d'une carte : présence, frags, morts, K/D, tout événement, flux, et **chaud dans combien de parties** (stabilité) ; par équipe, à 1, 2, 4 ou 8 fois la taille de la case |
| Lieux | des lieux qui ressortent dans les chiffres mais pas dans la carte de chaleur (une grande zone animée dans son ensemble, des couloirs, des tranches d'altitude) ; **Trouver des lieux** |
| Niches | des groupes qui font nettement mieux ou moins bien que les autres (un véhicule sur une carte, un secteur à une altitude) ; **Trouver des niches** |
| Observations | les détecteurs de masse et les détecteurs de carte (ci-dessous) ; **Copier le rapport (JSON)** donne le JSON qu'un modèle de langage lit |

## Observations sur de nombreuses parties {#insights-over-many-matches}

L'onglet **Lieux** trouve des lieux qui ressortent dans les chiffres mais pas dans la carte de chaleur : une grande zone animée dans son ensemble, un couloir, une tranche d'altitude, un lieu animé seulement dans une partie du match. Il marque **caché** ceux que la carte de chaleur simple ne montre pas, et les contourne dans la vue 3D ; **Charger** y vole avec les parties qu'il contenait. L'onglet **Niches** trouve des groupes (un véhicule sur une carte et un camp, un secteur à une altitude) qui font nettement mieux ou moins bien que les autres ; cliquez sur l'un pour voir ses affinements.

L'onglet **Observations** trouve, sur toutes les parties, des véhicules qui échangent ou gagnent mieux ou moins bien que les autres, des lieux chauds dans une part stable des parties, des camps qui gagnent plus qu'une répartition égale, des véhicules dont l'usage évolue selon les dates, et des parties du match qui concentrent plus de frags qu'une répartition régulière. Chaque constat porte ses comptes, son effet, son intervalle et un taux de fausses découvertes (maintenu à 5 %), et un clic charge ses parties. Détails : [Pour les développeurs](#for-developers).

## Échelle {#scale}

Vous pouvez refaire vous-même une petite version : `node tools/demo-data.mjs` écrit 150 parties de chars synthétiques dans `tools/.shots/demo/mass` (environ 1 000 lignes chacune). Mesures sur ces 150 parties de démonstration synthétiques de `tools/demo-data.mjs`, sur un PC de bureau (une vraie partie est bien plus grosse) :

- `tools/3dheat-summarize.mjs` avec 4 travailleurs : 2,6 à 4,8 s pour les 150, 8 à 21 ms par partie dans un travailleur ; une seconde exécution qui ne fait que lire les résumés prend environ 2 s.
- Ouvrir le dossier dans le panneau, avec l'index présent, jusqu'à l'affichage de la fenêtre : 0,9 à 1,6 s (la part du travailleur, la lecture des 150 lignes d'index, prend 20 à 40 ms).
- Passer à un onglet, jusqu'au dessin de son tableau : Vue d'ensemble 10 à 30 ms, Équilibre 30 à 70 ms, Tendances 30 à 45 ms, Joueurs 15 à 35 ms, Camps 15 à 20 ms, Carte 55 à 130 ms.
- Le magasin contient les 150 parties en environ 0,5 Mo.

L'ouverture de la fenêtre prend une seule courte image : les fichiers choisis sont envoyés au travailleur 16 à la fois, et les champs de date et le premier onglet apparaissent une image plus tard.

Le magasin garde environ 15 Ko par partie, donc 10 000 parties prennent environ 150 Mo dans le
travailleur ; les grilles ne sont jamais gardées plus longtemps que ce que la carte demande.

## Pour les développeurs {#for-developers}

### Observations sur de nombreuses parties {#insights-over-many-matches}

`src/mass/detect.ts` : chaque constat avec ses comptes, son effet et son intervalle,
p et q (Benjamini-Hochberg sur tout ce que le détecteur a essayé, maintenu à 5 %),
le détail qui charge ses parties et une clé de phrase avec ses valeurs ;
le rapport (`heat3d.mass/1`) est ce que `massReportForModel` remet à un narrateur,
dans la même forme que le rapport d'une partie seule (`insights/seam.ts`).

| Détecteur | Trouve |
|---|---|
| `balance` | un véhicule joueur qui échange ou gagne mieux ou moins bien que les autres sur une carte ou dans un mode |
| `hotspot` | des lieux chauds dans une part stable des parties reçues (parties chaudes / parties vues, par rapport aux autres cases de la carte), pas seulement chauds en somme |
| `side` | un camp d'une carte qui gagne plus qu'une répartition égale |
| `meta` | la part de vies des joueurs d'un véhicule, ou son K/D, qui bouge entre la première et la seconde moitié des dates, par carte : assez grand pour compter, en tendance sur les trimestres, dans le même sens sur la plupart des cartes (voir plus bas) |
| `phase` | une partie de la durée du match qui concentre plus de frags, de touches, de lancements... qu'une répartition régulière |
| `place` | des lieux qui ressortent sur de nombreuses parties (étape B, plus bas) : le taux d'une région ou sa part de frags face à celui de chaque partie, cercles, couloirs, zones étendues, tranches d'altitude, phases ; caché lorsque la carte simple ne les montre pas |
| `niche` | des groupes qui font nettement mieux ou moins bien (étape B, plus bas) |
| `grid.*` | les détecteurs à un seul jeu de données (positions de puissance, zones chaudes et calmes, lieux par classe) sur les grilles cumulées de chaque carte : `GridMerge.toInsightJob` remplit les grilles de la passe d'observations à partir des résumés ; les détecteurs qui demandent des trajectoires sont ignorés |

### Le résumé {#the-summary}

Du JSON simple (`src/mass/types.ts`), environ 5 à 30 Ko compressés par partie :

- la partie : jeu, carte, mode, mission, début, durée, lignes, vies, joueurs,
  IA, équipes (vies, joueurs, présence, frags, morts, victoire, argent), vainqueur ;
- par véhicule et par équipe : classe, rang, vies, vies de joueurs, présence, événements
  par type canonique, frags par classe de la cible, victoires, argent ;
- par joueur (par identifiant d'utilisateur, sinon par nom) : équipe, vies, présence, frags, morts,
  touches, lancements, victoire, véhicules ; par arme : événements par type ;
- les colonnes de l'économie (`cost_*`, `earn_*`) et leurs totaux ;
- phases : événements par type dans 20 tranches de la durée du match et par minute ;
- comportement : les mesures de comportement collectif du match (alignement, regroupement sur une route, voies, encombrement, meneurs, retardataires, point de rupture, risque après les pertes, séries, accord sur les achats, suppression), chacune avec son propre modèle nul, p et q - voir [Comportement collectif](collective-behaviour.md) ;
- la grille (plus bas).

Compté comme le compte le visualiseur : colonnes trouvées comme le chargeur des nombreuses parties les trouve
(`leanSpec`), événements par `data/canonical.ts` ; un frag qu'une arme Tacview marque compte pour son tireur ; une mort
dite deux fois en même temps (`dead`, `death`) ne compte qu'une fois.

#### La grille : ce sur quoi s'appuie l'étape B {#the-grid-what-stage-b-builds-on}

La partie spatiale est faite pour les statistiques de balayage sur des régions de toute taille et forme, pas seulement pour des images de chaleur :

- **Une pyramide.** Les cases sont des puissances de deux alignées en unités du monde (x, z tels que la visionneuse les place). Le niveau `k` est la somme des cases `ix >> k, iz >> k` : exact, dans une partie comme entre des parties à d'autres tailles de case ; toute région (une boîte, un couloir le long d'une ligne, un anneau) est une somme de cases. Le niveau le plus fin tient l'étendue robuste de la partie (les cases qui portent 99 % de la présence) en 128 cases ; les écarts hors de là sont gardés.
- **Exposition à côté de chaque compte.** Secondes de présence par case, par équipe (`pt`), par classe de véhicule (`pc`) et par tranche de hauteur (`ph`), pour que le taux, l'espérance et le rapport d'une région soient calculés pour tout sous-groupe.
- **Hauteur.** Tranches au-dessus du plancher du match (le 1er centile de la hauteur) : moins de 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, au-delà ; un fichier avec une colonne `floor`/`storey`/`deck` le découpe selon ses étages. `y` est la hauteur moyenne de chaque case, `y0` la plus basse (son étage, pour la hauteur au-dessus).
- **Événements** sous forme de tuples `[case, type, équipe, classe, tranche, compte]`.
- **Tranches temporelles** à un niveau grossier (8 cases de côté), par minute depuis le début du match : `[cx, cz, minute, type, valeur]`, la présence en secondes avec le type `GRID_KINDS.length` ; les phases du match sont des minutes sur la durée.
- Creuse, comptes entiers, secondes au dixième : bornée par ce qui s'est passé.

### Étape B : lieux et niches {#stage-b-places-and-niches}

L'étape B cherche ce qui ressort des chiffres sans attirer l'œil : une grande zone animée dans son ensemble sans case chaude à l'intérieur, un rapport frags/morts étrange sur peu d'événements, un couloir, une tranche d'altitude, un groupe d'événements qui n'est là que dans une partie du match, et des groupes (un véhicule sur une carte d'un côté, un secteur à une altitude) qui font nettement mieux ou moins bien que les autres. Un seul **Trouver des lieux** / **Trouver des niches** / **Trouver des observations** lance tous les détecteurs ; les trois onglets partagent le rapport.

#### Lieux (`src/mass/scan.ts`) {#places-srcmassscants}

Les parties de chaque carte sont lues deux fois, une partie à la fois ; la mémoire garde des sommes sur une trame d'au plus 64 cases de côté (16 pour le balayage espace-temps), jamais les parties.

- **Mesures.** Le taux d'un événement par seconde de présence - frags, morts, touches, lancements, captures, pour toutes les unités, par classe (les 4 qui ont le plus d'événements), par tranche d'altitude - et la part des frags dans les frags et les morts (tous, par camp, par tranche). Les classes et les camps retenus viennent des en-têtes (`planOf`).
- **Espérance par partie.** Le taux propre à chaque partie, réparti sur sa présence propre dans une case, donne l'espérance de la case (un balayage de Kulldorff ajusté sur des covariables, stratifié par partie) : quelques parties sanglantes ou un seul serveur chargé ne créent pas de lieu.
- **Dispersion.** Les parties s'accordent beaucoup moins que ne le veut Poisson. Les résidus de chaque partie sont additionnés par blocs de 1, 2, 4, 8, 16 cases ; la dispersion de chaque taille de bloc (carrés des résidus sur la variance nulle, mis en commun, les 5 % de blocs les pires écartés) met à l'échelle chaque test d'une région de cette taille : un rapport de vraisemblance quasi, Poisson pour les taux, binomial pour les parts.
- **Régions.** Des cercles de 0,75 à 18 cases ; des ellipses à six angles, 3 et 6 fois plus longues que larges, de 3 à 18 cases (couloirs ; l'axe est le `place.path` de l'observation) ; des zones étendues case par case à partir des cases locales les plus fortes selon Getis-Ord Gi* tant que le z de la région grandit (formes irrégulières) - étendues sur une moitié des parties et testées sur l'autre, pour que la liberté de l'extension ne coûte aucun faux lieu ; chaque tranche d'altitude contre les autres tranches du match sur toute la carte (robuste aux grappes) ; des cylindres espace-temps : un cercle sur un ou deux cinquièmes de la durée du match, contre la dispersion propre au match de ses événements dans l'espace et le temps (le balayage par permutation espace-temps).
- **Test.** p à partir du rapport de vraisemblance quasi ; Benjamini-Hochberg sur chaque région essayée sur chaque carte (700 000 sur trois cartes est courant) à 5 %. Ce qui passe est élagué (une région surtout incluse dans une plus forte de sa mesure dit la même chose), puis relu pour sa **stabilité** - les parties qui l'ont vue, les parties où elle était présente, son sens sur cinq plis de parties - et testé encore une fois à la variance que montrent les parties elles-mêmes (robuste aux grappes, parties comme grappes, jamais sous Poisson), BH de nouveau. Les lieux calmes sur une base (2 % ou plus des apparitions, décollages et atterrissages de la carte) sont laissés de côté.
- **Effet.** Le rapport de taux (ou de cotes), réduit par un bayésien empirique (un a priori gamma ajusté sur les blocs 2x2 de la carte), avec un intervalle d'environ 95 % à la dispersion ; Gi* à 1, 2 et 4 cases et Moran local au centre.
- **Évidence visuelle.** Quelle part de la région se voit déjà dans la carte de chaleur simple de son événement (échelle logarithmique jusqu'à la case la plus claire, comme les vues la dessinent) : son contraste avec un anneau autour (un dixième de la palette est difficile à voir, deux cinquièmes simples) et un pic clair qui porte l'excès ; un rapport n'est jamais dessiné par la chaleur, donc il compte pour moitié. En dessous de 35 %, **caché**. Le rang : la force (effet saturant à 4 fois, lieux calmes à 0,7) fois `1 - 0,7 x évidence` fois l'accord des plis.

L'onglet **Lieux** les liste (cachés seulement par défaut ; par carte, forme, sens) ; un clic contourne les lieux de la carte dans la vue 3D (`placeLines.ts` : les lignes du moteur, construites une fois : magenta caché, ambre simple, cyan calme, celui choisi plein ; une tranche sous forme de boîte entre son plancher et son plafond) et sur la toile de l'onglet Carte ; **Charger** y vole et charge les 60 parties qui le contenaient le plus, filtrées sur son événement (et sa classe).

#### Niches (`src/mass/niche.ts`) {#niches-srcmassnichets}

Recherche par faisceau (largeur 24, profondeur 3) sur trois tableaux : **vies** (vies des joueurs : jeu, carte, mode, classe, véhicule, camp, rang, trimestre des dates, tiers de la durée des matchs ; K/D, victoire, mort par vie, frags par heure, gains par minute), **lieux** (frags et morts par carte, mode, dates, secteur de la carte 4 x 4, classe, camp, tranche) et **phases** (secteur et cinquième du match : K/D, morts par heure de présence). Un groupe est testé contre l'ensemble, les parties comme grappes (la variance en sandwich de ses résidus par partie), son effet étant un rapport de cotes ou de taux réduit par un a priori de 20 issues ; il lui faut 30 issues dans 8 parties, un affinement doit être 10 % plus fort que son parent, et les groupes où le résultat est nul ou total (non enregistré pour eux) sont laissés de côté. Gardés : BH sous 5 % sur tous les groupes évalués, un rapport réduit d'au moins 1,25 (ou 1/1,25), quatre plis sur cinq d'accord, et pas un affinement qui ne répète que son parent. L'onglet **Niches** les liste ; un clic montre chaque affinement à une condition du groupe (l'explorateur), **Charger** charge ses parties. Les équipements ne sont pas encore dans les résumés.

#### Les évolutions de la méta avec une portée pratique {#meta-shifts-with-practical-significance}

Sur des dates mêlées, le binomial sur les vies jugeait presque chaque changement significatif. `meta` teste désormais de façon robuste aux grappes (les vies de chaque partie forment une grappe), ne garde un changement d'usage que s'il vaut au moins 2 points et 25 %, un changement de K/D de 1,3 fois, les trimestres des dates allant dans le même sens (tau de Kendall d'au moins 0,5) et, pour un véhicule sur plusieurs cartes, le même sens sur la plupart d'entre elles. Il ne reste alors que quelques changements sur un jeu de test où le test simple en signalait presque tous.

#### Pour un modèle {#for-a-model}

`massReportForModel` donne à chaque lieu sa `region` (forme, caché, évidence, hauteurs, phase) et à chaque niche ses `conditions`, ainsi que le nombre de régions et de groupes essayés. La lentille des connaissances peut lire les lieux comme des zones de mise à mort et des axes d'approche : leurs types sont `place.*` et `niche.*`.

#### Vérifications {#checks}

`scan.test.ts` place une zone diffuse (1,6 fois le taux de morts sur un cercle de 22 cases, faible dans chaque case), un couloir, une tranche d'altitude et un groupe qui n'existe que dans une phase, dans 240 parties synthétiques surdispersées - tous trouvés, la zone diffuse cachée - et fait tourner huit jeux nuls de 60 parties : aucun lieu. `niche.test.ts` retrouve un groupe véhicule x carte x camp placé à l'avance et rien dans cinq tableaux nuls.
