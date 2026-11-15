---
title: "Evenimente de control al mașinii"
parent: "Analiză de cursă"
nav_order: 54
lang: "ro"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Evenimente de control al mașinii

Vizualizatorul urmărește cum a fost condus fiecare tur și marchează locurile unde șoferul a făcut mașina să alunece, să se învârtă, să lovească ceva sau să piardă aderența degeaba. Asta ajută, pentru că o greșeală care a costat timp este cel mai rapid lucru de reparat.

![Secțiunea Controlul mașinii: cât de des a blocat fiecare tur o roată, s-a învârtit sau a împins în afară, și lista greșelilor cu una deschisă](../assets/img/en/race-control-table.webp)

## Pe scurt {#in-plain-words}

- **Blocare**: frânezi atât de tare încât o roată se oprește din rotit și alunecă. Mașina frânează mai prost și nu mai poate fi direcționată.
- **Patinare**: apeși accelerația atât de tare încât roțile motoare se rotesc mai repede decât merge mașina. Pierzi tracțiune.
- **Supravirare**: spatele mașinii alunecă larg. Dacă se rotește complet, asta este o **învârtire**.
- **Subvirare**: fața mașinii alunecă larg („împinge”); a întoarce mai mult volanul nu ajută.
- **Lovitură** și **prăbușire**: mașina a atins ceva (o lovitură este o bătaie sau o zgârietură, o prăbușire este una puternică).
- **ABS**, **TC**: ajutoarele mașinii care lucrează împotriva blocării și patinării. Nu sunt greșeli.

## Secțiunea Controlul mașinii (ce vezi) {#the-car-control-section-what-you-see}

Pentru tura aleasă, orice au turele – fără alunecarea pneurilor și fără unghi de derapaj – arată totuși ce se mai poate găsi, în loc de nimic (mai jos).

**Tabelul**: câte un rând pentru fiecare fel care apare în cel puțin unul dintre cele două tururi – Roți blocate, Patinare, Spatele derapează (supravirare și învârtiri), Fața alunecă în afară, Accidente, Contacte, ABS activ, Controlul tracțiunii activ, Frână de mână, În aer. Fiecare celulă este „număr · secunde”, pentru tura aleasă și pentru turul cu care e comparată; și *Cel mai mare unghi de derapaj*, când există un unghi de derapaj (cel mai mare pe sol).

**Lista**: greșelile ei nepartajate care costă cel puțin 0,02 s, cele mai scumpe primele, cel mult 12, fiecare cu titlul și costul (și eticheta tipului ei). Apasă pe una ca să-i citești sfatul, să aliniezi mașinile cu 40 m înainte și să o reiei. **Și ce au făcut ambele tururi acolo** adaugă fiecare greșeală, și pe cele partajate (eticheta „au făcut-o amândouă”, costul „—” sub 0,01 s). Dacă nu există niciuna: „Nimic din ce a făcut X cu pneurile nu l-a costat timp fără să fi făcut același lucru și Y.”

**Indiciul de sub ea** spune cu ce a putut vedea detectarea – „Din alunecarea fiecărei roți și din unghiul de alunecare, și din unghiul de derapaj al mașinii.” (sau alunecare și unghi de alunecare, alunecare și unghi de derapaj, doar alunecare, sau „Doar din unghiul de derapaj al mașinii – aceste tururi nu conțin alunecarea pneurilor.”). Mai spune pentru ce fel de teren au fost măsurate limitele (asfalt, neasfaltat, mixt: peste 80% eșantioane neasfaltate înseamnă neasfaltat, sub 20% înseamnă asfalt), la ce tur au fost puse evenimentele și cum se numără costul.

Cu **nicio alunecare a pneurilor și niciun unghi de derapaj** (un fișier de tur FH Companion fără telemetria lui) tabelul și lista se arată la fel, iar indiciul spune ce s-a putut găsi din ce conțin turele: „Aceste tururi nu conțin nici alunecarea pneurilor, nici unghiul de derapaj, așa că blocările și patinarea nu pot fi deosebite. Se detectează totuși: subvirarea, din direcție față de traiectorie; contactele și accidentele, din viteză și accelerație.” Derapajele se numesc și ele din viteza de girație, acolo unde turele au una, iar subvirarea doar acolo unde au direcție. Propoziția despre limitele de alunecare și de derapaj lipsește, iar un al doilea indiciu spune: „Pentru Forza Horizon, alegeți și fișierul `.tele.gz` de lângă fiecare tur FH Companion: este telemetria completă, cu alunecarea fiecărei roți de 64 de ori pe secundă.”

