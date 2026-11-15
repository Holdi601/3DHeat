---
title: "Imagens de mapa"
parent: "Níveis e geometria de fundo"
nav_order: 1
lang: "pt"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---


# Imagens de mapa

Uma imagem de mapa é um desenho plano - um minimapa, uma fotografia de satélite, a planta de um piso - posto por baixo dos seus dados, para ver onde está o calor. Diz ao visualizador onde a imagem pertence fixando dois pontos dela em dois sítios do mundo (as "âncoras").

## Carregar e posicionar uma imagem de mapa {#load-and-place-a-map-image}

1. Carregue primeiro os seus dados ([Carregar dados](getting-data-in.md)).
2. Em **Fundo / nível**, carregue em **Imagem de mapa…** e escolha a imagem. Ela é esticada pela área dos dados.
3. Carregue em **Ajustar aos limites dos dados** se a imagem tiver sido movida. A âncora 1 vai para o canto superior esquerdo da imagem, a âncora 2 para o canto inferior direito, nas extremidades dos dados.
4. Se o calor não alinhar com a imagem, escolha dois pontos de referência bem afastados (por exemplo, dois cantos opostos de um edifício ou dois cruzamentos). Leia o píxel de cada um na imagem e a sua posição no mundo (passe o rato com a [régua](measure.md) para ler o **X** e o **Z**).
5. Escreva-os em **Posicionamento**: para a **Âncora 1**, o **px** e o **py** do ponto de referência, o **X do mundo** e o **Z do mundo**; o mesmo para a **Âncora 2**.
6. Verifique: uma trajetória ou um ponto quente que sabe estar numa estrada deve agora estar nessa estrada. Ajuste os números até estar.

![A secção Posicionamento com duas âncoras e calor desenhado sobre uma imagem de mapa](../assets/img/en/map-images-placement.webp)

Os dois pontos de referência têm de diferir tanto nas colunas como nas linhas de píxeis, ou o painel diz *As duas âncoras partilham uma linha ou coluna de píxeis*.

## Carregamento {#loading}

Qualquer formato de imagem que o navegador consiga descodificar. Uma imagem cujo lado maior passe de **8192 px** é reduzida para 8192 (o maior lado que se pede à GPU que aguente), e o painel diz *Reduzida de L×A para l×a*.

Ao carregar, a imagem é esticada pelos limites X-Z dos dados (ou ±1000 unidades sem dados), com o norte para cima, à altura Y mais baixa dos dados. As predefinições são **Opacidade** 100%, **Brilho** 0,7, **Dessaturar** 100%, **Inverter norte/sul** ligado: dessaturada e escurecida, porque o trabalho do fundo é deixar localizar um ponto quente e não competir com ele.

## Controlos {#controls}

| Controlo | Predefinição | Intervalo | Significado |
|---|---|---|---|
| **Opacidade** | 100% | 0-100% | |
| **Brilho** | 0,7 | 0-2 (cursor 64) | |
| **Dessaturar** | 100% | 0-100% | Fundo cinzento, calor saturado. A cor do mapa compete com a cor dos dados. |
| **Inverter norte/sul** | ligado | | Qual a linha da imagem que é o Z máximo do mundo. Mudá-lo com dados carregados volta também a ajustar as âncoras aos limites dos dados. |
| **Posicionamento**: Âncora 1, Âncora 2 | os cantos da imagem nos limites dos dados | | Cada âncora é um píxel da imagem - **px** (a partir da esquerda, de 0 à largura) e **py** (a partir do topo, de 0 à altura) - e a coordenada do mundo onde fica, **X do mundo** e **Z do mundo**. A escala e o deslocamento saem do par. |
| **Ajustar aos limites dos dados** | | | Põe a âncora 1 no canto superior esquerdo da imagem e a âncora 2 no inferior direito, nos limites X-Z dos dados. Um ponto de partida para um posicionamento exato. Precisa de dados. |
| **Elevação** | o Y mais baixo dos dados | Y mínimo dos dados - 500 a Y máximo + 500 (cursor Y máximo + 100 000) | Altura do plano do mapa. Ponha-o logo abaixo dos dados para que nada fique escondido por ele. |

