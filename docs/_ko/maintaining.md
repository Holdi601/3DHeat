---
title: "문서 관리"
nav_order: 23
lang: "ko"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# 문서 관리

이 페이지는 뷰어와 이 사이트를 관리하는 사람을 위한 것입니다. 변경 후에도 페이지, 그림, 번역이 맞게 유지되도록 하는 단계를 적어 둡니다.

이 사이트는 **릴리스마다**, 그리고 키 바인딩, UI를 거치는 길, 설정, 파일 형식처럼 많이 바뀌는 것이 있을 때마다 다시 확인합니다. 점검표는 다음과 같습니다.

1. **참조 페이지 다시 만들기**: `node tools/docs-refs.mjs` (언어마다 `--lang <lang>`도). `node tools/docs-refs.mjs --check`는 페이지가 오래되었으면 실패합니다.
2. **스크린샷 다시 찍기**: [데모 데이터](demo-data.md)로 찍습니다. 지역이 en-US인 컴퓨터나 컨테이너를 쓰세요. 그래야 숫자가 `0,35`가 아니라 `0.35`로 나옵니다 (숫자 상자는 바꾸기 전까지 브라우저 지역을 따릅니다). `node tools/demo-data.mjs`로 데모 데이터를 만들고, 로컬 피규어 묶음**이 없는** 상태로 포트 5321에서 개발 서버를 띄운 뒤 (`HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`), `node tools/docs-shots.mjs --lang <lang>`를 실행하세요. 그림을 전부 보세요. 데모 이름(*Demo Valley*, *Blue 1*, *Red 3* ...)만 있어야 하며, 실제 지도, 플레이어, 기록이 있으면 안 됩니다.
3. **마지막 릴리스 태그 이후 바뀐 것 나열**: `git log --oneline <last tag>..HEAD`, 그리고 `CHANGELOG.md`의 **Docs** 절. 이 절은 각 기능을 페이지에 연결합니다. 새 기능마다 페이지나 절이 있어야 하며, 화면에 나타나는 곳에는 그림도 있어야 합니다.
4. **독립 검토**: 이 페이지들을 쓰지 않은 사람이 영어 페이지를 세 가지 독자 관점에서 검토합니다. 초보자, 여덟 살 아이, 전문가. 단계가 빠짐없이 올바른 순서인가? 단어가 UI의 것과 같은가? 그림이 최신인가? 다이어그램의 라벨이 맞는가?
5. **검토에서 나온 것을 고치기.**
6. **바뀐 페이지를 원본 해시로 다시 번역**한 뒤, 언어마다 검토를 실행하세요. `tools/docs-translate.md`를 보세요.
7. **기밀 용어를 검사**하고, 바뀐 파일에서 그림이 데모 데이터 외의 것을 보여 주지 않는지 확인하세요.
8. 릴리스가 승인되었을 때만 **게시**하세요.

같은 점검은 관련 저장소의 문서 사이트에도 적용됩니다 ([홈](index.md#related-repositories) 페이지 참고).

## exporters/ 아래의 도구 {#the-tools-under-exporters}

뷰어 주변의 도구는 별도의 공개 프로젝트입니다. 각각 자체 MIT 라이선스, 릴리스, 위키, 업데이트 검사를 가지며, 이 저장소에 git 서브모듈로 고정되어 있습니다.

| 폴더 | 저장소 |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - 게임 자체 보관 파일에서 꺼낸 코스와 레벨 |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - 랩 텔레메트리 기록기; 게임플레이 영상에서 얻은 레벨 |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor 플러그인 |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 데모와 맵 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - 백그라운드에서 플레이를 기록 |

**고정(pinned)**은 이 저장소가 각 도구의 정확한 커밋 하나를 기록한다는 뜻입니다. 뷰어를 체크아웃하면 그 커밋을 받습니다.

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# 또는 일반 클론 후:
git submodule update --init
```

위의 두 업데이트 경로는 가져온 뒤 `git submodule update --init`을 실행하므로, 도구들은 뷰어의 최신 버전이 고정한 커밋을 따릅니다. 도구 자체의 최신 커밋은 따르지 않습니다. 도구의 새 릴리스는 여기 고정된 커밋을 옮겨야 뷰어에 닿습니다. 도구의 변경은 먼저 자기 폴더(자기 저장소)에 커밋하고 푸시하며, 그런 다음 새 고정을 여기에 커밋합니다. 각 도구는 자기 새 릴리스도 확인합니다. 그것은 각 도구의 저장소에 문서화되어 있습니다.
