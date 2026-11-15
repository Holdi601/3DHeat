---
title: "Os conversores guardam tudo"
parent: "Carregar dados"
nav_order: 8
lang: "pt"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Os conversores guardam tudo

Não precisa desta página para abrir uma repetição. É para quem escreve ferramentas que transformam ficheiros de jogos em tabelas do 3DHeat, e para quem quer saber porque é que essas tabelas guardam tanto.

Cada ferramenta que transforma a repetição, a demo, o registo ou a telemetria ao vivo de um jogo num
ficheiro que o visualizador abre segue uma regra:

> **Converta tudo o que a origem tem e que pode ser lido agora, e guarde o
> resto inteiro, para que possa ser lido mais tarde sem o ficheiro original.**

Uma repetição muitas vezes desaparece depois de uma atualização do jogo, de uma reinstalação ou de um disco cheio, e um fluxo ao vivo desaparece no momento em que é enviado. O que um conversor deixa cair perde-se para sempre; o que guarda inteiro pode ser descodificado no dia em que alguém o perceber. Por isso um conversor nunca decide o que será útil: descodifica o que consegue, guarda cada outra mensagem, pacote, evento, propriedade ou linha inalterados ao lado da tabela, e diz no seu próprio resultado quanto de cada coisa leu e quanto apenas guardou.

