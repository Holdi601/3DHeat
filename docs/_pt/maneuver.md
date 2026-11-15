---
title: "Manobras"
parent: "Descobertas"
nav_order: 4
lang: "pt"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manobras: como os grupos se movem

**Descobertas → Manobras** acompanha como as unidades de cada lado se movem *em grupo* e dá nome às manobras que fazem: um flanco, uma pinça, uma rutura, uma emboscada, uma retirada, uma defesa contra mísseis, cruzar o T. Para cada uma indica o grau de certeza, os números por trás, se compensou e os seus paralelos na doutrina e na história. **Análise de massa → Manobras** conta-as em milhares de partidas: quantas vezes se faz cada uma por mapa, modo e lado, e quantas vezes compensa.

Tudo é calculado no seu navegador, num processo próprio (`src/insights/maneuver`). Uma partida de algumas centenas de unidades demora 10 a 500 ms. Uma guerra aérea de duas horas, com milhares de objetos, demora cerca de um segundo.

## Como usar {#using-it}

- Abra **Descobertas**, separador **Manobras**. Conta quando é aberto pela primeira vez. Depois de mudar os filtros, clique em **Encontrar de novo**.
- **Certa / Provável / Possível** define o grau de certeza mostrado (por omissão, Provável).
- A **linha do tempo** tem uma faixa por lado e uma barra por manobra. A **lista** por baixo mostra o mesmo, por ordem de tempo. Ao clicar, passa para a repetição no início da manobra, a câmara voa até lá e a manobra é desenhada em 3D: o caminho de cada grupo como uma seta (os dois braços de uma pinça são os seus arcos), o contorno dos grupos no momento-chave (o do inimigo na cor do seu lado) e a frente do inimigo como uma linha branca. **Desenhar todas em 3D** acrescenta as outras manobras da partida, mais ténues. As linhas são enviadas para a placa gráfica uma vez, quando a escolha muda, e não em cada imagem. Com 480 manobras desenhadas durante a reprodução, os tempos de imagem numa placa real (WebGL2 e WebGPU, p99 18,0-18,5 ms, máximo 19,5-20,8 ms) são iguais aos que há sem elas.
- Uma manobra aberta mostra o seu resultado (as mortes e perdas das unidades que a fizeram, enquanto decorreu e logo a seguir, comparadas com a troca do lado ao longo da partida), as suas provas e as entradas da base de conhecimento - a doutrina e os paralelos históricos (Cannae para uma pinça, Sedan 1940 para uma rutura, Tsushima para cruzar o T, a Operação Bolo para uma finta...).
- A pequena tabela no fim: por tipo e lado, quantas foram feitas e quantas compensaram.

![Uma pinça na partida sintética de demonstração: as setas dos dois braços, o corpo do inimigo e a sua frente](../assets/img/en/maneuvers.webp)

## Como os grupos são encontrados {#how-groups-are-found}

Cada unidade é colocada numa linha do tempo comum (um passo de 1 s a pé, 2 s nos outros casos, mais longo em ficheiros muito grandes). Fica parada durante uma morte, para que um nascimento de novo não desenhe uma linha através do mapa. Em cada passo, as unidades de um lado e de um tipo (aeronaves, veículos, navios, infantaria) são ligadas quando estão perto - 18 m a pé, 170 m para veículos, 3 km para navios, 5 km para aeronaves - e se movem da mesma forma (velocidades dentro de metade da mais rápida, ou ambas paradas). Um agrupamento mantém o id do grupo em que estavam a maioria dos seus membros. Uma unidade sem classe é considerada a pé, num veículo ou no ar, conforme a sua velocidade.

A **forma** de um grupo é lida em relação ao seu rumo: uma coluna ou uma linha pelas suas dispersões ao longo e através, uma cunha quando o meio vai à frente, um escalão quando os membros recuam para um dos lados, uma caixa quando ocupam os cantos.

Tudo é julgado à escala da própria partida. A **distância de combate** `R` é o percentil 75 da distância entre um atacante e a sua vítima (limitada ao sentido do domínio). Os tempos de uma manobra acompanham o tipo de unidade (a infantaria, um terço do que é no terreno).

## O que encontra {#what-it-finds}

