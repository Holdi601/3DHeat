---
title: "Sesije, osobe i grupe"
parent: "Unos podataka"
nav_order: 4
lang: "bs"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sesije, osobe i grupe

**Osoba** je jedna stvar koja se kreće (igrač, automobil). **Tim/grupa** je strana kojoj pripadaju. **Sesija** je jedan meč ili krug. Vidi [rječnik](glossary.md).

Jedan red u datoteci može navesti sve tri:

| x | y | vrijeme | player | team | match |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Match 01 |

`player` je osoba, `team` je grupa, `match` je sesija.

Tri neobavezne kolone opisuju *kome* i *na kom mjestu u priči* red pripada. Svaka je kodirana rječnikom pri učitavanju: tekstualne vrijednosti postaju mali cjelobrojni identifikatori po redu plus jedan spisak oznaka, zajednički za svaku datoteku učitavanja.

## Osoba {#person}

Kolona **ID osobe** navodi stvar koja se kreće kojoj red pripada: igrača, bota, automobil. Čuva se kao 32-bitni identifikator po redu.

Uz kolonu osobe i kolonu vremena, učitavanje računa **životni vijek** svakog reda: vrijeme do sljedećeg uzorka iste osobe *u istoj sesiji*, ili "nema" (oznaka, -1) kada nema sljedećeg uzorka - osoba je poginula, otišla, ili se zapis završio. Životni vijek pokreće historiju **Životni vijek** [vremenske linije](timeline.md), interpolaciju i zastarjelost u [reprodukciji kutije](box-replay.md), i prekide ruta [toplote linija](line-heat.md). Šta red bez nasljednika radi je postavka gledanja (*Rezervni vijek*), a ne ugrađeno u podatke.

Svakoj osobi se dodjeljuje grupa njenog **prvog** reda po vremenu; ta dodjela boji njen okvir u reprodukciji kutije i određuje kojim prekidačem vidljivosti grupe se ona tamo sakriva. Načini toplote umjesto toga koriste grupu svakog reda posebno.

### Nazivi koje nosi nekoliko stvari istovremeno {#names-worn-by-several-things-at-once}

Naziv nije uvijek jedan entitet: u nekim izvozima svaki bot svakog meča se bilježi pod jednim nazivom. Spajanje dva uzorka takve "osobe" - interpolacijom, tragom ili rutom - crta liniju između dva različita stvorenja preko mape.

Pri učitavanju ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)) naziv se označava kao **dijeljen** kada su dva njegova zapisa

- u istoj sesiji,
- istog vremena,
- iste vrste (svaka zadržana kolona kategorije ima istu vrijednost), i
- udaljeni više od 1% dijagonale obuhvata podataka.

Dijeljeni nazivi se crtaju kao pojedinačni uzorci - bez interpolacije, bez traga, bez rute toplote linija. Sve ostalo o njima (njihova toplota) nije pogođeno. Panel Skup podataka navodi koliko je naziva označeno, s do tri primjera, a panel reprodukcije kutije ponavlja broj.

## Sesija {#session}

Kolona **Sesija / meč** kaže kojem meču, raciji, rundi, trci ili krugu red pripada. Ona čini da su uzorci jedne osobe jedna neprekidna staza: stvarna telemetrija često isprepliće istovremene mečeve, a uzorak igrača neposredno prije glave za reprodukciju i onaj neposredno poslije mogu biti iz različitih mečeva stotinama metara udaljenih. Uz kolonu sesije:

- interpolacija, tragovi i rute toplote linija nikada ne prelaze promjenu sesije;
- životni vijek reda završava se na kraju njegove sesije;
- izbornik **Sesija** se pojavljuje na vrhu bočne trake, ispod trake načina.

