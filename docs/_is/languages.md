---
title: "Tungumál"
nav_order: 17
lang: "is"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Tungumál

Skoðarinn getur talað þitt tungumál: hver hnappur, vísbending og skilaboð, og hver setning í kappaksturs- og leikjagreiningunni, birtist á því tungumáli sem þú velur. Hann kann 40 og byrjar á tungumáli vafrans þíns þegar hann hefur það.

Öll tungumál ríkja Evrópu eru þarna (24 í ESB, og norska, íslenska, úkraínska, rússneska, hvítrússneska, serbneska, bosníska, makedónska, albanska, tyrkneska, lúxemborgska og katalónska), auk japönsku, kóresku, og kínversku einfölduðu og hefðbundnu. Allur listinn: [Listi yfir tungumál](ref-languages.md).

Enska er uppspretta allra hinna þýðinganna, og það sem vantandi skilaboð falla aftur á.

## Breyta tungumáli {#change-the-language}

1. Opnaðu fellivalmyndina við hlið nafnsins efst á hliðarstikunni. Fyrsta færslan er **Sjálfvirkt - <tungumál>** (tungumál vafrans, eins og það greinist núna); síðan öll tungumál með eigin nafni, svo þú finnir þitt jafnvel þótt þú getir ekki lesið það sem sýnt er.
2. Veldu eitt. Það skiptir strax og er geymt í þessum vafra. Veldu *Sjálfvirkt* til að gleyma valinu.

Í einkagluggum eða þegar geymsla er lokuð gildir valið þar til síðunni er lokað.

Það sem skiptingin gerir:

- hver merking, vísbending og skilaboð birtast aftur á nýja tungumálinu;
- kappaksturgreiningin er **reiknuð upp aftur** á því (setningarnar eru byggðar úr mælingunum, ekki þýddar eftir á), hringjanöfn í kynningunni eru endurnefnd, og gröfin eru teiknuð upp aftur;
- tölur, listar og fleirtölur fylgja nýja tungumálinu.

## Á hvaða tungumáli það byrjar {#which-language-it-starts-in}

1. Tungumálið sem **valið** var í þessum vafra, ef eitthvað er (geymt í `localStorage`
   undir `heat3d.language`).
2. Annars **tungumál vafrans**: fyrsta gildið í `navigator.languages` sem skoðarinn kann. Merki er borið saman eftir tungumálshluta sínum (`de-AT` → `de`), með
   þessum samheitum: `nb` og `nn` → norska (`no`); `zh-TW`, `zh-HK`,
   `zh-MO`, `zh-Hant` og hvert merki með `Hant`-letri → hefðbundin
   kínverska; `zh-Hans`, `zh-CN`, `zh-SG` og önnur `zh` → einfölduð kínverska;
   `cnr` (svartfellska) → serbneska.
3. Annars **enska**.

`<html lang>` síðunnar er stillt á tungumálið sem er talað.

## Tölur, listar og fleirtölur {#numbers-lists-and-plurals}

Tölur, listar og fleirtölur í texta skoðarans eru skrifaðar eins og tungumálið gerir það ("3.5" eða "3,5", "a, b og c"). Merkimiðar sem eru lengri en enskir brotna um línur, með bandstriki þar sem tungumálið leyfir, í stað þess að ganga út úr hliðarstikunni. Heiti gagnaraða í gröfum sem eru of löng eru stytt með þriggja punkta og birt að fullu þegar bendillinn er yfir þeim.

Tölur sem þú slærð inn í reit mega nota annaðhvort punkt eða kommu.

## Fyrir þýðendur og forritara {#for-translators-and-developers}

Kóði: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Hvernig tölur, listar og fleirtölur eru skrifaðar {#how-numbers-lists-and-plurals-are-written}

- **Tölur** með aukastöfum (`num`) nota aukastafsmerki tungumálsins og **enga talnaskiptingu** - fjarlægð 3108 m helst ein tala á hverju tungumáli.
- **Heiltölur sem eru fjöldi eða stærðir** (`int`) nota talnaskiptingu tungumálsins.
- **Listar** (`list`) eru tengdir á hátt tungumálsins: „a, b og c“, „a, b eða
  c“, eða hver á eftir öðrum með eigin aðskilnaði tungumálsins (skilaboðin
  `common.listSeparator`: ", " á ensku, "、" á japönsku og báðum kínversku).
- **Fleirtölur** fylgja eigin reglum tungumálsins í gegnum `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- Staðfangið sem `Intl` fær er merki tungumálsins, nema þar sem merkið eitt
  og sér myndi fá reglur annars lands: portúgalska er `pt-PT` (í Brasilíu telst 0
  sem eitt í fleirtölu), norska `nb`, einfölduð kínverska `zh-CN`,
  hefðbundin kínverska `zh-TW`.

### Safnin {#the-catalogs}

`src/i18n/locales/<language>/<part>.json`, ein skrá fyrir hvern hluta skoðarans,
sömu hlutar á hverju tungumáli.

Það er ein skrá fyrir hvern hluta skoðarans (30 núna, til dæmis `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), og hvert tungumál hefur sama sett. Mappan skráir þær allar.

