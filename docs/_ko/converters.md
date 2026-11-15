---
title: "변환기는 모든 것을 보존"
parent: "데이터 가져오기"
nav_order: 8
lang: "ko"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# 변환기는 모든 것을 보존

리플레이를 열기 위해 이 페이지가 필요하지 않습니다. 게임 파일을 3DHeat 표로 바꾸는 도구를 만드는 사람, 그리고 그 표가 왜 그렇게 많은 것을 담는지 알고 싶은 사람을 위한 페이지입니다.

게임의 리플레이, 데모, 로그, 또는 실시간 텔레메트리를 뷰어가 여는 것으로 바꾸는 모든 도구는 한 가지 규칙을 따릅니다.

> **원본이 가진 것 중 지금 읽을 수 있는 것은 모두 변환하고, 나머지는 통째로 보관해서, 원본 파일 없이도 나중에 읽을 수 있게 합니다.**

리플레이는 게임 업데이트, 재설치, 또는 디스크가 가득 찬 뒤에는 사라지는 일이 많습니다. 실시간 피드는 보내진 순간 사라집니다. 변환기가 버린 것은 영원히 잃습니다. 통째로 보관한 것은 누군가 이해하는 날에 해독할 수 있습니다. 그래서 변환기는 무엇이 쓸모 있을지 결정하지 않습니다. 읽을 수 있는 것을 해독하고, 나머지 모든 메시지, 패킷, 이벤트, 속성, 줄은 바꾸지 않고 표 옆에 보관하며, 자기 출력에서 각각 얼마를 읽었고 얼마를 보관만 했는지 말합니다.

이 페이지는 모든 변환기가 공유하는 약속입니다. War Thunder, World of Tanks, World of Warships, Squad 리플레이 변환기, CS2 데모 변환기, 백그라운드 감시자(Dota 리플레이 해독기와 모든 실시간 어댑터), 게임 캡처 도구의 텔레메트리 읽기 도구, 그리고 뷰어 자체의 가져오기(Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA)에 적용됩니다. 뷰어 자체의 읽기 도구는 [Tacview 기록](tacview-acmi.md)과 [파일 불러오기](loading-files.md)에 설명되어 있습니다. 파일 하나짜리 형식은 [매치 하나를 파일 하나로](container.md)입니다. 매치 하나는 표 하나, `match.json`, 그리고 사이드카가 되고, 선택적으로 `.3dheat` 파일 하나로 묶입니다. 각 도구의 README에는 그 소스에 대해 무엇을 읽었고, 무엇을 원본 그대로 보관했고, 무엇을 얻을 수 없는지(그리고 이유)를 나열하는 **완전성** 절이 있습니다.

## 모든 항목의 세 자리 {#three-homes-for-every-item}

소스가 가진 모든 것은 정확히 세 곳 중 한 곳에 들어갑니다.

| 자리 | 들어가는 것 |
|---|---|
| **해독됨** | 표(샘플 또는 이벤트마다 행 하나, 뷰어가 읽는 열, 그리고 행에 속하는 다른 모든 값을 위한 추가 열)와 매치 문서 `<match>.match.json`(매치 전체에 속하는 모든 것: 설정, 명단, 결과, 점수판, 자체 점검). |
| **원본 그대로 보관** | 표 옆의 사이드카. 해독되지 않았거나 일부만 해독된 모든 항목을 통째로, 바뀌지 않게, 그 형식, 시간, 그리고 소속된 유닛이나 개체와 함께. |
| **얻을 수 없음** | README의 완전성 절에 이유와 함께 적습니다. 형식이 담지 않음(클라이언트 리플레이에는 다른 플레이어의 입력이 없음), 소스가 보내지 않음, 또는 읽는 것이 허용되지 않음(보호된 프로세스, 우리가 쓸 권한이 없는 키로 암호화된 블록). |

**일부만** 해독된 항목은 해독되고 *동시에* 원본 그대로 보관됩니다. 표에는 이해한 것이 들어가고, 사이드카에는 항목 전체가 들어갑니다. 그래서 나중에 더 나은 해독기가 원본 파일을 필요로 하지 않습니다.

네 번째 자리는 없습니다. 쓸모없어 보인다고, "아마 중복"이라서, 또는 크다는 이유로 무언가를 버리는 것은 버그입니다. 솎아내는 것은 표에서만 허용됩니다(60 Hz 대신 2 Hz의 카메라). 사이드카에서는 절대 안 됩니다.

