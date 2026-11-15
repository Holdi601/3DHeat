---
title: "레이스 분석"
nav_order: 14
has_children: true
lang: "ko"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# 레이스 분석

같은 트랙을 두 번 달렸습니다. **레이스 분석** 탭은 두 번의 주행을 3D에서 함께 재생하고, 한 랩이 어디서 느렸는지 보여 주며, 그 이유를 알려 줍니다. 아직 랩이 없나요? **데모 랩**을 누르세요.

![데모 랩이 있는 레이스 분석 탭: 랩과 개선할 곳이 있는 사이드바, 코스 위의 차량들, 보기 아래의 차트](../assets/img/ko/race-analysis-overview.webp)

이 탭은 한 코스의 랩 두 개 이상을 비교합니다. 캔버스, 카메라, 불러온 코스 모델(**배경 / 레벨**)은 히트맵과 함께 씁니다. 나머지는 탭 고유의 것입니다. 자체 사이드바와 보기 아래의 자체 막대가 있습니다. *랩*, *기준*, *아펙스* 같은 단어는 [용어집](glossary.md)에 있습니다.

이 페이지는 탭의 지도입니다. 각 부분에는 자기 페이지가 있습니다.

| 페이지 | 다루는 내용 |
|---|---|
| [랩 불러오기](race-loading-laps.md) | 모든 파일 형식, 폴더와 코스, 차량 이름, 데모 랩, 랩 목록, 기준과 초점 |
| [리플레이와 3D 장면](race-replay-and-scene.md) | 재생 막대, 세 가지 리플레이 모드, 차량 정렬, 체이스 카메라, 선, 지도, 차량, 라벨, 좌우 반전된 세계 |
| [차트와 HUD](race-charts-and-hud.md) | 거리 차트, 그래프 선택기, 마우스 올리기와 확대, 차량 카드, 채널 표 |
| [차량 제어 이벤트](race-control-events.md) | 잠김, 휠 스핀, 오버스티어, 스핀, 언더스티어, 충돌, 사고, ABS/TC, 핸드브레이크, 공중 - 각각 어떻게 감지하는지, 모든 임계값과 함께 |
| [코너별 분석](race-corner-analysis.md) | 거리 기준 정렬, 코너와 구간, 코너의 시간 계산, 모든 원인과 그것을 시도하는 순서, 라인 모양과 조언 |
| [차량 프로필과 비교](race-car-profiles.md) | 각 차량이 할 수 있는 것, 그 랩에서 측정한 값. *차량 비교*. 각 코너에서 차량이 결정하는 것 |
| [코스 통계](race-course-statistics.md) | 한 코스의 많은 랩: 코너별과 종류별 실수, 실수 지도, 히트맵 내보내기, 성능 한계 |
| [레이스 분석: 방법](race-analytics.md) | 규칙 뒤의 연구, 출처 포함 |
| [다른 레이싱 게임](other-games.md) | 각 게임의 랩을 뷰어가 어떻게 다루는지: 게임이 보내지 않을 때 계산하는 슬립과 드리프트, 좌우 반전된 세계, 추가 채널 |

## 화면 {#the-screen}

**사이드바**를 위에서 아래로 보면(섹션은 접을 수 있습니다):

1. **랩** - 불러오기, 목록, 보이기/숨기기, 기준, 초점, 체이스.
   [랩 불러오기](race-loading-laps.md)를 보세요.
2. **코스 통계** - 랩이 세 개 이상 불러와졌을 때만 나타납니다.
   [코스 통계](race-course-statistics.md)를 보세요.
3. **개선할 곳** - 초점 랩의 발견 사항을 코너별로.
   [코너별 분석](race-corner-analysis.md)을 보세요.
4. **코너별**(또는 여러 등급이 있을 때 *코너별 - 등급 X*) - 각 코너를 가장 빨리 통과한 랩과 그 라인. 랩이 둘 이상일 때 나타납니다.
5. **차량 컨트롤** - 초점 랩의 잠김, 미끄러짐, 밀림, 충돌.
   [차량 제어 이벤트](race-control-events.md)를 보세요.
