---
title: "Hĺbka a orezávanie"
parent: "Režimy tepla"
nav_order: 4
lang: "sk"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Hĺbka a orezávanie

Hĺbka spôsobí, že kopce a steny skrývajú teplo za sebou, tak ako skutočná stena skrýva človeka. Orezanie podľa vzdialenosti nechá len teplo medzi bližšou a vzdialenejšou hranicou od kamery.

![Nízka kamera za kopcom, s Skryť za terénom vypnuté (vľavo) a zapnuté (vpravo)](../assets/img/en/depth-and-culling-terrain.webp)

![Orezanie podľa vzdialenosti s Ďaleko na 400 m a Rezať aj level zapnuté: rez mapou okolo kamery](../assets/img/en/depth-and-culling-far.webp)

Bez hĺbky je teplotná mapa nad 3D [levelom](levels.md) plochým prekrytím: všetko, čo dataset obsahuje, žiari cez každú stenu plnou silou, signály hĺbky, ktoré level poskytuje, sa zrušia a horúci bod vnútri budovy vyzerá rovnako ako ten na jej streche. Sekcia **Hĺbka** spôsobí, že level skryje to, čo je za ním; **Orezanie podľa vzdialenosti** obmedzí teplo na škrupinu alebo dosku okolo kamery; [Rez](slice.md) vyreže dosku zo sveta. Všetky tri sa uplatňujú na režimy tepla a menia, ktoré riadky prispievajú, takže ich zmena reštartuje nahromadenie.

## Hĺbka {#depth}

