---
title: "Câmara e controlos"
nav_order: 14
has_children: true
lang: "pt"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Câmara e controlos

Voa pela cena como um pássaro: **W A S D** para se mover, arraste o rato para olhar. Use esta página para voar, para saltar para uma vista de cima ou de lado, e para ler exatamente onde está a câmara.

## Voar em 4 passos {#fly-in-4-steps}

1. Clique uma vez na vista para ela ter o teclado.
2. Mantenha **W** para voar para a frente, **S** para trás, **A** e **D** para os lados, **Espaço** para cima, **Q** para baixo.
3. Mantenha o botão esquerdo ou o direito do rato carregado e arraste para olhar à volta.
4. Carregue em **F** para enquadrar de novo todos os dados.

A câmara é uma câmara livre de voo com uma projeção em perspetiva e uma projeção paralela, vistas predefinidas, uma pose escrita, e profundidade de campo. As suas definições estão no painel **Câmara e cena**, no fundo da barra lateral (também mostrado nos separadores Análise de corrida e Partida). A implementação é [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Voar {#flying}

| Entrada | Efeito |
|---|---|
| `W` `A` `S` `D` ou as setas | Para a frente (ao longo da vista, incluindo a sua inclinação), esquerda, trás, direita |
| `Espaço` ou `E` | Para cima (cima do mundo) |
| `Q` ou `Ctrl` esquerdo | Para baixo |
| `Shift` (mantido) | 6× mais depressa |
| `Alt` esquerdo (mantido) | 15% da velocidade |
| Arrastar com o botão esquerdo ou direito do rato | Olhar à volta. O ponteiro fica bloqueado enquanto arrasta. |
| Roda do rato | Velocidade de voo ×1,5 por cada clique (perspetiva); zoom (paralela) |
| `F` | Enquadrar os dados |
| Clicar (sem arrastar) | Mostrar o que está debaixo do ponteiro ([Inspecionar a vista](#inspecting-the-view)) |
| `C` | Copiar a posição da câmara, a guinada e a inclinação |
| `G` | Ir para um ponto escrito |
| `Esc` | Fechar o cartão de seleção (e deixar de seguir uma unidade) |

### Enquanto segue uma unidade {#while-following-a-unit}

Quando a câmara segue uma unidade numa repetição ([Repetição da partida](match-replay.md)), as teclas de voo fazem outra coisa:

| Entrada | Efeito |
|---|---|
| Roda, `W` / `S` | Mais perto da unidade / mais longe (mais alto / mais baixo na vista de satélite) |
| `A` / `D`, `Q` / `E` | Orbitar à volta da unidade (vistas de perseguição e de órbita) |
| Arrastar | Olhar à volta da unidade (cabina: olhar à volta por dentro) |
| `V` / `Shift+V` | Vista de câmara seguinte / anterior |
| `Esc` | Deixa primeiro de olhar para a segunda unidade, depois deixa de seguir |

As teclas de movimento somam-se com um [comando de jogos](gamepad.md); veja a [referência do teclado](keyboard-reference.md) para tudo o resto. As teclas são ignoradas enquanto uma caixa de texto ou uma lista pendente tiver o foco. A inclinação fica limitada um pouco antes de ficar totalmente para cima e para baixo.

## Painel Câmara e cena {#camera--scene-panel}

![O painel Câmara e cena: Projeção, Vistas predefinidas, botões de Campo de visão, Velocidade de voo e Pose](../assets/img/en/camera-panel.webp)

### Projeção {#projection}

**Projeção**: *Perspetiva* (predefinida) ou *Paralela*.

A *paralela* (ortográfica) elimina o encurtamento, por isso dois pontos quentes de densidade igual se leem com o mesmo tamanho em qualquer parte do enquadramento - a comparação que um mapa de calor existe para apoiar - e é isso que torna uma vista isométrica isométrica. No modo paralelo a roda do rato faz zoom (não há movimento para a frente que mude a escala) e a [indicação de velocidade](#fly-speed) fica escondida.

**Mudar mantém o objeto com o mesmo tamanho.** Uma projeção paralela não tem campo de visão, por isso a altura do seu tronco não tem relação com a distância da câmara; mudar sem cuidado ou faz zoom exagerado ou não mostra nada. Ao passar para paralela, a altura do tronco fica igual ao que a câmara em perspetiva cobre à distância de foco (2 × distância × tan(fov / 2), sendo a distância de foco a distância do último enquadramento). Ao voltar, restaura-se a pose em perspetiva que deixou, à mesma escala aparente, em vez de onde a vista paralela tinha andado.

### Vistas predefinidas {#preset-views}

| Grupo | Botões | Orientação |
|---|---|---|
| **Isométrica** | **NE**, **NO**, **SE**, **SO** | Paralela, inclinação -35,264° (= atan(1/√2), o ângulo em que os três eixos se projetam com o mesmo comprimento), guinada -45°, 45°, -135°, 135°. Quatro cantos, porque um só esconde sempre metade do mapa atrás do que está mais perto. |
| **Alçados** | **Cima**, **Baixo**, **Frente**, **Trás**, **Esquerda**, **Direita** | Paralela. Cima olha diretamente para baixo (inclinação -89,9°), Baixo diretamente para cima, Frente ao longo de -Z (guinada 0°), Trás ao longo de +Z (180°), Esquerda ao longo de -X (-90°), Direita ao longo de +X (90°). |
| | **Voltar à perspetiva** | Volta à pose em perspetiva que deixou. Desativado em perspetiva. |
| | **Vista a três quartos** | Perspetiva, guinada -35°, inclinação -28°. |

Cada predefinição muda a própria projeção - em perspetiva, uma «vista de cima» ainda converge para um ponto de fuga e as áreas iguais deixam de se ler como iguais - e enquadra os dados a partir dessa direção.

### Campo de visão {#field-of-view}

**Campo de visão** - o ângulo vertical. Predefinido 65°, 10-140° na barra (179° com a pega), com os botões **Plano 20°**, **Longo 35°**, **Normal 50°**, **Largo 65°**, **Muito largo 90°**. Estreito aplana a perspetiva e lê-se mais como uma projeção paralela; largo exagera a profundidade e torna as distâncias difíceis de julgar. Fica ativo no modo paralelo, onde define a escala que a mudança de volta resolve e a distância que usa o **Enquadrar**.

### Velocidade de voo {#fly-speed}

**Velocidade de voo** - unidades do mundo (metros) por segundo com o acelerador a fundo. Predefinida 120; em cada carregamento, a extensão horizontal dos dados / 12. Logarítmica, 0,02-20.000 (200.000 com a pega; a pega muda-a por razões, não por quantidades). A roda do rato multiplica ou divide-a por 1,5 por clique, dentro de 0,02-200.000.

O mesmo valor aparece no canto inferior direito da vista (só em perspetiva): a velocidade em m/s ou km/s e o tempo que demora a atravessar os dados (ou o nível, quando há um nível 3D carregado) a essa velocidade. Arraste-o para cima ou para baixo para mudar a velocidade.

### Perto e longe {#near-and-far}

As distâncias de corte **Perto** (predefinida 0,5) e **Longe** (predefinida 40.000). Ambas são recalculadas a partir dos dados em cada carregamento (perto = max(0,05; extensão / 20.000), longe = extensão × 12) e alargadas, nunca estreitadas, por um nível 3D que seja maior ([Níveis](levels.md#what-a-level-does-for-the-heat)). A sua razão define a precisão de profundidade de que a oclusão depende, por isso um perto minúsculo com um longe enorme enfraquece a [oclusão](depth-and-culling.md). Vista de fora da cena ou de muito alto sobre o seu chão, o plano próximo usado recua para 2% dessa distância, para que um mapa visto de muito alto mantenha precisão de profundidade suficiente para que a água e a costa não tremam; a caixa continua a mostrar o valor definido.

### Outros controlos {#other-controls}

| Controlo | Predefinição | Significado |
|---|---|---|
| **Inverter Y** | desligado | Inverte o olhar do rato para cima/baixo. |
| **Profundidade de campo** | desligado | Ver abaixo. |
| **Comando** | ativado | Ver [Comando e HOTAS](gamepad.md). |
| **Pose** | | Ver abaixo. |
| **Inspecionar** | | A leitura da câmara, a seleção ao clicar, a convenção da guinada e *Ir para um ponto*; ver [Inspecionar a vista](#inspecting-the-view). |
| **Enquadrar dados (F)** | | Ajusta os dados (no separador Análise de corrida: as voltas) à vista, mantendo a direção atual. A câmara fica a r / tan(fov / 2) do centro, sendo r metade da diagonal dos limites dos dados. |
| **Grelha**, **Eixos** | ligado, ligado | Uma grelha no chão com um espaçamento 1/2/5 × 10ⁿ de cerca de 1/40 da extensão dos dados (estendendo-se até 1,5 × os dados, entre 8 e 120 passos da grelha), e eixos coloridos. |
| **Inverter eixo do mundo** X, Y, Z | desligado | Ver abaixo. |

### Pose {#pose}

Cinco caixas numéricas - **X**, **Y**, **Z** e **guinada °**, **inclinação °** - que seguem a câmara enquanto nenhuma delas tem o foco. Escreva um valor e carregue em `Enter` (ou saia da caixa) para mover a câmara para lá. **copiar** coloca `pos X Y Z · guinada A · inclinação B` na área de transferência (com `(guinada do jogo)` a seguir quando essa convenção está escolhida). Voar é como se explora; as coordenadas são como se reproduz uma vista. São os mesmos números da [leitura da câmara](#camera-readout): as próprias coordenadas dos dados, incluindo quando um eixo está invertido, e a guinada na [convenção](#yaw-conventions) escolhida.

### Inverter eixo do mundo {#invert-world-axis}

**Inverter eixo do mundo X / Y / Z** desenha o mundo com esse eixo invertido. Um jogo que mantém um mundo de mão esquerda sai espelhado neste visualizador direito - curvas à direita desenhadas como curvas à esquerda - e inverter X ou Z repõe. **Só muda o desenho**: os dados, a análise e cada coordenada que as ferramentas mostram (pose, régua, fatia) continuam a ser os do próprio jogo. A vista inverte-se no lugar, mantendo-o a olhar para o mesmo sítio. Esta definição fica guardada no navegador (chave `localStorage` `heat3d.mirror`); compare com as [inversões](axes-units-and-time.md#flips) ao carregar, que mudam os dados.

## Inspecionar a vista {#inspecting-the-view}

Onde está a câmara, o que está debaixo do ponteiro, e ir para um ponto - o bloco **Inspecionar** do painel Câmara e cena, e duas sobreposições no canto superior esquerdo da vista. O código está em [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) e [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Controlo | Predefinição | Significado |
|---|---|---|
| **Posição da câmara sobre a vista** | ligado | A leitura da câmara, abaixo. Também fecha com o seu **×**. |
| **Clicar mostra o que lá está** | ligado | Seleção ao clicar, abaixo. |
| **Convenção da guinada** | Visualizador | Qual a guinada que a leitura, as caixas de pose e a caixa de salto mostram e leem. |

Estas três ficam guardadas no navegador (chave `localStorage` `heat3d.inspect`).

### Leitura da câmara {#camera-readout}

No canto superior esquerdo da vista: o **x**, o **y**, o **z**, a **guinada** e a **inclinação** da câmara, em direto, com uma etiqueta a indicar a convenção da guinada. Mostra os mesmos números das caixas de [Pose](#pose) e não custa nada ao voar (é escrito na página no relógio dos fotogramas, sem voltar a desenhar os painéis).

- **copiar** (ou `C` em qualquer lado fora de uma caixa de texto) coloca `x X y Y z Z guinada A inclinação B (guinada do visualizador)` na área de transferência, com decimais `.` seja qual for o idioma - uma linha que a caixa de salto, e qualquer script, lê de volta.
- **ir para** (ou `G`) abre uma caixa por baixo: cole um ponto e carregue em `Enter` para o ver, ou cole uma pose inteira copiada para ficar nessa vista. `Esc` fecha a caixa.

### Coordenadas: o referencial próprio dos dados {#coordinates-the-datas-own-frame}

Cada coordenada que as ferramentas de inspeção mostram ou aceitam está no **referencial próprio dos dados carregados**: o [mapeamento dos eixos](axes-units-and-time.md) do carregamento (eixo para cima, inversões, escala) é desfeito. Uma posição lida na vista é o número que a tabela de origem tem, e um número da tabela escrito na caixa de salto cai nesse ponto. Quando o mapeamento não muda nada (um carregamento com Y para cima e sem escala - que é o que as ferramentas de captura e os exportadores de níveis escrevem), isto é simplesmente o mundo; caso contrário, a leitura tem uma etiqueta de **referencial dos dados**. Sem um conjunto de dados, as coordenadas são as do mundo. A guinada e a inclinação são sempre em relação ao mundo do visualizador, com Y para cima.

### Convenções da guinada {#yaw-conventions}

| Convenção | A guinada 0° olha ao longo de | Cresce na direção de | Usada por |
|---|---|---|---|
| **Visualizador** | -Z | -X | a câmara de voo, [vistas predefinidas](#preset-views) |
| **Jogo / ferramentas de captura** | +X | -Z | as colunas `yaw` e as poses das ferramentas de captura; num nível exportado no referencial do visualizador, a guinada própria do jogo |

A inclinação é a mesma nas duas: para cima a partir da horizontal. As duas diferem de um quarto de volta e de mais nada:

> guinada do visualizador = guinada do jogo - 90°

Uma direção `d` é `(cos p · cos y, sin p, -cos p · sin y)` na convenção do jogo e `(-sin y · cos p, sin p, -cos y · cos p)` na do visualizador. Escolha **Jogo / ferramentas de captura** para escrever uma guinada diretamente de uma tabela de captura, ou para comparar a leitura com uma delas.

### Ir para um ponto {#going-to-a-point}

**Ir para um ponto**, no bloco Inspecionar (e na caixa **ir para** da leitura):

- a caixa de texto aceita `x, y, z` ou `x y z` (ou `x; y; z`), com ponto decimal ou vírgula decimal - `-321.6, 137.8, -59.9` e `-321,6 137,8 -59,9` são o mesmo ponto. Cinco números acrescentam uma guinada e uma inclinação, e uma pose copiada da leitura ou das caixas de pose é lida inteira, com etiquetas e convenção incluídas;
- **guinada °** e **inclinação °** (opcionais) rodam a câmara, na convenção escolhida;
- **Olhar para** mantém a direção (inclinada para baixo pelo menos 20° se estava a olhar nivelada) e recua ao longo dela até à distância atual, mantida entre 0,3% e 3% da largura da cena - 6 a 60 m num nível de dois quilómetros. A distância de foco, a altura da vista paralela e a velocidade de voo acompanham, para que a vista chegue utilizável;
- **Ficar aqui** põe a câmara no ponto, virada para a guinada e a inclinação indicadas, ou como estava.

Uma pose colada com a sua própria guinada e inclinação fica sempre nessa vista.

### Seleção ao clicar {#click-to-pick}

Um clique na vista - carregar e largar sem arrastar mais de 4 pixels; um arrasto continua a olhar à volta - mostra um cartão no canto superior esquerdo com o que está debaixo do ponteiro. Enquanto a [régua](measure.md) estiver ligada, os cliques vão para a régua.

**Um ponto de dados desenhado ganha.** A amostra mais próxima a menos de 8 pixels do clique, das que estão efetivamente desenhadas: as linhas na janela de tempo e no tempo de vida, que passam os [filtros](filters.md), os grupos mostrados e a divisão de diferença, dentro do corte por distância e de uma fatia que recorta o calor. Na repetição em caixas, uma caixa debaixo do ponteiro (em qualquer ponto dela). O cartão lista cada coluna que a linha traz, com os nomes de colunas da própria origem - tempo (hora de relógio, ou os segundos do próprio ficheiro com `m:ss.ss`), pessoa, grupo, sessão, cada coluna retida, a posição e a direção do olhar - e a distância à câmara. Só as colunas que o carregamento manteve estão em memória: uma coluna não escolhida como [coluna de filtro](column-mapping.md) não aparece.

**Caso contrário, a superfície do nível**: o ponto onde o raio do clique encontra os triângulos reais do nível (não o plano de referência da régua), com a **parte** a que pertence (o nome dado pelo exportador, `structure:props`, `ground:terrain …`), o seu **tipo** (chão, estrutura, água, imagem de mapa), as coordenadas e a distância. A geometria escondida por uma fatia ou pelo corte por distância é atravessada. Quando o nível tem uma [malha de navegação](model-levels.md#navigation-meshes), uma linha indica-a e diz se o ponto está sobre ela (✓). Um nome de parte com o prefixo `≈` foi adivinhado a partir das caixas envolventes das partes, porque essa parte do nível foi simplificada ao carregar.

O cartão fica até ser fechado (**×**, `Esc`), outro clique responde a outra coisa, ou um clique no espaço vazio. Uma cruz ciano é desenhada no ponto da cena e um anel por cima no ecrã. Os seus botões: **copiar** (todos os valores, e as coordenadas como `x, y, z`), **Olhar para**, e **Ficar aqui** (num ponto de dados, a olhar como a linha olhava quando tem uma direção do olhar; numa superfície, 1,7 m acima dela).

O nível fica indexado para a seleção no primeiro clique que a precisa: uma grelha de colunas sobre a sua área, construída poucos milissegundos de cada vez entre fotogramas para que a vista nunca pare (cerca de um segundo de trabalho para um nível de vários milhões de triângulos), e mantida até o nível mudar. Até lá, o cartão diz *A preparar o nível para a seleção* com uma percentagem, e responde ao clique quando estiver pronto. A procura de um ponto de dados sobre mais de quatro milhões de linhas desenhadas é distribuída por fotogramas da mesma forma.

## Profundidade de campo {#depth-of-field}

Uma secção recolhível em Câmara e cena, com o título *Profundidade de campo - ligada* enquanto estiver ativa. Desligada por predefinição: é um efeito de apresentação, e a vista predefinida deve mostrar os dados e não uma interpretação deles.

| Controlo | Predefinição | Intervalo (roda) | Significado |
|---|---|---|---|
| **Ativada** | desligado | | |
| **Focar o que foi enquadrado** | ligado | | Foco à distância que usou o último enquadramento (*Focado a N m.*). |
| **Distância de focagem** | 1000 | 1-200.000, logarítmica (10.000.000) | Mostrada quando o foco é manual. |
| **Abertura** | ±35% | ±2% a ±200%, logarítmica (±3200%) | A profundidade mantida nítida, como fração da distância de focagem - relativa e não um número f, porque as cenas vão desde uma sala até um mapa de oito quilómetros. |
| **Desfocagem máxima** | 12 px | 1-48 (256) | O maior raio de desfocagem; o custo cresce com ele. |

Desfoca o **nível, a grelha e as caixas** - *não o calor*. O calor num pixel é a soma de sprites a muitas profundidades, por isso não tem uma única profundidade para estar desfocado; desfocá-lo pela geometria que está atrás seria errado onde flutua à frente. Dados nítidos sobre um contexto suavizado também é o mais útil dos dois. A desfocagem é uma recolha de 24 pontos de ângulo dourado, na passagem de composição, ponderada para que um primeiro plano nítido não seja arrastado para fora pelo fundo desfocado atrás dele. Mudar esta definição redesenha sem reiniciar a acumulação do calor.

## Resolução da tela {#canvas-resolution}

A tela é desenhada à razão de pixels do ecrã, limitada a 2. O buffer do calor pode ser desenhado a uma resolução mais baixa do que essa ([Resolução do calor](performance-and-stats.md)).

## Páginas desta secção {#pages-in-this-section}

- [Comando e HOTAS](gamepad.md)
- [Referência de teclado e rato](keyboard-reference.md)
