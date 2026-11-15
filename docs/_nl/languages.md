---
title: "Talen"
nav_order: 17
lang: "nl"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Talen

De viewer kan jouw taal spreken: elke knop, hint en melding, en elke zin van de race- en matchanalyse, wordt getoond in de taal die je kiest. Hij kent er 40, en begint in de taal van je browser als die er een heeft.

Alle staatstalen van Europa zijn er (de 24 van de EU, en Noors, IJslands, Oekraïens, Russisch, Wit-Russisch, Servisch, Bosnisch, Macedonisch, Albanees, Turks, Luxemburgs en Catalaans), plus Japans, Koreaans, en Chinees vereenvoudigd en traditioneel. De volledige lijst: [Taallijst](ref-languages.md).

Engels is de bron waaruit elke andere taal is vertaald, en de tekst waarop een ontbrekend bericht terugvalt.

## De taal wijzigen {#change-the-language}

1. Open de keuzelijst naast de naam bovenaan de zijbalk. Het eerste item is **Automatisch – <taal>** (die van de browser, zoals hij nu wordt herkend); daarna elke taal in zijn eigen naam, zodat je de jouwe kunt vinden, ook als je de getoonde taal niet kunt lezen.
2. Kies er één. Hij wisselt meteen en wordt in deze browser bewaard. Kies *Automatisch* om de keuze te vergeten.

In een privévenster of wanneer opslag is geblokkeerd, geldt de keuze tot de pagina wordt gesloten.

Wat wisselen doet:

- elk label, hint en bericht wordt in de nieuwe taal opnieuw weergegeven;
- de race-analyse wordt in die taal **opnieuw uitgerekend** (haar zinnen worden uit de metingen opgebouwd, niet achteraf vertaald), de demoronden krijgen een nieuwe naam, en de grafieken worden opnieuw getekend;
- getallen, lijsten en meervouden volgen de nieuwe taal.

## In welke taal hij begint {#which-language-it-starts-in}

