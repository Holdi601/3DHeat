---
title: "Os dois motores"
parent: "Detalhes da renderização"
nav_order: 1
lang: "pt"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---


# Os dois backends

Um navegador pode deixar uma página usar a placa gráfica de duas formas, WebGPU (mais recente) e WebGL2. O visualizador pode usar as duas e escolhe ele próprio a melhor, por isso normalmente não tem de fazer nada. Para ver qual está a usar: **Backend** no painel de estatísticas (canto superior direito da vista).

![O painel de estatísticas: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

O visualizador tem dois renderizadores completos por trás de uma única interface ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) e **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Ambos desenham a mesma imagem com os mesmos algoritmos; os shaders existem em WGSL e em GLSL ES 3.00, lado a lado. A primeira linha do painel de estatísticas, **Backend**, diz qual está a correr; se passar o rato por cima, mostra porque é que o WebGPU não foi usado, quando não o foi.

## Para programadores {#for-developers}

### Como é escolhido {#how-one-is-chosen}

Uma tela só pode ter um tipo de contexto, por isso a escolha é feita uma vez, antes de qualquer desenho ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Salvo se o WebGL2 for forçado: se `navigator.gpu` existir, pede-se um adaptador com `powerPreference: 'high-performance'` e um dispositivo, e cria-se o renderizador WebGPU. Qualquer falha fica registada como motivo.
2. Se o WebGPU foi forçado e falhou, pare: a vista mostra *Cannot initialise the renderer.* com o motivo.
3. Caso contrário, cria-se o renderizador WebGL2 (também a pedir o adaptador de alto desempenho). Se o WebGL2 não estiver disponível, ou não conseguir desenhar em texturas de vírgula flutuante (`EXT_color_buffer_float`), a vista mostra o erro.

É o `powerPreference: 'high-performance'` que impede um portátil com gráficos comutáveis de dar à página a sua GPU integrada. Para além disso, a página não tem voto: a aceleração por hardware é uma definição do navegador.

### Opções no endereço {#url-switches}

Acrescente ao endereço da página, por exemplo `http://127.0.0.1:5273/?backend=webgl2`.

| Parâmetro | Efeito |
|---|---|
| `?backend=webgpu` | Usa WebGPU ou falha. |
| `?backend=webgl2` | Usa WebGL2 mesmo onde o WebGPU está disponível - separa "isto desenha mal" de "isto desenha mal em WebGPU". |
| `?heat=f16` | Força o caminho de acumulação do calor em 16 bits em qualquer dos backends ([Acumulação em meia precisão](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: lê os erros de GL durante o fotograma e expõe-nos em `renderer.heatDebug`. Desligado por omissão, porque `getError` é um ponto de sincronização do pipeline. |
| `?occdebug=<n>` | Auxiliar para programadores em WebGL2: substitui o calor pelos valores de depuração de oclusão. Não é para uso normal. |

### Diferenças que importam {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Armazenamento das linhas | Buffers de armazenamento: o índice de uma linha é um índice de array. Pede o maior tamanho de ligação de buffer de armazenamento e os tamanhos dos buffers do adaptador. | Texturas inteiras (8 192 texels de largura) endereçadas a partir de `gl_VertexID` através de uma textura de índices de bloco por fotograma. |
| Acumulação do calor em 32 bits | Quando o adaptador oferece `float32-blendable` e `float32-filterable` | Quando `EXT_float_blend` está presente |
| Caso contrário | 16 bits (`r16float`) | 16 bits (`R16F`) |
| Alcance da profundidade | [0, 1]; o motor pré-multiplica uma remapeação das matrizes [-1, 1] do three.js. Sem ela, uma projeção paralela - cuja profundidade é linear - cairia quase toda abaixo de 0 e seria recortada em silêncio. | [-1, 1], usado tal como está |
| Uniformes | Um anel de slots alinhados a 256 bytes, um por desenho, ligados por deslocamento - `queue.writeBuffer` é ordenado na fila, por isso reescrever um só buffer por desenho faria cada desenho ler a última escrita. O bloco de uniformes da passagem de calor é exatamente um slot de 256 bytes. | Uniformes normais |
| Alvo do calor abaixo da resolução da tela | Recebe a sua própria textura de profundidade (todos os anexos de uma passagem têm de ter o mesmo tamanho) | |
| Captura do fotograma | `captureFrame()` volta a renderizar a composição para um alvo fora de ecrã e lê-o (o Chromium sem interface desenha WebGPU mas nunca compõe a sua tela) | Lê de volta o framebuffer predefinido no próximo fotograma renderizado |
| Leitura | Buffers de preparação mantidos e reutilizados; um leitor em voo de cada vez | `readPixels`, perguntando ao driver qual o par formato/tipo legal |

Os dois backends enviam a tabela de curvas dos sprites como meias precisões; o `queue.writeTexture` do WebGPU copia bytes brutos, por isso os dados são primeiro codificados em binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limites das texturas {#texture-limits}

Um `texStorage2D` acima de `MAX_TEXTURE_SIZE` não lança erro: a alocação é descartada, os envios seguintes falham e a amostragem devolve zero. O auxiliar WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) verifica as duas dimensões contra o limite e lança um erro com o tamanho; a textura de índices de bloco é bidimensional (4 096 de largura), por isso não pode ultrapassar um limite; e `src/render/limits.test.ts` fixa todas as dimensões das texturas contra os limites que vale a pena suportar. O renderizador WebGL2 também recusa um dispositivo cujo tamanho máximo de textura seja inferior aos 8 192 de largura da textura de linhas.

### Testar os dois {#testing-both}

`npm run smoke` executa a app real no Chromium sem interface em WebGL2 (por omissão `http://127.0.0.1:5273/`); passe `"http://127.0.0.1:5273/?backend=webgpu"` a `node tools/smoke.mjs` para WebGPU, e `npm run smoke:f16` para o caminho de meia precisão. `tools/probe-webgpu.mjs` e `tools/probe-present.mjs` (listados como ferramentas de programador em [Ferramentas de linha de comandos](ref-tools.md)) diagnosticam a disponibilidade do adaptador e da apresentação em navegadores sem interface.
