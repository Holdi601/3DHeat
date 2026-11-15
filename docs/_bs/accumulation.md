---
title: "Akumulacija"
parent: "Interno renderovanje"
nav_order: 2
lang: "bs"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akumulacija

Kada prikaz ne može nacrtati svaku tačku u jednom kadru, nacrta jedan dio, pa drugi, i zbraja slike dok stojiš mirno. Slika postaje jasnija, kao fotografija koja se razvija. Pomicanje kamere počinje ispočetka. Red **Pokrivenost** u pregledu statistike pokazuje koliko je odmakla.

![Pregled statistike: Pokrivenost pokazuje procenat dok se slika razvija, a *tačno* kada je gotova](../assets/img/en/performance-stats-overlay.webp)

## Za programere {#for-developers}

Kada jedan kadar ne može nacrtati svaki red, nacrta uzorak i ponderiše ga; slika je tada nepristrasna ali šumna procjena. **Akumulacija** spaja uzastopne kadrove, pa procjena konvergira ka tačnom odgovoru dok se ništa ne mijenja. Svaki kadar bira jedan od pet režima ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); posljednji korišteni je u `engine.live.accumMode`.

| Režim | Kada | Šta se dešava s akumulatorom |
|---|---|---|
| **reset** | kamera se pomjerila, nešto što mijenja polje se promijenilo, progresivno izoštravanje je isključeno, prozor koji raste počinje (prvi kadar reprodukcije, poslije skoka), ili linija toplote u reprodukciji se pomjerila | Zamijenjeno procjenom ovog kadra. |
| **extend** | **Kumulativan** prozor koji je od posljednjeg kadra samo porastao | Ovaj kadar crta samo redove koji su upravo postali vidljivi, punom težinom, i dodaje ih. Ništa ne trune. |
| **ema** | klizajući prozor (**Prozor**, **Životni vijek**) se pomjerio | `acc = acc × (1 - 0,34) + kadar × 0,34` - eksponencijalni pokretni prosjek od otprilike tri kadra. |
| **mean** | ništa se nije promijenilo, a procjena nije gotova | `acc = acc × (1 - 1/n) + kadar × 1/n` na *n*-tom kadru: tekući prosjek. |
| **skip** (besposlen) | konvergirao i ništa se nije promijenilo | Ništa se ne crta; kadar samo ponovo sastavlja. |

### Zašto svaki {#why-each}

- **Tekući prosjek, ne zbir.** Skaliranje bafera s 1 - 1/n i dodavanje 1/n novog kadra je algebarski isto kao zbrajanje i dijeljenje s *n* na kraju, ali bafer uvijek drži vrijednost jednog polja. Zbir dostiže *n* puta polje, a na 16-bitnoj meti zasiti se na 65.504; s djeliteljem koji stalno raste, mirni pogled bi blijedio što duže stoji - dok kamera u pokretu, koja se resetuje svaki kadar, izgleda savršeno tačno. Dimni paket tvrdi da 16 spojenih kadrova drži 1,00× onoga što drži jedan kadar.
- **Extend za kumulativnu reprodukciju.** Redovi već akumulirani i dalje su vidljivi, pa kadar treba samo dio sekunde koji je upravo stigao - što stane u jedan kadar, pa se unosi tačno. Ponovna procjena bi osvijetlila drugi slučajni podskup svaki kadar i učinila da blijedi, što se čita kao rafali koji se pale i nestaju, a pauzirani kadar bi nastavio da popunjava. Paket tvrdi da zbir raste monotono tokom reprodukcije i ostaje unutar 0,02% kroz 2,5 s pauze.
- **Pokretni prosjek za klizajuće prozore.** Oni se zaista mijenjaju svaki kadar. Fiksna težina miješanja prati pokretni prozor (prosjek preko svih kadrova od početka reprodukcije zaostajao bi za pokazivačem) i mnogo je mirniji od ponovnog početka.
- **Reset za linije u reprodukciji.** Čela linija toplote se pomjeraju svaki kadar; pokretni prosjek bi svaku razmazao u traku, pa se svaki kadar crta cijel, a izblijedjelost repa je sopstvena slike.
- **Djelimični kadrovi prolaze kroz pomoćnu metu.** Kadar spojen na djelić pune težine se prvo raspršuje u zasebnu metu od nule, pa tek onda miješa u akumulator, umjesto da se raspršuje direktno s težinom 1/n. Direktno, svaki sprajt bi se dodavao s 1/n veličine ukupnog zbira kojem se pridružuje, što polu-float meta zaokružuje - najgore gdje je najgušće ([Akumulacija polu-floata](half-float-accumulation.md)).

### Konvergencija {#convergence}

Plan za svaki kadar zna koliko ima kandidatnih redova i koliko ih šalje, pa je broj kadrova potrebnih da pokriju svaki red ⌈kandidati / poslani⌉. Kada se spoji toliko kadrova, prikaz je **konvergirao**: red *Pokrivenost* u pregledu statistike prelazi s procenta na *tačno*, a daljnji kadrovi miruju. Uz **Crtaj svaki red u svakoj sličici** uključeno (zadano), jedan kadar obično pokriva sve, pa je konvergencija trenutna, a progresivna mašinerija treba samo kada prozor sadrži više redova nego što jedan plan crtanja može nositi (oko 67 miliona).

### Šta je ponovo pokreće {#what-restarts-it}

Postavke spadaju u tri grupe, prema tome šta akumulirani bafer još znači nakon promjene:

| Grupa | Promjene | Efekat |
|---|---|---|
| **Geometrija** - koji redovi doprinose i koliko | režim prikaza; rute linija; radijus sprajta, intenzitet u centru i na rubu, opadanje, glatki prelaz, kriva, ograničenja piksela, spljoštenje; odsijecanje po udaljenosti blizu, daleko i ravninom; zaklanjanje i sakrij iza terena; presjek; veličina platna; rezolucija toplote; vidljivost grupa i predznaci; podjela razlike; Sve / Reprodukcija; historija; filteri kolona i izbor Entiteta; pojačanje polu-floata | Reset. |
| **Prozor** - vremenski raspon | pomjeranje pokazivača reprodukcije; rezerva i izblijedjelost životnog vijeka | Proširenje (kumulativno) ili pokretni prosjek (klizajuće). |
| **Kompozicija** - samo bojenje | zasićenje, odziv na gustinu, najmanja toplota, rampe boja; presijecanje nivoa; mreža i ose; postavke reprodukcije kutija i sesija; dubina polja | Ponovno crtanje bez diranja toplote. |

Pomjeranje kamere uvijek resetuje. Zato je prevlačenje zasićenja ili rampe besplatno; prevlačenje radijusa sprajta ponovo pokreće konvergenciju pri svakom koraku.
