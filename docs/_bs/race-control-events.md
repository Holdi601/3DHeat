---
title: "Događaji upravljanja automobilom"
parent: "Analiza utrke"
nav_order: 54
lang: "bs"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Događaji kontrole automobila

Gledalac prati kako je svaki krug vožen i označava mjesta gdje je vozač naveo automobil da kliže, proklizava, udari nešto ili gubi prijanjanje. Ovo je korisno, jer je greška koja je koštala vremena najbrže popraviti.

![Odjeljak Kontrola automobila: koliko je često svaki krug blokirao točak, proklizao ili izašao široko, i spisak grešaka s jednom otvorenom](../assets/img/en/race-control-table.webp)

## Jednostavnim riječima {#in-plain-words}

- **Blokada**: kočite toliko jako da se točak prestane okretati i kliže. Automobil tada slabije koči i ne može da skreće.
- **Proklizavanje točkova**: gas pritisnete toliko jako da se pogonski točkovi okreću brže nego što se automobil kreće. Gubite vuču.
- **Preupravljanje**: zadnji dio automobila kliže široko. Ako se okrene do kraja, to je **zanošenje**.
- **Podupravljanje**: prednji dio automobila kliže široko („gura se"); okretanje volana više ne pomaže.
- **Pogodak** i **pad**: automobil je nešto dotakao (pogodak je udarac ili grebanje, pad je jak udarac).
- **ABS**, **TC**: pomoćni sistemi automobila koji rade protiv blokade i proklizavanja. Oni nisu greške.

## Odjeljak Kontrola automobila (šta vidite) {#the-car-control-section-what-you-see}

Za izabrani krug, s obzirom na to šta krugovi nose - bez klizanja guma i bez ugla drifta prikazuje se ono što se još može pronaći, a ne ništa (ispod).

**Tabela**: jedan red za svaku vrstu koju pokazuje bilo koji od dva kruga - Blokirani točkovi, Proklizavanje točkova, Zanošenje zadnjeg kraja (preupravljanje i zanošenja), Guranje prema van, Sudari, Udarci, ABS djeluje, Kontrola proklizavanja djeluje, Ručna kočnica, U zraku. Svaka ćelija je „broj · sekunde", za izabrani krug i krug s kojim se poredi. Tu je i *Najveći ugao drifta* kad postoji ugao drifta (najveći na tlu).

**Spisak**: njegove neskupljene greške koje koštaju najmanje 0,02 s, od najskupljih, najviše 12, svaka s naslovom i cijenom (i čipom svoje vrste). Kliknite jednu da pročitate savjet, poravnate automobile 40 m prije nje i pustite je ponovo. **Također šta su oba kruga tu radila** dodaje svaku grešku, uključujući zajedničke (čip „oba su to uradila", cijena „—" ispod 0,01 s). Kad nema ničega: „Ništa što je X radio s gumama nije ga koštalo vremena, a da to nije radio i Y."

**Napomena ispod** kaže čime je detekcija mogla da vidi - „Iz proklizavanja i ugla klizanja svakog točka, i ugla drifta automobila." (ili proklizavanje i ugao klizanja, proklizavanje i ugao drifta, samo proklizavanje, ili „Samo iz ugla drifta automobila - ovi krugovi ne nose klizanje guma.") - zatim podlogu za koju su granice izmjerene (asfalt, rastresita, mješovita: iznad 80% uzoraka rastresitih je rastresita, ispod 20% asfalt), s kojim krugom su događaji upoređeni i kako se računa cijena.

Bez **klizanja guma i bez ugla drifta** (datoteka kruga FH Companion bez njene telemetrije) tabela i spisak se ipak prikazuju, a napomena kaže šta je ipak pronađeno iz onoga što krugovi nose: „Ovi krugovi ne nose klizanje guma ni ugao drifta, pa se blokade i proklizavanje ne mogu odrediti. Ipak se nalazi: guranja, iz upravljanja nasuprot putanji; udarci i padovi, iz brzine i ubrzanja." Klizanja iz brzine skretanja također se imenuju tamo gdje krugovi imaju tu brzinu, a guranja samo tamo gdje imaju upravljanje. Rečenica o granicama klizanja i drifta se izostavlja, a druga napomena kaže: „Za Forza Horizon izaberite i datoteku `.tele.gz` uz svaki krug FH Companion: to je puna telemetrija, klizanje svakog točka 64 puta u sekundi."

