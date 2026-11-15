---
title: "Níveis e geometria de fundo"
nav_order: 16
has_children: true
lang: "pt"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Níveis e geometria de fundo

Um nível é o lugar 3D onde o jogo aconteceu - um mapa, uma vila, uma pista. Ponha um por trás dos seus dados e pode ver *onde* está o calor. O painel **Fundo / nível** (ver [Glossário](glossary.md) para "nível") dá-lhe três tipos de contexto:

- uma **imagem de mapa**, georreferenciada por dois pontos de ancoragem - ver [Imagens de mapa](map-images.md);
- um **nível 3D** - `.glb`, `.gltf`, `.obj`, `.stl` ou `.ply` - dividido em chão, estruturas e água e simplificado na importação - ver [Níveis 3D](model-levels.md) e [Aspeto do nível](level-appearance.md);
- um **cenário do mundo** - para uma gravação que indica onde fica na Terra (um ficheiro ACMI do Tacview), o terreno real, estradas, água, aeródromos e edifícios, descarregados de dados abertos - ver [Cenário do mundo](world-backdrop.md).

Sem nada carregado, a cena fica escura com uma grelha e eixos coloridos (**Grelha** e **Eixos** em [Câmara e cena](camera.md)), e o painel diz *Nada carregado - a cena mostra uma grelha e eixos. Acrescente uma imagem de mapa ou uma malha de nível para dar contexto ao calor.*

O nível é partilhado pelos três separadores: um percurso carregado no separador Análise de corrida é o mesmo nível que o mapa de calor mostra.

![O painel Fundo / nível com um nível carregado: botões Imagem de mapa e Modelo 3D, Teatro, Opacidade, Brilho, Guardar na biblioteca e a lista da Biblioteca](../assets/img/en/level-panel.webp)

## Pôr um nível por trás dos seus dados {#put-a-level-behind-your-data}

1. Carregue primeiro os seus dados ([Carregar dados](getting-data-in.md)), para que o nível seja ajustado a eles.
2. Abra **Fundo / nível** na barra lateral.
3. Prima **Imagem de mapa…** para uma imagem ou **Modelo 3D…** para um nível 3D, e escolha o ficheiro. Para uma gravação do mundo real, use antes **Cenário do mundo real** ou **Teatro**.
4. Espere que a linha de progresso termine. Um modelo grande é simplificado primeiro (ver **Objetivo de simplificação** abaixo).
5. Prima **F** na vista para enquadrar tudo. Use **Opacidade** e **Brilho** até o calor se destacar do nível.
6. Prima **Guardar na biblioteca** se vai usar o nível outra vez ([Biblioteca de níveis](level-library.md)).

## O que um nível faz ao calor {#what-a-level-does-for-the-heat}

- **Oculta**: os pontos de dados atrás dele ficam escurecidos por superfície, e os pontos atrás do terreno ficam escondidos ([Profundidade e culling](depth-and-culling.md)). Sem nível, não há oclusão.
- É **cortado** pelo [Corte](slice.md) e, com *Cortar também o nível*, pelo [culling por distância](depth-and-culling.md#distance-culling), juntamente com o calor.
- É a única coisa que a [profundidade de campo](camera.md#depth-of-field) desfoca, para além da grelha e das caixas.
- Um nível 3D **alarga o plano distante da câmara** quando é maior que os dados: o próximo e o distante são calibrados a partir do conjunto de dados, e um mapa exportado com vários quilómetros ficaria inteiramente atrás do plano distante e deixaria a vista vazia. O plano distante passa a ser 3 × a extensão horizontal do nível quando isso é maior, o plano próximo acompanha-o (pelo menos distante / 100 000) para manter a precisão de profundidade de que depende a oclusão, e a velocidade de voo sobe para pelo menos extensão / 12. Só é alargado, nunca estreitado.

## O painel, de cima para baixo {#the-panel-top-to-bottom}

| Parte | Detalhes |
|---|---|
| **Imagem de mapa…**, **Modelo 3D…** | Carrega um; substitui o nível atual. |
| **Cenário do mundo real**, **Esquecer mosaicos** | Só para um conjunto de dados com referência geográfica: constrói o lugar real por baixo como nível, ou apaga os mosaicos descarregados. [Cenário do mundo](world-backdrop.md) |
| **Objetivo de simplificação** | O orçamento de triângulos para a próxima importação de modelo: *Completo - sem simplificação* (predefinição), *Alta - 8M*, *Média - 3M*, *Baixa - 800k*, *Silhueta - 100k*. [Níveis 3D](model-levels.md#simplification) |
| Progresso e **Cancelar** | Durante a descodificação ou a importação. |
| Nota de importação | Triângulos antes e depois, a divisão em chão / estruturas / água, o nível de detalhe usado. |
| Nome e tamanho | `largura×altura px · x × z m/px` para uma imagem, `N triângulos (de M)` para um modelo. |
| **Opacidade**, **Brilho** | Os dois tipos. |
| Controlos da imagem | **Dessaturar**, **Inverter norte/sul**, **Posicionamento** (dois pontos de ancoragem), **Ajustar aos limites dos dados**, **Elevação**. [Imagens de mapa](map-images.md) |
| Controlos do modelo | Relevo do chão, água, triângulos do chão, arame, textura, cor capturada, estruturas, classificação de partes. [Aspeto do nível](level-appearance.md) |
| **Guardar na biblioteca**, **Remover** | [Biblioteca de níveis](level-library.md); Remover descarrega o nível. |
| **Biblioteca** | Níveis guardados neste navegador. [Biblioteca de níveis](level-library.md) |

## Páginas desta secção {#pages-in-this-section}

- [Imagens de mapa](map-images.md)
- [Níveis 3D](model-levels.md) - formatos, partes, classificação, simplificação, texturas
- [Aspeto do nível](level-appearance.md) - cada controlo de um nível 3D
- [Biblioteca de níveis](level-library.md)
- [Cenário do mundo](world-backdrop.md) - o mundo real por baixo de uma gravação, a partir de dados abertos

Como obter níveis de jogos e motores é assunto das ferramentas de exportação separadas (ver o [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) do repositório); o contrato para o qual escrevem está resumido em [Níveis 3D](model-levels.md#the-exporter-contract).
