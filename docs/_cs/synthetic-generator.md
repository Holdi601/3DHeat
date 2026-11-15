---
title: "Syntetický generátor"
parent: "Jak nahrát data"
nav_order: 5
lang: "cs"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Syntetický generátor

Nemáte vlastní data? Stiskněte jedno tlačítko a 3DHeat vám vymyslí předstíranou bitvu, jakkoli malou nebo velkou.

1. Otevřete panel **Datová sada** v postranním panelu Teplotní mapy (pod **Zdroj**).
2. Přejděte na **Syntetický generátor**.
3. Nastavte **Řádky (v milionech)**. Zkuste nejdřív 1: výchozích 8 milionů je pro první pokus těžkých.
4. Stiskněte **Generovat**.

![1 milion řádků, 8 týmů, nakresleno v Týmovém teple](../assets/img/en/synthetic-generator-team-heat.webp)

Panel **Datová sada** umí vygenerovat datovou sadu místo jejího načtení. Slouží ke dvěma věcem: vyzkoušet prohlížeč bez vlastních dat a ověřit, zda daný počet řádků, poloměr spritu a rozpočet udrží na počítači použitelnou snímkovou frekvenci, *dříve* než do něj dáte velké reálné načtení. Jeho pohyb má tvar zápasu typu battle royale – týmy začínají od sebe a pak se tlačí k sobě – protože rovnoměrný šum vypadá v jakémkoli rozpočtu dobře a skrývá přesně ty artefakty, které stojí za to chytit.

## Ovládání {#controls}

| Ovládání | Výchozí | Význam |
|---|---|---|
| **Řádky (v milionech)** | 8 | Kolik řádků vygenerovat. Zaokrouhleno dolů na celý počet taktů pro každého hráče. |
| **Týmy** | 8 | Počet skupin (nejméně 1). |
| **Na tým** | 12 | Hráčů v každé skupině (nejméně 1). |
| **Poloviční rozměr mapy (m)** | 4000 | Polovina šířky hratelné oblasti na X a Z. |
| Řádek odhadu | | „≈ X GB RAM, Y GB na GPU po kvantizaci.“ (asi 26 bajtů RAM a 8 bajtů na GPU na řádek). |
| **Generovat** | | Generuje v dovozním workeru, s postupem, a nahradí případnou načtenou datovou sadu. |

Generování běží v pozadí na workeru, takže desítky milionů řádků nezamrznou stránku.

## Co generuje {#what-it-generates}

Z [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Sloupce:** pozice, čas, osoba (`P000`, `P001`, ...), skupina (`Team 1`, `Team 2`, ...), yaw a pitch, a životnosti. Žádný sloupec relace a žádné sloupce filtrů.
- **Čas:** jeden vzorek na hráče každých 0,25 s, počínaje 0 (relativní čas, bez nástěnných hodin).
- **Pohyb:** každý tým začíná ve svém vlastním sektoru prstence na 55–95 % poloviční velikosti. Bezpečný kruh se středem poblíž prostředku (posunutý náhodně nejvýše o čtvrtinu poloviční velikosti) se během šesti fází s plošinami zmenší na 8 % poloviční velikosti; každý hráč míří k bloudícímu bodu uvnitř něj, s tlumením a šumem. Výška se vlní mezi 0 a 220 m.
- **Směr pohledu:** yaw podle směru pohybu, pitch podle vertikální rychlosti.
- **Opakovatelné:** náhodné semeno je pevné (1337), takže stejná nastavení vždy dají stejná data.

Na to fungují všechny režimy tepla, přehrávání krabic i čárové teplo (celé trasy, protože chybí sloupec událostí). Funguje i historie životnosti.
