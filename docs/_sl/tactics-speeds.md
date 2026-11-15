---
title: "Hitrosti gibanja"
parent: "Taktična tabla"
nav_order: 1
lang: "sl"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Hitrosti gibanja

Koliko časa potrebuje vojak, tank ali reaktivno letalo od A do B? Ta stran pove, kako hitro se vsaka figura premika na [taktični tabli](tactics-board.md), in od kod ta števila prihajajo, da lahko zaupate časom v vašem načrtu ali jih spremenite.

[Taktična tabla](tactics-board.md) določa čas načrta glede na to, kako hitro se premika vsaka figura. Hitrosti prihajajo iz ene datoteke za vsako igro v `src/tactics/speeds/`: hitrost za vsak način gibanja vsakega razreda (pehota, kopenska vozila, čolni, letala, helikopterji) in poimenovani profili, na primer po en profil za vsako orožje CS2 ali za vsak tip letala. Vsaka datoteka navaja svoje vire, vsaka vrednost pa pove, ali je **uradna** (podatki same igre ali objavljene vrednosti pravega letala) ali **približna** (izmerjena s strani skupnosti ali tipična vrednost).

To so izhodišča. **Vsaka figura lahko na tabli prepiše svoje hitrosti**, zato lahko načrt uporabi izmerjeno hitrost, obremenjenega vojaka ali poškodovan tank.

## Načini {#modes}

| Razred | Načini |
|---|---|
| Pehota | plazenje (ležeč), počep, hoja (počasna, tiha hoja), tek (privzeto gibanje), sprint |
| Kopenska vozila, čolni | plazenje, previdno, normalno (čez teren), hitro (najvišja hitrost na cesti) |
| Letala, helikopterji | počasno (približevanje, kroženje, lebdenje in vožnja), križarjenje, bojno (hitrost v ovinku ali napad), največ |

Način, ki ga igra nima, je prazen: CS2 in Valorant nimata sprinta in plazenja.

## Strmine {#slopes}

Vsaka datoteka prav tako pove, kako igra obravnava strmine. CS2, Valorant in Squad omejujejo vodoravno hitrost, zato strmina igralca ne upočasni. Arma upočasni pehoto na strminah, zato njena datoteka in splošna uporabljata Toblerjevo funkcijo pohodništva. Battlefield in simulatorji vozil uporabljajo preprosto kazen za naklon.

## Po igrah {#per-game}

**Counter-Strike 2** (enote na sekundo; ena enota je en palec). **Uradno.** Hitrosti teka so vrednosti `m_flMaxSpeed` iz definicij orožij igre: nož in C4 250, granate 245, pištole 240 (Desert Eagle 230, R8 180), SMG-ji 220 do 240, puške 210 do 225, AWP 200, LMG-ji 195 in 150. AWP s tarčo (100), AUG in SG 553 (150) ter G3SG1 in SCAR-20 (120) imajo svoje profile. Hoja je tek × 0,52, počep pa tek × 0,34. Valve teh dveh množiteljev ne objavlja, vendar jih vsako orožje pokaže v posnetkih demov. Za preverjanje načrta glede na pravo gibanje naložite demo na isti zemljevid in primerjajte hitrosti igralcev.

**Valorant** (m/s). Nož teče s hitrostjo 6,75 m/s. Vsako orožje to pomnoži z množiteljem hitrosti teka iz podatkov igre, s čimer dobimo hitrosti, ki jih prikazuje Arsenal v igri: 5,73 za večino stranskih orožij in SMG-je, 5,4 za puške, 5,13 za težka orožja in Operatorja, 5,06 za sačmarice. Te hitrosti teka so točne. Hoja in počep sta **ocena** (0,55 in 0,4 × tek), ker Riot teh ne objavlja. Profila ostrostrelskih pušk s tarčo sta prav tako ocena.

**Battlefield** (km/h). **Približno.** EA ne objavlja številk gibanja. Pehota: približno 1 m/s ležeč, 2 v počepu, 4 v teku in 6,4 v sprintu. Vozila, letala, helikopterji in čolni dobijo tipične hitrosti v igri za svoj razred.

**Squad** (km/h). **Približno.** Tek (3,3 m/s) in sprint (5,9 m/s) prihajata iz opisa mehanik igre, ki ga je napisala skupnost. Plazenje, počep in počasna hoja so ocene, prav tako vsak razred vozil in helikopter.

**Arma** (km/h). **Približno.** Hitrosti pehote so časi, ki jih je izmerila skupnost: približno 5 km/h hoja, 9 km/h taktični korak v počepu, 15 km/h tek in približno 21 km/h sprint. Najvišje hitrosti vozil so nastavljene največje vrednosti standardnih vozil Arme 3 v vsakem razredu, iz tretjeosebnega seznama. Počasnejši načini vozil so ocene.

**DCS / War Thunder / IL-2** (km/h). Vsako letalo in helikopter v paleti ima svoj profil. Hitrosti križarjenja in največje hitrosti so **objavljene vrednosti** pravih letal, ki jih simulatorji natančno modelirajo. Največja hitrost je pri reaktivnih letalih na morski gladini, pri propelerskih letalih pri nazivni višini; opomba vsakega profila pove, katera. Počasne in bojne hitrosti so tipične vrednosti. Kopenska vozila uporabljajo objavljene cestne hitrosti pravih vozil, zaokrožene (**približno**). Ladje uporabljajo objavljene največje hitrosti svojega razreda.

**Drugo** (m/s). **Približno** realne privzete vrednosti: plazenje 0,5, počep 1,5, hoja 1,4, tek 3,5, sprint 6.

## Viri {#sources}

Counter-Strike 2
- [Definicije orožij CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Strani orožij CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com orožja (množitelji hitrosti teka)](https://valorant-api.com/v1/weapons)
- [VLR.gg: hitrost noža 6,75 m/s](https://vlr.gg/post/4240306)
- [Podpora Riot: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forum EA: hitrost gibanja v Battlefieldu 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Vodnik za gibanje v Battlefieldu 6](https://deltiasgaming.com/?p=309455)
- [Poročilo pred izdajo o sprintu 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: objava o mehanikah igre Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (hitrosti ne objavlja)

Arma
- [Forum Bohemia: hitrost hoje](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forum Bohemia: nastavljanje hitrosti gibanja](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Sledilnik predlogov Arme 3: hitrost sprinta](https://feedback.bistudio.com/T64047)
- [Priročnik Arma 3: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistika vozil Arme 3 po frakcijah (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedijine specifikacije vsakega tipa letala in helikopterja, povezane iz vsakega profila v `air.json`
- [V speeds](https://en.wikipedia.org/wiki/V_speeds), za tipične hitrosti približevanja in boja
- [Wiki War Thunder](https://wiki.warthunder.com/), za kopenska vozila
- [Rušilec razreda Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) in objavljene hitrosti drugih razredov ladij

Drugo
- [Priporočena hitrost hoje](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerjeva funkcija pohodništva](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
