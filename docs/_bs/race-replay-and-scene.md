---
title: "Reprodukcija i 3D scena"
parent: "Analiza utrke"
nav_order: 52
lang: "bs"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Reprodukcija i 3D scena

Puštajte svoje krugove zajedno, kao trku, i gledajte gdje jedan automobil izlazi ispred. Ovdje je opisano sve što vidite u 3D prikazu kartice **Analiza utrke**: vožene linije, boje nanesene na stazu, automobili i oznake.

![Mapa uzroka sa automobilima poravnatim 40 m prije krivine: obojena staza, dva automobila i zastava](../assets/img/en/race-replay-lined-up.webp)

## Sat reprodukcije {#the-replay-clock}

Jedan sat pokreće svaki krug: sekunde kruga **reference**. Motor ga pomjera u svakom kadru dok se reprodukuje (vrijeme kadra × brzina reprodukcije); na kraju se vraća na 0 kada je uključeno **Ponavljanje**, inače se zaustavlja. Sat namjerno nije dio skladišta, da se bočna traka ne iscrtava iznova u svakom kadru; HUD i grafikoni se pretplaćuju na njega i ažuriraju najviše jednom po kadru.

**Dužina reprodukcije** je najduže koliko koji krug traje na satu: vrijeme svakog kruga (minus njegov pomak u režimu *Poredani*), ili vrijeme reference u režimu *Jedan uz drugi*.

## Traka za reprodukciju {#the-transport-bar}

Ispod prikaza, s lijeva na desno:

| Kontrola | Radi |
|---|---|
| ⏮ | nazad na početak (takođe **Home**) |
| ▶ / ❚❚ | reprodukcija / pauza (takođe **K**) |
| brzina | 0,25×, 0,5×, 1×, 2×, 4× |
| klizač za pretraživanje | postavlja sat direktno, u koracima od 0,01 s |
| sat | `vrijeme / dužina · metri`: sat kao vrijeme kruga, dužina reprodukcije, i koliko je daleko duž reference automobil reference |
| *Od starta* / *Poredani* / *Jedan uz drugi* | režim reprodukcije (dolje) |
| **Poredaj ovdje** | stavlja svaki automobil tamo gdje je referenca sada, i nastavlja od tu |
| **Ponavljanje** | počinje ispočetka na kraju (podrazumijevano uključeno) |
| **Sakrij grafikone** / **Prikaži grafikone** | grafikoni rastojanja ispod trake |

Dugmad su onemogućena dok krugovi nisu učitani (jedan krug je dovoljan za reprodukciju; poređenja traže dva).

## Režimi reprodukcije {#replay-modes}

Kako vrijeme svakog kruga proizlazi iz sata:

| Režim | Vrijeme svakog kruga | Šta prikazuje |
|---|---|---|
| **Od starta** (`start`) | sam sat | svaki krug od svog starta: trka među njima, razmak koji raste kao na stazi |
| **Poredani** (`anchor`) | sat plus pomak kruga | svaki automobil na istom mjestu u isto vrijeme, pa se pusti – šta se dešava od te tačke, a ne od početka kruga |
| **Jedan uz drugi** (`locked`) | vrijeme u kojem je krug stigao do trenutnog rastojanja reference | svaki automobil zadržan na rastojanju reference cijeli krug: brzine i unosi upoređeni metar po metar |

Koristite kada:

- **Od starta**: želite da vidite ko je ispred i kako razmak raste.
- **Poredani**: želite da znate šta se dešava u jednoj krivini ili na jednom pravcu, sa svima koji počinju jednako tamo.
- **Jedan uz drugi**: želite da uporedite šta vozači rade pedalama i volanom na istom mjestu staze.

