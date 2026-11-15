---
title: "Profili vozila i usporedba"
parent: "Analiza utrke"
nav_order: 56
lang: "hr"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Profili vozila i usporedba

Automobil može kočiti, skretati i ubrzavati samo koliko može. Preglednik to mjeri iz vaših vlastitih krugova, pa vam nikad ne govori da napravite nešto što vaš automobil ne može. Ovo također objašnjava koliki dio izgubljene sekunde je bio krivnja automobila, a ne vaša.

![Usporedba automobila: dva automobila jedan uz drugi, s njihovim prianjanjem, kočenjem i vučom](../assets/img/en/race-cars-compared.webp)

Analiza samo govori krugu da koči jače, nosi više brzine ili ubrzava ranije tamo gdje je njegov automobil pokazao da može. Iz gubitka izuzima ono što sami automobili objašnjavaju. Zato se granice svakog automobila (njegova *ovojnica*, dolje) i njegov karakter (*profil*) mjere iz svakog učitanog kruga tog automobila. Ova stranica pokriva ovojnicu, profil, odjeljak **Usporedba automobila** i ono što automobili odlučuju u svakom zavoju.

**Jedan automobil** = krugovi s istim brojem automobila (ili imenom, bez broja) i istim indeksom performansi: drugačije podešavanje je drugi automobil.

## Ovojnica: što automobil može na svakoj brzini {#the-envelope-what-the-car-can-do-at-each-speed}

Po automobilu, kroz svaki njegov učitani krug, u **pojasevima brzine od 5 m/s** (24 pojasa, do 120 m/s). Izostavljaju se uzorci u zraku, smirivanje 0,3 s nakon slijetanja i od 0,1 s prije svakog udarca do 1 s nakon njega. Ubrzanja od 80 m/s² ili više se ignoriraju (iznad onoga što ijedan automobil s prizemnom silom drži).

| Ovojnica | Uzorci | Vrijednost po pojasu | Treba |
|---|---|---|---|
| **bočno prianjanje** | bočno ubrzanje **držano pola sekunde** (srednja vrijednost njegove apsolutne vrijednosti kroz centrirani prozor od 0,5 s), samo tamo gdje je automobil skretao: najmanje trećina 99. percentila svega toga | 95. percentil | 6 uzoraka |
| **kočenje** | kočnica > 0,3; uzdužno ubrzanje kao medijan svakog uzorka i njegovih dvaju susjeda | 95. percentil usporenja | 4 uzorka |
| **vuča pri punom gasu** | gas > 0,95, kočnica ispod 0,05; isti medijan od tri | 90. percentil | 4 uzorka |

Zašto držano pola sekunde: rubnjak, naglo vraćanje klizanja i hvatanje automobila sve na trenutak naglo podignu bočno ubrzanje. Automobil koji to često radi izgleda prianjajućim nego što jest. Zašto medijan od tri: pri razmaku od pet metara jedan uzorak je dugo. Pojedinačni skok je rubnjak, neravnina ili zid.

Očitavanje ovojnice na brzini interpolira između središta pojasa, a gdje je pojas prazan uzima najbliži pojas s podacima.

**O dvije vrste podloge.** Kad su krugovi automobila vozili petinu ili više svojih uzoraka i na asfaltu i na rahloj podlozi, čuva se zasebna ovojnica za svaku. Svaki zavoj se procjenjuje s podlogom pod automobilom u njegovoj najsporijoj točki.

**Križanje.** Brzina od koje vuča pada kao `1/v` (ograničena snagom motora), umjesto da ostaje ravna (ograničena prianjanjem): prvi pojas čiji je `a·v` unutar 15% najvećeg viđenog `a·v`.

## Profil: kakav je to automobil {#the-profile-what-kind-of-car-it-is}

`profile`, iz istih krugova (uzorci na tlu, nepogođeni, brži od 8 m/s):

| Mjera | Kako |
|---|---|
| **zadržano prianjanje** (m/s²) | 95. percentil zadržanog bočnog ubrzanja od pola sekunde |
| **vuča** do 50 km/h, 50–120, 120–200, iznad 200 (m/s²) | srednja vrijednost vuče ovojnice pri punom gasu kroz 3–14, 14–33, 33–56 i 56–90 m/s, pri brzinama koje je automobil dosegao (do njegove najveće + 2 m/s), iz najmanje tri koraka od 1 m/s; i najviše koliko je pokazao, i gdje |
| **kočenje** (m/s²) | kočenje ovojnice prosječno od 60 do 160 km/h (16,7–44,4 m/s), pojas koji usporedba imenuje |
| **najbrži** | najveća brzina koju je dosegao |
| **dosegao vrh kod** | gdje je prestao dobivati pri punom gasu na ravnini (dolje) |
| **još vuče na najbržem** | vuča ovojnice na njegovoj najbržoj brzini: koliko mu je još ostalo |
| **stražnji uhvaćen, po krugu** | puta po krugu kad je kliznuo i morao ga se uhvatiti (dolje) |
| **udio na gasu** | od toga, udio koji je počeo s gasom > 0,5 i bez kočnice |
| **pušta pri** | medijan zadržanog bočnog ubrzanja 0,15 s prije svakog početka klizanja, kao udio prianjanja |
| **preko 10° driftanja, pri jakom zavijanju** | od uzoraka koji skreću pri 60% njegova prianjanja ili više, udio koji kliže (10° na asfaltu, 20° na rahloj podlozi); treba 30 uzoraka |
| **medijan drifta** | kroz iste uzorke |
| **ravnoteža** | prednji minus stražnji kut klizanja (višekratnici nazivnog vrha) gdje skreće jako i ne kliže, srednja vrijednost od najmanje 30 uzoraka: + guranje širom |
| **podloga** | preko 80% uzoraka na rahloj podlozi: rahla; ispod 20%: asfalt; inače mješovita |

