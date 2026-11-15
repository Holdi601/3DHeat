---
title: "Figúrky"
parent: "Prehrávanie"
nav_order: 3
has_children: true
lang: "sk"
source: "figures.md"
source_hash: "7040eba3b7ac"
translated: true
outdated: false
---


# Figúrky

**Figúrka** je malý 3D model toho, čím jednotka naozaj je: tank, prúdové lietadlo, loď, vojak. [Prehrávanie](match-replay.md) kreslí každú jednotku ako jej figúrku v skutočnej veľkosti, namiesto jednoduchej krabice.

Je tu asi 2 000 pomenovaných vozidiel, lietadiel, lodí, zbraní a vojakov, všetky vytvorené samotným prehliadačom.

![Tanky z ukážky nakreslené ako ich vlastné figúrky](../assets/img/sk/replay-tanks.webp)

## Čo je v katalógu {#what-is-in-the-catalogue}

| Oblasť | Príklady |
|---|---|
| Ľudia | vojak stojaci, drepiaci, ležiaci; ostreľovač, protitankový, zdravotník, posádka |
| Pozemné | tanky, bojové vozidlá pešiaka, protivzdušná obrana, delostrelectvo, nákladné autá a osobné autá, vlaky a električky |
| Vzduch | stíhačky, útočné lietadlá, bombardéry, dopravné lietadlá, vrtuľníky, od dvojplošníkov po moderné prúdové lietadlá |
| More | bojové lode podľa triedy, lietadlové lode, ponorky, člny, obchodné lode |
| Zbrane | rakety, raketomety, bomby, torpéda, svetlice a plevy |
| Značky | dymové, zábleskové a zápalné granáty, uložené bomby, vlajky, miesta zrodu, body trasy |
| Boj zblízka | vojaci v nosičoch plátov s útočnou puškou, samopalom, brokovnicou, DMR, LMG, pištoľou alebo štítom; drony, kamery, ostnatý drôt, štíty, spevnenie stien, barikády, prelamovacie nálože, pasce, okná, granáty, defuser |

## Ako sa figúrky robia {#how-the-figures-are-made}

- **Postavené podľa zverejnených rozmerov.** Väčšina figúrok je vytvorená stavebnicou figúrok prehliadača z verejných čísel: dĺžka, šírka, výška, cestné kolesá, veža a delo, krídla a chvost. Ich tvar sa potom doladí podľa verejných fotografií, výkresov a zverejnených rozmerov. Nepoužívajú sa modely žiadnej hry.
- **Voľné modely.** Niekoľko figúrok používa voľné 3D modely (CC0 alebo CC BY), kde sú pravdivejšie, niekedy spojené s postavenou trupom. Autori diel CC BY sú uvedení na [Poďakovanie za figúrky](figure-credits.md); diela CC0 nevyžadujú uvedenie a tam nie sú vypísané.
- Každá figúrka má plnú, hrubú a vzdialenú verziu (úrovne detailu, LOD), takže sa dá nakresliť tisíce naraz.

## Akú figúrku jednotka dostane {#which-figure-a-unit-gets}

Prehliadač sa pozrie na vlastné stĺpce údajov:

1. **Názvy** - stĺpce s názvami *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* alebo *Figure* - sa porovnajú s katalógom: presne, cez asi 4 000 alternatív (herné id jednotiek z viacerých hier), podľa najdlhšieho známeho začiatku (`F-16C_50` je F-16C), alebo podľa najkratšieho názvu figúrky, ktorý sa začína rovnako.
2. Názov, ktorého figúrka nesedí na **typ** jednotky, sa nepoužije (nákladné auto menom *Typhoon* nie je stíhačka).
3. **Typy** - stĺpce s názvami *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* alebo *Domain* - dajú figúrku triedy: značky Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikony mapy alebo obyčajné slová (tank, helicopter, infantry).
4. Údaje, v ktorých nie je ani jedno, sú údaje o ľuďoch: každý je vojak.

Najľahší spôsob, ako dostať správne figúrky, je stĺpec `vehicle` so skutočnými názvami, alebo stĺpec `type` so značkami Tacview.

**Moja jednotka sa zobrazuje ako krabica alebo vojak.** Pridajte stĺpec `vehicle` so skutočným názvom, alebo stĺpec `type` so značkou Tacview. Nad jednotkou podržte myš a uvidíte, ktorý názov sa našiel. Údaje, ktoré takéto stĺpce majú, ale o jednotke nič nehovoria, nechajú ju ako krabicu; údaje bez oboch sa kreslia ako vojaci.

## Figúrky pre boj zblízka (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabuľky zapísané ako tie z čítačky záznamov Rainbow Six Siege (stĺpce `operator`, `pawn`, `primaryClass`, `side`) dostanú vlastné figúrky:

