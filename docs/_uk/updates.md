---
title: "Оновлення"
nav_order: 21
lang: "uk"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Оновлення

Переглядач повідомляє, коли існує новіша версія, і оновлюється сам лише тоді, коли ви скажете «так». Нічого на вашому комп’ютері не змінюється без вашої відповіді.

## Оновлення переглядача {#update-the-viewer}

1. **На сторінці.** Коли існує новіша версія, під назвою вгорі бічної панелі з’являється вікно: «A newer version of 3DHeat is available». Натисніть **Оновити зараз**. Сторінка перезавантажується сама, коли все готово. **Пізніше** ховає вікно, доки ви не перезавантажите сторінку.
2. **Якщо там сказано запустити restart.bat**, закрийте вікно сервера (чорне вікно, яке відкрив `start.bat`) і двічі клацніть `restart.bat`.
3. **Під час запуску переглядача.** `start.bat` також перевіряє. Якщо існує новіша версія, він питає **Update now? [Y/N]**. Натисніть `Y`, щоб оновити. Натисніть `N` або зачекайте 60 секунд без відповіді, щоб запустити версію, яка у вас є.

![Повідомлення про оновлення з кнопками Оновити зараз і Пізніше](../assets/img/en/updates-notice.webp)

Копію зі змінами, внесеними вами, ніколи не оновлюють за вас; вікно лише повідомляє, що чекає оновлення, і радить зафіксувати або відкласти ваші зміни та виконати `git pull`. Копія, встановлена не через git (наприклад, zip-файл), нічого не показує.

Як працює перевірка, крок за кроком:

```
сторінка ---(через 4 с, потім кожні 6 год)---> сервер розробки ---> git fetch
   позаду?  ні  -> нічого не показується
            так -> ваші зміни або коміти?  так -> лише повідомити
                                           ні  -> [Оновити зараз] -> git pull
                                                  -> перезавантаження або «запустіть restart.bat»
```

## Правила безпеки {#the-safety-rules}

- **Лише перемотка вперед** (`git pull --ff-only`): оновлення ніколи нічого не зливає, не перебазовує і не переписує.
- **Без локальних змін**: копія з незакоміченими змінами відстежуваних файлів (`git status --porcelain --untracked-files=no` не порожній) ніколи не оновлюється автоматично - чужа робота не є тим, що оновлення має перезаписати. Їй лише повідомляють, що оновлення чекає. Невідстежувані файли (дані, експорти) змінами не вважаються.
- **Без локальних комітів**: копія з комітами, яких немає у віддаленої гілки («diverged»), не оновлюється - перемотка вперед їх не підтягне, а злиття - для `git pull` вручну. Сторінка і `start.bat` кажуть про це тими самими словами, а `start.bat` запускає наявну версію.
- **Лише зі сторінки**: запит оновлення до сервера розробки мусить нести власний заголовок і, коли браузер надсилає `Origin`, походити з власного хоста сервера (нижче).
- Оновлюється лише копія git із гілкою віддаленого сховища; усе інше (копія без `.git`, git не встановлено, статична збірка) лишається без змін і нічого не каже.

## Що робить start.bat {#what-startbat-does}

`start.bat` (двічі клацніть; вікно і є сервером) робить по порядку:

1. Знаходить Node.js - у `PATH`, інакше в `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` або `%LOCALAPPDATA%\Programs\nodejs` - і, якщо його немає, пропонує встановити його командою `winget install -e --id OpenJS.NodeJS.LTS` (питає, Y/N; після цього вікно треба відкрити знову, щоб Windows підхопила новий `PATH`).
2. **Оновлення**, коли git встановлено і тека має `.git`:
   - `git fetch --quiet` (без мережі або без віддаленої гілки: мовчки пропускається);
   - рахує `git rev-list --count HEAD..@{u}`; нічого позаду - нічого не каже;
   - локальні зміни: «A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull.» - і запускає наявну версію;
   - власні коміти (`git rev-list --count @{u}..HEAD` не 0): «A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull.» - і запускає наявну версію;
   - інакше «A newer version of 3DHeat is available (N changes).» і питання **Update now? [Y/N]**. `N` або відсутність відповіді 60 секунд друкує «Not updated; starting the version you have.» і запускає наявну версію. На `Y`: «Updating...», повідомляє, чи змінилися `package.json` або `package-lock.json`, виконує `git pull --ff-only` (якщо й це не вдалося - наприклад, мережа: «The update did not go through; starting the version you have.»), потім `git submodule update --init` (закріплені інструменти, див. [Супровід документації](maintaining.md#the-tools-under-exporters)), потім `npm install`, коли файли пакета змінилися і існує `node_modules`, і «Updated.»
3. Відмовляється запускати другий сервер: коли порт **5273** уже зайнятий, каже про це і вказує на `restart.bat` / `stop.bat`.
4. При першому запуску (немає `node_modules`) питає перед завантаженням залежностей (близько 300 МБ у `node_modules\`, нічого системного).
5. Запускає сервер розробки на `127.0.0.1:5273` (`--strictPort`) і відкриває браузер, коли він готовий.

`restart.bat` зупиняє сервер (за портом) і знову запускає `start.bat`, тож ставить те саме питання. `stop.bat` лише зупиняє.

## For developers {#for-developers}

### While it runs: the update route {#while-it-runs-the-update-route}

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

### The notice in the page {#the-notice-in-the-page}

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
