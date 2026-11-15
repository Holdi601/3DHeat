---
title: "Абнаўленні"
nav_order: 21
lang: "be"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Абнаўленні

Праглядальнік кажа вам, калі ёсць новая версія, і абнаўляецца сам, толькі калі вы згодны. Нічога на вашым кампутары не мяняецца без вашага адказу.

## Абнавіць праглядальнік {#update-the-viewer}

1. **На старонцы.** Калі ёсць новая версія, пад назвай уверсе бакавой панэлі з'яўляецца блок: «A newer version of 3DHeat is available». Націсніце **Update now** (Абнавіць зараз). Старонка перазагружаецца сама, калі ўсё гатова. **Later** (Пазней) хавае блок да перазагрузкі старонкі.
2. **Калі прапануецца запусціць restart.bat**, закрыйце акно сервера (чорнае акно, якое адкрыў `start.bat`) і двойчы націсніце `restart.bat`.
3. **Пры запуску праглядальніка.** `start.bat` таксама правярае. Калі ёсць новая версія, ён пытаецца **Update now? [Y/N]**. Націсніце `Y`, каб абнавіць. Націсніце `N` або пачакайце 60 секунд без адказу, каб запусціць тую версію, якая ў вас ёсць.

![Паведамленне аб абнаўленні з Update now і Later](../assets/img/en/updates-notice.webp)

Копія з вашымі ўласнымі зменамі ніколі не абнаўляецца за вас; блок толькі кажа, што абнаўленне чакае, і прапануе зафіксаваць або адкласці вашыя змены і запусціць `git pull`. Копія, якая не ўсталявана з git (напрыклад, zip-файл), нічога не паказвае.

Як праводзіцца праверка, крок за крокам:

```
старонка ---(праз 4 с, потым кожныя 6 г)---> сервер распрацоўкі ---> git fetch
   адстае?  не  -> нічога не паказваецца
            так -> ёсць вашыя змены або фіксацыі?  так -> толькі паведамляецца
                                                    не  -> [Update now] -> git pull
                                                        -> перазагрузка, або «run restart.bat»
```

## Правілы бяспекі {#the-safety-rules}

- **Толькі перамотка наперад** (`git pull --ff-only`): абнаўленне ніколі не злівае, не перабудоўвае гісторыю і нічога не перапісвае.
- **Без лакальных змяненняў**: копія з незафіксаванымі змяненнямі ў адсочваных файлах (`git status --porcelain --untracked-files=no` не пуста) ніколі не абнаўляецца аўтаматычна - чужая праца не павінна перазапісвацца абнаўленнем. Ёй толькі кажуць, што абнаўленне чакае. Неадсочваныя файлы (даныя, экспарты) зменамі не лічацца.
- **Без лакальных фіксацый**: копія з фіксацыямі, якіх няма ў апстрыме («разыходжанне»), не абнаўляецца - перамотка наперад іх не зможа ўзяць, а зліццё - справа `git pull` уручную. Старонка і `start.bat` кажуць гэта адзінымі словамі, а `start.bat` запускае тую версію, якая ёсць.
- **Толькі з самой старонкі**: запыт абнаўлення на сервер распрацоўкі павінен несці асабісты загаловак і, калі браўзер шле `Origin`, паходзіць з уласнага host сервера (гл. ніжэй).
- Абнаўляецца толькі git-копія з апстрым-галіной; усё іншае (копія без `.git`, git не ўсталяваны, статычная зборка) не чапаецца і нічога не кажа.

## Што робіць start.bat {#what-startbat-does}

`start.bat` (двойчы націсніце; акно - гэта сервер) робіць па парадку:

