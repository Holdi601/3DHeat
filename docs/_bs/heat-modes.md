---
title: "Načini toplote"
nav_order: 4
has_children: true
lang: "bs"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Načini toplote

Svaka tačka dodaje malo sjaja, sjaji se gomilaju, a gomila se boji bojama. Načina ima pet, na pet različitih načina prikaza, i svaki odgovara na jedno pitanje.

Traka načina na vrhu bočne trake kartice Toplotna mapa bira kako se [skup podataka](glossary.md) crta. Tipke 1-4 biraju Toplota, Razlika, Toplota timova i Linije. Preklapanje figura nema tipku.

![Traka načina s Toplota, Razlika, Toplota timova, Preklapanje figura i Linije](../assets/img/en/heat-modes-bar.webp)

| Način | Pitanje na koje odgovara |
|---|---|
| **Toplota** | Gdje se desilo, i koliko? |
| **Razlika** | Koja je strana to radila više? |
| **Toplota timova** | Čija je bila? |
| **Linije** | Kojim putem su ljudi išli? |
| **Preklapanje figura** | Ko je bio gdje, i kada? |

![Isti podaci u četiri načina: Toplota, Razlika, Toplota timova i Linije](../assets/img/en/heat-modes-grid.webp)

| Način (oznaka na traci) | Tipka | Šta crta | Treba |
|---|---|---|---|
| **Toplota** | 1 | Aditivna gustina: svaki vidljivi red dodaje radijalni sprajt okrenut ka kameri. [Toplota](heat.md) | skup podataka |
| **Razlika** | 2 | Gustina sa predznakom: jedna populacija dodaje, druga oduzima. [Razlika](difference.md) | dvije strane: najmanje dvije grupe, ili podjela preko zadržane kolone |
| **Toplota timova** | 3 | Gustina obojena po grupi: nijansa za svaku grupu, miješana tamo gdje se grupe preklapaju. [Toplota timova](team-heat.md) | kolona grupe |
| **Preklapanje figura** | - | Figura (ili kutija) po osobi, koja se kreće duž vremenske linije: reprodukcija. [Preklapanje figura](box-replay.md), [Reprodukcija meča](match-replay.md) | kolona osobe |
| **Linije** | 4 | Toplota linija: linija od svakog uzorka osobe do njenog sljedećeg, toplota slabi u stranu. [Toplota linija](line-heat.md) | kolona osobe i kolona vremena |

Način koji podaci ne mogu podržati zasivljen je, a njegov opis iznad pokazivača daje razlog, na primjer *Nedostupno - režim Razlika treba dvije grupe ili zadržanu kolonu za podjelu; ovi podaci imaju jednu grupu.* Kada novi skup podataka ne može podržati trenutni način, prikaz se vraća na **Toplota**.

Tipke 1-4 provjeravaju se prema podacima na isti način: tipka za zasivljen način ne radi ništa.

## Koje panele prikazuje koji način {#which-panels-each-mode-shows}

| Panel | Toplota | Razlika | Toplota timova | Preklapanje figura | Linije |
|---|---|---|---|---|---|
| Rute ([toplota linija](line-heat.md)) | | | | | da |
| Oblik toplote (s **Prati prikaz** i **Ista gustina pri svakom zumiranju**), Boje toplote, Granice pixela sprajta, Dubina, Culling po udaljenosti | da | da | da | | da |
| Smjer ([usmjerena toplota](directional-heat.md)), Vrijednost ([ponderisanje vrijednosti](value-weighting.md)) | da | da | da | | da |
| Prikaz tima ([preklapanje figura](box-replay.md)) | | | | da | |
| Podjela razlike ([razlika](difference.md)) | | da | | | |
| [Timovi](teams-list.md), [Entiteti](entities.md), [Filteri](filters.md), Pozadina / nivo, [Presjek](slice.md), [Mjerenje](measure.md), Putanja kamere i renderovanje, Performanse, Kamera i scena | da | da | da | da | da |

## Šta svi načini toplote dijele {#what-every-heat-mode-shares}

Sva četiri načina toplote (sve osim preklapanja figura) su ista mašina s različitim ulazima ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Koji redovi.** [Vremenska linija](timeline.md) bira neprekidan opseg redova sortiranih po vremenu; [filteri](filters.md), vidljivost grupa, podjela razlike, [culling po udaljenosti](depth-and-culling.md#distance-culling) i [presjek](slice.md) odlučuju za svaki red, u vertex shaderu, da li i koliko jako doprinosi.
2. **Splatting.** Svaki red koji doprinosi crta se kao sprajt (ili, u režimu Linije, kao segment) u **toplotnu metu** s pokretnim zarezom, dodajući svoju vrijednost iz skale. Stratifikovani uzorak redova se crta kada ih je više nego što jedan frejm može da podnese, uz težine koje to nadoknađuju. Vidi [Uzorkovanje i budžeti](sampling-and-budgets.md).
3. **Akumulacija.** Dok se ništa ne mijenja, frejmovi se spajaju dok svaki red ne doprinese tačno jednom. Vidi [Akumulacija](accumulation.md).
4. **Kompozicija.** Akumulirana vrijednost na svakom pikselu dijeli se s **tačkom zasićenja**, oblikuje **odzivom gustine**, podiže **minimalnom toplotom** i traži se u **skali boja**, čija alfa vrijednost miješa sa scenom. Vidi [Boja i ekspozicija](colour-and-exposure.md).

Sve u koraku 4 primjenjuje se u trenutku kompozicije, pa prevlačenje tih kontrola nikada ne pokreće akumulaciju iznova; sve u koracima 1-2 to radi.

## Stranice u ovom odjeljku {#pages-in-this-section}

- [Toplota](heat.md) - običan način toplote i pregled njegovih panela
  - [Oblik sprajta](sprite-shape.md) - radijus, intenziteti, opadanje, uređivač krive, granice pixela, izravnavanje
  - [Boja i ekspozicija](colour-and-exposure.md) - uređivač skale, tačka zasićenja, automatska ekspozicija, minimalna toplota, odziv gustine
  - [Dubina i culling](depth-and-culling.md) - okluzija terenom nivoa, skrivanje iza terena, culling po udaljenosti
- [Razlika](difference.md) - podjela razlike
- [Toplota timova](team-heat.md)
- [Toplota linija](line-heat.md) - rute
- [Preklapanje figura](box-replay.md) - način reprodukcije (datoteka se i dalje zove box replay)
- [Usmjerena toplota](directional-heat.md)
- [Ponderisanje vrijednosti](value-weighting.md)
