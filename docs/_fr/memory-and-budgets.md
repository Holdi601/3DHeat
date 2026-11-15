---
title: "Mémoire et budgets"
parent: "Importer des données"
nav_order: 6
lang: "fr"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Mémoire, budgets et contrôle de tenue

Votre ordinateur a une mémoire limitée. 3DHeat additionne ce dont vos fichiers ont besoin et vous dit, avant **Charger**, s'ils tiennent.

![L'Estimation de la mémoire en ne tiendra pas, avec Charger une ligne sur [N] déjà remplie et le bouton Charger qui affiche Trop grand - réduire ou échantillonner](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Trop gros pour cet ordinateur ? 3DHeat propose plutôt de charger une ligne sur N.*

Un onglet de navigateur qui manque de mémoire en pleine charge plante et perd des minutes de travail, et une carte graphique à qui l'on demande plus qu'elle n'a perd soit son contexte, soit ralentit jusqu'à presque s'arrêter. Avant le début d'un chargement, le panneau Source indique donc combien de mémoire il faut, compare ce chiffre avec les budgets détectés pour cette machine, et refuse - en proposant une solution - lorsque cela ne tiendra pas. Le modèle est dans [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## L'estimation de la mémoire {#the-memory-estimate}

Affichée au-dessus du bouton **Charger** une fois les lignes comptées.

| Ligne | Signification |
|---|---|
| **Estimation de la mémoire** - *tient* / *juste* / *ne tiendra pas* | Le verdict, en vert, orange ou rouge. |
| `N lignes · B o/ligne` | Les lignes qui seront chargées (après le pas) et les octets permanents par ligne. |
| `RAM X en place, Y au pic pendant le chargement` | La mémoire occupée une fois chargé, et le pic pendant le chargement. |
| `GPU Z · chargement est. T` | La mémoire GPU des lignes, et une durée estimée à 1,2 million de lignes par seconde. |
| Nom du GPU | Le nom du moteur de rendu, lorsque le pilote le donne. |
| Messages | Pourquoi cela ne tient pas, ou tient juste, et quoi faire. |
| **Charger une ligne sur [N]** | Le pas d'échantillonnage (voir plus bas). |
| `Budget : X RAM, Y GPU. Ajustez dans Performance → Budgets de ressources.` | Les budgets utilisés par le contrôle. |

### Octets par ligne {#bytes-per-row}

| Colonne | Permanent (RAM) | Remarques |
|---|---|---|
| Position | 12 | Trois nombres flottants de 32 bits, toujours (un axe plat reste un tableau) |
| Temps | 4 | Lorsqu'il est associé |
| Durée de vie | 4 | Lorsque le temps et la personne sont associés |
| Personne | 4 | Lorsqu'elle est associée |
| Groupe | 2 | Lorsqu'il est associé |
| Session | 4 | Lorsqu'elle est associée |
| `Source file` | 4 | Lorsque plus d'un fichier est chargé |
| Chaque colonne de filtre | 4 | Par colonne cochée *Garder pour filtrer* |

Le **pic** ajoute ce dont le chargement n'a besoin que momentanément - 8 octets de temps sur 64 bits pendant la fusion, 12 octets de clés de tri et d'index, 4 octets de tableau de travail pour la permutation (les trois lorsque le temps est associé), et 4 octets tant que la colonne de groupe est encore sur 32 bits - et multiplie la somme par **2,0**. Ce facteur a été mesuré (un chargement réel de plusieurs fichiers a culminé à 1,9 fois les tableaux détaillés, à cause de l'espace de travail du décodeur Parquet, des copies qui raccourcissent chaque colonne à sa longueur, et de la mémoire libérée mais pas encore rendue) puis arrondi par excès, car une sous-estimation coûte un onglet planté, alors qu'une surestimation ne coûte qu'un pas inutile.

Sur le **GPU**, chaque ligne coûte 8 octets (position et groupe, 16 bits chacun), plus 4 octets (temps et durée de vie, 16 bits chacun) lorsque le temps et la personne sont tous deux associés. Voir [Résidence de la mémoire GPU](gpu-memory.md). Les textures de filtre (4 octets par ligne et par filtre actif) et les débuts de segments de la chaleur des lignes (8 octets par ligne lorsque le mode Lignes est activé) ne font pas partie de cette estimation.

## Le contrôle de tenue {#the-fit-check}

Trois contraintes sont comparées ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)) :

- le pic de RAM par rapport au **budget RAM**,
- les octets GPU par rapport au **budget GPU**,
- le nombre de lignes par rapport au **plafond de tri** de 400 000 000 de lignes, lorsqu'une colonne de temps est associée.

Le plus élevé des trois rapports décide : jusqu'à 70 % *tient*, jusqu'à 100 % *juste* (cela devrait se charger, mais attendez-vous à une lenteur), au-delà *ne tiendra pas*. Lorsque cela ne tiendra pas, le panneau nomme la contrainte limitante et propose :

- de charger une ligne sur *N*, avec *N* = ⌈lignes / lignes qui tiennent⌉, déjà rempli dans la case du pas ;
- de retirer des colonnes de filtre, de désassocier la colonne de temps (ce qui supprime le tri et son plafond, au prix de la frise), ou d'augmenter le budget.

Lorsque le budget lui-même ne correspond pas à un fait sur le matériel - le navigateur a plafonné le chiffre de RAM, la valeur par défaut a été abaissée par ce qui est libre à l'instant, ou le chiffre GPU est une estimation - le message le dit, pour que vous ne cherchiez pas un pas dont vous n'avez pas besoin.

### Échantillonnage {#decimation}

**Charger une ligne sur [N]** garde une ligne sur *N*, comptée par fichier. La chaleur est une moyenne : une ligne sur *N* donne la même répartition, avec davantage de bruit - le même compromis que le moteur de rendu fait déjà à chaque image. La case commence à 1 (*ligne (toutes)*) ; lorsque la sélection ne tient pas, elle est remplie avec le pas suggéré, sauf si vous y avez tapé quelque chose. Le bouton Charger affiche alors *Charger N fichiers (1 sur K)*, et le nom du jeu de données porte la mention `une ligne sur K`.

### Le plafond de tri {#the-sort-ceiling}

Le moteur de rendu a besoin des lignes dans l'ordre croissant du temps ; une colonne de temps associée implique donc de trier chaque ligne, avec un tri radix sur des clés de 32 bits ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Au-delà de **400 millions** de lignes, c'est refusé plutôt que tenté dans un onglet. Cela est vérifié avant le chargement : une sélection au-dessus de la limite est refusée avec une suggestion de pas, au lieu d'être lue en entier pour échouer à la dernière étape. Près de la limite (*juste*), le panneau prévient que le tri est une longue passe sans progression propre. Sans colonne de temps, aucun tri n'a lieu et aucun plafond ne s'applique.

## Budgets de ressources {#resource-budgets}

**Performance → Budgets de ressources** (une ligne repliable en bas du panneau Performance, qui affiche `Budgets de ressources - RAM, GPU, cœurs`). Les budgets sont détectés ; la valeur détectée sert de valeur par défaut ; et les curseurs ne vont pas plus haut qu'un **plafond** qui est la valeur détectée, sauf lorsque la détection est connue pour ne pas être une mesure.

| Réglage | Plage | Signification |
|---|---|---|
| **RAM pour les données de lignes** | de 256 Mio au plafond de RAM, logarithmique | Le budget RAM du contrôle de tenue. Marqué *(au-dessus de la détection)* au-delà de la valeur détectée par défaut, *(max)* au plafond. |
| **GPU pour les données de lignes** | de 128 Mio au plafond GPU, logarithmique | Le budget GPU pour le contrôle de tenue et pour l'envoi des lignes. Marqué *(au-dessus de la détection)* au-delà de la valeur détectée par défaut, *(max)* au plafond. |
| **Threads d'analyse** | de 1 au nombre de cœurs logiques | Combien de fichiers un chargement analyse à la fois, chacun dans son propre travailleur. Par défaut : cœurs - 2 (cœurs - 1 sur quatre cœurs ou moins). Voir [Threads d'analyse](#parser-threads) (sous Pour les développeurs). |
| Ligne des sources | | D'où vient chaque chiffre (`RAM : …. GPU : …. CPU : ….`). |
| **Redétecter** | | Demande au serveur de développement une nouvelle lecture de la mémoire et recalcule chaque budget. |
| Nom du GPU | | Le nom court de l'adaptateur ; la chaîne complète du moteur de rendu est dans l'info-bulle. |

### Augmenter le budget GPU {#raising-the-gpu-budget}

Un budget GPU au-dessus de la valeur détectée s'applique tel que réglé : le contrôle de tenue et l'envoi prennent le même chiffre depuis une seule fonction ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), qui ne le plafonne qu'au plafond GPU où s'arrête le curseur. Ainsi, un chargement que le contrôle accepte est envoyé en entier. Au-delà de la valeur détectée, le curseur affiche *(au-dessus de la détection)* : le nombre est alors votre appréciation de la carte, pas une mesure, et le régler plus haut que ce que la carte peut supporter risque de faire perdre le contexte ou de faire ramer.

