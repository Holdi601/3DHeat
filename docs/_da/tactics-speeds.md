---
title: "Bevægelseshastigheder"
parent: "Taktiktavle"
nav_order: 1
lang: "da"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Bevægelseshastigheder

Hvor lang tid tager det for en soldat, en tank eller et jetfly at komme fra A til B? Denne side siger, hvor hurtigt hver figur bevæger sig på [taktiktavlen](tactics-board.md), og hvor tallene kommer fra, så du kan stole på tiderne i din plan eller ændre dem.

[Taktiktavlen](tactics-board.md) tidsfæster en plan ud fra, hvor hurtigt hver figur bevæger sig. Hastighederne kommer fra én fil pr. spil i `src/tactics/speeds/`: en hastighed for hver bevægelsestilstand i hver klasse (infanteri, landkøretøjer, både, fly, helikoptere), samt navngivne profiler såsom én pr. CS2-våben eller én pr. flytype. Hver fil angiver sine kilder, og hver værdi siger, om den er **officiel** (spillets egne data, eller det offentliggjorte tal for et rigtigt fly) eller **omtrentlig** (målt af fællesskabet eller en typisk værdi).

Det er udgangspunkter. **Hver figur kan overstyre sine hastigheder på tavlen**, så en plan kan bruge en målt hastighed, en tynget soldat eller en beskadiget tank.

## Tilstande {#modes}

| Klasse | Tilstande |
|---|---|
| Infanteri | kravl (liggende), duk, gang (den langsomme, stille gang), løb (standard bevægelse), sprint |
| Landkøretøjer, både | kravl, forsigtig, normal (på tværs af terræn), hurtig (vejens topfart) |
| Fly, helikoptere | langsom (indflyvning, kredsning, svævetaxi), krydstogt, kamp (hjørnefart eller angrebsløb), maksimum |

En tilstand spillet ikke har, er tom: CS2 og Valorant har ingen sprint og ingen liggende stilling.

## Skråninger {#slopes}

Hver fil siger også, hvordan spillet behandler skråninger. CS2, Valorant og Squad begrænser den vandrette hastighed, så en skråning ikke bremser en spiller. Arma bremser infanteri på skråninger, så dets fil og den generelle bruger Toblers vandreformel. Battlefield og køretøjssimulatorerne bruger en simpel stigningsstraf.

## Pr. spil {#per-game}

**Counter-Strike 2** (enheder pr. sekund; en enhed regnes som én tomme). **Officiel.** Løbehastighederne er `m_flMaxSpeed`-værdierne i spillets våbendefinitioner: kniven og C4 250, granater 245, pistoler 240 (Desert Eagle 230, R8 180), SMG'er 220 til 240, rifler 210 til 225, AWP 200, LMG'er 195 og 150. Den scopede AWP (100), AUG og SG 553 (150) og G3SG1 og SCAR-20 (120) har egne profiler. Gang er løb × 0,52, og duk er løb × 0,34. Valve offentliggør ikke disse to multiplikatorer, men hvert våben viser dem i demooptagelser. For at tjekke en plan mod rigtig bevægelse, indlæs en demo på samme kort og sammenlign spillernes hastigheder.

**Valorant** (m/s). Kniven løber med 6,75 m/s. Hvert våben ganger det med sin løbemultiplikator fra spildataene, hvilket giver de hastigheder, det indbyggede Arsenal viser: 5,73 for de fleste sidevåben og SMG'er, 5,4 for rifler, 5,13 for tunge våben og Operatoren, 5,06 for haglgeværer. Disse løbehastigheder er eksakte. Gang- og duk-hastighederne er **skøn** (0,55 og 0,4 × løb), fordi Riot ikke offentliggør dem. De scopede snigskytteprofiler er også skøn.

**Battlefield** (km/t). **Omtrentlig.** EA offentliggør ingen bevægelsestal. Infanteri: omkring 1 m/s liggende, 2 på duk, 4 i løb og 6,4 i sprint. Køretøjer, jetfly, helikoptere og både får typiske hastigheder i spillet for deres klasse.

**Squad** (km/t). **Omtrentlig.** Løb (3,3 m/s) og sprint (5,9 m/s) stammer fra en fællesskabsbeskrivelse af spillets mekanik. Kravl, duk og langsom gang er skøn, ligesom hver køretøjsklasse og helikopter.

**Arma** (km/t). **Omtrentlig.** Infanteriets tempo er fællesskabstider: omkring 5 km/t gående, 9 km/t i duk-taktisk tempo, 15 km/t i jogging og omkring 21 km/t i sprint. Køretøjernes topfarter er de konfigurerede maksimum for de oprindelige Arma 3-køretøjer i hver klasse, fra en tredjepartsliste. De langsommere køretøjstilstande er skøn.

**DCS / War Thunder / IL-2** (km/t). Hvert fly og hver helikopter i paletten har sin egen profil. Krydstogt- og maksimumhastigheder er de **offentliggjorte tal** for det rigtige fly, som simulatorerne modellerer tæt. Maksimum er ved havniveau for jetfly og ved det angivne niveau for propelfly, og hver profils note siger, hvilket. Langsomme og kamphastigheder er typiske værdier. Landkøretøjer bruger de offentliggjorte vejhastigheder for de rigtige køretøjer, afrundet (**omtrentlig**). Skibe bruger de offentliggjorte topfarter for deres klasse.

**Andet** (m/s). **Omtrentlige** virkelige standardværdier: kravl 0,5, duk 1,5, gang 1,4, løb 3,5, sprint 6.

## Kilder {#sources}

Counter-Strike 2
- [CS2-våbendefinitioner (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB-våbensider](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com weapons (løbemultiplikatorer)](https://valorant-api.com/v1/weapons)
- [VLR.gg: knivhastighed 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot support: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-forummet: Battlefield 6-bevægelseshastighed](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6-bevægelsesguide](https://deltiasgaming.com/?p=309455)
- [Forhåndsrapport om en 6,4 m/s-sprint](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad game mechanics-indlæg (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (offentliggør ingen hastigheder)

Arma
- [Bohemia-forummet: gangfart](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-forummet: justering af bevægelseshastighed](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3-fejlsporing: sprintfart](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3-køretøjsstatistik pr. fraktion (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedias specifikationer for hver flytype og helikoptertype, linket fra hver profil i `air.json`
- [V-hastigheder](https://en.wikipedia.org/wiki/V_speeds), for de typiske indflyvnings- og kamphastigheder
- [War Thunder-wikien](https://wiki.warthunder.com/), for landkøretøjer
- [Arleigh Burke-klassen destroyer](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), og de andre skibsklassers offentliggjorte hastigheder

Andet
- [Foretrukken gangfart](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblers vandreformel](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
