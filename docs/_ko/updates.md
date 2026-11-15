---
title: "업데이트"
nav_order: 21
lang: "ko"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# 업데이트

뷰어는 더 새로운 버전이 있으면 알려 주고, 여러분이 승인할 때만 스스로 업데이트합니다. 여러분의 답 없이는 컴퓨터의 아무것도 바뀌지 않습니다.

## 뷰어 업데이트하기 {#update-the-viewer}

1. **페이지에서.** 더 새로운 버전이 있으면, 사이드바 맨 위의 이름 아래에 상자가 나타납니다. "3DHeat의 새 버전이 있습니다". **지금 업데이트**를 클릭하세요. 끝나면 페이지가 스스로 새로 고쳐집니다. **나중에**는 페이지를 새로 고칠 때까지 상자를 숨깁니다.
2. **restart.bat을 실행하라고 나오면**, 서버 창(`start.bat`이 연 검은 창)을 닫고 `restart.bat`을 더블 클릭하세요.
3. **뷰어를 시작할 때.** `start.bat`도 확인합니다. 더 새로운 버전이 있으면 **지금 업데이트할까요? [Y/N]**이라고 묻습니다. 업데이트하려면 `Y`를 누르세요. `N`을 누르거나, 60초 동안 답하지 않으면 지금 가진 버전을 시작합니다.

![지금 업데이트와 나중에 버튼이 있는 업데이트 알림](../assets/img/en/updates-notice.webp)

여러분이 직접 바꾼 내용이 있는 사본은 자동으로 업데이트되지 않습니다. 상자는 업데이트가 기다리고 있다는 것만 알려 주며, 변경 사항을 커밋하거나 stash한 뒤 `git pull`을 실행하라고 안내합니다. git으로 설치하지 않은 사본(예: zip 파일)은 아무것도 보여 주지 않습니다.

확인 방식을 단계별로 보면:

```
페이지 ---(4초 뒤, 그다음 6시간마다)---> 개발 서버 ---> git fetch
   뒤처졌나?  아니오 -> 아무것도 보이지 않음
              예     -> 여러분의 변경이나 커밋이 있나?  예 -> 알리기만 함
                                                    아니오 -> [지금 업데이트] -> git pull
                                                             -> 새로 고침, 또는 "restart.bat 실행"
```

## 안전 규칙 {#the-safety-rules}

- **빨리 감기만**(`git pull --ff-only`): 업데이트는 절대 병합, 리베이스, 다시 쓰기를 하지 않습니다.
- **로컬 변경 없음**: 추적 중인 파일에 커밋되지 않은 변경이 있는 체크아웃(`git status --porcelain --untracked-files=no`의 결과가 비어 있지 않음)은 자동으로 업데이트되지 않습니다. 누군가의 작업을 업데이트가 덮어써서는 안 되기 때문입니다. 업데이트가 기다리고 있다는 사실만 알려 줍니다. 추적하지 않는 파일(데이터, 내보내기)은 변경으로 세지 않습니다.
- **로컬 커밋 없음**: 업스트림에 없는 커밋이 있는 체크아웃("갈라짐")은 업데이트되지 않습니다. 빨리 감기로는 올릴 수 없고, 병합은 여러분이 직접 `git pull`로 해야 하기 때문입니다. 페이지와 `start.bat` 모두 같은 말로 알리고, `start.bat`은 그곳에 있는 버전을 시작합니다.
- **페이지 자체에서만**: 개발 서버의 업데이트 요청은 사용자 지정 헤더를 담고 있어야 하며, 브라우저가 `Origin`을 보내면 서버 자신의 호스트에서 와야 합니다(아래 참고).
- git 체크아웃이고 업스트림 브랜치가 있는 경우에만 업데이트합니다. 그 밖의 것(`.git`이 없는 사본, git이 설치되지 않음, 정적 빌드)은 건드리지 않고 아무 말도 하지 않습니다.

## start.bat이 하는 일 {#what-startbat-does}

`start.bat`(더블 클릭하세요. 그 창이 서버입니다)은 순서대로 다음을 합니다.

