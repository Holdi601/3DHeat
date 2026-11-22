---
title: "Níveis 3D"
parent: "Níveis e geometria de fundo"
nav_order: 2
lang: "pt"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# Níveis 3D

Um nível 3D é um modelo do lugar - colinas, ruas, edifícios - onde os seus dados ficam. Permite ver em que piso, colina ou telhado está o calor. O visualizador divide-o em terreno (sólido), estruturas (transparentes, para poder ver o interior) e água.

## Carregar um nível 3D {#load-a-3d-level}

1. Carregue primeiro os seus dados ([Carregar dados](getting-data-in.md)). O modelo tem de usar o mesmo espaço do mundo e a mesma unidade que os dados, com Y para cima.
2. Em **Fundo / nível**, escolha um **Objetivo de simplificação**. Deixe em *Completo - sem simplificação*, a menos que o modelo seja enorme.
3. Carregue em **Modelo 3D…** e escolha um ficheiro `.glb`, `.gltf`, `.obj`, `.stl` ou `.ply`.
4. Espere pela linha de progresso. **Cancelar** para.
5. Carregue em **F** na vista. O terreno é sólido, as estruturas são cascas transparentes, a água é plana.
6. Ajuste o aspeto em [Aspeto do nível](level-appearance.md). Carregue em **Guardar na biblioteca** para guardar o resultado ([Biblioteca de níveis](level-library.md)).

![Um nível 3D carregado: terreno opaco com curvas de nível, edifícios transparentes, água plana](../assets/img/en/model-levels-loaded.webp)

**Modelo 3D…** carrega a malha do nível. É analisada, classificada e simplificada num trabalhador de fundo ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) com uma linha de progresso e **Cancelar**: *A ler o modelo*, *A analisar o ficheiro*, *A empacotar N texturas*, *A classificar N partes*, *A simplificar o terreno (N triângulos)*, *A simplificar as estruturas (N triângulos)*, *A construir a malha de arame*.

## Formatos {#formats}

| Formato | O que é lido | Limites |
|---|---|---|
| `.glb` | Cada primitiva de malha com `mode` 4 (triângulos) ou sem modo, com a transformação de mundo de cada nó aplicada; `POSITION`; `COLOR_0` (vec3 ou vec4) como cor do vértice; a `baseColorTexture` do material e o seu `TEXCOORD_n` como textura; os nomes de nós e de malhas como nomes de partes. | Linhas e pontos são ignorados. |
| `.gltf` | O mesmo. | Só com buffers incorporados: um glTF que referencia um `.bin` externo é recusado com *Exporte como um único .glb para a geometria ficar incorporada.* |
| `.obj` | Faces, com os blocos `o` e `g` como partes. | Só geometria (sem materiais). |
| `.stl` | Binário e ASCII (`solid …`). | Uma parte. |
| `.ply` | Só ASCII. | PLY binário é recusado com *Converta para .glb ou .stl binário.* |

Só geometria: posições, normais e triângulos soldados num só buffer, mais cores e coordenadas de textura quando existem ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Um modelo sem triângulos é recusado. O modelo tem de estar no mesmo espaço do mundo e na mesma unidade que os dados (Y para cima): nada é transformado para encaixar.

## Terreno, estruturas e água {#ground-structures-and-water}

Um nível é dividido em três classes na importação, porque pedem tratamentos opostos ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Terrestres** (terreno) - desenhados opacos e sombreados com pistas de relevo (declive, curvas de nível, uma rampa de altitude) para que a posição se possa ler contra eles.
- **Estruturas** - edifícios e adereços ficam entre a câmara e o calor no seu interior, por isso são desenhados como uma **casca transparente** (faces ténues com um rebordo brilhante, mais arestas sem duplicados) - ou, quando têm textura, sólidos nas suas texturas.
- **Água** - plana, sem pistas de terreno: uma curva de nível atravessando um lago não faz sentido.

Cada parte (nó do glTF, objeto OBJ ou grupo) é classificada por si, pela primeira regra que se aplica:

