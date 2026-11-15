---
title: "다른 레이싱 게임"
parent: "레이스 분석"
nav_order: 59
lang: "ko"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# 뷰어의 다른 레이싱 게임

뷰어는 한 가지 게임만이 아니라 여러 레이싱 게임의 랩을 읽습니다. 이 페이지에서 게임 목록을 보고, 각 게임에서 랩을 꺼내는 방법을 설명합니다.

## 게임 목록 {#the-games}

| 게임 | 기록기 | 파일에 슬립이 있나요? | 월드가 뒤집혀 있나요? | 참고 |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry` (UDP로 Data Out), 또는 FH Companion의 랩 파일과 `.tele.gz` | 예, 바퀴별 (정규화됨) | 예 (왼손 좌표계 월드) | FH Companion 랩 파일 옆의 `.tele.gz`에 모든 바퀴의 슬립이 들어 있습니다. 랩 파일만으로는 없습니다 |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally` (공유 메모리) | 예, 바퀴별 | 랩에서 측정 | ABS와 트랙션 컨트롤이 작동한 상태, 바퀴 하중, 온도도 포함 |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4` (UDP) | 아니요, 바퀴 속도에서 계산 | 랩에서 측정 | 랠리: 느슨한 노면과 점프를 다르게 판단 |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr` (NGP UDP) | 아니요 | 랩에서 측정 | 바퀴 속도 없음 |
| BeamNG.drive | `heat3d_capture telemetry --game beamng` (모드) | 아니요, 바퀴 속도에서 계산 | 랩에서 측정 | |
| Trackmania | Openplanet 플러그인, `telemetry --game trackmania --install` | 바퀴별 슬립 계수 | 랩에서 측정 | 아케이드 물리: 미끄러짐을 다르게 판단 |
| iRacing | 없음: 자체 `.ibt` 파일 | 아니요 (기록되지 않음); 요(yaw)에서 계산 | 아니요 (GPS 기반) | 차량에서 Alt+L로 기록을 켜세요 |

## 랩을 기록하는 방법 {#how-to-record-a-lap}

1. 표에서 게임을 고르고, 그 게임의 기록기 페이지에 적힌 대로 설정하세요 (게임 안의 설정, 모드, 또는 iRacing은 아무것도 하지 않음). 단계는 게임마다 다르므로 기록기 문서에 있습니다: [GameCapture: 게임](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md).
2. 기록기를 시작하고 운전하세요. 랩마다 파일 하나가 만들어집니다.
3. **레이스 분석** 탭에서 **랩 파일 불러오기…**를 누르고, 같은 코스의 랩을 두 개 이상 고르세요 ([랩 불러오기](race-loading-laps.md) 참고).

랠리 게임은 스테이지 한 번 주행마다 파일 하나가 만들어집니다. Forza는 FH Companion 라이브러리와 랩 파일 옆의 `.tele.gz` 파일로 시작하는 것이 가장 쉽습니다.

## 기록기가 문서로 남기는 것 {#what-the-recorders-document}

각 게임을 어떻게 기록하는지, 무엇을 보내는지, 레이아웃의 출처, 그리고 게임 파일에서 어떤 코스를 내보낼 수 있는지는 기록기 쪽에서 문서로 남깁니다: [GameCapture: 게임](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) (공개, [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)에 있음). 모든 기록기가 쓰는 랩 파일은 [GameCapture: 랩 형식](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)에 있습니다.

## 뷰어가 이것들로 하는 일 {#what-the-viewer-does-with-them}

모든 게임은 결국 `heat3d-lap` 파일 (또는 랩 CSV)이 되거나, iRacing의 `.ibt`처럼 직접 읽힙니다. `src/race/schema.ts`의 표준 채널 이름을 쓰고, 숫자가 무엇을 뜻하는지 `meta` 블록에 적어 둡니다. 슬립이 어떻게 조정되었는지, 서킷인지 랠리인지 아케이드인지, 알 수 있다면 노면이 무엇인지도 적습니다. 그래서 **레이스 분석** 탭은 모든 게임을 같은 방식으로 다룹니다. 코스 모델을 불러오지 않았을 때 **레이스 분석** 탭은 랩들이 퍼진 범위에서 도로를 그리므로, 코스 모델 없이도 모든 게임을 쓸 수 있습니다.

랠리 게임 중 어느 것도 보내지 않는 타이어 슬립은 뷰어가 계산합니다. 게임이 보내는 경우에는 각 바퀴의 접촉면이나 노면 속도를 차량 속도와 비교합니다 (`(wheel - car) / car`). 회전만 보내는 경우에는 랩 자체에서 측정한 회전 반지름으로 계산합니다. 드리프트 각은 차량 자체의 속도에서 옵니다 (Forza, AC 계열, Trackmania, RBR). 또는 월드 속도를 차량 축에 투영해서 얻습니다 (EA WRC, DiRT, BeamNG). 아니면 진행 방향과 경로를 비교합니다. 차가 공중에 있는지는 바퀴의 접촉, 하중, 서스펜션으로 판단합니다. `src/race/derive.ts`를 보세요.

게임의 월드가 왼손 좌표계이면 (Forza가 그렇습니다), 뷰어에서 코스가 좌우 반전되어 나옵니다. 랩의 조향과 서스펜션 값이 이를 알려 주고, **레이스 분석** 탭은 축 하나를 뒤집을지 제안합니다. 좌표계가 문서로 정해져 있지 않은 게임 (RBR, BeamNG, Trackmania)도 같은 방식으로 처리합니다. 가정하지 않고 측정합니다.

운전 채널 외에, 기록기는 각 게임이 더해 주는 값도 저장합니다. AC 계열은 ABS와 트랙션 컨트롤이 작동한 상태, 브레이크 배분, DRS, 피트 리미터, 부스트, 브레이크 패드와 디스크 수명을 저장합니다. iRacing은 보조 설정, 브레이크 배분, 연료, 오일과 물 온도, 그리고 기록하는 다른 모든 채널을 자체 이름으로 저장합니다. 뷰어는 이것들을 자체 채널 표에서 읽어 램프, 레벨, 글리프, 그래프로 그립니다. 그래서 더 많이 기록해도 뷰어를 바꿀 필요가 없습니다.
