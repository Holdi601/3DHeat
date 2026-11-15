---
title: "Kujud"
parent: "Kordus"
nav_order: 3
has_children: true
lang: "et"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---

# Kujud

**Kuju** on väike 3D mudel sellest, mis üksus tegelikult on: tank, reaktiivlennuk, laev, sõdur. [Kordus](match-replay.md) joonistab iga üksuse tema kujuna tõelises suuruses, mitte lihtsa kastina.

Kataloogis on umbes 2000 nimetatud sõidukit, lennukit, laeva, relva ja sõdurit. Need on kõik vaataja enda tehtud.

![Demo tankid, joonistatud oma kujudena](../assets/img/et/replay-tanks.webp)

## Mis on kataloogis {#what-is-in-the-catalogue}

| Valdkond | Näited |
|---|---|
| Inimesed | sõdur seisab, kükitab, lamab; snaiper, tankitõrje, meditsiinitöötaja, meeskond |
| Maismaa | tankid, jalaväe lahingumasinad, õhutõrje, suurtükivägi, veokid ja autod, rongid ja trammid |
| Õhk | hävituslennukid, rünnakulennukid, pommitajad, transpordilennukid, helikopterid, kahetasandilistest biplaanidest kuni kaasaegsete reaktiivlennukiteni |
| Meri | sõjalaevad klasside kaupa, lennukikandjad, allveelaevad, paadid, kaubalaevad |
| Relvad | raketid, rakettid, pommid, torpeedod, valgus- ja sädemekuulid |
| Märgid | suitsu-, leek- ja tulegranaadid, paigaldatud pommid, lipud, tekkekohad, teepunktid |
| Lähivõitlus | kuulivestides sõdurid automaadi, püstolkuulipilduja, haavlipüssi, DMR-i, LMG-i, püstoli või kilbiga; droonid, kaamerad, okastraat, kilbid, seinte tugevdus, barrikaadid, murdelaengud, lõksud, aknad, granaadid, desarmeerija |

## Kuidas kujud tehakse {#how-the-figures-are-made}

- **Tehtud avaldatud mõõtudest.** Enamik kujusid on tehtud vaataja enda kujuehitaja abil avalikest arvudest: pikkus, laius, kõrgus, rattad, torn ja relv, tiivad ja saba. Nende kuju on seejärel häälestatud avalike fotode, jooniste ja avaldatud mõõtude järgi. Ühegi mängu mudeleid ei kasutata.
- **Vabad mudelid.** Mõned kujud kasutavad vabu 3D mudeleid (CC0 või CC BY), kus need on tõesemad, mõnikord koos ehitatud kerega. CC BY teoste autorid on tunnustatud lehel [Kujude tunnustused](figure-credits.md); CC0 teosed ei vaja tunnustust ja neid seal ei ole.
- Igal kujul on täielik, jämedam ja kaugel olev versioon (detailitasemed, LOD), nii et tuhandeid saab joonistada korraga.

## Millise kuju üksus saab {#which-figure-a-unit-gets}

Vaataja vaatab andmete enda veerge:

