---
title: "Reprodukcija i 3D scena"
parent: "Analiza utrke"
nav_order: 52
lang: "hr"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Ponavljanje i 3D scena

Pustite svoje krugove zajedno, kao utrku, i gledajte gdje se jedan automobil odvaja. Sve što vidite u 3D prikazu kartice **Analiza utrke** opisano je ovdje: vožene linije, boje na stazi, automobili i oznake.

![Karta uzroka s automobilima poravnatim 40 m prije zavoja: obojena staza, dva automobila i zastava](../assets/img/en/race-replay-lined-up.webp)

## Sat ponavljanja {#the-replay-clock}

Jedan sat pokreće svaki krug: sekunde **referentnog** kruga. Motor ga pomiče svaki okvir dok se reproducira (vrijeme okvira × brzina ponavljanja); na kraju se vraća na 0 kad je **Ponavljanje** uključeno, inače staje. Sat namjerno nije dio pohrane, pa se bočna traka ne iscrtava iznova svaki okvir; HUD i grafovi se pretplaćuju na njega i osvježavaju najviše jednom po okviru.

**Duljina ponavljanja** je najduže koliko koji krug traje na satu: vrijeme svakog kruga (umanjeno za njegov pomak u *Poravnato*), ili vrijeme reference u *Jedan uz drugog*.

## Traka za upravljanje {#the-transport-bar}

Ispod prikaza, s lijeva na desno:

| Kontrola | Radi |
|---|---|
| ⏮ | na početak (također **Home**) |
| ▶ / ❚❚ | reproduciraj / pauziraj (također **K**) |
| brzina | 0,25×, 0,5×, 1×, 2×, 4× |
| klizač za pretraživanje | postavlja sat izravno, u koracima od 0,01 s |
| sat | `vrijeme / duljina · metri`: sat kao vrijeme kruga, duljina ponavljanja i koliko je referentni automobil odmakao po referenci |
| *Od linije* / *Poravnato* / *Jedan uz drugog* | način ponavljanja (dolje) |
| **Poravnaj ovdje** | stavlja svaki automobil tamo gdje je referenca sada i nastavlja od tamo |
| **Ponavljanje** | počinje ispočetka na kraju (uključeno prema zadanom) |
| **Sakrij grafove** / **Prikaži grafove** | grafovi udaljenosti ispod trake |

Gumbi su onemogućeni dok nisu učitani krugovi (jedan krug je dovoljan za ponavljanje; usporedbe trebaju dva).

## Načini ponavljanja {#replay-modes}

Kako vlastito vrijeme svakog kruga slijedi iz sata:

| Način | Vlastito vrijeme kruga | Što prikazuje |
|---|---|---|
| **Od linije** (`start`) | sam sat | svaki krug od vlastitog starta: utrka među njima, razmak koji raste kao i na stazi |
| **Poravnato** (`anchor`) | sat plus pomak kruga | svaki automobil na istom mjestu u isto vrijeme, pa pušten - što se događa od te točke, a ne od početka kruga |
| **Jedan uz drugog** (`locked`) | vrijeme u kojem je krug došao do trenutne udaljenosti reference | svaki automobil držan na udaljenosti reference cijeli krug: brzine i unosi uspoređeni metar po metar |

Koristite kad:

- **Od linije**: želite vidjeti tko je ispred i kako razmak raste.
- **Poravnato**: želite znati što se događa u jednom zavoju ili na jednoj ravnini, uz to da svi kreću izjednačeno tamo.
- **Jedan uz drugog**: želite usporediti što vozači rade s pedalama i volanom na istom mjestu na stazi.

