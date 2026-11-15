---
title: "Grafikoni i HUD"
parent: "Analiza utrke"
nav_order: 53
lang: "bs"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafikoni i HUD

Grafikoni poravnavaju vaše krugove metar po metar, pa možete vidjeti gdje je jedan vozač kasnije kočio ili ranije popustio gas. Kartice u gornjem lijevom uglu prikaza pokazuju šta svaki automobil i vozač radi upravo sada.

![Grafikoni ispod prikaza: redovi razmaka, brzine, gasa, kočnice i upravljanja za dva kruga, trake vremena i uzroka na vrhu, i kursor s karticama](../assets/img/en/race-charts-rows.webp)

## Grafikoni {#the-charts}

Svi krugovi na jednoj osi udaljenosti - metri duž reference (vidi [jedna osa udaljenosti](race-corner-analysis.md#one-distance-axis)) - pa isti x znači isto mjesto na stazi za svaki krug. Jedan krug se crta sam (i pušta se); druga vožnja iste staze se crta uz njega. Kada nema učitanih krugova (ili kada analiza nije uspjela), prostor kaže "Grafikoni se pojavljuju kada se učita krug; učitajte još jedan sa iste staze da ih uporedite."

### Šta je na njima {#what-is-on-them}

- **Legenda**: boja i oznaka svakog nacrtanog kruga, referenca označena s "(referenca)"; "+N još nacrtano, nije na grafikonu" kada je više krugova vidljivo nego što je na grafikonu; **Grafikoni (N) ▾**; **Cijeli krug** dok je zumirano; jedan red savjeta.
- **Dvije trake** na vrhu, za fokusirani krug:
  - *vrijeme*: [mapa vremena](race-replay-and-scene.md#time-map-where) kao traka, crveno za gubitak, zeleno za dobitak;
  - *uzrok*: svaki njegov gubitak kao traka iznad mjesta gdje je njegov uzrok, u boji uzroka; prelazak mišem preko trake daje njen naslov i trošak.
- **Pojasevi krivina**: osjenčeni pojas od ulaza do izlaza svake krivine (kako je nađena na referenci) i njen naziv (`T1` …) ispod ose na tjemenu.
- **Izabrani nalaz**: pojas u boji njegovog uzroka preko njegovog raspona.
- **Redovi** (grafovi), po jedan za svaki izabrani kanal, svaki s nazivom i gornjom i donjom vrijednošću raspona lijevo, nulta linija tamo gdje raspon prelazi nulu. Svaki krug je linija u svojoj boji: fokusirani krug 2 px širok i neproziran, referenca neprozirna, ostali 1,5 px na 75%. Red razmaka izostavlja referencu (prema sebi je nula).
- **Kursor**: vertikalna linija tamo gdje je referentni automobil (ili gdje je pokazivač), i tačka za svaki automobil na svakom redu osim razmaka - na kursoru je svaki automobil na istom metru; inače je svaki sopstvena udaljenost u satu reprodukcije.

Najviše **8** krugova je na grafikonu: fokusirani krug, najbolji iz svoje klase i referenca prvo, zatim ostali redom učitavanja.

### Redovi i njihove visine {#rows-and-their-heights}

Redovi dijele visinu grafikona prema težini, nijedan manji od 16 px:

| Red | Težina |
|---|---|
| Razmak (prema referenci, sekunde, sa znakom) | 1,7 |
| Brzina (km/h) | 1,7 |
| pedala (gas, kočnica, spojka) | 1 |
| upravljanje | 1,1 |
| stepen prijenosa | 0,8 |
| lampica (ručna kočnica, ABS …) | 0,55 |
| sve ostalo | 1 |

Kanal s fiksnim rasponom prikaza u tabeli (pedale 0-100%) koristi ga; ostali se prilagođavaju vidljivom dijelu krugova. Naziv reda koji je predug za prostor (dugačka riječ na drugom jeziku) pomjera gornju vrijednost za jedan red niže tamo gdje je red dovoljno visok, a skraćuje se trotačkom tamo gdje nije; puni naziv je u savjetu pri prelasku mišem.

### Podrazumijevani grafovi {#the-default-graphs}

Dok se grafovi ne izaberu: **razmak**, zatim svaki kanal koji tabela označava `graph` a koji krugovi imaju - gas, kočnica, spojka, ručna kočnica, upravljanje, stepen prijenosa, brzina - osim što se pedala ili lampica izostavlja osim ako je neki krug ne pomjeri preko 0,02 (spojka koja se nikada ne pritisne nije graf). Redoslijed je iz tabele.

### Birač grafova {#the-graph-picker}

**Grafikoni (N) ▾** otvara panel iznad dugmeta:

- polje za filter (traži po nazivu ili identifikatoru kanala);
- **Zadano** (vraća na podrazumijevani skup; savjet kaže koliko ih ima) i **Zatvori**;
- *Razmak prema referenci*, zatim svaki kanal koji nose krugovi na grafikonu, grupisan (kretanje, komande, motor, pomoćna sredstva, gume, kočnice, ovjes, točkovi, ostalo, vrijeme, pozicija), po jedno polje za štiklu; kanal po točku je jedan red s po jednim čipom za svaki točak (FL, FR, RL, RR).

Štikliranje zadržava redoslijed iz tabele bez obzira na redoslijed štiklanja. Izbor ostaje dok se ne klikne **Zadano** ili ne učita ponovo. Kanali koje tabela ne poznaje nude se pod *ostalo*, s nazivom iz njihovog vlastitog identifikatora ("brakeLinePress" → "Brake line press").

### Prelazak mišem, točkić, zum, klik {#hover-wheel-zoom-click}

| Unos | Radi |
|---|---|
| prelazak mišem | svaki automobil, njegova kartica i njegove komande pomjeraju se na taj metar; stub ga označava na stazi; tabela navodi vrijednost svakog nacrtanog kruga na svakom redu tamo (razmak prikazan kao "ref" za referencu); iznad kartica, "na N m – kursor grafikona". Pomjeranje van grafikona vraća na reprodukciju |
| točkić | pomjera reprodukciju duž kruga za 1/200 vidljivog raspona po zarezu (Shift: 5×), pauzirajući reprodukciju; kada je zumirano, prikaz prati kursor |
| Ctrl+točkić (Cmd+točkić) | zumira osu udaljenosti oko pokazivača, 1,25× van / 0,8× unutra po zarezu, nikada uže od 40 m; zumiranje van na cijeli krug završava zum |
| bočni točkić | pomjera pogled dok je zumirano (10% raspona po 100 jedinica pomjeranja) |
| dvostruki klik, **Cijeli krug** | zumiranje van |
| klik | skače reprodukciju na mjesto gdje referenca dostigne taj metar |
| Shift+klik | poredaje automobile tamo (vidi [poravnanje](race-replay-and-scene.md#lining-up)) |

Grafikoni se ponovo iscrtavaju na trenutnom jeziku kada se on promijeni.

Red savjeta u legendi kaže isto ukratko: "Prelazak mišem: svi automobili na tom mjestu · točkić: korak duž kruga · Ctrl+točkić: zum · klik: skok · Shift+klik: poredaj".

## Kartice automobila (HUD) {#the-car-cards-hud}

Gore lijevo u prikazu, po jedna kartica za svaki vidljivi krug - najviše **6**, prvih šest vidljivih krugova redom učitavanja - za trenutak u kojem je reprodukcija (ili kursor grafikona).

**Zaglavlje:** boja i oznaka kruga; uživo razmak - vrijeme ovog kruga da dostigne svoju trenutnu udaljenost minus vrijeme reference da dostigne istu udaljenost, "+0,48 s" - ili "referenca"; **⋯** da prikaže ili sakrije sve ostale vrijednosti (isto kao *Sve vrijednosti na karticama*). Kartica gonjenog automobila je istaknuta.

**Automobil odozgo:** obris karoserije u boji kruga sa strelicom naprijed, četiri gume (prednje okrenute do 28° s upravljanjem), svaka obojena prema svojoj temperaturi, s istim oznakama kao 3D automobil nacrtan ravno: prsten klizanja, traka ovjesa, sjaj kočnice, traka habanja, traka opterećenja.

**Očitavanja:** brzina u km/h, sopstveno vrijeme kruga, njegova udaljenost duž reference.

**Komande:**

- volan okrenut prema unosu upravljanja (puni zaokret nacrtan kao 180°) s procentom ispod;
- traka po pedali, s lijeva na desno kao u kutiji pedala - spojka, kočnica, gas - svaka s procentom i kratkim nazivom, u svojoj boji (samo pedale koje krug ima);
- stepen prijenosa (R za vožnju unazad, N za neutralni);
- mala lampica za svaki kanal uključeno/isključeno koji krug ima - ručna kočnica, ABS, TC, DRS, ograničavač u boksu, u vazduhu - svijetli u svojoj boji dok je uključen (iznad polovine svog raspona);
- očitavanje za svaki kanal nivoa: raspodjela kočnice, podešavanja ABS-a i TC-a, pojačanje, gorivo.

**Trag unosa:** posljednjih **6 sekundi** svake pedale (jedna traka, svaka u svojoj boji) i upravljanja (sopstvena traka, centrirana), koji se završava u ovom trenutku - šta je vozač radio na putu do njega. Do 160 tačaka.

**Sve vrijednosti** (⋯ ili *Sve vrijednosti na karticama*): svaka druga skalarna vrijednost koju krug ima u ovom trenutku, zatim svaki kanal po točku kao četiri vrijednosti (FL FR RL RR), nazvane iz tabele kanala ili iz vlastitog naziva kanala, poredane po grupi.

## Za programere {#for-developers}

Kod: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabela kanala {#the-channel-table}

`CHANNELS` u [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) je jedno mjesto gdje se kanal opisuje: njegova jedinica, da li je jedna vrijednost po uzorku ili jedna po točku (čuva se kao `name.FL` …), njegova grupa, raspon prikaza, kako se crta na automobilu (`glyph`), kako se pojavljuje na kartici (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), da li je podrazumijevani graf, da li se mijenja skokovito umjesto da se stapa (stepen prijenosa, zastavice), i kako se prikazuje (razmjera, jedinica, cifre). Oznake i kratki nazivi su poruke na svakom jeziku (`race.channel.<name>.label` / `.short`).

Kanali s crtanjem ili podrazumijevanim grafom:

| Kanal | Jedinica | Crta se kao | Podrazumijevani graf |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedala (zelena, crvena, …), prikazano u % | da |
| `handbrake` | 0..1 | lampica | da |
| `steer` | -1..1, desno pozitivno | volan | da |
| `gear` | - | stepen prijenosa | da |
| `speed` | m/s, prikazano km/h | - | da |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampica | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | očitavanje nivoa | - |
| `tireTemp` (po točku) | °C, prikaz 40-130 | boja gume | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (po točku) | kako ga igra skalira, prikaz ±1,5 | prsten klizanja | - |
| `combinedSlip`, `slipIndex` (po točku) | prikaz 0-1,5, 0-1 | prsten klizanja | - |
| `suspension` (po točku) | 0..1 | traka ovjesa | - |
| `brakeTemp` (po točku) | °C, prikaz 100-900 | sjaj kočnice | - |
| `tireWear` (po točku) | 0..1 | traka habanja | - |
| `wheelLoad` (po točku) | N, prikaz 0-12 000 | traka opterećenja | - |

Ostali u tabeli (na grafikonu i na spisku, ali se ne crtaju): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (ugao klizanja), `loose`, `lateral` (odstupanje od
reference), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, plus `time`, `distance`, `x`, `y`, `z`.

**Kanal koji nije u tabeli** se i dalje čita, crta na grafikonu (pod *ostalo*) i navodi na karticama, s oznakom iz vlastitog naziva. **Da mu date pravi naziv, jedinicu i crtanje**, dodajte jedan unos u tabelu (i njegovu poruku oznake u svaki `src/i18n/locales/<jezik>/race-channels.json`). Nova *vrsta* crtanja točka je jedan unos u `WHEEL_GLYPHS` (glyph.ts) i njegov ravni dvojnik `CARD_GLYPHS` (RaceHud.tsx); obje su tipizirane prema vrsti, pa build pada dok oba ne postoje. `src/race/extensible.test.ts` provjerava da nepoznati kanali dolaze do grafova, da se svaki glif iz tabele može nacrtati i da lampice svijetle.
