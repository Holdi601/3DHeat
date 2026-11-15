---
title: "Aktualizace"
nav_order: 21
lang: "cs"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Aktualizace

Prohlížeč vám řekne, když existuje novější verze, a aktualizuje se sám, jen když řeknete ano. Nic na vašem počítači se nemění bez vaší odpovědi.

## Aktualizace prohlížeče {#update-the-viewer}

1. **Na stránce.** Když existuje novější verze, pod názvem nahoře v postranním panelu se objeví okno: „Je dostupná novější verze 3DHeat“. Klikněte na **Aktualizovat teď**. Stránka se po dokončení sama znovu načte. **Později** okno skryje, dokud stránku znovu nenačtete.
2. **Když to říká spustit restart.bat**, zavřete okno serveru (černé okno, které otevřel `start.bat`) a dvojklikem spusťte `restart.bat`.
3. **Při spuštění prohlížeče.** `start.bat` také kontroluje. Pokud existuje novější verze, zeptá se **Aktualizovat teď? [A/N]**. Stiskněte `A` pro aktualizaci. Stiskněte `N`, nebo počkejte 60 sekund bez odpovědi, a spustí se verze, kterou máte.

![Oznámení o aktualizaci s tlačítky Aktualizovat teď a Později](../assets/img/en/updates-notice.webp)

Kopie s vašimi vlastními změnami se nikdy neaktualizuje za vás; okno jen říká, že čeká aktualizace, a vyzve k potvrzení nebo odložení změn a spuštění `git pull`. Kopie nainstalovaná bez gitu (například soubor zip) nezobrazí nic.

Jak kontrola funguje, krok za krokem:

```
stránka ---(po 4 s, pak každých 6 h)---> vývojový server ---> git fetch
   za?  ne  -> nic se nezobrazí
        ano -> vaše vlastní změny nebo commity?  ano -> jen vás informuje
                                                 ne  -> [Aktualizovat teď] -> git pull
                                                        -> znovu načíst, nebo „spusťte restart.bat“
```

## Bezpečnostní pravidla {#the-safety-rules}

- **Jen rychlé přetočení vpřed** (`git pull --ff-only`): aktualizace nikdy nic nesloučí, nepřebaseuje ani nepřepíše.
- **Žádné místní změny**: kopie s nepotvrzenými změnami sledovaných souborů (`git status --porcelain --untracked-files=no` není prázdné) se nikdy automaticky neaktualizuje – cizí práce není to, co by aktualizace měla přepsat. Jen se oznámí, že čeká aktualizace. Nesledované soubory (data, exporty) se za změny nepočítají.
- **Žádné místní commity**: kopie s commity, které nadřazená větev nemá („rozdělená“), se neaktualizuje – rychlé přetočení ji nemůže dotáhnout a sloučení je pro `git pull` ručně. Stránka i `start.bat` to řeknou stejnými slovy a `start.bat` spustí verzi, která tam je.
- **Jen ze samotné stránky**: požadavek vývojového serveru na aktualizaci musí nést vlastní hlavičku a, když posílá `Origin`, musí přijít z vlastního hostitele serveru (níže).
- Aktualizuje se jen kopie gitu s nadřazenou větví; cokoli jiného (kopie bez `.git`, bez gitu, statický build) se nechá být a nic neřekne.

## Co dělá start.bat {#what-startbat-does}

`start.bat` (dvojklik; okno je server) dělá postupně:

