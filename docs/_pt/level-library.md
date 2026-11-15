---
title: "Biblioteca de níveis"
parent: "Níveis e geometria de fundo"
nav_order: 4
lang: "pt"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---


# Biblioteca de níveis

A biblioteca guarda os seus níveis neste navegador, para não ter de os carregar e simplificar outra vez. **Limpar os dados do site no navegador apaga a biblioteca, e não há exportação.** Guarde os seus ficheiros originais.

Processar um nível - ler, classificar, soldar, reduzir, empacotar texturas - é lento, e o resultado é sempre o mesmo. A **Biblioteca** no fundo do painel Fundo / nível guarda os níveis processados neste navegador, por isso uma malha reduzida nunca é reconstruída duas vezes ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Guardar e recarregar um nível {#save-and-reload-a-level}

1. Carregue uma imagem de mapa ou um modelo 3D e verifique se está correto.
2. Prima **Guardar na biblioteca**. O painel diz *Guardado. Da próxima vez carrega instantaneamente.*
3. Da próxima vez, abra a lista **Biblioteca** e prima ▸ no nível.
4. Prima ✕ para apagar uma entrada que já não precisa.

## Como usar {#using-it}

| Controlo | Efeito |
|---|---|
| **Guardar na biblioteca** | Guarda o nível atual. Uma imagem de mapa é guardada como PNG com as suas duas âncoras; um modelo, como os seus buffers processados. O painel diz *Guardado. Da próxima vez carrega instantaneamente.* |
| Lista da biblioteca | Uma linha por nível guardado: nome (com o seu tamanho guardado ao passar o rato), triângulos para um modelo ou largura em píxeis para uma imagem. |
| ▸ (*Carregar*) | Carrega a entrada como nível atual. |
| ✕ (*Apagar*) | Remove a entrada. |
| Linha de utilização | `Using X of Y.` - a estimativa de armazenamento do navegador para este site. |

Sem nada guardado, a lista diz *Vazia. Carregue um mapa ou modelo e depois «Guardar na biblioteca».*

## O que é guardado {#what-is-stored}

| Tipo | Guardado | Não guardado |
|---|---|---|
| Imagem de mapa | A imagem (PNG), o seu tamanho, as suas âncoras | Elevação, espelhamento, opacidade, brilho, dessaturação - repostos às predefinições (elevação = o Y mais baixo do conjunto de dados atual, espelhamento ligado) |
| Nível 3D | Vértices, cores dos vértices, coordenadas de textura, os seus azulejos e o atlas de texturas, triângulos de chão / estrutura / água, arestas das estruturas, contagens de triângulos | Nomes das partes e razões de classificação, e todas as definições de aspeto - repostas às predefinições de uma importação nova |

Um modelo carregado da biblioteca não tem lista de partes, e os seus limites e a sua faixa de altura do chão são recalculados a partir dos seus vértices.

## Onde fica {#where-it-lives}

No IndexedDB do navegador, base de dados `3dheat`, armazém de objetos `levels`, para a origem da página (o endereço na barra de endereços do navegador). É local a esse perfil do navegador: outro navegador, outro perfil ou outro endereço (por exemplo `localhost` em vez de `127.0.0.1`) veem uma biblioteca diferente, vazia. Limpar os dados do site no navegador apaga-a. As entradas guardadas por versões antigas, sem estruturas, cores ou água, continuam a carregar.
