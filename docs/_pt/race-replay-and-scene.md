---
title: "Repetição e cena 3D"
parent: "Análise de corrida"
nav_order: 52
lang: "pt"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Repetição e cena 3D

Repita as suas voltas juntas, como numa corrida, e veja onde um carro se afasta à frente. Aqui está descrito tudo o que vê na vista 3D do separador **Análise de corrida**: as trajetórias percorridas, as cores pintadas na pista, os carros e as etiquetas.

![Mapa de causas com os carros alinhados 40 m antes de uma curva: pista colorida, dois carros e o poste da bandeira](../assets/img/en/race-replay-lined-up.webp)

## O relógio da repetição {#the-replay-clock}

Um só relógio conduz cada volta: segundos da volta de **referência**. O motor avança-o a cada imagem enquanto reproduz (pelo tempo da imagem × a velocidade da repetição); no fim volta a 0 se **Repetir em ciclo** estiver ativo, senão para. O relógio não faz parte do armazenamento de propósito, para que a barra lateral não seja redesenhada a cada imagem; a HUD e os gráficos subscrevem-no e atualizam-se no máximo uma vez por imagem.

**A duração da repetição** é a volta mais longa no relógio: o tempo de cada volta (menos o seu deslocamento em *Alinhados*), ou o tempo da referência em *Lado a lado*.

## A barra de transporte {#the-transport-bar}

Por baixo da vista, da esquerda para a direita:

| Controlo | Faz |
|---|---|
| ⏮ | volta ao início (também **Home**) |
| ▶ / ❚❚ | reproduzir / pausa (também **K**) |
| velocidade | 0,25×, 0,5×, 1×, 2×, 4× |
| deslizador de deslocamento | define o relógio diretamente, em passos de 0,01 s |
| relógio | `tempo / duração · metros`: o relógio como tempo de volta, a duração da repetição, e quão adiante na referência está o carro de referência |
| *Desde a partida* / *Alinhados* / *Lado a lado* | o modo de repetição (abaixo) |
| **Alinhar aqui** | põe cada carro onde a referência está agora, e segue a partir daí |
| **Repetir em ciclo** | recomeça no fim (ativo por omissão) |
| **Ocultar gráficos** / **Mostrar gráficos** | os gráficos de distância por baixo da barra |

Os botões ficam desativados até haver voltas carregadas (uma volta chega para a repetir; as comparações precisam de duas).

## Modos de repetição {#replay-modes}

Como o tempo de cada volta segue do relógio:

| Modo | Tempo de cada volta | O que mostra |
|---|---|---|
| **Desde a partida** (`start`) | o próprio relógio | cada volta desde o seu início: uma corrida entre elas, com a diferença a crescer como cresceu na pista |
| **Alinhados** (`anchor`) | o relógio mais o deslocamento da volta | cada carro no mesmo sítio no mesmo momento, depois solto - o que acontece daí em diante, não desde o início da volta |
| **Lado a lado** (`locked`) | o tempo em que a volta chegou à distância atual da referência | cada carro mantido à distância da referência durante toda a volta: velocidades e comandos comparados metro a metro |

Use quando:

- **Desde a partida**: quer ver quem vai à frente e como a diferença cresce.
- **Alinhados**: quer saber o que acontece numa curva ou numa reta, com todos a partir do mesmo ponto.
- **Lado a lado**: quer comparar o que os condutores fazem com os pedais e o volante no mesmo sítio do percurso.

