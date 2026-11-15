---
title: "Shpejtësitë e lëvizjes"
parent: "Tabela e taktikave"
nav_order: 1
lang: "sq"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---


# Shpejtësitë e lëvizjes

Sa kohë i duhet një ushtari, një tanku apo një avioni për të kaluar nga A në B? Kjo faqe thotë sa shpejt lëviz çdo figurë në [tabelën e taktikave](tactics-board.md), dhe nga vijnë këto numra, që të mund t'u besosh kohëve në planin tënd ose t'i ndryshosh.

[Tabela e taktikave](tactics-board.md) i llogarit kohët e një plani nga sa shpejt lëviz çdo figurë. Shpejtësitë vijnë nga një skedar për çdo lojë në `src/tactics/speeds/`: një shpejtësi për çdo mënyrë lëvizjeje të çdo klase (këmbësoria, mjetet tokësore, anijet, avionët, helikopterët), plus profile të emërtuara, si një për çdo armë të CS2 ose një për çdo lloj avioni. Çdo skedar liston burimet e veta, dhe çdo vlerë thotë nëse është **zyrtare** (të dhënat e vetë lojës, ose shifrat e publikuara të një avioni real) ose **e përafërt** (e matur nga komuniteti ose një vlerë tipike).

Këto janë pika nisjeje. **Çdo figurë mund ta mbivendosë shpejtësinë e vet në tabelë**, kështu që një plan mund të përdorë një shpejtësi të matur, një ushtar të ngarkuar ose një tank të dëmtuar.

## Mënyrat {#modes}

| Klasa | Mënyrat |
|---|---|
| Këmbësoria | zvarritje (shtrirë), ulje, ecje (ecja e ngadaltë dhe e qetë), vrapim (lëvizja parazgjedhur), sprint |
| Mjetet tokësore, anijet | zvarritje, me kujdes, normale (terren i hapur), nxitim (shpejtësia maksimale rrugore) |
| Avionët, helikopterët | të ngadaltë (afrim, qarkullim, fluturim në vend), kruajtje, luftim (shpejtësia e kthesës ose sulmi), maksimale |

Një mënyrë që loja nuk e ka mbetet bosh: CS2 dhe Valorant nuk kanë sprint dhe as shtrirje.

## Pjerrësitë {#slopes}

Çdo skedar thotë edhe si e trajton loja pjerrësitë. CS2, Valorant dhe Squad e kufizojnë shpejtësinë horizontale, kështu që një pjerrësi nuk e ngadalëson lojtarin. Arma i ngadalëson këmbësorët në pjerrësi, prandaj skedari i saj dhe ai gjenerik përdorin funksionin e ecjes në malë të Tobler-it. Battlefield dhe simulatorët e mjeteve përdorin një penalitet të thjeshtë pjerrësie.

## Sipas lojës {#per-game}

**Counter-Strike 2** (njësi për sekondë; një njësi merret si një inç). **Zyrtare.** Shpejtësitë e vrapimit janë vlerat `m_flMaxSpeed` në përkufizimet e armëve të lojës: thika dhe C4 250, granatat 245, pistoletat 240 (Desert Eagle 230, R8 180), SMG-të 220 deri 240, pushkët 210 deri 225, AWP 200, LMG-të 195 dhe 150. AWP me syth (100), AUG dhe SG 553 (150) dhe G3SG1 dhe SCAR-20 (120) kanë profilet e tyre. Ecja është vrapimi × 0,52 dhe ulja është vrapimi × 0,34. Valve nuk i publikon këto dy shumëzues, por çdo armë i shfaq ata në regjistrimet e demove. Për të kontrolluar një plan me lëvizjen reale, ngarko një demo në të njëjtën hartë dhe krahaso shpejtësitë e lojtarëve.

**Valorant** (m/s). Thika vrapon me 6,75 m/s. Çdo armë e shumëzon këtë me shumëzuesin e vet të vrapimit nga të dhënat e lojës, dhe kjo jep shpejtësitë që tregon Arsenali në lojë: 5,73 për shumicën e armëve të dorës dhe SMG-ve, 5,4 për pushkët, 5,13 për armët e rënda dhe Operatorin, 5,06 për armët e gjuajtjes me plumba. Këto shpejtësi vrapimi janë të sakta. Shpejtësitë e ecjes dhe uljes janë **vlerësime** (0,55 dhe 0,4 × vrapimi) sepse Riot nuk i publikon. Profilet e snajperit me syth janë gjithashtu vlerësime.

