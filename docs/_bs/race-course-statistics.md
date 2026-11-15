---
title: "Statistika staze"
parent: "Analiza utrke"
nav_order: 57
lang: "bs"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statistika staze

Učitajte mnogo krugova jedne staze, pa pregledač broji greške: koja krivina najviše košta vremena, koliko je krugova tamo pogriješilo, i zašto. Koristite je da nađete krivinu koju vrijedi vježbati.

Probajte: **Demo krugovi** daje tri kruga, dovoljno da se ovaj odjeljak prikaže.

![Statistika staze s mapom grešaka: staza obojena prema tome koliko je krugova izgubilo vrijeme u svakoj krivini, i spisak krivina](../assets/img/en/race-course-mistake-map.webp)

Učitajte cijelu mapu staze - desetine krugova, nekoliko automobila, nekoliko performansnih klasa - pa se svaki krug ocjenjuje, zatim broji. Ova stranica pokriva poređenje po klasi, šta se računa kao greška, odjeljak **Statistika staze**, mapu grešaka, izvoz toplotne mape, staze iz nekoliko trka, i ograničenja performansi s mnogo krugova.

## Prema najboljem u vlastitoj klasi {#against-the-best-of-its-own-class}

Krug se upoređuje krivinu po krivinu s **najbržim kompletnim krugom u svojoj performansnoj klasi** (referenca, u klasi reference); sam taj krug s onim iz njegove klase ko je bio najbrži kroz svaku krivinu, ili s onim od svih krugova kada je sam u svojoj klasi. Automobili se grupišu prema performansnoj klasi igre (u Forzi, od D do X; C i S2 su dvije od njih). Tačka kočenja automobila klase C u odnosu na automobil S2 ništa ne govori o vožnji. Mapa vremena, razlike u spisku krugova i tabela *Krivina po krivina* prate isto poređenje (vidi [s kim se svaki krug upoređuje](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statistika se gradi na analizi svakog kruga, a ne pored nje.

## Šta se računa kao greška {#what-counts-as-a-mistake}

**Pojava** je greška jednog kruga u jednoj krivini (segmentu). Greške kruga u krivini su:

1. **Uzrok vožnje** koji je analiza našla za njegov gubitak tu - nalaz koji je gubitak, pripisan vozaču (a ne automobilu ili situaciji), i koji košta **0,05 s** ili više u odnosu na njegov krug za poređenje. Njegov trošak je gubitak u krivini.
2. **Svaka greška u upravljanju automobilom** koju je napravio tu, a koju drugi krug nije (nedijeljena), i koja košta **0,03 s** ili više - blokada, proklizavanje točkova, zadnji dio koji izlazi, guranje, izlet. Njen trošak je sam događaj.
3. **Svaki udarac i sudar**, dijeljen ili ne, bez obzira na cijenu.

U jednoj krivini može biti više njih; svaka vrsta se broji **jednom po krugu i krivini**. Dobici, udio automobila i sporiji dolazak odlučen u krivini prije nisu greške.

### Od nalaza do grešaka {#from-findings-to-mistakes}

| Nalaz | Greška |
|---|---|
| prebrzo ulazi, sporo izlazi, od kočenja nekoliko metara kasnije od drugog | Kočio prekasno |
| kočio rano | Kočio prerano |
| kočio nježno | Kočio preblago |
| blokada kao uzrok | Blokirao točak |
| jedrio (bez gasa) | Jedrio |
| ima prianjanja na raspolaganju, sporije do tjemena, kočio tamo gdje je drugi samo popustio gas | Prespor kroz sredinu |
| preuska linija | Preuska linija |
| izgurao na vanjsku stranu | Izgurao na vanjsku stranu |
| okrenuo automobil manje / previše | Pogrešno okrenuo automobil |
| na gasu kasnije, pun gas kasnije, oklijevao | Kasno na gasu |
| sporije iz krivine | Sporije izlazi |
| proklizavanje točkova | Proklizavanje točkova |
| zadnji dio je izašao, bočno kroz sredinu | Zadnji dio izašao |
| izašao van linije | Izašao van linije |
| izgubio brzinu | Izgubio brzinu |
| popustio gas (na ulazu ili na ravnom) | Popustio gas |
| skoro zaustavljanje, izlet, udarac ili sudar kao uzrok | Izletio / Udario nešto / Sudario se, kada događaji kruga tamo to pokazuju (prvo sudar, zatim izlet, zatim udarac); inače Skoro se zaustavio |
| duži let | Preletio predaleko |

Dva obrasca se broje kao uzrok nađen unutar njih, po istoj tabeli. *Dao je više na ulazu nego što je izlaz vratio* je greška uzroka svog ulaza: rano kočenje je *Kočio prerano*, blokada *Blokirao točak*, jedrenje *Jedrio*, neiskorišteno prianjanje *Prespor kroz sredinu*. *Prebrzo ulazi, sporo izlazi* je *Kočio prekasno* kada je krug kočio kasnije od drugog; inače greška uzroka njegovog izlaza - *Kasno na gasu*, *Proklizavanje točkova*, *Zadnji dio izašao*, *Izašao van linije*, *Sporije izlazi*. Obrazac čiji je uzrok automobil, ili sporiji dolazak, se ne broji.

Ne broji se: sporiji dolazak, start, svaki nalaz o *automobilu* (vuča, prianjanje, kočnice, pogon) i svaki dobitak ili krivina na nivou.

### Vrste, po redu {#the-kinds-in-their-order}

Kočenje: *Kočio prekasno*, *Kočio prerano*, *Kočio preblago*, *Blokirao točak*. Ulaz: *Jedrio*, *Prespor kroz sredinu*, *Preuska linija*, *Izgurao na vanjsku stranu*, *Pogrešno okrenuo automobil*. Izlaz: *Kasno na gasu*, *Sporije izlazi*, *Proklizavanje točkova*, *Zadnji dio izašao*, *Izašao van linije*, *Izgubio brzinu*. Ravno: *Popustio gas*. Incidenti: *Izletio*, *Udario nešto*, *Sudario se*, *Skoro se zaustavio*, *Preletio predaleko*.

## Odjeljak Statistika staze {#the-course-statistics-section}

Prikazuje se od **3** kruga na dalje, između **Krugovi** i **Gdje se poboljšati**.

- **Sažetak**: "40 krugova u 9 automobila, 3 klase: svaka krivina ocijenjena u odnosu na najbrži krug svoje klase." (automobili se broje po broju automobila ili po nazivu).
- **Čipovi klasa** (kada ima više klasa): **Sve** i po jedan čip za svaku klasu, sa brojem krugova, po redoslijedu igre (D, C, B, A, S1, S2, R, X, pa ostale). Kliknite klasu za njene krugove samo; **Shift+klik** dodaje ili uklanja jednu. Sve ispod - spiskovi, mapa, izvoz toplotne mape - prati izabrane klase.
- **Šta najčešće ide naopako**: svaka vrsta greške, s najviše krugova prvo (zatim najviše puta, zatim najveći trošak), najviše 8 (**Sve N vrsta** prikazuje ostale, **Manje** ih ponovo sakriva). Svaki red: njegov naziv, "N od M krugova", traka tog udjela, i "K puta · oko X s · najviše u T3 (5), T7 (4), T1 (2)" - koliko se često pravi (krug po krivini), koliko je sve skupa koštala, i tri krivine u kojima je najviše krugova to napravilo. **Klik na red** ga prikazuje na mapi grešaka (i uključuje mapu); ponovni klik za sve greške.
- **Krivina po krivini** (ili *Krivina po krivini - <greška>* kada je izabrana jedna): po segmentu, "N od M izgubilo vrijeme · X s" - krugovi koji su prošli cijelu krivinu, oni koji su tamo izgubili **0,05 s** ili više u odnosu na najbolji u svojoj klasi, i sve vrijeme koje su izgubili. Sažeto, navodi tri najčešće greške s brojem krugova. **Klik na krivinu** je otvara, uokviruje kamerom i prebacuje na mapu grešaka: za svaku grešku (ili samo onu izabranu) red poput "12 od 40 krugova je tu prerano kočilo. U 9 različitih automobila - oko 0,21 s svaki." i krugovi koji su je napravili, **najgori prvo**, svaki sa svojim troškom - najviše 8, "+N još" za ostale. **Klik na krug** ga fokusira i ponovo pušta tu grešku (poravnato 40 m prije nje).
- **Prikaži na toplotnoj mapi**: vidi dolje. "Pravim toplotnu mapu…" dok traje; onemogućeno kada nema grešaka.

## Mapa grešaka {#the-mistake-map}

**Prikaz → Mapa grešaka** boji duž referentne putanje koliko je krugova (izabranih klasa) napravilo grešku na svakom metru - svake vrste, ili one izabrane u statistici. Svaki krug se broji jednom po metru; raspon svake pojave (gdje su bili njen uzrok ili događaj) proširen je za 6 m s obje strane da bi se kratka vidjela. Šira i svjetlija tamo gdje je više krugova: širina `3 + 10 · (krugova ovdje / najviše krugova bilo gdje)` metara, boja od tamno smeđe do svijetlo narandžaste; sivi pojas od 2 m tamo gdje nijedan nije. Legenda: *malo krugova ↔ najviše krugova*.

Uz uključene **Oznake**, tjeme svake krivine nosi svoju najčešću grešku: "T3 · 12/40 rano kočenje" (krugovi koji su je napravili / krugovi koji su prošli krivinu), "T3 · 12/40" kada je izabrana jedna vrsta, "T3 · čisto" kada nijedna. Prelazak mišem preko oznake navodi gubitke krivine i njenih pet najčešćih grešaka; klik na nju otvara ili zatvara tu krivinu u statistici.

## Prikaži na toplotnoj mapi {#show-in-the-heatmap}

**Prikaži na toplotnoj mapi** šalje isto kartici Toplotna mapa kao skup podataka pod nazivom "Greške na <staza>" (ili "Greške na stazi"), pa cijeli alatni skup toplotne mape - načini toplote, filteri, vremenska linija, presjecanje - radi nad time gdje krugovi griješe.

To je CSV napravljen u memoriji (`mistakeTable`), jedan red po tački mreže (svakih 2 m) svake pojave, na **vlastitoj poziciji tog kruga** tamo:

| Kolona | Sadržaj |
|---|---|
| `x`, `y`, `z` | pozicija kruga na tom metru (koordinate igre) |
| `elapsed` | vrijeme kruga tamo, s |
| `lap` | oznaka kruga |
| `car` | naziv automobila (ili "car 1234") |
| `mistake` | naziv greške, na trenutnom jeziku |
| `car_class` | klasa, `-` kada nema |
| `corner` | oznaka krivine, `T3` |
| `cost` | trošak pojave, s |

Učitava se kroz vlastiti učitavač toplotne mape sa savjetima za mapiranje: Y gore, bez okretanja osa, razmjera 1; vrijeme `elapsed` u sekundama; **osoba** = `car`, **grupa** = `mistake`, **sesija** = `lap`; bez smjera pogleda; `car_class`, `corner` i `cost` zadržani kao kolone za filter. Kartica se zatim prebacuje na **Toplotna mapa** i uokviruje podatke. Izvoze se samo klase izabrane u statistici.

## Staze iz nekoliko trka {#courses-from-several-tracks}

Krugovi se analiziraju **jedna staza po jedna**. Mapa koja sadrži krugove nekoliko staza - cijela biblioteka krugova - nudi svaku stazu za učitavanje zasebno (s brojem krugova, najviše prvo); krugovi trka koje nisu završene (`unfinished/` iz FH Companion-a) idu uz svoju stazu, označeni *djelimično*. Krugovi nekoliko imenovanih staza izabranih kao datoteke nude se na isti način, a krugovi bez naziva staze idu uz onu koja je izabrana. Učitavanje krugova druge imenovane staze od onih koji su učitani zamjenjuje ih. Detalji: [Učitavanje krugova](race-loading-laps.md#folders-and-courses).

## Performanse s mnogo krugova {#performance-with-many-laps}

Desetine krugova se analiziraju za sekundu ili dvije (uvijek svi). Ono što se crta ograničeno je da prikaz ostane na brzini kadrova:

| Ograničenje | Vrijednost | Efekat |
|---|---|---|
| krugovi koji se crtaju podrazumijevano | 8 (`SHOW_ALL_UP_TO`) | nakon 8 učitanih krugova, novi dodani krugovi su sakriveni osim ako nisu referenca, fokusirani krug ili najbolji u svojoj klasi. **Prikaži sve** crta svaki krug; **Samo posmatrani** vraća. Fokusiranje kruga ga otkriva, zajedno s najboljim u njegovoj klasi |
| obični automobili i tanke linije | više od 10 vidljivih (`PLAIN_PAST`) | krugovi osim fokusiranog, gonjenog automobila i reference: tačka linije svakih 6 m (umjesto 1,5 m), automobili crtani obično |
| krugovi na grafikonu | 8 (`CHART_LAPS`) | fokus, najbolji iz klase i referenca prvo; "+N još nacrtano, nije na grafikonu" |
| kartice HUD-a | 6 | prvih šest vidljivih krugova |
| statistika | od 3 kruga | odjeljak je skriven ispod toga |
| nalazi navedeni | 12 vozača, 8 automobila/konteksta, 10 dobitaka | po fokusiranom krugu |
| prikazani parovi automobila | 3 | poslije 3 parova, jedan par s biračem |

Pojave grešaka se računaju jednom po analizi i keširaju; gustina mape grešaka kešira se po izboru klase i greške.

## Za programere {#for-developers}

Kod: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` u [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
