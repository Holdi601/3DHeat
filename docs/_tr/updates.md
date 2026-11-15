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
3. İkinci bir sunucuyu başlatmayı reddeder: **5273** bağlantı noktasını zaten bir şey dinliyorsa bunu söyler ve `restart.bat` / `stop.bat`'a işaret eder.
4. İlk çalıştırmada (`node_modules` yoksa), bağımlılıkları indirmeden önce sorar (`node_modules\` içine yaklaşık 300 MB, sisteme hiçbir şey kurulmaz).
5. `127.0.0.1:5273` adresinde geliştirme sunucusunu başlatır (`--strictPort`) ve hazır olduğunda tarayıcıyı açar.

`restart.bat` sunucuyu durdurur (bağlantı noktasına göre) ve `start.bat`'ı yeniden çalıştırır; yani aynı soruyu sorar. `stop.bat` yalnızca durdurur.

## Geliştiriciler için {#for-developers}

### Çalışırken: güncelleme yolu {#while-it-runs-the-update-route}

Geliştirme sunucusu (`vite.config.ts` içindeki `heat3d-self-update` Vite eklentisi) `/__heat3d/update` yolunu sunar. Yalnızca geliştirme sunucusunda vardır - statik bir derlemede ya da `vite preview`da yoktur.

**`GET /__heat3d/update`** kopyanın geride olup olmadığını yanıtlar:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- klasör bir git kopyası değilse `checkout: false`;
- en fazla **30 dakikada bir** `git fetch --quiet` çalıştırır (aradaki sorgular son getirilenden yanıt verir);
- `behind` / `ahead` değerleri `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`'den, `dirty` `git status --porcelain --untracked-files=no`'dan, `latest` üst akışın en yeni kaydının konusundan gelir;
- üst akış dalı yoksa `upstream: null` ve `behind: 0`.

**`POST /__heat3d/update/apply`** kopyayı günceller:

1. İstekte `X-Heat3d-Update: 1` üstbilgisi yoksa ya da bir `Origin` taşıyorsa ve o origin'in ana bilgisayarı isteğin `Host`'u değilse `403 { ok: false, reason: "forbidden" }` ile reddedilir. Siteler arası bir form, bu sunucunun hiç vermediği bir CORS ön denetimi olmadan özel bir üstbilgi gönderemez.
2. Yapılacak bir şey yoksa (git kopyası değil, üst akış yok, geride değil): `{ ok: true, updated: false }`.
3. Yerel değişiklikler: `{ ok: false, reason: "dirty" }`; yerel kayıtlar: `{ ok: false, reason: "diverged" }`.
4. Aksi halde: değişecek dosyaları not eder (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (2 dk zaman aşımı), `git submodule update --init` (hatası yok sayılır), `package.json` ya da `package-lock.json` değiştiyse `npm install` (15 dk zaman aşımı) çalıştırır ve `{ ok: true, updated: true, restart }` yanıtını verir. `restart`, çalışan sunucunun güncellemeyi neden alamadığını söyler: bağımlılıklar yeniden kurulduysa `"dependencies"`, yalnızca bir `vite.config` dosyası değiştiyse `"config"`, yeniden başlatma gerekmiyorsa `false`.
5. Başarısız bir git ya da npm komutu `{ ok: false, reason: "<hata, en fazla 300 karakter>" }` yanıtı verir.

Yanıtlar `Cache-Control: no-store` başlıklı JSON'dur. Sunucu yalnızca `127.0.0.1` üzerinde dinler; bu yüzden yol ağdan erişilemez.

### Sayfadaki bildirim {#the-notice-in-the-page}

`UpdateBanner`, kenar çubuğunun üstünde adın altında:

- Sayfa yüklendikten **4 saniye** sonra yola sorar (ilk saniyelerde değil: sayfanın yüklenecek bir veri kümesi ve başlatılacak bir GPU'su vardır) ve sayfa açık kaldığı sürece **her 6 saatte bir** yeniden sorar.
- Böyle bir yol yoksa (statik derleme), klasör bir kopya değilse ya da hiçbir şey daha yeni değilse **hiçbir şey** göstermez - her açılışta bir bildirim, insanların görmezden gelmeyi öğrendiği bir şeydir.
- Geride, yerel değişiklik yokken: "3DHeat'in daha yeni bir sürümü var (N değişiklik, en yenisi: <konu>)." ve **Şimdi güncelle** ile **Daha sonra** düğmeleri (*Daha sonra* sayfa yeniden yüklenene kadar gizler).
- Geride, yerel değişikliklerle: aynı cümle ve "Bu kopyada yerel değişiklikler var, bu yüzden otomatik güncellenmiyor; bunları kaydedin ya da saklayın, sonra git pull çalıştırın." - düğme yoktur.
- **Şimdi güncelle** `/apply` adresine gönderir ("Güncelleniyor..."). Sonra:
  - "Güncellendi. Sayfa yeniden yükleniyor." - ve 1,5 sn sonra yeniden yükler (sunucu zaten yeni dosyaları sunar);
  - bağımlılıklar yeniden kurulduysa: "Güncellendi. Bağımlılıkları değişti: sunucu penceresini kapatın ve bitirmek için **restart.bat** çalıştırın.";
  - yalnızca sunucunun ayarları değiştiyse: "Güncellendi. Sunucu ayarları değişti: sunucu penceresini kapatın ve bitirmek için **restart.bat** çalıştırın.";
  - sonuçta getirilecek bir şey yoksa (`updated: false` - kopya bu arada, örneğin `start.bat` tarafından getirilmiş): "Güncellenecek bir şey yok: bu kopya zaten en yeni sürüm." - ve yeniden yükleme yok;
  - reddedildi: *yerel değişiklik* cümlesi ya da "Bu kopyanın en yeni sürümde olmayan kendi kayıtları var; git pull ile güncelleyin." ya da "Güncelleme tamamlanmadı: <neden>".
