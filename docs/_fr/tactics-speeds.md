---
title: "Vitesses de déplacement"
parent: "Tableau tactique"
nav_order: 1
lang: "fr"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Vitesses de déplacement

Combien de temps faut-il à un soldat, un char ou un avion à réaction pour aller de A à B ? Cette page dit à quelle vitesse se déplace chaque figurine sur le [tableau tactique](tactics-board.md), et d’où viennent ces chiffres, pour que vous puissiez faire confiance aux durées de votre plan ou les changer.

Le [tableau tactique](tactics-board.md) calcule la durée d’un plan à partir de la vitesse de chaque figurine. Les vitesses viennent d’un fichier par jeu dans `src/tactics/speeds/` : une vitesse pour chaque mode de déplacement de chaque classe (infanterie, véhicules terrestres, bateaux, aéronefs, hélicoptères), plus des profils nommés, comme un profil par arme de CS2 ou par type d’aéronef. Chaque fichier énumère ses sources, et chaque valeur indique si elle est **officielle** (les données du jeu, ou les chiffres publiés d’un avion réel) ou **approximative** (mesurée par la communauté ou valeur typique).

Ce sont des points de départ. **Chaque figurine peut remplacer ses vitesses sur le tableau**, si bien qu’un plan peut utiliser une vitesse mesurée, un soldat chargé ou un char endommagé.

## Modes {#modes}

| Classe | Modes |
|---|---|
| Infanterie | ramper (à plat ventre), accroupi, marcher (la marche lente et silencieuse), courir (déplacement par défaut), sprinter |
| Véhicules terrestres, bateaux | ramper, prudent, normal (tout-terrain), à fond (vitesse maximale sur route) |
| Aéronefs, hélicoptères | lent (approche, attente, vol stationnaire au sol), croisière, combat (vitesse en virage ou passe d’attaque), maximum |

Un mode que le jeu n’a pas reste vide : CS2 et Valorant n’ont ni sprint ni position couchée.

## Pentes {#slopes}

Chaque fichier dit aussi comment le jeu traite les pentes. CS2, Valorant et Squad plafonnent la vitesse horizontale, si bien qu’une pente ne ralentit pas un joueur. Arma ralentit l’infanterie en pente, si bien que son fichier et le fichier générique utilisent la fonction de randonnée de Tobler. Battlefield et les simulateurs de véhicules utilisent une pénalité de pente simple.

## Par jeu {#per-game}

**Counter-Strike 2** (unités par seconde ; une unité est prise comme un pouce). **Officiel.** Les vitesses de course sont les valeurs `m_flMaxSpeed` des définitions d’armes du jeu : le couteau et la C4 à 250, les grenades à 245, les pistolets à 240 (Desert Eagle 230, R8 180), les pistolets-mitrailleurs de 220 à 240, les fusils de 210 à 225, l’AWP à 200, les mitrailleuses légères à 195 et 150. L’AWP avec lunette (100), l’AUG et le SG 553 (150) et le G3SG1 et le SCAR-20 (120) ont leurs propres profils. La marche vaut la course × 0.52 et l’accroupissement la course × 0.34. Valve ne publie pas ces deux coefficients, mais chaque arme les montre dans les enregistrements de démos. Pour vérifier un plan par rapport au mouvement réel, chargez une démo sur la même carte et comparez les vitesses des joueurs.

**Valorant** (m/s). Le couteau court à 6.75 m/s. Chaque arme multiplie cette valeur par son coefficient de vitesse de course issu des données du jeu, ce qui donne les vitesses que montre l’Arsenal en jeu : 5.73 pour la plupart des armes de poing et des pistolets-mitrailleurs, 5.4 pour les fusils, 5.13 pour les lourdes et l’Operator, 5.06 pour les fusils à pompe. Ces vitesses de course sont exactes. Les vitesses de marche et d’accroupissement sont des **estimations** (0.55 et 0.4 × course) car Riot ne les publie pas. Les profils de sniper avec lunette sont aussi des estimations.

**Battlefield** (km/h). **Approximatif.** EA ne publie aucun chiffre de mouvement. Infanterie : environ 1 m/s couché, 2 accroupi, 4 en courant et 6.4 en sprintant. Les véhicules, avions à réaction, hélicoptères et bateaux reçoivent les vitesses typiques en jeu de leur classe.

**Squad** (km/h). **Approximatif.** La course (3.3 m/s) et le sprint (5.9 m/s) viennent d’une présentation des mécaniques du jeu rédigée par la communauté. Ramper, l’accroupi et la marche lente sont des estimations, et c’est aussi le cas de chaque classe de véhicule et des hélicoptères.

**Arma** (km/h). **Approximatif.** Les allures de l’infanterie sont des relevés de la communauté : environ 5 km/h en marchant, 9 km/h en allure tactique accroupie, 15 km/h au trot et environ 21 km/h en sprint. Les vitesses maximales des véhicules sont les maximums configurés des véhicules d’origine d’Arma 3 de chaque classe, d’après un recensement tiers. Les modes plus lents des véhicules sont des estimations.

**DCS / War Thunder / IL-2** (km/h). Chaque avion et hélicoptère de la palette a son propre profil. Les vitesses de croisière et maximales sont les **chiffres publiés** des avions réels, que les simulateurs modélisent de près. Le maximum se mesure au niveau de la mer pour les avions à réaction et à l’altitude nominale pour les avions à hélice, et la note de chaque profil dit lequel. Les vitesses lente et de combat sont des valeurs typiques. Les véhicules terrestres utilisent les vitesses routières publiées des véhicules réels, arrondies (**approximatif**). Les navires utilisent les vitesses maximales publiées de leur classe.

**Autre** (m/s). Valeurs par défaut **approximatives** du monde réel : ramper 0.5, accroupi 1.5, marcher 1.4, courir 3.5, sprint 6.

## Sources {#sources}

Counter-Strike 2
- [Définitions d’armes de CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Pages d’armes de CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki : Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com, armes (coefficients de vitesse de course)](https://valorant-api.com/v1/weapons)
- [VLR.gg : vitesse du couteau 6.75 m/s](https://vlr.gg/post/4240306)
- [Support Riot : Marche, course et accroupissement](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forums EA : vitesse de mouvement de Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Guide de mouvement de Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Rapport de pré-sortie d’un sprint à 6.4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad : publication sur les mécaniques de Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ne publie aucune vitesse)

Arma
- [Forums Bohemia : vitesse de marche](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forums Bohemia : réglage de la vitesse de mouvement](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Suivi des retours d’Arma 3 : vitesse de sprint](https://feedback.bistudio.com/T64047)
- [Manuel de terrain d’Arma 3 : commandes de l’infanterie](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Caractéristiques des véhicules d’Arma 3 par faction (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Les fiches Wikipédia de chaque type d’avion et d’hélicoptère, liées depuis chaque profil de `air.json`
- [Vitesses V](https://en.wikipedia.org/wiki/V_speeds), pour les vitesses typiques d’approche et de combat
- [Wiki de War Thunder](https://wiki.warthunder.com/), pour les véhicules terrestres
- [Destroyer de classe Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), et les vitesses publiées des autres classes de navires

Autre
- [Vitesse de marche préférée](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Fonction de randonnée de Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
