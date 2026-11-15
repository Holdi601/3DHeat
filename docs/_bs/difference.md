---
title: "Razlika"
parent: "Načini toplote"
nav_order: 5
lang: "bs"
source: "difference.md"
source_hash: "9db62413b59c"
translated: true
outdated: false
---

# Razlika

Crveno tamo gdje je tim A bio više, zeleno-plavo tamo gdje je bio tim B, ništa tamo gdje su bili jednaki.

**Razlika** (taster 2) je predznačena toplota. Redovi jedne populacije dodaju toplotu; redovi druge je oduzimaju. Tamo gdje se dvije preklapaju ravnomjerno, rezultat je nula i potpuno proziran; tamo gdje jedna dominira, prikazuje se u bojama te strane - podrazumijevano toplo (proziran → crveno → žuto → bijelo) za stranu **+** i hladno (proziran → zeleno → plavo → ljubičasto) za stranu **−**.

![Toplota razlike: crveno tamo gdje je strana + bila više, zeleno i plavo tamo gdje je strana − bila više](../assets/img/bs/difference-split.webp)

## Kako se koristi {#how-to-use-it}

1. Pritisnite `2` (ili izaberite **Razlika** u traci načina).
2. Otvorite **Podjela razlike** u bočnoj traci.
3. Izaberite šta da **Podijelite po**: obično *Grupe*.
4. Stavite jednu grupu (ili vrijednost) na **+**, a drugu na **−**.
5. Pročitajte boje: toplo znači stranu +, hladno znači stranu −. Panel upozorava ako jedna strana nema redova (vidi [Poruke koje možete vidjeti](#messages-you-may-see)).

*Koje* dvije populacije je cijelo pitanje, pa podjela može biti bilo koja zadržana kolona, ne samo grupe. Redovi koji padnu na **nijednu** stranu su **izostavljeni**, a ne brojeni kao nula: zato podjela nad dvije od mnogo vrijednosti poredi tačno te dvije, i slaže se s [filterima](filters.md) - filtrirajte na jednu mapu, pa podijelite to po verziji.

Način treba dvije strane: kolonu grupe s najmanje dvije grupe, ili podjelu nad kolonom zadržanom za filtriranje. Na podacima s manje od dvije grupe učitavanje počinje s podjelom po koloni - prvo kolona *Source file* kod učitavanja više datoteka, inače prva kolona kategorije s dvije vrijednosti, inače prva brojčana kolona s rasponom - tako da *uporedi dva učitavanja* radi i na podacima bez ijedne grupe. Samo podaci bez ičega od toga ostavljaju način nedostupnim; isto tako podjela kolone koja na jednoj strani nema ništa.

## Panel Podjela razlike {#the-difference-split-panel}

Prikazuje se u načinu Razlika, ispod panela toplote.

**Podijeli po** nudi:

| Opcija | Prikazano kao | Pravilo podjele |
|---|---|---|
| Grupe | *Grupa (N)* (kada postoji kolona grupe) | Svaka grupa na +, − ili nijednoj, postavljeno u [Spisku timova](teams-list.md) |
| Kolona kategorije | *kolona (N vrijednosti)* | Vrijednosti na +, − ili nijednoj |
| Brojčana kolona | *kolona (brojčana)* | Raspon vrijednosti za svaku stranu |
| Datoteka porijekla | *Source file - uporedi dva učitavanja* (kada je učitano više datoteka) | Datoteke na +, − ili nijednoj |

Nude se samo kolone zadržane pod *Zadrži za filtriranje* pri učitavanju.

### Uporedi udjele, ne brojeve {#compare-shares-not-counts}

**Uporedi udjele, ne brojeve** (podrazumijevano isključeno) važe svaku stranu s jedan podijeljeno sa sopstvenim brojem redova, pa strana s pet puta više redova ne pobjeđuje samo brojevima. Boja tada pokazuje gdje je svaka strana srazmjerno češća od druge. Koristite to kada dvije strane imaju veoma različite količine podataka, na primjer dvije sesije različite dužine.

### Poruke koje možete vidjeti {#messages-you-may-see}

Panel upozorava kada slika nije prava razlika:

| Poruka | Značenje |
|---|---|
| *N + / M −* (ili *N + / M − / K neiskorišćeno*) | Koliko vrijednosti je na svakoj strani (i na nijednoj). |
| Nijedan red u prozoru nije na strani **+** | Crta se samo strana **−**. Pomjerite prozor vremenske linije ili promijenite podjelu. |
| Nijedan red u prozoru nije na strani **−** | Crta se samo strana **+**. |
| Nijedna vrijednost nije ni na jednoj strani | Razlika ne crta ništa. Stavite bar jednu vrijednost na **+** ili **−**. |
| *kolona* ne može se podijeliti na ovaj način | Izabrana kolona ne odgovara podjeli. Izaberite kolonu ponovo. |
| Kolona za podjelu nije stala u GPU memoriju za N od M dijelova | Ti redovi se ne crtaju. Povećajte budžet GPU-a pod Performanse → Budžeti resursa, ili učitajte manje redova. |

### Po grupi {#by-group}

Panel samo upućuje na [Spisak timova](teams-list.md), gdje svaka grupa ima dugme **+** i **−**. Pri svakom učitavanju prva polovina grupa (zaokruženo naviše) se stavlja na +, ostale na −; **Podijeli ravnomjerno** u Spisku timova to ponovo radi isto. Grupa na nijednoj strani, ili sakrivena svojom štiklom, ne doprinosi ničim.

### Po vrijednostima kategorije {#by-category-values}

| Dio | Značenje |
|---|---|
| `a + / b − / c neiskorišćeno` | Koliko vrijednosti je na svakoj strani i na nijednoj. |
| **Očisti** | Stavlja svaku vrijednost na nijednu stranu. |
| Spisak vrijednosti | Svaka vrijednost s dugmetom **+** i **−** (kliknite aktivno ponovo da je skinete s te strane). Prazna vrijednost se navodi kao *(nedostaje)*. |
| Napomena o ograničenju | Navodi se samo prvih 200 vrijednosti: *Prikazano prvih 200 od N vrijednosti. Ovako široku kolonu bolje je prvo suziti filterom, ili podijeliti po rasponu ako su njene vrijednosti poredane.* |

Biranje kolone stavlja njenu prvu vrijednost na + a drugu na −. Kada nijedna strana nema nijednu vrijednost, podjela se vraća na grupe umjesto da prikazuje prazan okvir. *Source file* radi isto, jedna vrijednost po datoteci - tako se porede dva izvoza, dva testna pokretanja ili dvije verzije.

### Po rasponu {#by-range}

| Dio | Značenje |
|---|---|
| Savjet | Najmanja i najveća vrijednost kolone. |
| **Pozitivni raspon (+)**, **od** / **do** | Redovi s vrijednošću u ovom rasponu, uključujući oba kraja, dodaju. |
| **Negativni raspon (−)**, **od** / **do** | Redovi u ovom rasponu oduzimaju. |
| **Podijeli na sredini** | Postavlja + na [najmanja, sredina] i − na [sredina, najveća] - isto što se dešava kada izaberete kolonu. |

Vrijednost u oba raspona računa se kao +. Rasponi ne moraju pokrivati kolonu; vrijednosti na nijednom se izostavljaju. *Prve dvije minute naspram zadnje dvije* je podjela po rasponu na koloni nalik vremenu.

## Udio +: mapa procenta pobjeda {#share-of--the-win-rate-map}

**Razlika** / **Udio +** na vrhu panela bira šta se crta. *Udio +* boji svako mjesto prema udjelu strane + među redovima obje strane na njemu, u odnosu na taj udio u svemu prikazanom: toplo iznad njega, hladno ispod, ništa gdje je isti i ništa gdje mjesto ima premalo redova. S dobijenim rundama na + i izgubljenim na − to je mapa procenta pobjeda; **Procenat pobjeda po rundi** i **Procenat pobjeda po meču** to postavljaju jednim pritiskom kad podaci imaju [kolone ishoda](data-formats.md#outcome-columns). Pogledajte [Procenat pobjeda](win-rate.md).

## Boje {#colours}

Odjeljak **Boje toplote** u ovom načinu prikazuje dva uređivača skala: **Pozitivno (timovi koji dodaju)** i **Negativno (timovi koji oduzimaju)**, svaki sa svojim dugmetom za vraćanje (*Vrati na proziran → crveno → žuto → bijelo*, *Vrati na proziran → zeleno → plavo → ljubičasto*). Složena vrijednost uzima apsolutnu vrijednost neto toplote kroz [tačku zasićenja i odziv](colour-and-exposure.md), i bira negativnu skalu tamo gdje je neto ispod nule. Vidi [Boja i ekspozicija](colour-and-exposure.md#the-ramp-editor).

Koristite odziv gustine *Linearno* kada je veličina razlike važna: to je jedini odziv kod kojeg ista boja znači isti broj.

## Za programere {#for-developers}

Svaki red dobija predznak +1, -1 ili 0 u vertex shader-u ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 odbacuje red prije nego što se ijedan fragment nacrta.

- Po grupi, predznak dolazi iz tabele grupa s 4.096 unosa indeksirane identifikatorom grupe reda (identifikator grupe ide u četvrtom kanalu teksela pozicije reda).
- Po kategoriji, predznak dolazi iz druge tabele s 4.096 unosa, popunjene po vrijednosti kategorije, a vrijednost reda se čita iz teksture filtera kolone; vrijednost iza kraja tabele se odbacuje na obje backend-a.
- Po rasponu, vrijednost reda se upoređuje s dva raspona.

Promjena podjele ponovo pokreće akumulaciju.

**Sakrivene grupe ostaju sakrivene uz svaku podjelu.** Pod podjelom po koloni tabela grupa više ne nosi predznake; drži 1 za prikazanu grupu i 0 za sakrivenu ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), a obje tabele dolaze do shader-a zajedno - dva reda jedne teksture predznaka na WebGL2, dvije polovine jednog storage buffer-a na WebGPU-u. Red se crta samo kada je njegova grupa prikazana *i* njegova vrijednost kolone je na nekoj strani. Tako grupa koja je odštiklirana u [Spisku timova](teams-list.md), ili izostavljena fokusom strane kartice Meč, ne doprinosi ničim, bez obzira kako je razlika podijeljena.
