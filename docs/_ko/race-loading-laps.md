---
title: "랩 불러오기"
parent: "레이스 분석"
nav_order: 51
lang: "ko"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# 랩 불러오기

랩 파일은 한 번의 주행을 기록한 것입니다. 차가 어디에 있었고 드라이버가 무엇을 했는지를 초당 여러 번 적습니다. 같은 코스의 랩을 두 개 이상 불러오면 **레이스 분석** 탭에서 서로 비교할 수 있습니다.

![레이스 분석 탭의 랩 구역에 데모 랩 세 개가 불러와진 모습: 랩 목록, 기준 별표, 초점](../assets/img/en/race-loading-laps-list.webp)

## 처음 불러올 랩 {#your-first-laps}

1. **레이스 분석** 탭을 엽니다.
2. 그냥 둘러보고 싶나요? **데모 랩**을 누릅니다([데모 랩](#demo-laps) 참고).
3. 직접 가진 랩이라면: 기록 장치로 게임에서 기록합니다([파일 형식](#file-formats) 참고). 기록 장치는 랩마다 파일 하나를 씁니다.
4. **랩 파일 불러오기…**를 누르고 같은 코스의 파일을 둘 이상 고릅니다. 또는 **폴더…**를 누르고 그 파일들이 든 폴더를 고릅니다. 파일이나 폴더를 3D 화면에 끌어다 놓아도 됩니다.
5. 랩 목록에서 랩을 클릭하면 그 랩이 어디서 시간을 잃는지 볼 수 있습니다.

**주의: 랩은 한 번에 한 코스씩 비교합니다.** 이름이 다른 코스의 랩을 불러오면 이미 불러온 랩은 지워집니다.

## 버튼 {#the-buttons}

| 컨트롤 | 하는 일 |
|---|---|
| **랩 파일 불러오기…** | `.json`, `.csv`, `.txt`, `.ibt`, `.gz`, `.h3dcars` 파일을 고르는 창입니다. 여러 개를 한 번에 고를 수 있습니다(`.h3dcars`는 차량 파일입니다. [차량](race-replay-and-scene.md#the-cars) 참고) |
| **폴더…** | 폴더를 고르는 창입니다. 그 폴더와 그 아래 있는 모든 랩 파일을 불러옵니다 |
| **데모 랩** | 가상 서킷의 가상 랩 세 개입니다([데모 랩](#demo-laps) 참고) |
| **지우기** | 모든 랩을 지웁니다(랩이 불러와진 뒤에 보입니다) |
| 화면에 끌어다 놓기 | 3D 화면에 끌어다 놓은 파일과 폴더는 같은 방식으로 불러옵니다 |

랩은 이미 불러온 랩에 **추가됩니다**. **다만 이름이 다른 코스의 랩이면 그 전에 불러온 랩을 먼저 지웁니다**(랩은 한 번에 한 코스씩 비교하기 때문입니다). 읽을 수 없는 파일은 버튼 아래에 한 줄씩 나열되며, 나머지 파일은 그래도 불러옵니다.

## 파일 형식 {#file-formats}

형식은 파일 이름이 아니라 내용으로 판단합니다. 쉽게 말하면 다음과 같습니다.

- **heat3d-lap**은 3DHeat 기록 장치가 대부분의 게임에 대해 쓰는 파일입니다.
- **FH Companion**은 Forza Horizon 랩을 기록하는 무료 도구입니다. 랩 파일을 쓰고, 그 옆에 `.json.tele.gz` 파일(같은 랩에 모든 타이어 데이터가 담긴, gzip으로 압축한 파일)도 씁니다. 두 파일을 함께 고르세요.
- **iRacing `.ibt`**는 iRacing 자체의 텔레메트리 파일입니다. 차에서 Alt+L로 기록을 켜고, 파일은 그대로 불러옵니다.
- **랩 CSV**는 순간마다 한 행씩 있는 일반 표입니다.

| 형식 | 일반적인 출처 | 읽는 함수 |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...`(Forza Horizon과 Motorsport의 Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion 랩 `.json` | FH Companion의 랩 보관함 | `fromFhCompanion` |
| FH Companion 텔레메트리 `.json.tele.gz` | 각 FH Companion 랩 파일 옆 | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing 자체의 텔레메트리 파일(차에서 Alt+L로 기록을 켬) | `readIbt` |
| 랩 CSV | `heat3d_capture laps`, Trackmania 플러그인, 또는 `x`, `z`, 시간 열, 선택 사항으로 `lap` 열이 있는 모든 CSV | `fromCsv` |

각 게임을 어떻게 기록하고 무엇을 보내는지는 기록 도구에 문서로 나와 있습니다.
[GameCapture: 게임](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
및 [GameCapture: 랩 형식](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
[다른 레이싱 게임](other-games.md)도 참고하세요.

## 폴더와 코스 {#folders-and-courses}

**폴더…**나 끌어다 놓은 폴더는 그 아래의 모든 파일을 가져옵니다. 폴더 안에서는 `.json`, `.csv`, `.txt`, `.ibt`, `.tele.gz`로 끝나는 파일만 봅니다. 랩이 아닌 `.json`(코스 자체의 파일, 지도 등)은 오류 없이 건너뜁니다.

**한 번에 고른 여러 코스.** FH Companion의 랩 보관함은 코스마다 `<course name> (course_<x>_<z>_to_<x>_<z>)`라는 이름의 폴더에 둡니다(이름이 없는 코스라면 그냥 `course_...`입니다). 고른 파일들이 이런 코스 폴더 둘 이상에 걸쳐 있으면 아무것도 불러오지 않습니다. 대신 **랩** 구역에 "랩이 N개 코스에 속합니다. 랩은 한 번에 한 코스씩 비교합니다. 하나를 고르세요."라고 나오고, 코스마다 랩 수를 보여 줍니다(`.json`, `.csv`, `.ibt`로 끝나는 파일이며, `course.json`은 세지 않음). 랩이 많은 순서입니다. 하나를 클릭하면 그 코스의 파일을 불러옵니다.

코스는 이름과 **시작** 지점으로 구분하며, 끝 지점으로 구분하지 않습니다. 끝까지 가지 못한 주행은 FH Companion이 같은 이름과 시작 지점 아래(`unfinished/` 안에) 두며, 멈춘 곳을 끝으로 씁니다. 이런 주행은 그 코스에 속하며, 목록에서 **일부**로 표시됩니다.

**고른 파일 중 여러 트랙.** 코스 폴더가 아니라 직접 고른 파일 중에 이름이 있는 트랙이 둘 이상이면, 같은 선택지를 트랙마다 제시합니다. 트랙 이름이 없는 랩은 고른 트랙 중 어느 쪽이든 함께 갑니다.

## 차량 이름 {#car-names}

랩은 게임이 주는 차량의 전체 이름으로 부릅니다. 랩 파일에 차 이름이 없다면 다음 순서로 찾습니다.

1. **폴더.** FH Companion의 보관함은 랩을 `<course>/<class>/<car name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json`에 둡니다. 가장 안쪽 폴더 중 `<name> (car<number>)`와 맞는 것이 이름과 번호를 줍니다. `car<number>`와 맞는 것은 번호만 줍니다. 이 경로는 폴더 선택과 끌어다 놓은 폴더에만 있습니다.
2. **같은 차의 다른 랩.** 한 랩이라도 차 이름을 가지면, 같은 게임과 같은 차 번호인 모든 랩이 그 이름으로 불립니다. 함께 불러온 랩과, 이 브라우저에서 나중에 불러온 랩이 대상입니다. 이름은 `heat3d.carNames`라는 키로 `localStorage`에 `<game>:<car number>` 형태로 저장됩니다. 비공개 창에서는 랩이 있는 동안만 유지됩니다.
3. 그 밖에는 번호로 "car 1234", 또는 그냥 "car"입니다.

**라벨.** 랩 목록에서 랩은 차 이름으로 나타납니다. 같은 차의 랩이 여럿이면 "이름 #1", "이름 #2"로 번호를 붙입니다. 분석의 문장도 라벨이 겹치지 않으면 같은 라벨을 씁니다. 겹치면 차 이름과 랩 타임을 함께 씁니다("이름 (1:29.616)", 예시 시간입니다). 그래도 겹치면 번호를 더 붙입니다.

**묶기.** 랩은 차 번호(번호가 없으면 이름)와 성능 지수(`carKey`)가 같으면 같은 차로 묶습니다(포락선, 프로필, 비교에 쓰입니다). 같은 모델이라도 튜닝이 다르면 다른 차입니다.

**클래스.** 랩의 성능 클래스는 게임이 주는 것입니다(Forza D..X, iRacing의 차량 클래스 짧은 이름). 통계는 D, C, B, A, S1, S2, R, X 순서로 정렬하고, 그 밖의 클래스는 알파벳 순서로 뒤에 둡니다.

## 데모 랩 {#demo-laps}

**데모 랩**은 가상 서킷(직선 네 개와 오른쪽 굽이 네 개)의 랩 세 개를 불러옵니다. 이 랩들은 간단한 차량 모델로 만들었습니다([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)). 각 코너의 그립 한계 속도를 구하고, 랩 시뮬레이터처럼 앞으로 가속하는 계산과 뒤로 제동하는 계산을 합니다.

| 랩 | 차 | 실수 |
|---|---|---|
| 깨끗한 랩 | 그립 차 | 없음 |
| 실수가 있는 랩 | 그립 차 | T2에 35 m 일찍 제동, T3 출구에서 스로틀을 30 m 늦게 밟음, T4를 자신의 속도의 0.88로 지남, 한쪽으로 1.2 m 치우쳐 달림 |
| 다른 차 | 출력 차 | 없음. 반대쪽으로 1.2 m 치우쳐 달림 |

| 차(번호) | 그립 | 제동 | 견인력 | 출력/질량 | 항력 |
|---|---|---|---|---|---|
| 그립 차(9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| 출력 차(9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

실수가 있는 랩에 초점이 맞춰집니다. 서킷은 Forza가 세계를 두는 방식(왼손 좌표계)대로 배치되어 있습니다. 그래서 실제 Forza 랩과 똑같이 거울상으로 나오며, 탭은 **X 반전**을 제안합니다. 세 랩 모두 바퀴별 데이터를 가지고 있어서 탭의 모든 부분에 보여 줄 것이 있습니다.

## 랩 목록 {#the-lap-list}

각 행은 왼쪽에서 오른쪽으로 다음과 같습니다.

| 요소 | 하는 일 |
|---|---|
| ● / ○ | 랩을 보이거나 숨김(선, 차, 카드, 차트). 숨긴 랩도 여전히 분석합니다 |
| 색 선 | 랩의 색 |
| 이름과 태그 | 클릭하면 랩에 **초점**을 맞춥니다. 마우스를 올리면 원본 파일과 차를 보여 줍니다(이름 · 클래스 PI · 구동 방식) |
| ⌖ | 이 차를 카메라로 따라갑니다(다시 클릭하면 멈춤) |
| ★ | 모든 것을 이 랩과 비교합니다(기준으로 만듦). 기준인 랩에서는 꺼져 있습니다 |
| × | 랩을 지웁니다 |

**태그:** *기준*. 클래스가 여럿이면, 클래스마다 가장 빠른 랩에 *X의 최고*(또는 *그 클래스의 최고*)가 붙습니다. 결승선까지 가지 못한 주행에는 *일부*가 붙습니다.

**두 번째 줄:** 클래스(클래스가 여럿일 때만), 랩 타임(`1:29.616`), 비교 대상 랩과의 차이(그 클래스의 최고 또는 기준)를 `+0.512`처럼(예시) 보여 줍니다. 랩이 기준의 출발보다 10 m 넘게 늦게 시작하면 *늦게 출발*이 나옵니다.

랩이 8개를 넘으면 "M개 중 N개 그림"이라는 줄이 나오며, **모두 표시**(모든 랩을 그립니다. 느리고 엉켜 보입니다)와 **보고 있는 랩만**(기준, 초점 랩, 그 클래스의 최고 랩)을 선택할 수 있습니다. 통계는 어느 쪽이든 모든 랩을 셉니다.

목록 아래에는, 랩이 그림이 거울상이라고 말하면 거울상 힌트가 나옵니다([거울상 세계](race-replay-and-scene.md#mirrored-worlds) 참고). 랩이 둘 이상이면 "랩을 클릭하면 어디서 시간을 잃는지 볼 수 있습니다 …"라는 힌트가 나오고, 클래스가 여럿이면 각 랩을 자신의 클래스에서 가장 빠른 랩과 비교한다는 힌트도 나옵니다.

### 기준과 초점 {#reference-and-focus}

- **기준:** 다른 모든 랩이 정렬되는 기준이며, 기본적으로 비교 대상이 됩니다. ★로 다른 것을 고르지 않는 한, 가장 빠른 **완주** 랩입니다(완주한 랩이 없으면 처음 불러온 랩). 기준 랩을 지우면 자동 선택으로 돌아갑니다.
- **초점:** 판정, 차량 제어, 지도가 보여 주는 랩입니다. 사용자가 둔 곳에 머무르며, 그렇지 않으면 기준이 아닌 **가장 느린** 랩입니다("배울 것이 가장 많은" 랩). 랩에 초점을 맞추면 그 랩과 그 클래스의 최고 랩도 함께 보입니다. 기준에 초점을 맞추면, 각 코너를 가장 빨리 지난 다른 랩과 비교합니다.
- **클래스:** 성능 클래스가 여럿인 랩이 있으면, 각 랩을 자신의 클래스에서 가장 빠른 완주 랩과 비교합니다(기준의 클래스에서는 기준). [코스 통계](race-course-statistics.md)를 참고하세요.

### 색 {#colours}

모든 랩은 불러온 순서의 위치에 따라 자기 색을 받습니다. 그래서 다른 랩을 숨겨도 랩은 색을 유지합니다. 색상은 히트맵의 팀 모드가 그룹을 배치하는 것처럼 색상환에 고르게 놓습니다. 각 자리마다 명도(OKLCH에서 0.52~0.66)와 채도(0.12~0.18)를 정합니다. 이 값은 일반 시각, 적색약, 녹색약에서 이웃 자리(마지막은 첫 자리와)와 가장 멀리 떨어지도록 고릅니다. 세 가지 모두에서 어두운 차트 바탕에 대해 최소 3:1 대비를 가집니다.

## 개발자용 정보 {#for-developers}

코드: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts)(`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### 각 형식을 읽는 방법 {#how-each-format-is-read}

모든 형식은 결국 하나의 `LapTrace`가 됩니다. 채널은 표준 이름(`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., [채널 표](race-charts-and-hud.md#the-channel-table) 참고)으로 되어 있고, 차, 랩 타임, 완주 여부, 그리고 `meta` 블록을 가집니다. 모든 형식에서 `time`과 `distance`는 0부터 시작하도록 옮깁니다. 출처에 `speed`가 없으면 이웃 샘플에서 거리를 시간으로 나눠 계산합니다.

#### heat3d-lap JSON {#heat3d-lap-json}

`"format": "heat3d-lap"`을 가진 JSON 객체입니다. 읽는 필드는 다음과 같습니다.

| 필드 | 쓰임 |
|---|---|
| `channels` | 채널마다 하나씩, 표준 이름으로 된 배열들의 객체입니다. 바퀴별 채널은 `name.FL`, `name.FR`, `name.RL`, `name.RR` 형태입니다. `time`, `x`, `z`는 필수입니다 |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | 차입니다. id, 이름, Forza 클래스 번호(0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), 성능 지수, 구동 방식 코드(0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | 랩 타임입니다. 없으면 마지막 `time` 값을 씁니다 |
| `lap.complete` | `false`면 일부 주행으로 표시합니다. 그 밖의 값이면 완주입니다 |
| `game`, `track` | 이름입니다. `game`이 분야를 정합니다(아래 참고) |
| `units.slipRatio` / `units.slipAngle` | 슬립의 크기 조정 방식입니다. `raw`가 들어간 단위는 `scaled`, `normalised`는 `peak`, 그 밖은 `physical`입니다 |
| `meta` | `slip`, `surface`, `discipline`을 주면 위의 값을 덮어씁니다 |

`distance` 채널이 없으면 거리는 3D 위치를 더해서 구합니다.

#### FH Companion 랩 파일 {#fh-companion-lap-files}

`samples` 배열(약 5 m마다 샘플 하나)을 담은 `Lap` 객체를 가진 JSON 객체입니다. 매핑되는 필드는 다음과 같습니다.

| FH Companion | 채널 |
|---|---|
| `Metres`, `Seconds` | `distance`, `time`(랩이 0에서 시작하도록 옮김) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | 같은 이름, 소문자 |
| `LatG`, `LongG` | `latAcc`, `longAcc`(m/s², 이름과 달리) |
| `Puddle` | `puddle` |

차는 `Lap.carOrdinal`, `Lap.carName`(새 파일에만 있음), `Class`(또는 `Lap.carClass`를 Forza 클래스 번호로), `Lap.performanceIndex`, `Lap.drivetrain`, `Lap.peakKilowatts`에서 얻습니다. 시간은 `Lap.lapSeconds`에서 얻습니다. `EndedAtFinish: false`인 주행은 일부입니다. 게임은 `forza-horizon`입니다.

이 파일에는 타이어 데이터와 방향이 없으므로, 잠김, 휠스핀, 미끄러짐은 이 파일만으로는 판단할 수 없습니다. 밀림(조향과 경로의 차이로 봄), 충돌과 사고는 여전히 판단할 수 있습니다. 나머지를 위해 각 파일 옆의 `.tele.gz`도 함께 고르세요.

#### FH Companion 텔레메트리(`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

gzip으로 압축한 JSON `{ version, columns, data }`입니다. 한 랩의 Forza Data Out 전체를, 패킷마다 한 행으로, 게임 자체의 필드 이름으로 담고 있습니다. 열은 위치가 아니라 이름으로 찾습니다. 형식 2는 모든 패킷을 보관합니다(게임의 64 틱에 비해 초당 약 110개). 기록 장치 자체의 시계(`t`, `metres`)를 뺀 모든 값이 바로 앞 행과 같으면 그 행은 버립니다. 그래서 랩은 게임의 초당 64행으로 읽힙니다. (불러오기 버튼의 툴팁도 이렇게 말합니다. "모든 타이어의 슬립을 64 Hz로."라고.)

| Data Out 필드 | 채널 |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel`(차체 기준: x 오른쪽, y 위, z 앞) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`. 0..255에서 0..1로 조정 |
| `Steer` | `steer`. -127..127에서 -1..1로 조정 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`. 화씨에서 °C로 변환 |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | 바퀴마다 `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` |

`<Wheel>`은 `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`입니다. 슬립은 `peak`로 표시합니다(Forza의 정규화된 슬립으로, 1을 넘으면 타이어가 그립을 잃은 것입니다).

**짝짓기.** `<lap>.json`인 랩 파일과 `<lap>.json.tele.gz`(같은 경로이고 `.tele.gz`만 다름)를 함께 고르거나 끌어다 놓으면 **하나의** 랩이 됩니다. 텔레메트리의 채널에 랩 파일의 차, 클래스, 시간, 트랙, 일부 여부를 붙입니다. 텔레메트리 파일에 차 이름이 있으면 그 이름이 우선합니다. `.tele.gz`만 있어도 불러올 수 있습니다. 형식 2 파일에는 `car`(`ordinal`, `name`, `class`, `pi`), `track`, `lapSeconds`가 들어 있습니다. 이것이 없으면 랩 타임은 텔레메트리 자체의 길이가 되고, 차는 알 수 없음이 됩니다.

#### iRacing `.ibt` {#iracing-ibt}

iRacing의 텔레메트리 파일은 직접 읽습니다(브라우저에서, 변환 없이). 112바이트 헤더, 32바이트 디스크 하위 헤더, 변수 표(채널당 144바이트), 그리고 세션 YAML을 읽습니다.

- **필수 채널:** `SessionTime`, `Lap`, `Lat`, `Lon`. 이것이 없으면 "… 에는 SessionTime, Lap, Lat, Lon 채널이 없습니다 - iRacing 텔레메트리 파일이 맞나요?"라고 나옵니다.
- **위치:** 위도와 경도는 첫 번째 0이 아닌 위치 고정점에서 접하는 평면 위에 미터 단위로 놓습니다(지구 반지름 6 371 008.8 m). x는 동쪽, z는 남쪽, y는 고도(`Alt`)입니다. 그래서 기본 카메라 방향이 북쪽이면 북이 화면 위쪽입니다. 트랙 자체의 좌표계는 아닙니다. 추출한 코스 모델과는 정렬되지 않기 때문입니다.
- **랩:** `Lap`이 바뀌는 곳에서 세션을 나눕니다. 샘플이 60개를 넘고, `LapDistPct`의 5% 미만에서 시작해 95%를 넘어 끝난 랩만 남깁니다. 일부 랩은 버립니다. 남은 랩이 없으면 "… 에는 N km 트랙(트랙 길이는 YAML에서)의 완주 랩이 없습니다" 또는 "… 에는 완주 랩이 없습니다"라고 나옵니다.
- **거리:** 랩 시작부터의 `LapDist`이며, 없으면 위치에서 더해서 구합니다.
- **차:** `DriverInfo`에서 얻습니다. 플레이어의 `CarScreenName`, `CarID`(차 번호로), `CarClassShortName`(클래스로). 트랙은 `TrackDisplayName`이며, 없으면 `TrackName`입니다.

매핑되는 채널은 다음과 같습니다.

| iRacing | 채널 | 변환 |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | 같은 이름 | - |
| `Clutch` | `clutch` | `1 - v`(iRacing은 맞물림을 셈. 우리 값은 페달) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax`(라디안, 반시계 방향. -1..1, 오른쪽이 양수. 최대값은 최소 0.1, 없으면 π) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | 같음, 소문자 | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | 1.5를 넘으면 100으로 나눔 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | 카커스 가운데 온도 |
| `LFshockDefl` ... | `suspensionM.FL` ... | 댐퍼 변위, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0.145038(kPa에서 psi로) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

바퀴 접두사: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR입니다. 샘플마다 값이 하나인 **그 밖의 모든** 채널(비트 필드 형식이 아닌 것)은 자기 이름 그대로 넘어갑니다. 바퀴 접두사로 시작하면 바퀴별로 넘어갑니다(`RRspeed`는 `speed.RR`이 됩니다). 그래서 그래프와 카드의 값 목록이 이 모두를 보여 줍니다. iRacing은 타이어 슬립을 기록하지 않습니다. 그래서 차량 제어는 드리프트각으로 판단합니다. 진행 방향에 맞춘 `Yaw`가 차가 가는 곳과 얼마나 다른지, 그리고 경로에 대한 조향입니다. 요 레이트와 횡가속도는 방향을 맞출 수 없을 때만 씁니다. 그러면 드리프트각은 없습니다([차량 제어 이벤트](race-control-events.md) 참고).

오류: "… 은(는) .ibt 파일로 보기에 너무 짧습니다", "… 에는 iRacing 텔레메트리 헤더가 없습니다", "… 에는 위치 고정점이 없습니다".

#### 랩 CSV {#lap-csv}

샘플마다 한 행입니다. 한 파일에 랩이 많으면 `lap` 열로 구분합니다. 구분자는 처음 다섯 줄에서 찾습니다. 선택 사항인 첫 줄 `# { ...json... }`은 주행을 설명합니다. `game`, `track`, `seconds`, `complete`, `meta`, `car`입니다.

| 열(대소문자 무시) | 채널 |
|---|---|
| `x`, `y`, `z` | 위치(`x`와 `z`는 필수) |
| `elapsed` 또는 `time` | `time`(랩마다 필수) |
| `metres` 또는 `distance` | `distance`(없으면 위치에서 더함) |
| `speed_ms` 또는 `speed` | `speed`(m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | 같음 |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| 표준 채널 이름 아무거나, 예: `latVel`, `slipIndex.FL` | 그 자체 |
| `lap` | 행이 속한 랩 |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | 랩 타임, 차 번호, 클래스, PI, 트랙(각 랩의 첫 행에서) |

설명이 없으면 게임은 `forza-horizon`으로 보고, 모든 랩을 완주로 봅니다. 한 파일에 여러 랩이 있으면 랩의 출처를 `<file> · <lap>`으로 표시합니다. 오류: "… 에 행이 없습니다", "… 에 x와 z 열이 없습니다", "… 에 시간 열이 있는 랩이 없습니다".

#### 분야와 노면 {#discipline-and-surface}

랩이 말하지 않을 때 분석이 랩에 대해 가정하는 것입니다(`lap.ts`).

- **분야:** `meta.discipline`이 있으면 그것이고, 없으면 `rally|wrc|dirt|rbr`에 맞는 게임 이름이면 **랠리**, `trackmania`이면 **아케이드**, 그 밖이면 **서킷**입니다.
- **노면:** `meta.surface`가 있으면 그것이고, 없으면 트랙 이름과 출처로 정합니다. `monte`라는 랠리는 **혼합**입니다. `snow|ice|winter|arctic|sweden`은 **눈**입니다. 타르맥 랠리(Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, 또는 tarmac/asphalt라는 단어)는 **타르맥**입니다. `scramble|trail|cross country|dirt|gravel`이 들어간 이름은 **흐트러진 노면**입니다. 그 밖의 랠리 구간은 차가 어떻게 달렸는지로 판단합니다. 12 m/s보다 빠르고 노면 위에 있는 샘플(적어도 200개)에 대해, 횡가속도의 95백분위수가 10 m/s² 이상이고, 중앙 드리프트각이 6° 미만이면(그 값의 70% 이상으로 차가 코너를 돈 곳에서, 적어도 30개 샘플) 타르맥입니다. 그 밖이거나 판단할 자료가 부족하면 흐트러진 노면입니다. 랠리가 아닌 이름에 `rally`가 들어 있으면 흐트러진 노면이고, 나머지는 모두 타르맥입니다.
- 샘플마다, `loose` 채널(Forza의 노면 진동, Trackmania의 재질. [차량 제어 이벤트](race-control-events.md#the-ground) 참고)이 랩의 노면을 덮어씁니다.
