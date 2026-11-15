---
title: "Aspeto do nível"
parent: "Níveis e geometria de fundo"
nav_order: 3
lang: "pt"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---


# Aspeto do nível

Estes controlos mudam o aspeto de um nível 3D, para que o calor se destaque dele e ainda assim se consiga ler o sítio. Nada aqui muda os dados.

## Início rápido {#quick-start}

1. Carregue um nível 3D ([Níveis 3D](model-levels.md)).
2. Em **Fundo / nível**, baixe o **Brilho** até o calor ser a coisa mais brilhante no ecrã.
3. Abra **Relevo do chão** e suba a **Sombreado por declive** ou a **Intensidade das curvas de nível** até conseguir distinguir uma colina de uma planície.
4. Abra **Estruturas**. Baixe a **Opacidade das faces** para ver dentro dos edifícios, ou ligue a **Textura das estruturas** para os ver sólidos.
5. Se o chão tiver uma imagem pintada, experimente desligar e ligar a **Textura do chão**.

![As secções Relevo do chão e Estruturas abertas, com o nível mostrado com pistas de relevo](../assets/img/en/level-appearance-sections.webp)

Com um [nível 3D](model-levels.md) carregado, o painel Fundo / nível mostra estes controlos. As predefinições são as que um nível recém-importado recebe ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Mudá-los só redesenha a cena; a acumulação do calor mantém-se.

## O nível inteiro {#the-whole-level}

| Controlo | Predefinição | Intervalo | Significado |
|---|---|---|---|
| **Opacidade** | 100% | 0-100% | Abaixo de 100% o nível é misturado e não escreve profundidade, por isso deixa de [ocluir](depth-and-culling.md) o calor. |
| **Brilho** | 0,9 | 0-2 (cursor 64) | |

O nível é desenhado dessaturado - chão cinzento, uma casca tingida - para que o calor seja a única coisa saturada no ecrã. Ao contrário de uma [imagem de mapa](map-images.md), um nível 3D não tem cursor de Dessaturar.

## Relevo do chão {#ground-relief}

De longe, uma colina e uma planície parecem o mesmo cinzento, por isso o visualizador acrescenta três pistas. Cada uma responde a uma falha diferente:

| Controlo | Predefinição | Significado |
|---|---|---|
| **Espaçamento das curvas de nível** | a partir do intervalo de altura do chão | Altura entre as linhas de nível, em escala logarítmica de 1/4000 a 1/2 do intervalo de altura do nível; o fundo da pista é *desligado*. A predefinição é 1/40 do intervalo de altura do chão arredondado a um passo 1/2/5 - linhas de 10 m servem uma encosta e são inúteis no fundo de uma pedreira. Cada 5.ª linha é desenhada mais forte. As curvas de nível são desenhadas no espaço do ecrã, por isso ficam com um píxel de largura seja qual for o zoom, e são a única pista que sobrevive a um chão tão plano que nem sequer se consegue sombrear. |
| **Intensidade das curvas de nível** | 35% | 0-100% |
| **Sombreado por declive** | 55% | Escurece pelo declive, para que taludes e falésias se leiam de qualquer ângulo da câmara - ao contrário de uma luz, que se achata sempre que se olha para ela. |
| **Rampa de elevação** | 50% | Chão baixo mais escuro, chão alto mais claro, ao longo do intervalo de altura do chão: a forma em grande escala. |

O cabeçalho da secção mostra o estado das curvas de nível: *cada N m*, o espaçamento das curvas, ou *sem curvas de nível* quando o espaçamento está desligado.

## Superfície do chão {#ground-surface}

