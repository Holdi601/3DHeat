---
title: "Komandų šiluma"
parent: "Šilumos režimai"
nav_order: 6
lang: "lt"
source: "team-heat.md"
source_hash: "e18e62600e3e"
translated: true
outdated: false
---

# Komandų šiluma

Komandų šiluma rodo, kur buvo kiekviena komanda, kiekviena – savo spalva. Ten, kur komandos persidengia, spalvos susimaišo.

**Komandų šiluma** (klavišas 3) yra [Šilumos](heat.md) tankio laukas, kuriam kiekviena [grupė](glossary.md) suteikta savas atspalvis. Ten, kur grupės persidengia, jų atspalviai susimaišo; lygi kova išeina neutrali. Nepermatomumas vis dar perduoda tankį kaip ir kituose režimuose, todėl paveikslėlis atsako tuo pačiu metu į *kiek* ir *kieno*. Jam reikia grupės stulpelio.

![Komandų šiluma: kiekviena pusė savo spalva; kur jos persidengia, spalvos susimaišo](../assets/img/lt/heat-teams.webp)

Tai nėra [figūrų perdanga](box-replay.md): ši rodo vieną figūrą kiekvienam žmogui; čia yra šilumos laukas, nuspalvintas pagal tą patį stulpelį.

## Kaip naudoti {#how-to-use-it}

1. Paspauskite `3` (arba pasirinkite **Komandų šiluma** režimų juostoje).
2. Atidarykite **Šilumos spalvos**. Atspalviai rodo kiekvienos grupės spalvą; užvedę pelę ant atspalvio, pamatysite komandos pavadinimą.
3. Jei viskas atrodo pilka, padidinkite **Spalvų atskyrimas**.
4. Nužymėkite grupę [Komandų sąraše](teams-list.md), kad ją išimtumėte; kitų spalvos lieka savo vietose.

## Valdikliai {#controls}

Skiltyje **Šilumos spalvos**:

| Valdiklis | Numatytoji reikšmė | Reikšmė |
|---|---|---|
| Atspalviai | | Kiekvienos grupės spalva, pirmosioms 12 grupių, paskui *+N daugiau*. Užvedus pelę matyti grupės pavadinimas ir spalva. |
| **Spalvų atskyrimas** | 1,4 | Kiek mišinys nutolsta nuo neutralios spalvos, 0–4. 0 viską padaro pilka; 1 yra tikras vidurkis; daugiau nei maždaug 2 ryškiausi mišiniai išeina už rodomo diapazono ir kiekvienam kanalui apribojami, todėl pasislenka jų atspalvis. |
| **Nepermatomumo skalė (spalvą lemia grupė)** | numatyta šilumos skalė | Čia naudojamas tik skalės **alfa**: permatomas ten, kur nieko nėra, ir nepermatomas viršuje. Jos spalvos ignoruojamos. |

Grupė, kurios žymė reiškia „jokios grupės“ (`0`, tuščia, `none`, `unknown`, `null` arba `-1`), piešiama pilkai.

Visi kiti šilumos valdikliai – forma, sodrumas, atsakas, mažiausia šiluma, gylis, atrinkimas – veikia kaip [Šiluma](heat.md).

[Komandų sąraše](teams-list.md) kiekvienos grupės komandų šilumos spalva šiame režime rodoma kaip jos atspalvis. Paslėpus grupę, visų kitų grupių spalvos lieka savo vietose: atspalviai priklauso nuo bendro grupių skaičiaus, o ne nuo to, kas įjungta, todėl du vaizdai lieka palyginami.

## Kūrėjams {#for-developers}

### Paletė {#the-palette}

Iš [`colors.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/colors.ts):

- Spalvos gyvena **Oklab** spalvų plokštumoje esant fiksuotam šviesumui (0,7) ir spalvingumui (0,115), todėl kiekviena grupė vienodai šviesi, o raudona grupė neatrodo karštesnė už mėlyną.
- Su *n* grupių atspalvių ratas padalijamas į *n* lygių dalių, o *i*-oji grupė paima jos dalies **centrą**, `(i + 0,5) / n` apsisukimo. Bet kurios dvi grupės yra tiek toli, kiek leidžia skaičius, o priešingybės išlieka priešingos, kad ir koks būtų skaičius.
- Naudojama daugiausia **16** skirtingų atspalvių. Su daugiau grupių id'ai išdėstomi pakartotinai dalijant pusiau (bitų apvertimo id'ai: 0, ½, ¼, ¾, ⅛, …), kad kaimyniniai id'ai neturėtų to paties atspalvio; grupės, viršijančios 16, būtinai dalinasi.
- Grupė, kurios žymė reiškia „jokios grupės“ – `0`, tuščia, `none`, `unknown`, `null` arba `-1`, nepaisant raidžių dydžio – piešiama **neutralia pilka** vietoj to, kad paimtų ratu atkarpą. Tik pirmoji tokia žymė grupių sąraše traktuojama taip.

Numatytasis atskyrimas yra 1,4, o ne 1, nes esant 1, penkių vienodai išdėstytų atspalvių mišinys *yra* pilkas: teisingas, bet neskaitomas. Šiek tiek virš 1 išlaiko lygiąsias reikšmes sąžiningas, o 60/40 padalijimą daro matomą.

### Kaip tai veikia {#how-it-works}

Šiame režime šilumos tikslas turi keturis kanalus. Kiekvienas spraitas prideda savo tankį *v* prie pirmojo kanalo, o *v* × grupės Oklab koordinates *a* ir *b* – prie antrojo ir trečiojo. Kompozicijos metu pikselio mišinys yra tankiu svertinis vidurkis: *a* = G / R, *b* = B / R, padauginti iš spalvų atskyrimo ir paversti į sRGB paletės šviesumu. Dalijimas iš sukaupto tankio daro atspalvį nepriklausomą nuo to, kiek duomenų yra, ir todėl visi tankio valdikliai toliau veikia tik nepermatomumą.

Keturių kanalų tikslas kainuoja keturis kartus daugiau GPU atminties nei vieno kanalo šilumos tikslas tos pačios raiškos.
