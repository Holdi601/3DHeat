---
title: "Acumulação"
parent: "Detalhes da renderização"
nav_order: 2
lang: "pt"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---


# Acumulação

Quando o visualizador não consegue desenhar todos os pontos num só fotograma, desenha uma parte deles, depois outra parte, e soma as imagens enquanto se mantém parado. A imagem fica mais nítida, como uma fotografia a revelar-se. Mover a câmara recomeça tudo. A linha **Cobertura** da sobreposição de estatísticas mostra até onde chegou.

![A sobreposição de estatísticas: a Cobertura mostra uma percentagem enquanto a imagem se revela e *exata* quando fica completa](../assets/img/en/performance-stats-overlay.webp)

## Para programadores {#for-developers}

Quando um fotograma não consegue desenhar todas as linhas, desenha uma amostra e pondera-a; a imagem é então uma estimativa não enviesada mas ruidosa. A **acumulação** junta fotogramas sucessivos para que a estimativa convirja para a resposta exata enquanto nada muda. Cada fotograma escolhe um de cinco modos ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); o último usado fica em `engine.live.accumMode`.

| Modo | Quando | O que acontece ao acumulador |
|---|---|---|
| **reset** | a câmara mudou, algo que altera o campo mudou, a renderização progressiva está desligada, começa uma janela crescente (primeiro fotograma da reprodução, depois de um salto), ou o calor em linhas reproduzido mudou | Substituído pela estimativa deste fotograma. |
| **extend** | uma janela **Cumulativo** que só cresceu desde o último fotograma | Este fotograma desenha só as linhas que acabaram de ficar visíveis, com peso total, e soma-as. Nada decai. |
| **ema** | uma janela deslizante (**Janela**, **Tempo de vida**) mudou | `acc = acc × (1 - 0,34) + frame × 0,34` - uma média móvel exponencial de cerca de três fotogramas. |
| **mean** | nada mudou e a estimativa não está completa | `acc = acc × (1 - 1/n) + frame × 1/n` no *n*.º fotograma: uma média corrente. |
| **skip** (parado) | convergiu e nada mudou | Nada é desenhado; o fotograma só volta a compor a imagem. |

### Porque cada um {#why-each}

- **Média corrente, não soma.** Escalar o buffer por 1 - 1/n e somar 1/n do novo fotograma é algebricamente o mesmo que somar e dividir por *n* no fim, mas o buffer tem sempre o valor de um só campo. Uma soma chega a *n* vezes o campo e, num alvo de 16 bits, satura em 65 504; com um divisor que não para de crescer, uma vista parada desvaneceria quanto mais tempo ficasse assim - enquanto uma câmara em movimento, que recomeça a cada fotograma, parece perfeitamente correta. A bateria de testes de fumo garante que 16 fotogramas fundidos dão 1,00× o que dá um só fotograma.
- **Extend para a reprodução cumulativa.** As linhas já acumuladas continuam visíveis, por isso um fotograma só precisa da fração de segundo que acabou de chegar - que cabe num fotograma, por isso entra exatamente. Reestimar em vez disso acenderia um subconjunto aleatório diferente em cada fotograma e desvaneceria-o, o que se lê como rajadas que se acendem e desaparecem, e um fotograma em pausa continuaria a preencher-se. A bateria garante que o total sobe de forma monótona durante a reprodução e se mantém dentro de 0,02% durante 2,5 s em pausa.
- **Média móvel para as janelas deslizantes.** Estas mudam de facto em cada fotograma. Um peso de mistura fixo acompanha a janela móvel (uma média de todos os fotogramas desde o início da reprodução ficaria atrás da cabeça de reprodução) e é muito mais sossegado do que recomeçar.
- **Reset para as linhas reproduzidas.** As cabeças do calor em linhas movem-se em cada fotograma; uma média móvel espalharia cada uma num risco, por isso cada fotograma é desenhado por inteiro e o desvanecimento da cauda é o da própria imagem.
- **Os fotogramas parciais passam por um alvo de trabalho.** Um fotograma fundido a uma fração do peso total é projetado num alvo separado a partir de zero e só depois misturado no acumulador, em vez de ser projetado diretamente com peso 1/n. Diretamente, cada sprite seria somado a 1/n do tamanho do total a que se junta, o que um alvo de meia precisão arredonda para zero - pior onde é mais denso ([Acumulação em half-float](half-float-accumulation.md)).

### Convergência {#convergence}

O plano de cada fotograma sabe quantas linhas candidatas há e quantas submete, por isso o número de fotogramas necessários para cobrir todas as linhas é ⌈candidatas / submetidas⌉. Depois de fundidos esses fotogramas, a vista está **convergida**: a linha *Cobertura* da sobreposição de estatísticas passa de percentagem a *exata*, e os fotogramas seguintes ficam parados. Com **Desenhar todas as linhas em cada fotograma** ligado (a predefinição), um só fotograma costuma cobrir tudo, por isso a convergência é imediata, e a maquinaria progressiva só é precisa quando a janela tem mais linhas do que um plano de desenho consegue levar (cerca de 67 milhões).

### O que a recomeça {#what-restarts-it}

As definições dividem-se em três grupos, conforme o que o buffer acumulado ainda significa depois de mudarem:

| Grupo | Muda | Efeito |
|---|---|---|
| **Geometria** - que linhas contribuem e quanto | modo de vista; rotas das linhas; raio do sprite, intensidade no centro e na borda, decaimento, rampa suave, a curva, limites de píxeis, achatamento; recorte por distância perto, longe e planar; oclusão e ocultar atrás do terreno; o corte; tamanho da tela; resolução do calor; visibilidade e sinais dos grupos; a divisão da diferença; Tudo / Reproduzir; o histórico; os filtros de colunas e a seleção de Entidades; o ganho de half-float | Reset. |
| **Janela** - o intervalo de tempo | a cabeça de reprodução a mover-se; o recurso do Tempo de vida e o desvanecimento | Extend (cumulativo) ou média móvel (deslizante). |
| **Composição** - só a colorização | saturação, resposta à densidade, calor mínimo, as rampas de cor; corte do nível; grelha e eixos; definições e sessão da repetição de caixas; profundidade de campo | Redesenho sem tocar no calor. |

Um movimento da câmara recomeça sempre. Por isso arrastar a saturação ou a rampa não custa nada; arrastar o raio do sprite recomeça a convergência a cada passo.
