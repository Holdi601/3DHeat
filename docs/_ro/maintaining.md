---
title: "Întreținerea documentației"
nav_order: 23
lang: "ro"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# Întreținerea documentației

Pagina aceasta este pentru cine întreține vizualizatorul și acest site. Listează pașii pentru a păstra paginile, imaginile și traducerile corecte după o schimbare.

Acest site este verificat din nou la **fiecare lansare** și ori de câte ori ceva se schimbă mult: combinații de taste, drumul prin interfață, setări, formate de fișiere. Lista de verificare:

1. **Regenerează paginile de referință**: `node tools/docs-refs.mjs` (și `--lang <limbă>` pentru fiecare limbă). `node tools/docs-refs.mjs --check` eșuează când o pagină este depășită.
2. **Regenerează capturile de ecran** din [datele demo](demo-data.md). Folosește un calculator sau un container a cărui regiune este en-US, ca numerele să se citească `0.35` și nu `0,35` (casetele de numere urmează regiunea browserului până când sunt schimbate). Fă datele demo cu `node tools/demo-data.mjs`, pornește un server de dezvoltare pe portul 5321 **fără** un pachet local de figuri, `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`, apoi rulează `node tools/docs-shots.mjs --lang <limbă>`. Uită-te la fiecare imagine: doar nume demo (*Demo Valley*, *Blue 1*, *Red 3* ...), fără hărți reale, jucători sau înregistrări.
3. **Listează ce s-a schimbat** de la ultima etichetă de lansare: `git log --oneline <ultima etichetă>..HEAD`, și secțiunea **Docs** din `CHANGELOG.md`, care leagă fiecare funcție de pagina ei. Fiecare funcție nouă are nevoie de o pagină sau de o secțiune, cu o imagine acolo unde apare pe ecran.
4. **Recenzie independentă** a paginilor în engleză de către cineva care nu le-a scris, pentru trei cititori: un începător, un copil de opt ani, un expert. Pașii sunt complet și în ordinea corectă, cuvintele sunt cele ale interfeței, imaginile sunt actuale, etichetele diagramelor sunt corecte?
5. **Repară ce a găsit recenzia.**
6. **Retraduce paginile schimbate** după hash-ul lor sursă, apoi rulează recenzia pe fiecare limbă. Vezi `tools/docs-translate.md`.
7. **Scanează termenii confidențiali** în fișierele schimbate și verifică faptul că nicio imagine nu arată altceva decât date demo.
8. **Publică** doar când lansarea este aprobată.

Aceeași verificare acoperă site-urile de documentație ale depozitelor înrudite (vezi pagina [Acasă](index.md#related-repositories)).

## Uneltele din exporters/ {#the-tools-under-exporters}

Uneltele din jurul vizualizatorului sunt proiecte publice separate, fiecare cu propria licență MIT, lansări, wiki și verificare a actualizărilor, fixate în acest depozit ca submodule git:

| Director | Depozit |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - curse și nivele scoase din arhivele proprii ale jocurilor |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - înregistratoare de telemetrie a turelor; nivele din video de joc |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - plugin pentru Unreal Editor |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - demo-uri și hărți CS2 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - înregistrează jocul în fundal |

**Fixat** înseamnă că acest depozit înregistrează exact un commit al fiecărei unelte. O copie a vizualizatorului primește acele commituri:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# sau, după un clone simplu:
git submodule update --init
```

Ambele căi de actualizare de mai sus rulează `git submodule update --init` după descărcare, deci uneltele urmează vizualizatorul până la commiturile fixate de cea mai nouă versiune a lui - nu cele mai noi commituri ale uneltelor. O lansare mai nouă a unei unelte ajunge în vizualizator când se mută fixarea de aici: schimbările unei unelte se fac commit și push întâi în folderul ei (în propriul ei depozit), apoi noua fixare se face commit aici. Fiecare unealtă verifică și ea lansările mai noi; asta este documentat în propriul ei depozit.
