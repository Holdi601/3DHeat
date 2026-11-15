---
title: "Amostragem e orçamentos"
parent: "Detalhes da renderização"
nav_order: 3
lang: "pt"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---


# Amostragem e orçamentos

Quando há pontos demais para desenhar num só fotograma, o visualizador desenha uma amostra uniforme e faz com que cada ponto conte mais, para que a imagem continue certa. Um controlador ajusta quantos desenha, para que o visualizador mantenha a sua taxa de fotogramas.

## Controlos do painel de desempenho {#performance-panel-controls}

| Controlo | Predefinição | Intervalo (cursor) |
|---|---|---|
| **Desenhar todas as linhas em cada fotograma** | ligado | |
| **Orçamento adaptativo** | ligado | |
| **FPS alvo** | 60 | 20-240 (1000) |
| **Sprites iniciais / fotograma** (adaptativo) ou **Sprites / fotograma** | 4,00 M | 65 536-268 435 456, logarítmico (268 435 456) |
| **Resolução do calor** | 100% | 25-100%, multiplicada pela escala da segunda etapa adaptativa |
| **Refinamento progressivo** | ligado | Desligado: cada fotograma é uma nova estimativa de um só fotograma (útil para ver a amostra em bruto). |

Veja também [Painel de desempenho e estatísticas](performance-and-stats.md).

## Para programadores {#for-developers}

### Linhas candidatas {#candidate-rows}

As linhas são guardadas por ordem crescente de tempo. A janela da linha temporal [*lo*, *hi*] passa a um intervalo de linhas com duas pesquisas binárias sobre a coluna de tempo ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); sem coluna de tempo, cada linha é candidata. Estas são as **Linhas na janela** do painel de estatísticas. Os testes por linha - filtros, grupos, separação, recorte, corte, vida - acontecem depois, no sombreador; uma linha que falha custa uma invocação de vértice e nenhum fragmento.

### O plano de amostragem {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) divide o intervalo de candidatas em **blocos de 4 096 linhas consecutivas** e escolhe quantas desenhar a partir do orçamento de sprites do fotograma:

- Se o orçamento cobre todos os blocos, todos são desenhados - o fotograma é exato.
- Caso contrário, os blocos são tomados com um passo uniforme ao longo do intervalo, com um deslocamento de jitter que avança pela razão áurea em cada fotograma, para que fotogramas sucessivos cubram blocos diferentes e a união se preencha de forma uniforme. Esta é uma amostra **estratificada**: cada parte do intervalo de tempo está representada em cada fotograma.

O calor de cada linha desenhada é multiplicado por **candidatas / submetidas**, por isso o calor esperado de um fotograma é exato com qualquer orçamento; só o ruído depende do orçamento. As linhas vivem em blocos de 8 388 608 (veja [Residência na memória da GPU](gpu-memory.md)); um bloco é dividido onde atravessa um bloco de dados, e cada bloco de dados recebe a lista dos inícios de bloco que tem de desenhar.

Um plano pode levar no máximo 65 536 blocos - 268 435 456 sprites - porque ambos os motores guardam um buffer fixo de inícios de bloco com 65 536 posições. Um pedido de mais é limitado a esse valor, e a diferença aparece às claras como mais fotogramas para convergir.

### Desenhar todas as linhas em cada fotograma {#draw-every-row-each-frame}

**Desempenho → Desenhar todas as linhas em cada fotograma** (predefinição **ligado**): o orçamento passa a ser um piso e não um teto, e um fotograma que começa uma nova estimativa desenha todas as linhas de que é responsável (até ao limite de 268 M).

A razão: um movimento da câmara descarta a acumulação, por isso um fotograma em movimento é uma única estimativa cujo ruído é definido por quanto dos dados desenhou - com um quarto desenhado, vê-se um quarto deles em pontos ponderados brilhantes, e é isso que faz uma vista em movimento cintilar. Desenhar tudo faz de cada fotograma a imagem acabada. O custo é que o tempo de fotograma passa a seguir o tamanho dos dados na janela; as alavancas são uma janela de tempo mais estreita, filtros, ou um recorte por distância, que reduzem as candidatas em vez de as amostrar mais ao de leve.

Desligue-o em hardware que não aguenta o campo inteiro de uma vez: *Sprites / fotograma* passa então a ser um limite real, e a vista converge ao longo de alguns fotogramas parados.

O que custa um plano completo, medido numa GPU de desktop de topo com uma tela 4K e um nível grande, com sprites de 1 m de raio (um ou dois píxeis): cerca de 100 M de sprites por fotograma a 30 fps, 200 M a 15 fps, e o máximo de 268 M a cerca de 12 fps. Com sprites tão pequenos, o estágio de vértices é todo o custo, e a resolução do calor não muda nada; com sprites grandes, o preenchimento é o custo: 8 M de sprites de 100 m de raio levaram 2,5 s por fotograma com a resolução do calor total e 170 ms a 25%. Por isso, **Desenhar todas as linhas em cada fotograma** começa em 67 M e sobe um quarto por fotograma enquanto os fotogramas levam menos de 150 ms, e desce para metade quando levam mais de 400 ms, para que uma vista pesada não faça um fotograma passar do que o temporizador da GPU permite.

### O orçamento adaptativo {#the-adaptive-budget}

**Desempenho → Orçamento adaptativo** (predefinição ligado) ajusta o orçamento de sprites para manter o **FPS alvo** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Fica parado na repetição de caixas e durante a renderização de vídeos.

A entrada é o tempo de fotograma, suavizado (90% do anterior + 10% do novo, com fotogramas isolados limitados a 2 s), comparado com um alvo de 1000 / max(15, FPS alvo) ms.

**Primeira etapa - sprites.** Em cada fotograma, o orçamento é multiplicado por `1 + (alvo / fotograma - 1) × ganho`, com um ganho de 0,35 quando está lento demais e 0,08 quando há folga, limitado a um fator de 0,5-1,25 por fotograma e a 65 536-268 435 456 sprites.

**Segunda etapa - resolução.** Só quando o orçamento já está no seu piso e os fotogramas continuam mais de 10% lentos é que a resolução do buffer de calor desce, 8% por fotograma, até 25% da tela; recupera 4% por fotograma enquanto houver 30% de folga. O custo do fragmento desce com o quadrado da resolução, o que quase não se vê sob uma rampa suave. (Medido com renderização por software, com 10 M de linhas e sprites excessivos: 141 ms → 17 ms por fotograma.) A escala é arredondada a dezasseis avos; o *Res. do calor* do painel mostra-a.

**Desistir.** Um fotograma lento tem o mesmo aspeto quer seja causado pelos sprites quer por um nível pesado - não há temporização por passagem. Se o orçamento fica no piso e os fotogramas continuam abaixo de 70% do alvo durante 30 fotogramas, os sprites não eram o custo: o controlador passa a **subir**, multiplicando o orçamento por 1,5 a cada 14 fotogramas e repondo a resolução, enquanto o tempo de fotograma se mantiver dentro de 1,5× do que era no piso. Uma subida que piore as coisas para além disso recua para 60% e retoma o controlo normal; chegar ao alvo termina a subida.

Com o orçamento adaptativo desligado, o orçamento é simplesmente o **Sprites / fotograma**.

Com *Desenhar todas as linhas em cada fotograma* ligado, o orçamento adaptativo continua a correr, mas a regra exata sobe o orçamento para cobrir todas as linhas candidatas, por isso, na prática, só controla a etapa de resolução e os fotogramas que não começam uma nova estimativa.
