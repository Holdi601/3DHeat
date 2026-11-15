---
title: "두 가지 백엔드"
parent: "렌더링 내부 구조"
nav_order: 1
lang: "ko"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# 두 가지 백엔드

브라우저는 페이지가 그래픽 카드를 쓰는 방법을 두 가지 중에서 고르게 할 수 있습니다. WebGPU (최신)와 WebGL2입니다. 뷰어는 둘 다 쓸 수 있고 가장 좋은 것을 스스로 고르므로, 보통은 아무것도 할 필요가 없습니다. 지금 어느 것을 쓰고 있는지는 통계 오버레이(화면 오른쪽 위)의 **Backend**에서 볼 수 있습니다.

![통계 오버레이: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

뷰어에는 하나의 인터페이스 뒤에 완전한 렌더러가 두 개 있습니다 ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu))와 **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2))입니다. 둘 다 같은 알고리즘으로 같은 그림을 그립니다. 셰이더도 WGSL과 GLSL ES 3.00으로 나란히 있습니다. 통계 오버레이의 첫 줄 **Backend**가 실행 중인 것을 알려 주고, 마우스를 올리면 WebGPU를 쓰지 않은 이유가 나옵니다(쓰지 않은 경우).

## 개발자용 {#for-developers}

### 선택 방법 {#how-one-is-chosen}

캔버스는 한 종류의 컨텍스트만 가질 수 있으므로, 그리기 전에 한 번만 선택합니다 ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. WebGL2를 강제하지 않았다면: `navigator.gpu`가 있으면 `powerPreference: 'high-performance'`로 어댑터와 디바이스를 요청하고 WebGPU 렌더러를 만듭니다. 실패하면 그 이유를 기억합니다.
2. WebGPU를 강제했는데 실패했다면 멈춥니다. 뷰에는 *Cannot initialise the renderer.*와 이유가 나옵니다.
3. 그 밖의 경우에는 WebGL2 렌더러를 만듭니다 (이것도 고성능 어댑터를 요청합니다). WebGL2를 쓸 수 없거나 실수 텍스처에 그릴 수 없으면 (`EXT_color_buffer_float`), 뷰에 오류가 나옵니다.

`powerPreference: 'high-performance'`가 있어서 그래픽을 전환할 수 있는 노트북이 페이지에 내장 GPU를 주지 않습니다. 그 밖에는 페이지가 관여할 수 없습니다. 하드웨어 가속은 브라우저 설정입니다.

### URL 옵션 {#url-switches}

페이지 주소 뒤에 붙입니다. 예: `http://127.0.0.1:5273/?backend=webgl2`.

| 매개변수 | 효과 |
|---|---|
| `?backend=webgpu` | WebGPU를 쓰거나 실패합니다. |
| `?backend=webgl2` | WebGPU를 쓸 수 있어도 WebGL2를 씁니다. "이게 잘못 그려진다"와 "WebGPU에서만 잘못 그려진다"를 구분하게 해 줍니다. |
| `?heat=f16` | 두 백엔드 모두에서 16비트 히트 누적 경로를 강제합니다 ([반정밀도 부동소수점 누적](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: 프레임 중에 GL 오류를 읽고 `renderer.heatDebug`에 보여 줍니다. `getError`는 파이프라인 동기화 지점이므로 기본은 꺼져 있습니다. |
| `?occdebug=<n>` | WebGL2 개발자용 도구: 히트를 가림 디버그 값으로 바꿉니다. 일반 사용용이 아닙니다. |

### 중요한 차이 {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| 행 저장 | 스토리지 버퍼: 행 번호는 배열 첨자입니다. 어댑터가 제공하는 가장 큰 스토리지 버퍼 바인딩과 버퍼 크기를 요청합니다. | 정수 텍스처 (폭 8,192 텍셀), 프레임마다 있는 블록 인덱스 텍스처를 거쳐 `gl_VertexID`로 접근합니다. |
| 32비트 히트 누적 | 어댑터가 `float32-blendable`과 `float32-filterable`을 모두 제공할 때 | `EXT_float_blend`가 있을 때 |
| 그 밖의 경우 | 16비트 (`r16float`) | 16비트 (`R16F`) |
| 깊이 범위 | [0, 1]; 엔진이 three.js의 [-1, 1] 행렬을 다시 맞추는 변환을 미리 곱합니다. 이것이 없으면 깊이가 선형인 평행 투영은 거의 모두 0 아래로 떨어져 조용히 잘립니다. | [-1, 1], 그대로 씁니다 |
| 유니폼 | 256바이트 정렬 슬롯의 링버퍼에서, 그리기 호출마다 하나씩 오프셋으로 바인딩합니다. `queue.writeBuffer`는 큐에서 순서대로 실행되므로, 버퍼 하나를 그리기마다 다시 쓰면 모든 그리기가 마지막 값을 읽게 됩니다. 히트 패스의 유니폼 블록은 정확히 256바이트 슬롯 하나입니다. | 일반 유니폼 |
| 캔버스 해상도보다 작은 히트 타깃 | 자체 깊이 텍스처를 가집니다 (한 패스의 모든 첨부는 크기가 같아야 합니다) | |
| 프레임 캡처 | `captureFrame()`은 합성 결과를 오프스크린 타깃에 한 번 더 그리고 읽어 옵니다 (헤드리스 Chromium은 WebGPU를 그리지만 캔버스를 합성하지 않습니다) | 다음에 그려지는 프레임에서 기본 프레임버퍼를 읽습니다 |
| 읽기 | 스테이징 버퍼를 만들어 재사용합니다. 한 번에 읽기는 하나만 진행합니다 | `readPixels`, 드라이버에 허용되는 형식/타입 쌍을 물어봅니다 |

두 백엔드 모두 스프라이트 곡선 표를 반정밀도(half float)로 올립니다. WebGPU의 `queue.writeTexture`는 원시 바이트를 복사하므로, 데이터를 먼저 binary16으로 인코딩합니다 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### 텍스처 한계 {#texture-limits}

`MAX_TEXTURE_SIZE`를 넘는 `texStorage2D`는 예외를 던지지 않습니다. 할당이 버려지고, 이후 업로드는 실패하고, 샘플링은 0을 돌려줍니다. WebGL2 도우미 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts)는 두 차원을 한계와 비교하고, 크기를 담아 예외를 던집니다. 블록 인덱스 텍스처는 2차원(폭 4,096)이라서 한계를 넘을 수 없습니다. `src/render/limits.test.ts`는 지원할 가치가 있는 한계와 비교해 모든 텍스처 차원을 검사합니다. WebGL2 렌더러는 최대 텍스처 크기가 행 텍스처의 폭 8,192보다 작은 디바이스도 거부합니다.

### 둘 다 시험하기 {#testing-both}

`npm run smoke`는 WebGL2로 헤드리스 Chromium에서 실제 앱을 구동합니다 (기본값은 `http://127.0.0.1:5273/`). WebGPU는 `node tools/smoke.mjs`에 `"http://127.0.0.1:5273/?backend=webgpu"`를 넘기고, 반정밀도 경로는 `npm run smoke:f16`을 씁니다. `tools/probe-webgpu.mjs`와 `tools/probe-present.mjs` ([명령줄 도구](ref-tools.md)의 개발자 도구 목록에 있음)는 헤드리스 브라우저에서 어댑터와 화면 출력 가능 여부를 진단합니다.
