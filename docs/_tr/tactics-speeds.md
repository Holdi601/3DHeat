---
title: "Hareket hızları"
parent: "Taktik tahtası"
nav_order: 1
lang: "tr"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Hareket hızları

Bir asker, bir tank ya da bir jet A'dan B'ye ulaşmak için ne kadar süre alır? Bu sayfa, her figürün [taktik tahtasında](tactics-board.md) ne kadar hızlı hareket ettiğini ve bu sayıların nereden geldiğini anlatır; böylece planınızdaki süreleri güvenle kullanabilir ya da değiştirebilirsiniz.

[Taktik tahtası](tactics-board.md) bir planın süresini, her figürün ne kadar hızlı hareket ettiğinden hesaplar. Hızlar, `src/tactics/speeds/` içinde her oyun için bir dosyadan gelir: her sınıfın (piyade, kara araçları, tekneler, uçaklar, helikopterler) her hareket modu için bir hız, ayrıca her CS2 silahı ya da her uçak türü gibi adlandırılmış profiller. Her dosya kaynaklarını listeler ve her değer, **resmi** (oyunun kendi verisi ya da gerçek bir uçağın yayımlanmış değerleri) ya da **yaklaşık** (topluluğun ölçtüğü ya da tipik bir değer) olup olmadığını söyler.

Bunlar başlangıç noktalarıdır. **Her figür hızlarını tahtada geçersiz kılabilir**; bu yüzden bir plan ölçülmüş bir hız, yüklü bir asker ya da hasarlı bir tank kullanabilir.

## Modlar {#modes}

| Sınıf | Modlar |
|---|---|
| Piyade | sürünme (yüzüstü), çömelme, yürüme (yavaş, sessiz yürüyüş), koşma (varsayılan hareket), sprint |
| Kara araçları, tekneler | sürünme, temkinli, normal (arazide), hücum (yol azami hızı) |
| Uçaklar, helikopterler | yavaş (yaklaşma, dönüş, asılı uçuş), seyir, muharebe (köşe hızı ya da saldırı koşusu), azami |

Oyunda olmayan bir mod boş bırakılır: CS2 ve Valorant'ta sprint ve yüzüstü sürünme yoktur.

## Yamaçlar {#slopes}

Her dosya ayrıca oyunun yamaçları nasıl ele aldığını da söyler. CS2, Valorant ve Squad yatay hızı sınırlar, bu yüzden bir yamaç oyuncuyu yavaşlatmaz. Arma piyadeyi yamaçlarda yavaşlatır; bu yüzden onun dosyası ve genel olan Tobler'in yürüyüş fonksiyonunu kullanır. Battlefield ve araç simülasyonları düz bir eğim cezası kullanır.

## Oyuna göre {#per-game}

**Counter-Strike 2** (saniyede birim; bir birim bir inç kabul edilir). **Resmi.** Koşma hızları, oyunun silah tanımlarındaki `m_flMaxSpeed` değerleridir: bıçak ve C4 250, bombalar 245, tabancalar 240 (Desert Eagle 230, R8 180), SMG'ler 220 ila 240, tüfekler 210 ila 225, AWP 200, hafif makineli tüfekler 195 ve 150. Dürbünlü AWP (100), AUG ve SG 553 (150) ile G3SG1 ve SCAR-20 (120) kendi profillerine sahiptir. Yürüme, koşmanın × 0,52'si; çömelme, koşmanın × 0,34'üdür. Valve bu iki çarpanı yayımlamaz, ama her silah demo kayıtlarında bunları gösterir. Bir planı gerçek harekete karşı kontrol etmek için aynı haritada bir demo yükleyin ve oyuncuların hızlarını karşılaştırın.

