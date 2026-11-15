---
title: "Převodníky si nechají všechno"
parent: "Jak nahrát data"
nav_order: 8
lang: "cs"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Převodníky si nechají všechno

K otevření přehrání tuto stránku nepotřebujete. Je pro lidi, kteří píšou nástroje, jež převádějí herní soubory na tabulky 3DHeat, a pro každého, kdo chce vědět, proč tyto tabulky drží tolik.

Každý nástroj, který převádí přehrání hry, záznam, log nebo živou telemetrii na něco, co prohlížeč otevře, se řídí jedním pravidlem:

> **Převeďte všechno, co zdroj obsahuje a co lze přečíst hned, a zbytek si nechte celý, aby šel přečíst později i bez původního souboru.**

Přehrání se po aktualizaci hry, přeinstalování nebo při plném disku často ztratí a živý přenos zmizí ve chvíli, kdy byl odeslán. To, co převodník zahodí, je ztraceno navždy. To, co si nechá celé, lze dekódovat v den, kdy to někdo pochopí. Převodník proto nikdy nerozhoduje, co bude užitečné. Dekóduje, co umí, každou jinou zprávu, paket, událost, vlastnost nebo řádek nechá nezměněné vedle tabulky a ve svém vlastním výstupu říká, kolik z každého přečetl a kolik jen uchoval.

