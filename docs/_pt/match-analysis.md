---
title: "Análise de partida (CS2)"
nav_order: 10
lang: "pt"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# Análise da partida (Counter-Strike 2)

O separador **Partida** reproduz uma gravação como figuras, e para uma partida de Counter-Strike 2 mostra também o placar: quem ganhou cada ronda, como, e quem fez os abates. Use-o para rever uma partida ronda a ronda, e depois saltar para o mesmo momento no mapa de calor.

O separador Partida reproduz qualquer gravação como figuras: uma gravação do War Thunder ou do Tacview, ou uma demo do CS2, listadas em **Partidas na repetição** ([Repetição da partida](match-replay.md)). Um ficheiro `.match.json` do CS2 acrescenta o placar descrito nesta página.

## Rever uma partida do CS2 {#review-a-cs2-match}

1. Converta a demo ([abaixo](#where-the-data-comes-from)) para um ficheiro `.parquet` e um ficheiro `.match.json`.
2. No separador **Mapa de calor**, carregue o ficheiro `.parquet` em **Origem**.
3. Abra o separador **Partida** e clique em **Carregar ficheiros de partida…**, ou largue o ficheiro `.match.json` na vista.
4. Clique numa partida em **Resumos de partida**, depois numa célula da faixa de rondas para abrir essa ronda.
5. Clique em **Mostrar ronda** para ver essa ronda no mapa de calor, ou em **Repetir ronda** para a ver como figuras.

![O separador Partida: faixa de rondas com uma ronda aberta, registo de abates e Placar](../assets/img/en/match-analysis-round.webp)

Palavras como KAST, ADR, eco, force buy e trade estão no [glossário](glossary.md#counter-strike-words).

## De onde vêm os dados {#where-the-data-comes-from}

O conversor de demos do [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)
transforma demos em dois ficheiros por partida, numa pasta por mapa:

```bash
python -m heat3d_cs2 demos <ficheiros de demo ou pastas> -o out
```

| Ficheiro | Carregado em | Guarda |
|---|---|---|
| `<partida>.parquet` | o separador **Mapa de calor** (painel Origem, como qualquer Parquet - um ficheiro, vários, ou a pasta inteira) | a posição de cada jogador oito vezes por segundo, e cada evento onde aconteceu: abate, morte, dano, disparo, lançamento, fumo, flash, HE, molotov, isco, cegar, plantar, desativar, explodir; com `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, direção do olhar, `weapon`, `place`, `opening`, `traded` … |
| `<partida>.match.json` | o separador **Partida** | equipas, pontuação, cada ronda (vencedor, como, economia, a plantação, cada abate por ordem, clutches, sobreviventes), a linha do placar de cada jogador |

O rodapé do ficheiro Parquet traz instruções de leitura (chave `heat3d`), por isso
abre sem nada para definir: o jogador como a pessoa, o lado como o grupo,
cada ronda (`roundId`, «<partida> #NN») como uma sessão, a direção do olhar ligada,
e o mundo na ordem certa (o mundo do CS2 é de mão direita com Z para cima; lido
com o mapeamento predefinido de Z para cima sairia espelhado). Ver
[Mapeamento de colunas](column-mapping.md) e [Carregar ficheiros](loading-files.md).
`python -m heat3d_cs2 map <mapa>` exporta a geometria do mapa no mesmo referencial,
carregada em **Nível**.

As convenções por trás dos números são as do conversor (indicadas no seu
README e incluídas em cada resumo): uma morte é **tradada** quando quem a causou
é morto por um colega da vítima dentro de **5 s**; **KAST** é a parte das rondas com um abate, uma
assistência (uma assistência de flash conta), sobrevivência ou uma morte tradada; o **dano** é a vida
efetivamente perdida, só dos inimigos; um **clutch** é ser o último vivo de um lado com inimigos de pé,
ganho quando o lado ganha; a **compra** por lado vem do valor médio do equipamento no fim do
tempo de congelamento - a primeira ronda de cada metade regulamentar é uma ronda de pistolas
(nenhuma no prolongamento), depois abaixo de 1.500 $ é um eco, abaixo de 4.000 $ um force buy,
qualquer valor acima é uma compra completa.

## O separador {#the-tab}

A barra lateral do separador Partida tem, no topo, o seletor de modo do mapa de calor e o
seletor de sessão, depois as secções da partida, e por baixo os painéis **Filtros**, **Nível** e
**Câmara** do mapa de calor - a vista é o mapa de calor de qualquer Parquet carregado no separador Mapa de calor.

### Resumos de partida {#match-summaries}

| Controlo | Faz |
|---|---|
| **Carregar ficheiros de partida…** | escolhe ficheiros `.json` (vários de uma vez): os resumos `.match.json` |
| largar na vista | os ficheiros JSON largados na vista com o separador Partida aberto carregam-se da mesma forma (os outros são ignorados) |
| **Limpar** | remove todas as partidas |
| **Todas as partidas** (com duas ou mais) | «N partidas, M rondas»: as estatísticas de todas elas |
| uma linha de partida | «EquipaA 13 vs EquipaB 9», mapa · N rondas: abre essa partida |

Um ficheiro é aceite quando é JSON com `"format": "heat3d-cs2-match"` e as listas
`rounds`, `players` e `teams`. Os erros são listados por baixo dos botões:
«<ficheiro>: não é JSON», «<ficheiro>: não é um resumo de partida do CS2 (heat3d-cs2-match)»,
«<ficheiro>: faltam rounds, players ou teams». Uma partida carregada outra vez (mesmo nome
`match`) substitui a anterior. As partidas são ordenadas por mapa e depois pelo nome. Com exatamente
uma partida carregada, ela é aberta; caso contrário, a seleção mantém-se (todas as partidas por predefinição).

Sem nada carregado, a secção explica: converta com `python -m heat3d_cs2
demos`, carregue aqui os ficheiros `.match.json` e no separador Mapa de calor os ficheiros `.parquet`.

### Partida (uma partida aberta) {#match-one-match-open}

**O cabeçalho:** as duas equipas com a sua pontuação, o mapa, as metades -
«metades 7-5, 6-6»: rondas 1-12 e 13-24 (o jogo premier e competitivo é MR12;
a duração de metade que o próprio resumo indica quando a indica, por isso 1-15 e 16-30 para MR15) -
depois, quando a partida foi para prolongamento, a sua pontuação à parte: «prolongamento 4-2»,
as rondas depois das duas metades. Uma ronda empatada não conta para nenhuma equipa. E «N rondas
cortadas na demo» quando o resumo lista rondas incompletas.

**A faixa de rondas:** uma célula por ronda, pintada com a cor do lado que ganhou, com
o seu número e uma marca de como acabou. Uma ronda empatada (sem vencedor) é uma célula cinzenta neutra
marcada com `=`, nunca com a cor de um lado; a sua dica diz «Ronda
30: empate - nenhum dos lados a ganhou».

| Marca | Terminou por |
|---|---|
| B | bomba explodiu |
| D | bomba desativada |
| K | eliminados |
| T | o tempo acabou |
| S | rendição |
| = | empate |
| ? | outro |

Um separador marca o início da segunda metade (ronda 13, ou a ronda a seguir à
duração de metade do resumo) e de cada metade de prolongamento de três rondas (rondas 25,
28, 31, …). Passe o rato sobre uma célula: «Ronda 7: EquipaA (T) - bomba explodiu, plantada A»
(«…, plantada, local desconhecido» quando o resumo não tem local) e a compra e o valor do
equipamento de ambos os lados. Clique para abrir a ronda; clique outra vez para a fechar («Clique numa ronda para
ver os seus abates, economia e repetição.»).

**A ronda:**

- «Ronda 7: <equipa> ganhou - <como>» («Ronda 30: empate - nenhum dos lados a ganhou»
  para um empate) e quanto durou a ronda (do fim do congelamento até ao fim, m:ss);
- a economia: a equipa de cada lado, a compra (pistolas, eco, force buy, compra completa) e o
  valor do equipamento («4.350 $»);
- a plantação: local, jogador e tempo desde o início da ronda (de qualquer das versões do resumo);
  «Plantada por <jogador> às 1:05, local desconhecido» quando o local não se conhece;
- **o registo de abates**, por ordem: tempo desde o início da ronda, atacante (na cor do lado;
  «world» quando não há atacante), arma, e marcas - **HS** tiro na cabeça, **WB** através de uma parede,
  **SM** através de fumo; **open** o primeiro abate da ronda, **trade** (vingou um colega em 5 s),
  **traded** (quem matou foi morto em 5 s), **team** um abate de colega de equipa (um suicídio não é nenhum). Os abates depois de a ronda
  estar decidida ficam esbatidos;
- os clutches: «<jogador> (T) sozinho contra 3: ganhou o clutch» / «perdeu-o»;
- quem estava vivo no fim, por lado («ninguém»);
- **Mostrar ronda**: tudo o que há nesta ronda, no mapa de calor;
- **Repetir ronda**: reproduz a ronda como caixas, desde o seu início (abaixo).

Botões **Mostrar no mapa de calor** (ver [abaixo](#show-in-the-heatmap)) para esta
partida, ou para a ronda aberta.

### Placar {#scoreboard}

Uma tabela por equipa, uma linha por jogador:

| Coluna | É |
|---|---|
| K, D | abates, mortes |
| A | assistências, incluindo as de flash |
| ± | abates menos mortes (verde acima de 0, vermelho abaixo) |
| ADR | dano por ronda, vida efetivamente perdida |
| KAST | % de rondas com um abate, assistência, sobrevivência ou uma morte tradada |
| HS | % de abates na cabeça |
| Open | duelos de abertura ganhos-perdidos |
| Cl | clutches ganhos/jogados |

Passe o rato sobre um jogador: abates trade, vezes tradado, assistências de flash, inimigos cegados,
dano de utilidade, e rondas com múltiplos abates («2×3k»). **Clique num jogador** para os seus
abates e mortes no mapa de calor (esta partida).

### Entre partidas (Todas as partidas) {#across-matches-all-matches}

Sobre todas as partidas carregadas:

- «N partidas · M rondas · <mapas>», e «N rondas empatadas, ganhas por nenhum lado»
  quando houve empates;
- **Rondas ganhas** por lado: no geral, nas rondas de **pistolas** (as rondas de pistolas do resumo),
  e nas compras **eco**, **force** e **cheias** (cada uma como percentagem com as rondas jogadas; passe o rato para
  «ganhas de jogadas»). Uma ronda empatada é jogada pelos dois lados e não ganha por nenhum;
- **Bomba**: plantações por local, e quantas vezes o lado T acabou por ganhar essas rondas
  («12 plantações em A (T ganhou 67%)»), plantações cujo local o resumo não conhece por si
  («2 plantações num local desconhecido (T ganhou 50%)»), ou «nunca plantada»; como acabaram as rondas, a mais comum primeiro;
- «O lado que fez o primeiro abate ganhou N% dessas rondas.» (um suicídio não é
  um primeiro abate; uma ronda empatada não converte nenhuma abertura);
- **Duelos de abertura, onde**: os dez lugares com mais abates de abertura (pelo sítio onde estava
  a vítima; os nomes de lugares do jogo tornados legíveis, «TopofMid» →
  «Top of Mid»), os duelos e a parte que o lado T ganhou;
- **Jogadores**: os quinze melhores por abates menos mortes, somados em todas as suas
  partidas (identificados pelo Steam ID): partidas, K-D, ADR e KAST ponderados pelas rondas jogadas,
  % HS ponderada pelos abates, duelos de abertura. **Clique num jogador** para os seus
  abates e mortes em todas as partidas no mapa de calor.

Os botões Mostrar no mapa de calor para todas as partidas carregadas ficam por baixo.

## Mostrar no mapa de calor {#show-in-the-heatmap}

Cada ligação define os próprios **filtros** do mapa de calor, por isso o que é mostrado fica visível e editável no painel Filtros, e **Mostrar todas** limpa-os.
Funcionam sobre a tabela do mapa de calor carregada no separador Mapa de calor; o separador Partida nunca a carrega por si.

| Botão | Eventos mostrados |
|---|---|
| **Posições** | `position` - onde estavam os jogadores, oito vezes por segundo |
| **Abates** | `kill` - onde estava quem matou |
| **Mortes** | `death` - onde caiu a vítima |
| **Aberturas** | `kill` e `death` com `opening` = 1 - o primeiro abate de cada ronda, onde estavam os dois (só oferecido quando a tabela tem uma coluna `opening`) |
| **Smokes** | `smoke` - onde caíram os fumos |
| **Flashes** | `flash` - onde rebentaram os flashes |
| **Molotovs** | `molotov` - onde arderam os molotovs e os incendiários |
| **HE** | `he` - onde explodiram as granadas HE |
| **Plants** | `plant` - onde foi plantada a bomba |
| **Tiros** | `shot` - de onde foram disparados os tiros |

Limitado pelo sítio onde estão os botões: todas as partidas carregadas, esta partida, ou esta
ronda («Mostrar no mapa de calor - ronda 7»).

O que não se pode aplicar é dito por baixo dos botões, e não filtrado em silêncio até não sobrar nada: «nenhuma coluna de partida retida - partida não aplicada», «partida: X não está nos dados carregados», o mesmo para ronda e eventos, «jogador X não está nos dados carregados», «lado X não está nos dados carregados», «nenhum dado de mapa de calor carregado: carregue os ficheiros .parquet das partidas no separador Mapa de calor». Sem dados carregados, as ligações também dizem «Carregue os ficheiros .parquet das partidas no separador Mapa de calor para os ver no mapa.»

**Repetir ronda** além disso muda o mapa de calor para a **Repetição em caixas**, a linha temporal para o modo *reproduzir* com a sua janela em *tempo de vida*, salta para o início da sessão da ronda e reproduz. Quando a ronda não é uma sessão dos dados carregados: «esta ronda não é uma sessão dos dados carregados: nada para repetir».

## Para programadores {#for-developers}

Código: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Versões dos resumos {#summary-versions}

O separador lê resumos da versão 1 e da versão 2 (`"version"` no ficheiro) lado a lado, e trata-os da mesma forma:

| | Versão 2 | Versão 1 |
|---|---|---|
| tempo da plantação | segundos desde o início da ronda, como os abates | segundos da partida; o separador subtrai o início da ronda |
| local da plantação | `A` ou `B`; vazio quando a demo não o diz | `A`, `B`, ou um número de entidade - lido como local desconhecido |
| duração da metade | `halfLength`, desde onde os lados trocam pela primeira vez; 12 quando é null | 12 (MR12) |
| rondas de pistolas | `pistolRounds` (a ronda 1 e a primeira ronda depois da metade) | as rondas cuja compra é `pistol` |
| ronda empatada | `winner` e `winnerTeam` vazios | - |
| suicídio | `suicide` no abate, nunca um abate de colega | indicado por o atacante e a vítima serem o mesmo jogador |

Os `noscope` e `attackerBlind` de um abate (versão 2) não são mostrados no separador Partida, que também não mostra nenhum lugar da tabela do mapa de calor, por isso o `place` vazio de uma linha de granada não muda nada aqui.

Como um foco se torna filtros (`focusFilters`):

- **partida** → um filtro de categoria na coluna `match`;
- **ronda** → um filtro de intervalo `round` = N numa coluna numérica `round` (um filtro de categoria numa categórica), e a sessão da ronda
  (`<partida> #NN`) fica selecionada no seletor de sessão;
- **eventos** → um filtro de categoria na coluna `event`;
- **jogador** → um filtro de pessoa nesse jogador;
- **lado** → um filtro de grupo.
