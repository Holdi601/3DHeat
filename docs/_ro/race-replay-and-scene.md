---
title: "Reluarea și scena 3D"
parent: "Analiză de cursă"
nav_order: 52
lang: "ro"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Reluarea și scena 3D

Redați turele împreună, ca o cursă, și urmăriți unde se desprinde una dintre mașini. Aici este descris tot ce vedeți în vizualizarea 3D a filei **Analiză de cursă**: traiectoriile parcurse, culorile pictate pe pistă, mașinile și etichetele.

![Harta cauzelor, cu mașinile aliniate cu 40 m înainte de o curbă: pista colorată, două mașini și stâlpul steagului](../assets/img/en/race-replay-lined-up.webp)

## Ceasul redării {#the-replay-clock}

Un singur ceas conduce fiecare tură: secundele din tura **de referință**. Motorul îl avansează la fiecare cadru în timp ce redarea rulează (cu timpul cadrului × viteza redării); la sfârșit revine la 0 când **Buclă** este pornită, altfel se oprește. Ceasul nu face parte intenționat din depozit, pentru ca bara laterală să nu se redeseneze la fiecare cadru; HUD-ul și graficele se abonează la el și se actualizează cel mult o dată pe cadru.

**Lungimea redării** este cea mai lungă durată pe care o are vreo tură pe ceas: timpul fiecărei ture (minus decalajul ei din *Aliniate*), sau timpul referinței în *Umăr la umăr*.

## Bara de transport {#the-transport-bar}

Sub vizualizare, de la stânga la dreapta:

| Control | Ce face |
|---|---|
| ⏮ | înapoi la start (și **Home**) |
| ▶ / ❚❚ | redare / pauză (și **K**) |
| viteza | 0,25×, 0,5×, 1×, 2×, 4× |
| glisorul de derulare | setează ceasul direct, în pași de 0,01 s |
| ceasul | `timp / lungime · metri`: ceasul ca timp de tură, lungimea redării și cât de departe pe referință se află mașina de referință |
| *De la start* / *Aliniate* / *Umăr la umăr* | modul de redare (mai jos) |
| **Aliniază aici** | pune fiecare mașină unde se află acum referința și continuă de acolo |
| **Buclă** | reia de la început la sfârșit (pornit implicit) |
| **Ascunde graficele** / **Arată graficele** | graficele de distanță de sub bară |

Butoanele sunt dezactivate până se încarcă ture (o tură este suficientă ca să o redați; comparațiile au nevoie de două).

## Modurile de redare {#replay-modes}

Cum rezultă timpul propriu al fiecărei ture din ceas:

| Mod | Timpul fiecărei ture | Ce arată |
|---|---|---|
| **De la start** (`start`) | chiar ceasul | fiecare tură de la propriul ei start: o cursă între ele, cu diferența crescând așa cum a crescut pe pistă |
| **Aliniate** (`anchor`) | ceasul plus decalajul turei | fiecare mașină în același loc, în același moment, apoi lăsată să plece - ce se întâmplă de la acel punct încolo, nu de la începutul turei |
| **Umăr la umăr** (`locked`) | momentul în care tura a ajuns la distanța curentă a referinței | fiecare mașină ținută la distanța referinței toată tura: viteze și comenzi comparate metru cu metru |

Folosiți-l când:

- **De la start**: vreți să vedeți cine este în față și cum crește diferența.
- **Aliniate**: vreți să știți ce se întâmplă într-o curbă sau pe o linie dreaptă, cu toți pornind egali acolo.
- **Umăr la umăr**: vreți să comparați ce fac piloții cu pedalele și volanul în același loc de pe traseu.

