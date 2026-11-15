---
title: "Charger les tours"
parent: "Analyse de course"
nav_order: 51
lang: "fr"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Charger les tours

Un fichier de tour est un enregistrement d'une conduite : où se trouvait la voiture et ce que le pilote a fait, plusieurs dizaines de fois par seconde. Chargez deux tours ou plus du même circuit, et l'onglet **Analyse de course** peut les comparer.

![La section Tours de l'onglet Analyse de course avec trois tours de démo chargés : liste des tours, étoile de référence, tour examiné](../assets/img/en/race-loading-laps-list.webp)

## Vos premiers tours {#your-first-laps}

1. Ouvrez l'onglet **Analyse de course**.
2. Vous voulez juste regarder ? Appuyez sur **Tours de démo** (voir [Tours de démo](#demo-laps)).
3. Vos propres tours : enregistrez-les dans le jeu avec un enregistreur (voir [Formats de fichiers](#file-formats)). L'enregistreur écrit un fichier par tour.
4. Appuyez sur **Charger des tours…** et choisissez deux fichiers ou plus du même circuit, ou appuyez sur **Dossier…** et choisissez le dossier qui les contient. Vous pouvez aussi déposer des fichiers ou des dossiers sur la vue 3D.
5. Cliquez sur un tour dans la liste pour voir où il perd du temps.

**Attention : les tours se comparent un circuit à la fois.** Charger un tour d'un autre circuit nommé efface les tours déjà chargés.

## Les boutons {#the-buttons}

| Commande | Fait |
|---|---|
| **Charger des tours…** | un sélecteur de fichiers pour les fichiers `.json`, `.csv`, `.txt`, `.ibt`, `.gz` et `.h3dcars`, plusieurs à la fois (`.h3dcars` est un fichier de voiture, voir [Voitures](race-replay-and-scene.md#the-cars)) |
| **Dossier…** | un sélecteur de dossier : chaque fichier de tour du dossier et de ses sous-dossiers |
| **Tours de démo** | trois tours inventés d'un circuit inventé (voir [Tours de démo](#demo-laps)) |
| **Effacer** | supprime chaque tour (affiché une fois des tours chargés) |
| déposer sur la vue | les fichiers et dossiers entiers déposés sur la vue 3D se chargent de la même façon |

Les tours sont **ajoutés** à ceux déjà chargés - **sauf s'ils sont d'un autre circuit nommé : alors les tours chargés sont d'abord effacés** (les tours se comparent un circuit à la fois). Les fichiers qui ne peuvent pas être lus sont listés sous les boutons, une ligne chacun ; les autres se chargent quand même.

## Formats de fichiers {#file-formats}

Le format se devine d'après le contenu, pas d'après le nom du fichier. En clair :

- **heat3d-lap** est le fichier que l'enregistreur 3DHeat écrit pour la plupart des jeux.
- **FH Companion** est un outil gratuit qui enregistre les tours de Forza Horizon. Il écrit un fichier de tour et, à côté, un fichier `.json.tele.gz` (le même tour avec les données de chaque pneu, compressées en gzip). Choisissez les deux ensemble.
- **iRacing `.ibt`** est le fichier de télémétrie d'iRacing ; activez l'enregistrement dans la voiture avec Alt+L et chargez le fichier tel quel.
- Un **CSV de tour** est une table simple, une ligne par instant.

| Format | Source habituelle | Lu par |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon et Motorsport par Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| `.json` de tour FH Companion | la bibliothèque de tours de FH Companion | `fromFhCompanion` |
| Télémétrie FH Companion `.json.tele.gz` | à côté de chaque fichier de tour FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | les fichiers de télémétrie d'iRacing (enregistrement avec Alt+L dans la voiture) | `readIbt` |
| CSV de tour | `heat3d_capture laps`, le module Trackmania, ou tout CSV avec `x`, `z`, une colonne de temps et, facultativement, une colonne `lap` | `fromCsv` |

La façon dont chaque jeu est enregistré et ce qu'il envoie est documenté par les enregistreurs :
[GameCapture : jeux](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
et [GameCapture : le format de tour](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Voir aussi [Autres jeux de course](other-games.md).

## Dossiers et circuits {#folders-and-courses}

**Dossier…**, ou un dossier déposé, prend tous les fichiers qu'il contient, sous-dossiers compris. Dans un dossier, seuls les fichiers se terminant par `.json`, `.csv`, `.txt`, `.ibt` ou `.tele.gz` sont pris en compte, et un `.json` qui n'est pas un tour (le fichier propre à un circuit, sa carte) est ignoré sans erreur.

**Plusieurs circuits dans un seul choix.** La bibliothèque de tours de FH Companion range chaque circuit dans un dossier nommé `<nom du circuit> (course_<x>_<z>_to_<x>_<z>)` (ou simplement `course_...` pour un circuit sans nom). Quand les fichiers choisis se trouvent dans plus d'un de ces dossiers de circuit, rien n'est chargé ; à la place, la section **Tours** affiche « Ce sont des tours de N circuits, et les tours se comparent un circuit à la fois. Choisissez-en un : » et liste chaque circuit avec son nombre de tours (fichiers se terminant par `.json`, `.csv` ou `.ibt`, `course.json` non compté), les plus de tours en premier. Un clic charge les fichiers de ce circuit.

Un circuit est repéré par son nom et son point de **départ**, non par son arrivée : les parcours jamais terminés sont gardés par FH Companion sous le même nom et le même départ (dans `unfinished/`), avec l'endroit où ils se sont arrêtés comme arrivée, et ils vont avec leur circuit - marqués **partiel** dans la liste.

**Plusieurs pistes parmi les fichiers choisis.** Quand les fichiers choisis directement (et non depuis des dossiers de circuit) sont des tours de plus d'une piste nommée, le même choix est proposé par piste ; les tours qui ne nomment aucune piste vont avec celle qui est choisie.

## Noms des voitures {#car-names}

Un tour porte le nom complet de sa voiture, tel que le jeu le donne. Quand le fichier de tour ne nomme pas la voiture :

1. **Le dossier.** La bibliothèque de FH Companion range les tours dans `<circuit>/<classe>/<nom de voiture> '<yy> (car<numéro>)/<réglage>/<étiquette>/<tour>.json`. Le dossier le plus profond qui correspond à `<nom> (car<numéro>)` donne le nom et le numéro ; un dossier `car<numéro>` seul donne le numéro. Seuls les choix de dossiers et les dossiers déposés portent ce chemin.
2. **Un autre tour de la même voiture.** Dès qu'un tour nomme une voiture, chaque tour de même jeu et même numéro de voiture reçoit ce nom - les tours chargés ensemble, et ceux chargés plus tard dans ce navigateur : les noms sont gardés dans `localStorage` sous `heat3d.carNames` (indexé par `<jeu>:<numéro de voiture>`). Dans une fenêtre privée, ils durent autant que les tours.
3. Sinon « car 1234 » d'après son numéro, ou « car ».

**Étiquettes.** Dans la liste des tours, un tour affiche le nom de sa voiture ; plusieurs tours de la même voiture sont numérotés « Nom #1 », « Nom #2 ». Les phrases de l'analyse utilisent les mêmes étiquettes quand elles sont uniques ; sinon le nom de la voiture avec le temps du tour, « Nom (1:29.616) » (temps d'exemple), numéroté davantage si ce n'est toujours pas unique.

**Regroupement.** Des tours appartiennent à la même voiture (pour les enveloppes, les profils et les comparaisons) quand leur numéro de voiture - ou leur nom s'il n'y a pas de numéro - et leur indice de performance sont les mêmes (`carKey`) : le même modèle avec un réglage différent est une voiture différente.

**Classes.** La classe de performance d'un tour est celle du jeu (Forza D..X, nom court de classe iRacing) ; les statistiques les rangent D, C, B, A, S1, S2, R, X, puis les autres par ordre alphabétique.

## Tours de démo {#demo-laps}

**Tours de démo** charge trois tours d'un circuit inventé (quatre lignes droites et quatre virages à droite), produits par un modèle de véhicule simple ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)) : la vitesse limitée par l'adhérence dans chaque virage, une passe d'accélération vers l'avant et une passe de freinage vers l'arrière, comme le fait un simulateur de tour.

| Tour | Voiture | Fautes |
|---|---|---|
| propre | voiture d'adhérence | aucune |
| avec erreurs | voiture d'adhérence | freine 35 m trop tôt dans T2, remet les gaz 30 m trop tard en sortie de T3, prend T4 à 0,88 de sa vitesse, roule 1,2 m d'un côté |
| autre voiture | voiture de puissance | aucune ; roule 1,2 m de l'autre côté |

| Voiture (numéro) | Adhérence | Freinage | Motricité | Puissance/masse | Traînée |
|---|---|---|---|---|---|
| Voiture d'adhérence (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Voiture de puissance (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Le tour avec les erreurs est examiné. Le circuit est disposé comme Forza tient son monde (gaucher), donc - exactement comme avec un vrai tour de Forza - il sort en miroir, et l'onglet propose **Inverser X**. Les trois tours portent des données par roue, donc chaque partie de l'onglet a quelque chose à montrer.

## La liste des tours {#the-lap-list}

Chaque ligne, de gauche à droite :

| Élément | Fait |
|---|---|
| ● / ○ | affiche / masque le tour (tracés, voiture, fiche, graphiques) ; les tours masqués sont quand même analysés |
| trait de couleur | la couleur du tour |
| nom et étiquettes | cliquez pour **examiner** le tour ; survolez pour voir son fichier source et sa voiture (nom · indice PI de classe · transmission) |
| ⌖ | suit cette voiture avec la caméra (cliquez à nouveau pour arrêter) |
| ★ | compare tout à ce tour (en fait la référence) ; désactivé sur la référence |
| × | retire le tour |

**Étiquettes :** *référence* ; *meilleur de X* (ou *meilleur de sa classe*) sur le tour le plus rapide d'une classe quand il y a plusieurs classes ; *partiel* sur une course qui n'a pas atteint l'arrivée.

**La deuxième ligne :** la classe (seulement s'il y a plusieurs classes), le temps du tour (`1:29.616`), l'écart avec le tour auquel il est comparé (le meilleur de sa classe, ou la référence) sous la forme `+0.512` (exemple), et *commence tard* quand le tour commence plus de 10 m après le départ de la référence.

Avec plus de 8 tours, une ligne « N sur M affichés » propose **Tout afficher** (dessiner chaque tour : plus lent, et un enchevêtrement) et **Seulement ceux examinés** (la référence, le tour examiné et le meilleur de sa classe ; les statistiques comptent tous les tours dans les deux cas).

Sous la liste : l'indication de miroir quand les tours disent que le dessin est en miroir (voir [mondes en miroir](race-replay-and-scene.md#mirrored-worlds)), et, avec deux tours ou plus, l'indication « Cliquez sur un tour pour voir où il perd du temps … », ainsi que, avec plusieurs classes, que chaque tour est comparé au plus rapide de sa propre classe.

### Référence et examen {#reference-and-focus}

- **Référence :** le tour auquel tous les autres sont alignés et, par défaut, comparés. Le tour **complet** le plus rapide, sauf si ★ en a choisi un autre (le premier tour chargé quand aucun n'est complet). Retirer le tour de référence revient au choix automatique.
- **Examen :** le tour dont les constats, la maîtrise de la voiture et les cartes sont affichés. Il reste là où l'utilisateur l'a mis ; sinon, c'est le tour **le plus lent** qui n'est pas la référence (« celui dont on a le plus à apprendre »). Examiner un tour le fait aussi réapparaître, ainsi que le meilleur tour de sa classe. Examiner la référence la compare au tour, quel qu'il soit, qui a été le plus rapide dans chaque virage.
- **Classes :** avec des tours de plusieurs classes de performance, chaque tour est comparé au tour complet le plus rapide de sa propre classe (la référence, dans la classe de la référence). Voir [Statistiques du circuit](race-course-statistics.md).

### Couleurs {#colours}

Chaque tour reçoit sa propre couleur, selon sa place dans l'ordre de chargement ; ainsi un tour garde sa couleur quand d'autres sont masqués. Les teintes sont réparties sur le cercle chromatique comme le mode équipe de la carte de chaleur répartit les groupes ; pour chaque emplacement, la luminosité (0,52 à 0,66 en OKLCH) et la chroma (0,12 à 0,18) sont choisies pour se tenir le plus loin possible des emplacements voisins (et le dernier du premier) selon une vision normale, protan et deutan, chacun avec au moins 3:1 contre la surface sombre du graphique.

## Pour les développeurs {#for-developers}

Code : [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Comment chaque format est lu {#how-each-format-is-read}

Chaque format aboutit à un seul `LapTrace` : des canaux sous des noms canoniques (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., voir le [tableau des canaux](race-charts-and-hud.md#the-channel-table)), la voiture, le temps du tour, le fait qu'il soit complet ou non, et un bloc `meta`. Pour chaque format, `time` et `distance` sont décalés pour commencer à 0, et là où une source n'a pas de `speed`, il est calculé comme distance divisée par temps à partir des échantillons voisins.

#### JSON heat3d-lap {#heat3d-lap-json}

Un objet JSON avec `"format": "heat3d-lap"`. Champs lus :

| Champ | Usage |
|---|---|
| `channels` | un objet de tableaux, un par canal, sous son nom canonique ; les canaux par roue s'écrivent `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` et `z` sont obligatoires |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | la voiture : identifiant, nom, indice de classe Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indice de performance, code de transmission (0 avant, 1 arrière, 2 intégrale) |
| `lap.seconds` | le temps du tour ; la dernière valeur de `time` quand il est absent |
| `lap.complete` | `false` marque une course partielle ; toute autre valeur signifie complet |
| `game`, `track` | noms ; `game` détermine la discipline (voir plus bas) |
| `units.slipRatio` / `units.slipAngle` | comment le glissement est mis à l'échelle : une unité contenant `raw` signifie `scaled`, `normalised` signifie `peak`, tout le reste `physical` |
| `meta` | `slip`, `surface`, `discipline` tels que donnés remplacent ce qui précède |

Sans canal `distance`, la distance est additionnée à partir des positions 3D.

#### Fichiers de tour FH Companion {#fh-companion-lap-files}

Un objet JSON avec un objet `Lap` contenant un tableau `samples` (un échantillon environ tous les 5 m). Champs mappés :

| FH Companion | Canal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (décalés pour que le tour commence à 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | les mêmes, en minuscules |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², malgré le nom) |
| `Puddle` | `puddle` |

La voiture vient de `Lap.carOrdinal`, `Lap.carName` (fichiers récents seulement), `Class` (ou `Lap.carClass` comme indice de classe Forza), `Lap.performanceIndex`, `Lap.drivetrain` et `Lap.peakKilowatts` ; le temps vient de `Lap.lapSeconds` ; une course avec `EndedAtFinish: false` est partielle. Le jeu est `forza-horizon`.

Ces fichiers ne contiennent aucune donnée de pneu ni de cap, donc les blocages, le patinage et les glissades ne peuvent pas être jugés à partir d'eux seuls ; les poussées (à partir de la direction par rapport à la trajectoire) et les chocs et collisions le sont toujours. Choisissez aussi le `.tele.gz` à côté de chacun pour le reste.

#### Télémétrie FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Du JSON compressé en gzip `{ version, columns, data }` : tout le Data Out de Forza pour un tour, une ligne par paquet, avec les noms de champs du jeu. Les colonnes sont retrouvées par leur nom, jamais par leur position. Le format 2 garde chaque paquet (environ 110 par seconde contre les 64 ticks du jeu) ; une ligne identique à la précédente pour tout sauf l'horloge propre à l'enregistreur (`t`, `metres`) est supprimée, si bien qu'un tour se lit à 64 lignes par seconde, comme le jeu. (L'infobulle du bouton de chargement le dit : « pour le glissement de chaque pneu à 64 Hz ».)

| Champ de Data Out | Canal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (repère de la voiture : x droite, y haut, z avant) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, ramenés de 0..255 à 0..1 |
| `Steer` | `steer`, ramené de -127..127 à -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, converti de Fahrenheit en °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` par roue |

`<Wheel>` vaut `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Le glissement est marqué `peak` (le glissement normalisé de Forza : au-delà de 1, le pneu a lâché).

**Jumelage.** Un fichier de tour `<tour>.json` et `<tour>.json.tele.gz` choisis ou déposés ensemble (même chemin, sauf pour `.tele.gz`) ne forment qu'**un** tour : les canaux de la télémétrie, avec la voiture, la classe, le temps, la piste et l'indicateur partiel du fichier de tour. Le nom de voiture du fichier de télémétrie l'emporte quand il en a un. Un `.tele.gz` seul se charge quand même : les fichiers de format 2 portent `car` (`ordinal`, `name`, `class`, `pi`), `track` et `lapSeconds` ; sans eux, le temps du tour est la durée propre à la télémétrie et la voiture est inconnue.

#### iRacing `.ibt` {#iracing-ibt}

Le fichier de télémétrie d'iRacing se lit directement (dans le navigateur, sans conversion) : l'en-tête de 112 octets, le sous-en-tête de disque de 32 octets, la table des variables (144 octets par canal) et le YAML de session.

- **Canaux obligatoires :** `SessionTime`, `Lap`, `Lat`, `Lon`. Sans eux : « … n'a pas de canaux SessionTime, Lap, Lat et Lon - est-ce un fichier de télémétrie iRacing ? »
- **Positions :** latitude et longitude sont disposées en mètres sur un plan tangent au premier relevé non nul (rayon de la Terre 6 371 008,8 m) : x vers l'est, z vers le sud, y l'altitude (`Alt`) - ainsi, avec le cap par défaut vers le nord, le nord est en haut de l'écran. Ce n'est pas le repère propre au circuit : un modèle de circuit extrait ne s'alignerait pas.
- **Tours :** la session est coupée là où `Lap` change ; un tour est gardé quand il a plus de 60 échantillons, commence sous 5 % de `LapDistPct` et finit au-dessus de 95 %. Les tours partiels sont supprimés. S'il n'en reste aucun : « … n'a aucun tour complet du circuit de N km » (longueur du circuit tirée du YAML) ou « … n'a aucun tour complet ».
- **Distance :** `LapDist` depuis le départ du tour, sinon additionnée à partir des positions.
- **Voiture :** depuis `DriverInfo` : `CarScreenName` du joueur, `CarID` (comme numéro de voiture) et `CarClassShortName` (comme classe). Piste : `TrackDisplayName`, sinon `TrackName`.

Canaux mappés :

| iRacing | Canal | Conversion |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | mêmes noms | - |
| `Clutch` | `clutch` | `1 - v` (iRacing compte l'enclenchement ; le nôtre est la pédale) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radians dans le sens inverse des aiguilles, vers -1..1 avec droite positive ; maximum d'au moins 0,1, π s'il est absent) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | mêmes, en minuscules | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | divisé par 100 quand il dépasse 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | température du milieu de la carcasse |
| `LFshockDefl` ... | `suspensionM.FL` ... | débattement de l'amortisseur, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa en psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Préfixes de roue : `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Chaque autre** canal à une valeur par échantillon (et non du type à champ de bits) est repris sous son propre nom - par roue quand il commence par un préfixe de roue (`RRspeed` devient `speed.RR`) - si bien que les graphiques et les listes de valeurs des fiches les proposent tous. iRacing n'enregistre aucun glissement de pneu : la maîtrise de la voiture se juge à partir de l'angle de dérive - `Yaw`, ajusté à la direction de déplacement, par rapport à là où va la voiture - et de la direction par rapport à la trajectoire. Le taux de lacet par rapport à l'accélération latérale ne sert que lorsque le cap ne peut pas être ajusté, donc il n'y a pas d'angle de dérive (voir [Événements de maîtrise de la voiture](race-control-events.md)).

Erreurs : « … est trop court pour être un fichier .ibt », « … n'a pas d'en-tête de télémétrie iRacing », « … n'a aucun relevé de position ».

#### CSV de tour {#lap-csv}

Une ligne par échantillon ; plusieurs tours dans un même fichier se distinguent par une colonne `lap`. Le séparateur est détecté à partir des cinq premières lignes. Une première ligne facultative `# { ...json... }` décrit le parcours : `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Colonne (sans tenir compte de la casse) | Canal |
|---|---|
| `x`, `y`, `z` | position (`x` et `z` obligatoires) |
| `elapsed` ou `time` | `time` (obligatoire par tour) |
| `metres` ou `distance` | `distance` (sinon additionnée à partir des positions) |
| `speed_ms` ou `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | les mêmes |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| tout nom de canal canonique, par ex. `latVel`, `slipIndex.FL` | lui-même |
| `lap` | le tour auquel appartient une ligne |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | temps du tour, numéro de voiture, classe, PI, piste (depuis la première ligne de chaque tour) |

Sans description, le jeu est pris comme `forza-horizon` et chaque tour comme complet. La source d'un tour s'affiche `<fichier> · <tour>` quand le fichier en contient plusieurs. Erreurs : « … n'a aucune ligne », « … n'a pas de colonnes x et z », « … n'a aucun tour avec une colonne de temps ».

#### Discipline et surface {#discipline-and-surface}

Ce que l'analyse suppose d'un tour quand le tour ne le dit pas (`lap.ts`) :

- **Discipline :** `meta.discipline`, sinon un nom de jeu correspondant à `rally|wrc|dirt|rbr` est **rallye**, `trackmania` est **arcade**, tout le reste **circuit**.
- **Surface :** `meta.surface`, sinon d'après le nom de la piste et la source : un rallye nommé `monte` est **mixte** ; `snow|ice|winter|arctic|sweden` donne **neige** ; les rallyes sur asphalte (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, ou les mots tarmac/asphalt) donnent **asphalte** ; tout nom contenant `scramble|trail|cross country|dirt|gravel` donne **meuble** ; une autre épreuve de rallye est jugée d'après la façon dont la voiture a été conduite : sur les échantillons plus rapides que 12 m/s et au sol (au moins 200 d'entre eux), un 95e centile d'accélération latérale de 10 m/s² ou plus, avec un angle de dérive médian sous 6° (relevé là où la voiture prenait un virage à 70 % de cette vitesse ou plus, au moins 30 échantillons), donne asphalte ; tout autre cas, ou trop peu de données pour trancher, donne meuble. Un nom de non-rallye contenant `rally` est meuble ; tout le reste est asphalte.
- Par échantillon, un canal `loose` (le bruit de roulement de surface de Forza, les matériaux de Trackmania, voir [Événements de maîtrise de la voiture](race-control-events.md#the-ground)) remplace la surface du tour.
