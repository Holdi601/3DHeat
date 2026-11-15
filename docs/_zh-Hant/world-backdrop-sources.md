---
title: "世界背景 - 來源與術語"
parent: "世界背景"
grand_parent: "關卡與背景幾何"
nav_order: 1
lang: "zh-Hant"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# 世界背景：來源與條款

[世界背景](world-backdrop.md)的地圖資料來自公開服務。本頁列出每個來源、其授權，以及 3DHeat 如何遵守其條款。

| 來源 | 條款（2026 年 11 月 7 日查閱） |
|---|---|
| [OpenFreeMap](https://openfreemap.org)：源自 OpenStreetMap 的 OpenMapTiles 結構向量圖塊，目前版本由 `https://tiles.openfreemap.org/planet` 指定 | 免費、無需金鑰，允許商業使用。[條款](https://openfreemap.org/tos/)禁止「以自動化方式收集資料，離線下載除外」：應用程式可讓使用者下載某個區域供離線使用，前提是每次下載最多 3,000 個圖塊或 50 MB，並以最多 4 個並行請求進行，且請求帶有識別該應用程式的 User-Agent。須標示出處：「OpenFreeMap © OpenMapTiles Data from OpenStreetMap」（OpenFreeMap 的部分可選）。服務可能在未經通知的情況下終止。 |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) 資料 | ODbL 1.0。在執行期間取得並在本機繪製，屬於私人使用；繪製出的畫面為需要明顯署名的「衍生作品」，由它製作的螢幕截圖與影片同樣適用。 |
| [OpenMapTiles](https://openmaptiles.org) 結構 | 結構採用 CC BY 4.0；署名「© OpenMapTiles」。 |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | 以公共領域釋出；無需金鑰。基於禮貌，顯示署名「Runways: OurAirports (public domain)」。 |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016，`tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016 年圖層採用 CC BY 4.0（較後期的年份為 CC BY-NC-SA，本專案未使用）。EOX 的服務頁面邀請在應用程式中使用這些端點，但這是一項附帶無保證、且有速率限制的示範服務；它未提及快取，而 CC BY 允許快取。署名（顯示於畫布上）：「EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)」，並附連結。CORS：會回傳請求的來源。 |
| [Mapterhorn](https://mapterhorn.com)，`tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium 編碼、512 px 無損 WebP，無需金鑰，CORS 開放。來源採用 CC BY、公共領域及類似的開放授權（沒有非商業或相同方式分享的授權）；署名「© Mapterhorn」，而全球圖層另需署名「produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA」。公開端點沒有已發布的使用政策。 |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) 正射影像，`basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS：「Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction」（大部分美國地質調查局資料屬於公共領域，可不受限制地使用）；它要求署名，例如「(Product or data name) courtesy of the U.S. Geological Survey」。該服務將其來源命名為「USDA, USGS The National Map: Orthoimagery」（USDA NAIP，同樣是聯邦公共領域著作）；這就是顯示的署名。無需金鑰，CORS 開放。 |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO，`data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme 條款將 WMTS 列為「Non soumis à limite d'usage」（不受使用限制；WMS 則限制為每秒 40-50 次請求）；資料「soumises à la licence choisie et renseignée par le Fournisseur de données」（受資料提供者所選並註明的授權約束），預設為 Etalab Licence Ouverte，BD ORTHO 自 2021 年起即依此授權開放；使用者必須「ne pas nuire, entraver ou fausser le bon fonctionnement des API」（不得損害、妨礙或干擾 API 的正常運作）。條款未提及快取；Licence Ouverte 允許在註明來源的前提下再利用：「Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0」。無需金鑰，CORS 開放。 |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)（Mapzen／Tilezen），`s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | 來自多個來源的開放資料，每個來源各有其署名（[清單](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)）；無需金鑰，無服務保證，以開放 CORS 提供。高度解碼為 `R × 256 + G + B / 256 − 32768` 公尺。 |

## 背景如何遵守這些條款 {#how-the-backdrop-stays-inside-those-terms}

- 錄影下的背景最多下載 36 個高程圖塊與 300 個向量圖塊；一次建立的戰區最多下載 64 + 100 個高程圖塊與 64 + 1,500 個向量圖塊；串流式戰區則依相機移動，每個地圖圖塊一次只取各來源的一個圖塊。每個來源同時最多四個請求。
- **一次建立的戰區只需下載一次**，且每次下載最多 1,000 個向量圖塊或 40 MB（OpenFreeMap 的條款允許 3,000 個圖塊或 50 MB）。圖塊會先請求中心的部分；超過配額時，建立程序只會使用快取中已有的圖塊，並說明還有多少尚未取得。再次建立時會取得下一批，依此類推：大區域會分批到達，每一批都會被快取。
- 在合成飛行中的測量：一個包含 25 km 詳細區域的戰區，首次約需 370 個圖塊與 20 MB。再次建立，或之後往回飛越，則不會下載任何東西。
- 只有在按下**世界背景**時才會下載圖塊，絕不會在背景中下載。
- 瀏覽器不允許網頁自行設定 User-Agent；請求會帶有瀏覽器的 User-Agent，以及網頁的來源作為 `Origin`／`Referer`。桌面版的檢視器應送出自己的 User-Agent。
- **絕不會隨檢視器發布或提交到其儲存庫中，任何衍生自 OpenStreetMap 的內容**：ODbL 的相同方式分享條款適用於散布的衍生資料庫。背景是在使用者的電腦上建立的，且只保存在該瀏覽器中（圖塊快取，以及若有儲存的話，關卡庫）。
