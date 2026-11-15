---
title: "Combate aproximado e rondas"
parent: "Descobertas"
nav_order: 2
lang: "pt"
source: "close-quarters.md"
source_hash: "0469351f7e99"
translated: true
outdated: false
---

# Combate próximo e rondas

Para os jogos de tiro por rondas (Counter-Strike em primeiro lugar, qualquer dado com rondas, lados e abates), o Descobertas mede como os combates foram ganhos: quem ganhou os duelos de abertura e o que valeram, se as mortes foram trocadas, se o jogador que espreitava um ângulo venceu o que o defendia, se os fogos cruzados e os flashes compensaram, como as probabilidades da ronda mudaram com cada abate, e que portas mataram os jogadores que entravam por elas. Use-o para ver porque é que as rondas foram ganhas, e não apenas quem fez os abates.

As medidas vêm da doutrina de limpeza de salas e de combate urbano (o funil fatal, os pontos de domínio, o fogo cruzado) e da análise de esports e desportiva (probabilidade de vitória, valor das ações, misto de mais e menos ajustado). Cada uma é lida através da [lente de conhecimento](knowledge.md) e citada.

## Experimente {#try-it}

1. Carregue uma ou mais partidas com rondas (uma conversão de CS2 tem tudo o que precisa).
2. Abra **Descobertas** e prima **Encontrar descobertas**.
3. Em **Métricas da lente**, leia as linhas desde *Probabilidade de vitória na ronda* até *Impacto do jogador*; cada uma tem os seus números, o seu intervalo de 95%, o seu valor q e as fontes que segue.
4. Escolha a lente **Esports** ou **Urbana** para as ler através dessa literatura; **Escrever com IA** envia-as com o relatório.

## O que mede {#what-it-measures}

| Medida | O que diz | Como |
|---|---|---|
| Probabilidade de vitória na ronda | Quão provável era cada lado ganhar a ronda em cada momento | Regressão logística sobre os jogadores vivos de cada lado, a bomba ou o objetivo e o seu tempo, o relógio da ronda e a compra, ajustada aos dados carregados; calibração verificada fora da amostra por ronda (pontuação de Brier e competência, perda logarítmica, erro de calibração em dez intervalos, declive de recalibração, AUC) |
| Valor das ações | Quanto um abate, um abate de abertura, uma troca, um abate atrás de um flash, uma colocação de bomba ou um flash mudou a probabilidade de vitória do lado | Probabilidade de vitória depois menos antes; trocas, aberturas e abates com flash testados contra os outros abates por permutação |
| Duelos de abertura | Que lado ganha o primeiro duelo, com que frequência isso ganha a ronda, e onde um lado ganha aberturas muito acima da sua própria média | Intervalos de Wilson; sítios por teste binomial exato contra a parte do lado, q sobre os sítios |
| Trocas | Mortes respondidas por um abate de um companheiro ao assassino dentro de 5 s, o tempo que levou, e rondas ganhas quando a primeira morte foi trocada | Teste exato de Fisher, intervalo de Newcombe |
| Quem espreita contra quem defende | Duelos em que um jogador entrou no combate (1,5 m/s ou mais no último segundo) e o outro ficou parado (0,75 m/s ou menos): a parte do que espreitava | Teste binomial exato contra metade |
| Pontaria antes do duelo | A vista de cada jogador contra a direção do outro 0,75 s antes do abate; quem estava melhor apontado e com que frequência esse jogador venceu; os que defendiam o seu ângulo (dentro de 15°) contra os que estavam fora dele; alcances de abate | Teste binomial exato; Fisher |
| Fogo cruzado | Defensores com um companheiro parado a menos de 25 m do que espreitava, cuja linha até ele está a 35° ou mais da sua própria, contra os defensores sozinhos | Fisher, Newcombe |
| Utilitários nas entradas | Quem espreita atrás de um flash do seu próprio lado (em 3 s e 15 m) ou de um fumo (em 18 s) contra as espreitadelas secas; duelos de abertura com um flash de um só lado; vítimas cegadas | Fisher, binomial |
| Vantagem de homens | Para cada estado de jogadores vivos (5v4, 4v5, 2v1...) atingido pela primeira vez numa ronda, a parte de rondas ganhas a partir daí | Intervalos de Wilson |
| Reviravoltas | Rondas em que um lado ficou reduzido ao seu último jogador: vitórias contra as vitórias esperadas pelo modelo, por número de adversários | Teste normal do observado contra o esperado |
| Amontoados, rotações, emboscadas | O maior grupo a menos de 10 m no duelo de abertura (3 ou mais: amontoado); jogadores a mais de 30 m do primeiro combate ou do objetivo colocado e a velocidade com que chegam a menos de 12 m; tempo e razão abates/mortes a mais de 30 m de cada companheiro | Fisher; razão de chances com o intervalo de Woolf |
| Pós-colocação e recuperação | Rondas ganhas pelo lado que colocou a bomba, pelos números no momento da colocação, e a sua parte dos duelos depois dela | Intervalos de Wilson |
| Funis fatais | Entradas em cada sítio (uma mudança na coluna de sítio, senão numa célula de 8 m) e mortes a menos de 2,5 s de entrar, contra a taxa do mapa | Teste binomial exato, q sobre os sítios; razão reduzida com 20 entradas à taxa do mapa |
| Impacto do jogador | Probabilidade de vitória acrescentada por ronda por cada jogador (abates, mortes, colocações), reduzida por Bayes empírico; misto de mais e menos ajustado por regressão de crista dos resultados das rondas contra o início do modelo; valor do abate por sítio e arma, reduzido | Penalização escolhida por validação cruzada de cinco partes |

