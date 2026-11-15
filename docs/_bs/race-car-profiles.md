---
title: "Profili automobila i poređenje"
parent: "Analiza utrke"
nav_order: 56
lang: "bs"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profili automobila i poređenje

Automobil može da koči, skreće i ubrzava samo do određene jačine. Pregledač mjeri koliko jako iz vaših vlastitih krugova, pa nikad ne kaže da uradite nešto što automobil ne može. Ovo također objašnjava koliko je od izgubljene sekunde bila krivica automobila, a koliko vaša.

![Poređeni automobili: dva automobila jedan pored drugog s njihovim prijanjanjem, kočenjem i vučom](../assets/img/en/race-cars-compared.webp)

Analiza govori krugu da koči jače, nosi više brzine ili ubrzava ranije samo tamo gdje je njegov automobil to pokazao, i iz gubitka oduzima ono što sami automobili objašnjavaju. Zato se granice svakog automobila (njegova *ovojnica*, dolje) i karakter (njegov *profil*) mjere iz svakog učitanog kruga tog automobila. Ova stranica pokriva ovojnicu, profil, odjeljak **Poređenje automobila** i ono što automobili određuju u svakom zavoju.

**Jedan automobil** = krugovi s istim brojem automobila (ili imenom, bez broja) i istim indeksom performansi: drugačije podešavanje je drugi automobil.

## Ovojnica: šta automobil može na svakoj brzini {#the-envelope-what-the-car-can-do-at-each-speed}

Po automobilu, preko svakog njegovog učitanog kruga, u **pregradama brzine od 5 m/s** (24 pregrade, do 120 m/s). Uzorci u vazduhu, smirivanje 0,3 s poslije slijetanja, i od 0,1 s prije svakog udarca do 1 s poslije njega se izostavljaju, a ubrzanja od 80 m/s² ili više se ignorišu (iznad onoga što bilo koji automobil s prižimnom silom drži).

| Ovojnica | Uzorci | Vrijednost po pregradi | Treba |
|---|---|---|---|
| **bočno prijanjanje** | bočno ubrzanje **držano pola sekunde** (prosjek njegove apsolutne vrijednosti preko centriranog prozora od 0,5 s), samo tamo gdje je automobil skretao: najmanje trećina 99. percentila svega toga | 95. percentil | 6 uzoraka |
| **kočenje** | kočnica > 0,3; uzdužno ubrzanje kao medijana svakog uzorka i njegova dva susjeda | 95. percentil usporenja | 4 uzorka |
| **puni gas (vuča)** | gas > 0,95, kočnica ispod 0,05; ista medijana-od-tri | 90. percentil | 4 uzorka |

Zašto držano pola sekunde: obilazak ivičnjaka, klizanje koje se vraća, hvatanje automobila sve izazivaju kratak skok bočnog ubrzanja, a automobil koji to radi često izgleda prijanjajući više nego što jeste. Zašto medijana-od-tri: na razmaku od pet metara jedan uzorak je dug put, a pojedinačni skok je ivičnjak, neravnina ili zid.

Čitanje ovojnice na nekoj brzini interpolira između centara pregrada, i uzima najbližu pregradu s podacima gdje je pregrada prazna.

**O dvije vrste podloge.** Kad su krugovi automobila vozili petinu ili više svojih uzoraka na svakoj od asfalta i rastresite podloge, čuva se zasebna ovojnica za svaku, a svaki zavoj se ocjenjuje s podlogom pod automobilom na njegovoj najsporijoj tački.

**Prelaz.** Brzina od koje vuča opada kao `1/v` (ograničena snagom), a ne ostaje ravna (ograničena vučom): prva pregrada čije je `a·v` unutar 15% najvišeg viđenog `a·v`.

## Profil: kakva je to vrsta automobila {#the-profile-what-kind-of-car-it-is}

`profile`, iz istih krugova (uzorci na tlu, nepogođeni, brži od 8 m/s):

| Mjera | Kako |
|---|---|
| **držano prijanjanje** (m/s²) | 95. percentil držanog bočnog ubrzanja od pola sekunde |
| **vuča** do 50 km/h, 50-120, 120-200, iznad 200 (m/s²) | prosjek vuče ovojnice pri punom gasu preko 3-14, 14-33, 33-56 i 56-90 m/s, na brzinama koje je automobil dostigao (do svoje najbrže + 2 m/s), iz najmanje tri koraka od 1 m/s; i najviše što je pokazao, i gdje |
| **kočenje** (m/s²) | kočenje ovojnice, prosječeno od 60 do 160 km/h (16,7-44,4 m/s), opseg koji poređenje imenuje |
| **najbrži** | najveća brzina koju je dostigao |
| **dostiže vrh na** | gdje je prestao da dobija u punom gasu na pravcu (dolje) |
| **i dalje vuče na najbržoj** | vuča ovojnice na njegovoj najbržoj brzini: koliko mu je još ostalo |
| **zadnji kraj uhvaćen, po krugu** | puta po krugu kad je kliznuo i morao biti uhvaćen (dolje) |
| **udio na gasu** | od tih, udio koji je počeo s gasom > 0,5 i bez kočnice |
| **pušta na** | medijana držanog bočnog ubrzanja 0,15 s prije nego što je svako klizanje počelo, kao udio prijanjanja |
| **preko 10° drifta, pri jakom skretanju** | od uzoraka koji skreću na 60% prijanjanja ili više, udio koji kliže (10° na asfaltu, 20° na rastresitoj); treba 30 uzoraka |
| **medijana drifta** | preko istih uzoraka |
| **ravnoteža** | prednji minus zadnji ugao klizanja (umnošci nominalnog vrha) gdje skreće jako i ne kliže, prosjek najmanje 30 uzoraka: + guranje prema van |
| **podloga** | preko 80% rastresitih uzoraka: rastresita; ispod 20%: asfalt; inače mješovita |

