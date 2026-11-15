---
title: "Carregar ficheiros"
parent: "Carregar dados"
nav_order: 1
lang: "pt"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Carregar ficheiros

Esta página mostra como dar ao 3DHeat os seus ficheiros e o que ele faz com eles. Largue uma pasta, e ele escolhe os ficheiros que têm posições e junta-os numa só imagem.

1. Abra **Origem** no topo da barra lateral do Mapa de calor.
2. Largue ficheiros ou uma pasta na zona de largar, ou carregue em **Ficheiros…** ou **Pasta…**.
3. Leia a linha da seleção e a **Estimativa de memória** (veja a imagem abaixo).
4. Carregue em **Carregar**.

![O painel Origem depois de largar uma pasta com dez partidas: 1 a linha da seleção, 2 a Estimativa de memória, com «cabe», e 3 Carregar 10 ficheiros](../assets/img/en/loading-files-source.webp)

*Depois de largar uma pasta, o 3DHeat diz-lhe o que encontrou e se cabe.*

Os ficheiros são carregados no painel **Origem**, no topo da barra lateral do separador Mapa de calor. Tudo o que é escolhido de uma vez torna-se **um** só conjunto de dados.

## Escolher ficheiros {#choosing-files}

| Controlo | O que faz |
|---|---|
| **Largue aqui ficheiros ou uma pasta** (a zona de largar) | Largue qualquer mistura de ficheiros e pastas. As pastas são percorridas em profundidade. Clicar na zona de largar abre o mesmo seletor que **Ficheiros…**. |
| **Um ficheiro…** | Um seletor de ficheiros para um só ficheiro. |
| **Ficheiros…** | Um seletor de ficheiros que aceita vários ficheiros. |
| **Pasta…** | Um seletor de pastas (o seletor `webkitdirectory` do navegador); cada ficheiro da árvore da pasta é oferecido. |

