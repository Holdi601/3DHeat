---
title: "Teplo tímov"
parent: "Režimy tepla"
nav_order: 6
lang: "sk"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---


# Teplo tímov

Teplo tímov ukazuje, kde bol každý tím, a každý tím má vlastnú farbu. Tam, kde sa tímy prekrývajú, sa farby miešajú.

**Teplo tímov** (klávesa 3) je hustotné pole [Tepla](heat.md), pričom každá [skupina](glossary.md) dostane vlastný odtieň. Kde sa skupiny prekrývajú, ich odtiene sa miešajú; vyrovnaný súboj vyjde neutrálne. Nepriehľadnosť naďalej nesie hustotu presne ako v ostatných režimoch, takže obraz odpovedá naraz na *koľko* a *čí*. Potrebuje stĺpec skupín.

![Teplo tímov: každá strana vo vlastnej farbe; tam, kde sa prekrývajú, sa farby miešajú](../assets/img/sk/heat-teams.webp)

Nie je to [prekrytie figúrok](box-replay.md): to kreslí jednu figúrku na osobu; toto je pole tepla zafarbené podľa toho istého stĺpca.

## Ako to použiť {#how-to-use-it}

1. Stlačte `3` (alebo vyberte **Teplo tímov** v lište režimov).
2. Otvorte **Farby tepla**. Vzorky ukazujú farbu každej skupiny; nad vzorkou podržte myš a uvidíte názov tímu.
3. Ak je všetko sivé, zvýšte **Oddelenie farieb**.
4. Odškrtnutím skupiny v [Zozname tímov](teams-list.md) ju odstránite; ostatné farby zostanú, kde boli.

## Ovládače {#controls}

V sekcii **Farby tepla**:

| Ovládač | Predvolene | Význam |
|---|---|---|
| Vzorky | | Farba každej skupiny, pre prvých 12 skupín, potom *+N ďalších*. Nad vzorkou podržte myš pre názov skupiny a farbu. |
| **Oddelenie farieb** | 1,4 | Akoďaleko sa zmes odtláča od neutrálnej, 0 - 4. Pri 0 je všetko sivé; pri 1 je to skutočný priemer; nad asi 2 najjasnejšie zmesi opustia zobraziteľný rozsah a každý kanál sa orezáva, čo posunie ich odtieň. |
| **Škála nepriehľadnosti (farbu dáva skupina)** | predvolená škála tepla | Tu sa používa len **alfa** škály: priehľadná tam, kde nič nie je, nepriehľadná na vrchu. Jej farby sa ignorujú. |

Skupina, ktorej názov znamená „žiadna skupina“ (`0`, prázdny, `none`, `unknown`, `null` alebo `-1`), sa kreslí sivo.

Všetky ostatné ovládače tepla - tvar, sýtosť, odozva, minimálne teplo, hĺbka, orezávanie - fungujú ako v [Teple](heat.md).

[Zoznam tímov](teams-list.md) ukazuje farbu teplo tímov každej skupiny ako jej vzorku v tomto režime. Skrytie skupiny nechá farbu každej inej skupiny, kde bola: odtiene sa berú z celkového počtu skupín, nie z toho, čo je zapnuté, takže dva obrazy zostanú porovnateľné.

## Pre vývojárov {#for-developers}

### Paleta {#the-palette}

Z [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Farby žijú v rovine farieb **Oklab** pri pevnej svetlosti (0,7) a chrome (0,115), takže každá skupina je rovnako jasná a červená skupina nepôsobí teplejšie ako modrá.
- Pri *n* skupinách sa kruh odtieňov rozdelí na *n* rovnakých častí a skupina *i* vezme **stred** svojej časti, `(i + 0,5) / n` otáčky. Ľubovoľné dve skupiny sú od seba tak ďaleko, ako počet dovoľuje, a protiklady zostanú protikladmi bez ohľadu na počet.
- Používa sa najviac **16** rôznych odtieňov. Pri väčšom počte skupín sa identifikátory rozmiestnia opakovaným delením na polovice (identifikátory s obráteným bitovým poradím: 0, ½, ¼, ¾, ⅛, …), aby susedné identifikátory nezdieľali odtieň; skupiny nad 16 nutne zdieľajú.
- Skupina, ktorej názov znamená „žiadna skupina“ - `0`, prázdny, `none`, `unknown`, `null` alebo `-1`, bez ohľadu na veľkosť písmen - sa kreslí **neutrálnou sivou** namiesto toho, aby dostala výseč kruhu. Takto sa zaobchádza len s prvým takým názvom v zozname skupín.

Predvolené oddelenie je 1,4 a nie 1, lebo pri 1 je zmes piatich rovnomerne rozložených odtieňov *sivá*: správne, ale nečitateľné. Trochu nad 1 zachová poctivé remízy a zároveň urobí rozdelenie 60/40 viditeľným.

### Ako to funguje {#how-it-works}

Cieľ tepla má v tomto režime štyri kanály. Každý sprite pridá svoju hustotu *v* do prvého kanála a *v* × Oklab súradnice *a* a *b* skupiny do druhého a tretieho. Pri skladaní je zmes pixla vážený priemer podľa hustoty: *a* = G / R, *b* = B / R, škálované oddelením farieb a prevedené do sRGB pri svetlosti palety. Delenie nahromadenou hustotou drží odtieň nezávislý od toho, koľko údajov je, a preto každý ovládač hustoty pôsobí len na nepriehľadnosť.

Štvorkanálový cieľ stojí štvornásobok pamäte GPU jednokanálového cieľa tepla pri rovnakom rozlíšení.