**Dostizanje vrha.** Uzorak se računa kad je cijela sekunda oko njega (±0,5 s, najmanje 0,9 s podataka) bila na punom gasu (> 0,95, bez kočnice), na tlu, vožena **ravno** (|bočno| ispod većeg od 4 m/s² i četvrtine njegovog prijanjanja), dobijajući manje od **0,35 m/s²**, brže od 25 m/s i unutar 90% najbrže brzine kruga - puni gas uz brdo ili kroz dugu krivinu također prestaje da dobija, znatno ispod najveće brzine automobila. Uz najmanje **jednu sekundu** takve ravnice preko svih krugova, medijana tih brzina je mjesto gdje dostiže vrh. Inače nema najveće brzine: gdje nijedan pravac nije bio dovoljno dug, *i dalje vuče na najbržoj* kaže koliko je bio daleko. Bez nagađanja izvan onoga što krugovi pokazuju - prenosni odnosi i ograničivač završavaju vuču automobila daleko prije nego što je otpor.

**Gubitak zadnjeg kraja.** Računa se gdje ga je vozač morao uhvatiti: skretanje na 60% prijanjanja ili više, klizanje (drift preko 10° na asfaltu, 20° na rastresitoj podlozi), s upravljanjem (preko 0,06) okrenutim **naspram** zavoja. Koji predznak upravljanja se slaže s kojim predznakom bočne sile u zavoju mjeri se po krugu (uzorci koji skreću bez klizanja). Klizanje se računa jednom dok automobil ne prestane da kliže. Automobil koji se namjerno malo vozi postrance ništa ne gubi; onaj kojem treba suprotno upravljanje, gubi. Računa se isto za svaki automobil, pa se dva automobila mogu porediti. Treba upravljanje i ugao drifta.

## Poređenje automobila {#cars-compared}

Odjeljak na bočnoj traci je **Automobil** s jednim automobilom, **Poređenje automobila** s više njih.