| Controlo | Predefinição | Mostrado quando | Significado |
|---|---|---|---|
| **Água** | ligado | o nível tem água | Lagos, rios e mar, desenhados planos num cinzento-azulado pálido: nenhuma das pistas do terreno se aplica a uma superfície que é plana por definição. |
| **Opacidade da água** | 60% | a Água está ligada | A linha de costa e o chão sob as águas rasas veem-se através da água translúcida. |
| **Triângulos do chão** | 30% (0 num nível com texturas) | sempre | As arestas próprias do terreno desenhadas sobre a superfície sombreada, desvanecendo entre 6% e 25% da largura do nível a partir da câmara. Mostra como o chão foi amostrado de forma grosseira e dá a uma encosta algo para medir a distância. Construído na primeira utilização, o que demora um momento num nível grande. |
| **Chão só em wireframe** | desligado | sempre | Substitui a superfície do terreno pelas suas arestas. Totalmente esquemático - também abdica da sombra, das curvas de nível e da oclusão, por isso os *Triângulos do chão* são normalmente a melhor escolha. |
| **Textura do chão** | ligado | o nível tem texturas | Desenha o chão nas texturas que o ficheiro traz (asfalto, berma, relva). A iluminação da malha é aplicada suavemente por cima, porque a textura já traz o seu próprio relevo fino. O **Brilho** é a forma de a acalmar sob o calor; Dessaturar pertence às imagens de mapa. |
| **Cor capturada** | desligado | o nível tem cores por vértice | Sombreia o chão com a cor que um digitalizador capturou em vez de cinzento - uma estrada reconstruída de outra forma não se distingue da berma. As exportações de motores não trazem cor; quando falta, o painel diz *Este nível não tem cor.* |

## Estruturas {#structures}

O cabeçalho **Estruturas** mostra o número de triângulos das estruturas; a dica abaixo diz como são desenhadas (*desenhadas sólidas nas suas próprias texturas* ou *desenhadas como uma casca transparente para ver o calor lá dentro*) e quantas partes são estruturas.

| Controlo | Predefinição | Significado |
|---|---|---|
| **Textura das estruturas** | ligado quando as estruturas trazem texturas | Desenha as estruturas sólidas, nas suas próprias texturas. Ligar põe a opacidade das faces em 100% e desliga as arestas; desligar volta à casca tingida e transparente a 25%. Uma estrutura com textura é iluminada pelo lado que a câmara vê, porque um sinal são duas faces costas com costas, e qual das duas ganha o teste de profundidade depende do arredondamento. |
| **Arestas em wireframe** | ligado; desligado acima de 300 000 triângulos de estruturas ou quando tem texturas | Arestas das estruturas sem duplicados, uma linha por aresta. |
| **Opacidade das arestas** | 50% | |
| **Faces da casca** | ligado | Uma superfície ténue com um rebordo de Fresnel brilhante, para que um edifício se leia como um volume e não como uma gaiola ou um banco de nevoeiro. |
| **Opacidade das faces** | 25% (35% acima de 300 000 triângulos de estruturas, 100% com textura) | De 0-60% no percurso, até 100% com o manípulo. Mantenha-a baixa: as estruturas sólidas escondem os dados que têm dentro. |
| **Arestas vivas** | ligado (desligado quando tem textura) | Sombreia cada triângulo pela sua própria normal, calculada no sombreador de fragmentos a partir das derivadas do espaço do ecrã. Os níveis exportados estão soldados e trazem normais médias, o que arredonda cada canto de caixa numa "folha derretida"; dividir cada vértice para o corrigir multiplicaria o buffer de vértices. Desligue-o para um nível cujas superfícies curvas importem mais do que os seus cantos. |
| **Tom das estruturas** | Ciano | Um seletor de cores e as predefinições **Ciano**, **Âmbar**, **Violeta**, **Branco**. |
| **Mostrar classificação das partes (N)** | | Cada parte, a sua classe e a razão; veja [Níveis 3D](model-levels.md#ground-structures-and-water). |

## Cortar o nível {#cutting-the-level}

O [Corte](slice.md) e, com *Cortar também o nível*, o [recorte por distância](depth-and-culling.md#distance-culling) cortam o chão, as estruturas e a água pelos mesmos planos que o calor.
