---
title: "Održavanje dokumentacije"
nav_order: 23
lang: "hr"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Održavanje dokumentacije

Ova stranica je za onoga tko brine o pregledniku i ovoj stranici. Navodi korake da stranice, slike i prijevodi ostanu ispravni nakon promjene.

Ovo mjesto se ponovno provjerava uz **svako izdanje** i kad se nešto mnogo mijenja: tipke, put kroz sučelje, postavke, formati datoteka. Popis za provjeru:

1. **Ponovno generiraj stranice s referencama**: `node tools/docs-refs.mjs` (i `--lang <lang>` za svaki jezik). `node tools/docs-refs.mjs --check` ne prolazi kad je stranica zastarjela.
2. **Ponovno generiraj slike zaslona** iz [demo podataka](demo-data.md). Koristi računalo ili kontejner čija je regija en-US, da se brojevi čitaju kao `0.35`, a ne `0,35` (okviri za brojeve prate regiju preglednika dok se ne promijeni). Napravi demo podatke s `node tools/demo-data.mjs`, pokreni razvojni poslužitelj na portu 5321 **bez** lokalnog paketa figura, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, pa pokreni `node tools/docs-shots.mjs --lang <lang>`. Pogledaj svaku sliku: smiju biti samo demo nazivi (*Demo Valley*, *Blue 1*, *Red 3* ...), bez pravih karata, igrača ili snimki.
3. **Popiši što se promijenilo** od zadnje oznake izdanja: `git log --oneline <zadnja oznaka>..HEAD`, i odjeljak **Docs** u `CHANGELOG.md`, koji povezuje svaku značajku sa stranicom. Svaka nova značajka treba stranicu ili odjeljak, sa slikom kad se prikazuje na zaslonu.
4. **Neovisan pregled** engleskih stranica od nekoga tko ih nije napisao, za tri čitatelja: početnika, osmogodišnjaka i stručnjaka. Jesu li koraci potpuni i u pravom redu, jesu li riječi one iz sučelja, jesu li slike aktualne, jesu li oznake na dijagramima točne?
5. **Popravi što je pregled našao.**
6. **Ponovno prevedi promijenjene stranice** prema njihovom izvornom hashu, pa pokreni pregled po jeziku. Vidi `tools/docs-translate.md`.
7. **Pretraži povjerljive pojmove** u promijenjenim datotekama i provjeri da nijedna slika ne prikazuje ništa osim demo podataka.
8. **Objavi** tek kad je izdanje odobreno.

Ista provjera pokriva i dokumentacijske stranice povezanih repozitorija (vidi stranicu [Početna](index.md#related-repositories)).

## Alati u exporters/ {#the-tools-under-exporters}

Alati oko preglednika su zasebni javni projekti, svaki sa svojom MIT licencom, izdanjima, wikijem i provjerom ažuriranja, prikvačeni u ovom repozitoriju kao git submoduli:

| Mapa | Repozitorij |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - staze i razine iz vlastitih arhiva igara |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - snimatelji telemetrije krugova; razine iz videa igre |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - dodatak za Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demo snimke i karte |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - snima igru u pozadini |

**Prikvačeno** znači da ovaj repozitorij bilježi točno jedan commit svakog alata. Kopija preglednika dobija te commitove:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Oba gore navedena puta ažuriranja pokreću `git submodule update --init` nakon povlačenja, pa alati prate preglednik na commitove koje prikvačuje njegova najnovija verzija - a ne na najnovije commitove samih alata. Novije izdanje alata stiže do preglednika kad se ovdje pomakne prikvačenje: promjene alata najprije se commitaju i guraju u njegovu vlastitu mapu (vlastiti repozitorij), pa se tek onda ovdje commita novo prikvačenje. Svaki alat također provjerava vlastita novija izdanja; to je dokumentirano u njegovu repozitoriju.
