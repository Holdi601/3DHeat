---
title: "Popis timova"
parent: "Filtri i alati"
nav_order: 2
lang: "hr"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Popis timova

Ploča **Timovi** omogućuje da sakriješ tim ili ga staviš na jednu stranu usporedbe. Upotrijebi je da gledaš samo Plave, ili da pitaš "kamo ide Plavi što Crveni ne ide?".

*Grupa* je tim ili strana, na primjer Plavi i Crveni ([Sesije, osobe i grupe](sessions-persons-groups.md#group)). Ploča se prikazuje kad skup podataka ima stupac grupe; broj grupa je u njezinu zaglavlju. U načinu Toplina timova bočna traka ima i odjeljak **Prikaz timova** sa svojim postavkama; ova stranica pokriva popis **Timovi**.

## Sakrij tim {#hide-a-team}

1. Otvori **Timovi** u bočnoj traci.
2. Odznači kućicu (*Vidljivo*) tima koji želiš sakriti. Slika se odmah mijenja.
3. Pritisni **Prikaži sve** da vratiš svaki tim.

![Popis timova: Plavi 5p, Crveni 5p, s gumbom Prikaži sve](../assets/img/en/teams-list.webp)

## Svaki redak {#each-row}

| Dio | Značenje |
|---|---|
| Kućica (*Vidljivo*) | Prikaži ili sakrij grupu. |
| Uzorak boje | Boja grupe: njezina [boja toplina timova](team-heat.md) u načinu Toplina timova, njezina osnovna boja u ostalim načinima. |
| Naziv | Oznaka grupe (puna oznaka pri prelasku mišem). |
| **+** / **-** (način Razlika) | Stavi grupu na pozitivnu ili negativnu stranu [razlike](difference.md); klikni aktivni gumb ponovno da je staviš ni na jednu stranu. |
| `Np` (ostali načini) | Broj osoba čiji je prvi redak u ovoj grupi. |

![Način Razlika: Plavi na strani +, Crveni na strani -](../assets/img/en/teams-list-difference.webp)

## Gumbi {#buttons}

| Gumb | Učinak |
|---|---|
| **Prikaži sve** | Ponovno čini svaku grupu vidljivom. |
| **Podijeli ravnomjerno** (način Razlika) | Prva polovica grupa (zaokruženo naviše) na +, ostale na -; ista podjela s kojom počinje svako učitavanje. |

## Što radi sakrivanje grupe {#what-hiding-a-group-does}

- U **Toplina**, **Toplina timova** i **Crte** retci grupe ne doprinose ničim.
- U **Razlika** skrivena grupa ne doprinosi ničim, na kojoj god je strani, pa i uz podjelu po drugom stupcu (vidi [Razliku](difference.md#for-developers)).
- U **preklapanju figura** osobe čiji je prvi redak u toj grupi se ne crtaju.
- U **Toplina timova** ostale grupe zadržavaju svoje boje: nijanse se dodjeljuju iz ukupnog broja grupa, a ne iz onoga što je vidljivo, pa dvije slike ostaju usporedive.

Promjena vidljivosti ponovno pokreće akumulaciju. Pri svakom novom skupu podataka svaka grupa je ponovno vidljiva.

Savjet na ploči mijenja se s načinom: u Razlici objašnjava + i -; u Toplina timova kaže da su uzorci boje ono čime svaka grupa crta.
