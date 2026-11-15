---
title: "Syntetický generátor"
parent: "Ako dostať dáta dnu"
nav_order: 5
lang: "sk"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---


# Syntetický generátor

Nemáte vlastné dáta? Stlačte jedno tlačidlo a 3DHeat pre vás vymyslí zdanlivú bitku, takú malú alebo veľkú, aká sa vám páči.

1. Otvorte panel **Dátová sada** na bočnom paneli Heatmapa (pod **Zdroj**).
2. Posuňte sa na **Syntetický generátor**.
3. Nastavte **Riadky (milióny)**. Skúste najprv 1: predvolených 8 miliónov je pri prvom pokuse ťažkých.
4. Stlačte **Generovať**.

![1 milión riadkov, 8 tímov, nakreslených v Teple tímov](../assets/img/en/synthetic-generator-team-heat.webp)

Panel **Dátová sada** vie vygenerovať dataset namiesto jeho načítania. Slúži na dve veci: na vyskúšanie prehliadača bez vlastných dát a na overenie, či daný počet riadkov, polomer spritu a rozpočet držia použiteľný počet snímok za sekundu na počítači *predtým*, než doň pustíte veľké skutočné načítanie. Jeho pohyb má tvar zápasu battle royale - tímy začínajú od seba a potom sa stlačia k sebe - pretože rovnomerný šum vyzerá v akomkoľvek rozpočte v poriadku a skrýva práve tie artefakty, ktoré stojí za to zachytiť.

## Ovládače {#controls}

| Ovládač | Predvolene | Význam |
|---|---|---|
| **Riadky (milióny)** | 8 | Riadky na vygenerovanie. Zaokrúhli sa nadol na celý počet ťahov pre každého hráča. |
| **Tímy** | 8 | Počet skupín (aspoň 1). |
| **Na tím** | 12 | Hráči v skupine (aspoň 1). |
| **Polovičný rozmer mapy (m)** | 4000 | Polovica šírky hrateľnej plochy na X a Z. |
| Riadok odhadu | | „≈ X GB RAM, Y GB na GPU po kvantizácii.“ (asi 26 bajtov RAM a 8 bajtov na GPU na riadok). |
| **Generovať** | | Generuje v pracovnom vlákne príjmu, s priebehom, a nahradí každý načítaný dataset. |

Generovanie beží v pozadí, takže desiatky miliónov riadkov nezamrznú stránku.

## Čo generuje {#what-it-generates}

Z [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Stĺpce:** pozícia, čas, osoba (`P000`, `P001`, ...), skupina (`Team 1`, `Team 2`, ...), zákrut a sklon, a životnosti. Žiadny stĺpec relácie a žiadne stĺpce filtrov.
- **Čas:** jedna vzorka na hráča každých 0,25 s, od 0 (relatívny čas, žiadne nástenné hodiny).
- **Pohyb:** každý tím začína vo svojom sektore prstenca na 55 - 95 % polovičného rozmeru. Bezpečný kruh so stredom blízko stredu (náhodne posunutý až o štvrtinu polovičného rozmeru) sa v šiestich fázach s plošinami zmenší na 8 % polovičného rozmeru; každý hráč smeruje k blúdiacemu bodu vnútri neho, s tlmením a šumom. Výška sa vlní medzi 0 a 220 m.
- **Smer pohľadu:** zákrut podľa smeru pohybu, sklon podľa vertikálnej rýchlosti.
- **Opakovateľné:** náhodné semeno je pevné (1337), takže rovnaké nastavenia vždy dajú rovnaké dáta.

Každý režim tepla, replay krabíc a čiarové teplo (celé stopy, lebo nie je stĺpec udalostí) s ním fungujú. Funguje aj História životnosti.
