---
title: "경기당 파일 하나 (.3dheat)"
parent: "데이터 가져오기"
nav_order: 9
lang: "ko"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# 경기 하나를 파일 하나로: `.3dheat`

`.3dheat` 파일은 경기 전체를 파일 하나에 담은 것입니다. 복사하거나, 보관하거나, 나눠 쓰기 좋습니다. 열려면 파일을 소스 패널에 끌어다 놓기만 하면 됩니다.

```
match.3dheat   (ZIP 파일)
  manifest      경기가 무엇인지, 그리고 안에 든 모든 것의 목록
  table         위치 (Parquet)
  match.json    경기 문서
  sidecars      변환기가 통째로 보관한 것 (이벤트, 메시지, ...)
```

변환된 경기는 예전에는 여러 파일이 나란히 있는 형태였습니다. 표는 `<경기>.parquet`, 경기 문서는 `<경기>.match.json`, 부속 파일은 `<경기>.<내용>.parquet`였습니다([변환기는 모든 것을 보관합니다](converters.md)). `.3dheat` 파일은 이 모든 것을 하나에 담습니다. 리플레이 하나, 파일 하나이므로 복사하고, 보관하고, 나눠 쓰기 좋습니다.

이 파일은 수많은 파일을 불러올 때도 흩어진 표를 불러올 때만큼 빠르도록 만들었습니다. 그리고 나중의 변환기가 새 형식 없이도 훨씬 더 많은 것을 담을 수 있도록 만들었습니다.

## 하나 불러오기 {#loading-one}

파일이나 폴더를 불러올 수 있는 곳이면 어디서든 `.3dheat` 파일도 불러올 수 있습니다. 폴더에는 컨테이너와 낱개 파일을 섞어 둘 수 있습니다.

| 위치 | 컨테이너에서 읽는 것 |
|---|---|
| **히트맵** 소스 패널(파일, 폴더, 끌어다 놓기) | 표들. 흩어진 `<경기>.parquet`인 것처럼 읽습니다 |
| **히트맵 → 여러 경기 동시에**(파일, 폴더, 폴더 추가) | 표들. 불러오기 워커가 제자리에서 읽습니다 |
| **경기** 탭(불러오기, 또는 보기에 끌어다 놓기) | 경기 문서 |
| **전술** 보드의 텔레메트리 | 표들 |

컨테이너를 열면 그 안의 작은 부분 두 개만 읽습니다. 끝에 있는 디렉터리와, 앞에 있는 매니페스트입니다. 불러오기가 읽기 전에는 표의 어떤 부분도 읽지 않습니다. 부속 파일과 경기 문서는 누군가 요청할 때만 읽습니다. 같은 경기가 낱개와 묶인 형태로 모두 든 폴더는, 그 경기를 한 번만 불러옵니다.

## 묶기와 풀기 {#packing-and-unpacking}

새 변환은 기본으로 컨테이너를 씁니다. 워 썬더 변환기(`heat3d-wt-replay`), CS2 변환기(`heat3d_cs2 demos`), Tacview 도구(`node tools/acmi-to-parquet.mjs`)가 그렇습니다. `--loose`를 주면 따로 된 파일을 유지합니다.

이전에 변환했거나 다른 도구가 만든 경기는 다음으로 묶습니다.

```
node tools/3dheat-pack.mjs <폴더>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <폴더|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <폴더|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <폴더|file.3dheat>...
```

- **pack**은 폴더 아래에서 `<경기>.parquet` 표를 모두 찾아, 그에 속한 파일들과 함께 `<경기>.3dheat`을 그 옆에 씁니다. 이미 묶인 경기는 건너뜁니다. 각 컨테이너는 다른 일을 하기 전에 처음부터 끝까지 다시 읽어 확인합니다(구성 파일마다 sha256, 크기, CRC, Parquet 푸터). 낱개 파일은 `--delete-loose`를 줄 때만 지웁니다. 전에 묶은 경기라면, 낱개 파일이 컨테이너가 가진 것과 바이트 단위로 같을 때만 지웁니다. `--settle` 분(기본 10분) 안에 바뀐 파일이 있는 경기는 건드리지 않습니다. 변환기가 아직 쓰고 있을 수 있기 때문입니다.
- **unpack**은 구성 파일을 컨테이너 옆에 낱개 파일로 되돌려 씁니다.
- **update**는 컨테이너에 이미 있는 표를 다시 쓰지 않고, 구성 파일을 추가하거나 바꿉니다(아래를 보세요).
- **repack**은 컨테이너를 통째로 다시 쓰고, 업데이트가 남긴 것은 버립니다.

