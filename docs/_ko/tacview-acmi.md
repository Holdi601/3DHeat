---
title: "Tacview 기록 (ACMI)"
parent: "데이터 가져오기"
nav_order: 7
lang: "ko"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
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