**Dosezanje vrha.** Uzorak se računa kad je sekunda oko njega (±0,5 s, najmanje 0,9 s podataka) bila cijela na punom gasu (> 0,95, bez kočnice), na tlu, i vožena **ravno** (|bočno| ispod većeg od 4 m/s² i četvrtine njegova prianjanja), dobivajući manje od **0,35 m/s²**, brže od 25 m/s i unutar 90% najbržeg kruga. Puni gas uz brdo ili kroz dugi zavoj također prestaje dobivati, daleko ispod najveće brzine automobila. Uz najmanje **jednu sekundu** takve ravnice kroz sve krugove, medijan tih brzina je mjesto gdje dosegne vrh. Inače nema najveće brzine: gdje nijedna ravnina nije bila dovoljno duga, *još vuče na najbržem* kaže koliko je bio daleko. Nema nagađanja izvan onoga što krugovi pokazuju: prijenos i ograničivač završe vuču automobila daleko prije nego što to učini otpor.

**Gubitak stražnjeg dijela.** Računa se tamo gdje ga je vozač morao uhvatiti: skretanje pri 60% njegova prianjanja ili više, klizanje (driftanje preko 10° na asfaltu, 20° na rahloj podlozi), s upravljanjem (preko 0,06) okrenutim **suprotno** zavoju. Koji predznak upravljanja odgovara kojem predznaku sile skretanja mjeri se po krugu (uzorci koji skreću bez klizanja). Klizanje se broji jednom dok automobil ne prestane kliziti. Automobil koji se namjerno malo vozi postrance ništa ne gubi; onaj kojem treba suprotno upravljanje, gubi. Broji se isto za svaki automobil, pa se dva automobila mogu usporediti. Treba upravljanje i kut driftanja.

## Usporedba automobila {#cars-compared}

Odjeljak na bočnoj traci je **Automobil** s jednim automobilom, a **Usporedba automobila** s više njih.

**Tablica**: stupac po automobilu, redak po mjeri za koju bilo koji automobil ima vrijednost: Zadržano prianjanje; Vuča do 50 km/h, 50–120, 120–200, iznad 200; Kočenje; Najbrži; Dosegao vrh kod ("još vuče" gdje nikad nije); Još vuče na najbržem; Stražnji uhvaćen, po krugu; Preko 10° driftanja, pri jakom zavijanju. Gdje se automobili razlikuju za više od 3%, bolja vrijednost je označena (veća za prianjanje, vuču, kočenje i brzine; manja za klizanja stražnjeg dijela).

**Jedan automobil sam**: rečenice o tome što krugovi pokazuju da je: prianjanje koje drži (m/s² i g), vuču u svakom pojasu, gdje je prestao dobivati na dugim ravninama (ili da nikad nije dosegao vrh, i što je još vukao na najbržem), i koliko često je stražnji dio trebao uhvatiti ("gotovo nikad" manje od jednom po krugu, "uglavnom na gasu" kad je 60% ili više počelo tamo).

**Dva automobila**: za svaki par, po jedna rečenica o tome što je jedan automobil naspram drugog ("X ubrzava bolje, ali ne može skretati jednako jako, treba duže da stane i lakše gubi stražnji dio"), tablica, svaka jasna razlika najveća prva, zatim **Kako voziti svaki**. Uz više od **3** para prikazuje se jedan par: automobil fokusiranog kruga naspram automobila izabranog s padajućeg izbornika (zadano automobil najboljeg kruga njegove klase, inače referentnog, inače prvog drugog).

Razlika se navodi samo kad krugovi pokazuju jasno:

