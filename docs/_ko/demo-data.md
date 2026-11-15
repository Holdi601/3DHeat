---
title: "데모 데이터"
nav_order: 2
lang: "ko"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# 데모 데이터: 5분 안에 뷰어 써 보기

![데모 계곡의 전차 10경기 히트: 4단계에서 보이는 것](../assets/img/en/heat-hero.webp)

아직 가진 데이터가 없나요? 저장소가 데이터를 만들어 줍니다. 그 안의 모든 것은 꾸며낸 것입니다. 계곡과 마당, 그리고 이름을 지어낸 세 가지 게임 방식의 경기가 있습니다. 선수는 *Blue 1*이나 *Red 3*처럼 불립니다. 이 사이트의 그림은 모두 이 데이터로 찍었습니다.

## 만들기 {#make-it}

```bash
node tools/demo-data.mjs
```

이 명령은 `tools/.shots/demo/`에 다음 파일을 만듭니다:

| 파일 | 내용 |
|---|---|
| `demo-valley.glb` | 언덕 두 개와 마을이 있는 12 km 계곡, 3D 레벨 |
| `demo-yard.glb` | 건물이 있는 160 m 담장 마당, 3D 레벨 |
| `tanks.parquet` | 전차 10경기, 8 대 8: 이동, 사격, 차체의 어느 부분을 맞았는지, 화재, 격파, 잔해, 포탑 조준, 승자 |
| `tanks/match-NN.parquet` | 같은 경기를 한 경기씩 파일로 나눈 것. [여러 경기 동시에](many-matches.md)용 |
| `air.parquet` | 4 대 4 공중전: 미사일, 플레어, 격추와 빗나감 |
| `shooter.parquet` | 5 대 5 도보 라운드 12개: 사격, 격파, 폭탄 설치, 획득하고 쓴 크레딧, 헬멧과 보조 장비 |
| `mass/` | 작은 `.3dheat` 경기 폴더. [대량 분석](mass-analysis.md)용 |
| 레이스 랩 세트 | 꾸민 코스를 달린 한 차량의 2랩. [레이스 분석](race-analysis.md)용 |

각 표는 바닥글에 자기 열 이름을 적어 두므로, 매핑 없이 바로 불러올 수 있습니다.

## 해 보기 {#try-it}

1. 뷰어를 시작합니다. Windows라면 `start.bat`을, 다른 시스템이라면 `npm install`을 한 번 한 뒤 `npm run dev`를 실행합니다. 그리고 `http://127.0.0.1:5273/`을 엽니다.
2. **배경 / 레벨 → 3D 모델…**을 누르고 `demo-valley.glb`를 고릅니다.
3. **소스 → 파일…**을 누르고 `tanks.parquet`를 고릅니다.
4. `F`를 눌러 데이터에 화면을 맞춥니다. 전차 10경기의 [히트](heat.md)가 보입니다.
5. 모드 막대를 써 봅니다: **차이**(Blue 대 Red), **팀 히트**, **라인**.
6. (히트맵 사이드바의) **인사이트**를 엽니다. 두 언덕 주변처럼, 다른 곳보다 훨씬 많이 쏘고 맞고 파괴된 곳을 찾아 보여 줍니다.
7. **매치** 탭을 열고 **리플레이의 매치**에서 *Match 01*을 고른 뒤, 타임라인의 **재생**을 누릅니다. 이것이 [리플레이](match-replay.md)입니다.

![전차를 피규어로 보여 주는 Match 01 리플레이](../assets/img/en/replay-overview.webp)

슈터 데이터는 `demo-yard.glb`와 `shooter.parquet`를 불러오고, 공중전은 `air.parquet`를 불러옵니다. 공중전의 피규어는 **피규어 크기** 4에서 더 잘 보입니다. 이 슬라이더는 히트맵 사이드바의 **팀 뷰어** 패널에 있습니다.

## 스크린샷 {#the-screenshots}

이 사이트의 그림은 스크립트가 이 데이터로 만들며, 뷰어가 지원하는 언어 중 어느 언어로든 만들 수 있습니다:

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

스크린샷 서버는 로컬 피규어 팩 없이 실행되므로, 공개 피규어 카탈로그만 보입니다. 그림은 `docs/assets/img/<lang>/`에 저장됩니다. [문서 관리](maintaining.md)를 보세요.
