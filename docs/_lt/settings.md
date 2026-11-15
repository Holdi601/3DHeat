---
title: "Nustatymai, vienetai ir klavišai"
nav_order: 19
lang: "lt"
source: "settings.md"
source_hash: "bd1062895abf"
translated: true
outdated: false
---

# Nustatymai, vienetai ir klavišai

Maži valdikliai viršuje šoninės juostos keičia tai, kaip peržiūros programa su jumis kalba: kalbą, vienetus (metrai arba pėdos, km/h arba mazgai) ir pagalbos režimą, kuris paaiškina spalvas. Jūsų pasirinkimai įsimenami naršyklėje.

## Antraštė {#the-header}

Šoninės juostos viršuje:

| Valdiklis | Ką daro |
|---|---|
| **?** | Pagalbos režimas: ką reiškia kiekviena spalva (taip pat `?` arba `F1`) |
| **Vienetai** meniu | Metrinė, Imperinė, Aviacinė arba Jūrinė |
| Mygtukas **...** šalia **Vienetų** | Atidaro „Pasirinkite vienetą kiekvienam dydžiui“: po vieną išskleidžiamąjį sąrašą kiekvienam dydžiui |
| **Kalba** meniu | Peržiūros programos kalba: [40 kalbų](languages.md) arba naršyklės kalba |

![Antraštė su atidarytu Vienetų meniu ir vienetų kiekvienam dydžiui langu](../assets/img/en/settings-units.webp)

Skaičiai, kuriuos įvedate į langelį, gali turėti tašką arba kablelį (`0.35` arba `0,35`). Peržiūros programa skaito abu ir rodo skaičius taip, kaip rašo jos kalba.

## Vienetai {#units}

1. Pasirinkite nustatymą meniu **Vienetai**. Visi dydžiai persijungia kartu.
2. Norėdami pakeisti tik vieną dydį, spustelėkite šalia jo esantį mygtuką **...** ir pasirinkite tam dydžiui vienetą. Tada meniu po nustatymu rodomas `*`.
3. Dydis, kurio nenustatėte, seka nustatymą. Pasirinkite „Kaip nustatyta“, kad grįžtumėte.

| Dydis | Metrinė (numatytoji) | Imperinė | Aviacinė | Jūrinė |
|---|---|---|---|---|
| Atstumas | km | mi | NM | NM |
| Aukštis, ilgis | m | ft | ft | m |
| Greitis | km/h | mph | kt | kt |
| Vertikalus greitis | m/s | ft/min | ft/min | m/s |
| Temperatūra | °C | °F | °C | °C |
| Slėgis | hPa | inHg | hPa | hPa |
| Masė, kuras | kg, l | lb, gal | lb, gal | t, m³ |
| Kampas | laipsniai | laipsniai | laipsniai | laipsniai |

Kiti vienetai, kuriuos galite pasirinkti vienam dydžiui: atstumas km, mi, NM; greitis km/h, m/s, kt, mph; vertikalus greitis m/s, ft/min, m/min; temperatūra °C, °F, K; slėgis hPa, inHg, mmHg, psi; masė kg, lb, t; kampas laipsniais arba NATO milais (6400 vienam apskritimui). Vienetai visur peržiūros programoje vienodi: žymose, kortelėse, grafikuose, statistikoje.

## Pagalbos režimas {#help-mode}

![Pagalbos režimas: ką reiškia spalvos](../assets/img/en/help.webp)

Paspauskite `?` arba `F1` arba spustelėkite mygtuką **?**. Jis rodo *Ką reiškia spalvos*: 3D vaizdo legendas, šilumos skales, komandų spalvas, lygio spalvas, skydelių būsenos spalvas, rungtynių skydelį ir lenktynių vaizdą. Jis lieka įjungtas, kol jį išjungiate. Rungtynių skirtuke jis paaiškina ir rungtynių skydelio spalvas.

![Pagalbos režimas Rungtynių skirtuke](../assets/img/en/settings-help-match.webp)

## Ką naršyklė prisimena {#what-the-browser-remembers}

Šie nustatymai išsaugomi jūsų naršyklėje tarp apsilankymų (niekas niekur nesiunčiama):

- kalba, vienetai ir pagalbos režimas;
- pakartojimo figūrų, ženklų, žymų, kameros ir taktinio rodymo nustatymai;
- atkūrimo greitis ir veidrodinimas;
- žymės kiekvienam įrašui, tūriai kiekvienam duomenų rinkiniui, tikslų sluoksniai;
- išorinio DI nustatymai (raktas – tik jei pažymėjote *Prisiminti*).

Šilumos nustatymai, filtrai ir režimas pradedami iš naujo kiekvieną kartą įkeliant. Pilnas, automatiškai sugeneruotas sąrašas: [Išsaugoti nustatymai](ref-settings-storage.md).

## Klavišai, kuriuos peržiūros programa palieka naršyklei {#keys-the-viewer-keeps-from-the-browser}

Sesijai su dideliais duomenimis įkelti užtrunka, todėl peržiūros programa neleidžia naršyklei jos atsitiktinai išmesti:

- `Ctrl`/`Cmd` + raidės, kurios spausdintų, įrašytų, atidarytų, perkrautų, uždarytų arba atidarytų naujus langus, nieko nedaro ne teksto laukeliuose; `F1`, `F3`, `F5`, `F6` ir `F7` nieko nedaro.
- Uždarant arba perkraunant skirtuką su įkeltais duomenimis ar lygiu, pirma klausiama.
- Viso ekrano režimu peržiūros programa užrakina klavišus, kuriuos naudoja (W, T, N, S, R, P, Q, Esc), kad naršyklė jų neperimtų.

Tikslus sąrašas: [Naršyklės klavišai](ref-browser-keys.md). Visi paties peržiūros programos klavišai: [Klaviatūros ir pelės nuoroda](keyboard-reference.md).
