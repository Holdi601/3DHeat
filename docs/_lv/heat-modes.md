---
title: "Siltuma režīmi"
nav_order: 4
has_children: true
lang: "lv"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Siltuma režīmi

Katrs punkts pievieno nedaudz spīduma, spīdumi sakrājas, un krāvums tiek nokrāsots krāsās. Režīmi ir pieci veidi, kā to nokrāsot, un katrs atbild uz vienu jautājumu.

Režīmu josla Siltumkartes cilnes sānjoslas augšdaļā izvēlas, kā [datu kopa](glossary.md) tiek zīmēta. Taustiņi 1-4 izvēlas Siltums, Starpība, Komandu siltums un Līnijas. Figūru pārklājumam taustiņa nav.

![Režīmu josla ar Siltums, Starpība, Komandu siltums, Figūru pārklājums un Līnijas](../assets/img/en/heat-modes-bar.webp)

| Režīms | Jautājums, uz kuru tas atbild |
|---|---|
| **Siltums** | Kur tas notika un cik daudz? |
| **Starpība** | Kura puse to darīja vairāk? |
| **Komandu siltums** | Kura komanda to izdarīja? |
| **Līnijas** | Kurā virzienā cilvēki devās? |
| **Figūru pārklājums** | Kas bija kur un kad? |

![Tie paši dati četros režīmos: Siltums, Starpība, Komandu siltums un Līnijas](../assets/img/en/heat-modes-grid.webp)

| Režīms (joslas nosaukums) | Taustiņš | Ko tas zīmē | Nepieciešams |
|---|---|---|---|
| **Siltums** | 1 | Adītais blīvums: katra redzamā rinda pievieno radiālu sprite, kas vērsts pret kameru. [Siltums](heat.md) | datu kopa |
| **Starpība** | 2 | Parakstīts blīvums: viena populācija pieskaita, cita atņem. [Starpība](difference.md) | divas puses: vismaz divas grupas vai sadalījums pa saglabātu kolonnu |
| **Komandu siltums** | 3 | Blīvums, nokrāsots pēc grupas: nokrāsa katrai grupai, sajaukta tur, kur grupas pārklājas. [Komandu siltums](team-heat.md) | grupas kolonna |
| **Figūru pārklājums** | - | Figūra (vai kaste) katrai personai, kas pārvietojas pa laika skalu: atkārtojums. [Figūru pārklājums](box-replay.md), [Spēles atkārtojums](match-replay.md) | personas kolonna |
| **Līnijas** | 4 | Līniju siltums: līnija no katra personas paraugpunkta līdz nākamajam, siltums sāniski izplēn. [Līniju siltums](line-heat.md) | personas un laika kolonna |

Režīmu, ko dati nevar atbalstīt, nosaka pelēku, un tā rīkjosla paskaidro iemeslu, piemēram: *Nav pieejams - Starpības režīmam vajag divas grupas vai saglabātu kolonnu sadalīšanai; šiem datiem ir viena grupa.* Kad jaunā datu kopa nevar atbalstīt pašreizējo režīmu, skats atgriežas pie **Siltums**.

Taustiņi 1-4 tiek pārbaudīti pret datiem tāpat: taustiņš pelēkam režīmam nedara neko.

## Kurus paneļus rāda katrs režīms {#which-panels-each-mode-shows}

| Panelis | Siltums | Starpība | Komandu siltums | Figūru pārklājums | Līnijas |
|---|---|---|---|---|---|
| Maršruti ([līniju siltums](line-heat.md)) | | | | | jā |
| Siltuma forma (ar **Sekot skatam** un **Vienāds blīvums jebkurā tālummaiņā**), Siltuma krāsas, Sprite pikseļu robežas, Dziļums, [Attāluma nogriešana](depth-and-culling.md#distance-culling) | jā | jā | jā | | jā |
| Virziens ([virziena siltums](directional-heat.md)), Vērtība ([vērtības svēršana](value-weighting.md)) | jā | jā | jā | | jā |
| Komandu skats ([figūru pārklājums](box-replay.md)) | | | | jā | |
| Starpības sadalījums ([starpība](difference.md)) | | jā | | | |
| [Komandas](teams-list.md), [Vienības](entities.md), [Filtri](filters.md), Fons / līmenis, [Griezums](slice.md), [Mērs](measure.md), Kameras ceļš un renderēšana, Veiktspēja, Kamera un aina | jā | jā | jā | jā | jā |

## Ko visi siltuma režīmi kopīgi {#what-every-heat-mode-shares}

Visi četri siltuma režīmi (viss, izņemot figūru pārklājumu) ir viena un tā pati mašīna ar dažādiem ieejas datiem ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Kuras rindas.** [Laika skalas](timeline.md) logs izvēlas nepārtrauktu rindu diapazonu, kas sakārtots pēc laika; [filtri](filters.md), grupu redzamība, starpības sadalījums, [attāluma nogriešana](depth-and-culling.md#distance-culling) un [griezums](slice.md) katrai rindai lemj virsotņu ēnotājā, vai un cik stipri tā ieguldās.
2. **Splatting.** Katra ieguldošā rinda tiek zīmēta kā sprite (vai, Līniju režīmā, kā segments) peldošā punktu **siltuma mērķī**, pievienojot savu skalas vērtību. Ja rindu ir vairāk, nekā kadrs var atļauties, tiek zīmēta stratificēta rindu izlase, svērta, lai to kompensētu. Skatiet [Paraugu ņemšana un budžeti](sampling-and-budgets.md).
3. **Uzkrāšana.** Kamēr nekas nemainās, kadri tiek apvienoti, līdz katra rinda ir ieguldījusi tieši vienreiz. Skatiet [Uzkrāšana](accumulation.md).
4. **Kompozīcija.** Uzkrātā vērtība katrā pikselī tiek dalīta ar **piesātinājuma punktu**, veidota pēc **blīvuma reakcijas**, pacelta ar **minimālo siltumu** un meklēta **krāsu skalā**, kuras alfa sajauc to ar ainu. Skatiet [Krāsa un ekspozīcija](colour-and-exposure.md).

Viss 4. solī tiek lietots kompozīcijas laikā, tāpēc šo vadību vilkšana nekad nesāk uzkrāšanu no jauna; viss 1.-2. solī to dara.

## Lapas šajā sadaļā {#pages-in-this-section}

- [Siltums](heat.md) - vienkāršais siltuma režīms un tā paneļu pārskats
  - [Sprite forma](sprite-shape.md) - rādiuss, intensitātes, kritums, līknes redaktors, pikseļu robežas, saplacināšana
  - [Krāsa un ekspozīcija](colour-and-exposure.md) - skalas redaktors, piesātinājuma punkts, automātiska ekspozīcija, minimālais siltums, blīvuma reakcija
  - [Dziļums un nogriešana](depth-and-culling.md) - slēpšana aiz līmeņa, paslēpšana aiz reljefa, attāluma nogriešana
- [Starpība](difference.md) - starpības sadalījums
- [Komandu siltums](team-heat.md)
- [Līniju siltums](line-heat.md) - maršruti
- [Figūru pārklājums](box-replay.md) - atkārtojuma režīms (failam joprojām ir nosaukums box replay)
- [Virziena siltums](directional-heat.md)
- [Vērtības svēršana](value-weighting.md)
