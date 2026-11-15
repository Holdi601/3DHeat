---
title: "Idiomas"
nav_order: 17
lang: "pt"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---


# Idiomas

O visualizador pode falar a sua língua: cada botão, dica e mensagem, e cada frase da análise de corrida e de partida, aparecem no idioma que escolher. Conhece 40 e começa no idioma do seu navegador quando o tem.

Estão lá todas as línguas oficiais da Europa (as 24 da UE, e o norueguês, o islandês, o ucraniano, o russo, o bielorrusso, o sérvio, o bósnio, o macedónio, o albanês, o turco, o luxemburguês e o catalão), além do japonês, do coreano e do chinês simplificado e tradicional. Lista completa: [Lista de idiomas](ref-languages.md).

O inglês é a fonte a partir da qual todos os outros idiomas são traduzidos, e é para onde cai uma mensagem em falta.

## Mudar o idioma {#change-the-language}

1. Abra a lista pendente ao lado do nome, no topo da barra lateral. A primeira entrada é **Automático - <idioma>** (o do navegador, tal como é detetado agora); depois, todos os idiomas pelo seu próprio nome, para encontrar o seu mesmo quando não consegue ler o que está a ser mostrado.
2. Escolha um. Muda logo e fica guardado neste navegador. Escolha *Automático* para esquecer a escolha.

Numa janela privada, ou com o armazenamento bloqueado, a escolha dura até a página ser fechada.

O que a troca faz:

- cada rótulo, dica e mensagem é desenhado de novo no novo idioma;
- a análise de corrida é **calculada outra vez** nele (as suas frases são construídas
  a partir das medições, não traduzidas depois), as voltas de demonstração são
  renomeadas, e os gráficos são redesenhados;
- os números, as listas e os plurais seguem o novo idioma.

## Em que idioma começa {#which-language-it-starts-in}

1. O idioma **escolhido** neste navegador, se houver (guardado em `localStorage`
   sob `heat3d.language`).
2. Caso contrário, o **do navegador**: o primeiro de `navigator.languages` que o
   visualizador fala. Uma etiqueta é comparada pela sua parte de idioma (`de-AT` → `de`), com
   estes aliases: `nb` e `nn` → norueguês (`no`); `zh-TW`, `zh-HK`,
   `zh-MO`, `zh-Hant` e qualquer etiqueta com o script `Hant` → chinês
   tradicional; `zh-Hans`, `zh-CN`, `zh-SG` e outros `zh` → chinês
   simplificado; `cnr` (montenegrino) → sérvio.
3. Caso contrário, **inglês**.

O `<html lang>` da página fica com o idioma falado.

## Números, listas e plurais {#numbers-lists-and-plurals}

Os números, as listas e os plurais no texto do visualizador são escritos à maneira do idioma ("3.5" ou "3,5", "a, b e c"). Os rótulos mais longos do que em inglês quebram linha, com hífen onde o idioma o permite, em vez de sair da barra lateral. Os nomes de linhas de gráficos demasiado longos são cortados com reticências e mostrados por inteiro ao passar o rato.

Os números que escreve numa caixa podem usar ponto ou vírgula.

## Para tradutores e programadores {#for-translators-and-developers}

Código: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Como se escrevem números, listas e plurais {#how-numbers-lists-and-plurals-are-written}

- Os **números** com decimais (`num`) usam o separador decimal do idioma e **nenhum
  agrupamento de dígitos** - uma distância de 3108 m fica um só número em todos os idiomas.
- Os **números inteiros que são contagens ou tamanhos** (`int`) usam o agrupamento
  de dígitos do idioma.
- As **listas** (`list`) são unidas à maneira do idioma: "a, b e c", "a, b ou
  c", ou uma depois da outra com o separador próprio do idioma (a mensagem
  `common.listSeparator`: ", " em inglês, "、" em japonês e nos dois chineses).
- Os **plurais** seguem as regras próprias do idioma através de `Intl.PluralRules`
  (`one`, `two`, `few`, `many`, `other`).
- A localidade pedida ao `Intl` é a etiqueta do idioma, exceto onde a etiqueta
  sozinha daria as regras de outro país: o português é `pt-PT` (no Brasil, o plural conta 0
  como um), o norueguês `nb`, o chinês simplificado `zh-CN`,
  o chinês tradicional `zh-TW`.

### Os catálogos {#the-catalogs}

`src/i18n/locales/<idioma>/<parte>.json`, um ficheiro por parte do visualizador,
as mesmas partes em todos os idiomas.