Os seletores aceitam os tipos de ficheiro da [lista de ficheiros carregáveis](data-formats.md#files). Em resumo: `.parquet`/`.pq` são lidos como Parquet, `.csv`/`.tsv`/`.txt` como texto delimitado, `.acmi` (Tacview), `.json`/`.json.gz` do OCAP e os formatos GPS (GPX, KML, KMZ, NMEA, IGC, FIT) passam pelos seus próprios leitores, e os contentores `.3dheat` de partidas carregam-se como as tabelas que contêm ([Um ficheiro por partida](container.md)). Um contentor que não pode ser lido é ignorado, como *não é um ficheiro csv/parquet*.

As pastas largadas são percorridas até 12 níveis de profundidade e no máximo 20 000 ficheiros, como proteção contra ciclos de ligações simbólicas e árvores descontroladas.

## Quais ficheiros são mantidos {#which-files-are-kept}

Antes de se ler seja o que for, a seleção é filtrada ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Um ficheiro com outra extensão é ignorado: *não é um ficheiro csv/parquet*.
- Um ficheiro com 0 bytes é ignorado: *vazio (0 bytes)*.
- **Os ficheiros auxiliares do conversor** - os dados brutos que um conversor guarda ao lado da tabela de uma partida, `<partida>.messages.parquet`, `.events.parquet`, `.raw.parquet` e os outros listados em [Os conversores guardam tudo](converters.md) - são ignorados: *um ficheiro auxiliar do conversor*. Para abrir um deles, escolha-o ou largue-o sozinho (ou só ficheiros auxiliares): uma seleção só de auxiliares carrega-os como qualquer tabela. O JSON ao lado de uma tabela (`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` e `.hints.json`) nunca é oferecido como posições.
- **A regra do ficheiro de movimento.** Se algum ficheiro da seleção se chamar `movement*.parquet`, `movement*.csv` (e as outras extensões) - `movement.parquet`, `movement_1.parquet` e assim por diante - então todos os outros ficheiros de dados são ignorados: *não é um ficheiro de movimento, e esta pasta tem ficheiros de movimento*. As exportações de telemetria têm muitas vezes uma tabela de posições ao lado de dezenas de tabelas sem posições, e só a primeira pode ser desenhada. Uma pasta sem nenhum ficheiro de movimento carrega todos os seus ficheiros de dados. Exemplo: uma pasta com `movement_1.parquet`, `kills.parquet` e `shop.parquet` carrega `movement_1.parquet`; os outros dois aparecem como ignorados. Exemplo: uma pasta com `movement_1.parquet`, `kills.parquet` e `shop.parquet` carrega `movement_1.parquet`; os outros dois aparecem como ignorados.
- Os ficheiros mantidos são ordenados pelo seu caminho dentro da seleção, para que a mesma pasta dê sempre o mesmo conjunto de dados e as mesmas cores.

O painel mostra depois a seleção (o nome de um ficheiro, ou `pasta (N ficheiros)` usando a pasta comum mais longa), o número de ficheiros, o seu tamanho total e o número total de linhas - exato quando todos são Parquet, marcado com `≈` quando algum é CSV. Os ficheiros ignorados são listados com o motivo, os primeiros quatro pelo nome.

## Ler o esquema {#reading-the-schema}

O **primeiro** ficheiro da seleção é aberto para descrever o esquema ("A ler o esquema"): os nomes das suas colunas, as suas primeiras 50 linhas de dados, quais as colunas que parecem numéricas e, para Parquet, o tipo lógico de cada coluna e a entrada `heat3d` do rodapé. Uma pasta de exportações de uma mesma tabela partilha um esquema, por isso um ficheiro representa todos. Depois, cada ficheiro é medido ("A contar linhas"): o rodapé de um Parquet dá a contagem exata numa pequena leitura; a contagem de um CSV é estimada a partir do comprimento médio das linhas do seu primeiro megabyte.

O painel de [Mapeamento de colunas](column-mapping.md) abre com as suposições automáticas, e a [estimativa de memória](memory-and-budgets.md) aparece por cima do botão **Carregar**.

## Mensagens antes de carregar {#messages-before-loading}

Por baixo da seleção, o painel lista, a partir de [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Erros** (a vermelho) - o carregamento não pode começar: menos de dois eixos de posição, a mesma coluna em dois eixos, uma coluna mapeada que não está no ficheiro, uma coluna de posição que não parece numérica, uma coluna de tempo cujos valores amostrados são texto enquanto a unidade é um número (cada linha seria NaN e ficaria no tempo 0), uma coluna de tempo definida como ISO-8601 em que nenhum valor amostrado se interpreta como data, uma escala de unidades de 0.
- **Avisos** (a âmbar) - carrega, mas provavelmente não como pretendido: uma coluna de grupo que toma um valor distinto na maioria das linhas amostradas (por isso é um id, não um grupo), uma coluna de tempo `DATE` (cada linha de um dia partilha o mesmo instante), direção do olhar definida sem as suas colunas.
- **Notas** - o que o mapeamento implica: desenho num plano quando um eixo não está mapeado, sem linha do tempo sem coluna de tempo, sem trajetos sem coluna de pessoa, e sem coluna de grupo uma cor para tudo e uma diferença que só pode dividir por uma coluna guardada para filtragem.

## Carregar {#loading}

O botão **Carregar** diz *Carregar ficheiro*, *Carregar N ficheiros*, ou *Carregar N ficheiros (1 em K)* quando um [passo de decimação](memory-and-budgets.md#decimation) está definido. Diz *Demasiado grande - reduza ou aplique decimação* e fica desativado quando a [verificação de caber](memory-and-budgets.md#the-fit-check) diz que o carregamento não cabe; fica também desativado enquanto o mapeamento tiver erros ou outro carregamento estiver a correr.

Durante o carregamento, o painel mostra o passo atual (com `[ficheiro/ficheiros]` à frente quando há vários), as linhas lidas até ao momento, uma barra de progresso e **Cancelar**. Cancelar termina o trabalhador de importação e, com ele, os trabalhadores de leitura que tiver iniciado.

A página continua a desenhar-se enquanto carrega, porque o trabalho decorre em segundo plano. Vê o passo atual, as linhas lidas, uma barra de progresso e **Cancelar**. Depois do último ficheiro, o painel mostra os passos *A pôr as linhas por ordem de tempo*, *A reordenar colunas (n de m)*, *A medir a extensão*, *A construir a lista*, *A resumir as sessões* e *A calcular os tempos de vida*, e depois *A enviar N linhas para a GPU* durante uma imagem, para que um envio longo nunca seja tomado por um bloqueio.

### Como funciona {#how-it-works}

O carregamento corre num Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)). Com vários ficheiros e mais de uma [linha de leitura](memory-and-budgets.md#parser-threads), até esse número de ficheiros é lido **ao mesmo tempo**, cada um num trabalhador de leitura próprio ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)), na medida em que o orçamento de RAM deixe espaço. Continuam a ser juntados um de cada vez, pela ordem da seleção, por isso o conjunto de dados é o mesmo que num carregamento um a um. Enquanto vários estão em curso, a linha de progresso indica o ficheiro que reportou por último, e a barra e a contagem de linhas somam todos os ficheiros em curso. Com uma só linha, ou um só ficheiro, os ficheiros são lidos um após outro no próprio trabalhador de importação. Só são lidas as colunas que o mapeamento indica: uma coluna não mapeada de um ficheiro Parquet não custa nada; um CSV é percorrido byte a byte, mas só os campos mapeados são descodificados.

## Vários ficheiros tornam-se um conjunto de dados {#several-files-become-one-dataset}

Quando se carrega mais de um ficheiro ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Uma lista só.** Pessoas, grupos, sessões e valores de categoria são dicionários partilhados por todos os ficheiros, por isso a mesma pessoa em duas exportações é uma pessoa com um só trajeto.
- **Uma só origem do tempo.** Os tempos são guardados como segundos de 64 bits durante a junção e reajustados ao tempo mais antigo de *toda* a seleção, e depois guardados como segundos de 32 bits a partir dessa origem. Quatro exportações de quatro tardes são colocadas na sua ordem real, não empilhadas umas sobre as outras.
- **Uma só ordem do tempo.** As linhas de todos os ficheiros são ordenadas pelo tempo com uma ordenação radix (veja [o limite de ordenação](memory-and-budgets.md#the-sort-ceiling)).
- **Uma coluna `Source file`.** Cada linha lembra-se de que ficheiro veio, como uma coluna de categoria chamada `Source file`. Aparece em [Filtros](filters.md) e como *Source file - comparar duas cargas* na [divisão de diferença](difference.md). Um carregamento de um só ficheiro não a recebe - uma coluna constante custaria 4 bytes por linha para não dizer nada.
- **Colunas em falta.** Um ficheiro que não tem uma das colunas de *filtro* simplesmente não contribui com valores para ela. Um ficheiro que não tem uma coluna de *papel* mapeada (X, tempo, pessoa, ...) falha com *o ficheiro não tem a coluna "nome"*; num carregamento de vários ficheiros esse ficheiro é ignorado e os outros carregam na mesma, e os ficheiros ignorados ficam listados no conjunto de dados. Um carregamento de um só ficheiro que falha comunica o erro.
- **Aviso de falta.** Quando as linhas carregadas são menos de 95% das linhas contadas antes, o conjunto de dados leva um aviso com a parte que falta - de ficheiros ilegíveis ou de linhas sem uma posição utilizável, que são descartadas à entrada.

## Depois de carregar {#after-loading}

O novo conjunto de dados substitui qualquer anterior. A cada carregamento ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- todos os filtros e a visibilidade dos grupos são limpos;
- a divisão de diferença por grupo é reposta: a primeira metade dos grupos (arredondada para cima) positiva, o resto negativo;
- o raio dos sprites é definido como a extensão horizontal / 120 e a saturação como uma estimativa analítica; o tamanho do cubo, o comprimento do raio de olhar, a velocidade de voo e os planos próximo/distante são definidos a partir da extensão (veja [Sessões, pessoas e grupos](sessions-persons-groups.md#entity-size));
- a sessão da repetição da caixa passa a ser a sessão com mais linhas;
- os trajetos do calor de linhas são adivinhados de novo ([Calor em linhas](line-heat.md));
- o modo de vista volta a **Calor** se o modo atual não for suportado pelos novos dados; a linha do tempo volta a **Tudo** sem coluna de tempo, e o histórico volta a **Cumulativo** sem tempos de vida;
- a cabeça de reprodução fica no início e a reprodução para;
- a câmara enquadra o conjunto de dados inteiro a partir da direção por omissão (a olhar ao longo de -Z, inclinada cerca de 36° para baixo).

O painel **Conjunto de dados** mostra depois o nome do conjunto (a seleção, o número de linhas e de ficheiros, e o passo quando um foi usado), `N equipas · N pessoas · Ns de duração`, e cada aviso que o carregamento produziu, a âmbar, enquanto o conjunto estiver carregado. **Remover** nesse painel retira o conjunto de dados.
