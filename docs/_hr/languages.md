---
title: "Jezici"
nav_order: 17
lang: "hr"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Jezici

Prikaz može govoriti vaš jezik: svaki gumb, savjet i poruka, te svaka rečenica analize utrke i meča prikazuje se na jeziku koji odaberete. Zna 40 jezika i pri pokretanju kreće s jezikom vašeg preglednika, ako ga ima.

Svi državni jezici Europe su tu (24 jezika EU-a, te norveški, islandski, ukrajinski, ruski, bjeloruski, srpski, bosanski, makedonski, albanski, turski, luksemburški i katalonski), zatim japanski, korejski te kineski pojednostavljeni i tradicionalni. Cijeli popis: [Popis jezika](ref-languages.md).

Engleski je izvorni jezik iz kojeg se prevodi svaki drugi jezik i na njega se vraća svaka poruka koja nedostaje.

## Promjena jezika {#change-the-language}

1. Otvorite padajući izbornik pored imena na vrhu bočne trake. Njegova prva stavka je **Automatski - <jezik>** (preglednikov, kako je sada prepoznat). Zatim slijedi svaki jezik svojim imenom, tako da pronađete svoj čak i kad ne možete pročitati ono što je prikazano.
2. Odaberite jedan. Prebacuje se odmah i pamti se u ovom pregledniku. Odaberite *Automatski* da zaboravite izbor.

U privatnom prozoru ili kad je pohrana blokirana, izbor vrijedi dok se stranica ne zatvori.

Što prebacivanje radi:

- svaka oznaka, savjet i poruka ponovno se iscrtava na novom jeziku;
- analiza utrke se **ponovno izračunava** na njemu (njezine rečenice grade se iz mjerenja, a ne prevode naknadno), demo krugovi dobivaju nova imena, a grafikoni se ponovno crtaju;
- brojevi, popisi i množine slijede novi jezik.

## Na kojem jeziku počinje {#which-language-it-starts-in}

