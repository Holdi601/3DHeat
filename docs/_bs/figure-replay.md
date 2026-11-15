---
title: "Figure u sloju figura"
parent: "Figure"
grand_parent: "Reprodukcija"
nav_order: 2
lang: "bs"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figure u sloju figura

Ova stranica je o pretvaranju kutija u male 3D figure onoga što je svaka jedinica zaista bila, i o dimu i vatri koje figure ostavljaju za sobom. Kontrole samog replaya su na [Replay meča](match-replay.md).

U [replayu kutija](box-replay.md) i u replayu figura kartice Meč, **Figure umjesto kocki** (uključeno po zadanom) crta svaku živu osobu kao figuru onoga što jeste: vojnika pješice, tenk kojim neko vozi, avion koji je Tacview trag. Figura ima boju, mjesto i smjer kutije. Za avione i rakete ima i nagib, a tamo gdje podaci imaju kolonu Roll, i naginjanje. **Veličina figura** ih skalira; 1 puta je prava veličina. Klik na figuru odgovara kao što bi odgovorio klik na njenu kutiju.

## Koja figura {#which-figure}

Odlučuju sopstvene kolone imena i tipa podataka. Potpuna pravila, sa imenima kolona, su na [Figure](figures.md#which-figure-a-unit-gets). Podaci bez nijedne od te dvije vrste kolona su podaci o ljudima: svi su vojnici.

Upoređivanje se kešira po oznaci, pa sličica košta samo postavljanje. Jedinica iz podataka je metar, osim ako podaci ne kažu koliko je veliki jedan praćeni objekat (izvoz CS2 kaže da je igrač širok 32 jedinice); figure se skaliraju tome.

Opcioni paket sopstvenih figura može zamijeniti figure iz kataloga na vašem računaru; vidi [Figure](figures.md#an-optional-local-figure-pack).

## Efekti {#effects}

Redovi događaja koji nešto ostavljaju iza sebe neko vrijeme crtaju se tamo gdje su se desili, koliko god to traje, u boji onoga ko ih je izazvao: dim (oko 18 s), molotov ili zapaljiva (7 s), bljeskalica (oko sekunde) i HE eksplozija (manje od sekunde), mamac (15 s), postavljena bomba (40 s). Dolaze iz kolone događaja (Event, Events) čija je oznaka `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ili `plant`; izvoz CS2 ih piše u trenutku detonacije.

## Replay meča: alati Tacviewa {#match-replay-tacviews-tools}

Kamere, oznake, taktički prikaz, statistika, natpisi, **Okomite linije**, lista događaja i prozor grafikona opisani su na [Replay meča](match-replay.md). [Paritet sa Tacviewom](tacview-parity.md) navodi svaku Tacview funkciju i gdje ona stoji.
