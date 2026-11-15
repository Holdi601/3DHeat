---
title: "Memorie și bugete"
parent: "Încărcarea datelor"
nav_order: 6
lang: "ro"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memorie, bugete și verificarea încăperii

Calculatorul tău are memorie limitată. 3DHeat adună ce au nevoie fișierele tale și îți spune, înainte de **Încarcă**, dacă încap.

![Estimarea memoriei la „nu încape”, cu Încarcă la fiecare [N] rând completat și butonul Încarcă scris Prea mare - redu sau decimează](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Prea mare pentru acest calculator? 3DHeat îți propune să încarci la fiecare al N-lea rând.*

O filă de browser care rămâne fără memorie în mijlocul unei încărcări se blochează și pierde minute de muncă, iar un GPU căruia i se cere mai mult decât are își pierde contextul sau încetinește până la târâș. Așa că înainte să înceapă o încărcare, panoul Sursă spune cât de multă memorie îi trebuie, compară cu bugetele detectate pentru acest calculator și refuză – cu o ieșire – când nu va încăpea. Modelul este în [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Estimarea memoriei {#the-memory-estimate}

Apare deasupra butonului **Încarcă** odată ce rândurile au fost numărate.

| Linie | Înseamnă |
|---|---|
| **Estimarea memoriei** - *încape* / *la limită* / *nu încape* | Verdictul, verde, galben-chihlimbariu sau roșu. |
| `N rânduri · B B/rând` | Rândurile care vor fi încărcate (după pas) și octeții constanți pe rând. |
| `RAM X rezidentă, Y la vârf în timpul încărcării` | Memoria ținută după încărcare și vârful atins în timpul încărcării. |
| `GPU Z · încărcare est. T` | Memoria GPU pentru rânduri și o durată estimată la 1,2 milioane de rânduri pe secundă. |
| numele GPU-ului | Numele randerului, când driverul îl raportează. |
| Mesaje | De ce nu încape sau e la limită și ce de făcut. |
| **Încarcă la fiecare [N] rând** | Pasul de decimare (vezi mai jos). |
| `Buget: X RAM, Y GPU. Ajustați la Performanță → Bugete de resurse.` | Bugetele pe care le-a folosit verificarea. |

### Octeți pe rând {#bytes-per-row}

| Coloană | Constant (RAM) | Observații |
|---|---|---|
| Poziție | 12 | Trei numere reale pe 32 de biți, mereu (o axă plată tot este un vector) |
| Timp | 4 | Când este mapată |
| Durată de viață | 4 | Când timpul și persoana sunt mapate |
| Persoană | 4 | Când este mapată |
| Grup | 2 | Când este mapat |
| Sesiune | 4 | Când este mapată |
| `Source file` | 4 | Când este încărcat mai mult de un fișier |
| Fiecare coloană de filtru | 4 | Pentru fiecare coloană bifată *Păstrează pentru filtrare* |

**Vârful** adaugă ce are nevoie încărcarea doar tranzitoriu – 8 octeți de timp pe 64 de biți în timpul îmbinării, 12 octeți de chei de sortare și indici, 4 octeți de spațiu de lucru pentru permutare (toți trei când timpul este mapat), și 4 octeți cât timp coloana de grup este încă pe 32 de biți – și înmulțește suma cu **2,0**. Factorul a fost măsurat (o încărcare reală cu mai multe fișiere a atins 1,9× din vectorii enumerați, din setul de lucru al decodorului Parquet, copiile care taie fiecare coloană la lungime și memoria eliberată dar nerecuperată încă) și rotunjit în sus, pentru că o subestimare costă o filă blocată, iar o supraestimare costă doar un pas inutil.

Pe **GPU** fiecare rând costă 8 octeți (poziție și grup, 16 biți fiecare), plus 4 octeți (timp și durată de viață, 16 biți fiecare) când timpul și persoana sunt mapate. Vezi [Ocuparea memoriei GPU](gpu-memory.md). Texturile de filtru (4 octeți pe rând pentru fiecare filtru activ) și începuturile segmentelor din căldura pe linii (8 octeți pe rând cât timp modul Linii este pornit) nu fac parte din această estimare.

## Verificarea încăperii {#the-fit-check}

Sunt comparate trei constrângeri ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- vârful RAM față de **bugetul RAM**,
- octeții GPU față de **bugetul GPU**,
- numărul de rânduri față de **plafonul de sortare** de 400.000.000 de rânduri, când este mapată o coloană de timp.

Raportul cel mai rău dintre cele trei hotărăște: până la 70% *încape*, până la 100% *la limită* (ar trebui să se încarce, dar te aștepți să fie lent), peste *nu încape*. Când nu încape, panoul numește constrângerea care limitează și propune:

- încărcarea la fiecare *N*-lea rând, cu *N* = ⌈rânduri / rânduri care încap⌉, completat în caseta de pas;
- scoaterea unor coloane de filtru, demaparea coloanei de timp (ceea ce înlătură sortarea și plafonul ei, cu prețul liniei de timp) sau ridicarea bugetului.

Când bugetul în sine nu este un fapt despre hardware – browserul a limitat cifra RAM, implicitul a fost ținut în jos de ce este liber chiar acum, sau cifra GPU este o presupunere – mesajul o spune, ca să nu cauți un pas pe care nu ai nevoie.

### Decimarea {#decimation}

**Încarcă la fiecare [N] rând** păstrează un rând din *N*, numărat pe fișier. Căldura este o medie, deci fiecare al N-lea rând dă aceeași distribuție cu mai mult zgomot – același compromis pe care îl face deja randerul la fiecare cadru. Caseta începe de la 1 (*toate rândurile*); când selecția nu încape, este completată cu pasul propus, în afară de cazul în care ai scris în ea. Butonul Încarcă scrie atunci *Încarcă N fișiere (1 din K)*, iar numele setului de date notează `every Kth row` (al K-lea rând la fiecare).

### Plafonul de sortare {#the-sort-ceiling}

Randerul are nevoie de rânduri în ordine crescătoare a timpului, deci o coloană de timp mapată înseamnă sortarea fiecărui rând, cu o sortare radix peste chei de 32 de biți ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Peste **400 de milioane** de rânduri asta este refuzat în loc să fie încercat într-o filă. Se verifică înainte de încărcare, deci o selecție peste limită este refuzată cu o propunere de pas, în loc să fie citită integral și să cadă la ultimul pas. Aproape de limită (*la limită*) panoul avertizează că sortarea este o trecere lungă fără progres propriu. Fără o coloană de timp nu se face nicio sortare și niciun plafon nu se aplică.

## Bugete de resurse {#resource-budgets}

**Performanță → Bugete de resurse** (o linie pliabilă la baza panoului Performanță, care scrie `Bugete de resurse - RAM, GPU, nuclee`). Bugetele sunt detectate; cifra detectată este implicitul; iar glisoarele nu merg mai sus de un **plafon** care este cifra detectată, cu excepția cazului în care se știe că detectarea nu este o măsurătoare.

| Comandă | Interval | Înseamnă |
|---|---|---|
| **RAM pentru datele rândurilor** | 256 MiB până la plafonul RAM, logaritmic | Bugetul RAM pentru verificarea încăperii. Marcat *(peste detectat)* peste implicitul detectat, *(maxim)* la plafon. |
| **GPU pentru datele rândurilor** | 128 MiB până la plafonul GPU, logaritmic | Bugetul GPU pentru verificarea încăperii și pentru trimiterea rândurilor. Marcat *(peste detectat)* peste implicitul detectat, *(maxim)* la plafon. |
| **Fire de analiză** | 1 până la numărul de nuclee logice | Câte fișiere se analizează deodată la o încărcare, fiecare într-un worker propriu. Implicit nuclee - 2 (nuclee - 1 pe patru nuclee sau mai puține). Vezi [Fire de analiză](#parser-threads) (la Pentru dezvoltatori). |
| Linia Surse | | De unde a venit fiecare cifră (`RAM: …. GPU: …. CPU: ….`). |
| **Redetectează** | | Cere serverului de dezvoltare o citire nouă a memoriei și recalculează fiecare buget. |
| numele GPU-ului | | Numele scurt al adaptorului; șirul complet al randerului este în tooltip. |

### Ridicarea bugetului GPU {#raising-the-gpu-budget}

Un buget GPU peste cifra detectată se aplică așa cum este setat: verificarea încăperii și trimiterea iau aceeași cifră dintr-o singură funcție ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), care o limitează doar la plafonul GPU la care se oprește glisorul. Deci o încărcare pe care o trece verificarea este trimisă integral. Peste cifra detectată glisorul arată *(peste detectat)*: numărul este atunci judecata ta despre placă, nu o măsurătoare, iar a-l pune mai mare decât are placa riscă un context pierdut sau un târâș.

## Seturi de date uriașe: pârghiile {#huge-datasets-the-levers}

De la cel mai ieftin la cel mai drastic:

1. **Mai puține coloane de filtru.** Fiecare costă 4 octeți pe rând și o trecere de decodare.
2. **Un pas.** Fiecare al *N*-lea rând.
3. **Fără coloană de timp.** Fără sortare, fără plafon de sortare, fără 4-8 octeți pe rând de timp și durată de viață – și fără linia de timp.
4. **Ridică bugetele**, când știi că memoria există.

La randare, seturile mari sunt tratate prin eșantionare și acumulare progresivă, nu prin reducerea datelor; vezi [Eșantionarea și bugetele](sampling-and-budgets.md).

## Pentru dezvoltatori {#for-developers}

### Fire de analiză {#parser-threads}

O încărcare de mai multe fișiere analizează până la **Fire de analiză** dintre ele deodată, fiecare într-un worker de analiză pornit de workerul de ingestie pentru acea încărcare ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). La 1, sau pentru un singur fișier, fișierele sunt analizate unul după altul chiar în workerul de ingestie.

Rularea mai multora deodată nu slăbește verificarea încăperii:

- **Constructorul se numără primul.** Coloanele îmbinate sunt alocate pentru toată selecția înainte să fie citit primul fișier, deci fișierele aflate în zbor primesc doar ce lasă bugetul RAM lângă ele (`parseHeadroom`): poziție, timp pe 64 de biți, unghiuri de privire, persoană, grup pe 32 de biți, sesiune, coloane de filtru și `Source file`, pe rând de încărcat – înmulțit cu 2,6 când numărul de rânduri este o estimare CSV, pentru o coloană care crește într-una mai mare.
- **Fiecare fișier își rezervă costul înainte să pornească** (`fileParseBytes`): rândurile lui (din subsolul Parquet; partea unui CSV din estimare după mărime) înmulțite cu aceleași coloane, înmulțite cu **8** – blocul în sine, copia de lângă el cât timp rândurile fără poziție sunt aruncate, și setul de lucru al decodorului, care pentru coloanele text este mult mai mare decât id-urile lor. Un pas nu reduce asta, pentru că fișierele sunt citite integral și decimate după aceea. Cifra 8 este o rezervă stabilită prin măsurare: la 3, sau la 5, treizeci de fire de analiză au dus o filă peste limită pe 86 de milioane de rânduri cu nume de persoane și sesiuni; la 8 nu.
- **Un alt fișier pornește doar dacă rezervarea lui încape** în ce a rămas. Un fișier care a terminat, dar așteaptă ca unul anterior să fie îmbinat, își păstrează rezervarea până este îmbinat.
- **Un fișier rulează mereu.** Când nu este nimic rezervat, următorul fișier pornește oricât ar costa – aceasta este încărcarea unul-câte-unul pe care a admis-o verificarea încăperii, deci un buget strâns cade pe ea în loc să refuze.

Cifra *vârf în timpul încărcării* este vârful unei încărcări unul-câte-unul, care vine la sortare, după ce au fost citite toate fișierele. Fișierele analizate unul lângă altul pot lua, în timp ce sunt citite, memorie peste această cifră; rezervările o țin în bugetul RAM, în măsura în care estimările de mai sus sunt corecte.

Ordinea îmbinării este ordinea selecției, indiferent în ce ordine se termină fișierele, deci numerotarea persoanelor, grupurilor și sesiunilor, rândurile și valorile `Source file` sunt identice cu o încărcare unul-câte-unul. Un fișier care nu poate fi citit este sărit și listat exact ca înainte. Un worker de analiză care moare oprește toată încărcarea, cum oprea întotdeauna moartea workerului de ingestie, iar fiecare worker de analiză este oprit când se termină încărcarea, oricum s-ar termina. Dacă workerii de analiză nu pot fi pornite deloc, fișierele sunt analizate în workerul de ingestie.

### Cum sunt detectate cifrele {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) rulează la pornire, din nou odată ce randerul există, și la **Redetectează**.

**RAM, cu serverul de dezvoltare.** `start.bat` și `npm run dev` servesc pagina dintr-un proces care poate citi memoria calculatorului, la `/__host/memory` (răspunde în 1,5 s sau este ignorat). Implicitul este cea mai mică dintre 60% din RAM-ul instalat și 80% din RAM-ul liber acum; plafonul este 60% din cel instalat. Când memoria liberă este cea care ține implicitul în jos, panoul spune asta și propune să închizi programe și să apeși **Redetectează**.

**RAM, fără el** (o publicare statică): niciun API al browserului nu raportează memoria liberă, iar `navigator.deviceMemory` este rotunjit în jos la o putere a lui doi și limitat la 8 GiB de Chrome și Edge. Implicitul este 60% din `deviceMemory`, limitat în plus la 4 × heap-ul JS liber al filei acolo unde browserul îl raportează, sau 4 GiB când nu se raportează nimic. Când `deviceMemory` arată exact 8 (limita), cifra este marcată ca *limitată*, iar plafonul este 4 × implicitul, cu o notă că peste implicit cifra este afirmația ta, nu o măsurătoare.

**În ambele cazuri**, implicitul și plafonul RAM sunt limitate la **12 GiB**, cea mai multă memorie de tip typed-array pe care o poate ține o filă Chrome, orice ar avea calculatorul (o pagină a ajuns la aproximativ 15,75 GB și a eșuat; 12 lasă loc pentru tot restul), și nu coboară niciodată sub 256 MiB.

**Memoria GPU.** Niciun API web nu o raportează deloc.

- Cu serverul de dezvoltare, memoria plăcii este citită de `nvidia-smi` (cel mai mare adaptor) sau, pe Windows, din valoarea de registru a adaptorului de afișare `HardwareInformation.qwMemorySize`. Implicitul este 70% din ea, plafonul 90%.
- Fără o citire, se deduce: 2 GiB implicit; 4 GiB când cea mai mare textură are 16.384 px sau mai mult (o placă discretă), 1 GiB când este mai mică; sau 8 × `maxBufferSize` al WebGPU când acesta este mai mare. Plafonul este atunci 8 × cifra dedusă, pentru că deducerea distinge o componentă integrată de una discretă și nimic mai fin. Panoul spune că cifra este dedusă.
- Niciodată sub 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 când nu este raportat).
