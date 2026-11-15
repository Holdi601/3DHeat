---
title: "Entidades"
parent: "Filtros e ferramentas"
nav_order: 3
lang: "pt"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---


# Entidades

As **Entidades** permitem escolher um jogador (ou alguns) para ver só para onde esse jogador foi. Use-as para seguir o seu próprio movimento ou o de um adversário.

O painel aparece quando o conjunto de dados tem uma coluna de pessoa. O seu cabeçalho mostra o número de pessoas, ou `selecionadas de total` enquanto há uma seleção ativa (uma *pessoa* é um jogador ou uma IA, veja o [glossário](glossary.md)).

## Escolher um jogador {#pick-a-player}

1. Abra **Entidades** na barra lateral.
2. Escreva parte do nome na caixa de pesquisa.
3. Marque o jogador. O cabeçalho lê, por exemplo, `2 de 10`, e tudo o resto desaparece.
4. **Limpar** mostra outra vez todos.

![Entidades com dois de dez jogadores selecionados](../assets/img/en/entities-selected.webp)

A seleção mostra só as pessoas selecionadas, nos modos de calor (pontos, linhas, diferença, calor por equipa), assim como nos trajetos, figuras e rastos da [sobreposição de figuras](box-replay.md). Deixe-a vazia para mostrar todos; selecionar todos é o mesmo que não selecionar ninguém.

## O painel {#the-panel}

| Parte | Significado |
|---|---|
| Caixa de pesquisa | *Pesquisar N entidades...* - filtra a lista por uma parte do nome, sem distinguir maiúsculas. Mostra `N correspondências`, ou `N correspondências, a mostrar as primeiras 200`; *Nada corresponde a "..."* quando a pesquisa não encontra nada. |
| Lista | Até 200 pessoas (as primeiras 200 que correspondem), cada uma com uma caixa de seleção, uma amostra da cor da pessoa e o nome (*(sem nome)* para um nome vazio). |
| Dica de em jogo | Quando o tempo está a correr, a lista tem as que estão *em jogo na cabeça de reprodução*; uma pesquisa encontra todas. |
| **IA (n)** | Um grupo recolhível com as unidades controladas por IA, à parte dos jogadores. |
| **Adicionar os mostrados** | Acrescenta à seleção todos os que estão listados neste momento. |
| **Só os mostrados** | Torna a seleção exatamente igual aos listados. |
| **Limpar** | Esvazia a seleção. |

## Limites {#limits}

No calor, a seleção é um filtro e usa um dos quatro [espaços de filtro](filters.md#rules). Quando os outros filtros já ocupam os quatro, o painel diz *Não aplicado ao calor: todos os espaços de filtro estão ocupados. A sobreposição de figuras continua a mostrar só estas entidades. Limpe um filtro em Filtros para libertar um.* Limpe um filtro para libertar um espaço.

A seleção é limpa em cada conjunto de dados novo. O separador Partida define a mesma seleção quando se foca num jogador.

## Para programadores {#for-developers}

A seleção é guardada como um filtro de *pessoas* ([Filtros](filters.md#for-developers)). A máscara do shader guarda 65 536 ids de pessoa; uma pessoa acima disso não é desenhada no calor enquanto houver uma seleção ativa.
