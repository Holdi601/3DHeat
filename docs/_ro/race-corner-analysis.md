---
title: "Analiza curbă cu curbă"
parent: "Analiză de cursă"
nav_order: 55
lang: "ro"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiza curbă cu curbă

Două ture ale aceluiași traseu se compară curbă cu curbă. Pentru fiecare curbă vizualizatorul arată cine a fost mai rapid, cât timp a valorat și de ce - a frânat prea devreme, a pus puterea târziu, a luat o traiectorie mai largă - ca să știți ce să exersați mai întâi.

![O constatare deschisă în Unde se poate câștiga timp, lângă tabelul Viraj cu viraj](../assets/img/en/race-corner-finding.webp)

Un exemplu rezolvat: în curba 3, Pilotul A frânează cu 20 m mai devreme decât Pilotul B și pierde 0,15 s până ajunge acolo, dar pune acceleratorul mai devreme și câștigă 0,15 s la ieșire. Net 0,00 s: curba este la egalitate, iar nimeni nu este sfătuit să frâneze mai târziu.

## Ce vedeți {#what-you-see}

### Unde se poate câștiga timp {#where-to-improve}

Secțiunea din bara laterală pentru tura aleasă („Încărcați cel puțin două ture ale unui traseu.” până atunci).

**Antetul:** „<tură> <timp> față de <referință> <timp>” și diferența de timp pe tură - sau, pentru referință, „față de cel mai rapid alt tur prin fiecare viraj (…)” și totalul pierdut. Lângă el, pierderea împărțită în *conducere* și *mașină / context*.

**Bara de defalcare:** timpul pierdut pe grup de cauze (frânare, intrare, ieșire, linie dreaptă, mașină, context), în culorile cauzelor, cu legendă.

**Constatările**, trei liste:

1. Pierderi de conducere, cele mai costisitoare primele, cel mult **12** - sau „Nicăieri unde conducerea diferită ar câștiga timp nu iese în evidență.”
2. **Arată ce a costat mașina sau situația (X s)** - pierderi ale mașinii și ale contextului, cel mult 8 (activat implicit).
3. **Unde <tură> este mai rapidă sau la egalitate în alt fel (N)** - câștiguri și curbe la egalitate, cel mult 10 (activat implicit).

Fiecare constatare arată rangul ei, titlul (curba și ce s-a întâmplat, cu costul pentru o pierdere), linia verdictului, costul (câștigurile cu minus) cu o bară și o etichetă: *frânare*, *intrare*, *ieșire*, *linie dreaptă* (pierderi de conducere, cu „· mașină X” când mașina explică 0,02 s sau mai mult), *mașină*, *context*, *mai rapid*, *la egalitate*. **Dați clic pe una** ca să aliniați mașinile cu 40 m înainte, să o încadrați și să o redați, și să deschideți măsurătorile ei:

- **Frânarea:** unde a frânat fiecare (sau a ridicat piciorul) și de la ce viteză, și cu câți metri mai devreme sau mai târziu (de la 5 m);
- **Cel mai lent:** viteza minimă a fiecărei ture și unde;
- **Accelerația completă:** unde a fost fiecare cu accelerația completă și cu cât mai devreme sau mai târziu;
- **Traiectoria:** diferența la intrarea în curbă, cele mai strânse raze, cât de mult pe interior sau pe exterior și forma traiectoriei fiecărei ture și apexul ei;
- **Linia dreaptă până la următoarea curbă:** lungimea ei, ambele viteze acolo unde amândouă erau la accelerație completă, ce a pierdut sau a câștigat și din ce - viteza de start, tracțiunea mai puternică a celeilalte, o ridicare, viteza pierdută prin frânare, cum a fost condusă (părțile de la 0,02 s);
- **Mașina:** cât din pierdere ține de mașină și din ce (tracțiune, aderență, frâne; când sunt 0,02 s sau mai mult);

