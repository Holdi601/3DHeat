---
title: "Sprachen"
nav_order: 17
lang: "de"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Sprachen

Der Viewer spricht deine Sprache: jeder Knopf, jeder Hinweis und jede Meldung sowie jeder Satz der Rennanalyse und der Match-Analyse wird in der Sprache angezeigt, die du wählst. Er kennt 40 Sprachen und startet in der Sprache deines Browsers, wenn er sie hat.

Alle Amtssprachen Europas sind dabei (die 24 der EU sowie Norwegisch, Isländisch, Ukrainisch, Russisch, Belarussisch, Serbisch, Bosnisch, Mazedonisch, Albanisch, Türkisch, Luxemburgisch und Katalanisch), dazu Japanisch, Koreanisch sowie Chinesisch vereinfacht und traditionell. Die ganze Liste: [Sprachliste](ref-languages.md).

Englisch ist die Quelle, aus der jede andere Sprache übersetzt wird, und dorthin fällt eine fehlende Meldung zurück.

## Sprache wechseln {#change-the-language}

1. Öffne die Auswahlliste neben dem Namen oben in der Seitenleiste. Ihr erster Eintrag ist **Automatisch – <Sprache>** (die des Browsers, wie sie jetzt erkannt wird); danach kommt jede Sprache mit ihrem eigenen Namen, damit du deine auch findest, wenn du die angezeigte nicht lesen kannst.
2. Wähle eine aus. Sie wechselt sofort und wird in diesem Browser gespeichert. Wähle *Automatisch*, um die Wahl zu vergessen.

In einem privaten Fenster oder wenn der Speicher gesperrt ist, gilt die Wahl nur bis die Seite geschlossen wird.

Was der Wechsel bewirkt:

- jede Beschriftung, jeder Hinweis und jede Meldung wird in der neuen Sprache neu angezeigt;
- die Rennanalyse wird in ihr **neu berechnet** (ihre Sätze entstehen aus den Messwerten, nicht aus einer nachträglichen Übersetzung), die Demo-Runden werden umbenannt, und die Diagramme werden neu gezeichnet;
- Zahlen, Listen und Pluralformen richten sich nach der neuen Sprache.

## Mit welcher Sprache es startet {#which-language-it-starts-in}

