---
title: "Glossário"
nav_order: 24
lang: "pt"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: false
---

# Glossário

Significados curtos das palavras usadas neste site, em linguagem simples. Cada entrada liga à página que a explica por inteiro.

## Dados {#data}

**Linha.** Uma linha dos seus dados: uma coisa que aconteceu num lugar e numa hora, por exemplo "o jogador 7 estava aqui no segundo 12". O visualizador desenha cada linha. [Formatos de dados](data-formats.md)

**Coluna.** Um tipo de valor nas linhas, como x, y, z, tempo ou equipa. O visualizador adivinha qual coluna é qual, e pode mudar a adivinha. [Mapeamento de colunas](column-mapping.md)

**CSV.** Uma tabela de texto simples: uma linha por linha, valores separados por vírgulas. Quase todos os programas a conseguem escrever. [Carregar ficheiros](loading-files.md)

**Parquet.** Um ficheiro de tabela compacto e rápido de ler, mesmo com milhões de linhas. É o melhor formato para dar ao visualizador. [Carregar ficheiros](loading-files.md)

**Evento.** Algo que aconteceu, como um disparo, um impacto, um abate ou uma descolagem. Uma linha pode ser um evento, ou apenas "estive aqui". [Filtros](filters.md)

**Pessoa.** Quem produziu as linhas: um jogador, um piloto, um carro ou um tanque. Uma pessoa é uma linha de posições ao longo do tempo. [Sessões, pessoas e grupos](sessions-persons-groups.md)

**Grupo (equipa).** Um conjunto de pessoas mostrado com a mesma cor, por exemplo Blue e Red. [Sessões, pessoas e grupos](sessions-persons-groups.md)

**Sessão (partida, ronda).** Uma corrida do jogo. Uma partida ou uma ronda é uma sessão. O visualizador pode mostrar uma sessão ou sobrepor muitas. [Sessões, pessoas e grupos](sessions-persons-groups.md)

**Nível.** O mapa 3D onde os dados aconteceram: chão, edifícios, muros. As linhas aparecem onde aconteceram no nível. [Níveis e geometria de fundo](levels.md)

## Ver os dados {#looking-at-the-data}

**Mapa de calor.** Uma imagem onde os sítios que muitas linhas tocam brilham mais. Os sítios frios são calmos, os quentes são movimentados. [Calor](heat.md)

**Calor.** Quanto aconteceu num sítio. O visualizador soma o brilho de cada linha em cada sítio; a soma é o calor. [Calor](heat.md)

**Sprite.** A pequena mancha luminosa que o visualizador desenha para uma linha. Muitos sprites sobrepostos somam-se em calor. [Forma do sprite](sprite-shape.md)

**Exposição.** Quão clara é a imagem. Como numa câmara, exposição a mais deixa tudo branco e a menos esconde os detalhes. [Cor e exposição](colour-and-exposure.md)

**Saturação.** A quantidade de calor que conta como "tão quente quanto as cores vão". Baixe-a para mostrar sítios calmos; suba-a para ver só os mais quentes. [Cor e exposição](colour-and-exposure.md)

**Volume.** Uma caixa ou forma que coloca na vista 3D. O visualizador conta o que está dentro dela e pode comparar volumes entre si. [Volumes e comparação](volumes.md)

**Filtro.** Uma regra que esconde linhas que não quer, por exemplo "só abates" ou "só a equipa Red". [Filtros](filters.md)

## Repetição {#replay}

**Figura.** Um pequeno modelo de um tanque, avião, carro ou soldado que se move onde os dados dizem que esteve. [Figuras](figures.md)

**LOD (nível de detalhe).** Cada figura tem uma versão detalhada, uma mais simples e uma muito simples. As próximas usam a detalhada e as distantes a simples, por isso podem desenhar-se milhares de uma vez. [Figuras](figures.md)

## Corridas {#racing}

**Volta.** Uma viagem completa ao percurso, da linha de partida até à linha de partida. [Carregar voltas](race-loading-laps.md)

**Volta de referência.** A volta com que todas as outras são comparadas. As diferenças mostram-se como "mais rápido" ou "mais lento" do que ela. [Carregar voltas](race-loading-laps.md)

**Vértice.** O ponto de uma curva em que o carro está mais perto da borda interior. [Análise curva a curva](race-corner-analysis.md)

**Deslizamento.** Quanto um pneu desliza. Um pouco de deslizamento dá a maior aderência; demais e o carro derrapa. [Análise de corrida: o método](race-analytics.md)

**Envelope.** O que um carro consegue fazer a cada velocidade: quão forte consegue virar, travar e acelerar antes de deslizar. [Análise de corrida: o método](race-analytics.md)

## Números de aeronaves {#aircraft-numbers}

**ALT.** Altitude: a altura acima do solo ou do nível do mar. [Repetição da partida](match-replay.md#labels-and-statistics)

**TAS.** Velocidade verdadeira no ar: a velocidade a que um avião se move pelo ar. [Repetição da partida](match-replay.md#labels-and-statistics)

## Computador {#computer}

**GPU.** A placa ou o chip gráfico. Desenha a imagem e é muito mais rápido que o processador principal a desenhar milhões de manchas. [Os dois motores](backends.md)

**WebGPU / WebGL2.** As duas formas como um navegador deixa uma página usar a GPU. O WebGPU é mais recente. O visualizador pode usar qualquer um e escolhe o melhor que o seu navegador tiver. [Os dois motores](backends.md)

## Palavras do Counter-Strike {#counter-strike-words}

**Ronda.** Um combate curto dentro de uma partida. Um dos lados ganha, e a pontuação sobe um.

**Eco, compra forçada, compra completa.** Quanto dinheiro um lado gasta em armas no início de uma ronda. Um eco poupa dinheiro e compra quase nada (menos de 1500 $ por jogador em média). Uma compra forçada gasta o que tem (menos de 4000 $). Uma compra completa compra tudo o que consegue. [Análise de partida](match-analysis.md)

**Troca.** Um abate que paga um abate: é-lhe disparado, e um colega seu dispara contra quem o matou em 5 segundos. [Análise de partida](match-analysis.md)

**KAST.** A percentagem de rondas em que um jogador fez um abate, uma assistência, sobreviveu, ou foi trocado. Um número mais alto significa que o jogador ajudou em mais rondas. [Análise de partida](match-analysis.md)

**ADR.** Dano médio por ronda: quanta vida um jogador tirou aos inimigos em cada ronda. [Análise de partida](match-analysis.md)
