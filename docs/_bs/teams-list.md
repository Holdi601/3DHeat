---
title: "Spisak timova"
parent: "Filteri i alati"
nav_order: 2
lang: "bs"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Spisak timova

Panel **Timovi** vam dozvoljava da sakrijete tim ili da ga stavite na jednu stranu poređenja. Koristite ga da pogledate samo Plave, ili da pitate "kuda ide Plavi, a Crveni ne?".

*Grupa* je tim ili strana, na primjer Plavi i Crveni ([Grupe](sessions-persons-groups.md#group)). Panel se prikazuje kad skup podataka ima kolonu grupe; broj grupa je u njegovom zaglavlju. U režimu Toplota timova bočna traka ima i odjeljak zvan **Prikaz tima** sa sopstvenim postavkama; ova stranica pokriva spisak **Timovi**.

## Sakrijte tim {#hide-a-team}

1. Otvorite **Timovi** u bočnoj traci.
2. Odštiklirajte polje za potvrdu (*Vidljivo*) tima koji želite sakriti. Slika se odmah mijenja.
3. Pritisnite **Prikaži sve** da vratite svaki tim.

![Spisak timova: Plavi 5p, Crveni 5p, sa Prikaži sve](../assets/img/en/teams-list.webp)

## Svaki red {#each-row}

| Dio | Značenje |
|---|---|
| Polje za potvrdu (*Vidljivo*) | Prikazuje ili sakriva grupu. |
| Boja | Boja grupe: njena boja [toplote timova](team-heat.md) u režimu Toplota timova, njena osnovna boja u ostalim režimima. |
| Ime | Oznaka grupe (puna oznaka pri zadržavanju miša). |
| **+** / **-** (režim Razlika) | Stavlja grupu na pozitivnu ili negativnu stranu [razlike](difference.md); kliknite aktivno dugme ponovo da grupa ne bude ni na jednoj strani. |
| `Np` (ostali režimi) | Broj osoba čiji je prvi red u ovoj grupi. |

![Režim razlike: Plavi na strani +, Crveni na strani -](../assets/img/en/teams-list-difference.webp)

## Dugmad {#buttons}

| Dugme | Učinak |
|---|---|
| **Prikaži sve** | Ponovo čini svaku grupu vidljivom. |
| **Podijeli ravnomjerno** (režim Razlika) | Prva polovina grupa (zaokružena naviše) na +, ostale na -; ista podjela s kojom počinje svako učitavanje. |

## Šta radi sakrivanje grupe {#what-hiding-a-group-does}

- U **Toplota**, **Toplota timova** i **Linije** redovi grupe ne doprinose ničim.
- U **Razlika**, sakrivena grupa ne doprinosi ničim, na kojoj god strani bila, i kad je podjela po drugoj koloni (vidi [Razlika](difference.md#for-developers)).
- U **sloju figura**, osobe čiji je prvi red u toj grupi se ne crtaju.
- U **Toplota timova**, ostale grupe zadržavaju svoje boje: nijanse se dodjeljuju iz ukupnog broja grupa, a ne iz onoga što je vidljivo, pa dvije slike ostaju uporedive.

Promjena vidljivosti ponovo pokreće akumulaciju. Na svakom novom skupu podataka svaka grupa je ponovo vidljiva.

Savjet panela se mijenja sa režimom: u Razlici objašnjava + i -; u Toplota timova, da su uzorci boje koje svaka grupa crta.
