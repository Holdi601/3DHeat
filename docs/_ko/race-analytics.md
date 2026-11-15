---
title: "레이스 분석: 방법"
parent: "레이스 분석"
nav_order: 58
lang: "ko"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# 레이스 분석: 방법

요약하면:

- 랩은 **거리 기준**으로 비교합니다. 시간 기준이 아니므로 같은 코스의 같은 지점이 서로 맞춰집니다.
- 각 코너는 **한 덩어리로** 판단합니다. 한 제동 구간부터 다음 제동 구간까지입니다.
- 잃은 시간은 **나눠서** 어디서 잃었는지(제동, 진입, 탈출, 직선)와 차량이 그중 얼마를 설명하는지로 나타냅니다.
- 원인은 **말로 설명하고**, 조언을 덧붙입니다.
- 사용법을 보려면 이 페이지가 아니라 [레이스 분석](race-analysis.md)을 보세요.

이 페이지는 **레이스 분석** 탭의 바탕이 되는 방법을 설명합니다. 무엇을 측정하는지, 시간이 어디서 사라졌는지 어떻게 판단하는지, 그리고 그것을 어떻게 조언으로 바꾸는지를 다룹니다. 여기 적힌 규칙은 분석 코드(`src/race/`)가 따르는 명세이므로, 규칙마다 코드 쪽 대응 부분과 이를 검증하는 테스트가 있습니다.

## 전문 도구들이 하는 일 {#what-the-professional-tools-do}

기존 도구들은 같은 핵심을 공유하며, 주로 *원인*에 얼마나 가까이 가는지에서 차이가 납니다.

