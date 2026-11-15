---
title: "Mnogo utakmica odjednom"
parent: "Replay"
nav_order: 2
lang: "hr"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: true
---

# Mnogo utakmica odjednom

**Mnogo utakmica odjednom** pušta puno utakmica jednu preko druge, pa vidite kamo po običaju idu igrači svake utakmice. Koristite to da uspoređujete stotine ili tisuće utakmica na jednoj slici.

Svaka utakmica počinje od svog vlastitog početka, a njezine jedinice se kreću kao figure. Datoteke idu izravno na grafičku karticu i ne gradi se nijedna puna tablica, pa radi glatko tamo gdje bi se obično učitavanje ispraznilo iz memorije.

![Deset utakmica tenkova položeno jedna preko druge, jedna boja po utakmici](../assets/img/hr/many-matches.webp)

## Kako se koristi {#how-to-use-it}

1. Otvorite **Mnogo utakmica odjednom** u bočnoj traci Toplinske karte.
2. Pritisnite **Datoteke…** (odaberite mnogo datoteka), **Mapa…** (mapa i njezine podmape) ili **Dodaj mapu…** (dodaje na ono što je učitano).
3. Preglednik prelazi na prekrivanje figura i započinje od početka. Pritisnite **Reprodukcija**.

Svaka datoteka je jedna utakmica (ili ih sadrži nekoliko). Podržane su Parquet datoteke i [`.3dheat`](container.md) kontejneri. Datoteka treba stupac pozicije, vremena i jedinice; stupci imena, tipa i strane se zadržavaju. Druge datoteke i pomoćne datoteke pretvarača (let, poruke, događaji, chat, ciljevi) se preskaču. Za običnu tablicu vidi [Unos podataka](getting-data-in.md).

## Postavke {#settings}

| Postavka | Što radi |
|---|---|
| **Po timu** / **Po utakmici** | Boja po strani, ili boja po utakmici. |
| **Označi gdje su jedinice poginule** | Oznaka tamo gdje je svaka jedinica poginula, 10 s, 30 s, 120 s ili sve do sada. |

Panel prikazuje koliko je utakmica, jedinica, redaka i pozicija pročitano, korištenu memoriju i vrijeme učitavanja. *Mjesta za* je koliko još pozicija grafička kartica može primiti. *Figure od* je veličina na zaslonu ispod koje se jedinica crta kao mala strelica umjesto svoje figure.

Izgled figura koristi iste kontrole kao [reprodukcija utakmice](match-replay.md#figures): **Veličina figura**, **Najmanja figura na zaslonu** i **Na daljinu**.

## Savjeti {#tips}

- Kad se sve ne bi stalo u memoriju, pozicije se prorjeđuju (zadržava se samo pozicija svakih nekoliko metara) i panel to kaže.
- Načini topline rade i na podacima prekrivanja.
- Za statistiku preko tisuća utakmica bez njihova crtanja vidi [Masovna analiza](mass-analysis.md).
