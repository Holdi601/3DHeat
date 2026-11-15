---
title: "Komandu siltums"
parent: "Siltuma režīmi"
nav_order: 6
lang: "lv"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Komandu siltums

Komandu siltums parāda, kur atradās katra komanda, katra savā krāsā. Kur komandas pārklājas, krāsas sajaucas.

**Komandu siltums** (taustiņš 3) ir [Siltuma](heat.md) blīvuma lauks, kur katrai [grupai](glossary.md) ir sava nokrāsa. Kur grupas pārklājas, to nokrāsas sajaucas; vienlīdzīga cīņa iznāk neitrāla. Necaurredzamība joprojām nes blīvumu tieši tāpat kā citos režīmos, tāpēc attēls vienlaikus atbild uz *cik daudz* un *kura*. Tam vajag grupu kolonnu.

![Komandu siltums: katra puse savā krāsā; kur tās pārklājas, krāsas sajaucas](../assets/img/lv/heat-teams.webp)

Tas nav [figūru pārklājums](box-replay.md): tas zīmē vienu figūru katrai personai; šis ir siltuma lauks, krāsots ar to pašu kolonnu.

## Kā to lietot {#how-to-use-it}

1. Nospiediet `3` (vai izvēlieties **Komandu siltums** režīmu joslā).
2. Atveriet **Siltuma krāsas**. Paraugkrāsas rāda katras grupas krāsu; uzvediet virsū paraugam, lai redzētu komandas nosaukumu.
3. Ja viss izskatās pelēks, palieliniet **Krāsu atdalīšana**.
4. Noņemiet atzīmi grupai [Komandu sarakstā](teams-list.md), lai to izņemtu; citu grupu krāsas paliek, kur bija.

## Vadība {#controls}

Sadaļā **Siltuma krāsas**:

| Vadība | Noklusējums | Nozīme |
|---|---|---|
| Paraugi | | Katras grupas krāsa pirmajām 12 grupām, tad *+N vēl*. Uzvediet virsū, lai redzētu grupas nosaukumu un krāsu. |
| **Krāsu atdalīšana** | 1,4 | Cik tālu maisījums tiek stumts prom no neitrālā, 0–4. 0 padara visu pelēku; 1 ir patiesais vidējais; virs aptuveni 2 spilgtākie maisījumi iziet ārpus attēlojamā diapazona un tiek apgriezti katrā kanālā, kas nobīda to nokrāsu. |
| **Necaurredzamības skala (krāsu nosaka grupa)** | noklusējuma siltuma skala | Šeit tiek izmantots tikai skalas **alfa**: caurspīdīgs, kur nekā nav, necaurspīdīgs augšā. Tās krāsas tiek ignorētas. |

Grupa, kuras etiķete nozīmē "nav grupas" (`0`, tukša, `none`, `unknown`, `null` vai `-1`), tiek zīmēta pelēka.

Visas pārējās siltuma vadības (forma, piesātinājums, reakcija, minimālais siltums, dziļums, nogriešana) darbojas kā lapā [Siltums](heat.md).

[Komandu saraksts](teams-list.md) šajā režīmā rāda katras grupas komandu siltuma krāsu kā tās paraugu. Paslēpjot grupu, katras citas grupas krāsa paliek tur, kur bija: nokrāsas nāk no kopējā grupu skaita, nevis no tā, kas ir ieslēgts, tāpēc divi attēli paliek salīdzināmi.

## Izstrādātājiem {#for-developers}

### Palete {#the-palette}

No [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Krāsas atrodas **Oklab** krāsu plaknē ar fiksētu gaišumu (0.7) un hromu (0.115), tāpēc katra grupa ir vienlīdz spilgta, un sarkana grupa neizskatās karstāka par zilu.
- Ar *n* grupām nokrāsu aplis tiek sadalīts *n* vienādās daļās, un grupa *i* ņem savas daļas **centru**, `(i + 0.5) / n` no apgrieziena. Jebkuras divas grupas ir tik tālu viena no otras, cik ļauj skaits, un pretējās paliek pretējās neatkarīgi no skaita.
- Tiek izmantotas ne vairāk kā **16** atšķirīgas nokrāsas. Ar vairāk grupām id tiek novietoti ar atkārtotu dalīšanu uz pusēm (bitu apgrieztie id: 0, ½, ¼, ¾, ⅛, …), lai blakus esoši id nedalītu vienu nokrāsu. Grupas virs 16 neizbēgami dalās.
- Grupa, kuras etiķete nozīmē "nav grupas" (`0`, tukša, `none`, `unknown`, `null` vai `-1`, neatkarīgi no reģistra), tiek zīmēta **neitrāli pelēka**, nevis ņem daļu no apļa. Tikai pirmā šāda etiķete grupu sarakstā tiek apstrādāta šādi.

Noklusējuma atdalīšana ir 1,4, nevis 1, jo pie 1 piecu vienmērīgi izvietotu nokrāsu maisījums *ir* pelēks: pareizi, bet nelasāmi. Nedaudz virs 1 saglabā neizšķirtos godīgus, vienlaikus padarot 60/40 sadalījumu redzamu.

### Kā tas darbojas {#how-it-works}

Siltuma mērķim šajā režīmā ir četri kanāli. Katrs spraits pievieno savu blīvumu *v* pirmajam kanālam un *v* × grupas Oklab koordinātas *a* un *b* otrajam un trešajam kanālam. Kompozīcijas laikā pikseļa maisījums ir ar blīvumu svērtais vidējais: *a* = G / R, *b* = B / R, mērogots ar krāsu atdalīšanu un pārvērsts sRGB paletes gaišumā. Dalīšana ar uzkrāto blīvumu padara nokrāsu neatkarīgu no tā, cik datu ir, un tāpēc katra blīvuma vadība turpina darboties tikai uz necaurredzamību.

Četru kanālu mērķis maksā četrreiz vairāk GPU atmiņas nekā viena kanāla siltuma mērķis tādā pašā izšķirtspējā.