A linha do nome mostra `largura×altura px · x × z m/px`, o tamanho no mundo de um píxel em cada eixo.

## Na cena {#in-the-scene}

A imagem é um único retângulo com textura à altura da elevação. Com opacidade total escreve profundidade, por isso entra na [oclusão](depth-and-culling.md) como chão; abaixo de 100% de opacidade é misturada e não escreve profundidade, por isso não oculta nada. A [régua](measure.md) mede sobre o seu plano. A [biblioteca de níveis](level-library.md) guarda um nível de imagem com as suas âncoras.

## Mapa de Dota 2 {#dota-2-map}

O **Mapa de Dota 2** ao lado de **Imagem de mapa…** vai buscar o desenho do mapa atual do Dota 2 que o [OpenDota](https://www.opendota.com) mostra nas suas páginas de partidas, e posiciona-o sob as tabelas que o [Watcher](https://github.com/Holdi601/3DHeat-Watcher) escreve a partir de repetições do Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). A imagem é transferida de opendota.com quando se carrega no botão e não faz parte do 3DHeat; o desenho do patch mais recente é tirado da lista do próprio OpenDota, e o desenho do 7.40 quando a lista não pode ser lida.

| | |
|---|---|
| Origem | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Posicionamento | A calibração do OpenDota: a imagem abrange as unidades do mundo do Dota de -8192 a 8064 nos dois eixos (células de 128 unidades de 64 a 191), o norte no topo. Com os eixos da tabela de repetição (Z para cima, Y invertido), isso é X do mundo de -8192 a 8064 e Z do mundo de -8064 a 8192. Cerca de 18 unidades por píxel. |
| Elevação | 0. Os heróis ficam de 0 a cerca de 600. |
| Aspeto | Brilho 0,8, dessaturar 50%. |

Verificado numa repetição de uma partida pública do patch 7.40: a trajetória de cada herói segue as linhas desenhadas, e as torres, quartéis e antigos caem sobre as bases desenhadas. A vista **Cima** mostra o mapa com o norte na parte de baixo do ecrã, como mostra qualquer tabela com Z para cima e Y invertido.

O desenho é do OpenDota, do mapa da Valve; a Valve não endossa o 3DHeat.

### O mapa 3D {#the-3d-map}

Com o Dota 2 instalado, o comando [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) do Watcher (`python -m heat3d_watch dota-map -o dota.glb`) cria o mapa em 3D a partir dos próprios ficheiros do jogo: terreno, falésias, água, árvores e edifícios, nas unidades e nos eixos das tabelas das repetições. Carregue o ficheiro uma vez com **Modelo 3D…**: o visualizador reconhece-o pelas suas partes (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` em `dotaMap.ts`), coloca-o de imediato na [biblioteca de níveis](level-library.md), substituindo um mais antigo, e indica-o. A partir daí, **Mapa de Dota 2** carrega esse mapa 3D da biblioteca em vez de transferir o desenho; se não houver nenhum na biblioteca, transfere o desenho e explica como criar o mapa 3D. O ficheiro vem da sua própria instalação e fica no seu computador.

## Para programadores {#for-developers}

### Como as âncoras posicionam a imagem {#how-the-anchors-place-the-image}

De [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), com as âncoras *a* e *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Duas âncoras fixam a escala e o deslocamento de cada eixo de forma independente, por isso um mapa pode ser esticado de forma diferente em X e em Z, mas não rodado. As âncoras têm de diferir em **ambas** as coordenadas de píxel; quando partilham uma linha ou uma coluna, não se pode deduzir escala nenhuma, o mapa não é desenhado, e o painel diz *As duas âncoras partilham uma linha ou coluna de píxeis*.
