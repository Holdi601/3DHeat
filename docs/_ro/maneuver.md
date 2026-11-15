---
title: "Manevre"
parent: "Observații"
nav_order: 4
lang: "ro"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manevre: cum se mișcă grupurile

**Observații → Manevre** urmărește cum se mișcă unitățile fiecărei tabere *ca grupuri* și numește manevrele pe care le fac - un atac pe flanc, un clește, o străpungere, o ambuscadă, o retragere, o apărare împotriva rachetelor, traversarea T - fiecare cu gradul de siguranță, cifrele din spatele ei, dacă a meritat și paralelele ei din doctrină și din istorie. **Analiză de masă → Manevre** le numără peste mii de meciuri: cât de des se face fiecare, pe fiecare hartă, mod și tabără, și cât de des merită.

Totul se calculează în browserul tău, într-un fir de execuție separat (`src/insights/maneuver`); un meci cu câteva sute de unități durează 10-500 ms, un război aerian de două ore cu mii de obiecte aproximativ o secundă.

## Cum se folosește {#using-it}

- Deschide **Observații**, fila **Manevre**. Numără atunci când se deschide prima dată; după ce schimbi filtrele, apasă **Caută din nou**.
- **Sigur / Probabil / Posibil** alege gradul de încredere afișat (implicit Probabil).
- **Cronologia** are o bandă pentru fiecare tabără și o bară pentru fiecare manevră; **lista** de mai jos arată același lucru, după timp. Un clic trece la reluare la începutul manevrei, mută camera acolo și o desenează în 3D: drumul fiecărui grup ca o săgeată (cele două brațe ale unui clește sunt arcele lui), contururile grupurilor în momentul-cheie (al inamicului în culoarea taberei lui) și frontul inamicului ca o linie albă. **Desenează toate în 3D** adaugă celelalte manevre ale meciului, estompate. Liniile ajung la placa grafică o singură dată, când se schimbă selecția, nu la fiecare cadru: cu 480 de manevre desenate în timpul redării, timpii de cadru pe o placă reală (WebGL2 și WebGPU, p99 18,0-18,5 ms, maximum 19,5-20,8 ms) sunt la fel ca fără ele.
- O manevră deschisă arată rezultatul ei (pierderile și doborârile unităților care au făcut-o, cât timp a durat și imediat după, comparate cu schimbul taberei pe tot meciul), dovezile ei și intrările din baza de cunoștințe pentru ea - doctrina și paralelele istorice (Cannae pentru un clește, Sedan 1940 pentru o străpungere, Tsushima pentru traversarea T, Operațiunea Bolo pentru o diversiune...).
- Tabelul mic de la sfârșit: pe fel de manevră și tabără, câte au fost făcute și câte au meritat.

![Un clește pe meciul demonstrativ sintetic: săgețile ambelor brațe, corpul inamicului și frontul lui](../assets/img/en/maneuvers.webp)

## Cum se găsesc grupurile {#how-groups-are-found}

Fiecare unitate este plasată pe o cronologie comună (un pas de 1 s pe jos, 2 s în rest, mai lung pentru fișierele foarte mari), ținută pe loc în timpul unei morți, ca o renaștere să nu tragă o linie peste hartă. La fiecare pas, unitățile unei tabere și ale unui fel (avion, vehicule, nave, infanterie) sunt legate între ele când sunt aproape - 18 m pe jos, 170 m pentru vehicule, 3 km pentru nave, 5 km pentru avioane - și se mișcă la fel (viteze în jurul jumătății din viteza celei mai rapide, sau ambele stau pe loc). Un grup își păstrează id-ul grupului în care erau cei mai mulți membri. O unitate fără clasă este pusă pe jos, în vehicul sau în aer după viteza ei.

**Forma** unui grup se citește față de direcția lui: o coloană sau o linie după cât se întind membrii de-a lungul și de-a latul, o pană când mijlocul conduce, o eșalonare când membrii se retrag într-o parte, o cutie când își țin colțurile.

Totul se judecă la scara meciului: **raza de angajare** `R` este percentila 75 a distanței dintre un ucigaș și victima lui (limitată la sensul domeniului), iar duratele unei manevre se scalează după felul unității (infanteria, o treime din cea a solului).

## Ce găsește {#what-it-finds}

