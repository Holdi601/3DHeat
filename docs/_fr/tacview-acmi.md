---
title: "Enregistrements Tacview (ACMI)"
parent: "Importer des données"
nav_order: 7
lang: "fr"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
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
