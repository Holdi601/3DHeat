---
title: "Profilurile mașinilor și compararea"
parent: "Analiză de cursă"
nav_order: 56
lang: "ro"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profilurile mașinilor și compararea lor

O mașină poate frâna, întoarce și accelera doar atât de tare. Vizualizatorul măsoară cât de tare din turele tale, deci nu îți spune niciodată să faci ceva ce mașina ta nu poate face. Asta explică și cât din secunda pierdută a fost vina mașinii și cât a fost a ta.

![Mașini comparate: două mașini una lângă alta, cu aderența, frânarea și tracțiunea lor](../assets/img/en/race-cars-compared.webp)

Analiza îi spune unui tur să frâneze mai tare, să ducă mai multă viteză sau să accelereze mai devreme doar acolo unde mașina lui a arătat că poate, și scoate dintr-o pierdere ce explică mașinile înseși. Așa că limitele fiecărei mașini (*anvelopa* ei, mai jos) și caracterul ei (*profilul*) sunt măsurate din fiecare tur încărcat al ei. Pagina aceasta acoperă anvelopa, profilul, secțiunea **Mașini comparate** și ce decid mașinile în fiecare viraj.

**O mașină** = turele cu același număr de mașină (sau același nume, fără număr) și același indice de performanță: o altă reglare este o altă mașină.

## Anvelopa: ce poate face mașina la fiecare viteză {#the-envelope-what-the-car-can-do-at-each-speed}

Pe mașină, peste fiecare tur încărcat al ei, în **intervale de viteză de 5 m/s** (24 de intervale, până la 120 m/s). Eșantioanele din aer, stabilizarea timp de 0,3 s după o aterizare și din 0,1 s înainte de fiecare lovitură până la 1 s după ea sunt lăsate afară, iar accelerațiile de 80 m/s² sau mai mult sunt ignorate (peste ce ține orice mașină cu forță de apăsare).

| Anvelopă | Eșantioane | Valoarea pe interval | Are nevoie de |
|---|---|---|---|
| **aderența laterală** | accelerația laterală **ținută o jumătate de secundă** (media valorii ei absolute peste o fereastră centrată de 0,5 s), doar acolo unde mașina lua o curbă: cel puțin o treime din percentila 99 a tuturor | percentila 95 | 6 eșantioane |
| **frânarea** | frână > 0,3; accelerația longitudinală ca mediană a fiecărui eșantion și a celor două vecine | percentila 95 a decelerației | 4 eșantioane |
| **tracțiunea la accelerație plină** | accelerație > 0,95, frână sub 0,05; aceeași mediană-din-trei | percentila 90 | 4 eșantioane |

De ce ținută o jumătate de secundă: un bordură, o alunecare care se întoarce brusc, o mașină prinsă – toate fac accelerația laterală să sară o clipă, iar o mașină care face asta des părea mai aderentă decât este. De ce mediana-din-trei: la o distanță de cinci metri între eșantioane, un eșantion este un drum lung, iar un vârf dintr-un singur eșantion este o bordură, o denivelare sau un zid.

Citirea anvelopei la o viteză interpolează între centrele intervalelor și ia intervalul cel mai apropiat cu date acolo unde un interval este gol.

**Despre două feluri de teren.** Când turele unei mașini au parcurs o cincime sau mai mult din eșantioanele lor pe asfalt și pe neasfaltat, se păstrează o anvelopă separată pentru fiecare, iar fiecare viraj este judecat cu terenul de sub mașină în punctul ei cel mai lent.

**Punctul de trecere.** Viteza de la care tracțiunea scade ca `1/v` (limitată de putere) în loc să rămână plată (limitată de tracțiune): primul interval al cărui `a·v` este la 15% din cel mai mare `a·v` văzut.

## Profilul: ce fel de mașină este {#the-profile-what-kind-of-car-it-is}

`profile`, din aceleași ture (eșantioane pe sol, nelovite, mai repede de 8 m/s):