**Decalajele din *Aliniate*:** pentru un punct de ancorare la `s` metri de-a lungul referinței, decalajul fiecărei ture este timpul ei propriu la `s` minus timpul referinței la `s`, ambele citite din turele aliniate (vezi [o axă a distanței](race-corner-analysis.md#one-distance-axis)). O tură care nu acoperă `s` păstrează decalajul 0. Alegerea *Aliniate* din butoanele de mod ancorează la distanța curentă a referinței.

Un stâlp alb cu steag (14 m înălțime) marchează ancorarea în modul *Aliniate*.

### Alinierea {#lining-up}

| Acțiune | Ancora | Ceasul |
|---|---|---|
| **Aliniază aici** | unde se află acum referința | neschimbat |
| Shift + clic pe grafice | metrul pe care s-a dat clic | cu 1,5 s înainte ca referința să ajungă la el |
| o constatare din *Unde se poate câștiga timp*, o insignă numerotată pe pistă, un rând din *Viraj cu viraj* cu o constatare | cu 40 m înainte de unde începe cauza constatării | cu 1,5 s înainte de acel punct; apoi redă |
| un eveniment de control al mașinii, o etichetă de lovitură | cu 40 m înainte de eveniment | cu 1,5 s înainte; apoi redă |
| o tură din statisticile traseului | ca și constatarea sau evenimentul ei | ca mai sus, cu acea tură focalizată |

Uitându-vă la o constatare, camera o și încadrează - o sferă în jurul mijlocului intervalului constatării, cu raza cea mai mare dintre 40 m și jumătatea lungimii sale plus 30 m (60 m pentru un eveniment) - în afară de cazul în care camera urmărește o mașină.

### Camera de urmărire {#chase-camera}

⌖ din lista de ture face ca apoi camera să urmărească acea mașină: 2,5 + 4 × mărimea mașinii metri în spatele ei și 0,9 + 1,1 × mărimea mașinii metri deasupra, privind pe direcția ei de deplasare, înclinată în jos spre mașină, netezită (20% din drum la fiecare cadru), astfel încât să nu tremure la fiecare zvâcnire. Un nou clic pe ⌖ o eliberează. Mașina urmărită este desenată puțin mai deschisă, cu un inel alb pe sol, iar cardul ei este evidențiat.

## Secțiunea Vizualizare {#the-view-section}

| Control | Implicit | Ce face |
|---|---|---|
| **Linii** / **Harta timpului** / **Harta cauzelor** / **Harta greșelilor** | Harta timpului | ce este pictat de-a lungul pistei (mai jos); *Linii* nu pictează nimic |
| legendă | - | *câștigă ↔ pierde* pentru harta timpului, culorile cauzelor pentru harta cauzelor, *puține ture ↔ cele mai multe ture* pentru harta greșelilor |
| **Traiectorii parcurse** | pornit | traseul fiecărei ture vizibile, în culoarea ei |
| **Mașini** | pornit | mașinile și sursele cardurilor HUD |
| **Pneuri și suspensie** | pornit | temperatura pneurilor, inelele de alunecare, tijele de suspensie și alte simboluri pe fiecare roată, și lămpile de pe acoperiș ale mașinilor |
| **Etichete** | pornit | numele curbelor, insignele numerotate, etichetele loviturilor, etichetele curbelor de pe harta greșelilor |
| **Pistă din tururi** | pornit | o suprafață de drum pentru un traseu fără model extras (ascunsă când este încărcat un model de traseu) |
| **Toate valorile pe carduri** | oprit | fiecare canal listat pe fiecare card HUD |
| **Forme reale de mașini** | pornit | fiecare mașină în forma echivalentului ei (vezi [Mașinile](#the-cars)); oprit: monopostul deschis, care nu ascunde nimic din telemetrie |
| **Mărimea mașinii** | 1× | de la 1× la 10×, în pași de 0,5; 1× este mărimea reală a mașinii, cât de lungă și largă este în joc. Nimic altceva nu o schimbă decât acest glisor |

## Traiectoriile parcurse {#driven-lines}

Traseul fiecărei ture vizibile prin propriile ei eșantioane, în culoarea ei, desenat la 0,12 m sub poziția înregistrată (poziția înregistrată a unei mașini este punctul ei de referință, la 0,28-0,47 m deasupra drumului, pe traseele Forza extrase). Se păstrează un punct la fiecare 1,5 m; cu mai mult de 10 ture vizibile, turele la care nu se privește păstrează câte unul la fiecare 6 m (fiecare vârf merge la GPU la fiecare cadru).

## Hărțile {#the-maps}

Toate trei sunt benzi de-a lungul traseului **de referință**, la 0,2 m sub pozițiile înregistrate, câte un patrulater la fiecare pas de 2 m al grilei.

### Harta timpului (`where`) {#time-map-where}

Pentru tura focalizată: secunde câștigate sau pierdute pe metru față de tura cu care este comparată în acel punct (cea mai bună din clasa ei, sau, pentru referință, cea mai rapidă altă tură prin fiecare segment), din schimbarea deltei aliniate pe fiecare pas al grilei, netezită pe ±10 m. Roșu acolo unde pierde timp, verde unde câștigă, gri între ele; scala de culori este percentila 95 a valorilor absolute, astfel încât vârfurile sunt tăiate și cea mai mare parte a turei rămâne în interval. Lățime de 6 m.

### Harta cauzelor (`why`) {#cause-map-why}

Pentru tura focalizată: fiecare pierdere pictată peste intervalul unde se află **cauza** ei (nu unde apare timpul), colorată după grupul cauzei, cea mai costisitoare constatare câștigând acolo unde se suprapun două. Lățime `3 + 9·√(cost / cel mai mare cost)` metri; unde nu s-a pierdut nimic, o bandă gri de 2 m. Constatarea selectată în *Unde se poate câștiga timp* este pictată în alb.

| Grup | Culoare | Constatări |
|---|---|---|
| frânare | portocaliu | pierderi de conducere în faza de frânare |
| intrare | magenta | pierderi de conducere la intrare și prin mijloc |
| ieșire | albastru | pierderi de conducere la ieșire |
| linie dreaptă | galben | pierderi de conducere pe linia dreaptă |
| mașină | gri | ce explică mașina |
| context | gri închis | situația (un start de cursă față de o tură lansată) |

### Harta greșelilor {#mistake-map}

Câte dintre toate turele (din clasele alese în statisticile traseului) au greșit în fiecare metru - de orice fel, sau doar cel ales în statistici. Fiecare tură se numără o dată pe metru; intervalul fiecărei greșeli se lărgește cu 6 m pe fiecare parte, ca una scurtă să se vadă. Lățime `3 + 10·(ture / cele mai multe ture)` metri și o culoare de la maro estompat la portocaliu aprins; gri de 2 m unde nicio tură nu a greșit. Vezi [Statisticile traseului](race-course-statistics.md#the-mistake-map).

## Pistă din tururi {#track-from-the-laps}

Pentru un joc al cărui traseu nu a fost extras, sub traiectorii se desenează un drum: la fel de lat ca dispersia turelor de-a lungul referinței (contează decalajele laterale în 25 m) plus 2 m pe fiecare parte, cel puțin 4 m pe fiecare parte a liniei de referință, netezit pe ±8 puncte ale grilei (±16 m), în gri asfalt, cu linii de margine deschise, la 0,3 m sub pozițiile înregistrate. Ascunsă când este încărcat un model de traseu în **Nivel**.

## Loviturile și accidentele pe pistă {#hits-and-crashes-on-the-track}

Loviturile și accidentele fiecărei ture vizibile (vezi [Evenimente de control al mașinii](race-control-events.md#hits-and-crashes)) sunt marcate acolo unde s-au produs, ori de câte ori se desenează linii sau mașini: o stea ascuțită - roșie pentru un accident, chihlimbar pentru o lovitură - pe un stâlp, cu un inel în culoarea turei la bază, dimensionată după mărimea mașinii (accidentele mai mari). Când o mașină trece prin momentul unei lovituri, un inel de șoc se răspândește din ea timp de 0,8 s.

## Modul de ajutor {#help-mode}

**?** lângă selectorul de limbă, sau tasta **?** ori **F1**, pornește o legendă a fiecărei culori de pe ecran, pe toate cele trei file ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Alegerea rămâne în acest browser.

- **Legenda** din colțul vizualizării listează culorile pentru fila și modul folosite. Fiecare scară provine de unde o ia vizualizarea, așa că o scară de căldură pe care ați editat-o apare ca editată. În fila de curse se listează doar ce au turele încărcate.
- **Cardul fiecărei mașini** primește un tabel cu ce este desenat pe roțile ei, pe nume, cu valoarea fiecărei roți în culoarea în care este desenată.
- **Mașina în focalizare** primește o etichetă la fiecare roată care spune același lucru, plasată afară, la colțuri. Este ascunsă când mașina este prea mică pe ecran ca să încapă.

## Mașinile {#the-cars}

**Fiecare mașină în forma ei**, în culoarea turei ei și la mărimea reală. Formele vin dintr-un fișier de mașini, făcut o dată pe calculatorul pe care este jocul:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Fără unul, fiecare mașină se desenează ca **mașina proprie a vizualizatorului** din clasa și epoca ei: berlină, coupé, hatchback, break, mașină sport, supercar, muscle car, off-roader, pick-up, furgonetă sau microcar, fiecare ca clasică (dinainte de 1980), din anii 80 și 90, sau modernă ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Acestea sunt construite aici din proporții generale: fără logouri, fără nume de modele și nimic din fișierele niciunui joc, așa că vin odată cu vizualizatorul. Tipul vine din numele mașinii, epoca din anul din nume; o mașină fără niciunul este luată după clasa ei. Despre vreo o sută de generații reale se cunosc lungimea, lățimea, înălțimea și ampatamentul publicate ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); câte o linie, rotunjit), astfel încât un 3 Series din anii 1990 primește mărimea și poziția acelei mașini, tot ca formă simplă, fără emblemă sau grilă.

Fișierul de mașini se face pe propriul calculator, dintr-o copie proprie a jocului. Conține un model cu detaliu redus al fiecărei mașini, de aproximativ 900 de triunghiuri, cu pozițiile roților (vezi [comanda `cars` a extractorului](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Încarcă fișierul cu mașini...** din setările vizualizării, sau tragerea fișierului peste fila de curse, îl încarcă; rămâne în acest browser. Conține formele jocului, așa că nu este ceva de transmis mai departe, iar vizualizatorul nu livrează niciunul.

Ce mașină ține locul celei unei ture se stabilește de fiecare dată din ce este încărcat și nu se păstrează niciodată, astfel încât o mașină fără corespondent azi primește propriul imediat ce un fișier mai nou o are ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Mașina turei | Desenată ca |
|---|---|
| numărul ei este în fișier pentru același joc | chiar mașina aceea |
| aceeași marcă, și un cuvânt din model în nume | modelul acela, cel mai apropiat ca ani |
| aceeași marcă, aceeași generație | mașina mărcii aceleia cea mai apropiată ca ani |
| orice altceva, cu un fișier de mașini | cea mai apropiată a aceleiași mărci dacă există, altfel aceeași categorie de caroserie, cea mai apropiată ca ani |
| o mașină cu roți descoperite, după nume | monopostul de mai jos |
| niciuna dintre primele două, iar vizualizatorul cunoaște mașina după mărime | mașina proprie a vizualizatorului la mărimea acelei mașini reale, cu sau fără fișier |
| orice altceva fără fișier | mașina proprie a vizualizatorului din acel tip și din acea epocă |

Așadar, o tură dintr-un alt joc, un BMW Seria 3 din 1990, arată un BMW din acel an, iar o mașină mai nouă decât fișierul arată cea mai apropiată rudă a ei până când fișierul se face din nou. Sfatul unei ture, și linia de sub mărimea mașinii pentru tura focalizată, spun cum este desenată și cât de aproape este asta.

Mașinile proprii ale vizualizatorului au ferestre întunecate. Modelele dintr-un fișier de mașini au o singură culoare peste tot, pentru că fișierul nu are vopsea și nici sticlă după care să se ghideze. Roțile, luminile din spate, farurile și simbolurile telemetriei de mai jos sunt desenate ca la monopost; tija de împingere trece pe exteriorul roții, unde se vede, iar brațele de suspensie sunt lăsate din desen.

**Monopostul** este un monopost cu roți descoperite, în culoarea turei, astfel încât fața să fie evidentă din orice unghi și nimic să nu ascundă roțile: caroserie, capac de motor, pontoane, habitaclu cu cască, halo, fund plat, aripi față și spate; patru roți rotunde, cele din față întoarse de direcție (până la 0,5 rad la viraj complet), fiecare pe două brațe de suspensie cu fuzetă, bară de direcție (față) sau arbore de transmisie (spate), și o tijă de împingere. Modelul este coborât cu 0,3 m față de poziția înregistrată, ca roțile să stea pe drum, și scalat de **Mărimea mașinii**.

**Caroseria se mișcă pe arcurile ei**: când tura are toate cele patru deplasări ale suspensiei, fiecare colț coboară cu deplasarea lui (exagerată la 0,12 m de la extensia completă la compresia completă, ca să se vadă dintr-o cameră de urmărire), iar caroseria se afundă, își schimbă tangajul și ruliul pe planul trecut prin cele patru.

**Ce se desenează din telemetrie** (cu *Pneuri și suspensie* pornit) urmează [tabelul canalelor](race-charts-and-hud.md#the-channel-table):

| Simbol | Din | Desen |
|---|---|---|
| culoarea pneului | `tireTemp` | pneul însuși, albastru rece → cyan → verde de lucru → galben → roșu fierbinte, pe 40-130 °C |
| inel de alunecare | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (cel mai mare) | un inel pe sol sub roată, verde cu aderență disponibilă, chihlimbar la 0,66, roșu la 1 (marginea aderenței așa cum o raportează jocul); estompat sub 0,3 |
| bară de suspensie | `suspension` (0..1) | tija de împingere colorată după deplasare: albastru întins, alb la mijloc, roșu comprimat |
| strălucire a frânei | `brakeTemp` (100-900 °C) | un disc pe fața exterioară a roții, de la întunecat la portocaliu |
| bandă de uzură | `tireWear` (0..1) | o bandă în jurul marginii benzii de rulare, de la alb (nou) la roșu (uzat) |
| bară de sarcină | `wheelLoad` (0-12 000 N) | un stâlp lângă roată, la fel de înalt ca sarcina |

Luminile de frână (lumina de ploaie și plăcuțele aripii din spate) se aprind odată cu pedala de frână. Fiecare canal `lamp` care este pornit (peste jumătate din domeniul lui) aprinde o lampă deasupra cutiei de aer, în culoarea sa: ABS în acțiune, control de tracțiune în acțiune, DRS, limitatorul din boxe, frâna de mână, în aer.

**În mulțime** (peste 10 vizibile), mașinile la care nu se privește sunt desenate simplu: caroserie, aripi, roți și lumina de frână.

## Etichete {#labels}

Fixate pe pistă și plasate la fiecare cadru din proiecția camerei (în afara ecranului sau în spatele camerei, ascunse). Cu **Etichete** pornit:

| Etichetă | Unde | Clic |
|---|---|---|
| numele curbelor (`T1`, `T2` …) | deasupra apexului fiecărei curbe, pe referință | - |
| insigne numerotate 1-5 | cele cinci mari pierderi de conducere ale turei focalizate, la mijlocul intervalului fiecărei cauze, încadrate în culoarea cauzei; cu mouse-ul deasupra, titlul și costul | aliniază și redă acea constatare |
| etichete de lovitură / accident | deasupra fiecărei izbucniri a turei **focalizate**: „Accident −45 km/h” / „Lovitură −12 km/h”; cu mouse-ul deasupra, descrierea completă și sfatul | aliniază și redă impactul |
| etichete ale curbelor de pe harta greșelilor (în locul numelor curbelor și insignelor, când harta este harta greșelilor) | apexul fiecărei curbe: „T3 · 5/40 frânare timpurie” (cea mai frecventă greșeală, turele care au greșit / turele care au parcurs curba), „T3 · 5/40” când este aleasă un singur fel, „T3 · curat” când niciunul; cu mouse-ul deasupra, pierderile curbei și cele cinci greșeli cele mai frecvente | deschide sau închide acea curbă în statisticile traseului |

## Lumi oglindite {#mirrored-worlds}

Lumea vizualizatorului are sistem de coordonate drept, cu Y în sus: privită de sus, o mașină a cărei direcție de deplasare `atan2(dx, dz)` crește virează la stânga. Un joc cu sistem stâng - Forza printre ele - apare oglindit: fiecare curbă la dreapta este desenată ca una la stânga, atât traseul, cât și turele.

Turele spun singure asta ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): parcurgând fiecare tură câțiva metri (3 m) o dată, virajul traseului ei se compară cu comprimarea suspensiei de pe exterior (`suspension.FR` minus `suspension.FL`) și, fără suspensie, cu volanul (pozitiv la dreapta în fiecare adaptor). O tură care virează în total mai puțin de π nu spune nimic; dovada contează când depășește 2% din viraj. Turele votează; la egalitate, „nu se poate spune”.

Când verdictul turelor nu se potrivește cu inversarea axelor curente (un număr impar de axe inversate în **Cameră și scenă → Inversează axa lumii**), secțiunea **Tururi** spune asta sub listă:

- jocul este oglindit și nimic nu este inversat: „Aceste ture virează la dreapta acolo unde traseul este desenat virând la stânga …” cu **Inversează X**;
- axele sunt inversate, dar turele nu sunt oglindite: „Axele inversate desenează aceste ture oglindite …” cu **Resetează axele**.

Se schimbă doar desenul - o reflexie pliată în matricea de vizualizare; datele, analiza și fiecare coordonată arătată de instrumente rămân ale jocului. Inversarea se păstrează în browser. Analiza numește curbele la stânga sau la dreapta după aceeași măsurătoare (o lume necunoscută se ia drept oglindită, cum este cea a Forzei).

## Pentru dezvoltatori {#for-developers}

Cod: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Ce este o mașină într-un moment {#what-a-car-is-at-a-moment}

`stateAt` interpolează fiecare canal între cele două eșantioane din jurul timpului turei. Canalele în trepte (treapta, steagurile) iau eșantionul cel mai apropiat. O tură terminată se oprește pe linie.

**Direcția.** Direcția de deplasare vine din poziții aflate la câțiva metri distanță (cel puțin 2 m pe fiecare parte, ca o zvâcnire să nu întoarcă mașina). Direcția caroseriei vine din yaw-ul jocului doar după ce este potrivit cu direcția de deplasare - semn și decalaj, prin media circulară a eșantioanelor mai rapide de 10 m/s (cel puțin 20) - și numai dacă apoi se potrivește cu ea (varianța circulară sub 0,05, aproximativ 18° de dispersie); altfel caroseria arată pe direcția de deplasare. Astfel o derapare rămâne vizibilă (caroseria și deplasarea despărțite), fără să se aibă încredere în convenția de unghi a unui joc.

**Volanul și părțile.** În ce sens întoarce mașina un volan pozitiv și de ce parte a roților din dreapta ale jocului ține, se măsoară din tură: volanul față de virajul traseului și care parte a suspensiei se comprimă la exteriorul curbelor (fără date de suspensie, jocurile Forza se iau ca oglindite).
