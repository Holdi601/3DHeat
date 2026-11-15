---
title: "Perfis dos carros e comparação"
parent: "Análise de corrida"
nav_order: 56
lang: "pt"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---

# Perfis dos carros e comparação

Um carro só consegue travar, virar e acelerar até certo ponto. O visualizador mede até onde a partir das suas próprias voltas, por isso nunca lhe diz para fazer algo que o carro não consegue fazer. Isto também explica quanto de um segundo perdido foi culpa do carro e não sua.

![Carros comparados: dois carros lado a lado com a sua aderência, travagem e força](../assets/img/en/race-cars-compared.webp)

A análise só diz a uma volta para travar com mais força, levar mais velocidade ou acelerar mais cedo onde o seu carro já mostrou que consegue, e tira de uma perda o que os próprios carros explicam. Por isso os limites de cada carro (a sua *envolvente*, abaixo) e o seu carácter (o seu *perfil*) são medidos a partir de cada volta carregada dele. Esta página trata da envolvente, do perfil, da secção **Carros comparados**, e do que os carros decidem em cada curva.

**Um carro** = voltas com o mesmo número de carro (ou nome, sem número) e o mesmo índice de desempenho: uma afinação diferente é outro carro.

## A envolvente: o que o carro consegue fazer a cada velocidade {#the-envelope-what-the-car-can-do-at-each-speed}

Por carro, sobre todas as suas voltas carregadas, em **faixas de velocidade de 5 m/s** (24 faixas, até 120 m/s). As amostras no ar, a estabilização de 0,3 s depois de uma aterragem, e de 0,1 s antes de cada toque até 1 s depois dele ficam de fora, e as acelerações de 80 m/s² ou mais são ignoradas (acima do que qualquer carro com apoio aerodinâmico aguenta).

| Envolvente | Amostras | Valor por faixa | Precisa de |
|---|---|---|---|
| **aderência lateral** | a aceleração lateral **mantida durante meio segundo** (a média do seu valor absoluto numa janela centrada de 0,5 s), só onde o carro estava em curva: pelo menos um terço do percentil 99 de toda ela | percentil 95 | 6 amostras |
| **travagem** | travão > 0,3; a aceleração longitudinal como a mediana de cada amostra e dos seus dois vizinhos | percentil 95 da desaceleração | 4 amostras |
| **força a fundo** | acelerador > 0,95, travão abaixo de 0,05; a mesma mediana de três | percentil 90 | 4 amostras |

Porque mantida durante meio segundo: um lancil, um deslizamento que volta a fechar, um carro apanhado - todos fazem a aceleração lateral disparar por um momento, e um carro que faz isso com frequência parecia ter mais aderência do que tem. Porque mediana de três: com um espaçamento de cinco metros uma amostra é muito espaço, e um pico de uma só amostra é um lancil, uma lomba ou um muro.

Ler a envolvente numa velocidade interpola entre os centros das faixas, e usa a faixa mais próxima com dados quando uma faixa está vazia.

**Sobre dois tipos de piso.** Quando as voltas de um carro foram conduzidas em um quinto ou mais das suas amostras em cada um dos pisos, asfalto e solto, guarda-se uma envolvente separada para cada um, e cada curva é julgada com o piso debaixo do carro no seu ponto mais lento.

**Cruzamento.** A velocidade a partir da qual a força a fundo cai como `1/v` (limitada pela potência) em vez de se manter plana (limitada pela tração): a primeira faixa cujo `a·v` fica a 15% do maior `a·v` visto.

## O perfil: que tipo de carro é {#the-profile-what-kind-of-car-it-is}

`profile`, a partir das mesmas voltas (amostras no chão, não atingidas, a mais de 8 m/s):

| Medida | Como |
|---|---|
| **aderência mantida** (m/s²) | percentil 95 da aceleração lateral mantida de meio segundo |
| **força** até 50 km/h, 50-120, 120-200, acima de 200 (m/s²) | a média da força a fundo da envolvente em 3-14, 14-33, 33-56 e 56-90 m/s, às velocidades que o carro atingiu (até à sua mais rápida + 2 m/s), a partir de pelo menos três passos de 1 m/s; e a maior que mostrou, e onde |
| **travagem** (m/s²) | a travagem da envolvente em média entre 60 e 160 km/h (16,7-44,4 m/s), a faixa que a comparação nomeia |
| **mais rápida** | a velocidade mais alta que atingiu |
| **limite máximo em** | onde deixou de ganhar com o acelerador a fundo numa reta (abaixo) |
| **ainda a puxar na mais rápida** | a força da envolvente na sua velocidade máxima: quanto ainda tinha para andar |
| **traseira apanhada, por volta** | vezes numa volta em que derrapou e teve de ser apanhado (abaixo) |
| **parte com o acelerador** | destes, a parte que começou com acelerador > 0,5 e sem travão |
| **larga em** | a mediana da aceleração lateral mantida 0,15 s antes de cada deslize começar, como parte da aderência |
| **acima de 10° de derrapagem, em curva forte** | das amostras em curva a 60% ou mais da sua aderência, a parte que desliza (10° no asfalto, 20° no solto); precisa de 30 amostras |
| **derrapagem mediana** | nas mesmas amostras |
| **equilíbrio** | ângulo de escorregamento da frente menos o de trás (múltiplos do pico nominal) onde está em curva forte e não derrapa, média de pelo menos 30 amostras: + empurra para fora |
| **superfície** | acima de 80% de amostras soltas: solto; abaixo de 20%: asfalto; senão misto |

