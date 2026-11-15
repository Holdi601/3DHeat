---
title: "Análise em massa"
nav_order: 8
lang: "pt"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: false
---

# Análise em massa: milhares de partidas de uma vez

A **Análise em massa** mostra o que uma pasta inteira de partidas soma: que veículo ganha mais, que lado é favorecido, onde está a ação. Use-a quando tem muito mais partidas do que consegue ver.

Trabalha a partir de um pequeno resumo de cada partida, por isso mil ou dez mil partidas abrem depressa. Só carrega as linhas completas das partidas em que clica.

## Experimente {#try-it}

1. Abra a **Análise em massa** na barra lateral do Calor.
2. Carregue em **Pasta...** (ou **Ficheiros...**) e escolha as suas partidas `.3dheat`.
3. Espere enquanto o painel lê os resumos («Resumos... n de N»).
4. Carregue em **Abrir análise**. Abre-se uma janela com separadores.
5. Defina os filtros (Jogo, Mapa, Modo, De, Para) e depois leia um separador, por exemplo Balanceamento.
6. Clique numa linha, numa célula ou num insight: as partidas dele carregam-se na vista 3D, com a câmara no lugar.

![O separador Balanceamento: taxa de vitórias e abates por morte, por veículo](../assets/img/en/mass-balance.webp)

```
pasta de .3dheat -> resumos -> janela (separadores) -> clicar numa linha -> partidas abertas em 3D
```

Um ficheiro `.3dheat` é uma partida ([Um ficheiro por partida](container.md)). Um *mapa de calor* e uma *linha* são explicados no [glossário](glossary.md).

## Obter os resumos {#getting-the-summaries}

Não tem de fazer nada na maioria dos casos: o painel calcula sozinho os resumos que faltam. Para preparar uma pasta grande uma vez, use a ferramenta offline abaixo.

Cada partida `.3dheat` recebe um resumo (`src/mass/summarize.ts`), guardado no
contentor como o membro `<partida>.summary.json` (função `summary`, ver
[Um ficheiro por partida](container.md)). A ferramenta offline escreve-os, e um
índice por pasta. É uma ferramenta de programador; corra-a numa pasta grande para poupar ao painel o trabalho:

