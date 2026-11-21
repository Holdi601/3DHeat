---
title: Languages
nav_order: 17
---

# Languages

The viewer can speak your language: every button, hint and message, and every sentence of the race and match analysis, is shown in the language you pick. It knows 40, and starts in your browser's language when it has it.

Europe's state languages are all there (the 24 of the EU, and Norwegian, Icelandic, Ukrainian, Russian, Belarusian, Serbian, Bosnian, Macedonian, Albanian, Turkish, Luxembourgish and Catalan), plus Japanese, Korean, and Chinese simplified and traditional. The full list: [Language list](ref-languages.md).

English is the source every other language is translated from, and what a missing message falls back to.

## Change the language

1. Open the settings (the gear at the top of the sidebar) and the **Language** drop-down. Its first entry is **Automatic - <language>** (the browser's, as detected now); then every language by its own name, so you can find yours even when you cannot read the one shown.
2. Pick one. It switches at once and is kept in this browser. Pick *Automatic* to forget the choice.

In a private window or with storage blocked, the choice lasts until the page is closed.

What switching does:

- every label, hint and message re-renders in the new language;
- the race analysis is **worked out again** in it (its sentences are built
  from the measurements, not translated after the fact), the demo laps are
  renamed, and the charts are redrawn;
- numbers, lists and plurals follow the new language.

## Which language it starts in

1. The language **picked** in this browser, if any (kept in `localStorage`
   under `heat3d.language`).
2. Otherwise the **browser's**: the first of `navigator.languages` the viewer
   speaks. A tag is matched by its language part (`de-AT` → `de`), with
   these aliases: `nb` and `nn` → Norwegian (`no`); `zh-TW`, `zh-HK`,
   `zh-MO`, `zh-Hant` and any tag with the `Hant` script → traditional
   Chinese; `zh-Hans`, `zh-CN`, `zh-SG` and other `zh` → simplified Chinese;
   `cnr` (Montenegrin) → Serbian.
3. Otherwise **English**.

The page's `<html lang>` is set to the language spoken.

## Numbers, lists and plurals

Numbers, lists and plurals in the viewer's text are written the language's way ("3.5" or "3,5", "a, b and c"). Labels longer than the English wrap, hyphenated where the language allows, instead of running out of the sidebar. Chart row names that are too long are cut with an ellipsis and shown in full on hover.

Numbers you type into a box may use either a point or a comma.

## For translators and developers

Code: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### How numbers, lists and plurals are written

- **Numbers** with decimals (`num`) use the language's decimal mark and **no
  digit grouping** - a distance of 3108 m stays one number in every language.
- **Whole numbers that are counts or sizes** (`int`) use the language's digit
  grouping.
- **Lists** (`list`) are joined the language's way: "a, b and c", "a, b or
  c", or one after the other with the language's own separator (the message
  `common.listSeparator`: ", " in English, "、" in Japanese and both Chinese).
- **Plurals** follow the language's own rules through `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- The locale asked of `Intl` is the language's tag, except where the tag
  alone would get another country's rules: Portuguese is `pt-PT` (Brazil's
  plural counts 0 as one), Norwegian `nb`, simplified Chinese `zh-CN`,
  traditional `zh-TW`.

### The catalogs

`src/i18n/locales/<language>/<part>.json`, one file per part of the viewer,
the same parts in every language.

There is one file per part of the viewer (30 today, for example `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), and every language has the same set. The folder lists them all.

Each file is a flat JSON object: the key spelled out in full
(`"race.ui.laps.load"`), the message as its value. English is bundled with
the viewer; any other language is fetched when it is chosen.

**Lookup:** the current language's message, else the English one, else the
key itself (in development the console warns "i18n: no message …"). A
message that fails to format falls back to the English one, so a broken
translation never breaks the viewer.

#### The message syntax

The part of the ICU message syntax the viewer uses:

| Form | Example | Meaning |
|---|---|---|
| `{name}` | `{file} has no rows` | a value put in as given |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | the branch for the number under the language's plural rules, or an exact `=0`, `=1` …; `#` is the number written the language's way |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | the branch for a word |

Branches nest, and every `plural` and `select` must have an `other` branch.
Unlike full ICU, an **apostrophe is only an apostrophe** - car names and
English possessives are full of them - so nothing needs quoting. A literal
`{` or `}` cannot be written.

Messages with values a translation must keep: the names in braces are
filled in by the code; the words of a `select` are what the code chooses
by (`crash`, `onto-straight`, `yes`/`none`) and must stay as in English; the
plural categories may differ (a language uses its own: Polish `one`, `few`,
`many`, `other`; Japanese only `other`).

### How the translations were made, and the tests

The translations were made with an AI model from the English, with a
glossary of racing terms, and the race texts read over a second time with
the values filled in. Corrections by native speakers are welcome (below).

`src/i18n/i18n.test.ts` checks:

- that every message the code asks for exists in English - every `t('…')`
  call, and every key kept in a table and handed to `t()` later (keys
  starting with the name of a part, such as `app.` or `heat.`);
- that the messages the code builds from parts exist: every mistake's
  `label`, `short`, `count` and `here`, every car-comparison trait, every
  channel's label;
- that every message **parses**, in every language;
- that every translation **keeps the English message's values and choices**
  (no value added or lost; every `select` keeps its words);
- that every language has **every** English message, and that the set of
  translated languages is exactly the list above;
- that a message is said in the language picked and falls back to English.

### Correcting a translation

A native speaker's corrections are welcome - each is one line of JSON.

1. Find the message: search the English catalogs (`src/i18n/locales/en/`)
   for the text you see in English (switch the picker to English to read
   it), and note its key.
2. Open the same part in your language, e.g.
   `src/i18n/locales/de/race-ui.json`, and change that key's value. Keep
   every `{name}` in it, keep the `select` words, write the plural branches
   your language needs:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Run `npm test` (or just `npx vitest run src/i18n`): the tests say if a
   value or choice went missing or a message no longer parses.
4. With the dev server running, the change shows after switching the language
   (or reloading).

**Adding a message** (in code): add it to the English part first, then to
every other language (the tests fail until each has it).

**Adding a language**: add it to `LANGUAGES` in `languages.ts` (its BCP 47
tag and its own name, and an alias or an `Intl` locale if needed), and a
folder `src/i18n/locales/<tag>/` with all the parts.
