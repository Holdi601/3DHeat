---
title: "Mnogo mečeva odjednom"
nav_order: 10
lang: "bs"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: false
---

# Mnogo mečeva odjednom

**Mnogo mečeva odjednom** pušta mnogo mečeva jedan preko drugog, pa vidite kuda obično idu igrači svakog meča. Koristite ga da uporedite stotine ili hiljade mečeva u jednoj slici.

Svaki meč počinje od svog početka, a jedinice se kreću kao figure. Datoteke idu direktno u grafičku karticu i ne pravi se puna tabela, pa se pušta glatko tamo gdje bi običan unos ostao bez memorije.

![Deset mečeva tenkova položeno jedno preko drugog, jedna boja po meču](../assets/img/en/many-matches.webp)

## Kako se koristi {#how-to-use-it}

1. Otvorite **Mnogo mečeva odjednom** u bočnoj traci Toplotne mape.
2. Pritisnite **Datoteke…** (izaberite mnogo datoteka), **Mapa…** (fascikla i njene podfascikle) ili **Dodaj folder…** (dodaje u ono što je učitano).
3. Prikazivač prelazi na preklapanje figura i počinje od početka. Pritisnite **Reproduciraj**.

Svaka datoteka je jedan meč (ili ih sadrži nekoliko). Parquet datoteke i [`.3dheat`](container.md) kontejneri rade. Datoteka treba kolonu pozicije, vremena i jedinice; kolone imena, tipa i strane se zadržavaju. Ostale datoteke, i pomoćne datoteke konvertera (let, poruke, događaji, čet, ciljevi), preskaču se. Za običnu tabelu vidi [Unos podataka](getting-data-in.md).

## Postavke {#settings}

| Postavka | Šta radi |
|---|---|
| **Po timu** / **Po meču** | Boji po strani, ili boja po meču. |
| **Označi gdje su jedinice poginule** | Oznaka gdje je svaka jedinica poginula, 10 s, 30 s, 120 s, ili sve dosad. |

Panel prikazuje koliko je mečeva, jedinica, redova i pozicija pročitano, zauzetu memoriju i vrijeme učitavanja. *Mjesta za* je koliko još pozicija grafička kartica može primiti. *Figure od* je veličina na ekranu ispod koje se jedinica crta kao mala strelica umjesto svoje figure.

Izgled figura koristi iste kontrole kao [reprodukcija meča](match-replay.md#figures): **Veličina figura**, **Najmanja figura na ekranu** i **Na daljinu**.

## Savjeti {#tips}

- Kada sve ne bi stalo u memoriju, pozicije se prorjeđuju (čuva se samo pozicija na svakih nekoliko metara) i panel to kaže.
- Načini toplote rade i na podacima preklapanja.
- Za statistiku nad hiljadama mečeva bez njihovog crtanja vidi [Masovnu analizu](mass-analysis.md).