| Măsură | Cum |
|---|---|
| **aderența ținută** (m/s²) | percentila 95 a accelerației laterale ținute o jumătate de secundă |
| **tracțiunea** până la 50 km/h, 50–120, 120–200, peste 200 (m/s²) | media tracțiunii la accelerație plină din anvelopă peste 3–14, 14–33, 33–56 și 56–90 m/s, la vitezele atinse de mașină (până la cea mai mare viteză + 2 m/s), din cel puțin trei pași de 1 m/s; și cea mai mare arătată, și unde |
| **frânarea** (m/s²) | frânarea anvelopei, medie între 60 și 160 km/h (16,7–44,4 m/s), banda numită de comparație |
| **cea mai rapidă** | cea mai mare viteză atinsă |
| **a atins plafonul la** | unde a încetat să mai câștige la accelerație plină pe o linie dreaptă (mai jos) |
| **încă trage la viteza maximă** | tracțiunea anvelopei la viteza ei maximă: cât mai avea de mers |
| **spatele prins, pe tur** | de câte ori pe tur a alunecat și a trebuit prins (mai jos) |
| **partea la accelerație** | din acestea, partea care a început cu accelerație > 0,5 și fără frână |
| **renunță la** | mediana accelerației laterale ținute cu 0,15 s înainte ca fiecare alunecare să înceapă, ca parte din aderență |
| **peste 10° de derapaj, la viraj strâns** | din eșantioanele care luau o curbă la 60% sau mai mult din aderență, partea care aluneca (10° pe asfalt, 20° pe neasfaltat); are nevoie de 30 de eșantioane |
| **derapajul mediu** | peste aceleași eșantioane |
| **echilibrul** | unghiul de alunecare față și spate (multipli ai vârfului nominal) când ia curba tare și nu alunecă, media a cel puțin 30 de eșantioane: + împinge în afară |
| **suprafața** | peste 80% eșantioane neasfaltate: neasfaltat; sub 20%: asfalt; altfel mixt |

**Atingerea plafonului.** Un eșantion contează când secunda din jurul lui (±0,5 s, cu cel puțin 0,9 s de date) a fost toată la accelerație plină (> 0,95, fără frână), pe sol, condus **drept** (|lateral| sub cel mai mare dintre 4 m/s² și un sfert din aderența ei), câștigând sub **0,35 m/s²**, mai repede de 25 m/s și în 90% din cea mai mare viteză a turului – accelerația plină în sus pe un deal sau printr-o curbă lungă oprește și ea câștigul, mult sub viteza maximă a mașinii. Cu cel puțin **o secundă** de astfel de platou peste toate turele, mediana acelor viteze este locul unde atinge plafonul. Altfel nu există viteză maximă: unde nicio linie dreaptă nu a fost destul de lungă, *încă trage la viteza maximă* spune cât era de departe. Nicio presupunere peste ce arată turele – raportul de transmisie și limitatorul încheie tracțiunea unei mașini cu mult înainte ca rezistența aerului s-o facă.

**Pierderea spatelui.** Numărată acolo unde șoferul a trebuit să-l prindă: luând o curbă la 60% sau mai mult din aderență, alunecând (derapaj peste 10° pe asfalt, 20° pe neasfaltat), cu direcția (peste 0,06) întoarsă **împotriva** virajului. Care semn al direcției se potrivește cu care semn al forței din curbă se măsoară pentru fiecare tur (eșantioane care virează fără să alunece). O alunecare se numără o singură dată până când mașina nu mai alunecă. O mașină condusă puțin lateral intenționat nu pierde nimic; una care are nevoie de contravolan, da. Numărată la fel pentru fiecare mașină, ca două mașini să poată fi comparate. Are nevoie de direcție și de un unghi de derapaj.

## Mașini comparate {#cars-compared}

Secțiunea din bara laterală este **Mașina** cu o singură mașină, **Mașini comparate** cu mai multe.