**Ukupna** cijena kontrole kruga (koristi se u sažetcima) računa preklapajuće greške - blokadu i klizanje koje ona pokrene, unutar 40 m - jednom, po najskupljoj u grupi.

## Kako se otkriva {#how-it-is-detected}

Ostatak ove stranice je pravilnik: svaka vrsta, svaki prag.

Kod: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Razlozi i literatura su u [metodi](race-analytics.md).

## Vrste {#the-kinds}

| Vrsta | Red u tabeli | Greška? | Najkraće što se računa |
|---|---|---|---|
| `lock` | Blokirani točkovi | da | 0,1 s |
| `wheelspin` | Proklizavanje točkova | da | 0,15 s |
| `oversteer` | Zanošenje zadnjeg kraja | da | 0,2 s |
| `spin` | (računa se uz Zanošenje zadnjeg kraja) | da | 0,1 s |
| `understeer` | Guranje prema van | da | 0,25 s |
| `crash` | Sudari | da | - |
| `hit` | Udarci | da | - |
| `abs` | ABS djeluje | ne | 0,2 s |
| `tc` | Kontrola proklizavanja djeluje | ne | 0,2 s |
| `handbrake` | Ručna kočnica | ne | 0,1 s |
| `airborne` | U zraku | ne | 0,15 s |

Kraći nizovi su šum (ivičnjak, neravnina, jedan uzorak). Nizovi tačaka mreže (svaka 2 m) koje prođu test spajaju se preko praznina do 2 tačke. Samo **greške** mogu biti pogreške i nose cijenu; ostalo je ono što su automobil i vozač radili.

## Šta svaki test treba {#what-every-test-needs}

### Izvedeni kanali {#derived-channels}

Prije nego što se bilo šta ocijeni, svaki krug dobija ono što njegova igra ne šalje, pod kanonskim imenima (vrijednost same igre uvijek pobjeđuje):

| Kanal | Iz |
|---|---|
| `bodySlip` (ugao drifta) | brzina u koordinatnom sistemu automobila, `atan2(latVel, abs(longVel))`, gdje je igra šalje (0 ispod 3 m/s); inače smjer automobila (yaw igre, prilagođen smjeru kretanja po predznaku i pomaku nad uzorcima bržim od 10 m/s, prihvaćen samo uz kružnu varijansu ispod 0,05) naspram smjera kretanja (pozicije udaljene najmanje 2 m), pri brzinama iznad 3 m/s |
| `yawRate` | promjena `yaw` tokom vremena, gdje postoji smjer ali nema brzine |
| `airborne` | kontakt svakog točka sa tlom isključen (≤ 0,5); inače opterećenje svakog točka ispod 5% njegove medijane; inače hod svakog ovjesa na 0,02 ili manje (potpuno ispružen). Jedan slučajan uzorak nije let |
| `slipRatio.<W>` | `(brzina površine točka - brzina automobila) / brzina automobila` iznad 3 m/s, gdje igra šalje brzine površine točkova; ili iz rotacije točka × poluprečnika kotrljanja izmjerenog na krugu - medijana `speed / rotation` dok se vozi ravno bez gasa (brzina > 10 m/s, gas < 0,3, kočnica < 0,05, abs(uzdužno ubrzanje) < 3 m/s², ne u zraku; svaki uzorak iznad 10 m/s kad ih je manje od 20), prihvaćeno između 0,1 i 1 m. Označeno sa `physical` |
| `loose` | Forzina vibracija podloge na najmanje 2 točka (> 0,001) najmanje 0,33 s (ivičnjak je kraći), praznine kraće od 1 s premoštene |

### Na tlu i smireno {#on-the-ground-and-settled}

Ništa se ne ocjenjuje u zraku ili **0,3 s nakon slijetanja** - ovjes se potpuno sabije i ubrzanja naglo skoče, što nije prijanjanje, kočenje ni pogon. Uzorak također mora da se **kreće**: brži od 5 m/s.