## Très grands jeux de données : les leviers {#huge-datasets-the-levers}

Du moins radical au plus radical :

1. **Moins de colonnes de filtre.** Chacune coûte 4 octets par ligne et une passe de décodage.
2. **Un pas.** Une ligne sur *N*.
3. **Pas de colonne de temps.** Pas de tri, pas de plafond de tri, pas de 4 à 8 octets par ligne pour le temps et la durée de vie - et pas de frise.
4. **Augmenter les budgets**, lorsque vous savez que la mémoire est là.

Au moment du rendu, les grands jeux de données sont traités par échantillonnage et accumulation progressive plutôt qu'en réduisant les données ; voir [Échantillonnage et budgets](sampling-and-budgets.md).

## Pour les développeurs {#for-developers}

### Threads d'analyse {#parser-threads}

Un chargement de plusieurs fichiers analyse jusqu'à **Threads d'analyse** d'entre eux à la fois, chacun dans un travailleur d'analyse lancé par le travailleur d'ingestion de ce chargement ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). À 1, ou pour un seul fichier, les fichiers sont analysés l'un après l'autre dans le travailleur d'ingestion lui-même.

Lancer plusieurs analyses à la fois n'assouplit pas le contrôle de tenue :

- **Le constructeur est compté en premier.** Les colonnes fusionnées sont allouées pour toute la sélection avant la lecture du premier fichier, donc les fichiers en cours ne reçoivent que ce que le budget RAM laisse à côté d'eux (`parseHeadroom`) : position, temps sur 64 bits, angles de regard, personne, groupe sur 32 bits, session, colonnes de filtre et `Source file`, par ligne à charger - multiplié par 2,6 lorsque le nombre de lignes est une estimation CSV, pour une colonne qui devient une colonne plus grande.
- **Chaque fichier réserve son coût avant de démarrer** (`fileParseBytes`) : ses lignes (d'après le pied de page Parquet ; la part d'un CSV dans l'estimation selon sa taille) multipliées par les mêmes colonnes, puis par **8** - le bloc lui-même, la copie à côté pendant que les lignes sans position sont retirées, et l'espace de travail du décodeur, qui pour les colonnes de texte est bien plus grand que leurs identifiants. Un pas ne réduit pas cela, car les fichiers sont lus en entier puis échantillonnés ensuite. Le 8 est une marge fixée par la mesure : à 3, ou à 5, trente threads d'analyse ont fait dépasser à un onglet sa limite sur 86 millions de lignes avec les noms de personnes et de sessions ; à 8, non.
- **Un autre fichier ne démarre que si sa réservation tient** dans ce qui reste. Un fichier terminé qui attend la fusion d'un fichier antérieur garde sa réservation jusqu'à sa fusion.
- **Un fichier tourne toujours.** Lorsque rien n'est réservé, le fichier suivant démarre quel que soit son coût : c'est le chargement un par un que le contrôle de tenue a admis, donc un budget serré y revient au lieu de refuser.

Le chiffre *pic pendant le chargement* est le pic d'un chargement un par un, qui survient au tri, après que chaque fichier a été lu. Les fichiers analysés côte à côte peuvent dépasser ce chiffre pendant leur lecture ; les réservations le maintiennent dans le budget RAM, dans la mesure où les estimations ci-dessus sont justes.

L'ordre de fusion est l'ordre de la sélection, quel que soit l'ordre de fin des fichiers ; la numérotation des personnes, des groupes et des sessions, les lignes et les valeurs de `Source file` sont donc identiques à un chargement un par un. Un fichier qui ne peut pas être lu est ignoré et listé exactement comme avant. Un travailleur d'analyse qui meurt met fin à tout le chargement, comme la mort du travailleur d'ingestion l'a toujours fait, et chaque travailleur d'analyse est arrêté à la fin du chargement, quelle que soit sa fin. Si les travailleurs d'analyse ne peuvent pas du tout démarrer, les fichiers sont analysés dans le travailleur d'ingestion.

### Comment les chiffres sont détectés {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) s'exécute au démarrage, à nouveau une fois que le moteur de rendu existe, et sur **Redétecter**.

**RAM, avec le serveur de développement.** `start.bat` et `npm run dev` servent la page depuis un processus qui peut lire la mémoire de la machine, à `/__host/memory` (répondu en 1,5 s au plus, sinon ignoré). La valeur par défaut est la plus petite entre 60 % de la RAM installée et 80 % de la RAM actuellement libre ; le plafond est de 60 % de la RAM installée. Lorsque la mémoire libre est ce qui abaisse la valeur par défaut, le panneau le dit et propose de fermer des programmes et d'appuyer sur **Redétecter**.

**RAM, sans lui** (un déploiement statique) : aucune API du navigateur ne donne la mémoire libre, et `navigator.deviceMemory` est arrondi à la baisse à une puissance de deux et plafonné à 8 Gio par Chrome et Edge. La valeur par défaut est 60 % de `deviceMemory`, encore plafonnée à 4 fois le tas JavaScript libre de l'onglet lorsque le navigateur le donne, ou à 4 Gio lorsque rien n'est donné. Lorsque `deviceMemory` vaut exactement 8 (le plafond), le chiffre est signalé comme *plafonné*, et le plafond est 4 fois la valeur par défaut, avec une note indiquant qu'au-delà de la valeur par défaut le nombre est votre affirmation, pas une mesure.

**Dans les deux cas**, la valeur par défaut et le plafond de RAM sont limités à **12 Gio**, la plus grande mémoire de tableaux typés qu'un onglet Chrome puisse contenir, quelle que soit la machine (une page a atteint environ 15,75 Go puis a échoué ; 12 laisse de la place au reste), et ne descendent jamais sous 256 Mio.

**Mémoire GPU.** Aucune API web ne la donne.

- Avec le serveur de développement, la mémoire de la carte est lue par `nvidia-smi` (le plus grand adaptateur) ou, sous Windows, depuis la valeur de registre de l'adaptateur d'affichage `HardwareInformation.qwMemorySize`. La valeur par défaut est 70 % de cette mémoire, le plafond 90 %.
- Sans lecture, elle est déduite : 2 Gio par défaut ; 4 Gio lorsque la plus grande texture fait 16 384 px ou plus (une carte dédiée), 1 Gio lorsqu'elle est plus petite ; ou 8 fois le `maxBufferSize` de WebGPU lorsque c'est plus grand. Le plafond est alors 8 fois le chiffre déduit, parce que la déduction distingue une puce intégrée d'une carte dédiée et rien de plus fin. Le panneau indique que le chiffre est déduit.
- Jamais sous 128 Mio.

**CPU.** `navigator.hardwareConcurrency` (4 lorsqu'il n'est pas donné).