Há um ficheiro por parte do visualizador (30 hoje, por exemplo `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`), e todos os idiomas têm o mesmo conjunto. A pasta lista-os todos.

Cada ficheiro é um objeto JSON plano: a chave escrita por extenso
(`"race.ui.laps.load"`), a mensagem como valor. O inglês vem incluído com
o visualizador; os outros idiomas são carregados quando são escolhidos.

**Procura:** a mensagem do idioma atual, senão a inglesa, senão a própria
chave (em desenvolvimento, a consola avisa "i18n: no message …"). Uma
mensagem que não consegue formatar cai para a inglesa, por isso uma
tradução partida nunca parte o visualizador.

#### A sintaxe das mensagens {#the-message-syntax}

A parte da sintaxe de mensagens ICU que o visualizador usa:

| Forma | Exemplo | Significado |
|---|---|---|
| `{nome}` | `{file} has no rows` | um valor inserido tal como é |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | o ramo para o número segundo as regras de plural do idioma, ou um `=0`, `=1` exato …; o `#` é o número escrito à maneira do idioma |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | o ramo para uma palavra |

Os ramos podem ser aninhados, e cada `plural` e `select` tem de ter um ramo `other`.
Ao contrário do ICU completo, um **apóstrofo é só um apóstrofo** - nomes de carros e
possessivos ingleses estão cheios deles - por isso nada precisa de ser entre aspas. Um
`{` ou `}` literal não pode ser escrito.

Mensagens com valores que uma tradução tem de manter: os nomes entre chavetas
são preenchidos pelo código; as palavras de um `select` são aquelas com que o código
escolhe (`crash`, `onto-straight`, `yes`/`none`) e têm de ficar como em inglês; as
categorias de plural podem diferir (cada idioma usa as suas: polaco `one`, `few`,
`many`, `other`; japonês só `other`).

### Como foram feitas as traduções, e os testes {#how-the-translations-were-made-and-the-tests}

As traduções foram feitas com um modelo de IA a partir do inglês, com um
glossário de termos de corrida, e os textos de corrida foram relidos uma segunda vez com
os valores preenchidos. São bem-vindas as correções de falantes nativos (abaixo).

`src/i18n/i18n.test.ts` verifica:

- que cada mensagem que o código pede existe em inglês - cada chamada `t('…')`,
  e cada chave guardada numa tabela e entregue a `t()` mais tarde (chaves
  que começam pelo nome de uma parte, como `app.` ou `heat.`);
- que as mensagens que o código constrói a partir de partes existem: o `label`,
  o `short`, o `count` e o `here` de cada erro, cada traço de comparação de carros,
  o rótulo de cada canal;
- que cada mensagem **se analisa**, em todos os idiomas;
- que cada tradução **mantém os valores e as escolhas da mensagem inglesa**
  (nenhum valor acrescentado ou perdido; cada `select` mantém as suas palavras);
- que cada idioma tem **todas** as mensagens inglesas, e que o conjunto de
  idiomas traduzidos é exatamente a lista acima;
- que uma mensagem é dita no idioma escolhido e cai para o inglês.

### Corrigir uma tradução {#correcting-a-translation}

As correções de um falante nativo são bem-vindas - cada uma é uma linha de JSON.

1. Encontre a mensagem: procure nos catálogos ingleses (`src/i18n/locales/en/`)
   o texto que vê em inglês (mude o seletor para inglês para o ler),
   e anote a chave.
2. Abra a mesma parte no seu idioma, por exemplo
   `src/i18n/locales/de/race-ui.json`, e mude o valor dessa chave. Mantenha
   cada `{nome}`, mantenha as palavras do `select`, escreva os ramos de plural que
   o seu idioma precisa:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. Execute `npm test` (ou apenas `npx vitest run src/i18n`): os testes dizem se um
   valor ou uma escolha desapareceu ou se uma mensagem deixou de se analisar.
4. Com o servidor de desenvolvimento a correr, a alteração aparece depois de mudar
   o idioma (ou de recarregar).

**Acrescentar uma mensagem** (no código): acrescente-a primeiro à parte inglesa, depois a
todos os outros idiomas (os testes falham até cada um a ter).

**Acrescentar um idioma**: acrescente-o a `LANGUAGES` em `languages.ts` (a sua etiqueta BCP 47
e o seu próprio nome, e um alias ou uma localidade `Intl` se for preciso), e uma
pasta `src/i18n/locales/<etiqueta>/` com todas as partes.
