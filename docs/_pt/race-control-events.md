---
title: "Eventos de controlo do carro"
parent: "Análise de corrida"
nav_order: 54
lang: "pt"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Eventos de controlo do carro

O visualizador vê como foi conduzida cada volta e assinala onde o piloto fez o carro derrapar, pião, bater em alguma coisa ou perder aderência. Isto é útil porque um erro que custou tempo é a coisa mais rápida de corrigir.

![A secção Controlo do carro: com que frequência cada volta bloqueou uma roda, deu pião ou saiu para fora, e a lista de falhas com uma aberta](../assets/img/en/race-control-table.webp)

## Por outras palavras {#in-plain-words}

- **Bloqueio**: trava-se tanto que uma roda para de girar e desliza. O carro trava pior e não consegue virar.
- **Patinagem**: carrega tanto no acelerador que as rodas motrizes giram mais depressa do que o carro avança. Perde-se força.
- **Sobreviragem**: a traseira do carro desliza para fora. Se der a volta completa, isso é um **pião**.
- **Subviragem**: a frente do carro desliza para fora («empurra»); rodar mais o volante não ajuda.
- **Toque** e **embate**: o carro tocou em alguma coisa (um toque é um choque ou um arranhão, um embate é um choque forte).
- **ABS**, **TC**: as ajudas do próprio carro que atuam contra o bloqueio e a patinagem. Não são erros.

## A secção Controlo do carro (o que se vê) {#the-car-control-section-what-you-see}

Para a volta em foco, seja o que for que as voltas tenham - sem deslizamento dos pneus e sem ângulo de derrapagem, mostra o que ainda se consegue encontrar em vez de nada (abaixo).

**A tabela**: uma linha por cada tipo que alguma das duas voltas mostre - Rodas bloqueadas, Patinagem, A traseira foge (sobreviragem e piões), Foge de frente, Embates, Toques, ABS a atuar, Controlo de tração a atuar, Travão de mão, No ar - cada célula «número · segundos», para a volta em foco e para a volta com que é comparada; e *Maior ângulo de derrapagem* quando há um ângulo de derrapagem (o maior no piso).

**A lista**: as suas falhas não partilhadas que custaram pelo menos 0,02 s, da mais cara para a mais barata, no máximo 12, cada uma com o título e o custo (e a etiqueta do seu tipo). Clique numa para ler a dica, alinhar os carros 40 m antes e repeti-la. **Também o que ambas as voltas fizeram ali** acrescenta todas as falhas, incluindo as partilhadas (etiqueta «ambas o fizeram», custo «—» abaixo de 0,01 s). Sem nenhuma: «Nada do que X fez com os pneus lhe custou tempo que Y não tenha feito também.»

**A dica por baixo** diz com o que a deteção pôde contar - «A partir do escorregamento de cada roda e do seu ângulo de escorregamento, e do ângulo de derrapagem do carro.» (ou escorregamento e ângulo de escorregamento, escorregamento e ângulo de derrapagem, só escorregamento, ou «Só a partir do ângulo de derrapagem do carro - estas voltas não trazem escorregamento dos pneus.») - o piso para o qual os limites foram medidos (asfalto, solto, misto: acima de 80% de amostras soltas é solto, abaixo de 20% é asfalto), com que volta os eventos foram comparados, e como se conta o custo.

Com **nenhum escorregamento dos pneus e nenhum ângulo de derrapagem** (um ficheiro de volta do FH Companion sem a sua telemetria), a tabela e a lista são mostradas na mesma, e a dica diz o que ainda foi encontrado a partir do que as voltas trazem: «Estas voltas não trazem escorregamento dos pneus nem ângulo de derrapagem, por isso bloqueios e patinagem não se conseguem distinguir. Ainda encontrado: empurrões, a partir do volante em relação à trajetória; toques e embates, a partir da velocidade e da aceleração.» - as derrapagens a partir da velocidade de guinada também são indicadas quando as voltas a têm, e os empurrões só onde há volante. A frase sobre os limites de escorregamento e de derrapagem fica de fora, e uma segunda dica diz: «Para o Forza Horizon, escolha também o ficheiro `.tele.gz` ao lado de cada volta do FH Companion: é a telemetria completa, o escorregamento de cada roda 64 vezes por segundo.»

