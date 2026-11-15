---
title: "Obrazce"
nav_order: 11
has_children: true
lang: "cs"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Obrazce

**Figura** je malý 3D model toho, čím jednotka skutečně je: tank, stíhačka, loď, voják. [Přehrání](match-replay.md) kreslí každou jednotku jako její figuru ve skutečné velikosti, místo prosté krychle.

Je jich zhruba 2 000 pojmenovaných vozidel, letadel, lodí, zbraní a vojáků, všechny vytvořené samotným prohlížečem.

![Tanky z ukázky, nakreslené jako vlastní figury](../assets/img/en/replay-tanks.webp)

## Co je v katalogu {#what-is-in-the-catalogue}

| Oblast | Příklady |
|---|---|
| Lidé | voják stojící, v dřepu, vleže; odstřelovač, protitankový, zdravotník, osádka |
| Pozemní | tanky, bojová vozidla pěchoty, protiletadlová obrana, dělostřelectvo, nákladní auta a auta, vlaky a tramvaje |
| Vzduch | stíhačky, útočná letadla, bombardéry, dopravní letadla, vrtulníky, od dvouplošníků po moderní proudová letadla |
| Moře | válečné lodě podle třídy, letadlové lodě, ponorky, čluny, obchodní lodě |
| Zbraně | rakety, střely, bomby, torpéda, světlice a plevy |
| Značky | kouřové, zábleskové a zápalné granáty, položené nálože, vlajky, spawny, body trasy |

## Jak se figury vyrábějí {#how-the-figures-are-made}

- **Stavěné z veřejných rozměrů.** Většina figur vzniká ve stavitelí figur samotného prohlížeče z veřejných čísel: délka, šířka, výška, silniční kola, věž a hlaveň, křídla a ocas. Jejich tvar se pak ladí podle veřejných fotografií, výkresů a zveřejněných rozměrů. Nepoužívají se modely žádné hry.
- **Volné modely.** Několik figur používá volné 3D modely (CC0 nebo CC BY), tam, kde jsou věrnější, někdy spojené s postaveným trupem. Autoři děl CC BY jsou uvedeni na [Zdrojích obrazců](figure-credits.md); díla CC0 uvádění nepotřebují a na té stránce nejsou.
- Každá figura má plnou, hrubou a vzdálenou verzi (úrovně detailu, LOD), takže lze kreslit tisíce najednou.

## Kterou figuru jednotka dostane {#which-figure-a-unit-gets}

Prohlížeč se dívá na vlastní sloupce dat:

1. **Jména** - sloupce zvané *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* nebo *Figure* - se porovnají s katalogem: přesně, přes zhruba 4 000 aliasů (herní id jednotek několika her), podle nejdelšího známého začátku (`F-16C_50` je F-16C), nebo podle nejkratšího názvu figury, který začíná stejně.
2. Jméno, jehož figura se nehodí k **typu** jednotky, se nepoužije (nákladní auto zvané *Typhoon* není stíhačka).
3. **Typy** - sloupce zvané *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* nebo *Domain* - dají třídní figuru: značky Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), mapové ikony, nebo prosté slova (tank, vrtulník, pěchota).
4. Data bez obojího jsou data lidí: každý je voják.

Nejsnazší cesta ke správným figurám je tedy sloupec `vehicle` se skutečnými jmény, nebo sloupec `type` se značkami Tacview.

**Moje jednotka se ukazuje jako krychle nebo voják.** Přidejte sloupec `vehicle` se skutečným jménem, nebo sloupec `type` se značkou Tacview. Najetím na jednotku uvidíte, které jméno se shodlo. Data, která takové sloupce mají, ale o jednotce nic neříkají, ji nechají krychlí; data bez obojího se kreslí jako vojáci.

## Nastavení {#settings}

Sekce **Figury** v postranním panelu přehrání určuje velikost, nejmenší velikost na obrazovce, do čeho se změní vzdálené jednotky (figura, šipka, symbol), a efekty na nich. Viz [Přehrání zápasu](match-replay.md#figures). Kouř, oheň a jiné časované efekty: [Figury v překryvu figur](figure-replay.md).

## Volitelný místní balík figur {#an-optional-local-figure-pack}

Na svém počítači si můžete ponechat volitelný balík vlastních figur. Jeho figury nahradí figury katalogu stejných jmen. Nikdy nejsou součástí repozitáře ani zveřejněného sestavení; bez balíku se nic nemění.
