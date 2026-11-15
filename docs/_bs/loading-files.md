---
title: "Učitavanje datoteka"
parent: "Unos podataka"
nav_order: 1
lang: "bs"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Učitavanje datoteka

Ova stranica pokazuje kako dati 3DHeat vaše datoteke i šta on sa njima radi. Prevucite mapu, a on izabere datoteke koje sadrže pozicije i spoji ih u jednu sliku.

1. Otvorite **Izvor** na vrhu bočne trake kartice Toplotna mapa.
2. Prevucite datoteke ili mapu na zonu za prevlačenje, ili pritisnite **Datoteke…** ili **Mapa…**.
3. Pročitajte red izbora i **Procjenu memorije** (vidi sliku ispod).
4. Pritisnite **Učitaj**.

![Panel Izvor nakon prevlačenja mape s deset mečeva: 1 red izbora, 2 Procjena memorije na stane, i 3 Učitaj 10 datoteka](../assets/img/en/loading-files-source.webp)

*Nakon što prevučete mapu, 3DHeat vam kaže šta je našao i da li stane.*

Datoteke se učitavaju u panelu **Izvor** na vrhu bočne trake kartice Toplotna mapa. Sve što je izabrano odjednom postaje **jedan** skup podataka.

## Biranje datoteka {#choosing-files}

| Kontrola | Šta radi |
|---|---|
| **Prevucite datoteke ili mapu ovdje** (zona za prevlačenje) | Prevucite bilo kakvu mješavinu datoteka i mapa. Mape se obilaze rekurzivno. Klik na zonu za prevlačenje otvara isti birač kao **Datoteke…**. |
| **Jedna datoteka…** | Birač datoteka za jednu datoteku. |
| **Datoteke…** | Birač datoteka koji prihvata više datoteka. |
| **Mapa…** | Birač mape (birač `webkitdirectory` iz preglednika); nudi se svaka datoteka u stablu mape. |

Birači prihvataju vrste datoteka iz [spiska datoteka koje se mogu učitati](data-formats.md#files). Ukratko: `.parquet`/`.pq` se čitaju kao Parquet, `.csv`/`.tsv`/`.txt` kao tekst s razdjelnikom, `.acmi` (Tacview), OCAP `.json`/`.json.gz` i GPS formati (GPX, KML, KMZ, NMEA, IGC, FIT) idu kroz svoje vlastite čitače, a `.3dheat` kontejneri za meč se učitavaju kao tabele koje sadrže ([Jedna datoteka po meču](container.md)). Kontejner koji se ne može pročitati se preskače kao *nije csv/parquet datoteka*.

Prevučene mape se obilaze do dubine od 12 nivoa i najviše 20.000 datoteka, kao zaštita od petlji simboličkih veza i nekontrolisanih stabala.

## Koje datoteke se zadržavaju {#which-files-are-kept}

Prije nego što se bilo šta pročita, izbor se filtrira ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Datoteka s drugom ekstenzijom se preskače: *nije csv/parquet datoteka*.
- Datoteka od 0 bajtova se preskače: *prazna (0 bajtova)*.
- **Pomoćne datoteke konvertera** - sirovi podaci koje konverter čuva uz tabelu meča, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` i ostale navedene u [Konverteri zadržavaju sve](converters.md) - preskaču se: *pomoćna datoteka konvertera*. Da otvorite jednu, izaberite ili prevucite je samu (ili samo pomoćne datoteke): izbor samo pomoćnih datoteka učitava ih kao svaku tabelu. JSON uz tabelu (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` i `.hints.json`) se nikada ne nudi kao pozicije.
- **Pravilo datoteke kretanja.** Ako neka datoteka u izboru nosi naziv `movement*.parquet`, `movement*.csv` (i ostale ekstenzije) - `movement.parquet`, `movement_1.parquet` i tako dalje - tada se preskače svaka druga podatkovna datoteka: *nije datoteka kretanja, a ova mapa ima datoteke kretanja*. Izvozi telemetrije često sadrže jednu tabelu pozicija uz desetine tabela bez pozicija, a može se crtati samo prva. Mapa bez ijedne datoteke kretanja učitava sve svoje podatkovne datoteke. Primjer: mapa s `movement_1.parquet`, `kills.parquet` i `shop.parquet` učitava `movement_1.parquet`; ostale dvije su navedene kao preskočene. Primjer: mapa s `movement_1.parquet`, `kills.parquet` i `shop.parquet` učitava `movement_1.parquet`; ostale dvije su navedene kao preskočene.
- Zadržane datoteke se sortiraju po putanji unutar izbora, pa ista mapa uvijek daje isti skup podataka i iste boje.

