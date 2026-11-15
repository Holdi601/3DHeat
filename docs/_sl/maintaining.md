---
title: "Vzdrževanje dokumentacije"
nav_order: 23
lang: "sl"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Vzdrževanje dokumentacije

Ta stran je za tistega, ki skrbi za pregledovalnik in to spletno mesto. Našteva korake, s katerimi po spremembi ohranite strani, slike in prevode pravilne.

To spletno mesto se znova preveri ob **vsaki izdaji** in kadar se kaj zelo spremeni: bližnjice tipk, pot skozi uporabniški vmesnik, nastavitve, datotečni formati. Kontrolni seznam:

1. **Ponovno ustvarite referenčne strani**: `node tools/docs-refs.mjs` (in `--lang <jezik>` za vsak jezik). `node tools/docs-refs.mjs --check` pade, kadar je stran zastarela.
2. **Ponovno ustvarite posnetke zaslona** iz [demo podatkov](demo-data.md). Uporabite računalnik ali vsebnik, katerega regija je en-US, da so števila `0.35` in ne `0,35` (polja za števila sledijo regiji brskalnika, dokler je ne spremenite). Demo podatke ustvarite z `node tools/demo-data.mjs`, zaženite razvojni strežnik na vratih 5321 **brez** lokalnega paketa figur, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, nato zaženite `node tools/docs-shots.mjs --lang <jezik>`. Oglejte si vsako sliko: samo imena demo (*Demo Valley*, *Blue 1*, *Red 3* ...), brez pravih zemljevidov, igralcev ali posnetkov.
3. **Seznam sprememb** od zadnje oznake izdaje: `git log --oneline <zadnja oznaka>..HEAD` in razdelek **Docs** v `CHANGELOG.md`, ki vsako funkcijo poveže s stranjo. Vsaka nova funkcija potrebuje stran ali razdelek, s sliko, kjer se pokaže na zaslonu.
4. **Neodvisen pregled** angleških strani s strani nekoga, ki jih ni pisal, za tri bralce: začetnika, osemletnika in strokovnjaka. Ali so koraki popolni in v pravem vrstnem redu, ali so besede tiste iz uporabniškega vmesnika, ali so slike aktualne, ali so oznake na diagramih pravilne?
5. **Popravite, kar je pregled odkril.**
6. **Ponovno prevedite spremenjene strani** po njihovem zgoščenem izrazu vira, nato za vsak jezik opravite pregled. Glejte `tools/docs-translate.md`.
7. **Preglejte spremenjene datoteke za zaupne izraze** in preverite, da nobena slika ne prikazuje ničesar razen demo podatkov.
8. **Objavite** samo, ko je izdaja odobrena.

Enak pregled velja za dokumentacijska spletna mesta sorodnih repozitorijev (glejte stran [Domov](index.md#related-repositories)).

## Orodja pod exporters/ {#the-tools-under-exporters}

Orodja okoli pregledovalnika so ločeni javni projekti, vsak s svojo licenco MIT, izdajami, wikijem in preverjanjem posodobitev, v tem repozitoriju pa so pripeta kot git podmoduli:

| Mapa | Repozitorij |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) – poti in ravni iz lastnih arhivov iger |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) – snemalniki telemetrije krogov; ravni iz posnetkov igranja |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) – vtičnik za urejevalnik Unreal |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) – demo posnetki in zemljevidi CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) – snema igranje v ozadju |

**Pripeto** pomeni, da ta repozitorij beleži točno en commit vsakega orodja. Kopija pregledovalnika dobi te commite:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# ali, po navadnem klonu:
git submodule update --init
```

Obe poti posodobitve zgoraj po povleku izvedeta `git submodule update --init`, zato orodja sledijo pregledovalniku do commitov, ki jih pripenja njegova najnovejša različica – ne najnovejšim commitom orodij. Novejša izdaja orodja pride do pregledovalnika, ko se tukaj premakne pripetje: spremembe orodja se najprej potrdijo in pošljejo v njegovi lastni mapi (v njegovem lastnem repozitoriju), šele nato se tukaj potrdi novo pripetje. Vsako orodje tudi preverja svoje novejše izdaje; to je dokumentirano v njegovem lastnem repozitoriju.
