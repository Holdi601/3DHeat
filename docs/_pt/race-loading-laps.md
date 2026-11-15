---
title: "Carregar voltas"
parent: "Análise de corrida"
nav_order: 51
lang: "pt"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Carregar voltas

Um ficheiro de volta é uma gravação de uma condução: onde estava o carro e o que o condutor fez, muitas vezes por segundo. Carregue duas ou mais voltas do mesmo percurso e o separador **Análise de corrida** pode compará-las.

![A secção Voltas do separador Análise de corrida com três voltas de demonstração carregadas: lista de voltas, estrela de referência, foco](../assets/img/en/race-loading-laps-list.webp)

## As primeiras voltas {#your-first-laps}

1. Abra o separador **Análise de corrida**.
2. Só a ver? Carregue em **Voltas de demonstração** (veja [Voltas de demonstração](#demo-laps)).
3. As suas próprias voltas: grave-as no jogo com um gravador (veja [Formatos de ficheiro](#file-formats)). O gravador escreve um ficheiro por volta.
4. Carregue em **Carregar ficheiros de volta…** e escolha dois ou mais ficheiros do mesmo percurso, ou carregue em **Pasta…** e escolha a pasta que os contém. Também pode largar ficheiros ou pastas na vista 3D.
5. Clique numa volta da lista para ver onde perde tempo.

**Aviso: as voltas são comparadas um percurso de cada vez.** Carregar uma volta de outro percurso com nome limpa as voltas já carregadas.

## Os botões {#the-buttons}

| Controlo | Faz |
|---|---|
| **Carregar ficheiros de volta…** | um seletor de ficheiros para `.json`, `.csv`, `.txt`, `.ibt`, `.gz` e `.h3dcars`, vários de uma vez (`.h3dcars` é um ficheiro de carro, veja [Carros](race-replay-and-scene.md#the-cars)) |
| **Pasta…** | um seletor de pastas: cada ficheiro de volta na pasta e nas que estão dentro dela |
| **Voltas de demonstração** | três voltas inventadas de um circuito inventado (veja [Voltas de demonstração](#demo-laps)) |
| **Limpar** | remove todas as voltas (visível quando há voltas carregadas) |
| largar na vista | ficheiros e pastas inteiras largados na vista 3D são carregados da mesma forma |

As voltas são **acrescentadas** às já carregadas - **a não ser que sejam de outro percurso com nome: então as voltas carregadas são limpas primeiro** (as voltas são comparadas um percurso de cada vez). Os ficheiros que não podem ser lidos são listados sob os botões, uma linha cada; os outros carregam na mesma.

## Formatos de ficheiro {#file-formats}

O formato é reconhecido pelo conteúdo, não pelo nome do ficheiro. Em palavras simples:

- **heat3d-lap** é o ficheiro que o gravador do 3DHeat escreve para a maioria dos jogos.
- **FH Companion** é uma ferramenta gratuita que grava voltas do Forza Horizon. Escreve um ficheiro de volta e, ao lado, um ficheiro `.json.tele.gz` (a mesma volta com os dados de cada pneu, comprimidos em gzip). Escolha os dois juntos.
- **iRacing `.ibt`** é o ficheiro de telemetria do próprio iRacing; ative o registo no carro com Alt+L e carregue o ficheiro tal como está.
- Uma **CSV de voltas** é uma tabela simples, uma linha por momento.

| Formato | Origem típica | Lido por |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon e Motorsport pelo Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| `.json` de volta do FH Companion | a biblioteca de voltas do FH Companion | `fromFhCompanion` |
| telemetria `.json.tele.gz` do FH Companion | ao lado de cada ficheiro de volta do FH Companion | `readForzaTelemetry` |
| iRacing `.ibt` | os ficheiros de telemetria do próprio iRacing (registo ativado com Alt+L no carro) | `readIbt` |
| CSV de voltas | `heat3d_capture laps`, o plugin do Trackmania, ou qualquer CSV com `x`, `z`, uma coluna de tempo e opcionalmente uma coluna `lap` | `fromCsv` |

Como cada jogo é gravado e o que envia está documentado pelos gravadores:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
e [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Veja também [Outros jogos de corrida](other-games.md).

## Pastas e percursos {#folders-and-courses}

**Pasta…**, ou uma pasta largada, traz todos os ficheiros abaixo dela. Dentro de uma pasta só são considerados os ficheiros que terminam em `.json`, `.csv`, `.txt`, `.ibt` ou `.tele.gz`, e um `.json` que não seja uma volta (o ficheiro próprio de um percurso, o seu mapa) é ignorado sem erro.

**Vários percursos numa só escolha.** A biblioteca de voltas do FH Companion guarda cada percurso numa pasta com o nome `<nome do percurso> (course_<x>_<z>_to_<x>_<z>)` (ou um simples `course_...` para um percurso sem nome). Quando os ficheiros escolhidos estão em mais de uma pasta de percurso destas, nada é carregado; em vez disso, a secção **Voltas** diz "Estas são voltas de N percursos, e as voltas são comparadas um percurso de cada vez. Escolha um:" e lista cada percurso com o número das suas voltas (ficheiros que terminam em `.json`, `.csv` ou `.ibt`; `course.json` não conta), as com mais voltas primeiro. Clicar num carrega os ficheiros desse percurso.

Um percurso é identificado pelo seu nome e pelo seu ponto de **início**, não pelo fim: as corridas que nunca acabaram são guardadas pelo FH Companion com o mesmo nome e início (em `unfinished/`) com o sítio onde pararam como fim, e vão com o seu percurso - marcadas como **parcial** na lista.

**Vários traçados entre os ficheiros escolhidos.** Quando os ficheiros escolhidos diretamente (não a partir de pastas de percursos) são voltas de mais de um traçado com nome, a mesma escolha é oferecida por traçado; as voltas que não indicam nenhum traçado seguem com o traçado que estiver escolhido.

## Nomes dos carros {#car-names}

Uma volta é chamada pelo nome completo do seu carro, tal como o jogo o dá. Quando o ficheiro da volta não indica o carro:

1. **A pasta.** A biblioteca do FH Companion guarda as voltas em `<percurso>/<classe>/<nome do carro> '<aa> (car<número>)/<afinação>/<etiqueta>/<volta>.json`. A pasta mais interna que corresponde a `<nome> (car<número>)` dá o nome e o número; uma que corresponde a `car<número>` dá só o número. Só as escolhas de pastas e as pastas largadas trazem este caminho.
2. **Outra volta do mesmo carro.** Assim que uma volta indica um carro, cada volta com o mesmo jogo e o mesmo número de carro é chamada assim - as voltas carregadas em conjunto, e as voltas carregadas mais tarde neste navegador: os nomes ficam guardados em `localStorage` na chave `heat3d.carNames` (com a chave `<jogo>:<número do carro>`). Numa janela privada duram só enquanto as voltas.
3. De outra forma, "car 1234" pelo seu número, ou "car".

**Etiquetas.** Na lista de voltas, uma volta mostra o nome do seu carro; várias voltas do mesmo carro são numeradas "Nome #1", "Nome #2". As frases da análise usam as mesmas etiquetas quando são únicas; senão, o nome do carro com o tempo da volta, "Nome (1:29.616)" (tempos de exemplo), numerado mais se ainda não for único.

**Agrupamento.** As voltas pertencem ao mesmo carro (para envelopes, perfis e comparações) quando o seu número de carro - ou o nome, quando não há número - e o seu índice de desempenho são iguais (`carKey`): o mesmo modelo com uma afinação diferente é outro carro.

**Classes.** A classe de desempenho de uma volta é a do jogo (Forza D..X, o nome curto da classe do carro no iRacing); as estatísticas ordenam-nas D, C, B, A, S1, S2, R, X, e depois as outras por ordem alfabética.

## Voltas de demonstração {#demo-laps}

**Voltas de demonstração** carrega três voltas de um circuito inventado (quatro retas e quatro curvas para a direita), feitas por um modelo simples de veículo ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): a velocidade limitada pela aderência de cada curva, uma passagem de aceleração para a frente e uma passagem de travagem para trás, como faz um simulador de volta.

| Volta | Carro | Falhas |
|---|---|---|
| limpa | carro de aderência | nenhuma |
| com erros | carro de aderência | trava 35 m cedo na T2, põe o acelerador 30 m tarde na saída da T3, faz a T4 a 0,88 da sua velocidade, conduz 1,2 m para um lado |
| outro carro | carro de potência | nenhuma; conduz 1,2 m para o outro lado |

| Carro (número) | Aderência | Travagem | Tração | Potência/massa | Arrasto |
|---|---|---|---|---|---|
| carro de aderência (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| carro de potência (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

A volta com os erros fica em foco. O circuito está disposto como a Forza mantém o seu mundo (esquerdista), por isso - exatamente como numa volta real da Forza - aparece espelhado e o separador oferece **Inverter X**. As três voltas trazem dados por roda, por isso cada parte do separador tem algo para mostrar.

## A lista de voltas {#the-lap-list}

Cada linha, da esquerda para a direita:

| Elemento | Faz |
|---|---|
| ● / ○ | mostra / oculta a volta (linhas, carro, cartão, gráficos); as voltas ocultas são analisadas na mesma |
| traço de cor | a cor da volta |
| nome e etiquetas | clique para pôr a volta em **foco**; passe o rato para ver o seu ficheiro de origem e o carro (nome · classe PI · tração) |
| ⌖ | seguir este carro com a câmara (clique de novo para parar) |
| ★ | comparar tudo com esta volta (torná-la a referência); desativado na referência |
| × | remove a volta |

**Etiquetas:** *referência*; *melhor de X* (ou *melhor da sua classe*) na volta mais rápida de uma classe quando há várias classes; *parcial* numa corrida que não chegou ao fim.

**A segunda linha:** a classe (só com várias classes), o tempo da volta (`1:29.616`), a diferença para a volta com que é comparada (a melhor da sua classe, ou a referência) como `+0.512` (exemplo), e *começa tarde* quando a volta começa mais de 10 m depois do início da referência.

Com mais de 8 voltas, uma linha "N de M desenhadas" oferece **Mostrar todas** (desenhar cada volta: mais lento, e um emaranhado) e **Só as que estão em análise** (a referência, a volta em foco e a melhor da sua classe; as estatísticas contam todas as voltas em qualquer dos casos).

Por baixo da lista: a dica do espelho quando as voltas dizem que o desenho está espelhado (veja [mundos espelhados](race-replay-and-scene.md#mirrored-worlds)), e com duas ou mais voltas a dica "Clique numa volta para ver onde perde tempo …", mais, com várias classes, que cada volta é comparada com a mais rápida da sua própria classe.

### Referência e foco {#reference-and-focus}

- **Referência:** a volta a que todas as outras são alinhadas e, por omissão, comparadas. A volta **completa** mais rápida, a não ser que ★ escolha outra (a primeira volta carregada quando nenhuma está completa). Remover a volta de referência volta à escolha automática.
- **Foco:** a volta cujas conclusões, controlo do carro e mapas são mostrados. Fica onde o utilizador a pôs; senão, é a **mais lenta** que não é a referência ("a que mais há para aprender"). Pôr uma volta em foco também a torna visível de novo, e à melhor volta da sua classe. Pôr a referência em foco compara-a com a outra volta que foi mais rápida em cada curva.
- **Classes:** com voltas de várias classes de desempenho, cada volta é comparada com a volta completa mais rápida da sua própria classe (a referência, na classe da referência). Veja [Estatísticas do percurso](race-course-statistics.md).

### Cores {#colours}

Cada volta tem a sua própria cor, pela sua posição na ordem de carregamento, por isso uma volta mantém a cor quando as outras estão ocultas. As tonalidades estão espaçadas na roda de cores como o modo de equipas do mapa de calor espaça os grupos; para cada posição, a luminosidade (de 0,52 a 0,66 em OKLCH) e a crominância (de 0,12 a 0,18) são escolhidas para ficar o mais longe possível das posições vizinhas (e a última da primeira) com visão normal, protan e deutan, cada uma com pelo menos 3:1 sobre a superfície escura do gráfico.

## Para programadores {#for-developers}

Código: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Como cada formato é lido {#how-each-format-is-read}

Cada formato acaba num só `LapTrace`: canais com nomes canónicos (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., veja a [tabela de canais](race-charts-and-hud.md#the-channel-table)), o carro, o tempo da volta, se é uma volta completa, e um bloco `meta`. Em todos os formatos, `time` e `distance` são deslocados para começar em 0, e quando uma fonte não tem `speed`, ele é calculado como distância a dividir pelo tempo, a partir das amostras vizinhas.

#### JSON heat3d-lap {#heat3d-lap-json}

Um objeto JSON com `"format": "heat3d-lap"`. Campos lidos:

| Campo | Uso |
|---|---|
| `channels` | um objeto de arrays, um por canal, pelo nome canónico; canais por roda como `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` e `z` são obrigatórios |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | o carro: id, nome, índice de classe da Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), índice de desempenho, código de tração (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | o tempo da volta; o último valor de `time` quando falta |
| `lap.complete` | `false` marca uma corrida parcial; qualquer outra coisa é completa |
| `game`, `track` | nomes; `game` decide a disciplina (veja abaixo) |
| `units.slipRatio` / `units.slipAngle` | como o escorregamento está escalado: uma unidade com `raw` quer dizer `scaled`, `normalised` quer dizer `peak`, qualquer outra `physical` |
| `meta` | `slip`, `surface`, `discipline` como indicados substituem o que está acima |

Sem um canal `distance`, a distância é somada a partir das posições 3D.

#### Ficheiros de volta do FH Companion {#fh-companion-lap-files}

Um objeto JSON com um objeto `Lap` que tem um array `samples` (uma amostra a cada 5 m, mais ou menos). Campos mapeados:

| FH Companion | Canal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (deslocado para a volta começar em 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | os mesmos, em minúsculas |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², apesar do nome) |
| `Puddle` | `puddle` |

O carro vem de `Lap.carOrdinal`, `Lap.carName` (só em ficheiros mais recentes), `Class` (ou `Lap.carClass` como índice de classe da Forza), `Lap.performanceIndex`, `Lap.drivetrain` e `Lap.peakKilowatts`; o tempo de `Lap.lapSeconds`; uma corrida com `EndedAtFinish: false` é parcial. O jogo é `forza-horizon`.

Estes ficheiros não trazem dados de pneus nem rumo, por isso bloqueios, patinagem e deslizes não se podem julgar só com eles; os empurrões (a partir da direção contra a trajetória) e os embates e colisões ainda se podem. Escolha também o `.tele.gz` ao lado de cada um para o resto.

#### Telemetria do FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON comprimido em gzip `{ version, columns, data }`: todo o Data Out da Forza para uma volta, uma linha por pacote, com os próprios nomes de campos do jogo. As colunas são procuradas pelo nome, nunca pela posição. O formato 2 guarda cada pacote (cerca de 110 por segundo, contra os 64 ticks do jogo); uma linha igual à anterior em tudo menos no relógio próprio do gravador (`t`, `metres`) é descartada, por isso uma volta é lida com as 64 linhas por segundo do jogo. (O texto de ajuda do botão de carregamento diz isso: "para o escorregamento de cada pneu a 64 Hz".)

| Campo do Data Out | Canal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (referencial do carro: x para a direita, y para cima, z para a frente) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, escalados de 0..255 para 0..1 |
| `Steer` | `steer`, escalado de -127..127 para -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, convertido de Fahrenheit para °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` por roda |

`<Wheel>` é `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. O escorregamento é marcado como `peak` (o escorregamento normalizado da Forza: acima de 1 o pneu já perdeu a aderência).

**Emparelhamento.** Um ficheiro de volta `<lap>.json` e `<lap>.json.tele.gz` escolhidos ou largados juntos (mesmo caminho, mas `.tele.gz`) tornam-se **uma** volta: os canais da telemetria, com o carro, a classe, o tempo, o traçado e a marca de parcial do ficheiro de volta. O nome do carro do próprio ficheiro de telemetria ganha quando tem um. Um `.tele.gz` sozinho também carrega: os ficheiros do formato 2 trazem `car` (`ordinal`, `name`, `class`, `pi`), `track` e `lapSeconds`; sem eles, o tempo da volta é a duração da própria telemetria e o carro é desconhecido.

#### iRacing `.ibt` {#iracing-ibt}

O ficheiro de telemetria do iRacing é lido diretamente (no navegador, sem conversão): o cabeçalho de 112 bytes, o subcabeçalho de disco de 32 bytes, a tabela de variáveis (144 bytes por canal) e o YAML da sessão.

- **Canais obrigatórios:** `SessionTime`, `Lap`, `Lat`, `Lon`. Sem eles: "… não tem os canais SessionTime, Lap, Lat e Lon - é um ficheiro de telemetria do iRacing?"
- **Posições:** a latitude e a longitude são dispostas em metros num plano tangente ao primeiro ponto GPS não nulo (raio da Terra 6 371 008,8 m): x a leste, z a sul, y a altitude (`Alt`) - por isso, com a câmara por omissão, o norte fica para cima no ecrã. Não é o referencial do próprio traçado: um modelo de percurso extraído não ficaria alinhado.
- **Voltas:** a sessão é dividida onde `Lap` muda; uma volta fica quando tem mais de 60 amostras, começa abaixo de 5% de `LapDistPct` e acaba acima de 95%. As voltas parciais são descartadas. Sem nenhuma restante: "… não tem nenhuma volta completa do traçado de N km" (comprimento do traçado vindo do YAML) ou "… não tem nenhuma volta completa".
- **Distância:** `LapDist` desde o início da volta, senão somada a partir das posições.
- **Carro:** de `DriverInfo`: o `CarScreenName` do jogador, o `CarID` (como número do carro) e o `CarClassShortName` (como classe). Traçado: `TrackDisplayName`, senão `TrackName`.

Canais mapeados:

| iRacing | Canal | Conversão |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | os mesmos nomes | - |
| `Clutch` | `clutch` | `1 - v` (o iRacing conta o engate; o nosso é o pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianos no sentido contrário aos ponteiros para -1..1, direita positiva; máximo de pelo menos 0,1, π quando falta) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | os mesmos, em minúsculas | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | dividido por 100 quando acima de 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura do meio da carcaça |
| `LFshockDefl` ... | `suspensionM.FL` ... | deflexão do amortecedor, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa para psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefixos das rodas: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Todos os outros** canais com um valor por amostra (que não sejam do tipo de bits) passam com o seu próprio nome - por roda quando começam por um prefixo de roda (`RRspeed` passa a `speed.RR`) - por isso os gráficos e as listas de valores dos cartões oferecem todos eles. O iRacing não regista escorregamento dos pneus: o controlo do carro é julgado pelo ângulo de deriva - `Yaw`, ajustado à direção do movimento, contra para onde o carro vai - e pela direção contra a trajetória. A taxa de guinada contra a aceleração lateral só é usada quando o rumo não pode ser ajustado, por isso não há ângulo de deriva nesse caso (veja [Eventos de controlo do carro](race-control-events.md)).

Erros: "… é curto de mais para ser um ficheiro .ibt", "… não tem um cabeçalho de telemetria do iRacing", "… não tem registos de posição".

#### CSV de voltas {#lap-csv}

Uma linha por amostra; muitas voltas num só ficheiro distinguem-se por uma coluna `lap`. O delimitador é detetado nas primeiras cinco linhas. Uma primeira linha opcional `# { ...json... }` descreve a corrida: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Coluna (sem distinguir maiúsculas) | Canal |
|---|---|
| `x`, `y`, `z` | posição (`x` e `z` obrigatórios) |
| `elapsed` ou `time` | `time` (obrigatório por volta) |
| `metres` ou `distance` | `distance` (senão somada a partir das posições) |
| `speed_ms` ou `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | os mesmos |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| qualquer nome de canal canónico, por exemplo `latVel`, `slipIndex.FL` | ele próprio |
| `lap` | a que volta pertence cada linha |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | tempo da volta, número do carro, classe, PI, percurso (da primeira linha de cada volta) |

Sem descrição, o jogo é tomado como `forza-horizon` e cada volta como completa. A origem de uma volta aparece como `<ficheiro> · <volta>` quando o ficheiro tem várias. Erros: "… não tem linhas", "… não tem colunas x e z", "… não tem voltas com uma coluna de tempo".

#### Disciplina e superfície {#discipline-and-surface}

O que a análise assume sobre uma volta, quando a volta não o diz (`lap.ts`):

- **Disciplina:** `meta.discipline`; senão, um nome de jogo que corresponda a `rally|wrc|dirt|rbr` é **ralis**, `trackmania` é **arcade**, qualquer outro é **circuito**.
- **Superfície:** `meta.surface`; senão, pelo nome do traçado e pela origem: um ralis com o nome `monte` é **misto**; `snow|ice|winter|arctic|sweden` é **neve**; os ralis de asfalto (Espanha/España/Catalunya/Costa Daurada, Croácia/Hrvatska, Europa Central, Alemanha/Deutschland, Japão, Córsega/Corse, Ypres, ou as palavras tarmac/asphalt) são **asfalto**; qualquer nome com `scramble|trail|cross country|dirt|gravel` é **solto**; outra especial de ralis é julgada pela forma como o carro foi conduzido: sobre as amostras acima de 12 m/s e em terreno (pelo menos 200 delas), um percentil 95 de aceleração lateral de 10 m/s² ou mais, junto com uma deriva mediana abaixo de 6° (tomada onde o carro curvou a 70% disso ou mais, pelo menos 30 amostras), é asfalto; tudo o resto, ou dados insuficientes para decidir, é solto. Um nome que não seja de ralis com `rally` nele é solto; tudo o resto é asfalto.
- Por amostra, um canal `loose` (a vibração do piso da Forza, os materiais do Trackmania, veja [Eventos de controlo do carro](race-control-events.md#the-ground)) substitui a superfície da volta.
