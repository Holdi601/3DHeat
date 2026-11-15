---
title: "Jeden soubor na zápas (.3dheat)"
parent: "Jak nahrát data"
nav_order: 9
lang: "cs"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Jeden soubor na zápas: `.3dheat`

Soubor `.3dheat` je jeden celý zápas v jednom souboru, aby se dal kopírovat, uchovat nebo sdílet. Chcete-li ho otevřít, stačí soubor přetáhnout na panel Zdroj.

```
match.3dheat   (soubor ZIP)
  manifest      co zápas je a seznam všeho uvnitř
  table         pozice (Parquet)
  match.json    dokument zápasu
  sidecars      co konvertor zachoval celé (události, zprávy, ...)
```

Konvertovaný zápas dřív tvořilo několik souborů vedle sebe: tabulka `<zápas>.parquet`, dokument zápasu `<zápas>.match.json` a doprovodné soubory `<zápas>.<co>.parquet` ([Konvertory si nechávají všechno](converters.md)). Soubor `.3dheat` všechny drží v jednom: jedno přehrání, jeden soubor, který se dá kopírovat, uchovat nebo sdílet.

Je navržen tak, aby načtení tisícovky takových souborů bylo stejně rychlé jako načtení volných tabulek, a aby pozdější konvertory do něj mohly uložit mnohem víc bez nového formátu.

## Načtení jednoho {#loading-one}

Všude, kde se načítá soubor nebo složka, se načte i `.3dheat`, a složka může míchat kontejnery a volné soubory:

| Kde | Co se z kontejneru čte |
|---|---|
| Panel Zdroj v **Teplotní mapě** (soubory, složka, přetažení) | jeho tabulky, jako by to byla volná `<zápas>.parquet` |
| **Teplotní mapa → Mnoho zápasů najednou** (Soubory, Složka, Přidat složku) | jeho tabulky, čtené přímo workery načítače |
| Záložka **Zápas** (Načíst, nebo přetažení na pohled) | dokument zápasu |
| Záznam telemetrie na **Taktické tabuli** | jeho tabulky |

Otevření kontejneru přečte dva malé kousky: jeho adresář na konci a jeho manifest na začátku; z tabulky se nečte nic, dokud ji načítač nepotřebuje. Doprovodné soubory a dokument zápasu se čtou jen tehdy, když si o ně něco řekne. Složka, která drží stejný zápas dvakrát, volný i zabalený, ho načte jednou.

## Balení a rozbalování {#packing-and-unpacking}

Nové konverze zapisují kontejnery ve výchozím stavu: konvertor War Thunder (`heat3d-wt-replay`), konvertor CS2 (`heat3d_cs2 demos`) a nástroj pro Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` ponechá oddělené soubory.

Zápasy převedené dříve nebo jinými nástroji se zabalí takto:

```
node tools/3dheat-pack.mjs <složka>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <složka|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <složka|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <složka|file.3dheat>...
```

- **pack** najde každou tabulku `<zápas>.parquet` ve složkách se soubory, které k ní patří, a zapíše vedle nich `<zápas>.3dheat`. Zápas, který je už zabalen, se přeskočí. Každý kontejner se před čímkoli jiným přečte celý zpět (sha256, velikost, CRC a patička Parquetu každého člena); volné soubory se smažou jen s `--delete-loose`, a u zápasu zabaleného dříve jen tehdy, když jsou bajt po bajtu tím, co kontejner drží. Zápas se souborem změněným během posledních `--settle` minut (výchozích 10) se nechá být: konvertor do něj ještě může zapisovat.
- **unpack** zapíše členy zpět jako volné soubory vedle kontejneru.
- **update** přidá nebo nahradí členy, aniž by přepsal tabulky, které už jsou v kontejneru (níže).
- **repack** přepíše kontejner celý a zahodí to, co po aktualizacích zůstalo.

## Formát {#the-format}

Soubor `.3dheat` je archiv ZIP (každý nástroj pro ZIP ho otevře), s těmito pravidly:

1. **`manifest.json` je prvním členem**, když se kontejner zapisuje, a je vždy přítomen. Najde se přes centrální adresář ZIPu, takže po `update` může ležet později v souboru.
2. **Členové, které se čtou podle rozsahu bajtů, nebo jsou už komprimovaní, se ukládají** (metoda ZIP 0): Parquet, Arrow, obrázky, modely, zvuk, video, neprůhledné bloby. Uložený člen je jeden souvislý rozsah bajtů kontejneru, takže čtenář přečte patičku tabulky a její sloupcové bloky na místě, pomocí `File.slice` v prohlížeči nebo HTTP požadavku na rozsah, přesně tak, jak by četl volný soubor.
3. **Text je komprimovaný deflate** (metoda 8): JSON, CSV, prostý text. Jsou malé a čtou se celé.
4. Názvy jsou UTF-8 (příznakový bit 11), relativní, oddělené `/`, bez `..`; mohou obsahovat složky (`analysis/heat.json`). Volný soubor zabalený si zachová svůj název, takže rozbalení vrátí stejné soubory.
5. Členové větší než 4 GiB nebo kontejnery s více než 65 535 členy používají ZIP64 jako obvykle. Zapisovače nedávají za členy žádné popisovače dat.

Členy, které konvertory dnes zapisují, v tomto pořadí:

| Role | Člen | Uložený |
|---|---|---|
| `table` | `<zápas>.parquet` | ano |
| `match` | `<zápas>.match.json` | ne (komprimovaný deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<zápas>.<role>.parquet` | ano |
| `summary` | `<zápas>.summary.json`, souhrn rejstříku hromadné analýzy ([Hromadná analýza](mass-analysis.md)), přidaný `tools/3dheat-summarize.mjs` | ne (komprimovaný deflate) |

