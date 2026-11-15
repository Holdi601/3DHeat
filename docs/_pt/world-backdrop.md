---
title: "Cenário do mundo"
parent: "Níveis e geometria de fundo"
nav_order: 5
has_children: true
lang: "pt"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Cenário do mundo

Um cenário do mundo põe o terreno real por baixo de uma gravação de voo: colinas, estradas, rios, aeródromos e edifícios, transferidos de dados de mapas abertos e gratuitos. Use-o quando uma gravação do Tacview, de outra forma, flutuaria sobre uma grelha vazia. É um [nível](glossary.md), por isso o calor e as figuras assentam sobre ele.

## Construir um {#build-one}

1. Carregue uma gravação de voo que diga onde na Terra está (um ficheiro `.acmi` do Tacview), ou não carregue nada e escolha um teatro no passo 3. Veja [Carregar dados](getting-data-in.md).
2. Abra **Fundo / nível** na barra lateral.
3. Carregue em **Cenário do mundo real** para construir o terreno por baixo dos seus dados. Ou escolha um mapa de jogo em **Teatro** e carregue em **Construir cenário do teatro** (ou **Transmitir o teatro**).
4. Espere. O painel mostra o progresso (*Mosaicos de elevação*, *Mosaicos de mapa*, *A construir o cenário*); **Cancelar** para.
5. Voe à volta. A linha de créditos dos dados do mapa é escrita no canto inferior direito da vista.

A primeira construção transfere algumas dezenas de megabytes. O navegador guarda-os, por isso uma segunda construção da mesma área não transfere nada. **Esquecer mosaicos** apaga-os. O botão **Cenário do mundo real** só aparece quando os dados carregados trazem uma referência geográfica (abaixo).

Tudo é construído num processo de fundo ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). O resultado substitui o nível atual e comporta-se como qualquer [nível 3D](model-levels.md): esconde o calor que está por trás dele, é cortado pela fatia, tem os [controlos de aspeto](level-appearance.md) e pode ser guardado na [biblioteca](level-library.md).

## Onde estão os dados: a referência geográfica {#where-the-data-is-the-geographic-reference}

Um conjunto de dados só recebe uma referência geográfica de uma fonte que a indique:

- **Uma gravação ACMI**: os valores `ReferenceLatitude` e `ReferenceLongitude` do seu cabeçalho, e posições que o leitor projeta sobre o plano tangente ao elipsoide WGS84 nesse ponto (X a leste, Y a norte, em metros; as alturas são a altitude da gravação acima do nível do mar). A referência fica quando a associação usa **X** e **Y** como eixos do chão - as pistas da própria gravação assim o fazem - e é descartada quando o chão vem de outra coluna, como o **U** e o **V** de um mundo plano próprio de um jogo.
- **Uma tabela Parquet cujas pistas `heat3d` trazem uma entrada `geo`** - as tabelas do DCS, do MSFS, do X-Plane e do IL-2 (Tacview) do [Watcher](https://github.com/Holdi601/3DHeat-Watcher). A entrada está descrita em [Para programadores](#for-developers).

Um carregamento de vários ficheiros só mantém a referência quando todos partilham a mesma. Todos os outros carregadores não são afetados e não trazem nenhuma.

O cenário é projetado da mesma forma e depois passa pela associação de eixos do carregamento, por isso fica por baixo dos dados seja qual for a inversão ou escala que a associação aplique.

## Teatros {#theatres}

O seletor **Teatro** lista os mapas do mundo real do DCS World (Cáucaso, Nevada, Normandia 2, O Canal, Síria, Golfo Pérsico, Marianas, Marianas WWII, Atlântico Sul, Sinai, Afeganistão, Kola, Alemanha Guerra Fria, Iraque) e do IL-2 Great Battles (Estalinegrado, Moscovo, Kuban, Renânia, Normandia, Prokhorovka, Velikie Luki, Arras, Odessa, Golfo da Finlândia / Leninegrado, Coreia), cada um com a sua caixa na Terra ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). As caixas do DCS são as extensões dos editores calculadas a partir das projeções publicadas; as caixas do IL-2, e as do DCS assinaladas como tal, são estimativas a partir dos tamanhos publicados dos mapas e das cidades nas suas bordas - o painel diz qual é qual.

