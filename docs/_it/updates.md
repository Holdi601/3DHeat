---
title: "Aggiornamenti"
nav_order: 18
lang: "it"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# Aggiornamenti

Il visualizzatore ti dice quando esiste una versione più recente, e si aggiorna da solo solo se dici di sì. Non viene cambiato nulla sul tuo computer senza la tua risposta.

## Aggiornare il visualizzatore {#update-the-viewer}

1. **Nella pagina.** Quando esiste una versione più recente, sotto il nome in cima alla barra laterale compare un riquadro: "È disponibile una versione più recente di 3DHeat". Clicca **Aggiorna ora**. La pagina si ricarica da sola quando ha finito. **Più tardi** nasconde il riquadro fino a quando ricarichi la pagina.
2. **Se dice di eseguire restart.bat**, chiudi la finestra del server (la finestra nera che ha aperto `start.bat`) e fai doppio clic su `restart.bat`.
3. **Quando avvii il visualizzatore.** Anche `start.bat` controlla. Se esiste una versione più recente chiede **Aggiornare ora? [Y/N]**. Premi `Y` per aggiornare. Premi `N`, oppure aspetta 60 secondi senza rispondere, per avviare la versione che hai.

![Il avviso di aggiornamento con Aggiorna ora e Più tardi](../assets/img/it/updates-notice.webp)

Una copia con modifiche tue non viene mai aggiornata al posto tuo; il riquadro dice solo che un aggiornamento è in attesa, e dice di fare commit o stash delle modifiche ed eseguire `git pull`. Una copia non installata con git (un file zip, per esempio) non mostra nulla.

Come funziona il controllo, passo dopo passo:

```
page ---(dopo 4 s, poi ogni 6 h)---> dev server ---> git fetch
   indietro?  no  -> non viene mostrato nulla
              sì  -> tue modifiche o commit?  sì -> ti avvisa soltanto
                                              no -> [Aggiorna ora] -> git pull
                                                     -> ricarica, oppure "esegui restart.bat"
```

## Le regole di sicurezza {#the-safety-rules}

- **Solo avanti veloce** (`git pull --ff-only`): un aggiornamento non unisce,
  non fa rebase e non riscrive nulla.
- **Nessuna modifica locale**: una copia con modifiche non committate a file tracciati
  (`git status --porcelain --untracked-files=no` non vuoto) non viene mai aggiornata
  automaticamente - il lavoro di qualcuno non è qualcosa che un aggiornamento può
  sovrascrivere. Viene solo avvisata che un aggiornamento è in attesa. I file non
  tracciati (dati, esportazioni) non contano come modifiche.
- **Nessun commit locale**: una copia con commit che il remoto non ha ("divergente") non
  viene aggiornata - un avanti veloce non può portarla al passo, e unire spetta a
  `git pull` fatto a mano. La pagina e `start.bat` lo dicono con le stesse parole, e
  `start.bat` avvia la versione che c'è.
- **Solo dalla pagina stessa**: la richiesta di aggiornamento del dev server deve portare
  un'intestazione personalizzata e, quando il browser invia un `Origin`, venire dall'host
  stesso del server (sotto).
- Viene aggiornato solo un checkout git con un ramo remoto; tutto il resto (una copia senza
  `.git`, senza git installato, una build statica) viene lasciato stare e non dice nulla.

## Cosa fa start.bat {#what-startbat-does}

`start.bat` (fai doppio clic; la finestra è il server) fa, in ordine:

1. Trova Node.js - nel `PATH`, altrimenti in `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` o `%LOCALAPPDATA%\Programs\nodejs` - e propone di
   installarlo con `winget install -e --id OpenJS.NodeJS.LTS` quando manca (chiesto, Y/N;
   dopo bisogna riaprire la finestra perché Windows prenda il nuovo `PATH`).
