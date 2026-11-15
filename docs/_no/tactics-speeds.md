---
title: "Bevegelseshastigheter"
parent: "Taktikktavle"
nav_order: 1
lang: "no"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Bevegelseshastigheter

Hvor lang tid tar det for en soldat, en stridsvogn eller et jetfly å komme fra A til B? Denne siden sier hvor fort hver figur beveger seg på [taktikktavlen](tactics-board.md), og hvor tallene kommer fra, slik at du kan stole på tidene i planen din eller endre dem.

[Taktikktavlen](tactics-board.md) regner ut tiden for en plan ut fra hvor fort hver figur beveger seg. Hastighetene kommer fra én fil per spill i `src/tactics/speeds/`: en hastighet for hver bevegelsesmodus i hver klasse (infanteri, bakkekjøretøy, båter, fly, helikoptre), pluss navngitte profiler som én per CS2-våpen eller én per flytype. Hver fil lister sine kilder, og hver verdi sier om den er **offisiell** (spillets egne data, eller de publiserte tallene for et ekte fly) eller **omtrentlig** (målt av fellesskapet eller en typisk verdi).

Dette er utgangspunkter. **Hver figur kan overstyre hastighetene sine på tavlen**, slik at en plan kan bruke en målt hastighet, en tungt utstyrt soldat eller en skadet stridsvogn.

## Moduser {#modes}

| Klasse | Moduser |
|---|---|
| Infanteri | krype (liggende), huke, gå (det langsomme, stille gåttet), løpe (standard bevegelse), sprint |
| Bakkekjøretøy, båter | krype, forsiktig, normal (på tvers av terreng), rush (veiens toppfart) |
| Fly, helikoptre | sakte (tilnærming, sirkling, sveve-taksing), kryss, kamp (hjørnefart eller angrepsløp), maksimum |

En modus spillet ikke har, er tom: CS2 og Valorant har ingen sprint og ingen liggende stilling.

## Skråninger {#slopes}

Hver fil sier også hvordan spillet behandler skråninger. CS2, Valorant og Squad begrenser horisontal fart, så en skråning bremser ikke en spiller. Arma bremser infanteri i skråninger, så dens fil og den generelle bruker Toblers turfunksjon. Battlefield og kjøretøysimulatorene bruker en enkel stigningsstraff.

## Per spill {#per-game}

**Counter-Strike 2** (enheter per sekund; én enhet regnes som én tomme). **Offisiell.** Løpefartene er `m_flMaxSpeed`-verdiene i spillets våpendefinisjoner: kniven og C4 250, granater 245, pistoler 240 (Desert Eagle 230, R8 180), SMG-er 220 til 240, rifler 210 til 225, AWP 200, LMG-er 195 og 150. Den sikteskopsatte AWP (100), AUG og SG 553 (150) og G3SG1 og SCAR-20 (120) har sine egne profiler. Gange er løp × 0,52 og huking er løp × 0,34. Valve publiserer ikke disse to multiplikatorene, men hvert våpen viser dem i demoopptak. For å sjekke en plan mot ekte bevegelse, last inn en demo på samme kart og sammenlign spillernes fart.

**Valorant** (m/s). Kniven løper 6,75 m/s. Hvert våpen ganger det med sin løpemultiplikator fra spilldataene, som gir fartene Arsenal i spillet viser: 5,73 for de fleste sidevåpen og SMG-er, 5,4 for rifler, 5,13 for tunge våpen og Operatoren, 5,06 for hagler. Disse løpefartene er nøyaktige. Gange- og hukefart er **anslag** (0,55 og 0,4 × løp) fordi Riot ikke publiserer dem. De sikteskopsatte snikskytterprofilene er også anslag.

**Battlefield** (km/t). **Omtrentlig.** EA publiserer ingen bevegelsestall. Infanteri: omtrent 1 m/s liggende, 2 hukende, 4 løpende og 6,4 sprintende. Kjøretøy, jetfly, helikoptre og båter får typiske fart i spillet for sin klasse.

**Squad** (km/t). **Omtrentlig.** Løping (3,3 m/s) og sprint (5,9 m/s) kommer fra en fellesskapsbeskrivelse av spillmekanikken. Kryping, hukende og langsom gange er anslag, og det samme gjelder hver kjøretøyklasse og helikopteret.

**Arma** (km/t). **Omtrentlig.** Infanteritempoene er fellesskapets tidtakinger: omtrent 5 km/t i gange, 9 km/t i hukende taktisk tempo, 15 km/t i jogging og omtrent 21 km/t i sprint. Toppfart for kjøretøy er de konfigurerte maksimumene for de vanlige Arma 3-kjøretøyene i hver klasse, fra en tredjepartsliste. De langsommere kjøretøymodusene er anslag.

**DCS / War Thunder / IL-2** (km/t). Hvert fly og helikopter i paletten har sin egen profil. Krysse- og maksfart er de **publiserte tallene** for det ekte flyet, som simulatorene modellerer nøye. Maksimum er ved havnivå for jetfly og ved vurdert høyde for propellfly, og hver profils merknad sier hvilken. Sakte og kampfart er typiske verdier. Bakkekjøretøy bruker de publiserte veifartene til de ekte kjøretøyene, avrundet (**omtrentlig**). Skip bruker de publiserte toppfartene til sin klasse.

**Annet** (m/s). **Omtrentlige** virkelige standardverdier: krype 0,5, huke 1,5, gå 1,4, løpe 3,5, sprint 6.

## Kilder {#sources}

Counter-Strike 2
- [CS2-våpendefinisjoner (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB-våpensider](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com-våpen (løpemultiplikatorer)](https://valorant-api.com/v1/weapons)
- [VLR.gg: knivfart 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot-støtte: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-forumet: Battlefield 6-bevegelsesfart](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6-bevegelsesguide](https://deltiasgaming.com/?p=309455)
- [Rapport før lansering av en 6,4 m/s-sprint](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: innlegg om Squads spillmekanikk (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (publiserer ingen farter)

Arma
- [Bohemia-forumet: gangfart](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-forumet: justering av bevegelsesfart](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 feedback-sporer: sprintfart](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3-kjøretøystatistikk per fraksjon (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedia-spesifikasjonene for hver flytype og helikoptertype, lenket fra hver profil i `air.json`
- [V-hastigheter](https://en.wikipedia.org/wiki/V_speeds), for typiske tilnærmings- og kampfarter
- [War Thunder-wikien](https://wiki.warthunder.com/), for bakkekjøretøy
- [Arleigh Burke-klassen-destroyer](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), og de andre skipsklassenes publiserte farter

Annet
- [Foretrukket gangfart](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblers turfunksjon](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
