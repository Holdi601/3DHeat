---
title: "Liikumiskiirused"
parent: "Taktikatahvel"
nav_order: 1
lang: "et"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Liikumiskiirused

Kui kaua läheb sõduril, tankil või reaktiivlennukil A-st B-sse? See leht ütleb, kui kiiresti iga kuju [taktika tahvel](tactics-board.md) liigub ja kust need arvud tulevad, et saaksid plaani aegadele usaldada või neid muuta.

[Taktika tahvel](tactics-board.md) ajastab plaani selle järgi, kui kiiresti iga kuju liigub. Kiirused tulevad ühest failist mängu kohta kaustas `src/tactics/speeds/`: kiirus iga klassi (jalavägi, maasõidukid, paadid, lennukid, helikopterid) iga liikumisrežiimi kohta, lisaks nimega profiilid, nagu üks iga CS2 relva kohta või üks iga lennukitüübi kohta. Iga fail loetleb oma allikad ja iga väärtus ütleb, kas see on **ametlik** (mängu enda andmed või tegeliku lennuki avaldatud arvud) või **ligikaudne** (kogukonna mõõdetud või tüüpiline väärtus).

Need on lähtepunktid. **Iga kuju saab tahvelil oma kiirusi üle kirjutada**, nii et plaan võib kasutada mõõdetud kiirust, koormatud sõdurit või kahjustatud tanki.

## Režiimid {#modes}

| Klass | Režiimid |
|---|---|
| Jalavägi | roomamine (kõhuli), kükitamine, kõnd (aeglane, vaikne kõnd), jooks (vaikimisi liikumine), sprint |
| Maasõidukid, paadid | roomamine, ettevaatlik, tavaline (maastik), kiirustamine (tee tippkiirus) |
| Lennukid, helikopterid | aeglane (lähenemine, ringlemine, paigalseis-rullimine), kruiis, lahing (nurga kiirus või ründelend), maksimum |

Režiim, mida mäng ei tunne, jääb tühjaks: CS2-l ja Valorantil pole sprinti ega kõhuli roomamist.

## Nõlvad {#slopes}

Iga fail ütleb ka, kuidas mäng nõlvadega toime tuleb. CS2, Valorant ja Squad piiravad horisontaalkiirust, seega nõlv ei aeglusta mängijat. Arma aeglustab jalaväge nõlvadel, seega selle fail ja üldine kasutavad Toblerit matkafunktsiooni. Battlefield ja sõidukisimulaatorid kasutavad lihtsat tõusu karistust.

## Mängude kaupa {#per-game}

**Counter-Strike 2** (ühikut sekundis; üks ühik võetakse ühe tollina). **Ametlik.** Jooksu kiirused on mängu relvamääratlustes olevad `m_flMaxSpeed` väärtused: nuga ja C4 250, granaadid 245, pistolid 240 (Desert Eagle 230, R8 180), SMG-d 220 kuni 240, vintpüssid 210 kuni 225, AWP 200, LMG-d 195 ja 150. Sihikuga AWP (100), AUG ja SG 553 (150) ning G3SG1 ja SCAR-20 (120) on oma profiilid. Kõnd on jooks × 0,52 ja kükitamine on jooks × 0,34. Valve ei avalda neid kahte kordajat, kuid iga relv näitab neid demosalvestistes. Plaani kontrollimiseks tegeliku liikumise vastu laadi demo samal kaardil ja võrdle mängijate kiirusi.

**Valorant** (m/s). Nuga jookseb kiirusega 6,75 m/s. Iga relv korrutab selle oma jooksukiiruse kordajaga mängu andmetest, mis annab mängus Arsenali näidatud kiirused: 5,73 enamiku kõrvarelvade ja SMG-de puhul, 5,4 vintpüssidele, 5,13 raskerelvadele ja Operatorile, 5,06 haugipüssidele. Need jooksukiirused on täpsed. Kõnnikiirused ja kükitamise kiirused on **hinnangud** (0,55 ja 0,4 × jooks), sest Riot neid ei avalda. Snaipri sihikuga profiilid on samuti hinnangud.

**Battlefield** (km/h). **Ligikaudne.** EA ei avalda liikumisarve. Jalavägi: umbes 1 m/s kõhuli, 2 kükitades, 4 jooksus ja 6,4 sprintides. Sõidukid, lennukid, helikopterid ja paadid saavad oma klassi tüüpilised mängusisesed kiirused.

**Squad** (km/h). **Ligikaudne.** Jooks (3,3 m/s) ja sprint (5,9 m/s) pärinevad kogukonna kirjeldusest mängu mehaanika kohta. Roomamine, kükitamine ja aeglane kõnd on hinnangud, ja samuti iga sõidukiklass ning helikopter.

**Arma** (km/h). **Ligikaudne.** Jalaväe tempod on kogukonna ajastused: umbes 5 km/h kõndides, 9 km/h kükitades taktikalisel tempol, 15 km/h joostes ja umbes 21 km/h sprintides. Sõidukite tippkiirused on iga klassi tavaliste Arma 3 sõidukite seadistatud maksimumid kolmanda osapoole loendist. Aeglasemad sõidurežiimid on hinnangud.

**DCS / War Thunder / IL-2** (km/h). Igal lennukil ja helikopteril paletis on oma profiil. Kruiisi- ja maksimumkiirused on tegelike lennukite **avaldatud arvud**, mida simulaatorid täpselt modelleerivad. Maksimum on reaktiivlennukitel merepinnal ja propellerlennukitel nimivõimsuse kõrgusel, ja iga profiili märkus ütleb, kumb. Aeglased ja lahingukiirused on tüüpilised väärtused. Maasõidukid kasutavad tegelike sõidukite avaldatud teekiirusi, ümardatult (**ligikaudne**). Laevad kasutavad oma klassi avaldatud tippkiirusi.

**Muu** (m/s). **Ligikaudsed** reaalmaailma vaikeväärtused: roomamine 0,5, kükitamine 1,5, kõnd 1,4, jooks 3,5, sprint 6.

## Allikad {#sources}

Counter-Strike 2
- [CS2 relvamääratlused (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB relvalehed](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Liikumismehaanika](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com relvad (jooksukiiruse kordajad)](https://valorant-api.com/v1/weapons)
- [VLR.gg: noa kiirus 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot tugi: Kõnd, jooks ja kükitamine](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA foorumid: Battlefield 6 liikumiskiirus](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 liikumisjuhend](https://deltiasgaming.com/?p=309455)
- [Enne väljaandmist avaldatud aruanne 6,4 m/s sprindi kohta](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squadi mängumehaanika postitus (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (kiirusi ei avalda)

Arma
- [Bohemia foorumid: kõnnikiirus](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia foorumid: liikumiskiiruse häälestamine](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 tagasiside jälgija: sprindi kiirus](https://feedback.bistudio.com/T64047)
- [Arma 3 väljaõppe käsiraamat: jalaväe juhtimine](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 sõidukite statistika rahvuste kaupa (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Iga lennuki- ja helikopteritüübi Wikipedia spetsifikatsioonid, lingitud igast profiilist failis `air.json`
- [V-kiirused](https://en.wikipedia.org/wiki/V_speeds), tüüpiliste lähenemis- ja lahingukiiruste jaoks
- [War Thunderi viki](https://wiki.warthunder.com/), maasõidukite jaoks
- [Arleigh Burke'i klassi hävitaja](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) ja teiste laevaklasside avaldatud kiirused

Muu
- [Eelistatud kõnnikiirus](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobleri matkafunktsioon](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
