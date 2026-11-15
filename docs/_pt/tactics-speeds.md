---
title: "Velocidades de movimento"
parent: "Quadro tático"
nav_order: 1
lang: "pt"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---


# Velocidades de movimento

Quanto tempo leva um soldado, um tanque ou um jato a ir de A a B? Esta página diz a velocidade de cada figura no [quadro tático](tactics-board.md), e de onde vêm esses números, para que possa confiar nos tempos do seu plano ou mudá-los.

O [quadro tático](tactics-board.md) calcula o tempo de um plano a partir da velocidade de cada figura. As velocidades vêm de um ficheiro por jogo em `src/tactics/speeds/`: uma velocidade para cada modo de movimento de cada classe (infantaria, veículos terrestres, barcos, aeronaves, helicópteros), mais perfis com nome, como um por arma do CS2 ou um por tipo de aeronave. Cada ficheiro lista as suas fontes, e cada valor diz se é **oficial** (os dados do próprio jogo, ou os números publicados de um avião real) ou **aproximado** (medido pela comunidade ou um valor típico).

São pontos de partida. **Cada figura pode substituir as suas velocidades no quadro**, por isso um plano pode usar uma velocidade medida, um soldado sobrecarregado ou um tanque danificado.

## Modos {#modes}

| Classe | Modos |
|---|---|
| Infantaria | rastejar (de bruços), agachado, andar (o passo lento e silencioso), correr (movimento predefinido), sprint |
| Veículos terrestres, barcos | rastejar, cautelosa, normal (todo-o-terreno), pressa (velocidade máxima na estrada) |
| Aeronaves, helicópteros | lenta (aproximação, pairar, táxi em pairagem), cruzeiro, combate (velocidade de curva ou passagem de ataque), máxima |

Um modo que o jogo não tem fica vazio: o CS2 e o Valorant não têm sprint nem rastejar de bruços.

## Declives {#slopes}

Cada ficheiro também diz como o jogo trata os declives. O CS2, o Valorant e o Squad limitam a velocidade horizontal, por isso um declive não abranda um jogador. O Arma abranda a infantaria nos declives, por isso o seu ficheiro e o genérico usam a função de caminhada de Tobler. O Battlefield e as simulações de veículos usam uma penalização simples de inclinação.

## Por jogo {#per-game}

**Counter-Strike 2** (unidades por segundo; uma unidade é tomada como uma polegada). **Oficial.** As velocidades de corrida são os valores `m_flMaxSpeed` das definições de armas do jogo: a faca e o C4 250, as granadas 245, as pistolas 240 (Desert Eagle 230, R8 180), as SMG de 220 a 240, os fuzis de 210 a 225, a AWP 200, as metralhadoras ligeiras 195 e 150. A AWP com mira (100), a AUG e a SG 553 (150) e a G3SG1 e a SCAR-20 (120) têm perfis próprios. Andar é a corrida × 0,52 e agachar é a corrida × 0,34. A Valve não publica estes dois multiplicadores, mas todas as armas os mostram nas gravações de demos. Para confrontar um plano com o movimento real, carregue uma demo do mesmo mapa e compare as velocidades dos jogadores.

**Valorant** (m/s). A faca corre a 6,75 m/s. Cada arma multiplica isso pelo seu multiplicador de corrida dos dados do jogo, o que dá as velocidades que o Arsenal do jogo mostra: 5,73 para a maioria das pistolas e SMG, 5,4 para os fuzis, 5,13 para as armas pesadas e o Operator, 5,06 para as caçadeiras. Estas velocidades de corrida são exatas. As velocidades de andar e de agachar são **estimativas** (0,55 e 0,4 × corrida) porque a Riot não as publica. Os perfis de sniper com mira também são estimativas.

**Battlefield** (km/h). **Aproximado.** A EA não publica números de movimento. Infantaria: cerca de 1 m/s de bruços, 2 agachada, 4 a correr e 6,4 em sprint. Veículos, jatos, helicópteros e barcos recebem velocidades típicas do jogo para a sua classe.

**Squad** (km/h). **Aproximado.** A corrida (3,3 m/s) e o sprint (5,9 m/s) vêm de um texto da comunidade sobre as mecânicas do jogo. Rastejar, agachar e o andar lento são estimativas, e também o são todas as classes de veículos e helicópteros.

**Arma** (km/h). **Aproximado.** Os passos da infantaria são medições da comunidade: cerca de 5 km/h a andar, 9 km/h no passo tático agachado, 15 km/h a trotar e cerca de 21 km/h em sprint. As velocidades máximas dos veículos são os máximos configurados dos veículos base do Arma 3 de cada classe, a partir de uma lista de terceiros. Os modos de veículo mais lentos são estimativas.

**DCS / War Thunder / IL-2** (km/h). Cada avião e helicóptero da paleta tem o seu próprio perfil. As velocidades de cruzeiro e máxima são os **números publicados** das aeronaves reais, que as simulações modelam de perto. A máxima é ao nível do mar para os jatos e na altitude nominal para as aeronaves de hélice, e a nota de cada perfil diz qual. As velocidades lenta e de combate são valores típicos. Os veículos terrestres usam as velocidades de estrada publicadas dos veículos reais, arredondadas (**aproximado**). Os navios usam as velocidades máximas publicadas da sua classe.

**Outro** (m/s). Valores predefinidos do mundo real, **aproximados**: rastejar 0,5, agachado 1,5, andar 1,4, correr 3,5, sprint 6.

## Fontes {#sources}

Counter-Strike 2
- [Definições de armas do CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Páginas de armas da CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [Armas do valorant-api.com (multiplicadores de corrida)](https://valorant-api.com/v1/weapons)
- [VLR.gg: velocidade da faca 6,75 m/s](https://vlr.gg/post/4240306)
- [Suporte da Riot: Andar, correr e agachar](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Fóruns da EA: velocidade de movimento do Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Guia de movimento do Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Relatório pré-lançamento de um sprint de 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: texto sobre as mecânicas do Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (não publica velocidades)

Arma
- [Fóruns da Bohemia: velocidade a andar](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Fóruns da Bohemia: ajuste da velocidade de movimento](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Registo de feedback do Arma 3: velocidade de sprint](https://feedback.bistudio.com/T64047)
- [Manual de campo do Arma 3: controlos da infantaria](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Estatísticas de veículos do Arma 3 por facção (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- As especificações da Wikipédia de cada tipo de avião e helicóptero, ligadas a partir de cada perfil em `air.json`
- [Velocidades V](https://en.wikipedia.org/wiki/V_speeds), para as velocidades típicas de aproximação e de combate
- [Wiki do War Thunder](https://wiki.warthunder.com/), para os veículos terrestres
- [Contratorpedeiro classe Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), e as velocidades publicadas das outras classes de navios

Outro
- [Velocidade preferida de caminhada](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Função de caminhada de Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
