---
title: "Održavanje dokumentacije"
nav_order: 23
lang: "bs"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Održavanje dokumentacije

Ova stranica je za onoga ko održava preglednik i ovaj sajt. Navodi korake da stranice, slike i prijevodi ostanu tačni nakon promjene.

Ovaj sajt se ponovo provjerava pri **svakom izdanju** i kad se nešto mnogo promijeni: prečice, put kroz korisnički interfejs, postavke, formati datoteka. Lista provjere:

1. **Ponovo generišite stranice sa referencama**: `node tools/docs-refs.mjs` (i `--lang <jezik>` za svaki jezik). `node tools/docs-refs.mjs --check` pada kad je stranica zastarjela.
2. **Ponovo generišite snimke ekrana** iz [demo podataka](demo-data.md). Koristite računar ili kontejner čiji je region en-US, da brojevi glase `0.35` a ne `0,35` (polja za brojeve prate region pregledača dok se ne promijeni). Napravite demo podatke sa `node tools/demo-data.mjs`, pokrenite razvojni server na portu 5321 **bez** lokalnog paketa figura, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, pa pokrenite `node tools/docs-shots.mjs --lang <jezik>`. Pogledajte svaku sliku: samo imena demo podataka (*Demo Valley*, *Blue 1*, *Red 3* ...), bez pravih karata, igrača ili snimaka.
3. **Navedite šta se promijenilo** od zadnje oznake izdanja: `git log --oneline <zadnja oznaka>..HEAD`, i odjeljak **Docs** u `CHANGELOG.md`, koji povezuje svaku funkciju sa njenom stranicom. Svaka nova funkcija treba stranicu ili odjeljak, sa slikom gdje se pokazuje na ekranu.
4. **Nezavisan pregled** engleskih stranica od nekoga ko ih nije pisao, za tri čitaoca: početnika, osmogodišnjaka, stručnjaka. Jesu li koraci potpuni i u pravom redoslijedu, riječi su one iz korisničkog interfejsa, slike su aktuelne, oznake na dijagramima tačne?
5. **Popravite ono što je pregled pronašao.**
6. **Ponovo prevedite promijenjene stranice** po njihovom hešu izvora, pa pokrenite pregled po jeziku. Vidi `tools/docs-translate.md`.
7. **Pretražite povjerljive pojmove** u promijenjenim datotekama i provjerite da nijedna slika ne pokazuje ništa osim demo podataka.
8. **Objavite** samo kad je izdanje odobreno.

Ista provjera pokriva i sajtove dokumentacije srodnih repozitorijuma (vidi stranicu [Početna](index.md#related-repositories)).

## Alati pod exporters/ {#the-tools-under-exporters}

Alati oko preglednika su zasebni javni projekti, svaki sa sopstvenom MIT licencom, izdanjima, wikijem i provjerom ažuriranja, zakačeni u ovaj repozitorijum kao git submoduli:

| Fascikla | Repozitorijum |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - staze i nivoi iz arhiva samih igara |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - snimači telemetrije krugova; nivoi iz video snimaka igre |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - dodatak za Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demo snimci i karte |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - snima igru u pozadini |

**Zakačeno** znači da ovaj repozitorijum bilježi tačno jedan commit svakog alata. Kopija preglednika dobija te commite:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# ili, poslije običnog klona:
git submodule update --init
```

Oba puta ažuriranja iznad pokreću `git submodule update --init` nakon povlačenja, pa alati prate preglednik na commite koje zakači njegova najnovija verzija, a ne na najnovije commite samih alata. Novije izdanje nekog alata stiže do preglednika kad se ovdje pomjeri zakačeni commit: promjene alata se prvo commituju i guraju u njegovu fasciklu (sopstveni repozitorijum), pa se tek onda ovdje commituje novo zakačenje. Svaki alat takođe provjerava svoja novija izdanja; to je dokumentovano u njegovom sopstvenom repozitorijumu.
