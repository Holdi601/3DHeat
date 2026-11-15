---
title: "Cenário do mundo: fontes e termos"
parent: "Cenário do mundo"
grand_parent: "Níveis e geometria de fundo"
nav_order: 1
lang: "pt"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---


# Cenário do mundo: fontes e termos

Os dados de mapa de um [cenário do mundo](world-backdrop.md) vêm de serviços abertos. Esta página lista cada fonte, a sua licença, e como o 3DHeat se mantém dentro dos termos.

| Fonte | Termos (como lidos a 7 de novembro de 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - tiles vetoriais no esquema OpenMapTiles, a partir do OpenStreetMap, versão atual indicada por `https://tiles.openfreemap.org/planet` | Gratuito, sem chave, uso comercial permitido. Os [termos](https://openfreemap.org/tos/) proíbem a recolha de dados "de forma automatizada, exceto para transferências offline": uma aplicação pode deixar os utilizadores transferir uma área para uso offline se cada transferência tiver no máximo 3 000 tiles ou 50 MB, feita com no máximo 4 pedidos em paralelo, com um User-Agent que identifique a aplicação. A atribuição é obrigatória: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (a parte OpenFreeMap é opcional). O serviço pode acabar sem aviso. |
| Dados do [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Obtê-los em tempo de execução e desenhá-los localmente é uso privado; a vista desenhada é uma Produced Work que precisa de crédito visível, e o mesmo vale para capturas de ecrã e vídeos feitos a partir dela. |
| Esquema do [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 para o esquema; crédito "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Publicado em domínio público; sem chave. O crédito "Runways: OurAirports (public domain)" é mostrado por cortesia. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | A camada de 2016 é CC BY 4.0 (os anos seguintes são CC BY-NC-SA, não usados). A página do serviço da EOX convida a usar os pontos de acesso em aplicações, como serviço de demonstração sem garantia e com limitação de pedidos; não diz nada sobre cache, que a CC BY permite. Crédito, mostrado na tela: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", com ligação. CORS: a origem do pedido é reenviada. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP sem perdas de 512 px codificado em Terrarium, sem chave, CORS aberto. As fontes são de licenças CC BY, domínio público e similares abertas (nenhuma não comercial ou de partilha obrigatória); crédito "© Mapterhorn" e, para a camada global, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Não há política de uso publicada para o ponto de acesso público. |
| Ortofotos do [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map), `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction" (a maior parte da informação do Serviço Geológico dos EUA (USGS) está em domínio público e pode ser usada sem restrições); pede crédito, por exemplo "(Nome do produto ou dos dados) courtesy of the U.S. Geological Survey". O serviço nomeia a sua fonte como "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, também uma obra federal de domínio público); esse é o crédito mostrado. Sem chave, CORS aberto. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Os termos da Géoplateforme indicam o WMTS como "Não sujeito a limite de utilização" (sem limite de uso; o WMS está limitado a 40-50 pedidos por segundo); os dados estão "sujeitos à licença escolhida e indicada pelo Fornecedor de dados", por omissão a Licença Aberta da Etalab, ao abrigo da qual a BD ORTHO está aberta desde 2021; os utilizadores têm de "não prejudicar, entravar ou falsear o bom funcionamento das APIs". O cache não é tratado; a Licença Aberta permite a reutilização com a fonte creditada: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Sem chave, CORS aberto. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Dados abertos de muitas fontes, cada uma com o seu próprio crédito ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); sem chave, sem garantia de serviço, servido com CORS aberto. As alturas descodificam-se como `R × 256 + G + B / 256 − 32768` metros. |

## Como o cenário se mantém dentro desses termos {#how-the-backdrop-stays-inside-those-terms}

- Um cenário sob uma gravação transfere no máximo 36 tiles de altitude e 300 tiles vetoriais; um teatro construído de uma vez, no máximo 64 + 100 tiles de altitude e 64 + 1 500 tiles vetoriais; um teatro em streaming, um tile de cada fonte de cada vez por tile do mapa, à medida que a câmara avança. Quatro pedidos de cada vez por fonte.
- **Um teatro construído de uma vez é uma só transferência**, e transfere no máximo 1 000 tiles vetoriais ou 40 MB (os termos do OpenFreeMap permitem 3 000 tiles ou 50 MB). Os tiles são pedidos começando pelo centro; passada a quota, a construção usa só os tiles já em cache e diz quantos faltam. Construir de novo traz o bloco seguinte, e assim por diante: uma área grande chega aos bocadinhos, cada um em cache.
- Medido em voos sintéticos: um teatro com uma área detalhada de 25 km demora cerca de 370 tiles e 20 MB da primeira vez. Construído de novo, ou voltado a seguir, nada é transferido.
- Os tiles só são transferidos quando se carrega em **Cenário do mundo real**, nunca em segundo plano.
- Um navegador não deixa uma página definir o seu próprio User-Agent; os pedidos levam o do navegador, e a origem da página como `Origin`/`Referer`. Uma versão de desktop do visualizador deve enviar o seu próprio.
- **Nada derivado do OpenStreetMap é alguma vez distribuído** com o visualizador nem enviado para o seu repositório: a partilha obrigatória da ODbL aplica-se a uma base de dados derivada distribuída. Os cenários são construídos na máquina do utilizador e guardados só nesse navegador (a cache de tiles e, se for guardado, a biblioteca de níveis).
