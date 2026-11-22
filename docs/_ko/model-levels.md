---
title: "3D 레벨"
parent: "레벨과 배경 지오메트리"
nav_order: 2
lang: "ko"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D 레벨

3D 레벨은 데이터가 놓인 장소의 모델입니다. 언덕, 거리, 건물입니다. 열이 어느 층, 언덕, 또는 옥상에 있는지 볼 수 있게 해 줍니다. 뷰어는 그것을 지면(단단함), 구조물(비쳐 보임. 안을 들여다볼 수 있음), 그리고 물로 나눕니다.

## 3D 레벨 불러오기 {#load-a-3d-level}

1. 먼저 데이터를 불러옵니다([데이터 넣기](getting-data-in.md)). 모델은 데이터와 같은 세계 공간과 단위를 써야 하며, Y가 위입니다.
2. **배경 / 레벨**에서 **단순화 목표**를 고릅니다. 모델이 아주 크지 않다면 *전체 - 단순화 없음*으로 두세요.
3. **3D 모델...**을 누르고 `.glb`, `.gltf`, `.obj`, `.stl`, `.ply` 파일을 고릅니다.
4. 진행 줄을 기다립니다. **취소**는 멈춥니다.
5. 보기에서 **F**를 누릅니다. 지면은 단단하고, 구조물은 비쳐 보이는 껍데기이며, 물은 평평합니다.
6. [레벨 모양](level-appearance.md)에서 보이는 모습을 조정합니다. 결과를 간직하려면 **라이브러리에 저장**을 누르세요([레벨 라이브러리](level-library.md)).

![불러온 3D 레벨: 등고선이 있는 불투명한 지면, 비쳐 보이는 건물, 평평한 물](../assets/img/en/model-levels-loaded.webp)

**3D 모델...**은 레벨 메시를 불러옵니다. 배경 작업자([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts))에서 파싱하고, 분류하고, 단순화합니다. 진행 줄과 **취소**가 있습니다. *Reading model*, *Parsing file*, *Packing N textures*, *Classifying N parts*, *Simplifying ground (N tris)*, *Simplifying structures (N tris)*, *Building wireframe* 순서입니다.

## 형식 {#formats}

| 형식 | 읽는 것 | 한계 |
|---|---|---|
| `.glb` | 모드 `mode` 4(삼각형) 또는 모드가 없는 모든 메시 기본 요소. 각 노드의 세계 변환을 적용. `POSITION`. 정점 색으로 `COLOR_0`(vec3 또는 vec4). 재질의 `baseColorTexture`와 `TEXCOORD_n`은 텍스처로. 노드와 메시 이름은 부분 이름으로. | 선과 점은 건너뜁니다. |
| `.gltf` | 같습니다. | 내장 버퍼가 있을 때만. 외부 `.bin`을 참조하는 glTF는 *Export as a single .glb so the geometry is embedded.*와 함께 거부합니다. |
| `.obj` | 면. `o`와 `g` 블록은 부분으로. | 기하만 (재질 없음). |
| `.stl` | 이진과 ASCII(`solid …`). | 부분 하나. |
| `.ply` | ASCII만. | 이진 PLY는 *Convert to .glb or binary .stl.*와 함께 거부합니다. |

