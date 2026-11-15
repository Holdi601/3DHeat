---
title: "Pretvarači zadržavaju sve"
parent: "Unos podataka"
nav_order: 8
lang: "hr"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Pretvarači zadržavaju sve

Ne trebate ovu stranicu da biste otvorili reprodukciju. Namijenjena je ljudima koji pišu alate koji pretvaraju datoteke igara u tablice 3DHeat-a, i svakome tko želi znati zašto te tablice drže toliko.

Svaki alat koji pretvara reprodukciju, demo, dnevnik ili telemetriju uživo igre u nešto što preglednik otvara slijedi jedno pravilo:

> **Pretvorite sve što izvor drži i što se može pročitati sada, a ostatak zadržite cijelog, da se može pročitati kasnije bez izvorne datoteke.**

Reprodukcija često nestane nakon nadogradnje igre, ponovne instalacije ili punog diska, a telemetrija uživo nestane čim je poslana. Ono što pretvarač odbaci izgubljeno je zauvijek. Ono što zadrži cijelo može se dekodirati onog dana kad netko to razumije. Zato pretvarač nikad ne odlučuje što će biti korisno: dekodira ono što može, zadrži svaku drugu poruku, paket, događaj, svojstvo ili redak nepromijenjene uz tablicu, i u vlastitom izlazu kaže koliko je od svakoga pročitao, a koliko je samo zadržao.

