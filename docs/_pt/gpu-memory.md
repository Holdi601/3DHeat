---
title: "Residência na memória da GPU"
parent: "Detalhes da renderização"
nav_order: 5
lang: "pt"
source: "gpu-memory.md"
source_hash: "fba5dac6a137"
translated: true
outdated: false
---


# Residência na memória da GPU

A placa gráfica tem só uma certa quantidade de memória. Se os seus dados não couberem, o visualizador mostra o que cabe e diz isso: o painel de estatísticas ganha uma linha âmbar **Não residente** com o número de linhas que ficaram de fora. Um conjunto de dados encurtado que parecesse completo seria o pior erro que uma ferramenta de análise pode cometer, por isso esta linha nunca é escondida.

![O painel de estatísticas com a linha âmbar Não residente](../assets/img/en/gpu-memory-not-resident.webp)

Para caber mais, aumente o orçamento de GPU em **Orçamentos de recursos** e carregue de novo ([Memória e orçamentos](memory-and-budgets.md#raising-the-gpu-budget)), reduza primeiro os dados, ou use uma placa com mais memória.

## Para programadores {#for-developers}

### Como as linhas são guardadas na GPU {#how-rows-are-stored-on-the-gpu}

As linhas são enviadas uma vez, quando chega um conjunto de dados, em **blocos** de 8 388 608 linhas (2²³) ([`CHUNK_ROWS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Cada bloco é quantificado contra a sua própria caixa delimitadora e o seu próprio intervalo de tempo:

| Dados | Formato | Bytes por linha |
|---|---|---|
| Posição X, Y, Z e o id do grupo | quatro inteiros sem sinal de 16 bits (RGBA16UI em WebGL2); X, Y, Z dentro da caixa delimitadora do bloco | 8 |
| Tempo e tempo de vida (quando o conjunto de dados tem tempo e pessoa) | dois inteiros sem sinal de 16 bits (RG16UI): tempo dentro do intervalo de tempo do bloco; tempo de vida, sendo 65 535 o valor de "sem próxima amostra" | 4 |

São as caixas delimitadoras por bloco que tornam 16 bits suficientes: um bloco cobre normalmente uma fração do mapa, por isso o passo de quantificação fica bem abaixo de um centímetro num mapa com quilómetros de largura, muito abaixo do ruído da telemetria real. O id de grupo que ocupa o quarto canal não custa nada - e é por isso que pode haver no máximo 4 096 grupos ([Grupos](sessions-persons-groups.md#limits)).

Em WebGL2 cada bloco é uma textura com 8 192 texels de largura, preenchida até linhas de textura completas; as linhas são alcançadas a partir de `gl_VertexID` através de uma textura de índices de bloco por fotograma. Em WebGPU são buffers de armazenamento.

Memória adicional da GPU por linha, alocada conforme o uso:

- cada [filtro](filters.md) de coluna ativo: 4 bytes por linha (valores de vírgula flutuante de 32 bits ou ids de categoria), enviado por bloco na primeira vez que o filtro é usado;
- [calor de linha](line-heat.md): 8 bytes por linha (o início de cada segmento, quantificado dentro da caixa delimitadora dos dados, e as suas marcas) enquanto o modo Linhas está ligado.

Acrescem os alvos de renderização: a cor e a profundidade da cena, o alvo de calor e o seu gémeo de trabalho (quatro canais em [Calor por equipa](team-heat.md)), as camadas de *depth peeling* para a [oclusão](depth-and-culling.md); e a geometria do nível.

### O orçamento é imposto no envio {#the-budget-is-enforced-at-upload}

O WebGL aceita alocações que não consegue satisfazer e depois ou perde o contexto ou recorre à memória do sistema a um custo ruinoso; por isso o orçamento de GPU é imposto quando o conjunto de dados é enviado ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/renderer.ts)):

- os blocos são enviados por ordem (ou seja, por ordem de tempo) enquanto cabem;
- o primeiro bloco que não cabe é enviado **parcialmente** - tantas linhas de textura completas quantas o orçamento restante comporta - em vez de não ser enviado, por isso um orçamento que não consegue conter um bloco inteiro ainda mostra o máximo que pode; e como as linhas estão ordenadas no tempo, a parte mostrada é um troço coerente de tempo;
- tudo o que vem depois fica **não residente**.

A falta não fica escondida: o painel de estatísticas mostra uma linha **Não residente**, em âmbar, com o número de linhas que não couberam, sempre que é superior a zero. Um conjunto de dados truncado que parece completo é a pior falha que uma ferramenta de análise pode ter. A [verificação de caber](memory-and-budgets.md#the-fit-check) antes de carregar serve para evitar este caso.

O orçamento que o renderizador usa é o orçamento de GPU de **Orçamentos de recursos**, o mesmo valor que a verificação de caber usa - também acima do valor detetado, até ao teto do cursor (veja [Aumentar o orçamento de GPU](memory-and-budgets.md#raising-the-gpu-budget)). É aplicado quando um conjunto de dados é enviado; se for alterado depois, só tem efeito no carregamento seguinte.