1. Najde Node.js – v `PATH`, jinak v `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` nebo `%LOCALAPPDATA%\Programs\nodejs` – a když chybí, nabídne instalaci příkazem `winget install -e --id OpenJS.NodeJS.LTS` (zeptá se, A/N; potom je třeba okno znovu otevřít, aby Windows převzaly nový `PATH`).
2. **Aktualizace**, když je nainstalován git a složka má `.git`:
   - `git fetch --quiet` (bez sítě nebo bez nadřazené větve: tiše přeskočeno);
   - spočítá `git rev-list --count HEAD..@{u}`; nic za: nic se neřekne;
   - místní změny: „Je dostupná novější verze 3DHeat (N změn), ale tato kopie má místní změny, takže se neaktualizuje. Potvrďte je nebo odložte, pak spusťte git pull.“ – a spustí verzi, která tam je;
   - vlastní commity (`git rev-list --count @{u}..HEAD` není 0): „Je dostupná novější verze 3DHeat (N změn), ale tato kopie má vlastní commity, které nejnovější verze nemá, takže se neaktualizuje. Aktualizujte ji příkazem git pull.“ – a spustí verzi, která tam je;
   - jinak „Je dostupná novější verze 3DHeat (N změn).“ a otázka **Aktualizovat teď? [A/N]**. `N`, nebo žádná odpověď 60 sekund, vypíše „Neaktualizováno; spouští se verze, kterou máte.“ a spustí verzi, která tam je. Při `A`: „Aktualizuji...“, řekne, zda se změní `package.json` nebo `package-lock.json`, spustí `git pull --ff-only` (kdyby to stále selhalo – například sítí: „Aktualizace neproběhla; spouští se verze, kterou máte.“), pak `git submodule update --init` (připnuté nástroje, viz [Údržba dokumentace](maintaining.md#the-tools-under-exporters)), pak `npm install`, když se změnily soubory balíčku a `node_modules` existuje, a „Aktualizováno.“
3. Odmítne spustit druhý server: když už na portu **5273** něco naslouchá, řekne to a odkáže na `restart.bat` / `stop.bat`.
4. Při prvním spuštění (bez `node_modules`) se zeptá, než stáhne závislosti (asi 300 MB do `node_modules\`, nic v systému).
5. Spustí vývojový server na `127.0.0.1:5273` (`--strictPort`) a až bude připraven, otevře prohlížeč.

`restart.bat` zastaví server (podle portu) a znovu spustí `start.bat`, takže se zeptá stejně. `stop.bat` jen zastaví.

## Pro vývojáře {#for-developers}

### Za chodu: trasa aktualizace {#while-it-runs-the-update-route}

Vývojový server (plugin Vite `heat3d-self-update` v `vite.config.ts`) obsluhuje `/__heat3d/update`. Existuje jen na vývojovém serveru – ne ve statickém buildu a ne v `vite preview`.

**`GET /__heat3d/update`** odpoví, zda je kopie za:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, když složka není kopie gitu;
- spustí `git fetch --quiet` **nejvýš každých 30 minut** (dotazy mezi tím odpovídají z naposledy stažených dat);
- `behind` / `ahead` z `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` z `git status --porcelain --untracked-files=no`, `latest` je předmět nejnovějšího commitu nadřazené větve;
- bez nadřazené větve `upstream: null` a `behind: 0`.

**`POST /__heat3d/update/apply`** uvede kopii do stavu:

1. Odmítnuto `403 { ok: false, reason: "forbidden" }`, pokud požadavek nemá hlavičku `X-Heat3d-Update: 1` a, když nese `Origin`, pokud hostitel toho původu není `Host` požadavku. Cross-site formulář nemůže poslat vlastní hlavičku bez předběžné kontroly CORS, kterou tento server nikdy neudělí.
2. Nic k práci (není kopie, žádná nadřazená větev, není za): `{ ok: true, updated: false }`.
3. Místní změny: `{ ok: false, reason: "dirty" }`; místní commity: `{ ok: false, reason: "diverged" }`.
4. Jinak: zjistí, které soubory se změní (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (časový limit 2 min), `git submodule update --init` (selhání se ignoruje), `npm install`, když se změnil `package.json` nebo `package-lock.json` (časový limit 15 min), a odpoví `{ ok: true, updated: true, restart }` – `restart` říká, proč běžící server aktualizaci nemůže převzít: `"dependencies"`, když se závislosti znovu nainstalovaly, `"config"`, když se změnil jen soubor `vite.config`, `false`, když restart není třeba.
5. Selhávající příkaz git nebo npm odpoví `{ ok: false, reason: "<chyba, nejvýš 300 znaků>" }`.

Odpovědi jsou JSON s `Cache-Control: no-store`. Server naslouchá jen na `127.0.0.1`, takže trasa není dosažitelná ze sítě.

### Oznámení na stránce {#the-notice-in-the-page}

`UpdateBanner`, pod názvem nahoře v postranním panelu:

- Trasu se zeptá **4 sekundy** po načtení stránky (ne v prvních sekundách: stránka má co načítat a GPU se spouští) a znovu **každých 6 hodin**, dokud stránka zůstává otevřená.
- Nezobrazí **nic**, když trasa neexistuje (statický build), složka není kopie, nebo nic novějšího není – oznámení při každém spuštění se naučíte ignorovat.
- Za, bez místních změn: „Je dostupná novější verze 3DHeat (N změn, nejnovější: <předmět>).“ s **Aktualizovat teď** a **Později** (*Později* skryje, dokud se stránka znovu nenačte).
- Za, s místními změnami: stejná věta a „Tato kopie má místní změny, takže se neaktualizuje automaticky; potvrďte je nebo odložte, pak spusťte git pull.“ – bez tlačítka.
- **Aktualizovat teď** odešle `/apply` („Aktualizuji...“). Pak:
  - „Aktualizováno. Stránka se znovu načítá.“ – a znovu načte se o 1,5 s později (server už podává nové soubory);
  - když se závislosti znovu nainstalovaly: „Aktualizováno. Jeho závislosti se změnily: zavřete okno serveru a spusťte **restart.bat**, aby se to dokončilo.“;
  - když se změnilo jen nastavení serveru: „Aktualizováno. Nastavení serveru se změnilo: zavřete okno serveru a spusťte **restart.bat**, aby se to dokončilo.“;
  - nakonec nic k převzetí (`updated: false` – kopii mezitím uvedl do stavu třeba `start.bat`): „Nic k aktualizaci: tato kopie je už nejnovější verze.“ – a bez znovunačtení;
  - odmítnuto: věta o *místních změnách*, nebo „Tato kopie má vlastní commity, které nejnovější verze nemá; aktualizujte ji příkazem git pull.“, nebo „Aktualizace neproběhla: <důvod>“.
