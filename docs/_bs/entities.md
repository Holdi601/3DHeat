---
title: "Entiteti"
parent: "Filteri i alati"
nav_order: 3
lang: "bs"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entiteti

**Entiteti** vam dozvoljavaju da izaberete jednog igrača (ili nekoliko) da vidite samo gdje je taj igrač išao. Koristite ih da pratite sopstveno kretanje ili jednog protivnika.

Panel se prikazuje kad skup podataka ima kolonu osobe. Njegovo zaglavlje pokazuje broj osoba, ili `izabrano od ukupno` dok je izbor aktivan (*osoba* je jedan igrač ili AI, vidi [rječnik](glossary.md)).

## Izaberite igrača {#pick-a-player}

1. Otvorite **Entiteti** u bočnoj traci.
2. Ukucajte dio imena u polje za pretragu.
3. Označite igrača. Zaglavlje kaže, na primjer, `2 od 10`, a sve ostalo nestaje.
4. **Očisti** ponovo prikazuje sve.

![Entiteti sa dva od deset igrača izabrana](../assets/img/en/entities-selected.webp)

Izbor prikazuje samo izabrane osobe, u režimima toplote (tačke, linije, razlika, toplota timova), kao i u tragovima, figurama i putanjama [sloja figura](box-replay.md). Ostavite ga praznim da prikažete sve; izbor svih je isto što i izbor nikoga.

## Panel {#the-panel}

| Dio | Značenje |
|---|---|
| Polje za pretragu | *Pretraži N entiteta...* - filtrira listu po podnizu imena bez obzira na velika i mala slova. Prikazuje `N podudaranja`, ili `N podudaranja, prikazano prvih 200`; *Ništa ne odgovara "..."* kad pretraga ne nađe ništa. |
| Lista | Do 200 osoba (prvih 200 podudaranja), svaka sa poljem za potvrdu, bojom osobe i imenom (*(bez imena)* za prazno ime). |
| Napomena o igri | Kad vrijeme teče, lista sadrži one *u igri na glavi reprodukcije*; pretraga nalazi sve. |
| **AI (n)** | Sažeta grupa koja drži jedinice kojima upravlja AI, odvojeno od igrača. |
| **Dodaj prikazane** | Dodaje sve trenutno navedene u izbor. |
| **Samo prikazani** | Čini izbor tačno onim što je navedeno. |
| **Očisti** | Prazni izbor. |

## Ograničenja {#limits}

U toploti je izbor filter i koristi jedno od četiri [mjesta za filtere](filters.md#rules). Kad ostali filteri već koriste sva četiri, panel kaže *Ne primjenjuje se na toplotu: sva mjesta za filtere su zauzeta. Sloj figura i dalje prikazuje samo ove entitete. Očistite filter pod Filteri da oslobodite jedno.* Očistite filter da oslobodite mjesto.

Izbor se briše na svakom novom skupu podataka. Kartica Meč postavlja isti izbor kad fokusira jednog igrača.

## Za programere {#for-developers}

Izbor se čuva kao filter *osoba* ([Filteri](filters.md#for-developers)). Maska shadera drži 65.536 id-ova osoba; osoba iznad toga se ne crta u toploti dok je izbor aktivan.
