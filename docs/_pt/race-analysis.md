---
title: "Análise de corrida"
nav_order: 11
has_children: true
lang: "pt"
source: "race-analysis.md"
source_hash: "ab0531fa7bbd"
translated: true
outdated: false
---

# Análise de corrida

Conduziu duas vezes o mesmo traçado. O separador **Análise de corrida** reproduz as duas conduções juntas em 3D, mostra onde uma volta foi mais lenta e diz-lhe porquê. Ainda não tem voltas? Prima **Voltas de demonstração**.

![O separador Análise de corrida com voltas de demonstração: a barra lateral com Voltas e Onde melhorar, os carros no percurso, os gráficos por baixo da vista](../assets/img/pt/race-analysis-overview.webp)

O separador compara duas ou mais voltas de um percurso. Partilha a tela, a câmara e o modelo do percurso carregado (**Fundo / nível**) com o mapa de calor; o resto é próprio dele: a sua barra lateral e a sua barra por baixo da vista. Palavras como *volta*, *referência* e *vértice* estão no [glossário](glossary.md).

Esta página é o mapa do separador. Cada parte tem a sua própria página:

| Página | O que cobre |
|---|---|
| [Carregar voltas](race-loading-laps.md) | todos os formatos de ficheiro, pastas e percursos, nomes dos carros, voltas de demonstração, a lista de voltas, referência e foco |
| [Repetição e a cena 3D](race-replay-and-scene.md) | a barra de transporte, os três modos de repetição, alinhar carros, a câmara de perseguição, linhas, mapas, carros, etiquetas, mundos espelhados |
| [Gráficos e HUD](race-charts-and-hud.md) | os gráficos de distância, o seletor de gráficos, passar o rato e zoom, os cartões dos carros, a tabela de canais |
| [Eventos de controlo do carro](race-control-events.md) | bloqueios, patinagem das rodas, sobreviragem, piões, subviragem, toques, colisões, ABS/TC, travão de mão, ar - como cada um é detetado, com todos os limiares |
| [Análise curva a curva](race-corner-analysis.md) | alinhamento por distância, curvas e segmentos, a conta de tempo de uma curva, cada causa e a ordem em que são testadas, a forma da linha e o conselho |
| [Perfis dos carros e comparação](race-car-profiles.md) | o que cada carro consegue fazer, medido nas suas voltas; *Carros comparados*; o que o carro decide em cada curva |
| [Estatísticas do percurso](race-course-statistics.md) | muitas voltas de um percurso: erros por curva e por tipo, o mapa de erros, a exportação para o mapa de calor, limites de desempenho |
| [Análise de corridas: o método](race-analytics.md) | a investigação por trás das regras, com fontes |
| [Outros jogos de corrida](other-games.md) | o que o visualizador faz com as voltas de cada jogo: deslizamento e derrapagem calculados onde um jogo não os envia, mundos espelhados, os canais extra |

## O ecrã {#the-screen}

**Barra lateral**, de cima para baixo (as secções podem ser dobradas):

1. **Voltas** - carregar, listar, mostrar/esconder, referência, foco, perseguição.
   Veja [Carregar voltas](race-loading-laps.md).
2. **Estatísticas do percurso** - só a partir de três voltas carregadas.
   Veja [Estatísticas do percurso](race-course-statistics.md).
3. **Onde melhorar** - as conclusões da volta focada, curva a curva.
   Veja [Análise curva a curva](race-corner-analysis.md).
4. **Curva a curva** (ou *Curva a curva - classe X* com várias classes) - a volta mais rápida em cada curva e a sua linha. Mostrada com duas ou mais voltas.
5. **Controlo do carro** - os bloqueios, derrapagens, empurrões e toques da volta focada.
   Veja [Eventos de controlo do carro](race-control-events.md).
6. **Carros comparados** (ou **O carro** com um só carro) - veja
   [Perfis dos carros e comparação](race-car-profiles.md).
7. **Vista** - que mapa é pintado na pista e o que é desenhado.
   Veja [Repetição e a cena 3D](race-replay-and-scene.md).
8. Os painéis partilhados **Nível** e **Câmara e cena** (modelo do percurso, inversão de eixos, câmara) - documentados com o mapa de calor e em [Câmara](camera.md).

**A vista** mostra o percurso, as linhas conduzidas, o mapa, os carros, etiquetas fixadas à pista, e até seis cartões de carros no canto superior esquerdo (veja [Gráficos e HUD](race-charts-and-hud.md)). Sem voltas carregadas, diz "Nenhuma volta carregada - largue aqui dois ou mais ficheiros de voltas, ou carregue as voltas de demonstração na barra lateral."

**A barra por baixo da vista** tem o transporte da repetição e, a não ser que esteja escondida, os gráficos de distância.

## Início rápido {#quick-start}

