---
title: "Języki"
nav_order: 17
lang: "pl"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Języki

Widok mówi w twoim języku: każdy przycisk, podpowiedź i komunikat oraz każde zdanie analizy wyścigu i meczu są pokazane w języku, który wybierzesz. Widok zna 40 języków i startuje w języku przeglądarki, jeśli go ma.

Obsługiwane są wszystkie języki państwowe Europy (24 języki UE oraz norweski, islandzki, ukraiński, rosyjski, białoruski, serbski, bośniacki, macedoński, albański, turecki, luksemburski i kataloński), a także japoński, koreański oraz chiński uproszczony i tradycyjny. Pełna lista: [Lista języków](ref-languages.md).

Angielski jest językiem źródłowym, z którego tłumaczy się wszystkie pozostałe, i to na nim wyświetla się komunikat, gdy brakuje tłumaczenia.

## Zmień język {#change-the-language}

1. Otwórz listę rozwijaną obok nazwy na górze paska bocznego. Jej pierwszą pozycją jest **Automatycznie - <język>** (język przeglądarki, wykryty teraz). Dalej jest każdy język nazwany w nim samym, więc znajdziesz swój, nawet gdy nie umiesz czytać tego, który jest pokazany.
2. Wybierz jeden. Przełączenie następuje od razu i zostaje zapamiętane w tej przeglądarce. Wybierz *Automatycznie*, by zapomnieć wybór.

W oknie prywatnym albo przy zablokowanym zapisie wybór trwa do zamknięcia strony.

Co robi przełączenie:

- każda etykieta, podpowiedź i komunikat są rysowane ponownie w nowym języku;
- analiza wyścigu jest **liczona od nowa** w tym języku (jej zdania powstają z pomiarów, a nie są tłumaczone po fakcie), okrążenia demo są przemianowane, a wykresy rysowane od nowa;
- liczby, listy i liczba mnogiej stosują się do nowego języka.

## W jakim języku startuje {#which-language-it-starts-in}