Panel zatim prikazuje izbor (naziv jedne datoteke ili `mapa (N datoteka)` koristeći najduži zajednički dio putanje), broj datoteka, njihovu ukupnu veličinu i ukupan broj redova - tačan kada su sve datoteke Parquet, označen s `≈` kada je neka CSV. Preskočene datoteke su navedene s razlogom, prve četiri po nazivu.

## Čitanje šeme {#reading-the-schema}

**Prva** datoteka izbora se otvara da opiše šemu ("Čitam šemu"): nazivi njenih kolona, prvih 50 redova podataka, koje kolone izgledaju kao brojevi i, za Parquet, logički tip svake kolone i unos `heat3d` u podnožju. Mapa izvoza jedne tabele dijeli jednu šemu, pa jedna datoteka predstavlja sve. Zatim se mjeri svaka datoteka ("Brojim redove"): podnožje Parquet datoteke daje tačan broj u jednom malom čitanju; broj CSV-a se procjenjuje iz prosječne dužine reda prvog megabajta.

Panel [Mapiranje kolona](column-mapping.md) se otvara s automatski mapiranim pretpostavkama, a [procjena memorije](memory-and-budgets.md) se pojavljuje iznad dugmeta **Učitaj**.

## Poruke prije učitavanja {#messages-before-loading}

