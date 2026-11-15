---
title: "Jazyky"
nav_order: 17
lang: "sk"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Jazyky

Prehliadač vie hovoriť vašim jazykom: každé tlačidlo, nápoveda a správa a každá veta analýzy pretekov a zápasov sa zobrazuje v jazyku, ktorý vyberiete. Pozná 40 jazykov a začína v jazyku vášho prehliadača, ak ho má.

Sú tu všetky štátne jazyky Európy (24 jazykov EÚ a nórčina, islandčina, ukrajinčina, ruština, bieloruština, srbčina, bosniančina, macedónčina, albánčina, turečtina, luxembuižtina a katalánčina), a japončina, kórejčina a čínština zjednodušená aj tradičná. Úplný zoznam: [Zoznam jazykov](ref-languages.md).

Angličtina je zdroj, z ktorého sa prekladá všetko ostatné, a je to to, čo sa zobrazí namiesto chýbajúcej správy.

## Zmena jazyka {#change-the-language}

1. Otvorte rozbaľovací zoznam vedľa názvu v hornej časti bočného panela. Jeho prvá položka je **Automaticky - <jazyk>** (jazyk prehliadača, ako sa zistil teraz); potom každý jazyk jeho vlastným názvom, aby ste našli svoj, aj keď neviete čítať ten zobrazený.
2. Vyberte jeden. Prepne sa hneď a uloží sa v tomto prehliadači. Vyberte *Automaticky*, ak chcete voľbu zabudnúť.

V súkromnom okne alebo keď je úložisko zablokované, voľba platí, kým sa stránka nezavrie.

Čo prepnutie urobí:

- každý popis, nápoveda a správa sa vykreslí znova v novom jazyku;
- analýza pretekov sa **vypočíta znova** v tomto jazyku (jej vety sa skladajú
  z meraní, nie sa prekladajú dodatočne), demonštračné kolá dostanú nové
  názvy a grafy sa prekreslia;
- čísla, zoznamy a množné číslo sa riadia novým jazykom.

## V akom jazyku sa spustí {#which-language-it-starts-in}

1. **Vybraný** jazyk v tomto prehliadači, ak nejaký je (uložený v `localStorage`
   pod kľúčom `heat3d.language`).
