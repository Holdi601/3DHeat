---
title: "Liikkumisnopeudet"
parent: "Taktiikkataulu"
nav_order: 1
lang: "fi"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Liikkumisnopeudet

Kuinka kauan sotilaalla, panssarivaunulla tai suihkukoneella kestää päästä pisteestä A pisteeseen B? Tämä sivu kertoo, kuinka nopeasti kukin hahmo liikkuu [taktiikkataululla](tactics-board.md), ja mistä nuo luvut tulevat, jotta voit luottaa suunnitelmasi aikoihin tai muuttaa niitä.

[Taktiikkataulu](tactics-board.md) ajoittaa suunnitelman sen mukaan, kuinka nopeasti kukin hahmo liikkuu. Nopeudet tulevat yhdestä tiedostosta pelin kohden kansiosta `src/tactics/speeds/`: nopeus jokaiselle liikkumistilalle jokaisessa luokassa (jalkaväki, maa-ajoneuvot, veneet, ilma-alukset, helikopterit) sekä nimetyt profiilit, kuten yksi jokaiselle CS2-aseelle tai yksi jokaiselle ilma-alustyypille. Jokainen tiedosto luettelee lähteensä, ja jokainen arvo kertoo, onko se **virallinen** (pelin oma data tai todellisen koneen julkaistut luvut) vai **likimääräinen** (yhteisön mittaama tai tyypillinen arvo).

Nämä ovat lähtökohtia. **Jokainen hahmo voi ohittaa nopeutensa taulun päällä**, joten suunnitelma voi käyttää mitattua nopeutta, kuormitettua sotilasta tai vaurioitunutta panssarivaunua.

## Tilat {#modes}

| Luokka | Tilat |
|---|---|
| Jalkaväki | ryömintä (vatsallaan), kyykky, kävely (hidas, hiljainen kävely), juoksu (oletusliike), sprintti |
| Maa-ajoneuvot, veneet | ryömintä, varovainen, normaali (maastossa), kiire (tien huippunopeus) |
| Ilma-alukset, helikopterit | hidas (lähestyminen, kiertely, leijuva rullaus), risteily, taistelu (kulmanopeus tai hyökkäyslento), enimmäisnopeus |

Tila, jota peli ei tunne, jätetään tyhjäksi: CS2:ssa ja Valorantissa ei ole sprinttiä eikä ryömintää.

## Rinteet {#slopes}

Jokainen tiedosto kertoo myös, miten peli käsittelee rinteitä. CS2, Valorant ja Squad rajoittavat vaakanopeutta, joten rinne ei hidasta pelaajaa. Arma hidastaa jalkaväkeä rinteillä, joten sen tiedosto ja yleinen tiedosto käyttävät Toblerin vaellusfunktiota. Battlefield ja ajoneuvosimulaatiot käyttävät tavallista kaltevuussakkoa.

## Pelikohtaisesti {#per-game}

**Counter-Strike 2** (yksikköä sekunnissa; yksikkö on yksi tuuma). **Virallinen.** Juoksunopeudet ovat pelin aseen määritysten `m_flMaxSpeed`-arvoja: veitsi ja C4 250, kranaatit 245, pistoolit 240 (Desert Eagle 230, R8 180), konepistoolit 220–240, kiväärit 210–225, AWP 200, kevyet konekiväärit 195 ja 150. Tähdätty AWP (100), AUG ja SG 553 (150) sekä G3SG1 ja SCAR-20 (120) ovat omilla profiileillaan. Kävely on juoksu × 0,52 ja kyykky on juoksu × 0,34. Valve ei julkaise näitä kahta kerrointa, mutta jokainen ase näyttää ne demotallenteissa. Tarkistaaksesi suunnitelman todellista liikettä vastaan lataa demo samalta kartalta ja vertaa pelaajien nopeuksia.

