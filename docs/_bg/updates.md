---
title: "Обновления"
nav_order: 18
lang: "bg"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: true
---

# Обновления

Визуализаторът ви казва кога има по-нова версия и се обновява сам само когато кажете „да“. Нищо на компютъра ви не се променя без вашия отговор.

## Обновете визуализатора {#update-the-viewer}

1. **В страницата.** Когато има по-нова версия, под името в горната част на страничната лента се появява кутия: „Налична е по-нова версия на 3DHeat“. Щракнете върху **Обнови сега**. Страницата се презарежда сама, когато приключи. **По-късно** скрива кутията, докато не презаредите страницата.
2. **Ако пише да пуснете restart.bat**, затворете прозореца на сървъра (черния прозорец, който отвори `start.bat`) и щракнете два пъти върху `restart.bat`.
3. **Когато стартирате визуализатора.** `start.bat` също проверява. Ако има по-нова версия, пита **Update now? [Y/N]** (Обнови ли сега?). Натиснете `Y`, за да обновите. Натиснете `N` или изчакайте 60 секунди без отговор, за да стартирате версията, която имате.

![Известието за обновление с Обнови сега и По-късно](../assets/img/bg/updates-notice.webp)

Копие с ваши собствени промени никога не се обновява вместо вас; кутията само ви казва, че има чакащо обновление, и ви препоръчва да подложите промените си на commit или stash и да изпълните `git pull`. Копие, което не е инсталирано с git (например zip файл), не показва нищо.

Как работи проверката, стъпка по стъпка:

```
страница ---(след 4 s, после на всеки 6 h)---> сървър за разработка ---> git fetch
   назад?  не  -> нищо не се показва
           да  -> ваши собствени промени или commit-и?  да  -> само ви казва
                                                        не  -> [Обнови сега] -> git pull
                                                               -> презареждане, или „пуснете restart.bat“
```

## Правилата за безопасност {#the-safety-rules}

- **Само напред** (`git pull --ff-only`): обновлението никога не слива,
  не пренарежда и не пренаписва нищо.
- **Без локални промени**: копие с незаписани промени в следените файлове
  (`git status --porcelain --untracked-files=no` не е празно) никога не се
  обновява автоматично - чужда работа не е обновление, което да презапише. Само
  му се казва, че има чакащо обновление. Непроследени файлове (данни,
  експорти) не се броят като промени.
- **Без локални commit-и**: копие с commit-и, които горният клон няма
  („разклонено“), не се обновява - обновление напред не може да го вдигне, а
  сливането е за `git pull` ръчно. Страницата и `start.bat` казват това със
  същите думи, а `start.bat` стартира версията, която има.
- **Само от самата страница**: заявката за обновление към сървъра за разработка
  трябва да носи собствена заглавка и, когато браузърът изпрати `Origin`, да
  идва от собствения хост на сървъра (по-долу).
- Обновява се само копие на git с клон нагоре; всичко друго (копие без
  `.git`, без инсталиран git, статичен пакет) се оставя на мира и не казва
  нищо.

## Какво прави start.bat {#what-startbat-does}

`start.bat` (щракнете два пъти; прозорецът е сървърът) прави, по ред:

1. Намира Node.js - в `PATH`, иначе в `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` или `%LOCALAPPDATA%\Programs\nodejs` - и
   предлага да го инсталира с `winget install -e --id OpenJS.NodeJS.LTS`, когато
   липсва (пита Y/N; после прозорецът трябва да се отвори отново, за да вземе
   Windows новия `PATH`).
