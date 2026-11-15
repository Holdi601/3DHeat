---
title: "Diller"
nav_order: 17
lang: "tr"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# Diller

Görüntüleyici sizin dilinizi konuşabilir: her düğme, ipucu ve mesaj ile yarış ve maç analizinin her cümlesi, seçtiğiniz dilde gösterilir. 40 dil bilir ve tarayıcınızın dilini destekliyorsa onunla başlar.

Avrupa'nın resmi dillerinin hepsi burada: AB'nin 24 resmi dili; ayrıca Norveççe, İzlandaca, Ukraynaca, Rusça, Belarusça, Sırpça, Boşnakça, Makedonca, Arnavutça, Türkçe, Lüksemburgca ve Katalanca. Buna Japonca, Korece ve Çincenin basitleştirilmiş ve geleneksel biçimleri eklenir. Tam liste: [Dil listesi](ref-languages.md).

İngilizce, diğer her dilin çevrildiği kaynaktır ve eksik bir mesaj için geri dönülen dildir.

## Dili değiştirin {#change-the-language}

1. Kenar çubuğunun üstündeki adın yanındaki açılır listeyi açın. İlk girdisi **Otomatik - <dil>** (tarayıcınınki, şu anda algılanan); ardından her dil kendi adıyla yer alır, böylece gösterilen dili okuyamasanız bile kendi dilinizi bulabilirsiniz.
2. Birini seçin. Hemen değişir ve bu tarayıcıda saklanır. Seçimi unutmak için *Otomatik* seçin.

Gizli bir pencerede ya da depolama engellenmişse seçim, sayfa kapanana kadar geçerli kalır.

Dili değiştirmek şunları yapar:

- her etiket, ipucu ve mesaj yeni dilde yeniden çizilir;
- yarış analizi yeni dilde **yeniden hesaplanır** (cümleleri, sonradan çevrilmek yerine ölçümlerden oluşturulur), demo turları yeniden adlandırılır ve grafikler yeniden çizilir;
- sayılar, listeler ve çoğul biçimler yeni dili izler.

## Hangi dille başlar {#which-language-it-starts-in}

1. Bu tarayıcıda **seçilmiş** dil, varsa (`localStorage` içinde `heat3d.language` anahtarıyla saklanır).
2. Yoksa **tarayıcının** dili: görüntüleyicinin konuştuğu ilk `navigator.languages` değeri. Bir etiket, dil kısmıyla eşleştirilir (`de-AT` → `de`) ve şu takma adlar geçerlidir: `nb` ve `nn` → Norveççe (`no`); `zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` ve `Hant` yazısı olan her etiket → geleneksel Çince; `zh-Hans`, `zh-CN`, `zh-SG` ve diğer `zh` → basitleştirilmiş Çince; `cnr` (Karadağca) → Sırpça.
3. Bunlar yoksa **İngilizce**.

Sayfanın `<html lang>` değeri, konuşulan dile ayarlanır.

## Sayılar, listeler ve çoğullar {#numbers-lists-and-plurals}

Görüntüleyicinin metnindeki sayılar, listeler ve çoğullar dilin kendi yazım biçimiyle yazılır ("3.5" ya da "3,5", "a, b ve c"). İngilizceden uzun etiketler, kenar çubuğundan taşmak yerine, dilin izin verdiği yerde tireyle bölünerek kaydırılır. Çok uzun grafik satır adları üç noktayla kısaltılır ve üzerine gelindiğinde tamamı gösterilir.

Bir kutuya yazdığınız sayılarda nokta ya da virgül kullanabilirsiniz.

## Çevirmenler ve geliştiriciler için {#for-translators-and-developers}

Kod: [`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
([`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts),
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts),
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)),
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx).

### Sayılar, listeler ve çoğullar nasıl yazılır {#how-numbers-lists-and-plurals-are-written}

- Ondalıklı **sayılar** (`num`) dilin ondalık işaretini kullanır ve **basamak gruplaması yapmaz** - 3108 m'lik bir mesafe her dilde tek bir sayı olarak kalır.
- Sayım ya da boyut olan **tam sayılar** (`int`) dilin basamak gruplamasını kullanır.
- **Listeler** (`list`) dilin kendi biçiminde birleştirilir: "a, b ve c", "a, b veya c", ya da dilin kendi ayırıcısıyla art arda (`common.listSeparator` mesajı: İngilizcede ", ", Japoncada ve iki Çincede "、").
- **Çoğullar**, `Intl.PluralRules` aracılığıyla dilin kendi kurallarını izler (`one`, `two`, `few`, `many`, `other`).
- `Intl`'e verilen yerel, dilin etiketidir; yalnızca etiketin tek başına başka bir ülkenin kurallarını getireceği yerlerde farklıdır: Portekizce `pt-PT` (Brezilya'nın çoğulu 0'ı bir sayar), Norveççe `nb`, basitleştirilmiş Çince `zh-CN`, geleneksel Çince `zh-TW`.

### Kataloglar {#the-catalogs}

`src/i18n/locales/<dil>/<parça>.json`, görüntüleyicinin her parçası için bir dosya; aynı parçalar her dilde bulunur.