2. Inak jazyk **prehliadača**: prvý z `navigator.languages`, ktorý prehliadač
   ovláda. Značka sa páruje podľa jazykovej časti (`de-AT` → `de`), s týmito
   aliasmi: `nb` a `nn` → nórčina (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant`
   a každá značka so skriptom `Hant` → tradičná čínština; `zh-Hans`, `zh-CN`,
   `zh-SG` a ostatné `zh` → zjednodušená čínština; `cnr` (čierna hora) →
   srbčina.
3. Inak **angličtina**.

Atribút `<html lang>` stránky sa nastaví na používaný jazyk.

## Čísla, zoznamy a množné číslo {#numbers-lists-and-plurals}

Čísla, zoznamy a množné číslo v texte prehliadača sa píšu spôsobom daného jazyka ("3.5" alebo "3,5", "a, b a c"). Popisky dlhšie než v angličtine sa zalomia, kde to jazyk dovoľuje cez spojovník, namiesto toho, aby vyšli z bočného panela. Príliš dlhé názvy riadkov v grafoch sa skrátia trojbodkou a na úplný text stačí podržať kurzor.

Čísla, ktoré napíšete do poľa, môžu používať bodku aj čiarku.

## Pre prekladateľov a vývojárov {#for-translators-and-developers}

Kód: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Ako sa píšu čísla, zoznamy a množné číslo {#how-numbers-lists-and-plurals-are-written}

- **Čísla** s desatinnými miestami (`num`) používajú desatinný znak jazyka a
  **žiadne oddeľovanie tisícov** – vzdialenosť 3108 m zostane jedným číslom
  v každom jazyku.
- **Celé čísla, ktoré sú počtami alebo veľkosťami** (`int`) používajú
  oddeľovanie číslic daného jazyka.
- **Zoznamy** (`list`) sa spájajú spôsobom daného jazyka: "a, b a c", "a, b alebo
  c", alebo jeden za druhým s vlastným oddeľovačom jazyka (správa
  `common.listSeparator`: ", " v angličtine, "、" v japončine a v oboch čínštinách).
- **Množné číslo** sa riadi pravidlami daného jazyka cez `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- Locale, ktorú sa pýta `Intl`, je značka jazyka, okrem prípadov, keď by samotná
  značka dala pravidlá inej krajiny: portugalčina je `pt-PT` (brazílske pravidlo
  počíta 0 ako jedno), nórčina `nb`, zjednodušená čínština `zh-CN`, tradičná
  `zh-TW`.

### Katalógy {#the-catalogs}

`src/i18n/locales/<jazyk>/<časť>.json`, jeden súbor na každú časť prehliadača,
rovnaké časti v každom jazyku.

Jeden súbor pripadá na každú časť prehliadača (dnes 30, napríklad `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`) a každý jazyk má rovnakú sadu. Priečinok ich všetky vypíše.

Každý súbor je plochý objekt JSON: kľúč napísaný celý (`"race.ui.laps.load"`) a správa ako jeho hodnota. Angličtina je zabalená s prehliadačom; každý iný jazyk sa načíta, keď sa vyberie.

**Vyhľadávanie:** správa aktuálneho jazyka, inak anglická, inak samotný kľúč (vo vývojárskom režime konzola vypíše „i18n: no message …“). Správa, ktorú sa nepodarí sformátovať, sa vráti k anglickej, takže pokazený preklad nikdy nezastaví prehliadač.

#### Syntax správ {#the-message-syntax}

Časť syntaxe správ ICU, ktorú prehliadač používa:

| Tvar | Príklad | Význam |
|---|---|---|
| `{name}` | `{file} has no rows` | hodnota vložená tak, ako je |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | vetva pre číslo podľa pravidiel množného čísla jazyka, alebo presné `=0`, `=1` …; `#` je číslo napísané spôsobom jazyka |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | vetva pre slovo |

Vetvy sa dajú vnoriť a každé `plural` a `select` musí mať vetvu `other`.
Na rozdiel od úplného ICU je **apostróf len apostrofom** – názvy áut a anglické
privlastňovacie tvary ich obsahujú veľa, takže nič netreba uzatvárať do úvodzoviek.
Doslovné `{` alebo `}` sa nedá napísať.

Správy s hodnotami, ktoré preklad musí zachovať: názvy v zložených zátvorkách
dopĺňa kód; slová `select` sú to, podľa čoho kód vyberá (`crash`, `onto-straight`,
`yes`/`none`), a musia zostať ako v angličtine; kategórie množného čísla sa môžu líšiť
(jazyk používa svoje: poľština `one`, `few`, `many`, `other`; japončina iba `other`).

### Ako vznikli preklady a testy {#how-the-translations-were-made-and-the-tests}

Preklady vznikli pomocou modelu umelej inteligencie z angličtiny so slovníkom
pretekárskych pojmov; texty pretekov sa prečítali ešte raz s doplnenými hodnotami.
Opravy od rodených hovorcov sú vítané (nižšie).

`src/i18n/i18n.test.ts` kontroluje:

- že každá správa, ktorú kód vyžaduje, existuje v angličtine – každé volanie `t('…')`
  a každý kľúč uložený v tabuľke a neskôr odovzdaný `t()` (kľúče začínajúce menom
  časti, napríklad `app.` alebo `heat.`);
- že správy, ktoré kód skladá z častí, existujú: `label`, `short`, `count` a `here`
  každej chyby, každá vlastnosť porovnania áut, označenie každého kanála;
- že každá správa sa **dá zparsovať**, v každom jazyku;
- že každý preklad **zachováva hodnoty a voľby anglickej správy** (žiadna hodnota
  nepribudne ani sa nestratí; každé `select` zachová svoje slová);
- že každý jazyk má **každú** anglickú správu a že množina preložených jazykov
  je presne zoznam vyššie;
- že správa sa povie v zvolenom jazyku a v prípade chýbania sa vráti k angličtine.

### Oprava prekladu {#correcting-a-translation}

Opravy rodeného hovorcu sú vítané – každá je jeden riadok JSON.

1. Nájdite správu: vyhľadajte v anglických katalógoch (`src/i18n/locales/en/`)
   text, ktorý vidíte po anglicky (prepnite výber na angličtinu, aby ste ho videli),
   a poznačte si jej kľúč.
2. Otvorte rovnakú časť vo svojom jazyku, napríklad
   `src/i18n/locales/de/race-ui.json`, a zmeňte hodnotu tohto kľúča. Zachovajte
   každé `{name}`, zachovajte slová `select`, napíšte vetvy množného čísla, ktoré
   váš jazyk potrebuje:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Spustite `npm test` (alebo iba `npx vitest run src/i18n`): testy povedia, či
   chýba hodnota alebo voľba alebo či správa už nejde zparsovať.
4. Keď beží vývojársky server, zmena sa ukáže po prepnutí jazyka (alebo po
   obnovení stránky).

**Pridanie správy** (v kóde): najprv ju pridajte do anglickej časti, potom do
každého ďalšieho jazyka (testy zlyhajú, kým ju každý nebude mať).

**Pridanie jazyka**: pridajte ho do `LANGUAGES` v `languages.ts` (jeho značku BCP 47
a jeho vlastný názov, a alias alebo locale `Intl`, ak treba) a priečinok
`src/i18n/locales/<značka>/` so všetkými časťami.
