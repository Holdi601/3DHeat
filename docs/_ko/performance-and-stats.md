---
title: "성능 패널과 통계"
parent: "렌더링 내부 구조"
nav_order: 7
lang: "ko"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# 성능 패널과 통계 오버레이

뷰 오른쪽 위의 상자는 뷰어가 얼마나 열심히 일하는지 보여 줍니다. 초당 프레임 수, 그리는 점의 수, 그림을 아직 다듬고 있는지입니다. **Performance** 패널에서는 화질과 속도를 맞바꿀 수 있습니다.

## 통계 오버레이 {#the-stats-overlay}

히트맵과 매치 탭의 뷰 오른쪽 위 상자입니다 ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). 애니메이션 프레임마다 엔진의 실시간 값을 읽습니다.

![많은 경기 장면의 통계 오버레이, 번호 표시: 1 Backend, 2 FPS, 3 Frame, 4 Rows in window, 5 Sprites / frame, 6 Budget, 7 Heat res, 8 Coverage](../assets/img/en/performance-stats-overlay.webp)

| 줄 | 뜻 |
|---|---|
| **Backend** | *WebGPU* 또는 *WebGL2*. WebGPU를 쓰지 않은 이유(쓰지 않은 경우)는 마우스를 올리면 나옵니다. [두 가지 백엔드](backends.md)를 보세요. |
| **FPS** | 초당 프레임 수, 최소 0.4초 동안 평균. |
| **Frame** | 부드럽게 한 프레임 시간(ms) (이전 90%, 새 값 10%). GPU 시간이 아니라 프레임 사이의 시간입니다. 패스별 GPU 시간은 측정하지 않습니다. |
| **Rows in window** | 후보 행: 셰이더의 행별 필터 전, 현재 시간 구간의 행. |
| **Sprites / frame** | 지난 프레임의 계획이 제출한 스프라이트 (아무것도 그리지 않는 유휴 프레임에서는 계획된 값을 유지). |
| **Budget** | 이 프레임이 계획된 스프라이트 예산. 적응형 컨트롤러의 값이며, 모든 행을 그릴 때는 모든 후보까지 올라갑니다. |
| **Heat res** | 캔버스 대비 히트 버퍼의 해상도 비율: *Heat resolution* 설정에 적응형 2단계 배율을 곱한 값. |
| **Coverage** | 점진적 누적이 모든 행을 쓰는 데 얼마나 다가갔는지. 수렴하는 동안은 퍼센트(호박색), 끝나면 *exact*. 시끄러운 프레임을 완성된 그림으로 잘못 보지 않습니다. |
| **Cubes** | [박스 재생](box-replay.md)에서 그려진 상자. |
| **Not resident** | 행이 GPU 예산에 들어가지 않았을 때만 표시: 몇 개인지. [GPU 메모리 상주](gpu-memory.md)를 보세요. |

## 속도 표시 {#the-speed-display}

뷰 오른쪽 아래, 원근 투영에서만 보입니다: 비행 속도와 그 속도로 데이터를 가로지르는 시간. 끌어서 속도를 바꿉니다. [카메라](camera.md#fly-speed)를 보세요.

## 뷰어가 느릴 때 {#if-the-viewer-is-slow}

통계 오버레이를 보고 다음을 확인하세요.

1. **Rows in window가 Sprites / frame보다 훨씬 크고, Coverage가 100% 아래** - 프레임이 모든 것을 그릴 수 없습니다. 정지해 있으면 여러 프레임에 걸쳐 수렴합니다. 구간을 좁히거나, 필터하거나, 컬링해서 후보를 줄이세요. 아니면 샘플링을 받아들이세요.
2. **Sprites / frame이 Rows in window와 같은데 프레임이 여전히 느림** - 비용이 화면의 스프라이트 수에 비례합니다: *Max pixel radius*([스프라이트 모양](sprite-shape.md#pixel-clamps))나 *Heat resolution*을 낮추세요.
3. **행이 적은데도 느림** - 레벨이 원인일 가능성이 큽니다: 구조물이 많고 가장자리가 켜져 있거나, 지면 삼각형, 피사계 심도. [레벨 외관](level-appearance.md)을 보세요.
4. **전체가 느리고 빨간 배너가 보임** - 소프트웨어 렌더링 ([소프트웨어 렌더링 감지](software-rendering.md)).

## 성능 패널 {#the-performance-panel}

| 컨트롤 | 기본값 | 효과 |
|---|---|---|
| 힌트 | | 프레임마다 보이는 행의 층화된 무작위 부분집합을 스플랫하고, 보상 가중치를 줍니다. 그래서 예산이 얼마든 기대 히트는 정확합니다. 뷰를 정지해 두면 모든 행이 기여할 때까지 프레임을 계속 합칩니다. |
| **Draw every row each frame** | 켜짐 | 새 추정을 시작하는 프레임마다 모든 후보 행을 그립니다 (약 2억 6,800만 개까지). 아래의 예산은 최솟값이 됩니다. [샘플링과 예산](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptive budget** | 켜짐 | 목표 프레임 속도를 유지하도록 프레임당 스프라이트를, 그다음 히트 해상도를 조정합니다. 줄이는 것이 도움이 안 되면 그만둡니다. [샘플링과 예산](sampling-and-budgets.md#the-adaptive-budget) |
| **Target FPS** | 60 | 20-240 (손잡이로는 1000). 15 미만 값은 15로 취급합니다. |
| **Starting sprites / frame** / **Sprites / frame** | 4.00M | 65,536-268,435,456, 로그 눈금. 적응형이 켜져 있으면 컨트롤러가 값을 움직이므로 *Starting*이라고 부릅니다. |
| **Heat resolution** | 100% | 25-100%. 프래그먼트 비용은 제곱에 비례합니다: 50%면 블렌딩 작업이 4분의 1이 되고, 히트 장은 충분히 부드러워서 거의 드러나지 않습니다. |
| **Progressive refinement** | 켜짐 | 뷰가 정지해 있는 동안 프레임에 걸쳐 누적합니다. 끄면 매 프레임 단일 프레임 추정을 보여 줍니다. [누적](accumulation.md) |
| **Resource budgets** | 감지됨 | RAM, GPU, 파서 스레드 예산. [메모리와 예산](memory-and-budgets.md#resource-budgets) |

이 값들은 저장되지 않습니다. 다시 불러오면 기본값으로 돌아갑니다.
