---
title: "Sessões, pessoas e grupos"
parent: "Carregar dados"
nav_order: 4
lang: "pt"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sessões, pessoas e grupos

Uma **pessoa** é uma coisa em movimento (um jogador, um carro). Uma **equipa/grupo** é o lado a que pertencem. Uma **sessão** é uma partida ou uma volta. Veja o [glossário](glossary.md).

Uma linha de um ficheiro pode indicar as três:

| x | y | tempo | jogador | equipa | partida |
|---|---|---|---|---|---|
| 10,5 | -30,2 | 12,0 | Blue 1 | Blue | Match 01 |

`player` é a pessoa, `team` é o grupo, `match` é a sessão.

Três colunas opcionais descrevem *quem* e *em que parte da história* pertence uma linha. Cada uma é codificada em dicionário ao carregar: os valores de texto tornam-se pequenos ids inteiros por linha, mais uma lista de etiquetas, partilhada por todos os ficheiros do carregamento.

## Pessoa {#person}

A coluna **ID da pessoa** indica a coisa em movimento a que uma linha pertence: um jogador, um bot, um carro. É guardada como um id de 32 bits por linha.

Com uma coluna de pessoa e uma coluna de tempo, o carregamento calcula o **tempo de vida** de cada linha: o tempo até à amostra seguinte da mesma pessoa *na mesma sessão*, ou "nenhum" (um valor sentinela, -1) quando não há amostra seguinte - a pessoa morreu, saiu, ou o registo acabou. Os tempos de vida alimentam o histórico **Tempo de vida** da [linha do tempo](timeline.md), a interpolação e a obsolescência na [caixa de repetição](box-replay.md), e as quebras de percurso do [calor em linhas](line-heat.md). O que uma linha sem sucessora faz é uma definição de visualização (*Vida de reserva*), e não está gravado nos dados.

Cada pessoa recebe o grupo da sua **primeira** linha no tempo; essa atribuição colore a sua caixa na caixa de repetição e decide qual o interruptor de visibilidade de grupo que a esconde ali. Os modos de calor usam o grupo de cada linha.

### Nomes usados por várias coisas ao mesmo tempo {#names-worn-by-several-things-at-once}

Um nome nem sempre é uma só entidade: em algumas exportações, cada bot de cada partida regista-se com o mesmo nome. Unir duas amostras de uma destas "pessoas" - por interpolação, um rasto ou um percurso - desenha uma linha entre duas criaturas diferentes através do mapa.

No carregamento ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)), um nome fica marcado como **partilhado** quando dois registos dele

- estão na mesma sessão,
- têm o mesmo tempo,
- são do mesmo tipo (cada coluna de categoria mantida tem o mesmo valor), e
- estão mais afastados do que 1% da diagonal da extensão dos dados.

Os nomes partilhados são desenhados como amostras isoladas - sem interpolação, sem rasto, sem percurso de calor em linhas. Tudo o resto sobre eles (o seu calor) não é afetado. O painel Conjunto de dados indica quantos nomes foram marcados, com até três exemplos, e o painel da caixa de repetição repete a contagem.

## Sessão {#session}

A coluna **Sessão / partida** indica a que partida, incursão, ronda, corrida ou volta pertence uma linha. É ela que faz das amostras de uma pessoa um só trajeto contínuo: a telemetria real muitas vezes intercala partidas simultâneas, e a amostra de um jogador logo antes da cabeça de reprodução e a que vem logo depois podem ser de partidas diferentes, a centenas de metros uma da outra. Com uma coluna de sessão:

- a interpolação, os rastos e os percursos do calor em linhas nunca atravessam uma mudança de sessão;
- o tempo de vida de uma linha acaba no fim da sua própria sessão;
- o seletor de **Sessão** aparece no topo da barra lateral, por baixo da barra de modos.

