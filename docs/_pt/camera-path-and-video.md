---
title: "Percurso da câmara e vídeo"
nav_order: 15
lang: "pt"
source: "camera-path-and-video.md"
source_hash: "1863f90ba4b7"
translated: true
outdated: false
---


# Percurso da câmara e vídeo

Faça um filme dos seus dados: põe a câmara em alguns sítios e o visualizador voa entre eles e guarda um vídeo. Cada fotograma sai muito limpo, sem grão. A câmara e a cabeça de reprodução movem-se em conjunto, por isso o mesmo painel faz um timelapse ([`PathPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/PathPanel.tsx), [`campath.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/campath.ts), [`record.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/record.ts)).

## Fazer um voo {#make-a-flythrough}

1. Voe até onde o filme começa e carregue em **Adicionar fotograma-chave aqui** em **Percurso da câmara e renderização**.
2. Voe até ao sítio seguinte e carregue de novo. Repita para cada paragem.
3. Marque **Pré-visualizar ao longo do percurso** e arraste a **Posição no percurso** para verificar o movimento.
4. Defina a **Duração** (quanto tempo dura o vídeo). Um movimento certo mas rápido demais só precisa de uma duração maior.
5. Carregue em **Renderizar vídeo**. Espere pela linha de progresso; o ficheiro é transferido quando terminar.

![O painel Percurso da câmara e renderização com três fotogramas-chave, interpolação Suave, 12 s, 30 fps e 16 Mbps](../assets/img/en/camera-path-panel.webp)

## Fotogramas-chave {#keyframes}

| Controlo | Efeito |
|---|---|
| **Adicionar fotograma-chave aqui** | Acrescenta a posição atual da câmara, a guinada, a inclinação e o campo de visão como fotograma-chave. |
| **Limpar** | Remove todos os fotogramas-chave. |
| Lista de fotogramas-chave | Uma linha por chave: o seu número (um clique leva a câmara até lá, definindo também o campo de visão), a posição, `guinada° / inclinação°`, e **×** para a remover. |

As chaves são espaçadas **de forma uniforme** ao longo de um eixo normalizado do percurso, de 0 a 1, sempre que uma é acrescentada ou removida; a duração de saída estica então o movimento inteiro, por isso um plano certo mas rápido só precisa de uma duração maior. A guinada é desenrolada entre chaves para que a câmara rode pelo caminho mais curto.

Sem fotogramas-chave, uma renderização mantém a câmara atual parada durante todo o clipe - um timelapse perfeitamente bom.

## Definições do percurso {#path-settings}

| Controlo | Predefinição | Intervalo (cursor) | Significado |
|---|---|---|---|
| **Interpolação** (2+ chaves) | *Suave* | *Suave* / *Reto* | *Suave*: uma curva cúbica de Hermite que passa pelas chaves, com tangentes das chaves vizinhas, para que a velocidade case em cada chave e não haja solavanco onde os segmentos se encontram. *Reto*: linhas retas entre chaves, previsível, com um canto visível em cada chave. O campo de visão é sempre interpolado de forma linear. |
| Linha de percurso (2+ chaves) | | | `N unidades de percurso - M por segundo com esta duração`, ou uma nota de que as chaves estão todas no mesmo sítio. |
| **Pré-visualizar ao longo do percurso** (1+ chaves) | desligado | | Conduz a câmara da vista a partir do percurso, e move a cabeça de reprodução com ela, como faz a renderização, para que o movimento possa ser avaliado antes de renderizar. |
| **Posição no percurso** (durante a pré-visualização) | 0% | 0-100% | Onde no percurso se pré-visualiza. |
| **Duração** | 12 s | 1-120 s (3600) | Comprimento do vídeo. |
| **Fotogramas por segundo** | 30 fps | 6-60 (240) | |
| **Taxa de bits** | 16 Mbps | 1-60 Mbps, logarítmico (400) | Os gradientes de calor criam bandas mal com taxas de bits baixas: há pouco detalhe atrás do qual um codificador possa esconder o erro. |
| **Limite de espera da convergência** | 240 fotogramas | 2-600 (10 000) | O máximo que um fotograma de saída pode esperar para ficar exato. Os fotogramas que atingem o limite são escritos na mesma, e contados. |
| Resumo | | | `N fotogramas · janela: cumulativo/fixa/vida`, e quando a linha temporal está em modo Tudo: *(a renderização passa de Tudo para Reproduzir para que a cabeça de reprodução tenha significado)*. |
| **Renderizar vídeo** / **Cancelar** | | | Inicia a renderização; enquanto corre, mostra `fotograma i / n · esperou w · X MB` e quantos fotogramas não ficaram exatos. Precisa de um conjunto de dados. |

## Dicas {#tips}

- O tamanho de saída é o tamanho da tela em píxeis do dispositivo (a razão de píxeis do ecrã, limitada a 2). Redimensione a janela do navegador para o mudar.
- Um histórico cumulativo vai construindo o calor ao longo do clipe; uma janela ou o tempo de vida mostram uma fatia de tempo que se move.
- As posições dos fotogramas-chave são coordenadas do ecrã: com um [eixo do mundo invertido](camera.md#invert-world-axis), as chaves feitas antes de o mudar apontam para outro sítio depois.

## Para programadores {#for-developers}

### O que faz uma renderização {#what-a-render-does}

1. Tira uma captura de teste do fotograma para saber o tamanho exato de saída em píxeis do dispositivo.
2. Escolhe um codec através do WebCodecs: **VP9** (`vp09.00.10.08`), senão **VP8**, à taxa de bits e à taxa de fotogramas escolhidas. Sem `VideoEncoder` para com *Este navegador não tem VideoEncoder - o WebCodecs é necessário para escrever um vídeo*; sem nenhum dos codecs, *Nenhum codec de vídeo suportado (tentados VP9, VP8)*.
3. Assume as definições de que uma renderização precisa: pausa a reprodução, põe o **orçamento adaptativo desligado**, a **renderização progressiva ligada** e o orçamento de sprites em 64 M por fotograma (o orçamento adaptativo protege a taxa de fotogramas, que é o objetivo errado aqui: leria cada fotograma lento em convergência como razão para desenhar menos linhas, o que exige mais fotogramas para convergir), e passa a linha temporal de **Tudo** para **Reproduzir**. A definição do histórico (cumulativo, janela, vida) fica como está: uma renderização deve ser aquilo que estava a ver, reproduzido e registado.
4. Para cada fotograma de saída *f* de *n*, com *u* = f / (n - 1):
   - põe a câmara na pose do percurso em *u* (se houver chaves);
   - posiciona a cabeça de reprodução na mesma fração *u* do intervalo da linha temporal (a duração da sessão selecionada, na repetição de caixas);
   - força uma nova estimativa, mesmo quando a câmara não se mexeu - herdar a acumulação do fotograma anterior deixaria um fantasma da janela anterior;
   - espera, fotograma a fotograma, até a imagem ficar exata (todas as linhas candidatas desenhadas num só fotograma, ou a acumulação completa), até ao limite de espera;
   - captura o fotograma composto e codifica-o, com um fotograma-chave a cada 2 segundos de saída para que o ficheiro se possa procurar.
5. Junta os fotogramas num ficheiro WebM ([`webm.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webm.ts)) com marcas de tempo escolhidas a partir da taxa de fotogramas - o tempo de relógio que cada fotograma levou é irrelevante.
6. Repõe o orçamento, o campo de visão, o modo da linha temporal, a cabeça de reprodução e se estava a reproduzir.
7. Transfere o vídeo como `3dheat-<largura>x<altura>-<fotogramas>f.webm` e reporta `N fotogramas em L×A, X MB - todos os fotogramas exatos`, ou quantos atingiram o limite de espera.

**Cancelar** para depois do fotograma atual (*Renderização cancelada.*) e repõe as definições.
