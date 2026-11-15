---
title: "Enregistrements Tacview (ACMI)"
parent: "Importer des données"
nav_order: 7
lang: "fr"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Enregistrements Tacview (ACMI)

Tacview est un logiciel qui enregistre les vols dans les simulateurs de vol ; ses fichiers finissent par `.acmi`. 3DHeat les ouvre pour que vous voyiez où chaque avion a volé.

Les enregistrements de vol de Tacview se chargent comme n'importe quelle table : choisissez ou déposez un `.acmi` (texte, `.txt.acmi`, ou compressé, `.zip.acmi`) et appuyez sur **Charger**. Vous obtenez alors la chaleur de tous les vols et, dans l'onglet **Match**, un replay avec les figurines, les traces et une liste d'événements ([Replay de match](match-replay.md)). ACMI est le format de fichier public de Tacview ([documentation](https://www.tacview.net/documentation/acmi/)). DCS (par l'exportateur de Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS et d'autres l'écrivent. La visionneuse lit donc n'importe lequel d'entre eux.

## Ce que devient un enregistrement {#what-a-recording-becomes}

Une ligne à chaque fois que la position d'un objet est écrite, une ligne par événement à l'endroit de l'objet, et une ligne quand un objet disparaît (`Removed`, à son dernier emplacement). Un événement qui ne concerne aucun objet déjà vu (un signet, un message à tous) est une ligne de l'objet `(recording)` au point de référence. L'enregistrement porte ses propres instructions de lecture : l'étape de correspondance se remplit donc toute seule. Le lecteur écrit ces colonnes : `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, puis toute autre propriété que l'enregistrement possède. Leurs rôles :

| Colonne | Rôle | Sens |
|---|---|---|
| Time | temps | Secondes après le ReferenceTime de l'enregistrement ; secondes Unix quand il en a un, pour que l'horloge affiche l'heure réelle. |
| X, Y | position | Est et nord, en mètres, sur un plan tangent à la Terre au point de référence de l'enregistrement : distances et caps sont justes près de lui, avec une dérive de moins d'un millième à 100 km. Le nord devient le -Z du monde. |
| Altitude | position (haut) | Mètres. |
| Object | personne | Le pilote et le nom de l'objet avec son identifiant, par exemple `Viper 1 (F-16C_50) #a01` ; un objet sans pilote `(T-90A) #401`. |
| Coalition | équipe | Le camp (ou la couleur, quand il n'y a pas de coalition). |
| Heading, Pitch | regard | En degrés ; un cap de 0 est le nord. |
| Recording | session | Le Title de l'enregistrement, ou le nom du fichier : plusieurs enregistrements se chargent côte à côte sans que leurs traces se rejoignent. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtres | Gardés pour le filtrage. Type et Name choisissent la [figurine](figures.md) de chaque objet, Event alimente la liste d'événements du débriefing, Roll incline l'avion. |
| U, V | | Les mètres propres au monde plat du jeu, quand chaque échantillon les a (DCS les écrit). |
| EventObjects | filtres | Chaque objet qu'un événement nomme (`Message|a01|b02|...`), par identifiant. |
| RecordingInfo | | Les propriétés propres de l'enregistrement telles qu'elles étaient à ce moment (DataSource, DataRecorder, Author, Category, Briefing, Comments, ...), en JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtres | Toute autre propriété numérique que l'enregistrement porte. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtres | Toute autre propriété texte que l'enregistrement porte. Une propriété dont la valeur n'est pas un nombre est du texte. |

Les quatre formes de position de Tacview (`lon|lat|alt`, avec `u|v`, avec `roll|pitch|yaw`, et avec toutes ces valeurs plus un cap) sont toutes lues. Un champ vide garde la dernière valeur. `-id` supprime un objet, et un identifiant réutilisé après cela est un nouvel objet. Les virgules échappées et les lignes continuées sont gérées.

Les positions sont toujours projetées à partir de la latitude et de la longitude, jamais prises de U/V. Ainsi, les enregistrements de tous les jeux partagent une même projection, avec un fond du monde réel.

## Serveurs DCS : qui a gagné, et comment chaque sortie s'est terminée {#dcs-servers-who-won-and-how-each-sortie-ended}

Un serveur multijoueur DCS enregistre ses missions avec Tacview jour et nuit, et un serveur PvP persistant mène une campagne sur un grand nombre d'entre elles : un camp gagne en prenant chaque aérodrome, chaque FARP et chaque zone de l'autre, ce qui prend des jours et de nombreux redémarrages de mission. Les enregistrements contiennent les vols, pas la campagne : aucun message ne dit qui a pris quoi, les aérodromes sont écrits une fois au début, et aucun ne dit qui a gagné. Le convertisseur Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) ajoute à chaque ligne ce qui peut être connu, et laisse vide ce qui ne peut pas l'être - il ne devine jamais.

