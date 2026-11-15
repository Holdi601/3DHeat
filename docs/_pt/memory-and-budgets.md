---
title: "Memória e orçamentos"
parent: "Carregar dados"
nav_order: 6
lang: "pt"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Memória, orçamentos e verificação de caber

O seu computador tem memória limitada. O 3DHeat soma o que os seus ficheiros precisam e diz-lhe, antes de **Carregar**, se cabem.

![A Estimativa de memória em não cabe, com Carregar a cada [N] linhas já preenchido e o botão Carregar a dizer Demasiado grande - reduza ou desbaste](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Grande demais para este computador? O 3DHeat sugere carregar a cada N linhas.*

Um separador do navegador que fica sem memória a meio de um carregamento falha e perde minutos de trabalho, e uma GPU a quem se pede mais do que tem perde o contexto ou fica muito lenta. Por isso, antes de um carregamento começar, o painel Origem diz quanta memória ele precisa, compara isso com os orçamentos detetados para esta máquina, e recusa - com uma saída - quando não vai caber. O modelo está em [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## A estimativa de memória {#the-memory-estimate}

Mostrada acima do botão **Carregar** depois de as linhas serem contadas.

| Linha | Significado |
|---|---|
| **Estimativa de memória** - *cabe* / *apertado* / *não cabe* | O veredicto, a verde, âmbar ou vermelho. |
| `N linhas · B B/linha` | As linhas que serão carregadas (depois do passo) e os bytes permanentes por linha. |
| `RAM X residente, Y pico ao carregar` | A memória ocupada depois de carregado, e o pico durante o carregamento. |
| `GPU Z · carregamento est. T` | A memória da GPU para as linhas, e uma duração estimada a 1,2 milhões de linhas por segundo. |
| Nome da GPU | O nome do renderizador, quando o controlador o indica. |
| Mensagens | Porque não cabe, ou está apertado, e o que fazer. |
| **Carregar a cada [N] linhas** | O passo de desbaste (ver abaixo). |
| `Orçamento: X RAM, Y GPU. Ajuste em Desempenho → Orçamentos de recursos.` | Os orçamentos que a verificação usou. |

### Bytes por linha {#bytes-per-row}

| Coluna | Permanente (RAM) | Notas |
|---|---|---|
| Posição | 12 | Três números de vírgula flutuante de 32 bits, sempre (um eixo plano é na mesma um vetor) |
| Tempo | 4 | Quando mapeado |
| Tempo de vida | 4 | Quando o tempo e a pessoa estão mapeados |
| Pessoa | 4 | Quando mapeada |
| Grupo | 2 | Quando mapeado |
| Sessão | 4 | Quando mapeada |
| `Ficheiro de origem` | 4 | Quando mais de um ficheiro está carregado |
| Cada coluna de filtro | 4 | Por cada coluna marcada *Manter para filtrar* |

O **pico** acrescenta o que o carregamento precisa só transitoriamente - 8 bytes de tempo de 64 bits durante a junção, 12 bytes de chaves de ordenação e índices, 4 bytes de área de trabalho para a permutação (os três quando o tempo está mapeado), e 4 bytes enquanto a coluna do grupo ainda está em 32 bits - e multiplica a soma por **2,0**. Esse fator foi medido (um carregamento real de vários ficheiros atingiu 1,9× os arrays detalhados, por causa do conjunto de trabalho do descodificador Parquet, das cópias que cortam cada coluna ao seu comprimento, e da memória libertada mas ainda não devolvida) e arredondado para cima, porque uma subestimação custa um separador que falha, e uma sobrestimação custa apenas um passo desnecessário.

Na **GPU** cada linha custa 8 bytes (posição e grupo, 16 bits cada), mais 4 bytes (tempo e tempo de vida, 16 bits cada) quando o tempo e a pessoa estão ambos mapeados. Ver [Residência na memória da GPU](gpu-memory.md). As texturas de filtro (4 bytes por linha por filtro ativo) e os inícios de segmento do calor em linhas (8 bytes por linha com o modo Linhas ligado) não fazem parte desta estimativa.

## A verificação de caber {#the-fit-check}

Três restrições são comparadas ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- a RAM de pico contra o **orçamento de RAM**,
- os bytes da GPU contra o **orçamento de GPU**,
- o número de linhas contra o **limite de ordenação** de 400.000.000 linhas, quando uma coluna de tempo está mapeada.

Decide o pior dos três rácios: até 70% *cabe*, até 100% *apertado* (deve carregar, mas espere que seja lento), acima disso *não cabe*. Quando não cabe, o painel indica a restrição que limita e sugere:

- carregar a cada *N*-ésima linha, com *N* = ⌈linhas / linhas que cabem⌉, já preenchido na caixa do passo;
- deixar cair colunas de filtro, desmapear a coluna de tempo (o que remove a ordenação e o seu limite, ao custo da linha temporal), ou aumentar o orçamento.

Quando o próprio orçamento não é um facto sobre o hardware - o navegador limitou o valor da RAM, a predefinição foi reduzida pelo que está livre neste momento, ou o valor da GPU é um palpite - a mensagem diz isso, para que não recorra a um passo que não precisa.

### Desbaste {#decimation}

**Carregar a cada [N] linhas** mantém uma linha em *N*, contada por ficheiro. O calor é uma média, por isso cada *N*-ésima linha dá a mesma distribuição com mais ruído - a mesma troca que o renderizador já faz em cada fotograma. A caixa começa em 1 (*linha (todas)*); quando a seleção não cabe, fica preenchida com o passo sugerido, a menos que tenha escrito nela. O botão Carregar diz então *Carregar N ficheiros (1 em K)*, e o nome do conjunto de dados regista `every Kth row` (cada K-ésima linha).

### O limite de ordenação {#the-sort-ceiling}

O renderizador precisa das linhas por ordem crescente de tempo, por isso uma coluna de tempo mapeada significa ordenar cada linha, com uma ordenação radix sobre chaves de 32 bits ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Acima de **400 milhões** de linhas isso é recusado em vez de tentado num separador. Isto é verificado antes do carregamento, por isso uma seleção acima do limite é recusada com uma sugestão de passo, em vez de ser lida por inteiro e falhar no último passo. Perto do limite (*apertado*) o painel avisa que a ordenação é uma passagem longa sem progresso próprio. Sem coluna de tempo não há ordenação e nenhum limite se aplica.

## Orçamentos de recursos {#resource-budgets}

**Desempenho → Orçamentos de recursos** (uma linha recolhível no fundo do painel Desempenho, que diz `Orçamentos de recursos - RAM, GPU, núcleos`). Os orçamentos são detetados; o valor detetado é a predefinição; e os controlos deslizantes não vão além de um **limite** que é o valor detetado, exceto quando se sabe que a deteção não é uma medição.

| Controlo | Intervalo | Significado |
|---|---|---|
| **RAM para dados de linhas** | 256 MiB até ao limite de RAM, logarítmico | O orçamento de RAM para a verificação de caber. Marcado *(acima do detetado)* depois da predefinição detetada, *(máx)* no limite. |
| **GPU para dados de linhas** | 128 MiB até ao limite de GPU, logarítmico | O orçamento de GPU para a verificação de caber e para enviar as linhas. Marcado *(acima do detetado)* depois da predefinição detetada, *(máx)* no limite. |
| **Threads de análise** | 1 até ao número de núcleos lógicos | Quantos ficheiros um carregamento analisa ao mesmo tempo, cada um num trabalhador próprio. Predefinição: núcleos - 2 (núcleos - 1 em quatro núcleos ou menos). Ver [Threads de análise](#parser-threads) (em Para programadores). |
| Linha de origens | | De onde veio cada valor (`RAM: …. GPU: …. CPU: ….`). |
| **Detetar novamente** | | Pede ao servidor de desenvolvimento uma nova leitura de memória e recalcula todos os orçamentos. |
| Nome da GPU | | O nome curto do adaptador; a cadeia completa do renderizador está na dica. |

### Aumentar o orçamento de GPU {#raising-the-gpu-budget}

Um orçamento de GPU acima do valor detetado aplica-se como definido: a verificação de caber e o envio usam o mesmo valor a partir de uma função ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), que o limita apenas ao limite de GPU onde o controlo deslizante para. Por isso um carregamento que a verificação aceita é enviado por inteiro. Acima do valor detetado, o controlo deslizante diz *(acima do detetado)*: o número é então o seu juízo sobre a placa, não uma medição, e defini-lo acima do que a placa tem arrisca um contexto perdido ou uma lentidão extrema.

## Conjuntos de dados enormes: as alavancas {#huge-datasets-the-levers}

Da mais barata para a mais drástica:

1. **Menos colunas de filtro.** Cada uma custa 4 bytes por linha e uma passagem de descodificação.
2. **Um passo.** Cada *N*-ésima linha.
3. **Sem coluna de tempo.** Sem ordenação, sem limite de ordenação, sem 4-8 bytes por linha de tempo e tempo de vida - e sem linha temporal.
4. **Aumentar os orçamentos**, quando sabe que a memória está lá.

Na altura de desenhar, os conjuntos de dados grandes são tratados por amostragem e acumulação progressiva em vez de reduzir os dados; ver [Amostragem e orçamentos](sampling-and-budgets.md).

## Para programadores {#for-developers}

### Threads de análise {#parser-threads}

Um carregamento de vários ficheiros analisa até **Threads de análise** deles de cada vez, cada um num trabalhador de análise iniciado pelo trabalhador de ingestão desse carregamento ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Com 1, ou para um só ficheiro, os ficheiros são analisados um a seguir ao outro no próprio trabalhador de ingestão.

Correr vários ao mesmo tempo não afrouxa a verificação de caber:

- **O construtor é contado primeiro.** As colunas fundidas são alocadas para a seleção inteira antes de ser lido o primeiro ficheiro, por isso os ficheiros em curso só recebem o que o orçamento de RAM deixa ao lado deles (`parseHeadroom`): posição, tempo de 64 bits, ângulos de olhar, pessoa, grupo de 32 bits, sessão, colunas de filtro e `Ficheiro de origem`, por linha a carregar - vezes 2,6 quando o número de linhas é uma estimativa de CSV, para uma coluna que cresce até uma maior.
- **Cada ficheiro reserva o seu custo antes de começar** (`fileParseBytes`): as suas linhas (do rodapé Parquet; a parte de um CSV na estimativa pelo tamanho) vezes as mesmas colunas, vezes **8** - o próprio bloco, a cópia ao lado enquanto as linhas sem posição são descartadas, e o conjunto de trabalho do descodificador, que para colunas de texto é muito maior do que os seus ids. Um passo não reduz isto, porque os ficheiros são lidos por inteiro e desbastados depois. O 8 é uma margem definida por medição: com 3, ou com 5, trinta threads de análise levaram um separador acima do limite com 86 milhões de linhas com nomes de pessoas e sessões; com 8 não levaram.
- **Outro ficheiro só começa se a sua reserva couber** no que sobra. Um ficheiro que acabou mas está à espera que um anterior seja fundido mantém a sua reserva até ser fundido.
- **Um ficheiro corre sempre.** Quando nada está reservado, o próximo ficheiro começa seja qual for o custo - é o carregamento um a um que a verificação de caber admitiu, por isso um orçamento apertado recorre a ele em vez de recusar.

O valor *pico ao carregar* é o pico de um carregamento um a um, que acontece na ordenação, depois de todos os ficheiros terem sido lidos. Os ficheiros analisados lado a lado podem ocupar memória acima desse valor enquanto são lidos; as reservas mantêm-no dentro do orçamento de RAM, na medida em que as estimativas acima estejam certas.

A ordem de fusão é a ordem da seleção, seja qual for a ordem em que os ficheiros acabam, por isso a numeração das pessoas, grupos e sessões, as linhas e os valores de `Ficheiro de origem` são idênticos a um carregamento um a um. Um ficheiro que não pode ser lido é saltado e listado exatamente como antes. Um trabalhador de análise que morre termina o carregamento inteiro, como a morte do trabalhador de ingestão sempre fez, e todos os trabalhadores de análise são terminados quando o carregamento acaba, seja qual for a forma como acaba. Se os trabalhadores de análise não puderem ser iniciados de todo, os ficheiros são analisados no trabalhador de ingestão.

### Como os valores são detetados {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) corre ao arrancar, outra vez quando o renderizador existe, e em **Detetar novamente**.

**RAM, com o servidor de desenvolvimento.** `start.bat` e `npm run dev` servem a página a partir de um processo que consegue ler a memória da máquina, em `/__host/memory` (respondido em 1,5 s ou ignorado). A predefinição é o menor entre 60% da RAM instalada e 80% da RAM livre neste momento; o limite é 60% da instalada. Quando é a memória livre que segura a predefinição para baixo, o painel diz isso e sugere fechar programas e carregar em **Detetar novamente**.

**RAM, sem ele** (uma implementação estática): nenhuma API do navegador indica a memória livre, e `navigator.deviceMemory` é arredondado para baixo a uma potência de dois e limitado a 8 GiB pelo Chrome e pelo Edge. A predefinição é 60% de `deviceMemory`, limitada ainda a 4 × o heap JS livre do separador onde o navegador o indica, ou 4 GiB quando nada é indicado. Quando `deviceMemory` lê exatamente 8 (o limite), o valor é assinalado como *limitado* e o limite é 4 × a predefinição, com uma nota de que acima da predefinição o número é a sua afirmação, não uma medição.

**De qualquer forma**, a predefinição e o limite de RAM são limitados a **12 GiB**, a maior memória de arrays tipados que um separador do Chrome consegue ter, qualquer que seja a máquina (uma página chegou a cerca de 15,75 GB e falhou; 12 deixa espaço para tudo o resto), e nunca descem abaixo de 256 MiB.

**Memória da GPU.** Nenhuma API web a indica.

- Com o servidor de desenvolvimento, a memória da placa é lida por `nvidia-smi` (o maior adaptador) ou, no Windows, do valor do registo do adaptador de vídeo `HardwareInformation.qwMemorySize`. A predefinição é 70% dela, o limite 90%.
- Sem leitura, é inferida: 2 GiB por predefinição; 4 GiB quando a maior textura tem 16.384 px ou mais (uma placa dedicada), 1 GiB quando é menor; ou 8 × o `maxBufferSize` do WebGPU quando é maior. O limite é então 8 × o valor inferido, porque a inferência distingue uma parte integrada de uma dedicada e nada mais fino. O painel diz que o valor é inferido.
- Nunca abaixo de 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 quando não é indicado).
