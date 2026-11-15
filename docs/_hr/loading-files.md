---
title: "Učitavanje datoteka"
parent: "Unos podataka"
nav_order: 1
lang: "hr"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Učitavanje datoteka

Ova stranica pokazuje kako dati 3DHeat svoje datoteke i što s njima radi. Ispustite mapu, a program izabere datoteke koje sadrže položaje i spoji ih u jednu sliku.

1. Otvorite **Izvor** na vrhu bočne trake kartice Toplinska karta.
2. Ispustite datoteke ili mapu na zonu za ispuštanje, ili pritisnite **Datoteke…** ili **Mapa…**.
3. Pročitajte redak odabira i **Procjenu memorije** (vidi sliku ispod).
4. Pritisnite **Učitaj**.

![Panel Izvor nakon što je ispuštena mapa s deset utakmica: 1 redak odabira, 2 Procjena memorije na stane, i 3 Učitaj 10 datoteka](../assets/img/en/loading-files-source.webp)

*Nakon što ispustite mapu, 3DHeat vam kaže što je našao i stane li.*

Datoteke se učitavaju u panelu **Izvor** na vrhu bočne trake kartice Toplinska karta. Sve što je odabrano odjednom postaje **jedan** skup podataka.

## Odabir datoteka {#choosing-files}

| Kontrola | Što radi |
|---|---|
| **Ispustite datoteke ili mapu ovdje** (zona za ispuštanje) | Ispustite bilo koju mješavinu datoteka i mapa. Mape se obilaze rekurzivno. Klik na zonu za ispuštanje otvara isti birač kao **Datoteke…**. |
| **Jedna datoteka…** | Birač datoteka za jednu datoteku. |
| **Datoteke…** | Birač datoteka koji prihvaća više datoteka. |
| **Mapa…** | Birač mape (birač `webkitdirectory` preglednika); nudi se svaka datoteka u stablu mape. |

