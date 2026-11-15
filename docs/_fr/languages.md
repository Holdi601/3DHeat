---
title: "Langues"
nav_order: 17
lang: "fr"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Langues

La visionneuse peut parler votre langue : chaque bouton, chaque indication et chaque message, et chaque phrase de l’analyse de course et de match, s’affichent dans la langue que vous choisissez. Elle en connaît 40, et démarre dans la langue de votre navigateur quand elle l’a.

Toutes les langues officielles des pays d’Europe sont là (les 24 de l’UE, et le norvégien, l’islandais, l’ukrainien, le russe, le biélorusse, le serbe, le bosniaque, le macédonien, l’albanais, le turc, le luxembourgeois et le catalan), ainsi que le japonais, le coréen, et le chinois simplifié et traditionnel. Liste complète : [Liste des langues](ref-languages.md).

L’anglais est la source à partir de laquelle sont traduites toutes les autres langues, et ce vers quoi revient un message manquant.

## Changer de langue {#change-the-language}

1. Ouvrez la liste déroulante à côté du nom, en haut de la barre latérale. Sa première entrée est **Automatique - <langue>** (celle du navigateur, telle que détectée maintenant) ; viennent ensuite toutes les langues, chacune avec son nom propre, pour que vous trouviez la vôtre même si vous ne lisez pas celle qui est affichée.
2. Choisissez-en une. Le changement est immédiat et il est gardé dans ce navigateur. Choisissez *Automatique* pour oublier le choix.

Dans une fenêtre privée, ou quand le stockage est bloqué, le choix dure jusqu’à la fermeture de la page.

Ce que fait le changement :

- chaque libellé, chaque indication et chaque message est réaffiché dans la nouvelle langue ;
- l’analyse de course est **recalculée** dans cette langue (ses phrases sont construites à partir des mesures, et non traduites après coup), les tours de démonstration sont renommés, et les graphiques sont redessinés ;
- les nombres, les listes et les pluriels suivent la nouvelle langue.

## La langue de départ {#which-language-it-starts-in}

1. La langue **choisie** dans ce navigateur, s’il y en a une (gardée dans `localStorage` sous `heat3d.language`).
2. Sinon celle **du navigateur** : la première de `navigator.languages` que la visionneuse parle. Une étiquette est reconnue par sa partie langue (`de-AT` → `de`), avec ces alias : `nb` et `nn` → norvégien (`no`) ; `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` et toute étiquette avec le script `Hant` → chinois traditionnel ; `zh-Hans`, `zh-CN`, `zh-SG` et les autres `zh` → chinois simplifié ; `cnr` (monténégrin) → serbe.
3. Sinon **l’anglais**.

L’attribut `<html lang>` de la page prend la langue parlée.

## Nombres, listes et pluriels {#numbers-lists-and-plurals}

Les nombres, les listes et les pluriels dans le texte de la visionneuse s’écrivent à la façon de la langue (« 3.5 » ou « 3,5 », « a, b et c »). Les libellés plus longs que l’anglais passent à la ligne, avec un trait d’union quand la langue le permet, au lieu de déborder de la barre latérale. Les noms de lignes de graphique trop longs sont coupés avec des points de suspension et affichés en entier au survol.

Les nombres que vous tapez dans une case peuvent utiliser un point ou une virgule.

## Pour les traducteurs et les développeurs {#for-translators-and-developers}

