---
title: "Veliko tekem hkrati"
nav_order: 10
lang: "sl"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: false
---

# Veliko tekem hkrati

**Veliko tekem hkrati** predvaja množico tekem, ena čez drugo, zato vidite, kam ponavadi gredo igralci vseh tekem. Uporabite ga, da v eni sliki primerjate na stotine ali tisoče tekem.

Vsaka tekma se začne na svojem začetku, njene enote pa se premikajo kot figure. Datoteke gredo naravnost v grafično kartico in ne zgradi se nobena polna tabela, zato teče gladko tam, kjer bi običajno nalaganje zmanjkalo pomnilnika.

![Deset tekem s tenki, položenih čez drugo, ena barva na tekmo](../assets/img/en/many-matches.webp)

## Kako uporabljati {#how-to-use-it}

1. V stranski vrstici Toplotni zemljevid odprite **Veliko tekem hkrati**.
2. Pritisnite **Datoteke…** (izberite veliko datotek), **Mapa…** (mapo in njene podmape) ali **Dodaj mapo…** (dodajte k naloženemu).
3. Pregledovalnik preklopi na prekrivanje figur in začne na začetku. Pritisnite **Predvajaj**.

Vsaka datoteka je ena tekma (ali jih vsebuje več). Delujejo datoteke Parquet in vsebniki [`.3dheat`](container.md). Datoteka potrebuje stolpec položaja, časa in enote; stolpci imena, tipa in strani se ohranijo. Druge datoteke in stranske datoteke pretvornikov (let, sporočila, dogodki, klepet, cilji) se preskočijo. Za navadno tabelo glejte [Uvoz podatkov](getting-data-in.md).

## Nastavitve {#settings}

| Nastavitev | Kaj naredi |
|---|---|
| **Po ekipi** / **Po tekmi** | Barva po strani ali barva na tekmo. |
| **Označi, kje so enote umrle** | Oznaka, kjer je vsaka enota umrla, za 10 s, 30 s, 120 s ali vse doslej. |

Plošča kaže, koliko tekem, enot, vrstic in položajev je bilo prebranih, porabljen pomnilnik in čas nalaganja. *Prostora za* je, koliko dodatnih položajev bi grafična kartica še zmogla. *Figure od* je velikost na zaslonu, pod katero je enota narisana kot majhna puščica namesto svoje figure.

Videz figur uporablja iste kontrole kot [predvajanje tekme](match-replay.md#figures): **Velikost figur**, **Najmanjša figura na zaslonu** in **Na daljavo**.

## Nasveti {#tips}

- Kadar vse ne bi moglo ležati v pomnilniku, se položaji redčijo (ohrani se le položaj na vsakih nekaj metrov) in plošča to pove.
- Načini toplote delujejo tudi na podatkih prekrivanja.
- Za statistiko čez tisoče tekem brez njihovega risanja glejte [Množinska analiza](mass-analysis.md).