**Valorant** (m/s). Veitsi kulkee 6,75 m/s. Jokainen ase kertoo sen juoksunopeuskertoimella pelidatasta, mikä antaa pelin sisäisen Arsenalin näyttämät nopeudet: 5,73 useimmille sivuaseille ja konepistooleille, 5,4 kivääreille, 5,13 raskaille aseille ja Operatorille, 5,06 haulikoille. Nämä juoksunopeudet ovat tarkkoja. Kävely- ja kyykkynopeudet ovat **arvioita** (0,55 ja 0,4 × juoksu), koska Riot ei julkaise niitä. Tähtäävien tarkka-ampujaprofiilien nopeudet ovat myös arvioita.

**Battlefield** (km/h). **Likimääräinen.** EA ei julkaise liikkumislukuja. Jalkaväki: noin 1 m/s vatsallaan, 2 kyykyssä, 4 juoksussa ja 6,4 sprintissä. Ajoneuvot, suihkukoneet, helikopterit ja veneet saavat luokkansa tyypilliset pelinsisäiset nopeudet.

**Squad** (km/h). **Likimääräinen.** Juoksu (3,3 m/s) ja sprintti (5,9 m/s) tulevat yhteisön kirjoituksesta pelin mekaniikoista. Ryömintä, kyykky ja hidas kävely ovat arvioita, samoin kaikki ajoneuvoluokat ja helikopterit.

**Arma** (km/h). **Likimääräinen.** Jalkaväen vauhdit ovat yhteisön ajoituksia: noin 5 km/h kävellen, 9 km/h kyykkyvauhti taktisessa liikkeessä, 15 km/h hölkkä ja noin 21 km/h sprintti. Ajoneuvojen huippunopeudet ovat kunkin luokan vanilla-Arma 3 -ajoneuvojen asetetut enimmäisarvot, kolmannen osapuolen luettelosta. Hitaammat ajoneuvotilat ovat arvioita.

**DCS / War Thunder / IL-2** (km/h). Jokaisella paletin lentokoneella ja helikopterilla on oma profiilinsa. Risteily- ja enimmäisnopeudet ovat todellisen koneen **julkaistuja lukuja**, joita simulaattorit mallintavat tarkasti. Enimmäisnopeus on merenpinnan tasolla suihkukoneille ja nimellistä korkeutta potkurikoneille, ja kunkin profiilin huomautus kertoo, kumpi. Hitaat ja taisteluvauhdit ovat tyypillisiä arvoja. Maa-ajoneuvot käyttävät todellisten ajoneuvojen julkaistuja tienopeuksia, pyöristettyinä (**likimääräinen**). Laivat käyttävät luokkansa julkaistuja huippunopeuksia.

**Muu** (m/s). **Likimääräiset** todelliset oletukset: ryömintä 0,5, kyykky 1,5, kävely 1,4, juoksu 3,5, sprintti 6.

## Lähteet {#sources}

Counter-Strike 2
- [CS2:n aseen määritykset (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB:n asesivut](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com weapons (juoksunopeuskertoimet)](https://valorant-api.com/v1/weapons)
- [VLR.gg: veitsen nopeus 6,75 m/s](https://vlr.gg/post/4240306)
- [Riotin tuki: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-foorumi: Battlefield 6:n liikkumisnopeus](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 -liikkumisopas](https://deltiasgaming.com/?p=309455)
- [Julkaisua edeltävä raportti 6,4 m/s sprintistä](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad game mechanics -viesti (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ei julkaise nopeuksia)

Arma
- [Bohemia-foorumi: kävelynopeus](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-foorumi: liikkumisnopeuden säätö](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 -palautteen seuranta: sprinttinopeus](https://feedback.bistudio.com/T64047)
- [Arma 3 -kenttäopas: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 -ajoneuvotilastot lajeittain (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Kunkin lentokone- ja helikoptertyypin Wikipedia-tekniset tiedot, linkitetty kustakin profiilista tiedostossa `air.json`
- [V-nopeudet](https://en.wikipedia.org/wiki/V_speeds), tyypillisille lähestymis- ja taisteluvauhdeille
- [War Thunder -wiki](https://wiki.warthunder.com/), maa-ajoneuvoille
- [Arleigh Burke -luokan hävittäjä](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) sekä muiden laivaluokkien julkaistut nopeudet

Muu
- [Suosittu kävelynopeus](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerin vaellusfunktio](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
