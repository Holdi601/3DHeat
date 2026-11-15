---
title: "Análise curva a curva"
parent: "Análise de corrida"
nav_order: 55
lang: "pt"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Análise curva a curva

Duas voltas do mesmo percurso são comparadas curva a curva. Para cada curva, o visualizador diz quem foi mais rápido, quanto tempo valeu e porquê - travou cedo de mais, meteu potência tarde, fez uma trajetória mais larga - para saber o que treinar primeiro.

![Uma conclusão aberta em Onde melhorar, ao lado da tabela Curva a curva](../assets/img/en/race-corner-finding.webp)

Um exemplo resolvido: na curva 3, o Driver A trava 20 m antes do Driver B e perde 0,15 s a chegar lá, mas põe o acelerador mais cedo e ganha 0,15 s na saída. Líquido 0,00 s: a curva está igual, e ninguém é aconselhado a travar mais tarde.

## O que vê {#what-you-see}

### Onde melhorar {#where-to-improve}

A secção da barra lateral para a volta em foco ("Carregue pelo menos duas voltas de um percurso." até lá).

**O cabeçalho:** "<volta> <tempo> contra <referência> <tempo>" e a diferença de tempo de volta - ou, para a referência, "contra a volta mais rápida em cada curva (…)" e o total que perdeu. Ao lado, a perda dividida em *condução* e *carro / contexto*.

**A barra de repartição:** o tempo perdido por grupo de causa (travagem, entrada, saída, reta, carro, contexto), nas cores das causas, com legenda.

**As conclusões**, três listas:

1. Perdas de condução, a mais cara primeiro, no máximo **12** - ou "Em lado nenhum conduzir de outra forma faria ganhar tempo que se destaque."
2. **Mostrar o que o carro ou a situação custou (X s)** - perdas do carro e do contexto, no máximo 8 (ativo por omissão).
3. **Onde <volta> é mais rápida, ou igual de outra forma (N)** - ganhos e curvas iguais, no máximo 10 (ativo por omissão).

Cada conclusão mostra a sua posição, o título (a curva e o que aconteceu, com o custo para uma perda), a linha do veredicto, o custo (os ganhos com um sinal de menos) com uma barra, e uma etiqueta: *travagem*, *entrada*, *saída*, *reta* (perdas de condução, com "· carro X" quando o carro explica 0,02 s ou mais), *carro*, *contexto*, *mais rápida*, *igual*. **Clique numa** para alinhar os carros 40 m antes dela, enquadrá-la e repeti-la, e abrir as suas medições:

- **Travagem:** onde travou cada um (ou levantou) e a que velocidade, e quantos metros mais cedo ou mais tarde (a partir de 5 m);
- **Mais lento:** a velocidade mínima de cada volta e onde;
- **Acelerador a fundo:** onde cada um esteve sem acelerar, e quanto mais cedo ou mais tarde;
- **Trajetória:** diferença no ponto de entrada, raios mais apertados, quão por dentro ou por fora, e a forma da trajetória e o vértice de cada volta;
- **Reta até à curva seguinte:** o seu comprimento, as duas velocidades onde ambos estavam sem acelerar, o que perdeu ou ganhou e de quê - a velocidade de partida, a tração mais forte do outro, um levantar do acelerador, velocidade perdida, como foi conduzida (partes a partir de 0,02 s);
- **O carro:** quanto da perda é o carro, e de quê (tração, aderência, travões; quando 0,02 s ou mais);

