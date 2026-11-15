---
title: "Diferença"
parent: "Modos de calor"
nav_order: 5
lang: "pt"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Diferença

A vermelho onde a equipa A esteve mais, azul-esverdeado onde esteve a equipa B, nada onde estavam iguais.

**Diferença** (tecla 2) é calor com sinal. As linhas de uma população somam calor; as de outra subtraem-no. Onde as duas se sobrepõem por igual o resultado é zero e totalmente transparente; onde uma domina, mostra-se nas cores desse lado - por omissão quentes (transparente → vermelho → amarelo → branco) para o lado **+** e frias (transparente → verde → azul → roxo) para o lado **−**.

![Calor de diferença: vermelho onde o lado + esteve mais, verde e azul onde o lado - esteve mais](../assets/img/en/difference-split.webp)

## Como usar {#how-to-use-it}

1. Prima `2` (ou escolha **Diferença** na barra de modos).
2. Abra **Divisão por diferença** na barra lateral.
3. Escolha por que **Dividir por**: normalmente *Grupos*.
4. Coloque um grupo (ou valor) em **+** e outro em **−**.
5. Leia as cores: quente significa o lado +, frio significa o lado −. O painel avisa se um dos lados não tem linhas (ver [Mensagens que pode ver](#messages-you-may-see)).

*Quais* são as duas populações é a questão toda, por isso a divisão pode ser feita por qualquer coluna guardada, não só por grupos. As linhas que caem em **nenhum** dos lados são **deixadas de fora**, não contadas como zero: é isso que faz com que uma divisão entre dois de muitos valores compare exatamente esses dois, e combina-se com os [filtros](filters.md) - filtre até um só mapa e divida depois esse por versão.

O modo precisa de dois lados: uma coluna de grupo com pelo menos dois grupos, ou uma divisão sobre uma coluna guardada para filtrar. Em dados com menos de dois grupos, uma carga começa com uma divisão por coluna - primeiro a coluna *Ficheiro de origem* de uma carga de vários ficheiros, senão a primeira coluna de categoria com dois valores, senão a primeira coluna numérica com amplitude - por isso *comparar duas cargas* funciona mesmo sem grupos. Só dados sem nada disto deixam o modo indisponível; e também uma divisão por coluna que fique sem nada de um dos lados.

## O painel Divisão por diferença {#the-difference-split-panel}

Mostrado no modo Diferença, por baixo dos painéis de calor.

**Dividir por** oferece:

| Opção | Mostrada como | Regra de divisão |
|---|---|---|
| Grupos | *Grupo (N)* (quando há uma coluna de grupo) | Cada grupo em +, − ou em nenhum, definido na [Lista de equipas](teams-list.md) |
| Uma coluna de categorias | *coluna (N valores)* | Valores em +, − ou em nenhum |
| Uma coluna numérica | *coluna (numérica)* | Um intervalo de valores para cada lado |
| O ficheiro de origem | *Ficheiro de origem - comparar duas cargas* (quando se carregaram vários ficheiros) | Ficheiros em +, − ou em nenhum |

Só são oferecidas as colunas guardadas em *Guardar para filtrar* no momento da carga.

### Comparar proporções, não contagens {#compare-shares-not-counts}

**Comparar proporções, não contagens** (por omissão desligado) pondera cada lado por um sobre o seu próprio número de linhas, para que um lado com cinco vezes mais linhas não ganhe só pelo número. A cor mostra então onde cada lado é proporcionalmente mais comum que o outro. Use-o quando os dois lados têm quantidades de dados muito diferentes, por exemplo duas sessões de duração diferente.

### Mensagens que pode ver {#messages-you-may-see}

O painel avisa quando a imagem não é uma diferença real:

| Mensagem | Significado |
|---|---|
| *N + / M −* (ou *N + / M − / K sem uso*) | Quantos valores estão em cada lado (e em nenhum). |
| Nenhuma linha da janela está do lado **+** | Só o lado **−** é desenhado. Mova a janela da linha temporal ou altere a divisão. |
| Nenhuma linha da janela está do lado **−** | Só o lado **+** é desenhado. |
| Nenhum valor está em nenhum dos lados | A diferença não desenha nada. Coloque pelo menos um valor em **+** ou **−**. |
| *coluna* não pode ser dividida desta forma | A coluna escolhida não encaixa na divisão. Escolha a coluna outra vez. |
| A coluna de divisão não coube na memória da GPU em N de M blocos | Essas linhas não são desenhadas. Aumente o orçamento da GPU em Desempenho → Orçamentos de recursos, ou carregue menos linhas. |

### Por grupo {#by-group}

O painel apenas aponta para a [Lista de equipas](teams-list.md), onde cada grupo tem um botão **+** e um **−**. Em cada carga, a primeira metade dos grupos (arredondada para cima) fica em +, o resto em −; **Dividir por igual** na Lista de equipas faz o mesmo outra vez. Um grupo que fica em nenhum dos lados, ou que está oculto com a sua caixa de seleção, não contribui com nada.

### Por valores de categoria {#by-category-values}

| Parte | Significado |
|---|---|
| `a + / b − / c sem uso` | Quantos valores estão em cada lado e em nenhum. |
| **Limpar** | Coloca todos os valores em nenhum dos lados. |
| Lista de valores | Cada valor com um botão **+** e um **−** (clique no ativo outra vez para o retirar desse lado). Um valor vazio aparece como *(em falta)*. |
| Nota de limite | Só se listam os primeiros 200 valores: *A mostrar os primeiros 200 de N valores. Uma coluna tão larga é melhor restringida primeiro com um filtro, ou dividida por intervalo se os valores estiverem ordenados.* |

Escolher a coluna põe o seu primeiro valor em + e o segundo em −. Quando nenhum dos lados tem valores, a divisão recorre aos grupos em vez de mostrar uma imagem vazia. *Ficheiro de origem* funciona da mesma forma, com um valor por ficheiro - é assim que se comparam duas exportações, dois testes ou duas versões.

### Por intervalo {#by-range}

| Parte | Significado |
|---|---|
| Sugestão | O mínimo e o máximo da coluna. |
| **Intervalo positivo (+)**, **de** / **a** | As linhas com um valor neste intervalo somam. Inclui ambos os extremos. |
| **Intervalo negativo (−)**, **de** / **a** | As linhas neste intervalo subtraem. |
| **Dividir no ponto médio** | Põe + em [mínimo, meio] e − em [meio, máximo] - também o que acontece ao escolher a coluna. |

Um valor em ambos os intervalos conta como +. Os intervalos não têm de cobrir a coluna; os valores fora de ambos ficam de fora. *Os primeiros dois minutos contra os últimos dois* é uma divisão por intervalo numa coluna do tipo tempo.

## Cores {#colours}

A secção **Cores do calor** mostra neste modo dois editores de rampa: **Positivo (equipas aditivas)** e **Negativo (equipas subtrativas)**, cada um com o seu botão de repor (*Repor para transparente → vermelho → amarelo → branco*, *Repor para transparente → verde → azul → roxo*). A composição toma o valor absoluto do calor líquido através do [ponto de saturação e da resposta](colour-and-exposure.md), e escolhe a rampa negativa onde o líquido está abaixo de zero. Ver [Cor e exposição](colour-and-exposure.md#the-ramp-editor).

Use a resposta à densidade *Linear* quando interessa o tamanho da diferença: é a única resposta em que a mesma cor significa a mesma contagem.

## Como funciona {#how-it-works}

Cada linha recebe um sinal de +1, -1 ou 0 no shader de vértices ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); um 0 rejeita a linha antes de qualquer fragmento ser desenhado.

- Por grupo, o sinal vem de uma tabela de 4 096 entradas indexada pelo identificador de grupo da linha (o identificador de grupo viaja no quarto canal do texel de posição da linha).
- Por categoria, o sinal vem de uma segunda tabela de 4 096 entradas, preenchida por valor de categoria, e o valor da linha é lido da textura de filtro da coluna; um valor além do fim da tabela é rejeitado nos dois backends.
- Por intervalo, o valor da linha é comparado com os dois intervalos.

Mudar a divisão reinicia a acumulação.

**Os grupos ocultos continuam ocultos com qualquer divisão.** Numa divisão por coluna, a tabela de grupos já não leva sinais; guarda 1 para um grupo visível e 0 para um oculto ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), e as duas tabelas chegam ao shader juntas - duas linhas de uma textura de sinais no WebGL2, duas metades de um mesmo buffer de armazenamento no WebGPU. Uma linha só é desenhada quando o seu grupo está visível *e* o valor da sua coluna está num dos lados. Assim, um grupo desmarcado na [Lista de equipas](teams-list.md), ou deixado de fora pelo foco de lado do separador Partida, não contribui com nada, qualquer que seja a forma como a diferença é dividida.
