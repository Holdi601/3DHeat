---
title: "Filtros e ferramentas"
nav_order: 6
has_children: true
lang: "pt"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtros e ferramentas

Estes painéis permitem escolher *quais* os dados que vê e medir o que vê. Use-os quando a imagem estiver demasiado carregada: mostre uma equipa, um jogador, um sítio, ou um piso de um edifício.

Cada painel restringe os dados, e funcionam em conjunto: uma linha só é desenhada se passar em **todos** (E).

```
todas as linhas -> Filtros -> Equipas -> Entidades -> Corte -> imagem
                     E          E           E           E
```

Exemplo: desmarque *Tanque* em Filtros, oculte a equipa Red em Equipas e escolha um jogador em Entidades. Vê apenas os movimentos que não são de tanque desse jogador.

| Painel | O que faz | Modos de calor | Sobreposição de figuras |
|---|---|---|---|
| [Filtros](filters.md) | Filtros de intervalo e de categoria sobre qualquer coluna guardada na carga. | Sim | Não (só filtros de coluna) |
| [Divisão por diferença](difference.md#the-difference-split-panel) | Quais as linhas que somam e quais subtraem, no modo Diferença. | Só Diferença | Não |
| [Equipas](teams-list.md) | Mostra ou oculta cada equipa; põe equipas do lado + ou -. | Sim | Sim |
| [Entidades](entities.md) | Escolhe jogadores individuais. | Sim | Sim |
| [Corte](slice.md) | Recorta uma placa do nível e do calor, para ver o interior dos edifícios. | Sim, e o nível | Não |
| [Medir](measure.md) | Uma régua, e o valor de calor sob o cursor. | Sim | Sim |
| [Volumes e comparação](volumes.md) | Desenhe formas 3D e pergunte o que aconteceu lá dentro. Também pode filtrar. | Sim | Sim |
| [Detalhamento](breakdown.md) | Qual veículo, jogador ou arma se sai melhor num sítio. | n/a | n/a |

A análise de impactos tem o seu próprio filtro de área no separador **Veículos**: ver [Análise de impactos](hit-analysis.md).

Termos como mapa de calor, linha, pessoa e grupo estão explicados no [glossário](glossary.md).

## Onde estão os painéis {#where-the-panels-are}

A barra lateral do separador Mapa de calor, de cima para baixo:

1. Barra de modos e seletor de sessão
2. Origem, Mapeamento de colunas, Conjunto de dados
3. Percursos (modo Linhas)
4. Os painéis de calor, ou o Visualizador de equipas
5. Divisão por diferença
6. Equipas
7. Entidades
8. Filtros
9. Fundo / nível
10. Corte
11. Medir
12. Percurso da câmara e renderização
13. Desempenho
14. Câmara e cena

O separador Partida mostra a barra de modos, o seletor de sessão, o seu próprio painel, Filtros, Fundo / nível e Câmara e cena.
