---
title: "Aktualizácie"
nav_order: 21
lang: "sk"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Aktualizácie

Prehliadač vám povie, keď existuje novšia verzia, a aktualizuje sa sám len vtedy, keď poviete áno. Nič na vašom počítači sa nemení bez vašej odpovede.

## Aktualizácia prehliadača {#update-the-viewer}

1. **Na stránke.** Keď existuje novšia verzia, pod názvom hore na bočnom paneli sa objaví box: „K dispozícii je novšia verzia 3DHeat“. Kliknite na **Aktualizovať teraz**. Stránka sa po dokončení sama znova načíta. **Neskôr** skryje box, kým stránku neobnovíte.
2. **Ak hovorí, aby ste spustili restart.bat**, zatvorte okno servera (čierne okno, ktoré otvoril `start.bat`) a dvakrát kliknite na `restart.bat`.
3. **Pri spustení prehliadača.** `start.bat` tiež kontroluje. Ak existuje novšia verzia, opýta sa **Aktualizovať teraz? [Y/N]**. Stlačte `Y` na aktualizáciu. Stlačte `N`, alebo počkajte 60 sekúnd bez odpovede, a spustí sa verzia, ktorú máte.

![Upozornenie na aktualizáciu s Aktualizovať teraz a Neskôr](../assets/img/sk/updates-notice.webp)

Kópia s vašimi vlastnými zmenami sa nikdy nezaktualizuje za vás; box len hovorí, že čaká aktualizácia, a povie, aby ste zmeny potvrdili alebo odložili (commit alebo stash) a spustili `git pull`. Kópia, ktorá nebola nainštalovaná cez git (napríklad zip súbor), nezobrazí nič.

Ako kontrola funguje, krok za krokom:

```
stránka ---(po 4 s, potom každých 6 h)---> vývojový server ---> git fetch
   zaostáva?  nie -> nič sa nezobrazí
              áno -> vaše vlastné zmeny alebo commity?  áno -> len to oznámi
                                                       nie -> [Aktualizovať teraz] -> git pull
                                                              -> obnovenie, alebo „spustite restart.bat“
```

## Bezpečnostné pravidlá {#the-safety-rules}

- **Iba posun vpred** (`git pull --ff-only`): aktualizácia nikdy nezlučuje,
  nerebázuje ani nič neprepisuje.
- **Žiadne lokálne zmeny**: kópia s necommitnutými zmenami v sledovaných
  súboroch (`git status --porcelain --untracked-files=no` nie je prázdne) sa
  nikdy nezaktualizuje automaticky - cudziu prácu nesmie prepísať aktualizácia.
  Len sa jej povie, že čaká aktualizácia. Nesledované súbory (dáta, exporty)
  sa za zmeny nepočítajú.
- **Žiadne lokálne commity**: kópia s commitmi, ktoré nadradená vetva nemá
  („rozišla sa“), sa neaktualizuje - posun vpred ju nemôže dotiahnuť a
  zlučovanie patrí pre `git pull` ručne. Stránka aj `start.bat` to hovoria
  rovnakými slovami a `start.bat` spustí verziu, ktorú tam máte.
- **Len zo samotnej stránky**: žiadosť vývojového servera o aktualizáciu musí
  niesť vlastnú hlavičku a, ak prehliadač posiela `Origin`, musí prísť z vlastného
  hostiteľa servera (nižšie).
- Aktualizuje sa len git kópia s nadradenou vetvou; čokoľvek iné (kópia bez
  `.git`, bez nainštalovaného gitu, statický build) sa nechá na pokoji a nič
  nehlási.

## Čo robí start.bat {#what-startbat-does}

`start.bat` (dvojklik; okno je server) robí, v poradí:

1. Nájde Node.js - v `PATH`, inak v `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` alebo `%LOCALAPPDATA%\Programs\nodejs` - a keď
   chýba, ponúkne inštaláciu príkazom `winget install -e --id OpenJS.NodeJS.LTS`
   (opýta sa, Y/N; potom treba okno znova otvoriť, aby Windows načítal nový `PATH`).
