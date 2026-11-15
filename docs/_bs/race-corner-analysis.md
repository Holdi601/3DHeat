---
title: "Analiza krivina"
parent: "Analiza utrke"
nav_order: 55
lang: "bs"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiza po krivinama

Dva kruga iste staze upoređuju se krivina po krivina. Za svaku krivinu pregled kaže ko je bio brži, koliko je vremena to vrijedilo i zašto – kočeno prerano, gas dat kasno, uzeta šira linija – da znate šta prvo treba vježbati.

![Nalaz otvoren u Gdje se poboljšati, pored tabele Krivina po krivina](../assets/img/en/race-corner-finding.webp)

Primjer: u krivini 3, Driver A koči 20 m ranije nego Driver B i izgubi 0,15 s na dolasku, ali ranije daje gas i na izlasku dobije 0,15 s. Neto 0,00 s: krivina je izjednačena, i niko ne dobija savjet da koči kasnije.

## Šta vidite {#what-you-see}

### Gdje se poboljšati {#where-to-improve}

Dio bočne trake za krug koji je u fokusu („Učitajte najmanje dva kruga jedne staze.“ dok to nije urađeno).

**Zaglavlje:** „<krug> <vrijeme> u odnosu na <referenca> <vrijeme>“ i razlika u vremenu kruga – ili, za referencu, „u odnosu na najbrži drugi krug kroz svaku krivinu (…)“ i ukupno koliko je izgubila. Pored toga, gubitak podijeljen na *vožnju* i *automobil / okolnosti*.

**Traka raspodjele:** izgubljeno vrijeme po grupi uzroka (kočenje, ulazak, izlazak, pravac, automobil, okolnosti), u bojama uzroka, sa legendom.

**Nalazi**, tri liste:

1. Gubici zbog vožnje, od najskupljeg, najviše **12** – ili „Nigdje se ne ističe mjesto gdje bi drugačija vožnja donijela vrijeme.“
2. **Prikaži šta su koštali automobil ili situacija (X s)** – gubici zbog automobila i okolnosti, najviše 8 (uključeno kao podrazumijevano).
3. **Gdje je <krug> brži ili na drugi način izjednačen (N)** – dobici i izjednačene krivine, najviše 10 (uključeno kao podrazumijevano).

Svaki nalaz pokazuje redni broj, naslov (krivinu i šta se dogodilo, sa cijenom za gubitak), liniju sa ocjenom, cijenu (dobici sa minusom) sa trakom, i oznaku: *kočenje*, *ulazak*, *izlazak*, *pravac* (gubici zbog vožnje, sa „· automobil X“ kada automobil objašnjava 0,02 s ili više), *automobil*, *okolnosti*, *brži*, *izjednačeno*. **Kliknite jedan** da poravnate automobile 40 m prije njega, uokvirite ga i reproducirate, i otvorite njegova mjerenja:

- **Kočenje:** gdje je svaki kočio (ili otpustio gas) i sa koje brzine, i koliko metara ranije ili kasnije (od 5 m);
- **Najsporije:** najmanja brzina svakog kruga i gdje;
- **Pun gas:** gdje je svaki bio pun gas i koliko ranije ili kasnije;
- **Linija:** razlika u trenutku ulaska u krivinu, najuži radijusi, koliko unutra ili vani, i oblik linije svakog kruga i tjeme;
- **Pravac do sljedeće krivine:** njegova dužina, obje brzine tamo gdje su oba bila pun gas, šta je izgubio ili dobio i čime – početna brzina, jači potisak drugog, otpuštanje gasa, izgubljena brzina i kako je vožen (dijelovi od 0,02 s);
- **Automobil:** koliki dio gubitka pripada automobilu, i čemu (potisak, prianjanje, kočnice; kada je 0,02 s ili više);

