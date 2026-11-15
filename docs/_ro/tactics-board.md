---
title: "Tabla de tactici"
nav_order: 12
has_children: true
lang: "ro"
source: "tactics-board.md"
source_hash: "e89ef050b0f2"
translated: true
outdated: false
---

# Tabla de tactici

Tabul **Tactică** este o tablă de desen pentru un plan de echipă: pui figuri mici pe o hartă, desenezi săgeți pentru drumul lor și apeși redare ca să vezi cum se întâmplă. Folosește-l ca să planifici o rundă sau un atac înainte să joci. Împarte pânza, camera și [nivelul](levels.md) cu celelalte tab-uri și nimic altceva; un plan nu este date și nu desenează nicio căldură.

## Primul tău plan {#your-first-plan}

1. Deschide tabul **Tactică**. Alege **Joc** (de exemplu Counter-Strike 2) și, pentru Valorant, apasă **Încarcă hărțile Valorant** și alege o **Hartă**. Sau încarcă mai întâi un [nivel](levels.md).
2. Alege o **Tabără** (stabilește culoarea) și apasă **Vedere de sus**.
3. Alege **Loc**, alege o figură din **Figuri** (folosește **Căutare figuri** ca s-o găsești) și dă clic pe hartă. Pune două sau trei.
4. Alege **Săgeată**, dă clic pe o figură, dă clic pe drumul pe care trebuie să-l urmeze și apasă **Enter** ca să termini săgeata.
5. Apasă **+** sub vedere ca să adaugi pasul 2. Fiecare figură începe unde s-a terminat săgeata ei. Desenează mai multe săgeți acolo.
6. Apasă **▶** (sau `K`) ca să redai planul de la pasul afișat până la capăt.
7. Dă un nume planului în **Numele planului** și apasă **Salvare**.

![Tab-ul Tactică în vedere de sus: joc, tabere și unelte în stânga, trei figuri cu săgeți de Mișcare, un arc de Aruncare cu fum, o Zonă și pașii de-a lungul de jos](../assets/img/ro/tactics.webp)

## Începerea unui plan {#starting-a-plan}

