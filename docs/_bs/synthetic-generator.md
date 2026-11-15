---
title: "Sintetički generator"
parent: "Unos podataka"
nav_order: 5
lang: "bs"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Sintetički generator

Nemate sopstvene podatke? Pritisnite jedno dugme i 3DHeat izmisli za vas pretpostavljenu bitku, koliko god malu ili veliku želite.

1. Otvorite panel **Skup podataka** u bočnoj traci Toplotne mape (ispod **Izvor**).
2. Pomaknite se do **Sintetički generator**.
3. Podesite **Redovi (miliona)**. Prvo probajte 1: zadanih 8 miliona je previše za prvi pokušaj.
4. Pritisnite **Generiši**.

![1 milion redova, 8 timova, nacrtano u Toplota timova](../assets/img/en/synthetic-generator-team-heat.webp)

Panel **Skup podataka** može generisati skup podataka umjesto da ga učitava. Namijenjen je za dvije stvari: za isprobavanje preglednika bez sopstvenih podataka, i za provjeru da li dati broj redova, poluprečnik sprajta i budžet na nekoj mašini drže upotrebljivu brzinu sličica *prije* nego na nju stavite veliko stvarno učitavanje. Njegovo kretanje je oblikovano kao meč battle royale: timovi počinju razdvojeni, pa se stisnu zajedno, jer ravnomjeran šum izgleda dobro pri svakom budžetu i skriva upravo artefakte koje vrijedi uhvatiti.

## Kontrole {#controls}

| Kontrola | Zadano | Značenje |
|---|---|---|
| **Redovi (miliona)** | 8 | Redovi za generisanje. Zaokružuju se naniže na cijeli broj taktova za svakog igrača. |
| **Timovi** | 8 | Broj grupa (najmanje 1). |
| **Po timu** | 12 | Igrača po grupi (najmanje 1). |
| **Polovina širine mape (m)** | 4000 | Polovina širine područja igre na X i Z. |
| Red procjene | | "≈ X GB RAM-a, Y GB na GPU-u nakon kvantizacije." (oko 26 bajtova RAM-a i 8 bajtova na GPU-u po redu). |
| **Generiši** | | Generiše u radniku za unos, sa napretkom, i zamjenjuje svaki učitani skup podataka. |

Generisanje radi u pozadinskom radniku, pa desetine miliona redova ne zamrzavaju stranicu.

## Šta generiše {#what-it-generates}

Iz [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolone:** pozicija, vrijeme, osoba (`P000`, `P001`, ...), grupa (`Team 1`, `Team 2`, ...), zakretanje i nagib, i životni vijek. Nema kolone sesije i nema kolona filtera.
- **Vrijeme:** jedan uzorak po igraču svakih 0,25 s, počevši od 0 (relativno vrijeme, bez sata).
- **Kretanje:** svaki tim počinje u svom sektoru prstena na 55-95% polovine širine. Siguran krug blizu sredine (pomjeren nasumično do četvrtine polovine širine) skuplja se na 8% polovine širine u šest faza sa zastojima; svaki igrač upravlja prema tački koja luta unutar njega, uz prigušenje i šum. Visina titra između 0 i 220 m.
- **Smjer pogleda:** zakretanje prati smjer kretanja, nagib dolazi iz vertikalne brzine.
- **Ponovljivo:** nasumično sjeme je fiksno (1337), pa iste postavke uvijek daju iste podatke.

Svaki režim toplote, replay kutija i toplota linija (cijele putanje, jer nema kolone događaja) rade na tome. Istorija životnog vijeka također radi.