zatim savjet, **Automobili:** (u različitim automobilima, vidi [Profili automobila](race-car-profiles.md#what-the-cars-decide-in-a-corner)), i savjet o liniji.

### Krivina po krivina {#corner-by-corner}

Tabela (sa dva ili više krugova), jedan red po dionici, u klasi kruga koji je u fokusu kada ih ima više:

| Kolona | Prikazuje |
|---|---|
| Krivina | `T3`, `T11-T12` |
| Najbrži | krug koji je najbrži kroz nju (njegovo vlastito vrijeme od početka do kraja dionice) |
| za | njegova prednost nad drugim najbržim, s |
| linija | oblik linije najbržeg kruga i tjeme („V · kasno“, „U/V · sredina“); pređite mišem za najuži, ulazni i izlazni radijus; „oba načina“ za mješovit kompleks |
| (krug u fokusu) | koliko je zaostajao za najbržim, ili ✓ kada je bio najbrži |

Klik na red otvara nalaz kruga u fokusu (ili poravnava automobile 40 m prije dionice). Ispod tabele, kada svaka krivina ima vrijeme: „Najbrži kroz svaku krivinu, sklopljeno zajedno: <vrijeme> (± na referenci / na najboljem iz klase X)“ – najbolje dionice plus najbrža vožnja do prve krivine kada je to njena posebna dionica.

## Kako se računa {#how-it-is-worked-out}

Osnovno pravilo: **krivina se ocjenjuje kao cjelina**, od zone kočenja za nju do zone kočenja za sljedeću. Krug koji koči ranije da bi automobil brže okrenuo i ranije dobio gas dobija priznanje za izlaz koji je tako kupio, a ne savjet da koči kasnije.

## Jedna osa rastojanja {#one-distance-axis}

Krugovi se upoređuju po rastojanju, a ne po vremenu – sekundu iza, dva kruga su na različitim krivinama. Ni po sopstvenom brojaču kilometara (uži put pređe manje metara). **Put referentnog kruga** je osa:

- Uzorci svakog drugog kruga se **projektuju** na referentni put: svaki uzorak dobija `s`, koliko je daleko duž reference, i `d`, koliko je lijevo (pozitivno) ili desno. Pretraga ide unaprijed od prethodnog poklapanja (8 dionica puta unazad do 40 unaprijed), pa se krug koji se ukršta sa samim sobom nikad ne zalijepi za drugo ukrštanje. Prvi uzorak se traži u prvoj četvrtini puta (na stazi start i cilj se poklapaju); kada ništa nije unutar 30 m, uzima se najbliža tačka bilo gdje koja nije iza posljednjeg poklapanja (nakon okretanja ili izlaska sa staze). `s` nikad ne opada: uzorak koji se projektuje iza prethodnog se zadržava.
- Svaki kanal se **ponovo uzorkuje** na jednu mrežu, **svakih 2 m**, linearno; kanali koji skaču (brzina, zastavice) po najbližem uzorku. Izvan vlastitog opsega kruga vrijednosti su prazne.
- Prvi i posljednji uzorak kruga se projektuju malo unutar krajeva reference, pa se svaki krug **nosi do 15 m** preko svojih krajeva brzinom koju je imao (vrijeme raste rastojanjem podijeljenim sa brzinom, ostalo ostaje) – tako je njegova razlika na liniji razlika vremena kruga.
- `delta` = vrijeme kruga u svakoj tački mreže minus vrijeme reference: razlika. `lateral` = `d` na mreži.

Koliko je jedan krug duže trajao od drugog između dvije tačke mreže je razlika njihovih delti: `rel(s)`. Sve ispod je zasnovano na tome.

## Krivine {#corners}

Nalaze se na **referenci** (`findCorners`), sa njenom brzinom izglađenom ±6 m i njenom zakrivljenošću (promjena pravca preko ±5 uzoraka, izglađena ±10 m):

1. **Minimumi brzine sa istaknutošću.** Tačka koja je najniža unutar ±40 m, čiji je pad od najveće brzine sa svake strane (prije nižeg minimuma) najmanje `max(2,5 m/s, 6% brzine)`.
2. **Prelomi.** Lokalni vrh zakrivljenosti uži od radijusa **300 m** bez minimuma brzine unutar 80 m: prelom kroz koji se prolazi punim gasom je i dalje krivina za vožnju.
3. **Faze.** Od svakog tjemena unazad dok referenca koči (> 0,1) ili je bez punog gasa (< 0,95): ulazak; unaprijed dok je bez punog gasa: izlazak. Prelom kroz koji se prolazi punim gasom dobija ±30 m. Preklapajuće krivine ostaju odvojene, ali se slažu da pokriju krug.
4. Numerisane T1, T2 … redom kojim se vozi krug; **lijevo ili desno** prema znaku zakrivljenosti i tome da li je svijet ogledalski (nepoznato se računa kao ogledalski).

**Prozor krivine** (gdje referenca skreće): od najuže tačke unutar ±40 m od tjemena naviše dok zakrivljenost ostaje iznad šestine svog vrha, plus 10 m sa svake strane. Njena strana daje znak za „unutra“.

## Dionice: od zone kočenja do zone kočenja {#segments-braking-zone-to-braking-zone}

Svaka krivina posjeduje put do pola puta ka tjemenima sa obje strane. U njoj:

- **Najsporija tačka svakog kruga** je stvarni udubljenje brzine – nigdje sporije unutar 6 m (3 tačke mreže) sa obje strane, gledajući preko krajeva dionice, tako da izlaz prethodne krivine koji još ubrzava u nju nikad ne bude zamijenjen za nju – traži se od 15 m prije prozora krivine do 10 m poslije njega. Krug koji tu uopšte nije usporio stavlja se na tjeme.
- **Gdje je krug počeo da usporava za nju** (`entryOf`): unazad od njegove najsporije tačke kroz kočenje ili otpuštanje, preko kratkih punih gasova, dok nije imao nogu na gasu (gas ≥ 0,95, kočnica ≤ 0,1) za **10 m**; gas ponovo podignut u posljednjih **30 m** prije najsporije tačke i dalje pripada krivini; ako je sve vrijeme pun gas, sama najsporija tačka. Krug bez kanala za gas, ili koji nikad nije imao nogu na gasu od prethodne krivine, počinje u svojoj najbržoj tački između.
- **Dionica počinje** na prvom od svih krugova koji počnu da usporavaju za nju (4 m ranije), i traje do početka sljedeće, tako da je kočenje svakog kruga unutar nje i dionice se slažu da pokriju krug.

**Kompleksi.** Uzastopne krivine između kojih referenca nikad ne vozi pun gas – manje od **40 m** punog gasa – čine jednu dionicu, „T11-T12“, vožnju kao jednu; kompleks ima najviše **tri** krivine (kriviran dio vožen bez ikakvog punog gasa počinje novi). Kompleks koji skreće i lijevo i desno je *mješovit*: za njega se ne mjeri oblik jedne linije.

**Na stazi** (referenca završava unutar 50 m od mjesta starta), posljednji pravac dionice ide preko linije do prve tačke kočenja: vožnja iz leta preko linije računa se uz posljednju krivinu. Krug koji je počeo iz mirovanja ili sa starta trke (vidi [Start](#the-start)) drži taj dio odvojeno.

### Šta krivina vodi {#what-a-corner-leads-onto}

Mjereno na referenci: metri punog gasa nakon krivine (od njenog punog gasa do kraja dionice, plus dio preko linije) i prije nje (`nakon` prethodne dionice, ili od starta).

| Tip | Pravilo |
|---|---|
| **između dva pravca** (`both`) | 200 m ili više prije **i** 120 m ili više poslije |
| **na pravac** | 200 m ili više poslije, ili 120 m ili više poslije i najmanje toliko koliko prije |
| **nakon pravca** | 200 m ili više prije |
| **veza** | sve ostalo |

## Šta je koji krug radio u krivini {#what-each-lap-did-in-a-corner}

`cornerMetrics`, po krugu i dionici, na mreži (korak 2 m). Pedale: kočenje se računa iznad 0,1, pun gas je 0,95 i više.

| Mjera | Pravilo |
|---|---|
| **tačka kočenja** | prvo kočenje pod kojim je gas otpušten (ispod 0,5), ili koje je trajalo **15 m** – lagano dodirivanje kočnice lijevom nogom uz uključen gas nije mjesto gdje je kočenje počelo; kada ima samo dodira, prvi dodir |
| **otpušten gas** | bez kočenja, prva tačka u kojoj je gas pao ispod 0,8 |
| (bez pedala) | tačka u kojoj je krug počeo da usporava (gore) |
| **otpuštanje kočnice** | posljednje kočenje do 30 m poslije najsporije tačke |
| **brzina na tački kočenja**, **metri kočenja** | do najsporije tačke |
| **najveće kočenje**, **najveće usporenje** | preko zone kočenja (ubrzanja iznad 45 m/s² se zanemaruju) |
| **kočenje u zavoju** | metri sa kočnicom > 0,05 i |upravljanje| > 0,1 |
| **klizanje blokade** | najnegativniji odnos klizanja točka u zoni (kada krug ima podatke o klizanju) |
| **najsporija tačka**, **najmanja brzina** | kao gore |
| **gas uključen** | poslije otpuštanja (ili najsporije tačke), prvi gas > 0,15 bez kočnice |
| **pun gas** | prva tačka poslije toga koja se održala ≥ 0,95 za 10 m |
| **kotrljanje** | metri od otpuštanja do uključenog gasa sa obje pedale ispod 0,05 |
| **padovi gasa** | koliko puta je gas pao za više od 0,25 ispod svog tekućeg vrha između uključenog gasa i punog gasa |
| **najveće bočno ubrzanje** | najveće bočno ubrzanje od 20 m prije otpuštanja do kasnijeg od punog gasa i 20 m poslije najsporije tačke |
| **brzina u tjemenu** | u najsporijoj tački |
| **klizanje pogonskih točkova** | najveći odnos klizanja pogonskog točka između uključenog i punog gasa |
| **ravnoteža** | prednji minus zadnji ugao klizanja kroz sredinu (+ podupravljanje) |
| **pravac na punom gasu** | udio dionice poslije punog gasa (i dijela preko linije) na ≥ 0,95; najduže otpuštanje na njoj |
| **izgubljena brzina** | najveći gubitak brzine od visoke tačke sa gasom ≥ 0,9, bez kočnice, na tlu |
| **ugao skretanja na ulazu** | najveći ugao skretanja od tačke kočenja do 5 m poslije najsporije tačke, na tlu |
| **ručna kočnica** | gdje se uključila (> 0,2), do 10 m poslije najsporije tačke |
| **vazduh** | sekunde u vazduhu preko dionice, i njen najduži let |

## Sa kim se svaki krug upoređuje {#who-each-lap-is-compared-with}

- Krug se upoređuje sa **najbržim potpunim krugom svoje performansne klase** (referenca, u klasi reference).
- Taj najbolji krug klase (i referenca) se upoređuje, dionicu po dionicu, sa **onim drugim krugom iz klase koji je bio najbrži** kroz nju – ili sa svim krugovima, kada je sam u klasi.

Mapa vremena, razlike u listi krugova, događaji kontrole automobila i tabela krivina slijede isto poređenje.

## Računica vremena jedne krivine {#the-time-account-of-a-corner}

`compareCorner`, za jedan krug naspram drugog preko dionice:

- **neto** = `rel(kraj) - rel(početak)` (plus dio preko linije kod leta): ocjena. Bliže od **0,03 s** je **izjednačeno**.
- **Podjela** – gdje unutar krivine je vodeći krug skrenuo: na dijelu od prve tačke kočenja ili najsporije tačke bilo kog od dva kruga do kasnijeg od njihovog punog gasa i najsporije tačke, najveći zamah koji je krug tada vratio ili povratio, kada je taj zamah veći od **0,04 s**; inače kasnija od dvije najsporije tačke.
- **Do tjemena** = `rel(podjela) - rel(početak)`; **poslije njega** = neto minus to. Kada su oba najmanje 0,04 s i suprotnog znaka, krug je **tradean** jedno za drugo.
- **Poslije njega** se opet dijeli tamo gdje su oba kruga bez gasa: **izlaz** (podjela do kasnijeg punog gasa) i **pravac** (od tamo do kraja).
- **Pravac** se dijeli na tri:
  - *brzina na izlazu* (`byExit`) – izmjerena, ne modelovana: sporiji automobil prođe kroz početnu brzinu bržeg malo niz pravac, i od tu je njegov vlastiti trag ono što bi uradio od te brzine, sa svojim prijenosom, otporom i nagibom. Vraćen na tu tačku (i odvrćen na svojoj krajnjoj brzini za metre koje dobija) on je njegovo vrijeme od bržeg starta; razlika je cijena brzine na izlazu. Kada sporiji automobil nikad ne dostigne tu brzinu (ili samo u posljednja 2 uzorka), njegovo vlastito ubrzanje duž dionice vraća se kao snaga (`a·v` održano), nikad jače nego što pokazuje njegova ovojnica pri toj brzini (dvostruko izmjereno ubrzanje bez ovojnice).
  - *potisak automobila* (`byPower`) – samo u različitim automobilima: oba automobila iz iste brzine preko istih metara, pun gas, integrišući punu akceleraciju koju je svaki pokazao pri svakoj brzini.
  - *kako je vožen* (`driven`) – ostatak: otpuštanje gasa, izgubljena brzina na punom gasu.

  Brzina na izlazu nikad ne objašnjava više od cijene pravca (i nikad suprotnog znaka), osim ako ju je otpuštanje ili izgubljena brzina dijelom vratilo. Krug je **otpustio gas** na pravcu kada je njegov udio punog gasa ispod i 0,9 i udjela drugog minus 0,05. Izgubljena brzina se računa kada se njih dvoje razlikuju za više od 1 m/s. Neslaganje manje od 0,02 s u znaku postavlja se na 0.

Neto svake dionice zbraja se u razliku vremena kruga, a do-tjemena i poslije-njega svake krivine u njen neto (testovi provjeravaju oboje).

### Udio automobila {#the-cars-share}

Samo kada su krugovi u **različitim automobilima** i krug je izgubio vrijeme (`carShare`):

- **potisak**: potisak automobila niz pravac (gore), do gubitka;
- **prianjanje**: kada je krug bio na granici svog automobila (bočno ubrzanje u sredini najmanje **90%** onoga što njegov automobil drži pri toj brzini) a drugi automobil drži više od **5%** više: od nižeg minimuma brzine koji nije objašnjen užim radijusom, udio `½ ln(prianjanje_drugog / prianjanje_moje) / ln(brzina_drugog / brzina_moje)` preostalog gubitka;
- **kočnice**: kada je krug kočio (a ne samo otpustio gas), drugi automobil koči za više od **5%** jače, i krugov *prosječan* usporenje kroz zonu bilo je najmanje **80%** onoga što njegov automobil može: od `u` do `v` pri `a1` naspram `a2`, završavajući na istoj tački, `(1/a1 - 1/a2)(u - v)² / 2u`, do onoga što preostaje.

Cijena automobila je zbir, najviše do gubitka.

## Ocjena i nalaz {#the-verdict-and-the-finding}

`cornerFinding` piše najviše jedan nalaz po krugu i krivini, probajući ovim redom:

| Slučaj | Nalaz | Ishod |
|---|---|---|
| neto unutar ±0,03 s, *tradean*, manja strana ≥ **0,1 s** | **izjednačeno, na dva načina** – ko je bio spor na ulazu a brz na izlazu, ko obrnuto; kada slijedi pravac (na pravac, ili između dva), način spor-na-ulazu-brz-na-izlazu je onaj na kojem se gradi: zadržite njegov rani gas, vratite ulaz kočenjem jače, a ne kasnije | izjednačeno |
| neto unutar ±0,03 s inače | ništa se ne kaže | – |
| dobijeno, *tradean*, izgubljeno do tjemena | **spor na ulazu, brz na izlazu se isplatio**: zadržite ga, ovdje izlaz vrijedi više | dobitak |
| dobijeno, *tradean*, dobijeno do tjemena | **brži na ulazu**: ulaz je ispravan, raniji pun gas bi zadržao više | dobitak |
| dobijeno, a drugi krug ima gubitak ovdje | **brži – zbog onoga što je drugi uradio**, njegov uzrok i savjet je rečeno „Za drugi krug: …“ | dobitak |
| dobijeno inače | **brži na ulazu / izlazu**, prema tome koja polovina je više dobila (kasnije kočenje, više brzine kroz sredinu; ranije na gasu, jači potisak) | dobitak |
| izgubljeno, a **udarac ili pad** koštao najmanje `max(0,05 s, 40% gubitka)` | udarac je priča krivine, prije automobila | gubitak |
| izgubljeno, a **udio automobila** je 60% ili više | **automobil**: njegov potisak niz pravac, njegovo prianjanje kroz sredinu ili njegove kočnice – najveći dio; sa dijelom vozača (≥ 0,03 s) rečenim kao „Ostalih X s: …“ | gubitak |
| izgubljeno, a jedna nedjeljiva **greška kontrole automobila** koštala najmanje `max(0,05 s, 40%)` | ta greška (vidi dolje), sa tim kako se vrijeme pomjeralo oko nje | gubitak |
| izgubljeno, a **duži let** koštao najmanje `max(0,05 s, 40%)` | let | gubitak |
| izgubljeno, *tradean*, dobijeno do tjemena | **prebrzo na ulazu, sporo na izlazu**: uzrok izlaza; odustanite od dijela ulaza da biste brže skrenuli i ranije na punom gasu, sa tačkama kočenja i punog gasa drugog kruga. Njegov korijen (`cause`, ono što [statistika](race-course-statistics.md) broji): kasnije kočenje, kada je kočio nekoliko metara kasnije od drugog; inače uzrok izlaza | gubitak |
| izgubljeno, *tradean*, izgubljeno do tjemena | **dao više na ulazu nego što je izlaz vratio**: uzrok ulaza, koji je ujedno i njegov korijen (`cause`); zadržite izlaz, izgubite manje na ulazu | gubitak |
| izgubljeno, otpušten gas na pravcu, a vožen dio veći od polovine gubitka | **nije pun gas na pravcu**: udio punog gasa u odnosu na drugi, gdje i koliko dugo je otpušteno | gubitak |
| izgubljeno, potisak automobila preko 60% gubitka a pravac preko polovine | **potisak automobila niz pravac** (sa potiskom oba automobila pri 160 km/h) | gubitak |
| izgubljeno inače | uzrok polovine koja je izgubila više (do tjemena ≥ poslije njega: ulaznog; inače izlaznog). Sporiji na izlazu samo zato što sporiji kroz sredinu (za više od 1 m/s): uzrok sredine umjesto toga | gubitak |

Nalaz o gubitku može se završiti i sa **Takođe:** – izgubljena brzina na punom gasu, ili otpuštanje gasa na pravcu – kada je vožen dio pravca koštao više od 0,04 s i to već nije bio uzrok.

Nalazi se sortiraju: prvo gubici, od najskupljeg; zatim dobici i izjednačene krivine.

### Uzroci na ulazu {#causes-on-the-way-in}

`entryCause`, prvi koji se primjenjuje (razlike brzine minimuma su u m/s; „5 m“ je prag da ranija/kasnija tačka bude uračunata):

| # | Uzrok (greška) | Pravilo |
|---|---|---|
| 1 | udarac ili pad na ulazu | nedjeljiv udarac koji počinje najkasnije 10 m poslije najsporije tačke |
| 2 | **skoro zaustavljen** (incident) | najsporija brzina ispod **60%** onoga što prianjanje ovog automobila dozvoljava tamo gdje je drugi prošao (`v_drugi · √(prianjanje_moje / prianjanje_drugog)` kada drugi više prijanja, inače brzina drugog), krug drugog iznad 8 m/s – okretanje, kontakt ili propušten zavoj |
| 3 | greška kontrole automobila na ulazu | nedjeljiva blokada, guranje, okretanje ili klizanje koje nije na gasu, koje počinje najkasnije 10 m poslije najsporije tačke, koštala ≥ 0,02 s |
| 4 | duži let prije najsporije tačke | vidi [reli](#rally-rotation-and-flights) |
| 5 | **otpušten gas** kada je drugi ostao na punom gasu ili otpustio 5 m ili više kasnije | ovaj krug je samo otpustio |
| 6 | **kočio tamo gdje je drugi samo otpustio** ili ostao na punom gasu | i bio sporiji kroz sredinu za više od 0,5 m/s |
| 7 | **kočio nježno** | kočio (ne otpustio), imao prostora da koči jače – sa podacima o gumama, klizanje blokade ispod **60%** klizanja gdje kočnice ovog automobila daju najbolje; bez njih, najveće usporenje ispod **85%** onoga što pokazuje pri toj brzini – pedala ispod 0,95, a najveće usporenje drugog kruga više za **15%** |
| 8 | **kočio rano** – ili **kočnice automobila** | kočio više od 5 m prije drugog. U drugom automobilu čije su kočnice jače za više od 5%, i sa najviše 10 m rezerve u odnosu na razdaljinu koju ovaj automobil treba pri svom usporenju: kočnice automobila. Inače, kočio rano, sa „Kočite kasnije – oko N m“ (u drugom automobilu, metri preko onoga što mu treba) |
| 9 | **kotrljao se** | više od 10 m bez nijedne pedale, i 5 m više nego drugi |
| 10 | **sporiji kroz sredinu** | više od 0,5 m/s sporiji u najsporijoj tački; podijeljeno sa `v² = a·R` (dolje) |
| 11 | **ušao sporije** | preko 1 m/s sporiji na tački kočenja, a ne kočio rano: odlučeno ranije – prethodnom krivinom i potiskom automobila, ili letom u prethodnoj krivini koji je bio 0,2 s duži. Automobilov kad se automobili razlikuju |
| 12 | sporiji do tjemena | inače: glatkije otpustiti kočnicu i uvesti više brzine u sredinu |

**Sporiji kroz sredinu** (`middleSplit`): radijus svakog kruga u njegovoj najsporijoj tački mjeri se iz njegovog vlastitog puta (±8 m), njegovo bočno ubrzanje kao `v²/R`, i

`ln(v_drugi / v_moje) = ½ ln(a_drugi / a_moje) + ½ ln(R_drugi / R_moje)`.

- Radijus objašnjava **polovinu ili više**: **previše uska linija** – „koristite više puta“, sa oba radijusa i udjelom.
- Na granici automobila (klizanje preko 10° skretanja na asfaltu / 20° na rastresitoj podlozi, ili bočno ubrzanje najmanje 90% onoga što drži pri toj brzini) i drugi automobil prijanja za više od 5%: **prianjanje automobila**; zaštitite izlaz.
- Klizanje kroz krivinu (skretanje preko 10° / 20°) a drugi krug nije (njegov ugao skretanja na ulazu najmanje 4° manji): **postrance** – preko svog prianjanja, ne ispod njega; uđite malo sporije. Kaže se da je automobila kada ovaj automobil zahvati zadnji kraj najmanje jednom po krugu više nego drugi.
- U drugom automobilu koji drži manje od **96%** prianjanja drugog, i krug je vozio unutar 1 m/s od `v_drugi · √(prianjanje_moje / prianjanje_drugog)`: **prianjanje automobila** – „kočenje kasnije to neće nadoknaditi“.
- Inače **rezerva prianjanja**: bočno ubrzanje naspram drugog na sličnom radijusu, i šta ovaj automobil drži; nosite više brzine do tjemena. Kada zadnji kraj ovog automobila popusti prije nego što se iskoristi prianjanje (njegovi klizni počinju ispod 85% njegovog prianjanja, a krug je bio na 80% toga), ostatak tražite u malim koracima.

### Uzroci na izlazu {#causes-on-the-way-out}

`exitCause`, prvi koji se primjenjuje:

| # | Uzrok (greška) | Pravilo |
|---|---|---|
| 1 | greška kontrole automobila na izlazu | nedjeljivo proklizavanje točkova, okretanje, klizanje ili udarac koji završava najkasnije 10 m prije najsporije tačke |
| 2 | **izgubljena brzina** | više od 1 m/s više brzine izgubljeno na punom gasu nego kod drugog; preko **7 m/s (25 km/h)** „više liči na kontakt ili okretanje nego na klizanje“ |
| 3 | **pogrešno zarotirao automobil** (rastresita podloga) | vidi [reli](#rally-rotation-and-flights) |
| 4 | **na gasu kasnije** | uključen gas više od 5 m kasnije, računato i od sopstvene najsporije tačke svakog kruga (krug čija je najsporija tačka kasnija ne krivi se za kasniji gas) |
| 5 | **oklijevao na gasu** | više padova gasa nego drugi |
| 6 | **proširio se i čekao** | više od 1,5 m van drugog tamo gdje su oba bila bez gasa, i pun gas više od 5 m kasnije od sopstvene najsporije tačke |
| 7 | **pun gas kasnije** | pun gas više od 5 m kasnije, i od sopstvene najsporije tačke; uz ubrzanje automobila tamo |
| 8 | **pogon automobila** | u drugom automobilu koji vuče ispod 95% drugog pri toj brzini, a potisak je objasnio dio pravca |
| 9 | **sporiji iz krivine** | inače: kasnije tjeme, pa automobil ranije izlazi na pravac |

Kada su dva kruga bila u različitim stepenima prenosa u najsporijoj tački, savjet se završava sa „Stepen N u tjemenu; drugi je koristio M.“

### Greške kontrole automobila i udarci {#car-control-faults-and-impacts}

Greška iz [Događaji kontrole automobila](race-control-events.md) kao uzrok: blokada je *uzrok kočenja*, proklizavanje točkova ili klizanje na gasu *uzrok izlaza*, ostalo *ulaz*; udarac poslije najsporije tačke je *izlaz*, prije nje *ulaz*. Savjet je sopstven za događaj, pa „Koštalo je oko X s do 40 m poslije“ (ili „do trenutka kad je automobil vratio brzinu“ za udarac). Blokada sa tačkom kočenja više od 5 m ranijom nego kod drugog dodaje da je krug takođe kočio rano – sa točkovima koji se okreću ne bi mu trebalo toliko.

### Reli: rotacija i letovi {#rally-rotation-and-flights}

Na **rastresitoj podlozi**, sa uglovima klizanja na oba kruga, i ovaj krug na gasu (ili bez gasa) više od 5 m kasnije:

- **Manje je okrenuo automobil**: drugi ga je okrenuo za **12°** ili više do svoje najsporije tačke i za najmanje **8°** više od ovog kruga. Savjet: otpuštanje gasa ili dodir lijeve noge na kočnici dok ulazi u krivinu, sa tačkom ručne kočnice drugog kruga kada je samo on koristio jednu, ili ručna kočnica u krivini sporijoj od 15 m/s (54 km/h).
- **Okrenuo ga je previše**: ovaj krug ga je okrenuo za 12° ili više i za najmanje **12°** više od drugog: morao je da se ispravi prije nego što se može spustiti gas.

**Duži let**: u vazduhu 0,2 s ili više duže nego drugi, koštajući najmanje 0,03 s od 10 m prije poletanja do 40 m poslije slijetanja (ili kraja dionice). Prije najsporije tačke to je uzrok ulaza; postaje priča krivine kada objašnjava 40% ili više. Savjet: zadržite gas pri poletanju, uzmite greben malo sporije ili uz dodir kočnice.

### Start {#the-start}

Prije prve krivine, na sprintu ili kada je jedan od krugova počeo iz mirovanja (ispod 5 m/s gdje su oba prva na osi) ili sa starta trke (ispod 60% brzine drugog), vožnja do prve tačke kočenja je sopstveni nalaz (krivina 0) kada se razlikuje za više od 0,03 s: *Start*, *Početak trke* ili *Do prve krivine*. Gubitak tu se pripisuje situaciji (*okolnosti*) kada je jedan krug počeo sa starta trke a drugi u brzini, automobilu kada su krugovi u različitim automobilima, a inače vozaču. Savjeti: u drugom automobilu iz mirovanja, „uglavnom automobil“; stojeći start u istom automobilu, polazak sa manje proklizavanja točkova i prebacivanje na vrhu radnog područja; start trke, uporedite sa drugim prvim krugom; leteći start, bolji izlaz iz posljednje krivine prenosi se preko linije.

## Vožena linija {#the-driven-line}

`lineMetrics`, po krugu i dionici (ne za mješovite komplekse), samo iz pozicija (izglađeno ±2 uzorka) preko prozora krivine:

| Mjera | Pravilo |
|---|---|
| zakrivljenost | promjena pravca preko ±8 m vlastitog puta kruga |
| **najuži radijus** | 1 / vršna zakrivljenost |
| **ulaz u krivinu** / **izlaz iz krivine** | gdje zakrivljenost prvi put / posljednji put pređe petinu svog vrha |
| **sredina** | gdje je krug skrenuo za polovinu svoje promjene pravca |
| radijus ulaz / izlaz | metri vožnje preko polovine promjene pravca, prije / poslije sredine |
| **oblik** | najuži radijus kroz prosječni radijus dok skreće: ispod **0,55** **V**, iznad **0,75** **U**, između „U/V“ |
| **tjeme** | radijus izlaza kroz radijus ulaza: iznad **1,25** kasno, ispod **0,8** rano, inače sredina |
| **tjeme brzine** | najsporija tačka više od **15 m** prije sredine: sporo unutra, brzo van; više od 15 m poslije: još usporava pored sredine |

U odnosu na drugi krug: koliko je unutra (+) ili vani vozio na ulazu, kroz najuži dio i tamo gdje su oba bila bez gasa (kaže se od 1 m); gdje je svaki ušao u krivinu (kaže se od 8 m).

### Koja linija odgovara ovom automobilu ovdje {#which-line-suits-this-car-here}

`lineFor`, iz onoga što krivina vodi i karaktera automobila na ovoj krivini:

- **snaga-prema-prianjanju** = puna akceleracija automobila na punom gasu pri brzini izlaza kroz njegovo prianjanje pri najmanjoj brzini (iz njegove ovojnice). **Gas i pucanj** pri **0,45** i više; **zamah** pri **0,25** i manje.
- **pritisak**: prianjanje pri 151-252 km/h kroz prianjanje pri 54-108 km/h od **1,15** ili više, za krivinu uzetu pri **144 km/h** (40 m/s) ili brže – tada je to krivina zamaha bez obzira na snagu. Ne ocjenjuje se na rastresitoj podlozi.

| Tip krivine | Automobil | Linija |
|---|---|---|
| nakon pravca | gas i pucanj / ostalo | V / U, tjeme u sredini: „zona kočenja je nagrada“ |
| između dva pravca | zamah / ostalo | U / V, kasno tjeme |
| veza | zamah / ostalo | U / V, tjeme u sredini: „vozite je za izlaz sljedeće“ |
| na pravac | zamah (ili brza krivina s pritiskom) | širok zaobljen U, malo kasno tjeme |
| na pravac | gas i pucanj | V: kočite pravo, uđite kasno, zarotirajte u kratkoj uskoj sredini, pravac rano |
| na pravac | između | U sa kasnim tjemenom: sporo unutra, brzo van |

Tamo gdje je izlaz važan (na pravac, između dva), pogon dodaje rečenicu: **FWD** – rotirajte ga na kočnicama, dodajte snagu tek kako se točak odmotava; **RWD** sa snagom-prema-prianjanju od 0,35 ili više – ispravite ga prije punog gasa; **AWD** – može da primi snagu dok se još skreće. Na rastresitoj podlozi svaka linija dodaje: zarotirajte automobil na ulazu.

Rečenica tada kaže šta je krug vozio, i da li se uklapa: *najsporije kasno veže izlaz* ili *rano tjeme veže izlaz* kada je tražena kasna tačka tjemena a krug nije ni tjemenio kasno ni bio najsporiji rano; *zaobljenije nego što ovaj automobil želi* gdje je tražen V; *uglastije nego što ovaj automobil želi* gdje je tražen U; inače *to odgovara*.

## Za programere {#for-developers}

Kod: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Obrazloženje i njegovi izvori: [metoda](race-analytics.md).
