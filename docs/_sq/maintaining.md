---
title: "Mirëmbajtja e dokumentacionit"
nav_order: 23
lang: "sq"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Mirëmbajtja e dokumentacionit

Kjo faqe është për kënd kujdeset për shikuesin dhe për këtë sajt. Liston hapat për t'i mbajtur faqet, figurat dhe përkthimet të sakta pas një ndryshimi.

Ky sajt rikontrollohet me **çdo publikim** dhe sa herë që diçka ndryshon shumë: çelësat, rruga përmes ndërfaqes, cilësimet, formatet e skedarëve. Lista e kontrollit:

1. **Rigjenero faqet e referencës**: `node tools/docs-refs.mjs` (dhe `--lang <kodi>` për çdo gjuhë). `node tools/docs-refs.mjs --check` dështon kur një faqe është e vjetër.
2. **Rigjenero pamjet e ekranit** nga [të dhënat e demos](demo-data.md). Përdor një kompjuter ose kontejner me rajonin en-US, që numrat të lexohen `0.35` e jo `0,35` (kutitë e numrave ndjekin rajonin e shfletuesit derisa të ndryshohen). Krijo të dhënat e demos me `node tools/demo-data.mjs`, nis një server zhvillimi në portin 5321 **pa** paketë lokale figurash, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, pastaj ekzekuto `node tools/docs-shots.mjs --lang <kodi>`. Shiko çdo figurë: vetëm emra demo (*Demo Valley*, *Blue 1*, *Red 3* ...), pa harta reale, lojtarë ose regjistrime.
3. **Listo çfarë ndryshoi** që nga etiketa e fundit e publikimit: `git log --oneline <etiketa e fundit>..HEAD`, dhe seksioni **Docs** i `CHANGELOG.md`, që e lidh çdo veçori me faqen e saj. Çdo veçori e re ka nevojë për një faqe ose seksion, me një figurë aty ku shfaqet në ekran.
4. **Rishikim i pavarur** i faqeve angleze nga dikush që nuk i ka shkruar, për tre lexues: një fillestar, një fëmijë tetë vjeç, një ekspert. A janë hapat të plotë dhe në rendin e duhur, fjalët ato të ndërfaqes, figurat aktuale, etiketat e diagramave të sakta?
5. **Rregullo çfarë gjeti rishikimi.**
6. **Ri-përkthe faqet e ndryshuara** sipas hashit të burimit, pastaj bëj rishikimin për çdo gjuhë. Shih `tools/docs-translate.md`.
7. **Skano për terma konfidencialë** te skedarët e ndryshuar, dhe kontrollo që asnjë figurë të mos tregojë gjë tjetër përveç të dhënave demo.
8. **Publiko** vetëm kur publikimi është miratuar.

I njëjti kontroll mbulon sajtet e dokumentacionit të depove të lidhura (shih faqen [Hyrja](index.md#related-repositories)).

## Mjetet nën exporters/ {#the-tools-under-exporters}

Mjetet rreth shikuesit janë projekte publike të veçanta, secili me licencën e vet MIT, publikimet, wiki dhe kontrollin e përditësimeve, të fiksuara në këtë depo si nën-module git:

| Dosja | Depoja |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - pista dhe nivele nga arkivat e vetë lojërave |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - regjistrues telemetrie xhirosh; nivele nga video e lojës |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - shtesë për Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demo dhe harta CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - regjistron lojën në sfond |

**Fiksuar** do të thotë që kjo depo regjistron një commit të saktë të çdo mjeti. Një kopje e shikuesit i merr ato commit-e:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Të dy rrugët e përditësimit më sipër ekzekutojnë `git submodule update --init` pas tërheqjes, kështu që mjetet ndjekin shikuesin te commit-et që fikson versioni i tij më i ri - jo commit-et më të reja të vetë mjeteve. Një publikim më i ri i një mjeti arrin te shikuesi kur fiksimi këtu zhvendoset: ndryshimet e një mjeti commit-ohen dhe shtyhen së pari në dosjen e vet (depoja e vet), pastaj fiksimi i ri commit-ohet këtu. Çdo mjet kontrollon gjithashtu publikimet e veta më të reja; kjo dokumentohet në depon e vet.
