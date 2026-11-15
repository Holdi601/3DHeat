---
title: "Jeden súbor na zápas (.3dheat)"
parent: "Ako dostať dáta dnu"
nav_order: 9
lang: "sk"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Jeden súbor zápasu: `.3dheat`

Súbor `.3dheat` je jeden celý zápas v jednom súbore, na kopírovanie, uchovanie alebo zdieľanie. Ak ho chcete otvoriť, stačí pustiť súbor do panela Zdroj.

```
match.3dheat   (súbor ZIP)
  manifest      čo zápas je, a zoznam všetkého vnútri
  table         pozície (Parquet)
  match.json    dokument zápasu
  sidecars      čo konvertor nechal celé (udalosti, správy, ...)
```

Skonvertovaný zápas býval niekoľko súborov vedľa seba: tabuľka
`<match>.parquet`, dokument zápasu `<match>.match.json` a pomocné súbory
`<match>.<what>.parquet` ([Konvertory uchovávajú všetko](converters.md)). Súbor
`.3dheat` ich obsahuje všetky v jednom: jedno opakovanie, jeden súbor, na kopírovanie, uchovanie
alebo zdieľanie.

Je navrhnutý tak, aby načítanie tisíc takých súborov bolo rovnako rýchle ako načítanie voľných tabuliek,
a aby ho neskoršie konvertory mohli naplniť oveľa viac dát bez nového formátu.

## Načítanie jedného {#loading-one}

Všade, kde sa načíta súbor alebo priečinok, sa načíta aj súbor `.3dheat`, a priečinok
môže zmiešať kontajnery a voľné súbory:

| Kde | Čo sa z kontajnera číta |
|---|---|
| panel zdroja **Heatmapa** (súbory, priečinok, pretiahnutie) | jeho tabuľky, ako keby boli voľným `<match>.parquet` |
| **Heatmapa → Mnoho zápasov naraz** (Súbory, Priečinok, Pridať priečinok) | jeho tabuľky, čítané na mieste workermi načítavača |
| karta **Zápas** (Načítať, alebo pustiť na pohľad) | dokument zápasu |
| tabuľa **Taktika**, telemetria | jeho tabuľky |

Otvorenie kontajnera prečíta dva malé kúsky: jeho adresár na konci a jeho manifest na začiatku;
z tabuľky sa nečíta nič, kým ju načítavač neprečíta. Pomocné súbory a dokument zápasu sa čítajú
len vtedy, keď ich niečo vyžiada. Priečinok, ktorý drží ten istý zápas dvakrát, voľný aj zbalený, ho načíta raz.

## Balenie a rozbaľovanie {#packing-and-unpacking}

Nové konverzie predvolene zapisujú kontajnery: konvertor War Thunder
(`heat3d-wt-replay`), konvertor CS2 (`heat3d_cs2 demos`) a nástroj Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` ponechá samostatné súbory.

Zápasy skonvertované skôr alebo inými nástrojmi sa zbalia pomocou:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** nájde každú tabuľku `<match>.parquet` v priečinkoch so súbormi, ktoré k nej patria,
  a zapíše `<match>.3dheat` vedľa nich. Zápas, ktorý je už zbalený, sa preskočí. Každý kontajner sa
  pred čímkoľvek iným prečíta späť celý (sha256, veľkosť, CRC a pätička Parquet každého člena);
  voľné súbory sa mažú len s `--delete-loose`, a pri zápase zbalenom skôr len vtedy, keď sú bajt po bajte
  tým, čo kontajner drží. Zápas so súborom zmeneným v posledných `--settle` minútach (štandardne 10)
  sa nechá tak: konvertor do neho možno ešte zapisuje.
- **unpack** zapíše členov späť ako voľné súbory vedľa kontajnera.
- **update** pridá alebo nahradí členov bez prepísania tabuliek, ktoré už sú v kontajneri (nižšie).
- **repack** prepíše kontajner celý a zahodí to, čo za sebou nechali aktualizácie.

## Formát {#the-format}

Súbor `.3dheat` je archív ZIP (otvorí ho ktorýkoľvek nástroj pre ZIP), s týmito pravidlami:

1. **`manifest.json` je prvý člen**, keď sa kontajner zapisuje, a je vždy prítomný. Nájde sa cez
   ústredný adresár ZIP, takže po `update` môže ležať neskôr v súbore.
2. **Členovia, ktorí sa čítajú podľa rozsahu bajtov, alebo sú už komprimovaní, sa ukladajú** (metóda ZIP 0): Parquet, Arrow, obrázky, modely, zvuk, video,
   nepriehľadné bloby. Uložený člen je jeden súvislý rozsah bajtov kontajnera, takže čítač prečíta pätičku tabuľky a jej stĺpcové bloky na mieste,
   cez `File.slice` v prehliadači alebo HTTP požiadavku s rozsahom, presne tak, ako by čítal voľný súbor.
3. **Text sa komprimuje deflate** (metóda 8): JSON, CSV, obyčajný text. Sú malé a čítajú sa celé.
4. Názvy sú UTF-8 (príznak bit 11), relatívne, oddelené `/`, bez `..`; môžu obsahovať priečinky (`analysis/heat.json`). Voľný súbor pri balení
   si ponechá svoj názov, takže rozbalenie vráti tie isté súbory.
5. Členovia väčší ako 4 GiB alebo kontajnery s viac ako 65 535 členmi používajú ZIP64 ako obvykle. Zapisovače nedávajú za členov dátové deskriptory.

Členovia, ktorých konvertory dnes zapisujú, v tomto poradí:

| Úloha | Člen | Uložený |
|---|---|---|
| `table` | `<match>.parquet` | áno |
| `match` | `<match>.match.json` | nie (komprimovaný deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | áno |
| `summary` | `<match>.summary.json`, súhrn hromadného indexu ([Hromadná analýza](mass-analysis.md)), pridaný `tools/3dheat-summarize.mjs` | nie (komprimovaný deflate) |

Tabuľka je hneď za manifestom, takže prvé čítanie začiatku súboru pokryje manifest aj lokálnu hlavičku tabuľky naraz.

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
| `format_version` | `major.minor` (nižšie) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | čo zápas je a čo ho vytvorilo; `null`, keď nie je známe |
| `created`, `updated` | kedy zapísané, kedy naposledy aktualizované (`updated` sa objaví až po aktualizácii) |
| `roles` | každá úloha k názvu jej prvého člena: rýchly index |
| `members` | každý člen okrem manifestu: úplný zoznam, a ten, ktorému čítač dôveruje |
| `matches` | voliteľné: zápasy kontajnera, ktorý drží viac zápasov (nižšie) |
| `references` | voliteľné: súbory, ktoré kontajner potrebuje, ale nedrží |
| `extensions` | voliteľné: vlastné metadáta konvertora |

Každý člen:

| Pole | Význam |
|---|---|
| `name` | jeho cesta v kontajneri |
| `role` | na čo slúži (nižšie) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` alebo `deflate` |
| `bytes` | jeho veľkosť, nekomprimovaná |
| `sha256` | z jeho bajtov, nekomprimovaných |
| `rows` | počet riadkov tabuľky |
| `schema` | konvencia, ktorej sleduje, `{ "id", "version" }`: vlastné `format` a `version` dokumentu (`heat3d-wt-replay-match` 2), `heat3d-table` pre tabuľku, ktorú prehliadač číta podľa jej pätičky `heat3d`, `heat3d-acmi-table` pre tú z nástroja Tacview |
| `match` | v kontajneri viacerých zápasov, `matches[].id`, ku ktorému patrí |