6. **차량 비교**(차량이 하나면 **차량**) - [차량 프로필과 비교](race-car-profiles.md)를 보세요.
7. **보기** - 트랙에 어떤 지도를 그리고 무엇을 그릴지.
   [리플레이와 3D 장면](race-replay-and-scene.md)을 보세요.
8. 공용 **레벨**과 **카메라와 장면** 패널(코스 모델, 축 뒤집기, 카메라) - 히트맵과 [카메라](camera.md)에서 설명합니다.

**보기**에는 코스, 주행 라인, 지도, 차량, 트랙에 고정된 라벨, 그리고 왼쪽 위의 차량 카드(최대 여섯 장, [차트와 HUD](race-charts-and-hud.md) 참고)가 나타납니다. 불러온 랩이 없으면 "불러온 랩 없음 - 랩 파일을 두 개 이상 여기에 끌어다 놓거나, 사이드바에서 데모 랩을 불러오세요."라고 나옵니다.

**보기 아래의 막대**에는 리플레이 재생 조절과, 숨기지 않았다면 거리 차트가 있습니다.

## 빠른 시작 {#quick-start}

1. **레이스 분석** 탭을 엽니다(사이드바 맨 위, **히트맵** 옆).
2. 랩을 가져옵니다. **데모 랩**을 누르면 이 탭이 만들어진 랩 세 개에 무엇을 하는지 볼 수 있습니다. 여러분 자신의 랩은 먼저 기록해야 합니다([파일 형식과 기록 도구](race-loading-laps.md#file-formats)). 그다음 **랩 파일 불러오기…** 또는 **폴더…**를 누르거나, 파일이나 폴더를 보기에 끌어다 놓으세요.
3. 가장 빠르게 완주한 랩이 기준이 되며, 나머지 중 가장 느린 랩에 초점이 맞춰집니다. 목록에서 아무 랩이나 클릭하면 그 랩에 초점이 맞춰집니다. ★를 누르면 그 랩이 기준이 됩니다.
4. **개선할 곳**을 읽습니다. 발견 사항을 클릭하면, 그 40 m 앞에서 차량들이 정렬되고, 카메라가 그곳을 잡고, 리플레이가 그곳을 재생하며, 측정값이 열립니다.
5. 차트 위에 마우스를 올리면 모든 차량이 그 미터로 움직입니다. Shift를 누른 채 클릭하면 그곳에 정렬합니다.

## 키보드 {#keyboard}

레이스 분석 탭이 열려 있는 동안:

| 키 | 하는 일 |
|---|---|
| **K** | 리플레이 재생 / 일시정지 |
| **Home** | 리플레이의 시작으로 돌아갑니다 |
| 숫자 키 | 아무 일도 없음(히트맵에서는 모드를 바꿉니다) |

텍스트 칸이나 드롭다운에 입력한 키는 무시합니다. 카메라 키는 히트맵에서와 같이 작동합니다(**W A S D**, **Space** 위, **Q** 아래, **Shift** 빠르게, **Alt** 느리게, 마우스로 둘러보기. 모두 [카메라](camera.md)에 있습니다). **F**는 불러온 랩에 화면을 맞춥니다(랩을 불러올 때와 같습니다).

## 많은 랩 {#many-laps}

- 불러온 모든 랩을 분석하고 집계합니다. 수십 개라도 1-2초면 됩니다.
- **8**개(`SHOW_ALL_UP_TO`)를 넘으면, 추가된 랩은 기준이거나, 초점 랩이거나, 초점 랩 등급의 최고 랩일 때만 그려집니다. *모두 표시* / *본 것만 표시*로 바꿉니다.
- 보이는 차량이 **10**대(`PLAIN_PAST`)를 넘으면, 보지 않는 랩(초점, 쫓고 있는 차량, 기준이 아닌 것)은 1.5 m마다가 아니라 6 m마다 한 점으로 줄인 선과 평범한 차량으로 그립니다.
- 차트는 최대 **8**개 랩을 그리고, HUD는 최대 **6**개 카드를 보여 줍니다.
- 코스 통계는 랩이 **3**개부터 나타납니다.

자세히: [코스 통계](race-course-statistics.md#performance-with-many-laps).

## 기본 보기 설정 {#default-view-settings}

| 설정 | 기본값 |
|---|---|
| 지도 | 시간 지도 |
| 주행 라인, 차량, 타이어와 서스펜션, 라벨, 랩에서 가져온 트랙 | 켜짐 |
| 카드의 모든 값 | 꺼짐 |
| 차량 크기 | 1× |
| 차트 | 표시 |
| 리플레이 모드 | 라인부터 |
| 리플레이 속도 | 1× |
| 반복 | 켜짐 |

이 중 어느 것도 저장되지 않습니다. 새로 고치면 기본값에서 시작합니다. 브라우저가 기억하는 것: 언어와, 랩 파일에서 배운 차량 이름([랩 불러오기](race-loading-laps.md#car-names) 참고).

## 개발자용 {#for-developers}

### 랩이 불러와질 때 일어나는 일 {#what-happens-when-laps-are-loaded}

랩의 집합, 기준, 또는 언어가 바뀔 때마다 전체 분석을 다시 합니다([`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)의 `analyse`):

1. 게임이 보내지 않는 곳에서는 각 랩에 파생 채널을 추가합니다: 드리프트 각, 휠 속도로 계산한 휠 슬립, 공중 여부, 느슨한 지면, 요 레이트([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. 기준을 고르고, 모든 랩을 그 경로에 투영해서 2 m마다 다시 샘플링합니다([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. 랩에서 게임 세계가 좌우 반전되었는지 계산합니다([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. 기준에서 코너를 찾고, 한 제동 구역부터 다음 제동 구역까지의 구간으로 묶습니다([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. 차량별로: 엔벨로프(속도별 그립, 제동, 견인), 프로필, 타이어 곡선([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts), [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts), [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. 랩과 구간별로: 무엇을 했는지(제동 지점, 가장 느린 지점, 전개 스로틀 등)와 달린 라인([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. 랩별로: 차량 제어 이벤트, 각각 비교 대상 랩 위에 놓입니다.
8. 랩과 구간별로: 비교 랩과의 시간 계산과 말로 된 발견 사항.
9. 랩별 시간 지도와 원인 지도.

텍스트는 현재 언어로 만들어집니다. 언어를 바꾸면 분석을 다시 실행합니다(그리고 데모 랩의 이름도 바뀝니다). 분석 실패는 **랩** 버튼 아래에 오류로 표시되며, 랩은 계속 불러와진 상태로 남습니다.

### 소스 파일 {#source-files}

| 파일 | 역할 |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | 랩 파일 읽기 |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | 랩 타입, 이름 짓기, 데모 랩 |
| `src/race/derive.ts`, `handedness.ts` | 파생 채널, 좌우 반전된 세계 |
| `src/race/align.ts`, `segments.ts`, `line.ts` | 거리 축, 코너, 라인 |
| `src/race/analysis.ts` | 비교된 코너, 원인, 발견 사항 |
| `src/race/envelope.ts`, `profile.ts` | 차량이 할 수 있는 것 |
| `src/race/control.ts`, `impacts.ts` | 차량 제어, 충돌과 사고 |
| `src/race/stats.ts` | 많은 랩 |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | 리플레이와 그리기 |
| `src/race/schema.ts`, `graphs.ts` | 채널 표, 차트의 행 |
| `src/ui/race/*` | 사이드바, 차트, HUD, 라벨 |
| `src/state/raceStore.ts` | 탭의 상태와 리플레이 시계 |
