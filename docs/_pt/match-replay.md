---
title: "Repetição da partida"
parent: "Replay"
nav_order: 1
has_children: true
lang: "pt"
source: "match-replay.md"
source_hash: "b02fd1676a6f"
translated: true
outdated: false
---


# Repetição da partida

A repetição é um filme da partida em que cada jogador aparece como aquilo que conduzia. Use-a para ver outra vez um combate, seguir uma unidade e ver quem acertou em quem.

Disparos, impactos, incêndios e destroços são desenhados sobre as unidades e os objetivos do nível. Câmaras, etiquetas e um ecrã tático ajudam a ler o combate. Conhece o Tacview? A [Paridade com o Tacview](tacview-parity.md) mostra onde está cada uma das suas ferramentas.

![Repetição com figuras do demo de tanques: tanques como figuras próprias, com etiquetas de nome, veículo e velocidade](../assets/img/pt/replay-overview.webp)

## Começar uma repetição {#start-a-replay}

1. Carregue uma gravação com **Fonte → Ficheiros…** ou arrastando-a para o painel Fonte (qualquer tabela com uma coluna **pessoa** e uma coluna **tempo**, um ficheiro Tacview, uma repetição convertida, uma partida [`.3dheat`](container.md)). Veja [Carregar dados](getting-data-in.md).
2. Abra o separador **Partida** e escolha **Repetição com figuras**, ou escolha **Figuras sobrepostas** na barra de modos do separador de calor.
3. Em **Partidas na repetição**, escolha uma partida, todas de uma vez, ou várias.
4. Carregue em **Reproduzir** na linha temporal (ou `K`). Arraste a linha temporal para saltar.

As figuras substituem as caixas em todas as unidades cujo nome ou tipo é conhecido (veja [Figuras](figures.md)). Os dados sem coluna de nome nem de tipo são desenhados como soldados.

![O separador Partida: o seletor de partidas, a secção Figuras, as vistas da câmara, Reproduzir e a lista de eventos](../assets/img/pt/match-replay-tab.webp)

## Figuras {#figures}

![Um tanque a arder na câmara de órbita, com o disparo que o atingiu](../assets/img/pt/replay-tanks.webp)

| Definição (secção **Figuras**) | Predefinição | O que faz |
|---|---|---|
| **Figuras em vez de caixas** | ligado | Desligado desenha caixas simples. |
| **Tamanho das figuras** (vezes o tamanho real) | 1 | 1 é o tamanho real; de 0,25 a 20 vezes (escala logarítmica). Maior ajuda a ver de longe. |
| **Menor figura no ecrã** | 36 px | As figuras distantes crescem para se manterem com este tamanho, de 0 a 200 px; 0 mantém o tamanho real. |
| **À distância**: Figura, Seta, Símbolo | Figura | No que se transforma uma unidade distante. |
| **Símbolos** | NATO (APP-6) | NATO (APP-6), sinais táticos russos, ícones do **Mapa de jogo**, ou **Só formas (seguro para daltónicos)**. |
| **Tamanho do símbolo**, **O meu lado**, **Hostil / Neutro**, **Traços de rumo** | 28 px (de 12 a 64), automático, hostil, ligado | Como são os símbolos e qual o lado amigo. |
| **Linhas verticais** | ligado | Uma linha de cada unidade direta ao chão, para que as alturas se leiam em 3D. |
| **Linhas ao solo e rótulos em armas** | desligado | Linhas até ao chão e etiquetas em mísseis e bombas. |
| **Incêndios nas unidades** | ligado | Chamas desde o momento em que a unidade pega fogo até ser apagada. |
| **Impactos nas unidades** | ligado | Marcas onde os disparos acertaram (abaixo). **Os impactos ficam**: de 1 a 300 segundos, ou **Toda a vida**. **Marcadores flutuantes**: marcas desenhadas acima da superfície. |
| **Linhas de mira e de torre** | desligado | Tracejada: para onde o jogador olha; contínua: para onde aponta o canhão. |
| **Edifícios** | sólidos | Edifícios sólidos ou transparentes, quando o nível os pinta. |

### Símbolos à distância {#symbols-at-a-distance}

Quando uma unidade seria mais pequena do que a **Menor figura no ecrã**, pode tornar-se um símbolo que continua legível. A forma diz o tipo (por exemplo, uma caixa arredondada com uma marca de lagarta para blindados); a cor diz o lado. Abra o menu **Símbolos** para mudar o estilo.

![As mesmas seis unidades como símbolos NATO, sinais táticos russos, ícones do mapa de jogo e só formas](../assets/img/pt/match-replay-symbols-styles.webp)

### Marcas de acertos, destroços e incêndios {#hit-marks-wrecks-and-fires}

- As **marcas de acertos** ficam na superfície onde o disparo chegou, à escala da figura. O aspeto mostra o que aconteceu: um buraco (atravessou), um salpico brilhante (não atravessou), um sulco (ricocheteou), uma estrela de fuligem (projétil explosivo). Um anel colorido diz o efeito: tiro mortal, módulo destruído, crítico, grave, dano, sem dano, acerto. Passe o rato por uma marca para ver o nome do projétil.
- Uma unidade destruída é desenhada **carbonizada**, como destroço, desde a morte até renascer ou ser retirada; o seu símbolo fica riscado.
- Os **incêndios** ardem numa unidade desde o momento em que pega fogo até ser apagada.
- As **torres** rodam para onde os dados indicam que o canhão aponta (ou, sem esses dados, para onde o jogador olha).

