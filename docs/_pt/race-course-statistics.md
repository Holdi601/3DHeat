---
title: "Estatísticas do percurso"
parent: "Análise de corrida"
nav_order: 57
lang: "pt"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Estatísticas do percurso

Carregue muitas voltas de um percurso e o visualizador conta os erros: em que curva se perde mais tempo, em quantas voltas se errou ali e porquê. Use-o para encontrar a curva que vale a pena treinar.

Experimente: **Voltas de demonstração** dá três voltas, o suficiente para esta secção aparecer.

![Estatísticas do percurso com o mapa de erros: a pista pintada conforme quantas voltas perderam tempo em cada curva, e a lista de curvas](../assets/img/en/race-course-mistake-map.webp)

Carregue a pasta inteira de um percurso - dezenas de voltas, vários carros, várias classes de desempenho - e cada volta é julgada e depois contada. Esta página trata da comparação por classe, do que conta como erro, da secção **Estatísticas do percurso**, do mapa de erros, da exportação para o mapa de calor, de percursos de vários circuitos e dos limites de desempenho com muitas voltas.

## Contra a melhor da sua própria classe {#against-the-best-of-its-own-class}

Uma volta é comparada, curva a curva, com a **volta completa mais rápida da sua própria classe de desempenho** (a referência, na classe da referência). Essa própria volta é comparada com quem da sua classe foi mais rápido em cada curva, ou com todas as voltas quando está sozinha na sua classe. Os carros são agrupados pela classe de desempenho do jogo (no Forza, de D até X; C e S2 são duas delas). A travagem de um carro C comparada com a de um carro S2 não diz nada sobre a condução. O mapa de tempo, as diferenças na lista de voltas e a tabela *Curva a curva* seguem a mesma comparação (veja [com que volta é comparada cada uma](race-corner-analysis.md#who-each-lap-is-compared-with)).

As estatísticas são construídas sobre a análise de cada volta, não ao lado dela.

## O que conta como erro {#what-counts-as-a-mistake}

Uma **ocorrência** é o erro de uma volta numa curva (segmento). Os erros de uma volta numa curva são:

1. **A causa de condução** que a análise encontrou para a sua perda ali - uma conclusão que é uma perda, atribuída ao condutor (e não ao carro ou à situação), que custa **0,05 s** ou mais em relação à volta de comparação. O seu custo é a perda da curva.
2. **Cada falha de controlo do carro** que fez ali e que a outra volta não fez (não partilhada), que custa **0,03 s** ou mais - bloqueio, patinagem das rodas, traseira a sair, empurrão, pião. O seu custo é o próprio do evento.
3. **Cada toque e cada colisão**, partilhados ou não, seja qual for o custo.

Uma curva pode ter vários; cada tipo é contado **uma vez por volta e por curva**. Ganhos, a parte do carro e uma chegada mais lenta decidida na curva anterior não são erros.

### Das conclusões aos erros {#from-findings-to-mistakes}

| Conclusão | Erro |
|---|---|
| demasiado rápido à entrada, lento à saída, por ter travado mais de uns metros mais tarde do que o outro | Travou tarde demais |
| travou cedo | Travou cedo demais |
| travou com suavidade | Travou com demasiada suavidade |
| um bloqueio como causa | Bloqueou uma roda |
| deixou o carro rolar | Deixou rolar |
| aderência por usar, mais lento até ao vértice, travou onde o outro só levantou | Lento demais no meio |
| linha apertada demais | Linha apertada demais |
| empurrado para fora | Empurrado para fora |
| virou o carro menos / demasiado | Virou mal o carro |
| acelerou mais tarde, plena potência mais tarde, hesitou | Acelerou tarde |
| mais lento à saída da curva | Mais lento à saída |
| patinagem das rodas | Patinagem das rodas |
| a traseira saiu, de lado a meio da curva | A traseira saiu |
| saiu para fora da trajetória | Saiu para fora |
| perdeu velocidade | Perdeu velocidade |
| levantou (à entrada, ou na reta) | Levantou |
| uma quase paragem, pião, toque ou colisão como causa | Rodou / Bateu em algo / Colidiu quando os eventos da volta ali o indicam (primeiro colisão, depois pião, depois toque); caso contrário, Quase parou |
| uma trajetória mais longa | Voou longe demais |

Os dois padrões são contados pela causa encontrada dentro deles, pela mesma tabela. *Deu mais à entrada do que a saída recuperou* é o erro da causa da sua entrada: travar cedo é *Travou cedo demais*, um bloqueio *Bloqueou uma roda*, deixar rolar *Deixou rolar*, aderência não usada *Lento demais no meio*. *Demasiado rápido à entrada, lento à saída* é *Travou tarde demais* quando a volta travou mais tarde do que a outra; caso contrário, o erro da causa da sua saída - *Acelerou tarde*, *Patinagem das rodas*, *A traseira saiu*, *Saiu para fora*, *Mais lento à saída*. Um padrão cuja causa é do carro, ou uma chegada mais lenta, não é contado.

Não contam: chegada mais lenta, a partida, cada conclusão sobre o *carro* (força, aderência, travões, tração) e cada curva de ganho ou nivelada.

### Os tipos, pela sua ordem {#the-kinds-in-their-order}

Travagem: *Travou tarde demais*, *Travou cedo demais*, *Travou com demasiada suavidade*, *Bloqueou uma roda*. Entrada: *Deixou rolar*, *Lento demais no meio*, *Linha apertada demais*, *Empurrado para fora*, *Virou mal o carro*. Saída: *Acelerou tarde*, *Mais lento à saída*, *Patinagem das rodas*, *A traseira saiu*, *Saiu para fora*, *Perdeu velocidade*. Reta: *Levantou*. Incidentes: *Rodou*, *Bateu em algo*, *Colidiu*, *Quase parou*, *Voou longe demais*.

## A secção Estatísticas do percurso {#the-course-statistics-section}

Mostrada a partir de **3** voltas, entre **Voltas** e **Onde melhorar**.

- **O resumo**: "40 voltas em 9 carros, 3 classes: cada uma julgada curva a curva contra a volta mais rápida da sua própria classe." (carros contados pelo número do carro, ou pelo nome).
- **Pastilhas de classe** (com várias classes): **Tudo** e uma pastilha por classe, cada uma com o número de voltas, pela ordem do jogo (D, C, B, A, S1, S2, R, X, depois as outras). Clique numa classe para ver só as suas voltas. **Shift+clique** acrescenta ou retira uma. Tudo o que está abaixo - as listas, o mapa, a exportação para o mapa de calor - segue as classes escolhidas.
- **O que mais corre mal**: cada tipo de erro, com as voltas mais afetadas primeiro (depois as mais vezes, depois o maior custo), no máximo 8 (**Mostrar todos os N tipos** mostra o resto, **Menos** volta a escondê-los). Cada linha: o seu nome, "N de M voltas", uma barra dessa parte, e "K vezes · cerca de X s · mais em T3 (5), T7 (4), T1 (2)" - quantas vezes foi feito (volta a volta, por curva), quanto custou no total, e as três curvas onde mais voltas o fizeram. **Clique numa linha** para a mostrar no mapa de erros (e ligar o mapa); clique de novo para todos os erros.
- **Curva a curva** (ou *Curva a curva - <erro>* com um escolhido): por segmento, "N de M perderam tempo · X s" - as voltas que fizeram a curva inteira, as que perderam **0,05 s** ou mais ali em relação à melhor da sua classe, e todo o tempo que perderam. Dobrada, lista os seus três erros mais comuns com o número de voltas. **Clique numa curva** para a abrir, enquadrá-la com a câmara e mudar para o mapa de erros: para cada erro (ou só o escolhido), uma linha como "12 de 40 voltas travaram cedo aqui. Em 9 carros diferentes - cerca de 0,21 s cada." e as voltas que o fizeram, **as piores primeiro**, cada uma com o seu custo - no máximo 8, "+N mais" para o resto. **Clique numa volta** para a focar e repetir esse erro (alinhado 40 m antes dele).
- **Mostrar no mapa de calor**: veja abaixo. "A construir o mapa de calor…" enquanto corre; desativado quando não há erros.

## O mapa de erros {#the-mistake-map}

**Vista → Mapa de erros** pinta ao longo do trajeto de referência quantas das voltas (das classes escolhidas) cometeram um erro em cada metro - de todos os tipos, ou o escolhido nas estatísticas. Cada volta conta uma vez por metro. O alcance de cada ocorrência (onde estava a sua causa ou evento) é alargado 6 m para cada lado, para que uma curta se veja. Mais largo e mais brilhante onde mais voltas passaram: largura `3 + 10 · (voltas aqui / mais voltas em qualquer sítio)` metros, cor do castanho ténue ao laranja brilhante; uma faixa cinzenta de 2 m onde nenhuma passou. Legenda: *poucas voltas ↔ mais voltas*.

Com **Etiquetas** ligadas, o vértice de cada curva tem o seu erro mais comum: "T3 · 12/40 travagem cedo" (voltas que o fizeram / voltas que fizeram a curva), "T3 · 12/40" com um tipo escolhido, "T3 · limpa" sem nenhum. Ao passar o rato sobre a etiqueta, lista as perdas da curva e os seus cinco erros mais comuns; ao clicar, abre ou fecha essa curva nas estatísticas.

## Mostrar no mapa de calor {#show-in-the-heatmap}

**Mostrar no mapa de calor** entrega o mesmo ao separador de mapa de calor como um conjunto de dados chamado "Erros em <pista>" (ou "Erros no percurso"), para que todo o conjunto de ferramentas do mapa de calor - modos de calor, filtros, a linha do tempo, fatiamento - funcione sobre onde as voltas correm mal.

É um CSV criado em memória (`mistakeTable`), uma linha por ponto da grelha (a cada 2 m) de cada ocorrência, na **própria posição da volta** nesse ponto:

| Coluna | Conteúdo |
|---|---|
| `x`, `y`, `z` | a posição da volta nesse metro (coordenadas do jogo) |
| `elapsed` | o tempo da volta ali, s |
| `lap` | a etiqueta da volta |
| `car` | o nome do carro (ou "car 1234") |
| `mistake` | o nome do erro, na língua atual |
| `car_class` | a classe, `-` quando não há |
| `corner` | a etiqueta da curva, `T3` |
| `cost` | o custo da ocorrência, s |

É carregado pelo próprio carregador do mapa de calor, com sugestões de mapeamento: Y para cima, sem inversão de eixos, escala 1; tempo `elapsed` em segundos; **pessoa** = `car`, **grupo** = `mistake`, **sessão** = `lap`; sem direção do olhar; `car_class`, `corner` e `cost` mantidos como colunas de filtro. O separador muda então para **Mapa de calor** e enquadra os dados. Só são exportadas as classes escolhidas nas estatísticas.

## Percursos de vários circuitos {#courses-from-several-tracks}

As voltas são analisadas **um percurso de cada vez**. Pasta com voltas de vários percursos - a biblioteca de voltas inteira - oferece cada percurso para carregar à parte (com o número de voltas, o maior primeiro). As voltas de corridas que nunca terminaram (`unfinished/` do FH Companion) vão com o seu percurso, marcadas *parcial*. As voltas de vários circuitos com nome, escolhidas como ficheiros, são oferecidas da mesma forma; as voltas sem nome de circuito vão com o que estiver escolhido. Carregar voltas de outro circuito com nome, diferente dos carregados, substitui-as. Detalhes: [Carregar voltas](race-loading-laps.md#folders-and-courses).

## Desempenho com muitas voltas {#performance-with-many-laps}

Dezenas de voltas são analisadas em um ou dois segundos (todas, sempre). O que é desenhado é limitado para que a vista se mantenha à taxa de imagens:

| Limite | Valor | Efeito |
|---|---|---|
| voltas desenhadas por omissão | 8 (`SHOW_ALL_UP_TO`) | depois de 8 voltas carregadas, as voltas novas ficam escondidas, a não ser que sejam a referência, a volta focada ou a melhor da sua classe. **Mostrar todas** desenha todas as voltas; **Só as que estão em análise** volta atrás. Focar uma volta volta a mostrá-la, e à melhor da sua classe |
| carros simples e linhas finas | mais de 10 visíveis (`PLAIN_PAST`) | voltas que não são a focada, o carro perseguido e a referência: um ponto de linha a cada 6 m (em vez de 1,5 m), carros desenhados simples |
| voltas no gráfico | 8 (`CHART_LAPS`) | primeiro a focada, a melhor da sua classe e a referência; "+N desenhadas, fora do gráfico" |
| cartões do HUD | 6 | as primeiras seis voltas visíveis |
| estatísticas | a partir de 3 voltas | a secção fica escondida abaixo disso |
| conclusões listadas | 12 do condutor, 8 do carro/contexto, 10 ganhos | por volta focada |
| pares de carros mostrados | 3 | acima de 3 pares, um par com um seletor |

Os erros são calculados uma vez por análise e guardados em cache; a densidade do mapa de erros é guardada em cache por seleção de classes e por erro.

## Para programadores {#for-developers}

Código: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` em [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
