---
title: "Análise de corrida: o método"
parent: "Análise de corrida"
nav_order: 58
lang: "pt"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Análise de corrida: o método

Em resumo:

- As voltas são comparadas **pela distância**, não pelo tempo, para que o mesmo sítio da pista fique alinhado.
- Cada curva é avaliada **por inteiro**, desde uma zona de travagem até à seguinte.
- O tempo perdido é **dividido** pelo sítio onde foi perdido (travagem, entrada, saída, reta) e pela parte que o carro explica.
- A causa é **explicada por palavras**, com conselhos.
- Para usar, não para ler como funciona: veja [Análise de corrida](race-analysis.md).

Este é o método por trás do separador **Análise de corrida**: o que mede, como decide onde foi o tempo, e como o transforma em conselhos. É a especificação que o código de análise (`src/race/`) segue, por isso cada regra aqui tem uma correspondência nesse código e um teste que a fixa.

## O que fazem as ferramentas profissionais {#what-the-professional-tools-do}

As ferramentas estabelecidas convergem no mesmo núcleo e diferem sobretudo em quão longe vão até às *causas*:

- **Tudo é comparado pela distância, não pelo tempo.** Duas voltas são reamostradas num mesmo eixo de distância; a diferença acumulada do tempo decorrido à mesma distância é o *delta* (a MoTeC chama-lhe variação de tempo, outras o desvio de tempo ou a curva de delta). A sua inclinação diz onde se está a perder tempo neste momento: uma inclinação suave é aceleração, arrasto ou aderência sustentada; uma inclinação acentuada é uma diferença de travagem ou de acelerador; uma onda que sobe e desce é uma troca entre a velocidade de entrada e a saída.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Cada curva é dividida em fases**: travagem, entrada, meio, saída - ponto de travagem, travagem máxima e libertação, velocidade mínima e onde acontece, mudança de velocidade, levantar o acelerador, voltar a acelerar a fundo, velocidade de saída.
  ([Driver61: six phases](https://driver61.com/uni/corner-phases/),
  [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-setores por curva, e uma melhor volta teórica** montada a partir do mais rápido de cada um.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **A trajetória percorrida também é comparada**, mas nunca sozinha: "uma linha numa imagem não significa nada até conhecer os fatores que contribuem" - lê-se em conjunto com o traço de velocidade e o delta.
  ([Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Causa raiz, não sintoma.** A perda na reta é mesmo o acelerador, ou uma entrada má obrigou a acelerar tarde? Os erros são ordenados pelo custo em tempo de volta e explicados em linguagem simples.
  ([Track Titan coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### O que correu mal na primeira versão, e porque importa {#what-went-wrong-in-the-first-version-and-why-it-matters}

A primeira versão cobrava cada *fase* em separado e só olhava para as perdas. Uma volta que travou mais cedo perdia tempo na fase de travagem, e era-lhe dito para travar mais tarde - mesmo quando essa travagem mais cedo punha o carro a rodar mais cedo, a acelerar mais cedo e a sair da curva mais depressa, e recuperava tudo na reta. Num teste, disse à volta que fez isso para "travar muito mais tarde", quando a outra volta - que travou mais tarde - tinha falhado o vértice, saído largo e perdido exatamente o que tinha ganho. Os dados de tempo diziam que as duas passagens estavam empatadas; o conselho dizia o contrário.

A correção é a regra em que todas as fontes acima concordam: **uma curva é avaliada por inteiro**, desde a zona de travagem para ela até à zona de travagem para a seguinte, porque "por vezes, sacrificar alguns milissegundos numa curva pode melhorar o tempo total da volta ao permitir segmentos mais rápidos depois"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Conhecimento de corrida que as regras codificam {#racing-knowledge-the-rules-encode}

**A velocidade de saída importa mais do que a de entrada**, e mais quanto mais longa for a reta seguinte: "o tempo passado nas retas domina o tempo passado nas curvas", e um défice de velocidade à saída é levado para o próximo ponto de travagem. A forma mais rápida de passar uma curva e reta é muitas vezes curvar mais devagar para acelerar mais cedo - *lento a entrar, rápido a sair*.
([Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/))
Um planeador de tempo mínimo que também é recompensado pela velocidade de saída move os seus vértices para mais tarde e obtém uma volta *mais rápida*; a recompensa que equilibra as duas coisas vale `L / v²` por unidade de velocidade de saída, para uma reta de comprimento `L` a velocidade `v` - o tempo que uma diferença de velocidade custa numa reta cresce com o seu comprimento e cai com o quadrado da velocidade
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Curvas pelo que levam a seguir.** Uma que leva a uma reta: maximizar a velocidade de saída, vértice tardio, voltar a acelerar o mais cedo possível. Uma no fim de uma reta: maximizar a velocidade levada para ela, travar o mais tarde possível; um vértice mais cedo é aceitável. Uma entre curvas: comprometida em favor da que importa a seguir. Uma curva que pode ser qualquer dos dois tratar-se como uma que leva a uma reta. As curvas mais rápidas pesam mais: a alta velocidade um carro acelera pouco, e um km/h perdido não se recupera.
([Allen Berg: three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/),
[Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

**O círculo de aderência.** Um pneu tem um só orçamento de aderência, gasto em travagem, curva e aceleração numa mistura qualquer; a aceleração total é `sqrt(lat² + long²)`. A travagem em curva segue a borda desse círculo: o travão é libertado à medida que a direção e a carga lateral aumentam.
([friction circle](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Roda livre** - nenhum pedal carregado - é a forma mais lenta de perder velocidade, e um indicador de desempenho medido por si só.
([Racecar Engineering / OptimumG: coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Escorregamento.** A força longitudinal atinge o máximo com um rácio de escorregamento de cerca de 10-20%, e depois cai; para além disso a roda bloqueia na travagem ou patina com potência. A Forza reporta o escorregamento normalizado: 0 é aderência total, uma magnitude acima de 1 é aderência perdida.
([longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Subviragem e sobreviragem.** Um ângulo de deriva da frente maior do que o de trás é subviragem; o de trás maior do que o da frente é sobreviragem. Sem ângulos de deriva: o carro roda menos do que a direção pede (a direção acima do ângulo de Ackermann `L/R` de que um carro precisa a baixa velocidade).
([understeer, overview](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## A geometria de uma trajetória {#the-geometry-of-a-line}

A velocidade que um carro consegue manter num raio `R` é `v = sqrt(a R)`, com `a` a aceleração lateral que os seus pneus dão (mais o que a força descendente acrescenta, que cresce com `v²`). Assim, **a velocidade cresce com a raiz quadrada do raio**: uma trajetória pelo meio num raio 20% maior é cerca de 10% mais rápida ali.
([maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: cornering](https://www.formula1-dictionary.net/cornering_tech.html))

**A trajetória geométrica** é o maior arco através de uma curva: a partir da borda exterior, tocando o interior no vértice, de volta à exterior. Para uma curva que roda `θ` numa estrada de largura `w` (menos a largura do carro), um arco tangente às duas bordas exteriores e que toca o canto interior tem `R = w / (1 - cos(θ/2))` (mais o raio da própria borda interior) - para um ângulo reto cerca de `3,4 w`, para um cotovelo `w`. É por isso que usar a largura importa mais nas curvas médias e menos nos cotovelos.
([Racing line](https://en.wikipedia.org/wiki/Racing_line))

**O vértice tardio** entra mais tarde e mais fundo, num raio mais apertado no início, e abre o raio na saída: mais lento no meio, reta mais cedo, plano mais cedo - "uma velocidade mínima ligeiramente mais baixa mas um perfil de aceleração mais forte na saída". **O vértice cedo** é o inverso: mais rápido à entrada, e um raio que aperta na saída e segura o acelerador - sobretudo um erro, exceto com aderência muito baixa, onde a velocidade perdida à entrada não se consegue recuperar à saída.
([Racing line](https://en.wikipedia.org/wiki/Racing_line),
[Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**O "V" e o "U".** O U é a trajetória redonda clássica: o raio mais largo, a menor mudança de direção. O V entra mais cedo, vai mais fundo, roda o carro depressa no meio e alinha a saída para um percurso mais reto: a travagem mantém-se em reta (para poder ser mais tardia), a velocidade mínima é mais baixa mas atingida mais tarde, e o acelerador a fundo chega muito mais cedo.
([Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Curvatura contra distância.** A trajetória mais rápida é um compromisso entre o caminho mais curto e a menos curvada; na largura de uma pista, a curvatura pesa mais, e uma trajetória de curvatura mínima aproxima-se da de tempo mínimo sempre que o carro está no limite - separa-se dela onde o carro conseguiria acelerar.
([Global minimum-time trajectory planning](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Curvas seguidas** - um duplo vértice, uma chicane - são um só problema: a trajetória de saída de uma é a de entrada da seguinte, e são percorridas de trás para a frente a partir da que leva a uma reta.
([Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/))

## Que trajetória serve que carro {#which-line-suits-which-car}

O que decide é a **potência do carro em relação à sua aderência** às velocidades dessa curva - "o momento é aderência contra potência, uma questão de rácio".
([Ross Bentley: momentum cars](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Carro, nesta curva | Trajetória | Porquê |
|---|---|---|
| Acelera forte para a sua aderência ("point and shoot") | V: travar em reta e tarde, rodar num meio curto e apertado, reta e plana cedo | o tempo ganha-se com o acelerador a fundo, não com a velocidade mínima |
| Acelera fraco para a sua aderência ("momentum") | U largo, vértice ligeiramente tardio, manter a velocidade mínima alta | não consegue recuperar a velocidade que perde |
| Entre os dois | lento a entrar, rápido a sair: U de vértice tardio | o compromisso clássico |
| Curva rápida, e mais ainda com força descendente | U, perto da trajetória geométrica | a aceleração é fraca a alta velocidade; a aderência da força descendente cresce com `v²`, por isso a velocidade no meio paga duas vezes |
| Aderência muito baixa (molhado, neve) | vértice mais cedo | a velocidade perdida à entrada não se consegue recuperar à saída |
| Potência muito acima da aderência | a trajetória importa menos | é a tração, não a trajetória, que limita a saída |

"Quanto mais rápida a curva, mais perto da trajetória geométrica; quanto mais lenta, mais a altera com um vértice mais tardio."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[math on the racing line](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: grip](https://driver61.com/uni/grip/))

A transmissão altera mais a forma de percorrer a trajetória do que a própria trajetória: um carro com tração dianteira é rodado com os travões (travagem em curva) e recebe potência só à medida que a roda se desenrola, senão alarga; um carro potente de tração traseira tem de estar direito antes de acelerar a fundo, senão a traseira escapa; a tração integral pode aplicar potência ainda em curva, por isso levanta o acelerador mais cedo.
([FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

O visualizador mede o rácio potência-aderência do carro em cada curva a partir da sua própria condução - a aceleração a acelerador total, à velocidade de saída, sobre a aderência lateral na velocidade mínima - e chama-lhe "point and shoot" a 0,45 e acima, "momentum" a 0,25 e abaixo. Um carro cuja aderência a 150-250 km/h está mais de 15% acima da sua aderência a 55-110 km/h tem força descendente a funcionar.

## O método {#the-method}

Os números abaixo são o raciocínio. Os limiares que o código usa estão guardados em cada página própria, e essas páginas são a referência quando um número aqui for diferente: [Análise curva a curva](race-corner-analysis.md), [Eventos de controlo do carro](race-control-events.md), [Perfis e comparação de carros](race-car-profiles.md) e [Estatísticas do percurso](race-course-statistics.md).

### 1. Um eixo de distância {#one-distance-axis}

A volta mais rápida é a referência, a não ser que o utilizador escolha outra. O seu caminho percorrido é o eixo: as amostras de cada outra volta são projetadas sobre ele, dando a cada amostra uma distância ao longo da referência `s` e um desvio lateral com sinal `d`. A projeção procura para a frente a partir só da correspondência anterior, por isso uma volta que se cruza consigo própria nunca salta para o lado errado de uma ponte. As voltas são depois reamostradas numa mesma grelha, de 2 m em 2 m, para todos os canais. Cada volta é levada nos últimos metros à velocidade que tinha, para que o seu delta na partida seja a diferença do seu tempo de volta.

### 2. Curvas, e a parte de cada curva na volta {#corners-and-each-corners-share-of-the-lap}

Como se encontram curvas, segmentos e complexos: [Análise curva a curva](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. A conta de tempo de uma curva {#the-time-account-of-a-corner}

Líquido, dividido, velocidade de saída e a força de tração dos carros: [Análise curva a curva](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. O veredicto, e a causa {#the-verdict-and-the-cause}

Os padrões de veredicto e as causas à entrada e à saída: [Análise curva a curva](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. O carro contra o condutor {#the-car-against-the-driver}

Quando as voltas são em carros diferentes, retira-se a perda que o carro explica, por partes:

- **tração**: os carros desde a mesma velocidade na reta, como acima;
- **aderência**: da velocidade mínima mais baixa que não é explicada por um raio mais apertado, a parte `½ ln(aderência_outro / aderência_meu) / ln(v_outro / v_meu)`, quando a volta estava no limite do seu carro (90% do que mostrou a essa velocidade);
- **travões**: de `u` até `v` com desaceleração `a1` contra `a2`, terminando no mesmo ponto, custa `(1/a1 - 1/a2)(u - v)² / 2u` - só quando a volta travou mais ou menos tão forte quanto o seu carro consegue na zona, em média, e não só num pico.

O que um carro consegue fazer vem de cada volta carregada dele: aderência lateral, travagem e aceleração a acelerador total por cada intervalo de 5 m/s de velocidade (percentis 95, 95 e 90). A aderência é o que o carro **manteve durante meio segundo** - a aceleração lateral média em 0,5 s - e não o que uma só amostra tocou: uma berma, um deslize que volta ao lugar, um carro a ser apanhado, fazem disparar tudo isso por um momento, e um carro que faz isso com frequência parece mais aderente do que é. (Verificado com voltas gravadas de dois carros diferentes: a medida por amostra punha-os próximos; mantida durante meio segundo, separa-os como os seus tempos de volta.) A travagem e a tração tomam cada amostra como a mediana de si própria e dos vizinhos. O ar, o assentamento depois de uma aterragem, e cada embate (secção 6) até o carro se recuperar ficam de fora.

**Que tipo de carro é cada um** (`profile.ts`): a partir das mesmas voltas,

- **aderência mantida**: o percentil 95 dessa aceleração lateral de meio segundo;
- **tração** a acelerador total até 50 km/h, 50-120, 120-200 e acima de 200, e o máximo que mostrou;
- **travagem** de 60 a 160 km/h;
- **velocidade máxima**: onde deixou de ganhar com acelerador a fundo durante um segundo numa reta - conduzido em linha reta, não uma curva longa tomada plana, onde um carro perde velocidade com qualquer potência. Onde nenhuma reta era suficientemente longa, o que ainda puxava na sua velocidade mais alta diz quão longe estava. Nada de adivinhar para além do que as voltas mostram: um ajuste de potência sobre velocidade contra o arrasto pôs um carro de estrada 100 km/h acima da sua velocidade máxima real, porque a relação de caixa e o limitador acabam com a tração de um carro muito antes de o arrasto o fazer;
- **perder a traseira**: quantas vezes por volta deslizou para além de 10° de deriva (20° em terreno solto) com o volante virado contra a curva - apanhado com contraesterçamento - quantas dessas começaram com o acelerador, e com que parte da sua aderência começaram. Um carro conduzido um pouco de lado de propósito não perde nada; um que precisa de ser apanhado, perde. Contado da mesma forma para cada carro, para que dois carros possam ser comparados;
- **equilíbrio**, onde as voltas trazem ângulos de deriva: frente contra trás no limite.

**Carros comparados** põe os carros lado a lado - uma tabela, uma frase para cada um sobre o que é o carro em relação ao outro ("X acelera melhor, mas não consegue virar tão forte, precisa de mais distância para parar e perde a traseira com mais facilidade"), cada diferença que é clara (4% de aderência, 5% de tração ou de travagem, 4 km/h de velocidade máxima, uma traseira apanhada pelo menos uma vez por volta a mais e metade mais vezes), e como conduzir cada um. Com um só carro, diz o que esse carro é.

**Em cada curva**, quando as voltas são em carros diferentes, o veredicto diz o que dessa curva os carros decidem, e como tirar o melhor partido deste:

- **pelo meio**: na trajetória do outro carro, a aderência deste permite `v_outro · √(aderência_minha / aderência_outra)`. Se a volta levou isso, a diferença é o carro, e nenhum ponto de travagem a muda - diz-se, e a curva é atribuída ao carro e não ao condutor; se levou menos, o resto está lá para ser ganho, e diz-se quanto. Depois, onde o tempo pode ser ganho em vez disso: numa reta, ou num carro que puxa mais forte, depois do vértice - travar em reta, virar mais tarde, pôr o carro apontado para a saída cedo; senão, o raio mais largo que a estrada permite, já que um raio maior é a única forma de mais velocidade sem mais aderência;
- **uma traseira que largou** aqui, num carro que a perde com mais facilidade do que o outro: o que fazer neste carro - o acelerador dado à medida que o volante se desenrola, ou o travão libertado suavemente sem levantar a meio da curva, conforme como começam os seus deslizes;
- **a reta seguinte**: o que a tração mais forte do outro carro, desde a mesma velocidade, levou, e onde este carro ficou sem tração nela;
- **um ponto de travagem mais cedo** num carro que trava menos forte.

Uma volta que deslizou pelo meio de uma curva (para além de 10° de deriva em asfalto) estava para além da sua aderência, não lhe faltava; nunca se lhe diz que tinha aderência de sobra ali. E quando a traseira do carro largou nesta volta com menos aceleração lateral do que a curva pedia, "aderência de sobra" diz para a encontrar em pequenos passos.

### 6. Controlo do carro: bloqueios, patinagem, deslizes e sobreviragens, embates e colisões {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Cada volta é também lida pela forma como o carro foi conduzido - onde uma roda bloqueou, onde as rodas motrizes patinaram, onde a traseira escapou, onde a frente alargou - porque são os erros que o tempo sozinho não nomeia. Três coisas fazem isto aguentar-se entre jogos e superfícies.

**Onde a aderência acaba é medido a partir da própria condução do carro.** Os engenheiros definem um limiar de bloqueio por carro no escorregamento que deu a maior desaceleração (os canais MoTeC da série de travagem da OptimumG usam -0,07 para um carro), e não um valor de manual, e os valores de manual de qualquer forma não concordam: a força atinge o máximo com 5-20% de escorregamento no asfalto, dependendo do pneu e do modelo, com 6% ou com 20-60% na neve, conforme a fonte, e nenhuma fonte dá um para o cascalho. Os jogos medem o escorregamento de outra forma: o da Forza é "normalizado" de modo que, para além de 1, a aderência se perde - mas os travões de um carro podem dar o seu melhor bem abaixo ou bem acima de 1, e zonas de travagem normais podem passar de 1. Por isso, para cada carro, em cada volta carregada dele, a força que fez é agrupada contra o escorregamento que teve - desaceleração contra o rácio de escorregamento das rodas na travagem em linha reta, aceleração (como parte do que o carro faz a essa velocidade) contra o escorregamento das rodas motrizes, aderência em curva (como parte da aderência do carro a essa velocidade) contra o ângulo de deriva de cada eixo - e o limite é o escorregamento para além do melhor ponto onde a força caiu 8%. Uma curva que nunca cai nos dados - a aderência em curva e a tração da Forza Horizon - não tem limite, e o escorregamento sozinho não assinala nada aí. Com dados insuficientes, o limite é uma vez e meia o pico nominal.

**O terreno é conhecido por amostra**, quando o jogo o diz: a Forza faz vibrar os pneus no cascalho, na terra e na relva (poucas amostras num circuito de asfalto, muitas em terra e em percursos de todo-o-terreno), a Trackmania nomeia o material debaixo de cada roda, e o terreno de uma especial de ralis é encontrado como diz a secção 11. As curvas, os hábitos de derrapagem e os limiares são mantidos separados para asfalto e terreno solto.

**Cada evento é posto contra a outra volta sobre os mesmos metros.** No cascalho, na neve, num jogo de corridas arcade cheio de derrapagens, deslizar é a forma como se faz uma curva: estudos de controlo ótimo encontram soluções de "baixa deriva" no asfalto e soluções "agressivas, de alta deriva, até com contraesterçamento" fora de estrada; os dados de ralis mostram pneus "bem dentro da região não linear", e bloquear uma roda em terreno muito solto pode até parar o carro mais cedo. Por isso, um evento que a outra volta também fez - 80% dele ou mais - é a forma como a curva se faz, não um erro; e um que ela não fez só é uma falha se custou tempo: o tempo perdido desde pouco antes dele até 40 m depois. Uma falha que explica 40% ou mais da perda de uma curva passa a ser a causa dessa curva.

Limiares de deteção, o teste da outra volta, embates e colisões, e os textos de conselhos: [Eventos de controlo do carro](race-control-events.md).

### 6b. Muitas voltas: as estatísticas do percurso {#b-many-laps-the-courses-statistics}

Comparação de classes, o que conta como um erro, as estatísticas e o mapa de erros: [Estatísticas do percurso](race-course-statistics.md).

### 7. A trajetória percorrida {#the-driven-line}

Para cada volta e curva, só a partir das posições: onde começou a virar (um quinto da sua curvatura mais apertada), o seu raio mais apertado (numa janela de ±8 m), o raio médio na primeira e na segunda metade da sua mudança de rumo, e assim por diante

- **forma**: o raio mais apertado sobre o raio médio abaixo de 0,55 é um V, acima de 0,75 um U;
- **vértice**: raio de saída sobre raio de entrada acima de 1,25 é tardio, abaixo de 0,8 é cedo;
- **vértice de velocidade**: o seu ponto mais lento mais de 15 m antes do meio da sua curva é lento a entrar, rápido a sair; mais de 15 m depois, ainda a travar passado o meio.

Face à outra volta: quão por dentro ou por fora foi na entrada da curva, na parte mais apertada e onde ambas estavam planas, e onde cada uma virou. Cada conclusão fecha com a linha que serve o carro da volta nessa curva - pelo que a curva leva a seguir e pela relação potência-aderência, força descendente e tração medidas no carro - e se a volta a conduziu assim. A tabela "Curva a curva" lista a volta mais rápida por cada curva com a forma da sua trajetória, e as melhores curvas juntas.

### 8. Dois mapas {#two-maps}

- **Onde**: o percurso colorido por `dΔt/ds` face à referência, a vermelho onde se perde tempo e a verde onde se ganha.
- **Porquê**: cada perda desenhada onde está a sua causa, colorida pelo grupo da causa - travagem, entrada, saída, reta, carro - e mais larga para uma mais cara.

### 9. Repetição {#replay}

Um só relógio, três formas de o transformar no tempo de cada volta: desde a partida, alinhadas (cada volta chega a um ponto da pista ao mesmo tempo, depois segue) e lado a lado (cada volta mantida na distância da referência).

### 10. Para que lado está o mundo {#which-way-round-the-world-is}

O mundo do visualizador é direito, com Y para cima. Um jogo com um mundo esquerdo (a Forza entre eles) aparece espelhado: cada curva para a direita desenhada como curva para a esquerda, o percurso e as voltas igualmente. As próprias voltas o dizem - a direção positiva é para a direita em todos os adaptadores, e a suspensão exterior de uma curva comprime-se - por isso o separador de corrida oferece corrigi-lo, e **Câmara e cena → Inverter eixo do mundo** faz isso: X, Y ou Z desenhado ao contrário. Só muda o desenho - uma reflexão dobrada na matriz de vista; a câmara voa no mundo desenhado, e os dados, a análise e cada coordenada que as ferramentas mostram continuam a ser os próprios do jogo. A análise dá nome às curvas à esquerda ou à direita pela mesma medição.

### 11. Ralis: o deslize, o pé esquerdo, o ar {#rally-the-slide-the-left-foot-the-air}

Uma especial de ralis não é um circuito conduzido com pior aderência. Em cascalho e neve, o deslize é a forma como se faz uma curva: o carro é rodado à entrada ao deslocar o seu peso - "os travões deslocam o peso do carro para a frente ... os pneus da frente ganham aderência, os de trás perdem aderência, e o carro roda deslizando para dentro da curva", e depois volta ao acelerador quando está "alinhado na direção em que quer ir" ([DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). O pé esquerdo faz a travagem para que o acelerador e o travão possam ser combinados, o travão de mão roda o carro em curvas apertadas ([RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), e o carro sai do chão. A secção 6 já lê os deslizes contra a outra volta; estas regras tratam do resto.

- **O terreno.** O que a volta diz (`meta.surface`, o `--surface` dos gravadores de ralis), senão o nome da prova - os ralis de asfalto (Espanha, Croácia, Europa Central, Alemanha, Japão, Córsega, Ypres), os de inverno (neve), o asfalto do Monte com neve e gelo por cima (misto) - senão como o carro foi conduzido. A aderência lateral limite de um carro Rally2 é 0,7-0,9 g no cascalho e 1,3-1,4 g no asfalto ([grenzbereich, reference values](https://github.com/GitCrush/grenzbereich)), e no cascalho corre muito mais deriva (secção 6). Por isso, uma especial em que o carro puxou 10 m/s² ou mais (percentil 95, à velocidade, no terreno) com uma deriva mediana abaixo de 6 graus onde quer que curvou dentro de 70% disso era asfalto; tudo o resto, ou dados insuficientes para decidir, é solto.
- **O que o carro consegue, no terreno em que o fez.** Aderência, travagem e tração (secção 5) são medidas separadamente em asfalto e em terreno solto quando as voltas conduziram um quinto ou mais das suas amostras em cada um, e cada curva é julgada com o terreno debaixo do carro no seu ponto mais lento. As amostras no ar e durante 0,3 s depois de uma aterragem ficam fora de tudo o que mede o carro - envelopes, curvas de pneus, bloqueios e patinagem: uma aterragem sacode o carro para além do que os pneus conseguem, e as rodas que giram no ar não são patinagem. A força descendente não é julgada em terreno solto, onde os trechos rápidos e lentos de uma especial são estradas diferentes.
- **Um toque do pé esquerdo não é travagem.** Um toque no travão com o acelerador ainda a meio ou mais, durante menos de 15 m, acalma o carro ou roda-o; o sítio onde uma volta começou a travar para uma curva é a primeira travagem sob a qual o acelerador foi largado, ou a que durou mais.
- **O carro rodado à entrada.** Para cada volta e curva, o maior ângulo de deriva desde a sua travagem até 5 m depois do ponto mais lento. Em terreno solto, uma volta que teve o carro rodado 8 graus ou mais a menos do que a outra (que rodou 12 ou mais) e meteu potência mais tarde **rodou menos o carro**: o conselho é levantar ou dar um toque no travão do pé esquerdo à entrada para que a traseira venha à volta - com o ponto de travão de mão da outra volta quando usou um, ou o travão de mão numa curva mais lenta que 54 km/h - e tê-lo apontado para a saída antes do vértice. Uma que o rodou 12 graus ou mais para além da outra e ainda assim meteu potência mais tarde **rodou-o demasiado**: teve de ser endireitado antes de a potência poder descer. Qualquer uma é a causa da curva na saída, depois de uma falha de controlo do carro. O conselho de trajetória em terreno solto diz o mesmo para cada curva.
- **O ar.** Um voo 0,2 s ou mais maior do que o da outra volta que custou tempo desde 10 m antes da descolagem até 40 m depois da aterragem (ou o fim da curva) é a causa quando explica 40% ou mais da perda da curva, e a curva seguinte, atingida mais devagar, di-lo. No ar o carro não consegue rodar, travar nem acelerar. O conselho mantém o acelerador ligado na descolagem - "não levantar o acelerador durante a descolagem", que baixa o nariz - e leva a crista um pouco mais devagar ou com um toque do travão para que o carro fique baixo ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Complexos de no máximo três curvas.** Um troço sinuoso percorrido sem nunca ficar plano não é um só complexo longo: ao fim de três curvas começa um novo.

`src/race/rally.test.ts` sujeita a análise a tudo isto em especiais corridas com um modelo simples: um carro rodado menos e tarde na potência, um voo mais longo, toques do pé esquerdo, um troço sinuoso, asfalto contra cascalho.

## Dados, e o que cada fonte permite {#data-and-what-each-source-allows}

| Fonte | Taxa | Canais | Permite |
|---|---|---|---|
| Ficheiros de voltas do FH Companion | ~5 m | posição, velocidade, acelerador, travão, direção, aceleração longitudinal/lateral, mudança | tudo menos o controlo do carro, que precisa da telemetria ao lado |
| `.tele.gz` do FH Companion, ao lado de cada ficheiro de volta | os 64 Hz do jogo (um gravador que guarda cada pacote escreve cerca de 110 por segundo; as repetições são descartadas) | todo o Data Out da Forza: por roda, escorregamento, ângulo de deriva, escorregamento combinado, rotação, suspensão, vibração do piso; a velocidade no referencial do carro; velocidade de guinada | tudo, incluindo o controlo do carro |
| Forza Data Out, gravado por `heat3d_capture telemetry` | 60 Hz | tudo o que está acima, mais por roda: temperatura do pneu, escorregamento, ângulo de deriva, escorregamento combinado, curso da suspensão, velocidade da roda, faixa sonora; RPM, potência, binário, velocidade de guinada | tudo |
| Assetto Corsa, ACC, AC EVO, AC Rally (memória partilhada, `heat3d_capture telemetry --game ...`) | 60-333 Hz | um superconjunto: temperatura do núcleo do pneu e interior/meio/exterior, pressões, temperaturas dos travões, cargas das rodas, cambagem, escorregamento e ângulo; a velocidade no referencial do carro; ABS e controlo de tração a atuar (ACC, EVO, AC Rally) | tudo |
| iRacing `.ibt`, lido diretamente | 60 Hz | posição por GPS, pedais, direção, g, guinada, temperatura da carcaça por roda, deflexão do amortecedor, pressão, desgaste | tudo; controlo do carro a partir do ângulo de deriva (a sua guinada contra a direção do movimento) e da direção, sem escorregamento (não registado) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | por imagem; 100 Hz | posição, velocidade no mundo e os eixos do carro, velocidade do ponto de contacto de cada roda e suspensão, pedais, direção, relógio e comprimento da especial | tudo; escorregamento e ângulo de deriva deduzidos |
| Richard Burns Rally (NGP UDP) | por passo de física | posição, as velocidades próprias do carro, deflexão e força da mola de cada roda, pedais | tudo menos o escorregamento das rodas |
| BeamNG.drive (o mod do protocolo `heat3d`) | até 100 Hz | posição, velocidade e eixos no mundo, velocidade da superfície de cada roda, rotação, carga e contacto com o chão | tudo; escorregamento e ângulo de deriva deduzidos |
| Trackmania (o plugin do Openplanet) | por imagem | posição, velocidade frontal e lateral, pedais (travão ligado/desligado), direção, coeficiente de escorregamento e terreno solto por roda, no ar | tudo; o ângulo de deriva a partir da velocidade lateral |

Cada fonte é convertida num só formato de volta, `heat3d-lap`, cujos canais têm nomes canónicos (`speed`, `throttle`, `tireTemp[FL]` ...). O símbolo do carro e os gráficos desenham os canais que uma volta tiver.

## Fontes {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta no domínio da distância)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing lap analysis guide](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analysing racing lines](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: theoretical best from sectors](https://overcut.gg/)
- [Track Titan: how to analyse telemetry](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: braking analysis, lock-up and stability KPIs (set. 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: on the throttle (jan. 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: key performance indicators of race drivers (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Tyre-road friction models and optimal slip (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tyre-pavement friction, slip at peak on snow and ice](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: tyre friction coefficients, peak and sliding](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: longitudinal forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: lateral forces](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Vehicle stability, body-slip limits (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Rally driving at high sideslip (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Minimum-time rally manoeuvres (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC reference yaw rate (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Understeer and oversteer detection by steering against yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: steering angle, Ackermann and the understeer gradient](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: math channels (Kus, combined g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: oversteer and understeer widget](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking: locking on very loose surfaces](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: gravel rally data logging](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: how to use the brakes](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: rally driving, the basics](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: rally vehicle dynamics, reference values](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (constants)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide write-up](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: coaching flows](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: the V-line](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (velocidade de saída contra tempo mínimo)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sequence for improving lap time](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: the three types of corners](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritising corners](https://driver61.com/uni/prioritising-corners/)
- [Driver61: different corners, different techniques](https://driver61.com/uni/different-corner-technique/)
- [Driver61: the six phases of a corner](https://driver61.com/uni/corner-phases/)
- [Driver61: grip](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (excerto)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: what is a momentum car](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [The momentum over horsepower debate](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Math on the racing line, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD technique](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Racing line](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: cornering technique](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maximum cornering speed](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Racing telemetry vocabulary](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Global minimum-time trajectory planning considering curvature and distance](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: the coast factor](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Friction circle introduction](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g diagram](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Longitudinal slip](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Understeer, an overview](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out documentation](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: traction-limited acceleration](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: power-limited acceleration](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT parsing](https://github.com/teamjorge/ibt)
