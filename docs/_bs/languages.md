---
title: "Jezici"
nav_order: 17
lang: "bs"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Jezici

Prikaz može govoriti tvoj jezik: svako dugme, savjet i poruka, te svaka rečenica analize utrke i meča, prikazuju se u jeziku koji izabereš. Zna 40 jezika i počinje na jeziku tvog preglednika kada ga ima.

Tu su svi državni jezici Evrope (24 jezika EU, te norveški, islandski, ukrajinski, ruski, bjeloruski, srpski, bosanski, makedonski, albanski, turski, luksemburški i katalonski), plus japanski, korejski, i kineski pojednostavljeni i tradicionalni. Cijeli spisak: [Spisak jezika](ref-languages.md).

Engleski je izvor iz kojeg se prevodi sve ostalo, i na njega se vraća poruka kada nedostaje prijevod.

## Promijeni jezik {#change-the-language}

1. Otvori padajući meni pored imena na vrhu bočne trake. Prvi unos je **Automatski - <jezik>** (preglednikov, kako je sada otkriven); zatim svaki jezik svojim imenom, da možeš naći svoj čak i kad ne čitaš onaj koji je prikazan.
2. Izaberi jedan. Prelazi odmah i čuva se u ovom pregledniku. Izaberi *Automatski* da zaboraviš izbor.

U privatnom prozoru ili kada je pohrana blokirana, izbor traje dok se stranica ne zatvori.

Šta prebacivanje radi:

- svaka oznaka, savjet i poruka se ponovo prikazuje na novom jeziku;
- analiza utrke se **ponovo računa** na njemu (njene rečenice se grade iz mjerenja, a ne prevode naknadno), demo krugovi se preimenuju, a grafikoni se ponovo iscrtavaju;
- brojevi, spiskovi i množine prate novi jezik.

## Na kojem jeziku počinje {#which-language-it-starts-in}