| Manobra | Encontrada quando |
|---|---|
| Formação | um grupo mantém uma forma em 60% dos seus passos em movimento, durante 30 s |
| Ataque frontal | um grupo se aproxima de fora do alcance até ao contacto, ¾ R ou mais, a partir de dentro de 35° do sentido em que o inimigo está virado |
| Ataque de flanco | o mesmo, de 50-130° (a retaguarda além disso); só com certeza quando uma *força de fixação* amiga está a combater o inimigo ali (mortes em qualquer dos sentidos) |
| Pinça | dois ataques de flanco de um lado sobre o mesmo corpo inimigo, de lados opostos (100° ou mais de diferença), em 90 s; com certeza quando os braços combatem |
| Cerco | um grupo inimigo compacto com pelo menos tantos do outro lado à sua volta a 1,5 R, de dois ou mais grupos, sem falhas acima de 100°, durante um minuto, cortado do seu próprio lado; com certeza quando o anel se fechou a ½ R e combateu o bolsão |
| Penetração | um grupo passa uma linha defendida (inimigos parados 30 s à sua esquerda e à sua direita, o centro do seu lado além deles); com certeza quando chega a ½ R além, fica 20 s e combate ali; uma rutura, um R mais além |
| Cobertura em salto | num grupo pequeno, uma parte move-se enquanto o resto fica parado, trocando de papel quatro vezes ou mais, com fogo de cobertura da parte parada |
| Concentração / dispersão | a parte de um lado perto do seu ponto mais denso sobe de 35% para 60% (unidades a chegar a 1,5 R ou mais, depois contacto) - ou desce quando o lado se espalha |
| Finta | um elemento pequeno em contacto atrai dois ou mais inimigos de outro sítio; um grupo maior ataca depois quatro alcances longe, onde o inimigo tem menos |
| Retirada / perseguição | um grupo em contacto vira-se e abre R do sítio onde combateu; com certeza quando um inimigo ali tinha acabado de matar um dos seus e o grupo ficou a 2 R desse atacante (nunca a pé: ver abaixo); os inimigos que se movem no mesmo sentido e acompanham perseguem |
| Defesa em profundidade | unidades paradas em duas ou mais linhas através do eixo do inimigo, R de profundidade, o inimigo a avançar, fogo das linhas |
| Encosta inversa | três ou mais mortes à curta distância por unidades paradas, das vítimas que vieram por cima de uma crista |
| Emboscada | um grupo em movimento encontra inimigos que estiveram parados 45 s; eles disparam primeiro e os que se movem perdem duas unidades ou metade do grupo |
| Cortina | uma ou duas unidades a avançar à frente de um corpo de três ou mais, encontrando o inimigo primeiro |
| Linhas interiores | os grupos de um lado juntos entre os do outro, as suas unidades a deslocar-se entre eles |
| Ritmo | um lado que responde ao contacto (virar, mudar de velocidade, primeiro tiro) 1,5 vezes mais depressa, valor p de Mann-Whitney abaixo de 0,05 |
| Crank, notch, drag, pump | o alvo de um disparo de míssil vira o atirador para 35-70°, 75-105°, além de 140°, ou arrasta-o e vira-o de volta |
| Pinça aérea, parede, líder-seguidor, moedor | um par que se separa sobre um inimigo; três lado a lado frente ao inimigo; um elemento a 5-20 km atrás de outro; dois em órbita a um ponto de distância |
| Patrulha aérea de combate | órbitas à volta de uma estação durante três minutos |
| Combate de energia / de ângulos | num combate próximo - rumos a 30° um do outro, cada um com o outro no nariz à vez, ou uma morte entre eles - altura usada e a subir, ou plano e a virar com força enquanto abranda; com certeza quando um matou o outro |
| Pacote de ataque, SEAD | um grupo aéreo de funções mistas, algumas das quais atingem o solo; as mortes da defesa antiaérea antes da maioria das outras mortes no solo |
| Linha de batalha, cruzar o T | três navios em coluna; uma coluna que atravessa a cabeça de uma coluna inimiga em ângulo reto |

Cada manobra indica que **padrões** da base de conhecimento mostra (`patterns-maneuver.ts`: formação, ataque frontal, duplo envolvimento, cerco, penetração, fogo e manobra, finta, retirada, perseguição, defesa em profundidade, cortina, dispersão, defesa contra mísseis, combate de ângulos, patrulha aérea de combate, pacote de ataque, linha de batalha, cruzar o T) e as entradas a ler primeiro. As entradas mais antigas levam os novos padrões através de `knowledge/maneuver-tags.ts`. Veja [A lente de conhecimento](knowledge.md).

**Compensou** compara a troca das unidades enquanto a manobra decorreu (e um minuto depois) com a do seu lado ao longo da partida. Uma retirada compensa quando perdeu menos unidades depois de virar do que antes. Uma defesa contra mísseis compensa quando o avião sobrevive um minuto. Um cerco compensa quando o bolsão perde metade.

