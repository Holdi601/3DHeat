---
title: "Referência de teclado e rato"
parent: "Câmara e controlos"
nav_order: 2
lang: "pt"
source: "keyboard-reference.md"
source_hash: "fee7cd0beb88"
translated: true
outdated: false
---


# Referência de teclado e rato

Todas as teclas e ações do rato num só lugar, para encontrar a que precisa. Clique primeiro na vista para que ela tenha o teclado. As teclas são ignoradas enquanto uma caixa de texto ou uma lista pendente tiver o foco. A versão curta também aparece no canto inferior esquerdo da vista.

Localizador rápido:

| Quero ... | Carregar em |
|---|---|
| voar | `W A S D`, arrastar para olhar |
| ver tudo | `F` |
| reproduzir ou pausar | `K` |
| reproduzir para trás | `J` (carregue de novo para pausar), para a frente `L` |
| ver o que querem dizer as cores | `?` ou `F1` |
| anular no separador Táticas | `Ctrl+Z` |

## Câmara {#camera}

De [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

| Entrada | Efeito |
|---|---|
| `W` / `↑` | Em frente, na direção da vista |
| `S` / `↓` | Para trás |
| `A` / `←` | Deslocar para a esquerda |
| `D` / `→` | Deslocar para a direita |
| `Espaço` / `E` | Para cima |
| `Q` / `Ctrl` esquerdo | Para baixo |
| `Shift` (qualquer um) | Manter: velocidade 6× |
| `Alt` esquerdo | Manter: velocidade 15% |
| Arrastar com o botão esquerdo ou direito na vista | Olhar (ponteiro bloqueado enquanto o botão está premido) |
| Roda (perspetiva) | Velocidade de voo ×1,5 por entalhe (no máximo 4 entalhes por evento da roda) |
| Roda (paralela) | Zoom |
| Clique direito | Não abre menu de contexto sobre a vista |

## Global {#global}

De [`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx).

| Tecla | Efeito |
|---|---|
| `K` | Reproduzir / pausar a [linha temporal](timeline.md) |
| `F` | Enquadrar os dados |
| `C` | Copiar a posição, o guinada e a inclinação da câmara ([leitura da câmara](camera.md#camera-readout)) |
| `G` | Ir para um ponto escrito: abre a caixa sob a leitura da câmara |
| `Esc` | Fechar o cartão de escolha; depois deixar de olhar para a segunda unidade; depois deixar de seguir uma unidade |
| `T` | Aspeto de ecrã tático ligado ou desligado ([Repetição da partida](match-replay.md#display-style)) |
| `?` / `F1` | Modo de ajuda: o que querem dizer as cores ([Definições, unidades e teclas](settings.md#help-mode)) |
| `1` | [Calor](heat.md) |
| `2` | [Diferença](difference.md) |
| `3` | [Calor por equipa](team-heat.md) |
| `4` | [Linhas](line-heat.md) |
| `]` | Limite de recorte distante para fora ×1,12 (`Shift`: ×1,35) |
| `[` | Limite de recorte distante para dentro ÷1,12 (`Shift`: ÷1,35) |
| `\` | Limite de recorte distante desligado / de volta ao sítio onde estava ([Profundidade e recorte](depth-and-culling.md#keyboard)) |

O modo **Figuras sobrepostas** não tem tecla numérica; escolha-o na barra de modos ou abra o separador Partida. As teclas numéricas passam pela mesma verificação da barra de modos: uma tecla para um modo que a barra mostra como indisponível para os dados carregados não faz nada.

## Repetição da partida {#match-replay}

No modo Figuras sobrepostas, que o separador Partida usa ([Repetição da partida](match-replay.md)). Funcionam com uma unidade seguida ou não, exceto onde se indica:

| Tecla | Efeito |
|---|---|
| `B` | Acrescentar um marcador: o momento e a câmara |
| `M` | Mapa 2D: canto, vista completa, desligado |
| `V` / `Shift+V` | Vista de câmara seguinte / anterior da unidade seguida |
| `H` | Visor de cabeça erguida nas vistas de cabina e padlock |
| `Page Down` / `Page Up` | Evento seguinte / anterior dos tipos que a lista de eventos mostra |
| `J` | Reproduzir para trás; de novo, para pausar |
| `L` | Reproduzir para a frente; de novo, para pausar |
| `.` / `,` | Um segundo para a frente / para trás, em pausa (`Shift`: dez segundos) |
| `Esc` | Deixar primeiro de olhar para o alvo; depois deixar de seguir |
| `Ctrl`+clique ou `Alt`+clique numa unidade (na vista ou na lista de unidades) | Olhar para ela a partir da unidade seguida (a vista de duas unidades); clique de novo para a largar |
| `Shift`+clique em duas unidades | Medir entre elas: rumo, distância, diferença de altura |

`V` precisa de uma unidade seguida. Aqui `M` é o mapa 2D, e "mover" no separador Táticas.

## Seguir uma unidade {#following-a-unit}

Enquanto a câmara segue uma unidade, a roda e as teclas de voo guiam-na à volta da unidade em vez de voar livremente ([Câmara](camera.md#while-following-a-unit)):

| Entrada | Efeito |
|---|---|
| Roda, `W` / `S` | Mais perto / mais longe (mais alto / mais baixo na vista de satélite). Não nas vistas de cabina e padlock. |
| `A` / `D`, `Q` / `E` | Orbitar à volta da unidade (vistas de perseguição e órbita) |
| Arrastar | Olhar à volta da unidade; na cabina, olhar à volta lá dentro |
| `V` / `Shift+V` | Vista de câmara seguinte / anterior |
| `H` | Visor de cabeça erguida (vistas de cabina e padlock) |
| `Esc` | Deixar de olhar para a segunda unidade, depois deixar de seguir |

## Quadro tático {#tactics-board}

No separador Táticas ([Quadro tático](tactics-board.md)). `F`, `C`, `G` e `T` funcionam como acima; as teclas numéricas não fazem nada.

| Tecla | Efeito |
|---|---|
| `Ctrl+Z` | Anular |
| `Ctrl+Y` ou `Ctrl+Shift+Z` | Refazer |
| `Enter` | Termina a seta que está a ser desenhada (um duplo clique ou um clique direito fazem o mesmo) |
| `Esc` | Cancela um arrasto; senão, larga a seta ou o movimento em curso; senão, desseleciona |
| `Delete` ou `Backspace` | Apaga a seleção |
| `W` / `E` / `R` | Gizmo de mover / rodar / escalar para a seleção (esquema de teclas **W / E / R**) |
| `G` / `R` / `S` | Gizmo de mover / rodar / escalar para a seleção (esquema de teclas **G / R / S**) |
| `R` | Sem nada selecionado: roda a próxima figura a colocar em 15°. `Shift+R` roda-a de volta. |
| `M` | Com uma figura selecionada: move-a para o próximo clique |
| `K` | Reproduzir ou pausar o plano |
| Shift+clique | Acrescentar ou retirar da seleção |
| Shift+arrastar | Desenhar uma caixa à volta do que selecionar |
| `Ctrl` ao arrastar um ponto de controlo | Encaixar na grelha ou no passo de ângulo |

As teclas do gizmo só funcionam com algo selecionado; sem nada selecionado, `W A S D` voam a câmara como de costume.

## Escolher ao clicar {#click-to-pick}

Com **Clicar mostra o que lá está** ligado e a régua desligada ([Escolher ao clicar](camera.md#click-to-pick)):

| Entrada | Efeito |
|---|---|
| Clique esquerdo (sem arrastar mais de 4 px) | Mostra o ponto de dados, ou então o sítio do nível, sob o ponteiro |

## Medir {#measure}

Com **Régua ativa** ([Medir](measure.md)):

| Entrada | Efeito |
|---|---|
| Clique esquerdo (sem arrastar mais de 4 px) | Põe um ponto |
| Clique direito | Remove o último ponto |

## Noutros sítios {#elsewhere}

| Onde | Entrada | Efeito |
|---|---|---|
| Pega de qualquer cursor (o manípulo ao lado do número) | Arrastar para cima / baixo | Muda o valor continuamente, mais depressa quanto mais arrastar; mantenha `Shift` para ajuste fino. Solte para parar. |
| A indicação de velocidade sobre a vista | Arrastar para cima / baixo | Muda a velocidade de voo da mesma forma. |
| Caixas de pose | `Enter` | Aplica a posição ou orientação escrita. |
| Editor de curvas | Duplo clique / Alt+clique / clique direito | Acrescenta um ponto / remove um ponto ([Forma do sprite](sprite-shape.md#the-curve-editor)). |

## Separador Análise de corrida {#race-analysis-tab}

No separador Análise de corrida, `K` reproduz e pausa a repetição da corrida, `Home` a rebobina, e as teclas numéricas não fazem nada. Veja [Análise de corrida](race-analysis.md).

## Teclas que o visualizador mantém do navegador {#keys-the-viewer-keeps-from-the-browser}

Alguns atalhos do navegador fechariam ou recarregariam a página e perderiam uma sessão carregada; o visualizador fica com eles para si. A lista é gerada a partir do código: [Teclas do navegador](ref-browser-keys.md).

## Comando {#gamepad}

Veja [Comando e HOTAS](gamepad.md).
