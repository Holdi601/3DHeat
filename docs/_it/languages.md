---
title: "Lingue"
nav_order: 17
lang: "it"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Lingue

Il visualizzatore parla la tua lingua: ogni pulsante, suggerimento e messaggio, e ogni frase dell'analisi di gara e della partita, viene mostrato nella lingua che scegli. Ne conosce 40, e parte dalla lingua del tuo browser quando ce l'ha.

Ci sono tutte le lingue ufficiali dei paesi europei (le 24 dell'UE, e il norvegese, l'islandese, l'ucraino, il russo, il bielorusso, il serbo, il bosniaco, il macedone, l'albanese, il turco, il lussemburghese e il catalano), più il giapponese, il coreano e il cinese semplificato e tradizionale. L'elenco completo: [Elenco delle lingue](ref-languages.md).

L'inglese è la fonte da cui vengono tradotte tutte le altre lingue, ed è ciò a cui ricorre un messaggio mancante.

## Cambiare lingua {#change-the-language}

1. Apri il menu a tendina accanto al nome in alto nella barra laterale. La sua prima voce è **Automatica – <lingua>** (quella del browser, come rilevata adesso); poi ogni lingua con il proprio nome, così trovi la tua anche quando non riesci a leggere quella mostrata.
2. Scegline una. Il cambio è immediato e viene conservato in questo browser. Scegli *Automatica* per dimenticare la scelta.

In una finestra privata, o con l'archiviazione bloccata, la scelta dura fino alla chiusura della pagina.

Cosa fa il cambio:

- ogni etichetta, suggerimento e messaggio viene ridisegnato nella nuova lingua;
- l'analisi di gara viene **rielaborata** in quella lingua (le sue frasi sono costruite
  a partire dalle misure, non tradotte a posteriori), i giri dimostrativi vengono
  rinominati e i grafici vengono ridisegnati;
- numeri, elenchi e plurali seguono la nuova lingua.

## In quale lingua parte {#which-language-it-starts-in}

1. La lingua **scelta** in questo browser, se c'è (conservata in `localStorage`
   sotto `heat3d.language`).
2. Altrimenti quella del **browser**: la prima di `navigator.languages` che il
   visualizzatore parla. Un tag viene abbinato per la sua parte di lingua
   (`de-AT` → `de`), con questi alias: `nb` e `nn` → norvegese (`no`); `zh-TW`, `zh-HK`,
   `zh-MO`, `zh-Hant` e ogni tag con lo script `Hant` → cinese tradizionale;
   `zh-Hans`, `zh-CN`, `zh-SG` e gli altri `zh` → cinese semplificato;
   `cnr` (montenegrino) → serbo.
3. Altrimenti **inglese**.

L'attributo `<html lang>` della pagina viene impostato sulla lingua parlata.

## Numeri, elenchi e plurali {#numbers-lists-and-plurals}

Numeri, elenchi e plurali nel testo del visualizzatore vengono scritti alla maniera della lingua ("3.5" o "3,5", "a, b e c"). Le etichette più lunghe dell'inglese vanno a capo, con sillabazione dove la lingua lo permette, invece di uscire dalla barra laterale. I nomi delle righe dei grafici troppo lunghi vengono troncati con i puntini di sospensione e mostrati per intero al passaggio del mouse.

I numeri che digiti in una casella possono usare il punto o la virgola.

## Per traduttori e sviluppatori {#for-translators-and-developers}

Codice: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Come si scrivono numeri, elenchi e plurali {#how-numbers-lists-and-plurals-are-written}

- I **numeri** con decimali (`num`) usano il separatore decimale della lingua e **nessun
  raggruppamento delle cifre** - una distanza di 3108 m resta un unico numero in ogni lingua.
- I **numeri interi che sono conteggi o dimensioni** (`int`) usano il raggruppamento
  delle cifre della lingua.
- Gli **elenchi** (`list`) sono uniti alla maniera della lingua: "a, b e c", "a, b o
  c", oppure uno dopo l'altro con il separatore proprio della lingua (il messaggio
  `common.listSeparator`: ", " in inglese, "、" in giapponese e in entrambi i cinesi).
- I **plurali** seguono le regole della lingua tramite `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- La localizzazione richiesta a `Intl` è il tag della lingua, tranne dove il solo tag
  otterrebbe le regole di un altro paese: il portoghese è `pt-PT` (il plurale brasiliano
  conta 0 come uno), il norvegese `nb`, il cinese semplificato `zh-CN`, il cinese
  tradizionale `zh-TW`.

### I cataloghi {#the-catalogs}

`src/i18n/locales/<lingua>/<parte>.json`, un file per parte del visualizzatore,
le stesse parti in ogni lingua.

C'è un file per ogni parte del visualizzatore (30 oggi, per esempio `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), e ogni lingua ha lo stesso insieme. La cartella li elenca tutti.

