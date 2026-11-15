---
title: "이동 속도"
parent: "전술 보드"
nav_order: 1
lang: "ko"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# 이동 속도

병사, 탱크, 제트기가 A에서 B까지 가는 데 얼마나 걸릴까요? 이 페이지는 [전술 보드](tactics-board.md)에서 각 피규어가 얼마나 빨리 움직이는지, 그리고 그 숫자들이 어디에서 왔는지를 알려 줍니다. 그래서 계획의 시간을 믿거나 바꿀 수 있습니다.

[전술 보드](tactics-board.md)는 각 피규어가 얼마나 빨리 움직이는지를 바탕으로 계획의 시간을 잽니다. 속도는 `src/tactics/speeds/`의 게임마다 한 파일에서 옵니다. 각 등급(보병, 지상 차량, 배, 항공기, 헬리콥터)의 이동 모드마다 속도가 있고, CS2 무기마다 또는 항공기 종류마다 같은 이름 있는 프로필도 있습니다. 모든 파일은 자기 출처를 나열하며, 모든 값은 **공식**(게임 자체의 데이터, 또는 실제 항공기의 공개된 수치)인지 **근사치**(커뮤니티가 잰 값이나 전형적인 값)인지 밝힙니다.

이것들은 출발점입니다. **모든 피규어는 보드에서 자기 속도를 덮어쓸 수 있습니다**. 그래서 계획은 잰 속도, 짐을 잔뜩 진 병사, 손상된 탱크를 쓸 수 있습니다.

## 모드 {#modes}

| 등급 | 모드 |
|---|---|
| 보병 | 기기(엎드림), 웅크림, 걷기(느리고 조용한 걸음), 달리기(기본 이동), 전력 질주 |
| 지상 차량, 배 | 기기, 조심스럽게, 보통(험지), 돌진(도로 최고 속도) |
| 항공기, 헬리콥터 | 느림(접근, 선회, 제자리 호버 이동), 순항, 전투(코너 속도 또는 공격 비행), 최대 |

게임에 없는 모드는 비워 둡니다. CS2와 Valorant에는 전력 질주와 엎드림이 없습니다.

## 경사 {#slopes}

각 파일은 게임이 경사를 어떻게 다루는지도 말합니다. CS2, Valorant, Squad는 수평 속도에 상한을 두므로, 경사가 플레이어를 느리게 하지 않습니다. Arma는 경사에서 보병을 느리게 하므로, 그 파일과 일반 파일은 Tobler의 도보 함수를 씁니다. Battlefield와 차량 시뮬레이터는 단순한 경사 감속을 씁니다.

## 게임별 {#per-game}

**Counter-Strike 2**(초당 단위; 한 단위를 1인치로 봅니다). **공식.** 달리기 속도는 게임 무기 정의의 `m_flMaxSpeed` 값입니다. 칼과 C4는 250, 수류탄은 245, 권총은 240(데저트 이글 230, R8 180), 기관단총은 220-240, 소총은 210-225, AWP는 200, 경기관총은 195와 150입니다. 조준한 AWP(100), AUG와 SG 553(150), G3SG1과 SCAR-20(120)은 각자의 프로필을 가집니다. 걷기는 달리기 × 0.52, 웅크림은 달리기 × 0.34입니다. Valve는 이 두 배율을 공개하지 않지만, 모든 무기가 데모 기록에 그것을 보여 줍니다. 계획을 실제 이동과 대조하려면, 같은 맵의 데모를 불러와서 플레이어의 속도를 비교하십시오.

**Valorant**(m/s). 칼은 6.75 m/s로 달립니다. 각 무기는 게임 데이터의 달리기 속도 배율을 이것에 곱하고, 그 결과가 게임 안 무기고(Arsenal)가 보여 주는 속도입니다. 대부분의 보조 무기와 기관단총은 5.73, 소총은 5.4, 중화기와 Operator는 5.13, 산탄총은 5.06입니다. 이 달리기 속도는 정확합니다. 걷기와 웅크림 속도는 Riot이 공개하지 않으므로 **추정치**(달리기의 0.55와 0.4)입니다. 조준한 저격 프로필도 추정치입니다.

**Battlefield**(km/h). **근사치.** EA는 이동 수치를 공개하지 않습니다. 보병: 엎드림 약 1 m/s, 웅크림 2, 달리기 4, 전력 질주 6.4. 차량, 제트기, 헬리콥터, 배는 각 등급의 전형적인 게임 안 속도를 받습니다.

**Squad**(km/h). **근사치.** 달리기(3.3 m/s)와 전력 질주(5.9 m/s)는 게임 메커니즘에 관한 커뮤니티 글에서 왔습니다. 기기, 웅크림, 느린 걷기는 추정치이며, 모든 차량 등급과 헬리콥터도 그렇습니다.

**Arma**(km/h). **근사치.** 보병의 걸음은 커뮤니티가 잰 값입니다. 걷기 약 5 km/h, 웅크린 전술 걸음 9 km/h, 조깅 15 km/h, 전력 질주 약 21 km/h입니다. 차량의 최고 속도는 제3자 목록에서 가져온, 바닐라 Arma 3 차량 각 등급의 설정된 최댓값입니다. 더 느린 차량 모드는 추정치입니다.

**DCS / War Thunder / IL-2**(km/h). 팔레트의 모든 항공기와 헬리콥터는 자기 프로필을 가집니다. 순항과 최고 속도는 실제 항공기의 **공개된 수치**이며, 이 시뮬레이터들이 정밀하게 모델링합니다. 최대는 제트기는 해수면에서, 프로펠러기는 정격 고도에서이며, 각 프로필의 주석이 어느 것인지 말합니다. 느린 속도와 전투 속도는 전형적인 값입니다. 지상 차량은 실제 차량의 공개된 도로 속도를 반올림해 씁니다(**근사치**). 배는 자기 등급의 공개된 최고 속도를 씁니다.

**기타**(m/s). **근사치**인 실제 세계의 기본값: 기기 0.5, 웅크림 1.5, 걷기 1.4, 달리기 3.5, 전력 질주 6.

## 출처 {#sources}

Counter-Strike 2
- [CS2 무기 정의(`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB 무기 페이지](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: 이동 메커니즘](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com 무기(달리기 속도 배율)](https://valorant-api.com/v1/weapons)
- [VLR.gg: 칼 속도 6.75 m/s](https://vlr.gg/post/4240306)
- [Riot 지원: 걷기, 달리기, 웅크리기](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA 포럼: Battlefield 6 이동 속도](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 이동 안내](https://deltiasgaming.com/?p=309455)
- [출시 전 보고서의 6.4 m/s 전력 질주](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad 게임 메커니즘 글(2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/)(속도를 공개하지 않음)

Arma
- [Bohemia 포럼: 걷기 속도](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia 포럼: 이동 속도 조정](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 피드백 추적기: 전력 질주 속도](https://feedback.bistudio.com/T64047)
- [Arma 3 필드 매뉴얼: 보병 조작](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [진영별 Arma 3 차량 수치(holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- 각 항공기와 헬리콥터 종류의 위키백과 사양. `air.json`의 각 프로필에서 연결됩니다
- [V 속도](https://en.wikipedia.org/wiki/V_speeds), 전형적인 접근 속도와 전투 속도를 위해
- [War Thunder 위키](https://wiki.warthunder.com/), 지상 차량을 위해
- [아를레이 버크급 구축함](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), 그리고 다른 배 등급들의 공개된 속도

기타
- [선호 걷기 속도](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler의 도보 함수](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
