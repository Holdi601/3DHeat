---
title: "Deteção de renderização por software"
parent: "Detalhes da renderização"
nav_order: 6
lang: "pt"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---


# Deteção de renderização por software

Se o seu navegador desenhar com o processador principal em vez da placa gráfica, o visualizador fica muitas vezes mais lento. O visualizador repara nisto e mostra uma caixa vermelha que lhe diz o que ativar.

Quando um navegador tem a aceleração por hardware desligada, ou o seu driver está na lista de bloqueio, desenha WebGL e WebGPU no CPU. Tudo continua a funcionar, muitas vezes mais devagar, e a experiência é "este visualizador é inutilizavelmente lento com os meus dados" - um sintoma que aponta para a ferramenta, não para um interruptor do navegador. Por isso o visualizador olha para o nome do renderizador e diz isso ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## O aviso {#the-banner}

Quando o renderizador é identificado com certeza como software, aparece uma caixa vermelha no topo da barra lateral (separadores Calor e Partida), acima da barra de modos:

![O aviso vermelho: A correr sem a placa gráfica](../assets/img/en/software-rendering-banner.webp)

> **A correr sem a placa gráfica.**
> Este navegador está a desenhar no CPU em vez da placa gráfica, o que é muitas vezes mais lento e não aguenta conjuntos de dados grandes. Ative a aceleração por hardware nas definições do navegador (Chrome: Definições → Sistema → "Usar aceleração gráfica quando disponível", e depois reinicie), e confirme que o driver da placa gráfica está atualizado.

## Para programadores {#for-developers}

### Como decide {#how-it-decides}

A cadeia do renderizador - `UNMASKED_RENDERER_WEBGL` do WebGL2, ou o fabricante, a arquitetura e o dispositivo do adaptador WebGPU - é posta em minúsculas e classificada:

- **software** quando contém `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer` ou `generic renderer`;
- **hardware** quando contém um fabricante ou família de GPU conhecida (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`);
- **desconhecido** nos outros casos.

Só o *software* faz aparecer o aviso. Um adaptador não reconhecido não diz nada: mandar alguém com uma GPU a funcionar reconfigurar o navegador é uma falha pior do que deixar passar um caso.

### O nome curto {#the-short-name}

O mesmo módulo encurta a cadeia do renderizador para apresentação: a partir de uma cadeia ANGLE como `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` mantém o campo do dispositivo, retira o id PCI e o modelo de shader e API finais, e mostra `Vendor Model`. O nome curto aparece em **Orçamentos de recursos**, com a cadeia completa como dica ao passar o rato; a estimativa de memória mostra a cadeia completa.