1. De **gekozen** taal in deze browser, als die er is (bewaard in `localStorage` onder `heat3d.language`).
2. Anders die van de **browser**: de eerste van `navigator.languages` die de viewer spreekt. Een tag wordt op zijn taaldeel gevonden (`de-AT` → `de`), met deze aliassen: `nb` en `nn` → Noors (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` en elke tag met het schrift `Hant` → traditioneel Chinees; `zh-Hans`, `zh-CN`, `zh-SG` en andere `zh` → vereenvoudigd Chinees; `cnr` (Montenegrijns) → Servisch.
3. Anders **Engels**.

Het `<html lang>`-attribuut van de pagina wordt op de gesproken taal gezet.

## Getallen, lijsten en meervouden {#numbers-lists-and-plurals}

Getallen, lijsten en meervouden in de tekst van de viewer worden geschreven zoals het in de taal hoort ("3.5" of "3,5", "a, b en c"). Labels die langer zijn dan het Engels, breken over de regels, met een koppelteken waar de taal dat toestaat, in plaats van buiten de zijbalk te lopen. Te lange namen van grafiekrijen worden ingekort met een ellips en volledig getoond bij aanwijzen.

Getallen die je in een vak typt, mogen een punt of een komma gebruiken.

## Voor vertalers en ontwikkelaars {#for-translators-and-developers}

Code: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts) ([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts), [`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts), [`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)), [`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Hoe getallen, lijsten en meervouden worden geschreven {#how-numbers-lists-and-plurals-are-written}

- **Getallen** met decimalen (`num`) gebruiken het decimaalteken van de taal en **geen cijfergroepering** - een afstand van 3108 m blijft in elke taal één getal.
- **Hele getallen die tellingen of afmetingen zijn** (`int`) gebruiken de cijfergroepering van de taal.
- **Lijsten** (`list`) worden samengevoegd op de manier van de taal: "a, b en c", "a, b of c", of na elkaar met het eigen scheidingsteken van de taal (het bericht `common.listSeparator`: ", " in het Engels, "、" in het Japans en beide Chinese talen).
- **Meervouden** volgen de eigen regels van de taal via `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- De locale die aan `Intl` wordt gevraagd, is de tag van de taal, behalve waar de tag alleen de regels van een ander land zou krijgen: Portugees is `pt-PT` (het Braziliaanse meervoud telt 0 als één), Noors `nb`, vereenvoudigd Chinees `zh-CN`, traditioneel `zh-TW`.

### De catalogi {#the-catalogs}

`src/i18n/locales/<taal>/<deel>.json`, één bestand per deel van de viewer, dezelfde delen in elke taal.

Er is één bestand per deel van de viewer (vandaag 30, bijvoorbeeld `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), en elke taal heeft dezelfde set. De map somt ze allemaal op.

Elk bestand is een platte JSON-object: de sleutel voluit geschreven (`"race.ui.laps.load"`), het bericht als waarde. Engels zit in de viewer ingebouwd; elke andere taal wordt opgehaald wanneer hij gekozen wordt.

**Opzoeken:** het bericht van de huidige taal, anders het Engelse, anders de sleutel zelf (in de ontwikkelomgeving waarschuwt de console "i18n: no message …"). Een bericht dat niet kan worden opgemaakt, valt terug op het Engelse, zodat een kapotte vertaling de viewer nooit breekt.

#### De syntaxis van berichten {#the-message-syntax}

Het deel van de ICU-berichtsyntaxis dat de viewer gebruikt:

| Vorm | Voorbeeld | Betekenis |
|---|---|---|
| `{naam}` | `{file} has no rows` | een waarde die ongewijzigd wordt ingevuld |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | de tak voor het getal volgens de meervoudsregels van de taal, of een exacte `=0`, `=1` ...; `#` is het getal, geschreven zoals de taal dat doet |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | de tak voor een woord |

Takken kunnen in elkaar genest zijn, en elke `plural` en `select` moet een tak `other` hebben. Anders dan bij volledige ICU is een **apostrof gewoon een apostrof** - autonamen en Engelse bezittelijke vormen zitten er vol mee - dus niets hoeft te worden aangehaald. Een letterlijke `{` of `}` kan niet worden geschreven.

Berichten met waarden die een vertaling moet behouden: de namen tussen accolades worden door de code ingevuld; de woorden van een `select` zijn wat de code kiest (`crash`, `onto-straight`, `yes`/`none`) en moeten zoals in het Engels blijven; de meervoudscategorieën mogen verschillen (een taal gebruikt de eigen: Pools `one`, `few`, `many`, `other`; Japans alleen `other`).

### Hoe de vertalingen zijn gemaakt, en de tests {#how-the-translations-were-made-and-the-tests}

De vertalingen zijn met een AI-model uit het Engels gemaakt, met een woordenlijst van raceterm, en de racetekst is nog een tweede keer gelezen met de waarden ingevuld. Correcties door moedertaalsprekers zijn welkom (hieronder).

`src/i18n/i18n.test.ts` controleert:

- dat elk bericht dat de code vraagt, in het Engels bestaat - elke `t('…')`-aanroep, en elke sleutel die in een tabel wordt bewaard en later aan `t()` wordt gegeven (sleutels die beginnen met de naam van een deel, zoals `app.` of `heat.`);
- dat de berichten die de code uit delen bouwt, bestaan: elk `label`, `short`, `count` en `here` van elke fout, elke eigenschap van een autovergelijking, elk label van elk kanaal;
- dat elk bericht in elke taal **ontleedt**;
- dat elke vertaling **de waarden en keuzes van het Engelse bericht behoudt** (geen waarde toegevoegd of verloren; elke `select` behoudt zijn woorden);
- dat elke taal **elk** Engels bericht heeft, en dat de set vertaalde talen precies de lijst hierboven is;
- dat een bericht in de gekozen taal wordt gezegd en terugvalt op het Engels.

### Een vertaling corrigeren {#correcting-a-translation}

Correcties van een moedertaalspreker zijn welkom - elk is één regel JSON.

1. Zoek het bericht: zoek in de Engelse catalogi (`src/i18n/locales/en/`) naar de tekst die je in het Engels ziet (zet de keuzelijst op Engels om hem te lezen), en noteer de sleutel.
2. Open hetzelfde deel in jouw taal, bijvoorbeeld `src/i18n/locales/de/race-ui.json`, en wijzig de waarde van die sleutel. Behoud elke `{naam}` erin, behoud de `select`-woorden, schrijf de meervoudstakken die jouw taal nodig heeft:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Voer `npm test` uit (of alleen `npx vitest run src/i18n`): de tests zeggen of een waarde of keuze ontbreekt, of een bericht niet meer ontleedt.
4. Met de ontwikkelserver draaiend, is de wijziging zichtbaar na het wisselen van taal (of het herladen).

**Een bericht toevoegen** (in de code): voeg het eerst toe aan het Engelse deel, daarna aan elke andere taal (de tests falen tot elke taal het heeft).

**Een taal toevoegen**: voeg hem toe aan `LANGUAGES` in `languages.ts` (zijn BCP 47-tag en zijn eigen naam, en een alias of een `Intl`-locale indien nodig), en een map `src/i18n/locales/<tag>/` met alle delen.