1. **Nimed**: veerud nimega *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* või *Figure* sobitatakse kataloogiga: täpselt, läbi umbes 4000 aliase (mitme mängu üksuste ID-d), pikima tuntud alguse järgi (`F-16C_50` on F-16C) või lühima kujunime järgi, mis algab sellega.
2. Nime, mille kuju ei sobi üksuse **tüübiga**, ei kasutata (veoauto nimega *Typhoon* ei ole hävituslennuk).
3. **Tüübid**: veerud nimega *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* või *Domain* annavad klassikuju: Tacview sildid (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kaardiikoonid või lihtsad sõnad (tank, helikopter, jalavägi).
4. Andmed, millel pole kumbagi, on inimeste andmed: kõik on sõdurid.

Seega on kõige lihtsam saada õiged kujud `vehicle` veerust koos õigete nimedega või `type` veerust Tacview siltidega.

**Minu üksus paistab kastina või sõdurina.** Lisa `vehicle` veerg õige nimega või `type` veerg Tacview sildiga. Üksuse kohal hoides näed, millise nime järgi see sobitati. Andmed, millel on sellised veerud, aga mis ei ütle üksuse kohta midagi, jätavad selle kastiks; andmed, millel pole kumbagi, joonistatakse sõdurina.

## Lähivõitluse kujud (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabelid, mis on kirjutatud nagu Rainbow Six Siege'i korduselugeja tabelid (veerud `operator`, `pawn`, `primaryClass`, `side`), saavad oma kujud:

- **Mängijad** on nende operaator: Igal 78 operaatoril on oma kuju, umbes 1,8 m pikk, oma riietes – kaks või kolm värvi jopele, pükstele ja varustusele nende tavalise avaliku välimuse järgi (must, oliiv, liivakarva, linnahall, valge, tumesinine, punase, oranži või sinakasrohelise varustusega) – ja oma kujudega, kolmandiku võrra suuremad kui päriselt seal, kus need peavad ülevalt näha olema: peakate (kiivrid, visiir või raske kiiver, nokamütsid, kootud mütsid, baretid, lai boonie-müts või karvamüts, kapuutsid, sallid, juuksed), nägu (kaitseprillid, gaasimask, prillid, mask, habe, kolme läätsega prillid), kerge, keskmine või raske kehaehitus (rasked on laiad, suurte õlaplaatide ja kraega), pikk mantel või ülikond, ghillie-ülikond, see, mida nad kannavad seljas (haamer, laengud, droonid, kanistrid, kütusepaak, lasketoru, amb, paneelid, segaja, kilp) või käsivarrel (lasteseade, metallkäsi), oma kilp (kõrge kilp, märulikilp, tuledega kilp) ja rõhuvärv õlgadel. Nad hoiavad oma põhirelva klassi. Operaator, keda vaataja ei tunne, on tavaline sõdur kuulivestis meeskonna värvis.
- **Pool** paistab riietest eraldi: rõngas maas iga operaatori all, **merevaigukarva rünnakule, kahvatu tsüaan kaitsele**, meeskonna värv selle sees, ning käe- ja peapaelad samas värvis. Veerg `stance` (seisab, kükitab, lamab) annab neile asendi. Ilma selleta nad seisavad.
- **Kordusekauguselt eristatavad:** Kui neid joonistatakse 48 pikslit kõrgena ülevalt ja kolmveerandnurga alt, erineb iga kaks sama poole operaatorit selgelt värvi või kuju poolest (seda kontrollivad vaataja testid).
- **Sildid** näitavad mängijat ja sel hetkel mängitud operaatorit ning operaatori rolli sümbolina: ✸ kõva läbimurdja, ⚒ pehme läbimurdja, ➤ sissetungija, ✦ tapja, ✚ toetaja, ⬟ kilp, ◉ luure, ◇ paindlik, ↺ tiivavaht, ⚓ ankur, ✕ lõksupanija, ⇄ hulkur, ↯ vidinatõrje, ▣ läbimurdetõrje.
- **Droonid** on visatav kaherattaline droon, umbes 30 cm lai. Igaüks on oma rada, mis on nimetatud omaniku järgi („Ash · drone 2“).
- **Paigutatud vidinad** seisavad seal, kuhu need pandi, sellest hetkest kuni vooru lõpuni, igaüks selle kujuna, mida ta teeb: kaamera, okastraat, lahtikäiv kilp, murdelaeng, kõva läbimurde laeng, väike kleepuv laeng, põrandalõks, claymore koos rakendulaseriga, ühesuunaline aken, soomuspaneel, granaat, gaasikanister, segaja, andur, laservärav, varustuskast. Üks kuju teenib kõiki vidinaid, mis teevad sama tööd. Vidin, mille liiki andmed ei ütle, on väike seade tulega.
- **Desarmeerija** seisab seal, kuhu see paigaldati, oma 45 sekundit.

Iga droon ja vidin saab faili laadimisel oma raja, nii et mängija enda kuju jääb tema keha juurde. Operaatorid on lihtsustatud kujud nende avalike kirjelduste ja piltide järgi (mida nad kannavad, seade, mis on nende võime), ja vidinad on kujundatud selle järgi, mida nad teevad. Kõik need on vaataja enda kujundused asja päris suuruses (claymore umbes 22 cm lai, uksesuurune paneel 1 m korda 2,1 m), mitte mängu mudelid.

## Seaded {#settings}

Kordusvaate külgriba jaotis **Kujud** seab suuruse, väikseima suuruse ekraanil, selle, milleks kaugelolevad üksused muutuvad (kuju, nool, sümbol), ja neile joonistatavad efektid. Vt [Matši kordus](match-replay.md#figures). Suits, tuli ja muud ajastatud efektid: [Kujud kujude ülekattes](figure-replay.md).

## Valikuline kohalik kujupakk {#an-optional-local-figure-pack}

Sa võid hoida enda masinas valikulist oma kujude paki. Selle kujud võtavad kohad samanimeliste kataloogikujude asemel. See ei ole kunagi osa repost ega avaldatud versioonist; ilma selleta ei muutu midagi.