Hver skrá er flatur JSON-hlutur: lykillinn skrifaður út í heild
(`"race.ui.laps.load"`), skilaboðin sem gildi hans. Enska fylgir skoðaranum;
hvert annað tungumál er sótt þegar það er valið.

**Leit:** skilaboð núverandi tungumáls, annars þau ensku, annars lykillinn
sjálfur (í þróun varar leikjatölvan við „i18n: no message …“). Skilaboð sem
ekki tekst að forsníða falla aftur á þau ensku, svo bilað þýðing brýtur aldrei
skoðarann.

#### Setningafræði skilaboðanna {#the-message-syntax}

Sá hluti ICU-setningafræðinnar sem skoðarinn notar:

| Form | Dæmi | Merking |
|---|---|---|
| `{name}` | `{file} has no rows` | gildi sett inn eins og það er gefið |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | greinin fyrir töluna samkvæmt fleirtölureglum tungumálsins, eða nákvæm `=0`, `=1` …; `#` er talan skrifuð á hátt tungumálsins |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | greinin fyrir orð |

Greinar mega hreiðrast, og sérhvert `plural` og `select` verður að hafa `other`-grein.
Ólíkt fullu ICU er **úrfellingarmerki bara úrfellingarmerki** - heiti bíla og
ensk eignarfall eru full af þeim - svo ekkert þarf að setja í gæsalappir. Ekki er
hægt að skrifa bókstaflega `{` eða `}`.

Skilaboð með gildum sem þýðing verður að halda: nöfnin í slaufusvigum eru fyllt
inn af kóðanum; orðin í `select` eru það sem kóðinn velur eftir (`crash`, `onto-straight`, `yes`/`none`) og verða að
vera eins og á ensku; fleirtöluflokkarnir mega vera ólíkir (tungumál notar sína eigin: pólska `one`, `few`,
`many`, `other`; japanska aðeins `other`).

### Hvernig þýðingarnar voru gerðar, og prófin {#how-the-translations-were-made-and-the-tests}

Þýðingarnar voru gerðar með gervigreindarlíkani út frá ensku, með orðasafni kappakstursheita, og kappakstursteksturinn lesinn aftur í annað sinn með gildunum fylltum inn. Leiðréttingar frá móðurmálsfólki eru vel þegnar (hér að neðan).

`src/i18n/i18n.test.ts` athugar:

- að hvert skilaboð sem kóðinn biður um sé til á ensku - hvert `t('…')`-kall, og hvern lykil
  sem er geymdur í töflu og fenginn `t()` síðar (lyklar sem byrja á nafni hluta, svo sem `app.` eða `heat.`);
- að skilaboðin sem kóðinn býr til úr hlutum séu til: sérhver `label`, `short`, `count` og `here`
  villu, hvert eiginleikaeinkenni bílasamanburðar, sérhver `label` rásar;
- að sérhvert skilaboð **þáttast**, á hverju tungumáli;
- að sérhver þýðing **heldur gildum og valkostum enska skilaboðsins** (ekkert gildi bætt við eða tapað; hvert `select` heldur orðum sínum);
- að sérhvert tungumál hefur **öll** ensku skilaboðin, og að safn þýddra tungumála sé nákvæmlega listinn hér að ofan;
- að skilaboð séu sögð á völdu tungumáli og falli aftur á ensku.

### Leiðrétting þýðingar {#correcting-a-translation}

Leiðréttingar móðurmálsfólks eru vel þegnar - hver er ein lína af JSON.

1. Finndu skilaboðin: leitaðu í ensku söfnunum (`src/i18n/locales/en/`)
   að textanum sem þú sérð á ensku (skiptu valinu yfir á ensku til að lesa hann), og skráðu lykilinn.
2. Opnaðu sama hluta á þínu tungumáli, til dæmis
   `src/i18n/locales/de/race-ui.json`, og breyttu gildi þess lykils. Haltu
   hverju `{name}` í honum, haltu orðum `select`, skrifaðu þær fleirtölugreinar
   sem tungumálið þitt þarfnast:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Keyrðu `npm test` (eða bara `npx vitest run src/i18n`): prófin segja til um hvort gildi
   eða val hvarf eða hvort skilaboð þáttast ekki lengur.
4. Með þróunarþjóninum í gangi birtist breytingin eftir að tungumálið er skipt (eða síðan endurhlaðin).

**Að bæta við skilaboðum** (í kóða): bættu þeim fyrst í enska hlutann, síðan í
hvert annað tungumál (prófin mistakast þangað til hvert hefur þau).

**Að bæta við tungumáli**: bættu því við `LANGUAGES` í `languages.ts` (BCP 47-merki þess og eigið
nafn, og samheiti eða `Intl`-staðfang ef þarf), og möppu `src/i18n/locales/<tag>/` með öllum hlutunum.