**Valorant** (m/s). Bıçak 6,75 m/s ile koşar. Her silah bunu, oyun verisinden aldığı koşma hız çarpanıyla çarpar; bu da oyun içi Arsenal'in gösterdiği hızları verir: çoğu yan silah ve SMG için 5,73, tüfekler için 5,4, ağır silahlar ve Operator için 5,13, pompalı tüfekler için 5,06. Bu koşma hızları kesindir. Yürüme ve çömelme hızları **tahminlerdir** (koşmanın 0,55 ve 0,4 katı), çünkü Riot bunları yayımlamaz. Dürbünlü keskin nişancı profilleri de tahmindir.

**Battlefield** (km/sa). **Yaklaşık.** EA hareket sayıları yayımlamaz. Piyade: yüzüstü yaklaşık 1 m/s, çömelmiş 2, koşarken 4 ve sprint'te 6,4. Araçlar, jetler, helikopterler ve tekneler, sınıflarının tipik oyun içi hızlarını alır.

**Squad** (km/sa). **Yaklaşık.** Koşma (3,3 m/s) ve sprint (5,9 m/s), oyun mekaniklerine dair topluluk yazısından alınmıştır. Sürünme, çömelme ve yavaş yürüme tahminlerdir; her araç sınıfı ve helikopter de öyledir.

**Arma** (km/sa). **Yaklaşık.** Piyade tempoları topluluk zamanlamalarıdır: yürürken yaklaşık 5 km/sa, çömelmiş taktik tempoda 9 km/sa, koşarken 15 km/sa ve sprint'te yaklaşık 21 km/sa. Araç azami hızları, üçüncü taraf bir listeden alınan, her sınıftaki vanilya Arma 3 araçlarının yapılandırılmış azami değerleridir. Daha yavaş araç modları tahmindir.

**DCS / War Thunder / IL-2** (km/sa). Paletteki her uçağın ve helikopterin kendi profili vardır. Seyir ve azami hızlar, gerçek uçakların **yayımlanmış değerleridir**; simülasyonlar bunları yakından modeller. Azami hız, jetlerde deniz seviyesinde, pervaneli uçaklarda ise derecelendirilmiş irtifada alınır; her profilin notu hangisi olduğunu söyler. Yavaş ve muharebe hızları tipik değerlerdir. Kara araçları, gerçek araçların yayımlanmış yol hızlarını yuvarlanmış olarak kullanır (**yaklaşık**). Gemiler, sınıflarının yayımlanmış azami hızlarını kullanır.

**Diğer** (m/s). **Yaklaşık** gerçek dünya varsayılanları: sürünme 0,5, çömelme 1,5, yürüme 1,4, koşma 3,5, sprint 6.

## Kaynaklar {#sources}

Counter-Strike 2
- [CS2 silah tanımları (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB silah sayfaları](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Hareket mekanikleri](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com silahları (koşma hızı çarpanları)](https://valorant-api.com/v1/weapons)
- [VLR.gg: bıçak hızı 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot destek: Yürüme, koşma ve çömelme](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA forumları: Battlefield 6 hareket hızı](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 hareket rehberi](https://deltiasgaming.com/?p=309455)
- [6,4 m/s sprint için yayın öncesi rapor](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad oyun mekanikleri yazısı (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (hız yayımlamaz)

Arma
- [Bohemia forumları: yürüme hızı](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia forumları: hareket hızı ayarı](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 geri bildirim takibi: sprint hızı](https://feedback.bistudio.com/T64047)
- [Arma 3 Saha El Kitabı: Piyade denetimleri](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 taraf başına araç istatistikleri (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Her uçak ve helikopter türünün Wikipedia özellikleri, `air.json` içindeki her profilden bağlantılı
- [V hızları](https://en.wikipedia.org/wiki/V_speeds), tipik yaklaşma ve muharebe hızları için
- [War Thunder wiki](https://wiki.warthunder.com/), kara araçları için
- [Arleigh Burke sınıfı muhrip](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) ve diğer gemi sınıflarının yayımlanmış hızları

Diğer
- [Tercih edilen yürüme hızı](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler'in yürüyüş fonksiyonu](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