### Pripravené na rast {#made-to-grow}

Formát má niesť oveľa bohatšie opakovania, než má dnes, bez porušenia toho, čo ho číta teraz:

- **Verzovanie.** `format_version` je `major.minor`. Čítač prečíta každú minor verziu svojho major a ignoruje každé pole, ktoré nepozná. Minor
  sa zvýši, keď sa niečo pridá; major len vtedy, keď sa rozloženie zmení tak, že by starší čítač čítal zle (člen už nie je uložený, manifest
  presunutý mimo archívu). Vlastná konvencia každého člena je verzovaná oddelene, v jeho `schema`, takže nová schéma tabuľky alebo nová verzia dokumentu
  nepotrebuje novú verziu kontajnera. Prvé zapísané kontajnery namiesto toho hovorili `"version": 1`; čítače to berú ako 1.0.
- **Úlohy sú otvorené.** Úloha je ľubovoľný reťazec. Čítače používajú úlohy, ktoré poznajú, a ostatné ponechávajú: neznáma úloha sa vypíše,
  nikdy sa neodmietne, a `update` a `repack` ju prenesú nedotknutú. Úloha môže mať mnoho členov: niekoľko tabuliek (stopy jednotiek, telemetria iných frekvencií),
  udalosti, hlas, synchronizácia videa, odkazy na levely, prepisy figúrok, výsledky analýz. Názvy môžu obsahovať priečinky.
- **Akékoľvek médiá.** Člen môže byť čokoľvek s typom média: Parquet, JSON, Arrow, náhľady PNG alebo JPEG, modely glTF, zvuk, surové bloby.
- **Viac zápasov.** Relácia alebo turnaj môže ísť do jedného kontajnera: `matches` ich vymenúva (`{ "id", "map", "mode", "started", ... }`) a každý člen
  pomenuje svoj `match`. Prehliadač načíta každého člena úlohy `table`.
- **Zdroje.** Súbory, ktoré kontajner potrebuje, ale nedrží, napríklad level pre jeden z nich, sú v `references` vymenované názvom a sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), takže správny súbor sa nájde a skontroluje bez kopírovania do každého zápasu.
- **Rozšírenia.** `extensions` drží vlastné metadáta konvertora pod jeho vlastným kľúčom, `"<vendor>/<name>": { ... }`, takže sa dvaja konvertori nikdy nestretnú
  a nič netreba pridávať do spoločných polí.
- **Aktualizácia na mieste.** `update` pridá alebo nahradí členov bez prepísania veľkých uložených tabuliek: nové členy a nový manifest sa pripoja za koniec
  kontajnera, za ním nový ústredný adresár. To, čo bolo nahradené, zostane ako nereferencované bajty až do `repack`. Každý člen a každé pole manifestu, známe
  alebo nie, sa zachová. Neúspešná aktualizácia sa vráti späť na kontajner, aký bol.

Testy prehliadača to držia v tomto rámci: kontajner formátu 1.7 s neznámou úlohou, poľom člena, rozšírením a zvukovým členom
v priečinku sa načíta a prežije aktualizáciu aj repack so všetkým nedotknutým; kontajner major 2 sa odmietne.

## Zapisovače {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (zápis, čítanie, overenie, aktualizácia, repack), používaný nástrojom na balenie a nástrojom Tacview.
- Python: `container.py`, asi 140 riadkov nad štandardným `zipfile`, ten istý súbor v každom konvertore
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), takže žiadny konvertor nezávisí od iného. Nový konvertor ho skopíruje.
- Prehliadač číta pomocou
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