| Manevră | Este găsită când |
|---|---|
| Formație | un grup păstrează o formă pe 60% din pașii lui în mișcare, timp de 30 s |
| Atac frontal | un grup se apropie din afara razei până la contact, ¾ R sau mai mult, din cele 35° în care este întors inamicul |
| Atac pe flanc | același lucru din 50-130° (spatele, peste acest unghi); sigur doar cu o *forță de fixare* prietenă care se luptă cu inamicul acolo (doborâri în ambele sensuri) |
| Clește | două atacuri pe flanc ale aceleiași tabere asupra aceluiași corp inamic, din părți opuse (100° sau mai mult una față de alta), în 90 s; sigur când brațele se luptă |
| Încercuire | un grup inamic compact, cu cel puțin atâția din cealaltă tabără în jur în rază de 1,5 R, din două sau mai multe grupuri, fără gol mai mare de 100°, un minut, tăiat de tabăra lui; sigur când inelul s-a strâns cu ½ R și s-a luptat în buzunar |
| Străpungere | un grup trece o linie ținută (inamici care stau 30 s atât în stânga cât și în dreapta lui, centrul taberei lor dincolo de ei); sigur când ajunge cu ½ R mai departe, stă 20 s și se luptă acolo; o străpungere adevărată cu încă un R mai departe |
| Acoperire în mișcare | într-un grup mic, o parte se mișcă, restul stă, rolurile schimbându-se de patru ori sau mai mult, cu foc de acoperire din partea care stă |
| Concentrare / dispersie | partea unei tabere din apropierea celui mai dens punct al ei crește de la 35% la 60% (unități care vin la 1,5 R sau mai mult, apoi contact) - sau scade prin împrăștiere |
| Diversiune | un element mic în contact atrage doi sau mai mulți inamici din altă parte; un grup mai mare lovește apoi la patru raze distanță, unde inamicul are mai puțini |
| Retragere / urmărire | un grup în contact se întoarce și pune R între el și locul luptei; sigur când un inamic de acolo tocmai a doborât unul de-al lui și grupul a ajuns la 2 R de acel ucigaș (niciodată pe jos: vezi mai jos); inamicii care se mișcă în același fel și țin pasul urmăresc |
| Apărare în adâncime | unități care stau în două sau mai multe fâșii peste axa inamicului, adânci de R, inamicul vine, foc din fâșii |
| Pantă inversă | trei sau mai multe doborâri de la distanță scurtă de unități care stau în picioare, ale victimelor care au trecut peste o creastă |
| Ambuscadă | un grup în mișcare întâlnește inamici care au stat 45 s; ei trag primii, iar cei în mișcare pierd doi sau jumătate din grup |
| Ecran | una sau două unități care se mișcă înaintea unui corp de trei sau mai multe, întâlnind primele inamicul |
| Linii interioare | grupurile unei tabere sunt apropiate între ale celeilalte, unitățile ei trecând între ele |
| Tempo | o tabără care răspunde unui contact (virajul, schimbarea vitezei, primul foc) de 1,5 ori mai repede, valoarea p Mann-Whitney sub 0,05 |
| Manivelă, crestătură, tragere, pompă | ținta unei lansări de rachetă întoarce trăgătorul la 35-70°, 75-105°, peste 140°, sau îl trage și apoi se întoarce |
| Clește aerian, zid, lider-coadă, tocător | o pereche care se desparte asupra unui inamic; trei în linie în fața inamicului; un element cu 5-20 km în spatele altuia; doi care orbitează un punct, la un kilometru distanță |
| Patrulă aeriană de luptă | orbitează o stație timp de trei minute |
| Lupta de energie / a unghiurilor | într-o luptă apropiată - direcții la 30° una de alta, fiecare ținându-l pe celălalt în nas pe rând, sau o doborâre între ei - înălțime folosită și urcare, sau în plan și viraj strâns în timp ce încetinește; sigur când unul l-a doborât pe celălalt |
| Pachet de atac, SEAD | un grup aerian cu roluri amestecate, dintre care unele lovesc solul; doborârile apărării antiaeriene înaintea majorității celorlalte doborâri la sol |
| Linie de bătălie, traversarea T | trei nave în coloană; o coloană pătrată peste capul unei coloane inamice |

Fiecare manevră spune ce **tipare** din baza de cunoștințe arată (`patterns-maneuver.ts`: formație, atac frontal, dublă învăluire, încercuire, străpungere, foc și manevră, diversiune, retragere, urmărire, apărare în adâncime, ecranare, dispersie, apărare împotriva rachetelor, lupta unghiurilor, patrulă aeriană de luptă, pachet de atac, linie de bătălie, traversarea T) și intrările de citit întâi. Intrările mai vechi duc tiparele noi prin `knowledge/maneuver-tags.ts`. Vezi [Lentila cunoașterii](knowledge.md).

**A meritat** compară schimbul unităților cât a durat (și un minut după) cu al taberei lor pe tot meciul; o retragere merită când a pierdut mai puține unități după întoarcere decât înainte, o apărare împotriva rachetelor când avionul trăiește un minut, o încercuire când buzunarul pierde jumătate.