**Pomaci u režimu *Poredani*:** za sidro na `s` metara duž reference, pomak svakog kruga je njegovo vrijeme na `s` minus vrijeme reference na `s`, oba očitana iz poravnatih krugova (vidi [jedna osa rastojanja](race-corner-analysis.md#one-distance-axis)). Krug koji ne pokriva `s` zadržava pomak 0. Odabir *Poredani* iz dugmadi režima postavlja sidro na trenutno rastojanje reference.

Bijeli stub sa zastavom (14 m visok) obilježava sidro u režimu *Poredani*.

### Poravnavanje {#lining-up}

| Radnja | Sidro | Sat |
|---|---|---|
| **Poredaj ovdje** | gdje je referenca sada | nepromijenjen |
| Shift+klik na grafikone | kliknuti metar | 1,5 s prije nego što ga referenca dostigne |
| nalaz u *Gdje se poboljšati*, broj na stazi, red u *Krivina po krivina* sa nalazom | 40 m prije mjesta gdje počinje uzrok nalaza | 1,5 s prije te tačke; zatim se pušta |
| događaj kontrole automobila, oznaka udarca | 40 m prije događaja | 1,5 s prije; zatim se pušta |
| krug u statistici staze | kao njegov nalaz ili događaj | kao gore, sa tim krugom u fokusu |

Gledanje nalaza takođe ga uokviruje kamerom – kugla oko sredine raspona nalaza, poluprečnik veći od 40 m i polovine njegove dužine plus 30 m (60 m za događaj) – osim kada kamera prati automobil.

### Kamera za praćenje {#chase-camera}

⌖ na listi krugova čini da kamera prati taj automobil: 2,5 + 4 × veličina automobila metara iza njega i 0,9 + 1,1 × veličina automobila metara iznad, gleda duž njegovog smjera kretanja, nagnuta prema dolje ka automobilu, ublažena (20% puta u svakom kadru) da ne podrhtava pri svakom njihanju. Ponovni klik na ⌖ je oslobađa. Automobil koji se prati crta se malo svjetlijim, sa bijelim prstenom na tlu, a njegova kartica je istaknuta.

## Odjeljak Prikaz {#the-view-section}

| Kontrola | Podrazumijevano | Radi |
|---|---|---|
| **Linije** / **Mapa vremena** / **Mapa uzroka** / **Mapa grešaka** | Mapa vremena | šta se boji duž staze (dolje); *Linije* ne boji ništa |
| legenda | - | *dobija ↔ gubi* za mapu vremena, boje uzroka za mapu uzroka, *malo krugova ↔ najviše krugova* za mapu grešaka |
| **Vožene linije** | uključeno | linija svakog vidljivog kruga u njegovoj boji |
| **Automobili** | uključeno | automobili i izvori kartica HUD-a |
| **Gume i ovjes** | uključeno | temperatura guma, prstenovi klizanja, šipke ovjesa i drugi znakovi po točku, i krovna svjetla na automobilima |
| **Oznake** | uključeno | nazivi krivina, brojevi na stazi, oznake udarca, oznake krivina na mapi grešaka |
| **Staza iz krugova** | uključeno | površina puta za stazu bez izvučenog modela (skriveno dok je učitan model staze) |
| **Sve vrijednosti na karticama** | isključeno | svaki kanal naveden na svakoj HUD kartici |
| **Stvarni oblici automobila** | uključeno | svaki automobil u obliku svog pandana (vidi [Automobili](#the-cars)); isključeno: otvoreni jednosjed, koji ne skriva ništa od telemetrije |
| **Veličina automobila** | 1× | od 1× do 10× u koracima od 0,5; 1× je stvarna veličina automobila, dugačak i širok koliko je u igri. Ništa osim ovog klizača ga ne mijenja |

## Vožene linije {#driven-lines}

Put svakog vidljivog kruga kroz sopstvene uzorke, u njegovoj boji, crtan 0,12 m ispod snimljene pozicije (referentna tačka automobila je 0,28 do 0,47 m iznad puta na izvučenim Forza stazama). Tačka se čuva svakih 1,5 m; sa više od 10 vidljivih krugova, krugovi na koje se ne gleda zadržavaju jednu svakih 6 m (svaki vrh ide na GPU u svakom kadru).

## Mape {#the-maps}

Sve tri su trake duž puta **reference**, 0,2 m ispod snimljenih pozicija, jedan četvorougao po koraku mreže od 2 m.

### Mapa vremena (`where`) {#time-map-where}

Za krug u fokusu: sekunde dobijene ili izgubljene po metru u odnosu na krug sa kojim se poredi u toj tački (najbolji u njegovoj klasi, ili za referencu najbrži drugi krug kroz svaku dionicu), iz promjene poravnate delte po koraku mreže, izglađene preko ±10 m. Crveno gdje gubi vrijeme, zeleno gdje dobija, sivo između; skala boja je 95. percentil apsolutnih vrijednosti, pa su šiljci odsječeni i većina kruga je u opsegu. Širina 6 m.

### Mapa uzroka (`why`) {#cause-map-why}

Za krug u fokusu: svaki gubitak nanesen preko raspona gdje je njegov **uzrok** (a ne gdje se vrijeme pokazuje), obojen grupom uzroka, sa najskupljim nalazom koji pobjeđuje tamo gdje se dva preklapaju. Širina `3 + 9·√(cijena / najveća cijena)` metara; gdje ništa nije izgubljeno, siva traka od 2 m. Nalaz izabran u *Gdje se poboljšati* je nanesen bijelo.

| Grupa | Boja | Nalazi |
|---|---|---|
| kočenje | narandžasta | gubici vozača u fazi kočenja |
| ulazak | magenta | gubici vozača na ulazu i kroz sredinu |
| izlaz | plava | gubici vozača na izlazu |
| pravac | žuta | gubici vozača na pravcu |
| automobil | siva | šta objašnjava automobil |
| okolnosti | tamnosiva | situacija (start trke naspram brzog kruga) |

### Mapa grešaka {#mistake-map}

Koliko je od svih krugova (klasa izabranih u statistici staze) napravilo grešku na svakom metru – svake vrste, ili samo ona izabrana u statistici. Svaki krug se broji jednom po metru; raspon svake greške se proširuje za 6 m sa svake strane da bi se kratka vidjela. Širina `3 + 10·(krugovi / najviše krugova)` metara i boja od tamnog smeđe do svijetlo narandžaste; siva traka od 2 m tamo gdje nijedan krug nije napravio grešku. Vidi [Statistika staze](race-course-statistics.md#the-mistake-map).

## Staza iz krugova {#track-from-the-laps}

Za igru čija staza nije izvučena, ispod linija se crta put: širok koliko se krugovi šire preko reference (bočni pomaci unutar 25 m se računaju) plus 2 m sa svake strane, najmanje 4 m sa svake strane linije reference, izglađen preko ±8 tačaka mreže (±16 m), u asfaltno sivoj boji sa svijetlim ivičnim linijama, 0,3 m ispod snimljenih pozicija. Skriveno dok je model staze učitan u **Nivo**.

## Udarci i sudari na stazi {#hits-and-crashes-on-the-track}

Udarci i sudari svakog vidljivog kruga (vidi [Događaji kontrole automobila](race-control-events.md#hits-and-crashes)) obilježeni su tamo gdje su se desili, kad god se crtaju linije ili automobili: šiljata zvijezda – crvena za sudar, jantarna za udarac – na stubu, sa prstenom u boji kruga na podnožju, veličine prema veličini automobila (sudari veći). Kada automobil prođe trenutak udarca, iz njega se za 0,8 s širi udarni prsten.

## Režim pomoći {#help-mode}

**?** pored birača jezika, ili tipka **?** ili **F1**, uključuje ključ za svaku boju na ekranu, na sva tri taba ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Izbor ostaje u ovom pregledaču.

- **Ključ** u uglu prikaza navodi boje za karticu i režim u upotrebi. Svaka skala dolazi odakle prikaz nju uzima, pa uređena toplotna skala prikazuje se kao uređena. Na kartici reli, navedeno je samo ono što učitani krugovi nose.
- **Kartica svakog automobila** dobija tabelu onoga što je nacrtano na njegovim točkovima, po nazivu, sa vrijednošću svakog točka u boji u kojoj je nacrtana.
- **Automobil u fokusu** dobija oznaku na svakom točku koja kaže isto, postavljenu van ugla. Sakrivena dok je automobil na ekranu premali da bi stale.

## Automobili {#the-cars}

**Svaki automobil u svom obliku**, u boji svog kruga i u stvarnoj veličini. Oblici dolaze iz datoteke automobila, napravljene jednom na računaru na kojem je igra:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bez nje, svaki automobil se crta kao **sopstveni automobil pregledača** svoje vrste i ere: limuzina, kupe, hečbek, karavan, sportski automobil, superautomobil, muscle car, terenac, pikap, kombi ili mikroautomobil, svaki kao klasik (prije 1980), iz 80-ih i 90-ih, ili savremeni ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Oni se ovdje prave od opštih proporcija: bez logotipa, bez naziva modela i bez ičega iz datoteka bilo koje igre, pa dolaze uz sam pregledač. Vrsta dolazi iz naziva automobila, era iz godine u njemu; automobil bez nijednog uzima se prema svojoj klasi. Oko stotinu stvarnih generacija poznato je po objavljenoj dužini, širini, visini i međuosovinskom rastojanju ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); po jedan red, zaokruženo), pa BMW serije 3 iz 90-ih dobija veličinu i stav tog automobila, i dalje kao običan oblik bez znaka ili rešetke.

Datoteka automobila pravi se na vašem računaru iz vaše sopstvene kopije igre. Sadrži model svakog automobila niskog detalja, oko 900 trouglova, sa pozicijama točkova (vidi [`cars` komandu alata za izdvajanje](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Učitaj datoteku s automobilima...** u postavkama prikaza, ili prevlačenje datoteke na karticu za utrku, učitava je; ostaje u ovom pregledaču. Sadrži oblike igre, pa je ne treba dalje slati, a pregledač ih ne isporučuje.

Koji automobil stoji umjesto automobila kruga računa se svaki put iz onoga što je učitano i nikad se ne čuva, pa automobil bez pandana danas dobija svoj čim novija datoteka ima ga ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Automobil kruga | Crta se kao |
|---|---|
| njegov broj je u datoteci za istu igru | taj tačno automobil |
| ista marka, i riječ modela u nazivu | taj model, najbliži po godinama |
| ista marka, ista generacija | automobil te marke najbliži po godinama |
| bilo šta drugo, uz datoteku automobila | najbliži iste marke ako ga ima, inače isti tip karoserije, najbliži po godinama |
| automobil sa otvorenim točkovima, po nazivu | jednosjed ispod |
| nijedan od prva dva, a pregledač poznaje automobil po njegovoj veličini | sopstveni automobil pregledača u veličini tog pravog automobila, sa datotekom ili bez nje |
| bilo šta drugo bez datoteke | sopstveni automobil pregledača te vrste i ere |

Tako krug BMW-a serije 3 iz 1990. u drugoj igri prikazuje BMW iz otprilike te godine, a automobil noviji od datoteke prikazuje svog najbližeg srodnika dok se datoteka ponovo ne napravi. Oznaka kruga i red ispod veličine automobila za krug u fokusu kažu kako je prikazan i koliko je to blizu.

Sopstveni automobili pregledača imaju tamne prozore. Modeli iz datoteke automobila su jedne boje po cijelom, jer datoteka nema boju ni staklo na osnovu čega bi se radilo. Točkovi, zadnja svjetla, farovi i znakovi telemetrije ispod crtaju se kao na jednosjedu; šipka ovjesa ide uz spoljnu stranu točka, gdje se vidi, a ručice se izostavljaju.

**Jednosjed** je bolid sa otvorenim točkovima u boji kruga, pa je naprijed očigledno sa svakog ugla i ništa ne skriva točkove: karoserija, poklopac motora, bočni dijelovi, kokpit sa kacigom, halo, pod, prednje i zadnje krilo; četiri okrugla točka, prednji okretani volanom (do 0,5 rad pri punom skretanju), svaki na dvije ručice sa uspravnom osovinom, poprečnom šipkom (prednji) ili pogonskom osovinom (zadnji), i šipkom ovjesa. Model je spušten 0,3 m sa snimljene pozicije tako da su točkovi na putu, i skaliran dugmetom **Veličina automobila**.

**Karoserija se kreće na svojim oprugama**: kada krug nosi sva četiri hoda ovjesa, svaki ugao spušta se za svoj hod (pojačan na 0,12 m od punog pada do pune amortizacije da bi se vidio sa kamere za praćenje), a karoserija tone, naginje i valja se po ravni kroz sva četiri.

**Šta se crta iz telemetrije** (sa uključenim *Gume i ovjes*) prati [tabelu kanala](race-charts-and-hud.md#the-channel-table):

| Znak | Iz | Crtanje |
|---|---|---|
| boja gume | `tireTemp` | sama guma, plava hladna → cijan → zelena radna → žuta → crvena vruća, preko 40-130 °C |
| prsten klizanja | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (najveći) | prsten na tlu ispod točka, zelen dok ima prianjanja, jantaran na 0,66, crven na 1 (granica prianjanja kako je igra prijavljuje); blijed ispod 0,3 |
| traka ovjesa | `suspension` (0..1) | šipka ovjesa obojena prema hodu: plava ispružena, bijela srednja, crvena sabijena |
| sjaj kočnice | `brakeTemp` (100-900 °C) | disk na spoljnoj strani točka, od tamne do narandžaste |
| traka habanja | `tireWear` (0..1) | traka oko ivice gazećeg sloja, bijela nova → crvena istrošena |
| traka opterećenja | `wheelLoad` (0-12 000 N) | stub pored točka visok koliko je opterećenje |

Svjetla kočnice (svjetlo za kišu i krajevi krila) svijetle sa pedalom kočnice. Svaki kanal `lamp` koji je uključen (iznad polovine svog raspona) pali svjetlo iznad usisnika u svojoj boji: ABS u radu, kontrola proklizavanja u radu, DRS, ograničavač u boksu, ručna kočnica, u vazduhu.

**U gužvi** (više od 10 vidljivih), automobili na koje se ne gleda crtaju se prosto: karoserija, krila, točkovi i svjetlo kočnice.

## Oznake {#labels}

Pričvršćene za stazu i postavljene u svakom kadru iz projekcije kamere (van ekrana ili iza kamere, skrivene). Kada su **Oznake** uključene:

| Oznaka | Gdje | Klik |
|---|---|---|
| nazivi krivina (`T1`, `T2` …) | iznad tjemena svake krivine na referenci | - |
| brojevi na stazi 1-5 | pet najvećih gubitaka vozača kruga u fokusu, u sredini raspona svakog uzroka, sa ivicom u boji uzroka; pređite mišem za naslov i cijenu | poravnaj i reprodukuj taj nalaz |
| oznake udarca / sudara | iznad svakog naleta **kruga u fokusu**: „Sudar −45 km/h“ / „Udarac −12 km/h“; pređite mišem za cijeli opis i savjet | poravnaj i reprodukuj udarac |
| oznake krivina na mapi grešaka (umjesto naziva krivina i brojeva kada je mapa mapa grešaka) | tjeme svake krivine: „T3 · 5/40 rano kočenje“ (najčešća greška, krugovi koji su je napravili / krugovi koji su vozili krivinu), „T3 · 5/40“ kada je izabrana jedna vrsta, „T3 · čisto“ kada nijedna; pređite mišem za gubitke krivine i njenih pet najčešćih grešaka | otvori ili zatvori tu krivinu u statistici staze |

## Ogledalski svjetovi {#mirrored-worlds}

Svijet u pregledu je desnoruk sa Y prema gore: gledano odozgo, automobil čiji se smjer kretanja `atan2(dx, dz)` povećava skreće lijevo. Igra sa lijevorukim svijetom – među njima Forza – prikazuje se ogledalski: svaka desna krivina nacrtana kao lijeva, i staza i krugovi.

Krugovi sami to kažu ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): hodajući svakim krugom po nekoliko metara (3 m) odjednom, skretanje njegove putanje poredi se sa sabijanjem spoljnog ovjesa (`suspension.FR` minus `suspension.FL`) i, bez ovjesa, sa volanom (pozitivan udesno kod svakog adaptera). Krug koji se ukupno okrene za manje od π ništa ne kaže; dokaz se računa kada prelazi 2% skretanja. Krugovi glasaju; neriješeno je „ne može se reći“.

Kada se presuda krugova ne slaže sa trenutnom inverzijom osa (neparan broj obrnutih osa u **Kamera i scena → Obrni osu svijeta**), odjeljak **Krugovi** to kaže ispod liste:

- igra je ogledalska a ništa nije obrnuto: „Ovi krugovi skreću desno gdje je staza nacrtana kako skreće lijevo …“ sa **Obrni X**;
- ose su obrnute ali krugovi nisu ogledalski: „Obrnute ose crtaju ove krugove kao ogledalske …“ sa **Vrati ose**.

Mijenja se samo crtanje – refleksija složena u matricu pogleda; podaci, analiza i svaka koordinata koju alati prikazuju ostaju igrini sopstveni. Inverzija se čuva u pregledaču. Analiza imenuje krivine lijevo ili desno istim mjerenjem (nepoznat svijet se uzima kao ogledalski, kao Forzin).

## Za programere {#for-developers}

Kod: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Gdje je automobil u nekom trenutku {#what-a-car-is-at-a-moment}

`stateAt` interpolira svaki kanal između dva uzorka oko vremena kruga. Kanali koji skaču (stepen, zastavice) uzimaju najbliži uzorak. Krug koji je završen parkira se na liniji.

**Smjer.** Smjer kretanja dolazi iz pozicija udaljenih nekoliko metara (najmanje 2 m sa svake strane, da se njihanje ne okrene automobil). Smjer karoserije dolazi iz Forzinog skretanja samo kada je uklopljen u smjer kretanja – znak i pomak, kružnom sredinom preko uzoraka bržih od 10 m/s (najmanje 20) – i samo ako se onda slaže sa njim (kružna varijansa ispod 0,05, oko 18° rasipanja); inače karoserija gleda duž smjera kretanja. Tako klizanje ostaje vidljivo (karoserija i kretanje razdvojeni) bez oslanjanja na igrinu konvenciju uglova.

**Volan i strane.** U kom smjeru pozitivan skret okreće automobil, i kojoj strani pripadaju igrini desni točkovi, mjeri se iz kruga: volan naspram skretanja putanje, i čiji ovjes se sabija na spoljnoj strani krivina (bez podataka o ovjesu, Forza igre se uzimaju kao ogledalske).
