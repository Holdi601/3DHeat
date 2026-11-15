---
title: "Um ficheiro por partida (.3dheat)"
parent: "Carregar dados"
nav_order: 9
lang: "pt"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Um ficheiro por partida: `.3dheat`

Um ficheiro `.3dheat` é uma partida inteira num só ficheiro, para copiar, guardar ou partilhar. Para o abrir, basta largar o ficheiro no painel Origem.

```
match.3dheat   (um ficheiro ZIP)
  manifest      o que é a partida, e a lista de tudo o que está dentro
  table         as posições (Parquet)
  match.json    o documento da partida
  sidecars      o que o conversor guardou inteiro (eventos, mensagens, ...)
```

Antes, uma partida convertida era vários ficheiros lado a lado: a tabela
`<partida>.parquet`, o documento da partida `<partida>.match.json` e os
auxiliares `<partida>.<o que>.parquet` ([Os conversores guardam tudo](converters.md)). Um
ficheiro `.3dheat` guarda todos num só: uma repetição, um ficheiro, para
copiar, guardar ou partilhar.

Foi feito para que carregar mil deles seja tão rápido como carregar as
tabelas soltas, e para que conversores futuros possam pôr muito mais nele
sem um novo formato.

## Carregar um {#loading-one}

Em qualquer lado onde um ficheiro ou uma pasta carrega, um ficheiro `.3dheat` também carrega, e uma pasta pode misturar contentores e ficheiros soltos:

| Onde | O que é lido do contentor |
|---|---|
| Painel Origem do **Mapa de calor** (ficheiros, pasta, arrastar e largar) | as suas tabelas, como se fossem o `<partida>.parquet` solto |
| **Mapa de calor → Muitas partidas de uma vez** (Ficheiros, Pasta, Adicionar pasta) | as suas tabelas, lidas no próprio sítio pelos trabalhadores do carregador |
| Separador **Partida** (Carregar, ou largar na vista) | o documento da partida |
| Quadro de **Tática** com telemetria | as suas tabelas |

Abrir um contentor lê duas pequenas partes dele: o seu diretório no fim e o
seu manifesto no início. Nada de uma tabela é lido até o carregador o ler.
Os auxiliares e o documento da partida só são lidos quando algo os pede. Uma
pasta com a mesma partida duas vezes, solta e empacotada, carrega-a uma só vez.

## Empacotar e desempacotar {#packing-and-unpacking}

As conversões novas escrevem contentores por omissão: o conversor de War Thunder
(`heat3d-wt-replay`), o conversor de CS2 (`heat3d_cs2 demos`) e a ferramenta
Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` mantém os ficheiros separados.

As partidas convertidas antes, ou por outras ferramentas, são empacotadas com:

```
node tools/3dheat-pack.mjs <pasta>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <pasta|ficheiro.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <pasta|ficheiro.3dheat>...
node tools/3dheat-pack.mjs update <ficheiro.3dheat> [--add <papel>[:<nome>]=<ficheiro>]... [--remove <nome>]...
node tools/3dheat-pack.mjs repack <pasta|ficheiro.3dheat>...
```

- **pack** encontra, dentro das pastas, cada tabela `<partida>.parquet` com os
  ficheiros que lhe pertencem, e escreve `<partida>.3dheat` ao lado deles. Uma
  partida já empacotada é ignorada. Cada contentor é relido por inteiro (o
  sha256, o tamanho, o CRC e o rodapé Parquet de cada membro) antes de mais
  nada; os ficheiros soltos só são apagados com `--delete-loose`, e, para uma
  partida empacotada antes, só quando são byte a byte o que o contentor tem.
  Uma partida com um ficheiro alterado nos últimos `--settle` minutos (10 por
  omissão) fica intocada: um conversor ainda pode estar a escrevê-la.
- **unpack** escreve os membros de volta como ficheiros soltos ao lado do contentor.
- **update** acrescenta ou substitui membros sem reescrever as tabelas que já
  estão no contentor (abaixo).
- **repack** reescreve um contentor por inteiro, deixando cair o que as atualizações deixaram para trás.

## O formato {#the-format}

Um ficheiro `.3dheat` é um arquivo ZIP (qualquer ferramenta ZIP o abre), com estas regras:

1. **`manifest.json` é o primeiro membro** quando um contentor é escrito, e está sempre presente. É encontrado pelo diretório central do ZIP, por isso, depois de um `update`, pode estar mais para o fim do ficheiro.
2. **Os membros lidos por intervalo de bytes ou já comprimidos são guardados** (método ZIP 0): Parquet, Arrow, imagens, modelos, áudio, vídeo, blobs opacos. Um membro guardado é um intervalo de bytes contínuo do contentor, por isso um leitor lê o rodapé de uma tabela e os seus blocos de colunas no próprio sítio, por `File.slice` num navegador ou por um pedido de intervalo HTTP, exatamente como leria o ficheiro solto.
3. **O texto é comprimido por deflate** (método 8): JSON, CSV, texto simples. São pequenos e lidos por inteiro.
4. Os nomes são UTF-8 (bit 11 das flags), relativos, separados por `/`, sem `..`; podem ter pastas (`analysis/heat.json`). Um ficheiro solto empacotado mantém o seu próprio nome, por isso desempacotar devolve os mesmos ficheiros.
5. Membros maiores que 4 GiB, ou contentores com mais de 65 535 membros, usam ZIP64, como é habitual. Os escritores não põem descritores de dados depois dos membros.

Os membros que os conversores escrevem hoje, por esta ordem:

| Papel | Membro | Guardado |
|---|---|---|
| `table` | `<partida>.parquet` | sim |
| `match` | `<partida>.match.json` | não (comprimido por deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<partida>.<papel>.parquet` | sim |
| `summary` | `<partida>.summary.json`, o resumo do índice de massa ([Análise de massa](mass-analysis.md)), acrescentado por `tools/3dheat-summarize.mjs` | não (comprimido por deflate) |

