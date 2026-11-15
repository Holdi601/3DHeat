---
title: "Kalbos"
nav_order: 17
lang: "lt"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Kalbos

Peržiūra gali kalbėti jūsų kalba: kiekvienas mygtukas, patarimas ir pranešimas bei kiekvienas lenktynių ir rungtynių analizės sakinys rodomi kalba, kurią pasirenkate. Ji palaiko 40 kalbų ir pradeda naudodama jūsų naršyklės kalbą, jei ji tokia yra.

Visos Europos valstybinės kalbos yra čia (ES 24 kalbos, taip pat norvegų, islandų, ukrainiečių, rusų, baltarusių, serbų, bosnių, makedonų, albanų, turkų, liuksemburgiečių ir katalonų), be to, japonų, korėjiečių ir kinų supaprastinta bei tradicinė rašyba. Pilnas sąrašas: [Kalbų sąrašas](ref-languages.md).

Anglų kalba yra šaltinis, iš kurio verčiamos visos kitos kalbos, ir ji naudojama kaip atsarginė, kai pranešimo nėra.

## Keisti kalbą {#change-the-language}

1. Atidarykite išskleidžiamąjį sąrašą šalia pavadinimo viršutinėje šoninėje juostoje. Jo pirmas įrašas yra **Automatinė – <kalba>** (naršyklės kalba, kaip ji nustatyta dabar); toliau – kiekviena kalba jos pačios vardu, kad rastumėte savo, net jei nemokate kalbos, kuria rodomas sąrašas.
2. Pasirinkite vieną. Ji perjungiama iš karto ir išsaugoma šioje naršyklėje. Pasirinkite *Automatinė*, kad pamirštumėte pasirinkimą.

Privačiame lange arba kai saugykla užblokuota, pasirinkimas galioja tol, kol puslapis uždaromas.

Ką daro perjungimas:

- kiekvienas užrašas, patarimas ir pranešimas atvaizduojami iš naujo nauja kalba;
- lenktynių analizė **skaičiuojama iš naujo** ta kalba (jos sakiniai sudaromi iš matavimų, o ne verčiami po fakto), demonstraciniai ratai pervadinami, o grafikai perpiešiami;
- skaičiai, sąrašai ir daugiskaitos formos seka naujos kalbos taisykles.

## Kuria kalba pradedama {#which-language-it-starts-in}

