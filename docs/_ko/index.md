---
title: "홈"
nav_order: 1
lang: "ko"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat은 게임 안에서 무슨 일이 어디서 일어났는지를 보여 줍니다. 플레이어가 어디로 가고, 어디서 싸우고, 어디서 쓰러졌는지를, 날아다닐 수 있는 빛나는 색의 히트로 보거나, 경기를 다시 재생하는 작은 3D 피규어로 볼 수 있습니다.

위치 데이터를 불러오세요. CSV, Parquet, Tacview 기록, 변환한 리플레이, 파일 하나, 폴더, 또는 수천 경기도 됩니다. 그리고 이를 **날아다닐 수 있는 히트맵**으로, **경기를 재생하는 피규어**로, 사람들이 지나간 경로를 따라 그은 선으로, 또는 한 집단과 다른 집단의 비교로 볼 수 있습니다. 스스로 눈에 띄는 것을 찾아 근거와 함께 순위를 매기며, 모든 것이 여러분의 브라우저 안에서 실행됩니다. 어디에도 업로드되지 않습니다.

![demo valley 위의 전차 10경기 히트](../assets/img/en/heat-hero.webp)

**처음이신가요?** [데모 데이터](demo-data.md)를 만든 뒤 그 7단계를 따라 해 보세요. 이 사이트의 모든 그림은 이 데이터로 찍었습니다.

## 할 수 있는 것 {#what-it-does}