Kolona sesije je vrlo često *vremenski žig* - trenutak početka meča, ponovljen na svakom redu tog meča. Automatsko mapiranje zato traži nazive sesija prije osobe i grupe ([Mapiranje kolona](column-mapping.md#session-person-group)). Krug ili stint u trci je također sesija: dva kruga istog automobila ne smiju se spojiti u jednu stazu.

### Birač sesije {#the-session-picker}

![Birač sesije otvoren na datoteci od deset mečeva: Sve sesije (10), Match 01, Match 02 i tako dalje](../assets/img/en/sessions-persons-groups-picker.webp)

*Deset mečeva u jednoj datoteci: izaberite jedan ili pogledajte sve.*

Prikazuje se kada skup podataka ima navedene sesije (vidi ograničenje dolje).

| Dio | Značenje |
|---|---|
| Oznaka s desne strane | Broj redova izabrane sesije, ili *sve odjednom*. |
| Meni | *Sve sesije (N)*, zatim svaka sesija, najzaposlenija prva, kao `oznaka - N redova, raspon` (raspon u sekundama ispod 90 s, u minutama ispod 90 min, u satima iznad toga). |
| Žuti savjet | Prikazuje se za *Sve sesije*: pozicije se i dalje nikada ne spajaju preko sesija, ali istovremeni mečevi stavljaju nepovezane igrače zajedno na mapu. |
| Savjet | Prikazuje se u načinima toplote kada je izabrana jedna sesija: izbor samo pomjera glavu za reprodukciju. |

Pri učitavanju se bira najzaposlenija sesija. Biranje sesije pomjera glavu za reprodukciju na početak te sesije.

Šta izbor mijenja:

- U **[reprodukciji kutije](box-replay.md)** određuje koja sesija se reprodukuje: crtaju se samo kutije i staze te sesije, a raspon vremenske linije postaje sopstveni raspon sesije.
- U **načinima toplote** ne ograničava toplotu, a savjet ispod birača to kaže: *U načinima toplote ovo samo pomjera glavu za reprodukciju na početak sesije; toplota i dalje broji svaku sesiju. Reprodukcija kutije reproducira samo izabranu sesiju.* Da ograničite toplotu na jednu sesiju, zadržajte i kolonu sesije kao kolonu za filtriranje (*Zadrži za filtriranje*) i filtrirajte po njoj. Kolona može biti i kolona sesije i kolona filtera: učitavač čita svaku štiklanu kolonu filtera sama za sebe, bez obzira na ulogu koju još igra.

### Previše sesija {#too-many-sessions}

Navodi se do **100.000** sesija. Preko toga kolona je zaista identifikator (mapa s milionima sesija od po nekoliko redova), a slanje toliko oznaka sa radnika na stranicu je ono što iscrpi memoriju kartice. Učitavanje tada zadržava **identifikatore** sesija - pa se granice i dalje poštuju svuda - ali odbacuje oznake i birač, a panel Skup podataka to kaže.

## Grupa {#group}

Kolona **Tim / grupa** je bilo koja kolona s malo različitih vrijednosti: tim, strana, odred, frakcija, zastavica igrač-protiv-AI, klasa automobila. Čuva se kao 16-bitni identifikator po redu i pokreće:

- [Spisak timova](teams-list.md) (vidljivost po grupi, + / − strane),
- [toplotu tima](team-heat.md) (nijansa po grupi),
- [podjelu razlike](difference.md) po grupi,
- boje kutija u [reprodukciji kutije](box-replay.md) (porodica nijansi po grupi, tonalitet po članu).

### Ograničenja {#limits}

Najviše **4.096** različitih grupa. Identifikator grupe ide u četvrtom kanalu svakog teksela pozicije na GPU-u, a svaka grupa treba jedan teksel u tabeli predznaka širine 4.096 koju shader čita da odluči *sakriveno*, *dodano* ili *oduzeto*. Kolona s više različitih vrijednosti je identifikator, a ne grupa: **učitavanje zadržava svaki red i odbacuje samo grupisanje**, uz upozorenje na skupu podataka koje predlaže da je mapirate kao kolonu osobe, ili zadržite kao kolonu za filtriranje.

Isto ograničenje od 4.096 važi za zadržanu kolonu filtera *kategorije*; šira se ne zadržava, a skup podataka to kaže. Brojčana kolona (recimo vremenski žig) nema takvo ograničenje kao filter *raspona*.

Vrijednosti grupe `0`, prazna vrijednost, `none`, `unknown`, `null` i `-1` (bez obzira na velika i mala slova) znače "nema grupe" za [toplotu tima](team-heat.md), koja ih crta neutralno sivo umjesto kao sigurnu boju.

## Veličina entiteta {#entity-size}

Koliko je velika jedna praćena stvar - kolizioni okvir igrača, automobil - određuje koliko su veliki okviri i zraci pogleda [reprodukcije kutije](box-replay.md). Za to nema polja u panelu; dolazi iz [savjeta `heat3d`](data-formats.md#the-heat3d-hints) datoteke (`entity.size`, u jedinicama same datoteke; konverter CS2 upisuje 32). Učitavanje ga množi mjerilom jedinica.

Pri svakom učitavanju ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), uz *obuhvat* kao veći od raspona X i Z podataka:

| Postavka | Sa veličinom entiteta | Bez nje |
|---|---|---|
| Veličina kocke | veličina entiteta | obuhvat / 500 |
| Dužina zraka pogleda | veličina entiteta × 4 | obuhvat / 200 |
| Poluprečnik sprajta | obuhvat / 120 | obuhvat / 120 |
| Tačka zasićenja | analitička procjena (zatim mjerena) | isto |
| Brzina leta | obuhvat / 12 | isto |
| Daleka ravan | obuhvat × 12 | isto |
| Bliska ravan | max(0,05, obuhvat / 20.000) | isto |

## Panel Skup podataka {#the-dataset-panel}

Ispod panela Izvor. Kada je skup podataka učitan, prikazuje:

- **naziv** skupa podataka - izbor, broj redova, broj datoteka, korak kada je korišten;
- **`N timova · N osoba · N s raspona`**;
- svako **upozorenje** koje je učitavanje proizvelo, žutom bojom, dokle god je skup podataka učitan: grupe ili kolona filtera odbačene zbog previše vrijednosti, sesije nisu navedene, dijeljeni nazivi, nedostajući redovi, preskočene datoteke;
- [sintetički generator](synthetic-generator.md);
- **Ukloni iz memorije**, koje uklanja skup podataka.

Broj redova se prikazuje u zaglavlju panela.