**Tabela**: kolona po automobilu, red po mjeri za koju bilo koji automobil ima vrijednost: Držano prijanjanje; Vuča do 50 km/h, 50-120, 120-200, iznad 200; Kočenje; Najbrži; Dostiže vrh na („i dalje vuče" tamo gdje nikad nije); I dalje vuče na najbržoj; Zadnji kraj uhvaćen, po krugu; Preko 10° drifta, pri jakom skretanju. Gdje se automobili razlikuju za više od 3%, bolja vrijednost je označena (veća za prijanjanje, vuču, kočenje, brzine; manja za klizanja zadnjeg kraja).

**Jedan automobil sam**: rečenice o tome šta krugovi pokazuju da on jeste - prijanjanje koje drži (m/s² i g), njegova vuča u svakom opsegu, gdje je prestao da dobija na dugim pravcima (ili da nikad nije dostigao vrh, i šta je još vukao na najbržoj), koliko često je zadnji kraj morao da se uhvati („gotovo nikad" ispod jednom po krugu, „uglavnom na gasu" kad 60% ili više počinje tamo).

**Dva automobila**: za svaki par, po jedna rečenica o tome šta je automobil naspram drugog („X ubrzava bolje, ali ne može da skreće tako jako, treba duže da stane i lakše gubi zadnji kraj"), tabela, svaka jasna razlika, najveća prva, zatim **Vožnja svakog**. Uz više od **3** para, prikazuje se jedan par: automobil izabranog kruga naspram automobila izabranog s padajuće liste (podrazumijevano automobil najboljeg kruga njegove klase, inače referentnog, inače prvog drugog).

Razlika se navodi samo kad je krugovi jasno pokazuju:

| Razlika | Navodi se od | Rečenica |
|---|---|---|
| prijanjanje | **4%** | „X drži N% više prijanjanja kroz zavoje … to je M% više brzine kroz sredinu svakog zavoja" (brzina = √ odnosa prijanjanja) |
| vuča | **5%**, u prvom opsegu koji oba automobila imaju od 120-200, 50-120, iznad 200 km/h | „X ubrzava N% jače od 120 do 200 km/h"; i sa starta, ili „iako Y brže kreće sa starta", kad se start razlikuje za 8% |
| najveća brzina | **4 km/h** | „X dostiže višu: prestao je da dobija na …" |
| najveća brzina, samo jedan | jedan automobil dostigao vrh, drugi nije | „Y je ostao bez vuče na …; X je još dobijao kad je kočio" |
| najveća brzina, nijedan | nijedan nije dostigao vrh | na čemu je svaki još dobijao na najbržoj |
| kočenje | **5%** | „X staje N% jače … Y mora ranije da koči" |
| gubitak zadnjeg kraja | najmanje jednom po krugu više **i** pola puta češće | „X lakše gubi zadnji kraj: izašao je dovoljno da treba suprotno upravljanje N puta po krugu naspram M …" - uglavnom na gasu (60%+) ili uglavnom ulazeći u zavoj i na otpuštenom gasu (30% ili manje), od oko P% njegovog prijanjanja; na rastresitoj podlozi „dio toga je način na koji se automobil skreće; hvatanje nije" |
| postrance | **12 procentnih poena** jakog skretanja iznad praga drifta | „X više ide postrance na granici" |
| ravnoteža naprijed | **0,3** nominalnog vrha | „X više gura naprijed … Treba ga usporiti i okrenuti prije vrha krivine" |

Osobine u sažetku: *drži više prijanjanja* / *ne može da skreće tako jako*, *ubrzava bolje* / *vuče manje*, *dostiže višu najveću brzinu* / *dostiže nižu*, *još vuče na kraju pravaca* / *ostaje bez vuče*, *koči jače* / *treba duže da stane*, *stabilniji je* / *lakše gubi zadnji kraj* (*mnogo je skliskiji …* kad je dvostruko češće plus jedan; *treba češće hvatanje* na rastresitoj podlozi), *gura naprijed*. „Malo toga da ih razlikuje od Y na ovim krugovima" kad nema ničega.

**Vožnja svakog:**

- jedan automobil bolje drži, a drugi više vuče: održavajte brzinu kroz sredinu na širokoj, okrugloj liniji (slovo „U") u onom koji bolje drži; kočite pravo, okrenite ga u kratkoj, uskoj sredini i ispravite izlaz (slovo „V") u jakom;
- jedan automobil zaostaje na oba: njegov najbolji krug je najčistiji - kočite pravo, najširi radijus, puni gas što ranije drži;
- automobil koji lakše gubi zadnji kraj: dodajte gas tek kako se upravljanje odmotava i mijenjajte rano (klizanja na gasu), ili pustite kočnicu nježno i držite stalan gas kroz sredinu (klizanja pri ulasku).

Savjet ispod odjeljka ponavlja kako se svaka od njih mjeri.

## Šta automobili određuju u zavoju {#what-the-cars-decide-in-a-corner}

Kad su krugovi u različitim automobilima, nalaz svakog izgubljenog zavoja završava s **Automobili:** - šta od toga određuju automobili, i kako iz ovog izvući najviše (`carNote`):

- **Kroz sredinu**, kad ovaj automobil drži ispod 96% prijanjanja drugog, drugi je bio brži za više od 0,5 m/s na najsporijoj tački, a ovaj krug nije bio daleko ispod onoga što njegovo prijanjanje objašnjava (iznad 70% toga): na liniji drugog automobila prijanjanje ovog dozvoljava `v_other · √(grip_mine / grip_other)`. Ako je krug to nosio (unutar 1 m/s) razlika je automobil, i nijedna tačka kočenja to ne mijenja; ako manje, koliko je još tu da se dobije. Zatim, gdje se vrijeme može dobiti umjesto toga: na pravcu, između dva, ili u automobilu koji vuče 5% jače - poslije vrha (kočite pravo, skrećite kasnije, uperite ka izlazu rano); inače najširi radijus koji put dozvoljava.
- **Zadnji kraj koji je ovdje popustio** (nepodijeljeno klizanje ili zanošenje, ili drift preko praga klizanja na ulasku), u automobilu koji ga gubi najmanje jednom po krugu više i pola puta češće: šta raditi u ovom automobilu - gas dodat kako se volan odmotava (njegova klizanja počinju na snazi 60% ili više vremena) ili kočnica pažljivo otpuštena bez otpuštanja gasa.
- **Pravac poslije**: kad je vuča automobila objasnila 0,03 s ili više, jača vuča drugog automobila s iste brzine, s vučom oba automobila od 120 do 200 km/h.
- **Najveća brzina**: kad je ovaj krug dostigao 98% onoga gdje njegov automobil dostiže vrh na pravcu dužem od 150 m, a drugi je išao 1,5 m/s brže: to je najveća brzina automobila, i svaki km/h više iz zavoja i dalje pomaže dok ga ne dostigne.
- **Kočenje**: kad drugi automobil koči 5% jače, a ovaj krug je kočio više od 5 m ranije, dio ranijeg kočenja je automobilov.

Udio automobila se također oduzima od samog vremena - vidi [udio automobila](race-corner-analysis.md#the-cars-share) - a zavoj gdje automobil objašnjava 60% ili više pripisuje se automobilu.

## Za programere {#for-developers}

Kod: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` u [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` u [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
