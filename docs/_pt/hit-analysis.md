---
title: "Análise de impactos (separador Veículos)"
parent: "Replay"
nav_order: 4
lang: "pt"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---


# Análise de impactos (separador Veículos)

O separador **Veículos** mostra onde foi atingido um tanque, navio ou soldado, e por quem. Use-o para ver de que lado de um tanque se dispara, ou que inimigo causa mais dano.

## Experimentar {#try-it}

1. Carregue uma partida com impactos (veja a tabela abaixo para saber que jogos os dão).
2. Abra o separador **Veículos** no topo.
3. Em **Veículo**, escolha uma unidade, por exemplo um tipo de tanque. O número entre parênteses é quantos impactos sofreu.
4. Leia a figura: cada marca é um impacto, posta onde atingiu.
5. Abra **Quem a atingiu** para ver os atiradores, as armas ou os veículos atiradores, com impactos, dano, abates e distância.

![O separador Veículos: um tanque de demonstração com marcas de impacto, e Quem a atingiu aberto](../assets/img/en/hit-analysis-tank.webp)

Se não houver nada carregado, ou se os dados não tiverem impactos em veículos, o separador diz o que falta e que conversor usar.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

A figura mostra os impactos onde os dados dão um ponto ou uma parte do corpo. O detalhamento (quem a atingiu, com quê, com que força, de que distância) funciona para todas as fontes.

## O que dá cada fonte {#what-each-source-gives}

| Fonte | Ponto na unidade | Atirador | Arma | Dano / resultado |
|---|---|---|---|---|
| War Thunder | sim, no referencial da unidade, com a direção do disparo | sim | o veículo do atirador | crítico, grave, módulos destruídos, tiro mortal |
| CS2 | parte do corpo (hitgroup) | sim | sim | dano, blindagem, vida restante |
| World of Tanks | sim (caixa do componente, entrada e saída) | sim | - | dano ou nenhum (ricochete, sem penetração) |
| World of Warships | sim, no referencial do navio | sim | tipo de impacto | - |
| Squad | veículos: sim - o impacto posto no referencial do veículo a partir da sua própria posição e rumo | não (os dados não nomeiam nenhum) | o tipo de dano | a queda da vida do veículo nesse momento, destruído |
| Soldados do Squad | não: os resultados do impacto (osso e ponto de impacto) são guardados em bruto pelo conversor; as linhas `impact` com `hitBone` são lidas assim que as escreve | | | só feridas e mortes |
| Arma (OCAP, o gravador do Arma 3) | não: o OCAP regista quem atingiu ou matou quem, com quê, de que distância, não onde | sim | sim | impacto ou morte, distância |
| Tacview ACMI | sim onde um objeto de arma termina a menos de 30 m de uma unidade (não o lançador): o seu último lugar no referencial da unidade (rumo, inclinação, rolamento), chegando pelo caminho que voou | o `Parent` da arma | o nome da arma, ou o AmmoType de um Timeout | o Outcome do Timeout, quedas de `Health`, `Destroyed`; sem arma, um abate ou dano sem ponto |
| Telemetria do IL-2 (Watcher) | sim: os eventos `hit` / `damage` trazem o ponto no referencial do próprio avião do jogador (tomado como x para a frente, y para cima, z para a direita) | não | não | a força |
| Dota 2 | não: o registo de combate não tem lugar num herói | a unidade atacante | a habilidade ou o item (nenhum: um ataque) | o dano, a morte do herói |
| Battlefield 6 (GameCapture) | não: a captura lê o feed de abates (abates, mortes, marca de tiro na cabeça), não impactos | | | |
| DCS / outras fontes ao vivo do Watcher | nenhum evento de impacto além do que as suas gravações Tacview trazem | | | |

Onde nenhum impacto da unidade tem um ponto, a figura não mostra marcas e o detalhamento **Quem a atingiu** abre sozinho: por atirador, arma ou veículo do atirador, cada um com os seus impactos, dano e abates, e a distância mediana e a mais longa.

## Limitar a uma área {#restrict-to-an-area}

A secção **Área** limita a análise aos impactos que aconteceram num sítio do mapa.

1. Carregue em **Desenhar retângulo** ou **Desenhar polígono**, e desenhe no chão 3D ou no mapa tático.
2. Escolha **Vítima dentro** (conta um impacto quando a unidade atingida estava na área) ou **Atirador dentro** (quando estava quem disparou).
3. Carregue em **Usá-las como filtro**. As fichas mostram "{n} de {total} impactos na área".
4. **Repor área** remove todas as áreas.

Cada área é um [volume](volumes.md), por isso as mesmas formas também filtram o mapa de calor e a repetição. Uma área pode incluir ou excluir (uma área de exclusão deixa de fora os seus impactos, mostrado como "{n} de {total} impactos fora da área"). Cada área aparece como uma ficha com quantos dos impactos da unidade estavam nela; o × numa ficha remove-a. As contagens, a figura, o detalhamento e as listas de filtro seguem tudo isto.

Os sítios de um impacto: a linha de onde veio guarda o de uma parte (a da vítima para um ferimento ou um golpe, a do atirador para um disparo); o da outra parte é a amostra da própria unidade mais próxima no tempo (a menos de 5 s). Um impacto cujo sítio da parte não é conhecido fica de fora enquanto uma área filtra, e o painel diz quantos ("Ficou de fora, sem sítio conhecido").

## Para programadores {#for-developers}

Qualquer conversor pode acrescentar impactos: uma linha da vítima (`hit`, `impact`, `hurt`, `wounded`) com `hitBone` (um osso do esqueleto, uma seleção do Arma, uma zona de impacto do Reforger - mapeada para cabeça, peito, estômago, braços e pernas) ou `hitLocalX/Y/Z` (metros, x para a frente, y para cima, z para a direita), com `other` o atirador e `damage`.
