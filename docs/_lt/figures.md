---
title: "Figūros"
parent: "Pakartojimas"
nav_order: 3
has_children: true
lang: "lt"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figūros

**Figūra** yra maža 3D vieneto modelio kopija: tankas, reaktyvinis lėktuvas, laivas, kareivis. [Pakartojimas](match-replay.md) piešia kiekvieną vienetą kaip jo figūrą tikru dydžiu, o ne kaip paprastą dėžutę.

Yra apie 2 000 pavadintų transporto priemonių, orlaivių, laivų, ginklų ir karių; visas jas sukūrė pati peržiūros programa.

![Demonstracinio rinkinio tankai, nupiešti kaip jų pačių figūros](../assets/img/lt/replay-tanks.webp)

## Kas yra kataloge {#what-is-in-the-catalogue}

| Sritis | Pavyzdžiai |
|---|---|
| Žmonės | karys stovintis, tupintis, gulintis; snaiperis, prieštankinis, sanitaras, įgula |
| Sausuma | tankai, pėstininkų kovos mašinos, oro gynyba, artilerija, sunkvežimiai ir automobiliai, traukiniai ir tramvajai |
| Oras | naikintuvai, puolimo lėktuvai, bombonešiai, transportiniai lėktuvai, sraigtasparniai – nuo dvisparnių iki šiuolaikinių reaktyvinių |
| Jūra | karo laivai pagal klasę, lėktuvnešiai, povandeniniai laivai, valtys, prekybiniai laivai |
| Ginklai | raketos, rakečių paleidimo įrenginiai, bombos, torpedos, signalinės raketos ir dirbtinių debesų sviediniai |
| Žymekliai | dūmų, blyksnio ir gaisro granatos, pasodinti bombos, vėliavos, atsiradimo vietos, maršruto taškai |

## Kaip sukuriamos figūros {#how-the-figures-are-made}

- **Sukurtos pagal paskelbtus matmenis.** Dauguma figūrų sukurtos peržiūros programos pačios figūrų kūrėjo pagal viešus skaičius: ilgį, plotį, aukštį, ratus, bokštelį ir pabūklą, sparnus ir uodegą. Jų forma tada derinama pagal viešas nuotraukas, brėžinius ir paskelbtus matmenis. Jokių žaidimų modelių nenaudojama.
- **Nemokami modeliai.** Kelios figūros naudoja nemokamus 3D modelius (CC0 arba CC BY), kur jie tikslesni, kartais sujungtus su sukurtu korpusu. CC BY kūrinių autoriai paminėti [Figūrų šaltiniai](figure-credits.md) puslapyje; CC0 kūriniams priskyrimas nereikalingas, todėl jie ten nesąrašomi.
- Kiekviena figūra turi pilną, grubią ir tolimą versijas (detalumo lygius, LOD), todėl galima nupiešti tūkstančius vienu metu.

## Kokią figūrą gauna vienetas {#which-figure-a-unit-gets}

Peržiūros programa žiūri į paties duomenų stulpelius:

1. **Pavadinimai** – stulpeliai, vadinami *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* arba *Figure* – lyginami su kataloge: tiksliai, per apie 4 000 pseudonimų (kelių žaidimų vienetų id), pagal ilgiausią žinomą pradžią (`F-16C_50` yra F-16C) arba pagal trumpiausią figūros pavadinimą, kuris prasideda tuo pačiu.
2. Pavadinimas, kurio figūra netinka vieneto **tipui**, nenaudojamas (sunkvežimis, pavadintas *Typhoon*, nėra naikintuvas).
3. **Tipai** – stulpeliai, vadinami *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* arba *Domain* – duoda klasės figūrą: Tacview žymas (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), žemėlapio piktogramas arba paprastus žodžius (tank, helicopter, infantry).
4. Duomenys be nė vieno iš jų yra žmonių duomenys: visi – kariai.

Taigi lengviausias būdas gauti teisingas figūras – stulpelis `vehicle` su tikrais pavadinimais arba stulpelis `type` su Tacview žymomis.

**Mano vienetas rodomas kaip dėžutė arba karys.** Pridėkite stulpelį `vehicle` su tikru pavadinimu arba stulpelį `type` su Tacview žyma. Užvedę pelę ant vieneto matysite, koks pavadinimas buvo suderintas. Duomenys, kuriuose yra tokie stulpeliai, bet nieko nesako apie vienetą, palieka jį dėžute; duomenys be jokių – piešiami kaip kariai.

## Nustatymai {#settings}

Pakartojimo šoninės juostos skiltis **Figūros** nustato dydį, mažiausią dydį ekrane, į ką virsta tolimi vienetai (figūra, rodyklė, simbolis) ir efektus, piešiamus ant jų. Žr. [Rungtynių pakartojimas](match-replay.md#figures). Dūmai, gaisras ir kiti laikui riboti efektai: [Figūros figūrų sutapdinime](figure-replay.md).

## Neprivalomas vietinis figūrų rinkinys {#an-optional-local-figure-pack}

Savo kompiuteryje galite laikyti neprivalomą savo figūrų rinkinį. Jo figūros pakeičia katalogo figūras tais pačiais pavadinimais. Jis niekada nėra saugykloje ar paskelbtoje versijoje; be jo nieko nesikeičia.
