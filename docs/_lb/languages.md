---
title: "Sproochen"
nav_order: 17
lang: "lb"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Sproochen

De Viewer kann Är Sprooch: all Knäpp, Hiweiser a Miedungen, an all Saz vun der Rennanalyse an vum Match-Analyse, gëtt an der Sprooch gewisen, déi Dir wielt. Hie kennt 40, an hie fänkt mat där Sprooch un, déi Äre Browser hat, wann hien se huet.

Déi staatlech Sprooche vun Europa sinn all do (déi 24 vun der EU, a Norwegesch, Islännesch, Ukrainesch, Russesch, Wäissrussesch, Serbesch, Bosnesch, Mazedonesch, Albanesch, Tierkesch, Lëtzebuergesch an Katalanesch), dertëscht Japanesch, Koreanesch, a Chinesesch vereinfacht a traditionell. Déi ganz Lëscht: [Sproochelëscht](ref-languages.md).

Englesch ass d'Quell, vun där all aner Sprooch iwwersat gëtt, an dat, wat eng fehlend Miedung benotzt.

## Sprooch änneren {#change-the-language}

1. Maacht d'Opklapp-Lëscht nieft dem Numm uewen am Säitebalken op. Den éischte Punkt ass **Automatesch - <Sprooch>** (déi vum Browser, sou wéi se elo erkannt gëtt); duerno all Sprooch mat hirem eegenen Numm, sou datt Dir Är eegen fannt, och wann Dir déi gewisen net liest.
2. Wielt eng. Et wiesselt direkt a gëtt an dësem Browser behalen. Wielt *Automatesch*, fir d'Wiel ze vergiessen.

An engem privaten Fënster oder wann d'Späicherplaz gespaart ass, hält d'Wiel bis d'Säit zougemaach gëtt.

Wat d'Wiesselen mécht:

- all Etiket, Hiweis a Miedung gëtt an der neier Sprooch nei gezeechent;
- d'Rennanalyse gëtt **nei ausgerechent** an där Sprooch (hir Sätz gi aus de Miessungen gebaut, net nohinnen iwwersat), d'Demo-Ronne ginn ëmgenannt, an d'Diagrammer ginn nei gezeechent;
- Zuelen, Lëschten an d'Mehrzuelen folgen der neier Sprooch.

## An welcher Sprooch et unfänkt {#which-language-it-starts-in}