| Colonne | Signification |
|---|---|
| `server` | le serveur ou la campagne, d'après l'en-tête de l'enregistrement (son Title, son Author et ses Comments nomment les serveurs publics connus - Blue Flag, SPS Contention, Growling Sidewinder ; sinon un Author qui nomme quelqu'un) ; `--server Name` le nomme pour tout un dossier. Un enregistrement dont l'en-tête ne nomme aucun serveur - un Author comme `Admin`, un Title et des Comments qu'aucun serveur connu n'écrit - reste sans attribution : `server` vide, même s'il a été téléchargé depuis la page d'enregistrements d'un serveur, car cette page peut aussi contenir des missions d'autres communautés |
| `mission` | le Title de l'enregistrement sans sa version ni son mois de campagne : `Operation_Example_V7.7.99` devient `Operation Example` |
| `campaign` | la manche de campagne à laquelle appartient l'enregistrement, par serveur, carte et numéro : `Example Server North 3`. Un enregistrement est une session (d'un redémarrage à l'autre) ; une manche s'étend sur de nombreuses sessions, des jours ou des semaines |
| `round` | le numéro de cette manche : celui du serveur s'il en publie un, sinon la n-ième manche vue de ce serveur et de cette carte ; tiré d'un fichier de manches (ci-dessous), vide sans lui |
| `session` | la place de l'enregistrement parmi les sessions de la manche, 1, 2, ... ; `sessionStart` son vrai début (secondes Unix) |
| `heldRed`, `heldBlue` | les lieux disputés que chaque camp tenait au début de la session, d'après un fichier de manches chaîné (ci-dessous) |
| `won`, `matchWon` | 1 quand le camp de la ligne (sa Color, Red ou Blue) a gagné cette campagne, 0 quand il l'a perdue ; vide là où aucun fichier de manches ne nomme de vainqueur, et sur les lignes neutres. Une campagne est à la fois la manche et le match, donc les deux contiennent la même valeur |
| `roundEndReason` | `capture` pour une campagne gagnée en prenant tout |
| `won`, `matchWon` sur chaque session d'une manche | le résultat de la manche, écrit sur chacun de ses enregistrements dès que sa fin est connue |
| `sortie` | sur les lignes d'un avion : son vol, 1, 2, ... d'un décollage à l'autre ; le temps au sol avant le premier décollage et après un atterrissage compte pour le vol auquel il appartient |
| `sortieResult` | comment ce vol s'est terminé : `landed`, `landed damaged` (après un coup reçu en vol), `ejected`, `shot down`, `destroyed` (au sol), `crashed`, `despawned` (disparu en vol sans cause visible - un joueur qui part), `airborne at end`, `no takeoff` |
| `sortieKills` | les victoires attribuées à l'avion pendant ce vol |

Sur un serveur persistant, la sortie est l'unité qui a du sens : filtrez sur `sortieResult` = `shot down` pour voir où des vols ont été perdus, ou ventilez la chaleur par `sortieResult` ou par `server` dans le [détail](breakdown.md). Les décollages, atterrissages, éjections, victoires et crashs qui la composent sont les événements que le convertisseur déduit de la façon dont les avions se déplacent (ci-dessus).

