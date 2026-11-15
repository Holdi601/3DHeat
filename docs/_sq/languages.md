---
title: "Gjuhët"
nav_order: 17
lang: "sq"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---


# Gjuhët

Shikuesi mund të flasë gjuhën tënde: çdo buton, këshillë dhe mesazh, dhe çdo fjali e analizës së garës dhe të ndeshjes, shfaqen në gjuhën që zgjedh. Njeh 40 gjuhë, dhe nis me gjuhën e shfletuesit tënd kur e ka.

Të gjitha gjuhët shtetërore të Evropës janë këtu (24 të BE-së, dhe norvegjishtja, islandishtja, ukrainishtja, rusishtja, bjellorusishtja, serbishtja, boshnjakishtja, maqedonishtja, shqipja, turqishtja, luksemburgishtja dhe katalanishtja), plus japonishtja, koreanishtja, dhe kinezishtja e thjeshtuar dhe ajo tradicionale. Lista e plotë: [Lista e gjuhëve](ref-languages.md).

Anglishtja është burimi nga i cili përkthehen të gjitha gjuhët e tjera, dhe ajo që shfaqet kur mungon një mesazh.

## Ndrysho gjuhën {#change-the-language}

1. Hap listën me zgjedhje pranë emrit lart në anën e majtë. Hyrja e parë është **Automatike - <gjuha>** (e shfletuesit, siç zbulohet tani); pastaj çdo gjuhë me emrin e vet, që ta gjesh tënden edhe kur nuk e lexon gjuhën që shfaqet.
2. Zgjidh një. Ndërrohet menjëherë dhe ruhet në këtë shfletues. Zgjidh *Automatike* për të harruar zgjedhjen.

Në një dritare private, ose kur ruajtja është e bllokuar, zgjedhja zgjat deri sa mbyllet faqja.

Çfarë bën ndërrimi:

- çdo etiketë, këshillë dhe mesazh vizatohet sërish në gjuhën e re;
- analiza e garës **llogaritet përsëri** në të (fjalitë e saj ndërtohen nga matjet, jo përkthehen më pas), rrethet demo riemërtohen, dhe grafikët vizatohen sërish;
- numrat, listat dhe shumësat ndjekin gjuhën e re.

## Me cilën gjuhë nis {#which-language-it-starts-in}