Obe ovládacie prvky potrebujú [level](levels.md) – obrázok mapy alebo 3D model. Bez načítaného levelu nie je za čím byť skryté a nerobia nič. Obe sú vypnuté, keď je zapnuté [Zploštiť na rovinu zeme](sprite-shape.md#flatten-onto-ground-plane).

### Skryť za terénom {#hide-behind-terrain}

**Skryť za terénom** (predvolene zapnuté): dátový bod, ktorého najbližší povrch smerom ku kamere je *terén* (nie stavba), sa úplne zahodí, nie iba stlmí.

Terén a steny sú nepriehľadné rôznym spôsobom. Pozeráte *cez* stenu úmyselne, aby ste videli, na ktorom poschodí bola premávka; cez kopec nikdy nechcete pozerať, lebo za ním je vzdialená strana mapy – čo je na mape dlhej kilometre väčšina dát a ktorá sa pri horizonte sčíta do pásu jasnejšieho než čokoľvek v popredí. Jeden stlmovač nemôže slúžiť obom, preto terén dostane hranicu a steny ponechajú stlmenie nižšie.

### Skryté za geometriou {#hidden-behind-geometry}

**Skryté za geometriou** (predvolene 0,8): ako silno sa potláča dátový bod za geometriou levelu. Hodnota znamená *prejde cez* pri 0, *N % tmavšie* medzi tým (poloha posuvníka, nie nameraný útlm), *úplne skryté* pri 1.

Každá stena alebo podlaha medzi bodom a kamerou ho ďalej stlmí: jedna stena nechá pri predvolenom nastavení pár percent a každá ďalšia plocha zníži zvyšok na polovicu, až do štyroch plôch. Pri 1 sa nič za geometriou nekreslí, a to je najlacnejšie nastavenie.

Pozri aj [Vzhľad levelu](level-appearance.md).

## Orezanie podľa vzdialenosti {#distance-culling}

**Orezanie podľa vzdialenosti** (predvolene zatvorené) obmedzí teplo na riadky medzi bližšou a vzdialenejšou hranicou od kamery. Nastavte vzdialenejšiu hranicu, ak chcete čítať hustotu vnútri budovy bez toho, aby sa na ňu navrstvila vzdialená strana mapy; nastavte bližšiu hranicu, ak chcete preletieť *cez* horúci bod namiesto toho, aby ste doň narazili.

| Ovládací prvok | Predvolené | Rozsah (posuv) | Význam |
|---|---|---|---|
| **Blízko** | vypnuté | 0,5-5000 m, logaritmicky, spodných 5 % dráhy = vypnuté (200 000) | Riadky bližšie než toto sa preskočia. |
| **Ďaleko** | vypnuté | 1-200 000 m, logaritmicky, spodok = vypnuté (10 000 000) | Riadky vzdialenejšie než toto sa preskočia. |
| **Rezať rovinou** | zapnuté | | Hranice sa merajú pozdĺž osi pohľadu, nie od oka, takže rez je rovina rovnobežná s obrazovkou, a nie guľa okolo vás. Okraj gule sa po obraze zakrivuje a pri každom otočení sa posúva; rovina zostane tam, kde ju dáte. |
| **Rezať aj level** | zapnuté | | Rezať terén, stavby a vodu rovnakými hranicami. Keď zostane level celý, rez odstráni dátové body a budova zostane stáť pred nimi; keď sú obe rezané, je to rez mapou a body sú priložené k svojim stenám a podlahám. Tento prepínač len prekreslí; nereštartuje nahromadenie. |

### Klávesnica {#keyboard}

Vzdialenejšia hranica je ovládací prvok, ktorý posúvate – prejdete ním budovu a sledujete, na ktorom poschodí sa premávka objaví – preto je počas letu na klávesnici ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Klávesa | Účinok |
|---|---|
| `]` | Posunúť vzdialenejšiu hranicu von o koeficient 1,12 (Shift: 1,35) |
| `[` | Stiahnuť ju dnu o rovnaký koeficient |
| `\` | Vypnúť vzdialenejšiu hranicu, alebo ju zapnúť znova v tej vzdialenosti, v ktorej bola zanechaná (prvýkrát 6000) |

Kroky sú geometrické, lebo užitočný rozsah sa rozprestiera cez štyri rády – od miestnosti po mapu. Klávesnica drží vzdialenejšiu hranicu medzi 100 a 400 000. Klávesy nerobia nič, keď má fokus textové pole alebo ponuka.

## Pre vývojárov {#for-developers}

### Skryť za terénom {#hide-behind-terrain}

Stavby sa kreslia do vlastnej hĺbkovej textúry. Fragment, ktorý je za hĺbkou scény, ale *nie* za hĺbkou stavieb, je za zemou a zahodí sa. Stojí to jeden hĺbkový prechod cez stavby, ktorý sa preskočí, keď je prepínač vypnutý.

### Skryté za geometriou {#hidden-behind-geometry}

Počíta sa **po plochách**. Jediné porovnanie hĺbky vie povedať len „niečo je pred tým“, takže bod za jednou stenou a bod štyri miestnosti hlbšie v budove by sa stlmili rovnako a vnútro by vyzeralo ako jeden slabý šmuh. Namiesto toho sa geometria stavieb **odlupuje po hĺbke** až do 3 ďalších vrstiev ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); každý fragment spočíta, koľko plôch je pred ním (vlastná hĺbka scény plus odlupované vrstvy: najviac štyri), a stlmenie sa zložuje:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Posuvník | 1 plocha | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25 % | 12,5 % | 6,25 % | 3,1 % |
| 0,8 (predvolené) | 4 % | 2 % | 1 % | 0,6 % (dno) |
| 1,0 | nekreslí sa | nekreslí sa | nekreslí sa | nekreslí sa |

Prečo dva činitele: posuvník je kalibrovaný tak, aby jedna stena nechala pár percent – vzhľad, ktorý pôsobí ako „za niečím“ – a pár percent zložených za sebou by pri tretej stene nebolo nič; polovica na každú ďalšiu plochu udrží štyri rozlíšiteľné kroky. Prečo na druhú: lineárne zostávalo nasýtené pole za stenou stále nasýtené; štvrtá mocnina ho pri 0,8 úplne vymazala. Prečo dno: úplné skrytie zakrytého tepla spraví z miestnosti plnej skrytej premávky prázdnu miestnosť, bez čohokoľvek, čo by naznačovalo siahnuť po [Reze](slice.md). Skryje to úplne len posuvník nastavený na 1 – a je to najlacnejšie nastavenie, lebo zakryté body sa potom zahodia.

Ako to funguje ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shadery tepla bodov): porovnanie sa robí na fragment, proti hĺbkovej textúre scény, v **hĺbke okna**, nie vo svetovej vzdialenosti. Čítanie hĺbkovej textúry vo fáze vertexov na niektorých ovládačoch číta „ďaleko“ všade (medzi nimi softvérový rasterizér ANGLE), a prevod oboch hĺbok na metre stratí oddelenie kvôli presnosti pri širokom rozsahu bližšej a vzdialenejšej roviny. Posun je jeden polomer spritu prevedený do jednotiek okna plus niekoľko najnižších bitov, takže dátový bod ležiaci na povrchu sa sám nezatieňuje.

Stavby sa kreslia priesvitne, ale kreslia sa do hĺbky, z ktorej čerpá zakrytie; level, ktorého stavby nedosiahli hĺbkovú textúru, by sa zakrýval len voči terénu.

### Orezanie podľa vzdialenosti {#distance-culling}

Obe hranice sa vyhodnocujú vo vertex shaderi, takže orezaný riadok stojí jeden vertex a žiadne fragmenty.
