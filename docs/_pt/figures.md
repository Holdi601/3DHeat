---
title: "Figuras"
nav_order: 11
has_children: true
lang: "pt"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figuras

Uma **figura** é um pequeno modelo 3D daquilo que uma unidade realmente é: um tanque, um jato, um navio, um soldado. A [repetição](match-replay.md) desenha cada unidade como a sua figura, à escala real, em vez de uma caixa simples.

Há cerca de 2000 veículos, aeronaves, navios, armas e soldados com nome, todos construídos pelo próprio visualizador.

![Tanques da demo desenhados como figuras próprias](../assets/img/en/replay-tanks.webp)

## O que está no catálogo {#what-is-in-the-catalogue}

| Domínio | Exemplos |
|---|---|
| Pessoas | soldado de pé, agachado, deitado; franco-atirador, anticarro, médico, tripulação |
| Terrestres | tanques, viaturas de combate de infantaria, defesa antiaérea, artilharia, camiões e carros, comboios e elétricos |
| Aéreos | caças, aviões de ataque, bombardeiros, transportes, helicópteros, de biplanos a jatos modernos |
| Mar | navios de guerra por classe, porta-aviões, submarinos, barcos, navios mercantes |
| Armas | mísseis, foguetes, bombas, torpedos, sinalizadores e palha |
| Marcadores | granadas de fumo, flash e incendiárias, bombas colocadas, bandeiras, spawns, pontos de passagem |

## Como as figuras são feitas {#how-the-figures-are-made}

- **Construídas a partir de dimensões publicadas.** A maioria das figuras é feita pelo construtor de figuras do próprio visualizador a partir de números públicos: comprimento, largura, altura, rodas, torre e canhão, asas e cauda. A sua forma é depois ajustada com fotografias públicas, desenhos e dimensões publicadas. Não se usa nenhum modelo de jogo.
- **Modelos gratuitos.** Algumas figuras usam modelos 3D gratuitos (CC0 ou CC BY) quando são mais fiéis, por vezes combinados com o casco construído. Os autores de obras CC BY são creditados em [Créditos das figuras](figure-credits.md); as obras CC0 não exigem crédito e não estão listadas aí.
- Cada figura tem uma versão completa, uma grosseira e uma distante (níveis de detalhe, LOD), para que se possam desenhar milhares de uma vez.

## Que figura recebe uma unidade {#which-figure-a-unit-gets}

O visualizador olha para as colunas dos próprios dados:

1. **Nomes** - colunas chamadas *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* ou *Figure* - são comparadas com o catálogo: exatamente, através de cerca de 4000 nomes alternativos (identificadores de unidades de vários jogos), pelo início conhecido mais longo (`F-16C_50` é o F-16C), ou pelo nome de figura mais curto que começa com ele.
2. Um nome cuja figura não encaixa no **tipo** da unidade não é usado (um camião chamado *Typhoon* não é o caça).
3. **Tipos** - colunas chamadas *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* ou *Domain* - dão uma figura de classe: etiquetas Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ícones de mapa, ou palavras simples (tank, helicopter, infantry).
4. Os dados sem nenhuma das duas são dados de pessoas: todos são soldados.

Por isso, a forma mais fácil de obter as figuras certas é uma coluna `vehicle` com os nomes reais, ou uma coluna `type` com etiquetas Tacview.

**A minha unidade aparece como caixa ou soldado.** Acrescente uma coluna `vehicle` com o nome real, ou uma coluna `type` com uma etiqueta Tacview. Passe o rato sobre a unidade para ver que nome foi encontrado. Os dados que têm essas colunas mas nada dizem sobre uma unidade deixam-na como caixa; os dados sem nenhuma delas são desenhados como soldados.

## Definições {#settings}

A secção **Figuras** da barra lateral da repetição define o tamanho, o menor tamanho no ecrã, o que se tornam as unidades distantes (figura, seta, símbolo) e os efeitos desenhados sobre elas. Ver [Repetição da partida](match-replay.md#figures). Fumo, fogo e outros efeitos temporizados: [Figuras na sobreposição de figuras](figure-replay.md).

## Um pacote local opcional de figuras {#an-optional-local-figure-pack}

Pode manter um pacote opcional de figuras próprias na sua máquina. As suas figuras tomam o lugar das figuras do catálogo com os mesmos nomes. Nunca faz parte do repositório nem de uma versão publicada; sem ele, nada muda.
