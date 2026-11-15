---
title: "Carregar dados"
nav_order: 3
has_children: true
lang: "pt"
source: "getting-data-in.md"
source_hash: "35eb9e47859c"
translated: true
outdated: false
---

# Carregar dados

Antes de o 3DHeat conseguir desenhar fosse o que fosse, precisa de uma tabela: cada linha diz onde algo esteve e, se tiver essa informação, quando e quem. Esta secção mostra como um ficheiro se torna numa imagem. Ainda não tem dados? Experimente os [dados de demonstração](demo-data.md).

**Faça isto agora:**

1. Na barra lateral do Mapa de calor abra **Origem** e prima **Ficheiros…** (ou largue um ficheiro ou uma pasta na zona de largar).
2. Veja o **Mapeamento de colunas**: as caixas costumam já estar preenchidas.
3. Confirme que a **Estimativa de memória** diz *cabe*.
4. Prima **Carregar**.

```mermaid
flowchart LR
  A["Origem<br/>escolher ficheiros ou uma pasta"] --> B["Pré-visualização<br/>primeiras linhas"]
  B --> C["Mapeamento de colunas<br/>X, Y, Z, tempo, pessoa, equipa"]
  C --> D["Estimativa de memória<br/>cabe, justo ou não cabe"]
  D --> E["Carregar"]
  E --> F["A imagem"]
```

Tudo o que o separador Mapa de calor mostra vem de um único **conjunto de dados**: uma tabela de linhas, cada uma com uma posição e, opcionalmente, um tempo, uma pessoa, um grupo, uma sessão, uma direção de olhar e um número qualquer de colunas extra guardadas para filtrar. Esta secção explica como se cria um conjunto de dados.

## O caminho dos ficheiros até à imagem {#the-path-from-files-to-picture}

1. **Selecionar ficheiros** no painel **Origem** - um ficheiro, vários, uma árvore de pastas, ou arrastando-os. Aceitam-se Parquet, CSV, Tacview, trajetos GPS e mais; a lista completa está em [Formatos de dados](data-formats.md#files). Ver [Carregar ficheiros](loading-files.md).
2. **Pré-visualização.** Abre-se o primeiro ficheiro da seleção: os nomes das suas colunas, as suas primeiras 50 linhas, quais as colunas que parecem numéricas e (Parquet) o tipo lógico de cada coluna e as instruções de leitura próprias do ficheiro, a entrada `heat3d` do rodapé.
3. **Mapeamento automático.** As colunas são atribuídas a funções - X, Y, Z, tempo, pessoa, sessão, grupo, direção do olhar - e um punhado fica guardado para filtrar. Cada suposição é mostrada no painel **Mapeamento de colunas** e pode ser alterada. Ver [Mapeamento de colunas](column-mapping.md) e [Eixos, unidades e tempo](axes-units-and-time.md).
4. **Contagem.** O número de linhas de cada ficheiro é lido (exato nos rodapés do Parquet, estimado no CSV), para que o painel possa dizer, antes de carregar seja o que for, quanta memória a carga precisa e se cabe. Se não couber, propõe carregar cada *N*-ésima linha. Ver [Memória e orçamentos](memory-and-budgets.md).
5. **Carregar.** Um worker em segundo plano interpreta só as colunas mapeadas de cada ficheiro - vários ficheiros de cada vez, até ao orçamento de [threads de leitura](memory-and-budgets.md#parser-threads) - e junta-os, pela ordem da seleção, num único conjunto de dados: um dicionário partilhado de pessoas, grupos e sessões em todos os ficheiros, uma origem de tempo comum, todas as linhas ordenadas por tempo. Ver [Sessões, pessoas e grupos](sessions-persons-groups.md).
6. **Envio.** A thread principal anuncia "A enviar N linhas para a GPU" durante uma imagem, e depois empacota as linhas na memória da GPU dentro do orçamento da GPU. Ver [Permanência na memória da GPU](gpu-memory.md).
7. **Primeira imagem.** A câmara enquadra os dados, o raio e a saturação dos sprites são definidos a partir da extensão dos dados e do número de linhas, e depois de 8 imagens renderizadas a saturação é medida a partir da própria imagem ([Cor e exposição](colour-and-exposure.md)).

## Requisitos, verificados antes de carregar {#requirements-checked-before-a-load}

| Necessidade | O que acontece sem ela |
|---|---|
| **Pelo menos dois de X / Y / Z** | A carga é recusada. Com exatamente dois, o terceiro eixo é 0 e os dados são desenhados como um plano na cena 3D - que é o que quer um mapa de calor visto de cima. |
| Uma coluna de tempo | Opcional. Sem ela a linha temporal fica desativada, a vista fica no modo **Tudo** e a barra lateral diz isso. |
| Uma coluna de pessoa | Opcional. Necessária para a [sobreposição de figuras](box-replay.md) (uma figura por pessoa), o [calor em linhas](line-heat.md) (o percurso de cada pessoa), a interpolação, os rastos e o histórico **Tempo de vida**. |
| Uma coluna de grupo | Opcional. Necessária para o [calor por equipa](team-heat.md) e para o modo [diferença](difference.md) (pelo menos dois grupos). |

Um modo que os dados carregados não suportam fica a cinzento na barra de modos; passar o rato por cima diz porquê.

## Sem dados seus {#without-your-own-data}

O painel **Conjunto de dados** (por baixo de **Origem**) tem um [gerador sintético](synthetic-generator.md) que produz um conjunto de dados com a forma de um battle royale e de qualquer tamanho, útil para experimentar o visualizador e para testar o que uma máquina aguenta.

## Páginas desta secção {#pages-in-this-section}

- [Carregar ficheiros](loading-files.md) - seletores, pastas, arrastar e largar, junção de vários ficheiros, a regra do ficheiro de movimento, progresso e cancelamento
- [Mapeamento de colunas](column-mapping.md) - cada campo do painel de mapeamento, como o mapeamento automático adivinha, as sugestões `heat3d`
- [Eixos, unidades e tempo](axes-units-and-time.md) - eixo para cima, inversões, escala de unidades, unidades de tempo, direção do olhar
- [Sessões, pessoas e grupos](sessions-persons-groups.md) - o que faz cada um, os limites, nomes partilhados, tamanho das entidades, o painel Conjunto de dados
- [Gerador sintético](synthetic-generator.md)
- [Memória e orçamentos](memory-and-budgets.md) - o modelo de ocupação, a verificação de caber, decimação, o limite de ordenação, orçamentos de recursos
