---
title: "Mapiranje kolona"
parent: "Unos podataka"
nav_order: 2
lang: "bs"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# Mapiranje kolona

Datoteka je tabela, a 3DHeat mora znati koja kolona sadrži položaj istok-zapad, koja vrijeme, koja ime igrača, i tako dalje. Ovaj panel je mjesto gdje on kaže šta je pogodio, i gdje ispravljate pogrešno pogađanje.

![Panel Mapiranje kolona nakon učitavanja Parquet datoteke: svako polje već popunjeno - 1 X, 2 Y, 3 Z, 4 Vrijeme, 5 ID osobe, 6 Sesija / meč, 7 Tim / grupa](../assets/img/en/column-mapping-panel.webp)

*Datoteka je sama imenovala svoje kolone, pa je svako polje već popunjeno.*

Na primjer, CSV sa zaglavljem `x,y,z,t,player,team` se mapira sam: x, y i z postaju pozicija, `t` vrijeme, `player` [osoba](glossary.md), a `team` [grupa](glossary.md).

Nakon što se izaberu datoteke, panel **Mapiranje kolona** se otvara ispod panela Izvor. Kaže koja kolona igra koju ulogu. Popunjava se automatski, a svako polje se može promijeniti prije pritiska na **Učitaj**; mapiranje se čita u trenutku učitavanja, pa je promjena poslije značajna tek kada se ponovo učita.

## Polja {#the-fields}

Svi meniji kolona navode svaku kolonu prve datoteke, plus *- nijedna -*.

