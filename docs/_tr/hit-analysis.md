---
title: "İsabet analizi (Araçlar sekmesi)"
parent: "Tekrar"
nav_order: 4
lang: "tr"
source: "hit-analysis.md"
source_hash: "8e9221927522"
translated: true
outdated: false
---

# İsabet analizi

**Araçlar** sekmesi, tek bir tankın, geminin ya da askerin nerede vurulduğunu ve kim tarafından vurulduğunu gösterir. Bir tankın hangi tarafının vurulduğunu ya da hasarı hangi düşmanın verdiğini görmek için kullanın.

## Deneyin {#try-it}

1. İsabetleri olan bir maç yükleyin (hangi oyunların isabet verdiği için aşağıdaki tabloya bakın).
2. Üstteki **Araçlar** sekmesini açın.
3. **Araç** altında bir birim seçin, örneğin bir tank türü. Parantez içindeki sayı, kaç isabet aldığını gösterir.
4. Figüre bakın: her işaret bir isabettir ve çarptığı yere konmuştur.
5. Kimin vurduğunu görmek için **Kim vurdu**yu açın: atıcılar, silahlar ya da atıcı araçlar; isabetler, hasar, öldürmeler ve mesafeyle birlikte.

![Araçlar sekmesi: isabet işaretli bir demo tankı ve açık Kim vurdu](../assets/img/en/hit-analysis-tank.webp)

Hiçbir şey yüklü değilse ya da veride araçlara isabet yoksa, sekme neyin eksik olduğunu ve hangi dönüştürücünün kullanılacağını söyler.

```
        shooter ----> o  hit mark on the figure
        shooter ----> o
  [ tank figure ]
```

Figür, veri bir nokta ya da bir vücut parçası verdiğinde isabetleri gösterir. Döküm (kim vurdu, neyle, ne kadar sert, hangi mesafeden) her kaynak için çalışır.

## Her kaynak ne verir {#what-each-source-gives}

| Kaynak | Birim üzerindeki nokta | Atıcı | Silah | Hasar / sonuç |
|---|---|---|---|---|
| War Thunder | evet, birimin çerçevesinde, atışın yönüyle | evet | atıcının aracı | kritik, ağır, modüller yok edildi, öldürücü atış |
| CS2 | vücut parçası (hitgroup) | evet | evet | hasar, zırh, kalan can |
| World of Tanks | evet (bileşen kutusu, giriş ve çıkış) | evet | - | hasar ya da hiçbiri (sekme, delinme yok) |
| World of Warships | evet, geminin çerçevesinde | evet | isabet türü | - |
| Squad | araçlar: evet - darbe, aracın kendi konumundan ve yönünden aracın çerçevesine yerleştirilir | hayır (veri hiçbirini adlandırmaz) | hasar türü | o andaki aracın canının düşüşü, yok edildi |
| Squad askerleri | hayır: isabet sonuçları (kemik ve darbe noktası) dönüştürücü tarafından ham olarak tutulur; `hitBone` içeren `impact` satırları yazılır yazılmaz okunur | | | yalnızca yaralar ve ölümler |
| Arma (OCAP, Arma 3 kaydedicisi) | hayır: OCAP kimin kimi vurduğunu ya da öldürdüğünü, neyle ve hangi mesafeden kaydeder, nereden değil | evet | evet | isabet ya da öldürme, mesafe |
| Tacview ACMI | bir silah nesnesi bir birimin 30 m içinde bittiğinde evet (fırlatıcı değil): birimin çerçevesindeki son yeri (yaw, pitch, roll), uçtuğu yönden gelerek | silahın `Parent`'ı | silahın adı, ya da bir Timeout'un AmmoType'ı | Timeout'un Outcome'u, `Health` düşüşleri, `Destroyed`; silah yoksa, bir nokta olmadan öldürme ya da hasar |
| IL-2 telemetrisi (Watcher) | evet: `hit` / `damage` olayları noktayı oyuncunun kendi uçağının çerçevesinde taşır (x ileri, y yukarı, z sağ olarak alınır) | hayır | hayır | kuvvet |
| Dota 2 | hayır: savaş günlüğünün bir kahramanda yeri yoktur | saldıran birim | yetenek ya da eşya (yoksa: bir saldırı) | hasar, kahramanın ölümü |
| Battlefield 6 (GameCapture) | hayır: yakalama isabetleri değil, öldürme akışını (öldürmeler, ölümler, kafa bayrağı) okur | | | |
| DCS / diğer Watcher canlı kaynakları | Tacview kayıtlarında tutulanın ötesinde isabet olayı yok | | | |

Bir birimin hiçbir isabetinin bir noktası yoksa figür hiçbir işaret göstermez ve **Kim vurdu** dökümü kendiliğinden açılır: atıcıya, silaha ya da atıcının aracına göre; her biri isabetleri, hasarı ve öldürmeleri ile birlikte, ayrıca ortanca ve en uzak mesafeyle.

## Bir alanla sınırla {#restrict-to-an-area}

**Alan** bölümü analizi, haritada bir yerde olan isabetlerle sınırlar.

1. **Dikdörtgen çiz** ya da **Çokgen çiz** düğmesine basın ve 3B zeminde ya da taktik haritada çizin.
2. **Kurban içeride** (vurulan birim alanda olduğunda bir isabet sayılır) ya da **Atıcı içeride** (ateş eden alandayken) seçin.
3. **Filtre olarak kullan** düğmesine basın. Çipler "{n} / {total} isabet alanda" yazar.
4. **Alanı sıfırla** tüm alanları kaldırır.

Her alan bir [hacimdir](volumes.md), bu yüzden aynı şekiller ısı haritasını ve tekrarı da süzer. Bir alan dahil edebilir ya da dışarıda bırakabilir (dışarıda bırakan bir alan, isabetlerini dışarıda bırakır ve "{n} / {total} isabet alanın dışında" olarak gösterilir). Her alan, birimin kaç isabetinin içinde olduğuyla birlikte bir çip olarak görünür; çipteki × onu kaldırır. Sayılar, figür, döküm ve filtre listeleri hepsi bunu izler.

Bir isabetin yerleri: ondan çıktığı satır bir tarafın yerini tutar (bir yaralanma ya da çarpma için kurbanın, bir atış için atıcının); diğerinin yeri, o birimin zamanca en yakın kendi örneğidir (5 s içinde). Bir alan süzerken, tarafın yeri bilinmeyen bir isabet dışarıda bırakılır ve panel kaç tane olduğunu söyler ("Dışarıda bırakıldı, bilinen yer yok").

## Geliştiriciler için {#for-developers}

Herhangi bir dönüştürücü isabet ekleyebilir: `hitBone` (bir iskelet kemiği, bir Arma seçimi, bir Reforger isabet bölgesi - kafa, göğüs, karın, kollar ve bacaklara eşlenir) ya da `hitLocalX/Y/Z` (metre, x ileri, y yukarı, z sağ) ile birlikte bir kurbanın satırı (`hit`, `impact`, `hurt`, `wounded`); `other` atıcıyı ve `damage` hasarı gösterir.
