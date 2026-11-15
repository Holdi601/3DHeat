---
title: "Lista de equipas"
parent: "Filtros e ferramentas"
nav_order: 2
lang: "pt"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---


# Lista de equipas

O painel **Equipas** permite-lhe ocultar uma equipa ou pô-la de um lado de uma comparação. Use-o para ver só a Blue, ou para perguntar "para onde vai a Blue que a Red não vai?".

Um *grupo* é uma equipa ou um lado, por exemplo Blue e Red ([Grupos](sessions-persons-groups.md#group)). O painel aparece quando o conjunto de dados tem uma coluna de grupo; a contagem de grupos está no seu cabeçalho. No modo Calor por equipa, a barra lateral tem também uma secção chamada **Visualizador de equipas** com definições próprias; esta página trata da lista **Equipas**.

## Ocultar uma equipa {#hide-a-team}

1. Abra **Equipas** na barra lateral.
2. Desmarque a caixa (*Visível*) da equipa a ocultar. A imagem atualiza-se de imediato.
3. Prima **Mostrar todas** para trazer de volta todas as equipas.

![A lista de equipas: Blue 5p, Red 5p, com Mostrar todas](../assets/img/en/teams-list.webp)

## Cada linha {#each-row}

| Parte | Significado |
|---|---|
| Caixa (*Visível*) | Mostra ou oculta o grupo. |
| Amostra | A cor do grupo: a sua cor de [calor por equipa](team-heat.md) no modo Calor por equipa, a sua cor base nos outros modos. |
| Nome | A etiqueta do grupo (etiqueta completa ao passar o rato). |
| **+** / **-** (modo Diferença) | Põe o grupo do lado positivo ou negativo da [diferença](difference.md); clique de novo no botão ativo para o pôr de nenhum dos lados. |
| `Np` (outros modos) | O número de pessoas cuja primeira linha está neste grupo. |

![Modo Diferença: Blue do lado +, Red do lado -](../assets/img/en/teams-list-difference.webp)

## Botões {#buttons}

| Botão | Efeito |
|---|---|
| **Mostrar todas** | Torna visível de novo cada grupo. |
| **Dividir por igual** (modo Diferença) | Primeira metade dos grupos (arredondada para cima) em +, o resto em -; a mesma divisão com que começa cada carregamento. |

## O que ocultar um grupo faz {#what-hiding-a-group-does}

- Em **Calor**, **Calor por equipa** e **Linhas**, as linhas do grupo não contribuem com nada.
- Em **Diferença**, um grupo oculto não contribui com nada, seja qual for o lado em que esteja, também com uma separação por outra coluna (veja [Diferença](difference.md#for-developers)).
- Na **sobreposição de figuras**, as pessoas cuja primeira linha está nesse grupo não são desenhadas.
- Em **Calor por equipa**, os outros grupos mantêm as suas cores: as tonalidades são atribuídas a partir do número total de grupos, não do que está visível, por isso duas imagens continuam comparáveis.

Mudar a visibilidade reinicia a acumulação. Em cada conjunto de dados novo, todos os grupos voltam a ficar visíveis.

A dica do painel muda conforme o modo: no modo Diferença explica + e -; no Calor por equipa, que as amostras são as cores que cada grupo desenha.
