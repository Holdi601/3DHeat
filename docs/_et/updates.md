---
title: "Uuendused"
nav_order: 18
lang: "et"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---


# Uuendused

Vaatur ütleb sulle, kui on olemas uuem versioon, ja uuendab end ainult siis, kui sa ütled jah. Sinu arvutis
ei muudeta midagi ilma sinu vastuseta.

## Vaaturi uuendamine {#update-the-viewer}

1. **Lehel.** Kui on olemas uuem versioon, ilmub kast külgriba ülaosas nime all: "3DHeat'i uuem versioon on saadaval".
   Klõpsa **Uuenda kohe**. Leht laadib end ise uuesti, kui see on valmis. **Hiljem** peidab kasti, kuni laadid lehe uuesti.
2. **Kui seal on öeldud käivitada restart.bat**, sulge serveriaken (must aken, mille `start.bat` avas) ja topeltklõpsa `restart.bat`.
3. **Vaaturi käivitamisel.** `start.bat` kontrollib samuti. Kui uuem versioon on olemas, küsib ta **Uuenda kohe? [Y/N]**.
   Vajuta `Y`, et uuendada. Vajuta `N` või oota 60 sekundit vastamata, et käivitada versioon, mis sul on.

![Uuenduse teade nuppudega Uuenda kohe ja Hiljem](../assets/img/et/updates-notice.webp)

Sinu enda muudatustega koopiat ei uuendata sinu eest kunagi; kast ütleb ainult, et uuendus ootab, ja ütleb, et
salvesta või peida oma muudatused ja käivita `git pull`. Koopia, mis ei ole paigaldatud gitiga (näiteks zip-fail),
ei näita midagi.

Kontrolli toimimine samm-sammult:

```
leht ---(4 s pärast, siis iga 6 h)---> arendusserver ---> git fetch
   maas?  ei   -> midagi ei näidata
          jah  -> sinu enda muudatused või commit'id?  jah -> ütle ainult
                                                       ei  -> [Uuenda kohe] -> git pull
                                                              -> laadi uuesti või "käivita restart.bat"
```

## Ohutusreeglid {#the-safety-rules}

- **Ainult kiire edasi** (`git pull --ff-only`): uuendus ei ühenda,
  ei baseeri ümber ega kirjuta midagi üle.
- **Ei mingeid kohalikke muudatusi**: koopiat, millel on jälgitavate failide
  salvestamata muudatusi (`git status --porcelain --untracked-files=no` pole tühi),
  ei uuendata kunagi automaatselt - kellegi enda töö ei ole uuenduse üle kirjutamiseks.
  Sellele öeldakse ainult, et uuendus ootab. Jälgimata failid (andmed, eksportid)
  muudatusteks ei lähe.
- **Ei mingeid kohalikke commit'e**: koopiat, millel on commit'e, mida ülesvoolu ei ole ("lahknenud"),
  ei uuendata - kiire edasi ei saa seda viia järele, ja ühendamine on käsitsi `git pull` asi. Leht ja
  `start.bat` ütlevad seda samade sõnadega ning `start.bat` käivitab versiooni, mis seal on.
- **Ainult lehelt endalt**: arendusserveri uuendamispäring peab kandma kohandatud päist ja, kui brauser saadab `Origin`-i,
  tulema serveri enda hostilt (allpool).
- Uuendatakse ainult gitikoopiat, millel on ülesvoolu haru; kõik muu (koopia ilma `.git`-ita, git paigaldamata, staatiline
  ehitis) jäetakse rahule ega ütle midagi.

## Mida start.bat teeb {#what-startbat-does}

`start.bat` (topeltklõpsa; aken on server) teeb järjekorras:

1. Leiab Node.js-i - `PATH`-ist, või kaustast `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` või `%LOCALAPPDATA%\Programs\nodejs` - ja pakub, kui see puudub, paigaldada selle
   käsuga `winget install -e --id OpenJS.NodeJS.LTS` (küsitakse, Y/N; pärast seda tuleb aken uuesti avada, et Windows
   võtaks uue `PATH`-i).
