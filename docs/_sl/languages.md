---
title: "Jeziki"
nav_order: 17
lang: "sl"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Jeziki

Pregledovalnik zna govoriti vaš jezik: vsak gumb, namig in sporočilo ter vsak stavek analize dirke in tekme je prikazan v jeziku, ki ga izberete. Pozna 40 jezikov in začne v jeziku vašega brskalnika, če ga ima.

Tukaj so vsi državni jeziki Evrope (24 jezikov EU ter norveščina, islandščina, ukrajinščina, ruščina, beloruščina, srbščina, bosanščina, makedonščina, albanščina, turščina, luksemburščina in katalonščina), pa tudi japonščina, korejščina ter kitajščina poenostavljena in tradicionalna. Celoten seznam: [Seznam jezikov](ref-languages.md).

Angleščina je vir, iz katerega se prevaja vsak drug jezik, in na njo se vrne sporočilo, ki ni preloženo.

## Zamenjava jezika {#change-the-language}

1. Odprite spustni seznam ob imenu na vrhu stranske vrstice. Prvi vnos je **Samodejno - <jezik>** (jezik brskalnika, kot je zaznan zdaj); nato vsi jeziki v njihovem lastnem imenu, da najdete svojega, tudi če ne berete tistega, ki je prikazan.
2. Izberite jezik. Preklopi se takoj in ostane shranjen v tem brskalniku. Izberite *Samodejno*, da pozabite izbiro.

V zasebnem oknu ali kadar je shranjevanje blokirano, izbira velja, dokler stran ni zaprta.

Kaj preklop naredi:

- vsak napis, namig in sporočilo se ponovno izriše v novem jeziku;
- analiza dirke se **ponovno izračuna** v njem (njeni stavki so zgrajeni iz meritev, ne prevedeni naknadno), demo kroge dobijo nova imena in grafikoni se ponovno narišejo;
- števila, seznami in množine sledijo novemu jeziku.

## V katerem jeziku se začne {#which-language-it-starts-in}

