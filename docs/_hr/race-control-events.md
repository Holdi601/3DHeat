---
title: "Događaji upravljanja vozilom"
parent: "Analiza utrke"
nav_order: 54
lang: "hr"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Događaji kontrole automobila

Preglednik prati kako je vožen svaki krug i označava mjesta na kojima je vozač nanio da automobil kliže, okreće se, udari u nešto ili troši prianjanje bez koristi. To je korisno jer je greška koja je koštala vrijeme najbrži način da se popravi.

![Odjeljak Kontrola automobila: koliko je često svaki krug blokirao kotač, okrenuo se ili izašao širom, i popis grešaka s jednom otvorenom](../assets/img/en/race-control-table.webp)

## Jednostavnim riječima {#in-plain-words}

- **Blokiranje**: kočite tako jako da se kotač prestane okretati i počne kliziti. Automobil slabije koči i ne može skretati.
- **Proklizavanje kotača**: pritisnete gas tako jako da se pogonski kotači vrte brže nego što se automobil kreće. Gubite snagu.
- **Preupravljanje**: stražnji dio automobila izlazi široko. Ako se automobil potpuno okrene, to je **okret**.
- **Podupravljanje**: prednji dio automobila izlazi široko ("guranje"); okretanje volana više ne pomaže.
- **Pogodak** i **pad**: automobil je nešto dodirnuo (pogodak je udarac ili grebanje, pad je jak sudar).
- **ABS**, **TC**: pomoćni sustavi automobila koji rade protiv blokiranja i proklizavanja kotača. Nisu greške.

## Odjeljak Kontrola automobila (što vidite) {#the-car-control-section-what-you-see}

Za odabrani krug, što god krugovi sadrže, bez klizanja guma i bez kuta drifta prikazuje se ono što se ipak može pronaći, a ne ništa (u nastavku).

**Tablica**: jedan red za svaku vrstu koju pokazuje bilo koji od dva kruga: Blokirani kotači, Proklizavanje kotača, Stražnji dio izlazi (preupravljanje i okreti), Guranje širom, Padovi, Pogoci, ABS u radu, TC u radu, Ručna kočnica, U zraku. Svaka ćelija je "broj · sekunde", za odabrani krug i krug s kojim se uspoređuje. Ako postoji kut drifta, tu je i *Najveći kut drifta* (najveći na tlu).

**Popis**: njegove nepodijeljene greške koje koštaju barem 0,02 s, najskuplje prve, najviše 12, svaka s naslovom i cijenom (i oznakom svoje vrste). Kliknite na jednu da pročitate savjet, poravnate automobile 40 m prije nje i reproducirate je. **Također što su oba kruga učinila tamo** dodaje svaku grešku, uključujući zajedničke (oznaka "oba su to učinila", cijena "—" ispod 0,01 s). Ako nema nijedne: "Ništa što je X učinio s gumama nije ga koštalo vremena što Y to nije učinio također."

**Napomena ispod** kaže čime je otkrivanje moglo raditi: "Iz klizanja i kuta klizanja svakog kotača te kuta drifta automobila." (ili klizanje i kut klizanja, klizanje i kut drifta, samo klizanje, ili "Samo iz kuta drifta automobila – ovi krugovi ne sadrže klizanje guma."). Kaže i podlogu za koju su granice mjerene (asfalt, rahla, mješovita: preko 80% uzoraka rahlo je rahla podloga, ispod 20% asfalt), s kojim su krugom događaji uspoređeni i kako se računa cijena.

Bez **klizanja guma i bez kuta drifta** (datoteka kruga FH Companion bez telemetrije) tablica i popis se svejedno prikazuju, a napomena kaže što se ipak pronašlo iz onoga što krugovi sadrže: "Ovi krugovi ne sadrže klizanje guma ni kut drifta, pa se blokiranje i proklizavanje kotača ne mogu razlikovati. I dalje se pronalazi: guranje, iz upravljanja nasuprot putanji; pogoci i padovi, iz brzine i ubrzanja." Klizanja iz brzine zakreta navode se također gdje krugovi imaju tu vrijednost, a guranja samo gdje imaju upravljanje. Rečenica o granicama klizanja i drifta se izostavlja, a druga napomena kaže: "Za Forza Horizon odaberite i datoteku `.tele.gz` uz svaki krug FH Companion: to je potpuna telemetrija, klizanje svakog kotača 64 puta u sekundi."

