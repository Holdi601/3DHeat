---
title: "Bewegingssnelheden"
parent: "Tactiekbord"
nav_order: 1
lang: "nl"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Bewegingssnelheden

Hoe lang doet een soldaat, een tank of een straaljager erover om van A naar B te gaan? Deze pagina zegt hoe snel elke figuur beweegt op het [tactiekbord](tactics-board.md), en waar die getallen vandaan komen, zodat je de tijden in je plan kunt vertrouwen of ze kunt aanpassen.

Het [tactiekbord](tactics-board.md) berekent de tijd van een plan uit hoe snel elke figuur beweegt. De snelheden komen uit één bestand per spel in `src/tactics/speeds/`: een snelheid voor elke bewegingsmodus van elke klasse (infanterie, voertuigen op de grond, boten, vliegtuigen, helikopters), plus benoemde profielen, zoals één per wapen van CS2 of één per type vliegtuig. Elk bestand somt zijn bronnen op, en bij elke waarde staat of hij **officieel** is (de eigen data van het spel, of de gepubliceerde cijfers van een echt vliegtuig) of **bij benadering** (door de gemeenschap gemeten of een typische waarde).

Dit zijn startpunten. **Elke figuur kan zijn snelheden op het bord overschrijven**, dus een plan kan een gemeten snelheid gebruiken, een zwaarbeladen soldaat of een beschadigde tank.

## Modi {#modes}

| Klasse | Modi |
|---|---|
| Infanterie | kruipen (liggend), hurken, lopen (de langzame, stille wandeling), rennen (standaardbeweging), sprinten |
| Voertuigen op de grond, boten | kruipen, voorzichtig, normaal (terreinrijden), snel (topsnelheid op de weg) |
| Vliegtuigen, helikopters | langzaam (nadering, rondcirkelen, zwevend taxiën), kruisvlucht, gevecht (hoeksnelheid of aanvalsvlucht), maximum |

Een modus die het spel niet heeft, blijft leeg: CS2 en Valorant hebben geen sprint en geen liggen.

## Hellingen {#slopes}

Elk bestand zegt ook hoe het spel met hellingen omgaat. CS2, Valorant en Squad begrenzen de horizontale snelheid, dus een helling vertraagt een speler niet. Arma vertraagt infanterie op hellingen, dus zijn bestand en het generieke bestand gebruiken de wandelfunctie van Tobler. Battlefield en de voertuigsimulaties gebruiken een eenvoudige straf voor het verval.

## Per spel {#per-game}

**Counter-Strike 2** (eenheden per seconde; één eenheid wordt gezien als één inch). **Officieel.** De snelheden van rennen zijn de waarden `m_flMaxSpeed` uit de wapendefinities van het spel: het mes en de C4 250, granaten 245, pistolen 240 (Desert Eagle 230, R8 180), smg's 220 tot 240, geweren 210 tot 225, AWP 200, lichte mitrailleurs 195 en 150. De AWP met kijker (100), AUG en SG 553 (150) en G3SG1 en SCAR-20 (120) hebben hun eigen profielen. Lopen is rennen × 0,52 en hurken is rennen × 0,34. Valve publiceert deze twee vermenigvuldigers niet, maar elk wapen toont ze in demo-opnamen. Om een plan te controleren op echte beweging, laad je een demo op dezelfde kaart en vergelijk je de snelheden van spelers.

**Valorant** (m/s). Het mes rent op 6,75 m/s. Elk wapen vermenigvuldigt dat met zijn rensnelheidsvermenigvuldiger uit de spelgegevens, wat de snelheden geeft die het Arsenal in het spel toont: 5,73 voor de meeste pistolen en smg's, 5,4 voor geweren, 5,13 voor zware wapens en de Operator, 5,06 voor shotguns. Deze rensnelheden zijn exact. Lopen- en hurksnelheden zijn **schattingen** (0,55 en 0,4 × rennen) omdat Riot ze niet publiceert. De profielen van de scherpe sluipschutter zijn ook schattingen.

**Battlefield** (km/u). **Bij benadering.** EA publiceert geen bewegingscijfers. Infanterie: ongeveer 1 m/s liggend, 2 gehurkt, 4 rennend en 6,4 sprintend. Voertuigen, straalvliegtuigen, helikopters en boten krijgen typische snelheden uit het spel voor hun klasse.

**Squad** (km/u). **Bij benadering.** Rennen (3,3 m/s) en sprinten (5,9 m/s) komen uit een beschrijving van de spelmechanica door de gemeenschap. Kruipen, hurken en langzaam lopen zijn schattingen, en dat geldt ook voor elke voertuigklasse en helikopter.

**Arma** (km/u). **Bij benadering.** Infanterietempo's zijn tijden van de gemeenschap: ongeveer 5 km/u lopend, 9 km/u gehurkt in tactisch tempo, 15 km/u joggen en ongeveer 21 km/u sprinten. De topsnelheden van voertuigen zijn de ingestelde maxima van de standaardvoertuigen van Arma 3 in elke klasse, uit een overzicht van derden. De langzamere voertuigmodi zijn schattingen.

**DCS / War Thunder / IL-2** (km/u). Elk vliegtuig en elke helikopter in het palet heeft zijn eigen profiel. Kruis- en maximumsnelheden zijn de **gepubliceerde cijfers** van het echte vliegtuig, die de simulaties nauwkeurig nabootsen. Het maximum geldt op zeeniveau voor straaljagers en op de nominale hoogte voor propellervliegtuigen, en de notitie van elk profiel zegt welke. Langzame en gevechtssnelheden zijn typische waarden. Voertuigen op de grond gebruiken de gepubliceerde wegsnelheden van de echte voertuigen, afgerond (**bij benadering**). Schepen gebruiken de gepubliceerde topsnelheden van hun klasse.

**Overig** (m/s). **Bij benadering** realistische standaardwaarden: kruipen 0,5, hurken 1,5, lopen 1,4, rennen 3,5, sprinten 6.

## Bronnen {#sources}

Counter-Strike 2
- [Wapendefinities van CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB-wapenpagina's](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com-wapens (vermenigvuldigers van rensnelheid)](https://valorant-api.com/v1/weapons)
- [VLR.gg: messnelheid 6,75 m/s](https://vlr.gg/post/4240306)
- [Ondersteuning van Riot: Lopen, rennen en hurken](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-forums: bewegingssnelheid van Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Bewegingsgids voor Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Verslag vóór de release van een sprint van 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: bericht over de spelmechanica van Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (publiceert geen snelheden)

Arma
- [Bohemia-forums: loopsnelheid](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-forums: bewegingssnelheid bijstellen](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3-feedbacktracker: sprintsnelheid](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3-voertuigstatistieken per factie (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- De Wikipedia-specificaties van elk type vliegtuig en helikopter, gelinkt vanuit elk profiel in `air.json`
- [V-snelheden](https://en.wikipedia.org/wiki/V_speeds), voor de typische nadering- en gevechtssnelheden
- [Wiki van War Thunder](https://wiki.warthunder.com/), voor voertuigen op de grond
- [Arleigh Burke-klasse torpedobootjager](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), en de gepubliceerde snelheden van de andere scheepsklassen

Overig
- [Voorkeurswandelsnelheid](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler's wandelfunctie](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