### Armas, engodos e rastos {#weapons-decoys-and-tracers}

Com **Armas, disparos e acertos** ligado (secção Visualizador da equipa): mísseis, foguetes, bombas e torpedos voam como figuras próprias com um rasto de fumo; balas e projéteis são rastos luminosos; impactos e explosões iluminam-se. Um rasto desenhado **a tracejado** foi deduzido de um acerto, porque os dados não tinham o disparo. Os sinalizadores e a palha são desenhados como engodos; ficam escondidos da lista de unidades, a não ser que *Engodos e projéteis* esteja marcado.

## Câmaras {#cameras}

Clique numa unidade ou na sua etiqueta para a **seguir**; a secção **Repetição** oferece **Perseguição**, **Órbita**, **Cabina** (com um visor de cabeça erguida, `H`), **Fixa**, **Padlock**, **Alvo** e **Satélite**. `V` percorre-as, e **Distância da câmara** define a distância. Esc para.

- **Vista de duas unidades**: escolha um **Alvo** (ou clique numa unidade com Ctrl/Alt) para a olhar a partir da que segue; **Trocar** troca as duas.
- **Medida**: Shift+clique em duas unidades para ver o rumo, a distância e a diferença de altura entre elas.
- **Mapa 2D** (`M`): vista de canto ou completa, com rastos e nomes.
- **Marcadores** (`B`): guarda o momento e a câmara; os abates, mortes e marcas da própria gravação também aparecem na lista.
- **Eventos**: todos os eventos por ordem de tempo; um clique salta para lá. `Page Up` / `Page Down` saltam entre eventos; **Pausar no evento** para em cada um.

## Ecrã tático {#tactical-display}

![O demo aéreo com o aspeto de ecrã tático (T): terreno em arame, painéis de abates e eventos](../assets/img/pt/replay-air-tactical.webp)

A secção **Visualização tática** desenha, para nenhuma unidade, para as selecionadas, para todas, ou para um tipo (aeronaves, terrestres, navios, armas): vetores de velocidade e o caminho à frente, linhas do nariz e de sustentação, cones de radar, bloqueios, ligações de dados, zonas e linhas de empenhamento, linhas de visão, para onde os jogadores olham (cones de visão), a mira das torres e a câmara gravada.

### Estilo do ecrã {#display-style}

`T` (ou o interruptor **Mostrar como ecrã tático**) muda o aspeto para um estilo de ecrã de radar: brilho, contornos, curvas de nível, uma grelha de medida, linhas de varrimento, anéis de alcance, escalas de altitude, painéis com abates e eventos, e um **Realizador** que move a câmara para os eventos por si.

![O mesmo combate aéreo no aspeto normal](../assets/img/pt/replay-air.webp)

## Objetivos {#objectives}

Quando uma partida traz os seus objetivos, a secção **Objetivos** desenha-os no nível: zonas de captura (com dono e progresso da captura), pontos de nascimento, aeródromos, áreas e alvos de bombardeamento, cada camada ligável ou desligável, com etiquetas. Vêem-se através do chão. Com vários modos de jogo carregados, **Modo** filtra as partidas por modo. Os objetivos vêm de um ficheiro de partida do conversor, ao lado da gravação ou dentro de um contentor [`.3dheat`](container.md).

As partidas de Rainbow Six Siege trazem os seus locais de bomba: as duas salas de cada local são desenhadas no seu chão como contornos com os seus nomes, deduzidos de onde os jogadores estavam enquanto o jogo nomeava a sala; um local do mapa que não foi jogado na partida vem da tabela de locais do conversor, como um círculo. No replay, o local da ronda na cabeça de reprodução acende-se em âmbar, os outros ficam cinzentos. Fazem parte da camada de zonas de captura.

## Etiquetas e estatísticas {#labels-and-statistics}

- **Etiquetas**: regras por tipo (**Selecionadas**, **Aeronaves**, **Terrestres**, **Navios**, **Armas**, **IA**): mostrar ou não, que valores, e uma **Prioridade** para decidir quem fica com o espaço quando as etiquetas se sobrepõem. **Manter as etiquetas afastadas** move uma etiqueta para o lado da sua unidade quando taparia outra, e deixa-a de fora quando não há espaço. **Tamanho das etiquetas** vai de 60 a 250 %. **Voltar a nome, veículo, altitude e velocidade** repõe as regras.
  - As unidades terrestres começam com nome, veículo e velocidade.
  - As aeronaves começam com nome, veículo, altitude e velocidade.
  - Os navios começam com nome, veículo, velocidade e rumo.
  - Passe o rato por uma unidade para ver todos os valores que tem.
- **Estatísticas**: por equipa e unidade: abates, mortes, disparos, acertos, taxa de acerto, descolagens, aterragens, tempo no ar, velocidade máxima, altura e G, distância. Exportação em CSV.
- **Gráficos**: os valores de uma unidade ao longo do tempo, duas unidades comparadas, ou um valor contra outro.

## Muitas partidas de uma vez {#many-matches-at-once}

Para sobrepor centenas ou milhares de partidas, veja [Muitas partidas de uma vez](many-matches.md). Detalhes das figuras (fumo, fogo e outros efeitos temporizados): [Figuras na sobreposição de figuras](figure-replay.md). Lista de funcionalidades do Tacview: [Paridade com o Tacview](tacview-parity.md), uma página filha desta.
