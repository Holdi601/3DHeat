---
title: "世界の背景 - 出典と用語"
parent: "世界の背景"
grand_parent: "レベルと背景のジオメトリ"
nav_order: 1
lang: "ja"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# 現実世界の背景: 出典と利用規約

[現実世界の背景](world-backdrop.md)のマップデータは、公開されたサービスから来ています。このページでは、各出典、そのライセンス、そして 3DHeat がその規約の範囲内にとどまる方法を説明します。

| 出典 | 規約（2026 年 11 月 7 日に読んだ内容） |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - OpenStreetMap 由来の OpenMapTiles スキーマのベクタータイル。現在のビルドは `https://tiles.openfreemap.org/planet` | 無料、キー不要、商用利用可。[規約](https://openfreemap.org/tos/)は「オフラインのダウンロードを除き、自動化された方法でデータを収集すること」を禁じています。アプリは、各ダウンロードが最大 3,000 タイルまたは 50 MB であり、並列リクエストが最大 4 件で、アプリを識別する User-Agent を付けていれば、利用者にオフライン用の地域のダウンロードを許せます。帰属表示が必要です: 「OpenFreeMap © OpenMapTiles Data from OpenStreetMap」（OpenFreeMap の部分は任意）。サービスは予告なく終了することがあります。 |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) のデータ | ODbL 1.0。実行時に取得してローカルで描くのは私的な利用です。描かれたビューは、見える形での表示が必要な「派生作品」です。そこから作られたスクリーンショットや動画も同様です。 |
| [OpenMapTiles](https://openmaptiles.org) スキーマ | スキーマは CC BY 4.0。表示 "© OpenMapTiles"。 |
| [OurAirports](https://ourairports.com/data/) の `runways.csv` | パブリックドメインとして公開。キー不要。表示 "Runways: OurAirports (public domain)" は好意として示します。 |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016、`tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016 年のレイヤーは CC BY 4.0 です（後の年は CC BY-NC-SA で、使っていません）。EOX のサービスページは、保証のないデモサービスとして、レート制限付きで、アプリケーションでエンドポイントを使うことを勧めています。キャッシュについては触れていません。CC BY はキャッシュを許可しています。キャンバス上に表示する表記: 「EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)」、リンク付き。CORS: リクエストの元が返されます。 |
| [Mapterhorn](https://mapterhorn.com)、`tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium 形式で符号化された 512 px のロスレス WebP。キー不要、オープンな CORS。出典は CC BY、パブリックドメイン、同様のオープンライセンス（非営利や継承（share-alike）のものはなし）。表示 "© Mapterhorn"、そして全球の層については "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA"。公開エンドポイントについて公表された利用方針はありません。 |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) のオルソ画像、`basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: 「米国地質調査所（USGS）の情報の大部分はパブリックドメインにあり、制限なく使えます」。表示を求めています。例: 「(Product or data name) courtesy of the U.S. Geological Survey」。サービスは出典を「USDA, USGS The National Map: Orthoimagery」（USDA NAIP も連邦のパブリックドメインの著作物）と名付けており、それが表示される表記です。キー不要、オープンな CORS。 |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO、`data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme の規約は、WMTS を「Non soumis à limite d'usage」（利用制限なし。WMS は毎秒 40〜50 リクエストに制限）と記しています。データは「提供者が選択し記載したライセンスに従う」もので、既定は Etalab Licence Ouverte です。BD ORTHO は 2021 年以降、このライセンスで公開されています。利用者は「API の正常な動作を妨げ、阻害し、または歪めないこと」が求められています。キャッシュについては触れていません。Licence Ouverte は、出典を明記すれば再利用を許可しています: 「Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0」。キー不要、オープンな CORS。 |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)（Mapzen / Tilezen）、`s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | 多くの出典によるオープンデータで、それぞれが独自の表示を持ちます（[一覧](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)）。キー不要、サービスの保証なし、オープンな CORS で配信。高さは `R × 256 + G + B / 256 − 32768` メートルとして復号されます。 |

## 背景がその規約の範囲内にとどまる方法 {#how-the-backdrop-stays-inside-those-terms}

- 記録の下にある背景は、最大 36 個の標高タイルと 300 個のベクタータイルだけをダウンロードします。一度作られた戦域は最大 64 + 100 個の標高タイルと 64 + 1,500 個のベクタータイルです。ストリーミングされる戦域は、カメラの動きに応じて、マップタイルごとに各ソースから1タイルずつです。ソースごとに一度に4件のリクエストです。
- **一度作られた戦域は、1回のダウンロードです。** ダウンロードは、最大 1,000 個のベクタータイルまたは 40 MB です（OpenFreeMap の規約は 3,000 タイルまたは 50 MB を許可しています）。タイルは中心から先に要求されます。許容量を超えると、作成はキャッシュにすでにあるタイルだけを使い、まだ残っている数を表示します。もう一度作成すると次の塊が取得され、以下同様です。大きな地域は断片として届き、それぞれがキャッシュされます。
- 合成のフライトでの計測: 25 km の詳細な地域を持つ戦域は、初回に約 370 タイルと 20 MB を要します。もう一度作るか、後から戻ってくると、何もダウンロードされません。
- タイルは、**現実世界の背景**を押したときだけダウンロードされ、バックグラウンドでは決してダウンロードされません。
- ブラウザーは、ページが自分の User-Agent を設定することを許しません。リクエストにはブラウザーのものが付き、ページの元は `Origin` / `Referer` として送られます。ビューアーのデスクトップ版は、自分の User-Agent を送るべきです。
- **OpenStreetMap 由来のものは、決してビューアーと一緒に配布されず、そのリポジトリにコミットされることもありません。** ODbL の継承の条項は、配布された派生データベースに適用されるためです。背景は利用者のマシンで作られ、そのブラウザーにだけ保存されます（タイルのキャッシュ、保存する場合はレベルライブラリ）。