1. **A etiqueta do exportador.** Um nome que começa por `ground:`, `structure:` ou `water:` (ou com `|` em vez de `:`) é aceite tal como está. Os exportadores do próprio projeto etiquetam cada parte desta forma.
2. **Nomes de água.** `water` como palavra (não *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Nomes de terreno.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Nomes de estruturas.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Uma parte que cobre mais de 25% da área X-Z do mapa, com mais de 60% da área dos seus triângulos virada para cima, é terreno. Uma parte com menos de 45% virada para cima, ou mais alta do que 15% da altura do nível mas a cobrir menos de 10% da sua área, é uma estrutura. A parte virada para cima é ponderada pela área, para que uma casa não seja considerada plana por ter um telhado.
6. **Senão terreno** - uma parte ambígua fica por predefinição como terreno, porque uma predefinição de casca quase invisível faria o nível parecer uma falha de renderização.

Um modelo que é uma só parte classificada como estrutura passa a terreno (*malha única sem nome - tratada como terreno*).

### Malhas de navegação {#navigation-meshes}

Uma parte chamada `nav:…` (o `nav:walkable` de um exportador de níveis) é uma malha de navegação: onde um soldado pode ficar de pé. Aparece como terreno (*malha de navegação - não desenhada, pois fica sobre o chão; os cliques continuam a encontrá-la*), mas **não é desenhada**. Fica assente sobre o terreno de onde foi gerada, coplanar com ele a centímetros, e desenhada como terreno as duas superfícies disputavam cada pixel: num nível com uma textura de terreno cozida, toda a área jogável aparecia como manchas cinzentas e bege de bordas duras, uma por triângulo de navegação. É mantida, sem simplificação, para que [seleção ao clicar](camera.md#click-to-pick) possa dizer se um ponto é percorrível. As entradas da biblioteca não a guardam.

**Mostrar classificação das partes (N)** no painel (mostrado para modelos com mais de uma parte) lista cada parte com a sua classe e a razão - *etiquetada pelo exportador*, *o nome corresponde ao padrão*, *cobre X% do mapa, Y% virada para cima*, *Y% virada para cima, Z% da altura do nível*, *ambígua - tratada como terreno*. Para mudar uma, renomeie a parte no modelo de origem e importe de novo; a divisão fica gravada nos buffers de índices.

## Simplificação {#simplification}

**Objetivo de simplificação** define o orçamento de triângulos para a próxima importação ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Definição | Triângulos |
|---|---|
| *Completo - sem simplificação* (predefinição) | todos |
| *Alto - 8M triângulos* | 8.000.000 |
| *Médio - 3M triângulos* | 3.000.000 |
| *Baixo - 800 mil triângulos* | 800.000 |
| *Silhueta - 100 mil triângulos* | 100.000 |

O orçamento é dividido **60% para as estruturas e 40% para o terreno**, simplificados em separado - as estruturas perdem a forma mais depressa com a decimação. A água não é simplificada. A simplificação é colapso de arestas com métricas de erro quádricas ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), depois de soldar vértices coincidentes, para que as silhuetas e as arestas duras sobrevivam. A nota de importação indica `origem → triângulos agora, desvio X%`, a divisão terreno / estruturas / água pelas partes, e - quando se usou *Completo* num modelo acima de 8M triângulos - sugere *Alto* (até 30M) ou *Médio* (acima). Sem WebAssembly o simplificador não está disponível e a importação diz isso.

Os níveis dos exportadores do próprio projeto já têm orçamento; o objetivo existe para arte em bruto sem orçamento por trás.

## Texturas {#textures}

Um `.glb` cujas partes trazem texturas de cor base é desenhado com elas - uma exportação de um circuito de corridas, por exemplo, traz uma por cada mosaico de terreno e uma por cada modelo colocado.

A textura do terreno é mostrada por predefinição quando existe; as estruturas que trazem texturas começam **sólidas, nas suas próprias texturas** (lancis, guard-rails, muros de pneus e placas são as bordas de uma estrada, não edifícios para ver por dentro), com a malha de arame desligada e a sombra plana desligada. Ver [Aspeto do nível](level-appearance.md).

## Níveis grandes {#large-levels}

- Acima de **300.000** triângulos de estrutura, as arestas das estruturas começam desligadas e a opacidade das faces a 35%: com uma aresta em cada pixel o bairro lê-se como branco liso.
- O plano longínquo da câmara alarga-se para caber o nível ([Níveis](levels.md#what-a-level-does-for-the-heat)).

## Para programadores {#for-developers}

### Atlas de texturas {#texture-atlas}

Cada textura é empacotada num **atlas** no trabalhador de importação ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), por isso o nível continua a ser uma só desenhada, um só amostrador e um só atributo de coordenadas de textura em ambos os motores:

- empacotado em prateleiras, com o tamanho próprio de cada imagem, reduzido só se o conjunto não couber em **8192 px** em qualquer dos sentidos (o limite de tamanho de textura predefinido do WebGPU);
- uma **margem de 16 pixels** à volta de cada imagem, e só os 5 níveis de mip que essa margem protege, para que um sinal distante nunca amostre a textura do vizinho;
- **as texturas repetidas continuam a repetir-se.** Uma imagem cujo amostrador glTF repete (o predefinido do glTF) e cujas coordenadas de textura saem de 0..1 - uma parede de tijolo cujo UV vai de 0 a 40 ao longo dela - torna-se um *mosaico*: os seus vértices mantêm as próprias coordenadas e um número de mosaico de 16 bits, e os shaders enrolam a coordenada no retângulo do mosaico pixel a pixel, tirando o nível de mip da coordenada não enrolada para que as junções não se vejam. A margem de um mosaico contém a sua própria aresta oposta. Um eixo cujo amostrador fixa é fixado; uma imagem cujas coordenadas ficam dentro de 0..1 é desenhada como antes. Um nível com mosaicos custa mais 4 bytes por vértice.

### O contrato do exportador {#the-exporter-contract}

O que o visualizador precisa de um nível, seja qual for quem o fez:

- um `.glb` autónomo;
- `POSITION` em float32, primitivas de triângulos;
- nomes de nós `ground:*`, `structure:*` e `water:*` (qualquer outro é classificado pelas regras acima), e `nav:*` para uma malha de navegação, que é mantida mas não desenhada;
- coordenadas do espaço do mundo, **Y para cima**, na mesma unidade da telemetria, para que os dados fiquem no nível sem nenhum passo de colocação.
