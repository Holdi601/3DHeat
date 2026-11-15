---
title: "Sintetički generator"
parent: "Unos podataka"
nav_order: 5
lang: "hr"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Sintetički generator

Nemaš vlastite podatke? Pritisni jedan gumb i 3DHeat ti izmisli lažnu bitku, koliko god mala ili velika želiš.

1. Otvori ploču **Skup podataka** u bočnoj traci Toplinske karte (ispod **Izvor**).
2. Pomakni se do **Sintetički generator**.
3. Postavi **Retci (milijuni)**. Probaj prvo 1: zadanih 8 milijuna je teško za prvi pokušaj.
4. Pritisni **Generiraj**.

![1 milijun redaka, 8 timova, nacrtano u načinu Toplina timova](../assets/img/en/synthetic-generator-team-heat.webp)

Ploča **Skup podataka** može stvoriti skup podataka umjesto da ga učita. Služi za dvije stvari: za isprobavanje preglednika bez vlastitih podataka i za provjeru drži li zadani broj redaka, polumjer spritea i proračun uporabljiv broj kadrova na računalu *prije* nego se u njega učita veliki stvarni skup. Njegovo kretanje oblikovano je kao utakmica battle royale - timovi kreću odvojeno, pa se stisnu jedni uz druge - jer ravnomjeran šum izgleda dobro pri svakom proračunu i upravo skriva artefakte vrijedne uočavanja.

## Kontrole {#controls}

| Kontrola | Zadano | Značenje |
|---|---|---|
| **Retci (milijuni)** | 8 | Retci za generiranje. Zaokružuju se na cijeli broj ticka za svakog igrača. |
| **Timovi** | 8 | Broj grupa (najmanje 1). |
| **Po timu** | 12 | Igrača po grupi (najmanje 1). |
| **Pola širine karte (m)** | 4000 | Pola širine područja za igru na X i Z. |
| Redak procjene | | "≈ X GB RAM-a, Y GB na GPU-u nakon kvantizacije." (oko 26 bajtova RAM-a i 8 bajtova na GPU-u po retku). |
| **Generiraj** | | Generira u radniku za unos, s napretkom, i zamjenjuje svaki učitani skup podataka. |

Generiranje se izvodi u pozadinskom radniku, pa desetci milijuna redaka ne zamrzavaju stranicu.

## Što generira {#what-it-generates}

Iz [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Stupci:** položaj, vrijeme, osoba (`P000`, `P001`, ...), grupa (`Team 1`, `Team 2`, ...), skretanje i nagib, te trajanja. Nema stupca sesije i nema stupaca filtara.
- **Vrijeme:** jedan uzorak po igraču svakih 0,25 s, počevši od 0 (relativno vrijeme, bez stvarnog sata).
- **Kretanje:** svaki tim počinje u svom sektoru prstena na 55-95% pola širine. Siguran krug smješten blizu sredine (nasumce pomaknut za najviše četvrtinu pola širine) smanjuje se na 8% pola širine u šest faza s ravnim dijelovima; svaki igrač upravlja prema lutajućoj točki unutar njega, uz prigušenje i šum. Visina valovito varira između 0 i 220 m.
- **Smjer pogleda:** skretanje u smjeru kretanja, nagib iz vertikalne brzine.
- **Ponovljivo:** nasumično sjeme je fiksno (1337), pa iste postavke uvijek daju iste podatke.

Na njemu rade svi načini topline, preklapanje figura i linijska toplina (cijeli tragovi, jer nema stupca događaja). Povijest trajanja također radi.
