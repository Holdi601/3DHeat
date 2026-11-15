---
title: "Entiteti"
parent: "Filtri i alati"
nav_order: 3
lang: "hr"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entiteti

**Entiteti** omogućuje da odabereš jednog igrača (ili nekoliko) da vidiš samo kamo je taj igrač otišao. Upotrijebi ga da pratiš vlastito kretanje ili jednog protivnika.

Ploča se prikazuje kad skup podataka ima stupac osobe. Njezino zaglavlje pokazuje broj osoba, ili `selected of total` dok je odabir aktivan (*osoba* je jedan igrač ili AI, vidi [pojmovnik](glossary.md)).

## Odaberi igrača {#pick-a-player}

1. Otvori **Entiteti** u bočnoj traci.
2. Upiši dio naziva u polje za pretraživanje.
3. Označi igrača. Zaglavlje kaže, na primjer, `2 of 10`, a sve ostalo nestaje.
4. **Očisti** ponovno prikazuje sve.

![Entiteti s dva od deset odabranih igrača](../assets/img/en/entities-selected.webp)

Odabir prikazuje samo odabrane osobe, u načinima topline (točke, crte, razlika, toplina timova) kao i u putanjama, figurama i tragovima [preklapanja figura](box-replay.md). Ostavi ga praznim da prikažeš sve; odabrati sve isto je kao ne odabrati nikoga.

## Ploča {#the-panel}

| Dio | Značenje |
|---|---|
| Polje za pretraživanje | *Traži N entiteta...* - filtrira popis po podnizu naziva, bez obzira na velika i mala slova. Prikazuje `N matches`, ili `N matches, showing the first 200`; *Ništa ne odgovara "..."* kad pretraga ništa ne nađe. |
| Popis | Do 200 osoba (prvih 200 koje odgovaraju), svaka s kućicom, uzorkom boje osobe i nazivom (*(bez naziva)* za prazan naziv). |
| Savjet za igru u tijeku | Kad vrijeme teče, popis sadrži one *u igri na glavi reprodukcije*; pretraga pronalazi sve. |
| **AI (n)** | Sklopiv odjeljak s jedinicama kojima upravlja AI, odvojeno od igrača. |
| **Dodaj prikazane** | Dodaje sve trenutno navedene u odabir. |
| **Samo prikazani** | Čini odabir točno onim što je navedeno. |
| **Očisti** | Prazni odabir. |

## Ograničenja {#limits}

U toplini je odabir filtar i koristi jedno od četiri [mjesta za filtre](filters.md#rules). Kad ostali filtri već koriste sva četiri, ploča kaže *Nije primijenjeno na toplinu: sva mjesta za filtre su zauzeta. Preklapanje figura i dalje prikazuje samo ove entitete. Očisti filtar pod Filtri da oslobodiš jedno.* Očisti filtar da oslobodiš mjesto.

Odabir se briše pri svakom novom skupu podataka. Kartica Meč postavlja isti odabir kad se usredotoči na jednog igrača.

## Za razvojne programere {#for-developers}

Odabir se pohranjuje kao filtar *persons* ([Filtri](filters.md#for-developers)). Maska shadera drži 65.536 id-ova osoba; osoba iza toga se ne crta u toplini dok je odabir aktivan.