- **Hráči** sú svojím operátorom: každý zo 78 operátorov má vlastnú figúrku, vysokú asi 1,8 m, vo vlastnom oblečení - dve alebo tri farby pre bundu, nohavice a výstroj podľa ich bežného verejného vzhľadu (čierna, olivová, piesková, mestská sivá, biela, námornícka modrá, s červenou, oranžovou alebo modrozelenou výstrojou) - a s vlastnými tvarmi, o tretinu väčšími ako v skutočnosti tam, kde musia byť vidieť zhora: pokrývka hlavy (prilby, priezor alebo ťažká prilba, šiltovky, čiapky, barety, široký klobúk boonie alebo kožušinová čiapka, kapucne, šály, vlasy), tvár (ochranné okuliare, plynová maska, okuliare, maska, brada, okuliare s tromi šošovkami), ľahká, stredná alebo ťažká postava (ťažkí sú širokí, s veľkými ramennými plátmi a golierom), dlhý kabát alebo oblek, maskovací oblek ghillie, čo nosia na chrbte (kladivo, nálože, drony, kanistre, nádrž na palivo, odpaľovaciu rúru, kušu, panely, rušičku, štít) alebo na ruke (odpaľovač, kovovú ruku), vlastný štít (vysoký, policajný štít, štít so svetlami) a doplnkovú farbu na pleciach. Držia triedu svojej hlavnej zbrane. Operátor, ktorého prehliadač nepozná, je obyčajný vojak v nosiči plátov vo farbe tímu.
- **Strana** sa ukazuje oddelene od oblečenia: kruh na zemi pod každým operátorom, **jantárový pre útok, bledo azúrový pre obranu**, s farbou tímu vnútri, a pásky na ruke a hlave v tej istej farbe. Stĺpec `stance` (stand, crouch, prone) ich postaví do pózy; bez neho stoja.
- **Rozlíšiteľní na vzdialenosť záznamu:** pri vykreslení vo výške 48 pixelov zhora a z trištvrte pohľadu sa každí dvaja operátori na jednej strane líšia zreteľným rozdielom farby alebo iným tvarom (overené testami prehliadača).
- **Popisy** uvádzajú hráča a operátora, ktorého v tej chvíli hrá, s rolou operátora ako symbolom: ✸ tvrdé prelomenie, ⚒ mäkké prelomenie, ➤ vstup, ✦ fragger, ✚ podpora, ⬟ štít, ◉ prieskum, ◇ flex, ↺ stráženie boku, ⚓ kotva, ✕ pasce, ⇄ roamer, ↯ proti pomôckam, ▣ proti prelomeniu.
- **Drony** sú dvojkolesový hádzateľný dron, široký asi 30 cm, každý ako vlastná stopa pomenovaná podľa majiteľa („Ash · drone 2“).
- **Položené pomôcky** stoja tam, kam boli položené, od tej chvíle až do konca kola, každá ako figúrka toho, čo robí: kamera, ostnatý drôt, rozkladací štít, prelamovacia nálož, nálož na tvrdé prelomenie, malá lepiaca nálož, podlahová pasca, claymore s laserovým spúšťačom, jednosmerné okno, pancierový panel, granát, plynový kanister, rušička, senzor, laserová brána, debna so zásobami. Jedna figúrka slúži každej pomôcke, ktorá robí tú istú prácu. Pomôcka, ktorej druh údaje neuvádzajú, je malé zariadenie so svetlom.
- **Defuser** stojí tam, kde bol položený, počas svojich 45 sekúnd.

Každý dron a pomôcka sa pri načítaní súboru stane vlastnou stopou, takže vlastná figúrka hráča zostane na jeho tele. Operátori sú zjednodušené tvary podľa ich verejných opisov a ilustrácií (čo nosia, zariadenie, ktoré je ich schopnosťou), a pomôcky majú tvar podľa toho, čo robia. Všetko toto sú vlastné návrhy prehliadača v skutočnej veľkosti danej veci (claymore široký asi 22 cm, panel veľkosti dverí 1 m × 2,1 m), nie modely z hry.

## Nastavenia {#settings}

Sekcia **Figúrky** na bočnom paneli prehrávania nastaví veľkosť, najmenšiu veľkosť na obrazovke, čím sa stanú vzdialené jednotky (figúrka, šípka, symbol) a efekty, ktoré sa na nich kreslia. Pozri [Prehrávanie zápasu](match-replay.md#figures). Dym, oheň a iné časované efekty: [Figúrky v prekrytí figúrok](figure-replay.md).

## Voliteľný lokálny balík figúrok {#an-optional-local-figure-pack}

Na svojom počítači si môžete ponechať voliteľný balík vlastných figúrok. Jeho figúrky nahrádzajú figúrky z katalógu s rovnakými názvami. Nikdy nie je súčasťou repozitára ani zverejnenej verzie; bez neho sa nič nemení.