## Pe mai multe meciuri {#over-many-matches}

Rezumatul fiecărui meci (`src/mass/summarize.ts`, vezi [Analiză de masă](mass-analysis.md)) conține o secțiune mică `maneuvers`: pe fel și tabără, câte au fost făcute (la Probabil sau mai sus), câte au meritat, câte nu, doborârile și pierderile. **Analiză de masă → Manevre** le adună pe meciurile păstrate de filtru - pe hartă și mod, sau în total - cu intervalul Wilson al ratei celor care au meritat; un rând încarcă meciurile în care a fost făcută. Rezumatele scrise înainte ca secțiunea să existe nu au niciuna: rulează `node tools/3dheat-summarize.mjs <folder> --force` ca să o adaugi.

## Cât de sigură este {#how-sure-it-is}

Meciuri sintetice cu manevre puse de noi (`synth.ts`, rulate de `maneuver.test.ts`): toate cele 28 de feluri puse sunt găsite la Probabil sau mai sus; din 50 de manevre raportate, 31 sunt felul pus și celelalte 19 sunt și ele cu adevărat acolo (formația grupului în mișcare, apropierea frontală a coloanei care străpunge); niciuna nu este greșită. Pe 30 de meciuri nule - mersuri aleatorii separate și amestecate, unități care stau la întâmplare, avioane pe trasee drepte, o mulțime care se foiește - nimic nu este raportat la Probabil sau mai sus.

Pe date reale (zeci de bătălii la sol, câteva misiuni lungi de război aerian, o duzină de meciuri de trăgător): atacuri frontale, flancuri, străpungeri și încercuiri în bătăliile de tancuri, formații și lupte apropiate în aer, apărări împotriva rachetelor, orbitări de patrulă și perechi lider-coadă în misiunile de război aerian, execuții frontale, coloane și câteva ambuscade și perechi în mișcare în trăgător. Pragurile sunt formele doctrinei la scara jocului; citește o singură găsire cu dovezile ei, iar ratele din tabelul de masă cu intervalele lor.

### Față de modele nule ale acelorași meciuri {#against-null-models-of-the-same-matches}

Un detector poate fi păcălit de teren și de mulțime: într-o busculadă fiecare grup are inamici în jur. Așa că fiecare fel este rulat și pe **modele nule** construite din aceleași meciuri (`nulls.ts`), unde taberele nu se mai întâlnesc ca înainte: cronologia unei tabere întoarsă cu o treime până la două treimi din meci (*deplasare*), sau traseele ei întoarse în jurul centrului hărții (*rotire*); și etichetele de echipă amestecate (*echipe*, care prin construcție păstrează aproximativ jumătate din luptele reale). Luptele sunt numărate doar ca doborâri asociate cu morțile lor, ucigașul la 2 R și victima la loc - un model nul le strică. Găsiri la Probabil sau mai sus, reale față de modelele nule (30 de bătălii de tancuri; 12 meciuri de trăgător):

| Fel | Bătălii de tancuri: real / deplasare / rotire | Trăgător: real / deplasare / rotire |
|---|---|---|
| Încercuire | 0 / 0 / 0 (era 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Străpungere | 0,03 / 0,02 / 0,05 (era 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanc | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Atac frontal | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Retragere | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (deci niciodată sigură pe jos) |
| Ambuscadă | - | 0,17 / 0,04 / 0,04 |
| Luptă de energie | 1,2 / 0,1 / 0,85 | - |
| Luptă a unghiurilor | 0,6 / 0,07 / 0,3 | - |

Luptele aeriene apropiate peste centrul unui câmp de luptă supraviețuiesc unei întoarceri în jurul acelui centru, deci coloana de rotire le favorizează mai puțin decât favorizează felurile terestre. Felurile dintr-o singură tabără - formația, patrula aeriană de luptă, tocătorul, pachetul de atac, SEAD, acoperirea în mișcare, ecranul - nu depind de cealaltă tabără și nu sunt testate așa. `maneuver.test.ts` verifică că modelele nule scot din meciurile sintetice flancul, cleștele, încercuirea, străpungerea, ambuscada și retragerea puse de noi.

## Limite {#limits}

- Grupurile au nevoie de poziții în timp; un fișier de evenimente fără poziții nu are niciuna.
- Orientarea nu se citește din date: frontul inamicului este acolo unde forța de fixare îl angajează, altfel unde se mișcă, altfel de unde a venit atacatorul.
- Terenul se citește din înălțimile unităților (panta inversă); nu există test de linie de vedere.
- Fișierele foarte mari sunt eșantionate la pași mai lungi; manevrele aeriene scurte din ele sunt citite tot din pași de 2-4 s.
