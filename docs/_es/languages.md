---
title: "Idiomas"
nav_order: 17
lang: "es"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Idiomas

El visor puede hablar tu idioma: cada botón, sugerencia y mensaje, y cada frase del análisis de carrera y de partidas, se muestra en el idioma que elijas. Conoce 40 idiomas y empieza con el de tu navegador si lo tiene.

Están todos los idiomas oficiales de Europa (los 24 de la UE, y también noruego, islandés, ucraniano, ruso, bielorruso, serbio, bosnio, macedonio, albanés, turco, luxemburgués y catalán), además de japonés, coreano, y chino simplificado y tradicional. La lista completa está en [Lista de idiomas](ref-languages.md).

El inglés es el idioma de origen desde el que se traduce todo lo demás, y es lo que se muestra cuando falta un mensaje.

## Cambiar el idioma {#change-the-language}

1. Abre el desplegable junto al nombre, arriba de la barra lateral. Su primera entrada es **Automático - <idioma>** (el del navegador, tal como se detecta ahora). Después viene cada idioma con su propio nombre, para que encuentres el tuyo aunque no puedas leer el idioma que se muestra.
2. Elige uno. Cambia al momento y se guarda en este navegador. Elige *Automático* para olvidar la elección.

En una ventana privada, o con el almacenamiento bloqueado, la elección dura solo hasta que se cierra la página.

Lo que hace el cambio:

- cada etiqueta, sugerencia y mensaje se vuelve a mostrar en el nuevo idioma;
- el análisis de carrera se **vuelve a calcular** en ese idioma (sus frases se construyen a partir de las mediciones, no se traducen después), las vueltas de demostración cambian de nombre y los gráficos se vuelven a dibujar;
- los números, las listas y los plurales siguen al nuevo idioma.

## Con qué idioma empieza {#which-language-it-starts-in}