**Tabelul**: o coloană pentru fiecare mașină, un rând pentru fiecare măsură pentru care vreo mașină are o valoare: Aderența ținută; Tracțiunea până la 50 km/h, 50–120, 120–200, peste 200; Frânarea; Cea mai rapidă; Atins plafonul la („încă trage” unde nu l-a atins niciodată); Încă trage la viteza maximă; Spatele prins, pe tur; Peste 10° de derapaj, la viraj strâns. Unde mașinile diferă cu mai mult de 3%, valoarea mai bună este marcată (mai mare pentru aderență, tracțiune, frânare, viteze; mai mică pentru alunecările spatelui).

**O singură mașină**: propoziții despre ce arată turele că este – aderența pe care o ține (m/s² și g), tracțiunea ei în fiecare bandă, unde a încetat să mai câștige pe liniile lungi (sau că nu a atins niciodată plafonul și ce mai trăgea la viteza maximă), și cât de des a trebuit prins spatele („aproape niciodată” sub o dată pe tur, „mai ales la accelerație” când 60% sau mai mult au început acolo).

**Două mașini**: pentru fiecare pereche, câte o propoziție despre ce este o mașină față de cealaltă („X accelerează mai bine, dar nu poate întoarce la fel de tare, are nevoie de mai mult timp ca să oprească și pierde spatele mai ușor”), tabelul, fiecare diferență clară, cea mai mare întâi, apoi **Cum se conduce fiecare**. Cu mai mult de **3** perechi, se arată o singură pereche: mașina turului aflat în focus față de o mașină aleasă dintr-o listă derulantă (implicit mașina celui mai bun tur din clasa lui, altfel a referinței, altfel prima altă mașină).

O diferență se spune doar când turele o arată clar:

| Diferență | Spusă de la | Propoziție |
|---|---|---|
| aderență | **4%** | „X ține N% mai multă aderență în curbe … asta înseamnă M% mai multă viteză prin mijlocul fiecărei curbe” (viteza = √ al raportului de aderență) |
| tracțiune | **5%**, în prima bandă pe care o au ambele mașini, din 120–200, 50–120, peste 200 km/h | „X accelerează cu N% mai tare de la 120 la 200 km/h”; și din loc, sau „deși Y pornește mai tare de pe loc”, când pornirea diferă cu 8% |
| viteză maximă | **4 km/h** | „X atinge o viteză mai mare: a încetat să câștige la …” |
| viteză maximă, doar una | o mașină a atins plafonul, cealaltă nu | „Y a rămas fără tracțiune la …; X încă câștiga când a frânat” |
| viteză maximă, niciuna | niciuna nu a atins plafonul | ce câștiga fiecare încă la viteza lui maximă |
| frânare | **5%** | „X oprește cu N% mai tare … Y trebuie să frâneze mai devreme” |
| pierderea spatelui | cel puțin o dată pe tur mai mult **și** de o dată și jumătate mai des | „X pierde spatele mai ușor: a alunecat destul cât să aibă nevoie de contravolan de N ori pe tur, față de M …” – mai ales la accelerație (60% sau mai mult) sau mai ales intrând în viraj și cu ridicarea (30% sau mai puțin), de la aproximativ P% din aderența ei; pe neasfaltat „o parte din asta ține de felul în care e întoarsă mașina; prinderea nu” |
| pe lateral | **12 puncte procentuale** de viraj tare peste pragul de derapaj | „X merge mai mult pe lateral la limită” |
| echilibru în față | **0,3** din vârful nominal | „X împinge mai mult în față … Vrea să fie încetinită și întoarsă înainte de apex” |

