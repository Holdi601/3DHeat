---
title: "Konverteri zadržavaju sve"
parent: "Unos podataka"
nav_order: 8
lang: "bs"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konverteri zadržavaju sve

Ova stranica vam nije potrebna da otvorite reprodukciju. Namijenjena je ljudima koji pišu alate koji pretvaraju datoteke igara u tabele za 3DHeat, i svakome ko želi da zna zašto te tabele drže toliko.

Svaki alat koji pretvara reprodukciju, demo, dnevnik ili telemetriju uživo igre u
nešto što pregledač otvara, slijedi jedno pravilo:

> **Pretvorite sve što izvor drži a što se može pročitati sada, a ostatak
> zadržite cijelim, da se može pročitati kasnije bez originalne datoteke.**

Reprodukcija je često nestala poslije ažuriranja igre, ponovne instalacije ili punog diska, a telemetrija uživo nestaje čim je poslata. Ono što konverter odbaci izgubljeno je zauvijek; ono što zadrži cijelo može se dekodirati onog dana kad neko to razumije. Zato konverter nikad ne odlučuje šta će biti korisno: dekodira ono što može, pored tabele zadržava svaku drugu poruku, paket, događaj, svojstvo ili red nepromijenjene, i u vlastitom izlazu kaže koliko je od svake pročitao, a koliko samo zadržao.