2. **Aggiornamenti**, quando git è installato e la cartella ha `.git`:
   - `git fetch --quiet` (senza rete o senza remoto: saltato in silenzio);
   - conta `git rev-list --count HEAD..@{u}`; niente indietro: non dice nulla;
   - modifiche locali: "A newer version of 3DHeat is available (N changes), but
     this copy has local changes, so it is not updated. Commit or stash them,
     then run git pull." - e avvia la versione che c'è;
   - commit propri (`git rev-list --count @{u}..HEAD` diverso da 0): "A newer
     version of 3DHeat is available (N changes), but this copy has commits of
     its own that the newest version does not, so it is not updated. Update it
     with git pull." - e avvia la versione che c'è;
   - altrimenti "A newer version of 3DHeat is available (N changes)." e la domanda **Update now? [Y/N]**. `N`, oppure nessuna risposta per 60 secondi, stampa "Not updated; starting the version you have." e avvia la versione che c'è. Con `Y`: "Updating...", annota se cambiano `package.json` o `package-lock.json`,
     esegue `git pull --ff-only` (se anche questo fallisce - per la rete, per dire:
     "The update did not go through; starting the version you have."), poi `git submodule update --init`
     (gli strumenti fissati, vedi [Mantenere la documentazione](maintaining.md#the-tools-under-exporters)), poi `npm install` quando i file del pacchetto sono cambiati e
     esiste `node_modules`, e "Updated.".
3. Rifiuta di avviare un secondo server: quando qualcosa è già in ascolto sulla porta
   **5273** lo dice e indica `restart.bat` / `stop.bat`.
4. Alla prima esecuzione (senza `node_modules`), chiede prima di scaricare le dipendenze
   (circa 300 MB dentro `node_modules\`, niente a livello di sistema).
5. Avvia il dev server su `127.0.0.1:5273` (`--strictPort`) e apre il browser quando è pronto.

`restart.bat` ferma il server (per porta) ed esegue di nuovo `start.bat`, quindi fa la stessa
domanda. `stop.bat` si limita a fermarlo.


## Per gli sviluppatori {#for-developers}

### Mentre gira: la rotta di aggiornamento {#while-it-runs-the-update-route}

Il dev server (plugin Vite `heat3d-self-update` in `vite.config.ts`) serve
`/__heat3d/update`. Esiste solo sul dev server - non in una build statica e non in
`vite preview`.

**`GET /__heat3d/update`** risponde se il checkout è indietro:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` quando la cartella non è un checkout git;
- esegue `git fetch --quiet` **al massimo ogni 30 minuti** (le richieste nel frattempo
  rispondono con quello dell'ultimo fetch);
- `behind` / `ahead` da `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` da `git status --porcelain --untracked-files=no`, `latest` l'oggetto
  dell'ultimo commit del remoto;
- senza un ramo remoto, `upstream: null` e `behind: 0`.

**`POST /__heat3d/update/apply`** porta il checkout al passo:

1. Rifiutata con `403 { ok: false, reason: "forbidden" }` a meno che la richiesta abbia
   l'intestazione `X-Heat3d-Update: 1` e, quando porta un `Origin`, l'host di quell'origine
   sia il `Host` della richiesta. Un modulo cross-site non può inviare un'intestazione
   personalizzata senza una preflight CORS, che questo server non concede mai.
2. Niente da fare (non un checkout, nessun remoto, non indietro):
   `{ ok: true, updated: false }`.
3. Modifiche locali: `{ ok: false, reason: "dirty" }`; commit locali: `{ ok: false, reason: "diverged" }`.
4. Altrimenti: annota i file che cambiano (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (timeout di 2 min), `git submodule update --init`
   (un errore viene ignorato), `npm install` quando `package.json` o
   `package-lock.json` sono cambiati (timeout di 15 min), e risponde
   `{ ok: true, updated: true, restart }` - `restart` dice perché il server in
   esecuzione non può prendere l'aggiornamento: `"dependencies"` quando sono state
   reinstallate, `"config"` quando è cambiato solo un file `vite.config`, `false`
   quando non serve riavviare nulla.
5. Un comando git o npm che fallisce risponde `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Le risposte sono JSON con `Cache-Control: no-store`. Il server ascolta solo su
`127.0.0.1`, quindi la rotta non è raggiungibile dalla rete.

### L'avviso nella pagina {#the-notice-in-the-page}

`UpdateBanner`, sotto il nome in cima alla barra laterale:

- Chiede alla rotta **4 secondi** dopo il caricamento della pagina (non nei primi secondi:
  la pagina ha un dataset da caricare e una GPU da avviare) e di nuovo **ogni 6 ore** finché
  la pagina resta aperta.
- Non mostra **nulla** quando non esiste una tale rotta (una build statica), la cartella non
  è un checkout, o niente è più recente - un avviso a ogni avvio è uno che la gente impara a ignorare.
- Indietro, senza modifiche locali: "È disponibile una versione più recente di 3DHeat
  (N modifiche, la più recente: <oggetto>)." con **Aggiorna ora** e **Più tardi**
  (*Più tardi* lo nasconde finché la pagina non viene ricaricata).
- Indietro, con modifiche locali: la stessa frase e "Questa copia ha modifiche locali,
  quindi non viene aggiornata automaticamente; fai commit o stash, poi esegui
  git pull." - nessun pulsante.
- **Aggiorna ora** invia una richiesta a `/apply` ("Aggiornamento in corso..."). Poi:
  - "Aggiornato. La pagina si ricarica." - e la pagina si ricarica 1,5 s dopo (il server
    serve già i nuovi file);
  - quando le dipendenze sono cambiate: "Aggiornato. Le sue dipendenze sono cambiate:
    chiudi la finestra del server ed esegui **restart.bat** per finire.";
  - quando sono cambiate solo le impostazioni del server: "Aggiornato. Le sue impostazioni
    del server sono cambiate: chiudi la finestra del server ed esegui **restart.bat** per finire.";
  - alla fine niente da portare dentro (`updated: false` - la copia è stata portata al passo
    nel frattempo, per esempio da `start.bat`): "Nulla da aggiornare: questa copia è già
    la versione più recente." - e nessun ricaricamento;
  - rifiutato: la frase *dirty*, oppure "Questa copia ha commit propri che la versione più
    recente non ha; aggiornala con git pull.", oppure "L'aggiornamento non è andato a buon
    fine: <reason>".