Esta página é a convenção que todos os conversores partilham: os conversores de repetições do War Thunder, World of Tanks, World of Warships e Squad, o conversor de demos do CS2, o observador de fundo (o seu descodificador de repetições do Dota e cada adaptador ao vivo), os leitores de telemetria da ferramenta de captura de jogos, e as importações do próprio visualizador (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Os leitores do próprio visualizador estão descritos em [Gravações Tacview](tacview-acmi.md) e [Carregar ficheiros](loading-files.md); a forma de um só ficheiro é [Um ficheiro por partida](container.md). Uma partida torna-se uma tabela, um `match.json` e ficheiros auxiliares, opcionalmente empacotados num só ficheiro `.3dheat`. O README de cada ferramenta tem uma secção **Completeness** que lista, para essa origem, o que é lido, o que é guardado em bruto e o que não está disponível, e porquê.

## Três destinos para cada item {#three-homes-for-every-item}

Tudo o que uma origem tem acaba exatamente num de três sítios:

| Destino | O que lá vai |
|---|---|
| **Descodificado** | A tabela (uma linha por amostra ou evento, as colunas que o visualizador lê, colunas extra para cada outro valor que pertence a uma linha) e o documento da partida `<partida>.match.json` (tudo o que pertence à partida no seu conjunto: definições, listas de equipas, resultados, quadros de pontuação, a autoverificação). |
| **Guardado em bruto** | Um ficheiro auxiliar ao lado da tabela: cada item que não é descodificado, ou só em parte, inteiro e inalterado, com o seu tipo, hora e a unidade ou entidade a que pertence. |
| **Não disponível** | Nomeado na secção Completeness do README com a razão: o formato não o traz (uma repetição do cliente não tem as entradas dos outros jogadores), a origem nunca o envia, ou ler não é permitido (um processo protegido, um bloco cifrado cuja chave não é nossa para usar). |

Um item **descodificado em parte** é descodificado *e* guardado em bruto: a tabela fica com o que é compreendido, o ficheiro auxiliar com o item inteiro, para que um descodificador melhor mais tarde não precise do ficheiro original.

Não há um quarto sítio. Deixar cair algo porque parecia inútil, porque era um duplicado «provavelmente», ou porque era grande, é um erro. Reduzir só é permitido na tabela (uma câmara a 2 Hz em vez de 60), nunca no ficheiro auxiliar.

## Ficheiros auxiliares {#sidecars}

Um ficheiro auxiliar é um ficheiro Parquet ao lado da tabela, com o nome dela:

```
<pasta>/<partida>.parquet              a tabela
<pasta>/<partida>.match.json           o documento da partida
<pasta>/<partida>.<o-que>.parquet      um ficheiro auxiliar
```

`<o-que>` é uma palavra desta lista. Um novo conversor escolhe a palavra que
se adequa, ou acrescenta uma nova aqui **e** a `SIDECAR_PARQUET` em
[`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts),
para que o visualizador o deixe de fora quando uma pasta inteira é carregada.

| `<o-que>` | Guarda | Usado por |
|---|---|---|
| `messages` | pacotes, chamadas de métodos de entidades e atualizações de propriedades de um fluxo de rede, inteiros | War Thunder, World of Tanks, World of Warships |
| `flight` | entradas do modelo de voo por aeronave, inteiras | War Thunder |
| `packets` | quadros e mensagens de rede inteiros, ou blocos do contentor, fora do fluxo de entidades | CS2, Dota 2, Squad |
| `events` | eventos do jogo com todas as suas chaves, como o analisador os dá | CS2 |
| `entities` | atualizações de entidades e de propriedades, chamadas remotas, canais abertos e fechados, com as exportações de que um descodificador precisa | Squad, Dota 2 |
| `props` | cada propriedade de entidade que o analisador lê, cada vez que mudou | CS2 |
| `units` | estado por unidade fora da tabela de posições | Dota 2 |
| `combatlog` | um registo de combate, cada entrada com cada campo | Dota 2 |
| `strings` | cada entrada de cada tabela de textos | CS2, Dota 2 |
| `objectives` | zonas de captura e objetivos, cada mudança com a sua hora | War Thunder |
| `raw` | um fluxo ao vivo: cada pacote, linha, documento de API ou leitura de memória recebidos, inteiros | as sessões do observador (`heat.raw.parquet`), os gravadores de voltas da ferramenta de captura de jogos (`<carimbo>_<jogo>.raw.parquet`), os ficheiros de repetição de osu!, LoL e Valorant do observador |

A carga de pastas do visualizador deixa de fora cada `*.<o-que>.parquet` desta lista,
e cada `*.match.json`, `*.meta.json`, `*.summary.json` e os outros ficheiros auxiliares JSON;
abrir um deles sozinho, escolhendo ou arrastando apenas esse ficheiro, carrega-o como qualquer
outra tabela (ver [Carregar ficheiros](loading-files.md)).

Estes são os ficheiros como um conversor os escreve com `--loose`. Por predefinição, os conversores de War Thunder, CS2 e Tacview empacotam a tabela, o documento e os ficheiros auxiliares de uma partida num só ficheiro, `<partida>.3dheat`, com os mesmos nomes (ver [Um ficheiro por partida](container.md)); tudo o que aqui está vale para cada membro.

### Colunas {#columns}

Cada linha de um ficheiro auxiliar é um item. As colunas são, por esta ordem, as que se aplicam:

| Coluna | Tipo | O quê |
|---|---|---|
| `time` | float64 | segundos no mesmo relógio do `time` da tabela (ou `tick` quando a origem conta ticks; então ambos) |
| `type` | string (dicionário) | o que o item é, nos termos da própria origem: um tipo de pacote, um id de mensagem, um nome de evento, um caminho de propriedade, um prefixo de linha |
| `name` | string (dicionário) | o seu nome quando se conhece um (um nome da comunidade, um nome de classe), senão vazio |
| `entity` / `unit` / `uid` / `player` | inteiro ou string | a quem pertence, com os mesmos ids da tabela, para que uma linha do ficheiro auxiliar possa ser ligada a uma trajetória |
| `decoded` | string (JSON) | o que se compreende dele, quando há algo; senão vazio |
| `payload` | binário | os bytes do item, inteiros e inalterados (origens binárias) |
| `text` | string | o texto do item, inteiro e inalterado (origens de texto: uma linha de registo, um objeto JSON, um bloco chave-valor) |

São permitidas mais colunas (um deslocamento de bits, um tamanho, um canal). As strings que se repetem são
codificadas em dicionário e o ficheiro é escrito com zstd, por isso um ficheiro auxiliar
fica como uma fração do tamanho da própria repetição.

Um ficheiro auxiliar tem de bastar por si: um descodificador escrito mais tarde lê o
ficheiro auxiliar, nunca a repetição original. Quando um item não se pode compreender sem contexto (a classe de uma
entidade, uma tabela de textos, uma chave a que uma mensagem se refere), o contexto vai para o
ficheiro auxiliar também, ou para o documento da partida.

### Fontes ao vivo {#live-sources}

Os adaptadores ao vivo (telemetria UDP, memória partilhada, o registo de um jogo, uma API local)
não têm ficheiro a que voltar. Gravam **cada campo que a origem envia**, mesmo os que ainda nada usa:

- um fluxo de pacotes: cada pacote inteiro, `payload` os bytes, `type` o seu id ou formato de pacote, à velocidade a que chega;
- memória partilhada ou uma API consultada: cada campo de cada leitura, seja como colunas com nome ou o bloco inteiro como `payload`, à velocidade a que o adaptador lê;
- um registo: cada linha, `text` a linha, `type` o tipo da linha, incluindo as linhas em que o adaptador não atua.

Estes vão para `<sessão>.raw.parquet` ao lado da tabela da sessão. O tamanho é o preço da regra;
é mantido baixo pelo zstd e pela codificação em dicionário, não por deixar coisas de fora.

## A autoverificação {#the-self-check}

Cada conversor escreve, no seu documento da partida (ou no `meta.json` da sessão,
ou num resumo quando não tem documento de partida), um bloco `completeness` dentro de `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Campo | Significado |
|---|---|
| `seen` | quantos itens deste tipo a origem tem |
| `decoded` | lidos inteiros para a tabela ou o documento da partida |
| `partial` | lidos em parte para a tabela ou o documento, e guardados inteiros num ficheiro auxiliar |
| `raw` | guardados inteiros só num ficheiro auxiliar, não descodificados |
| `lost` | `seen - decoded - partial - raw`: tem de ser 0 |

O `lost` do nível superior é a soma. Os testes de um conversor afirmam que é 0 nas suas amostras sintéticas, e o README diz qual foi nas reais. Um `lost` diferente de zero é o conversor a dizer que quebrou a regra; diz o tipo, para que a lacuna possa ser encontrada.

Os «types» são os da própria origem: tipos de pacote, ids de mensagem, nomes de eventos, grupos de propriedades, tipos de linha. São contados onde o conversor os encontra, não a partir de uma lista do que espera, por isso um tipo que ninguém conhecia aparece com a sua contagem em vez de desaparecer.

## A secção Completeness do README {#the-readmes-completeness-section}

Cada README de conversor tem uma secção intitulada **Completeness**, com três listas:

- **Read** (lido): o que entra na tabela e no documento da partida, e como cada campo novo foi verificado contra algo independente (os números do próprio jogo, uma segunda fonte, uma gravação feita para o efeito).
- **Kept raw** (guardado em bruto): o que está em que ficheiro auxiliar, sob que `type`, e o que se conhece dele até agora.
- **Not available** (não disponível): o que a origem não traz ou não pode ser lido, e porquê.

Liga de volta a esta página.

## Onde está cada conversor {#where-each-converter-stands}

| Conversor | Ficheiros auxiliares | A sua secção Completeness |
|---|---|---|
| Repetições do War Thunder | `messages`, `flight` | [README do 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (as contagens da autoverificação estão em `counts`; o bloco `completeness` virá depois) |
| Repetições do World of Tanks | `messages` | [README do 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Repetições do World of Warships | `messages` | [README do 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demos de servidor do Squad | `entities`, `packets` | [README do 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demos do CS2 | `events`, `props`, `strings`, `packets` | [README do 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Repetições do Dota 2 (observador) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Repetições do Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Repetições do osu!, LoL, Valorant (observador) | `raw` | as suas páginas na [documentação do observador](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adaptadores ao vivo (observador) | `raw` | a página de cada jogo na [documentação do observador](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs), e [desenvolvimento](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) para `Session.raw` |
| Gravadores de voltas (ferramenta de captura de jogos) | `raw`, e bytes `unparsed` dentro de um ficheiro de volta do Forza | [README do 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| As importações do próprio visualizador | nenhum: ver abaixo | esta página |

### As importações do próprio visualizador {#the-viewers-own-imports}

O Tacview ACMI, o OCAP e os formatos GPS são lidos no navegador a partir do próprio ficheiro do utilizador; o visualizador não guarda nada deles, por isso o próprio ficheiro continua a ser o registo. Mesmo assim, leem o máximo que conseguem:

- **Tacview ACMI** (`src/data/acmi.ts`): cada linha de objeto com uma posição é uma linha com cada propriedade que a gravação traz, cada evento é uma linha, cada remoção é uma linha, as propriedades da própria gravação (com o FileType e o FileVersion do cabeçalho) em cada linha como `RecordingInfo`; uma linha de comentário é um evento `Comment`, um objeto que nunca recebe uma posição é uma linha `Unplaced` no ponto de referência, e U/V são colunas sempre que alguma linha as tem. Uma linha de propriedades sem posição é lida em parte: os seus valores chegam à linha seguinte do objeto, e não no seu próprio tempo. `AcmiTable.completeness` conta as linhas do ficheiro por tipo.
- **OCAP** (`src/data/ocap.ts`): os frames de cada entidade, os disparos, os marcadores, cada tipo de evento (os tipos desconhecidos como linhas de «Mission» com o seu texto) e os campos do próprio documento (`Info`). Ainda não lidos: os campos das entidades e os elementos de posição finais que não estão listados no seu cabeçalho (acréscimos de um gravador mais recente), e os frames repetidos de uma unidade morta depois da morte (reduzidos de propósito: nada muda neles).
- **Formatos GPS** (`src/data/geoTracks.ts`): as posições, a sua hora, altitude, rumo e velocidade, e frequência cardíaca, cadência, potência, temperatura, satélites, HDOP e altitude de pressão onde o ficheiro as regista. Ainda não lidos: outras extensões de GPX e KML, frases NMEA que não sejam as de posição, registos IGC que não sejam posições e as suas extensões, e mensagens FIT que não sejam registos (voltas, sessões, informação do dispositivo).

Estas lacunas estão listadas para serem fechadas, não para as desculpar; as exportações do visualizador de uma gravação carregada (`src/data/exportRecording.ts`) escrevem só o que foi lido.

## Adicionar um conversor {#adding-a-converter}

1. Liste o que o formato tem, a partir da sua documentação, das suas próprias estruturas, ou contando cada tipo de mensagem em amostras reais. A lista é o `types` da autoverificação.
2. Descodifique o que se pode verificar agora. Cada campo novo é verificado contra algo independente antes de entrar na tabela; um campo que ainda não se pode verificar fica em bruto.
3. Guarde o resto inteiro num ficheiro auxiliar com o nome indicado acima, com as colunas acima.
4. Escreva o bloco `completeness` e um teste de que tem `lost` 0.
5. Escreva a secção Completeness do README e ligue para aqui.
6. Se o `<o-que>` do ficheiro auxiliar for novo, acrescente-o à tabela acima e a `SIDECAR_PARQUET` em `src/data/filePick.ts`.

Os conversores são de sala limpa: são escritos a partir de formatos, documentação e amostras, nunca de código GPL ou AGPL. As amostras de repetições reais ficam na máquina que as fez; os testes usam ficheiros sintéticos.