Ogni file è un oggetto JSON piatto: la chiave scritta per intero
(`"race.ui.laps.load"`), il messaggio come valore. L'inglese è incluso nel
visualizzatore; ogni altra lingua viene caricata quando viene scelta.

**Ricerca:** il messaggio della lingua corrente, altrimenti quello inglese, altrimenti
la chiave stessa (in sviluppo la console avvisa "i18n: no message …"). Un messaggio
che non si può formattare ricade su quello inglese, così una traduzione difettosa
non rompe mai il visualizzatore.

#### La sintassi dei messaggi {#the-message-syntax}

La parte della sintassi dei messaggi ICU che usa il visualizzatore:

| Forma | Esempio | Significato |
|---|---|---|
| `{name}` | `{file} has no rows` | un valore inserito così com'è |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | il ramo per il numero secondo le regole plurali della lingua, oppure un esatto `=0`, `=1` …; `#` è il numero scritto alla maniera della lingua |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | il ramo per una parola |

I rami possono essere annidati, e ogni `plural` e `select` deve avere un ramo `other`.
A differenza dell'ICU completo, un **apostrofo è solo un apostrofo** - i nomi delle auto e
i possessivi inglesi ne sono pieni - quindi non serve nessuna virgolettatura. Una `{` o
una `}` letterale non si può scrivere.

Messaggi con valori che una traduzione deve mantenere: i nomi tra parentesi graffe
vengono riempiti dal codice; le parole di un `select` sono quelle con cui il codice
sceglie (`crash`, `onto-straight`, `yes`/`none`) e devono restare come in inglese; le
categorie dei plurali possono differire (una lingua usa le sue: il polacco `one`, `few`,
`many`, `other`; il giapponese solo `other`).

### Come sono state fatte le traduzioni, e i test {#how-the-translations-were-made-and-the-tests}

Le traduzioni sono state fatte con un modello di IA a partire dall'inglese, con un
glossario di termini di corsa, e i testi di gara sono stati riletti una seconda volta
con i valori inseriti. Sono benvenute le correzioni di madrelingua (sotto).

`src/i18n/i18n.test.ts` verifica:

- che ogni messaggio richiesto dal codice esista in inglese - ogni chiamata
  `t('…')`, e ogni chiave conservata in una tabella e passata a `t()` più tardi (chiavi
  che iniziano con il nome di una parte, come `app.` o `heat.`);
- che i messaggi che il codice costruisce a partire dalle parti esistano: ogni
  `label`, `short`, `count` e `here` di ogni errore, ogni tratto di confronto tra auto,
  ogni etichetta di canale;
- che ogni messaggio **si analizzi**, in ogni lingua;
- che ogni traduzione **mantenga i valori e le scelte del messaggio inglese**
  (nessun valore aggiunto o perso; ogni `select` mantiene le sue parole);
- che ogni lingua abbia **tutti** i messaggi inglesi, e che l'insieme delle lingue
  tradotte sia esattamente l'elenco sopra;
- che un messaggio venga detto nella lingua scelta e ricada sull'inglese.

### Correggere una traduzione {#correcting-a-translation}

Le correzioni di un madrelingua sono benvenute - ognuna è una riga di JSON.

1. Trova il messaggio: cerca nei cataloghi inglesi (`src/i18n/locales/en/`) il testo
   che vedi in inglese (imposta il selettore su inglese per leggerlo), e annota la sua chiave.
2. Apri la stessa parte nella tua lingua, per esempio
   `src/i18n/locales/de/race-ui.json`, e cambia il valore di quella chiave. Mantieni
   ogni `{name}`, mantieni le parole del `select`, scrivi i rami dei plurali che la tua
   lingua richiede:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Esegui `npm test` (o solo `npx vitest run src/i18n`): i test dicono se un valore o una
   scelta è andato perso o se un messaggio non si analizza più.
4. Con il server di sviluppo in esecuzione, la modifica si vede dopo aver cambiato lingua
   (o ricaricato la pagina).

**Aggiungere un messaggio** (nel codice): aggiungilo prima alla parte inglese, poi a
ogni altra lingua (i test falliscono finché ognuna non lo ha).

**Aggiungere una lingua**: aggiungila a `LANGUAGES` in `languages.ts` (il suo tag BCP 47
e il suo nome proprio, e un alias o una localizzazione `Intl` se serve), e una cartella
`src/i18n/locales/<tag>/` con tutte le parti.