Ukupna **cijena** kontrole kruga (koristi se u sažecima) broji preklapajuće greške, to jest blokiranje i klizanje koje iz njega proizlazi unutar 40 m, samo jednom, po najskupljoj u skupini.

## Kako se otkriva {#how-it-is-detected}

Ostatak ove stranice je pravilnik: svaka vrsta, svaki prag.

Kod: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Obrazloženje i literatura nalaze se u [metodi](race-analytics.md).

## Vrste {#the-kinds}

| Vrsta | Red u tablici | Greška? | Najkraće što se broji |
|---|---|---|---|
| `lock` | Blokirani kotači | da | 0,1 s |
| `wheelspin` | Proklizavanje kotača | da | 0,15 s |
| `oversteer` | Stražnji dio izlazi | da | 0,2 s |
| `spin` | (broji se uz Stražnji dio izlazi) | da | 0,1 s |
| `understeer` | Guranje širom | da | 0,25 s |
| `crash` | Padovi | da | - |
| `hit` | Pogoci | da | - |
| `abs` | ABS u radu | ne | 0,2 s |
| `tc` | TC u radu | ne | 0,2 s |
| `handbrake` | Ručna kočnica | ne | 0,1 s |
| `airborne` | U zraku | ne | 0,15 s |

Kraće vožnje su šum (rubnjak, neravnina, jedan uzorak). Nizovi točaka mreže (svaka 2 m) koje prolaze test spajaju se preko praznina do 2 točke. Samo **greške** mogu biti pogreške i nose cijenu; ostalo je ono što su automobil i vozač učinili.

## Što svaki test treba {#what-every-test-needs}

### Izvedeni kanali {#derived-channels}

Prije nego što se išta procijeni, svaki krug dobiva ono što njegova igra ne šalje, pod kanonskim imenima (vrijednost same igre uvijek pobjeđuje):

| Kanal | Iz |
|---|---|
| `bodySlip` (kut drifta) | brzina u koordinatama automobila, `atan2(latVel, abs(longVel))`, gdje je igra šalje (0 ispod 3 m/s); inače smjer vožnje (zakret igre, prilagođen smjeru kretanja po predznaku i pomaku preko uzoraka bržih od 10 m/s, i vjeruje mu se samo uz kružnu varijancu ispod 0,05) naspram smjera kretanja (pozicije udaljene najmanje 2 m), pri brzinama iznad 3 m/s |
| `yawRate` | promjena `yaw` tijekom vremena, gdje postoji smjer ali ne i brzina |
| `airborne` | svi kotači bez dodira s tlom (≤ 0,5); inače opterećenje svakog kotača ispod 5% njegove medijane; inače hod ovjesa svakog kotača na 0,02 ili manje (potpuno ispružen). Jedan pojedinačni uzorak nije let |
| `slipRatio.<W>` | `(brzina površine kotača - brzina automobila) / brzina automobila` iznad 3 m/s, gdje igra šalje brzine površine kotača; ili iz okretaja kotača × valjni polumjer izmjeren na krugu: medijana `brzina / okretaj` dok se vozi ravno bez gasa (brzina > 10 m/s, gas < 0,3, kočnica < 0,05, abs(uzdužno ubrzanje) < 3 m/s², ne u zraku; kad ih ima manje od 20, svaki uzorak iznad 10 m/s), prihvaćeno između 0,1 i 1 m. Označeno kao `physical` |
| `loose` | Forzino podrhtavanje površine na najmanje 2 kotača (> 0,001) najmanje 0,33 s (rubnjak je kraći), praznine kraće od 1 s premoštene |

### Na tlu i smireno {#on-the-ground-and-settled}

Ništa se ne procjenjuje u zraku ili **0,3 s nakon slijetanja**. Ovjes se tada sabije do kraja i ubrzanja naglo skoče, a to nije prianjanje, kočenje ni pogon. Uzorak također mora biti **u pokretu**: brži od 5 m/s.

