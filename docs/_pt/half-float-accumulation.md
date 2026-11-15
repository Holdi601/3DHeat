---
title: "Acumulação em half-float"
parent: "Detalhes da renderização"
nav_order: 4
lang: "pt"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---


# Acumulação em meia precisão

Algumas placas gráficas só conseguem guardar o calor em números pequenos de 16 bits, o que poderia cortar ou arredondar os sítios mais quentes. O visualizador escala os números para que isto não se note. Não precisa de fazer nada; esta página é para programadores.

## Para programadores {#for-developers}

Um dispositivo que não consegue misturar em texturas de vírgula flutuante de 32 bits (sem `float32-blendable` e `float32-filterable` no WebGPU, sem `EXT_float_blend` no WebGL2) recebe um alvo de calor em **vírgula flutuante de 16 bits** (`r16float`): um máximo de 65 504 e 11 bits de mantissa. Um campo denso chega a várias centenas de milhares, por isso um alvo de 16 bits **corta** e **arredonda**, e o erro de arredondamento cresce com o valor - o que se manifesta de forma muito específica: as zonas mais densas aparecem muito mais frias do que são, enquanto as zonas esparsas parecem bem. Dois mecanismos tratam disto; a imagem só fica correta se os dois funcionarem.

### Alcance: um ganho em cada splat {#range-a-gain-on-every-splat}

Cada splat é multiplicado por um **ganho**, e a composição divide-o de volta, para que o campo fique na grandeza que as meias precisões tratam bem ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimativa = estimativa analítica de saturação para este conjunto de dados, raio e intensidade central
ganho      = 2 ^ round(log2(2048 / estimativa)), expoente limitado a -20..20
```

2048 deixa cerca de 32× de margem acima do topo da rampa antes de 65 504. O ganho é uma **potência de dois**, por isso uma pequena deriva na estimativa não o altera - nem ao buffer acumulado -, e ele faz parte da [assinatura de geometria](accumulation.md#what-restarts-it), por isso uma mudança reinicia a acumulação.

Está ancorado à estimativa analítica e, de propósito, **não** ao ponto de saturação. A saturação é aplicada na composição precisamente para que arrastá-la nunca reinicie a convergência; se o ganho se movesse com ela, o buffer continuaria a ter valores escritos com o ganho antigo enquanto a composição dividiria pelo novo, os dois erros anular-se-iam exatamente, e o cursor pareceria não fazer nada.

Num alvo de 32 bits, o ganho é sempre 1.

### Precisão: fotogramas parciais a partir de zero {#precision-partial-frames-from-zero}

Um fotograma fundido no acumulador com peso 1/n é primeiro feito splat num **alvo de trabalho** a partir de zero e só depois misturado, em vez de fazer splat diretamente no acumulador com peso 1/n ([Acumulação](accumulation.md#why-each)). Diretamente, a contribuição de cada sprite seria 1/n do tamanho do total acumulado a que é somada, e uma meia precisão arredonda essas parcelas - pior quanto mais denso for o píxel. A partir de zero, cada parcela é comparável ao total a que se junta, que é a mesma aritmética que um único fotograma já faz.

### Efeito medido {#measured-effect}

Numa cena sintética densa, lendo o campo em unidades comparáveis:

| | p50 | p90 | p99 | máx. |
|---|---|---|---|---|
| 32 bits (referência) | 6051 | 60742 | 121199 | 232744 |
| 16 bits antes | 1372 | 6972 | 7840 | 7840 |
| 16 bits depois | 5996 | 59666 | 118824 | 210357 |

O pico passou de 30× demasiado baixo para 0,90×, e o fotograma composto coincide com o de 32 bits a 0,1% da luminância média.

### Testar {#testing-it}

`?heat=f16` força este caminho em qualquer dos backends - sem um comutador, a aritmética que só as GPU mais fracas executam só seria testada pelas pessoas que as usam. `npm run smoke:f16` executa toda a suíte de navegador com ele.

As leituras desfazem o ganho: a exposição automática divide o campo lido por ele, e `engine.readHeatProbe()` passa-o ao renderizador - que é também a forma como é lida a [leitura de calor ao vivo da régua](measure.md#notes).