**Construir cenário do teatro** constrói dois níveis de detalhe numa só malha:

| Nível | Área | Terreno | Mapa |
|---|---|---|---|
| Teatro | a caixa inteira | o zoom mais fino até 10 que precisa de no máximo 64 mosaicos de elevação (cerca de 3 km por vértice sobre o Cáucaso, 1 km sobre a Normandia) | o mar, lagos, ocupação do solo e autoestradas de no máximo 64 mosaicos vetoriais de zoom 4 a 9 |
| Área detalhada | **Sob os dados**, **À volta de um ponto** (latitude, longitude, de 12 a 400 km), ou nenhuma | até ao zoom 12 em no máximo 100 mosaicos, no máximo 500 000 vértices | tudo o que está acima, de no máximo 1 500 mosaicos vetoriais no zoom mais fino até 14 que caiba |

A área detalhada corta um buraco na grelha do teatro, alargado até células inteiras para que as duas grelhas partilhem as suas linhas de borda, e uma parede fina fecha a junção onde amostram as alturas de forma diferente.

Com dados carregados, o teatro é construído no plano dos dados, por isso fica por baixo deles tal como foi construído. Sem dados, é construído à volta do próprio ponto de referência do teatro (graus inteiros perto da sua área detalhada). Dados carregados depois numa outra referência - um ficheiro ACMI indica a sua própria - movem o cenário por baixo deles: o deslocamento exato entre as duas projeções é calculado numa grelha de 256 × 256 sobre o cenário e lido entre os nós, dentro de um ou dois metros em todo o teatro ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Um cenário guardado na biblioteca mantém o seu lugar e move-se da mesma forma quando é carregado por baixo de outros dados.

### Transmitir um teatro {#streaming-a-theatre}

**Transmitir o teatro** mostra o teatro como um visualizador de mapas de simuladores de voo: o terreno chega em muitos pequenos mosaicos à volta da câmara, carregados enquanto se voa e largados quando ficam fora de alcance ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Uma árvore quádrupla de mosaicos Web Mercator.** As raízes ao zoom 5 cobrem 1 500 km à volta da câmara, por isso o terreno vai para além da caixa do teatro até ao horizonte. Um mosaico divide-se nos seus quatro filhos enquanto a câmara estiver mais perto do que 1,4 vezes a sua largura, até ao zoom 15 (cerca de 1 km por mosaico, 15 m entre vértices do terreno): o detalhe diminui com a distância como diminui no ecrã.
- **Cada mosaico a sua própria malha**, construída num processo de fundo ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): uma grelha de terreno de 65 × 65 com uma saia à volta da borda (para que vizinhos com detalhes diferentes nunca mostrem uma fenda), ocupação do solo e o mar pintados por cima, estradas, linhas férreas, lagos, rios, aeródromos, pistas medidas e edifícios por cima, e, opcionalmente, a imagem de satélite do seu quadrado. O renderizador desenha os mosaicos com o aspeto e as regras de profundidade do nível, por isso escondem o calor por trás deles como qualquer nível.
- **Primeiro o grosso.** Os mosaicos são pedidos grossos e próximos primeiro, quatro transferências de cada vez por fonte; enquanto os filhos de um mosaico carregam, o mosaico faz as vezes deles, por isso a vista enche de imediato e depois fica nítida.
- **Memória**: os mosaicos construídos mantêm-se até 600 MB, largando primeiro os menos usados recentemente. As **transferências** ficam na cache de mosaicos, limitada a um orçamento de 2 GB, saindo primeiro as mais antigas: voar de novo sobre uma área não custa nada, e não há limite por construção.
- **Guardado na biblioteca** como aquilo que transmite - o teatro, as suas opções e o seu lugar na Terra - e não como mosaicos: carregá-lo volta a transmitir, a partir da cache de mosaicos onde os mosaicos ainda estão. Os cliques e o inspetor atingem os mosaicos como atingem qualquer nível.
- Os dois renderizadores desenham os mosaicos: verificados lado a lado numa GPU real (WebGPU e WebGL2 na mesma placa), incluindo calor escondido atrás de uma crista.
- Com dados carregados, os mosaicos são construídos no plano dos dados; dados carregados depois noutro plano reconstroem-nos aí (a partir da cache).
- Medido em voos sintéticos sobre três pontos (Normandia, Nevada, Síria): cerca de 63, 45 e 24 MB na primeira visita com imagens; uma segunda visita não transfere nada.