Costul **total** de control al turului (folosit în rezumate) numără o singură dată greșelile care se suprapun – o blocare și alunecarea pe care o începe, în 40 m – și anume la cea mai scumpă din grup.

## Cum se detectează {#how-it-is-detected}

Restul acestei pagini este cartea de reguli: fiecare fel și fiecare prag.

Cod: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Raționamentul și literatura sunt în [metoda](race-analytics.md).

## Felurile {#the-kinds}

| Fel | Rând în tabel | Greșeală? | Cea mai scurtă care contează |
|---|---|---|---|
| `lock` | Roți blocate | da | 0,1 s |
| `wheelspin` | Patinare | da | 0,15 s |
| `oversteer` | Spatele derapează | da | 0,2 s |
| `spin` | (numărată cu Spatele derapează) | da | 0,1 s |
| `understeer` | Fața alunecă în afară | da | 0,25 s |
| `crash` | Accidente | da | - |
| `hit` | Contacte | da | - |
| `abs` | ABS activ | nu | 0,2 s |
| `tc` | Controlul tracțiunii activ | nu | 0,2 s |
| `handbrake` | Frână de mână | nu | 0,1 s |
| `airborne` | În aer | nu | 0,15 s |

Serii mai scurte sunt zgomot (o bordură, o denivelare, un singur eșantion). Seriile de puncte de grilă (la fiecare 2 m) care trec un test sunt unite peste goluri de până la 2 puncte. Doar **greșelile** pot fi erori și au un cost; celelalte sunt ce au făcut mașina și șoferul.

## Ce cere fiecare test {#what-every-test-needs}

### Canale derivate {#derived-channels}

Înainte de a judeca orice, fiecare tur primește ce nu trimite jocul lui, sub nume canonice (valoarea jocului are întotdeauna prioritate):

| Canal | Din |
|---|---|
| `bodySlip` (unghiul de derapaj) | viteza în sistemul mașinii, `atan2(latVel, abs(longVel))`, unde jocul o trimite (0 sub 3 m/s); altfel direcția (girația jocului, potrivită cu direcția de mers după semn și decalaj pe eșantioane peste 10 m/s, și folosită doar cu o varianță circulară sub 0,05) față de direcția de mers (poziții la cel puțin 2 m distanță), la viteze peste 3 m/s |
| `yawRate` | schimbarea lui `yaw` în timp, acolo unde există direcție, dar nu și viteză de girație |
| `airborne` | contactul cu solul al fiecărei roți oprit (≤ 0,5); altfel sarcina fiecărei roți sub 5% din mediana ei; altfel cursa fiecărei suspensii la sau sub 0,02 (complet întinsă). Un singur eșantion ieșit din comun nu este un zbor |
| `slipRatio.<W>` | `(viteza suprafeței roții - viteza mașinii) / viteza mașinii` peste 3 m/s, acolo unde jocul trimite vitezele suprafeței roților; sau din rotația roții × o rază de rulare măsurată pe tur – mediana lui `viteză / rotație` cât timp rulează drept în inerție (viteză peste 10 m/s, accelerație < 0,3, frână < 0,05, abs(accelerația longitudinală) < 3 m/s², nu în aer; fiecare eșantion peste 10 m/s când sunt mai puțin de 20), acceptată între 0,1 și 1 m. Marcat `physical` |
| `loose` | zgomotul de suprafață al Forza pe cel puțin 2 roți (> 0,001) timp de cel puțin 0,33 s (o bordură este mai scurtă), golurile sub 1 s fiind legate |

### Pe sol și stabil {#on-the-ground-and-settled}