## Em muitas partidas {#over-many-matches}

O resumo de cada partida (`src/mass/summarize.ts`, veja [Análise de massa](mass-analysis.md)) tem uma pequena secção `maneuvers`: por tipo e lado, quantas foram feitas (a Provável ou acima), quantas compensaram, quantas não, mortes e perdas. **Análise de massa → Manobras** soma-as nas partidas que o filtro mantém - por mapa e modo, ou no total - com o intervalo de Wilson da taxa de sucesso. Uma linha carrega as partidas em que foi feita. Resumos escritos antes desta secção não a têm: execute `node tools/3dheat-summarize.mjs <pasta> --force` para a acrescentar.

## Quão certa é {#how-sure-it-is}

Partidas sintéticas com manobras plantadas (`synth.ts`, executadas por `maneuver.test.ts`): todos os 28 tipos plantados são encontrados a Provável ou acima. De 50 manobras indicadas, 31 são do tipo plantado e as outras 19 existem mesmo (a formação do grupo em movimento, a aproximação frontal da coluna que penetra). Nenhuma está errada. Em 30 partidas nulas - passeios aleatórios separados e misturados, unidades paradas ao acaso, aeronaves em rotas retas, uma multidão a andar à toa - não é indicada nada a Provável ou acima.

Em dados reais (dezenas de batalhas terrestres, algumas missões longas de guerra aérea, uma dúzia de partidas de tiro): ataques frontais, flancos, penetrações e cercos nas batalhas de carros de combate, formações e combates próximos no ar, defesas contra mísseis, órbitas de patrulha aérea e pares líder-seguidor nas missões de guerra aérea, execuções frontais, colunas e algumas emboscadas e pares em salto no jogo de tiro. Os limiares são as formas da doutrina à escala do jogo. Leia uma descoberta isolada com as suas provas, e as taxas da tabela de massa com os seus intervalos.

### Contra modelos nulos das mesmas partidas {#against-null-models-of-the-same-matches}

Um detetor pode ser enganado pelo terreno e pela multidão: numa confusão, cada grupo tem inimigos à volta. Por isso, cada tipo também é executado em **modelos nulos** feitos das mesmas partidas (`nulls.ts`), em que os lados já não se encontram como antes. A linha do tempo de um lado é virada por um terço a dois terços da partida (*shift*), ou os seus trajetos são virados em torno do centro do mapa (*rotate*). E as etiquetas de equipa são baralhadas (*teams*, que por construção mantém cerca de metade dos combates reais). Os combates só são contados como mortes emparelhadas com as suas vítimas, o atacante a 2 R e a vítima no sítio. Um modelo nulo quebra esses pares. Encontra uma partida a Provável ou acima, real contra os modelos nulos (30 batalhas de carros de combate; 12 partidas de tiro):

| Tipo | Batalhas de carros: real / shift / rotate | Tiro: real / shift / rotate |
|---|---|---|
| Cerco | 0 / 0 / 0 (era 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Penetração | 0,03 / 0,02 / 0,05 (era 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flanco | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Ataque frontal | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Retirada | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (por isso nunca com certeza a pé) |
| Emboscada | - | 0,17 / 0,04 / 0,04 |
| Combate de energia | 1,2 / 0,1 / 0,85 | - |
| Combate de ângulos | 0,6 / 0,07 / 0,3 | - |

Os combates aéreos próximos sobre o centro de um campo de batalha sobrevivem a uma volta em torno desse centro, por isso a coluna *rotate* os favorece menos do que favorece os tipos terrestres. Os tipos dentro de um lado - formação, patrulha aérea de combate, moedor, pacote de ataque, SEAD, salto, cortina - não dependem do outro lado e não são testados desta forma. `maneuver.test.ts` verifica que os modelos nulos removem das partidas sintéticas o flanco, a pinça, o cerco, a penetração, a emboscada e a retirada plantados.

## Limites {#limits}

- Os grupos precisam de posições ao longo do tempo. Um ficheiro só de eventos não tem nenhuma.
- A frente não é lida dos dados: a frente do inimigo é onde a força de fixação o combate, senão onde se move, senão de onde veio o atacante.
- O terreno é lido a partir das alturas das próprias unidades (a encosta inversa). Não há teste de linha de vista.
- Ficheiros muito grandes são amostrados com passos mais longos. As manobras aéreas curtas neles são lidas, ainda assim, com passos de 2-4 s.