| | |
|---|---|
| ![차이](../assets/img/en/heat-difference.webp) | **[히트 모드](heat-modes.md)** - 히트, [차이](difference.md)(한쪽이 더 많았던 곳은 빨강, 다른 쪽이 더 많았던 곳은 초록-파랑), [팀 히트](team-heat.md), [선 히트](line-heat.md). 화살표 필드와 극좌표 차트를 쓰는 [방향별 히트](directional-heat.md). [가치로 가중한 히트](value-weighting.md): 무기, 차량, 연료가 얼마의 값인지 반영합니다. |
| ![리플레이](../assets/img/en/replay-tanks.webp) | **[경기 리플레이](match-replay.md)** - 각 유닛을 그것이 무엇인지 보여 주는 [피규어](figures.md)로 표시합니다. 멀리 있는 NATO 또는 러시아 기호, 미사일과 예광탄, 명중 표시, 잔해, 화재, 포탑, 목표, Tacview 풍의 카메라, 전술 표시. [여러 경기를 한꺼번에](many-matches.md) 볼 수도 있습니다. |
| ![인사이트](../assets/img/en/insights.webp) | **[인사이트](insights.md)** - 강한 위치, 위험한 지형, 리스폰 함정, 병목, 두드러진 플레이어를 근거와 순위와 함께 찾습니다. 글로 된 총평을 원하는 AI가 쓸 수도 있습니다. 한 경기용 캐스터, 그리고 [지식 렌즈](knowledge.md)도 있습니다. |
| ![볼륨](../assets/img/en/compare.webp) | **[볼륨](volumes.md)** - 상자, 프리즘, 원기둥, 구를 그리고, 그 안으로 필터를 걸어 그 안에서 일어난 일을 세고, 내보내고, 장소들을 나란히 비교합니다. 어떤 장소에서 누가, 무엇이 가장 잘 되는지 보는 [세부 분석](breakdown.md)도 있습니다. |
| ![필터](../assets/img/en/filters.webp) | **[필터](filters.md)** - 이벤트 종류, 플레이어 또는 AI, 차량 클래스, 값, 임의의 열로 거릅니다. 데이터 크기와 관계없이 그래픽 카드에서 처리합니다. |
| ![레벨](../assets/img/en/level-panel.webp) | **[레벨](levels.md)** - 맵 이미지, [데이터 도구](#related-repositories)로 만든 3D 레벨, 단순화, 비행 데이터를 위한 실제 지형이 있는 [세계 배경](world-backdrop.md). |

이 밖에도 있습니다. 게임 레이스의 랩을 위한 [레이스 분석](race-analysis.md) 탭, 카운터 스트라이크 2 요약을 위한 [매치](match-analysis.md) 탭, 레벨 위의 계획을 위한 [전술 보드](tactics-board.md), 차량별 [피격 분석](hit-analysis.md), 수천 경기를 위한 [대량 분석](mass-analysis.md), [카메라 경로와 영상](camera-path-and-video.md), [40개 언어](languages.md), [미터법 또는 야드파운드법 단위](settings.md).

## 탭 {#the-tabs}

탭은 사이드바 위쪽, 이름과 단위와 언어 메뉴 아래에 있습니다.

| 탭 | 용도 |
|---|---|
| **히트맵** | 모든 위치 표: 히트 모드, 피규어 오버레이, 필터, 볼륨, 인사이트, 레벨, 측정, 영상. |
| **레이스 분석** | 한 코스의 두 랩 이상: 시간을 어디서 잃었는지, 왜 잃었는지, 무엇을 바꿔야 하는지. |
| **매치** | 경기의 피규어 리플레이, 그리고 카운터 스트라이크 2 경기 요약. |
| **전술** | 레벨 위의 계획: 피규어, 경로, 던진 보조 장비, 구역, 재생되는 단계별 메모. |
| **차량** | 각 유닛이 어디서, 누구에게, 무엇으로 맞았는지. |

## 설치와 실행 {#install-and-run}

### Windows, 쉬운 방법 {#windows-the-easy-way}

저장소 루트에는 배치 파일 세 개가 있습니다.

| 파일 | 하는 일 |
|---|---|
| `start.bat` | 뷰어를 시작합니다. `PATH`에 없어도 Node.js를 찾습니다(`%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs`, `%LOCALAPPDATA%\Programs\nodejs`를 봅니다). Node.js가 없으면 `winget install -e --id OpenJS.NodeJS.LTS`로 LTS 버전을 설치할지 묻습니다. 처음 실행하면 의존성을 내려받기 전에 묻습니다(폴더 안의 `node_modules\`에 약 300 MB, 시스템 전역에는 아무것도 설치하지 않습니다). 포트 5273에서 이미 무언가 듣고 있으면 시작을 거부하고 `restart.bat`을 안내합니다. 폴더가 로컬 변경이 없는 git 체크아웃이고 더 새 버전이 있으면, 업데이트할지 묻습니다(Y/N, 60초 안에 답하지 않으면 이 버전을 유지합니다. [업데이트](updates.md)를 보세요). 그 뒤 `http://127.0.0.1:5273/`에서 개발 서버를 실행하고 브라우저를 엽니다. **이 창이 곧 서버입니다.** 열어 두세요. 닫거나 Ctrl+C를 누르면 멈춥니다. |
| `restart.bat` | `stop.bat quiet`을 실행한 뒤 `start.bat`을 실행합니다. `vite.config.ts`를 바꾸었거나, 의존성을 추가했거나, 서버가 멈췄을 때만 필요합니다. 소스 편집은 즉시 반영됩니다. |
| `stop.bat` | 포트 5273을 듣고 있는 프로세스를 멈춥니다. `netstat`으로 찾은 프로세스 id로 멈추며, 이미지 이름으로는 멈추지 않으므로 같은 컴퓨터의 다른 Node.js 프로세스는 건드리지 않습니다. 소켓이 풀릴 때까지 약 2초 기다립니다. 인수 `quiet`를 주면 끝에서 멈추지 않습니다. |

### 직접 하기(어떤 OS든) {#by-hand-any-os}

```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

`exporters/` 폴더에는 별도의 데이터 도구가 git 서브모듈로 들어 있습니다. 각각은 자기 저장소입니다. 그냥 클론했다면 `git submodule update --init`을 실행하세요. 뷰어 자체는 이것 없이도 실행됩니다. `exporters/ext/`에는 선택 사항인 변환기(War Thunder, World of Tanks, World of Warships, Squad 리플레이, DCS와 IL-2 맵)가 있습니다. 하나에 문제가 생겨도 다른 것에는 영향이 없도록 따로 둡니다.

이 중 어느 것에도 게임 데이터는 들어 있지 않습니다. 레벨, 맵, 기록은 여러분이 가진 게임으로 여러분의 컴퓨터에서 도구를 써서 만듭니다.

### npm 스크립트 {#npm-scripts}

| 스크립트 | 실행하는 것 |
|---|---|
| `npm run dev` | 포트 5273의 Vite 개발 서버. `127.0.0.1`에만 연결됩니다. |
| `npm run build` | 타입 검사(`tsc --noEmit`)와 `dist/`에 만드는 배포용 번들. |
| `npm run preview` | 배포용 번들을 제공합니다. |
| `npm run typecheck` | 타입 검사만 합니다. |
| `npm test` / `npm run test:watch` | 단위 및 통합 테스트(vitest). |
| `npm run smoke` | 헤드리스 Chromium에서 실제 앱을 조작하고, 캔버스에 데이터 색 픽셀이 있는지 확인합니다. 스크린샷은 `tools/.smoke/`에 저장됩니다. 개발 서버가 실행 중이어야 합니다. |
| `npm run smoke:f16` | 같은 시험을 `?heat=f16`으로 실행해, 반정밀도 누적 경로를 강제합니다([반정밀도 누적](half-float-accumulation.md) 참고). |
| `npm run bench` | 불러오기 벤치마크. `tools/.smoke/ingest-bench.json`에 씁니다. |
| `npm run test:heavy` | 큰 실제 데이터 파일이 필요한 테스트입니다. 파일이 없으면 스스로 건너뜁니다. |
| `npm run inspect -- <file.parquet>` | Parquet 파일의 스키마와 일부 행을 출력합니다(`tools/inspect-parquet.mjs`). |

### 개발 서버가 더하는 것 {#what-the-dev-server-adds}

뷰어는 정적 웹 페이지이지만, 개발 서버(`vite.config.ts` 참고)는 `dist/`를 정적으로 배포할 때는 없는 로컬 경로 두 개를 더합니다.

- `/__host/memory`는 컴퓨터의 설치된 RAM과 남은 RAM, 그리고 읽을 수 있을 때는 그래픽 카드의 메모리를 보고합니다(`nvidia-smi`에서, 또는 Windows에서는 디스플레이 어댑터의 레지스트리 항목에서). 덕분에 [메모리 예산](memory-and-budgets.md)이 브라우저의 제한된 추정값 대신 실제 수치를 쓸 수 있습니다.
- `/__heat3d/update`는 체크아웃이 뒤처졌는지 확인하고, 빨리 감기(fast-forward)로 갱신할 수 있습니다([업데이트](updates.md)).

서버는 `127.0.0.1`에만 연결되므로 두 경로 모두 네트워크에서 닿지 않습니다. `http://127.0.0.1:5273`으로 여세요. `localhost`는 IPv6 루프백 `::1`로 풀릴 수 있는데, 거기서는 아무것도 듣고 있지 않습니다. 교차 출처 격리 헤더(COOP/COEP)는 보내지 않습니다. 뷰어의 어떤 부분도 `SharedArrayBuffer`를 쓰지 않고, 워커는 데이터를 전송(transfer)으로 넘기는데 이 방식은 헤더가 필요 없기 때문입니다.

## 브라우저와 GPU 요구 사항 {#browser-and-gpu-requirements}

- **WebGPU 또는 WebGL2를 지원하는 브라우저.** WebGPU를 먼저 시도합니다(Chrome과 Edge에 있습니다). 없으면 WebGL2 백엔드를 씁니다. WebGL2는 `EXT_color_buffer_float`(부동소수점 텍스처에 그리기)을 제공해야 합니다. 그렇지 않으면 뷰어가 "렌더러를 초기화할 수 없습니다"라고 표시합니다. [두 가지 백엔드](backends.md)를 보세요. 뷰어는 Chromium에서 개발하고 시험합니다. 다른 브라우저는 검증하지 않았습니다.
- **하드웨어 가속을 켜 두세요.** 브라우저가 CPU로 그릴 때(SwiftShader, llvmpipe, Microsoft Basic Render Driver 등)에는 사이드바 맨 위에 빨간 배너가 나타나 그 사실과 해결 방법을 알려 줍니다. [소프트웨어 렌더링 감지](software-rendering.md)를 보세요.
- **별도 그래픽 카드(GPU)가 있으면 도움이 되지만 필수는 아닙니다.** 두 백엔드 모두 고성능 어댑터를 요청합니다. GPU에 담을 수 있는 데이터 양은 여러분이 볼 수 있고 바꿀 수 있는 예산입니다([메모리와 예산](memory-and-budgets.md)).
- **선택 기능**은 브라우저 API를 더 씁니다. 영상 렌더링에는 VP9 또는 VP8을 쓰는 WebCodecs `VideoEncoder`가 필요합니다([카메라 경로와 영상](camera-path-and-video.md)). 레벨의 메시 단순화에는 WebAssembly가 필요합니다. 폴더를 끌어다 놓는 기능은 File and Directory Entries API를 씁니다. 레벨 라이브러리는 IndexedDB를 씁니다. 게임패드는 Gamepad API를 씁니다.

## 문서 지도 {#documentation-map}

**시작**: [데모 데이터](demo-data.md) · [데이터 가져오기](getting-data-in.md)([파일 불러오기](loading-files.md), [열 매핑](column-mapping.md), [축, 단위, 시간](axes-units-and-time.md), [세션, 사람, 그룹](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [변환기](converters.md), [.3dheat](container.md), [메모리와 예산](memory-and-budgets.md))

**보기**: [히트 모드](heat-modes.md)([히트](heat.md), [스프라이트 모양](sprite-shape.md), [색과 노출](colour-and-exposure.md), [깊이와 컬링](depth-and-culling.md), [차이](difference.md), [팀 히트](team-heat.md), [선 히트](line-heat.md), [박스 리플레이](box-replay.md), [방향별 히트](directional-heat.md), [값 가중치](value-weighting.md)) · [타임라인](timeline.md) · [레벨](levels.md)([맵 이미지](map-images.md), [3D 레벨](model-levels.md), [외관](level-appearance.md), [라이브러리](level-library.md), [세계 배경](world-backdrop.md), [그 출처](world-backdrop-sources.md)) · [카메라](camera.md)([게임패드](gamepad.md), [키](keyboard-reference.md)) · [카메라 경로와 영상](camera-path-and-video.md)

**분석**: [필터와 도구](filters-and-tools.md)([필터](filters.md), [팀](teams-list.md), [개체](entities.md), [단면](slice.md), [측정](measure.md), [볼륨](volumes.md), [세부 분석](breakdown.md)) · [인사이트](insights.md)([지식 렌즈](knowledge.md)) · [대량 분석](mass-analysis.md)

**리플레이**: [경기 리플레이](match-replay.md) · [여러 경기를 한꺼번에](many-matches.md) · [피규어](figures.md)([피규어 오버레이에서](figure-replay.md), [출처](figure-credits.md)) · [Tacview 동등성](tacview-parity.md) · [피격 분석](hit-analysis.md)

**다른 탭**: [레이스 분석](race-analysis.md)([방법](race-analytics.md), [다른 게임](other-games.md)) · [경기 분석](match-analysis.md) · [전술 보드](tactics-board.md)([속도](tactics-speeds.md))

**뷰어**: [용어집](glossary.md) · [설정, 단위, 키](settings.md) · [언어](languages.md) · [업데이트](updates.md) · [렌더링 내부 구조](rendering-internals.md)([백엔드](backends.md), [누적](accumulation.md), [샘플링과 예산](sampling-and-budgets.md), [반정밀도](half-float-accumulation.md), [GPU 메모리](gpu-memory.md), [소프트웨어 렌더링](software-rendering.md), [성능과 통계](performance-and-stats.md)) · [데이터 형식](data-formats.md) · [참조](reference.md) · [문서 관리](maintaining.md)

## 관련 저장소 {#related-repositories}

뷰어는 데이터를 읽고, 이 도구들은 데이터를 만듭니다. 각각은 자기 문서가 있는 공개 저장소(MIT)입니다. 어느 것도 게임 데이터를 함께 주지 않습니다. 레벨, 맵, 기록은 여러분의 컴퓨터에서, 여러분이 가진 게임으로 만듭니다.

| 저장소 | 하는 일 | 쓰임새 |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | 게임이 함께 배포하는 압축 파일에서 코스와 레벨을 꺼내 glTF로 만듭니다(Forza Horizon, BeamNG, Assetto Corsa Rally; Unreal, Unity, Frostbite, Source 2 판독기 포함) | 히트나 리플레이 아래의 3D 레벨 |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | 레이싱 게임이 공개하는 인터페이스에서 랩 텔레메트리를 기록하고, 게임플레이 영상에서 레벨을 다시 만듭니다 | 레이스 분석용 랩. 파일을 읽을 수 없는 레벨 |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | 레벨을 glTF 파일 하나로 내보내는 언리얼 에디터 플러그인 | 여러분 자신의 언리얼 프로젝트 레벨 |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | 카운터 스트라이크 2 데모를 히트맵 표와 경기 요약으로, CS2 맵을 지오메트리로 바꿉니다 | CS2 히트, 리플레이, 매치 탭 |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | 게임이 공개하는 것(텔레메트리, 게임 상태 연동, 로그, 리플레이)으로 여러분의 플레이를 백그라운드에서 기록합니다 | 손으로 하지 않고 얻는 여러분의 통계 |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder 리플레이(`.wrpl`)를 표로 바꿉니다. 공중과 지상 궤적, 발사, 명중, 격추, 포탑, 목표 | War Thunder 리플레이, 명중 표시, 인사이트 |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks 리플레이를 표로 바꿉니다. 모든 차량의 위치, 사망, 격파 | World of Tanks 히트와 리플레이 |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships 리플레이를 표로 바꿉니다. 모든 함선의 위치와 침몰 | World of Warships 히트와 리플레이 |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad 서버 데모를 표로 바꿉니다. 모든 플레이어의 위치, 팀, 분대 | Squad 히트와 리플레이 |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | 여러분의 설치본에 있는 DCS World 지형을 레벨로 바꿉니다. 지면, 도로, 마을, 비행장, 들판, 물 | DCS와 Tacview 기록을 실제 지형 위에서 |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles 맵을 레벨로 바꿉니다 | 그 맵 위의 IL-2 기록 |

## 소스 구조 간단히 {#source-layout-briefly}

| 폴더 | 내용 |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | 파일 고르기, CSV와 Parquet 불러오기, 자동 매핑, 검증, 메모리 모델, 데이터셋 빌더, 모델 파싱, 분류, 단순화, 레벨 라이브러리 |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | 프레임 루프(`engine.ts`), 샘플링, 두 백엔드, 카메라, 게임패드, 측정, 카메라 경로, 영상 녹화 |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | 모든 기본값이 있는 앱 상태(`store.ts`), 도메인 타입(`types.ts`), 스프라이트 곡선 |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | 사이드바 패널, 타임라인, 오버레이 |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | 레이스 분석과 매치 탭 |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | 번역 |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | 인사이트: 탐지기, 총평, 캐스터, AI 제공자, 지식 렌즈 |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | 여러 경기에 걸친 대량 분석 |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | 볼륨, 그 통계, 내보내기, 비교 |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | 세부 분석과 요인 |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | 여러 경기 오버레이 |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | 피규어 카탈로그와 그 빌더 |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | 피격 분석(차량 탭) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | 전술 보드 |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | 세계 배경 |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | 측정 단위 |
