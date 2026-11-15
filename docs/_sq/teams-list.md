---
title: "Lista e skuadrave"
parent: "Filtrat dhe mjetet"
nav_order: 2
lang: "sq"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Lista e skuadrave

Paneli **Skuadrat** të lejon të fshehësh një skuadër ose ta vendosësh në njërën anë të një krahasimi. Përdore për të parë vetëm Blue, ose për të pyetur "ku shkon Blue që Red nuk shkon?".

Një *grup* është një ekip ose një palë, për shembull Blue dhe Red ([Grupet](sessions-persons-groups.md#group)). Paneli shfaqet kur grupi i të dhënave ka një kolonë grupi; numri i grupeve është te titulli i tij. Në modalitetin Nxehtësi ekipi, shiriti anësor ka gjithashtu një seksion të quajtur **Pamja e ekipeve** me cilësimet e veta; kjo faqe mbulon listën **Skuadrat**.

## Fshih një skuadër {#hide-a-team}

1. Hap **Skuadrat** në shiritin anësor.
2. Hiq shenjën e kutisë (*Visible*) të skuadrës për ta fshehur. Figura përditësohet menjëherë.
3. Shtyp **Shfaq të gjitha** për t'i kthyer të gjitha skuadrat.

![Lista e skuadrave: Blue 5p, Red 5p, me Shfaq të gjitha](../assets/img/en/teams-list.webp)

## Çdo rresht {#each-row}

| Pjesa | Kuptimi |
|---|---|
| Kutia (*Visible*) | Shfaq ose fshih grupin. |
| Mostra | Ngjyra e grupit: ngjyra e tij e [nxehtësisë së ekipit](team-heat.md) në modalitetin Nxehtësi ekipi, ngjyra e tij bazë në modalitetet e tjera. |
| Emri | Etiketa e grupit (etiketa e plotë kur kalon miun). |
| **+** / **-** (modaliteti Diferencë) | Vendos grupin në anën pozitive ose negative të [diferencës](difference.md); kliko përsëri butonin aktiv për ta vendosur në asnjërën anë. |
| `Np` (modalitetet e tjera) | Numri i personave ku rreshti i parë është në këtë grup. |

![Modaliteti Diferencë: Blue në anën +, Red në anën -](../assets/img/en/teams-list-difference.webp)

## Butonat {#buttons}

| Butoni | Efekti |
|---|---|
| **Shfaq të gjitha** | I bën çdo grup të dukshëm përsëri. |
| **Ndaj në mënyrë të barabartë** (modaliteti Diferencë) | Gjysma e parë e grupeve (e rrumbullosur lart) në +, pjesa tjetër në -; e njëjta ndarje me të cilën fillon çdo ngarkim. |

## Çfarë bën fshehja e një grupi {#what-hiding-a-group-does}

- Në **Nxehtësi**, **Nxehtësi ekipi** dhe **Vija**, rreshtat e grupit nuk japin asgjë.
- Në **Diferencë**, një grup i fshehur nuk jep asgjë, në cilëndo anë që të jetë, edhe me ndarje sipas një kolone tjetër (shih [Diferencën](difference.md#for-developers)).
- Në **mbivendosjen e figurave**, personat ku rreshti i parë është në atë grup nuk vizatohen.
- Në **Nxehtësi ekipi**, grupet e tjera mbajnë ngjyrat e tyre: nuancat caktohen nga numri total i grupeve, jo nga ato që janë të dukshme, kështu që dy figura mbeten të krahasueshme.

Ndryshimi i dukshmërisë rinis grumbullimin. Në çdo grup të ri të dhënash, çdo grup është sërish i dukshëm.

Shënimi i panelit ndryshon sipas modalitetit: në Diferencë shpjegon + dhe -; në Nxehtësi ekipi, se mostrat janë ngjyrat me të cilat vizaton secili grup.
