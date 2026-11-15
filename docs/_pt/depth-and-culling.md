---
title: "Profundidade e recorte"
parent: "Modos de calor"
nav_order: 4
lang: "pt"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---


# Profundidade e recorte

A profundidade faz com que colinas e muros escondam o calor atrás deles, como um muro real esconde uma pessoa. O recorte por distância mantém só o calor entre uma distância próxima e uma distância longínqua da câmara.

![Uma câmara baixa atrás de uma colina, com Ocultar atrás do terreno desligado (à esquerda) e ligado (à direita)](../assets/img/en/depth-and-culling-terrain.webp)

![Recorte por distância com Longe a 400 m e Cortar também o nível ligado: uma fatia do mapa à volta da câmara](../assets/img/en/depth-and-culling-far.webp)

Sem profundidade, um mapa de calor sobre um [nível](levels.md) 3D é uma sobreposição plana: tudo o que o conjunto de dados contém brilha através de cada muro com força total, as pistas de profundidade que o nível oferece são anuladas, e um ponto quente dentro de um edifício parece igual a um no telhado. A secção **Profundidade** faz com que o nível esconda o que fica atrás dele; o **Recorte por distância** limita o calor a uma casca ou a uma laje à volta da câmara; o [Corte](slice.md) tira uma laje do mundo. Os três aplicam-se aos modos de calor e mudam que linhas contribuem, por isso mudá-los reinicia a acumulação.

## Profundidade {#depth}