Trăsăturile din rezumat: *ține mai multă aderență* / *nu poate întoarce la fel de tare*, *accelerează mai bine* / *trage mai puțin*, *atinge o viteză mai mare* / *atinge una mai mică*, *încă trage la capătul liniilor drepte* / *rămâne fără tracțiune*, *oprește mai tare* / *are nevoie de mai mult timp ca să oprească*, *este mai stabilă* / *pierde spatele mai ușor* (*este mult mai alunecoasă …* la de două ori mai des plus unu; *are nevoie de prins mai des* pe neasfaltat), *împinge în față*. „Puțin de deosebit de Y pe aceste ture” când nu există nimic.

**Cum se conduce fiecare:**

- o mașină ține mai multă aderență, cealaltă trage mai mult: păstrează viteza prin mijlocul curbei pe o linie largă și rotundă (forma „U”) la mașina cu aderență; frânează drept, rotește-o într-un mijloc scurt și strâns și îndreaptă la ieșire (forma „V”) la cea puternică;
- o mașină este mai slabă la amândouă: turul ei cel mai bun este cel mai curat – frânare dreaptă, raza cea mai largă, accelerație plină cât mai devreme pe care o ține;
- o mașină care pierde spatele mai ușor: dă accelerația doar pe măsură ce volanul se desface și schimbă scurt (alunecări la accelerație), sau eliberează frâna ușor și menține o accelerație constantă prin mijloc (alunecări la intrare).

Hint-ul de sub secțiune repetă cum se măsoară fiecare.

## Ce decid mașinile într-un viraj {#what-the-cars-decide-in-a-corner}

Când turele sunt în mașini diferite, fiecare constatare despre un viraj pierdut se termină cu **Mașinile:** – ce din el decid mașinile și cum să profiți cel mai mult de aceasta (`carNote`):

- **Prin mijloc**, când această mașină ține sub 96% din aderența celeilalte, cealaltă era cu peste 0,5 m/s mai rapidă în punctul cel mai lent, iar acest tur nu a fost mult sub ce explică aderența lui (peste 70% din ea): pe linia celeilalte mașini, aderența acestei mașini permite `v_altă · √(aderență_mea / aderență_altă)`. Dacă turul a dus atât (la 1 m/s), diferența este mașina, și niciun punct de frânare nu o schimbă; dacă a dus mai puțin, cât mai este de câștigat. Apoi, unde poate fi câștigat timpul în schimb: pe o linie dreaptă, între două, sau la o mașină care trage cu 5% mai tare – după apex (frânare dreaptă, intrare mai târziu în curbă, îndreptat devreme spre ieșire); altfel cea mai largă rază pe care o permite drumul.
- **Un spate care a cedat aici** (o alunecare sau o învârtire nepartajată, sau un derapaj peste pragul de alunecare la intrare), la o mașină care îl pierde cel puțin o dată pe tur în plus și de o dată și jumătate mai des: ce să faci la această mașină – accelerația dată pe măsură ce volanul se desface (alunecările ei încep la putere în 60% sau mai mult din timp) sau frâna eliberată ușor fără ridicare.
- **Linia dreaptă de după**: când tracțiunea mașinilor explica 0,03 s sau mai mult, tracțiunea mai puternică a celeilalte mașini de la aceeași viteză, cu tracțiunea ambelor mașini de la 120 la 200 km/h.
- **Viteza maximă**: când acest tur a atins 98% din locul unde mașina lui atinge plafonul pe o linie dreaptă de peste 150 m, iar celălalt a mers cu 1,5 m/s mai repede: aceasta este viteza maximă a mașinii, iar fiecare km/h în plus la ieșirea din viraj ajută în continuare până o atinge.
- **Frânarea**: când cealaltă mașină frânează cu 5% mai tare, iar acest tur a frânat cu peste 5 m mai devreme, că o parte din frânarea mai devreme este a mașinii.

Partea mașinii este scoasă și din timpul propriu-zis – vezi [partea mașinii](race-corner-analysis.md#the-cars-share) – iar un viraj în care mașina explică 60% sau mai mult este pus pe seama mașinii.

## Pentru dezvoltatori {#for-developers}

Cod: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` în [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` în [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