## 사이드카 {#sidecars}

사이드카는 표 옆에 있는 Parquet 파일이며, 표의 이름을 따릅니다.

```
<folder>/<match>.parquet              표
<folder>/<match>.match.json           매치 문서
<folder>/<match>.<what>.parquet       사이드카
```

`<what>`은 이 목록의 단어 하나입니다. 새 변환기는 맞는 단어를 고르거나, 여기에 새 단어를 추가하고 **동시에** [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)의 `SIDECAR_PARQUET`에도 추가합니다. 그래야 폴더 전체를 불러올 때 뷰어가 그것을 뺍니다.

| `<what>` | 담는 것 | 쓰는 곳 |
|---|---|---|
| `messages` | 네트워크 스트림의 패킷, 개체 메서드 호출, 속성 갱신. 통째로 | War Thunder, World of Tanks, World of Warships |
| `flight` | 항공기별 비행 모델 항목. 통째로 | War Thunder |
| `packets` | 개체 스트림 밖의 프레임과 네트워크 메시지 전체, 또는 컨테이너 조각 | CS2, Dota 2, Squad |
| `events` | 파서가 주는 대로, 모든 키를 가진 게임 이벤트 | CS2 |
| `entities` | 개체와 속성 갱신, 원격 호출, 열린 채널과 닫힌 채널, 해독기가 필요한 내보내기 | Squad, Dota 2 |
| `props` | 파서가 읽는 모든 개체 속성, 바뀔 때마다 | CS2 |
| `units` | 위치 표 밖의 유닛별 상태 | Dota 2 |
| `combatlog` | 전투 로그. 모든 항목과 모든 필드 | Dota 2 |
| `strings` | 모든 문자열 표의 모든 항목 | CS2, Dota 2 |
| `objectives` | 점령 지역과 목표. 바뀔 때마다 시간과 함께 | War Thunder |
| `raw` | 실시간 피드. 받은 모든 패킷, 줄, API 문서, 또는 메모리 읽기. 통째로 | 감시자 세션(`heat.raw.parquet`), 게임 캡처 도구의 랩 기록기(`<stamp>_<game>.raw.parquet`), 감시자의 osu!, LoL, Valorant 리플레이 파일 |

뷰어의 폴더 불러오기는 이 목록의 모든 `*.<what>.parquet`, 그리고 모든 `*.match.json`, `*.meta.json`, `*.summary.json`과 다른 JSON 사이드카를 건너뜁니다. 그중 하나만 따로 열면(고르거나 그 파일만 끌어 놓으면) 다른 표와 똑같이 불러옵니다([파일 불러오기](loading-files.md)를 보세요).

이것들은 변환기가 `--loose`로 쓰는 파일입니다. 기본적으로 War Thunder, CS2, Tacview 변환기는 매치의 표, 문서, 사이드카를 같은 이름으로 `<match>.3dheat` 파일 하나에 묶습니다([매치 하나를 파일 하나로](container.md)를 보세요). 여기 있는 모든 것은 각 멤버에 대해서도 성립합니다.

### 열 {#columns}

사이드카의 각 행은 항목 하나입니다. 열은 이 순서로, 해당되는 것만 있습니다.

| 열 | 형식 | 뜻 |
|---|---|---|
| `time` | float64 | 표의 `time`과 같은 시계의 초(소스가 틱을 세면 `tick`. 그때는 둘 다) |
| `type` | string (사전) | 항목이 무엇인지, 소스 자신의 용어로: 패킷 종류, 메시지 id, 이벤트 이름, 속성 경로, 줄 머리 |
| `name` | string (사전) | 알려진 경우 이름(커뮤니티 이름, 클래스 이름). 아니면 비어 있음 |
| `entity` / `unit` / `uid` / `player` | 정수 또는 문자열 | 누구에 속하는지. 표와 같은 id이므로 사이드카의 행을 궤적에 이어 붙일 수 있음 |
| `decoded` | string (JSON) | 그 항목에서 이해한 것. 있을 때만, 아니면 비어 있음 |
| `payload` | binary | 항목의 바이트. 통째로, 바뀌지 않게(이진 소스) |
| `text` | string | 항목의 텍스트. 통째로, 바뀌지 않게(텍스트 소스: 로그 줄, JSON 객체, 키-값 블록) |

