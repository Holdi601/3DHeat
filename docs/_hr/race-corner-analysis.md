---
title: "Analiza zavoj po zavoj"
parent: "Analiza utrke"
nav_order: 55
lang: "hr"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiza zavoj po zavoj

Dva kruga iste staze uspoređuju se zavoj po zavoj. Za svaki zavoj preglednik kaže tko je bio brži, koliko je vremena vrijedio i zašto - prerano kočeno, kasno na snazi, uzeta šira linija - da znate što prvo vježbati.

![Nalaz otvoren u Gdje napredovati, uz tablicu Zavoj po zavoj](../assets/img/en/race-corner-finding.webp)

Primjer: u zavoju 3, Driver A koči 20 m ranije od Drivera B i na to izgubi 0,15 s, ali ranije dodaje gas i na izlasku dobije 0,15 s. Neto 0,00 s: zavoj je izjednačen, i nikome se ne govori da koči kasnije.

## Što vidite {#what-you-see}

### Gdje napredovati {#where-to-improve}

Odjeljak bočne trake za usredotočeni krug (dok ga nema, piše „Učitajte najmanje dva kruga jedne staze.”).

**Zaglavlje:** „<krug> <vrijeme> u odnosu na <referenca> <vrijeme>” i razlika u vremenu kruga - ili, za referencu, „u odnosu na najbrži drugi krug kroz svaki zavoj (…)” i ukupno koliko je izgubljeno. Uz to, gubitak raščlanjen na *vožnju* i *automobil / kontekst*.

**Traka raščlambe:** izgubljeno vrijeme po grupi uzroka (kočenje, ulaz, izlaz, ravnina, automobil, kontekst), u bojama uzroka, s legendom.

**Nalazi**, tri popisa:

1. Gubici vožnje, od najskupljeg, najviše **12** - ili „Nigdje se ne ističe mjesto gdje bi drukčija vožnja donijela vrijeme.”
2. **Prikaži što su koštali automobil ili situacija (X s)** - gubici automobila i konteksta, najviše 8 (uključeno prema zadanom).
3. **Gdje je <krug> brži ili izjednačen na drugi način (N)** - dobici i izjednačeni zavoji, najviše 10 (uključeno prema zadanom).

Svaki nalaz pokazuje svoj redni broj, naslov (zavoj i što se dogodilo, uz cijenu za gubitak), redak s ocjenom, cijenu (dobici s minusom) s trakom i oznaku: *kočenje*, *ulaz*, *izlaz*, *ravnina* (gubici vožnje, uz „ · automobil X” kad automobil objašnjava 0,02 s ili više), *automobil*, *kontekst*, *brži*, *izjednačeno*. **Kliknite nalaz** da poravnate automobile 40 m prije njega, uokvirite ga i reproducirate, te otvorite njegova mjerenja:

- **Kočenje:** gdje je svaki kočio (ili podigao gas) i s koje brzine, te koliko metara ranije ili kasnije (od 5 m);
- **Najsporije:** najmanja brzina svakog kruga i gdje;
- **Pun gas:** gdje je svaki bio na punom gasu, i koliko ranije ili kasnije;
- **Linija:** razlika pri ulasku u zavoj, najuži polumjeri, koliko je unutra ili vani, te oblik linije i apeks svakog kruga;
- **Ravnina do sljedećeg zavoja:** njezina duljina, obje brzine gdje su oba bila ravna, što je izgubljeno ili dobiveno i od čega - početna brzina, jača vuča drugoga, podizanje gasa, pokupljena brzina, kako je vožena (dijelovi od 0,02 s);
- **Automobil:** koliki je dio gubitka automobil i čime (vuča, prionljivost, kočnice; kad je 0,02 s ili više);