```
node tools/3dheat-summarize.mjs <pasta>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Uma partida já resumida (mesma versão do formato) só é lida; `--force`
  calcula de novo. `--no-write` deixa os contentores como estão.
- Um ficheiro alterado nos últimos `--settle` minutos (10) fica de fora: um
  conversor pode ainda estar a escrevê-lo.
- `<pasta>/3dheat-index.jsonl.gz`: uma linha por partida - o seu caminho, tamanho,
  hora e resumo sem a grelha. `<pasta>/3dheat-index.grids.jsonl.gz`: uma linha
  por partida com a sua grelha.
- Corra-a na máquina que tem os ficheiros, com prioridade baixa (por exemplo `nice -n 19 ionice -c3` no Linux).

O painel usa, para cada partida, o primeiro que houver: a linha do índice da
pasta (mesmo caminho e tamanho), a cache do navegador (IndexedDB, por nome,
tamanho e hora), o membro `summary` do contentor, ou um resumo calculado num
conjunto de trabalhadores e guardado em cache. Assim, uma pasta sem índice também funciona - na primeira vez à velocidade de ler as tabelas, depois a partir da cache.

## O painel {#the-panel}

Escolha uma pasta (ou ficheiros; **Adicionar pasta...** junta outra). A janela tem os filtros **Jogo**, **Mapa**, **Modo**, **De** e **Para**, uma escolha **Dividir por**, **Menos vidas** e **Só jogadores**, e estes separadores. Todos os números vêm dos resumos, e um clique numa linha, numa célula ou num insight carrega as suas partidas na vista como sobreposição de muitas partidas, com os filtros que as mostram (veículo, classe, arma, equipa, jogador) e a câmara no lugar:

| Separador | O que é |
|---|---|
| Visão geral | partidas, horas, jogadores, vidas, linhas, datas; partidas por dia; por jogo, mapa, modo; totais de eventos; economia por moeda; quando na partida acontecem as coisas |
| Balanceamento | por veículo, classe, arma ou equipa, dividido por mapa, modo, nível ou jogo: K/D com o seu intervalo de ~95%, taxa de vitórias (Wilson), sobrevivência, abates e acertos por minuto, ganhos por minuto, e q - a taxa de falsas descobertas de Benjamini-Hochberg do K/D e da vitória contra o resto da divisão. **Menos vidas** esconde as linhas com vidas insuficientes para confiar; **Só jogadores** deixa de fora o que a IA da missão conduziu |
| Tendências | uso (parte da presença), K/D ou taxa de vitórias dos veículos ou classes principais por dia, semana ou mês |
| Jogadores | jogadores distintos, partidas por jogador, jogadores por partida, os jogadores mais frequentes |
| Lados | cada lado de cada mapa: partidas ganhas contra uma divisão igual |
| Combate aproximado | dados de rondas: duelos de abertura por lado e a sua conversão, trocas, quem espreita contra quem defende, cruzamentos, entradas ofuscadas, pontaria, plantações, vantagem de homens e, **Por mapa**, os lugares que matam os jogadores que lá entram - cada um como uma parte com o seu intervalo de Wilson, a partir das contagens `cqb` dos resumos ([Combate aproximado e rondas](close-quarters.md)) |
| Mapa | a grelha somada de um mapa: presença, abates, mortes, K/D, qualquer evento, fluxo, e **quente em quantas partidas** (estabilidade); por equipa, a 1, 2, 4 ou 8 vezes a célula |
| Lugares | lugares que se destacam nos números mas não no mapa de calor (uma grande área movimentada no conjunto, corredores, faixas de altura); **Encontrar lugares** |
| Nichos | grupos que vão consideravelmente melhor ou pior do que os outros (um veículo num mapa, um setor numa altura); **Encontrar nichos** |
| Insights | os detetores em massa e os detetores de mapa (abaixo); **Copiar relatório (JSON)** dá o JSON que um modelo de linguagem lê |

## Insights sobre muitas partidas {#insights-over-many-matches}

O separador **Lugares** encontra lugares que se destacam nos números mas não no mapa de calor - uma grande área movimentada no conjunto, um corredor, uma faixa de altura, um lugar movimentado só numa parte da partida -, marca como **ocultos** os que o mapa de calor simples não mostra, e desenha o seu contorno na vista 3D; **Carregar** voa até lá com as partidas que tinha. O separador **Nichos** encontra grupos (um veículo num mapa e lado, um setor numa altura) que vão consideravelmente melhor ou pior do que os outros; clique num para ver os seus refinamentos.

O separador **Insights** encontra, em todas as partidas, veículos que trocam ou ganham melhor ou pior do que os outros, lugares quentes numa parte estável das partidas, lados que ganham mais do que uma divisão igual, veículos cujo uso muda ao longo das datas, e partes da partida que têm mais abates do que uma distribuição igual. Cada achado traz as suas contagens, efeito, intervalo e uma taxa de falsas descobertas (mantida em 5%), e um clique carrega as suas partidas. Pormenores: [Para programadores](#for-developers).

## Escala {#scale}

Pode repetir uma pequena versão disto você mesmo: `node tools/demo-data.mjs` escreve 150 partidas sintéticas de tanques para `tools/.shots/demo/mass` (cerca de 1.000 linhas cada). Medido nessas 150 partidas sintéticas de demonstração de `tools/demo-data.mjs` num computador de secretária (uma partida real é muito maior):

- `tools/3dheat-summarize.mjs` com 4 trabalhadores: 2,6 a 4,8 s para todas as 150, 8 a 21 ms por partida dentro de um trabalhador; uma segunda corrida que só lê os resumos demora cerca de 2 s.
- Abrir a pasta no painel, com o índice presente, até a janela aparecer: 0,9 a 1,6 s (a parte do trabalhador, a ler as 150 linhas do índice, é de 20 a 40 ms).
- Mudar de separador, até a tabela ser desenhada: Visão geral 10 a 30 ms, Balanceamento 30 a 70 ms, Tendências 30 a 45 ms, Jogadores 15 a 35 ms, Lados 15 a 20 ms, Mapa 55 a 130 ms.
- O armazenamento guarda as 150 partidas em cerca de 0,5 MB.

Abrir a janela leva um fotograma curto: os ficheiros escolhidos seguem para o trabalhador 16 de cada vez, e os campos de data e o primeiro separador aparecem um fotograma depois da janela.

O armazenamento guarda cerca de 15 KB por partida, por isso 10.000 partidas ocupam ~150 MB no trabalhador; as grelhas nunca ficam em memória para além do mapa pedido.

## Para programadores {#for-developers}

### Insights sobre muitas partidas {#insights-over-many-matches}

`src/mass/detect.ts` - cada achado com as suas contagens, efeito e intervalo,
p e q (Benjamini-Hochberg sobre tudo o que o detetor testou, mantido em 5%),
a análise que carrega as suas partidas e uma chave de frase com os seus valores;
o relatório (`heat3d.mass/1`) é o que `massReportForModel` entrega a um narrador,
na mesma forma do relatório de uma só partida (`insights/seam.ts`).

| Detetor | Encontra |
|---|---|
| `balance` | um veículo de jogador que troca ou ganha melhor ou pior do que os outros num mapa ou num modo |
| `hotspot` | lugares quentes numa parte estável das partidas recebidas (partidas quentes / partidas vistas, contra as outras células do mapa) - não só quentes no total |
| `side` | um lado de um mapa que ganha mais do que uma divisão igual |
| `meta` | a parte de vidas de jogadores de um veículo, ou o seu K/D, a mudar entre a metade anterior e a posterior das datas, por mapa - grande o suficiente para importar, a seguir uma tendência nos trimestres, da mesma forma na maioria dos mapas (abaixo) |
| `phase` | uma parte da duração da partida com mais abates, acertos, lançamentos... do que uma distribuição igual |
| `place` | lugares que se destacam em muitas partidas (Fase B, abaixo): a taxa de uma região ou a parte de abates contra as de cada partida, círculos, corredores, zonas crescidas, faixas de altura, fases; ocultos quando o mapa de calor simples não os mostra |
| `niche` | grupos que vão consideravelmente melhor ou pior (Fase B, abaixo) |
| `grid.*` | os detetores de um só conjunto de dados (posições de energia, zonas quentes e calmas, lugares por classe) sobre as grelhas somadas de cada mapa: `GridMerge.toInsightJob` preenche as grelhas da passagem de insights a partir dos resumos; os detetores que precisam de trajetos ficam de fora |

### O resumo {#the-summary}

JSON simples (`src/mass/types.ts`), cerca de 5-30 KB comprimido por partida:

- a partida: jogo, mapa, modo, missão, início, duração, linhas, vidas, jogadores,
  IA, equipas (vidas, jogadores, presença, abates, mortes, vitória, dinheiro), vencedor;
- por veículo e equipa: classe, nível, vidas, vidas de jogadores, presença, eventos
  por tipo canónico, abates pela classe do alvo, vitórias, dinheiro;
- por jogador (pelo id de utilizador, senão pelo nome): equipa, vidas, presença, abates, mortes,
  acertos, lançamentos, vitórias, veículos; por arma: eventos por tipo;
- as colunas da economia (`cost_*`, `earn_*`) e os seus totais;
- fases: eventos por tipo em 20 intervalos da duração da partida e por minuto;
- comportamento: as medidas de comportamento coletivo da partida (alinhamento, condução em rota,
  faixas, aglomeração, líderes, retardatários, ponto de rutura, risco depois de perdas,
  sequências, acordo de compras, supressão), cada uma com o seu próprio modelo nulo,
  p e q - ver [Comportamento coletivo](collective-behaviour.md);
- a grelha (abaixo).

Contado como o visualizador conta: colunas encontradas como o carregador de muitas partidas as encontra
(`leanSpec`), eventos por `data/canonical.ts`; um abate de uma arma Tacview conta
para o seu atirador; uma morte dita duas vezes ao mesmo tempo (`dead`, `death`)
conta uma vez.

#### A grelha: em que assenta a Fase B {#the-grid-what-stage-b-builds-on}

A parte espacial foi feita para estatísticas de varrimento sobre regiões de qualquer
tamanho e forma, e não só para imagens de calor:

- **Uma pirâmide.** As células são potências de dois alinhadas, em unidades do mundo (x, z como o
  visualizador as coloca). O nível `k` são as células somadas por `ix >> k, iz >> k` -
  exato, dentro de uma partida e entre partidas de outros tamanhos de célula - e qualquer
  região (uma caixa, um corredor ao longo de uma linha, um anel) é uma soma de células. O nível mais
  fino ajusta-se à extensão robusta da partida (as células com 99% da presença) em
  128 células; os desvios para fora dele são guardados.
- **Exposição ao lado de cada contagem.** Segundos de presença por célula, por equipa
  (`pt`), por classe de veículo (`pc`) e por faixa de altura (`ph`), por isso a taxa de uma região,
  a sua expectativa e a sua razão são calculadas para qualquer subgrupo.
- **Altura.** Faixas acima do piso da partida (o 1.º percentil da altura): abaixo de
  3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, acima; um ficheiro com uma coluna
  `floor`/`storey`/`deck` organiza as faixas pelos seus pisos. `y` é a altura média de cada
  célula, `y0` a mais baixa (o seu piso, para altura acima dele).
- **Eventos** como tuplos `[célula, tipo, equipa, classe, faixa, contagem]`.
- **Fatias de tempo** a um nível grosseiro (8 células por lado), por minuto desde o início
  da partida: `[cx, cz, minuto, tipo, valor]`, segundos de presença como tipo
  `GRID_KINDS.length`; as fases da partida são minutos sobre a duração.
- Esparsa, contagens inteiras, segundos até uma décima: limitada pelo que aconteceu.

### Fase B: lugares e nichos {#stage-b-places-and-niches}

A Fase B procura o que se destaca nos números sem chamar a atenção: uma grande área
movimentada no conjunto sem nenhuma célula quente nela, uma razão estranha entre abates e mortes
com poucos eventos, um corredor, uma faixa de altura, um aglomerado que só está lá numa
parte da partida - e grupos (um veículo num mapa de um lado, um setor numa altura) a ir
consideravelmente melhor ou pior do que os outros. Um **Encontrar lugares** / **Encontrar nichos** /
**Encontrar insights** corre todos os detetores; os três separadores partilham o relatório.

#### Lugares (`src/mass/scan.ts`) {#places-srcmassscants}

As partidas de cada mapa são lidas duas vezes, uma partida de cada vez; a memória guarda somas numa
grelha de no máximo 64 células por lado (16 para a varredura espaço-tempo), nunca as partidas.

- **Medidas.** A taxa de um evento por segundo de presença - abates, mortes,
  acertos, lançamentos, capturas, para todas as unidades, por classe (as 4 com mais
  eventos), por faixa de altura - e a parte de abates em abates e mortes (todos, por lado,
  por faixa). Quais as classes e os lados vêm dos cabeçalhos (`planOf`).
- **Expectativa por partida.** A taxa de cada partida espalhada pela sua própria presença
  numa célula é a expectativa da célula (uma varredura de Kulldorff ajustada à covariável,
  estratificada por partida): algumas partidas sangrentas ou um servidor muito movimentado
  não fazem lugar nenhum.
- **Dispersão.** As partidas discordam muito para lá de Poisson. Os resíduos de cada partida
  são somados em blocos de 1, 2, 4, 8, 16 células; a dispersão de cada tamanho de bloco
  (resíduos ao quadrado sobre a variância nula, agregada, deixando de fora os 5% piores blocos)
  escala cada teste de uma região desse tamanho: uma quase-verosimilhança,
  Poisson para taxas, binomial para partes.
- **Regiões.** Círculos de 0,75 a 18 células; elipses em seis ângulos, 3 e 6
  vezes mais compridas do que largas, de 3 a 18 células (corredores; o eixo é o
  `place.path` do insight); zonas que crescem célula a célula a partir das células locais
  mais fortes de Getis-Ord Gi* enquanto o z da região cresce (formas irregulares) - cresceram
  numa metade das partidas e testadas na outra, por isso a liberdade do crescimento não custa
  falsos lugares; cada faixa de altura contra as outras faixas da partida sobre o mapa inteiro
  (robusto ao agrupamento); cilindros espaço-tempo: um círculo em um ou dois quintos da
  duração da partida, contra a própria distribuição dos eventos da partida no lugar e no tempo
  (a varredura de permutação espaço-tempo).
- **Testes.** p a partir da quase-verosimilhança; Benjamini-Hochberg sobre cada região testada
  em cada mapa (700.000 em três mapas é normal) a 5%. O que passa é podado (uma região
  sobretudo dentro de uma mais forte da sua medida diz o mesmo), relido para a sua
  **estabilidade** - partidas que a viram, partidas em que esteve, a sua direção em cinco
  partições das partidas - e testado mais uma vez à variância que as próprias partidas mostram
  (robusto ao agrupamento, partidas como aglomerados, nunca sob Poisson), BH outra vez. Lugares calmos sobre uma base (2% ou mais dos
  nascimentos, descolagens e aterragens do mapa) ficam de fora.
- **Efeito.** A razão de taxas (ou de chances), encolhida por Bayes empírico (uma
  distribuição a priori gama ajustada aos blocos 2x2 do mapa), com um intervalo de ~95% à
  dispersão; Gi* a 1, 2 e 4 células e Moran local no centro.
- **Evidência visual.** Quanto a região já se mostra no mapa de calor simples do seu evento
  (escala logarítmica até à célula mais brilhante, como as vistas a desenham): o seu contraste
  com um anel à volta (uma décima da paleta é difícil de ver, dois quintos é simples) e um pico
  brilhante a transportar o excesso; uma razão nunca é desenhada pelo calor, por isso uma parte conta
  metade. Abaixo de 35% fica **oculto**. A ordem: força (efeito que satura a 4 vezes, lugares calmos
  a 0,7) vezes `1 - 0,7 x evidência` vezes a concordância das partições.

O separador **Lugares** lista-os (ocultos só por predefinição; por mapa, forma,
direção), um clique desenha o contorno dos lugares do mapa na vista 3D (`placeLines.ts`:
as linhas de topo do motor, construídas uma vez - magenta oculto, âmbar simples, ciano calmo,
o escolhido cheio; uma faixa como uma caixa do seu piso ao seu teto) e na tela do separador
Mapa; **Carregar** voa até lá e carrega as 60 partidas em que mais esteve,
filtradas pelo seu evento (e classe).

#### Nichos (`src/mass/niche.ts`) {#niches-srcmassnichets}

Pesquisa em feixe (largura 24, profundidade 3) sobre três tabelas: **vidas** (vidas de jogadores:
jogo, mapa, modo, classe, veículo, lado, nível, trimestre das datas, terço da duração das
partidas; K/D, vitória, morte por vida, abates por hora, ganhos por minuto), **lugares** (abates e mortes por
mapa, modo, datas, setor do mapa 4 x 4, classe, lado, faixa) e **fases** (setor e quinto da
partida: K/D, mortes por hora de presença). Um grupo é testado contra o todo com as partidas
como aglomerados (a variância sanduíche dos seus resíduos por partida), o seu efeito uma razão de
chances ou de taxas encolhida por uma distribuição a priori de 20 resultados; precisa de 30
resultados em 8 partidas, um refinamento tem de ser 10% mais forte do que o seu pai, e os grupos
onde o resultado é nenhum ou todos (não registado para eles) ficam de fora. Mantidos: BH abaixo de
5% sobre todos os grupos avaliados, uma razão encolhida de pelo menos 1,25 (ou 1/1,25), quatro de
cinco partições a concordar, e não um refinamento que só repete o seu pai. O separador **Nichos** lista-os;
um clique mostra cada refinamento de uma condição do grupo (o explorador), **Carregar** carrega as suas
partidas. Os equipamentos ainda não estão nos resumos.

#### As mudanças de meta com significado prático {#meta-shifts-with-practical-significance}

Em datas misturadas, a binomial sobre as vidas assinalava quase todas as mudanças como significativas. `meta` testa agora de forma robusta ao agrupamento (cada partida um aglomerado de vidas), mantém uma mudança de uso só de 2 pontos e 25% pelo menos, uma mudança de K/D de 1,3 vezes, os trimestres das datas a seguir a mesma tendência (tau de Kendall de pelo menos 0,5) e, para um veículo em vários mapas, a mesma direção na maioria deles. Isso deixa só algumas mudanças num conjunto de teste em que o teste simples assinalava quase todas.

#### Para um modelo {#for-a-model}

`massReportForModel` dá a cada lugar a sua `region` (forma, oculto,
evidência, alturas, fase) e a cada nicho as suas `conditions`, além de quantas
regiões e grupos foram testados. O motor de conhecimento pode ler os lugares como zonas de morte
e vias de aproximação: os seus tipos são `place.*` e `niche.*`.

#### Verificações {#checks}

`scan.test.ts` planta uma área difusa (1,6 vezes a taxa de mortes sobre um círculo
de 22 células, ténue em cada célula), um corredor, uma faixa de altura e um aglomerado só de fase em
240 partidas sintéticas com dispersão - todos encontrados, o difuso oculto - e corre oito conjuntos
nulos de 60 partidas: nenhum lugar. `niche.test.ts` encontra um grupo planeado veículo x mapa x lado
e nada em cinco tabelas nulas.