1. Abra o separador **Análise de corrida** (ao lado de **Mapa de calor** no topo da barra lateral).
2. Coloque voltas. Prima **Voltas de demonstração** para ver o que o separador faz com três voltas inventadas. Para as suas próprias voltas, grave-as primeiro ([formatos de ficheiro e gravadores](race-loading-laps.md#file-formats)), depois prima **Carregar ficheiros de volta…** ou **Pasta…**, ou largue ficheiros ou pastas na vista.
3. A volta completa mais rápida torna-se a referência; a outra volta mais lenta fica focada. Clique em qualquer volta da lista para a focar; ★ torna uma volta a referência.
4. Leia **Onde melhorar**. Clique numa conclusão: os carros são alinhados 40 m antes dela, a câmara enquadra-a, a repetição passa por ela e as medições abrem-se.
5. Passe o rato sobre os gráficos para levar cada carro até esse metro; Shift+clique para os alinhar ali.

## Teclado {#keyboard}

Com o separador Corrida aberto:

| Tecla | Faz |
|---|---|
| **K** | reproduzir / pausar a repetição |
| **Home** | voltar ao início da repetição |
| teclas numéricas | nada (no mapa de calor mudam de modo) |

As teclas escritas num campo de texto ou numa lista pendente são ignoradas. As teclas da câmara funcionam como no mapa de calor (**W A S D**, **Espaço** para cima, **Q** para baixo, **Shift** mais rápido, **Alt** mais lento, rato para olhar; tudo em [Câmara](camera.md)); **F** enquadra as voltas carregadas (como faz carregar voltas).

## Muitas voltas {#many-laps}

- Todas as voltas carregadas são analisadas e contadas; dezenas levam um ou dois segundos.
- Acima de **8** voltas (`SHOW_ALL_UP_TO`), as voltas acrescentadas só são desenhadas quando são a referência, a volta focada, ou a melhor volta da classe da volta focada. *Mostrar todas* / *Só as que estão em análise* alternam.
- Acima de **10** carros visíveis (`PLAIN_PAST`), as voltas que não estão em análise (que não são a focada, o carro perseguido ou a referência) são desenhadas com linhas afinadas para um ponto a cada 6 m em vez de 1,5 m, e com carros simples.
- Os gráficos desenham no máximo **8** voltas; o HUD mostra no máximo **6** cartões.
- As estatísticas do percurso aparecem a partir de **3** voltas.

Detalhes: [Estatísticas do percurso](race-course-statistics.md#performance-with-many-laps).

## Definições de vista por omissão {#default-view-settings}

| Definição | Omissão |
|---|---|
| Mapa | Mapa de tempo |
| Linhas conduzidas, Carros, Pneus e suspensão, Etiquetas, Pista a partir das voltas | ligado |
| Todos os valores nos cartões | desligado |
| Tamanho do carro | 1× |
| Gráficos | mostrados |
| Modo de repetição | A partir da linha |
| Velocidade da repetição | 1× |
| Ciclo | ligado |

Nenhuma destas é guardada; ao recarregar começa-se pelas omissões. O que fica
lembrado no navegador: a língua, e os nomes dos carros aprendidos dos ficheiros
de voltas (veja [Carregar voltas](race-loading-laps.md#car-names)).

## Para programadores {#for-developers}

### O que acontece quando as voltas são carregadas {#what-happens-when-laps-are-loaded}

Sempre que o conjunto de voltas, a referência ou a língua muda, toda a análise é refeita (`analyse` em
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Os canais derivados são acrescentados a cada volta onde o jogo não os envia: ângulo de derrapagem, deslizamento das rodas a partir das velocidades das rodas, no ar, terreno solto, taxa de guinada ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. A referência é escolhida e cada volta é projetada sobre o seu trajeto e reamostrada a cada 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Calcula-se a partir das voltas se o mundo do jogo está espelhado ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. As curvas são encontradas na referência e agrupadas em segmentos, desde uma zona de travagem até à seguinte ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Por carro: a sua envolvente (aderência, travagem, tração por velocidade), o seu perfil, as suas curvas de pneus ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Por volta e segmento: o que fez (ponto de travagem, ponto mais lento, acelerador a fundo, ...) e a linha que seguiu ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Por volta: os seus eventos de controlo do carro, cada um posto contra a volta com que é comparado nesse ponto.
8. Por volta e segmento: a conta de tempo contra a sua volta de comparação e a conclusão em palavras.
9. O mapa de tempo e o mapa de causas de cada volta.

Os textos são produzidos na língua atual; mudar de língua volta a correr a análise (e renomeia as voltas de demonstração). Uma falha na análise é mostrada por baixo dos botões **Voltas** como erro, e as voltas continuam carregadas.

### Ficheiros de código {#source-files}

| Ficheiro | Função |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | leitura de ficheiros de voltas |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | o tipo de volta, os nomes, as voltas de demonstração |
| `src/race/derive.ts`, `handedness.ts` | canais derivados, mundos espelhados |
| `src/race/align.ts`, `segments.ts`, `line.ts` | eixo de distância, curvas, linhas |
| `src/race/analysis.ts` | curvas comparadas, causas, conclusões |
| `src/race/envelope.ts`, `profile.ts` | o que um carro consegue fazer |
| `src/race/control.ts`, `impacts.ts` | controlo do carro, toques e colisões |
| `src/race/stats.ts` | muitas voltas |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | repetição e desenho |
| `src/race/schema.ts`, `graphs.ts` | a tabela de canais, as linhas dos gráficos |
| `src/ui/race/*` | a barra lateral, os gráficos, o HUD, as etiquetas |
| `src/state/raceStore.ts` | o estado do separador e o relógio da repetição |