Todos os testes de uma análise partilham uma taxa de falsas descobertas (Benjamini-Hochberg), incluindo todos os sítios testados, e não só os mostrados; o q mostrado é sobre todos eles. O modelo e a sua calibração são ajustados aos dados carregados, por isso descrevem essa população: um modelo profissional julga mal o jogo casual, e o contrário também.

Verificado em rondas sintéticas com efeitos plantados (a vantagem de quem espreita, fogos cruzados, flashes, um funil fatal, a boa pontaria a ganhar), e em 100 conjuntos de dados das mesmas rondas sem eles, onde a taxa de falsas descobertas dos testes com efeitos plantados tem de ficar nos 5% nominais (dentro de uma margem) (`src/insights/cqb/cqb.test.ts`); em cerca de mil rondas reais, o modelo teve uma pontuação de Brier de 0,14 contra 0,25 da taxa de base, um erro de calibração de 0,03 e um declive de recalibração de 1,0.

## Dados de que precisa {#data-it-needs}

- colunas de **tempo**, **jogador**, **lado** e **ronda** (a sessão), e abates e mortes na coluna de eventos; as rondas em que ninguém morre duas vezes são tratadas como rondas de eliminação (a vantagem de homens, as reviravoltas e o modelo precisam delas);
- uma coluna de **outra parte** (`other`, `victim`, `killer`, `attacker`) que indique a vítima num abate e o assassino numa morte (sem ela, os abates e as mortes no mesmo instante são emparelhados);
- uma **direção do olhar** para as medidas de pontaria;
- uma coluna `event` em bruto com `flash`, `smoke`, `he`, `molotov`, `plant` e `defuse` para os utilitários e as colocações;
- `won` (o lado da linha ganhou a ronda), `place` (chamadas), `weapon`, `buy` e `state_flashed` quando os dados os têm.

As posições devem ser amostradas várias vezes por segundo; as velocidades, a pontaria e os fogos cruzados leem os dois últimos segundos antes de cada morte.

## No detalhe {#in-the-breakdown}

O [detalhe](breakdown.md) mede quatro das situações como fatores, com e sem: *cegado*, *morte trocada*, *duelo de abertura* e os números (*homem a mais*, *números iguais*, *homem a menos*), cada um em K/D, rondas ganhas, sobrevivência e abates por minuto.

## Muitas partidas {#many-matches}

Cada resumo de partida da [análise de muitas partidas](mass-analysis.md) de dados com uma coluna de ronda leva as mesmas medidas como contagens (`cqb` no resumo): duelos de abertura, trocas, espreitadelas, fogos cruzados, entradas com flash, pontaria, vantagem de homens, colocações e os 40 sítios mais entrados com as suas entradas e mortes. As contagens somam-se entre partidas, por isso mil partidas dão as mesmas partes que uma análise grande. O separador **Combate próximo** do painel mostra-as como partes com os seus intervalos, em todos os mapas ou por mapa; um clique numa linha carrega as partidas de onde veio.

## Para programadores {#for-developers}

`src/insights/cqb/`: `walk.ts` (uma passagem pelas linhas por ordem de tempo, rondas mantidas separadas, duelos registados com o seu estado), `finish.ts` (as medidas e as contagens por partida), `model.ts` (regressão logística por IRLS, calibração, regressão de crista por gradientes conjugados, Bayes empírico, Fisher, Newcombe, testes de permutação), `run.ts` e `worker.ts` (o visualizador: o seu próprio trabalhador, ao lado da passagem de descobertas), `summary.ts` (o coletor do resumo de muitas partidas), `factors.ts` (as situações do detalhe), `shows.ts` (o que a lente lê), `synth.ts` (as rondas de teste). As entradas de conhecimento estão em `src/insights/knowledge/cqb.ts`, os padrões em `patterns-cqb.ts`. Os resultados entram no relatório como `lens.cqb`.
