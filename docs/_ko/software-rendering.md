---
title: "소프트웨어 렌더링 감지"
parent: "렌더링 내부 구조"
nav_order: 6
lang: "ko"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# 소프트웨어 렌더링 감지

브라우저가 그래픽 카드가 아니라 메인 프로세서로 그리면, 뷰어는 몇 배 느려집니다. 뷰어는 이를 알아채고, 무엇을 켜야 하는지 알려 주는 빨간 상자를 보여 줍니다.

브라우저가 하드웨어 가속을 꺼 두었거나, 드라이버가 차단 목록에 있으면, WebGL과 WebGPU를 CPU에서 그립니다. 모든 것이 여전히 작동하지만 몇 배 느립니다. 그러면 "내 데이터로는 이 뷰어를 쓸 수 없을 만큼 느리다"는 증상이 나타나는데, 이는 브라우저의 설정이 아니라 도구를 가리키는 증상입니다. 그래서 뷰어는 렌더러의 이름을 보고 이를 알려 줍니다 ([`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)).

## 배너 {#the-banner}

렌더러가 소프트웨어로 분명히 확인되면, 사이드바 위쪽(히트맵과 매치 탭)의 모드 막대 위에 빨간 상자가 나타납니다.

![빨간 배너: 그래픽 카드 없이 실행 중](../assets/img/en/software-rendering-banner.webp)

> **그래픽 카드 없이 실행 중입니다.**
> 이 브라우저는 그래픽 카드 대신 CPU로 그리고 있습니다. 몇 배 느리고 큰 데이터셋은 처리할 수 없습니다. 브라우저 설정에서 하드웨어 가속을 켜고 (Chrome: 설정 → 시스템 → "가능하면 그래픽 가속 사용", 그다음 다시 시작), 그래픽 드라이버가 최신인지 확인하세요.

## 개발자용 {#for-developers}

### 판단 방법 {#how-it-decides}

렌더러 문자열 (WebGL2의 `UNMASKED_RENDERER_WEBGL`, 또는 WebGPU 어댑터의 벤더, 아키텍처, 장치)을 소문자로 바꾸고 분류합니다.

- `swiftshader`, `llvmpipe`, `softpipe`, `swrast`, `microsoft basic render driver`, `apple software renderer`, `generic renderer`를 포함하면 **software** (소프트웨어);
- 알려진 GPU 벤더나 계열 (`nvidia`, `geforce`, `rtx`, `quadro`, `amd`, `radeon`, `intel`, `arc`, `apple m`, `adreno`, `mali`, `powervr`, `xclipse`)을 포함하면 **hardware** (하드웨어);
- 그 밖에는 **unknown** (알 수 없음).

*software*만 배너를 띄웁니다. 알 수 없는 어댑터에 대해서는 아무 말도 하지 않습니다. 정상적인 GPU를 가진 사람에게 브라우저 설정을 다시 하라고 하는 것은, 한 경우를 놓치는 것보다 더 나쁜 실패이기 때문입니다.

### 짧은 이름 {#the-short-name}

같은 모듈은 표시용으로 렌더러 문자열을 줄입니다. `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` 같은 ANGLE 문자열에서 장치 항목을 남기고, PCI id와 뒤의 API 및 셰이더 모델은 뺀 다음 `Vendor Model`을 보여 줍니다. 짧은 이름은 **Resource budgets**에 나타나며, 전체 문자열은 툴팁으로 보입니다. 메모리 추정은 전체 문자열을 보여 줍니다.