Les lieux pris entre deux sessions d'une manche - connus par le fichier de manches, ci-dessous - sont des événements `capture` au début de l'enregistrement suivant : `Object` `(campaign)`, au lieu concerné, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Un aérodrome ou un FARP qui change de camp là où l'enregistrement le montre - écrit à nouveau dans l'autre couleur, ou supprimé puis écrit à nouveau à sa place dans l'autre en moins de cinq minutes - devient un événement `capture` à la piste : `Event` = `capture`, `Airfield` son nom, `Detail` `Red to Blue`, `Coalition` son nouveau camp. Une piste écrite pour la première fois dans une couleur n'est pas une capture. Les serveurs examinés jusqu'ici écrivent leurs pistes une seule fois, donc leurs enregistrements ne contiennent aucune capture.

### Fichiers de manches {#rounds-files}

Un fichier de manches donne, par serveur, ses manches de campagne, qui les a gagnées et les sessions de chacune. Il vient de ce que le serveur publie, ou des enregistrements eux-mêmes (ci-dessous).

Qui a gagné une campagne, c'est le serveur qui le publie - un journal de campagne sur sa page web -, ce n'est pas dans l'enregistrement. Un fichier de manches le porte, et le convertisseur le lit avec `--rounds file.json` (on peut en donner plusieurs) :

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Un enregistrement appartient aux manches de son `server` dont le `title` (une expression régulière) correspond à son Title ; chaque ligne appartient à la manche dans laquelle tombe son heure réelle - le RecordingTime de l'enregistrement plus les secondes de la ligne, pas la date de la mission dans le jeu. Les heures sont en UTC. Une manche sans vainqueur (passée à la suivante, encore en cours) donne à ses lignes le numéro de manche et un résultat vide.

L'équivalent dans le document du match, le pied de page `acmi`, dit d'où vient le résultat, comme le fait `result.source` pour un match de War Thunder : `outcome.result` vaut `{ winner, round, endReason, source }`, `source` étant la `source` du fichier de manches, ou `null` quand rien n'a nommé de vainqueur. `outcome` liste aussi les manches de l'enregistrement, ses captures et ses sorties selon leur fin :

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Une ligne d'un pilote `Viper 1 (F-16C_50) #a01` du camp bleu dans cette campagne se lit alors : `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Des manches tirées des enregistrements eux-mêmes {#rounds-from-the-recordings-themselves}