1. D'Sprooch, déi **gewielt** ass an dësem Browser, wann eng do ass (gespäichert an `localStorage` ënner `heat3d.language`).
2. Soss déi vum **Browser**: déi éischt vun `navigator.languages`, déi de Viewer kann. E Sproochcode gëtt no sengem Sproochdeel zougeuerdnet (`de-AT` → `de`), mat dësen Alias-Nimm: `nb` a `nn` → Norwegesch (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` an all Code mat dem Schrëft `Hant` → traditionellt Chinesesch; `zh-Hans`, `zh-CN`, `zh-SG` an aner `zh` → vereinfacht Chinesesch; `cnr` (Montenegrinesch) → Serbesch.
3. Soss **Englesch**.

D'`<html lang>` vun der Säit gëtt op d'Sprooch gesat, déi gesprach gëtt.

## Zuelen, Lëschten an d'Mehrzuelen {#numbers-lists-and-plurals}

Zuelen, Lëschten an d'Mehrzuelen am Text vum Viewer ginn op d'Aart vun der Sprooch geschriwwen ("3.5" oder "3,5", "a, b an c"). Etiketten, déi méi laang sinn wéi de Englesche, brieche Zeilen, mat engem Bindestrech wou d'Sprooch dat erlaabt, anstatt aus dem Säitebalken eraus ze lafen. Lëschte mat Zeilennimm, déi ze laang sinn, ginn mat engem Pünktchen ofgeschnidden a ganz gewisen, wann der Mauss drop ass.

Zuelen, déi Dir an e Feld tippt, dierfen e Punkt oder e Komma hunn.

## Fir Iwwersetzer an Entwéckler {#for-translators-and-developers}

Code: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Wéi Zuelen, Lëschten an d'Mehrzuelen geschriwwe ginn {#how-numbers-lists-and-plurals-are-written}

- **Zuelen** mat Komma (`num`) benotze d'Dezimalzeechen vun der Sprooch an **keng Ziffergruppen** - eng Distanz vun 3108 m bleift an all Sprooch eng Zuel.
- **Ganzzuelen, déi Zieler oder Gréissten sinn** (`int`) benotzen d'Ziffergruppen vun der Sprooch.
- **Lëschten** (`list`) ginn op d'Aart vun der Sprooch verbonnen: "a, b an c", "a, b oder c", oder een nom aneren mat dem eegene Trennzeechen vun der Sprooch (d'Miedung `common.listSeparator`: ", " op Englesch, "、" op Japanesch a bei béide Chinesesch).
- **Mehrzuelen** follegen de eegene Reegelen vun der Sprooch iwwer `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- De Locale, dee bei `Intl` gefrot gëtt, ass de Sproochcode, ausser wann de Code allee géif dem anere Land seng Reegele ginn: Portugisesch ass `pt-PT` (bei Brasilien zielt 0 als een Mehrzuel), Norwegesch `nb`, vereinfacht Chinesesch `zh-CN`, traditionell `zh-TW`.

### D'Katalogen {#the-catalogs}

`src/i18n/locales/<Sprooch>/<Deel>.json`, eng Datei pro Deel vum Viewer, an all Sprooch dieselwecht Deeler.

Et gëtt eng Datei pro Deel vum Viewer (haut 30, zum Beispill `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), an all Sprooch huet dee selwechte Satz. De Mapp lëscht se all op.

All Datei ass en flaacht JSON-Objekt: de Schlëssel ganz ausgeschriwwen (`"race.ui.laps.load"`), d'Miedung als Wäert. Englesch ass am Viewer agebaut; all aner Sprooch gëtt gelueden, wann se gewielt gëtt.

**Sichen:** d'Miedung an der aktueller Sprooch, soss d'englesch, soss de Schlëssel selwer (am Entwécklungsmodus warnt d'Konsol "i18n: no message …"). Eng Miedung, déi sech net formatéiere léisst, fält op d'englesch zréck, sou datt eng kaputt Iwwersetzung den Viewer ni kaputt mécht.

#### D'Syntax vun der Miedung {#the-message-syntax}

De Stéck vun der ICU-Miedungssyntax, deen de Viewer benotzt:

| Form | Beispill | Bedeitung |
|---|---|---|
| `{Numm}` | `{file} has no rows` | e Wäert, deen esou agesat gëtt, wéi en ass |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | de Zweig fir d'Zuel no de Mehrzuelen-Reegelen vun der Sprooch, oder en genau `=0`, `=1` …; `#` ass d'Zuel, op d'Aart vun der Sprooch geschriwwen |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | de Zweig fir en Wuert |

Zweige kënne ineneranner stoen, an all `plural` an `select` muss en `other`-Zweig hunn. Am Géigesaz zum ganzen ICU ass eng **Apostroph just eng Apostroph** - Autosnimm an englesch Besëtzformen hunn der vill -, sou datt näischt a Gänsefüsse muss. Eng wëertlech `{` oder `}` kann net geschriwwe ginn.

Miedungen mat Wäerter, déi eng Iwwersetzung behalen muss: d'Nimm a geschwëtzelte Klammere ginn vum Code ausgefëllt; d'Wierder vun engem `select` sinn dat, wat de Code wielt (`crash`, `onto-straight`, `yes`/`none`), a si bleiwen wéi op Englesch; d'Mehrzuelen-Kategorien kënnen anescht sinn (eng Sprooch benotzt hir eegen: Polnesch `one`, `few`, `many`, `other`; Japanesch nëmmen `other`).

### Wéi d'Iwwersetzunge gemaach goufen, an d'Tester {#how-the-translations-were-made-and-the-tests}

D'Iwwersetzunge goufen mat engem KI-Modell aus dem Englesche gemaach, mat engem Glossar fir Rennbegrëffer, an d'Rennsätz goufen nach eng Kéier gelies, mat den ausgefëllte Wäerter. Korrekturen vun Muttersproochler sinn ëmmer wëllkomm (hei ënnen).

`src/i18n/i18n.test.ts` iwwerpréift:

- dass all Miedung, déi de Code freet, am Englesche existéiert - all `t('…')`-Opruff, an all Schlëssel, deen an enger Tabell gehale gëtt an spéider un `t()` iwwergi gëtt (Schlëssel, déi mam Numm vun engem Deel ufänken, wéi `app.` oder `heat.`);
- dass d'Miedungen, déi de Code aus Stécker bäilegt, existéieren: all Feeler sengem `label`, `short`, `count` an `here`, all Autosvergläich-Eegeschaft, all Kanal sengem Etikett;
- dass all Miedung **parséiert**, an all Sprooch;
- dass all Iwwersetzung **d'Wäerter an d'Wiel vun der englescher Miedung behält** (kee Wäert derbäi oder verluer; all `select` behält seng Wierder);
- dass all Sprooch **all** englesch Miedungen huet, an dass d'Lëscht vun den iwwersate Sprooche genau d'Lëscht viru ass;
- dass eng Miedung an der gewielter Sprooch gesot gëtt an op d'Englesch zréckfält.

### Eng Iwwersetzung korrigéieren {#correcting-a-translation}

Korrekturen vun engem Muttersproochler sinn ëmmer wëllkomm - all eent ass eng Zeil JSON.

1. D'Miedung fannen: sicht an de englesche Katalogen (`src/i18n/locales/en/`) no dem Text, deen Dir op Englesch gesitt (stellt d'Wiel op Englesch, fir en ze liesen), a notéiert säi Schlëssel.
2. Maacht deeselwechten Deel an Ärer Sprooch op, z. B. `src/i18n/locales/de/race-ui.json`, an ännert de Wäert vun deem Schlëssel. Behalt all `{Numm}` dran, behalt d'`select`-Wierder, schreift d'Mehrzuelen-Zweige, déi Är Sprooch brauch:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Lafe `npm test` (oder just `npx vitest run src/i18n`): d'Tester soen, ob e Wäert oder eng Wiel fehlt oder eng Miedung net méi parséiert.
4. Wann de Entwécklungsserver leeft, gesitt Dir d'Ännerung, nodeems Dir d'Sprooch gewiesselt hutt (oder d'Säit nei gelueden hutt).

**Eng Miedung bäisetzen** (am Code): se als Éischt am englesche Deel derbäisetzen, dann an all anerer Sprooch (d'Tester falen, bis all Sprooch se huet).

**Eng Sprooch bäisetzen**: an `LANGUAGES` an `languages.ts` derbäisetzen (hire BCP-47-Code an hire eegene Numm, an e Alias oder en `Intl`-Locale wann néideg), an en Ordner `src/i18n/locales/<Code>/` mat all den Deeler.
