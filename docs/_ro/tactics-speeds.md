---
title: "Viteze de mișcare"
parent: "Tabla de tactici"
nav_order: 1
lang: "ro"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Viteze de mișcare

Cât durează ca un soldat, un tanc sau un avion cu reacție să ajungă din A în B? Această pagină spune cât de repede se mișcă fiecare figură pe [tabla de tactici](tactics-board.md) și de unde vin aceste cifre, ca să poți avea încredere în timpii din planul tău sau să îi schimbi.

[Tabla de tactici](tactics-board.md) calculează timpii unui plan din viteza fiecărei figuri. Vitezele vin dintr-un fișier pentru fiecare joc, în `src/tactics/speeds/`: o viteză pentru fiecare mod de mișcare al fiecărei clase (infanterie, vehicule terestre, bărci, avioane, elicoptere), plus profiluri numite, precum unul pentru fiecare armă din CS2 sau unul pentru fiecare tip de avion. Fiecare fișier își listează sursele, iar fiecare valoare spune dacă este **oficială** (datele jocului însele, sau cifrele publicate ale unui avion real) sau **aproximativă** (măsurată de comunitate sau o valoare tipică).

Acestea sunt puncte de plecare. **Fiecare figură își poate suprascrie vitezele pe tablă**, deci un plan poate folosi o viteză măsurată, un soldat încărcat sau un tanc avariat.

## Moduri {#modes}

| Clasă | Moduri |
|---|---|
| Infanterie | târâre (culcat), ghemuit, mers (mersul lent, silențios), alergare (mișcarea implicită), sprint |
| Vehicule terestre, bărci | târâre, precaut, normal (teren accidentat), grabă (viteza maximă pe drum) |
| Avioane, elicoptere | lent (apropiere, planare, rulare în stație), croazieră, luptă (viteza de viraj sau atac), maximă |

Un mod pe care jocul nu îl are rămâne gol: CS2 și Valorant nu au sprint și nici târâre.

## Pante {#slopes}

Fiecare fișier spune și cum tratează jocul pantele. CS2, Valorant și Squad limitează viteza orizontală, deci o pantă nu încetinește jucătorul. Arma încetinește infanteria pe pante, deci fișierul ei și cel generic folosesc funcția de drumeție a lui Tobler. Battlefield și simulatoarele de vehicule folosesc o simplă penalizare de pantă.

## Pe joc {#per-game}

**Counter-Strike 2** (unități pe secundă; o unitate este luată ca un inch). **Oficial.** Vitezele de alergare sunt valorile `m_flMaxSpeed` din definițiile armelor jocului: cuțitul și C4 250, grenadele 245, pistoalele 240 (Desert Eagle 230, R8 180), pistoalele-mitralieră 220 până la 240, puștile 210 până la 225, AWP 200, mitralierele ușoare 195 și 150. AWP cu lunetă (100), AUG și SG 553 (150) și G3SG1 și SCAR-20 (120) au propriile profiluri. Mersul este alergarea × 0,52, iar ghemuitul este alergarea × 0,34. Valve nu publică acești doi multiplicatori, dar fiecare armă îi arată în înregistrările demo. Ca să verifici un plan față de mișcarea reală, încarcă un demo de pe aceeași hartă și compară vitezele jucătorilor.

**Valorant** (m/s). Cuțitul aleargă la 6,75 m/s. Fiecare armă înmulțește asta cu multiplicatorul ei de viteză de alergare din datele jocului, ceea ce dă vitezele pe care le arată Arsenalul din joc: 5,73 pentru majoritatea pistoalelor și pistoalelor-mitralieră, 5,4 pentru puști, 5,13 pentru armele grele și Operatorul, 5,06 pentru shotgun-uri. Aceste viteze de alergare sunt exacte. Vitezele de mers și de ghemuit sunt **estimări** (0,55 și 0,4 × alergarea), pentru că Riot nu le publică. Profilurile lunetelor sunt tot estimări.

**Battlefield** (km/h). **Aproximativ.** EA nu publică cifre de mișcare. Infanterie: aproximativ 1 m/s culcat, 2 ghemuit, 4 alergând și 6,4 în sprint. Vehiculele, avioanele cu reacție, elicopterele și bărcile primesc vitezele tipice din joc pentru clasa lor.

**Squad** (km/h). **Aproximativ.** Alergarea (3,3 m/s) și sprintul (5,9 m/s) vin dintr-o prezentare a comunității despre mecanicile jocului. Târârea, ghemuitul și mersul lent sunt estimări, la fel și fiecare clasă de vehicul și elicopterele.

**Arma** (km/h). **Aproximativ.** Ritmurile infanteriei sunt cronometrări ale comunității: aproximativ 5 km/h mergând, 9 km/h ritmul tactic ghemuit, 15 km/h în trap și aproximativ 21 km/h în sprint. Vitezele maxime ale vehiculelor sunt maximele configurate ale vehiculelor vanilla din Arma 3 din fiecare clasă, dintr-un listing terț. Modurile mai lente ale vehiculelor sunt estimări.

**DCS / War Thunder / IL-2** (km/h). Fiecare avion și elicopter din paletă are propriul profil. Vitezele de croazieră și maxime sunt **cifrele publicate** ale avioanelor reale, pe care simulatoarele le modelează strâns. Maxima este la nivelul mării pentru avioanele cu reacție și la altitudinea nominală pentru avioanele cu elice, iar nota fiecărui profil spune care. Vitezele lente și de luptă sunt valori tipice. Vehiculele terestre folosesc vitezele publicate pe drum ale vehiculelor reale, rotunjite (**aproximativ**). Navele folosesc vitezele maxime publicate ale clasei lor.

**Altele** (m/s). Valori implicite **aproximative** din lumea reală: târâre 0,5, ghemuit 1,5, mers 1,4, alergare 3,5, sprint 6.

## Surse {#sources}

Counter-Strike 2
- [Definițiile armelor CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Paginile de arme CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Mecanicile de mișcare](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com arme (multiplicatorii de viteză de alergare)](https://valorant-api.com/v1/weapons)
- [VLR.gg: viteza cuțitului 6,75 m/s](https://vlr.gg/post/4240306)
- [Suportul Riot: Mersul, alergarea și ghemuitul](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forumurile EA: viteza de mișcare în Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Ghid de mișcare Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Raport dinaintea lansării despre un sprint de 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: postarea despre mecanicile jocului Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (nu publică viteze)

Arma
- [Forumurile Bohemia: viteza de mers](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forumurile Bohemia: ajustarea vitezei de mișcare](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Tracker-ul de feedback Arma 3: viteza de sprint](https://feedback.bistudio.com/T64047)
- [Manualul de câmp Arma 3: Comenzile infanteriei](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statisticile vehiculelor Arma 3 pe facțiune (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Specificațiile Wikipedia ale fiecărui tip de avion și elicopter, legate din fiecare profil din `air.json`
- [Vitezele V](https://en.wikipedia.org/wiki/V_speeds), pentru vitezele tipice de apropiere și de luptă
- [Wiki-ul War Thunder](https://wiki.warthunder.com/), pentru vehiculele terestre
- [Distrugătorul clasei Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), și vitezele publicate ale celorlalte clase de nave

Altele
- [Viteza de mers preferată](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Funcția de drumeție a lui Tobler](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