1. Jezik **odabran** u ovom pregledniku, ako postoji (pamti se u `localStorage` pod `heat3d.language`).
2. Inače, **preglednikov**: prvi iz `navigator.languages` koji prikaz govori. Oznaka se uspoređuje prema jezičnom dijelu (`de-AT` → `de`), uz ove aliase: `nb` i `nn` → norveški (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` i svaka oznaka sa `Hant` pismom → tradicionalni kineski; `zh-Hans`, `zh-CN`, `zh-SG` i ostale `zh` → pojednostavljeni kineski; `cnr` (crnogorski) → srpski.
3. Inače **engleski**.

Atribut `<html lang>` stranice postavlja se na jezik koji se govori.

## Brojevi, popisi i množine {#numbers-lists-and-plurals}

Brojevi, popisi i množine u tekstu prikaza pišu se na način jezika ("3.5" ili "3,5", "a, b i c"). Oznake dulje od engleskih lome se u retke, po potrebi s crticom gdje jezik to dopušta, umjesto da izađu iz bočne trake. Imena redaka u grafikonima koja su predugačka skraćuju se na tri točkice, a puna se vide na prijelazu mišem.

Brojevi koje upisujete u polje mogu koristiti točku ili zarez.

## Za prevoditelje i razvojne programere {#for-translators-and-developers}

Kod: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kako se pišu brojevi, popisi i množine {#how-numbers-lists-and-plurals-are-written}

- **Brojevi** s decimalama (`num`) koriste decimalni znak jezika i **bez grupiranja znamenki**. Udaljenost od 3108 m ostaje jedan broj u svakom jeziku.
- **Cijeli brojevi koji su brojevi ili veličine** (`int`) koriste grupiranje znamenki jezika.
- **Popisi** (`list`) spajaju se na način jezika: "a, b i c", "a, b ili c", ili jedan za drugim s vlastitim separatorom jezika (poruka `common.listSeparator`: ", " na engleskom, "、" na japanskom i na oba kineska).
- **Množine** slijede pravila samog jezika preko `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Lokal koji se traži od `Intl` jest oznaka jezika, osim ondje gdje bi sama oznaka dala pravila neke druge zemlje: portugalski je `pt-PT` (brazilski broji 0 kao jedan), norveški `nb`, pojednostavljeni kineski `zh-CN`, tradicionalni `zh-TW`.

### Katalozi {#the-catalogs}

`src/i18n/locales/<jezik>/<dio>.json`, jedna datoteka po dijelu prikaza, isti dijelovi u svakom jeziku.

Postoji jedna datoteka po dijelu prikaza (danas 30, na primjer `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), i svaki jezik ima isti skup. Mapa ih sve navodi.

Svaka datoteka je jednostavan JSON objekt: ključ napisan u cijelosti (`"race.ui.laps.load"`), a poruka je vrijednost. Engleski je ugrađen u prikaz; svaki drugi jezik dohvaća se kad se odabere.

**Traženje:** poruka trenutnog jezika, zatim engleska, zatim sam ključ (u razvoju konzola upozorava "i18n: no message …"). Poruka koja se ne može oblikovati vraća se na englesku, pa pokvaren prijevod nikad ne ruši prikaz.

#### Sintaksa poruka {#the-message-syntax}

Dio sintakse ICU poruka koji prikaz koristi:

| Oblik | Primjer | Značenje |
|---|---|---|
| `{name}` | `{file} has no rows` | vrijednost umetnuta onako kako je dana |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | grana za broj prema pravilima množine jezika, ili točan `=0`, `=1` …; `#` je broj napisan na način jezika |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | grana za riječ |

Grane se mogu gnijezditi, a svaki `plural` i `select` mora imati granu `other`.
Za razliku od punog ICU-a, **apostrof je samo apostrof**. Imena automobila i engleski posvojni oblici puni su ih, pa ništa ne treba stavljati u navodnike. Doslovni `{` ili `}` ne može se napisati.

Poruke s vrijednostima koje prijevod mora zadržati: imena u vitičastim zagradama popunjava kod. Riječi u `select` su ono po čemu kod bira (`crash`, `onto-straight`, `yes`/`none`) i moraju ostati kao na engleskom. Kategorije množine mogu se razlikovati (jezik koristi svoje: poljski `one`, `few`, `many`, `other`; japanski samo `other`).

### Kako su prijevodi napravljeni i testovi {#how-the-translations-were-made-and-the-tests}

Prijevodi su napravljeni pomoću AI modela iz engleskog, uz rječnik pojmova iz utrka. Tekstovi utrka pročitani su još jednom s uključenim vrijednostima. Ispravci izvornih govornika su dobrodošli (dolje).

`src/i18n/i18n.test.ts` provjerava:

- da svaka poruka koju kod traži postoji na engleskom: svaki poziv `t('…')` i svaki ključ spremljen u tablici i kasnije predan `t()` (ključevi koji počinju imenom dijela, na primjer `app.` ili `heat.`);
- da poruke koje kod gradi od dijelova postoje: svaki `label`, `short`, `count` i `here` greške, svaka osobina usporedbe automobila, svaka oznaka kanala;
- da se svaka poruka **može parsirati** u svakom jeziku;
- da svaki prijevod **zadržava vrijednosti i izbore engleske poruke** (nijedna vrijednost nije dodana ili izgubljena; svaki `select` zadržava svoje riječi);
- da svaki jezik ima **svaku** englesku poruku i da je skup prevedenih jezika točno gore navedeni popis;
- da se poruka kaže na odabranom jeziku i da se vraća na engleski.

### Ispravljanje prijevoda {#correcting-a-translation}

Ispravci izvornog govornika su dobrodošli. Svaki je jedna linija JSON-a.

1. Pronađite poruku: pretražite engleske kataloge (`src/i18n/locales/en/`) za tekstom koji vidite na engleskom (prebacite birač na engleski da ga pročitate) i zapišite njezin ključ.
2. Otvorite isti dio na svom jeziku, npr. `src/i18n/locales/de/race-ui.json`, i promijenite vrijednost tog ključa. Zadržite svaki `{name}`, zadržite riječi `select`, napišite grane množine koje vaš jezik treba:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Pokrenite `npm test` (ili samo `npx vitest run src/i18n`): testovi će reći ako je vrijednost ili izbor nestao ili ako poruka više ne parsira.
4. Dok radi razvojni poslužitelj, promjena se vidi nakon promjene jezika (ili ponovnog učitavanja).

**Dodavanje poruke** (u kodu): prvo je dodajte engleskom dijelu, zatim svakom drugom jeziku (testovi padaju dok svaki ne dobije).

**Dodavanje jezika**: dodajte ga u `LANGUAGES` u `languages.ts` (njegova BCP 47 oznaka i vlastito ime te alias ili `Intl` lokal ako treba) i mapu `src/i18n/locales/<oznaka>/` sa svim dijelovima.
