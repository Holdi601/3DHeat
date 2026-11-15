---
title: "Camera și comenzile"
nav_order: 14
has_children: true
lang: "ro"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Cameră și comenzi

Zbori prin scenă ca o pasăre: **W A S D** ca să te miști, trage cu mouse-ul ca să privești. Folosește această pagină ca să zbori, ca să sari la o vedere de sus sau din lateral și ca să citești exact unde este camera.

## Zboară în 4 pași {#fly-in-4-steps}

1. Apasă o dată pe vedere, ca să aibă tastatura.
2. Ține apăsat **W** ca să zbori înainte, **S** înapoi, **A** și **D** lateral, **Space** în sus, **Q** în jos.
3. Ține apăsat butonul din stânga sau din dreapta al mouse-ului și trage ca să privești în jur.
4. Apasă **F** ca să încadrezi din nou toate datele.

Camera este o cameră de zbor liber, cu proiecție perspectivă și paralelă, vederi predefinite, o poziție scrisă de mână și adâncime de câmp. Setările ei sunt în panoul **Cameră și scenă** de jos din bara laterală (apar și în filele Analiza cursei și Meci). Implementarea este [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Zborul {#flying}

| Intrare | Efect |
|---|---|
| `W` `A` `S` `D` sau tastele cu săgeți | Înainte (de-a lungul vederii, inclusiv înclinarea ei), stânga, înapoi, dreapta |
| `Space` sau `E` | În sus (sus în lume) |
| `Q` sau `Ctrl` din stânga | În jos |
| `Shift` (ținut) | de 6 ori mai rapid |
| `Alt` din stânga (ținut) | 15% din viteză |
| Trage cu butonul din stânga sau din dreapta al mouse-ului | Privește în jur. Cursorul este blocat cât timp tragi. |
| Rotița mouse-ului | Viteza de zbor ×1,5 pe clic (perspectivă); zoom (paralel) |
| `F` | Încadrează datele |
| Clic (fără tragere) | Arată ce se află sub cursor ([Inspectarea vederii](#inspecting-the-view)) |
| `C` | Copiază poziția camerei, girația și tangajul |
| `G` | Mergi la un punct scris |
| `Esc` | Închide cardul de selecție (și oprește urmărirea unei unități) |

### Cât timp urmărești o unitate {#while-following-a-unit}

Când camera urmărește o unitate într-o reluare ([Reluarea meciului](match-replay.md)), tastele de zbor fac altceva:

| Intrare | Efect |
|---|---|
| Rotița, `W` / `S` | Mai aproape de unitate / mai departe (mai sus / mai jos în vederea din satelit) |
| `A` / `D`, `Q` / `E` | Orbitează în jurul unității (vederile din spate și orbită) |
| Trage | Privește în jurul unității (carlinga: privește în interior) |
| `V` / `Shift+V` | Vederea de cameră următoare / anterioară |
| `Esc` | Mai întâi nu mai privește a doua unitate, apoi oprește urmărirea |

Tastele de mișcare se adună cu un [gamepad](gamepad.md); vezi [referința tastaturii](keyboard-reference.md) pentru tot restul. Tastele sunt ignorate cât timp un câmp de text sau o listă derulantă are focusul. Înclinarea este oprită chiar înainte de drept în sus și în jos.

## Panoul Cameră și scenă {#camera--scene-panel}

![Panoul Cameră și scenă: Proiecție, butoanele vederilor predefinite, Câmp vizual, Viteza de zbor și Poziție](../assets/img/en/camera-panel.webp)

### Proiecție {#projection}

**Proiecție**: *Perspectivă* (implicit) sau *Paralelă*.

*Paralela* (ortografică) elimină scurtarea perspectivei, deci două puncte fierbinți de aceeași densitate se citesc la aceeași mărime oriunde în cadru – comparația pentru care există harta de căldură – și ea face ca o vedere izometrică să fie izometrică. În modul paralel, rotița mouse-ului face zoom (nu există mișcare înainte care să schimbe scara), iar [afișajul vitezei](#fly-speed) este ascuns.

**Schimbarea păstrează subiectul la aceeași mărime.** O proiecție paralelă nu are câmp vizual, deci înălțimea ei de cadru nu are legătură cu distanța camerei; trecerea naivă ori dă zoom sălbatic, ori nu arată nimic. Când treci la paralelă, înălțimea cadrului se pune la ce acoperă camera în perspectivă la distanța de focalizare (2 × distanța × tan(câmp / 2), distanța de focalizare fiind distanța de la ultima încadrare). Când te întorci, se restabilește poziția de perspectivă pe care ai părăsit-o, la aceeași scară aparentă, în loc de oriunde a rătăcit vederea paralelă.

### Vederi predefinite {#preset-views}

| Grup | Butoane | Orientare |
|---|---|---|
| **Izometrică** | **NE**, **NV**, **SE**, **SV** | Paralelă, tangaj -35,264° (= atan(1/√2), unghiul la care toate cele trei axe se proiectează la aceeași lungime), girație -45°, 45°, -135°, 135°. Patru colțuri, pentru că una singură ascunde mereu jumătate din hartă în spatele a ce e mai aproape. |
| **Elevații** | **Sus**, **Jos**, **Față**, **Spate**, **Stânga**, **Dreapta** | Paralelă. Sus privește drept în jos (tangaj -89,9°), Jos drept în sus, Față de-a lungul lui -Z (girație 0°), Spate de-a lungul lui +Z (180°), Stânga de-a lungul lui -X (-90°), Dreapta de-a lungul lui +X (90°). |
| | **Înapoi la perspectivă** | Revine la poziția de perspectivă pe care ai părăsit-o. Dezactivat în perspectivă. |
| | **Vedere din trei sferturi** | Perspectivă, girație -35°, tangaj -28°. |

Fiecare vedere predefinită schimbă chiar proiecția – în perspectivă, o „vedere de sus” încă converge spre un punct de fugă, iar suprafețele egale nu mai par egale – și încadrează datele din direcția aceea.

### Câmp vizual {#field-of-view}

**Câmp vizual** – unghiul vertical. Implicit 65°, 10–140° pe cursor (179° cu mâner), cu butoanele **Plat 20°**, **Lung 35°**, **Normal 50°**, **Larg 65°**, **Foarte larg 90°**. Un câmp îngust aplatizează perspectiva și seamănă mai mult cu o proiecție paralelă; unul larg exagerează adâncimea și face distanțele greu de judecat. Rămâne activ și în modul paralel, unde stabilește scara pe care o rezolvă comutarea înapoi și distanța pe care o folosește **Cadru**.

### Viteza de zbor {#fly-speed}

**Viteza de zbor** – unități ale lumii (metri) pe secundă la plin. Implicit 120; la fiecare încărcare, întinderea orizontală a datelor / 12. Logaritmică, 0,02–20.000 (200.000 cu mânerul; mânerul o schimbă după rapoarte, nu după sume). Rotița mouse-ului o înmulțește sau o împarte la 1,5 pe clic, între 0,02 și 200.000.

Aceeași valoare apare în colțul din dreapta jos al vederii (doar în perspectivă): viteza în m/s sau km/s și timpul necesar să traversezi datele (sau nivelul, când este încărcat un nivel 3D) la acea viteză. Trage în sus sau în jos ca să schimbi viteza.

### Aproape și departe {#near-and-far}

Distanțele de decupare **Aproape** (implicit 0,5) și **Departe** (implicit 40.000). Amândouă se recalculează din date la fiecare încărcare (aproape = max(0,05, întindere / 20.000), departe = întindere × 12) și se lărgesc, niciodată nu se îngustează, de un nivel 3D mai mare ([Niveluri](levels.md#what-a-level-does-for-the-heat)). Raportul lor stabilește precizia adâncimii de care depinde ascunderea, deci un aproape foarte mic și un departe foarte mare slăbesc [ascunderea](depth-and-culling.md). Privită din afara scenei sau de sus deasupra solului ei, planul apropiat folosit efectiv se mută până la 2% din distanța aceea, astfel încât o hartă privită de departe păstrează destulă precizie a adâncimii cât apa și țărmul să nu pâlpâie; caseta arată în continuare valoarea setată.

### Alte comenzi {#other-controls}

| Comandă | Implicit | Înseamnă |
|---|---|---|
| **Inversează Y** | oprit | Inversează privirea mouse-ului în sus/jos. |
| **Profunzime de câmp** | oprit | Vezi mai jos. |
| **Gamepad** | activat | Vezi [Gamepad și HOTAS](gamepad.md). |
| **Poziție** | | Vezi mai jos. |
| **Inspectare** | | Afișajul camerei, selecția cu clic, convenția girației și *Mergi la un punct*; vezi [Inspectarea vederii](#inspecting-the-view). |
| **Încadrează setul de date (F)** | | Potrivește datele (în fila Analiza cursei: turele) cu vederea, păstrând direcția curentă. Camera este pusă la r / tan(câmp / 2) față de centru, r fiind jumătate din diagonala limitelor datelor. |
| **Grilă**, **Axe** | pornite, pornite | O grilă pe sol cu un pas 1/2/5 × 10ⁿ de aproximativ 1/40 din întinderea datelor (ajungând la 1,5 × datele, între 8 și 120 de pași de grilă), și axe colorate. |
| **Inversează axa lumii** X, Y, Z | oprit | Vezi mai jos. |

### Poziție {#pose}

Cinci casete numerice – **X**, **Y**, **Z** și **girație °**, **tangaj °** – care urmăresc camera cât timp niciuna nu are focus. Scrie o valoare și apasă `Enter` (sau părăsește caseta) ca să muți camera acolo. **copiază** pune `poz X Y Z · girație A · tangaj B` pe clipboard (cu `(girația jocului)` după el când este aleasă această convenție). Zborul este cum explorezi; coordonatele sunt cum reproduci o vedere. Sunt aceleași numere ca la [afișajul camerei](#camera-readout): propriile coordonate ale datelor, inclusiv când o axă este inversată, iar girația în [convenția](#yaw-conventions) aleasă.

### Inversează axa lumii {#invert-world-axis}

**Inversează axa lumii X / Y / Z** desenează lumea cu acea axă inversată. Un joc care ține o lume cu mâna stângă iese oglindit în acest vizualizator cu mâna dreaptă – curbele cu dreapta sunt desenate ca niște curbe cu stânga – iar inversarea lui X sau Z o readuce. **Se schimbă doar desenul**: datele, analiza și fiecare coordonată arătată de unelte (poziția, rigla, felia) rămân ale jocului. Vederea se întoarce pe loc, păstrându-te să privești același loc. Setarea este reținută în browser (cheia `localStorage` `heat3d.mirror`); compară cu [răsturnările](axes-units-and-time.md#flips) de la încărcare, care schimbă datele.

## Inspectarea vederii {#inspecting-the-view}

Unde este camera, ce se află sub cursor și mersul la un punct – blocul **Inspectare** din panoul Cameră și scenă și două suprapuneri în colțul din stânga sus al vederii. Codul este în [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) și [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Comandă | Implicit | Înseamnă |
|---|---|---|
| **Poziția camerei peste vizualizare** | pornit | Afișajul camerei, mai jos. Se închide și cu **×**. |
| **Clicul arată ce se află acolo** | pornit | Selecția cu clic, mai jos. |
| **Convenția girației** | Vizualizator | Ce girație arată și citesc afișajul, casetele de poziție și caseta de salt. |

Aceste trei sunt reținute în browser (cheia `localStorage` `heat3d.inspect`).

### Afișajul camerei {#camera-readout}

În colțul din stânga sus al vederii: **x**, **y**, **z**, **girație** și **tangaj** ale camerei, în timp real, cu o etichetă care numește convenția girației. Arată aceleași numere ca și casetele [Poziție](#pose) și nu costă nimic în timpul zborului (se scrie în pagină pe ceasul cadrelor, fără să redeseneze panourile).

- **copiază** (sau `C` oriunde în afara unei casete de text) pune `x X y Y z Z girație A tangaj B (girație vizualizator)` pe clipboard, cu zecimale cu punct, oricare ar fi limba – o linie pe care o citește caseta de salt și orice script.
- **mergi la** (sau `G`) deschide o casetă sub el: lipește un punct și apasă `Enter` ca să te uiți la el, sau lipește o poziție copiată întreagă ca să stai în vederea aceea. `Esc` închide caseta.

### Coordonate: cadrul propriu al datelor {#coordinates-the-datas-own-frame}

Fiecare coordonată pe care o arată sau o acceptă uneltele de inspecție este în **cadrul propriu al datelor încărcate**: [maparea axelor](axes-units-and-time.md) de la încărcare (axa în sus, răsturnările, scara) este anulată. O poziție citită din vedere este numărul pe care îl ține tabelul sursă, iar un număr din tabel scris în caseta de salt aterizează exact pe acel loc. Când maparea nu schimbă nimic (o încărcare cu Y în sus, fără scară – ceea ce scriu uneltele de captură și exportatorii de niveluri) acesta este pur și simplu lumea; altfel afișajul poartă o etichetă **cadrul datelor**. Fără un set de date, coordonatele sunt coordonatele lumii. Girația și tangajul sunt mereu despre lumea vizualizatorului, Y în sus.

### Convențiile girației {#yaw-conventions}

| Convenție | Girația 0° privește de-a lungul | Crește spre | Folosită de |
|---|---|---|---|
| **Vizualizator** | -Z | -X | camera de zbor, [vederile predefinite](#preset-views) |
| **Joc / instrumente de captură** | +X | -Z | coloanele `yaw` și pozițiile uneltelor de captură; într-un nivel exportat în cadrul vizualizatorului, girația proprie a jocului |

Tangajul este același în ambele: în sus de la orizontală. Cele două diferă printr-un sfert de întoarcere și nimic altceva:

> girație vizualizator = girație joc - 90°

O direcție `d` este `(cos p · cos y, sin p, -cos p · sin y)` în convenția jocului și `(-sin y · cos p, sin p, -cos y · cos p)` în cea a vizualizatorului. Alege **Joc / instrumente de captură** ca să scrii o girație direct dintr-un tabel de captură, sau ca să compari afișajul cu unul.

### Mersul la un punct {#going-to-a-point}

**Mergi la un punct**, în blocul Inspectare (și în caseta **mergi la** a afișajului):

- caseta de text primește `x, y, z` sau `x y z` (sau `x; y; z`), cu punct zecimal sau virgulă zecimală – `-321.6, 137.8, -59.9` și `-321,6 137,8 -59,9` sunt același punct. Cinci numere adaugă o girație și un tangaj, iar o poziție copiată din afișaj sau din casetele de poziție este citită întreagă, cu etichete și convenție;
- **girație °** și **tangaj °** (opțional) rotesc camera, în convenția aleasă;
- **Privește spre** păstrează direcția (înclinată ca să privească în jos cel puțin 20° dacă privea drept) și se retrage pe ea până la distanța curentă, ținută între 0,3% și 3% din lățimea scenei – 6 până la 60 m pe un nivel de doi kilometri. Distanța de focalizare, înălțimea vederii paralele și viteza de zbor urmează, astfel încât vederea să sosească utilizabilă;
- **Stai aici** pune camera pe punct, întoarsă la girația și tangajul date, sau așa cum era.

O poziție lipită cu propria girație și al ei tangaj stă mereu în acea vedere.

### Selecția cu clic {#click-to-pick}

Un clic pe vedere – apeși și eliberezi fără să tragi mai mult de 4 pixeli; o tragere încă privește în jur – arată un card în colțul din stânga sus cu ce se află sub cursor. Cât timp [rigla](measure.md) este pornită, clicurile merg la riglă.

**Un punct de date desenat câștigă.** Cel mai apropiat eșantion la cel mult 8 pixeli de clic, dintre cele efectiv desenate: rândurile din fereastra de timp și din durata de viață, care trec [filtrele](filters.md), grupurile arătate și împărțirea diferenței, în limita tăierii după distanță și a feliei care decupează căldura. În reluarea cu cutii, o cutie sub cursor (oriunde pe ea). Cardul listează fiecare coloană pe care o poartă rândul, sub numele coloanelor sursei – timpul (ora de perete, sau secundele proprii ale fișierului cu `m:ss.ss`), persoana, grupul, sesiunea, fiecare coloană păstrată, poziția și direcția privirii – și distanța de la cameră. În memorie sunt doar coloanele pe care le-a păstrat încărcarea: o coloană care nu a fost aleasă ca [coloană de filtru](column-mapping.md) nu se arată.

**Altfel, suprafața nivelului**: punctul în care raza clicului întâlnește triunghiurile reale ale nivelului (nu planul de referință al riglei), cu **partea** din care face parte (numele exportatorului, `structure:props`, `ground:terrain …`), **felul** ei (sol, structură, apă, imagine de hartă), coordonatele și distanța. Geometria ascunsă de o felie sau de tăierea după distanță este trecută de-a lungul. Acolo unde nivelul are o [plasă de navigare](model-levels.md#navigation-meshes), o linie o numește și spune dacă punctul se află pe ea (✓). Un nume de parte cu prefixul `≈` a fost ghicit din casetele de încadrare ale părților, pentru că partea aceea din nivel a fost simplificată la încărcare.

Cardul rămâne până este închis (**×**, `Esc`), până când alt clic răspunde la altceva sau până la un clic pe spațiul gol. O cruce cyan este desenată în punct în scenă și un inel peste ea pe ecran. Butoanele lui: **copiază** (fiecare valoare, și coordonatele ca `x, y, z`), **Privește spre** și **Stai aici** (pe un punct de date, privind cum privea rândul când are o direcție a privirii; pe o suprafață, la 1,7 m deasupra ei).

Nivelul este indexat pentru selecție la primul clic care o cere: o grilă de coloane peste amprenta lui, construită câteva milisecunde pe cadru, ca vederea să nu se oprească niciodată (cam o secundă de lucru pentru un nivel de câteva milioane de triunghiuri), și păstrată până se schimbă nivelul. Până atunci, cardul spune *Se pregătește nivelul pentru selecție* cu un procent și răspunde la clic când este gata. O căutare de punct de date peste mai mult de patru milioane de rânduri desenate este împărțită pe cadre în același fel.

## Profunzime de câmp {#depth-of-field}

O secțiune pliabilă în Cameră și scenă, cu titlul *Profunzime de câmp - pornită* cât timp este activată. Oprită implicit: este un efect de prezentare, iar vederea implicită trebuie să arate datele, nu o interpretare a lor.

| Comandă | Implicit | Interval (rotiță) | Înseamnă |
|---|---|---|---|
| **Activată** | oprit | | |
| **Focalizare pe ce a fost încadrat** | pornit | | Focalizare la distanța folosită de ultima încadrare (*Focalizat la N m.*). |
| **Distanța de focalizare** | 1000 | 1–200.000, logaritmic (10.000.000) | Arătată când focalizarea este manuală. |
| **Diafragmă** | ±35% | ±2% până la ±200%, logaritmic (±3200%) | Adâncimea păstrată clară, ca fracțiune din distanța de focalizare – relativă, nu un număr f, pentru că scenele merg de la o cameră până la o hartă de opt kilometri. |
| **Estompare maximă** | 12 px | 1–48 (256) | Raza cea mai mare a estompării; costul crește odată cu ea. |

Estompează **nivelul, grila și cutiile** – *nu căldura*. Căldura dintr-un pixel este suma sprite-urilor de la multe adâncimi, deci nu are o singură adâncime în care să fie scoasă din focalizare; estompată cu geometria care stă în spatele ei, ar fi greșit oriunde plutește în față. Datele clare pe un context înmuiat sunt și cea mai utilă dintre cele două. Estomparea este o strângere de 24 de probe în unghiul de aur din pasul de compunere, ponderată astfel încât un prim-plan clar să nu fie întins spre exterior de fundalul estompat din spatele lui. Schimbarea ei redesenează fără să repornească acumularea căldurii.

## Rezoluția pânzei {#canvas-resolution}

Pânza este desenată la raportul de pixeli al ecranului, limitat la 2. Bufferul de căldură poate fi desenat la o rezoluție mai mică decât aceasta ([Rezoluția căldurii](performance-and-stats.md)).

## Pagini din această secțiune {#pages-in-this-section}

- [Gamepad și HOTAS](gamepad.md)
- [Referința tastaturii și mouse-ului](keyboard-reference.md)