**Limite máximo.** Uma amostra conta quando o segundo à sua volta (±0,5 s, com pelo menos 0,9 s de dados) esteve todo com o acelerador a fundo (> 0,95, sem travão), no chão, conduzido em **reta** (|lateral| abaixo do maior entre 4 m/s² e um quarto da sua aderência), a ganhar menos de **0,35 m/s²**, a mais de 25 m/s e dentro de 90% da mais rápida da volta - o acelerador a fundo numa subida ou numa curva longa também deixa de ganhar, bem abaixo da velocidade máxima do carro. Com pelo menos **um segundo** de tal patamar em todas as voltas, a mediana dessas velocidades é onde ele atinge o limite. Senão não há velocidade máxima: onde nenhuma reta foi suficientemente longa, *ainda a puxar na mais rápida* diz a que distância estava. Nada de adivinhar para lá do que as voltas mostram - a desmultiplicação e o limitador acabam com a força de um carro muito antes do arrasto.

**Perder a traseira.** Contada onde o condutor teve de a apanhar: em curva a 60% ou mais da sua aderência, a derrapar (derrapagem acima de 10° no asfalto, 20° no solto), com o volante (acima de 0,06) virado **contra** a curva. Qual o sinal do volante que concorda com qual o sinal da força de curva é medido por volta (amostras a virar sem derrapar). Uma derrapagem conta uma vez até o carro deixar de derrapar. Um carro conduzido um pouco de lado de propósito não perde nada; um que precisa de contraviragem perde. Contado da mesma forma para cada carro, para que dois carros possam ser comparados. Precisa de volante e de um ângulo de derrapagem.

## Carros comparados {#cars-compared}

A secção da barra lateral é **O carro** com um carro, **Carros comparados** com vários.

**A tabela**: uma coluna por carro, uma linha por medida em que algum carro tem um valor: Aderência mantida; Força até 50 km/h, 50-120, 120-200, acima de 200; Travagem; Mais rápida; Limite máximo em («ainda a puxar» onde nunca o atingiu); Ainda a puxar na mais rápida; Traseira apanhada, por volta; Acima de 10° de derrapagem, em curva forte. Onde os carros diferem em mais de 3%, o melhor valor fica marcado (mais alto para aderência, força, travagem, velocidades; mais baixo para derrapagens da traseira).

**Um carro sozinho**: frases sobre o que as voltas mostram que ele é - a aderência que mantém (m/s² e g), a sua força em cada faixa, onde deixou de ganhar nas retas longas (ou que nunca atingiu o limite, e o que ainda puxava na mais rápida), com que frequência a traseira precisou de ser apanhada («quase nunca» abaixo de uma vez por volta, «sobretudo com o acelerador» quando 60% ou mais começaram aí).

**Dois carros**: para cada par, uma frase cada sobre o que o carro é em relação ao outro («X acelera melhor, mas não consegue virar tão forte, precisa de mais distância para parar e perde a traseira mais facilmente»), a tabela, cada diferença clara a começar pela maior, depois **Como conduzir cada um**. Com mais de **3** pares, mostra-se um par: o carro da volta em foco contra um carro escolhido numa lista pendente (por predefinição o carro da melhor volta da sua classe, senão o da referência, senão o primeiro outro).

Uma diferença só é dita quando as voltas a mostram claramente:

