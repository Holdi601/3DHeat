---
title: "Rječnik pojmova"
nav_order: 21
lang: "bs"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Rječnik

Kratka značenja riječi koje ova stranica koristi, običnim jezikom. Svaka stavka vodi do stranice koja je objašnjava u cijelosti.

## Podaci {#data}

**Red.** Jedna linija tvojih podataka: jedna stvar koja se desila na jednom mjestu i u jedno vrijeme, na primjer „igrač 7 je bio ovdje u dvanaestoj sekundi". Prikaz crta svaki red. [Formati podataka](data-formats.md)

**Kolona.** Jedna vrsta vrijednosti u redovima, kao što su x, y, z, vrijeme ili tim. Prikaz pogađa koja kolona je koja, a ti možeš promijeniti pogodak. [Mapiranje kolona](column-mapping.md)

**CSV.** Običan tekstualni tabelarni zapis: jedan red po liniji, vrijednosti odvojene zarezima. Gotovo svaki program ga može napisati. [Učitavanje datoteka](loading-files.md)

**Parquet.** Kompaktna datoteka tabele koja se brzo čita, čak i s milionima redova. To je najbolji format za prikaz. [Učitavanje datoteka](loading-files.md)

**Događaj.** Nešto što se dogodilo, kao pucanj, pogodak, ubistvo ili polijetanje. Red može biti događaj, ili samo „bio sam ovdje". [Filteri](filters.md)

**Osoba.** Ona koja je stvorila redove: igrač, pilot, automobil ili tenk. Jedna osoba je jedna linija pozicija kroz vrijeme. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Grupa (tim).** Skup osoba prikazanih u istoj boji, na primjer Plava i Crvena. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Sesija (meč, runda).** Jedno pokretanje igre. Meč ili runda je sesija. Prikaz može prikazati jednu sesiju ili preklopiti mnogo njih. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Nivo.** 3D mapa na kojoj su se podaci desili: tlo, zgrade, zidovi. Redovi se pojavljuju tamo gdje su se desili na nivou. [Nivoi i pozadinska geometrija](levels.md)

## Gledanje podataka {#looking-at-the-data}

**Toplotna mapa.** Slika na kojoj mjesta koja dodiruje mnogo redova svijetle jače. Hladna mjesta su mirna, vruća su zauzeta. [Toplota](heat.md)

**Toplota.** Koliko se desilo na nekom mjestu. Prikaz zbraja sjaj svakog reda na svakom mjestu; zbir je toplota. [Toplota](heat.md)

**Sprajt.** Mala sjajna mrlja koju prikaz crta za jedan red. Mnogo preklapajućih sprajtova se zbraja u toplotu. [Oblik sprajta](sprite-shape.md)

**Ekspozicija.** Koliko je slika svijetla. Kao kod kamere, previše ekspozicije sve pretvara u bijelo, a premalo skriva detalje. [Boja i ekspozicija](colour-and-exposure.md)

**Zasićenje.** Količina toplote koja se računa kao „koliko vruće boje idu". Smanji je da se mirna mjesta vide; povećaj je da vidiš samo najtoplija. [Boja i ekspozicija](colour-and-exposure.md)

**Zapremina.** Kutija ili oblik koji postavljaš u 3D prikaz. Prikaz broji šta je unutra i može porediti zapremine međusobno. [Zapremine i poređenje](volumes.md)

**Filter.** Pravilo koje skriva redove koje ne želiš, na primjer „samo ubistva" ili „samo tim Crveni". [Filteri](filters.md)

## Reprodukcija {#replay}

**Figura.** Mali model tenka, aviona, automobila ili vojnika koji se pomjera tamo gdje podaci kažu da je bio. [Figure](figures.md)

**LOD (nivo detalja).** Svaka figura ima detaljnu, jednostavniju i vrlo jednostavnu verziju. Bliske koriste detaljnu, a daleke jednostavnu, pa se hiljade mogu nacrtati odjednom. [Figure](figures.md)

## Utrke {#racing}

**Krug.** Jedan obilazak staze, od linije do linije. [Učitavanje krugova](race-loading-laps.md)

**Referentni krug.** Krug s kojim se svi ostali porede. Razlike se prikazuju kao „brže" ili „sporije" od njega. [Učitavanje krugova](race-loading-laps.md)

**Vrh.** Tačka zavoja gdje je automobil najbliži unutrašnjoj ivici. [Analiza zavoj po zavoj](race-corner-analysis.md)

**Klizanje.** Koliko guma klizi. Malo klizanja daje najviše prianjanja; previše i automobil šljaka. [Analitika utrke: metoda](race-analytics.md)

**Omotač.** Šta automobil može na svakoj brzini: koliko jako može skretati, kočiti i ubrzavati prije nego što poklizne. [Analitika utrke: metoda](race-analytics.md)

## Brojevi aviona {#aircraft-numbers}

**ALT.** Visina: visina iznad tla ili nivoa mora. [Reprodukcija meča](match-replay.md#labels-and-statistics)

**TAS.** Stvarna brzina u vazduhu: koliko brzo avion prolazi kroz vazduh. [Reprodukcija meča](match-replay.md#labels-and-statistics)

## Računar {#computer}

**GPU.** Grafička kartica ili čip. Crta sliku i mnogo je brži od glavnog procesora u crtanju miliona mrlja. [Dva pozadinska sistema](backends.md)

**WebGPU / WebGL2.** Dva načina na koja browser dozvoljava stranici da koristi GPU. WebGPU je noviji. Prikaz može koristiti bilo koji i bira najbolji koji tvoj browser ima. [Dva pozadinska sistema](backends.md)

## Riječi iz Counter-Strikea {#counter-strike-words}

**Runda.** Jedna kratka borba unutar meča. Jedna strana je pobjeđuje, a rezultat raste za jedan.

**Eko, prinudna kupovina, puna kupovina.** Koliko novca strana troši na oružje na početku runde. Eko štedi novac i gotovo ništa ne kupuje (ispod 1.500 $ po igraču u prosjeku). Prinudna kupovina troši ono što ima (ispod 4.000 $). Puna kupovina kupuje sve što može. [Analiza meča](match-analysis.md)

**Razmjena.** Ubistvo koje vraća ubistvo: tebe pogode, a saigrač upuca tvog ubicu u roku od 5 sekundi. [Analiza meča](match-analysis.md)

**KAST.** Udio rundi u kojima je igrač dobio ubistvo, asistenciju, preživio ili bio razmijenjen. Veći broj znači da je igrač pomogao u više rundi. [Analiza meča](match-analysis.md)

**ADR.** Prosječna šteta po rundi: koliko zdravlja je igrač izgubio od neprijatelja u svakoj rundi. [Analiza meča](match-analysis.md)
