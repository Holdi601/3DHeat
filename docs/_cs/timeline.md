---
title: "Časová osa a přehrávání"
nav_order: 5
lang: "cs"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Časová osa a přehrávání

Lišta pod obrázkem funguje jako videopřehrávač: data můžete přehrát jako film, pozastavit, přeskakovat a měnit rychlost.

![Lišta časové osy: 1 Vše/Přehrát, 2 tlačítka přehrávání, 3 hodiny, 4 Rychlost, 5 Historie, s Okno a Úsekem 30 s](../assets/img/en/timeline-bar.webp)

Lišta pod pohledem je časová osa ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Určuje, které řádky jsou v daný okamžik vidět. Potřebuje sloupec času; bez něj je celá lišta vypnutá, pohled zůstane v režimu **Vše** a postranní panel říká *V těchto datech není sloupec času - časová osa je vypnutá a každý datový bod se ukáže najednou.*

## Vše a Přehrát {#all-and-play}

Dva hlavní režimy, protože odpovídají na různé otázky.

- **Vše** (výchozí při každém načtení) ignoruje hlavu přehrávání úplně a ukáže každý řádek, který projde filtry. Je to pohled „kde se to děje“ a není totéž co přetáčení na konec. Posuvník je vypnutý a hodiny ukazují `vše · <span> dat`.
- **Přehrát** pustí data jako časosběrný film. Objeví se posuvník, ovládání přehrávání a nastavení historie.

Výběr **Vše** také zastaví přehrávání.

## Ovládání {#the-controls}

