---
title: "Keeled"
nav_order: 17
lang: "et"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Keeled

Vaataja oskab sinu keelt: iga nupp, vihje ja teade ning iga lause raja- ja mänguanalüüsis kuvatakse keeles, mille sa valid. Keeli on 40 ja see alustab brauseri keelega, kui seda toetab.

Kõik Euroopa riigikeeled on olemas (EL-i 24 ja norra, islandi, ukraina, vene, valgevene, serbia, bosnia, makedoonia, albaania, türgi, luksemburgi ja katalaani keel), samuti jaapani, korea ning hiina lihtsustatud ja traditsiooniline kiri. Täielik loend: [Keelte loend](ref-languages.md).

Inglise keel on lähtekeel, millest kõik teised keeled tõlgitakse, ja see on see, millele puuduv teade langeb tagasi.

## Keele vahetamine {#change-the-language}

1. Ava külgriba ülaosas nime kõrval olev rippmenüü. Selle esimene kirje on **Automaatne - <keel>** (brauseri oma, nagu see praegu tuvastati); siis iga keel selle enda nimega, et leiaksid oma keele isegi siis, kui kuvatavat ei oska lugeda.
2. Vali üks. See vahetub kohe ja jääb sellesse brauserisse alles. Vali *Automaatne*, et valik unustada.

Privaatses aknas või kui salvestus on blokeeritud, kehtib valik seni, kuni leht suletakse.

Keele vahetamine teeb järgmist:

- iga silt, vihje ja teade renderdatakse uuesti uues keeles;
- raja analüüs **arvutatakse uuesti** selles keeles (selle lauseid koostatakse mõõtmistest, mitte tõlgitakse pärast), demoringid nimetatakse ümber ja diagrammid joonistatakse uuesti;
- numbrid, loendid ja mitmused järgivad uut keelt.

## Millises keeles see alustab {#which-language-it-starts-in}

