---
title: "Comportamento coletivo"
parent: "Descobertas"
nav_order: 3
lang: "pt"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---


# Comportamento coletivo: multidões, bandos, manadas e decisões sob pressão

Os jogadores de uma partida comportam-se como pessoas em qualquer lado: juntam-se às portas, seguem quem foi primeiro, mantêm-se juntos ou dispersam-se, recuam depois de grandes perdas, arriscam mais depois de uma má vida. As **métricas da lente de comportamento** medem estes padrões com os métodos da ciência das multidões, da física do movimento coletivo, da economia comportamental e da psicologia militar, cada um contra o seu próprio modelo nulo, e lêem-nos através das entradas correspondentes da [base de conhecimento](knowledge.md).

## Experimentar {#try-it}

1. Carregue uma ou mais partidas com tempo, posições e equipas.
2. Abra **Descobertas** e execute.
3. Desdobre **Métricas da lente**: as medidas de comportamento aparecem na lista com as outras (Alinhamento coletivo, Manada pelas rotas, Faixas e trilhos, Aglomeração, Líderes e seguidores, Coesão e retardatários, Ponto de rutura, Risco depois de perdas, Sequências, Concordância nas compras, Supressão), cada uma com os seus números, o seu teste e a literatura que a explica.
4. O **Resumo** cita-as; **Escrever com IA** envia-as com o relatório.

## As medidas {#the-measures}

As trajetórias são reamostradas para um ponto a cada 2 s (a posição no fim do intervalo e a velocidade durante ele). As distâncias são escaladas pelo espaçamento típico dos próprios dados - a distância mediana de uma unidade ao seu colega mais próximo - para que a mesma medida funcione para infantaria, tanques e aeronaves.

| Medida | O que mede | Modelo nulo e teste | Conhecimento |
|---|---|---|---|
| Alinhamento coletivo | Polarização (comprimento do rumo médio das unidades) de cada lado, em unidades em movimento, a cada 2 s; giro em torno do centroide; percentagem do tempo polarizado, em giro e em enxame, por fase da partida; em combates entre dois lados alinhados, a parte de abates do lado mais alinhado | A trajetória de cada unidade deslocada no tempo dentro da partida (mantém o percurso, quebra a simultaneidade); teste de inversão de sinal em janelas de 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Manada pelas rotas | Com que frequência uma unidade sai de um sítio pelo mesmo caminho que o colega anterior fez (em 30 s), pelo mesmo caminho de entrada, contra as partes de saída do próprio sítio - e contra copiar uma passagem anterior de um inimigo | Saídas baralhadas dentro do sítio e da entrada; o efeito é a cópia do colega menos a cópia do inimigo (o problema do reflexo de Manski: copiar e um plano partilhado do lado parecem iguais) | Banerjee 1992, Bikhchandani et al. 1992, Manski 1993 |
| Faixas e trilhos | Segregação lateral das duas direções em sítios com contrafluxo; parte do movimento no 10% mais movimentado do terreno, o seu Gini, e a sobreposição do terreno mais movimentado das partidas | Direções baralhadas entre visitas completas; duas grelhas deslocadas meio sítio, cada uma testada, Bonferroni | Helbing et al. 1997, 2005 |
| Aglomeração | Velocidade (em relação ao ritmo próprio da unidade) e fluxo pelo número de vizinhos a menos de duas vezes o espaçamento típico, a queda de capacidade na classe mais densa, no terreno mais movimentado; mortes por hora em multidões; disparos por minuto dos colegas próximos (preguiça social) | A correlação velocidade-densidade de cada unidade, inversão de sinal entre unidades, efeito mínimo ρ além de ±0,05; testes exatos de taxa | Helbing et al. 2000, Seyfried et al. 2005, Latané et al. 1979 |
| Líderes e seguidores | Para colegas que viajam juntos, o atraso no tempo (até 8 s) em que o rumo de um melhor prevê o do outro; grafo de líderes, transitividade dos triângulos, taxas de morte e de abate dos líderes | Pares com uma trajetória deslocada no tempo dão o limiar de 95%; teste binomial contra 5% | Nagy et al. 2010, Couzin et al. 2005 |
| Coesão e retardatários | Tempo passado a mais de três vezes o espaçamento típico do lado em relação ao colega mais próximo; taxa de morte aí contra a do grupo; o espaçamento de um lado contra a sua parte nos abates de um combate | Teste condicional exato de duas taxas de Poisson | Shils e Janowitz 1948, Siebold 2007 |
| Ponto de rutura | Velocidade de aproximação ao inimigo (no ritmo do próprio lado) pela parte do lado perdida no último minuto; o nível de perda mais baixo em que os lados se retiram | Bootstrap de agrupamentos unilateral contra uma retirada de um décimo do ritmo (as perdas dão-se onde os lados se encontram, e os lados que se encontram deixam de se aproximar), Bonferroni sobre os níveis | Dupuy 1987, Rowland 2006 |
| Risco depois de perdas | Parte da vida seguinte passada à frente do próprio lado, na direção do inimigo, acima da parte do lado e de outras unidades que regressam nesse momento: depois de uma vida perdida sem abate contra depois de uma com abate; morte precoce depois de morte precoce (inclinação) | As vidas de cada unidade baralhadas (a primeira mantida), para que o viés da sequência finita esteja no modelo nulo | Kahneman e Tversky 1979, Thaler e Johnson 1990 |
| Sequências | P(abate depois de k abates) − P(abate depois de k mortes), k = 1..3 | A sequência de cada jogador baralhada 1 000 vezes: subtrai-se o viés que Miller e Sanjurjo mostraram; Bonferroni sobre k | Gilovich et al. 1985, Miller e Sanjurjo 2018 |
| Concordância nas compras | Kappa de Fleiss das faixas de equipamento (económico, força, completo; tercis fora do Counter-Strike) dentro da ronda de um lado | As rondas-jogador do lado baralhadas pelas suas rondas | Fleiss 1971 |
| Supressão | Velocidade nos 4 s depois de dano não letal contra os 4 s antes, e disparos nos 10 s depois contra antes, nos acertos e nos momentos calmos da mesma unidade | Inversão de sinal entre unidades, efeitos mínimos de 0,05 do ritmo e um disparo por minuto | Rowland 2006 |

