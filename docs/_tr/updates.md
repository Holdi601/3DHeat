---
title: "Güncellemeler"
nav_order: 21
lang: "tr"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Güncellemeler

Görüntüleyici daha yeni bir sürüm olduğunda size söyler ve yalnızca siz evet dediğinizde kendini günceller. Yanıtınız olmadan bilgisayarınızda hiçbir şey değişmez.

## Görüntüleyiciyi güncelleyin {#update-the-viewer}

1. **Sayfada.** Daha yeni bir sürüm olduğunda, kenar çubuğunun üstündeki adın altında bir kutu belirir: "3DHeat'in daha yeni bir sürümü var". **Şimdi güncelle**'ye tıklayın. İş bittiğinde sayfa kendiliğinden yeniden yüklenir. **Daha sonra** sayfayı yeniden yükleyene kadar kutuyu gizler.
2. **restart.bat çalıştırmanızı söylerse**, sunucu penceresini (`start.bat`'ın açtığı siyah pencere) kapatın ve `restart.bat` dosyasına çift tıklayın.
3. **Görüntüleyiciyi başlattığınızda.** `start.bat` de denetler. Daha yeni bir sürüm varsa **Şimdi güncellensin mi? [Y/N]** diye sorar. Güncellemek için `Y`'ye basın. `N`'ye basın ya da 60 saniye yanıtsız bekleyin; sahip olduğunuz sürümü başlatır.

![Şimdi güncelle ve Daha sonra düğmeleriyle güncelleme bildirimi](../assets/img/en/updates-notice.webp)

Kendi değişikliklerinizi içeren bir kopya asla sizin yerinize güncellenmez; kutu yalnızca bir güncellemenin beklediğini söyler ve değişikliklerinizi kaydetmenizi ya da saklamanızı ve `git pull` çalıştırmanızı önerir. Git ile kurulmamış bir kopya (örneğin bir zip dosyası) hiçbir şey göstermez.

Denetimin nasıl çalıştığı, adım adım:

```
sayfa ---(4 sn sonra, sonra her 6 saatte)---> geliştirme sunucusu ---> git fetch
   geride mi?  hayır -> hiçbir şey gösterilmez
              evet -> kendi değişiklikleriniz ya da kayıtlarınız var mı?  evet -> yalnızca bildirir
                                                                      hayır -> [Şimdi güncelle] -> git pull
                                                                              -> yeniden yükle ya da "restart.bat çalıştırın"
```

## Güvenlik kuralları {#the-safety-rules}

- **Yalnızca ileri sarma** (`git pull --ff-only`): bir güncelleme hiçbir şeyi birleştirmez, yeniden taban almaz ya da yeniden yazmaz.
- **Yerel değişiklik yok**: izlenen dosyalarda kaydedilmemiş değişiklikleri olan bir kopya (`git status --porcelain --untracked-files=no` boş değil) asla otomatik güncellenmez - birinin kendi çalışması, bir güncellemenin üzerine yazacağı bir şey değildir. Yalnızca bir güncellemenin beklediği söylenir. İzlenmeyen dosyalar (veriler, dışa aktarmalar) değişiklik sayılmaz.
- **Yerel kayıt yok**: üst akışta olmayan kayıtları olan (ayrılmış) bir kopya güncellenmez - ileri sarma onu getiremez ve birleştirme elle `git pull` içindir. Sayfa ve `start.bat` bunu aynı sözcüklerle söyler; `start.bat` orada olan sürümü başlatır.
- **Yalnızca sayfanın kendisinden**: geliştirme sunucusunun güncelleme isteği özel bir üstbilgi taşımalı ve bir `Origin` gönderildiğinde, sunucunun kendi ana bilgisayarından gelmelidir (aşağıya bakın).
- Yalnızca bir üst akış dalı olan bir git kopyası güncellenir; diğer her şey (`.git` olmayan bir kopya, git yüklü değilse, statik bir derleme) olduğu gibi bırakılır ve hiçbir şey söylemez.

## start.bat ne yapar {#what-startbat-does}

`start.bat` (çift tıklayın; pencere sunucudur) sırayla şunu yapar:

1. Node.js'i bulur - `PATH` üzerinde, yoksa `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` ya da `%LOCALAPPDATA%\Programs\nodejs` içinde - ve yoksa `winget install -e --id OpenJS.NodeJS.LTS` ile kurmayı önerir (sorulur, Y/N; sonrasında Windows yeni `PATH`'i alsın diye pencerenin yeniden açılması gerekir).
2. git yüklüyse ve klasörde `.git` varsa **güncellemeleri** denetler:
   - `git fetch --quiet` (ağ yoksa ya da üst akış yoksa sessizce atlanır);
   - `git rev-list --count HEAD..@{u}` sayar; geride değilse hiçbir şey söylenmez;
   - yerel değişiklikler varsa: "3DHeat'in daha yeni bir sürümü var (N değişiklik), ancak bu kopyada yerel değişiklikler var, bu yüzden güncellenmiyor. Bunları kaydedin ya da saklayın, sonra git pull çalıştırın." - ve orada olan sürümü başlatır;
   - kendi kayıtları varsa (`git rev-list --count @{u}..HEAD` 0'dan farklı): "3DHeat'in daha yeni bir sürümü var (N değişiklik), ancak bu kopyanın en yeni sürümde olmayan kendi kayıtları var, bu yüzden güncellenmiyor. git pull ile güncelleyin." - ve orada olan sürümü başlatır;
   - aksi halde "3DHeat'in daha yeni bir sürümü var (N değişiklik)." ve **Şimdi güncellensin mi? [Y/N]** sorusu. `N`, ya da 60 saniye yanıt yoksa "Güncellenmedi; sahip olduğunuz sürüm başlatılıyor." yazılır ve orada olan sürüm başlatılır. `Y`'de: "Güncelleniyor...", `package.json` ya da `package-lock.json` değişiyorsa bunu not eder, `git pull --ff-only` çalıştırır (hâlâ başarısız olursa - örneğin ağ - "Güncelleme tamamlanmadı; sahip olduğunuz sürüm başlatılıyor."), sonra `git submodule update --init` (sabitlenmiş araçlar, bkz. [Belgelerin bakımı](maintaining.md#the-tools-under-exporters)), paket dosyaları değiştiyse ve `node_modules` varsa `npm install`, ve "Güncellendi." yazar.
3. İkinci bir sunucuyu başlatmayı reddeder: **5273** bağlantı noktasını zaten bir şey dinliyorsa bunu söyler ve `restart.bat` / `stop.bat`a işaret eder.
4. İlk çalıştırmada (`node_modules` yoksa), bağımlılıkları indirmeden önce sorar (`node_modules\` içine yaklaşık 300 MB, sisteme hiçbir şey kurulmaz).
5. `127.0.0.1:5273` adresinde geliştirme sunucusunu başlatır (`--strictPort`) ve hazır olduğunda tarayıcıyı açar.

`restart.bat` sunucuyu durdurur (bağlantı noktasına göre) ve `start.bat`ı yeniden çalıştırır; yani aynı soruyu sorar. `stop.bat` yalnızca durdurur.

## Geliştiriciler için {#for-developers}

### Çalışırken: güncelleme yolu {#while-it-runs-the-update-route}

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
