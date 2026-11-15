---
title: "Dokumentacijos priežiūra"
nav_order: 23
lang: "lt"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Dokumentacijos priežiūra

Šis puslapis skirtas tiems, kas prižiūri peržiūros programą ir šią svetainę. Jame išvardyti žingsniai, kaip po pakeitimo išlaikyti puslapius, paveikslėlius ir vertimus teisingus.

Ši svetainė tikrinama iš naujo su **kiekvienu leidimu** ir kai kas nors labai pasikeičia: klavišų susiejimai, kelias per sąsają, nustatymai, failų formatai. Kontrolinis sąrašas:

1. **Iš naujo sugeneruokite nuorodos puslapius**: `node tools/docs-refs.mjs` (ir `--lang <kalba>` kiekvienai kalbai). `node tools/docs-refs.mjs --check` nepavyksta, kai puslapis pasenęs.
2. **Iš naujo sugeneruokite ekrano nuotraukas** iš [demonstracinių duomenų](demo-data.md). Naudokite kompiuterį ar konteinerį, kurio regionas yra en-US, kad skaičiai rodytųsi kaip `0.35`, o ne `0,35` (skaičių laukeliai seka naršyklės regioną, kol jis nepakeistas). Sukurkite demonstracinius duomenis su `node tools/demo-data.mjs`, paleiskite kūrimo serverį 5321 prievade **be** vietinio figūrų rinkinio, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, tada paleiskite `node tools/docs-shots.mjs --lang <kalba>`. Pažiūrėkite kiekvieną paveikslėlį: turi būti tik demonstraciniai pavadinimai (*Demo Valley*, *Blue 1*, *Red 3* ...), jokių tikrų žemėlapių, žaidėjų ar įrašų.
3. **Išvardykite, kas pasikeitė** nuo paskutinės leidimo žymos: `git log --oneline <paskutinė žyma>..HEAD` ir skyrių **Docs** faile `CHANGELOG.md`, kur kiekviena funkcija susieta su savo puslapiu. Kiekviena nauja funkcija turi turėti puslapį arba skyrių, o jei ji matoma ekrane – ir paveikslėlį.
4. **Nepriklausoma anglų kalbos puslapių peržiūra** kieno nors, kas jų nerašė, trims skaitytojams: pradedančiajam, aštuonerių metų vaikui, ekspertui. Ar žingsniai pilni ir eina tinkama tvarka, ar žodžiai tokie, kaip sąsajoje, ar paveikslėliai dabartiniai, ar teisingos diagramų etiketės?
5. **Ištaisykite, ką rado peržiūra.**
6. **Iš naujo išverskite pakeistus puslapius** pagal jų šaltinio maišą, tada kiekvienai kalbai atlikite peržiūrą. Žr. `tools/docs-translate.md`.
7. **Patikrinkite konfidencialius terminus** pakeistuose failuose ir įsitikinkite, kad jokiame paveikslėlyje nematyti nieko, išskyrus demonstracinius duomenis.
8. **Skelbkite** tik tada, kai leidimas patvirtintas.

Tas pats patikrinimas taikomas ir susijusių saugyklų dokumentacijos svetainėms (žr. [Pagrindinis](index.md#related-repositories) puslapį).

## Įrankiai aplanke exporters/ {#the-tools-under-exporters}

Įrankiai aplink peržiūros programą yra atskiri vieši projektai, kiekvienas su savo MIT licencija, leidimais, vikiu ir atnaujinimų tikrinimu, šioje saugykloje prisegti kaip git submoduliai:

| Aplankas | Saugykla |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) – trasos ir lygiai iš žaidimų pačių archyvų |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) – ratų telemetrijos įrašymo įrankiai; lygiai iš žaidimo vaizdo įrašų |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) – Unreal Editor papildinys |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) – CS2 demonstracijos ir žemėlapiai |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) – įrašo žaidimą fone |

**Prisegta** reiškia, kad ši saugykla įrašo tiksliai vieną kiekvieno įrankio commit'ą. Peržiūros programos kopija gauna tuos commit'us:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# arba, po paprasto klonavimo:
git submodule update --init
```

Abu aukščiau nurodyti atnaujinimo keliai po atsisiuntimo paleidžia `git submodule update --init`, todėl įrankiai seka peržiūros programą iki commit'ų, prie kurių prisegta naujausia jos versija – o ne iki pačių įrankių naujausių commit'ų. Naujesnis įrankio leidimas pasiekia peržiūros programą tada, kai perkeliamas čia esantis prisegimas: pakeitimai įrankiui pirmiausia įrašomi ir įkeliami į jo paties aplanke (savo saugykloje), o tada čia įrašomas naujas prisegimas. Kiekvienas įrankis taip pat tikrina savo naujesnius leidimus; tai aprašyta jo paties saugykloje.