1. Jezik **izabran** u ovom pregledniku, ako postoji (čuva se u `localStorage` pod `heat3d.language`).
2. Inače **preglednikov**: prvi iz `navigator.languages` koji gledalac govori. Oznaka se poklapa po jezičnom dijelu (`de-AT` → `de`), uz ove aliase: `nb` i `nn` → norveški (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` i svaka oznaka sa pismom `Hant` → tradicionalni kineski; `zh-Hans`, `zh-CN`, `zh-SG` i ostali `zh` → pojednostavljeni kineski; `cnr` (crnogorski) → srpski.
3. Inače **engleski**.

`<html lang>` stranice postavlja se na govoreni jezik.

## Brojevi, spiskovi i množine {#numbers-lists-and-plurals}

Brojevi, spiskovi i množine u tekstu prikaza pišu se na način jezika ("3.5" ili "3,5", "a, b i c"). Oznake duže od engleskih se prelamaju, s crticom gdje jezik to dozvoljava, umjesto da izađu iz bočne trake. Predugački nazivi redova u grafikonima skraćuju se tri tačke, a cijeli se prikazuju pri prelasku mišem.

Brojevi koje upisuješ u polje mogu imati ili tačku ili zarez.

## Za prevodioce i programere {#for-translators-and-developers}

Kod: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kako se pišu brojevi, spiskovi i množine {#how-numbers-lists-and-plurals-are-written}

- **Brojevi** s decimalama (`num`) koriste decimalni znak jezika i **bez grupisanja cifara** - daljina od 3108 m ostaje jedan broj u svakom jeziku.
- **Cijeli brojevi koji su brojevi ili veličine** (`int`) koriste grupisanje cifara jezika.
- **Spiskovi** (`list`) se spajaju na način jezika: "a, b i c", "a, b ili c", ili jedan za drugim s separatorom jezika (poruka `common.listSeparator`: ", " na engleskom, "、" na japanskom i na oba kineska).
- **Množine** prate pravila jezika kroz `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Locale koji se traži od `Intl` je oznaka jezika, osim gdje bi sama oznaka dobila tuđa pravila zemlje: portugalski je `pt-PT` (u brazilskom se 0 broji kao jedan), norveški `nb`, pojednostavljeni kineski `zh-CN`, tradicionalni `zh-TW`.

### Katalozi {#the-catalogs}

`src/i18n/locales/<jezik>/<dio>.json`, jedna datoteka po dijelu prikaza, isti dijelovi u svakom jeziku.

Postoji jedna datoteka po dijelu prikaza (danas 30, na primjer `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), i svaki jezik ima isti skup. Mapa ih sve navodi.

Svaka datoteka je ravan JSON objekat: ključ napisan u cijelosti (`"race.ui.laps.load"`), a poruka kao vrijednost. Engleski je ugrađen u prikaz; svaki drugi jezik se preuzima kada se izabere.

**Traženje:** poruka trenutnog jezika, inače engleska, inače sam ključ (u razvoju konzola upozorava „i18n: no message …"). Poruka koja se ne može oblikovati vraća se na englesku, pa loš prijevod nikad ne ruši prikaz.

#### Sintaksa poruka {#the-message-syntax}

Dio ICU sintakse poruka koji prikaz koristi:

| Oblik | Primjer | Značenje |
|---|---|---|
| `{name}` | `{file} has no rows` | vrijednost ubačena kako je data |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | grana za broj po pravilima množine jezika, ili tačno `=0`, `=1` …; `#` je broj napisan na način jezika |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | grana za riječ |

Grane se mogu gnijezditi, a svaki `plural` i `select` mora imati granu `other`. Za razliku od punog ICU-a, **apostrof je samo apostrof** - imena automobila i engleski posvojni oblici su puni njih, pa ništa ne treba navoditi. Doslovne `{` ili `}` se ne mogu napisati.

Poruke s vrijednostima koje prijevod mora zadržati: imena u vitičastim zagradama popunjava kod; riječi u `select` su ono po čemu kod bira (`crash`, `onto-straight`, `yes`/`none`) i moraju ostati kao na engleskom; kategorije množine se mogu razlikovati (jezik koristi svoje: poljski `one`, `few`, `many`, `other`; japanski samo `other`).

### Kako su prijevodi nastali i testovi {#how-the-translations-were-made-and-the-tests}

Prijevodi su napravljeni uz pomoć AI modela iz engleskog, uz rječnik trkačkih termina, a tekstovi utrke su pročitani još jednom s popunjenim vrijednostima. Ispravke od izvornih govornika su dobrodošle (dolje).

`src/i18n/i18n.test.ts` provjerava:

- da svaka poruka koju kod traži postoji na engleskom - svaki poziv `t('…')`, i svaki ključ koji je zadržan u tabeli i kasnije predat `t()` (ključevi koji počinju imenom dijela, kao `app.` ili `heat.`);
- da poruke koje kod gradi od dijelova postoje: svaki `label`, `short`, `count` i `here` greške, svaka osobina poređenja automobila, svaka oznaka kanala;
- da se svaka poruka **parsira**, u svakom jeziku;
- da svaki prijevod **zadržava vrijednosti i izbore engleske poruke** (nijedna vrijednost nije dodana ili izgubljena; svaki `select` zadržava svoje riječi);
- da svaki jezik ima **svaku** englesku poruku, i da je skup prevedenih jezika tačno spisak iznad;
- da se poruka kaže na izabranom jeziku i da se vraća na engleski.

### Ispravka prijevoda {#correcting-a-translation}

Ispravke izvornog govornika su dobrodošle - svaka je jedan red JSON-a.

1. Nađi poruku: pretraži engleske katalozi (`src/i18n/locales/en/`) za tekst koji vidiš na engleskom (prebaci birač na engleski da je pročitaš), i zabilježi njen ključ.
2. Otvori isti dio na svom jeziku, npr. `src/i18n/locales/de/race-ui.json`, i promijeni vrijednost tog ključa. Zadrži svaki `{name}`, zadrži riječi `select`, napiši grane množine koje tvoj jezik treba:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Pokreni `npm test` (ili samo `npx vitest run src/i18n`): testovi kažu ako je vrijednost ili izbor nestao ili ako poruka više ne parsira.
4. Uz pokrenut razvojni server, promjena se vidi nakon promjene jezika (ili ponovnog učitavanja).

**Dodavanje poruke** (u kodu): prvo je dodaj engleskom dijelu, pa svakom drugom jeziku (testovi padaju dok svaki nema).

**Dodavanje jezika**: dodaj ga u `LANGUAGES` u `languages.ts` (njegova BCP 47 oznaka i sopstveno ime, te alias ili `Intl` locale ako treba), i mapu `src/i18n/locales/<oznaka>/` sa svim dijelovima.
