---
title: "Tacview 기록 (ACMI)"
parent: "데이터 가져오기"
nav_order: 7
lang: "ko"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview 기록 (ACMI)

Tacview는 비행 시뮬레이터의 비행을 기록하는 프로그램입니다. 파일은 `.acmi`로 끝납니다. 3DHeat는 이 파일을 열어서 모든 항공기가 어디를 날았는지 보여 줍니다.

Tacview의 비행 기록은 다른 표와 똑같이 불러옵니다. `.acmi` (텍스트, `.txt.acmi`, 또는 압축된 `.zip.acmi`)를 고르거나 끌어 놓고 **Load**를 누르세요. 그러면 모든 비행의 히트를 얻고, **Match** 탭에서는 피규어, 궤적, 이벤트 목록이 있는 재생을 볼 수 있습니다 ([매치 재생](match-replay.md)). ACMI는 Tacview의 공개 파일 형식입니다 ([문서](https://www.tacview.net/documentation/acmi/)). DCS(Tacview 내보내기 도구를 통해), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS 등이 이 형식으로 씁니다. 그래서 이 도구는 이들 중 어느 것이든 읽습니다.

## 기록이 무엇이 되는지 {#what-a-recording-becomes}

객체의 위치가 기록될 때마다 행 하나가 생깁니다. 이벤트마다 객체의 위치에 행 하나가 생깁니다. 객체가 떠나면(`Removed`, 마지막으로 있던 곳) 행 하나가 생깁니다. 아직 본 적 없는 객체에 대한 이벤트 (책갈피, 모두에게 보내는 메시지)는 기준점에 있는 `(recording)` 객체의 행이 됩니다. 기록에는 자체 읽기 지침이 들어 있으므로, 매핑 단계가 스스로 채워집니다. 리더는 다음 열을 씁니다: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, 그리고 기록에 있는 추가 속성. 각 열의 역할은 다음과 같습니다.

| 열 | 역할 | 뜻 |
|---|---|---|
| Time | 시간 | 기록의 ReferenceTime 이후의 초. ReferenceTime이 있으면 유닉스 초이므로 시계가 실제 시간을 보여 줍니다. |
| X, Y | 위치 | 기록의 기준점에서 지구에 접하는 평면 위의 동쪽과 북쪽 방향 미터. 그 근처에서 거리와 방위는 정확하고, 100km에서 천분의 일 미만으로 벗어납니다. 북쪽은 월드의 -Z가 됩니다. |
| Altitude | 위치 (위) | 미터. |
| Object | 사람 | 조종사와 객체 이름, id 포함. 예: `Viper 1 (F-16C_50) #a01`; 무인 객체는 `(T-90A) #401`. |
| Coalition | 팀 | 진영 (또는 진영이 없을 때는 색). |
| Heading, Pitch | 시선 | 도. 방위 0은 북쪽. |
| Recording | 세션 | 기록의 Title, 또는 파일 이름. 여러 기록을 나란히 불러와도 궤적이 이어지지 않습니다. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | 필터 | 필터링용으로 보관. Type과 Name은 각 객체의 [피규어](figures.md)를 고르고, Event는 사후 분석의 이벤트 목록에 들어가며, Roll은 항공기를 기울입니다. |
| U, V | | 모든 샘플에 있을 때의 게임 자체 평면 월드 미터 (DCS가 씁니다). |
| EventObjects | 필터 | 이벤트가 이름으로 가리키는 모든 객체 (`Message|a01|b02|...`), id 기준. |
| RecordingInfo | | 그 순간의 기록 자체 속성 - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - JSON으로. |
| IAS, Mach, AOA, FuelWeight, ... | 필터 | 기록이 가진 다른 모든 숫자 속성. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | 필터 | 기록이 가진 다른 모든 문자 속성. 숫자가 아닌 값을 가진 속성은 문자입니다. |

Tacview 위치의 네 가지 형식 (`lon|lat|alt`, `u|v`가 있는 것, `roll|pitch|yaw`가 있는 것, 그리고 이 모두에 방위가 있는 것)을 모두 읽습니다. 빈 필드는 마지막 값을 유지합니다. `-id`는 객체를 제거하고, 제거 뒤에 다시 쓰인 id는 새 객체입니다. 이스케이프된 쉼표와 이어진 줄도 처리합니다.

위치는 항상 위도와 경도에서 투영하며, U/V에서 가져오지 않습니다. 그래서 모든 게임의 기록이 실제 세계의 배경과 같은 투영을 씁니다.

## DCS 서버: 누가 이겼는지, 각 출격이 어떻게 끝났는지 {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS 멀티플레이어 서버는 미션을 24시간 내내 Tacview로 기록합니다. 영구 PvP 서버는 그 많은 미션에 걸쳐 캠페인을 진행합니다. 한 진영이 상대의 모든 비행장, FARP, 구역을 빼앗으면 이깁니다. 여기에는 며칠이 걸리고 미션 재시작도 여러 번 있습니다. 기록에 담기는 것은 비행이지 캠페인이 아닙니다. 누가 무엇을 빼앗았는지 알리는 메시지는 없고, 비행장은 처음에 한 번만 기록되며, 누가 이겼는지 알려 주는 것도 없습니다. Tacview 변환기(`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts))는 알 수 있는 것을 모든 행에 더하고, 알 수 없는 것은 비워 둡니다. 절대 추측하지 않습니다.

| 열 | 의미 |
|---|---|
| `server` | 서버 또는 캠페인. 기록의 헤더에서 가져옵니다(그 Title, Author, Comments가 알려진 공개 서버인 Blue Flag, SPS Contention, Growling Sidewinder를 가리킵니다. 그 밖에는 누군가의 이름을 가리키는 Author). `--server Name`으로 폴더 전체에 이름을 붙일 수 있습니다. 헤더가 어떤 서버도 가리키지 않는 기록(`Admin` 같은 Author, 알려진 서버가 쓰지 않는 Title과 Comments)은 어디에도 배정하지 않습니다. `server`는 비어 있습니다. 서버의 기록 페이지에서 내려받았더라도 마찬가지입니다. 그 페이지에 다른 커뮤니티의 미션도 있을 수 있기 때문입니다 |
| `mission` | 버전과 캠페인 월을 뺀 기록의 Title: `Operation_Example_V7.7.99`는 `Operation Example`이 됩니다 |
| `campaign` | 기록이 속한 캠페인 라운드. 서버, 맵, 번호로 나타냅니다: `Example Server North 3`. 기록 하나가 세션 하나입니다(재시작에서 재시작까지). 라운드 하나는 많은 세션, 며칠이나 몇 주에 걸쳐 이어집니다 |
| `round` | 그 라운드의 번호. 서버가 번호를 공개하면 그 번호, 아니면 그 서버와 맵에서 본 n번째 라운드입니다. 라운드 파일(아래)에서 가져오며, 없으면 비어 있습니다 |
| `session` | 라운드의 세션 가운데 기록의 순서, 1, 2, .... `sessionStart`는 실제 시작 시각(Unix 초)입니다 |
| `heldRed`, `heldBlue` | 세션 시작 때 각 진영이 가지고 있던 분쟁 지역. 연결된 라운드 파일(아래)에서 가져옵니다 |
| `won`, `matchWon` | 행의 진영(그 Color, Red 또는 Blue)이 그 캠페인에서 이기면 1, 지면 0. 승자를 알려 주는 라운드 파일이 없을 때와 중립 행에서는 비어 있습니다. 캠페인은 라운드이면서 동시에 매치이므로, 두 열의 값은 같습니다 |
| `roundEndReason` | 모든 것을 빼앗아 이긴 캠페인은 `capture` |
| 라운드의 모든 세션의 `won`, `matchWon` | 라운드의 결과. 라운드의 끝이 알려지면 그 모든 기록에 쓰입니다 |
| `sortie` | 항공기의 행에서, 그 비행. 이륙부터 이륙까지 1, 2, .... 첫 이륙 전과 착륙 뒤의 지상 시간은 그것이 속한 비행에 셉니다 |
| `sortieResult` | 그 비행이 어떻게 끝났는지: `landed`, `landed damaged`(공중에서 피격된 뒤), `ejected`, `shot down`, `destroyed`(지상에서), `crashed`, `despawned`(원인이 보이지 않은 채 공중에서 사라짐. 플레이어가 나감), `airborne at end`, `no takeoff` |
| `sortieKills` | 그 비행에서 그 항공기에 인정된 격추 수 |

영구 서버에서는 출격이 의미 있는 단위입니다. `sortieResult` = `shot down`으로 필터하면 어디서 비행을 잃었는지 볼 수 있습니다. [상세 분석](breakdown.md)에서 히트를 `sortieResult`나 `server`별로 나눌 수도 있습니다. 출격을 이루는 이륙, 착륙, 비상 탈출, 격추, 추락은 변환기가 항공기의 움직임에서 알아내는 이벤트입니다(위).

라운드의 두 세션 사이에 빼앗긴 장소(아래의 라운드 파일에서 알 수 있습니다)는 나중 기록의 시작에서 `capture` 이벤트가 됩니다: `Object` `(campaign)`, 그 장소에서, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

기록에서 진영이 바뀌는 것이 보이는 비행장이나 FARP(다른 색으로 다시 기록되었거나, 지워진 뒤 5분 안에 같은 자리에 다른 색으로 다시 기록됨)는 그 패드에서 `capture` 이벤트가 됩니다: `Event` = `capture`, `Airfield`는 그 이름, `Detail` `Red to Blue`, `Coalition`은 새 진영입니다. 어떤 색으로 처음 기록된 패드는 점령이 아닙니다. 지금까지 살펴본 서버는 패드를 한 번만 기록하므로, 그 기록에는 점령이 없습니다.

### 라운드 파일 {#rounds-files}

라운드 파일은 서버마다 캠페인 라운드, 그 승자, 각 라운드의 세션을 알려 줍니다. 서버가 공개하는 것이나 기록 자체(아래)에서 만듭니다.

캠페인에서 누가 이겼는지는 서버가 공개하는 것(웹 페이지의 캠페인 로그)이며, 기록 안에 있는 것이 아닙니다. 라운드 파일이 그것을 담고, 변환기는 `--rounds file.json`으로 이를 읽습니다(여러 개를 줄 수 있습니다):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

기록은 그 `server`의 라운드 가운데 `title`(정규 표현식)이 기록의 Title과 맞는 라운드에 속합니다. 각 행은 실제 시각이 들어가는 라운드에 속합니다. 실제 시각은 기록의 RecordingTime에 행의 초를 더한 것이며, 게임 안의 미션 날짜가 아닙니다. 시각은 UTC입니다. 승자가 없는 라운드(교체됨, 아직 진행 중)는 그 행에 라운드 번호와 빈 결과를 줍니다.

매치 문서에 해당하는 `acmi` 푸터는 War Thunder 매치의 `result.source`처럼 결과가 어디서 왔는지 알려 줍니다. `outcome.result`는 `{ winner, round, endReason, source }`이고, `source`는 라운드 파일의 `source`, 아무것도 승자를 알려 주지 않았으면 `null`입니다. `outcome`에는 기록의 라운드, 점령, 끝난 방식별 출격도 나옵니다:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

그 캠페인에서 Blue 진영 파일럿 `Viper 1 (F-16C_50) #a01`의 행은 이렇게 됩니다: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### 기록 자체에서 만드는 라운드 {#rounds-from-the-recordings-themselves}

영구 서버는 재시작을 넘어 캠페인을 유지합니다. 각 기록은 캠페인이 남겨 둔 자리에 있는 두 진영의 지상 유닛과 정적 객체로 시작합니다. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...`는 각 기록의 처음 몇 분을 읽고([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), 서버마다 한 맵의 기록을 시간 순서로 놓고 연결합니다:

- **장소**: 약 2 km 크기의 셀로 나눈 지면입니다. 세션 시작 때 그곳에 있는 유닛의 4분의 3이 한 진영의 것이면, 그 셀은 그 진영의 것입니다. *분쟁 지역*은 두 진영 모두가 가지고 있는 것이 보인 장소입니다.
- **점령**: 다음 세션 시작 때 다른 진영이 가지고 있는 장소입니다. 미션 사이에, 또는 앞선 미션 도중에 빼앗긴 것입니다.
- **새 라운드**: 장소가 마지막 세션과 60%를 넘게 다른 세션입니다. 이전 라운드의 한 단계가 아니라 새 라운드의 시작 배치입니다. 서버가 다른 맵으로 옮겨 갈 때도 라운드가 끝납니다(그 세션은 마지막 세션 뒤에 시작해서 이어집니다).
- **누가 이겼는지**: 끝난 라운드에서는 마지막 세션 시작 때 모든 장소를 가지고 있던 진영입니다(`capture`, 신뢰도 높음). 그렇지 않으면 분쟁 지역을 더 많이 가지고 있던 진영입니다(상대의 두 배면 중간, 아니면 낮음. 맵 변경으로 끝났으면 낮음). 진행 중인 라운드에는 승자가 없지만, 각 세션이 시작 때 각 진영이 가진 장소의 수를 알려 주므로 누가 앞섰는지 보입니다.
- 세션이 모두 같은 상태로 시작하는 서버는 세션 사이에 상태를 유지하지 않습니다. 연결하지 않습니다.

마지막 세션의 시작은 라운드가 끝나기 몇 시간 전일 수 있으므로, 신뢰도가 중요합니다. 승자를 공개하는 서버와 맞춰 보았습니다. 연결은 공개된 라운드가 시작된 세션에서 새 라운드를 모두 찾았고, 마지막 시작 때 앞선 진영은 확인할 수 있었던 9개 라운드 모두에서 공개된 승자였습니다. `--official file.json`은 그런 서버의 공개 라운드를 유지하고 연결에서 얻은 세션을 더합니다. 파일의 `validation`은 연결이 얼마나 일치했는지 알려 줍니다. 지어낸 캠페인의 예:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### 캠페인 라운드를 시리즈로 보기 {#watching-a-campaign-round-as-a-series}

한 라운드의 기록(`campaign`이 같은 파일)을 함께 불러오면, 뷰어는 이를 하나의 시리즈로 재생합니다. 세션을 실제 순서대로 하나씩 재생하고, 두 세션 사이의 몇 시간이나 며칠은 1분 휴식으로 줄입니다. 타임라인은 각 세션의 시작을 노란색으로, 휴식을 어두운 띠로 표시하고, 시계는 재생 중인 세션과 그 실제 날짜를 알려 줍니다(`session 4/12 · 2026-11-02 12:38 UTC`). 히트, 리플레이, 필터, **인사이트**는 불러온 다른 데이터와 똑같이 시리즈 전체에서 작동합니다. **매치** 탭의 **캠페인 라운드** 섹션에는 세션과 그 날짜, 각 시작 때 각 진영이 가진 분쟁 지역의 수(라운드 전체에 걸친 차트로도), 그 전에 빼앗긴 수가 나옵니다. 클릭하면 그 세션의 시작으로 갑니다. 혼자 불러온 기록은 그곳에 어느 라운드의 어느 세션인지 알려 줍니다. 서로 다른 라운드의 기록을 함께 불러오면 시리즈가 아닙니다. 따로 불러온 매치처럼 각각 0에서 시작합니다. 다중 매치 로더(**여러 경기를 한꺼번에**)도 라운드를 시리즈로 재생합니다. 수 기가바이트의 라운드를 위해 스트리밍하고 GPU에 맞는 크기로 줄입니다.

라운드 동안 주인이 바뀐 장소는 지도에 점령 구역으로 그려집니다. 재생 중인 세션의 시작 때 각 장소를 가진 진영의 색으로 칠해지고, 세션 경계에서 바뀝니다. 바뀔 때마다 리플레이의 이벤트 목록에 점령이 하나 들어갑니다. 이 장소는 불러온 행에서 알아냅니다(연결과 같이, 각 세션의 처음 몇 분 동안의 지상 유닛과 정적 객체를 약 2 km 셀로 봅니다). 그래서 전체 로더가 필요합니다(다중 매치 로더는 각 행의 데이터를 너무 적게 남깁니다).

**라운드의 기록 하나에서 라운드 전체 불러오기.** 일반 브라우저에서 뷰어는 사용자가 고르지 않은 파일을 열 수 없습니다. 라운드의 파일을 함께 불러오세요. 로컬 뷰어 서버(`npm run dev` 또는 `npm run preview`)가 제공하면 열 수 있습니다. git이 무시하는 `tools/local-data.json`에 라운드 파일 폴더와 변환된 기록 폴더를 가리키는 `campaigns` 항목을 넣으세요. 그러면 기록 하나의 캠페인 라운드 섹션에 **라운드 전체 불러오기**가 나오고, 거기서 찾은 라운드의 세션을 가져와 다중 매치 로더로 불러옵니다:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

라운드 파일이 가리키는 기록만 제공됩니다(`tools/campaign-files.mjs`). 그 폴더에서 찾지 못한 세션은 세기만 하고 불러오지 않습니다.

알려진 서버가 공개하는 것:

| 서버 | 라운드 | 진영이 이기는 방법 | 승자를 읽을 수 있는 곳 |
|---|---|---|---|
| SPS Contention | 한 맵과 한 시대의 캠페인(며칠), 여러 번의 재시작에 걸침 | 모든 비행장, FARP, 거점을 빼앗음. 승자 없이 끝난 캠페인은 교체됨 | 서버의 공개 캠페인 로그(캠페인별 승자, 시작, 끝) |
| Blue Flag | 5시간짜리 미션 여러 개에 걸친 캠페인 라운드. Title의 `_YYYY_MM`은 재시작마다 한 달씩 나아감 | 적의 모든 진지를 빼앗음. 예전 라운드는 정해진 시간 뒤에 더 많이 가진 진영을 승자로 함 | 지금까지 찾은 형태로는 공개되지 않음. 기록의 연결이 각 라운드와 매 시작 때 누가 얼마나 가졌는지를 따라감 |
| Growling Sidewinder | 오픈 컨플릭트 미션의 한 번 실행(6시간) | 구역과 비행장을 빼앗음 | 통계 페이지는 결과가 아니라 파일럿을 보여 줌. 모든 세션이 같은 상태로 시작하므로 여러 세션에 걸친 라운드가 없음: 비어 있음 |
| AI 상대 미션(구역 점령 미션) | 한 번의 미션 실행 | 플레이어 진영 대 미션의 AI: PvP 결과 없음 | 비어 있음 |
| 배정 안 됨(헤더가 서버를 가리키지 않음) | - | - | 비어 있음, `server`도 비어 있음 |
