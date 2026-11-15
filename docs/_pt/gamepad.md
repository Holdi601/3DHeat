---
title: "Comando e HOTAS"
parent: "Câmara e controlos"
nav_order: 1
lang: "pt"
source: "gamepad.md"
source_hash: "836636b9c7af"
translated: true
outdated: false
---


# Comando e HOTAS

Pode voar com a câmara usando um comando de estilo Xbox em vez do teclado. Use-o quando quiser recostar-se e olhar à volta numa cena grande. A entrada do comando **acrescenta-se** à do teclado, por isso pode usar os dois ao mesmo tempo.

## Ligar um comando {#connect-a-controller}

1. Ligue o comando (ou emparelhe-o).
2. Clique na vista e prima um botão qualquer do comando. Os navegadores só mostram um comando depois da sua primeira entrada.
3. Abra **Câmara e cena → Comando**. A lista de dispositivos mostra-o com `●`.
4. Empurre o manípulo esquerdo para voar e o direito para olhar. Se a câmara derivar com os manípulos centrados, aumente a **Zona morta**.

Qualquer dispositivo que o navegador associe ao layout padrão de comando funciona. Um manípulo de voo ou um acelerador (HOTAS) é ignorado por omissão; veja abaixo.

## Associação de controlos {#mapping}

| Controlo | Efeito |
|---|---|
| Manípulo esquerdo | Mover: para a frente/trás e deslizar de lado |
| Manípulo direito | Olhar: guinada e inclinação, à *Velocidade do olhar* graus por segundo com o manípulo todo empurrado |
| `RT` / `LT` (analógicos) | Subir / descer; na projeção paralela, aproximar / afastar o zoom |
| `RB` (mantido) | 6× mais rápido |
| `LB` (mantido) | 15% da velocidade |
| `A` (mantido) | Sprint de 3× (combina com RB/LB) |
| `Y` (premido) | Enquadrar os dados |

Os números dos botões seguem o layout padrão: A 0, Y 3, LB 4, RB 5, LT 6, RT 7; os manípulos nos eixos 0-1 (esquerdo) e 2-3 (direito).

## As definições do comando {#the-gamepad-settings}

Em **Câmara e cena → Comando**. **Definições** / **Ocultar** abre ou fecha os controlos de ajuste.

| Controlo | Omissão | Intervalo (ajuste) | Significado |
|---|---|---|---|
| **Ativada** | ligado | | |
| Estado do dispositivo | | | Cada dispositivo ligado, `●` quando é seguido, `○` quando não é, com *- não é um comando XInput, ignorado* ou *- não é um comando XInput, usado mesmo assim* para dispositivos não padrão. Sem nenhum: *Nenhum comando detetado. Os navegadores só revelam um comando depois de este enviar a primeira entrada - prima um botão nele.* |
| **Usar dispositivo** | *Só comandos XInput (recomendado)* | | Mostrado quando está ligado um dispositivo não padrão. Escolha um dispositivo pelo nome para o seguir em vez disso. |
| **Velocidade do olhar** | 150°/s | 20-540 (5000) | Velocidade de rotação com o manípulo direito todo empurrado. |
| **Zona morta** | 12% | 0-50% (95%) | Radial: um empurrão na diagonal nunca passa para um só eixo. Aumente-a se a câmara derivar com os manípulos centrados. |
| **Curva do manípulo** | x² | linear (1) a x⁴ (16) | Expoente da resposta depois da zona morta: controlo mais fino perto do centro, e velocidade máxima na borda. |
| **Inverter Y do manípulo** | desligado | | |
| **Trocar manípulos** | desligado | | Mover com o manípulo direito, olhar com o esquerdo. |

A forma do manípulo: com deflexão *m* (o comprimento do vetor do manípulo) e zona morta *d*, a saída = ((m - d) / (1 - d)) ^ curva, ao longo da direção do manípulo, e 0 dentro da zona morta.

## Porque só comandos padrão por omissão {#why-only-standard-pads-by-default}

A API do Gamepad informa de **todos** os dispositivos HID com eixos - manípulos de voo, aceleradores, pedais, volantes -, e esses não ficam no centro: um eixo de torção ou uma alavanca de acelerador fica à deflexão total quando ninguém lhes toca. Lido como manípulo, isso é uma entrada permanente à velocidade máxima que nenhuma zona morta consegue suprimir, e a câmara roda sozinha desde o momento em que a página carrega (e todos os modos de calor também parecem avariados, porque uma câmara em movimento reinicia a acumulação a cada fotograma).

Por isso um dispositivo só é seguido quando o navegador informa `mapping: "standard"`, o seu modo de dizer "um comando de estilo XInput, com os eixos onde espera". Os outros dispositivos aparecem na lista marcados como ignorados, e **Usar dispositivo** escolhe um explicitamente - por exemplo, para voar a câmara com um HOTAS. Depois de um comando ser seguido, a câmara fica com ele, para que dois comandos não disputem a câmara conforme a ordem de enumeração.

**HOTAS:** só os eixos 0-3 (dois manípulos) e os botões padrão são lidos. Um acelerador ou pedais noutros eixos não fazem nada, e um manípulo ou acelerador cujos eixos não ficam no centro pode precisar de uma **Zona morta** maior.

Os navegadores escondem um comando até ele ter enviado a primeira entrada, por isso um comando ligado que ninguém tocou ainda não existe, para a página.
