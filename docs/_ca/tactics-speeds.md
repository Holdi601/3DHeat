---
title: "Velocitats de moviment"
parent: "Pissarra tàctica"
nav_order: 1
lang: "ca"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Velocitats de moviment

Quant triga un soldat, un tanc o un avió a anar d'A a B? Aquesta pàgina diu a quina velocitat es mou cada figura a la [pissarra tàctica](tactics-board.md), i d'on surten aquests números, perquè puguis confiar en els temps del teu pla o canviar-los.

La [pissarra tàctica](tactics-board.md) calcula el temps d'un pla a partir de la velocitat de cada figura. Les velocitats surten d'un fitxer per joc a `src/tactics/speeds/`: una velocitat per a cada mode de moviment de cada classe (infanteria, vehicles terrestres, vaixells, avions, helicòpters), més perfils amb nom com un per a cada arma de CS2 o un per a cada tipus d'avió. Cada fitxer enumera les seves fonts, i cada valor diu si és **oficial** (les dades del propi joc, o les xifres publicades d'un avió real) o **aproximat** (mesurat per la comunitat o un valor típic).

Són punts de partida. **Cada figura pot canviar les seves velocitats a la pissarra**, de manera que un pla pot fer servir una velocitat mesurada, un soldat carregat o un tanc malmès.

## Modes {#modes}

| Classe | Modes |
|---|---|
| Infanteria | arrossegar-se (ventre a terra), ajupit, caminar (el pas lent i silenciós), córrer (moviment per defecte), esprintar |
| Vehicles terrestres, vaixells | arrossegar-se, precaució, normal (a través del terreny), accelerar (velocitat màxima per carretera) |
| Avions, helicòpters | lenta (aproximació, espera, hover-taxi), creuer, combat (velocitat de cantonada o passada d'atac), màxima |

Un mode que el joc no té queda buit: CS2 i Valorant no tenen esprint ni arrossegar-se.

## Pendents {#slopes}

Cada fitxer també diu com el joc tracta els pendents. CS2, Valorant i Squad limiten la velocitat horitzontal, de manera que un pendent no alenteix un jugador. Arma alenteix la infanteria en els pendents, així que el seu fitxer i el genèric fan servir la funció d'excursionisme de Tobler. Battlefield i els simuladors de vehicles fan servir una penalització simple de desnivell.

## Per joc {#per-game}

**Counter-Strike 2** (unitats per segon; una unitat es pren com una polzada). **Oficial.** Les velocitats de córrer són els valors `m_flMaxSpeed` de les definicions d'armes del joc: el ganivet i la C4 250, les granades 245, les pistoles 240 (Desert Eagle 230, R8 180), els SMG de 220 a 240, els rifles de 210 a 225, l'AWP 200, les LMG 195 i 150. L'AWP amb mira (100), l'AUG i el SG 553 (150) i el G3SG1 i el SCAR-20 (120) tenen els seus propis perfils. Caminar és córrer × 0,52 i ajupir-se és córrer × 0,34. Valve no publica aquests dos multiplicadors, però cada arma els mostra en les gravacions de demos. Per comprovar un pla amb el moviment real, carrega una demo del mateix mapa i compara les velocitats dels jugadors.

**Valorant** (m/s). El ganivet corre a 6,75 m/s. Cada arma multiplica això pel seu multiplicador de velocitat de córrer de les dades del joc, cosa que dona les velocitats que mostra l'Arsenal del joc: 5,73 per a la majoria de pistoles i SMG, 5,4 per als rifles, 5,13 per a les armes pesades i l'Operator, 5,06 per a les escopetes. Aquestes velocitats de córrer són exactes. Les velocitats de caminar i d'ajupir-se són **estimacions** (0,55 i 0,4 × córrer) perquè Riot no les publica. Els perfils de franctiradors amb mira també són estimacions.

**Battlefield** (km/h). **Aproximat.** EA no publica xifres de moviment. Infanteria: uns 1 m/s ventre a terra, 2 ajupida, 4 corrent i 6,4 esprintant. Els vehicles, els avions, els helicòpters i els vaixells reben velocitats típiques del joc per a la seva classe.

**Squad** (km/h). **Aproximat.** Córrer (3,3 m/s) i esprint (5,9 m/s) surten d'un resum de la comunitat sobre les mecàniques del joc. Arrossegar-se, ajupir-se i caminar lent són estimacions, i també ho és cada classe de vehicle i els helicòpters.

**Arma** (km/h). **Aproximat.** Els ritmes de la infanteria són temps de la comunitat: uns 5 km/h caminant, 9 km/h al pas tàctic ajupit, 15 km/h trotant i uns 21 km/h esprintant. Les velocitats màximes dels vehicles són els màxims configurats dels vehicles originals d'Arma 3 de cada classe, segons un llistat de tercers. Els modes més lents dels vehicles són estimacions.

**DCS / War Thunder / IL-2** (km/h). Cada avió i helicòpter de la paleta té el seu propi perfil. Les velocitats de creuer i màximes són les **xifres publicades** dels avions reals, que els simuladors modelen de prop. La màxima és al nivell del mar per als reactors i a l'altitud nominal per als avions d'hèlix, i la nota de cada perfil diu quin és el cas. Les velocitats lentes i de combat són valors típics. Els vehicles terrestres fan servir les velocitats de carretera publicades dels vehicles reals, arrodonides (**aproximat**). Els vaixells fan servir les velocitats màximes publicades de la seva classe.

**Altres** (m/s). Valors per defecte del món real, **aproximats**: arrossegar-se 0,5, ajupir-se 1,5, caminar 1,4, córrer 3,5, esprintar 6.

## Fonts {#sources}

Counter-Strike 2
- [Definicions d'armes de CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Pàgines d'armes de CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [Armes de valorant-api.com (multiplicadors de velocitat de córrer)](https://valorant-api.com/v1/weapons)
- [VLR.gg: velocitat del ganivet 6,75 m/s](https://vlr.gg/post/4240306)
- [Suport de Riot: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Fòrums d'EA: velocitat de moviment de Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Guia de moviment de Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Informe de prellançament d'un esprint de 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: publicació sobre les mecàniques de joc de Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (no publica velocitats)

Arma
- [Fòrums de Bohemia: velocitat de caminar](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Fòrums de Bohemia: ajust de la velocitat de moviment](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Seguiment de comentaris d'Arma 3: velocitat d'esprint](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Estadístiques de vehicles d'Arma 3 per facció (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Les especificacions de la Wikipedia de cada tipus d'avió i helicòpter, enllaçades des de cada perfil a `air.json`
- [Velocitats V](https://en.wikipedia.org/wiki/V_speeds), per a les velocitats típiques d'aproximació i de combat
- [Wiki de War Thunder](https://wiki.warthunder.com/), per als vehicles terrestres
- [Destructor de classe Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), i les velocitats publicades de les altres classes de vaixells

Altres
- [Velocitat de caminar preferida](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Funció d'excursionisme de Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