| Diferença | Dita a partir de | Frase |
|---|---|---|
| aderência | **4%** | «X mantém N% mais aderência nas curvas … isso são M% mais velocidade a meio de cada curva» (velocidade = √ da razão de aderência) |
| força | **5%**, na primeira faixa que os dois carros têm de 120-200, 50-120, acima de 200 km/h | «X acelera N% com mais força dos 120 aos 200 km/h»; também na saída, ou «embora Y saia da partida com mais força», quando a saída difere em 8% |
| velocidade máxima | **4 km/h** | «X atinge uma velocidade máxima mais alta: deixou de ganhar em …» |
| velocidade máxima, só um | um carro atingiu o limite, o outro não | «Y ficou sem força em …; X ainda ganhava quando travou» |
| velocidade máxima, nenhum | nenhum atingiu o limite | o que cada um ainda ganhava na sua mais rápida |
| travagem | **5%** | «X para N% com mais força … Y tem de travar mais cedo» |
| perder a traseira | pelo menos uma vez mais por volta **e** metade mais vezes | «X perde a traseira mais facilmente: derrapou o suficiente para precisar de contraviragem N vezes por volta contra M …» - sobretudo com o acelerador (60%+) ou sobretudo a virar ao entrar e a levantar (30% ou menos), a partir de cerca de P% da sua aderência; no solto «parte disso é a forma como um carro é virado; o apanhar não é» |
| de lado | **12 pontos percentuais** de curva forte acima do limiar de derrapagem | «X anda mais de lado no limite» |
| equilíbrio da frente | **0,3** do pico nominal | «X empurra mais na frente … Convém travar e virar antes do vértice» |

As características no resumo: *mantém mais aderência* / *não consegue virar tão forte*,
*acelera melhor* / *tem menos força*, *atinge uma velocidade máxima mais alta* / *atinge uma velocidade máxima mais baixa*, *ainda puxa no fim das retas* / *fica sem força*, *trava com mais força* / *precisa de mais distância para parar*, *é mais estável* / *perde a traseira mais facilmente* (*é muito mais escorregadio …* a duas vezes mais frequência mais um; *precisa de ser apanhado com mais frequência* no solto), *empurra na frente*. «Pouco a distinguir de Y nestas voltas» quando não há nenhuma.

**Como conduzir cada um:**

- um carro tem mais aderência e o outro mais força: leve velocidade a meio numa linha larga e redonda (o «U») no que tem aderência; trave em linha reta, rode-o num meio curto e apertado e endireite a saída (o «V») no que tem força;
- um carro está abaixo em ambos: a sua melhor volta é a mais limpa - trave em linha reta, o raio mais largo, acelerador a fundo o mais cedo que aguentar;
- um carro que perde a traseira mais facilmente: dê acelerador só à medida que o volante desfaz e mude de caixa mais cedo (deslizes com o acelerador), ou solte o travão suavemente e mantenha um acelerador constante a meio (deslizes à entrada).

A dica por baixo da secção repete como cada uma é medida.

## O que os carros decidem numa curva {#what-the-cars-decide-in-a-corner}

Quando as voltas estão em carros diferentes, a conclusão de cada curva perdida termina com **Os carros:** - o que dela os carros decidem, e como tirar o máximo deste (`carNote`):

- **A meio**, quando este carro mantém menos de 96% da aderência do outro, o outro ia mais de 0,5 m/s mais depressa no ponto mais lento, e esta volta não ficou muito abaixo do que a sua aderência explica (acima de 70% dela): na linha do outro carro, a aderência deste permite `v_outro · √(aderência_minha / aderência_outro)`. Se a volta levou isso (a 1 m/s), a diferença é o carro, e nenhum ponto de travagem a muda; se levou menos, quanto ainda há para ganhar. Depois, onde o tempo pode ser ganho em vez disso: numa reta, entre duas, ou num carro que tem 5% mais força - depois do vértice (travar em linha reta, virar mais tarde, apontar à saída cedo); senão o raio mais largo que a estrada permite.
- **Uma traseira que largou aqui** (um deslize ou pião não partilhado, ou uma derrapagem além do limiar de deslize à entrada), num carro que a perde pelo menos uma vez mais por volta e metade mais vezes: o que fazer com este carro - o acelerador dado à medida que o volante desfaz (os seus deslizes começam com a força 60% ou mais das vezes) ou o travão solto suavemente sem levantar.
- **A reta a seguir**: quando a força dos carros explicou 0,03 s ou mais, a força mais forte do outro carro a partir da mesma velocidade, com a força dos dois carros dos 120 aos 200 km/h.
- **Velocidade máxima**: quando esta volta atingiu 98% de onde o seu carro deixa de ganhar numa reta com mais de 150 m, e a outra foi 1,5 m/s mais depressa: essa é a velocidade máxima do carro, e cada km/h a mais à saída da curva ainda ajuda até lá chegar.
- **Travagem**: quando o outro carro trava 5% com mais força e esta volta travou mais de 5 m mais cedo, que parte da travagem mais cedo é do carro.

A parte do carro também é tirada do próprio tempo - ver [a parte do carro](race-corner-analysis.md#the-cars-share) - e uma curva em que o carro explica 60% ou mais é atribuída ao carro.

## Para programadores {#for-developers}

Código: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` em [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` em [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
