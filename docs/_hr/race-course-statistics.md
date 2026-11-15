---
title: "Statistika staze"
parent: "Analiza utrke"
nav_order: 57
lang: "hr"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistika staze

Učitajte mnogo krugova jedne staze, a preglednik će prebrojiti pogreške: koji zavoj najviše košta vremena, u koliko se krugova tamo pogriješilo i zašto. Koristite to da nađete zavoj koji vrijedi uvježbati.

Isprobajte: **Demo krugovi** daje tri kruga, dovoljno da se ovaj odjeljak pojavi.

![Statistika staze s kartom pogrešaka: staza obojena prema tome koliko je krugova izgubilo vrijeme u svakom zavoju, i popis zavoja](../assets/img/en/race-course-mistake-map.webp)

Učitajte cijelu mapu staze, desetke krugova, nekoliko automobila, nekoliko klasa performansi. Svaki krug se ocijeni, pa se prebroji. Ova stranica pokriva usporedbu po klasi, što se računa kao pogreška, odjeljak **Statistika staze**, kartu pogrešaka, izvoz toplinske karte, staze iz više utrka te granice performansi s mnogo krugova.

## Protiv najboljeg iz vlastite klase {#against-the-best-of-its-own-class}

Krug se uspoređuje zavoj po zavoj s **najbržim potpunim krugom svoje klase performansi** (referentni krug, u klasi referentnog). Taj krug sam se uspoređuje s onim iz svoje klase tko je bio najbrži kroz svaki zavoj, ili sa svakim krugom kad je sam u svojoj klasi. Automobili se grupiraju prema klasi performansi koju daje igra (u Forzi, od D do X; C i S2 su dvije od njih). Mjesto kočenja automobila klase C prema automobilu S2 ne govori ništa o vožnji. Karta vremena, razlike u popisu krugova i tablica *Zavoj po zavoj* prate istu usporedbu (vidi [s kim se svaki krug uspoređuje](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistika se gradi na analizi svakog kruga, a ne uz nju.

## Što se računa kao pogreška {#what-counts-as-a-mistake}

**Pojava** je jedna pogreška jednog kruga u jednom zavoju (segmentu). Pogreške kruga u zavoju su:

1. **Uzrok u vožnji** koji je analiza našla za njegov gubitak tamo. To je nalaz koji je gubitak, pripisan vozaču (ne automobilu ili situaciji), i koji košta **0,05 s** ili više u odnosu na njegov usporedni krug. Njegova cijena je gubitak u zavoju.
2. **Svaka greška u kontroli automobila** koju je tamo napravio, a koju drugi krug nije (nedijeljena), i koja košta **0,03 s** ili više. Blokiranje, proklizavanje, izlazak stražnjeg kraja, guranje i okret. Njezina cijena je vlastita cijena događaja.
3. **Svaki udarac i sudar**, dijeljeni ili ne, bez obzira na to koliko koštali.

U jednom zavoju može biti više njih. Svaka vrsta broji se **jednom po krugu i zavoju**. Dobici, udio automobila i sporiji dolazak zbog prethodnog zavoja nisu pogreške.

### Od nalaza do pogrešaka {#from-findings-to-mistakes}

| Nalaz | Pogreška |
|---|---|
| prebrzo ulazi, sporo izlazi, od kočenja više od nekoliko metara kasnije od drugoga | Prekasno kočenje |
| kočio rano | Prerano kočenje |
| kočio nježno | Preslabo kočenje |
| blokada kao uzrok | Blokiran kotač |
| kotrljao se | Kotrljanje |
| prianjanje na raspolaganju, sporije do tjemena, kočio tamo gdje je drugi samo otpustio gas | Presporo kroz sredinu |
| preuska linija | Preuska linija |
| gurao van | Podupravljanje |
| okrenuo automobil manje / previše | Pogrešno zarotiran automobil |
| kasnije na gasu, kasnije pun gas, oklijevao | Kasno na gas |
| sporije izlazi iz zavoja | Sporiji izlaz |
| proklizavanje kotača | Proklizavanje kotača |
| stražnji kraj izašao, bočno kroz sredinu | Zanošenje stražnjeg kraja |
| išao preširoko | Preširok izlaz |
| izgubio brzinu | Gubitak brzine |
| otpustio gas (na ulazu ili na ravnom dijelu) | Otpuštanje gasa |
| skoro zaustavljanje, okret, udarac ili sudar kao uzrok | Okret / Udarac u nešto / Sudar, kad događaji kruga ondje kažu koji (prvo sudar, zatim okret, pa udarac); inače Gotovo zaustavljanje |
| predug let | Predug let |

Dva obrasca broje se prema uzroku unutar njih, prema istoj tablici. *Dao je više na ulazu nego što je izlaz vratio* je pogreška uzroka svog unosa: rano kočenje je *Prerano kočenje*, blokada *Blokiran kotač*, kotrljanje *Kotrljanje*, neiskorišteno prianjanje *Presporo kroz sredinu*. *Prebrzo ulazi, sporo izlazi* je *Prekasno kočenje* kad je krug kočio kasnije od drugoga. Inače je to pogreška uzroka njegova izlaza: *Kasno na gas*, *Proklizavanje kotača*, *Zanošenje stražnjeg kraja*, *Preširok izlaz*, *Sporiji izlaz*. Obrazac čiji je uzrok automobil, ili sporiji dolazak, ne broji se.

Ne broji se: sporiji dolazak, start, svaki nalaz *automobila* (vuča, prianjanje, kočnice, pogon) te svaki dobitak ili zavoj jednake razine.

### Vrste, redom {#the-kinds-in-their-order}

Kočenje: *Prekasno kočenje*, *Prerano kočenje*, *Preslabo kočenje*, *Blokiran kotač*. Ulaz: *Kotrljanje*, *Presporo kroz sredinu*, *Preuska linija*, *Podupravljanje*, *Pogrešno zarotiran automobil*. Izlaz: *Kasno na gas*, *Sporiji izlaz*, *Proklizavanje kotača*, *Zanošenje stražnjeg kraja*, *Preširok izlaz*, *Gubitak brzine*. Ravni dio: *Otpuštanje gasa*. Incidenti: *Okret*, *Udarac u nešto*, *Sudar*, *Gotovo zaustavljanje*, *Predug let*.

## Odjeljak Statistika staze {#the-course-statistics-section}

Prikazuje se od **3** kruga, između **Krugovi** i **Gdje napredovati**.

- **Sažetak**: "40 krugova u 9 automobila, 3 klase: svaki ocijenjen zavoj po zavoj u odnosu na najbrži krug svoje klase." (automobili se broje po broju automobila ili po nazivu).
- **Oznake klasa** (kad ima više klasa): **Sve** i po jedna oznaka za svaku klasu, sa svojim brojem krugova, po redu igre (D, C, B, A, S1, S2, R, X, pa ostale). Kliknite klasu za njezine krugove same. **Shift+klik** dodaje ili uklanja jednu. Sve ispod (popisi, karta, izvoz toplinske karte) prati odabrane klase.
- **Što najčešće pođe po zlu**: svaka vrsta pogreške, prvo ona s najviše krugova (zatim s najviše puta, pa s najvećom cijenom), najviše 8. **Svih N vrsta** pokazuje ostale, a **Manje** ih ponovno skriva. Svaki red sadrži naziv, "N od M krugova", traku tog udjela i "K puta · oko X s · najviše u T3 (5), T7 (4), T1 (2)". To znači koliko se puta dogodila (po krugu i zavoju), koliko je ukupno koštala i tri zavoja u kojima ju je najviše krugova napravilo. **Kliknite red** da ga prikažete na karti pogrešaka (i uključite kartu). Kliknite ponovno za sve pogreške.
- **Zavoj po zavoj** (ili *Zavoj po zavoj - <pogreška>* kad je odabrana jedna): po segmentu, "N od M izgubilo je vrijeme · X s". To su krugovi koji su prošli cijeli zavoj, oni koji su tamo izgubili **0,05 s** ili više u odnosu na najbolji u svojoj klasi, i sve vrijeme koje su izgubili. Sažeto, prikazuje tri najčešće pogreške s brojem krugova. **Kliknite zavoj** da ga otvorite, uokvirite kamerom i prebacite na kartu pogrešaka. Za svaku pogrešku (ili samo za odabranu) pojavljuje se redak poput "12 od 40 krugova je ovdje prerano kočilo. U 9 različitih automobila, oko 0,21 s svaki." i krugovi koji su je napravili, **najgori prvi**, svaki s cijenom. Najviše 8, "+N još" za ostale. **Kliknite krug** da ga fokusirate i ponovno pustite tu pogrešku (poravnatu 40 m prije nje).
- **Prikaži na toplinskoj karti**: vidi dolje. Dok radi, piše "Izrada toplinske karte…". Onemogućeno kad nema pogrešaka.

## Karta pogrešaka {#the-mistake-map}

**Prikaz → Karta pogrešaka** duž referentne putanje boji koliko je krugova (odabranih klasa) napravilo pogrešku na svakom metru. Svaka vrsta, ili ona odabrana u statistici. Svaki krug broji se jednom po metru. Raspon svake pojave (gdje su bili njezin uzrok ili događaj) proširuje se za 6 m u obje strane, pa se i kratka vidi. Šira je i svjetlija tamo gdje je više krugova: širina `3 + 10 · (krugova ovdje / najviše krugova bilo gdje)` metara, boja od prigušene smeđe do svijetlonarančaste. Tamo gdje nitko nije pogriješio je siva traka od 2 m. Legenda: *malo krugova ↔ najviše krugova*.

Uz uključene **Oznake**, na tjemenu svakog zavoja piše njegova najčešća pogreška: "T3 · 12/40 rano kočenje" (krugovi koji su je napravili / krugovi koji su prošli zavoj), "T3 · 12/40" kad je odabrana jedna vrsta, "T3 · čisto" kad nijedna. Kad prijeđete mišem preko oznake, prikazuju se gubici zavoja i njegovih pet najčešćih pogrešaka. Klik na nju otvara ili zatvara taj zavoj u statistici.

## Prikaži na toplinskoj karti {#show-in-the-heatmap}

**Prikaži na toplinskoj karti** predaje isto kartici toplinske karte kao skup podataka imena "Pogreške na stazi <track>" (ili "Pogreške na stazi"). Tako cijeli alat toplinske karte (načini topline, filtri, vremenska os, rezanje) radi nad time gdje krugovi griješe.

To je CSV napravljen u memoriji (`mistakeTable`), jedan redak po točki mreže (svakih 2 m) za svaku pojavu, na **vlastitom položaju kruga** tamo.

| Stupac | Sadržaj |
|---|---|
| `x`, `y`, `z` | položaj kruga na tom metru (koordinate igre) |
| `elapsed` | vrijeme kruga tamo, s |
| `lap` | oznaka kruga |
| `car` | naziv automobila (ili "car 1234") |
| `mistake` | naziv pogreške, na trenutačnom jeziku |
| `car_class` | klasa, `-` kad nema |
| `corner` | oznaka zavoja, `T3` |
| `cost` | cijena pojave, s |

Učitava se kroz vlastiti učitavač toplinske karte uz savjete za mapiranje: Y gore, bez preokretanja osi, mjerilo 1; vrijeme `elapsed` u sekundama; **osoba** = `car`, **grupa** = `mistake`, **sesija** = `lap`; bez smjera pogleda; `car_class`, `corner` i `cost` ostaju kao stupci za filtriranje. Kartica zatim prelazi na **Toplinska karta** i uokviruje podatke. Izvoze se samo klase odabrane u statistici.

## Više staza {#courses-from-several-tracks}

Krugovi se analiziraju **jedna staza po jedna**. Mapa s krugovima nekoliko staza, cijela biblioteka krugova, nudi svaku stazu za učitavanje zasebno (s brojem krugova, najviše prvo). Krugovi vožnji koje nisu završene (`unfinished/` iz FH Companiona) idu uz svoju stazu i označeni su kao *djelomični*. Krugovi nekoliko imenovanih staza odabranih kao datoteke nude se na isti način, a krugovi bez imena staze idu uz onu koja je odabrana. Učitavanje krugova druge imenovane staze od onih učitanih zamjenjuje ih. Pojedinosti: [Učitavanje krugova](race-loading-laps.md#folders-and-courses).

## Rad s mnogo krugova {#performance-with-many-laps}

Desetci krugova analiziraju se za sekundu ili dvije (uvijek svi). Ono što se crta ograničeno je tako da prikaz ostane na brzini kadrova:

| Granica | Vrijednost | Učinak |
|---|---|---|
| krugovi koji se crtaju podrazumijevano | 8 (`SHOW_ALL_UP_TO`) | nakon 8 učitanih krugova, novi krugovi su skriveni osim ako su referentni, fokusirani ili najbolji u svojoj klasi. **Prikaži sve** crta svaki krug, a **Samo oni koji se gledaju** vraća na prethodno. Fokusiranje kruga ga otkriva, kao i najbolji u njegovoj klasi |
| obični automobili i tanke linije | više od 10 vidljivih (`PLAIN_PAST`) | krugovi osim fokusiranog, automobila koji se prati i referentnog: točka linije svakih 6 m (umjesto 1,5 m), automobili se crtaju obično |
| krugovi na grafikonu | 8 (`CHART_LAPS`) | prvo fokusirani, najbolji iz klase i referentni; "+N još nacrtano, nije na grafikonu" |
| kartice HUD-a | 6 | prvih šest vidljivih krugova |
| statistika | od 3 kruga | odjeljak je skriven ispod toga |
| nalazi na popisu | 12 vozača, 8 automobil/kontekst, 10 dobitaka | po fokusiranom krugu |
| prikazani parovi automobila | 3 | nakon 3 para, jedan par s biračem |

Pojave pogrešaka izračunavaju se jednom po analizi i spremaju u predmemoriju. Gustoća karte pogrešaka sprema se u predmemoriju po odabiru klase i pogrešci.

## Za razvojne programere {#for-developers}

Kod: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` u [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
