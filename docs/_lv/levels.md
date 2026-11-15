---
title: "Līmeņi un fona ģeometrija"
nav_order: 13
has_children: true
lang: "lv"
source: "levels.md"
source_hash: "1283adc1548a"
translated: true
outdated: false
---

# Līmeņi un fona ģeometrija

Līmenis ir 3D vieta, kur notika spēle — karte, pilsēta, trase. Ja to novieto aiz taviem datiem, vari redzēt, *kur* ir siltums. Panelis **Fons / līmenis** (skat. [Glosāriju](glossary.md) vārdam "līmenis") dod trīs veidu kontekstu:

- **kartes attēls**, kas ģeoreferencēts ar diviem enkuriem — skat. [Karšu attēli](map-images.md);
- **3D līmeni** — `.glb`, `.gltf`, `.obj`, `.stl` vai `.ply` — sadalītu zemē, būvēs un ūdenī un vienkāršotu importējot — skat. [3D līmeņi](model-levels.md) un [Līmeņa izskats](level-appearance.md);
- **reālās pasaules fonu** — ierakstam, kas norāda, kur uz zemes tas ir (Tacview ACMI fails): reālu reljefu, ceļus, ūdeni, aerodromus un ēkas, lejupielādētas no atvērtiem datiem — skat. [Pasaules fons](world-backdrop.md).

Ja nekas nav ielādēts, aina ir tumša ar režģi un krāsainām asīm (**Režģis** un **Asis** lapā [Kamera un vadība](camera.md)), un panelis saka *Nekas nav ielādēts — aina rāda režģi un asis. Pievieno kartes attēlu vai līmeņa tīklu, lai dotu siltumam kontekstu.*

Līmenis ir kopīgs visām trim cilnēm: kurss, kas ielādēts cilnē Sacīkšu analīze, ir tas pats līmenis, ko rāda siltumkarte.

![Panelis Fons / līmenis ar ielādētu līmeni: pogas Kartes attēls un 3D modelis, Teātris, Necaurredzamība, Spilgtums, Saglabāt bibliotēkā un bibliotēkas saraksts](../assets/img/lv/level-panel.webp)

## Novieto līmeni aiz taviem datiem {#put-a-level-behind-your-data}

1. Vispirms ielādē datus ([Datu ievade](getting-data-in.md)), lai līmenis tiktu piemērots tiem.
2. Sānjoslā atver **Fons / līmenis**.
3. Nospied **Kartes attēls…** attēlam vai **3D modelis…** 3D līmenim un izvēlies failu. Reālās pasaules ierakstam izmanto **Reālā pasaule kā fons** vai **Kara darbības teātris**.
4. Pagaidi, līdz progresa rinda ir pabeigta. Liels modelis vispirms tiek vienkāršots (skat. zemāk **Vienkāršošanas mērķis**).
5. Nospied **F** skatā, lai ietvertu visu kadrā. Izmanto **Necaurredzamība** un **Spilgtums**, līdz siltums izceļas no līmeņa.
6. Nospied **Saglabāt bibliotēkā**, ja izmantosi līmeni vēlreiz ([Līmeņu bibliotēka](level-library.md)).

## Ko līmenis dara siltumam {#what-a-level-does-for-the-heat}

- Tas **aizsedz**: datu punkti aiz tā tiek aptumšoti pa virsmām, un datu punkti aiz reljefa ir paslēpti ([Dziļums un nogriešana](depth-and-culling.md)). Bez līmeņa nav aizsegšanas.
- To **griež** [Griezums](slice.md) un, ar *Griezt arī līmeni*, [atmešana pēc attāluma](depth-and-culling.md#distance-culling), kopā ar siltumu.
- Tas ir vienīgais, ko [lauka dziļums](camera.md#depth-of-field) izplūdina, papildus režģim un kastēm.
- 3D līmenis **paplašina kameras tālo plakni**, ja tas ir lielāks par datiem: tuvā un tālā plakne tiek kalibrēta pēc datu kopas, un eksportēta karte vairākus kilometrus platā citādi atrastos pilnībā aiz tālās plaknes un atstātu tukšu skatu. Tālā plakne kļūst par 3 × līmeņa horizontālo izmēru, ja tas ir lielāks, tuvā plakne pārvietojas kopā ar to (vismaz tālā / 100 000), lai saglabātu dziļuma precizitāti, no kuras atkarīga aizsegšana, un lidošanas ātrums tiek palielināts līdz vismaz izmērs / 12. Tā tikai paplašinās, nekad nesašaurinās.

## Panelis no augšas uz leju {#the-panel-top-to-bottom}

| Daļa | Detaļas |
|---|---|
| **Kartes attēls…**, **3D modelis…** | Ielādē vienu; tas aizstāj pašreizējo līmeni. |
| **Reālā pasaule kā fons**, **Aizmirst kartes flīzes** | Tikai datu kopai ar ģeogrāfisku atsauci: uzbūvē reālo vietu zem tā kā līmeni vai dzēš lejupielādētās flīzes. [Pasaules fons](world-backdrop.md) |
| **Vienkāršošanas mērķis** | Trīsstūru budžets nākamajam modeļa importam: *Pilna — bez vienkāršošanas* (noklusējums), *Augsta — 8M*, *Vidēja — 3M*, *Zema — 800k*, *Silueta — 100k*. [3D līmeņi](model-levels.md#simplification) |
| Progress un **Atcelt** | Kamēr dekodē vai importē. |
| Importa piezīme | Trīsstūri pirms un pēc, zemes / būvju / ūdens sadalījums, izmantotais detalizācijas līmenis. |
| Nosaukums un izmērs | `platums×augstums px · x × z m/px` attēlam, `N trīsstūri (no M)` modelim. |
| **Necaurredzamība**, **Spilgtums** | Abiem veidiem. |
| Attēla vadības | **Atkrāsot**, **Apmainīt ziemeļus/dienvidus**, **Novietojums** (divi enkuri), **Pielāgot datu robežām**, **Augstums**. [Karšu attēli](map-images.md) |
| Modeļa vadības | Zemes reljefs, ūdens, zemes trijstūri, karkass, tekstūra, uztvertā krāsa, būves, daļu klasifikācija. [Līmeņa izskats](level-appearance.md) |
| **Saglabāt bibliotēkā**, **Noņemt** | [Līmeņu bibliotēka](level-library.md); Noņemt izlādē līmeni. |
| **Bibliotēka** | Šajā pārlūkā glabātie līmeņi. [Līmeņu bibliotēka](level-library.md) |

## Lapas šajā sadaļā {#pages-in-this-section}

- [Karšu attēli](map-images.md)
- [3D līmeņi](model-levels.md) — formāti, daļas, klasifikācija, vienkāršošana, tekstūras
- [Līmeņa izskats](level-appearance.md) — katra vadība 3D līmenim
- [Līmeņu bibliotēka](level-library.md)
- [Pasaules fons](world-backdrop.md) — reālā pasaule zem ieraksta, no atvērtiem datiem

Kā līmeņus iegūt no spēlēm un dzinējiem, ir atsevišķo eksportētāju rīku uzdevums (skat. repozitorija [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); līgums, uz kuru tie raksta, ir apkopots lapā [3D līmeņi](model-levels.md#the-exporter-contract).
