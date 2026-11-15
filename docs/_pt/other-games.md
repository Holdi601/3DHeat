---
title: "Outros jogos de corrida"
parent: "Análise de corrida"
nav_order: 59
lang: "pt"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# Outros jogos de corrida no visualizador

O visualizador lê voltas de muitos jogos de corrida, não só de um. Esta página indica quais são e explica como obter uma volta de cada um.

## Os jogos {#the-games}

| Jogo | Gravador | Deslizamento no ficheiro? | Mundo espelhado? | Notas |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (Data Out por UDP), ou os ficheiros de volta do FH Companion mais os seus `.tele.gz` | sim, por roda (normalizado) | sim (mundo esquerdino) | o `.tele.gz` ao lado de cada volta do FH Companion dá o deslizamento de cada roda; o ficheiro da volta sozinho não dá |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (memória partilhada) | sim, por roda | medido nas voltas | também o ABS e o controlo de tração a atuar, cargas nas rodas, temperaturas |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | não, calculado a partir das velocidades das rodas | medido nas voltas | rali: terreno solto e saltos são avaliados de outra forma |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (UDP NGP) | não | medido nas voltas | sem velocidades das rodas |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (um mod) | não, calculado a partir das velocidades das rodas | medido nas voltas | |
| Trackmania | o plugin do Openplanet, `telemetry --game trackmania --install` | um coeficiente de deslizamento por roda | medido nas voltas | física arcade: os derrapagens são avaliados de outra forma |
| iRacing | nenhum: o seu próprio ficheiro `.ibt` | não (não é registado); calculado a partir do guinamento | não (baseado em GPS) | ative o registo no carro com Alt+L |

## Como gravar uma volta {#how-to-record-a-lap}

1. Escolha o seu jogo na tabela e configure-o como indica a página do gravador para esse jogo (uma definição no jogo, um mod, ou nada no caso do iRacing). Os passos variam de jogo para jogo, por isso estão nos documentos dos gravadores: [GameCapture: jogos](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. Inicie o gravador e conduza. Ele escreve um ficheiro por volta.
3. No separador **Análise de corrida** prima **Carregar ficheiros de volta…** e escolha duas ou mais voltas do mesmo circuito (veja [Carregar voltas](race-loading-laps.md)).

Nos jogos de rali, o gravador dá um ficheiro por passagem de troço, e para o Forza o começo mais fácil é a biblioteca do FH Companion com os seus ficheiros `.tele.gz` ao lado dos ficheiros de volta.

## O que os gravadores documentam {#what-the-recorders-document}

Como cada jogo é gravado, o que envia, as fontes dos seus formatos e que circuitos podem ser exportados dos seus ficheiros é tarefa dos gravadores documentar: [GameCapture: jogos](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (público, no [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)), e o ficheiro de volta que cada gravador escreve está descrito em [GameCapture: o formato da volta](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).

## O que o visualizador faz com eles {#what-the-viewer-does-with-them}

Cada jogo acaba em ficheiros `heat3d-lap` (ou num CSV de voltas, ou é lido diretamente, como o `.ibt` do iRacing), com os nomes canónicos dos canais de `src/race/schema.ts` e um bloco `meta` que indica o que os seus números significam: como é escalado o deslizamento, se é circuito, rali ou arcade, e a superfície quando é conhecida. Assim o separador **Análise de corrida** trata todos da mesma forma. Quando não há nenhum modelo de circuito carregado, o separador **Análise de corrida** desenha uma estrada a partir da própria dispersão das voltas, por isso todos os jogos podem ser usados sem um modelo.

O que nenhum jogo de rali envia - o deslizamento dos pneus - o visualizador calcula: a partir da velocidade de cada roda na sua área de contacto ou na superfície, comparada com a velocidade do carro, quando um jogo envia uma dessas (`(roda - carro) / carro`), ou a partir da rotação e de um raio de rolamento medido na própria volta, quando envia apenas a rotação. O ângulo de deriva vem da velocidade própria do carro (Forza, os jogos AC, Trackmania, RBR), da velocidade no mundo projetada nos eixos do carro (EA WRC, DiRT, BeamNG), ou do rumo face ao traçado. Se o carro está no ar vem do contacto das rodas, das cargas ou da suspensão. Veja `src/race/derive.ts`.

Quando o mundo de um jogo é esquerdino - o do Forza é - o circuito sai espelhado no visualizador; os próprios comandos e a suspensão das voltas revelam isso, e o separador **Análise de corrida** oferece inverter um eixo. Os jogos cuja lateralidade não está documentada (RBR, BeamNG, Trackmania) são tratados da mesma forma: medida, não assumida.

Para além dos canais de condução, os gravadores guardam o que cada jogo acrescenta: nos jogos AC, o ABS e o controlo de tração a atuar, a distribuição da travagem, DRS, limitador de box, turbo e a vida das pastilhas e dos discos de travão; no iRacing, as definições de ajuda, a distribuição da travagem, o combustível, as temperaturas do óleo e da água, e cada outro canal que ele registe com o seu próprio nome. O visualizador desenha-os a partir da sua tabela de canais - luzes, níveis, símbolos, gráficos -, por isso gravar mais não exige nenhuma alteração no visualizador.