1. Kalba, **pasirinkta** šioje naršyklėje, jei tokia yra (saugoma `localStorage` raktu `heat3d.language`).
2. Kitu atveju – **naršyklės**: pirmoji iš `navigator.languages`, kurią peržiūra palaiko. Žyma sutampa pagal kalbos dalį (`de-AT` → `de`), su šiais pseudonimais: `nb` ir `nn` → norvegų (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` ir bet kuri žyma su `Hant` raštu → kinų tradicinė; `zh-Hans`, `zh-CN`, `zh-SG` ir kita `zh` → kinų supaprastinta; `cnr` (juodkalniečių) → serbų.
3. Kitu atveju – **anglų**.

Puslapio `<html lang>` nustatomas į naudojamą kalbą.

## Skaičiai, sąrašai ir daugiskaitos formos {#numbers-lists-and-plurals}

Skaičiai, sąrašai ir daugiskaitos formos peržiūros tekste rašomi pagal tos kalbos įpročius („3.5“ arba „3,5“, „a, b ir c“). Etiketės, ilgesnės nei angliškos, lūžta, kur kalba leidžia, su brūkšneliu, o ne išeina už šoninės juostos. Per ilgi diagramų eilučių pavadinimai sutrumpinami daugtaškiu, o pilnai rodomi užvedus pelę.

Skaičius, kuriuos įrašote į laukelį, galima rašyti su tašku arba kableliu.

## Vertėjams ir kūrėjams {#for-translators-and-developers}

Kodas: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Kaip rašomi skaičiai, sąrašai ir daugiskaitos formos {#how-numbers-lists-and-plurals-are-written}

- **Skaičiai** su dešimtainėmis dalimis (`num`) naudoja kalbos dešimtainį skyriklį ir **nejungia skaitmenų į grupes** – 3108 m atstumas lieka vienu skaičiumi visose kalbose.
- **Sveikieji skaičiai, kurie yra kiekiai ar dydžiai** (`int`) naudoja kalbos skaitmenų grupavimą.
- **Sąrašai** (`list`) jungiami pagal kalbos įpročius: „a, b ir c“, „a, b arba c“, arba vienas po kito su kalbos skyrikliu (pranešimas `common.listSeparator`: „, “ anglų kalba, „、“ japonų ir abiem kinų kalboms).
- **Daugiskaitos formos** seka kalbos taisykles per `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Locale, kurį prašoma `Intl`, yra kalbos žyma, nebent pati žyma suteiktų kitos šalies taisykles: portugalų kalba yra `pt-PT` (Brazilijos taisyklėje 0 yra vienaskaita), norvegų – `nb`, kinų supaprastinta – `zh-CN`, kinų tradicinė – `zh-TW`.

### Katalogai {#the-catalogs}

`src/i18n/locales/<kalba>/<dalis>.json`, po vieną failą kiekvienai peržiūros daliai, tos pačios dalys visose kalbose.

Kiekvienai peržiūros daliai yra po vieną failą (šiandien 30, pavyzdžiui, `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), ir kiekviena kalba turi tą patį rinkinį. Aplankas juos visus išvardija.

Kiekvienas failas yra paprastas JSON objektas: raktas parašytas visas (`"race.ui.laps.load"`), pranešimas – kaip reikšmė. Anglų kalba įkeliama kartu su peržiūra; bet kuri kita kalba parsisiunčiama, kai ji pasirenkama.

**Paieška:** dabartinės kalbos pranešimas, jei jo nėra – anglų, jei nėra ir jo – pats raktas (kūrimo metu konsolė perspėja „i18n: no message …“). Pranešimas, kurio nepavyksta suformuoti, pakeičiamas anglų, todėl sugedęs vertimas niekada nenutraukia peržiūros veikimo.

#### Pranešimų sintaksė {#the-message-syntax}

ICU pranešimų sintaksės dalis, kurią naudoja peržiūra:

| Forma | Pavyzdys | Reikšmė |
|---|---|---|
| `{name}` | `{file} has no rows` | reikšmė įdedama tokia, kokia yra |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | šaka skaičiui pagal kalbos daugiskaitos taisykles arba tiksli `=0`, `=1` …; `#` yra skaičius, parašytas pagal kalbos įpročius |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | šaka žodžiui |

Šakos gali būti įdėtos, o kiekvienas `plural` ir `select` privalo turėti `other` šaką.
Skirtingai nuo pilno ICU, **apostrofas yra tik apostrofas** – automobilių pavadinimuose ir angliškuose savininko linksniuose jų pilna, todėl nieko nereikia kabutėse. Pažodinio `{` ar `}` parašyti negalima.

Pranešimai su reikšmėmis, kurias vertimas privalo išlaikyti: pavadinimai riestinėse skliaustuose užpildomi kodu; `select` žodžiai yra tai, pagal ką kodas parenka (`crash`, `onto-straight`, `yes`/`none`), todėl jie turi likti tokie kaip anglų kalboje; daugiskaitos kategorijos gali skirtis (kalba naudoja savas: lenkų `one`, `few`, `many`, `other`; japonų tik `other`).

### Kaip buvo daryti vertimai ir testai {#how-the-translations-were-made-and-the-tests}

Vertimai buvo daryti DI modeliu iš anglų kalbos, naudojant lenktynių terminų žodyną, o lenktynių tekstai perskaityti dar kartą su įvestomis reikšmėmis. Gimtųjų kalbininkų pataisymai laukiami (žr. žemiau).

`src/i18n/i18n.test.ts` tikrina:

- kad kiekvienas pranešimas, kurio prašo kodas, egzistuoja anglų kalba – kiekvieną `t('…')` kvietimą ir kiekvieną raktą, saugomą lentelėje ir perduodamą `t()` vėliau (raktai, prasidedantys dalies pavadinimu, pavyzdžiui, `app.` ar `heat.`);
- kad pranešimai, kuriuos kodas sudaro iš dalių, egzistuoja: kiekvienos klaidos `label`, `short`, `count` ir `here`, kiekviena automobilių palyginimo savybė, kiekvieno kanalo etiketė;
- kad kiekvienas pranešimas **išsiskaido** (parses) kiekvienoje kalboje;
- kad kiekvienas vertimas **išlaiko anglų pranešimo reikšmes ir pasirinkimus** (nei viena reikšmė nepridėta ar neprarasta; kiekvienas `select` išlaiko savo žodžius);
- kad kiekviena kalba turi **visus** anglų pranešimus ir kad išverstų kalbų rinkinys tiksliai atitinka aukščiau pateiktą sąrašą;
- kad pranešimas rodomas pasirinkta kalba ir krenta atgal į anglų.

### Vertimo taisymas {#correcting-a-translation}

Gimtojo kalbininko pataisymai laukiami – kiekvienas yra viena JSON eilutė.

1. Raskite pranešimą: ieškokite anglų katalogų (`src/i18n/locales/en/`) teksto, kurį matote angliškai (perjunkite rinkiklį į anglų, kad jį perskaitytumėte), ir užsirašykite jo raktą.
2. Atidarykite tą pačią dalį jūsų kalba, pavyzdžiui, `src/i18n/locales/de/race-ui.json`, ir pakeiskite to rakto reikšmę. Išlaikykite kiekvieną `{name}`, išlaikykite `select` žodžius, parašykite daugiskaitos šakas, kurių reikia jūsų kalbai:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Paleiskite `npm test` (arba tiesiog `npx vitest run src/i18n`): testai parodys, ar kuri reikšmė ar pasirinkimas dingo, ar pranešimas nebeišsiskaido.
4. Jei veikia kūrimo serveris, pakeitimas matomas perjungus kalbą (arba perkrovus puslapį).

**Pranešimo pridėjimas** (kode): pirmiausia pridėkite jį prie anglų dalies, tada prie kiekvienos kitos kalbos (testai nepavyks, kol kiekviena jo neturės).

**Kalbos pridėjimas**: pridėkite ją į `LANGUAGES` faile `languages.ts` (jos BCP 47 žyma ir jos pačios vardas, prireikus pseudonimas ar `Intl` locale), ir aplanką `src/i18n/locales/<žyma>/` su visomis dalimis.
