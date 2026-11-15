---
title: "世界背景：来源与术语"
parent: "世界背景"
grand_parent: "关卡与背景几何体"
nav_order: 1
lang: "zh"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---


# 真实世界背景：来源与术语

[真实世界背景](world-backdrop.md)的地图数据来自公开的服务。本页列出每一个来源、它的许可证，以及 3DHeat 如何保持在其条款之内。

| 来源 | 条款（2026 年 11 月 7 日查阅） |
|---|---|
| [OpenFreeMap](https://openfreemap.org)——来自 OpenStreetMap 的 OpenMapTiles 架构矢量瓦片，当前版本名为 `https://tiles.openfreemap.org/planet` | 免费，无需密钥，允许商业用途。[条款](https://openfreemap.org/tos/)禁止以“自动化方式收集数据，离线下载除外”：应用可以让用户下载某个区域以供离线使用，但每次下载最多 3,000 个瓦片或 50 MB，最多 4 个并行请求，并且 User-Agent 要标识该应用。需要署名：“OpenFreeMap © OpenMapTiles Data from OpenStreetMap”（OpenFreeMap 部分可选）。该服务可能在不另行通知的情况下终止。 |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) 数据 | ODbL 1.0。在运行时获取并在本地绘制，属于私人使用；绘制出的视图是需要明显署名的“演绎作品”，由它制作的截图和视频同样需要署名。 |
| [OpenMapTiles](https://openmaptiles.org) 架构 | 架构采用 CC BY 4.0；署名“© OpenMapTiles”。 |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | 以公共领域发布；无需密钥。出于礼貌，显示署名“Runways: OurAirports (public domain)”。 |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016，`tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016 年图层采用 CC BY 4.0（之后的年份采用 CC BY-NC-SA，本项目不使用）。EOX 的服务页面邀请在应用中使用这些端点，但它是一个不作保证、有速率限制的演示服务；它没有提及缓存，而 CC BY 允许缓存。署名显示在画布上并附有链接：“EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)”。CORS：请求的来源会被原样返回。 |
| [Mapterhorn](https://mapterhorn.com)，`tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium 编码的 512 px 无损 WebP，无需密钥，CORS 开放。来源采用 CC BY、公共领域及类似的开放许可（没有非商业或相同方式共享的许可）；署名“© Mapterhorn”，全球图层还需署名“produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA”。公开端点没有已发布的使用政策。 |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) 正射影像，`basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS：“大多数美国地质调查局（USGS）的信息属于公共领域，可不受限制地使用”；它要求署名，例如“（产品或数据名称）由美国地质调查局提供”。该服务将其来源注明为“USDA, USGS The National Map: Orthoimagery”（USDA NAIP，同样是联邦公共领域作品）；这就是所显示的署名。无需密钥，CORS 开放。 |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO，`data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme 条款将该 WMTS 列为“Non soumis à limite d'usage”（无使用限制；WMS 限制为每秒 40-50 次请求）；数据“soumises à la licence choisie et renseignée par le Fournisseur de données”，默认为 Etalab Licence Ouverte，BD ORTHO 自 2021 年起即在此许可下开放；用户必须“ne pas nuire, entraver ou fausser le bon fonctionnement des API”（不得损害、妨碍或扰乱 API 的正常运行）。条款没有涉及缓存；Licence Ouverte 允许在注明来源的前提下再利用：“Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0”。无需密钥，CORS 开放。 |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)（Mapzen / Tilezen），`s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | 来自许多来源的开放数据，每个来源各有其署名（[列表](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)）；无需密钥，不保证服务，以开放的 CORS 提供。高度解码为 `R × 256 + G + B / 256 − 32768` 米。 |

## 背景如何保持在这些条款之内 {#how-the-backdrop-stays-inside-those-terms}

- 录制下的背景最多下载 36 个高程瓦片和 300 个矢量瓦片；一次性构建的战区最多使用 64 + 100 个高程瓦片和 64 + 1,500 个矢量瓦片；流式战区则随摄像机移动，每个地图瓦片每次只取各来源的一个瓦片。每个来源同时最多发出四个请求。
- **一次构建的战区只下载一次**，并且下载的矢量瓦片最多 1,000 个或 40 MB（OpenFreeMap 的条款允许 3,000 个瓦片或 50 MB）。瓦片优先请求中心部分；超过配额后，构建只会使用缓存中已有的瓦片，并说明还有多少个待获取。再次构建会获取下一批，依此类推：大片区域会分批到达，每一批都会被缓存。
- 在模拟飞行中测得：一个带有 25 km 详细区域的战区，第一次构建需要约 370 个瓦片和 20 MB。再次构建，或飞回到同一处，都不会下载任何内容。
- 只有按下**真实世界背景**时才会下载瓦片，绝不在后台下载。
- 浏览器不允许网页设置自己的 User-Agent；请求会携带浏览器的 User-Agent，以及以 `Origin`/`Referer` 形式携带的页面来源。查看器的桌面版应发送它自己的 User-Agent。
- **绝不随查看器发布或提交到其仓库中任何源自 OpenStreetMap 的内容**：ODbL 的相同方式共享条款适用于已发布的衍生数据库。背景是在用户自己的机器上构建的，并且只保存在该浏览器中（瓦片缓存，以及如果选择保存的话，关卡库）。
