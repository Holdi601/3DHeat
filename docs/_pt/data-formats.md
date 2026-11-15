---
title: "Referência dos formatos de dados"
nav_order: 19
lang: "pt"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referência dos formatos de dados

Esta página lista todos os tipos de ficheiro que o 3DHeat pode abrir e o que uma tabela dentro deles tem de ter. Uma tabela são linhas e colunas, como numa folha de cálculo: cada linha diz onde algo esteve e, se o tiver, quando e quem.

O que o separador Mapa de calor lê, coluna a coluna, e as pistas que um ficheiro Parquet pode trazer. (O separador Análise de corrida lê ficheiros de voltas, e o separador Partida os resumos de partidas; veja [Análise de corrida](race-analysis.md) e [Análise de partida](match-analysis.md).)

## Ficheiros {#files}

Esta é a lista completa dos ficheiros que se podem carregar. O painel **Origem** (**Ficheiros…**, **Pasta…**, ou arrastar e largar) aceita exatamente estes:

| Extensão | O que é | Lido por |
|---|---|---|
| `.parquet`, `.pq` | Tabela Parquet | o leitor Parquet (abaixo) |
| `.csv`, `.tsv`, `.txt` | Texto com delimitadores | o leitor de texto (abaixo) |
| `.3dheat` | Uma partida num só ficheiro (um ZIP que guarda a tabela e os seus extras) | carrega como a tabela que contém - [Um ficheiro por partida](container.md) |
| `.acmi` (também `.txt.acmi`, `.zip.acmi`) | Gravação de voo do Tacview | o seu leitor próprio - [Gravações do Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | Gravação OCAP (estilo Arma) | o seu leitor próprio |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | Percursos GPS: GPX, KML/KMZ, registos NMEA, registos de voo à vela IGC, ficheiros FIT de desporto | o seu leitor próprio; as posições vêm da latitude e da longitude |

Não são carregados como posições: os pequenos ficheiros JSON que ficam ao lado de uma tabela para a descrever (nomes que terminam em `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), nem as tabelas extra de um conversor (`<partida>.events.parquet` e semelhantes, veja [Conversores](converters.md)), a menos que as escolha sozinhas. Todos os outros são ignorados, com a razão indicada. Como uma seleção é filtrada está explicado em [Carregar ficheiros](loading-files.md#which-files-are-kept).

Os ficheiros vazios são ignorados. Numa seleção que contém ficheiros `movement*.<extensão>`, só esses são carregados ([Carregar ficheiros](loading-files.md#which-files-are-kept)).

Os dados são **uma linha por amostra**: uma posição num momento, opcionalmente com quem, que grupo, que sessão, para onde estava a olhar, e outras colunas. As linhas de eventos (um abate, a colocação de uma bomba, um disparo) podem estar na mesma tabela que as linhas de posição, distinguidas por uma coluna de evento.

## Texto com delimitadores (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Um ficheiro mínimo útil, com três linhas:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

As colunas associam-se sozinhas ([Associação de colunas](column-mapping.md)).

É lido por um analisador ao nível dos bytes que descodifica só as colunas associadas ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspeto | Regra |
|---|---|
| Cabeçalho | A primeira linha não vazia tem os nomes das colunas. Um nome vazio passa a `column_N`. |
| Delimitador | Detetado nas primeiras 20 linhas não vazias do primeiro 1 MiB, entre vírgula, ponto e vírgula, tabulação e barra vertical, por **consistência**: ganha o delimitador que dá o mesmo número de campos em todas as linhas analisadas; depois, o que dá mais campos. O espaço nunca é detetado mas pode ser escolhido; pode escrever-se qualquer carácter único ([Associação de colunas](column-mapping.md#the-fields)). |
| Aspas | RFC 4180: os campos podem estar entre aspas duplas; `""` dentro de aspas é uma aspa literal. |
| Espaços | Os espaços, tabulações e aspas no início e no fim de cada campo são retirados. |
| Campos por linha | No máximo 4 096; mais do que isso é um erro (*o delimitador está certo?*). |
| Números | Sinal opcional, dígitos, `.` opcional e decimais, expoente opcional (`1.5e-3`). A vírgula decimal (`1,5`), os separadores de milhares ou as unidades no fim (`12 m`) não são lidos e contam como em falta. Se o seu ficheiro usa vírgulas decimais, substitua-as por pontos antes de carregar (substituir por localizar num editor de texto funciona). |
| Coluna numérica | Uma coluna é oferecida como numérica quando mais de 90% dos valores não vazios nas primeiras 50 linhas são lidos como números. |
| Número de linhas | Estimado antes de carregar, a partir do comprimento médio das linhas do primeiro 1 MiB. |
| Codificação do texto | UTF-8. |

## Parquet {#parquet}

Lido com [hyparquet](https://github.com/hyparam/hyparquet), bloco de colunas a bloco de colunas, para arrays tipados, pedindo só as colunas associadas ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspeto | Regra |
|---|---|
| Número de linhas | Exato, a partir do rodapé, antes de carregar. |
| Pré-visualização | As primeiras 50 linhas, descodificadas como objetos; os seus valores decidem quais as colunas que parecem numéricas. |
| Inteiros | `INT32`, e `INT64` (descodificado como BigInt) passam a números. |
| Decimais | `FLOAT`, `DOUBLE`. |
| Booleanos | 1 e 0. |
| Textos | Usados para as colunas de pessoa, grupo, sessão e categoria; um texto que parece número é aceite para funções numéricas. |
| Tipos lógicos `TIMESTAMP` e `DATE` | Descodificados como instantes (milissegundos desde 1970); usados como eixo de tempo, a definição da unidade é ignorada. |
| Colunas aninhadas | As colunas de estrutura e de lista não se destinam a nenhuma função (pré-visualizam-se como texto JSON); não testado. |
| Metadados do rodapé | A chave `heat3d` é lida como pistas de associação (abaixo). |

Uma coluna de posição, de tempo ou de olhar que tenha outra coisa que não um número é descodificada como em falta.

## Funções e tipos das colunas {#column-roles-and-types}

| Função | Tipo no ficheiro | Obrigatório | Guardado como | Limites |
|---|---|---|---|---|
| X, Y, Z | número | dois de três | decimal de 32 bits, depois do [mapeamento dos eixos](axes-units-and-time.md) | Uma linha sem posição utilizável é descartada. |
| Tempo | número numa das [unidades de tempo](axes-units-and-time.md#time-units), instante Parquet ou texto ISO-8601 | não | segundos em decimal de 32 bits, a partir da linha mais antiga | A ordenação é recusada acima de 400 000 000 linhas ([porquê](memory-and-budgets.md#the-sort-ceiling)). |
| Pessoa | qualquer; codificado por dicionário | não | id de 32 bits | |
| Sessão | qualquer; codificado por dicionário | não | id de 32 bits | Listam-se rótulos até 100 000 sessões. |
| Grupo | qualquer; codificado por dicionário | não | id de 16 bits | Até 4 096 grupos; caso contrário, o agrupamento é descartado. |
| Rumo, inclinação | número, em graus ou radianos | não | decimal de 32 bits em radianos | |
| Direção X, Y, Z | número | não (as três juntas) | convertido em rumo e inclinação | |
| Coluna de filtro, *intervalo* | número | não | decimal de 32 bits | Até 4 filtros ativos ao mesmo tempo. |
| Coluna de filtro, *categoria* | qualquer; codificado por dicionário | não | id de 32 bits | Até 4 096 valores; caso contrário, a coluna não é guardada. |

Uma coluna Parquet `TIMESTAMP` guardada como coluna de filtro é um *intervalo* de milissegundos desde a época - um deslizador, não uma lista.

## As pistas `heat3d` {#the-heat3d-hints}

Um ficheiro Parquet pode trazer as suas próprias instruções de leitura nos metadados de chave/valor do rodapé, na chave **`heat3d`**, como um objeto JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). O visualizador aplica-as por cima das suas próprias suposições quando o ficheiro é o primeiro de uma seleção; cada entrada é opcional e cada resultado continua a ser mostrado e editável no painel [Associação de colunas](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Tudo o que não se lê como um objeto JSON é ignorado.

### Esquema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          nomes das colunas da posição
    "time": string,                                  a coluna do tempo
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           colunas de filtro a manter, as mais úteis primeiro
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  tem de ser > 0
  },
  "entity": {
    "size": number                                   tamanho de uma coisa seguida, em unidades do ficheiro, > 0
  }
}
```

| Entrada | Aplicada quando | Efeito |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | a coluna indicada existe no ficheiro | Define essa função. |
| `columns.timeUnit` | é uma das sete unidades | Define a unidade de tempo. |
| `columns.angleUnit` | `"degrees"` ou `"radians"` | Define a unidade dos ângulos. |
| `columns.lookMode` | `"vector"` com dirX, dirY e dirZ todos definidos; `"yawPitch"` com yaw definido; `"none"` | Define o modo de olhar. |
| `columns.extra` | é uma lista | Substitui a lista automática de filtros, mantendo só as colunas existentes que não são usadas por uma função; cada uma é *intervalo* quando parecia numérica na pré-visualização, senão *categoria*. Sem ela, a lista automática mantém-se, menos qualquer coluna que uma pista tenha atribuído a uma função. |
| `axes.up` | `"y"` ou `"z"` | Eixo vertical. |
| `axes.flipX/Y/Z` | um booleano | Inversões. |
| `axes.scale` | um número > 0 | Escala de unidades. |
| `entity.size` | um número > 0 | [Tamanho da entidade](sessions-persons-groups.md#entity-size) (multiplicado pela escala de unidades ao carregar). É a única forma de o definir. |

### Exemplo {#example}

Uma exportação inventada de um jogo de tiro: eixo Z para cima, centímetros, um mundo de sistema esquerdo, jogadores com cerca de 72 cm de largura.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Como escrever {#writing-it}

Com pyarrow, os metadados de esquema personalizados são escritos nos metadados de chave/valor do ficheiro:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` mostra o esquema de um ficheiro, o que é uma forma rápida de verificar os nomes das colunas a que as pistas se referem.

## O que o separador Mapa de calor escreve {#what-the-heatmap-tab-writes}

Nada é escrito de volta nos dados. As saídas são:

- vídeos, em WebM (VP9 ou VP8) - [Percurso da câmara e vídeo](camera-path-and-video.md);
- uma posição da câmara, copiada para a área de transferência como texto - [Câmara](camera.md#pose);
- níveis guardados na [biblioteca de níveis](level-library.md) do navegador.