다른 열도 허용합니다(비트 오프셋, 크기, 채널). 반복되는 문자열은 사전 인코딩하고 파일은 zstd로 씁니다. 그래서 사이드카는 리플레이 자체 크기의 일부로 남습니다.

사이드카는 그것만으로 충분해야 합니다. 나중에 쓰인 해독기는 원본 리플레이가 아니라 사이드카를 읽습니다. 항목이 문맥 없이는 이해되지 않을 때(개체의 클래스, 문자열 표, 메시지가 가리키는 키), 그 문맥도 사이드카에 넣거나 매치 문서에 넣습니다.

### 실시간 소스 {#live-sources}

실시간 어댑터(UDP 텔레메트리, 공유 메모리, 게임 로그, 로컬 API)에는 되돌아갈 파일이 전혀 없습니다. 그래서 소스가 보내는 **모든 필드**를 기록합니다. 아직 아무도 쓰지 않는 것까지도요.

- 패킷 피드: 도착하는 속도대로, 모든 패킷을 통째로. `payload`는 바이트, `type`은 패킷 id 또는 형식;
- 공유 메모리나 폴링하는 API: 모든 읽기의 모든 필드를, 이름 붙은 열로 또는 블록 전체를 `payload`로, 어댑터가 읽는 속도대로;
- 로그: 모든 줄. `text`는 그 줄, `type`은 줄의 종류. 어댑터가 동작하지 않는 줄도 포함.

이것들은 세션의 표 옆에 있는 `<session>.raw.parquet`에 들어갑니다. 크기는 규칙의 대가입니다. 그 크기는 빼서 줄이는 것이 아니라 zstd와 사전 인코딩으로 줄입니다.

## 자체 점검 {#the-self-check}

모든 변환기는 매치 문서(또는 세션의 `meta.json`, 또는 매치 문서가 없으면 요약)에 `selfCheck` 아래 `completeness` 블록을 씁니다.

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| 필드 | 뜻 |
|---|---|
| `seen` | 소스가 가진 이 종류 항목의 수 |
| `decoded` | 표나 매치 문서에 통째로 읽은 것 |
| `partial` | 표나 문서에 일부 읽고, 사이드카에 통째로 보관한 것 |
| `raw` | 사이드카에만 통째로 보관하고, 해독하지 않은 것 |
| `lost` | `seen - decoded - partial - raw`. 반드시 0 |

최상위 `lost`는 합계입니다. 변환기의 테스트는 합성 샘플에서 이것이 0인지 확인하며, README는 실제 샘플에서 얼마였는지 말합니다. 0이 아닌 `lost`는 변환기가 규칙을 어겼다고 말하는 것입니다. 종류의 이름을 대므로 빈틈을 찾을 수 있습니다.

"types"는 소스 자신의 것입니다. 패킷 종류, 메시지 id, 이벤트 이름, 속성 그룹, 줄 종류입니다. 기대하는 목록에서 세는 것이 아니라 변환기가 마주칠 때 셉니다. 그래서 아무도 몰랐던 종류도 사라지지 않고 개수와 함께 나타납니다.

## README의 완전성 절 {#the-readmes-completeness-section}

각 변환기의 README에는 **완전성**이라는 제목의 절이 있고, 세 목록이 있습니다.

- **읽음**: 표와 매치 문서에 들어가는 것, 그리고 새 필드마다 독립된 무엇(게임 자신의 수치, 두 번째 소스, 그 목적으로 만든 기록)에 어떻게 대조했는지.
- **원본 그대로 보관**: 어떤 사이드카에 있는지, 어떤 `type` 아래에 있는지, 지금까지 그것에 대해 무엇을 알고 있는지.
- **얻을 수 없음**: 소스가 담지 않거나 읽는 것이 허용되지 않는 것과 그 이유.

이 페이지로 돌아가는 링크도 있습니다.

## 각 변환기의 현황 {#where-each-converter-stands}

