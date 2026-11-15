---
title: "Kielet"
nav_order: 17
lang: "fi"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Kielet

Katselija osaa puhua sinun kieltäsi: jokaista painiketta, vihjettä ja viestiä sekä jokaista lausetta kisa- ja ottelu-analyysissä näytetään kielellä, jonka valitset. Kieliä on 40, ja se alkaa selaimesi kielellä, jos sellainen on.

Kaikki Euroopan valtiokielet ovat mukana (EU:n 24 kieltä sekä norja, islanti, ukraina, venäjä, valkovenäjä, serbia, bosnia, makedonia, albania, turkki, luxemburg ja katalaani), ja lisäksi japani, korea sekä yksinkertaistettu ja perinteinen kiina. Koko luettelo: [Kieliluettelo](ref-languages.md).

Englanti on lähde, josta kaikki muut kielet käännetään, ja se on se, mihin puuttuva viesti palautuu.

## Kielen vaihtaminen {#change-the-language}

1. Avaa pudotusvalikko sivupalkin yläreunan nimen vieressä. Sen ensimmäinen kohta on **Automaattinen – <kieli>** (selaimen kieli, sellaisena kuin se on nyt tunnistettu); sen jälkeen jokainen kieli omalla nimellään, jotta löydät oman kielesi, vaikka et osaisi lukea nykyistä.
2. Valitse yksi. Vaihto tapahtuu heti, ja valinta jää tähän selaimeen. Valitse *Automaattinen*, jos haluat unohtaa valinnan.

Yksityisessä ikkunassa tai kun tallennus on estetty, valinta kestää, kunnes sivu suljetaan.

Kielen vaihto tekee seuraavaa:

- jokainen nimike, vihje ja viesti piirtyy uudelleen uudella kielellä;
- kisa-analyysi **lasketaan uudelleen** sillä kielellä (sen lauseet muodostetaan mittauksista, eikä niitä käännetä jälkikäteen), demokierrokset nimetään uudelleen ja kaaviot piirretään uudelleen;
- numerot, luettelot ja monikot noudattavat uutta kieltä.

## Millä kielellä se alkaa {#which-language-it-starts-in}

1. Tässä selaimessa **valittu** kieli, jos sellainen on (tallessa `localStorage`-kohdassa `heat3d.language`).
2. Muuten **selaimen** kieli: ensimmäinen `navigator.languages`-luettelon kieli, jonka katselija osaa. Kielikoodi täsmätään sen kielen osan mukaan (`de-AT` → `de`), ja näillä aliaksilla: `nb` ja `nn` → norja (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` ja mikä tahansa koodi, jossa on `Hant`-kirjoitusjärjestelmä → perinteinen kiina; `zh-Hans`, `zh-CN`, `zh-SG` ja muut `zh` → yksinkertaistettu kiina; `cnr` (montenegro) → serbia.
3. Muuten **englanti**.

Sivun `<html lang>` asetetaan puhutulle kielelle.

## Numerot, luettelot ja monikot {#numbers-lists-and-plurals}

Katselijan tekstin numerot, luettelot ja monikot kirjoitetaan kielen tavalla ("3.5" tai "3,5", "a, b ja c"). Englantia pidemmät nimikkeet rivittyvät, ja ne tavutetaan tavutusta sallivan kielen mukaan, eikä ne jää sivupalkista ulos. Liian pitkät kaavion rivinimet katkaistaan kolmella pisteellä, ja ne näkyvät kokonaan, kun vie osoittimen niiden päälle.

Laatikkoon kirjoittamasi numerot voivat käyttää pistettä tai pilkkua.

## Kääntäjille ja kehittäjille {#for-translators-and-developers}

Koodi: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Miten numerot, luettelot ja monikot kirjoitetaan {#how-numbers-lists-and-plurals-are-written}

- **Desimaalilukuja** (`num`) kirjoitetaan kielen desimaalimerkillä **ilman numeroryhmittelyä** – 3108 m on yksi luku jokaisella kielellä.
- **Kokonaisluvut, jotka ovat määriä tai kokoja** (`int`) käyttävät kielen numeroryhmittelyä.
- **Luettelot** (`list`) yhdistetään kielen tavalla: "a, b ja c", "a, b tai c", tai peräkkäin kielen omalla erottimella (viesti `common.listSeparator`: ", " englanniksi, "、" japaniksi ja molemmissa kiinoissa).
- **Monikot** noudattavat kielen omia sääntöjä `Intl.PluralRules`-rajapinnan kautta (`one`, `two`, `few`, `many`, `other`).
- `Intl`:lle annettava kieliasetus on kielen koodi, paitsi jos pelkkä koodi antaisi toisen maan säännöt: portugali on `pt-PT` (Brasilian monikko laskee 0:n ykköseksi), norja `nb`, yksinkertaistettu kiina `zh-CN`, perinteinen kiina `zh-TW`.

### Käännöskirjastot {#the-catalogs}

`src/i18n/locales/<kieli>/<osa>.json`, yksi tiedosto katselijan osaa kohden, samat osat jokaisella kielellä.

Katselijalla on yksi tiedosto jokaista osaa kohden (tällä hetkellä 30, esimerkiksi `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), ja jokaisella kielellä on sama joukko. Kansio luettelee ne kaikki.

