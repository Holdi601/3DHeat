---
title: "Mapeamento de colunas"
parent: "Carregar dados"
nav_order: 2
lang: "pt"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Mapeamento de colunas

Um ficheiro é uma tabela, e o 3DHeat tem de saber qual coluna tem a posição leste-oeste, qual tem o tempo, qual tem o nome do jogador, e assim por diante. Este painel é onde se diz o que foi adivinhado, e onde se corrige uma suposição errada.

![O painel Mapeamento de colunas depois de carregar um ficheiro Parquet: todas as caixas já preenchidas - 1 X, 2 Y, 3 Z, 4 Tempo, 5 ID da pessoa, 6 Sessão / partida, 7 Equipa / grupo](../assets/img/en/column-mapping-panel.webp)

*O ficheiro deu o nome às suas próprias colunas, por isso todas as caixas já estão preenchidas.*

Por exemplo, um CSV com o cabeçalho `x,y,z,t,player,team` mapeia-se sozinho: x, y e z tornam-se a posição, `t` o tempo, `player` a [pessoa](glossary.md) e `team` o [grupo](glossary.md).

Depois de escolher os ficheiros, o painel **Mapeamento de colunas** abre por baixo do painel Origem. Diz que coluna desempenha que papel. É preenchido automaticamente, e cada campo pode ser alterado antes de carregar em **Carregar**; o mapeamento é lido no momento do carregamento, por isso, se o mudar depois, é preciso carregar de novo.

## Os campos {#the-fields}

Todos os menus de colunas listam cada coluna do primeiro ficheiro, mais *- nenhuma -*.