1. Jezik, **izbran** v tem brskalniku, če obstaja (shranjen v `localStorage` pod ključem `heat3d.language`).
2. Sicer **brskalnikov**: prvi iz `navigator.languages`, ki ga pregledovalnik govori. Oznaka se ujema po svojem jezikovnem delu (`de-AT` → `de`), s temi aliasi: `nb` in `nn` → norveščina (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` in katera koli oznaka s pisavo `Hant` → kitajščina tradicionalna; `zh-Hans`, `zh-CN`, `zh-SG` in druge `zh` → kitajščina poenostavljena; `cnr` (črnogorščina) → srbščina.
3. Sicer **angleščina**.

Oznaka `<html lang>` strani je nastavljena na govorjeni jezik.

## Števila, seznami in množine {#numbers-lists-and-plurals}

Števila, seznami in množine v besedilu pregledovalnika so zapisani po navadi jezika (»3,5« ali »3.5«, »a, b in c«). Napisi, daljši od angleških, se prelomijo, kjer jezik to dovoljuje z vezajem, namesto da bi presegli stransko vrstico. Predolga imena vrstic v grafikonih se skrajšajo z tremi pikami in v celoti prikažejo ob premiku miške.

Števila, ki jih vpišete v polje, lahko vsebujejo pičico ali vejico.

## Za prevajalce in razvijalce {#for-translators-and-developers}

Koda: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kako se zapisujejo števila, seznami in množine {#how-numbers-lists-and-plurals-are-written}

- **Števila** z decimalkami (`num`) uporabljajo decimalno ločilo jezika in **brez ločevanja skupin števk** – razdalja 3108 m ostane eno število v vsakem jeziku.
- **Cela števila, ki so števila ali velikosti** (`int`), uporabljajo ločevanje skupin števk, značilno za jezik.
- **Seznami** (`list`) se povezujejo po načinu jezika: »a, b in c«, »a, b ali c« ali drug za drugim z ločilom jezika (sporočilo `common.listSeparator`: ", " v angleščini, "、" v japonščini in v obeh kitajščinah).
- **Množine** sledijo pravilom jezika prek `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Lokal, ki ga zahtevamo od `Intl`, je oznaka jezika, razen kjer bi sama oznaka dobila pravila druge države: portugalščina je `pt-PT` (v Braziliji šteje 0 kot ena), norveščina `nb`, kitajščina poenostavljena `zh-CN`, tradicionalna `zh-TW`.

### Katalogi {#the-catalogs}

`src/i18n/locales/<jezik>/<del>.json`, ena datoteka za vsak del pregledovalnika, isti deli v vsakem jeziku.

Za vsak del pregledovalnika je ena datoteka (danes 30, na primer `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), in vsak jezik ima isti nabor. Mapa jih naštete vse.

Vsaka datoteka je raven objekt JSON: ključ, zapisan v celoti (`"race.ui.laps.load"`), sporočilo kot vrednost. Angleščina je vgrajena v pregledovalnik; vsak drug jezik se naloži, ko ga izberete.

**Iskanje:** sporočilo trenutnega jezika, sicer angleško, sicer sam ključ (v razvojnem načinu konzola opozori »i18n: no message …«). Sporočilo, ki ga ni mogoče oblikovati, se vrne na angleško, zato pokvarjen prevod nikoli ne pokvari pregledovalnika.

#### Sintaksa sporočil {#the-message-syntax}

Del sintakse sporočil ICU, ki ga pregledovalnik uporablja:

| Oblika | Primer | Pomen |
|---|---|---|
| `{ime}` | `{file} has no rows` | vrednost, vstavljena tako, kot je |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | veja za število po pravilih množin jezika ali za natančno `=0`, `=1` …; `#` je število, zapisano po navadi jezika |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | veja za besedo |

Veje se gnezdijo, vsak `plural` in `select` pa mora imeti vejo `other`. Za razliko od polnega ICU je **apostrof samo apostrof** – imena avtomobilov in angleški lastniški sklepi jih vsebujejo veliko, zato jih ni treba posebej označevati. Dobesednega `{` ali `}` ni mogoče zapisati.

Sporočila z vrednostmi, ki jih mora prevod ohraniti: imena v zavitih oklepajih izpolni koda; besede v `select` so tiste, po katerih koda izbira (`crash`, `onto-straight`, `yes`/`none`), in morajo ostati enake kot v angleščini; kategorije množin se lahko razlikujejo (jezik uporablja svoje: poljščina `one`, `few`, `many`, `other`; japonščina samo `other`).

### Kako so bili prevodi narejeni in kako se preverjajo {#how-the-translations-were-made-and-the-tests}

Prevodi so bili narejeni z model umetne inteligence iz angleščine, z glosarjem izraz iz dirkanja, besedila dirk pa so bila prebrana še enkrat z vstavljenimi vrednostmi. Popravki izvornih govorcev so dobrodošli (spodaj).

`src/i18n/i18n.test.ts` preveri:

- da vsako sporočilo, ki ga koda zahteva, obstaja v angleščini – vsak klic `t('…')` in vsak ključ, shranjen v tabeli in kasneje predan `t()` (ključi, ki se začnejo z imenom dela, na primer `app.` ali `heat.`);
- da obstajajo sporočila, ki jih koda sestavi iz delov: vsak `label`, `short`, `count` in `here` napake, vsaka lastnost primerjave avtomobilov, vsaka oznaka kanala;
- da se **vsako** sporočilo da **razčleniti** v vsakem jeziku;
- da vsak prevod **ohrani vrednosti in izbire** angleškega sporočila (nobena vrednost ni dodana ali izgubljena; vsak `select` ohrani svoje besede);
- da ima vsak jezik **vsa** angleška sporočila in da je nabor prevedenih jezikov natanko seznam zgoraj;
- da je sporočilo povedano v izbranem jeziku in se vrne na angleščino.

### Popravljanje prevoda {#correcting-a-translation}

Popravki izvornega govorca so dobrodošli – vsak je ena vrstica JSON.

1. Poiščite sporočilo: v angleških katalogih (`src/i18n/locales/en/`) poiščite besedilo, ki ga vidite v angleščini (preklopite izbirnik na angleščino, da ga preberete), in zapišite ključ.
2. Odprite isti del v svojem jeziku, npr. `src/i18n/locales/de/race-ui.json`, in spremenite vrednost tega ključa. Ohranite vsak `{ime}`, ohranite besede `select` in napišite veje množin, ki jih vaš jezik potrebuje:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Zaženite `npm test` (ali samo `npx vitest run src/i18n`): testi povedo, če je manjkala vrednost ali izbira ali če sporočilo ni več razčlenljivo.
4. Ob zagnanem razvojnem strežniku se sprememba pokaže po preklopu jezika (ali osvežitvi).

**Dodajanje sporočila** (v kodi): najprej ga dodajte v angleški del, nato v vse druge jezike (testi padejo, dokler ga vsak nima).

**Dodajanje jezika**: dodajte ga v `LANGUAGES` v `languages.ts` (njegova oznaka BCP 47 in lastno ime ter po potrebi alias ali lokal `Intl`) in mapo `src/i18n/locales/<oznaka>/` z vsemi deli.