2. **Обновления**, когато git е инсталиран и папката има `.git`:
   - `git fetch --quiet` (без мрежа или без клон нагоре: прескача се тихо);
   - брои `git rev-list --count HEAD..@{u}`; нищо назад: нищо не се казва;
   - локални промени: „A newer version of 3DHeat is available (N changes), but
     this copy has local changes, so it is not updated. Commit or stash them,
     then run git pull.“ - и стартира версията, която има;
   - собствени commit-и (`git rev-list --count @{u}..HEAD` не е 0): „A newer
     version of 3DHeat is available (N changes), but this copy has commits of
     its own that the newest version does not, so it is not updated. Update it
     with git pull.“ - и стартира версията, която има;
   - иначе „A newer version of 3DHeat is available (N changes).“ и въпросът **Update now? [Y/N]**. `N` или липса на отговор за 60 секунди извежда „Not updated; starting the version you have.“ и стартира версията, която имате. При `Y`: „Updating...“, казва дали се променят `package.json` или `package-lock.json`,
     изпълнява `git pull --ff-only` (ако това пак се провали - например мрежата:
     „The update did not go through; starting the version you have.“), после `git submodule update --init`
     (закачените инструменти, вж. [Поддържане на документацията](maintaining.md#the-tools-under-exporters)), после `npm install`, когато файловете на пакета са се променили и
     `node_modules` съществува, и „Updated.“
3. Отказва да стартира втори сървър: когато нещо вече слуша порт
   **5273**, казва това и сочи `restart.bat` / `stop.bat`.
4. При първото стартиране (няма `node_modules`) пита, преди да изтегли
   зависимостите (около 300 MB в `node_modules\`, нищо системно).
5. Стартира сървъра за разработка на `127.0.0.1:5273` (`--strictPort`) и отваря
   браузъра, когато е готов.

`restart.bat` спира сървъра (по порт) и пак пуска `start.bat`, така че пита същия въпрос. `stop.bat` само спира.

## За разработчици {#for-developers}

### Докато работи: маршрутът за обновление {#while-it-runs-the-update-route}

Сървърът за разработка (приставката на Vite `heat3d-self-update` в `vite.config.ts`) обслужва `/__heat3d/update`. Той съществува само на сървъра за разработка - не в статичен пакет и не в `vite preview`.

**`GET /__heat3d/update`** отговаря дали копието изостава:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, когато папката не е копие на git;
- изпълнява `git fetch --quiet` **най-много на всеки 30 минути** (заявките между тях отговарят от последното изтегляне);
- `behind` / `ahead` от `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` от `git status --porcelain --untracked-files=no`, `latest` е темата на най-новия commit на клона нагоре;
- без клон нагоре: `upstream: null` и `behind: 0`.

**`POST /__heat3d/update/apply`** довежда копието до актуално:

1. Отказва с `403 { ok: false, reason: "forbidden" }`, освен ако заявката няма заглавката `X-Heat3d-Update: 1` и, когато носи `Origin`, хостът на този origin е `Host` на заявката. Заявка от друг сайт не може да изпрати собствена заглавка без CORS preflight, който този сървър никога не разрешава.
2. Нищо за правене (не е копие, няма клон нагоре, не изостава):
   `{ ok: true, updated: false }`.
3. Локални промени: `{ ok: false, reason: "dirty" }`; локални commit-и: `{ ok: false, reason: "diverged" }`.
4. Иначе: отбелязва файловете, които се променят (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (време за изчакване 2 min), `git submodule update --init`
   (грешката се игнорира), `npm install`, когато `package.json` или
   `package-lock.json` са се променили (време за изчакване 15 min), и отговаря
   `{ ok: true, updated: true, restart }` - `restart` казва защо работещият
   сървър не може да вземе обновлението: `"dependencies"`, когато зависимостите са
   преинсталирани, `"config"`, когато се е променил само файл `vite.config`, `false`,
   когато не е нужен рестарт.
5. Неуспешна команда на git или npm отговаря `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Отговорите са JSON с `Cache-Control: no-store`. Сървърът слуша само на
`127.0.0.1`, така че маршрутът не е достъпен от мрежата.

### Известието в страницата {#the-notice-in-the-page}

`UpdateBanner`, под името в горната част на страничната лента:

- Пита маршрута **4 секунди** след зареждането на страницата (не в първите секунди: страницата има набор от данни за зареждане и GPU за стартиране) и отново **на всеки 6 часа**, докато страницата е отворена.
- **Не показва нищо**, когато няма такъв маршрут (статичен пакет), папката не е копие, или нищо не е по-ново - известие при всяко стартиране е нещо, на което хората се научават да не обръщат внимание.
- Изостава, без локални промени: „A newer version of 3DHeat is available (N changes, the newest: <subject>).“ с **Обнови сега** и **По-късно** (*По-късно* скрива кутията, докато страницата не се презареди).
- Изостава, с локални промени: същото изречение и „This copy has local changes, so it is not updated automatically; commit or stash them, then run git pull.“ - без бутон.
- **Обнови сега** изпраща заявка към `/apply` („Updating...“). После:
  - „Updated. The page reloads.“ - и презарежда 1.5 s по-късно (сървърът вече обслужва новите файлове);
  - когато зависимостите са били преинсталирани: „Updated. Its dependencies changed: close the server window and run **restart.bat** to finish.“;
  - когато са се променили само настройките на сървъра: „Updated. Its server settings changed: close the server window and run **restart.bat** to finish.“;
  - нищо за довеждане в крайна сметка (`updated: false` - копието е било довеждано междувременно, например от `start.bat`): „Nothing to update: this copy is already the newest version.“ - и без презареждане;
  - отказано: изречението за промените, или „This copy has commits of its own that the newest version does not; update it with git pull.“, или „The update did not go through: <reason>“.
