---
title: "Autres jeux de course"
parent: "Analyse de course"
nav_order: 59
lang: "fr"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Autres jeux de course dans la visionneuse

La visionneuse lit les tours de nombreux jeux de course, pas d'un seul. Cette page les liste et explique comment obtenir un tour de chacun.

## Les jeux {#the-games}

| Jeu | Enregistreur | Glissement dans le fichier ? | Monde en miroir ? | Remarques |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out par UDP), ou les fichiers de tour de FH Companion avec leurs `.tele.gz` | oui, par roue (normalisé) | oui (monde gaucher) | le `.tele.gz` à côté de chaque tour de FH Companion donne le glissement de chaque roue ; le fichier de tour seul ne le donne pas |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (mémoire partagée) | oui, par roue | mesuré à partir des tours | aussi l'ABS et l'antipatinage en action, les charges de roue, les températures |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | non, calculé à partir des vitesses de roue | mesuré à partir des tours | rallye : le terrain meuble et les sauts sont jugés autrement |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (UDP NGP) | non | mesuré à partir des tours | pas de vitesses de roue |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (un mod) | non, calculé à partir des vitesses de roue | mesuré à partir des tours | |
| Trackmania | le plugin Openplanet, `telemetry --game trackmania --install` | un coefficient de glissement par roue | mesuré à partir des tours | physique d'arcade : les dérapages sont jugés autrement |
| iRacing | aucun : son propre fichier `.ibt` | non (pas enregistré) ; calculé à partir du lacet | non (basé sur le GPS) | activez l'enregistrement dans la voiture avec Alt+L |

## Enregistrer un tour {#how-to-record-a-lap}

1. Choisissez votre jeu dans le tableau et réglez-le comme l'indique la page de l'enregistreur pour ce jeu (un réglage dans le jeu, un mod, ou rien du tout pour iRacing). Les étapes changent d'un jeu à l'autre. Elles sont donc dans les documents des enregistreurs : [GameCapture : jeux](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Lancez l'enregistreur, puis conduisez. Il écrit un fichier par tour.
3. Dans l'onglet **Analyse de course**, appuyez sur **Charger des tours…** et choisissez deux tours ou plus du même circuit (voir [Charger les tours](race-loading-laps.md)).

Pour les jeux de rallye, l'enregistreur donne un fichier par passage de spéciale. Pour Forza, le plus simple est de commencer par la bibliothèque de FH Companion, avec ses fichiers `.tele.gz` à côté des fichiers de tour.

## Ce que documentent les enregistreurs {#what-the-recorders-document}

Comment chaque jeu est enregistré, ce qu'il envoie, les sources de ses formats, et quels circuits peuvent être exportés depuis ses fichiers : c'est aux enregistreurs de le documenter. Voir [GameCapture : jeux](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (public, dans [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)). Le fichier de tour que chaque enregistreur écrit est décrit dans [GameCapture : le format de tour](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## Ce que fait la visionneuse avec eux {#what-the-viewer-does-with-them}

Chaque jeu finit en fichiers `heat3d-lap` (ou en CSV de tour, ou il est lu directement, comme le `.ibt` d'iRacing). Les noms de canaux sont ceux de `src/race/schema.ts`. Un bloc `meta` indique ce que signifient ses nombres : comment son glissement est mis à l'échelle, circuit, rallye ou arcade, la surface si elle est connue. Ainsi l'onglet **Analyse de course** traite tous les jeux de la même façon. Quand aucun modèle de circuit n'est chargé, l'onglet **Analyse de course** trace une route à partir de la dispersion propre aux tours. Chaque jeu est donc utilisable sans modèle.

Ce qu'aucun des jeux de rallye n'envoie, le glissement des pneus, la visionneuse le calcule. Elle le fait à partir de la zone de contact ou de la vitesse de surface de chaque roue, comparée à la vitesse de la voiture, quand un jeu en envoie une (`(roue - voiture) / voiture`). Elle le fait à partir de la rotation et d'un rayon roulant mesuré sur le tour lui-même, quand un jeu n'envoie que la rotation. L'angle de dérive vient de la vitesse propre de la voiture (Forza, les jeux AC, Trackmania, RBR), de la vitesse du monde projetée sur les axes de la voiture (EA WRC, DiRT, BeamNG), ou du cap comparé au tracé. Le fait que la voiture soit en l'air vient du contact de ses roues, de leurs charges ou de leur suspension. Voir `src/race/derive.ts`.

Quand le monde d'un jeu est gaucher (c'est le cas de Forza), le circuit apparaît en miroir dans la visionneuse. La direction et la suspension des tours le révèlent, et l'onglet **Analyse de course** propose d'inverser un axe. Les jeux dont la latéralité n'est pas documentée (RBR, BeamNG, Trackmania) sont traités de la même façon : mesuré, pas supposé.

Au-delà des canaux de conduite, les enregistreurs gardent ce que chaque jeu ajoute : l'ABS et l'antipatinage en action dans les jeux AC, la répartition de freinage, le DRS, le limiteur de stand, la suralimentation (boost), l'usure des plaquettes et des disques de frein. Pour iRacing, ce sont les aides, la répartition de freinage, le carburant, les températures d'huile et d'eau, et tout autre canal qu'il enregistre sous son propre nom. La visionneuse les affiche à partir de sa table de canaux (voyants, niveaux, symboles, graphiques). Enregistrer davantage ne demande donc aucun changement à la visionneuse.
