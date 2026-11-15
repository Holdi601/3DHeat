---
title: "Konvertory zachovajú všetko"
parent: "Ako dostať dáta dnu"
nav_order: 8
lang: "sk"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Konvertory zachovajú všetko

Túto stránku nepotrebujete, aby ste otvorili záznam. Je pre ľudí, ktorí píšu nástroje, ktoré herné súbory premieňajú na tabuľky pre 3DHeat, a pre každého, kto chce vedieť, prečo tieto tabuľky držia toľko.

Každý nástroj, ktorý premieňa záznam, demo, log alebo živú telemetriu hry na niečo, čo prehliadač otvorí, sa riadi jedným pravidlom:

> **Prevediete všetko, čo zdroj drží a dá sa to prečítať už teraz, a zvyšok zachovajte celý, aby sa dal prečítať neskôr bez pôvodného súboru.**

Záznam často zmizne po aktualizácii hry, preinštalovaní alebo plnom disku a živý prúd je preč v momente, keď bol odoslaný. Čo konvertor zahodí, je stratené navždy; čo zachová celé, sa dá dekódovať v deň, keď to niekto pochopí. Konvertor preto nikdy nerozhoduje, čo bude užitočné: dekóduje, čo vie, každú inú správu, paket, udalosť, vlastnosť alebo riadok nechá nezmenený vedľa tabuľky a vo svojom vlastnom výstupe povie, koľko z každého prečítal a koľko len zachoval.

