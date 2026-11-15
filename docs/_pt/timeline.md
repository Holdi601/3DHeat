---
title: "Linha temporal e reprodução"
nav_order: 5
lang: "pt"
source: "timeline.md"
source_hash: "62632bc74701"
translated: true
outdated: false
---

# Linha temporal e reprodução

A barra por baixo da imagem é como um leitor de vídeo: pode reproduzir os dados como um filme, pausar, saltar à vontade e mudar a velocidade.

![A barra da linha temporal: 1 Tudo/Reproduzir, 2 botões de transporte, 3 relógio, 4 Velocidade, 5 Histórico, com Janela e um Intervalo de 30 s](../assets/img/en/timeline-bar.webp)

A barra por baixo da vista é a linha temporal ([`Timeline.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/Timeline.tsx)). Decide quais as linhas visíveis em cada momento. Precisa de uma coluna de tempo; sem ela a barra inteira fica desativada, a vista fica em **Tudo**, e a barra lateral diz *Não há coluna de tempo nestes dados - a linha temporal está desativada e todos os pontos são mostrados de uma vez.*

## Tudo e Reproduzir {#all-and-play}

Dois modos principais, porque respondem a perguntas diferentes.

- **Tudo** (a predefinição em cada carga) ignora por completo a cabeça de reprodução e mostra todas as linhas que passam os filtros. É a vista de "onde é que isto acontece", e não é o mesmo que ir arrastando até ao fim. O cursor fica desativado e o relógio mostra `tudo · <intervalo> de dados`.
- **Reproduzir** corre os dados como um timelapse. Aparecem o cursor, o transporte e as definições do histórico.

Escolher **Tudo** também para a reprodução.

## Os controlos {#the-controls}

| Controlo | Predefinição | Significado |
|---|---|---|
| Cursor | o início | A cabeça de reprodução. Arraste para procurar; 20 000 passos ao longo do intervalo. |
| **Tudo** / **Reproduzir** | Tudo | Ver acima. |
| ▶ / ❚❚ | em pausa | Reproduzir ou pausar; também `K`. |
| ◀ **Reproduzir para trás (J)** | | Reproduz os dados ao contrário. Só aparece no modo **Figuras sobrepostas**; a mesma tecla `J` também funciona aí (ver [Teclado](#keyboard)). |
| ⏮ | | Volta ao início do intervalo. |
| Relógio | | `decorrido / total` em `mm:ss.s` (ou `h:mm:ss`), e, quando a coluna de tempo é um carimbo absoluto, a hora do dia da cabeça de reprodução em `HH:MM:SSZ` (UTC). |
| **Velocidade** | 1× | Segundos dos dados por segundo real. O menu tem 17 passos de 0,01× a 1800× (0,01, 0,02, 0,05, 0,1, 0,25, 0,5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 600, 1800), mais **Personalizada…**: escreva qualquer velocidade de 0,001× a 3600× (por exemplo 0,3 ou 12) e prima Enter; Esc mantém a velocidade atual. A última velocidade fica memorizada para a próxima visita (ver [Definições guardadas](ref-settings-storage.md)). |
| **Histórico** | Cumulativo | O que conta como visível na cabeça de reprodução: *Cumulativo*, *Janela* ou *Tempo de vida* (abaixo). |
| **Intervalo** (Janela; no modo Linhas também Tempo de vida) | 30 s | Duração da janela que termina na cabeça de reprodução; no mínimo 0,01 s. Em [Calor em linhas](line-heat.md#playback) é o comprimento da cauda. |
| **Vida de recurso** (só Tempo de vida, não no modo Linhas) | 10 s | Durante quanto tempo um ponto de dados sem próxima amostra da sua pessoa fica visível. |
| **Desvanecer** (só Tempo de vida, não no modo Linhas) | 0,4 | Fração da vida de cada ponto de dados gasta a desaparecer, 0-1. |
| **Repetir em ciclo** | ligado | No fim, recomeça; desligado para no fim. |
| Lado direito | | O nome do conjunto de dados. |

O **intervalo** é o período de tempo do conjunto de dados - ou, na [sobreposição de figuras](box-replay.md) com uma sessão selecionada, o período dessa sessão.

## Histórico {#history}

No modo Reproduzir:

- **Cumulativo** - tudo desde o início do intervalo até à cabeça de reprodução. O calor vai-se acumulando à medida que reproduz.
- **Janela** - um período fixo de histórico que termina na cabeça de reprodução (*Intervalo*).
- **Tempo de vida** - cada ponto de dados vive até à **próxima amostra da mesma pessoa** (na mesma sessão), por isso exatamente uma posição por pessoa é atual em cada instante. Um ponto de dados cuja pessoa nunca mais aparece - uma morte, uma desconexão, o fim do registo - não tem próxima amostra, e vive durante a *Vida de recurso* em vez de desaparecer de imediato ou durar para sempre. Os pontos de dados **desvanecem** ao longo da última fração *Desvanecer* da sua vida em vez de saltarem de repente: com uma amostra viva por pessoa, um ponto que desaparece de uma imagem para a seguinte faz o campo inteiro piscar à taxa das amostras. *Desvanecer* 0 repõe o corte seco.

O tempo de vida precisa de uma coluna de pessoa além da de tempo; sem ela o histórico passa para Cumulativo na carga. No [Calor em linhas](line-heat.md#playback) o histórico define durante quanto tempo a cauda de um percurso fica visível; na [sobreposição de figuras](box-replay.md) a *Vida de recurso* é o tempo que se mantém uma pessoa sem mais amostras.

## Comportamento da reprodução {#playback-behaviour}

A partir do ciclo de imagem ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

- A cabeça de reprodução avança por *tempo de imagem × velocidade*. O tempo de imagem é limitado a 0,1 s, para que trocar de separador não teletransporte a cabeça de reprodução.
- Premir reproduzir no fim absoluto do intervalo começa do início, como faz um leitor de média. A cada carga a cabeça de reprodução fica no início, por isso o primeiro toque em reproduzir reproduz.
- No fim do intervalo a cabeça de reprodução volta ao início (Repetir em ciclo ligado) ou para aí e a reprodução termina (Repetir em ciclo desligado).
- O cursor lê diretamente a cabeça de reprodução do motor em cada imagem; o estado da aplicação só é atualizado em procuras, arranques, paragens e ciclos.
- Escolher uma sessão no seletor de Sessão procura o início dessa sessão.

## Porque é que a reprodução é suave e barata {#why-playback-is-smooth-and-cheap}

As linhas são guardadas ordenadas por tempo, por isso uma janela de tempo são duas pesquisas binárias sobre a coluna de tempo: avançar a cabeça de reprodução move dois inteiros e não toca em nenhuma linha, e o custo da reprodução segue o número de linhas na janela, não o tamanho do conjunto de dados.

Como o calor se mantém estável enquanto a janela se move depende do histórico ([Acumulação](accumulation.md)):

- O **Cumulativo** só cresce, por isso cada imagem acrescenta apenas as linhas que se tornaram visíveis desde a anterior, com peso total. O campo constrói-se de forma monótona e pausar não muda nada, porque já não há nada por chegar. (Reestimar em vez disso faria cada imagem iluminar um subconjunto aleatório diferente e depois desvanecê-lo, o que se lê como rajadas que acendem e desaparecem.)
- A **Janela** e o **Tempo de vida** mudam de facto em cada imagem e são reestimados, misturados como média móvel exponencial (peso 0,34 para a nova imagem), que é não enviesada em regime estável e muito mais silenciosa do que recomeçar do zero.
- No modo Tempo de vida, as linhas candidatas são as de *cabeça de reprodução - max(maior intervalo nos dados, Vida de recurso)* até à cabeça de reprodução; o shader descarta então cada linha cuja vida já terminou e aplica o desvanecimento.

Passar entre Tudo e Reproduzir, ou mudar o histórico, reinicia a acumulação.

## Teclado {#keyboard}

| Tecla | Efeito |
|---|---|
| `K` | Reproduzir / pausar |
| `J` | Reproduzir para trás; premir de novo pausa (só Figuras sobrepostas) |
| `L` | Reproduzir para a frente; premir de novo pausa (só Figuras sobrepostas) |

`J` e `L` também passam a linha temporal para **Reproduzir**. As teclas são ignoradas enquanto uma caixa de texto ou um menu tiver o foco. No separador Análise de corrida, `K` controla a repetição desse próprio separador.