Birači prihvaćaju vrste datoteka s [popisa datoteka koje se mogu učitati](data-formats.md#files). Ukratko: `.parquet`/`.pq` čitaju se kao Parquet, `.csv`/`.tsv`/`.txt` kao tekst s razdjelnicima, `.acmi` (Tacview), OCAP `.json`/`.json.gz` i GPS formati (GPX, KML, KMZ, NMEA, IGC, FIT) idu kroz vlastite čitače, a spremnici utakmica `.3dheat` učitavaju se kao tablice koje sadrže ([Jedna datoteka po utakmici](container.md)). Spremnik koji se ne može pročitati preskače se uz poruku *nije csv/parquet datoteka*.

Ispuštene mape obilaze se do dubine od 12 razina i najviše 20 000 datoteka, kao zaštita od petlji simboličkih veza i predugih stabala.

## Koje datoteke se zadržavaju {#which-files-are-kept}

Prije nego što se bilo što pročita, odabir se filtrira ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Datoteka s drugom ekstenzijom se preskače: *nije csv/parquet datoteka*.
- Datoteka od 0 bajtova se preskače: *prazna (0 bajtova)*.
- **Prateće datoteke pretvarača**, odnosno sirovi podaci koje pretvarač čuva uz tablicu utakmice, `<match>.messages.parquet`, `.events.parquet`, `.raw.parquet` i druge navedene u [Pretvarači zadržavaju sve](converters.md), preskaču se: *pratnja pretvarača*. Da biste otvorili jednu, odaberite ili ispustite je samu (ili samo pratnje): odabir koji se sastoji samo od pratnji učitava ih kao svaku tablicu. JSON uz tablicu (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` i `.hints.json`) nikad se ne nudi kao položaji.
- **Pravilo datoteka kretanja.** Ako neka datoteka u odabiru nosi ime `movement*.parquet`, `movement*.csv` (i druge ekstenzije), na primjer `movement.parquet`, `movement_1.parquet` i tako dalje, tada se preskače svaka druga podatkovna datoteka: *nije datoteka kretanja, a ova mapa ima datoteke kretanja*. Izvozi telemetrije često sadrže jednu tablicu položaja uz desetke tablica bez položaja, a crtati se mogu samo prve. Mapa bez ijedne datoteke kretanja učitava sve svoje podatkovne datoteke. Primjer: mapa s `movement_1.parquet`, `kills.parquet` i `shop.parquet` učitava `movement_1.parquet`; ostale dvije navedene su kao preskočene. Primjer: mapa s `movement_1.parquet`, `kills.parquet` i `shop.parquet` učitava `movement_1.parquet`; ostale dvije navedene su kao preskočene.
- Zadržane datoteke sortiraju se po putanji unutar odabira, pa ista mapa uvijek daje isti skup podataka i iste boje.

Panel zatim prikazuje odabir (ime jedne datoteke ili `mapa (N datoteka)` uz najdulju zajedničku mapu), broj datoteka, njihovu ukupnu veličinu i ukupan broj redaka. Broj redaka je točan kad su sve datoteke Parquet, a označen je sa `≈` kad je neka CSV. Preskočene datoteke navedene su s razlogom, prve četiri po imenu.

## Čitanje sheme {#reading-the-schema}

Otvara se **prva** datoteka odabira da opiše shemu (»Čitam shemu«): njezini nazivi stupaca, njezinih prvih 50 redaka podataka, koji stupci izgledaju kao brojevi i, za Parquet, logička vrsta svakog stupca i unos `heat3d` u podnožju. Mapa izvoza jedne tablice dijeli jednu shemu, pa jedna datoteka predstavlja sve. Zatim se mjeri svaka datoteka (»Brojim redove«): podnožje Parquet datoteke daje točan broj u jednom malom čitanju. Broj redaka CSV datoteke procjenjuje se iz prosječne duljine retka prvog megabajta.

Panel [Mapiranje stupaca](column-mapping.md) otvara se s automatski pogođenim mapiranjima, a [procjena memorije](memory-and-budgets.md) pojavljuje se iznad gumba **Učitaj**.

## Poruke prije učitavanja {#messages-before-loading}

Ispod odabira panel navodi, iz [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Greške** (crveno): učitavanje se ne može pokrenuti. Ima manje od dvije osi položaja, isti stupac na dvije osi, mapirani stupac koji nije u datoteci, stupac položaja koji ne izgleda kao broj, stupac vremena čije uzorkovane vrijednosti su tekst dok je jedinica broj (svaki redak bi se čitao kao NaN i pao na vrijeme 0), stupac vremena postavljen na ISO-8601 čiji nijedna uzorkovana vrijednost ne čini ispravan datum, te mjerilo jedinica 0.
- **Upozorenja** (žuto): učitat će se, ali vjerojatno ne onako kako je zamišljeno. Stupac grupe koji poprima različitu vrijednost u većini uzorkovanih redaka (dakle to je id, a ne grupa). Stupac vremena `DATE` (svaki redak jednog dana dijeli isti trenutak). Smjer pogleda postavljen bez svojih stupaca.
- **Napomene**: što mapiranje podrazumijeva. Crtanje na ravnini kad jedna os nije mapirana, nema vremenske osi bez stupca vremena, nema putanja bez stupca osobe, a bez stupca grupe jedna boja za sve i razlika koja se može dijeliti samo po stupcu zadržanom za filtriranje.

## Učitavanje {#loading}

Gumb **Učitaj** piše *Učitaj datoteku*, *Učitaj N datoteka* ili *Učitaj N datoteka (1 od K)* kad je postavljen [korak prorjeđivanja](memory-and-budgets.md#decimation). Piše *Preveliko - smanjite ili prorijedite* i onemogućen je kad [provjera stajanja](memory-and-budgets.md#the-fit-check) kaže da se učitavanje neće smjestiti. Također je onemogućen dok mapiranje ima greške ili dok drugo učitavanje radi.

Dok se učitava, panel prikazuje trenutačni korak (s `[datoteka/datoteke]` ispred kad ih je više), pročitane redove, traku napretka i **Odustani**. Odustani prekida radnika za unos, a s njim i sve radnike za raščlambu koje je pokrenuo.

Stranica se i dalje iscrtava dok se učitava, jer se posao odvija u pozadini. Vidite trenutačni korak, pročitane redove, traku napretka i **Odustani**. Nakon zadnje datoteke panel prikazuje korake *Stavljam redove po vremenu*, *Preslažem stupce (n od m)*, *Mjerim opseg*, *Gradim popis*, *Sažimam sesije* i *Računam trajanje*, zatim *Šaljem N redova na GPU* za jedan kadar, da se duga predaja ne bi zamijenila za zamrzavanje.

### Kako radi {#how-it-works}

Učitavanje ide u Web Worker-u ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Kad ima više datoteka i više od jedne [niti za raščlambu](memory-and-budgets.md#parser-threads), do toliko se datoteka raščlanjuje **istovremeno**, svaka u vlastitom radniku za raščlambu ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), koliko god proračun RAM-a dopušta. I dalje se spajaju jedna po jedna, redom odabira, pa je skup podataka isti kao kod učitavanja jedne po jedne. Dok je više njih u tijeku, redak napretka imenuje datoteku koja je zadnja javila, a traka i broj redaka zbrajaju svaku datoteku u tijeku. S jednom niti, ili s jednom datotekom, datoteke se raščlanjuju jedna za drugom u samom radniku za unos. Čitaju se samo stupci koje mapiranje navodi: nemapirani stupac Parquet datoteke ne košta ništa, a CSV se pregledava bajt po bajt, ali dekodiraju se samo mapirana polja.

## Nekoliko datoteka postaje jedan skup podataka {#several-files-become-one-dataset}

Kad se učita više od jedne datoteke ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Jedan popis.** Osobe, grupe, sesije i vrijednosti kategorija su rječnici zajednički svim datotekama, pa je isti igrač u dva izvoza jedna osoba s jednom putanjom.
- **Jedno vremensko ishodište.** Vremena se čuvaju kao 64-bitne sekunde tijekom spajanja i pomiču se na najraniji trenutak *cijelog* odabira, pa se zatim pohranjuju kao 32-bitne sekunde od tog ishodišta. Četiri izvoza s četiri poslijepodneva stavljaju se u njihov stvarni redoslijed, a ne jedan na drugi.
- **Jedan vremenski poredak.** Redovi svih datoteka sortiraju se po vremenu radix sortom (vidi [granicu sortiranja](memory-and-budgets.md#the-sort-ceiling)).
- **Stupac `Source file`.** Svaki redak pamti iz koje je datoteke došao, kao stupac kategorije imena `Source file`. Pojavljuje se u [Filtrima](filters.md) i kao *Source file - usporedi dva učitavanja* u [podjeli razlike](difference.md). Učitavanje jedne datoteke ga ne dobiva. Konstantan stupac koštao bi 4 bajta po retku da kaže ništa.
- **Nedostajući stupci.** Datoteka kojoj nedostaje jedan od stupaca *filtra* jednostavno ne daje vrijednosti za njega. Datoteka kojoj nedostaje mapirani stupac *uloge* (X, vrijeme, osoba, ...) pada uz *datoteka nema stupac "naziv"*. U učitavanju više datoteka ta se datoteka preskače, ostale se i dalje učitavaju, a preskočene datoteke navedene su na skupu podataka. Učitavanje jedne datoteke koje ne uspije prijavljuje grešku.
- **Upozorenje o manjku.** Kad su učitani redovi manji od 95 % redaka prebrojanih unaprijed, skup podataka nosi upozorenje s udjelom koji nedostaje. Nastaje zbog nečitljivih datoteka ili redova bez upotrebljivog položaja, koji se pri ulasku odbacuju.

## Nakon učitavanja {#after-loading}

Novi skup podataka zamjenjuje prethodni. Pri svakom učitavanju ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- brišu se svi filtri i vidljivost grupa;
- podjela razlike po grupi se resetira: prva polovica grupa (zaokružena nagore) pozitivna, ostale negativne;
- polumjer sprite-a postavlja se na vodoravni opseg / 120, a zasićenost na analitičku procjenu; veličina kocke, duljina zrake pogleda, brzina letenja i bliska i daleka ravnina postavljaju se prema opsegu (vidi [Sesije, osobe i grupe](sessions-persons-groups.md#entity-size));
- sesija reprodukcije kutije postavlja se na sesiju s najviše redaka;
- rute toplinske linije ponovno se pogađaju ([Linijska toplina](line-heat.md));
- način prikaza vraća se na **Toplina** ako trenutačni način nije podržan novim podacima; vremenska os vraća se na **Sve** bez stupca vremena, a povijest na **Kumulativno** bez trajanja;
- glava za reprodukciju postavlja se na početak, a reprodukcija se zaustavlja;
- kamera uokvirava cijeli skup podataka iz zadanog smjera (gleda duž -Z, nagnuta prema dolje oko 36°).

Panel **Skup podataka** tada prikazuje ime skupa (odabir, broj redaka i datoteka te korak ako je korišten), `N timova · N osoba · N s raspona` i svako upozorenje koje je učitavanje stvorilo, žuto, dok je skup učitan. **Ukloni iz memorije** u tom panelu uklanja skup podataka.
