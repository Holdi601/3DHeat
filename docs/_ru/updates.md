---
title: "Обновления"
nav_order: 21
lang: "ru"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Обновления

Просмотр сообщает, когда появилась более новая версия, и обновляется сам, только если вы согласитесь. Ничего на вашем компьютере не меняется без вашего ответа.

## Обновить просмотр {#update-the-viewer}

1. **На странице.** Когда есть новая версия, под названием вверху боковой панели появляется окно: «A newer version of 3DHeat is available». Нажмите **Обновить сейчас**. По окончании страница перезагрузится сама. **Позже** прячет окно до перезагрузки страницы.
2. **Если написано запустить restart.bat**, закройте окно сервера (чёрное окно, которое открыл `start.bat`) и дважды щёлкните `restart.bat`.
3. **При запуске просмотра.** `start.bat` тоже проверяет. Если есть новая версия, он спрашивает **Update now? [Y/N]**. Нажмите `Y`, чтобы обновиться. Нажмите `N` или подождите 60 секунд без ответа, чтобы запустить версию, которая у вас есть.

![Уведомление об обновлении с кнопками Обновить сейчас и Позже](../assets/img/en/updates-notice.webp)

Копию с вашими изменениями никогда не обновляют автоматически: окно только сообщает, что ждёт обновление, и советует зафиксировать или отложить изменения (commit или stash) и выполнить `git pull`. Копия, установленная не через git (например, из zip-архива), ничего не показывает.

Как работает проверка, по шагам:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Правила безопасности {#the-safety-rules}

- **Только fast-forward** (`git pull --ff-only`): обновление никогда не сливает, не перебазирует и не переписывает ничего.
- **Никаких локальных изменений**: копия с незафиксированными изменениями в отслеживаемых файлах (`git status --porcelain --untracked-files=no` не пусто) никогда не обновляется автоматически: чужая работа не должна перезаписываться обновлением. Ей только сообщают, что обновление ждёт. Неотслеживаемые файлы (данные, экспорты) изменениями не считаются.
- **Никаких локальных коммитов**: копия с коммитами, которых нет в upstream («расходится»), не обновляется: fast-forward не может её подтянуть, а слияние — для `git pull` вручную. Страница и `start.bat` говорят об этом одними и теми же словами, а `start.bat` запускает ту версию, что есть.
- **Только со страницы самой**: запрос обновления к dev-серверу должен нести собственный заголовок и, если браузер передаёт `Origin`, приходить с собственного хоста сервера (ниже).
- Обновляется только копия git с upstream-веткой; всё остальное (копия без `.git`, без git, статическая сборка) не трогается и ничего не говорит.

## Что делает start.bat {#what-startbat-does}

`start.bat` (дважды щёлкните по нему; окно и есть сервер) делает по порядку:

1. Находит Node.js — в `PATH`, иначе в `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` или `%LOCALAPPDATA%\Programs\nodejs` — и предлагает установить его командой `winget install -e --id OpenJS.NodeJS.LTS`, если его нет (спрашивает Y/N; после этого окно нужно открыть заново, чтобы Windows подхватила новый `PATH`).
2. **Обновления**, если установлен git и в папке есть `.git`:
   — `git fetch --quiet` (нет сети или upstream: молча пропускается);
   — считает `git rev-list --count HEAD..@{u}`; если отставания нет, ничего не говорит;
   — локальные изменения: «A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull.» — и запускает версию, которая есть;
   — собственные коммиты (`git rev-list --count @{u}..HEAD` не 0): «A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull.» — и запускает версию, которая есть;
   — иначе «A newer version of 3DHeat is available (N changes).» и вопрос **Update now? [Y/N]**. `N` или отсутствие ответа 60 секунд печатает «Not updated; starting the version you have.» и запускает версию, которая есть. При `Y`: «Updating...», сообщает, меняются ли `package.json` или `package-lock.json`, выполняет `git pull --ff-only` (если и это не удалось — например, из-за сети: «The update did not go through; starting the version you have.»), затем `git submodule update --init` (закреплённые инструменты, см. [Поддержка документации](maintaining.md#the-tools-under-exporters)), затем `npm install`, если файлы пакета изменились и `node_modules` существует, и «Updated.»
3. Не запускает второй сервер: если порт **5273** уже занят, сообщает об этом и указывает на `restart.bat` / `stop.bat`.
4. При первом запуске (нет `node_modules`) спрашивает разрешение на загрузку зависимостей (около 300 МБ в `node_modules\`, ничего системного).
5. Запускает dev-сервер на `127.0.0.1:5273` (`--strictPort`) и открывает браузер, когда он готов.

`restart.bat` останавливает сервер (по порту) и запускает `start.bat` снова, так что он задаёт тот же вопрос. `stop.bat` только останавливает сервер.


## For developers {#for-developers}

### While it runs: the update route {#while-it-runs-the-update-route}

The dev server (Vite plugin `heat3d-self-update` in `vite.config.ts`) serves
`/__heat3d/update`. It exists only on the dev server — not in a static build
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
   `{ ok: true, updated: true, restart }` — `restart` says why the running
   server cannot pick the update up: `"dependencies"` when they were
   reinstalled, `"config"` when only a `vite.config` file changed, `false`
   when nothing needs a restart.
5. A failing git or npm command answers `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Responses are JSON with `Cache-Control: no-store`. The server listens on
`127.0.0.1` only, so the route is not reachable from the network.

### The notice in the page {#the-notice-in-the-page}

`UpdateBanner`, under the name at the top of the sidebar:

- It asks the route **4 seconds** after the page loads (not in the first
  seconds: the page has a dataset to load and a GPU to start) and again
  **every 6 hours** while the page stays open.
- It shows **nothing** when there is no such route (a static build), the
  folder is not a checkout, or nothing is newer — a notice on every start is
  one people learn to ignore.
- Behind, with no local changes: "A newer version of 3DHeat is available (N
  changes, the newest: <subject>)." with **Update now** and **Later**
  (*Later* hides it until the page is reloaded).
- Behind, with local changes: the same sentence and "This copy has local
  changes, so it is not updated automatically; commit or stash them, then
  run git pull." — no button.
- **Update now** posts to `/apply` ("Updating..."). Then:
  — "Updated. The page reloads." — and it reloads 1.5 s later (the server
    already serves the new files);
  — when the dependencies were reinstalled: "Updated. Its dependencies
    changed: close the server window and run **restart.bat** to finish.";
  — when only the server's settings changed: "Updated. Its server settings
    changed: close the server window and run **restart.bat** to finish.";
  — nothing to bring in after all (`updated: false` — the copy was brought up
    meanwhile, by `start.bat` say): "Nothing to update: this copy is already
    the newest version." — and no reload;
  — refused: the *dirty* sentence, or "This copy has commits of its own that
    the newest version does not; update it with git pull.", or "The update
    did not go through: <reason>".
