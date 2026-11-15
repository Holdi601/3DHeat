---
title: "Figuras na sobreposição de figuras"
parent: "Figuras"
grand_parent: "Replay"
nav_order: 2
lang: "pt"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---


# Figuras na sobreposição de figuras

Esta página trata de transformar as caixas em pequenas figuras 3D do que cada unidade realmente era, e do fumo e do fogo que as figuras deixam para trás. Os controlos do próprio replay estão em [Replay de partida](match-replay.md).

No [replay de caixas](box-replay.md) e no replay de figuras do separador Partida, **Figuras em vez de caixas** (ligado por omissão) desenha cada pessoa viva como a figura daquilo que ela é: um soldado a pé, o tanque que alguém conduz, a aeronave de que é um trajeto do Tacview. A figura tem a cor, o lugar e o rumo da caixa. Para aeronaves e mísseis tem também a inclinação e, quando os dados têm uma coluna Roll, a inclinação lateral. **Tamanho das figuras** dimensiona-as; 1 vez é a escala real. Os cliques numa figura respondem como respondiam os cliques na sua caixa.

## Que figura {#which-figure}

Decidem as próprias colunas de nome e de tipo dos dados. As regras completas, com os nomes das colunas, estão em [Figuras](figures.md#which-figure-a-unit-gets). Dados sem nenhum dos dois tipos de coluna são dados de pessoas: cada um é um soldado.

A partida fica em cache por etiqueta, por isso um fotograma custa só a colocação. Uma unidade de dados é um metro, a não ser que os dados digam qual é o tamanho de uma coisa seguida (a exportação do CS2 diz que um jogador tem 32 unidades de largura); as figuras são dimensionadas em conformidade.

Um pacote opcional de figuras suas pode substituir, no seu computador, as figuras do catálogo; veja [Figuras](figures.md#an-optional-local-figure-pack).

## Efeitos {#effects}

As linhas de evento que deixam algo para trás durante um tempo são desenhadas onde aconteceram, durante todo esse tempo, na cor de quem as causou: um fumo (cerca de 18 s), um molotov ou incendiário (7 s), um flash (cerca de um segundo) e uma explosão HE (menos de um segundo), um engodo (15 s), uma bomba colocada (40 s). Vêm de uma coluna de evento (Event, Events) cuja etiqueta é `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` ou `plant` - a exportação do CS2 escreve-as no momento da detonação.

## Replay de partida: as ferramentas do Tacview {#match-replay-tacviews-tools}

As câmaras, os marcadores, a visualização tática, as estatísticas, as etiquetas, as **Linhas verticais**, a lista de eventos e a janela de gráficos estão descritos em [Replay de partida](match-replay.md). A [paridade com o Tacview](tacview-parity.md) lista cada funcionalidade do Tacview e o seu estado.