### Podloga {#the-ground}

Podloga svakog uzorka je **rastresita** tamo gdje kanal `loose` kruga to kaže (Forzino podrhtavanje površine, materijali kotača u Trackmaniji). Inače je to površina kruga (vidi [disciplinu i površinu](race-loading-laps.md#discipline-and-surface)): asfalt, ili rahla za sve ostalo. Krivulje, navike driftanja i pragovi čuvaju se odvojeno za asfalt i rahlu podlogu.

### Klizanje, kao višekratnik nazivnog vrha gume {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Igre različito skaliraju klizanje. `meta.slip` kaže kako, a svako klizanje se dijeli s mjerilom tako da oko 1 bude nazivni vrh gume:

| `meta.slip` | Značenje | Dijeli se s |
|---|---|---|
| `peak` | normalizirano od igre: iznad 1 prianjanje se gubi (Forza Data Out) | 1 |
| `scaled` | fizičko klizanje podijeljeno s vrhom za asfalt (snimač Kunos) | nazivni vrh podloge podijeljen s onim za asfalt |
| `index` | mjera klizanja od 0 do 1 (SlipCoef u Trackmaniji) | 0,5 |
| `physical` (ili nepoznato) | omjer klizanja kao udio, kut klizanja u radijanima | nazivni vrh podloge |

Nazivni vrhovi, kad se ništa bolje ne zna:

| Podloga | Omjer klizanja | Kut klizanja |
|---|---|---|
| asfalt | 0,12 | 8° |
| mješovita | 0,18 | 12° |
| rahla (šljunak) | 0,25 | 15° |
| snijeg | 0,25 | 15° |
| led | 0,10 | 6° |

### Gdje prianjanje prestaje: krivulje guma svakog automobila {#where-grip-ends-each-cars-tyre-curves}

Gdje guma prestaje davati više mjeri se po automobilu, iz svakog učitanog kruga (`measureTyres`), odvojeno za asfalt i rahlu podlogu:

| Krivulja | Uzorci (brzina > 10 m/s, smireno, ubrzanja ispod 45 m/s²) | Klizanje (x) | Sila (y) |
|---|---|---|---|
| kočenje | kočnica > 0,3, ručna kočnica ≤ 0,2, vožnja ravno (bočno ispod 30% najvećeg) | abs(srednji omjer klizanja četiriju kotača) | usporenje |
| vuča | gas > 0,8, kočnica ≤ 0,05, ravno, vuča automobila pri punom gasu pri toj brzini > 0,5 m/s² | omjer klizanja najvećeg pogonskog kotača | ubrzanje kao udio te vuče |
| prednja | bočno iznad 30% najvećeg, prianjanje automobila pri toj brzini > 1 m/s² | veći prednji kut klizanja | bočno ubrzanje kao udio tog prianjanja |
| stražnja | isto | veći stražnji kut klizanja | isto |

"Najveće" je 99. percentil apsolutnog bočnog ubrzanja kruga na toj podlozi (sva podloga kad ima manje od 50 uzoraka). Pogon određuje pogonske kotače (FWD prednji, RWD stražnji, AWD svi; nepoznato: svi).

Od najmanje **150 uzoraka** klizanje se dijeli u 6 do 14 razreda jednakog broja uzoraka (jedan na 40 uzoraka). Sila svakog razreda je njegov gornji kvartil (koliko je guma dala kad ju je vozač zatražio), zaglađen preko susjednih razreda. **Najbolji** je razred s najvišom silom. **Granica** je prvi razred iza njega u kojem je sila pala za **8%**. Krivulja koja u podacima nikad ne pada nema granicu (beskonačnu). Prelazak "vrha" u toj igri ništa ne košta, a samo klizanje tu ništa ne označava (krivulje zavoja i vuče Forza Horizona takve su). Kad je premalo uzoraka na jednoj podlozi, koriste se one druge podloge. Kad je premalo uzoraka ukupno, koristi se **nazivna** granica: 1,5 puta nazivni vrh.

Svaki automobil dobiva i:

- njegovu **naviku driftanja**: gornji kvartil njegova kuta drifta na svakom zavoju pri 60% najvećeg ili više (treba 100 uzoraka);
- njegovo **upravljanje po zakrivljenosti** (`steerGain`), po pojasu brzine od 5 m/s: medijana abs(upravljanje) / zakrivljenost putanje dok čvrsto skreće, ali dobro unutar svog prianjanja (30–60% najvećeg, zakrivljenost uža od radijusa 400 m, upravljanje iznad 0,02; 25 uzoraka po pojasu). Zakrivljenost putanje je brzina zakreta podijeljena brzinom, gdje igra šalje brzinu zakreta. Inače se računa iz pozicija ±5 m.

## Otkrivanje, vrsta po vrsta {#detection-kind-by-kind}

| Vrsta | Test (na uzorcima u pokretu i smirenima) | `peak` i `limit` |
|---|---|---|
| **lock** | kočnica > 0,05, ručna kočnica ne iznad 0,2, i omjer klizanja nekog kotača ispod negativne granice kočenja | najnegativnije klizanje (višekratnici nazivnog vrha); granica kao negativna |
| **wheelspin** | gas > 0,2 (ili nema kanala gasa), i omjer klizanja pogonskog kotača iznad granice vuče | najveće pogonsko klizanje; granica |
| **oversteer** (kut drifta) | kut drifta iznad većeg od donje granice podloge i 1,5 × navike driftanja automobila tamo | najveći kut drifta, radijani |
| **oversteer** (kutovi klizanja, bez kuta drifta) | veći stražnji kut klizanja iznad stražnje granice i više od 0,25 iznad većeg prednjeg | stražnji kut klizanja (višekratnici vrha) |
| **oversteer** (bez kuta drifta, ali s brzinom zakreta i bočnim ubrzanjem) | "brzina stava", to jest abs(brzina zakreta) minus abs(bočno ubrzanje) / brzina, iznad 8 m/s, preko 0,2 rad/s, s upravljanjem suprotno zavoju | rad/s; granica 0,2 |
| **spin** | prolazak preupravljanja čiji je kut drifta prešao **60°** | kao preupravljanje |
| **understeer** (kutovi klizanja) | ne kliže, veći prednji kut klizanja iznad prednje granice i više od 0,3 iznad stražnjeg | prednji kut klizanja; granica |
| **understeer** (bez kutova klizanja) | brže od 12 m/s, ne kliže, ne protuupravlja, bočno ubrzanje iznad polovice najvećeg kruga (99. percentil), putanja uža od radijusa 300 m, i upravljanje više od **1,6 puta** onoga što vlastito upravljanje po zakrivljenosti automobila kaže da je putanja tražila | puta potrebno upravljanje; granica 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` iznad 0,5 | - |
| **handbrake** | `handbrake` iznad 0,2 | - |
| **airborne** | `airborne` iznad 0,5 | - |
| **hit**, **crash** | vidi [Pogodci i padovi](#hits-and-crashes) | brzina koju je udar oduzeo |

Pragovi nagiba driftanja po podlozi: asfalt **7°**, mješovita **10°**, rahla i snijeg **15°**, led **10°**. Prate literaturu: kut klizanja gume doseže vrhunac na 3–10° na asfaltu, a granica stabilnosti cestovnog automobila po kutu klizanja karoserije je oko 12° na suhom asfaltu, dok se reli i drift voze na 30–50° ([Analitika utrka, izvori](race-analytics.md#sources)). Automobil koji se po sebi više kliže (model gume za arkadu, specijalist za šljunak) ima vlastiti, viši prag iz vlastitih krugova: 1,5 puta njegove navike.

**Kuda automobil skreće** (za "suprotno zavoju"): promjena smjera putanje kruga preko ±6 m (najmanje 2 točke mreže). Uža od radijusa 600 m računa se kao skretanje. Desno ili lijevo ovisi o tome je li svijet zrcaljen. Upravljanje je **suprotno** zavoju kad je abs(upravljanje) > 0,05 i predznak mu je suprotan skretanju, to jest klizanje se **hvata** suprotnim upravljanjem.

**Pedale na početku** (`pedal`): *kočenje* kad je kočnica iznad 0,1; *gas* iznad 0,3; *otpušten gas* kad je gas bio iznad 0,5 unutar 8 točaka mreže (16 m) prije; *valjanje* inače (ili bez kanala gasa).

## Uspoređeno s drugim krugom {#laid-against-the-other-lap}

Svaki događaj se procjenjuje naspram kruga s kojim je odabrani krug uspoređen u tom dijelu (najbrži u svojoj klasi; za sam taj krug, onaj iz njegove klase koji je bio najbrži kroz dionicu).

1. **Koliko je drugi krug otišao** na istim metrima, ±8 m: vlastiti događaji drugog kruga iste obitelji (okret se računa kao preupravljanje, pad kao pogodak), mjereni u istim jedinicama, bez pragova, uz krivulje guma drugog automobila.
2. **Zajednička** kad je drugi krug otišao **80%** ili više. Tako se zavoj vozi, to nije greška. Vrste koje nisu greške uvijek su "zajedničke".
3. **Cijena**, za nepodijeljenu grešku: vrijeme koje je ovaj krug izgubio u odnosu na drugi, od 5 m prije događaja do **40 m nakon** njega. Za pogodak ili pad, računa se dok automobil ne povrati brzinu: metri potrebni da je povrati uz vlastitu vuču, 40 do 400 m; bez izmjerene vuče, 5 m/s². Nikad nije negativna.
4. **Predana brzina** do granice automobila: za blokiranje, usporenje koje automobil pokazuje da može na toj brzini minus ono što je učinio, zbrojeno kroz događaj; za proklizavanje kotača, njegova vuča pri punom gasu minus ono što je učinio; za udar, brzina koju je udar oduzeo. Navodi se kad je veća od 0,5 m/s (1,8 km/h).

Greška koja nije zajednička i košta barem **0,02 s** ulazi na popis ([statistika dionica](race-course-statistics.md) broji samo greške od **0,03 s** ili više, tako da greška koja se broji kroz mnogo krugova bude jasna). Može postati uzrok gubitka na zavoju (vidi [Analiza zavoj po zavoj](race-corner-analysis.md#car-control-faults-and-impacts)).

## Pogodci i padovi {#hits-and-crashes}

`impacts.ts` čita udare iz **vlastitih uzoraka kruga**, prije ponovnog uzorkovanja, jer udar traje stotinke sekunde. Gume ne mogu proizvesti sile udara, pa se udar mjeri naspram vlastitog automobila kruga:

- **Njegovo prianjanje `G`**: 99. percentil njegova vodoravnog ubrzanja `√(lat² + long²)` kroz krug, na tlu i brže od 5 m/s. Bez kanala ubrzanja (ili ispod 3 m/s²), 15 m/s², prianjanje cestovnog automobila.
- **Prag**: `max(1,8 G, G + 18, 30)` m/s².
- **Uzorak udarca**: vodoravno ubrzanje iznad praga *i* skok veći od polovice `G` u odnosu na prethodni uzorak; **ili** brzina pada, unutar 0,1 s, za više od onoga što bi prag dao u 0,1 s plus 1,5 m/s. Samo na tlu i smireno, i samo kad je automobil bio brži od 5 m/s.
- Uzorci udarca unutar **0,4 s** čine jedan udar.
- **Prije / poslije**: najveća brzina u 0,15 s prije; najniža do 0,3 s nakon zadnjeg uzorka udarca.
- **Nije udar**: brzina je nestala bez sile iza nje (najveće vodoravno ubrzanje unutar 0,1 s ispod većeg od `G` i 25 m/s²) znači da igra vraća automobil ili ga resetira.
- **Pad** kad je udar oduzeo **30 km/h** ili više, ili je automobilu ostalo manje od pola brzine. Inače je **pogodak**: udarac, grebanje uz zid.
- **Smjer**: uzdužno ubrzanje veće od bočnog i negativno: *čeono*; pozitivno: *straga*; bočno veće: *uz bok*. Bez ubrzanja, čeono.

Ono što automobil može mjeri se bez svih udara, od 0,1 s prije njih do 1 s nakon (`struckMask`).

## Tekstovi {#the-texts}

Svaki događaj se opisuje navodeći oba kruga, gdje je (metri duž reference), brzinu na početku, koliko je iznad granice naspram drugog kruga, i savjet. Savjet proizlazi iz vrste i onoga što je izmjereno:

| Događaj | Savjet |
|---|---|
| blokiranje, samo prednji | zaključan prednji kotač ne može skretati: manje pritiska na vrhu zone, ispustite ga u zavoj |
| blokiranje, samo stražnji | zaključan stražnji kotač pušta automobil da se okrene: jače kočite ravno, popustite pri ulasku u zavoj; pomaknite raspodjelu kočenja naprijed ako se to ponavlja |
| blokiranje, rahla podloga | zaključan kotač ore: stisnite do tik ispred blokiranja |
| blokiranje, inače | previše pedale za prianjanje: stišćite postupnije |
| proklizavanje kotača | dodajte gas dok se upravljanje odmata; kratko mijenjajte kad je vuča ograničena (na rahloj podlozi: viši stupanj smanjuje okretni moment) |
| okret / preupravljanje | prema pedali: pod kočnicom (preveliko kočenje u zavoju, prerano ručno mijenjanje u niži stupanj), otpušten gas (preupravljanje pri otpuštanju gasa: držite stalan gas), na gasu (previše dok je još okrenut), nijedno (u zavoj ušli prebrzo); "uhvaćeno suprotnim upravljanjem" kad je protuupravljano; na rahloj podlozi ili u reliju, "neki kut je brz način da se prođe, kut drugog vožnje bio je dovoljan" |
| podupravljanje | više upravljanja ne pomaže kad je prednji dio već otišao: uđite sporije, malo zadržite kočnicu da opteretite prednji dio, odmotajte; na rahloj podlozi, okrenite automobil otpuštanjem gasa ili lakim dodirom lijeve noge |
| pogodak / pad | uz bok: metar margine košta manje od grebanja; straga: drugi automobil ili klizanje unatrag; čeoni pad: kočite ranije; udarac sprijeda: nešto ste okrznuli. "X je također tu udario." kad je zajednički |

U Trackmaniji klizanje također kaže: ispod oko **400 km/h** (**300** na rahloj podlozi: zemlja, trava, plastika) klizanje daje manje pogona nego hvatanje. Iznad toga speedslide pod pravim kutom dobiva, a ovaj je koštao vremena jer mu je kut bio kriv.

## Što svaki izvor dopušta {#what-each-source-allows}

| Krugovi sadrže | Blokiranja / proklizavanje | Preupravljanje / okret | Podupravljanje |
|---|---|---|---|
| klizanje svakog kotača i kut klizanja, brzinu automobila (Forza Data Out, igre AC) | iz klizanja | iz kuta drifta, ili iz stražnjeg kuta klizanja | iz kutova klizanja |
| brzine kotača, brzinu u svijetu (reli igre, BeamNG) | iz izvedenog klizanja | iz izvedenog kuta drifta | iz upravljanja po zakrivljenosti |
| zakret i brzinu zakreta, bez klizanja (iRacing) | - | iz kuta drifta (zakret prilagođen naspram smjera kretanja); iz brzine stava s protuupravljanjem samo kad se zakretu ne može vjerovati | iz upravljanja po zakrivljenosti |
| samo smjer | - | iz smjera naspram kretanja | iz upravljanja po zakrivljenosti |
| sama datoteka kruga FH Companion (bez zakreta, bez klizanja) | - | - | iz upravljanja po zakrivljenosti (ima upravljanje i ubrzanja) |

Udari i padovi trebaju samo brzinu (bolje s ubrzanjima), pa svaki izvor ih ima. Odjeljak **Kontrola automobila** pokazuje što koji izvor dopušta: uz samu datoteku kruga FH Companion, guranja iz upravljanja i pogodci, te napomenu da se za ostalo učita `.tele.gz`.