zatim napomena, **Automobili:** (u različitim automobilima, vidi [Profili automobila](race-car-profiles.md#what-the-cars-decide-in-a-corner)) i savjet o liniji.

### Zavoj po zavoj {#corner-by-corner}

Tablica (uz dva ili više krugova), jedan redak po dionici, za usredotočeni krug, po klasi kad ima više klasa:

| Stupac | Prikazuje |
|---|---|
| Zavoj | `T3`, `T11-T12` |
| Najbrži | krug najbrži kroz njega (njegovo vlastito vrijeme od početka do kraja dionice) |
| razlika | njegova prednost nad drugim najbržim, s |
| linija | oblik i apeks najbržeg kruga („V · kasni”, „U/V · sredina”); pokažite mišem za njegove najuže, ulazne i izlazne polumjere; „oba smjera” za mješoviti kompleks |
| (usredotočeni krug) | koliko je zaostajao za najbržim, ili ✓ kad je bio najbrži |

Klik na redak otvara nalaz usredotočenog kruga na tom mjestu (ili poravnava automobile 40 m prije dionice). Ispod tablice, kad svaki zavoj ima vrijeme: „Najbrže kroz svaki zavoj, složeno zajedno: <vrijeme> (± na referenci / na najboljem iz klase X)” - najbolje dionice plus najbrža vožnja do prvog zavoja kad je to njezin vlastiti dio staze.

## Kako se računa {#how-it-is-worked-out}

Vodeće pravilo: **zavoj se ocjenjuje cjelovito**, od zone kočenja za njega do zone kočenja za sljedeći. Krug koji ranije koči da bi automobil ranije okrenuo i ranije došao na snagu dobiva zasluge za izlaz koji je tako kupio, a ne savjet da koči kasnije.

## Jedna os udaljenosti {#one-distance-axis}

Krugovi se uspoređuju po udaljenosti, a ne po vremenu - sekundu iza, dva kruga su na različitim zavojima. Ni po vlastitom brojaču kilometara (uža linija prelazi manje metara). Vožena putanja kruga **reference** je os:

- Uzorci svakog drugog kruga **projiciraju se** na putanju reference: svaki uzorak dobiva `s`, koliko je daleko duž reference, i `d`, koliko je ulijevo (pozitivno) ili udesno. Pretraga ide unaprijed od prethodnog podudaranja (od 8 segmenata putanje unatrag do 40 naprijed), pa krug koji se presijeca sam sa sobom nikad ne skoči na drugo križanje. Prvi uzorak traži se u prvoj četvrtini putanje (na stazi se početak i cilj podudaraju); kad ništa nije unutar 30 m, uzima se najbliža točka bilo gdje koja nije iza zadnjeg podudaranja (nakon okreta ili izlaska sa staze). `s` nikad ne opada: uzorak koji se projicira iza prethodnoga zadržava se.
- Svaki kanal se **preuzorkuje** na jednu mrežu, **svakih 2 m**, linearno; kanali koji skaču (mjenjač, zastave) uzimaju najbliži uzorak. Izvan vlastitog raspona kruga vrijednosti su prazne.
- Prvi i zadnji uzorak kruga projiciraju se malo unutar krajeva reference, pa se svaki krug **nosi do 15 m** iza svojih krajeva brzinom koju je imao (vrijeme raste po udaljenosti podijeljenoj s brzinom, ostalo se drži) - tako je njegova delta na liniji njegova razlika vremena kruga.
- `delta` = vrijeme kruga u svakoj točki mreže minus ono reference: razmak. `lateral` = `d` na mreži.

Vrijeme koje je jedan krug trajao duže od drugoga između dvije točke mreže je razlika njihovih delta: `rel(s)`. Sve u nastavku gradi se na tome.

## Zavoji {#corners}

Pronalaze se na **referenci** (`findCorners`), s brzinom izglađenom preko ±6 m i zakrivljenošću (promjena smjera preko ±5 uzoraka, izglađena preko ±10 m):

1. **Minimumi brzine s istaknutošću.** Točka koja je najniža unutar ±40 m, čiji je pad od najveće brzine s obje strane (prije nižeg minimuma) najmanje `max(2,5 m/s, 6% brzine)`.
2. **Prijelomi.** Lokalni vrh zakrivljenosti užeg od polumjera **300 m** bez minimuma brzine unutar 80 m: prijelom koji se vozi punim gasom i dalje je zavoj za vožnju.
3. **Faze.** Od svakog apeksa unatrag dok referenca koči (> 0,1) ili nije na punom gasu (< 0,95): ulazak; naprijed dok nije na punom gasu: izlazak. Prijelom vožen punim gasom dobiva ±30 m. Preklapajući se zavoji čuvaju odvojeno, ali se slažu tako da popločaju krug.
4. Numerirani T1, T2 … redom po krugu; **lijevo ili desno** po predznaku zakrivljenosti i tome je li svijet zrcaljen (nepoznato se računa kao zrcaljeno).

**Prozor zavoja** (gdje referenca skreće): od najuže točke unutar ±40 m od apeksa van, dok zakrivljenost ostaje iznad šestine svog vrhunca, plus 10 m s obje strane. Njegova strana daje predznak za „unutra”.

## Dionice: zona kočenja do zone kočenja {#segments-braking-zone-to-braking-zone}

Svaki zavoj posjeduje cestu do pola puta do apeksa s obje strane. U njoj:

- **Najsporija točka svakog kruga** je pravo udubljenje u njegovoj brzini - ništa sporije unutar 6 m (3 točke mreže) s obje strane, gledajući preko krajeva dionice, tako da izlaz prethodnog zavoja koji još ubrzava u njega nikad ne bude zamijenjen za nju - traži se od 15 m prije prozora zavoja do 10 m poslije njega. Krug koji tamo nikad nije usporio stavlja se na apeks.
- **Gdje je krug počeo usporavati za njega** (`entryOf`): unatrag od njegove najsporije točke kroz kočenje ili podizanje gasa, preko kratkih trzaja punog gasa, dok nije bio čvrsto na gasu (gas ≥ 0,95, kočnica ≤ 0,1) **10 m**; gas ponovno dodan u zadnjih **30 m** prije najsporije točke i dalje pripada zavoju; ako je sve vrijeme išao punim gasom, sama najsporija točka. Krug bez kanala za gas, ili koji od prethodnog zavoja nije bio na gasu, počinje na svojoj najbržoj točki između.
- **Dionica počinje** na prvom od svih krugova koji počnu usporavati za nju (4 m ranije), i traje do početka sljedeće, tako da je svako kočenje svakog kruga unutar nje i dionice popločaju krug.

**Kompleksi.** Uzastopni zavoji između kojih referenca nikad ne vozi punim gasom - manje od **40 m** punog gasa - jedna su dionica, „T11-T12”, vožena kao jedna; kompleks sadrži najviše **tri** krivine (kriviljasta dionica koja se nikad ne vozi ravno počinje novi). Kompleks koji skreće na obje strane zove se *mješovit*: za njega se ne mjeri nijedan oblik linije.

**Na stazi** (referenca završava unutar 50 m od mjesta gdje je počela), ravnina zadnje dionice nastavlja preko linije do prvog mjesta kočenja: vožnja letećeg kruga od linije ubraja se uz zadnji zavoj. Krug koji je počeo iz mirovanja ili na startu (vidi [Start](#the-start)) tu vožnju drži odvojeno.

### Na što zavoj vodi {#what-a-corner-leads-onto}

Mjereno na referenci: metri na punom gasu nakon zavoja (od njegova punog gasa do kraja dionice, plus vožnja preko linije) i prije njega (»nakon« prethodne dionice, ili od početka).

| Vrsta | Pravilo |
|---|---|
| **između dvije ravnine** (`both`) | 200 m ili više prije **i** 120 m ili više poslije |
| **na ravninu** | 200 m ili više poslije, ili 120 m ili više poslije i barem onoliko koliko prije |
| **poslije ravnine** | 200 m ili više prije |
| **veza** | sve ostalo |

## Što je svaki krug radio u zavoju {#what-each-lap-did-in-a-corner}

`cornerMetrics`, po krugu i dionici, na mreži (korak 2 m). Pedale: kočenje se broji iznad 0,1, puni gas je 0,95 i više.

| Mjera | Pravilo |
|---|---|
| **točka kočenja** | prvo kočenje pod kojim je gas otpušten (ispod 0,5), ili ono koje je trajalo **15 m** - dodir lijeve noge uz uključenu snagu nije mjesto gdje je kočenje počelo; kad ima samo dodira, prvi dodir |
| **podignut** | bez kočenja, prva točka u kojoj je gas pao ispod 0,8 |
| (bez pedala) | točka u kojoj je krug počeo usporavati (gore) |
| **otpuštanje kočnice** | zadnje kočenje do 30 m poslije najsporije točke |
| **brzina na točki kočenja**, **metri kočenja** | do najsporije točke |
| **najveće kočenje**, **najveće usporavanje** | preko zone kočenja (ubrzanja iznad 45 m/s² se zanemaruju) |
| **kočenje u zavoju** (trail braking) | metri s kočnicom > 0,05 i \|upravljanjem\| > 0,1 |
| **blokada klizanja** | najnegativniji omjer klizanja kotača u zoni (kad krug ima klizanje) |
| **najsporija točka**, **najmanja brzina** | kao gore |
| **gas uključen** | nakon otpuštanja (ili najsporije točke), prvi gas > 0,15 bez kočnice |
| **pun gas** | prva točka poslije koja je držana na ≥ 0,95 za 10 m |
| **kotrljanje** (coasting) | metri od otpuštanja do uključenog gasa, s kočnicom i gasom oba ispod 0,05 |
| **padovi gasa** | koliko je puta gas pao više od 0,25 ispod svog tekućeg vrha između uključenog gasa i punog gasa |
| **bočno najveće** (peak lateral) | najveće bočno ubrzanje od 20 m prije otpuštanja do kasnijeg od punog gasa i 20 m poslije najsporije točke |
| **mjenjač u apeksu** | u najsporijoj točki |
| **klizanje pogona** (spin slip) | najveći omjer klizanja pogonskih kotača između uključenog gasa i punog gasa |
| **ravnoteža** | prednji minus stražnji kut klizanja kroz sredinu (+ podupravljivost) |
| **ravnina na punom gasu** | udio dionice poslije punog gasa (i vožnje preko linije) na ≥ 0,95; najduže podizanje na njoj |
| **izgubljena brzina** (speed scrubbed) | najveći gubitak brzine od visoke točke s gasom ≥ 0,9, bez kočnice, na tlu |
| **ulazni drift** (entry drift) | najveći kut driftanja od točke kočenja do 5 m poslije najsporije točke, na tlu |
| **ručna kočnica** (handbrake) | gdje je uključena (> 0,2), do 10 m poslije najsporije točke |
| **zrak** | sekunde u zraku preko dionice, i njegov najduži let |

## S kojim se krugom svaki krug uspoređuje {#who-each-lap-is-compared-with}

- Krug se uspoređuje s **najbržim cjelovitim krugom vlastite klase performansi** (referencom, u klasi reference).
- Taj najbolji krug klase (i referenca) uspoređuje se, dionicu po dionicu, s **onim drugim krugom svoje klase koji je bio najbrži** kroz nju - ili s bilo kojim krugom, kad je sam u svojoj klasi.

Karta vremena, razmaci u popisu krugova, događaji kontrole automobila i tablica zavoja slijede istu usporedbu.

## Vremenski obračun zavoja {#the-time-account-of-a-corner}

`compareCorner`, za jedan krug naspram drugog preko dionice:

- **neto** = `rel(kraj) - rel(početak)` (uz vožnju preko linije na letećem krugu): ocjena. Bliže od **0,03 s** je **izjednačeno**.
- **Raščlamba** - gdje je unutar zavoja vodeći krug okrenuo: na dijelu od prve točke kočenja ili najsporije točke bilo kojeg od krugova do kasnijeg od njihovih punih gasova i najsporijih točaka, najveće kolebanje koje je krug tada vratio ili povratio, kad je to kolebanje preko **0,04 s**; inače kasnija od dviju najsporijih točaka.
- **Do apeksa** = `rel(raščlamba) - rel(početak)`; **poslije njega** = neto minus to. Kad su oba barem 0,04 s i suprotnog predznaka, krug je jedno **zamijenio** za drugo.
- **Poslije njega** se opet dijeli tamo gdje su oba na punom gasu: **izlaz** (od raščlambe do kasnijeg punog gasa) i **ravnina** (od tamo do kraja).
- **Ravnina** se dijeli na tri dijela:
  - *brzina na izlazu* (`byExit`) - izmjerena, ne modelirana: sporiji automobil prolazi kroz početnu brzinu bržeg automobila malo niz ravninu, a od tamo je njegov vlastiti trag ono što bi napravio s te brzine, s vlastitim prijenosom, otporom i nagibom u njemu. Pomaknut natrag na tu točku (i pušten da teče svojom krajnjom brzinom za metre koje dobiva) to je njegovo vrijeme od bržeg starta; razlika je cijena brzine na izlazu. Kad sporiji automobil nikad ne dostigne tu brzinu (ili samo u zadnja 2 uzorka), njegovo vlastito ubrzanje duž dionice vraća se kao snaga (`a·v` držano), nikad jače nego što njegova ovojnica pokazuje pri toj brzini (dvostruko izmjereno ubrzanje bez ovojnice).
  - *vuča automobila* (`byPower`) - samo u različitim automobilima: oba automobila od iste brzine preko istih metara, pri punom gasu, zbrajajući punu akceleraciju koju je svaki pokazao pri svakoj brzini.
  - *kako je vožena* (`driven`) - ostalo: podizanje, izgubljena brzina pri punom gasu.

  Brzina na izlazu nikad ne objašnjava više od cijene ravnine (i nikad s suprotnim predznakom), osim ako je podizanje ili izgubljena brzina neku vratilo. Krug je **podigao** gas na ravnini kad je njegov udio na punom gasu manji i od 0,9 i od udjela drugoga minus 0,05. Izgubljena brzina se računa kad se njih dvoje razlikuju za više od 1 m/s. Neslaganje manje od 0,02 s po predznaku postavlja se na 0.

Neto svake dionice zbraja se u razliku vremena kruga, a do apeksa i poslije njega svakog zavoja zbrajaju se u njegov neto (testovi provjeravaju oboje).

### Udio automobila {#the-cars-share}

Samo kad su krugovi u **različitim automobilima** i krug je izgubio vrijeme (`carShare`):

- **vuča**: vuča automobila niz ravninu (gore), do gubitka;
- **prionljivost**: kad je krug bio na granici svog automobila (bočno ubrzanje u sredini najmanje **90%** onoga što njegov automobil drži pri toj brzini) i drugi automobil drži više od **5%** više: od niže najmanje brzine koja nije objašnjena užim polumjerom, udio `½ ln(prionljivost_drugog / prionljivost_mog) / ln(v_drugi / v_moja)` preostalog gubitka;
- **kočnice**: kad je krug kočio (ne podizao), drugi automobil koči za više od **5%** jače, a krugovo *prosječno* usporavanje kroz zonu bilo je najmanje **80%** onoga što njegov automobil može: od `u` do `v` pri `a1` naspram `a2`, s krajem u istoj točki, `(1/a1 - 1/a2)(u - v)² / 2u`, do onoga što je ostalo.

Cijena automobila je zbroj, najviše do gubitka.

## Ocjena i nalaz {#the-verdict-and-the-finding}

`cornerFinding` piše najviše jedan nalaz po krugu i zavoju, provjeravajući ovim redom:

| Slučaj | Nalaz | Ishod |
|---|---|---|
| neto unutar ±0,03 s, zamjena, manja strana ≥ **0,1 s** | **izjednačeno, dva puta kroz zavoj** - tko je bio sporo unutra i brzo van, a tko obrnuto; s ravninom poslije (na ravninu ili između dvije), put sporo unutra, brzo van je onaj na kojem treba graditi: zadržati njegov rani gas, a ulaz vratiti jačim kočenjem, a ne kasnijim | izjednačeno |
| neto unutar ±0,03 s inače | ništa se ne kaže | - |
| dobiveno, zamjena, izgubljeno do apeksa | **sporo unutra, brzo van se isplatilo**: zadržati ga, ovdje izlaz vrijedi više | dobitak |
| dobiveno, zamjena, dobiveno do apeksa | **brži na ulazu**: ulaz je dobar, raniji puni gas zadržao bi više | dobitak |
| dobiveno, a drugi krug ovdje ima gubitak | **brži - zbog onoga što je drugi napravio**, njegov uzrok i njegov savjet kažu „Za drugi krug: …” | dobitak |
| dobiveno inače | **brži na ulazu / izlazu**, prema tome koja je polovica dobila više (kasnije kočenje, više brzine kroz sredinu; ili ranije na ravno, jača vuča) | dobitak |
| izgubljeno, a **udarac ili sudar** koštao je najmanje `max(0,05 s, 40% gubitka)` | udarac je priča zavoja, prije automobila | gubitak |
| izgubljeno, a **udio automobila** je 60% ili više | **automobil**: njegova vuča niz ravninu, prionljivost kroz sredinu ili kočnice - najveći dio; s dijelom vozača (≥ 0,03 s) kaže se kao „Ostalo X s: …” | gubitak |
| izgubljeno, a jedna nepodijeljena **greška kontrole automobila** koštala je najmanje `max(0,05 s, 40%)` | ta greška (vidi dolje), s time kako se vrijeme pomaknulo oko nje | gubitak |
| izgubljeno, a **duži let** koštao je najmanje `max(0,05 s, 40%)` | let | gubitak |
| izgubljeno, zamjena, dobiveno do apeksa | **prebrzo unutra, sporo van**: uzrok izlaza; žrtvovati dio ulaza da se okrene i ravno ranije, uz točke kočenja i punog gasa drugog kruga. Njegov korijen (`cause`, ono što [statistika](race-course-statistics.md) broji): kasnije kočenje, kad je kočio nekoliko metara više od drugoga; inače uzrok izlaza | gubitak |
| izgubljeno, zamjena, izgubljeno do apeksa | **dao je previše na ulazu nego što je izlaz vratio**: uzrok ulaza, koji je ujedno njegov korijen (`cause`); zadržati izlaz, izgubiti manje na ulazu | gubitak |
| izgubljeno, podignut na ravnini, a vožena dionica preko polovice gubitka | **nije na punom gasu na ravnini**: udio na punom gasu naspram drugoga, gdje i koliko dugo je bilo podizanje | gubitak |
| izgubljeno, vuča automobila preko 60% gubitka, a ravnina preko polovice | **vuča automobila niz ravninu** (s vučom obaju automobila pri 160 km/h) | gubitak |
| izgubljeno inače | uzrok polovice koja je izgubila više (do apeksa ≥ poslije njega: ulaza; inače izlaza). Sporije izvan samo zato što sporije kroz sredinu (za više od 1 m/s): umjesto toga uzrok sredine | gubitak |

Nalaz o gubitku može također završiti s **Također:** - izgubljena brzina pri punom gasu, ili podizanje na ravnini - kad je vožena dionica ravnine koštala više od 0,04 s i to već nije bio uzrok.

Nalazi su poredani: prvo gubici, od najskupljeg; zatim dobici i izjednačeni zavoji.

### Uzroci na ulasku {#causes-on-the-way-in}

`entryCause`, prvi koji vrijedi (razlike najmanje brzine su u m/s; „5 m” je prag da pomak točke bude ranije ili kasnije):

| # | Uzrok (greška) | Pravilo |
|---|---|---|
| 1 | udarac ili sudar na ulasku | nepodijeljeni udarac koji počinje do 10 m poslije najsporije točke |
| 2 | **gotovo zaustavljen** (incident) | najmanja brzina ispod **60%** onoga što prionljivost ovog automobila dopušta tamo gdje je drugi prošao (`v_drugi · √(prionljivost_moja / prionljivost_drugog)` kad drugi automobil ima više prionljivosti, inače brzina drugog), a drugi krug iznad 8 m/s - zaokret, kontakt ili propušten zavoj |
| 3 | greška kontrole automobila na ulasku | nepodijeljena blokada, guranje, proklizavanje ili klizanje koje nije na gasu, počinje do 10 m poslije najsporije točke, košta ≥ 0,02 s |
| 4 | duži let prije najsporije točke | vidi [rally](#rally-rotation-and-flights) |
| 5 | **podignut** gdje je drugi ostao na punom gasu ili podigao 5 m ili više kasnije | ovaj krug je samo podigao |
| 6 | **kočeno gdje je drugi samo podigao** ili ostao na punom gasu | i bio je više od 0,5 m/s sporiji kroz sredinu |
| 7 | **kočeno nježno** | kočio je (ne podizao), imao je prostora kočiti jače - s podacima o gumama, njegovo klizanje blokade ispod **60%** klizanja gdje kočnice ovog automobila daju najbolje; bez njih, najveće usporavanje ispod **85%** onoga što pokazuje pri toj brzini - pedala ispod 0,95, a najveće usporavanje drugog kruga više od **15%** |
| 8 | **kočeno rano** - ili **kočnice automobila** | kočio više od 5 m prije drugoga. U drugom automobilu čije su kočnice više od 5% jače, a s najviše 10 m viška u odnosu na udaljenost koju ovaj automobil treba pri svom usporavanju: kočnice automobila. Inače kočeno rano, s „Kočite kasnije - oko N m” (u drugom automobilu, metri preko onoga što mu treba) |
| 9 | **kotrljao** | više od 10 m bez ijedne pedale, i 5 m više od drugoga |
| 10 | **sporiji kroz sredinu** | više od 0,5 m/s sporiji u najsporijoj točki; raščlanjeno po `v² = a·R` (dolje) |
| 11 | **stigao sporije** | preko 1 m/s sporiji na točki kočenja, nije kočio rano: odlučeno prije - prethodnim zavojem i vučom automobila, ili letom u prethodnom zavoju koji je bio 0,2 s duži. Pripisuje se automobilu kad se automobili razlikuju |
| 12 | sporije do apeksa | inače: otpustiti kočnicu glatkije i uvesti više brzine u sredinu |

**Sporije kroz sredinu** (`middleSplit`): polumjer svakog kruga u njegovoj najsporijoj točki mjeri se iz vlastite putanje (±8 m), njegovo bočno ubrzanje kao `v²/R`, i

`ln(v_drugi / v_moja) = ½ ln(a_drugi / a_moja) + ½ ln(R_drugi / R_moja)`.

- Polumjer objašnjava **polovicu ili više**: **linija preuska** - „iskoristite više ceste”, s oba polumjera i udjelom.
- Na granici automobila (klizanje preko 10° drifta na asfaltu / 20° na rastresitom, ili bočno ubrzanje najmanje 90% onoga što drži pri toj brzini) i drugi automobil drži preko 5% više: **prionljivost automobila**; umjesto toga zaštititi izlaz.
- Klizanje kroz njega (drift preko 10° / 20°) i drugi krug nije (njegov ulazni drift barem 4° manji): **postrance** - iza svoje prionljivosti, a ne ispod nje; ući malo sporije. Kaže se kao automobilovo kad ovaj automobil uhvati stražnji dio barem jednom po krugu više od drugoga.
- U drugom automobilu koji drži ispod **96%** prionljivosti drugoga, a krug je nosio unutar 1 m/s od `v_drugi · √(prionljivost_moja / prionljivost_drugog)`: **prionljivost automobila** - „kasnije kočenje to neće nadoknaditi”.
- Inače **prionljivost na pretek**: bočno ubrzanje naspram drugoga na sličnom polumjeru, i što ovaj automobil drži; nositi više brzine do apeksa. Gdje stražnji dio ovog automobila popusti prije nego što je prionljivost iskorištena (njegova klizanja počinju ispod 85% prionljivosti, a krug je bio na 80% toga), ostatak naći u malim koracima.

### Uzroci na izlasku {#causes-on-the-way-out}

`exitCause`, prvi koji vrijedi:

| # | Uzrok (greška) | Pravilo |
|---|---|---|
| 1 | greška kontrole automobila na izlasku | nepodijeljeno proklizavanje kotača, okret, klizanje ili udarac koji završava na ili poslije 10 m prije najsporije točke |
| 2 | **izgubljena brzina** | više od 1 m/s izgubljene brzine pri punom gasu nego drugi; preko **7 m/s (25 km/h)** „više nalikuje na kontakt ili okret nego na klizanje” |
| 3 | **okrenuo automobil krivo** (rastresita podloga) | vidi [rally](#rally-rotation-and-flights) |
| 4 | **na snagu kasnije** | uključen gas više od 5 m kasnije, računajući i od vlastite najsporije točke svakog kruga (krug čija je najsporija točka kasnija ne krivi se za kasniji gas) |
| 5 | **oklijevao na gasu** | više padova gasa nego drugi |
| 6 | **išao širom i čekao** | više od 1,5 m vani naspram drugoga gdje su oba bila ravna, i pun gas više od 5 m kasnije od vlastite najsporije točke |
| 7 | **pun gas kasnije** | pun gas više od 5 m kasnije, i od vlastite najsporije točke; uz ubrzanje automobila tamo |
| 8 | **pogon automobila** | u drugom automobilu koji vuče manje od 95% drugoga pri toj brzini, a vuča je objasnila dio ravnine |
| 9 | **sporije izvan zavoja** | inače: kasniji apeks, pa je automobil ranije na ravnini |

Kad su dva kruga u različitim stupnjevima u najsporijoj točki, savjet završava s „Mjenjač N u apeksu; drugi je koristio M.”

### Greške kontrole automobila i udarci {#car-control-faults-and-impacts}

Greška iz [Događaji kontrole automobila](race-control-events.md) kao uzrok: blokada je uzrok *kočenja*, proklizavanje ili klizanje na gasu uzrok *izlaza*, ostalo *ulaza*; udarac poslije najsporije točke je *izlaz*, a prije nje *ulaz*. Savjet je vlastiti savjet događaja, zatim „Koštalo je oko X s do 40 m poslije njega” (ili „do trenutka kad je automobil vratio brzinu” za udarac). Blokada s točkom kočenja više od 5 m ranijom od drugoga dodaje da je krug i rano kočio - s okretanjem kotača ne bi mu to trebalo.

### Rally: zakretanje i letovi {#rally-rotation-and-flights}

Na **rastresitoj podlozi**, s kutovima driftanja na oba kruga, i ovaj krug na snazi (ili na punom gasu) više od 5 m kasnije:

- **Okrenuo automobil manje**: drugi je imao automobil okrenut za **12°** ili više do svoje najsporije točke i barem **8°** više od ovog kruga. Savjet: podizanje ili nježan dodir lijeve noge na kočnici dok ulazi u zavoj, s točkom ručne kočnice drugog kruga kad je samo on koristio, ili ručna kočnica u zavoju sporijem od 15 m/s (54 km/h).
- **Okrenuo ga je previše**: ovaj krug ga je okrenuo za 12° ili više i barem **12°** više od drugoga: morao se ispraviti prije nego što se snaga može spustiti.

**Duži let**: u zraku 0,2 s ili više duži od drugoga, koji košta najmanje 0,03 s od 10 m prije poletanja do 40 m poslije doskoka (ili kraja dionice). Prije najsporije točke to je uzrok ulaza; postaje priča zavoja kad objašnjava 40% ili više. Savjet: zadržati gas uključen pri poletanju, prijeći greben malo sporije ili uz dodir kočnice.

### Start {#the-start}

Prije prvog zavoja, na sprintu ili kad je jedan od krugova počeo iz mirovanja (ispod 5 m/s gdje su oba prva na osi) ili na startu utrke (ispod 60% brzine drugoga), vožnja do prve točke kočenja je vlastiti nalaz (zavoj 0) kad se razlikuje za više od 0,03 s: *Start*, *Početak utrke* ili *Do prvog zavoja*. Gubitak se tu pripisuje situaciji (*kontekst*) kad je jedan krug počeo na startu utrke, a drugi u vožnji; automobilu kad su krugovi u različitim automobilima; a inače vozaču. Savjeti: u drugom automobilu iz mirovanja, „uglavnom automobil”; start iz mirovanja u istom automobilu, krenuti s manje proklizavanja kotača i mijenjati na vrhu raspona snage; start na utrci, usporediti s drugim prvim krugom; start u vožnji, bolji izlazak iz zadnjeg zavoja prenosi se preko linije.

## Vožena linija {#the-driven-line}

`lineMetrics`, po krugu i dionici (ne za mješovite komplekse), samo iz položaja (izglađeno ±2 uzorka) preko prozora zavoja:

| Mjera | Pravilo |
|---|---|
| zakrivljenost | promjena smjera preko ±8 m vlastite putanje kruga |
| **najuži polumjer** | 1 / vrh zakrivljenosti |
| **početak skretanja** / **kraj skretanja** | gdje zakrivljenost prvi put / zadnji put prelazi petinu svog vrha |
| **sredina** | gdje je krug okrenuo polovicu svoje promjene smjera |
| polumjer ulaza / izlaza | metri vožnje preko polovice promjene smjera, prije / poslije sredine |
| **oblik** | najuži polumjer naspram prosječnog polumjera u skretanju: ispod **0,55** **V**, iznad **0,75** **U**, između „U/V” |
| **apeks** | polumjer na izlazu naspram polumjera na ulazu: iznad **1,25** kasni, ispod **0,8** rani, inače sredina |
| **brzinski apeks** | najsporija točka više od **15 m** prije sredine: sporo unutra, brzo van; više od 15 m poslije: još se usporava iza sredine |

Naspram drugog kruga: koliko je išao unutra (+) ili vani pri početku skretanja, kroz najuži dio i gdje su oba bila ravna (rečeno od 1 m); gdje je koji počeo skretati (rečeno od 8 m).

### Koja linija pristaje ovom automobilu ovdje {#which-line-suits-this-car-here}

`lineFor`, iz onoga kamo zavoj vodi i karaktera automobila na ovom zavoju:

- **snaga naspram prionljivosti** = ubrzanje automobila pri punom gasu na brzini izlaza, podijeljeno s njegovom prionljivošću pri najmanjoj brzini (iz njegove ovojnice). **Point and shoot** pri **0,45** i više; **zamah** pri **0,25** i manje.
- **aerodinamička sila prižimanja**: prionljivost pri 151-252 km/h podijeljena s prionljivošću pri 54-108 km/h od **1,15** ili više, za zavoj uzet pri **144 km/h** (40 m/s) ili brže - tada je to zavoj zamaha, bez obzira na snagu. Ne ocjenjuje se na rastresitoj podlozi.

| Vrsta zavoja | Automobil | Linija |
|---|---|---|
| poslije ravnine | point and shoot / ostalo | V / U, apeks u sredini: „zona kočenja je nagrada” |
| između dvije ravnine | zamah / ostalo | U / V, kasni apeks |
| veza | zamah / ostalo | U / V, apeks u sredini: „vozite ga za izlaz sljedećeg” |
| na ravninu | zamah (ili brz zavoj s aerodinamičkom silom) | širok zaobljeni U, malo kasniji apeks |
| na ravninu | point and shoot | V: kočiti ravno, ući kasno, okrenuti se u kratkoj uskoj sredini, ravno rano |
| na ravninu | između | U s kasnim apeksom: sporo unutra, brzo van |

Gdje je izlaz važan (na ravninu, između dvije) pogon dodaje rečenicu: **FWD** - okrenuti ga kočnicom, dodavati snagu tek dok se kotač odmotava; **RWD** s omjerom snage i prionljivosti od 0,35 ili više - ispraviti ga prije punog gasa; **AWD** - može preuzeti snagu dok se još okreće. Na rastresitoj podlozi svaka linija dodaje: okrenuti automobil na ulasku.

Rečenica tada kaže što je krug vozio i odgovara li: *najsporiji kasno veže izlaz* ili *rani apeks veže izlaz* gdje je tražen kasni apeks, a krug nije imao kasni apeks niti je bio najsporiji rano; *zaobljeniji nego što ovaj automobil želi* gdje je tražen V; *uglatiji nego što ovaj automobil želi* gdje je tražen U; inače *to odgovara*.

## Za programere {#for-developers}

Kod: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Razlog i izvori: [metoda](race-analytics.md).
