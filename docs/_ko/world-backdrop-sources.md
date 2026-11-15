---
title: "세계 배경 - 출처와 용어"
parent: "세계 배경"
grand_parent: "레벨과 배경 지오메트리"
nav_order: 1
lang: "ko"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# 실제 세계 배경: 출처와 용어

[실제 세계 배경](world-backdrop.md)의 지도 데이터는 공개 서비스에서 옵니다. 이 페이지는 각 출처, 그 라이선스, 그리고 3DHeat가 이용 조건 안에 머무는 방법을 나열합니다.

| 출처 | 이용 조건(2026년 11월 7일 기준으로 읽음) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - OpenStreetMap에서 온 OpenMapTiles 스키마 벡터 타일. 현재 빌드는 `https://tiles.openfreemap.org/planet`로 명명됨 | 무료, 키 없음, 상업적 이용 허용. [이용 약관](https://openfreemap.org/tos/)은 "오프라인 다운로드를 제외한 자동화된 방식"으로 데이터를 모으는 것을 금지합니다. 앱은 사용자가 오프라인 사용을 위해 지역을 내려받게 할 수 있지만, 한 번의 다운로드는 최대 3,000 타일 또는 50 MB이고, 병렬 요청은 최대 4개이며, 앱을 식별하는 User-Agent를 가져야 합니다. 출처 표기가 필요합니다: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap"(OpenFreeMap 부분은 선택). 서비스는 예고 없이 끝날 수 있습니다. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) 데이터 | ODbL 1.0. 실행 시 가져와 로컬에서 그리는 것은 개인 사용입니다. 그려진 뷰는 눈에 보이는 출처 표기가 필요한 파생 저작물이며, 그것으로 만든 스크린샷과 영상도 마찬가지입니다. |
| [OpenMapTiles](https://openmaptiles.org) 스키마 | 스키마는 CC BY 4.0. 표기 "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | 퍼블릭 도메인으로 공개됨. 키 없음. 표기 "Runways: OurAirports (public domain)"을 예의상 보여 줍니다. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016 레이어는 CC BY 4.0입니다(이후 연도는 CC BY-NC-SA이며 쓰지 않습니다). EOX의 서비스 페이지는 엔드포인트를 애플리케이션에서 쓰라고 권하며, 보증 없는 데모 서비스로서 속도 제한이 있다고 합니다. 캐싱에 대해서는 아무 말도 없고, CC BY는 캐싱을 허용합니다. 캔버스에 보이는 표기: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", 링크 포함. CORS: 요청의 출처를 그대로 돌려 줍니다. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium 방식으로 인코딩된 512 px 무손실 WebP. 키 없음, 열린 CORS. 출처는 CC BY, 퍼블릭 도메인, 그리고 비슷한 열린 라이선스입니다(비상업이나 동일 조건 공유는 없음). 표기 "© Mapterhorn", 그리고 전 지구 레이어의 경우 "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". 공개 엔드포인트의 공개된 이용 정책은 없습니다. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) 정사영상, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "미국 지질조사국(USGS)의 정보 대부분은 퍼블릭 도메인에 속하며 제한 없이 쓸 수 있습니다". 표기를 요청합니다. 예: "(제품 또는 데이터 이름) courtesy of the U.S. Geological Survey". 서비스는 출처를 "USDA, USGS The National Map: Orthoimagery"라고 밝힙니다(USDA NAIP도 연방 퍼블릭 도메인 저작물입니다). 보이는 표기가 그것입니다. 키 없음, 열린 CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme 이용 조건은 WMTS를 "Non soumis à limite d'usage"(사용 제한 없음. WMS는 초당 40-50 요청으로 제한됨)로 나열합니다. 데이터는 "soumises à la licence choisie et renseignée par le Fournisseur de données"(데이터 제공자가 고른 라이선스)입니다. 기본값은 Etalab Licence Ouverte이며, 2021년부터 BD ORTHO가 이 라이선스로 공개되어 있습니다. 사용자는 "ne pas nuire, entraver ou fausser le bon fonctionnement des API"(API의 정상 작동을 해치거나 방해하거나 왜곡하지 말 것)을 지켜야 합니다. 캐싱은 다뤄지지 않습니다. Licence Ouverte는 출처를 표기하면 재사용을 허용합니다: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". 키 없음, 열린 CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)(Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | 여러 출처의 열린 데이터이며, 각각 자기 표기를 가집니다([목록](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). 키 없음, 서비스 보증 없음, 열린 CORS로 제공됩니다. 높이는 `R × 256 + G + B / 256 − 32768` 미터로 해석됩니다. |

## 배경이 이 조건 안에 머무는 법 {#how-the-backdrop-stays-inside-those-terms}

- 기록 아래의 배경은 고도 타일 최대 36개와 벡터 타일 최대 300개를 내려받습니다. 한 번 만든 전역은 고도 타일 최대 64 + 100개와 벡터 타일 64 + 1,500개를 받습니다. 스트리밍 전역은 카메라가 움직이는 대로, 지도 타일마다 출처별로 한 번에 타일 하나씩을 받습니다. 출처마다 동시에 요청은 네 개입니다.
- **한 번 만든 전역은 다운로드 한 번**이며, 벡터 타일 최대 1,000개 또는 40 MB까지 내려받습니다(OpenFreeMap 이용 조건은 3,000 타일 또는 50 MB를 허용합니다). 타일은 중심부터 먼저 요청합니다. 허용량을 넘으면 빌드는 이미 캐시에 있는 타일만 쓰고, 아직 남은 수를 알려 줍니다. 다시 만들면 다음 덩어리를 받고, 그런 식입니다. 큰 지역은 조각으로 들어오며, 각 조각은 캐시됩니다.
- 합성 비행으로 잰 값: 상세 구역이 25 km인 전역은 처음에 약 370개 타일과 20 MB를 씁니다. 다시 만들거나 되돌아가 따라가면 아무것도 내려받지 않습니다.
- 타일은 **실제 세계 배경**을 누를 때만 내려받으며, 백그라운드에서는 절대 받지 않습니다.
- 브라우저는 페이지가 자기 User-Agent를 정하게 두지 않습니다. 요청에는 브라우저의 것이 실리고, 페이지의 출처가 `Origin`/`Referer`로 실립니다. 뷰어의 데스크톱 빌드는 자기 것을 보내야 합니다.
- **OpenStreetMap에서 파생된 것은 어떤 것도 뷰어와 함께 배포되거나 그 저장소에 커밋되지 않습니다.** ODbL의 동일 조건 공유는 배포되는 파생 데이터베이스에 적용되기 때문입니다. 배경은 사용자의 컴퓨터에서 만들어지고, 그 브라우저에만 보관됩니다(타일 캐시와, 저장했다면 레벨 라이브러리).