A tabela vem logo a seguir ao manifesto, por isso a primeira leitura do início
do ficheiro cobre o manifesto e o cabeçalho local da tabela juntos.

### O manifesto {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<mapa>_RB_<data>_<sessão>",
 "map": "<mapa>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<partida>.parquet", "match": "<partida>.match.json", "flight": "<partida>.flight.parquet" },
 "members": [
  {
   "name": "<partida>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 dígitos hexadecimais>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Campo | Significado |
|---|---|
| `format` | sempre `3dheat` |
| `format_version` | `maior.menor` (abaixo) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | o que é a partida e o que a fez; `null` quando não se sabe |
| `created`, `updated` | quando foi escrito, quando foi atualizado pela última vez (`updated` só aparece depois de uma atualização) |
| `roles` | cada papel com o nome do primeiro membro: um índice rápido |
| `members` | todos os membros exceto o manifesto: a lista completa, e a que um leitor confia |
| `matches` | opcional: as partidas de um contentor com várias (abaixo) |
| `references` | opcional: ficheiros de que o contentor precisa mas que não guarda |
| `extensions` | opcional: os metadados próprios de um conversor |

Cada membro:

| Campo | Significado |
|---|---|
| `name` | o seu caminho dentro do contentor |
| `role` | para que serve (abaixo) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ou `deflate` |
| `bytes` | o seu tamanho, descomprimido |
| `sha256` | dos seus bytes, descomprimidos |
| `rows` | o número de linhas de uma tabela |
| `schema` | a convenção que segue, `{ "id", "version" }`: o próprio `format` e `version` de um documento (`heat3d-wt-replay-match` 2), `heat3d-table` para uma tabela que o visualizador lê pelo seu rodapé `heat3d`, `heat3d-acmi-table` para a da ferramenta Tacview |
| `match` | num contentor de várias partidas, o `matches[].id` a que pertence |

### Feito para crescer {#made-to-grow}

O formato pretende levar repetições muito mais ricas do que as de hoje sem
partir o que as lê agora:

- **Versões.** `format_version` é `maior.menor`. Um leitor lê todas as versões menores da sua maior e ignora cada campo que não conhece. A versão menor sobe quando algo é acrescentado; a maior só sobe quando a estrutura muda de forma que um leitor mais antigo a leria mal (um membro que deixa de ser guardado, o manifesto movido para fora do arquivo). A convenção de cada membro tem versão à parte, no seu `schema`, por isso um novo layout de tabela ou uma nova versão de documento não precisa de uma nova versão de contentor. Os primeiros contentores escritos diziam `"version": 1`; os leitores tomam isso como 1.0.
- **Os papéis são abertos.** Um papel é qualquer texto. Os leitores usam os papéis que conhecem e guardam os outros: um papel desconhecido é listado, nunca rejeitado, e `update` e `repack` levam-no sem lhe tocar. Um papel pode ter muitos membros: várias tabelas (trajetos por unidade, telemetria a outras taxas), eventos, voz, sincronização de vídeo, referências de níveis, substituições de figuras, resultados de análises. Os nomes podem ter pastas.
- **Qualquer média.** Um membro pode ser qualquer coisa com um tipo de média: Parquet, JSON, Arrow, miniaturas PNG ou JPEG, modelos glTF, áudio, blobs em bruto.
- **Várias partidas.** Uma sessão ou um torneio podem ir num só contentor: `matches` lista-as (`{ "id", "map", "mode", "started", ... }`) e cada membro indica a sua `match`. O visualizador carrega cada membro de papel `table`.
- **Referências.** Ficheiros de que um contentor precisa mas que não guarda, um nível para uma partida, ficam listados em `references` pelo nome e pelo sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), para que o ficheiro certo seja encontrado e verificado sem ser copiado para cada partida.
- **Extensões.** `extensions` guarda os metadados próprios de um conversor sob a sua própria chave, `"<fornecedor>/<nome>": { ... }`, para que dois conversores nunca colidam e nada tenha de ser acrescentado aos campos partilhados.
- **Atualizar no lugar.** `update` acrescenta ou substitui membros sem reescrever as grandes tabelas guardadas: os membros novos e um manifesto novo são acrescentados depois do fim do contentor, seguidos de um novo diretório central. O que foi substituído fica como bytes sem referência até um `repack`. Cada membro e cada campo do manifesto, conhecido ou não, é mantido. Uma atualização que falha é cortada e o contentor volta a ficar como estava.

Os testes do visualizador garantem isto: um contentor de formato 1.7 com um papel
desconhecido, um campo de membro, uma extensão e um membro de áudio, numa pasta,
carrega-se, e sobrevive a uma atualização e a um repack com tudo intacto; um
contentor de maior 2 é recusado.

## Escritores {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (escrever, ler, verificar, atualizar, repack), usado pela ferramenta de
  empacotamento e pela ferramenta Tacview.
- Python: `container.py`, cerca de 140 linhas sobre o `zipfile` padrão, o mesmo
  ficheiro em cada conversor (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), para que nenhum conversor dependa de outro. Um
  conversor novo copia-o.
- O visualizador lê com
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
