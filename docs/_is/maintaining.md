---
title: "Viðhald skjalanna"
nav_order: 23
lang: "is"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Viðhald skjalanna

Þessi síða er fyrir þann sem sér um skoðarann og þennan vef. Hún telur upp skrefin til að halda síðunum, myndunum og þýðingunum réttum eftir breytingu.

Þessi vefur er athugaður aftur með **hverri útgáfu** og alltaf þegar eitthvað breytist mikið: flýtilyklar, leiðin um viðmótið, stillingar, skráarsnið. Gátlistinn:

1. **Endurbúa tilvísunarsíðurnar**: `node tools/docs-refs.mjs` (og `--lang <lang>` fyrir hvert tungumál). `node tools/docs-refs.mjs --check` mistekst þegar síða er úrelt.
2. **Endurbúa skjámyndirnar** úr [demo-gögnunum](demo-data.md). Notaðu tölvu eða gám þar sem svæðið er en-US, svo tölur lesast `0.35` en ekki `0,35` (talnareitirnir fylgja svæði vafrans þar til það er breytt). Búðu til demo-gögnin með `node tools/demo-data.mjs`, ræstu þróunarþjón á porti 5321 **án** staðbundins fígúrupakka, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, og keyrðu síðan `node tools/docs-shots.mjs --lang <lang>`. Skoðaðu hverja mynd: aðeins demo-nöfn (*Demo Valley*, *Blue 1*, *Red 3* ...), engin raunveruleg kort, leikmenn eða upptökur.
3. **Teldu upp hvað breyttist** frá síðasta útgáfumerki: `git log --oneline <last tag>..HEAD`, og hlutann **Docs** í `CHANGELOG.md`, sem tengir hvern eiginleika við sína síðu. Sérhver nýr eiginleiki þarf síðu eða kafla, með mynd þar sem hann sést á skjánum.
4. **Óháð yfirferð** á enskum síðum af einhverjum sem skrifaði þær ekki, fyrir þrjá lesendur: byrjanda, átta ára barn, sérfræðing. Eru skrefin fullkomin og í réttri röð, eru orðin þau sem eru í viðmótinu, eru myndirnar nýjar, eru merkimiðar skýringamyndanna réttir?
5. **Lagaðu það sem yfirferðin fann.**
6. **Þýddu síðurnar sem breyttust aftur** eftir uppruna-hashi, og keyrðu síðan yfirferðina fyrir hvert tungumál. Sjá `tools/docs-translate.md`.
7. **Skannaðu fyrir trúnaðarorðum** í breyttu skránum, og athugaðu að engin mynd sýni annað en demo-gögn.
8. **Birtu** aðeins þegar útgáfan er samþykkt.

Sama athugun nær yfir skjalasíður tengdu geymslnanna (sjá síðuna [Heim](index.md#related-repositories)).

## Verkfærin undir exporters/ {#the-tools-under-exporters}

Verkfærin í kringum skoðarann eru aðskildir opnir verkefni, hvert með sitt eigið MIT-leyfi, útgáfur, wiki og uppfærsluathugun, fest í þessari geymslu sem git-undireiningar:

| Mappa | Geymsla |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - brautir og borð úr eigin skjalasöfnum leikjanna |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - upptökutæki hringjamælinga; borð úr myndbandi af spilun |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - viðbót fyrir Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-upptökur og kort |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - tekur upp spilun í bakgrunni |

**Fest** þýðir að þessi geymsla skráir eina nákvæma innsendingu hvers verkfæris. Afrit af skoðaranum fær þær innsendingar:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Báðar uppfærsluleiðirnar hér að ofan keyra `git submodule update --init` eftir að hafa sótt, svo verkfærin fylgja skoðaranum á þær innsendingar sem nýjasta útgáfa hans festir - ekki nýjustu innsendingum verkfæranna sjálfra. Nýrri útgáfa verkfæris kemst í skoðarann þegar festingin hér er færð: breytingar á verkfæri eru skuldbundnar og sendar í sinni eigin möppu (sinni eigin geymslu) fyrst, og síðan er nýja festingin skuldbundin hér. Hvert verkfæri athugar líka sjálft hvort nýrri útgáfur séu til; það er skjalfest í eigin geymslu.