1. Język **wybrany** w tej przeglądarce, jeśli jest (zapisany w `localStorage` pod kluczem `heat3d.language`).
2. Inaczej język **przeglądarki**: pierwszy z `navigator.languages`, który widok zna. Znacznik dopasowuje się po części językowej (`de-AT` → `de`). Działają te aliasy: `nb` i `nn` → norweski (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` i każdy znacznik ze skryptem `Hant` → chiński tradycyjny; `zh-Hans`, `zh-CN`, `zh-SG` i inne `zh` → chiński uproszczony; `cnr` (czarnogórski) → serbski.
3. Inaczej **angielski**.

Atrybut `<html lang>` strony ustawia się na wybrany język.

## Liczby, listy i liczba mnoga {#numbers-lists-and-plurals}

Liczby, listy i liczba mnoga w tekście widoku są zapisywane po sposobie danego języka („3,5” albo „3.5”, „a, b i c”). Etykiety dłuższe niż w angielskim zawijają się, z dzieleniem wyrazów tam, gdzie język na to pozwala, zamiast wychodzić poza pasek boczny. Za długie nazwy wierszy na wykresach są skracane wielokropkiem, a w pełnej postaci pokazują się po najechaniu.

Liczby wpisywane w polu mogą mieć kropkę albo przecinek.

## Dla tłumaczy i programistów {#for-translators-and-developers}

Kod: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Jak zapisuje się liczby, listy i liczbę mnogą {#how-numbers-lists-and-plurals-are-written}

- **Liczby** z częścią dziesiętną (`num`) używają znaku dziesiętnego danego języka i **bez grupowania cyfr**. Odległość 3108 m zostaje jedną liczbą w każdym języku.
- **Liczby całkowite, które są liczbami lub rozmiarami** (`int`), używają grupowania cyfr danego języka.
- **Listy** (`list`) są łączone po sposobie danego języka: „a, b i c”, „a, b lub c” albo jedna po drugiej z własnym separatorem języka (komunikat `common.listSeparator`: „, ” po angielsku, „、” po japońsku i w obu chińskich).
- **Liczba mnoga** stosuje reguły danego języka przez `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Lokalizacja podawana `Intl` to znacznik języka, chyba że sam znacznik dałby reguły innego kraju. Portugalski to `pt-PT` (liczba mnoga w Brazylii traktuje 0 jak jeden), norweski `nb`, chiński uproszczony `zh-CN`, tradycyjny `zh-TW`.

### Katalogi tekstów {#the-catalogs}

`src/i18n/locales/<język>/<część>.json`, jeden plik na każdą część widoku, te same części we wszystkich językach.

Jest jeden plik na każdą część widoku (dziś 30, na przykład `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), a każdy język ma ten sam zestaw. Folder wymienia je wszystkie.

Każdy plik to płaski obiekt JSON: klucz zapisany w całości (`"race.ui.laps.load"`), a komunikat jako wartość. Angielski jest dołączony do widoku; każdy inny język jest pobierany po wybraniu.

**Wyszukiwanie:** komunikat bieżącego języka, potem angielski, potem sam klucz (w trybie deweloperskim konsola pisze „i18n: no message …”). Komunikat, którego nie da się sformatować, wraca do angielskiego, więc zepsute tłumaczenie nigdy nie psuje widoku.

#### Składnia komunikatów {#the-message-syntax}

Część składni komunikatów ICU, której używa widok:

| Forma | Przykład | Znaczenie |
|---|---|---|
| `{name}` | `{file} has no rows` | wartość wstawiona tak, jak jest |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | gałąź dla liczby według reguł liczby mnogiej języka albo dokładne `=0`, `=1` …; `#` to liczba zapisana po sposobie języka |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | gałąź dla słowa |

Gałęzie można zagnieżdżać, a każde `plural` i `select` musi mieć gałąź `other`. W przeciwieństwie do pełnego ICU **apostrof to tylko apostrof**. Nazwy samochodów i angielskie dzierżawcze są pełne apostrofów, więc nic nie trzeba cytować. Dosłownego `{` ani `}` nie da się zapisać.

Komunikaty z wartościami, które tłumaczenie musi zachować: nazwy w nawiasach klamrowych wypełnia kod; słowa w `select` to to, według czego kod wybiera (`crash`, `onto-straight`, `yes`/`none`) i muszą zostać takie jak po angielsku; kategorie liczby mnogiej mogą się różnić (każdy język używa własnych: polski `one`, `few`, `many`, `other`; japoński tylko `other`).

### Jak powstały tłumaczenia i testy {#how-the-translations-were-made-and-the-tests}

Tłumaczenia zostały wykonane przez model AI z angielskiego, ze słowniczkiem terminów wyścigowych, a teksty wyścigu przeczytano drugi raz z wypełnionymi wartościami. Poprawki od native speakerów są mile widziane (niżej).

`src/i18n/i18n.test.ts` sprawdza:

- czy każdy komunikat, o który prosi kod, istnieje po angielsku: każde wywołanie `t('…')` oraz każdy klucz trzymany w tabeli i przekazany później do `t()` (klucze zaczynające się nazwą części, jak `app.` albo `heat.`);
- czy komunikaty budowane przez kod z części istnieją: `label`, `short`, `count` i `here` każdego błędu, każda cecha porównania samochodów, etykieta każdego kanału;
- czy każdy komunikat **daje się przeanalizować** we każdym języku;
- czy każde tłumaczenie **zachowuje wartości i wybory angielskiego komunikatu** (żadna wartość nie dodana ani zgubiona; każde `select` zachowuje swoje słowa);
- czy każdy język ma **każdy** angielski komunikat i czy zbiór tłumaczonych języków jest dokładnie taki, jak lista powyżej;
- czy komunikat jest wypowiadany w wybranym języku i wraca do angielskiego.

### Poprawianie tłumaczenia {#correcting-a-translation}

Poprawki native speakerów są mile widziane. Każda to jedna linia JSON.

1. Znajdź komunikat: przeszukaj angielskie katalogi (`src/i18n/locales/en/`) pod kątem tekstu, który widzisz (przełącz wybór na angielski, by go przeczytać), i zanotuj jego klucz.
2. Otwórz tę samą część w swoim języku, np. `src/i18n/locales/de/race-ui.json`, i zmień wartość tego klucza. Zachowaj każde `{name}`, zachowaj słowa `select` i napisz gałęzie liczby mnogiej, których potrzebuje twój język:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Uruchom `npm test` (albo samo `npx vitest run src/i18n`). Testy powiedzą, czy wartość albo wybór zaginęły albo czy komunikat przestał się parsować.
4. Przy działającym serwerze deweloperskim zmiana pojawi się po przełączeniu języka (albo przeładowaniu).

**Dodawanie komunikatu** (w kodzie): najpierw dodaj go do części angielskiej, potem do każdego innego języka (testy nie przejdą, dopóki każdy go nie ma).

**Dodawanie języka**: dodaj go do `LANGUAGES` w `languages.ts` (jego znacznik BCP 47, jego własna nazwa, a w razie potrzeby alias albo lokalizacja `Intl`) oraz folder `src/i18n/locales/<znacznik>/` ze wszystkimi częściami.