Jokainen tiedosto on tasainen JSON-olio: avain kirjoitettuna kokonaan (`"race.ui.laps.load"`) ja viesti arvona. Englanti on paketoitu katselijan mukaan; muut kielet haetaan, kun ne valitaan.

**Haku:** nykyisen kielen viesti, muuten englanninkielinen, muuten avain itse (kehitystilassa konsoli varoittaa "i18n: no message …"). Viesti, jota ei voi muotoilla, palautuu englanniksi, joten rikkinäinen käännös ei koskaan riko katselijaa.

#### Viestisyntaksi {#the-message-syntax}

Osa ICU-viestisyntaksista, jota katselija käyttää:

| Muoto | Esimerkki | Merkitys |
|---|---|---|
| `{name}` | `{file} has no rows` | arvo, joka annetaan sellaisenaan |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | haara luvulle kielen monikkosääntöjen mukaan, tai tarkka `=0`, `=1` … ; `#` on luku kirjoitettuna kielen tavalla |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | haara sanalle |

Haarat voivat olla sisäkkäin, ja jokaisessa `plural`- ja `select`-kohdassa on oltava `other`-haara. Toisin kuin täydessä ICU:ssa, **heittomerkki on vain heittomerkki** – auton nimet ja englanninkieliset omistusmuodot ovat täynnä niitä, joten mitään ei tarvitse lainausmerkitä. Kirjaimellista `{`- tai `}`-merkkiä ei voi kirjoittaa.

Viestit, joiden arvot käännöksen on säilytettävä: aaltosulkeiden nimet koodi täyttää; `select`-kohdan sanat ovat niitä, joilla koodi valitsee (`crash`, `onto-straight`, `yes`/`none`), ja ne pitää säilyttää englanninkielisinä; monikkoluokat voivat erota (kieli käyttää omiaan: puola `one`, `few`, `many`, `other`; japani vain `other`).

### Miten käännökset tehtiin, ja testit {#how-the-translations-were-made-and-the-tests}

Käännökset tehtiin englannin kielestä tekoälymallilla ja kilpailuterminologian sanaluettelolla, ja kisatekstit luettiin läpi toisen kerran täytettyine arvoineen. Äidinkielisten korjaukset ovat tervetulleita (alla).

`src/i18n/i18n.test.ts` tarkistaa:

- että jokainen viesti, jonka koodi pyytää, on olemassa englanniksi – jokainen `t('…')`-kutsu sekä jokainen taulukkoon tallennettu ja myöhemmin `t()`:lle annettu avain (avaimet, jotka alkavat osan nimellä, kuten `app.` tai `heat.`);
- että viestit, jotka koodi rakentaa osista, ovat olemassa: jokaisen virheen `label`, `short`, `count` ja `here`, jokainen auton vertailuominaisuus ja jokaisen kanavan nimi;
- että jokainen viesti **jäsentyy** jokaisella kielellä;
- että jokainen käännös **säilyttää englanninkielisen viestin arvot ja valinnat** (ei arvoa lisätä tai menetetä; jokainen `select` säilyttää sanansa);
- että jokaisella kielellä on **kaikki** englanninkieliset viestit, ja että käännettyjen kielten joukko on täsmälleen yllä oleva luettelo;
- että viesti näytetään valitulla kielellä ja palautuu englanniksi.

### Käännöksen korjaaminen {#correcting-a-translation}

Äidinkieliseltä puhujalta tulevat korjaukset ovat tervetulleita – jokainen on yksi JSON-rivi.

1. Etsi viesti: hae englanninkielisistä kirjastoista (`src/i18n/locales/en/`) teksti, jonka näet englanniksi (vaihda valitsin englantiin, jotta näet sen), ja merkitse sen avain.
2. Avaa sama osa omalla kielelläsi, esimerkiksi `src/i18n/locales/de/race-ui.json`, ja muuta avaimen arvo. Säilytä jokainen `{name}`, säilytä `select`-sanat ja kirjoita kielesi tarvitsemat monikkohaarat:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Aja `npm test` (tai pelkkä `npx vitest run src/i18n`): testit kertovat, jos arvo tai valinta on kadonnut tai viesti ei enää jäsenny.
4. Kun kehityspalvelin on käynnissä, muutos näkyy, kun vaihdat kielen (tai lataat sivun uudelleen).

**Viestin lisääminen** (koodissa): lisää se ensin englanninkieliseen osaan ja sen jälkeen jokaiseen muuhun kieleen (testit epäonnistuvat, kunnes jokaisessa on se).

**Kielen lisääminen**: lisää se `LANGUAGES`-listaan tiedostossa `languages.ts` (sen BCP 47 -koodi ja oma nimi sekä tarvittaessa alias tai `Intl`-kieliasetus), ja kansio `src/i18n/locales/<koodi>/` kaikilla osilla.