- **모든 것을 시간이 아니라 거리로 비교합니다.** 두 랩을 하나의 거리 축에 맞춰 다시 샘플링합니다. 같은 거리에서 경과 시간의 차이가 누적된 값이 *델타*입니다(MoTeC은 시간 편차라고 부르고, 다른 도구는 시간 차이나 델타 트레이스라고 부릅니다). 델타의 기울기는 지금 어디서 시간을 잃고 있는지를 알려 줍니다. 기울기가 완만하면 가속, 항력 또는 지속적인 그립의 차이이고, 기울기가 가파르면 제동이나 스로틀의 차이입니다. 위아래로 출렁이는 파형은 진입 속도와 탈출 속도 사이의 맞바꿈을 뜻합니다.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [구간 시간 분석](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **모든 코너는 단계로 나뉩니다**: 제동, 진입, 중간, 탈출입니다. 제동 지점, 최대 제동과 제동 해제, 최저 속도와 그 위치, 기어, 스로틀을 다시 밟는 지점, 전개 스로틀로 복귀, 탈출 속도를 봅니다.
  ([Driver61: 여섯 단계](https://driver61.com/uni/corner-phases/),
  [iRacing 랩 분석 안내](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **코너마다 미니 섹터를 나누고**, 각 섹터에서 가장 빠른 구간을 이어 붙여 **이론상 최속 랩**을 만듭니다.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **주행 라인도 비교하지만**, 라인만 따로 보지는 않습니다. "이미지 위의 라인은 기여 요인을 알기 전까지 아무 의미가 없다"는 것이 원칙이며, 속도 그래프와 델타와 함께 읽습니다.
  ([Track Titan: 텔레메트리 분석 방법](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: 레이싱 라인](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **증상이 아니라 근본 원인을 봅니다.** 직선에서 잃은 시간이 정말 스로틀 때문인가, 아니면 잘못된 진입 때문에 스로틀을 늦게 밟은 것인가? 실수는 랩 타임 손실의 크기대로 순위를 매기고, 쉬운 말로 설명합니다.
  ([Track Titan 코칭 흐름](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### 첫 버전이 잘못한 점과 그것이 중요한 이유 {#what-went-wrong-in-the-first-version-and-why-it-matters}

첫 버전은 *단계마다* 따로 손실을 매기고, 손실만 보았습니다. 더 일찍 제동한 랩은 제동 단계에서 시간을 잃었고, 그래서 더 늦게 제동하라는 조언을 받았습니다. 그 이른 제동 덕분에 차가 더 빨리 코너를 돌고, 더 빨리 가속하고, 코너를 더 빠르게 빠져나와 직선에서 그 시간을 모두 되찾는 경우에도 말입니다. 한 시험에서는 이 방식이 "훨씬 늦게 제동하라"고 조언한 랩은, 실제로 더 늦게 제동한 다른 랩이 apex를 놓치고 바깥으로 밀려 얻었던 시간을 그대로 잃었는데도 그랬습니다. 시간 데이터는 두 주행이 비슷하다고 말했지만, 조언은 정반대로 말했습니다.

해결책은 위의 모든 출처가 동의하는 규칙입니다. **코너는 한 덩어리로 판단합니다.** 그 코너의 제동 구간에서 다음 코너의 제동 구간까지입니다. 이유는 "코너에서 몇 밀리초를 내주면 그 뒤의 구간을 더 빠르게 달릴 수 있어서 전체 랩 타임이 좋아질 수 있기" 때문입니다
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## 규칙에 담긴 레이싱 지식 {#racing-knowledge-the-rules-encode}

**탈출 속도는 진입 속도보다 중요하며**, 뒤따르는 직선이 길수록 더 중요합니다. "직선에서 쓰는 시간이 코너에서 쓰는 시간을 지배한다"는 말처럼, 탈출에서의 속도 부족은 다음 제동 지점까지 이어집니다. 코너와 직선을 가장 빠르게 지나가는 길은 흔히 코너를 조금 천천히 돌아 스로틀을 더 일찍 밟는 것입니다. 바로 *천천히 들어가서 빠르게 나오기*입니다.
([Race & Track Driving: 랩 타임 개선 순서](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: 코너의 우선순위](https://driver61.com/uni/prioritising-corners/))
탈출 속도에도 보상을 주는 최소 시간 계획기는 apex를 더 늦게 옮기고 *더 빠른* 랩을 얻습니다. 이 둘을 균형 있게 맞추는 보상은, 길이 `L`인 직선을 속도 `v`로 달릴 때 탈출 속도 단위당 `L / v²`입니다. 즉 속도 차이가 직선에서 치르는 시간은 직선이 길수록 커지고, 속도의 제곱에 반비례해 줄어듭니다
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**코너는 그 뒤에 무엇이 오는지로 나뉩니다.** 직선으로 이어지는 코너는 탈출 속도를 최대로 하고, apex를 늦게 잡고, 가능한 한 빨리 다시 가속합니다. 직선 끝에 있는 코너는 그 직선에서 가져오는 속도를 최대로 하고, 제동을 최대한 늦게 하며, apex를 더 일찍 잡아도 괜찮습니다. 코너 사이에 있는 코너는 그 뒤에 중요한 쪽을 위해 타협합니다. 어느 쪽으로도 볼 수 있는 코너는 직선으로 이어지는 코너로 취급합니다. 빠른 코너일수록 비중이 큽니다. 속도가 높으면 차는 가속이 약하고, 한번 잃은 km/h는 되찾기 어렵기 때문입니다.
([Allen Berg: 세 가지 코너 유형](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: 코너의 우선순위](https://driver61.com/uni/prioritising-corners/),
[Driver61: 다른 코너, 다른 기술](https://driver61.com/uni/different-corner-technique/))

**마찰 원.** 타이어에는 그립의 예산이 하나 있고, 이것을 제동, 코너링, 가속에 어떤 비율로든 나눠 씁니다. 전체 가속도는 `sqrt(lat² + long²)`입니다. 트레일 브레이킹은 이 원의 가장자리를 따라갑니다. 조향과 횡하중이 커질 때 제동을 풉니다.
([마찰 원](https://www.yourdatadriven.com/friction-circle-introduction/),
[g-g 다이어그램](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**코스팅**, 즉 두 페달 모두 밟지 않은 상태는 속도를 잃는 가장 느린 방법이며, 그 자체로 측정하는 핵심 성능 지표입니다.
([Racecar Engineering / OptimumG: 코스트 팩터](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**슬립.** 종방향 힘은 슬립 비율이 약 10~20%일 때 최대가 되고, 그 뒤로는 줄어듭니다. 그 이상이 되면 제동에서는 바퀴가 잠기고, 구동에서는 바퀴가 헛돕니다. Forza는 슬립을 정규화해서 보고합니다. 0은 그립이 충분한 상태이고, 크기가 1을 넘으면 그립을 잃은 상태입니다.
([종방향 슬립](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**언더스티어와 오버스티어.** 앞 슬립각이 뒤 슬립각보다 크면 언더스티어이고, 뒤가 앞보다 크면 오버스티어입니다. 슬립각이 없을 때는, 차가 조향이 요구하는 만큼 돌지 않는 상태로 봅니다(저속에서 차가 필요로 하는 Ackermann 각 `L/R`보다 큰 조향).
([언더스티어 개요](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## 라인의 기하학 {#the-geometry-of-a-line}

반지름 `R`의 곡선에서 차가 유지할 수 있는 속도는 `v = sqrt(a R)`입니다. 여기서 `a`는 타이어가 내는 횡가속도이며, 그 위에 다운포스가 더하는 값(`v²`에 따라 커짐)이 더해집니다. 그래서 **속도는 반지름의 제곱근에 비례해 커집니다**. 반지름이 20% 큰 곡선을 가운데로 지나면 그 지점은 약 10% 빨라집니다.
([최대 코너링 속도](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: 코너링](https://www.formula1-dictionary.net/cornering_tech.html))

**기하학적 라인**은 코너를 지나는 가장 큰 호입니다. 바깥쪽 가장자리에서 출발해, 안쪽에서 apex에 닿고, 다시 바깥쪽으로 돌아옵니다. 폭이 `w`인 도로에서 `θ`만큼 꺾이는 코너라면(차의 폭을 뺀 값), 두 바깥 가장자리에 접하고 안쪽 모서리에 닿는 호의 반지름은 `R = w / (1 - cos(θ/2))`입니다(안쪽 가장자리 자체의 반지름을 더함). 직각 코너에서는 약 `3.4 w`, 헤어핀에서는 `w`입니다. 그래서 폭을 쓰는 일은 중간 코너에서 가장 중요하고, 헤어핀에서 가장 덜 중요합니다.
([레이싱 라인](https://en.wikipedia.org/wiki/Racing_line))

**늦은 apex**는 더 늦게, 더 깊이 꺾어 들어가고, 처음에는 더 작은 반지름으로 돌다가 나오면서 반지름을 넓힙니다. 중간에서는 느리지만, 직선으로 더 일찍 나가고 더 일찍 평평한 길을 탑니다. "최저 속도는 조금 낮지만 탈출에서 가속 곡선이 더 강하다"는 것입니다. **이른 apex**는 반대입니다. 진입은 더 빠르지만, 나오면서 반지름이 좁아지고 스로틀을 붙잡아 둡니다. 그래서 대체로 실수입니다. 다만 그립이 아주 낮아서, 들어갈 때 잃은 속도를 나오면서 되찾을 수 없는 경우는 예외입니다.
([레이싱 라인](https://en.wikipedia.org/wiki/Racing_line),
[레이싱 텔레메트리 용어](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[레이싱 라인의 수학 part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V"와 "U".** U는 고전적인 둥근 라인입니다. 반지름이 가장 넓고, 조향 변화가 가장 적습니다. V는 더 일찍 꺾어 들어가 더 깊이 파고들고, 중간에서 차를 빠르게 돌리며, 더 곧게 나가도록 탈출 쪽을 맞춥니다. 제동은 직선으로 유지되어(그래서 더 늦출 수 있음), 최저 속도는 낮지만 더 늦게 도달하고, 전개 스로틀은 훨씬 일찍 들어옵니다.
([Track Titan: V 라인](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**곡률과 거리.** 가장 빠른 라인은 가장 짧은 길과 곡률이 가장 작은 길 사이의 타협입니다. 서킷의 폭에서는 곡률이 더 중요해지며, 최소 곡률 라인은 차가 한계에 있는 곳이라면 어디서든 최소 시간 라인에 가까워집니다. 차가 가속할 수 있는 곳에서는 그 라인과 갈라집니다.
([전역 최소 시간 궤적 계획](https://www.nature.com/articles/s41598-025-21211-2),
[TUM 전역 레이스 궤적 최적화](https://github.com/TUMFTM/global_racetrajectory_optimization))

**연속된 굽이**, 즉 더블 apex와 셰케인은 하나의 문제입니다. 한 코너의 탈출 라인이 다음 코너의 진입 라인이 되며, 직선으로 이어지는 코너에서부터 거꾸로 주행합니다.
([Driver61: 다른 코너, 다른 기술](https://driver61.com/uni/different-corner-technique/))

## 어떤 차에 어떤 라인이 맞는가 {#which-line-suits-which-car}

이를 결정하는 것은 그 코너의 속도에서 차의 **출력 대 그립**입니다. "모멘텀은 그립 대 출력의 비율 문제다."
([Ross Bentley: 모멘텀 차량](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum over horsepower](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| 이 코너에서의 차 | 라인 | 이유 |
|---|---|---|
| 그립에 비해 가속이 강함("point and shoot") | V: 곧고 늦게 제동하고, 짧고 조이는 중간에서 돌고, 일찍 곧고 평평하게 | 시간은 최저 속도가 아니라 전개 스로틀에서 얻는다 |
| 그립에 비해 가속이 약함("모멘텀") | 넓은 U, 살짝 늦은 apex, 최저 속도를 높게 유지 | 긁어 낸 속도는 되찾을 수 없다 |
| 그 중간 | 천천히 들어가 빠르게 나오기: 늦은 apex의 U | 전형적인 타협 |
| 빠른 코너, 다운포스가 있으면 더 그러함 | U, 기하학적 라인에 가깝게 | 고속에서는 가속이 약하다. 다운포스 그립은 `v²`에 따라 커지므로, 중간을 빠르게 지나면 이득이 두 배가 된다 |
| 그립이 매우 낮음(젖은 노면, 눈) | 더 이른 apex | 들어가며 잃은 속도는 나와서 되찾을 수 없다 |
| 출력이 그립보다 훨씬 큼 | 라인은 덜 중요함 | 탈출을 제한하는 것은 라인이 아니라 견인력이다 |

"코너가 빠를수록 기하학적 라인에 가깝고, 느릴수록 늦은 apex로 라인을 더 많이 바꾼다."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[레이싱 라인의 수학 part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: V 라인](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: 그립](https://driver61.com/uni/grip/))

구동 방식은 라인 자체보다 라인을 주행하는 방법을 더 많이 바꿉니다. 앞바퀴굴림 차는 제동 중에 차를 돌리고(트레일 브레이킹), 바퀴가 풀리기 시작해야 출력을 줍니다. 그렇지 않으면 바깥으로 밀립니다. 출력이 강한 뒷바퀴굴림 차는 전개 스로틀을 밟기 전에 차가 곧게 서 있어야 하고, 그렇지 않으면 뒤가 미끄러집니다. 사륜구동은 돌면서도 출력을 줄 수 있으므로 스로틀을 더 일찍 밟습니다.
([FWD 기술](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD 코너링](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

뷰어는 각 코너에서 차의 출력 대 그립 비율을 그 차가 직접 주행한 데이터로 측정합니다. 탈출 속도에서 전개 가속도를 최저 속도에서의 횡 그립으로 나눈 값입니다. 0.45 이상이면 "point and shoot", 0.25 이하이면 "모멘텀"이라고 부릅니다. 150~250 km/h에서의 그립이 55~110 km/h에서의 그립보다 15% 넘게 크면 다운포스가 작용하고 있는 것으로 봅니다.

## 방법 {#the-method}

아래 숫자들은 판단의 근거입니다. 코드가 쓰는 임계값은 각 페이지에 하나씩 정리되어 있으며, 여기 숫자가 다르면 그 페이지가 기준입니다: [코너별 분석](race-corner-analysis.md), [차량 제어 이벤트](race-control-events.md), [차량 프로필과 비교](race-car-profiles.md), [코스 통계](race-course-statistics.md).

### 1. 하나의 거리 축 {#one-distance-axis}

사용자가 다른 것을 고르지 않으면 가장 빠른 랩이 기준입니다. 그 랩이 달린 경로가 축이 됩니다. 다른 모든 랩의 샘플은 이 축 위에 투영되며, 각 샘플은 기준을 따라 잰 거리 `s`와 부호가 있는 옆 방향 오프셋 `d`를 얻습니다. 투영은 이전 매칭 지점에서부터 앞쪽으로만 찾으므로, 자기 자신을 가로지르는 랩이 다리 반대편으로 잘못 넘어가지 않습니다. 그다음 모든 채널을 2 m 간격의 한 격자에 다시 샘플링합니다. 각 랩은 마지막 몇 미터를 그 속도 그대로 이어서 달린 것으로 처리하므로, 출발선에서의 델타가 곧 랩 타임 차이가 됩니다.

### 2. 코너와 각 코너가 랩에서 차지하는 몫 {#corners-and-each-corners-share-of-the-lap}

코너, 구간, 복합 코너를 찾는 방법: [코너별 분석](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. 코너의 시간 계산 {#the-time-account-of-a-corner}

순손실, 단계별 분해, 탈출 속도와 차들의 견인력: [코너별 분석](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. 판정과 원인 {#the-verdict-and-the-cause}

판정 패턴과 진입 및 탈출에서의 원인: [코너별 분석](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. 차량 대 드라이버 {#the-car-against-the-driver}

랩이 서로 다른 차량으로 달린 경우, 차량이 설명하는 손실을 부분별로 걷어 냅니다.

- **견인력**: 위에서 설명한 것처럼 같은 속도에서 직선으로 가는 차량의 차이입니다.
- **그립**: 더 좁은 반지름으로 설명되지 않는 낮은 최저 속도 중에서, `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`로 계산한 몫입니다. 이는 랩이 그 차의 한계(그 속도에서 보여 준 값의 90%)에 있었을 때만 적용합니다.
- **제동**: `u`에서 `v`까지 감속도 `a1`로 줄이는 것을 `a2`와 비교하면, 같은 지점에서 끝날 때 `(1/a1 - 1/a2)(u - v)² / 2u`만큼 비용이 듭니다. 이는 랩이 구간 평균으로 차가 낼 수 있는 만큼 세게 제동했을 때만 적용하며, 순간적인 최고치만으로는 적용하지 않습니다.

차가 할 수 있는 일은 그 차의 불러온 모든 랩에서 얻습니다. 5 m/s 속도 구간마다 횡 그립, 제동, 전 스로틀 가속을 구하며(각각 95, 95, 90 백분위수) 사용합니다. 그립은 샘플 하나가 닿은 값이 아니라 차가 **0.5초 동안 버틴** 값이어야 합니다. 즉 0.5초 평균 횡가속도입니다. 연석, 미끄러짐 후 되돌아오기, 다른 차를 따라잡는 순간 등은 잠깐 값을 튀게 하는데, 이런 일이 잦은 차는 실제보다 그립이 좋아 보입니다. (서로 다른 두 차의 기록 랩으로 확인했습니다. 샘플 단위로 재면 두 차가 서로 가깝게 나왔고, 0.5초 동안 버틴 값으로 재면 랩 타임과 같은 방향으로 갈렸습니다.) 제동과 견인력은 각 샘플을 자신과 이웃 샘플의 중앙값으로 취합니다. 공기 저항, 착지 후 안정화, 그리고 차가 회복될 때까지의 모든 충돌(6절)은 제외합니다.

**각 차량이 어떤 차인지**(`profile.ts`). 같은 랩들에서 다음을 구합니다.

- **보유 그립**: 그 0.5초 횡가속도의 95백분위수입니다.
- **견인력**: 전 스로틀에서 50 km/h까지, 50~120, 120~200, 200 km/h 이상 구간별로 보여 준 값과 최댓값입니다.
- **제동**: 60에서 160 km/h까지입니다.
- **최고 속도**: 직선에서 전 스로틀을 1초 동안 밟았는데도 더 빨라지지 않게 된 지점입니다. 이는 직선을 곧게 달린 경우에만 봅니다. 긴 커브를 평평하게 지나는 것은 권력과 무관하게 차가 속도를 잃는 곳이므로 쓰지 않습니다. 충분히 긴 직선이 없었다면, 가장 빠른 지점에서도 아직 견인력이 남아 있던 값으로 실제 최고 속도와 얼마나 떨어져 있는지 말합니다. 랩에 나타난 것 이상으로 추측하지는 않습니다. 출력과 속도의 관계를 공기 저항에 맞춰 적합시켰더니 일반 도로 차의 최고 속도가 실제보다 100 km/h 높게 나온 적이 있습니다. 기어비와 리미터가 차의 견인력을 공기 저항보다 훨씬 먼저 끝내기 때문입니다.
- **뒤가 풀림**: 한 랩에서 뒤가 10° 넘게 미끄러진 횟수입니다(부드러운 노면에서는 20°). 이때 핸들은 코너 반대 방향으로 돌아가 있어야 합니다(반대 조향으로 잡은 경우). 이 중 스로틀을 밟은 상태에서 시작한 횟수와, 그 시작 시점에서 그립의 몇 %를 쓰고 있었는지도 셉니다. 일부러 조금 옆으로 미끄러지게 달리는 것은 아무것도 잃는 것이 아니며, 잡아야 하는 미끄러짐만 잃는 것입니다. 모든 차에 같은 방식으로 세므로 두 차를 비교할 수 있습니다.
- **밸런스**: 랩에 슬립각이 있으면, 한계에서 앞과 뒤를 비교합니다.

**비교한 차량**은 차들을 나란히 놓습니다. 표로 보여 주고, 각 차가 다른 차에 비해 어떤지를 한 문장씩 적습니다("X는 가속이 더 좋지만, 더 세게 돌 수 없고, 멈추는 데 더 오래 걸리며, 뒤가 더 쉽게 풀린다"). 또 분명한 차이도 보여 줍니다(그립 4%, 견인력이나 제동 5%, 최고 속도 4 km/h, 뒤가 한 랩에 최소 한 번 더 잡히고 그 빈도가 절반 넘게 많은 경우). 그리고 각 차를 어떻게 몰아야 하는지 알려 줍니다. 차가 한 대뿐이면 그 차가 어떤 차인지 말합니다.

**모든 코너에서**, 랩이 서로 다른 차로 달린 경우 판정은 그중에서 차가 결정하는 부분이 무엇인지 말하고, 이 차로 최대한 활용하는 방법을 알려 줍니다.

- **중간 통과**: 상대 차의 라인에서 이 차의 그립이 허용하는 속도는 `v_other · √(grip_mine / grip_other)`입니다. 랩이 그 속도를 유지했다면 차이는 차에서 오는 것이며, 어떤 제동 지점을 바꿔도 이를 바꾸지 못합니다. 이것을 말하고, 그 코너의 손실은 드라이버가 아니라 차 탓으로 돌립니다. 그보다 적게 유지했다면 나머지는 얻을 수 있는 것이며, 얼마나 얻을 수 있는지 말합니다. 그다음에 시간을 대신 어디서 얻을 수 있는지 말합니다. 직선으로 이어지거나, 더 강하게 끄는 차라면 apex 이후입니다. 곧게 제동하고, 더 늦게 진입하고, 탈출 방향으로 일찍 차를 맞춥니다. 그렇지 않다면 도로가 허용하는 가장 넓은 반지름입니다. 더 많은 그립 없이 더 빨라질 수 있는 유일한 방법이 더 큰 반지름이기 때문입니다.
- **여기서 뒤가 풀림**: 이 차가 다른 차보다 쉽게 뒤가 풀리는 경우입니다. 이 차에서 어떻게 해야 하는지 말합니다. 미끄러짐이 어떻게 시작되는지에 따라, 핸들이 풀리면서 스로틀을 조금씩 더하거나, 코너 중간에 들지 않고 제동을 부드럽게 푸는 것입니다.
- **그 뒤의 직선**: 같은 속도에서 상대 차가 더 강하게 끌어 준 만큼이 무엇이었는지, 그리고 이 차가 그 직선에서 견인력이 어디서 바닥났는지를 말합니다.

- **앞선 제동 지점**: 덜 세게 제동하는 차의 경우입니다.

타르맥 위에서 코너 중간을 미끄러지며 지나간 랩(드리프트 10° 초과)은 그립이 모자란 것이 아니라 그립을 넘어선 것입니다. 그러므로 그 지점에 그립이 남았다고는 절대 말하지 않습니다. 또 이 랩에서 코너가 요구한 것보다 적은 횡가속도에서 차의 뒤가 풀렸다면, "남는 그립"이라는 말로 작은 단계씩 찾아보라고 말합니다.

### 6. 차량 제어: 잠김, 휠스핀, 미끄러짐과 밀림, 충돌과 사고 {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

모든 랩은 차를 어떻게 다뤘는지도 읽습니다. 바퀴가 어디서 잠겼는지, 구동 바퀴가 어디서 헛돌았는지, 뒤가 어디서 풀렸는지, 앞이 어디서 바깥으로 밀렸는지를 봅니다. 이런 실수는 시간만으로는 이름을 붙일 수 없기 때문입니다. 세 가지 원칙으로 여러 게임과 노면에서도 맞도록 합니다.

**그립이 끝나는 지점은 차 자신의 주행으로 측정합니다.** 엔지니어들은 차마다 가장 큰 감속을 낸 슬립에서 잠김 임계값을 정합니다(OptimumG 제동 시리즈의 MoTeC 채널은 한 차에 -0.07을 씁니다). 교과서 값에 의존하지 않는데, 교과서 값들도 서로 맞지 않기 때문입니다. 타이어와 모델에 따라 타르맥에서는 힘이 슬립 5~20%에서 최대가 되고, 눈에서는 출처에 따라 6%이거나 20~60%이며, 자갈에 대한 값은 어느 출처에도 없습니다. 게임마다 슬립의 크기도 다르게 잽니다. Forza의 슬립은 "정규화"되어 있어서 1을 넘으면 그립을 잃은 것이지만, 차의 브레이크는 1보다 훨씬 낮거나 높은 곳에서 가장 잘 작동할 수 있고, 평범한 제동 구간은 1을 넘기도 합니다. 그래서 차마다 불러온 모든 랩에 걸쳐, 차가 낸 힘을 그 차가 가진 슬립에 따라 구간별로 나눕니다. 직선 제동에서는 감속도를 바퀴 슬립 비율에 대해, 가속은 (그 속도에서 차가 내는 값에 대한 비율로) 구동 바퀴 슬립에 대해, 코너링 그립(그 속도에서 차의 그립에 대한 비율)은 각 축의 슬립각에 대해 나눕니다. 한계는 힘이 최고치에서 8% 떨어진 지점의 슬립입니다. 데이터에서 한 번도 떨어지지 않는 곡선(Forza Horizon의 코너링과 트랙션)에는 한계가 없으며, 그곳에서는 슬립만으로는 아무것도 표시하지 않습니다. 데이터가 너무 적으면 한계는 공칭 최대치의 1.5배로 둡니다.

**노면은 게임이 알려 주는 경우 샘플마다 압니다.** Forza는 자갈, 흙, 잔디에서 타이어가 진동하게 하고(타르맥 서킷에서는 샘플이 적고, 흙과 오프로드 코스에서는 많습니다), Trackmania는 각 바퀴 아래 재질의 이름을 알려 줍니다. 랠리 구간의 노면은 11절에서 설명하는 방식으로 찾습니다. 커브, 드리프트 습관, 임계값은 타르맥과 흐트러진 노면을 따로 둡니다.

**모든 이벤트는 같은 거리에서 다른 랩과 대조합니다.** 자갈, 눈, 드리프트가 많은 아케이드 레이싱에서는 미끄러짐이 곧 코너를 달리는 방식입니다. 최적 제어 연구는 타르맥에서 "저드리프트" 해법을, 오프로드에서 "공격적이고 드리프트가 크며, 심지어 반대 조향도 쓰는" 해법을 찾습니다. 랠리 데이터는 타이어가 "비선형 영역 안쪽 깊숙이" 있다고 보여 주고, 아주 헐거운 노면에서는 바퀴를 잠그면 차를 더 빨리 멈추게 하기도 합니다. 그래서 다른 랩도 만든 이벤트(그 80% 이상)는 실수가 아니라 코너를 달리는 방식입니다. 다른 랩이 만들지 않은 이벤트는, 그 직전부터 이벤트 후 40 m까지 잃은 시간이 있을 때만 잘못입니다. 코너 손실의 40% 이상을 설명하는 잘못은 그 코너의 원인이 됩니다.

검출 임계값, 다른 랩과의 대조 테스트, 충돌과 사고, 조언 문구: [차량 제어 이벤트](race-control-events.md).

### 6b. 많은 랩: 코스의 통계 {#b-many-laps-the-courses-statistics}

클래스 비교, 무엇을 실수로 세는지, 통계와 실수 맵: [코스 통계](race-course-statistics.md).

### 7. 주행 라인 {#the-driven-line}

각 랩과 코너마다, 위치만으로 계산합니다. 회전을 시작한 지점(가장 조인 곡률의 5분의 1 지점), 가장 조인 반지름(±8 m 범위), 진행 방향 변화의 전반과 후반에서의 평균 반지름 등입니다.

- **모양**: 가장 조인 반지름을 평균 반지름으로 나눈 값이 0.55 미만이면 V, 0.75 초과이면 U입니다.
- **apex**: 탈출 반지름을 진입 반지름으로 나눈 값이 1.25 초과이면 늦은 apex, 0.8 미만이면 이른 apex입니다.
- **속도 apex**: 가장 느린 지점이 회전 중간 지점보다 15 m 넘게 앞이면 천천히 들어가서 빠르게 나오기입니다. 15 m 넘게 뒤이면 중간을 지난 뒤에도 여전히 감속하고 있는 것입니다.

다른 랩과 비교해서는, 회전을 시작할 때와 가장 조인 부분과 둘 다 평평했던 곳에서 얼마나 안쪽이나 바깥쪽으로 달렸는지, 그리고 각자 어디서 꺾어 들어갔는지를 봅니다. 각 판정은 그 랩의 차와 그 코너에서 어울리는 라인을 말하며 끝납니다. 이는 코너 다음에 무엇이 오는지, 그리고 차의 측정된 출력 대 그립, 다운포스, 구동 방식에 따라 정합니다. 또 그 랩이 그렇게 달렸는지도 말합니다. "코너별" 표는 각 코너를 통과한 가장 빠른 랩과 그 라인의 모양을 보여 주며, 가장 좋은 코너들을 모아서 보여 줍니다.

### 8. 두 개의 맵 {#two-maps}

- **어디서**: 코스를 기준 대비 `dΔt/ds`로 색칠합니다. 시간을 잃는 곳은 빨간색, 얻는 곳은 초록색입니다.
- **왜**: 각 손실을 원인이 있는 곳에 그립니다. 색은 원인의 그룹(제동, 진입, 탈출, 직선, 차량)에 따르고, 비싼 손실일수록 더 넓게 그립니다.

### 9. 리플레이 {#replay}

하나의 시계로 각 랩의 시간을 세 가지 방식으로 보여 줍니다. 주행 라인에서 보기, 정렬해서 보기(모든 랩이 트랙의 한 지점에 같은 순간에 닿도록 맞춘 뒤 놓아줌), 나란히 보기(모든 랩을 기준의 거리에 붙잡아 둠)입니다.

### 10. 세계가 어느 방향인지 {#which-way-round-the-world-is}

뷰어의 세계는 오른손 좌표계이고 Y가 위쪽입니다. 왼손 좌표계를 쓰는 게임(Forza도 그중 하나)은 뷰어에서 거울상으로 나옵니다. 오른쪽으로 꺾이는 모든 커브가 왼쪽 커브로 그려지며, 코스와 랩 모두 그렇습니다. 랩 데이터가 이를 스스로 알려 줍니다. 양의 조향은 모든 어댑터에서 오른쪽이고, 커브의 바깥쪽 서스펜션은 압축되기 때문입니다. 그래서 레이스 탭이 이를 고칠 것을 제안하고, **Camera & scene → Invert world axis**가 이를 수행합니다. X, Y 또는 Z를 거꾸로 그립니다. 바뀌는 것은 그림뿐입니다. 시점 행렬에 반사를 접어 넣으며, 카메라는 그려진 세계 안을 날고, 데이터와 분석과 도구가 보여 주는 모든 좌표는 게임 원래의 값으로 남습니다. 분석은 같은 측정으로 커브가 왼쪽인지 오른쪽인지를 말합니다.

### 11. 랠리: 미끄러짐, 왼발, 공중 {#rally-the-slide-the-left-foot-the-air}

랠리 구간은 나쁜 그립으로 달리는 서킷이 아닙니다. 자갈과 눈에서는 미끄러짐이 곧 코너를 도는 방식입니다. 차는 들어가면서 무게 중심을 옮겨 돌립니다. "제동은 차의 무게를 앞으로 옮긴다... 앞 타이어는 그립이 늘고, 뒤 타이어는 그립을 잃으며, 차는 미끄러지면서 코너로 회전한다." 그리고 "원하는 방향으로 줄 맞춰졌을 때" 다시 스로틀로 돌아갑니다([DirtFish: 브레이크 사용법](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). 왼발은 스로틀과 브레이크를 서로 맞대어 쓸 수 있도록 제동을 맡고, 핸드브레이크는 좁은 코너에서 차를 돌립니다([RallySport Ontario: 랠리 주행 기초](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)). 그리고 차는 땅에서 떨어집니다. 6절은 이미 미끄러짐을 다른 랩과 대조해서 읽습니다. 이 규칙들은 나머지를 담당합니다.

- **노면.** 랩이 말하는 것(`meta.surface`, 랠리 기록 장치의 `--surface`)을 쓰고, 없으면 이벤트 이름을 씁니다. 타르맥 랠리(스페인, 크로아티아, 중앙 유럽, 독일, 일본, 코르시카, Ypres), 겨울 랠리(눈), 몬테카를로의 타르맥에 눈과 얼음이 덮인 구간(혼합)이 여기에 해당합니다. 그것도 없으면 차를 어떻게 몰았는지로 정합니다. Rally2 차의 횡 한계는 자갈에서 0.7~0.9 g, 타르맥에서 1.3~1.4 g입니다([grenzbereich, 기준값](https://github.com/GitCrush/grenzbereich)). 자갈에서는 드리프트가 훨씬 많습니다(6절). 그래서 차가 노면에서 속도 중 95백분위수 기준 10 m/s² 이상을 냈고, 그 값의 70% 안에서 코너를 돈 모든 곳의 중앙 드리프트가 6도 미만인 구간은 타르맥입니다. 그 밖의 것, 또는 판단하기에 자료가 부족한 것은 흐트러진 노면입니다.
- **차가 할 수 있는 일은 그 노면에서 본 값입니다.** 그립, 제동, 견인력(5절)은, 랩들이 각 노면에서 샘플의 5분의 1 이상을 달린 경우, 타르맥과 흐트러진 노면을 따로 측정합니다. 각 코너는 가장 느린 지점에서 차 아래에 있던 노면으로 판단합니다. 공중에 있던 샘플과 착지 후 0.3초 동안의 샘플은 차를 재는 모든 것에서 뺍니다. 엔벨로프, 타이어 곡선, 잠김과 휠스핀이 여기에 해당합니다. 착지는 차를 타이어가 할 수 있는 한계를 넘어 흔들며, 공중에서 헛돈 바퀴는 휠스핀이 아니기 때문입니다. 흐트러진 노면에서는 다운포스를 판단하지 않습니다. 구간의 빠른 부분과 느린 부분이 서로 다른 길이기 때문입니다.
- **왼발을 살짝 대는 것은 제동이 아닙니다.** 스로틀이 아직 절반 이상 밟혀 있는 상태에서 15 m 미만에 걸쳐 브레이크를 살짝 대면, 차를 안정시키거나 돌리는 것입니다. 랩이 코너를 위해 제동을 시작한 지점은, 스로틀이 떨어진 첫 번째 제동이거나 그보다 더 오래 이어진 제동입니다.
- **들어가면서 돌린 차.** 각 랩과 코너마다, 제동 시작부터 가장 느린 지점에서 5 m 뒤까지 가장 큰 드리프트각을 봅니다. 흐트러진 노면에서, 다른 랩보다 8도 이상 덜 돌린(다른 랩이 12도 이상 돌렸다면) 랩이 나중에 출력을 주었다면, **차를 덜 돌린 것**입니다. 이때 조언은 회전이 시작될 때 뒤가 돌아오도록 왼발 브레이크를 들거나 살짝 대라는 것입니다. 다른 랩이 핸드브레이크를 썼다면 그 지점을 따르고, 54 km/h보다 느린 코너에서는 핸드브레이크를 씁니다. 그리고 apex 전에 출구 방향을 맞춰 두라고 말합니다. 다른 랩보다 12도 이상 더 돌렸는데도 출력을 늦게 준 랩은 **너무 많이 돌린 것**입니다. 출력을 줄이기 전에 차를 펴야 했습니다. 두 경우 모두 차량 제어 실수 뒤에 오는, 코너를 빠져나올 때의 원인입니다. 흐트러진 노면에서 라인에 대한 조언은 모든 코너에 대해 같은 것을 말합니다.
- **공중.** 다른 랩보다 0.2초 이상 더 오래 공중에 떠 있었고, 이륙 10 m 전부터 착지 후 40 m(또는 코너의 끝)까지 시간을 잃었다면, 그 비행이 코너 손실의 40% 이상을 설명할 때 원인입니다. 그 뒤의 코너에 더 느리게 도달했다면 그것도 그렇게 말합니다. 공중에서는 차를 돌리거나, 제동하거나, 구동할 수 없습니다. 조언은 이륙 때 스로틀을 계속 밟고 있으라는 것입니다. 이륙 때 스로틀에서 발을 떼면 코가 내려가기 때문입니다("이륙 중에 스로틀에서 발을 떼지 마라"). 또 정상을 조금 천천히 넘거나 브레이크를 살짝 대서, 차가 낮게 유지되도록 하라고 말합니다([DirtFish: 랠리카로 점프하는 법](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **최대 세 개의 굽이로 된 복합 코너.** 한 번도 평평해지지 않고 꾸불꾸불 달린 구간은 하나의 긴 복합 코너가 아닙니다. 세 개의 굽이를 넘으면 새 복합 코너가 시작됩니다.

`src/race/rally.test.ts`는 간단한 모델로 달린 구간에서 이 분석이 위의 모든 내용을 지키는지 검증합니다. 차를 덜 돌리고 늦게 출력을 주는 경우, 더 긴 비행, 왼발로 살짝 대는 동작, 꾸불꾸불한 구간, 타르맥과 자갈의 차이를 다룹니다.

## 데이터와 각 출처가 허용하는 것 {#data-and-what-each-source-allows}

| 출처 | 주파수 | 채널 | 가능한 분석 |
|---|---|---|---|
| FH Companion 랩 파일 | 약 5 m | 위치, 속도, 스로틀, 브레이크, 조향, 횡/종 가속도, 기어 | 차량 제어를 제외한 전부입니다. 차량 제어에는 옆에 있는 텔레메트리가 필요합니다 |
| FH Companion의 `.tele.gz`(각 랩 파일 옆) | 게임의 64 Hz(모든 패킷을 저장하는 기록 장치는 초당 약 110개를 쓰며, 반복 값은 버립니다) | Forza Data Out 전체: 바퀴별 슬립 비율, 슬립각, 복합 슬립, 회전, 서스펜션, 노면 진동, 차체 기준 속도, 요 레이트 | 차량 제어를 포함해 전부 |
| `heat3d_capture telemetry`로 기록한 Forza Data Out | 60 Hz | 위의 모든 것, 바퀴별로 타이어 온도, 슬립 비율, 슬립각, 복합 슬립, 서스펜션 이동, 바퀴 속도, 럼블 스트립도 포함. RPM, 출력, 토크, 요 레이트 | 전부 |
| Assetto Corsa, ACC, AC EVO, AC Rally(공유 메모리, `heat3d_capture telemetry --game ...`) | 60~333 Hz | 상위 집합입니다. 타이어 코어와 안쪽/가운데/바깥쪽 온도, 압력, 브레이크 온도, 바퀴 하중, 캠버, 슬립 비율과 각도, 차체 기준 속도, ABS와 TC 작동 여부(ACC, EVO, AC Rally) | 전부 |
| iRacing `.ibt`, 직접 읽음 | 60 Hz | GPS 위치, 페달, 조향, g, 요, 바퀴별 카커스 온도, 댐퍼 변위, 압력, 마모 | 전부. 차량 제어는 드리프트각(요와 진행 방향의 차이)과 조향으로 판단하며, 슬립은 없음(기록되지 않음) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4(UDP) | 프레임마다, 100 Hz | 위치, 세계 속도와 차의 축, 바퀴별 접지면 속도와 서스펜션, 페달, 조향, 구간 시계와 길이 | 전부. 슬립과 드리프트각은 계산으로 구함 |
| Richard Burns Rally(NGP UDP) | 물리 단계마다 | 위치, 차의 자체 속도, 바퀴별 스프링 변위와 힘, 페달 | 바퀴 슬립을 제외한 전부 |
| BeamNG.drive(`heat3d` 프로토콜 모드) | 최대 100 Hz | 위치, 세계 속도와 축, 바퀴별 노면 속도, 회전, 하중과 지면 접촉 | 전부. 슬립과 드리프트각은 계산으로 구함 |
| Trackmania(Openplanet 플러그인) | 프레임마다 | 위치, 앞과 옆 속도, 페달(브레이크 켜짐/꺼짐), 조향, 바퀴별 슬립 계수와 헐거운 노면, 공중 여부 | 전부. 옆 속도로 드리프트각을 구함 |

모든 출처는 하나의 랩 형식 `heat3d-lap`으로 바뀌며, 이 형식의 채널은 표준 이름(`speed`, `throttle`, `tireTemp[FL]` ...)을 씁니다. 차 아이콘과 차트는 랩이 가진 채널을 무엇이든 그립니다.

## 출처 {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [구간 속도 높이기: 시간 편차 모양](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer(거리 영역 델타)](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing 랩 분석 안내](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: 세션 랩](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: 레이싱 라인 분석](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: 섹터에서 얻은 이론상 최속 랩](https://overcut.gg/)
- [Track Titan: 텔레메트리 분석 방법](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: 제동 분석, 잠김과 안정성 KPI(2019년 9월)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: 스로틀 위에서(2020년 1월)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: 레이스 드라이버의 핵심 성능 지표(arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [타이어-노면 마찰 모델과 최적 슬립(PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: 타이어-포장 마찰, 눈과 얼음에서 최대치의 슬립](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: 타이어 마찰 계수, 최대와 미끄러짐](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: 종방향 힘](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: 횡방향 힘](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [차량 안정성, 차체 슬립 한계(arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [높은 사이드슬립에서의 랠리 주행(Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [최소 시간 랠리 기동(Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC 기준 요 레이트(arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [요에 대해 조향해서 언더스티어와 오버스티어를 검출(US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: 조향각, Ackermann과 언더스티어 기울기](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: 수학 채널(Kus, 복합 g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: 오버스티어와 언더스티어 위젯](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [케이던스 브레이킹: 아주 헐거운 노면에서의 잠김](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: 자갈 랠리 데이터 기록](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: 브레이크 사용법](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: 랠리카로 점프하는 법](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: 랠리 주행 기초](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: 랠리 차량 동역학, 기준값](https://github.com/GitCrush/grenzbereich)
- [Trackmania 속도 드리프트 트레이너 플러그인(상수)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania 스피드슬라이드 해설](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: 코칭 흐름](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: V 라인](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [인공 레이스 드라이버의 주행 스타일 편향(탈출 속도 대 최소 시간)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: 랩 타임 개선 순서](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: 세 가지 코너 유형](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: 코너의 우선순위](https://driver61.com/uni/prioritising-corners/)
- [Driver61: 다른 코너, 다른 기술](https://driver61.com/uni/different-corner-technique/)
- [Driver61: 코너의 여섯 단계](https://driver61.com/uni/corner-phases/)
- [Driver61: 그립](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster(발췌)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: 모멘텀 차량이란](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [모멘텀 대 마력 논쟁](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [레이싱 라인의 수학, part 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, part 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD 기술](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD 코너링](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [레이싱 라인](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: 코너링 기술](https://www.formula1-dictionary.net/cornering_tech.html)
- [최대 코너링 속도](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [레이싱 텔레메트리 용어](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [곡률과 거리를 고려한 전역 최소 시간 궤적 계획](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: 전역 레이스 궤적 최적화](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: 코스트 팩터](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [마찰 원 소개](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: g-g 다이어그램](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [종방향 슬립](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [언더스티어 개요](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out 문서](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: 견인 한계 가속](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: 출력 한계 가속](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO 공유 메모리](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally 텔레메트리 리더](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT 파싱](https://github.com/teamjorge/ibt)