### Podloga {#the-ground}

Podloga svakog uzorka je **rastresita** gdje kanal `loose` kruga tako kaže (Forzina vibracija podloge, materijali točkova u Trackmaniji), inače površina kruga (vidi [disciplina i podloga](race-loading-laps.md#discipline-and-surface)): asfalt, ili rastresita za sve ostalo. Krive, navike drifta i pragovi se čuvaju odvojeno za asfalt i rastresitu podlogu.

### Klizanje, kao umnožak nominalnog vrha gume {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Igre različito skaliraju klizanje; `meta.slip` kaže kako, i svako klizanje se dijeli skalom tako da je oko 1 nominalni vrh gume:

| `meta.slip` | Značenje | Dijeli se sa |
|---|---|---|
| `peak` | normalizuje igra: iznad 1 prijanjanje se gubi (Forza Data Out) | 1 |
| `scaled` | fizičko klizanje podijeljeno vrhom za asfalt (Kunos snimač) | nominalni vrh podloge podijeljen onim za asfalt |
| `index` | mjera klizanja 0..1 (SlipCoef u Trackmaniji) | 0,5 |
| `physical` (ili nepoznato) | odnos klizanja kao razlomak, ugao klizanja u radijanima | nominalni vrh podloge |

Nominalni vrhovi, kad ništa bolje nije poznato:

| Podloga | Odnos klizanja | Ugao klizanja |
|---|---|---|
| asfalt | 0,12 | 8° |
| mješovita | 0,18 | 12° |
| rastresita (šljunak) | 0,25 | 15° |
| snijeg | 0,25 | 15° |
| led | 0,10 | 6° |

### Gdje prijanjanje prestaje: krive guma svakog automobila {#where-grip-ends-each-cars-tyre-curves}

Gdje guma prestaje da daje više mjeri se **za svaki automobil**, iz svakog opterećenog kruga (`measureTyres`), odvojeno za asfalt i rastresitu podlogu:

| Kriva | Uzorci (brzina > 10 m/s, smireno, ubrzanja ispod 45 m/s²) | Klizanje (x) | Sila (y) |
|---|---|---|---|
| kočenje | kočnica > 0,3, ručna kočnica ≤ 0,2, vožnja ravno (bočno ispod 30% najtvrđeg) | abs(prosječni odnos klizanja četiri točka) | usporenje |
| vuča | gas > 0,8, kočnica ≤ 0,05, ravno, puni pogon automobila pri toj brzini > 0,5 m/s² | najveći odnos klizanja pogonskog točka | ubrzanje kao udio tog pogona |
| prednja | bočno preko 30% najtvrđeg, prijanjanje automobila pri toj brzini > 1 m/s² | veći prednji ugao klizanja | bočno ubrzanje kao udio tog prijanjanja |
| zadnja | isto | veći zadnji ugao klizanja | isto |

„Najtvrđe" je 99. percentil apsolutnog bočnog ubrzanja kruga na toj podlozi (cijela podloga kad ima manje od 50 uzoraka). Pogon određuje pogonske točkove (prednji pogon - prednji, zadnji pogon - zadnji, pogon na sva četiri - svi; nepoznato: svi).

Od najmanje **150 uzoraka** klizanje se dijeli na 6 do 14 jednako brojnih pregrada (jedna na svakih 40 uzoraka). Sila svake pregrade je njen gornji kvartil (ono što je guma davala kad je vozač tražio), zaglađen preko susjednih pregrada. **Najbolja** je pregrada s najviše sile; **granica** je prva pregrada poslije nje gdje je sila pala za **8%**. Kriva koja u podacima nikad ne pada nema granicu (beskonačna) - prelazak „vrha" u toj igri ne košta ništa, a samo klizanje tu ništa ne označava (krive skretanja i vuče u Forza Horizonu su takve). Kad je premalo uzoraka na jednoj podlozi, koriste se one s druge; kad je premalo uopšte, **nominalna** granica: 1,5 puta nominalni vrh.

Svaki automobil dobija i:

- svoju **naviku drifta**: gornji kvartil njegovog ugla drifta svuda gdje skreće na 60% ili više od svog najtvrđeg (treba 100 uzoraka);
- svoje **upravljanje po zakrivljenosti** (`steerGain`), po pojasu brzine od 5 m/s: medijana abs(upravljanje) / zakrivljenost putanje dok čvrsto skreće ali dobro unutar svog prijanjanja (30-60% njegovog najtvrđeg, zakrivljenost uža od radijusa 400 m, upravljanje iznad 0,02; 25 uzoraka po pojasu). Zakrivljenost putanje je brzina skretanja kroz brzinu tamo gdje igra šalje brzinu skretanja, inače iz pozicija ±5 m.

## Otkrivanje, vrsta po vrsta {#detection-kind-by-kind}

| Vrsta | Test (na pokretnim, smirenim uzorcima) | `peak` i `limit` |
|---|---|---|
| **lock** | kočnica > 0,05, ručna kočnica ne iznad 0,2, i odnos klizanja nekog točka ispod negativne granice kočenja | najnegativnije klizanje (umnošci nominalnog vrha); granica kao negativna |
| **wheelspin** | gas > 0,2 (ili nema kanala gasa), i odnos klizanja pogonskog točka iznad granice vuče | najveće pogonsko klizanje; granica |
| **oversteer** (ugao drifta) | ugao drifta iznad većeg od poda podloge i 1,5 × navike drifta automobila tamo | najveći ugao drifta, radijani |
| **oversteer** (uglovi klizanja, bez ugla drifta) | veći zadnji ugao klizanja iznad zadnje granice i više od 0,25 iznad većeg prednjeg | zadnji ugao klizanja (umnošci vrha) |
| **oversteer** (bez ugla drifta, ali sa brzinom skretanja i bočnim ubrzanjem) | „brzina položaja" - abs(brzina skretanja) minus abs(bočno ubrzanje) / brzina, iznad 8 m/s - preko 0,2 rad/s, s upravljanjem suprotno zavoju | rad/s; granica 0,2 |
| **spin** | preupravljanje čiji je ugao drifta prešao **60°** | kao preupravljanje |
| **understeer** (uglovi klizanja) | ne kliže, veći prednji ugao klizanja iznad prednje granice i više od 0,3 iznad zadnjeg | prednji ugao klizanja; granica |
| **understeer** (bez uglova klizanja) | brže od 12 m/s, ne kliže, ne kontra-upravlja, bočno ubrzanje iznad polovine najtvrđeg kruga (99. percentil), putanja uža od radijusa 300 m, i upravljanje više od **1,6 puta** onoga što vlastito upravljanje po zakrivljenosti automobila kaže da je putanja tražila | puta potrebno upravljanje; granica 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` iznad 0,5 | - |
| **handbrake** | `handbrake` iznad 0,2 | - |
| **airborne** | `airborne` iznad 0,5 | - |
| **hit**, **crash** | vidi [Udarci i padovi](#hits-and-crashes) | brzina koju je udarac oduzeo |

Donje granice ugla drifta po podlozi: asfalt **7°**, mješovita **10°**, rastresita i snijeg **15°**, led **10°**. Prate literaturu: ugao klizanja gume dostiže vrhunac na 3–10° na asfaltu, granica stabilnosti putničkog automobila po uglu klizanja karoserije je oko 12° na suhom asfaltu, dok se reli i drift voze na 30–50° ([Analitika utrka, izvori](race-analytics.md#sources)). Automobil koji se po pravilu više kreće - arkadni model guma, specijalista za šljunak - ima vlastiti, viši prag iz vlastitih krugova (1,5 × njegova navika).

**Na koju stranu automobil skreće** (za „suprotno zavoju"): promjena smjera vlastite putanje kruga preko ±6 m (najmanje 2 tačke mreže); uža od radijusa 600 m računa se kao skretanje; desno ili lijevo, zavisno od toga je li svijet zrcaljen. Upravljanje je **suprotno** zavoju kad je abs(upravljanje) > 0,05 i predznak mu je suprotan zavoju - klizanje koje se **hvata** suprotnim upravljanjem.

**Pedale kako je počelo** (`pedal`): *kočenje* kad je kočnica iznad 0,1; *gas* iznad 0,3; *otpušten* kad je gas bio iznad 0,5 unutar 8 tačaka mreže (16 m) prije; *kotrljanje* inače (ili bez kanala gasa).

## Poređeno s drugim krugom {#laid-against-the-other-lap}

Svaki događaj se ocjenjuje u odnosu na krug s kojim se izabrani krug poredi u tom dijelu (najbolji iz svoje klase; za sam taj krug, onaj iz njegove klase koji je najbrže prošao dio):

1. **Koliko je daleko drugi krug išao** na istim metrima, ±8 m: vlastiti događaji drugog kruga iste porodice (zanošenje se računa kao preupravljanje, pad kao udarac) mjereni u istim jedinicama, bez pragova, uz krive guma drugog automobila.
2. **Zajednička** kad je drugi krug išao **80%** toliko daleko ili dalje: tako se zavoj vozi, a ne greška. Vrste koje nisu greške su uvijek „zajedničke".
3. **Cijena**, za nezajedničku grešku: vrijeme koje je ovaj krug izgubio u odnosu na drugi, od 5 m prije događaja do **40 m poslije** njega (za udarac ili pad, dok automobil ne vrati brzinu - metri da je vrati pri vlastitom pogonu, 40 do 400 m; bez izmjerenog pogona, 5 m/s²). Nikad negativna.
4. **Brzina poklonjena** do granice automobila: za blokadu, usporenje koje automobil pokazuje da može na toj brzini minus ono što je uradio, zbrojeno kroz događaj; za proklizavanje, njegov puni pogon minus ono što je uradio; za udarac, brzina koju je odnio. Navodi se kad je iznad 0,5 m/s (1,8 km/h).

Greška koja nije zajednička i koja košta najmanje **0,02 s** navodi se ([statistika staze](race-course-statistics.md) broji samo greške od **0,03 s** ili više, tako da greška izbrojana kroz mnogo krugova bude jasna), i može postati uzrok gubitka zavoja (vidi [Analiza zavoj po zavoj](race-corner-analysis.md#car-control-faults-and-impacts)).

## Udarci i padovi {#hits-and-crashes}

`impacts.ts` čita udarce iz **vlastitih uzoraka** kruga, prije nego što se ponovo uzorkuju - udarac je gotov za stotinke sekunde. Gume ne mogu da stvore sile udarca, pa se udarac mjeri u odnosu na sam automobil kruga:

- **Njegovo prijanjanje `G`**: 99. percentil njegovog horizontalnog ubrzanja `√(lat² + long²)` preko kruga, na tlu i brže od 5 m/s. Bez kanala ubrzanja (ili ispod 3 m/s²), 15 m/s² - prijanjanje cestovnog automobila.
- **Prag**: `max(1.8 G, G + 18, 30)` m/s².
- **Uzorak udarca**: horizontalno ubrzanje iznad praga *i* skok veći od polovine `G` u odnosu na prethodni uzorak; **ili** pad brzine, unutar 0,1 s, za više nego što bi prag oduzeo u 0,1 s plus 1,5 m/s. Samo na tlu i smireno, i samo kad je automobil bio brži od 5 m/s.
- Uzorci udarca unutar **0,4 s** su jedan udarac.
- **Prije / poslije**: najveća brzina u 0,15 s prije; najniža do 0,3 s poslije posljednjeg uzorka udarca.
- **Nije udarac**: brzina nestala bez sile iza nje - najveće horizontalno ubrzanje unutar 0,1 s ispod većeg od `G` i 25 m/s² - znači da igra vraća unazad ili resetuje automobil.
- **Pad** kad je oduzeo **30 km/h** ili više, ili ostavio automobil ispod polovine njegove brzine; inače **udarac** - lupanje, grebanje duž zida.
- **Smjer**: uzdužno ubrzanje veće od bočnog i negativno: *čeono*; pozitivno: *otpozadi*; bočno veće: *duž boka*. Bez ubrzanja, čeono.

Šta automobil može mjeri se bez ijednog udarca, od 0,1 s prije njega do 1 s poslije (`struckMask`).

## Tekstovi {#the-texts}

Svaki događaj se opisuje imenujući oba kruga, s mjestom (metri duž reference), brzinom na početku, koliko je iznad granice u odnosu na drugi krug, i savjetom. Savjet proizlazi iz vrste i onoga što je izmjereno:

| Događaj | Savjet |
|---|---|
| blokada, samo prednji | zaključan prednji točak ne može da skreće: manje pritiska na početku zone, popustite kočnicu ulazeći u zavoj |
| blokada, samo zadnji | zaključan zadnji točak dozvoljava automobilu da se okreće: više kočite pravo, popustite pri ulasku u zavoj; pomjerite raspodjelu kočenja naprijed ako se ponavlja |
| blokada, rastresita podloga | zaključan točak ore dalje: stišćite do tačke tik prije blokiranja |
| blokada, inače | previše pedale za prijanjanje: stišćite postepenije |
| proklizavanje točkova | dodajte gas kako se upravljanje odmotava, rano mijenjajte gdje je vuča ograničena (na rastresitoj podlozi: viša brzina smanjuje obrtni moment) |
| zanošenje / preupravljanje | prema pedali: pod kočnicom (preveliko kočenje u zavoju, prerano spuštanje brzine), otpušten (preupravljanje pri otpuštanju gasa: držite stalan gas), na gasu (previše dok je još okrenut), ni jedno (uvučen prebrzo); „uhvaćen suprotnim upravljanjem" kad se kontra-upravljalo; na rastresitoj podlozi ili u reliju, „neki ugao je brz način da se prođe - druga vožnja je bila dovoljna" |
| podupravljanje | više upravljanja ne pomaže kad je prednji dio otišao: uđite sporije, blago držite kočnicu da opteretite prednji dio, odmotajte; na rastresitoj podlozi, skrenite automobil otpuštanjem gasa ili lijevom nogom |
| udarac / pad | duž boka: metar margine košta manje od grebanja; otpozadi: drugi automobil ili klizanje unazad; pad čeono: kočite ranije; udarac u prednjem dijelu: nešto ste zakačili. „X je tu također udario." kad je zajednički |

U Trackmaniji, klizanje također kaže: ispod oko **400 km/h** (**300** na rastresitoj podlozi: zemlja, trava, plastika) klizanje daje manje pogona nego prijanjanje; iznad, brzo klizanje pod pravim uglom dobija, a ovo je koštalo vremena pa mu je ugao bio pogrešan.

## Šta svaki izvor dozvoljava {#what-each-source-allows}

| Krugovi nose | Blokade / proklizavanje | Preupravljanje / zanošenje | Podupravljanje |
|---|---|---|---|
| odnos klizanja i ugao klizanja po točku, brzina automobila (Forza Data Out, igre AC) | iz klizanja | iz ugla drifta, ili zadnjeg ugla klizanja | iz uglova klizanja |
| brzine točkova, brzina u svijetu (rally igre, BeamNG) | iz izvedenog klizanja | iz izvedenog ugla drifta | iz upravljanja po zakrivljenosti |
| skretanje i brzina skretanja, bez klizanja (iRacing) | - | iz ugla drifta (prilagođeni yaw naspram smjera kretanja); iz brzine položaja uz kontra-upravljanje samo kad se yaw ne može pouzdati | iz upravljanja po zakrivljenosti |
| samo smjer | - | iz smjera naspram kretanja | iz upravljanja po zakrivljenosti |
| sama datoteka kruga FH Companion (bez yaw-a, bez klizanja) | - | - | iz upravljanja po zakrivljenosti (ima upravljanje i ubrzanja) |

Udarci i padovi trebaju samo brzinu (bolje uz ubrzanja), pa ih ima svaki izvor. Odjeljak **Kontrola automobila** pokazuje šta koji izvor dozvoljava: sama datoteka kruga FH Companion daje njegova guranja iz upravljanja i udarce, uz napomenu da se za ostalo učita `.tele.gz`.
