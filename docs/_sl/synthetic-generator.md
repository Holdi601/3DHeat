---
title: "Sintetični generator"
parent: "Uvoz podatkov"
nav_order: 5
lang: "sl"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Sintetični generator

Nimate svojih podatkov? Pritisnite en gumb, in 3DHeat zase izmisli navidezno bitko, tako majhno ali veliko, kot želite.

1. Odprite ploščo **Nabor podatkov** v stranski vrstici Toplotnega zemljevida (pod **Vir**).
2. Pomaknite se do **Sintetični generator**.
3. Nastavite **Vrstice (milijoni)**. Najprej poskusite z 1: privzetih 8 milijonov je za prvi poskus preveč.
4. Pritisnite **Ustvari**.

![1 milijon vrstic, 8 ekip, narisanih v Toploti ekip](../assets/img/en/synthetic-generator-team-heat.webp)

Plošča **Nabor podatkov** lahko namesto nalaganja ustvari podatkovni niz. Namenjena je dvema stvarema: poskusu pregledovalnika brez lastnih podatkov in preverjanju, ali dano število vrstic, polmer sprajta in proračun na računalniku zadržijo uporabno hitrost sličic, *preden* se zaveze na velik pravi nalog. Njeno gibanje je oblikovano kot tekma »battle royale« – ekipe se začnejo narazen, nato pa se stisnejo skupaj – ker enakomeren šum izgleda dobro pri vsakem proračunu in skriva ravno artefakte, ki jih je vredno ujeti.

## Kontrole {#controls}

| Kontrola | Privzeto | Pomen |
|---|---|---|
| **Vrstice (milijoni)** | 8 | Vrstice za ustvarjanje. Zaokroženo navzdol na celo število korakov za vsakega igralca. |
| **Ekipe** | 8 | Število skupin (vsaj 1). |
| **Na ekipo** | 12 | Igralci na skupino (vsaj 1). |
| **Polovična velikost zemljevida (m)** | 4000 | Polovica širine igralnega območja na X in Z. |
| Vrstica ocene | | »≈ X GB RAM-a, Y GB na GPU po kvantizaciji.« (približno 26 bajtov RAM-a in 8 bajtov na GPU na vrstico). |
| **Ustvari** | | Ustvari v delavcu za uvoz, z napredkom, in nadomesti vsak naložen podatkovni niz. |

Ustvarjanje teče v delavcu v ozadju, zato desetine milijonov vrstic ne zamrznejo strani.

## Kaj ustvari {#what-it-generates}

Iz [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Stolpci:** položaj, čas, oseba (`P000`, `P001`, ...), skupina (`Team 1`, `Team 2`, ...), zasuk in nagib ter življenjske dobe. Brez stolpca seje in brez stolpcev filtrov.
- **Čas:** en vzorec na igralca vsakih 0,25 s, začenši pri 0 (relativni čas, brez stenske ure).
- **Gibanje:** vsaka ekipa se začne v svojem sektorju obroča pri 55–95 % polovične velikosti. Varni krog, katerega središče je blizu sredine (odmaknjen naključno do četrtine polovične velikosti), se v šestih fazah s prekinitvami skrči na 8 % polovične velikosti; vsak igralec krmari proti naključno gibajoči se točki znotraj njega, z dušenjem in šumom. Višina niha med 0 in 220 m.
- **Smer pogleda:** zasuk vzdolž smeri gibanja, nagib iz navpične hitrosti.
- **Ponovljivo:** naključno seme je fiksno (1337), zato iste nastavitve vedno dajo iste podatke.

Vsak način toplote, predvajanje škatel in toplotna črta (celotne sledi, ker ni stolpca dogodkov) delujejo na njih. Deluje tudi zgodovina življenjske dobe.