Ova stranica je konvencija koju dijele svi konverteri: konverteri reprodukcija War Thundera, World of Tanks, World of Warships i Squada, konverter demo snimaka CS2, pozadinski posmatrač (njegov dekoder reprodukcija Dote i svi adapteri uživo), čitači telemetrije alata za snimanje igre, i sopstveni uvozi pregledača (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Vlastite čitače pregledača opisuju [Tacview snimci](tacview-acmi.md) i [Učitavanje datoteka](loading-files.md); oblik jedne datoteke je [Jedna datoteka po meču](container.md). Jedan meč postaje tabela, `match.json` i pomoćne datoteke, po želji spakovane u jednu `.3dheat` datoteku. Odjeljak **Potpunost** u README-u svakog alata navodi, za taj izvor, šta je pročitano, šta je zadržano sirovo i šta nije dostupno, i zašto.

## Tri mjesta za svaku stavku {#three-homes-for-every-item}

Sve što izvor drži završava tačno na jednom od tri mjesta:

| Mjesto | Šta ide tamo |
|---|---|
| **Dekodirano** | Tabela (jedan red po uzorku ili događaju, kolone koje čita pregledač, dodatne kolone za svaku drugu vrijednost koja pripada redu) i dokument meča `<match>.match.json` (sve što pripada meču kao cjelini: postavke, spiskovi, rezultati, tabele rezultata, samoprovjera). |
| **Zadržano sirovo** | Pomoćna datoteka pored tabele: svaka stavka koja nije dekodirana, ili je samo djelimično dekodirana, cijela i nepromijenjena, s njenom vrstom, vremenom i jedinicom ili entitetom kome pripada. |
| **Nije dostupno** | Navedeno u odjeljku Potpunost u README-u s razlogom: format to ne nosi (klijentska reprodukcija nema unose drugih igrača), izvor to nikad ne šalje, ili je čitanje nije dozvoljeno (zaštićen proces, šifrovani blok čiji ključ nije naš da ga koristimo). |

Stavka koja je **djelimično** dekodirana je dekodirana *i* zadržana sirovo: tabela
dobija ono što se razumije, pomoćna datoteka cijelu stavku, pa boljem dekoderu kasnije
ne treba originalna datoteka.

Nema četvrtog mjesta. Odbacivanje nečega zato što je izgledalo beskorisno, zato što je
bilo duplikat „vjerovatno", ili zato što je bilo veliko, je greška. Proređivanje je dozvoljeno
samo u tabeli (kamera na 2 Hz umjesto 60), nikad u pomoćnoj datoteci.

## Pomoćne datoteke {#sidecars}

Pomoćna datoteka je Parquet datoteka pored tabele, nazvana po njoj:

```
<folder>/<match>.parquet              tabela
<folder>/<match>.match.json           dokument meča
<folder>/<match>.<what>.parquet       pomoćna datoteka
```

`<what>` je jedna riječ s ove liste. Novi konverter izabere riječ koja
odgovara, ili dodaje novu ovdje **i** u `SIDECAR_PARQUET` u
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
da je pregledač izostavi kad se učita cijeli folder.

| `<what>` | Sadrži | Koriste |
|---|---|---|
| `messages` | pakete, pozive metoda entiteta i ažuriranja svojstava mrežnog toka, cijele | War Thunder, World of Tanks, World of Warships |
| `flight` | unose modela leta po avionu, cijele | War Thunder |
| `packets` | cijele okvire i mrežne poruke, ili dijelove kontejnera, izvan toka entiteta | CS2, Dota 2, Squad |
| `events` | događaje igre sa svim njihovim ključevima, onako kako ih parser daje | CS2 |
| `entities` | ažuriranja entiteta i svojstava, udaljene pozive, kanale otvorene i zatvorene, sa izvozima koje dekoder treba | Squad, Dota 2 |
| `props` | svako svojstvo entiteta koje parser čita, svaki put kad se promijenilo | CS2 |
| `units` | stanje jedinica izvan tabele položaja | Dota 2 |
| `combatlog` | borbeni dnevnik, svaki unos sa svakim poljem | Dota 2 |
| `strings` | svaki unos svake tabele stringova | CS2, Dota 2 |
| `objectives` | zone zarobljavanja i ciljevi, svaka promjena s vremenom | War Thunder |
| `raw` | telemetrija uživo: svaki primljeni paket, red, API dokument ili čitanje memorije, cijeli | sesije posmatrača (`heat.raw.parquet`), snimači kruga alata za snimanje igre (`<stamp>_<game>.raw.parquet`), datoteke reprodukcija osu!, LoL i Valoranta posmatrača |

Pregledačevo učitavanje foldera preskače svaki `*.<what>.parquet` s ove liste,
i svaki `*.match.json`, `*.meta.json`, `*.summary.json` i ostale JSON pomoćne datoteke; otvaranje jedne od njih samostalno,
biranjem ili prevlačenjem samo te datoteke, učitava je kao svaku drugu tabelu (vidi [Učitavanje datoteka](loading-files.md)).

Ovo su datoteke onako kako ih konverter piše s `--loose`. Podrazumijevano konverteri War Thundera, CS2 i Tacviewa pakuju tabelu, dokument i pomoćne datoteke meča u jednu datoteku, `<match>.3dheat`, pod istim imenima (vidi [Jedna datoteka po meču](container.md)); sve ovdje važi za svaki član.

### Kolone {#columns}

Svaki red pomoćne datoteke je jedna stavka. Kolone su, ovim redom, one koje se primjenjuju:

| Kolona | Tip | Šta |
|---|---|---|
| `time` | float64 | sekunde na istom satu kao `time` tabele (ili `tick` gdje izvor broji takte; tada oboje) |
| `type` | string (rječnik) | šta je stavka, u terminima samog izvora: vrsta paketa, id poruke, ime događaja, putanja svojstva, prefiks reda |
| `name` | string (rječnik) | njeno ime tamo gdje je poznato (ime iz zajednice, ime klase), inače prazno |
| `entity` / `unit` / `uid` / `player` | cijeli broj ili string | kome pripada, istim id-ovima kao u tabeli, pa se red pomoćne datoteke može spojiti s putanjom |
| `decoded` | string (JSON) | šta se od nje razumije, gdje se bilo šta razumije; inače prazno |
| `payload` | binarno | bajtovi stavke, cijeli i nepromijenjeni (binarni izvori) |
| `text` | string | tekst stavke, cijel i nepromijenjen (tekstualni izvori: red dnevnika, JSON objekat, blok ključ-vrijednost) |

Dodatne kolone su dozvoljene (pomak bita, veličina, kanal). Stringovi koji se ponavljaju
kodirani su rječnikom, a datoteka je pisana sa zstd, pa pomoćna datoteka ostaje djelić veličine same reprodukcije.

Pomoćna datoteka mora biti dovoljna sama za sebe: dekoder napisan kasnije čita pomoćnu datoteku,
nikad originalnu reprodukciju. Gdje se stavka ne može razumjeti bez konteksta (klasa entiteta, tabela stringova,
ključ na koji se poruka odnosi), kontekst ide i u pomoćnu datoteku, ili u dokument meča.

### Izvori uživo {#live-sources}

Adapteri uživo (UDP telemetrija, dijeljena memorija, dnevnik igre, lokalni API) uopšte nemaju datoteku
kojoj se može vratiti. Oni bilježe **svako polje koje izvor šalje**, čak i ona koja još ništa ne koriste:

- tok paketa: svaki paket cijel, `payload` su bajtovi, `type` njegov id paketa ili format, onom brzinom kojom stiže;
- dijeljena memorija ili anketirani API: svako polje svakog čitanja, bilo kao imenovane kolone ili cijeli blok kao `payload`, onom brzinom kojom adapter čita;
- dnevnik: svaki red, `text` je red, `type` vrsta reda, uključujući redove na koje adapter ne reaguje.

Ovo ide u `<session>.raw.parquet` pored tabele sesije. Veličina je cijena pravila;
drži se niskom zstd i rječničkim kodiranjem, a ne izostavljanjem stvari.

## Samoprovjera {#the-self-check}

Svaki konverter piše, u svoj dokument meča (ili `meta.json` sesije, ili sažetak tamo gdje nema dokumenta meča), blok `completeness` pod `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Polje | Značenje |
|---|---|
| `seen` | koliko stavki ove vrste izvor drži |
| `decoded` | pročitano cijelo u tabelu ili dokument meča |
| `partial` | pročitano djelimično u tabelu ili dokument, a zadržano cijelo u pomoćnoj datoteci |
| `raw` | zadržano cijelo samo u pomoćnoj datoteci, nije dekodirano |
| `lost` | `seen - decoded - partial - raw`: mora biti 0 |

Najviši `lost` je zbir. Testovi konvertera tvrde da je 0 na njihovim sintetičkim uzorcima, a README kaže šta je bilo na pravim. `lost` različit od nule je konverter koji kaže da je prekršio pravilo; imenuje vrstu, pa se rupa može naći.

„Vrste" su vlastite vrste izvora: vrste paketa, id-ovi poruka, imena događaja, grupe svojstava, vrste redova. Broje se onda kad ih konverter sretne, a ne iz spiska onoga što očekuje, pa se vrsta koju niko nije znao pojavljuje sa svojim brojem umjesto da nestane.

## Odjeljak Potpunost u README-u {#the-readmes-completeness-section}

README svakog konvertera ima odjeljak naslovljen **Potpunost**, s tri spiska:

- **Pročitano**: šta ide u tabelu i dokument meča, i kako je svako novo polje provjereno naspram nečega nezavisnog (brojeva same igre, drugog izvora, snimka napravljenog u tu svrhu).
- **Zadržano sirovo**: šta je u kojoj pomoćnoj datoteci, pod kojim `type`, i šta se do sada zna o tome.
- **Nije dostupno**: šta izvor ne nosi ili se ne smije čitati, i zašto.

Vraća se na ovu stranicu.

## Gdje stoji svaki konverter {#where-each-converter-stands}

| Konverter | Pomoćne datoteke | Njegov odjeljak Potpunost |
|---|---|---|
| Reprodukcije War Thundera | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (brojevi njegove samoprovjere su pod `counts`; blok `completeness` slijedi) |
| Reprodukcije World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Reprodukcije World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demo snimci Squad servera | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demo snimci CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Reprodukcije Dote 2 (posmatrač) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Reprodukcije Dote 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Reprodukcije osu!, LoL, Valoranta (posmatrač) | `raw` | njihove stranice u [dokumentaciji posmatrača](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adapteri uživo (posmatrač) | `raw` | stranica svake igre u [dokumentaciji posmatrača](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), i [razvoj](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) za `Session.raw` |
| Snimači krugova (snimanje igre) | `raw`, i `unparsed` bajtovi unutar Forza datoteke kruga | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Sopstveni uvozi pregledača | nijedna: vidi ispod | ova stranica |

### Sopstveni uvozi pregledača {#the-viewers-own-imports}

Tacview ACMI, OCAP i GPS formati čitaju se u pregledaču iz korisnikove vlastite datoteke; pregledač ništa od njih ne čuva, pa sama datoteka ostaje zapis. Ipak čitaju koliko mogu:

- **Tacview ACMI** (`src/data/acmi.ts`): svaki red objekta s položajem je red sa svakim svojstvom koje snimak nosi, svaki događaj je red, svako uklanjanje je red, svojstva samog snimka (uz FileType i FileVersion iz zaglavlja) na svakom redu kao `RecordingInfo`; red komentara je događaj `Comment`, objekat koji nikad ne dobije položaj je red `Unplaced` u referentnoj tački, a U/V su kolone kad god ih neki red ima. Red svojstva bez položaja se čita djelimično: njegove vrijednosti stižu do sljedećeg reda objekta, a ne u svoje vrijeme. `AcmiTable.completeness` broji redove datoteke po vrsti.
- **OCAP** (`src/data/ocap.ts`): svi okviri, pucnji, oznake i entiteta, svaka vrsta događaja (nepoznate vrste kao redovi „Mission" sa svojim tekstom) i vlastita polja dokumenta (`Info`). Još se ne čita: polja entiteta i završni elementi položaja osim onih navedenih u njegovom zaglavlju (dodaci novijeg snimača), i ponovljeni okviri mrtve jedinice poslije njene smrti (namjerno proređeni: u njima se ništa ne mijenja).
- **GPS formati** (`src/data/geoTracks.ts`): fiksevi, njihovo vrijeme, visina, kurs i brzina, te puls, kadenca, snaga, temperatura, sateliti, HDOP i barometarska visina tamo gdje ih datoteka bilježi. Još se ne čita: druge GPX i KML ekstenzije, NMEA rečenice osim onih o položaju, IGC zapisi osim fiksova i njihovih ekstenzija, i FIT poruke osim zapisa (krugovi, sesije, podaci o uređaju).

Ovi nedostaci su navedeni da bi se zatvorili, a ne da bi se opravdali; izvozi pregledača učitanog snimka (`src/data/exportRecording.ts`) pišu samo ono što je pročitano.

## Dodavanje konvertera {#adding-a-converter}

1. Navedite šta format sadrži, iz njegove dokumentacije, njegovih vlastitih struktura, ili brojanjem svake vrste poruke u pravim uzorcima. Spisak je `types` samoprovjere.
2. Dekodirajte ono što se može provjeriti sada. Svako novo polje se provjerava naspram nečega nezavisnog prije nego što uđe u tabelu; polje koje se još ne može provjeriti ostaje sirovo.
3. Ostatak zadržite cijel u pomoćnoj datoteci nazvanoj kao gore, s kolonama iz gornjeg spiska.
4. Napišite blok `completeness` i test da ima `lost` 0.
5. Napišite odjeljak Potpunost u README-u i povežite ovu stranicu.
6. Ako je `<what>` pomoćne datoteke nov, dodajte ga u tabelu iznad i u `SIDECAR_PARQUET` u `src/data/filePick.ts`.

Konverteri su čisti (clean-room): pišu se iz formata, dokumentacije i uzoraka, nikad iz GPL ili AGPL koda. Uzorci pravih reprodukcija ostaju na mašini koja ih je napravila; testovi koriste sintetičke datoteke.
