---
title: "Pojmovnik"
nav_order: 24
lang: "hr"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Pojmovnik

Kratka značenja riječi koje ova stranica koristi, običnim jezikom. Svaki unos vodi na stranicu koja ga objašnjava u cijelosti.

## Podaci {#data}

**Redak.** Jedan red vaših podataka: jedna stvar koja se dogodila na jednom mjestu i u jednom trenutku, na primjer „igrač 7 je bio ovdje u sekundi 12”. Preglednik crta svaki redak. [Formati podataka](data-formats.md)

**Stupac.** Jedna vrsta vrijednosti u redcima, poput x, y, z, vremena ili tima. Preglednik pogađa koji je stupac koji, a pogađanje možete promijeniti. [Mapiranje stupaca](column-mapping.md)

**CSV.** Obična tekstualna tablica: jedan redak po liniji, vrijednosti odvojene zarezima. Gotovo svaki program može ga napisati. [Učitavanje datoteka](loading-files.md)

**Parquet.** Kompaktna datoteka tablice koja se brzo čita, čak i s milijunima redaka. Najbolji je format koji možete dati pregledniku. [Učitavanje datoteka](loading-files.md)

**Događaj.** Nešto što se dogodilo, poput hica, pogotka, ubojstva ili polijetanja. Redak može biti događaj, ili samo „bio sam ovdje”. [Filtri](filters.md)

**Osoba.** Onaj tko je stvorio retke: igrač, pilot, auto ili tenk. Jedna osoba je jedna linija pozicija kroz vrijeme. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Grupa (tim).** Skup osoba prikazan istom bojom, na primjer Blue i Red. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Sesija (utakmica, runda).** Jedno pokretanje igre. Utakmica ili runda je sesija. Preglednik može prikazati jednu sesiju ili položiti mnoge jednu preko druge. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Razina.** 3D karta na kojoj su se podaci dogodili: tlo, zgrade, zidovi. Redci se pojavljuju tamo gdje su se dogodili na razini. [Razine i geometrija pozadine](levels.md)

## Gledanje podataka {#looking-at-the-data}

**Toplinska karta.** Slika na kojoj mjesta koja dodiruje mnogo redaka svijetle jače. Hladna mjesta su mirna, vruća mjesta su aktivna. [Toplina](heat.md)

**Toplina.** Koliko se događalo na nekom mjestu. Preglednik zbraja sjaj svakog retka na svakom mjestu; zbroj je toplina. [Toplina](heat.md)

**Sprite.** Mala sjajna mrlja koju preglednik crta za jedan redak. Mnogo preklapajućih spritea zbraja se u toplinu. [Oblik spritea](sprite-shape.md)

**Ekspozicija.** Koliko je slika svijetla. Kao kod kamere, previše ekspozicije sve pretvara u bijelo, a premalo skriva detalje. [Boja i ekspozicija](colour-and-exposure.md)

**Zasićenje.** Količina topline koja se računa kao „vruće koliko boje idu”. Smanjite je da se pojave mirna mjesta; povećajte je da vidite samo najvruća. [Boja i ekspozicija](colour-and-exposure.md)

**Volumen.** Kutija ili oblik koji postavljate u 3D prikaz. Preglednik broji što je unutra i može uspoređivati volumene međusobno. [Volumeni i usporedba](volumes.md)

**Filtar.** Pravilo koje skriva retke koje ne želite, na primjer „samo ubojstva” ili „samo tim Red”. [Filtri](filters.md)

## Reprodukcija {#replay}

**Figura.** Mali model tenka, aviona, auta ili vojnika koji se kreće tamo gdje su podaci rekli da je bio. [Figure](figures.md)

**LOD (razina detalja).** Svaka figura ima detaljnu, jednostavniju i vrlo jednostavnu verziju. Bliske koriste detaljnu, a daleke jednostavnu, pa se tisuće mogu crtati odjednom. [Figure](figures.md)

## Utrke {#racing}

**Krug.** Jedna vožnja oko staze, od linije do linije. [Učitavanje krugova](race-loading-laps.md)

**Referentni krug.** Krug s kojim se uspoređuju svi ostali. Razlike se prikazuju kao „brže” ili „sporije” od njega. [Učitavanje krugova](race-loading-laps.md)

**Vrh zavoja.** Točka zavoja u kojoj je automobil najbliži unutarnjem rubu. [Analiza zavoj po zavoj](race-corner-analysis.md)

**Klizanje.** Koliko guma kliže. Malo klizanja daje najviše prianjanja; previše i automobil proklizava. [Analitika utrka: metoda](race-analytics.md)

**Omotnica.** Što automobil može pri svakoj brzini: koliko jako može skretati, kočiti i ubrzavati prije nego proklizne. [Analitika utrka: metoda](race-analytics.md)

## Brojevi zrakoplova {#aircraft-numbers}

**ALT.** Visina: visina iznad tla ili razine mora. [Reprodukcija utakmice](match-replay.md#labels-and-statistics)

**TAS.** Istinska brzina zraka: koliko brzo avion prolazi kroz zrak. [Reprodukcija utakmice](match-replay.md#labels-and-statistics)

## Računalo {#computer}

**GPU.** Grafička kartica ili čip. Ona crta sliku i mnogo je brža od glavnog procesora u crtanju milijuna mrlja. [Dva pozadinska sustava](backends.md)

**WebGPU / WebGL2.** Dva načina na koja preglednik dopušta stranici da koristi GPU. WebGPU je noviji. Preglednik može koristiti oba i odabire najbolji koji vaš preglednik ima. [Dva pozadinska sustava](backends.md)

## Riječi iz Counter-Strikea {#counter-strike-words}

**Runda.** Jedna kratka borba unutar utakmice. Jednu rundu dobiva jedna strana, a rezultat se povećava za jedan.

**Eko, prisilna kupnja, puna kupnja.** Koliko novca strana troši na oružje na početku runde. Eko štedi novac i kupuje gotovo ništa (ispod 1500 $ po igraču u prosjeku). Prisilna kupnja troši ono što ima (ispod 4000 $). Puna kupnja kupuje sve što može. [Analiza utakmice](match-analysis.md)

**Razmjena.** Ubojstvo koje vraća ubojstvo: vas ubiju, a suigrač ubije vašeg ubojicu unutar 5 sekundi. [Analiza utakmice](match-analysis.md)

**KAST.** Udio rundi u kojima je igrač imao ubojstvo, asistenciju, preživio ili bio razmijenjen. Veći broj znači da je igrač pomogao u više rundi. [Analiza utakmice](match-analysis.md)

**ADR.** Prosječna šteta po rundi: koliko je zdravlja igrač u prosjeku izgubio od neprijatelja svake runde. [Analiza utakmice](match-analysis.md)
