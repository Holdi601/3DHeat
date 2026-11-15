---
title: "Painel de desempenho e estatísticas"
parent: "Detalhes da renderização"
nav_order: 7
lang: "pt"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---


# Painel de desempenho e painel de estatísticas

A caixa no canto superior direito da vista mostra o esforço que o visualizador está a fazer: quantos fotogramas por segundo, quantos pontos desenha e se ainda está a refinar a imagem. O painel **Desempenho** permite trocar qualidade de imagem por velocidade.

## O painel de estatísticas {#the-stats-overlay}

A caixa no canto superior direito da vista nos separadores Mapa de calor e Partida ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Lê a leitura ao vivo do motor a cada fotograma de animação.

![O painel de estatísticas na cena de muitas partidas, com chamadas numeradas: 1 Backend, 2 FPS, 3 Fotograma, 4 Linhas na janela, 5 Sprites / fotograma, 6 Orçamento, 7 Resol. do calor, 8 Cobertura](../assets/img/en/performance-stats-overlay.webp)

| Linha | Significado |
|---|---|
| **Backend** | *WebGPU* ou *WebGL2*. Passe o rato por cima para ver o motivo de o WebGPU não ter sido usado, quando não o foi. Veja [Os dois backends](backends.md). |
| **FPS** | Fotogramas por segundo, em média ao longo de pelo menos 0,4 s. |
| **Fotograma** | Tempo de fotograma em ms, suavizado (90% o anterior, 10% o novo). É o tempo entre fotogramas, não o tempo da GPU - não se mede o tempo da GPU por passagem. |
| **Linhas na janela** | Linhas candidatas: as linhas da janela temporal atual, antes da filtragem por linha no shader. |
| **Sprites / fotograma** | Sprites que o plano do último fotograma submeteu (mantido no valor planeado nos fotogramas inativos, que não desenham nada). |
| **Orçamento** | O orçamento de sprites com que este fotograma foi planeado - o valor do controlador adaptativo, elevado a todos os candidatos quando se desenha todas as linhas. |
| **Resol. do calor** | A resolução do buffer de calor como percentagem da tela: a definição *Resolução do calor* multiplicada pela escala adaptativa da segunda etapa. |
| **Cobertura** | Até onde a acumulação progressiva já chegou em usar todas as linhas: uma percentagem enquanto converge (âmbar), *exact* quando terminou. Um fotograma com ruído nunca é confundido com a imagem final. |
| **Cubos** | Caixas desenhadas no [replay de caixas](box-replay.md). |
| **Não residente** | Mostrado só quando as linhas não couberam no orçamento de GPU: quantas. Veja [Residência na memória da GPU](gpu-memory.md). |

## A indicação de velocidade {#the-speed-display}

No canto inferior direito da vista, só em perspetiva: a velocidade de voo e o tempo para atravessar os dados a essa velocidade. Arraste-a para mudar a velocidade. Veja [Câmara](camera.md#fly-speed).

## Se o visualizador estiver lento {#if-the-viewer-is-slow}

Olhe para o painel de estatísticas e depois:

1. **Linhas na janela muito maiores do que Sprites / fotograma, Cobertura abaixo de 100%** - o fotograma não consegue desenhar tudo; converge ao longo de vários fotogramas quando está parado. Estreite a janela, filtre ou faça recorte para reduzir os candidatos; ou aceite a amostragem.
2. **Sprites / fotograma igual a Linhas na janela, e o fotograma continua lento** - o custo é por sprite no ecrã: baixe o *Max pixel radius* ([Forma do sprite](sprite-shape.md#pixel-clamps)) ou a *Heat resolution*.
3. **Lento com poucas linhas** - provavelmente o nível: muitas estruturas com as arestas ligadas, triângulos de chão, profundidade de campo. Veja [Aspeto do nível](level-appearance.md).
4. **Tudo lento, e uma faixa vermelha** - renderização por software ([Deteção de renderização por software](software-rendering.md)).

## O painel de desempenho {#the-performance-panel}

| Controlo | Omissão | Efeito |
|---|---|---|
| Dica | | Cada fotograma faz o splat de um subconjunto aleatório estratificado das linhas visíveis, com o peso ajustado para compensar, por isso o calor esperado é exato a qualquer orçamento; manter a vista parada continua a fundir fotogramas até que cada linha tenha contribuído. |
| **Desenhar todas as linhas em cada fotograma** | ligado | Cada fotograma que começa uma nova estimativa desenha todas as linhas candidatas (até cerca de 268 M); o orçamento abaixo passa a ser um mínimo. [Amostragem e orçamentos](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Orçamento adaptativo** | ligado | Ajusta os sprites por fotograma e, depois, a resolução do calor, para manter a taxa de fotogramas alvo - e deixa de cortar quando cortar não ajuda. [Amostragem e orçamentos](sampling-and-budgets.md#the-adaptive-budget) |
| **FPS alvo** | 60 | 20-240 (1000 com o manípulo). Valores abaixo de 15 são tratados como 15. |
| **Sprites iniciais / fotograma** / **Sprites / fotograma** | 4,00 M | 65 536-268 435 456, em escala logarítmica. Chama-se *Sprites iniciais* enquanto o adaptativo está ligado, porque o controlador o move. |
| **Resolução do calor** | 100% | 25-100%. O custo dos fragmentos escala com o quadrado: 50% reduz a mistura a um quarto, e o campo de calor é suave o bastante para quase não se notar. |
| **Refinamento progressivo** | ligado | Acumula entre fotogramas enquanto a vista está parada. Desligado mostra a estimativa de um só fotograma em cada fotograma. [Acumulação](accumulation.md) |
| **Orçamentos de recursos** | detetados | Orçamentos de RAM, GPU e da thread de análise. [Memória e orçamentos](memory-and-budgets.md#resource-budgets) |

Nada disto é guardado; ao recarregar, voltam as predefinições.
