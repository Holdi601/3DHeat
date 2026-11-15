---
title: "Gerador sintético"
parent: "Carregar dados"
nav_order: 5
lang: "pt"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---


# Gerador sintético

Sem dados próprios? Prima um botão e o 3DHeat inventa para si uma batalha fictícia, tão pequena ou tão grande quanto quiser.

1. Abra o painel **Conjunto de dados** na barra lateral do Mapa de calor (abaixo de **Origem**).
2. Desloque-se até **Gerador sintético**.
3. Defina **Linhas (milhões)**. Experimente primeiro 1: a predefinição de 8 milhões é pesada para uma primeira experiência.
4. Prima **Gerar**.

![1 milhão de linhas, 8 equipas, desenhadas em Calor por equipa](../assets/img/en/synthetic-generator-team-heat.webp)

O painel **Conjunto de dados** pode gerar um conjunto de dados em vez de carregar um. Serve para duas coisas: experimentar o visualizador sem dados próprios, e verificar se um certo número de linhas, de raio de sprite e de orçamento mantém uma taxa de fotogramas utilizável numa máquina *antes* de se comprometer com um carregamento real grande. O seu movimento tem a forma de uma partida de battle royale - as equipas começam afastadas e depois são apertadas umas contra as outras -, porque o ruído uniforme parece bem a qualquer orçamento e esconde exatamente os artefactos que valem a pena apanhar.

## Controlos {#controls}

| Controlo | Omissão | Significado |
|---|---|---|
| **Linhas (milhões)** | 8 | Linhas a gerar. Arredondadas por defeito para um número inteiro de ticks por cada jogador. |
| **Equipas** | 8 | Número de grupos (pelo menos 1). |
| **Por equipa** | 12 | Jogadores por grupo (pelo menos 1). |
| **Semiextensão do mapa (m)** | 4000 | Metade da largura da área jogável em X e Z. |
| Linha de estimativa | | "≈ X GB de RAM, Y GB na GPU depois da quantificação." (cerca de 26 bytes de RAM e 8 bytes na GPU por linha). |
| **Gerar** | | Gera no worker de ingestão, com progresso, e substitui qualquer conjunto de dados carregado. |

A geração corre no worker de fundo, por isso dezenas de milhões de linhas não bloqueiam a página.

## O que gera {#what-it-generates}

De [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Colunas:** posição, tempo, pessoa (`P000`, `P001`, ...), grupo (`Team 1`, `Team 2`, ...), guinada e inclinação, e tempos de vida. Sem coluna de sessão e sem colunas de filtro.
- **Tempo:** uma amostra por jogador a cada 0,25 s, começando em 0 (tempo relativo, sem relógio de parede).
- **Movimento:** cada equipa começa no seu próprio setor de um anel, a 55-95% da semiextensão. Um círculo seguro centrado perto do meio (deslocado ao acaso até um quarto da semiextensão) encolhe até 8% da semiextensão em seis fases com patamares; cada jogador dirige-se para um ponto errante dentro dele, com amortecimento e ruído. A altura ondula entre 0 e 220 m.
- **Direção do olhar:** guinada segundo a direção de marcha, inclinação a partir da velocidade vertical.
- **Repetível:** a semente aleatória é fixa (1337), por isso as mesmas definições produzem sempre os mesmos dados.

Todos os modos de calor, o replay de caixas e o calor de linha (trajetos completos, pois não há coluna de evento) funcionam com eles. O histórico de tempo de vida também funciona.
