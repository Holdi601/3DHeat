---
title: "Dokumentatsiooni hooldamine"
nav_order: 23
lang: "et"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Dokumentatsiooni hooldamine

See leht on mõeldud sellele, kes hoolitseb vaataja ja selle saidi eest. See loetleb sammud, et hoida leheküljed, pildid ja tõlked pärast muudatust õiged.

Seda saiti kontrollitakse uuesti iga **väljaande** puhul ja alati, kui midagi muutub suurelt: klahvikombinatsioonid, tee läbi kasutajaliidese, seaded, failivormingud. Kontrollnimekiri:

1. **Genereeri viitelehed uuesti**: `node tools/docs-refs.mjs` (ja `--lang <keel>` iga keele jaoks). `node tools/docs-refs.mjs --check` nurjub, kui leht on aegunud.
2. **Genereeri ekraanipildid uuesti** [demoandmetest](demo-data.md). Kasuta arvutit või konteinerit, mille piirkond on en-US, et numbrid oleksid `0.35`, mitte `0,35` (numbrikastid järgivad brauseri piirkonda, kuni seda ei muudeta). Tee demoandmed käsuga `node tools/demo-data.mjs`, käivita arendusserver pordil 5321 **ilma** kohaliku kujupakita: `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`. Seejärel käivita `node tools/docs-shots.mjs --lang <keel>`. Vaata iga pilti: peavad olema ainult demonimed (*Demo Valley*, *Blue 1*, *Red 3* ...), mitte ühtegi päris kaarti, mängijat ega salvestist.
3. **Loetle, mis on muutunud** viimasest väljaande märgendist: `git log --oneline <viimane märgend>..HEAD` ja `CHANGELOG.md` jaotis **Docs**, mis seob iga funktsiooni oma leheküljega. Iga uus funktsioon vajab lehte või jaotist, ja pilti, kui see ekraanil näitub.
4. **Sõltumatu ülevaatus** inglisekeelsetest lehtedest inimese poolt, kes neid ei kirjutanud, kolme lugeja jaoks: algaja, kaheksaaastane ja ekspert. Kas sammud on täielikud ja õiges järjekorras? Kas sõnad on kasutajaliidese omad? Kas pildid on ajakohased ja kas skeemide sildid on õiged?
5. **Paranda, mida ülevaatus leidis.**
6. **Tõlgi muudetud lehed uuesti nende lähtekoodi räsi järgi** ja tee iga keele ülevaatus. Vt `tools/docs-translate.md`.
7. **Skaneeri konfidentsiaalsed terminid** muudetud failides ja kontrolli, et ükski pilt ei näita muud kui demoandmeid.
8. **Avalda** ainult siis, kui väljaanne on kinnitatud.

Sama kontroll katab seotud repode dokumentatsioonisaidid (vt [Avaleht](index.md#related-repositories)).

## Tööriistad kaustas exporters/ {#the-tools-under-exporters}

Vaatajat ümbritsevad tööriistad on eraldi avalikud projektid. Igaühel on oma MIT litsents, väljaanded, wiki ja uuenduste kontroll, ning need on siin repos kinnitatud git-alammoodulitena:

| Kaust | Repo |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - rajad ja tasemed mängude enda arhiividest |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - ringi telemeetria salvestajad; tasemed mängu videost |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editori plugin |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demod ja kaardid |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - salvestab mängu taustal |

**Kinnitatud** tähendab, et see repo salvestab iga tööriista ühe täpse commit'i. Vaatajat kloonides saab need commit'id:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# või pärast tavalist kloonimist:
git submodule update --init
```

Mõlemad ülalolevad uuendusteed käivitavad pärast tõmbamist `git submodule update --init`, nii et tööriistad järgivad vaatajat selle commit'ideni, mille tema uusim versioon kinnitab, mitte tööriistade enda uusimate commit'ideni. Tööriista uuem väljaanne jõuab vaatajani siis, kui siinne kinnitus liigutatakse. Muudatused tööriistas tehakse ja lükatakse üles esmalt oma kaustas (oma repos), seejärel commit'itakse siia uus kinnitus. Iga tööriist kontrollib ka oma uuemaid väljaandeid; see on dokumenteeritud tema enda repos.
