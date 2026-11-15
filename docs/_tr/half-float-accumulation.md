---
title: "Yarım kayan noktalı birikim"
parent: "Çizim iç yapısı"
nav_order: 4
lang: "tr"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Yarım kayan noktalı birikim

Bazı grafik kartları ısıyı yalnızca küçük 16 bitlik sayılarda tutabilir; bu da en sıcak yerleri kesebilir ya da yuvarlayabilir. Görüntüleyici sayıları ölçeklendirir, böylece bu görünmez. Sizin bir şey yapmanız gerekmez; bu sayfa geliştiriciler içindir.

## Geliştiriciler için {#for-developers}

32 bitlik kayan nokta dokularına karışamayan bir aygıt (WebGPU'da `float32-blendable` ve `float32-filterable` yok, WebGL2'de `EXT_float_blend` yok) **16 bitlik kayan nokta** (`r16float`) ısı hedefi alır: en fazla 65.504 ve 11 bit mantis. Yoğun bir alan birkaç yüz bine ulaşır; bu yüzden 16 bitlik bir hedef hem **keser** hem **yuvarlar** ve yuvarlama hatası değerle birlikte büyür. Bu çok belirgin bir biçimde görünür: en yoğun alanlar olduklarından çok daha serin okunur, seyrek alanlar ise iyi görünür. Bunu iki mekanizma ele alır; resim yalnızca ikisi de çalışırsa doğrudur.

### Aralık: her splat üzerinde bir kazanç {#range-a-gain-on-every-splat}

Her splat bir **kazanç** ile çarpılır ve bileşim bunu geri böler; böylece alan, yarım kayan noktaların iyi işlediği büyüklükte durur ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = bu veri kümesi, yarıçap ve merkez yoğunluğu için analitik doygunluk tahmini
gain     = 2 ^ round(log2(2048 / estimate)),  üs -20..20 aralığına sıkıştırılır
```

2048, 65.504'e ulaşmadan önce rampanın tepesinin üstünde yaklaşık 32 kat pay bırakır. Kazanç bir **ikinin kuvvetidir**; bu yüzden tahmindeki küçük bir kayma onu ve biriken tamponu değiştirmez. Ayrıca [geometri imzasının](accumulation.md#what-restarts-it) bir parçasıdır; böylece bir değişiklik birikimi yeniden başlatır.

Analitik tahmine bağlıdır ve bilerek doygunluk noktasına **bağlanmaz**. Doygunluk bileşimde tam bu yüzden uygulanır: onu sürüklemek yakınsamayı asla yeniden başlatmaz. Kazanç onunla birlikte hareket etseydi, tampon hâlâ eski kazançta yazılmış değerleri tutardı, bileşim ise yenisine bölerdi; iki hata tam olarak birbirini götürür ve kaydırıcı hiçbir şey yapmıyormuş gibi görünürdü.

32 bitlik bir hedefte kazanç her zaman 1'dir.

### Hassasiyet: sıfırdan kısmi kareler {#precision-partial-frames-from-zero}

1/n ağırlıkla biriktiriciye birleştirilen bir kare, doğrudan 1/n ağırlıkla biriktiriciye splat edilmek yerine önce **geçici bir hedefe** sıfırdan splat edilir ve sonra karıştırılır ([Birikim](accumulation.md#why-each)). Doğrudan yapılsaydı, her sprite'ın katkısı eklendiği çalışan toplamın 1/n'i kadar olurdu ve yarım kayan nokta bunları yuvarlayıp yok ederdi; piksel ne kadar yoğunsa o kadar kötü. Sıfırdan yapılınca her eklenen, katıldığı toplamla karşılaştırılabilir olur; bu, tek bir karenin zaten yaptığı aritmetiğin aynısıdır.

### Ölçülen etki {#measured-effect}

Yoğun bir yapay sahnede, alanı eşleşen birimlerde okuyarak:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bit (referans) | 6051 | 60742 | 121199 | 232744 |
| 16 bit önce | 1372 | 6972 | 7840 | 7840 |
| 16 bit sonra | 5996 | 59666 | 118824 | 210357 |

Tepe değeri 30 kat düşükten 0,90 kata çıktı; bileşik kare, ortalama parlaklığın %0,1'i kadar 32 bitlik kareyle eşleşiyor.

### Sınama {#testing-it}

`?heat=f16` bu yolu her arka uçta zorlar; bir anahtar olmadan, yalnızca zayıf GPU'ların çalıştırdığı aritmetik, onları çalıştıran insanlar dışında hiç sınanmazdı. `npm run smoke:f16` tüm tarayıcı paketini bununla çalıştırır.

Okumalar kazancı geri alır: otomatik pozlama okunan alanı ona böler ve `engine.readHeatProbe()` onu oluşturucuya iletir; [cetvelin canlı ısı okuması](measure.md#notes) da bu şekilde okunur.
