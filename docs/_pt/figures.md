---
title: "Figuras"
parent: "Replay"
nav_order: 3
has_children: true
lang: "pt"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---


# Figuras

Uma **figura** é um pequeno modelo 3D do que uma unidade realmente é: um tanque, um jato, um navio, um soldado. O [replay](match-replay.md) desenha cada unidade como a sua figura à escala real, em vez de uma caixa simples.

Há cerca de 2 000 veículos, aeronaves, navios, armas e soldados com nome, todos construídos pelo próprio visualizador.

![Tanques da demonstração desenhados como as suas próprias figuras](../assets/img/pt/replay-tanks.webp)

## O que está no catálogo {#what-is-in-the-catalogue}

| Domínio | Exemplos |
|---|---|
| Pessoas | soldado de pé, agachado, deitado; franco-atirador, antitanque, médico, tripulação |
| Terra | tanques, viaturas de combate de infantaria, defesa antiaérea, artilharia, camiões e carros, comboios e elétricos |
| Ar | caças, aviões de ataque, bombardeiros, transportes, helicópteros, dos biplanos aos jatos modernos |
| Mar | navios de guerra por classe, porta-aviões, submarinos, barcos, navios mercantes |
| Armas | mísseis, foguetes, bombas, torpedos, sinalizadores e chaff |
| Marcadores | granadas de fumo, de flash e de incêndio, bombas colocadas, bandeiras, pontos de aparecimento, pontos de passagem |

## Como as figuras são feitas {#how-the-figures-are-made}

- **Construídas a partir de dimensões publicadas.** A maioria das figuras é feita pelo próprio construtor de figuras do visualizador a partir de números públicos: comprimento, largura, altura, rodas de estrada, torre e canhão, asas e cauda. A forma é depois ajustada com base em fotografias públicas, desenhos e dimensões publicadas. Não são usados modelos de nenhum jogo.
- **Modelos gratuitos.** Algumas figuras usam modelos 3D gratuitos (CC0 ou CC BY) quando são mais fiéis, por vezes combinados com o casco construído. Os autores das obras CC BY são creditados em [Créditos das figuras](figure-credits.md); as obras CC0 não precisam de crédito e não estão listadas aí.
- Cada figura tem uma versão completa, uma simplificada e uma distante (níveis de detalhe, LOD), para que milhares possam ser desenhadas de uma vez.

## Que figura recebe uma unidade {#which-figure-a-unit-gets}

O visualizador olha para as próprias colunas dos dados:

1. **Nomes** - as colunas chamadas *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ou *Figure* - são comparadas com o catálogo: exatamente, através de cerca de 4 000 pseudónimos (ids de unidade de vários jogos), pelo começo conhecido mais longo (`F-16C_50` é o F-16C), ou pelo nome de figura mais curto que começa com ele.
2. Um nome cuja figura não encaixa no **tipo** da unidade não é usado (um camião chamado *Typhoon* não é o caça).
3. **Tipos** - as colunas chamadas *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ou *Domain* - dão uma figura de classe: etiquetas do Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ícones de mapa, ou palavras simples (tank, helicopter, infantry).
4. Dados sem nenhum dos dois são dados de pessoas: cada um é um soldado.

Por isso, a forma mais fácil de obter as figuras certas é uma coluna `vehicle` com os nomes reais, ou uma coluna `type` com etiquetas do Tacview.

**A minha unidade aparece como uma caixa ou como um soldado.** Acrescente uma coluna `vehicle` com o nome real, ou uma coluna `type` com uma etiqueta do Tacview. Passe o rato sobre a unidade para ver que nome foi reconhecido. Dados que têm essas colunas mas não dizem nada sobre uma unidade deixam-na como caixa; dados sem nenhuma das duas são desenhados como soldados.

## Definições {#settings}

A secção **Figuras** da barra lateral do replay define o tamanho, o menor tamanho no ecrã, no que se transformam as unidades distantes (figura, seta, símbolo) e os efeitos desenhados sobre elas. Veja [Replay de partida](match-replay.md#figures). Fumo, fogo e outros efeitos temporizados: [Figuras na sobreposição de figuras](figure-replay.md).

## Um pacote local opcional de figuras {#an-optional-local-figure-pack}

Pode guardar no seu próprio computador um pacote opcional de figuras suas. As suas figuras tomam o lugar das figuras do catálogo com os mesmos nomes. Nunca faz parte do repositório nem de uma versão publicada; sem ele, nada muda.