1. El idioma **elegido** en este navegador, si hay alguno (guardado en `localStorage` como `heat3d.language`).
2. Si no, el **del navegador**: el primero de `navigator.languages` que el visor habla. Una etiqueta se empareja por su parte de idioma (`de-AT` → `de`), con estos alias: `nb` y `nn` → noruego (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` y cualquier etiqueta con la escritura `Hant` → chino tradicional; `zh-Hans`, `zh-CN`, `zh-SG` y otras `zh` → chino simplificado; `cnr` (montenegrino) → serbio.
3. Si no, **inglés**.

El atributo `lang` de la página se pone con el idioma que se habla.

## Números, listas y plurales {#numbers-lists-and-plurals}

Los números, las listas y los plurales del texto del visor se escriben a la manera de cada idioma (en español, «3,5»; en inglés, «3.5»; «a, b y c»). Las etiquetas más largas que en inglés se parten en líneas, con guion donde el idioma lo permite, en lugar de salirse de la barra lateral. Los nombres de filas de los gráficos que son demasiado largos se cortan con puntos suspensivos y se muestran completos al pasar el ratón.

Los números que escribes en un cuadro pueden llevar punto o coma.

## Para traductores y desarrolladores {#for-translators-and-developers}

Código: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Cómo se escriben los números, las listas y los plurales {#how-numbers-lists-and-plurals-are-written}

- Los **números** con decimales (`num`) usan la coma decimal del idioma y **ningún agrupamiento de dígitos**. Una distancia de 3108 m sigue siendo un solo número en todos los idiomas.
- Los **números enteros que son cuentas o tamaños** (`int`) usan el agrupamiento de dígitos del idioma.
- Las **listas** (`list`) se unen a la manera del idioma: "a, b y c", "a, b o c", o uno tras otro con el separador propio del idioma (el mensaje `common.listSeparator`: ", " en inglés, "、" en japonés y en los dos chinos).
- Los **plurales** siguen las reglas propias del idioma a través de `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- La configuración regional que se pide a `Intl` es la etiqueta del idioma, salvo cuando esa etiqueta por sí sola daría las reglas de otro país: el portugués es `pt-PT` (en el de Brasil el 0 cuenta como uno), el noruego `nb`, el chino simplificado `zh-CN`, y el tradicional `zh-TW`.

### Los catálogos {#the-catalogs}

`src/i18n/locales/<idioma>/<parte>.json`, un archivo por cada parte del visor, con las mismas partes en todos los idiomas.

Hay un archivo por cada parte del visor (30 hoy, por ejemplo `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), y todos los idiomas tienen el mismo conjunto. La carpeta los lista todos.

Cada archivo es un objeto JSON plano: la clave escrita completa (`"race.ui.laps.load"`) y el mensaje como valor. El inglés va incluido con el visor; cualquier otro idioma se descarga cuando se elige.

**Búsqueda:** el mensaje del idioma actual; si no existe, el inglés; y si tampoco, la propia clave (en desarrollo, la consola avisa «i18n: no message …»). Un mensaje que no se puede formatear recurre al inglés, así que una traducción rota nunca rompe el visor.

#### La sintaxis de los mensajes {#the-message-syntax}

La parte de la sintaxis de mensajes ICU que usa el visor:

| Forma | Ejemplo | Significado |
|---|---|---|
| `{name}` | `{file} has no rows` | un valor que se pone tal cual |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | la rama del número según las reglas de plural del idioma, o un `=0`, `=1` exacto …; `#` es el número escrito a la manera del idioma |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | la rama de una palabra |

Las ramas pueden anidarse, y todo `plural` y todo `select` debe tener una rama `other`. A diferencia de ICU completo, un **apóstrofo es solo un apóstrofo**: los nombres de coches y los posesivos del inglés están llenos de ellos, así que no hace falta escaparlos. No se puede escribir una `{` o una `}` literal.

Mensajes con valores que una traducción debe conservar: los nombres entre llaves los rellena el código; las palabras de un `select` son las que el código usa para elegir (`crash`, `onto-straight`, `yes`/`none`) y deben quedarse como en inglés; las categorías de plural pueden diferir (cada idioma usa las suyas: el polaco `one`, `few`, `many`, `other`; el japonés solo `other`).

### Cómo se hicieron las traducciones, y las pruebas {#how-the-translations-were-made-and-the-tests}

Las traducciones se hicieron con un modelo de IA a partir del inglés, con un glosario de términos de carreras, y los textos de las carreras se releyeron una segunda vez con los valores ya puestos. Las correcciones de hablantes nativos son bienvenidas (más abajo).

`src/i18n/i18n.test.ts` comprueba:

- que cada mensaje que pide el código existe en inglés: cada llamada `t('…')`, y cada clave guardada en una tabla y pasada a `t()` más tarde (claves que empiezan por el nombre de una parte, como `app.` o `heat.`);
- que los mensajes que el código construye a partir de partes existen: la `label`, `short`, `count` y `here` de cada error, cada rasgo de comparación de coches, y la etiqueta de cada canal;
- que cada mensaje **se analiza** correctamente, en todos los idiomas;
- que cada traducción **conserva los valores y las elecciones del mensaje en inglés** (sin añadir ni perder valores; cada `select` conserva sus palabras);
- que cada idioma tiene **todos** los mensajes del inglés, y que el conjunto de idiomas traducidos es exactamente la lista de arriba;
- que un mensaje se dice en el idioma elegido y recurre al inglés cuando hace falta.

### Corregir una traducción {#correcting-a-translation}

Las correcciones de un hablante nativo son bienvenidas. Cada una es una línea de JSON.

1. Localiza el mensaje: busca en los catálogos en inglés (`src/i18n/locales/en/`) el texto que ves en inglés (cambia el selector a inglés para leerlo), y anota su clave.
2. Abre la misma parte en tu idioma, por ejemplo `src/i18n/locales/de/race-ui.json`, y cambia el valor de esa clave. Conserva cada `{name}`, conserva las palabras del `select`, y escribe las ramas de plural que tu idioma necesita:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Ejecuta `npm test` (o simplemente `npx vitest run src/i18n`): las pruebas dicen si se perdió un valor o una elección, o si un mensaje ya no se analiza.
4. Con el servidor de desarrollo en marcha, el cambio se ve al cambiar de idioma (o al recargar).

**Añadir un mensaje** (en el código): añádelo primero a la parte en inglés, y luego a todos los demás idiomas. Las pruebas fallan hasta que cada uno lo tenga.

**Añadir un idioma**: añádelo a `LANGUAGES` en `languages.ts` (su etiqueta BCP 47, su propio nombre, y un alias o una configuración `Intl` si hace falta), y crea una carpeta `src/i18n/locales/<etiqueta>/` con todas las partes.
