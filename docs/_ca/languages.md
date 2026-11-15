---
title: "Idiomes"
nav_order: 17
lang: "ca"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Idiomes

El visor pot parlar el teu idioma: cada botó, indicació i missatge, i cada frase de l'anàlisi de carrera i de partida, es mostra en l'idioma que triïs. En coneix 40, i comença amb l'idioma del teu navegador quan el té.

Hi són tots els idiomes oficials d'Europa (els 24 de la UE, i també el noruec, l'islandès, l'ucraïnès, el rus, el bielorús, el serbi, el bosnià, el macedoni, l'albanès, el turc, el luxemburguès i el català), a més del japonès, el coreà, i el xinès simplificat i tradicional. La llista completa: [Llista d'idiomes](ref-languages.md).

L'anglès és la font de la qual es tradueix tot el demés, i també el text de reserva quan falta un missatge.

## Canviar l'idioma {#change-the-language}

1. Obre la llista desplegable al costat del nom a la part de dalt de la barra lateral. La primera entrada és **Automàtic - <idioma>** (el del navegador, tal com es detecta ara); després cada idioma pel seu propi nom, perquè puguis trobar el teu fins i tot si no pots llegir l'idioma que es mostra.
2. Tria'n un. Canvia a l'instant i es guarda en aquest navegador. Tria *Automàtic* per oblidar l'elecció.

En una finestra privada o amb l'emmagatzematge bloquejat, l'elecció dura fins que es tanca la pàgina.

Què fa canviar:

- cada etiqueta, indicació i missatge es torna a mostrar en el nou idioma;
- l'anàlisi de carrera es **torna a calcular** en aquest idioma (les seves frases es construeixen
  a partir de les mesures, no es tradueixen a posteriori), els giros de la demo es
  reanomenen, i els gràfics es tornen a dibuixar;
- els números, les llistes i els plurals segueixen el nou idioma.

## En quin idioma comença {#which-language-it-starts-in}

1. L'idioma **triat** en aquest navegador, si n'hi ha (guardat a `localStorage`
   sota `heat3d.language`).
2. Si no, el **del navegador**: el primer de `navigator.languages` que el visor
   parla. Una etiqueta es fa coincidir per la seva part d'idioma (`de-AT` → `de`), amb
   aquests àlies: `nb` i `nn` → noruec (`no`); `zh-TW`, `zh-HK`,
   `zh-MO`, `zh-Hant` i qualsevol etiqueta amb l'escriptura `Hant` → xinès
   tradicional; `zh-Hans`, `zh-CN`, `zh-SG` i altres `zh` → xinès
   simplificat; `cnr` (montenegrí) → serbi.
3. Si no, **anglès**.

L'`<html lang>` de la pàgina es posa a l'idioma parlat.

## Números, llistes i plurals {#numbers-lists-and-plurals}

Els números, les llistes i els plurals del text del visor s'escriuen a la manera de l'idioma ("3,5" o "3.5", "a, b i c"). Les etiquetes més llargues que l'anglès es fan salts de línia, amb guionet on l'idioma ho permet, en lloc de sortir de la barra lateral. Els noms de fila dels gràfics que són massa llargs es tallen amb punts suspensius i es mostren sencers en passar-hi el ratolí per sobre.

Els números que escrius en una caixa poden usar un punt o una coma.

## Per a traductors i desenvolupadors {#for-translators-and-developers}

Codi: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Com s'escriuen els números, les llistes i els plurals {#how-numbers-lists-and-plurals-are-written}

- Els **números** amb decimals (`num`) fan servir el separador decimal de l'idioma i **cap
  agrupació de dígits** - una distància de 3108 m es manté com un sol número en cada idioma.
- Els **números sencers que són recomptes o mides** (`int`) fan servir l'agrupació de dígits
  de l'idioma.
- Les **llistes** (`list`) s'uneixen a la manera de l'idioma: "a, b i c", "a, b o
  c", o una darrere l'altra amb el separador propi de l'idioma (el missatge
  `common.listSeparator`: ", " en anglès, "、" en japonès i en tots dos xinesos).
- Els **plurals** segueixen les regles pròpies de l'idioma a través de `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- La configuració regional demanada a `Intl` és l'etiqueta de l'idioma, excepte quan
  l'etiqueta sola donaria les regles d'un altre país: el portuguès és `pt-PT` (el plural
  del Brasil compta el 0 com a un), el noruec `nb`, el xinès simplificat `zh-CN`,
  el xinès tradicional `zh-TW`.