2. **Uuendused**, kui git on paigaldatud ja kaustas on `.git`:
   - `git fetch --quiet` (võrku ei ole või ülesvoolu ei ole: vaikselt vahele jäetud);
   - loeb `git rev-list --count HEAD..@{u}`; kui maas ei ole midagi: midagi ei öelda;
   - kohalikud muudatused: "3DHeat'i uuem versioon on saadaval (N muudatust), aga selles koopias on kohalikke muudatusi, seega
     seda ei uuendata. Salvesta või peida need, seejärel käivita git pull." - ja käivitab versiooni, mis seal on;
   - enda commit'id (`git rev-list --count @{u}..HEAD` ei ole 0): "3DHeat'i uuem versioon on saadaval (N muudatust), aga selles
     koopias on enda commit'e, mida uusimas versioonis ei ole, seega seda ei uuendata. Uuenda seda käsuga git pull." - ja käivitab
     versiooni, mis seal on;
   - muidu "3DHeat'i uuem versioon on saadaval (N muudatust)." ja küsimus **Uuenda kohe? [Y/N]**. `N`, või vastuseta 60 sekundit,
     trükib "Ei uuendatud; käivitan versiooni, mis sul on." ja käivitab versiooni, mis seal on. Vastusega `Y`: "Uuendan...",
     teatab, kas `package.json` või `package-lock.json` muutuvad, käivitab `git pull --ff-only` (kui see ikka ebaõnnestub - näiteks
     võrk: "Uuendus ei õnnestunud; käivitan versiooni, mis sul on."), siis `git submodule update --init`
     (kinnitatud tööriistad, vt [Dokumentatsiooni hooldamine](maintaining.md#the-tools-under-exporters)), siis `npm install`, kui
     paketifailid muutusid ja `node_modules` on olemas, ja "Uuendatud."
3. Keeldub teise serveri käivitamisest: kui port **5273** on juba hõivatud, ütleb ta seda ja suunab `restart.bat` / `stop.bat` juurde.
4. Esimesel käivitamisel (`node_modules` puudub) küsib enne sõltuvuste allalaadimist (umbes 300 MB kausta `node_modules\`, mitte süsteemi).
5. Käivitab arendusserveri aadressil `127.0.0.1:5273` (`--strictPort`) ja avab brauseri, kui see on valmis.

`restart.bat` peatab serveri (pordi järgi) ja käivitab `start.bat` uuesti, nii et küsib sama küsimuse. `stop.bat` ainult peatab.

## Arendajatele {#for-developers}

### Töö ajal: uuendusmarsruut {#while-it-runs-the-update-route}

Arendusserver (Vite plugin `heat3d-self-update` failis `vite.config.ts`) teenindab
`/__heat3d/update`. See on olemas ainult arendusserveris - mitte staatilises ehitises
ega `vite preview`-s.

**`GET /__heat3d/update`** vastab, kas koopia on maas:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, kui kaust ei ole gitikoopia;
- käivitab `git fetch --quiet` **kõige rohkem kord 30 minuti jooksul** (vahepealsed päringud vastavad viimati toodu põhjal);
- `behind` / `ahead` tulevad `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`-ist,
  `dirty` tuleb `git status --porcelain --untracked-files=no`-st, `latest` on ülesvoolu uusima commit'i pealkiri;
- ülesvoolu harua ei ole: `upstream: null` ja `behind: 0`.

**`POST /__heat3d/update/apply`** viib koopia kaasajaks:

1. Keeldutakse koodiga `403 { ok: false, reason: "forbidden" }`, kui päringul ei ole päist
   `X-Heat3d-Update: 1` või kui sellel on `Origin` ja selle origin'i host ei ole päringu `Host`. Saidiülene vorm ei saa saata
   kohandatud päist ilma CORS-eelkontrollita, mida see server ei anna kunagi.
2. Pole midagi teha (ei ole koopia, ülesvoolu pole, maas ei ole): `{ ok: true, updated: false }`.
3. Kohalikud muudatused: `{ ok: false, reason: "dirty" }`; kohalikud commit'id: `{ ok: false, reason: "diverged" }`.
4. Muidu: märgib üles muutuvad failid (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (2 min timeout),
   `git submodule update --init` (viga ignoreeritakse), `npm install`, kui `package.json` või
   `package-lock.json` muutusid (15 min timeout), ja vastab
   `{ ok: true, updated: true, restart }` - `restart` ütleb, miks töötav server ei saa uuendust kätte: `"dependencies"`, kui need
   paigaldati uuesti, `"config"`, kui muutus ainult `vite.config` fail, `false`, kui taaskäivitust ei vaja midagi.
5. Ebaõnnestunud git- või npm-käsk vastab `{ ok: false, reason: "<viga, kuni 300 tähemärki>" }`.

Vastused on JSON-id päisega `Cache-Control: no-store`. Server kuulab ainult aadressil `127.0.0.1`, nii et marsruut ei ole
võrgust kättesaadav.

### Teade lehel {#the-notice-in-the-page}

`UpdateBanner`, külgriba ülaosas nime all:

- See küsib marsruudilt **4 sekundi** pärast lehe laadimist (mitte esimestel sekunditel: lehel on andmestik laadida ja GPU käivitada)
  ja uuesti **iga 6 tunni** järel, kui leht jääb avatuks.
- Ei näita **midagi**, kui sellist marsruuti ei ole (staatiline ehitis), kaust ei ole gitikoopia või miski ei ole uuem - teade iga
  käivitamisel on see, millega inimesed õpivad ignoreerima.
- Maas, kohalike muudatusteta: "3DHeat'i uuem versioon on saadaval (N muudatust, uusim: <pealkiri>)." koos nuppudega **Uuenda kohe**
  ja **Hiljem** (*Hiljem* peidab selle, kuni leht uuesti laaditakse).
- Maas, kohalike muudatustega: sama lause ja "Selles koopias on kohalikke muudatusi, seega seda ei uuendata automaatselt; salvesta või
  peida need, seejärel käivita git pull." - ilma nuputa.
- **Uuenda kohe** postitab `/apply`-sse ("Uuendan..."). Seejärel:
  - "Uuendatud. Leht laaditakse uuesti." - ja laadib 1,5 s pärast uuesti (server serveerib juba uusi faile);
  - kui sõltuvused paigaldati uuesti: "Uuendatud. Selle sõltuvused muutusid: sulge serveriaken ja käivita **restart.bat**, et lõpetada.";
  - kui muutusid ainult serveri seaded: "Uuendatud. Selle serveri seaded muutusid: sulge serveriaken ja käivita **restart.bat**, et lõpetada.";
  - lõpuks pole midagi tuua (`updated: false` - koopia on vahepeal kaasajastatud, näiteks `start.bat` poolt): "Pole midagi uuendada: see koopia on juba uusim versioon." - ja lehte ei laadita uuesti;
  - keeldutud: *dirty* lause, või "Selles koopias on enda commit'e, mida uusimas versioonis ei ole; uuenda seda käsuga git pull.", või "Uuendus ei õnnestunud: <põhjus>".
