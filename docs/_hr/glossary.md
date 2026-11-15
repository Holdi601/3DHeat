---
title: "Pojmovnik"
nav_order: 21
lang: "hr"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Pojmovnik

Kratka značenja riječi koje ova stranica koristi, običnim jezikom. Svaki unos vodi na stranicu koja ga potpuno objašnjava.

## Podaci {#data}

**Redak.** Jedan red vaših podataka: jedna stvar koja se dogodila na jednom mjestu i u jednom trenutku, na primjer "igrač 7 je bio ovdje u drugoj sekundi 12". Prikaz crta svaki redak. [Formati podataka](data-formats.md)

**Stupac.** Jedna vrsta vrijednosti u recima, poput x, y, z, vremena ili tima. Prikaz pogađa koji je stupac koji, a pogodak možete promijeniti. [Preslikavanje stupaca](column-mapping.md)

**CSV.** Obična tekstualna tablica: jedan redak po liniji, vrijednosti odvojene zarezima. Gotovo svaki program ga može zapisati. [Učitavanje datoteka](loading-files.md)

**Parquet.** Kompaktna tablična datoteka koja se brzo čita, čak i s milijunima redaka. Najbolji je format koji možete dati prikazu. [Učitavanje datoteka](loading-files.md)

**Događaj.** Nešto što se dogodilo, poput hica, pogotka, ubojstva ili polijetanja. Redak može biti događaj, ili samo "bio sam ovdje". [Filtri](filters.md)

**Osoba.** Onaj tko je napravio retke: igrač, pilot, automobil ili tenk. Jedna osoba je jedna linija pozicija kroz vrijeme. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Grupa (tim).** Skup osoba prikazanih u istoj boji, na primjer Plavi i Crveni. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Sesija (meč, runda).** Jedno odigravanje igre. Meč ili runda je sesija. Prikaz može pokazati jednu sesiju ili složiti mnoge jednu preko druge. [Sesije, osobe i grupe](sessions-persons-groups.md)

**Razina.** 3D karta na kojoj su se podaci dogodili: tlo, zgrade, zidovi. Redci se pojavljuju tamo gdje su se dogodili na razini. [Razine i pozadinska geometrija](levels.md)

## Gledanje podataka {#looking-at-the-data}

**Toplinska karta.** Slika na kojoj mjesta koja mnogi redci dotiču sjaje jače. Hladna mjesta su mirna, vruća su živa. [Toplina](heat.md)

**Toplina.** Koliko se toga dogodilo na nekom mjestu. Prikaz zbraja sjaj svakog retka na svakom mjestu; zbroj je toplina. [Toplina](heat.md)

**Sprite.** Mala sjajna mrlja koju prikaz crta za jedan redak. Mnogo preklapajućih spriteova zbraja se u toplinu. [Oblik spritea](sprite-shape.md)

**Ekspozicija.** Koliko je slika svijetla. Kao kod kamere, previše ekspozicije sve pretvara u bijelo, a premalo skriva detalje. [Boja i ekspozicija](colour-and-exposure.md)

**Zasićenje.** Količina topline koja se računa kao "toliko vruće koliko boje idu". Smanjite je da se mirna mjesta vide; povećajte da vidite samo najvruća. [Boja i ekspozicija](colour-and-exposure.md)

**Volumen.** Kutija ili oblik koji postavljate u 3D prikaz. Prikaz broji što je unutra i može uspoređivati volumene međusobno. [Volumeni i usporedba](volumes.md)

**Filtar.** Pravilo koje skriva retke koje ne želite, na primjer "samo ubojstva" ili "samo tim Crveni". [Filtri](filters.md)

## Reprodukcija {#replay}

**Figura.** Mali model tenka, aviona, automobila ili vojnika koji se miče tamo gdje podaci kažu da je bio. [Figure](figures.md)

**LOD (razina detalja).** Svaka figura ima detaljnu, jednostavniju i vrlo jednostavnu verziju. Bliske koriste detaljnu, a daleke jednostavnu, pa se može nacrtati tisuće odjednom. [Figure](figures.md)

## Utrke {#racing}

**Krug.** Jedna vožnja staze, od linije do linije. [Učitavanje krugova](race-loading-laps.md)

**Referentni krug.** Krug s kojim se uspoređuju svi ostali. Razlike se prikazuju kao "brže" ili "sporije" od njega. [Učitavanje krugova](race-loading-laps.md)

**Vrh.** Točka zavoja u kojoj je automobil najbliži unutarnjem rubu. [Analiza zavoj po zavoj](race-corner-analysis.md)

**Klizanje.** Koliko se guma kliže. Malo klizanja daje najviše prianjanja; previše i automobil zanosi. [Analiza utrke: metoda](race-analytics.md)

**Omotnica.** Ono što automobil može pri svakoj brzini: koliko jako može skretati, kočiti i ubrzavati prije nego što se kliže. [Analiza utrke: metoda](race-analytics.md)

## Brojevi zrakoplova {#aircraft-numbers}

**ALT.** Visina: visina iznad tla ili razine mora. [Reprodukcija meča](match-replay.md#labels-and-statistics)

**TAS.** Istinska brzina zraka: koliko brzo avion prolazi kroz zrak. [Reprodukcija meča](match-replay.md#labels-and-statistics)

## Računalo {#computer}

**GPU.** Grafička kartica ili čip. Crta sliku i mnogo je brži od glavnog procesora u crtanju milijuna mrlja. [Dva pozadinska sustava](backends.md)

**WebGPU / WebGL2.** Dva načina na koja preglednik dopušta stranici da koristi GPU. WebGPU je noviji. Prikaz može koristiti oba i odabire najbolji koji vaš preglednik ima. [Dva pozadinska sustava](backends.md)

## Riječi iz Counter-Strikea {#counter-strike-words}

**Runda.** Jedna kratka borba unutar meča. Jedna strana je pobjeđuje i rezultat joj se povećava za jedan.

**Eko, prisilna kupnja, puna kupnja.** Koliko novca strana troši na oružje na početku runde. Eko štedi novac i kupuje gotovo ništa (ispod 1500 $ po igraču u prosjeku). Prisilna kupnja troši što ima (ispod 4000 $). Puna kupnja kupuje sve što može. [Analiza meča](match-analysis.md)

**Razmjena.** Ubojstvo koje vraća ubojstvo: vas netko pogodi, a suigrač ubije vašeg ubojicu unutar 5 sekundi. [Analiza meča](match-analysis.md)

**KAST.** Udio rundi u kojima je igrač imao ubojstvo, asistenciju, preživio ili je bio razmijenjen. Veći broj znači da je igrač pomogao u više rundi. [Analiza meča](match-analysis.md)

**ADR.** Prosječna šteta po rundi: koliko je zdravlja igrač u prosjeku izgubio od neprijatelja svake runde. [Analiza meča](match-analysis.md)