Os dois controlos precisam de um [nível](levels.md) - uma imagem de mapa ou um modelo 3D. Sem nível carregado não há nada atrás do qual esconder, e não fazem nada. Ambos ficam desligados enquanto [Achatar no plano do chão](sprite-shape.md#flatten-onto-ground-plane) estiver ligado.

### Ocultar atrás do terreno {#hide-behind-terrain}

**Ocultar atrás do terreno** (ligado por predefinição): um ponto de dados cuja superfície mais próxima da câmara é o *chão* (e não uma estrutura) é eliminado por completo, não apenas escurecido.

O terreno e os muros são opacos de maneiras diferentes. Vê-se *através* de um muro de propósito, para ver em que piso andava o tráfego; nunca se quer ver através de uma colina, porque atrás dela está o outro lado do mapa - que, num mapa com quilómetros, é a maior parte dos dados, e que se soma ao longo do horizonte numa faixa mais brilhante do que tudo o que está em primeiro plano. Um só escurecimento não serve para os dois casos, por isso o terreno tem um corte e os muros mantêm o escurecimento abaixo.

### Oculto atrás da geometria {#hidden-behind-geometry}

**Oculto atrás da geometria** (predefinido 0,8): o quanto um ponto de dados atrás da geometria do nível é suprimido. O valor lê-se *mostra-se através* em 0, *N% mais escuro* entre os dois (a posição do cursor, não o escurecimento medido), *totalmente oculto* em 1.

Cada muro ou piso entre um ponto e a câmara escurece-o ainda mais: um muro deixa poucos por cento na predefinição, e cada superfície extra reduz para metade o que resta, até quatro superfícies. Em 1 nada atrás da geometria é desenhado, e essa é a definição mais barata.

Veja também [Aspeto do nível](level-appearance.md).

## Recorte por distância {#distance-culling}

O **Recorte por distância** (fechado por predefinição) limita o calor às linhas entre um limite próximo e um limite longínquo a partir da câmara. Defina um limite longínquo para ler a densidade dentro de um edifício sem que o outro lado do mapa se some por cima; defina um limite próximo para voar *através* de um ponto quente em vez de entrar nele.

| Controlo | Predefinição | Intervalo (cursor) | Significado |
|---|---|---|---|
| **Perto** | desligado | 0,5-5000 m, logarítmico; os 5% de baixo da pista = desligado (200 000) | As linhas mais próximas do que isto são saltadas. |
| **Longe** | desligado | 1-200 000 m, logarítmico; o fundo = desligado (10 000 000) | As linhas mais distantes do que isto são saltadas. |
| **Cortar num plano** | ligado | | Medir os limites ao longo do eixo da vista e não a partir do olho, para que o corte seja um plano paralelo ao ecrã e não uma esfera à sua volta. A borda de uma esfera curva-se ao atravessar a imagem e desliza sempre que roda; um plano fica onde o colocou. |
| **Cortar também o nível** | ligado | | Cortar o chão, as estruturas e a água pelos mesmos limites. Com o nível inteiro, o corte remove os pontos de dados e deixa o edifício de pé à frente deles; com ambos cortados, é uma secção pelo mapa e os pontos ficam encostados aos seus muros e pisos. Este só redesenha; não reinicia a acumulação. |

### Teclado {#keyboard}

O limite longínquo é um controlo que se varre - leva-o por dentro de um edifício e vê em que piso aparece o tráfego - por isso está no teclado enquanto voa ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tecla | Efeito |
|---|---|
| `]` | Empurra o limite longínquo para fora por um fator de 1,12 (Shift: 1,35) |
| `[` | Puxa-o para dentro pelo mesmo fator |
| `\` | Desliga o limite longínquo, ou volta a ligá-lo à distância onde ficou (6000 na primeira vez) |

Os passos são geométricos porque o intervalo útil abrange quatro ordens de grandeza, de uma sala a um mapa. O teclado mantém o limite longínquo entre 100 e 400 000. As teclas não fazem nada enquanto uma caixa de texto ou um menu tiver o foco.

## Para programadores {#for-developers}

### Ocultar atrás do terreno {#hide-behind-terrain}

As estruturas são desenhadas numa textura de profundidade própria. Um fragmento que está atrás da profundidade da cena mas *não* atrás da profundidade das estruturas está atrás do chão, e é descartado. Custa uma passagem de profundidade sobre as estruturas, saltada quando o interruptor está desligado.

### Oculto atrás da geometria {#hidden-behind-geometry}

É contado **por superfície**. Uma única comparação de profundidade só pode dizer "há algo à frente", por isso um ponto atrás de um muro e um ponto quatro salas dentro de um edifício escureciam da mesma forma, e o interior lia-se como uma mancha ténue só. Em vez disso, a geometria das estruturas é **descascada em profundidade** em até 3 camadas adicionais ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); cada fragmento conta quantas superfícies tem à frente (a profundidade da própria cena mais as camadas descascadas: até quatro), e o escurecimento acumula-se:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Cursor | 1 superfície | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (predefinido) | 4% | 2% | 1% | 0,6% (piso) |
| 1,0 | não desenhado | não desenhado | não desenhado | não desenhado |

Porquê dois fatores: o cursor está calibrado para que um muro deixe poucos por cento - o aspeto que se lê como "atrás de algo" - e poucos por cento acumulados seriam nada à terceira parede; dividir por dois por cada superfície extra mantém quatro degraus distinguíveis. Porquê ao quadrado: com uma reta, um campo saturado continuava saturado atrás de um muro; uma quarta potência apagava-o a 0,8. Porquê um piso: ocultar por completo o calor escondido faz uma sala cheia de tráfego oculto parecer uma sala vazia, sem nada que sugira ir buscar o [Corte](slice.md). Só um cursor em 1 o oculta por completo - e é a definição mais barata, porque os pontos ocultos são então descartados.

Como ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), os sombreadores de calor de pontos): a comparação é feita por fragmento, contra a textura de profundidade da cena, em **profundidade de janela** e não em distância no mundo. Uma leitura da textura de profundidade no estágio de vértice dá "longe" em toda a parte em alguns drivers (o rasterizador de software do ANGLE entre eles), e linearizar ambas as profundidades em metros perde a separação por precisão quando o intervalo perto/longe é amplo. O desvio é um raio de sprite convertido em unidades de janela mais alguns bits menos significativos, por isso um ponto de dados assente numa superfície não se faz sombra a si próprio.

As estruturas são desenhadas translúcidas, mas são desenhadas na profundidade que a oclusão lê; um nível cujas estruturas não chegassem à textura de profundidade ocluiria apenas contra o terreno.

### Recorte por distância {#distance-culling}

Os dois limites são avaliados no sombreador de vértices, por isso uma linha recortada custa um vértice e nenhum fragmento.