Ova stranica je konvencija koju dijele svi pretvarači: pretvarači reprodukcija War Thundera, World of Tanksa, World of Warshipsa i Squada, pretvarač demo-snimki CS2, pozadinski nadzornik (njegov dekoder Dota reprodukcija i svaki adapter uživo), čitači telemetrije alata za snimanje igre i vlastiti uvozi preglednika (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Vlastiti čitači preglednika opisani su u [Tacview snimkama](tacview-acmi.md) i [Učitavanje datoteka](loading-files.md). Oblik jedne datoteke je [Jedna datoteka po utakmici](container.md). Jedna utakmica postaje tablica, `match.json` i prateće datoteke, po želji spakirane u jednu `.3dheat` datoteku. Odjeljak **Completeness** u README-u svakog alata navodi, za taj izvor, što je pročitano, što je zadržano sirovo i što nije dostupno, i zašto.

## Tri mjesta za svaku stavku {#three-homes-for-every-item}

Sve što izvor drži završava na točno jednom od tri mjesta:

| Mjesto | Što ide tamo |
|---|---|
| **Dekodirano** | Tablica (jedan redak po uzorku ili događaju, stupci koje preglednik čita, dodatni stupci za svaku drugu vrijednost koja pripada retku) i dokument utakmice `<match>.match.json` (sve što pripada utakmici kao cjelini: postavke, popisi igrača, rezultati, tablice rezultata, samoprovjera). |
| **Zadržano sirovo** | Prateća datoteka uz tablicu: svaka stavka koja nije dekodirana, ili je samo djelomično dekodirana, cijela i nepromijenjena, s vrstom, vremenom i jedinicom ili entitetom kojem pripada. |
| **Nije dostupno** | Navedeno u odjeljku Completeness u README-u s razlogom: format to ne nosi (reprodukcija klijenta nema unose drugih igrača), izvor to nikad ne šalje, ili čitanje nije dopušteno (zaštićeni proces, šifrirani blok čiji ključ nije naš za korištenje). |

Stavka koja je **djelomično** dekodirana dekodira se *i* zadržava sirovo: tablica dobiva ono što je shvaćeno, a prateća datoteka cijelu stavku. Tako kasniji bolji dekoder ne treba izvornu datoteku.

Četvrtog mjesta nema. Odbaciti nešto zato što je izgledalo beskorisno, zato što je bilo duplikat "vjerojatno", ili zato što je bilo veliko, greška je. Proređivanje je dopušteno samo u tablici (kamera na 2 Hz umjesto 60), nikad u pratećoj datoteci.

## Prateće datoteke {#sidecars}

Prateća datoteka je Parquet datoteka uz tablicu, nazvana po njoj:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` je jedna riječ s ovog popisa. Novi pretvarač odabire riječ koja odgovara ili dodaje novu ovdje **i** u `SIDECAR_PARQUET` u [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), da je preglednik izostavi kad se učita cijela mapa.

| `<what>` | Sadrži | Koriste |
|---|---|---|
| `messages` | paketi, pozivi metoda entiteta i ažuriranja svojstava mrežnog toka, cijeli | War Thunder, World of Tanks, World of Warships |
| `flight` | unosi modela leta po zrakoplovu, cijeli | War Thunder |
| `packets` | cijeli okviri i mrežne poruke, ili dijelovi spremnika, izvan toka entiteta | CS2, Dota 2, Squad |
| `events` | događaji igre sa svim ključevima, kako ih parser daje | CS2 |
| `entities` | ažuriranja entiteta i svojstava, udaljeni pozivi, kanali otvoreni i zatvoreni, s izvozima koje dekoder treba | Squad, Dota 2 |
| `props` | svako svojstvo entiteta koje parser čita, svaki put kad se promijeni | CS2 |
| `units` | stanje jedinice izvan tablice položaja | Dota 2 |
| `combatlog` | borbeni dnevnik, svaki unos sa svakim poljem | Dota 2 |
| `strings` | svaki unos svake tablice nizova | CS2, Dota 2 |
| `objectives` | zone zauzimanja i ciljevi, svaka promjena s vremenom | War Thunder |
| `raw` | živi tok: svaki primljeni paket, redak, API dokument ili čitanje memorije, cijeli | sesije nadzornika (`heat.raw.parquet`), snimači krugova alata za snimanje igre (`<stamp>_<game>.raw.parquet`), datoteke reprodukcija osu!, LoL i Valorant nadzornika |

Učitavanje mape u preglednik preskače svaki `*.<what>.parquet` s ovog popisa, i svaki `*.match.json`, `*.meta.json`, `*.summary.json` i ostale JSON prateće datoteke. Ako se jedna od njih otvori sama, odabirom ili ispuštanjem samo te datoteke, učitava se kao svaka druga tablica (vidi [Učitavanje datoteka](loading-files.md)).

To su datoteke onako kako ih pretvarač zapisuje s `--loose`. Pretvarači War Thundera, CS2 i Tacviewa po zadanom pakiraju tablicu, dokument i prateće datoteke utakmice u jednu datoteku, `<match>.3dheat`, pod istim imenima (vidi [Jedna datoteka po utakmici](container.md)). Sve ovdje vrijedi za svakog člana.

### Stupci {#columns}

Svaki redak prateće datoteke je jedna stavka. Stupci su, tim redom, oni koji se primjenjuju:

| Stupac | Tip | Što |
|---|---|---|
| `time` | float64 | sekunde na istom satu kao `time` tablice (ili `tick` gdje izvor broji ticke; tada oba) |
| `type` | string (rječnik) | što je stavka, prema vlastitim pojmovima izvora: vrsta paketa, id poruke, ime događaja, put svojstva, prefiks retka |
| `name` | string (rječnik) | njezino ime kad je poznato (zajedničko ime, ime klase), inače prazno |
| `entity` / `unit` / `uid` / `player` | cijeli broj ili string | kome pripada, istim id-ovima kao u tablici, da se redak prateće datoteke može spojiti s putanjom |
| `decoded` | string (JSON) | što se razumije o njoj, gdje se išta razumije; inače prazno |
| `payload` | binarno | bajtovi stavke, cijeli i nepromijenjeni (binarni izvori) |
| `text` | string | tekst stavke, cijel i nepromijenjen (tekstualni izvori: redak dnevnika, JSON objekt, blok ključ-vrijednost) |

Dopušteni su i dodatni stupci (pomak bita, veličina, kanal). Ponavljajući nizovi kodiraju se rječnikom, a datoteka se piše sa zstd, pa prateća datoteka ostaje djelić veličine same reprodukcije.

Prateća datoteka mora biti dovoljna sama za sebe: dekoder napisan kasnije čita prateću datoteku, nikad izvornu reprodukciju. Gdje se stavka ne može razumjeti bez konteksta (klasa entiteta, tablica nizova, ključ na koji poruka upućuje), kontekst ide i u prateću datoteku ili u dokument utakmice.

### Živi izvori {#live-sources}

Živi adapteri (UDP telemetrija, dijeljena memorija, dnevnik igre, lokalni API) nemaju datoteku kojoj se može vratiti. Oni bilježe **svako polje koje izvor šalje**, čak i ono što ništa još ne koristi:

- tok paketa: svaki paket cijeli, `payload` su bajtovi, `type` njegov id paketa ili format, u brzini kojom stiže;
- dijeljena memorija ili ispitivani API: svako polje svakog čitanja, bilo kao imenovani stupci ili cijeli blok kao `payload`, u brzini kojom adapter čita;
- dnevnik: svaki redak, `text` je redak, `type` vrsta retka, uključujući retke koje adapter ne koristi.

Ovo ide u `<session>.raw.parquet` uz tablicu sesije. Veličina je cijena pravila. Drži se niskom zbog zstd i kodiranja rječnikom, a ne izostavljanjem.

## Samoprovjera {#the-self-check}

Svaki pretvarač zapisuje u svoj dokument utakmice (ili u `meta.json` sesije, ili u sažetak gdje nema dokumenta utakmice) blok `completeness` pod `selfCheck`:

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
| `decoded` | pročitano cijelo u tablicu ili dokument utakmice |
| `partial` | pročitano djelomično u tablicu ili dokument, i zadržano cijelo u pratećoj datoteci |
| `raw` | zadržano cijelo samo u pratećoj datoteci, nije dekodirano |
| `lost` | `seen - decoded - partial - raw`: mora biti 0 |

Najviši `lost` je zbroj. Testovi pretvarača tvrde da je 0 na njihovim sintetičkim uzorcima, a README kaže što je bio na stvarnima. Nenulti `lost` je pretvarač koji kaže da je prekršio pravilo. Imenuje vrstu, pa se rupa može pronaći.

"Vrste" su vlastite izvora: vrste paketa, id-ovi poruka, imena događaja, grupe svojstava, vrste redaka. Broje se onda kad ih pretvarač sretne, a ne iz popisa onoga što očekuje. Tako se vrsta koju nitko nije poznavao pojavi sa svojim brojem umjesto da nestane.

## Odjeljak Completeness u README-u {#the-readmes-completeness-section}

Svaki README pretvarača ima odjeljak naslovljen **Completeness**, s tri popisa:

- **Read** (pročitano): što ide u tablicu i dokument utakmice, i kako je svako novo polje provjereno naspram nečega neovisnog (brojevi same igre, drugi izvor, snimka napravljena baš za to).
- **Kept raw** (zadržano sirovo): što je u kojoj pratećoj datoteci, pod kojim `type`, i što je do sada poznato o tome.
- **Not available** (nije dostupno): što izvor ne nosi ili se ne smije čitati, i zašto.

Odjeljak se vraća ovdje.

## Gdje stoji svaki pretvarač {#where-each-converter-stands}

| Pretvarač | Prateće datoteke | Njegov odjeljak Completeness |
|---|---|---|
| War Thunder reprodukcije | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (njegovi brojevi samoprovjere su pod `counts`; blok `completeness` slijedi) |
| World of Tanks reprodukcije | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships reprodukcije | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad demo-snimke poslužitelja | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 demo-snimke | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 reprodukcije (nadzornik) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 reprodukcije](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant reprodukcije (nadzornik) | `raw` | njihove stranice u [dokumentaciji nadzornika](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adapteri uživo (nadzornik) | `raw` | stranica svake igre u [dokumentaciji nadzornika](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), i [razvoj](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) za `Session.raw` |
| Snimači krugova (alat za snimanje igre) | `raw`, i `unparsed` bajtovi unutar Forza datoteke kruga | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Vlastiti uvozi preglednika | nema: vidi dolje | ova stranica |

### Vlastiti uvozi preglednika {#the-viewers-own-imports}

Tacview ACMI, OCAP i GPS formati čitaju se u pregledniku iz korisnikove vlastite datoteke. Preglednik ništa od njih ne pohranjuje, pa sama datoteka ostaje zapis. Ipak čitaju koliko mogu:

- **Tacview ACMI** (`src/data/acmi.ts`): svaki redak objekta s položajem je redak sa svakim svojstvom koje snimka nosi, svaki događaj je redak, svako uklanjanje je redak, a vlastita svojstva snimke (s FileType i FileVersion iz zaglavlja) su na svakom retku kao `RecordingInfo`. Redak komentara je događaj `Comment`, objekt koji nikad ne dobije položaj postaje redak `Unplaced` u referentnoj točki, a U/V su stupci kad ih imaju bilo koji retci. Redak svojstva bez položaja čita se djelomično: njegove vrijednosti dolaze do sljedećeg retka objekta, ne u svoje vrijeme. `AcmiTable.completeness` broji retke datoteke po vrsti.
- **OCAP** (`src/data/ocap.ts`): svi okviri, pucnjevi, oznake svakog entiteta, svaka vrsta događaja (nepoznate vrste kao retci "Mission" s njihovim tekstom) i vlastita polja dokumenta (`Info`). Još nije čitano: polja entiteta i dodatni elementi položaja osim onih navedenih u njegovu zaglavlju (dodaci novijeg snimača), i ponovljeni okviri mrtve jedinice nakon smrti (namjerno proređeni: ništa se u njima ne mijenja).
- **GPS formati** (`src/data/geoTracks.ts`): fiksevi, njihovo vrijeme, visina, kurs i brzina, te srčani ritam, kadenca, snaga, temperatura, sateliti, HDOP i visina tlaka tamo gdje ih datoteka bilježi. Još nije čitano: druga GPX i KML proširenja, NMEA rečenice osim onih o položaju, IGC zapisi osim fiksova i njihovih proširenja, i FIT poruke osim zapisa (krugovi, sesije, podaci o uređaju).

Ovi nedostaci su navedeni da bi se zatvorili, a ne da bi se opravdali. Izvozi preglednika učitane snimke (`src/data/exportRecording.ts`) zapisuju samo ono što je pročitano.

## Dodavanje pretvarača {#adding-a-converter}

1. Popišite što format drži, iz njegove dokumentacije, njegovih vlastitih struktura ili brojanjem svake vrste poruke u stvarnim uzorcima. Popis je `types` samoprovjere.
2. Dekodirajte što se može sada provjeriti. Svako novo polje provjerava se naspram nečega neovisnog prije nego što uđe u tablicu; polje koje se još ne može provjeriti ostaje sirovo.
3. Ostatak zadržite cijelog u pratećoj datoteci imenovanoj kao gore, sa stupcima gore.
4. Napišite blok `completeness` i test da ima `lost` 0.
5. Napišite odjeljak Completeness u README-u i poveznicu ovdje.
6. Ako je `<what>` prateće datoteke nov, dodajte ga u tablicu gore i u `SIDECAR_PARQUET` u `src/data/filePick.ts`.

Pretvarači su čista soba (clean-room): pišu se iz formata, dokumentacije i uzoraka, nikad iz GPL ili AGPL koda. Uzorci stvarnih reprodukcija ostaju na stroju koji ih je napravio; testovi koriste sintetičke datoteke.