| 변환기 | 사이드카 | 완전성 절 |
|---|---|---|
| War Thunder 리플레이 | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (자체 점검 개수는 `counts` 아래에 있음. `completeness` 블록은 나중에 추가 예정) |
| World of Tanks 리플레이 | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships 리플레이 | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad 서버 데모 | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 데모 | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 리플레이 (감시자) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 리플레이](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant 리플레이 (감시자) | `raw` | [감시자 문서](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs)의 각 페이지 |
| 실시간 어댑터 (감시자) | `raw` | [감시자 문서](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs)의 각 게임 페이지, 그리고 `Session.raw`에 대해서는 [개발](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) |
| 랩 기록기 (게임 캡처) | `raw`, 그리고 Forza 랩 파일 안의 `unparsed` 바이트 | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| 뷰어 자체 가져오기 | 없음: 아래를 보세요 | 이 페이지 |

### 뷰어 자체 가져오기 {#the-viewers-own-imports}

Tacview ACMI, OCAP, GPS 형식은 사용자의 파일에서 브라우저가 읽습니다. 뷰어는 그것을 아무것도 저장하지 않으므로, 파일 자체가 기록으로 남습니다. 그래도 할 수 있는 만큼 읽습니다.

- **Tacview ACMI** (`src/data/acmi.ts`): 위치가 있는 객체 줄은 모두 행이 되고, 기록이 가진 모든 속성을 담습니다. 모든 이벤트는 행이 되고, 모든 제거도 행이 됩니다. 기록 자체의 속성(머리글의 FileType과 FileVersion 포함)은 모든 행에 `RecordingInfo`로 붙습니다. 주석 줄은 이벤트 `Comment`가 되고, 위치를 한 번도 받지 못한 객체는 기준점의 `Unplaced` 행이 됩니다. U와 V는 어떤 행이든 가지고 있으면 열이 됩니다. 위치 없는 속성 줄은 일부만 읽습니다. 그 값은 자기 시간이 아니라 객체의 다음 행에 도달합니다. `AcmiTable.completeness`는 파일의 줄을 종류별로 셉니다.
- **OCAP** (`src/data/ocap.ts`): 모든 개체의 프레임, 발사, 표식, 모든 이벤트 종류(모르는 종류는 텍스트와 함께 "Mission" 행으로), 그리고 문서 자체 필드(`Info`). 아직 읽지 않은 것: 개체 필드, 그리고 머리글에 적힌 것 이외의 뒤따르는 위치 요소(새 레코더의 추가분), 그리고 죽은 유닛의 사망 뒤 반복 프레임(의도적으로 솎아냄. 그 안에서는 아무것도 바뀌지 않음).
- **GPS 형식** (`src/data/geoTracks.ts`): 고정점, 그 시간, 고도, 방위와 속도, 그리고 파일이 기록한 곳의 심박, 케이던스, 출력, 온도, 위성 수, HDOP, 기압 고도. 아직 읽지 않은 것: 다른 GPX와 KML 확장, 위치 문장 외의 NMEA 문장, 고정점과 그 확장 외의 IGC 레코드, 기록(랩, 세션, 장치 정보) 외의 FIT 메시지.

이 빈틈들은 변명하려고가 아니라 메우려고 적어 둔 것입니다. 뷰어가 불러온 기록을 내보내는 것(`src/data/exportRecording.ts`)은 읽은 것만 씁니다.

## 변환기 추가하기 {#adding-a-converter}

1. 형식이 무엇을 담는지 목록으로 만듭니다. 문서, 자체 구조에서, 또는 실제 샘플의 모든 메시지 종류를 세어서. 이 목록이 자체 점검의 `types`입니다.
2. 지금 확인할 수 있는 것을 해독합니다. 모든 새 필드는 표에 들어가기 전에 독립된 무언가와 대조합니다. 아직 확인할 수 없는 필드는 원본 그대로 남깁니다.
3. 나머지는 위에서 말한 이름의 사이드카에, 위의 열과 함께 통째로 보관합니다.
4. `completeness` 블록을 쓰고, `lost`가 0이라는 테스트를 씁니다.
5. README의 완전성 절을 쓰고 이 페이지로 연결합니다.
6. 사이드카의 `<what>`이 새것이면, 위 표와 `src/data/filePick.ts`의 `SIDECAR_PARQUET`에 추가합니다.

변환기는 깨끗한 방식으로 씁니다. 형식, 문서, 샘플로부터 쓰며, GPL이나 AGPL 코드에서 가져오지 않습니다. 실제 리플레이의 샘플은 그것을 만든 컴퓨터에 남고, 테스트는 합성 파일을 씁니다.