1. Die **gewählte** Sprache in diesem Browser, falls es eine gibt (gespeichert in `localStorage` unter `heat3d.language`).
2. Sonst die **des Browsers**: die erste von `navigator.languages`, die der Viewer spricht. Ein Sprachcode wird über seinen Sprachteil zugeordnet (`de-AT` → `de`), mit diesen Alias-Namen: `nb` und `nn` → Norwegisch (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` und jeder Code mit dem Schriftsystem `Hant` → traditionelles Chinesisch; `zh-Hans`, `zh-CN`, `zh-SG` und andere `zh` → vereinfachtes Chinesisch; `cnr` (Montenegrinisch) → Serbisch.
3. Sonst **Englisch**.

Das `<html lang>` der Seite wird auf die gesprochene Sprache gesetzt.

## Zahlen, Listen und Pluralformen {#numbers-lists-and-plurals}

Zahlen, Listen und Pluralformen im Text des Viewers werden nach den Regeln der Sprache geschrieben („3.5“ oder „3,5“, „a, b und c“). Beschriftungen, die länger als im Englischen sind, brechen um, wo die Sprache es erlaubt, mit Bindestrich, statt aus der Seitenleiste zu laufen. Zu lange Namen von Diagrammzeilen werden mit Auslassungspunkten gekürzt und beim Darüberfahren ganz angezeigt.

Zahlen, die du in ein Feld eintippst, dürfen einen Punkt oder ein Komma haben.

## Für Übersetzer und Entwickler {#for-translators-and-developers}

Code: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### So werden Zahlen, Listen und Pluralformen geschrieben {#how-numbers-lists-and-plurals-are-written}

- **Zahlen** mit Nachkommastellen (`num`) nutzen das Dezimalzeichen der Sprache und **keine Ziffern-Gruppierung** - eine Entfernung von 3108 m bleibt in jeder Sprache eine einzige Zahl.
- **Ganze Zahlen, die Anzahlen oder Größen sind** (`int`), nutzen die Ziffern-Gruppierung der Sprache.
- **Listen** (`list`) werden auf die Art der Sprache verbunden: „a, b und c“, „a, b oder c“, oder nacheinander mit dem eigenen Trennzeichen der Sprache (die Meldung `common.listSeparator`: „, “ im Englischen, „、“ im Japanischen und in beiden Chinesisch).
- **Pluralformen** folgen den eigenen Regeln der Sprache über `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- Das Gebietsschema, das an `Intl` übergeben wird, ist der Sprachcode der Sprache, außer wo der Code allein andere Länderregeln nehmen würde: Portugiesisch ist `pt-PT` (die brasilianische Pluralregel zählt 0 als one), Norwegisch `nb`, vereinfachtes Chinesisch `zh-CN`, traditionelles `zh-TW`.

### Die Kataloge {#the-catalogs}

`src/i18n/locales/<Sprache>/<Teil>.json`, eine Datei pro Teil des Viewers, dieselben Teile in jeder Sprache.

Es gibt eine Datei pro Teil des Viewers (heute 30, zum Beispiel `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), und jede Sprache hat dieselbe Menge. Der Ordner listet sie alle auf.

Jede Datei ist ein flaches JSON-Objekt: der vollständige Schlüssel (`"race.ui.laps.load"`) und die Meldung als Wert. Englisch ist im Viewer enthalten; jede andere Sprache wird geladen, wenn sie gewählt wird.

**Suche:** die Meldung der aktuellen Sprache, sonst die englische, sonst der Schlüssel selbst (in der Entwicklung warnt die Konsole „i18n: no message …“). Eine Meldung, die sich nicht formatieren lässt, fällt auf die englische zurück, so dass eine fehlerhafte Übersetzung den Viewer nie zerbricht.

#### Die Syntax der Meldungen {#the-message-syntax}

Der Teil der ICU-Meldungssyntax, den der Viewer nutzt:

| Form | Beispiel | Bedeutung |
|---|---|---|
| `{name}` | `{file} has no rows` | ein Wert, der unverändert eingesetzt wird |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | der Zweig für die Zahl nach den Pluralregeln der Sprache, oder ein genauer `=0`, `=1` …; `#` ist die Zahl, so geschrieben, wie es die Sprache verlangt |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | der Zweig für ein Wort |

Zweige können verschachtelt werden, und jedes `plural` und `select` braucht einen `other`-Zweig. Anders als im vollen ICU ist ein **Apostroph nur ein Apostroph** - Autonamen und englische Possessive sind voll davon -, deshalb muss nichts in Anführungszeichen gesetzt werden. Eine wörtliche `{` oder `}` kann nicht geschrieben werden.

Meldungen mit Werten, die eine Übersetzung behalten muss: Die Namen in geschweiften Klammern werden vom Code eingesetzt; die Wörter eines `select` sind das, wonach der Code auswählt (`crash`, `onto-straight`, `yes`/`none`), und sie müssen wie im Englischen bleiben; die Pluralkategorien dürfen sich unterscheiden (eine Sprache nutzt ihre eigenen: Polnisch `one`, `few`, `many`, `other`; Japanisch nur `other`).

### Wie die Übersetzungen entstanden und die Tests {#how-the-translations-were-made-and-the-tests}

Die Übersetzungen wurden mit einem KI-Modell aus dem Englischen erstellt, mit einem Glossar der Rennbegriffe; die Renntexte wurden mit eingesetzten Werten ein zweites Mal gelesen. Korrekturen von Muttersprachlern sind willkommen (siehe unten).

`src/i18n/i18n.test.ts` prüft:

- dass jede Meldung, die der Code verlangt, im Englischen existiert - jeder Aufruf `t('…')` und jeder Schlüssel, der in einer Tabelle gehalten und später an `t()` übergeben wird (Schlüssel, die mit dem Namen eines Teils beginnen, etwa `app.` oder `heat.`);
- dass die Meldungen, die der Code aus Teilen baut, existieren: jedes `label`, `short`, `count` und `here` eines Fehlers, jede Eigenschaft eines Fahrzeugvergleichs, jede Beschriftung eines Kanals;
- dass jede Meldung **sich parsen lässt**, in jeder Sprache;
- dass jede Übersetzung **die Werte und Auswahlmöglichkeiten der englischen Meldung behält** (kein Wert hinzugefügt oder verloren; jedes `select` behält seine Wörter);
- dass jede Sprache **jede** englische Meldung hat und dass die Menge der übersetzten Sprachen genau der obigen Liste entspricht;
- dass eine Meldung in der gewählten Sprache gezeigt wird und auf Englisch zurückfällt.

### Eine Übersetzung korrigieren {#correcting-a-translation}

Korrekturen eines Muttersprachlers sind willkommen - jede ist eine Zeile JSON.

1. Finde die Meldung: Suche in den englischen Katalogen (`src/i18n/locales/en/`) nach dem Text, den du siehst (stelle die Auswahl auf Englisch, um ihn zu lesen), und notiere ihren Schlüssel.
2. Öffne denselben Teil in deiner Sprache, z. B. `src/i18n/locales/de/race-ui.json`, und ändere den Wert dieses Schlüssels. Behalte jedes `{name}` darin, behalte die Wörter des `select`, schreibe die Pluralzweige, die deine Sprache braucht:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Führe `npm test` aus (oder nur `npx vitest run src/i18n`): Die Tests sagen dir, ob ein Wert oder eine Auswahl verloren gegangen ist oder eine Meldung nicht mehr parst.
4. Wenn der Dev-Server läuft, zeigt sich die Änderung nach dem Wechsel der Sprache (oder nach einem Neuladen).

**Eine Meldung hinzufügen** (im Code): Füge sie zuerst dem englischen Teil hinzu, dann jeder anderen Sprache (die Tests schlagen fehl, bis jede sie hat).

**Eine Sprache hinzufügen**: Trage sie in `LANGUAGES` in `languages.ts` ein (ihr BCP-47-Code und ihr eigener Name, dazu ein Alias oder ein `Intl`-Gebietsschema, falls nötig) und einen Ordner `src/i18n/locales/<Code>/` mit allen Teilen.