1. Знаходзіць Node.js - у `PATH`, інакш у `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` або `%LOCALAPPDATA%\Programs\nodejs` - і, калі яго няма, прапануе ўсталяваць з `winget install -e --id OpenJS.NodeJS.LTS` (пытаецца, Y/N; пасля трэба адкрыць акно нанова, каб Windows пабачыла новы `PATH`).
2. **Абнаўленні**, калі ўсталяваны git і ў папцы ёсць `.git`:
   - `git fetch --quiet` (без сеткі або без апстрыма - тыхі прапуск);
   - лічыць `git rev-list --count HEAD..@{u}`; нічога не адстае - нічога не кажа;
   - лакальныя змены: «A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull.» - і запускае тую версію, што ёсць;
   - уласныя фіксацыі (`git rev-list --count @{u}..HEAD` не 0): «A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull.» - і запускае тую версію, што ёсць;
   - інакш «A newer version of 3DHeat is available (N changes).» і пытанне **Update now? [Y/N]**. `N` або адсутнасць адказу 60 секунд друкуе «Not updated; starting the version you have.» і запускае тую версію, што ёсць. Пры `Y`: «Updating...», паведамляе, ці мяняюцца `package.json` або `package-lock.json`, запускае `git pull --ff-only` (калі і гэта не ўдаецца - сетка, напрыклад: «The update did not go through; starting the version you have.»), потым `git submodule update --init` (замацаваныя інструменты, гл. [Падтрымка дакументацыі](maintaining.md#the-tools-under-exporters)), потым `npm install`, калі файлы пакета змяніліся і `node_modules` ёсць, і «Updated.»
3. Адмаўляецца запускаць другі сервер: калі на порце **5273** нешта ўжо слухае, кажа пра гэта і адсылае да `restart.bat` / `stop.bat`.
4. Пры першым запуску (няма `node_modules`) пытаецца, перш чым спампаваць залежнасці (каля 300 МБ у `node_modules\`, нічога на ўсю сістэму).
5. Запускае сервер распрацоўкі на `127.0.0.1:5273` (`--strictPort`) і адкрывае браўзер, калі ўсё гатова.

`restart.bat` спыняе сервер (па порце) і запускае `start.bat` нанова, таму пытаецца тое ж. `stop.bat` толькі спыняе.

## Для распрацоўшчыкаў {#for-developers}

### Пакуль працуе: маршрут абнаўлення {#while-it-runs-the-update-route}

Сервер распрацоўкі (плагін Vite `heat3d-self-update` у `vite.config.ts`) абслугоўвае `/__heat3d/update`. Ён існуе толькі на серверы распрацоўкі - не ў статычнай зборцы і не ў `vite preview`.

**`GET /__heat3d/update`** адказвае, ці адстае копія:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "тэма навейшай фіксацыі" }
```

- `checkout: false`, калі папка не git-копія;
- запускае `git fetch --quiet` **не часцей за раз у 30 хвілін** (запыты паміж гэтым адказваюць з таго, што была атрымана апошні раз);
- `behind` / `ahead` з `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` з `git status --porcelain --untracked-files=no`, `latest` - тэма навейшай фіксацыі апстрыма;
- без галіны апстрыма `upstream: null` і `behind: 0`.

**`POST /__heat3d/update/apply`** прыводзіць копію да стану:

1. Адмаўляецца з `403 { ok: false, reason: "forbidden" }`, калі запыт не нясе загаловак `X-Heat3d-Update: 1` і, калі нясе `Origin`, хост гэтага origin не супадае з `Host` запыту. Міжсайтавая форма не можа паслаць асабісты загаловак без CORS preflight, а гэты сервер яго ніколі не дае.
2. Нічога рабіць не трэба (не git-копія, няма апстрыма, не адстае): `{ ok: true, updated: false }`.
3. Лакальныя змены: `{ ok: false, reason: "dirty" }`; лакальныя фіксацыі: `{ ok: false, reason: "diverged" }`.
4. Інакш: адзначае файлы, якія мяняюцца (`git diff --name-only HEAD @{u}`), запускае `git pull --ff-only` (тайм-аўт 2 хв), `git submodule update --init` (збой ігнаруецца), `npm install`, калі `package.json` або `package-lock.json` змяніліся (тайм-аўт 15 хв), і адказвае `{ ok: true, updated: true, restart }` - `restart` кажа, чаму запушчаны сервер не можа ўзяць абнаўленне: `"dependencies"`, калі залежнасці пераўсталяваны, `"config"`, калі змяніўся толькі файл `vite.config`, `false`, калі перазапуск не патрэбны.
5. Збой каманды git або npm адказвае `{ ok: false, reason: "<памылка, да 300 знакаў>" }`.

Адказы - JSON з `Cache-Control: no-store`. Сервер слухае толькі `127.0.0.1`, таму маршрут недаступны з сеткі.

### Паведамленне на старонцы {#the-notice-in-the-page}

`UpdateBanner`, пад назвай уверсе бакавой панэлі:

- Ён пытаецца праз **4 секунды** пасля загрузкі старонкі (не у першыя секунды: у старонкі ёсць набор даных для загрузкі і GPU для запуску) і потым **кожныя 6 гадзін**, пакуль старонка адкрыта.
- Ён **нічога не паказвае**, калі такога маршрута няма (статычная зборка), папка не копія, або нічога не навейшае - паведамленне пры кожным запуску вучыцца ігнараваць.
- Адстае, без лакальных змяненняў: «A newer version of 3DHeat is available (N changes, the newest: <тэма>).» з **Update now** і **Later** (*Later* хавае да перазагрузкі старонкі).
- Адстае, з лакальнымі змяненнямі: тое самае прапанаванне і «This copy has local changes, so it is not updated automatically; commit or stash them, then run git pull.» - без кнопкі.
- **Update now** пасылае запыт на `/apply` («Updating...»). Потым:
  - «Updated. The page reloads.» - і перазагружаецца праз 1.5 с (сервер ужо аддае новыя файлы);
  - калі залежнасці пераўсталяваны: «Updated. Its dependencies changed: close the server window and run **restart.bat** to finish.»;
  - калі змяніліся толькі налады сервера: «Updated. Its server settings changed: close the server window and run **restart.bat** to finish.»;
  - нічога не трэба ўзяць (`updated: false` - копію ўжо абнавіў `start.bat`, напрыклад): «Nothing to update: this copy is already the newest version.» - і без перазагрузкі;
  - адмова: сказ пра змены, або «This copy has commits of its own that the newest version does not; update it with git pull.», або «The update did not go through: <reason>».