apoi sfatul, **Mașinile:** (în mașini diferite, vezi [Profiluri de mașini](race-car-profiles.md#what-the-cars-decide-in-a-corner)), și sfatul despre traiectorie.

### Viraj cu viraj {#corner-by-corner}

Un tabel (cu două sau mai multe ture), câte un rând pentru fiecare segment, pentru clasa turei alese când există mai multe clase:

| Coloană | Arată |
|---|---|
| Viraj | `T3`, `T11-T12` |
| Cel mai rapid | tura cea mai rapidă prin el (timpul ei propriu de la începutul la sfârșitul segmentului) |
| cu cât | avansul ei față de al doilea cel mai rapid, în s |
| traiectorie | forma și apexul celei mai rapide ture („V · târziu”, „U/V · la mijloc”); la trecerea cu mouse-ul, razele cele mai strânse, de intrare și de ieșire; „în ambele sensuri” pentru un complex mixt |
| (tura aleasă) | cât de mult a rămas în urma celei mai rapide, sau ✓ când a fost cea mai rapidă |

Un clic pe un rând deschide acolo constatarea turei alese (sau aliniază mașinile cu 40 m înainte de segment). Sub tabel, când fiecare curbă are un timp: „Cei mai rapizi prin fiecare viraj, puși cap la cap: <timp> (± față de referință / față de cel mai bun din clasa X)” - cele mai bune segmente plus cea mai rapidă parcurgere până la prima curbă, când aceasta este un tronson propriu.

## Cum se calculează {#how-it-is-worked-out}

Regula de bază: **o curbă se judecă întreagă**, de la zona de frânare de la intrarea ei până la zona de frânare a următoarei. O tură care frânează mai devreme ca să întoarcă mașina și să pună puterea mai repede este creditată cu ieșirea pe care a cumpărat-o, nu i se spune să frâneze mai târziu.

## O axă a distanței {#one-distance-axis}

Turele se compară după distanță, nu după timp - în urmă cu o secundă, două ture se află la curbe diferite. Nici după propriul odometru al fiecărei ture (o traiectorie mai strânsă acoperă mai puțini metri). Traseul parcurs al turei **de referință** este axa:

- Fiecare eșantion al celorlalte ture este **proiectat** pe traseul de referință: fiecare eșantion primește `s`, cât de departe este pe referință, și `d`, cât de departe este la stânga (pozitiv) sau la dreapta. Căutarea merge înainte de la potrivirea anterioară (de la 8 segmente de traseu în urmă până la 40 înainte), astfel încât o tură care se intersectează cu ea însăși nu sare niciodată la cealaltă intersecție. Primul eșantion se caută în primul sfert al traseului (pe un circuit, start și sosire coincid); când nimic nu este la mai puțin de 30 m, se ia cel mai apropiat punct oriunde care nu este în urma ultimei potriviri (după o învârtire sau o ieșire de pe traseu). `s` nu scade niciodată: un eșantion care se proiectează în urma celui dinainte este menținut.
- Fiecare canal este **reeșantionat** pe o singură grilă, **la fiecare 2 m**, liniar; canalele în trepte (treapta, steagurile) prin eșantionul cel mai apropiat. În afara intervalului propriu al unei ture, valorile sunt goale.
- Primele și ultimele eșantioane ale unei ture se proiectează puțin înăuntrul capetelor referinței, așa că fiecare tură este **dusă până la 15 m** dincolo de capetele ei, la viteza pe care o avea (timpul crește cu distanța împărțită la viteză, restul rămâne) - astfel încât delta ei la linia de sosire este diferența ei de timp pe tură.
- `delta` = timpul turei în fiecare punct al grilei minus cel al referinței: diferența. `lateral` = `d` pe grilă.

Timpul în plus pe care l-a luat o tură față de alta între două puncte ale grilei este diferența deltelor lor: `rel(s)`. Tot ce urmează se construiește pe ea.

## Curbele {#corners}

Găsite pe **referință** (`findCorners`), cu viteza ei netezită pe ±6 m și cu curbura ei (schimbarea direcției pe ±5 eșantioane, netezită pe ±10 m):

1. **Minime de viteză cu proeminență.** Un punct care este cel mai jos pe ±40 m, a cărui scădere față de viteza cea mai mare de pe fiecare parte (înainte de un minim mai jos) este de cel puțin `max(2,5 m/s, 6% din viteză)`.
2. **Cotituri.** Un vârf local de curbură mai strânsă decât o rază de **300 m**, fără un minim de viteză la mai puțin de 80 m: o cotitură luată cu accelerația completă este tot o curbă de condus.
3. **Faze.** De la fiecare apex înapoi, cât timp referința frânează (> 0,1) sau nu are accelerația completă (< 0,95): intrarea; înainte, cât timp nu are accelerația completă: ieșirea. O cotitură luată plat primește ±30 m. Curbele care se suprapun sunt păstrate separate, dar așezate astfel încât să acopere turul.
4. Numerotate T1, T2 … în ordinea turului; **stânga sau dreapta** după semnul curburii și după faptul dacă lumea este oglindită (necunoscut înseamnă oglindit).

**Fereastra curbei** (unde virează referința): în afară, de la punctul cel mai strâns aflat la ±40 m de apex, cât timp curbura rămâne peste o șesime din vârful ei, plus 10 m de fiecare parte. Partea ei dă semnul lui „interior”.

## Segmente: de la zona de frânare la zona de frânare {#segments-braking-zone-to-braking-zone}

Fiecare curbă are drumul până la jumătatea distanței față de apexurile de pe ambele părți. În el:

- **Punctul cel mai lent al fiecărei ture** este o adevărată scădere a vitezei - nimic mai lent la 6 m (3 puncte ale grilei) pe fiecare parte, privind dincolo de capetele tronsonului, astfel încât ieșirea din curba dinainte, încă accelerată, să nu fie niciodată confundată cu el - căutat de la 15 m înainte de fereastra curbei până la 10 m după ea. O tură care nu a încetinit deloc acolo este pusă la apex.
- **De unde a început o tură să încetinească** (`entryOf`): înapoi de la punctul ei cel mai lent, prin frânare sau ridicare, peste scurte reveniri ale accelerației complete, până a avut piciorul jos (accelerator ≥ 0,95, frână ≤ 0,1) timp de **10 m**; o accelerație reluată în ultimii **30 m** înainte de punctul cel mai lent încă aparține curbei; cu accelerația completă tot drumul, chiar punctul cel mai lent. O tură fără canal de accelerator, sau care nu a avut niciodată piciorul jos de la curba dinainte, începe în punctul ei cel mai rapid dintre cele două.
- **Segmentul începe** la primul dintre toate turele care au început să încetinească pentru el (cu 4 m mai devreme) și merge până la începutul celui următor, astfel încât frânarea fiecărei ture să fie înăuntrul lui, iar segmentele acoperă turul.

**Complexe.** Curbe consecutive între care referința nu merge niciodată cu accelerația completă - mai puțin de **40 m** cu accelerația completă - formează un singur segment, „T11-T12”, parcurs ca unul; un complex are cel mult **trei** curbe (o secțiune sinuoasă parcursă fără să fie vreodată plată începe unul nou). Un complex care virează în ambele sensuri este *mixt*: pentru el nu se măsoară nicio formă de traiectorie.

**Pe un circuit** (referința se termină la cel mult 50 m de unde a început), drumul de pe ultimul segment al liniei drepte trece peste linia de sosire până la primul punct de frânare: drumul unui tur lansat de pe linie se numără cu ultima curbă. O tură care a început din repaus sau de la o pornire de cursă (vezi [Startul](#the-start)) își păstrează drumul separat.

### Ce urmează după o curbă {#what-a-corner-leads-onto}

Măsurat pe referință: metri cu accelerația completă după curbă (de la accelerația ei completă până la sfârșitul segmentului, plus drumul peste linia de sosire) și înainte de ea (partea „după” a segmentului anterior, sau de la start).

| Tip | Regula |
|---|---|
| **între două linii drepte** (`both`) | 200 m sau mai mult înainte **și** 120 m sau mai mult după |
| **spre o linie dreaptă** | 200 m sau mai mult după, sau 120 m sau mai mult după și cel puțin atât cât înainte |
| **după o linie dreaptă** | 200 m sau mai mult înainte |
| **legătură** | orice altceva |

## Ce a făcut fiecare tură într-o curbă {#what-each-lap-did-in-a-corner}

`cornerMetrics`, pe tură și segment, pe grilă (pas de 2 m). Pedalele: frânarea se numără peste 0,1, accelerația completă este 0,95 și peste.

| Măsură | Regula |
|---|---|
| **punctul de frânare** | prima frânare sub care a fost ridicat acceleratorul (sub 0,5), sau care a durat **15 m** - o atingere a frânei cu piciorul stâng cu puterea pusă nu este locul unde a început frânarea; când sunt doar atingeri, prima atingere |
| **ridicare** | fără frânare, primul punct în care acceleratorul a coborât sub 0,8 |
| (fără pedale) | punctul în care tura a început să încetinească (mai sus) |
| **eliberarea frânei** | ultima frânare până la 30 m după punctul cel mai lent |
| **viteza la punctul de frânare**, **metri de frânare** | până la punctul cel mai lent |
| **frânarea maximă**, **decelerarea maximă** | peste zona de frânare (accelerațiile peste 45 m/s² se ignoră) |
| **frânare cu derapaj controlat** | metri cu frână peste 0,05 și |direcție| peste 0,1 |
| **alunecarea la blocare** | cel mai negativ raport de alunecare al roții din zonă (când tura are date de alunecare) |
| **punctul cel mai lent**, **viteza minimă** | ca mai sus |
| **accelerator pornit** | după eliberare (sau punctul cel mai lent), prima accelerație peste 0,15 fără frână |
| **accelerația completă** | primul punct după aceasta, menținut la cel puțin 0,95 timp de 10 m |
| **rulare liberă** | metri de la eliberare până la accelerator pornit, cu frâna și acceleratorul ambele sub 0,05 |
| **scăderi ale acceleratorului** | de câte ori acceleratorul a scăzut cu mai mult de 0,25 sub vârful lui curent între accelerator pornit și accelerația completă |
| **accelerație laterală maximă** | cea mai mare accelerație laterală, de la 20 m înainte de eliberare până la mai târziu dintre accelerația completă și 20 m după punctul cel mai lent |
| **treapta la apex** | la punctul cel mai lent |
| **alunecarea la rotire** | cea mai mare alunecare a roților motoare între accelerator pornit și accelerația completă |
| **echilibru** | unghiul de derapaj al fațelor minus al spatelui prin mijloc (+ subvirare) |
| **linie dreaptă cu accelerație completă** | partea din segment după accelerația completă (și drumul peste linia de sosire) la ≥ 0,95; cea mai lungă ridicare de pe ea |
| **viteză pierdută prin frânare** | cea mai mare viteză pierdută de la un vârf, cu accelerator ≥ 0,9, fără frână, pe sol |
| **derapaj la intrare** | cel mai mare unghi de derapaj de la punctul de frânare până la 5 m după punctul cel mai lent, pe sol |
| **frâna de mână** | unde a fost trasă (> 0,2), până la 10 m după punctul cel mai lent |
| **aer** | secunde în aer pe segment și cel mai lung zbor al său |

## Cu cine este comparată fiecare tură {#who-each-lap-is-compared-with}

- O tură este comparată cu **cea mai rapidă tură completă din propria ei clasă de performanță** (referința, în clasa referinței).
- Tura cea mai bună a clasei (și referința) este comparată, segment cu segment, cu **oricare altă tură din clasa ei care a fost cea mai rapidă** prin el - sau cu oricare tură, când este singură în clasă.

Harta timpului, diferențele din lista de ture, evenimentele de control al mașinii și tabelul curbelor urmează aceeași comparație.

## Contul de timp al unei curbe {#the-time-account-of-a-corner}

`compareCorner`, pentru o tură față de alta pe un segment:

- **net** = `rel(end) - rel(start)` (plus drumul peste linia de sosire, la o tură lansată): verdictul. Mai aproape de **0,03 s** înseamnă **la egalitate**.
- **Împărțirea** - unde în interiorul curbei a condus turul: pe porțiunea de la primul punct de frânare sau punctul cel mai lent al oricăruia dintre cele două ture până la mai târziu dintre accelerația completă și punctul cel mai lent al lor, cea mai mare schimbare pe care tura a dat-o sau a recuperat-o după aceea, când schimbarea depășește **0,04 s**; altfel mai târziul dintre cele două puncte cele mai lente.
- **Până la apex** = `rel(split) - rel(start)`; **după** = netul minus aceasta. Când amândouă sunt de cel puțin 0,04 s și de semne opuse, tura a **făcut schimb** - una în loc de alta.
- **După apex** se împarte din nou acolo unde ambele ture sunt cu accelerația completă: **ieșirea** (împărțirea până la accelerația completă mai târzie) și **linia dreaptă** (de acolo până la sfârșit).
- **Linia dreaptă** se împarte în trei:
  - *viteza de ieșire* (`byExit`) - măsurată, nu modelată: mașina mai lentă trece prin viteza de start a celei mai rapide puțin mai departe pe linia dreaptă, iar de acolo traseul ei propriu este ce ar fi făcut de la acea viteză, cu propriul raport de transmisie, rezistența aerului și panta în el. Mutat înapoi la acel punct (și rulat la viteza ei finală pentru metrii pe care îi câștigă) este timpul ei de la start-ul mai rapid; diferența este costul vitezei de ieșire. Când mașina mai lentă nu ajunge niciodată la acea viteză (sau doar în ultimele 2 eșantioane), propria ei accelerație pe porțiune este pusă înapoi ca putere (`a·v` menținut), niciodată mai tare decât arată anvelopa ei la acea viteză (de două ori accelerația măsurată, fără anvelopă).
  - *tracțiunea mașinilor* (`byPower`) - doar în mașini diferite: amândouă mașinile de la aceeași viteză pe aceiași metri, cu accelerația completă, integrând accelerația completă pe care o arată fiecare la fiecare viteză.
  - *cum a fost condusă* (`driven`) - restul: o ridicare, viteză pierdută la accelerație completă.

  Viteza de ieșire nu explică niciodată mai mult decât costul liniei drepte (și niciodată cu semn opus), cu excepția cazului în care o ridicare sau viteza pierdută a luat înapoi ceva. O tură **ridicată** pe linia dreaptă când partea ei la accelerație completă este sub 0,9 și sub cea a celeilalte minus 0,05. Viteza pierdută prin frânare se numără când cele două diferă cu mai mult de 1 m/s. O neconcordanță sub 0,02 s ca semn este pusă la 0.

Netul fiecărui segment se adună la diferența timpului pe tură, iar până la apex și după apex ale fiecărei curbe se adună la netul ei (testele verifică ambele).

### Partea mașinii {#the-cars-share}

Doar când turele sunt în **mașini diferite** și tura a pierdut timp (`carShare`):

- **tracțiunea**: tracțiunea mașinilor pe linia dreaptă (mai sus), până la pierdere;
- **aderența**: când tura a fost la limita mașinii ei (accelerația laterală la mijloc de cel puțin **90%** din ce ține mașina la acea viteză) și cealaltă mașină ține cu peste **5%** mai mult: din viteza minimă mai mică neexplicată de o rază mai strânsă, partea `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)` din pierderea rămasă;
- **frânele**: când tura a frânat (nu a ridicat), cealaltă mașină frânează cu peste **5%** mai tare, iar decelerarea *medie* a turei peste zonă a fost cel puțin **80%** din ce poate face mașina ei: de la `u` la `v` cu `a1` față de `a2`, terminând în același punct, `(1/a1 - 1/a2)(u - v)² / 2u`, până la ce a rămas.

Costul mașinii este suma, cel mult egal cu pierderea.

## Verdictul și constatarea {#the-verdict-and-the-finding}

`cornerFinding` scrie cel mult o constatare pentru fiecare tură și curbă, încercate în această ordine:

| Caz | Constatarea | Rezultat |
|---|---|---|
| net în ±0,03 s, un schimb, latura mai mică de cel puțin **0,1 s** | **la egalitate, două feluri de a trece** - cine a intrat lent și a ieșit repede, cine invers; cu o linie dreaptă după ea (spre o linie dreaptă sau între două), calea „intră lent, ieși repede” este cea pe care trebuie construit: păstrați accelerarea ei timpurie, recuperați intrarea frânând mai tare, nu mai târziu | la egalitate |
| net în ±0,03 s în rest | nu se spune nimic | - |
| câștigat, un schimb, pierdut până la apex | **intră lent, ieși repede a dat rezultat**: păstrați-o, aici ieșirea valorează mai mult | câștig |
| câștigat, un schimb, câștigat până la apex | **mai rapid la intrare**: intrarea este corectă, o accelerație completă mai devreme ar păstra mai mult | câștig |
| câștigat, iar cealaltă tură are aici o pierdere | **mai rapid - din cauza a ce a făcut cealaltă**, cauza ei și sfatul ei spuneau „Pentru cealaltă tură: …” | câștig |
| câștigat în alt fel | **mai rapid la intrare / ieșire**, după care jumătate a câștigat mai mult (frânare mai târzie, mai multă viteză prin mijloc; sau accelerație completă mai devreme, tracțiune mai puternică) | câștig |
| pierdut, iar un **impact sau accident** a costat cel puțin `max(0,05 s, 40% din pierdere)` | impactul este povestea curbei, înaintea mașinilor | pierdere |
| pierdut, iar **partea mașinii** este 60% sau mai mult | **mașina**: tracțiunea ei pe linia dreaptă, aderența prin mijloc sau frânele - cea mai mare parte; cu partea pilotului (≥ 0,03 s) spusă ca „Celelalte X s: …” | pierdere |
| pierdut, iar o **greșeală de control al mașinii** nepartajată a costat cel puțin `max(0,05 s, 40%)` | acea greșeală (vezi mai jos), cu cum s-a mișcat timpul în jurul ei | pierdere |
| pierdut, iar un **zbor mai lung** a costat cel puțin `max(0,05 s, 40%)` | zborul | pierdere |
| pierdut, un schimb, câștigat până la apex | **intrare prea rapidă, ieșire lentă**: cauza ieșirii; renunțați la o parte din intrare ca să fiți întoarși și plat mai devreme, cu punctele de frânare și de accelerație completă ale celeilalte ture. Rădăcina ei (`cause`, ce numără [statisticile](race-course-statistics.md)): frânare mai târzie, când a frânat cu câțiva metri mai târziu decât cealaltă; altfel cauza ieșirii | pierdere |
| pierdut, un schimb, pierdut până la apex | **a dat mai mult la intrare decât a recuperat ieșirea**: cauza intrării, care este și rădăcina ei (`cause`); păstrați ieșirea, pierdeți mai puțin la intrare | pierdere |
| pierdut, ridicat pe linia dreaptă, iar partea condusă depășește jumătate din pierdere | **nu cu accelerația completă pe linia dreaptă**: partea ei cu accelerație completă față de a celeilalte, unde și cât de mult a durat ridicarea | pierdere |
| pierdut, tracțiunea mașinilor peste 60% din pierdere și linia dreaptă peste jumătate | **tracțiunea mașinii pe linia dreaptă** (cu tracțiunea ambelor mașini la 160 km/h) | pierdere |
| pierdut în alt fel | cauza jumătății care a pierdut mai mult (până la apex ≥ după el: cea a intrării; altfel cea a ieșirii). Mai lent la ieșire doar pentru că mai lent prin mijloc (cu mai mult de 1 m/s): în locul ei, cauza mijlocului | pierdere |

O constatare la o pierdere se poate încheia și cu **Și:** - viteză pierdută prin frânare cu accelerația completă, sau o ridicare pe linia dreaptă - când partea condusă a liniei drepte a costat mai mult de 0,04 s și aceasta nu era deja cauza.

Constatările sunt sortate: mai întâi pierderile, cele mai costisitoare primele; apoi câștigurile și curbele la egalitate.

### Cauzele la intrare {#causes-on-the-way-in}

`entryCause`, prima care se aplică (diferențele de viteză minimă sunt în m/s; „5 m” este pragul ca un punct mai devreme sau mai târziu să conteze):

| Nr. | Cauza (greșeala) | Regula |
|---|---|---|
| 1 | un impact sau accident la intrare | un impact nepartajat care începe cu cel mult 10 m după punctul cel mai lent |
| 2 | **aproape oprit** (incident) | viteza cea mai mică sub **60%** din ce permite aderența acestei mașini acolo unde a trecut cealaltă (`v_other · √(grip_mine / grip_other)` când cealaltă mașină are mai multă aderență, altfel viteza celeilalte), tura cealaltă peste 8 m/s - o învârtire, un contact sau o curbă ratată |
| 3 | o greșeală de control al mașinii la intrare | o blocare, o împingere, o învârtire sau o alunecare nepartajată, care nu este cu accelerația apăsată, începând cu cel mult 10 m după punctul cel mai lent, cu un cost de cel puțin 0,02 s |
| 4 | un zbor mai lung înainte de punctul cel mai lent | vezi [raliul](#rally-rotation-and-flights) |
| 5 | **ridicat** unde cealaltă a rămas plată sau a ridicat cu 5 m sau mai târziu | această tură doar a ridicat |
| 6 | **frânat unde cealaltă doar a ridicat** sau a rămas plată | și a fost cu mai mult de 0,5 m/s mai lentă prin mijloc |
| 7 | **frânat slab** | a frânat (nu a ridicat), avea loc să frâneze mai tare - cu date despre anvelope, alunecarea ei la blocare sub **60%** din alunecarea la care frânele acestei mașini dau cel mai bine; fără ele, o decelerare maximă sub **85%** din ce arată la acea viteză - pedala sub 0,95, iar decelerarea maximă a celeilalte ture cu peste **15%** mai mare |
| 8 | **frânat devreme** - sau **frânele mașinii** | frânat cu peste 5 m mai devreme decât cealaltă. Într-o altă mașină ale cărei frâne sunt cu peste 5% mai puternice, și cu cel mult 10 m rezervă față de distanța pe care o cere această mașină la propria decelerare: frânele mașinii. Altfel, frânat devreme, cu „Frânați mai târziu - cam N m” (într-o altă mașină, metrii peste cât îi trebuie) |
| 9 | **rulat liber** | peste 10 m fără niciun pedal, și cu 5 m mai mult decât cealaltă |
| 10 | **mai lent prin mijloc** | cu peste 0,5 m/s mai lent în punctul cel mai lent; împărțit prin `v² = a·R` (mai jos) |
| 11 | **a ajuns mai lent** | cu peste 1 m/s mai lent în punctul de frânare, fără frânare devreme: decis mai înainte - de curba dinainte și de tracțiunea mașinii, sau de un zbor în curba dinainte care a fost cu 0,2 s mai lung. Al mașinii, când mașinile diferă |
| 12 | mai lent până la apex | în rest: eliberați frâna mai lin și lăsați mai multă viteză să intre în mijloc |

**Mai lent prin mijloc** (`middleSplit`): raza fiecărei ture în punctul ei cel mai lent este măsurată din propriul ei traseu (±8 m), accelerația ei laterală ca `v²/R`, și

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- Raza explică **jumătate sau mai mult**: **o traiectorie prea strânsă** - „folosiți mai mult din drum”, cu ambele raze și partea.
- La limita mașinii (derapând peste 10° pe asfalt / 20° pe teren neasfaltat, sau accelerația laterală de cel puțin 90% din ce ține la acea viteză) și cealaltă mașină are aderență cu peste 5% mai mare: **aderența mașinii**; protejați ieșirea în schimb.
- Alunecând prin ea (derapaj peste 10° / 20°) și cealaltă tură nu (derapajul ei la intrare cu cel puțin 4° mai mic): **de-a latul** - peste aderența ei, nu sub ea; intrați ceva mai încet. Spus ca al mașinii când această mașină prinde spatele cu cel puțin o dată pe tură mai des decât cealaltă.
- Într-o altă mașină care ține sub **96%** din aderența celeilalte, iar tura a fost ținută în 1 m/s de `v_other · √(grip_mine / grip_other)`: **aderența mașinii** - „frânatul mai târziu nu va închide asta”.
- În rest, **aderență de rezervă**: accelerația laterală față de a celeilalte pe o rază asemănătoare și ce ține această mașină; luați mai multă viteză până la apex. Când spatele acestei mașini cedează înainte ca aderența să fie folosită complet (alunecările încep sub 85% din aderența ei, iar tura era la 80% din ea), căutați restul în pași mici.

### Cauzele la ieșire {#causes-on-the-way-out}

`exitCause`, prima care se aplică:

| Nr. | Cauza (greșeala) | Regula |
|---|---|---|
| 1 | o greșeală de control al mașinii la ieșire | rotire nepartajată, învârtire, alunecare sau impact care se termină la sau după cu 10 m înainte de punctul cel mai lent |
| 2 | **viteză pierdută** | cu mai mult de 1 m/s mai multă viteză pierdută cu accelerația completă decât cealaltă; peste **7 m/s (25 km/h)** „mai degrabă un contact sau o învârtire decât o alunecare” |
| 3 | **a întors mașina greșit** (teren neasfaltat) | vezi [raliul](#rally-rotation-and-flights) |
| 4 | **a pus puterea mai târziu** | accelerator pornit cu mai mult de 5 m mai târziu, numărat și de la propriul punct cel mai lent al fiecărei ture (o tură al cărei punct cel mai lent este mai târziu nu este învinovățită pentru un accelerator mai târziu) |
| 5 | **a ezitat cu acceleratorul** | mai multe scăderi ale acceleratorului decât cealaltă |
| 6 | **a mers mai larg și a așteptat** | cu peste 1,5 m mai în exterior decât cealaltă unde amândouă erau plate, iar accelerația completă cu peste 5 m mai târziu de la propriul punct cel mai lent |
| 7 | **accelerația completă mai târziu** | accelerația completă cu peste 5 m mai târziu, și de la propriul punct cel mai lent; cu accelerația mașinii acolo |
| 8 | **felul în care conduce mașina** | într-o altă mașină care trage sub 95% din cealaltă la acea viteză, iar tracțiunea a explicat o parte din linia dreaptă |
| 9 | **mai lent la ieșirea din curbă** | în rest: un apex mai târziu, deci mașina este dreaptă mai devreme |

Când cele două ture erau în trepte diferite în punctul cel mai lent, sfatul se încheie cu „Treapta N la apex; cealaltă a folosit M.”

### Greșelile de control al mașinii și impacturile {#car-control-faults-and-impacts}

O greșeală din [Evenimente de control al mașinii](race-control-events.md) ca cauză: o blocare este o cauză de *frânare*, învârtirea sau alunecarea cu accelerația apăsată este o cauză de *ieșire*, restul sunt *intrare*; un impact după punctul cel mai lent este *ieșire*, înainte de el *intrare*. Sfatul este cel al evenimentului, apoi „A costat cam X s până la 40 m după el” (sau „până când mașina și-a recăpătat viteza” pentru un impact). O blocare cu un punct de frânare cu mai mult de 5 m mai devreme decât cealaltă adaugă că tura a frânat și devreme - cu roțile care se învârt nu ar fi avut nevoie de asta.

### Raliu: rotirea și zborurile {#rally-rotation-and-flights}

Pe **teren neasfaltat**, cu unghiuri de derapaj pe ambele ture și această tură cu accelerația (sau plată) cu mai mult de 5 m mai târziu:

- **a întors mașina mai puțin**: cealaltă tură a avut mașina întoarsă cu **12°** sau mai mult până la punctul ei cel mai lent și cu cel puțin **8°** mai mult decât această tură. Sfat: o ridicare sau o atingere a frânei cu piciorul stâng la intrarea în curbă, cu punctul de frână de mână al celeilalte ture când numai ea l-a folosit, sau cu frâna de mână într-o curbă mai lentă de 15 m/s (54 km/h).
- **a întors-o prea mult**: această tură a avut-o întoarsă cu 12° sau mai mult și cu cel puțin **12°** mai mult decât cealaltă: trebuia îndreptată înainte ca puterea să poată fi dată.

**Un zbor mai lung**: în aer cu 0,2 s sau mai mult decât cealaltă, costând cel puțin 0,03 s din 10 m înainte de decolare până la 40 m după aterizare (sau sfârșitul segmentului). Înainte de punctul cel mai lent este o cauză de intrare; devine povestea curbei când explică 40% sau mai mult. Sfatul: păstrați acceleratorul apăsat la decolare, luați creasta ceva mai încet sau cu o atingere a frânei.

### Startul {#the-start}

Înainte de prima curbă, pe un sprint sau când una dintre ture a început din repaus (sub 5 m/s când amândouă sunt primele pe axă) sau de la o pornire de cursă (sub 60% din viteza celeilalte), drumul până la primul punct de frânare este propria ei constatare (curba 0) când diferă cu mai mult de 0,03 s: *Lansarea*, *Startul cursei* sau *Până la prima curbă*. O pierdere de acolo se pune pe seama situației (*context*) când o tură a început de la o pornire de cursă și cealaltă cu viteză, pe seama mașinii când turele sunt în mașini diferite, altfel pe seama pilotului. Sfaturi: în altă mașină din repaus, „mai ales mașina”; o pornire din repaus în aceeași mașină, lansare cu mai puțină patinare și schimbare de treaptă în partea de sus a puterii; o pornire de cursă, comparați cu alt prim tur; o pornire lansată, o ieșire mai bună din ultima curbă se duce peste linia de sosire.

## Traiectoria parcursă {#the-driven-line}

`lineMetrics`, pe tură și segment (nu pentru complexele mixte), doar din poziții (netezite ±2 eșantioane), peste fereastra curbei:

| Măsură | Regula |
|---|---|
| curbură | schimbarea direcției pe ±8 m din propriul traseu al turei |
| **raza cea mai strânsă** | 1 / curbura de vârf |
| **începutul virajului** / **ieșirea din viraj** | unde curbura depășește prima dată / ultima dată o cincime din vârful ei |
| **mijlocul** | unde tura s-a întors pe jumătate din schimbarea ei de direcție |
| raza la intrare / ieșire | metri parcurși peste jumătate din schimbarea de direcție, înainte / după mijloc |
| **forma** | raza cea mai strânsă împărțită la raza medie în timpul virajului: sub **0,55** un **V**, peste **0,75** un **U**, între „U/V” |
| **apexul** | raza de ieșire împărțită la raza de intrare: peste **1,25** târziu, sub **0,8** devreme, altfel la mijloc |
| **apexul de viteză** | punctul cel mai lent cu mai mult de **15 m** înainte de mijloc: intră lent, ieși repede; cu mai mult de 15 m după: încă încetinește după mijloc |

Față de cealaltă tură: cât de mult pe interior (+) sau pe exterior a mers la începutul virajului, prin partea cea mai strânsă și acolo unde amândouă erau plate (spus de la 1 m); unde a virat fiecare (spus de la 8 m).

### Ce linie se potrivește acestei mașini aici {#which-line-suits-this-car-here}

`lineFor`, din ce urmează curba și din caracterul mașinii în această curbă:

- **putere față de aderență** = accelerația cu accelerația completă a mașinii la viteza de ieșire, împărțită la aderența ei la viteza minimă (din anvelopa ei). **Point and shoot** de la **0,45** în sus; **momentum** la **0,25** și sub.
- **forță aerodinamică**: aderența la 151-252 km/h împărțită la aderența la 54-108 km/h de **1,15** sau mai mult, pentru o curbă luată cu **144 km/h** (40 m/s) sau mai repede - atunci este o curbă de tip momentum, orice ar fi puterea. Nu se judecă pe teren neasfaltat.

| Tipul curbei | Mașina | Linia |
|---|---|---|
| după o linie dreaptă | point and shoot / altă | V / U, apex la mijloc: „zona de frânare este premiul” |
| între două linii drepte | momentum / altă | U / V, apex târziu |
| legătură | momentum / altă | U / V, apex la mijloc: „conduceți-o pentru ieșirea celei următoare” |
| spre o linie dreaptă | momentum (sau o curbă rapidă cu forță aerodinamică) | U larg și rotund, apex ușor târziu |
| spre o linie dreaptă | point and shoot | V: frânare dreaptă, intrare târzie, rotire într-un mijloc scurt și strâns, linie dreaptă devreme |
| spre o linie dreaptă | între cele două | U cu apex târziu: intră lent, ieși repede |

Acolo unde ieșirea contează (spre o linie dreaptă, între două), transmisia adaugă o propoziție: **FWD** - rotiți-o la frână, adăugați putere doar pe măsură ce roata se desface; **RWD** cu o putere-aderență de 0,35 sau mai mult - îndreptați-o înainte de accelerația completă; **AWD** - poate primi putere în timp ce încă virează. Pe teren neasfaltat, fiecare linie adaugă: întoarceți mașina la intrare.

Propoziția spune apoi ce a condus tura și dacă se potrivește: *cel mai lent târziu strânge ieșirea* sau *un apex timpuriu strânge ieșirea* acolo unde era dorit un apex târziu și tura nu a luat apexul târziu și nici nu a fost cea mai lentă devreme; *mai rotund decât vrea mașina aceasta* acolo unde era dorit un V; *mai pătrat decât vrea mașina aceasta* acolo unde era dorit un U; altfel *se potrivește*.

## Pentru dezvoltatori {#for-developers}

Cod: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Raționamentul și sursele lui: [metoda](race-analytics.md).