Un serveur persistant garde sa campagne d'un redémarrage à l'autre, et chaque enregistrement commence avec les unités au sol et les objets statiques des deux camps là où la campagne les a laissés. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` lit les premières minutes de chaque enregistrement ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), range dans l'ordre du temps les enregistrements d'une même carte pour chaque serveur, et les chaîne :

- **Lieux** : le sol en cellules d'environ 2 km ; une cellule appartient à un camp quand les trois quarts des unités qui s'y trouvent au début d'une session sont les siennes. Les lieux *disputés* sont ceux qu'on a vus tenus par les deux camps.
- **Captures** : un lieu tenu par l'autre camp au début de la session suivante - pris entre les missions, ou pendant la précédente.
- **Une nouvelle manche** : une session dont les lieux diffèrent de ceux de la précédente pour plus de 60 % d'entre eux - la disposition de départ d'une nouvelle manche, pas une étape de l'ancienne. Une manche se termine aussi quand le serveur passe à une autre carte (ses sessions commencent après la dernière et continuent).
- **Qui a gagné** : pour une manche terminée, le camp qui tenait chaque lieu au début de sa dernière session (`capture`, confiance haute), sinon le camp qui tenait le plus de lieux disputés (moyenne s'il en tenait deux fois plus que l'autre, sinon basse ; basse quand elle s'est terminée par un changement de carte). Une manche ouverte n'a pas de vainqueur, mais chaque session dit combien de lieux chaque camp tenait à son début, on voit donc qui était en tête.
- Un serveur dont les sessions commencent toutes de la même façon ne garde aucun état entre elles : il n'est pas chaîné.

Le début de la dernière session peut précéder de plusieurs heures la fin de la manche, c'est pourquoi la confiance compte. Vérifiée sur un serveur qui publie ses vainqueurs, la chaîne a trouvé chaque nouvelle manche à la session où commençait la manche publiée, et le camp en tête au dernier début était le vainqueur publié dans chacune des 9 manches qu'elle a pu vérifier. `--official file.json` garde les manches publiées d'un tel serveur et y ajoute les sessions de la chaîne ; le `validation` du fichier dit dans quelle mesure la chaîne concordait. Dans une campagne inventée :

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Regarder une manche de campagne comme une série {#watching-a-campaign-round-as-a-series}

Chargez ensemble les enregistrements d'une manche - les fichiers dont la `campaign` est la même - et la visionneuse les joue comme une seule série : session après session dans leur ordre réel, les heures ou les jours entre deux sessions réduits à une pause d'une minute. La ligne de temps marque en jaune le début de chaque session et les pauses par des bandes sombres, et l'horloge indique la session en cours et sa date réelle (`session 4/12 · 2026-11-02 12:38 UTC`). La chaleur, le replay, les filtres et les Observations fonctionnent sur toute la série comme sur n'importe quelles données chargées. La section **Manche de campagne** de l'onglet Match liste les sessions avec leurs dates, combien de lieux disputés chaque camp tenait à chaque début - aussi sous forme de graphique sur la manche - et combien ont été pris avant ; un clic mène au début d'une session. Un enregistrement chargé seul y indique de quelle manche et de quelle session il s'agit. Des enregistrements de manches différentes chargés ensemble ne forment pas une série : chacun commence à zéro, comme des matchs séparés. Le chargeur de nombreux matchs (**Beaucoup de matchs à la fois**) joue aussi une manche comme une série, en flux et dimensionnée pour le GPU, pour des manches de nombreux gigaoctets.

Les lieux qui ont changé de mains pendant la manche sont dessinés sur la carte comme des zones de capture, colorées selon le camp qui tenait chacun au début de la session en cours, et changent aux limites des sessions ; chaque changement est une capture dans la liste d'événements du replay. Ils sont déduits des lignes chargées - les unités au sol et les objets statiques de chaque session dans ses premières minutes, en cellules d'environ 2 km, comme le fait la chaîne -, ils ont donc besoin du chargeur complet (le chargeur de nombreux matchs garde trop peu de chaque ligne).

**Charger toute la manche depuis un de ses enregistrements.** Dans un navigateur ordinaire, la visionneuse ne peut pas ouvrir des fichiers que vous n'avez pas choisis : chargez ensemble les fichiers de la manche. Servie par le serveur local de la visionneuse (`npm run dev` ou `npm run preview`), elle le peut : donnez au fichier `tools/local-data.json`, ignoré par git, une entrée `campaigns` qui nomme le dossier des fichiers de manches et les dossiers des enregistrements convertis, et la section Manche de campagne d'un enregistrement seul propose **Charger toute la manche**, récupère les sessions de la manche trouvées là et les charge avec le chargeur de nombreux matchs :

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Seuls les enregistrements qu'un fichier de manches nomme sont servis (`tools/campaign-files.mjs`) ; une session introuvable dans ces dossiers est comptée, pas chargée.

Ce que publient les serveurs connus :

| Serveur | Une manche | Comment un camp gagne | Où lire le vainqueur |
|---|---|---|---|
| SPS Contention | une campagne sur une carte et une époque (des jours), sur de nombreux redémarrages | chaque aérodrome, FARP et place forte pris ; une campagne terminée sans vainqueur a été remplacée par la suivante | le journal de campagne public du serveur (vainqueur, début, fin par campagne) |
| Blue Flag | une manche de campagne sur de nombreuses missions de 5 heures ; le `_YYYY_MM` du Title avance d'un mois à chaque redémarrage | chaque position ennemie prise ; les anciennes manches désignaient le camp qui tenait le plus après une durée fixe | pas publié sous une forme trouvée jusqu'ici ; la chaîne des enregistrements suit chaque manche et qui tient combien à chaque début |
| Growling Sidewinder | une exécution (6 heures) d'une mission de conflit ouvert | zones et aérodromes pris | sa page de statistiques montre des pilotes, pas des résultats ; chaque session commence de la même façon, donc aucune manche ne couvre plusieurs sessions : vide |
| Missions contre l'IA (missions de capture de zones) | une exécution de la mission | le camp des joueurs contre l'IA de la mission : pas de résultat PvP | vide |
| Sans attribution (l'en-tête ne nomme aucun serveur) | - | - | vide, `server` vide aussi |
