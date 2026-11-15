---
title: "Filteri i alati"
nav_order: 6
has_children: true
lang: "bs"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filteri i alati

Ovi paneli omogućavaju da izaberete *koje* podatke gledate i da izmjerite ono što vidite. Koristite ih kada je slika previše zagušena: prikažite jedan tim, jednog igrača, jedno mjesto ili jedan sprat zgrade.

Svaki panel sužava podatke, a rade zajedno: red se crta samo ako prođe **sve** njih (I).

```
svi redovi -> Filteri -> Timovi -> Entiteti -> Presjek -> slika
              I         I          I           I
```

Primjer: odznačite *Tenk* pod Filterima, sakrijte crveni tim pod Timovima i izaberite jednog igrača pod Entitetima. Vidite samo njegova kretanja koja nisu tenkom.

| Panel | Šta radi | Načini toplote | Preklapanje figura |
|---|---|---|---|
| [Filteri](filters.md) | Filteri opsega i kategorija na bilo kojoj koloni zadržanoj pri učitavanju. | Da | Ne (samo filteri kolona) |
| [Podjela razlike](difference.md#the-difference-split-panel) | Koji redovi dodaju, a koji oduzimaju, u načinu Razlika. | Samo Razlika | Ne |
| [Timovi](teams-list.md) | Prikazuje ili sakriva svaki tim; stavlja timove na stranu + ili -. | Da | Da |
| [Entiteti](entities.md) | Bira pojedinačne igrače. | Da | Da |
| [Presjek](slice.md) | Izrezuje ploču iz nivoa i toplote, da se vidi unutar zgrada. | Da, i nivo | Ne |
| [Mjerenje](measure.md) | Lenjir i vrijednost toplote ispod kursora. | Da | Da |
| [Zapremine i poređenje](volumes.md) | Crta 3D oblike i pita šta se dogodilo unutra. Može i filtrirati. | Da | Da |
| [Raščlamba](breakdown.md) | Koje vozilo, igrač ili oružje najbolje radi na nekom mjestu. | n/a | n/a |

Analiza pogodaka ima sopstveni filter područja na kartici **Vozila**: vidi [Analiza pogodaka](hit-analysis.md).

Pojmovi kao što su toplotna mapa, red, osoba i grupa objašnjeni su u [rječniku pojmova](glossary.md).

## Gdje su paneli {#where-the-panels-are}

Bočna traka kartice Toplotna mapa, od vrha prema dnu:

1. Traka načina i biranje sesije
2. Izvor, Mapiranje kolona, Skup podataka
3. Rute (režim Linije)
4. Paneli toplote, ili Prikaz tima
5. Podjela razlike
6. Timovi
7. Entiteti
8. Filteri
9. Pozadina / nivo
10. Presjek
11. Mjerenje
12. Putanja kamere i renderovanje
13. Performanse
14. Kamera i scena

Kartica Meč prikazuje traku načina, biranje sesije, svoj panel, Filtere, Pozadinu / nivo i Kameru i scenu.
