---
title: "Jazyky"
nav_order: 17
lang: "cs"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Jazyky

Prohlížeč umí mluvit vaším jazykem: každé tlačítko, nápověda a zpráva a každá věta analýzy závodu a zápasu se zobrazí v jazyce, který vyberete. Zná 40 jazyků a začne v jazyce vašeho prohlížeče, pokud ho zná.

Jsou tu všechny úřední jazyky Evropy (24 jazyků EU, a k nim norština, islandština, ukrajinština, ruština, běloruština, srbština, bosenština, makedonština, albánština, turečtina, lucemburština a katalánština), a navíc japonština, korejština a čínština zjednodušená i tradiční. Úplný seznam: [Seznam jazyků](ref-languages.md).

Angličtina je zdroj, ze kterého se překládá všechno ostatní, a na ni se vrátí zpráva, která v jiném jazyce chybí.

## Změna jazyka {#change-the-language}

1. Otevřete rozbalovací seznam vedle názvu nahoře v postranním panelu. Jeho první položka je **Automaticky - <jazyk>** (jazyk prohlížeče, jak byl zjištěn teď); potom každý jazyk svým vlastním názvem, takže najdete svůj i tehdy, když neumíte číst ten, který je zobrazen.
2. Vyberte jeden. Přepne se hned a zapamatuje se v tomto prohlížeči. Vyberte *Automaticky*, aby se volba zapomněla.

V soukromém okně nebo když je úložiště zablokované, volba vydrží jen do zavření stránky.

Co přepnutí udělá:

- každý popisek, nápověda a zpráva se vykreslí znovu v novém jazyce;
- analýza závodu se **spočítá znovu** v něm (její věty se skládají z měření, nepřekládají se až potom), demo kola se přejmenují a grafy se překreslí;
- čísla, seznamy a množná čísla se řídí novým jazykem.

## Jaký jazyk se použije na začátku {#which-language-it-starts-in}

