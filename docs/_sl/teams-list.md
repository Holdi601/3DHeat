---
title: "Ekipe"
parent: "Filtri in orodja"
nav_order: 2
lang: "sl"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Ekipe

Plošča **Ekipe** vam omogoča, da skrijete ekipo ali jo postavite na eno stran primerjave. Uporabite jo, da pogledate samo Blue, ali da vprašate »kam gre Blue, kamor ne gre Red?«.

*Skupina* je ekipa ali stran, na primer Blue in Red ([Skupine](sessions-persons-groups.md#group)). Plošča se prikaže, kadar ima podatkovna množica stolpec skupine; število skupin je v njeni glavi. V načinu Toplota ekip ima stranska vrstica tudi razdelek **Pregledovalnik ekip** z lastnimi nastavitvami; ta stran pokriva seznam **Ekipe**.

## Skrijte ekipo {#hide-a-team}

1. V stranski vrstici odprite **Ekipe**.
2. Odznačite potrditveno polje (*Vidno*) ekipe, ki jo želite skriti. Slika se takoj posodobi.
3. Pritisnite **Prikaži vse**, da vrnete vse ekipe.

![Seznam ekip: Blue 5p, Red 5p, s Prikaži vse](../assets/img/en/teams-list.webp)

## Vsaka vrstica {#each-row}

| Del | Pomen |
|---|---|
| Potrditveno polje (*Vidno*) | Prikaže ali skrije skupino. |
| Vzorec | Barva skupine: v načinu Toplota ekip njena barva [toplote ekip](team-heat.md), v drugih načinih osnovna barva. |
| Ime | Oznaka skupine (polna oznaka ob ustavitvi miške). |
| **+** / **-** (način Razlika) | Postavi skupino na pozitivno ali negativno stran [razlike](difference.md); ponovni klik na aktivni gumb jo postavi na nobeno stran. |
| `Np` (drugi načini) | Število oseb, katerih prva vrstica je v tej skupini. |

![Način Razlika: Blue na strani +, Red na strani -](../assets/img/en/teams-list-difference.webp)

## Gumbi {#buttons}

| Gumb | Učinek |
|---|---|
| **Prikaži vse** | Vsako skupino ponovno naredi vidno. |
| **Razdeli enakomerno** (način Razlika) | Prva polovica skupin (zaokroženo navzgor) na +, ostale na -; ista delitev se uporabi ob vsakem nalaganju. |

## Kaj naredi skrivanje skupine {#what-hiding-a-group-does}

- V **Toploti**, **Toploti ekip** in **Črtah** vrstice skupine ne prispevajo ničesar.
- V **Razliki** skrita skupina ne prispeva ničesar, ne glede na to, na kateri strani je, tudi pri razdelitvi po drugem stolpcu (glejte [Razliko](difference.md#for-developers)).
- V **prekrivnem prikazu figur** osebe, katerih prva vrstica je v tej skupini, niso narisane.
- V **Toploti ekip** druge skupine ohranijo svoje barve: odtenki se dodelijo iz skupnega števila skupin, ne iz tega, kar je vidno, zato ostaneta obe sliki primerljivi.

Sprememba vidnosti ponovno zažene seštevanje. Ob vsaki novi podatkovni množici je vsaka skupina spet vidna.

Namig plošče se spreminja z načinom: v Razliki razloži + in -; v Toploti ekip pa, da so vzorci barve, s katero riše vsaka skupina.
