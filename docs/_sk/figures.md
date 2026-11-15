---
title: "Figúrky"
nav_order: 11
has_children: true
lang: "sk"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figúrky

**Figúrka** je malý 3D model toho, čím jednotka naozaj je: tank, prúdové lietadlo, loď, vojak. [Prehrávanie](match-replay.md) kreslí každú jednotku ako jej figúrku v skutočnej veľkosti namiesto obyčajnej kocky.

Je tu približne 2 000 pomenovaných vozidiel, lietadiel, lodí, zbraní a vojakov, všetko ich vytvára samotný prehliadač.

![Tanky z ukážky nakreslené ako vlastné figúrky](../assets/img/en/replay-tanks.webp)

## Čo je v katalógu {#what-is-in-the-catalogue}

| Oblasť | Príklady |
|---|---|
| Ľudia | vojak stojaci, drepiaci, ležiaci; ostreľovač, protitankový, zdravotník, posádka |
| Zem | tanky, bojové vozidlá pešiakov, protivzdušná obrana, delostrelectvo, nákladné autá a autá, vlaky a električky |
| Vzduch | stíhačky, útočné lietadlá, bombardéry, dopravné lietadlá, vrtuľníky, od dvojplošníkov po moderné prúdové lietadlá |
| More | bojové lode podľa triedy, lietadlové lode, ponorky, člny, obchodné lode |
| Zbrane | riadené strely, rakety, bomby, torpéda, svetlice a plevy |
| Značky | dymové, bleskové a zápalné granáty, položené bomby, vlajky, spawny, body trasy |

## Ako sa figúrky vyrábajú {#how-the-figures-are-made}

- **Postavené podľa zverejnených rozmerov.** Väčšinu figúrok vytvára vlastný zostavovač figúrok prehliadača z verejných čísel: dĺžka, šírka, výška, cestné kolesá, veža a delo, krídla a chvost. Ich tvar sa potom ladí podľa verejných fotografií, výkresov a zverejnených rozmerov. Nepoužívajú sa modely žiadnej hry.
- **Voľné modely.** Niekoľko figúrok používa voľné 3D modely (CC0 alebo CC BY), kde sú pravdivejšie, niekedy skombinované s postaveným trupom. Autori diel CC BY sú uvedení v [Autorstve figúrok](figure-credits.md); diela CC0 nevyžadujú uvedenie a tam nie sú zapísané.
- Každá figúrka má plnú, hrubú a vzdialenú verziu (úrovne detailu, LOD), takže sa dá nakresliť naraz tisíce.

## Akú figúrku jednotka dostane {#which-figure-a-unit-gets}

Prehliadač sa pozerá na stĺpce samotných dát:

1. **Názvy** - stĺpce s názvami *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* alebo *Figure* - sa porovnávajú s katalógom: presne, cez asi 4 000 aliasov (herné id jednotiek z viacerých hier), podľa najdlhšieho známeho začiatku (`F-16C_50` je F-16C), alebo podľa najkratšieho názvu figúrky, ktorý sa začína rovnako.
2. Názov, ktorého figúrka nezodpovedá **typu** jednotky, sa nepoužije (nákladné auto volané *Typhoon* nie je stíhačka).
3. **Typy** - stĺpce s názvami *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* alebo *Domain* - dajú figúrku triedy: značky Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikony máp alebo obyčajné slová (tank, vrtuľník, pešiak).
4. Dáta bez oboch sú dáta o ľuďoch: každý je vojak.

Najjednoduchší spôsob, ako získať správne figúrky, je stĺpec `vehicle` so skutočnými názvami alebo stĺpec `type` so značkami Tacview.

**Moja jednotka sa zobrazuje ako kocka alebo vojak.** Pridajte stĺpec `vehicle` so skutočným názvom alebo stĺpec `type` so značkou Tacview. Po najazdení na jednotku uvidíte, ktorý názov sa spároval. Dáta, ktoré takéto stĺpce majú, ale o jednotke nič nehovoria, ju ponechajú ako kocku; dáta bez oboch sa kreslia ako vojaci.

## Nastavenia {#settings}

Sekcia **Figúrky** na bočnom paneli prehrávania nastavuje veľkosť, najmenšiu veľkosť na obrazovke, čím sa stanú vzdialené jednotky (figúra, šípka, symbol) a efekty, ktoré sa na nich kreslia. Pozri [Prehranie zápasu](match-replay.md#figures). Dym, oheň a ďalšie časované efekty: [Figúrky v prekrytí figúrok](figure-replay.md).

## Voliteľný lokálny balík figúrok {#an-optional-local-figure-pack}

Na vlastnom počítači môžete mať voliteľný balík vlastných figúrok. Jeho figúrky nahradia figúrky katalógu s rovnakými názvami. Nikdy nie je súčasťou repozitára ani zverejneného buildu; bez neho sa nič nemení.