**Deslocamentos em *Alinhados*:** para um ponto de ancoragem em `s` metros ao longo da referência, o deslocamento de cada volta é o seu próprio tempo em `s` menos o tempo da referência em `s`, ambos lidos das voltas alinhadas (veja [um eixo de distância](race-corner-analysis.md#one-distance-axis)). Uma volta que não cobre `s` mantém o deslocamento 0. Escolher *Alinhados* nos botões de modo ancora na distância atual da referência.

Um poste branco com uma bandeira (14 m de altura) marca o ponto de ancoragem no modo *Alinhados*.

### Alinhar {#lining-up}

| Ação | Ponto de ancoragem | Relógio |
|---|---|---|
| **Alinhar aqui** | onde a referência está agora | inalterado |
| Shift+clique nos gráficos | o metro clicado | 1,5 s antes de a referência o alcançar |
| uma conclusão em *Onde melhorar*, um distintivo numerado na pista, uma linha de *Curva a curva* com uma conclusão | 40 m antes de onde começa a causa da conclusão | 1,5 s antes desse ponto; depois reproduz |
| um evento de controlo do carro, a etiqueta de um impacto | 40 m antes do evento | 1,5 s antes; depois reproduz |
| uma volta nas estatísticas do percurso | como a sua conclusão ou evento | como acima, com essa volta em foco |

Ver uma conclusão também a enquadra com a câmara - uma esfera à volta do meio do alcance da conclusão, com raio o maior entre 40 m e metade do seu comprimento mais 30 m (60 m para um evento) - a não ser que a câmara esteja a seguir um carro.

### Câmara de perseguição {#chase-camera}

⌖ na lista de voltas faz a câmara seguir esse carro: 2,5 + 4 × tamanho do carro metros atrás dele e 0,9 + 1,1 × tamanho do carro metros acima, a olhar na direção do movimento, inclinada para baixo para o carro, suavizada (20% do caminho a cada imagem) para não tremer a cada oscilação. ⌖ outra vez solta-a. O carro seguido é desenhado um pouco mais claro, com um anel branco no chão, e o seu cartão fica realçado.

## A secção Vista {#the-view-section}

| Controlo | Por omissão | Faz |
|---|---|---|
| **Linhas** / **Mapa de tempo** / **Mapa de causas** / **Mapa de erros** | Mapa de tempo | o que é pintado ao longo da pista (abaixo); *Linhas* não pinta nada |
| legenda | - | *ganha ↔ perde* para o mapa de tempo, as cores das causas para o mapa de causas, *poucas voltas ↔ mais voltas* para o mapa de erros |
| **Trajetórias percorridas** | ativo | a trajetória de cada volta visível, na sua cor |
| **Carros** | ativo | os carros, e as fontes dos cartões da HUD |
| **Pneus e suspensão** | ativo | temperatura dos pneus, anéis de escorregamento, bielas de suspensão e outros símbolos por roda, e as luzes do teto nos carros |
| **Etiquetas** | ativo | nomes das curvas, distintivos numerados, etiquetas de impactos, as etiquetas de curva do mapa de erros |
| **Pista a partir das voltas** | ativo | uma superfície de estrada para um percurso sem modelo extraído (oculta enquanto um modelo do percurso está carregado) |
| **Todos os valores nos cartões** | desativado | cada canal listado em cada cartão da HUD |
| **Formas reais dos carros** | ativo | cada carro na forma do seu equivalente (veja [Os carros](#the-cars)); desativado: o monolugar aberto, que não esconde nada da telemetria |
| **Tamanho do carro** | 1× | de 1× a 10× em passos de 0,5; 1× é o tamanho real do carro, tão comprido e largo como é no jogo. Só este deslizador o muda |

## Trajetórias percorridas {#driven-lines}

O caminho de cada volta visível pelas suas próprias amostras, na sua cor, desenhado 0,12 m abaixo da posição gravada (a posição gravada de um carro é o seu ponto de referência, 0,28 a 0,47 m acima da estrada nos percursos extraídos da Forza). Guarda-se um ponto a cada 1,5 m; com mais de 10 voltas visíveis, as voltas que não estão em análise guardam um a cada 6 m (cada vértice vai para a GPU a cada imagem).

## Os mapas {#the-maps}

Os três são faixas ao longo do caminho da **referência**, 0,2 m abaixo das posições gravadas, um quadrilátero por passo de grelha de 2 m.

### Mapa de tempo (`where`) {#time-map-where}

Para a volta em foco: segundos ganhos ou perdidos por metro face à volta com que é comparada nesse ponto (a melhor da sua classe, ou para a referência a volta mais rápida em cada segmento), a partir da variação do delta alinhado por passo de grelha, suavizada em ±10 m. Vermelho onde perde tempo, verde onde ganha, cinzento entre os dois; a escala de cores é o percentil 95 dos valores absolutos, por isso os picos são cortados e a maior parte da volta fica no alcance. 6 m de largura.

### Mapa de causas (`why`) {#cause-map-why}

Para a volta em foco: cada perda pintada sobre o alcance onde está a sua **causa** (e não onde o tempo aparece), colorida pelo grupo da causa, ganhando a conclusão mais cara onde duas se sobrepõem. Largura `3 + 9·√(custo / maior custo)` metros; onde nada foi perdido, uma faixa cinzenta de 2 m. A conclusão selecionada em *Onde melhorar* é pintada a branco.

| Grupo | Cor | Conclusões |
|---|---|---|
| travagem | laranja | perdas de condução na fase de travagem |
| entrada | magenta | perdas de condução à entrada e pelo meio |
| saída | azul | perdas de condução à saída |
| reta | amarelo | perdas de condução na reta |
| carro | cinzento | o que o carro explica |
| contexto | cinzento escuro | a situação (uma partida de corrida contra uma volta lançada) |

### Mapa de erros {#mistake-map}

Quantas de todas as voltas (das classes escolhidas nas estatísticas do percurso) cometeram um erro em cada metro - de qualquer tipo, ou só o escolhido nas estatísticas. Cada volta conta uma vez por metro; o alcance de cada erro é alargado em 6 m de cada lado para que um curto apareça. Largura `3 + 10·(voltas / mais voltas)` metros e uma cor de castanho apagado a laranja vivo; cinzento de 2 m onde nenhuma volta cometeu um. Veja [Estatísticas do percurso](race-course-statistics.md#the-mistake-map).

## Pista a partir das voltas {#track-from-the-laps}

Para um jogo cujo percurso não foi extraído, desenha-se uma estrada por baixo das linhas: tão larga como as voltas se espalham pela referência (contam os desvios laterais dentro de 25 m) mais 2 m de cada lado, pelo menos 4 m de cada lado da linha de referência, suavizada em ±8 pontos da grelha (±16 m), em cinzento de asfalto com linhas de bordo claras, 0,3 m abaixo das posições gravadas. Oculta enquanto um modelo do percurso está carregado em **Nível**.

## Impactos e colisões na pista {#hits-and-crashes-on-the-track}

Os impactos e colisões de cada volta visível (veja [Eventos de controlo do carro](race-control-events.md#hits-and-crashes)) são marcados onde aconteceram, sempre que linhas ou carros são desenhados: uma estrela com picos - vermelha para uma colisão, âmbar para um impacto - de pé sobre um poste, com um anel na cor da volta na base, dimensionado pelo tamanho do carro (as colisões são maiores). Quando um carro passa o momento de um impacto, um anel de choque espalha-se a partir dele durante 0,8 s.

## Modo de ajuda {#help-mode}

**?** ao lado do seletor de idioma, ou a tecla **?** ou **F1**, ativa uma legenda para todas as cores no ecrã, nos três separadores ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). A escolha fica neste navegador.

- **A legenda** no canto da vista lista as cores do separador e do modo em uso. Cada escala vem de onde a vista a obtém, por isso uma escala de calor que editou aparece como editada. No separador de corrida, só aparece o que as voltas carregadas trazem.
- **O cartão de cada carro** ganha uma tabela do que é desenhado nas suas rodas, pelo nome, com o valor de cada roda na cor em que é desenhada.
- **O carro em foco** recebe uma etiqueta em cada roda com o mesmo, colocada para fora, nos cantos. Oculta enquanto o carro é demasiado pequeno no ecrã para elas caberem.

## Os carros {#the-cars}

**Cada carro na sua própria forma**, na cor da sua volta e no seu tamanho real. As formas vêm de um ficheiro de carros, feito uma vez na máquina onde está o jogo:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Sem um, cada carro é desenhado como **o carro próprio do visualizador** do seu tipo e época: berlina, cupé, hatchback, carrinha, desportivo, superdesportivo, muscle car, todo-o-terreno, pick-up, furgão ou microcarro, cada um como clássico (antes de 1980), dos anos 80 e 90, ou moderno ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Estes são construídos aqui a partir de proporções gerais: sem logótipos, sem nomes de modelos e sem nada dos ficheiros de nenhum jogo, por isso vêm com o visualizador. O tipo vem do nome do carro, a época do ano que nele aparece; um carro sem nenhum dos dois é tomado pela sua classe. Cerca de cem gerações reais são conhecidas pelo seu comprimento, largura, altura e distância entre eixos publicados ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); uma linha cada, arredondada), por isso um Série 3 dos anos 90 tem o tamanho e a postura desse carro, ainda como uma forma simples, sem emblema nem grelha.

O ficheiro de carros é feito na sua própria máquina a partir da sua própria cópia do jogo. Contém um modelo de baixo detalhe de cada carro, cerca de 900 triângulos, com as posições das rodas (veja [o comando `cars` do extrator](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Carregar ficheiro de carros...** nas definições da vista, ou largar o ficheiro no separador de corrida, carrega-o; fica neste navegador. Contém as formas do jogo, por isso não é algo para passar a outros, e o visualizador não traz nenhum.

O carro que representa o de uma volta é calculado a partir do que está carregado de cada vez e nunca fica guardado, por isso um carro sem equivalente hoje ganha o seu próprio assim que um ficheiro mais recente o tenha ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Carro da volta | Desenhado como |
|---|---|
| o seu número está no ficheiro para o mesmo jogo | esse carro exato |
| mesma marca, e uma palavra do modelo no nome | esse modelo, o mais próximo em anos |
| mesma marca, mesma geração | o carro dessa marca mais próximo em anos |
| qualquer outro, com um ficheiro de carros | o mais próximo da mesma marca, se houver, senão o mesmo tipo de carroçaria, o mais próximo em anos |
| um monolugar, pelo nome | o monolugar abaixo |
| nenhum dos dois primeiros, e o visualizador conhece o carro pelo seu tamanho | o carro próprio do visualizador com o tamanho real desse carro, com ou sem ficheiro |
| qualquer outro sem ficheiro | o carro próprio do visualizador desse tipo e época |

Assim, uma volta de um BMW Série 3 de 1990 de outro jogo mostra um BMW desse ano aproximado, e um carro mais recente do que o ficheiro mostra o seu parente mais próximo até o ficheiro ser feito de novo. A dica de uma volta, e a linha sob o tamanho do carro para a volta em foco, dizem como é desenhado e quão perto isso está.

Os carros próprios do visualizador têm janelas escuras. Os modelos de um ficheiro de carros são de uma só cor em toda a parte, porque o ficheiro não tem pintura nem vidros em que se basear. As rodas, as luzes traseiras, os faróis e os símbolos da telemetria abaixo são desenhados como no monolugar; a biela corre pelo exterior da roda, onde se vê, e os triângulos de suspensão são omitidos.

**O monolugar** é um carro de rodas livres na cor da volta, por isso a frente é óbvia de qualquer ângulo e nada esconde as rodas: cuba, cobertura do motor, pontões laterais, habitáculo com um capacete, halo, fundo, asas dianteira e traseira; quatro rodas redondas, as da frente viradas pela direção (até 0,5 rad com o volante todo virado), cada uma sobre dois triângulos de suspensão com manga, barra de direção (à frente) ou semieixo (atrás), e uma biela. O modelo é descido 0,3 m a partir da posição gravada para que as rodas assentem na estrada, e escalado pelo **Tamanho do carro**.

**A carroçaria move-se nas suas molas**: quando a volta traz os quatro cursos de suspensão, cada canto desce pelo seu curso (exagerado para 0,12 m do máximo de extensão ao máximo de compressão para se ver de uma câmara de perseguição), e a carroçaria afunda-se, arfa e rola no plano definido pelos quatro.

**O que é desenhado a partir da telemetria** (com *Pneus e suspensão* ativo) segue a [tabela de canais](race-charts-and-hud.md#the-channel-table):

| Símbolo | De | Desenho |
|---|---|---|
| cor do pneu | `tireTemp` | o próprio pneu, azul frio → ciano → verde em funcionamento → amarelo → vermelho quente, entre 40 e 130 °C |
| anel de escorregamento | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (o maior) | um anel no chão sob a roda, verde com aderência em mão, âmbar a 0,66, vermelho a 1 (o limite de aderência como o jogo o reporta); ténue abaixo de 0,3 |
| barra de suspensão | `suspension` (0..1) | a biela colorida pelo curso: azul estendida, branca a meio, vermelha comprimida |
| brilho dos travões | `brakeTemp` (100-900 °C) | um disco na face exterior da roda, de escuro a laranja |
| faixa de desgaste | `tireWear` (0..1) | uma faixa à volta da borda do piso, branca nova → vermelha gasta |
| barra de carga | `wheelLoad` (0-12 000 N) | um poste ao lado da roda tão alto como a carga |

As luzes de travagem (luz de chuva e placas das asas) acendem-se com o pedal do travão. Cada canal `lamp` que esteja ligado (acima de metade do seu alcance) acende uma luz sobre a caixa de ar na sua cor: ABS a atuar, controlo de tração a atuar, DRS, limitador da boxe, travão de mão, no ar.

**Em multidão** (mais de 10 visíveis), os carros que não estão em análise são desenhados simples: carroçaria, asas, rodas e luz de travagem apenas.

## Etiquetas {#labels}

Fixadas à pista e colocadas a cada imagem a partir da projeção da câmara (fora do ecrã ou atrás da câmara, ocultas). Com **Etiquetas** ativo:

| Etiqueta | Onde | Clique |
|---|---|---|
| nomes das curvas (`T1`, `T2` …) | sobre o vértice de cada curva na referência | - |
| distintivos numerados 1-5 | as cinco maiores perdas de condução da volta em foco, no meio do alcance de cada causa, com contorno na cor da causa; passe o rato para o título e o custo | alinha e repete essa conclusão |
| etiquetas de impacto / colisão | sobre cada rajada da volta **em foco**: "Colisão −45 km/h" / "Impacto −12 km/h"; passe o rato para a descrição completa e a dica | alinha e repete o impacto |
| etiquetas de curva do mapa de erros (no lugar dos nomes das curvas e dos distintivos, quando o mapa é o mapa de erros) | o vértice de cada curva: "T3 · 5/40 travagem cedo" (o erro mais comum, voltas que o cometeram / voltas que fizeram a curva), "T3 · 5/40" quando um tipo está escolhido, "T3 · limpa" quando nenhum; passe o rato para as perdas da curva e os seus cinco erros mais comuns | abre ou fecha essa curva nas estatísticas do percurso |

## Mundos espelhados {#mirrored-worlds}

O mundo do visualizador é direito, com Y para cima: visto de cima, um carro cuja direção de movimento `atan2(dx, dz)` cresce está a virar para a esquerda. Um jogo com um mundo esquerdo - a Forza entre eles - aparece espelhado, com cada curva para a direita desenhada como curva para a esquerda, o percurso e as voltas igualmente.

As próprias voltas o dizem ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): percorrendo cada volta uns metros (3 m) de cada vez, a curvatura do seu caminho é comparada com a compressão da suspensão exterior (`suspension.FR` menos `suspension.FL`) e, sem suspensão, com a direção (positiva para a direita em todos os adaptadores). Uma volta que vira menos de π no total não diz nada; a prova conta quando passa 2% da curvatura. As voltas votam; um empate é "não é possível dizer".

Quando o veredicto das voltas não coincide com a inversão atual do eixo (um número ímpar de eixos invertidos em **Câmara e cena → Inverter um eixo do mundo**), a secção **Voltas** diz isso por baixo da lista:

- o jogo está espelhado e nada está invertido: "Estas voltas viram à direita onde o percurso está desenhado a virar à esquerda …" com **Inverter X**;
- há eixos invertidos mas as voltas não estão espelhadas: "Os eixos invertidos desenham estas voltas espelhadas …" com **Repor os eixos**.

Só muda o desenho - uma reflexão dobrada na matriz de vista; os dados, a análise e cada coordenada que as ferramentas mostram continuam a ser os do jogo. A inversão fica guardada no navegador. A análise dá nome às curvas à esquerda ou à direita pela mesma medição (um mundo desconhecido é tomado como espelhado, como o da Forza).

## Para programadores {#for-developers}

Código: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### O que é um carro num momento {#what-a-car-is-at-a-moment}

`stateAt` interpola cada canal entre as duas amostras à volta do tempo da volta. Os canais que dão saltos (mudança, bandeiras) tomam a amostra mais próxima. Uma volta que terminou para na linha.

**Rumo.** A direção do movimento vem de posições separadas por alguns metros (pelo menos 2 m de cada lado, para que um tremor não rode o carro). O rumo da carroçaria só vem da guinada do jogo depois de ajustado à direção do movimento - sinal e desvio, pela média circular sobre as amostras acima de 10 m/s (pelo menos 20) - e só se depois concordar com ela (variância circular abaixo de 0,05, cerca de 18° de dispersão); senão, a carroçaria aponta na direção do movimento. Isto mantém um deslize visível (carroçaria e movimento separados) sem confiar na convenção de ângulos de um jogo.

**Direção e lados.** Para que lado uma direção positiva roda o carro, e a que lado pertencem as rodas da direita do jogo, medem-se a partir da volta: a direção contra a rotação da trajetória, e que lado da suspensão comprime por fora nas curvas (sem dados de suspensão, os jogos da Forza são tomados como espelhados).