Táto stránka je spoločná konvencia všetkých konvertorov: konvertory záznamov War Thunder, World of Tanks, World of Warships a Squad, konvertor demo súborov CS2, sledovač pozadia (jeho dekodér záznamov Dota a všetky živé adaptéry), čítačky telemetrie nástroja na záznam hry a vlastné importy prehliadača (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Čítačky prehliadača sú opísané v [Nahrávky Tacview](tacview-acmi.md) a [Načítanie súborov](loading-files.md); forma jedného súboru je v [Jeden súbor za zápas](container.md). Jeden zápas sa stane tabuľkou, súborom `match.json` a sprievodnými súbormi, voliteľne zabalenými do jedného súboru `.3dheat`. Každý README nástroja má časť **Completeness**, ktorá pre daný zdroj uvádza, čo sa číta, čo sa zachováva surové a čo nie je k dispozícii, a prečo.

## Tri domovy pre každú položku {#three-homes-for-every-item}

Všetko, čo zdroj drží, skončí presne na jednom z troch miest:

| Domov | Čo sem patrí |
|---|---|
| **Dekódované** | Tabuľka (jeden riadok na vzorku alebo udalosť, stĺpce, ktoré prehliadač číta, a dodatočné stĺpce pre každú inú hodnotu patriacu riadku) a dokument zápasu `<match>.match.json` (všetko, čo patrí zápasu ako celku: nastavenia, súpisky, výsledky, tabuľky skóre, samokontrola). |
| **Zachované surové** | Sprievodný súbor vedľa tabuľky: každá položka, ktorá nie je dekódovaná alebo je dekódovaná len čiastočne, celá a nezmenená, s jej typom, časom a jednotkou alebo entitou, ku ktorej patrí. |
| **Nedostupné** | Pomenované v časti Completeness v README s dôvodom: formát to nenesie (klientsky záznam nemá vstupy ostatných hráčov), zdroj to nikdy neposlal, alebo čítanie nie je povolené (chránený proces, šifrovaný blok, ktorého kľúč nie je náš na použitie). |

Položka, ktorá je **čiastočne** dekódovaná, je dekódovaná *a zároveň* zachovaná surová: tabuľka dostane to, čo sa pochopilo, sprievodný súbor celú položku, takže lepší dekodér neskôr nepotrebuje pôvodný súbor.

Štvrté miesto neexistuje. Zahodiť niečo, lebo to vyzeralo zbytočne, lebo to bola duplicita „asi“, alebo lebo to bolo veľké, je chyba. Zmenšovanie je povolené len v tabuľke (kamera 2 Hz namiesto 60), nikdy v sprievodnom súbore.

## Sprievodné súbory {#sidecars}

Sprievodný súbor je Parquet súbor vedľa tabuľky, pomenovaný podľa nej:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` je jedno slovo z tohto zoznamu. Nový konvertor vyberie slovo, ktoré sedí, alebo pridá nové sem **a** do `SIDECAR_PARQUET` v [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), aby ho prehliadač pri načítaní celého priečinka vynechal.

| `<what>` | Obsahuje | Používa |
|---|---|---|
| `messages` | pakety, volania metód entít a aktualizácie vlastností sieťového toku, celé | War Thunder, World of Tanks, World of Warships |
| `flight` | záznamy modelu letu jednotlivých lietadiel, celé | War Thunder |
| `packets` | celé rámce a sieťové správy, alebo časti kontajnera, mimo toku entít | CS2, Dota 2, Squad |
| `events` | herné udalosti so všetkými kľúčmi, tak ako ich parser podáva | CS2 |
| `entities` | aktualizácie entít a vlastností, vzdialené volania, kanály otvorené a zatvorené, s exportmi, ktoré dekodér potrebuje | Squad, Dota 2 |
| `props` | každá vlastnosť entity, ktorú parser číta, pri každej zmene | CS2 |
| `units` | stav jednotiek mimo tabuľky pozícií | Dota 2 |
| `combatlog` | bojový záznam, každý záznam so všetkými poľami | Dota 2 |
| `strings` | každý záznam každej tabuľky reťazcov | CS2, Dota 2 |
| `objectives` | zóny dobývania a ciele, každá zmena s jej časom | War Thunder |
| `raw` | živý prúd: každý prijatý paket, riadok, dokument API alebo čítanie pamäte, celý | relácie sledovača (`heat.raw.parquet`), záznamníky kôl nástroja na záznam hry (`<stamp>_<game>.raw.parquet`), súbory záznamov osu!, LoL a Valorant sledovača |

Priečinkové načítanie prehliadača preskočí každý `*.<what>.parquet` z tohto zoznamu a každý `*.match.json`, `*.meta.json`, `*.summary.json` a ďalšie JSON sprievodné súbory; keď otvoríte jeden z nich sám, výberom alebo pretiahnutím len toho súboru, načíta sa ako každá iná tabuľka (pozri [Načítanie súborov](loading-files.md)).

Toto sú súbory tak, ako ich konvertor zapíše s `--loose`. Štandardne konvertory War Thunder, CS2 a Tacview zabalia tabuľku, dokument a sprievodné súbory zápasu do jedného súboru `<match>.3dheat` pod rovnakými názvami (pozri [Jeden súbor za zápas](container.md)); všetko tu platí pre každého člena.

### Stĺpce {#columns}

Každý riadok sprievodného súboru je jedna položka. Stĺpce sú v tomto poradí, tie, ktoré sa uplatnia:

| Stĺpec | Typ | Čo |
|---|---|---|
| `time` | float64 | sekundy na rovnakých hodinách ako `time` tabuľky (alebo `tick`, ak zdroj počíta ticky; vtedy obe) |
| `type` | reťazec (slovník) | čo položka je, vo vlastných pojmoch zdroja: typ paketu, id správy, názov udalosti, cesta vlastnosti, predpona riadku |
| `name` | reťazec (slovník) | jej názov, ak je známy (komunitný názov, názov triedy), inak prázdny |
| `entity` / `unit` / `uid` / `player` | celé číslo alebo reťazec | komu patrí, v rovnakých id ako v tabuľke, takže riadok sprievodného súboru sa dá spojiť so stopou |
| `decoded` | reťazec (JSON) | čo sa z nej pochopilo, ak sa niečo pochopilo; inak prázdne |
| `payload` | binárne | bajty položky, celé a nezmenené (binárne zdroje) |
| `text` | reťazec | text položky, celý a nezmenený (textové zdroje: riadok logu, objekt JSON, blok kľúč-hodnota) |

Ďalšie stĺpce sú povolené (posun bitu, veľkosť, kanál). Reťazce, ktoré sa opakujú, sú kódované slovníkom a súbor sa zapisuje so zstd, takže sprievodný súbor je zlomok veľkosti vlastného záznamu.

Sprievodný súbor musí stačiť sám. Dekodér napísaný neskôr číta sprievodný súbor, nikdy pôvodný záznam. Tam, kde sa položka nedá pochopiť bez kontextu (trieda entity, tabuľka reťazcov, kľúč, na ktorý správa odkazuje), kontext ide tiež do sprievodného súboru, alebo do dokumentu zápasu.

### Živé zdroje {#live-sources}

Živé adaptéry (UDP telemetria, zdieľaná pamäť, herný log, lokálne API) nemajú žiadny súbor, ku ktorému by sa dalo vrátiť. **Zaznamenajú každé pole, ktoré zdroj pošle**, aj tie, ktoré zatiaľ nikto nepoužíva:

- prúd paketov: každý paket celý, `payload` sú bajty, `type` jeho id alebo formát paketu, rýchlosťou, akou prichádza;
- zdieľaná pamäť alebo dopytované API: každé pole každého čítania, buď ako pomenované stĺpce, alebo celý blok ako `payload`, rýchlosťou, akou ho adaptér číta;
- log: každý riadok, `text` je riadok, `type` druh riadka, vrátane riadkov, na ktoré adaptér nereaguje.

Tieto sa ukladajú do `<session>.raw.parquet` vedľa tabuľky relácie. Veľkosť je cena pravidla; drží sa nízko vďaka zstd a kódovaniu slovníkom, nie vynechávaním.

## Samokontrola {#the-self-check}

Každý konvertor zapíše do svojho dokumentu zápasu (alebo do `meta.json` relácie, alebo do súhrnu, ak nemá dokument zápasu) blok `completeness` pod `selfCheck`:

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

| Pole | Význam |
|---|---|
| `seen` | koľko položiek tohto typu zdroj drží |
| `decoded` | prečítané celé do tabuľky alebo do dokumentu zápasu |
| `partial` | prečítané čiastočne do tabuľky alebo dokumentu a zachované celé v sprievodnom súbore |
| `raw` | zachované celé len v sprievodnom súbore, nedekódované |
| `lost` | `seen - decoded - partial - raw`: musí byť 0 |

Najvyššie `lost` je súčet. Testy konvertora tvrdia, že je na ich syntetických vzorkách 0, a README uvádza, aké bolo na skutočných. Nenulové `lost` je konvertor, ktorý hovorí, že porušil pravidlo; pomenuje typ, aby sa medzera dala nájsť.

„Typy“ sú zdrojové: typy paketov, id správ, názvy udalostí, skupiny vlastností, druhy riadkov. Počítajú sa tam, kde ich konvertor stretne, nie podľa zoznamu toho, čo očakáva, takže typ, o ktorom nikto nevedel, sa objaví s počtom namiesto toho, aby zmizol.

## Časť Completeness v README {#the-readmes-completeness-section}

README každého konvertora má časť s nadpisom **Completeness** a tromi zoznamami:

- **Read** (prečítané): čo ide do tabuľky a dokumentu zápasu a ako sa každé nové pole overilo voči niečomu nezávislému (vlastným číslam hry, druhému zdroju, nahrávke urobenej na tento účel).
- **Kept raw** (zachované surové): čo je v ktorom sprievodnom súbore, pod akým `type`, a čo sa o tom zatiaľ vie.
- **Not available** (nedostupné): čo zdroj nenesie alebo sa nesmie čítať, a prečo.

Odkazuje späť sem.

## Kde je ktorý konvertor {#where-each-converter-stands}

| Konvertor | Sprievodné súbory | Jeho časť Completeness |
|---|---|---|
| Záznamy War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (počty samokontroly sú pod `counts`; blok `completeness` bude doplnený) |
| Záznamy World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Záznamy World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Dema serverov Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Dema CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Záznamy Dota 2 (sledovač) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Záznamy Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Záznamy osu!, LoL, Valorant (sledovač) | `raw` | ich stránky v [dokumentácii sledovača](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Živé adaptéry (sledovač) | `raw` | stránka každej hry v [dokumentácii sledovača](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) a [vývoj](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) pre `Session.raw` |
| Záznamníky kôl (nástroj na záznam hry) | `raw` a `unparsed` bajty vnútri súboru kola Forza | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Vlastné importy prehliadača | žiadne: pozri nižšie | táto stránka |

### Vlastné importy prehliadača {#the-viewers-own-imports}

Tacview ACMI, OCAP a formáty GPS sa čítajú v prehliadači z vlastného súboru používateľa; prehliadač z nich nič neukladá, takže samotný súbor zostáva záznamom. Aj tak čítajú, koľko vedia:

- **Tacview ACMI** (`src/data/acmi.ts`): každý riadok objektu s pozíciou je riadok so všetkými vlastnosťami, ktoré záznam nesie; každá udalosť je riadok; každé odstránenie je riadok; vlastné vlastnosti záznamu (s FileType a FileVersion z hlavičky) sú na každom riadku ako `RecordingInfo`; riadok komentára je udalosť `Comment`, objekt, ktorý nikdy nedostane pozíciu, je riadok `Unplaced` v referenčnom bode, a U/V sú stĺpce vždy, keď ich má nejaký riadok. Riadok vlastnosti bez pozície sa číta čiastočne: jeho hodnoty sa dostanú k ďalšiemu riadku objektu, nie k svojmu času. `AcmiTable.completeness` spočíta riadky súboru podľa druhu.
- **OCAP** (`src/data/ocap.ts`): každé rámce, výstrely, značky entity, každý druh udalosti (neznáme druhy ako riadky „Mission“ s ich textom) a vlastné polia dokumentu (`Info`). Ešte nečítané: polia entít a koncové prvky pozície okrem tých, ktoré sú uvedené v jeho hlavičke (doplnky novšieho nahrávača), a opakované rámce mŕtvej jednotky po jej smrti (zámerne zredukované: v nich sa nič nemení).
- **Formáty GPS** (`src/data/geoTracks.ts`): fixy, ich čas, výška, smer a rýchlosť, a srdcový tep, kadencia, výkon, teplota, satelity, HDOP a tlaková výška, kde ich súbor zaznamenáva. Ešte nečítané: iné rozšírenia GPX a KML, NMEA vety iné než pozičné, záznamy IGC iné než fixy a ich rozšírenia, a správy FIT iné než záznamy (kolá, relácie, informácie o zariadení).

Tieto medzery sú uvedené preto, aby sa uzavreli, nie aby sa ospravedlnili; exporty načítaného záznamu z prehliadača (`src/data/exportRecording.ts`) zapisujú len to, čo sa prečítalo.

## Pridanie konvertora {#adding-a-converter}

1. Vypíšte, čo formát drží, z jeho dokumentácie, z jeho vlastných štruktúr, alebo spočítaním každého typu správy v skutočných vzorkách. Zoznam je `types` samokontroly.
2. Dekódujte, čo sa dá overiť hneď. Každé nové pole sa overí voči niečomu nezávislému skôr, než sa dostane do tabuľky; pole, ktoré sa zatiaľ overiť nedá, zostane surové.
3. Zvyšok zachovajte celý v sprievodnom súbore pomenovanom, ako je uvedené vyššie, so stĺpcami vyššie.
4. Napíšte blok `completeness` a test, že má `lost` 0.
5. Napíšte časť Completeness v README a odkážte sem.
6. Ak je `<what>` sprievodného súboru nové, pridajte ho do tabuľky vyššie a do `SIDECAR_PARQUET` v `src/data/filePick.ts`.

Konvertory sa píšu čistým postupom (clean-room): píšu sa z formátov, dokumentácie a vzoriek, nikdy z kódu GPL alebo AGPL. Vzorky skutočných záznamov zostávajú na stroji, ktorý ich vytvoril; testy používajú syntetické súbory.