## 형식 {#the-format}

`.3dheat` 파일은 ZIP 아카이브입니다(어떤 ZIP 도구로든 열립니다). 규칙은 다음과 같습니다.

1. 컨테이너를 쓸 때 **`manifest.json`이 첫 구성 파일**이며, 항상 있습니다. ZIP 중앙 디렉터리를 통해 찾으므로, `update` 뒤에는 파일의 더 뒤쪽에 있을 수 있습니다.
2. **바이트 범위로 읽거나 이미 압축된 구성 파일은 그대로 저장합니다**(ZIP 방식 0): Parquet, Arrow, 이미지, 모델, 오디오, 비디오, 불투명한 blob. 저장된 구성 파일은 컨테이너 안의 연속된 바이트 범위 하나이므로, 리더는 표의 푸터와 열 청크를 제자리에서 읽을 수 있습니다. 브라우저에서는 `File.slice`로, HTTP에서는 범위 요청으로 읽습니다. 낱개 파일을 읽는 것과 똑같습니다.
3. **텍스트는 압축합니다**(방식 8): JSON, CSV, 일반 텍스트. 작아서 통째로 읽습니다.
4. 이름은 UTF-8(플래그 비트 11), 상대 경로, `/`로 구분하며, `..`은 쓰지 않습니다. 폴더를 가질 수 있습니다(`analysis/heat.json`). 묶인 낱개 파일은 자기 이름을 그대로 유지하므로, 풀면 같은 파일이 돌아옵니다.
5. 4 GiB보다 큰 구성 파일이나 구성 파일이 65,535개보다 많은 컨테이너는 평소처럼 ZIP64를 씁니다. 쓰는 쪽은 구성 파일 뒤에 데이터 설명자를 두지 않습니다.

오늘날 변환기가 쓰는 구성 파일은 이 순서입니다.

| 역할 | 구성 파일 | 저장 |
|---|---|---|
| `table` | `<경기>.parquet` | 예 |
| `match` | `<경기>.match.json` | 아니오(압축) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<경기>.<역할>.parquet` | 예 |
| `summary` | `<경기>.summary.json`, 대량 분석 색인의 요약([대량 분석](mass-analysis.md)), `tools/3dheat-summarize.mjs`가 추가 | 아니오(압축) |

표는 매니페스트 바로 뒤에 옵니다. 그래서 리더가 파일 시작을 처음 읽을 때 매니페스트와 표의 로컬 머리글이 함께 읽힙니다.

### 매니페스트 {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| 필드 | 뜻 |
|---|---|
| `format` | 항상 `3dheat` |
| `format_version` | `주버전.부버전`(아래를 보세요) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | 경기가 무엇이며 무엇이 만들었는지. 모르면 `null` |
| `created`, `updated` | 쓴 시각, 마지막으로 업데이트한 시각(`updated`는 업데이트 뒤에만 나타남) |
| `roles` | 역할마다 그 역할의 첫 구성 파일 이름. 빠른 색인입니다 |
| `members` | 매니페스트를 뺀 모든 구성 파일. 전체 목록이며, 리더가 신뢰하는 목록입니다 |
| `matches` | 선택 사항. 여러 경기를 담은 컨테이너의 경기들(아래를 보세요) |
| `references` | 선택 사항. 컨테이너가 필요로 하지만 담고 있지 않은 파일들 |
| `extensions` | 선택 사항. 변환기 자체의 메타데이터 |

구성 파일 하나마다:

| 필드 | 뜻 |
|---|---|
| `name` | 컨테이너 안의 경로 |
| `role` | 무엇을 위한 것인지(아래를 보세요) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` 또는 `deflate` |
| `bytes` | 크기, 압축 해제한 값 |
| `sha256` | 압축 해제한 바이트의 해시 |
| `rows` | 표의 행 수 |
| `schema` | 따르는 규약 `{ "id", "version" }`. 문서는 자기 `format`과 `version`(`heat3d-wt-replay-match` 2), 뷰어가 `heat3d` 푸터로 읽는 표는 `heat3d-table`, Tacview 도구의 표는 `heat3d-acmi-table` |
| `match` | 여러 경기가 든 컨테이너에서, 이 파일이 속한 `matches[].id` |