| Polje | Uloga | Napomene |
|---|---|---|
| **Razdjelnik** | Samo CSV: ograničavač polja. | Meni: *Zarez ,*, *Tačka-zarez ;*, *Tab*, *Uspravna crta \|*, *Razmak*; ili upišite bilo koji jedan znak u *ili upišite jedan znak*. Otkriva se automatski (vidi dolje). Promjena ponovo pokreće automatsko mapiranje, pa se izmjene napravljene prije gube. |
| **X**, **Y**, **Z** | Pozicija. | Potrebne su najmanje dvije; nemapirana treća osa je 0 (podaci leže na ravni). Ista kolona na dvije ose je greška. |
| **Osa prema gore u izvoru** | Koja osa izvora pokazuje gore. | *Z je gore (većina igračkih motora)* ili *Y je gore (konvencija grafike)*. Vidi [Ose, jedinice i vrijeme](axes-units-and-time.md). |
| **Mjerilo jedinica** | Množi svaku poziciju. | Dugmad *1 (m)* i *0,01 (cm→m)*, ili upišite vrijednost. |
| **Okreni X / Okreni Y / Okreni Z** | Negira osu izvora. | Primjenjuje se na pozicije i na vektore smjera pogleda. |
| **Vrijeme** | Osa vremena. | Neobavezno. Bez nje nema vremenske linije. |
| **Jedinica vremena** | Kako čitati kolonu vremena. | Sedam jedinica; vidi [Ose, jedinice i vrijeme](axes-units-and-time.md#time). Ignoriše se za Parquet kolone `TIMESTAMP`/`DATE`, što panel kaže. |
| **ID osobe** | Ko ili šta pripada redu. | Neobavezno. Omogućava staze, životni vijek, reprodukciju kutije i toplotu linija. |
| **Sesija / meč** | Koji meč, racija, runda, trka ili krug pripada redu. | Neobavezno. Pozicije se nikada ne interpoliraju, ne prate i ne spajaju u rutu preko promjene sesije. Vidi [Sesije, osobe i grupe](sessions-persons-groups.md). |
| **Tim / grupa** | Bilo koja kolona s malo različitih vrijednosti. | Neobavezno. Pokreće boje grupa, toplotu tima i podjelu razlike po grupi. |
| **Smjer pogleda** | *Nijedan*, *Kolone zakretanja / propinjanja* ili *Kolone vektora smjera*. | Sa zakretanjem/propinjanjem: **Zakretanje**, **Propinjanje** i **Jedinica ugla** (*Stepeni* / *Radijani*). Sa vektorom: **Smjer X**, **Smjer Y**, **Smjer Z**. Koristi se za zrake pogleda [reprodukcije kutije](box-replay.md). |
| **Zadrži za filtriranje** | Dodatne kolone zadržane u memoriji. | Polje za štiklu po koloni, a za svaku štiklanu *raspon* (brojčana) ili *kategoriju*. Svaka košta 4 bajta po redu i prolaz dekodiranja pri učitavanju. Samo zadržane kolone mogu se [filtrirati](filters.md), koristiti za [podjelu razlike](difference.md) ili kao kolona događaja [toplote linija](line-heat.md). |
| **Prikaži uzorak redova** | Tabela prvih 12 uzorkovanih redova, sve kolone. | Za provjeru pogađanja. |

Štiklirana kolona filtera koja nije eksplicitno postavljena čita se kao *raspon*; kolona identifikatora koja izgleda kao broj često je korisnija kao *kategorija*. Samo 4 filtera mogu biti aktivna istovremeno ([Filteri](filters.md)).

## Kako automatsko mapiranje pogađa {#how-the-auto-mapping-guesses}

Pogađanje je u [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Gleda nazive kolona, koje kolone su brojčane u uzorkovanim redovima (više od 90% nepraznih vrijednosti se može pročitati kao broj), koliko različitih vrijednosti svaka kolona ima u uzorku, i Parquet logičke tipove. Obrasci naziva se isprobavaju po redu, bez razlike između velikih i malih slova, i prvi obrazac koji se podudara s bilo kojom još slobodnom kolonom pobjeđuje.

### Pozicija {#position}

| Osa | Obrasci naziva, po redu (samo brojčane kolone) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Ako je osa još prazna, prve slobodne brojčane kolone (ignorišući `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) je popunjavaju redom. Pogrešno pogađanje je očigledno na ekranu; prazno bi ostavilo prazan prozor za prikaz.

### Vrijeme {#time}

- **Prvo Parquet kolone vremenskog žiga.** Među kolonama čiji je logički tip `TIMESTAMP` ili `DATE`, najbolja se bira po bodovima: +10.000 ako naziv odgovara obrascu vremena, -5.000 za običan `DATE`, plus broj različitih vrijednosti u uzorku. Datum cijelog dana i konstantan početak sesije uzimaju gotovo nijednu različitu vrijednost, pa trenutak događaja pobjeđuje. Jedinica je tada *Unix vremenski žig (ms)*.
- **Inače po nazivu:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, zatim nazivi proteklog vremena (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Jedinica se tada procjenjuje iz vrijednosti: ISO-8601 kada vrijednost izgleda kao `YYYY-MM-DDT…` ili `YYYY-MM-DD …`; inače po najvećoj veličini: iznad 10^17 nanosekundi, iznad 10^14 mikrosekundi, iznad 10^11 Unix milisekundi, iznad 10^8 Unix sekundi, iznad 10^6 milisekundi, inače sekunde.

Kada se izabere kolona proteklog vremena, panel napominje da je svaka sesija tada poravnata na svoj vlastiti početak - dobro za preklapanje mečeva, ne za gledanje u stvarnom slijedu.

### Sesija, osoba, grupa {#session-person-group}

Sesija se preuzima **poslije** ose vremena i **prije** osobe i grupe, jer je kolona sesije često vremenski žig (trenutak početka meča na svakom redu meča).

| Uloga | Obrasci naziva, po redu |
|---|---|
| Sesija | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (svaki tačno, uz opcionalno `_id`) |
| Osoba | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, zatim `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (podaci o trci: automobil je ono što se kreće) |
| Grupa | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupa, rezerva | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result` |

Kandidat za grupu koji ima različitu vrijednost u većini uzorkovanih redova (više od max(48, 60% uzorka)) je identifikator, a ne grupa: postaje kolona osobe ako nijedna nije nađena, i ne koristi se kao grupa. Ako uopšte nije nađena kolona grupe, koristi se nebrojčana kolona s najmanje različitih vrijednosti između 2 i 12.

### Smjer pogleda {#look-direction}

Brojčana kolona nazvana `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` ili `rot_z` / `rotation_z` prebacuje smjer pogleda na zakretanje/propinjanje; propinjanje se traži kao `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Stepeni se pretpostavljaju kada neki uzorkovani zakret ima apsolutnu vrijednost preko 7, inače radijani. Vektor smjera se nikada ne pogađa; dolazi iz savjeta dolje ili od vas.

### Kolone filtera {#filter-columns}

Automatski se zadržava najviše **6** kolona, rangiranih:

1. `region`, `sessionMode`, `actor` - kolone koje postoje da bi se po njima filtriralo (bodovi 1200);
2. kolone kategorije koje variraju u uzorku, s manje različitih vrijednosti prvo (1000 minus broj);
3. kolona konstantna u uzorku, ali samo kada se učita više datoteka - može se razlikovati između datoteka, kao regija ili identifikator testnog pokretanja (600);
4. brojčane kolone (500).

Kolone koje već imaju ulogu, gore navedeni nazivi šuma, kolone konstantne pri učitavanju jedne datoteke, i slobodno-tekstualne kolone (više od max(16, polovine uzorka) različitih vrijednosti) se ne nude automatski. Svaka kolona se i dalje može štiklirati ručno.

### Osa prema gore {#up-axis}

Kada su sve tri ose mapirane, osa s manjim rasponom Y i Z u uzorku uzima se kao gore (mapa je mnogo šira nego visoka); inače se pretpostavlja Z gore.

## Savjeti `heat3d` u podnožju Parquet datoteke {#the-heat3d-hints-in-a-parquet-footer}

Parquet datoteka može reći kako treba da se čita. Ako metapodaci ključ/vrijednost u podnožju datoteke imaju unos s ključem **`heat3d`**, njegova vrijednost se parsira kao JSON i postavlja preko pogađanja ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Konverter CS2 demo-a upisuje takav unos, pa se njegove tabele otvaraju s igračem kao osobom, stranom kao grupom, svakom rundom kao sesijom, smjerom pogleda uključenim i svijetom ispravno okrenutim.

Samo se **prva** datoteka izbora čita za savjete. Svaki unos je neobavezan, i svaka savjetovana vrijednost se i dalje pojavljuje u panelu i može se promijeniti. Potpuni opis šeme, s primjerom i načinom pisanja, je u [Referenci formata podataka](data-formats.md#the-heat3d-hints).

Pravila, ukratko:

- Kolona navedena u savjetu primjenjuje se samo kada datoteka ima tu kolonu.
- `lookMode: "vector"` stupa na snagu samo kada su `dirX`, `dirY` i `dirZ` svi postavljeni; `"yawPitch"` samo kada je `yaw` postavljen.
- `extra`, kada je prisutan, zamjenjuje automatski spisak filtera (nepoznati nazivi i kolone koje već imaju ulogu se izbacuju); tip raspon/kategorija svakog slijedi da li je izgledao brojčano. Kada nije prisutan, automatski spisak se zadržava bez kolona kojima je savjet dao ulogu.
- `axes.up` mora biti `"y"` ili `"z"`, okretanja moraju biti boolean vrijednosti, `scale` mora biti pozitivan.
- `entity.size`, kada je pozitivan, je veličina jedne praćene stvari u jedinicama datoteke ([veličina entiteta](sessions-persons-groups.md#entity-size)); to je jedini način da se postavi.

## Poznat problem: promjena CSV razdjelnika {#known-issue-overriding-the-csv-separator}

Kada promijenite razdjelnik u onaj koji se razlikuje od otkrivenog, spisak kolona i uzorkovani redovi se ne mijenjaju (pregled i dalje dijeli s otkrivenim razdjelnikom). Izabrani razdjelnik se i dalje koristi za samo učitavanje. Ako je otkriveni razdjelnik pogrešan:

1. Otvorite datoteku u uređivaču teksta.
2. Zamijenite razdjelnik zarezom svuda (a decimalne zareze tačkama).
3. Sačuvajte, pa ponovo učitajte datoteku.

Uzrok je u [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