1. Node.js를 찾습니다. `PATH`에서, 없으면 `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs`, 또는 `%LOCALAPPDATA%\Programs\nodejs`에서 찾습니다. 없으면 `winget install -e --id OpenJS.NodeJS.LTS`로 설치할지 제안합니다(묻고 Y/N으로 답하며, 설치 후에는 Windows가 새 `PATH`를 알도록 창을 다시 열어야 합니다).
2. git이 설치되어 있고 폴더에 `.git`이 있으면 **업데이트**를 확인합니다.
   - `git fetch --quiet`(네트워크가 없거나 업스트림이 없으면 조용히 건너뜁니다);
   - `git rev-list --count HEAD..@{u}`로 개수를 셉니다. 뒤처진 것이 없으면 아무 말도 하지 않습니다;
   - 로컬 변경이 있으면: "3DHeat의 새 버전이 있습니다(N개 변경), 하지만 이 사본에 로컬 변경이 있어서 업데이트하지 않습니다. 커밋하거나 stash한 뒤 git pull을 실행하세요." 그리고 지금 가진 버전을 시작합니다;
   - 자체 커밋이 있으면(`git rev-list --count @{u}..HEAD`가 0이 아님): "3DHeat의 새 버전이 있습니다(N개 변경), 하지만 이 사본에는 최신 버전에 없는 자체 커밋이 있어서 업데이트하지 않습니다. git pull로 업데이트하세요." 그리고 지금 가진 버전을 시작합니다;
   - 그 밖에는 "3DHeat의 새 버전이 있습니다(N개 변경)."과 **지금 업데이트할까요? [Y/N]** 질문을 합니다. `N`이나 60초 동안 답이 없으면 "업데이트하지 않았습니다. 지금 가진 버전을 시작합니다."를 출력하고 지금 가진 버전을 시작합니다. `Y`이면 "업데이트 중..."이라고 출력하고, `package.json`이나 `package-lock.json`이 바뀌는지 알려 주며, `git pull --ff-only`를 실행합니다(그래도 실패하면, 예를 들어 네트워크 문제라면: "업데이트가 완료되지 않았습니다. 지금 가진 버전을 시작합니다."). 그다음 `git submodule update --init`(고정된 도구들, [문서 관리](maintaining.md#the-tools-under-exporters) 참고)을 실행하고, 패키지 파일이 바뀌었고 `node_modules`가 있으면 `npm install`을 실행하고, "업데이트했습니다."라고 출력합니다.
3. 두 번째 서버 실행을 막습니다. 포트 **5273**을 이미 무언가 듣고 있으면 그렇다고 알리고 `restart.bat` / `stop.bat`을 안내합니다.
4. 처음 실행할 때(`node_modules`가 없을 때), 의존성을 내려받기 전에 묻습니다(`node_modules\`에 약 300 MB, 시스템 전역에는 아무것도 설치하지 않습니다).
5. `127.0.0.1:5273`에서 개발 서버를 시작합니다(`--strictPort`). 준비되면 브라우저를 엽니다.

`restart.bat`은 (포트로) 서버를 멈추고 `start.bat`을 다시 실행하므로, 같은 질문을 합니다. `stop.bat`은 멈추기만 합니다.

## 개발자용 {#for-developers}

### 실행 중: 업데이트 경로 {#while-it-runs-the-update-route}

The dev server (Vite plugin `heat3d-self-update` in `vite.config.ts`) serves
`/__heat3d/update`. It exists only on the dev server - not in a static build
and not in `vite preview`.

**`GET /__heat3d/update`** answers whether the checkout is behind:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` when the folder is not a git checkout;
- it runs `git fetch --quiet` **at most every 30 minutes** (asks in between
  answer from what was last fetched);
- `behind` / `ahead` from `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` from `git status --porcelain --untracked-files=no`, `latest` the
  subject of the upstream's newest commit;
- with no upstream branch, `upstream: null` and `behind: 0`.

**`POST /__heat3d/update/apply`** brings the checkout up:

1. Refused with `403 { ok: false, reason: "forbidden" }` unless the request has
   the header `X-Heat3d-Update: 1` and, when it carries an `Origin`, that
   origin's host is the request's `Host`. A cross-site form cannot send a
   custom header without a CORS preflight, which this server never grants.
2. Nothing to do (not a checkout, no upstream, not behind):
   `{ ok: true, updated: false }`.
3. Local changes: `{ ok: false, reason: "dirty" }`; local commits:
   `{ ok: false, reason: "diverged" }`.
4. Otherwise: notes the files that change (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (2 min timeout), `git submodule update --init`
   (failure ignored), `npm install` when `package.json` or
   `package-lock.json` changed (15 min timeout), and answers
   `{ ok: true, updated: true, restart }` - `restart` says why the running
   server cannot pick the update up: `"dependencies"` when they were
   reinstalled, `"config"` when only a `vite.config` file changed, `false`
   when nothing needs a restart.
5. A failing git or npm command answers `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Responses are JSON with `Cache-Control: no-store`. The server listens on
`127.0.0.1` only, so the route is not reachable from the network.

### 페이지의 알림 {#the-notice-in-the-page}

`UpdateBanner`, under the name at the top of the sidebar:

- It asks the route **4 seconds** after the page loads (not in the first
  seconds: the page has a dataset to load and a GPU to start) and again
  **every 6 hours** while the page stays open.
- It shows **nothing** when there is no such route (a static build), the
  folder is not a checkout, or nothing is newer - a notice on every start is
  one people learn to ignore.
- Behind, with no local changes: "A newer version of 3DHeat is available (N
  changes, the newest: <subject>)." with **Update now** and **Later**
  (*Later* hides it until the page is reloaded).
- Behind, with local changes: the same sentence and "This copy has local
  changes, so it is not updated automatically; commit or stash them, then
  run git pull." - no button.
- **Update now** posts to `/apply` ("Updating..."). Then:
  - "Updated. The page reloads." - and it reloads 1.5 s later (the server
    already serves the new files);
  - when the dependencies were reinstalled: "Updated. Its dependencies
    changed: close the server window and run **restart.bat** to finish.";
  - when only the server's settings changed: "Updated. Its server settings
    changed: close the server window and run **restart.bat** to finish.";
  - nothing to bring in after all (`updated: false` - the copy was brought up
    meanwhile, by `start.bat` say): "Nothing to update: this copy is already
    the newest version." - and no reload;
  - refused: the *dirty* sentence, or "This copy has commits of its own that
    the newest version does not; update it with git pull.", or "The update
    did not go through: <reason>".