| Razlika | Navodi se od | Rečenica |
|---|---|---|
| prianjanje | **4%** | "X drži N% više prianjanja kroz zavoje … to je M% više brzine kroz sredinu svakog zavoja" (brzina = √ omjera prianjanja) |
| vuča | **5%**, u prvom pojasu koji oba automobila imaju od 120–200, 50–120, iznad 200 km/h | "X ubrzava N% jače od 120 do 200 km/h"; i na startu, ili "iako Y brže kreće sa starta", kad se pokretanje razlikuje za 8% |
| najveća brzina | **4 km/h** | "X dosegne višu brzinu: prestao je dobivati kod …" |
| najveća brzina, samo jedan | jedan automobil je dosegao vrh, drugi nije | "Y je ostao bez vuče kod …; X je još dobivao kad je kočio" |
| najveća brzina, nijedan | nijedan nije dosegao vrh | što je svaki još dobivao na najbržem |
| kočenje | **5%** | "X staje N% jače … Y mora kočiti ranije" |
| gubitak stražnjeg dijela | najmanje jednom po krugu više **i** pola puta češće | "X lakše gubi stražnji dio: iskrenuo se dovoljno da mu treba suprotno upravljanje N puta po krugu, naspram M …" - uglavnom na gasu (60% i više) ili uglavnom pri ulasku u zavoj i otpuštanju gasa (30% ili manje), od oko P% njegova prianjanja; na rahloj podlozi "dio toga je kako se automobil okreće; hvatanje nije" |
| postrance | **12 postotnih bodova** jakog zavijanja iznad praga driftanja | "X više vozi postrance na granici" |
| prednja ravnoteža | **0,3** nazivnog vrha | "X više guta naprijed … Treba ga usporiti i okrenuti prije tjemena zavoja" |

Osobine u sažetku: *drži više prianjanja* / *ne može skretati jednako jako*, *ubrzava bolje* / *vuče manje*, *dosegne višu brzinu* / *dosegne nižu brzinu*, *još vuče na kraju ravnina* / *ostane bez vuče*, *staje jače* / *treba duže da stane*, *stabilniji je* / *lakše gubi stražnji dio* (*puno je kliznije …* kod dvostruko češće plus jedan; *treba češće hvatanje* na rahloj podlozi), *gura naprijed*. "Malo toga ga razlikuje od Y na ovim krugovima" kad nema razlike.

**Kako voziti svaki:**

- Jedan automobil više prianja, a drugi više vuče: u onom s prianjanjem nosite brzinu kroz sredinu na širokoj, okruglo vođenoj liniji (»U«). U jakom kočite ravno, okrenete ga u kratkoj, uskoj sredini i ispravite izlaz (»V«).
- Jedan automobil zaostaje u oba: njegov najbolji krug je najčistiji. Kočite ravno, na najširem radijusu, s punim gasom što ranije koliko ga drži.
- Automobil koji lakše gubi stražnji dio: dodajte gas tek kako se upravljanje odmata i kratko mijenjajte (klizanja na gasu), ili blago otpustite kočnicu i zadržite stalan gas kroz sredinu (klizanja pri ulasku).

Napomena ispod odjeljka ponavlja kako se svaka mjera računa.

## Što automobili odlučuju u zavoju {#what-the-cars-decide-in-a-corner}

Kad su krugovi u različitim automobilima, nalaz za svaki izgubljeni zavoj završava s **Automobili:** - što od toga odlučuju automobili i kako iskoristiti ovaj najbolje (`carNote`):

- **Kroz sredinu**, kad ovaj automobil drži manje od 96% prianjanja drugog, drugi je bio brži za više od 0,5 m/s u najsporijoj točki, a ovaj krug nije daleko ispod onoga što objašnjava njegovo prianjanje (više od 70% toga): na liniji drugog automobila prianjanje ovog dopušta `v_drugi · √(prianjanje_moje / prianjanje_drugog)`. Ako ga je krug nosio (unutar 1 m/s), razlika je automobil i nijedna točka kočenja je ne mijenja. Ako manje, koliko je još tu za dobiti. Zatim gdje se vrijeme može osvojiti umjesto toga: na ravninu, između dvije, ili u automobilu koji vuče 5% jače. Nakon tjemena (kočite ravno, skrenite kasnije, usmjerite ga na izlaz rano); inače najširi radijus koji cesta dopušta.
- **Stražnji dio koji je ovdje popustio** (neuhvaćeno klizanje ili okret, ili driftanje preko praga klizanja pri ulasku), u automobilu koji ga gubi najmanje jednom po krugu više i pola puta češće: što raditi u ovom automobilu. Gas dodan kako se volan odmata (njegova klizanja počinju na snazi 60% ili više vremena) ili kočnica blago otpuštena bez podizanja.
- **Ravnina nakon**: kad je vuča automobila objasnila 0,03 s ili više, jača vuča drugog automobila iz iste brzine, s vučom oba automobila od 120 do 200 km/h.
- **Najveća brzina**: kad je ovaj krug dosegao 98% mjesta gdje njegov automobil dosegne vrh na ravnini duljoj od 150 m, a drugi je išao 1,5 m/s brže: to je najveća brzina automobila, i svaki km/h više iz zavoja još pomaže dok ga ne dosegne.
- **Kočenje**: kad drugi automobil koči 5% jače, a ovaj krug je kočio više od 5 m ranije, dio ranijeg kočenja pripada automobilu.

Udio automobila također se izuzima iz samog vremena (vidi [udio automobila](race-corner-analysis.md#the-cars-share)), a zavoj gdje automobil objašnjava 60% ili više pripisuje se automobilu.

## Za razvojne programere {#for-developers}

Kod: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` u [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` u [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