| Ovládání | Výchozí | Význam |
|---|---|---|
| Posuvník | začátek | Hlava přehrávání. Tažením přeskakujete; 20 000 kroků přes celý rozsah. |
| **Vše** / **Přehrát** | Vše | Viz výše. |
| ▶ / ❚❚ | pozastaveno | Spustit nebo pozastavit; také `K`. |
| ◀ **Přehrát zpět (J)** | | Pustí data pozpátku. Zobrazuje se jen v režimu **Překryv figur**; stejná klávesa `J` funguje i tam (viz [Klávesnice](#keyboard)). |
| ⏮ | | Zpět na začátek rozsahu. |
| Hodiny | | `uplynulo / celkem` jako `mm:ss.s` (nebo `h:mm:ss`) a, když je sloupec času absolutní časové razítko, také tečný čas hlavy přehrávání jako `HH:MM:SSZ` (UTC). |
| **Rychlost** | 1× | Sekundy datové sady za reálnou sekundu. Nabídka má 17 kroků od 0,01× do 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), plus **Vlastní…**: napište libovolnou rychlost od 0,001× do 3600× (například 0,3 nebo 12) a stiskněte Enter; Esc ponechá aktuální rychlost. Poslední rychlost se pamatuje pro příští návštěvu (viz [Uložená nastavení](ref-settings-storage.md)). |
| **Historie** | Kumulativně | Co se v hlavě přehrávání počítá jako viditelné: *Kumulativně*, *Okno* nebo *Životnost* (níže). |
| **Úsek** (Okno; v režimu Čáry také Životnost) | 30 s | Délka okna končícího v hlavě přehrávání; nejméně 0,01 s. V [Čárovém teple](line-heat.md#playback) je to délka ocasu. |
| **Záložní životnost** (jen Životnost, ne v režimu Čáry) | 10 s | Jak dlouho zůstává viditelný datový bod, který nemá další vzorek své osoby. |
| **Mizení** (jen Životnost, ne v režimu Čáry) | 0,4 | Podíl životnosti každého datového bodu, během kterého mizí, 0-1. |
| **Smyčka** | zapnuto | Na konci začít znovu; vypnuto se na konci zastaví. |
| Pravá strana | | Název datové sady. |

**Rozsah** je časový úsek datové sady - nebo, v [překryvu figur](box-replay.md) s vybranou relací, úsek této relace.

## Historie {#history}

V režimu Přehrát:

- **Kumulativně** - všechno od začátku rozsahu až po hlavu přehrávání. Teplo se buduje, jak to hraje.
- **Okno** - pevný úsek historie končící v hlavě přehrávání (*Úsek*).
- **Životnost** - každý datový bod žije, dokud nepřijde **další vzorek téže osoby** (ve stejné relaci), takže přesně jedna pozice na osobu je v každém okamžiku aktuální. Datový bod, jehož osoba se už neobjeví - smrt, odpojení, konec záznamu - nemá další vzorek a žije po dobu *Záložní životnosti*, místo aby okamžitě zmizel nebo přetrval navždy. Datové body **mizí** během posledního podílu *Mizení* ze své životnosti, místo aby jen skočily pryč: když je živý jeden vzorek na osobu, datový bod, který mezi dvěma snímky zmizí, způsobí blikání celého pole rychlostí vzorkování. *Mizení* 0 obnoví tvrdý střih.

Životnost potřebuje sloupec osoby i sloupec času; bez něj se historie při načtení vrátí na Kumulativně. V [Čárovém teple](line-heat.md#playback) historie určuje, jak dlouho zůstává viditelný ocas trasy; v [překryvu figur](box-replay.md) je *Záložní životnost* doba, po kterou se drží osoba bez dalších vzorků.

## Chování přehrávání {#playback-behaviour}

Ze smyčky snímků ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- Hlava přehrávání postupuje o *čas snímku × rychlost*. Čas snímku je omezen na 0,1 s, takže přepnutí karty hlavu neteleportuje.
- Stisk přehrávání na úplném konci rozsahu začne od začátku, jako v mediálním přehrávači. Při každém načtení je hlava zaparkována na začátku, takže první stisk přehrávání spustí přehrávání.
- Na konci rozsahu hlava skočí zpět na začátek (Smyčka zapnuta), nebo se tam zastaví a přehrávání skončí (Smyčka vypnuta).
- Posuvník čte hlavu přehrávání přímo z enginu v každém snímku; stav aplikace se aktualizuje při přeskocích, startech, zastaveních a smyčkách.
- Výběr relace v výběru relací přeskočí na začátek té relace.

## Proč je přehrávání plynulé a levné {#why-playback-is-smooth-and-cheap}

Řádky se ukládají seřazené podle času, takže časové okno jsou dvě binární vyhledávání nad sloupcem času: posun hlavy přehrávání posune dvě celá čísla a nedotkne se žádného řádku; cena přehrávání závisí na počtu řádků v okně, ne na velikosti datové sady.

Jak se teplo drží stabilní, zatímco se okno pohybuje, závisí na historii ([Akumulace](accumulation.md)):

- **Kumulativně** jen roste, takže každý snímek přidá jen řádky, které se od posledního staly viditelnými, s plnou vahou. Pole se buduje monotónně a pozastavení nic nemění, protože už nezbývá nic, co by přišlo. (Přepočítávání by způsobilo, že každý snímek osvětlí jinou náhodnou podmnožinu a pak ji vyblednout, což vypadá jako záblesky, které se rozsvítí a zmizí.)
- **Okno** a **Životnost** se opravdu mění v každém snímku a přepočítávají se, míšené jako exponenciální klouzavý průměr (váha 0,34 pro nový snímek), což je v ustáleném stavu nezkreslené a mnohem klidnější než začínat znovu.
- V režimu Životnost jsou kandidátní řádky ty od *hlavy přehrávání - max(nejdelší mezera v datech, Záložní životnost)* až po hlavu přehrávání; shader pak zahodí každý řádek, jehož vlastní životnost skončila, a aplikuje mizení.

Přepnutí mezi Vše a Přehrát nebo změna historie restartuje akumulaci.

## Klávesnice {#keyboard}

| Klávesa | Účinek |
|---|---|
| `K` | Přehrát / pozastavit |
| `J` | Přehrát pozpátku; dalším stiskem se pozastaví (jen Překryv figur) |
| `L` | Přehrát dopředu; dalším stiskem se pozastaví (jen Překryv figur) |

`J` a `L` také přepnou časovou osu na **Přehrát**. Klávesy se ignorují, když má fokus textové pole nebo nabídka. Na kartě Analýza závodu `K` ovládá vlastní přehrávání té karty.