| Comandă | Ce face |
|---|---|
| **Joc** | Alege taberele și figurile pe care le oferă paleta: Counter-Strike 2 (T, CT; jucători și utilitare), Valorant (Atac, Apărare; jucători și abilități generice), Battlefield, Squad, Arma (infanterie, vehicule terestre, aeronave, bărci), DCS / War Thunder / IL-2 (avioane cu reacție, avioane cu elice, elicoptere, apărare antiaeriană, sol, nave, arme) și Altele. Un plan care are deja figuri își păstrează taberele când jocul se schimbă. |
| **Numele planului** | Numele sub care este salvat planul. |
| **Hartă**, **Încarcă hărțile Valorant** | Cu Valorant ales: **Încarcă hărțile Valorant** ia lista hărților de la [valorant-api.com](https://valorant-api.com); **Hartă** pune apoi minimapa hărții alese ca nivel, încadrată de sus. Imaginea este descărcată când e aleasă și nu este livrată niciodată. Anunțul Riot este arătat cât timp este pe ecran (vezi mai jos). |
| **Tabără** | Tabăra cărei îi aparține următoarea figură, săgeată sau zonă; primește culoarea taberei. |

Fără un nivel, tabla este planul plat al solului. Încarcă un nivel sub **Nivel** ca să planifici pe o hartă reală: o hartă CS2 exportată cu unealta CS2, un nivel din bibliotecă sau o imagine de hartă.

## Unelte {#tools}

| Unealtă | Clic | Note |
|---|---|---|
| **Selectare** | O figură, un punct de traseu, o săgeată, o zonă sau o notă o selectează. | Shift+clic adaugă sau scoate; Shift+trage desenează o casetă în jurul a ce se adaugă. Selecția primește un gizmo de transformare (vezi mai jos); `Delete` sau `Backspace` o șterge. `M` mută figura selectată la următorul clic. |
| **Loc** | Pune figura aleasă. | O figură se alege din paleta **Figuri** (cu **Căutare figuri**). Când nimic nu este selectat, `R` întoarce următoarea figură cu 15° înainte să fie pusă (`Shift+R` în sens invers). |
| **Săgeată** | Fiecare clic adaugă un punct; Enter, un dublu clic sau un clic dreapta o termină, Esc o renunță. | **Mișcare**, **Atac** (vârf mai lat) sau **Supraveghere** (o linie subțire la înălțimea ochilor). O săgeată începută pe o figură este drumul acelei figuri în acest pas: redată, figura îl parcurge, iar pasul următor începe unde s-a terminat. |
| **Aruncare** | Cel care aruncă, apoi unde aterizează. | Un arc punctat de la unul la celălalt, iar utilitarul ales (fum, bliț, molotov, ...) apare unde aterizează și rămâne de la acest pas încolo. |
| **Zonă** | Centrul, apoi marginea. | Un disc în culoarea taberei. |
| **Notă** | Unde se pune nota; cere textul ei. | Arătată ca un ac, iar textul ei deasupra. |
| **Ștergere** | O figură, o săgeată, o zonă sau o notă. | O elimină de la acest pas încolo; la primul ei pas, o elimină complet. |

**Anulare** și **Refacere** (`Ctrl+Z`; `Ctrl+Y` sau `Ctrl+Shift+Z`) parcurg fiecare schimbare. O linie sub plan arată câte figuri, săgeți și pași are. **Vedere de sus** privește drept în jos (ortografic), **Vedere 3D** revine la perspectivă, **Cadru** încadrează planul, sau nivelul când planul este gol.

**Mărimea figurilor** scalează fiecare figură de pe tablă; 1× este mărimea reală, ceea ce de sus înseamnă câțiva pixeli pentru o persoană.

## Mutare, întoarcere și scalare {#moving-turning-and-scaling}

Totul de pe tablă poate fi mutat ca într-un editor 3D: figuri, utilitare, markeri, puncte de traseu singulare și săgeți întregi, zone și note. Ce este selectat primește un gizmo la mijloc:

| Mod | Taste | Mânere |
|---|---|---|
| **Mutare** | W (sau G) | O săgeată pe fiecare axă (X roșu, Y verde și în sus, Z albastru) mută de-a lungul ei; un pătrat mută pe planul lui; centrul mută peste nivelul de sub cursor. |
| **Rotire** | E (sau R) | Un inel pe fiecare axă se întoarce în jurul ei. Inelele unei figuri singure sunt girația, tangajul și ruliul ei; un grup se întoarce în jurul axelor lumii, în jurul mijlocului lui. |
| **Scalare** | R (sau S) | Întinde sau strânge selecția din mijlocul ei, de-a lungul unei axe sau în toate direcțiile; raza unei zone crește odată cu ea. |

**Taste** comută între W / E / R (Unity, Unreal) și G / R / S (Blender); tastele aleg modul doar cât timp ceva este selectat, iar altfel zboară camera. Deci `R` înseamnă **Scalare** cu tastele W / E / R și **Rotire** cu tastele G / R / S cât timp ceva este selectat, și întoarce următoarea figură de pus când nimic nu este selectat. Toate tastele tablei sunt listate în [referința tastaturii](keyboard-reference.md#tactics-board). Ține apăsat **Ctrl** în timp ce tragi ca să fixezi o mutare pe **Grilă** (metri) sau o întoarcere pe **Pasul unghiului**. **Fixează pe sol** (activat implicit) pune oamenii, vehiculele, markerii, punctele de traseu și zonele mutate pe suprafața nivelului; aeronavele și elicopterele își păstrează înălțimea, iar o tragere de-a lungul săgeții Y nu se fixează niciodată. Trăgând un mâner nu se mută niciodată camera. **Esc** anulează o tragere, iar fiecare schimbare este un pas de Anulare.

Punctele de traseu apar ca puncte pe săgețile pasului afișat: dă clic pe unul ca să-l selectezi, trage-l ca să-l muți, Delete ca să-l scoți. Secțiunea **Selectate** arată locul selecției în metri, girația, tangajul și ruliul unei figuri în grade și raza unei zone, fiecare de scris.

## Cronometrare {#timing}

Drumul unei figuri este cronometrat: fiecare segment ia lungimea lui pe nivel - eșantionată pe suprafață la fiecare câțiva metri, deci un deal sau o scară între două puncte contează - la viteza **modului** de mișcare al acelei figuri în acel joc, plus orice **așteptare** la un punct de traseu. Infanteria se târăște, se ghemuiește, merge (în liniște), aleargă sau sprintează; vehiculele și bărcile se târăsc, merg prudent, normal sau se grăbesc; aeronavele și elicopterele zboară lent, la croazieră, la viteză de luptă sau la maximum. Un mod pe care jocul nu îl are (CS2 nu are sprint) ia cel mai apropiat pe care îl are. Cum încetinește o pantă depinde de joc: în CS2 și Valorant contează doar distanța orizontală, ca în jocuri; simulatoarele militare încetinesc infanteria la deal (funcția de drumeție Tobler) și vehiculele după grad.

Vitezele vin din tabele pe joc, cu sursele lor (vezi [Viteze de mișcare](tactics-speeds.md)): CS2 după arma ținută, din definițiile armelor jocului; Valorant după armă; Battlefield, Squad, Arma și jocurile aeriene după tipul și clasa vehiculului. **Se mișcă ca** alege profilul unei figuri (o armă, un tip de vehicul); **Propriu (m/s)** suprascrie orice mod pentru acea figură. Modurile sunt numite cum le arată tabla: *Târât*, *Ghemuit*, *Mers (în liniște)*, *Alergare*, *Sprint*; *Prudent*, *Normal*, *Grăbit*; *Lent*, *Croazieră*, *Luptă*, *Maxim*.

Fiecare punct de traseu arată timpul de la ultimul și timpul de la începutul planului ("+3,9 s · 0:12"). Traseul figurii selectate listează fiecare segment cu modul, lungimea și timpul lui, așteptarea și sosirea. **Sosiri**, sub **Cronometrare**, pune fiecare figură cu traseu pe o singură linie de timp, cea mai rapidă sosire sus. Cu **Redă în timp real** (activat implicit) un pas durează până sosește cel mai lent traseu și fiecare figură se mișcă cu propria viteză; **Secunde** este atunci lungimea cea mai mică a pasului. **Unități de nivel pe metru** spune în ce unități este nivelul: 39,37 pentru hărțile CS2 (unități de joc), 1 pentru hărțile în metri.

## Comparație cu datele meciului {#compare-with-match-data}

**Încarcă fișiere de meci…** citește tabelele de meci CS2 ale hărții (fișierele Parquet ale uneltei CS2, câte vrei; doar coloanele necesare, în fundal); **Folosește datele încărcate** ia datele încărcate în vizualizator. Apoi:

- **Cea mai timpurie sosire pe hartă** colorează harta după timpul de la începutul rundei la care un jucător a ajuns prima dată în fiecare loc - butonul **Cel mai rapid** arată cel mai rapid peste toate rundele, **Tipic (mediană)** runda din mijloc - verde devreme, roșu târziu, pentru una dintre tabere sau pentru amândouă. Arată ce este posibil și când.
- Traseul selectat este comparat cu ce au realizat jucătorii de la începutul lui (sau de la începutul rundei) până la sfârșitul lui, fiecare sfârșit fiind un disc de raza stabilită: "Cel mai rapid observat 14,2 s, p10 15,0 s, mediană 18,3 s din 41 de încercări; planul tău 15,1 s".
- Vitezele cu care s-au mișcat de fapt jucătorii - alergând, mergând, ghemuiți, din coloanele de mers și de ghemuit ale tabelelor - în m/s.

## Pași {#steps}

Bara de sub vedere ține pașii. Un plan începe cu unul; **+** adaugă unul, iar fiecare figură începe în el acolo unde s-a terminat drumul ei din pasul anterior; **−** elimină pe cel afișat. **Secunde** este cât durează pasul afișat la redare. **▶** (K) redă de la pasul afișat până la capăt: figurile cu traseu le parcurg, figurile mutate într-un loc nou în pasul următor alunecă acolo, restul stau pe loc. Cât timp un pas este afișat, locul fiecărei figuri în pasul următor este desenat ca o fantomă estompată, iar săgețile ultimului pas se văd slab sub cele ale acestui pas.

## Salvare {#saving}

Secțiunea **Fișier** conține **Salvare**, **Desch.** și **Golește**. **Salvare** scrie planul ca `<name>.h3dplan.json` (JSON simplu: tabere, pași, figuri cu un loc pe pas, săgeți, zone, note); **Desch.** citește unul înapoi. Un fișier de altă versiune, sau unul care nu este un plan, este refuzat cu motivul. **Golește** golește planul; Anularea îl aduce înapoi.

## Figuri {#figures}

Fiecare figură este construită de vizualizator însuși: forme simple, la mărimea publicată a unui tip, cu trăsăturile care o deosebesc de vecinele ei - roțile de rulare și turela unui tanc, tunurile, rachetele și radarele unui vehicul antiaerian, planul aripii, coada și motoarele unui avion, rotoarele și aripioarele scurte ale unui elicopter. Nimic nu este luat dintr-un joc. Un design inventat de un joc este arătat ca figura generică a clasei lui. Vezi [Figuri](figures.md#which-figure-a-unit-gets) pentru cum găsesc datele figura lor.

## Anunțul Riot {#riots-notice}

Hărțile Valorant sunt afișate sub politica „Legal Jibber Jabber” a Riot Games, care permite proiectelor comunitare gratuite să le folosească și cere acest anunț oriunde apar: *3DHeat a fost creat sub politica „Legal Jibber Jabber” a Riot Games, folosind active deținute de Riot Games. Riot Games nu susține și nu sponsorizează acest proiect.* Abilitățile de pe tablă sunt forme generice, nu arta Riot.
