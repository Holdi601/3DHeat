---
title: "Veloċitajiet tal-moviment"
parent: "Bord tat-tattika"
nav_order: 1
lang: "mt"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Veloċitajiet tal-moviment

Kemm idum soldat, tank jew jet biex imur minn A sa B? Din il-paġna tgħid kemm kull figura timxi fuq il-[bord taktiku](tactics-board.md), u minn fejn jiġu dawk in-numri, sabiex tkun tista' tafda l-ħinijiet fuq il-pjan tiegħek jew tbiddilhom.

Il-[bord taktiku](tactics-board.md) jqis il-ħin ta' pjan skont kemm kull figura timxi. Il-veloċitajiet jiġu minn fajl wieħed għal kull logħba f'`src/tactics/speeds/`: veloċità għal kull mod ta' moviment ta' kull klassi (infanterija, vetturi tal-art, dgħajsa, inġenji tal-ajru, elikotteri), flimkien ma' profili msemmija bħal wieħed għal kull arma ta' CS2 jew wieħed għal kull tip ta' inġenju tal-ajru. Kull fajl jelenka s-sorsi tiegħu, u kull valur jgħid jekk hu **uffiċjali** (dejta tal-logħba stess, jew ċifri ppubblikati ta' inġenju tal-ajru reali) jew **approssimattiv** (imkejjel mill-komunità jew valur tipiku).

Dawn huma punti tat-tluq. **Kull figura tista' tibdel il-veloċitajiet tagħha fuq il-bord**, sabiex pjan jista' juża veloċità mkejla, suldat imtaqqal b'piż jew tank midrub.

## Modi {#modes}