### Els catàlegs {#the-catalogs}

`src/i18n/locales/<idioma>/<part>.json`, un fitxer per cada part del visor,
les mateixes parts en cada idioma.

Hi ha un fitxer per cada part del visor (30 avui, per exemple `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), i cada idioma té el mateix conjunt. La carpeta els llista tots.

Cada fitxer és un objecte JSON pla: la clau escrita sencera
(`"race.ui.laps.load"`), el missatge com a valor. L'anglès va inclòs amb el
visor; qualsevol altre idioma es descarrega quan es tria.

**Cerca:** el missatge de l'idioma actual, si no el de l'anglès, si no la mateixa
clau (en desenvolupament la consola avisa "i18n: no message …"). Un missatge que no es pot
formatar torna a l'anglès, de manera que una traducció trencada mai no trenca el visor.

#### La sintaxi dels missatges {#the-message-syntax}

La part de la sintaxi de missatges ICU que fa servir el visor:

| Forma | Exemple | Significat |
|---|---|---|
| `{name}` | `{file} has no rows` | un valor posat tal com és |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | la branca per al número segons les regles de plural de l'idioma, o un `=0`, `=1` … exacte; `#` és el número escrit a la manera de l'idioma |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | la branca per a una paraula |

Les branques es poden niar, i cada `plural` i `select` ha de tenir una branca `other`.
A diferència del ICU complet, un **apòstrof només és un apòstrof** - els noms de cotxes i els
possessius anglesos n'estan plens - així que no cal citar-ne cap. Un `{` o un `}`
literal no es pot escriure.

Missatges amb valors que una traducció ha de mantenir: els noms entre claus els
omple el codi; les paraules d'un `select` són les que el codi tria
(`crash`, `onto-straight`, `yes`/`none`) i s'han de mantenir com en anglès; les
categories de plural poden diferir (un idioma usa les seves: polonès `one`, `few`,
`many`, `other`; japonès només `other`).

### Com es van fer les traduccions, i les proves {#how-the-translations-were-made-and-the-tests}

Les traduccions es van fer amb un model d'IA a partir de l'anglès, amb un glossari
de termes de curses, i els textos de carrera es van rellegir una segona vegada amb
els valors omplerts. Les correccions de parlants nadius són benvingudes (més avall).

`src/i18n/i18n.test.ts` comprova:

- que cada missatge que demana el codi existeix en anglès - cada crida `t('…')`,
  i cada clau guardada en una taula i passada a `t()` més tard (claus que comencen
  amb el nom d'una part, com `app.` o `heat.`);
- que els missatges que el codi construeix a partir de parts existeixen: el `label`,
  `short`, `count` i `here` de cada error, cada tret de comparació de cotxes, l'etiqueta
  de cada canal;
- que cada missatge **es pot analitzar**, en cada idioma;
- que cada traducció **manté els valors i les opcions del missatge anglès**
  (cap valor afegit ni perdut; cada `select` manté les seves paraules);
- que cada idioma té **tots** els missatges de l'anglès, i que el conjunt d'idiomes
  traduïts és exactament la llista de dalt;
- que un missatge es diu en l'idioma triat i torna a l'anglès.

### Corregir una traducció {#correcting-a-translation}

Les correccions d'un parlant nadiu són benvingudes - cadascuna és una línia de JSON.

1. Troba el missatge: cerca als catàlegs anglesos (`src/i18n/locales/en/`)
   el text que veus en anglès (posa el selector en anglès per llegir-lo), i anota
   la seva clau.
2. Obre la mateixa part en el teu idioma, per exemple
   `src/i18n/locales/de/race-ui.json`, i canvia el valor d'aquella clau. Mantén
   cada `{name}` que hi hagi, mantén les paraules del `select`, escriu les branques de plural
   que el teu idioma necessiti:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Executa `npm test` (o només `npx vitest run src/i18n`): les proves diuen si
   s'ha perdut un valor o una opció, o si un missatge ja no es pot analitzar.
4. Amb el servidor de desenvolupament en marxa, el canvi es veu en canviar l'idioma
   (o en recarregar).

**Afegir un missatge** (al codi): afegeix-lo primer a la part anglesa, i després a
cada altre idioma (les proves fallen fins que cada un el tingui).

**Afegir un idioma**: afegeix-lo a `LANGUAGES` a `languages.ts` (la seva etiqueta BCP 47
i el seu propi nom, i un àlies o una configuració regional d'`Intl` si cal), i una
carpeta `src/i18n/locales/<etiqueta>/` amb totes les parts.