1. Jazyk **zvolený** v tomto prohlížeči, pokud nějaký je (uložený v `localStorage` pod klíčem `heat3d.language`).
2. Jinak **jazyk prohlížeče**: první z `navigator.languages`, kterému prohlížeč rozumí. Značka se páruje podle jazykové části (`de-AT` → `de`), s těmito aliasy: `nb` a `nn` → norština (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` a každá značka se skriptem `Hant` → tradiční čínština; `zh-Hans`, `zh-CN`, `zh-SG` a další `zh` → zjednodušená čínština; `cnr` (černohorština) → srbština.
3. Jinak **angličtina**.

Atribut `<html lang>` stránky se nastaví na mluvený jazyk.

## Čísla, seznamy a množná čísla {#numbers-lists-and-plurals}

Čísla, seznamy a množná čísla v textu prohlížeče se píšou způsobem daného jazyka („3.5“ nebo „3,5“, „a, b a c“). Popisky delší než v angličtině se zalomí, v místech, kde jazyk dovolí, se dělí spojovníkem, místo aby vyčnívaly z postranního panelu. Příliš dlouhé názvy řádků v grafech se zkrátí a celé se ukážou při najetí myší.

Čísla, která napíšete do pole, mohou mít tečku i čárku.

## Pro překladatele a vývojáře {#for-translators-and-developers}

Kód: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Jak se píšou čísla, seznamy a množná čísla {#how-numbers-lists-and-plurals-are-written}

- **Čísla** s desetinnými místy (`num`) používají desetinný znak daného jazyka a **žádné seskupování číslic** – vzdálenost 3108 m zůstane v každém jazyce jedním číslem.
- **Celá čísla, která jsou počty nebo velikosti** (`int`) používají seskupování číslic daného jazyka.
- **Seznamy** (`list`) se spojují způsobem daného jazyka: „a, b a c“, „a, b nebo c“, nebo jeden za druhým s vlastním oddělovačem jazyka (zpráva `common.listSeparator`: „, “ v angličtině, „、“ v japonštině a v obou čínštinách).
- **Množná čísla** se řídí pravidly daného jazyka přes `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Locale předané `Intl` je značka jazyka, kromě případů, kdy by samotná značka dala pravidla jiné země: portugalština je `pt-PT` (brazilské množné číslo počítá 0 jako jedno), norština `nb`, zjednodušená čínština `zh-CN`, tradiční `zh-TW`.

### Katalogy zpráv {#the-catalogs}

`src/i18n/locales/<jazyk>/<část>.json`, jeden soubor na každou část prohlížeče, stejné části v každém jazyce.

Existuje jeden soubor pro každou část prohlížeče (dnes 30, například `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`) a každý jazyk má stejnou sadu. Složka je všechny vypisuje.

Každý soubor je plochý objekt JSON: klíč celý (`"race.ui.laps.load"`), zpráva jako hodnota. Angličtina je sbalená s prohlížečem; každý jiný jazyk se stáhne, až když je vybrán.

**Hledání:** zpráva aktuálního jazyka, jinak anglická, jinak samotný klíč (ve vývoji konzole hlásí „i18n: no message …“). Zpráva, která se nedá naformátovat, spadne na anglickou, takže rozbitý překlad nikdy nerozbije prohlížeč.

#### Syntaxe zpráv {#the-message-syntax}

Část syntaxe ICU zpráv, kterou prohlížeč používá:

| Tvar | Příklad | Význam |
|---|---|---|
| `{name}` | `{file} has no rows` | hodnota vložená tak, jak je |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | větev pro číslo podle pravidel množného čísla daného jazyka, nebo přesné `=0`, `=1` …; `#` je číslo napsané způsobem daného jazyka |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | větev pro slovo |

Větve se mohou vnořovat a každé `plural` a `select` musí mít větev `other`. Na rozdíl od plného ICU je **apostrof jen apostrofem** – názvy aut a anglické přivlastňovací tvary jich jsou plné – takže nic nemusí být v uvozovkách. Doslovné `{` nebo `}` se napsat nedá.

Zprávy s hodnotami, které překlad musí zachovat: jména ve složených závorkách doplní kód; slova v `select` jsou to, podle čeho kód vybírá (`crash`, `onto-straight`, `yes`/`none`), a musí zůstat jako v angličtině; kategorie množného čísla se mohou lišit (jazyk používá vlastní: polština `one`, `few`, `many`, `other`; japonština jen `other`).

### Jak vznikly překlady a testy {#how-the-translations-were-made-and-the-tests}

Překlady vznikly pomocí AI modelu z angličtiny, s glosářem závodnických termínů, a texty závodů se přečetly ještě jednou s doplněnými hodnotami. Opravy od rodilých mluvčích jsou vítané (níže).

`src/i18n/i18n.test.ts` kontroluje:

- že každá zpráva, kterou kód žádá, existuje v angličtině – každé volání `t('…')` a každý klíč uložený v tabulce a předaný `t()` později (klíče začínající názvem části, například `app.` nebo `heat.`);
- že zprávy, které kód skládá z částí, existují: každé `label`, `short`, `count` a `here` u chyb, každá vlastnost porovnání aut, každý popisek kanálu grafu;
- že se každá zpráva **dá rozebrat** v každém jazyce;
- že každý překlad **zachovává hodnoty a volby anglické zprávy** (žádná hodnota nepřibyde ani nezmizí; každý `select` si zachová svá slova);
- že každý jazyk má **všechny** anglické zprávy a že množina přeložených jazyků je přesně seznam výše;
- že se zpráva řekne v nastaveném jazyce a při chybě spadne na angličtinu.

### Oprava překladu {#correcting-a-translation}

Opravy od rodilého mluvčího jsou vítané – každá je jeden řádek JSON.

1. Najděte zprávu: vyhledejte text, který vidíte v angličtině, v anglických katalozích (`src/i18n/locales/en/`) (přepněte výběr na angličtinu, abyste ho viděli), a poznamenejte si její klíč.
2. Otevřete stejnou část ve vašem jazyce, například `src/i18n/locales/de/race-ui.json`, a změňte hodnotu toho klíče. Každé `{name}` nechte, slova v `select` nechte, napište větve množného čísla, které váš jazyk potřebuje:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Spusťte `npm test` (nebo jen `npx vitest run src/i18n`): testy řeknou, jestli hodnota nebo volba chybí, nebo jestli zpráva přestala jít rozebrat.
4. Když běží vývojový server, změna se ukáže po přepnutí jazyka (nebo po znovunačtení).

**Přidání zprávy** (v kódu): přidejte ji nejdřív do anglické části, potom do každého dalšího jazyka (testy selžou, dokud ji každý nebude mít).

**Přidání jazyka**: přidejte ho do `LANGUAGES` v `languages.ts` (jeho značka BCP 47 a vlastní název, a alias nebo locale `Intl`, pokud je potřeba), a složku `src/i18n/locales/<značka>/` se všemi částmi.