| Klassi | Modi |
|---|---|
| Infanterija | crawl (mgħammar wiċċ 'l isfel), crouch (mimdud), walk (il-mixi bil-mod u bil-kwiet), run (il-moviment default), sprint |
| Vetturi tal-art, dgħajjes | crawl, cautious, normal (off-road), rush (veloċità massima tat-triq) |
| Inġenji tal-ajru, elikotteri | slow (approach, loiter, hover-taxi), cruise, combat (veloċità tal-kantuniera jew attack run), maximum |

Modu li l-logħba ma jkollhiex jibqa' vojt: CS2 u Valorant ma għandhomx sprint u lanqas prone.

## Pendenzi {#slopes}

Kull fajl jgħid ukoll kif il-logħba timmaniġġja l-pendenzi. CS2, Valorant u Squad jillimitaw il-veloċità orizzontali, għalhekk pendenza ma tnaqqas il-veloċità tal-plejer. Arma tnaqqas l-infanterija fuq il-pendenzi, għalhekk il-fajl tagħha u dak ġenerali jużaw il-funzjoni tal-mixi ta' Tobler. Battlefield u s-simulaturi tal-vetturi jużaw penalità sempliċi tal-grad.

## Għal kull logħba {#per-game}

**Counter-Strike 2** (unitajiet kull sekonda; unità tittieħed bħala pulzier wieħed). **Uffiċjali.** Il-veloċitajiet tal-ġiri huma l-valuri `m_flMaxSpeed` fid-definizzjonijiet tal-armi tal-logħba: il-ħrieb u C4 250, il-granati 245, il-pistols 240 (Desert Eagle 230, R8 180), SMGs 220 sa 240, ir-rifles 210 sa 225, AWP 200, LMGs 195 u 150. L-AWP b'scope (100), AUG u SG 553 (150) u G3SG1 u SCAR-20 (120) għandhom il-profili tagħhom. Il-mixi hu l-ġiri × 0.52 u l-crouch hu l-ġiri × 0.34. Valve ma tippubblikax dawn iż-żewġ multipliers, imma kull arma turihom f'reġistrazzjonijiet ta' demo. Biex tiċċekkja pjan kontra moviment reali, agħbi demo fuq l-istess mappa u qabbel il-veloċitajiet tal-plejers.

**Valorant** (m/s). Il-ħrib jiġri bi 6.75 m/s. Kull arma timmultiplika dan bil-multiplier tal-ġiri tagħha mid-dejta tal-logħba, u dan jagħti l-veloċitajiet li l-Arsenal fil-logħba juri: 5.73 għal kważi kull sidearm u SMG, 5.4 għal rifles, 5.13 għal heavies u l-Operator, 5.06 għal shotguns. Dawn il-veloċitajiet tal-ġiri huma eżatti. Il-veloċitajiet tal-mixi u tal-crouch huma **stimi** (0.55 u 0.4 × il-ġiri) għax Riot ma tippubblikahomx. Il-profili tas-sniper b'scope huma wkoll stimi.

**Battlefield** (km/h). **Approssimattiv.** EA ma tippubblika ebda ċifra ta' moviment. Infanterija: madwar 1 m/s mgħammar wiċċ 'l isfel, 2 mimdud, 4 jiġri u 6.4 jisprinta. Vetturi, jets, elikotteri u dgħajjes jieħdu veloċitajiet tipiċi tal-logħba għall-klassi tagħhom.

**Squad** (km/h). **Approssimattiv.** Il-ġiri (3.3 m/s) u l-isprint (5.9 m/s) ġejjin minn kitba tal-komunità dwar il-mekkaniżmi tal-logħba. Crawl, crouch u l-mixi bil-mod huma stimi, u hekk ukoll kull klassi ta' vettura u l-elikotteri.

**Arma** (km/h). **Approssimattiv.** Il-passi tal-infanterija huma ħinijiet tal-komunità: madwar 5 km/h fil-mixi, 9 km/h mimdud f'pass taktiku, 15 km/h fl-iġġiri u madwar 21 km/h fl-isprint. Il-veloċitajiet massimi tal-vetturi huma l-massimi kkonfigurati tal-vetturi vanilla ta' Arma 3 f'kull klassi, minn lista ta' parti terza. Il-modi iktar bil-mod tal-vetturi huma stimi.

**DCS / War Thunder / IL-2** (km/h). Kull inġenju tal-ajru u elikotteru fil-paletta għandu l-profil tiegħu. Il-veloċitajiet ta' cruise u massimi huma **ċifri ppubblikati** tal-inġenji tal-ajru reali, li s-simulaturi jimmudellaw mill-qrib. Il-massimu jkun fil-livell tal-baħar għall-jets u fl-għoli stmat għall-inġenji tal-ajru bil-propeller, u n-nota ta' kull profil tgħid liema. Il-veloċitajiet bil-mod u tal-kombatt huma valuri tipiċi. Vetturi tal-art jużaw il-veloċitajiet ippubblikati tat-triq tal-vetturi reali, imdawra (**approssimattiv**). Dgħajjes jużaw il-veloċitajiet massimi ppubblikati tal-klassi tagħhom.

**Oħra** (m/s). **Defaults approssimattivi** tad-dinja reali: crawl 0.5, crouch 1.5, walk 1.4, run 3.5, sprint 6.

## Sorsi {#sources}

Counter-Strike 2
- [Definizzjonijiet tal-armi ta' CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Paġni tal-armi ta' CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com armi (multipliers tal-ġiri)](https://valorant-api.com/v1/weapons)
- [VLR.gg: veloċità tal-ħrib 6.75 m/s](https://vlr.gg/post/4240306)
- [Appoġġ ta' Riot: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forums ta' EA: veloċità tal-moviment ta' Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Gwida tal-moviment ta' Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Rapport ta' qabel ir-rilaxx ta' sprint ta' 6.4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: kitba dwar il-mekkaniżmi tal-logħba ta' Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ma jippubblika ebda veloċità)

Arma
- [Forums ta' Bohemia: veloċità tal-mixi](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forums ta' Bohemia: tibdil tal-veloċità tal-moviment](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Tracker ta' feedback ta' Arma 3: veloċità tal-isprint](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistiċi tal-vetturi ta' Arma 3 skont il-fazzjoni (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- L-ispeċifikazzjonijiet ta' Wikipedia ta' kull tip ta' inġenju tal-ajru u elikotteru, marbuta minn kull profil f'`air.json`
- [V speeds](https://en.wikipedia.org/wiki/V_speeds), għall-veloċitajiet tipiċi tal-approach u tal-kombatt
- [Wiki ta' War Thunder](https://wiki.warthunder.com/), għall-vetturi tal-art
- [Destroyer klassi Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), u l-veloċitajiet ippubblikati tal-klassijiet l-oħra tal-bastimenti

Oħrajn
- [Veloċità preferuta tal-mixi](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Il-funzjoni tal-mixi ta' Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