depois a dica, **Os carros:** (em carros diferentes, veja [Perfis dos carros](race-car-profiles.md#what-the-cars-decide-in-a-corner)), e o conselho de trajetória.

### Curva a curva {#corner-by-corner}

Uma tabela (com duas ou mais voltas), uma linha por segmento, da classe da volta em foco quando há várias classes:

| Coluna | Mostra |
|---|---|
| Curva | `T3`, `T11-T12` |
| Mais rápida | a volta mais rápida nessa curva (o seu próprio tempo do início ao fim do segmento) |
| por | a sua vantagem sobre a segunda mais rápida, em s |
| trajetória | a forma e o vértice da volta mais rápida ("V · tardio", "U/V · meio"); ao passar o rato, os seus raios mais apertados, de entrada e de saída; "nos dois sentidos" para um complexo misto |
| (a volta em foco) | quanto ficou atrás da mais rápida, ou ✓ quando foi a mais rápida |

Clicar numa linha abre aí a conclusão da volta em foco (ou alinha os carros 40 m antes do segmento). Por baixo da tabela, quando cada curva tem um tempo: "A mais rápida em todas as curvas, juntas: <tempo> (± sobre a referência / sobre a melhor da classe X)" - os melhores segmentos mais a passagem mais rápida até à primeira curva quando esta é um troço próprio.

## Como se calcula {#how-it-is-worked-out}

A regra que governa: **uma curva é avaliada por inteiro**, desde a zona de travagem para ela até à zona de travagem para a seguinte. Uma volta que trava mais cedo para virar o carro e pô-lo mais cedo a acelerar é creditada com a saída que comprou, não é aconselhada a travar mais tarde.

## Um eixo de distância {#one-distance-axis}

As voltas são comparadas pela distância, não pelo tempo - um segundo atrás, duas voltas estão em curvas diferentes. Nem pelo conta-quilómetros de cada volta (uma trajetória mais apertada percorre menos metros). A trajetória percorrida pela volta de **referência** é o eixo:

- As amostras de cada outra volta são **projetadas** sobre a trajetória de referência: cada amostra recebe `s`, quão adiante na referência está, e `d`, quão à esquerda (positivo) ou à direita. A procura avança a partir da correspondência anterior (de 8 segmentos de trajetória atrás a 40 à frente), por isso uma volta que se cruza por cima ou por baixo de si própria nunca salta para o outro cruzamento. A primeira amostra procura-se no primeiro quarto da trajetória (num circuito, partida e chegada coincidem); quando nada está a menos de 30 m, toma-se o ponto mais próximo em qualquer sítio que não esteja atrás da última correspondência (depois de um pião ou de uma saída de pista). `s` nunca diminui: uma amostra que projeta atrás da anterior é mantida.
- Cada canal é **reamostrado** numa só grelha, **de 2 em 2 m**, linearmente; os canais por degraus (mudança, bandeiras) pela amostra mais próxima. Fora do intervalo próprio de uma volta, os valores ficam vazios.
- As primeiras e últimas amostras de uma volta projetam um pouco para dentro dos extremos da referência; por isso cada volta é **levada até 15 m** para além dos seus extremos, à velocidade que tinha (o tempo cresce pela distância a dividir pela velocidade, o resto mantém-se) - assim o seu delta na partida é a sua diferença de tempo de volta.
- `delta` = o tempo da volta em cada ponto da grelha menos o da referência: a diferença. `lateral` = `d` na grelha.

O tempo que uma volta demorou a mais do que outra entre dois pontos da grelha é a diferença dos seus deltas: `rel(s)`. Tudo o que está abaixo assenta nisto.

## Curvas {#corners}

Encontradas na **referência** (`findCorners`), com a sua velocidade suavizada em ±6 m e a sua curvatura (mudança de rumo em ±5 amostras, suavizada em ±10 m):

1. **Mínimos de velocidade com proeminência.** Um ponto que é o mais baixo dentro de ±40 m, cuja descida desde a velocidade mais alta de cada lado (antes de um mínimo mais baixo) é pelo menos `max(2,5 m/s, 6% da velocidade)`.
2. **Dobras.** Um pico local de curvatura mais apertado que um raio de **300 m**, sem mínimo de velocidade dentro de 80 m: uma dobra feita a acelerador a fundo continua a ser uma curva para conduzir.
3. **Fases.** A partir de cada vértice, para trás enquanto a referência trava (> 0,1) ou está sem acelerador a fundo (< 0,95): a entrada; para a frente enquanto está sem acelerador a fundo: a saída. Uma dobra feita a fundo recebe ±30 m. As curvas sobrepostas mantêm-se separadas mas ficam encaixadas na volta.
4. Numeradas T1, T2 … pela ordem da volta; **esquerda ou direita** pelo sinal da curvatura e por o mundo estar espelhado ou não (desconhecido conta como espelhado).

**A janela da curva** (onde a referência vira): para fora desde o ponto mais apertado a menos de ±40 m do vértice enquanto a curvatura se mantém acima de um sexto do seu pico, mais 10 m de cada lado. O lado dá o sinal de "por dentro".

## Segmentos: da zona de travagem à zona de travagem {#segments-braking-zone-to-braking-zone}

Cada curva é dona da estrada a meio caminho dos vértices de cada lado. Nela:

- **O ponto mais lento de cada volta** é uma verdadeira descida da sua velocidade - nada mais lento a menos de 6 m (3 pontos da grelha) de cada lado, olhando para além dos extremos do troço, para que a saída da curva anterior, ainda a acelerar para dentro dela, nunca seja confundida com ele - procurado desde 15 m antes da janela da curva até 10 m depois. Uma volta que nunca abrandou ali é colocada no vértice.
- **Onde uma volta começou a abrandar para ela** (`entryOf`): para trás desde o seu ponto mais lento, pela travagem ou pelo levantar, sobre pequenos toques de acelerador a fundo, até ter o pé no fundo (acelerador ≥ 0,95, travão ≤ 0,1) durante **10 m**; um acelerador retomado nos últimos **30 m** antes do ponto mais lento ainda pertence à curva; a fundo em todo o caminho, o próprio ponto mais lento. Uma volta sem canal de acelerador, ou que nunca teve o pé no fundo desde a curva anterior, começa no seu ponto mais rápido pelo meio.
- **O segmento começa** na primeira de todas as voltas a começar a abrandar para ela (4 m antes), e vai até ao início da seguinte, para que a travagem de cada volta fique dentro dele e os segmentos encaixem na volta.

**Complexos.** Curvas seguidas entre as quais a referência nunca conduz a fundo - menos de **40 m** de acelerador a fundo - são um só segmento, "T11-T12", conduzido como um só; um complexo tem no máximo **três** curvas (um troço sinuoso conduzido sem nunca ficar plano começa um novo). Um complexo que vira para os dois lados é *misto*: não se mede para ele uma só forma de trajetória.

**Num circuito** (a referência acaba a menos de 50 m de onde começou), a reta do último segmento segue em frente pela linha de chegada até ao primeiro ponto de travagem: a passagem de uma volta lançada pela linha conta com a última curva. Uma volta que começou parada ou numa partida de corrida (veja [A partida](#the-start)) mantém essa passagem à parte.

### O que uma curva leva a seguir {#what-a-corner-leads-onto}

Medido na referência: metros a acelerador a fundo depois da curva (desde o seu acelerador a fundo até ao fim do segmento, mais a passagem pela linha) e antes dela (o "depois" do segmento anterior, ou desde o início).

| Tipo | Regra |
|---|---|
| **entre duas retas** (`both`) | 200 m ou mais antes **e** 120 m ou mais depois |
| **para uma reta** | 200 m ou mais depois, ou 120 m ou mais depois e pelo menos tanto como antes |
| **depois de uma reta** | 200 m ou mais antes |
| **ligação** | tudo o resto |

## O que cada volta fez numa curva {#what-each-lap-did-in-a-corner}

`cornerMetrics`, por volta e segmento, na grelha (passo de 2 m). Pedais: a travagem conta acima de 0,1; o acelerador a fundo é 0,95 e acima.

| Medida | Regra |
|---|---|
| **ponto de travagem** | o primeiro travão sob o qual o acelerador foi largado (abaixo de 0,5), ou que durou **15 m** - um toque do pé esquerdo com a potência ligada não é onde a travagem começou; só com toques, o primeiro toque |
| **levantou** | sem travagem, o primeiro ponto em que o acelerador desceu abaixo de 0,8 |
| (sem pedais) | o ponto onde a volta começou a abrandar (acima) |
| **libertação do travão** | o último travão até 30 m depois do ponto mais lento |
| **velocidade no ponto de travagem**, **metros de travagem** | até ao ponto mais lento |
| **travagem máxima**, **desaceleração máxima** | sobre a zona de travagem (acelerações acima de 45 m/s² ignoradas) |
| **travagem em curva** | metros com travão > 0,05 e \|direção\| > 0,1 |
| **escorregamento com bloqueio** | o rácio de escorregamento da roda mais negativo na zona (quando a volta tem escorregamento) |
| **ponto mais lento**, **velocidade mínima** | como acima |
| **acelerador ligado** | depois da libertação (ou do ponto mais lento), o primeiro acelerador > 0,15 sem travão |
| **acelerador a fundo** | o primeiro ponto depois disso mantido em ≥ 0,95 durante 10 m |
| **roda livre** | metros desde a libertação até ao acelerador ligado com travão e acelerador ambos abaixo de 0,05 |
| **quebras do acelerador** | vezes em que o acelerador caiu mais de 0,25 abaixo do seu máximo corrente entre o acelerador ligado e o acelerador a fundo |
| **aceleração lateral máxima** | a maior aceleração lateral desde 20 m antes da libertação até ao mais tardio entre o acelerador a fundo e 20 m depois do ponto mais lento |
| **mudança no vértice** | no ponto mais lento |
| **escorregamento na patinagem** | o maior rácio de escorregamento da roda motriz entre o acelerador ligado e o acelerador a fundo |
| **equilíbrio** | ângulo de deriva da frente menos o de trás através do meio (+ subviragem) |
| **reta com acelerador a fundo** | a parte do troço depois do acelerador a fundo (e a passagem pela linha) em ≥ 0,95; o maior levantar nela |
| **velocidade perdida** | a maior velocidade perdida desde um ponto alto com acelerador ≥ 0,9, sem travão, em terra |
| **deriva à entrada** | o maior ângulo de deriva desde o ponto de travagem até 5 m depois do ponto mais lento, em terra |
| **travão de mão** | onde foi acionado (> 0,2), até 10 m depois do ponto mais lento |
| **ar** | segundos no ar sobre o segmento, e o seu voo mais longo |

## Com quem cada volta é comparada {#who-each-lap-is-compared-with}

- Uma volta é comparada com a **volta completa mais rápida da sua própria classe de desempenho** (a referência, na classe da referência).
- Essa volta da melhor da classe (e a referência) é comparada, segmento a segmento, com **a outra volta da sua classe que foi mais rápida** nessa curva - ou com todas as voltas, quando está sozinha na sua classe.

O mapa de tempo, as diferenças na lista de voltas, os eventos de controlo do carro e a tabela de curvas seguem a mesma comparação.

## A conta de tempo de uma curva {#the-time-account-of-a-corner}

`compareCorner`, para uma volta contra a outra num segmento:

- **líquido** = `rel(fim) - rel(início)` (mais a passagem pela linha numa volta lançada): o veredicto. Mais perto de **0,03 s** é **igual**.
- **A divisão** - onde dentro da curva virou a vantagem: no troço desde o primeiro ponto de travagem ou ponto mais lento de qualquer das voltas até ao mais tardio entre os seus pontos de acelerador a fundo e mais lentos, a maior oscilação que a volta então devolveu ou recuperou, quando essa oscilação passa **0,04 s**; senão, o mais tardio dos dois pontos mais lentos.
- **Até ao vértice** = `rel(divisão) - rel(início)`; **depois dele** = o líquido menos isso. Quando ambos estão em pelo menos 0,04 s e com sinais opostos, a volta **trocou** uma pela outra.
- **Depois dele** divide-se de novo onde ambas as voltas estão a acelerador a fundo: a **saída** (da divisão até ao acelerador a fundo mais tardio) e a **reta** (dali até ao fim).
- **A reta** divide-se em três:
  - *velocidade de saída* (`byExit`) - medida, não modelada: o carro mais lento passa pela velocidade de partida do carro mais rápido um pouco adiante na reta, e a partir daí o seu próprio traço é o que faria a partir dessa velocidade, com a sua própria relação de caixa, arrasto e inclinação nele. Recuado até esse ponto (e prolongado à sua velocidade final pelos metros que ganha) é o seu tempo desde a partida mais rápida; a diferença é o custo da velocidade de saída. Quando o carro mais lento nunca chega a essa velocidade (ou só nas últimas 2 amostras), a sua própria aceleração ao longo do troço é reposta como potência (`a·v` mantido), nunca mais forte do que o seu envelope mostra a essa velocidade (o dobro da aceleração medida sem envelope).
  - *a tração dos carros* (`byPower`) - só em carros diferentes: os dois carros desde a mesma velocidade sobre os mesmos metros, a fundo, integrando a aceleração a acelerador total que cada um mostrou a cada velocidade.
  - *como foi conduzida* (`driven`) - o resto: um levantar, velocidade perdida com acelerador a fundo.

  A velocidade de saída nunca explica mais do que o custo da reta (e nunca com o sinal oposto), a não ser que um levantar ou velocidade perdida tenha levado alguma de volta. Uma volta **levantou** na reta quando a sua parte a acelerador a fundo está abaixo de 0,9 e abaixo da parte da outra menos 0,05. A velocidade perdida conta quando as duas diferem em mais de 1 m/s. Uma discordância abaixo de 0,02 s no sinal fica a zero.

Cada líquido de segmento soma a diferença de tempo de volta, e cada até-ao-vértice e depois-do-vértice de uma curva somam o seu líquido (os testes verificam ambos).

### A parte do carro {#the-cars-share}

Só quando as voltas são em **carros diferentes** e a volta perdeu tempo (`carShare`):

- **tração**: a tração dos carros na reta (acima), até à perda;
- **aderência**: quando a volta estava no limite do seu carro (aceleração lateral no meio de pelo menos **90%** do que o seu carro aguenta a essa velocidade) e o outro carro aguenta mais de **5%** a mais: da velocidade mínima mais baixa que não é explicada por um raio mais apertado, a parte `½ ln(aderência_outro / aderência_meu) / ln(v_outro / v_meu)` da perda restante;
- **travões**: quando a volta travou (não levantou), o outro carro trava **5%** mais forte, e a desaceleração *média* da volta na zona foi pelo menos **80%** do que o seu carro consegue: de `u` até `v` com `a1` contra `a2`, terminando no mesmo ponto, `(1/a1 - 1/a2)(u - v)² / 2u`, até ao que sobra.

O custo do carro é a soma, no máximo a perda.

## O veredicto e a conclusão {#the-verdict-and-the-finding}

`cornerFinding` escreve no máximo uma conclusão por volta e curva, tentando por esta ordem:

| Caso | Conclusão | Resultado |
|---|---|---|
| líquido dentro de ±0,03 s, uma troca, lado menor ≥ **0,1 s** | **igual, duas formas de passar** - quem foi lento à entrada e rápido à saída, e quem foi ao contrário; com uma reta depois (para uma reta, ou entre duas), a forma lento-à-entrada-rápido-à-saída é a que se deve construir: manter o seu acelerador cedo, recuperar a entrada travando mais forte, não mais tarde | igual |
| líquido dentro de ±0,03 s de outra forma | nada é dito | - |
| ganhou, uma troca, perdeu até ao vértice | **lento à entrada, rápido à saída compensou**: mantê-la, aqui a saída vale mais | ganho |
| ganhou, uma troca, ganhou até ao vértice | **mais rápida à entrada**: a entrada está certa, um acelerador a fundo mais cedo manteria mais | ganho |
| ganhou, e a outra volta tem aqui uma perda | **mais rápida - por causa do que a outra fez**, a sua causa e a sua dica disseram "Para a outra volta: …" | ganho |
| ganhou de outra forma | **mais rápida à entrada / saída**, conforme a metade que ganhou mais (travando mais tarde, mais velocidade pelo meio; ou plana mais cedo, tração mais forte) | ganho |
| perdeu, e um **embate ou colisão** custou pelo menos `max(0,05 s, 40% da perda)` | o impacto é a história da curva, antes dos carros | perda |
| perdeu, e a **parte do carro** é 60% ou mais | **o carro**: a sua tração na reta, a sua aderência pelo meio, ou os seus travões - a maior parte; com a parte do condutor (≥ 0,03 s) dita como "Os outros X s: …" | perda |
| perdeu, e uma **falha de controlo do carro** não partilhada custou pelo menos `max(0,05 s, 40%)` | essa falha (ver abaixo), com a forma como o tempo se moveu à volta dela | perda |
| perdeu, e um **voo mais longo** custou pelo menos `max(0,05 s, 40%)` | o voo | perda |
| perdeu, uma troca, ganhou até ao vértice | **entrou depressa de mais, saiu devagar**: a causa da saída; abdicar de alguma entrada para rodar e ficar plano mais cedo, com os pontos de travão e de acelerador a fundo da outra volta. A sua raiz (`cause`, que as [estatísticas](race-course-statistics.md) contam): travar mais tarde, quando travou mais do que alguns metros mais tarde que a outra; senão, a causa da saída | perda |
| perdeu, uma troca, perdeu até ao vértice | **deu mais à entrada do que a saída recuperou**: a causa da entrada, que é também a sua raiz (`cause`); manter a saída, perder menos à entrada | perda |
| perdeu, levantou na reta, e a parte conduzida passa metade da perda | **não a fundo na reta**: a parte dela a acelerador a fundo contra a da outra, onde e quanto tempo foi o levantar | perda |
| perdeu, a tração dos carros passa 60% da perda e a reta metade | **a tração do carro na reta** (com a tração dos dois carros a 160 km/h) | perda |
| perdeu de outra forma | a causa da metade que perdeu mais (até ao vértice ≥ depois dele: a da entrada; senão a da saída). Mais lento à saída só por ser mais lento pelo meio (mais de 1 m/s): a causa do meio em vez disso | perda |

Uma conclusão sobre uma perda pode também terminar com **Também:** - velocidade perdida com acelerador a fundo, ou um levantar na reta - quando a parte conduzida da reta custou mais de 0,04 s e isso ainda não era a causa.

As conclusões são ordenadas: primeiro as perdas, a mais cara primeiro; depois os ganhos e as curvas iguais.

### Causas à entrada {#causes-on-the-way-in}

`entryCause`, a primeira que se aplica (as diferenças de velocidade mínima estão em m/s; "5 m" é o limiar para um ponto mais cedo ou mais tarde contar):

| # | Causa (erro) | Regra |
|---|---|---|
| 1 | um embate ou colisão à entrada | um impacto não partilhado que começa até 10 m depois do ponto mais lento |
| 2 | **quase parado** (incidente) | velocidade mais baixa abaixo de **60%** do que a aderência deste carro permite onde a outra passou (`v_outro · √(aderência_minha / aderência_outra)` quando o outro carro tem mais aderência, senão a velocidade do outro), a outra volta acima de 8 m/s - um pião, contacto ou uma curva falhada |
| 3 | uma falha de controlo do carro à entrada | um bloqueio, empurrão, pião ou deslize não partilhado e sem acelerador, que começa até 10 m depois do ponto mais lento, custou ≥ 0,02 s |
| 4 | um voo mais longo antes do ponto mais lento | ver [ralis](#rally-rotation-and-flights) |
| 5 | **levantou** quando a outra ficou a fundo ou levantou 5 m ou mais depois | esta volta só levantou |
| 6 | **travou onde a outra só levantou** ou ficou a fundo | e foi mais lenta pelo meio em mais de 0,5 m/s |
| 7 | **travou suavemente** | travou (não levantou), teve margem para travar mais forte - com dados de pneus, o seu escorregamento com bloqueio abaixo de **60%** do escorregamento onde os travões deste carro dão o seu melhor; sem eles, uma desaceleração máxima abaixo de **85%** do que mostra a essa velocidade - o pedal abaixo de 0,95, e a desaceleração máxima da outra volta mais de **15%** superior |
| 8 | **travou cedo** - ou **os travões do carro** | travou mais de 5 m antes da outra. Noutro carro cujos travões são mais de 5% mais fortes, e com não mais de 10 m de folga face à distância que este carro precisa com a sua própria desaceleração: os travões do carro. Senão, travou cedo, com "Travar mais tarde - cerca de N m" (noutro carro, os metros para além do que precisa) |
| 9 | **roda livre** | mais de 10 m sem nenhum pedal, e 5 m mais do que a outra |
| 10 | **mais lento pelo meio** | mais de 0,5 m/s mais lento no ponto mais lento; dividido por `v² = a·R` (abaixo) |
| 11 | **chegou mais devagar** | mais de 1 m/s mais lento no ponto de travagem, sem ter travado cedo: decidido antes - pela curva anterior e a tração do carro, ou por um voo de 0,2 s mais longo na curva anterior. É do carro quando os carros diferem |
| 12 | mais lento até ao vértice | de outra forma: libertar o travão de forma mais suave e deixar entrar mais velocidade no meio |

**Mais lento pelo meio** (`middleSplit`): o raio de cada volta no seu ponto mais lento é medido a partir do seu próprio caminho (±8 m), a sua aceleração lateral como `v²/R`, e

`ln(v_outro / v_meu) = ½ ln(a_outro / a_meu) + ½ ln(R_outro / R_meu)`.

- O raio explica **metade ou mais**: **trajetória demasiado apertada** - "use mais da estrada", com os dois raios e a parte.
- No limite do carro (a derrapar para além de 10° de deriva em asfalto / 20° em solo solto, ou aceleração lateral de pelo menos 90% do que aguenta a essa velocidade) e o outro carro tem mais de 5% a mais de aderência: **a aderência do carro**; proteger a saída em vez disso.
- A derrapar por ela (deriva para além de 10° / 20°) e a outra volta não (a sua deriva de entrada pelo menos 4° menor): **de lado** - para além da sua aderência, não lhe faltava; chega um pouco mais devagar. Dito como do carro quando este carro apanha a traseira pelo menos uma vez por volta a mais do que a outra.
- Noutro carro que aguenta abaixo de **96%** da aderência do outro, e a volta levada dentro de 1 m/s de `v_outro · √(aderência_minha / aderência_outra)`: **a aderência do carro** - "travar mais tarde não vai fechar isso".
- De outra forma, **aderência de sobra**: aceleração lateral contra a do outro num raio parecido, e o que este carro aguenta; levar mais velocidade até ao vértice. Quando a traseira deste carro larga antes de a sua aderência estar gasta (os seus deslizes começam abaixo de 85% da sua aderência, e a volta esteve nos 80% disso), encontrar o resto em pequenos passos.

### Causas à saída {#causes-on-the-way-out}

`exitCause`, a primeira que se aplica:

| # | Causa (erro) | Regra |
|---|---|---|
| 1 | uma falha de controlo do carro à saída | patinagem, pião, deslize ou impacto não partilhado que acaba a 10 m antes do ponto mais lento ou depois dele |
| 2 | **velocidade perdida** | mais de 1 m/s de velocidade perdida a acelerador a fundo do que a outra; acima de **7 m/s (25 km/h)** "parece mais um contacto ou um pião do que um deslize" |
| 3 | **rodou mal o carro** (terreno solto) | ver [ralis](#rally-rotation-and-flights) |
| 4 | **potência mais tarde** | acelerador ligado mais de 5 m mais tarde, contado também desde o ponto mais lento de cada volta (uma volta cujo ponto mais lento é mais tardio não é culpada de um acelerador mais tardio) |
| 5 | **hesitou no acelerador** | mais quebras do acelerador do que a outra |
| 6 | **saiu largo e esperou** | mais de 1,5 m para fora da outra onde ambas estavam planas, e acelerador a fundo mais de 5 m mais tarde a partir do seu próprio ponto mais lento |
| 7 | **acelerador a fundo mais tarde** | acelerador a fundo mais de 5 m mais tarde, também desde o seu próprio ponto mais lento; com a aceleração do carro ali |
| 8 | **a condução do carro** | noutro carro que puxa abaixo de 95% do outro a essa velocidade, e a tração explicou parte da reta |
| 9 | **mais lento à saída da curva** | de outra forma: um vértice mais tardio, por isso o carro fica em reta mais cedo |

Quando as duas voltas estavam em mudanças diferentes no ponto mais lento, a dica acaba em "Mudança N no vértice; a outra usou M."

### Falhas de controlo do carro e impactos {#car-control-faults-and-impacts}

Uma falha dos [Eventos de controlo do carro](race-control-events.md) como causa: um bloqueio é uma causa de *travagem*, uma patinagem ou um deslize com acelerador uma causa de *saída*, o resto *entrada*; um impacto depois do ponto mais lento é *saída*, antes dele *entrada*. A dica é a do próprio evento, depois "Custou cerca de X s até 40 m depois dele" (ou "até o carro recuperar a sua velocidade" para um impacto). Um bloqueio com um ponto de travagem mais de 5 m mais cedo do que o da outra acrescenta que a volta também travou cedo - com as rodas a girar não teria precisado disso.

### Ralis: rotação e voos {#rally-rotation-and-flights}

Em **terreno solto**, com ângulos de deriva nas duas voltas, e esta volta com a potência (ou a fundo) mais de 5 m mais tarde:

- **Rodou menos o carro**: a outra teve o carro rodado **12°** ou mais até ao seu ponto mais lento e pelo menos **8°** a mais do que esta volta. Dica: um levantar ou um toque no travão do pé esquerdo ao entrar, com o ponto de travão de mão da outra volta quando só ela o usou, ou o travão de mão numa curva mais lenta que 15 m/s (54 km/h).
- **Rodou-o demasiado**: esta volta o teve rodado 12° ou mais e pelo menos **12°** a mais do que a outra: teve de ser endireitado antes de a potência poder descer.

**Um voo mais longo**: no ar 0,2 s ou mais mais do que a outra, custando pelo menos 0,03 s desde 10 m antes da descolagem até 40 m depois da aterragem (ou o fim do segmento). Antes do ponto mais lento é uma causa de entrada; passa a ser a história da curva quando explica 40% ou mais. A dica: manter o acelerador ligado na descolagem, levar a crista um pouco mais devagar ou com um toque do travão.

### O início {#the-start}

Antes da primeira curva, numa corrida de velocidade ou quando qualquer das voltas começou parada (abaixo de 5 m/s onde ambas são as primeiras no eixo) ou numa partida de corrida (abaixo de 60% da velocidade da outra), a passagem até ao primeiro ponto de travagem é uma conclusão própria (curva 0) quando difere mais de 0,03 s: *A largada*, *O início da corrida* ou *Até à primeira curva*. Uma perda aí é atribuída à situação (*contexto*) quando uma volta começou numa partida de corrida e a outra em velocidade, ao carro quando as voltas são em carros diferentes, e ao condutor de outra forma. Dicas: noutro carro a partir de parado, "sobretudo o carro"; uma partida parada no mesmo carro, arrancar com menos patinagem e mudar no topo da zona de potência; uma partida de corrida, comparar com outra primeira volta; uma partida lançada, uma melhor saída da última curva é levada até à linha.

## A trajetória percorrida {#the-driven-line}

`lineMetrics`, por volta e segmento (não para complexos mistos), só a partir das posições (suavizadas ±2 amostras) sobre a janela da curva:

| Medida | Regra |
|---|---|
| curvatura | mudança de rumo em ±8 m do próprio caminho da volta |
| **raio mais apertado** | 1 / o pico de curvatura |
| **entrada na curva** / **saída da curva** | onde a curvatura passa primeiro / pela última vez uma quinta parte do seu pico |
| **meio** | onde a volta tinha virado metade da sua mudança de rumo |
| raio à entrada / à saída | metros percorridos durante metade da mudança de rumo, antes / depois do meio |
| **forma** | raio mais apertado sobre o raio médio enquanto vira: abaixo de **0,55** um **V**, acima de **0,75** um **U**, entre eles "U/V" |
| **vértice** | raio de saída sobre raio de entrada: acima de **1,25** tardio, abaixo de **0,8** cedo, senão meio |
| **vértice de velocidade** | o ponto mais lento mais de **15 m** antes do meio: lento à entrada, rápido à saída; mais de 15 m depois: ainda a abrandar passado o meio |

Face à outra volta: quão por dentro (+) ou por fora ela foi na entrada da curva, pela parte mais apertada e onde ambas estavam planas (dito a partir de 1 m); onde cada uma entrou na curva (dito a partir de 8 m).

### Que trajetória serve este carro aqui {#which-line-suits-this-car-here}

`lineFor`, a partir do que a curva leva a seguir e do carácter do carro nesta curva:

- **potência-aderência** = a aceleração do carro a acelerador total, à velocidade de saída, sobre a sua aderência à velocidade mínima (a partir do seu envelope). **Point and shoot** a **0,45** e acima; **momentum** a **0,25** e abaixo.
- **força descendente**: aderência a 151-252 km/h sobre aderência a 54-108 km/h de **1,15** ou mais, para uma curva feita a **144 km/h** (40 m/s) ou mais depressa - então é uma curva de momentum seja qual for a potência. Não se julga em terreno solto.

| Tipo de curva | Carro | Trajetória |
|---|---|---|
| depois de uma reta | point and shoot / outro | V / U, vértice no meio: "a zona de travagem é o prémio" |
| entre duas retas | momentum / outro | U / V, vértice tardio |
| ligação | momentum / outro | U / V, vértice no meio: "conduzi-la para a saída da seguinte" |
| para uma reta | momentum (ou uma curva rápida de força descendente) | U redondo e largo, vértice ligeiramente tardio |
| para uma reta | point and shoot | V: travar em reta, virar tarde, rodar num meio curto e apertado, reta cedo |
| para uma reta | intermédio | U com vértice tardio: lento a entrar, rápido a sair |

Onde a saída importa (para uma reta, entre duas) a transmissão acrescenta uma frase: **FWD** - rodá-lo com os travões, dar potência só à medida que a roda se desenrola; **RWD** com uma potência-aderência de 0,35 ou mais - endireitá-lo antes do acelerador a fundo; **AWD** - pode aplicar potência mesmo a rodar. Em terreno solto, cada trajetória acrescenta: rodar o carro à entrada.

A frase diz depois o que a volta conduziu, e se encaixa: *um ponto mais lento tardio prende a saída* ou *um vértice cedo prende a saída* quando se queria um vértice tardio e a volta nem fez vértice tardio nem foi a mais lenta cedo; *mais redonda do que este carro quer* quando se queria um V; *mais quadrada do que este carro quer* quando se queria um U; de outra forma, *isso encaixa*.

## Para programadores {#for-developers}

Código: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
O raciocínio e as suas fontes: [o método](race-analytics.md).
