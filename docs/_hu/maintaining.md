---
title: "A dokumentáció karbantartása"
nav_order: 23
lang: "hu"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# A dokumentáció karbantartása

Ez az oldal a nézegető és ez az oldal karbantartóinak szól. Felsorolja azokat a lépéseket, amelyekkel egy változás után a lapok, a képek és a fordítások helyesek maradnak.

Ezt az oldalt **minden kiadáskor** újra ellenőrizzük, és valahányszor valami sokat változik: billentyűkiosztások, a felhasználói felületen való út, beállítások, fájlformátumok. A ellenőrzőlista:

1. **Generáld újra a referenciaoldalakat**: `node tools/docs-refs.mjs` (és nyelvenként a `--lang <nyelv>`). A `node tools/docs-refs.mjs --check` meghiúsul, ha egy oldal elavult.
2. **Generáld újra a képernyőképeket** a [demóadatokból](demo-data.md). Olyan számítógépet vagy konténert használj, amelynek régiója en-US, hogy a számok `0.35` alakban jelenjenek meg, és ne `0,35` alakban (a számmezők a böngésző régióját követik, amíg meg nem változtatod). Készítsd el a demóadatot a `node tools/demo-data.mjs` paranccsal, indíts egy fejlesztői szervert az 5321-es porton **helyi figurakészlet nélkül**, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, majd futtasd a `node tools/docs-shots.mjs --lang <nyelv>` parancsot. Nézd meg minden képet: csak demónevek (*Demo Valley*, *Blue 1*, *Red 3* ...), semmi valódi térkép, játékos vagy felvétel.
3. **Sorold fel, mi változott** az utolsó kiadási címke óta: `git log --oneline <utolsó címke>..HEAD`, és a `CHANGELOG.md` **Docs** része, amely minden funkciót a saját oldalához köt. Minden új funkcióhoz oldal vagy szakasz kell, és kép, ha a képernyőn megjelenik.
4. **Független átnézés** az angol oldalaknak valakitől, aki nem írta őket, három olvasónak: egy kezdőnek, egy nyolcévesnek és egy szakértőnek. Teljesek és a helyes sorrendben vannak a lépések, az UI szavait használják, a képek naprakészek, a diagramok címkéi helyesek?
5. **Javítsd, amit az átnézés talált.**
6. **Fordítsd újra a megváltozott oldalakat** a forrás-hashük alapján, majd futtasd az átnézést nyelvenként. Lásd: `tools/docs-translate.md`.
7. **Keress bizalmas kifejezéseket** a megváltozott fájlokban, és ellenőrizd, hogy egyik kép sem mutat demóadaton kívül mást.
8. **Csak akkor közzéteszed**, ha a kiadást jóváhagyták.

Ugyanez az ellenőrzés vonatkozik a kapcsolódó tárolók dokumentációs oldalaira is (lásd a [Kezdőlap](index.md#related-repositories) oldalt).

## Az exporters/ alatti eszközök {#the-tools-under-exporters}

A nézegető körüli eszközök külön nyilvános projektek, mindegyiknek saját MIT licence, kiadásai, wikije és frissítés-ellenőrzése van, és ebben a tárolóban git-almodulként vannak rögzítve:

| Mappa | Tároló |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - pályák és szintek a játékok saját archívumaiból |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - körtelemetria-rögzítők; szintek játékmenet-videóból |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor bővítmény |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2-demók és térképek |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - a játékot a háttérben rögzíti |

A **rögzített** azt jelenti, hogy ez a tároló minden eszközből egy pontos commitot jegyez fel. A nézegető egy másolata ezeket a commitokat kapja meg:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# vagy egy sima klónozás után:
git submodule update --init
```

A fenti frissítési módok mindkettője lefuttatja a `git submodule update --init` parancsot a húzás után, így az eszközök a nézegetőt követik azokra a commitokra, amelyeket a legújabb verziója rögzít - nem az eszközök saját legújabb commitjaira. Egy eszköz újabb kiadása akkor jut el a nézegetőhöz, amikor ennek a tárolónak a rögzítése átlép rá: az eszköz változásait először az eszköz saját mappájában (saját tárolójában) commitoljuk és töltjük fel, utána ebben a tárolóban commitoljuk az új rögzítést. Minden eszköz maga is ellenőrzi a saját újabb kiadásait; ez az ő saját tárolójában van dokumentálva.