Code : [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Comment s’écrivent les nombres, les listes et les pluriels {#how-numbers-lists-and-plurals-are-written}

- Les **nombres** à décimales (`num`) utilisent le séparateur décimal de la langue et **aucun regroupement des chiffres** - une distance de 3108 m reste un seul nombre dans toutes les langues.
- Les **nombres entiers qui sont des comptes ou des tailles** (`int`) utilisent le regroupement des chiffres de la langue.
- Les **listes** (`list`) sont reliées à la façon de la langue : « a, b et c », « a, b ou c », ou l’une après l’autre avec le séparateur propre à la langue (le message `common.listSeparator` : ", " en anglais, "、" en japonais et dans les deux chinois).
- Les **pluriels** suivent les règles propres à la langue, par `Intl.PluralRules` (`one`, `two`, `few`, `many`, `other`).
- La locale demandée à `Intl` est l’étiquette de la langue, sauf quand l’étiquette seule donnerait les règles d’un autre pays : le portugais est `pt-PT` (le pluriel du Brésil compte 0 comme un), le norvégien `nb`, le chinois simplifié `zh-CN`, le chinois traditionnel `zh-TW`.

### Les catalogues {#the-catalogs}

`src/i18n/locales/<langue>/<partie>.json`, un fichier par partie de la visionneuse, les mêmes parties dans chaque langue.

Il y a un fichier par partie de la visionneuse (30 aujourd’hui, par exemple `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), et chaque langue a le même ensemble. Le dossier les liste tous.

Chaque fichier est un objet JSON à plat : la clé écrite en entier (`"race.ui.laps.load"`), le message comme valeur. L’anglais est fourni avec la visionneuse ; toute autre langue est chargée quand on la choisit.

**Recherche :** le message de la langue courante, sinon le message anglais, sinon la clé elle-même (en développement, la console affiche « i18n: no message … »). Un message qui ne se met pas en forme revient au message anglais, si bien qu’une traduction cassée ne casse jamais la visionneuse.

#### La syntaxe des messages {#the-message-syntax}

La partie de la syntaxe de messages ICU qu’utilise la visionneuse :

| Forme | Exemple | Signification |
|---|---|---|
| `{name}` | `{file} has no rows` | une valeur insérée telle quelle |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | la branche du nombre selon les règles de pluriel de la langue, ou un `=0`, `=1` … exact ; `#` est le nombre écrit à la façon de la langue |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | la branche pour un mot |

Les branches peuvent être imbriquées, et chaque `plural` et chaque `select` doit avoir une branche `other`. Contrairement à l’ICU complet, une **apostrophe n’est qu’une apostrophe** - les noms de voitures et les possessifs anglais en sont pleins - si bien que rien n’a besoin d’être entre guillemets. Une `{` ou une `}` littérale ne peut pas être écrite.

Messages dont une traduction doit garder les valeurs : les noms entre accolades sont remplis par le code ; les mots d’un `select` sont ce sur quoi le code choisit (`crash`, `onto-straight`, `yes`/`none`) et doivent rester tels qu’en anglais ; les catégories de pluriel peuvent différer (une langue utilise les siennes : le polonais `one`, `few`, `many`, `other` ; le japonais seulement `other`).

### Comment les traductions ont été faites, et les tests {#how-the-translations-were-made-and-the-tests}

Les traductions ont été faites avec un modèle d’IA à partir de l’anglais, avec un glossaire de termes de course, et les textes de course ont été relus une seconde fois avec les valeurs remplies. Les corrections de locuteurs natifs sont les bienvenues (ci-dessous).

`src/i18n/i18n.test.ts` vérifie :

- que chaque message que demande le code existe en anglais - chaque appel `t('…')`, et chaque clé gardée dans une table et transmise plus tard à `t()` (les clés commençant par le nom d’une partie, comme `app.` ou `heat.`) ;
- que les messages que le code construit à partir de parties existent : chaque `label`, `short`, `count` et `here` d’erreur, chaque trait de comparaison de voitures, le libellé de chaque canal ;
- que chaque message **se lit** correctement, dans chaque langue ;
- que chaque traduction **garde les valeurs et les choix du message anglais** (aucune valeur ajoutée ou perdue ; chaque `select` garde ses mots) ;
- que chaque langue a **chaque** message anglais, et que l’ensemble des langues traduites est exactement la liste ci-dessus ;
- qu’un message s’affiche dans la langue choisie et revient à l’anglais.

### Corriger une traduction {#correcting-a-translation}

Les corrections d’un locuteur natif sont les bienvenues - chacune tient sur une ligne de JSON.

1. Trouvez le message : cherchez dans les catalogues anglais (`src/i18n/locales/en/`) le texte que vous voyez en anglais (réglez le sélecteur sur l’anglais pour le lire), et notez sa clé.
2. Ouvrez la même partie dans votre langue, par exemple `src/i18n/locales/de/race-ui.json`, et changez la valeur de cette clé. Gardez chaque `{name}`, gardez les mots du `select`, écrivez les branches de pluriel dont votre langue a besoin :

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Lancez `npm test` (ou simplement `npx vitest run src/i18n`) : les tests disent si une valeur ou un choix a disparu, ou si un message ne se lit plus.
4. Avec le serveur de développement lancé, le changement apparaît après avoir changé de langue (ou rechargé la page).

**Ajouter un message** (dans le code) : ajoutez-le d’abord à la partie anglaise, puis à chaque autre langue (les tests échouent tant que chacune ne l’a pas).

**Ajouter une langue** : ajoutez-la à `LANGUAGES` dans `languages.ts` (son étiquette BCP 47 et son nom propre, et un alias ou une locale `Intl` si besoin), et un dossier `src/i18n/locales/<étiquette>/` avec toutes les parties.