Nimic nu se judecă în aer sau timp de **0,3 s după o aterizare** – suspensia se lasă la capăt, iar accelerațiile sar, și asta nu este aderență, frânare sau tracțiune. Un eșantion trebuie și să fie **în mișcare**: mai repede de 5 m/s.

### Terenul {#the-ground}

Terenul fiecărui eșantion este **neasfaltat** acolo unde canalul `loose` al turului spune asta (zgomotul de suprafață al Forza, materialele roților din Trackmania), altfel suprafața turului (vezi [disciplina și suprafața](race-loading-laps.md#discipline-and-surface)): asfalt, sau neasfaltat pentru orice altceva. Curbele, obiceiurile de derapaj și pragurile sunt ținute separat pentru asfalt și pentru neasfaltat.

### Alunecarea, ca multiplu al vârfului nominal al pneului {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Jocurile scalează alunecarea diferit; `meta.slip` spune cum, iar fiecare alunecare este împărțită la o scară, astfel încât aproximativ 1 să fie vârful nominal al pneului:

| `meta.slip` | Înseamnă | Împărțită la |
|---|---|---|
| `peak` | normalizată de joc: peste 1 aderența se pierde (Forza Data Out) | 1 |
| `scaled` | alunecarea fizică împărțită la vârful de asfalt (înregistratorul Kunos) | vârful nominal al terenului peste cel de asfalt |
| `index` | o măsură de alunecare 0..1 (SlipCoef din Trackmania) | 0,5 |
| `physical` (sau necunoscut) | alunecarea ca fracție, unghiul de alunecare în radiani | vârful nominal al terenului |

Vârfuri nominale, când nu se știe nimic mai bun:

| Suprafață | Alunecarea pe rotire | Unghiul de alunecare |
|---|---|---|
| asfalt | 0,12 | 8° |
| mixt | 0,18 | 12° |
| neasfaltat (pietriș) | 0,25 | 15° |
| zăpadă | 0,25 | 15° |
| gheață | 0,10 | 6° |

### Unde se termină aderența: curbele pneurilor fiecărei mașini {#where-grip-ends-each-cars-tyre-curves}

Locul unde un pneu nu mai dă mai mult este **măsurat pentru fiecare mașină**, din fiecare tur încărcat al ei (`measureTyres`), separat pentru asfalt și pentru neasfaltat:

| Curba | Eșantioane (viteză peste 10 m/s, stabile, accelerații sub 45 m/s²) | Alunecarea (x) | Forța (y) |
|---|---|---|---|
| frânare | frână peste 0,3, frână de mână ≤ 0,2, mers drept (lateral sub 30% din cel mai tare) | abs(alunecarea medie pe rotire a celor patru roți) | decelerația |
| tracțiune | accelerație peste 0,8, frână ≤ 0,05, drept, tracțiunea maximă a mașinii la acea viteză peste 0,5 m/s² | alunecarea celei mai mari roți motoare | accelerația ca parte din tracțiunea aceea |
| față | lateral peste 30% din cel mai tare, aderența mașinii la acea viteză peste 1 m/s² | cel mai mare unghi de alunecare la față | accelerația laterală ca parte din aderența aceea |
| spate | la fel | cel mai mare unghi de alunecare la spate | la fel |

„Cel mai tare” este percentila 99 a lui abs(accelerația laterală) din tur, pe terenul acela (tot terenul, când are mai puțin de 50 de eșantioane). Transmisia decide care sunt roțile motoare (FWD: cele din față, RWD: cele din spate, AWD: toate; necunoscut: toate).

Din cel puțin **150 de eșantioane**, alunecarea se taie în 6 până la 14 intervale egale ca număr de eșantioane (unul la 40 de eșantioane), forța fiecărui interval fiind cuartila lui superioară (ce a dat pneul când șoferul a cerut), netezită cu intervalele vecine. **Cel mai bun** este intervalul cu cea mai mare forță; **limita** este primul interval după el în care forța a scăzut cu **8%**. O curbă care nu scade niciodată în date nu are limită (infinită) – a trece de „vârf” nu costă nimic în jocul acela, iar alunecarea singură nu marchează nimic acolo (curbele de viraj și de tracțiune ale Forza Horizon sunt așa). Cu prea puține eșantioane pe un teren, se folosesc cele ale celuilalt teren; cu prea puține în total, limita **nominală**: de 1,5 ori vârful nominal.

Fiecare mașină mai primește:

- **obiceiul de derapaj**: cuartila superioară a unghiului ei de derapaj oriunde virează la 60% sau mai mult din cel mai tare (are nevoie de 100 de eșantioane);
- **direcția pe curbură** (`steerGain`), pe benzi de viteză de 5 m/s: mediana lui abs(direcție) / curbura traseului, în viraje ferme, dar bine sub aderența ei (30–60% din cel mai tare, curbură mai strânsă decât o rază de 400 m, direcție peste 0,02; 25 de eșantioane pe bandă). Curbura traseului este viteza de girație împărțită la viteză, acolo unde jocul trimite o viteză de girație, altfel din pozițiile ±5 m.

## Detectarea, fel cu fel {#detection-kind-by-kind}

| Fel | Test (pe eșantioane în mișcare și stabile) | `peak` și `limit` |
|---|---|---|
| **lock** | frână peste 0,05, frână de mână nu peste 0,2, și alunecarea oricărei roți sub minus limita de frânare | cea mai negativă alunecare (multipli ai vârfului nominal); limita ca negativă |
| **wheelspin** | accelerație peste 0,2 (sau fără canal de accelerație), iar alunecarea unei roți motoare peste limita de tracțiune | cea mai mare alunecare la roțile motoare; limita |
| **oversteer** (unghi de derapaj) | unghiul de derapaj peste cel mai mare dintre pragul terenului și 1,5 × obiceiul de derapaj al mașinii acolo | cel mai mare unghi de derapaj, în radiani |
| **oversteer** (unghiuri de alunecare, fără unghi de derapaj) | cel mai mare unghi de alunecare la spate peste limita din spate și cu peste 0,25 mai mare decât cel din față | unghiul de alunecare la spate (multipli ai vârfului); limita |
| **oversteer** (fără unghi de derapaj, dar cu viteză de girație și accelerație laterală) | „viteza de atitudine” – abs(viteza de girație) minus abs(accelerația laterală) / viteză, peste 8 m/s – peste 0,2 rad/s, cu direcția împotriva virajului | rad/s; limita 0,2 |
| **spin** | o serie de supravirare al cărei unghi de derapaj a trecut de **60°** | ca la supravirare |
| **understeer** (unghiuri de alunecare) | nu alunecă, cel mai mare unghi de alunecare la față peste limita din față și cu peste 0,3 mai mare decât cel din spate | unghiul de alunecare la față; limita |
| **understeer** (fără unghiuri de alunecare) | mai repede de 12 m/s, fără alunecare, fără contrabraj, accelerație laterală peste jumătate din cea mai mare a turului (percentila 99), traseu mai strâns decât o rază de 300 m, iar direcția mai mare de **1,6 ori** decât cât cere traseul după direcția pe curbură a mașinii | de câte ori mai mult decât cerea traseul; limita 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` peste 0,5 | - |
| **handbrake** | `handbrake` peste 0,2 | - |
| **airborne** | `airborne` peste 0,5 | - |
| **hit**, **crash** | vezi [Lovituri și prăbușiri](#hits-and-crashes) | viteza pe care a luat-o lovitura |

Pragurile de derapaj după teren: asfalt **7°**, mixt **10°**, neasfaltat și zăpadă **15°**, gheață **10°**. Ele urmează literatura: unghiul de alunecare al unei anvelope atinge vârful la 3–10° pe asfalt, iar limita de stabilitate a unei mașini de stradă după unghiul de derivă al caroseriei este de circa 12° pe asfalt uscat, în timp ce raliul și driftul se conduc la 30–50° ([Analiza cursei, surse](race-analytics.md#sources)). O mașină care derapează mai mult de la sine – un model de pneuri arcade sau un specialist pe pietriș – are propriul prag, mai mare, din turele ei (1,5 × obiceiul ei).

**În care sens virează mașina** (pentru „împotriva virajului”): schimbarea direcției traseului turului pe ±6 m (cel puțin 2 puncte de grilă); mai strâns decât o rază de 600 m înseamnă viraj; dreapta sau stânga după cum lumea este oglindită. Direcția este **împotriva** virajului când abs(direcție) > 0,05 și semnul ei este opus virajului – o alunecare **prinsă** cu contrabraj.

**Pedalele la început** (`pedal`): *frână* când frâna este peste 0,1; *accelerație* peste 0,3; *ridicat* când accelerația a fost peste 0,5 în cele 8 puncte de grilă (16 m) dinainte; *rulare liberă* în rest (sau fără canal de accelerație).

## Pus alături de celălalt tur {#laid-against-the-other-lap}

Fiecare eveniment este judecat față de turul cu care este comparat turul ales pe segmentul respectiv (cel mai bun din clasa lui; pentru turul însuși, cel mai rapid din clasa lui pe segment):

1. **Cât a mers celălalt tur** pe aceiași metri, ±8 m: evenimentele celuilalt tur din aceeași familie (o învârtire contează ca supravirare, o prăbușire ca lovitură), măsurate în aceleași unități, fără praguri, cu curbele de pneuri ale celeilalte mașini.
2. **Partajat** când celălalt tur a mers **80%** sau mai mult: așa se ia virajul, nu este o greșeală. Felurile care nu sunt greșeli sunt mereu „partajate”.
3. **Costul**, pentru o greșeală nepartajată: timpul pe care l-a pierdut turul ales față de celălalt de la 5 m înainte de eveniment până la **40 m după** el (pentru o lovitură sau o prăbușire, până când mașina își recapătă viteza – metrii necesari să o recapete cu tracțiunea ei, 40 până la 400 m; fără tracțiune măsurată, 5 m/s²). Niciodată negativ.
4. **Viteza pierdută** până la limita mașinii: pentru o blocare, decelerația pe care mașina o arată că o poate face la acea viteză minus cea pe care a făcut-o, adunată pe durata evenimentului; pentru patinare, tracțiunea ei maximă minus cea folosită; pentru un impact, viteza pe care a luat-o. Se spune când depășește 0,5 m/s (1,8 km/h).

O greșeală care nu este partajată și costă cel puțin **0,02 s** este trecută în listă ([statisticile de curs](race-course-statistics.md) numără doar greșelile de **0,03 s** sau mai mult, ca o greșeală numărată pe multe ture să fie una clară), și poate deveni cauza pierderii într-un viraj (vezi [Analiza viraj cu viraj](race-corner-analysis.md#car-control-faults-and-impacts)).

## Lovituri și prăbușiri {#hits-and-crashes}

`impacts.ts` citește loviturile din **propriile eșantioane** ale turului, înainte de a fi reeșantionate – o lovitură durează sutimi de secundă. Pneurile nu pot produce forțele unei lovituri, așa că o lovitură se măsoară față de mașina turului însuși:

- **Aderența ei `G`**: percentila 99 a accelerației ei orizontale `√(lat² + long²)` din tur, pe sol și mai repede de 5 m/s. Fără canale de accelerație (sau sub 3 m/s²), 15 m/s² – aderența unei mașini de stradă.
- **Pragul**: `max(1,8 G, G + 18, 30)` m/s².
- **Eșantionul lovit**: accelerația orizontală peste prag *și* care sare cu mai mult de jumătate din `G` față de eșantionul anterior; **sau** viteza scade, în 0,1 s, cu mai mult decât ar cere pragul în 0,1 s plus 1,5 m/s. Doar pe sol și stabil, și doar când mașina mergea peste 5 m/s.
- Eșantioanele lovite în **0,4 s** unul de altul fac un singur impact.
- **Înainte / după**: cea mai mare viteză din cele 0,15 s dinainte; cea mai mică până la 0,3 s după ultimul eșantion lovit.
- **Nu este un impact**: viteza dispare fără o forță în spatele ei – accelerația orizontală de vârf în 0,1 s sub cel mai mare dintre `G` și 25 m/s² – înseamnă că jocul a dat înapoi sau a resetat mașina.
- **Prăbușire** când a luat **30 km/h** sau mai mult, sau când a lăsat mașina sub jumătate din viteză; altfel **lovitură** – o bătaie, o zgârietură pe lângă un zid.
- **Direcția**: accelerația longitudinală mai mare decât cea laterală și negativă: *frontal*; pozitivă: *din spate*; cea laterală mai mare: *pe lateral*. Fără accelerații, frontal.

Ce poate face o mașină se măsoară cu toate impacturile scoase, din 0,1 s înainte până la 1 s după (`struckMask`).

## Textele {#the-texts}

Fiecare eveniment este spus numind ambele ture, cu unde (metri de-a lungul reperului), viteza de la care a început, cât a depășit limita față de celălalt tur, și un sfat. Sfatul urmează din fel și din ce s-a măsurat:

| Eveniment | Sfat |
|---|---|
| blocare, doar la față | o față blocată nu poate direcționa: mai puțină presiune la începutul zonei, lasă-o să scadă în viraj |
| blocare, doar la spate | un spate blocat lasă mașina să se rotească: frânează mai mult în linie dreaptă, slăbește la intrarea în viraj; mută echilibrul de frânare spre față dacă se repetă |
| blocare, pe neasfaltat | o roată blocată sapă: strânge până aproape de blocare |
| blocare, altfel | prea mult pedală pentru aderența de moment: strânge mai treptat |
| patinare | dă accelerația pe măsură ce volanul se desface; schimbă devreme unde tracțiunea e limitată (pe neasfaltat: o treaptă mai sus înmoaie cuplul) |
| învârtire / supravirare | după pedală: sub frânare (frânare în viraj prea tare, o reducere prea devreme), ridicat (supravirare la ridicare: ține o accelerație constantă), pe accelerație (prea mult cât încă e întors), nimic (intrat prea repede în viraj); „prins cu contrabraj” când s-a dat contravolan; pe neasfaltat sau în raliu, „un unghi este drumul rapid – cel al celuilalt tur a fost destul” |
| subvirare | mai mult volan nu face nimic odată ce fața a plecat: intră mai încet, trage puțin frâna ca să încarci fața, desfă volanul; pe neasfaltat, întoarce mașina cu o ridicare sau cu o apăsare ușoară cu piciorul stâng |
| lovitură / prăbușire | pe lateral: un metru de marjă costă mai puțin decât zgârietura; din spate: altă mașină sau alunecare înapoi; o prăbușire frontală: frânează mai devreme; o bătaie în față: ai atins ceva. „X a lovit și el acolo.” când este partajată |

În Trackmania, o alunecare mai spune și: sub aproximativ **400 km/h** (**300** pe neasfaltat: pământ, iarbă, plastic) o alunecare dă mai puțină tracțiune decât aderența; peste, o alunecare de viteză la unghiul potrivit câștigă, iar aceasta a costat timp, deci unghiul ei a fost greșit.

## Ce permite fiecare sursă {#what-each-source-allows}

| Turele conțin | Blocări / patinare | Supravirare / învârtire | Subvirare |
|---|---|---|---|
| alunecarea și unghiul de alunecare pe roată, viteza mașinii (Forza Data Out, jocurile AC) | din alunecare | din unghiul de derapaj sau din unghiul de alunecare la spate | din unghiurile de alunecare |
| vitezele roților, viteza în lume (jocurile de raliu, BeamNG) | din alunecarea derivată | din unghiul de derapaj derivat | din direcția pe curbură |
| girație și viteză de girație, fără alunecare (iRacing) | - | din unghiul de derapaj (girația potrivită față de direcția de mers); din viteza de atitudine cu contravolan doar când girația nu poate fi crezută | din direcția pe curbură |
| doar direcție | - | din direcție față de mers | din direcția pe curbură |
| un singur fișier de tur FH Companion (fără girație, fără alunecare) | - | - | din direcția pe curbură (are direcție și accelerații) |

Loviturile și prăbușirile au nevoie doar de viteză (mai bine cu accelerații), așa că fiecare sursă le are. Secțiunea **Controlul mașinii** arată ce permite fiecare sursă: cu un singur fișier de tur FH Companion, derapajele sale din direcție și loviturile sale, plus indiciul de a încărca `.tele.gz` pentru rest.