Görüntüleyicinin her parçası için bir dosya vardır (bugün 30 tane; örneğin `app.json`, `heat.json`, `match.json`, `race-text.json`, `units.json`) ve her dilde aynı küme bulunur. Klasör hepsini listeler.

Her dosya düz bir JSON nesnesidir: anahtar tam olarak yazılır (`"race.ui.laps.load"`), mesaj değer olarak yazılır. İngilizce görüntüleyiciyle birlikte paketlenir; diğer her dil seçildiğinde indirilir.

**Arama:** geçerli dilin mesajı, yoksa İngilizce mesaj, yoksa anahtarın kendisi (geliştirme sürümünde konsol "i18n: no message …" uyarısı verir). Biçimlendirilemeyen bir mesaj İngilizceye geri döner; böylece bozuk bir çeviri görüntüleyiciyi asla bozmaz.

#### Mesaj sözdizimi {#the-message-syntax}

Görüntüleyicinin kullandığı ICU mesaj sözdiziminin parçası:

| Biçim | Örnek | Anlamı |
|---|---|---|
| `{name}` | `{file} has no rows` | verilen haliyle konulan bir değer |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | dilin çoğul kurallarına göre sayı için dal, ya da tam `=0`, `=1` …; `#` sayının dilin kendi biçimiyle yazılmış hâlidir |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | bir kelime için dal |

Dallar iç içe geçebilir ve her `plural` ile `select` bir `other` dalına sahip olmalıdır. Tam ICU'nun aksine, bir **kesme işareti yalnızca bir kesme işaretidir** - araba adları ve İngilizce iyelik ekleri bunlarla doludur, bu yüzden hiçbir şeyin tırnak içine alınması gerekmez. Değişmez bir `{` ya da `}` yazılamaz.

Bir çevirinin korumak zorunda olduğu değerler içeren mesajlar: süslü parantezler içindeki adlar kod tarafından doldurulur; bir `select`'in kelimeleri, kodun seçtiği kelimelerdir (`crash`, `onto-straight`, `yes`/`none`) ve İngilizcedeki gibi kalmalıdır; çoğul kategorileri farklı olabilir (bir dil kendi kategorilerini kullanır: Lehçede `one`, `few`, `many`, `other`; Japoncada yalnızca `other`).

### Çeviriler nasıl yapıldı ve testler {#how-the-translations-were-made-and-the-tests}

Çeviriler, yarış terimlerinden oluşan bir sözlükle, İngilizceden bir yapay zekâ modeliyle yapıldı; yarış metinleri değerler doldurulmuş hâlde ikinci kez okundu. Ana dili konuşanların düzeltmeleri memnuniyetle karşılanır (aşağıya bakın).

`src/i18n/i18n.test.ts` şunları denetler:

- kodun istediği her mesajın İngilizcede var olduğunu - her `t('…')` çağrısını ve bir tabloda tutulup daha sonra `t()`'ye verilen her anahtarı (bir parça adıyla başlayan anahtarlar, örneğin `app.` ya da `heat.`);
- koddan parçalar halinde oluşturulan mesajların var olduğunu: her hatanın `label`, `short`, `count` ve `here` mesajlarını, her araba karşılaştırma özelliğini, her kanalın etiketini;
- her mesajın, her dilde **ayrıştırılabildiğini**;
- her çevirinin İngilizce mesajın **değerlerini ve seçimlerini koruduğunu** (eklenmiş ya da kaybolmuş değer yok; her `select` kendi kelimelerini korur);
- her dilin **her** İngilizce mesaja sahip olduğunu ve çevrilmiş dillerin kümesinin tam olarak yukarıdaki liste olduğunu;
- bir mesajın seçilen dilde söylendiğini ve İngilizceye geri döndüğünü.

### Bir çeviriyi düzeltmek {#correcting-a-translation}

Ana dili konuşan birinin düzeltmeleri memnuniyetle karşılanır - her biri tek satırlık bir JSON'dur.

1. Mesajı bulun: İngilizce kataloglarda (`src/i18n/locales/en/`) gördüğünüz metni arayın (İngilizceyi okumak için seçiciyi İngilizceye çevirin) ve anahtarını not edin.
2. Aynı parçayı kendi dilinizde açın, örneğin `src/i18n/locales/de/race-ui.json`, ve o anahtarın değerini değiştirin. Her `{name}` öğesini koruyun, `select` kelimelerini koruyun, dilinizin ihtiyaç duyduğu çoğul dallarını yazın:

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. `npm test` komutunu çalıştırın (ya da yalnızca `npx vitest run src/i18n`): testler, bir değerin ya da seçimin kaybolup kaybolmadığını ya da bir mesajın artık ayrıştırılamayıp ayrıştırılamadığını söyler.
4. Geliştirme sunucusu çalışırken değişiklik, dili değiştirdikten sonra (ya da sayfayı yeniden yükleyince) görünür.

**Bir mesaj eklemek** (kodda): önce İngilizce parçaya, sonra diğer her dile ekleyin (her biri sahip olana kadar testler başarısız olur).

**Bir dil eklemek**: `languages.ts` içindeki `LANGUAGES` listesine ekleyin (BCP 47 etiketi ve kendi adı; gerekirse bir takma ad ya da bir `Intl` yereli), ve tüm parçalarla birlikte bir `src/i18n/locales/<etiket>/` klasörü oluşturun.