Cada valor-p do relatório passa pela taxa de falsas descobertas de Benjamini-Hochberg (`q`). Uma medida fica de fora quando os dados não a conseguem suportar: são precisas as rondas e os valores do equipamento para a concordância nas compras, os eventos de dano para a supressão, e os abates e mortes atribuídos às unidades para as sequências e o risco.

## No análise em massa {#in-the-mass-analysis}

Cada resumo de partida (`<partida>.summary.json`, veja [Análise em massa](mass-analysis.md)) traz as mesmas medidas para essa partida na sua secção `behaviour`, para que milhares de partidas possam ser comparadas sem ler outra vez as suas linhas.

## Quão bem funciona {#how-well-it-works}

Em batalhas simuladas com cada efeito incorporado, e nos mesmos mundos sem ele (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): cada medida encontra o efeito que lá foi plantado, e os mundos nulos ficam abaixo do limiar de falsas descobertas. O risco depois de perdas é o que tem menos poder; a manada pelas rotas não consegue distinguir cópia de um plano partilhado (um lado que partilha um objetivo é "manada" por esta medida).

## Para programadores {#for-developers}

- `src/insights/behaviour/acc.ts` - o acumulador (trajetórias reamostradas, eventos, rondas) e `finish`; `motion.ts` e `choice.ts` as medidas;
  `bstats.ts` os auxiliares de permutação, bootstrap e kappa; `shows.ts` os padrões e as frases que a lente lê (`lens.<measure>`).
- `feed.ts` alimenta-a a partir dos blocos do trabalhador de descobertas; `summaryTap.ts` a partir de um resumo de partida à medida que transmite a tabela.
- Conhecimento: `src/insights/knowledge/behaviour.ts` (entradas),
  `patterns-behaviour.ts`, `refs-behaviour.ts` (referências, cada uma verificada contra o seu registo na Crossref ou na Open Library).
- Rótulos: `lens.metric.<measure>` em `locales/*/lens.json`.