**Pomaci u *Poravnato*:** za sidro na `s` metara duž reference, pomak svakog kruga je njegovo vlastito vrijeme na `s` minus vrijeme reference na `s`, oba pročitana iz poravnatih krugova (vidi [jedna os udaljenosti](race-corner-analysis.md#one-distance-axis)). Krug koji ne pokriva `s` zadržava pomak 0. Odabir *Poravnato* iz gumba načina sidri se na trenutnoj udaljenosti reference.

Bijeli stup sa zastavom (visok 14 m) označava sidro u načinu *Poravnato*.

### Poravnavanje {#lining-up}

| Radnja | Sidro | Sat |
|---|---|---|
| **Poravnaj ovdje** | gdje je referenca sada | nepromijenjen |
| Shift+klik na grafovima | kliknuti metar | 1,5 s prije nego što referenca dođe do njega |
| nalaz u *Gdje napredovati*, numerirana oznaka na stazi, redak u *Zavoj po zavoj* s nalazom | 40 m prije mjesta gdje uzrok nalaza počinje | 1,5 s prije te točke; zatim se reproducira |
| događaj kontrole automobila, oznaka udarca | 40 m prije događaja | 1,5 s prije; zatim se reproducira |
| krug u statistici staze | kao njegov nalaz ili događaj | kao gore, uz taj krug u fokusu |

Gledanje nalaza također ga uokviruje kamerom - kugla oko sredine raspona nalaza, polumjera većeg od 40 m i polovice njegove duljine plus 30 m (60 m za događaj) - osim ako kamera ne prati automobil.

### Kamera za praćenje {#chase-camera}

⌖ na popisu krugova tjera kameru da prati taj automobil: 2,5 + 4 × veličina automobila metara iza njega i 0,9 + 1,1 × veličina automobila metara iznad, gledajući duž njegova smjera kretanja, nagnuta prema dolje ka automobilu, ublažena (20% puta svaki okvir) da ne drhti sa svakim njihanjem. Ponovni klik na ⌖ je oslobađa. Praćeni automobil crta se malo svjetlije, s bijelim prstenom na tlu, a njegova kartica je istaknuta.

## Odjeljak Prikaz {#the-view-section}

| Kontrola | Zadano | Radi |
|---|---|---|
| **Crte** / **Karta vremena** / **Karta uzroka** / **Karta pogrešaka** | Karta vremena | što se boji duž staze (dolje); *Crte* ne boji ništa |
| legenda | - | *dobiva ↔ gubi* za kartu vremena, boje uzroka za kartu uzroka, *malo krugova ↔ najviše krugova* za kartu pogrešaka |
| **Vožene linije** | uključeno | linija svakog vidljivog kruga u njegovoj boji |
| **Automobili** | uključeno | automobili i izvori kartica HUD-a |
| **Gume i ovjes** | uključeno | temperatura guma, prstenovi klizanja, šipke ovjesa i druge oznake po kotaču, te krovna svjetla na automobilima |
| **Oznake** | uključeno | nazivi zavoja, numerirane oznake, oznake udaraca, oznake zavoja na karti pogrešaka |
| **Staza iz krugova** | uključeno | površina ceste za stazu bez izvučenog modela (skriveno dok je model staze učitan) |
| **Sve vrijednosti na karticama** | isključeno | svaki kanal naveden na svakoj HUD kartici |
| **Stvarni oblici automobila** | uključeno | svaki automobil u obliku svog pandana (vidi [Automobili](#the-cars)); isključeno: otvoreni jednosjed, koji ništa od telemetrije ne skriva |
| **Veličina automobila** | 1× | od 1× do 10× u koracima od 0,5; 1× je stvarna veličina automobila, dugačak i širok koliko je u igri. Ništa osim ovog klizača to ne mijenja |

## Vožene linije {#driven-lines}

Putanja svakog vidljivog kruga kroz vlastite uzorke, u njegovoj boji, crtana 0,12 m ispod zabilježenog položaja (zabilježeni položaj automobila je njegova referentna točka, 0,28 do 0,47 m iznad ceste na izvučenim Forza stazama). Točka se zadržava svakih 1,5 m; s više od 10 vidljivih krugova, krugovi koji se ne gledaju zadržavaju po jednu točku svakih 6 m (svaki vrh šalje se na GPU svaki okvir).

## Karte {#the-maps}

Sve tri su trake duž putanje **reference**, 0,2 m ispod zabilježenih položaja, jedan četverokut po koraku mreže od 2 m.

### Karta vremena (`where`) {#time-map-where}

Za krug u fokusu: sekunde dobivene ili izgubljene po metru naspram kruga s kojim se uspoređuje u toj točki (najbolji u svojoj klasi, ili za referencu najbrži drugi krug kroz svaku dionicu), iz promjene poravnate delte po koraku mreže, izglađene preko ±10 m. Crveno gdje gubi vrijeme, zeleno gdje dobiva, sivo između; skala boja je 95. percentil apsolutnih vrijednosti, pa su šiljci odrezani i većina kruga je u rasponu. Širina 6 m.

### Karta uzroka (`why`) {#cause-map-why}

Za krug u fokusu: svaki gubitak naslikan je preko raspona gdje je njegov **uzrok** (ne gdje se vrijeme pokazuje), obojen prema grupi uzroka, pri čemu najskuplji nalaz pobjeđuje tamo gdje se dva preklapaju. Širina `3 + 9·√(cijena / najveća cijena)` metara; gdje ništa nije izgubljeno, siva traka od 2 m. Nalaz odabran u *Gdje napredovati* obojen je bijelo.

| Grupa | Boja | Nalazi |
|---|---|---|
| kočenje | narančasta | gubici vožnje u fazi kočenja |
| ulaz | magenta | gubici vožnje na ulasku i kroz sredinu |
| izlaz | plava | gubici vožnje na izlasku |
| ravnina | žuta | gubici vožnje na ravnini |
| automobil | siva | ono što objašnjava automobil |
| kontekst | tamno siva | situacija (start utrke naspram letećeg kruga) |

### Karta pogrešaka {#mistake-map}

Koliko je od svih krugova (klasa odabranih u statistici staze) napravilo pogrešku na svakom metru - svake vrste, ili samo onu odabranu u statistici. Svaki krug broji se jednom po metru; raspon svake pogreške proširen je za 6 m s obje strane da bi se i kratka vidjela. Širina `3 + 10·(krugova / najviše krugova)` metara i boja od tamno smeđe do svijetlo narančaste; siva traka od 2 m gdje nijedan krug nije pogriješio. Vidi [Statistika staze](race-course-statistics.md#the-mistake-map).

## Staza iz krugova {#track-from-the-laps}

Za igru čija staza nije izvučena, ispod linija se crta cesta: široka koliko se krugovi šire preko reference (bočni pomaci unutar 25 m se računaju) plus 2 m s obje strane, najmanje 4 m s obje strane linije reference, izglađena preko ±8 točaka mreže (±16 m), u sivoj boji asfalta sa svijetlim rubnim linijama, 0,3 m ispod zabilježenih položaja. Skrivena je dok je model staze učitan u **Razini**.

## Udarci i sudari na stazi {#hits-and-crashes-on-the-track}

Udarci i sudari svakog vidljivog kruga (vidi [Događaji kontrole automobila](race-control-events.md#hits-and-crashes)) označeni su mjestom gdje su se dogodili, kad god se crte ili automobili crtaju: šiljata zvijezda - crvena za sudar, jantarna za udarac - stoji na stupu, s prstenom u boji kruga pri dnu, veličine prema veličini automobila (sudari veći). Kad automobil prođe trenutak udarca, iz njega se za 0,8 s širi udarni prsten.

## Način pomoći {#help-mode}

**?** pored birača jezika, ili tipka **?** ili **F1**, uključuje ključ za svaku boju na zaslonu, na sve tri kartice ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Izbor ostaje u ovom pregledniku.

- **Ključ** u kutu prikaza navodi boje za karticu i način koji su u upotrebi. Svaka ljestvica dolazi odakle je prikaz uzima, pa se toplinska ljestvica koju ste uredili prikazuje kao uređena. Na kartici utrke navode se samo one vrijednosti koje učitani krugovi nose.
- **Kartica svakog automobila** dobiva tablicu onoga što je nacrtano na njegovim kotačima, po nazivu, s vrijednošću svakog kotača u boji u kojoj je nacrtana.
- **Automobil u fokusu** dobiva oznaku na svakom kotaču koja kaže isto, postavljenu van na uglovima. Skrivena je dok je automobil na zaslonu premali da bi stala.

## Automobili {#the-cars}

**Svaki automobil u vlastitom obliku**, u boji svog kruga i u stvarnoj veličini. Oblici dolaze iz datoteke automobila, napravljene jednom na računalu na kojem je igra:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bez nje, svaki automobil crta se kao **vlastiti automobil preglednika** svoje vrste i ere: limuzina, coupé, hatchback, karavan, sportski automobil, superautomobil, muscle car, terenac, pickup, kombi ili microcar, svaki kao klasik (prije 1980.), iz 80-ih i 90-ih, ili moderan ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Oni se ovdje grade od općenitih proporcija: bez logotipa, bez naziva modela i bez ičega iz datoteka ijedne igre, pa dolaze s preglednikom. Vrsta dolazi iz naziva automobila, era iz godine u njemu; automobil bez ijednog od toga uzima se prema svojoj klasi. Otprilike stotinu stvarnih generacija poznato je po objavljenoj dužini, širini, visini i međuosovinskom razmaku ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); po jedan redak, zaokruženo), pa 3 serije iz 1990-ih dobiva veličinu i stav tog automobila, i dalje kao običan oblik bez značke ili rešetke.

Datoteka automobila pravi se na vašem računalu iz vlastite kopije igre. Sadrži model svakog automobila niske razine detalja, oko 900 trokuta, s položajima kotača (vidi [naredbu `cars` alata za izvlačenje](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Učitaj datoteku s automobilima…** u postavkama prikaza, ili ispuštanje datoteke na karticu utrke, učitava je; ostaje u ovom pregledniku. Ona sadrži oblike igre, pa je ne treba prosljeđivati dalje, a preglednik ih ne isporučuje.

Koji automobil zamjenjuje automobil nekog kruga računa se iz onoga što je učitano svaki put i nikad se ne sprema, pa automobil bez zamjene danas dobiva svoj vlastiti čim novija datoteka ima jedan ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Automobil kruga | Crta se kao |
|---|---|
| njegov broj je u datoteci za istu igru | taj točno automobil |
| ista marka i riječ modela u nazivu | taj model, najbliži po godinama |
| ista marka, ista generacija | automobil te marke najbliži po godinama |
| bilo što drugo, s datotekom automobila | najbliži iste marke ako postoji, inače ista vrsta karoserije, najbliža po godinama |
| automobil s otvorenim kotačima, po nazivu | jednosjed dolje |
| nijedno od prva dva, a preglednik zna automobil po veličini | vlastiti automobil preglednika u stvarnoj veličini tog automobila, s datotekom ili bez nje |
| bilo što drugo bez datoteke | vlastiti automobil preglednika te vrste i ere |

Tako krug iz BMW 3 serije iz 1990. u drugoj igri prikazuje BMW otprilike te godine, a automobil noviji od datoteke prikazuje svog najbližeg rođaka dok se datoteka ne napravi ponovno. Opis kruga pri pokazivanju mišem i redak ispod veličine automobila za krug u fokusu kažu kako je nacrtan i koliko je to blizu.

Vlastiti automobili preglednika imaju tamne prozore. Modeli iz datoteke automobila su jedne boje po cijelom, jer datoteka nema boju ni staklo po čemu bi se ravnalo. Kotači, stražnja svjetla, lampe i oznake telemetrije crtaju se kao na jednosjedu; šipka ovjesa ide uz vanjsku stranu kotača, gdje se vidi, a A-kraci su izostavljeni.

**Jednosjed** je automobil s otvorenim kotačima u boji kruga, pa je prednji dio očit s bilo kojeg kuta i ništa ne skriva kotače: monokok, poklopac motora, bočni dijelovi, kokpit s kacigom, halo, pod, prednje i stražnje krilo; četiri okrugla kotača, prednji zakrenuti upravljanjem (do 0,5 rad pri punom zaokretu), svaki na dva A-kraka s uspravnim zglobom, poprečnom šipkom (naprijed) ili pogonskom osovinom (straga), i šipka ovjesa. Model je spušten 0,3 m ispod zabilježenog položaja da su kotači na cesti, i skaliran **Veličinom automobila**.

**Karoserija se kreće na svojim oprugama**: kad krug nosi sve četiri vrijednosti hoda ovjesa, svaki kut spušta se za svoj hod (naglašeno na 0,12 m od punog povrata do punog sabijanja da se vidi s kamere za praćenje), a karoserija tone, posrće i naginje na ravnini kroz sva četiri.

**Što se crta iz telemetrije** (uz uključene *Gume i ovjes*) prati [tablicu kanala](race-charts-and-hud.md#the-channel-table):

| Oznaka | Iz | Crtanje |
|---|---|---|
| boja gume | `tireTemp` | sama guma, plava kad je hladna → cijan → zelena radna → žuta → crvena vruća, preko 40-130 °C |
| prsten klizanja | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (najveći) | prsten na tlu pod kotačem, zelen s prionljivošću pri ruci, jantaran pri 0,66, crven pri 1 (rub prionljivosti kako je igra prijavljuje); blijed ispod 0,3 |
| traka ovjesa | `suspension` (0..1) | šipka ovjesa obojena prema hodu: plava kad je ispružena, bijela u sredini, crvena kad je sabijena |
| sjaj kočnice | `brakeTemp` (100-900 °C) | disk na vanjskoj strani kotača, od tamne do narančaste |
| traka habanja | `tireWear` (0..1) | traka oko ruba gaznog sloja, od bijele (nova) do crvene (istrošena) |
| traka opterećenja | `wheelLoad` (0-12 000 N) | stup uz kotač visok koliko je opterećenje |

Stop svjetla (kišno svjetlo i krajnje ploče krila) svijetle s pedalom kočnice. Svaki kanal `lamp` koji je uključen (iznad polovice svog raspona) pali lampu iznad usisnika zraka u svojoj boji: ABS u radu, kontrola proklizavanja u radu, DRS, ograničavač u boksu, ručna kočnica, u zraku.

**U gužvi** (više od 10 vidljivih), automobili koji se ne gledaju crtaju se jednostavno: karoserija, krila, kotači i stop svjetlo samo.

## Oznake {#labels}

Pričvršćene za stazu i postavljene svaki okvir iz projekcije kamere (izvan zaslona ili iza kamere, skrivene). Uz uključene **Oznake**:

| Oznaka | Gdje | Klik |
|---|---|---|
| nazivi zavoja (`T1`, `T2` …) | iznad apeksa svakog zavoja na referenci | - |
| numerirane oznake 1-5 | pet najvećih gubitaka vožnje kruga u fokusu, u sredini raspona svakog uzroka, obrubljene bojom uzroka; pokažite mišem za naslov i cijenu | poravnaj automobile i reproduciraj taj nalaz |
| oznake udarca / sudara | iznad svakog rafala **kruga u fokusu**: „Sudar −45 km/h” / „Udarac −12 km/h”; pokažite mišem za cijeli opis i savjet | poravnaj automobile i reproduciraj udarac |
| oznake zavoja na karti pogrešaka (umjesto naziva zavoja i oznaka, kad je karta pogrešaka) | apeks svakog zavoja: „T3 · 5/40 rano kočenje” (najčešća pogreška; krugovi koji su je napravili / krugovi koji su vozili zavoj), „T3 · 5/40” kad je odabrana jedna vrsta, „T3 · čisto” kad nijedna; pokažite mišem za gubitke zavoja i njegovih pet najčešćih pogrešaka | otvori ili zatvori taj zavoj u statistici staze |

## Zrcaljeni svjetovi {#mirrored-worlds}

Svijet preglednika je desnoruk, s Y prema gore: gledano odozgo, automobil čiji se smjer kretanja `atan2(dx, dz)` povećava skreće ulijevo. Igra s lijevoruko postavljenim svijetom - među njima Forza - prikazuje se zrcaljeno: svaki zavoj udesno nacrtan je kao zavoj ulijevo, i staza i krugovi.

Sami krugovi to kažu ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): hodajući svakim krugom po nekoliko metara (3 m odjednom), skretanje njegove putanje uspoređuje se sa sabijanjem vanjskog ovjesa (`suspension.FR` minus `suspension.FL`) i, bez ovjesa, s upravljanjem (pozitivno desno u svakom adapteru). Krug koji se ukupno skrene manje od π ništa ne kaže; dokaz se broji kad premaši 2% skretanja. Krugovi glasaju; neriješeno je „ne može se reći”.

Kad se glasanje krugova ne slaže s trenutnom inverzijom osi (neparan broj obrnutih osi u **Kamera i scena → Obrni os svijeta**), odjeljak **Krugovi** to kaže ispod popisa:

- igra je zrcaljena, a ništa nije obrnuto: „Ovi krugovi skreću udesno ondje gdje je staza nacrtana kao zavoj ulijevo …” s **Obrni X**;
- osi su obrnute, ali krugovi nisu zrcaljeni: „Obrnute osi iscrtavaju ove krugove zrcaljeno: skreću desno ondje gdje staza zavija lijevo …” s **Vrati osi**.

Mijenja se samo crtanje - zrcaljenje ugrađeno u matricu pogleda; podaci, analiza i svaka koordinata koju alati prikazuju ostaju igrine vlastite. Inverzija se čuva u pregledniku. Analiza imenuje zavoje ulijevo ili udesno istim mjerenjem (nepoznat svijet uzima se kao zrcaljen, kao što je Forzin).

## Za programere {#for-developers}

Kod: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Što je automobil u nekom trenutku {#what-a-car-is-at-a-moment}

`stateAt` interpolira svaki kanal između dva uzorka oko vremena kruga. Kanali koji skaču (mjenjač, zastave) uzimaju najbliži uzorak. Krug koji je završio parkira se na liniji.

**Smjer.** Smjer kretanja dolazi iz položaja udaljenih nekoliko metara (najmanje 2 m s obje strane, pa se njihanje ne okreće automobil). Smjer karoserije dolazi iz zakretanja igre tek kad je prilagođen smjeru kretanja - predznak i pomak, kružnom sredinom preko uzoraka brzih više od 10 m/s (barem 20) - i samo ako se tada slaže s njim (kružna varijanca ispod 0,05, oko 18° rasipanja); inače karoserija gleda duž smjera kretanja. To održava klizanje vidljivim (karoserija i smjer odvojeni) bez oslanjanja na konvenciju kuta igre.

**Upravljanje i strane.** Na koju stranu pozitivno upravljanje okreće automobil i kojoj strani pripadaju desni kotači igre mjeri se iz kruga: upravljanje naspram skretanja putanje i koja strana ovjesa se sabija na vanjskoj strani zavoja (bez podataka o ovjesu, Forza igre uzimaju se kao zrcaljene).
