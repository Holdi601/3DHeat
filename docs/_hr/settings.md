---
title: "Postavke, jedinice i tipke"
nav_order: 19
lang: "hr"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Postavke, jedinice i tipke

Mali upravljački elementi na vrhu bočne trake mijenjaju način na koji vam preglednik govori: jezik, jedinice (metri ili stope, km/h ili čvorovi) i način pomoći koji objašnjava boje. Vaš izbor pamti se u pregledniku.

## Zaglavlje {#the-header}

Na vrhu bočne trake:

| Kontrola | Što radi |
|---|---|
| **?** | Način pomoći: što znači svaka boja (također `?` ili `F1`) |
| Izbornik **Jedinice** | Metrički, Imperijalni, Zrakoplovni ili Nautički |
| Gumb **...** pokraj **Jedinica** | Otvara „Odaberite jedinicu za svaku veličinu”: jedan padajući izbornik po veličini |
| Izbornik **Jezik** | Jezik preglednika: [40 jezika](languages.md), ili jezik preglednika |

![Zaglavlje s izbornikom Jedinice i otvorenim prozorom jedinica po veličini](../assets/img/en/settings-units.webp)

Brojevi koje upišete u polje mogu koristiti točku ili zarez (`0.35` ili `0,35`). Preglednik čita oboje i prikazuje brojeve onako kako ih piše jezik preglednika.

## Jedinice {#units}

1. Odaberite unaprijed postavljeni skup u izborniku **Jedinice**. Sve veličine se mijenjaju zajedno.
2. Da promijenite samo jednu veličinu, kliknite gumb **...** pokraj nje i odaberite jedinicu za tu veličinu. Izbornik tada prikazuje `*` iza skupa.
3. Veličina koju niste postavili slijedi skup. Odaberite „Kao u skupu” da se vratite.

| Veličina | Metrički (zadano) | Imperijalni | Zrakoplovni | Nautički |
|---|---|---|---|---|
| Udaljenost | km | mi | NM | NM |
| Visina, duljina | m | ft | ft | m |
| Brzina | km/h | mph | kt | kt |
| Vertikalna brzina | m/s | ft/min | ft/min | m/s |
| Temperatura | °C | °F | °C | °C |
| Tlak | hPa | inHg | hPa | hPa |
| Masa, gorivo | kg, l | lb, gal | lb, gal | t, m³ |
| Kut | stupnjevi | stupnjevi | stupnjevi | stupnjevi |

Ostale jedinice koje možete odabrati za jednu veličinu: udaljenost km, mi, NM; brzina km/h, m/s, kt, mph; vertikalna brzina m/s, ft/min, m/min; temperatura °C, °F, K; tlak hPa, inHg, mmHg, psi; masa kg, lb, t; kut stupnjevi ili NATO mili (6400 u krugu). Jedinice su iste svugdje u pregledniku: oznake, kartice, grafikoni, statistika.

## Način pomoći {#help-mode}

![Način pomoći: što znače boje](../assets/img/en/help.webp)

Pritisnite `?` ili `F1`, ili kliknite gumb **?**. Prikazuje *Što znače boje*: legende za 3D prikaz, skale topline, boje timova, boje razine, statusne boje panela, panel utakmice i prikaz utrke. Ostaje uključen dok ga ne isključite. Na kartici Meč objašnjava i boje panela utakmice.

![Način pomoći na kartici Meč](../assets/img/en/settings-help-match.webp)

## Što preglednik pamti {#what-the-browser-remembers}

Ove postavke se čuvaju u pregledniku između posjeta (ništa se nigdje ne šalje):

- jezik, jedinice i način pomoći;
- postavke figura, simbola, oznaka, kamere i taktičkog prikaza u reprodukciji;
- brzina reprodukcije i zrcaljenje;
- zabilješke po snimci, volumeni po skupu podataka, slojevi ciljeva;
- postavke vanjskog UI-ja (ključ samo ako označite *Zapamti*).

Postavke topline, filtri i način počinju ispočetka pri svakom učitavanju. Potpuni, generirani popis: [Spremljene postavke](ref-settings-storage.md).

## Tipke koje preglednik zadržava iz preglednika {#keys-the-viewer-keeps-from-the-browser}

Sesija s velikim podacima traje dugo da se učita, pa preglednik sprječava da preglednik to slučajno odbaci:

- `Ctrl`/`Cmd` + slova koja bi ispisala, spremila, otvorila, ponovno učitala, zatvorila ili otvorila nove prozore ne rade izvan tekstnih polja; `F1`, `F3`, `F5`, `F6` i `F7` ne rade ništa.
- Zatvaranje ili ponovno učitavanje kartice s učitanim podacima ili razinom prvo pita.
- U cijelom zaslonu preglednik zaključava tipke koje koristi (W, T, N, S, R, P, Q, Esc), pa ih preglednik ne preuzima.

Točan popis: [Tipke preglednika](ref-browser-keys.md). Sve vlastite tipke preglednika: [Referenca tipkovnice i miša](keyboard-reference.md).