### 자라도록 만들었습니다 {#made-to-grow}

이 형식은 지금 읽는 것이 깨지지 않으면서, 오늘보다 훨씬 풍부한 리플레이를 담도록 만들었습니다.

- **버전 관리.** `format_version`은 `주버전.부버전`입니다. 리더는 자기 주버전에 속한 모든 부버전을 읽고, 자기가 모르는 필드는 무시합니다. 무엇인가 추가되면 부버전을 올립니다. 주버전은 구 리더가 잘못 읽을 만큼 구조가 바뀔 때만 올립니다(구성 파일이 더 이상 저장되지 않거나, 매니페스트가 아카이브 밖으로 옮겨질 때). 각 구성 파일 고유의 규약은 `schema`에서 따로 버전을 매기므로, 새 표 구조나 새 문서 버전에는 새 컨테이너 버전이 필요 없습니다. 처음 쓴 컨테이너는 `"version": 1`이라고 적었습니다. 리더는 이것을 1.0으로 받아들입니다.
- **역할은 열려 있습니다.** 역할은 어떤 문자열이든 됩니다. 리더는 아는 역할을 쓰고, 나머지는 그대로 둡니다. 모르는 역할은 목록에 나오지만 거부하지 않으며, `update`와 `repack`은 건드리지 않고 그대로 옮깁니다. 역할은 구성 파일을 여럿 가질 수 있습니다. 여러 표(유닛별 트랙, 다른 속도의 텔레메트리), 이벤트, 음성, 비디오 동기화, 레벨 참조, 피겨 재정의, 분석 결과가 그렇습니다. 이름은 폴더를 담을 수 있습니다.
- **어떤 미디어든 됩니다.** 구성 파일은 미디어 타입이 있는 것이라면 무엇이든 될 수 있습니다. Parquet, JSON, Arrow, PNG나 JPEG 썸네일, glTF 모델, 오디오, 원시 blob.
- **여러 경기.** 세션이나 토너먼트를 컨테이너 하나에 담을 수 있습니다. `matches`가 그 목록을 주고(`{ "id", "map", "mode", "started", ... }`), 각 구성 파일은 자기 `match`를 이름으로 가리킵니다. 뷰어는 `table` 역할의 구성 파일을 모두 불러옵니다.
- **참조.** 컨테이너가 필요로 하지만 담고 있지 않은 파일(예: 어떤 경기의 레벨)은 `references`에 이름과 sha256으로 적습니다(`{ "kind": "level", "name": "...", "sha256": "..." }`). 그래서 모든 경기에 복사하지 않아도 올바른 파일을 찾아 확인할 수 있습니다.
- **확장.** `extensions`에는 변환기가 자기 키 `"<공급자>/<이름>": { ... }` 아래에 넣은 메타데이터가 들어갑니다. 그래서 두 변환기가 부딪히지 않고, 공유 필드에 무엇인가 더할 필요도 없습니다.
- **제자리 업데이트.** `update`는 큰 저장 표를 다시 쓰지 않고 구성 파일을 추가하거나 바꿉니다. 새 구성 파일과 새 매니페스트를 컨테이너 끝 뒤에 덧붙이고, 그 뒤에 새 중앙 디렉터리를 씁니다. 바뀐 것은 `repack`까지 참조되지 않는 바이트로 남습니다. 모든 구성 파일과 모든 매니페스트 필드는, 알든 모르든 그대로 유지됩니다. 실패한 업데이트는 원래 컨테이너 상태로 되돌립니다.

뷰어의 테스트는 이 약속을 확인합니다. 형식 1.7이고, 알 수 없는 역할, 구성 파일 필드, 확장, 오디오 구성 파일이 있는 컨테이너는 폴더 안에서 불러와지며, 업데이트와 repack을 거쳐도 모든 것이 온전히 남습니다. 주버전 2인 컨테이너는 거부합니다.

## 쓰는 도구 {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)(쓰기, 읽기, 검증, 업데이트, repack). 묶기 도구와 Tacview 도구가 씁니다.
- Python: `container.py`. 표준 `zipfile`을 쓰는 약 140줄짜리 파일입니다. 각 변환기에 같은 파일이 들어 있습니다(`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`). 그래서 어떤 변환기도 다른 변환기에 의존하지 않습니다. 새 변환기는 이 파일을 복사해서 씁니다.
- 뷰어는 [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts)로 읽습니다.