Ispod izbora panel navodi, iz [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Greške** (crveno) - učitavanje ne može početi: manje od dvije ose pozicije, ista kolona na dvije ose, mapirana kolona koja nije u datoteci, kolona pozicije koja ne izgleda kao broj, kolona vremena čije uzorkovane vrijednosti su tekst dok je jedinica broj (svaki red bi se čitao kao NaN i završio u vremenu 0), kolona vremena postavljena na ISO-8601 čijih uzorkovanih vrijednosti nijedna se ne može pročitati kao datum, razmjera jedinica 0.
- **Upozorenja** (žuto) - učitaće se, ali vjerovatno ne kako je zamišljeno: kolona grupe koja ima različitu vrijednost u većini uzorkovanih redova (pa je identifikator, a ne grupa), kolona vremena `DATE` (svaki red jednog dana dijeli isti trenutak), smjer pogleda postavljen bez svojih kolona.
- **Napomene** - šta mapiranje podrazumijeva: crtanje na ravni kada je jedna osa nemapirana, nema vremenske linije bez kolone vremena, nema staza bez kolone osobe, a bez kolone grupe jedna boja za sve i razlika koja se može podijeliti samo po koloni zadržanoj za filtriranje.

## Učitavanje {#loading}

Dugme **Učitaj** pokazuje *Učitaj datoteku*, *Učitaj N datoteka*, ili *Učitaj N datoteka (1 od K)* kada je postavljen [korak prorjeđivanja](memory-and-budgets.md#decimation). Pokazuje *Preveliko - smanjite ili prorijedite* i onemogućeno je kada [provjera uklapanja](memory-and-budgets.md#the-fit-check) kaže da se učitavanje neće uklopiti; onemogućeno je i dok mapiranje ima greške ili dok se drugo učitavanje izvodi.

Dok se učitava, panel prikazuje trenutni korak (s `[datoteka/datoteke]` ispred kada ih je više), redove pročitane do sada, traku napretka i **Otkaži**. Otkaži zaustavlja proces učitavanja i s njim sve procese parsera koje je pokrenuo.

Stranica nastavlja da crta dok se učitava, jer se posao odvija u pozadini. Vidite trenutni korak, pročitane redove, traku napretka i **Otkaži**. Poslije posljednje datoteke panel prikazuje korake *Stavljam redove u vremenski red*, *Preslažem kolone (n od m)*, *Mjerim obuhvat*, *Pravim spisak*, *Sažimam sesije* i *Računam trajanja*, zatim *Šaljem N redova na GPU* za jedan kadar, tako da se dugo slanje nikada ne pogrešno shvati kao zamrzavanje.

### Kako radi {#how-it-works}

Učitavanje se izvodi u Web Worker-u ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Uz nekoliko datoteka i više od jedne [niti parsera](memory-and-budgets.md#parser-threads), do toliko datoteka se parsira **istovremeno**, svaka u vlastitom parser-workeru ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), koliko budžet RAM-a ostavlja mjesta; i dalje se spajaju jedna po jedna, po redoslijedu izbora, pa je skup podataka isti kao kod učitavanja jedne po jedne. Dok je više njih u toku, red napretka navodi datoteku koja je zadnja javila, a traka i broj redova zbrajaju svaku datoteku u toku. Uz jednu nit, ili jednu datoteku, datoteke se parsiraju jedna za drugom u samom ingest-workeru. Čitaju se samo kolone koje mapiranje navodi: nemapirana kolona Parquet datoteke ne košta ništa; CSV se skenira bajt po bajt, ali se dekodiraju samo mapirana polja.

## Nekoliko datoteka postaje jedan skup podataka {#several-files-become-one-dataset}

Kada se učita više od jedne datoteke ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Jedan spisak.** Osobe, grupe, sesije i vrijednosti kategorija su rječnici zajednički za sve datoteke, pa ista osoba u dva izvoza je jedna osoba s jednom putanjom.
- **Jedno vremensko porijeklo.** Vremena se čuvaju kao 64-bitne sekunde dok se spajaju i prebacuju na najraniji trenutak *cijelog* izbora, zatim se čuvaju kao 32-bitne sekunde od tog porijekla. Četiri izvoza s četiri popodneva se poredaju po stvarnom redoslijedu, a ne jedan preko drugog.
- **Jedan vremenski red.** Redovi svih datoteka se sortiraju po vremenu radix sortiranjem (vidi [granicu sortiranja](memory-and-budgets.md#the-sort-ceiling)).
- **Kolona `Source file`.** Svaki red pamti iz koje je datoteke došao, kao kolona kategorije pod nazivom `Source file`. Pojavljuje se u [Filterima](filters.md) i kao *Source file - uporedi dva učitavanja* u [podjeli razlike](difference.md). Učitavanje jedne datoteke je ne dobija - konstantna kolona bi koštala 4 bajta po redu da ništa ne kaže.
- **Nedostajuće kolone.** Datoteka koja nema jednu od kolona *filtera* jednostavno ne doprinosi vrijednostima za nju. Datoteka koja nema mapiranu kolonu *uloge* (X, vrijeme, osoba, ...) ne uspijeva s *datoteka nema kolonu "naziv"*; u učitavanju više datoteka ta datoteka se preskače, a ostale se i dalje učitavaju, a preskočene datoteke su navedene na skupu podataka. Učitavanje jedne datoteke koje ne uspije prijavljuje grešku.
- **Upozorenje o manjku.** Kada je učitano manje od 95% redova prebrojanih unaprijed, skup podataka nosi upozorenje s udjelom koji nedostaje - od nečitljivih datoteka ili od redova bez upotrebljive pozicije, koji se odbacuju na ulazu.

## Poslije učitavanja {#after-loading}

Novi skup podataka zamjenjuje prethodni. Pri svakom učitavanju ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- svi filteri i vidljivost grupa se brišu;
- podjela razlike po grupi se resetuje: prva polovina grupa (zaokruženo naviše) pozitivna, ostale negativne;
- poluprečnik sprajta se postavlja na horizontalni obuhvat / 120, a zasićenje na analitičku procjenu; veličina kocke, dužina zraka pogleda, brzina leta i bliska/daleka ravan se postavljaju prema obuhvatu (vidi [Sesije, osobe i grupe](sessions-persons-groups.md#entity-size));
- sesija reprodukcije kutije se postavlja na sesiju s najviše redova;
- rute linija toplote se ponovo pretpostavljaju ([Toplota linija](line-heat.md));
- način prikaza se vraća na **Toplota** ako trenutni način nije podržan novim podacima; vremenska linija se vraća na **Sve** bez kolone vremena, a historija na **Kumulativno** bez trajanja;
- glava za reprodukciju se parkira na početku, a reprodukcija se zaustavlja;
- kamera uokviruje cijeli skup podataka iz zadanog smjera (gleda duž -Z, nagnuta prema dolje oko 36°).

Panel **Skup podataka** tada prikazuje naziv skupa podataka (izbor, brojevi redova i datoteka, i korak prorjeđivanja kada je korišten), `N timova · N osoba · N s raspona`, i svako upozorenje koje je učitavanje proizvelo, žutom bojom, dokle god je skup podataka učitan. **Ukloni iz memorije** u tom panelu uklanja skup podataka.
