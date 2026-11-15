---
title: "Gráficos e HUD"
parent: "Análise de corrida"
nav_order: 53
lang: "pt"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Gráficos e HUD

Os gráficos alinham as suas voltas metro a metro, para ver onde um condutor travou mais tarde ou levantou mais cedo. Os cartões no canto superior esquerdo da vista mostram o que cada carro e condutor está a fazer neste momento.

![Gráficos por baixo da vista: linhas de diferença, velocidade, acelerador, travão e direção de duas voltas, as faixas de tempo e de causa em cima, e o cursor com os cartões](../assets/img/en/race-charts-rows.webp)

## Os gráficos {#the-charts}

Cada volta num único eixo de distância - metros ao longo da referência (veja [um eixo de distância](race-corner-analysis.md#one-distance-axis)) - por isso o mesmo x é o mesmo sítio na pista para todas as voltas. Uma volta é desenhada sozinha (e reproduz-se); uma segunda volta do mesmo percurso é desenhada contra ela. Sem voltas carregadas (ou quando a análise falhou), a área diz: "Os gráficos aparecem quando uma volta estiver carregada; carregue outra do mesmo percurso para comparar as duas."

### O que aparece {#what-is-on-them}

- **A legenda**: a cor e a etiqueta de cada volta no gráfico, a referência marcada "(referência)"; "+N desenhadas, fora do gráfico" quando há mais voltas visíveis do que as que estão no gráfico; **Gráficos (N) ▾**; **Volta inteira** enquanto estiver ampliado; uma linha de ajuda.
- **Duas faixas** no topo, para a volta focada:
  - *tempo*: o [mapa de tempo](race-replay-and-scene.md#time-map-where) como faixa, a vermelho quando perde e a verde quando ganha;
  - *causa*: cada uma das suas perdas como uma barra sobre o sítio onde está a causa, na cor da causa; passe o rato sobre uma barra para ver o título e o custo.
- **Faixas de curva**: uma faixa sombreada desde a entrada até à saída de cada curva (como encontrada na referência) e o seu nome (`T1` …) por baixo do eixo, no vértice.
- **A conclusão selecionada**: uma faixa na cor da sua causa sobre o seu alcance.
- **As linhas** (gráficos), uma por canal escolhido, cada uma com o seu nome e o topo e o fundo do seu intervalo à esquerda, e uma linha de zero onde o intervalo passa por zero. Cada volta é uma linha na sua cor: a volta focada com 2 px de largura e opaca, a referência opaca, as outras com 1,5 px a 75%. A linha de diferença deixa a referência de fora (é zero em relação a si própria).
- **O cursor**: uma linha vertical onde está o carro de referência (ou onde está o ponteiro), e um ponto por carro em cada linha, exceto a da diferença - no cursor, cada carro está no mesmo metro; caso contrário, a distância própria de cada carro no relógio da repetição.

No máximo **8** voltas são desenhadas no gráfico: primeiro a volta focada, a melhor da sua classe e a referência; depois as outras, pela ordem de carregamento.

### Linhas e as suas alturas {#rows-and-their-heights}

As linhas partilham a altura do gráfico pelo peso, nenhuma abaixo de 16 px:

| Linha | Peso |
|---|---|
| Diferença (para a referência, segundos, com sinal) | 1,7 |
| Velocidade (km/h) | 1,7 |
| um pedal (acelerador, travão, embraiagem) | 1 |
| direção | 1,1 |
| mudança | 0,8 |
| uma luz (travão de mão, ABS …) | 0,55 |
| qualquer outra | 1 |

Um canal com um intervalo de visualização fixo na tabela (pedais 0-100%) usa-o; os outros ajustam-se ao troço visível das voltas. Um nome de linha longo demais para o espaço (uma palavra comprida noutra língua) desce o valor de topo uma linha quando a linha é suficientemente alta, e é cortado com reticências quando não é; o nome completo aparece na dica.

### Os gráficos por omissão {#the-default-graphs}

Até escolher gráficos: a **diferença**, depois todos os canais que a tabela marca como `graph` e que as voltas têm - acelerador, travão, embraiagem, travão de mão, direção, mudança, velocidade - exceto que um canal de pedal ou luz fica de fora, a não ser que alguma volta o mova além de 0,02 (uma embraiagem que nunca é premida não é um gráfico). A ordem é a da tabela.

### O seletor de gráficos {#the-graph-picker}

**Gráficos (N) ▾** abre um painel por cima do botão:

- uma caixa de filtro (procura pelo nome ou pelo id de um canal);
- **Predefinições** (volta ao conjunto por omissão; a sua dica diz quantos são) e **Fechar**;
- *Diferença para a referência*, depois cada canal que as voltas no gráfico têm, agrupado (movimento, comandos, motor, ajudas, pneus, travões, suspensão, rodas, outros, cronometragem, posição), com uma caixa de seleção cada; um canal por roda é uma linha com um chip por roda (FL, FR, RL, RR).

Marcar mantém a ordem da tabela, seja qual for a ordem em que marcou. A escolha mantém-se até **Predefinições** ou a um novo carregamento. Os canais que a tabela não conhece aparecem em *outros*, com o nome do seu próprio id ("brakeLinePress" → "Brake line press").

### Passar o rato, roda, zoom, clique {#hover-wheel-zoom-click}

| Ação | Efeito |
|---|---|
| passar o rato | cada carro, o seu cartão e os seus comandos mudam para esse metro; um poste marca-o na pista; uma tabela lista o valor de cada volta no gráfico em cada linha nesse sítio (a diferença mostrada como "ref" para a referência); acima dos cartões, "a N m - o cursor dos gráficos". Ao sair da área do gráfico, volta à repetição |
| roda | avança a repetição ao longo da volta 1/200 do troço visível por cada passo (Shift: 5×), pausando a repetição; quando ampliado, a vista segue o cursor |
| Ctrl+roda (Cmd+roda) | amplia o eixo de distância em torno do ponteiro, 1,25× para fora / 0,8× para dentro por passo, nunca mais estreito que 40 m; afastar até à volta inteira termina o zoom |
| roda lateral | desloca a vista quando ampliado (10% do troço por cada 100 unidades de deslocamento) |
| duplo clique, **Volta inteira** | afasta o zoom |
| clique | leva a repetição até onde a referência chega a esse metro |
| Shift+clique | alinha os carros nesse sítio (veja [alinhar](race-replay-and-scene.md#lining-up)) |

Os gráficos são redesenhados na língua atual quando ela muda.

A linha de ajuda da legenda diz o mesmo, em resumo: "Passar o rato: todos os carros aí · roda: avançar ao longo da volta · Ctrl+roda: zoom · clique: saltar · Shift+clique: alinhar".

## Os cartões dos carros (HUD) {#the-car-cards-hud}

No canto superior esquerdo da vista, um cartão por volta visível - no máximo **6**, as primeiras seis voltas visíveis pela ordem de carregamento - para o momento em que a repetição (ou o cursor dos gráficos) está.

**Cabeçalho:** a cor e a etiqueta da volta; a diferença ao vivo - o tempo desta volta para chegar à distância atual menos o tempo da referência para chegar à mesma distância, "+0,48 s" - ou "referência"; **⋯** para mostrar ou esconder todos os outros valores (o mesmo que *Todos os valores nos cartões*). O cartão do carro perseguido fica realçado.

**O carro de cima:** o contorno do carro na cor da volta, com uma seta na frente, quatro pneus (os da frente virados até 28° com a direção), cada um colorido pela sua temperatura, com os mesmos símbolos do carro 3D desenhado plano: anel de deslizamento, barra de suspensão, brilho do travão, faixa de desgaste, barra de carga.

**Leituras:** velocidade em km/h, o tempo da própria volta, a sua distância ao longo da referência.

**Comandos:**

- um volante virado pelo comando de direção (lock total desenhado como 180°), com a percentagem por baixo;
- uma barra por pedal, da esquerda para a direita como numa caixa de pedais - embraiagem, travão, acelerador - cada uma com a sua percentagem e nome curto, na sua cor (só os pedais que a volta tem);
- a mudança (R para marcha-atrás, N para ponto morto);
- uma pequena luz por cada canal de liga/desliga que a volta tem - travão de mão, ABS, TC, DRS, limitador de box, no ar - acesa na sua cor quando está ligada (acima de metade do seu intervalo);
- uma leitura por cada canal de nível: repartição de travagem, definições de ABS e TC, sobrealimentação, combustível.

**O traço dos comandos:** os últimos **6 segundos** de cada pedal (uma faixa, cada uma na sua cor) e a direção (a sua própria faixa, centrada), a terminar neste momento - o que o condutor fez até chegar aqui. Até 160 pontos.

**Todos os valores** (⋯ ou *Todos os valores nos cartões*): cada outro valor escalar que a volta tem neste momento, depois cada canal por roda como quatro valores (FL FR RL RR), com nome pela tabela de canais ou pelo nome do próprio canal, ordenados por grupo.

## Para programadores {#for-developers}

Código: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### A tabela de canais {#the-channel-table}

`CHANNELS` em [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts) é o único sítio onde um canal é descrito: a sua unidade, se é um valor por amostra ou um por roda (guardado como `name.FL` …), o seu grupo, um intervalo de visualização, como é desenhado no carro (`glyph`), como aparece no cartão (`input`: `pedal`, `steering`, `gear`, `lamp`, `level`), se é um gráfico por omissão, se avança por degraus em vez de se misturar (mudança, sinalizadores), e como é mostrado (escala, unidade, casas decimais). As etiquetas e os nomes curtos são mensagens em cada língua (`race.channel.<name>.label` / `.short`).

Canais com um desenho ou um gráfico por omissão:

| Canal | Unidade | Desenhado como | Gráfico por omissão |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedal (verde, vermelho, …), mostrado em % | sim |
| `handbrake` | 0..1 | luz | sim |
| `steer` | -1..1, direita positiva | volante | sim |
| `gear` | - | mudança | sim |
| `speed` | m/s, mostrado em km/h | - | sim |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | luz | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | leitura de nível | - |
| `tireTemp` (por roda) | °C, visualização 40-130 | cor do pneu | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (por roda) | como o jogo o escala, visualização ±1,5 | anel de deslizamento | - |
| `combinedSlip`, `slipIndex` (por roda) | visualização 0-1,5, 0-1 | anel de deslizamento | - |
| `suspension` (por roda) | 0..1 | barra de suspensão | - |
| `brakeTemp` (por roda) | °C, visualização 100-900 | brilho do travão | - |
| `tireWear` (por roda) | 0..1 | faixa de desgaste | - |
| `wheelLoad` (por roda) | N, visualização 0-12 000 | barra de carga | - |

Outros da tabela (em gráfico e listados, não desenhados): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (ângulo de derrapagem), `loose`, `lateral` (desvio em relação à referência), `rpm`, `power`, `torque`, `waterTemp`, `oilTemp`,
`tirePressure`, `camber`, `padLife`, `discLife`, `suspensionM`,
`wheelSpeed`, `wheelSurfaceSpeed`, mais `time`, `distance`, `x`, `y`, `z`.

**Um canal que não está na tabela** é mesmo assim lido, desenhado no gráfico (em *outros*) e listado nos cartões, com etiqueta pelo seu próprio nome. **Para lhe dar um nome, unidade e desenho próprios**, acrescente uma entrada à tabela (e a sua mensagem de etiqueta em cada `src/i18n/locales/<língua>/race-channels.json`). Um *tipo* novo de desenho de roda é uma entrada em `WHEEL_GLYPHS` (glyph.ts) e o seu gémeo plano `CARD_GLYPHS` (RaceHud.tsx); ambos são tipados pelo tipo, por isso a compilação falha até que existam os dois. `src/race/extensible.test.ts` verifica que os canais desconhecidos chegam aos gráficos, que cada símbolo da tabela pode ser desenhado e que as luzes acendem.