**Battlefield** (km/h). **E përafërt.** EA nuk publikon numra lëvizjeje. Këmbësoria: rreth 1 m/s e shtrirë, 2 e ulur, 4 duke vrapuar dhe 6,4 duke sprintuar. Mjetet, avionët, helikopterët dhe anijet marrin shpejtësi tipike në lojë për klasën e tyre.

**Squad** (km/h). **E përafërt.** Vrapimi (3,3 m/s) dhe sprinti (5,9 m/s) vijnë nga një shkrim i komunitetit mbi mekanikat e lojës. Zvarritja, ulja dhe ecja e ngadaltë janë vlerësime, dhe po ashtu çdo klasë mjeti dhe helikopteri.

**Arma** (km/h). **E përafërt.** Ritmet e këmbësorëve janë matje të komunitetit: rreth 5 km/h ecja, 9 km/h ritmi taktik i ulur, 15 km/h vrapimi i lehtë dhe rreth 21 km/h sprinti. Shpejtësitë maksimale të mjeteve janë maksimumet e konfiguruara të mjeteve vanilje të Arma 3 në çdo klasë, nga një listë e palë e tretë. Mënyrat e ngadalta të mjeteve janë vlerësime.

**DCS / War Thunder / IL-2** (km/h). Çdo avion dhe helikopter në paletë ka profilin e vet. Shpejtësitë e kruajtjes dhe maksimale janë **shifrat e publikuara** të avionit real, që simulatorët i modelojnë nga afër. Maksimumi është në nivelin e detit për avionët me reaktor dhe në lartësinë e vlerësuar për avionët me helikë, dhe shënimi i çdo profili thotë cili. Shpejtësitë e ngadalta dhe të luftimit janë vlera tipike. Mjetet tokësore marrin shpejtësitë rrugore të publikuara të mjeteve reale, të rrumbullakosura (**e përafërt**). Anijet marrin shpejtësitë maksimale të publikuara të klasës së tyre.

**Të tjera** (m/s). **Parazgjedhje të përafërta** nga bota reale: zvarritje 0,5, ulje 1,5, ecje 1,4, vrapim 3,5, sprint 6.

## Burimet {#sources}

Counter-Strike 2
- [Përkufizimet e armëve të CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Faqet e armëve në CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com weapons (shumëzuesit e vrapimit)](https://valorant-api.com/v1/weapons)
- [VLR.gg: shpejtësia e thikës 6,75 m/s](https://vlr.gg/post/4240306)
- [Mbështetja e Riot: Ecja, vrapimi dhe ulja](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forumet e EA: shpejtësia e lëvizjes në Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Udhëzues i lëvizjes në Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Raport para-lançimi për një sprint 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: shkrim mbi mekanikat e lojës Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (nuk publikon shpejtësi)

Arma
- [Forumet e Bohemia: shpejtësia e ecjes](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forumet e Bohemia: rregullimi i shpejtësisë së lëvizjes](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Gjurmuesi i reagimeve të Arma 3: shpejtësia e sprintit](https://feedback.bistudio.com/T64047)
- [Manuali i fushës së Arma 3: Kontrollet e këmbësorisë](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistikat e mjeteve të Arma 3 sipas fraksionit (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Specifikimet në Wikipedia të çdo lloji avioni dhe helikopteri, të lidhura nga çdo profil në `air.json`
- [Shpejtësitë V](https://en.wikipedia.org/wiki/V_speeds), për shpejtësitë tipike të afrimit dhe të luftimit
- [Wiki e War Thunder](https://wiki.warthunder.com/), për mjetet tokësore
- [Shkatërruesi klasa Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), dhe shpejtësitë e publikuara të klasave të tjera të anijeve

Të tjera
- [Shpejtësia e preferuar e ecjes](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Funksioni i ecjes në malë i Tobler-it](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