1. Gjuha **e zgjedhur** në këtë shfletues, nëse ka (e ruajtur në `localStorage` me çelësin `heat3d.language`).
2. Përndryshe, ajo e **shfletuesit**: e para nga `navigator.languages` që shikuesi e flet. Një etiketë përputhet sipas pjesës së gjuhës (`de-AT` → `de`), me këta alias: `nb` dhe `nn` → norvegjishtja (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` dhe çdo etiketë me shkrimin `Hant` → kinezishtja tradicionale; `zh-Hans`, `zh-CN`, `zh-SG` dhe `zh` të tjera → kinezishtja e thjeshtuar; `cnr` (malazeze) → serbishtja.
3. Përndryshe, **anglishtja**.

Atributi `<html lang>` i faqes vendoset në gjuhën që flitet.

## Numrat, listat dhe shumësat {#numbers-lists-and-plurals}

Numrat, listat dhe shumësat në tekstin e shikuesit shkruhen sipas mënyrës së gjuhës ("3.5" ose "3,5", "a, b dhe c"). Etiketat më të gjata se në anglisht mbështjellen, me vizë ndarëse aty ku gjuha e lejon, në vend që të dalin jashtë anës së majtë. Emrat e rreshtave të grafikëve që janë shumë të gjatë shkurtohen me tre pika dhe shfaqen të plotë kur kalon mbi to.

Numrat që shkruan në një kuti mund të kenë pikë ose presje.

## Për përkthyesit dhe zhvilluesit {#for-translators-and-developers}

Kodi: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Si shkruhen numrat, listat dhe shumësat {#how-numbers-lists-and-plurals-are-written}

- **Numrat** me pjesë dhjetore (`num`) përdorin shenjën dhjetore të gjuhës dhe **pa grupim shifrash**. Një distancë prej 3108 m mbetet një numër i vetëm në çdo gjuhë.
- **Numrat e plotë që janë numërime ose madhësi** (`int`) përdorin grupimin e shifrave të gjuhës.
- **Listat** (`list`) lidhen sipas mënyrës së gjuhës: "a, b dhe c", "a, b ose c", ose një pas tjetrit me ndarësin e vet të gjuhës (mesazhi `common.listSeparator`: ", " në anglisht, "、" në japonisht dhe në të dy kinezishtet).
- **Shumësat** ndjekin rregullat e vetë gjuhës përmes `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Lokalja e kërkuar te `Intl` është etiketa e gjuhës, përveç rasteve kur vetëm etiketa do të merrte rregulla të një vendi tjetër: portugezishtja është `pt-PT` (shumësi brazilian e numëron 0 si një), norvegjishtja `nb`, kinezishtja e thjeshtuar `zh-CN`, ajo tradicionale `zh-TW`.

### Katalogët {#the-catalogs}

`src/i18n/locales/<gjuha>/<pjesa>.json`, një skedar për çdo pjesë të shikuesit, të njëjtat pjesë në çdo gjuhë.

Ka një skedar për çdo pjesë të shikuesit (30 sot, për shembull `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), dhe çdo gjuhë ka të njëjtin grup. Dosja i liston të gjitha.

Çdo skedar është një objekt i thjeshtë JSON: çelësi shkruar i plotë (`"race.ui.laps.load"`), mesazhi si vlerë. Anglishtja është e përfshirë me shikuesin; çdo gjuhë tjetër merret kur zgjidhet.

**Kërkimi:** mesazhi i gjuhës aktuale, përndryshe ai anglisht, përndryshe vetë çelësi (në zhvillim konsola paralajmëron "i18n: no message …"). Një mesazh që nuk formatohet dot kthehet në atë anglisht, kështu që një përkthim i prishur nuk e prish kurrë shikuesin.

#### Sintaksa e mesazhit {#the-message-syntax}

Pjesa e sintaksës ICU të mesazheve që përdor shikuesi:

| Forma | Shembull | Kuptimi |
|---|---|---|
| `{name}` | `{file} has no rows` | një vlerë e vendosur ashtu si është |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | dega për numrin sipas rregullave të shumësit të gjuhës, ose një `=0`, `=1` … të saktë; `#` është numri i shkruar sipas mënyrës së gjuhës |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | dega për një fjalë |

Degët mund të futen njëra në tjetrën, dhe çdo `plural` dhe `select` duhet të ketë një dege `other`. Ndryshe nga ICU i plotë, një **apostrof është vetëm apostrof** — emrat e makinave dhe pronorët anglisht kanë shumë prej tyre — prandaj asgjë nuk duhet vendosur në thonjëza. Një `{` ose `}` i pastër nuk shkruhet dot.

Mesazhet me vlera që përkthimi duhet t'i mbajë: emrat në kllapa plotësohen nga kodi; fjalët e një `select` janë ato sipas të cilave zgjedh kodi (`crash`, `onto-straight`, `yes`/`none`) dhe duhet të mbeten si në anglisht; kategoritë e shumësit mund të ndryshojnë (çdo gjuhë përdor të vetat: polonishtja `one`, `few`, `many`, `other`; japonishtja vetëm `other`).

### Si u bënë përkthimet, dhe testet {#how-the-translations-were-made-and-the-tests}

Përkthimet u bënë me një model të inteligjencës artificiale nga anglishtja, me një fjalor të termave të garave, dhe tekstet e garës u lexuan edhe një herë me vlerat e plotësuara. Korrigjimet nga folës amtarë janë të mirëseardhura (më poshtë).

`src/i18n/i18n.test.ts` kontrollon:

- që çdo mesazh që kodi kërkon ekziston në anglisht: çdo thirrje `t('…')`, dhe çdo çelës i mbajtur në një tabelë dhe i dhënë te `t()` më vonë (çelësat që fillojnë me emrin e një pjese, si `app.` ose `heat.`);
- që mesazhet që kodi i ndërton nga pjesë ekzistojnë: çdo `label`, `short`, `count` dhe `here` gabimi, çdo tipar krahasimi i makinave, çdo etiketë kanali;
- që çdo mesazh **analizohet** në çdo gjuhë;
- që çdo përkthim **mban vlerat dhe zgjedhjet e mesazhit anglisht** (asnjë vlerë e shtuar ose e humbur; çdo `select` mban fjalët e veta);
- që çdo gjuhë ka **çdo** mesazh anglisht, dhe që bashkësia e gjuhëve të përkthyera është saktësisht lista më sipër;
- që një mesazh thuhet në gjuhën e zgjedhur dhe kthehet në anglisht.

### Korrigjimi i një përkthimi {#correcting-a-translation}

Korrigjimet e një folësi amtar janë të mirëseardhura — secili është një rresht JSON.

1. Gjej mesazhin: kërko në katalogët anglisht (`src/i18n/locales/en/`) për tekstin që sheh (ndërro zgjedhësin në anglisht për ta lexuar), dhe shëno çelësin e tij.
2. Hap të njëjtën pjesë në gjuhën tënde, p.sh. `src/i18n/locales/de/race-ui.json`, dhe ndrysho vlerën e atij çelësi. Mbaj çdo `{name}` brenda, mbaj fjalët e `select`, shkruaj degët e shumësit që i duhen gjuhës sate:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Ekzekuto `npm test` (ose vetëm `npx vitest run src/i18n`): testet tregojnë nëse ka humbur një vlerë ose zgjedhje, ose nëse një mesazh nuk analizohet më.
4. Me serverin e zhvillimit të hapur, ndryshimi shfaqet pasi ndërron gjuhën (ose rifreskon).

**Shtimi i një mesazhi** (në kod): shtoje së pari në pjesën anglisht, pastaj në çdo gjuhë tjetër (testet dështojnë derisa çdo gjuhë ta ketë).

**Shtimi i një gjuhe**: shtoje në `LANGUAGES` në `languages.ts` (etiketën e saj BCP 47 dhe emrin e vet, dhe një alias ose lokale `Intl` nëse duhet), dhe një dosje `src/i18n/locales/<etiketa>/` me të gjitha pjesët.
