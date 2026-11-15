---
title: "경기 분석 (CS2)"
nav_order: 10
lang: "ko"
source: "match-analysis.md"
source_hash: "270f28c0f42b"
translated: true
outdated: false
---

# 경기 분석 (Counter-Strike 2)

**매치** 탭은 리플레이를 그림으로 다시 재생합니다. Counter-Strike 2 매치라면 점수판도 보여 줍니다. 각 라운드를 누가 이겼는지, 어떻게 이겼는지, 누가 킬을 했는지 보여 줍니다. 매치를 라운드별로 되짚어 보고, 그 순간을 히트맵에서 바로 다시 보는 데 쓰세요.

매치 탭은 어떤 리플레이든 그림으로 재생합니다. War Thunder나 Tacview 기록, 또는 CS2 데모입니다. 이것들은 **리플레이의 매치**에 나열됩니다([매치 리플레이](match-replay.md)). CS2 `.match.json` 파일을 더하면, 이 페이지에 적힌 점수판이 추가됩니다.

## CS2 매치 되짚어 보기 {#review-a-cs2-match}

1. 데모를 변환해서 `.parquet` 파일과 `.match.json` 파일을 만듭니다([아래](#where-the-data-comes-from)).
2. **히트맵** 탭에서 **소스** 아래의 `.parquet` 파일을 불러옵니다.
3. **매치** 탭을 열고 **매치 파일 불러오기...**를 누르거나, `.match.json` 파일을 보기 위에 끌어 놓습니다.
4. **매치 요약**에서 매치를 클릭한 다음, 라운드 띠의 칸을 클릭해서 그 라운드를 엽니다.
5. **라운드 표시**를 누르면 히트맵에서 그 라운드를 봅니다. **라운드 리플레이**를 누르면 그림으로 재생해서 봅니다.

![매치 탭: 라운드 띠(라운드 하나가 열려 있음), 킬 피드, 점수판](../assets/img/en/match-analysis-round.webp)

KAST, ADR, 에코, 포스 구매, 트레이드 같은 말은 [용어집](glossary.md#counter-strike-words)에 있습니다.

## 데이터의 출처 {#where-the-data-comes-from}

[3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2)의 데모 변환기는 데모를 매치마다 두 파일로 바꿉니다. 파일은 맵마다 한 폴더에 들어갑니다.

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| 파일 | 불러오는 곳 | 담는 것 |
|---|---|---|
| `<match>.parquet` | **히트맵** 탭(소스 패널. 다른 Parquet와 같음 - 파일 하나, 여러 개, 또는 폴더 전체) | 모든 플레이어의 위치를 초당 여덟 번, 그리고 이벤트가 일어난 곳 모두: 킬, 사망, 피해, 발사, 투척, 연막, 섬광, HE, 화염병, 디코이, 실명, 설치, 해체, 폭발. `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, 바라보는 방향, `weapon`, `place`, `opening`, `traded` … 포함 |
| `<match>.match.json` | **매치** 탭 | 팀, 점수, 모든 라운드(승자, 방법, 경제, 설치, 순서대로 모든 킬, 클러치, 생존자), 모든 플레이어의 점수판 줄 |

Parquet 파일의 끝부분(footer)에는 읽기 지시(키 `heat3d`)가 들어 있어서, 아무것도 설정하지 않고 열립니다. 플레이어는 사람으로, 진영은 그룹으로, 각 라운드(`roundId`, "<match> #NN")는 세션으로, 바라보는 방향은 켜진 상태로, 세계는 올바른 방향으로 놓입니다(CS2의 세계는 오른손 좌표계이며 Z가 위입니다. 기본 Z-up 대응으로 읽으면 거울상이 됩니다). [열 대응](column-mapping.md)과 [파일 불러오기](loading-files.md)를 보세요. `python -m heat3d_cs2 map <map>`은 같은 좌표계로 맵 기하를 내보내며, **레벨**에서 불러옵니다.

숫자 뒤의 규칙은 변환기의 것입니다(README에 적혀 있고 각 요약에 담김). 사망은 그 킬러가 피해자의 팀원에게 **5 s** 안에 죽으면 **트레이드됨**입니다. **KAST**는 킬, 어시스트(섬광 어시스트 포함), 생존, 또는 트레이드된 사망 중 하나가 있는 라운드의 비율입니다. **피해**는 실제로 잃은 체력이며, 적에 대해서만 셉니다. **클러치**는 적이 살아 있는 상태에서 한 진영의 마지막 생존자이며, 그 진영이 이기면 성공입니다. 진영별 **구매**는 프리즈 타임이 끝날 때의 평균 장비 가치에서 정합니다. 정규 전반의 첫 라운드는 피스톨 라운드의 절반입니다(연장전에는 없음). 그다음 $1,500 미만은 에코, $4,000 미만은 포스 구매, 그 이상은 최대 구매입니다.

## 탭 {#the-tab}

매치 탭의 사이드바에는 위에 히트맵의 모드 전환과 세션 선택기가 있고, 그 아래에 매치 섹션이 있습니다. 그다음 히트맵의 **필터**, **레벨**, **카메라** 패널이 있습니다. 보기는 히트맵 탭에 불러온 Parquet의 히트맵입니다.

### 매치 요약 {#match-summaries}

| 조작 | 하는 일 |
|---|---|
| **매치 파일 불러오기...** | `.json` 파일을 고릅니다(여러 개를 한 번에). `.match.json` 요약입니다. |
| 보기에 끌어 놓기 | 매치 탭이 열려 있을 때 보기에 끌어 놓은 JSON 파일은 같은 방식으로 불러옵니다(다른 파일은 무시). |
| **지우기** | 모든 매치를 지웁니다. |
| **모든 매치**(둘 이상일 때) | "N matches, M rounds"로 시작하는 줄. 모든 매치의 통계. |
| 매치 줄 | "TeamA 13 vs TeamB 9", 맵 · N 라운드. 그 매치를 엽니다. |

파일은 `"format": "heat3d-cs2-match"`를 가진 JSON이고, 배열 `rounds`, `players`, `teams`가 있을 때 받아들입니다. 오류는 버튼 아래에 나열합니다. "<file>: not JSON", "<file>: not a CS2 match summary (heat3d-cs2-match)", "<file>: rounds, players or teams missing". 같은 `match` 이름으로 다시 불러온 매치는 이전 것을 대신합니다. 매치는 맵 순서, 그다음 이름 순서로 정렬합니다. 정확히 하나의 매치를 불러오면 그것이 열립니다. 아니면 선택은 그대로 남습니다(기본은 모든 매치).

아무것도 불러오지 않았을 때 이 섹션이 설명합니다. `python -m heat3d_cs2 demos`로 변환하고, 여기에서 `.match.json` 파일을, 히트맵 탭에서 `.parquet` 파일을 불러오세요.

### 매치(매치 하나가 열려 있을 때) {#match-one-match-open}

**머리글:** 두 팀과 점수, 맵, 전반 - "halves 7-5, 6-6": 라운드 1~12와 13~24(프리미어와 경쟁전은 MR12. 요약이 전반 길이를 말하면 그 값을 씀. 그래서 MR15는 1~15와 16~30) - 그다음 매치가 연장전으로 갔으면 연장전만의 점수: "overtime 4-2", 두 전반 뒤의 라운드. 무승부 라운드는 어느 팀에도 세지 않습니다. 그리고 요약이 불완전한 라운드를 나열하면 "N rounds cut off in the demo"(데모에서 잘린 라운드 N개).

**라운드 띠:** 라운드마다 칸 하나. 이긴 진영의 색으로 칠하고, 번호와 끝난 방식의 표시가 있습니다. 무승부 라운드(승자 없음)는 중립 회색 칸에 `=` 표시가 있으며, 어느 진영의 색도 아닙니다. 툴팁은 "Round 30: a draw - neither side won it"라고 말합니다.

| 표시 | 끝낸 것 |
|---|---|
| B | 폭탄 폭발 |
| D | 폭탄 해체 |
| K | 전멸 |
| T | 시간 종료 |
| S | 항복 |
| = | 무승부 |
| ? | 기타 |

구분선은 후반의 시작(라운드 13, 또는 요약의 전반 길이 뒤 라운드)과, 3라운드 연장 전반마다의 시작(라운드 25, 28, 31, …)을 표시합니다. 칸 위에 마우스를 올리면 "Round 7: TeamA (T) - bomb exploded, planted A"가 보입니다("…, planted, site unknown"은 요약에 장소가 없을 때). 그리고 양쪽 진영의 구매와 장비 가치도 보입니다. 클릭하면 라운드가 열리고, 다시 클릭하면 닫힙니다("Click a round for its kills, economy and replay.").

**라운드:**

- "Round 7: <team> won - <how>"("Round 30: a draw - neither side won it"는 무승부일 때), 그리고 라운드가 얼마나 오래 갔는지(프리즈 끝부터 결정까지, m:ss);
- 경제: 각 진영의 팀, 구매(피스톨, 에코, 포스 구매, 최대 구매), 장비 가치("$4,350");
- 설치: 장소, 플레이어, 라운드 안에서의 시간(어느 요약 버전이든). 장소를 모르면 "Planted by <player> at 1:05, site unknown";
- **킬 피드**, 순서대로: 라운드 안의 시간, 공격자(진영 색, 공격자가 없으면 "world"), 무기, 그리고 표시 - **HS** 헤드샷, **WB** 벽을 통해, **SM** 연막을 통해. 라운드의 첫 킬은 **오프닝**, **트레이드**(5 s 안에 팀원의 복수), **트레이드됨**(킬러가 5 s 안에 죽음), **팀킬**(팀원을 죽임. 자살은 아님). 라운드가 결정된 뒤의 킬은 흐리게 표시;
- 클러치: "<player> (T) alone against 3: won the clutch" / "lost it";
- 끝에 살아 있던 사람, 진영별 ("nobody"는 없음);
- **라운드 표시**: 이 라운드의 모든 것을, 히트맵에서;
- **라운드 리플레이**: 라운드를 시작부터 상자로 다시 재생(아래).

이 매치 또는 열린 라운드에 대한 **히트맵에 표시** 버튼([아래](#show-in-the-heatmap)).

### 점수판 {#scoreboard}

팀마다 표 하나, 플레이어마다 줄 하나입니다.

| 열 | 뜻 |
|---|---|
| K, D | 킬, 사망 |
| A | 어시스트. 섬광 어시스트 포함 |
| ± | 킬 빼기 사망(0 초과는 녹색, 미만은 빨강) |
| ADR | 라운드당 피해. 실제로 잃은 체력 |
| KAST | 킬, 어시스트, 생존 또는 트레이드된 사망이 있는 라운드의 % |
| HS | 헤드샷 킬의 % |
| 오프닝 | 이긴-진 오프닝 듀얼 |
| 클러치 | 이긴/플레이한 클러치 |

플레이어에게 마우스를 올리면: 트레이드 킬, 트레이드된 횟수, 섬광 어시스트, 섬광 맞은 적, 유틸리티 피해, 다중 킬 라운드("2×3k")가 보입니다. **플레이어를 클릭하면** 히트맵에서 그 플레이어의 킬과 사망을 보여 줍니다(이 매치).

### 여러 매치에 걸쳐(모든 매치) {#across-matches-all-matches}

불러온 모든 매치에 대해:

- "N matches · M rounds · <maps>", 그리고 무승부가 있었을 때 "N rounds drawn, won by neither side";
- 진영별 **승리 라운드**: 전체, **피스톨** 라운드(요약의 피스톨 라운드)에서, 그리고 **에코**, **포스**, **최대** 구매에서(각각 플레이한 라운드와 함께 백분율. 마우스를 올리면 "won of played"). 무승부 라운드는 양 진영이 플레이하고 어느 쪽도 이기지 않습니다;
- **폭탄**: 장소별 설치, 그리고 T 진영이 그 라운드들을 얼마나 이겼는지("12 plants on A (T won 67%)"), 요약이 장소를 모르는 설치("2 plants on an unknown site (T won 50%)"), 또는 "never planted"; 라운드가 어떻게 끝났는지, 가장 흔한 것부터;
- "The side that took the opening kill won N% of those rounds." (자살은 오프닝 킬이 아님. 무승부 라운드는 오프닝을 전환하지 않음);
- **오프닝 듀얼 위치**: 오프닝 킬이 가장 많은 열 곳(희생자가 있던 곳 기준. 게임의 장소 이름을 읽기 좋게 - "TopofMid" → "Top of Mid"), 듀얼과 T 진영이 이긴 몫;
- **플레이어**: 킬 빼기 사망 기준 상위 15명. 모든 매치를 합산(Steam ID로 짝지음): 매치 수, K-D, ADR과 KAST는 플레이한 라운드로 가중, HS%는 킬로 가중, 오프닝 듀얼. **플레이어를 클릭하면** 히트맵에서 그 플레이어의 모든 매치의 킬과 사망을 보여 줍니다.

모든 불러온 매치에 대한 히트맵에 표시 버튼은 그 아래에 있습니다.

## 히트맵에 표시 {#show-in-the-heatmap}

모든 링크는 히트맵 자체의 **필터**를 설정하므로, 보이는 것이 필터 패널에서 계속 보이고 고칠 수 있습니다. **모두 표시**는 그것들을 지웁니다. 이 기능은 히트맵 탭에 불러온 히트맵 표에서 작동합니다. 매치 탭은 그것을 직접 불러오지 않습니다.

| 버튼 | 표시되는 이벤트 |
|---|---|
| **위치** | `position` - 플레이어가 있던 곳, 초당 여덟 번 |
| **킬** | `kill` - 킬러가 서 있던 곳 |
| **사망** | `death` - 희생자가 쓰러진 곳 |
| **오프닝** | `opening` = 1인 `kill`과 `death` - 각 라운드의 첫 킬, 둘 다 서 있던 곳(표에 `opening` 열이 있을 때만 제공) |
| **연막** | `smoke` - 연막이 떨어진 곳 |
| **섬광** | `flash` - 섬광이 터진 곳 |
| **화염병** | `molotov` - 화염병과 소이탄이 탄 곳 |
| **HE** | `he` - HE 수류탄이 터진 곳 |
| **설치** | `plant` - 폭탄이 설치된 곳 |
| **발사** | `shot` - 발사가 있었던 곳 |

범위는 버튼이 있는 곳에 따라 정해집니다. 불러온 모든 매치, 이 매치, 또는 이 라운드("Show in the heatmap - round 7").

적용할 수 없는 것은 버튼 아래에 말합니다. 조용히 아무것도 없게 거르지 않습니다. "no match column retained - match not applied", "match: X not in the loaded data", 라운드와 이벤트도 같습니다. "player X not in the loaded data", "side X not in the loaded data", "no heatmap data loaded: load the matches' .parquet files in the Heatmap tab". 데이터가 없을 때 링크는 "Load the matches' .parquet files in the Heatmap tab to see them on the map."라고 말합니다.

**라운드 리플레이**는 추가로 히트맵을 **상자 재생**으로 바꾸고, 타임라인을 창을 *생명 주기*로 맞춘 *재생* 모드로 바꾸고, 라운드 세션의 시작으로 이동해서 재생합니다. 라운드가 불러온 데이터의 세션이 아니면: "this round is not a session of the loaded data: nothing to replay".

## 개발자용 {#for-developers}

코드: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### 요약 버전 {#summary-versions}

탭은 버전 1과 버전 2 요약(파일의 `"version"`)을 나란히 읽고, 둘을 같게 다룹니다.

| | 버전 2 | 버전 1 |
|---|---|---|
| 설치 시간 | 킬과 같이, 라운드 안의 초 | 매치의 초. 탭이 라운드 시작을 뺌 |
| 설치 장소 | `A` 또는 `B`. 데모가 말하지 않으면 비어 있음 | `A`, `B`, 또는 개체 번호 - 알 수 없는 장소로 읽음 |
| 전반 길이 | `halfLength`. 진영이 처음 바뀌는 곳에서. null이면 12 | 12 (MR12) |
| 피스톨 라운드 | `pistolRounds`(라운드 1과 전반 뒤 첫 라운드) | 구매가 `pistol`인 라운드 |
| 무승부 라운드 | `winner`와 `winnerTeam`이 비어 있음 | - |
| 자살 | 킬의 `suicide`. 팀킬이 아님 | 공격자와 희생자가 같은 플레이어인 것으로 판단 |

킬의 `noscope`와 `attackerBlind`(버전 2)는 매치 탭에 표시하지 않습니다. 매치 탭은 히트맵 표의 장소도 표시하지 않으므로, 거기서 수류탄 행의 빈 `place`는 여기서 아무것도 바꾸지 않습니다.

포커스가 필터가 되는 방식(`focusFilters`):

- **match** → `match` 열에 대한 범주 필터;
- **round** → 숫자 `round` 열에 대한 범위 필터 `round` = N(범주형 열이면 범주 필터), 그리고 그 라운드의 세션(`<match> #NN`)이 세션 선택기에서 선택됨;
- **events** → `event` 열에 대한 범주 필터;
- **player** → 그 플레이어에 대한 사람 필터;
- **side** → 그룹 필터.