| Campo | Papel | Notas |
|---|---|---|
| **Separador** | Só CSV: o delimitador de campos. | Menu: *Vírgula ,*, *Ponto e vírgula ;*, *Tabulação*, *Barra vertical \|*, *Espaço*; ou escreva qualquer carácter único em *ou escreva um carácter*. Detetado automaticamente (veja abaixo). Mudá-lo volta a correr o mapeamento automático, por isso as edições feitas antes perdem-se. |
| **X**, **Y**, **Z** | Posição. | São precisos pelo menos dois; um terceiro eixo não mapeado é 0 (os dados ficam num plano). A mesma coluna em dois eixos é um erro. |
| **Eixo vertical na origem** | Que eixo da origem aponta para cima. | *Z é vertical (a maioria dos motores de jogo)* ou *Y é vertical (convenção gráfica)*. Veja [Eixos, unidades e tempo](axes-units-and-time.md). |
| **Escala de unidades** | Multiplica cada posição. | Botões *1 (m)* e *0,01 (cm→m)*, ou escreva um valor. |
| **Inverter X / Inverter Y / Inverter Z** | Nega um eixo da origem. | Aplicado às posições e aos vetores de direção do olhar. |
| **Tempo** | O eixo do tempo. | Opcional. Sem ele não há linha do tempo. |
| **Unidade de tempo** | Como ler a coluna de tempo. | Sete unidades; veja [Eixos, unidades e tempo](axes-units-and-time.md#time). Ignorada nas colunas Parquet `TIMESTAMP`/`DATE`, o que o painel indica. |
| **ID da pessoa** | A quem ou a quê pertence cada linha. | Opcional. Torna possíveis os trajetos, os tempos de vida, a caixa de repetição e o calor em linhas. |
| **Sessão / partida** | A que partida, incursão, ronda, corrida ou volta pertence cada linha. | Opcional. As posições nunca são interpoladas, arrastadas ou ligadas num percurso através de uma mudança de sessão. Veja [Sessões, pessoas e grupos](sessions-persons-groups.md). |
| **Equipa / grupo** | Qualquer coluna de baixa cardinalidade. | Opcional. Comanda as cores dos grupos, o calor por equipa e a divisão da diferença por grupo. |
| **Direção do olhar** | *Nenhuma*, *Colunas de guinada / inclinação* ou *Colunas de vetor de direção*. | Com guinada/inclinação: **Guinada**, **Inclinação** e **Unidade de ângulo** (*Graus* / *Radianos*). Com um vetor: **Dir X**, **Dir Y**, **Dir Z**. Usado para os raios de olhar da [caixa de repetição](box-replay.md). |
| **Guardar para filtragem** | Colunas extra mantidas em memória. | Uma caixa de seleção por coluna, e para cada uma marcada *intervalo* (numérica) ou *categoria*. Cada uma custa 4 bytes por linha e uma passagem de descodificação ao carregar. Só as colunas guardadas podem ser [filtradas](filters.md), usadas para uma [divisão de diferença](difference.md) ou como coluna de eventos do [calor em linhas](line-heat.md). |
| **Mostrar linhas de exemplo** | Uma tabela com as primeiras 12 linhas amostradas, todas as colunas. | Para verificar as suposições. |

Uma coluna de filtro marcada que não é definida explicitamente é lida como *intervalo*; uma coluna de identificador com aspeto numérico é muitas vezes mais útil como *categoria*. Só 4 filtros podem estar ativos ao mesmo tempo ([Filtros](filters.md)).

## Como o mapeamento automático adivinha {#how-the-auto-mapping-guesses}

A adivinhação está em [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts). Olha para os nomes das colunas, para quais são numéricas nas linhas amostradas (mais de 90% dos valores não vazios se leem como números), para quantos valores distintos cada coluna tem na amostra, e para os tipos lógicos do Parquet. Os padrões de nome são testados por ordem, sem distinguir maiúsculas, e o primeiro padrão que coincide com alguma coluna ainda livre ganha.

### Posição {#position}

| Eixo | Padrões de nome, por ordem (só colunas numéricas) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Se um eixo ainda estiver vazio, as primeiras colunas numéricas livres (ignorando `filename`, `level`, `year`, `month`, `day`, `hour`, `location`) preenchem-no por ordem. Uma suposição errada nota-se logo no ecrã; um eixo vazio deixaria a vista em branco.

### Tempo {#time}

- **Primeiro as colunas de carimbo temporal do Parquet.** Entre as colunas cujo tipo lógico é `TIMESTAMP` ou `DATE`, a melhor é escolhida por pontuação: +10 000 se o nome coincide com um padrão de tempo, -5 000 para um `DATE` simples, mais o número de valores distintos na amostra. Uma data de dia inteiro e um início de sessão constante têm quase nenhuns valores distintos, por isso ganha o instante do evento. A unidade fica então *Carimbo Unix (ms)*.
- **Senão, pelo nome:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`, `tick`, `…frame…`, depois nomes de tempo decorrido (`gdur`, `g_duration`, `…duration…`, `…elapsed…`, `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). A unidade é então adivinhada a partir dos valores: ISO-8601 quando um valor tem o aspeto de `AAAA-MM-DDT…` ou `AAAA-MM-DD …`; senão pela maior grandeza: acima de 10^17 nanossegundos, acima de 10^14 microssegundos, acima de 10^11 milissegundos Unix, acima de 10^8 segundos Unix, acima de 10^6 milissegundos, senão segundos.

Quando se escolhe uma coluna de tempo decorrido, o painel indica que cada sessão fica então alinhada com o seu próprio início - bom para sobrepor partidas, não para as ver na sequência real.

### Sessão, pessoa, grupo {#session-person-group}

A sessão é reclamada **depois** do eixo do tempo e **antes** da pessoa e do grupo, porque uma coluna de sessão é muitas vezes um carimbo temporal (o instante de início da partida em cada linha da partida).