2. **Aktualizácie**, keď je nainštalovaný git a priečinok má `.git`:
   - `git fetch --quiet` (bez siete alebo nadradenej vetvy: ticho preskočené);
   - spočíta `git rev-list --count HEAD..@{u}`; nič nezaostáva: nič sa nepovie;
   - lokálne zmeny: „Je dostupná novšia verzia 3DHeat (N zmien), ale táto kópia má lokálne zmeny, takže sa neaktualizuje. Potvrďte ich alebo ich odložte, potom spustite git pull.“ - a spustí verziu, ktorú tam máte;
   - vlastné commity (`git rev-list --count @{u}..HEAD` nie je 0): „Je dostupná novšia verzia 3DHeat (N zmien), ale táto kópia má vlastné commity, ktoré najnovšia verzia nemá, takže sa neaktualizuje. Aktualizujte ju príkazom git pull.“ - a spustí verziu, ktorú tam máte;
   - inak „Je dostupná novšia verzia 3DHeat (N zmien).“ a otázka **Aktualizovať teraz? [Y/N]**. `N`, alebo žiadna odpoveď 60 sekúnd, vypíše „Neaktualizované; spúšťam verziu, ktorú máte.“ a spustí verziu, ktorú tam máte. Pri `Y`: „Aktualizujem...“, oznámi, či sa menia `package.json` alebo `package-lock.json`,
     spustí `git pull --ff-only` (ak by to stále zlyhalo - napríklad sieť:
     „Aktualizácia neprebehla; spúšťam verziu, ktorú máte.“), potom `git submodule update --init`
     (pripnuté nástroje, pozri [Údržba dokumentácie](maintaining.md#the-tools-under-exporters)), potom `npm install`, keď sa balíkové súbory zmenili a existuje `node_modules`, a „Aktualizované.“
3. Odmietne spustiť druhý server: keď na porte **5273** už niečo počúva, povie to a odkáže na `restart.bat` / `stop.bat`.
4. Pri prvom spustení (bez `node_modules`) sa pred stiahnutím závislostí (asi 300 MB do `node_modules\`, nič systémovo) opýta.
5. Spustí vývojový server na `127.0.0.1:5273` (`--strictPort`) a keď je pripravený, otvorí prehliadač.

`restart.bat` zastaví server (podľa portu) a spustí `start.bat` znova, takže sa opýta na to isté. `stop.bat` len zastaví.

## Pre vývojárov {#for-developers}

### Počas behu: trasa aktualizácie {#while-it-runs-the-update-route}

Vývojový server (plugin Vite `heat3d-self-update` v `vite.config.ts`) obsluhuje `/__heat3d/update`. Existuje len na vývojovom serveri - nie v statickom builde ani vo `vite preview`.

**`GET /__heat3d/update`** odpovie, či kópia zaostáva:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "predmet najnovšieho commitu" }
```

- `checkout: false`, keď priečinok nie je git kópia;
- spustí `git fetch --quiet` **najviac každých 30 minút** (požiadavky medzi tým odpovedajú z naposledy stiahnutých dát);
- `behind` / `ahead` z `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` z `git status --porcelain --untracked-files=no`, `latest` predmet najnovšieho commitu nadradenej vetvy;
- bez nadradenej vetvy `upstream: null` a `behind: 0`.

**`POST /__heat3d/update/apply`** uvedie kópiu do poriadku:

1. Odmietne sa so stavom `403 { ok: false, reason: "forbidden" }`, pokiaľ požiadavka nemá hlavičku `X-Heat3d-Update: 1` a ak nesie `Origin`, jeho hostiteľ sa musí rovnať `Host` požiadavky. Formulár z iného webu nemôže poslať vlastnú hlavičku bez CORS preflightu, ktorý tento server nikdy neudelí.
2. Nie je čo robiť (nie je git kópia, nie je nadradená vetva, nezaostáva): `{ ok: true, updated: false }`.
3. Lokálne zmeny: `{ ok: false, reason: "dirty" }`; lokálne commity: `{ ok: false, reason: "diverged" }`.
4. Inak: zapíše, ktoré súbory sa menia (`git diff --name-only HEAD @{u}`), spustí `git pull --ff-only` (limit 2 min), `git submodule update --init` (zlyhanie sa ignoruje), `npm install`, keď sa zmenil `package.json` alebo `package-lock.json` (limit 15 min), a odpovie `{ ok: true, updated: true, restart }`. `restart` vysvetľuje, prečo bežiaci server aktualizáciu nemôže prevziať: `"dependencies"`, keď sa závislosti znova nainštalovali; `"config"`, keď sa zmenil len súbor `vite.config`; `false`, keď nič nevyžaduje reštart.
5. Zlyhávajúci príkaz git alebo npm odpovie `{ ok: false, reason: "<chyba, najviac 300 znakov>" }`.

Odpovede sú JSON s `Cache-Control: no-store`. Server počúva iba na `127.0.0.1`, takže trasa nie je dostupná zo siete.

### Oznámenie na stránke {#the-notice-in-the-page}

`UpdateBanner`, pod názvom hore na bočnom paneli:

- Pýta sa trasy **4 sekundy** po načítaní stránky (nie v prvých sekundách: stránka ešte načítava dáta a štartuje GPU) a potom znova **každých 6 hodín**, kým je stránka otvorená.
- Nezobrazí **nič**, keď takáto trasa nie je (statický build), priečinok nie je git kópia alebo nič nie je novšie - upozornenie pri každom spustení sa ľudia naučia ignorovať.
- Zaostáva bez lokálnych zmien: „K dispozícii je novšia verzia 3DHeat (N zmien, najnovšia: <predmet>).“ s tlačidlami **Aktualizovať teraz** a **Neskôr** (*Neskôr* skryje box, kým sa stránka znova nenačíta).
- Zaostáva s lokálnymi zmenami: rovnaká veta a „Táto kópia má lokálne zmeny, preto sa neaktualizuje automaticky; urobte commit alebo stash a potom spustite git pull.“ - bez tlačidla.
- **Aktualizovať teraz** pošle požiadavku na `/apply` („Aktualizuje sa…“). Potom:
  - „Aktualizované. Stránka sa znova načíta.“ - a o 1,5 s neskôr sa znova načíta (server už podáva nové súbory);
  - keď sa závislosti znova nainštalovali: „Aktualizované. Zmenili sa závislosti: zatvorte okno servera a spustite **restart.bat**, aby sa aktualizácia dokončila.“;
  - keď sa zmenili len nastavenia servera: „Aktualizované. Zmenili sa nastavenia servera: zatvorte okno servera a spustite **restart.bat**, aby sa aktualizácia dokončila.“;
  - nakoniec nie je čo prevziať (`updated: false` - kópiu medzitým uviedol do poriadku napríklad `start.bat`): „Nie je čo aktualizovať: táto kópia je už najnovšia verzia.“ - a bez obnovenia stránky;
  - odmietnuté: veta o lokálnych zmenách, alebo „Táto kópia má vlastné commity, ktoré najnovšia verzia nemá; aktualizujte ju pomocou git pull.“, alebo „Aktualizácia sa nepodarila: <dôvod>“.