## O que é construído {#what-is-built}

| Parte | Fonte | Como |
|---|---|---|
| Imagens (teatros transmitidos, opcional) | EOX Sentinel-2 cloudless 2016 | **Imagens de satélite** cobrem o terreno com o mosaico sem nuvens de 2016 (cerca de 10 m por píxel, zoom 14; mosaicos mais profundos ampliam-no) em vez da ocupação do solo pintada; estradas, pistas, edifícios e nomes ficam por cima. |
| Imagens mais finas (EUA, França) | USGS National Map orthoimagery; IGN BD ORTHO | Com **Imagens de satélite** ativo, um mosaico de mapa do zoom 13 que fique inteiramente dentro dos Estados Unidos contíguos ou da França metropolitana usa a ortofoto nacional, dois zooms mais fundo do que o mosaico (dezasseis dos seus mosaicos montados numa só imagem, cerca de 1-2 m por píxel de perto). EOX em todo o lado. |
| Terreno (teatros transmitidos) | Mapterhorn | Copernicus GLO-30 em todo o lado (cerca de 19 m por píxel no zoom 12), em escala de metros onde está o levantamento próprio de um país (França, EUA e outros); lido dois zooms mais grosso do que cada mosaico. Os AWS Terrain Tiles se o Mapterhorn não estiver acessível. |
| Terreno | AWS Terrain Tiles (PNG Terrarium) | Uma grelha de alturas sobre a caixa: o zoom é o mais fundo até 12 (cerca de 28 m por píxel a 43° N) que precisa de no máximo 36 mosaicos, e a grelha é rarefeita até no máximo 400 000 vértices. Desenhado como chão com as habituais pistas de relevo. |
| Estradas, linhas férreas | Mosaicos vetoriais do OpenFreeMap, camada `transportation` | Faixas planas colocadas sobre o terreno, densificadas ao espaçamento do terreno e elevadas uma pequena percentagem dele para não lutarem com ele. Larguras por classe, de 16 m (autoestrada) a 3 m (trilho, linha férrea); nunca mais estreitas do que a diagonal da caixa / 5000. Caminhos, ferries e túneis ficam de fora. |
| Aeródromos | camada `aeroway` | Polígonos de pista, via de circulação, plataforma e heliporto colocados como chão; as linhas de pista e de via de circulação como faixas de 45 m e 18 m. |
| Água | camada `water` | O mar plano a 0 m, lagos e lagoas planos na sua margem mais baixa, rios colocados sobre o terreno. Desenhada como água: sombreado plano, sem curvas de nível. |
| Ocupação do solo | camadas `landcover` e `landuse` | Pintada nos próprios vértices do terreno, sem triângulos extra: florestas, relva e parques a verde, terras agrícolas a palha, zonas húmidas, areia, rocha, gelo; áreas residenciais, industriais, comerciais, militares e de pedreiras em tons discretos. A água também é pintada por baixo da superfície da água, para que a margem se leia de qualquer altura. O terreno nu recebe um tom de altura discreto (cinzento-verde nas planícies, castanho nas terras altas, neve acima de 3 000 m). Legível à resolução do terreno: cerca de 30-45 m na área detalhada, quilómetros no teatro. |
| Nomes de lugares | camadas `place` e `aerodrome_label` | Cidades, vilas e aldeias, e aeródromos com o seu código ICAO, escritos sobre a vista; até onde cada tipo aparece cresce com a altura da câmara, no máximo 70 de cada vez. |
| Pistas medidas | [OurAirports](https://ourairports.com/data/) `runways.csv` (domínio público) | Opcional (**Pistas do OurAirports**, ativo por omissão): cada pista aberta com as duas cabeceiras na lista, de limiar a limiar na sua largura indicada, com faixas laterais, uma linha central tracejada e barras de limiar. Uma lista de 4 MB, transferida uma vez e guardada na cache. |
| Edifícios | camada `building` | Pegadas extrudidas de `render_min_height` a `render_height` (6 m quando falta) acima do chão mais baixo por baixo delas; as partes `hide_3d` são ignoradas. Desenhados como estruturas. |

As camadas vetoriais são lidas ao zoom 14 (o único zoom com edifícios) quando a caixa precisa de no máximo 300 delas, senão ao zoom mais fundo que o faça, até ao 8. Uma área maior fica só com terreno.

### Aspeto {#look}

Um cenário começa com **Mostrar a cor captada** ativo - a cor é o que distingue uma estrada clara do chão cinzento onde assenta, uma pista escura da sua plataforma - com as arestas dos triângulos do chão desligadas, porque uma grelha regular não diz nada, curvas de nível ténues, um mar opaco (um fundo por baixo dele lutaria pela profundidade da superfície ao longe), e edifícios cinzento-claros e quase sólidos, como um mapa os desenha. O mar aberto não recebe triângulos de chão nenhuns. Tudo o resto é o aspeto por omissão de um nível de modelo.

## Créditos na tela {#credits-on-the-canvas}

Enquanto um cenário é o nível, os créditos das suas fontes são escritos no canto inferior direito da vista, sem precisar de um clique, para que as capturas de ecrã e os vídeos renderizados os levem:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Cada parte liga à página de atribuição da sua fonte (openstreetmap.org/copyright e a [lista de atribuições](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) do Terrain Tiles). Um cenário guardado na biblioteca mantém os seus créditos e volta a mostrá-los quando é carregado. O texto é traduzido com o visualizador; os nomes não.


## Fontes e os seus termos {#sources-and-their-terms}

Cada fonte, a sua licença e como o cenário se mantém dentro dos termos: [Cenário do mundo: fontes e termos](world-backdrop-sources.md).

## A cache de mosaicos {#the-tile-cache}

Cada mosaico, e o TileJSON dos mosaicos vetoriais, é guardado na Cache API do navegador sob `3dheat-world-tiles-v1`, pelo URL. Uma segunda construção da mesma área não faz pedido nenhum e funciona offline: o TileJSON é pedido primeiro e, quando falha, a sua cópia em cache diz quais os mosaicos já guardados. Os mosaicos que o servidor não tem (mar aberto, 404) também ficam registados como ausentes.

Os URL dos mosaicos vetoriais levam a data de construção do mapa, por isso, depois de o OpenFreeMap publicar uma nova construção, o cenário seguinte transfere mosaicos novos e os antigos ficam até serem limpos. A cache é limitada a 2 GB: passado esse valor, apagam-se primeiro os mosaicos guardados há mais tempo. **Esquecer mosaicos** apaga a cache inteira. A cache precisa de uma origem segura (`https://` ou `localhost`); noutro lado, cada construção volta a transferir tudo.

## Comparado com o Tacview {#compared-with-tacview}

Verificado a olho num ponto por teatro, com gravações sintéticas: as corridas de descolagem assentam nas linhas centrais das pistas desenhadas, as travessias da costa caem na costa. O lado do Tacview vem da sua documentação e das suas capturas de ecrã publicadas (tacview.net, a sua página na Steam), não de o correr aqui.

| | Tacview 1.9 | Este cenário, transmitido |
|---|---|---|
| Extensão | o globo inteiro | 1 500 km à volta da câmara, onde quer que ela esteja |
| Terreno | ETOPO1 (cerca de 1,25 km) incorporado; SRTM de 25-75 m se o utilizador instalar os ficheiros; terreno do DCS exportado do DCS | Copernicus GLO-30 (Mapterhorn), em escala de metros em França e nos EUA |
| Imagens | nenhuma incorporada; texturas que o utilizador transfere (Mapview, SAS Planet, complementos como uma carta VFR do Cáucaso) | EOX Sentinel-2 cloudless 2016, cerca de 10 m, transmitido |
| Ocupação do solo | nenhuma, a não ser numa textura | a partir do OpenStreetMap, pintada no terreno (sem imagens) |
| Estradas, linhas férreas | nenhuma, a não ser numa textura | todas as classes perto da câmara, as estradas principais ao longe |
| Edifícios | nenhum | pegadas extrudidas perto da câmara |
| Aeródromos | etiquetas e pistas como caixas planas, sem marcações | pistas de cabeceiras medidas com faixas laterais, linha central e barras de limiar; vias de circulação, plataformas; nomes com códigos ICAO |
| Nomes de lugares | algumas etiquetas de aldeias e cidades | cidades, vilas, aldeias, aeródromos, por distância e altura |

Onde ainda fica aquém:

- **Resolução das imagens**: fora dos EUA e da França, o mosaico de satélite de 10 m é suave abaixo de cerca de 2 km; o Tacview com uma textura de zoom 17 instalada pelo utilizador é mais nítido aí.
- **Terreno na forma própria do DCS**: o Tacview pode mostrar o terreno que o próprio DCS exporta; aqui é a Terra real, que difere do terreno do DCS onde os modeladores do mapa o alteraram.
- **Curvatura**: o chão é um plano plano, por isso o horizonte não é o de uma Terra curva; o Tacview desenha uma esfera.
- **Velocidade**: a primeira visita a um ponto transfere dezenas de megabytes antes de ficar nítido; num navegador com renderização por software (as capturas de ecrã) desenha a poucas imagens por segundo com várias centenas de mosaicos.

## Limites e o que vem depois {#limits-and-what-comes-later}

- **Resolução do terreno**: cerca de 30 m no melhor caso, e mais grosso em áreas grandes. O [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFF otimizados para nuvem na AWS, sem chave, um texto de crédito fixo) é a melhor fonte: 30 m em todo o lado, GLO-90 onde o GLO-30 tem falhas (Arménia e Azerbaijão, que o DCS Caucasus cobre). Precisa de um leitor de GeoTIFF e ainda não é usado.
- **Melhor terreno**: o Copernicus GLO-30 na AWS não envia cabeçalhos CORS, por isso um navegador não o consegue ler; o espelho do OpenTopography pode ser lido (CORS e intervalos), mas os seus termos para o uso em tempo de execução de uma aplicação pública são desconhecidos - a perguntar antes de qualquer uso. O Mapterhorn já traz o GLO-30.
- **Curvatura**: o chão é um plano plano e as alturas não são reduzidas pela curvatura da Terra, em conformidade com a forma como as gravações são colocadas (altitude como altura); longe da referência ambos se afastam juntos, em menos de uma parte por mil a 100 km. Curvar só os mosaicos afastá-los-ia dos dados ao longe, por isso não é oferecido. Um horizonte curvo precisa da mesma queda - distância da câmara ao quadrado sobre o dobro do raio da Terra - aplicada em cada passagem que desenha uma posição (nível, mosaicos, calor, linhas, caixas, etiquetas, seleção) como um uniforme partilhado; um globo verdadeiro precisa de posições centradas na Terra também para os dados e de renderização relativa à câmara. Ambos estão planeados com o modo globo.
- **Só o mundo atual**: os mapas históricos do DCS e do IL-2 (Normandia 2, O Canal, Alemanha Guerra Fria, todos os mapas do IL-2) são desenhados com as cidades, estradas e obras costeiras de hoje; o painel diz isso. Os aeródromos da época não são desenhados.
- **Sem modo globo**: um cenário é um plano local plano. Está planeada uma vista da Terra inteira.
- As estradas são alargadas em áreas grandes para se manterem visíveis; de perto são mais largas do que a vida.
- Os nomes dos teatros do DCS nas tabelas do Watcher são associados como o DCS os dá em `mission.theatre`; um nome que não esteja na lista recorre ao primeiro ponto arredondado a graus inteiros, e só à latitude e longitude.

## Mapas históricos (ainda não construídos) {#historical-maps-not-built-yet}

Os mapas de época poderiam, mais tarde, revestir os teatros históricos. As séries do US Army Map Service (AMS) são obras do governo federal dos EUA, geralmente tratadas como de domínio público (verifique o registo de cada digitalização; muitas são reimpressões de originais britânicos GSGS ou alemães, cujo direito de coroa ou prazo de obra anónima também já expirou):

| Teatro | Série | Onde está digitalizado |
|---|---|---|
| IL-2 Estalinegrado, Moscovo, Kuban, Velikie Luki, Prokhorovka, Leninegrado | AMS **N501**, Europa de Leste 1:250 000 (compilada nos anos 50 a partir de mapas soviéticos e alemães) | UT Austin PCL; algumas folhas georreferenciadas no UT GeoData |
| IL-2 Normandia, DCS Normandia 2 e O Canal | AMS **M661** / GSGS 4250, França 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Renânia | AMS **M501** 1:250 000 e **M841** 1:25 000 (Alemanha) | UT Austin PCL |
| IL-2 Coreia | AMS **L751** 1:50 000 (edições de 1951) e **L552** 1:250 000 | ANU Open Research (folhas L751, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | mapas britânicos de trincheiras da Primeira Guerra (não AMS) | McMaster University; National Library of Scotland (termos não comerciais) |

As folhas do AMS trazem marcas de latitude e longitude nos seus cantos, por isso cada uma seria colocada por um ajuste de quatro cantos e revestida sobre o terreno como uma textura, construída e guardada localmente como os mosaicos.

## Para programadores {#for-developers}

### A entrada `geo` numa tabela Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` e `up` indicam as colunas que contêm os metros para leste e para norte no mesmo plano tangente em (`lat0`, `lon0`) e a altitude. O carregamento traz a referência quando a sua associação usa exatamente essas colunas (leste como X, norte e altura como Y e Z, em qualquer das ordens). A entrada opcional `dcs` indica os metros próprios de uma tabela do DCS (x norte, y acima, z leste) e o seu teatro: um carregamento que associe essas colunas é colocado antes através da projeção de Mercator transversa do teatro ([coordenadas DCS](#dcs-coordinates)). Uma tabela sem `geo` é lida como antes.

### Coordenadas DCS {#dcs-coordinates}

Cada teatro do DCS é uma projeção de Mercator transversa (WGS84, escala 0,9996) com o seu próprio meridiano central e origem falsa, sendo o x do DCS a distância norte e o z a distância leste. As constantes são as que o projeto pydcs publica; a matemática é a série de Krüger de sexta ordem (Karney 2011), portada para [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Um cenário para metros do DCS é construído diretamente nelas, por isso uma tabela DCS do Watcher associada por `dcs_x`/`dcs_y`/`dcs_z`, um nível que o conversor de terreno do DCS escreveu e o cenário partilham todos o mesmo referencial. As constantes do Iraque não são publicadas; são ajustadas a pontos de referência publicados (4 cm de erro quadrático médio).

As tabelas DCS do Watcher estão num plano tangente no ponto de referência fixo do teatro (o mesmo ponto que o seletor de teatros usa, abaixo), por isso várias missões num mesmo teatro juntam-se com a referência intacta e alinham-se com um cenário do teatro sem o mover.

### Simplificação e orçamento {#simplification-and-budget}

- Os edifícios com menos de 20 m² são descartados; 60 m² quando a caixa tem mais de 30 km de lado, 150 m² para além de 80 km. Os restantes são acrescentados do maior para o menor até os edifícios chegarem a 1,5 M de triângulos.
- Estradas secundárias, de serviço e trilhos são descartados para além de 60 km de lado; para além de 150 km ficam só autoestradas, estradas principais, primárias e secundárias.
- O cenário inteiro fica abaixo de cerca de 3 M de triângulos. A nota de importação diz quantos edifícios ficaram de fora.