O custo **total** de controlo da volta (usado nos resumos) conta uma só vez as falhas que se sobrepõem - um bloqueio e a derrapagem que começa com ele, dentro de 40 m -, no mais caro do grupo.

## Como é detetado {#how-it-is-detected}

O resto desta página é o livro de regras: cada tipo, cada limiar.

Código: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
O raciocínio e a literatura estão em [o método](race-analytics.md).

## Os tipos {#the-kinds}

| Tipo | Linha da tabela | Uma falha? | Mais curto que conta |
|---|---|---|---|
| `lock` | Rodas bloqueadas | sim | 0,1 s |
| `wheelspin` | Patinagem | sim | 0,15 s |
| `oversteer` | A traseira foge | sim | 0,2 s |
| `spin` | (contado com A traseira foge) | sim | 0,1 s |
| `understeer` | Foge de frente | sim | 0,25 s |
| `crash` | Embates | sim | - |
| `hit` | Toques | sim | - |
| `abs` | ABS a atuar | não | 0,2 s |
| `tc` | Controlo de tração a atuar | não | 0,2 s |
| `handbrake` | Travão de mão | não | 0,1 s |
| `airborne` | No ar | não | 0,15 s |

Os trechos mais curtos são ruído (um lancil, um solavanco, uma amostra). Os trechos de pontos da grelha (de 2 em 2 m) que passam um teste são unidos sobre falhas de até 2 pontos. Só as **falhas** podem ser erros e têm custo; os outros são o que o carro e o piloto fizeram.

## O que todos os testes precisam {#what-every-test-needs}

### Canais derivados {#derived-channels}

Antes de julgar seja o que for, cada volta recebe o que o seu jogo não envia, com nomes canónicos (um valor próprio do jogo tem sempre prioridade):

| Canal | A partir de |
|---|---|
| `bodySlip` (ângulo de derrapagem) | a velocidade no referencial do carro, `atan2(latVel, abs(longVel))`, onde o jogo a envia (0 abaixo de 3 m/s); caso contrário, a orientação (a guinada do jogo, ajustada ao sentido de marcha por sinal e desvio sobre amostras acima de 10 m/s, só de confiança com uma variância circular abaixo de 0,05) contra o sentido de marcha (posições a pelo menos 2 m de distância), a velocidades acima de 3 m/s |
| `yawRate` | a variação de `yaw` ao longo do tempo, onde há uma orientação mas não uma velocidade |
| `airborne` | o contacto de todas as rodas com o chão desligado (≤ 0,5); senão a carga de todas as rodas abaixo de 5% da sua mediana; senão o curso de todas as suspensões igual ou abaixo de 0,02 (totalmente estendidas). Uma amostra isolada não é um voo |
| `slipRatio.<W>` | `(velocidade da superfície da roda - velocidade do carro) / velocidade do carro` acima de 3 m/s, onde o jogo envia as velocidades da superfície das rodas; ou a partir da rotação da roda × um raio de rolamento medido na volta - a mediana de `velocidade / rotação` em reta a rodar por inércia (velocidade > 10 m/s, acelerador < 0,3, travão < 0,05, abs(aceleração longitudinal) < 3 m/s², fora do ar; todas as amostras acima de 10 m/s quando há menos de 20), aceite entre 0,1 e 1 m. Marcado como `physical` |
| `loose` | a vibração de superfície do Forza em pelo menos 2 rodas (> 0,001) durante pelo menos 0,33 s (um lancil é mais curto), com as falhas abaixo de 1 s ligadas |

### No chão e estabilizado {#on-the-ground-and-settled}