Tato stránka popisuje úmluvu, kterou sdílejí všechny převodníky: převodníky přehrání War Thunder, World of Tanks, World of Warships a Squad, převodník demo CS2, pozadí sledovače (jeho dekodér přehrání Dota a každý živý adaptér), telemetrické čtečky nástroje pro záznam hry a vlastní importy prohlížeče (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Vlastní čtečky prohlížeče jsou popsány v [Záznamy Tacview](tacview-acmi.md) a [Načítání souborů](loading-files.md); verze v jednom souboru je v [Jeden soubor na zápas](container.md). Jeden zápas se stane tabulkou, souborem `match.json` a přílohami, volitelně zabalenými do jednoho souboru `.3dheat`. README každého nástroje má sekci **Úplnost**, která pro daný zdroj vypisuje, co se přečte, co se nechá v surovém tvaru a co není k dispozici, a proč.

## Tři domovy pro každou položku {#three-homes-for-every-item}

Všechno, co zdroj obsahuje, skončí přesně na jednom ze tří míst:

| Domov | Co tam patří |
|---|---|
| **Dekódováno** | Tabulka (jeden řádek na vzorek nebo událost, sloupce, které prohlížeč čte, a další sloupce pro každou jinou hodnotu, která k řádku patří) a dokument zápasu `<match>.match.json` (vše, co patří k zápasu jako celku: nastavení, soupisky, výsledky, tabulky skóre, samokontrola). |
| **Ponecháno surové** | Příloha vedle tabulky: každá položka, která není dekódovaná nebo je dekódovaná jen zčásti, celá a nezměněná, s typem, časem a jednotkou nebo entitou, ke které patří. |
| **Není k dispozici** | Uvedeno v sekci Úplnost v README s důvodem: formát to nenese (přehrání u klienta nemá vstupy ostatních hráčů), zdroj to nikdy neposílá, nebo její čtení není dovoleno (chráněný proces, šifrovaný blok, jehož klíč není náš k použití). |

Položka, která je **zčásti** dekódovaná, je dekódovaná *a zároveň* ponechaná surová: tabulka dostane to, co je pochopeno, příloha celou položku. Lepší dekodér později tak nebude potřebovat původní soubor.

Čtvrté místo neexistuje. Zahodit něco, protože to vypadalo k ničemu, protože to byla duplicita „asi“, nebo protože to bylo velké, je chyba. Ředění je povoleno jen v tabulce (kamera na 2 Hz místo 60), nikdy v příloze.

## Přílohy {#sidecars}

Příloha je soubor Parquet vedle tabulky, pojmenovaný po ní:

```
<složka>/<match>.parquet              tabulka
<složka>/<match>.match.json           dokument zápasu
<složka>/<match>.<what>.parquet       příloha
```

`<what>` je jedno slovo z tohoto seznamu. Nový převodník vybere slovo, které sedí, nebo přidá nové sem **a** do `SIDECAR_PARQUET` v [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), aby je prohlížeč při načtení celé složky vynechal.

| `<what>` | Obsahuje | Používá |
|---|---|---|
| `messages` | pakety, volání metod entit a aktualizace vlastností síťového proudu, celé | War Thunder, World of Tanks, World of Warships |
| `flight` | záznamy modelu letu jednotlivých letadel, celé | War Thunder |
| `packets` | celé snímky a síťové zprávy, nebo části kontejneru, mimo proud entit | CS2, Dota 2, Squad |
| `events` | herní události se všemi klíči, tak jak je parser podává | CS2 |
| `entities` | aktualizace entit a vlastností, vzdálená volání, otevřené a zavřené kanály, s exporty, které dekodér potřebuje | Squad, Dota 2 |
| `props` | každá vlastnost entity, kterou parser čte, při každé změně | CS2 |
| `units` | stav jednotek mimo tabulku pozic | Dota 2 |
| `combatlog` | bojový záznam, každý zápis se všemi poli | Dota 2 |
| `strings` | každý zápis každé tabulky řetězců | CS2, Dota 2 |
| `objectives` | zóny dobytí a cíle, každá změna s časem | War Thunder |
| `raw` | živý přenos: každý přijatý paket, řádek, dokument API nebo čtení paměti, celé | relace sledovače (`heat.raw.parquet`), záznamníky kol nástroje pro záznam hry (`<stamp>_<game>.raw.parquet`), soubory přehrání osu!, LoL a Valorant ze sledovače |

Prohlížeč při načítání složky přeskočí každé `*.<what>.parquet` z tohoto seznamu a každé `*.match.json`, `*.meta.json`, `*.summary.json` a další přílohy JSON. Když otevřete jednu z nich samostatně, výběrem nebo přetažením jen toho souboru, načte se jako každá jiná tabulka (viz [Načítání souborů](loading-files.md)).

Toto jsou soubory, jak je zapisuje převodník s volbou `--loose`. Ve výchozím nastavení převodníky War Thunder, CS2 a Tacview zabalí tabulku, dokument a přílohy zápasu do jednoho souboru `<match>.3dheat` pod stejnými názvy (viz [Jeden soubor na zápas](container.md)). Všechno tady platí pro každého člena.

### Sloupce {#columns}

Každý řádek přílohy je jedna položka. Sloupce jsou v tomto pořadí, pokud platí:

| Sloupec | Typ | Co |
|---|---|---|
| `time` | float64 | sekundy na stejných hodinách jako `time` tabulky (nebo `tick`, kde zdroj počítá ticky; pak obojí) |
| `type` | řetězec (slovník) | čím položka je, ve vlastních pojmech zdroje: typ paketu, id zprávy, název události, cesta vlastnosti, předpona řádku |
| `name` | řetězec (slovník) | její název, je-li znám (název od komunity, název třídy), jinak prázdný |
| `entity` / `unit` / `uid` / `player` | celé číslo nebo řetězec | komu patří, ve stejných id jako v tabulce, takže řádek přílohy lze připojit ke trase |
| `decoded` | řetězec (JSON) | co se o ní pochopilo, pokud se něco pochopilo; jinak prázdné |
| `payload` | binární | bajty položky, celé a nezměněné (binární zdroje) |
| `text` | řetězec | text položky, celý a nezměněný (textové zdroje: řádek logu, objekt JSON, blok klíč–hodnota) |

Další sloupce jsou povoleny (posun bitu, velikost, kanál). Opakující se řetězce jsou kódované slovníkem a soubor se zapisuje se zstd, takže příloha zůstává jen zlomkem velikosti samotného přehrání.

Příloha musí stačit sama o sobě: dekodér napsaný později čte přílohu, nikdy původní přehrání. Kde se položka bez kontextu nedá pochopit (třída entity, tabulka řetězců, klíč, na který zpráva odkazuje), jde kontext také do přílohy, nebo do dokumentu zápasu.

### Živé zdroje {#live-sources}

Živé adaptéry (telemetrie UDP, sdílená paměť, log hry, lokální API) nemají vůbec žádný soubor, ke kterému by se dalo vrátit. Zaznamenávají **každé pole, které zdroj posílá**, i ta, která zatím nic nepoužívá:

- proud paketů: každý paket celý, `payload` jsou bajty, `type` jeho id nebo formát paketu, v rychlosti, s jakou přichází;
- sdílená paměť nebo dotazované API: každé pole každého čtení, buď jako pojmenované sloupce, nebo celý blok jako `payload`, v rychlosti, kterou adaptér čte;
- log: každý řádek, `text` je řádek, `type` druh řádku, včetně řádků, na které adaptér nereaguje.

Ty jdou do `<session>.raw.parquet` vedle tabulky relace. Velikost je cenou za toto pravidlo; drží ji dolů zstd a kódování slovníkem, ne vynechávání věcí.

## Samokontrola {#the-self-check}

Každý převodník zapíše do svého dokumentu zápasu (nebo do `meta.json` relace, nebo do souhrnu tam, kde žádný dokument zápasu nemá) blok `completeness` pod `selfCheck`:

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
| `seen` | kolik položek tohoto typu zdroj obsahuje |
| `decoded` | přečteno celé do tabulky nebo dokumentu zápasu |
| `partial` | přečteno zčásti do tabulky nebo dokumentu a celé uchováno v příloze |
| `raw` | uchováno celé jen v příloze, nedekódováno |
| `lost` | `seen - decoded - partial - raw`: musí být 0 |

Nejvyšší `lost` je součet. Testy převodníku tvrdí, že je 0 u jejich syntetických vzorků, a README říká, jaké bylo u skutečných. Nenulové `lost` je převodník, který říká, že porušil pravidlo; pojmenuje typ, takže se mezera dá najít.

„Typy“ jsou vlastní typy zdroje: typy paketů, id zpráv, názvy událostí, skupiny vlastností, druhy řádků. Počítají se tam, kde na ně převodník narazí, ne podle seznamu toho, co čeká. Typ, o kterém nikdo nevěděl, se tak objeví se svým počtem a nezmizí.

## Sekce Úplnost v README {#the-readmes-completeness-section}

README každého převodníku má sekci nadepsanou **Úplnost** se třemi seznamy:

- **Přečteno**: co jde do tabulky a dokumentu zápasu a jak byla každá nová položka ověřena proti něčemu nezávislému (vlastní čísla hry, druhý zdroj, záznam pořízený právě k tomu).
- **Ponecháno surové**: co je v které příloze, pod jakým `type`, a co je o tom zatím známo.
- **Není k dispozici**: co zdroj nenese nebo co se nesmí číst, a proč.

Odkazuje zpět sem.

## Kde stojí každý převodník {#where-each-converter-stands}

| Převodník | Přílohy | Jeho sekce Úplnost |
|---|---|---|
| Přehrání War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (počty samokontroly jsou pod `counts`; blok `completeness` přijde) |
| Přehrání World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Přehrání World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demo serverů Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Dema CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Přehrání Dota 2 (sledovač) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Přehrání Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Přehrání osu!, LoL, Valorant (sledovač) | `raw` | jejich stránky v [dokumentaci sledovače](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Živé adaptéry (sledovač) | `raw` | stránka každé hry v [dokumentaci sledovače](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) a [vývoj](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) pro `Session.raw` |
| Záznamníky kol (záznam hry) | `raw` a nerozpoznané bajty uvnitř souboru kola Forza | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Vlastní importy prohlížeče | žádné: viz níže | tato stránka |

### Vlastní importy prohlížeče {#the-viewers-own-imports}

Tacview ACMI, OCAP a formáty GPS se čtou v prohlížeči z vlastního souboru uživatele. Prohlížeč z nich nic neukládá, takže samotný soubor zůstává záznamem. Přesto přečtou, kolik umějí:

- **Tacview ACMI** (`src/data/acmi.ts`): každý řádek objektu s polohou je řádek se všemi vlastnostmi, které záznam nese; každá událost je řádek; každé odstranění je řádek; vlastnosti samotného záznamu (s FileType a FileVersion z hlavičky) jsou na každém řádku jako `RecordingInfo`; řádek komentáře je událost `Comment`, objekt, který nikdy nedostane polohu, je řádek `Unplaced` v referenčním bodě, a U/V jsou sloupce, kdykoli je někdo na řádku má. Řádek vlastnosti bez polohy se přečte zčásti: jeho hodnoty dojdou k dalšímu řádku objektu, ne ke svému vlastnímu času. `AcmiTable.completeness` počítá řádky souboru podle druhu.
- **OCAP** (`src/data/ocap.ts`): každé snímky entit, výstřely, značky, každý druh události (neznámé druhy jako řádky „Mission“ s jejich textem) a vlastní pole dokumentu (`Info`). Zatím nečteno: pole entit a koncové prvky pozice jiné než ty, které jsou v jeho hlavičce (doplňky novějšího záznamníku), a opakované snímky mrtvé jednotky po její smrti (záměrně zředěné: v nich se nic nemění).
- **Formáty GPS** (`src/data/geoTracks.ts`): fixy, jejich čas, výška, kurz a rychlost a tepová frekvence, kadence, výkon, teplota, satelity, HDOP a tlaková výška tam, kde je soubor zaznamenává. Zatím nečteno: jiná rozšíření GPX a KML, věty NMEA jiné než polohové, záznamy IGC jiné než fixy a jejich rozšíření, a zprávy FIT jiné než záznamy (kola, relace, informace o zařízení).

Tyto mezery jsou uvedeny proto, aby se zavřely, a ne aby se omlouvaly. Exporty načteného záznamu v prohlížeči (`src/data/exportRecording.ts`) zapisují jen to, co bylo přečteno.

## Přidání převodníku {#adding-a-converter}

1. Vypište, co formát obsahuje, z jeho dokumentace, z jeho vlastních struktur, nebo spočtením každého typu zprávy ve skutečných vzorcích. Seznam je `types` samokontroly.
2. Dekódujte, co lze hned ověřit. Každé nové pole se ověří proti něčemu nezávislému, než se dostane do tabulky; pole, které se zatím ověřit nedá, zůstane surové.
3. Zbytek nechte celý v příloze pojmenované jak výše, se sloupci výše.
4. Napište blok `completeness` a test, že má `lost` 0.
5. Napište sekci Úplnost v README a odkažte sem.
6. Je-li `<what>` přílohy nové, přidejte ho do tabulky výše a do `SIDECAR_PARQUET` v `src/data/filePick.ts`.

Převodníky jsou čisté (clean-room): píšou se podle formátů, dokumentace a vzorků, nikdy podle kódu GPL nebo AGPL. Vzorky skutečných přehrání zůstávají na počítači, který je vytvořil; testy používají syntetické soubory.
