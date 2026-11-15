---
title: "Grafikoni i HUD"
parent: "Analiza utrke"
nav_order: 53
lang: "hr"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafikoni i HUD

Grafikoni poravnavaju vaše krugove metar po metar, pa možete vidjeti gdje je jedan vozač kočio kasnije ili otpustio gas ranije. Kartice u gornjem lijevom dijelu prikaza pokazuju što svaki automobil i vozač upravo radi.

![Grafikoni ispod prikaza: redovi razlike, brzine, gasa, kočnice i upravljanja za dva kruga, trake vremena i uzroka na vrhu te kursor s karticama](../assets/img/en/race-charts-rows.webp)

## Grafikoni {#the-charts}

Svi krugovi su na jednoj osi udaljenosti: metri duž referentnog kruga (vidi [jednu os udaljenosti](race-corner-analysis.md#one-distance-axis)). Zato je isti x isto mjesto na stazi za svaki krug. Jedan krug se prikazuje sam (i reproducira se). Drugi krug iste staze prikazuje se u odnosu na njega. Bez učitanih krugova (ili kad analiza nije uspjela) područje piše: "Grafikoni se pojave kad se učita krug; učitajte još jedan krug iste staze da usporedite ta dva."

### Što je na njima {#what-is-on-them}

- **Legenda**: boja i oznaka svakog prikazanog kruga, referentni označen s "(referentni)". "+N još nacrtano, nije na grafikonu" kad je vidljivo više krugova nego što je na grafikonima. **Grafikoni (N) ▾**. **Cijeli krug** dok je zumirano. Jedan redak pomoći.
- **Dvije trake** na vrhu, za fokusirani krug:
  - *vrijeme*: [karta vremena](race-replay-and-scene.md#time-map-where) kao traka, crveno gdje gubi, zeleno gdje dobiva;
  - *uzrok*: svaki njegov gubitak kao stupac iznad mjesta njegova uzroka, u boji uzroka. Lebdenje mišem nad stupcem prikazuje naslov i cijenu.
- **Pojasevi zavoja**: zasjenjen pojas od ulaza do izlaza svakog zavoja (kako je nađen na referentnom krugu) i njegov naziv (`T1` …) ispod osi na tjemenu.
- **Odabrani nalaz**: pojas u boji njegova uzroka preko njegova raspona.
- **Redovi** (grafikoni), po jedan za svaki odabrani kanal, svaki s nazivom i gornjom i donjom vrijednošću raspona lijevo. Nulta linija tamo gdje raspon prelazi nulu. Svaki krug je linija u svojoj boji: fokusirani krug je širok 2 px i neproziran, referentni je neproziran, ostali su 1,5 px na 75 %. Redak razlike izostavlja referentni (njemu je uvijek nula).
- **Kursor**: okomita linija tamo gdje je referentni automobil (ili gdje je pokazivač), te točka za svaki automobil u svakom redu osim razlike. Na kursoru su svi automobili na istom metru. Inače je to vlastita udaljenost svakog automobila u trenutku sata reprodukcije.

Najviše **8** krugova prikazuje se na grafikonima: prvo fokusirani, najbolji iz svoje klase i referentni, zatim ostali redom učitavanja.

### Redovi i njihove visine {#rows-and-their-heights}

Redovi dijele visinu grafikona prema težini, a nijedan nije niži od 16 px:

| Red | Težina |
|---|---|
| Razlika (prema referentnom, u sekundama, s predznakom) | 1,7 |
| Brzina (km/h) | 1,7 |
| jedna pedala (gas, kočnica, kvačilo) | 1 |
| upravljanje | 1,1 |
| brzina prijenosa | 0,8 |
| lampica (ručna kočnica, ABS …) | 0,55 |
| sve ostalo | 1 |

Kanal s fiksnim prikazanim rasponom u tablici (pedale 0-100 %) koristi ga. Ostali se prilagođavaju vidljivom dijelu krugova. Naziv reda predugačak za prostor (duga riječ u drugom jeziku) pomiče gornju vrijednost za jedan red niže tamo gdje je red dovoljno visok, a skraćuje se točkicama tamo gdje nije. Puni naziv je u savjetu pri lebdenju.

### Zadani grafikoni {#the-default-graphs}

Dok se grafikoni ne odaberu: **razlika**, zatim svaki kanal koji tablica označava s `graph` i koji krugovi imaju: gas, kočnica, kvačilo, ručna kočnica, upravljanje, brzina prijenosa, brzina. Pedala ili lampica se izostavlja osim ako ih neki krug pomakne preko 0,02. (Kvačilo koje se nikad ne pritisne nije grafikon.) Redoslijed je onaj iz tablice.

### Izbornik grafikona {#the-graph-picker}

**Grafikoni (N) ▾** otvara panel iznad gumba:

- okvir za filtriranje (traži prema nazivu ili oznaci kanala);
- **Zadano** (vraća na zadani skup; savjet pri lebdenju kaže koliko ih je) i **Zatvori**;
- *Razlika prema referentnom*, zatim svaki kanal koji nose prikazani krugovi, grupiran (kretanje, unosi, motor, pomagala, gume, kočnice, ovjes, kotači, ostalo, vrijeme, položaj), s kućicom za svaki. Kanal po kotaču je jedan redak s oznakom za svaki kotač (FL, FR, RL, RR).

Označavanje zadržava redoslijed iz tablice, bez obzira na redoslijed označavanja. Izbor vrijedi dok se ne pritisne **Zadano** ili dok se ne ponovno učita. Kanali koje tablica ne poznaje nude se pod *ostalo*, a nazivaju se prema vlastitoj oznaci ("brakeLinePress" → "Brake line press").

### Lebdenje, kotačić, zumiranje, klik {#hover-wheel-zoom-click}

| Unos | Radi |
|---|---|
| lebdenje | svaki automobil, njegova kartica i njegovi unosi pomaknu se na taj metar. Stup ga označava na stazi. Tablica navodi vrijednost svakog prikazanog kruga na svakom redu tamo (razlika prikazana kao "ref" za referentni). Iznad kartica piše "na N m - kursor grafikona". Izlazak s crteža vraća na reprodukciju. |
| kotačić | pomiče reprodukciju duž kruga za 1/200 vidljivog raspona po zarezu (Shift: 5×), zaustavljajući reprodukciju. Dok je zumirano, prikaz prati kursor. |
| Ctrl+kotačić (Cmd+kotačić) | zumira os udaljenosti oko pokazivača, 1,25× van / 0,8× unutra po zarezu, nikad uže od 40 m. Zumiranje na cijeli krug prekida zumiranje. |
| bočni kotačić | pomiče prikaz dok je zumirano (10 % raspona po 100 jedinica pomaka) |
| dvostruki klik, **Cijeli krug** | zumiranje van |
| klik | reprodukcija skače tamo gdje referentni dođe do tog metra |
| Shift+klik | poravnava automobile tamo (vidi [poravnavanje](race-replay-and-scene.md#lining-up)) |

Grafikoni se ponovno iscrtavaju na trenutačnom jeziku kad se on promijeni.

Redak s oznakama u legendi kaže isto ukratko: "Lebdenje: svi automobili tamo · kotačić: korak duž kruga · Ctrl+kotačić: zumiranje · klik: skok · Shift+klik: poravnaj".

## Kartice automobila (HUD) {#the-car-cards-hud}

Gore lijevo u prikazu, po jedna kartica za svaki vidljivi krug, najviše **6**, prvih šest vidljivih krugova redom učitavanja, za trenutak u kojem je reprodukcija (ili kursor grafikona).

**Zaglavlje:** boja i oznaka kruga; uživo razlika, vrijeme ovog kruga da dođe do svoje trenutačne udaljenosti minus vrijeme referentnog da dođe do iste udaljenosti, "+0,48 s", ili "referentni"; **⋯** pokazuje ili skriva sve ostale vrijednosti (isto kao *Sve vrijednosti na karticama*). Kartica automobila koji se prati je istaknuta.

**Automobil odozgo:** obris karoserije u boji kruga sa strelicom sprijeda, četiri gume (prednje okrenute do 28° s upravljanjem), svaka obojena prema svojoj temperaturi, s istim oznakama kao 3D automobil nacrtan ravno: prsten klizanja, traka ovjesa, sjaj kočnice, traka habanja, traka opterećenja.

**Očitanja:** brzina u km/h, vlastito vrijeme kruga, njegova udaljenost duž referentnog.

**Komande:**

- upravljački kotač okrenut prema unosu upravljanja (puni zaokret prikazan kao 180°), s postotkom ispod;
- traka za svaku pedalu, s lijeva na desno kao u kutiji pedala: kvačilo, kočnica, gas, svaka s postotkom i kratkim nazivom, u svojoj boji (samo pedale koje krug ima);
- brzina prijenosa (R za vožnju unatrag, N za neutral);
- mala lampica za svaki kanal uključeno/isključeno koji krug ima: ručna kočnica, ABS, TC, DRS, ograničivač u boksu, u zraku. Svijetli u svojoj boji dok je uključen (iznad polovice svog raspona);
- očitanje za svaki kanal razine: raspodjela kočenja, postavke ABS-a i TC-a, pojačanje, gorivo.

**Trag unosa:** zadnjih **6 sekundi** svake pedale (jedna traka, svaka u svojoj boji) i upravljanja (vlastita traka, središnja), koji završavaju u ovom trenutku: što je vozač radio na putu do njega. Najviše 160 točaka.

**Sve vrijednosti** (⋯ ili *Sve vrijednosti na karticama*): svaka druga skalarna vrijednost koju krug ima u ovom trenutku, zatim svaki kanal po kotaču kao četiri vrijednosti (FL FR RL RR), nazvane prema tablici kanala ili prema vlastitom nazivu kanala, poredane po grupi.

## Za razvojne programere {#for-developers}

Kod: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tablica kanala {#the-channel-table}

`CHANNELS` u [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) jedino je mjesto gdje se kanal opisuje: njegova jedinica, je li jedna vrijednost po uzorku ili jedna po kotaču (pohranjeno kao `name.FL` …), njegova grupa, prikazani raspon, kako se crta na automobilu (`glyph`), kako se pojavljuje na kartici (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), je li zadani grafikon, je li skokovit a ne stapajući se (brzina prijenosa, zastavice) i kako se prikazuje (mjerilo, jedinica, decimale). Oznake i kratki nazivi su poruke na svakom jeziku (`race.channel.<name>.label` / `.short`).

Kanali s crtanjem ili zadanim grafikonom:

| Kanal | Jedinica | Crta se kao | Zadani grafikon |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedala (zelena, crvena, …), prikazano u % | da |
| `handbrake` | 0..1 | lampica | da |
| `steer` | -1..1, desno pozitivno | upravljački kotač | da |
| `gear` | - | brzina prijenosa | da |
| `speed` | m/s, prikazano km/h | - | da |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampica | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | očitanje razine | - |
| `tireTemp` (po kotaču) | °C, prikaz 40-130 | boja gume | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (po kotaču) | kako ih igra skalira, prikaz ±1,5 | prsten klizanja | - |
| `combinedSlip`, `slipIndex` (po kotaču) | prikaz 0-1,5, 0-1 | prsten klizanja | - |
| `suspension` (po kotaču) | 0..1 | traka ovjesa | - |
| `brakeTemp` (po kotaču) | °C, prikaz 100-900 | sjaj kočnice | - |
| `tireWear` (po kotaču) | 0..1 | traka habanja | - |
| `wheelLoad` (po kotaču) | N, prikaz 0-12 000 | traka opterećenja | - |

Ostali u tablici (na grafikonu i na popisu, ne crtaju se): `latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`, `bodySlip` (kut driftanja), `loose`, `lateral` (odmak od referentnog), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, te `time`, `distance`, `x`, `y`, `z`.

**Kanal koji nije u tablici** i dalje se čita, crta na grafikonu (pod *ostalo*) i navodi na karticama, a oznaka mu dolazi iz vlastitog naziva. **Da mu date pravi naziv, jedinicu i crtež**, dodajte jedan unos u tablicu (i njegovu poruku s oznakom u svaku `src/i18n/locales/<jezik>/race-channels.json`). Nova *vrsta* crteža kotača je jedan unos u `WHEEL_GLYPHS` (glyph.ts) i njegov ravni dvojnik `CARD_GLYPHS` (RaceHud.tsx). Oba su tipizirana prema vrsti, pa build pada dok oba ne postoje. `src/race/extensible.test.ts` provjerava da nepoznati kanali stižu na grafikone, da se svaki glif iz tablice može nacrtati i da lampice svijetle.
