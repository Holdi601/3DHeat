---
title: "Mapování sloupců"
parent: "Jak nahrát data"
nav_order: 2
lang: "cs"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Mapování sloupců

Soubor je tabulka a 3DHeat musí vědět, který sloupec drží pozici ve směru východ–západ, který čas, který jméno hráče a tak dál. Tento panel říká, co odhadl, a tady opravíte špatný odhad.

![Panel Mapování sloupců po načtení souboru Parquet: každé pole už vyplněno – 1 X, 2 Y, 3 Z, 4 Čas, 5 ID osoby, 6 Relace / zápas, 7 Tým / skupina](../assets/img/en/column-mapping-panel.webp)

*Soubor pojmenoval své sloupce sám, takže je každé pole už vyplněno.*

Například CSV s hlavičkou `x,y,z,t,player,team` se namapuje samo: x, y a z se stanou pozicí, `t` časem, `player` [osobou](glossary.md) a `team` [skupinou](glossary.md).

Po výběru souborů se pod panelem Zdroj otevře panel **Mapování sloupců**. Říká, která role připadá kterému sloupci. Vyplní se automaticky a každé pole se dá před stisknutím **Načíst** změnit; mapování se čte při načítání, takže změna po něm znamená načíst znovu.

## Pole {#the-fields}

Všechny nabídky sloupců vypisují každý sloupec prvního souboru, plus *- žádný -*.