1. Selles brauseris **valitud** keel, kui see on olemas (hoitud `localStorage`-is võtmega `heat3d.language`).
2. Muidu **brauseri** keel: esimene `navigator.languages` kirje, mida vaataja oskab. Silt sobitatakse oma keelelise osa järgi (`de-AT` → `de`), koos nende aliastega: `nb` ja `nn` → norra (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` ja iga silt, mille skript on `Hant`, → hiina traditsiooniline kiri; `zh-Hans`, `zh-CN`, `zh-SG` ja muud `zh` → hiina lihtsustatud kiri; `cnr` (montenegro) → serbia.
3. Muidu **inglise** keel.

Lehe `<html lang>` seatakse kõneldavale keelele.

## Numbrid, loendid ja mitmused {#numbers-lists-and-plurals}

Numbrid, loendid ja mitmused vaataja tekstis kirjutatakse keele kombe järgi ("3.5" või "3,5", "a, b ja c"). Pikemad sildid kui inglise keeles murduvad, vajadusel sidekriipsuga, selle asemel et välja ulatuda külgribalt. Liiga pikad diagrammi reanimed lõigatakse kolmikpunktiga ja kuvatakse täielikult hõljutamisel.

Kasti sisestatud numbrites võib kasutada nii punkti kui koma.

## Tõlkijatele ja arendajatele {#for-translators-and-developers}

Kood: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kuidas numbrid, loendid ja mitmused kirjutatakse {#how-numbers-lists-and-plurals-are-written}

- **Kümnendkohtadega numbrid** (`num`) kasutavad keele kümnendmärki ja **ei rühmita numbreid** - 3108 m kaugus jääb igas keeles üheks numbriks.
- **Täisarvud, mis on arvud või suurused** (`int`) kasutavad keele numbrite rühmitamist.
- **Loendid** (`list`) ühendatakse keele viisil: "a, b ja c", "a, b või c" või üksteise järel keele enda eraldajaga (teade `common.listSeparator`: ", " inglise keeles, "、" jaapani ja mõlemas hiina keeles).
- **Mitmused** järgivad keele enda reegleid `Intl.PluralRules`-i kaudu (`one`, `two`, `few`, `many`, `other`).
- Locale, mida `Intl`-ilt küsitakse, on keele silt, välja arvatud juhul, kui silt ise annaks teise riigi reeglid: portugali keel on `pt-PT` (Brasiilia mitmus loeb 0 kui üks), norra `nb`, hiina lihtsustatud `zh-CN`, traditsiooniline `zh-TW`.

### Kataloogid {#the-catalogs}

`src/i18n/locales/<language>/<part>.json`, üks fail vaataja osa kohta, samad osad igas keeles.

Igal vaataja osal on oma fail (praegu 30, nt `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`) ja igas keeles on sama komplekt. Kaust loetleb need kõik.

Iga fail on lame JSON-objekt: võti täielikult kirjutatud (`"race.ui.laps.load"`), teade väärtusena. Inglise keel on vaatajaga kaasas; iga muu keel laetakse siis, kui see valitakse.

**Otsing:** praeguse keele teade, siis inglise teade, siis võti ise (arendusrežiimis hoiatab konsool "i18n: no message …"). Teade, mis ei vormindu, langeb tagasi inglise keelele, nii et katkine tõlge ei riku kunagi vaatajat.

#### Teate süntaks {#the-message-syntax}

ICU teate süntaksi osa, mida vaataja kasutab:

| Vorm | Näide | Tähendus |
|---|---|---|
| `{name}` | `{file} has no rows` | väärtus, mis sisestatakse nagu antud |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | haru arvule keele mitmusreeglite järgi või täpne `=0`, `=1` …; `#` on number keele viisil kirjutatud |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | haru sõnale |

Harud võivad olla pesastatud ja iga `plural` ja `select` peab olema `other` haru. Erinevalt täielikust ICU-st on **apostrof ainult apostrof** - autode nimed ja inglise omastavad on neid täis -, seega pole midagi tsiteerida. Sõna-sõnalist `{` või `}` ei saa kirjutada.

Sõnumid väärtustega, mida tõlge peab säilitama: loogelistes sulgudes olevad nimed täidab kood; `select`-i sõnad on need, mille järgi kood valib (`crash`, `onto-straight`, `yes`/`none`), ja need peavad jääma nagu inglise keeles; mitmuse kategooriad võivad erineda (keel kasutab omi: poola `one`, `few`, `many`, `other`; jaapani ainult `other`).

### Kuidas tõlked tehti ja testid {#how-the-translations-were-made-and-the-tests}

Tõlked tehti tehisintellekti mudeliga inglise keelest, võidusõidu terminite sõnastikuga, ja võistlustekstid loeti teist korda üle väärtustega täidetuna. Emakeelsete parandused on oodatud (allpool).

`src/i18n/i18n.test.ts` kontrollib:

- et iga teade, mida kood nõuab, on olemas inglise keeles - iga `t('…')` kutse ja iga tabelis hoitud võti, mis antakse hiljem `t()`-le (võtmed, mis algavad osa nimega, nagu `app.` või `heat.`);
- et teated, mida kood osadest koostab, on olemas: iga vea `label`, `short`, `count` ja `here`, iga auto võrdluse tunnus, iga kanali silt;
- et iga teade **parsib** igas keeles;
- et iga tõlge **säilitab inglise teate väärtused ja valikud** (ühtegi väärtust ei lisata ega kao; iga `select` säilitab oma sõnad);
- et igal keelel on **kõik** inglise teated ja et tõlgitud keelte hulk on täpselt ülaltoodud loend;
- et teade öeldakse valitud keeles ja langeb tagasi inglise keelele.

### Tõlke parandamine {#correcting-a-translation}

Emakeelse parandused on oodatud - iga on üks JSON-rida.

1. Leia teade: otsi inglise kataloogidest (`src/i18n/locales/en/`) teksti, mida näed inglise keeles (lülita valija inglise keelele, et seda lugeda), ja märgi selle võti.
2. Ava sama osa oma keeles, nt `src/i18n/locales/de/race-ui.json`, ja muuda selle võtme väärtust. Säilita iga `{name}`, säilita `select`-i sõnad, kirjuta mitmuse harud, mida sinu keel vajab:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Käivita `npm test` (või ainult `npx vitest run src/i18n`): testid ütlevad, kui väärtus või valik on kadunud või teade ei parsi enam.
4. Kui arendusserver töötab, ilmub muutus pärast keele vahetamist (või lehe uuesti laadimist).

**Teate lisamine** (koodis): lisa see kõigepealt inglise osale, siis iga teisele keelele (testid ebaõnnestuvad, kuni igal keelel see on).

**Keele lisamine**: lisa see `languages.ts`-i faili `LANGUAGES`-isse (selle BCP 47 silt ja oma nimi ning vajadusel alias või `Intl` locale), ja kaust `src/i18n/locales/<tag>/` kõigi osadega.
