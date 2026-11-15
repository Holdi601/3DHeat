---
title: "Razlika"
parent: "Načini topline"
nav_order: 5
lang: "hr"
source: "difference.md"
source_hash: "9db62413b59c"
translated: true
outdated: false
---

# Razlika

Crveno tamo gdje je tim A bio više, zeleno-plavo tamo gdje je bio tim B, ništa tamo gdje su bili jednaki.

**Razlika** (tipka 2) je toplina sa predznakom. Redovi jedne populacije dodaju toplinu; redovi druge je oduzimaju. Tamo gdje se te dvije ravnomjerno preklapaju, rezultat je nula i potpuno proziran. Tamo gdje jedna prevladava, prikazuje se u bojama te strane: zagrijano (prozirno → crveno → žuto → bijelo) za stranu **+** i hladno (prozirno → zeleno → plavo → ljubičasto) za stranu **−** prema zadanom.

![Toplina razlike: crveno tamo gdje je strana + bila više, zeleno i plavo tamo gdje je strana - bila više](../assets/img/hr/difference-split.webp)

## Kako se koristi {#how-to-use-it}

1. Pritisnite `2` (ili odaberite **Razlika** u traci načina).
2. Otvorite **Podjela razlike** u bočnoj traci.
3. Odaberite što se **Podijeli po**: obično *Grupe*.
4. Stavite jednu grupu (ili vrijednost) na **+**, a drugu na **−**.
5. Pročitajte boje: toplo znači stranu +, hladno znači stranu −. Panel upozorava ako jedna strana nema redaka (vidi [Poruke koje možete vidjeti](#messages-you-may-see)).

*Koje* dvije populacije je cijelo pitanje, pa podjela može biti bilo koji zadržani stupac, ne samo grupe. Redovi koji ne padaju ni na jednu stranu su **izostavljeni**, a ne brojeni kao nula. Zato podjela između dvije od mnogih vrijednosti uspoređuje točno te dvije, a slaže se s [filtrima](filters.md): filtrirajte na jednu kartu, pa tu podijelite po verziji.

Način treba dvije strane: stupac grupe s barem dvije grupe, ili podjelu po stupcu zadržanom za filtriranje. Kod podataka s manje od dvije grupe učitavanje počinje s podjelom po stupcu: najprije stupac *Source file* kod učitavanja više datoteka, inače prvi stupac kategorije s dvije vrijednosti, inače prvi brojčani stupac s rasponom. Tako *usporedba dva učitavanja* radi i na podacima bez grupa. Samo podaci bez oboje ostavljaju način nedostupnim. Nedostupan je i kad podjela po stupcu ostane bez ičega na jednoj strani.

## Panel Podjela razlike {#the-difference-split-panel}

Prikazuje se u načinu Razlika, ispod panela topline.

**Podijeli po** nudi:

| Opcija | Prikazano kao | Pravilo podjele |
|---|---|---|
| Grupe | *Grupa (N)* (kad postoji stupac grupe) | Svaka grupa na +, − ili nijednoj, postavljeno u [Popisu timova](teams-list.md) |
| Stupac kategorije | *stupac (N vrijednosti)* | Vrijednosti na +, − ili nijednoj |
| Brojčani stupac | *stupac (brojčani)* | Raspon vrijednosti za svaku stranu |
| Datoteka izvora | *Source file - usporedi dva učitavanja* (kad je učitano više datoteka) | Datoteke na +, − ili nijednoj |

Nudi se samo stupce zadržane pod *Zadrži za filtriranje* pri učitavanju.

### Usporedi udjele, ne brojeve {#compare-shares-not-counts}

**Usporedi udjele, ne brojeve** (zadano isključeno) važe svaku stranu s jedan prema vlastitom broju redaka, pa strana s pet puta više redaka ne pobjeđuje samo brojem. Boja tada pokazuje gdje je svaka strana razmjerno češća od druge. Koristite to kad dvije strane imaju vrlo različite količine podataka, na primjer dvije sesije različite duljine.

### Poruke koje možete vidjeti {#messages-you-may-see}

Panel upozorava kad slika nije prava razlika:

| Poruka | Značenje |
|---|---|
| *N + / M −* (ili *N + / M − / K nekorišteno*) | Koliko je vrijednosti na svakoj strani (i na nijednoj). |
| Nijedan redak u prozoru nije na strani **+** | Crta se samo strana **−**. Pomaknite prozor vremenske osi ili promijenite podjelu. |
| Nijedan redak u prozoru nije na strani **−** | Crta se samo strana **+**. |
| Nijedna vrijednost nije ni na jednoj strani | Razlika ne crta ništa. Stavite barem jednu vrijednost na **+** ili **−**. |
| *stupac* ne može se podijeliti ovako | Odabrani stupac ne odgovara podjeli. Odaberite stupac ponovno. |
| Stupac podjele nije stao u memoriju GPU-a za N od M dijelova | Ti redci se ne crtaju. Povećajte proračun GPU-a pod Performanse → Proračuni resursa, ili učitajte manje redaka. |

### Po grupi {#by-group}

Panel samo upućuje na [Popis timova](teams-list.md), gdje svaka grupa ima gumb **+** i **−**. Pri svakom učitavanju prva polovica grupa (zaokružena nagore) stavlja se na +, ostale na −. **Podijeli ravnomjerno** u Popisu timova to radi ponovno. Grupa na nijednoj strani, ili sakrivena svojom kućicom, ne doprinosi ništa.

### Po vrijednostima kategorije {#by-category-values}

| Dio | Značenje |
|---|---|
| `a + / b − / c nekorišteno` | Koliko je vrijednosti na svakoj strani i na nijednoj. |
| **Očisti** | Stavlja svaku vrijednost na nijednu stranu. |
| Popis vrijednosti | Svaka vrijednost s gumbom **+** i **−** (kliknite aktivni ponovno da ga maknete s te strane). Prazna vrijednost navodi se kao *(nedostaje)*. |
| Napomena o ograničenju | Navodi se samo prvih 200 vrijednosti: *Prikazano prvih 200 od N vrijednosti. Tako širok stupac bolje je prvo suziti filtrom, ili podijeliti po rasponu ako su njegove vrijednosti poredane.* |

Odabir stupca stavlja njegovu prvu vrijednost na +, a drugu na −. Kad nijedna strana nema nijednu vrijednost, podjela se vraća na grupe, umjesto da prikaže prazan okvir. *Source file* radi isto, s jednom vrijednošću po datoteci. Tako se uspoređuju dva izvoza, dva testna pokretanja ili dvije verzije.

### Po rasponu {#by-range}

| Dio | Značenje |
|---|---|
| Savjet | Najmanja i najveća vrijednost stupca. |
| **Pozitivni raspon (+)**, **od** / **do** | Redci s vrijednošću u ovom rasponu, uključujući oba kraja, zbrajaju se. |
| **Negativni raspon (−)**, **od** / **do** | Redci u ovom rasponu oduzimaju se. |
| **Podijeli na sredini** | Postavlja + na [najmanju, sredina] i − na [sredina, najveća]. To radi i odabir stupca. |

Vrijednost u oba raspona broji se kao +. Rasponi ne moraju pokrivati cijeli stupac. Vrijednosti koje nisu ni u jednom izostavljaju se. *Prve dvije minute protiv zadnje dvije* je podjela po rasponu na stupcu sličnom vremenu.

## Udio +: karta postotka pobjeda {#share-of--the-win-rate-map}

**Razlika** / **Udio +** na vrhu ploče bira što se crta. *Udio +* boji svako mjesto prema udjelu strane + među recima obiju strana na njemu, u odnosu na taj udio u svemu prikazanom: toplo iznad njega, hladno ispod, ništa gdje je isti i ništa gdje mjesto ima premalo redaka. S osvojenim rundama na + i izgubljenima na − to je karta postotka pobjeda; **Postotak pobjeda po rundi** i **Postotak pobjeda po meču** to postavljaju jednim pritiskom kad podaci imaju [stupce ishoda](data-formats.md#outcome-columns). Pogledajte [Postotak pobjeda](win-rate.md).

## Boje {#colours}

Odjeljak **Boje topline** u ovom načinu prikazuje dva uređivača skale: **Pozitivna (timovi koji dodaju)** i **Negativna (timovi koji oduzimaju)**, svaki sa svojim gumbom za poništavanje (*Vrati na prozirno → crveno → žuto → bijelo*, *Vrati na prozirno → zeleno → plavo → ljubičasto*). Složena boja uzima apsolutnu vrijednost neto topline kroz [točku zasićenja i odziv](colour-and-exposure.md), a negativnu skalu bira tamo gdje je neto manji od nule. Vidi [Boja i ekspozicija](colour-and-exposure.md#the-ramp-editor).

Koristite odziv gustoće *Linearno* kad je veličina razlike važna: to je jedini odziv gdje ista boja znači isti broj.

## Za razvojne programere {#for-developers}

Svaki redak dobiva predznak +1, -1 ili 0 u vertex shaderu ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)). Nula odbacuje redak prije crtanja ijednog fragmenta.

- Po grupi, predznak dolazi iz tablice grupa od 4 096 unosa indeksirane id-om grupe retka (id grupe nosi se u četvrtom kanalu teksela položaja retka).
- Po kategoriji, predznak dolazi iz druge tablice od 4 096 unosa, popunjene po vrijednosti kategorije, a vrijednost retka čita se iz teksture filtra stupca. Vrijednost iza kraja tablice odbacuje se na oba backend-a.
- Po rasponu, vrijednost retka uspoređuje se s dva raspona.

Promjena podjele ponovno pokreće akumulaciju.

**Sakrivene grupe ostaju sakrivene uz svaku podjelu.** Pod podjelom po stupcu tablica grupa više ne nosi predznake: drži 1 za prikazanu grupu i 0 za sakrivenu ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), a obje tablice stižu do sjenčara zajedno: dva retka jedne teksture predznaka na WebGL2, dvije polovice jednog storage buffera na WebGPU-u. Redak se crta samo kad je njegova grupa prikazana *i* kad je njegova vrijednost stupca na nekoj strani. Grupa koja nije označena u [Popisu timova](teams-list.md), ili je izostavljena fokusom strane na kartici Meč, ne doprinosi ništa, bez obzira na to kako je razlika podijeljena.