| Pole | Role | Poznámky |
|---|---|---|
| **Oddělovač** | jen CSV: oddělovač polí. | Nabídka: *Čárka ,*, *Středník ;*, *Tabulátor*, *Svislítko \|*, *Mezera*; nebo napište libovolný jeden znak do *nebo napište jeden znak*. Zjistí se automaticky (viz níže). Změna spustí automatické mapování znovu, takže úpravy provedené dříve se ztratí. |
| **X**, **Y**, **Z** | Pozice. | Potřebné jsou aspoň dvě; nenamapovaná třetí osa je 0 (data leží v rovině). Stejný sloupec na dvou osách je chyba. |
| **Svislá osa ve zdroji** | Která osa zdroje ukazuje nahoru. | *Z je nahoru (většina herních enginů)* nebo *Y je nahoru (grafická konvence)*. Viz [Osy, jednotky a čas](axes-units-and-time.md). |
| **Měřítko jednotek** | Násobí každou pozici. | Tlačítka *1 (m)* a *0,01 (cm→m)*, nebo napište hodnotu. |
| **Převrátit X / Převrátit Y / Převrátit Z** | Obrátí znaménko osy zdroje. | Použije se na pozice a na vektory směru pohledu. |
| **Čas** | Časová osa. | Volitelné. Bez něj není časová osa. |
| **Jednotka času** | Jak číst sloupec času. | Sedm jednotek; viz [Osy, jednotky a čas](axes-units-and-time.md#time). U sloupců Parquet `TIMESTAMP`/`DATE` se ignoruje, což panel říká. |
| **ID osoby** | Kdo nebo co řádek patří. | Volitelné. Umožňuje stopy, životnosti, boxové přehrávání a čárové teplo. |
| **Relace / zápas** | Který zápas, nájezd, kolo, jízda nebo okruh řádek patří. | Volitelné. Pozice se nikdy neinterpolují, neoznačují stopou ani nespojují do trasy přes změnu relace. Viz [Relace, osoby a skupiny](sessions-persons-groups.md). |
| **Tým / skupina** | Libovolný sloupec s malým počtem hodnot. | Volitelné. Řídí barvy skupin, teplo týmů a rozdílové rozdělení podle skupiny. |
| **Směr pohledu** | *Žádný*, *Sloupce stáčení / sklonu* nebo *Sloupce vektoru směru*. | Se stáčením/sklonem: **Stáčení**, **Sklon** a **Jednotka úhlu** (*Stupně* / *Radiány*). S vektorem: **Směr X**, **Směr Y**, **Směr Z**. Používá se pro paprsky pohledu [boxového přehrávání](box-replay.md). |
| **Zachovat pro filtrování** | Další sloupce držené v paměti. | Zaškrtávací políčko u každého sloupce a pro každý zaškrtnutý buď *rozsah* (číselný), nebo *kategorie*. Každý stojí 4 bajty na řádek a průchod dekódováním při načtení. Jen zachované sloupce lze [filtrovat](filters.md), použít pro [rozdílové rozdělení](difference.md) nebo jako sloupec událostí [čárového tepla](line-heat.md). |
| **Zobrazit ukázkové řádky** | Tabulka prvních 12 vzorkovaných řádků, všechny sloupce. | Pro kontrolu odhadů. |

Zaškrtnutý sloupec filtru, který není nastaven výslovně, se čte jako *rozsah*; sloupec id, který vypadá jako číslo, bývá užitečnější jako *kategorie*. Najednou mohou být aktivní jen 4 filtry ([Filtry](filters.md)).

## Jak automatické mapování odhaduje {#how-the-auto-mapping-guesses}

Odhadování je v [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Dívá se na názvy sloupců, na to, které sloupce jsou ve vzorkovaných řádcích číselné (více než 90 % neprázdných hodnot se dá přečíst jako čísla), na to, kolik různých hodnot každý sloupec ve vzorku nabývá, a na logické typy Parquetu. Vzory názvů se zkoušejí postupně, bez ohledu na velikost písmen, a vyhraje první vzor, který sedí na nějaký ještě volný sloupec.

### Pozice {#position}

| Osa | Vzory názvů v pořadí (jen číselné sloupce) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Když je osa stále prázdná, vyplní ji v pořadí první volné číselné sloupce (ignorují se `filename`, `level`, `year`, `month`, `day`, `hour`, `location`). Špatný odhad je na obrazovce vidět hned; prázdný by nechal prázdný výhled.

### Čas {#time}

- **Nejdřív sloupce časového razítka Parquetu.** Mezi sloupci, jejichž logický typ je `TIMESTAMP` nebo `DATE`, se nejlepší vybere podle skóre: +10 000, pokud název sedí na vzor času, −5 000 u prostého `DATE`, plus počet různých hodnot ve vzorku. Celodenní datum a konstantní začátek relace mají skoro žádné různé hodnoty, takže vyhraje okamžik události. Jednotka je pak *Unixové časové razítko (ms)*.
- **Jinak podle názvu:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, pak názvy uplynulého času (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Jednotka se pak odhadne z hodnot: ISO-8601, když hodnota vypadá jako `RRRR-MM-DDT…` nebo `RRRR-MM-DD …`; jinak podle největší velikosti: nad 10^17 nanosekund, nad 10^14 mikrosekund, nad 10^11 Unixových milisekund, nad 10^8 Unixových sekund, nad 10^6 milisekund, jinak sekundy.

Když se vybere sloupec uplynulého času, panel upozorní, že každá relace je pak zarovnaná na svůj vlastní začátek – dobré pro překrývání zápasů, ne pro jejich zobrazení v reálném pořadí.

### Relace, osoba, skupina {#session-person-group}

Relace se obsadí **po** časové ose a **před** osobou a skupinou, protože sloupec relace bývá často časové razítko (okamžik začátku zápasu na každém řádku zápasu).

| Role | Vzory názvů v pořadí |
|---|---|
| Relace | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (každý přesně, volitelně s `_id`) |
| Osoba | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, pak `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (závodní data: pohybuje se auto) |
| Skupina | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Skupina, záložní | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Kandidát na skupinu, který na většině vzorkovaných řádků nabývá různé hodnoty (více než max(48; 60 % vzorku)), je id, ne skupina: stane se sloupcem osoby, pokud žádný nebyl nalezen, a jako skupina se nepoužije. Když se vůbec nenašel žádný sloupec skupiny, použije se nečíselný sloupec s nejmenším počtem různých hodnot mezi 2 a 12.

### Směr pohledu {#look-direction}

Číselný sloupec se názvem `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` nebo `rot_z` / `rotation_z` přepne směr pohledu na stáčení/sklon; sklon se hledá jako `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Předpokládají se stupně, když některé vzorkované stáčení přesáhne 7 v absolutní hodnotě, jinak radiány. Vektor směru se nikdy neodhaduje; přijde z nápověd níže, nebo od vás.

### Sloupce filtru {#filter-columns}

Automaticky se zachová nejvýš **6** sloupců, seřazených:

1. `region`, `sessionMode`, `actor` – sloupce, které existují proto, aby se podle nich filtrovalo (skóre 1200);
2. sloupce kategorie, které se ve vzorku mění, s menším počtem různých hodnot napřed (1000 mínus počet);
3. sloupec, který je ve vzorku konstantní, ale jen když se načítá více souborů – může se lišit mezi soubory, například oblast nebo id testovacího běhu (600);
4. číselné sloupce (500).

Sloupce, které už hrají nějakou roli, výše uvedené šumové názvy, sloupce konstantní při načtení jednoho souboru a volnotextové sloupce (více než max(16; polovina vzorku) různých hodnot) se automaticky nenabízejí. Jakýkoli sloupec lze přesto zaškrtnout ručně.

### Svislá osa {#up-axis}

Když jsou namapované všechny tři osy, bere se jako nahoru ta osa, jejíž rozptyl Y a Z ve vzorku je menší (mapa je mnohem širší než vysoká); jinak se předpokládá Z nahoru.

## Nápovědy `heat3d` v patičce Parquetu {#the-heat3d-hints-in-a-parquet-footer}

Soubor Parquet může říct, jak se má číst. Když má metadata patičky souboru položku s klíčem **`heat3d`**, její hodnota se přečte jako JSON a položí se přes odhady ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Konvertor demo záznamů CS2 takovou položku zapisuje, takže jeho tabulky se otevřou s hráčem jako osobou, stranou jako skupinou, každým kolem jako relací, zapnutým směrem pohledu a světem ve správném natočení.

Nápovědy se čtou jen z **prvního** souboru výběru. Každá položka je volitelná a každá nápovědou určená hodnota se stále objeví v panelu a dá se změnit. Úplný popis schématu s příkladem a jak ho zapsat je v [Referenci formátů dat](data-formats.md#the-heat3d-hints).

Pravidla stručně:

- Sloupec pojmenovaný nápovědou se použije jen tehdy, když ho soubor má.
- `lookMode: "vector"` platí jen tehdy, když jsou nastaveny všechny `dirX`, `dirY` a `dirZ`; `"yawPitch"` jen když je nastaveno `yaw`.
- `extra`, je-li přítomno, nahradí automatický seznam filtrů (neznámé názvy a sloupce, které už hrají roli, se zahodí); typ rozsah/kategorie každého se řídí tím, zda vypadal jako číselný. Když chybí, automatický seznam se ponechá bez sloupců, kterým nápověda přidělila roli.
- `axes.up` musí být `"y"` nebo `"z"`, převrácení musí být logické hodnoty, `scale` musí být kladné.
- `entity.size`, je-li kladné, je velikost jedné sledované věci v jednotkách souboru ([velikost entity](sessions-persons-groups.md#entity-size)); je to jediný způsob, jak ji nastavit.

## Známá chyba: přepsání oddělovače CSV {#known-issue-overriding-the-csv-separator}

Když změníte oddělovač na jiný, než byl zjištěn, seznam sloupců a ukázkové řádky se nezmění (náhled se dál dělí podle zjištěného oddělovače). Zvolený oddělovač se přesto použije pro samotné načtení. Když je zjištěný oddělovač špatně:

1. Otevřete soubor v textovém editoru.
2. Nahraďte oddělovač čárkou všude (a desetinné čárky tečkami).
3. Uložte a soubor načtěte znovu.

Příčina je v [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
