---
title: "데이터 형식 참조"
nav_order: 19
lang: "ko"
source: "data-formats.md"
source_hash: "23c1890ce185"
translated: true
outdated: false
---

# 데이터 형식 참조

이 페이지는 3DHeat이 열 수 있는 모든 종류의 파일과, 그 안의 표가 어떤 모양이어야 하는지를 나열합니다. 표는 스프레드시트처럼 행과 열로 되어 있습니다. 각 행은 무엇이 어디에 있었는지를 말하며, 가지고 있다면 언제, 누가인지도 말합니다.

히트맵 탭이 열마다 무엇을 읽는지, 그리고 Parquet 파일이 가질 수 있는 힌트를 설명합니다. (레이스 분석 탭은 랩 파일을, 매치 탭은 매치 요약을 읽습니다. [레이스 분석](race-analysis.md)과 [매치 분석](match-analysis.md)을 참고하세요.)

## 파일 {#files}

불러올 수 있는 파일의 완전한 목록은 이것이 전부입니다. **소스** 패널(**파일…**, **폴더…**, 또는 끌어다 놓기)은 정확히 이것만 받습니다.

| 확장자 | 무엇인가 | 읽는 방식 |
|---|---|---|
| `.parquet`, `.pq` | Parquet 표 | Parquet 리더(아래) |
| `.csv`, `.tsv`, `.txt` | 구분자가 있는 텍스트 | 텍스트 리더(아래) |
| `.3dheat` | 파일 하나에 담긴 매치 하나(표와 부가 자료를 담은 ZIP) | 그 안의 표로 불러옴 - [파일 하나에 담은 매치](container.md) |
| `.acmi`(`.txt.acmi`, `.zip.acmi`도 포함) | Tacview 비행 기록 | 자체 리더 - [Tacview 기록](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP 기록(Arma 방식) | 자체 리더 |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS 트랙: GPX, KML/KMZ, NMEA 기록, IGC 글라이더 기록, FIT 스포츠 파일 | 자체 리더. 위치는 위도와 경도에서 옴 |

위치로 읽지 않는 파일은 다음과 같습니다. 표를 설명하려고 표 옆에 두는 작은 JSON 파일(이름이 `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`으로 끝나는 것)과, 변환기의 부가 표(`<match>.events.parquet` 등. [변환기](converters.md) 참고)가 해당합니다. 단, 직접 따로 고른 경우는 예외입니다. 그 밖의 것은 이유와 함께 건너뜁니다. 선택이 어떻게 걸러지는지는 [파일 불러오기](loading-files.md#which-files-are-kept)에 설명되어 있습니다.

빈 파일은 건너뜁니다. `movement*.<ext>` 파일이 들어 있는 선택에서는 그 파일만 불러옵니다([파일 불러오기](loading-files.md#which-files-are-kept)).

데이터는 **샘플 하나당 한 행**입니다. 어느 순간의 위치이며, 선택 사항으로 누구인지, 어느 그룹인지, 어느 세션인지, 어디를 보고 있었는지, 그리고 그 밖의 열을 함께 가집니다. 이벤트 행(킬, 설치, 발사)은 이벤트 열로 구분하여, 위치 행과 같은 표에 넣을 수 있습니다.

## 구분자가 있는 텍스트(CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

가장 작은 쓸모 있는 파일이며, 행은 세 개입니다.

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

열은 스스로 대응합니다([열 매핑](column-mapping.md)).

바이트 단위 스캐너로 분석하며, 매핑된 열만 해독합니다([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| 항목 | 규칙 |
|---|---|
| 머리글 | 비어 있지 않은 첫 줄에 열 이름이 있습니다. 빈 이름은 `column_N`이 됩니다. |
| 구분자 | 처음 1 MiB의 비어 있지 않은 처음 20줄에서, 쉼표, 세미콜론, 탭, 파이프 중에서 **일관성**으로 찾습니다. 샘플한 모든 줄에서 같은 필드 수를 주는 구분자가 이기며, 동점이면 필드를 더 많이 주는 것이 이깁니다. 공백은 자동으로 찾지 않지만 고를 수 있습니다. 어떤 한 글자든 입력할 수 있습니다([열 매핑](column-mapping.md#the-fields)). |
| 따옴표 | RFC 4180. 필드는 큰따옴표로 감쌀 수 있으며, 따옴표 안의 `""`는 따옴표 한 글자입니다. |
| 공백 | 각 필드의 앞뒤 공백, 탭, 따옴표는 잘라 냅니다. |
| 행당 필드 수 | 최대 4,096개입니다. 그 이상은 오류입니다(*구분자가 맞나요?*). |
| 숫자 | 선택적인 부호, 숫자, 선택적인 `.`과 소수, 선택적인 지수(`1.5e-3`). 소수점 쉼표(`1,5`), 천 단위 구분자, 뒤에 붙은 단위(`12 m`)는 해독되지 않으며 없는 값으로 셉니다. 파일이 소수점 쉼표를 쓴다면, 불러오기 전에 점으로 바꾸세요(텍스트 편집기의 찾아 바꾸기로 가능합니다). |
| 숫자 열 | 처음 50행의 비어 있지 않은 값 중 90%를 넘게 숫자로 해독되면 숫자 열로 제안합니다. |
| 행 수 | 불러오기 전에 처음 1 MiB의 평균 줄 길이로 추정합니다. |
| 텍스트 인코딩 | UTF-8. |

## Parquet {#parquet}

[hyparquet](https://github.com/hyparam/hyparquet)로 읽으며, 열 묶음을 하나씩 타입이 있는 배열로 가져옵니다. 매핑된 열만 요청합니다([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| 항목 | 규칙 |
|---|---|
| 행 수 | 정확한 값이며, 불러오기 전에 푸터에서 읽습니다. |
| 미리보기 | 처음 50행을 객체로 해독합니다. 이 값들이 어떤 열을 숫자로 볼지 정합니다. |
| 정수 | `INT32`와 `INT64`(BigInt로 해독)는 숫자가 됩니다. |
| 실수 | `FLOAT`, `DOUBLE`. |
| 불리언 | 1과 0. |
| 문자열 | 사람, 그룹, 세션, 분류 열에 씁니다. 숫자처럼 보이는 문자열은 숫자 역할에도 받아들입니다. |
| `TIMESTAMP`, `DATE` 논리 타입 | 시점(1970년 이후의 밀리초)으로 해독합니다. 시간 축으로 쓸 때 단위 설정은 무시합니다. |
| 중첩 열 | 구조체와 리스트 열은 어떤 역할에도 쓰지 않습니다(JSON 텍스트로 미리보기). 시험하지 않았습니다. |
| 푸터 메타데이터 | 키 `heat3d`는 매핑 힌트로 읽습니다(아래 참고). |

위치, 시간, 시선 열에 숫자가 아닌 값이 있으면 없는 값으로 해독합니다.

## 열의 역할과 타입 {#column-roles-and-types}

| 역할 | 파일의 타입 | 필수 | 저장 형태 | 한계 |
|---|---|---|---|---|
| X, Y, Z | 숫자 | 셋 중 둘 | [축 매핑](axes-units-and-time.md) 후 32비트 실수 | 쓸 수 있는 위치가 없는 행은 버립니다. |
| 시간 | [시간 단위](axes-units-and-time.md#time-units) 중 하나의 숫자, Parquet 타임스탬프, 또는 ISO-8601 텍스트 | 아니요 | 가장 이른 행부터의 32비트 실수(초) | 4억 행을 넘으면 정렬을 거부합니다([이유](memory-and-budgets.md#the-sort-ceiling)). |
| 사람 | 아무거나. 사전 인코딩 | 아니요 | 32비트 id | |
| 세션 | 아무거나. 사전 인코딩 | 아니요 | 32비트 id | 최대 100,000개 세션의 라벨을 나열합니다. |
| 그룹 | 아무거나. 사전 인코딩 | 아니요 | 16비트 id | 그룹은 최대 4,096개이며, 넘으면 그룹화를 버립니다. |
| 요(yaw), 피치 | 숫자, 도 또는 라디안 | 아니요 | 32비트 실수 라디안 | |
| 방향 X, Y, Z | 숫자 | 아니요(셋 모두 함께) | 요와 피치로 변환 | |
| 필터 열, *범위* | 숫자 | 아니요 | 32비트 실수 | 동시에 활성 필터는 최대 4개입니다. |
| 필터 열, *분류* | 아무거나. 사전 인코딩 | 아니요 | 32비트 id | 값은 최대 4,096개이며, 넘으면 그 열을 두지 않습니다. |

필터 열로 둔 Parquet `TIMESTAMP` 열은 에포크 밀리초의 *범위*입니다. 목록이 아니라 슬라이더입니다.

## 결과 열 {#outcome-columns}

누가 이겼는지를 모든 행에 둡니다. 그러면 장소, 경로, 플레이를 그 편이 나중에 얼마나 자주 이겼는지로 판단할 수 있습니다([승률](win-rate.md)). 뷰어는 이 열을 스스로 유지하고, [필터](filters.md)의 맨 앞에 뷰어의 언어로 나열하며, [승률 지도](win-rate.md), [상세 분석](breakdown.md), [볼륨 통계](volumes.md#statistics)에서 읽습니다. 라운드제 게임(CS2, Valorant, Rainbow Six Siege)이나 경기 단위 게임(War Thunder)의 변환기는 네 열을 모두 씁니다:

| 열 | 형식 | 의미 |
|---|---|---|
| `won` | 0/1(모르면 비움) | 행의 편(팀)이 **라운드**를 이겼음. 라운드가 없는 게임에서는 경기 |
| `matchWon` | 0/1(모르면 비움) | 행의 편(팀)이 **경기**를 이겼음. 기록에 끝이 나오지 않으면 비움 |
| `round` | 정수, 1부터 | 행이 속한 라운드. 경기 단위 게임에서는 경기 내내 1 |
| `roundEndReason` | 텍스트 | 라운드(경기 단위 게임에서는 경기)가 어떻게 끝났는지, 아래 단어로 |

`won`과 `matchWon`은 그 행의 편의 것입니다. T 플레이어의 행은 T 편의 결과를, AI 유닛의 행은 그 팀의 결과를 가집니다. 어느 편에도 속하지 않는 행은 비워 둡니다. 하프타임에 편을 바꾸는 쪽은 자신의 `matchWon`을 유지하고, 각 라운드의 `won`은 그 라운드에서 뛴 편의 것을 가집니다. 무승부는 양쪽 모두 0입니다.

종료 이유는 모든 게임이 함께 쓰므로 필터 하나가 모든 게임에 통합니다(게임 고유의 단어는 가능한 한 여기에 맞춥니다. [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | 의미 | 게임 |
|---|---|---|
| `elimination` | 한 편의 플레이어가 모두 탈락 | CS2, Valorant, Rainbow Six Siege |
| `bomb` | 폭탄(스파이크, 해체 장치의 목표)이 터짐 | CS2, Valorant, Rainbow Six Siege |
| `defuse` | 폭탄(스파이크)이 해체됨 | CS2, Valorant, Rainbow Six Siege |
| `time` | 라운드 시간이 다 됨. War Thunder: 양쪽 모두 티켓이 남은 채로 결정됨 | 전체 |
| `surrender` | 한 편이 항복함 | CS2, Valorant, Rainbow Six Siege |
| `draw` | 승자 없음 | CS2 |
| `objective` | 목표를 빼앗거나 지킴(인질 구출, 구역 확보) | Rainbow Six Siege |
| `capture` | 승자가 점령 구역을 지키는 동안 티켓이 바닥남 | War Thunder |
| `tickets` | 처치로 티켓을 잃음 | War Thunder |
| `destruction` | 마지막 차량들을 한꺼번에 잃고, 다시 출격할 사람이 없음 | War Thunder |
| `other` | 그 밖의 모든 것 | |

다른 열처럼 `heat3d` 힌트의 `extra` 목록에도 적어 주세요. 열 이름 `win`, `round_won`, `match_won`, `end_reason`, `win_reason`도 같은 열로 읽습니다.

## `heat3d` 힌트 {#the-heat3d-hints}

Parquet 파일은 푸터의 키/값 메타데이터에 있는 **`heat3d`** 키 아래에, JSON 객체로 자기만의 읽기 지시를 담을 수 있습니다([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). 파일이 선택 중 첫 번째일 때 뷰어는 자기 추측 위에 이 지시를 적용합니다. 모든 항목은 선택 사항이며, 모든 결과는 여전히 보이고, [열 매핑](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) 패널에서 고칠 수 있습니다. JSON 객체로 해석되지 않는 것은 무시합니다.

### 스키마 {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          column names for the position
    "time": string,                                  the time column
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filter columns to keep, most useful first
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  must be > 0
  },
  "entity": {
    "size": number                                   size of one tracked thing in file units, > 0
  }
}
```

| 항목 | 적용 조건 | 효과 |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | 이름이 가리키는 열이 파일에 있을 때 | 그 역할을 정합니다. |
| `columns.timeUnit` | 일곱 단위 중 하나일 때 | 시간 단위를 정합니다. |
| `columns.angleUnit` | `"degrees"` 또는 `"radians"` | 각도 단위를 정합니다. |
| `columns.lookMode` | dirX, dirY, dirZ가 모두 설정된 `"vector"`, yaw가 설정된 `"yawPitch"`, 또는 `"none"` | 시선 모드를 정합니다. |
| `columns.extra` | 배열일 때 | 자동 필터 목록을 바꿉니다. 역할에 쓰지 않은, 실제로 있는 열만 남깁니다. 각 열은 미리보기에서 숫자처럼 보이면 *범위*, 아니면 *분류*가 됩니다. 이것이 없으면, 자동 목록에서 힌트가 역할을 준 열만 뺍니다. |
| `axes.up` | `"y"` 또는 `"z"` | 위쪽 축. |
| `axes.flipX/Y/Z` | 불리언 | 뒤집기. |
| `axes.scale` | 0보다 큰 숫자 | 단위 축척. |
| `entity.size` | 0보다 큰 숫자 | [개체 크기](sessions-persons-groups.md#entity-size)(불러올 때 단위 축척을 곱함). 설정하는 유일한 방법입니다. |

### 예 {#example}

슈터 게임의 가상 내보내기입니다. Z가 위쪽이고, 단위는 센티미터이며, 세계는 왼손 좌표계이고, 플레이어는 약 72 cm 너비입니다.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### 쓰는 방법 {#writing-it}

pyarrow를 쓰면, 사용자 정의 스키마 메타데이터를 파일의 키/값 메타데이터에 씁니다.

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet`은 파일의 스키마를 출력합니다. 힌트가 가리키는 열 이름을 빨리 확인하는 방법입니다.

## 히트맵 탭이 쓰는 것 {#what-the-heatmap-tab-writes}

데이터에는 아무것도 되돌려 쓰지 않습니다. 출력은 다음과 같습니다.

- 동영상, WebM 형식(VP9 또는 VP8) - [카메라 경로와 동영상](camera-path-and-video.md)
- 카메라 자세. 텍스트로 클립보드에 복사합니다 - [카메라](camera.md#pose)
- 브라우저의 [레벨 라이브러리](level-library.md)에 저장한 레벨