Tabulka přijde hned za manifestem, takže první čtení začátku souboru čtenářem pokryje manifest i lokální hlavičku tabulky najednou.

### Manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Pole | Význam |
|---|---|
| `format` | vždy `3dheat` |
| `format_version` | `hlavní.vedlejší` (níže) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | co zápas je a co ho vytvořilo; `null`, kde to není známo |
| `created`, `updated` | kdy zapsáno, kdy naposledy aktualizováno (`updated` se objeví jen po aktualizaci) |
| `roles` | každá role na název jejího prvního člena: rychlý rejstřík |
| `members` | každý člen kromě manifestu: úplný seznam a ten, kterému čtenář věří |
| `matches` | volitelné: zápasy kontejneru, který jich drží několik (níže) |
| `references` | volitelné: soubory, které kontejner potřebuje, ale nedrží |
| `extensions` | volitelné: vlastní metadata konvertoru |

Každý člen:

| Pole | Význam |
|---|---|
| `name` | jeho cesta v kontejneru |
| `role` | k čemu slouží (níže) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` nebo `deflate` |
| `bytes` | jeho velikost, nekomprimovaná |
| `sha256` | z jeho bajtů, nekomprimovaných |
| `rows` | počet řádků tabulky |
| `schema` | konvence, kterou dodržuje, `{ "id", "version" }`: vlastní `format` a `version` dokumentu (`heat3d-wt-replay-match` 2), `heat3d-table` pro tabulku, kterou prohlížeč čte podle její patičky `heat3d`, `heat3d-acmi-table` pro tabulku nástroje Tacview |
| `match` | v kontejneru více zápasů je to `matches[].id`, ke kterému člen patří |

### Stvořeno k růstu {#made-to-grow}

Formát má unést mnohem bohatší přehrání, než jaká jsou dnes, aniž by rozbil to, co je čte teď:

- **Verze.** `format_version` je `hlavní.vedlejší`. Čtenář přečte každou vedlejší verzi své hlavní a ignoruje každé pole, které nezná. Vedlejší číslo roste, když se něco přidá; hlavní jen tehdy, když se rozložení změní tak, že by starší čtenář četl špatně (člen už není uložený, manifest se přesunul mimo archiv). Konvence každého člena má vlastní verzi ve svém `schema`, takže nová podoba tabulky nebo nová verze dokumentu nepotřebuje novou verzi kontejneru. První kontejnery psaly `"version": 1`; čtenáři to berou jako 1.0.
- **Role jsou otevřené.** Role je jakýkoli řetězec. Čtenáři použijí role, které znají, a ostatní nechají být: neznámá role se vypíše, nikdy se neodmítne, a `update` i `repack` ji nechají nedotčenou. Role může mít mnoho členů: několik tabulek (stopy jednotek, telemetrie v jiných frekvencích), události, hlas, synchronizaci videa, odkazy na úrovně, přepisy figur, výsledky analýz. Názvy mohou obsahovat složky.
- **Jakákoli média.** Člen může být čímkoli, co má typ média: Parquet, JSON, Arrow, náhledy PNG nebo JPEG, modely glTF, zvuk, surové bloby.
- **Více zápasů.** Relace nebo turnaj se může vejít do jednoho kontejneru: `matches` je vyjmenuje (`{ "id", "map", "mode", "started", ... }`) a každý člen pojmenuje svůj `match`. Prohlížeč načte každého člena role `table`.
- **Odkazy.** Soubory, které kontejner potřebuje, ale nedrží, například úroveň pro jeden z nich, jsou vypsány v `references` podle názvu a sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), takže se správný soubor najde a ověří, aniž by se kopíroval do každého zápasu.
- **Rozšíření.** `extensions` drží vlastní metadata konvertoru pod jeho vlastním klíčem, `"<dodavatel>/<název>": { ... }`, takže se dva konvertory nikdy nesrazí a nic se nemusí přidávat do sdílených polí.
- **Aktualizace na místě.** `update` přidá nebo nahradí členy, aniž by přepisoval velké uložené tabulky: nové členy a nový manifest se připojí za konec kontejneru, za nimi nový centrální adresář. To, co bylo nahrazeno, zůstane jako nepřiřazené bajty až do `repack`. Každý člen a každé pole manifestu, známé i neznámé, se zachová. Aktualizace, která selže, se vrátí zpět na kontejner, jaký byl.

Testy prohlížeče to drží k tomuto: kontejner formátu 1.7 s neznámou rolí, polem člena, rozšířením a zvukovým členem ve složce se načte a přežije aktualizaci i repack se vším nedotčeným; kontejner hlavní verze 2 se odmítne.

## Zapisovače {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (zápis, čtení, ověření, aktualizace, repack), používaný nástrojem pro balení a nástrojem pro Tacview.
- Python: `container.py`, asi 140 řádků na standardním `zipfile`, stejný soubor v každém konvertoru
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), takže žádný konvertor nezávisí na jiném. Nový konvertor soubor zkopíruje.
- Prohlížeč čte pomocí
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