Nada é julgado no ar nem durante **0,3 s depois de aterrar** - a suspensão chega ao fim do curso e as acelerações disparam, o que não é aderência, travagem nem tração. Uma amostra também tem de estar **em movimento**: a mais de 5 m/s.

### O piso {#the-ground}

O piso de cada amostra é **solto** onde o canal `loose` da volta o diz (a vibração de superfície do Forza, os materiais das rodas do Trackmania), senão é a superfície da volta (ver [disciplina e superfície](race-loading-laps.md#discipline-and-surface)): asfalto, ou solto para tudo o resto. As curvas, os hábitos de derrapagem e os limiares são mantidos separados para o asfalto e o piso solto.

### Escorregamento, como múltiplo do pico nominal do pneu {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Os jogos escalam o escorregamento de maneira diferente; `meta.slip` diz como, e cada escorregamento é dividido por uma escala para que cerca de 1 seja o pico nominal do pneu:

| `meta.slip` | Significado | Dividido por |
|---|---|---|
| `peak` | normalizado pelo jogo: depois de 1 perde-se aderência (Forza Data Out) | 1 |
| `scaled` | escorregamento físico dividido por um pico de asfalto (o gravador da Kunos) | o pico nominal do piso sobre o do asfalto |
| `index` | uma medida de deslizamento de 0..1 (SlipCoef do Trackmania) | 0,5 |
| `physical` (ou desconhecido) | razão de escorregamento como fração, ângulo de escorregamento em radianos | o pico nominal do piso |

Picos nominais, quando não se sabe nada melhor:

| Superfície | Razão de escorregamento | Ângulo de escorregamento |
|---|---|---|
| asfalto | 0,12 | 8° |
| misto | 0,18 | 12° |
| solto (cascalho) | 0,25 | 15° |
| neve | 0,25 | 15° |
| gelo | 0,10 | 6° |

### Onde acaba a aderência: as curvas dos pneus de cada carro {#where-grip-ends-each-cars-tyre-curves}

Onde um pneu deixa de dar mais é **medido por carro**, a partir de cada volta carregada dele (`measureTyres`), separadamente para o asfalto e o piso solto:

| Curva | Amostras (velocidade > 10 m/s, estabilizadas, acelerações abaixo de 45 m/s²) | Escorregamento (x) | Força (y) |
|---|---|---|---|
| travagem | travão > 0,3, travão de mão ≤ 0,2, a andar em reta (lateral abaixo de 30% do máximo) | abs(razão média de escorregamento das quatro rodas) | desaceleração |
| tração | acelerador > 0,8, travão ≤ 0,05, em reta, a força do carro a fundo nessa velocidade > 0,5 m/s² | a razão de escorregamento da roda motriz mais escorregadia | aceleração como parte dessa força |
| frente | lateral acima de 30% do máximo, a aderência do carro nessa velocidade > 1 m/s² | o maior ângulo de escorregamento da frente | aceleração lateral como parte dessa aderência |
| traseira | o mesmo | o maior ângulo de escorregamento de trás | o mesmo |

«O máximo» é o percentil 99 do abs(aceleração lateral) da volta nesse piso (todo o piso quando tem menos de 50 amostras). A transmissão decide as rodas motrizes (tração dianteira, as frentes; traseira, as traseiras; integral, todas; desconhecida: todas).

A partir de pelo menos **150 amostras**, o escorregamento é dividido em 6 a 14 grupos iguais em número (um por cada 40 amostras), a força de cada grupo é o seu quartil superior (o que o pneu deu quando o piloto pediu), suavizada pelos grupos vizinhos. O **melhor** é o grupo com mais força; o **limite** é o primeiro grupo depois dele em que a força caiu **8%**. Uma curva que nunca cai nos dados não tem limite (infinito) - ultrapassar o «pico» não custa nada nesse jogo, e só o escorregamento não assinala nada aí (as curvas de curva e de tração do Forza Horizon são assim). Com amostras insuficientes num piso, usam-se as do outro piso; com amostras insuficientes no total, o limite **nominal**: 1,5 vezes o pico nominal.

Cada carro também recebe:

- o seu **hábito de derrapagem**: o quartil superior do seu ângulo de derrapagem sempre que faz uma curva a 60% ou mais do seu máximo (precisa de 100 amostras);
- a sua **direção por curvatura** (`steerGain`), por cada faixa de velocidade de 5 m/s: a mediana de abs(volante) / curvatura do traçado numa curva firme mas bem dentro da sua aderência (30-60% do seu máximo, curvatura mais apertada que um raio de 400 m, volante acima de 0,02; 25 amostras por faixa). A curvatura do traçado é a velocidade de guinada a dividir pela velocidade onde o jogo envia uma velocidade de guinada, senão a partir das posições ±5 m.

## Deteção, tipo a tipo {#detection-kind-by-kind}

| Tipo | Teste (em amostras em movimento e estabilizadas) | `peak` e `limit` |
|---|---|---|
| **lock** | travão > 0,05, travão de mão não acima de 0,2, e a razão de escorregamento de alguma roda abaixo de menos o limite de travagem | o escorregamento mais negativo (múltiplos do pico nominal); o limite como negativo |
| **wheelspin** | acelerador > 0,2 (ou sem canal de acelerador), e a razão de escorregamento de uma roda motriz acima do limite de tração | o maior escorregamento motriz; o limite |
| **oversteer** (ângulo de derrapagem) | o ângulo de derrapagem acima do maior entre o piso mínimo da superfície e 1,5 × o hábito de derrapagem do carro nesse piso | o maior ângulo de derrapagem, em radianos |
| **oversteer** (ângulos de escorregamento, sem ângulo de derrapagem) | o maior ângulo de escorregamento traseiro acima do limite traseiro e mais de 0,25 acima do da frente | o ângulo de escorregamento traseiro (múltiplos do pico) |
| **oversteer** (sem ângulo de derrapagem, mas com velocidade de guinada e aceleração lateral) | a «velocidade de atitude» - abs(velocidade de guinada) menos abs(aceleração lateral) / velocidade, acima de 8 m/s - acima de 0,2 rad/s, com o volante contra a curva | rad/s; limite 0,2 |
| **spin** | um trecho de sobreviragem cujo ângulo de derrapagem chegou acima de **60°** | como sobreviragem |
| **understeer** (ângulos de escorregamento) | sem derrapar, o maior ângulo de escorregamento da frente acima do limite da frente e mais de 0,3 acima do de trás | o ângulo de escorregamento da frente; o limite |
| **understeer** (sem ângulos de escorregamento) | mais depressa que 12 m/s, sem derrapar, sem contraesterçar, aceleração lateral acima de metade do máximo da volta (percentil 99), traçado mais apertado que um raio de 300 m, e volante mais de **1,6 vezes** o que a própria direção por curvatura do carro diz que o traçado pedia | vezes o volante necessário; limite 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` acima de 0,5 | - |
| **handbrake** | `handbrake` acima de 0,2 | - |
| **airborne** | `airborne` acima de 0,5 | - |
| **hit**, **crash** | ver [Toques e embates](#hits-and-crashes) | a velocidade que o impacto levou |

Os mínimos de ângulo de derrapagem por superfície: asfalto **7°**, misto **10°**, solto e neve **15°**, gelo **10°**. Um carro que derrapa mais por natureza - um modelo de pneu arcade, um especialista em cascalho - tem o seu próprio limiar, mais alto, a partir das suas próprias voltas (1,5 × o seu hábito).

**Para que lado vira o carro** (para «contra a curva»): a mudança de orientação do traçado da própria volta em ±6 m (pelo menos 2 pontos da grelha); mais apertado que um raio de 600 m conta como curva; direita ou esquerda conforme o mundo esteja espelhado. O volante está **contra** a curva quando abs(volante) > 0,05 e o seu sinal é oposto ao da curva - uma derrapagem a ser **travada** com contraviragem.

**Os pedais no início** (`pedal`): *travagem* quando o travão está acima de 0,1; *acelerador* acima de 0,3; *a levantar* quando o acelerador estava acima de 0,5 nos 8 pontos da grelha (16 m) antes; *a rodar por inércia* nos outros casos (ou sem canal de acelerador).

## Comparado com a outra volta {#laid-against-the-other-lap}

Cada evento é julgado contra a volta com que a volta em foco é comparada nesse trecho (a melhor da sua classe; para a própria volta, quem da sua classe foi mais rápido no trecho):

1. **Até onde foi a outra volta** nos mesmos metros, ±8 m: os próprios eventos da outra volta da mesma família (um pião conta como sobreviragem, um embate como toque) medidos nas mesmas unidades, sem limiares, usando as curvas de pneus do outro carro.
2. **Partilhado** quando a outra volta foi **80%** tão longe ou mais: é assim que a curva é feita, não um erro. Os tipos que não são falhas são sempre «partilhados».
3. **Custo**, para uma falha não partilhada: o tempo que esta volta perdeu para a outra desde 5 m antes do evento até **40 m depois** dele (para um toque ou um embate, até o carro recuperar a velocidade - os metros para a recuperar com a sua própria força, de 40 a 400 m; sem força medida, 5 m/s²). Nunca negativo.
4. **Velocidade dada ao limite do carro**: para um bloqueio, a desaceleração que o carro mostra conseguir fazer nessa velocidade menos a que fez, somada ao longo do evento; para a patinagem, a sua força a fundo menos a que fez; para um impacto, a velocidade que levou. Indicada quando passa de 0,5 m/s (1,8 km/h).

Uma falha que não é partilhada e custou pelo menos **0,02 s** é listada (as [estatísticas do traçado](race-course-statistics.md) contam só falhas de **0,03 s** ou mais, para que um erro contado em muitas voltas seja um erro claro), e pode tornar-se a causa da perda de uma curva (ver [Análise curva a curva](race-corner-analysis.md#car-control-faults-and-impacts)).

## Toques e embates {#hits-and-crashes}

`impacts.ts` lê os toques a partir das **próprias amostras** da volta, antes de serem reamostradas - um toque acaba em centésimas de segundo. Os pneus não conseguem criar as forças de um toque, por isso um toque é medido contra o próprio carro da volta:

- **A sua aderência `G`**: o percentil 99 da sua aceleração horizontal `√(lat² + long²)` ao longo da volta, no chão e a mais de 5 m/s. Sem canais de aceleração (ou abaixo de 3 m/s²), 15 m/s² - a aderência de um carro de estrada.
- **Limiar**: `max(1,8 G, G + 18, 30)` m/s².
- **Amostra com impacto**: a aceleração horizontal acima do limiar *e* a saltar mais de metade de `G` em relação à amostra anterior; **ou** a velocidade a cair, em 0,1 s, mais do que o limiar levaria em 0,1 s mais 1,5 m/s. Só no chão e estabilizada, e só quando o carro ia a mais de 5 m/s.
- As amostras com impacto dentro de **0,4 s** são um só impacto.
- **Antes / depois**: a velocidade mais alta nos 0,15 s antes; a mais baixa até 0,3 s depois da última amostra com impacto.
- **Não é um impacto**: a velocidade perdida sem força por trás - a aceleração horizontal máxima em 0,1 s abaixo do maior de `G` e 25 m/s² - é o jogo a retroceder ou a repor o carro.
- **Embate** quando levou **30 km/h** ou mais, ou quando deixou o carro com menos de metade da sua velocidade; **toque** nos outros casos - um encontrão, um arranhão contra uma parede.
- **Direção**: a aceleração longitudinal maior que a lateral e negativa: *de frente*; positiva: *por trás*; a lateral maior: *ao longo do lado*. Sem acelerações, de frente.

O que um carro consegue fazer mede-se com todos os impactos deixados de fora, de 0,1 s antes até 1 s depois (`struckMask`).

## Os textos {#the-texts}

Cada evento é descrito indicando as duas voltas, com onde (metros ao longo da referência), a velocidade com que começou, quanto ultrapassou o limite em relação à outra volta, e uma dica. A dica segue do tipo e do que foi medido:

| Evento | Dica |
|---|---|
| bloqueio, só as frentes | uma roda da frente bloqueada não consegue virar: menos pressão no início da zona, alivie-a ao entrar na curva |
| bloqueio, só as traseiras | uma traseira bloqueada deixa o carro rodar: trave mais em linha reta, alivie ao virar; mova a distribuição para a frente se continuar a acontecer |
| bloqueio, piso solto | uma roda bloqueada escava: aperte até quase bloquear |
| bloqueio, outros casos | pedal a mais para a aderência: aperte de forma mais progressiva |
| patinagem | dê acelerador à medida que o volante desfaz, mude mais cedo onde a tração limita (em piso solto: uma mudança mais alta suaviza o binário) |
| pião / sobreviragem | pelo pedal: em travagem (travagem em curva a mais, uma redução cedo demais), a levantar (sobreviragem ao levantar: mantenha um acelerador constante), a acelerar (demasiado enquanto ainda está virado), nenhum (entrou na curva depressa demais); «apanhado com contraviragem» quando houve contraesterçar; em piso solto ou em rali, «algum ângulo é o caminho rápido - o da outra volta bastou» |
| subviragem | mais volante não faz nada quando a frente já foi: chegue mais devagar, mantenha um pouco de travão para carregar a frente, e desfaça em vez de meter mais volante; em piso solto, rode o carro com um levantar ou um toque com o pé esquerdo |
| toque / embate | de lado: uma margem de um metro custa menos do que o arranhão; por trás: outro carro ou a deslizar para trás; embate de frente: trave mais cedo; um toque na frente: encostou em alguma coisa. «X também bateu ali.» quando é partilhado |

No Trackmania, uma derrapagem também diz: abaixo de cerca de **400 km/h** (**300** em piso solto: terra, relva, plástico) uma derrapagem dá menos tração do que aderir; acima, uma speedslide com o ângulo certo ganha, e esta custou tempo, por isso o ângulo estava errado.

## O que cada fonte permite {#what-each-source-allows}

| As voltas trazem | Bloqueios / patinagem | Sobreviragem / pião | Subviragem |
|---|---|---|---|
| razão de escorregamento e ângulo de escorregamento por roda, velocidade do carro (Forza Data Out, os jogos AC) | a partir do escorregamento | a partir do ângulo de derrapagem, ou do ângulo de escorregamento traseiro | a partir dos ângulos de escorregamento |
| velocidades das rodas, velocidade no mundo (jogos de rali, BeamNG) | a partir do escorregamento derivado | a partir do ângulo de derrapagem derivado | a partir da direção por curvatura |
| guinada e velocidade de guinada, sem escorregamento (iRacing) | - | a partir do ângulo de derrapagem (a guinada ajustada contra o sentido de marcha); a partir da velocidade de atitude com contraesterçar só quando a guinada não é de confiança | a partir da direção por curvatura |
| só orientação | - | a partir da orientação vs. o sentido de marcha | a partir da direção por curvatura |
| só o ficheiro de volta do FH Companion (sem guinada, sem escorregamento) | - | - | a partir da direção por curvatura (tem volante e acelerações) |

Toques e embates precisam só de velocidade (melhor com acelerações), por isso todas as fontes os têm. A secção **Controlo do carro** mostra o que cada fonte permite: com só um ficheiro de volta do FH Companion, os seus empurrões a partir do volante e os seus toques, e a dica para carregar o `.tele.gz` para o resto.
