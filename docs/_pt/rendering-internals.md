---
title: "Detalhes da renderização"
nav_order: 22
has_children: true
lang: "pt"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---


# Funcionamento interno do desenho

O visualizador desenha milhões de pontos como manchas luminosas e soma-as. Esta secção explica os truques que mantêm isso rápido e o que significam os números do painel de estatísticas. Leia-a se o visualizador lhe parecer lento, ou se quiser trabalhar no renderizador.

```
dados -> janela temporal -> filtros GPU -> plano de amostragem -> splat -> acumular -> cor -> ecrã
```

Para ver como está a correr o seu computador, olhe para a caixa de estatísticas no canto superior direito da vista: [Painel de desempenho e painel de estatísticas](performance-and-stats.md). Os termos novos (GPU, linha, sprite, mapa de calor) estão no [glossário](glossary.md).

## O problema central {#the-core-problem}

Uma soma de rampas radiais que se sobrepõem custa *N* × π*r*² fragmentos misturados por fotograma. Com 100 milhões de sprites de raio 8 px, isso dá 2 × 10¹⁰ fragmentos - cerca de um segundo de trabalho numa GPU topo de gama. Não se pode forçar isso a cada fotograma, por isso o visualizador combina:

- **linhas ordenadas por tempo** - uma janela temporal são duas pesquisas binárias, e o custo da reprodução segue as linhas da janela, não o conjunto de dados;
- **nada por linha no CPU a cada fotograma** - as linhas vivem na memória da GPU, quantificadas; os filtros, os sinais dos grupos, o teste de tempo de vida, a janela, o recorte e o corte são avaliados no shader de vértices;
- **amostragem estratificada** com pesos compensatórios quando um fotograma não consegue desenhar todas as linhas, e **acumulação progressiva** que converge para a resposta exata de todas as linhas enquanto a vista estiver parada ([Amostragem e orçamentos](sampling-and-budgets.md), [Acumulação](accumulation.md));
- **um acelerador em duas etapas** que troca sprites por fotograma, e depois resolução do calor, por taxa de fotogramas ([Amostragem e orçamentos](sampling-and-budgets.md#the-adaptive-budget));
- **orçamentos de memória impostos**, para que um conjunto de dados que não cabe seja truncado de forma visível em vez de falhar ([Residência na memória da GPU](gpu-memory.md)).

## Um fotograma {#one-frame}

O ciclo de fotogramas é o [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Tudo o que muda à taxa de fotogramas - câmara, cabeça de reprodução, orçamento - vive no motor, não no estado da aplicação; por isso um fotograma não custa trabalho de React. O estado é lido uma vez por fotograma e só é escrito de volta para leituras de baixa frequência.

1. **Há dados novos?** Um novo conjunto de dados é anunciado (*Uploading N rows to the GPU*) num fotograma e carregado no seguinte, para que a mensagem seja pintada antes de o trabalho bloquear a thread. Um novo nível é entregue ao renderizador; as rotas de calor de linha são criadas ou libertadas.
2. **A cabeça de reprodução** avança (limitada a 0,1 s de tempo real por fotograma), dá a volta ou para.
3. **A câmara** lê o teclado, o rato e o comando de jogo; o espelho do eixo é incorporado na matriz de vista; no WebGPU, uma matriz de remapeamento de profundidade converte o intervalo de profundidade estilo OpenGL do three.js para o do WebGPU.
4. **O que está visível**: o intervalo de tempo da linha temporal e do histórico; a tabela de sinais dos grupos (visibilidade apenas sob uma separação por coluna); até quatro filtros - filtros de coluna e a seleção de Entidades; a separação por diferença.
5. **As tabelas de cor e de curvas** são reconstruídas se as suas definições tiverem mudado.
6. **Orçamento**: o controlador adaptativo define o orçamento de sprites deste fotograma e a resolução do calor; com *Desenhar todas as linhas em cada fotograma* o orçamento sobe para cobrir todas as linhas candidatas.
7. **As assinaturas** decidem o que o buffer de acumulação ainda significa: uma mudança em qualquer coisa que altere o que as linhas contribuem ou como (*geometria*), na janela temporal, ou apenas na forma como o resultado é colorido (*composição*). Veja [Acumulação](accumulation.md#what-restarts-it).
8. **Plano de amostragem**: que blocos de linhas desenhar ([Amostragem e orçamentos](sampling-and-budgets.md)).
9. **Modo de acumulação**: repor, estender, média móvel, média corrente ou inativo.
10. **Geometria do replay de caixas** (cubos, rastos) no CPU, só nesse modo e só quando não está inativo.
11. **Desenhar**: o backend desenha a cena (nível, grelha, eixos, caixas, rastos, régua), faz o splat do calor no alvo de calor, funde-o no acumulador e compõe o calor sobre a cena até à tela.
12. **A exposição automática** dispara quando a sua contagem chega a zero; a sonda de calor da régua lê no máximo um píxel a cada 120 ms; as leituras são publicadas.

Um fotograma inativo - convergido, sem nada alterado - salta a cena e o splat, mas continua a **recompor**: uma tela WebGL criada sem `preserveDrawingBuffer` fica com conteúdo indefinido depois de compor, por isso não é seguro confiar que ela continue a mostrar o último fotograma. A cena e os alvos de calor são os framebuffers próprios do visualizador e mantêm o conteúdo, por isso um fotograma inativo custa apenas uma passagem de ecrã inteiro.

## Páginas desta secção {#pages-in-this-section}

- [Os dois backends](backends.md) - WebGPU e WebGL2, como é escolhido um, opções no endereço
- [Acumulação](accumulation.md) - repor, estender, média móvel, média corrente
- [Amostragem e orçamentos](sampling-and-budgets.md) - o amostrador estratificado, o modo exato, o orçamento adaptativo
- [Acumulação em meia precisão](half-float-accumulation.md) - alcance e precisão em alvos de 16 bits
- [Residência na memória da GPU](gpu-memory.md) - armazenamento de linhas quantificado e o orçamento de GPU imposto
- [Deteção de renderização por software](software-rendering.md)
- [Painel de desempenho e painel de estatísticas](performance-and-stats.md)