Uma coluna de sessão é muitas vezes um *carimbo temporal* - o instante de início da partida, repetido em cada linha dessa partida. Por esta razão, o mapeamento automático procura os nomes de sessão antes dos de pessoa e grupo ([Mapeamento de colunas](column-mapping.md#session-person-group)). Uma volta ou um turno de corrida também é uma sessão: duas voltas do mesmo carro não podem ser unidas num só trajeto.

### O seletor de sessão {#the-session-picker}

![O seletor de Sessão aberto num ficheiro de dez partidas: Todas as sessões (10), Match 01, Match 02 e assim por diante](../assets/img/en/sessions-persons-groups-picker.webp)

*Dez partidas num só ficheiro: escolha uma ou veja todas.*

Mostrado quando o conjunto de dados tem sessões listadas (veja o limite abaixo).

| Parte | Significado |
|---|---|
| Etiqueta à direita | O número de linhas da sessão escolhida, ou *todas de uma vez*. |
| Menu | *Todas as sessões (N)*, depois cada sessão, a mais movimentada primeiro, como `etiqueta - N linhas, duração` (duração em segundos abaixo de 90 s, em minutos abaixo de 90 min, em horas acima disso). |
| Dica a âmbar | Mostrada em *Todas as sessões*: as posições continuam a nunca ser unidas entre sessões, mas partidas simultâneas põem jogadores não relacionados juntos no mapa. |
| Dica | Mostrada nos modos de calor quando uma sessão está escolhida: a escolha só move a cabeça de reprodução. |

No carregamento, é selecionada a sessão mais movimentada. Escolher uma sessão leva a cabeça de reprodução ao início dessa sessão.

O que a seleção muda:

- Na **[caixa de repetição](box-replay.md)** decide qual sessão é reproduzida: só as caixas e os rastos dessa sessão são desenhados, e o intervalo da linha do tempo passa a ser a duração própria da sessão.
- Nos **modos de calor** não limita o calor, e uma dica por baixo do seletor diz isso: *Nos modos de calor isto só move a cabeça de reprodução para o início da sessão; o calor continua a contar todas as sessões. A caixa de repetição reproduz só a sessão escolhida.* Para limitar o calor a uma sessão, mantenha também a coluna de sessão como coluna de filtro (*Guardar para filtragem*) e filtre por ela. Uma coluna pode ser ao mesmo tempo a coluna de sessão e uma coluna de filtro: o carregador lê cada coluna de filtro marcada por si, seja qual for o papel que também desempenha.

### Sessões demais {#too-many-sessions}

São listadas até **100 000** sessões. Acima disso, a coluna é na verdade um id (uma pasta com milhões de sessões de uma mão cheia de linhas cada), e enviar tantas etiquetas do trabalhador para a página é o que deixa um separador sem memória. O carregamento mantém então os **ids** da sessão - por isso as fronteiras continuam a ser respeitadas em todo o lado - mas descarta as etiquetas e o seletor, e o painel Conjunto de dados diz isso.

## Grupo {#group}

A coluna **Equipa / grupo** é qualquer coluna de baixa cardinalidade: uma equipa, um lado, um esquadrão, uma fação, uma marca de jogador contra IA, uma classe de carro. É guardada como um id de 16 bits por linha e comanda:

- a [Lista de equipas](teams-list.md) (visibilidade por grupo, lados + / −),
- o [calor por equipa](team-heat.md) (uma tonalidade por grupo),
- a divisão da [diferença](difference.md) por grupo,
- as cores das caixas na [caixa de repetição](box-replay.md) (uma família de tonalidades por grupo, um tom por membro).

### Limites {#limits}

No máximo **4 096** grupos distintos. O id do grupo viaja no quarto canal do texel de posição de cada linha na GPU, e cada grupo precisa de um texel na tabela de sinais de 4 096 de largura que o shader lê para decidir *escondido*, *somado* ou *subtraído*. Uma coluna com mais valores distintos é um id, não um grupo: **o carregamento mantém cada linha e descarta só o agrupamento**, com um aviso no conjunto de dados que sugere mapeá-la como coluna de pessoa, ou mantê-la como coluna de filtro.

O mesmo limite de 4 096 aplica-se a uma coluna de filtro de *categoria* mantida; uma mais larga não é mantida, e o conjunto de dados diz isso. Uma coluna numérica (um carimbo temporal, por exemplo) não tem esse limite como filtro de *intervalo*.

Os valores de grupo `0`, um valor vazio, `none`, `unknown`, `null` e `-1` (sem distinção de maiúsculas) significam "sem grupo" para o [calor por equipa](team-heat.md), que os desenha a cinzento neutro em vez de uma cor com confiança.

## Tamanho da entidade {#entity-size}

O tamanho de uma coisa seguida - a caixa de colisão de um jogador, um carro - decide quão grandes são desenhadas as caixas e os raios de olhar da [caixa de repetição](box-replay.md). O painel não tem um campo para isto; vem das [sugestões `heat3d`](data-formats.md#the-heat3d-hints) do ficheiro (`entity.size`, nas unidades do próprio ficheiro; o conversor de CS2 escreve 32). O carregamento multiplica-o pela escala de unidades.

Em cada carregamento ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), sendo *extensão* o maior dos intervalos de X e Z dos dados:

| Definição | Com um tamanho de entidade | Sem |
|---|---|---|
| Tamanho do cubo | tamanho da entidade | extensão / 500 |
| Comprimento do raio de olhar | tamanho da entidade × 4 | extensão / 200 |
| Raio do sprite | extensão / 120 | extensão / 120 |
| Ponto de saturação | estimativa analítica (depois medida) | igual |
| Velocidade de voo | extensão / 12 | igual |
| Plano distante | extensão × 12 | igual |
| Plano próximo | max(0,05; extensão / 20 000) | igual |

## O painel Conjunto de dados {#the-dataset-panel}

Por baixo do painel Origem. Com um conjunto de dados carregado mostra:

- o **nome** do conjunto - a seleção, o número de linhas, o número de ficheiros, o passo quando um foi usado;
- **`N equipas · N pessoas · Ns de duração`**;
- cada **aviso** que o carregamento produziu, a âmbar, enquanto o conjunto estiver carregado: grupos ou uma coluna de filtro descartados por terem valores a mais, sessões não listadas, nomes partilhados, linhas em falta, ficheiros ignorados;
- o [gerador sintético](synthetic-generator.md);
- **Remover**, que retira o conjunto de dados.

O número de linhas aparece no cabeçalho do painel.
