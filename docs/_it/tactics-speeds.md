---
title: "Velocità di movimento"
parent: "Lavagna tattica"
nav_order: 1
lang: "it"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Velocità di movimento

Quanto tempo impiega un soldato, un carro o un jet per andare da A a B? Questa pagina dice quanto veloce si muove ogni figura sulla [lavagna tattica](tactics-board.md), e da dove vengono quei numeri, così puoi fidarti dei tempi del tuo piano o cambiarli.

La [lavagna tattica](tactics-board.md) calcola i tempi di un piano in base a quanto veloce si muove ogni figura. Le velocità vengono da un file per gioco in `src/tactics/speeds/`: una velocità per ogni modalità di movimento di ogni classe (fanteria, veicoli terrestri, barche, aerei, elicotteri), più profili con nome come uno per ogni arma di CS2 o uno per ogni tipo di aereo. Ogni file elenca le sue fonti, e ogni valore dice se è **ufficiale** (i dati del gioco stesso, o le cifre pubblicate di un aereo reale) oppure **approssimato** (misurato dalla comunità o un valore tipico).

Sono punti di partenza. **Ogni figura può sovrascrivere le proprie velocità sulla lavagna**, così un piano può usare una velocità misurata, un soldato carico o un carro danneggiato.

## Modalità {#modes}

| Classe | Modalità |
|---|---|
| Fanteria | strisciare (prono), accovacciato, camminare (il passo lento e silenzioso), correre (movimento predefinito), sprint |
| Veicoli terrestri, barche | strisciare, cauto, normale (fuori strada), rapido (velocità massima su strada) |
| Aerei, elicotteri | lenta (avvicinamento, orbita, rullaggio a librarsi), crociera, combattimento (velocità di virata o passata d'attacco), massima |

Una modalità che il gioco non ha resta vuota: CS2 e Valorant non hanno sprint e non hanno la posizione prona.

## Pendii {#slopes}

Ogni file dice anche come il gioco tratta i pendii. CS2, Valorant e Squad limitano la velocità orizzontale, quindi un pendio non rallenta un giocatore. Arma rallenta la fanteria in pendenza, quindi il suo file e quello generico usano la funzione escursionistica di Tobler. Battlefield e i simulatori di veicoli usano una semplice penalità di pendenza.

## Per gioco {#per-game}

**Counter-Strike 2** (unità al secondo; un'unità è presa come un pollice). **Ufficiale.** Le velocità di corsa sono i valori `m_flMaxSpeed` delle definizioni delle armi del gioco: coltello e C4 250, granate 245, pistole 240 (Desert Eagle 230, R8 180), mitra da 220 a 240, fucili da 210 a 225, AWP 200, mitragliatrici leggere 195 e 150. L'AWP con mirino (100), AUG e SG 553 (150) e G3SG1 e SCAR-20 (120) hanno profili propri. Il passo è corsa × 0,52 e l'accovacciato è corsa × 0,34. Valve non pubblica questi due moltiplicatori, ma ogni arma li mostra nelle registrazioni delle demo. Per controllare un piano rispetto al movimento reale, carica una demo sulla stessa mappa e confronta le velocità dei giocatori.

**Valorant** (m/s). Il coltello corre a 6,75 m/s. Ogni arma moltiplica questo valore per il proprio moltiplicatore di velocità di corsa dai dati di gioco, che dà le velocità che mostra l'Arsenale in gioco: 5,73 per la maggior parte delle pistole e dei mitra, 5,4 per i fucili, 5,13 per le armi pesanti e per l'Operator, 5,06 per i fucili a pompa. Queste velocità di corsa sono esatte. Le velocità di passo e accovacciato sono **stime** (0,55 e 0,4 × corsa) perché Riot non le pubblica. Anche i profili dei cecchini con mirino sono stime.

**Battlefield** (km/h). **Approssimato.** EA non pubblica cifre di movimento. Fanteria: circa 1 m/s prona, 2 accovacciata, 4 di corsa e 6,4 in sprint. Veicoli, jet, elicotteri e barche ricevono velocità tipiche in gioco per la loro classe.

**Squad** (km/h). **Approssimato.** La corsa (3,3 m/s) e lo sprint (5,9 m/s) vengono da un approfondimento della comunità sulle meccaniche del gioco. Strisciare, accovacciarsi e il passo lento sono stime, e lo sono anche tutte le classi di veicoli ed elicotteri.

**Arma** (km/h). **Approssimato.** I ritmi della fanteria sono tempi della comunità: circa 5 km/h camminando, 9 km/h al passo tattico accovacciato, 15 km/h di corsa leggera e circa 21 km/h in sprint. Le velocità massime dei veicoli sono i massimi configurati dei veicoli vanilla di Arma 3 in ciascuna classe, da un elenco di terze parti. Le modalità più lente dei veicoli sono stime.

**DCS / War Thunder / IL-2** (km/h). Ogni aereo ed elicottero nella tavolozza ha un profilo proprio. Le velocità di crociera e massima sono le **cifre pubblicate** degli aerei reali, che i simulatori modellano con precisione. La massima è al livello del mare per i jet e all'altitudine nominale per gli aerei a elica, e la nota di ogni profilo dice quale. Le velocità lente e di combattimento sono valori tipici. I veicoli terrestri usano le velocità stradali pubblicate dei veicoli reali, arrotondate (**approssimato**). Le navi usano le velocità massime pubblicate della loro classe.

**Altro** (m/s). Valori predefiniti del mondo reale, **approssimati**: strisciare 0,5, accovacciato 1,5, camminare 1,4, correre 3,5, sprint 6.

## Fonti {#sources}

Counter-Strike 2
- [Definizioni delle armi CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Pagine delle armi CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com armi (moltiplicatori di velocità di corsa)](https://valorant-api.com/v1/weapons)
- [VLR.gg: velocità del coltello 6,75 m/s](https://vlr.gg/post/4240306)
- [Supporto Riot: Camminare, correre e accovacciarsi](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forum EA: velocità di movimento di Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Guida al movimento di Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Rapporto pre-uscita di uno sprint a 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: post sulle meccaniche di gioco di Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (non pubblica velocità)

Arma
- [Forum Bohemia: velocità di camminata](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forum Bohemia: regolazione della velocità di movimento](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Tracker dei feedback di Arma 3: velocità dello sprint](https://feedback.bistudio.com/T64047)
- [Manuale di Arma 3: comandi della fanteria](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistiche dei veicoli di Arma 3 per fazione (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Le specifiche Wikipedia di ogni tipo di aereo ed elicottero, collegate da ogni profilo in `air.json`
- [Velocità V](https://en.wikipedia.org/wiki/V_speeds), per le velocità tipiche di avvicinamento e di combattimento
- [Wiki di War Thunder](https://wiki.warthunder.com/), per i veicoli terrestri
- [Cacciatorpediniere classe Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), e le velocità pubblicate delle altre classi di navi

Altro
- [Velocità di camminata preferita](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Funzione escursionistica di Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