기하만 읽습니다. 위치, 법선, 삼각형을 하나의 버퍼로 용접하고, 있으면 색과 텍스처 좌표도 함께([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). 삼각형이 없는 모델은 거부합니다. 모델은 데이터와 같은 세계 공간과 단위(Y가 위)에 있어야 합니다. 맞추기 위해 아무것도 변환하지 않습니다.

## 지면, 구조물과 물 {#ground-structures-and-water}

레벨은 불러올 때 세 가지 종류로 나뉩니다. 서로 반대되는 처리가 필요하기 때문입니다([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)).

- **지면** - 불투명하게 그리고, 기복 단서(경사, 등고선, 고도 그라데이션)로 음영을 줍니다. 그래서 그것에 대해 위치를 읽을 수 있습니다.
- **구조물** - 건물과 소품은 카메라와 그 안의 열 사이에 서므로, **투명한 껍데기**로 그립니다(밝은 테두리가 있는 희미한 면, 그리고 중복 제거한 모서리). 또는 텍스처가 있으면 그 텍스처대로 단단하게.
- **물** - 평평하고, 지형 단서가 없습니다. 호수를 가로지르는 등고선은 말이 안 되기 때문입니다.

각 부분(glTF 노드, OBJ 객체 또는 그룹)은 적용되는 첫 규칙으로 따로 분류합니다.

1. **내보내기 도구의 라벨.** `ground:`, `structure:`, `water:`(또는 `:` 대신 `|`)로 시작하는 이름은 그대로 믿습니다. 프로젝트 자체 내보내기 도구는 모든 부분을 이렇게 라벨링합니다.
2. **물 이름.** 단어로서의 `water`(*water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*는 제외), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **지면 이름.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **구조물 이름.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **기하.** 맵의 X-Z 면적의 25%보다 넓게 덮고, 삼각형 면적의 60%보다 많이 위를 향하는 부분은 지면입니다. 위를 향하는 비율이 45% 미만이거나, 레벨 높이의 15%보다 높고 면적의 10% 미만을 덮는 부분은 구조물입니다. 위를 향하는 비율은 면적으로 가중하므로, 지붕이 있다고 집이 평평하다고 불리지 않습니다.
6. **그 밖에는 지면** - 애매한 부분은 지면으로 기본 설정합니다. 거의 보이지 않는 껍데기를 기본으로 하면 레벨이 렌더링 실패처럼 보이기 때문입니다.

구조물로 분류된 부분 하나짜리 모델은 대신 지면으로 만듭니다(*single unnamed mesh - treated as ground*).

### 내비게이션 메시 {#navigation-meshes}

`nav:…`로 이름 붙은 부분(레벨 내보내기 도구의 `nav:walkable`)은 내비게이션 메시입니다. 병사가 설 수 있는 곳입니다. 지면으로 나열되지만(*navigation mesh - not drawn, as it lies on the ground; clicks still find it*) **그리지 않습니다**. 그것이 만들어진 지면 위에 씌워져 있고, 몇 센티미터 안에서 그 지면과 같은 평면이므로, 지면으로 그리면 두 표면이 픽셀마다 싸웁니다. 구운 지면 텍스처가 있는 레벨에서는 플레이 가능한 전체 구역이 내비 삼각형마다 하나씩, 회색과 베이지색의 날카로운 가장자리 패치로 보였습니다. 그것은 단순화하지 않고 보관하므로, [클릭해서 고르기](camera.md#click-to-pick)가 그 장소를 걸을 수 있는지 말할 수 있습니다. 라이브러리 항목은 그것을 보관하지 않습니다.

패널의 **부분 분류 표시 (N)**(부분이 둘 이상인 모델에 표시)은 모든 부분을 그 종류와 이유와 함께 나열합니다. *labelled by the exporter*, *name matches pattern*, *covers X% of the map, Y% up-facing*, *Y% up-facing, Z% of level height*, *ambiguous - defaulted to ground*. 하나를 바꾸려면 원본 모델에서 부분의 이름을 바꾸고 다시 불러오세요. 나눔은 인덱스 버퍼에 구워져 있습니다.

## 단순화 {#simplification}

**단순화 목표**는 다음 불러오기의 삼각형 예산을 정합니다([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)).

| 설정 | 삼각형 |
|---|---|
| *전체 - 단순화 없음* (기본) | 전부 |
| *높음 - 삼각형 800만* | 8,000,000 |
| *중간 - 삼각형 300만* | 3,000,000 |
| *낮음 - 삼각형 80만* | 800,000 |
| *실루엣 - 삼각형 10만* | 100,000 |

예산은 **60%는 구조물에, 40%는 지면에** 나누며, 따로 단순화합니다. 솎아내기에서 구조물이 모양을 가장 빨리 잃기 때문입니다. 물은 단순화하지 않습니다. 단순화는 쿼드릭 오차 척도를 쓰는 간선 축소입니다([meshoptimizer](https://github.com/zeux/meshoptimizer), WebAssembly 경유). 일치하는 정점을 용접한 뒤이므로 실루엣과 날카로운 가장자리가 살아 남습니다. 불러오기 메모는 `source → now triangles, deviation X%`, 부분들에 걸친 지면 / 구조물 / 물의 나눔을 보고하며, 삼각형이 800만을 넘는 모델에서 *전체*를 썼을 때는 *높음*(최대 3천만) 또는 *중간*(그 이상)을 제안합니다. WebAssembly가 없으면 단순화기를 쓸 수 없으며, 불러오기가 그렇게 말합니다.

프로젝트 자체 내보내기 도구의 레벨은 이미 예산이 정해져 있습니다. 목표는 뒤에 예산이 없는 원본 아트를 위해 있습니다.

## 텍스처 {#textures}

부분이 기본 색 텍스처를 가진 `.glb`는 그 텍스처로 그려집니다. 예를 들어 레이싱 코스 내보내기는 지형 타일마다 하나, 놓인 모델마다 하나를 가집니다.

지면 텍스처는 있으면 기본으로 보입니다. 텍스처를 가진 구조물은 **단단하게, 자기 텍스처로** 시작합니다(연석, 가드레일, 타이어 벽, 표지판은 안을 들여다볼 건물이 아니라 도로의 가장자리이기 때문입니다). 와이어프레임은 꺼져 있고 평평한 음영도 꺼져 있습니다. [레벨 모양](level-appearance.md)을 보세요.

## 큰 레벨 {#large-levels}

- 구조물 삼각형이 **300,000**개를 넘으면 구조물 모서리는 처음부터 꺼지고, 면 불투명도는 35%가 됩니다. 픽셀마다 모서리가 있으면 구역이 평평한 흰색으로 보이기 때문입니다.
- 카메라의 먼 평면은 레벨에 맞게 넓어집니다([레벨](levels.md#what-a-level-does-for-the-heat)).

## 개발자용 {#for-developers}

### 텍스처 아틀라스 {#texture-atlas}

모든 텍스처는 인제스트 작업자에서 **하나의 아틀라스**로 묶입니다([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)). 그래서 레벨은 두 백엔드 모두에서 그리기 한 번, 샘플러 하나, 텍스처 좌표 속성 하나로 유지됩니다.

- 각 이미지의 고유 크기로 선반에 묶어 넣으며, 세트가 어느 방향으로든 **8192 px**(WebGPU 기본 텍스처 크기 한계)에 들어가지 않을 때만 줄입니다.
- 모든 이미지 둘레에 **16픽셀 여백**, 그리고 그 여백이 보호하는 5개의 밉 레벨만. 그래서 먼 표지판이 이웃의 텍스처를 샘플링하지 않습니다.
- **반복 텍스처**는 반복으로 남습니다. glTF 샘플러가 반복하는 이미지(glTF 기본값)이고, 텍스처 좌표가 0..1을 벗어나는 이미지(예: UV가 따라서 0에서 40까지 가는 벽돌 벽)는 *타일*이 됩니다. 정점은 자기 좌표와 16비트 타일 번호를 유지하고, 셰이더는 픽셀마다 좌표를 타일의 사각형 안으로 감쌉니다. 밉 레벨은 감싸지 않은 좌표에서 가져와서 이음매가 보이지 않습니다. 타일의 여백에는 자기 반대쪽 가장자리가 있습니다. 샘플러가 고정하는 축은 고정하고, 좌표가 0..1 안에 머무는 이미지는 전과 같이 그립니다. 타일이 있는 레벨은 정점당 4바이트를 더 씁니다.

### 내보내기 계약 {#the-exporter-contract}

무엇이 만들었든, 뷰어가 레벨에 대해 필요로 하는 것:

- 자체 완결된 `.glb` 하나;
- float32 `POSITION`, 삼각형 기본 요소;
- 노드 이름 `ground:*`, `structure:*`, `water:*`(그 밖의 것은 위 규칙으로 분류), 그리고 내비게이션 메시에 `nav:*`(보관하지만 그리지 않음);
- 세계 공간 좌표, **Y가 위**, 텔레메트리와 같은 단위. 그래서 배치 단계 없이 데이터가 레벨 위에 놓입니다.
