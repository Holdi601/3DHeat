---
title: "Sesije, osobe i grupe"
parent: "Unos podataka"
nav_order: 4
lang: "hr"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sesije, osobe i grupe

**Osoba** je jedna pokretna stvar (igrač, automobil). **Tim / grupa** je strana kojoj pripadaju. **Sesija** je jedna utakmica ili krug. Vidi [pojmovnik](glossary.md).

Jedan redak datoteke može imenovati sve tri:

| x | y | time | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` je osoba, `team` je grupa, `match` je sesija.

Tri neobavezna stupca opisuju *tko* i *gdje u priči* redak pripada. Svaki se pri učitavanju kodira kao rječnik: tekstualne vrijednosti postaju mali cjelobrojni id-ovi po retku, plus jedan popis oznaka koji dijele sve datoteke učitavanja.

## Osoba {#person}

Stupac **ID osobe** imenuje pokretnu stvar kojoj redak pripada: igrača, bota, automobil. Pohranjuje se kao 32-bitni id po retku.

S osobom i stupcem vremena, učitavanje računa **životni vijek** svakog retka: vrijeme do sljedećeg uzorka iste osobe *u istoj sesiji*, ili "nijedno" (oznaka, -1) kad sljedećeg uzorka nema: osoba je umrla, otišla ili je zapis završio. Trajanja pokreću povijest **Trajanje** na [vremenskoj osi](timeline.md), interpolaciju i zastarjelost u [box reprodukciji](box-replay.md) te prekide rute u [linijskoj toplini](line-heat.md). Što se radi s retkom bez sljedbenika, postavka je prikaza (*Rezervni vijek*), a ne ugrađeno u podatke.

Svaka osoba dobiva grupu svojeg **prvog** retka po vremenu. Ta dodjela boji njezin okvir u box reprodukciji i određuje kojoj grupi pripada prekidač vidljivosti koji ju tamo skriva. Načini topline koriste umjesto toga grupu svakog retka.

### Nazivi koje nosi više stvari odjednom {#names-worn-by-several-things-at-once}

Naziv nije uvijek jedan entitet: u nekim izvozima svaki bot svake utakmice se bilježi pod jednim nazivom. Spajanje dva uzorka takve "osobe" (interpolacijom, tragom ili rutom) povlači liniju između dva različita stvorenja preko karte.

Pri učitavanju ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) naziv se označava kao **zajednički** kad dva njegova zapisa:

- su u istoj sesiji,
- imaju isto vrijeme,
- su iste vrste (svaki zadržani stupac kategorije ima istu vrijednost), i
- su udaljeniji od 1 % dijagonale opsega podataka.

Zajednički nazivi crtaju se kao pojedinačni uzorci: bez interpolacije, bez traga, bez rute linijske topline. Sve ostalo o njima (njihova toplina) nije pogođeno. Panel Skup podataka navodi koliko je naziva označeno, s do tri primjera, a panel box reprodukcije ponavlja broj.

## Sesija {#session}

Stupac **Sesija / meč** kaže kojem meču, racija, rundi, vožnji ili krugu redak pripada. On čini da su uzorci osobe jedan neprekinuti trag: stvarna telemetrija često isprepliće istovremene utakmice, a uzorak igrača tik prije glave za reprodukciju i onaj tik poslije mogu biti iz različitih utakmica udaljenih stotinama metara. S stupcem sesije:

- interpolacija, tragovi i rute linijske topline nikad ne prelaze promjenu sesije;
- trajanje retka završava na kraju njegove sesije;
- izbornik **Sesija** pojavljuje se na vrhu bočne trake, ispod trake načina.

Stupac sesije vrlo je često *vremenska oznaka*, trenutak početka meča ponovljen na svakom retku tog meča. Automatsko mapiranje zato traži nazive sesija prije osobe i grupe ([Mapiranje stupaca](column-mapping.md#session-person-group)). Vožnja ili stint u utrci također je sesija: dva kruga istog automobila ne smiju se spojiti u jedan trag.

### Izbornik Sesija {#the-session-picker}

![Izbornik Sesija otvoren na datoteci s deset utakmica: Sve sesije (10), Meč 01, Meč 02 i tako dalje](../assets/img/en/sessions-persons-groups-picker.webp)

*Deset mečeva u jednoj datoteci: odaberite jedan ili pogledajte sve.*

Prikazuje se kad skup podataka ima navedene sesije (vidi granicu dolje).

| Dio | Značenje |
|---|---|
| Oznaka desno | Broj redaka odabrane sesije, ili *sve odjednom*. |
| Izbornik | *Sve sesije (N)*, zatim svaka sesija, najprometnija prva, kao `oznaka - N redaka, raspon` (raspon u sekundama ispod 90 s, u minutama ispod 90 min, u satima iznad toga). |
| Žuti savjet | Prikazuje se za *Sve sesije*: položaji se i dalje nikad ne spajaju preko sesija, ali istovremene utakmice na karti stavljaju zajedno nepovezane igrače. |
| Savjet | Prikazuje se u načinima topline kad je odabrana jedna sesija: odabir samo pomiče glavu na početak sesije. |

Pri učitavanju odabire se najprometnija sesija. Odabir sesije pomiče glavu na početak te sesije.

Što odabir mijenja:

- U **[box reprodukciji](box-replay.md)** određuje se koja se sesija reproducira: crtaju se samo kutije i tragovi te sesije, a raspon vremenske osi postaje vlastiti raspon sesije.
- U **načinima topline** ne ograničava toplinu, a savjet ispod izbornika to kaže: *U načinima topline ovo samo pomiče glavu na početak sesije; toplina i dalje broji svaku sesiju. Box reprodukcija reproducira samo odabranu sesiju.* Da ograničite toplinu na jednu sesiju, zadržite i stupac sesije kao stupac za filtriranje (*Zadrži za filtriranje*) i filtrirajte po njemu. Stupac može biti i stupac sesije i stupac filtra: učitavač čita svaki označeni stupac filtra zasebno, bez obzira na ulogu koju još ima.

### Previše sesija {#too-many-sessions}

Navodi se najviše **100 000** sesija. Iznad toga stupac je zapravo id (mapa s milijunima sesija od po nekoliko redaka), a slanje tolikog broja oznaka s radnika na stranicu je ono što iscrpi memoriju kartice. Učitavanje tada zadržava sesije **id-ove**, pa se granice i dalje poštuju svugdje, ali odbacuje oznake i izbornik, a panel Skup podataka to kaže.

## Grupa {#group}

Stupac **Tim / skupina** je bilo koji stupac s malo vrijednosti: tim, strana, odred, frakcija, zastavica igrač-protiv-AI-ja, klasa automobila. Pohranjuje se kao 16-bitni id po retku i pokreće:

- [popis timova](teams-list.md) (vidljivost po grupi, + / − strane),
- [toplinu timova](team-heat.md) (nijansa po grupi),
- [razliku](difference.md) podijeljenu po grupi,
- boje okvira u [box reprodukciji](box-replay.md) (obitelj nijansi po grupi, tonalitet po članu).

### Granice {#limits}

Najviše **4 096** različitih grupa. Id grupe nosi se u četvrtom kanalu teksela položaja svakog retka na GPU-u, a svaka grupa treba jedan teksel u tablici predznaka širokoj 4 096 koju sjenčar čita da odluči je li *skrivena*, *dodana* ili *oduzeta*. Stupac s više različitih vrijednosti je id, a ne grupa: **učitavanje zadržava svaki redak i odbacuje samo grupiranje**, uz upozorenje na skupu podataka koje predlaže da se stupac mapira kao stupac osobe ili da se zadrži kao stupac za filtriranje.

Ista granica od 4 096 vrijedi i za zadržani stupac filtra *kategorije*. Širi stupac se ne zadržava, a skup podataka to kaže. Brojčani stupac (na primjer vremenska oznaka) nema takvu granicu kao filtar *raspona*.

Vrijednosti grupe `0`, prazna vrijednost, `none`, `unknown`, `null` i `-1` (bez obzira na velika i mala slova) znače "bez grupe" za [toplinu timova](team-heat.md), koja ih crta neutralno sivo, a ne kao samouvjerenu boju.

## Veličina entiteta {#entity-size}

Koliko je velika jedna praćena stvar (kutija sudara igrača, automobil) određuje koliko su velike kutije i zrake pogleda [box reprodukcije](box-replay.md). Za to u panelu nema polja. Dolazi iz [savjeta `heat3d`](data-formats.md#the-heat3d-hints) datoteke (`entity.size`, u jedinicama same datoteke; pretvarač CS2 zapisuje 32). Učitavanje ga množi mjerilom jedinica.

Pri svakom učitavanju ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), uz *opseg* koji je veći od X i Z raspona podataka:

| Postavka | S veličinom entiteta | Bez nje |
|---|---|---|
| Veličina kocke | veličina entiteta | opseg / 500 |
| Duljina zrake pogleda | veličina entiteta × 4 | opseg / 200 |
| Polumjer spritea | opseg / 120 | opseg / 120 |
| Točka zasićenja | analitička procjena (zatim izmjerena) | isto |
| Brzina letenja | opseg / 12 | isto |
| Daleka ravnina | opseg × 12 | isto |
| Bliska ravnina | max(0,05, opseg / 20 000) | isto |

## Panel Skup podataka {#the-dataset-panel}

Ispod panela Izvor. Kad je skup podataka učitan, prikazuje:

- **ime** skupa podataka: odabir, broj redaka, broj datoteka, korak ako je korišten;
- **`N timova · N osoba · N s raspona`**;
- svako **upozorenje** koje je učitavanje stvorilo, žuto, dok je skup učitan: grupe ili stupac filtra odbačeni zbog previše vrijednosti, sesije koje nisu navedene, zajednički nazivi, nedostajući redci, preskočene datoteke;
- [sintetički generator](synthetic-generator.md);
- **Ukloni iz memorije**, koje uklanja skup podataka.

Broj redaka prikazan je u zaglavlju panela.