| Papel | Padrões de nome, por ordem |
|---|---|
| Sessão | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (cada um exatamente, opcionalmente com `_id`) |
| Pessoa | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, depois `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (dados de corrida: o carro é o que se move) |
| Grupo | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupo, alternativa | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Um candidato a grupo que toma um valor distinto na maioria das linhas amostradas (mais de max(48, 60% da amostra)) é um identificador, não um grupo: passa a ser a coluna de pessoa se nenhuma foi encontrada, e não é usado como grupo. Se nenhuma coluna de grupo foi encontrada, usa-se a coluna não numérica com menos valores distintos entre 2 e 12.

### Direção do olhar {#look-direction}

Uma coluna numérica chamada `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` ou `rot_z` / `rotation_z` passa a direção do olhar para guinada/inclinação; a inclinação é procurada como `pitch`, `…rot…pitch…`, `…elevation…angle…`, `…view…pitch…`. Assume-se graus quando alguma guinada amostrada excede 7 em valor absoluto, senão radianos. Um vetor de direção nunca é adivinhado; vem das sugestões abaixo ou de si.

### Colunas de filtro {#filter-columns}

No máximo **6** colunas são mantidas automaticamente, por ordem:

1. `region`, `sessionMode`, `actor` - colunas que existem para serem filtradas (pontuação 1200);
2. colunas de categoria que variam na amostra, primeiro as de menos valores distintos (1000 menos a contagem);
3. uma coluna constante na amostra, mas só quando vários ficheiros são carregados - pode variar entre ficheiros, como uma região ou um id de sessão de teste (600);
4. colunas numéricas (500).

As colunas que já desempenham um papel, os nomes de ruído acima, as colunas constantes num carregamento de um só ficheiro e as colunas de texto livre (mais de max(16, metade da amostra) valores distintos) não são oferecidas automaticamente. Qualquer coluna pode ainda ser marcada à mão.

### Eixo vertical {#up-axis}

Com os três eixos mapeados, o eixo com a menor dispersão de Y e Z na amostra é tomado como vertical (um mapa é muito mais largo do que alto); caso contrário, assume-se Z vertical.

## As sugestões `heat3d` no rodapé de um Parquet {#the-heat3d-hints-in-a-parquet-footer}

Um ficheiro Parquet pode indicar como deve ser lido. Se os metadados chave/valor do rodapé do ficheiro tiverem uma entrada com a chave **`heat3d`**, o seu valor é interpretado como JSON e sobreposto às suposições ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). O conversor de demos de CS2 escreve uma entrada destas, por isso as suas tabelas abrem com o jogador como pessoa, o lado como grupo, cada ronda como sessão, a direção do olhar ligada e o mundo na orientação certa.

Só o **primeiro** ficheiro de uma seleção é lido para as sugestões. Cada entrada é opcional, e cada valor sugerido continua a aparecer no painel e pode ser alterado. Uma descrição completa do esquema, com um exemplo e a forma de o escrever, está na [Referência de formatos de dados](data-formats.md#the-heat3d-hints).

As regras, em resumo:

- Uma coluna nomeada por uma sugestão só é aplicada quando o ficheiro tem essa coluna.
- `lookMode: "vector"` só entra em vigor quando `dirX`, `dirY` e `dirZ` estão todos definidos; `"yawPitch"` só quando `yaw` está definido.
- `extra`, quando presente, substitui a lista automática de filtros (nomes desconhecidos e colunas que já desempenham um papel são descartados); o tipo intervalo/categoria de cada uma segue se parecia numérica. Quando ausente, a lista automática mantém-se menos qualquer coluna a que uma sugestão tenha dado um papel.
- `axes.up` tem de ser `"y"` ou `"z"`, as inversões têm de ser booleanas, `scale` tem de ser positivo.
- `entity.size`, quando positivo, é o tamanho de uma coisa seguida no ficheiro, nas unidades dele ([tamanho da entidade](sessions-persons-groups.md#entity-size)); é a única forma de o definir.

## Problema conhecido: alterar o separador do CSV {#known-issue-overriding-the-csv-separator}

Quando muda o separador para um diferente do detetado, a lista de colunas e as linhas de exemplo não mudam (a pré-visualização continua a dividir com o separador detetado). O separador escolhido continua a ser usado no próprio carregamento. Se o separador detetado estiver errado:

1. Abra o ficheiro num editor de texto.
2. Substitua o separador por uma vírgula em todo o lado (e as vírgulas decimais por pontos).
3. Guarde e carregue o ficheiro de novo.

A causa está em [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
