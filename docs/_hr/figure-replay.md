---
title: "Figure u preklapanju figura"
parent: "Figure"
grand_parent: "Reprodukcija"
nav_order: 2
lang: "hr"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figure u preklapanju figura

Ova stranica govori o pretvaranju kutija u male 3D figure onoga što je svaka jedinica zaista bila, te o dimu i vatri koju figure ostavljaju za sobom. Upravljački elementi same reprodukcije su na [Reprodukcija utakmice](match-replay.md).

U [preklapanju figura](box-replay.md) i u reprodukciji figura na kartici Meč, **Figure umjesto kocaka** (uključeno kao zadano) crta svaku živu osobu kao figuru onoga što je: vojnika pješice, tenk koji netko vozi, zrakoplov koji je Tacview trag. Figura ima boju, mjesto i smjer kutije. Za zrakoplove i rakete ima i nagib, a tamo gdje podaci imaju stupac Roll, i zaokret (bank). **Veličina figura** ih skalira; 1 puta je stvarna veličina. Klik na figuru odgovara kao što bi odgovorio klik na njezinu kutiju.

## Koja figura {#which-figure}

Odlučuju vlastiti stupci podataka za naziv i tip. Potpuna pravila, s nazivima stupaca, nalaze se na [Figure](figures.md#which-figure-a-unit-gets). Podaci bez ijedne vrste stupca su podaci o ljudima: svi su vojnici.

Podudaranje se sprema po oznaci, pa kadar košta samo postavljanje. Jedinica podataka je metar, osim ako podaci ne kažu koliko je veliko pojedino praćeno biće (izvoz CS2 kaže da je igrač širok 32 jedinice); figure se skaliraju u skladu s tim.

Izborni paket vlastitih figura može zamijeniti figure iz kataloga na tvom računalu; vidi [Figure](figures.md#an-optional-local-figure-pack).

## Učinci {#effects}

Reci događaja koje nešto ostavljaju za sobom neko vrijeme crtaju se tamo gdje su se dogodile koliko god traju, u boji onoga tko ih je izazvao: dim (oko 18 s), molotov ili zapaljiva bomba (7 s), bljeskalica (oko sekunde) i eksplozija HE (manje od sekunde), mamac (15 s), postavljena bomba (40 s). Dolaze iz stupca događaja (Event, Events) čija je oznaka `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ili `plant` - izvoz CS2 ih piše u trenutku detonacije.

## Reprodukcija utakmice: Tacviewovi alati {#match-replay-tacviews-tools}

Kamere, oznake, taktički prikaz, statistika, natpisi, **Okomite linije**, popis događaja i prozor grafova opisani su na [Reprodukcija utakmice](match-replay.md). [Paritet s Tacviewom](tacview-parity.md) navodi svaku Tacviewovu značajku i gdje stoji.
