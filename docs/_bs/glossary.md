---
title: "Rječnik pojmova"
nav_order: 21
lang: "bs"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Rječnik pojmova

Kratka značenja riječi koje koristi ovaj sajt, običnim jezikom. Svaka stavka vodi na stranicu koja je objašnjava u potpunosti.

## Podaci {#data}

**Red.** Jedna linija vaših podataka: jedna stvar koja se desila na jednom mjestu i u jednom trenutku, na primjer „igrač 7 je bio ovdje u sekundi 12”. Prikazivač crta svaki red. [Formati podataka](data-formats.md)

**Kolona.** Jedna vrsta vrijednosti u redovima, kao što su x, y, z, vrijeme ili tim. Prikazivač pogađa koja kolona je koja, a pogađanje možete promijeniti. [Mapiranje kolona](column-mapping.md)

**CSV.** Običan tekstualni spisak: jedan red po liniji, vrijednosti odvojene zarezima. Gotovo svaki program ga može napisati. [Učitavanje datoteka](loading-files.md)

**Parquet.** Kompaktna datoteka s tabelom, brza za čitanje, čak i s milionima redova. To je najbolji format da date prikazivaču. [Učitavanje datoteka](loading-files.md)

**Događaj.** Nešto što se desilo, kao hitac, pogodak, ubistvo ili polijetanje. Red može biti događaj, ili samo „bio sam ovdje”. [Filteri](filters.md)

**Osoba.** Ona koja je napravila redove: igrač, pilot, automobil ili tenk. Jedna osoba je jedna linija pozicija kroz vrijeme. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Grupa (tim).** Skup osoba prikazanih u istoj boji, na primjer Blue i Red. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Sesija (meč, runda).** Jedno pokretanje igre. Meč ili runda je sesija. Prikazivač može prikazati jednu sesiju ili ih sve poredati jednu preko druge. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Nivo.** 3D mapa na kojoj su se podaci dogodili: tlo, zgrade, zidovi. Redovi se pojavljuju tamo gdje su se desili na nivou. [Nivoi i geometrija pozadine](levels.md)

## Gledanje podataka {#looking-at-the-data}

**Toplotna mapa.** Slika na kojoj mjesta kojih se dodiruje mnogo redova sjaje jače. Hladna mjesta su tiha, vruća su zauzeta. [Toplota](heat.md)

**Toplota.** Koliko se desilo na nekom mjestu. Prikazivač zbraja sjaj svakog reda na svakom mjestu; zbir je toplota. [Toplota](heat.md)

**Sprajt.** Mala sjajna mrlja koju prikazivač crta za jedan red. Mnogo preklapajućih sprajtova zbraja se u toplotu. [Oblik sprajta](sprite-shape.md)

**Ekspozicija.** Koliko je slika svijetla. Kao kod kamere, previše ekspozicije sve pretvori u bijelo, a premalo skriva detalje. [Boja i ekspozicija](colour-and-exposure.md)

**Zasićenje.** Količina toplote koja se računa kao „toliko vruće koliko boje idu”. Smanjite je da se tiha mjesta vide; povećajte da vidite samo najvruća. [Boja i ekspozicija](colour-and-exposure.md)

**Zapremina.** Kutija ili oblik koji postavljate u 3D prikaz. Prikazivač broji šta je unutra i može porediti zapremine međusobno. [Zapremine i poređenje](volumes.md)

**Filter.** Pravilo koje sakriva redove koje ne želite, na primjer „samo ubistva” ili „samo tim Red”. [Filteri](filters.md)

## Reprodukcija {#replay}

**Figura.** Mali model tenka, aviona, automobila ili vojnika koji se kreće tamo gdje podaci kažu da je bio. [Figure](figures.md)

**LOD (nivo detalja).** Svaka figura ima detaljnu, jednostavniju i vrlo jednostavnu verziju. Bliske koriste detaljnu, daleke jednostavnu, pa se hiljade mogu nacrtati odjednom. [Figure](figures.md)

## Trke {#racing}

**Krug.** Jedna vožnja oko staze, od linije do linije. [Učitavanje krugova](race-loading-laps.md)

**Referentni krug.** Krug s kojim se svi ostali porede. Razlike se prikazuju kao „brže” ili „sporije” od njega. [Učitavanje krugova](race-loading-laps.md)

**Vrh krivine.** Tačka krivine u kojoj je automobil najbliži unutrašnjoj ivici. [Analiza krivina](race-corner-analysis.md)

**Klizanje.** Koliko guma klizi. Malo klizanja daje najviše prianjanja; previše i automobil skliže. [Analitika utrka: metoda](race-analytics.md)

**Omotnica.** Šta automobil može da radi pri svakoj brzini: koliko jako može da skreće, koči i ubrzava prije nego što skrene. [Analitika utrka: metoda](race-analytics.md)

## Brojevi za avione {#aircraft-numbers}

**ALT.** Visina: visina iznad tla ili nivoa mora. [Reprodukcija meča](match-replay.md#labels-and-statistics)

**TAS.** Prava brzina u vazduhu: kolikom brzinom avion ide kroz vazduh. [Reprodukcija meča](match-replay.md#labels-and-statistics)

## Računar {#computer}

**GPU.** Grafička kartica ili čip. Crta sliku i mnogo je brži od glavnog procesora u crtanju miliona mrlja. [Dva backenda](backends.md)

**WebGPU / WebGL2.** Dva načina na koja preglednik dozvoljava stranici da koristi GPU. WebGPU je noviji. Prikazivač može koristiti oba i bira najbolji koji vaš preglednik ima. [Dva backenda](backends.md)

## Riječi iz Counter-Strikea {#counter-strike-words}

**Runda.** Jedna kratka borba unutar meča. Jednu rundu dobija jedna strana, a rezultat raste za jedan.

**Eco, force buy, full buy.** Koliko novca strana troši na oružje na početku runde. Eco štedi novac i kupuje gotovo ništa (ispod 1.500 $ po igraču u prosjeku). Force buy troši sve što ima (ispod 4.000 $). Full buy kupuje sve što može. [Analiza meča](match-analysis.md)

**Razmjena.** Ubistvo koje vraća ubistvo: vi ste ubijeni, a saigrač ubije vašeg ubicu u roku od 5 sekundi. [Analiza meča](match-analysis.md)

**KAST.** Udio rundi u kojima je igrač imao ubistvo, asistenciju, preživio ili bio razmijenjen. Veći broj znači da je igrač pomogao u više rundi. [Analiza meča](match-analysis.md)

**ADR.** Prosječna šteta po rundi: koliko zdravlja je igrač oduzeo neprijateljima u svakoj rundi. [Analiza meča](match-analysis.md)
